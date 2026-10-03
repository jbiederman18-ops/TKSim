/* Tony Khan Simulator — season systems (v80).
   Tournaments (Continental Classic, Owen Hart Cups), the Casino Gauntlet, Forbidden Door dream matches,
   network mandates, card suggestions, free-agent bidding wars, season scoring and the offseason.
   Loaded before index.html's main script; everything here runs lazily, so it can use the main script's helpers. */
'use strict';

/* ===================== TOURNAMENTS ===================== */
const TOURS={
 c2:{n:'Continental Classic',i:'♾️',g:'M',title:'cont',rr:[8,9,10],final:11,
  d:'Round robin for the Continental title. Four of your best men wrestle three weeks of block matches (3 points a win, Continental Crown rules: no run-ins), and the top two meet at Worlds End.'},
 ohc:{n:'Owen Hart Cup',i:'🏆',g:'M',prize:'world',semi:17,final:20,
  d:"Knockout bracket for four of your best men. The winner earns a World title shot at All In."},
 ohcw:{n:"Women's Owen Hart Cup",i:'🏆',g:'F',prize:'wworld',semi:18,final:20,
  d:"Knockout bracket for four of your best women. The winner earns a Women's World title shot at All In."}};
const RR4=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];
function tourState(b,k){S.tour=S.tour||{};const T=S.tour[b]||(S.tour[b]={});let t=T[k];if(!t||t.s!==S.season)t=T[k]={s:S.season,ent:null,res:[],win:null};return t}
/* entrants lock the first time the tournament needs them. A field the GM picked is used as chosen (anyone hurt or gone
   is replaced by the next best); otherwise the brand's four best healthy workers of that division are entered. */
const tourFirst=D=>D.rr?D.rr[0]:D.semi;
function tourEnt(b,k){const t=tourState(b,k);const D=TOURS[k];if(t.ent&&(t.lock||!t.pick))return t.ent;
 const pool=ownList(b).filter(w=>w.g===D.g&&!w.inj).sort((x,y)=>(y.pop+y.ring)-(x.pop+x.ring));
 if(t.pick&&t.ent){const out=[],gone=[];t.ent.forEach(id=>{const w=S.w[id];if(w&&w.own===b&&!w.inj&&w.g===D.g)out.push(id);else gone.push(id)});
  const pz=D.prize&&S.titles[D.prize];const champ=pz&&pz.holders[0];pool.forEach(w=>{if(out.length<4&&!out.includes(w.id)&&w.id!==champ)out.push(w.id)});
  t.lock=1;if(out.length<4){t.ent=[];return t.ent}t.ent=out;
  if(gone.length&&(b==='p'||ON()))news(`${D.i} ${gone.map(id=>S.w[id]?S.w[id].name:'An entrant').join(' and ')} can't compete — ${out.slice(4-gone.length).map(id=>S.w[id].name).join(' and ')} take${gone.length>1?'':'s'} the spot in the ${D.n}.`);
  return t.ent}
 t.lock=1;const ent=[];
 const tt=D.title&&S.titles[D.title];const th=tt&&tt.holders[0]&&S.w[tt.holders[0]];if(th&&th.own===b&&!th.inj&&th.g===D.g)ent.push(th.id);
 const pz=D.prize&&S.titles[D.prize];const champ=pz&&pz.holders[0];
 pool.forEach(w=>{if(ent.length<4&&!ent.includes(w.id)&&w.id!==champ)ent.push(w.id)});
 t.ent=ent.length===4?ent:[];if(t.ent.length&&(b==='p'||ON())){const n=`${D.i} The ${D.n} field is set: ${ent.map(id=>S.w[id].name).join(', ')}.`;news(n)}
 return t.ent}
const tourWon=(t,id)=>{const r=t.res.find(x=>x.id===id);return r?r.w:null};
function c2Table(t){const pts={};t.ent.forEach(id=>pts[id]=0);t.res.filter(r=>r.lab==='Block').forEach(r=>{if(r.w)pts[r.w]=(pts[r.w]||0)+3});
 return t.ent.slice().sort((a,b)=>pts[b]-pts[a]||((t.res.find(r=>r.lab==='Block'&&[r.a,r.b].includes(a)&&[r.a,r.b].includes(b))||{}).w===a?-1:1)||(S.w[b]?S.w[b].pop:0)-(S.w[a]?S.w[a].pop:0)).map(id=>({id,p:pts[id]}))}
/* the tournament matches a brand owes this week: [{id,lab,a,b}] */
function tourPairs(b){const out=[];const wk=S.week;
 for(const k in TOURS){const D=TOURS[k];const due=(D.rr&&(D.rr.includes(wk)||D.final===wk))||(D.semi===wk||D.final===wk);if(!due)continue;
  const ent=tourEnt(b,k);if(ent.length!==4)continue;const t=tourState(b,k);const id=(lab,n)=>`${k}:${S.season}:${lab}:${n}`;
  if(D.rr&&D.rr.includes(wk)){RR4[D.rr.indexOf(wk)].forEach(([i,j],n)=>out.push({k,id:id('Block',wk*10+n),lab:'Block',a:ent[i],b:ent[j]}))}
  else if(D.rr&&wk===D.final){const tb=c2Table(t);out.push({k,id:id('Final',0),lab:'Final',a:tb[0].id,b:tb[1].id})}
  else if(wk===D.semi){out.push({k,id:id('Semi',0),lab:'Semi-final',a:ent[0],b:ent[3]},{k,id:id('Semi',1),lab:'Semi-final',a:ent[1],b:ent[2]})}
  else if(wk===D.final&&!D.rr){const s0=tourWon(t,id('Semi',0)),s1=tourWon(t,id('Semi',1));if(s0&&s1)out.push({k,id:id('Final',0),lab:'Final',a:s0,b:s1})}}
 return out.filter(x=>!tourState(b,x.k).res.some(r=>r.id===x.id))}
/* record a result (from the ring, a forfeit or a no-contest) and move the tournament along */
function tourRecord(b,x,w,notes,how){const t=tourState(b,x.k);if(t.res.some(r=>r.id===x.id))return;const D=TOURS[x.k];
 t.res.push({id:x.id,lab:x.lab==='Semi-final'?'Semi':x.lab,a:x.a,b:x.b,w});const W=S.w[w],L=S.w[w===x.a?x.b:x.a];const mine=b==='p'||ON();
 if(how&&W&&mine){const n=`${D.i} ${D.n}: ${W.name} advances — ${how}.`;notes.push(n);news(n)}
 if(x.lab==='Block'&&mine&&t.res.filter(r=>r.lab==='Block').length===6){const tb=c2Table(t);notes.push(`${D.i} ${D.n} final standings: ${tb.map(r=>`${S.w[r.id]?S.w[r.id].name:'?'} ${r.p}`).join(' · ')}. ${S.w[tb[0].id].name} and ${S.w[tb[1].id].name} meet at ${PPVS[D.final]}.`)}
 if(x.lab==='Semi-final'&&mine&&W)notes.push(`${D.i} ${W.name} is through to the ${D.n} final at ${PPVS[D.final]||'week '+D.final}.`);
 if(x.lab!=='Final'||!W)return;
 t.win=w;W.pop=clamp(W.pop+4,1,100);W.mor=clamp(W.mor+10,0,100);const n=`${D.i} ${W.name} wins the ${D.n}!`;news(n);notes.push(n);
 if(!D.prize)return;const pz=S.titles[D.prize];const h=pz&&pz.holders[0]&&S.w[pz.holders[0]];
 if(!pz||!h){W.pop=clamp(W.pop+2,1,100);return}
 if(h.id===w){notes.push(`👑 The champion proves the point — ${W.name} already holds the ${pz.n} title.`);return}
 if(h.own===b){if(b==='p'){addPromise({kind:'shot',a:w,b:h.id,week:SEASON,ppv:PPVS[SEASON],title:pz.id});notes.push(`🎟️ ${W.name} has earned a ${pz.n} title shot against ${h.name} at ${PPVS[SEASON]}.${ON()?'':" It'll be waiting on your card."}`)}else t.shot=w}
 else{t.chal=w;if(mine)notes.push(`🎟️ ${W.name} has earned a shot at ${nameOf(h.own)}'s ${pz.n} champion ${h.name} — it's booked as ${ON()?nameOf(b)+"'s":'your'} title challenge at ${PPVS[SEASON]}.`)}}
function tourMatch(x){const m={type:'singles',stip:'std',sides:[[x.a],[x.b]],winner:0,title:'',tour:{k:x.k,id:x.id,lab:x.lab}};
 if(x.lab==='Final'&&TOURS[x.k].title&&eligibleTitles(m).includes(TOURS[x.k].title))m.title=TOURS[x.k].title;return m}
/* this week's tournament matches as booked matches; injured entrants forfeit before the show */
function tourDue(b,used,notes){const out=[];tourPairs(b).forEach(x=>{const A=S.w[x.a],B=S.w[x.b];
  if(!A||!B||A.own!==b||B.own!==b||A.inj||B.inj){const ok=[A,B].filter(w=>w&&w.own===b&&!w.inj);const w=ok.length?ok.sort((p,q)=>q.pop-p.pop)[0].id:(A?x.a:x.b);tourRecord(b,x,w,notes||[],'by forfeit');return}
  if(used&&(used.has(x.a)||used.has(x.b)))return;out.push(tourMatch(x))});return out}
