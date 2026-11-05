/*
 * This file is part of Xpra.
 * Copyright (C) 2021 Tijs van der Zwaan <tijzwa@vpo.nl>
 * Licensed under MPL 2.0, see:
 * http://www.mozilla.org/MPL/2.0/
 *
 */

/*
 * Receives native video packets and decodes them via VideoDecoder.
 * https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder
 * VideoDecoder is only working in Chrome 94+ and Android
 *
 * Example taken from: https://github.com/w3c/webcodecs/blob/main/explainer.md
 *
 */

const XpraVideoDecoderLoader = {
  hasNativeDecoder() {
    return typeof VideoDecoder !== "undefined";
  },
};

class XpraVideoDecoder {
  static version = "20261016-vp8-2";

  constructor() {
    this.initialized = false;
    this.had_first_key = false;
    this.draining = false;

    this.decoder_queue = [];

    this.codec = null;
    this.vp9_params = null;

    this.frame_threshold = 250;
  }

  prepareVP9params(csc) {
    // Check if we have the right VP9 params before init.
    // This is needed because we can only set the params when the video decoder is created.
    // We close the decoder when the coding changes.
    if (csc === "YUV444P" && this.vp9_params !== ".01.10.08") {
      this.vp9_params = ".01.10.08";
      this._close();
    } else if (csc === "YUV444P10" && this.vp9_params !== ".03.10.10") {
      this.vp9_params = ".03.10.10";
      this._close();
    } else if (this.vp9_params !== ".00.20.08.01.02.02") {
      // chroma shift for YUV420P, both X and Y are downscaled by 2^1
      this.vp9_params = ".00.20.08.01.02.02";
      this._close();
    }
  }

  init(coding) {
    this.draining = false;
    this.had_first_key = false;
    this.coding = coding;

    this.codec = this.resolveCodec(coding);
    this.videoDecoder = new VideoDecoder({
      output: this._on_decoded_frame.bind(this),
      error: this._on_decoder_error.bind(this),
    });

    // ToDo: hardwareAcceleration can be "no-preference" / "prefer-hardware" / "prefer-software"
    // Figure out when "prefer-hardware" is the right choise and when not (ie: no GPU, remote session like RDP?)
    try {
      this.videoDecoder.configure({
        codec: this.codec,
        hardwareAcceleration: "no-preference",
        optimizeForLatency: true,
        colorSpace: new VideoColorSpace({
          fullRange: true
        })
      });
    } catch (error) {
      this._close();
      throw error;
    }
    this.last_timestamp = 0;
    this.initialized = true;
  }

  resolveCodec(coding) {
    if (coding === "h264") return "avc1.42C01E";
    if (coding === "vp8") return "vp8";
    if (coding === "vp9") return `vp09${this.vp9_params}`;
    throw `No codec defined for coding ${coding}`;
  }

  _on_decoded_frame(videoFrame) {
    if (this.decoder_queue.length === 0) {
      videoFrame.close();
      return;
    }

    // Find the frame
    const frame_timestamp = videoFrame.timestamp;
    let current_frame = this.decoder_queue.filter(
      (q) => q.p[10]["frame"] === frame_timestamp
    );
    if (current_frame.length === 1) {
      // We found our frame!
      this.decoder_queue = this.decoder_queue.filter(
        (q) => q.p[10]["frame"] !== frame_timestamp
      );
      current_frame = current_frame[0];
    } else {
      // We decoded a frame the is no longer queued??
      // TODO: handle error??
      videoFrame.close();
      return;
    }

    if (frame_timestamp === 0) {
      this.last_timestamp = 0;
    }

    if (
      this.decoder_queue.length > this.frame_threshold ||
      this.last_timestamp > frame_timestamp
    ) {
      // Skip if the decoders queue is growing too big or this frames timestamp is smaller then the last one painted.
      videoFrame.close();

      const packet = current_frame.p;
      packet[6] = "throttle";
      packet[7] = null;
      current_frame.resolve(packet);
      return;
    }

    this.last_timestamp = frame_timestamp;
    const packet = current_frame.p;

    // Latest possible check for draining
    if (this.draining) {
      videoFrame.close();
      return;
    }

    packet[6] = `frame:${packet[6]}`;
    packet[7] = videoFrame;
    current_frame.resolve(packet);
  }

  _on_decoder_error(error) {
    this._close(new Error(`Error decoding frame: ${error}`));
  }

  queue_frame(packet) {
    return new Promise((resolve, reject) => {
      const options = packet[10] || {};
      const data = packet[7];
      if (!this.initialized || this.draining || this.videoDecoder.state === "closed") {
        reject(new Error("video decoder is closed"));
        return;
      }

      let key = options["type"] === "IDR";
      if (this.coding === "vp8") {
        // Xpra's VP8 encoder does not send an IDR option. The frame tag's
        // least significant bit is 0 for a key frame and 1 for an inter frame.
        const bytes = ArrayBuffer.isView(data)
          ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
          : new Uint8Array(data);
        if (bytes.length < 3) {
          this._close();
          reject(new Error(`invalid VP8 frame tag in packet ${packet[8]}`));
          return;
        }
        key = (bytes[0] & 1) === 0;
      }
      if (!this.had_first_key && !key) {
        reject(new Error(`first ${this.coding} frame must be a key frame (packet ${packet[8]})`));
        return;
      }

      this.decoder_queue.push({p: packet, resolve, reject});
      try {
        const chunk = new EncodedVideoChunk({
          type: key ? "key" : "delta",
          data,
          timestamp: options["frame"],
        });
        this.videoDecoder.decode(chunk);
        this.had_first_key = true;
        if (key) {
          this.last_timestamp = 0;
        }
      } catch (error) {
        this._close(new Error(`failed to decode chunk: ${error}`));
      }
    });
  }

  _close(error = new Error("video decoder is closed")) {
    this.initialized = false;
    this.had_first_key = false;
    this.draining = true;
    if (this.videoDecoder && this.videoDecoder.state !== "closed") {
      this.videoDecoder.close();
    }
    // Settle pending frames on error, EOS and window removal. No polling loop
    // or decoded VideoFrame remains owned by a closed decoder.
    for (const pending of this.decoder_queue) {
      pending.reject(error);
    }
    this.decoder_queue = [];
  }
}
