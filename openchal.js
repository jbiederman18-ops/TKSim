/* Tony Khan Simulator — Open Challenges (v104).
   Book one wrestler and throw the door open. Whoever answers is drawn from your roster and the free agents, matched
   to the challenger's standing: a top star draws a top star, a midcarder draws a midcarder. The crowd builds up a
   favourite in their heads beforehand — get that answer (or someone bigger) and the place erupts; get somebody they
   didn't want and you can hear the air leave the building. The answer is revealed live, and you call the finish
   from gorilla. A free agent who answers and impresses can be signed afterwards at a discount, for one week only.
   Loaded before the main script; everything here only runs once a game is going. */
'use strict';
const OC_OFFER=.6; /* a free agent who impressed signs for 60% of the usual cost */
function ocLvl(w){return w.pop*.55+w.ring*.45}
function ocPending(m){return !!(m&&m.type==='open'&&!(m.open&&m.open.who))}
function ocIssuer(m){const id=m&&m.sides&&m.sides[0]&&m.sides[0][0];return id?S.w[id]:null}
/* everyone who could plausibly answer: your roster (not elsewhere on the card) and unsigned free agents, same division */
function ocPool(I,brand,card){const used=new Set();(card||S.card[brand]||[]).forEach(sl=>{if(!sl||!sl.d)return;if(sl.k==='match'&&sl.d.sides)sl.d.sides.flat().forEach(x=>x&&used.add(x));if(sl.k==='promo'){used.add(sl.d.a);if(sl.d.b)used.add(sl.d.b)}});
 return Object.values(S.w).filter(w=>w!==I&&!w.inj&&w.g===I.g&&!w.cw&&(w.own===brand?!used.has(w.id)&&!inTeam(w.id,I.id):!w.own))}
/* who the crowd is hoping for: the biggest name who could realistically show up */
function ocHope(I,brand,card){const L=ocLvl(I);const pool=ocPool(I,brand,card);let l=pool.filter(w=>ocLvl(w)>=L-2&&ocLvl(w)<=L+12);if(!l.length)l=pool.filter(w=>ocLvl(w)>=L-15&&ocLvl(w)<=L+15);l.sort((a,b)=>b.pop-a.pop);return l[0]||null}
const OC_HOPE=.25; /* chance the crowd gets exactly who they wanted */
function ocDraw(I,brand,hopeId){const L=ocLvl(I);const pool=ocPool(I,brand);if(!pool.length)return null;const h=hopeId&&pool.find(w=>w.id===hopeId);
 if(h&&Math.random()<OC_HOPE)return h;const rest=pool.filter(w=>w!==h);if(!rest.length)return h||null;
 return wpick(rest,w=>{const d=ocLvl(w)-L;return Math.exp(-(d/7)*(d/7))*(d>12?.3:1)+.0001})}
/* how the crowd takes it */
function ocVerdict(I,W,hope){if(hope&&W.id===hope.id)return {k:'dream',st:.5,fans:4000,t:`The crowd got exactly who they wanted. The building comes unglued for ${W.name}!`};
 const H=hope?hope.pop:I.pop;
 if(W.pop>=H-4)return {k:'big',st:.25,fans:2000,t:`${hope?`Not ${hope.name} — but`:'And'} ${W.name}? The fans will take it. Huge reaction.`};
 if(W.pop>=Math.min(H-12,I.pop-5))return {k:'ok',st:0,fans:0,t:`${W.name} answers. A solid reaction${hope?` — not ${hope.name}, but the crowd is on board`:''}.`};
 return {k:'flat',st:-.5,fans:-2500,t:hope?`The crowd was chanting for ${hope.name}. They got ${W.name}. You can hear the air leave the building.`:`${W.name} answers… and the crowd is underwhelmed.`}}
