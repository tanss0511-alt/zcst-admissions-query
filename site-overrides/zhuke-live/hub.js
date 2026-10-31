(()=>{
'use strict';
const q=id=>document.getElementById(id),gaokaoOrigin='https://tanss0511-alt.github.io';
const gaokaoURL=gaokaoOrigin+'/gaokao-live/?embed=live-hub';
let system='zhuke',range='all',gaokao=null,gaokaoTimedOut=false,frameStarted=false,frameTimer,pendingGaokaoView=null;
const frame=q('gaokaoFrame');
const fmt=v=>v==null?'—':v.toLocaleString('zh-CN');
function bounds(){const d=todayCN();if(range==='month')return [d.slice(0,7)+'-01',d.slice(0,7)+'-31'];if(range==='week')return [weekStart(d),addDays(weekStart(d),6)];return ['', '']}
function within(date){const [a,b]=bounds();return (!a||date>=a)&&(!b||date<=b)}
function zhukeStats(){if(!hasLoaded)return null;const valid=rows.filter(r=>!r.cancelled_at&&r.status!=='已取消'&&within(r.date));return {done:valid.filter(r=>!isUnfinished(r)).length,pending:valid.filter(isUnfinished).length,offline:!online,time:lastUpdated}}
function gaokaoStats(){if(!gaokao)return null;const episodes=gaokao.episodes.filter(e=>e.status!=='cancelled'&&within(e.date)),done=episodes.filter(e=>e.status==='completed'),ids=new Set(done.map(e=>e.id));const metrics=gaokao.metrics.filter(m=>ids.has(m.episode_id));const sum=field=>{const values=metrics.map(m=>m.values?.[field]).filter(v=>typeof v==='number'&&Number.isFinite(v));return values.length?values.reduce((a,b)=>a+b,0):null};return {done:done.length,pending:episodes.filter(e=>e.status==='planned').length,offline:gaokao.offline,time:new Date(gaokao.savedAt).toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai'}),viewers:sum('viewers'),likes:sum('likes'),missing:done.reduce((n,e)=>n+['video','douyin'].filter(p=>!metrics.some(m=>m.episode_id===e.id&&m.platform===p)).length,0)}}
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function status(s,waiting){return s?(s.offline?'连接中断 · 上次数据 ':'更新于 ')+s.time:waiting}
function startGaokao(){if(frameStarted)return;frameStarted=true;frame.src=gaokaoURL;frameTimer=setTimeout(()=>{if(!gaokao){gaokaoTimedOut=true;renderHub()}},30000)}
function select(next,updateHash=true){system=next;for(const b of document.querySelectorAll('#systemNav button'))b.setAttribute('aria-current',b.dataset.system===next?'page':'false');q('zhukeMain').hidden=next!=='zhuke';q('zhukeNav').hidden=next!=='zhuke';q('hubOverview').hidden=next!=='overview';q('gaokaoPanel').hidden=next!=='gaokao';if(next!=='zhuke')startGaokao();if(updateHash){history.replaceState(null,'','#'+(next==='zhuke'?'booking':next));if(next==='zhuke')showPage('booking');window.scrollTo(0,0)}renderHub()}
window.hubSelect=select;
function openGaokao(view){pendingGaokaoView=view;select('gaokao');if(gaokao){frame.contentWindow?.postMessage({type:'zhuke:select-view',view},gaokaoOrigin);pendingGaokaoView=null}}
function renderHub(){
 const a=zhukeStats(),b=gaokaoStats(),[from,to]=bounds(),waiting=gaokaoTimedOut?'未连接 · 请刷新或独立打开':'正在连接…';
 q('hubScope').textContent=range==='all'?'全部历史与本学期':from+' 至 '+to;
 q('hubTotal').textContent=a&&b?fmt(a.done+b.done):'—';
 q('hubStatus').textContent=a&&b?(a.offline||b.offline?'部分数据为上次记录，恢复连接后请刷新。':'已汇总两个系统，双人 / 双平台不重复计场。'):'两边数据完整读取后显示合计。';
 const chart=q('hubChart');chart.replaceChildren();const max=Math.max(1,a?.done||0,b?.done||0);
 for(const [title,s,unit] of [['老师开麦啦',a,'场'],['高考最前线',b,'期']]){const row=node('div',undefined,'hub-bar-row'),track=node('div',undefined,'hub-bar-track'),fill=node('div',undefined,'hub-bar-fill');fill.style.width=(s?s.done/max*100:0)+'%';track.append(fill);row.append(node('span',title),track,node('b',s?fmt(s.done)+' '+unit:'—'));row.setAttribute('aria-label',title+(s?'已完成'+s.done+unit:'数据未加载'));chart.append(row)}
 const cards=q('hubSystems');cards.replaceChildren();for(const [title,s,id,unit,label] of [['老师开麦啦',a,'zhuke','场','未结束报名'],['高考最前线2026',b,'gaokao','期','计划待播']]){const c=node('section'),nums=node('div',undefined,'hub-card-numbers');nums.append(node('span','已完成 '),node('b',fmt(s?.done)),node('span',' '+unit),node('br'),node('span',label+' '),node('b',fmt(s?.pending)),node('span',' '+unit));c.append(node('h3',title),nums,node('p',status(s,id==='gaokao'?waiting:'正在连接…'),'hub-card-state'));const book=node('button','报名 / 排班'),stats=node('button','查看统计','hub-card-secondary');book.type=stats.type='button';book.onclick=()=>id==='zhuke'?showPage('booking'):openGaokao('signup');stats.onclick=()=>id==='zhuke'?showPage('counts'):openGaokao('stats');c.append(book,stats);cards.append(c)}
 q('hubViewers').textContent=fmt(b?.viewers);q('hubLikes').textContent=fmt(b?.likes);q('hubReachNote').textContent=b?(b.missing?'有 '+b.missing+' 份平台数据待补；':'')+'仅汇总已发布数据；观看人次跨平台、跨场次未去重。':'待高考最前线数据加载后显示。';
 q('hubFrameStatus').textContent=status(b,waiting);q('hubFrameStatus').className=b&&!b.offline?'muted':'muted hub-unavailable';
}
window.renderHub=renderHub;
window.addEventListener('message',e=>{if(e.origin!==gaokaoOrigin||e.source!==frame.contentWindow||e.data?.type!=='zhuke:gaokao-summary'||e.data.version!==1)return;const d=e.data;if(!Array.isArray(d.episodes)||!Array.isArray(d.metrics)||typeof d.savedAt!=='string'||!Number.isFinite(Date.parse(d.savedAt)))return;gaokao=d;gaokaoTimedOut=false;clearTimeout(frameTimer);if(pendingGaokaoView){frame.contentWindow?.postMessage({type:"zhuke:select-view",view:pendingGaokaoView},gaokaoOrigin);pendingGaokaoView=null}renderHub()});
frame.addEventListener('load',()=>frame.contentWindow?.postMessage({type:'zhuke:request-summary'},gaokaoOrigin));
for(const button of document.querySelectorAll('#systemNav button'))button.onclick=()=>select(button.dataset.system);
for(const button of document.querySelectorAll('.hub-range button'))button.onclick=()=>{range=button.dataset.range;for(const b of document.querySelectorAll('.hub-range button'))b.setAttribute('aria-pressed',String(b===button));renderHub()};
q('hubGaokaoStats').onclick=()=>openGaokao('stats');
q('hubRefresh').onclick=async()=>{q('hubRefresh').disabled=true;try{if(gaokaoTimedOut&&!gaokao){frameStarted=false;gaokaoTimedOut=false;clearTimeout(frameTimer)}if(!frameStarted)startGaokao();else frame.contentWindow?.postMessage({type:'zhuke:refresh'},gaokaoOrigin);await refresh()}finally{q('hubRefresh').disabled=false}};
const initial=(window.hubInitialHash||'').slice(1);if(['booking','archive','counts','form'].includes(initial)){select('zhuke',false);showPage(initial==='form'?'booking':initial)}else select(initial==='gaokao'?'gaokao':'overview');
})();
