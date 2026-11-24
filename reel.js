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
const hrFatherPayoff=a=>a?.k==='gauntlet'&&a.sl==='father';
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
 const a=b==='ai'?null:hrArc(kind,d,main);
 if(hrFatherPayoff(a))return 'arc';
 if(kind==='match'&&hrBlood(d,ppv))return 'blood';
 return a&&(kind==='promo'||main||ppv)?'arc':''
}
function hrPlan(card,ppv,b){
 const out=new Map();if(!card)return out;
 const main=card.findLastIndex(sl=>sl?.k==='match'&&sl.d);
 const father=b==='ai'?null:card.find((sl,i)=>sl?.k==='match'&&hrPlayable('match',sl.d)&&hrFatherPayoff(hrArc('match',sl.d,i===main)));
 let blood=null,arc=null;
 card.forEach((sl,i)=>{
  if(!sl||sl===father||sl.k!=='match'||!hrPlayable('match',sl.d))return;
  const heat=hrBlood(sl.d,ppv);
  if(heat&&(!blood||heat>blood.heat||heat===blood.heat&&i===main))blood={d:sl.d,heat};
 });
 if(blood)out.set(blood.d,'blood');
 if(father)out.set(father.d,'arc');
 else if(b!=='ai'){
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
 if(m.nc)return 'The referee calls it off. No contest.';
 const fin=finOf(m),stip=stipKey(m);
 if(fin==='dq')return '{L} is disqualified. {W} wins.';
 if(fin==='co')return 'The referee counts {L} out. {W} wins by count-out.';
 if(fin==='cheat')return (BLOOD_DIRTY[stip]||BLOOD_DIRTY.std);
 if(fin==='upset'&&!FIN_NOPIN.has(stip)&&!['texas','iron','twoof3'].includes(stip))return '{P} catches {L} in a roll-up for three. {W} wins.';
 if(m.type==='rumble')return '{P} sends the last entrant over the top rope. {W} wins the Rumble.';
 if(m.type==='mitb')return '{P} unhooks the Money in the Bank briefcase and wins.';
 if(m.type==='gauntlet')return '{P} takes the first fall and wins the Casino Gauntlet.';
 return BLOOD_REEL[stip][4]
}
function hrNames(text,m,cast){
 if(!m)return text;
 const win=m.sides[m.winner]||[];
 const losers=m.sides.filter((_,i)=>i!==m.winner).flat();
 const p=[cast?.a,cast?.b,win[0]].find(id=>win.includes(id));
 const title=m.title&&S.titles[m.title];
 const fields={W:sideName(win),P:S.w[p]?.name,L:S.w[pinOf(m)||losers[0]]?.name,
  PRIZE:cast?.sl==='custody'?'the custody papers':m.type==='mitb'?'the Money in the Bank briefcase':title?'the '+title.n+' title belt':'the prize'};
 return text.replace(/\{(W|P|L|PRIZE)\}/g,(_,k)=>fields[k]||'')
}
function hrTitleText(m){
 const title=m.title&&S.titles[m.title];
 if(!title)return '';
 const champions=title.holders;
 const holder=m.sides.findIndex(sd=>champions.length&&champions.every(id=>sd.includes(id)));
 if(holder<0&&champions.length&&title.won===AW())return `${sideName(champions)} already holds the ${title.n} title. The belt stays put.`;
 if(m.nc)return `The ${title.n} title stays put.`;
 if(holder===m.winner||holder>=0&&['dq','co'].includes(finOf(m)))return `${sideName(champions)} keeps the ${title.n} title.`;
 return `${sideName(m.sides[m.winner])} leaves with the ${title.n} title.`
}
function hrScene(it,d,kind,why=LQ?.hrWhy,ppv=LQ?.ppv){
 if(why==='blood'){
  const pair=hrBloodPair(d,ppv);if(!pair)return null;
  const stip=stipKey(d),[opens,text,safe,risk]=BLOOD_REEL[stip];
  const log=(S.fh?.[key(pair.a,pair.b)]||[]).filter(row=>row.n||row.seg);
  const i=RI(0,opens.length-1);
  const beat=log[[0,Math.floor(log.length/2),log.length-1][i]];
  const start=beat?[beat.seg,beat.n].filter(Boolean).join(' — '):'The bad blood between these two brings them to this match.';
  const A=S.w[pair.a],B=S.w[pair.b];
  const audiences=[fgOf(A),fgOf(B)];
  const mismatch=audiences[0].includes('blood')&&audiences[1].includes('cas')||audiences[1].includes('blood')&&audiences[0].includes('cas');
  return {blood:true,stip,open:[`Previously in ${A.name} vs ${B.name}: ${start}`,opens[i],mismatch?'One half of the crowd came to see its star. The other half came to see how much a star could take.':''],
   heat:[text,safe,risk],cast:pair,locked:it.arcDecision};
 }
 const a=hrArc(kind,d,it.main);if(!a)return null;
 const script=ARC_REEL[a.k];if(!script)return null;
 const cast={...a};
 const seg=kind==='match'?d:null;
 const runIn=seg&&riOn(seg);
 const variant=!seg?'promo':runIn?.X.id===a.a?(runIn.k==='cost'?'runin':'postrunin'):
  a.k==='mentor'&&a.sl==='violence'?'violence':a.k==='cult'?'match':
  seg.sides.some(sd=>sd.includes(a.a)&&sd.includes(a.b))?'team':'match';
 if(seg){
  d._hrArc=1;
  cast.stip=stipKey(seg);
  const opponents=seg.sides.filter(sd=>!sd.includes(runIn?.X.id===a.a?a.b:a.a)).flat();
  cast.opponent=runIn?.k==='save'?runIn.T.id:opponents[0];
  if(!cast.b)cast.b=cast.opponent;
 }else if(!cast.b||['join','faith','cult'].includes(a.k))cast.b=d.a===a.a?d.b:d.a;
 if(a.k==='cult'){
  const participants=seg?seg.sides.find(side=>side.includes(a.a))||[]:[d.a,d.b];
  [cast.b,cast.c]=arcCultFollowers(a,participants);
 }

 const custom=ARC_REEL_VARIANT[a.k+'/'+variant];
 const road=ARC_REEL_STORY[a.k+'/'+a.sl];
 const story=arcStoryOf(a);
 const romanceNote=story?.romance&&a.k!=='wedding'&&adReelRomance([a.a,a.b].filter(Boolean).map(id=>S.w[id]))?
  'Their eyes meet as the crowd settles. For a moment, neither is in a hurry to look away.':'';
 const def=aDForReel(a);
 const intro=custom?.[0]||script[0];
 const stakes=a.k==='stakes'&&(def.vn==='Loser Leaves Town'
  ?'Both agreed that the loser will leave town for eight weeks.'
  :road?.[1]?'':'They put their reputations on the line. The loser has to live with the embarrassment of losing this fight.');
 const open=[def.n+'.',road?.[0]||(!['wedding','faith','haircut','goodwill','war','townhero','likeness','pain','oil'].includes(a.k)&&story?arcHead(a).replace(/[.!?]$/,'')+'.':''),
  intro,stakes,romanceNote];
 let heat=custom?.[1]||script[1];
 let finish=custom?.[2]||script[2];
 const specific=ARC_REEL_VARIANT[a.k+'/'+a.sl];
 if(specific&&['voice','shoot','rebrand'].includes(a.k)){
  heat=specific[1]||heat;
  finish=specific[2]||finish;
 }
 if(a.k==='mentor'&&a.sl==='fraud'){heat=specific[1];finish=specific[2]}
 if(seg&&['proveit','cross'].includes(a.k)&&HR_CROWD_HEAT[a.g])heat=HR_CROWD_HEAT[a.g];
 if(a.k==='heelturn'&&a.sl==='watch'&&kind==='promo')heat=ARC_REEL_VARIANT['heelturn/watch'][1];
 if(seg&&['school','twitch','hardcore','techshow'].includes(a.k)){
  const [,setup,safe,risk]=BLOOD_REEL[cast.stip];
  const lead={
   school:'This is the part of {S} that used to catch {A} out.',
   twitch:'This is what chat voted to see.',
   hardcore:'This is what the rough matches were preparing {A} for.',
   techshow:'The two technicians have traded falls.'
  };
  const line=lead[a.k];
  heat=[line+' '+setup,safe,risk];
 }
 if(a.k==='lastchase'&&a.sl!=='hangup'){
  heat=['{A} sees {PRIZE} at ringside and looks back to {O}.',
   ['Bring back an old title-match counter','{A} slips out of the old hold before {O} can lock it in.'],
   ['Force one more exchange','{A} digs in and makes {O} find a new answer.']];
  finish=['The title is at stake in the final exchange.'];
 }
 const afterBell=seg&&(variant==='postrunin'||['heelturn','betrayal','breakfree'].includes(a.k)&&runIn?.X.id!==a.a);
 const finishBeforeCall=['sellout','invasion','torch','passtitle','groundswell','redemption','townhero','peace','likeness','retire','farewell','haircut'].includes(a.k);
 return {a,cast,open,heat,fin:finish,variant,afterBell,finishBeforeCall,
  result:[road?.[1],a.k==='stakes'&&def.vn==='Loser Leaves Town'?'{L} is gone for eight weeks.':''].filter(Boolean),
  decision:!a.choice&&hrArcDecision(a),father:hrFatherPayoff(a)};
}
function hrFill(reel,text,m){
 const filled=arcWords(reel.cast,text).replace(/\{O\}/g,()=>S.w[reel.cast.opponent]?.name||'the opponent');
 return hrNames(filled,m,reel.cast)
}
function hrBeat(reel,beat,m){
 const fill=t=>hrFill(reel,t,m);
 return {setup:fill(beat[0]),calls:beat.slice(1).map(([label,land],i)=>{
  const phase=beat===reel.heat?0:1;
  const named=HR_ARC_MISS[reel.a?.k]?.[phase];
  // A botched camera cue or delivery can cost the reaction without changing the booked action.
  const miss=fill(reel.a&&(named&&reel.variant==='match'
   ?named:land+' The timing is off, and the crowd takes a moment to catch up.')||
   'The exchange happens too fast for the crowd to follow. The replay gives them a better look.');
  return {t:fill(label),tip:i?'Bigger swing':'Lower risk',s:m?'ring':'mic',d:i?.18:-.05,st:i?.7:.3,fat:m&&i?3:0,injury:m&&reel.blood,ok:fill(land),no:miss,
   hit:[[['x',fill(land)]]],miss:[[['x',miss]]]};
 })};
}
function hrArcAfter(reel,m){
 const a=reel.a,winner=m?.sides[m.winner]||[];
 const line=ARC_REEL_CLOSE[a.k];
 let result=typeof line==='function'?line(reel,m,winner):line;
 if(a.k==='retire'&&aDForReel(a).vn==='Absorption'&&!m.nc){
  const t=arcAbsorbedTrait(S.w[winner[0]],S.w[m.sides.find(sd=>sd!==winner)?.[0]]);
  result=t?`{L} walks out for good. {P} takes in {L}’s aura and inherits ${TRAITS[t].n}.`:'{L} walks out for good. {P} reaches for the departing aura and feels it slip away.';
 }
 return [result,...(m?.nc?[]:reel.result)].filter(Boolean)
}
function hrBloodFlip(m,reel){
 const side=id=>m.sides.findIndex(sd=>sd.includes(id));
 return [...new Set([side(reel.cast.a),side(reel.cast.b)])].filter(i=>i>=0&&i!==m.winner)
}
function hrBloodOptions(m,reel){
 const flips=hrBloodFlip(m,reel);
 return [
  {key:'clean',label:'Settle it decisively',info:'Keeps the booked winner. Ends the feud.'},
  ...flips.map(side=>({key:'flip:'+side,label:'Give the decisive win to '+sideName(m.sides[side]),info:'Changes the winner. Ends the feud.'})),
  {key:'dirty',label:'Let the finish be stolen',info:'The booked winner stands. The feud continues.'},
  {key:'nc',label:'Let it break down',info:'No contest. The feud continues.'}
 ]
}
function hrBloodFinish(m,reel,k){
 if(reel.locked||m.nc)return hrFinishText(m);
 const ev=evNew(m);ev.hit=true;
 if(k==='nc'){m.nc=true;ev.stars-=.35;return 'The referee calls it off. No contest. The rivals keep fighting.'}
 if(k?.startsWith('flip:')){const side=Number(k.slice(5));if(hrBloodFlip(m,reel).includes(side))m.winner=side}
 m.fin=k==='dirty'&&!finWhy(m,'cheat')?'cheat':'clean';
 if(k==='dirty'){ev.feudUnsettled=true;return BLOOD_DIRTY[reel.stip]||BLOOD_DIRTY.std}
 return hrFinishText(m)
}

function hrCallRoles(reel,roles){
 return {...roles,A:S.w[reel.cast.a]||roles.A,B:S.w[reel.cast.b]||roles.B};
}