/* the reveal: fills in the answer, adds the crowd reaction to the match, and (unless you're calling it live) decides the finish */
function ocResolve(m,brand,auto){const I=ocIssuer(m);if(!I)return false;m.open=m.open||{};const hope=m.open.hope&&S.w[m.open.hope]?S.w[m.open.hope]:null;
 const W=ocDraw(I,brand,hope&&!hope.inj&&(hope.own===brand||!hope.own)?hope.id:null);if(!W)return false;
 m.sides[1]=[W.id];m.type='singles';m.winner=0;m.fin='clean';delete m.ri;m.open.who=W.id;m.open.fa=!W.own;
 const v=ocVerdict(I,W,hope);m.open.v=v.k;m.open.vt=v.t;m.open.fans=v.fans;
 const ev=evNew(m);ev.stars+=v.st;ev.notes.push(`🎤 Open challenge: ${v.t}${v.st?` (${v.st>0?'+':'−'}${Math.abs(v.st)===.5?'½':'¼'}★)`:''}`);
 if(m.open.fa)ev.notes.push(`🆕 ${W.name} isn't signed anywhere — this is their audition.`);
 if(auto)ocCall(m,'free');return true}
function ocContest(m){const I=S.w[m.sides[0][0]],W=S.w[m.sides[1][0]];const sc=(w,b)=>ocLvl(w)+(w.mom||0)*2+R(0,22)+b;return sc(W,0)>sc(I,3)?1:0}
/* the producer's call on the finish */
function ocCall(m,k){const ev=evNew(m);const I=S.w[m.sides[0][0]],W=S.w[m.sides[1][0]];
 if(k==='issuer'){m.winner=0;m.fin='clean';ev.notes.push(`🏁 You had ${I.name} hold the line.`)}
 else if(k==='answer'){m.winner=1;m.fin=finWhy(m,'upset')?'clean':'upset';ev.notes.push(`🏁 You put ${W.name} over${m.fin==='upset'?' — what an upset':''}.`)}
 else{m.winner=ocContest(m);m.fin='clean';ev.stars+=.25;ev.notes.push(`🏁 No script for the finish — they went out and fought for it (+¼★). ${S.w[m.sides[m.winner][0]].name} wins.`)}
 m.open.called=k}
/* after the match airs: a free agent who impressed can be signed at a discount for a week */
function ocAfter(b,m,res,notes){if(!m.open||!m.open.who)return;const W=S.w[m.open.who];if(!W)return;
 if(m.open.fans)S.fans[b]=Math.max(50000,(S.fans[b]||0)+m.open.fans);
 if(!m.open.fa||W.own)return;const won=m.sides[m.winner]&&m.sides[m.winner].includes(W.id);
 if(m.title&&won&&S.titles[m.title]&&S.titles[m.title].holders.includes(W.id))W.ocKeep=AW();
 if(res.stars>=3||won){S.ocOffer={id:W.id,cost:Math.max(5,Math.round(signCost(W)*OC_OFFER)),w:AW()};
  notes.push(`📝 ${W.name} made an impression. The locker room wants them to stay — you can sign them at a discount (${money(S.ocOffer.cost)}) this week.${W.ocKeep?' They\'re holding your title, so sign them or it will be vacated.':''}`)}
 else notes.push(`👋 ${W.name} heads back to free agency.`)}
function ocOfferLive(){const o=S.ocOffer;if(!o||!S.w[o.id]||S.w[o.id].own||AW()>o.w+1){if(o)S.ocOffer=null;return null}return o}
function ocSign(){if(typeof mpLocked==='function'&&mpLocked())return;const o=ocOfferLive();if(!o)return closeModal();const w=S.w[o.id];
 if(ownList('p').length>=30)return toast('Your roster is full (30).');if(S.money.p<o.cost)return toast('Not enough money.');
 S.money.p-=o.cost;w.sal=mkt(w);w.own='p';w.con=26;w.mor=85;w.fee=0;delete w.ocKeep;if(S.fa)delete S.fa[w.id];S.ocOffer=null;
 news(`✍️ ${S.gm} signed ${w.name} after their open challenge.`);save();closeModal();render();toast(`${w.name} signed!`)}
