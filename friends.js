/* Tony Khan Simulator — backstage friend groups (v361).
   After the draft, every human GM's roster is quietly split into friend groups (FG_SIZE people at most). Each group is
   built around one of the roster's top stars, the rest join where they fit (teammates and stablemates likelier), and a
   few people keep to themselves. Nobody is told who is in which group.
   Friends feel what happens to each other. When something big happens to a wrestler — a promise or contract term kept
   or broken, a pitch trial that worked or failed, a big win or loss (a title match, the main event or a PPV) — each friend
   on the same roster gets FG_SHARE of that morale swing, logged in their Mood as "Happy for X" / "Upset about how X was
   treated". Everyday changes (TV time, sitting at home) stay personal.
   You find out who's friends with whom over time: a share big enough to show in someone's Mood reveals that pair, and
   now and then a top star (pop FG_STAR+) comes to the office about a friend — angry about a broken promise, or thankful
   for a kept one or a title win. At most one of those a week. Known friends show on the profile as Backstage friends.
   Groups are dealt fresh each game (S.seed). New arrivals (free agents, call-ups, trades) find a group a while later, or
   stay loners. The offline rival's locker room keeps its simpler morale. Loaded after morale.js, before inbox.js. */
'use strict';
let FG_SHARE=.35;const FG_MIN=3,FG_SIZE=5,FG_LONER=.12,FG_STAR=75,FG_VIS=2,FG_PER=4.5;
const fgHum=b=>!!b&&(typeof MOR_HUM!=='function'||MOR_HUM(b));
const fgPair=(a,b)=>a<b?a+'|'+b:b+'|'+a;
/* S.fg[id] = group id · S.fgm[brand] = ids placed on that roster (keyed by brand, so league seats remap) · S.fgk = known pairs
   · S.fgv[brand] = the friend waiting at that GM's office */
function fgOn(id,b){return !!(S.fgm&&S.fgm[b]&&S.fgm[b].includes(id))}
function fgFriends(w){if(!w||!w.own||!S.fg||!S.fg[w.id]||!fgOn(w.id,w.own))return [];const g=S.fg[w.id];
 return ownList(w.own).filter(o=>o!==w&&S.fg[o.id]===g&&fgOn(o.id,w.own))}
function fgKnown(w){return fgFriends(w).filter(o=>S.fgk&&S.fgk[fgPair(w.id,o.id)])}
function fgRnd(b){const s=(S.seed||1)+'|fg|'+b+'|'+AW()+'|'+(S.fgN||0);return typeof seeded==='function'?seeded(s):Math.random}
function fgFit(w,members){let v=1;members.forEach(o=>{if(S.teams&&S.teams.some(t=>t.m.includes(w.id)&&t.m.includes(o.id)))v+=3;if(o.al===w.al)v+=.3});return v}
function fgPlace(b,list,first){const R=fgRnd(b);S.fg=S.fg||{};S.fgm=S.fgm||{};S.fgN=S.fgN||0;
 const mine=S.fgm[b]=(S.fgm[b]||[]).filter(id=>S.w[id]&&S.w[id].own===b);
 const groups={};mine.forEach(id=>{const g=S.fg[id];if(g)(groups[g]=groups[g]||[]).push(S.w[id])});
 let todo=list.slice();
 if(first){/* the top stars anchor the groups, so every group reaches the top of the card */
  const n=Math.max(2,Math.round((mine.length+todo.length)/FG_PER));todo.sort((a,b)=>b.pop-a.pop);
  todo.splice(0,n).forEach(w=>{const g='g'+(++S.fgN);S.fg[w.id]=g;groups[g]=[w];mine.push(w.id)});
  todo=todo.map(w=>[R(),w]).sort((a,b)=>a[0]-b[0]).map(x=>x[1])}
 todo.forEach(w=>{/* friend groups are 'g' ids; loners get an 'l' id of their own that nobody else joins */
  const open=Object.entries(groups).filter(([k,m])=>k[0]==='g'&&m.length<FG_SIZE);
  let g=null;if(R()>=(first?FG_LONER:.35)&&open.length){const ws=open.map(([k,m])=>fgFit(w,m));let t=R()*ws.reduce((a,x)=>a+x,0);for(let i=0;i<open.length;i++){t-=ws[i];if(t<=0){g=open[i][0];break}}if(!g)g=open[open.length-1][0]}
  if(!g)g='l'+(++S.fgN);S.fg[w.id]=g;(groups[g]=groups[g]||[]).push(w);mine.push(w.id)});
 Object.keys(S.fgm).forEach(k=>{if(k!==b)S.fgm[k]=S.fgm[k].filter(id=>!list.includes(S.w[id]))})}
/* deal the first groups for a roster, and place anyone who has arrived since (checked weekly and before any spread) */
function fgSync(b){if(!S||!S.w||!fgHum(b)||S.phase==='draft')return;S.fgm=S.fgm||{};
 const r=ownList(b);const placed=new Set(S.fgm[b]||[]);const fresh=r.filter(w=>!placed.has(w.id));if(!fresh.length)return;
 const first=!(S.fgm[b]||[]).some(id=>S.w[id]&&S.w[id].own===b);
 if(first){fgPlace(b,fresh,true);return}
 /* newcomers settle in after a few weeks on the roster */
 const wk=AW();S.fgw=S.fgw||{};const due=fresh.filter(w=>{if(S.fgw[w.id]==null)S.fgw[w.id]=wk;return wk-S.fgw[w.id]>=3});
 if(due.length){fgPlace(b,due,false);due.forEach(w=>delete S.fgw[w.id])}}
