/* Tony Khan Simulator — ROH development league + prospect tapes (v155).
   ROH ON HONORCLUB: every week ROH books itself. Everyone on any GM's ROH roster works a match against ROH's house
   regulars or each other; results build an ROH record and "call-up buzz". ROH has four titles (World, TV, Pure,
   Women's) defended every other week by the top contender in the standings. A hot ROH run — wins, good matches,
   a title — means a bigger debut pop when you call someone up. Results show in the weekly briefing and on the ROH screen.
   TAPES: prospects send you an email or their tape most weeks. Pass, keep following them (they send updates as they
   improve, get a little pricier, and may sign elsewhere), or sign them to ROH from the briefing.
   Tapes and the watchlist are private to each GM in a league; the ROH league itself is shared.
   Loaded after farm.js; hooks in by wrapping globals. */
'use strict';
(function(){
const FM=window.FARM;if(!FM)return;
const {F,farmL,toFarm,taken,rohGen,intlGen,known,signCostF,INTL,FARM_MAX,ROH_POP_CAP}=FM;
const TT={rw:{n:'ROH World',g:'M',i:'🏆'},rwom:{n:"ROH Women's World",g:'F',i:'👑'},rtv:{n:'ROH TV',g:'M',i:'📺'},rpure:{n:'ROH Pure',g:'M',i:'🥋'}};
const HOUSE_N={M:8,F:5};
const buzzWord=b=>b>=9?['🔥','Hot']:b>=5?['🌡️','Warm']:b>=2?['🙂','Building']:['🧊','Cold'];
window.buzzWord=buzzWord;

/* ---------------- league state ---------------- */
function L(){if(!S.rohL)S.rohL={house:{},t:{},res:[],n:0};const R=S.rohL;
 ['M','F'].forEach(g=>{let have=Object.values(R.house).filter(w=>w.g===g).length;while(have<HOUSE_N[g]){const w=rohGen();if(w.g!==g)continue;w.id='rh'+(++R.n)+'-'+Math.random().toString(36).slice(2,6);w.house=1;w.ring=Math.max(w.ring,RI(56,70));w.pop=RI(18,34);R.house[w.id]=w;have++}});
 for(const k in TT)if(!R.t[k])R.t[k]={h:null,since:AW(),def:0};
 return R}
function owner(id){for(const b in (S.farm||{})){const f=S.farm[b];if(f&&f.r&&f.r[id])return b}return null}
function get(id){const R=S.rohL;if(R&&R.house[id])return R.house[id];const b=owner(id);return b?S.farm[b].r[id]:null}
function pool(){const R=L();const out=Object.values(R.house).slice();for(const b in (S.farm||{})){const f=S.farm[b];if(f&&f.r)Object.values(f.r).forEach(w=>{if(!w.exc&&!w.inj)out.push(w)})}return out}
function titleOf(id){const R=S.rohL;if(!R)return null;for(const k in R.t)if(R.t[k].h===id)return k;return null}
window.rohTitleOf=id=>{const k=titleOf(id);return k?TT[k]:null};
function vacate(id,why,notes){const k=titleOf(id);if(!k)return;const t=S.rohL.t[k];t.h=null;t.since=AW();t.def=0;const w=get(id)||S.w[id];const n=`🏟️ The ${TT[k].n} title is vacant — ${w?w.name:'the champion'} ${why}.`;S.rohL.news=(S.rohL.news||[]).concat([{w:AW(),t:n}]).slice(-8);if(notes)notes.push(n)}

/* ---------------- a match ---------------- */
const score=w=>w.ring+w.pop*.25+(w.rs>0?Math.min(4,w.rs):0);
function bout(A,B,title){const fa=f=>{for(const b in (S.farm||{})){const x=S.farm[b];if(x&&x.feat&&(x.feat===A.id||x.feat===B.id))return x.feat}return null};const ft=fa();
 const d=(score(A)+(ft===A.id?4:0))-(score(B)+(ft===B.id?4:0));const pA=1/(1+Math.exp(-d/9));const aw=Math.random()<pA;const W=aw?A:B,Lo=aw?B:A;
 const st=clamp(Math.round((1+((A.ring+B.ring)/2-42)/11+(Math.random()-.4)*1.2+(title?.4:0))*4)/4,1,5);
 [[W,1],[Lo,0]].forEach(([w,won])=>{if(won){w.rw=(w.rw||0)+1;w.rs=Math.max(0,w.rs||0)+1}else{w.rl=(w.rl||0)+1;w.rs=Math.min(0,w.rs||0)-1}
  if(!w.house){/* buzz fades 12% a week (rohWeek), so only a real run keeps it hot */let b=w.buzz||0;b+=won?1.1:-.9;if(st>=4.25)b+=.6;if(won&&w.rs>=3)b+=.5;if(title&&won)b+=2.5;w.buzz=clamp(Math.round(b*10)/10,0,15);
   const gap=w.pot-w.ring;if(gap>0)w.ring=Math.min(w.pot,w.ring+gap*.02*(.5+st/4));if(won&&w.pop<ROH_POP_CAP+5)w.pop=Math.min(ROH_POP_CAP+5,w.pop+.4+(title?2:0))}
  else{const gap=w.pot-w.ring;if(gap>0)w.ring=Math.min(w.pot,w.ring+gap*.01)}});
 return {a:A.id,b:B.id,an:A.name,bn:B.name,win:W.id,wn:W.name,st,title:title||null}}

/* ---------------- the week on HonorClub ---------------- */
function rohWeek(notes){if(S.phase!=='season')return;const R=L();const a=AW();if(R.wk===a)return;R.wk=a;
 for(const b in (S.farm||{})){const f=S.farm[b];if(f&&f.r)Object.values(f.r).forEach(w=>{if(w.buzz)w.buzz=Math.round(w.buzz*.88*10)/10})}
 const P=pool();if(!P.length)return;const used=new Set(),res=[];
 /* titles: defended every other week by the best record in the division (vacant titles are filled right away) */
 for(const k in TT){const T=TT[k],t=R.t[k];let h=t.h&&get(t.h);if(t.h&&!h){t.h=null;h=null}
  if(h&&(h.inj||h.exc)){vacate(h.id,h.inj?'is injured':'is away on excursion',null);h=null}
  if(h&&a-t.since<2&&t.def>0)continue;if(h&&(a%2))continue;
  const rank=w=>((w.rw||0)-(w.rl||0)*.7)+(w.rs||0)*.5+score(w)/20+Math.random();
  const c=P.filter(w=>w.g===T.g&&!used.has(w.id)&&w!==h&&!titleOf(w.id)&&(k!=='rpure'||w.st==='te'||w.st==='br'||Math.random()<.3)).sort((x,y)=>rank(y)-rank(x));
  if(!h){if(c.length<2)continue;const [x,y]=c;used.add(x.id);used.add(y.id);const r=bout(x,y,k);res.push(r);t.h=r.win;t.since=a;t.def=0;r.crown=1}
  else{const ch=c[0];if(!ch)continue;used.add(h.id);used.add(ch.id);const r=bout(h,ch,k);res.push(r);if(r.win===h.id){t.def++;r.keep=1}else{t.h=r.win;t.since=a;t.def=0;r.newc=1}}}
 /* everyone on a GM's ROH roster works once; house regulars fill in */
 const mine=P.filter(w=>!w.house&&!used.has(w.id));shuffle(mine);
 mine.forEach(A=>{if(used.has(A.id))return;const o=P.filter(w=>w.g===A.g&&w!==A&&!used.has(w.id)).sort((x,y)=>Math.abs(x.ring-A.ring)-Math.abs(y.ring-A.ring)+(Math.random()-.5)*12);const B=o[0];if(!B)return;used.add(A.id);used.add(B.id);res.push(bout(A,B,null))});
 R.res=[{w:a,l:res}].concat((R.res||[]).filter(x=>a-x.w<3)).slice(0,3);
 res.forEach(r=>{if(!r.title||!(r.crown||r.newc))return;const n=`🏟️ NEW ${TT[r.title].n.toUpperCase()} CHAMPION: ${r.wn}${r.crown?' is crowned':''} on ROH TV.`;R.news=(R.news||[]).concat([{w:a,t:n}]).slice(-8);
  const b=owner(r.win);if(b&&(b==='p'||ON())){news(n);notes.push(n)}})}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){const out=e0.apply(this,arguments);try{rohWeek(notes||[])}catch(e){console.warn('roh league',e)}try{bothSides(()=>tapeTick(notes||[]))}catch(e){console.warn('tapes',e)}return out}}

