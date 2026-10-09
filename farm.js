/* Tony Khan Simulator — ROH & the farm system (v150).
   Each GM gets a Ring of Honor developmental roster (S.farm[brand]) that lives outside the AEW roster: ROH wrestlers
   don't take roster spots, can't be booked on Dynamite/Collision, and are paid half salary. They work ROH TV every week
   and grow toward their potential; one can be featured (faster growth and popularity), and any can be sent on a
   10-week excursion to NJPW, CMLL or RevPro. Call them up whenever they're ready; send rookies or low-card names down.
   Scouting covers three territories: the Indies (the existing prospect board), ROH (real ROH-level names plus polished
   regulars) and Overseas (raw but skilled talent from Japan, Mexico and the UK).
   Farm wrestlers sit in S.farm, not S.w, so nothing else in the game sees them until they're called up.
   Loaded after the main script; hooks in by wrapping globals like tutorial.js does. */
'use strict';
(function(){
const FARM_MAX=8,EXC_WK=10,ROH_POP_CAP=45;
/* real ROH-level talent on today's AEW/ROH roster who aren't in the main game: name|g|style|align|ring|mic|pop|pot */
const ROH_REAL=`Dalton Castle|M|sh|f|72|78|42|74
QT Marshall|M|sh|h|66|76|40|68
Adam Priest|M|br|h|68|58|30|78
Big Boom! A.J.|M|pw|f|52|60|38|60
Jacked Jameson|M|sh|h|62|60|28|72
JD Drake|M|br|h|72|60|32|74
Myles Hawkins|M|fl|f|66|50|26|80
Isiah Kassidy|M|fl|h|72|62|40|78
Marq Quen|M|fl|h|74|50|40|80
Lacey Lane|F|te|f|68|56|34|78
VertVixen|F|br|f|64|55|30|78
Viva Van|F|sh|h|60|62|28|76
Christyan XO|F|br|h|58|55|24|76
Trish Adora|F|br|f|66|60|32|78
Isla Dawn|F|sh|h|70|66|38|80`;
/* fictional international names */
const INTL={
 jp:{n:'Japan',f:'🇯🇵',st:['te','fl','br'],M:['Kaito Morishima','Ren Kanda','Hiroto Ishizaki','Sora Ogawara','Daichi Hayase','Yuto Nakazono','Takumi Arakawa'],F:['Aoi Kitamura','Hina Sakuraba','Mei Tachibana','Yui Hoshino','Rin Asakura','Saki Mizuno']},
 mx:{n:'Mexico',f:'🇲🇽',st:['fl','fl','te'],M:['Rayo Dorado','Tormenta Azul','Cuervo Rojo','Relámpago Jr.','Halcón Plateado','Zafiro Negro','Titán del Norte'],F:['La Gata Plateada','Estrella Fugaz','Reina Solar','Luna Escarlata','Dama de Jade']},
 uk:{n:'UK',f:'🇬🇧',st:['te','br','te'],M:['Finn Ashby','Jack Holloway','Rhys Pemberton','Ollie Marsden','Kit Brennan','Harvey Lockwood'],F:['Poppy Calloway','Imogen Thorne','Freya Lockhart','Evie Ramsay','Nell Garrity']}};
const EXC={jp:{n:'NJPW',f:'🇯🇵',d:'Strong-style dojo: the biggest in-ring jump and a tougher body.',ring:2.2,mic:1,pop:3,dur:4},
 mx:{n:'CMLL',f:'🇲🇽',d:'Arena México crowds: solid in-ring growth and they come back a bigger draw.',ring:1.8,mic:1,pop:7,dur:0},
 uk:{n:'RevPro',f:'🇬🇧',d:'British technical scene: good in-ring growth and real mic reps.',ring:1.6,mic:2.5,pop:4,dur:0}};
const REG={indie:{n:'Indies',i:'🌱',d:'Raw prospects and wild gimmick acts from the US independents. Cheapest, most potential, most risk.'},
 roh:{n:'ROH',i:'🏟️',d:'Ring of Honor regulars and real ROH-level talent. Polished and ready sooner, with less upside.'},
 intl:{n:'Overseas',i:'🌏',d:'Skilled imports from Japan, Mexico and the UK. Great in the ring, still learning English promos.'}};
window.FARM_MAX=FARM_MAX;
let SREG='indie',FSEL=null;

/* ---------------- state ---------------- */
function F(b){S.farm=S.farm||{};return S.farm[b]=S.farm[b]||{r:{},feat:null}}
const farmL=b=>Object.values(F(b).r);
const fsal=w=>Math.max(2,Math.round(mkt(w)*.5));
const taken=id=>!!S.w[id]||Object.values(S.farm||{}).some(f=>f&&f.r&&f.r[id]);
window.farmList=farmL;
function toFarm(w,b){w.own=null;delete w.sal;w.fsal=fsal(w);w.mor=Math.max(w.mor||0,80);w.fat=0;if(!w.con||w.con<20)w.con=40;F(b).r[w.id]=w}

/* ---------------- scouting boards ---------------- */
function polish(w,ring,mic){w.ring=Math.min(w.pot-2,w.ring+ring);w.mic=Math.min(w.potM||w.pot,w.mic+mic);return w}
function rohReal(ex){const used=new Set(ex);const l=(ROH_REAL.trim()+(typeof ROH_RAW==='string'?'\n'+ROH_RAW.trim():'')).split('\n').map(x=>mkW(x.trim())).filter(w=>!taken(w.id)&&!used.has(w.id));
 const w=l.length?pick(l):null;if(!w)return null;w.reg='roh';w.real=1;w.tier=w.pot>=78?'bluechip':'prospect';w.fee=w.pop>=55?120:60;w.con=0;w.mor=80;w.tr=autoTraits(w);return w}
function rohGen(){const g=Math.random()<.5?'M':'F';const tier=Math.random()<.3?'bluechip':'prospect';const nm=()=>pick(g==='M'?FIRST_M:FIRST_F)+' '+pick(LAST);let n=nm();for(let i=0;i<8&&Object.values(S.w).some(w=>w.name===n);i++)n=nm();
 const w=polish(makeRookie(n,g,pick(['te','te','br','fl','pw']),pick(['f','h']),tier),RI(14,22),RI(8,16));w.tier=tier;w.reg='roh';w.fee=Math.round(TIERS[tier].cost*.8);w.pop=RI(14,24);w.pop0=w.pop;w.tr=autoTraits(w);return w}
function intlGen(){const k=pick(['jp','mx','uk']),R=INTL[k];const g=Math.random()<.6?'M':'F';const r=Math.random();const tier=r<.15?'gen':r<.6?'bluechip':'prospect';
 const ex=new Set(Object.values(S.w).map(w=>w.name).concat(...Object.values(S.farm||{}).map(f=>Object.values(f.r||{}).map(w=>w.name))));const opts=R[g].filter(n=>!ex.has(n));if(!opts.length)return null;
 const w=polish(makeRookie(pick(opts),g,pick(R.st),pick(['f','h']),tier),RI(16,26),-RI(4,10));w.mic=Math.max(18,w.mic);w.tier=tier;w.reg='intl';w.from=k;w.fee=Math.round(TIERS[tier].cost*1.3);w.tr=autoTraits(w);return w}
function boards(){const s=S.scout;if(!s)return;
 if(!s.roh){const l=[];for(let i=0;i<3;i++){const w=rohReal(l.map(x=>x.id));if(w)l.push(w)}while(l.length<5)l.push(rohGen());s.roh=shuffle(l)}
 if(!s.intl){const l=[];for(let i=0;i<8&&l.length<4;i++){const w=intlGen();if(w&&!l.some(x=>x.name===w.name))l.push(w)}s.intl=l}}
if(typeof scoutTick==='function'){const s0=scoutTick;scoutTick=function(){const before=S&&S.scout;const out=s0.apply(this,arguments);try{if(S.scout&&S.scout!==before)boards()}catch(e){console.warn('farm boards',e)}return out}}
function board(reg){boards();const s=S.scout;return !s?[]:reg==='indie'?s.l:s[reg]||[]}
const signCostF=w=>w.fee+mkt(w)*4;

window.farmSign=function(reg,i,dest){if(mpLocked())return;const l=board(reg),w=l[i];if(!w)return;
 if(reg==='indie'&&dest==='aew')return signProspect(i);
 const c=signCostF(w);if(S.money.p<c)return toast('Not enough money.');if(S.money.p<0)return toast("You can't sign anyone while you're in the red.");
 if(dest==='aew'&&ownList('p').length>=30)return toast('Your roster is full (30).');
 if(dest==='roh'&&farmL('p').length>=FARM_MAX)return toast(`Your ROH roster is full (${FARM_MAX}).`);
 if(w.real&&taken(w.id))return toast(`${w.name} just signed elsewhere.`);
 S.money.p-=c;l.splice(i,1);if(!w.real)w.id='rk'+partyNid();w.fee=0;w.con=w.real?40:52;w.mor=85;
 const where=REG[reg].i;
 if(dest==='roh'){toFarm(w,'p');news(`${where} ${S.gm} signed ${w.name} to an ROH developmental deal.`);toast(`${w.name} joins your ROH roster.`)}
 else{w.own='p';w.sal=mkt(w);w.deb=AW();S.w[w.id]=w;reunite(w.id);news(`${where} ${S.gm} signed ${w.name} straight to the AEW roster.`);toast(`${w.name} signed! Put them on TV soon for a debut pop.`)}
 save();render()};

/* ---------------- moving between AEW and ROH ---------------- */
window.callUp=function(id){if(mpLocked())return;const f=F('p'),w=f.r[id];if(!w)return;if(S.phase!=='season'&&S.phase!=='over')return toast('Call-ups happen once the season is under way.');
 if(w.exc)return toast(`${w.name} is still on excursion.`);if(ownList('p').length>=30)return toast('Your AEW roster is full (30).');
 delete f.r[id];if(f.feat===id)f.feat=null;const back=w.back;delete w.back;delete w.fsal;
 w.own='p';w.sal=mkt(w);w.deb=AW();w.mor=clamp(w.mor+10,0,100);w.pop=clamp(w.pop+(back?back:3),1,100);S.w[id]=w;
 reunite(id);news(back?`✈️ ${w.name} is back from excursion and called up to AEW — fans can't wait to see what's changed.`:`📣 ${w.name} has been called up from ROH to AEW.`);
 save();render();toast(`${w.name} called up! Book them in the next few weeks for a debut pop.`)};
function reunite(id){try{const me=S.w[id];if(!me||typeof TEAMS==='undefined')return;TEAMS.forEach(([n,type,m])=>{if(!m.includes(id))return;const mates=m.filter(x=>S.w[x]&&S.w[x].own===me.own);if(mates.length<2)return;
  let t=S.teams.find(x=>x.n===n);if(t){if(!t.m.includes(id))t.m.push(id)}else{S.teams.push({id:'t'+(S.nid++),n,type,m:mates});news(`🤝 ${n} are back together on ${nameOf(me.own)}.`)}})}catch(e){console.warn('reunite',e)}}
window.farmReunite=reunite;
const downOk=w=>w&&w.own==='p'&&!isChamp(w.id)&&(w.rookie||w.pop<=45);
window.downOk=downOk;
window.sendDown=function(id){if(mpLocked())return;const w=S.w[id];if(!downOk(w))return toast('Only rookies and wrestlers at 45 popularity or lower can be sent to ROH.');
 if(farmL('p').length>=FARM_MAX)return toast(`Your ROH roster is full (${FARM_MAX}).`);
 if(!confirm(`Send ${w.name} to ROH? They leave the AEW roster (and any team, feud or booked match) to develop on ROH TV at half salary.`))return;
 const keepW=JSON.parse(JSON.stringify(w));
 if(S.card)['p','ai'].forEach(b=>(S.card[b]||[]).forEach(sl=>{const d=sl.d;if(d&&((d.sides&&d.sides.flat().includes(id))||d.a===id||d.b===id||d.c===id))sl.d=null}));
 purgeW(id);toFarm(keepW,'p');news(`🏟️ ${keepW.name} was sent down to ROH to develop.`);save();closeModal();render();toast(`${keepW.name} is on your ROH roster.`)};
window.farmFeature=function(id){const f=F('p');f.feat=f.feat===id?null:id;save();render()};
window.farmRelease=function(id){const f=F('p'),w=f.r[id];if(!w)return;if(!confirm(`Release ${w.name} from ROH?`))return;delete f.r[id];if(f.feat===id)f.feat=null;news(`📝 ${S.gm} released ${w.name} from ROH.`);save();render()};
window.farmExc=function(id,k){const f=F('p'),w=f.r[id];if(!w||!EXC[k])return;if(w.exc)return;if(w.done)return toast(`${w.name} has already been on excursion.`);
 w.exc={k,until:AW()+EXC_WK};if(f.feat===id)f.feat=null;news(`✈️ ${w.name} is off on a ${EXC_WK}-week excursion to ${EXC[k].n}.`);save();closeModal();render()};
window.farmExcPick=function(id){const w=F('p').r[id];if(!w)return;
 openModal(`<div class="h mhd">✈️ Excursion</div><p class="muted" style="margin-top:0">${esc(w.name)} leaves for ${EXC_WK} weeks, develops much faster than on ROH TV, and comes back with a bigger potential and a fresh look. Once per career. They can't be called up while they're away.</p>
 ${Object.entries(EXC).map(([k,x])=>`<div class="card"><b>${x.f} ${x.n}</b><div class="muted" style="margin:4px 0 8px">${x.d}</div><button class="btn" onclick="farmExc('${id}','${k}')">Send to ${x.n}</button></div>`).join('')}
 <button class="btn ghost" onclick="closeModal()">Not yet</button>`)};

/* ---------------- the week on ROH TV ---------------- */
function farmWeek(notes){if(!S.farm)return;const a=AW();
 for(const b in S.farm){const f=S.farm[b];if(!f||!f.r)continue;const mine=b==='p'||ON();const ws=Object.values(f.r);if(!ws.length)continue;
  if(S.money[b]!=null)S.money[b]-=ws.reduce((x,w)=>x+(w.fsal||fsal(w)),0);
  ws.forEach(w=>{w.con=(w.con||0)-1;
   if(w.exc){const X=EXC[w.exc.k]||EXC.jp;w.ring=Math.min(w.pot,w.ring+Math.max(.4,(w.pot-w.ring)*.04*X.ring));w.mic=Math.min(w.potM||w.pot,w.mic+Math.max(.2,((w.potM||w.pot)-w.mic)*.03*X.mic));
    if(a>=w.exc.until){w.pot=Math.min(99,w.pot+2);w.potM=Math.min(99,(w.potM||w.pot)+1);if(X.dur)w.dur=Math.min(95,(w.dur||60)+X.dur);w.back=X.pop;w.done=1;delete w.exc;w.mor=clamp(w.mor+10,0,100);
     if(mine){const n=`✈️ ${w.name} is back from ${X.n} — and looks like a different wrestler. Call them up while the buzz is fresh.`;news(n);notes.push(n)}}}
   else if(w.inj>0){w.inj--}
   else{const ft=f.feat===w.id;w.ring=Math.min(Math.max(w.ring,w.pot),w.ring+Math.max(.3,(w.pot-w.ring)*(ft?.06:.04)));w.mic=Math.min(Math.max(w.mic,w.potM||w.pot),w.mic+Math.max(.15,((w.potM||w.pot)-w.mic)*(ft?.035:.02)));
    if(w.pop<ROH_POP_CAP)w.pop=Math.min(ROH_POP_CAP,w.pop+(ft?.6:.25));
    if(Math.random()<.015){w.inj=RI(1,3);if(mine){const n=`🩹 ${w.name} got banged up on ROH TV — out ${w.inj} week${w.inj>1?'s':''}.`;notes.push(n)}}}
   if(w.con<=0&&!w.exc){delete f.r[w.id];if(f.feat===w.id)f.feat=null;if(mine){const n=`📝 ${w.name}'s ROH deal ran out and they left.`;news(n);notes.push(n)}}
   else if(w.con===4&&mine)notes.push(`✍️ ${w.name}'s ROH deal ends in 4 weeks — call them up or extend it from the ROH screen.`)})}}
window.farmExtend=function(id){const w=F('p').r[id];if(!w)return;const c=fsal(w)*4;if(S.money.p<c)return toast('Not enough money.');S.money.p-=c;w.con=(w.con||0)+26;w.fsal=fsal(w);save();render();toast(`${w.name} extended 26 weeks.`)};
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){const out=e0.apply(this,arguments);try{farmWeek(notes||[])}catch(e){console.warn('farm',e)}return out}}

