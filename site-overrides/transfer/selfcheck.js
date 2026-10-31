(function(root){
  'use strict';
  function assess(a){
    const materials=['户口本首页及本人页','按报名系统要求完成学历或学籍验证','按当年要求提供体检材料'];
    const result=(status,title,reason,clause)=>({status,title,reason,clause,materials});
    if(a.excluded==='yes') return result('no','所填情况涉及不得报考情形','请先核对不得报考条款，并向省考试院或招生办确认。','招生工作规定第一部分（二）');
    if(a.excluded!=='no') return result('review','需要先核实不得报考情形','尚不能排除政策列明的限制，请人工核验后再判断。','招生工作规定第一部分（二）');
    if(a.route==='veteran') return result('review','请按退役大学生士兵专项政策核验','该通道另有报名条件。请结合粤招办普〔2025〕50号及学校专项简章，核对入伍与退役情况、专科学历及前置专业；免文化课考试不等于免综合考查。','招生工作规定第一部分（一）第8项；学校退役士兵招生简章');
    if(a.route!=='normal'||!['gd','other'].includes(a.hukou)) return result('review','信息尚不足以判断','请核实户籍及报考通道。','招生工作规定第一部分（一）');
    if(a.education==='current'){
      if(a.hukou==='gd')return result('likely','初步符合一般招生对象条件','广东户籍普通高校应届专科毕业生属于2026年招生对象。仍须完成学籍验证、如期毕业并符合目标专业要求。','招生工作规定第一部分（一）第1项');
      if(a.location==='gd')return result('likely','初步符合一般招生对象条件','非广东户籍、就读广东省普通高校的应届专科毕业生属于2026年招生对象，仍须核验学籍及专业要求。','招生工作规定第一部分（一）第4项');
      if(a.location==='other'&&a.gaokao==='yes'){materials.push('按系统要求验证广东普通高考专科录取信息');return result('likely','初步符合一般招生对象条件','非广东户籍、在广东参加普通高考并被外省普通高校录取就读的应届专科毕业生，属于2026年招生对象；须验证录取信息。','招生工作规定第一部分（一）第5项及第二部分（一）1（2）');}
      if(a.location==='other'&&a.gaokao==='no')return result('no','所填情况不满足该一般报考通道','非广东户籍、就读外省高校的应届考生，需符合在广东参加普通高考并被录取就读等要求。','招生工作规定第一部分（一）第4、5项');
      return result('review','需要核实就读或录取情况','请核实专科就读地区，以及是否通过广东普通高考被外省普通高校录取。','招生工作规定第一部分（一）第4、5项');
    }
    if(a.education==='previous'){
      if(a.hukou==='other')return result('no','所填情况不满足普通往届报考通道','2026年一般政策中，非广东户籍的普通往届专科毕业生不属于列明的一般招生对象；退役士兵另按专项核验。','招生工作规定第一部分（一）第1至5项');
      if(a.years==='yes')return result('likely','初步符合一般招生对象条件','广东户籍连续满3年的普通高校往届专科毕业生属于2026年招生对象，仍须完成学历验证及专业审核。','招生工作规定第一部分（一）第2项');
      if(a.years==='no'&&a.gdexam==='yes')return result('likely','初步符合户籍年限例外条件','户籍连续未满3年，但在广东参加普通高考且高考报名时为广东户籍的普通往届专科毕业生，可按该条款核验。','招生工作规定第一部分（一）第2项');
      if(a.years==='no'&&a.gdexam==='no')return result('no','所填情况不满足往届户籍要求','需广东户籍连续满3年；未满3年时，需同时满足在广东参加普通高考及高考报名时为广东户籍。','招生工作规定第一部分（一）第2项');
      return result('review','需要核实户籍连续年限或例外条件','请核实报名时的连续户籍年限，以及普通高考报名地点与当时户籍。','招生工作规定第一部分（一）第2项');
    }
    if(a.education==='nonfull'){
      materials.push('广东基本医疗保险累计满1年证明','广东基本养老保险累计满1年证明','专科毕业证书或符合政策的自考毕业验证材料');
      if(a.hukou==='other')return result('no','所填情况不满足该学历报考通道','2026年成人教育、自考、网络教育等专科学历的此项通道要求广东省户籍等条件。','招生工作规定第一部分（一）第3项');
      if(a.years==='no'||a.medical==='no'||a.pension==='no'||a.certificate==='no')return result('no','至少有一项条件尚不满足','该通道须同时满足广东户籍连续满3年、广东医保与养老保险各累计满1年，以及规定的学历日期或自考毕业验证要求。户籍未满3年不能套用普通往届高考例外。','招生工作规定第一部分（一）第3项；第二部分（一）1（3）（4）');
      if([a.years,a.medical,a.pension,a.certificate].some(x=>x==='unknown'||!x))return result('review','需要核实社保、户籍或学历材料','请逐项核对，两种保险均须在广东累计满1年。','招生工作规定第一部分（一）第3项；第二部分（一）1（3）（4）');
      if(a.certificate==='selfexam')return result('review','请按自考毕业特殊情形验证','所填户籍和社保条件初步满足。2025年12月已办理自考毕业但未领证者，还须按报名系统完成自考毕业验证；外省自考须按政策提供证明。','招生工作规定第一部分（一）第3项；第二部分（一）1（3）');
      return result('likely','初步符合该学历通道的一般条件','所填广东户籍年限、两项社保及专科毕业证日期符合该项一般条件。还须完成学历、材料与专业审核。','招生工作规定第一部分（一）第3项；第二部分（一）1（4）');
    }
    return result('review','请先确认专科学历性质与毕业情况','目前信息不能对应政策列明的招生对象，请向招生办提供准确学历情况咨询。','招生工作规定第一部分（一）');
  }
  root.assessEligibility=assess;
})(typeof window!=='undefined'?window:globalThis);

