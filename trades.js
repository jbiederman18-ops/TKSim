/* Tony Khan Simulator — trades (v158).
   Propose a trade from the Office (or the 🔁 Trade button on another brand's wrestler): up to two of yours for up to two
   of theirs, with cash either way. Champions can't be traded, and nobody can go over 30 wrestlers.
   SOLO: the rival answers on the spot — accept, counter (they want more cash), or decline — judging each wrestler's
   worth (overall, upside, contract length). On Hard they drive a harder bargain. Every few weeks the rival may also
   send you an offer of its own; it waits in the briefing for a week.
   LEAGUES: offers go to another GM and wait in their briefing until they accept or decline (or you withdraw). Trades are
   shared league data; seats are stored in their league form so they survive every view.
   Traded wrestlers keep their contracts; happy ones take it a little hard, unhappy ones welcome the fresh start.
   Loaded after the main script; hooks in by wrapping globals. */
'use strict';
(function(){
const MAXN=2,CASH_MAX=1000,STEP=25;
const me=()=>canonKey('p');
const loc=seat=>localKey(seat);
const seatName=seat=>nameOf(loc(seat));
const tradable=w=>!!(w&&w.own&&!isChamp(w.id));
function worth(w){const v=val(w);const c=.6+.4*Math.min(1,(w.con||0)/26);return Math.round(Math.max(20,Math.pow(Math.max(0,v-40),2)*1.1)*c)}
window.tradeWorth=worth;
const sum=ids=>ids.reduce((a,id)=>a+(S.w[id]?worth(S.w[id]):0),0);
const margin=()=>({easy:0,normal:.06,hard:.14}[S.diff]||.06);

/* ---------------- the builder ---------------- */
window.TB=null;
window.openTrade=function(theirId){if(typeof mpLocked==='function'&&mpLocked())return;if(S.phase!=='season')return toast('Trades open once the season is under way.');
 const others=brands().filter(b=>b!=='p'&&ownList(b).length);if(!others.length)return toast('Nobody to trade with right now.');
 let to=others[0];if(theirId&&S.w[theirId]&&S.w[theirId].own&&S.w[theirId].own!=='p')to=S.w[theirId].own;
 TB={to:canonKey(to),give:[],get:theirId&&S.w[theirId]&&tradable(S.w[theirId])?[theirId]:[],cash:0};renderTrade()};
function chip(w,on,fn){return `<button class="chip ${on?'on':''}" style="margin:3px" onclick="${fn}">${esc(w.name)} <span class="muted tiny">${Math.round(ovr(w))}</span></button>`}
window.tbTo=s=>{TB.to=s;TB.get=[];renderTrade()};
window.tbTog=(k,id)=>{const l=TB[k];const i=l.indexOf(id);if(i>=0)l.splice(i,1);else if(l.length<MAXN)l.push(id);else return toast(`Up to ${MAXN} each way.`);renderTrade()};
window.tbCash=d=>{TB.cash=clamp(TB.cash+d,-CASH_MAX,CASH_MAX);renderTrade()};
function verdict(){if(ON())return '';const give=sum(TB.give)+Math.max(0,TB.cash),get=sum(TB.get)+Math.max(0,-TB.cash);if(!TB.get.length&&!TB.give.length)return '';
 const need=get*(1+margin());const d=give-need;return d>=0?'<span class="tg good">Looks like something they\'d take</span>':d>-get*.3?'<span class="tg warnt">They\'d probably want a bit more</span>':'<span class="tg bad">They\'ll laugh you out of the room</span>'}
function renderTrade(){const to=loc(TB.to);const mine=ownList('p').filter(tradable).sort((a,b)=>ovr(b)-ovr(a));const theirs=ownList(to).filter(tradable).sort((a,b)=>ovr(b)-ovr(a));
 const partners=brands().filter(b=>b!=='p'&&ownList(b).length);
 openModal(`<div class="h mhd">🔁 Propose a trade</div>${partners.length>1?`<div class="chips">${partners.map(b=>`<button class="chip ${b===to?'on':''}" onclick="tbTo('${canonKey(b)}')">${esc(nameOf(b))}</button>`).join('')}</div>`:`<p class="muted" style="margin-top:0">With ${esc(nameOf(to))}. Champions can't be traded.</p>`}
 <div class="card"><div class="h small">You send ${TB.give.length?'· '+TB.give.map(id=>esc(S.w[id].name)).join(' & '):''}</div><div style="max-height:150px;overflow:auto">${mine.map(w=>chip(w,TB.give.includes(w.id),`tbTog('give','${w.id}')`)).join('')}</div></div>
 <div class="card"><div class="h small">You get ${TB.get.length?'· '+TB.get.map(id=>esc(S.w[id].name)).join(' & '):''}</div><div style="max-height:150px;overflow:auto">${theirs.map(w=>chip(w,TB.get.includes(w.id),`tbTog('get','${w.id}')`)).join('')||'<span class="muted">Nobody available.</span>'}</div></div>
 <div class="card"><div class="row sb"><b>Cash</b><span>${TB.cash>0?`You pay <b>${money(TB.cash)}</b>`:TB.cash<0?`They pay <b>${money(-TB.cash)}</b>`:'None'}</span></div><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="mini" onclick="tbCash(-100)">−$100K</button><button class="mini" onclick="tbCash(-${STEP})">−$25K</button><button class="mini" onclick="tbCash(${STEP})">+$25K</button><button class="mini" onclick="tbCash(100)">+$100K</button></div><div class="muted tiny" style="margin-top:4px">+ means you pay them.</div></div>
 <div class="center">${verdict()}</div>
 <button class="btn mt" ${TB.give.length||TB.get.length?'':'disabled'} onclick="tradeSend()">${ON()?'Send the offer':'Make the offer'}</button><button class="btn ghost" onclick="closeModal()">Cancel</button>`)}

/* ---------------- checks & execution ---------------- */
function valid(t){const A=loc(t.from),B=loc(t.to);
 for(const id of t.give){const w=S.w[id];if(!w||w.own!==A)return `${w?w.name:'Someone'} isn't on ${nameOf(A)}'s roster any more.`;if(isChamp(id))return `${w.name} is a champion now.`}
 for(const id of t.get){const w=S.w[id];if(!w||w.own!==B)return `${w?w.name:'Someone'} isn't on ${nameOf(B)}'s roster any more.`;if(isChamp(id))return `${w.name} is a champion now.`}
 if(ownList(A).length-t.give.length+t.get.length>30)return `${nameOf(A)} would have more than 30 wrestlers.`;
 if(ownList(B).length-t.get.length+t.give.length>30)return `${nameOf(B)} would have more than 30 wrestlers.`;
 if(t.cash>0&&S.money[A]<t.cash)return `${nameOf(A)} can't cover ${money(t.cash)}.`;if(t.cash<0&&S.money[B]<-t.cash)return `${nameOf(B)} can't cover ${money(-t.cash)}.`;return ''}
function move(id,to){const w=S.w[id];const from=w.own;w.own=to;w.deb=AW();w.mor=clamp(w.mor+(w.mor<45?10:-5),0,100);if(typeof mlog==='function')mlog(w,w.mor<45?10:-5,'Traded',false);
 S.training=(S.training||[]).filter(x=>x.id!==id);S.teams.forEach(t=>{if(t.m.includes(id)&&t.m.some(x=>x!==id&&S.w[x]&&S.w[x].own===from))t.m=t.m.filter(x=>x!==id)});S.teams=S.teams.filter(t=>t.m.length>=2);
 if(S.card)['p','ai'].forEach(b=>(S.card[b]||[]).forEach(sl=>{const d=sl&&sl.d;if(d&&((d.sides&&d.sides.flat().includes(id))||d.a===id||d.b===id||d.c===id))sl.d=null}));
 if(S.tamp)delete S.tamp[id]}
function execute(t){const A=loc(t.from),B=loc(t.to);t.give.forEach(id=>move(id,B));t.get.forEach(id=>move(id,A));if(t.cash){S.money[A]-=t.cash;S.money[B]+=t.cash}
 const n=`🔁 TRADE: ${nameOf(A)} sends ${t.give.map(id=>S.w[id].name).join(' & ')||'cash'} to ${nameOf(B)} for ${t.get.map(id=>S.w[id].name).join(' & ')||'cash'}${t.cash?` (${money(Math.abs(t.cash))} to ${nameOf(t.cash>0?B:A)})`:''}.`;news(n);return n}
window.tradeSend=function(){if(typeof mpLocked==='function'&&mpLocked())return;const t={id:'tr'+partyNid(),from:me(),to:TB.to,give:TB.give.slice(),get:TB.get.slice(),cash:TB.cash,at:AW()};
 const bad=valid(t);if(bad)return toast(bad);
 if(ON()){S.trades=(S.trades||[]).filter(x=>!(x.from===t.from&&x.to===t.to));S.trades.push(t);news(`🔁 ${S.gm} sent ${nameOf(loc(t.to))} a trade offer.`);save();closeModal();render();toast('Offer sent — it waits in their briefing.');return}
 const give=sum(t.give)+Math.max(0,t.cash),get=sum(t.get)+Math.max(0,-t.cash);const need=Math.round(get*(1+margin()));const aiN=ownList('ai').length-t.get.length+t.give.length;
 let out;
 if(aiN<18&&t.give.length<t.get.length)out={k:'no',t:`"We can't spare the bodies right now." ${S.rival} turns it down.`};
 else if(give>=need)out={k:'yes',t:execute(t)};
 else if(give>=get*.7){const ask=Math.ceil((need-give)/STEP)*STEP;out={k:'counter',ask,t:`"Close. Make it ${money(Math.max(0,t.cash)+ask)} on top and you've got a deal."`}}
 else out={k:'no',t:`"No chance." ${S.rival} isn't interested.`};
 TB.last=out;save();render();
 openModal(`<div class="h mhd">${out.k==='yes'?'🤝 Deal!':out.k==='counter'?'📞 Counter-offer':'🚫 Turned down'}</div><p>${esc(out.t)}</p>${out.k==='counter'?`<button class="btn" ${S.money.p<Math.max(0,t.cash)+out.ask?'disabled':''} onclick="TB.cash=Math.max(0,TB.cash)+${out.ask};tradeSend()">Accept their counter</button><button class="btn sec" onclick="renderTrade_()">Back to the table</button>`:''}<button class="btn ghost" onclick="closeModal()">${out.k==='yes'?'Done':'Walk away'}</button>`)};
window.renderTrade_=()=>renderTrade();

/* ---------------- incoming offers: league GMs, and the offline rival ---------------- */
function rivalOffer(){if(ON()||S.phase!=='season'||S.week<4||S.week>SEASON-3)return;if((S.trades||[]).some(t=>t.from==='ai'))return;if(Math.random()>.18)return;
 const mine=ownList('p').filter(w=>tradable(w)&&w.pop>=50&&w.pop<=82&&!w.inj);const theirs=ownList('ai').filter(w=>tradable(w)&&!w.inj);if(!mine.length||theirs.length<19)return;
 const T=pick(mine);const tw=worth(T);const opts=theirs.filter(w=>worth(w)<=tw*1.05&&worth(w)>=tw*.45&&w.g===T.g);if(!opts.length)return;const O=pick(opts);
 const gap=Math.round(tw*.97)-worth(O);const cash=Math.max(0,Math.round(gap/STEP)*STEP);/* the rival sweetens it with cash (from pays to) */
 S.trades=(S.trades||[]).concat([{id:'tr'+partyNid(),from:'ai',to:'p',give:[O.id],get:[T.id],cash,at:AW()}]);news(`📞 ${S.rival} called about ${T.name}.`)}
window.tradeAnswer=function(id,yes){if(typeof mpLocked==='function'&&mpLocked())return;const i=(S.trades||[]).findIndex(t=>t.id===id);if(i<0)return;const t=S.trades[i];
 if(yes){const bad=valid(t);if(bad){S.trades.splice(i,1);save();toast(bad+' The offer is off.');return refresh()}const n=execute(t);toast(n.replace(/^🔁 TRADE: /,''))}
 else news(`🔁 ${nameOf(loc(t.to))} turned down ${nameOf(loc(t.from))}'s trade offer.`);
 S.trades.splice(i,1);save();refresh()};
window.tradeWithdraw=function(id){S.trades=(S.trades||[]).filter(t=>t.id!==id);save();refresh()};
function refresh(){if(document.querySelector('#modal .brief'))openBrief();else{closeModal();render()}}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(){const out=e0.apply(this,arguments);try{S.trades=(S.trades||[]).filter(t=>AW()-t.at<=(ON()?3:1));rivalOffer()}catch(e){console.warn('trades',e)}return out}}
function offerRow(t){const giveN=t.give.map(id=>S.w[id]?esc(S.w[id].name):'?').join(' & ')||'cash',getN=t.get.map(id=>S.w[id]?esc(S.w[id].name):'?').join(' & ')||'cash';
 const cash=t.cash?` · ${money(Math.abs(t.cash))} ${t.cash>0?'to you':'from you'}`:'';
 return `<div class="brow"><b>${esc(nameOf(loc(t.from)))}</b> offers <b>${giveN}</b> for your <b>${getN}</b>${cash}<div class="row" style="gap:6px;margin-top:6px"><button class="mini" onclick="tradeAnswer('${t.id}',1)">✅ Accept</button><button class="mini" onclick="tradeAnswer('${t.id}',0)">Decline</button></div></div>`}
if(typeof briefItems==='function'){const b0=briefItems;window.briefItems=briefItems=function(){const sec=b0.apply(this,arguments);try{const l=(S.trades||[]).filter(t=>t.to===me());const out=(S.trades||[]).filter(t=>t.from===me());
 if(l.length)sec.unshift({i:'🔁',t:`Trade offers · ${l.length}`,u:1,rows:l.map(offerRow)});
 if(out.length)sec.push({i:'🔁',t:'Your trade offers',rows:out.map(t=>`<div class="brow">Waiting on <b>${esc(nameOf(loc(t.to)))}</b>: ${t.give.map(id=>S.w[id]?esc(S.w[id].name):'?').join(' & ')||'cash'} for ${t.get.map(id=>S.w[id]?esc(S.w[id].name):'?').join(' & ')||'cash'} <button class="mini" onclick="tradeWithdraw('${t.id}')">Withdraw</button></div>`)})}catch(e){console.warn(e)}return sec}}

/* ---------------- entry points ---------------- */
if(typeof officeView==='function'){const o0=officeView;officeView=function(){const out=o0.apply(this,arguments);const n=(S.trades||[]).filter(t=>t.to===me()).length;
 const b=`<div class="card"><div class="h small">🔁 Trades</div><div class="muted" style="margin-bottom:8px">Swap up to two wrestlers each way, with cash either way. Champions can't be traded.${n?` <b class="gold">${n} offer${n>1?'s':''} waiting in your briefing.</b>`:''}</div><button class="btn" onclick="openTrade()">Propose a trade</button></div>`;
 const i=out.indexOf('<div class="card"><div class="h small">📖 History book');return i<0?out+b:out.slice(0,i)+b+out.slice(i)}}
if(typeof showW==='function'){const s0=showW;showW=function(id){const out=s0.apply(this,arguments);try{const w=S.w[id];if(w&&w.own&&w.own!=='p'&&S.phase==='season'&&!isChamp(id)){const m=document.querySelector('#modal .sheet')||document.querySelector('#modal');const btn=`<button class="btn sec" style="margin-top:10px" onclick="openTrade('${id}')">🔁 Trade for ${esc(w.name)}</button>`;const a=m&&m.querySelector('.wd-top');if(a)a.insertAdjacentHTML('afterend',btn)}}catch(e){}return out}}
})();
