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

/* =====================================================================================================================
   v375 — desktop conventions pass. Same rule as above: only at 1100px+ and never on the TV, so phones never see any of it.
     1. A Go live button that never moves (header, right side, G to press) — on Book it mirrors the real Go live button,
        anywhere else it takes you to Book.
     2. Book in two panes: the card on the left, the show's health (attention, Go live, flow, production, the bill,
        feuds, locker room) in a sticky panel on the right. The panel steps aside while the pick sheet is docked.
     3. Roster: Cards / Table switch. The table lists the same wrestlers in the same order, sortable by column.
     4. Wrestler details from the roster or the draft: ‹ › (or ←/→) step through the list. No phone drag bar on dialogs.
     5. Hover info (mouse only, the browser's own delayed tooltip): stat lines, condition, Wild card.
     6. Home drops the tiles and the Tonight's card panel that repeat the header tabs.
     7. Draft: Tale of the tape pinned on the left, the board beside it.
     8. Dialog chip rows wrap; wider pages on big monitors; the version number sits beside the logo.
   ===================================================================================================================== */
const css2=`
@media ${MQ}{
 body:not(.tv) .brand .ver{position:static;align-self:flex-end;margin:0 0 3px 10px}
 html body:not(.tv) #modal:not(.lobbyM)>.sheet.sheet:not(.tv-live-sheet):before{display:none}
 body:not(.tv) #modal .chips{flex-wrap:wrap;overflow:visible;row-gap:6px}
 /* 1. the Go live button */
 body:not(.tv) .dkgo{flex:none;height:34px;padding:2px 16px 0;margin:0;border:0;border-radius:0;background:var(--gold2,#f5cf68);color:#141414;font:italic 900 15px/1 'Barlow Condensed','Barlow',sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
 body:not(.tv) .dkgo:disabled{background:#2a2a30;color:#77747c;cursor:default}
 body:not(.tv) .dkgo kbd{font:600 10px/1 'Barlow',sans-serif;opacity:.55;margin-left:8px;letter-spacing:0}
 /* 2. Book in two panes */
 body:not(.tv) main.t-book.dk2{max-width:1240px;display:flex;gap:24px;align-items:flex-start}
 body:not(.tv) main.t-book.dk2>.dkbl{flex:1;min-width:0}
 body:not(.tv) main.t-book.dk2>.dkba{flex:none;width:360px;position:sticky;top:76px;max-height:calc(100vh - 92px);overflow-y:auto;scrollbar-width:thin}
 body:not(.tv) main.t-book.dk2>.dkba>*{margin-left:0;margin-right:0}
 body:not(.tv) main.t-book.dk2>.dkba>:first-child{margin-top:0}
 body:not(.tv) main.t-book.dk2>.dkba .lvdock{margin:0 0 12px}
 body:not(.tv) main.t-book.dk2>.dkbl>.card.showcard{margin-left:0;margin-right:0}
 body:not(.tv):has(.tcdock.tcsheet) main.t-book.dk2{max-width:var(--dk-book)}
 body:not(.tv):has(.tcdock.tcsheet) main.t-book.dk2>.dkba{display:none}
 /* 3. roster table */
 body:not(.tv) main.t-roster>.mt{display:flex;align-items:center;justify-content:space-between;gap:12px}
 body:not(.tv) .dkvw{display:flex;flex:none;gap:2px}
 body:not(.tv) .dkvw button{margin:0;padding:6px 12px;border:0;background:#1d1d22;color:#8a857b;font:700 11px/1 'Barlow',sans-serif;letter-spacing:.12em;text-transform:uppercase}
 body:not(.tv) .dkvw button.on{background:var(--gold2,#f5cf68);color:#141414}
 body:not(.tv) main.dkrtab .tcrg{display:none}
 body:not(.tv) .dkrt{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}
 body:not(.tv) .dkrt th{position:sticky;top:60px;z-index:1;background:#0d0d10;text-align:right;padding:9px 10px;font:700 11px/1 'Barlow',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8a857b;border-bottom:1px solid #2a2a30;white-space:nowrap;cursor:pointer;user-select:none}
 body:not(.tv) .dkrt th.on{color:var(--gold2,#f5cf68)}
 body:not(.tv) .dkrt th:first-child,body:not(.tv) .dkrt td:first-child{text-align:left}
 body:not(.tv) .dkrt td{padding:8px 10px;text-align:right;border-bottom:1px solid #1c1c20;font-variant-numeric:tabular-nums;white-space:nowrap}
 body:not(.tv) .dkrt tbody tr{cursor:pointer}
 body:not(.tv) .dkrt tbody tr:hover{background:#17171b}
 body:not(.tv) .dkrt tbody tr:focus-visible{outline:2px solid var(--gold2,#f5cf68);outline-offset:-2px}
 body:not(.tv) .dkrt .nm{display:flex;align-items:center;gap:10px;font-weight:700}
 body:not(.tv) .dkrt .al{width:4px;height:20px;flex:none;background:#4a8fe6}body:not(.tv) .dkrt .al.hl{background:#e6463c}
 body:not(.tv) .dkrt .belt{font:italic 800 11px/1 'Barlow Condensed','Barlow',sans-serif;color:var(--gold2,#f5cf68);letter-spacing:.06em;text-transform:uppercase}
 body:not(.tv) .dkrt .hi{color:#fff;font-weight:700}
 body:not(.tv) .dkrt .lo{color:#e6463c}body:not(.tv) .dkrt .mid{color:#e8b04a}body:not(.tv) .dkrt .dim{color:#6f6b64}
 /* 4. step through the list in wrestler details */
 body:not(.tv) .dkflip{position:absolute;top:12px;right:14px;z-index:3;display:flex;align-items:center;gap:8px;padding:4px;background:#0d0d10;box-shadow:0 0 0 1px #2a2a30;font:700 12px/1 'Barlow',sans-serif;color:#cfc9bc}
 body:not(.tv) .dkflip button{margin:0;width:30px;height:30px;padding:0;border:0;background:#2a2a30;color:#fff;font-size:20px;line-height:1}
 body:not(.tv) .dkflip button:disabled{opacity:.3}
 /* 6. Home: the tiles that repeat the header tabs */
 body:not(.tv) main.t-home .tiles>.tile[onclick="go('roster')"],body:not(.tv) main.t-home .tiles>.tile[onclick="go('titles')"],body:not(.tv) main.t-home .tiles>.tile[onclick="go('office')"],body:not(.tv) main.t-home>.card.tcard{display:none}
 /* 7. draft: the tale of the tape beside the board */
 body:not(.tv) main.dkdraft:has(>.ttape){max-width:1240px;display:grid;grid-template-columns:400px minmax(0,1fr);column-gap:24px;align-items:start}
 body:not(.tv) main.dkdraft:has(>.ttape)>*{grid-column:2;min-width:0}
 body:not(.tv) main.dkdraft:has(>.ttape)>.dhead{grid-column:1/-1}
 body:not(.tv) main.dkdraft:has(>.ttape)>.ttape{grid-column:1;grid-row:2/span 30;position:sticky;top:76px;margin-top:0}
}
@media (min-width:1800px){body:not(.tv) main{max-width:1480px}body:not(.tv) main.t-book.dk2{max-width:1400px}body:not(.tv) main.dkdraft:has(>.ttape){max-width:1400px}}
@media (min-width:1100px) and (max-width:1359px){body:not(.tv) nav.tabs button{padding:0 11px;letter-spacing:.08em}body:not(.tv) .hud .hl{display:none}body:not(.tv) .dkgo kbd{display:none}}`;
const st2=document.createElement('style');st2.id='deskcss2';st2.textContent=css2;document.head.appendChild(st2);

