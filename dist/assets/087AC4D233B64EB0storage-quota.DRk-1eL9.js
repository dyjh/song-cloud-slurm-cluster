/*! 
 Build based on gin-vue-admin 
 Time : 1795531370000 */
function e(e){let t=String(e==null?``:e).trim().match(/^(\d+(?:\.\d+)?)([KMGTPE]?)$/i);if(!t)return;let n={"":-3,K:-2,M:-1,G:0,T:1,P:2,E:3}[t[2].toUpperCase()],r=Number(t[1])*Math.pow(1024,n);return Number.isSafeInteger(r)&&r>0?r:void 0}function t(e){if(!Number.isSafeInteger(e)||e<1||e>1e9)throw Error(`存储上限须为 1 至 10 亿 GB 的正整数`);return{hard_limit:`${e}G`,soft_limit:`${e-Math.floor(e/10)}G`}}export{e as n,t};