function ocPass(){const o=S.ocOffer;if(o&&S.w[o.id]){const w=S.w[o.id];delete w.ocKeep}S.ocOffer=null;save();render();if(typeof openBrief==='function')openBrief()}
function ocBrief(){const o=ocOfferLive();if(!o)return [];const w=S.w[o.id];
 return [{i:'📝',t:'Open challenge contract offer',tag:'This week only',rows:[`<div class="brow"><div class="row sb"><span>${face(w)} <b>${esc(w.name)}</b> · POP ${Math.round(w.pop)}<br><span class="muted tiny">Usually ${money(signCost(w))} to sign — yours for ${money(o.cost)}${w.ocKeep?' · holding your title: sign or it\'s vacated':''}</span></span></div><div class="row" style="margin-top:6px"><button class="mini" onclick="ocSign()">Sign ${money(o.cost)}</button><button class="mini" onclick="ocPass()">Pass</button></div></div>`]}]}
/* ---- the live reveal ---- */
let OCL=null;
function renderOC(){const {m}=OCL;const I=S.w[m.sides[0][0]],W=S.w[m.sides[1][0]];const hope=m.open.hope&&S.w[m.open.hope];
 const hd=liveHd(OCL.show,`Match ${OCL.n}${OCL.main?' · Main event':''}`,`${m.title&&S.titles[m.title]?esc(S.titles[m.title].n)+' title · ':''}Open challenge`,[[I],[W]],'',true);
 const reveal=`<p class="scene">${esc(I.name)} grabs the mic: "Anybody. Anytime. Come and get it."${hope?` The crowd is chanting for ${esc(hope.name)}…`:''}<br><br>The lights go out. The music hits. It's <b>${esc(W.name)}</b>!${m.open.fa?' (A free agent!)':''}</p><div class="note">${m.open.v==='dream'?'🤯':m.open.v==='big'?'🔥':m.open.v==='ok'?'👍':'😐'} ${esc(m.open.vt)}</div>`;
 if(OCL.out)return openModal(liveHd(OCL.show,`Match ${OCL.n}${OCL.main?' · Main event':''}`,'Open challenge',[[I],[W]],'',true)+(typeof pickedStrip==='function'?pickedStrip(OCL.pick):'')+`<div class="outcome ok">${esc(OCL.out)}</div><button class="btn" onclick="liveNext()">${OCL.last?'Finish the show':'Continue the show ▸'}</button>`);
 const up=ocLvl(W)<ocLvl(I)-6;const ch=[
  {k:'issuer',t:`${I.name} wins — the challenge stands`,d:'✅ Guaranteed · 🛡️ Plays it safe',},
  {k:'answer',t:`${W.name} wins — ${up?'shock the world':'they earned it'}`,d:`✅ Guaranteed · 👍 ${up?'A huge night for the underdog':'Makes the answerer'}${m.title?' · the title changes hands':''}`},
  {k:'free',t:'No script — let them fight for it',d:'🎲 Anyone could win · 🔥 Big payoff'}];
 openModal(hd+reveal+callBar('🏁 Call the finish','The challenge has been answered. How does this one end?')+ch.map((c,i)=>`<button class="choice" onclick="ocChoose('${c.k}')"><span class="key"><span>${'ABC'[i]}</span></span><div>${esc(c.t)}</div><div class="muted tiny">${c.d}</div></button>`).join(''))}
function ocChoose(k){if(!OCL||OCL.out)return;const go=p=>{if(!OCL||OCL.out)return;OCL.pick=p;const m=OCL.m;ocCall(m,k);const W=S.w[m.sides[m.winner][0]];OCL.out=k==='free'?`No script. ${W.name} wins it the hard way.`:`${W.name} goes over.`;renderOC()};typeof pickFlash==='function'?pickFlash(go):go(null)}
