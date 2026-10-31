/* Tony Khan Simulator — highlight reels and the live crowd (v260).
   A live show no longer stops for every promo and the main event. Each segment rolls for a highlight reel as it comes up:
   the odds rise with feud heat, a title on the line, a wild stipulation, daring wrestlers (flyers, showmen, brawlers),
   a hot crowd and big shows — plus luck. A highlight reel plays out as the full showdown (the match or promo showdown);
   everything else resolves quietly and shows up in a short rundown. At most HR_CAP highlight reels a show.
   The crowd builds (or dies) across the night. A hot crowd pushes wrestlers to reach for more: risky calls in a match
   highlight swing further both ways and carry real injury risk. Tired wrestlers miss more.
   Loaded after the main script; everything here is only called once the game is running. */
'use strict';
const HR_CAP=3;
const HR_DARE={fl:.95,sh:.8,br:.8,te:.55,pw:.5};
/* ---- the crowd: 0–100, starts from the show's buzz and the size of the night ---- */
let HRC=50;/* the crowd for whoever is airing right now (live show, the rival, the sim) */
function hrStart(b,sh){const bz=typeof buzzOf==='function'?buzzOf(b):3;return clamp(Math.round(42+(bz-3)*12+(sh&&sh.ppv?10:0)+(sh&&sh.special?6:0)),20,78)}
const hrWord=c=>c<30?'Cold':c<55?'Warm':c<75?'Hot':'Electric';
/* how much the crowd pushes risk-taking: about ×0.8 in a cold room, ×1.4 when it's electric */
const hrCm=()=>clamp(1+(HRC-50)/125,.75,1.4);
/* a segment moves the crowd: a 3½★ segment keeps it where it is, a great one fires it up, a dud cools it off */
function hrMove(stars,extra){HRC=clamp(Math.round(HRC+clamp((stars-3.5)*8,-10,10)+(extra||0)),5,100);return HRC}
/* ---- the odds a segment turns into a highlight reel ---- */
function hrMatchOdds(m,main,ppv){if(!m||!m.sides||!validMatch(m)||m.type==='squash'||(typeof isSq==='function'&&isSq(m)))return 0;
 const all=m.sides.flat().map(id=>S.w[id]).filter(Boolean);if(all.length<2)return 0;
 let h=0;for(let i=0;i<m.sides.length;i++)for(let j=i+1;j<m.sides.length;j++)m.sides[i].forEach(a=>m.sides[j].forEach(b=>{h=Math.max(h,heatOf(a,b))}));
 const st=STIPS[typeof stipKey==='function'?stipKey(m):m.stip]||STIPS.std;const dare=all.reduce((s,w)=>s+(HR_DARE[w.st]||.6),0)/all.length;
 const p=.08+HRC/260+h/260+(m.title?.12:0)+clamp(((st.inj||1)-1)*.15+(st.g==='big'?.08:0),0,.25)+(dare-.65)*.35+(ppv?.06:0)+(main?.04:0)+(all.length>=4?.04:0);
 return clamp(p,.05,.85)}
function hrPromoOdds(p,ppv){if(!p||!p.a||!S.w[p.a])return 0;const A=S.w[p.a],B=p.b&&S.w[p.b];
 const mic=Math.max(A.mic,B?B.mic:0);const h=B?heatOf(A.id,B.id):0;
 return clamp(.08+HRC/260+h/220+(mic-70)/300+(B?.05:0)+(ppv?.05:0),.05,.8)}
const hrOddsWord=p=>p>=.5?'Likely':p>=.3?'Possible':'Unlikely';
/* the Book screen tag: the odds against the crowd you'd start the night with */
function hrTag(sl,i){try{if(!S||S.phase!=='season'||!sl||!sl.d)return '';const sh=curShow();const c0=HRC;HRC=hrStart('p',sh);
  let p=0;if(sl.k==='match'){const ms=S.card.p.map((x,j)=>x&&x.k==='match'&&x.d?j:-1).filter(j=>j>=0);p=hrMatchOdds(sl.d,i===ms[ms.length-1],sh.ppv)}else if(sl.k==='promo')p=hrPromoOdds(sl.d,sh.ppv);HRC=c0;
  if(!p)return '';const w=hrOddsWord(p);return `<span class="hrtag ${w==='Likely'?'hi':w==='Possible'?'md':''}">🎬 Highlight reel: ${w}</span>`}catch(e){return ''}}
/* ---- the live show ---- */
/* decide a segment as it comes up: true = highlight reel */
function hrRoll(kind,d,main,ppv){if(!LQ||LQ.hr>=HR_CAP)return false;HRC=LQ.crowd;const p=kind==='promo'?hrPromoOdds(d,ppv):hrMatchOdds(d,main,ppv);if(Math.random()<p){LQ.hr++;return true}return false}
/* a segment finished: move the crowd. Matches use their projected rating plus whatever the calls added. */
function hrAfter(it){if(!LQ||!it)return;HRC=LQ.crowd;let s=3,txt='';
 if(it.kind==='promo'||it.k==='promo'){const p=S.card.p[it.i]&&S.card.p[it.i].d;s=p&&p.res?p.res.stars:2.5}
 else if(it.m){let base=3;try{base=rateMatch(it.m,{ppv:curShow().ppv,preview:true}).stars}catch(e){}s=base+(it.m.ev&&it.m.ev.stars||0)}
 const was=LQ.crowd;LQ.crowd=hrMove(s);it.crowd=LQ.crowd;it.dc=LQ.crowd-was}
