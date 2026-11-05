/*
 * This file is part of Xpra.
 * Copyright (C) 2021 Tijs van der Zwaan <tijzwa@vpo.nl>
 * Copyright (c) 2022 Antoine Martin <antoine@xpra.org>
 * Licensed under MPL 2.0, see:
 * http://www.mozilla.org/MPL/2.0/
 *
 */

/*
 * Worker for offscreen decoding.
 */

importScripts("./lib/lz4.js");
importScripts("./VideoDecoder.js?v=20261016-vp8-2");
importScripts("./ImageDecoder.js");
importScripts("./RgbHelpers.js");
importScripts("./Constants.js");

// WindowDecoder for each window we have control over:
const window_decoders = new Map();

// You can change this delay to test decode worker initialization timeouts:
const ACK_DELAY = 0;
const HPC_WORKER_VERSION = "20261016-paint-4";

const image_coding = [
  "rgb",
  "rgb32",
  "rgb24",
  "jpeg",
  "png",
  "png/P",
  "png/L",
  "webp",
  "avif",
];
const video_coding = [];
if (XpraVideoDecoderLoader.hasNativeDecoder()) {
  // We can support native H264 & VP8 decoding
  video_coding.push("h264", "vp8");
} else {
  console.warn("Offscreen decoding is available for images only");
  console.warn("Please consider using Google Chrome 94+ in a secure (SSL or localhost) context for h264 offscreen decoding support.");
}

const all_encodings = new Set([
  "void",
  ...image_coding,
  ...video_coding,
]);

function send_decode_error(packet, error) {
  packet[7] = null;
  self.postMessage({
    error: `${error}`,
    packet
  });
}


class WindowDecoder {
  constructor(wid, canvas, debug) {
    this.wid = wid;
    this.canvas = canvas;
    this.visible_context = canvas.getContext("2d");
    // Compose damage regions without exposing an unfinished flush batch.
    this.backing_canvas = new OffscreenCanvas(canvas.width, canvas.height);
    this.context = this.backing_canvas.getContext("2d");
    this.debug = debug;

    this.image_decoder = new XpraImageDecoder();
    this.video_decoder = new XpraVideoDecoder();

    this.decode_queue = [];
    this.decode_queue_draining = false;
  }

  decode_error(packet, error) {
    const coding = packet[6];
    const packet_sequence = packet[8];
    const message = `failed to decode '${coding}' draw packet sequence ${packet_sequence}: ${error}`;
    console.error(message);
    packet[7] = null;
    send_decode_error(packet, message);
  }

  queue_draw_packet(packet) {
    if (this.closed) {
      return;
    }
    this.decode_queue.push(packet);
    if (!this.decode_queue_draining) {
      this.process_decode_queue();
    }
  }

  async process_decode_queue() {
    this.decode_queue_draining = true;
    try {
      while (!this.closed && this.decode_queue.length > 0) {
        const packet = this.decode_queue.shift();
        try {
          await this.process_packet(packet);
        } catch (error) {
          this.decode_error(packet, error);
        }
      }
    } finally {
      this.decode_queue_draining = false;
    }
  }

  async process_packet(packet) {
    const coding = packet[6];
    const start = performance.now();
    if (coding === "eos" && this.video_decoder) {
      this.video_decoder._close();
      return;
    } else if (coding === "scroll" || coding === "void") {
      // Nothing to do
    } else if (image_coding.includes(coding)) {
      await this.image_decoder.convertToBitmap(packet);
    } else if (video_coding.includes(coding)) {
      if (this.video_decoder.initialized && this.video_decoder.coding !== coding) {
        this.video_decoder._close();
      }
      if (!this.video_decoder.initialized) {
        this.video_decoder.init(coding);
      }
      packet = await this.video_decoder.queue_frame(packet);
    } else {
      throw new Error(`unsupported encoding: '${coding}'`);
    }

    // Hold throttle packages for 500 ms to prevent flooding of the VideoDecoder
    if (packet[6] === "throttle") {
      await new Promise((r) => setTimeout(r, 500));
    }

    const options = packet[10] || {};
    if (packet[6] !== "throttle") {
      this.do_paint_packet(packet[1], packet[6], packet[7], packet[2], packet[3],
        packet[4], packet[5], options.paint !== false);
      if (this.closed) {
        return;
      }
      if ((options.flush || 0) === 0) {
        this.present();
      }
    }

    // Acknowledge only after composition succeeds. Non-final regions must also
    // be acknowledged so the server can continue sending the rest of the batch.
    const decode_time = Math.round(1000 * (performance.now() - start));
    options["decode_time"] = Math.max(0, decode_time);
    // Copy without data
    const clonepacket = packet.map((x, i) => {
      if (i !== 7) {
        return x;
      }
    });
    clonepacket[6] = "offscreen-painted";
    clonepacket[10] = options;

    // Tell the server we are done with this packet
    self.postMessage({
      draw: clonepacket,
      start
    });
  }

