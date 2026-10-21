/* Tony Khan Simulator — backstage confrontations and locker room whispers (v228).
   • Backstage confrontation: real backstage heat (S.beef, not the storyline kind) used to tick quietly until it blew up
     mid-match. Now, when two people on your roster really can't stand each other, it can boil over between shows as a
     front-office decision (it uses the CRISES system, so it shows in Needs your attention and must be settled before the
     show): separate them (real heat cools; a 4-week truce you break by booking them together), let it simmer (real heat
     grows, but so does the storyline), or book them against each other this week (a promised match where the bad blood
     is guaranteed to come out — the existing "real heat" call, with its chance to settle it in the ring).
   • Locker room whisper: now and then someone booked on your card pitches a specific spot for their match — a dive off
     the cage, a new submission, a buddy distracting the referee — chosen from their style, the stipulation and their
     alignment. It shows on their match on the Book screen. Approve it and that match is guaranteed a call in gorilla,
     with their idea as an extra option (big payoff, real risk). Pass and they're a little let down. At most one a week.
   Loaded after morale.js (which also wraps crisisGen) and crowd.js. */
'use strict';
(function(){
const CF_MIN=25,CF_P=.4,CF_GAP=8,TRUCE_WKS=4;
const WS_P=.14;
const last=n=>String(n||'').split(' ').slice(-1)[0];
const morx=(w,d,why)=>{if(!w||!d)return;if(typeof mlog==='function')mlog(w,d,why);else w.mor=clamp(w.mor+d,0,100)};

/* ===================== BACKSTAGE CONFRONTATIONS ===================== */
function cfPair(r){const l=[];for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){const a=r[i],b=r[j];if(a.own!==b.own)continue;const bf=beefOf(a.id,b.id);if(bf<CF_MIN)continue;const k=key(a.id,b.id);if(S.cfLast&&S.cfLast[k]!=null&&AW()-S.cfLast[k]<CF_GAP)continue;l.push([a,b,bf])}
 l.sort((x,y)=>y[2]-x[2]);return l.length?[l[0][0],l[0][1]]:null}
const CF={t:'Backstage confrontation',i:'😤',need:2,
 who:r=>cfPair(r),
 vars:['{A} and {B} had to be pulled apart in catering after a shouting match. Plates went flying.',
  'Agents separated {A} and {B} in the hallway after {A} accused {B} of working stiff on purpose.',
  'A production assistant walked in on {A} and {B} nose to nose in the locker room. Nobody will say what started it.',
  '{A} and {B} got into it in the parking lot. Security stepped in before anybody got hurt.',
  'The whole locker room heard {A} and {B} screaming at each other behind the curtain after the last show.',
  '{B} posted a video mocking {A}, and {A} confronted them about it in front of everyone at the arena.',
  '{A} threw {B}\'s bag out of the locker room. {B} threw it back — through the door.',
  'Two veterans had to step between {A} and {B} at the hotel bar last night. It almost got physical.'],
 text:'{VAR} This isn\'t a storyline — they really can\'t stand each other.',
 ch:[{t:'Separate them — keep them apart for a month',d:'The real heat cools down. Book them together in the next 4 weeks and the truce breaks.',fx:c=>{const k=key(c.A.id,c.B.id);addBeef(c.A.id,c.B.id,-25);S.truce=S.truce||{};S.truce[k]=AW()+TRUCE_WKS;S.cfLast=S.cfLast||{};S.cfLast[k]=AW();morx(c.A,-2,'Kept apart from a rival backstage');morx(c.B,-2,'Kept apart from a rival backstage');
   return `Agents keep ${c.A.name} and ${c.B.name} on opposite sides of the building. Things cool off — as long as you keep them apart for ${TRUCE_WKS} weeks.`}},
  {t:'Let it simmer',d:'The real heat grows, but so does the storyline. Put them in a ring later and it could be electric — or ugly.',fx:c=>{const k=key(c.A.id,c.B.id);addBeef(c.A.id,c.B.id,10);bumpHeat(c.A.id,c.B.id,15,[],'a backstage confrontation');S.cfLast=S.cfLast||{};S.cfLast[k]=AW();
   return `Word gets around. The fans can feel it too — the storyline heat between ${c.A.name} and ${c.B.name} jumps (+15), and so does the real thing.`}},
  {t:'Book them against each other this week',d:'Settle it in the ring tonight. A promised match — and expect the bad blood to come out when they meet.',fx:c=>{const k=key(c.A.id,c.B.id);const pr={kind:'callout',a:c.A.id,b:c.B.id,week:S.week};if(PPVS[S.week])pr.ppv=PPVS[S.week];addPromise(pr);S.settle=S.settle||{};S.settle[k]=AW();bumpHeat(c.A.id,c.B.id,10,[],'a backstage confrontation');S.cfLast=S.cfLast||{};S.cfLast[k]=AW();
   return `${c.A.name} vs ${c.B.name} is promised for this week's show. When they meet, it's going to get real.`}}]};
if(typeof CRISES!=='undefined')CRISES.confront=CF;
/* real heat on your roster gets a good chance to surface as a confrontation before any other event */
const _cg=crisisGen;crisisGen=function(){try{if(!S.crisis&&S.week>=2&&S.phase==='season'){const pr=cfPair(ownList('p').filter(w=>!w.inj));if(pr&&Math.random()<CF_P){S.crisis={k:'confront',a:pr[0].id,b:pr[1].id,w:S.week,tal:RI(0,99)};S.crisisLog=['confront',...(S.crisisLog||[]).filter(x=>x!=='confront')].slice(0,12);return}}}catch(e){console.warn(e)}return _cg.apply(this,arguments)};
/* "settle it in the ring": their match this week is guaranteed the real-heat call */
function cfSettleEvent(m,brand){if(!S.settle||brand!=='p')return null;const ids=m.sides.flat();
 for(const k of Object.keys(S.settle)){if(S.settle[k]!==AW())continue;const [a,b]=k.split('|');if(!inMatch(m,a,b))continue;delete S.settle[k];const A=S.w[a],B=S.w[b];if(!A||!B||A.inj||B.inj||!ids.includes(a))return null;
  const r=evRoles(m,brand);const [V,O]=A.mor<=B.mor?[A,B]:[B,A];r.V=V;r.O=O;r.brand=brand;const pr=laterPromo(brand,m);if(pr){r.Pp=pr;r.P=S.w[pr.a]}
  const lm=laterMatches(brand,m);r.MAIN=lm.length?1:0;r.OT=lm.length?`the next ${Math.min(2,lm.length)>1?'2 matches lose':'match loses'} ¼★ each`:'the show overruns ($25K fee)';
  const E=SIT.sabotage;const ch=E.ch.filter(x=>(!x.need||r[x.need])&&(!x.s||x.s!=='ringO'||r.O));
  return {e:{id:'sit:sabotage',text:`${V.name} and ${O.name} were told to settle it in the ring — and they're doing it for real. ${pick(E.texts).replace(/\{V\}/g,V.name).replace(/\{O\}/g,O.name)}`,ch},r,sit:'sabotage',info:`☢️ Real backstage heat between ${esc(V.name)} and ${esc(O.name)}: <b class="bad">${beefOf(V.id,O.id)}</b>`}}
 return null}
/* the truce: booking them together before it ends breaks it */
function truceCheck(notes){if(!S.truce)return;const now=AW();
 (S.card.p||[]).forEach(sl=>{if(!sl.d)return;const ids=sl.k==='match'&&sl.d.sides?sl.d.sides.flat():sl.k==='promo'?[sl.d.a,sl.d.b].filter(Boolean):[];
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const k=key(ids[i],ids[j]);if(S.truce[k]!=null&&now<=S.truce[k]){delete S.truce[k];const A=S.w[ids[i]],B=S.w[ids[j]];if(!A||!B)continue;addBeef(A.id,B.id,20);morx(A,-4,'You broke the truce');morx(B,-4,'You broke the truce');
   const n=`💢 Truce broken: you put ${A.name} and ${B.name} together before they'd cooled off. The real heat is back, worse than before.`;notes.push(n);news(n)}}});
 Object.keys(S.truce).forEach(k=>{if(S.truce[k]<now)delete S.truce[k]})}