function tourResult(b,m,notes){const x=Object.assign({},m.tour,{a:m.sides[0][0],b:m.sides[1][0]});if(!TOURS[x.k])return;
 const w=m.nc?[x.a,x.b].sort((p,q)=>S.w[q].pop-S.w[p].pop)[0]:m.sides[m.winner][0];tourRecord(b,x,w,notes,m.nc?'the officials send them through after the no-contest':'')}
/* anything still owed after the show (a match that couldn't happen) is settled by forfeit */
function tourSweep(b,notes){tourPairs(b).forEach(x=>{const ok=[x.a,x.b].map(id=>S.w[id]).filter(w=>w&&w.own===b&&!w.inj);tourRecord(b,x,(ok.length?ok.sort((p,q)=>q.pop-p.pop)[0]:S.w[x.a]||S.w[x.b]).id,notes,'by forfeit')})}
function tourCard(b){b=b||'p';const l=[];for(const k in TOURS){const D=TOURS[k];const first=tourFirst(D);if(S.week>D.final||S.week<first-3)continue;
  const t=tourState(b,k);const ent=S.week>=first?tourEnt(b,k):t.ent;const can=b==='p'&&tourCanPick(k);
  const pickBtn=can?`<button class="btn sec" style="margin:8px 0 0" onclick="openTourPick('${k}')">${t.pick?'✏️ Change your field':'🎯 Pick your field'}</button>`:'';
  let body='';if(!ent||!ent.length){body=`<div class="muted tiny">Starts week ${first}. Pick the four ${D.g==='M'?'men':'women'} you want in it${S.week<first?` before week ${first}`:''} — or your four best will be entered automatically.</div>`}
  else if(S.week<first){body=`<div class="tiny">${D.rr?'Your field':'Your bracket'} (starts week ${first}):${ent.map((id,i)=>`<div>${D.rr?'•':i+1+'.'} ${S.w[id]?esc(S.w[id].name):'?'}</div>`).join('')}${D.rr?'':`<div class="muted" style="margin-top:2px">Semi-finals: 1 vs 4 · 2 vs 3</div>`}</div>`}
  else if(D.rr){const tb=c2Table(t);body=`<div class="tiny">${tb.map((r,i)=>`<div class="row sb"><span>${i+1}. ${S.w[r.id]?esc(S.w[r.id].name):'?'}</span><b>${r.p} pts</b></div>`).join('')}</div>`}
  else{body=`<div class="tiny">${t.res.length?t.res.map(r=>`<div>${esc(r.lab==='Semi'?'Semi-final':r.lab)}: <b>${S.w[r.w]?esc(S.w[r.w].name):'?'}</b> def. ${S.w[r.w===r.a?r.b:r.a]?esc(S.w[r.w===r.a?r.b:r.a].name):'?'}</div>`).join(''):`Semi-finals: ${esc(S.w[ent[0]].name)} vs ${esc(S.w[ent[3]].name)} · ${esc(S.w[ent[1]].name)} vs ${esc(S.w[ent[2]].name)}`}</div>`}
  l.push(`<div class="mur"><div class="muh">${D.i} ${esc(D.n)}${t.win?` · 🏆 ${esc(S.w[t.win]?S.w[t.win].name:'')}`:''}</div>${body}<div class="tiny muted" style="margin-top:4px">${esc(D.d)}</div>${pickBtn}</div>`)}
 return l.length?`<div class="card"><div class="h small">Tournaments</div>${l.join('')}</div>`:''}

/* ===================== CASINO GAUNTLET ===================== */
/* six enter one at a time; the winner earns a title shot at the next PPV */
function gauntletPrize(b,m,notes){if(m.nc)return;const W=S.w[m.sides[m.winner][0]];if(!W)return;const np=nextPPVAfter(S.week);const mine=b==='p'||ON();
 const ts=Object.values(S.titles).filter(t=>t.kind==='singles'&&t.g===W.g&&t.holders.length&&!t.holders.includes(W.id)&&S.w[t.holders[0]]&&S.w[t.holders[0]].own===b).sort((x,y)=>y.prestige-x.prestige);
 W.pop=clamp(W.pop+2,1,100);W.mor=clamp(W.mor+6,0,100);
 if(!np||!ts.length){if(mine)notes.push(`🎰 ${W.name} wins the Casino Gauntlet — bragging rights, and the crowd is buzzing.`);return}
 const t=ts[0],h=S.w[t.holders[0]];
 if(b==='p'){addPromise({kind:'shot',a:W.id,b:h.id,week:np.w,ppv:np.n,title:t.id});notes.push(`🎰 ${W.name} wins the Casino Gauntlet and earns a ${t.n} title shot against ${h.name} at ${np.n}!`)}
 else{S.aiShot={a:W.id,title:t.id,week:np.w};if(mine)notes.push(`🎰 ${W.name} wins the Casino Gauntlet and earns a ${t.n} title shot at ${np.n}!`)}}

/* ===================== FORBIDDEN DOOR: crossover dream matches ===================== */
const otherBrand=b=>b==='p'?'ai':'p';
function xoAuto(brand,used,n){const other=otherBrand(brand);const theirs=new Set();((S.card&&S.card[other])||[]).forEach(sl=>{if(!sl.d)return;if(sl.k==='match')sl.d.sides.flat().forEach(id=>theirs.add(id));if(sl.k==='chal'&&sl.d.c)theirs.add(sl.d.c);if(sl.k==='xo'){theirs.add(sl.d.a);theirs.add(sl.d.b)}});
 const mineL=ownList(brand).filter(w=>!w.inj&&!used.has(w.id)).sort((a,b)=>b.pop-a.pop);const opp=ownList(other).filter(w=>!w.inj&&!theirs.has(w.id));const out=[];
 for(const A of mineL){if(out.length>=n)break;const c=opp.filter(o=>o.g===A.g&&!out.some(x=>x.b===o.id)).sort((x,y)=>(chemOpp(A,y)*2+y.pop)-(chemOpp(A,x)*2+x.pop))[0];if(c){out.push({a:A.id,b:c.id});used.add(A.id)}}
 return out}
function openXo(i){if(mpLocked())return;const sl=S.card.p[i];const used=usedIn('p',i);const other='ai';
 openPicker({title:'Your wrestler',cur:sl.d&&sl.d.a,clear:!!sl.d,g:'all',sort:'ovr',pool:()=>ownList('p').filter(w=>!w.inj&&!used.has(w.id)),info:w=>`${STYLE_N[w.st]} · Pop ${Math.round(w.pop)}`,back:()=>{closeModal();render()},
  onPick:a=>{if(!a){S.card.p[i].d=null;save();closeModal();render();return}const A=S.w[a];const taken=new Set(S.card.p.filter((x,j)=>j!==i&&x.k==='xo'&&x.d).map(x=>x.d.b));
   openPicker({title:`${A.name} vs… (from ${nameOf(other)})`,g:'all',sort:'chem',chem:w=>chemOpp(A,w),pool:()=>ownList(other).filter(w=>!w.inj&&!taken.has(w.id)),info:w=>`<em class="chm ${chemOpp(A,w)>=6?'cg':chemOpp(A,w)>=0?'cn':'cb'}">Chem ${Math.round(chemOpp(A,w))}</em> Pop ${Math.round(w.pop)}`,back:()=>openXo(i),
    onPick:b=>{if(!b)return openXo(i);S.card.p[i].d={a,b};save();closeModal();render();toast(`🚪 Dream match signed: ${A.name} vs ${S.w[b].name}.`)}})}})}
/* air the dream matches: neither GM controls both sides, so the winner is decided in the ring */
function airXo(order,ctx,vals,extra,out){const segs=[];
 order.forEach(b=>{const other=otherBrand(b);(S.card[b]||[]).forEach(sl=>{if(sl.k!=='xo'||!sl.d)return;const A=S.w[sl.d.a];let B=S.w[sl.d.b];if(!A||A.own!==b||A.inj)return;
  const busy=new Set();((S.card[other])||[]).forEach(x=>{if(x.d&&x.k==='match')x.d.sides.flat().forEach(id=>busy.add(id));if(x.d&&x.k==='chal'&&x.d.c)busy.add(x.d.c)});segs.forEach(s=>s.ids&&s.ids.forEach(id=>busy.add(id)));
  const notes=[];if(!B||B.own!==other||B.inj||busy.has(B.id)){const was=B;B=ownList(other).filter(w=>!w.inj&&!busy.has(w.id)&&w.g===A.g).sort((x,y)=>y.pop-x.pop)[0];if(!B)return;if(was)notes.push(`🔁 ${was.name} couldn't make it — ${B.name} steps through the Forbidden Door instead.`)}
  const m={type:'singles',stip:'std',sides:[[A.id],[B.id]],winner:0,title:'',xo:1};const sc=w=>w.ring*.4+w.pop*.4+(w.mom||0)*2+R(0,25);m.winner=sc(B)>sc(A)?1:0;
  const res=rateMatch(m,ctx);applyMatch(m,res,Object.assign({},ctx,{pos:'mid'}),notes);const W=S.w[m.sides[m.winner][0]];const L=S.w[m.sides[1-m.winner][0]];/* v106: 4K to the winner's brand; a 4★+ dream match pays the losing brand 2K too */extra[W.own]=(extra[W.own]||0)+4000;const share=res.stars>=4&&L&&L.own&&L.own!==W.own;if(share)extra[L.own]=(extra[L.own]||0)+2000;
  W.pop=clamp(W.pop+2,1,100);vals[b].push(res.stars);segs.push({txt:matchText(m),sub:`Forbidden Door dream match · booked by ${nameOf(b)}`,stars:res.stars,notes:[`🚪 First time ever! ${W.name} wins it for ${nameOf(W.own)} (+4K fans${share?`; a dream match that delivered — ${nameOf(L.own)} gets +2K too`:''}).`].concat(notes),ids:[A.id,B.id]})})});
 if(segs.length)out.blocks.push({brand:'x',label:'🚪 Forbidden Door dream matches',segs:segs.map(s=>({txt:s.txt,sub:s.sub,stars:s.stars,notes:s.notes}))})}

