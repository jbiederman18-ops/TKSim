'use strict';
/* ===================== THE PICK IS IN (v412) =====================
   Every draft pick made by someone else (the rival, or the other GMs in a league or on party night) slides in as a
   broadcast banner at the top of the screen: round and pick, who picked, the wrestler's photo, Ring / Mic / Pop,
   their crowd and salary. It holds for a couple of seconds, a tap clears it, and picks that land together queue up.
   Your own picks aren't announced — the board already shows them.
   - Picks come from S.draft.ids (pushed by draftPick), so the banner works the same for a solo rival picking on a
     timer, a league sync that brings several picks at once, and queued/auto-drafted picks.
   - The first time we look at a draft (page load, a different save), we only announce what came in after your last
     pick, at most DC_MAX of them, so opening a league shows what you missed without replaying the whole draft.
   - Waits while the draft tour is up. Never on the party TV (it has its own draft board). */
const DC_MAX=4, DC_HOLD=2300, DC_HOLD_Q=1500;
let DC_KEY=null, DC_SEEN=0, DC_Q=[], DC_CUR=null, DC_T=null;

(function(){const c=document.createElement('style');c.id='dccss';c.textContent=`
#dcall{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));width:min(460px,calc(100vw - 20px));z-index:38;transform:translate(-50%,-140%);opacity:0;transition:transform .26s cubic-bezier(.2,.8,.25,1),opacity .2s;pointer-events:none}
#dcall.in{transform:translate(-50%,0);opacity:1;pointer-events:auto;cursor:pointer}
#dcall .dc-top{display:flex;align-items:stretch;height:26px}
#dcall .dc-tag{display:flex;align-items:center;padding:0 18px 0 12px;background:var(--red);color:#fff;font:900 italic 15px 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.04em;clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}
#dcall .dc-rd{display:flex;align-items:center;padding:0 10px;margin-left:-6px;background:#111114;color:var(--gold2);font:800 italic 13px 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.08em}
#dcall .dc-body{display:flex;gap:12px;align-items:center;padding:10px 12px;background:linear-gradient(180deg,var(--st1),var(--st2));box-shadow:inset 0 0 0 1px var(--gold),0 14px 40px rgba(0,0,0,.7)}
#dcall .dc-pic{flex:none;width:58px;height:58px;overflow:hidden;background:#0c0c0e url(card-bg.jpg) center/cover no-repeat;box-shadow:0 0 0 1px #5a4a2e}
#dcall .dc-pic img{width:100%;height:100%;object-fit:cover;object-position:top}
#dcall .dc-pic.af{box-shadow:0 0 0 2px var(--face,#3aa0ff)}#dcall .dc-pic.ah{box-shadow:0 0 0 2px var(--heel,#e0453a)}
#dcall .dc-who{font-size:12.5px;font-weight:700;color:var(--gold2);text-transform:uppercase;letter-spacing:.06em}
#dcall .dc-n{font:900 italic 25px/1.02 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;color:var(--text);margin:1px 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#dcall .dc-s{font-size:13px;color:var(--mut);display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}
#dcall .dc-s b{color:var(--text)}#dcall .dc-s .gold{color:var(--gold2);font-weight:700}
#dcall .dc-n,#dcall .dc-s{animation:dcline .32s ease both}#dcall .dc-s{animation-delay:.08s}
@keyframes dcline{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#dcall,#dcall *{transition:none!important;animation:none!important}}
`;document.head.appendChild(c)})();

function dcEl(){let e=document.getElementById('dcall');if(!e){e=document.createElement('div');e.id='dcall';e.setAttribute('role','status');e.setAttribute('aria-live','polite');e.onclick=dcSkip;document.body.appendChild(e)}return e}
function dcOff(){return typeof TV!=='undefined'&&TV}
function dcBusy(){return typeof TUT!=='undefined'&&!!TUT}

