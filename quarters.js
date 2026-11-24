/* ===================== v462: QUARTER-HOUR RATINGS (the reveal's scoreboard) =====================
   The two-show reveal (index.html srStage) used to be a tug of war on star ratings. The night is won on fans now, so the
   reveal draws the overnights instead: each show's line of fans gained tonight, one segment at a time. A segment's
   plate lands (cards, stars, the crowds it moved), then that show's line draws to its point with the segment's number
   next to it. The main event is the overrun at the right edge.
   Each segment's fans come from airing (fbSplit in fanbase.js, stored as seg.fd / seg.fi on the block's segments) and add
   up to the show's real fan change tonight, which is also what decides the night. Old saves without them share the
   night's fans out evenly. */
const QH_W=320,QH_H=132,QH_L=36,QH_R=312,QH_T=12,QH_B=104;
/* the segment's fans; fd is missing on shows aired before v462 */
function qhFd(o,it){if(!it)return 0;const s=it.s;if(s.fd!=null)return s.fd;const b=it.b,n=b.segs.length||1;
 const tot=o.fans&&o.fans[b.brand]!=null?o.fans[b.brand]:0;return Math.round(tot/n)}
function qhFmt(v){v=Math.round(v||0);return (v>=0?'+':'−')+(typeof fbK==='function'?fbK(Math.abs(v)):fmtFans(Math.abs(v)))}
/* the chart's columns: one per head-to-head round (crossover rounds stay off the chart) */
function qhInit(R){const cols=R.rounds.filter(r=>!r.x);R.qh={cols,pts:{p:[{c:0,v:0}],ai:[{c:0,v:0}]},sum:{p:0,ai:0},lab:{},ic:{},lim:10000,fresh:{}};}
function qhCol(rd){const R=SRV;return R&&R.qh?R.qh.cols.indexOf(rd)+1:0}
function qhRdOf(it){return SRV.rounds.find(r=>r.p===it||r.ai===it)}
/* a half landed: that show's line moves one column */
function qhPush(it){const R=SRV;if(!R||!R.qh||!R.two||!it)return;const br=it.b.brand;if(br!=='p'&&br!=='ai')return;const rd=qhRdOf(it);if(!rd)return;
 const c=qhCol(rd),d=qhFd(R.o,it);R.qh.sum[br]+=d;R.qh.pts[br].push({c,v:R.qh.sum[br],d});R.qh.fresh[br]=true;R.qh.lab[br]=c;
 if(br==='p')R.qh.ic[c]=it.s.fi||[];qhDraw()}
/* a round where one show had nothing in that slot: its line holds flat through the column */
function qhHold(rd){const R=SRV;if(!R||!R.qh||!R.two)return;const c=qhCol(rd);['p','ai'].forEach(br=>{if(rd[br])return;const P=R.qh.pts[br];if(P[P.length-1].c>=c)return;P.push({c,v:R.qh.sum[br],d:null})});qhDraw()}
function qhX(c){const n=SRV.qh.cols.length||1;return QH_L+(QH_R-QH_L)*c/n}
/* the scale only ever widens, in round steps, so a point never sits off the chart and the axis never gives the ending away */
function qhLim(){const Q=SRV.qh;let m=0;['p','ai'].forEach(b=>Q.pts[b].forEach(p=>m=Math.max(m,Math.abs(p.v))));
 const st=[10e3,20e3,30e3,50e3,75e3,100e3,150e3,200e3,300e3,500e3,750e3,1e6,2e6,5e6];while(Q.lim<m*1.08){const nx=st.find(x=>x>Q.lim);if(!nx){Q.lim=m*1.2;break}Q.lim=nx}return Q.lim}
