/* Highlight reel planning, payoff scenes and the live crowd. */
'use strict';
/* v481: a highlight reel is for a segment that demands it — a blood feud being settled, or an arc's payoff. Those always
   play out in full, live; nothing else does (a disaster brewing backstage still comes to you live, any night). */
const HR_CAP=2,HR_BLOOD=75;/* one blood feud payoff and one arc payoff a night, at most */
/* ---- the crowd: 0–100, starts from the show's buzz and the size of the night ---- */
let HRC=50;/* the crowd for whoever is airing right now (live show, the rival, the sim) */
function hrStart(b,sh){const bz=typeof buzzOf==='function'?buzzOf(b):3;return clamp(Math.round(42+(bz-3)*12+(sh&&sh.ppv?10:0)+(sh&&sh.special?6:0)),20,78)}
const hrWord=c=>c<30?'Cold':c<55?'Warm':c<75?'Hot':'Electric';
/* how much the crowd pushes risk-taking: about ×0.8 in a cold room, ×1.4 when it's electric */
const hrCm=()=>clamp(1+(HRC-50)/125,.75,1.4);
/* a segment moves the crowd: a 3½★ segment keeps it where it is, a great one fires it up, a dud cools it off */
function hrMove(stars,extra){HRC=clamp(Math.round(HRC+clamp((stars-3.5)*8,-10,10)+(extra||0)),5,100);return HRC}
/* ---- which segments get a highlight reel: at most hrCap() a night ---- */
const hrCap=()=>HR_CAP;
/* Pick the actual rivalry, even when neither wrestler is taking the fall. */
function hrBloodPair(m,ppv){
 if(!m||!m.sides||!(ppv||m.bo)||isSp(m)||m.type==='gauntlet')return null;
 let best=null;
 for(let i=0;i<m.sides.length;i++)for(let j=i+1;j<m.sides.length;j++)for(const a of m.sides[i])for(const b of m.sides[j]){
  const h=heatOf(a,b);if(h<HR_BLOOD||S.fs?.[key(a,b)]?.paid)continue;
  if(!best||h>best.h)best={a,b,h}
 }
 return best
}
function hrBlood(m,ppv){return hrBloodPair(m,ppv)?.h||0}
function hrArc(kind,d,main){return typeof arcPayoffFor==='function'&&arcPayoffFor(kind,d,main)}
function hrPlayable(kind,d){
 if(kind==='promo')return !!(d?.a&&S.w[d.a]&&!S.w[d.a].inj&&(!d.b||S.w[d.b]&&!S.w[d.b].inj)&&!d.cut);
 return msOn(d)&&d.sides.flat().every(id=>S.w[id]&&!S.w[id].inj)
}
function hrDemand(kind,d,main,ppv,b){
 if(!hrPlayable(kind,d))return '';
 if(kind==='match'&&hrBlood(d,ppv))return 'blood';
 return b!=='ai'&&(kind==='promo'||main||ppv)&&hrArc(kind,d,main)?'arc':''
}
function hrPlan(card,ppv,b){
 const out=new Map();if(!card)return out;
 const main=card.findLastIndex(sl=>sl?.k==='match'&&sl.d);
 let blood=null,arc=null;
 card.forEach((sl,i)=>{
  if(!sl||sl.k!=='match'||!hrPlayable('match',sl.d))return;
  const heat=hrBlood(sl.d,ppv);
  if(heat&&(!blood||heat>blood.heat||heat===blood.heat&&i===main))blood={d:sl.d,heat};
 });
 if(blood)out.set(blood.d,'blood');
 if(b!=='ai'){
  const seen=new Set();
  card.forEach((sl,i)=>{
   if(!sl||!['match','promo'].includes(sl.k)||!hrPlayable(sl.k,sl.d))return;
   const payoff=hrArc(sl.k,sl.d,i===main);
   if(!payoff||seen.has(payoff.id))return;
   seen.add(payoff.id);
   if(sl.d===blood?.d||sl.k==='match'&&!(ppv||i===main))return;
   if(!arc||i===main||arc.i!==main)arc={d:sl.d,i};
  });
 }
 if(arc)out.set(arc.d,'arc');
 return out
}
function hrPlanned(d){
 if(!LQ||LQ.hr>=hrCap())return '';
 if(!LQ.plan)LQ.plan=hrPlan(S.card.p,LQ.ppv,'p');
 return LQ.plan.get(d)||''
}
const HR_WHYW={blood:'Blood feud payoff',arc:'Arc payoff'};
/* tallies for tools/balance-sim.js */
const hrCount=why=>{window.hrN=(window.hrN||0)+1;if(why==='blood')window.hrNb=(window.hrNb||0)+1};
function hrTag(sl,i){try{if(!S||S.phase!=='season'||!sl||!sl.d)return '';const sh=curShow();const why=hrPlan(S.card.p,sh.ppv,'p').get(sl.d);if(!why)return '';
  return `<span class="hrtag hi">🎬 Highlight reel: ${HR_WHYW[why]}</span>`}catch(e){return ''}}
