/* Tony Khan Simulator — the venue ladder (v364).
   Your weekly TV home is a building you choose to move up into: the Piddly-Ass Auditorium (where everyone starts), the
   Good Building, then an Actual Arena. Moving up costs a move-in fee and a weekly rent. In return tickets sell for more,
   the show's box office can grow much further before it tops out (the revenue ceiling), and a good show brings in more
   fans. The catch: a bigger building has to be filled. Crowd pull is your recent buzz (last 3 shows) plus tonight's show,
   plus or minus the locker room's mood (a happy roster promotes the show; an unhappy one drags it). Fall short and the
   seats are empty: ticket and merch money drop, the crowd is flat (−VEN_EMPTY_ST★) and fans go home unimpressed.
   A move up takes effect VEN_WAIT weeks after you sign the lease, and you stay at least VEN_MIN_STAY weeks before moving
   again. Moving down is free and takes effect next week. PPVs keep their own venues (stadium shows are planned).
   The offline rival moves up by its own rule. In leagues, each GM decides for themselves (S.venue is keyed by brand). */
'use strict';
const BLDG=[
 {k:'aud',n:'Piddly-Ass Auditorium',i:'🏚️',move:0,rent:0,tix:1,cap:1,fans:0,pull:0,d:'Folding chairs, a curtain for an entrance and one working spotlight. It always fills, because it holds nobody.'},
 {k:'good',n:'Good Building',i:'🏢',move:400,rent:40,tix:1.35,cap:1.5,fans:.1,pull:3.5,d:'Real seats, a real entrance ramp and a crowd that can actually get loud. You have to give them a reason to come.'},
 {k:'arena',n:'Actual Arena',i:'🏟️',move:1000,rent:90,tix:1.7,cap:2,fans:.2,pull:3.75,d:'The big time. Thousands of seats, and every empty one shows up on camera.'}];
let VEN_MIN_STAY=8,VEN_WAIT=2,VEN_EMPTY_TIX=.6,VEN_EMPTY_MERCH=.8,VEN_EMPTY_ST=.1,VEN_EMPTY_FANS=2000,VEN_LR=.1;
function venSt(b){S.venue=S.venue||{};return S.venue[b]||(S.venue[b]={k:'aud',since:0})}
function venOf(b){const s=venSt(b);return BLDG.find(v=>v.k===s.k)||BLDG[0]}
function venIdx(b){return Math.max(0,BLDG.indexOf(venOf(b)))}
function venueRent(b){return venOf(b).rent}
/* a happy locker room talks the show up; an unhappy one doesn't (human GMs; the rival has no locker-room mood) */
function lrPull(b){if(typeof lockerMood!=='function'||!(typeof MOR_HUM!=='function'||MOR_HUM(b)))return 0;const m=lockerMood(b);return m>=LR_MID?VEN_LR:-VEN_LR*(LR_MID-m)/5}
function crowdPull(b,r){return (buzzOf(b)+r)/2+lrPull(b)}
function pullWord(p,need){const d=p-need;return d>=.35?['Packed','good']:d>=.1?['Should fill','good']:d>=-.1?['Risky','warn']:["You won't fill it",'bad']}
/* airShow: after the ratings are in, before fans and money (index.html calls these) */
function venueNight(b,show,rt,out){const c=out.cash&&out.cash[b];if(!c)return;const V=venOf(b);c.ven={k:V.k,n:V.n,tix:V.tix,cap:V.cap,empty:false};if(show.ppv||!V.pull)return;
 const p=crowdPull(b,rt[b]);if(p>=V.pull)return;c.ven.empty=true;rt[b]=clamp(rt[b]-VEN_EMPTY_ST,0,5);
 if(b==='p'||ON())out.notes.push(`🪑 ${ON()?nameOf(b)+': e':'E'}mpty seats at the ${V.n}. Not enough buzz to fill it tonight: tickets and merch down, a flat crowd and −${fmtFans(VEN_EMPTY_FANS)} fans.`)}
function venueFans(b,d,show,c){if(show.ppv||!c||!c.ven)return d;if(c.ven.empty)return d-VEN_EMPTY_FANS;const V=venOf(b);return d>0&&V.fans?Math.round(d*(1+V.fans)):d}
/* end of the week: leases that start now, and the offline rival's own moves */
function venueWeek(notes){const wk=AW();brands().forEach(b=>{const s=venSt(b);if(s.next&&wk>=s.next.at){s.k=s.next.k;s.since=wk;delete s.next;const V=venOf(b);
  if(b==='p'||ON()){const n=`${V.i} ${ON()?nameOf(b)+' moves':'You move'} into the ${V.n} next week.`;news(n);if(notes)notes.push(n)}}});
 if(!ON()&&S.money&&S.money.ai!=null){const s=venSt('ai'),i=venIdx('ai'),up=BLDG[i+1];if(s.next||wk-s.since<VEN_MIN_STAY)return;
  if(S.money.ai<0&&i>0){s.next={k:BLDG[i-1].k,at:wk};return}
  if(up&&S.money.ai>=up.move*2+up.rent*8&&buzzOf('ai')>=up.pull+.05){S.money.ai-=up.move;s.next={k:up.k,at:wk+VEN_WAIT};news(`${up.i} ${S.rival} signed a lease on the ${up.n}.`)}}}
