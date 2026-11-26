/* Tony Khan Simulator — your TV buildings (v364; booked week by week since v424).
   Three buildings for weekly TV: the Piddly-Ass Auditorium (free, always yours), the Good Building and an Actual Arena.
   Each bigger building is unlocked once (a one-time fee) and then booked show by show on the Book screen for a fee that
   week. A bigger room sells pricier tickets, lets the box office grow further before it tops out (the revenue ceiling)
   and turns a good show into more new fans. The catch: it has to be filled. Crowd pull is your recent buzz (last 3 shows)
   plus tonight's show, plus or minus the locker room's mood. Fall short and the seats are empty: ticket and merch money
   drop, the crowd is flat (−VEN_EMPTY_ST★) and fans go home unimpressed. The building carries over from week to week
   until you change it. PPVs keep their own venues and charge no building fee.
   Big audience, small room: once your audience is big enough for a bigger building (VEN_WANT) and you can afford it,
   every TV show you run below it has your top stars (85+) grumbling. After VEN_GRUMBLE shows in a row they lose morale
   each show, and the biggest of them comes to the office door: promise the bigger room next week (kept: everyone
   perks up; broken: it gets worse) or tell them you're not there yet.
   The offline rival unlocks and books by its own rule. In leagues, each GM decides for themselves (S.venue by brand). */
'use strict';
const BLDG=[
 {k:'aud',n:'Piddly-Ass Auditorium',i:'🏚️',unlock:0,rent:0,tix:1,cap:1,fans:0,pull:0,d:'Folding chairs, a curtain for an entrance and one working spotlight. It always fills, because it holds nobody.'},
 {k:'good',n:'Good Building',i:'🏢',unlock:400,rent:55,tix:1.45,cap:1.6,fans:.15,pull:3.5,d:'Real seats, a real entrance ramp and a crowd that can actually get loud. You have to give them a reason to come.'},
 {k:'arena',n:'Actual Arena',i:'🏟️',unlock:1000,rent:130,tix:1.9,cap:2.2,fans:.3,pull:3.75,d:'The big time. Thousands of seats, and every empty one shows up on camera.'}];
let VEN_EMPTY_TIX=.6,VEN_EMPTY_MERCH=.8,VEN_EMPTY_ST=.1,VEN_EMPTY_FANS=2000,VEN_LR=.1;
/* the audience that expects a bigger room, the shows in a row before stars grumble, and how often one comes to the door */
const VEN_WANT={good:700000,arena:1400000},VEN_GRUMBLE=3,VEN_ASK_GAP=10,VEN_STAR=85;
function venSt(b){S.venue=S.venue||{};const s=S.venue[b]||(S.venue[b]={k:'aud',own:['aud']});
 /* saves from the move-in ladder: you own every building up to the one you lived in (or had a lease lined up for) */
 if(!s.own){const top=Math.max(BLDG.findIndex(v=>v.k===s.k),s.next?BLDG.findIndex(v=>v.k===s.next.k):0,0);s.own=BLDG.slice(0,top+1).map(v=>v.k);if(s.next)s.k=s.next.k;delete s.next;delete s.since}
 if(!BLDG.some(v=>v.k===s.k))s.k='aud';return s}
function venOf(b){const s=venSt(b);return BLDG.find(v=>v.k===s.k)||BLDG[0]}
function venIdx(b){return Math.max(0,BLDG.indexOf(venOf(b)))}
function venOwns(b,k){return venSt(b).own.includes(k)}
/* the fee for this week's building: only TV weeks pay it */
function venueRent(b){if(typeof curShow==='function'){try{if(curShow().ppv)return 0}catch(e){}}return venOf(b).rent}
/* a happy locker room talks the show up; an unhappy one doesn't (human GMs; the rival has no locker-room mood) */
function lrPull(b){if(typeof lockerMood!=='function'||!(typeof MOR_HUM!=='function'||MOR_HUM(b)))return 0;const m=lockerMood(b);return m>=LR_MID?VEN_LR:-VEN_LR*(LR_MID-m)/5}
function crowdPull(b,r){return (buzzOf(b)+r)/2+lrPull(b)}
function pullWord(p,need){const d=p-need;return d>=.35?['Packed','good']:d>=.1?['Should fill','good']:d>=-.1?['Risky','warn']:["You won't fill it",'bad']}
/* the biggest building your audience expects, if you can afford to run it (null: the Auditorium is fine) */
function venWant(b){const f=S.fans&&S.fans[b]||0;const cash=S.money&&S.money[b]||0;
 for(let i=BLDG.length-1;i>0;i--){const V=BLDG[i];if(f<(VEN_WANT[V.k]||1e12))continue;const need=V.rent*4+(venOwns(b,V.k)?0:V.unlock);if(cash>=need)return V}return null}
