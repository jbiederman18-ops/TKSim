/* Tony Khan Simulator — the title picture (v193).
   Every title shot your brand owes, in one place: who earned it, how (Rumble, Money in the Bank, a tournament, the
   Casino Gauntlet, a pitch you said yes to, a contract clause, a #1 contender run), when it lands, and how hot the
   feud with the champion is. Three parts:
     • tpList()      — the shots, built fresh from the game state (promises, pitch trials, contracts, contenders, briefcases)
     • tpSync(notes) — earning a shot starts the rivalry: contender and champion get a little heat (TP_SEED) the first
                       time they're paired, and a shot that's already booked follows the belt if it changes hands
     • titlePicCard() — the panel at the top of the Titles screen; the Book screen's checklist and the weekly briefing
                       nudge you to build the ones coming up, and Suggest the rest gives them a promo
   Loaded after the main script. */
'use strict';
const TP_READY=35,TP_SEED=15,TP_PACE=8,TP_NUDGE=4,TP_CTD_WKS=10;
/* the payoff week for a deadline: the last PPV on or before it, or the deadline itself if there's no PPV in between */
function tpPayWeek(by){let p=null;for(let x=S.week;x<=Math.min(by,SEASON);x++)if(PPVS[x])p=x;return p!=null?p:by}
/* the singles title a contract's "title shot" clause points at: the same one Suggest the rest would book */
function tpDealTitle(w){return Object.values(S.titles).find(t=>t.kind==='singles'&&t.g===w.g&&t.holders.length===1&&S.w[t.holders[0]]&&S.w[t.holders[0]].own==='p'&&t.holders[0]!==w.id)}
function tpList(){if(!S||!S.titles||!S.w||S.phase!=='season')return [];const out=[];const seen=new Set();
 const add=e=>{const w=S.w[e.a];const t=S.titles[e.title];if(!w||w.own!=='p'||!t||t.holders.includes(e.a))return;
  const k=e.a+'>'+e.title;if(seen.has(k))return;seen.add(k);
  const ch=t.holders.map(id=>S.w[id]).filter(Boolean);e.w=w;e.t=t;e.B=e.b&&S.w[e.b]||null;
  e.vacant=!ch.length;e.away=!!(ch.length&&ch[0].own!=='p');e.champ=ch.length&&!e.away?ch:null;
  const us=[e.a].concat(e.b?[e.b]:[]);
  e.heat=e.champ?Math.max(0,...e.champ.flatMap(c=>us.map(u=>heatOf(u,c.id)))):0;
  e.in=e.week!=null?e.week-S.week:null;out.push(e)};
 /* earned and promised shots with a fixed date */
 (S.promises||[]).filter(pr=>pr.kind==='shot'&&pr.week>=S.week&&pr.title).forEach(pr=>add({a:pr.a,title:pr.title,week:pr.week,ppv:pr.ppv||PPVS[pr.week]||'',ic:'🎟️',lab:pr.why||'Earned title shot',fixed:1}));
 /* "you've got it" — a title match you promised in a pitch */
 (S.trials||[]).filter(t=>t.goal==='title'&&t.title).forEach(t=>{const by=t.end-awBase();const wk=tpPayWeek(by);add({a:t.a,b:t.b||null,title:t.title,week:wk,ppv:PPVS[wk]||'',by,ic:'📨',lab:'You promised it'})});
 /* contract clauses */
 ownList('p').forEach(w=>{const d=w.deal;if(!d||!d.shot)return;const t=tpDealTitle(w);if(!t)return;const by=d.shot.by-awBase();const wk=tpPayWeek(by);add({a:w.id,title:t.id,week:wk,ppv:PPVS[wk]||'',by,ic:'📜',lab:'Contract clause'})});
 /* #1 contenders: earned, but no date set */
 Object.entries(S.ctd||{}).forEach(([tid,c])=>add({a:c.a,b:c.b||null,title:tid,ic:'☝️',lab:'#1 contender'}));
 return out.sort((x,y)=>(x.in==null)-(y.in==null)||(x.in||0)-(y.in||0)||y.heat-x.heat)}
