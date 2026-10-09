/* Tony Khan Simulator — challenge scenarios (v149).
   Solo games with a preset twist and one clear goal. Each scenario:
     id, i (emoji), t (title), d (pitch), goal (one line), diff (difficulty it plays on), by (deadline week),
     setup()      after newGame — before the draft
     afterDraft() once the draft is done (week 1)
     prog()       → {txt, pct} for the Home card
     won()        true once the goal is met (checked after every week)
     lost()       optional — a fail condition checked after every week
   The deadline is a week of the first season: if the goal isn't met by the end of that week, the challenge is lost.
   Once it's decided the game carries on as a normal save. Best results are kept on this device.
   Loaded after the main script; hooks in by wrapping newGame-adjacent globals the same way tutorial.js does. */
'use strict';
(function(){
const CS_KEY='tksim_chal';
const store=()=>{try{return JSON.parse(localStorage.getItem(CS_KEY)||'{}')||{}}catch(e){return {}}};
const keep=o=>{try{localStorage.setItem(CS_KEY,JSON.stringify(o))}catch(e){}};
const mineL=()=>ownList('p');
const avgMor=()=>{const l=mineL();return l.length?l.reduce((a,w)=>a+w.mor,0)/l.length:100};
const heldN=()=>Object.values(S.titles).filter(t=>t.holders.length&&t.holders.every(h=>S.w[h]&&S.w[h].own==='p')).length;
const C=()=>S&&S.chal;
const W=id=>id&&S.w[id];
const pct=(a,b)=>Math.max(0,Math.min(100,Math.round(a/b*100)));

const CHALS=[
{id:'star',i:'⭐',t:'Make a Star',diff:'normal',by:ALLIN_WEEK,
 d:'Every great promoter has one project they believed in before anyone else did.',
 goal:`Pick a wrestler at 50 popularity or lower after the draft and get them to 75 by All In.`,
 afterDraft(){C().need='pick'},
 prog(){const w=W(C().a);if(!w)return {txt:'Choose your project to start the clock.',pct:0};const p0=C().p0||40;return {txt:`${esc(w.name)}: popularity ${Math.round(w.pop)} / 75`,pct:pct(w.pop-p0,75-p0)}},
 won(){const w=W(C().a);return !!(w&&w.pop>=75)},
 lost(){const a=C().a;return a&&(!S.w[a]||S.w[a].own!=='p')?`${S.w[a]?S.w[a].name:'Your project'} left the company.`:false}},
{id:'ship',i:'🚢',t:'Sinking Ship',diff:'normal',by:ALLIN_WEEK,
 d:'You inherited a promotion $500K in the red, and the rival already has a 150K-fan head start.',
 goal:'Reach All In with $1.5M in the bank and more total fans than the rival.',
 setup(){S.fans.ai+=150000},
 afterDraft(){S.money.p=-500;news('🚢 The books are a mess: you start $500K in the red. Get back in the black before the locker room walks.')},
 prog(){const m=S.money.p,f=S.fans.p-S.fans.ai;return {txt:`Bank ${money(m)} / $1.5M · fans ${f>=0?'+':''}${Math.round(f/1000)}K vs rival`,pct:Math.round(pct(m+500,2000)/2+(f>=0?50:pct(f+150000,150000)/2))}},
 won(){return S.week>ALLIN_WEEK&&S.money.p>=1500&&S.fans.p>S.fans.ai},
 lost(){return S.money.p<=-1500?'You fell $1.5M into the red and the investors pulled out.':false}},
{id:'streak',i:'📺',t:'Ratings War',diff:'normal',by:ALLIN_WEEK,
 d:'The network wants proof your show is the one to watch.',
 goal:'Beat the rival head to head on 6 straight weeks of TV before All In. PPV weeks don\'t break the streak.',
 prog(){const c=C();return {txt:`Current streak ${c.run||0} · best ${c.best||0} / 6`,pct:pct(c.run||0,6)}},
 won(){return (C().run||0)>=6}},
{id:'gold',i:'🏆',t:'Gold Rush',diff:'normal',by:32,
 d:'Five belts each to start. The rival won\'t give theirs up easily.',
 goal:'Hold 7 of the 10 championships at once by week 32. Take them on PPV with title challenges.',
 prog(){const n=heldN();return {txt:`You hold ${n} of ${Object.keys(S.titles).length} titles`,pct:pct(n,7)}},
 won(){return heldN()>=7}},
{id:'five',i:'✨',t:'Five-Star Factory',diff:'normal',by:ALLIN_WEEK,
 d:'Fans will forgive a lot for a match they\'ll talk about for years.',
 goal:'Put on 12 matches rated 5★ or better (your own wrestlers only) before All In.',
 prog(){const n=C().fives||0;return {txt:`${n} of 12 five-star matches`,pct:pct(n,12)}},
 won(){return (C().fives||0)>=12}},
{id:'goliath',i:'🪨',t:'David vs. Goliath',diff:'hard',by:SEASON,
 d:'The rival books like a pro, starts with 150K more fans and $1.5M more in the bank.',
 goal:'Finish the year with more total fans than the rival.',
 setup(){S.fans.ai+=150000},
 afterDraft(){S.money.ai+=1500},
 prog(){const f=S.fans.p-S.fans.ai;return {txt:`${f>=0?'Ahead':'Behind'} by ${Math.abs(Math.round(f/1000))}K fans`,pct:f>=0?100:pct(f+150000,150000)}},
 won(){return S.week>SEASON&&S.fans.p>S.fans.ai}},
{id:'home',i:'🌱',t:'Homegrown',diff:'normal',by:32,
 d:'Anyone can buy a champion. Build one.',
 goal:'A wrestler you scouted or created holds a singles title by week 32.',
 prog(){const r=mineL().filter(w=>w.id.startsWith('rk')||w.cw);if(!r.length)return {txt:'Sign a prospect from the scouting report (Roster → Free agents).',pct:0};const b=r.slice().sort((a,b)=>b.pop-a.pop)[0];return {txt:`Best prospect: ${esc(b.name)} (popularity ${Math.round(b.pop)})`,pct:pct(b.pop,60)}},
 won(){return Object.values(S.titles).some(t=>t.kind==='singles'&&t.holders.some(h=>{const w=S.w[h];return w&&w.own==='p'&&(w.id.startsWith('rk')||w.cw)}))}},
{id:'happy',i:'🤝',t:'Happy Locker Room',diff:'normal',by:ALLIN_WEEK,
 d:'Keep everyone smiling for a full half-year. It\'s harder than it sounds.',
 goal:'Reach All In winning the fan war, with roster morale averaging 92+ and nobody under 75. Nobody may walk out or demand their release.',
 prog(){const m=avgMor(),lo=Math.min(...mineL().map(w=>w.mor)),f=fanGain('p')-fanGain('ai');return {txt:`Average morale ${Math.round(m)} / 92 · lowest ${Math.round(lo)} / 75 · fan war ${f>=0?'ahead':'behind'}`,pct:Math.round(pct(m-65,27)*.5+pct(lo,75)*.3+(f>=0?20:0))}},
 won(){return S.week>ALLIN_WEEK&&avgMor()>=92&&mineL().every(w=>w.mor>=75)&&fanGain('p')>fanGain('ai')},
 lost(){if(C().walk)return C().walk;return avgMor()<65?'Average morale fell under 65 — the locker room has turned on you.':false}}];
const CH=id=>CHALS.find(c=>c.id===id);
window.CHALS=CHALS;

/* ---------------- starting one ---------------- */
window.openChallenges=function(){const rec=store();
 openModal(`<div class="h mhd">🎯 Challenge scenarios</div><p class="muted" style="margin-top:0">A solo season with one goal and a deadline. Win or lose, the save keeps going as a normal game afterward.</p>
 ${CHALS.map(c=>{const r=rec[c.id];return `<div class="card"><div class="row sb"><b>${c.i} ${esc(c.t)}</b>${r&&r.won?`<span class="tg good">✅ Beaten · wk ${r.wk}</span>`:r?'<span class="tg">Tried</span>':''}</div>
  <p class="muted" style="margin:6px 0">${esc(c.d)}</p><div><b class="gold">Goal:</b> ${c.goal}</div><div class="muted tiny" style="margin-top:4px">${DIFFS[c.diff][0]} · deadline week ${c.by}${c.by===ALLIN_WEEK?' (All In)':c.by===SEASON?' (Worlds End)':''}</div>
  <button class="btn" style="margin-top:10px" onclick="chalStart('${c.id}')">Start</button></div>`}).join('')}
 <button class="btn ghost" onclick="closeModal()">Close</button>`)};
window.chalStart=function(id){const c=CH(id);if(!c)return;
 const g=(($('#gmName')||{}).value||'').trim()||'You',r=(($('#rvName')||{}).value||'').trim()||'The Rival Office';
 newGame(g,r,c.diff);chalApply(id);save();closeModal();tab='home';render();try{loadRepoPhotos()}catch(e){}};
/* also used by the headless checks */
window.chalApply=function(id){const c=CH(id);S.chal={id,st:'on'};if(c.setup)c.setup();news(`🎯 Challenge: ${c.t}. ${c.goal.replace(/<[^>]+>/g,'')}`);const r=store();r[id]=r[id]||{};keep(r)};

/* ---------------- tracking ---------------- */
function decide(st,why,notes){const c=C(),sc=CH(c.id);c.st=st;c.at=S.week-1;c.why=why||'';c.seen=0;
 const n=st==='won'?`🎯 CHALLENGE COMPLETE: ${sc.t} — beaten in week ${c.at}!`:`🎯 Challenge failed: ${sc.t}. ${why||''}`;news(n);if(notes)notes.push(n);
 const r=store();const o=r[c.id]=r[c.id]||{};if(st==='won'&&(!o.won||c.at<o.wk)){o.won=1;o.wk=c.at}keep(r)}
function tick(notes){const c=C();if(!c||c.st!=='on'||ON())return;const sc=CH(c.id);if(!sc)return;
 if(c.need==='pick')return;
 try{if(sc.won()){decide('won','',notes);return}
  const l=sc.lost&&sc.lost();if(l){decide('lost',l,notes);return}
  if(S.week>sc.by)decide('lost',`The deadline (week ${sc.by}) passed.`,notes)}catch(e){console.warn('challenge',e)}}

if(typeof finishDraft==='function'){const f0=finishDraft;finishDraft=function(){const out=f0.apply(this,arguments);const c=C();if(c&&c.st==='on'&&!c.drafted){c.drafted=1;const sc=CH(c.id);if(sc&&sc.afterDraft)sc.afterDraft()}return out}}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){const out=e0.apply(this,arguments);tick(notes||[]);return out}}
if(typeof airPair==='function'){const a0=airPair;airPair=function(){const out=a0.apply(this,arguments);const c=C();
 if(c&&c.st==='on'&&c.id==='streak'&&S.week<=ALLIN_WEEK&&out&&out.hourWin){c.run=out.hourWin==='p'?(c.run||0)+1:0;c.best=Math.max(c.best||0,c.run)}
 return out}}
