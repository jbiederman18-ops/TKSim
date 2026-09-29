/* Tony Khan Simulator — Party mode.
   One screen (the TV) runs the league. Everyone in the room joins from their phone with a 4-letter code,
   books their own show at the same time, and locks in. When everyone is locked in, the TV airs the week
   and plays the results segment by segment.
   Devices talk directly (WebRTC via PeerJS; the free PeerJS server only introduces them).
   The TV holds the one true save. Phones edit their own copy and send it back; the TV merges each phone's
   changes into the world (a 3-way merge against the version that phone started from) and sends everyone
   the result. If two phones change the same shared thing at once (say, both sign the same free agent),
   the first one wins and the other phone is refreshed. */
'use strict';
let PARTY=null;
const PARTY_GAME='tksim_party_game',PARTY_HOST='tksim_party_host',PARTY_JOIN='tksim_party_join',PEER_PREFIX='tksim-party-v1-';
const PJ=x=>JSON.stringify(x);

function partyLoadPeer(){if(window.Peer)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/peerjs.min.js';s.onload=()=>res();s.onerror=()=>rej(new Error('peerjs'));document.head.appendChild(s)})}
function partyBaseUrl(){return location.href.split(/[?#]/)[0]}
function partyJoinUrl(){return partyBaseUrl()+'?party='+PARTY.code}
function partyShortUrl(){return partyBaseUrl().replace(/^https?:\/\//,'').replace(/index\.html$/,'').replace(/\/$/,'')}
function isPartyHost(){return !!(PARTY&&PARTY.host)}

/* ===================== merging a phone's changes into the world ===================== */
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
/* what one GM gets to see: everyone's shared world, but only their own card and private office */
function partyRedact(st,seat){const o=Object.assign({},st);
 if(st.card)o.card=st.card[seat]?{[seat]:st.card[seat]}:{};
 if(st.priv)o.priv=st.priv[seat]?{[seat]:st.priv[seat]}:{};
 return o}

/* ===================== the TV ===================== */
function partyHostConfirm(){openModal(`<div class="h mhd">📺 Host a party</div><p>This screen becomes the TV: it runs the league and plays everyone's results. Put it on the big screen, then everyone joins from their phone.</p><p class="muted">Your solo game and online leagues are kept and come back when the party ends.</p><button class="btn" onclick="partyHostStart()">Start the party</button><button class="btn ghost" onclick="closeModal()">Cancel</button>`)}
async function partyHostStart(){closeModal();if(S&&!ON())saveLocal();
 if(typeof MP_UNSUB!=='undefined'&&MP_UNSUB){MP_UNSUB();MP_UNSUB=null}LMP=null;
 PARTY={host:true,code:newCode(4),players:[],conns:{},hist:{},rev:0,reveal:null,status:'connecting'};S=null;
 try{localStorage.removeItem(PARTY_GAME)}catch(e){}partyHostPersist();tab='home';render();partyHostOpen(false)}
function partyHostPersist(){if(!isPartyHost())return;LS.set(PARTY_HOST,PJ({code:PARTY.code,players:PARTY.players.map(p=>({token:p.token,name:p.name,show:p.show||'',seat:p.seat}))}))}
async function partyHostOpen(resume){
 try{await partyLoadPeer()}catch(e){PARTY.status='nopeer';render();return}
 if(!PARTY||!PARTY.host)return;
 const peer=new Peer(PEER_PREFIX+PARTY.code,{debug:0});PARTY.peer=peer;
 peer.on('open',()=>{if(PARTY&&PARTY.peer===peer){PARTY.status='on';tvRefresh()}});
 peer.on('connection',c=>partyHostConn(c));
 peer.on('disconnected',()=>{if(PARTY&&PARTY.peer===peer&&!peer.destroyed)setTimeout(()=>{try{peer.reconnect()}catch(e){}},1500)});
 peer.on('error',e=>{if(!PARTY||PARTY.peer!==peer)return;const t=e&&e.type;
  if(t==='unavailable-id'){peer.destroy();if(!resume&&!S&&!PARTY.players.length){PARTY.code=newCode(4);partyHostPersist()}setTimeout(()=>partyHostOpen(resume),resume?3000:100);return}
  if(t==='network'||t==='server-error'||t==='socket-error'||t==='socket-closed'){PARTY.status='offline';tvRefresh();setTimeout(()=>{if(PARTY&&PARTY.peer===peer&&peer.disconnected&&!peer.destroyed){try{peer.reconnect()}catch(e){}}},4000)}
  if(t==='browser-incompatible'){PARTY.status='nopeer';tvRefresh()}});
 partyWake()}
function partyHostConn(conn){conn.on('data',d=>{try{partyHostMsg(conn,d)}catch(e){console.warn('party msg',e)}});
 conn.on('close',()=>{const p=PARTY&&PARTY.players.find(x=>x.token===conn._tok);if(p&&PARTY.conns[p.token]===conn){p.online=false;delete PARTY.conns[p.token];tvRefresh()}});
 conn.on('error',()=>{})}
function partySendConn(conn,msg){try{if(conn&&conn.open)conn.send(msg)}catch(e){console.warn('send failed',e)}}
function partyHostMsg(conn,m){if(!m||!PARTY||!PARTY.host)return;
 if(m.t==='hello'){const name=String(m.name||'GM').slice(0,24).trim()||'GM',show=String(m.show||'').replace(/\s+/g,' ').slice(0,24).trim(),tok=String(m.token||'');let p=PARTY.players.find(x=>x.token===tok);
  if(!p){if(!S){if(PARTY.players.length>=4)return partySendConn(conn,{t:'err',m:'full'});p={token:tok,name,seat:null};PARTY.players.push(p)}
   else{/* a phone that lost its saved seat can take it back by joining with the same GM name */
    p=PARTY.players.find(x=>!x.online&&x.name.toLowerCase()===name.toLowerCase());if(!p)return partySendConn(conn,{t:'err',m:'started'});p.token=tok}}
  if(!S){p.name=name;p.show=show}p.online=true;const old=PARTY.conns[p.token];if(old&&old!==conn){try{old.close()}catch(e){}}PARTY.conns[p.token]=conn;conn._tok=p.token;partyHostPersist();
  if(S&&p.seat)partySendState(p,{});else partyLobbyBroadcast();tvRefresh();return}
 if(m.t==='ping')return partySendConn(conn,{t:'pong'});
 const p=PARTY.players.find(x=>x.token===conn._tok);if(!p)return;
 if(m.t==='upd'&&S&&p.seat){partyMerge(p,m);return}
 if(m.t==='bye'){PARTY.players=PARTY.players.filter(x=>x!==p);delete PARTY.conns[p.token];partyHostPersist();partyLobbyBroadcast();tvRefresh()}}
function partyLobbyBroadcast(){const names=PARTY.players.map(p=>p.name);PARTY.players.forEach(p=>partySendConn(PARTY.conns[p.token],{t:'lobby',players:names,code:PARTY.code}))}
function partyMerge(p,m){const baseStr=PARTY.hist[m.rev];
 if(!baseStr){partySendState(p,{ack:true,rej:'stale'});return}
 let mine;try{mine=JSON.parse(m.s)}catch(e){partySendState(p,{ack:true,rej:'bad'});return}
 const base=partyRedact(JSON.parse(baseStr),p.seat),host=canonState(),conf=[];
 const merged=merge3(base,host,mine,[],conf);
 if(conf.length){console.warn('party conflict',p.name,conf.slice(0,5));partySendState(p,{ack:true,rej:'conflict'});return}
 delete merged._view;S=viewFor(merged,'s0');ensureTraits(S);
 partyTick();partyCommit(p.token)}
/* the TV moves the game along: draft starts, auto-picks, and the week airs once everyone is locked in */
function partyTick(){if(!S||!S.online)return;const o=S.online;o.rk=o.rk||{};o.booked=o.booked||{};o.auto=o.auto||{};
 if(S.phase==='rookies'&&localSeats().every(k=>o.rk[k]))startDraft();
 if(S.phase==='draft'){let guard=0;while(S.phase==='draft'&&guard++<400){const oc=onClock();if(!o.auto[oc])break;const c=draftChoice(oc);if(!c){finishDraft();break}draftPick(c.id,oc)}
  if(S.phase==='season'){o.booked={};o.order=bookingOrder()}}
 if(S.phase==='season'&&!PARTY.reveal&&localSeats().every(k=>o.booked[k])){airShow();o.booked={};o.order=bookingOrder();
  if(S.last)PARTY.reveal={key:S.last.season+'-'+S.last.week,pi:0}}}
let PARTY_CT=null;
function partyCommit(ackTok,rej){clearTimeout(PARTY_CT);if(!isPartyHost()||!S)return;
 PARTY.rev++;S.online.rev=PARTY.rev;const canon=canonState(),str=PJ(canon);PARTY.hist[PARTY.rev]=str;
 const ks=Object.keys(PARTY.hist).map(Number).sort((a,b)=>a-b);while(ks.length>60)delete PARTY.hist[ks.shift()];
 saveLocal();partyHostPersist();
 PARTY.players.forEach(p=>{if(p.seat)partySendState(p,{ack:p.token===ackTok,rej:p.token===ackTok?rej:null},canon)});
 tvRefresh()}
function partySendState(p,o,canon){const c=PARTY.conns[p.token];if(!c||!c.open)return;canon=canon||JSON.parse(PARTY.hist[PARTY.rev]||PJ(canonState()));
 partySendConn(c,{t:'state',rev:PARTY.rev,seat:p.seat,code:PARTY.code,ack:!!o.ack,rej:o.rej||null,s:PJ(partyRedact(canon,p.seat))})}
/* host-side actions (TV buttons) go through save(); send the result a moment later */
function partyHostSaved(){saveLocal();clearTimeout(PARTY_CT);PARTY_CT=setTimeout(()=>{if(isPartyHost()&&S){partyTick();partyCommit()}},40)}
function partyStart(){if(!isPartyHost()||S)return;const pl=PARTY.players;if(pl.length<2)return toast('You need at least 2 GMs.');
 const n=Math.min(4,pl.length);PARTY.players=pl.slice(0,n);PARTY.players.forEach((p,i)=>p.seat='s'+i);
 newGame(PARTY.players[0].name,'','normal',{n});S.online.party=true;
 PARTY.players.forEach((p,i)=>{S.names[localKey('s'+i)]=p.name;S.online.show[localKey('s'+i)]=cleanShow(p.show,i)});S.gm=S.names.p;
 news(`📺 Party night! ${PARTY.players.map(p=>p.name).join(', ')} are running the brands.`);
 PARTY.hist={};partyHostPersist();partyCommit();render()}
function partyEnd(){if(!confirm(isPartyHost()?'End the party on this screen? Phones will be disconnected. (The party save is removed from this TV.)':'Leave the party on this phone?'))return;
 if(PARTY){if(!PARTY.host&&PARTY.conn)partySendConn(PARTY.conn,{t:PARTY.seat?'leave':'bye'});try{PARTY.peer&&PARTY.peer.destroy()}catch(e){}clearTimeout(PARTY.retryT);if(PARTY.reveal&&PARTY.reveal.t)clearTimeout(PARTY.reveal.t)}
 LS.del(PARTY_GAME);LS.del(PARTY.host?PARTY_HOST:PARTY_JOIN);PARTY=null;document.body.classList.remove('tv');
 S=load();if(S){dataUpdate(S);ensureTraits(S);econMigrate(S);feudInit(S);showMigrate()}closeModal();tab='home';ANIM=true;render()}
function partyAutoFor(seat){if(!isPartyHost()||!S)return;const k=localKey(seat),nm=nameOf(k);
 if(S.phase==='draft'){if(onClock()!==k)return;const c=draftChoice(k);if(c)draftPick(c.id,k);return}
 if(S.phase==='season'){if(!confirm(`Auto-book and lock in ${nm}'s show?`))return;
  asPair(seat,oppOf(seat,S.week,nSeats()),()=>{S.card.p=autoBook('p',curShow(),null);S.online.booked.p=true});save()}}
let WAKE=null;
async function partyWake(){try{if('wakeLock' in navigator&&document.visibilityState==='visible'&&!WAKE){WAKE=await navigator.wakeLock.request('screen');WAKE.addEventListener('release',()=>{WAKE=null})}}catch(e){}}

/* ===================== phones ===================== */
function partyJoinForm(code){openModal(`<div class="h mhd">📺 Join a party</div><p class="muted">Enter the 4-letter code on the TV.</p>
 <label>Your GM name</label><input id="ptName" maxlength="24" value="${esc(LS.get('tksim_name')||(S&&!ON()?S.gm:''))}" placeholder="Your name">
 <label>Your show's name</label><input id="ptShow" maxlength="24" value="${esc(LS.get('tksim_show')||'')}" placeholder="e.g. Monday Mayhem">
 <label>Party code</label><input id="ptCode" maxlength="4" autocapitalize="characters" value="${esc(code||'')}" placeholder="ABCD" style="text-transform:uppercase;letter-spacing:8px;font-size:26px;text-align:center">
 <button class="btn mt" onclick="partyJoin()">Join</button><button class="btn ghost" onclick="closeModal()">Cancel</button>`)}
function partyJoin(){const name=($('#ptName').value||'').trim();const code=($('#ptCode').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 if(!name)return toast('Enter your GM name.');if(code.length!==4)return toast('Party codes have 4 letters.');LS.set('tksim_name',name);const show=($('#ptShow').value||'').trim().slice(0,24);if(show)LS.set('tksim_show',show);
 if(S&&!ON())saveLocal();if(typeof MP_UNSUB!=='undefined'&&MP_UNSUB){MP_UNSUB();MP_UNSUB=null}LMP=null;
 let tok=LS.get('tksim_party_token');if(!tok){tok=newCode(12);LS.set('tksim_party_token',tok)}
 PARTY={host:false,code,name,show,token:tok,seat:null,rev:0,status:'connecting',lobby:[]};S=null;LS.del(PARTY_GAME);partyJoinPersist();
 closeModal();tab='home';render();partyConnect()}
function partyJoinPersist(){if(PARTY&&!PARTY.host)LS.set(PARTY_JOIN,PJ({code:PARTY.code,name:PARTY.name,show:PARTY.show||'',token:PARTY.token,seat:PARTY.seat,rev:PARTY.rev,dirty:!!PARTY.dirty}))}
async function partyConnect(){if(!PARTY||PARTY.host)return;clearTimeout(PARTY.retryT);
 try{await partyLoadPeer()}catch(e){PARTY.status='nopeer';render();return}
 const P=PARTY;if(PARTY!==P)return;
 if(!P.peer||P.peer.destroyed){const peer=new Peer(undefined,{debug:0});P.peer=peer;
  peer.on('open',()=>partyDial());
  peer.on('disconnected',()=>{if(!peer.destroyed)setTimeout(()=>{try{peer.reconnect()}catch(e){}},1500)});
  peer.on('error',e=>{if(PARTY!==P)return;const t=e&&e.type;
   if(t==='peer-unavailable'){P.status='notv';partyPhoneRender();P.retryT=setTimeout(partyDial,4000);return}
   if(t==='browser-incompatible'){P.status='nopeer';partyPhoneRender();return}
   P.status='off';partyPhoneRender();P.retryT=setTimeout(partyConnect,4000)})}
 else if(P.peer.open)partyDial()}
function partyDial(){const P=PARTY;if(!P||P.host||!P.peer||P.peer.destroyed)return;clearTimeout(P.retryT);
 if(P.conn&&P.conn.open)return;
 const c=P.peer.connect(PEER_PREFIX+P.code,{reliable:true});P.conn=c;
 c.on('open',()=>{if(PARTY!==P)return;P.status='on';P.inflight=false;P.heard=Date.now();c.send({t:'hello',name:P.name,show:P.show||'',token:P.token});if(P.dirty)partySend();partyPhoneRender();partyBeat()});
 c.on('data',m=>{P.heard=Date.now();try{partyPhoneMsg(m)}catch(e){console.warn('party msg',e)}});
 c.on('close',()=>{if(PARTY!==P||(P.conn&&P.conn!==c))return;P.status='off';P.inflight=false;partyPhoneRender();clearTimeout(P.retryT);P.retryT=setTimeout(partyDial,3000)});
 c.on('error',()=>{})}
function partyBeat(){const P=PARTY;if(!P||P.host)return;clearTimeout(P.beatT);
 P.beatT=setTimeout(()=>{if(PARTY!==P)return;const c=P.conn;
  if(c&&c.open){if(Date.now()-(P.heard||0)>25000){/* the TV stopped answering */P.conn=null;P.status='off';P.inflight=false;try{c.close()}catch(e){}partyPhoneRender();partyDial()}else partySendConn(c,{t:'ping'})}
  partyBeat()},8000)}
function partyPhoneMsg(m){const P=PARTY;if(!P||P.host||!m)return;if(m.t==='pong')return;
 if(m.t==='lobby'){P.lobby=m.players||[];if(!S)render();return}
 if(m.t==='err'){const why=m.m==='full'?'That party is full (4 GMs).':m.m==='started'?'That party already started. Join with the same GM name you used before to take your seat back.':'Couldn\'t join that party.';
  try{P.peer&&P.peer.destroy()}catch(e){}LS.del(PARTY_JOIN);PARTY=null;S=load();if(S){dataUpdate(S);ensureTraits(S);econMigrate(S);feudInit(S);showMigrate()}render();toast(why);return}
 if(m.t!=='state')return;
 P.seat=m.seat;
 if(m.ack){P.inflight=false;clearTimeout(P.ackT)}
 if(P.inflight)return;              /* our own changes are on the way; the reply will include them */
 if(P.dirty&&!m.rej){partySend();return}
 /* never swap the game out mid-show or mid-edit: hold the newest copy until the screen closes */
 if(partyEditing()){if(!P.pending||!P.pending.rej)P.pending=m;return}
 partyApply(m)}
function partyApply(m){const P=PARTY;
 if(m.rej){P.dirty=false;toast(m.rej==='conflict'?'Someone else got there first — your screen has been refreshed.':'Refreshed from the TV.')}
 const st=JSON.parse(m.s);const hadS=!!S;viewFor(st,m.seat);ensureTraits(st);S=st;P.rev=m.rev;partyJoinPersist();
 try{localStorage.setItem(PARTY_GAME,PJ(S))}catch(e){}
 const k=S.last?(S.last.season||S.season)*100+S.last.week:0,seen=+(LS.get('tksim_seen_party')||0);
 render();if(k>seen){LS.set('tksim_seen_party',k);if(hadS)partyResultsPrompt()}}
function partyPhoneRender(){if(!PARTY||PARTY.host)return;if(!partyEditing())render();else PARTY.deferRender=true}
function partySend(){const P=PARTY;if(!P||P.host||!S)return;clearTimeout(P.sendT);
 if(!P.conn||!P.conn.open||P.inflight)return;
 P.inflight=true;P.dirty=false;partyJoinPersist();
 partySendConn(P.conn,{t:'upd',rev:P.rev,s:PJ(canonState())});
 clearTimeout(P.ackT);P.ackT=setTimeout(()=>{if(PARTY===P&&P.inflight){P.inflight=false;P.dirty=true;partySend()}},10000)}
function partySave(){if(isPartyHost())return partyHostSaved();saveLocal();if(!PARTY)return;PARTY.dirty=true;partyJoinPersist();clearTimeout(PARTY.sendT);PARTY.sendT=setTimeout(partySend,200)}
function partyEditing(){return !!(PS||ME||LQ||ED||PE||CE||PK||CF||QP)}
function partyAfterIdle(){const P=PARTY;if(!P||P.host)return;
 if(P.pending){const m=P.pending;P.pending=null;if(P.dirty&&!m.rej)return partySend();return partyApply(m)}
 if(P.deferRender){P.deferRender=false;render()}}
function partyResultsPrompt(){if(!S||!S.last)return;openModal(`<div class="h mhd">📺 Week ${S.last.week} is on!</div><p>Everyone's locked in — watch the results play out on the TV.</p><button class="btn" onclick="showResults()">See my results</button><button class="btn ghost" onclick="closeModal()">I'm watching the TV</button>`)}

/* ===================== game hooks (called from the main game) ===================== */
function partyMyTurn(){const o=S.online||{};if(S.phase==='rookies')return !(o.rk&&o.rk.p);if(S.phase==='draft')return onClock()==='p';if(S.phase==='season')return !(o.booked&&o.booked.p);return false}
function partyWaiting(){const o=S.online;return localSeats().filter(k=>S.phase==='rookies'?!(o.rk||{})[k]:!(o.booked||{})[k]).map(nameOf)}
function partyLocked(){if(partyMyTurn())return false;
 toast(S.phase==='over'?'Start the next season from the TV.':S.phase==='draft'?`${nameOf(onClock())} is on the clock.`:S.phase==='rookies'?"You're ready — waiting on the others.":'Your card is locked in — eyes on the TV! (Unlock it from the banner to make changes.)');return true}
function partyLockCard(){const o=S.online;o.booked=o.booked||{};o.booked.p=true;save();render();
 const left=partyWaiting();openModal(`<div class="h mhd">Locked in ✓</div><p>Your ${esc(curShow().ppv?curShow().name:curShow().mine)} card is in.${left.length?` Waiting on <b>${left.map(esc).join(', ')}</b>.`:''}</p><p class="muted">When everyone's locked in, the results play out on the TV.</p><button class="btn" onclick="closeModal()">Got it</button>`)}
function partyUnlock(){if(!S||S.phase!=='season')return;S.online.booked.p=false;save();render();toast('Unlocked — make your changes, then go live again.')}
function partyBanner(){const P=PARTY,o=S.online;const conn=P.status==='on'?'':P.status==='notv'?' · 📡 Can\'t find the TV — is the party still running?':P.status==='nopeer'?' · ⚠️ This browser can\'t do party mode':' · 📡 Reconnecting to the TV…';
 let t;if(S.phase==='rookies')t=o.rk&&o.rk.p?`✅ You're ready — waiting on ${esc(partyWaiting().join(', '))||'the TV'}`:'🟡 Create wrestlers, then continue to the draft';
 else if(S.phase==='draft')t=onClock()==='p'?"🟡 You're on the clock!":`⏳ ${esc(nameOf(onClock()))} is picking`;
 else if(S.phase==='season'){const w=partyWaiting();t=o.booked&&o.booked.p?`✅ Locked in${w.length?' — waiting on '+esc(w.join(', ')):''} · <a href="#" onclick="partyUnlock();return false" style="color:var(--gold2)">Unlock</a>`:`🟡 Book your show${w.length>1?' — still booking: '+esc(w.filter(x=>x!==S.gm).join(', ')):' — everyone else is locked in!'}`}
 else t='🏁 Season over — start the next one from the TV';
 return `<div class="mpbar ${partyMyTurn()?'on':''}">📺 <span><b>${t}</b><br><span class="muted tiny">Party ${esc(P.code)}${conn}</span></span></div>`}
function partyPhoneLobby(){const P=PARTY;const st=P.status==='on'?'Connected to the TV':P.status==='notv'?"Can't find a TV with that code yet — keep this open, it'll keep trying.":P.status==='nopeer'?"This browser can't do party mode.":'Connecting to the TV…';
 return `<div class="hero"><div class="kicker"><i></i>Party ${esc(P.code)}</div><div class="hero-t">You're in!</div><p class="muted">${esc(st)}</p></div>
 <div class="card"><div class="h small">In the room</div>${(P.lobby||[]).map(n=>`<div class="row sb" style="margin:6px 0"><b class="${n===P.name?'gold':''}">${esc(n)}</b><span class="muted tiny">${n===P.name?'you':''}</span></div>`).join('')||'<div class="muted">Waiting for the TV…</div>'}<p class="muted" style="margin-bottom:0">The game starts when the TV taps <b>Start</b>.</p></div>
 <button class="btn ghost danger" onclick="partyEnd()">Leave</button>`}
function partyOfficeCard(){const P=PARTY;return `<div class="card"><div class="h small">📺 Party ${esc(P.code)}</div><div class="muted" style="margin-bottom:6px">${P.status==='on'?'Connected to the TV':'Not connected — retrying…'}</div>${localSeats().map(k=>`<div class="row sb" style="margin:4px 0"><b class="${k==='p'?'gold':''}">${esc(nameOf(k))}</b><span class="muted tiny">${esc(showNames()[k]||'')}${k==='p'?' · you':''}</span></div>`).join('')}<button class="btn ghost danger" onclick="partyEnd()">Leave the party</button></div>`}
function partySetupCard(){return `<div class="card"><div class="h small">📺 Party mode</div><p class="muted" style="margin-top:0">Same room, big screen. Put the game on the TV, everyone books their own show on their phone at the same time, then watch the results play out together.</p><div class="row"><button class="btn sec" onclick="partyHostConfirm()">Host on this screen</button><button class="btn sec" onclick="partyJoinForm()">Join a party</button></div></div>`}
function partyNid(){return (S.nid++)+(PARTY&&!PARTY.host&&PARTY.seat?PARTY.seat:'')}

/* resume after a reload, or open the join form from a ?party=CODE link */
function partyBoot(){const q=new URLSearchParams(location.search).get('party');
 try{const h=JSON.parse(LS.get(PARTY_HOST)||'null');
  if(h&&h.code){PARTY={host:true,code:h.code,players:(h.players||[]).map(p=>Object.assign({},p,{online:false})),conns:{},hist:{},rev:0,reveal:null,status:'connecting'};
   LMP=null;S=null;try{const g=localStorage.getItem(PARTY_GAME);if(g){S=JSON.parse(g);PARTY.rev=(S.online&&S.online.rev)||0;ensureTraits(S);econMigrate(S)}}catch(e){S=null}
   if(S)PARTY.hist[PARTY.rev]=PJ(canonState());partyHostOpen(true);return true}
  const j=JSON.parse(LS.get(PARTY_JOIN)||'null');
  if(j&&j.code&&(!q||q.toUpperCase()===j.code)){PARTY={host:false,code:j.code,name:j.name,show:j.show||'',token:j.token,seat:j.seat,rev:j.rev||0,dirty:!!j.dirty,status:'connecting',lobby:[]};
   LMP=null;S=null;try{const g=localStorage.getItem(PARTY_GAME);if(g&&j.seat){S=JSON.parse(g);ensureTraits(S)}}catch(e){S=null}
   partyConnect();return true}}catch(e){console.warn('party resume',e);PARTY=null}
 if(q){history.replaceState(null,'',location.pathname);setTimeout(()=>partyJoinForm(q.toUpperCase().slice(0,4)),300)}
 return false}

/* ===================== TV screens ===================== */
function tvRefresh(){if(!isPartyHost())return;if(PARTY.reveal&&document.getElementById('rv'))return tvUpdateDots();render()}
function tvUpdateDots(){}
function tvHeader(){const P=PARTY;const st=P.status==='on'?'':P.status==='nopeer'?'<span class="tv-warn">This browser can\'t host a party</span>':'<span class="tv-warn">📡 Connecting…</span>';
 return `<header class="top tv-top"><div class="brand"><span class="logo">TONY KHAN</span><span class="logo2">SIM</span></div><div class="hud">${st}${S?`<span class="hudc">JOIN <b>${esc(P.code)}</b></span>`:''}<button class="mini" onclick="partyEnd()">End party</button></div></header>`}
function tvQR(){try{const q=qrcode(0,'M');q.addData(partyJoinUrl());q.make();return q.createSvgTag({cellSize:6,margin:2,scalable:true})}catch(e){return ''}}
function tvDot(p){return `<i class="tv-dot ${p&&p.online?'on':''}"></i>`}
function tvPlayerBySeat(seat){return PARTY.players.find(p=>p.seat===seat)}
function tvRender(){document.body.classList.add('tv');const app=$('#app');
 if(PARTY.reveal&&S&&S.last){if(document.getElementById('rv')&&PARTY.reveal.built===PARTY.reveal.key+':'+PARTY.reveal.pi)return;app.innerHTML=tvHeader()+`<main class="tv-main">${tvRevealHtml()}</main>`;tvRevealRun();return}
 let body;
 if(!S)body=tvLobby();else if(S.phase==='rookies')body=tvRookies();else if(S.phase==='draft')body=tvDraft();else if(S.phase==='over')body=tvOver();else body=tvWeek();
 app.innerHTML=tvHeader()+`<main class="tv-main">${body}</main>`}
function tvLobby(){const P=PARTY,n=P.players.length;
 return `<div class="tv-lobby"><div class="tv-join"><div class="kicker"><i></i>Party mode · 2–4 GMs</div><div class="hero-t tv-hero">Grab your<br>phones</div>
 <ol class="tv-steps"><li>Open <b>${esc(partyShortUrl())}</b></li><li>Tap <b>Join a party</b></li><li>Enter the code</li></ol><div class="tv-code">${esc(P.code)}</div></div>
 <div class="tv-qr">${tvQR()}<div class="muted center">Or scan to join</div></div></div>
 <div class="tv-players">${[0,1,2,3].map(i=>{const p=P.players[i];return p?`<div class="tv-pl on">${tvDot(p)}<b>${esc(p.name)}</b><span>${esc(cleanShow(p.show,i))}</span></div>`:`<div class="tv-pl"><b>Open seat</b><span>${i<2?'Waiting for a GM…':'Optional'}</span></div>`}).join('')}</div>
 <button class="btn tv-go" ${n>=2?'':'disabled'} onclick="partyStart()">${n>=2?`Start with ${Math.min(4,n)} GMs ▸`:'Waiting for GMs to join…'}</button>`}
function tvGMs(){return seatIds().map(s=>({seat:s,k:localKey(s),p:tvPlayerBySeat(s)}))}
function tvRookies(){const o=S.online;const made=Object.values(S.w).filter(w=>w.cw).length;
 return `<div class="tv-title"><div class="kicker"><i></i>Before the draft</div><div class="hero-t tv-hero">Create your<br>wrestlers</div><p class="muted">Everyone's building original wrestlers on their phones. The draft starts when every GM is ready.${made?` <b class="gold">${made} created so far.</b>`:''}</p></div>
 <div class="tv-players">${tvGMs().map(g=>`<div class="tv-pl on ${(o.rk||{})[g.k]?'ok':''}">${tvDot(g.p)}<b>${esc(nameOf(g.k))}</b><span>${(o.rk||{})[g.k]?'✅ Ready for the draft':'✏️ Creating…'}</span></div>`).join('')}</div>`}
function tvDraft(){const d=S.draft,oc=onClock();const seat=canonKey(oc);
 return `<div class="tv-grid"><div><div class="tv-title"><div class="kicker"><i></i>The Draft · Round ${d.round} of ${d.rounds}</div><div class="tv-sub">On the clock</div><div class="hero-t tv-hero tv-clock">${esc(nameOf(oc))}</div>
 ${tvPlayerBySeat(seat)&&!tvPlayerBySeat(seat).online?`<button class="btn sec" onclick="partyAutoFor('${seat}')">Pick for ${esc(nameOf(oc))}</button>`:''}</div>
 <div class="tv-players">${tvGMs().map(g=>{const l=ownList(g.k);return `<div class="tv-pl on ${g.k===oc?'ok':''}">${tvDot(g.p)}<b>${esc(nameOf(g.k))}</b><span>${l.length} picked · ${cnt(l)}${S.online.auto&&S.online.auto[g.k]?' · auto':''}</span></div>`}).join('')}</div>
 ${d.last&&S.w[d.last]?`<div class="tv-last">${wcard(S.w[d.last],{on:''})}<div><div class="tv-sub">Just picked</div><b>${esc(S.w[d.last].name)}</b><div class="muted">${esc(nameOf(S.w[d.last].own))} · ${STYLE_N[S.w[d.last].st]} · ${S.w[d.last].al==='f'?'Face':'Heel'}</div></div></div>`:''}</div>
 <div class="card tv-log"><div class="h small">Latest picks</div>${d.log.slice(0,10).map((x,i)=>`<div class="tv-pick ${i?'':'new'}">${esc(x)}</div>`).join('')||'<div class="muted">First pick coming up…</div>'}</div></div>`}
function tvStandings(){const l=localSeats().slice().sort((a,b)=>S.fans[b]-S.fans[a]);
 return `<div class="card"><div class="h small">Standings</div>${l.map((k,i)=>`<div class="tv-row"><span>${['🥇','🥈','🥉','4.'][i]} <b>${esc(nameOf(k))}</b> <span class="muted tiny">${esc(showNames()[k]||'')}</span></span><span><b class="gold">${fmtFans(S.fans[k])}</b> <span class="muted">fans · ${S.hourWins[k]||0} W</span></span></div>`).join('')}</div>`}
function tvWeek(){const sh=curShow(),o=S.online;const v=venueOf();
 const pairs=pairings(S.week,nSeats());
 const gm=s=>{const k=localKey(s),p=tvPlayerBySeat(s),lk=(o.booked||{})[k];return `<div class="tv-gm ${lk?'lk':''}">${tvDot(p)}<div class="tv-show">${esc(sh.ppv?sh.name:showNames()[k]||'')}</div><b>${esc(nameOf(k))}</b><div class="tv-lock">${lk?'✅ Locked in':'✏️ Booking…'}</div>${!lk&&p&&!p.online?`<button class="mini" onclick="partyAutoFor('${s}')">Auto-book</button>`:''}</div>`};
 return `<div class="tv-grid"><div><div class="card showcard ${sh.ppv?'ppv':''} tv-poster"><div class="wm">${esc(sh.ppv?sh.name:v[1].split(',')[0])}</div><div class="kicker"><i></i>Week ${S.week} of ${SEASON}${sh.ppv?' · Pay-per-view':' · Ratings war'}</div><div class="showname">${esc(sh.ppv?sh.name:'Week '+S.week)}</div><div class="venue">${sh.ppv?'<b>Live on pay-per-view</b>':`<b>${esc(v[0])}</b> · ${esc(v[1])}`}</div></div>
 <div class="tv-match">${pairs.map(([a,b])=>b?`<div class="tv-pair">${gm(a)}<div class="vs">VS</div>${gm(b)}</div>`:`<div class="tv-pair bye">${gm(a)}<div class="tv-byetag">Bye week — airs solo</div></div>`).join('')}</div>
 <p class="muted center">Book your show on your phone and go live. When everyone's locked in, the results play here.</p></div>
 <div>${tvStandings()}<div class="card"><div class="h small">The Wire</div>${S.news.slice(-6).reverse().map(n=>`<div class="news"><span class="muted">W${n.w}</span> ${esc(n.t)}</div>`).join('')}</div></div></div>`}
function tvOver(){const l=localSeats().slice().sort((a,b)=>S.fans[b]-S.fans[a]);
 return `<div class="tv-title center"><div class="kicker"><i></i>Season ${S.season} complete</div><div class="hero-t tv-hero">${esc(nameOf(l[0]))}<br>wins!</div></div>${tvStandings()}
 ${S.best?`<div class="card center"><div class="muted">Match of the year</div><div class="big">${esc(S.best.t)} <span class="stars">${stars(S.best.s)}</span></div><div class="muted">${esc(S.best.show)} · Week ${S.best.w}</div></div>`:''}
 <button class="btn tv-go" onclick="nextSeason()">Start Season ${S.season+1} ▸</button>`}

/* ---------- the reveal: each show's segments, side by side, one at a time ---------- */
function tvRevealPairs(){const L=S.last;return (L.pairs||[{blocks:L.blocks,ratings:L.ratings,fans:L.fans,hourWin:L.hourWin}])}
function tvRevealHtml(){const L=S.last,R=PARTY.reveal,pairs=tvRevealPairs(),pr=pairs[R.pi];R.built=R.key+':'+R.pi;
 const cols=pr.blocks.filter(b=>b.brand!=='x'),x=pr.blocks.find(b=>b.brand==='x');
 const col=(b,ci)=>`<div class="rv-col"><div class="rv-hd"><div class="rv-show">${esc(b.label)}</div><div class="rv-run" id="rvr${ci}">—</div></div>${b.segs.map((s,si)=>`<div class="rv-seg" id="rv-${ci}-${si}" data-st="${s.stars}"><div class="muted tiny">${si===b.segs.length-1?'<b class="gold">MAIN EVENT</b> · ':''}${esc(s.sub)}</div><div class="rv-txt">${esc(s.txt)}</div><div class="stars rv-stars">${stars(s.stars)}</div>${s.notes.slice(0,3).map(n=>`<div class="note">${esc(n)}</div>`).join('')}</div>`).join('')||'<div class="muted">Nothing aired.</div>'}</div>`;
 const ks=Object.keys(pr.ratings);const best=ks.slice().sort((a,b)=>pr.ratings[b]-pr.ratings[a])[0];
 return `<div id="rv" class="rv"><div class="rv-top"><div class="kicker"><i></i>Week ${L.week} · ${pairs.length>1?`Matchup ${R.pi+1} of ${pairs.length}`:'Results'}</div><div class="showname">${esc(L.ppv?L.title:ks.map(k=>showNames()[k]||nameOf(k)).join(' vs '))}</div></div>
 <div class="rv-cols">${cols.map((b,ci)=>(ci?'<div class="vs rv-vs">VS</div>':'')+col(b,ci)).join('')}</div>
 ${x?`<div class="card rv-x"><div class="h small">${esc(x.label)}</div>${x.segs.map((s,si)=>`<div class="rv-seg" id="rv-x-${si}"><div class="rv-txt">${esc(s.txt)}</div><div class="muted tiny">${esc(s.sub)}</div><div class="stars rv-stars">${stars(s.stars)}</div>${s.notes.slice(0,2).map(n=>`<div class="note">${esc(n)}</div>`).join('')}</div>`).join('')}</div>`:''}
 <div class="rv-final" id="rv-final"><div class="rv-scores">${ks.map(k=>`<div class="rv-score ${k===best&&ks.length>1?'win':''}"><span>${esc(nameOf(k))}</span><div class="stars">${stars(pr.ratings[k])}</div><b class="${pr.fans[k]>=0?'good':'bad'}">${pr.fans[k]>=0?'+':''}${fmtFans(Math.abs(pr.fans[k])).replace(/^/,pr.fans[k]<0?'−':'')} fans</b></div>`).join('')}</div>
 <div class="rv-win">${ks.length>1?(pr.hourWin?`🏆 ${esc(nameOf(pr.hourWin))} wins the night!`:`🏆 ${esc(nameOf(best))} steals the show!`):'Bye-week show in the books.'}</div></div>
 <div class="rv-ctl"><button class="mini" onclick="tvRevealSkip()">Skip ▸▸</button></div></div>`}
function tvRevealRun(){const R=PARTY.reveal,pr=tvRevealPairs()[R.pi];const cols=pr.blocks.filter(b=>b.brand!=='x'),x=pr.blocks.find(b=>b.brand==='x');
 const steps=[];const max=Math.max(0,...cols.map(b=>b.segs.length));
 for(let i=0;i<max;i++)cols.forEach((b,ci)=>{if(b.segs[i])steps.push({id:`rv-${ci}-${i}`,ci,n:b.segs[i].notes.length})});
 if(x)x.segs.forEach((s,i)=>steps.push({id:'rv-x-'+i,n:s.notes.length}));
 steps.push({id:'rv-final',n:0,final:true});R.steps=steps;R.si=R.si||0;
 for(let i=0;i<R.si&&i<steps.length;i++)tvRevealShow(steps[i],true);
 tvRevealNext()}
function tvRevealShow(st,instant){const el=document.getElementById(st.id);if(!el)return;el.classList.add('on');if(instant)el.classList.add('now');
 if(st.ci!=null){const segs=[...document.querySelectorAll(`[id^="rv-${st.ci}-"].on`)].map(e=>+e.dataset.st);const r=document.getElementById('rvr'+st.ci);if(r&&segs.length)r.innerHTML=`<span class="muted tiny">SO FAR</span> <span class="stars">${stars(avg(segs))}</span>`}
 if(!instant)try{el.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}}
function tvRevealNext(){const R=PARTY&&PARTY.reveal;if(!R||!document.getElementById('rv'))return;clearTimeout(R.t);
 if(R.si>=R.steps.length){R.t=setTimeout(tvRevealAdvance,9000);return}
 const st=R.steps[R.si++];tvRevealShow(st,false);
 R.t=setTimeout(tvRevealNext,st.final?0:Math.min(7000,3000+st.n*1100))}
function tvRevealAdvance(){const R=PARTY&&PARTY.reveal;if(!R)return;clearTimeout(R.t);const n=tvRevealPairs().length;
 if(R.pi<n-1){R.pi++;R.si=0;R.built=null;render();return}
 PARTY.reveal=null;window.scrollTo(0,0);render()}
function tvRevealSkip(){const R=PARTY&&PARTY.reveal;if(!R)return;clearTimeout(R.t);
 if(R.si<R.steps.length){while(R.si<R.steps.length)tvRevealShow(R.steps[R.si++],true);const f=document.getElementById('rv-final');if(f)try{f.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}R.t=setTimeout(tvRevealAdvance,9000)}else tvRevealAdvance()}