/* ---- the live show ---- */
/* decide a segment as it comes up: true = highlight reel */
function hrRoll(kind,d,main){
 const why=hrPlanned(d);if(!why)return false;
 LQ.plan.delete(d);
 if(why==='arc'){if(!hrArc(kind,d,main))return false;if(kind==='match')d._hrArc=1}
 HRC=LQ.crowd;LQ.hr++;LQ.hrWhy=why;hrCount(why);return true
}
/* a segment finished: move the crowd. Matches use their projected rating plus whatever the calls added. */
function hrAfter(it){if(!LQ||!it)return;HRC=LQ.crowd;let s=3,txt='';
 if(it.kind==='promo'||it.k==='promo'){const p=S.card.p[it.i]&&S.card.p[it.i].d;s=p&&p.res?p.res.stars:2.5}
 else if(it.m){let base=3;try{base=rateMatch(it.m,{ppv:curShow().ppv,preview:true}).stars}catch(e){}s=base+(it.m.ev&&it.m.ev.stars||0)}
 const was=LQ.crowd;LQ.crowd=hrMove(s);it.crowd=LQ.crowd;it.dc=LQ.crowd-was}
function hrBug(){if(!LIVE||!LQ||LQ.crowd==null)return '';const c=LQ.crowd;
 return `<div class="hrbug"><span class="hrk">The crowd</span><span class="hrbar"><i style="transform:scaleX(${c/100})"></i></span><b class="hrw">${hrWord(c)}</b><span class="hrn">${LQ.hr?`🎬 ${HR_WHYW[LQ.hrWhy]||'Highlight reel'}`:''}</span></div>`}
/* the quiet segments since the last highlight reel, in one short screen */
const HR_Q={match:{hi:['A strong match. The crowd is with them.','Good stuff, and the fans let them know it.','They worked hard and it showed.','The fans were up for the finish.','A real crowd-pleaser.','They had the place buzzing by the end.','Better than anyone expected.','That got a standing ovation.','Fans will be talking about that one.'],
 mid:['A solid match. Nothing more, nothing less.','It did its job.','Steady work. Polite applause.','Fine. The crowd stayed with it.','Decent, if a little by the numbers.','Good enough. On to the next one.','A few nice spots, a clean finish.','Workmanlike. Nobody complained.','It moved the story along.'],
 lo:['That one never got going.','The crowd sat on their hands.','A flat match. A few people checked their phones.','A popcorn break for a lot of people.','It never clicked.','Sloppy in spots. The crowd noticed.','The finish came and nobody much cared.','They lost the room halfway through.']},
 promo:{hi:['The mic work landed. The crowd ate it up.','A strong promo. People were hanging on every word.','Every line got a reaction.','They had the crowd chanting along.','That\'s a promo people will quote.','The fans were loud from start to finish.'],
 mid:['A fine promo that set things up.','It got the point across.','Said what needed saying.','A couple of good lines in there.','It did the job and got out.','The crowd listened. Mostly.'],
 lo:['The promo fell flat.','The crowd wasn\'t buying it.','It went on too long.','A few lines got lost in the noise.','Crickets in the cheap seats.','The crowd talked over most of it.']}};
