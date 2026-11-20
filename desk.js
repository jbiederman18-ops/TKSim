/* Tony Khan Simulator — desktop layout and mouse & keyboard controls (v374).
   The game was laid out for a phone: one 640px column with a tab bar along the bottom. On a computer screen (1100px and
   wider, never on the party-night TV) this file:
     Layout   — moves the tabs up into the header, widens the column, puts Home, the Office, Titles and Settings in two
                columns, opens sheets as centred dialogs instead of bottom sheets, and docks the booking pick sheet down
                the right side so the card table stays in view (tap another slot on the table to switch to it).
     Mouse    — right-click a wrestler card for their details (the mouse version of holding it); hover feedback on buttons, chips, cards and rows; pointer cursors on everything clickable; a mouse wheel
                scrolls sideways rows (cards, shapes, tabs) without holding Shift.
     Keyboard — 1–5 switch tabs (Home, Book, Roster, Titles, Office) and 0 opens Settings; A–E answer a lettered
                choice (office line, showdowns, live calls); Esc closes the open sheet the
                same way a click on the dimmed backdrop does; Tab reaches every clickable panel, and Enter or Space
                presses it. (Already in the game: Space/Enter/→ advance showdowns and the star reveal, Esc closes the
                pick sheet, ←/→/Enter/Esc drive the tutorial, F toggles fullscreen on the TV.)
   Loaded after cards.js so its styles sit on top. Nothing here changes how the game plays. */