/* ---------------- views ---------------- */
function regionChips(){return `<div class="chips">${Object.entries(REG).map(([k,r])=>`<button class="chip ${SREG===k?'on':''}" onclick="SREG_SET('${k}')">${r.i} ${r.n} · ${board(k).length}</button>`).join('')}</div>`}
window.SREG_SET=k=>{SREG=k;render();setTimeout(()=>{const e=document.getElementById('faPros');if(e)e.scrollIntoView({block:'start'})},0)};
function prospectCard(w,i){const T=TIERS[w.tier]||TIERS.prospect;const c=signCostF(w);const full=farmL('p').length>=FARM_MAX;const poor=S.money.p<c;
 const from=w.reg==='intl'&&INTL[w.from]?`${INTL[w.from].f} ${INTL[w.from].n} · `:w.real?'🏟️ ROH roster · ':'';
 return `<div class="card scout${w.gim?' gimc':''}"><div class="row sb"><span class="frow">${face(w)}<span><b>${alSpan(w)}</b><br>${w.bio?`<span class="tiny gold">🎭 ${esc(w.bio)}</span><br>`:''}<span class="muted tiny">${from}${w.g==='M'?"Men's":"Women's"} · ${STYLE_N[w.st]} · ${w.al==='f'?'Face':'Heel'}</span></span></span><span class="tg ${w.tier==='gen'?'good':w.tier==='bluechip'?'warnt':''}">${w.real?'Known name':T.n}</span></div>
  <div class="grid2" style="margin-top:8px"><div><span class="muted tiny">Scout's projection</span><br><b>${w.real?`${Math.round(w.pot)}`:`${T.pot[0]}–${T.pot[1]}`}</b> potential</div><div><span class="muted tiny">Right now</span><br>RNG ${Math.round(w.ring)} · MIC ${Math.round(w.mic)} · POP ${Math.round(w.pop)}</div></div>
  ${(w.tr||[]).length?`<div class="tags" style="margin-top:6px">${w.tr.map(t=>TRAITS[t]?`<span class="tg">${TRAITS[t].i} ${esc(TRAITS[t].n)}</span>`:'').join('')}</div>`:''}
  <div class="muted tiny" style="margin-top:8px">${money(c)} to sign (${money(w.fee)} fee + 4 wks of salary)</div>
  <div class="row" style="gap:8px;margin-top:6px"><button class="btn" style="margin:0;flex:1" ${poor?'disabled':''} onclick="farmSign('${SREG}',${i},'aew')">Sign to AEW</button><button class="btn sec" style="margin:0;flex:1" ${poor||full?'disabled':''} onclick="farmSign('${SREG}',${i},'roh')">Sign to ROH${full?' (full)':''}</button></div></div>`}