function hrLine(it){const k=it.kind==='promo'?'promo':'match';const d=it.dc||0;return fpick(HR_Q[k][d>=4?'hi':d<=-3?'lo':'mid'])}
function hrWho(it){if(it.kind==='promo'){const p=S.card.p[it.i]&&S.card.p[it.i].d;return p?[p.a,p.b].filter(Boolean).map(id=>S.w[id]&&S.w[id].name).join(' & '):''}return it.m.sides.map(sd=>sideName(sd)).join(' vs ')}
function hrRundown(then,end,title){const l=LQ.quiet;LQ.quiet=[];
 const rows=l.map(it=>`<div class="hrrow"><span class="hrl">${esc(it.kind==='promo'?'Promo':it.main?'Main event':'Match '+it.n)}</span><span class="hrt"><b>${esc(hrWho(it))}</b><small>${esc(hrLine(it))}</small></span><span class="hrd ${it.dc>0?'up':it.dc<0?'dn':''}">${it.dc>0?'▲':it.dc<0?'▼':'–'}</span></div>`).join('');
 HR_NEXT=then;openModal(`${liveHd(LQ.show,'The rundown',title||(end?'The show is wrapping up':'Meanwhile on the card'),[],'● Live')}<div class="hrrun">${rows}</div><button class="btn" onclick="hrGo()">${end?'Finish the show':'Continue the show ▸'}</button>`,true)}
let HR_NEXT=null;function hrGo(){const f=HR_NEXT;HR_NEXT=null;if(f)f()}
/* ---- the rival's show and the balance sim: the same rules, decided on autopilot ---- */
function hrAuto(card,b,sh){if(!card)return;HRC=hrStart(b,sh);let hits=0;const cap=hrCap();card.forEach(sl=>{if(sl&&sl.d)delete sl.d._hrArc});const plan=hrPlan(card,sh&&sh.ppv,b);const ms=card.map((x,j)=>x&&x.k==='match'&&x.d&&validMatch(x.d)?j:-1).filter(j=>j>=0);
 card.forEach((sl,j)=>{if(!sl||!sl.d)return;
  if(sl.k==='promo'){const p=sl.d;if(hits<cap&&plan.get(p)){hits++;if(b==='p')hrCount('arc')}hrMove(p.res?p.res.stars:2.5);return}
  if(sl.k!=='match'||!validMatch(sl.d))return;const m=sl.d;const main=j===ms[ms.length-1];
  if(!(m.ev&&m.ev.hit)){const why=hits<cap&&plan.get(m);if(why){hits++;if(b==='p')hrCount(why);const reel=hrScene({main},m,'match',why,sh.ppv);if(reel)msAutoReel(m,b,reel);else msAuto(m,b,sh.ppv||main)}
   else{const g=matchEvent(m,b,sh.ppv||main,0);if(g)runEvAI(g,m)}}
  let base=3;try{base=rateMatch(m,{ppv:sh.ppv,preview:true}).stars}catch(e){}hrMove(base+(m.ev&&m.ev.stars||0))})}
Object.assign(window,{hrPlan,hrDemand,hrBlood,hrArc,hrCap,hrStart,hrRoll,hrAfter,hrBug,hrRundown,hrGo,hrAuto,hrTag,hrCm,hrWord});
(function(){const c=document.createElement('style');c.textContent=`
.hrbug{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;margin:-2px 0 10px;font:800 italic 12px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.hrbar{height:9px;background:#15161a;position:relative;clip-path:var(--sl,none);overflow:hidden}.hrbar i{position:absolute;inset:0;transform-origin:0 50%;background:linear-gradient(90deg,#5a6a8a,var(--gold) 55%,#d8261f);transition:transform .6s}
.hrw{color:var(--gold2);font-size:15px}.hrn{color:var(--text)}
.hrtag{display:inline-block;margin-top:4px;font:800 italic 11px/1 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:3px 7px 2px;background:#1d1e23;color:var(--mut)}
.hrtag.hi{background:rgba(216,38,31,.22);color:#ffb4a8}.hrtag.md{background:rgba(242,193,78,.14);color:var(--gold2)}
.hrrun{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.hrrow{display:grid;grid-template-columns:86px 1fr auto;gap:10px;align-items:center;background:var(--s2,#1e1f24);padding:9px 10px;clip-path:var(--sl,none)}
.hrl{font:900 italic 13px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;color:var(--gold2);letter-spacing:.04em}
.hrt{min-width:0;display:flex;flex-direction:column}.hrt b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hrt small{color:var(--mut)}
.hrd{font-size:16px;color:var(--mut)}.hrd.up{color:#4cd07d}.hrd.dn{color:#ff6a55}
body.tv .hrbug{font-size:18px}body.tv .hrbar{height:14px}`;document.head.appendChild(c)})();