'use strict';
(function(){
const MQ='(min-width:1100px)';
const desk=()=>window.matchMedia(MQ).matches&&!(typeof TV!=='undefined'&&TV);
window.deskOn=desk;
/* the booking sheet is a side panel at this width (cards.js asks, so it centres the slot in the whole window) */
window.tcSide=desk;

const css=`
@media ${MQ}{
 body:not(.tv){--dk-side:min(600px,42vw);--dk-book:900px}
 /* tabs live in the header */
 body:not(.tv) header.top{min-height:60px;padding-left:24px;padding-right:24px}
 body:not(.tv) nav.tabs{top:0;bottom:auto;left:50%;right:auto;transform:translateX(-50%)!important;height:60px;padding:0;gap:2px;background:none;box-shadow:none;z-index:7;align-items:stretch}
 body:not(.tv) nav.tabs:before,body:not(.tv) nav.tabs:after{display:none}
 body:not(.tv) nav.tabs button{flex:none;flex-direction:row;gap:8px;padding:0 18px;font-size:13px;letter-spacing:.12em;background:none!important;color:#8a857b}
 body:not(.tv) nav.tabs button svg{width:18px;height:18px}
 body:not(.tv) nav.tabs button.on{color:var(--ink)!important}
 body:not(.tv) nav.tabs button.on:before{top:13px;bottom:13px;left:2px;right:2px;height:auto}
 body:not(.tv) nav.tabs.kb{display:flex}
 /* a wider page */
 body:not(.tv) main{max-width:1120px;padding:22px 28px 56px}
 body:not(.tv) main .hero{margin-left:0;margin-right:0}
 body:not(.tv) main.t-book,body:not(.tv) main.t-titles{max-width:var(--dk-book)}
 body:not(.tv) main:not([class*="t-"]){max-width:760px}
 body:not(.tv) main .chips{flex-wrap:wrap;overflow:visible;margin:0;padding:0 0 2px;gap:5px}
 body:not(.tv) main .chips .flsep{display:none}
 body:not(.tv) .tcdock.tcsheet .tcsc,body:not(.tv) .tcdock.tcsheet .tcshc{flex-wrap:wrap;overflow:visible;row-gap:6px}
 /* two columns on the read-and-decide screens: the show (or the page's banner) across the top, panels below */
 body:not(.tv) main.t-home,body:not(.tv) main.t-office,body:not(.tv) main.t-menu{columns:2;column-gap:20px}
 body:not(.tv) main.t-home>*,body:not(.tv) main.t-office>*,body:not(.tv) main.t-menu>*{break-inside:avoid}
 body:not(.tv) main.t-home>:first-child,body:not(.tv) main.t-office>:first-child,body:not(.tv) main.t-menu>:first-child,
 body:not(.tv) main>.mpb,body:not(.tv) main>.dk-span{column-span:all}
 /* card grids fill the width instead of growing the cards */
 html.tcards body:not(.tv) main .cgrid,html.tcards body:not(.tv) main .tcrg{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:18px 12px}
 html.tcards body:not(.tv) main .cgrid .tkc,html.tcards body:not(.tv) main .tcrg .tkc{--w:140px}
 /* sheets open as centred dialogs */
 body:not(.tv) #modal:not(.lobbyM){bottom:0;align-items:center;padding:24px}
 body:not(.tv) #modal:not(.lobbyM):before,body:not(.tv) #modal:not(.lobbyM):after{display:none}
 body:not(.tv) #modal:not(.lobbyM)>.sheet{max-width:760px;max-height:min(90vh,1100px);padding-bottom:26px;box-shadow:0 0 0 1px #2a2a30,0 30px 80px rgba(0,0,0,.8)}
 body:not(.tv) #modal:not(.lobbyM) .eddock{bottom:-26px;margin-bottom:-26px}
}
/* the pick sheet docks down the right; the card table slides left to make room and stays clickable */
@media ${MQ}{
 body:not(.tv) .tcdock.tcsheet{left:auto;right:0;top:60px;bottom:0;width:var(--dk-side);max-width:none;margin:0;height:auto;transform:none;padding-bottom:0;box-shadow:-1px 0 0 var(--gold3),-24px 0 48px rgba(0,0,0,.55)}
 body:not(.tv) .tcdock.tcsheet.enter{animation:dkside .28s cubic-bezier(.2,.9,.3,1) both}
 body:not(.tv) .tcdock.tcsheet:not(.tall) .tcsb{padding-bottom:0;overflow-y:auto}
 body:not(.tv) .tcdock.tcsheet .tcpull{display:none}
 body:not(.tv) .tcdock.tcsheet .tcsh{padding-top:14px}
 body:not(.tv) .tcscrim{display:none}
 body:not(.tv):has(.tcdock.tcsheet) main.t-book{margin-left:max(20px,calc((100vw - var(--dk-side) - var(--dk-book))/2));margin-right:var(--dk-side)}
 html.tcards body:not(.tv) .tcgrid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))}
 html.tcards body:not(.tv) .tcgrid .tkc{--w:128px}
}
/* big monitors */
@media (min-width:1700px){body:not(.tv){--dk-book:1000px}body:not(.tv) main{max-width:1320px}}
@keyframes dkside{from{transform:translateX(100%)}}
/* mouse: show what can be clicked */
@media (hover:hover) and (pointer:fine){
 [onclick],[data-tcs],[data-tcpick],[data-tcx],[data-tcw],.tcdrop,summary,label[for],select{cursor:pointer}
 button:not(:disabled):hover,.chip:not(:disabled):hover,a.btn:hover{filter:brightness(1.18)}
 nav.tabs button:not(.on):hover{color:#e8e2d4!important}
 .tile:hover,.card[onclick]:hover,.slot:hover,.tcs:hover,details.card>summary:hover{box-shadow:inset 0 0 0 1px rgba(207,171,85,.55)}
 .tkc{transition:transform .14s ease,filter .14s ease}
 .tkc:hover:not(.used):not([aria-disabled="true"]){transform:translateY(-3px);filter:brightness(1.12)}
 .tcgrid .tkc:hover:not(.used){outline:2px solid rgba(245,207,104,.6);outline-offset:2px}
 .choice:hover{filter:brightness(1.15)}
 [role="button"]:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--gold2,#f5cf68);outline-offset:2px}
}`;
const st=document.createElement('style');st.id='deskcss';st.textContent=css;document.head.appendChild(st);

/* ---------- keyboard ---------- */
const typing=t=>!!(t&&(/^(input|textarea|select)$/i.test(t.tagName)||t.isContentEditable));
const modalOpen=()=>{const m=document.getElementById('modal');return !!(m&&!m.classList.contains('hidden'))};
const TABS=['home','book','roster','titles','office'];
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||typeof TV!=='undefined'&&TV)return;
 if(document.getElementById('tut'))return;/* the tutorial has its own keys */
 if(e.key==='Escape'){
  if(typing(e.target)){e.target.blur();return}
  if(!modalOpen())return;
  const m=document.getElementById('modal');
  /* the same rule as a click on the dimmed backdrop: never in the middle of a showdown or the star reveal */
  if(m.classList.contains('lobbyM')||(typeof PS!=='undefined'&&PS)||(typeof ME!=='undefined'&&ME)||(typeof srOn==='function'&&srOn()))return;
  e.preventDefault();e.stopImmediatePropagation();closeModal();return}
 if(typing(e.target)||e.shiftKey)return;
 /* A–E answer a lettered choice (the office line, promo and match showdowns, live calls) */
 if(/^[a-e]$/i.test(e.key)){const box=document.getElementById('sdbox')||(modalOpen()&&document.getElementById('modal'));if(!box)return;
  const L=e.key.toUpperCase();const c=[...box.querySelectorAll('.choice')].find(x=>{const k=x.querySelector('.key');return k&&k.textContent.trim()===L&&x.offsetParent!==null});
  if(c&&!c.disabled&&!c.classList.contains('dis')){e.preventDefault();e.stopImmediatePropagation();c.click()}return}
 if(/^[0-5]$/.test(e.key)){
  if(!S||!(S.phase==='season'||S.phase==='over')||modalOpen()||(typeof LIVE!=='undefined'&&LIVE)||document.getElementById('srv'))return;
  const t=e.key==='0'?'menu':TABS[+e.key-1];if(typeof tab!=='undefined'&&tab===t)return;
  e.preventDefault();go(t)}},true);