const live=()=>(typeof LIVE!=='undefined'&&LIVE)||!!document.getElementById('srv');
const mainEl=()=>document.querySelector('#app main');

/* 1. the Go live button */
function goBtn(){const r=document.querySelector('header.top .hdr-r');if(!r)return;let b=r.querySelector('.dkgo');
 let lab=null,dis=false,act=null;
 if(desk()&&S&&S.phase==='season'&&!live()){
  if(typeof tab!=='undefined'&&tab==='book'){const lv=document.querySelector('#app main .lvdock .btn.live');if(lv){lab=lv.textContent.replace(/▸/g,'').trim();dis=lv.disabled;act=()=>lv.click()}}
  else{lab='Book the show';act=()=>{go('book');window.scrollTo(0,0)}}}
 if(!lab){if(b)b.remove();return}
 if(!b){b=document.createElement('button');b.className='dkgo';b.onclick=()=>{if(b._a&&!b.disabled)b._a()};const g=r.querySelector('.gsw');r.insertBefore(b,g||null)}
 const html=`${esc(lab)} ▸<kbd>G</kbd>`;if(b.innerHTML!==html)b.innerHTML=html;b.disabled=dis;b._a=act;b.title=`${lab} (G)`}
document.addEventListener('keydown',e=>{if((e.key!=='g'&&e.key!=='G')||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)||modalOpen()||document.getElementById('tut'))return;
 const b=document.querySelector('header.top .dkgo');if(!b||b.disabled||!desk())return;e.preventDefault();b.click()});

