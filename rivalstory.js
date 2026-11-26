/* ===================== THE RIVAL'S ARCS AND PROMISES (v492) =====================
   The offline rival earns fans the way you do. It runs arcs on your arc rules (pays the arc price, needs build segments before a
   deadline, gets the same build-step and payoff star bonus, casual hook and fan reward by build quality, and its wrestlers lose
   morale when one fails), and it makes promises it has to keep on the next PPV (the same fans for keeping or breaking one).
   No storylines or screens of its own: its arcs are the programs it books (index.html aiProgs). Never used in online leagues. */
(function(){
/* arcs: slots · rest: weeks a slot waits after an arc ends · prom: standing PPV-spot promises · goal/chant: how often its
   booking goes after the week's goal and the crowd's chant */
const RV={easy:{arcs:0,rest:0,prom:0,goal:0,chant:0},normal:{arcs:2,rest:8,prom:1,goal:.3,chant:.3},hard:{arcs:2,rest:0,prom:2,goal:.9,chant:.9}};
const RV_NEED=3,RV_LOST=12000;
/* on Normal the rival eases in during your first season: nothing extra before week RAMP[0], one story until week RAMP[1] */
const RAMP=[7,15];
const rvDiff=()=>RV[S.diff]?S.diff:'normal';
const cfg=()=>{if(!S||(typeof ON==='function'&&ON()))return null;const c=RV[rvDiff()];if(rvDiff()!=='normal'||AW()>=RAMP[1])return c;return AW()<RAMP[0]?{...c,arcs:0,prom:0,goal:0,chant:0}:{...c,arcs:1}};
window.rvRamp=T=>rvDiff()!=='normal'||AW()>=RAMP[1]?T:{...T,n:AW()<RAMP[0]?0:Math.min(T.n,1)};
window.RV=RV;
const {aPopF,aRiseF,aEase,ARC_SLACK,ARC_PAY0,ARC_PAYQ,ARC_PAYMAX,ARC_PAY_PPV,ARC_BUILD,ARC_STORYP,ARC_STORYH,ARC_GREAT,ARC_FBQ0,ARC_FBQLO,ARC_FANS,ARC_RISEF,ARC_RISEPOP,ARC_FAIL}=window.ARC_RULES;
const ended=()=>{S.rvEnds=(S.rvEnds||[]).concat([AW()]).slice(-6)};
const note=t=>{S.rvNotes=(S.rvNotes||[]).concat([t]);news(t)};
const aired=()=>!!window.__rvAir;
/* an arc's state lives on the program: st = build segment ratings */
const live=()=>cfg()&&cfg().arcs?(S.aiProg||[]).filter(p=>p.arc&&!p.paid):[];
const built=p=>p.st.length>=RV_NEED;
const has=(ids,p)=>ids.includes(p.a)||ids.includes(p.b);
const both=(ids,p)=>ids.includes(p.a)&&ids.includes(p.b);
const lead=p=>S.w[p.a].pop<=S.w[p.b].pop?S.w[p.a]:S.w[p.b];
/* start: pay the same price you would for building that wrestler */
window.rvArcStart=function(p){const c=cfg();if(!c||!c.arcs||p.arc||S.phase!=='season')return;const cooling=(S.rvEnds||[]).filter(w=>AW()-w<c.rest).length;if(live().length+cooling+heldReady().length>=c.arcs||(S.rvHeld||[]).some(h=>h.a===p.a||h.b===p.a||h.a===p.b||h.b===p.b))return;const w=lead(p);
 const cost=Math.max(5,Math.round(pCost()*3*aPopF(w.pop)/5)*5);if((S.money.ai||0)-cost<(typeof bgReserve==='function'?bgReserve('ai'):0))return;S.money.ai-=cost;p.cost=cost;p.arc=1;p.st=[];p.end=AW()+RV_NEED+ARC_SLACK};
/* v507: like you, the rival holds a story when one of its two is unavailable (it always chooses to). It frees the slot,
   keeps the build, and comes back to the next open slot with the weeks it had left (at least one a stop plus the payoff).
   Lose one of them for good and the unfinished share of the price comes back. */
const out=id=>{const w=S.w[id];return !!(w&&w.inj>0&&!(w.angle!=null&&AW()<w.angle+2))};
const gone=p=>[p.a,p.b].some(i=>!S.w[i]||S.w[i].own!=='ai'||S.w[i].retd);
function heldReady(){return (S.rvHeld||[]).filter(p=>!gone(p)&&!out(p.a)&&!out(p.b))}
const share=p=>Math.max(0,Math.round((p.cost||0)*(RV_NEED-Math.min(p.st.length,RV_NEED)+1)/(RV_NEED+1)));
window.rvHoldWeek=function(){const c=cfg();if(!c||!c.arcs||S.phase!=='season')return;S.rvHeld=S.rvHeld||[];
 const all=(S.aiProg||[]).filter(p=>p.arc&&!p.paid);
 for(const p of all.filter(p=>gone(p)||out(p.a)||out(p.b))){S.aiProg=S.aiProg.filter(x=>x!==p);if(gone(p))S.money.ai+=share(p);else{p.left=Math.max(p.end-AW()+1,RV_NEED-Math.min(p.st.length,RV_NEED)+1);S.rvHeld.push(p)}}
 S.rvHeld=S.rvHeld.filter(p=>{if(!gone(p))return true;S.money.ai+=share(p);return false});
 for(const p of heldReady()){if(live().length>=c.arcs)break;S.rvHeld=S.rvHeld.filter(x=>x!==p);p.end=AW()+p.left-1;p.w=AW();delete p.left;
  S.aiProg=[p].concat((S.aiProg||[]).filter(x=>![x.a,x.b].some(i=>i===p.a||i===p.b)))}};
/* the same star bonus yours get: a little for each build step, a bigger one on the payoff */
function bonus(kind,ids,ppv){let b=0;for(const p of live()){if(built(p)){if(kind==='match'&&both(ids,p)&&AW()>(p.ready||0)){const q=avg(p.st);let x=ARC_PAY0+clamp((q-3)*ARC_PAYQ,0,ARC_PAYMAX);if(ppv)x*=ARC_PAY_PPV;return {st:Math.round(x*100)/100,pay:p}}}else if(p.st.length&&has(ids,p))b=Math.max(b,ARC_BUILD*p.st.length)}return {st:b,pay:null}}
const HEAT=new WeakMap();
function pre(obj,kind,ids){if(!aired()||!ids.length||!ids.every(i=>S.w[i]&&S.w[i].own==='ai'))return null;const r=bonus(kind,ids,!!curShow().ppv);const n=r.pay?ARC_STORYP:Math.max(0,...live().filter(p=>p.st.length&&has(ids,p)).map(p=>ARC_STORYH[Math.min(p.st.length,ARC_STORYH.length)-1]));if(n)HEAT.set(obj,n);return r.st?{st:r.st,pay:[]}:null}
const mp=window.arcMatchPre;window.arcMatchPre=function(m,mctx){const ids=m.sides.flat();return pre(m,'match',ids)||(mp?mp.apply(this,arguments):null)};
const pp=window.arcPromoPre;window.arcPromoPre=function(q){const ids=[q.a,q.b].filter(Boolean);return pre(q,'promo',ids)||(pp?pp.apply(this,arguments):null)};
/* a running arc is a story the casuals follow */
const fs=fbSeg;fbSeg=window.fbSeg=function(m){const r=fs.apply(this,arguments);const h=HEAT.get(m);if(h&&r)r.h=Math.max(r.h||0,h);return r};
const fanF=()=>typeof fanGrowF==='function'?fanGrowF(S.fans.ai):1;
/* after the rival's show: move its arcs on, pay them off, and settle its promises */
function settle(segs,ppv){const c=cfg();if(!c)return;
 for(const p of live()){const A=lead(p);let paid=false;
  if(built(p)&&AW()>(p.ready||0)){const s=segs.find(s=>s.k==='match'&&both(s.ids,p));if(s){const q=avg(p.st);const great=q>=ARC_GREAT-aEase(A);const bq=great?1:ARC_FBQ0+(1-ARC_FBQ0)*clamp((q-ARC_FBQLO)/(ARC_GREAT-aEase(A)-ARC_FBQLO),0,1);const rf=aRiseF(A);
     const f=Math.round(ARC_FANS*bq*(great?1.3:1)*(1+ARC_RISEF*rf)*fanF()/100)*100;fbHit('ai',[S.w[p.a],S.w[p.b]],f);if(rf>0)popx(A,ARC_RISEPOP*rf*(great?1.25:1));mor(A,great?10:6);p.paid=1;paid=true;ended();
     note(`📖 ${S.rival}: ${S.w[p.a].name} and ${S.w[p.b].name}'s story paid off${great?' in a big way':''} (+${fmtFans(f)} fans).`)}}
  if(paid)continue;
  if(!built(p)){const s=segs.filter(s=>both(s.ids,p));if(s.length){p.st.push(Math.max(...s.map(x=>x.st)));if(built(p)){p.ready=AW();p.end=Math.max(p.end,AW()+ARC_SLACK+4)}}}
  if(AW()>=p.end){mor(S.w[p.a],-ARC_FAIL);mor(S.w[p.b],-4);p.arc=0;p.paid=1;ended();note(`📖 ${S.rival} let ${S.w[p.a].name} and ${S.w[p.b].name}'s story fall apart.`)}}
 if(ppv){for(const pr of (S.rvProm||[]).filter(x=>x.due<=AW())){const w=S.w[pr.id];if(!w||w.own!=='ai'||w.inj)continue;
   if(segs.some(s=>s.k==='match'&&s.ids.includes(pr.id))){const f=Math.round(DELIVER_FANS*fanF()/100)*100;fbHit('ai',[w],f);mor(w,4);note(`📖 ${S.rival} kept its promise: ${w.name} got the PPV spot (+${fmtFans(f)} fans).`)}
   else{fbHit('ai',[w],-RV_LOST);mor(w,-6);note(`💔 ${S.rival} broke its promise of a PPV spot to ${w.name} (−${fmtFans(RV_LOST)} fans).`)}}
  S.rvProm=(S.rvProm||[]).filter(x=>x.due>AW())}}
/* between PPVs it promises PPV spots to wrestlers who've been short of the spotlight */
window.rvPromise=function(){const c=cfg();if(!c||!c.prom||S.phase!=='season')return;S.rvProm=(S.rvProm||[]).filter(x=>x.due>=AW()&&S.w[x.id]&&S.w[x.id].own==='ai');if(S.rvProm.length>=c.prom)return;const np=nextPPV();if(!np||np.in<1)return;
 const taken=new Set(S.rvProm.map(x=>x.id).concat((S.aiProg||[]).flatMap(p=>[p.a,p.b])));
 const l=Object.values(S.w).filter(w=>w.own==='ai'&&!w.inj&&!taken.has(w.id)&&w.pop>=60&&w.pop<85).sort((a,b)=>a.mor-b.mor||b.pop-a.pop);if(l.length)S.rvProm.push({id:l[0].id,due:AW()+np.in})};
/* ---- weekly goals and crowd chants: the same ones you get, same rewards. The rival's booking goes after them by changing
   one ordinary match on its card (never a title, program, tournament, promised or stipulation match). ---- */
window.rvGoals=b=>{const c=cfg();return !!(c&&b==='ai'&&(c.goal||c.chant))};
const tried=(o,p)=>{if(o.try==null)o.try=Math.random()<p;return o.try};
function plain(card){const prog=new Set((S.aiProg||[]).flatMap(p=>[p.a,p.b]).concat((S.rvProm||[]).map(x=>x.id)));
 return card.filter(sl=>sl&&sl.k==='match'&&sl.d&&sl.d.type==='singles'&&!sl.d.title&&!sl.d.tour&&!sl.d.ri&&(!sl.d.stip||sl.d.stip==='std')&&!sl.d.sides.flat().some(i=>prog.has(i)))
  .sort((a,b)=>sum(a)-sum(b))}
const sum=sl=>sl.d.sides.flat().reduce((x,i)=>x+S.w[i].pop,0);
const onCard=card=>new Set(card.flatMap(sl=>!sl||!sl.d?[]:sl.k==='match'?sl.d.sides.flat():[sl.d.a,sl.d.b]).filter(Boolean));
const fit=card=>{const u=onCard(card);return Object.values(S.w).filter(w=>w.own==='ai'&&!w.inj&&w.fat<FAT_RISK&&!u.has(w.id)).sort((a,b)=>b.pop-a.pop)};
const redo=(m,sides,type)=>{m.sides=sides;m.type=type||'singles';m.winner=S.w[sides[0][0]].pop+R(0,22)>=S.w[sides[1][0]].pop+R(0,22)?0:1;m.fin='clean';delete m.pin};
function chase(card,show){const c=cfg();if(!c)return;weekTick();
 const ch=S.chant&&S.chant.ai;if(ch&&ch.w===AW()&&c.chant&&tried(ch,c.chant)&&!onCard(card).has(ch.id)){const w=S.w[ch.id];if(w&&w.own==='ai'&&!w.inj&&w.fat<FAT_RISK)
   for(const sl of plain(card)){const ids=sl.d.sides.flat();const out=ids.filter(i=>S.w[i].g===w.g).sort((a,b)=>S.w[a].pop-S.w[b].pop)[0];if(out){redo(sl.d,[[w.id],[ids.find(i=>i!==out)]]);ch.mine=1;break}}}
 const g=S.goal&&S.goal.ai;if(!g||g.w!==AW()||!c.goal||!tried(g,c.goal))return;
 const ms=card.filter(sl=>sl&&sl.k==='match'&&sl.d);const free=plain(card).filter(sl=>!ch||!sl.d.sides.flat().includes(ch.id));const sl=free[0];if(!sl)return;const m=sl.d,l=fit(card);
 if(g.k==='women'&&!ms.some(s=>s.d.sides.flat().every(i=>S.w[i].g==='F'))){const f=l.filter(w=>w.g==='F').slice(0,2);if(f.length===2)redo(m,[[f[0].id],[f[1].id]])}
 else if(g.k==='tag'&&!ms.some(s=>s.d.sides[0].length>1)){const [a,b]=m.sides.flat();const mate=i=>{const x=l.find(w=>w.g===S.w[i].g&&w.id!==a&&w.id!==b&&!used.has(w.id));if(x)used.add(x.id);return x};const used=new Set();const x=mate(a),y=mate(b);if(x&&y)redo(m,[[a,x.id],[b,y.id]],'tag')}
 else if(g.k==='rookie'&&!ms.some(s=>s.d.sides.flat().some(i=>S.w[i].rookie))){const r=l.find(w=>w.rookie);if(r){const keep=m.sides.flat().find(i=>S.w[i].g===r.g)||m.sides[0][0];redo(m,[[r.id],[keep]])}}
 else if(g.k==='title'&&!ms.some(s=>s.d.title)){const u=onCard(card);for(const t of Object.values(S.titles)){const h=t.holders[0];if(t.kind!=='singles'||!h||!S.w[h]||S.w[h].own!=='ai'||S.w[h].inj||u.has(h))continue;const o=l.find(w=>w.g===t.g&&w.id!==h&&!titlesOf(w.id).some(x=>x.kind==='singles'));if(o){redo(m,[[h],[o.id]]);m.title=t.id;break}}}
 else if(g.k==='stip'&&!ms.some(s=>s.d.stip&&s.d.stip!=='std')){const k=['nodq','street','ladder','sub','tables'].find(k=>stipOk(k,m.type,!!show.ppv)&&stipPrice(k,'ai')*2<=(S.money.ai||0)&&(typeof bgLeft!=='function'||stipPrice(k,'ai')<=bgLeft('ai',card,{noProd:true})));if(k)m.stip=k}}
const ab=autoBook;autoBook=window.autoBook=function(brand,show){const card=ab.apply(this,arguments);if(brand==='ai'&&show&&S.phase==='season'){try{chase(card,show)}catch(e){console.warn('rival goals',e)}}return card};
const gc=goalCheck;goalCheck=window.goalCheck=function(b){const g=S.goal&&S.goal[b],was=g&&g.done;if(b==='ai'&&g&&cfg()&&!tried(g,cfg().goal))return;const r=gc.apply(this,arguments);if(b==='ai'&&cfg()&&g&&!was&&g.done){fbSync('ai');note(`🎯 ${S.rival} hit its weekly goal: ${GOALS[g.k].n} (+${fmtFans(g.fans)} fans).`)}return r};
const ap=airPair;airPair=window.airPair=function(){let out;S.rvNotes=[];window.__rvAir=1;try{out=ap.apply(this,arguments)}finally{window.__rvAir=0}if(out&&out.notes&&S.rvNotes.length)out.notes.push(...S.rvNotes);S.rvNotes=[];return out};
const fa=fbApply;fbApply=window.fbApply=function(b,segs,show,o){const r=fa.apply(this,arguments);if(b==='ai'&&cfg()){try{settle(segs,!!(show&&show.ppv))}catch(e){console.warn('rival story',e)}}return r};
})();