function truceOf(a,b){return S.truce&&S.truce[key(a,b)]!=null&&AW()<=S.truce[key(a,b)]?S.truce[key(a,b)]:null}

/* ===================== LOCKER ROOM WHISPERS ===================== */
/* sty: styles that would pitch it · stip: stipulations or groups it needs · mt: match types · al: alignment
   title: only in a title match · star: they're a big star · under: they're well below their opponent · grp: stip group
   s/d: the stat and difficulty of the call · st/stNo: stars if it works / lost if it doesn't · inj: injury chance if it goes wrong
   p: popularity if it works · h: feud heat with the opponent if it works */
const WS=[
 {k:'cagessp',set:`{O} is down in the middle of the ring, and {W} is staring up at the top of the cage.`,sty:'fl',stip:'cage',q:`Let me go off the top of the cage. Trust me — they'll be talking about it for years.`,t:`{W} climbs to the very top of the cage and flies`,s:'ring',d:.15,st:1,stNo:.5,inj:.3,p:3,ok:`{W} soars off the top of the cage and crashes onto {O}. Nobody can believe it.`,no:`{W} slips at the top and comes down wrong. The crowd gasps.`},
 {k:'ladderdive',set:`The tallest ladder in the building is standing next to the ring. {W} keeps glancing at it.`,sty:'fl',stip:'ladder',q:`Put the tallest ladder in the building next to the ring. I'm diving off it.`,t:`{W} climbs the tallest ladder and dives`,s:'ring',d:.15,st:1,stNo:.5,inj:.3,p:3,ok:`{W} launches off the top of the ladder onto everyone below. Instant highlight.`,no:`The ladder wobbles and {W} crashes into the barricade.`},
 {k:'tope',set:`{O} rolls to the floor. {W} bounces off the ropes and looks toward gorilla.`,sty:'fl',q:`Give me the big dive over the top rope. I've been saving it for the right moment.`,t:`{W} goes for the big dive over the top rope`,s:'ring',d:.1,st:.5,stNo:.25,inj:.15,p:2,ok:`{W} flies over the top rope and wipes out {O}. The crowd is on its feet.`,no:`{W} clips the rope and lands awkwardly on the floor.`},
 {k:'divetrain',set:`Bodies are scattered on the floor. {W} is already eyeing the top rope.`,sty:'fl',mt:'tag trios eight',q:`Let me start a dive train. Everybody, one after another. The crowd will lose it.`,t:`{W} kicks off a dive train to the floor`,s:'ring',d:.1,st:.5,stNo:.25,inj:.1,p:2,ok:`Bodies everywhere. One dive after another — the crowd counts every one.`,no:`The timing is off and the train derails into a pile.`},
 {k:'shooting',set:`{O} is laid out. {W} heads for the top rope, and the crowd senses something new.`,sty:'fl',star:1,q:`I want to pull out a move I've never done on TV. Off the top rope. I'm ready.`,t:`{W} breaks out a brand-new move off the top rope`,s:'ring',d:.15,st:.75,stNo:.5,inj:.2,p:3,ok:`Never seen before, and perfectly executed. The internet will be buzzing.`,no:`{W} under-rotates. It looks painful.`},
 {k:'taunt',set:`{O} is down, and {W} turns to the crowd, ready for the full routine.`,sty:'sh',q:`Let me do my full routine before the finish. The whole thing. They'll go nuts.`,t:`{W} hits the full taunt routine before the big move`,s:'pop',d:.1,st:.5,stNo:.25,inj:0,p:3,ok:`The crowd does every part of the routine with {W}. Electric.`,no:`{O} gets up during the routine and spoils it.`},
 {k:'crowdbrawl',set:`The fight spills to the floor, and {W} drags {O} toward the barricade.`,sty:'sh br',stip:'falls stampede street nodq lights',q:`Let me take the fight into the crowd. Up the stairs, past the concessions. I've got it all planned.`,t:`{W} takes the fight up into the stands`,s:'pop',d:.1,st:.5,stNo:.25,inj:.1,p:2,h:6,ok:`They brawl all the way to the top row. The cameras can barely keep up.`,no:`It goes on too long and the crowd loses track of them.`},
 {k:'steal',set:`{O} hits their signature taunt. {W} gets up behind them with a grin.`,sty:'sh',q:`I want to steal my opponent's taunt in the middle of the match — and do it better than they do.`,t:`{W} steals {O}'s taunt`,s:'pop',d:.05,st:.25,stNo:.25,inj:0,p:2,h:8,ok:`{W} does it better than {O} ever has. {O} is livid.`,no:`{O} cuts it off with a cheap shot.`},
 {k:'weapon',set:`{W} slides out of the ring and reaches under the apron.`,sty:'br',grp:'hard',q:`Let me bring my own weapon. Something special. You'll see.`,t:`{W} pulls out the weapon they've been hiding all night`,s:'ring',d:.1,st:.5,stNo:.25,inj:.1,h:8,p:1,ok:`The crowd gasps when they see it. {O} pays dearly.`,no:`{O} gets the weapon first.`},
 {k:'table',set:`{W} drags {O} toward the announce desk. The commentators scatter.`,sty:'br pw',q:`Let me take them through the announce table. One spot. Worth it.`,t:`{W} puts {O} through the announce table`,s:'ring',d:.15,st:.75,stNo:.5,inj:.2,h:8,p:2,ok:`The table explodes. Commentary is scattered across the floor.`,no:`The table doesn't break. Both of them are hurting.`},
 {k:'slugfest',set:`Both are up at the same time, staring each other down in the middle of the ring.`,sty:'br',q:`Let me and them just stand in the middle and trade punches. No moves. The crowd will go wild.`,t:`{W} plants their feet and trades strikes with {O}`,s:'ring',d:.1,st:.5,stNo:.25,inj:.1,h:6,p:2,ok:`"Yay! Boo! Yay! Boo!" The building counts every punch.`,no:`{O} won't play along. It looks sloppy.`},
 {k:'deadlift',set:`{O} is flat on the mat. {W} grabs them around the waist.`,sty:'pw',q:`I can deadlift them off the mat into a powerbomb. Let me show everybody what I can do.`,t:`{W} goes for the deadlift powerbomb`,s:'ring',d:.15,st:.75,stNo:.5,inj:.15,p:3,ok:`Straight off the mat, straight into the canvas. A feat of strength.`,no:`{W} can't get them all the way up. It falls apart.`},
 {k:'stacked',set:`{W} sets up one table — then slides a second one on top of it.`,sty:'pw',stip:'tables',q:`Let me powerbomb them through two tables. Stacked.`,t:`{W} powerbombs {O} through stacked tables`,s:'ring',d:.15,st:1,stNo:.5,inj:.25,p:2,h:6,ok:`Two tables, one powerbomb. The match of the night just happened.`,no:`Only one table breaks. {W} tweaks something on the way down.`},
 {k:'doubleslam',set:`Two opponents stagger toward {W} at the same time.`,sty:'pw',mt:'triple four tag trios eight',q:`Let me carry two of them at once. A double slam. Nobody's ever seen me do it.`,t:`{W} hoists two opponents at once for a double slam`,s:'ring',d:.15,st:.75,stNo:.5,inj:.15,p:3,ok:`Two bodies, one slam. The crowd erupts.`,no:`One of them slips free. It looks messy.`},
 {k:'chain',set:`The bell rings. {W} circles {O} and offers a collar-and-elbow tie-up.`,sty:'te',q:`Give me five minutes of mat wrestling to open. No flash. Trust me, they'll respect it.`,t:`{W} opens with a long chain-wrestling sequence`,s:'ring',d:.1,st:.5,stNo:.25,inj:0,p:1,ok:`Hold, counter, counter. The crowd applauds every reversal.`,no:`It drags. A few fans start checking their phones.`},
 {k:'newsub',set:`{W} has {O} grounded and starts working on an unfamiliar hold.`,sty:'te',stip:'sub iquit',q:`I've got a new submission. Never done it on TV. Let me debut it.`,t:`{W} debuts a brand-new submission`,s:'ring',d:.15,st:.75,stNo:.25,inj:0,p:3,ok:`{O} has no idea how to get out. Neither does anyone watching.`,no:`It doesn't quite lock in. {O} slips free.`},
 {k:'counter',set:`{O} signals for the finisher. {W} is ready for it.`,sty:'te',q:`Let me counter their finisher straight into my submission. I've timed it a hundred times.`,t:`{W} counters {O}'s finisher into a submission`,s:'ring',d:.15,st:.75,stNo:.5,inj:0,p:2,h:6,ok:`Perfect timing. The crowd explodes when the hold goes on.`,no:`The timing is off and {W} eats the finisher.`},
 {k:'distract',set:`{W}'s associate is creeping down the ramp. The referee hasn't seen them yet.`,al:'h',q:`Have one of my buddies distract the referee. I'll handle the rest.`,t:`{W}'s associate distracts the referee at the perfect moment`,s:'luck',d:.05,st:.25,stNo:.25,inj:0,h:10,p:1,ok:`Two seconds of distraction is all {W} needs. The fans are furious.`,no:`The referee turns around just in time and ejects the accomplice.`},
 {k:'fakeinj',set:`{W} suddenly clutches their knee and rolls to the floor.`,al:'h',q:`I want to fake an injury, get them to drop their guard, then strike.`,t:`{W} fakes an injury to set up a sneak attack`,s:'luck',d:.1,st:.5,stNo:.5,inj:0,h:12,p:1,ok:`{O} leans in to check — and {W} strikes. Despicable. Perfect.`,no:`{O} doesn't buy it for a second.`},
 {k:'beltshot',set:`The referee is down. {W} spots the title belt at ringside.`,al:'h',title:1,q:`When the ref goes down, let me use the title belt. You know the move.`,t:`{W} swings the title belt while the referee is down`,s:'luck',d:.1,st:.5,stNo:.25,inj:0,h:12,p:1,ok:`Gold to the face. The ref turns around to see a pin. Unbelievable.`,no:`The ref recovers in time and sees everything.`},
 {k:'kickone',set:`{O} hits their finisher on {W} and hooks the leg.`,star:1,q:`Let me kick out at ONE on their finisher. The crowd will explode.`,t:`{W} kicks out at ONE`,s:'pop',d:.1,st:.5,stNo:.5,inj:0,h:6,p:2,ok:`ONE! The building comes unglued.`,no:`It looks like {O}'s finisher is weak. Nobody's happy.`},
 {k:'flurry',set:`{W} blocks a shot from {O}, and the crowd starts to buzz.`,under:1,q:`Give me one real flurry on them. Just once. Let me show everybody what I can do.`,t:`{W} gets a real flurry of offense on {O}`,s:'ring',d:.1,st:.5,stNo:.25,inj:0,p:4,ok:`For one minute, {W} looks like a superstar. The fans believe.`,no:`{O} cuts it off fast. It barely registers.`}];
