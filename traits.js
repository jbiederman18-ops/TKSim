/* ===================== TRAITS & FAN-GROUP MATCHUPS (v425)
   Traits replace wrestling styles as the layer that decides who clicks and which stipulations suit whom.
   - Matchups: each wrestler's fan group against the opponent's (GRP_M). Some pairings are made for each other
     (Bloodhounds vs Chaos fiends, Technical vs Flippy); some clash (Casuals vs Bloodhounds, Technical vs Chaos).
   - Every group trait counts as half of its group for matchups: a wrestler gets halfway from the real pairing to the
     pairing that trait's group would have ("bridges"). A Casual Ring General meshes better with a Technical than a plain
     Casual, never as well as a real Technical.
   - Stipulations: the wrestler's group sets the base fit (from the old style table), and traits add their own (TRAITS[t].sb).
   - Slots: a fixed, in-character starting trait; slot 2 opens at TR_TIERS[0] popularity, slot 3 at TR_TIERS[1]. On your
     roster the wrestler comes to the office door with three options (own group / another group / all-rounder), dealt fresh
     each game. The rival and free agents pick for themselves. A coach can open the next slot early.
   w.st stays as hidden build data (durability, portraits, flavor scenes, undiscovered wrestlers' lean); it no longer shows. */
const TR_TIERS=[70,85],TR_SLOTS=3,TR_COACH_GAP=12,TR_SBMAX=8,TR_SBK=.6;
const GRP_M={cas:{cas:3,tech:3,blood:-4,flip:4,chaos:5},tech:{tech:6,blood:4,flip:6,chaos:-4},blood:{blood:6,flip:4,chaos:6},flip:{flip:5,chaos:4},chaos:{chaos:2}};
const GRP_UND=2;
window.TR_TIERS=TR_TIERS;
function grpPair(x,y){if(x==='und'||y==='und'||!x||!y)return GRP_UND;const a=GRP_M[x]&&GRP_M[x][y];return a!=null?a:(GRP_M[y]&&GRP_M[y][x]!=null?GRP_M[y][x]:GRP_UND)}
/* the group a wrestler leans toward when they don't have one yet (undiscovered: their lean so far, else how they work) */
function trLean(w){const g=fgOf(w)[0];if(g&&g!=='und')return g;const l=typeof fgLean==='function'&&fgLean(w.id);return l||FG_STYLE[w.st]||'cas'}
function trGroupOf(t){return TRAITS[t]&&TRAITS[t].g||null}
function trBridges(w){return (w.tr||[]).filter(t=>trGroupOf(t))}
/* matchup value for a pair: {base, v, by} — base is the groups' pairing, v includes the best bridge, by is who bridges */
function grpVal(a,b){const A=fgOf(a),B=fgOf(b);let base=-99;for(const x of A)for(const y of B)base=Math.max(base,grpPair(x,y));
 let v=base,by=null;
 for(const [w,own,opp] of [[a,A,B],[b,B,A]])for(const t of trBridges(w)){const g=trGroupOf(t);if(own.includes(g))continue;
  for(const y of opp){const x=(base+grpPair(g,y))/2;if(x>v+1e-9){v=x;by={w,t}}}}
 return {base,v,by}}
window.grpVal=grpVal;
const GRP_WORD={cas:'Casual',tech:'Technical',blood:'Bloodhound',flip:'Flippy',chaos:'Chaos',und:'Undiscovered'};
function grpName(w){const g=fgOf(w);return g.map(x=>GRP_WORD[x]||x).join('/')}
/* chemistry lines for chemParts: the pairing, then the bridge */
/* a wrestler with a trait from their own crowd is in their element when the pairing already works (TR_ELEM_AT+) */
const TR_ELEM=.5,TR_ELEM_AT=5;
function trElem(w,base){if(base<TR_ELEM_AT)return false;const own=fgOf(w);return (w.tr||[]).some(t=>own.includes(trGroupOf(t)))}
function grpParts(a,b){const g=grpVal(a,b);const p=[{t:`${grpName(a)} vs ${grpName(b)}`,v:g.base}];
 if(g.by)p.push({t:`${g.by.w.name.split(' ')[0]}'s ${TRAITS[g.by.t].n} bridges it`,v:Math.round((g.v-g.base)*10)/10});
 [a,b].forEach(w=>{if(trElem(w,g.base))p.push({t:`${w.name.split(' ')[0]} in their element`,v:TR_ELEM})});return p}
