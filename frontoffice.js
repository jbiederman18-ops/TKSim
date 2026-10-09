/* Tony Khan Simulator — rival tampering & injury decisions (v156).
   TAMPERING: an unhappy wrestler whose deal runs out within 8 weeks may get a call from the rival office (in a league,
   "another company"). The briefing flags the rumor: match the rival's number and extend now, open a negotiation, sit
   down with them, or let them go. Ignore it and, when the deal runs out, they sign with the rival on the spot instead of
   reaching free agency (in a league they hit free agency with interest from everywhere).
   INJURY DECISIONS: when one of your wrestlers is hurt for 3+ weeks, the medical staff asks how to handle it:
   let it heal (as is), rush them back (about half the time, but their body is fragile for 6 weeks after: lower
   durability, much higher re-injury risk), or surgery for longer injuries (more time out and a fee, but they come back
   tougher: +5 durability, fresh, and happy).
   Both are private to each GM in a league. Loaded after the main script; hooks in by wrapping globals. */
'use strict';
(function(){
const TAMP_WIN=8,RUSH_WK=6,RUSH_DUR=25;
const W=id=>S.w[id];
const mineW=id=>{const w=W(id);return w&&w.own==='p'?w:null};
const who=()=>ON()?'another company':S.rival;

/* ---------------- tampering ---------------- */
function tampTick(notes){if(S.phase!=='season'||S.week<3)return;S.tamp=S.tamp||{};const a=AW();
 for(const id in S.tamp){const t=S.tamp[id],w=mineW(id);if(!w||w.con>TAMP_WIN+2||(t.calm&&a>=t.calm)){delete S.tamp[id]}}
 if(Object.keys(S.tamp).length>=2)return;
 const l=ownList('p').filter(w=>!S.tamp[w.id]&&w.con>1&&w.con<=TAMP_WIN&&w.pop>=45&&(w.mor<55||sal(w)<mkt(w)*.85));
 for(const w of shuffle(l)){const p=Math.min(.5,.08+Math.max(0,55-w.mor)/80+(w.pop>=70?.08:0));if(Math.random()>p)continue;
  const offer=Math.max(askSal(w),Math.round(mkt(w)*1.2));S.tamp[w.id]={at:a,offer};
  const n=`🕵️ Rumor: ${who()} has been in contact with ${w.name}. Their deal ends in ${w.con} weeks.`;news(n);notes.push(n);break}}
window.tampMatch=function(id){if(typeof mpLocked==='function'&&mpLocked())return;const w=mineW(id),t=S.tamp&&S.tamp[id];if(!w||!t)return;const c=t.offer*4;
 if(S.money.p<c)return toast('Not enough money.');if(S.money.p<0)return toast("You can't sign anyone while you're in the red.");
 S.money.p-=c;w.sal=t.offer;w.con+=26;w.mor=clamp(w.mor+12,0,100);if(typeof mlog==='function')mlog(w,12,'You matched the rival offer',false);delete S.tamp[id];
 news(`✍️ ${S.gm} matched ${who()}'s offer and extended ${w.name} through ${w.con} more weeks at ${money(t.offer)}/wk.`);save();tampRefresh();toast(`${w.name} is staying.`)};
window.tampTalk=function(id){const w=mineW(id),t=S.tamp&&S.tamp[id];if(!w||!t||t.talked)return;t.talked=1;
 if(Math.random()<.35+Math.max(0,w.mor-30)/100){if(typeof mlog==='function')mlog(w,8,'You sat down with them');else mor(w,8);t.calm=AW()+1;toast(`${w.name} feels heard and turns the rival down — for now.`);news(`🤝 ${w.name} turned down ${who()} after a sit-down with ${S.gm}.`)}
 else{if(typeof mlog==='function')mlog(w,2,'You sat down with them');toast(`${w.name} listens, but they're still taking the call.`)}
 save();tampRefresh()};
window.tampLet=function(id){const t=S.tamp&&S.tamp[id];if(!t)return;t.let=1;save();tampRefresh();toast("Understood. If they leave, it won't be a surprise.")};
function tampRefresh(){if(document.querySelector('#modal .brief'))openBrief();else render()}
/* the deal runs out with the rival already in their ear: offline, the rival signs them on the spot */
if(typeof leave==='function'){const l0=leave;leave=function(w,msg,notes){const t=w&&S.tamp&&S.tamp[w.id];const was=w&&w.own;
 if(t&&was==='p'&&!ON()&&/contract expired/.test(msg||'')){delete S.tamp[w.id];w.own='ai';w.sal=t.offer;w.con=RI(26,40);w.mor=80;w.deb=AW();S.training=S.training.filter(x=>x.id!==w.id);
  const n=`🕵️ ${w.name}'s contract ran out — and they signed with ${S.rival} the same day. The rumors were true.`;news(n);if(notes)notes.push(n);return}
 if(t)delete S.tamp[w.id];return l0.apply(this,arguments)}}

/* ---------------- injury decisions ---------------- */
function injScan(){if(S.phase!=='season')return;S.injq=(S.injq||[]).filter(q=>{const w=mineW(q.id);return w&&w.inj>0&&!w.susp});
 ownList('p').forEach(w=>{if(!w.inj){delete w.injSeen;return}if(w.inj>=2&&!w.susp&&!w.away&&!w.injSeen){w.injSeen=1;S.injq.push({id:w.id,at:AW(),wk:w.inj})}})}
const surgWk=wk=>Math.round(wk*1.5)+1,rushWk=wk=>Math.max(1,Math.ceil(wk*.5)),surgCost=()=>Math.max(20,Math.round(econCap()*.06/5)*5);
window.injAct=function(id,k){if(typeof mpLocked==='function'&&mpLocked())return;const i=(S.injq||[]).findIndex(q=>q.id===id);if(i<0)return;const w=mineW(id);if(!w){S.injq.splice(i,1);return}
 if(k==='rush'){const was=w.inj;w.inj=rushWk(w.inj);if(w.dur0==null)w.dur0=durOf(w);w.dur=Math.max(5,w.dur0-RUSH_DUR);w.rush=AW()+w.inj+RUSH_WK;if(typeof mlog==='function')mlog(w,3,'Rushed back');news(`🩹 ${w.name} is being rushed back — out ${w.inj} week${w.inj>1?'s':''} instead of ${was}. The doctors aren't thrilled.`)}
 else if(k==='surg'){const c=surgCost();if(S.money.p<c)return toast('Not enough money.');S.money.p-=c;const was=w.inj;w.inj=surgWk(w.inj);w.surg=1;news(`🏥 ${w.name} is having surgery — out ${w.inj} weeks instead of ${was}, but they'll come back stronger.`)}
 else news(`🛌 ${w.name} will take the full ${w.inj} weeks to heal.`);
 S.injq.splice(i,1);save();tampRefresh()};
/* weekly: fragile bodies heal back to normal; surgery pays off on return */
function medWeek(notes){ownList('p').concat(ON()?[]:ownList('ai')).forEach(w=>{
 if(w.rush&&AW()>=w.rush){if(w.dur0!=null)w.dur=w.dur0;delete w.dur0;delete w.rush;if(w.own==='p')notes.push(`💪 ${w.name}'s body has fully healed from being rushed back.`)}
 if(w.surg&&w.inj===0){delete w.surg;w.dur=Math.min(95,durOf(w)+5);w.fat=0;w.mor=clamp(w.mor+6,0,100);const n=`🏥 ${w.name} is back from surgery — fully healed and tougher than before (+5 durability).`;news(n);if(w.own==='p')notes.push(n)}})}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){const out=e0.apply(this,arguments);notes=notes||[];
 try{bothSides(()=>{tampTick(notes);medWeek(notes);injScan()})}catch(e){console.warn('front office',e)}return out}}