function wsFits(sp,W,m,opp){const sk=stipKey(m),sg=(STIPS[sk]||STIPS.std).g;
 if(sp.sty&&!sp.sty.split(' ').includes(W.st))return false;if(sp.stip&&!sp.stip.split(' ').includes(sk))return false;if(sp.grp&&sg!==sp.grp)return false;
 if(sp.mt&&!sp.mt.split(' ').includes(m.type))return false;if(sp.al&&sp.al!==W.al)return false;if(sp.title&&!m.title)return false;
 if(sp.star&&W.pop<70)return false;if(sp.under&&!(opp&&W.pop<55&&opp.pop>=W.pop+15))return false;return true}
function wsOpp(m,W){const si=m.sides.findIndex(s=>s.includes(W.id));const o=m.sides.filter((s,i)=>i!==si).flat().map(id=>S.w[id]).filter(Boolean);return o.sort((a,b)=>b.pop-a.pop)[0]||null}
function wsMatchOk(m){return m&&m.sides&&m.type!=='squash'&&!(typeof isSp==='function'&&isSp(m))&&validMatch(m)&&!(typeof ocPending==='function'&&ocPending(m))}
function wsCur(){const x=S&&S.wsr;return x&&x.w===AW()?x:null}
function wsMatch(){const x=wsCur();if(!x||!x.ws)return null;const sl=(S.card.p||[]).find(sl=>sl.k==='match'&&sl.d&&wsMatchOk(sl.d)&&sl.d.sides.flat().includes(x.ws.id));if(!sl)return null;const W=S.w[x.ws.id],sp=WS.find(s=>s.k===x.ws.k);if(!W||!sp||W.inj||!wsFits(sp,W,sl.d,wsOpp(sl.d,W)))return null;return {m:sl.d,W,sp,ws:x.ws}}
function wsRoll(m){if(!S||S.phase!=='season'||!m||!wsMatchOk(m)||(typeof mpLocked==='function'&&mpLocked()))return;
 if(!(S.card.p||[]).some(sl=>sl.d===m))return;
 if(!S.wsr||S.wsr.w!==AW())S.wsr={w:AW(),seen:[]};const x=S.wsr;if(x.ws)return;
 const sig=m.sides.flat().slice().sort().join(',');if(x.seen.includes(sig))return;x.seen.push(sig);if(x.seen.length>12)x.seen=x.seen.slice(-12);
 if(Math.random()>=WS_P)return;
 const ws=m.sides.flat().map(id=>S.w[id]).filter(w=>w&&w.own==='p'&&!w.inj&&w.mor>=35);const opts=[];
 ws.forEach(W=>{const o=wsOpp(m,W);WS.forEach(sp=>{if(wsFits(sp,W,m,o))opts.push([W,sp])})});
 if(!opts.length)return;const [W,sp]=wpick(opts,o=>(o[1].sty||o[1].stip||o[1].grp?2:1)*(o[1].stip||o[1].title||o[1].under?2:1));
 x.ws={id:W.id,k:sp.k,ok:null};try{save()}catch(e){}}
