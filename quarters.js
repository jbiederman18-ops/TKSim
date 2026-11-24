/* ===================== v462: QUARTER-HOUR RATINGS (the reveal's scoreboard) =====================
   The two-show reveal (index.html srStage) used to be a tug of war on star ratings. The night is won on fans now, so the
   reveal draws the overnights instead: each show's line of fans gained tonight, one segment at a time. A segment's
   plate lands (cards, stars, the crowds it moved), then that show's line draws to its point with the segment's number
   next to it. The main event is the overrun at the right edge.
   Each segment's fans come from airing (fbSplit in fanbase.js, stored as seg.fd / seg.fi on the block's segments) and add
   up to the show's real fan change tonight, which is also what decides the night. Old saves without them share the
   night's fans out evenly. */
const QH_W=320,QH_H=176,QH_L=36,QH_R=312,QH_T=12,QH_B=148;
/* the segment's fans; fd is missing on shows aired before v462 */
function qhFd(o,it){if(!it)return 0;const s=it.s;if(s.fd!=null)return s.fd;const b=it.b,n=b.segs.length||1;
 const tot=o.fans&&o.fans[b.brand]!=null?o.fans[b.brand]:0;return Math.round(tot/n)}
function qhFmt(v){v=Math.round(v||0);if(Math.abs(v)<100)return '+0';return (v>=0?'+':'−')+(typeof fbK==='function'?fbK(Math.abs(v)):fmtFans(Math.abs(v)))}
/* the chart's columns: one per head-to-head round (crossover rounds stay off the chart) */
/* v465: after the bell — the night-wide part of each show's fans (block.fn, reasons block.fr) gets its own last column */
function qhBn(o,br){const b=o.blocks.find(x=>x.brand===br);return b&&b.fn!=null?b.fn:null}
function qhHasBell(o){return ['p','ai'].some(br=>qhBn(o,br)!=null)}
function qhInit(R){const cols=R.rounds.filter(r=>!r.x);const bell=qhHasBell(R.o);R.qh={cols,bell,n:cols.length+(bell?1:0),pts:{p:[{c:0,v:0}],ai:[{c:0,v:0}]},sum:{p:0,ai:0},lab:{},ic:{},lim:2000,shown:null,k:0,fresh:{}};}
function qhCol(rd){const R=SRV;return R&&R.qh?R.qh.cols.indexOf(rd)+1:0}
function qhRdOf(it){return SRV.rounds.find(r=>r.p===it||r.ai===it)}
/* a half landed: that show's line moves one column */
function qhPush(it){const R=SRV;if(!R||!R.qh||!R.two||!it)return;const br=it.b.brand;if(br!=='p'&&br!=='ai')return;const rd=qhRdOf(it);if(!rd)return;
 const c=qhCol(rd),d=qhFd(R.o,it);R.qh.sum[br]+=d;R.qh.pts[br].push({c,v:R.qh.sum[br],d});R.qh.fresh[br]=true;R.qh.lab[br]=c;
 if(br==='p')R.qh.ic[c]=it.s.fi||[];qhDraw()}
/* a round where one show had nothing in that slot: its line holds flat through the column */
function qhHold(rd){const R=SRV;if(!R||!R.qh||!R.two)return;const c=qhCol(rd);['p','ai'].forEach(br=>{if(rd[br])return;const P=R.qh.pts[br];if(P[P.length-1].c>=c)return;P.push({c,v:R.qh.sum[br],d:null})});qhDraw()}
function qhX(c){const n=SRV.qh.n||1;return QH_L+(QH_R-QH_L)*c/n}
/* the scale only ever widens, in round steps, so a point never sits off the chart and the axis never gives the ending away */
function qhLim(){const Q=SRV.qh;let m=0;['p','ai'].forEach(b=>Q.pts[b].forEach(p=>m=Math.max(m,Math.abs(p.v))));
 const st=[2e3,5e3,10e3,20e3,30e3,50e3,75e3,100e3,150e3,200e3,300e3,500e3,750e3,1e6,2e6,5e6];while(Q.lim<m*1.08){const nx=st.find(x=>x>Q.lim);if(!nx){Q.lim=m*1.2;break}Q.lim=nx}return Q.lim}
