/* Tony Khan Simulator — Party night.
   Party night is a way to play an online league, not a separate game: same league, same save, same code.
   - Any GM turns it on from their phone (Office → Party night). While it's on, everyone creates wrestlers and
     books their show at the same time instead of taking turns, and the week airs as soon as the last GM locks in.
   - Any screen can be the TV: open the game there, tap "Show a league on this screen" and enter the league code.
     The TV only watches the league. It shows who's still booking and plays each week's results segment by segment.
   - Once every card is locked in, the GMs go live one at a time: the TV shows that GM's promo beats and match
     calls as they happen (choices and all), the GM makes the call on their phone while the room shouts advice,
     and when the last GM wraps up the week airs.
   - Turn party night off (or just walk away) and the league goes back to taking turns from exactly where it is.
   Because several phones save at the same time, each save is merged into the league as it is right now
   (a 3-way merge against the version that phone started from) inside a Firestore transaction. If two phones
   change the same shared thing at once (say, both sign the same free agent), the first one wins and the other
   phone is refreshed. */
'use strict';
let TV=null;
const TV_KEY='tksim_tv';
const PJ=x=>JSON.stringify(x);
/* the old party mode (phones talking to the TV directly) was replaced by party night; clear its leftovers */
try{['tksim_party_game','tksim_party_host','tksim_party_join'].forEach(k=>localStorage.removeItem(k))}catch(e){}

function partyOn(){return !!(typeof S!=='undefined'&&S&&S.online&&S.online.party&&!TV)}
function partyNid(){return (S.nid++)+(ON()&&LMP&&!TV?LMP.me:'')}

/* ===================== merging one phone's changes into the league ===================== */
function isObj(x){return x&&typeof x==='object'&&!Array.isArray(x)}
function merge3(base,host,mine,path,conf){
 const jb=PJ(base),jh=PJ(host),jm=PJ(mine);
 if(jm===jb||jm===jh)return host;
 if(jh===jb)return mine;
 const k=path[path.length-1],top=path.length===1;
 if(top&&k==='nid')return Math.max(host||0,mine||0);
 if(Array.isArray(host)&&Array.isArray(mine)){
  if(top&&k==='news'){const seen=new Set((base||[]).map(PJ)),hs=new Set(host.map(PJ));return host.concat(mine.filter(x=>!seen.has(PJ(x))&&!hs.has(PJ(x)))).slice(-80)}
  if(top&&(k==='touched'||k==='pseen'))return Array.from(new Set(host.concat(mine))).slice(k==='pseen'?-45:-9999);
  conf.push(path.join('.'));return host}
 if(isObj(host)&&isObj(mine)){const b=isObj(base)?base:{};const out={};
  for(const key of new Set([...Object.keys(host),...Object.keys(mine),...Object.keys(b)])){
   const v=merge3(b[key],host[key],mine[key],path.concat(key),conf);if(v!==undefined)out[key]=v}
  return out}
 conf.push(path.join('.'));return host}
/* the turn message is per-save, not shared state: never let it cause a conflict */
function noMsg(st){if(st&&st.online)delete st.online.msg;return st}

/* the league version this device's game is built on (kept in memory; set whenever we load or save the league) */
let MP_BASE=null,MPX=null,MP_HELD=null,MP_TX=false,MP_OFFLINE_TOLD=0;
function mpSetBase(rev,str){MP_BASE=LMP?{code:LMP.code,rev,str}:null}
function mpBase(){if(MP_BASE&&LMP&&MP_BASE.code===LMP.code)return MP_BASE;
 /* after a restart: the version an unsent change was based on was kept on the device */
 if(LMP){try{const u=JSON.parse(LS.get(mpUnsentKey(LMP.code))||'null');if(u&&u.str)return MP_BASE={code:LMP.code,rev:u.rev,str:u.str}}catch(e){}}return null}

/* move the league along on a scratch copy (inside the save transaction): the draft starts once everyone has
   created wrestlers, and the week airs once everyone is locked in. Only on party night — taking turns does
   this on the phone of whoever goes last. */
function partyAdvance(st,me){const keep=S,keepTab=typeof tab!=='undefined'?tab:null;let msg='';MP_TX=true;
 try{S=viewFor(st,me);ensureTraits(S);const o=S.online;
  o.rk=o.rk||{};o.booked=o.booked||{};o.auto=o.auto||{};
  if(o.party&&S.phase==='rookies'&&localSeats().every(k=>o.rk[k])){startDraft();o.turn=onClock();msg=`Party night: the draft is on and ${nameOf(o.turn)} picks first!`}
  /* league drafts (party night or not): whoever saves next makes the picks for any GM on auto-draft who's on the
     clock, so auto-draft keeps going even when that GM's phone is closed */
  if(S.phase==='draft'&&o.auto[onClock()]){const was=onClock();let guard=0;while(S.phase==='draft'&&guard++<400){const oc=onClock();if(!o.auto[oc])break;const c=draftChoice(oc);if(!c){finishDraft();break}draftPick(c.id,oc)}
   if(S.phase==='draft'){o.turn=onClock();if(o.turn!==was)msg=`The auto-drafters have picked — you're on the clock in round ${S.draft.round}.`}
   else{o.booked={};o.order=bookingOrder();o.turn='p';msg='The draft is complete — time to book week 1!'}}
  if(!o.party)return {st:canonState(),msg};
  if(S.phase==='season'&&localSeats().every(k=>o.booked[k])){o.lv=o.lv||{};
   /* everyone's locked in: GMs go live on the TV one at a time, then the week airs */
   if(!o.live){o.live={order:(o.order&&o.order.length?o.order:bookingOrder()).filter(k=>!o.lv[k])};const n=partyLiveNow();if(n)msg=`🔴 ${nameOf(n)} is live on the TV!`}
   if(!partyLiveNow()){const wk=S.week;airShow();o.booked={};o.order=bookingOrder();delete o.live;o.lv={};msg=`Week ${wk} results are in!`}}
  return {st:canonState(),msg}}
 finally{S=keep;MP_TX=false;if(keepTab!==null)tab=keepTab}}