function scoutHub(){scoutFresh();const s=S.scout;if(!s)return '';boards();const n=scoutLeft();const l=board(SREG);
 return `<div class="card mt" id="faPros" style="scroll-margin-top:70px"><div class="row sb"><div class="h small" style="margin:0">🔎 Scouting</div><span class="muted tiny">New boards in ${n} wk${n>1?'s':''}</span></div>
  <div class="muted" style="margin:4px 0 8px">${REG[SREG].d} Sign to <b>AEW</b> (uses a roster spot, bookable now) or to <b>ROH</b> (half salary, develops on ROH TV, call up any time). ROH roster: ${farmL('p').length}/${FARM_MAX}.</div>${regionChips()}</div>
  ${l.length?l.map(prospectCard).join(''):'<p class="muted center">You signed everyone on this board. New names arrive soon.</p>'}<button class="btn sec" onclick="openCreate()">✏️ Design your own prospect</button>`}
if(typeof faProspects==='function'){faProspects=function(){try{return scoutHub()}catch(e){console.warn(e);return ''}}}

function farmCard(w){const f=F('p');const ft=f.feat===w.id;const X=w.exc&&EXC[w.exc.k];const ready=w.ring>=60;
 const st=X?`<span class="tg">✈️ ${X.n} · back in ${Math.max(0,w.exc.until-AW())} wk</span>`:w.inj?`<span class="tg bad">🩹 Out ${w.inj} wk</span>`:w.back?'<span class="tg good">✈️ Back from excursion</span>':ready?'<span class="tg good">Ready for AEW</span>':'';
 return `<div class="card${ft?' good':''}"><div class="row sb"><span class="frow">${face(w)}<span><b>${esc(w.name)}</b>${ft?' <span class="tg warnt">⭐ Featured</span>':''}<br><span class="muted tiny">${w.g==='M'?"Men's":"Women's"} · ${STYLE_N[w.st]} · ${w.al==='f'?'Face':'Heel'} · ${money(w.fsal||fsal(w))}/wk · ${w.con} wk left</span></span></span>${st}</div>
  <div class="grid2" style="margin-top:8px"><div><span class="muted tiny">In-ring</span><br><b>${Math.round(w.ring)}</b> <span class="muted tiny">/ ${Math.round(w.pot)} potential</span></div><div><span class="muted tiny">Mic · Popularity</span><br><b>${Math.round(w.mic)}</b> · <b>${Math.round(w.pop)}</b></div></div>
  <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap">${X?'':`<button class="mini" onclick="callUp('${w.id}')">📣 Call up</button>`}${X||w.inj?'':`<button class="mini" onclick="farmFeature('${w.id}')">${ft?'Unfeature':'⭐ Feature'}</button>`}${X||w.done?'':`<button class="mini" onclick="farmExcPick('${w.id}')">✈️ Excursion</button>`}${w.con<=8?`<button class="mini" onclick="farmExtend('${w.id}')">✍️ Extend ${money(fsal(w)*4)}</button>`:''}<button class="mini" onclick="farmRelease('${w.id}')">Release</button></div></div>`}
