/* Tony Khan Simulator — Squash matches (v178).
   A quick, one-sided win that builds a wrestler up. The tradeoff: a squash is short and never a great match (it caps around
   2½★), so it's momentum at the cost of show quality.
     • Against local enhancement talent (an unsigned nobody from free agency): costs nothing but the slot. Nobody on your
       roster gets hurt by it.
     • Against someone on your roster: the winner gets more out of beating a name, but the loser pays — the more popular they
       are, the more it costs them (a burial), and their morale takes a hit.
     • The same wrestler squashing week after week gets less each time: the first squash in a stretch of SQ_WIN weeks is
       full value, then 60%, 30%, then nothing.
     • Backfire: squash someone more popular than the winner and the crowd turns on it — the winner loses ground instead.
   Loaded before the main script; everything here only runs once a game is going. */
'use strict';
const SQ_WIN=6,SQ_DIM=[1,.6,.3,0],SQ_CAP=2.5;
const isSq=m=>!!m&&m.type==='squash';
/* is this wrestler local enhancement talent (unsigned) in this match? */
const sqLocalW=w=>!!w&&!w.own;
/* local talent: a low-level unsigned wrestler of the same division who isn't already booked */
function sqLocal(W,brand,card,not){if(!W)return null;const used=new Set();(card||[]).forEach(sl=>{if(sl&&sl.d&&sl.k==='match'&&sl.d.sides)sl.d.sides.flat().forEach(x=>x&&used.add(x))});
 const pool=Object.values(S.w).filter(w=>!w.own&&!w.inj&&w.g===W.g&&!w.cw&&w.id!==W.id&&w.id!==not&&!used.has(w.id));if(!pool.length)return null;
 pool.sort((a,b)=>a.pop-b.pop);const low=pool.filter(w=>w.pop<=45);const l=(low.length?low:pool).slice(0,6);return l[Math.floor(Math.random()*l.length)]}
/* how many squashes this wrestler has won lately (before tonight) */
function sqRecent(id){const l=(S.sqLog&&S.sqLog[id])||[];return l.filter(w=>AW()-w<SQ_WIN).length}
function sqMult(id){return SQ_DIM[Math.min(SQ_DIM.length-1,sqRecent(id))]}
/* does the crowd buy it? Squashing someone more popular backfires */
function sqBackfire(W,L){return !!(W&&L&&L.own&&L.pop>W.pop+5)}
/* the rating: a squash is short, so the winner's star power decides it — capped well below a real match */
function sqStars(m,preview){const W=S.w[m.sides[0][0]],L=S.w[m.sides[1][0]];if(!W||!L)return 1;
 let u=1+(W.pop-40)/40+(W.ring-60)/80+(W.mom||0)*.05;
 if(sqBackfire(W,L))u-=.75;else if(L.own&&L.pop>=70&&L.al==='f')u-=.25;/* fans don't love watching a favorite flattened */
 if(sqMult(W.id)<1)u-=.25*(1-sqMult(W.id));/* the act gets old */
 if(!preview)u+=R(-.25,.25);return clamp(u,.5,SQ_CAP)}
/* rateMatch hook: replace the score with the squash rating, keeping the rest of the result intact */
function sqRate(m,res,ctx){const u=sqStars(m,ctx&&ctx.preview);const raw=STAR_BASE+u*STAR_PER;
 res.raw=raw;res.stars=clamp(Math.round(u*4)/4,.25,5);res.lo=clamp(Math.round((u-.5)*4)/4,.25,5);res.hi=clamp(Math.round(Math.min(SQ_CAP,u+.5)*4)/4,.25,5);res.sw=.5;res.risk=0;res.sparks=[];res.unknown=0;
 res.bd={base:raw,det:raw,parts:[['Squash',0]]};return res}
/* what it'll cost and earn, for the match editor */
function sqPreview(m){const W=S.w[m.sides[0][0]],L=S.w[m.sides[1][0]];if(!W)return '';const out=[];const k=sqMult(W.id);
 if(k<1)out.push(`<div class="err" style="margin-top:6px">🔁 ${esc(W.name)} has squashed ${sqRecent(W.id)} ${sqRecent(W.id)===1?'opponent':'opponents'} in the last ${SQ_WIN} weeks — ${k?'the crowd is starting to tune it out':'nobody cares any more'}. Give them a real match to reset it.</div>`);
 if(!L)return out.join('');
 if(sqBackfire(W,L))out.push(`<div class="err" style="margin-top:6px">😬 ${esc(L.name)} is more over than ${esc(W.name)}. The crowd won't buy this — expect it to backfire on ${esc(W.name)}.</div>`);
 else if(L.own){const c=sqCost(L);out.push(`<div class="${L.pop>=65?'err':'muted'} tiny" style="margin-top:6px">${L.pop>=65?'⚰️ This buries ':'📉 Costs '}${esc(L.name)}: about −${Math.round(c.pop*10)/10} popularity and a morale hit. ${esc(W.name)} gets more out of beating a name.</div>`)}
 else out.push(`<div class="muted tiny" style="margin-top:6px">🧑‍🔧 ${esc(L.name)} is local enhancement talent — nobody on your roster pays for this one.</div>`);
 return out.join('')}
