/* Tony Khan Simulator — solo TV (v262).
   Put a solo game on the TV, exactly like party night, so the TV side (the booking screen and locker-room feed, your live
   show mirrored as you make the calls, the results reveal, sound) can be tried without a second GM.
   How: the solo game keeps a copy of itself on an ordinary two-seat league document (both seats are this device; the rival
   is the computer GM), shaped the way the TV expects a party-night league to look. The TV joins it with "Show a league on
   this screen" and the code, and nothing on the TV side needs to know it's a solo game.
   Phone side only. Loaded after party.js and feed.js. */
'use strict';
let STV=null; /* {code, rev, liveSent} while this device's solo game is on a TV */
const STV_KEY='tksim_stv';
try{const v=JSON.parse(localStorage.getItem(STV_KEY)||'null');if(v&&/^[A-Z0-9]{6}$/.test(v.code))STV={code:v.code,rev:+v.rev||0,liveSent:false}}catch(e){}
function stvKeep(){try{if(STV)localStorage.setItem(STV_KEY,JSON.stringify({code:STV.code,rev:STV.rev}));else localStorage.removeItem(STV_KEY)}catch(e){}}
function stvOn(){return !!(STV&&typeof S!=='undefined'&&S&&!S.online&&typeof TV!=='undefined'&&!TV)}
function stvLive(){return typeof LIVE!=='undefined'&&!!LIVE}
/* the solo game, shaped like a two-GM party-night league as seen from seat s0 (you) — the rival is s1 and always "locked in" */
function stvSnap(){const c=JSON.parse(JSON.stringify(S));const gm=S.gm||'You',rv=S.rival||'Rival',sn=showNames(),live=stvLive();
 c._view={me:'s0',opp:'s1'};toCanon(c);c.names={s0:gm,s1:rv};
 c.online={n:2,party:true,sim:false,solo:true,show:{s0:sn.p||'Dynamite',s1:sn.ai||'Collision'},booked:{s0:live,s1:true},lv:{},order:['s0','s1'],rev:STV.rev+1,turn:'s0'};
 if(live)c.online.live={order:['s0']};
 if(c.phase==='draft'&&typeof onClock==='function'){try{const k=onClock();c.online.turn=k==='ai'?'s1':'s0'}catch(e){}}
 return {state:JSON.stringify(c),rev:STV.rev+1,names:c.names,shows:c.online.show,week:c.week,season:c.season,phase:c.phase,n:2}}
let STV_T=null,STV_BUSY=false,STV_AGAIN=false;
function stvPush(){clearTimeout(STV_T);STV_T=null;if(!stvOn()||!window.TKO||!TKO.ready)return;
 if(STV_BUSY){STV_AGAIN=true;return}
 let f;try{f=stvSnap()}catch(e){console.warn('solo TV',e);return}
 STV_BUSY=true;STV.liveSent=stvLive();const code=STV.code;
 TKO.push(code,f).then(()=>{if(STV&&STV.code===code){STV.rev=f.rev;stvKeep()}}).catch(e=>console.warn('solo TV push failed',e))
  .finally(()=>{STV_BUSY=false;if(STV_AGAIN){STV_AGAIN=false;stvPush()}})}
/* called from save(): send the latest copy shortly (several saves in a row become one) */
function stvSoon(){if(!stvOn())return;clearTimeout(STV_T);STV_T=setTimeout(stvPush,1200)}
/* the live mirror is about to be sent (party.js partyFeed): make sure the TV knows you've gone live first */
function stvBeforeFeed(){if(!stvOn())return;if(stvLive()&&!STV.liveSent)stvPush()}
function stvCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];return c}
async function stvStart(){if(!S||S.online)return;
 if(typeof mpAvail==='function'&&!mpAvail())return typeof mpNeedSetup==='function'?mpNeedSetup():toast('Online play isn\'t set up yet.');
 if(!window.TKO||!TKO.ready||!TKO.soloTv)return toast('Online play is still loading — try again in a moment.');
 if(!navigator.onLine)return toast('You need a connection to put the game on a TV.');
 const keep=STV&&STV.code;toast('Setting up the TV…');
 for(let i=0;i<4;i++){const code=i===0&&keep?keep:stvCode();
  STV={code,rev:STV&&STV.code===code?STV.rev:0,liveSent:false};
  try{await TKO.soloTv(code,stvSnap());STV.rev+=1;stvKeep();render();stvShow();return}
  catch(e){if(String(e&&e.message).includes('taken'))continue;console.warn(e);STV=null;stvKeep();render();return toast(navigator.onLine?'Couldn\'t reach the TV service — try again.':'You need a connection to put the game on a TV.')}}
 STV=null;stvKeep();toast('Couldn\'t find a free TV code — try again.')}
function stvStop(){clearTimeout(STV_T);STV=null;stvKeep();if(typeof closeModal==='function')closeModal();render();toast('Your game is off the TV.')}
function stvShow(){if(!STV)return;openModal(`<i class="mp-ok" hidden></i><div class="h mhd">📺 Your game is on the TV</div>
 <p>On the TV (or a laptop hooked up to it): open the game, tap <b>Show a league on this screen</b> and enter</p>
 <div style="font:900 italic 40px/1 'BC',sans-serif;letter-spacing:8px;text-align:center;margin:10px 0 14px" class="gold">${esc(STV.code)}</div>
 <p class="muted">It works just like party night with you as the only GM: the TV shows your booking night and office answers, mirrors your live show while you make the calls here, then plays the results. Your phone stays quiet — the TV has the sound. The computer GM's show counts as locked in.</p>
 <p class="muted tiny">Use a different device (or a different browser) for the TV — a browser that's showing a TV opens as the TV until you tap Exit TV.</p>
 <button class="btn" onclick="closeModal()">Got it</button><button class="btn ghost danger" onclick="stvStop()">Take it off the TV</button>`)}
/* Office → solo game */
function stvOfficeCard(){if(!S||S.online)return '';const on=!!STV;
 return `<div class="card"><div class="h small">📺 Solo TV</div><div class="muted tiny" style="margin:2px 0 8px">${on?`Your solo game is on the TV · code <b class="gold">${esc(STV.code)}</b>`:'Try the party-night TV on your own: put this game on a TV and play it from your phone.'}</div>
 ${on?`<div class="row"><button class="btn sec" onclick="stvShow()">Show the code</button><button class="btn ghost danger" onclick="stvStop()">Take it off the TV</button></div>`:`<button class="btn sec" onclick="stvStart()">Put my game on a TV</button>`}</div>`}
/* pick up where we left off after a reload */
window.addEventListener('tko-ready',()=>{if(stvOn())stvSoon()});