/* v472: once the crowds table is up the chart folds to a shorter strip (k 0→1), so the table and the tap fit on screen */
const QH_FOLD=(QH_B-QH_T)*.5;
function qhBot(){const Q=SRV&&SRV.qh;return QH_B-(Q?Q.k||0:0)*QH_FOLD}
function qhY(v,lim){const B=qhBot(),mid=(QH_T+B)/2;return mid-(v/lim)*(B-QH_T)/2}
function qhSvg(){const Q=SRV.qh,QB=qhBot(),QHh=QH_H-(Q.k||0)*QH_FOLD,n=Q.cols.length,tgt=qhLim(),lim=Q.shown||tgt,y0=qhY(0,lim);const meX1=Q.bell?(qhX(n)+qhX(n+1))/2:QH_R;
 const grid=[lim,lim/2,0,-lim/2,-lim].map(v=>{const y=qhY(v,lim);return `<line x1="${QH_L}" y1="${y}" x2="${QH_R}" y2="${y}" class="${v?'qhg':'qhz'}"/>${Math.abs(v)===lim||!v?`<text x="${QH_L-5}" y="${y+3.5}" class="qhax" text-anchor="end">${v?qhFmt(v>0?tgt:-tgt):'0'}</text>`:''}`}).join('');
 const meX=n>1?(qhX(n-1)+qhX(n))/2:QH_L;
 const over=Q.cols[n-1]&&Q.cols[n-1].main?`<rect x="${meX}" y="${QH_T-4}" width="${meX1-meX+(Q.bell?0:4)}" height="${QB-QH_T+8}" class="qhov"/>${(Q.k||0)<.5?`<text x="${(meX+meX1)/2}" y="${QB+1}" class="qhovt" text-anchor="middle">${Q.bell?'Over':'Overrun'}</text>`:''}`:'';
 const xl=Q.cols.map((r,i)=>`<text x="${qhX(i+1)}" y="${QB+16}" class="qhxl${r.main?' me':''}" text-anchor="middle">${r.main?'ME':i+1}</text>`).join('')+(Q.bell?`<text x="${qhX(n+1)}" y="${QB+16}" class="qhxl" text-anchor="middle">🔔</text>`:'');
 const line=br=>{const P=Q.pts[br];let h='';for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];const nw=Q.fresh[br]&&i===P.length-1&&!SRV.inst;
   h+=`<line x1="${qhX(a.c)}" y1="${qhY(a.v,lim)}" x2="${qhX(b.c)}" y2="${qhY(b.v,lim)}" data-a="${a.v}" data-b="${b.v}" pathLength="1" class="qhl ${br}${nw?' nw':''}${nw&&Q.cols[b.c-1]&&Q.cols[b.c-1].main?' sl':''}"/>`}
  const L=P[P.length-1];if(P.length>1)h+=`<circle cx="${qhX(L.c)}" cy="${qhY(L.v,lim)}" data-v="${L.v}" r="4.5" class="qhd ${br}${Q.fresh[br]&&!SRV.inst?' nw':''}"/>`;return h};
 /* only each show's latest number is on the chart; the higher point's sits above it, the lower one's below */
 const lab=()=>{const out=[];const L={};['p','ai'].forEach(br=>{const P=Q.pts[br],q=P[P.length-1];if(P.length>1&&q.d!=null&&Q.lab[br]===q.c)L[br]=q});
  const Y={};['p','ai'].forEach(br=>{const q=L[br];if(!q)return;const o=L[br==='p'?'ai':'p'];const up=!o||o.c!==q.c?q.v>=0:q.v>=o.v;Y[br]=qhY(q.v,lim)+(up?-9:16)});
  /* two labels in the same column never sit on top of each other */
  if(Y.p!=null&&Y.ai!=null&&L.p.c===L.ai.c&&Math.abs(Y.p-Y.ai)<15){const hi=Y.p<=Y.ai?'p':'ai',lo=hi==='p'?'ai':'p',m=(Y.p+Y.ai)/2;Y[hi]=m-7.5;Y[lo]=m+7.5}
  ['p','ai'].forEach(br=>{const q=L[br];if(!q)return;const x=qhX(q.c),y=Y[br];const end=x>QH_R-30;
   out.push(`<text x="${end?x-7:x+7}" y="${y}" data-v="${q.v}" data-o="${(y-qhY(q.v,lim)).toFixed(2)}" class="qhn ${br}${Q.fresh[br]&&!SRV.inst?' nw':''}" text-anchor="${end?'end':'start'}">${qhFmt(q.d)}</text>`)});return out.join('')};
 return `<svg viewBox="0 0 ${QH_W} ${QHh}" class="qhsvg" role="img" aria-label="Fans gained tonight, segment by segment">${over}${grid}${xl}${line('ai')}${line('p')}${lab()}</svg>`}
