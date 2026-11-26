/* TKSim — the budget (v501).
   You can only buy what's in the bank. Tonight's stipulations, production and building all come out of the same money,
   so anything that costs more than what's left is greyed out on the Book screen, and every booker (Suggest the rest, the
   offline rival, the balance bots) follows the same rule. Office choices that cost money need it in the bank too.
   Commitments go ahead whatever the bank says, because their show is built around them: Blood & Guts on its night,
   Money in the Bank, and the stipulation a running arc needs. When the bank can't cover one, the network fronts the
   rest (S.adv) and takes it back out of the weekly TV deal (ADV_CUT of it a week, never into the red).
   Being in the red now only comes from what you owe (payroll, rehab bills, breach payouts): that's what costs morale. */
'use strict';
const ADV_CUT=.35;   /* share of the weekly TV deal that repays a network advance */
const BG_RESERVE=4;  /* the offline rival starts saving for Blood & Guts this many weeks out */

/* ---- commitments: booked whatever the bank says ---- */
function bgArcStips(a){const out=[];try{const l=(typeof arcPlan==='function'?arcPlan(a):null)||[];l.forEach(p=>{if(p&&p.stip)out.push(p.stip)});
 const SL=typeof arcStoryOf==='function'?arcStoryOf(a):null;if(SL&&SL.stip&&a.stage==='pay')out.push(SL.stip);if(a.stip)out.push(a.stip);if(Array.isArray(a.stips))out.push(...a.stips)}catch(e){}return out}
function bgCommit(m,b){if(!m)return false;if(m.type==='mitb')return true;
 const k=typeof stipKey==='function'?stipKey(m):m.stip;if(k==='bng'&&S.week===BNG_WEEK)return true;
 if(!k||k==='std'||!Array.isArray(S.arcs))return false;const ids=(m.sides||[]).flat();
 return S.arcs.some(a=>a&&!a.done&&ids.includes(a.a)&&S.w[a.a]&&S.w[a.a].own===b&&bgArcStips(a).includes(k))}
const bgHum=b=>b==='p'||(typeof ON==='function'&&ON());
const bgMatch=sl=>sl&&sl.k==='match'&&sl.d&&(typeof validMatch!=='function'||validMatch(sl.d));
const bgPrice=(m,b)=>stipPrice(stipKey(m),b);
/* this week's building (TV weeks only) */
function bgRent(b){try{return typeof venueRent==='function'?venueRent(b):0}catch(e){return 0}}
function bgShow(){try{return curShow()}catch(e){return {ppv:false}}}
/* production for the budget: what's set for this brand (the offline rival's own pick when it hasn't set one) */
function bgProd(b,sh){try{const k=(S.prod&&S.prod[b]&&PROD[S.prod[b]])?S.prod[b]:prodOf(b,sh);return prodCost(k,sh,b)}catch(e){return 0}}
/* what's spoken for tonight: stipulations (minus `skip`), production (unless noProd) and the building */
function bgSpend(b,card,o){o=o||{};const sh=o.sh||bgShow();let s=0;(card||(S.card&&S.card[b])||[]).forEach(sl=>{if(bgMatch(sl)&&sl.d!==o.skip)s+=bgPrice(sl.d,b)});
 if(!o.noProd)s+=bgProd(b,sh);if(!o.noRent)s+=bgRent(b);return s}
/* the offline rival keeps Blood & Guts money aside in the weeks before it */
/* and it keeps a cushion of RIVAL_CUSHION of a week's payroll, so a bad week doesn't put it in the red */
let RIVAL_CUSHION=.35;
function bgReserve(b){if(b!=='ai'||(typeof ON==='function'&&ON())||!S||S.phase!=='season')return 0;const d=BNG_WEEK-S.week;return (d>0&&d<=BG_RESERVE?stipPrice('bng',b):0)+Math.round(payroll(b)*RIVAL_CUSHION)}
/* this week's bills that a normal show won't cover (payroll and rehab bills beyond the TV deal and a 3½★ night's takings) stay in the bank */
/* what a week usually brings in: the TV deal plus this brand's usual TV-night takings (tickets, merch, ads; a running average
   of its own shows, or the 3½★ estimate before it has any), minus arena & crew */
