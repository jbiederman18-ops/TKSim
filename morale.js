/* Tony Khan Simulator — morale that reacts (v153).
   Every week, each wrestler on a GM's roster feels how they were used: TV time keeps them happy, sitting at home wears
   on them (stars feel it first), clean losses sting (more for stars, and most when they lose to someone below them),
   and being worn down or underpaid grinds on them. Very high morale settles back toward normal over time.
   Every change is logged with a reason (w.mw) and shown as "Mood" on the wrestler's card.
   When morale sinks, unhappy wrestlers escalate through the front-office situation system:
     under 55 — a pay grievance (they want a raise)
     under 45 — a walkout threat
     under 35 — a shoot promo on live TV, or airing grievances at the media scrum
     under 25 — (or after you call their bluff) they actually walk out
   Grievances are private to each GM in an online league, like every front-office situation. The offline rival's
   locker room keeps the old, simpler morale. Loaded after the main script; hooks in by wrapping globals. */
'use strict';
(function(){
const HUM=b=>b==='p'||(ON()&&!!b);
window.MOR_HUM=HUM;

/* ---------------- reasons ---------------- */
function mlog(w,d,t,apply){if(!w||!d)return;if(apply!==false)w.mor=clamp(w.mor+d,0,100);const wk=AW();const l=w.mw||(w.mw=[]);const e=l.find(x=>x.w===wk&&x.t===t);if(e)e.d=Math.round((e.d+d)*10)/10;else l.push({w:wk,d:Math.round(d*10)/10,t});w.mw=l.filter(x=>wk-x.w<6).slice(-14)}
window.mlog=mlog;
function moodTop(w,n){const wk=AW();const agg={};(w.mw||[]).forEach(x=>{if(wk-x.w<=4)agg[x.t]=(agg[x.t]||0)+x.d});return Object.entries(agg).filter(([t,d])=>Math.abs(d)>=1).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,n||4)}
window.moodTop=moodTop;
const moodWord=m=>m>=80?['😁','Thrilled']:m>=65?['🙂','Happy']:m>=50?['😐','Restless']:m>=35?['😒','Unhappy']:m>=20?['😠','Angry']:['🤬','Ready to walk'];
window.moodWord=moodWord;

/* ---------------- who was on TV this week ---------------- */
function onCard(b){const s=new Set();const card=S.card&&S.card[b];if(!card)return s;
 const add=v=>{if(typeof v==='string'&&S.w[v])s.add(v);else if(Array.isArray(v))v.forEach(add)};
 card.forEach(sl=>{const d=sl&&sl.d;if(!d)return;add(d.sides);add(d.a);add(d.b);add(d.c);add(d.ri&&d.ri.id)});return s}

/* ---------------- the weekly tick (runs at the top of endWeek, before contracts and walkouts are checked) ---------------- */
const IDLE_STAR=2,IDLE_MID=3;
function weekMorale(){const wk=AW();
 brands().forEach(b=>{if(!HUM(b))return;const seen=onCard(b);
  ownList(b).forEach(w=>{if(w.inj)return;
   if(seen.has(w.id)){w.idle=0;mlog(w,1,'On TV')}
   else{w.idle=(w.idle||0)+1;const star=w.pop>=70;if(w.idle>=(star?IDLE_STAR:IDLE_MID)){const d=w.pop>=70?-2:w.pop>=50?-1.5:w.pop>=35?-1:0;if(d)mlog(w,d,'Left off TV')}}
   /* a big star who hasn't closed a show in a while */
   if(w.pop>=78&&w.lme!=null&&wk-w.lme>=6&&seen.has(w.id))mlog(w,-1,'No main events lately');
   if(w.fat>=75)mlog(w,-2,'Worn down');
   if(w.sal!=null&&sal(w)<mkt(w)*.8&&w.pop>=45)mlog(w,-1,'Underpaid');
   /* nobody stays on cloud nine forever */
   if(w.mor>85)w.mor=Math.max(85,w.mor-1.5)})})}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){try{weekMorale()}catch(e){console.warn('morale',e)}return e0.apply(this,arguments)}}

/* ---------------- wins, losses and main events ---------------- */
if(typeof applyMatch==='function'){const a0=applyMatch;applyMatch=function(m,res,ctx){const before={};const ids=(m&&m.sides?m.sides.flat():[]).filter(id=>S.w[id]);ids.forEach(id=>before[id]=S.w[id].mor);
 const out=a0.apply(this,arguments);
 try{if(!m.nc&&m.sides[m.winner]){const win=m.sides[m.winner];const fin=finOf(m);const losers=ids.filter(id=>!win.includes(id));const big=ids.length>=3;const pin=big&&losers.length?pinOf(m):null;const wTop=Math.max(...win.map(id=>S.w[id]?S.w[id].pop:0));
  win.forEach(id=>{const w=S.w[id];if(w&&HUM(w.own))mlog(w,w.mor-before[id],'Wins',false)});
  losers.forEach(id=>{const w=S.w[id];if(!w||!HUM(w.own))return;if(big&&id!==pin)return;
   if(fin==='clean'||fin==='upset'){let d=w.pop>=70?-3:w.pop>=45?-2:-1;mlog(w,d,'Losses');if(w.pop>=wTop+15)mlog(w,-2,'Lost to someone below them')}
   else if(w.pop>=60)mlog(w,-1,'Losses')});
  if(ctx&&ctx.pos==='me')ids.forEach(id=>{const w=S.w[id];if(w&&HUM(w.own))mlog(w,3,'Main event',false)})}}catch(e){console.warn('morale match',e)}
 return out}}

