/* ===================== v443: CROWDS IN THE DRAFT =====================
   - dcTally(b): how many of each crowd a GM has drafted so far (a two-crowd wrestler counts for both), drawn on the
     draft header (yours) and on every team on the Draft board.
   - dcNeed(b,w): how much a pick helps a GM's crowds — every crowd needs wrestlers of its own to get a real match each
     week, and a wrestler who clicks with crowds already on the roster (GRP_M) builds better matchups. Added to
     draftChoice for human GMs only (Auto-pick, Sim rest, Auto-draft me); the offline rival drafts as before.
   Weights stay small next to popularity and skill: they decide between wrestlers of similar quality, never take a
   scrub over a star. */
const DC_G=['cas','tech','blood','flip','chaos'];
/* Casuals: fbCalc's "draws" — each Casual-group wrestler in a match hooks casuals (+.6, up to 3 a show), on top of
   top-4 star power, titles, spectacle and story. With rest weeks that wants ~6 of 24. Hardcore crowds ~4 each. */
const DC_SHARE={cas:.25,tech:.175,blood:.175,flip:.175,chaos:.175};
const DC_ONE={cas:'Casual',tech:'Technical wrestler',blood:'Bloodhound',flip:'Flippy wrestler',chaos:'Chaos fiend'};
const DC_MANY={cas:'Casuals',tech:'Technical wrestlers',blood:'Bloodhounds',flip:'Flippy wrestlers',chaos:'Chaos fiends'};
const DC_FILL={cas:7,tech:9,blood:9,flip:9,chaos:9};
function dcCounts(b){const c={cas:0,tech:0,blood:0,flip:0,chaos:0,und:0};
 (typeof ownList==='function'?ownList(b):[]).forEach(w=>fgOf(w).forEach(g=>{if(c[g]!=null)c[g]++}));return c}
function dcTargets(b){const n=ownList(b).length+(typeof picksLeft==='function'?picksLeft(b):0);const t={};
 DC_G.forEach(g=>t[g]=Math.max(2,Math.round(n*DC_SHARE[g])));return t}
function dcNeed(b,w){const gs=fgOf(w).filter(g=>DC_G.includes(g));if(!gs.length)return {v:1,why:''};
 const c=dcCounts(b),t=dcTargets(b);let v=0,why='',top=0;
 gs.forEach(g=>{const gap=Math.max(0,t[g]-c[g]);const f=gap>0?gap/t[g]*DC_FILL[g]:0;if(f>top){top=f;why=c[g]===0?`your first ${DC_ONE[g]}`:`you need more ${DC_MANY[g]}`}});
 if(!ownList(b).length)why='';v+=top;if(gs.length>1)v+=gs.filter(g=>c[g]<t[g]).length>1?1.5:0;
 /* clicks with wrestlers you already have */
 const mine=ownList(b);let click=0,clash=0;
 if(typeof grpPair==='function')mine.forEach(o=>{let best=-99;fgOf(o).forEach(x=>gs.forEach(y=>best=Math.max(best,grpPair(x,y))));if(best>=5)click++;else if(best<0)clash++});
 v+=Math.min(3,click)*1.2;if(mine.length>=3&&clash>mine.length/2)v-=2.5;
 if(!why&&click>=2)why='clicks with your roster';
 return {v,why}}
function dcOn(b){return b!=='ai'||(typeof ON==='function'&&ON())}
function dcTally(b,cls){const c=dcCounts(b),t=dcTargets(b);
 const it=DC_G.map(g=>`<span class="fgw dct${c[g]?'':' z'}" title="${FG_N[g]}: ${c[g]} drafted">${fgLbl(g,`<b>${c[g]}</b>${FG_N[g]}`)}</span>`);
 if(c.und)it.push(`<span class="fgw dct" title="Undiscovered: ${c.und} drafted">${fgLbl('und',`<b>${c.und}</b>Undiscovered`)}</span>`);
 return `<div class="dcrowd ${cls||''}">${it.join('')}</div>`}
/* v444: the compact roster strip — men, women and the five crowds as small tiles, numbers only; tiles you're behind on
   for this point in the draft are lit. Used on the draft header (yours) and every team on the Draft board. */
function dcShort(b){const own=ownList(b),n=own.length,fin=n+(typeof picksLeft==='function'?picksLeft(b):0),pr=fin?n/fin:0;
 const c=dcCounts(b),t=dcTargets(b),o={};DC_G.forEach(g=>o[g]=c[g]<Math.floor(t[g]*pr+.5));
 const wn=own.filter(w=>w.g==='F').length;o.F=n>=3&&wn/n<.3;return o}