/* briefcases: no feud needed, they can strike any time */
function tpCases(){if(!S||!S.mitb)return [];return Object.keys(S.mitb).map(id=>S.w[id]).filter(w=>w&&w.own==='p')}
/* how the build is going: [kind, text] with kinds ok / w / b / n like the checklist */
function tpStat(e){if(e.vacant)return ['n','Vacant — book them in a match for it'];if(e.away)return ['n','The rival holds it — this one is a PPV title challenge'];
 const h=e.heat;if(h>=TP_READY)return ['ok','💥 Hot enough to pay off'];
 if(e.in==null)return h>=20?['ok','Rivalry brewing — pick a PPV for it']:['n','No date yet — pick a PPV and build to it'];
 if(e.in<=0)return ['b',`Cold — it's tonight at 🔥${Math.round(h)}`];
 return h+TP_PACE*e.in>=TP_READY?['ok',`On track · ${e.in} week${e.in>1?'s':''} to build`]:['b',`Behind · ${e.in} week${e.in>1?'s':''} left — build it every week`]}
function tpWhen(e){if(e.in==null)return 'No date';const w=e.in===0?'Tonight':e.in===1?'Next week':`In ${e.in} weeks`;return e.ppv?`${e.ppv} · ${w}`:e.by!=null?`By week ${e.by} · ${w}`:`Week ${e.week} · ${w}`}
function tpNeedsBuild(e){return !!(e.champ&&e.champ.length===1&&e.heat<TP_READY&&e.in!=null&&e.in>0&&e.in<=TP_NUDGE&&!e.w.inj&&!e.champ[0].inj)}
/* the shot is earned → the rivalry starts. Each contender/champion pair is seeded once. */
function tpSync(notes){if(!S||!S.titles||!S.w||S.phase!=='season')return;notes=notes||[];S.tps=S.tps||{};S.ctd=S.ctd||{};
 /* a booked shot follows the belt */
 (S.promises||[]).forEach(pr=>{if(pr.kind!=='shot')return;const t=S.titles[pr.title];const h=t&&t.holders[0]&&S.w[t.holders[0]];if(h&&h.own==='p'&&h.id!==pr.a)pr.b=h.id});
 /* contenders who won the belt, left, or waited too long without a date */
 for(const tid in S.ctd){const c=S.ctd[tid],t=S.titles[tid],w=c&&S.w[c.a];if(!t||!w||w.own!=='p'||t.holders.includes(c.a)||AW()-c.aw>TP_CTD_WKS)delete S.ctd[tid]}
 const live=new Set();
 tpList().forEach(e=>{if(!e.champ||e.t.kind!=='singles')return;const C=e.champ[0];const k=e.a+'>'+e.title+'>'+C.id;live.add(k);if(S.tps[k])return;S.tps[k]=AW();
  const hk=key(e.a,C.id);const before=S.heat[hk]||0;if(before>=TP_SEED)return;
  S.heat[hk]=TP_SEED;if(S.touched)touch(hk);
  fhLog(e.a,C.id,{ic:'🎟️',d:TP_SEED-before,h:TP_SEED,n:`${e.w.name} has a shot coming at ${C.name}'s ${e.t.n} title — the rivalry starts here`});
  const n=`🎟️ ${e.w.name} has ${C.name} in their sights: a ${e.t.n} title shot ${e.ppv?'at '+e.ppv:e.in!=null?'is coming':'is earned'}, so the rivalry starts now (🔥${TP_SEED}).`;notes.push(n);news(n)});
 for(const k in S.tps)if(!live.has(k))delete S.tps[k]}