/* the crowds each of your segments moved, in a row under the chart */
function qhIcons(){const Q=SRV.qh;if(typeof fgIc!=='function')return '';return Object.keys(Q.ic).map(c=>{const l=(Q.ic[c]||[]).slice(0,2);if(!l.length)return '';
 return `<span class="qhic" style="left:${(qhX(+c)/QH_W*100).toFixed(2)}%">${l.map(([g,s])=>`<i class="fg-${g}">${fgIc(g)}<b>${s>0?'▲':'▼'}</b></i>`).join('')}</span>`}).join('')}
/* v471: when the scale widens, the lines already drawn ease down to it instead of jumping */
function qhDraw(){const el=document.getElementById('qh-chart');if(!el||!SRV||!SRV.qh)return;const Q=SRV.qh,tgt=qhLim();
 if(Q.raf){cancelAnimationFrame(Q.raf);Q.raf=0}
 if(Q.shown==null||SRV.inst||tgt<Q.shown||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))Q.shown=tgt;
 el.innerHTML=qhSvg()+`<div class="qhics">${qhIcons()}</div>`;Q.fresh={};if(Q.shown<tgt)qhEase(el,Q.shown,tgt)}
function qhEase(el,from,to){const Q=SRV.qh,t0=performance.now(),D=550;
 const step=now=>{const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3),L=from+(to-from)*e;Q.shown=L;
  el.querySelectorAll('line[data-a]').forEach(l=>{l.setAttribute('y1',qhY(+l.dataset.a,L));l.setAttribute('y2',qhY(+l.dataset.b,L))});
  el.querySelectorAll('circle[data-v]').forEach(c=>c.setAttribute('cy',qhY(+c.dataset.v,L)));
  el.querySelectorAll('text[data-v]').forEach(t=>t.setAttribute('y',qhY(+t.dataset.v,L)+(+t.dataset.o)));
  Q.raf=k<1?requestAnimationFrame(step):0};Q.raf=requestAnimationFrame(step)}
/* v463: the chart is the scoreboard — it sits at the top of the stage, with each show's name and running total in its line's
   colour (ids srs-p / srs-ai, which srDone and srFinal update) */
function qhHtml(R,G,Rv){qhInit(R);return `<div class="qhwrap"><div class="qhcap"><span>The overnights</span><em>Fans gained tonight</em></div><div class="qhleg"><div class="qht p" id="srs-p"><span>${esc(G)}</span><b>+0</b><em>So far</em></div><div class="qht ai" id="srs-ai"><span>${esc(Rv)}</span><b>+0</b><em>So far</em></div></div><div class="qhchart" id="qh-chart">${qhSvg()}<div class="qhics"></div></div></div>`}
/* the plate's crowds: which crowds this segment moved, no numbers */
function qhPlateIcons(s){const l=s&&s.fi;if(!l||!l.length||typeof fgIc!=='function')return '';return `<span class="twfi">${l.map(([g,v])=>`<i class="fg-${g}" title="${FG_N[g]}">${fgIc(g)}<b>${v>0?'▲':'▼'}</b></i>`).join('')}</span>`}
/* who won the night: the most fans gained tonight; the show rating breaks a tie */
function qhNight(o){const sum=br=>{const b=o.blocks.find(x=>x.brand===br);if(!b)return null;if(b.segs.some(s=>s.fd!=null))return b.segs.reduce((a,s)=>a+(s.fd||0),0)+(b.fn||0);
  if(o.fb&&o.fb[br]&&typeof fbNight==='function')return fbNight(o.fb[br]);return o.fans&&o.fans[br]!=null?o.fans[br]:null};
 const p=sum('p'),a=sum('ai');if(p==null||a==null)return null;if(p!==a)return p>a?'p':'ai';const r=o.ratings||{};if(r.p==null||r.ai==null)return 'tie';return r.p>r.ai+1e-9?'p':r.ai>r.p+1e-9?'ai':'tie'}