/* 2. Book in two panes */
const ASIDE=[':scope>.card.attn',':scope>.lvdock',':scope>.card.flowc',':scope>.card.warn',':scope>.card.prodstrip',':scope>details.prodf',':scope>details.fbd',':scope>details.lrd:not(.fbd)'];
function bookPanes(m){if(!m.classList.contains('t-book'))return;
 let L=m.querySelector(':scope>.dkbl'),A=m.querySelector(':scope>.dkba');
 const found=ASIDE.map(s=>m.querySelector(s)||(L&&L.querySelector(s))).filter(Boolean);
 if(!A&&!found.length)return;
 if(!L){L=document.createElement('div');L.className='dkbl'}if(!A){A=document.createElement('aside');A.className='dkba'}
 found.forEach(n=>A.appendChild(n));
 /* keep the panel in its order even when something was slotted in later (attention lands before production) */
 ASIDE.forEach(s=>{const n=A.querySelector(s);if(n)A.appendChild(n)});
 [...m.children].forEach(n=>{if(n!==L&&n!==A&&n.id!=='tcdock'&&!n.classList.contains('tcscrim')&&!/^(SCRIPT|STYLE)$/.test(n.tagName))L.appendChild(n)});
 if(L.parentNode!==m)m.insertBefore(L,m.firstChild);if(A.parentNode!==m)L.after(A);m.classList.add('dk2')}