function bgEarn(b){try{const g=S.bgG&&S.bgG[b];if(g==null)return weekEst(b)+bgRent(b);return Math.round(tvSigned(b)+g-opsCost(b))}catch(e){return 0}}
/* what a roster can be paid from each week once the building is paid for (the offline rival signs and re-signs inside it) */
function bgCap(b){return bgEarn(b)-bgRent(b)}
function bgBills(b){try{if(!S||S.phase!=='season')return 0;return Math.max(0,Math.round(payroll(b)+(typeof medBill==='function'?medBill(b):0)-bgEarn(b)))}catch(e){return 0}}
/* the offline rival makes room for a star it paid over budget for, or when payroll outgrows what it earns:
   its least valuable wrestler (not a champion, not the one it just kept) goes, while it has more than RIVAL_MIN */
const RIVAL_MIN=22;
function aiMakeRoom(keep,notes,max){max=max||2;let n=0;const fa=aiq('ai').fa;
 while(n<max&&payroll('ai')>bgCap('ai')*fa*1.05){const l=ownList('ai').filter(w=>w!==keep&&!isChamp(w.id)&&!w.inj).sort((x,y)=>val(x)-val(y));if(l.length<RIVAL_MIN)break;const w=l[0];if(!w)break;
  leave(w,`📝 ${S.rival} let ${w.name} go to make room on its payroll. ${w.name} is now a free agent.`,notes||[]);n++}return n}
window.aiMakeRoom=aiMakeRoom;window.bgReserve=bgReserve;window.bgCap=bgCap;window.bgEarn=bgEarn;
/* money left for tonight */
function bgLeft(b,card,o){return (S.money&&S.money[b]||0)-bgSpend(b,card,o)-bgBills(b)-((o&&o.res===false)?0:bgReserve(b))}
/* can this match take stipulation k? */
function bgCanStip(b,m,k,card){if(!m)return true;const pr=stipPrice(k,b);if(!pr)return true;const t=Object.assign({},m,{stip:k});if(bgCommit(t,b))return true;
 return pr<=bgLeft(b,card,{skip:m})}
/* roughly how much of tonight's commitments the network would have to front if the show were booked as it stands */
function bgAdvEst(b){try{const cc=bgCommitCost(b);if(!cc)return 0;const other=bgSpend(b)-cc;const avail=Math.max(0,(S.money[b]||0)-other-bgBills(b));return Math.max(0,cc-avail)}catch(e){return 0}}
window.bgAdvEst=bgAdvEst;
window.bgCanStip=bgCanStip;window.bgBills=bgBills;window.bgLeft=bgLeft;window.bgCommit=bgCommit;window.bgSpend=bgSpend;

/* ---- trimming a card that spends more than the bank (bookers, and a last check before a show) ---- */
function bgTrim(b,card,o){o=o||{};const prot=o.protect||new Set();const dropped=[];let guard=20;
 while(bgLeft(b,card,{noProd:o.noProd})<0&&guard-->0){
  const l=(card||[]).filter(sl=>bgMatch(sl)&&!prot.has(sl.d)&&bgPrice(sl.d,b)>0&&!bgCommit(sl.d,b)&&sl.d.type!=='mitb').sort((x,y)=>bgPrice(y.d,b)-bgPrice(x.d,b));
  if(l.length){const d=l[0].d;dropped.push(STIPS[d.stip]?STIPS[d.stip].n:d.stip);d.stip='std';continue}
  if(!o.noProd&&S.prod&&S.prod[b]&&S.prod[b]!=='std'){S.prod[b]='std';dropped.push('production');continue}break}
 return dropped}
window.bgTrim=bgTrim;

/* the offline rival: its booker and its crowd tuner stay inside the budget (Suggest the rest is trimmed below) */
if(typeof autoBook==='function'){const a0=autoBook;autoBook=window.autoBook=function(brand,show,extUsed,opt){const c=a0.apply(this,arguments);
 try{if(Array.isArray(c)&&brand!=='p'&&!bgHum(brand))bgTrim(brand,c,{noProd:true})}catch(e){console.warn('budget',e)}return c}}
/* the rival's production: never more than what's left after its stipulations */
if(typeof aiProd==='function'){const p0=aiProd;aiProd=window.aiProd=function(b,show){let k=p0.apply(this,arguments);try{const card=S.card&&S.card[b];const room=(S.money[b]||0)-bgSpend(b,card,{noProd:true,sh:show})-bgReserve(b);
 const ord=['max','plus','std'];let i=ord.indexOf(k);while(i<ord.length-1&&prodCost(ord[i],show,b)>room)i++;k=ord[Math.max(0,i)]}catch(e){}return k}}

