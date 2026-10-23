/* Tony Khan Simulator — the start-of-week inbox (v234).
   Wrestlers knocking on the door with ideas, demands and requests, and the other out-of-the-ring calls that come with
   their own dialogue (front-office situations, medical calls, tampering, trade offers, signing offers, tapes and emails,
   teams in the making), used to sit inside the weekly briefing. Now they arrive as notifications at the start of the
   week: one at a time, each answered before you get to the briefing and the card. The briefing keeps the rest — the
   show, the locker room's mood, contracts, the calendar.
   How it works: the inbox is a queue built fresh from the game state each time (inboxList). Pitches and situations open
   their own decision screens; everything else is one row taken from the briefing's own sections (so the buttons and
   their effects are exactly the ones the briefing had), with a voice on top. While the inbox is open, closing a sheet
   or "going back to the briefing" brings you back to the next notification, until none are left — then the briefing
   opens. Loaded last; hooks in by wrapping openBrief, closeModal, briefItems, goLive, go and a few answer functions. */
'use strict';
(function(){
let ON_=false;          /* the inbox is the thing on screen (or about to come back) */
let N0=0;               /* how many were waiting when it opened, for the "2 of 3" count */
const DESK=[            /* briefing sections that are really decisions: one notification per row with a button in it */
 {k:'crisis-free',test:s=>false},
 {k:'tamp',test:s=>s.i==='🕵️'},
 {k:'med',test:s=>s.i==='🚑'&&/^Medical decisions/.test(s.t||'')},
 {k:'trade',test:s=>s.i==='🔁'&&/^Trade offers/.test(s.t||'')},
 {k:'cd',test:s=>s.i==='⏳'},
 {k:'oc',test:s=>s.i==='📝'},
 {k:'tape',test:s=>s.i==='📼'},
 {k:'team',test:s=>s.i==='🤝'}];
const deskKind=s=>{const d=DESK.find(d=>d.test(s));return d?d.k:null};
const isAsk=row=>/<button/.test(row);
let B0=null;            /* the briefing's sections before the inbox takes its rows out */
function allowed(){if(!S||S.phase!=='season')return false;if(typeof TV!=='undefined'&&TV)return false;if(typeof LIVE!=='undefined'&&LIVE)return false;
 if(ON()&&typeof myTurn==='function'&&!myTurn())return false;if(typeof mpLocked==='function'&&mpLocked())return false;return true}
const idIn=(row,fn)=>{const m=row.match(new RegExp(fn+"\\('([^']+)'"));return m?m[1]:null};
const firstName=w=>w.name.split(' ')[0];
function pickL(arr,seed){let h=0;const s=String(seed)+'|'+AW();for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return arr[Math.abs(h)%arr.length]}
/* a voice for each kind of notification — who's talking and what they say */
function voiceFor(k,row){
 if(k==='tamp'){const id=idIn(row,'tampMatch')||idIn(row,'tampTalk')||idIn(row,'tampLet');const w=id&&S.w[id];if(!w)return null;
  return [id,pickL([`I'm not going to lie to you. ${S.rival} called, and the money is real. I'd rather stay — but I need to hear that you want me here.`,
   `${S.rival} made me an offer. I haven't said yes. I haven't said no either. Your move.`,
   `Everybody's going to hear about it anyway, so you might as well hear it from me: ${S.rival} wants me.`],id)]}
 if(k==='med'){const id=idIn(row,'injAct');const w=id&&S.w[id];if(!w)return null;
  return ["The trainer",pickL([`${firstName(w)} is out ${w.inj} week${w.inj===1?'':'s'} if we let it heal. I can get them back sooner, but I won't promise they stay in one piece.`,
   `It's not great, boss. ${w.inj} week${w.inj===1?'':'s'} the safe way. Your call on how hard we push it.`,
   `${firstName(w)} wants to be back tomorrow. They always do. Here are the real options.`],id)]}
 if(k==='trade')return [S.rival,pickL(['I put something on your desk. Have a look before I change my mind.','Fair deal for both of us. You know it is.','I think this helps us both. Let me know by the end of the week.'],row.length)];
 if(k==='cd'){const c=typeof cdOfferLive==='function'&&cdOfferLive();const w=c&&S.w[c.x];if(!w)return null;
  return [w.id,pickL([`I told you I'd be there when it hit zero. Now let's talk about where I go next.`,`You saw what happened out there. Every company in the business saw it. Make me an offer.`],w.id)]}
 if(k==='oc'){const o=typeof ocOfferLive==='function'&&ocOfferLive();const w=o&&S.w[o.id];if(!w)return null;
  return [w.id,pickL([`You gave me a shot out there. Give me a contract and I'll prove it wasn't a fluke.`,`I answered the challenge. Now I'm asking one: put me on the roster.`],w.id)]}
 if(k==='team'){const ks=row.match(/tsOpen\('([^']+)'/);const ids=ks?ks[1].split(/[|,]/).filter(x=>S.w[x]):[];if(!ids.length)return null;
  return [ids[0],pickL(['We keep ending up in the same corner. Might as well make it official.','People are already calling us a team. Give us a name and let\'s go win something.'],ids[0])]}
 return null}
const KIND={tamp:['🕵️','A tampering rumor'],med:['🚑','A medical call'],trade:['🔁','A trade offer'],cd:['⏳','The countdown debut'],oc:['📝','A contract offer'],tape:['📼','Tapes & emails'],team:['🤝','A team in the making']};
/* ---- what's waiting ---- */
function inboxList(){if(!allowed())return [];const out=[];
 if(S.crisis&&S.w[S.crisis.a]&&S.w[S.crisis.a].own==='p'&&typeof CRISES!=='undefined'&&CRISES[S.crisis.k])out.push({k:'crisis',open:()=>openCrisis()});
 if(S.pitch&&typeof PITCHES!=='undefined'&&PITCHES[S.pitch.k]&&S.w[S.pitch.a]&&S.w[S.pitch.a].own==='p')out.push({k:'pitch',open:()=>openPitch()});
 let secs=[];try{secs=B0?B0():[]}catch(e){console.warn('inbox',e)}
 const order=['tamp','med','trade','cd','oc','tape','team'];
 secs.map(s=>({s,k:deskKind(s)})).filter(x=>x.k).sort((a,b)=>order.indexOf(a.k)-order.indexOf(b.k)).forEach(({s,k})=>(s.rows||[]).forEach(row=>{if(isAsk(row))out.push({k,row,s})}));
 return out}
window.inboxList=inboxList;
window.inboxCount=()=>{try{return inboxList().length}catch(e){return 0}};
function head(n,left){return `<div class="ibx-k"><span class="live-tag" style="background:var(--gold);color:#111">INBOX</span>Before the week starts · ${n} of ${n+left-1}</div>`}
function voiceH(sp,line){const w=S.w[sp];const av=w?`<span class="scav">${face(w)}</span>`:`<span class="scav x">${esc(String(sp).replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'?')}</span>`;
 return `<div class="scs">${av}<div class="scq"><b class="${w?(w.al==='h'?'heel':'face'):''}">${esc(w?w.name:sp)}</b><q>${esc(line)}</q></div></div>`}
function deskPage(x,pos,left){const [ic,nm]=KIND[x.k]||[x.s.i,x.s.t];const v=voiceFor(x.k,x.row);
 return `${head(pos,left)}<div class="h mhd mt">${ic} ${esc(nm)}</div><div class="scene brief ibx">${v?voiceH(v[0],v[1]):''}${x.row}</div><p class="muted tiny center" style="margin-top:10px">Answer it to move on.</p>`}
/* ---- showing it ---- */
function stamp(pos,left){const m=document.querySelector('#modal .sbody');if(!m)return;
 /* a pitch can't be put off from the inbox, and the count sits on top of every decision screen */
 m.querySelectorAll('button.btn.ghost').forEach(b=>{if(/Decide later/.test(b.textContent))b.remove()});
 if(!m.querySelector('.ibx-k'))m.insertAdjacentHTML('afterbegin',head(pos,left))}
function openInbox(){const l=inboxList();if(!l.length){ON_=false;N0=0;return false}
 if(!ON_){ON_=true;N0=l.length}const pos=Math.max(1,N0-l.length+1);const x=l[0];
 try{if(x.open){x.open();stamp(pos,l.length)}else openModal(deskPage(x,pos,l.length))}catch(e){console.warn('inbox',e);ON_=false;return false}
 return true}
window.openInbox=openInbox;
/* once the last one is answered, the briefing */
function finish(){ON_=false;N0=0;if(typeof _ob==='function')_ob()}
/* ---- hooks ---- */
const _ob=window.openBrief;
if(typeof _ob==='function')window.openBrief=openBrief=function(){if(allowed()&&inboxList().length){openInbox();return}if(ON_){ON_=false;N0=0}return _ob.apply(this,arguments)};
const _cm=window.closeModal;
window.closeModal=closeModal=function(){const r=_cm.apply(this,arguments);
 if(ON_){setTimeout(()=>{const m=document.getElementById('modal');if(!ON_||!m||!m.classList.contains('hidden'))return;if(!allowed()){ON_=false;return}if(inboxList().length)openInbox();else finish()},40)}
 return r};
/* the briefing keeps everything that isn't a decision */
if(typeof briefItems==='function'){B0=window.briefItems||briefItems;window.briefItems=briefItems=function(){const sec=B0.apply(this,arguments);if(!allowed())return sec;
 return sec.map(s=>{if(!deskKind(s))return s;const rows=(s.rows||[]).filter(r=>!isAsk(r));return rows.length?Object.assign({},s,{rows,u:0}):null}).filter(Boolean)}}
/* the decision screens' "done" buttons carry on to the next notification */
function nextBtn(){const m=document.querySelector('#modal .sbody');if(!m||!ON_)return;const left=inboxList().length;
 m.querySelectorAll('button.btn').forEach(b=>b.remove());m.insertAdjacentHTML('beforeend',`<button class="btn" onclick="closeModal()">${left?`Next (${left} more) ▸`:'On to the briefing ▸'}</button>`)}
['pitchChoose','crisisChoose'].forEach(fn=>{const f=window[fn];if(typeof f!=='function')return;window[fn]=function(){const r=f.apply(this,arguments);try{if(ON_)nextBtn()}catch(e){}return r}});
/* nothing goes live with a notification unanswered, and the Book screen brings them up first */
if(typeof goLive==='function'){const g0=goLive;goLive=window.goLive=function(){if(allowed()&&inboxList().length){openInbox();return}return g0.apply(this,arguments)}}
if(typeof go==='function'){const g1=go;go=window.go=function(t){const r=g1.apply(this,arguments);if(t==='book'&&allowed()){setTimeout(()=>{const m=document.getElementById('modal');if(m&&m.classList.contains('hidden')&&inboxList().length)openInbox()},120)}return r}}
/* a strip on Home in case anything is still waiting */
window.inboxStrip=function(){let n=0;try{n=inboxList().length}catch(e){}if(!n)return '';
 return `<button class="card bstrip hot" onclick="openInbox()"><span class="bsn">${n}</span><span class="bst"><b>📨 Waiting on your answer</b><span>${n===1?'One notification':n+' notifications'} to answer before the week starts</span></span><span class="bsc">›</span></button>`};
(function(){const c=document.createElement('style');c.textContent=`#modal .ibx-k{font-size:12px;color:var(--mut);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
#modal .ibx .brow{border-top:1px solid var(--line);padding-top:10px;margin-top:10px}#modal .ibx .scs+.brow{margin-top:12px}`;document.head.appendChild(c)})();
})();
