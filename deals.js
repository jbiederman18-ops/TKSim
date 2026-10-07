/* Tony Khan Simulator — Contracts with strings attached (v108).
   Stars don't just sign for a number any more. An offer is a package: a signing bonus, a weekly salary, and promises —
   creative control, main event spots, a title shot, a place on every PPV. Every wrestler wants different things
   (a big star wants control, a hungry midcarder wants main events), so the best offer isn't always the biggest one.
   - Free agents (popularity 55+): you send a sealed offer. Solo, the rival may send one too and the wrestler picks on
     the spot. In a league, every other GM can send one sealed counter before the week airs; the wrestler picks when
     it does (and on party night the TV reveals every offer). Smaller names still sign on the spot.
   - Re-signing: the wrestler makes demands. Agree to some or all, or counter on money. They take it, counter back or
     walk away, depending on their morale, how hot your show is and whether you've kept your word before.
   - Promises are contract terms. Keep them and everyone's happy; break them and morale drops, and a wrestler who's
     been burned three times may walk out. Creative control is shown on the card before you go live: book someone
     with it to lose and they'll fight the finish — about half the time they go over anyway.
   Loaded before the main script; everything here only runs once a game is going. */
'use strict';
const OFFER_POP=55,CC_MAX=3,CC_WEEKS=12;
const ccOn=w=>!!(w&&w.deal&&w.deal.cc&&(w.deal.cc===1||w.deal.cc>=AW()));
function ccCount(b){return ownList(b).filter(ccOn).length}
/* a brand can only have so many people with a say in their finishes */
function ccRoom(w,b){return ccOn(w)&&w.own===b||ccCount(b)<CC_MAX}
const PERKS={
 cc:{i:'🎬',n:'Creative control',d:"They won't agree to lose. Book them to lose and they'll fight the finish.",v:.22},
 me:{i:'⭐',n:'Main event spots',d:'The main event in 2 of their first 4 shows.',v:.14},
 shot:{i:'🏆',n:'Title shot',d:'A title match by an upcoming PPV.',v:.16},
 ppv:{i:'📺',n:'Every PPV',d:'On every PPV card for the rest of the season.',v:.08}};
const PERK_K=['cc','me','shot','ppv'];
function perkDesc(k){if(k!=='shot')return PERKS[k].d;const wk=wkOf(dealShotBy());return `A title match by ${PPVS[wk]?PPVS[wk]+' (week '+wk+')':'week '+wk}.`}
const DL_BONUS=[.8,1,1.25,1.5],DL_SAL=[.9,1,1.2,1.4],NG_BONUS=[.7,.85,1],NG_SAL=[.85,.93,1];
let DL=null,GL_OK=false,DEAL_OUT=[];

/* ---------- what a wrestler wants (the same for everyone, every time) ---------- */
function dealWants(w){const r=seeded(w.id+'|wants');const champ=typeof isChamp==='function'&&isChamp(w.id);
 return {money:.75+r()*.5+(w.pop<55?.2:0),
  cc:(w.pop>=85?1.4:w.pop>=78?.8:.3)+r()*.5-.2,
  me:(w.pop>=88?.8:w.pop>=62?1.3:.7)+r()*.4-.2,
  shot:(champ?.3:w.pop>=58?1.25:.7)+r()*.4-.2,
  ppv:(hasT(w,'bigm')?1.3:.8)+r()*.4-.2}}
function dealWantList(w){const W=dealWants(w);return PERK_K.filter(k=>W[k]>=1.05).sort((a,b)=>W[b]-W[a])}
function dealHints(w){const W=dealWants(w);const l=dealWantList(w).slice(0,2).map(k=>`${PERKS[k].i} ${k==='cc'?'Wants a say in their finishes':k==='me'?'Wants to main event':k==='shot'?'Wants a title shot':'Wants the big stage'}`);
 if(W.money>=1.05)l.unshift('💰 Wants to get paid');if(!l.length)l.push('🤝 Open to a fair offer');return l}
/* how hot a show is compared with the rest of the league (or the rival) */
function dealShow(b){const ks=brands();const a=avg(ks.map(k=>S.fans[k]||0))||1;return clamp(((S.fans[b]||0)/a-1)*.3,-.12,.12)}
function dealRaw(o,B0,S0){return .5*o.bonus/Math.max(1,B0)+.5*o.sal/Math.max(1,S0)}
function dealPerkU(w,perks){const W=dealWants(w);return (perks||[]).reduce((s,k)=>s+(PERKS[k]?PERKS[k].v*W[k]:0),0)}
/* how good a free-agent offer looks to them (1 = a fair market deal from an average show) */
function dealU(w,o,b){const W=dealWants(w);return 1+(dealRaw(o,signCost(w),mkt(w))-1)*W.money+dealPerkU(w,o.perks)+dealShow(b)}
const dealWord=u=>u<.9?['bad','Not interested']:u<1?['warnt','Lukewarm']:u<1.15?['good','Interested']:['good','Very interested'];
function dealSum(o){return `${money(o.bonus)} bonus · ${money(o.sal)}/wk${(o.perks||[]).length?' · '+o.perks.map(k=>PERKS[k].i+' '+PERKS[k].n).join(' · '):''}`}