/* ---------------- grievances ---------------- */
const others=A=>ownList('p').filter(w=>w!==A);
function away(w,n){w.inj=Math.max(w.inj||0,n);w.susp=true;w.away=1}
const GRV={
g_pay:{t:'Pay grievance',i:'💵',who:()=>null,
 text:"{A}'s agent is on the phone. {A} is unhappy and feels underpaid — they want a 20% raise, starting this week.",ch:[
 {t:'Give them the raise',d:'+20% salary for the rest of the deal. A big morale boost.',fx:c=>{const inc=Math.max(1,Math.round(sal(c.A)*.2));c.A.sal=sal(c.A)+inc;mlog(c.A,15,'Got a raise');return `${c.A.name} gets a ${money(inc)}/wk raise and is all smiles.`}},
 {t:'Offer a one-time bonus ({COST})',d:'Cheaper in the long run. Takes the edge off.',fx:c=>{S.money.p-=c.cost;mlog(c.A,8,'One-time bonus');return `${c.A.name} takes the bonus. It'll do — for now.`}},
 {t:'Not right now',d:"They'll take it badly, and it may escalate.",fx:c=>{mlog(c.A,-6,'Raise turned down');c.A.grv=(c.A.grv||0)+1;return `${c.A.name} hangs up without saying goodbye.`}}]},
g_threat:{t:'Walkout threat',i:'🚪',who:()=>null,
 text:'{A} storms into your office: "I\'m not happy here. Fix it, or I\'m not showing up next week."',ch:[
 {t:'Sit down and hear them out',d:'Usually clears the air. Usually.',fx:c=>{if(Math.random()<.75){mlog(c.A,12,'Cleared the air');return `You talk it through. ${c.A.name} leaves your office feeling heard.`}mlog(c.A,3,'Cleared the air');return `${c.A.name} listens, nods — and leaves unconvinced.`}},
 {t:'Give them a paid week off',d:"They miss next week's show and come back refreshed.",fx:c=>{away(c.A,1);c.A.fat=0;mlog(c.A,15,'Paid week off');return `${c.A.name} takes a week at home. They'll be back recharged.`}},
 {t:'Call their bluff',d:'Show them who runs this place. They might really walk.',fx:c=>{mlog(c.A,-4,'Bluff called');if(Math.random()<.5){c.A.walkRisk=AW()+2;return `${c.A.name} walks out of your office without a word. That didn't look like a bluff.`}return `${c.A.name} backs down. For now.`}}]},
g_walk:{t:'Walkout',i:'🧳',who:()=>null,
 text:"{A} didn't show up today. Their bags are gone from the locker room and they aren't answering calls.",ch:[
 {t:'Give them space',d:"They'll be gone about 3 weeks, then come back calmer.",fx:c=>{away(c.A,3);c.A.mor=Math.max(c.A.mor,50);mlog(c.A,1,'Walked out',false);delete c.A.walkRisk;return `${c.A.name} is gone for now. Word is they'll be back in about three weeks.`}},
 {t:'Fly out and talk in person ({COST})',d:"Costs you, but they're back in a week.",fx:c=>{S.money.p-=c.cost;away(c.A,1);c.A.mor=Math.max(c.A.mor,58);mlog(c.A,1,'You flew out to talk',false);delete c.A.walkRisk;return `A long dinner and a longer talk. ${c.A.name} will be back next week.`}},
 {t:'Fine them and dock their pay',d:'The locker room sees who is in charge. They come back angry.',fx:c=>{away(c.A,2);S.money.p+=Math.round(sal(c.A)*2);c.A.mor=Math.max(c.A.mor,28);others(c.A).forEach(w=>mor(w,1));delete c.A.walkRisk;return `${c.A.name} is fined ${money(Math.round(sal(c.A)*2))} and will be back in two weeks — not happy about it.`}}]},
g_shoot:{t:'Shoot promo',i:'🎤',who:()=>null,
 text:'{A} went off-script on live TV and tore into the company — and management by name. The crowd didn\'t know whether to cheer or gasp, and the clip is everywhere.',ch:[
 {t:'Suspend them for two weeks',d:'Order restored. The locker room approves; {A} is livid.',fx:c=>{susp(c.A,2);mlog(c.A,-10,'Suspended');others(c.A).forEach(w=>mor(w,2));return `${c.A.name} is suspended for two weeks. Everyone else falls in line.`}},
 {t:'Fine them quietly',d:"Sends a message without making it a bigger story.",fx:c=>{S.money.p+=Math.round(sal(c.A)*2);mlog(c.A,-4,'Fined');return `${c.A.name} is fined ${money(Math.round(sal(c.A)*2))}. The story dies down in a few days.`}},
 {t:'Embrace it — make it a "worked shoot"',d:'Turn real frustration into a hot storyline. Fans buy in; the locker room is less sure.',fx:c=>{popx(c.A,3);mlog(c.A,12,'Their words became a storyline');others(c.A).forEach(w=>mor(w,-1));return `You lean in. ${c.A.name}'s rant becomes must-see TV (+3 popularity), and they finally feel heard.`}}]},
g_press:{t:'Grievances at the media scrum',i:'🎙️',who:()=>null,
 text:'At the post-show media scrum, {A} used their time at the podium to air grievances: no creative input, no direction, and a management team that "doesn\'t know what it has."',ch:[
 {t:'Respond publicly',d:'Fans love the drama. {A} won\'t.',fx:c=>{fansx(4000);mlog(c.A,-8,'You fired back publicly');return `Your response goes viral (+4K fans). ${c.A.name} is seething.`}},
 {t:'Call them in for a private meeting',d:'Takes the heat out of it.',fx:c=>{mlog(c.A,10,'Private meeting');return `Behind closed doors, you and ${c.A.name} clear the air.`}},
 {t:'Laugh it off',d:'Costs a little goodwill with sponsors ($50K).',fx:c=>{S.money.p-=50;mlog(c.A,3,'You laughed it off');return `You shrug it off on social media. Sponsors aren't amused (−$50K), but it blows over.`}}]}};
