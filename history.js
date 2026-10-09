/* Tony Khan Simulator — the history book (v157).
   Records the game's history as it happens and shows it in one place:
     • Title lineages — every reign of every title: who, when it started and ended, weeks held, defenses, how it ended
     • Career records — matches, wins/losses, main events, PPV wins, 5★ matches, best match, peak popularity, title reigns
     • Head to head — every one-on-one result between two wrestlers
     • Year-end awards (the existing awards, kept season by season)
     • The Hall of Fame — at each year-end, retiring wrestlers with a big enough legacy are inducted automatically, and
       you get one pick of your own (anyone, active or retired) for the class
   History is shared in a league. Starts recording from v157 — earlier reigns and matches weren't kept.
   Loaded after the main script; hooks in by wrapping globals. */
'use strict';
(function(){
const now=()=>({s:S.season,wk:Math.min(S.week,SEASON),a:AW()});
const nm=id=>S.w[id]?S.w[id].name:((S.gone||{})[id]||'?');
const names=ids=>ids.map(nm).join(' & ');
function H(){if(!S.lin)S.lin={};if(!S.linCur)S.linCur={};if(!S.hh)S.hh={};if(!S.hof2)S.hof2=[];if(!S.gone)S.gone={};return S}

/* ---------------- title lineages ---------------- */
function linSync(how,show){H();for(const tid in S.titles){const t=S.titles[tid];const cur=S.linCur[tid];const hs=(t.holders||[]).slice();
 const same=cur&&cur.h.length===hs.length&&cur.h.every(x=>hs.includes(x));
 if(same){cur.def=Math.max(cur.def||0,t.def||0);continue}
 const L=S.lin[tid]=S.lin[tid]||[];
 if(cur){const r=L[L.length-1];if(r&&!r.end){r.end=Object.assign(now(),{how:hs.length?`Lost to ${names(hs)}${show?' at '+show:''}`:how||'Vacated'});r.def=cur.def||0}}
 if(hs.length){L.push(Object.assign(now(),{h:hs,n:names(hs),show:show||'',def:0}));S.linCur[tid]={h:hs,def:0}}else delete S.linCur[tid]}}
window.linSync=linSync;

/* ---------------- careers & head to head ---------------- */
function cr(w){return w.cr||(w.cr={m:0,w:0,l:0,me:0,ppvW:0,five:0,best:null,pk:Math.round(w.pop)})}
if(typeof applyMatch==='function'){const a0=applyMatch;applyMatch=function(m,res,ctx){const out=a0.apply(this,arguments);
 try{H();const ids=m.sides.flat().filter(id=>S.w[id]);const win=m.nc?[]:(m.sides[m.winner]||[]);const txt=matchText(m);
  ids.forEach(id=>{const w=S.w[id],c=cr(w);c.m++;if(m.nc){}else if(win.includes(id))c.w++;else c.l++;if(ctx&&ctx.pos==='me')c.me++;if(ctx&&ctx.ppv&&win.includes(id))c.ppvW++;if(res.stars>=5)c.five++;
   if(!c.best||res.stars>c.best.st)c.best={st:res.stars,t:txt,s:S.season,wk:S.week,show:ctx&&ctx.name||''};c.pk=Math.max(c.pk||0,Math.round(w.pop))});
  if(m.sides.length===2&&m.sides[0].length===1&&m.sides[1].length===1&&!m.nc){const [a,b]=[m.sides[0][0],m.sides[1][0]];const k=key(a,b);const r=S.hh[k]=S.hh[k]||{};const x=win[0];r[x]=(r[x]||0)+1;r.n=(r.n||0)+1;r.last={x,s:S.season,wk:S.week,show:ctx&&ctx.name||''}}
  linSync('',ctx&&ctx.name||'')}catch(e){console.warn('history',e)}
 return out}}
/* titles also change outside matches: vacated after the week, after injuries, releases or retirements */
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(){const out=e0.apply(this,arguments);try{linSync('Vacated')}catch(e){}return out}}
if(typeof crisisChoose==='function'){const c0=crisisChoose;crisisChoose=function(){const out=c0.apply(this,arguments);try{linSync('Vacated')}catch(e){}return out}}
if(typeof finishDraft==='function'){const f0=finishDraft;finishDraft=function(){const out=f0.apply(this,arguments);try{linSync('Vacated after the draft')}catch(e){}return out}}
/* remember names of wrestlers who leave the world, so old reigns and records still read right */
if(typeof purgeW==='function'){const p0=purgeW;purgeW=function(id){try{H();const w=S.w[id];if(w){S.gone[id]=w.name;linSync('Vacated')}}catch(e){}const out=p0.apply(this,arguments);try{linSync('Vacated — the champion retired')}catch(e){}return out}}

/* ---------------- the Hall of Fame ---------------- */
function reigns(id){let n=0,wk=0;for(const tid in (S.lin||{}))(S.lin[tid]||[]).forEach(r=>{if(r.h.includes(id)){n++;wk+=((r.end?r.end.a:AW())-r.a)}});return {n,wk}}
function legacy(w){const c=w.cr||{};const r=reigns(w.id);return Math.round(r.n*12+r.wk*.4+(c.five||0)*4+(c.me||0)+(c.ppvW||0)*2+(c.pk||w.pop||0)/4+(w.pop>=90?10:0))}
window.legacyOf=legacy;
function snap(w,why){const c=w.cr||{};const r=reigns(w.id);return {id:w.id,n:w.name,s:S.season,why,leg:legacy(w),rec:`${c.w||0}–${c.l||0}`,reigns:r.n,five:c.five||0,me:c.me||0,pk:c.pk||Math.round(w.pop)}}
const HOF_AUTO=45;
function inducted(id){return (S.hof2||[]).some(x=>x.id===id)}
if(typeof offseasonApply==='function'){const o0=offseasonApply;offseasonApply=function(){try{H();const o=S.offs||{};const cls=[];
  (o.ret||[]).forEach(id=>{const w=S.w[id];if(w&&!inducted(id)&&legacy(w)>=HOF_AUTO)cls.push(snap(w,'Inducted on retirement'))});
  cls.forEach(x=>{S.hof2.push(x);news(`🏛️ Hall of Fame: ${x.n} is inducted, class of Season ${x.s}.`)})}catch(e){console.warn(e)}
 const out=o0.apply(this,arguments);try{delete S.hofPick}catch(e){}return out}}
window.hofPick=function(id){if(typeof mpLocked==='function'&&mpLocked())return;H();if(S.phase!=='over')return toast('Hall of Fame picks happen at the end of the year.');if(S.hofPick&&S.hofPick[canonKey('p')])return toast("You've made your pick this year.");
 const w=S.w[id];if(!w||inducted(id))return;S.hofPick=S.hofPick||{};S.hofPick[typeof canonKey==='function'?canonKey('p'):'p']=1;const x=snap(w,`${S.gm}'s pick`);S.hof2.push(x);news(`🏛️ Hall of Fame: ${S.gm} inducts ${w.name} into the class of Season ${S.season}.`);save();openHistory('hof')};

/* ---------------- the book ---------------- */
let HT='titles';window.HT_T=null;
const when=x=>`S${x.s} · Wk ${x.wk}`;
function titlesTab(){H();linSync('Vacated');const tl=Object.values(S.titles);const tid=HT_T&&S.titles[HT_T]?HT_T:tl[0].id;
 const L=(S.lin[tid]||[]).slice().reverse();
 return `<div class="chips">${tl.map(t=>`<button class="chip ${t.id===tid?'on':''}" onclick="HT_T='${t.id}';openHistory('titles')">${esc(t.n)}</button>`).join('')}</div>
 <div class="card mt"><div class="h small">${esc(S.titles[tid].n)} title history</div>${L.length?L.map((r,i)=>{const wk=(r.end?r.end.a:AW())-r.a;return `<div class="brow"><div class="row sb"><b>${esc(r.n)}</b><span class="muted tiny">${wk} wk${wk===1?'':'s'} · ${r.end?r.def:Math.max(r.def,(S.titles[tid].def||0))} def.</span></div><div class="muted tiny">Won ${when(r)}${r.show?' at '+esc(r.show):''}${r.end?` · ${esc(r.end.how)} (${when(r.end)})`:' · <b class="gold">Current champion</b>'}</div></div>`}).join(''):'<div class="muted">No champions yet — history starts with the first one crowned.</div>'}</div>`}
function recordsTab(){const all=Object.values(S.w).filter(w=>w.cr&&w.cr.m);
 const top=(f,lab,n)=>{const l=all.slice().sort((a,b)=>f(b)-f(a)).filter(w=>f(w)>0).slice(0,n||5);return l.length?`<div class="card"><div class="h small">${lab}</div>${l.map((w,i)=>`<div class="row sb tiny" style="margin:3px 0"><span>${i+1}. <span onclick="showW('${w.id}')"><b class="${w.own==='p'?'gold':''}">${esc(w.name)}</b></span></span><b>${f(w)}</b></div>`).join('')}</div>`:''};
 const best=all.filter(w=>w.cr.best).sort((a,b)=>b.cr.best.st-a.cr.best.st);const seen=new Set();const bm=best.filter(w=>{const k=w.cr.best.t+w.cr.best.s+w.cr.best.wk;if(seen.has(k))return false;seen.add(k);return true}).slice(0,5);
 if(!all.length)return '<div class="card"><div class="muted">Records start with the first match.</div></div>';
 return top(w=>w.cr.w,'🏅 Most wins')+top(w=>{const r=reigns(w.id);return r.n},'🏆 Most title reigns')+top(w=>w.cr.five,'✨ Most 5★ matches')+top(w=>w.cr.me,'⭐ Most main events')+top(w=>w.cr.ppvW,'📺 Most PPV wins')+top(w=>legacy(w),'🏛️ Biggest legacies')+
 (bm.length?`<div class="card"><div class="h small">🎬 Greatest matches</div>${bm.map(w=>`<div class="brow"><div>${esc(w.cr.best.t)}</div><div class="row sb tiny"><span class="muted">${when(w.cr.best)}${w.cr.best.show?' · '+esc(w.cr.best.show):''}</span><span class="stars">${stars(Math.min(5,w.cr.best.st))}</span></div></div>`).join('')}</div>`:'')}
function awardsTab(){const l=(S.hof||[]).slice().reverse();return l.length?l.map(y=>`<div class="card"><div class="h small">🏆 Season ${y.s} awards</div>${(y.l||[]).map(x=>`<div class="row sb tiny" style="margin:3px 0"><span class="muted">${esc(x.t)}</span><b>${esc(x.n)}</b></div>`).join('')}</div>`).join(''):'<div class="card"><div class="muted">The first year-end awards come after Worlds End.</div></div>'}
function hofTab(){const l=(S.hof2||[]).slice().reverse();const me=typeof canonKey==='function'?canonKey('p'):'p';const can=S.phase==='over'&&!(S.hofPick&&S.hofPick[me]);
 const cand=can?Object.values(S.w).filter(w=>w.cr&&!inducted(w.id)).sort((a,b)=>legacy(b)-legacy(a)).slice(0,8):[];
 return `${can?`<div class="card warn"><b>🏛️ Your Hall of Fame pick</b><div class="muted" style="margin:4px 0 8px">One induction of your own for this year's class — anyone, active or retired-in-place. Retiring legends with a big enough legacy go in automatically.</div>${cand.map(w=>`<div class="prow">${face(w)}<div class="wl"><div class="wn">${esc(w.name)}</div><div class="muted tiny">Legacy ${legacy(w)} · ${w.cr.w}–${w.cr.l} · ${reigns(w.id).n} title reign${reigns(w.id).n===1?'':'s'}</div></div><button class="mini" onclick="hofPick('${w.id}')">Induct</button></div>`).join('')}</div>`:''}
 ${l.length?l.map(x=>`<div class="card"><div class="row sb"><b>🏛️ ${esc(x.n)}</b><span class="muted tiny">Class of Season ${x.s}</span></div><div class="tiny" style="margin-top:4px">${esc(x.rec)} · ${x.reigns} title reign${x.reigns===1?'':'s'} · ${x.five} five-star match${x.five===1?'':'es'} · ${x.me} main events · peak popularity ${x.pk}</div><div class="muted tiny">${esc(x.why)} · legacy ${x.leg}</div></div>`).join(''):`<div class="card"><div class="muted">The Hall of Fame is empty. At each year-end, retiring wrestlers with a big enough legacy are inducted, and you get one pick of your own.</div></div>`}
 ${(S.retired||[]).length?`<div class="card"><div class="h small">🎖️ Retired</div>${S.retired.slice().reverse().map(r=>`<div class="row sb tiny" style="margin:3px 0"><span>${esc(r.n)}</span><span class="muted">Season ${r.s}</span></div>`).join('')}</div>`:''}`}
window.openHistory=function(t){if(t)HT=t;if(!S||!S.w)return;
 const tabs=[['titles','🏆 Titles'],['records','📊 Records'],['awards','🎖️ Awards'],['hof','🏛️ Hall of Fame']];
 openModal(`<div class="h mhd">📖 History book</div><div class="chips">${tabs.map(([k,n])=>`<button class="chip ${HT===k?'on':''}" onclick="openHistory('${k}')">${n}</button>`).join('')}</div><div class="mt">${HT==='titles'?titlesTab():HT==='records'?recordsTab():HT==='awards'?awardsTab():hofTab()}</div>
 <p class="muted tiny center">History is recorded from v157 on.</p><button class="btn ghost" onclick="closeModal()">Close</button>`,true)};
window.HT_SET=k=>{HT=k};

/* ---------------- career + head to head on the wrestler card ---------------- */
function careerHtml(w){const c=w.cr;const r=reigns(w.id);const hh=Object.entries(S.hh||{}).filter(([k])=>k.split('|').includes(w.id)).sort((a,b)=>b[1].n-a[1].n).slice(0,4);
 if(!c&&!r.n&&!hh.length)return '';
 return `<div class="card" style="margin:10px 0 0;padding:10px 12px"><div class="h small" style="margin:0 0 6px">📖 Career</div>${c?`<div class="tiny">${c.w}–${c.l} · ${c.me} main event${c.me===1?'':'s'} · ${c.ppvW} PPV win${c.ppvW===1?'':'s'} · ${c.five} five-star match${c.five===1?'':'es'} · ${r.n} title reign${r.n===1?'':'s'}</div>${c.best?`<div class="muted tiny" style="margin-top:2px">Best: ${esc(c.best.t)} ${stars(Math.min(5,c.best.st))}</div>`:''}`:''}
 ${hh.length?`<div class="tiny" style="margin-top:6px">${hh.map(([k,v])=>{const o=k.split('|').find(x=>x!==w.id);return `<div class="row sb"><span>vs ${esc(nm(o))}</span><b>${v[w.id]||0}–${v[o]||0}</b></div>`}).join('')}</div>`:''}</div>`}
if(typeof showW==='function'){const s0=showW;showW=function(id){const out=s0.apply(this,arguments);try{const w=S.w[id];if(w&&(S.phase==='season'||S.phase==='over')){const h=careerHtml(w);if(h){const m=document.querySelector('#modal .wd-top');if(m){const after=m.nextElementSibling&&/Morale \d/.test(m.nextElementSibling.textContent)?m.nextElementSibling:m;after.insertAdjacentHTML('afterend',h)}}}}catch(e){console.warn(e)}return out}}

/* ---------------- entry points: Titles screen and the Office ---------------- */
if(typeof titlesView==='function'){const t0=titlesView;titlesView=function(){const out=t0.apply(this,arguments);const b=`<button class="btn sec" style="margin:0 0 12px" onclick="openHistory('titles')">📖 History book — title lineages, records &amp; Hall of Fame</button>`;const i=out.indexOf('<p class="muted">The titles were split');return i<0?b+out:out.slice(0,i)+b+out.slice(i)}}
if(typeof officeView==='function'){const o0=officeView;officeView=function(){const out=o0.apply(this,arguments);const b=`<div class="card"><div class="h small">📖 History book</div><div class="muted" style="margin-bottom:8px">Title lineages, career records, head to head, year-end awards and the Hall of Fame.</div><button class="btn" onclick="openHistory()">Open the history book</button></div>`;const i=out.indexOf('<div class="card"><div class="h small">Contracts expiring');return i<0?out+b:out.slice(0,i)+b+out.slice(i)}}
/* seed current champions once (crowned before v157) */
if(typeof render==='function'){const r0=render;render=function(){try{if(S&&S.w&&S.titles&&!S.linSeed&&(S.phase==='season'||S.phase==='over')){S.linSeed=1;linSync('')}}catch(e){}return r0.apply(this,arguments)}}
})();