function wsRisk(sp){return sp.inj>=.25?'a real injury risk if it goes wrong':sp.inj>0?'some injury risk if it goes wrong':sp.stNo>=.5?'it hurts the match if it goes wrong':'a small cost if it goes wrong'}
function wsOpen(){const c=wsMatch();if(!c)return;const {m,W,sp,ws}=c;const al=W.al==='h'?'heel':'face';
 openModal(`<div class="h mhd">💬 Locker room whisper</div><div class="gorp">${face(W)}<div><b class="${al}">${esc(W.name)}</b> <span class="muted tiny">· ${W.al==='h'?'😈 Heel':'😇 Face'} · ${STYLE_N[W.st]||''} · POP ${Math.round(W.pop)}</span><p class="scene" style="margin:6px 0 0">"${esc(sp.q)}"</p></div></div>
 <div class="muted tiny center" style="margin:4px 0 10px">For ${esc(vsLine(m))}</div>
 <button class="choice" onclick="wsAnswer(1)"><span class="key"><span>✓</span></span><div>Go for it</div><div class="muted tiny">Their match is guaranteed a call in gorilla, with this as an extra option · ${STAT_ICON[sp.s]} · big payoff, ${esc(wsRisk(sp))}</div></button>
 <button class="choice" onclick="wsAnswer(0)"><span class="key"><span>✕</span></span><div>Stick to the layout</div><div class="muted tiny">${esc(W.name)} is a little let down (morale −3)</div></button>
 ${ws.ok!=null?`<div class="note tiny center">You ${ws.ok?'approved':'passed on'} this one.</div>`:''}<button class="btn ghost" onclick="closeModal()">Decide later</button>`)}