/* ---------------- call-ups cash in the buzz; leaving ROH vacates titles ---------------- */
if(typeof callUp==='function'){const c0=callUp;window.callUp=callUp=function(id){const w=F('p').r[id];const buzz=w?w.buzz||0:0;const tk=titleOf(id);const out=c0.apply(this,arguments);
 const W=S.w[id];if(W&&W.own==='p'){const bonus=Math.round(Math.min(9,buzz*.8))+(tk?3:0);if(bonus>0){W.pop=clamp(W.pop+bonus,1,100);W.mor=clamp(W.mor+Math.min(8,bonus),0,100);news(`📣 ${W.name} arrives with ${buzzWord(buzz)[1].toLowerCase()} buzz from ROH${tk?` as the ${TT[tk].n} Champion`:''} (+${bonus} popularity).`)}if(tk)vacate(id,'was called up to AEW',null);delete W.buzz;save();render()}
 return out}}
['farmRelease','farmExc'].forEach(fn=>{const f0=window[fn];if(typeof f0!=='function')return;window[fn]=function(id){const before=!!F('p').r[id];const out=f0.apply(this,arguments);const w=F('p').r[id];if(before&&(!w||w.exc))vacate(id,!w?'was released':'left on excursion',null);return out}});

/* ---------------- tapes & the watchlist ---------------- */
const MAX_TAPES=3,MAX_FOLLOW=6;
const ORGS=['the Northeast indies','a Texas promotion','the Midwest scene','a Florida promotion','the West Coast indies','a Southern territory','the Pacific Northwest scene'];
function tapeGen(){const r=Math.random();let w=null,from='';
 const onB=new Set([].concat((S.scout||{}).l||[],(S.scout||{}).roh||[],(S.scout||{}).intl||[],(S.tapes||[]).map(t=>t.w),(S.follow||[]).map(t=>t.w)).map(x=>x.id));
 const okK=x=>x&&!onB.has(x.id)&&!taken(x.id);
 if(r<.2){const k=known(Math.random()<.6?'indie':'intl',1,[...onB])[0];if(okK(k))w=k}
 if(!w&&r<.45){w=genProspect();delete w.bio;delete w.gim;from=pick(ORGS)}
 if(!w&&r<.75){w=rohGen();from='ROH tryouts'}
 if(!w){w=intlGen();if(w)from=INTL[w.from].n}
 if(!w)return null;if(!w.real)w.id='tp'+partyNid();w.from0=from;return w}