function venueMove(b,dir){const s=venSt(b),i=venIdx(b),to=BLDG[i+dir];const wk=AW();if(!to||s.next)return 'busy';
 if(dir>0){if(wk-s.since<VEN_MIN_STAY&&s.since)return 'stay';if(S.money[b]<to.move)return 'money';S.money[b]-=to.move;s.next={k:to.k,at:wk+VEN_WAIT}}
 else s.next={k:to.k,at:wk};return 'ok'}
window.venUp=function(){if(typeof mpLocked==='function'&&mpLocked())return;const i=venIdx('p'),to=BLDG[i+1];if(!to)return;
 if(!confirm(`Sign a lease on the ${to.n}? ${money(to.move)} to move in now, then ${money(to.rent)} a week. You move in ${VEN_WAIT} weeks from now and stay at least ${VEN_MIN_STAY} weeks.`))return;
 const r=venueMove('p',1);if(r!=='ok')return toast(r==='money'?`You need ${money(to.move)} to move in.`:r==='stay'?`You just moved in. Give it ${VEN_MIN_STAY} weeks.`:'A move is already lined up.');
 news(`${to.i} ${S.gm||'You'} signed a lease on the ${to.n}.`);save();render()};
window.venDown=function(){if(typeof mpLocked==='function'&&mpLocked())return;const i=venIdx('p'),to=BLDG[i-1];if(!to)return;
 if(!confirm(`Move back down to the ${to.n}? Starting next week, no refund on the move-in fee.`))return;if(venueMove('p',-1)==='ok'){save();render()}};
/* the Front office card */
function venueCard(){const s=venSt('p'),V=venOf('p'),i=venIdx('p'),up=BLDG[i+1],dn=BLDG[i-1];const wk=AW();
 const ceil=x=>money(Math.round(econCap()*REV_CAP_TV*x.cap));const est=crowdPull('p',buzzOf('p'));
 const nxt=s.next&&BLDG.find(v=>v.k===s.next.k);const left=s.next?Math.max(0,s.next.at-wk)+1:0;const stay=s.since?Math.max(0,VEN_MIN_STAY-(wk-s.since)):0;
 const lr=lrPull('p');
 return `<div class="card"><div class="row sb"><div class="h small" style="margin:0">Your building</div>${V.rent?`<span class="muted tiny">${money(V.rent)}/wk rent</span>`:''}</div>
 <div style="margin-top:6px"><b>${V.i} ${esc(V.n)}</b></div><div class="muted tiny">${esc(V.d)} Box office tops out around ${ceil(V)} a TV show.</div>
 ${V.pull?`<div class="tiny" style="margin-top:6px">Crowds lately: <b class="${pullWord(est,V.pull)[1]}">${pullWord(est,V.pull)[0]}</b> <span class="muted">· from your last 3 shows${lr?`, and the locker room ${lr>0?'talking it up':'dragging it down'}`:''}. Tonight's card decides it (Book screen).</span></div>`:''}
 ${nxt?`<div class="card warn mt" style="padding:8px">${nxt.i} Moving to the <b>${esc(nxt.n)}</b> ${left<=1?'next week':`in ${left} weeks`}.</div>`:''}
 ${up&&!nxt?`<div class="mt" style="border-top:1px solid var(--line);padding-top:8px"><div><b>${up.i} ${esc(up.n)}</b> <span class="muted tiny">· ${money(up.move)} to move in, ${money(up.rent)}/wk</span></div>
  <div class="muted tiny">${esc(up.d)} Tickets ×${up.tix}, box office up to ${ceil(up)} a show, +${Math.round(up.fans*100)}% fans from good shows. Right now: ${(()=>{const w=pullWord(est,up.pull);return `<b class="${w[1]}">${w[0]}</b>`})()}.</div>
  <button class="mini mt" onclick="venUp()" ${S.money.p<up.move||stay?'disabled':''}>Sign the lease · ${money(up.move)}</button>${stay?` <span class="muted tiny">You can move again in ${stay} week${stay>1?'s':''}.</span>`:S.money.p<up.move?` <span class="muted tiny">Not enough in the bank yet.</span>`:''}</div>`:''}
 ${dn&&!nxt?`<div class="mt"><button class="mini" onclick="venDown()">Move back to the ${esc(dn.n)}</button></div>`:''}</div>`}
window.venueCard=venueCard;
/* the Book screen: will tonight's card fill the building? (v404: its own slim card now the Crowd read is gone) */
if(typeof flowCard==='function'){const f0=flowCard;flowCard=function(sh){let h=f0.apply(this,arguments);try{const V=venOf('p');if(!sh.ppv&&V.pull){const P=cardProj();const r=P&&P.show?P.show.mid:buzzOf('p');const w=pullWord(crowdPull('p',r),V.pull);
  const vl=`<div class="tiny"${h?' style="margin-top:6px"':''}>${V.i} ${esc(V.n)}: <b class="${w[1]}">${w[0]}</b>${w[1]==='good'?'':' <span class="muted">· a hotter card fills more seats</span>'}</div>`;h=h?h.replace(/<\/div>\s*$/,vl+'</div>'):`<div class="card flowc venpull">${vl}</div>`}}catch(e){console.warn('venue',e)}return h}}
window.venOf=venOf;window.venueRent=venueRent;window.venueNight=venueNight;window.venueFans=venueFans;window.venueWeek=venueWeek;window.venueMove=venueMove;window.crowdPull=crowdPull;
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){try{venueWeek(notes)}catch(e){console.warn('venue week',e)}return e0.apply(this,arguments)}}