function hrBug(){if(!LIVE||!LQ||LQ.crowd==null)return '';const c=LQ.crowd;
 return `<div class="hrbug"><span class="hrk">The crowd</span><span class="hrbar"><i style="width:${c}%"></i></span><b class="hrw">${hrWord(c)}</b><span class="hrn">🎬 ${LQ.hr}/${HR_CAP}</span></div>`}
/* the quiet segments since the last highlight reel, in one short screen */
const HR_Q={match:{hi:['A strong match. The crowd is with them.','Good stuff, and the fans let them know it.','They worked hard and it showed.'],mid:['A solid match. Nothing more, nothing less.','It did its job.','Steady work. Polite applause.'],lo:['That one never got going.','The crowd sat on their hands.','A flat match. A few people checked their phones.']},
 promo:{hi:['The mic work landed. The crowd ate it up.','A strong promo. People were hanging on every word.'],mid:['A fine promo that set things up.','It got the point across.'],lo:['The promo fell flat.','The crowd wasn\'t buying it.']}};
function hrLine(it){const k=it.kind==='promo'?'promo':'match';const d=it.dc||0;return pick(HR_Q[k][d>=4?'hi':d<=-3?'lo':'mid'])}
function hrWho(it){if(it.kind==='promo'){const p=S.card.p[it.i]&&S.card.p[it.i].d;return p?[p.a,p.b].filter(Boolean).map(id=>S.w[id]&&S.w[id].name).join(' & '):''}return it.m.sides.map(sd=>sideName(sd)).join(' vs ')}
function hrRundown(then,end){const l=LQ.quiet;LQ.quiet=[];
 const rows=l.map(it=>`<div class="hrrow"><span class="hrl">${esc(it.kind==='promo'?'Promo':it.main?'Main event':'Match '+it.n)}</span><span class="hrt"><b>${esc(hrWho(it))}</b><small>${esc(hrLine(it))}</small></span><span class="hrd ${it.dc>0?'up':it.dc<0?'dn':''}">${it.dc>0?'▲':it.dc<0?'▼':'–'}</span></div>`).join('');
 HR_NEXT=then;openModal(`${liveHd(LQ.show,'The rundown',end?'The show is wrapping up':'Meanwhile on the card',[],'● Live')}<div class="hrrun">${rows}</div><button class="btn" onclick="hrGo()">${end?'Finish the show':'Continue the show ▸'}</button>`,true)}
let HR_NEXT=null;function hrGo(){const f=HR_NEXT;HR_NEXT=null;if(f)f()}
/* ---- the rival's show and the balance sim: the same rules, decided on autopilot ---- */
function hrAuto(card,b,sh){if(!card)return;HRC=hrStart(b,sh);let hits=0;const ms=card.map((x,j)=>x&&x.k==='match'&&x.d&&validMatch(x.d)?j:-1).filter(j=>j>=0);
 card.forEach((sl,j)=>{if(!sl||!sl.d)return;
  if(sl.k==='promo'){const p=sl.d;if(hits<HR_CAP&&Math.random()<hrPromoOdds(p,sh.ppv))hits++;hrMove(p.res?p.res.stars:2.5);return}
  if(sl.k!=='match'||!validMatch(sl.d))return;const m=sl.d;const main=j===ms[ms.length-1];
  if(!(m.ev&&m.ev.hit)){if(hits<HR_CAP&&typeof msOn==='function'&&msOn(m)&&Math.random()<hrMatchOdds(m,main,sh.ppv)){hits++;msAuto(m,b,sh.ppv||main)}
   else{const g=matchEvent(m,b,sh.ppv||main,0);if(g)runEvAI(g,m)}}
  let base=3;try{base=rateMatch(m,{ppv:sh.ppv,preview:true}).stars}catch(e){}hrMove(base+(m.ev&&m.ev.stars||0))})}
Object.assign(window,{hrStart,hrRoll,hrAfter,hrBug,hrRundown,hrGo,hrAuto,hrTag,hrCm,hrWord});
(function(){const c=document.createElement('style');c.textContent=`
.hrbug{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;margin:-2px 0 10px;font:800 italic 12px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.hrbar{height:9px;background:#15161a;position:relative;clip-path:var(--sl,none);overflow:hidden}.hrbar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#5a6a8a,var(--gold) 55%,#d8261f);transition:width .6s}
.hrw{color:var(--gold2);font-size:15px}.hrn{color:var(--text)}
.hrtag{display:inline-block;margin-top:4px;font:800 italic 11px/1 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:3px 7px 2px;background:#1d1e23;color:var(--mut)}
.hrtag.hi{background:rgba(216,38,31,.22);color:#ffb4a8}.hrtag.md{background:rgba(242,193,78,.14);color:var(--gold2)}
.hrrun{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.hrrow{display:grid;grid-template-columns:86px 1fr auto;gap:10px;align-items:center;background:var(--s2,#1e1f24);padding:9px 10px;clip-path:var(--sl,none)}
.hrl{font:900 italic 13px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;color:var(--gold2);letter-spacing:.04em}
.hrt{min-width:0;display:flex;flex-direction:column}.hrt b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hrt small{color:var(--mut)}
.hrd{font-size:16px;color:var(--mut)}.hrd.up{color:#4cd07d}.hrd.dn{color:#ff6a55}
body.tv .hrbug{font-size:18px}body.tv .hrbar{height:14px}`;document.head.appendChild(c)})();