/* the pitch said "win two and you're next in line" — and they did */
function tpContender(tid,a,b,notes){if(!S||!S.titles[tid])return;S.ctd=S.ctd||{};S.ctd[tid]={a,b:b||null,aw:AW()};tpSync(notes||[])}
/* go build it: straight to the Book screen with a face-to-face promo (or a match if the promos are full) */
function tpBuild(a,b){if(typeof mpLocked==='function'&&mpLocked())return;go('book');const c=S.card&&S.card.p||[];const k=c.some(sl=>sl.k==='promo'&&!sl.d)?'promo':'match';feudBook(k,a,b)}
/* Suggest the rest: one callout promo for each shot that needs building, soonest first */
function tpPromos(exP){return tpList().filter(e=>tpNeedsBuild(e)&&!exP.has(e.a)&&!exP.has(e.champ[0].id)).map(e=>{const[x,y]=[e.w,e.champ[0]].sort((p,q)=>q.mic-p.mic);return {type:'callout',a:x.id,b:y.id}})}
function tpRow(e){const st=tpStat(e);const C=e.champ&&e.champ[0];const ws=[e.w].concat(e.B?[e.B]:[]);
 const who=`${ws.map(w=>alSpan(w)).join(' &amp; ')}${C?` <span class="muted">vs</span> ${e.champ.map(c=>alSpan(c)).join(' &amp; ')}`:''}`;
 const cls=st[0]==='ok'?'good':st[0]==='b'?'bad':st[0]==='w'?'warnt':'';
 const canBuild=C&&e.champ.length===1&&!e.w.inj&&!C.inj&&e.heat<TP_READY&&e.in!==0&&!(ON()&&S.online&&S.online.booked&&S.online.booked.p);
 return `<div class="fb tpr ${st[0]==='b'?'tpbad':''}"><div class="row sb"><span class="frow" ${C&&e.heat>=1?`style="cursor:pointer" onclick="openFeud('${e.a}','${C.id}')"`:''}>${ws.map(face).join('')}${C?e.champ.map(face).join(''):''}<span class="fbn">${who}</span></span>${C?`<span class="fh t${heatTier(e.heat)+1}">🔥 ${Math.round(e.heat)}</span>`:''}</div>
 ${C?`<div class="bar heat tpbar"><i style="width:${Math.min(100,e.heat)}%"></i><b class="tpm" title="${TP_READY} heat: hot enough to pay off"></b></div>`:''}
 <div class="tpm2"><div class="tags" style="margin:6px 0 0"><span class="tg">${e.ic} ${esc(e.lab)} · ${esc(e.t.n)}</span><span class="tg ${e.in!=null&&e.in<=1?'warnt':''}">📅 ${esc(tpWhen(e))}</span><span class="tg ${cls}">${esc(st[1])}</span>${e.w.inj||C&&C.inj?`<span class="tg bad">🚑 ${esc([e.w].concat(C?[C]:[]).filter(w=>w.inj).map(w=>w.name.split(' ').slice(-1)[0]).join(', '))} out</span>`:''}</div>
 ${canBuild?`<button class="btn sec" style="margin:8px 0 0" onclick="tpBuild('${e.a}','${C.id}')">🎤 Build it — book them face to face</button>`:''}</div></div>`}
function titlePicCard(){if(!S||S.phase!=='season')return '';const l=tpList(),bc=tpCases();
 const behind=l.filter(e=>tpStat(e)[0]==='b').length;
 const body=l.length||bc.length?l.map(tpRow).join('')+(bc.length?`<div class="muted tiny" style="margin-top:8px">💼 ${bc.map(w=>esc(w.name)).join(' and ')} ${bc.length>1?'hold':'holds'} Money in the Bank — no build needed, they can cash in any time.</div>`:''):
  `<div class="muted mt">Nobody is owed a title shot right now. Rumble, Money in the Bank, tournament and Casino Gauntlet winners, title-shot pitches you agree to and contract clauses all land here, along with the feud they need.</div>`;
 return `<div class="card tpic"><div class="row sb"><div class="h small" style="margin:0">🎟️ Title picture</div><span class="muted tiny">${l.length?`${l.length} shot${l.length>1?'s':''} owed${behind?` · <b class="bad">${behind} behind</b>`:''}`:''}</span></div>
 <div class="muted tiny" style="margin:4px 0 6px">Earning a shot starts the rivalry. Build it to 🔥${TP_READY} — the gold line — before the night it's on, or the title match falls flat.</div>${body}</div>`}
/* Home tile line */
function tpTileTxt(){const l=tpList();if(!l.length)return '';const b=l.filter(e=>tpStat(e)[0]==='b').length;return ` · 🎟️ ${l.length} shot${l.length>1?'s':''}${b?` (${b} behind)`:''}`}
(function(){const st=document.createElement('style');st.textContent=`.tpbar .tpm{position:absolute;top:-3px;bottom:-3px;left:${TP_READY}%;width:2px;background:var(--gold2);border-radius:1px}.tpr.tpbad{border-left:3px solid var(--red);padding-left:8px}.tpic .tpr+.tpr{margin-top:8px}`;document.head.appendChild(st)})();