function sqCost(L){return {pop:clamp((L.pop-35)*.08,.3,4),mor:L.pop>=70?12:L.pop>=50?7:4}}
function sqGain(W,L){const base=L&&L.own?1+Math.max(0,L.pop-45)*.05:1.5;return base*sqMult(W.id)}
/* before the bell: local talent who got signed (or hurt) in the meantime is swapped for another nobody */
function sqPrep(m,brand,card){if(!isSq(m)||!m.sides)return;m.winner=0;m.fin='clean';m.stip='std';m.title='';delete m.ri;delete m.bo;
 const W=S.w[m.sides[0][0]];const lid=m.sides[1][0];const L=lid&&S.w[lid];
 if(m.loc&&(!L||L.inj||(L.own&&L.own!==brand))){const n=sqLocal(W,brand,card,lid);if(n)m.sides[1]=[n.id]}}
/* after the match: the winner's push, the loser's cost, and the log that drives diminishing returns */
function sqAfter(b,m,res,notes){if(!isSq(m)||m.nc)return;const W=S.w[m.sides[0][0]],L=S.w[m.sides[1][0]];if(!W||!L)return;const mine=b==='p'||ON();
 S.sqLog=S.sqLog||{};const k=sqMult(W.id);
 if(sqBackfire(W,L)){W.pop=clamp(W.pop-.75,1,100);W.mom=Math.max(-5,(W.mom||0)-1);L.mor=clamp(L.mor-4,0,100);
  if(mine)notes.push(`😬 The crowd wasn't having it — ${L.name} is the bigger star, and squashing them made ${W.name} look worse, not better.`)}
 else{const g=sqGain(W,L);if(g>0){W.pop=clamp(W.pop+g*(1-W.pop/110),1,100);W.mom=Math.min(5,(W.mom||0)+1);W.mor=clamp(W.mor+3,0,100)}
  if(mine){if(k>=1)notes.push(`💪 ${W.name} ran right through ${L.name}${L.own?'':' (local talent)'} — a statement win that builds them up.`);
   else if(k>0)notes.push(`💪 Another squash for ${W.name}. It still helps, but the crowd has seen this before.`);
   else notes.push(`🥱 ${W.name}'s squashes have stopped meaning anything — give them a real opponent.`)}}
 if(L.own){const c=sqCost(L);L.pop=clamp(L.pop-c.pop,1,100);L.mor=clamp(L.mor-c.mor,0,100);L.mom=Math.max(-5,(L.mom||0)-1);
  if(mine)notes.push(L.pop>=60?`⚰️ That was a burial — ${L.name} looked like a nobody out there, and they know it.`:`📉 ${L.name} took a beating that'll take a while to live down.`)}
 (S.sqLog[W.id]=(S.sqLog[W.id]||[]).filter(w=>AW()-w<SQ_WIN)).push(AW())}
/* the match editor: the note and the local-talent button */
function sqEd(m,av){const W=m.sides[0][0]&&S.w[m.sides[0][0]];const L=m.sides[1][0]&&S.w[m.sides[1][0]];
 const btn=W?`<button class="btn sec" style="margin:8px 0 0" onclick="sqPickLocal()">🧑‍🔧 ${L&&!L.own?'Different local talent':'Use local enhancement talent'}</button>`:'';
 return `<div class="note tiny">💪 A squash: ${W?esc(W.name):'the wrestler on the left'} wins quickly and decisively. It won't be a great match (about ${SQ_CAP}★ at most), but it builds them up. Against local enhancement talent it costs nothing; against someone on your roster, the loser pays for it.</div>${btn}${W&&L?sqPreview(m):''}`}
function sqPickLocal(){if(!ED||!isSq(ED.m))return;const W=S.w[ED.m.sides[0][0]];const card=S.card.p.map((x,j)=>j===ED.i?null:x);
 const n=sqLocal(W,'p',card,ED.m.sides[1][0]);if(!n)return toast('No local talent available right now.');ED.m.sides[1]=[n.id];ED.m.loc=1;renderMatchEd(true)}
