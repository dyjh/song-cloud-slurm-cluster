# Xpra HTML5

来源：https://github.com/Xpra-org/xpra-html5

版本：v21，提交 `66af6409e75053424af73e52542acc51b0055cac`。

来源归档 SHA256：`34cc36f8531f83944f67e024cc1c45c983995d9c5052e4ebf635aa0043ab6364`。

保留上游 LICENSE 及各文件版权声明。平台修改：index.html 加载 hpc-bridge.js、参数日志隐藏 password/path、WebSocket 路径允许平台票据查询串；hpc-bridge.js 从 fragment 读取单窗口参数，不落盘。断线时通知父窗口，不跳转上游连接表单或向 sessionStorage 写入凭据；重新连接由平台获取新票据。升级时需重做浏览器协议兼容验证。

连接进度显示及日志隐藏票据值。Client.js 修正主线程协议断线时无 worker 却调用 terminate 的问题（仅 worker 协议提供该方法）。

2026-10-16 平台修复：VideoDecoder.js 按 VP8 帧头区分 key/delta（保留 H.264 IDR 判断），改用解码回调完成等待，失败/关闭释放解码器并拒绝未完成帧；OffscreenDecodeWorker.js 统一报告单次错误并继续队列，处理编码切换、EOS 和窗口关闭；Client.js 解码失败回执改用真实宽高字段。测试见 `front-web/tests/xpra-video-decoder.test.ts` 与 `xpra-video-decoder.spec.ts`，浏览器配置默认使用 Chrome。上游升级时需核对这些差异，不能直接覆盖。

客户端绘制修订号：`20261016-paint-4`。GUI iframe 入口、index.html 中 Client，以及 Client 创建的 OffscreenDecodeWorker 使用该版本查询参数。未修改的 Window 与 client.css 保持 `20261016-geometry-3`。VideoDecoder 未再次修改，保留 `20261016-vp8-2` 的源码标识及加载参数。后续修改资源时同步更新对应引用及源码版本标识，完整构建发布 front-web。

Client 启动输出 `[HPC Xpra] Client version=...`；Worker 能力检查响应携带自身源码版本和实际导入的 `XpraVideoDecoder.version`，Client 输出两者。此次发布预期 Client/Worker 为 `20261016-paint-4`，VideoDecoder 为 `20261016-vp8-2`。缺少标识显示 `unversioned`；不输出票据、密码或连接地址。版本日志只证明加载身份，不能代替运行验收。

2026-10-16 窗口与绘制修复：Worker 将完整解码图像绘制到 damage 矩形，避免把目标尺寸误作缩放帧的源裁切尺寸；相同画布尺寸不重复赋值，避免移动或重复配置清空画面。普通可调整窗口按可视区缩小并移回边界，保留应用最小尺寸；固定尺寸窗口只移动，OR 弹窗、托盘及桌面/镜像窗口保持原协议。装饰尺寸包括标题栏边框，CSS 使用 border-box。隐藏 iframe 不发送零分辨率，恢复时按实际尺寸更新。连接提示复用工具栏空间，不因提示消失额外改变 iframe 高度。回归见 `xpra-geometry.test.ts`、`xpra-video-decoder.spec.ts`；尚需部署后在实际 MATLAB 会话验证，不能据此宣称节点 SIGSEGV 已解决。

2026-10-16 局部更新闪烁修复：OffscreenDecodeWorker 在后台画布按顺序合成 damage，仅在 flush=0（缺省为 0）时一次复制到显示画布；移除脱离解码队列的逐包 requestAnimationFrame。paint=false 仍执行视频解码维护参考帧，但不绘制该帧；完成或跳过绘制均释放 VideoFrame/ImageBitmap。回执在合成成功之后发送，非末尾区域仍正常确认，绘制失败只发送失败回执。Chrome 像素回归在修改前同时复现半成品提前显示和只解码帧覆盖已有画面，修改后通过，并验证后续 VP8 delta 帧可继续显示。这是本地协议缺陷复现，尚未取得 146160 的实际绘制包，线上闪烁仍待发布验收。无节点、后端或 SQL 改动。