if(typeof applyMatch==='function'){const m0=applyMatch;applyMatch=function(m,res){const out=m0.apply(this,arguments);const c=C();
 try{if(c&&c.st==='on'&&c.id==='five'&&!ON()&&res&&res.stars>=5&&m.sides.flat().every(id=>S.w[id]&&S.w[id].own==='p'))c.fives=(c.fives||0)+1}catch(e){}
 return out}}
if(typeof leave==='function'){const l0=leave;leave=function(w,msg){const c=C();
 if(c&&c.st==='on'&&c.id==='happy'&&w&&w.own==='p'&&/😠|💸/.test(msg||''))c.walk=`${w.name} walked out on you.`;
 return l0.apply(this,arguments)}}

/* ---------------- Make a Star: choose the project ---------------- */
window.chalPick=function(){const c=C();if(!c)return;let l=mineL().filter(w=>w.pop<=50&&!w.inj);if(!l.length)l=mineL().slice().sort((a,b)=>a.pop-b.pop).slice(0,3);
 l.sort((a,b)=>(b.pot||0)-(a.pot||0));
 openModal(`<div class="h mhd">⭐ Choose your project</div><p class="muted" style="margin-top:0">Get them from where they are now to 75 popularity by All In. Tag them with top stars, give them wins over big names and keep them on TV.</p>
 ${l.map(w=>`<div class="prow">${face(w)}<div class="wl"><div class="wn">${esc(w.name)}</div><div class="muted tiny">Popularity ${Math.round(w.pop)} · Ring ${Math.round(w.ring)} · Mic ${Math.round(w.mic)} · ${STYLE_N[w.st]}</div></div><button class="mini" onclick="chalPicked('${w.id}')">Pick</button></div>`).join('')}
 <button class="btn ghost" onclick="closeModal()">Later</button>`)};
