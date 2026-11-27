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
/* v198: a rumor ends the moment the deal it was about is gone — re-signed (any way: Negotiate, the roster, matching),
   traded, released or gone. It used to linger until the end of the week, so the briefing kept asking. */
function tampPrune(){const T=S&&S.tamp;if(!T)return;for(const id in T){const t=T[id],w=mineW(id);
 if(!w||(t.end!=null?AW()+w.con>t.end:w.con>TAMP_WIN+2))delete T[id]}}
window.tampPrune=tampPrune;
window.tampOpen=function(){tampPrune();const T=S.tamp||{};return Object.keys(T).filter(id=>mineW(id)&&!T[id].let&&!T[id].calm)};

/* ---------------- tampering ---------------- */
function tampTick(notes){if(S.phase!=='season'||S.week<3)return;S.tamp=S.tamp||{};const a=AW();tampPrune();
 for(const id in S.tamp){const t=S.tamp[id],w=mineW(id);if(!w||w.con>TAMP_WIN+2||(t.calm&&a>=t.calm)){delete S.tamp[id]}}
 if(Object.keys(S.tamp).length>=2)return;
 const l=ownList('p').filter(w=>!S.tamp[w.id]&&w.con>1&&w.con<=TAMP_WIN&&w.pop>=45&&(w.mor<55||sal(w)<mkt(w)*.85));
 for(const w of shuffle(l)){const p=Math.min(.5,.08+Math.max(0,55-w.mor)/80+(w.pop>=70?.08:0));if(Math.random()>p)continue;
  const offer=Math.max(askSal(w),Math.round(mkt(w)*1.2));S.tamp[w.id]={at:a,offer,end:a+w.con};
  const n=`🕵️ Rumor: ${who()} has been in contact with ${w.name}. Their deal ends ${conWhen(w)}.`;news(n);notes.push(n);break}}
window.tampMatch=function(id){if(typeof mpLocked==='function'&&mpLocked())return;const w=mineW(id),t=S.tamp&&S.tamp[id];if(!w||!t)return;const c=t.offer*4;
 if(S.money.p<c)return toast('Not enough money.');if(S.money.p<0)return toast("You can't sign anyone while you're in the red.");
 S.money.p-=c;w.sal=t.offer;w.con+=26;w.mor=clamp(w.mor+12,0,100);if(typeof mlog==='function')mlog(w,12,'You matched the rival offer',false);delete S.tamp[id];
 news(`✍️ ${S.gm} matched ${who()}'s offer and extended ${w.name} through ${w.con} more weeks at ${money(t.offer)}/wk.`);save();tampRefresh();toast(`${w.name} is staying.`)};
window.tampTalk=function(id){const w=mineW(id),t=S.tamp&&S.tamp[id];if(!w||!t||t.talked)return;t.talked=1;
 if(Math.random()<.35+Math.max(0,w.mor-30)/100){if(typeof mlog==='function')mlog(w,8,'You sat down with them');else mor(w,8);t.calm=AW()+1;toast(`${w.name} feels heard and turns the rival down — for now.`);news(`🤝 ${w.name} turned down ${who()} after a sit-down with ${S.gm}.`)}
 else{if(typeof mlog==='function')mlog(w,2,'You sat down with them');toast(`${w.name} listens, but they're still taking the call.`)}
 save();tampRefresh()};
window.tampLet=function(id){const t=S.tamp&&S.tamp[id];if(!t)return;t.let=1;save();tampRefresh();toast("Understood. If they leave, it won't be a surprise.")};
function tampRefresh(){render()}
/* the deal runs out with the rival already in their ear: offline, the rival signs them on the spot */
if(typeof leave==='function'){hookStep('leave','frontoffice.js',{around(l0,...args){let [w,msg,notes]=args;const t=w&&S.tamp&&S.tamp[w.id];const was=w&&w.own;
 if(t&&was==='p'&&!ON()&&/contract expired/.test(msg||'')){delete S.tamp[w.id];w.own='ai';w.sal=t.offer;w.con=RI(26,40);w.mor=80;w.deb=AW();S.training=S.training.filter(x=>x.id!==w.id);
  const n=`🕵️ ${w.name}'s contract ran out — and they signed with ${S.rival} the same day. The rumors were true.`;news(n);if(notes)notes.push(n);return}
 if(t)delete S.tamp[w.id];return l0.apply(this,args)}})}

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
hookStep('endWeek','front office: tampering, medical, injuries',{after(ctx,r,notes){notes=notes||[];
 try{bothSides(()=>{tampTick(notes);medWeek(notes);injScan()})}catch(e){console.warn('front office',e)}}});