function hrArcDecision(a){
 const lines=ARC_REEL_END[a?.k];
 const options=arcChoiceOptions(a);
 return options.length&&options.every(o=>lines?.[o.k])?lines:null
}
function hrFinishText(m){
 if(m.nc)return 'The referee calls for the bell. The match ends without a winner.';
 const fin=finOf(m);
 if(fin==='dq')return '{W} wins by disqualification.';
 if(fin==='co')return '{W} beats the referee’s count.';
 if(fin==='cheat')return '{W} gets the win with help. The replay makes clear what the referee missed.';
 if(fin==='upset'&&!FIN_NOPIN.has(stipKey(m)))return '{W} catches the opponent with a roll-up and gets the win.';
 if(isSp(m)||m.type==='gauntlet')return '{W} gets the win.';
 return BLOOD_REEL[stipKey(m)][4]
}
function hrNames(text,m){
 if(!m)return text;
 const win=m.sides[m.winner]||[];
 return text.replace(/\{W\}/g,()=>sideName(win)).replace(/\{L\}/g,()=>S.w[pinOf(m)]?.name||sideName(m.sides.filter((_,i)=>i!==m.winner).flat()))
}
function hrScene(it,d,kind,why=LQ?.hrWhy,ppv=LQ?.ppv){
 if(why==='blood'){
  const pair=hrBloodPair(d,ppv);if(!pair)return null;
  const stip=stipKey(d),[opens,text,...beats]=BLOOD_REEL[stip]||BLOOD_REEL.std;
  const log=(S.fh?.[key(pair.a,pair.b)]||[]).filter(row=>row.n||row.seg);
  const i=RI(0,opens.length-1);
  const middle=log[Math.floor(log.length/2)];
  const last=log[log.length-1];
  const beat=i===0?log[0]:i===1?middle:last;
  const start=beat?[beat.seg,beat.n].filter(Boolean).join(' — '):'The rivalry has never had a decisive ending.';
  const A=S.w[pair.a],B=S.w[pair.b];
  const audiences=[fgOf(A),fgOf(B)];
  const mismatch=audiences[0].includes('blood')&&audiences[1].includes('cas')||audiences[1].includes('blood')&&audiences[0].includes('cas');
  return {blood:true,stip,open:[`Previously in ${A.name} vs ${B.name}: ${start}`,opens[i],mismatch?'One half of the crowd came to see its star. The other half came to see how much a star could take.':''],
   heat:[text,beats[0],beats[1]],cast:pair,locked:it.arcDecision};
 }
 const a=hrArc(kind,d,it.main);if(!a)return null;
 if(kind==='match')d._hrArc=1;
 const script=ARC_REEL[a.k];if(!script)return null;
 const cast={...a};
 const seg=kind==='match'?d:null;
 let variant=kind==='promo'?'promo':'match';
 if(seg){
  const side=seg.sides.find(sd=>sd.includes(a.a));
  const runIn=riOn(seg);
  if(runIn?.X.id===a.a&&!side)variant=runIn.k==='attack'?'postrunin':'runin';
  else if(side?.includes(a.b))variant='team';
  cast.stip=stipKey(seg);
  if(!cast.b)cast.b=seg.sides.find(sd=>!sd.includes(a.a))?.[0];
  if(!a.b&&a.foe)cast.b=a.foe;
 }else if(!cast.b)cast.b=d.a===a.a?d.b:d.a;
 const custom=ARC_REEL_VARIANT[a.k+'/'+variant];
 const road=ARC_REEL_STORY[a.k+'/'+a.sl];
 const story=arcStoryOf(a);
 const romance=story?.romance;
 const romanceNote=romance&&a.k!=='wedding'&&adReelRomance([a.a,a.b].filter(Boolean).map(id=>S.w[id]))?
  'Their eyes meet as the crowd settles. For a moment, neither is in a hurry to look away.':'';
 const intro=road?.[0]||custom?.[0]||script[0];
 const head=!road&&!romance&&story?(arcHead(a).replace(/[.!?]$/,'')+'.'):'';
 const finish=a.k==='torch'&&kind==='promo'?[
  '{A} is about to give {B} the mic in the middle of the ring.',
  ['Pass the mic without another word','{B} takes the mic. {A} steps out of the spotlight and the whole room waits to hear what comes next.'],
  script[2][2]]:script[2];
 let heat=custom?.[1]||script[1];
 if(seg&&['proveit','cross'].includes(a.k)&&HR_CROWD_HEAT[a.g])heat=HR_CROWD_HEAT[a.g];
 if(a.k==='heelturn'&&a.sl==='watch'&&kind==='promo'){
  heat=['{B} asks whether {A} can get through one conversation without looking at the watch.',
   ['Let {A} check the time before answering','{A} reads the face of the watch, then looks up. “I can make time for the people who matter.” {A} knocks the mic out of {B}’s hand and hits {B:them}.'],
   ['Make {B} interrupt the sales pitch','{A} starts describing the watch until {B} asks for it to stop. {A} stops talking and hits {B:them} instead.']];
 }
 if(seg&&['school','twitch'].includes(a.k)){
  const [,setup,safe,risk]=BLOOD_REEL[cast.stip];
  // Feud spots here do double duty as stipulation-specific wrestling.
  heat=[setup,safe,risk];
 }
 const def=aDForReel(a);
 const leave=a.k==='stakes'&&/8 weeks/i.test(def.payoff||'');
 const result=leave?[road?.[1],'{L} is gone for eight weeks.']: [road?.[1]];
 return {a,cast,open:[def.n+'.',head,intro,romanceNote],heat,fin:finish,
  result:result.filter(Boolean),decision:!a.choice&&hrArcDecision(a)};
}
function hrFill(reel,text,m){return hrNames(arcWords(reel.cast,text),m)}
function hrBeat(reel,beat,m){
 const fill=t=>hrFill(reel,t,m);
 return {setup:fill(beat[0]),calls:beat.slice(1).map(([label,land],i)=>{
  const phase=beat===reel.heat?0:1;
  const miss=fill(HR_ARC_MISS[reel.a?.k]?.[phase]||(m?
   i?'The timing is half a beat off. The replay makes clear what they were going for.':'The exchange is there, but only the front rows pick up on it.':
   i?'The line takes too long to get out. A murmur spreads before the room catches the point.':'A few fans respond. The rest of the room is still waiting for the line that will bring them in.'));
  return {t:fill(label),tip:i?'Bigger swing':'Lower risk',s:m?'ring':'mic',d:i?.18:-.05,st:i?.7:.3,fat:m&&i?3:0,injury:m&&reel.blood,ok:fill(land),no:miss,
   hit:[[['x',fill(land)]]],miss:[[['x',miss]]]};
 })};
}
const HR_BLOOD_FINISH=[
 {key:'clean',label:'Settle it decisively',info:'Keeps the booked winner. Ends the feud.'},
 {key:'flip',label:'Give the other side the decisive win',info:'Changes the winner. Ends the feud.'},
 {key:'dirty',label:'Let the finish be stolen',info:'The booked winner stands. The feud continues.'},
 {key:'nc',label:'Let it break down',info:'No contest. The feud continues.'}
];
function hrBloodFinish(m,reel,k){
 if(reel.locked||m.nc)return m.nc?'The referee waves it off. Neither rival gets the last word.':hrFinishText(m);
 const ev=evNew(m);ev.hit=true;
 const old=m.winner;
 if(k==='nc'){m.nc=true;ev.stars-=.35;return 'The ref calls it off while the fight is still going. Neither rival got the ending everyone came for.'}
 if(k==='flip'){
  const rival=m.sides[old].includes(reel.cast.a)?reel.cast.b:reel.cast.a;
  m.winner=m.sides.findIndex(side=>side.includes(rival)&&side!==m.sides[old]);
  if(m.winner<0)m.winner=m.sides.findIndex((_,i)=>i!==old);
 }
 m.fin=k==='dirty'?'cheat':'clean';
 if(k==='dirty'){
  ev.feudUnsettled=true;
  return hrFinishText({...m,fin:'clean'})+' '+(BLOOD_DIRTY[reel.stip]||'The replay catches the cheap shot that opened the way. The other corner is already asking for a rematch.')
 }
 return hrFinishText(m)
}

function hrCallRoles(reel,roles){
 return {...roles,A:S.w[reel.cast.a]||roles.A,B:S.w[reel.cast.b]||roles.B};
}