/* look for picks we haven't announced yet */
function dcScan(){
 if(!S||S.phase!=='draft'||!S.draft||dcOff()){if(DC_KEY!==null){DC_KEY=null;DC_Q=[];dcHide()}return}
 const d=S.draft,ids=d.ids||[],key=`${S.gm}|${S.season||1}|${d.supp?'s':'d'}`;
 if(key!==DC_KEY||ids.length<DC_SEEN){
  /* first look at this draft: only what came in since your own last pick */
  DC_KEY=key;let from=0;for(let i=ids.length-1;i>=0;i--){const w=S.w[ids[i]];if(w&&w.own==='p'){from=i+1;break}}
  DC_SEEN=Math.max(from,ids.length-DC_MAX)}
 if(ids.length<=DC_SEEN)return;
 const fresh=ids.slice(DC_SEEN).map((id,k)=>({id,n:DC_SEEN+k+1}));DC_SEEN=ids.length;
 fresh.filter(x=>{const w=S.w[x.id];return w&&w.own&&w.own!=='p'}).slice(-DC_MAX).forEach(x=>DC_Q.push(x));
 if(DC_Q.length>DC_MAX)DC_Q=DC_Q.slice(-DC_MAX);
 dcNext()}

/* round and pick-in-round from the overall pick number */
function dcSlot(n){const per=Math.max(1,((S.draft&&S.draft.order)||[1,1]).length);return {r:Math.ceil(n/per),p:(n-1)%per+1}}

function dcHtml(x){const w=S.w[x.id];const sl=dcSlot(x.n);
 const fg=typeof fgOf==='function'&&typeof fgIc==='function'?fgOf(w).filter(k=>k!=='und').map(k=>`<span title="${typeof FG_N!=='undefined'?FG_N[k]:''}">${fgIc(k)}</span>`).join(''):'';
 return `<div class="dc-top"><span class="dc-tag">The pick is in</span><span class="dc-rd">Round ${sl.r} · Pick ${sl.p}</span></div>
 <div class="dc-body"><div class="dc-pic a${w.al}">${typeof portrait==='function'?portrait(w):''}</div><div style="min-width:0;flex:1">
 <div class="dc-who">${esc(nameOf(w.own))} select${w.own==='p'?'':'s'}</div><div class="dc-n">${esc(w.name)}</div>
 <div class="dc-s"><span>Ring <b>${Math.round(w.ring)}</b></span><span>Mic <b>${Math.round(w.mic)}</b></span><span>Pop <b>${Math.round(w.pop)}</b></span>${fg?`<span>${fg}</span>`:''}<span class="gold">${money(w.sal||mkt(w))}/wk</span></div></div></div>`}

function dcNext(){if(DC_CUR||!DC_Q.length)return;if(dcBusy()){clearTimeout(DC_T);DC_T=setTimeout(dcNext,600);return}
 const x=DC_Q.shift();if(!S||!S.w[x.id])return dcNext();DC_CUR=x;const e=dcEl();
 e.classList.remove('in');e.innerHTML=dcHtml(x);void e.offsetWidth;e.classList.add('in');
 clearTimeout(DC_T);DC_T=setTimeout(dcSkip,DC_Q.length?DC_HOLD_Q:DC_HOLD)}

function dcSkip(){clearTimeout(DC_T);DC_T=null;const e=document.getElementById('dcall');if(e)e.classList.remove('in');
 DC_CUR=null;if(DC_Q.length)DC_T=setTimeout(dcNext,260)}
function dcHide(){clearTimeout(DC_T);DC_T=null;DC_CUR=null;const e=document.getElementById('dcall');if(e)e.classList.remove('in')}

/* after every render (that's when picks — solo, synced or queued — reach the screen) */
(function(){if(typeof render!=='function')return;const r0=render;render=function(){const out=r0.apply(this,arguments);try{dcScan()}catch(e){console.error(e)}return out}})();