/* scan right after a show too, so the decision is waiting on the results screen's way home */
if(typeof airShow==='function'){hookStep('airShow','frontoffice.js',{after(ctx,out){try{injScan()}catch(e){}return out}})}

/* ---------------- what a wrestler is already lined up for ----------------
   Everything already promised or under way for one of your wrestlers, so a decision about them (an injury, for now)
   shows what it puts at risk. Each item: {i,t,aw} — aw is the absolute week it comes due (null if it isn't dated). */
function wCommit(w){const out=[];if(!w||!S)return out;const id=w.id,nm=x=>x&&S.w[x]?S.w[x].name:'?',inW=wk=>AW()-S.week+wk;
 const wkTxt=aw=>{const wk=aw-AW()+S.week;return PPVS[wk]?`${PPVS[wk]} (week ${wk})`:`week ${wk}`};
 try{if(isChamp(w.id)){const t=Object.values(S.titles||{}).find(t=>t&&t.holders&&t.holders[0]===id);out.push({i:'🏆',t:`Holds the ${t?t.n+' title':'title'}`,aw:null})}}catch(e){}
 try{for(const k in TOURS){const D=TOURS[k],t=S.tour&&S.tour.p&&S.tour.p[k];if(!t||t.s!==S.season||t.win||!(t.ent||[]).includes(id))continue;
  const left=(D.rr?D.rr.filter(x=>x>=S.week).concat([D.final]):[D.semi,D.final].filter(x=>x>=S.week));if(!left.length)continue;
  const ko=!D.rr&&t.res.some(r=>r.w&&r.w!==id&&(r.a===id||r.b===id||(r.ids||[]).includes(id)));if(ko)continue;
  out.push({i:D.i,t:`In the ${D.n}${t.lock?'':' field you picked'} · ${left[0]>S.week?'starts':'runs'} ${left[0]===D.final?'':`week ${left[0]}–`}${PPVS[D.final]||'week '+D.final}`,aw:inW(left[0]),tour:1})}}catch(e){}
 (S.promises||[]).forEach(pr=>{if((pr.a!==id&&pr.b!==id)||pr.week<S.week)return;const o=pr.a===id?pr.b:pr.a;const T=pr.title&&S.titles[pr.title];
  out.push({i:'📜',t:`${pr.kind==='shot'?(pr.a===id?`Owed a ${T?T.n+' ':''}title shot vs`:'Defends against'):pr.kind==='contract'?'Signed to face':'Promised a match vs'} ${nm(o)} at ${pr.ppv||'week '+pr.week}`,aw:inW(pr.week)})});
 try{const d=w.deal||{};(typeof dealActive==='function'?dealActive(w):[]).forEach(k=>{if(k==='cc')return;
  out.push({i:'✍️',t:`Contract: ${dealTermTxt(w,k).replace(/^\S+\s/,'')}`,aw:k==='me'?d.me.by:k==='shot'?d.shot.by:null})})}catch(e){}
 try{if(S.mitb&&S.mitb[id]){const left=SEASON-(AW()-S.mitb[id].aw);out.push({i:'💼',t:`Holds Money in the Bank · ${left} week${left===1?'':'s'} to cash in`,aw:null})}}catch(e){}
 try{if(typeof arcList==='function')arcList().concat(arcHeld()).forEach(a=>{if(a.done||![a.a,a.b,a.c].includes(id))return;
  out.push({i:'📖',t:`${a.a===id?'Running':'Part of'} ${esc(aTitleOf(a))} arc${arcHeld().includes(a)?' (on hold)':` · due by ${wkTxt(a.end)}`}`,aw:arcHeld().includes(a)?null:a.end})})}catch(e){}
 (S.trials||[]).forEach(t=>{if(t.a!==id&&t.b!==id)return;const P=typeof PITCHES!=='undefined'&&PITCHES[t.k];if(!P)return;
  out.push({i:'💡',t:`${P.cat.replace(/^\S+\s/,'')} pitch you said yes to · until ${wkTxt(t.end)}`,aw:t.end})});
 try{const f=feudList('p').find(f=>(f.a.id===id||f.b.id===id)&&heatTier(f.h)>=0);if(f)out.push({i:'🔥',t:`${heatLbl(f.h).replace(/^\S+\s/,'')} with ${(f.a.id===id?f.b:f.a).name}`,aw:null})}catch(e){}
 return out}