function qhTotal(o,br){const b=o.blocks.find(x=>x.brand===br);return b?b.segs.reduce((a,s,i)=>a+qhFd(o,{s,b}),0)+(b.fn||0):0}
/* the bell: both lines take their night-wide step together. Safe to call twice. */
function qhBell(inst){const R=SRV;if(!R||!R.qh||!R.qh.bell||R.qh.rung)return false;R.qh.rung=true;const c=R.qh.n,was=R.inst;if(inst)R.inst=true;
 ['p','ai'].forEach(br=>{const d=qhBn(R.o,br)||0;R.qh.sum[br]+=d;R.qh.pts[br].push({c,v:R.qh.sum[br],d});R.qh.fresh[br]=true;R.qh.lab[br]=c});qhDraw();R.inst=was;return true}
/* the bell's plate: what moved each show's fans beyond its segments */
function qhBellHtml(br,who){const b=SRV.o.blocks.find(x=>x.brand===br);const l=(b&&b.fr)||[];
 return `<div class="twh ${br} dn nt qhbell"><div class="twhd"><span class="twl">${esc(who)} · After the bell</span></div>${l.length?l.slice(0,3).map(([t,v])=>`<div class="qhwhy"><b class="${v>0?'good':'bad'}">${v>0?'▲':'▼'}</b>${esc(t)}</div>`).join(''):'<div class="qhwhy muted">Nothing else moved</div>'}</div>`}
/* v472: fold the chart for the crowds table; instant on Skip and with reduced motion */
function qhFold(inst){const R=SRV;if(!R||!R.qh||R.qh.k>=1)return;const Q=R.qh,el=document.getElementById('qh-chart');if(Q.raf){cancelAnimationFrame(Q.raf);Q.raf=0}Q.shown=qhLim();
 const draw=()=>{if(el)el.innerHTML=qhSvg()+`<div class="qhics">${qhIcons()}</div>`};
 if(inst||R.inst||!el||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){Q.k=1;Q.fresh={};return draw()}
 const k0=Q.k,t0=performance.now(),D=450;Q.fresh={};
 const step=now=>{const t=Math.min(1,(now-t0)/D),e=1-Math.pow(1-t,3);Q.k=k0+(1-k0)*e;draw();Q.raf=t<1?requestAnimationFrame(step):0};Q.raf=requestAnimationFrame(step)}