function wsAnswer(y){if(typeof mpLocked==='function'&&mpLocked())return;const c=wsMatch();if(!c)return closeModal();const was=c.ws.ok;c.ws.ok=y?1:0;
 if(was==null)morx(c.W,y?2:-3,y?'You went with their idea for a spot':'You passed on their idea for a spot');
 save();closeModal();render();toast(y?`💬 ${c.W.name}'s idea is on for tonight.`:`💬 ${c.W.name} will stick to the layout.`)}
function wsTag(m){const x=wsCur();if(!x||!x.ws)return '';const c=wsMatch();if(!c||c.m!==m||c.ws.ok===0)return '';
 return c.ws.ok?`<span class="tg good" onclick="event.stopPropagation();wsOpen()">💬 ${esc(last(c.W.name))}'s idea is on</span>`:`<span class="tg wsp" onclick="event.stopPropagation();wsOpen()">💬 ${esc(last(c.W.name))} has an idea</span>`}
/* at the bell: an approved whisper guarantees a call and adds the spot to it */
const wsF=(W,O)=>t=>t.replace(/\{W\}/g,W.name).replace(/\{O\}/g,O?O.name:'their opponent');
function wsChoice(W,sp,O){const f=wsF(W,O);return {t:'💬 '+f(sp.t),s:sp.s,d:sp.d,st:sp.st,stNo:sp.stNo,ws:W.id,wsk:sp.k,okT:f(sp.ok),noT:f(sp.no)}}
/* an approved whisper is the match's call: its own moment, with the spot, a toned-down version, or waving it off */
function wsInject(g,m,brand,big){if(brand!=='p')return g;const c=wsMatch();if(!c||c.m!==m||c.ws.ok!==1)return g;if(g&&g.sit)return g;
 const O=wsOpp(m,c.W),f=wsF(c.W,O);const r=evRoles(m,brand);
 const big1=wsChoice(c.W,c.sp,O);
 const small={t:`Tell ${c.W.name} to go with a smaller version of it`,s:c.sp.s,d:0,st:.25,stNo:c.sp.stNo>=.5?.25:0,ws:c.W.id,wsk:c.sp.k,small:1,okT:`A toned-down version, but it still gets a good reaction.`,noT:`Even the small version doesn't quite come off.`};
 const wave={t:`Wave it off — stick to the layout`,always:1,st:0,ok:`The match goes on as planned. ${c.W.name} looks disappointed.`,morW:c.W.id};
 return {e:{id:'ws',text:`💬 ${f(c.sp.set||"{W} looks toward gorilla. This is the moment for the spot they pitched.")}`,ch:[big1,small,wave]},r}}