/* 3. roster table */
let RT=false;try{RT=localStorage.getItem('dk_rtab')==='1'}catch(e){}
let TS=null;/* {k,d} for the columns the game's own sort doesn't have (name, contract, salary) */
const COLS=[['name','Wrestler'],['ring','Ring'],['mic','Mic'],['pop','Pop'],['mor','Morale'],['sta','Stamina'],['dur','Durability'],['con','Contract'],['sal','Salary']];
const RSK=['ring','mic','pop','mor','sta','dur'];
window.dkRT=v=>{RT=!!v;try{localStorage.setItem('dk_rtab',RT?'1':'0')}catch(e){}render()};
window.dkRS=k=>{if(RSK.includes(k)){TS=null;if(rs!==k){rs=k}else return}else TS={k,d:TS&&TS.k===k?-TS.d:(k==='name'?1:-1)};render()};
const tone=v=>v>=85?'hi':v<40?'lo':v<60?'mid':'';
let lastRS=null;
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('main.t-roster>.mt .chip');if(c)TS=null},true);
function rosterTable(m){if(!m.classList.contains('t-roster'))return;
 /* picking one of the game's sort buttons drops a table-only sort (Wrestler, Contract, Salary) */
 if(typeof rs!=='undefined'){if(lastRS!==null&&rs!==lastRS)TS=null;lastRS=rs}const g=m.querySelector(':scope>.tcrg');const sr=m.querySelector(':scope>.mt');if(!g||!sr)return;
 if(!sr.querySelector('.dkvw'))sr.insertAdjacentHTML('beforeend',`<div class="dkvw" role="group" aria-label="View"><button class="${RT?'':'on'}" onclick="dkRT(0)">Cards</button><button class="${RT?'on':''}" onclick="dkRT(1)">Table</button></div>`);
 m.classList.toggle('dkrtab',RT);
 /* a table-only sort isn't one of the buttons, so none of them is lit */
 sr.querySelectorAll(':scope>.chips>.chip').forEach(c=>{const k=(c.getAttribute('onclick')||'').match(/rs='(\w+)'/);if(k)c.classList.toggle('on',!(RT&&TS)&&k[1]===rs)});
 const old=m.querySelector(':scope>.dkrt');if(!RT){if(old)old.remove();return}if(old)return;
 let l=[...g.querySelectorAll(':scope>[data-tcw]')].map(c=>S.w[c.dataset.tcw]).filter(Boolean);
 const val={name:w=>w.name.toLowerCase(),con:w=>w.own?w.con:-1,sal:w=>sal(w)};
 if(TS&&val[TS.k])l=l.slice().sort((a,b)=>{const x=val[TS.k](a),y=val[TS.k](b);return (x<y?-1:x>y?1:0)*TS.d});
 const onK=TS?TS.k:rs;
 const row=w=>{const t=titlesOf(w.id)[0];const s=sta(w),d=durOf(w);const mine=w.own==='p';
  return `<tr tabindex="0" data-id="${w.id}" onclick="showW('${w.id}')" onkeydown="if(event.key==='Enter'){showW('${w.id}')}"><td><span class="nm"><i class="al ${w.al==='f'?'':'hl'}"></i>${esc(w.name)}${t?` <span class="belt">${esc(t.n)}</span>`:''}${w.inj?` <span class="lo">${w.susp?'Suspended':'Hurt'} ${w.inj}w</span>`:''}</span></td>
  <td class="${tone(w.ring)}">${Math.round(w.ring)}</td><td class="${tone(w.mic)}">${Math.round(w.mic)}</td><td class="${tone(w.pop)}">${Math.round(w.pop)}</td>
  <td class="${mine?tone(w.mor):'dim'}">${mine&&typeof moodWord==='function'?`${esc(moodWord(w.mor)[1])} · `:''}${Math.round(w.mor)}</td>
  <td class="${s<50?'lo':s<75?'mid':''}">${Math.round(s)}</td><td class="${tone(d)}">${Math.round(d)}</td>
  <td class="${w.own&&w.con<=8?'mid':''}">${w.own?`${w.con} wk${w.con===1?'':'s'}`:'—'}</td><td>${money(sal(w))}</td></tr>`};
 g.insertAdjacentHTML('afterend',`<table class="dkrt"><thead><tr>${COLS.map(([k,n])=>`<th class="${k===onK?'on':''}" onclick="dkRS('${k}')">${n}${k===onK?(TS&&TS.d>0?' ▲':' ▼'):''}</th>`).join('')}</tr></thead><tbody>${l.map(row).join('')}</tbody></table>${l.length?'':'<p class="muted">Nobody matches those filters.</p>'}`)}

/* 4. step through the list in wrestler details */
let FL=null,FI=-1;
function listIds(){const m=mainEl();if(!m)return [];const inDraft=S&&S.phase==='draft';if(!inDraft&&!(typeof tab!=='undefined'&&tab==='roster'))return [];
 const src=m.querySelector(':scope>.dkrt')&&RT?[...m.querySelectorAll(':scope>.dkrt tr[data-id]')].map(r=>r.dataset.id):[...m.querySelectorAll('[data-tcw]')].filter(c=>!c.closest('#tcdock')).map(c=>c.dataset.tcw);
 return [...new Set(src)]}