function bindTransferSelfcheck(){
 const sourceLink=Transfer.sourceLink;
 const form=$('#tr-checkForm');
 function field(name,title,options){return `<label>${title}<select name="${name}" required><option value="">请选择</option>${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`}
 const yesno=[['yes','是'],['no','否'],['unknown','不确定']];
 function conditional(){
  const a=Object.fromEntries(new FormData(form)),old={...a};let html='';
  if(a.route==='normal'){
   if(a.education==='current'&&a.hukou==='other'){html+=field('location','专科就读地区',[['gd','广东省内普通高校'],['other','外省普通高校'],['unknown','不确定']]);if(a.location==='other')html+=field('gaokao','是否在广东参加普通高考并被该外省高校录取？',yesno)}
   if(a.hukou==='gd'&&['previous','nonfull'].includes(a.education)){html+=field('years','报名时广东户籍是否连续满3年？',yesno);if(a.education==='previous'&&a.years==='no')html+=field('gdexam','是否在广东参加普通高考，且高考报名时为广东户籍？',yesno)}
   if(a.hukou==='gd'&&a.education==='nonfull'){html+=field('medical','广东基本医疗保险缴费是否累计满1年？',yesno)+field('pension','广东基本养老保险缴费是否累计满1年？',yesno)+field('certificate','专科毕业证书与日期',[['yes','国家承认学历，证书落款在2026年2月底前'],['selfexam','已办2025年12月自考毕业手续，但尚未领证'],['no','不符合上述情况'],['unknown','不确定']])}
  }
  $('#tr-conditionalFields').innerHTML=html?'<div class="form-grid">'+html+'</div>':'';
  Object.entries(old).forEach(([k,v])=>{const el=form.elements.namedItem(k);if(el)el.value=v});
  $('#tr-checkResult').innerHTML='';
 }
 form.addEventListener('change',conditional);form.addEventListener('reset',()=>{setTimeout(()=>{if(!document.contains(form))return;$('#tr-conditionalFields').innerHTML='';$('#tr-checkResult').innerHTML=''},0)});
 form.addEventListener('submit',e=>{e.preventDefault();const a=Object.fromEntries(new FormData(form)),r=window.assessEligibility(a);$('#tr-checkResult').innerHTML=`<section class="panel result-panel ${r.status==='likely'?'':'warn'}"><p class="eyebrow">2026年政策 · 自查结果</p><h2>${esc(r.title)}</h2><p>${esc(r.reason)}</p><p><b>对应条款：</b>${esc(r.clause)}</p><p><b>如符合条件，可按要求准备：</b></p><ul>${r.materials.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="detail-remark">自查仅梳理一般政策条件，不代表报名资格已获审核。还须核对目标专业前置条件、身体要求及当年正式报名安排。下一年度须使用新政策。</p><div class="source-links">${sourceLink('policy2026')}${sourceLink(a.route==='veteran'?'veteranCharter2026':'charter2026')}<a href="tel:07567626272">联系招生办：0756-7626272</a></div></section>`;$('#tr-checkResult').scrollIntoView({behavior:'smooth',block:'start'})});

}