window.chalPicked=function(id){const c=C(),w=S.w[id];if(!c||!w)return;c.a=id;c.p0=Math.round(w.pop);delete c.need;news(`⭐ ${S.gm} has made ${w.name} their personal project. The goal: 75 popularity by All In.`);save();closeModal();render()};

/* ---------------- Home card + result ---------------- */
function card(){const c=C();if(!c||ON())return '';const sc=CH(c.id);if(!sc)return '';
 if(c.st==='won')return `<div class="card good" onclick="chalResult()" style="cursor:pointer"><b>${sc.i} Challenge complete: ${esc(sc.t)}</b><div class="muted">Beaten in week ${c.at}. The season carries on as a normal game.</div></div>`;
 if(c.st==='lost')return `<div class="card warn" onclick="chalResult()" style="cursor:pointer"><b>${sc.i} Challenge failed: ${esc(sc.t)}</b><div class="muted">${esc(c.why||'')} Try again from ⇄ Your games → Solo game → 🎯 Challenge scenarios.</div></div>`;
 if(c.need==='pick')return `<div class="card warn"><b>${sc.i} ${esc(sc.t)}</b><div class="muted">${sc.goal}</div><button class="btn" style="margin-top:8px" onclick="chalPick()">Choose your project</button></div>`;
 const p=sc.prog(),left=sc.by-S.week+1;
 return `<div class="card"><div class="row sb"><b>${sc.i} ${esc(sc.t)}</b><span class="tg ${left<=3?'bad':''}">${left>0?`${left} week${left>1?'s':''} left`:'Final week'}</span></div><div class="muted" style="margin:4px 0 8px">${sc.goal}</div>
  <div style="height:8px;border-radius:4px;background:var(--line,#333);overflow:hidden"><div style="height:100%;width:${p.pct}%;background:var(--gold2,#e8c35a)"></div></div><div class="tiny" style="margin-top:6px">${p.txt}</div></div>`}