function dcStrip(b,cls){const own=ownList(b),c=dcCounts(b),sh=dcShort(b),m=own.filter(w=>w.g==='M').length,f=own.length-m;
 const tile=(k,ic,n,ti)=>`<span class="dcs${sh[k]?' need':''}${n?'':' z'}" title="${ti}: ${n}${sh[k]?' — short':''}">${ic}<b>${n}</b></span>`;
 return `<div class="dcstrip ${cls||''}">${tile('M','<i class="dcg">M</i>',m,'Men')}${tile('F','<i class="dcg">W</i>',f,'Women')}<span class="dcsep"></span>${DC_G.map(g=>tile(g,`<i class="fg-${g}">${fgIc(g)}</i>`,c[g],FG_N[g])).join('')}${c.und?tile('und',`<i class="fg-und">${fgIc('und')}</i>`,c.und,'Undiscovered'):''}</div>`}
/* draftChoice + crowd needs for human GMs; Auto-pick says why */
if(typeof draftChoice==='function'){const dc0=draftChoice;draftChoice=window.draftChoice=function(brand){
 if(!dcOn(brand)||!S.draft)return dc0.apply(this,arguments);
 try{let pool=Object.values(S.w).filter(w=>inPool(w));const mine=ownList(brand);
  const fit=pool.filter(w=>capOk(w,brand));pool=fit.length?fit:pool.sort((a,b)=>mkt(a)-mkt(b)).slice(0,1);
  const allow=S.draft.cap||S.draft.capB?capRoom(brand)/Math.max(1,picksLeft(brand)):Infinity;
  const wn=mine.filter(w=>w.g==='F').length;const needF=mine.length>=3&&wn/mine.length<.3;
  const cand=needF?pool.filter(w=>w.g==='F'):pool;const list=cand.length?cand:pool;
  let best=null,bv=-1e9,bw='';list.forEach(w=>{const n=dcNeed(brand,w);const v=w.pop*.5+w.ring*.35+w.mic*.15+room(w.ring)*UPS_K+(isChamp(w.id)?8:0)+(mine.some(o=>inTeam(o.id,w.id))?6:0)+n.v+R(0,aiq(brand).noise)-Math.max(0,mkt(w)-allow)*.9;if(v>bv){bv=v;best=w;bw=n.why}});
  if(best)window.__dcWhy=bw;return best}catch(e){console.warn('draft crowds',e);return dc0.apply(this,arguments)}}}
if(typeof autoPick==='function'){autoPick=window.autoPick=function(){if(mpLocked())return;if(onClock()!=='p')return;window.__dcWhy='';const c=draftChoice('p');if(!c)return;const why=window.__dcWhy;pDraft(c.id);
 if(c.own==='p')toast(why?`Auto-pick: ${c.name} — ${why}.`:`Auto-pick: ${c.name}.`)}}
Object.assign(window,{dcCounts,dcNeed,dcTally,dcStrip});
(function(){const s=document.createElement('style');s.textContent=`
.dcrowd{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px;font-size:12.5px}
.dcrowd .dct b{margin:0 .3em 0 0;color:#fff;font-weight:800}
.dcrowd .dct.z{opacity:.45}
.dteam .dcrowd{margin:6px 0 2px;font-size:11.5px}
body.tv .dcrowd{font-size:18px}
.dcstrip{display:flex;align-items:stretch;gap:4px;margin:10px 0 0;flex-wrap:nowrap}
.dcstrip .dcs{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:3px;padding:6px 0;background:rgba(0,0,0,.35);border-bottom:2px solid transparent;font:800 italic 16px/1 'BC',sans-serif}
.dcstrip .dcs b{color:#fff}.dcstrip .dcs.z b{color:#6d6860}
.dcstrip .dcs.need{background:rgba(229,70,59,.14);border-bottom-color:#e5463b}
.dcstrip .dcs .fgi{width:17px;height:17px;margin:0;vertical-align:0}
.dcstrip .dcg{font:800 italic 13px/1 'BC',sans-serif;color:#9a958c;font-style:italic}
.dcstrip .dcsep{flex:0 0 4px}
.dteam .dcstrip{margin:6px 0 4px}.dteam .dcstrip .dcs{font-size:14px;padding:4px 0}
.dhead .dhd{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.dhead .dround.dsm{font-size:38px;margin:2px 0 6px;white-space:nowrap}.dhead .dround.dsm small{font-size:.5em;margin-left:.25em;-webkit-text-fill-color:#8a8580;color:#8a8580}
.dhead .capline{display:flex;justify-content:space-between;gap:8px;align-items:baseline;font-size:14px}
.dhead .capbox .bar{margin-top:6px}
body.tv .dcstrip .dcs{font-size:24px}body.tv .dcstrip .dcs .fgi{width:26px;height:26px}
`;document.head.appendChild(s)})();
