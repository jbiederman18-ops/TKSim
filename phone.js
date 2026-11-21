/* Tony Khan Simulator — phone conventions pass (v377).
   The phone half of the v374 desktop review: things mobile management games all do that the phone layout didn't.
   Under 1100px wide and never on the party-night TV (desk.js owns 1100px+), so the computer layout is untouched.
     1. Go live never scrolls away — on Book the real Go live dock ("3 to book · 1 to fix" and the button) is pinned just
        above the tab bar (fixed since v379, so the iOS overscroll bounce can't drag it). It steps aside while the pick sheet is open (that sheet has the bottom).
     2. Swipe a sheet down by its handle to close it — the same as tapping the dimmed area above it. Sheets that can't be
        dismissed (showdowns, a visitor at the office door) don't show the handle at all.
     3. The phone's back button (or back swipe) closes the open sheet, then the pick sheet, then goes back to the screen
        you were on before, then Home. On Home with nothing open, a second press leaves the app as usual. During a live
        show, a showdown or an office visit, back does nothing.
     4. Small buttons get a bigger invisible touch area (header week chip and gear, Details, finish/run-in tags, names in This
        week and on Titles) — nothing moves or changes size.
     5. The smallest card text has a floor: the stamina word, the R/M/P letters and the running-order MATCH/PROMO tags.
   Loaded last (after desk.js). Nothing here changes how the game plays. */
