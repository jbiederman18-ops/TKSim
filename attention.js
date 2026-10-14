/* Tony Khan Simulator — Needs your attention + the story briefing (v183).
   One list, built fresh from the game state, of everything that matters for booking this week. The booking screen shows
   it as a checklist (each item checked live against tonight's card, with a button that jumps to the fix), and the weekly
   briefing tells the same items as scenes, in the wrestlers' own words. Because both read the same list, anything new
   that needs attention shows up in both places.
   Groups: must    — skip it and it costs fans, morale or a promise ("Before you go live"; the go-live check reads these)
           chance  — optional, but it pays ("Chances tonight")
           mind    — risks on tonight's card ("Keep in mind")
           office  — deadlines that aren't on the card ("Front office")
   Each item: {id,g,i,h,d,s:[kind,text],a:[label,onclick,primary],gate,who:[ids],say:[[speaker,line]],where,chip(i)}
   Status kinds: ok (handled), b (not handled — blocks a clean go-live), w (worth a look), n (just so you know).
   Loaded after the main script. */
'use strict';
(function(){
const A_MUST='must',A_CH='chance',A_MIND='mind',A_OFF='office';
const L=w=>w.name.split(' ').slice(-1)[0];
const card=()=>(S.card&&S.card.p)||[];
/* every segment a wrestler is in tonight */
function segs(id){const c=card();const out=[];c.forEach((sl,i)=>{if(!sl||!sl.d)return;let ids=[];
 if(sl.k==='match')ids=(sl.d.sides||[]).flat();else if(sl.k==='promo')ids=[sl.d.a,sl.d.b];else if(sl.k==='chal')ids=[sl.d.c];else if(sl.k==='xo')ids=[sl.d.a];
 if(ids.includes(id))out.push({i,k:sl.k,main:sl.k==='match'&&mLab(c,i).main,d:sl.d})});return out}
const onCardW=id=>segs(id).length>0;
const inMatchW=id=>segs(id).some(x=>x.k==='match');
/* the slot both wrestlers share, if any (sides don't matter) */
function together(a,b){return segs(a).find(x=>segs(b).some(y=>y.i===x.i))||null}
function against(a,b){return segs(a).find(x=>x.k==='match'&&x.d.sides&&(()=>{const si=x.d.sides.findIndex(s=>s.includes(a)),sj=x.d.sides.findIndex(s=>s.includes(b));return si>=0&&sj>=0&&si!==sj})())||null}
function sameSide(a,b){return segs(a).find(x=>x.k==='match'&&x.d.sides&&x.d.sides.some(s=>s.includes(a)&&s.includes(b)))||null}
function segName(i){const c=card();const sl=c[i];if(!sl)return 'a segment';if(sl.k==='match'){const m=mLab(c,i);return m.main?'the main event':m.opt?'the bonus match':m.lab}return sl.k==='promo'?'a promo':'a segment'}
const emptyMatch=()=>card().findIndex(sl=>sl&&sl.k==='match'&&!sl.d);
const emptyPromo=()=>card().findIndex(sl=>sl&&sl.k==='promo'&&!sl.d);
const mainIdx=()=>{const c=card();for(let i=c.length-1;i>=0;i--)if(c[i]&&c[i].k==='match')return i;return -1};
/* the button that puts a wrestler on the card: their segment if booked, else an open match, else an open promo */
function bookBtn(id,label){const s=segs(id);if(s.length)return ['Open it',s[0].k==='promo'?`openPromo(${s[0].i})`:`openMatch(${s[0].i})`];
 const m=emptyMatch();if(m>=0)return [label||'Book them',`attnBookMatch(${m},'${id}')`];const p=emptyPromo();if(p>=0)return [label||'Book them',`attnBookPromo(${p},'${id}')`];return null}
/* steady wording per week, so scenes don't reshuffle on every render */
function pickS(arr,seed){if(!arr||!arr.length)return '';let h=0;const s=seed+'|'+AW();for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return arr[Math.abs(h)%arr.length]}
const fill=(t,v)=>t.replace(/\{(\w+)\}/g,(_,k)=>v[k]!=null?v[k]:'');
const lvK=l=>!l?'n':l.s==='y'?'ok':l.s==='m'?'w':l.s==='n'?'b':'n';
function moodW(m){return m>=80?'Thrilled':m>=65?'Happy':m>=50?'Restless':m>=35?'Unhappy':m>=20?'Angry':'Ready to walk'}
window.attnMood=moodW;

/* ---- what people say (templates; {A} {B} = names, {L}/{BL} = last names, {n} = a number) ---- */
const SAY={
 deal_me:{f:['I signed here because you promised me main events. I\'m still owed {n}.','The contract says main events. I\'m not asking for a favor.'],h:['My contract says main events. I can read. Can you?','{n} more main events. It\'s in writing, so don\'t make me get the lawyers.']},
 deal_shot:{f:['There\'s a title match in my contract, and the clock is ticking.','You promised me a shot at the gold. I\'m holding you to it.'],h:['Read the fine print. I get my title shot, or I get my lawyer.','My title shot is overdue. Fix it.']},
 deal_ppv:{f:['Every pay-per-view. That was the deal.','I\'m on every big show this year. That\'s what we agreed.'],h:['Every PPV. It\'s in writing, so don\'t get cute.','No PPV goes on without me. Read the contract.']},
 cc:{f:['Just a reminder: I don\'t lose clean. It\'s in my contract.'],h:['I decide how my matches end. Don\'t forget it.','You book me to lose, and we\'re going to have a problem.']},
 promise:{f:['You gave the fans your word. {B} and me, tonight.','Everyone was promised {B} and me. Let\'s not let them down.'],h:['Everyone knows what was promised. Don\'t make me remind you in public.','{B} and me. You said it, the fans heard it, so book it.']},
 title_idle:{f:['{n} weeks and this belt hasn\'t been on the line. People are calling it a prop.','I want to defend this title. Give me someone, anyone.'],h:['Nobody back there has earned a shot at my title. But if you insist...','{n} weeks without a defense? Maybe I\'m just that good. The fans don\'t see it that way.']},
 t_me:['Put me on last. I\'ll prove I belong there.','One more main event and you\'ll see what I\'m worth.'],
 t_seg:['Give me the time and I\'ll make it count.','I need my chances to show you what I\'ve got.'],
 t_wins:['I need wins, boss. The locker room is talking.','Let me win a few. I\'ll carry it from there.'],
 t_rest:['My body needs this week. You promised.','You told me I\'d get this week off. I\'m holding you to it.'],
 t_title:['That belt has my name on it. You said I\'d get my shot.','Title shot. You promised.'],
 t_vs:['Me and {B}. You said you\'d make it happen.','I want {B}. Nobody else.'],
 t_pair:['Me and {B}, together. Trust me on this one.','{B} and I click. Put us out there.'],
 t_team:['{B} and I are a team. Book us like one.','Me and {B}, side by side.'],
 t_avoid:['Keep {B} away from me. I mean it.','If {B} is in my segment, I\'m walking.'],
 t_ppv:['Just get me on the big show.','Put me on the pay-per-view. That\'s all I ask.'],
 tired:['I can go tonight. I\'m running on fumes, but I can go.','My legs are shot. Go easy on me this week.','I\'m beat up. One more war and something gives.'],
 exhausted:['I can barely get out of bed. I need a week off.','Doc says one more bump and I\'m done for a month.'],
 unhappy:{f:['I\'m wasting away out here. Give me something to do.','I didn\'t come here to sit in catering.'],h:['I\'m the best thing on this roster and you\'re wasting me.','Use me right, or watch what happens.']},
 angry:{f:['I\'m done being patient. Use me or let me go.','Something has to change, and soon.'],h:['Fix this, or I fix it myself.','You keep disrespecting me. I\'ve got a microphone and I\'m not afraid to use it.']},
 walk:{f:['I\'m done. Get me out of here.'],h:['I\'m one bad week from walking out that door. Try me.']},
 hot:{f:['I\'m done talking about {BL}. Let\'s end this.','Every time I turn around, {BL} is there. Enough.'],h:['{BL} wants me? Then {BL} gets me.','I\'ll end {BL} whenever I feel like it. Maybe tonight.']},
 stale:['Me and {B}? The crowd has stopped caring. Finish it.','We\'ve been at this too long. Let\'s close it out.'],
 mitb:['This briefcase doesn\'t cash itself in.','Any night now. Any night.'],
 beef_hot:['{A} and {B} had to be pulled apart in catering. Nobody wants to be in that ring if they\'re in it together.','Security had to separate {A} and {B} after the last show. It\'s getting personal.'],
 beef_warm:['There\'s tension between {A} and {B}. Keep an eye on it.','{A} and {B} aren\'t speaking. It hasn\'t boiled over yet.'],
 agent_last:['Our client\'s deal is up after this show. We\'ve had calls. Make us an offer.','After this show, {A} is a free agent. Your move.'],
 agent_urgent:['{A}\'s deal is almost up. We need an answer soon.','Clock\'s running on {A}\'s contract. Let\'s get this done.'],
 agent_soon:['No rush, but we\'d like to talk about {A}\'s future in the next few weeks.','{A}\'s deal is up soon. Better to talk now than at the deadline.'],
 agent_fa:['{A} has other offers. If we don\'t hear from you this week, we sign elsewhere.'],
 net_goal:['This week, the network wants this: {n}.','Ratings meeting was blunt. They want this: {n}.'],
 net_mand:['We need this before {B}: {n}. It\'s not a request.','Reminder from upstairs: {n}, before {B}.'],
 chant:['{n} broke out during last week\'s show.','The forums are full of it: {n}']
};
const side=(set,w)=>Array.isArray(set)?set:(set[w&&w.al==='h'?'h':'f']||set.f);
const sayW=(key,w,v,seed)=>fill(pickS(side(SAY[key],w),key+(seed||w.id)),v||{});

/* ===================== THE LIST ===================== */
function attnItems(){if(!S||S.phase!=='season')return [];
 /* the weekly goal and chant are rolled lazily, the first time anyone looks */
 if(typeof weekTick==='function'&&(!S.goal||!S.goal.p||S.goal.p.w!==AW()||!S.chant||!S.chant.p||S.chant.p.w!==AW()))weekTick();
 const out=[];const sh=curShow();const mine=ownList('p');const c=card();const add=x=>{out.push(x);return x};

 /* ---------- before you go live ---------- */
 /* v185: slots that still need booking — go-live won't run until every required slot is filled */
 {const emp=c.map((sl,i)=>sl&&!sl.d&&!sl.opt&&(sl.k==='match'||sl.k==='promo')?i:-1).filter(i=>i>=0);
  if(emp.length){const nm=emp.filter(i=>c[i].k==='match').length,np=emp.length-nm;const i0=emp[0];
   const what=[nm?`${nm} match${nm>1?'es':''}`:'',np?`${np} promo${np>1?'s':''}`:''].filter(Boolean).join(' and ');
   const names=emp.map(i=>c[i].k==='match'?(mLab(c,i).main?'Main event':mLab(c,i).lab):'Promo');
   add({id:'empty',g:A_MUST,i:'📝',h:`Still to book: ${what}`,d:`Every slot not marked optional needs filling before you can go live — or tap ✨ Suggest the rest to fill the gaps.`,
    s:['b',`Empty: ${names.join(', ')}`],a:[c[i0].k==='match'?'Book a match':'Book a promo',c[i0].k==='match'?`openMatch(${i0})`:`openPromo(${i0})`,1],gate:false,where:null})}}
 if(S.crisis&&typeof CRISES!=='undefined'&&CRISES[S.crisis.k]&&S.w[S.crisis.a]&&S.w[S.crisis.a].own==='p'){const C=CRISES[S.crisis.k];
  add({id:'crisis',g:A_MUST,i:C.i,h:`${C.good?'An opportunity':'A situation'}: ${C.t}`,d:`${S.w[S.crisis.a].name} is involved. It needs a decision before the show.`,s:['b','Waiting on you'],a:['Decide','openCrisis()',1],gate:false,who:[S.crisis.a],where:'🚨 Backstage'})}

 if(typeof PITCHES!=='undefined'&&S.pitch&&PITCHES[S.pitch.k]&&S.w[S.pitch.a]&&S.w[S.pitch.a].own==='p'){const p=S.pitch,P=PITCHES[p.k];const x=pCtx(p);let q='';try{q=pickS(P.text(x),'pitch'+p.a)}catch(e){}
  add({id:'pitch',g:A_MUST,i:'📨',h:P.head(x),d:'A request. Answer it this week, or they take silence as a no.',s:['b','Unanswered'],a:['Answer','openPitch()',1],who:[p.a],where:'🚪 Your office door',say:[[p.a,(q||'').replace(/^"|"$/g,'')]],request:p.a,askT:'Asking: '+P.head(x).replace(S.w[p.a].name+' ','')})}

 /* promised and contracted matches due tonight */
 (typeof duePromises==='function'?duePromises():[]).forEach(pr=>{const A=S.w[pr.a],B=S.w[pr.b];if(!A||!B||A.own!=='p'||B.own!=='p')return;
  const ok=c.some(sl=>sl&&sl.k==='match'&&sl.d&&inMatch(sl.d,pr.a,pr.b));const inj=A.inj||B.inj;
  add({id:'pr'+key(pr.a,pr.b),g:A_MUST,i:'📜',h:`${A.name} vs ${B.name} was ${pr.kind==='contract'?'signed':'promised'} for tonight`,d:'Skip it and you lose fans, and both of them lose morale.',
   s:ok?['ok','Booked']:inj?['w','One of them is hurt — it can\'t happen']:['b','Not on the card'],a:ok||inj?null:['Book it',`feudBook('match','${pr.a}','${pr.b}')`,1],who:[pr.a,pr.b],where:'📜 The commissioner\'s desk',
   say:[[pr.a,sayW('promise',A,{B:B.name})]],chip:i=>{const d=c[i]&&c[i].d;return d&&c[i].k==='match'&&inMatch(d,pr.a,pr.b)?['ok',`The ${pr.kind==='contract'?'contracted':'promised'} match`]:null}})});

 /* contract perks with a deadline (main events, title shot, every PPV) */
 if(typeof dealOwed==='function')dealOwed().forEach(({w,k})=>{if(w.inj)return;const d=w.deal;let ok=false,urgent=false,txt='';
  if(k==='me'){ok=segs(w.id).some(x=>x.main);urgent=d.me.need-d.me.got>=d.me.by-AW()+1;txt=ok?'In tonight\'s main event':urgent?'Has to be tonight':'Not in the main event tonight'}
  else if(k==='shot'){ok=segs(w.id).some(x=>x.k==='match'&&x.d.title)||c.some(sl=>sl&&sl.k==='chal'&&sl.d&&sl.d.c===w.id);urgent=AW()>=d.shot.by;txt=ok?'In a title match tonight':urgent?'Due tonight':'Not tonight'}
  else if(k==='ppv'){if(!sh.ppv)return;ok=onCardW(w.id);urgent=true;txt=ok?'On the card':'Not on the card'}
  const fix=ok?null:k==='me'&&mainIdx()>=0?['Open main event',`openMatch(${mainIdx()})`]:bookBtn(w.id);
  add({id:'deal'+k+w.id,g:A_MUST,i:k==='me'?'⭐':k==='shot'?'🏆':'📺',h:`${w.name}'s contract: ${dealTermTxt(w,k).replace(/^\S+\s/,'')}`,d:'Break a contract promise and they lose morale and trust.',
   s:ok?['ok',txt]:[urgent?'b':'w',txt],a:fix,who:[w.id],where:'📜 The fine print',say:[[w.id,sayW('deal_'+k,w,{n:k==='me'?d.me.need-d.me.got:''})]],request:w.id,askT:'Contract: '+dealTermTxt(w,k).replace(/^\S+\s/,''),
   chip:i=>{const s=segs(w.id).find(x=>x.i===i);if(!s)return null;if(k==='me')return s.main?['ok',`${L(w)}'s main-event clause`]:['w',`${L(w)} is owed the main event`];if(k==='shot')return s.d.title?['ok',`${L(w)}'s title-shot clause`]:null;return ['ok',`${L(w)}'s PPV clause`]}})});

 /* trials and promises from pitches */
 (S.trials||[]).forEach(t=>{const P=typeof PITCHES!=='undefined'&&PITCHES[t.k];const A=S.w[t.a];if(!P||!A||A.own!=='p'||(t.b&&!S.w[t.b]))return;const B=t.b&&S.w[t.b];
  const left=t.end-AW()+1;const need=(t.need||1)-(t.have||0);const must=need>=left;let ok=false,bad=false,txt='',fix=null;
  const sg=segs(t.a);
  switch(t.goal){
   case 'seg':{const s=sg.find(x=>!t.kind||x.k===t.kind);ok=!!s;txt=ok?`On the card in ${segName(s.i)}${t.min?` — needs ${t.min}★+`:''}`:`No ${t.kind||'segment'} for them tonight`;if(!ok)fix=t.kind==='promo'&&emptyPromo()>=0?['Book a promo',`attnBookPromo(${emptyPromo()},'${t.a}')`]:bookBtn(t.a);break}
   case 'me':{ok=sg.some(x=>x.main);txt=ok?'In tonight\'s main event':'Not in the main event';if(!ok&&mainIdx()>=0)fix=['Open main event',`openMatch(${mainIdx()})`];break}
   case 'wins':{const s=sg.find(x=>x.k==='match');ok=!!(s&&s.d.sides[s.d.winner]&&s.d.sides[s.d.winner].includes(t.a));txt=ok?'Booked to win tonight':s?'Booked to lose tonight':'No match for them tonight';fix=s?['Open it',`openMatch(${s.i})`]:bookBtn(t.a);break}
   case 'title':{ok=sg.some(x=>x.k==='match'&&x.d.title===t.title);txt=ok?'In the title match tonight':'Not in a title match tonight';fix=ok?null:bookBtn(t.a);break}
   case 'vs':{ok=!!(B&&against(t.a,t.b));txt=ok?`Facing ${B.name} tonight`:`Not facing ${B?B.name:'them'} tonight`;fix=ok?null:B?['Book it',`feudBook('match','${t.a}','${t.b}')`]:null;break}
   case 'pair':{ok=!!(B&&together(t.a,t.b));txt=ok?`With ${B.name} tonight`:`Not with ${B?B.name:'them'} tonight`;fix=ok?null:bookBtn(t.a);break}
   case 'team':{ok=!!(B&&sameSide(t.a,t.b));txt=ok?`Teaming with ${B.name} tonight`:`Not teaming with ${B?B.name:'them'} tonight`;fix=ok?null:bookBtn(t.a);break}
   case 'rest':{bad=inMatchW(t.a);ok=!bad;txt=bad?'Booked in a match — you promised a week off':'Resting, as promised';const s=sg.find(x=>x.k==='match');fix=bad&&s?['Swap them out',`openMatch(${s.i})`]:null;break}
   case 'avoid':{const s=B&&together(t.a,t.b);bad=!!s;ok=!bad;txt=bad?`In the same segment as ${B.name}`:`Kept away from ${B?B.name:'them'}`;fix=s?['Open it',s.k==='promo'?`openPromo(${s.i})`:`openMatch(${s.i})`]:null;break}
   case 'ppv':{ok=!!sh.ppv&&onCardW(t.a);txt=sh.ppv?(ok?'On the PPV card':'Not on the PPV card'):'Waits for the next PPV';break}
   default:txt=''}
  const k=ok?'ok':bad||(must&&t.goal!=='ppv')?'b':t.goal==='ppv'&&!sh.ppv?'n':'w';
  const prog=t.goal==='rest'||t.goal==='avoid'?'':`${t.have||0}/${t.need} done · `;
  add({id:'trial'+t.a+t.k,g:A_MUST,i:'🧪',h:`${A.name}: ${t.txt}`,d:`${prog}${left<=1?'last week to hit it':`${left} weeks left`}${t.big?' · you promised':''}`,s:[k,txt],a:ok?null:fix,who:[t.a,t.b].filter(Boolean),where:'🎤 Promises you\'re keeping',
   say:[[t.a,fill(pickS(SAY['t_'+t.goal]||SAY.t_seg,'tr'+t.a),{B:B?B.name:''})]],request:t.a,askT:'Promised: '+t.txt,
   chip:i=>{const s=sg.find(x=>x.i===i);if(!s)return null;return t.goal==='rest'?(s.k==='match'?['b',`${L(A)} was promised the week off`]:null):t.goal==='avoid'?(B&&together(t.a,t.b)&&together(t.a,t.b).i===i?['b',`${L(A)} wanted to avoid ${L(B)}`]:null):ok?['ok',`Counts toward ${L(A)}'s promise`]:null}})});

 /* titles going stale — v186: one row for all of them, under Keep in mind, led by the most overdue */
 {const st=Object.entries(S.titles||{}).map(([tid,t])=>{if(!t.holders.length)return null;const H=S.w[t.holders[0]];if(!H||H.own!=='p'||H.inj||t.last==null||S.week-t.last<4)return null;
   const s=c.findIndex(sl=>sl&&sl.k==='match'&&sl.d&&sl.d.title===tid);return {tid,t,H,wk:S.week-t.last,s,hs:segs(H.id).find(x=>x.k==='match')}}).filter(Boolean).sort((a,b)=>b.wk-a.wk);
  if(st.length){const open=st.filter(x=>x.s<0);const top=open[0]||st[0];const one=st.length===1;
   const who=x=>x.t.holders.map(id=>S.w[id]?L(S.w[id]):'').join(' & ');
   const fix=!open.length?null:top.hs?['Put it on the line',`openMatch(${top.hs.i})`]:bookBtn(top.H.id,'Book a defense');
   add({id:'idle',g:A_MIND,i:'🏆',h:one?`${top.t.n} title: ${top.wk} weeks without a defense`:`${st.length} titles need defending`,
    d:one?'An idle title loses prestige every week it isn\'t defended.':`Most overdue: ${open.map(x=>`${x.t.n} (${x.wk} wks)`).slice(0,3).join(', ')||'none tonight'}. Idle titles lose prestige every week — rotate defenses.`,
    s:!open.length?['ok',one?`Defended tonight in ${segName(top.s)}`:'All defended tonight']:open.length<st.length?['w',`${st.length-open.length} of ${st.length} defended tonight`]:top.hs?['w',`${who(top)} ${top.t.holders.length>1?'are':'is'} booked, but the ${top.t.n} title isn't on the line`]:['w',`${who(top)} ${top.t.holders.length>1?'aren\'t':'isn\'t'} on the card`],
    a:fix,gate:false,who:st.flatMap(x=>x.t.holders),where:'🏆 The champions',
    say:open.slice(0,2).map(x=>[x.H.id,sayW('title_idle',x.H,{n:x.wk})]),chip:i=>st.some(x=>x.s===i)?['ok','Title defense']:null})}}

 /* contracts ending after this show — the go-live contract check already stops you, so this doesn't double up */
 mine.filter(w=>w.con<=1).forEach(w=>{const blk=w.neg&&w.neg.no>AW();
  add({id:'conlast'+w.id,g:A_MUST,i:'✍️',h:`${w.name}'s contract ends after this show`,d:`${conStakes(w)?conStakes(w)+' ':''}Re-sign them now or they become a free agent. ${blk?'They walked away from talks — re-signing means paying their price.':`They want about ${money(askSal(w))}/wk.`}`,s:['b','Not re-signed'],
   a:blk?[`Re-sign ${money(resignCost(w))}`,`attnResign('${w.id}')`,1]:['Negotiate',`attnNeg('${w.id}')`,1],gate:false,who:[w.id],where:'📞 On the phone',say:[[`${w.name}'s agent`,sayW('agent_last',w,{A:w.name})]]})});

 /* network mandate, due tonight */
 const md=S.mand&&S.mand.p;
 if(md&&!md.done&&typeof MANDS!=='undefined'&&MANDS[md.k]){const l=mandLive(md);const due=md.due-S.week<=0;
  add({id:'mand',g:due?A_MUST:A_CH,i:'📺',h:`Network mandate: ${MANDS[md.k].n}`,d:`${due?'Due tonight':`${md.due-S.week} week${md.due-S.week>1?'s':''} left, by ${md.ppv}`} · +${money(md.cash)} and +${fmtFans(md.fans)} fans; miss it and you lose 5K fans.`,
   s:[lvK(l),l&&l.t||''],a:null,gate:due,where:'📺 The network',say:[['Network executive',fill(pickS(SAY.net_mand,'mand'),{n:MANDS[md.k].n.toLowerCase(),B:md.ppv||'the deadline'})]]})}

 /* ---------- chances tonight ---------- */
 const g=S.goal&&S.goal.p;
 if(g&&g.w===AW()&&!g.done&&typeof GOALS!=='undefined'&&GOALS[g.k]){const l=goalLive(g.k);
  add({id:'goal',g:A_CH,i:GOALS[g.k].i,h:`This week's goal: ${GOALS[g.k].n}`,d:`+${money(goalCash(g))} and +${fmtFans(g.fans)} fans`,s:[lvK(l),l&&l.t||''],a:null,where:'📺 The network',
   say:[['Network executive',fill(pickS(SAY.net_goal,'goal'),{n:GOALS[g.k].n.toLowerCase()})]]})}
 const ch=S.chant&&S.chant.p;
 if(ch&&ch.w===AW()&&!ch.hit&&S.w[ch.id]&&S.w[ch.id].own==='p'&&!S.w[ch.id].inj){const w=S.w[ch.id];const on=onCardW(w.id);
  add({id:'chant',g:A_CH,i:'📣',h:`The crowd is chanting for ${w.name}`,d:'Put them anywhere on the card for a pop: +¼★, popularity and fans.',s:on?['ok','On the card']:['w','Not on the card'],a:on?null:bookBtn(w.id,'Book them'),who:[w.id],where:'📣 The fans',
   say:[['Fan forums',fill(pickS(SAY.chant,'chant'),{n:ch.t})]],chip:i=>segs(w.id).some(x=>x.i===i)?['ok','The crowd gets its wish']:null})}
 {const a=typeof rivalAd==='function'?rivalAd():null;if(a){const P=cardProj();const mine2=P.me?P.me.mid:null;const theirs=(a.lo+a.hi)/2;
  add({id:'rival',g:A_CH,i:'📻',h:`Beat ${sh.theirs||'the rival'}'s main event for +3K fans`,d:`${vsLine(a.m)} · ${tellWord(theirs)}`,s:mine2==null?['n','Book your main event to compare']:tellStar(mine2)>=tellStar(theirs)?['ok',`Yours: ${tellWord(mine2)}`]:['w',`Yours: ${tellWord(mine2)}`],a:null,where:'📻 Across the dial',
   say:[['The dirt sheets',`${sh.theirs||'The other show'} goes big this week: ${vsLine(a.m)}.`]]})}}
 /* Money in the Bank */
 if(S.mitb)Object.keys(S.mitb).forEach(id=>{const w=S.w[id];if(!w||w.own!=='p'||w.inj)return;const x=S.mitb[id];const left=SEASON-(AW()-x.aw);
  add({id:'mitb'+id,g:A_CH,i:'💼',h:`${w.name} can cash in Money in the Bank`,d:`${left} week${left===1?'':'s'} left. Open any match with one of your world champions and pick the cash-in.`,s:left<=1?['w','Last chance']:['n',`${left} weeks left`],a:null,who:[id],where:'💼 The briefcase',say:[[id,sayW('mitb',w)]]})});

 /* ---------- keep in mind ---------- */
 {const seen=new Set();for(let i=0;i<mine.length;i++)for(let j=i+1;j<mine.length;j++){const v=beefOf(mine[i].id,mine[j].id);if(v<25)continue;const A=mine[i],B=mine[j];const tg=together(A.id,B.id);
  add({id:'beef'+key(A.id,B.id),g:A_MIND,i:'☢️',h:`Real heat backstage: ${A.name} and ${B.name}`,d:v>=BEEF_MIN?'Putting them in a ring together could turn ugly.':'Simmering. Keep them apart and it cools off.',
   s:tg?[v>=BEEF_MIN?'b':'w',`Together in ${segName(tg.i)}`]:['ok','Kept apart'],a:tg?['Open it',tg.k==='promo'?`openPromo(${tg.i})`:`openMatch(${tg.i})`]:null,gate:false,who:[A.id,B.id],where:'☢️ Catering',
   say:[['Locker room whispers',fill(pickS(v>=BEEF_MIN?SAY.beef_hot:SAY.beef_warm,'beef'+key(A.id,B.id)),{A:A.name,B:B.name})]],chip:i=>tg&&tg.i===i?[v>=BEEF_MIN?'b':'w',`Real heat: ${L(A)} & ${L(B)}`]:null})}}
 /* worn down */
 {const tired=mine.filter(w=>!w.inj&&sta(w)<100-FAT_OK);const ex=tired.filter(w=>w.fat>=FAT_RISK);const onT=tired.filter(w=>inMatchW(w.id));
  if(tired.length)add({id:'tired',g:A_MIND,i:'🔋',h:onT.length?`Tired in a match tonight: ${onT.map(L).join(', ')}`:`Worn down: ${tired.slice(0,4).map(L).join(', ')}`,d:ex.length?`${ex.map(w=>w.name).join(', ')} ${ex.length>1?'are':'is'} exhausted: rest them or risk an injury.`:'Tired wrestlers work a little slower, and run-down ones risk injury.',
   s:ex.some(w=>inMatchW(w.id))?['w',`${ex.filter(w=>inMatchW(w.id)).map(L).join(', ')} wrestling exhausted`]:onT.length?['w','A little slower tonight']:['ok','Nobody tired is in a match'],a:null,gate:false,who:tired.map(w=>w.id),where:'🩹 The trainer\'s room',
   say:tired.slice(0,3).map(w=>[w.id,fill(pickS(w.fat>=FAT_RISK?SAY.exhausted:SAY.tired,'tired'+w.id),{})])})}
 /* unhappy, and not already asking for something */
 {const asking=new Set(out.filter(x=>x.request).map(x=>x.request));
  mine.filter(w=>!w.inj&&w.mor<45&&!asking.has(w.id)).sort((a,b)=>a.mor-b.mor).slice(0,4).forEach(w=>{const on=onCardW(w.id);const tier=w.mor<20?'walk':w.mor<35?'angry':'unhappy';
   add({id:'mor'+w.id,g:A_MIND,i:'😒',h:`${w.name} is ${moodW(w.mor).toLowerCase()}`,d:`${w.mor<SIT_MOR?'Could go off-script in a match. ':''}A win, a main event spot or a sit-down interview helps.`,s:on?['n','On the card tonight']:['w','Not on the card'],a:on?null:bookBtn(w.id,'Book them'),who:[w.id],where:'🚶 The hallway',
    say:[[w.id,sayW(tier,w)]],chip:i=>segs(w.id).some(x=>x.i===i)&&w.mor<SIT_MOR?['w',`${L(w)} may go off-script`]:null})})}
 /* creative control on tonight's card */
 mine.filter(w=>typeof ccOn==='function'&&ccOn(w)&&!w.inj).forEach(w=>{const s=segs(w.id).find(x=>x.k==='match');if(!s)return;const win=s.d.sides[s.d.winner]&&s.d.sides[s.d.winner].includes(w.id);
  add({id:'cc'+w.id,g:A_MIND,i:'🎬',h:`${w.name} has creative control`,d:'They won\'t agree to lose. Book them to lose and expect a fight over the finish.',s:win?['ok','Booked to win']:['w','Booked to lose'],a:win?null:['Open it',`openMatch(${s.i})`],gate:false,who:[w.id],where:'📜 The fine print',say:[[w.id,sayW('cc',w)]],chip:i=>i===s.i&&!win?['w',`${L(w)} has creative control`]:null})});
 /* feuds going stale */
 let nStale=0;const isHot=()=>false;
 for(const k of Object.keys(S.heat).sort((x,y)=>{const fx=S.fs&&S.fs[x],fy=S.fs&&S.fs[y];return (fx?fx.start:1e9)-(fy?fy.start:1e9)})){const f=S.fs&&S.fs[k];if(isHot(k)||nStale>=2)continue;const [a,b]=k.split('|');const A=S.w[a],B=S.w[b];if(!f||f.paid||!A||!B||A.own!=='p'||B.own!=='p'||S.heat[k]<20)continue;const age=AW()-f.start;if(!f.stale&&age<5)continue;const left=8-age;nStale++;
  add({id:'stale'+k,g:A_MIND,i:'🥱',h:`${A.name} vs ${B.name} ${f.stale?'has gone stale':`goes stale in ${Math.max(1,left)} week${left===1?'':'s'}`}`,d:'Pay it off at a PPV, or blow it off on TV, before the crowd stops caring.',s:against(a,b)?['ok','On tonight\'s card']:['n','Not tonight'],a:null,gate:false,who:[a,b],where:'🥱 The crowd is restless',
   say:[[a,fill(pickS(SAY.stale,'stale'+k),{B:B.name})]]})}

 /* ---------- front office ---------- */
 /* v185: a roster that's running thin — expired deals and walkouts add up quietly */
 {const full=(S.draft&&S.draft.rounds)||24;const n=mine.length;const nW=mine.filter(w=>w.g==='F').length;const nM=n-nW;
  if(n<Math.round(full*.75)){const crit=n<Math.round(full*.5);
   const thin=[nM<6?`${nM} men`:'',nW<4?`${nW} women`:''].filter(Boolean).join(' and ');
   add({id:'thin',g:crit?A_MUST:A_OFF,i:'📋',h:`Your roster is down to ${n} wrestler${n===1?'':'s'}`,d:`You drafted ${full}. ${thin?`Only ${thin} left — some divisions can't fill a card. `:''}Sign free agents or prospects to fill it back up, and re-sign the deals that are ending.`,
    s:[crit?'b':'w',crit?'Too thin to book a full show':'Running thin'],a:['Browse free agents',"closeModal();rf='fa';go('roster')",crit?1:0],gate:false,where:'📋 The locker room',
    say:[['Your assistant',crit?`We're down to ${n} wrestlers. We can barely fill a card — we need bodies, now.`:`Heads up: we're down to ${n} wrestlers. A few signings would give us room to breathe.`]]})}}
 (typeof conWatch==='function'?conWatch():[]).filter(w=>w.con>1).forEach(w=>{const blk=w.neg&&w.neg.no>AW();
  add({id:'con'+w.id,g:A_OFF,i:'✍️',h:`${w.name}'s contract ends ${conWhen(w)}`,d:(conStakes(w)?conStakes(w)+' ':'')+(blk?`They walked away from talks — back at the table week ${wkOf(w.neg.no)}.`:`They want about ${money(askSal(w))}/wk. Talks get pricier near the deadline.`),
   s:[w.con<=CON_URGENT?'w':'n',conTxt(w)],a:blk?[`Re-sign ${money(resignCost(w))}`,`attnResign('${w.id}')`]:['Negotiate',`attnNeg('${w.id}')`],gate:false,who:[w.id],where:'📞 On the phone',say:[[`${w.name}'s agent`,sayW(w.con<=CON_URGENT?'agent_urgent':'agent_soon',w,{A:w.name})]]})});
 Object.values(S.w).filter(w=>typeof onMarket==='function'&&onMarket(w)&&!w.cw&&faLeft(w)===1&&w.pop>=55).sort((a,b)=>b.pop-a.pop).slice(0,3).forEach(w=>{
  add({id:'fa'+w.id,g:A_OFF,i:'🆕',h:`Last week to sign ${w.name}`,d:`Free agent · POP ${Math.round(w.pop)} · signs for ${money(signCost(w))}`,s:['w','Gone after this week'],a:['See them',`showW('${w.id}')`],gate:false,who:[w.id],where:'🆕 The free-agent market',say:[[`${w.name}'s agent`,sayW('agent_fa',w,{A:w.name})]]})});
 /* v186: a big name just hit the market — said the week they arrive, not only on their last week */
 {const arr=Object.keys(S.faNew||{}).filter(id=>S.faNew[id]===AW()).map(id=>S.w[id]).filter(w=>w&&onMarket(w)&&!w.cw&&w.pop>=70).sort((a,b)=>b.pop-a.pop);
  if(arr.length){const w=arr[0];
   add({id:'arrive',g:A_OFF,i:'🆕',h:arr.length>1?`Big names on the market: ${arr.map(x=>x.name).join(', ')}`:`${w.name} just hit the market`,d:`${arr.map(x=>`${x.name} · POP ${Math.round(x.pop)} · ${faLeft(x)} week${faLeft(x)===1?'':'s'} to decide`).join(' · ')}. Stars want an offer — money plus promises — and ${S.rival||'the rival'} can bid too.`,
    s:['n','New this week'],a:['See them',`showW('${w.id}')`],gate:false,who:arr.map(x=>x.id),where:'🆕 The free-agent market',say:[[`${w.name}'s agent`,`${w.name} is a free agent as of this week. We're taking offers.`]]})}}
 {const n=(S.injq||[]).filter(q=>S.w[q.id]&&S.w[q.id].own==='p'&&S.w[q.id].inj>0).length;if(n)add({id:'med',g:A_OFF,i:'🚑',h:`${n} medical decision${n>1?'s':''} waiting`,d:'Let it heal, rush them back, or send them for surgery.',s:['w','Undecided'],a:['Decide','openBrief()'],gate:false,where:null})}
 {const T=S.tamp||{};const n=Object.keys(T).filter(id=>S.w[id]&&S.w[id].own==='p'&&!T[id].let&&!T[id].calm).length;if(n)add({id:'tamp',g:A_OFF,i:'🕵️',h:`${n} tampering rumor${n>1?'s':''}`,d:'The rival is courting someone on your roster.',s:['w','Undecided'],a:['Decide','openBrief()'],gate:false,where:null})}
 if(typeof cdOfferLive==='function'&&cdOfferLive())add({id:'cdoffer',g:A_OFF,i:'⏳',h:'A signing offer from the countdown debut',d:'Decide in the briefing.',s:['w','Undecided'],a:['Decide','openBrief()'],gate:false,where:null});
 if(typeof ocOfferLive==='function'&&ocOfferLive())add({id:'ocoffer',g:A_OFF,i:'📝',h:'Someone impressed in your open challenge',d:'Decide in the briefing whether to sign them.',s:['w','Undecided'],a:['Decide','openBrief()'],gate:false,where:null});
 /* a chance is never a blocker: "not yet" there is just worth a look */
 out.forEach(x=>{if(x.g===A_CH&&x.s&&x.s[0]==='b')x.s=['w',x.s[1]]});
 return out}
window.attnItems=attnItems;

/* ===================== BOOKING SCREEN ===================== */
const GRP=[[A_MUST,'Before you go live'],[A_CH,'Chances tonight'],[A_MIND,'Keep in mind'],[A_OFF,'Front office']];
let OPEN=null;
function stHtml(s){if(!s||!s[1])return '';const k=s[0];return ` · <span class="${k==='ok'?'good':k==='b'?'bad':k==='w'?'warnt':'muted'}">${k==='ok'?'✓ ':k==='b'?'✗ ':''}${esc(s[1])}</span>`}
function rowHtml(x){return `<div class="atr ${x.s&&x.s[0]==='b'?'bad':''}"><div class="atb"><b>${x.i} ${esc(x.h)}</b><div class="tiny muted">${esc(x.d)}${stHtml(x.s)}</div></div>${x.a?`<button class="mini ${x.a[2]?'on':''}" onclick="${x.a[1]}">${esc(x.a[0])}</button>`:''}</div>`}
function attnPanel(){if(!S||S.phase!=='season'||mpLocked&&mpLocked())return '';let l;try{l=attnItems()}catch(e){console.warn(e);return ''}
 if(!OPEN)OPEN={more:false,[A_MUST]:true,[A_CH]:true,[A_MIND]:true,[A_OFF]:true};
 /* on top: only what still blocks a clean go-live. Everything else waits behind one dropdown. */
 const top=l.filter(x=>x.g===A_MUST&&x.s[0]==='b');const rest=l.filter(x=>!top.includes(x));
 const subOf=(g,xs)=>g===A_MUST?'Handled':g===A_CH?`${xs.filter(x=>x.s[0]==='ok').length} of ${xs.length} taken`:g===A_MIND?'Risks on tonight\'s card':'Deadlines that aren\'t on the card';
 const secs=GRP.map(([g,t])=>{const xs=rest.filter(x=>x.g===g);if(!xs.length)return '';
  return `<details class="atg" ${OPEN[g]?'open':''} ontoggle="attnOpen('${g}',this.open)"><summary><span>${t}</span><span class="tiny muted">${subOf(g,xs)}</span></summary><div class="atl">${xs.map(rowHtml).join('')}</div></details>`}).join('');
 const cnt=GRP.map(([g,t])=>{const n=rest.filter(x=>x.g===g).length;return n?`${n} ${g===A_MUST?'handled':g===A_CH?(n>1?'chances':'chance'):g===A_MIND?'to keep in mind':'front office'}`:''}).filter(Boolean).join(' · ');
 return `<div class="card attn"><div class="row sb"><div class="h small" style="margin:0">Needs your attention</div>${top.length?`<span class="tg bad">${top.length} to fix</span>`:'<span class="tg good">Ready</span>'}</div>
 ${top.length?`<div class="atl attop">${top.map(rowHtml).join('')}</div>`:'<div class="muted tiny" style="margin-top:6px">✓ Nothing is blocking tonight\'s show.</div>'}
 ${rest.length?`<details class="atmore" ${OPEN.more?'open':''} ontoggle="attnOpen('more',this.open)"><summary><span>Everything else</span><span class="tiny muted">${cnt}</span></summary>${secs}</details>`:''}
 <div class="tiny muted" style="margin-top:8px"><a href="#" onclick="openBrief();return false" style="color:var(--gold2)">📰 Read this week's briefing</a></div></div>`}
window.attnPanel=attnPanel;
window.attnOpen=(g,o)=>{if(OPEN)OPEN[g]=o};
/* chips on each segment of the running order: promises it keeps or breaks, heat, creative control */
window.attnChips=function(i){let l;try{l=attnItems()}catch(e){return ''}const out=[];l.forEach(x=>{if(!x.chip)return;let c=null;try{c=x.chip(i)}catch(e){}if(c)out.push(c)});
 return out.map(([k,t])=>`<span class="tg ${k==='ok'?'good':k==='b'?'bad':'warnt'}">${k==='ok'?'✓ ':k==='b'?'✗ ':''}${esc(t)}</span>`).join('')};
/* what a wrestler is asking for or was promised (wrestler cards, the picker) */
window.attnAsk=function(id){const m=attnAskMap();return m.get(id)||null};
window.attnAskMap=function(){const m=new Map();let l=[];try{l=attnItems()}catch(e){}l.forEach(x=>{if(x.request&&!m.has(x.request))m.set(x.request,{open:x.id==='pitch',t:x.askT||x.h})});return m};
/* go-live check: anything in "Before you go live" still open (contracts and crises have their own checks) */
let OK_WK=-1;
window.attnGate=function(){if(OK_WK===AW())return false;let l;try{l=attnItems()}catch(e){return false}const bad=l.filter(x=>x.g===A_MUST&&x.s[0]==='b'&&x.gate!==false);if(!bad.length)return false;
 openModal(`<div class="h mhd">Before you go live</div><p class="muted" style="margin-top:0">${bad.length===1?'One thing on your checklist is still open:':`${bad.length} things on your checklist are still open:`}</p>${bad.map(rowHtml).join('')}
 <button class="btn" onclick="closeModal()">Fix it first</button><button class="btn sec" onclick="attnGoAnyway()">Go live anyway</button>`);return true};
window.attnGoAnyway=function(){OK_WK=AW();closeModal();goLive()};
window.attnBookMatch=function(i,id){closeModal();if(typeof openMatchWith==='function')openMatchWith(i,id)};
window.attnBookPromo=function(i,id){closeModal();if(typeof openPromo!=='function')return;openPromo(i);if(typeof PE!=='undefined'&&PE){PE.a=id;if(PE.b===id)PE.b='';renderPromoEd(true)}};
window.attnNeg=function(id){closeModal();dealNegotiate(id)};
window.attnResign=function(id){resign(id);render()};

/* ===================== THE BRIEFING ===================== */
function av(sp){const w=S.w[sp];if(w)return `<span class="scav">${face(w)}</span>`;const ini=String(sp).replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();return `<span class="scav x">${esc(ini||'?')}</span>`}
const TAG={[A_MUST]:'On your checklist',[A_CH]:'Chance tonight',[A_MIND]:'Keep in mind',[A_OFF]:'Front office'};
function sceneHtml(x){const says=(x.say||[]).filter(s=>s&&s[1]);
 return `<div class="scene ${x.g===A_MUST&&x.s[0]==='b'?'hot':''}"><div class="scw">${esc(x.where||x.i)}</div>${says.map(([sp,line])=>{const w=S.w[sp];return `<div class="scs">${av(sp)}<div class="scq"><b class="${w?(w.al==='f'?'face':'heel'):''}">${esc(w?w.name:sp)}</b><q>${esc(line)}</q></div></div>`}).join('')}
 <div class="scm"><span>${x.i} ${esc(x.h)}. <span class="muted">${esc(x.d)}</span></span><span class="sct">${TAG[x.g]}</span></div>${x.a&&x.a[1]!=='openBrief()'?`<div class="row" style="margin-top:8px"><button class="mini" onclick="closeModal();${x.a[1]}">${esc(x.a[0])}</button></div>`:''}</div>`}
/* v186: the briefing stays short.
   - Same-place scenes merge: every agent call is one "On the phone" scene, every free agent's last week one market scene.
   - A scene only comes back when something about it changed (a new name, a deadline crossing into urgent, a mandate
     coming due). Anything blocking tonight's show always shows. Whatever was left out is summed up in one line at the end.
   The "what changed" check compares against the signatures seen when last week's briefing was written (S.brSig), and
   the base for this week is kept in S.brBase so reopening the briefing shows the same scenes. */
const MERGE={conlast:'phone',con:'phone',fa:'fa'};
const mergeKey=x=>{const m=/^(conlast|con|fa)(?=[a-z0-9])/i.exec(x.id);return m&&MERGE[m[1]]?MERGE[m[1]]:null};
function sigOf(x){const id=x.id;
 if(id==='mand'){const md=S.mand&&S.mand.p;return md?md.k+(md.due-S.week<=0?'|due':''):''}
 if(id==='idle'){return (x.who||[]).join(',')}
 if(id==='tired')return (x.who||[]).slice().sort().join(',');
 if(/^mor/.test(id))return x.h;
 if(/^mitb/.test(id))return x.s&&x.s[0];
 if(/^stale/.test(id))return x.h.includes('has gone stale')?'stale':'soon';
 if(/^con/.test(id)){const w=S.w[(x.who||[])[0]];return w?(w.con<=1?'last':w.con<=CON_URGENT?'urgent':'soon'):x.h}
 return x.h}
function phoneScene(xs,isNew){const all=xs.map(x=>S.w[x.who[0]]).filter(Boolean);const ws=xs.filter(isNew).map(x=>S.w[x.who[0]]).filter(Boolean).sort((a,b)=>a.con-b.con);const more=all.length-ws.length;if(!ws.length)return '';const lead=ws[0];
 const line=ws[0].con<=1?sayW('agent_last',lead,{A:lead.name}):sayW(lead.con<=CON_URGENT?'agent_urgent':'agent_soon',lead,{A:lead.name});
 const hot=ws.some(w=>w.con<=1);
 return `<div class="scene ${hot?'hot':''}"><div class="scw">📞 On the phone</div><div class="scs">${av(lead.name+"'s agent")}<div class="scq"><b>${esc(lead.name)}'s agent</b><q>${esc(line)}</q></div></div>
 ${ws.map(w=>{const blk=w.neg&&w.neg.no>AW();const st=conStakes(w);return `<div class="scm" style="border-top:1px solid var(--line);padding-top:8px"><span>✍️ <b>${esc(w.name)}</b> — deal ends ${conWhen(w)} · asks about ${money(askSal(w))}/wk${st?`<br><span class="${w.con<=1?'bad':'muted'} tiny">${esc(st)}</span>`:''}</span>
  <button class="mini ${w.con<=1?'on':''}" onclick="closeModal();${blk?`attnResign('${w.id}')`:`attnNeg('${w.id}')`}">${blk?'Re-sign '+money(resignCost(w)):'Negotiate'}</button></div>`}).join('')}
 <div class="scm"><span class="muted tiny">${more?`Plus ${more} other deal${more>1?'s':''} you've already heard about — all in Needs your attention. `:''}Talks get pricier near the deadline.</span><span class="sct">${hot?TAG[A_MUST]:TAG[A_OFF]}</span></div></div>`}
function faScene(xs){const ws=xs.map(x=>S.w[x.who[0]]).filter(Boolean);if(!ws.length)return '';
 return `<div class="scene"><div class="scw">🆕 The free-agent market</div><div class="scs">${av(ws[0].name+"'s agent")}<div class="scq"><b>${ws.length>1?'The agents':esc(ws[0].name)+"'s agent"}</b><q>${esc(ws.length>1?'Our clients have other offers. If we don\'t hear from you this week, they sign elsewhere.':sayW('agent_fa',ws[0],{A:ws[0].name}))}</q></div></div>
 ${ws.map(w=>`<div class="scm" style="border-top:1px solid var(--line);padding-top:8px"><span>🆕 <b>${esc(w.name)}</b> · POP ${Math.round(w.pop)} — last week on the market</span><button class="mini" onclick="closeModal();showW('${w.id}')">See them</button></div>`).join('')}
 <div class="scm"><span></span><span class="sct">${TAG[A_OFF]}</span></div></div>`}
window.briefStory=function(){const sh=curShow();let l=[];try{l=attnItems()}catch(e){console.warn(e)}
 const scenes=l.filter(x=>x.where&&x.say&&x.say.length);
 const order=[A_MUST,A_CH,A_MIND,A_OFF];scenes.sort((a,b)=>order.indexOf(a.g)-order.indexOf(b.g));
 /* what changed since last week's briefing */
 if(!S.brBase||S.brBase.w!==AW()){S.brBase={w:AW(),sig:Object.assign({},S.brSig||{})};}
 const base=S.brBase.sig;const first=!S.brSig;const urgent=x=>x.g===A_MUST&&x.s&&x.s[0]==='b';
 const isNew=x=>first||urgent(x)||base[x.id]!==sigOf(x);
 S.brSig=S.brSig||{};scenes.forEach(x=>S.brSig[x.id]=sigOf(x));
 /* merged groups show when any member is new; their members all show together */
 const groups={};const solo=[];const held=[];
 scenes.forEach(x=>{const k=mergeKey(x);if(k)(groups[k]=groups[k]||[]).push(x);else (isNew(x)?solo:held).push(x)});
 const out=[];
 solo.forEach(x=>out.push(sceneHtml(x)));
 const gHtml=[];
 if(groups.phone){if(groups.phone.some(isNew))gHtml.push([groups.phone.some(urgent)?0:3,phoneScene(groups.phone,isNew)]);else held.push({h:`${groups.phone.length} contract talk${groups.phone.length>1?'s':''}`,grp:1})}
 if(groups.fa){if(groups.fa.some(isNew))gHtml.push([3,faScene(groups.fa)]);else held.push({h:`${groups.fa.length} free agent${groups.fa.length>1?'s':''} in their last week`,grp:1})}
 /* place merged scenes: urgent phone calls first, the rest after the solo scenes */
 const pre=gHtml.filter(g=>g[0]===0).map(g=>g[1]),post=gHtml.filter(g=>g[0]!==0).map(g=>g[1]);
 const np=nextPPV();
 const head=`<div class="kick">Week ${S.week}${np?` · ${np.in?`${np.in} week${np.in===1?'':'s'} to ${esc(np.n)}`:`${esc(np.n)} is this week`}`:''}</div><div class="h mhd" style="margin-top:2px">📰 The briefing</div><p class="muted" style="margin-top:0">${sh.ppv?`${esc(sh.name)} is tonight. Here's what happened backstage.`:"What happened backstage since the last show."}</p>`;
 let secs=[];try{secs=briefItems().filter(s=>!s.rep)}catch(e){console.warn(e)}
 /* desk sections come back only when their names change (or something needs acting on now) */
 const dsig=s=>s.t.replace(/\d+/g,'')+'|'+s.rows.join('').replace(/<[^>]+>/g,' ').replace(/[\d$K%,.+−-]+/g,'').replace(/\s+/g,' ');
 secs=secs.filter(s=>{const k='desk:'+s.t.replace(/[\d·\s]+$/,'');const g=dsig(s);const nw=first||s.u||base[k]!==g;S.brSig[k]=g;if(!nw&&!/calendar/i.test(s.t))held.push({h:s.t.replace(/\s*·\s*\d+.*$/,''),grp:1});return nw||/calendar/i.test(s.t)});
 const desk=secs.map(s=>`<div class="scene brief ${s.u?'hot':''}"><div class="scw">${s.i} ${s.t}${s.u?' <span class="tg bad">Act now</span>':''}${s.tag?` <span class="tg good">${s.tag}</span>`:''}</div>${s.rows.join('')}</div>`).join('');
 const heldTxt=held.map(x=>x.h).filter(Boolean);
 const still=heldTxt.length?`<div class="scene"><div class="scw">📋 Still on your desk</div><div class="tiny muted" style="margin-top:6px">Nothing new on these since last week: ${esc(heldTxt.slice(0,5).join(' · '))}${heldTxt.length>5?` and ${heldTxt.length-5} more`:''}. They're all in <b>Needs your attention</b> on the Book screen.</div></div>`:'';
 const body=pre.join('')+out.join('')+post.join('');
 return `${head}${body}${desk}${still}${!body&&!desk&&!still?'<div class="card"><div class="muted">All quiet backstage. Go book a great show.</div></div>':''}
 <button class="btn" onclick="closeModal();go('book')">Start booking ▸</button><button class="btn sec" onclick="closeModal()">Close</button>`};
})();

/* ===================== MATCH & PROMO DETAILS (v183) =====================
   Booking shows what goes into a segment, not star math: four ingredients with five pips each, plus anything holding it
   back. Pips are bands drawn from the same preview rating the crowd-buzz tell uses; the exact numbers still come out
   after the show (bdReveal). */
(function(){
const pipH=(n,q)=>{if(q)return '<span class="pips q">? ? ? ? ?</span>';n=clamp(Math.round(n),0,5);return `<span class="pips"><b>${'●'.repeat(n)}</b><i>${'●'.repeat(5-n)}</i></span>`};
window.pipH=pipH;
const statP=v=>clamp(Math.round((v-55)/8),1,5);
window.statP=statP;
const chemP=c=>c>=10?5:c>=6?4:c>=3?3:c>=0?2:1;
const L=w=>w.name.split(' ').slice(-1)[0];
/* the four ingredients of a match */
function mdOf(m,sh){const r=rateMatch(m,{ppv:sh.ppv,allin:sh.ppv&&SUPER(S.week),preview:true});if(!r.bd||isSq(m))return {r,sq:true};
 const P=r.bd.parts;const v=i=>(P[i]&&P[i][1])||0;
 const ws=m.sides.flat().map(id=>S.w[id]).filter(Boolean);
 const story=v(2)+v(4)+v(13)+v(14)+Math.max(0,v(9));
 const pos=[[3,'stip'],[5,'chaos'],[6,'role'],[7,'traits'],[10,'fin'],[11,'occ'],[12,'ri']].map(([i,k])=>[k,v(i),P[i]&&P[i][0]]);
 const extras=pos.reduce((a,x)=>a+Math.max(0,x[1]),0);
 const p={talent:clamp(Math.round((r.bd.base-44)/4),1,5),chem:chemP(r.chem),story:story<=.5?0:clamp(Math.ceil(story/2.2),1,5),extras:clamp(Math.round(extras/1.5),0,5)};
 const back=[];
 const tired=ws.filter(w=>sta(w)<100-FAT_OK);if(tired.length)back.push(['b',`${tired.map(L).join(', ')} ${tired.length>1?'are':'is'} tired — a little slower tonight`]);
 const spent=ws.filter(w=>sta(w)>=100-FAT_OK&&sta(w)-fatGain(w,m,sh.ppv)<100-FAT_RISK);if(spent.length)back.push(['w',`${spent.map(L).join(', ')} will be spent after this`]);
 pos.forEach(([k,val,lab])=>{if(val<-.2)back.push(['b',k==='stip'?`${STIPS[stipKey(m)].n} doesn't suit their styles`:k==='fin'?`${lab} feels cheap here`:`${lab} works against it`])});
 if(r.chem<0)back.push(['b','They don\'t click in the ring']);
 if(ws.length===2&&ws[0].al===ws[1].al&&!m.tour&&!(ws[0].ring>=85&&ws[1].ring>=85))back.push(['w',`${ws[0].al==='f'?'Face vs face':'Heel vs heel'} — heat builds slowly`]);
 if(r.rep)back.push(['w',`Met last week — builds ${r.repLight?'75%':'half'} heat`]);
 if(r.stale)back.push(['w','The feud is stale and cooling']);
 ws.filter(w=>w.mor<SIT_MOR).forEach(w=>back.push(['w',`${L(w)} is unhappy and may go off-script`]));
 /* the why behind each row */
 const big=ws.length>2;const top=ws.slice().sort((a,b)=>b.pop-a.pop);
 const talentW=p.talent>=5?(big?`${top.slice(0,2).map(w=>w.name).join(' and ')} carry it`:'Two of your best workers and biggest names'):p.talent>=4?'Strong workers the crowd knows':p.talent>=3?'Good hands, mid-card names':'Still building in the ring and with the fans';
 const h=Math.round(r.heat);const fi=(()=>{let b=null;for(let i=0;i<m.sides.length;i++)for(let j=i+1;j<m.sides.length;j++)for(const a of m.sides[i])for(const c of m.sides[j]){const f=feudInfo(a,c);if(f&&(!b||f.h>b.h))b=f}return b})();
 const fh=fi?Math.round(fi.h):0;const storyW=[fi?(fi.h>=35?`Hot feud (heat ${fh}) — ready to pay off`:fi.h>=8?`${fi.t>=0?FTIER[fi.t][1].replace(/^[🔥 ]+/,''):'A feud is starting'} (heat ${fh}). A promo builds it`:`Seeds planted (heat ${fh})`):'No feud between them yet',
  m.title&&S.titles[m.title]?`${S.titles[m.title].n} title on the line`:'',v(14)?'Delivers a promised match':'',v(13)?'Boiling over after weeks of talk':'',v(9)>.3?'On a hot streak':''].filter(Boolean).join(' · ');
 const sk=stipKey(m);const ex=pos.filter(x=>x[1]>.2).map(x=>x[0]==='stip'?`${STIPS[sk].n} suits them`:x[0]==='occ'?(sh.ppv?'The big-show crowd':'A special occasion'):x[0]==='fin'?`${x[2]} adds drama`:x[2]);
 let extrasW=ex.length?ex.join(' · '):'Standard match, clean finish';
 if(sk==='std'&&!m.tour&&!isSp(m)&&m.type!=='gauntlet'){const best=Object.entries(STIPS).filter(([k,s])=>k!=='std'&&stipOk(k,m.type,sh.ppv)).map(([k,s])=>[k,ws.reduce((a,w)=>a+(s.b[w.st]||0),0)/ws.length]).sort((a,b)=>b[1]-a[1])[0];if(best&&best[1]>=3)extrasW+=` · ${STIPS[best[0]].n} would suit them`}
 return {r,p,back,talentW,storyW,extrasW}}
window.mdOf=mdOf;
const row=(k,pp,why,help,q)=>`<div class="drow"><span class="k">${k}${help?` <button class="qm" onclick="${help}" aria-label="How ${k.toLowerCase()} works">?</button>`:''}</span>${pipH(pp,q)}<span class="w">${why}</span></div>`;
const chipRow=(lab,l,g)=>l.length?`<div class="drow2"><span class="k ${g?'g':''}">${lab}</span><span>${l.map(([k,t])=>`<span class="tg ${k==='ok'?'good':k==='b'?'bad':'warnt'}" style="margin:2px 4px 2px 0">${k==='ok'?'✓ ':k==='b'?'✗ ':''}${esc(t)}</span>`).join('')}</span></div>`:'';
/* chips for a segment that isn't saved yet: try it on the card for a moment */
function chipsWith(i,seg){const c=S.card&&S.card.p;if(!c||i==null||!c[i])return [];const sv=c[i];let out=[];c[i]=Object.assign({},sv,{d:seg});
 try{(attnItems()||[]).forEach(x=>{if(!x.chip)return;try{const r=x.chip(i);if(r)out.push(r)}catch(e){}})}catch(e){}finally{c[i]=sv}return out}
/* the details block in the match editor */
window.matchDetails=function(m,sh,notes){const d=mdOf(m,sh);const r=d.r;
 if(d.sq)return `<div class="det"><div class="dh">Match details</div><div class="muted tiny" style="padding:8px 0">A squash is short: the winner's star power decides it.</div><div class="row sb" style="padding-top:8px;border-top:1px solid var(--line)"><span class="muted">Crowd buzz</span>${tellHtml(r,true)}</div>${notes||''}</div>`;
 const ws=m.sides.map(s=>s.map(id=>S.w[id]).filter(Boolean));let chem='';
 if(ws.length>=2&&ws[0][0]&&ws[1][0]){const a=ws[0][0],b=ws[1][0];chem=partsHtml(chemParts(a,b))+(metPair(a.id,b.id)?'':NEWPAIR)}
 const req=chipsWith(ED&&ED.i,m);
 return `<div class="det"><div class="dh">Match details</div>
 ${row('Talent',d.p.talent,esc(d.talentW))}
 ${row('Chemistry',d.p.chem,chem||esc(chemWord(r.chem)),'styChart()')}
 ${row('Story',d.p.story,esc(d.storyW))}
 ${row('Extras',d.p.extras,esc(d.extrasW))}
 ${chipRow('Requests',req,1)}${chipRow('Holding back',d.back)}
 ${notes||''}
 <div class="row sb" style="padding-top:10px;margin-top:4px;border-top:1px solid var(--line)"><span class="muted">Crowd buzz</span><span class="tellrow" style="margin:0">${tellHtml(r,true)}</span></div>
 <div class="tiny muted" style="margin-top:4px">The exact star breakdown still comes out after the show.</div>
 <details class="whyd" style="margin-top:8px"><summary>Full chemistry breakdown</summary>${whyMatch(m,sh)}</details></div>`};
/* the small pip strip on a booked slot */
window.slotPips=function(m,sh,i){let d;try{d=mdOf(m,sh)}catch(e){return ''}const ch=attnChips(i);
 return `${d.sq?'':`<div class="mpip"><div>Talent${pipH(d.p.talent)}</div><div>Chemistry${pipH(d.p.chem)}</div><div>Story${pipH(d.p.story)}</div><div>Extras${pipH(d.p.extras)}</div></div>`}${ch||(!d.sq&&d.back.length)?`<div class="tags">${ch}${d.sq?'':d.back.slice(0,2).map(([k,t])=>`<span class="tg ${k==='b'?'bad':'warnt'}">${esc(t)}</span>`).join('')}</div>`:''}`};

/* promos: talent on the mic, how well the segment fits them, the story behind it, and your live calls */
function pdOf(p){const A=S.w[p.a],B=p.b&&S.w[p.b];if(!A)return null;const mm=w=>w.mic+(hasT(w,'mouth')?8:0);
 const mic=B?mm(A)*.6+mm(B)*.4:mm(A),pop=B?(A.pop+B.pop)/2:A.pop;const t=mic*.45+pop*.3;const h=B?heatOf(A.id,B.id):0;
 const fitT=typeof promoFit==='function'?promoFit(p.type,A,B):'';const f=typeof promoFatigue==='function'&&B?promoFatigue({a:p.a,b:p.b,type:p.type}):{};
 const fit=f.rep?1:fitT?5:(PT[p.type]&&PT[p.type].b==='req'&&!B)?1:3;
 const back=[];if(f.rep)back.push(['b',`${f.msg||'Same segment as last week'} — half heat`]);[A,B].filter(Boolean).filter(w=>w.mor<SIT_MOR).forEach(w=>back.push(['w',`${L(w)} is unhappy and may go off-script`]));
 if(PT[p.type]&&PT[p.type].turn&&typeof turnWhip==='function'&&turnWhip(A))back.push(['b','Turned too recently — fans will have whiplash']);
 return {A,B,h,f,p:{talent:clamp(Math.round((t-40)/5),1,5),fit,story:B?(h<1?0:clamp(Math.ceil(h/20),1,5)):0},
  talentW:A.mic>=90?`${A.name} is one of your best talkers`:A.mic>=80?'Comfortable on the mic':A.mic>=70?'Gets by on the mic':'Not a natural talker yet',
  fitW:f.rep?'Same pairing and segment as last week':fitT||'Works fine. Nothing about this segment suits them especially',
  storyW:!B?'Solo segment — no rivalry to build':h>=35?`Hot feud (heat ${Math.round(h)})`:h>=1?`Feud heat ${Math.round(h)}`:'No feud between them yet',back}}
window.pdOf=pdOf;
const tellSpan=st=>{const t=tellOf(st);return `<span class="tell ${t[3]} big">${t[1]} ${t[2]}</span>`};
window.promoDetails=function(p){const d=pdOf(p);if(!d)return '';const req=chipsWith(typeof PE!=='undefined'&&PE?PE.i:null,{type:p.type,a:p.a,b:p.b||''});
 return `<div class="det"><div class="dh">Promo details</div>
 ${row('Talent',d.p.talent,esc(d.talentW))}${row('Fit',d.p.fit,esc(d.fitW))}${row('Story',d.p.story,esc(d.storyW))}${row('Your calls',0,'Decided live: the choices you make when it airs swing the rating up or down',null,1)}
 ${chipRow('Requests',req,1)}${chipRow('Holding back',d.back)}
 <div class="row sb" style="padding-top:10px;margin-top:4px;border-top:1px solid var(--line)"><span class="muted">Crowd buzz</span>${tellSpan(promoEst(p))}</div></div>`};
window.promoPips=function(p,i){const d=pdOf(p);if(!d)return '';const ch=attnChips(i);
 return `<div class="mpip"><div>Talent${pipH(d.p.talent)}</div><div>Fit${pipH(d.p.fit)}</div><div>Story${pipH(d.p.story)}</div><div>Your calls${pipH(0,1).replace('? ? ? ? ?','? ? ?')}</div></div>${ch||d.back.length?`<div class="tags">${ch}${d.back.slice(0,2).map(([k,t])=>`<span class="tg ${k==='b'?'bad':'warnt'}">${esc(t)}</span>`).join('')}</div>`:''}<div class="tellrow">${tellSpan(promoEst(p))}</div>`};

/* the strip under each wrestler in an editor: ability pips, morale, stamina, and what they're asking for */
window.edInfo=function(w,promo,gain,extra){if(!w)return '';const m=attnMood(w.mor);const mc=w.mor>=65?'good':w.mor>=50?'':w.mor>=35?'warnt':'bad';
 const sw=v=>v>=80?['Fresh','good']:v>=100-FAT_OK?['Worn','']:v>=100-FAT_RISK?['Tired','warnt']:['Exhausted','bad'];const s=sw(sta(w));const after=gain?sw(sta(w)-gain):null;
 const ask=typeof attnAsk==='function'?attnAsk(w.id):null;
 return `<div class="edi">${promo?`<span>Mic</span>${pipH(statP(w.mic))}`:`<span>Ring</span>${pipH(statP(w.ring))}`}<span>Star</span>${pipH(statP(w.pop))}<span>Morale</span><span class="${mc}">${m}</span><span>Stamina</span><span class="${s[1]} stv">${s[0]}${after&&after[0]!==s[0]?`<span class="muted"> → </span><span class="${after[1]}">${after[0]}</span>`:''}</span>${extra||''}${ask?`<span class="ask">🎤 ${esc(ask.t)}</span>`:''}</div>`};

/* the style chart behind Chemistry's "?" */
window.styChart=function(){const m=ED&&ED.m;const ws=m?m.sides.map(s=>s.map(id=>S.w[id]).filter(Boolean)):[];const a=ws[0]&&ws[0][0],b=ws[1]&&ws[1][0];const ks=Object.keys(STYLE_N);
 const word=v=>v>=6?['Clicks','c6']:v>=4?['Good','c4']:v>=2?['Okay','']:['Flat','c0'];
 openModal(`<div class="row sb"><div class="h mhd" style="margin:0">How chemistry works</div><button class="mini" onclick="renderMatchEd(true)">Back</button></div>
 <p class="muted tiny">Chemistry adds up a few things: styles that complement each other, a face against a heel, a good history from past matches, and traits like monster vs underdog. Pairs who have never shared a ring are judged on paper — their real chemistry shows after the first match.</p>
 <div style="overflow-x:auto"><table class="stygrid"><tr><th></th>${ks.map(k=>`<th>${STYLE_N[k]}</th>`).join('')}</tr>${ks.map(x=>`<tr><th>${STYLE_N[x]}</th>${ks.map(y=>{const w=word(STY[x][y]);return `<td class="${w[1]}${a&&b&&x===a.st&&y===b.st?' hi':''}">${w[0]}</td>`}).join('')}</tr>`).join('')}</table></div>
 ${a&&b?`<p class="tiny muted">Outlined: ${esc(a.name)} (${STYLE_N[a.st]}) against ${esc(b.name)} (${STYLE_N[b.st]}).</p>`:''}
 <p class="tiny muted">Face vs heel adds chemistry and builds heat faster. Two elite workers on the same side get a dream-match bonus instead.</p>
 <button class="btn" onclick="renderMatchEd(true)">Back to the match</button>`)};
})();
