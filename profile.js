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
   v423 look: a page-hero header (big name, Ring / Mic / Pop as the three big numbers) and plain lists under gold
   section heads — words over meters, no boxes, one line per fact.
   This file owns showW; morale.js, friends.js, history.js and trades.js only supply the pieces. Loaded before desk.js,
   which adds its desktop next/previous arrows on top. */
'use strict';
(function(){
const inS=()=>S&&(S.phase==='season'||S.phase==='over');
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
/* a section: gold head, plain rows */
const sec=(t,body,x)=>body?`<section class="pf-sec"><div class="pf-h"><span>${t}</span>${x||''}</div>${body}</section>`:'';
const row=(l,v,c,sub)=>`<div class="pf-row"><span class="pf-l">${l}</span><span class="pf-v ${c||''}">${v}</span>${sub?`<div class="pf-s">${sub}</div>`:''}</div>`;
const staWord=v=>v>=100-FAT_OK?['Ready','good']:v>=100-FAT_RISK?['Tired','warnt']:['Running on empty','bad'];
const mine=w=>w.own==='p'&&inS();

function hero(w,id){const ts=titlesOf(id).map(t=>t.n);const who=w.own==='p'?'Your roster':w.own==='ai'?(ON()?esc(nameOf('ai')):'Rival roster'):'Free agent';
 const pic=typeof cardsOn==='function'&&cardsOn()&&typeof tcCard==='function'?`<div class="wd-pic tcwd">${tcCard(w,{noWear:!w.own})}</div>`:`<div class="wd-pic">${portrait(w)}</div>`;
 const top=Math.max(w.ring,w.mic,w.pop);
 const num=(l,v,g)=>`<div class="${v===top?'lit':''}"><b>${Math.round(v)}</b><small>${l}</small>${g?`<em>${g}</em>`:''}</div>`;
 const grow=v=>w.own==='p'?growWord(v):'';
 return `<div class="wd-top wdt pf-hero"><div class="pf-ht">${pic}<div class="pf-id"><div class="tt-k">${who} · <span class="${w.al==='f'?'face':'heel'}">${w.al==='f'?'Face':'Heel'}</span></div>
  <div class="pf-name ${w.name.length>13?'ln':''}">${esc(w.name)}</div><div class="pf-bar"></div>
  <div class="pf-meta">${w.g==='M'?"Men's":"Women's"} division${typeof fgTag==='function'?` · ${fgTag(w)}`:''}${w.rookie?' · <span class="rk">ROOKIE</span>':''}</div>
  ${ts.length?`<div class="pf-champ">🏆 ${esc(ts.join(', '))} Champion</div>`:''}${w.inj?`<div class="err pf-inj">${w.susp?'⛔ Suspended':'🚑 Injured'} · ${plural(w.inj,'week')}</div>`:''}</div></div>
  <div class="pf-nums">${num('Ring',w.ring,grow(w.ring)+learnTag(w,'r').replace(' · ',' · '))}${num('Mic',w.mic,grow(w.mic)+learnTag(w,'m'))}${num('Pop',w.pop)}</div></div>`}

/* owed and urgent: only shows when there's something to do */
function owed(w,id){if(!mine(w))return '';const r=[];
 if(w.walkRisk)r.push(row('⚠️ Threatening to walk out','Win them back','bad'));
 if(w.deb)r.push(row('🎉 Debut','Put them on a show','gold'));
 (typeof dealActive==='function'?dealActive(w):[]).forEach(k=>{const d=w.deal;
  if(k==='me')r.push(row('⭐ Main events owed',`${d.me.need-d.me.got} · by week ${wkOf(d.me.by)}`));
  else if(k==='shot'){const wk=wkOf(d.shot.by);r.push(row('🏆 Title match owed',`by ${PPVS[wk]?esc(PPVS[wk]):'week '+wk}`))}
  else if(k==='cc')r.push(row('🎬 Creative control','Won’t take a loss'));
  else r.push(row('📺 Every PPV card','This season'))});
 (S.promises||[]).filter(pr=>pr.week>=S.week&&(pr.a===id||pr.b===id)).sort((a,b)=>a.week-b.week).forEach(pr=>{const o=S.w[pr.a===id?pr.b:pr.a];
  r.push(row(`${pr.kind==='shot'?'🎟️ Title shot':'🎯 Promised'}${o?' vs '+esc(o.name):''}`,pr.week===S.week?'Tonight':esc(pr.ppv||'Week '+pr.week),pr.week===S.week?'warnt':''))});
 const deal=w.con<=8?`<button class="btn pf-deal" onclick="dealNegotiate('${id}')">✍️ New deal · ${plural(w.con,'week')} left</button>`:'';
 return r.length||deal?sec('Needs you',r.join('')+deal):''}

function now(w,id){if(!mine(w))return '';const v=sta(w);const [sw,sc]=staWord(v);const [mi,mw]=typeof moodWord==='function'?moodWord(w.mor):['',''];
 const why=typeof moodTop==='function'?moodTop(w,3):[];const watch=typeof moodWatch==='function'?moodWatch(w):[];
 const fr=typeof fgKnown==='function'?fgKnown(w):[];const ptw=typeof ptwOn==='function'&&ptwOn(w);const tr=S.training.find(t=>t.id===id);
 const tb=f=>`<button class="pf-tg ${tr&&tr.f===f?'on':''}" onclick="train('${id}','${f}')">${f==='ring'?'Ring':'Mic'}</button>`;
 return sec('Right now',
  row('Stamina',`${sw} <small>${v}</small>`,sc)+
  row('Morale',`${mi} ${mw} <small>${Math.round(w.mor)}</small>`,w.mor<35?'bad':w.mor<50?'warnt':'',[...watch.map(t=>`<b class="warnt">${esc(t)}</b>`),why.length?why.map(([t,x])=>`${esc(t)} <b class="${x>0?'good':'bad'}">${x>0?'+':''}${Math.round(x)}</b>`).join(' · '):''].filter(Boolean).join('<br>'))+
  (ptw?row('😤 Chip on their shoulder',`Through week ${wkOf(w.ptw.until)}`,'good'):'')+
  (fr.length?row('🤝 Friends',fr.map(o=>esc(o.name.split(' ').slice(-1)[0])).join(', ')):'')+
  row('Durability',durWord(durOf(w)),durOf(w)<50?'warnt':'')+
  row('Training',`${tb('ring')}${tb('mic')}`))}

function crowd(w){if(typeof fgOf!=='function')return '';const g=fgOf(w);const want=typeof FB_WANT!=='undefined'?FB_WANT:{};
 const fav=favKnown(w)&&favOf(w)&&STIPS[favOf(w)];
 const body=g[0]==='und'?row(fgTag(w),'Still finding one','muted'):g.map(k=>`<div class="pf-row pf-cr"><span class="fgw">${fgLbl(k)}</span><div class="pf-s">Want ${esc(want[k]||'')}</div></div>`).join('');
 return sec('Their crowd',body+(fav?row('🎯 Natural in',esc(fav.n),'gold'):''))}

function feuds(w,id){const l=Object.entries(S.heat||{}).filter(([k,h])=>h>=1&&k.split('|').includes(id)).sort((a,b)=>b[1]-a[1]).slice(0,4);if(!l.length)return '';
 return sec('Feuds',l.map(([k,h])=>{const o=S.w[k.split('|').find(x=>x!==id)];if(!o)return '';const fi=typeof feudInfo==='function'&&w.own==='p'&&o.own==='p'&&feudInfo(id,o.id);
  const t=heatTier(h);return `<div class="pf-row ${fi?'tap':''}" ${fi?`onclick="openFeud('${id}','${o.id}')"`:''}><span class="pf-l">${alSpan(o)}${o.own!==w.own?` <small>${o.own==='p'?'yours':o.own==='ai'?'rival':'FA'}</small>`:''}</span><span class="pf-v pf-t${t+1}">${esc(typeof heatLbl==='function'?heatLbl(h).replace(/^(?:🔥)+\s*/u,''):'Heat')}${isStale(id,o.id)?' <small>· stale</small>':''}${fi?' <i>›</i>':''}</span></div>`}).join(''))}

/* matchups on your roster: tap a name to see why */
function matchups(w){if(!S||S.phase==='rookies'||S.phase==='draft')return '';const mineL=ownList('p').filter(o=>o.id!==w.id);if(!mineL.length)return '';
 const line=(o,p)=>{const tot=p.reduce((a,x)=>a+x.v,0);return `<details class="pf-mu"><summary class="pf-row tap"><span class="pf-l">${alSpan(o)}${o.inj?' 🚑':''}</span><span class="pf-v ${tot>=6?'good':tot<0?'bad':''}">${chemWord(tot)}${metPair(w.id,o.id)?'':' <small>on paper</small>'}</span></summary><div class="pf-why">${partsHtml(p)}</div></details>`};
 const sc=f=>mineL.map(o=>{const p=f(w,o);return [o,p,p.reduce((a,x)=>a+x.v,0)]}).sort((a,b)=>b[2]-a[2]);
 const opp=sc(chemParts);const part=w.own&&w.own!=='p'?[]:sc(teamParts).slice(0,2);const bad=opp.length>6?opp.slice(-1).filter(x=>x[2]<0):[];
 return sec(w.own==='p'?'Best matchups':'Against your roster',`${opp.slice(0,3).map(([o,p])=>line(o,p)).join('')}${part.length?`<div class="pf-sub">Tag partners</div>${part.map(([o,p])=>line(o,p)).join('')}`:''}${bad.length?`<div class="pf-sub">Keep apart</div>${bad.map(([o,p])=>line(o,p)).join('')}`:''}`,
  `<button class="pf-x" onclick="styChart('${w.id}')">${STYLE_N[w.st]} · How chemistry works</button>`)}

function traits(w){const l=(w.tr||[]).filter(t=>TRAITS[t]);if(!l.length)return '';
 return sec('Traits',l.map(t=>`<div class="pf-row pf-tr"><span class="pf-l">${TRAITS[t].i} <b>${TRAITS[t].n}</b></span><div class="pf-s">${TRAITS[t].d}</div></div>`).join(''))}

function contract(w,id){const teams=S.teams.filter(t=>t.m.includes(id)).map(t=>t.n);const m=w.mom||0;
 const rec=`${w.w}–${w.l}${m>=2?' <small class="good">on a roll</small>':m<=-2?' <small class="bad">cold</small>':''}`;
 return sec(w.own?'Contract':'Asking',`${w.own?row('Weeks left',w.con,w.con<=8?'warnt':''):''}${row(w.own?'Salary':'Asking',`${money(sal(w))}/wk`,'',w.own&&Math.abs(mkt(w)-sal(w))>=2?`Worth ${money(mkt(w))} now`:'')}${inS()?row('Record',rec):''}${teams.length?row('Teams',esc(teams.join(', '))):''}`)}

function career(w){if(!inS()||typeof careerHtml!=='function')return '';const h=careerHtml(w);if(!h)return '';
 return `<details class="pf-sec pf-car"><summary class="pf-h"><span>Career</span><i>›</i></summary>${h}</details>`}

/* what you'd do about someone who isn't yours */
function theirActs(w,id){let a='';
 if(S.phase==='draft'){if(inPool(w)&&ON()&&onClock()!=='p'&&!w.cw&&!w.rookie)a=`<button class="btn ${dqHas(id)?'sec':''}" onclick="dqToggle('${id}')">${dqHas(id)?'Remove from my queue':'➕ Add to my queue'}</button>`;else if(inPool(w)&&onClock()==='p')a=draftOk(w,'p')?`<button class="btn" onclick="pDraft('${id}')">Draft ${esc(w.name)} · ${money(mkt(w))}/wk</button>`:`<div class="err center">🚫 ${money(mkt(w))}/wk doesn't fit — you have ${money(capRoom('p'))} of cap room for ${picksLeft('p')} picks.</div>`}
 else if(!w.own&&S.phase==='season'&&!onMarket(w))a=`<div class="pf-note"><b>Not on the market</b> · may turn up in a future week</div>`;
 else if(!w.own&&S.phase==='season')a=`${!w.cw&&faLeft(w)?`<div class="pf-note gold">⏳ ${faLeft(w)<=1?'<b>Last week</b> to sign':'On the market '+faLeft(w)+' more weeks'}</div>`:''}${dealQuickNeeded(w)?dealQuickHtml(w):dealNeedsOffer(w)?`<button class="btn" onclick="dealOffer('${id}')">${myBid(id)?'📝 Revise my sealed offer':offerOf(id)?'📝 Send a sealed counter':'📝 Make an offer'} · asks ${money(signCost(w))}</button><div class="muted center tiny">${dealHints(w).join(' · ')}</div>`:`<button class="btn" onclick="sign('${id}')">Sign · ${money(signCost(w))}</button>`}${w.fee?`<div class="muted center tiny">Includes a ${money(w.fee)} development fee.</div>`:''}`;
 else if(w.own&&w.own!=='p'&&S.phase==='season'&&!isChamp(id)&&typeof openTrade==='function')a=`<button class="btn sec" onclick="openTrade('${id}')">🔁 Trade for ${esc(w.name)}</button>`;
 if(w.cw&&!w.own)a+=`<div class="row mt"><button class="btn sec" onclick="openCreate('${id}')">✏️ Edit</button><button class="btn sec danger" onclick="delCreated('${id}')">Delete</button></div>`;
 return a?`<div class="pf-act">${a}</div>`:''}

window.showW=function(id){const w=S.w[id];if(!w)return;WBACK=WD_BACK;WD_BACK=null;
 const foot=`<div class="pf-foot">${mine(w)?`<button class="pf-x" onclick="offTurnAsk('${id}')">🔄 Turn ${w.al==='f'?'heel':'face'}</button>`:''}<button class="pf-x" onclick="pastePhoto('${id}',()=>showW('${id}'))">📋 Paste photo</button><button class="pf-x" onclick="addPhoto('${id}')">📷 ${hasPhoto(w)?'Change':'Add'} photo</button>${IMG[id]?`<button class="pf-x" onclick="delPhoto('${id}')">Remove photo</button>`:''}${mine(w)?`<button class="pf-x danger" onclick="release('${id}')">Release</button>`:''}</div>`;
 openModal(`${hero(w,id)}${w.own==='p'?owed(w,id):theirActs(w,id)}${now(w,id)}${crowd(w)}${feuds(w,id)}${matchups(w)}${traits(w)}${contract(w,id)}${career(w)}${foot}<button class="btn ghost" onclick="wBack()">${WBACK?'Back to booking':'Close'}</button>`)};

const st=document.createElement('style');st.textContent=`
.wd-top.pf-hero{display:block;padding:16px 14px 26px}
.pf-ht{display:flex;gap:14px;align-items:flex-start}.pf-id{min-width:0;flex:1}
.pf-hero .tt-k{font:800 italic 13px/1.2 'BC','Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin:2px 0 4px}
.pf-name{font:900 italic 38px/.95 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.01em;color:var(--text);overflow-wrap:anywhere}.pf-name.ln{font-size:31px}
.pf-bar{width:64%;max-width:150px;height:5px;background:var(--gold);margin:8px 0 7px}
.pf-meta{font-size:13.5px;color:var(--mut);line-height:1.5}.pf-meta .fgw{white-space:nowrap}
.pf-champ{margin-top:6px;color:var(--gold2);font-weight:700;font-size:14px}.pf-inj{margin-top:6px;font-size:14px}
.pf-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.pf-nums>div{display:flex;flex-direction:column}
.pf-nums b{font:900 italic 40px/1 'BC','Barlow Condensed',sans-serif;color:var(--mut)}.pf-nums .lit b{color:#fff}
.pf-nums small{font:800 12px/1.3 'BC','Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.pf-nums em{font-style:normal;font-size:11.5px;color:var(--mut);line-height:1.3}
.pf-sec{margin:20px 2px 0}
.pf-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font:800 italic 15px/1.2 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);padding-bottom:6px;border-bottom:2px solid var(--gold3)}
.pf-row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:2px 12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:15px}
.pf-row.tap{cursor:pointer}.pf-l{min-width:0}.pf-l small,.pf-v small{color:var(--mut);font-size:12px;font-weight:600}
.pf-v{text-align:right;font-weight:700;margin-left:auto}.pf-v i{font-style:normal;color:var(--gold);margin-left:4px}
.pf-s{flex-basis:100%;font-size:12.5px;color:var(--mut);line-height:1.4}.pf-s b{font-weight:700}.pf-s b.warnt{color:var(--ember)}
.pf-cr .pf-s{margin-top:2px}.pf-tr .pf-l b{font-weight:700}
.pf-t0{color:var(--mut)}.pf-t1{color:var(--gold2)}.pf-t2{color:var(--ember)}.pf-t3{color:var(--bad)}
.pf-sub{font:800 12px/1 'BC','Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);margin:12px 0 0}
.pf-mu>summary{list-style:none}.pf-mu>summary::-webkit-details-marker{display:none}.pf-mu[open]>summary{border-bottom:0}.pf-why{padding:0 0 9px;border-bottom:1px solid var(--line)}
.pf-tg{margin-left:6px;padding:4px 12px;background:var(--s3);color:var(--text);border:0;font:800 italic 13px/1.2 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}.pf-tg.on{background:var(--gold);color:var(--ink)}
.pf-x{background:none;border:0;padding:4px 0;color:var(--gold2);font:800 italic 13px/1.2 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.pf-x.danger{color:var(--bad)}
.pf-h .pf-x{font-size:12px;color:var(--mut)}
.pf-deal{margin:12px 0 0}.pf-act{margin-top:14px;display:flex;flex-direction:column;gap:8px}.pf-act .btn{margin:0}.pf-note{font-size:14px}
.pf-car>summary{cursor:pointer;list-style:none}.pf-car>summary::-webkit-details-marker{display:none}.pf-car>summary i{font-style:normal;transition:transform .2s}.pf-car[open]>summary i{transform:rotate(90deg)}
.pf-car .card{margin:8px 0 0!important;padding:0!important;background:none!important;box-shadow:none!important;clip-path:none!important}.pf-car .card .h.small{display:none}
.pf-foot{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 18px;margin:22px 0 4px}
`;document.head.appendChild(st);
})();