if(typeof showW==='function'){const sw0=showW;
 showW=window.showW=function(id){const flip=FL&&FL._flip;const fromEd=typeof WD_BACK!=='undefined'&&!!WD_BACK;const out=sw0.apply(this,arguments);
  try{if(!flip){FL=desk()&&!fromEd?listIds():null}if(FL)FL._flip=false;FI=FL?FL.indexOf(id):-1;
   if(desk()&&FL&&FI>=0&&FL.length>1){const sh=document.querySelector('#modal>.sheet');if(sh&&sh.querySelector('.wdt')&&!sh.querySelector('.dkflip')){
    sh.insertAdjacentHTML('afterbegin',`<div class="dkflip"><button aria-label="Previous wrestler" title="Previous (←)" ${FI>0?'':'disabled'} onclick="dkFlip(-1)">‹</button><span>${FI+1} / ${FL.length}</span><button aria-label="Next wrestler" title="Next (→)" ${FI<FL.length-1?'':'disabled'} onclick="dkFlip(1)">›</button></div>`)}}}catch(e){}
  return out}}
window.dkFlip=d=>{if(!FL||FI<0)return;const j=FI+d;if(j<0||j>=FL.length)return;FL._flip=true;showW(FL[j]);const sh=document.querySelector('#modal>.sheet');if(sh)sh.scrollTop=0};
document.addEventListener('keydown',e=>{if((e.key!=='ArrowLeft'&&e.key!=='ArrowRight')||typing(e.target)||!desk()||!modalOpen()||!document.querySelector('#modal .dkflip'))return;e.preventDefault();dkFlip(e.key==='ArrowLeft'?-1:1)});

/* 5. hover info — the browser's own tooltip, so it only ever shows for a mouse, after a pause */
function tips(root){if(!desk()||!S||!S.w)return;(root||document).querySelectorAll('.tkc[data-tcw]:not([data-dkt])').forEach(c=>{const w=S.w[c.dataset.tcw];if(!w)return;c.setAttribute('data-dkt','');
  const st=c.querySelector('.tkst');if(st)st.title=`Ring ${Math.round(w.ring)} · Mic ${Math.round(w.mic)} · Popularity ${Math.round(w.pop)}`;
  const cc=c.querySelector('.tcc');if(cc&&!cc.title)cc.title=w.inj?`Out ${w.inj} more week${w.inj>1?'s':''}`:`Stamina ${Math.round(sta(w))}${w.own==='p'?` · Morale ${Math.round(w.mor)}`:''}`});
 (root||document).querySelectorAll('.tell.wild:not([title])').forEach(t=>t.title='Wild card: this one could land well above or below the guess');
 const hc=document.querySelectorAll('header.top .hudc');if(hc[2]&&!hc[2].title)hc[2].title='Bank'}

/* 7. draft */
function draftCols(m){m.classList.toggle('dkdraft',!!(S&&S.phase==='draft'))}

function layout(){if(!desk())return;const m=mainEl();if(m){try{bookPanes(m)}catch(e){console.warn('dk book',e)}try{rosterTable(m)}catch(e){console.warn('dk roster',e)}try{draftCols(m)}catch(e){}}
 try{goBtn()}catch(e){}try{tips()}catch(e){}}
if(typeof render==='function'){const r1=render;render=window.render=function(){const out=r1.apply(this,arguments);layout();return out}}
let lq=0;const mo3=new MutationObserver(()=>{if(!lq)lq=requestAnimationFrame(()=>{lq=0;layout()})});
function watch3(){layout();['app','modal'].forEach(id=>{const n=document.getElementById(id);if(n)mo3.observe(n,{childList:true,subtree:true})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch3);else watch3();
/* only when the window crosses the desktop width (phones resize constantly as the address bar slides — leave those alone) */
let rz=0,was=desk();window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const d=desk();if(d===was)return;was=d;if(typeof render==='function'&&S&&!live()&&!modalOpen()&&!document.getElementById('tut'))render()},200)});
})();