const venHum=b=>b==='p'||(typeof ON==='function'&&ON());
const venStars=b=>(typeof ownList==='function'?ownList(b):Object.values(S.w).filter(w=>w.own===b)).filter(w=>!w.inj&&w.pop>=VEN_STAR);
/* airShow: after the ratings are in, before fans and money (index.html calls these) */
function venueNight(b,show,rt,out){const c=out.cash&&out.cash[b];if(!c)return;const V=venOf(b);c.ven={k:V.k,n:V.n,tix:V.tix,cap:V.cap,empty:false};if(show.ppv)return;
 try{venStarsNight(b,out)}catch(e){console.warn('venue stars',e)}
 if(!V.pull)return;const p=crowdPull(b,rt[b]);if(p>=V.pull)return;c.ven.empty=true;rt[b]=clamp(rt[b]-VEN_EMPTY_ST,0,5);
 if(b==='p'||ON())out.notes.push(`🪑 ${ON()?nameOf(b)+': e':'E'}mpty seats at the ${V.n}. Not enough buzz to fill it tonight: tickets and merch down, a flat crowd and −${fmtFans(VEN_EMPTY_FANS)} fans.`)}
/* top stars and the size of the room (human GMs only) */
function venStarsNight(b,out){if(!venHum(b)||(typeof MOR_HUM==='function'&&!MOR_HUM(b)))return;const s=venSt(b),W=venWant(b),i=venIdx(b);const me=b==='p'||ON();
 const who=ON()?nameOf(b)+': ':'';
 if(s.prom){const P=s.prom;delete s.prom;const ok=i>=BLDG.findIndex(v=>v.k===P.k);const a=S.w[P.id];
  venStars(b).forEach(w=>w.mor=clamp(w.mor+(ok?3:-3),0,100));if(a)a.mor=clamp(a.mor+(ok?3:-6),0,100);
  if(ok)s.low=0;
  if(me&&a)out.notes.push(ok?`${who}${venOf(b).i} ${a.name} and the top of the card loved working the ${venOf(b).n}. Promise kept.`:`${who}🪑 ${a.name} was promised a bigger room and got the ${venOf(b).n} again. The top of the card noticed.`);
  if(ok)return}
 if(!W||i>=BLDG.indexOf(W)){s.low=0;return}
 s.low=(s.low||0)+1;if(s.low<VEN_GRUMBLE)return;
 venStars(b).forEach(w=>w.mor=clamp(w.mor-1,0,100));
 if(me&&s.low===VEN_GRUMBLE)out.notes.push(`${who}🪑 Your top stars are grumbling: an audience of ${fmtFans(S.fans[b])} and they're working the ${venOf(b).n}.`)}
/* the one asking at the office door */
function venAsker(b){const s=venSt(b);if(s.prom||(s.low||0)<VEN_GRUMBLE)return null;if(s.ask!=null&&AW()-s.ask<VEN_ASK_GAP)return null;const W=venWant(b);if(!W||venIdx(b)>=BLDG.indexOf(W))return null;
 const w=venStars(b).sort((x,y)=>y.pop-x.pop)[0];return w?{w,W}:null}
window.venAnswer=function(yes){const a=venAsker('p');if(!a)return;const s=venSt('p');s.ask=AW();
 if(yes){s.prom={k:a.W.k,id:a.w.id,at:AW()};news(`${a.W.i} You promised ${a.w.name} the ${a.W.n} next week.`)}
 else{a.w.mor=clamp(a.w.mor-3,0,100);news(`🪑 You told ${a.w.name} the company isn't ready for the ${a.W.n} yet.`)}
 try{save()}catch(e){}try{if(typeof closeModal==='function')closeModal()}catch(e){}try{render()}catch(e){}};