/* ---------- contract terms ---------- */
function dealShotBy(){for(let x=S.week+3;x<=SEASON;x++)if(PPVS[x])return awBase()+x;return awBase()+SEASON}
function dealTerms(w,perks){const d={};(perks||[]).forEach(k=>{
  if(k==='cc')d.cc=AW()+CC_WEEKS;else if(k==='me')d.me={need:2,got:0,by:AW()+3};else if(k==='shot')d.shot={by:dealShotBy()};else if(k==='ppv')d.ppv=S.season});
 if(Object.keys(d).length)w.deal=d;else delete w.deal}
function dealActive(w){const d=w&&w.deal;if(!d)return [];const l=[];if(ccOn(w))l.push('cc');if(d.me)l.push('me');if(d.shot)l.push('shot');if(d.ppv===S.season)l.push('ppv');return l}
const wkOf=aw=>aw-awBase();
function dealTermTxt(w,k){const d=w.deal||{};
 if(k==='cc')return `🎬 Creative control — won't agree to lose${d.cc>1?' (until week '+wkOf(d.cc)+')':''}`;
 if(k==='me')return `⭐ Main event ${d.me.need-d.me.got} more time${d.me.need-d.me.got>1?'s':''} by week ${wkOf(d.me.by)}`;
 if(k==='shot'){const wk=wkOf(d.shot.by);return `🏆 A title match by ${PPVS[wk]?esc(PPVS[wk])+' (week '+wk+')':'week '+wk}`}
 return '📺 On every PPV card this season'}
function breach(w,b,what,notes){w.mor=clamp(w.mor-15,0,100);w.trust=(w.trust||0)+1;
 const n=`💔 ${w.name}: ${what} — that was in the contract (morale −15${w.trust>=2?', and they\'re losing trust in '+nameOf(b):''}).`;notes.push(n);if(b==='p'||ON())news(n);
 if(w.trust>=3&&Math.random()<.5)leave(w,`😤 ${w.name} walked out on ${nameOf(b)} after one broken promise too many.`,notes)}
/* a promise kept: they're happier, and a little trust comes back */
function kept(w,what,notes){w.mor=clamp(w.mor+6,0,100);if(w.trust)w.trust--;notes.push(`✅ ${w.name} ${what} (morale +6).`)}
/* after a brand's show airs: who main-evented, who had a title match, who was on the card */
function dealAir(b,info,show,notes){if(!(b==='p'||ON()))return;const now=AW();
 ownList(b).forEach(w=>{const d=w.deal;if(!d)return;
  if(d.cc&&d.cc!==1&&d.cc<now+1&&w.own===b){delete d.cc;notes.push(`🎬 ${w.name}'s creative control clause has run out.`)}
  /* hurt at the deadline? that's nobody's fault: the clock waits until they're back */
  if(w.inj){if(d.me&&now>=d.me.by)d.me.by=now+w.inj+2;if(d.shot&&now>=d.shot.by)d.shot.by=now+w.inj+3}
  if(d.me){if(info.me.includes(w.id))d.me.got++;if(d.me.got>=d.me.need){kept(w,'got the main event spots they were promised',notes);delete d.me}else if(now>=d.me.by&&w.own===b){delete d.me;breach(w,b,'never got the main event spots they were promised',notes)}}
  if(w.own!==b)return;
  if(d.shot){if(info.ttl.includes(w.id)){kept(w,'got the title shot in their contract',notes);delete d.shot}else if(now>=d.shot.by){delete d.shot;breach(w,b,'no title shot by the deadline',notes)}}
  if(w.own!==b)return;
  if(d.ppv===S.season&&show.ppv&&!w.inj&&!info.on.includes(w.id))breach(w,b,`left off the ${show.name} card`,notes);
  if(w.own===b&&!ccOn(w)&&!d.me&&!d.shot&&d.ppv!==S.season)delete w.deal})}

/* ---------- creative control ---------- */
function ccLosers(m,b){if(!m||!m.sides||m.nc||m.type==='open'&&!(m.open&&m.open.who))return [];/* v140: in a 3+ person match only the one taking the pin is really losing */const ids=m.sides.flat().length>=3&&typeof pinOf==='function'?[pinOf(m)].filter(Boolean):m.sides.flatMap((s,i)=>i===m.winner?[]:s);return ids.map(id=>S.w[id]).filter(w=>w&&w.own===b&&ccOn(w)&&!w.inj)}
function ccTag(m){const l=ccLosers(m,'p');return l.length?`<span class="tg bad">🎬 ${esc(l.map(w=>w.name.split(' ').slice(-1)[0]).join(', '))} won't agree to lose</span>`:''}
/* at air time: they either take over the finish or do the job under protest */
function ccFinish(m,b){if(!(b==='p'||ON()))return null;const l=ccLosers(m,b);if(!l.length)return null;const w=l.sort((x,y)=>y.pop-x.pop)[0];
 if(Math.random()<.5){m.winner=m.sides.findIndex(s=>s.includes(w.id));return {pen:.25,note:`🎬 Creative control: ${w.name} refused the finish and went over instead (−¼★).`}}
 w.mor=clamp(w.mor-18,0,100);w.trust=(w.trust||0)+1;return {pen:0,note:`🎬 ${w.name} did the job under protest — they have creative control and you overruled them (morale −18).`}}