/* scan right after a show too, so the decision is waiting on the results screen's way home */
if(typeof airShow==='function'){const a0=airShow;airShow=function(){const out=a0.apply(this,arguments);try{injScan()}catch(e){}return out}}

/* ---------------- briefing ---------------- */
function brief(){const out=[];
 const inj=(S.injq||[]).map(q=>({q,w:mineW(q.id)})).filter(x=>x.w&&x.w.inj>0);
 if(inj.length)out.push({i:'🚑',t:`Medical decisions · ${inj.length}`,u:1,rows:inj.map(({w})=>{const c=surgCost();const long=w.inj>=5;
  return `<div class="brow"><b>${esc(w.name)}</b> <span class="muted tiny">· out ${w.inj} weeks${isChamp(w.id)?' · champion':''}</span>
  <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><button class="mini" onclick="injAct('${w.id}','rest')">🛌 Let it heal · ${w.inj} wk</button><button class="mini" onclick="injAct('${w.id}','rush')">⏩ Rush back · ${rushWk(w.inj)} wk</button>${long?`<button class="mini" ${S.money.p<c?'disabled':''} onclick="injAct('${w.id}','surg')">🏥 Surgery · ${surgWk(w.inj)} wk · ${money(c)}</button>`:''}</div>
  <div class="muted tiny" style="margin-top:4px">Rushing back leaves them fragile for ${RUSH_WK} weeks after they return (much higher re-injury risk).${long?' Surgery takes longer but they come back tougher (+5 durability).':''}</div></div>`})});
 const T=S.tamp||{};const tl=Object.keys(T).map(id=>({t:T[id],w:mineW(id)})).filter(x=>x.w&&!x.t.calm);
 if(tl.length)out.push({i:'🕵️',t:`Tampering rumors · ${tl.length}`,u:tl.some(x=>!x.t.let),rows:tl.map(({t,w})=>`<div class="brow"><b>${esc(w.name)}</b> <span class="muted tiny">· morale ${Math.round(w.mor)} · deal ends in ${w.con} wk</span><br><span class="tiny">${esc(who())} ${ON()?'is':'is reportedly'} offering about <b>${money(t.offer)}/wk</b> (they make ${money(sal(w))}). ${t.let?'<span class="muted">You\'ve decided to let them go.</span>':`If the deal runs out, ${ON()?'they\'ll hit free agency with offers waiting':`they sign with ${esc(S.rival)} on the spot`}.`}</span>
  ${t.let?'':`<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><button class="mini" ${S.money.p<t.offer*4?'disabled':''} onclick="tampMatch('${w.id}')">✍️ Match & extend · ${money(t.offer*4)}</button><button class="mini" onclick="dealNegotiate('${w.id}')">Negotiate</button>${t.talked?'':`<button class="mini" onclick="tampTalk('${w.id}')">🤝 Sit down with them</button>`}<button class="mini" onclick="tampLet('${w.id}')">Let them go</button></div>`}</div>`)});
 return out}
if(typeof briefItems==='function'){const b0=briefItems;window.briefItems=briefItems=function(){const sec=b0.apply(this,arguments);try{const x=brief();if(x.length)sec.unshift(...x)}catch(e){console.warn(e)}return sec}}
/* a red card on Home too, so a decision is never missed */
if(typeof homeView==='function'){const h0=homeView;homeView=function(){const out=h0.apply(this,arguments);try{const n=(S.injq||[]).filter(q=>mineW(q.id)).length+Object.keys(S.tamp||{}).filter(id=>mineW(id)&&!S.tamp[id].let&&!S.tamp[id].calm).length;
 if(!n)return out;const k=`<div class="card warn" onclick="openBrief()" style="cursor:pointer"><b>🚑🕵️ ${n} front-office decision${n>1?'s':''} waiting</b><div class="muted">Injuries and tampering rumors — tap to open the briefing.</div></div>`;const i=out.indexOf('<div class="tiles">');return i<0?k+out:out.slice(0,i)+k+out.slice(i)}catch(e){return out}}}
})();
