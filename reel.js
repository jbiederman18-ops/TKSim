/* Tony Khan Simulator — highlight reels and the live crowd (v260).
   A live show no longer stops for every promo and the main event. Each segment rolls for a highlight reel as it comes up:
   the odds rise with feud heat, a title on the line, a wild stipulation, daring wrestlers (flyers, showmen, brawlers),
   a hot crowd and big shows — plus luck. A highlight reel plays out as the full showdown (the match or promo showdown);
   everything else resolves quietly and shows up in a short rundown. v481: only segments that demand one get a highlight reel (hrDemand: a blood feud settled, an arc's payoff). v265: lines and moments avoid what you've seen lately (fpick).
   The crowd builds (or dies) across the night. A hot crowd pushes wrestlers to reach for more: risky calls in a match
   highlight swing further both ways and carry real injury risk. Tired wrestlers miss more.
   Loaded after the main script; everything here is only called once the game is running. */
'use strict';
/* v481: a highlight reel is for a segment that demands it — a blood feud being settled, or an arc's payoff. Those always
   play out in full, live; nothing else does (a disaster brewing backstage still comes to you live, any night). */
const HR_CAP=2,HR_CAP_PPV=2,HR_BLOOD=75;/* one blood feud payoff and one arc payoff a night, at most */
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
/* the heat of the hottest blood feud (🔥🔥🔥 75+) this match can settle (0 = none): any PPV match but the Rumble, ladder specials and the Gauntlet, or a TV blow-off */
function hrBlood(m,ppv){let best=0;if(!m||!m.sides||!(ppv||m.bo))return 0;if(ppv&&(m.type==='rumble'||m.type==='mitb'||m.type==='gauntlet'||(typeof isSp==='function'&&isSp(m))))return 0;
 for(let i=0;i<m.sides.length;i++)for(let j=i+1;j<m.sides.length;j++)for(const a of m.sides[i])for(const b of m.sides[j]){const h=heatOf(a,b);if(h<HR_BLOOD)continue;const f=S.fs&&S.fs[key(a,b)];if(!(f&&f.paid))best=Math.max(best,h)}
 return best}
/* the segment as booked pays off one of your arcs */
function hrArc(kind,d,main){return typeof arcPaysOff==='function'&&arcPaysOff(kind,d,main)}
/* '' = an ordinary segment; 'blood' / 'arc' = it could carry a highlight reel */
function hrDemand(kind,d,main,ppv,b){if(!d)return '';if(kind==='promo'){if(!d.a||!S.w[d.a]||d.cut)return '';return b!=='ai'&&hrArc('promo',d,main)?'arc':''}/* PPV cards have no promo slots, so a promo payoff counts any night */
 if(typeof msOn==='function'&&!msOn(d))return '';if(hrBlood(d,ppv))return 'blood';if(b!=='ai'&&(main||ppv)&&hrArc('match',d,main))return 'arc';return ''}
/* the night's plan: at most one blood feud payoff (the hottest; the main event breaks a tie) and one arc payoff (the main
   event's first, then the latest on the card). Returns a Map of segment → 'blood' / 'arc'. */
function hrPlan(card,ppv,b){const out=new Map();if(!card)return out;const ms=card.map((x,j)=>x&&x.k==='match'&&x.d?j:-1).filter(j=>j>=0);const me=ms[ms.length-1];
 let bl=null,bh=0,ar=null;card.forEach((sl,j)=>{if(!sl||!sl.d)return;const kind=sl.k==='promo'?'promo':sl.k==='match'?'match':null;if(!kind)return;const main=j===me;
  const why=hrDemand(kind,sl.d,main,ppv,b);if(why==='blood'){const h=hrBlood(sl.d,ppv)+(main?.5:0);if(h>bh){bh=h;bl=sl.d}}else if(why==='arc'&&(!ar||main||!ar.main))ar={d:sl.d,main}});
 if(bl)out.set(bl,'blood');if(ar&&!out.has(ar.d))out.set(ar.d,'arc');return out}
const HR_WHYW={blood:'Blood feud payoff',arc:'Arc payoff'};
/* tallies for tools/balance-sim.js */
const hrCount=why=>{window.hrN=(window.hrN||0)+1;if(why==='blood')window.hrNb=(window.hrNb||0)+1};
function hrTag(sl,i){try{if(!S||S.phase!=='season'||!sl||!sl.d)return '';const sh=curShow();const why=hrPlan(S.card.p,sh.ppv,'p').get(sl.d);if(!why)return '';
  return `<span class="hrtag hi">🎬 Highlight reel: ${HR_WHYW[why]}</span>`}catch(e){return ''}}
/* ---- the live show ---- */
/* decide a segment as it comes up: true = highlight reel */
function hrRoll(kind,d,main,ppv){if(!LQ||LQ.hr>=hrCap())return false;HRC=LQ.crowd;if(!LQ.plan){(S.card.p||[]).forEach(sl=>{if(sl&&sl.d)delete sl.d._hrArc});LQ.plan=hrPlan(S.card.p,ppv,'p')}const why=LQ.plan.get(d);if(!why)return false;LQ.plan.delete(d);if(why==='arc'&&kind==='match')d._hrArc=1;LQ.hr++;LQ.hrWhy=why;hrCount(why);return true}
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
  if(!(m.ev&&m.ev.hit)){const why=hits<cap&&plan.get(m);if(why){hits++;if(why==='arc')m._hrArc=1;if(b==='p')hrCount(why);msAuto(m,b,sh.ppv||main)}
   else{const g=matchEvent(m,b,sh.ppv||main,0);if(g){if(g.sit)hits++;runEvAI(g,m)}}}
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