/* Suggest the rest (and the bots' assistants): the stipulations it adds have to fit what's left; yours stay */
['suggestCard','suggestCardEngaged'].forEach(fn=>{const f0=window[fn];if(typeof f0!=='function')return;window[fn]=function(){const c=f0.apply(this,arguments);
 try{if(Array.isArray(c)){const was=new Set(((S.card&&S.card.p)||[]).filter(bgMatch).map(sl=>JSON.stringify(sl.d)));const keep=new Set(c.filter(sl=>bgMatch(sl)&&was.has(JSON.stringify(sl.d))).map(sl=>sl.d));bgTrim('p',c,{protect:keep})}}catch(e){console.warn('budget suggest',e)}return c}});

/* ---- the show: a last check before the bell, then the network covers whatever a commitment left the bank short ---- */
function bgCommitCost(b){return ((S.card&&S.card[b])||[]).filter(sl=>bgMatch(sl)&&bgCommit(sl.d,b)).reduce((a,sl)=>a+bgPrice(sl.d,b),0)}
hookStep('airPair','budget: trim what the bank can\'t cover',{before(ctx){const pre=ctx.pre={};const bl=ctx.bl=typeof brands==='function'?brands():['p','ai'];S.bgcc={};
 try{bl.forEach(b=>{if(!S.card||!S.card[b]||!S.money||S.money[b]==null)return;const dr=bgTrim(b,S.card[b],{noRent:true});if(dr.length)pre[b]=dr;const c=bgCommitCost(b);if(c)S.bgcc[b]=c})}catch(e){console.warn('budget show',e)}},
 after(ctx,out){const pre=ctx.pre,bl=ctx.bl;
 try{if(out&&out.cash&&!out.ppv)bl.forEach(b=>{const c=out.cash[b];if(!c||c.tix==null)return;const g=(c.tix||0)+(c.merch||0)+(c.ad||0);S.bgG=S.bgG||{};S.bgG[b]=S.bgG[b]==null?g:Math.round(S.bgG[b]*.75+g*.25)})}catch(e){}
 try{bl.forEach(b=>{if(pre[b]&&bgHum(b)&&out&&out.notes)out.notes.push(`${typeof ON==='function'&&ON()?nameOf(b)+': ':''}💸 Not enough in the bank for everything on the card: ${pre[b].join(', ')} ${pre[b].length>1?'were':'was'} dropped before the show.`)})}catch(e){}}});

/* ---- paying the network back, out of the TV deal, never into the red ---- */
/* the week's bills, the way endWeek settles them, to see whether a commitment would leave the bank short */
function bgWeekNet(b){try{return tvSigned(b)-payroll(b)-opsCost(b)-(typeof medBill==='function'?medBill(b):0)-bgRent(b)}catch(e){return 0}}
hookStep('endWeek','budget: network advances',{before(ctx){const adv=ctx.adv={};
 try{const cc=S.bgcc||{};Object.keys(cc).forEach(b=>{if(!S.money||S.money[b]==null)return;const end=(S.money[b]||0)+bgWeekNet(b);const short=Math.min(cc[b],Math.max(0,-end));
  if(short>0){S.money[b]+=short;S.adv=S.adv||{};S.adv[b]=(S.adv[b]||0)+short;adv[b]=short}});delete S.bgcc}catch(e){console.warn('advance',e)}},
 after(ctx,r,notes){const adv=ctx.adv;
 try{if(!(typeof ON==='function'&&ON())&&S.phase==='season'&&S.money&&S.money.ai!=null)aiMakeRoom(null,[],1)}catch(e){console.warn('rival payroll',e)}
 try{Object.keys(adv).forEach(b=>{if(bgHum(b)&&Array.isArray(notes))notes.push(`${typeof ON==='function'&&ON()?nameOf(b)+': ':''}🏦 The network fronted ${money(adv[b])} for this week's big match. It comes back out of the TV deal over the next few weeks.`)});
  if(S.adv)Object.keys(S.adv).forEach(b=>{if(adv[b])return;const owe=S.adv[b]||0;if(owe<=0){delete S.adv[b];return}const tv=typeof tvSigned==='function'?tvSigned(b):0;
  const pay=Math.max(0,Math.min(owe,Math.round(tv*ADV_CUT),Math.floor(S.money[b]||0)));S.money[b]-=pay;S.adv[b]=owe-pay;if(S.adv[b]<=0)delete S.adv[b];
  if(pay&&bgHum(b)&&Array.isArray(notes))notes.push(`🏦 ${typeof ON==='function'&&ON()?nameOf(b)+' paid':'You paid'} the network back ${money(pay)}${S.adv[b]?` (${money(S.adv[b])} to go)`:' — all square'}.`)})}catch(e){console.warn('advance',e)}}});