function tapeTick(notes){if(S.phase!=='season'||S.week<2)return;const a=AW();S.tapes=(S.tapes||[]).filter(t=>{if(a-t.at>=2){return false}return true});S.follow=S.follow||[];
 /* the watchlist: updates every 3 weeks, and after a while someone else may sign them */
 S.follow=S.follow.filter(f=>{const w=f.w;if(w.real&&taken(w.id))return false;
  if(a-f.since>=4&&Math.random()<.07){const n=`📼 ${w.name}, who you were following, signed somewhere else.`;notes.push(n);news(n);return false}
  if(a-f.last>=3){f.last=a;const g=RI(1,3);w.ring=Math.min(w.pot,w.ring+g);w.mic=Math.min(w.potM||w.pot,w.mic+RI(0,2));w.pop=Math.min(45,w.pop+1);w.fee=Math.round(w.fee*1.08);f.up=(f.up||0)+1;f.n=`New tape: in-ring up ${g} to ${Math.round(w.ring)}.`}return true});
 if(S.tapes.length>=MAX_TAPES||Math.random()>.55)return;const w=tapeGen();if(!w)return;
 S.tapes.push({w,at:a,kind:w.real||Math.random()<.5?'email':'tape'})}
function tapeLine(t){const w=t.w;const T=TIERS[w.tier]||TIERS.prospect;const org=w.org?esc(w.org):esc(w.from0||'the indies');
 const v=w.real?(t.kind==='email'?`"Huge fan of what you're building. I'm wrapping up with ${org} — I'd love to talk ROH."`:`${org} highlights, cut together by ${esc(w.name)}'s agent.`)
  :t.kind==='email'?pick([`"Been grinding in ${org} for a few years. Tape's attached — I just need a shot."`,`"Coach says I'm ready. ${org} has nothing left to teach me. Watch the tape?"`,`"I'll drive anywhere. I'll wrestle anyone. Here's my match from last weekend."`]):`A 6-minute tape from ${org}. ${w.ring>=60?'Crisp and ready.':'Raw, but you can see it.'}`;
 return v}
