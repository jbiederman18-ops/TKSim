/* Tony Khan Simulator — the wrestler profile (v422).
   Tap any wrestler and this is what opens. It's laid out around what you need to use them well this week, in this order:
     • what needs doing (contract running out, promises and contract terms owed, a walkout threat, a debut waiting)
     • Condition — stamina, morale and what's moving it, what will cost morale next, backstage friends, durability
     • Crowd — the fan group(s) they draw, what that crowd wants, and a natural stipulation once you've found it
     • Feuds — every rivalry with its tier (Heat / Rivalry / Feud / Blood feud); tap one for the story
     • Matchups — best opponents and tag partners on your roster, and who to keep apart
     • Growth — In-ring, Mic and Popularity with where each is headed, plus Performance Center training
     • Traits, Contract & record, Career
   Someone else's wrestler (rival, free agent, draft pool) leads with the action you'd take on them instead.
   This file owns showW; morale.js, friends.js, history.js and trades.js only supply the pieces. Loaded before desk.js,
   which adds its desktop next/previous arrows on top. */
'use strict';
(function(){
const inS=()=>S&&(S.phase==='season'||S.phase==='over');
const sec=(t,body,x)=>body?`<div class="pf-sec">${t?`<div class="pf-h"><span>${t}</span>${x||''}</div>`:''}${body}</div>`:'';
const row=(l,v,c)=>`<div class="pf-row"><span>${l}</span><b class="${c||''}">${v}</b></div>`;
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
function staWord(v){return v>=100-FAT_OK?['Ready','good']:v>=100-FAT_RISK?['Tired — matches suffer','warnt']:['Running on empty — injury risk','bad']}

/* what needs doing about this wrestler, most urgent first */
function todo(w,id){const l=[];const own=w.own==='p';if(!own||!inS())return '';
 if(w.walkRisk)l.push(`<div class="pf-alert bad">⚠️ Threatening to walk out. Main events, wins and kept promises win them back.</div>`);
 if(w.con<=8)l.push(`<button class="btn" onclick="dealNegotiate('${id}')">✍️ New deal · ${plural(w.con,"week")} left</button>`);
 const terms=typeof dealActive==='function'?dealActive(w):[];
 const prom=(S.promises||[]).filter(pr=>pr.week>=S.week&&(pr.a===id||pr.b===id)).sort((a,b)=>a.week-b.week).map(pr=>{const o=S.w[pr.a===id?pr.b:pr.a];const when=pr.ppv||`week ${pr.week}`;
  return `<div class="tiny">${pr.kind==='contract'?'📜':pr.kind==='shot'?'🎟️':'🎯'} ${pr.kind==='shot'?`Title shot${o?' vs '+esc(o.name):''}`:o?'vs '+esc(o.name):'Promised match'} — ${esc(when)}${pr.week===S.week?' · <b class="warnt">tonight</b>':''}</div>`});
 if(terms.length||prom.length)l.push(`<div class="pf-owed"><div class="pf-h"><span>Owed</span></div>${terms.map(k=>`<div class="tiny">${dealTermTxt(w,k)}</div>`).join('')}${prom.join('')}</div>`);
 if(w.deb)l.push(`<div class="pf-alert">🎉 Hasn't debuted yet — put them on a show soon for a debut pop.</div>`);
 return l.length?`<div class="pf-todo">${l.join('')}</div>`:''}

function condition(w){if(w.own!=='p'||!inS())return '';const v=sta(w);const [sw,sc]=staWord(v);const [mi,mw]=typeof moodWord==='function'?moodWord(w.mor):['',''];
 const why=typeof moodTop==='function'?moodTop(w,3):[];const watch=typeof moodWatch==='function'?moodWatch(w):[];
 const fr=typeof fgKnown==='function'?fgKnown(w):[];const d=durOf(w);const ptw=typeof ptwOn==='function'&&ptwOn(w);
 return sec('Condition',`${statBar(`Stamina · <b class="${sc}">${sw}</b>`,v,null,'st-'+staCls(v))}
  ${statBar(`Morale · <b class="${w.mor<35?'bad':w.mor<50?'warnt':''}">${mi} ${mw}</b>`,w.mor,null,w.mor<30?'bad':'')}
  ${why.length?`<div class="pf-why">${why.map(([t,x])=>`<span><i>${esc(t)}</i><b class="${x>0?'good':'bad'}">${x>0?'+':''}${Math.round(x)}</b></span>`).join('')}<em>last 4 weeks</em></div>`:''}
  ${watch.map(t=>`<div class="pf-note warnt">${esc(t)}</div>`).join('')}
  ${ptw?`<div class="pf-note good">😤 Chip on their shoulder — extra fire in matches and promos through week ${wkOf(w.ptw.until)}</div>`:''}
  ${fr.length?`<div class="pf-note">🤝 Friends with ${fr.map(o=>esc(o.name)).join(', ')} — they feel each other's wins and broken promises</div>`:''}
  ${statBar(`Durability · ${durWord(d)}`,d,null,'st-'+durCls(d))}${durNote(w)?`<div class="pf-note muted">🩹 ${esc(durNote(w))}</div>`:''}`)}

function crowd(w){if(typeof fgOf!=='function')return '';const g=fgOf(w);const want=typeof FB_WANT!=='undefined'?FB_WANT:{};
 const fav=favKnown(w)&&favOf(w)&&STIPS[favOf(w)];
 const body=g[0]==='und'?`<div class="pf-note">${fgTag(w)}</div><div class="pf-note muted">Finds a crowd through the people they work with.</div>`
  :g.map(k=>`<div class="pf-crowd"><span class="fgw">${fgLbl(k)}</span><span>want ${esc(want[k]||'')}</span></div>`).join('');
 return sec('Crowd they draw',body+(fav?`<div class="pf-note gold">🎯 Natural in ${esc(fav.n)} — it lifts them more than anyone</div>`:''))}

function feuds(w,id){const l=Object.entries(S.heat||{}).filter(([k,h])=>h>=1&&k.split('|').includes(id)).sort((a,b)=>b[1]-a[1]).slice(0,5);if(!l.length)return '';
 return sec('Feuds',l.map(([k,h])=>{const o=S.w[k.split('|').find(x=>x!==id)];if(!o)return '';const st=isStale(id,o.id);const fi=typeof feudInfo==='function'&&w.own==='p'&&o.own==='p'&&feudInfo(id,o.id);
  const who=o.own!==w.own?` <span class="muted tiny">${o.own==='p'?'yours':o.own==='ai'?'rival':'free agent'}</span>`:'';
  return `<div class="pf-feud" ${fi?`onclick="openFeud('${id}','${o.id}')"`:''}><span class="row" style="gap:0">${face(o)}<b>${esc(o.name)}</b>${who}</span><span><b class="pf-tier t${heatTier(h)+1}">${esc(typeof heatLbl==='function'?heatLbl(h):'Heat')}</b>${st?' <span class="warnt tiny">stale</span>':''} <span class="muted tiny">${Math.round(h)}</span>${fi?' <span class="gold">›</span>':''}</span></div>`}).join(''))}

/* best opponents / partners on your roster: chemistry on paper until they've shared a ring */
function matchups(w){if(!S||S.phase==='rookies')return '';const fit=styleFit(w.st);
 const note=`<div class="pf-note muted">${STYLE_N[w.st]} · ${fit.best.length?`${fit.strong?'clicks with':'works best with'} <b class="good">${fit.best.join(', ')}</b>`:'no standout style pairing'}${fit.worst.length?` · struggles with <b class="bad">${fit.worst.join(', ')}</b>`:''} <button class="mini" onclick="styChart('${w.id}')">How chemistry works</button></div>`;
 const mine=ownList('p').filter(o=>o.id!==w.id);if(!mine.length)return sec('Matchups',note);
 const line=(o,p,open)=>{const tot=p.reduce((a,x)=>a+x.v,0);const nw=!metPair(w.id,o.id);return `<details class="mrow" ${open?'open':''}><summary class="row sb"><span class="row" style="gap:0">${face(o)}<b>${alSpan(o)}</b>${o.inj?' 🚑':''}</span><span class="${tot>=6?'good':tot<0?'bad':'muted'}"><b>${chemWord(tot)}</b>${nw?' <span class="muted">on paper ❓</span>':''}</span></summary><div class="mrb">${partsHtml(p)}<button class="mini" onclick="showW('${o.id}')">Open ›</button></div></details>`};
 const opp=mine.map(o=>{const p=chemParts(w,o);return [o,p,p.reduce((a,x)=>a+x.v,0)]}).sort((a,b)=>b[2]-a[2]);
 const part=w.own&&w.own!=='p'?[]:mine.map(o=>{const p=teamParts(w,o);return [o,p,p.reduce((a,x)=>a+x.v,0)]}).sort((a,b)=>b[2]-a[2]).slice(0,3);
 const bad=opp.length>6?opp.slice(-2).filter(x=>x[2]<0).reverse():[];
 return sec(w.own==='p'?'Matchups':'Matchups on your roster',`<div class="pf-sub">Best opponents</div>${opp.slice(0,3).map(([o,p],i)=>line(o,p,i===0)).join('')}${opp.length>3?`<details class="mmore"><summary>+${Math.min(2,opp.length-3)} more</summary>${opp.slice(3,5).map(([o,p])=>line(o,p)).join('')}</details>`:''}
  ${part.length?`<div class="pf-sub">Best tag partners</div>${part.map(([o,p])=>line(o,p)).join('')}`:''}${bad.length?`<div class="pf-sub">Keep apart</div>${bad.map(([o,p])=>line(o,p)).join('')}`:''}${note}`)}

function growth(w,id){const own=w.own==='p'&&inS();const tr=S.training.find(t=>t.id===id);
 const up=w.pop>=UPKEEP_AT&&own?`<div class="pf-note muted">At ${UPKEEP_AT}+ popularity slips a little every week they aren't featured.</div>`:'';
 const pc=own?`<div class="pf-train"><span class="muted tiny">Performance Center</span><button class="mini ${tr&&tr.f==='ring'?'on':''}" onclick="train('${id}','ring')">${tr&&tr.f==='ring'?'✓ ':''}Train ring</button><button class="mini ${tr&&tr.f==='mic'?'on':''}" onclick="train('${id}','mic')">${tr&&tr.f==='mic'?'✓ ':''}Train mic</button></div>`:'';
 return sec('Ring · Mic · Pop',`<div class="wstats">${statBar(`In-ring · ${growWord(w.ring)}${learnTag(w,'r')}`,w.ring)}${statBar(`Mic · ${growWord(w.mic)}${learnTag(w,'m')}`,w.mic)}${statBar('Popularity',w.pop)}</div>${up}${pc}`,
  `<span class="muted tiny">Ring rates matches · Mic rates promos</span>`)}

function traits(w){const l=(w.tr||[]).filter(t=>TRAITS[t]);if(!l.length)return '';
 return sec('Traits',l.map(t=>`<div class="trl"><span class="ti">${TRAITS[t].i}</span><div><b>${TRAITS[t].n}</b><span>${TRAITS[t].d}</span></div></div>`).join(''))}

function contract(w,id){const teams=S.teams.filter(t=>t.m.includes(id)).map(t=>t.n);const m=w.mom||0;
 const streak=m>=2?` · <span class="good">on a roll</span>`:m<=-2?` · <span class="bad">cold streak</span>`:'';
 return sec(w.own?'Contract & record':'Record',`${w.own?row('Contract',plural(w.con,'week')+' left',w.con<=8?'warnt':''):''}${row(w.own?'Salary':'Asking',`${money(sal(w))}/wk${w.own&&Math.abs(mkt(w)-sal(w))>=2?` <span class="muted tiny">worth ${money(mkt(w))} now</span>`:''}`)}${row('Record',`${w.w}–${w.l}${streak}`)}${teams.length?row('Teams',esc(teams.join(', '))):''}`)}

function career(w){if(!inS()||typeof careerHtml!=='function')return '';const h=careerHtml(w);if(!h)return '';
 return `<details class="pf-sec pf-car"><summary class="pf-h"><span>Career &amp; head to head</span></summary>${h}</details>`}

/* the action you'd take on someone who isn't yours */
function theirActs(w,id){let a='';
 if(S.phase==='draft'){if(inPool(w)&&ON()&&onClock()!=='p'&&!w.cw&&!w.rookie)a=`<button class="btn ${dqHas(id)?'sec':''}" onclick="dqToggle('${id}')">${dqHas(id)?'Remove from my queue':'➕ Add to my queue'}</button>`;else if(inPool(w)&&onClock()==='p')a=draftOk(w,'p')?`<button class="btn" onclick="pDraft('${id}')">Draft ${esc(w.name)} · ${money(mkt(w))}/wk</button>`:`<div class="err center">🚫 ${money(mkt(w))}/wk doesn't fit — you have ${money(capRoom('p'))} of cap room for ${picksLeft('p')} picks.</div>`}
 else if(!w.own&&S.phase==='season'&&!onMarket(w))a=`<div class="pf-alert"><b>Not on the market</b><div class="muted tiny">Unsigned, but not taking offers right now. They may turn up in a future week.</div></div>`;
 else if(!w.own&&S.phase==='season')a=`${!w.cw&&faLeft(w)?`<div class="gold center" style="margin-top:10px">⏳ On the market ${faLeft(w)<=1?'— <b>last week</b> to sign':'for '+faLeft(w)+' more weeks'}</div>`:''}${dealQuickNeeded(w)?dealQuickHtml(w):dealNeedsOffer(w)?`<button class="btn" onclick="dealOffer('${id}')">${myBid(id)?'📝 Revise my sealed offer':offerOf(id)?'📝 Send a sealed counter':'📝 Make an offer'} · asks ${money(signCost(w))}</button><div class="muted center tiny">${dealHints(w).join(' · ')}</div>`:`<button class="btn" onclick="sign('${id}')">Sign · ${money(signCost(w))}</button>`}${w.fee?`<div class="muted center tiny">Includes a ${money(w.fee)} development fee for this rookie.</div>`:''}${w.inj?'<div class="muted center">Currently injured.</div>':''}`;
 else if(w.own&&w.own!=='p'&&S.phase==='season'&&!isChamp(id)&&typeof openTrade==='function')a=`<button class="btn sec" style="margin-top:10px" onclick="openTrade('${id}')">🔁 Trade for ${esc(w.name)}</button>`;
 if(w.cw&&!w.own)a+=`<div class="row mt"><button class="btn sec" onclick="openCreate('${id}')">✏️ Edit</button><button class="btn sec danger" onclick="delCreated('${id}')">Delete</button></div>`;
 return a?`<div class="pf-todo">${a}</div>`:''}

function head(w,id){const ts=titlesOf(id).map(t=>t.n);const who=w.own==='p'?'Your roster':w.own==='ai'?(ON()?esc(nameOf('ai')):'Rival roster'):'Free agent';
 const pic=typeof cardsOn==='function'&&cardsOn()&&typeof tcCard==='function'?`<div class="wd-pic tcwd">${tcCard(w,{noWear:!w.own})}</div>`:`<div class="wd-pic">${portrait(w)}</div>`;
 return `<div class="wd-top wdt">${pic}<div style="min-width:0;position:relative"><div class="tt-k">${who} <span class="tt-al ${w.al==='f'?'fc':'hl'}">${w.al==='f'?'Face':'Heel'}</span></div><div class="h wd-n">${esc(w.name)}</div>
  <div class="muted">${w.g==='M'?"Men's":"Women's"} division${w.rookie?' · <span class="rk">ROOKIE</span>':''}</div>
  ${ts.length?`<div class="gold mt">🏆 ${esc(ts.join(', '))} Champion</div>`:''}${w.inj?`<div class="err mt">${w.susp?'⛔ Suspended':'🚑 Injured'} — out ${plural(w.inj,'more week')}</div>`:''}</div></div>`}

window.showW=function(id){const w=S.w[id];if(!w)return;WBACK=WD_BACK;WD_BACK=null;const own=w.own==='p';
 const tail=own&&inS()?`<div class="row mt" style="gap:6px"><button class="btn sec" onclick="offTurnAsk('${id}')">🔄 Turn ${w.al==='f'?'heel':'face'}</button><button class="btn sec danger" onclick="release('${id}')">Release</button></div>`:'';
 openModal(`${head(w,id)}${own?todo(w,id):theirActs(w,id)}${condition(w)}${crowd(w)}${feuds(w,id)}${matchups(w)}${growth(w,id)}${traits(w)}${contract(w,id)}${career(w)}
  ${tail}<div class="wd-photo"><button class="mini" onclick="pastePhoto('${id}',()=>showW('${id}'))">📋 Paste photo</button><button class="mini" onclick="addPhoto('${id}')">📷 ${hasPhoto(w)?'Change':'Add'} photo</button>${IMG[id]?`<button class="mini" onclick="delPhoto('${id}')">Remove photo</button>`:''}</div><button class="btn ghost" onclick="wBack()">${WBACK?'Back to booking':'Close'}</button>`)};

const st=document.createElement('style');st.textContent=`
.pf-todo{margin-top:12px;display:flex;flex-direction:column;gap:8px}.pf-todo .btn{margin:0}
.pf-alert{padding:9px 12px;background:var(--s2);box-shadow:inset 3px 0 0 var(--gold);font-size:13.5px}.pf-alert.bad{box-shadow:inset 3px 0 0 var(--bad)}
.pf-owed{padding:9px 12px;background:var(--s2);box-shadow:inset 3px 0 0 var(--gold)}.pf-owed .pf-h{margin-bottom:4px}.pf-owed .tiny{margin:3px 0}
.pf-sec{margin-top:12px;padding:10px 12px 11px;background:var(--s2)}
.pf-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px;font:800 italic 14px/1.2 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--gold2)}
.pf-h .muted{font:400 11.5px/1.2 inherit;font-family:inherit;letter-spacing:0;text-transform:none;font-style:normal}
summary.pf-h{cursor:pointer;list-style:none;margin:0}summary.pf-h::-webkit-details-marker{display:none}summary.pf-h::after{content:'▸';color:var(--gold)}.pf-car[open]>summary.pf-h{margin-bottom:6px}.pf-car[open]>summary.pf-h::after{content:'▾'}
.pf-car .card{margin:0!important;padding:0!important;background:none;box-shadow:none}.pf-car .card .h.small{display:none}
.pf-sec .wstats{margin-top:0}.pf-sec .stat{margin:6px 0}
.pf-sec>.stat{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 10px}.pf-sec>.stat>.row{display:contents}.pf-sec>.stat .bar{grid-column:1/-1}
.pf-row{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-top:1px solid var(--line);font-size:14px}.pf-row:first-of-type{border-top:0}.pf-row>span{color:var(--mut)}.pf-row>b{text-align:right;font-weight:700}
.pf-why{display:flex;flex-wrap:wrap;gap:4px 12px;margin:2px 0 6px;font-size:12.5px}.pf-why span{display:inline-flex;gap:5px}.pf-why i{font-style:normal}.pf-why em{color:var(--mut);font-style:normal;font-size:11.5px}
.pf-note{font-size:13px;margin:5px 0;line-height:1.35}
.pf-crowd{display:flex;align-items:baseline;gap:8px;margin:4px 0;font-size:13.5px}.pf-crowd .fgw{flex:none}.pf-crowd>span:last-child{color:var(--mut)}
.pf-feud{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line)}.pf-feud:first-of-type{border-top:0}.pf-feud[onclick]{cursor:pointer}
.pf-tier{font-size:12.5px}.pf-tier.t0{color:var(--mut)}.pf-tier.t1{color:var(--gold2)}.pf-tier.t2{color:var(--ember)}.pf-tier.t3{color:var(--bad)}
.pf-sub{font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:8px 0 2px}.pf-sub:first-child{margin-top:0}
.pf-train{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px}.pf-train>span{margin-right:auto}.pf-train .mini.on{color:var(--ink);background:var(--gold)}
.pf-sec .trl{margin:6px 0}
`;document.head.appendChild(st);
})();