window.grpParts=grpParts;

/* ---- stipulation fit ---- */
const STY_OF_G={tech:'te',flip:'fl',chaos:'sh',blood:'br'};
function grpStipB(g,k){const st=STIPS[k];if(!st||!st.b)return 0;if(g==='cas')return Math.round(((st.b.pw||0)+(st.b.sh||0))/2);return st.b[STY_OF_G[g]]||0}
/* base fit from the wrestler's group (best of their groups), before traits and specialties */
function trStipBase(w,k){const gs=fgOf(w).map(g=>g==='und'?trLean(w):g);let b=-99;gs.forEach(g=>b=Math.max(b,grpStipB(g,k)));return b===-99?0:b}
function trStipTr(w,k){let b=0;(w.tr||[]).forEach(t=>{const s=TRAITS[t]&&TRAITS[t].sb;if(s&&s[k])b+=s[k]});return Math.round(b*TR_SBK)}
window.trStipBase=trStipBase;window.trStipTr=trStipTr;

/* ---- the starting trait: fixed and in character ---- */
const TR_START_FIX=(()=>{const o={};`Marina Shafir|subs
Kyle O'Reilly|subs
Josh Alexander|subs
Hechicero|subs
Serena Deeb|subs
Deonna Purrazzo|subs
Wheeler Yuta|subs
Samoa Joe|subs
Daniel Garcia|subs
Claudio Castagnoli|suplex
Shelton Benjamin|suplex
Roderick Strong|suplex
Katsuyori Shibata|hard
Jon Moxley|bleed
Hangman Adam Page|bleed
Gabe Kidd|hard
Ilja Dragunov|hard
Tomohiro Ishii|hard
Eddie Kingston|hard
Brody King|hard
Mark Briscoe|hard
Thunder Rosa|hard
Bishop Kaun|monster
Toa Liona|monster
Lance Archer|monster
Wardlow|monster
Bobby Lashley|monster
Brian Cage|monster
MJF|mouth
Chris Jericho|mouth
MVP|mouth
Christian Cage|heatm
Jay White|heatm
Billy Gunn|dirty
Austin Gunn|dirty
Colten Gunn|dirty
Will Ospreay|dare
Kevin Knight|hilite
Ricochet|hilite
Swerve Strickland|hilite
Bandido|hilite
Mike Bailey|hilite
Orange Cassidy|crowd
Mercedes Moné|bigm
Britt Baker|mouth`.split('\n').forEach(l=>{const [n,t]=l.split('|');o[slug(n)]=t});return o})();
const TR_POOL={tech:['ringg','subs','suplex'],blood:['monster','hard','bleed'],chaos:['heatm','mouth','dirty'],flip:['dare','hilite'],cas:['crowd','bigm','show']};
const TR_UTIL=['story','work','iron','tag','under'];
/* how in-character a trait is for a wrestler (stats and how they work) */
function trFit(w,t){const s=w.st,r=w.ring,m=w.mic,p=w.pop,h=w.al==='h',f=w.al==='f';
 return ({ringg:r>=86?4:r>=78?1.5:.6,subs:(s==='te'?2:1)+(r>=80?.5:0),suplex:s==='br'||s==='pw'?2.5:1.2,
  monster:s==='pw'?6:s==='br'&&r>=80?1.5:.4,hard:s==='br'?3:1.5,bleed:s==='br'?2.2:1.2,
  heatm:h?(m>=70?4:2):.5,mouth:m>=85?5:m>=78?2.5:.4,dirty:s==='br'?3:h?2:1.2,
  dare:s==='fl'?4:2,hilite:p>=75?3.5:2,crowd:f?(p>=78?4:2):.3,bigm:p>=85?4:1,show:(s==='sh'?3:1.5)+(m>=80?1:0),
  story:r>=84&&m>=72?4:r>=80?1:.3,work:s==='te'||s==='br'?2:1,iron:w.dur!=null?(w.dur>=80?2.5:w.dur>=60?.8:.3):1,
  tag:typeof S!=='undefined'&&S&&S.teams&&S.teams.some(t=>t.type==='team'&&t.m.includes(w.id))?5:.4,under:s==='fl'?2:f&&p<70?1.5:.3})[t]||.5}
