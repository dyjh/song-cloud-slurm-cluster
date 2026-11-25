/*! 
 Build based on gin-vue-admin 
 Time : 1795604097000 */
var e=e=>{let t=Number(e||0);if(!t)return`--`;let n=[`B`,`KB`,`MB`,`GB`,`TB`],r=t,i=0;for(;r>=1024&&i<n.length-1;)r/=1024,i++;return`${r.toFixed(i===0?0:1)} ${n[i]}`},t=t=>{let n=Number(t);if(!Number.isFinite(n)||n<=0)return`0 KB/s`;let r=e(n);return r===`--`?`0 KB/s`:`${r}/s`};export{t as n,e as t};