function venBrief(){if(!S||S.phase!=='season'||!S.venue)return [];const a=venAsker('p');if(!a)return [];const{w,W}=a;const owned=venOwns('p',W.k);
 return [{i:'🪑',t:`${w.name} wants a bigger room`,u:false,rows:[`<div class="brow">${esc(w.name)}<br><span class="muted tiny">${fmtFans(S.fans.p)} fans and the show is still in the ${esc(venOf('p').n)}. Promise the ${esc(W.n)} next week (${owned?`${money(W.rent)} that night`:`unlock it for ${money(W.unlock)}, then ${money(W.rent)} that night`}) and the top of the card perks up; break it and they sour.</span><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px"><button class="mini" onclick="venAnswer(true)">You'll be in the ${esc(W.n)}</button><button class="mini ghost" onclick="venAnswer(false)">We're not there yet</button></div></div>`]}]}
if(typeof briefItems==='function'){const b0=briefItems;briefItems=window.briefItems=function(){const s=b0.apply(this,arguments);try{return venBrief().concat(s)}catch(e){console.warn('venue brief',e);return s}}}
function venueFans(b,d,show,c){if(show.ppv||!c||!c.ven)return d;if(c.ven.empty)return d-VEN_EMPTY_FANS;const V=venOf(b);return d>0&&V.fans?Math.round(d*(1+V.fans)):d}
/* unlocking and booking */
function venueBuy(b,k){const V=BLDG.find(v=>v.k===k),s=venSt(b);if(!V||s.own.includes(k))return 'have';const i=BLDG.indexOf(V);if(!s.own.includes(BLDG[i-1].k))return 'order';
 if(S.money[b]<V.unlock)return 'money';S.money[b]-=V.unlock;s.own.push(k);return 'ok'}
function venuePick(b,k){const V=BLDG.find(v=>v.k===k),s=venSt(b);if(!V||!s.own.includes(k))return 'locked';if(V.rent&&S.money[b]<V.rent)return 'money';s.k=k;return 'ok'}
/* end of the week: an unaffordable building drops back to the Auditorium; the offline rival's own unlocks and bookings */
function venueWeek(){brands().forEach(b=>{const s=venSt(b);const V=venOf(b);if(V.rent&&S.money[b]<V.rent){s.k='aud';if(b==='p'||ON())news(`🏚️ ${ON()?nameOf(b)+' is':"You're"} back in the Piddly-Ass Auditorium: not enough in the bank for the ${V.n}.`)}});
 if(!ON()&&S.money&&S.money.ai!=null){const s=venSt('ai');const nx=BLDG.find(v=>!s.own.includes(v.k));
  if(nx&&S.money.ai>=nx.unlock*2+nx.rent*8&&buzzOf('ai')>=nx.pull+.05&&venueBuy('ai',nx.k)==='ok')news(`${nx.i} ${S.rival} can now book the ${nx.n}.`);
  const pick=BLDG.slice().reverse().find(v=>s.own.includes(v.k)&&(!v.pull||crowdPull('ai',buzzOf('ai'))>=v.pull+.05)&&S.money.ai>=v.rent*4)||BLDG[0];s.k=pick.k}}
window.venBuy=function(k){if(typeof mpLocked==='function'&&mpLocked())return;const V=BLDG.find(v=>v.k===k);if(!V)return;
 if(!confirm(`Unlock the ${V.n} for ${money(V.unlock)}? After that, book it for any TV show at ${money(V.rent)} that week.`))return;
 const r=venueBuy('p',k);if(r!=='ok')return toast(r==='money'?`You need ${money(V.unlock)} to unlock it.`:r==='order'?`Unlock the ${BLDG[BLDG.indexOf(V)-1].n} first.`:'Already yours.');
 news(`${V.i} ${S.gm||'You'} can now book the ${V.n}.`);save();render()};