window.chalResult=function(){const c=C();if(!c)return;const sc=CH(c.id);c.seen=1;save();
 openModal(`<div class="h mhd">${c.st==='won'?'🎉 Challenge complete':'Challenge over'}</div><p style="font-size:1.1em"><b>${sc.i} ${esc(sc.t)}</b></p>
 <p class="muted">${c.st==='won'?`You did it in week ${c.at}. It's saved to your challenge record on this device.`:esc(c.why||'')}</p>
 <p class="muted tiny">This save keeps going as a normal game. Start another challenge from the setup screen.</p><button class="btn" onclick="closeModal()">Keep playing</button>`)};
if(typeof homeView==='function'){const h0=homeView;homeView=function(){const out=h0.apply(this,arguments);let k='';try{k=card();const c=C();if(c&&c.st!=='on'&&!c.seen)setTimeout(()=>{try{chalResult()}catch(e){}},400)}catch(e){}
 if(!k)return out;const i=out.indexOf('<div class="tiles">');return i<0?k+out:out.slice(0,i)+k+out.slice(i)}}
if(typeof setupView==='function'){const s0=setupView;setupView=function(){const out=s0.apply(this,arguments);
 const btn=`<button class="btn sec" onclick="openChallenges()">🎯 Challenge scenarios</button>`;const i=out.indexOf('<button class="btn sec" onclick="importSave()">');return i<0?out:out.slice(0,i)+btn+out.slice(i)}}
})();