function ccIssues(c){return (c||[]).filter(sl=>sl&&sl.k==='match'&&sl.d).flatMap(sl=>ccLosers(sl.d,'p').map(w=>({w,m:sl.d})))}
/* checked when you lock in or go live */
function ccGate(c){if(GL_OK){GL_OK=false;return false}const l=ccIssues(c);if(!l.length)return false;
 openModal(`<div class="h mhd">🎬 Creative control</div>${l.map(x=>`<div class="card warn"><b>${esc(x.w.name)}</b> is booked to lose to ${esc(sideName(x.m.sides[x.m.winner]))}, but their contract gives them creative control. They won't go along with it quietly: about half the time they change the finish and go over (a messier match). Otherwise they do the job under protest and morale drops hard.</div>`).join('')}
 <button class="btn" onclick="closeModal();go('book')">Change the card</button><button class="btn sec" onclick="GL_OK=true;closeModal();goLive()">Go live anyway</button>`);return true}

/* ---------- what's owed this week (Book screen + briefing) ---------- */
function dealOwed(){const out=[];ownList('p').forEach(w=>{dealActive(w).forEach(k=>{if(k!=='cc')out.push({w,k})})});return out}
function dealBookCard(c){const sh=curShow();const on=new Set();let meIds=[];const ms=(c||[]).filter(sl=>sl.k==='match'&&sl.d&&sl.d.sides);
 (c||[]).forEach(sl=>{if(!sl.d)return;if(sl.k==='match'&&sl.d.sides)sl.d.sides.flat().forEach(id=>on.add(id));if(sl.k==='promo'){on.add(sl.d.a);if(sl.d.b)on.add(sl.d.b)}if(sl.k==='chal')on.add(sl.d.c)});
 if(ms.length)meIds=ms[ms.length-1].d.sides.flat();
 const rows=dealOwed().filter(x=>!x.w.inj).map(({w,k})=>{const d=w.deal;let ok=false,urgent=false;
  if(k==='me'){ok=meIds.includes(w.id);urgent=d.me.need-d.me.got>=d.me.by-AW()+1}
  else if(k==='shot'){ok=ms.some(sl=>sl.d.title&&sl.d.sides.flat().includes(w.id))||(c||[]).some(sl=>sl.k==='chal'&&sl.d&&sl.d.c===w.id);urgent=AW()>=d.shot.by}
  else if(k==='ppv'){if(!sh.ppv)return '';ok=on.has(w.id);urgent=true}
  return `<div style="margin:3px 0">${ok?'✅':urgent?'⚠️':'📜'} <b>${esc(w.name)}</b> · ${dealTermTxt(w,k)}${ok?' <span class="muted tiny">— booked tonight</span>':urgent?' <span class="bad tiny">— due tonight</span>':''}</div>`}).filter(Boolean);
 const cc=ownList('p').filter(w=>ccOn(w)&&!w.inj&&on.has(w.id));
 if(!rows.length&&!cc.length)return '';
 return `<div class="card ${rows.some(r=>r.includes('⚠️'))?'warn':''}"><div class="h small">📜 Contract promises</div>${rows.join('')}${cc.length?`<div class="muted tiny" style="margin-top:4px">🎬 Creative control on tonight's card: ${cc.map(w=>esc(w.name)).join(', ')} — book them to win, or expect a fight over the finish.</div>`:''}</div>`}

/* ---------- making an offer to a free agent ---------- */
function dealNeedsOffer(w){return !!w&&!w.cw&&w.pop>=OFFER_POP&&S.phase==='season'}
function offerOf(id){return S.offers&&S.offers[id]||null}
/* v126: while another GM is still booking (league weeks booked at the same time, or party night), smaller names don't
   go to whoever taps first: you send a quick sealed offer on standard terms, anyone still booking can counter, and the
   wrestler picks when the week airs (the hotter show usually wins). With nobody left to compete, they sign on the spot. */
function dealQuickNeeded(w){if(!w||w.own||w.cw||!ON()||S.phase!=='season'||dealNeedsOffer(w)||!(simOn()||partyOn()))return false;
 if(offerOf(w.id))return true;const o=S.online||{};return localSeats().some(k=>k!=='p'&&!(o.booked||{})[k])}
function dealQuick(id){if(mpLocked())return;const w=S.w[id];if(!w||w.own)return;const c=signCost(w);if(S.money.p<c)return toast('Not enough money.');if(ownList('p').length>=30)return toast('Your roster is full (30).');
 if(w.snub&&w.snub[canonKey('p')]>=AW())return toast(`${w.name} isn't taking your calls this week — try again next week.`);
 S.offers=S.offers||{};const ex=S.offers[id];const off=ex||(S.offers[id]={due:AW(),by:{}});off.by=off.by||{};const counter=Object.keys(off.by).some(k=>k!=='p');
 off.by.p={bonus:c,sal:mkt(w),perks:[],quick:1,at:Date.now()};S.fa=S.fa||{};S.fa[id]=Math.max(S.fa[id]||0,off.due);
 news(counter?`📨 ${S.gm} sent a counter-offer for ${w.name}.`:`📨 ${S.gm} made an offer to free agent ${w.name}.`);
 save();closeModal();render();toast(`📨 Offer sent. ${w.name} decides when week ${wkOf(off.due)} airs.`)}
function dealQuickHtml(w){const id=w.id,mine=myBid(id),ofr=offerOf(id),others=ofr?Object.keys(ofr.by||{}).filter(k=>k!=='p').length:0;
 const note=`<div class="muted center tiny">${mine?`Your offer is in. ${esc(w.name)} decides when the week airs`:'Another GM is still booking, so this is a sealed offer'}${others?` — <b class="gold">${others} other offer${others>1?'s are':' is'} in</b>`:''}. If more than one GM wants ${esc(w.name)}, they usually pick the hotter show.</div>`;
 return mine?`<button class="btn sec" onclick="dealWithdraw('${id}')">Withdraw my offer</button>${note}`:`<button class="btn" onclick="dealQuick('${id}')">📨 ${others?'Send a counter-offer':'Make an offer'} · ${money(signCost(w))}</button>${note}`}
function myBid(id){const o=offerOf(id);return o&&o.by&&o.by.p||null}
function dealOffer(id){if(mpLocked())return;const w=S.w[id];if(!w||w.own)return;if(!onMarket(w)&&!offerOf(id))return toast(`${w.name} isn't on the market right now.`);
 if(w.snub&&w.snub[ON()?canonKey('p'):'p']>=AW())return toast(`${w.name} isn't taking your calls this week — try again next week.`);
 const mine=myBid(id);DL={id,mode:'sign',bi:1,si:1,perks:new Set(mine?mine.perks:[])};
 if(mine){DL.bi=Math.max(0,DL_BONUS.findIndex(x=>Math.round(signCost(w)*x)===mine.bonus));DL.si=Math.max(0,DL_SAL.findIndex(x=>Math.round(mkt(w)*x)===mine.sal))}
 renderDeal()}
function dlOffer(){const w=S.w[DL.id];const B=DL.mode==='sign'?signCost(w):DL.ask.bonus,Sl=DL.mode==='sign'?mkt(w):DL.ask.sal;const bx=DL.mode==='sign'?DL_BONUS:NG_BONUS,sx=DL.mode==='sign'?DL_SAL:NG_SAL;
 return {bonus:Math.max(1,Math.round(B*bx[DL.bi])),sal:Math.max(1,Math.round(Sl*sx[DL.si])),perks:PERK_K.filter(k=>DL.perks.has(k)&&(k!=='cc'||ccRoom(w,'p')))}}
function dlSet(k,v){if(!DL)return;if(k==='perk'&&v==='cc'&&!DL.perks.has('cc')&&!ccRoom(S.w[DL.id],'p'))return toast(`You already have ${CC_MAX} wrestlers with creative control.`);if(k==='perk'){DL.perks.has(v)?DL.perks.delete(v):DL.perks.add(v)}else DL[k]=v;renderDeal()}
function dlChips(arr,cur,key,base,unit){return `<div class="chips">${arr.map((x,i)=>`<button class="chip ${cur===i?'on':''}" onclick="dlSet('${key}',${i})">${money(Math.max(1,Math.round(base*x)))}${unit}</button>`).join('')}</div>`}
function renderDeal(){if(!DL)return;const w=S.w[DL.id];if(!w)return closeModal();if(DL.mode==='neg')return renderNeg();
 const o=dlOffer(),u=dealU(w,o,'p'),[cls,word]=dealWord(u);const W=dealWants(w);const mine=myBid(DL.id),ofr=offerOf(DL.id);
 const others=ofr?Object.keys(ofr.by||{}).filter(k=>k!=='p'):[];const due=ofr?wkOf(ofr.due):dealDue();
 const lg=ON()?`<p class="muted tiny">Sealed bids: every other GM can send one counter before week ${due} airs. Nobody sees the numbers — ${esc(w.name)} picks when the week airs.${others.length?` <b class="gold">${others.length} other offer${others.length>1?'s are':' is'} in.</b>`:''}</p>`:`<p class="muted tiny">Sealed bid: ${esc(S.rival)} may make an offer too. ${esc(w.name)} picks the best package — money isn't everything.</p>`;
 openModal(`<div class="h mhd">📝 Offer to ${esc(w.name)}</div><div class="muted">POP ${Math.round(w.pop)} · asking ${money(signCost(w))} up front and ${money(mkt(w))}/wk</div>
 <div class="tags" style="margin:8px 0">${dealHints(w).map(h=>`<span class="tg">${h}</span>`).join(' ')}</div>
 <div class="h small mt">Signing bonus</div>${dlChips(DL_BONUS,DL.bi,'bi',signCost(w),'')}
 <div class="h small mt">Weekly salary</div>${dlChips(DL_SAL,DL.si,'si',mkt(w),'/wk')}
 <div class="h small mt">Promises</div>${PERK_K.map(k=>k==='cc'&&!ccRoom(w,'p')?`<div class="choice" style="opacity:.55"><span class="key"><span>🎬</span></span><div><b>Creative control</b><div class="muted tiny">Your locker room already has ${CC_MAX} people with creative control — that's the limit.</div></div></div>`:`<button class="choice ${DL.perks.has(k)?'on':''}" onclick="dlSet('perk','${k}')" style="${DL.perks.has(k)?'box-shadow:inset 0 0 0 2px var(--gold)':''}"><span class="key"><span>${DL.perks.has(k)?'✓':PERKS[k].i}</span></span><div><b>${PERKS[k].n}</b>${W[k]>=1.05?' <span class="tg good">they want this</span>':''}<div class="muted tiny">${esc(perkDesc(k))}</div></div></button>`).join('')}
 <div class="card"><div class="row sb"><span>How it looks to them</span><b class="${cls==='bad'?'bad':cls==='warnt'?'gold':'good'}">${word}</b></div><div class="muted tiny">${u<.95?"As it stands, they'd likely turn this down.":'They\'d sign this if nobody beats it.'} Bonus due on signing · you have ${money(S.money.p)}.</div></div>
 ${lg}<button class="btn" ${S.money.p<o.bonus?'disabled':''} onclick="dealSend()">${mine?'Update my sealed offer':'Send sealed offer'} · ${money(o.bonus)}</button>${mine?`<button class="btn sec" onclick="dealWithdraw('${DL.id}')">Withdraw my offer</button>`:''}<button class="btn ghost" onclick="DL=null;closeModal()">Cancel</button>`)}
/* the week a league offer resolves: this week if every other GM can still answer before it airs, otherwise next week */
function dealDue(){if(!ON()||partyOn())return AW();const o=S.online;const others=localSeats().filter(k=>k!=='p');return others.every(k=>!(o.booked||{})[k])?AW():AW()+1}
function dealSend(){if(!DL||mpLocked())return;const w=S.w[DL.id];const o=dlOffer();if(S.money.p<o.bonus)return toast('Not enough money.');if(ownList('p').length>=30)return toast('Your roster is full (30).');
 if(!ON())return dealSolo(w,o);
 S.offers=S.offers||{};const ex=S.offers[w.id];const first=!ex||!Object.keys(ex.by||{}).length;const off=ex||(S.offers[w.id]={due:dealDue(),by:{}});
 off.by.p=Object.assign(o,{at:Date.now()});S.fa=S.fa||{};S.fa[w.id]=Math.max(S.fa[w.id]||0,off.due);
 if(first)news(`📨 ${S.gm} made a sealed offer to free agent ${w.name}. Other GMs can counter before week ${wkOf(off.due)} airs.`);else if(!ex.by.p)news(`📨 ${S.gm} sent a sealed counter for ${w.name}.`);
 DL=null;save();closeModal();render();toast(`📨 Offer sent. ${w.name} decides when week ${wkOf(off.due)} airs.`)}
function dealWithdraw(id){if(mpLocked())return;const o=offerOf(id);if(!o||!o.by.p)return;delete o.by.p;if(!Object.keys(o.by).length)delete S.offers[id];DL=null;save();closeModal();render();toast('Offer withdrawn.')}

/* solo: the rival may bid too; the wrestler picks right away */
function dealAiBid(w){if(ownList('ai').length>=30||w.pop<60)return null;const c=signCost(w);if(S.money.ai<c)return null;
 if(Math.random()>clamp((w.pop-50)/45,.12,.8))return null;const W=dealWants(w);const smart=(aiq('ai').smart||0)*.5+.35;
 const perks=PERK_K.filter(k=>W[k]>=1.05&&Math.random()<smart&&(k!=='cc'||Math.random()<.45));
 const o={bonus:Math.round(c*R(.95,1.35)),sal:Math.round(mkt(w)*R(.95,1.25)),perks};if(S.money.ai<o.bonus)o.bonus=S.money.ai;return o}
function dealWhy(w,win,lose){if(!lose)return '';const W=dealWants(w);const rw=dealRaw(win.o,signCost(w),mkt(w)),rl=dealRaw(lose.o,signCost(w),mkt(w));
 const pk=PERK_K.filter(k=>win.o.perks.includes(k)&&!lose.o.perks.includes(k)).sort((a,b)=>W[b]-W[a])[0];
 if(pk&&W[pk]>=1)return `the ${PERKS[pk].n.toLowerCase()}`;if(rw>rl+.05)return 'the bigger paycheck';if(dealShow(win.b)>dealShow(lose.b)+.02)return 'the hotter show';if(win.o.quick&&lose.o.quick)return 'a gut feeling — it was that close';return 'the better overall package'}
function dealSign(w,b,o){if(o.perks.includes('cc')&&ccCount(b)>=CC_MAX&&(b==='p'||ON()))o=Object.assign({},o,{perks:o.perks.filter(k=>k!=='cc')});S.money[b]-=o.bonus;w.sal=o.sal;w.own=b;w.con=26;w.mor=clamp(78+o.perks.length*4,0,95);w.fee=0;if(S.fa)delete S.fa[w.id];if(S.phase==='season')w.deb=AW();dealTerms(w,o.perks)}
function dealSolo(w,o){const ai=dealAiBid(w);const bids=[{b:'p',o,u:dealU(w,o,'p')+R(-.02,.02)}];if(ai)bids.push({b:'ai',o:ai,u:dealU(w,ai,'ai')+R(-.02,.02)});
 bids.sort((x,y)=>y.u-x.u);const top=bids[0];const ok=top.u>=.95;DL=null;
 if(ok){dealSign(w,top.b,top.o);news(top.b==='p'?`✍️ ${S.gm} signed free agent ${w.name}${ai?` after a bidding war with ${S.rival}`:''}.`:`✍️ ${S.rival} won the bidding war for ${w.name}.`)}
 else{w.snub=Object.assign(w.snub||{},{p:AW()})}
 save();render();
 const card=x=>`<div class="card ${ok&&x===top?'mine':''}"><div class="row sb"><b>${x.b==='p'?esc(S.gm):esc(S.rival)}</b>${ok&&x===top?'<span class="tg good">Signed</span>':''}</div><div class="muted tiny">${dealSum(x.o)}</div></div>`;
 openModal(`<div class="h mhd">${ai?'🤝 The sealed offers are in':'📝 '+esc(w.name)+' has an answer'}</div>${bids.map(card).join('')}
 <p>${ok?(top.b==='p'?`<b class="gold">${esc(w.name)} signs with you!</b>${ai?` They went with ${dealWhy(w,top,bids[1])}.`:''} Put them on a show in the next few weeks for a debut pop.`:`<b>${esc(w.name)} signs with ${esc(S.rival)}</b> — they went with ${dealWhy(w,top,bids[1])}.`):`${esc(w.name)} turned it down. They won't take your calls again until next week.`}</p>
 ${ok&&top.b==='p'&&o.perks.length?`<p class="muted tiny">Now in their contract: ${o.perks.map(k=>PERKS[k].i+' '+PERKS[k].n).join(', ')}. Keep your word — you'll see what's owed on the Book screen.</p>`:''}<button class="btn" onclick="closeModal()">OK</button>`)}

/* league: offers that are due get decided when the week airs (runs inside the airing, so every phone agrees) */
function dealResolveAll(notes){DEAL_OUT=[];if(!S.offers||!ON())return;const now=AW();
 Object.keys(S.offers).forEach(id=>{const off=S.offers[id];if((off.due||0)>now)return;delete S.offers[id];const w=S.w[id];if(!w)return;
  if(w.own){return}
  const bids=Object.keys(off.by||{}).map(b=>({b,o:off.by[b]})).filter(x=>localSeats().includes(x.b));
  const ok=bids.filter(x=>(S.money[x.b]||0)>=x.o.bonus&&ownList(x.b).length<30);
  ok.forEach(x=>x.u=dealU(w,x.o,x.b)+R(-.02,.02));ok.sort((a,b)=>b.u-a.u||(a.o.at||0)-(b.o.at||0));const top=ok[0];
  const rec={id,name:w.name,bids:bids.map(x=>({b:canonKey(x.b),s:dealSum(x.o)})),win:null,why:''};
  if(top&&(top.u>=.95||top.o.quick)){dealSign(w,top.b,top.o);rec.win=canonKey(top.b);rec.why=bids.length>1?dealWhy(w,top,ok[1]):'';
   const n=`✍️ ${w.name} signs with ${nameOf(top.b)}${bids.length>1?` — picked from ${bids.length} sealed offers for ${rec.why}`:''}.`;notes.push(n);news(n)}
  else{const n=`🚫 ${w.name} turned down ${bids.length>1?'every offer':'the offer from '+nameOf(bids[0]&&bids[0].b||'p')} and stays a free agent.`;notes.push(n);news(n);
   bids.forEach(x=>{w.snub=w.snub||{};w.snub[canonKey(x.b)]=now+1})}
  DEAL_OUT.push(rec)})}
function dealLocal(d){return Object.assign({},d,{win:d.win?localKey(d.win):null,bids:d.bids.map(x=>Object.assign({},x,{b:localKey(x.b)}))})}

/* ---------- re-signing: their demands, your answer ---------- */
function dealAsk(w){const m=1+(w.pop>=80?.15:w.pop>=70?.08:0)-(w.mor>=80?.08:0)+(w.mor<35?.15:0)-dealShow('p')*.5;
 const have=dealActive(w);const n=w.pop>=72?2:w.pop>=58?1:0;
 return {bonus:Math.max(1,Math.round(resignCost(w)*m)),sal:Math.max(sal(w),Math.round(askSal(w)*m)),perks:dealWantList(w).filter(k=>(!have.includes(k)||k==='cc')&&dealWants(w)[k]>=1.15).slice(0,n)}}
function dealNegotiate(id){if(mpLocked())return;const w=S.w[id];if(!w||w.own!=='p')return;
 if(w.neg&&w.neg.no&&w.neg.no>AW())return toast(`${w.name} walked away from the table. Try again in week ${wkOf(w.neg.no)}.`);
 if(!w.neg||w.neg.no||w.neg.wk!==AW())w.neg={r:1,wk:AW(),ask:dealAsk(w)};
 DL={id,mode:'neg',bi:2,si:2,ask:w.neg.ask,perks:new Set(w.neg.ask.perks.filter(k=>k!=='cc'||ccRoom(w,'p')))};renderDeal()}
function negLenient(w){return .06+(w.mor-55)/250+dealShow('p')+(w.con>4?.03:0)-.06*(w.trust||0)-(w.pop>=80?.04:0)}
function negU(w,o,ask){const W=dealWants(w);return 1+(dealRaw(o,ask.bonus,ask.sal)-1)*W.money-.5*dealPerkU(w,ask.perks.filter(k=>!o.perks.includes(k)))}
function negWord(w,o,ask){if(o.bonus>=ask.bonus&&o.sal>=ask.sal&&ask.perks.every(k=>o.perks.includes(k)))return ['good','They\'ll sign'];const g=negU(w,o,ask)-(1-negLenient(w));return g>=0?['good','They should take this']:g>=-.12?['warnt','Might counter']:g>=-.3?['warnt','They\'ll push back']:['bad','Likely walks away']}
function renderNeg(){const w=S.w[DL.id];const ask=DL.ask;const o=dlOffer();const [cls,word]=negWord(w,o,ask);const r=w.neg?w.neg.r:1;
 openModal(`<div class="h mhd">✍️ Re-signing ${esc(w.name)}</div><div class="muted">${Math.max(0,w.con)} week${w.con===1?'':'s'} left · morale ${Math.round(w.mor)}${w.trust?` · ${w.trust} broken promise${w.trust>1?'s':''}`:''}${r>1?` · round ${r} of 3`:''}</div>
 <div class="card"><div class="h small">${r>1?'Their counter':'Their demands'}</div><div>💰 ${money(ask.bonus)} to sign · ${money(ask.sal)}/wk for 26 weeks</div>${ask.perks.map(k=>`<div>${PERKS[k].i} ${PERKS[k].n}</div>`).join('')||'<div class="muted tiny">No special demands.</div>'}</div>
 <div class="h small mt">Signing bonus</div>${dlChips(NG_BONUS,DL.bi,'bi',ask.bonus,'')}
 <div class="h small mt">Weekly salary</div>${dlChips(NG_SAL,DL.si,'si',ask.sal,'/wk')}
 ${ask.perks.includes('cc')&&!ccRoom(w,'p')?`<div class="muted tiny">🎬 You already have ${CC_MAX} wrestlers with creative control, so you can't agree to that one.</div>`:''}${ask.perks.length?`<div class="h small mt">Their demands — tap to agree or refuse</div>${ask.perks.map(k=>`<button class="choice" onclick="dlSet('perk','${k}')" style="${DL.perks.has(k)?'box-shadow:inset 0 0 0 2px var(--gold)':''}"><span class="key"><span>${DL.perks.has(k)?'✓':'✕'}</span></span><div><b>${PERKS[k].n}</b> <span class="tg ${DL.perks.has(k)?'good':'bad'}">${DL.perks.has(k)?'Agreed':'Refused'}</span><div class="muted tiny">${esc(perkDesc(k))}</div></div></button>`).join('')}`:''}
 <div class="card"><div class="row sb"><span>Read of the room</span><b class="${cls==='bad'?'bad':cls==='warnt'?'gold':'good'}">${word}</b></div><div class="muted tiny">Their morale and how hot your show is matter. Bonus due on signing · you have ${money(S.money.p)}.</div></div>
 <button class="btn" ${S.money.p<o.bonus?'disabled':''} onclick="negSend()">${o.bonus===ask.bonus&&o.sal===ask.sal&&o.perks.length===ask.perks.length?'Agree to everything':'Send this offer'} · ${money(o.bonus)}</button><button class="btn ghost" onclick="DL=null;closeModal()">Not now</button>`)}
function negSend(){if(!DL||mpLocked())return;const w=S.w[DL.id];const ask=DL.ask;const o=dlOffer();if(S.money.p<o.bonus)return toast('Not enough money.');
 const u=negU(w,o,ask),need=1-negLenient(w);const r=w.neg?w.neg.r:1;DL=null;
 const all=o.bonus>=ask.bonus&&o.sal>=ask.sal&&ask.perks.every(k=>o.perks.includes(k));
 if(all||u>=need){S.money.p-=o.bonus;w.sal=o.sal;w.con=Math.max(0,w.con)+26;w.mor=clamp(w.mor+(all?12:6),0,100);delete w.neg;dealTerms(w,o.perks);
  news(`✍️ ${w.name} re-signed with ${S.gm}.`);save();render();
  return openModal(`<div class="h mhd">🤝 Deal done</div><p><b>${esc(w.name)}</b> is signed through ${w.con} more weeks at ${money(w.sal)}/wk.</p>${o.perks.length?`<p class="muted tiny">In the contract: ${o.perks.map(k=>PERKS[k].i+' '+PERKS[k].n).join(', ')}. You'll see what's owed on the Book screen.</p>`:''}<button class="btn" onclick="closeModal()">OK</button>`)}
 if(u>=need-.3&&r<3){/* they meet you partway: split the money and dig in on the demand they care about most */
  const W=dealWants(w);const dropped=ask.perks.filter(k=>!o.perks.includes(k)).sort((a,b)=>W[b]-W[a]);const keep=dropped.length&&W[dropped[0]]>=1.3?[dropped[0]]:[];
  const extra=dropped.length&&!keep.length?1.05:1;
  const nx={bonus:Math.max(o.bonus,Math.round((ask.bonus+o.bonus)/2*extra)),sal:Math.max(o.sal,Math.round((ask.sal+o.sal)/2*extra)),perks:o.perks.filter(k=>ask.perks.includes(k)).concat(keep)};
  w.neg={r:r+1,wk:AW(),ask:nx};w.mor=clamp(w.mor-2,0,100);save();
  DL={id:w.id,mode:'neg',bi:2,si:2,ask:nx,perks:new Set(nx.perks)};renderDeal();
  return toast(`${w.name} came back with a counter${keep.length?` — they won't budge on ${PERKS[keep[0]].n.toLowerCase()}`:''}.`)}
 w.neg={no:AW()+2};w.mor=clamp(w.mor-6,0,100);save();render();
 openModal(`<div class="h mhd">🚪 ${esc(w.name)} walks away</div><p>They're not taking that. ${w.con<=2?"Their contract is almost up — if nothing changes, they'll test free agency.":'You can try again in two weeks, but they won\'t come cheaper.'}</p><p class="muted tiny">Morale −6.</p><button class="btn" onclick="closeModal()">OK</button>`)}

/* ---------- briefing section ---------- */
function dealBrief(){const sec=[];const nm=w=>`<a href="#" onclick="closeModal();showW('${w.id}');return false">${esc(w.name)}</a>`;
 if(S.offers&&ON()){const rows=Object.keys(S.offers).map(id=>{const o=S.offers[id],w=S.w[id];if(!w||w.own)return '';const ks=Object.keys(o.by||{});const mine=!!o.by.p;
   return `<div class="row sb brow"><span>${nm(w)} · POP ${Math.round(w.pop)}<br><span class="muted tiny">${ks.length} sealed offer${ks.length>1?'s':''}${mine?' (one is yours)':''} · decides when week ${wkOf(o.due)} airs</span></span><button class="mini" onclick="closeModal();dealOffer('${id}')">${mine?'Revise':'Counter'}</button></div>`}).filter(Boolean);
  if(rows.length)sec.push({i:'📨',t:'Sealed offers on the table',u:rows.length&&Object.values(S.offers).some(o=>!o.by.p&&o.due<=AW()),rows})}
 const owed=dealOwed().filter(({w,k})=>!w.inj&&(k!=='ppv'||curShow().ppv));
 if(owed.length)sec.push({i:'📜',t:'Contract promises',rows:owed.map(({w,k})=>`<div class="brow">${nm(w)} · ${dealTermTxt(w,k)}</div>`)});
 return sec}
function dealRevealHtml(ds){return `<div class="card rv-deal"><div class="h small">🤝 Signing war</div>${ds.map((d,i)=>`<div class="rv-seg" id="rv-d-${i}"><div class="rv-txt">${esc(d.name)}</div>${d.bids.map(x=>`<div class="${x.b===d.win?'gold':'muted'}" style="font-size:.8em">${x.b===d.win?'✍️ ':''}${esc(nameOf(x.b))}: ${esc(x.s)}</div>`).join('')}<div class="note">${d.win?`${esc(d.name)} signs with ${esc(nameOf(d.win))}${d.why?' — for '+esc(d.why):''}.`:`${esc(d.name)} turned everyone down.`}</div></div>`).join('')}</div>`}