function trStart(w){if(w.trS&&TRAITS[w.trS])return w.trS;const fx=TR_START_FIX[w.id]||TR_START_FIX[slug(w.name||'')];if(fx&&TRAITS[fx])return fx;
 const pool=TR_POOL[trLean(w)]||TR_POOL.cas;const r=seeded('trs|'+w.id+'|'+w.name);
 return pool.map(t=>[t,trFit(w,t)+r()*.3]).sort((a,b)=>b[1]-a[1])[0][0]}
window.trStart=trStart;
const trClash=(t,have)=>(t==='monster'&&have.includes('under'))||(t==='under'&&have.includes('monster'));
/* the three options when a slot opens: one from their own group, one that reaches another group, one all-rounder */
function trOptions(w,slot){const have=w.tr||[];const g=trLean(w);const r=seeded((S&&S.seed||'')+'|tro|'+w.id+'|'+slot);
 const ok=t=>TRAITS[t]&&!have.includes(t)&&!trClash(t,have);
 const pickW=l=>{l=l.filter(ok);if(!l.length)return null;const ws=l.map(t=>trFit(w,t)+.4);let x=r()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<l.length;i++){x-=ws[i];if(x<=0)return l[i]}return l[l.length-1]};
 const out=[];const own=pickW(TR_POOL[g]||[]);if(own)out.push(own);
 const others=Object.keys(TR_POOL).filter(k=>k!==g&&!fgOf(w).includes(k));
 for(let i=0;i<others.length&&out.length<2;i++){const k=others[Math.floor(r()*others.length)];const t=pickW(TR_POOL[k].filter(x=>!out.includes(x)));if(t)out.push(t)}
 const u=pickW(TR_UTIL.filter(x=>!out.includes(x)));if(u)out.push(u);
 while(out.length<3){const t=pickW(Object.keys(TRAITS).filter(x=>!out.includes(x)));if(!t)break;out.push(t)}
 return out}
window.trOptions=trOptions;
const trSlotsFor=w=>1+TR_TIERS.filter(x=>(w.pop||0)>=x).length;
const trOpen=w=>w&&Array.isArray(w.tr)&&w.tr.length<Math.min(TR_SLOTS,trSlotsFor(w));
window.trSlotsFor=trSlotsFor;
/* everyone off your roster (and new-game rosters) picks for themselves: usually their own group, sometimes another
   group or an all-rounder — dealt fresh each game */
const TR_AI_W=[.55,.25,.2];
function trAiPick(w,slot){slot=slot||(w.tr||[]).length+1;const o=trOptions(w,slot);if(!o.length)return null;const r=seeded((S&&S.seed||'')+'|trai|'+w.id+'|'+slot)();
 let x=r*TR_AI_W.slice(0,o.length).reduce((a,b)=>a+b,0);for(let i=0;i<o.length;i++){x-=TR_AI_W[i]||0;if(x<=0)return o[i]}return o[0]}
function trAdd(w,t){if(!w||!TRAITS[t])return;w.tr=(w.tr||[]).concat([t]).slice(0,Math.max(TR_SLOTS,(w.tr||[]).length+1))}
/* new games, rookies, prospects: the starting trait, plus whatever their popularity has already opened */
function trDeal(w){const out=[trStart(w)];const n=Math.min(TR_SLOTS,trSlotsFor(w));const tmp={...w,tr:out};
 for(let s=2;s<=n;s++){const t=trAiPick(tmp,s);if(t)out.push(t);tmp.tr=out}return out}
