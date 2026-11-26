/* Tony Khan Simulator — the line outside your office (v234, restyled v235).
   Wrestlers knocking on the door with ideas, demands and requests, and the other out-of-the-ring calls that come with
   their own dialogue (front-office situations, medical calls, tampering, trade offers, signing offers, tapes and emails,
   teams in the making, and since v322 wrestlers' own requests from the briefing — owed title shots, contract clauses,
   favors, feuds that need an ending), and since v324 agents for contracts on their last two shows, used to sit inside the weekly briefing. Now they line up outside your office at the start of the
   week: you call them in one at a time, each answered before you get to the briefing and the card. The briefing keeps the rest — the
   show, the locker room's mood, contracts, the calendar.
   How it works: the inbox is a queue built fresh from the game state each time (inboxList). Pitches and situations open
   their own decision screens; everything else is one row taken from the briefing's own sections (so the buttons and
   their effects are exactly the ones the briefing had), with a voice on top. While the inbox is open, closing a sheet
   or "going back to the briefing" brings you back to the next notification, until none are left — then you're back on Home, where the
   briefing is the news-only "This week" panel (v324). Loaded last; hooks in by wrapping openBrief, closeModal, briefItems, goLive, go and a few answer functions. */
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
 {k:'callup',test:s=>s.i==='📣'},
 {k:'venue',test:s=>s.i==='🪑'},     /* v424: a top star who wants a bigger room (venues.js) */
 {k:'rein',test:s=>s.i==='🎭'}           /* v399: a wrestler asking to chase a different crowd (fanbase.js) */            /* a hot ROH prospect asking to be called up (back at the door in v343) */
 /* v342: watchlist updates and suggested teams left the door: nothing happens if you don't answer (you keep following,
    the pair stays unnamed) and the action is always there — the ROH screen's watchlist, the Front office. They're rows
    in This week instead. */];
const deskKind=s=>{const d=DESK.find(d=>d.test(s));return d?d.k:null};
const isAsk=row=>/<button/.test(row);
let B0=null;            /* the briefing's sections before the inbox takes its rows out */
function allowed(){if(!S||S.phase!=='season')return false;if(typeof TV!=='undefined'&&TV)return false;if(typeof LIVE!=='undefined'&&LIVE)return false;
 if(ON()&&typeof myTurn==='function'&&!myTurn())return false;if(typeof mpLockedQuiet==='function'&&mpLockedQuiet())return false;return true}
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
 if(k==='venue'){const w=typeof venAsker==='function'&&venAsker('p');if(!w)return null;return [w.w.id,pickL([`Boss, we've got ${fmtFans(S.fans.p)} people watching and I'm still wrestling in the ${venOf('p').n}. Get us a real building.`,`My family asked why the crowd looks so small on TV. I didn't have an answer. Book a bigger room.`,`We're the hottest thing on TV and we're working the ${venOf('p').n}. That's not where stars wrestle.`],w.w.id)]}
 if(k==='rein'){const m=row.match(/fgReinvent\('([^']+)'/);const w=m&&S.w[m[1]];if(!w)return null;return [w.id,`Boss, am I not what you're looking for? If I change myself fundamentally, will that get me booked?`]}
 if(k==='callup'){const m=row.match(/callUp\('([^']+)'\)/);const w=m&&(S.w[m[1]]||(typeof farmList==='function'&&farmList('p').find(x=>x.id===m[1])));return [w?(S.w[w.id]?w.id:w.name):'ROH',w?pickL([`I'm ready. Every week in ROH is a week I'm not on your show.`,`They're chanting my name in ROH. Bring me up and I'll make them chant it on TV.`],w.id):'One of your ROH prospects is ready.']}
 if(k==='cd'){const c=typeof cdOfferLive==='function'&&cdOfferLive();const w=c&&S.w[c.x];if(!w)return null;
  return [w.id,pickL([`I told you I'd be there when it hit zero. Now let's talk about where I go next.`,`You saw what happened out there. Every company in the business saw it. Make me an offer.`],w.id)]}
 if(k==='oc'){const o=typeof ocOfferLive==='function'&&ocOfferLive();const w=o&&S.w[o.id];if(!w)return null;
  return [w.id,pickL([`You gave me a shot out there. Give me a contract and I'll prove it wasn't a fluke.`,`I answered the challenge. Now I'm asking one: put me on the roster.`],w.id)]}
 return null}
const KIND={callup:['📣','Ready for the call-up'],rein:['🎭','Wants a reinvention'],tamp:['🕵️','A word about another offer'],med:['🚑','The trainer, with an update'],trade:['🔁','The rival on the line'],cd:['⏳','The countdown debut, at your door'],oc:['📝','Your open challenger is back'],tape:['📼','A tape on your desk']};
/* who's standing in line for each one */
function whoOf(x){if(x.k==='ahold'||x.k==='aback')return x.id;if(x.k==='ask')return x.a.who;if(x.k==='agent')return x.w.id;if(x.k==='crisis')return S.crisis&&S.crisis.a;if(x.k==='pitch')return S.pitch&&S.pitch.a;if(x.k==='tape')return '📼';if(x.k==='net')return NET_WHO;if(x.k==='fg'){const f=fgVisit();return f?f.F.id:'?'}if(x.k==='fgd'){const f=fgDrift();return f?f.A.id:'?'}if(x.k==='tr'){const w=trVisit();return w?w.id:'?'}if(x.k==='trade')return '📞';const v=voiceFor(x.k,x.row);return v?v[0]:'?'}
/* ---- what's waiting ---- */
function inboxList(){if(!allowed())return [];const out=[];
 if(S.crisis&&S.w[S.crisis.a]&&S.w[S.crisis.a].own==='p'&&typeof CRISES!=='undefined'&&CRISES[S.crisis.k])out.push({k:'crisis',open:()=>_oc()});
 if(S.pitch&&typeof PITCHES!=='undefined'&&PITCHES[S.pitch.k]&&S.w[S.pitch.a]&&S.w[S.pitch.a].own==='p')out.push({k:'pitch',open:()=>_op()});
 try{if(typeof arcDeskList==='function')arcDeskList().forEach(x=>out.push({k:x.k,id:x.id,open:()=>arcDeskOpen(x.k,x.id)}))}catch(e){console.warn('inbox arcs',e)}
 try{if(netDue())out.push({k:'net',open:openNet})}catch(e){console.warn('inbox net',e)}
 try{if(typeof fgVisit==='function'&&fgVisit())out.push({k:'fg',open:openFg})}catch(e){console.warn('inbox friends',e)}
 try{if(typeof fgDrift==='function'&&fgDrift())out.push({k:'fgd',open:openFgd})}catch(e){console.warn('inbox drift',e)}
 try{if(typeof trVisit==='function'&&trVisit())out.push({k:'tr',open:openTr})}catch(e){console.warn('inbox traits',e)}
 try{agentList().forEach(w=>out.push({k:'agent',w,open:()=>openAgent(w.id)}))}catch(e){console.warn('inbox agents',e)}
 try{askList().forEach(a=>out.push({k:'ask',a,open:()=>openAsk(a.id)}))}catch(e){console.warn('inbox asks',e)}
 let secs=[];try{secs=B0?B0():[]}catch(e){console.warn('inbox',e)}
 const order=['tamp','med','trade','cd','oc','tape','callup'];
 secs.map(s=>({s,k:deskKind(s)})).filter(x=>x.k).sort((a,b)=>order.indexOf(a.k)-order.indexOf(b.k)).forEach(({s,k})=>(s.rows||[]).forEach(row=>{if(isAsk(row))out.push({k,row,s})}));
 return lineup(out)}
