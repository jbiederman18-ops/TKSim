/* Tony Khan Simulator — the season calendar (v182).
   Where you are in the year and what's coming: a strip of all the weeks on the Home screen (PPVs in gold, TV specials
   marked, this week outlined), and a full calendar from the Home strip or the WK counter in the header — every PPV with
   what's special about it, TV specials, tournament rounds, crossover season, promised matches and your contracts
   running out. Loaded before the main script; everything here only runs once a game is going. */
'use strict';
const CAL_WWE=new Set(['Royal Rumble','WrestleMania','Money in the Bank','SummerSlam','Survivor Series']);
/* what's special about each PPV, by week */
function calPPVNote(w){const n=[];
 if(w===RR_WEEK)n.push("Men's and women's Royal Rumbles — the winners earn a title shot at "+(PPVS[WM_WEEK]||'WrestleMania'));
 if(w===WM_WEEK)n.push('Supershow — the Rumble winners get their title shots');
 if(w===MITB_WEEK)n.push("Men's and women's ladder matches for the briefcase");
 if(w===ALLIN_WEEK)n.push('Supershow — the Owen Hart Cup winners get their title shots');
 if(w===FD_WEEK)n.push('Crossover dream matches between the brands · the year ends here');
 return n}
/* everything else that happens in a week */
function calWeekNotes(w){const n=[];
 if(typeof TOURS!=='undefined')for(const k in TOURS){const D=TOURS[k];
  if(D.rr&&D.rr.includes(w))n.push(`${D.i} ${D.n} block matches`);
  if(D.semi===w)n.push(`${D.i} ${D.n} semi-finals`);
  if(D.final===w)n.push(`${D.i} ${D.n} final`)}
 if(!PPVS[w]&&w<FD_WEEK){let fd=true;for(let k=w;k<FD_WEEK;k++)if(PPVS[k]){fd=false;break}if(fd)n.push('⚔️ Crossover season — rival stars can invade')}
 (S.promises||[]).filter(pr=>pr.week===w&&S.w[pr.a]&&S.w[pr.b]).forEach(pr=>n.push(`${pr.kind==='contract'?'📜':pr.kind==='shot'?'🎟️':'🎯'} ${S.w[pr.a].name} vs ${S.w[pr.b].name}`));
 return n}
/* your wrestlers whose last week under contract falls in week w (this season) */
function calCons(w){return (typeof ownList==='function'?ownList('p'):[]).filter(x=>x.con>0&&S.week+x.con-1===w)}
const calKind=w=>PPVS[w]?(SUPER(w)?'sup':'ppv'):SPECIALS[w]?'spc':'tv';
/* the Home strip */
function calStrip(){if(!S||S.phase!=='season')return '';const np=nextPPV();let cells='';
 for(let w=1;w<=SEASON;w++){const k=calKind(w);const cls=`cw ${k}${w<S.week?' past':''}${w===S.week?' now':''}`;cells+=`<i class="${cls}" title="Week ${w}${PPVS[w]?' · '+PPVS[w]:SPECIALS[w]?' · '+SPECIALS[w]:''}"></i>`}
 const left=SEASON-S.week;
 return `<div class="card seascal" onclick="openCal()" role="button" aria-label="Open the season calendar"><div class="row sb"><span class="h small" style="margin:0">📅 Week ${Math.min(S.week,SEASON)} of ${SEASON}</span><span class="muted tiny">${np?(np.in===0?`<b class="gold">${esc(np.n)} this week</b>`:`<b class="gold">${esc(np.n)}</b> in ${np.in} wk${np.in>1?'s':''}`):''} · ${left?`${left} to go`:'last week'} ▸</span></div><div class="calstrip">${cells}</div></div>`}
