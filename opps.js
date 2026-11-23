/* Tony Khan Simulator — opportunities you book (v454).
   An opportunity at the office door whose answer happens on TV ("Recreate it on Dynamite", "Feature it on TV") doesn't
   play out the moment you pick it. It becomes a promo you owe on this week's show: it lands on the Needs your attention
   checklist with a Book it button, and the outcome plays out when that promo airs — a strong promo makes it land, a weak
   one makes it flop. Leave it off the show and the moment passes, and whoever was promised the spot is let down.
   OPP_TV lists which answers work this way: event key → answer index → {b: also needs {B}, pt: suggested promo type}. */
'use strict';
(function(){
const OPP_TV={
 talent:{1:{pt:'vignette'}},
 karaoke:{1:{b:1,pt:'rally'}},
 viral:{0:{pt:'interview'}},
 dogsave:{0:{pt:'vignette'}},
 mentor:{1:{b:1,pt:'rally'}},
 airport:{0:{pt:'vignette'}},
 charity:{1:{pt:'vignette'}},
 chant:{2:{pt:'callout'}},
 promo:{0:{pt:'callout'},1:{pt:'callout'}},
 award:{0:{pt:'callout'}},
 celeb:{0:{pt:'callout'},1:{pt:'callout'}}
};
const OPP_LETDOWN=4;
function oppList(){return (S.opps=Array.isArray(S.opps)?S.opps:[])}
function oppOpen(){return oppList().filter(o=>!o.done&&S.w[o.a]&&S.w[o.a].own==='p')}
function oppTag(k,i){const C=typeof CRISES!=='undefined'&&CRISES[k];return C&&OPP_TV[k]&&OPP_TV[k][i]||null}
function oppNames(o){const A=S.w[o.a],B=o.b&&S.w[o.b];return A?A.name+(B?' & '+B.name:''):''}
/* who the promo needs, and whether a promo on the card has them */
function oppHit(o,p){if(!p||!p.a)return false;const ids=[p.a,p.b].filter(Boolean);return ids.includes(o.a)&&(!o.b||ids.includes(o.b))}

/* picking a TV answer books it instead of resolving it */
window.oppChoose=function(i){try{const c=S&&S.crisis;const tg=c&&oppTag(c.k,i);
  if(tg&&!(typeof mpLocked==='function'&&mpLocked())&&S.phase==='season'){const C=CRISES[c.k];const x=crisisCtx();if(!tg.b||x.B){
   const o={id:'op'+AW()+'_'+c.k,k:c.k,ci:i,a:c.a,b:tg.b&&x.B?x.B.id:null,pt:tg.pt||'',due:AW(),tal:c.tal,c:JSON.parse(JSON.stringify(c))};oppList().push(o);S.crisis=null;
   const t=`${C.i} ${C.t}: ${crisisFill(C.ch[i].t,x)}. Book ${oppNames(o)} in a promo on this week's show; how it lands decides how it goes.`;news(t);save();render();
   openModal(`<div class="h mhd">${esc(C.t)}</div><div class="duo" style="align-items:center"><span style="font-size:38px;line-height:1">${C.i}</span>${face(x.A)}${x.B?face(x.B):''}</div><div class="outcome ok">📺 On this week's show: put <b>${esc(oppNames(o))}</b> in a promo. A strong promo makes it land; leave it off the show and the moment passes.</div><div class="row" style="gap:8px"><button class="btn" onclick="oppBook('${o.id}')">Book it now</button><button class="btn sec" onclick="closeModal()">Later</button></div>`);return true}}}catch(e){console.warn('opp',e)}return false};

/* the Book it button: the first open promo slot (the bonus promo counts), with the suggested promo type */
window.oppBook=function(id){const o=oppList().find(x=>x.id===id);if(!o)return;try{closeModal()}catch(e){}if(typeof mpLocked==='function'&&mpLocked())return;
 const c=S.card.p;let i=c.findIndex(sl=>sl&&sl.k==='promo'&&!sl.d&&!sl.opt);if(i<0)i=c.findIndex(sl=>sl&&sl.k==='promo'&&!sl.d);
 if(i<0){go('book');return toast('Every promo slot is taken. Swap one out for this.')}
 const ids=[o.a,o.b].filter(Boolean);c[i].d={type:PT[o.pt]&&(PT[o.pt].b!=='req'||o.b)?o.pt:'callout',a:o.a,b:o.b||''};
 if(PT[c[i].d.type].b==='req'&&!c[i].d.b)c[i].d.type='callout';save();if(typeof tab!=='undefined'&&tab!=='book')go('book');else render();toast(`📺 Booked: ${oppNames(o)}. Change the promo type if you like.`)};

/* when the promo airs, the answer plays out: the promo's stars decide any roll of the dice in it */
window.oppSeg=function(b,p,st,notes){if(b!=='p'||!S.opps)return;oppOpen().forEach(o=>{if(o.done||o.due>AW()||!oppHit(o,p))return;const C=CRISES[o.k];if(!C||!C.ch[o.ci])return;
 const keep=S.crisis,rnd=Math.random;let txt='';
 try{S.crisis=o.c;const x=crisisCtx();let n=0;const r0=clamp((4.2-st)/3.2,.02,.98);Math.random=()=>n++===0?r0:rnd();txt=C.ch[o.ci].fx(x)}catch(e){console.warn('opp fx',e)}finally{Math.random=rnd;S.crisis=keep}
 o.done=1;if(txt){const t=`${C.i} ${C.t}: ${txt}`;notes.push(t);news(t)}})};

/* after the show: anything owed and not on it fizzles */
if(typeof airPair==='function'){const _ap=airPair;airPair=function(){const wk=AW();const r=_ap.apply(this,arguments);try{oppList().forEach(o=>{if(o.done||o.due>wk)return;o.done=1;const A=S.w[o.a];if(!A||A.own!=='p')return;
  const C=CRISES[o.k];mor(A,-OPP_LETDOWN);if(o.b&&S.w[o.b]&&S.w[o.b].own==='p')mor(S.w[o.b],-OPP_LETDOWN);news(`${C?C.i+' '+C.t+': ':''}${oppNames(o)} never made it on the show. The moment passed, and ${o.b?'they were':esc(A.name)+' was'} let down.`)});
  S.opps=oppList().filter(o=>!o.done||AW()-o.due<2)}catch(e){console.warn('opp sweep',e)}return r};window.airPair=airPair}

/* on the checklist, up top: it's owed tonight */
if(typeof attnItems==='function'){const _ai=attnItems;attnItems=function(){const out=_ai.apply(this,arguments);try{if(!S||S.phase!=='season')return out;const c=(S.card&&S.card.p)||[];
 oppOpen().filter(o=>o.due>=AW()).forEach(o=>{const C=CRISES[o.k];if(!C)return;const A=S.w[o.a];if(A.inj)return;const on=c.some(sl=>sl&&sl.k==='promo'&&oppHit(o,sl.d));
  out.push({id:o.id,g:'must',i:C.i,h:`${C.t}: ${oppNames(o)} in a promo`,d:on?'On the card. A strong promo makes it land.':'You said yes at the office. Put them in a promo tonight or the moment passes.',
   s:on?['ok','On the card']:['b','Not on the card'],a:on?null:['Book it',`oppBook('${o.id}')`,1],gate:false,who:[o.a,o.b].filter(Boolean),where:'📺 Tonight',
   chip:i=>{const sl=c[i];return sl&&sl.k==='promo'&&oppHit(o,sl.d)?['ok',`${C.i} ${C.t}`]:null}})})}catch(e){console.warn('opp checklist',e)}return out};window.attnItems=attnItems}
})();