/* ===================== NETWORK MANDATES ===================== */
/* every PPV cycle the TV network asks each GM for something specific. Deliver for a bonus; miss it and they're disappointed. */
const MANDS={
 me4:{n:'Headline a TV show with a 4★ main event',i:'🎬',ok:()=>true},
 show4:{n:'Put on a 4★ show',i:'⭐',ok:()=>true},
 women2:{n:"Book two women's matches on the same show",i:'💃',ok:b=>ownList(b).filter(w=>w.g==='F'&&!w.inj).length>=4},
 newchamp:{n:'Crown a new champion',i:'👑',ok:()=>true},
 debut:{n:'Debut a new signing',i:'✨',ok:b=>(S.money[b]||0)>300},
 tagdef:{n:'Successfully defend a tag or trios title',i:'🤝',ok:b=>Object.values(S.titles).some(t=>t.kind!=='singles'&&t.holders.length&&S.w[t.holders[0]]&&S.w[t.holders[0]].own===b)},
 rookie:{n:'Give a developing prospect a 3★ match',i:'🌱',ok:b=>ownList(b).some(w=>w.rookie&&!w.inj)},
 nosell:{n:"Don't sell out before the next PPV",i:'🙅',ok:()=>true,end:1},
 win2:{n:'Win the ratings war two weeks in a row',i:'📈',ok:()=>!ON()||nSeats()===2}};
const mandReward=()=>({cash:Math.round(econCap()*.3),fans:10000});
function mandNew(b,notes){const np=nextPPVAfter(S.week-1);if(!np)return;S.mand=S.mand||{};const last=S.mand[b]&&S.mand[b].k;
 const l=Object.keys(MANDS).filter(k=>k!==last&&MANDS[k].ok(b));if(!l.length)return;const k=pick(l);const rw=mandReward();
 S.mand[b]={k,due:np.w,ppv:np.n,cash:rw.cash,fans:rw.fans,st:0};if(b==='p'||ON()){const n=`📺 New network mandate: ${MANDS[k].n} by ${np.n} (+${money(rw.cash)}, +${fmtFans(rw.fans)} fans).`;news(n);if(notes)notes.push(n)}}
function mandPay(b,notes,ok){const md=S.mand&&S.mand[b];if(!md||md.done)return;md.done=ok?'ok':'fail';const mine=b==='p'||ON();const who=ON()?nameOf(b)+': ':'';
 if(ok){S.money[b]+=md.cash;S.fans[b]+=md.fans;if(mine)notes.push(`📺✅ ${who}Mandate delivered — ${MANDS[md.k].n}. The network is thrilled (+${money(md.cash)}, +${fmtFans(md.fans)} fans).`)}
 else{S.fans[b]=Math.max(50000,S.fans[b]-5000);if(mine)notes.push(`📺❌ ${who}Missed the network's mandate — ${MANDS[md.k].n}. They're disappointed (−5K fans).`)}}
/* inf: what happened on this brand's show tonight */
function mandCheck(b,inf,rating,show,hourWin,notes){const md=S.mand&&S.mand[b];if(!md||md.done)return;const k=md.k;let ok=false;
 if(k==='me4')ok=!show.ppv&&inf.me>=4;else if(k==='show4')ok=rating>=4;else if(k==='women2')ok=inf.women>=2;else if(k==='newchamp')ok=inf.newch;else if(k==='debut')ok=inf.deb;
 else if(k==='tagdef')ok=inf.tagdef;else if(k==='rookie')ok=inf.rk;
 else if(k==='nosell'){if(inf.sold){mandPay(b,notes,false);return}}
 else if(k==='win2'&&!show.ppv&&hourWin!=null){md.st=hourWin===b?(md.st||0)+1:0;ok=md.st>=2}
 if(ok)mandPay(b,notes,true)}
/* start of a new week: settle anything that came due, and hand out a new mandate after each PPV */
function mandTick(notes){if(S.phase!=='season')return;weekTick();S.mand=S.mand||{};brands().forEach(b=>{const md=S.mand[b];if(md&&!md.done&&S.week>md.due)mandPay(b,notes||[],!!MANDS[md.k].end);
  const cur=S.mand[b];if(!cur||(cur.done&&(S.week===1||PPVS[S.week-1]))||S.week>cur.due)mandNew(b,notes)})}
function mandCard(){const md=S.mand&&S.mand.p;if(!md||!MANDS[md.k])return '';const left=md.due-S.week;
 return `<div class="card mand"><div class="row sb"><span class="h small" style="margin:0">📺 Network mandate</span>${md.done?`<b class="${md.done==='ok'?'good':'bad'}">${md.done==='ok'?'✅ Delivered':'❌ Missed'}</b>`:`<span class="muted tiny">${left<=0?'Due tonight':`${left} week${left>1?'s':''} left`}</span>`}</div>
 <div style="margin-top:6px">${MANDS[md.k].i} <b>${esc(MANDS[md.k].n)}</b>${md.done?'':` by ${esc(md.ppv)}`}</div>${md.done?'':liveLine(mandLive(md),'This card')}${md.done?'':`<div class="muted tiny">Reward: ${money(md.cash)} and ${fmtFans(md.fans)} fans. Miss it and you lose 5K fans.${md.k==='win2'&&md.st?` · Streak: ${md.st}`:''}</div>`}</div>`}

/* ===================== WEEKLY MINI-GOALS & CROWD CHANTS (v89) =====================
 Every week each GM gets one small goal (a little cash and fans, no penalty for missing it), and the crowd starts
 chanting for someone on the roster — book them that week for a pop. */
const GOALS={
 me4:{n:'Get a 4★ main event',i:'🎬',ok:sh=>!sh.ppv,chk:(f,r)=>f.me>=4},
 title:{n:'Put a title on the line',i:'🏆',ok:(sh,b)=>Object.values(S.titles).some(t=>t.holders.length&&S.w[t.holders[0]]&&S.w[t.holders[0]].own===b),chk:f=>f.title>0},
 women:{n:"Book a women's match",i:'💃',ok:(sh,b)=>ownList(b).filter(w=>w.g==='F'&&!w.inj).length>=2,chk:f=>f.women>=1},
 tag:{n:'Book a tag or trios match',i:'🤝',ok:()=>true,chk:f=>f.tag>0},
 stip:{n:'Book a stipulation match',i:'⛓️',ok:()=>true,chk:f=>f.stip>0},
 promo:{n:'Land a 3½★ promo',i:'🎤',ok:()=>true,chk:f=>f.pr>=3.5},
 show:{n:'Put on a 3½★ show',i:'⭐',ok:()=>true,chk:(f,r)=>r>=3.5},
 floor:{n:'No match under 2½★',i:'🧱',ok:()=>true,chk:f=>f.nm>0&&f.lo>=2.5},
 rookie:{n:'Give a prospect a 3★ match',i:'🌱',ok:(sh,b)=>ownList(b).some(w=>w.rookie&&!w.inj),chk:f=>f.rk}};
/* econCap is already in $K: about 5% of a week's cap (≈$20–25K). v95 fix — this used to pay $5M a goal. */
const goalReward=()=>({cash:Math.max(10,Math.round(econCap()*.05/5)*5),fans:3000});
/* goals handed out before the fix carried the $5M payout; cap them at the real reward */
const goalCash=g=>Math.min(g.cash||0,goalReward().cash);
const CHANTS=['“We want {L}!”','“{U}! {U}! {U}!”','“Let’s go {L}!”','“{L} deserves it!”'];
function weekTick(){if(S.phase!=='season')return;S.goal=S.goal||{};S.chant=S.chant||{};const sh=curShow();const wk=AW();
 brands().filter(b=>b==='p'||ON()).forEach(b=>{if(!S.goal[b]||S.goal[b].w!==wk){const last=S.goal[b]&&S.goal[b].k;const l=Object.keys(GOALS).filter(k=>k!==last&&GOALS[k].ok(sh,b));if(l.length){const rw=goalReward();S.goal[b]={k:pick(l),w:wk,cash:rw.cash,fans:rw.fans}}}
  if(!S.chant[b]||S.chant[b].w!==wk){const was=S.chant[b]&&S.chant[b].id;const pool=ownList(b).filter(w=>!w.inj&&w.id!==was&&w.pop<80);if(pool.length){const w=pick(pool);const L=w.name.split(' ').slice(-1)[0];S.chant[b]={id:w.id,w:wk,t:pick(CHANTS).replace('{L}',L).replace(/\{U\}/g,L.toUpperCase())}}}})}