/* the full calendar */
function openCal(){if(!S||!S.w)return;const names=showNames();const out=[];let lastBlock=-1;
 for(let w=1;w<=SEASON;w++){const blk=Math.ceil(w/4);
  if(blk!==lastBlock){lastBlock=blk;const end=blk*4;out.push(`<div class="calhd${end<S.week?' past':''}">${PPVS[end]?`Road to ${esc(PPVS[end])}`:`Weeks ${end-3}–${end}`}</div>`)}
  const past=w<S.week,now=w===S.week;const ppv=PPVS[w];const sp=SPECIALS[w];const k=calKind(w);
  const name=ppv?ppv:sp?`${sp} <span class="muted">(${esc(names.p)} special)</span>`:`${esc(names.p)}`;
  const notes=(ppv?calPPVNote(w):[]).concat(calWeekNotes(w));const cons=past?[]:calCons(w);
  if(cons.length)notes.push(`⏳ Last week under contract: ${cons.map(x=>x.name).join(', ')}`);
  const away=w-S.week;
  out.push(`<div class="calrow ${k}${past?' past':''}${now?' now':''}"><div class="calwk">W${w}</div><div class="calbody"><div class="row sb" style="gap:8px"><b class="${ppv?'gold':''}">${ppv?(SUPER(w)?'🌟 ':'🏆 '):sp?'📺 ':''}${ppv?esc(ppv):name}</b><span class="muted tiny" style="flex:none">${now?'<b class="gold">This week</b>':past?'':away===1?'Next week':`In ${away} wks`}</span></div>${ppv?`<div class="tiny muted">${CAL_WWE.has(ppv)?'WWE':'AEW'} pay-per-view</div>`:''}${notes.length&&!past?notes.map(x=>`<div class="tiny">${esc(x)}</div>`).join(''):''}</div></div>`)}
 const np=nextPPV();
 openModal(`<div class="h mhd">📅 Season ${S.season} calendar</div><div class="muted" style="margin:-4px 0 8px">Week ${Math.min(S.week,SEASON)} of ${SEASON}${np?` · next PPV: <b class="gold">${esc(np.n)}</b>${np.in?` in ${np.in} week${np.in>1?'s':''}`:' this week'}`:''}. After week ${SEASON} the year ends: awards, then the offseason.</div><div class="calstrip big">${Array.from({length:SEASON},(_,i)=>{const w=i+1;return `<i class="cw ${calKind(w)}${w<S.week?' past':''}${w===S.week?' now':''}"></i>`}).join('')}</div><div class="callist">${out.join('')}</div><button class="btn mt" onclick="closeModal()">Close</button>`);
 /* open on this week, not week 1 */
 setTimeout(()=>{const el=document.querySelector('#modal .calrow.now');if(el&&el.scrollIntoView)el.scrollIntoView({block:'center'})},60)}
/* styles */
(function(){const css=`.seascal{cursor:pointer}
.calstrip{display:flex;gap:2px;align-items:flex-end;height:22px;margin-top:8px}
.calstrip.big{height:28px;margin:0 0 10px}
.calstrip .cw{flex:1;height:45%;background:#3a3c44;border-radius:2px;min-width:0}
.calstrip .cw.spc{height:65%;background:#6b6f7c}
.calstrip .cw.ppv{height:100%;background:var(--gold3)}
.calstrip .cw.sup{height:100%;background:var(--gold)}
.calstrip .cw.past{opacity:.35}
.calstrip .cw.now{outline:2px solid var(--gold2);outline-offset:1px;opacity:1}
.calhd{font:700 12px 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--gold2);margin:12px 0 4px}
.calhd.past{color:var(--mut)}
.calrow{display:flex;gap:10px;padding:7px 8px;border-radius:8px;margin:2px 0}
.calrow.ppv,.calrow.sup{background:rgba(216,180,73,.08);border:1px solid rgba(216,180,73,.25)}
.calrow.past{opacity:.45}
.calrow.now{outline:2px solid var(--gold2)}
.calwk{flex:none;width:34px;font:700 13px 'BC',sans-serif;color:var(--mut);padding-top:1px}
.calbody{flex:1;min-width:0}
.hudc.cal{cursor:pointer}`;const s=document.createElement('style');s.textContent=css;(document.head||document.documentElement).appendChild(s)})();