/* runs inside the transaction (possibly more than once) */
function mpMergeTx(d,sent,base,me,msg){
 const curRev=d.rev||0;let cur;try{cur=JSON.parse(d.state)}catch(e){return {conflict:['bad'],d}}
 const mine=JSON.parse(sent);let merged;
 if(base?base.rev===curRev:(mine.online.rev||0)===curRev)merged=mine;
 else if(base){const conf=[];merged=merge3(noMsg(JSON.parse(base.str)),noMsg(cur),noMsg(mine),[],conf);if(conf.length)return {conflict:conf,d}}
 else return {conflict:['nobase'],d};
 const a=partyAdvance(merged,me),out=a.st;out.online.rev=curRev+1;out.online.msg=a.msg||msg||'';
 const str=PJ(out);
 return {fields:{state:str,rev:curRev+1,turn:out.online.turn,msg:out.online.msg,week:out.week,season:out.season,phase:out.phase},str,rev:curRev+1,d}}

/* send this device's game to the league. Called by mpPush. */
async function leaguePush(retried){
 if(!ON()||!LMP||TV)return;
 if(MPX){MPX.again=true;return}
 const L=LMP,code=L.code,me=L.me,base=mpBase(),msg=S.online.msg||'';
 const sent=PJ(canonState()),seq=mpUnsentSeq(code);
 const X=MPX={again:false};let r=null,err=null;
 try{r=await TKO.pushMerge(code,d=>mpMergeTx(d,sent,base,me,msg))}catch(e){err=e}
 MPX=null;
 if(!LMP||LMP.code!==code||!S||!ON())return;
 if(err){const m=String(err&&(err.code||err.message)||err);
  if(!retried&&m.includes('permission')){/* this seat was last used on another device: take it back, then retry */
   try{await TKO.claim(code,L.key);return leaguePush(true)}catch(e){}}
  if(partyOn()){/* party night never writes blind: keep the changes here and merge them in once we're back */
   MP_PENDING=true;if(Date.now()-MP_OFFLINE_TOLD>30000){MP_OFFLINE_TOLD=Date.now();toast('📡 Saved on this phone — it will sync when the connection is back.')}return}
  return mpPushBlind()}
 if(r&&r.conflict){console.warn('league conflict',r.conflict.slice(0,5));
  if(r.d&&r.d.state){mpUnsent(false,code,seq);toast('Someone else got there first — your screen has been refreshed.');if(busy()){mpSetBase(-1,sent);MP_HELD=r.d}else partyAdopt(r.d.state,r.d.rev,r.d)}
  return}
 if(!r||!r.str)return;
 mpUnsent(false,code,seq);
 const now=PJ(canonState());
 if(now===sent&&!busy()&&!X.again){partyAdopt(r.str,r.rev,r.d)}
 else if(now===sent&&!X.again){/* a sheet is open: don't swap the game out from under it; catch up when it closes */
  mpSetBase(-1,sent);MP_HELD=Object.assign({},r.d,{state:r.str,rev:r.rev})}
 else{/* more changes were made while this was sending: fold them in and send again */
  const conf=[];const m=merge3(noMsg(JSON.parse(sent)),noMsg(JSON.parse(r.str)),noMsg(JSON.parse(now)),[],conf);
  if(conf.length||busy()){mpSetBase(-1,sent)}
  else{partyAdopt(PJ(m),r.rev,r.d,true);mpSetBase(r.rev,r.str);render()}
  S.online.msg='';mpPush()}
 partyCatchUp()}
/* offline and not on party night: the old way — queue the write and let Firestore send it when we reconnect */
function mpPushBlind(){const o=S.online,seq=mpUnsentSeq(LMP.code);o.rev=(o.rev||0)+1;const str=PJ(canonState());saveLocal();
 const f={state:str,rev:o.rev,turn:canonKey(o.turn),msg:o.msg||'',week:S.week,season:S.season,phase:S.phase},code=LMP.code,key=LMP.key;mpSetBase(o.rev,str);
 TKO.push(code,f).then(()=>mpUnsent(false,code,seq)).catch(e=>{console.warn('push failed',e);TKO.claim(code,key).then(()=>TKO.push(code,f)).then(()=>mpUnsent(false,code,seq)).catch(()=>{MP_PENDING=true;toast('Saved on this device — it will sync when you reconnect.')})})}
/* take the league's latest version as this device's game */
function partyAdopt(str,rev,d,quiet){
 mpLoad(str,d&&d.names,d&&d.shows,rev);saveLocal();mpRemember();if(quiet)return;
 render();partyAfterLoad()}