/* Enter / Space on a clickable panel that isn't a real button */
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;
 if(!t||!t.hasAttribute||!t.hasAttribute('data-dkb'))return;e.preventDefault();t.click()});
const NATIVE=/^(BUTTON|A|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY|OPTION)$/;
function tag(root){(root||document).querySelectorAll('[onclick]:not([tabindex]):not([data-dkb])').forEach(el=>{
 if(NATIVE.test(el.tagName)||el.closest('button,a'))return;
 el.setAttribute('tabindex','0');el.setAttribute('data-dkb','');if(!el.hasAttribute('role'))el.setAttribute('role','button')})}
let tq=0;const mo=new MutationObserver(()=>{if(!tq)tq=requestAnimationFrame(()=>{tq=0;tag()})});
function watch(){tag();['app','modal'].forEach(id=>{const n=document.getElementById(id);if(n)mo.observe(n,{childList:true,subtree:true})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();

/* ---------- mouse wheel scrolls sideways rows ---------- */
function hRow(el){for(let n=el;n&&n!==document.body;n=n.parentElement){if(n.scrollWidth>n.clientWidth+2){const cs=getComputedStyle(n);
 if(/(auto|scroll)/.test(cs.overflowX)&&!(n.scrollHeight>n.clientHeight+2&&/(auto|scroll)/.test(cs.overflowY)))return n}}return null}
document.addEventListener('wheel',e=>{if(e.ctrlKey||e.shiftKey||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;const r=hRow(e.target);if(!r)return;
 const max=r.scrollWidth-r.clientWidth;const to=Math.max(0,Math.min(max,r.scrollLeft+e.deltaY));if(to===r.scrollLeft)return;
 e.preventDefault();r.scrollLeft=to},{passive:false});

/* right-click a wrestler card (or press I on one) for their details — the mouse version of holding it */
function cardDetails(t){const c=t&&t.closest&&t.closest('.tkc[data-tcw]');if(!c||!S||!S.w||!S.w[c.dataset.tcw]||modalOpen()||typeof showW!=='function')return false;
 if((typeof LIVE!=='undefined'&&LIVE)||document.getElementById('srv'))return false;showW(c.dataset.tcw);return true}
document.addEventListener('contextmenu',e=>{if(cardDetails(e.target))e.preventDefault()});
document.addEventListener('keydown',e=>{if((e.key==='i'||e.key==='I')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!typing(e.target)&&cardDetails(e.target))e.preventDefault()});

/* tab hints on hover */
const hint=()=>{const n=document.querySelector('nav.tabs');if(!n||n.dataset.dkh)return;n.dataset.dkh=1;n.querySelectorAll('button').forEach((b,i)=>{if(!b.title)b.title=`${b.textContent.trim()} (${i+1})`})};
const mo2=new MutationObserver(hint);const app=document.getElementById('app');if(app)mo2.observe(app,{childList:true});
})();