function tapeRow(t,i){const w=t.w;const T=TIERS[w.tier]||TIERS.prospect;const c=signCostF(w);const full=farmL('p').length>=FARM_MAX;
 return `<div class="brow"><b>${t.kind==='email'?'✉️':'📼'} ${esc(w.name)}</b>${w.pwi?` <span class="tg">PWI 500 #${w.pwi}</span>`:''}<br><span class="muted tiny">${w.g==='M'?"Men's":"Women's"} · ${STYLE_N[w.st]} · ${w.al==='f'?'Face':'Heel'} · RNG ${Math.round(w.ring)} · MIC ${Math.round(w.mic)} · ${w.real?Math.round(w.pot):T.pot[0]+'–'+T.pot[1]} potential</span><br><span class="tiny">${tapeLine(t)}</span>
  <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><button class="mini" onclick="tapeAct(${i},'no')">Pass</button><button class="mini" onclick="tapeAct(${i},'follow')">👀 Keep following</button><button class="mini" ${S.money.p<c||full?'disabled':''} onclick="tapeAct(${i},'roh')">🏟️ Sign to ROH · ${money(c)}${full?' (full)':''}</button></div></div>`}
window.tapeAct=function(i,k){if(typeof mpLocked==='function'&&mpLocked())return;const t=(S.tapes||[])[i];if(!t)return;const w=t.w;
 if(k==='roh'){const c=signCostF(w);if(S.money.p<c)return toast('Not enough money.');if(farmL('p').length>=FARM_MAX)return toast(`Your ROH roster is full (${FARM_MAX}).`);if(w.real&&taken(w.id))return toast(`${w.name} already signed elsewhere.`);
  S.money.p-=c;if(!w.real)w.id='rk'+partyNid();w.fee=0;w.con=w.real?40:52;w.mor=85;toFarm(w,'p');news(`📼 ${S.gm} signed ${w.name} off their ${t.kind==='email'?'email':'tape'} to an ROH deal.`);toast(`${w.name} joins your ROH roster.`)}
 else if(k==='follow'){S.follow=S.follow||[];if(S.follow.length>=MAX_FOLLOW)return toast(`You're following ${MAX_FOLLOW} already — drop someone from the watchlist on the ROH screen.`);S.follow.push({w,since:AW(),last:AW()});toast(`Following ${w.name}. They'll send updates.`)}
 S.tapes.splice(i,1);save();if(document.querySelector('#modal .brief'))openBrief();else render()};
window.followAct=function(i,k){if(typeof mpLocked==='function'&&mpLocked())return;const f=(S.follow||[])[i];if(!f)return;const w=f.w;
 if(k==='roh'){const c=signCostF(w);if(S.money.p<c)return toast('Not enough money.');if(farmL('p').length>=FARM_MAX)return toast(`Your ROH roster is full (${FARM_MAX}).`);
  S.money.p-=c;if(!w.real)w.id='rk'+partyNid();w.fee=0;w.con=w.real?40:52;w.mor=85;toFarm(w,'p');news(`👀 ${S.gm} signed ${w.name} to an ROH deal after following them for ${AW()-f.since} weeks.`);toast(`${w.name} joins your ROH roster.`)}
 S.follow.splice(i,1);save();if(document.querySelector('#modal .brief'))openBrief();else render()};
function followRow(f,i){const w=f.w;const c=signCostF(w);const full=farmL('p').length>=FARM_MAX;
 return `<div class="brow"><b>👀 ${esc(w.name)}</b> <span class="muted tiny">· following ${AW()-f.since} wk</span><br><span class="muted tiny">RNG ${Math.round(w.ring)} · MIC ${Math.round(w.mic)} · ${STYLE_N[w.st]}${f.n?' · '+esc(f.n):''}</span>
  <div class="row" style="gap:6px;margin-top:6px"><button class="mini" ${S.money.p<c||full?'disabled':''} onclick="followAct(${i},'roh')">🏟️ Sign to ROH · ${money(c)}</button><button class="mini" onclick="followAct(${i},'drop')">Stop following</button></div></div>`}

/* ---------------- briefing ---------------- */
function resRow(r,meIds){const tl=r.title?`${TT[r.title].i} ${TT[r.title].n}${r.newc?' — NEW CHAMPION':r.crown?' — crowned':r.keep?' — retained':''} · `:'';const mine=meIds.has(r.win);
 return `<div class="brow">${tl}<b class="${mine?'good':meIds.has(r.a)||meIds.has(r.b)?'bad':''}">${esc(r.wn)}</b> def. ${esc(r.win===r.a?r.bn:r.an)} <span class="stars">${stars(r.st)}</span></div>`}
function rohBrief(){const out=[];const me=farmL('p');const ids=new Set(me.map(w=>w.id));const R=S.rohL;
 if(S.tapes&&S.tapes.length)out.push({i:'📼',t:`Tapes & emails · ${S.tapes.length}`,tag:'New',rows:S.tapes.map(tapeRow)});
 const upd=(S.follow||[]).filter(f=>f.last===AW()-1||f.last===AW());if(upd.length)out.push({i:'👀',t:'Watchlist updates',rows:(S.follow||[]).map((f,i)=>upd.includes(f)?followRow(f,i):'').filter(Boolean)});
 if(R&&R.res&&R.res[0]&&me.length){const l=R.res[0].l.filter(r=>ids.has(r.a)||ids.has(r.b)||(r.title&&(r.newc||r.crown)));
  const hot=me.filter(w=>(w.buzz||0)>=9);
  if(l.length)out.push({i:'🏟️',t:'ROH on HonorClub',rows:l.map(r=>resRow(r,ids)).concat(hot.map(w=>`<div class="brow">🔥 <b>${esc(w.name)}</b> has <b>hot</b> buzz (${w.rw||0}–${w.rl||0} on ROH) — it may be time to bring them up to AEW.<div style="margin-top:6px"><button class="mini" onclick="callUp('${w.id}');if(document.querySelector('#modal .brief'))openBrief()">📣 Call up now</button></div></div>`))})}
 return out}
if(typeof briefItems==='function'){const b0=briefItems;window.briefItems=briefItems=function(){const sec=b0.apply(this,arguments);try{const x=rohBrief();if(x.length){const at=sec.findIndex(s=>s.i==='🗓️');if(at<0)sec.push(...x);else sec.splice(at,0,...x)}}catch(e){console.warn('roh brief',e)}return sec}}

/* ---------------- the ROH screen ---------------- */
function champsCard(){const R=L();return `<div class="card"><div class="h small">🏟️ ROH champions</div>${Object.entries(TT).map(([k,T])=>{const t=R.t[k];const w=t.h&&get(t.h);const mine=w&&F('p').r[w.id];return `<div class="row sb" style="margin:4px 0"><span>${T.i} ${T.n}</span><b class="${mine?'good':''}">${w?esc(w.name):'<span class="muted">Vacant</span>'}${w&&t.def?` <span class="muted tiny">· ${t.def} def.</span>`:''}</b></div>`}).join('')}</div>`}
function standCard(){const P=pool().concat(farmL('p').filter(w=>w.inj||w.exc));const seen=new Set();const l=P.filter(w=>(w.rw||w.rl)&&!seen.has(w.id)&&seen.add(w.id)).sort((a,b)=>((b.rw||0)-(b.rl||0))-((a.rw||0)-(a.rl||0))||(b.rw||0)-(a.rw||0)).slice(0,10);const mine=new Set(farmL('p').map(w=>w.id));
 if(!l.length)return '';return `<div class="card"><div class="h small">📊 ROH standings</div>${l.map((w,i)=>`<div class="row sb tiny" style="margin:3px 0"><span>${i+1}. <b class="${mine.has(w.id)?'gold':''}">${esc(w.name)}</b>${titleOf(w.id)?' '+TT[titleOf(w.id)].i:''}</span><span>${w.rw||0}–${w.rl||0}${w.rs>=3?' 🔥'+w.rs:''}</span></div>`).join('')}<div class="muted tiny" style="margin-top:4px">Gold = yours. Title shots go to the best records.</div></div>`}
function resCard(){const R=S.rohL;if(!R||!R.res||!R.res[0])return '';const ids=new Set(farmL('p').map(w=>w.id));return `<div class="card"><div class="h small">📺 Last week on HonorClub</div>${R.res[0].l.slice(0,10).map(r=>resRow(r,ids)).join('')}</div>`}
function watchCard(){const l=S.follow||[];if(!l.length)return '';return `<div class="card"><div class="h small">👀 Watchlist · ${l.length}/${MAX_FOLLOW}</div>${l.map(followRow).join('')}</div>`}
if(typeof window.farmView==='function'){const v0=window.farmView;window.farmView=function(){let h=v0.apply(this,arguments);try{L();
 h=h.replace(/Everyone here works ROH TV each week and grows toward their potential[^<]*/,'ROH books itself every week: everyone here works a match, builds an ROH record and grows toward their potential. Wins, good matches and ROH titles build <b>call-up buzz</b> — the hotter it is, the bigger their AEW debut. ')
 const ins=champsCard()+resCard()+standCard()+watchCard();const sd=h.indexOf('<div class="card"><div class="h small">Send down');
 if(sd>0)h=h.slice(0,sd)+ins+h.slice(sd);else h+=ins}catch(e){console.warn(e)}return h}}
/* buzz + record on each ROH card */
if(typeof window.farmCard==='function'){const c0=window.farmCard;window.farmCard=function(w){let h=c0.apply(this,arguments);try{const [ic,wd]=buzzWord(w.buzz||0);const tk=titleOf(w.id);
 const line=`<div class="tiny" style="margin-top:6px">${tk?`<b class="gold">${TT[tk].i} ${TT[tk].n} Champion</b> · `:''}ROH record <b>${w.rw||0}–${w.rl||0}</b> · Call-up buzz ${ic} <b>${wd}</b></div>`;
 const i=h.indexOf('<div class="row" style="gap:6px;margin-top:10px');if(i>0)h=h.slice(0,i)+line+h.slice(i)}catch(e){}return h}}
})();
