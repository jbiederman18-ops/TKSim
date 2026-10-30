/* Tony Khan Simulator — the locker-room feed (v258).
   On party night, every time a GM answers someone in their office (a pitch, a demand, a front-office situation, a team
   in the making…), the TV plays it for the room while everyone books: the ring bell, the wrestler's own line, then the
   GM's answer stamped underneath. Tampering, the trainer, trade offers and tapes are strategy, so the TV only teases
   them — who got the call or the visit, never the money, the weeks out or the trade.
   Phone side: inbox.js says which visit is on screen (inboxCur); the first answer tapped on it is sent to the league
   doc under office.<seat> (the last few per GM, outside the shared save so it never conflicts with anyone's booking).
   TV side: new visits queue up and play one at a time on the booking screen (tvWeek), with the GM's tile marked
   "In the office" while theirs is up and answered visits folding into an "Earlier tonight" list.
   Loaded after inbox.js and sfx.js. */
'use strict';
(function(){
const esc_=s=>typeof esc==='function'?esc(s):String(s==null?'':s);
/* ===================== phone: send what was answered ===================== */
let SENT=[],SENT_CODE=null;
const SKIP=/next one|Line's clear|Decide later|Back to (the briefing|work)|Got it|^Cancel$/i;
const NO=/^(no\b|not\b|nope|refuse|decline|pass\b|turn (it|them|him|her) down|shoot|deny|reject|say no|stick to|keep (it|things)|let (it|them) go|ignore|walk away|hang up|tell (them|him|her) no)/i;
const YES=/^(yes\b|give|approve|sign|go for it|let'?s|make it|agree|accept|pay|grant|sure|do it|ok\b|name the team|put|book|send|bring|promote|green.?light|you'?ve got|match the offer)/i;
function answerOf(b,cur){const lab=((b.querySelector('.key+div')||b).textContent||'').replace(/\s+/g,' ').trim().slice(0,90);
 if(cur.tease)return {ans:'hid',a:''};
 const oc=b.getAttribute('onclick')||'';
 if(/pitchChoose\('no'\)/.test(oc))return {ans:'no',a:lab};if(/pitchChoose\('(go|try)'\)/.test(oc))return {ans:'yes',a:lab};
 const t=lab.replace(/^[^\w"“]+/,'');return {ans:NO.test(t)?'no':YES.test(t)?'yes':'call',a:lab}}
function send(ev){if(typeof LMP==='undefined'||!LMP||!window.TKO||!TKO.ready)return;if(SENT_CODE!==LMP.code){SENT=[];SENT_CODE=LMP.code}
 SENT=SENT.concat([ev]).slice(-5);TKO.push(LMP.code,{['office.'+LMP.me]:SENT}).catch(()=>{})}
document.addEventListener('click',e=>{try{
 if(typeof partyOn!=='function'||!partyOn()||typeof window.inboxCur!=='function')return;const cur=window.inboxCur();if(!cur||cur.sent)return;
 const b=e.target&&e.target.closest&&e.target.closest('#modal .sbody button');if(!b||b.disabled||b.classList.contains('ghost'))return;
 const lab=(b.textContent||'').trim();if(SKIP.test(lab))return;
 cur.sent=1;const r=answerOf(b,cur);
 send({id:LMP.me+'-'+Date.now(),seat:LMP.me,wk:S.week,ss:S.season,kick:cur.kick||'',head:cur.head||'',q:cur.tease?'':(cur.q||''),narr:cur.narr?1:0,w:cur.w||null,w2:cur.w2||null,tease:cur.tease?1:0,ans:r.ans,a:r.a,at:Date.now()})
}catch(err){console.warn('feed',err)}},true);

/* ===================== TV: play them for the room ===================== */
const F={seen:new Set(),init:false,q:[],cur:null,stamped:false,past:[],t:null,iv:null};
const HOLD=8000,HOLD_BUSY=5500,STAMP_AT=2600;
const gmName=seat=>{try{return nameOf(localKey(seat))}catch(e){return 'A GM'}};
function onScreen(){return !!document.getElementById('lrf')}
function take(d){if(!d||!d.office||!S)return;const now=Date.now();
 Object.values(d.office).forEach(l=>(Array.isArray(l)?l:[]).forEach(ev=>{if(!ev||!ev.id||F.seen.has(ev.id))return;F.seen.add(ev.id);
  if(!F.init||now-(ev.at||0)>180000||ev.ss!==S.season||ev.wk!==S.week)return;F.q.push(ev)}));
 F.init=true;next()}
function next(){if(F.cur)return;F.q=F.q.filter(ev=>S&&ev.ss===S.season&&ev.wk===S.week&&Date.now()-(ev.at||0)<300000);if(!F.q.length)return;if(!onScreen()){if(!F.iv)F.iv=setInterval(()=>{if(onScreen()){clearInterval(F.iv);F.iv=null;next()}},700);return}
 const ev=F.q.shift();F.cur=ev;F.stamped=false;draw(true);if(window.SFX)SFX.play('bell2');
 clearTimeout(F.t);F.t=setTimeout(()=>{F.stamped=true;draw('stamp');if(window.SFX)SFX.play(ev.ans==='yes'?'yes':ev.ans==='no'?'no':ev.ans==='hid'?'door':'confirm');
  F.t=setTimeout(()=>{F.past.unshift(ev);F.past=F.past.slice(0,3);F.cur=null;draw(false);next()},(F.q.length?HOLD_BUSY:HOLD)-STAMP_AT)},STAMP_AT)}
function pic(ev){const w=ev.w&&S.w[ev.w];if(w)return `<div class="lrf-pic ${w.al==='f'?'f':'h'}">${typeof portrait==='function'?portrait(w):''}</div>`;
 return `<div class="lrf-pic x"><span>${esc_((ev.kick||'').split(' ')[0]||'📞')}</span></div>`}
function stampTxt(ev){const n=esc_(gmName(ev.seat));return ev.ans==='yes'?`✓ ${n} says yes`:ev.ans==='no'?`✕ ${n} says no`:ev.ans==='hid'?'🔒 Behind closed doors':`${n}'s call`}
function card(ev,anim){const n=esc_(gmName(ev.seat));const hid=ev.ans==='hid';
 return `<div class="lrf-card${anim===true?' in':''}">${pic(ev)}<div class="lrf-b"><div class="lrf-k">${n}'s office <em>· ${esc_(ev.kick)}</em></div><div class="lrf-h">${esc_(ev.head)}</div>
  <div class="lrf-q${ev.tease||ev.narr?' t':''}">${ev.tease?(ev.w?`${n} is taking a private meeting. The door closes.`:`${n} shuts the door to deal with it.`):esc_(ev.q)}</div>
  <div class="lrf-a ${ev.ans}${F.stamped?' on':''}${anim==='stamp'?' go':''}"><span class="lrf-who">${stampTxt(ev)}</span>${hid?`<span class="lrf-what">${n} made the call</span>`:ev.a?`<span class="lrf-what">${esc_(ev.a)}</span>`:''}</div></div></div>`}
function inner(anim){const c=F.cur;
 return `<div class="lrf-hd"><span class="lrf-tag">● LOCKER ROOM</span><span>Live from the offices</span><i></i></div>
 <div class="lrf-stage">${c?card(c,anim):`<div class="lrf-idle">${F.past.length?'Quiet backstage… for now':'Quiet backstage…<br>the line forms when the GMs open their offices'}</div>`}</div>
 ${F.past.length?`<div class="lrf-past">${F.past.slice(0,c?2:3).map(ev=>`<div class="lrf-pr"><span class="k">${esc_(gmName(ev.seat))}</span><span><b>${esc_(ev.tease?ev.head:(ev.w&&S.w[ev.w]?S.w[ev.w].name+(ev.w2&&S.w[ev.w2]?' & '+S.w[ev.w2].name:''):ev.head))}</b> · ${esc_(ev.tease?'a closed-door visit':(ev.kick||'').replace(/^\S+\s/,'').toLowerCase())}</span><span class="r ${ev.ans}">${ev.ans==='hid'?'Answered':ev.ans==='yes'?'Yes':ev.ans==='no'?'No':'Decided'}</span></div>`).join('')}</div>`:''}`}
function draw(anim){const el=document.getElementById('lrf');if(el)el.innerHTML=inner(anim);
 document.querySelectorAll('.tv-gm[data-seat]').forEach(t=>t.classList.toggle('office',!!F.cur&&t.dataset.seat===F.cur.seat))}
/* the booking screen asks for this (party.js tvWeek) */
window.lrfHtml=function(){if(!S||!S.online||!S.online.party)return '';return `<div id="lrf" class="lrf">${inner(false)}</div>`};
window.lrfSeat=()=>F.cur?F.cur.seat:null;
if(typeof tvIncoming==='function'){const t0=tvIncoming;window.tvIncoming=tvIncoming=function(d){const out=t0.apply(this,arguments);try{if(typeof TV!=='undefined'&&TV)take(d)}catch(e){console.warn('feed',e)}return out}}
/* leaving the TV starts fresh next time */
if(typeof tvStop==='function'){const s0=tvStop;window.tvStop=tvStop=function(){F.seen.clear();F.init=false;F.q=[];F.cur=null;F.past=[];clearTimeout(F.t);return s0.apply(this,arguments)}}

const css=`
.lrf{margin-top:22px}
.lrf-hd{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.lrf-tag{background:var(--gold);color:#16120a;font:900 italic 16px/1 'BC',sans-serif;padding:6px 12px 5px;clip-path:var(--sl,polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%));letter-spacing:.08em}
.lrf-hd>span:not(.lrf-tag){font:800 italic 17px/1 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.lrf-hd i{flex:1;height:2px;background:linear-gradient(90deg,var(--line),transparent)}
.lrf-stage{min-height:230px}
.lrf-idle{min-height:200px;display:grid;place-items:center;text-align:center;color:var(--mut);font:800 italic 24px/1.3 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;border:1px dashed var(--line);clip-path:var(--cut)}
.lrf-card{display:grid;grid-template-columns:200px minmax(0,1fr);background:linear-gradient(180deg,#1b1c21,#111216);clip-path:var(--cut);box-shadow:inset 0 5px 0 var(--red);overflow:hidden;min-height:230px}
.lrf-card.in{animation:lrfIn .5s cubic-bezier(.2,.8,.2,1) both}
@keyframes lrfIn{from{transform:translateX(60px);opacity:0}to{transform:none;opacity:1}}
.lrf-card.in .lrf-pic{animation:lrfFlash .9s ease-out}@keyframes lrfFlash{0%{filter:brightness(2.2)}100%{filter:none}}
.lrf-card.in .lrf-q{animation:lrfQ .6s .35s both}@keyframes lrfQ{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.lrf-pic{position:relative;background:radial-gradient(80% 60% at 50% 30%,#2a2b31,#121317);overflow:hidden;display:flex;align-items:stretch}
.lrf-pic>*{width:100%;height:100%;object-fit:cover}.lrf-pic img{object-position:50% 15%}
.lrf-pic.f{box-shadow:inset 6px 0 0 var(--face)}.lrf-pic.h{box-shadow:inset 6px 0 0 var(--heel)}
.lrf-pic.x{display:grid;place-items:center}.lrf-pic.x>span{width:auto;height:auto;font-size:84px;line-height:1;filter:grayscale(.2)}
.lrf-b{padding:20px 26px 18px;display:flex;flex-direction:column;gap:10px;min-width:0}
.lrf-k{font:800 italic 16px/1 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}.lrf-k em{font-style:inherit;color:var(--mut)}
.lrf-h{font:900 italic 38px/1.02 'BC',sans-serif;text-transform:uppercase;text-wrap:balance}
.lrf-q{background:#0b0b0d;border-left:4px solid var(--gold);padding:10px 16px;font-size:21px;line-height:1.35;font-weight:500}
.lrf-q.t{border-left-color:var(--mut);color:var(--mut);font-style:italic}
.lrf-a{display:flex;align-items:center;gap:14px;margin-top:auto;opacity:0}
.lrf-a.on{opacity:1}.lrf-a.go{animation:lrfStamp .45s cubic-bezier(.2,1.4,.4,1) both}
@keyframes lrfStamp{from{opacity:0;transform:translateX(-24px) scale(1.15)}to{opacity:1;transform:none}}
.lrf-who{font:900 italic 21px/1 'BC',sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:9px 16px 8px;clip-path:var(--sl,polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%));white-space:nowrap;background:var(--gold);color:#16120a}
.lrf-a.no .lrf-who{background:var(--red);color:#fff}.lrf-a.hid .lrf-who{background:#3a3b42;color:var(--text)}.lrf-a.call .lrf-who{background:#2a2412;color:var(--gold2);box-shadow:inset 0 0 0 1px var(--gold)}
.lrf-what{font-size:20px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lrf-past{margin-top:12px;display:flex;flex-direction:column;gap:6px}
.lrf-pr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;font-size:17px;color:var(--mut);padding:7px 14px;background:var(--st2,#101115);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.lrf-pr b{color:var(--text);font-weight:600}.lrf-pr>span:nth-child(2){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lrf-pr .k{font:800 italic 14px/1 'BC',sans-serif;letter-spacing:.1em;color:var(--gold);text-transform:uppercase}
.lrf-pr .r{font:800 italic 14px/1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase}.lrf-pr .r.yes{color:var(--gold2)}.lrf-pr .r.no{color:var(--bad)}
.tv-gm.office{box-shadow:inset 0 4px 0 var(--gold)}
.tv-gm.office .tv-lock{font-size:0}.tv-gm.office .tv-lock::after{content:'🚪 In the office';font-size:clamp(16px,1.1vw,22px);color:var(--gold2)}
@media (prefers-reduced-motion:reduce){.lrf-card.in,.lrf-a.go,.lrf-card.in .lrf-pic,.lrf-card.in .lrf-q{animation:none}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