function fgSyncAll(){try{brands().forEach(fgSync)}catch(e){console.warn('friends',e)}}
/* the heart of it: a big swing for A reaches A's friends */
function fgSpread(A,d,kind){if(!A||!A.own||!fgHum(A.own)||Math.abs(d)<FG_MIN)return;fgSync(A.own);
 const b=A.own;fgFriends(A).forEach(F=>{const s=Math.round(d*FG_SHARE*10)/10;if(!s)return;
  if(typeof mlog==='function')mlog(F,s,s>0?`Happy for ${A.name}`:`Upset about how ${A.name} was treated`);else F.mor=clamp(F.mor+s,0,100);
  if(Math.abs(s)>=1){S.fgk=S.fgk||{};S.fgk[fgPair(A.id,F.id)]=1}
  if(F.pop>=FG_STAR&&Math.abs(s)>=FG_VIS&&(kind==='promise'||kind==='title'&&s>0)&&!F.inj){S.fgv=S.fgv||{};const v=S.fgv[b];
   if(!v||v.w<AW()-1||Math.abs(s)>Math.abs(v.d)&&v.w===AW())S.fgv[b]={f:F.id,a:A.id,d:s,k:kind,w:AW()}}})}
window.fgSpread=fgSpread;window.fgFriends=fgFriends;window.fgKnown=fgKnown;window.fgSyncAll=fgSyncAll;
/* catch every big swing a function makes: snapshot morale, run it, spread whatever moved FG_MIN or more */
let FG_IN=0;
function fgSnap(){const s=new Map();brands().forEach(b=>{if(fgHum(b))ownList(b).forEach(w=>s.set(w.id,w.mor))});return s}
function fgWrap(name,kind,when){const f0=window[name];if(typeof f0!=='function')return;window[name]=function(){if(FG_IN)return f0.apply(this,arguments);
 let snap=null;try{if(!when||when.apply(this,arguments))snap=fgSnap()}catch(e){}if(!snap)return f0.apply(this,arguments);FG_IN=1;let out;try{out=f0.apply(this,arguments)}finally{FG_IN=0}
 if(snap)try{const k=typeof kind==='function'?kind.apply(this,arguments):kind;snap.forEach((m0,id)=>{const w=S.w[id];if(w&&w.mor!=null)fgSpread(w,w.mor-m0,k)})}catch(e){console.warn('friends',e)}
 return out}}
fgWrap('settlePromises',s=>'promise');
fgWrap('breach','promise');
fgWrap('kept','promise');
fgWrap('pitchTick','promise');
/* matches: only the big ones (a title match, the main event, a PPV) — a Tuesday win is theirs alone */
fgWrap('applyMatch',(m,res,ctx)=>m&&m.title&&!m.nc?'title':'match',(m,res,ctx)=>!!(m&&ctx&&!ctx.preview&&(m.title||ctx.ppv||ctx.pos==='me')));
if(typeof finishDraft==='function'){const d0=finishDraft;finishDraft=function(){const out=d0.apply(this,arguments);if(S&&S.phase==='season')fgSyncAll();return out}}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(){fgSyncAll();if(S.fgv)Object.keys(S.fgv).forEach(b=>{const v=S.fgv[b];if(v&&v.w<AW()-1)delete S.fgv[b]});return e0.apply(this,arguments)}}
/* the office visit (inbox.js shows it): a top star, about a friend */
function fgVisit(){const v=S.fgv&&S.fgv.p;if(!v)return null;const F=S.w[v.f],A=S.w[v.a];if(!F||!A||F.own!=='p'||F.inj)return null;return {v,F,A}}
function fgCost(F,A){return Math.max(15,Math.round((sal(F)+sal(A))*1.5))}
function fgAnswer(i){const x=fgVisit();if(!x)return '';const {v,F,A}=x;delete S.fgv.p;S.fgk=S.fgk||{};S.fgk[fgPair(F.id,A.id)]=1;let t;
 if(v.d<0){if(i===0){const c=fgCost(F,A);S.money.p-=c;mlog(F,Math.round(-v.d*.6*10)/10,`You made it right with ${A.name}`);mlog(A,3,'A bonus to smooth things over');t=`${F.name} nods. "Alright. That's how you fix it." ${A.name} gets ${money(c)} and a handshake.`}
  else{mlog(F,-1,'Brushed off about a friend');t=`${F.name} stares at you for a second too long, then leaves. That one's going to linger.`}}
 else{if(i===0){S.money.p-=15;mlog(F,2,'Dinner with the boss');mlog(A,2,'Dinner with the boss');t=`A long dinner, a few stories you can't repeat. ${F.name} and ${A.name} are buzzing.`}
  else t=`"Just wanted you to know." ${F.name} heads back to the locker room in a good mood.`}
 news(`🤝 ${F.name} came to the office about ${A.name}.`);save();return t}
window.fgVisit=fgVisit;window.fgCost=fgCost;window.fgAnswer=fgAnswer;
/* Backstage friends on the profile, under Mood */
if(typeof showW==='function'){const s0=showW;showW=function(id){const out=s0.apply(this,arguments);try{const w=S.w[id];if(w&&w.own==='p'&&(S.phase==='season'||S.phase==='over')){const k=fgKnown(w);if(k.length){
 const t=document.querySelector('#modal .wstats')||document.querySelector('#modal .wd-top');const mood=t&&t.nextElementSibling;
 const h=`<div class="tiny" style="margin-top:8px"><span class="muted">🤝 Backstage friends:</span> ${k.map(o=>esc(o.name)).join(', ')}</div>`;if(mood&&mood.classList.contains('card'))mood.insertAdjacentHTML('beforeend',h);else if(t)t.insertAdjacentHTML('afterend',h)}}}catch(e){console.warn(e)}return out}}
