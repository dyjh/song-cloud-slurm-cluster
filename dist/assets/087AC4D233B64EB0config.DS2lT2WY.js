/*! 
 Build based on gin-vue-admin 
 Time : 1795531370000 */
var e={appName:`超算管理平台`,showViteLogo:!0,keepAliveTabs:!1,logs:[]};function t(e,t){return[`> 欢迎使用凇云超算管理平台`,`> 平台版本：${e||`未配置`}`,...Object.entries(t).map(([e,t])=>`> ${e}：${t}`),`--------------------------------------版权声明--------------------------------------`,`** 版权持有公司：上海凇云数据科技有限责任公司 **`].join(`
`)}function n(e,n,r,i){let a=`${(n||``).replace(/\/+$/,``)}/swagger/index.html`,o=e=>i?new URL(e,i).href:e;return t(e,{接口文档:o(a),管理端入口:o(r)})}export{n,e as t};