'use strict';
(function(){
const MQ='(max-width:1099px)';
const isTV=()=>typeof TV!=='undefined'&&!!TV;
const phone=()=>window.matchMedia(MQ).matches&&!isTV();

const css=`
@media ${MQ}{
 /* 1. the Go live dock rides above the tab bar */
 /* v379: fixed, not sticky — a sticky dock rode iOS's rubber-band bounce down behind the tabs and jerked back up.
    It tucks 2px under the tab bar so no rounded-off sliver of the card shows through the seam. */
 body:not(.tv) main.t-book>.lvdock{position:fixed;left:max(0px,calc(50% - 320px));right:max(0px,calc(50% - 320px));bottom:calc(var(--navh,72px) - 2px);z-index:4;margin:0;padding:14px 16px 12px;background:linear-gradient(180deg,rgba(9,9,10,0),#09090a 14px)}
 body:not(.tv) main.t-book:has(>.lvdock){padding-bottom:calc(var(--navh,72px) + 84px)}
 body:not(.tv):has(#tcdock.tcsheet) main.t-book>.lvdock{position:static;background:none;margin:14px 0 0;padding:0}
 body:not(.tv):has(#tcdock.tcsheet) main.t-book:has(>.lvdock){padding-bottom:110px}
 body:not(.tv):not(.tcbody):has(main.t-book>.lvdock) #toast{bottom:calc(var(--navh,72px) + 84px)}
 /* 2. no handle on sheets that can't be swiped away */
 html body:not(.tv) #modal.pnsw:not(.lobbyM)>.sheet.sheet:not(.tv-live-sheet):before{display:none}
 /* 4. bigger touch areas, same look */
 body:not(.tv) :is(header.top .hudc.cal,header.top .gsw,button.mini,button.tcdet,button.tcm,.chips.wrap>button.chip,.frow,a.face,a.heel,span.tnm,a.tiny,.attn a){position:relative}
 body:not(.tv) :is(header.top .hudc.cal,header.top .gsw,button.mini,button.tcdet,button.tcm,.chips.wrap>button.chip,.frow)::after{content:"";position:absolute;inset:-7px -3px}
 body:not(.tv) :is(a.face,a.heel,span.tnm,a.tiny,.attn a)::after{content:"";position:absolute;inset:-8px -2px}
 body:not(.tv) header.top .gsw::after{inset:-8px -8px -8px -4px}
 /* 5. text floors */
 body:not(.tv) .tcc{font-size:max(calc(var(--w)*.11),9px)}
 body:not(.tv) .tkst i{font-size:max(calc(var(--w)*.085),7px)}
 body:not(.tv) .tkst b{font-size:max(calc(var(--w)*.13),9.5px)}
 body:not(.tv) .tkst .hi b{font-size:max(calc(var(--w)*.145),10.5px)}
 body:not(.tv) .tkst.lit b{font-size:max(calc(var(--w)*.12),9.5px)}
 body:not(.tv) .lrs{font-size:10.5px}
}`;
const st=document.createElement('style');st.id='phonecss';st.textContent=css;document.head.appendChild(st);

/* ---------- who may close the open sheet (the same rule as a tap on the dimmed backdrop) ---------- */
const modalEl=()=>document.getElementById('modal');
const modalOpen=()=>{const m=modalEl();return !!m&&!m.classList.contains('hidden')&&!!m.firstElementChild};
const atDoor=()=>typeof window.inboxCur==='function'&&!!window.inboxCur();
const busy=()=>(typeof PS!=='undefined'&&PS)||(typeof ME!=='undefined'&&ME);
const closable=()=>modalOpen()&&!busy()&&!atDoor();
const live=()=>(typeof LIVE!=='undefined'&&LIVE)||!!document.getElementById('srv');

/* the handle shows only where a swipe will work */
function mark(){const m=modalEl();if(!m)return;m.classList.toggle('pnsw',modalOpen()&&!closable())}
(function watch(){const m=modalEl();if(!m){setTimeout(watch,300);return}
 new MutationObserver(()=>{try{mark()}catch(e){}}).observe(m,{childList:true,attributes:true,attributeFilter:['class']});mark()})();

/* ---------- 2. swipe a sheet down by its handle ---------- */
let sw=null;
document.addEventListener('touchstart',e=>{sw=null;if(!phone()||e.touches.length!==1)return;
 const sh=e.target.closest&&e.target.closest('#modal>.sheet');if(!sh||!closable()||sh.scrollTop>2)return;
 if(e.target.closest('button,a,input,select,textarea,summary,label,.chips,[onclick]'))return;
 const t=e.touches[0],r=sh.getBoundingClientRect();if(t.clientY-r.top>56)return;
 sw={sh,x0:t.clientX,y0:t.clientY,t0:Date.now(),dy:0,go:false}},{passive:true});
document.addEventListener('touchmove',e=>{if(!sw)return;const t=e.touches[0];const dx=t.clientX-sw.x0,dy=t.clientY-sw.y0;
 if(!sw.go){if(dy>8&&dy>Math.abs(dx))sw.go=true;else if(Math.abs(dx)>10||dy<-8){sw=null;return}else return}
 e.preventDefault();sw.dy=Math.max(0,dy);sw.sh.style.transition='none';sw.sh.style.transform=`translateY(${sw.dy}px)`},{passive:false});
function swEnd(){if(!sw)return;const s=sw;sw=null;if(!s.go)return;const sh=s.sh;const v=s.dy/Math.max(1,Date.now()-s.t0);
 if(s.dy>100||(s.dy>40&&v>.6)){sh.style.transition='transform .18s ease-in';sh.style.transform='translateY(105%)';
  setTimeout(()=>{sh.style.transition='';sh.style.transform='';if(closable())closeModal()},170)}
 else{sh.style.transition='transform .2s ease-out';sh.style.transform='';setTimeout(()=>{sh.style.transition=''},220)}}
document.addEventListener('touchend',swEnd,{passive:true});document.addEventListener('touchcancel',swEnd,{passive:true});

/* ---------- 3. the back button ---------- */
try{history.scrollRestoration='manual'}catch(e){}
const TABS=[];let BACKING=false;
if(typeof go==='function'){const g0=go;go=window.go=function(t){
  try{if(!BACKING&&typeof tab!=='undefined'&&tab&&tab!==t&&typeof S!=='undefined'&&S){TABS.push(tab);if(TABS.length>30)TABS.shift()}}catch(e){}
  return g0.apply(this,arguments)}}
let armed=false;
function arm(){if(armed||isTV())return;try{history.pushState({tkb:1},'',location.href);armed=true}catch(e){}}
/* browsers only honour a back-button guard the page set up after the player has touched it */
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,arm,{capture:true,passive:true}));
function backStep(){
 if(live()||busy())return true;                                   /* mid-show: back does nothing */
 if(typeof TUT!=='undefined'&&TUT){try{tutEnd()}catch(e){}return true}
 if(modalOpen()){if(closable())closeModal();return true}           /* an office visit stays put */
 if(document.querySelector('#tcdock.tcsheet')&&typeof window.tcShut==='function'){window.tcShut();return true}
 if(typeof S==='undefined'||!S)return false;
 while(TABS.length){const p=TABS.pop();if(p&&p!==tab){BACKING=true;try{go(p)}finally{BACKING=false}return true}}
 if(tab!=='home'){BACKING=true;try{go('home')}finally{BACKING=false}return true}
 return false}
window.addEventListener('popstate',()=>{armed=false;if(isTV())return;let kept=false;try{kept=backStep()}catch(e){console.warn('back',e);kept=true}if(kept)arm()});
window.phoneBack=backStep;
})();