function wsRollEv(c,r,m){const ev=evNew(m);ev.hit=true;const W=S.w[c.ws];const sp=WS.find(s=>s.k===c.wsk)||{};const O=wsOpp(m,W);const ok=Math.random()<chance(c,{A:W});const extra=[];
 const k=c.small?.4:1;
 if(ok){ev.stars+=c.st||0;if(sp.p)ev.pop.push([W.id,sp.p*k]);ev.mor.push([W.id,c.small?2:4]);if(sp.h&&O)ev.heat.push([W.id,O.id,Math.round(sp.h*k)])}
 else{ev.stars-=c.stNo!=null?c.stNo:.25;if(sp.inj&&Math.random()<sp.inj*(c.small?.3:1)){const wk=injSev(W);ev.inj.push([W.id,wk,1]);extra.push(wk?`🚑 ${W.name} is hurt and will miss time`:`😮‍💨 ${W.name} is shaken up, but it's a false alarm`)}}
 const text=ok?c.okT:c.noT;ev.notes.push(`⚡ ${c.t.replace(/^💬 /,'')} — ${text}`);return {success:ok,text,flip:false,nc:false,extra}}

/* ===================== hooks ===================== */
const _me=matchEvent;matchEvent=function(m,brand,big,rate){const s=cfSettleEvent(m,brand);if(s)return s;let g=_me(m,brand,big,rate);try{g=wsInject(g,m,brand,big)}catch(e){console.warn(e)}return g};
const _er=evRoll;evRoll=function(c,r,m){if(c&&c.ws)return wsRollEv(c,r,m);const out=_er(c,r,m);if(c&&c.morW&&S.w[c.morW])evNew(m).mor.push([c.morW,-1]);return out};
const _ec=evChance;evChance=function(c,r){if(c&&c.ws){const W=S.w[c.ws];return W?chance(c,{A:W}):.5}return _ec(c,r)};
const _st=slotTags;slotTags=function(m,ppv){try{wsRoll(m)}catch(e){console.warn(e)}let h=_st(m,ppv);let add='';try{add=wsTag(m);
  const ids=m.sides.flat().filter(Boolean);const tr=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const u=truceOf(ids[i],ids[j]);if(u!=null)tr.push(`${last(S.w[ids[i]].name)} & ${last(S.w[ids[j]].name)}`)}
  if(tr.length)add+=`<span class="tg bad">🤝 Truce: ${esc(tr.join(', '))} — booking them breaks it</span>`}catch(e){console.warn(e)}
 if(!add)return h;return h?h.replace(/<\/div>$/,add+'</div>'):`<div class="tags">${add}</div>`};
const _ew=endWeek;endWeek=function(notes){try{truceCheck(notes||[])}catch(e){console.warn(e)}return _ew.apply(this,arguments)};

(function(){const c=document.createElement('style');c.textContent=`html .tg.wsp,html.lk-hy .tg.wsp{background:#e8c35a!important;color:#1b1406!important;cursor:pointer}.tg.good[onclick]{cursor:pointer}`;document.head.appendChild(c)})();
Object.assign(window,{wsOpen,wsAnswer,wsMatch,cfPair,truceOf,WS_SPOTS:WS});
})();