/* on party night, a phone that just got a new week's results asks whether to watch the TV or open its own */
function partyAfterLoad(){if(!S.online.party)return false;if(partyLivePrompt())return true;if(S.phase==='draft'||!mpUnseen())return false;mpMarkSeen();partyResultsPrompt();return true}
/* a newer league arrived while we were busy: apply it now if nothing is in the way */
function partyCatchUp(){if(!MP_HELD||MPX||busy())return;const d=MP_HELD;MP_HELD=null;if(typeof mpIncoming==='function')mpIncoming(d)}
/* mpIncoming asks this first: should this new copy of the league wait? */
function mpHoldIncoming(d){
 if(MPX||mpT){if(!MP_HELD||(d.rev||0)>=(MP_HELD.rev||0))MP_HELD=d;if(mpT&&!MPX)mpPush();return true}
 if(busy()&&partyOn()){if(!MP_HELD||(d.rev||0)>=(MP_HELD.rev||0))MP_HELD=d;return true}
 return false}
function partyResultsPrompt(){if(!S||!S.last)return;openModal(`<div class="h mhd">📺 Week ${S.last.week} is on!</div><p>Everyone's locked in. Watch the results play out on the TV, or open your own.</p><button class="btn" onclick="showResults()">See my results</button><button class="btn ghost" onclick="closeModal()">I'm watching the TV</button>`)}

/* ===================== party night on a phone ===================== */
function partyMyTurn(){const o=S.online||{};if(S.phase==='rookies')return !(o.rk&&o.rk.p);if(S.phase==='draft')return onClock()==='p';if(S.phase==='season')return o.live?partyLiveNow()==='p':!(o.booked&&o.booked.p);return true}
function partyWaiting(){const o=S.online;if(S.phase==='season'&&o.live){const n=partyLiveNow();return n?[nameOf(n)]:[]}return localSeats().filter(k=>S.phase==='rookies'?!(o.rk||{})[k]:!(o.booked||{})[k]).map(nameOf)}
/* ---- going live on the TV ---- */
/* whose turn it is to go live (local key), or null */
function partyLiveNow(st){st=st||S;const o=st.online||{};if(!o.live||!o.party)return null;const lv=o.lv||{};return (o.live.order||[]).find(k=>!lv[k])||null}
function partyLiveTurn(){return partyOn()&&S.phase==='season'&&partyLiveNow()==='p'}
/* the Book tab's button: on party night you lock in first and go live later, on the TV */
function partyBookBtn(ready){if(!partyOn())return null;const o=S.online;
 if(partyLiveTurn())return `<button class="btn live" onclick="goLive()">🔴 You're live — start your show ▸</button>`;
 if(o.booked&&o.booked.p){const n=partyLiveNow();return `<div class="card"><b>Card locked in ✓</b><div class="muted">${o.live?(n?`${esc(nameOf(n))} is live on the TV right now.`:'The week is airing.'):"Once everyone's in, each GM goes live on the TV to make their calls — then the week airs."}</div>${o.live?'':`<button class="mini" onclick="partyUnlock()">Unlock</button>`}</div>`}
 return `<button class="btn live" ${ready?'':'disabled'} onclick="goLive()">Lock in my card ▸</button>`}
/* a GM finished their live segment */
function partyLiveDone(){const o=S.online;o.lv=o.lv||{};o.lv.p=true;partyFeed('');closeModal();save();render();
 const n=(o.live&&o.live.order||[]).find(k=>!o.lv[k]);toast(n?`That's a wrap! ${nameOf(n)} is up next.`:"That's a wrap! The week is airing.")}
/* mirror what the live GM sees onto the TV (the modal's own HTML, minus private photos) */
let FEED_T=null,FEED_LAST='';
function partyFeed(html){if(!ON()||!LMP||!window.TKO||!TKO.ready)return;clearTimeout(FEED_T);
 html=String(html||'').replace(/<img\b[^>]*src="data:[^"]*"[^>]*>/gi,'').slice(0,90000);
 const send=()=>{if(html===FEED_LAST)return;FEED_LAST=html;TKO.push(LMP.code,{live:{seat:LMP.me,week:S.week,season:S.season,html,at:Date.now()}}).catch(()=>{})};
 if(!html)return send();FEED_T=setTimeout(send,150)}
function partyLivePrompt(){if(!partyLiveTurn()||LIVE)return false;const key=S.season*100+S.week;if(+(LS.get('tksim_livep_'+LMP.code)||0)===key)return false;LS.set('tksim_livep_'+LMP.code,key);
 openModal(`<div class="h mhd">🔴 You're live!</div><p>It's your turn on the TV. Everyone's watching your promos and match calls play out — you make the calls here.</p><button class="btn live" onclick="closeModal();goLive()">Start my show ▸</button><button class="btn ghost" onclick="closeModal()">Give me a second</button>`);return true}
function partyLocked(){if(partyMyTurn())return false;
 toast(S.phase==='draft'?`${nameOf(onClock())} is on the clock.`:S.phase==='rookies'?"You're ready — waiting on the others.":'Your card is locked in — eyes on the TV! (Unlock it from the banner to make changes.)');return true}
function partyLockCard(){const o=S.online;o.booked=o.booked||{};o.booked.p=true;const sh=curShow();const left=partyWaiting();
 save();render();
 openModal(`<div class="h mhd">Locked in ✓</div><p>Your ${esc(sh.ppv?sh.name:sh.mine)} card is in.${left.length?` Waiting on <b>${left.map(esc).join(', ')}</b>.`:' You were the last one — time to go live!'}</p><p class="muted">When everyone's locked in, each GM goes live on the TV one at a time — the room watches your promos and match calls while you make them here. Then the week airs.</p><button class="btn" onclick="closeModal()">Got it</button>`)}