window.wCommit=wCommit;
/* the commitments an injury runs into: each dated one says which recovery gets them back in time */
function injCommitHtml(w){const l=wCommit(w);if(!l.length)return '';
 const back=n=>AW()+n,opts=[['heal',w.inj]].concat(rushWk(w.inj)<w.inj?[['rush',rushWk(w.inj)]]:[]);
 return `<div class="tiny" style="margin-top:6px"><div class="muted">Already lined up</div>${l.map(x=>{let tag='';
  if(x.aw!=null&&x.aw>=AW()){const miss=opts.filter(([k,n])=>x.aw<back(n));if(miss.length===opts.length)tag=` <span class="tg bad">${x.tour?'Forfeits':'Misses it'}</span>`;else if(miss.length)tag=` <span class="tg warnt">Only if rushed back</span>`}
  return `<div>${x.i} ${x.t}${tag}</div>`}).join('')}</div>`}
/* ---------------- briefing ---------------- */
function brief(){const out=[];tampPrune();
 const inj=(S.injq||[]).map(q=>({q,w:mineW(q.id)})).filter(x=>x.w&&x.w.inj>0);
 if(inj.length)out.push({i:'🚑',t:`Medical decisions · ${inj.length}`,u:1,rows:inj.map(({w})=>{const c=surgCost();const long=w.inj>=5;
  return `<div class="brow"><b>${esc(w.name)}</b> <span class="muted tiny">· out ${w.inj} week${w.inj===1?'':'s'}</span>
  <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><button class="mini" onclick="injAct('${w.id}','rest')">🛌 Let it heal · ${w.inj} wk</button>${rushWk(w.inj)<w.inj?`<button class="mini" onclick="injAct('${w.id}','rush')">⏩ Rush back · ${rushWk(w.inj)} wk</button>`:''}${long?`<button class="mini" ${S.money.p<c?'disabled':''} onclick="injAct('${w.id}','surg')">🏥 Surgery · ${surgWk(w.inj)} wk · ${money(c)}</button>`:''}</div>
  ${injCommitHtml(w)}<div class="muted tiny" style="margin-top:4px">${rushWk(w.inj)<w.inj?`Rushing back leaves them fragile for ${RUSH_WK} weeks after they return (much higher re-injury risk).`:'A short one — they\'ll be back next week.'}${long?' Surgery takes longer but they come back tougher (+5 durability).':''}</div></div>`})});
 const T=S.tamp||{};const tl=Object.keys(T).map(id=>({t:T[id],w:mineW(id)})).filter(x=>x.w&&!x.t.calm);
 if(tl.length)out.push({i:'🕵️',t:`Tampering rumors · ${tl.length}`,u:tl.some(x=>!x.t.let),rows:tl.map(({t,w})=>`<div class="brow"><b>${esc(w.name)}</b> <span class="muted tiny">· morale ${Math.round(w.mor)} · deal ends ${conWhen(w)}</span><br><span class="tiny">${esc(who())} ${ON()?'is':'is reportedly'} offering about <b>${money(t.offer)}/wk</b> (they make ${money(sal(w))}). ${t.let?'<span class="muted">You\'ve decided to let them go.</span>':`If the deal runs out, ${ON()?'they\'ll hit free agency with offers waiting':`they sign with ${esc(S.rival)} on the spot`}.`}</span>
  ${t.let?'':`<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><button class="mini" ${S.money.p<t.offer*4?'disabled':''} onclick="tampMatch('${w.id}')">✍️ Match & extend · ${money(t.offer*4)}</button><button class="mini" onclick="dealNegotiate('${w.id}')">Negotiate</button>${t.talked?'':`<button class="mini" onclick="tampTalk('${w.id}')">🤝 Sit down with them</button>`}<button class="mini" onclick="tampLet('${w.id}')">Let them go</button></div>`}</div>`)});
 return out}
if(typeof briefItems==='function'){hookStep('briefItems','frontoffice.js',{after(ctx,sec){try{const x=brief();if(x.length)sec.unshift(...x)}catch(e){console.warn(e)}return sec}})}
/* a red card on Home too, so a decision is never missed */
})();