/* ---- the Office: what's owed to the network ---- */
if(typeof finCard==='function'){const f0=finCard;finCard=window.finCard=function(){let h=f0.apply(this,arguments);try{const o=S.adv&&S.adv.p,a=bgAdvEst('p');let x='';
 if(a>0)x+=`<div class="tiny mt">🏦 Tonight's card costs ${money(a)} more than your budget. The network fronts up to that for the big match (less if tonight's takings cover some) and takes it back out of your TV deal (up to ${Math.round(ADV_CUT*100)}% a week).</div>`;
 if(o>0)x+=`<div class="muted tiny mt">🏦 Owed to the network: <b>${money(o)}</b>, repaid from the TV deal (up to ${Math.round(ADV_CUT*100)}% a week).</div>`;
 if(x&&typeof h==='string')h=h.replace(/<\/div>\s*$/,x+'</div>')}catch(e){}return h}}

/* ---- office choices that cost money need it in the bank ---- */
function bgOptCost(o,x){const t=(o.t||'')+' '+(o.d||'');if(/\{COST\}/.test(t)&&x&&x.cost)return x.cost;const m=t.match(/\(\$(\d+(?:\.\d+)?)(K|M)\)/);return m?Math.round(+m[1]*(m[2]==='M'?1000:1)):0}
window.bgOptCost=bgOptCost;
if(typeof openCrisis==='function'){const oc=openCrisis;openCrisis=window.openCrisis=function(){const r=oc.apply(this,arguments);
 try{const c=S.crisis;if(!c||!CRISES[c.k])return r;const C=CRISES[c.k];const x=crisisCtx();const cost=C.ch.map(o=>bgOptCost(o,x));const bank=S.money.p||0;
  if(!cost.some((v,i)=>!v||v<=bank))return r;
  document.querySelectorAll('#modal .choice, .modal .choice').forEach((el,i)=>{if(cost[i]&&cost[i]>bank){el.disabled=true;el.classList.add('dis');el.style.opacity='.45';const n=document.createElement('div');n.className='muted tiny';n.textContent=`Not enough in the bank (${money(bank)}).`;el.appendChild(n)}})}catch(e){}return r}}
if(typeof crisisChoose==='function'){const cc=crisisChoose;crisisChoose=window.crisisChoose=function(i){try{const c=S.crisis;if(c&&CRISES[c.k]){const C=CRISES[c.k];const x=crisisCtx();const cost=C.ch.map(o=>bgOptCost(o,x));
 if(cost[i]&&cost[i]>(S.money.p||0)&&cost.some(v=>!v||v<=(S.money.p||0)))return toast('Not enough in the bank for that.')}}catch(e){}return cc.apply(this,arguments)}}
/* a friend's visit: the bonus and the dinner need the money */
if(typeof fgAnswer==='function'){const fa=fgAnswer;fgAnswer=window.fgAnswer=function(i){try{const x=fgVisit();if(x&&i===0){const c=x.v.d<0?fgCost(x.F,x.A):15;if((S.money.p||0)<c){toast('Not enough in the bank for that.');return ''}}}catch(e){}return fa.apply(this,arguments)}}
if(typeof openFg==='function'){const of=openFg;openFg=window.openFg=function(){const r=of.apply(this,arguments);try{const x=fgVisit();if(x){const c=x.v.d<0?fgCost(x.F,x.A):15;if((S.money.p||0)<c){const el=document.querySelector('[onclick="fgPick(0)"]');if(el){el.disabled=true;el.style.opacity='.45';const n=document.createElement('div');n.className='muted tiny';n.textContent=`Not enough in the bank (${money(S.money.p||0)}).`;el.appendChild(n)}}}}catch(e){}return r}}

/* ---- tonight's building comes out of the same money ---- */
if(typeof venuePick==='function'){const vp=venuePick;venuePick=window.venuePick=function(b,k){try{const V=BLDG.find(v=>v.k===k);if(V&&V.rent&&bgHum(b)&&venOf(b).k!==k&&V.rent>bgLeft(b,null,{noRent:true}))return 'money'}catch(e){}return vp.apply(this,arguments)}}