function partyUnlock(){if(!S||S.phase!=='season'||!partyOn()||S.online.live)return;S.online.booked.p=false;save();render();toast('Unlocked — make your changes, then go live again.')}
function partyBanner(){const o=S.online;let t;
 if(S.phase==='rookies')t=o.rk&&o.rk.p?`✅ You're ready — waiting on ${esc(partyWaiting().join(', '))}`:'🟡 Create wrestlers, then continue to the draft';
 else if(S.phase==='draft')t=onClock()==='p'?"🟡 You're on the clock!":`⏳ ${esc(nameOf(onClock()))} is picking`;
 else if(S.phase==='season'&&o.live){const n=partyLiveNow();t=n==='p'?(LIVE?`🔴 You're live on the TV!${$('#modal').classList.contains('hidden')?` <a href="#" onclick="if(PS)renderPS();else if(ME)renderME();return false" style="color:var(--gold2)">Back to your show</a>`:''}`:`🔴 You're live on the TV! <a href="#" onclick="goLive();return false" style="color:var(--gold2)">Start your show</a>`):n?`📺 ${esc(nameOf(n))} is live on the TV`:'📺 The week is airing'}
 else if(S.phase==='season'){const w=partyWaiting();t=o.booked&&o.booked.p?`✅ Locked in${w.length?' — waiting on '+esc(w.join(', ')):''} · <a href="#" onclick="partyUnlock();return false" style="color:var(--gold2)">Unlock</a>`:`🟡 Book your show${w.length>1?' — still booking: '+esc(w.filter(x=>x!==S.gm).join(', ')):' — everyone else is locked in!'}`}
 else t='🏁 Season over — anyone can start the next one';
 return `<div class="mpbar ${partyMyTurn()?'on':''}">📺 <span><b>${t}</b><br><span class="muted tiny">Party night · league ${esc(LMP.code)}${MP_PENDING?' · 📡 waiting for a connection':''} · <a href="#" onclick="partyToggleForm();return false" style="color:var(--gold2)">end party night</a></span></span></div>`}
function partyOfficeCard(){if(!ON()||!LMP)return '';const on=partyOn();
 return `<div class="card"><div class="h small">📺 Party night</div>${on?`<p class="muted" style="margin-top:0">Party night is <b class="gold">on</b>. Everyone books at the same time and the week airs when the last GM locks in.</p>`:`<p class="muted" style="margin-top:0">Everyone in the same room? Turn on party night and the whole league books at the same time instead of taking turns. Same league, same save — turn it off and you're back to taking turns right where you left off.</p>`}
 <p class="muted tiny">On the TV: open the game, tap <b>Show a league on this screen</b> and enter <b class="gold">${esc(LMP.code)}</b>.</p>
 <button class="btn ${on?'sec':''}" onclick="partyToggleForm()">${on?'End party night':'📺 Start party night'}</button></div>`}
function partyToggleForm(){if(!ON()||!LMP)return;const on=partyOn();
 openModal(on?`<div class="h mhd">End party night?</div><p>The league goes back to taking turns from right here. Anyone who hasn't ${S.phase==='rookies'?'finished creating wrestlers':'locked in'} yet takes their turn whenever they like, with turn alerts as usual.</p><button class="btn" onclick="partySet(false)">End party night</button><button class="btn ghost" onclick="closeModal()">Keep partying</button>`
  :`<div class="h mhd">📺 Start party night?</div><p>Everyone in the league books at the same time instead of taking turns, and the week airs as soon as the last GM locks in. It's the same league and save — end party night whenever you like and you're back to taking turns.</p><p class="muted">Put the league on a TV: open the game there, tap <b>Show a league on this screen</b> and enter <b class="gold">${esc(LMP.code)}</b>.</p><button class="btn" onclick="partySet(true)">Start party night</button><button class="btn ghost" onclick="closeModal()">Cancel</button>`)}
function partySet(on){closeModal();if(!ON()||!LMP)return;if(!mpAvail()||!navigator.onLine)return toast('You need a connection to change party night.');
 const o=S.online;o.party=!!on;o.booked=o.booked||{};o.rk=o.rk||{};
  if(on){news(`📺 Party night! ${localSeats().map(nameOf).join(', ')} are booking together.`);o.msg='';o.lv=Object.assign({},o.booked);delete o.live}
 else{/* back to taking turns: whoever is next in line (and hasn't gone yet) is up */
  if(S.phase==='rookies'){const n=localSeats().find(k=>!o.rk[k]);if(n)o.turn=n}
  else if(S.phase==='draft')o.turn=onClock();
  else if(S.phase==='season'){/* only GMs who already went live keep their cards locked; the rest go live on their turn */
   const done=o.lv||{};o.booked={};for(const k in done)if(done[k])o.booked[k]=true;delete o.live;delete o.lv;
   const n=(o.order&&o.order.length?o.order:bookingOrder()).find(k=>!o.booked[k]);if(n)o.turn=n}
  news('📺 Party night is over — back to taking turns.');o.msg='Party night is over — back to taking turns. Your turn!'}
 save();mpPush();render();toast(on?'📺 Party night is on!':'Back to taking turns.')}