/* v341: the line was everyone with something to say, every week, and nothing goes live until it's clear — by mid-season
   that was 7–11 visits before you could book. Now at most DESK_MAX people get in each week, picked by urgency when the
   week's line first forms. What can't wait always gets in (a front-office situation, a pitch, a contract on its last
   show, the trainer). Everyone else waits for a later week — they're still there, in the same order. */
/* v369: the network exec and friends (a friend's visit, someone who fell out with their group) come right after the
   front-office business and before contract talks that can still wait, and they keep waiting outside until there's room. */
const DESK_MAX=4;/* v370: 3 → 4, so the network and friends' visits make it in too */window.DESK_MAX=DESK_MAX;
function dKey(x){if(x.k==='ahold'||x.k==='aback')return x.k+':'+x.id;if(x.k==='crisis'||x.k==='pitch'||x.k==='net'||x.k==='fg'||x.k==='fgd'||x.k==='tr')return x.k;if(x.k==='agent')return 'ag:'+x.w.id;if(x.k==='ask')return 'ask:'+x.a.id;
 const q=(x.row||'').match(/\('([^']+)'/);if(q)return x.k+':'+q[1];const b=(x.row||'').match(/<b>([^<]+)<\/b>/);return x.k+':'+(b?b[1]:(x.row||'').length)}
/* v371: the network exec and friends' visits are information you can't get anywhere else, so they always get in too */
/* v425: a trait slot that opened (one wrestler a week) always gets in */
const dUrgent=x=>x.k==='ahold'||x.k==='aback'||x.k==='tr'||x.k==='crisis'||x.k==='pitch'||x.k==='med'||x.k==='net'||x.k==='fg'||x.k==='fgd'||(x.k==='agent'&&x.w.con<=1);
const D_RANK=x=>x.k==='crisis'?0:x.k==='pitch'?1:x.k==='agent'&&x.w.con<=1?2:x.k==='med'?3:x.k==='ahold'?3.2:x.k==='aback'?3.4:x.k==='tamp'?4:x.k==='net'?4.2:x.k==='fgd'?4.4:x.k==='fg'?4.6:x.k==='tr'?4.8:x.k==='agent'?5:x.k==='ask'&&x.a.due?6:
 ({trade:7,cd:8,oc:8,ask:9,callup:10,tape:11})[x.k]||14;
function lineup(out){const wk=AW();
 if(!S.deskWk||S.deskWk.w!==wk){const pick=out.map((x,i)=>({x,i})).sort((a,b)=>D_RANK(a.x)-D_RANK(b.x)||a.i-b.i).map(o=>o.x);const keys=[];
  pick.forEach(x=>{if(dUrgent(x)||keys.length<DESK_MAX)keys.push(dKey(x))});S.deskWk={w:wk,keys}}
 const K=new Set(S.deskWk.keys);
 /* something urgent that turns up mid-week still gets in */
 out.forEach(x=>{const k=dKey(x);if(!K.has(k)&&dUrgent(x)){S.deskWk.keys.push(k);K.add(k)}});
 return out.filter(x=>K.has(dKey(x)))}
window.inboxList=inboxList;
function qAv(id,on){const w=S.w[id];if(w)return `<span class="ibx-a ${on?'on':''}">${face(w)}</span>`;const t=/^[A-Za-z]/.test(String(id))?String(id).split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase():id;return `<span class="ibx-a x ${on?'on':''}">${esc(t||'?')}</span>`}
function head(n,left){let l=[];try{l=inboxList()}catch(e){}const q=l.map((x,i)=>qAv(whoOf(x),i===0)).join('');
 return `<div class="ibx-k"><span class="live-tag" style="background:var(--gold);color:#111">🚪 YOUR OFFICE</span>${left>1?`${left} waiting outside`:'Last one in line'} · ${n} of ${n+left-1}</div>${q?`<div class="ibx-q">${q}</div>`:''}`}
function voiceH(sp,line){const w=S.w[sp];const av=w?`<span class="scav">${face(w)}</span>`:`<span class="scav x">${esc(String(sp).replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'?')}</span>`;
 return `<div class="scs">${av}<div class="scq"><b class="${w?(w.al==='h'?'heel':'face'):''}">${esc(w?w.name:sp)}</b><q>${esc(line)}</q></div></div>`}
function deskPage(x,pos,left){const [ic,nm]=KIND[x.k]||[x.s.i,x.s.t];const v=voiceFor(x.k,x.row);
 return `${head(pos,left)}<div class="h mhd mt">${ic} ${esc(nm)}</div><div class="scene brief ibx">${v?voiceH(v[0],v[1]):''}${x.row}</div>`}
/* ---- v324: re-signings. A contract down to its last two shows is the biggest call of the week, so the agent comes to
   the door instead of waiting in the briefing: open talks (or, if they walked away, re-sign at their price), put it off
   a week (two shows left only — they'll be back for the last one), or let them test free agency (last show only; the
   go-live contract check won't ask again). Everyone else's contract stays on Home's countdown, negotiable any time. */
const AG_SHOWS=2;
function agentList(){const wk=AW();S.agAsk=S.agAsk||{};Object.keys(S.agAsk).forEach(k=>{if(wk-S.agAsk[k]>4)delete S.agAsk[k]});
 /* v341: two shows out only for the names that matter (55+ popularity or a champion); everyone else's agent comes once, on the last show */
 return ownList('p').filter(w=>w.con<=AG_SHOWS&&(w.con<=1||w.pop>=55||isChamp(w.id))&&S.agAsk[w.id]!==wk&&!(S.conAck&&S.conAck.wk===wk&&S.conAck.ids.includes(w.id))).sort((a,b)=>a.con-b.con||b.pop-a.pop)}
function openAgent(id){const w=S.w[id];if(!w)return closeModal();const blk=w.neg&&w.neg.no>AW();const last=w.con<=1;
 const line=typeof sayW==='function'?sayW(last?'agent_last':'agent_urgent',w,{A:w.name}):'';
 const st=typeof conStakes==='function'?conStakes(w):'';
 const ask=blk?`They walked away from talks — only a re-sign at their price works now (${money(resignCost(w))}).`:`They want about ${money(askSal(w))}/wk${typeof dealWantList==='function'&&dealWantList(w).length&&w.pop>=58?', plus a say in things':''}.`;
 openModal(`<div class="h mhd mt">✍️ ${last?'Last show on the contract':'Two shows left on the contract'}</div><div class="duo" style="align-items:center">${face(w)}</div>
 <div class="scene brief ibx">${line?voiceH(`${w.name}'s agent`,line):''}<div class="brow"><span class="muted tiny">${esc(ask)}${st?' '+esc(st.replace(/^./,c=>c.toUpperCase()))+'.':''}</span></div></div>
 <div class="muted tiny" style="margin:8px 0">${esc(w.name)} · ${typeof attnMood==='function'?esc(attnMood(w.mor)):'morale '+Math.round(w.mor)} · POP ${Math.round(w.pop)} · ${w.al==='f'?'Face':'Heel'}</div>
 ${blk?`<button class="choice" onclick="agentAnswer('${id}','sign')"><span class="key"><span>A</span></span><div>✍️ Re-sign at their price · ${esc(money(resignCost(w)))}</div><div class="muted tiny">Another 26 weeks, no haggling.</div></button>`
  :`<button class="choice" onclick="agentAnswer('${id}','talk')"><span class="key"><span>A</span></span><div>🤝 "Let's talk"</div><div class="muted tiny">Open the negotiation now — money, perks and promises.</div></button>`}
 ${last?`<button class="choice" onclick="agentAnswer('${id}','go')"><span class="key"><span>B</span></span><div>👋 "Let them test the market"</div><div class="muted tiny">${esc(w.name)} becomes a free agent after tonight's show${isChamp(w.id)?' — and their title goes vacant':''}.</div></button>`
  :`<button class="choice" onclick="agentAnswer('${id}','wait')"><span class="key"><span>B</span></span><div>⏳ "Let's talk next week"</div><div class="muted tiny">They'll be back for the last show. Talks get pricier near the deadline.</div></button>`}`)}
window.agentAnswer=function(id,k){if(typeof mpLocked==='function'&&mpLocked())return;const w=S.w[id];if(!w)return closeModal();S.agAsk=S.agAsk||{};S.agAsk[id]=AW();
 if(k==='talk'){save();dealNegotiate(id);return}/* the talks replace this screen; closing them calls in the next one */
 if(k==='sign'){save();resign(id);return}
 if(k==='go'){const a=AW();if(!S.conAck||S.conAck.wk!==a)S.conAck={wk:a,ids:[]};if(!S.conAck.ids.includes(id))S.conAck.ids.push(id)}
 save();try{render()}catch(e){}const left=inboxList().length;
 openModal(`<div class="h mhd">✍️ ${esc(w.name)}</div>${picRow(w.id)}<div class="outcome">${esc(k==='go'?`The agent nods. After tonight, ${w.name} is a free agent — anyone can bid, you included.`:`"Next week, then. Don't make us wait longer than that."`)}</div>
 <button class="btn" onclick="closeModal()">${ON_?(left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'):'Back to work'}</button>`)};
/* ---- v356: the network's executive. Your viewership bonus (tvBonus: the network's share of your audience growing past
   what the TV deal was signed for) builds up every week, and the week after each PPV the network's executive comes to the
   door with the check. Nothing to decide — it's the payoff for growing the brand — so it's one visit, then back to work.
   What they say follows how much your audience has grown this season and how your last few shows have rated. */
const NET_WHO='The network exec';
function netDue(){const v=S.view&&S.view.p;return !!(v&&v.due&&v.amt>0)}
function netLine(v){const g=S.fans0&&S.fans0.p?S.fans.p/S.fans0.p:1,bz=typeof buzzOf==='function'?buzzOf('p'):3.5,seed=v.amt+'|'+S.week;
 const up=Math.round((g-1)*100);
 if(bz>=4)return pickL([`Have you seen the overnights? Because the whole building upstairs has. Here's your piece of it — keep doing whatever this is.`,
  `I've worked in this business a long time and I don't get to say this much: people are talking about your show. Here's the network's thanks.`,
  `My boss called me at home to ask what's going on with your show. That's never good news for me, but it's great news for you. Here.`],seed);
 if(up>=40)return pickL([`Your audience is up ${up}% since the season started. The deal says we pay for viewers, so here we are.`,
  `Every week there are more people watching than we signed up for. That's a nice problem to have — here's the check.`,
  `Advertisers keep asking about your show. That money has to go somewhere, so it's going to you.`],seed);
 return pickL([`Numbers are trending the right way. Not a fortune, but the network pays for every new viewer.`,
  `It's a start. More people watched than the deal was built on, so the network owes you a little.`,
  `Small check this time. Grow the audience and I'll bring a bigger one.`],seed)}
function openNet(){const v=S.view&&S.view.p;if(!v||!v.amt)return closeModal();
 openModal(`<div class="h mhd mt">📺 The network, with a check</div><div class="scene brief ibx">${voiceH(NET_WHO,netLine(v))}<div class="brow"><span class="muted tiny">Your audience has outgrown your TV deal — ${esc(money(v.amt))} for the last ${v.wks} week${v.wks===1?'':'s'}.</span></div></div>
 <button class="choice" onclick="netTake()"><span class="key"><span>A</span></span><div>🤝 "Pleasure doing business" · +${esc(money(v.amt))}</div></button>`)}
window.netTake=function(){if(typeof mpLocked==='function'&&mpLocked())return;const v=S.view&&S.view.p;if(!v||!v.amt)return closeModal();const amt=v.amt;
 S.money.p+=amt;S.view.p={amt:0,wks:0};news(`📺 The network paid ${S.gm||'you'} a ${money(amt)} viewership bonus.`);save();try{render()}catch(e){}const left=inboxList().length;
 openModal(`<div class="h mhd">📺 +${esc(money(amt))}</div><div class="outcome ok">${esc(pickL(['The exec shakes your hand on the way out. "Same time after the next PPV, I hope."','"Don\'t spend it all on pyro." They\'re already on the phone before the door closes.','"Keep them watching." The door clicks shut.'],amt))}</div>
 <button class="btn" onclick="closeModal()">${ON_?(left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'):'Back to work'}</button>`)};
/* ---- v361: a top star at the door about a friend (friends.js). Backstage friend groups are secret; this is one of the
   ways you find out. Angry about a broken promise: smooth it over with a bonus for the friend (most of the hit undone) or
   call it business (it lingers). Thankful for a kept promise or a title win: take them both to dinner, or just say thanks. */
function fgLine(f){const {v,F,A}=f,a=firstName(A),seed=F.id+A.id;
 if(v.d<0)return pickL([`${a} and I go back a long way. You gave your word and you didn't keep it. Don't think the rest of us didn't notice.`,
  `I'm not here about me. I'm here about ${a}. The way they got treated this week isn't right, and I want to know what you're going to do about it.`,
  `${a} is my friend. When you do that to them, you're doing it to me too.`],seed);
 return pickL([`I just wanted to say thanks for looking after ${a}. That means a lot to me. To a lot of us.`,
  `Did you see ${a} last night? I've known them since we were nobodies. Whatever you're doing, keep doing it.`,
  `${a} called me in tears, the good kind. I owe you one.`],seed)}
function openFg(){const f=fgVisit();if(!f)return closeModal();const {v,F,A}=f;const c=fgCost(F,A);
 openModal(`<div class="h mhd mt">${v.d<0?'😠':'🤝'} ${esc(F.name)} is looking ${v.d<0?'upset':'grateful'}</div><div class="scene brief ibx">${voiceH(F.id,fgLine(f))}${v.y?`<div class="fgwhy"><b>${v.d<0?'What happened':'What they saw'}</b>${esc(v.y)}</div>`:''}<div class="brow"><span class="muted tiny">${esc(F.name)} and ${esc(A.name)} are close backstage. What happens to one, the other feels.</span></div></div>
 ${v.d<0?`<button class="choice" onclick="fgPick(0)"><span class="key"><span>A</span></span><div>💵 "Let me make it right" · −${esc(money(c))}</div><div class="muted tiny">A bonus for ${esc(A.name)}. Takes most of the sting out for both.</div></button>
 <button class="choice" onclick="fgPick(1)"><span class="key"><span>B</span></span><div>🤷 "It's business"</div><div class="muted tiny">Free. ${esc(F.name)} won't forget it.</div></button>`
 :`<button class="choice" onclick="fgPick(0)"><span class="key"><span>A</span></span><div>🍽️ "Dinner's on me, bring ${esc(firstName(A))}" · −${esc(money(15))}</div><div class="muted tiny">A little more goodwill for both.</div></button>
 <button class="choice" onclick="fgPick(1)"><span class="key"><span>B</span></span><div>🙂 "Glad to hear it"</div><div class="muted tiny">Free.</div></button>`}`)}
window.fgPick=function(i){if(typeof mpLocked==='function'&&mpLocked())return;const f0=fgVisit();const pics=f0?picRow(f0.F.id,f0.A.id):'';const t=fgAnswer(i);if(!t)return closeModal();try{render()}catch(e){}const left=inboxList().length;
 openModal(`<div class="h mhd">🤝 Backstage</div>${pics}<div class="outcome ok">${esc(t)}</div>
 <button class="btn" onclick="closeModal()">${ON_?(left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'):'Back to work'}</button>`)};
/* ---- v364: a friendship ends, and they come tell you. If you knew they were friends, you offer condolences; if you
   didn't, well: "Wait, you were friends?" */
function openFgd(){const f=fgDrift();if(!f)return closeModal();const {v,A,Y}=f,y=firstName(Y),seed=A.id+Y.id;
 const line=v.hot?pickL([`Me and ${y}? Done. After what happened, I'm not pretending anymore.`,`I'm not riding with ${y} anymore. You probably heard why.`,`${y} and I had it out. We're not friends now. Just so you know.`],seed)
  :pickL([`Me and ${y} don't really hang out anymore. Nothing happened. We just… drifted.`,`Weird thing to say to your boss, but ${y} and I aren't friends anymore. Felt like you should know.`,`${y} and I used to be tight. Not anymore. I'm finding my own people.`],seed);
 openModal(`<div class="h mhd mt">💔 ${esc(A.name)} is looking ${v.hot?'heated':'wistful'}</div><div class="scene brief ibx">${voiceH(A.id,line)}</div>
 <button class="choice" onclick="fgdPick()"><span class="key"><span>A</span></span><div>${v.known?`😔 "I'm sorry to hear that. I know you two were close."`:`🤨 "Wait, you were friends?"`}</div></button>`)}
window.fgdPick=function(){if(typeof mpLocked==='function'&&mpLocked())return;const f0=fgDrift();const pics=f0?picRow(f0.A.id,f0.Y.id):'';const t=fgDriftAnswer();if(!t)return closeModal();try{render()}catch(e){}const left=inboxList().length;
 openModal(`<div class="h mhd">💔 Backstage</div>${pics}<div class="outcome ok">${esc(t)}</div>
 <button class="btn" onclick="closeModal()">${ON_?(left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'):'Back to work'}</button>`)};
/* ---- v322: requests. The briefing has wrestlers asking for things in their own words — a title shot they're owed, a
   contract clause, a win they were promised for doing the job, a feud that needs its ending — but they only ever said it
   in the rundown. Now they come to the door and ask you directly: say yes (a little morale now; it goes to the top of
   Needs your attention, and they expect it on tonight's card — keep your word for a bit more, break it and it stings)
   or not this week (a little disappointment; they ask again in a few weeks, or right away if a deadline arrives).
   Built from the same attention list, so a request is exactly what the checklist and briefing already show. Asked at
   the start of the week only (nobody walks in mid-booking), at most ASK_MAX a week. */
const ASK_MAX=2,ASK_AGAIN=3;/* v341: two a week (was 3) */
const ASK_K=[
 {re:/^dealshot/,i:'🏆',n:'Holding you to their title shot',y:'It\'s on tonight\'s card'}];
/* v342: only the contract title shot still comes to the door — it's a real choice (tonight, or promise it at the next
   PPV). An earned title shot, a favor owed for doing the job, main-event and PPV clauses and a feud going stale were
   yes/no visits about things that are already owed and already tracked: they're on the Book screen's checklist (and the
   card's tags), with the contract or promise doing the enforcing, and the stale feud is in This week. */
function askKind(id){return ASK_K.find(k=>k.re.test(id))||null}
const askDue=x=>x.g==='must'&&x.s&&x.s[0]==='b';
function askList(){if(typeof window.attnItems!=='function')return [];const wk=AW();S.asks=S.asks||{};
 const answered=Object.values(S.asks).filter(r=>r.w===wk).length;
 let l=[];try{l=window.attnItems()}catch(e){return []}
 l=l.filter(x=>{if(!askKind(x.id)||(x.s&&x.s[0]==='ok'))return false;const w=S.w[(x.who||[])[0]];if(!w||w.own!=='p'||w.inj)return false;
  const sy=(x.say||[]).find(s=>s&&s[1]&&S.w[s[0]]);if(!sy)return false;
  /* v342: a title shot you already promised for an upcoming PPV is on the calendar — they don't come back asking for it */
  if(/^dealshot/.test(x.id)&&(S.promises||[]).some(pr=>pr.kind==='shot'&&pr.a===w.id&&pr.week>=S.week))return false;
  const r=S.asks[x.id];if(r&&(r.w===wk||(wk-r.w<ASK_AGAIN&&!(askDue(x)&&!r.due))))return false;return true});
 /* v323: one visit per wrestler — a contract title shot also sits in the title picture, so they'd knock twice */
 {const seen=new Set();l=l.sort((a,b)=>ASK_K.indexOf(askKind(a.id))-ASK_K.indexOf(askKind(b.id))).filter(x=>{const k=(x.who||[])[0];if(seen.has(k))return false;seen.add(k);return true})}
 /* who's waiting is fixed when the week starts — undoing a booking later doesn't send someone to the door */
 if(!S.askWk||S.askWk.w!==wk){S.askWk={w:wk,ids:l.map(x=>x.id)};Object.keys(S.asks).forEach(k=>{if(wk-S.asks[k].w>8)delete S.asks[k]})}
 const ids=new Set(S.askWk.ids);
 l=l.filter(x=>ids.has(x.id)).sort((a,b)=>(askDue(b)-askDue(a))||(ASK_K.indexOf(askKind(a.id))-ASK_K.indexOf(askKind(b.id))));
 return l.slice(0,Math.max(0,ASK_MAX-answered)).map(x=>{const sy=x.say.find(s=>s&&s[1]&&S.w[s[0]]);return {id:x.id,who:sy[0],line:sy[1],h:x.h,d:x.d,due:askDue(x),it:x}})}
window.askList=askList;
/* v323: a contract title shot can be promised for the next PPV instead of tonight — the match goes on that PPV's card
   (it follows the belt if it changes hands), the clause's deadline moves to meet it, and the ask is settled. Not offered
   on a PPV night (tonight already is the big stage) or when there's no champion of yours to face. */
function askPPV(a){if(!/^dealshot/.test(a.id))return null;const w=S.w[a.who];if(!w||!w.deal||!w.deal.shot||PPVS[S.week]||typeof tpDealTitle!=='function'||typeof nextPPV!=='function')return null;
 const np=nextPPV();if(!np||!np.in)return null;const t=tpDealTitle(w);const h=t&&S.w[t.holders[0]];if(!h)return null;return {wk:S.week+np.in,n:np.n,in:np.in,t,h}}
function openAsk(id){const a=askList().find(x=>x.id===id);if(!a)return closeModal();const K=askKind(id);const w=S.w[a.who];const P=askPPV(a);
 const lead=a.it.who&&a.it.who[1]&&S.w[a.it.who[1]]?S.w[a.it.who[1]]:null;
 const cut=w.mor>=75?1:w.mor<40?5:3;
 const yD=`${w.name} expects it on tonight's card — it goes to the top of your checklist. Keep your word and they're fired up; break it and it stings.`;
 const nD=a.due?`They'll take it badly (−${cut} morale) — and tonight is the deadline, so skipping it still breaks the deal.`:`A little disappointed (−${cut} morale). They'll come back to you in a few weeks.`;
 openModal(`<div class="h mhd mt">${K.i} ${esc(K.n)}</div><div class="duo" style="align-items:center">${face(w)}${lead?face(lead):''}</div>
 <div class="scene brief ibx">${voiceH(a.who,a.line)}<div class="brow"><span class="muted tiny">${esc(a.d)}</span></div></div>
 <div class="muted tiny" style="margin:8px 0">${esc(w.name)} · ${typeof attnMood==='function'?esc(attnMood(w.mor)):'morale '+Math.round(w.mor)} · POP ${Math.round(w.pop)} · ${w.al==='f'?'Face':'Heel'}</div>
 <button class="choice" onclick="askAnswer('${id}',1)"><span class="key"><span>A</span></span><div>✓ "${esc(K.y)}"</div><div class="muted tiny">${esc(yD)}</div></button>
 ${P?`<button class="choice" onclick="askAnswer('${id}',2)"><span class="key"><span>B</span></span><div>🎟️ "You get your shot at ${esc(P.n)}"</div><div class="muted tiny">${esc(`${w.name} vs ${P.h.name} for the ${P.t.n} title goes on your ${P.n} card (${P.in===1?'next week':P.in+' weeks away'}) and counts for the contract${a.due?' — they\'ll wait for it':''}. Leave it off that night and it's a broken contract.`)}</div></button>`:''}
 <button class="choice" onclick="askAnswer('${id}',0)"><span class="key"><span>${P?'C':'B'}</span></span><div>✋ ${a.due?'"Not tonight"':'"Not this week"'}</div><div class="muted tiny">${esc(nD)}</div></button>`)}
window.askAnswer=function(id,yes){if(typeof mpLocked==='function'&&mpLocked())return;const a=askList().find(x=>x.id===id);if(!a)return closeModal();const w=S.w[a.who];
 const P=yes===2?askPPV(a):null;if(yes===2&&!P)return closeModal();
 S.asks=S.asks||{};S.asks[id]={w:AW(),a:P?'p':yes?'y':'n',due:a.due?1:0};let txt;
 if(P){mor(w,3);addPromise({kind:'shot',a:w.id,b:P.h.id,week:P.wk,ppv:P.n,title:P.t.id,why:'Contract clause'});w.deal.shot.by=Math.max(w.deal.shot.by,awBase()+P.wk);
  txt=`🎟️ ${w.name} shakes on it: ${w.name} vs ${P.h.name} for the ${P.t.n} title at ${P.n}. It's on the calendar and in the title picture — build the feud before then.`}
 else if(yes){mor(w,3);txt=`✓ ${w.name} walks out fired up. It's at the top of your checklist now — get it on tonight's card.`}
 else{const cut=w.mor>=75?1:w.mor<40?5:3;mor(w,-cut);txt=a.due?`✋ ${w.name} storms out (−${cut} morale). Tonight was the deadline — skipping it still counts against the deal.`:`✋ ${w.name} nods and heads out — not thrilled (−${cut} morale). They'll ask again in a few weeks.`}
 save();try{render()}catch(e){}
 const left=inboxList().length;
 openModal(`<div class="h mhd">${askKind(id).i} ${esc(a.h)}</div>${picRow(w.id)}<div class="outcome ${yes?'ok':''}">${esc(txt)}</div>
 <button class="btn" onclick="closeModal()">${ON_?(left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'):'Back to work'}</button>`)};
/* when the show goes live: did you keep your word? The card is read just before it airs (askSnap), and settled once
   the show has actually started (a go-live that stops at a checklist or a gate settles nothing) */
function askSnap(){const wk=AW();const ys=Object.keys(S.asks||{}).filter(k=>{const r=S.asks[k];return r.w===wk&&r.a==='y'&&!r.done});if(!ys.length)return null;
 let l=[];try{l=window.attnItems()}catch(e){return null}
 return ys.map(k=>{const x=l.find(y=>y.id===k);return x?{k,w:(x.who||[])[0],ok:!!(x.s&&x.s[0]==='ok')}:{k,gone:1}})}
function askSettle(snap){const wk=AW();snap.forEach(o=>{const r=S.asks[o.k];if(!r||r.done)return;r.done=1;const w=S.w[o.w];if(o.gone||!w||w.own!=='p')return;
 const m0=w.mor;let t;if(o.ok){mor(w,4);t=`🗣️ You told ${w.name} yes, and you kept your word (+4 morale).`}else{mor(w,-8);t=`🗣️ You told ${w.name} yes, then left it off the card. They noticed (−8 morale).`}
 try{if(typeof fgSpread==='function')fgSpread(w,w.mor-m0,'promise',o.ok?null:`You told ${w.name} yes, then left them off the card.`)}catch(e){console.warn(e)}
 S.pitchNews=(S.pitchNews||[]).concat([{w:wk,t}]).slice(-12);news(t)})}

/* ---- showing it ---- */
function stamp(pos,left){const m=document.querySelector('#modal .sbody');if(!m)return;
 /* a pitch can't be put off from the inbox, and the count sits on top of every decision screen */
 m.querySelectorAll('button.btn.ghost').forEach(b=>{if(/Decide later/.test(b.textContent))b.remove()});
 if(!m.querySelector('.ibx-k'))m.insertAdjacentHTML('afterbegin',head(pos,left))}
function openInbox(){const l=inboxList();if(!l.length){ON_=false;N0=0;CUR=null;try{render()}catch(e){}return false}
 if(!ON_){ON_=true;N0=l.length}const pos=Math.max(1,N0-l.length+1);const x=l[0];
 try{CUR=describe(x)}catch(e){CUR=null}
 try{if(x.open){x.open();stamp(pos,l.length)}else{openModal(deskPage(x,pos,l.length));deskWatch(x)}}catch(e){console.warn('inbox',e);ON_=false;return false}
 try{if(CUR&&!CUR.q){const sc=document.querySelector('#modal .scene q, #modal .scene');if(sc)CUR.q=sc.textContent.trim().slice(0,240)}}catch(e){}
 return true}
/* v341: a desk row's buttons are the briefing's own (callUp, tapeAct, followAct…) — they do the job and re-draw Home, but
   nothing moved the office on, so the page sat there looking dead. Once a tap settles the row (it's gone from the line)
   and the button didn't open a screen of its own, the line carries on to the next one. A refused tap (no money, a
   full roster) leaves the row waiting, so the page stays put. */
function deskWatch(x){const m=document.querySelector('#modal .sbody');if(!m)return;const mark=document.createElement('i');mark.className='ibx-mark';mark.hidden=true;m.appendChild(mark);
 m.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||!m.contains(b)||b.classList.contains('btn'))return;
  setTimeout(()=>{if(!ON_||!mark.isConnected)return;const mm=document.getElementById('modal');if(!mm||mm.classList.contains('hidden'))return;
   let still=false;try{still=inboxList().some(y=>y.row===x.row)}catch(err){}if(!still)closeModal()},60)})}
/* v258: what's on screen right now, for the party-night TV's locker-room feed (feed.js) — who's in the office, what kind of
   visit it is, a headline and their line. Tampering, the trainer, trade offers and tapes are strategy: the TV only
   teases those (the room never sees who called, the money, the weeks out or the trade). */
let CUR=null;
const TEASE={tamp:1,med:1,trade:1,tape:1};
function describe(x){const nm=id=>S.w[id]?S.w[id].name:'';
 if(x.k==='agent'){const w=x.w;return {k:'agent',kick:'✍️ An agent at the door',head:`${w.name}'s contract is ${w.con<=1?'up after tonight':'almost up'}`,w:w.id}}
 if(x.k==='ask'){const K=askKind(x.a.id)||{};return {k:'ask',kick:`${K.i||'🗣️'} ${K.n||'A request'}`,head:x.a.h,w:x.a.who,q:x.a.line}}
 if(x.k==='pitch'){const p=S.pitch,P=PITCHES[p.k],c=pCtx(p);return {k:'pitch',kick:P.cat,head:P.head(c),w:p.a,w2:p.b||null}}
 if(x.k==='ahold'||x.k==='aback')return {k:x.k,kick:'📖 A story',head:x.k==='ahold'?'A storyline is in question':'A storyline is ready to return',w:null,tease:1};
 if(x.k==='net')return {k:'net',kick:'📺 The network, at your door',head:'A check for the viewership',w:null,tease:1};
 if(x.k==='crisis'){const c=S.crisis,C=CRISES[c.k];return {k:'crisis',kick:`${C.i} ${C.good?'Opportunity':'Front office'}`,head:C.t,w:c.a,pic2:c.b||null,narr:1}}
 /* v499: friends and new traits get their cards too (these three used to fall through and fail, leaving no picture).
    pic2 is the second card on this screen only: the party TV never learns who's friends with whom. */
 if(x.k==='fg'){const f=fgVisit();return {k:'fg',kick:'🤝 About a friend',head:`${f.F.name} is looking ${f.v.d<0?'upset':'grateful'}`,w:f.F.id,pic2:f.A.id,tease:1}}
 if(x.k==='fgd'){const f=fgDrift();return {k:'fgd',kick:'💔 A friendship ends',head:`${f.A.name} is looking ${f.v.hot?'heated':'wistful'}`,w:f.A.id,pic2:f.Y.id,tease:1}}
 if(x.k==='tr'){const w=trVisit();return {k:'tr',kick:'✨ A new trait',head:`${w.name} is looking ambitious`,w:w.id,q:trLine(w)}}
 const [ic,kn]=KIND[x.k]||[x.s.i,x.s.t];const v=voiceFor(x.k,x.row);const who=v&&S.w[v[0]]?v[0]:null;
 const ids=[...new Set((x.row.match(/'[^'\s<>]{1,80}'/g)||[]).flatMap(t=>t.slice(1,-1).split(/[|,]/)).filter(id=>S.w[id]))];
 if(TEASE[x.k]){const id=who||ids[0]||null;const n=id?nm(id):'';
  const head=x.k==='tamp'?`${n||'Someone'} got a phone call`:x.k==='med'?`The trainer has news on ${n||'someone'}`:x.k==='trade'?'A trade offer just landed':'A tape landed on the desk';
  return {k:x.k,kick:`${ic} ${kn}`,head,w:x.k==='trade'||x.k==='tape'?null:id,tease:1}}
 const id=who||ids[0]||null;return {k:x.k,kick:`${ic} ${kn}`,head:x.k==='cd'?`${nm(id)} is at the door`:x.k==='oc'?`${nm(id)} wants a contract`:kn,w:id,q:v?v[1]:''}}
window.inboxCur=()=>ON_?CUR:null;
/* v499: big pictures on the screen that follows a decision */
const picRow=(...ids)=>`<div class="duo ibx-pics">${ids.map(id=>S.w[id]?face(S.w[id]):'').join('')}</div>`;
window.picRow=picRow;
(function(){const c=document.createElement('style');c.textContent=`.duo.ibx-pics{justify-content:center;gap:10px}html .duo.ibx-pics .fav,html.lk-hy .duo.ibx-pics .fav,html.tcards.lk-hy .duo.ibx-pics .fav{width:96px;height:132px;flex:none;overflow:hidden}.duo.ibx-pics .fav img,.duo.ibx-pics .fav svg{width:100%;height:100%;object-fit:cover;object-position:50% 18%}`;document.head.appendChild(c)})();
window.openInbox=openInbox;
/* once the last one is answered, the briefing */
/* v237: Home re-draws as the line clears, so its strip never shows people who've already been answered */
function finish(){ON_=false;N0=0;CUR=null;try{render()}catch(e){}/* v324: the briefing is a panel on Home now — nothing else opens */}
/* ---- hooks ---- */
const _ob=window.openBrief;
/* v237: the results screen used to open a situation straight away, so the line never formed. Anything that opens a
   pitch or a situation on its own now starts the line instead (the line opens them through the originals). */
const _oc=window.openCrisis,_op=window.openPitch;
if(typeof _oc==='function')window.openCrisis=openCrisis=function(){if(!ON_&&allowed()&&inboxList().length){openInbox();return}return _oc.apply(this,arguments)};
if(typeof _op==='function')window.openPitch=openPitch=function(){if(!ON_&&allowed()&&inboxList().length){openInbox();return}return _op.apply(this,arguments)};
/* and the line forms by itself whenever Home or Book is on screen with nothing else open — not only the first time
   the briefing would have popped up (the tour and its offers go first) */
let AUTO_T=0;
function autoLine(){if(ON_||AUTO_T||!allowed())return;if(typeof tab==='undefined'||(tab!=='home'&&tab!=='book'))return;
 if(typeof TUT!=='undefined'&&TUT||typeof TUT_OFFER!=='undefined'&&TUT_OFFER)return;if(typeof ME!=='undefined'&&ME||typeof PS!=='undefined'&&PS||typeof LQ!=='undefined'&&LQ)return;
 AUTO_T=setTimeout(()=>{AUTO_T=0;const m=document.getElementById('modal');if(ON_||!m||!m.classList.contains('hidden')||!allowed())return;if(typeof TUT!=='undefined'&&TUT||typeof TUT_OFFER!=='undefined'&&TUT_OFFER)return;if(inboxList().length)openInbox()},450)}
hookStep('render','office line: auto-open',{after(){try{autoLine()}catch(e){}}});
if(typeof _ob==='function')window.openBrief=openBrief=function(){if(allowed()&&inboxList().length){openInbox();return}if(ON_){ON_=false;N0=0}return _ob.apply(this,arguments)};
hookStep('closeModal','inbox.js',{around(_cm,...args){const r=_cm.apply(this,args);
 if(ON_){setTimeout(()=>{const m=document.getElementById('modal');if(!ON_||!m||!m.classList.contains('hidden'))return;if(!allowed()){ON_=false;return}if(inboxList().length)openInbox();else finish()},40)}
 return r}});
/* the briefing keeps everything that isn't a decision */
if(typeof briefItems==='function'){B0=window.briefItems||briefItems;window.briefItems=briefItems=function(){const sec=B0.apply(this,arguments);if(!allowed())return sec;
 return sec.map(s=>{if(!deskKind(s))return s;const rows=(s.rows||[]).filter(r=>!isAsk(r));return rows.length?Object.assign({},s,{rows,u:0}):null}).filter(Boolean)}}
/* the decision screens' "done" buttons carry on to the next notification */
function nextBtn(){const m=document.querySelector('#modal .sbody');if(!m||!ON_)return;const left=inboxList().length;
 m.querySelectorAll('button.btn').forEach(b=>b.remove());m.insertAdjacentHTML('beforeend',`<button class="btn" onclick="closeModal()">${left?`Call in the next one (${left} waiting) ▸`:'Line\'s clear — back to work ▸'}</button>`)}
['pitchChoose','crisisChoose'].forEach(fn=>{const f=window[fn];if(typeof f!=='function')return;window[fn]=function(){const r=f.apply(this,arguments);try{if(ON_)nextBtn()}catch(e){}return r}});
/* nothing goes live with a notification unanswered, and the Book screen brings them up first */
let ASK_PEND=null;
if(typeof goLive==='function'){hookStep('goLive','inbox.js',{around(g0,...args){if(allowed()&&inboxList().length){openInbox();return}
 /* v322: the card is read as you go live and settled once the show has really aired (finishLive) — a go-live that
    stops at a checklist or a gate settles nothing */
 ASK_PEND=null;try{if(!(typeof LIVE!=='undefined'&&LIVE)&&allowed())ASK_PEND=askSnap()}catch(e){}
 return g0.apply(this,args)}})}
if(typeof finishLive==='function'){hookStep('finishLive','inbox.js',{before(ctx){try{if(ASK_PEND&&typeof LIVE!=='undefined'&&LIVE)askSettle(ASK_PEND)}catch(e){console.warn('asks',e)}ASK_PEND=null;}})}
if(typeof go==='function'){hookStep('go','inbox.js',{after(ctx,r,t){if(t==='book'&&allowed()){setTimeout(()=>{const m=document.getElementById('modal');if(m&&m.classList.contains('hidden')&&inboxList().length)openInbox()},120)}return r}})}
/* a strip on Home in case anything is still waiting */
window.inboxStrip=function(){let n=0;try{n=inboxList().length}catch(e){}if(!n)return '';
 return `<button class="card bstrip hot" onclick="openInbox()"><span class="bsn">${n}</span><span class="bst"><b>🚪 There's a line outside your office</b><span>${n===1?'One person is':n+' people are'} waiting for an answer before the week starts</span></span><span class="bsc">›</span></button>`};
(function(){const c=document.createElement('style');c.textContent=`#modal .fgwhy{margin:10px 0 4px;padding:8px 10px;background:#0f0f12;border-left:3px solid var(--red);font-size:14px;line-height:1.35}#modal .fgwhy b{display:block;font:700 10px 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:3px}
#modal .ibx-k{font-size:12px;color:var(--mut);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
#modal .ibx-q{display:flex;align-items:center;gap:6px;margin:6px 0 10px;flex-wrap:wrap}#modal .ibx-a{width:34px;height:34px;overflow:hidden;opacity:.5;flex:none;display:inline-flex;align-items:center;justify-content:center;background:var(--line);font-weight:800;font-size:13px;clip-path:polygon(8% 0,100% 0,92% 100%,0 100%)}#modal .ibx-a.on{opacity:1;width:42px;height:42px;outline:2px solid var(--gold)}#modal .ibx-a img,#modal .ibx-a .face{width:100%;height:100%;object-fit:cover}#modal .ibx-d{font-size:11px;color:var(--mut);margin-left:4px;order:-1;display:none}
#modal .ibx .brow{border-top:1px solid var(--line);padding-top:10px;margin-top:10px}#modal .ibx .scs+.brow{margin-top:12px}`;document.head.appendChild(c)})();
})();