window.venPick=function(k){if(typeof mpLocked==='function'&&mpLocked())return;const r=venuePick('p',k);if(r==='money')return toast(`Not enough in the bank for the ${BLDG.find(v=>v.k===k).n} this week.`);save();render()};
/* the Front office card */
function venueCard(){const s=venSt('p'),V=venOf('p');const ceil=x=>money(Math.round(econCap()*REV_CAP_TV*x.cap));const est=crowdPull('p',buzzOf('p'));const lr=lrPull('p');
 const row=x=>{const own=s.own.includes(x.k),on=x.k===V.k,prev=BLDG[BLDG.indexOf(x)-1];const w=x.pull?pullWord(est,x.pull):null;
  return `<div class="mt" style="border-top:1px solid var(--line);padding-top:8px"><div class="row sb"><b>${x.i} ${esc(x.n)}</b><span class="muted tiny">${x.rent?`${money(x.rent)} a TV show`:'Free'}</span></div>
  <div class="muted tiny">${esc(x.d)}${x.k!=='aud'?` Tickets ×${x.tix}, box office up to ${ceil(x)} a show, +${Math.round(x.fans*100)}% fans from good shows.`:` Box office tops out around ${ceil(x)} a show.`}${w?` Lately: <b class="${w[1]}">${w[0]}</b>.`:''}</div>
  ${on?`<div class="tiny mt"><b class="good">Booked for this week's show</b></div>`:own?`<button class="mini mt" onclick="venPick('${x.k}')" ${S.money.p<x.rent?'disabled':''}>Book it this week</button>`:
   `<button class="mini mt" onclick="venBuy('${x.k}')" ${S.money.p<x.unlock||(prev&&!s.own.includes(prev.k))?'disabled':''}>Unlock · ${money(x.unlock)}</button>${prev&&!s.own.includes(prev.k)?` <span class="muted tiny">Unlock the ${esc(prev.n)} first.</span>`:S.money.p<x.unlock?` <span class="muted tiny">Not enough in the bank yet.</span>`:''}`}</div>`};
 return `<div class="card"><div class="h small" style="margin:0">Your buildings</div><div class="muted tiny">Crowds lately come from your last 3 shows${lr?`, with the locker room ${lr>0?'talking it up':'dragging it down'}`:''}. Pick tonight's building on the Book screen.</div>${BLDG.map(row).join('')}</div>`}
window.venueCard=venueCard;
/* the Book screen: tonight's building, and will tonight's card fill it? */
if(typeof flowCard==='function'){const f0=flowCard;flowCard=function(sh){let h=f0.apply(this,arguments);try{if(!sh.ppv){const s=venSt('p'),V=venOf('p');const P=cardProj();const r=P&&P.show?P.show.mid:buzzOf('p');const p=crowdPull('p',r);
  const opts=BLDG.filter(x=>s.own.includes(x.k));let vl;
  if(opts.length>1)vl=`<div class="tiny"${h?' style="margin-top:6px"':''}>Tonight's building</div><div class="row venpick" style="flex-wrap:wrap;gap:6px;margin-top:4px">${opts.map(x=>{const w=x.pull?pullWord(p,x.pull):['Always full','good'];return `<button class="mini${x.k===V.k?' on':''}" onclick="venPick('${x.k}')" ${x.k!==V.k&&(typeof bgLeft==='function'?bgLeft('p',null,{noRent:true}):S.money.p)<x.rent?'disabled':''}>${x.i} ${esc(x.n)}${x.rent?` · ${money(x.rent)}`:''} · <b class="${x.k===V.k?'':w[1]}">${w[0]}</b></button>`}).join('')}</div>`;
  else if(V.pull){const w=pullWord(p,V.pull);vl=`<div class="tiny"${h?' style="margin-top:6px"':''}>${V.i} ${esc(V.n)}: <b class="${w[1]}">${w[0]}</b>${w[1]==='good'?'':' <span class="muted">· a hotter card fills more seats</span>'}</div>`}
  if(vl)h=h?h.replace(/<\/div>\s*$/,vl+'</div>'):`<div class="card flowc venpull">${vl}</div>`}}catch(e){console.warn('venue',e)}return h}}
window.venOf=venOf;window.venueRent=venueRent;window.venueNight=venueNight;window.venueFans=venueFans;window.venueWeek=venueWeek;window.venueBuy=venueBuy;window.venuePick=venuePick;window.venOwns=venOwns;window.crowdPull=crowdPull;window.venWant=venWant;window.venAsker=venAsker;
/* after the week's bills (this week's building fee included), set up next week */
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){const r=e0.apply(this,arguments);try{venueWeek(notes)}catch(e){console.warn('venue week',e)}return r}}