function farmView(){const l=farmL('p').sort((a,b)=>b.ring-a.ring);const pay=l.reduce((x,w)=>x+(w.fsal||fsal(w)),0);
 const cand=ownList('p').filter(downOk);
 return `${pageHead('Ring of Honor','ROH roster',`<b>${money(pay)}</b><small>ROH payroll / wk</small>`,{sub:`${l.length}/${FARM_MAX} wrestlers · develop on ROH TV every week`})}${chips('rf',[['mine','Mine'],['rival','Rival'],['fa','Free agents'],['roh','🏟️ ROH'],['all','All']],rf)}
 <div class="card mt"><div class="muted">Everyone here works ROH TV each week and grows toward their potential — slower than the Performance Center, but there's room for ${FARM_MAX} and they don't take AEW roster spots. <b>⭐ Feature</b> one to grow faster and build popularity (up to ${ROH_POP_CAP}). <b>✈️ Excursion</b> sends someone abroad for ${EXC_WK} weeks to come back better. Call anyone up whenever you need them.</div>
 <button class="btn sec" style="margin-top:10px" onclick="rf='fa';SREG_SET('roh')">🔎 Scout new talent</button></div>
 ${l.length?l.map(farmCard).join(''):'<p class="muted center">Nobody on ROH yet. Sign prospects to ROH from Scouting, or send a rookie down.</p>'}
 ${cand.length?`<div class="card"><div class="h small">Send down</div><div class="muted" style="margin-bottom:8px">Rookies and anyone at 45 popularity or lower can go to ROH to develop. Champions can't.</div>${cand.slice(0,12).map(w=>`<div class="prow">${face(w)}<div class="wl"><div class="wn">${esc(w.name)}</div><div class="muted tiny">Popularity ${Math.round(w.pop)} · Ring ${Math.round(w.ring)}${w.rookie?' · ROOKIE':''}</div></div><button class="mini" onclick="sendDown('${w.id}')">🏟️ Send down</button></div>`).join('')}</div>`:''}`}
if(typeof rosterView==='function'){const r0=rosterView;rosterView=function(){if(rf==='roh')return farmView();return r0.apply(this,arguments)}}
})();
