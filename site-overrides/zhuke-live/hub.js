(()=>{
'use strict';
const q=id=>document.getElementById(id),origin='https://tanss0511-alt.github.io';
const frame=q('gaokaoFrame'),frameURL=origin+'/gaokao-live/?embed=live-hub';
let system='zhuke',started=false,timedOut=false,timer,status=null,zhukePage='booking';
function send(message){if(started)frame.contentWindow?.postMessage(message,origin)}
function renderHub(){q('hubFrameStatus').textContent=status?(status.offline?'连接中断 · 显示上次数据':'已同步 '+new Date(status.savedAt).toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai'})):timedOut?'连接未完成，请重试':'正在连接…';q('hubFrameStatus').className=status&&!status.offline?'muted':'muted hub-unavailable';q('hubFrameRefresh').textContent=timedOut?'重试':'刷新'}
function start(){if(started)return;started=true;frame.src=frameURL;timer=setTimeout(()=>{if(!status){timedOut=true;renderHub()}},30000)}
function select(next,updateHash=true){
 if(next!=='zhuke'&&next!=='gaokao')next='zhuke';
 if(system==='zhuke'){const hash=location.hash.slice(1);if(['booking','archive','counts'].includes(hash))zhukePage=hash}
 system=next;document.body.dataset.system=next;
 for(const b of document.querySelectorAll('#systemNav button'))b.setAttribute('aria-current',b.dataset.system===next?'page':'false');
 q('zhukeMain').hidden=next!=='zhuke';q('zhukeNav').hidden=next!=='zhuke';q('gaokaoPanel').hidden=next!=='gaokao';
 if(next==='gaokao')start();send({type:'zhuke:visibility',visible:next==='gaokao'});
 if(updateHash){if(next==='zhuke')showPage(zhukePage);else history.replaceState(null,'','#gaokao');window.scrollTo(0,0)}
 renderHub();
}
window.hubSelect=select;window.renderHub=renderHub;
window.addEventListener('message',e=>{if(e.origin!==origin||e.source!==frame.contentWindow||e.data?.type!=='zhuke:gaokao-summary'||e.data.version!==1||!Number.isFinite(Date.parse(e.data.savedAt)))return;status={offline:!!e.data.offline,savedAt:e.data.savedAt};timedOut=false;clearTimeout(timer);renderHub()});
frame.addEventListener('load',()=>{send({type:'zhuke:request-summary'});send({type:'zhuke:visibility',visible:system==='gaokao'})});
for(const b of document.querySelectorAll('#systemNav button'))b.onclick=()=>select(b.dataset.system);
q('hubFrameRefresh').onclick=()=>{if(timedOut&&!status){started=false;timedOut=false;clearTimeout(timer);start();renderHub()}else send({type:'zhuke:refresh'})};
const initial=(window.hubInitialHash||'').slice(1);
if(initial==='gaokao')select('gaokao');else{zhukePage=['booking','archive','counts'].includes(initial)?initial:'booking';select('zhuke');}
})();