/* the crowd gets its wish: first segment on the card with the chanted wrestler gets the pop */
function chantHit(b,ids){const c=S.chant&&S.chant[b];if(!c||c.w!==AW()||c.hit||!ids.includes(c.id))return null;const w=S.w[c.id];if(!w)return null;
 c.hit=true;w.pop=clamp(w.pop+2,1,100);w.mor=clamp(w.mor+5,0,100);return `📣 The crowd got its wish — ${w.name}! The place comes unglued (+¼★, +2 popularity, +2K fans).`}
function goalCheck(b,inf,rating,show,notes){const g=S.goal&&S.goal[b];if(!g||g.w!==AW()||g.done||!GOALS[g.k])return;
 if(!GOALS[g.k].chk(inf,rating,show))return;g.done=true;g.cash=goalCash(g);S.money[b]+=g.cash;S.fans[b]+=g.fans;
 if(b==='p'||ON())notes.push(`🎯 ${ON()?nameOf(b)+': ':''}Weekly goal hit — ${GOALS[g.k].n} (+${money(g.cash)}, +${fmtFans(g.fans)} fans).`)}
function weekGoalsCard(){if(S.phase!=='season')return '';if(!S.goal||!S.goal.p||S.goal.p.w!==AW()||!S.chant||!S.chant.p||S.chant.p.w!==AW())weekTick();
 const g=S.goal&&S.goal.p,c=S.chant&&S.chant.p;const cw=c&&S.w[c.id];if(!(g&&GOALS[g.k])&&!cw)return '';
 return `<div class="card wkg">${g&&GOALS[g.k]?`<div class="row sb"><span><span class="tiny muted">🎯 This week's goal</span><br><b>${GOALS[g.k].i} ${esc(GOALS[g.k].n)}</b>${g.done?'':liveLine(goalLive(g.k))}</span><span class="tiny ${g.done?'good':'muted'}" style="text-align:right">${g.done?'✅ Done':`+${money(goalCash(g))}<br>+${fmtFans(g.fans)} fans`}</span></div>`:''}${cw?`<div class="row sb wkc" onclick="showW('${cw.id}')"><span><span class="tiny muted">📣 The crowd is chanting</span><br><b>${esc(c.t)}</b></span><span class="tiny muted" style="text-align:right">Book ${esc(cw.name.split(' ').slice(-1)[0])}<br>for a pop</span></div>`:''}</div>`}

/* ===================== LIVE GOAL TRACKER (v92) =====================
 Reads the card as it's booked right now and says whether the weekly goal and the network mandate are on track.
 Matches use their projected range, promos a guess from mic skill, the show the same weighting the ratings use. */
function cardProj(){const sh=curShow();const c=(S.card&&S.card.p)||[];const ctx={ppv:sh.ppv,allin:sh.ppv&&S.week===SEASON,preview:true};
 const P={sh,booked:0,me:null,women:0,title:0,tag:0,stip:0,pr:null,nm:0,loMid:5,loHi:5,rk:0,newch:false,tagdef:false,deb:false,show:null};
 const ch=S.chant&&S.chant.p&&S.chant.p.w===AW()?S.chant.p.id:null;let chUsed=false;
 const meSlot=c.map((sl,i)=>sl.k==='match'?i:-1).filter(i=>i>=0).pop();
 const mids=[],his=[],meta=[];
 c.forEach((sl,si)=>{if(!sl.d||fixedK(sl))return;
  if(sl.k==='match'){const m=sl.d;if(!validMatch(m))return;const ids=m.sides.flat();const ws=ids.map(id=>S.w[id]);if(ws.some(w=>w.inj))return;
   const r=rateMatch(m,ctx);let bump=Math.min(1,ws.filter(w=>w.deb).reduce((a,w)=>a+debutStars(w,sh.ppv),0));if(ch&&!chUsed&&ids.includes(ch)){bump+=.25;chUsed=true}
   const mid=clamp((r.lo+r.hi)/2+bump,.25,5),hi=clamp(r.hi+bump,.25,5);P.booked++;P.nm++;mids.push(mid);his.push(hi);meta.push(segMeta(sl,mid));
   if(ws.some(w=>w.g==='F'))P.women++;if(m.title)P.title++;if(m.type==='tag'||m.type==='trios'||m.type==='tag8'||m.sides[0].length>1)P.tag++;if(stipKey(m)!=='std')P.stip++;
   P.loMid=Math.min(P.loMid,mid);P.loHi=Math.min(P.loHi,hi);if(si===meSlot)P.me={mid,hi,lo:clamp(r.lo+bump,.25,5)};
   if(ws.some(w=>w.rookie&&w.own==='p'))P.rk=Math.max(P.rk,mid>=3?2:hi>=3?1:0.5);
   if(ws.some(w=>w.deb&&w.own==='p'))P.deb=true;
   const t=m.title&&S.titles[m.title];const win=(m.sides[m.winner]||[]).slice().sort().join('|');const f=finOf(m);
   if(t&&t.holders.length&&win){const held=t.holders.slice().sort().join('|');const wo=S.w[(m.sides[m.winner]||[])[0]];
    if(win!==held&&f!=='dq'&&f!=='co'&&wo&&wo.own==='p')P.newch=true;
    if(win===held&&t.kind!=='singles'&&S.w[t.holders[0]]&&S.w[t.holders[0]].own==='p')P.tagdef=true}
   else if(t&&!t.holders.length&&win){const wo=S.w[(m.sides[m.winner]||[])[0]];if(wo&&wo.own==='p')P.newch=true}}
  else if(sl.k==='promo'){const p=sl.d;if(!S.w[p.a])return;let st=p.res?p.res.stars:promoEst(p);const ids=[p.a,p.b].filter(Boolean);
   st+=Math.min(1,ids.map(id=>S.w[id]).filter(w=>w&&w.deb).reduce((a,w)=>a+debutStars(w,sh.ppv),0));if(ch&&!chUsed&&ids.includes(ch)){st+=.25;chUsed=true}
   st=clamp(st,.5,5);P.booked++;P.pr=Math.max(P.pr||0,st);mids.push(st);his.push(st);meta.push(segMeta(sl,st));
   if(ids.some(id=>S.w[id]&&S.w[id].deb&&S.w[id].own==='p'))P.deb=true}});
 if(mids.length){const wavg=v=>{let s=0,ws=0;v.forEach((x,i)=>{const w=i===v.length-1?1.6:1;s+=x*w;ws+=w});return s/ws};
  const fm=flowScore(meta,sh.ppv,'p').mod;const pk=prodOf('p',sh);const pb=PROD[pk]&&PROD[pk].b||0;
  P.show={mid:clamp(wavg(mids)+fm+pb,0,5),hi:clamp(wavg(his)+fm+pb,0,5)}}
 return P}
/* status: y = on track, m = could go either way, n = not yet, x = doesn't apply this week */
const LV=(s,t)=>({s,t});
function starLive(r,th,what){if(!r)return LV('n',`Book ${what} to see a projection`);const tx=`${what[0].toUpperCase()+what.slice(1)} projects ${stars(Math.floor(r.mid*4+1e-6)/4)}`;
 return r.mid>=th?LV('y',tx):r.hi>=th?LV('m',tx+' — right on the edge'):LV('n',tx)}
function goalLive(k){const P=cardProj();if(!P.booked)return LV('n','Nothing booked yet');
 switch(k){
  case 'me4':return starLive(P.me,4,'your main event');
  case 'title':return P.title?LV('y','A title is on the line'):LV('n','No title match booked');
  case 'women':return P.women?LV('y',`${P.women} women's match${P.women>1?'es':''} booked`):LV('n',"No women's match booked");
  case 'tag':return P.tag?LV('y','Tag/trios match booked'):LV('n','No tag or trios match booked');
  case 'stip':return P.stip?LV('y','Stipulation match booked'):LV('n','No stipulation match booked');
  case 'promo':return P.pr==null?LV('n','No promo booked'):P.pr>=3.5?LV('y',`Best promo looks like ${stars(Math.floor(P.pr*4+1e-6)/4)}`):P.pr>=3?LV('m',`Best promo looks like ${stars(Math.floor(P.pr*4+1e-6)/4)} — promos are live, so it's up to you`):LV('n',`Best promo looks like ${stars(Math.floor(P.pr*4+1e-6)/4)}`);
  case 'show':return starLive(P.show,3.5,'the show');
  case 'floor':return !P.nm?LV('n','No matches booked'):P.loMid>=2.5?LV('y',`Weakest match projects ${stars(Math.floor(P.loMid*4+1e-6)/4)}`):P.loHi>=2.5?LV('m',`Weakest match projects ${stars(Math.floor(P.loMid*4+1e-6)/4)} — on the edge`):LV('n',`Weakest match projects ${stars(Math.floor(P.loMid*4+1e-6)/4)}`);
  case 'rookie':return P.rk>=2?LV('y','Your prospect projects 3★+'):P.rk>=1?LV('m','Your prospect is right around 3★'):P.rk?LV('n',"Your prospect's match projects under 3★"):LV('n','No prospect booked')}
 return LV('x','')}
function mandLive(md){const P=cardProj();const sh=P.sh;if(!P.booked&&md.k!=='nosell'&&md.k!=='win2')return LV('n','Nothing booked yet');
 switch(md.k){
  case 'me4':return sh.ppv?LV('x','Only counts on a TV show'):starLive(P.me,4,'your main event');
  case 'show4':return starLive(P.show,4,'the show');
  case 'women2':return P.women>=2?LV('y',`${P.women} women's matches booked`):LV('n',`${P.women} of 2 women's matches booked`);
  case 'newchamp':return P.newch?LV('y','A new champion gets crowned'):LV('n','No title change booked');
  case 'debut':return P.deb?LV('y','A new signing debuts'):LV('n','No new signing on the card');
  case 'tagdef':return P.tagdef?LV('y','Your tag champs retain'):LV('n','No tag/trios title defense booked');
  case 'rookie':return P.rk>=2?LV('y','Your prospect projects 3★+'):P.rk>=1?LV('m','Your prospect is right around 3★'):LV('n',P.rk?"Your prospect's match projects under 3★":'No prospect booked');
  case 'nosell':return sellOf('p',sh).length?LV('n',"You've sold out this week — it'll count against you"):LV('y','No sell-outs — keep it that way');
  case 'win2':return sh.ppv?LV('x','No ratings war on PPV weeks'):LV('m',`Streak ${md.st||0}/2${P.show?` · your show projects ${stars(Math.floor(P.show.mid*4+1e-6)/4)}`:''} — it comes down to the rival`)}
 return LV('x','')}
function liveLine(l,pre){if(!l||l.s==='x'&&!l.t)return '';const ic={y:'✅ On track',m:'🤞 Could happen',n:'⏳ Not yet',x:'➖ Not this week'}[l.s];
 return `<div class="glive ${l.s}"><b>${pre?esc(pre)+': ':''}${ic}</b>${l.t?` · ${esc(l.t)}`:''}</div>`}

/* ===================== ADVERTISED MAIN EVENT & THE MAIN EVENT WAR ===================== */
function rivalAd(){if(!ON()||!S.card||!S.card.ai||curShow().ppv)return null;if(ON()&&!(S.online.booked&&S.online.booked.ai))return null;
 const ms=S.card.ai.filter(sl=>sl.k==='match'&&sl.d&&validMatch(sl.d));const me=ms[ms.length-1];if(!me)return null;const r=rateMatch(me.d,{preview:true});return {m:me.d,lo:r.lo,hi:r.hi}}
function rivalAdHtml(mode){const a=rivalAd();if(!a)return '';const nm=esc(curShow().theirs||'show');
 if(mode==='line')return `<div class="rivalad"><div class="lft">Rival ad · ${nm}</div><div class="lfc">${esc(vsLine(a.m))}</div><div class="lfs">${esc(a.m.title&&S.titles[a.m.title]?S.titles[a.m.title].n+' title':MT[a.m.type].n)} · <span class="stars">${stars(a.lo)}–${stars(a.hi)}</span> · beat it for +3K fans</div></div>`;
 return `<div class="card dial"><div class="dk">Across the dial<b>${nm}</b></div><div class="dm"><div class="dv">${esc(vsLine(a.m))}</div><div class="tiny muted" style="margin-top:3px">${esc(a.m.title&&S.titles[a.m.title]?S.titles[a.m.title].n+' title':MT[a.m.type].n)} · <span class="stars">${stars(a.lo)}–${stars(a.hi)}</span> · beat it for +3K fans</div></div></div>`}

/* ===================== SUGGEST A CARD ===================== */
/* the GM's assistant books the empty slots — keeps everything you've already booked, promised or entered in a tournament */
function suggestCard(){const sh=curShow();const c=JSON.parse(JSON.stringify(S.card.p));const used=new Set();
 c.forEach(sl=>{if(!sl.d)return;if(sl.k==='match')sl.d.sides.flat().forEach(id=>id&&used.add(id));if(sl.k==='promo'){used.add(sl.d.a);if(sl.d.b)used.add(sl.d.b)}if(sl.k==='chal'&&sl.d.c)used.add(sl.d.c);if(sl.k==='xo')used.add(sl.d.a)});
 const gen=autoBook('p',sh,[...used],{smart:1});const ms=gen.filter(x=>x.k==='match'&&x.d),ps=gen.filter(x=>x.k==='promo'&&x.d);
 const exP=new Set();c.forEach(sl=>{if(sl.k==='promo'&&sl.d){exP.add(sl.d.a);if(sl.d.b)exP.add(sl.d.b)}});
 c.forEach(sl=>{if(sl.d)return;if(sl.k==='match'){const x=ms.shift();if(x)sl.d=x.d}
  else if(sl.k==='promo'){let x=ps.shift();while(x&&(exP.has(x.d.a)||x.d.b&&exP.has(x.d.b)))x=ps.shift();const p=x?x.d:autoPromo('p',exP);if(p){delete p.res;p.played=false;sl.d=p;exP.add(p.a);if(p.b)exP.add(p.b)}}
  else if(sl.k==='chal'){const ch=autoChal('p',used);if(ch)sl.d=ch}
  else if(sl.k==='xo'){const x=xoAuto('p',used,1)[0];if(x)sl.d=x}});
 /* put the strongest match last and a strong one first */
 return c}
function suggestFill(){if(mpLocked())return;const before=S.card.p.filter(sl=>sl.d).length;S.card.p=suggestCard();const n=S.card.p.filter(sl=>sl.d).length-before;save();render();toast(n?`✨ Booked ${n} segment${n>1?'s':''} — tweak anything you like.`:'Nothing left to fill.')}
function clearCard(){if(mpLocked())return;if(!confirm('Clear everything on this card except promised and tournament matches?'))return;
 S.card.p.forEach(sl=>{if(!sl.d)return;if(sl.k==='match'&&(sl.d.tour||promiseOf(sl.d)))return;sl.d=null});save();render()}

/* ===================== BIDDING WARS ===================== */
/* when a star hits the market, the rival may want them too */
function bidWar(id){const w=S.w[id];if(ON()||!w||w.pop<70||S.phase!=='season')return false;const c=signCost(w);
 if(S.money.ai<c*1.4||ownList('ai').length>=30||w.bid===AW())return false;if(Math.random()>.55)return false;w.bid=AW();
 const c2=Math.round(c*1.35),s2=Math.round(mkt(w)*1.2);
 openModal(`<div class="h mhd">💰 Bidding war!</div><p>${esc(S.rival)} wants <b>${esc(w.name)}</b> too, and they've made a big offer. Match it or walk away.</p>
 <div class="card"><div class="row sb"><span>Signing bonus</span><b>${money(c2)}</b></div><div class="row sb"><span>Salary</span><b>${money(s2)}/wk</b></div><div class="muted tiny">Normally ${money(c)} and ${money(mkt(w))}/wk.</div></div>
 <button class="btn" ${S.money.p<c2?'disabled':''} onclick="bidWin('${id}')">Outbid them · ${money(c2)}</button><button class="btn sec" onclick="bidLose('${id}')">Walk away</button>`);return true}
function bidWin(id){const w=S.w[id];const c2=Math.round(signCost(w)*1.35);if(S.money.p<c2)return toast('Not enough money.');S.money.p-=c2;w.sal=Math.round(mkt(w)*1.2);w.own='p';w.con=26;w.mor=85;w.fee=0;w.deb=AW();news(`💰 ${S.gm} won a bidding war with ${S.rival} for ${w.name}.`);save();closeModal();render();toast(`${w.name} signed! Put them on a show soon for a debut pop.`)}
function bidLose(id){const w=S.w[id];const c=signCost(w);S.money.ai-=c;w.sal=mkt(w);w.own='ai';w.con=RI(20,40);w.mor=80;w.deb=AW();const n=`✍️ ${S.rival} won the bidding war for ${w.name}.`;news(n);save();closeModal();render();toast(n)}

/* ===================== SEASON SCORING ===================== */
/* each season's fan war is decided by fans gained that season — the running total is your all-time fanbase */
const fanGain=b=>Math.round((S.fans[b]||0)-((S.fans0&&S.fans0[b])!=null?S.fans0[b]:250000));
function seasonStart(){S.fans0={};brands().forEach(b=>S.fans0[b]=S.fans[b]);{const old=S.tvdeal||{};S.tvdeal={};brands().forEach(b=>S.tvdeal[b]=tvIncome(S.fans[b]));const b0=brands()[0];if(old[b0]!=null&&old[b0]!==S.tvdeal[b0])news(`📺 New TV deals for Season ${S.season}: ${brands().map(b=>`${nameOf(b)} ${money(S.tvdeal[b])}/wk`).join(', ')}.`)}Object.values(S.w).forEach(w=>{w.pop0=w.pop;w.w0=w.w||0;w.l0=w.l||0});S.tagW={};S.bestP=null;S.mand={};S.aiShot=null}
function seasonMigrate(st){if(!st||!st.w||st.v80)return;st.v80=1;const S0=S;S=st;try{
 if(!st.fans0){st.fans0={};for(const b in st.fans)st.fans0[b]=st.season===1?250000:st.fans[b]}
 if(st.phase==='season'&&!st.mand)mandTick();
 if(st.phase==='over'&&!st.awards){st.awards=seasonAwards();st.offs=offseasonPlan()}
 /* a save sitting on Forbidden Door week was dealt a TV card before it became a PPV: deal the PPV card */
 if(st.phase==='season'&&!ON()&&st.week===FD_WEEK&&st.card&&st.card.p&&!st.card.p.some(sl=>sl.k==='chal')){st.card={p:newCard().p,ai:null}}
 if(st.phase==='season'||st.phase==='over')news('🆕 New in this version: match finishes, the rub, title reigns, TV specials, tournaments, the Casino Gauntlet, Forbidden Door, network mandates and an offseason. Each season\'s fan war is now decided by fans gained that season. See How to Play.')}finally{S=S0}}

/* ===================== AWARDS & THE OFFSEASON ===================== */
/* veterans' birth years, so the clock catches up with them over a long save */
const BORN={'billy-gunn':1963,'dustin-rhodes':1969,'chris-jericho':1970,'christian-cage':1973,'adam-copeland':1973,'shelton-benjamin':1975,'tomohiro-ishii':1975,'lance-archer':1977,'samoa-joe':1979,'claudio-castagnoli':1980,'kofi-kingston':1981,'eddie-kingston':1981,'kota-ibushi':1982,'rocky-romero':1982,'kenny-omega':1983,'roderick-strong':1983,'mark-briscoe':1984,'orange-cassidy':1984,'brian-cage':1984,'jon-moxley':1985,'jay-lethal':1985,'matt-jackson':1985,'tommaso-ciampa':1985,'serena-deeb':1986,'thunder-rosa':1986,'austin-creed':1986,'kazuchika-okada':1987,'hikaru-shida':1987};
const ageOf=(w,season)=>BORN[w.id]?2026+(season||S.season)-1-BORN[w.id]:null;
function retireOdds(w){const a=ageOf(w);if(a==null)return 0;const d=durOf(w);let p=a>=55?.3:a>=50?.15:a>=46?.06:a>=42?.015:0;if(d<45)p*=1.5;return Math.min(.6,p)}
function seasonAwards(){const all=Object.values(S.w).filter(w=>w.own);const sc=w=>(w.pop-(w.pop0||w.pop))*1.2+((w.w||0)-(w.w0||0))*.8-((w.l||0)-(w.l0||0))*.3+(isChamp(w.id)?6:0)+w.pop*.15;
 const top=(l,f)=>l.slice().sort((a,b)=>f(b)-f(a))[0];const A=[];const add=(t,i,w,why)=>{if(w)A.push({t,i,id:w.id,own:w.own,why})};
 const m=top(all.filter(w=>w.g==='M'),sc),f=top(all.filter(w=>w.g==='F'),sc);
 add('Wrestler of the Year','🏅',m,m&&`${(m.w||0)-(m.w0||0)}–${(m.l||0)-(m.l0||0)} this season, popularity ${Math.round(m.pop)}`);
 add("Women's Wrestler of the Year",'🏅',f,f&&`${(f.w||0)-(f.w0||0)}–${(f.l||0)-(f.l0||0)} this season, popularity ${Math.round(f.pop)}`);
 const br=top(all,w=>w.pop-(w.pop0||w.pop));if(br&&br.pop-(br.pop0||br.pop)>=5)add('Breakout Star','🚀',br,`+${Math.round(br.pop-br.pop0)} popularity`);
 const rk=top(all.filter(w=>w.rookie&&w.ring>=45),w=>w.pop-(w.pop0||w.pop)+w.ring*.1);if(rk)add('Rookie of the Year','🌱',rk,`In-ring ${Math.round(rk.ring)}, popularity ${Math.round(rk.pop)}`);
 const tg=Object.entries(S.tagW||{}).sort((a,b)=>b[1]-a[1])[0];
 let feud=null;(S.fha||[]).filter(f=>f.s===S.season).forEach(f=>{const pk=Math.max(0,...f.l.map(x=>x.h||0));if(!feud||pk>feud.pk)feud={a:f.a,b:f.b,pk,how:f.how}});for(const k in S.heat){if(!feud||S.heat[k]>feud.pk){const [a,b]=k.split('|');feud={a,b,pk:S.heat[k],how:'Still going'}}}
 return {s:S.season,list:A,motY:S.best,poty:S.bestP||null,tag:tg&&tg[1]>=3?{ids:tg[0].split('|'),n:tg[1]}:null,feud:feud&&S.w[feud.a]&&S.w[feud.b]?feud:null}}
/* what the offseason will bring: decided when the season ends, so the GM can see it coming */
function offseasonPlan(){const ret=[],dec=[],call=[];
 Object.values(S.w).forEach(w=>{const a=ageOf(w,S.season+1);if(a==null)return;if(Math.random()<retireOdds(w))ret.push(w.id);else if(a>=40)dec.push({id:w.id,d:a>=50?3:a>=45?2:1})});
 Object.values(S.w).forEach(w=>{if(w.own&&w.rookie&&w.ring>=60)call.push(w.id)});
 return {ret,dec,call}}
function offseasonApply(notes){const o=S.offs||{ret:[],dec:[],call:[]};const A=S.awards;
 if(A){A.list.forEach(x=>{const w=S.w[x.id];if(w){w.pop=clamp(w.pop+2,1,100);w.mor=clamp(w.mor+10,0,100)}});(S.hof=S.hof||[]).push({s:A.s,l:A.list.map(x=>({t:x.t,n:S.w[x.id]?S.w[x.id].name:'?'}))})}
 o.dec.forEach(x=>{const w=S.w[x.id];if(!w)return;w.ring=Math.max(40,w.ring-x.d);w.pot=Math.min(w.pot,Math.max(w.ring,w.pot-x.d))});
 o.call.forEach(id=>{const w=S.w[id];if(!w||!w.own)return;w.rookie=false;w.pop=clamp(w.pop+6,1,100);w.mor=clamp(w.mor+10,0,100);w.deb=AW();news(`📣 ${w.name} has been called up from developmental — expect a big debut.`)});
 o.ret.forEach(id=>{const w=S.w[id];if(!w)return;const n=`🎖️ ${w.name} has retired. Thank you for the memories.`;news(n);(S.retired=S.retired||[]).push({n:w.name,s:S.season});purgeW(id)});
 S.offs=null;S.awards=null}
/* remove a wrestler from the world entirely (retirement), cleaning up everything that points at them */
function purgeW(id){const st=S;if(!st.w[id])return;Object.values(st.titles||{}).forEach(t=>{if(t.holders.includes(id)){t.holders=[];news(`🏆 The ${t.n} title has been vacated.`)}});
 delete st.w[id];(st.teams||[]).forEach(t=>t.m=t.m.filter(x=>x!==id));['heat','chem','mh','mhx','ph','pht','fs','fh','rin','h2h','beef'].forEach(k=>{if(st[k])for(const x in st[k])if(x.split('|').includes(id))delete st[k][x]});
 if(st.fa)delete st.fa[id];st.training=(st.training||[]).filter(t=>t.id!==id);st.promises=(st.promises||[]).filter(p=>p.a!==id&&p.b!==id);if(st.priv)for(const k in st.priv){const x=st.priv[k];if(x){if(x.training)x.training=x.training.filter(t=>t.id!==id);if(x.promises)x.promises=x.promises.filter(p=>p.a!==id&&p.b!==id);if(x.crisis&&(x.crisis.a===id||x.crisis.b===id))x.crisis=null}}
 if(st.crisis&&(st.crisis.a===id||st.crisis.b===id))st.crisis=null;if(st.fha)st.fha=st.fha.filter(f=>f.a!==id&&f.b!==id)}
function awardsHtml(){const A=S.awards;if(!A)return '';const nm=id=>S.w[id]?esc(S.w[id].name):'?';const mark=b=>b?`<span class="tg ${b==='p'?'good':''}">${b==='p'?'You':esc(nameOf(b))}</span>`:'';
 return `<div class="card"><div class="h small">🏆 Season ${A.s} awards</div>${A.list.map(x=>`<div class="row sb" style="margin:6px 0"><span>${x.i} <span class="muted tiny">${esc(x.t)}</span><br><b>${nm(x.id)}</b> ${mark(x.own)}<br><span class="muted tiny">${esc(x.why||'')}</span></span></div>`).join('')}
 ${A.tag?`<div style="margin:6px 0">🤝 <span class="muted tiny">Tag Team of the Year</span><br><b>${A.tag.ids.map(nm).join(' & ')}</b> <span class="muted tiny">· ${A.tag.n} wins together</span></div>`:''}
 ${A.feud?`<div style="margin:6px 0">🔥 <span class="muted tiny">Feud of the Year</span><br><b>${nm(A.feud.a)} vs ${nm(A.feud.b)}</b> <span class="muted tiny">· peaked at ${Math.round(A.feud.pk)} heat · ${esc(A.feud.how)}</span></div>`:''}
 ${A.motY?`<div style="margin:6px 0">⭐ <span class="muted tiny">Match of the Year</span><br>${esc(A.motY.t)} <span class="stars">${stars(A.motY.s)}</span></div>`:''}
 ${A.poty?`<div style="margin:6px 0">🎤 <span class="muted tiny">Promo of the Year</span><br>${esc(A.poty.t)} <span class="stars">${stars(A.poty.s)}</span></div>`:''}
 <div class="muted tiny">Award winners start next season with a popularity and morale boost.</div></div>`}
function offseasonHtml(){const o=S.offs;if(!o)return '';const nm=id=>S.w[id]?esc(S.w[id].name):'?';const own=id=>S.w[id]&&S.w[id].own;
 const exp=ownList('p').filter(w=>w.con<=10).sort((a,b)=>a.con-b.con);
 const ret=o.ret.filter(id=>S.w[id]);const dec=o.dec.filter(x=>S.w[x.id]&&own(x.id)==='p');const call=o.call.filter(id=>own(id)==='p');
 return `<div class="card"><div class="h small">📋 The offseason</div>
 ${ret.length?`<div class="mur"><div class="muh">🎖️ Retirements</div>${ret.map(id=>`<div class="tiny">${nm(id)} <span class="muted">(age ${ageOf(S.w[id],S.season+1)}${own(id)?' · '+esc(nameOf(own(id))):''})</span> is hanging up the boots.</div>`).join('')}</div>`:''}
 ${dec.length?`<div class="mur"><div class="muh">⏳ Father Time</div>${dec.map(x=>`<div class="tiny">${nm(x.id)} loses ${x.d} in-ring (age ${ageOf(S.w[x.id],S.season+1)}).</div>`).join('')}</div>`:''}
 ${call.length?`<div class="mur"><div class="muh">📣 Called up from developmental</div>${call.map(id=>`<div class="tiny">${nm(id)} — debut buzz and a popularity bump next season.</div>`).join('')}</div>`:''}
 <div class="mur"><div class="muh">✍️ Contracts expiring soon</div>${exp.length?exp.map(w=>`<div class="row sb" style="margin:4px 0"><span class="tiny"><b>${esc(w.name)}</b> · ${Math.max(0,w.con)} wk${w.con===1?'':'s'} left · asks ${money(askSal(w))}/wk</span><button class="mini" onclick="resign('${w.id}')">Re-sign ${money(resignCost(w))}</button></div>`).join(''):'<div class="tiny muted">Nobody — your roster is locked up.</div>'}</div>
 ${!ret.length&&!dec.length&&!call.length?'<div class="tiny muted">A quiet offseason: no retirements or call-ups this year.</div>':''}</div>`}

/* ===================== PICK YOUR OWN FIELD ===================== */
/* the GM chooses the four entrants (and, for a knockout, the seeding) from three weeks out until the first matches air */
function tourCanPick(k){const D=TOURS[k];if(!D||!S||S.phase!=='season')return false;const first=tourFirst(D);const t=tourState('p',k);
 return S.week>=first-3&&S.week<=first&&!t.res.length}
let TP=null;
function openTourPick(k){if(mpLocked())return;if(!tourCanPick(k))return toast('That field is already set.');const t=tourState('p',k);
 TP={k,sel:(t.ent||[]).filter(id=>S.w[id]&&S.w[id].own==='p')};renderTourPick()}
function renderTourPick(){const D=TOURS[TP.k];const ct=D.title&&S.titles[D.title];const pz=D.prize&&S.titles[D.prize];
 const l=ownList('p').filter(w=>w.g===D.g).sort((a,b)=>(a.inj?1:0)-(b.inj?1:0)||(b.pop+b.ring)-(a.pop+a.ring));
 const row=w=>{const i=TP.sel.indexOf(w.id);const on=i>=0;const champ=ct&&ct.holders.includes(w.id);const isPz=pz&&pz.holders.includes(w.id);const dis=w.inj||isPz;
  return `<button class="lr ${dis?'out':''}" style="width:100%;margin:4px 0;${on?'box-shadow:inset 0 0 0 2px var(--gold);background:rgba(232,190,90,.12)':''}" ${dis?'disabled':''} onclick="tpToggle('${w.id}')">${face(w)}<span class="lrn"><b class="${w.al==='f'?'face':'heel'}">${esc(w.name)}</b><span class="muted tiny">${STYLE_N[w.st]} · Pop ${Math.round(w.pop)} · Ring ${Math.round(w.ring)}${champ?` · 🏆 ${esc(ct.n)} champ`:''}${isPz?` · already ${esc(pz.n)} champ`:''}</span></span><span class="lrs">${w.inj?'OUT':on?`<b class="gold">${D.rr?'✓ IN':'#'+(i+1)}</b>`:''}</span></button>`};
 const ready=TP.sel.length===4;
 openModal(`<div class="h mhd">${D.i} ${esc(D.n)}</div><p class="muted" style="margin-top:0">Pick four ${D.g==='M'?'men':'women'}. ${D.rr?'Everyone wrestles everyone once (3 points a win); the top two meet in the final.':'Tap them in seeding order: #1 meets #4 and #2 meets #3 in the semi-finals.'}${ct&&ct.holders.length&&S.w[ct.holders[0]].own==='p'?` Leave your ${esc(ct.n)} champion out and the final won't be for the title.`:''}</p>
 <div class="card"><div class="row sb"><b>${TP.sel.length} of 4 picked</b><button class="mini" onclick="tpAuto()">Auto-pick</button></div>${TP.sel.length?`<div class="tiny" style="margin-top:6px">${TP.sel.map((id,i)=>`${D.rr?'':(i+1)+'. '}${esc(S.w[id].name)}`).join(D.rr?' · ':' &nbsp; ')}</div>`:''}</div>
 <div>${l.map(row).join('')}</div>
 <button class="btn" ${ready?'':'disabled'} onclick="tpSave()">Lock in the field</button><button class="btn ghost" onclick="TP=null;closeModal();render()">Cancel</button>`)}
function tpToggle(id){const i=TP.sel.indexOf(id);if(i>=0)TP.sel.splice(i,1);else if(TP.sel.length<4)TP.sel.push(id);else return toast('Four is a full field — tap someone to take them out first.');renderTourPick()}
function tpAuto(){const D=TOURS[TP.k];const pz=D.prize&&S.titles[D.prize];const champ=pz&&pz.holders[0];const ct=D.title&&S.titles[D.title];const sel=[];
 const th=ct&&ct.holders[0]&&S.w[ct.holders[0]];if(th&&th.own==='p'&&!th.inj&&th.g===D.g)sel.push(th.id);
 ownList('p').filter(w=>w.g===D.g&&!w.inj&&w.id!==champ).sort((x,y)=>(y.pop+y.ring)-(x.pop+x.ring)).forEach(w=>{if(sel.length<4&&!sel.includes(w.id))sel.push(w.id)});TP.sel=sel;renderTourPick()}
function tpSave(){if(!TP||TP.sel.length!==4)return;const k=TP.k,D=TOURS[k];const t=tourState('p',k);t.ent=TP.sel.slice();t.pick=1;t.lock=S.week>=tourFirst(D)?1:0;TP=null;
 const msg=[];if(S.week===tourFirst(D)&&S.card&&S.card.p)msg.push(...tourReslot(k));
 news(`${D.i} ${S.gm} set the ${D.n} field: ${t.ent.map(id=>S.w[id].name).join(', ')}.`);save();closeModal();render();toast(`${D.i} Field locked in.${msg.length?' '+msg.join(' '):''}`)}
/* the first round is already on this week's card: swap in the new field's matches, freeing anyone they clash with */
function tourReslot(k){const c=S.card.p;const msg=[];const free=[];c.forEach((sl,i)=>{if(sl.k==='match'&&sl.d&&sl.d.tour&&sl.d.tour.k===k){sl.d=null;free.push(i)}});
 const ms=tourPairs('p').filter(x=>x.k===k).map(tourMatch);const ids=new Set(ms.flatMap(m=>m.sides.flat()));
 c.forEach((sl,i)=>{if(!sl.d)return;const who=sl.k==='match'?sl.d.sides.flat():sl.k==='promo'?[sl.d.a,sl.d.b]:sl.k==='chal'?[sl.d.c]:sl.k==='xo'?[sl.d.a]:[];
  if(sl.k==='match'&&sl.d.tour)return;if(who.some(id=>ids.has(id))){sl.d=null;msg.push(`Segment ${i+1} was cleared — someone in it is now in the tournament.`);if(sl.k==='match')free.push(i)}});
 const slots=free.concat(c.map((sl,i)=>sl.k==='match'&&!sl.d&&!free.includes(i)?i:-1).filter(i=>i>=0)).sort((a,b)=>b-a);
 ms.forEach(m=>{const i=slots.shift();if(i!=null)c[i].d=m});return msg}

/* ===================== WEEKLY BRIEFING (v95) =====================
 The first time you open Home each week, a briefing lands on your desk: what needs your attention before it becomes
 a problem — contracts running out, unhappy or burnt-out talent, real backstage heat, feuds going stale, what's
 coming on the calendar, and free agents about to leave the market. It can be reopened from Home any time. */
const BRIEF_KEY='tks_brief';
function briefId(){return ((typeof LMP!=='undefined'&&LMP&&LMP.code)||'solo')+':'+(S.gm||'')+':'+S.season}
function briefSeen(){try{const m=JSON.parse(localStorage.getItem(BRIEF_KEY)||'{}');return m[briefId()]===AW()}catch(e){return false}}
function briefMark(){try{const m=JSON.parse(localStorage.getItem(BRIEF_KEY)||'{}');m[briefId()]=AW();const ks=Object.keys(m);if(ks.length>20)delete m[ks[0]];localStorage.setItem(BRIEF_KEY,JSON.stringify(m))}catch(e){}}
function briefItems(){const mine=ownList('p');const sec=(typeof ocBrief==='function'?ocBrief():[]).concat(typeof pitchBrief==='function'?pitchBrief():[]).concat(typeof dealBrief==='function'?dealBrief():[]);const nm=w=>`<a href="#" onclick="closeModal();showW('${w.id}');return false">${esc(w.name)}</a>`;
 /* contracts */
 const exp=mine.filter(w=>w.con<=4||(w.con<=8&&w.pop>=70)).sort((a,b)=>a.con-b.con);
 if(exp.length)sec.push({i:'✍️',t:'Contracts running out',u:exp.some(w=>w.con<=2),rows:exp.map(w=>`<div class="row sb brow"><span>${nm(w)} · <b class="${w.con<=2?'bad':''}">${Math.max(0,w.con)} wk${w.con===1?'':'s'}</b>${w.mor<30?' 😠':''}<br><span class="muted tiny">${w.neg&&w.neg.no>AW()?'Walked away from talks · back at the table week '+wkOf(w.neg.no):'Wants about '+money(askSal(w))+'/wk'+(dealWantList(w).length&&w.pop>=58?' plus a say in things':'')}${w.con<=1?' · walks after this week if not re-signed':''}</span></span><button class="mini" onclick="closeModal();dealNegotiate('${w.id}')">Negotiate</button></div>`)});
 /* morale */
 const sad=mine.filter(w=>!w.inj&&w.mor<45).sort((a,b)=>a.mor-b.mor).slice(0,6);
 if(sad.length)sec.push({i:'😠',t:'Morale to watch',u:sad.some(w=>w.mor<SIT_MOR),rows:sad.map(w=>`<div class="brow">${nm(w)} · morale <b class="${w.mor<SIT_MOR?'bad':''}">${Math.round(w.mor)}</b><br><span class="muted tiny">${w.mor<SIT_MOR?'Could go off-script in a match — ':''}${w.mor<10?'may demand their release · ':''}a win, a main event spot or a title shot will help</span></div>`)});
 /* real backstage heat */
 const bf=[];for(let i=0;i<mine.length;i++)for(let j=i+1;j<mine.length;j++){const v=beefOf(mine[i].id,mine[j].id);if(v>=25)bf.push([mine[i],mine[j],v])}
 bf.sort((a,b)=>b[2]-a[2]);
 if(bf.length)sec.push({i:'☢️',t:'Backstage drama',u:bf.some(x=>x[2]>=BEEF_MIN),rows:bf.slice(0,4).map(([A,B,v])=>`<div class="brow">${nm(A)} & ${nm(B)} · real heat <b class="${v>=BEEF_MIN?'bad':''}">${v}</b><br><span class="muted tiny">${v>=BEEF_MIN?'Putting them in a ring together could turn ugly':'Simmering — keep them apart and it will cool off'}</span></div>`)});
 /* feuds going stale */
 const fs=[];for(const k in S.heat){const f=S.fs&&S.fs[k];const [a,b]=k.split('|');const A=S.w[a],B=S.w[b];if(!f||f.paid||!A||!B||(A.own!=='p'&&B.own!=='p')||S.heat[k]<20)continue;const age=AW()-f.start;if(f.stale||age>=5)fs.push({A,B,h:S.heat[k],left:8-age,stale:f.stale})}
 if(fs.length){const np=nextPPV();sec.push({i:'🥱',t:'Feuds that need a payoff',u:fs.some(x=>x.stale),rows:fs.sort((a,b)=>a.left-b.left).slice(0,5).map(x=>`<div class="brow">${nm(x.A)} vs ${nm(x.B)} · heat <b>${Math.round(x.h)}</b><br><span class="muted tiny">${x.stale?'Already stale and cooling fast':`Goes stale in ${Math.max(1,x.left)} week${x.left===1?'':'s'}`}${np?` — blow it off at ${esc(np.n)}${np.in?` (${np.in} wk${np.in===1?'':'s'})`:' (this week)'}`:''}</span></div>`)})}
 /* calendar */
 const cal=[];const np=nextPPV();if(np)cal.push(`📅 <b>${esc(np.n)}</b> ${np.in?`in ${np.in} week${np.in===1?'':'s'}`:'is <b>this week</b>'}`);
 for(const k in TOURS){const D=TOURS[k];const first=tourFirst(D);const d=first-S.week;if(d>=0&&d<=3)cal.push(`${D.i} <b>${esc(D.n)}</b> ${d?`starts in ${d} week${d===1?'':'s'} — pick your field`:'starts <b>this week</b>'}`);else if(S.week>first&&S.week<=D.final)cal.push(`${D.i} <b>${esc(D.n)}</b> is under way${S.week===D.final?' — the final is this week':''}`)}
 const md=S.mand&&S.mand.p;if(md&&!md.done&&MANDS[md.k]){const l=md.due-S.week;cal.push(`📺 Network mandate: <b>${esc(MANDS[md.k].n)}</b> — ${l<=0?'due tonight':`${l} week${l>1?'s':''} left`}`)}
 const vac=Object.values(S.titles).filter(t=>!t.holders.length);if(vac.length)cal.push(`👑 Vacant: ${vac.map(t=>esc(t.n)).join(', ')}`);
 const idle=Object.values(S.titles).filter(t=>t.holders.length&&S.w[t.holders[0]]&&S.w[t.holders[0]].own==='p'&&S.week-t.last>=4);if(idle.length)cal.push(`🏆 Not defended in a while (losing prestige soon): ${idle.map(t=>esc(t.n)).join(', ')}`);
 if(cal.length)sec.push({i:'🗓️',t:'Coming up',rows:cal.map(x=>`<div class="brow">${x}</div>`)});
 /* health */
 const inj=mine.filter(w=>w.inj).sort((a,b)=>a.inj-b.inj);const tired=mine.filter(w=>!w.inj&&w.fat>=FAT_RISK);
 if(inj.length||tired.length)sec.push({i:'🚑',t:'Health',rows:inj.map(w=>`<div class="brow">${nm(w)} · ${w.susp?'suspended':'injured'} — back in ${w.inj} week${w.inj===1?'':'s'}</div>`).concat(tired.map(w=>`<div class="brow">${nm(w)} · 🔋 exhausted — rest them or risk an injury</div>`))});
 /* free agents leaving */
 const fa=Object.values(S.w).filter(w=>onMarket(w)&&!w.cw&&faLeft(w)===1&&w.pop>=55).sort((a,b)=>b.pop-a.pop).slice(0,4);
 if(fa.length)sec.push({i:'🆕',t:'Last week to sign',rows:fa.map(w=>`<div class="brow">${nm(w)} · POP ${Math.round(w.pop)} · signs for ${money(signCost(w))}</div>`)});
 return sec}
function briefHtml(){const sec=briefItems();const sh=curShow();
 return `<div class="h mhd">📰 Week ${S.week} briefing</div><p class="muted" style="margin-top:0">${esc(sh.ppv?sh.name+' is this week.':'Here\'s what needs your attention before you book.')}</p>
 ${sec.length?sec.map(s=>`<div class="card brief ${s.u?'urgent':''}"><div class="h small">${s.i} ${s.t}${s.u?' <span class="tg bad">Act now</span>':''}${s.tag?` <span class="tg good">${s.tag}</span>`:''}</div>${s.rows.join('')}</div>`).join(''):'<div class="card"><div class="muted">All quiet in the front office. Go book a great show.</div></div>'}
 <button class="btn" onclick="closeModal();go('book')">Book the show</button><button class="btn sec" onclick="closeModal()">Close</button>`}
function openBrief(){if(!S||S.phase!=='season')return;briefMark();openModal(briefHtml())}
function briefResign(id){resign(id);openBrief()}
/* show it once per week, the first time Home is on screen with nothing else open */
function briefAuto(){if(!S||S.phase!=='season'||tab!=='home'||(typeof TV!=='undefined'&&TV)||briefSeen())return;if(typeof ME!=='undefined'&&ME||typeof PS!=='undefined'&&PS||typeof LQ!=='undefined'&&LQ)return;
 if(ON()&&!myTurn())return;const m=document.getElementById('modal');if(!m||!m.classList.contains('hidden'))return;setTimeout(()=>{const m2=document.getElementById('modal');if(S&&tab==='home'&&m2&&m2.classList.contains('hidden')&&!briefSeen())openBrief()},350)}

/* v111: star ratings were recalibrated (a solid show is ~3½★ now, 5★ is rare) and fan growth slows as a company gets big */
function starMigrate(st){if(!st||!st.w||st.v111)return;st.v111=1;if(st.phase!=='season'&&st.phase!=='over')return;const S0=S;S=st;try{news('📏 Star ratings have been recalibrated: a solid show now rates about 3½★, a great one 4★ and up, and 5★ is rare. Fan growth also slows as your company gets bigger.')}finally{S=S0}}
