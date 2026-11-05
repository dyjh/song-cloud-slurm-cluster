/* 平台适配：凭据仅保存在当前 iframe 内存，不进入请求 URL、日志或共享 sessionStorage。 */
(() => {
  window.hpcXpraBridge = true;
  const values = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname);
  window.location.getParameter = key => values.has(key) ? values.get(key) : undefined;
})();
