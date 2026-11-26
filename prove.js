/* Tony Khan Simulator — "Prove them wrong" (v365).
   Everyone left on the board when the draft ends was passed over, and they know it. Sign one of them during that first
   season and they arrive with a chip on their shoulder: a morale boost on arrival (PTW_MOR), extra fire in their matches
   and promos for their first PTW_WK weeks (PTW_K raw each, two at most per segment, a "Prove them wrong" line in Why that
   rating?), and +PTW_POP popularity for every one of those weeks they get on TV. It makes a lighter draft that fills
   out in free agency its own path, not just a cheaper version of the draft. Human GMs only. Loaded after venues.js. */
'use strict';
let PTW_MOR=10,PTW_WK=4,PTW_K=1,PTW_POP=1;
const ptwHum=b=>!!b&&(typeof MOR_HUM!=='function'||MOR_HUM(b));
/* the draft ends: whoever's still unsigned (real wrestlers, not created ones or rookies) was passed over */
if(typeof finishDraft==='function'){hookStep('finishDraft','prove.js',{around(d0,...args){const supp=S.draft&&S.draft.supp;const out=d0.apply(this,args);
 try{if(!supp&&S.phase==='season')Object.values(S.w).forEach(w=>{if(!w.own&&!w.cw&&!w.rookie)w.undr=S.season})}catch(e){console.warn('ptw',e)}return out}})}
/* someone passed over just joined a human GM's roster (any route: free agency, sealed bids, a quick deal) */
function ptwSync(notes){if(!S||!S.w||S.phase!=='season')return;const wk=AW();
 Object.values(S.w).forEach(w=>{if(w.undr==null||!w.own)return;const fresh=w.undr===S.season&&ptwHum(w.own);delete w.undr;if(!fresh)return;
  w.ptw={until:wk+PTW_WK};if(typeof mlog==='function')mlog(w,PTW_MOR,'Prove them wrong');else w.mor=clamp(w.mor+PTW_MOR,0,100);
  if(w.own==='p'||ON()){const n=`😤 ${w.name} went undrafted, and they haven't forgotten. Expect a chip on their shoulder for the next ${PTW_WK} weeks.`;news(n);if(notes)notes.push(n)}})}
const ptwOn=w=>!!(w&&w.ptw&&AW()<=w.ptw.until);
function ptwLift(ws){return Math.min(2,ws.filter(ptwOn).length)*PTW_K}
window.ptwLift=ptwLift;window.ptwSync=ptwSync;window.ptwOn=ptwOn;
/* catch new signings before the show airs, and again at the end of the week */
if(typeof airShow==='function'){hookStep('airShow','prove.js',{before(ctx){try{ptwSync()}catch(e){console.warn('ptw',e)}}})}
hookStep('endWeek','prove them wrong',{before(ctx,notes){try{ptwSync(notes);const wk=AW();
  Object.values(S.w).forEach(w=>{if(!w.ptw)return;if(wk>w.ptw.until||!w.own){delete w.ptw;return}if(w.last===S.week&&!w.inj)w.pop=clamp(w.pop+PTW_POP,1,100)})}catch(e){console.warn('ptw',e)}}});