function qhY(v,lim){const mid=(QH_T+QH_B)/2;return mid-(v/lim)*(QH_B-QH_T)/2}
function qhSvg(){const Q=SRV.qh,n=Q.cols.length,lim=qhLim(),y0=qhY(0,lim);
 const grid=[lim,lim/2,0,-lim/2,-lim].map(v=>{const y=qhY(v,lim);return `<line x1="${QH_L}" y1="${y}" x2="${QH_R}" y2="${y}" class="${v?'qhg':'qhz'}"/>${Math.abs(v)===lim||!v?`<text x="${QH_L-5}" y="${y+3.5}" class="qhax" text-anchor="end">${v?qhFmt(v):'0'}</text>`:''}`}).join('');
 const meX=n>1?(qhX(n-1)+qhX(n))/2:QH_L;
 const over=Q.cols[n-1]&&Q.cols[n-1].main?`<rect x="${meX}" y="${QH_T-4}" width="${QH_R-meX+4}" height="${QH_B-QH_T+8}" class="qhov"/><text x="${(meX+QH_R)/2+2}" y="${QH_B+1}" class="qhovt" text-anchor="middle">Overrun</text>`:'';
 const xl=Q.cols.map((r,i)=>`<text x="${qhX(i+1)}" y="${QH_B+16}" class="qhxl${r.main?' me':''}" text-anchor="middle">${r.main?'ME':i+1}</text>`).join('');
 const line=br=>{const P=Q.pts[br];let h='';for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];const nw=Q.fresh[br]&&i===P.length-1&&!SRV.inst;
   h+=`<line x1="${qhX(a.c)}" y1="${qhY(a.v,lim)}" x2="${qhX(b.c)}" y2="${qhY(b.v,lim)}" pathLength="1" class="qhl ${br}${nw?' nw':''}${nw&&Q.cols[b.c-1]&&Q.cols[b.c-1].main?' sl':''}"/>`}
  const L=P[P.length-1];if(P.length>1)h+=`<circle cx="${qhX(L.c)}" cy="${qhY(L.v,lim)}" r="4.5" class="qhd ${br}${Q.fresh[br]&&!SRV.inst?' nw':''}"/>`;return h};
 /* only each show's latest number is on the chart; the higher point's sits above it, the lower one's below */
 const lab=()=>{const out=[];const L={};['p','ai'].forEach(br=>{const P=Q.pts[br],q=P[P.length-1];if(P.length>1&&q.d!=null&&Q.lab[br]===q.c)L[br]=q});
  ['p','ai'].forEach(br=>{const q=L[br];if(!q)return;const o=L[br==='p'?'ai':'p'];const up=!o||o.c!==q.c?q.v>=0:q.v>=o.v;const x=qhX(q.c),y=qhY(q.v,lim)+(up?-9:16);const end=x>QH_R-30;
   out.push(`<text x="${end?x-7:x+7}" y="${y}" class="qhn ${br}${Q.fresh[br]&&!SRV.inst?' nw':''}" text-anchor="${end?'end':'start'}">${qhFmt(q.d)}</text>`)});return out.join('')};
 return `<svg viewBox="0 0 ${QH_W} ${QH_H}" class="qhsvg" role="img" aria-label="Fans gained tonight, segment by segment">${over}${grid}${xl}${line('ai')}${line('p')}${lab()}</svg>`}
/* the crowds each of your segments moved, in a row under the chart */
function qhIcons(){const Q=SRV.qh;if(typeof fgIc!=='function')return '';return Object.keys(Q.ic).map(c=>{const l=(Q.ic[c]||[]).slice(0,2);if(!l.length)return '';
 return `<span class="qhic" style="left:${(qhX(+c)/QH_W*100).toFixed(2)}%">${l.map(([g,s])=>`<i class="fg-${g}">${fgIc(g)}<b>${s>0?'▲':'▼'}</b></i>`).join('')}</span>`}).join('')}
function qhDraw(){const el=document.getElementById('qh-chart');if(!el||!SRV||!SRV.qh)return;el.innerHTML=qhSvg()+`<div class="qhics">${qhIcons()}</div>`;SRV.qh.fresh={}}
function qhHtml(R){qhInit(R);return `<div class="qhwrap"><div class="qhcap"><span>The overnights</span><em>Fans gained tonight</em></div><div class="qhchart" id="qh-chart">${qhSvg()}<div class="qhics"></div></div></div>`}
/* the plate's crowds: which crowds this segment moved, no numbers */
function qhPlateIcons(s){const l=s&&s.fi;if(!l||!l.length||typeof fgIc!=='function')return '';return `<span class="twfi">${l.map(([g,v])=>`<i class="fg-${g}" title="${FG_N[g]}">${fgIc(g)}<b>${v>0?'▲':'▼'}</b></i>`).join('')}</span>`}
/* who won the night: the most fans gained tonight; the show rating breaks a tie */
function qhNight(o){const sum=br=>{const b=o.blocks.find(x=>x.brand===br);if(!b)return null;if(b.segs.some(s=>s.fd!=null))return b.segs.reduce((a,s)=>a+(s.fd||0),0);
  if(o.fb&&o.fb[br]&&typeof fbNight==='function')return fbNight(o.fb[br]);return o.fans&&o.fans[br]!=null?o.fans[br]:null};
 const p=sum('p'),a=sum('ai');if(p==null||a==null)return null;if(p!==a)return p>a?'p':'ai';const r=o.ratings||{};if(r.p==null||r.ai==null)return 'tie';return r.p>r.ai+1e-9?'p':r.ai>r.p+1e-9?'ai':'tie'}
function qhTotal(o,br){const b=o.blocks.find(x=>x.brand===br);return b?b.segs.reduce((a,s,i)=>a+qhFd(o,{s,b}),0):0}
Object.assign(window,{qhHtml,qhPush,qhHold,qhDraw,qhPlateIcons,qhNight,qhFmt,qhFd,qhTotal});
(function(){const c=document.createElement('style');c.textContent=`
.qhwrap{margin:10px 0 2px}
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
body.tv .qhwrap{max-width:900px;margin:12px auto 0}`;document.head.appendChild(c)})();