Object.assign(window,{qhFold,qhBell,qhBellHtml,qhHtml,qhPush,qhHold,qhDraw,qhPlateIcons,qhNight,qhFmt,qhFd,qhTotal});
(function(){const c=document.createElement('style');c.textContent=`
.qhwrap{margin:8px 0 2px}
.qhwhy{display:flex;gap:8px;align-items:baseline;font-size:14px;line-height:1.35;margin:3px 0}.qhwhy b{font-size:12px;width:12px}
.qhleg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 6px}
.qht{display:flex;align-items:baseline;gap:7px;min-width:0;padding:6px 10px;background:#141417;box-shadow:inset 3px 0 0 var(--gold),inset 0 0 0 1px var(--line)}
.qht.ai{flex-direction:row-reverse;box-shadow:inset -3px 0 0 var(--heel),inset 0 0 0 1px var(--line)}
.qht span{font:700 11px/1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qht.p span{color:var(--gold)}
.qht b{font:900 italic 22px/1 'BC',sans-serif;margin-left:auto;color:var(--gold);white-space:nowrap}.qht.ai b{margin-left:0;margin-right:auto;color:var(--heel)}
.qht em{display:none}.qht.win{box-shadow:inset 3px 0 0 var(--gold),inset 0 0 0 1px var(--gold)}.qht.ai.win{box-shadow:inset -3px 0 0 var(--heel),inset 0 0 0 1px var(--gold)}
.qht b.punch{animation:twPunch .5s cubic-bezier(.2,1.6,.4,1)}
.srv.qh .twpair{min-height:0;justify-content:flex-start}
.srv.qh .qhwrap,.srv.qh .twpair{transition:opacity .35s ease,filter .35s ease}
.srv.qh.dim .qhwrap{position:relative;z-index:2}
.srv.qh.qf-p .qhwrap{opacity:.3;filter:saturate(.4)}
.srv.qh.qf-c .twpair{opacity:.3;filter:saturate(.4)}
body:not(.tv) .srv.qh{min-height:min(760px,calc(100dvh - 100px))}
.srv.qh .twrd{margin:8px 0 6px}
body:not(.tv) .srv.qh .twcd .tkc{--w:58px;width:58px}
body:not(.tv) .srv.qh .twps.cards{gap:8px}
body:not(.tv) .srv.qh .twh{gap:5px;padding-top:8px;padding-bottom:8px}
.qhcap{display:flex;justify-content:space-between;align-items:baseline;padding:0 2px 2px}
.qhcap span{font:900 italic 13px/1 'BC',sans-serif;text-transform:uppercase;letter-spacing:.04em;color:var(--text)}
.qhcap em{font:700 10px 'BC',sans-serif;font-style:normal;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.qhchart{position:relative;background:#141417;box-shadow:inset 0 0 0 1px var(--line);padding:2px 0 22px}
.qhsvg{display:block;width:100%;height:auto;overflow:visible}
.qhg{stroke:rgba(255,255,255,.06);stroke-width:1}.qhz{stroke:rgba(255,255,255,.22);stroke-width:1;stroke-dasharray:3 3}
.qhax{fill:var(--mut);font:700 9px 'BC',sans-serif;letter-spacing:.04em}
.qhxl{fill:var(--mut);font:700 10px 'BC',sans-serif}.qhxl.me{fill:var(--red)}
.qhov{fill:rgba(242,193,78,.07)}.qhovt{fill:rgba(242,193,78,.55);font:700 9px 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase}
.qhl{stroke-width:3;stroke-linecap:round;fill:none}.qhl.p{stroke:var(--gold)}.qhl.ai{stroke:var(--heel)}
.qhl.nw{stroke-dasharray:1;stroke-dashoffset:1;animation:qhDraw .7s cubic-bezier(.4,.1,.3,1) forwards}.qhl.nw.sl{animation-duration:1.6s}
@keyframes qhDraw{to{stroke-dashoffset:0}}
.qhd.p{fill:var(--gold)}.qhd.ai{fill:var(--heel)}.qhd{stroke:#141417;stroke-width:2}
.qhd.nw{opacity:0;animation:qhPop .35s cubic-bezier(.2,1.6,.4,1) .65s forwards;transform-box:fill-box;transform-origin:center}
.qhl.sl~.qhd.nw,.qhd.nw.sl{animation-delay:1.55s}
@keyframes qhPop{from{opacity:0;transform:scale(2.2)}to{opacity:1;transform:none}}
.qhn{font:900 italic 12px 'BC',sans-serif}.qhn.p{fill:var(--gold)}.qhn.ai{fill:var(--heel)}
.qhn.nw{opacity:0;animation:qhIn .3s ease-out .75s forwards}
@keyframes qhIn{to{opacity:1}}
.qhics{position:absolute;left:0;right:0;bottom:3px;height:16px}
.qhic{position:absolute;top:0;transform:translateX(-50%);display:flex;gap:1px;white-space:nowrap}
.qhic i,.twfi i{display:inline-flex;align-items:center;font-style:normal}
.qhic .fgi{width:12px;height:12px;margin:0}.qhic b{font-size:8px;line-height:1}
.twfi{display:inline-flex;gap:5px;margin-right:6px;opacity:0;transition:opacity .4s}.twh.nt .twfi{opacity:1}
.twfi .fgi{width:15px;height:15px;margin:0}.twfi b{font-size:10px;margin-left:1px}
.twhd .twsv{display:flex;align-items:center}
.twh.mini{padding-top:7px;padding-bottom:7px}.twh.mini .twps,.twh.mini>.twt,.twh.mini .twnote,.twh.mini .twarc{display:none}
.twsc em.qht{color:var(--mut)}
body.tv .qhwrap{max-width:900px;margin:12px auto 0}
/* v472: on a wide screen the chart keeps a sensible size instead of stretching to the sheet's width */
@media (min-width:700px){body:not(.tv) .srv.qh .qhwrap{max-width:560px;margin-left:auto;margin-right:auto}}
/* v472: the next tap stays in reach while the crowds table is longer than the screen; v474: flush with the true screen bottom (sheet pads 24px + the home-indicator inset below its sticky edge) */
.qhstick{position:sticky;bottom:calc(-24px - env(safe-area-inset-bottom));z-index:3;margin-top:6px;padding:7px 0 max(7px,calc(env(safe-area-inset-bottom) - 16px));background:#141417;box-shadow:inset 0 1px 0 var(--line)}
/* v477: a slim bar — the tap sits just above the home indicator instead of a full inset of empty space below it */
.qhstick .twnext{font-size:15px;line-height:20px}`;document.head.appendChild(c)})();