window.trDeal=trDeal;
/* old saves: everyone keeps the traits they have, and gains their starting trait in front */
function trMigrate(st){if(!st||!st.w||st.trv)return;Object.values(st.w).forEach(w=>{if(!Array.isArray(w.tr))return;const s=trStart(w);if(!w.tr.includes(s))w.tr=[s].concat(w.tr.filter(x=>!trClash(x,[s])))});st.trv=1}
window.trMigrate=trMigrate;
/* after every show: anyone not on your roster who has an open slot picks one (offline only; in a league each GM picks for their own) */
function trAuto(){if(!S||!S.w)return;Object.values(S.w).forEach(w=>{if(w.own==='p'||!trOpen(w))return;if(ON()&&w.own)return;const t=trAiPick(w);if(t)trAdd(w,t)})}
window.trAuto=trAuto;
if(typeof airPair==='function'){const _ap=airPair;airPair=function(){const r=_ap.apply(this,arguments);try{trAuto()}catch(e){console.warn('traits',e)}return r}}

/* ---- the office door: a slot opened on your roster ---- */
function trVisit(){if(!S||!S.w)return null;const l=ownList('p').filter(trOpen).sort((a,b)=>b.pop-a.pop);return l[0]||null}
window.trVisit=trVisit;
/* w given: say whether it's their own crowd's trait or one that reaches another group */
function trDesc(t,w){const T=TRAITS[t];if(!T)return '';const g=T.g;if(!g)return T.d;if(w&&fgOf(w).includes(g))return T.d;return T.d+` Reaches ${FG_N[g]} fans.`}
window.trDesc=trDesc;
function trLine(w){const s=w.tr.length+1,seed=w.id+s;const pk=l=>l[Math.abs([...seed].reduce((h,c)=>(h*31+c.charCodeAt(0))|0,0))%l.length];
 return pk([`I've been putting in the work and the crowd's noticed. I'm ready to add something new. Which way do you want me to go?`,
  `Bigger crowds, bigger stage. I've got a few ideas for what I bring next — you're the boss, you pick.`,
  `I'm not the same wrestler I was when I got here. Tell me what you need from me and I'll make it mine.`])}
function trChoiceBtns(w,fn){const o=trOptions(w,w.tr.length+1);const K='ABC';
 return o.map((t,i)=>{const T=TRAITS[t];const g=T.g;const own=g&&fgOf(w).includes(g);
  return `<button class="choice" onclick="${fn}(${i})"><span class="key"><span>${K[i]}</span></span><div>${T.i} <b>${esc(T.n)}</b>${g?` <span class="muted tiny">· ${own?'their own crowd':'reaches '+FG_N[g]}</span>`:''}</div><div class="muted tiny">${esc(T.d)}</div></button>`}).join('')}
function openTr(){const w=trVisit();if(!w)return closeModal();
 openModal(`<div class="h mhd mt">✨ ${esc(w.name)} is looking ambitious</div><div class="scene brief ibx">${typeof voiceH==='function'?voiceH(w.id,trLine(w)):`<p>${esc(trLine(w))}</p>`}<div class="brow"><span class="muted tiny">${esc(w.name)} reached ${TR_TIERS[w.tr.length-1]} popularity and opened trait slot ${w.tr.length+1} of ${TR_SLOTS}.</span></div></div>
 ${trChoiceBtns(w,'trPick')}`)}
window.openTr=openTr;
function trAnswer(i){const w=trVisit();if(!w)return null;const t=trOptions(w,w.tr.length+1)[i];if(!t)return null;trAdd(w,t);mor(w,4);
 news(`✨ ${w.name} adds ${TRAITS[t].i} ${TRAITS[t].n}.`);return `${w.name} comes back with a new edge: ${TRAITS[t].i} ${TRAITS[t].n}.`}
window.trAnswer=trAnswer;
window.trPick=function(i){if(typeof mpLocked==='function'&&mpLocked())return;const t=trAnswer(i);if(!t)return closeModal();try{save()}catch(e){}try{render()}catch(e){}
 const left=typeof inboxList==='function'?inboxList().length:0;const on=typeof inboxCur==='function'&&inboxCur();
 openModal(`<div class="h mhd">✨ New edge</div><div class="outcome ok">${esc(t)}</div>
 <button class="btn" onclick="closeModal()">${on?(left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'):'Back to work'}</button>`)};