/* ===================== the TV ===================== */
function partySetupCard(){return `<div class="card"><div class="h small">📺 Party night</div><p class="muted" style="margin-top:0">Same room, big screen. Any online league can have a party night: everyone books their show on their phone at the same time, and the results play out on the TV. Start it from your league's Office, then put the league on the TV.</p><button class="btn sec" onclick="tvForm()">Show a league on this screen</button></div>`}
function tvForm(code){if(!mpAvail())return mpNeedSetup();openModal(`<div class="h mhd">📺 Show a league on this screen</div><p class="muted">This screen becomes the TV. It follows the league live: who's still booking, the draft, and each week's results, segment by segment. It doesn't take a seat. Your own games on this device are kept.</p>
 <label>League code</label><input id="tvCode" maxlength="6" autocapitalize="characters" value="${esc(code||(LMP&&ON()?LMP.code:''))}" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:6px;font-size:24px;text-align:center">
 <button class="btn mt" onclick="tvGo()">Put it on the TV</button><button class="btn ghost" onclick="closeModal()">Cancel</button>`)}
function tvGo(){const code=($('#tvCode').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(!/^[A-Z0-9]{6}$/.test(code))return toast('League codes look like ABC123.');closeModal();tvStart(code)}
function tvStart(code){if(S&&!ON())saveLocal();if(typeof leaveLeagueView==='function')leaveLeagueView();
 TV={code,unsub:null,rev:0,seen:null,reveal:null,status:'connecting'};S=null;LS.set(TV_KEY,code);tab='home';render();tvConnect()}
function tvConnect(){if(!TV)return;if(TV.unsub){TV.unsub();TV.unsub=null}
 if(!window.TKO||!TKO.ready)return;
 TV.unsub=TKO.listen(TV.code,tvIncoming,()=>{if(!TV)return;TV.status='missing';render()});partyWake()}
function tvIncoming(d){if(!TV||!d||!d.state)return;if((d.rev||0)<TV.rev&&S)return;
 let st;try{st=JSON.parse(d.state)}catch(e){return}delete st._view;viewFor(st,'s0');dataUpdate(st);ensureTraits(st);
 S=st;TV.rev=d.rev||0;TV.status='on';TV.n=d.n||nSeats();TV.feed=d.live||null;
 const nm=d.names||{},sh=d.shows||{};S.names=S.names||{};for(const k in nm)if(nm[k])S.names[localKey(k)]=nm[k];S.gm=S.names.p||S.gm;
 if(S.online){S.online.show=S.online.show||{};for(const k in sh)if(sh[k])S.online.show[localKey(k)]=cleanShow(sh[k])}
 const k=S.last?(S.last.season||S.season)*100+S.last.week:0;
 if(TV.seen===null)TV.seen=k;
 else if(k>TV.seen){TV.seen=k;if(TV.reveal&&TV.reveal.t)clearTimeout(TV.reveal.t);TV.reveal={key:S.last.season+'-'+S.last.week,pi:0}}
 /* a GM started their live segment: that beats replaying last week */
 if(TV.reveal&&TV.feed&&TV.feed.html&&TV.feed.week===S.week&&S.online&&S.online.live){if(TV.reveal.t)clearTimeout(TV.reveal.t);TV.reveal=null}
 tvRefresh()}
function tvEnd(){if(!confirm('Take the league off this screen?'))return;tvStop()}
function tvStop(){if(TV){if(TV.unsub)TV.unsub();if(TV.reveal&&TV.reveal.t)clearTimeout(TV.reveal.t)}TV=null;LS.del(TV_KEY);document.body.classList.remove('tv');
 S=null;try{const a=JSON.parse(LS.get('tksim_active')||'null');const g=a&&LS.get('tksim_game_'+a.code);if(g){LMP={code:a.code,me:a.me,key:a.key};S=JSON.parse(g)}}catch(e){LMP=null}
 if(!S)S=load();if(S){dataUpdate(S);ensureTraits(S);econMigrate(S);feudInit(S);if(!ON())showMigrate()}closeModal();tab='home';ANIM=true;render();if(ON())mpConnect()}
function tvReplay(){if(!TV||!S||!S.last)return;TV.reveal={key:S.last.season+'-'+S.last.week,pi:0};render()}
let WAKE=null;
async function partyWake(){try{if(TV&&'wakeLock' in navigator&&document.visibilityState==='visible'&&!WAKE){WAKE=await navigator.wakeLock.request('screen');WAKE.addEventListener('release',()=>{WAKE=null})}}catch(e){}}
/* resume the TV after a reload, and open the join form from a ?join=CODE link */
function tvBoot(){const q=new URLSearchParams(location.search).get('join');
 const c=LS.get(TV_KEY);if(c&&/^[A-Z0-9]{6}$/.test(c)){if(typeof LMP!=='undefined')LMP=null;S=null;TV={code:c,unsub:null,rev:0,seen:null,reveal:null,status:'connecting'};return true}
 if(q){history.replaceState(null,'',location.pathname);setTimeout(()=>{if(typeof mpJoinForm==='function'){mpJoinForm();const i=$('#mpCode');if(i)i.value=q.toUpperCase().slice(0,6)}},300)}
 return false}

function tvRefresh(){if(!TV)return;const R=TV.reveal;if(R&&document.getElementById('rv')&&R.built===R.key+':'+R.pi)return;render()}
function tvHeader(){const st=TV.status==='on'?'':TV.status==='missing'?'<span class="tv-warn">No league with that code</span>':'<span class="tv-warn">📡 Connecting…</span>';
 return `<header class="top tv-top"><div class="brand"><span class="logo">TONY KHAN</span><span class="logo2">SIM</span></div><div class="hud">${st}<span class="hudc">LEAGUE <b>${esc(TV.code)}</b></span>${S&&S.last?'<button class="mini" onclick="tvReplay()">Replay last week</button>':''}<button class="mini" onclick="tvEnd()">Exit TV</button></div></header>`}
function tvJoinUrl(){return location.href.split(/[?#]/)[0]+'?join='+TV.code}
function tvShortUrl(){return location.href.split(/[?#]/)[0].replace(/^https?:\/\//,'').replace(/index\.html$/,'').replace(/\/$/,'')}
function tvQR(){try{const q=qrcode(0,'M');q.addData(tvJoinUrl());q.make();return q.createSvgTag({cellSize:6,margin:2,scalable:true})}catch(e){return ''}}
function tvRender(){document.body.classList.add('tv');const app=$('#app');
 if(TV.reveal&&S&&S.last){if(document.getElementById('rv')&&TV.reveal.built===TV.reveal.key+':'+TV.reveal.pi)return;app.innerHTML=tvHeader()+`<main class="tv-main">${tvRevealHtml()}</main>`;tvRevealRun();return}
 let body;
 if(!S)body=tvWaiting();else if(Object.values(S.names||{}).filter(Boolean).length<nSeats())body=tvLobby();else if(S.phase==='rookies')body=tvRookies();else if(S.phase==='draft')body=tvDraft();else if(S.phase==='over')body=tvOver();else if(S.online&&S.online.live&&partyLiveNow())body=tvLive();else body=tvWeek();
 app.innerHTML=tvHeader()+`<main class="tv-main">${body}</main>`}
function tvWaiting(){return `<div class="tv-title center"><div class="kicker"><i></i>League ${esc(TV.code)}</div><div class="hero-t tv-hero">${TV.status==='missing'?'No league<br>found':'Tuning in…'}</div><p class="muted">${TV.status==='missing'?'Double-check the code (Office on any GM\'s phone shows it).':(window.TKO&&TKO.ready?'Connecting to the league.':'Waiting for online play to load. This screen needs an internet connection.')}</p>${TV.status==='missing'?'<button class="btn tv-go" onclick="tvStop();tvForm()">Try another code</button>':''}</div>`}
function tvPartyTag(){return S.online&&S.online.party?'📺 Party night':'Taking turns'}
function tvLobby(){const n=nSeats(),names=localSeats();
 return `<div class="tv-lobby"><div class="tv-join"><div class="kicker"><i></i>League ${esc(TV.code)} · ${n} GMs</div><div class="hero-t tv-hero">Grab your<br>phones</div>
 <ol class="tv-steps"><li>Open <b>${esc(tvShortUrl())}</b></li><li>Tap <b>Join a league</b></li><li>Enter the code</li></ol><div class="tv-code" style="letter-spacing:.06em">${esc(TV.code)}</div></div>
 <div class="tv-qr">${tvQR()}<div class="muted center">Or scan to join</div></div></div>
 <div class="tv-players">${names.map(k=>S.names&&S.names[k]?`<div class="tv-pl on"><b>${esc(nameOf(k))}</b><span>${esc(showNames()[k]||'')}</span></div>`:`<div class="tv-pl"><b>Open seat</b><span>Waiting for a GM…</span></div>`).join('')}</div>`}
function tvRookies(){const o=S.online;const made=Object.values(S.w).filter(w=>w.cw).length;const party=o.party;
 return `<div class="tv-title"><div class="kicker"><i></i>Before the draft · ${tvPartyTag()}</div><div class="hero-t tv-hero">Create your<br>wrestlers</div><p class="muted">${party?"Everyone's building original wrestlers on their phones. The draft starts when every GM is ready.":`GMs take turns creating wrestlers. Up now: <b class="gold">${esc(nameOf(o.turn))}</b>.`}${made?` <b class="gold">${made} created so far.</b>`:''}</p></div>
 <div class="tv-players">${localSeats().map(k=>`<div class="tv-pl on ${(o.rk||{})[k]?'ok':''}"><b>${esc(nameOf(k))}</b><span>${(o.rk||{})[k]?'✅ Ready for the draft':'✏️ Creating…'}</span></div>`).join('')}</div>`}
function tvDraft(){const d=S.draft,oc=onClock();
 return `<div class="tv-grid"><div><div class="tv-title"><div class="kicker"><i></i>The Draft · Round ${d.round} of ${d.rounds}</div><div class="tv-sub">On the clock</div><div class="hero-t tv-hero tv-clock">${esc(nameOf(oc))}</div></div>
 <div class="tv-players">${localSeats().map(k=>{const l=ownList(k);return `<div class="tv-pl on ${k===oc?'ok':''}"><b>${esc(nameOf(k))}</b><span>${l.length} picked · ${cnt(l)}${S.online.auto&&S.online.auto[k]?' · auto':''}</span></div>`}).join('')}</div>
 ${d.last&&S.w[d.last]?`<div class="tv-last">${wcard(S.w[d.last],{on:''})}<div><div class="tv-sub">Just picked</div><b>${esc(S.w[d.last].name)}</b><div class="muted">${esc(nameOf(S.w[d.last].own))} · ${STYLE_N[S.w[d.last].st]} · ${S.w[d.last].al==='f'?'Face':'Heel'}</div></div></div>`:''}</div>
 <div class="card tv-log"><div class="h small">Latest picks</div>${d.log.slice(0,10).map((x,i)=>`<div class="tv-pick ${i?'':'new'}">${esc(x)}</div>`).join('')||'<div class="muted">First pick coming up…</div>'}</div></div>`}
function tvStandings(){const l=localSeats().slice().sort((a,b)=>S.fans[b]-S.fans[a]);
 return `<div class="card"><div class="h small">Standings</div>${l.map((k,i)=>`<div class="tv-row"><span>${['🥇','🥈','🥉','4.'][i]} <b>${esc(nameOf(k))}</b> <span class="muted tiny">${esc(showNames()[k]||'')}</span></span><span><b class="gold">${fmtFans(S.fans[k])}</b> <span class="muted">fans · ${S.hourWins[k]||0} W</span></span></div>`).join('')}</div>`}
function tvWeek(){const sh=curShow(),o=S.online;const v=venueOf();const party=o.party;
 const pairs=pairings(S.week,nSeats());
 const gm=s=>{const k=localKey(s),lk=(o.booked||{})[k],up=!party&&o.turn===k;return `<div class="tv-gm ${lk?'lk':''}"><div class="tv-show">${esc(sh.ppv?sh.name:showNames()[k]||'')}</div><b>${esc(nameOf(k))}</b><div class="tv-lock">${lk?'✅ Locked in':up?'🟡 Booking now':party?'✏️ Booking…':'⏳ Waiting for their turn'}</div></div>`};
 return `<div class="tv-grid"><div><div class="card showcard ${sh.ppv?'ppv':''} tv-poster"><div class="wm">${esc(sh.ppv?sh.name:v[1].split(',')[0])}</div><div class="kicker"><i></i>Week ${S.week} of ${SEASON}${sh.ppv?' · Pay-per-view':' · Ratings war'} · ${tvPartyTag()}</div><div class="showname">${esc(sh.ppv?sh.name:'Week '+S.week)}</div><div class="venue">${sh.ppv?'<b>Live on pay-per-view</b>':`<b>${esc(v[0])}</b> · ${esc(v[1])}`}</div></div>
 <div class="tv-match">${pairs.map(([a,b])=>b?`<div class="tv-pair">${gm(a)}<div class="vs">VS</div>${gm(b)}</div>`:`<div class="tv-pair bye">${gm(a)}<div class="tv-byetag">Bye week — airs solo</div></div>`).join('')}</div>
 <p class="muted center">${party?"Book your show on your phone and go live. When everyone's locked in, the results play here.":'The league is taking turns. Start party night from any GM\'s Office to book together.'}</p></div>
 <div>${tvStandings()}<div class="card"><div class="h small">The Wire</div>${S.news.slice(-6).reverse().map(n=>`<div class="news"><span class="muted">W${n.w}</span> ${esc(n.t)}</div>`).join('')}</div></div></div>`}
/* a GM is live: show exactly what's on their phone — the scene, the choices, then how the call played out */
function tvSafe(html){const t=document.createElement('template');t.innerHTML=String(html||'');
 t.content.querySelectorAll('script,iframe,object,embed,link,meta,style,form,input,textarea,select').forEach(e=>e.remove());
 t.content.querySelectorAll('*').forEach(e=>{[...e.attributes].forEach(a=>{const n=a.name.toLowerCase(),v=String(a.value).trim().toLowerCase();if(n.startsWith('on')||((n==='href'||n==='src'||n==='xlink:href')&&(v.startsWith('javascript:')||v.startsWith('data:text'))))e.removeAttribute(a.name)})});
 return t.innerHTML}
function tvLive(){const o=S.online,now=partyLiveNow(),lv=o.lv||{},f=TV.feed;const sh=curShow();
 const mine=f&&f.html&&f.seat===canonKey(now)&&f.week===S.week&&f.season===S.season;
 return `<div class="tv-grid"><div><div class="tv-title"><div class="kicker"><i></i><span class="live-tag">LIVE</span> Week ${S.week} · ${esc(sh.ppv?sh.name:showNames()[now]||'')}</div><div class="hero-t tv-hero tv-clock" style="font-size:clamp(40px,4.6vw,96px)!important">${esc(nameOf(now))}</div></div>
 ${mine?`<div class="tv-live-sheet">${tvSafe(f.html)}</div>`:`<div class="card center"><div class="big">📱 Waiting for ${esc(nameOf(now))} to start their show…</div><p class="muted">Their promos and match calls show up here as they make them.</p></div>`}</div>
 <div><div class="card"><div class="h small">Going live tonight</div>${(o.live.order||[]).map(k=>`<div class="tv-row"><b class="${k===now?'gold':''}">${esc(nameOf(k))}</b><span class="muted">${lv[k]?'✅ Done':k===now?'🔴 Live now':'Up next'}</span></div>`).join('')}</div>${tvStandings()}</div></div>`}
function tvOver(){const l=localSeats().slice().sort((a,b)=>S.fans[b]-S.fans[a]);
 return `<div class="tv-title center"><div class="kicker"><i></i>Season ${S.season} complete</div><div class="hero-t tv-hero">${esc(nameOf(l[0]))}<br>wins!</div></div>${tvStandings()}
 ${S.best?`<div class="card center"><div class="muted">Match of the year</div><div class="big">${esc(S.best.t)} <span class="stars">${stars(S.best.s)}</span></div><div class="muted">${esc(S.best.show)} · Week ${S.best.w}</div></div>`:''}
 <p class="muted center">Start Season ${S.season+1} from any GM's phone.</p>`}

/* ---------- the reveal: each show's segments, side by side, one at a time ---------- */
function tvRevealPairs(){const L=S.last;return (L.pairs||[{blocks:L.blocks,ratings:L.ratings,fans:L.fans,hourWin:L.hourWin}])}
function tvRevealHtml(){const L=S.last,R=TV.reveal,pairs=tvRevealPairs(),pr=pairs[R.pi];R.built=R.key+':'+R.pi;
 const cols=pr.blocks.filter(b=>b.brand!=='x'),x=pr.blocks.find(b=>b.brand==='x');
 const col=(b,ci)=>`<div class="rv-col"><div class="rv-hd"><div class="rv-show">${esc(b.label)}</div><div class="rv-run" id="rvr${ci}">—</div></div>${b.segs.map((s,si)=>`<div class="rv-seg" id="rv-${ci}-${si}" data-st="${s.stars}"><div class="muted tiny">${si===b.segs.length-1?'<b class="gold">MAIN EVENT</b> · ':''}${esc(s.sub)}</div><div class="rv-txt">${esc(s.txt)}</div><div class="stars rv-stars">${stars(s.stars)}</div>${s.notes.slice(0,3).map(n=>`<div class="note">${esc(n)}</div>`).join('')}</div>`).join('')||'<div class="muted">Nothing aired.</div>'}</div>`;
 const ks=Object.keys(pr.ratings);const best=ks.slice().sort((a,b)=>pr.ratings[b]-pr.ratings[a])[0];
 return `<div id="rv" class="rv"><div class="rv-top"><div class="kicker"><i></i>Week ${L.week} · ${pairs.length>1?`Matchup ${R.pi+1} of ${pairs.length}`:'Results'}</div><div class="showname">${esc(L.ppv?L.title:ks.map(k=>showNames()[k]||nameOf(k)).join(' vs '))}</div></div>
 <div class="rv-cols">${cols.map((b,ci)=>(ci?'<div class="vs rv-vs">VS</div>':'')+col(b,ci)).join('')}</div>
 ${x?`<div class="card rv-x"><div class="h small">${esc(x.label)}</div>${x.segs.map((s,si)=>`<div class="rv-seg" id="rv-x-${si}"><div class="rv-txt">${esc(s.txt)}</div><div class="muted tiny">${esc(s.sub)}</div><div class="stars rv-stars">${stars(s.stars)}</div>${s.notes.slice(0,2).map(n=>`<div class="note">${esc(n)}</div>`).join('')}</div>`).join('')}</div>`:''}
 <div class="rv-final" id="rv-final"><div class="rv-scores">${ks.map(k=>`<div class="rv-score ${k===best&&ks.length>1?'win':''}"><span>${esc(nameOf(k))}</span><div class="stars">${stars(pr.ratings[k])}</div><b class="${pr.fans[k]>=0?'good':'bad'}">${pr.fans[k]>=0?'+':''}${fmtFans(Math.abs(pr.fans[k])).replace(/^/,pr.fans[k]<0?'−':'')} fans</b></div>`).join('')}</div>
 <div class="rv-win">${ks.length>1?(pr.hourWin?`🏆 ${esc(nameOf(pr.hourWin))} wins the night!`:`🏆 ${esc(nameOf(best))} steals the show!`):'Bye-week show in the books.'}</div></div>
 <div class="rv-ctl"><button class="mini" onclick="tvRevealSkip()">Skip ▸▸</button></div></div>`}
function tvRevealRun(){const R=TV.reveal,pr=tvRevealPairs()[R.pi];const cols=pr.blocks.filter(b=>b.brand!=='x'),x=pr.blocks.find(b=>b.brand==='x');
 const steps=[];const max=Math.max(0,...cols.map(b=>b.segs.length));
 for(let i=0;i<max;i++)cols.forEach((b,ci)=>{if(b.segs[i])steps.push({id:`rv-${ci}-${i}`,ci,n:b.segs[i].notes.length})});
 if(x)x.segs.forEach((s,i)=>steps.push({id:'rv-x-'+i,n:s.notes.length}));
 steps.push({id:'rv-final',n:0,final:true});R.steps=steps;R.si=R.si||0;
 for(let i=0;i<R.si&&i<steps.length;i++)tvRevealShow(steps[i],true);
 tvRevealNext()}
function tvRevealShow(st,instant){const el=document.getElementById(st.id);if(!el)return;el.classList.add('on');if(instant)el.classList.add('now');
 if(st.ci!=null){const segs=[...document.querySelectorAll(`[id^="rv-${st.ci}-"].on`)].map(e=>+e.dataset.st);const r=document.getElementById('rvr'+st.ci);if(r&&segs.length)r.innerHTML=`<span class="muted tiny">SO FAR</span> <span class="stars">${stars(avg(segs))}</span>`}
 if(!instant)try{el.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}}
function tvRevealNext(){const R=TV&&TV.reveal;if(!R||!R.steps||!document.getElementById('rv'))return;clearTimeout(R.t);
 if(R.si>=R.steps.length){R.t=setTimeout(tvRevealAdvance,9000);return}
 const st=R.steps[R.si++];tvRevealShow(st,false);
 R.t=setTimeout(tvRevealNext,st.final?0:Math.min(7000,3000+st.n*1100))}
function tvRevealAdvance(){const R=TV&&TV.reveal;if(!R)return;clearTimeout(R.t);const n=tvRevealPairs().length;
 if(R.pi<n-1){R.pi++;R.si=0;R.built=null;render();return}
 TV.reveal=null;window.scrollTo(0,0);render()}
function tvRevealSkip(){const R=TV&&TV.reveal;if(!R)return;clearTimeout(R.t);if(!R.steps)return render();
 if(R.si<R.steps.length){while(R.si<R.steps.length)tvRevealShow(R.steps[R.si++],true);const f=document.getElementById('rv-final');if(f)try{f.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}R.t=setTimeout(tvRevealAdvance,9000)}else tvRevealAdvance()}