  present() {
    // Copy also replaces transparent pixels left by a cleared damage region.
    this.visible_context.globalCompositeOperation = "copy";
    this.visible_context.drawImage(this.backing_canvas, 0, 0);
  }

  do_paint_packet(wid, coding, image, x, y, width, height, paint = true) {
    try {
      // Decode-only video frames still update decoder references, but must not
      // replace a newer image refresh already shown by the server.
      if (!this.canvas || !paint) {
        return;
      }
      let context = this.context;
      if (coding.startsWith("bitmap")) {
        // Bitmap paint
        context.imageSmoothingEnabled = false;
        context.clearRect(x, y, width, height);
        // Encoded images can be smaller than the destination damage region.
        // Draw the complete decoded image, not a source rectangle in desktop pixels.
        context.drawImage(image, x, y, width, height);
        this.paint_box(coding, context, x, y, width, height);
      } else if (coding === "scroll") {
        let canvas = this.backing_canvas;
        context.imageSmoothingEnabled = false;
        for (let index = 0, stop = image.length; index < stop; ++index) {
          const scroll_data = image[index];
          const sx = scroll_data[0];
          const sy = scroll_data[1];
          const sw = scroll_data[2];
          const sh = scroll_data[3];
          const xdelta = scroll_data[4];
          const ydelta = scroll_data[5];
          context.drawImage(canvas,
              sx, sy, sw, sh,
              sx + xdelta, sy + ydelta, sw, sh,
          );
          this.paint_box(coding, context, sx, sy, sw, sh);
        }
      } else if (coding.startsWith("frame")) {
        context.drawImage(image, x, y, width, height);
        this.paint_box(coding, context, x, y, width, height);
      }
    } finally {
      if (coding.startsWith("frame") || coding.startsWith("bitmap")) {
        image.close();
      }
    }
  }

  paint_box(coding, context, px, py, pw, ph) {
    if (!this.debug) {
      return;
    }
    const source_encoding = coding.split(":")[1] || ""; //ie: "rgb24"
    const box_color = DEFAULT_BOX_COLORS[source_encoding];
    if (box_color) {
      context.strokeStyle = box_color;
      context.lineWidth = 2;
      context.strokeRect(px, py, pw, ph);
    }
  }

  update_geometry(w, h) {
    // Assigning even an unchanged canvas dimension clears all painted pixels.
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    if (this.backing_canvas.width !== w) this.backing_canvas.width = w;
    if (this.backing_canvas.height !== h) this.backing_canvas.height = h;
  }

  redraw() {
    console.info("REDRAW requested");
  }

  eos() {
    // Add eos packet to queue to prevent closing the decoder before all packets are proceeded
    const packet = [];
    packet[6] = "eos";
    this.queue_draw_packet(packet);
  }

  close() {
    this.closed = true;
    this.video_decoder._close();
    this.canvas = null;
    this.decode_queue = [];
  }
}

onmessage = function(e) {
  const data = e.data;
  let wd = null;
  switch (data.cmd) {
    case "check": {
      // Check if we support the given encodings.
      const encodings = [...data.encodings];
      const common = encodings.filter((value) => all_encodings.has(value));
      function ack() {
        self.postMessage({
          result: true,
          version: HPC_WORKER_VERSION,
          decoderVersion: XpraVideoDecoder.version,
          formats: common
        });
      }
      setTimeout(ack, ACK_DELAY);
      break;
    }
    case "eos":
      wd = window_decoders.get(data.wid);
      if (wd) {
        wd.eos();
      }
      break;
    case "remove":
      wd = window_decoders.get(data.wid);
      if (wd) {
        wd.close();
        window_decoders.delete(data.wid);
      }
      break;
    case "decode": {
      const packet = data.packet;
      const wid = packet[1];
      wd = window_decoders.get(wid);
      if (wd) {
        wd.queue_draw_packet(packet);
      } else {
        send_decode_error(packet,
          `no window decoder found for wid ${wid}, only:${[...window_decoders.keys(),].join(",")}`
        );
      }
      break;
    }
    case "redraw":
      wd = window_decoders.get(data.wid);
      if (wd) {
        wd.redraw();
      }
      break;
    case "canvas":
      console.log("canvas transfer for window", data.wid, ":", data.canvas, data.debug);
      if (data.canvas) {
        window_decoders.set(
          data.wid,
          new WindowDecoder(data.wid, data.canvas, data.debug)
        );
      }
      break;
    case "canvas-geo":
      wd = window_decoders.get(data.wid);
      if (wd) {
        wd.update_geometry(data.w, data.h);
      }
      break;
    case "close":
      for (const decoder of window_decoders.values()) {
        decoder.close();
      }
      window_decoders.clear();
      break;
    default:
      console.error(`Offscreen decode worker got unknown message: ${data.cmd}`);
  }
};