/* ---- a coach opens the next slot early ---- */
function trCoachOk(w){if(!w||w.own!=='p'||!Array.isArray(w.tr)||w.tr.length>=TR_SLOTS||trOpen(w))return false;const need=TR_TIERS[w.tr.length-1];return need!=null&&(w.pop||0)>=need-TR_COACH_GAP&&!w.trCo}
const trCoachCost=()=>typeof pCost==='function'?pCost()*2:60;
window.trCoach=function(id){if(typeof mpLocked==='function'&&mpLocked())return;const w=S.w[id];if(!trCoachOk(w))return;const c=trCoachCost();
 if(S.money.p<c)return toast(`A specialist coach costs ${money(c)}.`);
 openModal(`<div class="h mhd mt">🎓 A specialist coach for ${esc(w.name)}</div><p class="muted">${money(c)} for a week with a specialist. Pick what they work on.</p>${trChoiceBtns(w,'trCoachPick')}<button class="btn ghost" onclick="showW('${id}')">Not now</button>`);window.__trCo=id};
window.trCoachPick=function(i){const w=S.w[window.__trCo];if(!trCoachOk(w))return closeModal();const t=trOptions(w,w.tr.length+1)[i];if(!t)return closeModal();
 S.money.p-=trCoachCost();w.trCo=1;trAdd(w,t);mor(w,4);news(`🎓 ${w.name} adds ${TRAITS[t].i} ${TRAITS[t].n} after a week with a specialist.`);save();render();
 openModal(`<div class="h mhd">🎓 New edge</div><div class="outcome ok">${esc(w.name)} comes back with ${TRAITS[t].i} ${TRAITS[t].n}.</div><button class="btn" onclick="closeModal()">Back to work</button>`)};

/* ---- profile: the three slots ---- */
function trSlotsHtml(w){const l=(w.tr||[]).filter(t=>TRAITS[t]);const rows=l.map(t=>`<div class="pf-row pf-tr"><span class="pf-l">${TRAITS[t].i} <b>${TRAITS[t].n}</b></span><div class="pf-s">${esc(trDesc(t,w))}</div></div>`);
 for(let s=l.length+1;s<=TR_SLOTS;s++){const need=TR_TIERS[s-2];const co=s===l.length+1&&trCoachOk(w);
  rows.push(`<div class="pf-row pf-tr pf-lock"><span class="pf-l">🔒 <b>Slot ${s}</b></span><div class="pf-s">Unlocks at ${need} popularity.${co?` <button class="chip" onclick="trCoach('${w.id}')">🎓 Coach it now · ${money(trCoachCost())}</button>`:''}</div></div>`)}
 return rows.join('')}
window.trSlotsHtml=trSlotsHtml;

/* ---- matchup chart (replaces the style chart), opened from a wrestler's page ---- */
window.styChart=function(id,back){const w=id&&S.w[id];const ks=['cas','tech','blood','flip','chaos'];const mine=w?fgOf(w):[];
 const word=v=>v>=6?['Clicks','c6']:v>=4?['Good','c4']:v>=2?['Okay','']:v>=0?['Flat','']:['Clash','c0'];back=back||(w?`showW('${id}')`:'closeModal()');
 openModal(`<div class="row sb"><div class="h mhd" style="margin:0">How chemistry works</div><button class="mini" onclick="${back}">Back</button></div>
 <p class="muted tiny">Each wrestler draws a fan group, and some groups' wrestlers are made for each other while others clash. Face vs heel, past matches and traits add on top. A trait that reaches another group carries a wrestler halfway to that group's pairing. First-time pairs are judged on paper until they share a ring.</p>
 <div style="overflow-x:auto"><table class="stygrid"><tr><th></th>${ks.map(k=>`<th>${GRP_WORD[k]}</th>`).join('')}</tr>${ks.map(x=>`<tr${mine.includes(x)?' class="hr"':''}><th>${GRP_WORD[x]}</th>${ks.map(y=>{const c=word(grpPair(x,y));return `<td class="${c[1]}">${c[0]}</td>`}).join('')}</tr>`).join('')}</table></div>
 ${w?`<p class="tiny muted">Highlighted: ${esc(w.name)} (${esc(fgWord(w))}).</p>`:''}`)};