Object.assign(CRISES,GRV);
window.GRV=GRV;

/* pick a grievance before the usual random front-office situation */
function grvPick(){if(S.week<2||S.phase!=='season')return null;const wk=AW();if(S.grvLast&&wk-S.grvLast<2)return null;
 const r=ownList('p').filter(w=>!w.inj);
 const risk=r.find(w=>w.walkRisk&&wk>=w.walkRisk-1);if(risk&&Math.random()<.6)return {k:'g_walk',a:risk.id};
 const l=r.filter(w=>w.mor<55);if(!l.length)return null;
 const p=Math.min(.65,l.reduce((x,w)=>x+(55-w.mor)/90,0));if(Math.random()>p)return null;
 const A=wpick(l,w=>1+(55-w.mor)/5+(w.grv||0));const m=A.mor;let k;
 if(m<25)k=Math.random()<.55?'g_walk':(A.idle===0?'g_shoot':'g_press');
 else if(m<35)k=A.idle===0&&A.mic>=55?'g_shoot':A.pop>=50?'g_press':'g_threat';
 else if(m<45)k='g_threat';
 else k=A.pop>=45&&A.con>4?'g_pay':'g_threat';
 return {k,a:A.id}}
if(typeof crisisGen==='function'){const c0=crisisGen;crisisGen=function(){if(!S.crisis){try{const g=grvPick();if(g){S.crisis={k:g.k,a:g.a,b:null,w:S.week,tal:RI(0,99)};S.grvLast=AW();return}}catch(e){console.warn('grievance',e)}}return c0.apply(this,arguments)}}

/* ---------------- Mood on the wrestler card ---------------- */
function moodHtml(w){const [ic,wd]=moodWord(w.mor);const l=moodTop(w,4);
 return `<div class="card" style="margin:10px 0 0;padding:10px 12px"><div class="row sb"><b>${ic} ${wd}</b><span class="muted tiny">Morale ${Math.round(w.mor)}</span></div>${l.length?`<div class="tiny" style="margin-top:6px">${l.map(([t,d])=>`<div class="row sb"><span>${esc(t)}</span><b class="${d>0?'good':'bad'}">${d>0?'+':''}${Math.round(d)}</b></div>`).join('')}</div><div class="muted tiny" style="margin-top:4px">Last 4 weeks</div>`:'<div class="muted tiny" style="margin-top:4px">Nothing much on their mind lately.</div>'}${w.walkRisk?'<div class="bad tiny" style="margin-top:4px">⚠️ Might walk out</div>':''}</div>`}
window.moodHtml=moodHtml;
if(typeof showW==='function'){const s0=showW;showW=function(id){const out=s0.apply(this,arguments);try{const w=S.w[id];if(w&&w.own==='p'&&(S.phase==='season'||S.phase==='over')){const t=document.querySelector('#modal .wd-top');if(t)t.insertAdjacentHTML('afterend',moodHtml(w))}}catch(e){console.warn(e)}return out}}
})();
