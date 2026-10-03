/* Tony Khan Simulator — wrestler pitches (v97).
   Every couple of weeks someone on your roster knocks on the office door with an idea: a new character, a feud they
   want, a partner they click with, or a problem they need you to fix. You can give it a try (a short trial with a clear
   goal — hit it and it sticks), go for it (full commitment now: bigger upside, real risk), or let them down gently
   (costs some morale — less if they're happy, more if they're not). An unanswered pitch expires after a week.
   Pitches and trials are private to each GM in an online league. Loaded before the main script; everything here is
   only called once the game is running. */
'use strict';
const PITCH_LEN=3; /* weeks a trial runs */
const PCH={try:{i:'🧪',n:'Give it a try'},go:{i:'🚀',n:'Go for it'},no:{i:'🤝',n:'Let them down gently'}};
const PSTAR=v=>`${v}★`;
/* ---- small helpers ---- */
function pOwn(id){const w=S.w[id];return w&&w.own==='p'?w:null}
function pFree(w){return w&&w.own==='p'&&!w.inj}
function pLast(w){return w.name.split(' ').slice(-1)[0]}
function pNote(notes,t){S.pitchNews=(S.pitchNews||[]).concat([{w:AW(),t}]).slice(-12);if(notes&&!ON())notes.push(t)}
function pBusy(id){return (S.trials||[]).some(t=>t.a===id||t.b===id)||(S.pitch&&(S.pitch.a===id||S.pitch.b===id))}
function pRecent(id){return S.pitchBy&&S.pitchBy[id]&&AW()-S.pitchBy[id]<8}
function pPool(){return ownList('p').filter(w=>!w.inj&&!pBusy(w.id)&&!pRecent(w.id))}
function pMorCut(w,base){return Math.round(base*(w.mor<40?1.5:w.mor>=75?.5:1))}
function pCost(){return Math.max(15,Math.round(econCap()*.08/5)*5)}
function pTeamOf(a,b){return S.teams.find(t=>t.trialOf===a+'|'+b)}
/* ---- the pitch types. pick(pool) → context or null; text uses {A} {B} {X}. try() returns a trial; go() returns the result text ---- */
const PITCHES={
 turn:{cat:'🎭 New direction',w:2,
  pick:r=>{const l=r.filter(w=>!turnWhip(w)&&w.pop>=35&&(w.mor<65||w.pop<75));return l.length?{a:pick(l).id}:null},
  text:x=>x.A.al==='f'?[`"I'm tired of smiling for the cameras. The fans think they know me — let me show them who I really am."`,`"Being the good guy isn't working. I want to go heel. Trust me, I've got a nasty streak nobody's seen."`]
   :[`"Have you heard the crowd lately? They're starting to cheer me. Let me turn and give them what they want."`,`"I'm done being the bad guy. I think I can be the hero this place needs."`],
  head:x=>`${x.A.name} wants to turn ${x.A.al==='f'?'heel':'face'}`,
  try:{d:x=>`They turn now. Give them ${PITCH_LEN-1} segments at ${PSTAR(3)}+ in ${PITCH_LEN} weeks and it sticks with a popularity boost. If not, they quietly turn back — no whiplash.`,
   start:x=>{pTurn(x.A,true);return {goal:'seg',need:2,min:3,txt:`${PITCH_LEN-1} segments at ${PSTAR(3)}+`,prevT:x.prevT}}},
  go:{d:x=>`They turn for good, starting tonight. They're thrilled — but the crowd might not buy it right away (better odds with a good talker).`,
   fx:x=>{pTurn(x.A,false);mor(x.A,12);if(Math.random()<.35+x.A.mic/200){popx(x.A,5);return `${x.A.name} is now a ${x.A.al==='f'?'face':'heel'} — and the fans are all in (+5 popularity).`}popx(x.A,-4);return `${x.A.name} is now a ${x.A.al==='f'?'face':'heel'}. The crowd isn't sure yet (−4 popularity), but ${x.A.name} is fired up.`}},
  ok:t=>{const A=pOwn(t.a);popx(A,4);mor(A,10);return `🔄 The turn clicked: ${A.name} is a ${A.al==='f'?'face':'heel'} for good (+4 popularity).`},
  fail:t=>{const A=pOwn(t.a);if(A.al===t.al){A.al=A.al==='f'?'h':'f';A.turnW=t.prevT}mor(A,-4);return `🔄 The turn didn't get a real chance — ${A.name} quietly goes back to being a ${A.al==='f'?'face':'heel'}.`},
  no:3},
 trait:{cat:'🎭 New direction',w:2,
  pick:r=>{const opts=[];r.forEach(w=>{const have=w.tr||[];if(have.length>=4)return;
    [['mouth',w.mic>=62],['crowd',w.al==='f'&&w.pop<80],['bigm',w.pop>=68],['heatm',w.al==='h'],['story',w.ring>=78],['dare',w.st==='fl'||w.st==='sh'],['work',true],['tag',S.teams.some(t=>t.m.includes(w.id))]]
     .forEach(([k,ok])=>{if(ok&&TRAITS[k]&&!have.includes(k))opts.push({a:w.id,tr:k})})});return opts.length?pick(opts):null},
  text:x=>[{mouth:`"I've been working with a promo coach on the side. Put a mic in my hand and I'll show you something new."`,crowd:`"The kids at the signings go crazy for me. Let me lean into that — high fives, the whole thing."`,bigm:`"The bigger the stage, the better I get. I want to prove it."`,heatm:`"Nobody gets under people's skin like me. Let me show you."`,story:`"I've been studying tape every night. I know how to tell a story in there now."`,dare:`"I've got a few new spots in my back pocket. They're insane. You're going to love them."`,work:`"I've completely changed my training. I can go twice as hard now — try me."`,tag:`"I've been studying the great tag teams. I know how to be the perfect partner now."`}[x.tr]],
  head:x=>`${x.A.name} wants to show off a new skill: ${TRAITS[x.tr].i} ${TRAITS[x.tr].n}`,
  try:{d:x=>`Give them ${x.tr==='mouth'?'2 promos':'2 matches'} at ${PSTAR(3)}+ in ${PITCH_LEN} weeks and they earn ${TRAITS[x.tr].n} (${TRAITS[x.tr].d.split('.')[0].toLowerCase()}).`,
   start:x=>({goal:'seg',need:2,min:3,kind:x.tr==='mouth'?'promo':'match',tr:x.tr,txt:`${x.tr==='mouth'?'2 promos':'2 matches'} at ${PSTAR(3)}+`})},
  go:{d:x=>`Bring in a specialist coach for ${money(pCost())}. They get ${TRAITS[x.tr].n} right away.`,cost:()=>pCost(),
   fx:x=>{S.money.p-=pCost();x.A.tr=(x.A.tr||[]).concat([x.tr]);mor(x.A,8);return `${x.A.name} spends the week with a specialist and comes back with a new edge: ${TRAITS[x.tr].i} ${TRAITS[x.tr].n}.`}},
  ok:t=>{const A=pOwn(t.a);if(!hasT(A,t.tr))A.tr=(A.tr||[]).concat([t.tr]);mor(A,8);return `✨ ${A.name} proved it — they've earned ${TRAITS[t.tr].i} ${TRAITS[t.tr].n}.`},
  fail:t=>{const A=pOwn(t.a);mor(A,-4);return `✨ ${A.name} didn't get the chance to show their new skill. Maybe next time.`},
  no:2},
 wacky:{cat:'🎭 New direction',w:1.5,
  pick:r=>{if(typeof GIMMICKS==='undefined')return null;const used=new Set(Object.values(S.w).map(w=>w.gim).filter(Boolean));const l=r.filter(w=>!w.gim&&w.pop<72&&(w.mor<60||w.ring<75||Math.random()<.3));if(!l.length)return null;const w=pick(l);
   const gs=GIMMICKS.filter(g=>!used.has(g.k)&&g.g===w.g);if(!gs.length)return null;return {a:w.id,gim:pick(gs).k}},
  text:x=>{const g=pGim(x.gim);return [`${esc(x.A.name)} bursts into your office with a sketchbook. "Hear me out: from now on, I'm <b>${esc(g.n)}</b>." ${esc(g.bio)}`]},
  head:x=>`${x.A.name} has a wild new character idea`,
  try:{d:x=>`They debut the character for ${PITCH_LEN} weeks. Two segments at ${PSTAR(2.5)}+ and it's a hit. If it flops, you quietly drop it (a small popularity hit).`,
   start:x=>{x.A.gim=x.gim;return {goal:'seg',need:2,min:2.5,gim:x.gim,txt:`2 segments at ${PSTAR(2.5)}+`}}},
  go:{d:x=>`Commit to the bit, starting tonight. It could be a merch goldmine — or a punchline you're stuck with.`,
   fx:x=>{x.A.gim=x.gim;const g=pGim(x.gim);if(Math.random()<.45+x.A.mic/400+x.A.pop/400){popx(x.A,8);mor(x.A,15);const c=Math.round(econCap()*.06);S.money.p+=c;return `${x.A.name} debuts as ${g.n} and the crowd loses its mind. The shirts sell out (+8 popularity, +${money(c)}).`}
    popx(x.A,-5);mor(x.A,6);return `${x.A.name} debuts as ${g.n}. The crowd is… confused (−5 popularity). ${x.A.name} is having the time of their life, though.`}},
  ok:t=>{const A=pOwn(t.a);popx(A,6);mor(A,12);return `🎭 It's a hit! ${A.name}'s new character is here to stay (+6 popularity).`},
  fail:t=>{const A=pOwn(t.a);if(A.gim===t.gim)delete A.gim;popx(A,-2);mor(A,-5);return `🎭 The new character never caught on. ${A.name} quietly goes back to their old look.`},
  no:3},
 feud:{cat:'🔥 Feud request',w:2,
  pick:r=>{const l=[];r.forEach(a=>{if(a.pop<45)return;r.forEach(b=>{if(a===b||a.g!==b.g||inTeam(a.id,b.id)||heatOf(a.id,b.id)>=15||beefOf(a.id,b.id)>=BEEF_MIN)return;
    const v=(a.al!==b.al?20:0)+chemOpp(a,b)*3+Math.min(15,Math.abs(a.pop-b.pop)<15?10:0)+Math.random()*25;l.push([a,b,v])})});l.sort((x,y)=>y[2]-x[2]);return l.length?{a:l[0][0].id,b:l[0][1].id}:null},
  text:x=>[`"${x.B.name}. Put me in there with ${pLast(x.B)} and I'll make it the feud of the year."`,`"Everybody backstage knows ${x.B.name} and I don't get along. Let's put it on TV."`,`"I've watched ${x.B.name} coast for weeks. Give me ${pLast(x.B)} and I'll prove I'm better."`],
  head:x=>`${x.A.name} wants a feud with ${x.B.name}`,
  try:{d:x=>`Seed it with a little heat. Put them together (a match or a promo) twice in ${PITCH_LEN} weeks and it takes off.`,
   start:x=>{bumpHeat(x.A.id,x.B.id,12,[],`${x.A.name} asked for it`);return {goal:'pair',need:2,txt:'2 segments together'}}},
  go:{d:x=>`Start it with a bang: big heat right away and a very happy ${pLast(x.A)}. ${x.B.name} might not love being picked.`,
   fx:x=>{bumpHeat(x.A.id,x.B.id,28,[],`${x.A.name} asked for it`);mor(x.A,10);let t=`${x.A.name} vs ${x.B.name} is on — and it's already heated.`;if(x.A.al===x.B.al&&Math.random()<.4){mor(x.B,-6);t+=` ${x.B.name} isn't thrilled about it.`}return t}},
  ok:t=>{const A=pOwn(t.a),B=pOwn(t.b);bumpHeat(t.a,t.b,15,[],'the feud took off');mor(A,8);return `🔥 ${A.name} vs ${B.name} took off — this is a real feud now (+15 heat).`},
  fail:t=>{const A=pOwn(t.a);mor(A,-5);return `🔥 ${A.name} never got their shot at ${S.w[t.b]?S.w[t.b].name:'their rival'}.`},
  no:2},
 partner:{cat:'🤝 Tag team idea',w:1.5,
  pick:r=>{const l=[];r.forEach(a=>r.forEach(b=>{if(a.id>=b.id||a.g!==b.g||inTeam(a.id,b.id)||heatOf(a.id,b.id)>=15||beefOf(a.id,b.id)>=20)return;l.push([a,b,chemTeam(a,b)*4+(a.al===b.al?8:0)+Math.random()*20])}));
   l.sort((x,y)=>y[2]-x[2]);if(!l.length)return null;const [a,b]=Math.random()<.5?[l[0][0],l[0][1]]:[l[0][1],l[0][0]];return {a:a.id,b:b.id}},
  text:x=>[`"Me and ${x.B.name}? We'd tear the tag division apart."`,`"I've been training with ${x.B.name} on off days. We've got double-team moves nobody's seen."`,`"${x.B.name} and I are the best of friends backstage. Let's make it official."`],
  head:x=>`${x.A.name} wants to team with ${x.B.name}`,
  try:{d:x=>`They team up on a trial basis. Two tag matches together at ${PSTAR(2.75)}+ in ${PITCH_LEN} weeks and they're an official team.`,
   start:x=>{S.teams.push({id:'t'+(S.nid++),n:`${pLast(x.A)} & ${pLast(x.B)}`,type:'team',m:[x.A.id,x.B.id],trialOf:x.A.id+'|'+x.B.id});return {goal:'team',need:2,min:2.75,txt:`2 tag matches together at ${PSTAR(2.75)}+`}}},
  go:{d:x=>`Make it official now: a new tag team with a head start on chemistry. Sometimes partners clash.`,
   fx:x=>{S.teams.push({id:'t'+(S.nid++),n:`${pLast(x.A)} & ${pLast(x.B)}`,type:'team',m:[x.A.id,x.B.id]});const k=key(x.A.id,x.B.id);mor(x.A,8);mor(x.B,8);
    if(Math.random()<.2){S.chem[k]=clamp((S.chem[k]||0)-1,-5,6);return `${pLast(x.A)} & ${pLast(x.B)} are a team — though they're already arguing about whose entrance music to use.`}S.chem[k]=clamp((S.chem[k]||0)+1.5,-5,6);return `${pLast(x.A)} & ${pLast(x.B)} are officially a team, and they've already got chemistry.`}},
  ok:t=>{const tm=pTeamOf(t.a,t.b);if(tm)delete tm.trialOf;const A=pOwn(t.a),B=pOwn(t.b);const k=key(t.a,t.b);S.chem[k]=clamp((S.chem[k]||0)+2,-5,6);mor(A,8);mor(B,8);return `🤝 ${pLast(A)} & ${pLast(B)} are an official team now — and their chemistry is better than ever.`},
  fail:t=>{const tm=pTeamOf(t.a,t.b);if(tm)S.teams=S.teams.filter(x=>x!==tm);const A=pOwn(t.a);mor(A,-4);return `🤝 The ${A.name} and ${S.w[t.b]?S.w[t.b].name:'partner'} team never really got going, so they've gone their separate ways.`},
  no:2},
 buried:{cat:'🧩 A problem',w:3,
  pick:r=>{const l=r.filter(w=>w.pop>=58&&w.mor<70&&((w.lme!=null&&AW()-w.lme>=5&&w.pop>=70)||S.week-(w.last||0)>=2));return l.length?{a:l.sort((a,b)=>a.mor-b.mor)[0].id}:null},
  text:x=>[`"I've been ${S.week-(x.A.last||0)>=2?'sitting in catering for weeks':'stuck in the middle of the card for weeks'}. Am I still part of your plans?"`,`"I see my name on the board and it's always in the same spot. What do I have to do to get a real chance?"`],
  head:x=>`${x.A.name} feels buried`,
  try:{d:x=>`Promise them a bigger role: two segments at ${PSTAR(3)}+ in ${PITCH_LEN} weeks.`,start:x=>({goal:'seg',need:2,min:3,txt:`2 segments at ${PSTAR(3)}+`})},
  go:{d:x=>`"You're main eventing within two weeks." A big morale boost if you deliver — and a broken promise if you don't.`,
   start:x=>({goal:'me',need:1,len:2,txt:'main event a show within 2 weeks',big:1}),fx:null},
  ok:t=>{const A=pOwn(t.a);mor(A,t.big?20:15);popx(A,t.big?3:2);return `🧩 ${A.name} got the spot you promised and made the most of it.`},
  fail:t=>{const A=pOwn(t.a);mor(A,t.big?-15:-10);return t.big?`🧩 You promised ${A.name} a main event and didn't deliver. They won't forget it.`:`🧩 ${A.name} is still waiting for that bigger role.`},
  no:3},
 shot:{cat:'🧩 A problem',w:2,
  pick:r=>{const l=[];r.forEach(w=>{if(w.pop<62||isChamp(w.id))return;Object.values(S.titles).forEach(t=>{if(t.kind!=='singles'||!t.holders.length)return;const h=S.w[t.holders[0]];if(h&&h.own==='p'&&h.g===w.g&&h!==w&&!h.inj)l.push({a:w.id,title:t.id})})});return l.length?pick(l):null},
  text:x=>[`"I've beaten everyone you've put in front of me. I want a shot at the ${S.titles[x.title].n} title."`,`"The ${S.titles[x.title].n} title should be around my waist. Give me one shot."`],
  head:x=>`${x.A.name} wants a shot at the ${S.titles[x.title]?S.titles[x.title].n:''} title`,
  try:{d:x=>`"Win two matches in ${PITCH_LEN} weeks and you're next in line." They'll feel it's earned.`,start:x=>({goal:'wins',need:2,txt:'2 wins'})},
  go:{d:x=>`"You've got it." Put them in a match for the ${S.titles[x.title].n} title within ${PITCH_LEN} weeks — a huge boost if you deliver, a broken promise if you don't.`,
   start:x=>({goal:'title',need:1,title:x.title,txt:`a match for the ${S.titles[x.title].n} title`,big:1}),fx:null},
  ok:t=>{const A=pOwn(t.a);mor(A,t.big?15:10);popx(A,2);return t.big?`🏆 ${A.name} got their title shot, as promised.`:`🏆 ${A.name} earned it — they're the clear number one contender (+2 popularity).`},
  fail:t=>{const A=pOwn(t.a);mor(A,t.big?-15:-6);return t.big?`🏆 ${A.name} never got the title shot you promised.`:`🏆 ${A.name} came up short of earning a title shot.`},
  no:3},
 rest:{cat:'🧩 A problem',w:3,
  pick:r=>{const busy=new Set();for(const k in TOURS){const D=TOURS[k];if(S.week>=tourFirst(D)-1&&S.week<=D.final)(tourState('p',k).ent||[]).forEach(id=>busy.add(id))}(S.promises||[]).forEach(pr=>{if(pr.week<=S.week+1){busy.add(pr.a);busy.add(pr.b)}});const l=r.filter(w=>w.fat>=45&&!busy.has(w.id));return l.length?{a:l.sort((a,b)=>b.fat-a.fat)[0].id}:null},
  text:x=>[`"I'm running on fumes. My body needs a week."`,`"Everything hurts. I'll keep going if you need me to, but I need a break."`],
  head:x=>`${x.A.name} needs a break`,
  try:{d:x=>`Keep them out of the ring this week (a promo is fine). They come back fresh and grateful.`,start:x=>({goal:'rest',need:0,len:1,txt:'no matches this week'})},
  go:{d:x=>`Send them home for two full weeks. They'll be completely recharged and very happy — but you're without them.`,
   fx:x=>{x.A.inj=2;x.A.susp=false;x.A.fat=0;mor(x.A,12);return `${x.A.name} heads home to rest for two weeks. They'll come back completely recharged.`}},
  ok:t=>{const A=pOwn(t.a);A.fat=Math.max(0,A.fat-35);mor(A,8);return `🛌 ${A.name} took the week off and is feeling much better.`},
  fail:t=>{const A=pOwn(t.a);mor(A,-10);return `🛌 You told ${A.name} to rest, then put them in a match anyway. They're not happy.`},
  no:2},
 beef:{cat:'🧩 A problem',w:3,
  pick:r=>{const l=[];r.forEach(a=>r.forEach(b=>{if(a!==b&&a.mor<=b.mor&&beefOf(a.id,b.id)>=20)l.push([a,b,beefOf(a.id,b.id)])}));l.sort((x,y)=>y[2]-x[2]);return l.length?{a:l[0][0].id,b:l[0][1].id}:null},
  text:x=>[`"I can't work with ${x.B.name}. Every time we're in the same building it gets ugly."`,`"Either ${pLast(x.B)} goes or I'm going to do something I regret."`],
  head:x=>`${x.A.name} has a problem with ${x.B.name}`,
  try:{d:x=>`Keep them apart for ${PITCH_LEN} weeks (no shared matches or promos). The real heat cools way down.`,start:x=>({goal:'avoid',need:0,txt:'keep them apart'})},
  go:{d:x=>`Sit them both down and clear the air. It might work… or it might get loud.`,
   fx:x=>{if(Math.random()<.55){addBeef(x.A.id,x.B.id,-40);mor(x.A,5);mor(x.B,5);return `${x.A.name} and ${x.B.name} talked it out. They'll never be friends, but they're professionals again.`}addBeef(x.A.id,x.B.id,15);mor(x.A,-6);return `The meeting got loud. Doors were slammed. ${x.A.name} and ${x.B.name} are worse than before.`}},
  ok:t=>{const A=pOwn(t.a);addBeef(t.a,t.b,-25);mor(A,6);return `🧊 Time apart helped — ${A.name} and ${S.w[t.b]?S.w[t.b].name:'their rival'} have cooled off.`},
  fail:t=>{const A=pOwn(t.a);addBeef(t.a,t.b,10);mor(A,-6);return `🧊 You promised to keep them apart, then put ${A.name} in a segment with ${S.w[t.b]?S.w[t.b].name:'them'}. It made things worse.`},
  no:2}};
function pGim(k){return (typeof GIMMICKS!=='undefined'&&GIMMICKS.find(g=>g.k===k))||{n:'a brand new character',bio:''}}
function pTurn(w,trial){w.al=w.al==='f'?'h':'f';w.turnW=AW();news(`🔄 ${w.name} has turned ${w.al==='f'?'FACE':'HEEL'}${trial?' (trial run)':''}.`)}
function pCtx(p){const x=Object.assign({},p);x.A=S.w[p.a];x.B=p.b?S.w[p.b]:null;return x}
/* ---- weekly tick: expire the open pitch, end trials that ran out of time, maybe bring a new pitch ---- */
function pitchTick(notes){if(S.phase!=='season')return;bothSides(()=>pitchTickOne(notes))}
function pitchTickOne(notes){S.trials=S.trials||[];
 const p=S.pitch;if(p&&AW()>p.w){const A=S.w[p.a];S.pitch=null;if(A&&A.own==='p'){const P=PITCHES[p.k];mor(A,-pMorCut(A,(P?P.no:2)*3));pNote(notes,`📨 ${A.name} never heard back about their idea and took it as a no.`)}}
 S.trials=S.trials.filter(t=>{const P=PITCHES[t.k];if(!P)return false;if(t.k==='partner'&&!pTeamOf(t.a,t.b))return false;if(!pOwn(t.a)||(t.b&&!pOwn(t.b))){if(t.k==='partner'){const tm=pTeamOf(t.a,t.b);if(tm)S.teams=S.teams.filter(x=>x!==tm)}return false}
  if(AW()>t.end){const good=t.goal==='rest'||t.goal==='avoid';pNote(notes,good?P.ok(t):P.fail(t));return false}return true});
 if(!S.pitch&&S.week>=2&&S.week<SEASON&&AW()-(S.pitchLast||0)>=2&&Math.random()<.65)pitchGen()}
function pitchGen(){const r=pPool();if(r.length<4)return;const keys=Object.keys(PITCHES);
 for(let n=0;n<6;n++){const k=wpick(keys.filter(k=>!(S.pitchK||[]).slice(-2).includes(k)),k=>PITCHES[k].w);if(!k)return;const c=PITCHES[k].pick(r);if(!c)continue;
  S.pitch=Object.assign({k,w:AW()},c);S.pitchLast=AW();S.pitchBy=S.pitchBy||{};S.pitchBy[c.a]=AW();S.pitchK=(S.pitchK||[]).concat([k]).slice(-4);return}}
/* ---- answering ---- */
function pitchChoices(p){const P=PITCHES[p.k],x=pCtx(p);const A=x.A;const cut=pMorCut(A,P.no*3);
 return [{k:'try',d:P.try.d(x)},{k:'go',d:P.go.d(x),cost:P.go.cost?P.go.cost():0},{k:'no',d:`${A.name} loses ${cut} morale${A.mor>=75?' (they\'re happy enough to shrug it off)':A.mor<40?' (they\'re already unhappy, so it stings)':''}.`}]}
function pitchStart(p,spec){const len=spec.len||PITCH_LEN;const t=Object.assign({k:p.k,a:p.a,b:p.b||null,start:AW(),end:AW()+len-1,have:0,al:S.w[p.a].al},spec);S.trials=(S.trials||[]).concat([t]);return t}
function pitchChoose(k){if(typeof mpLocked==='function'&&mpLocked())return;const p=S.pitch;if(!p||!PITCHES[p.k])return closeModal();const P=PITCHES[p.k];const x=pCtx(p);if(!x.A||x.A.own!=='p'){S.pitch=null;save();return closeModal()}
 let txt='';x.prevT=x.A.turnW;
 if(k==='try'){const sp=P.try.start(x);sp.prevT=x.prevT;const t=pitchStart(p,sp);mor(x.A,4);txt=`${PCH.try.i} Trial on: ${x.A.name} has ${t.end-t.start+1} week${t.end>t.start?'s':''} — the goal is ${t.txt}. You'll see the progress in your weekly briefing.`}
 else if(k==='go'){if(P.go.cost&&S.money.p<P.go.cost()){toast('Not enough money for that.');return}
  if(P.go.start){const sp=P.go.start(x);const t=pitchStart(p,sp);mor(x.A,10);txt=`${PCH.go.i} Promise made: ${t.txt}. ${x.A.name} is fired up — don't let them down.`}else txt=`${PCH.go.i} ${P.go.fx(x)}`}
 else{const cut=pMorCut(x.A,P.no*3);mor(x.A,-cut);txt=`${PCH.no.i} You let ${x.A.name} down gently. They understand — mostly (−${cut} morale).`}
 S.pitch=null;S.pitchNews=(S.pitchNews||[]).concat([{w:AW(),t:txt}]).slice(-12);save();render();
 openModal(`<div class="h mhd">📨 ${esc(P.head(x))}</div><div class="duo" style="align-items:center">${face(x.A)}${x.B?face(x.B):''}</div><div class="outcome ok">${esc(txt)}</div><button class="btn" onclick="openBrief()">Back to the briefing</button><button class="btn sec" onclick="closeModal()">Back to work</button>`)}
function openPitch(){const p=S.pitch;if(!p||!PITCHES[p.k])return;const P=PITCHES[p.k],x=pCtx(p);if(!x.A||x.A.own!=='p'){S.pitch=null;save();return}
 const said=P.text(x);const line=said[(p.v!=null?p.v:(p.v=RI(0,said.length-1)))%said.length];
 openModal(`<div class="muted"><span class="live-tag" style="background:var(--gold);color:#111">PITCH</span>${esc(P.cat)} · expires after this week</div><div class="h mhd mt">${esc(P.head(x))}</div><div class="duo" style="align-items:center">${face(x.A)}${x.B?face(x.B):''}</div><p class="scene">${p.k==='wacky'?line:esc(line)}</p>
 <div class="muted tiny" style="margin-bottom:8px">${esc(x.A.name)} · morale ${Math.round(x.A.mor)} · POP ${Math.round(x.A.pop)} · ${x.A.al==='f'?'Face':'Heel'}</div>
 ${pitchChoices(p).map((c,i)=>`<button class="choice" ${c.cost&&S.money.p<c.cost?'disabled':''} onclick="pitchChoose('${c.k}')"><span class="key"><span>${'ABC'[i]}</span></span><div>${PCH[c.k].i} ${PCH[c.k].n}</div><div class="muted tiny">${esc(c.d)}</div></button>`).join('')}
 <button class="btn ghost" onclick="openBrief()">Decide later</button>`)}
/* ---- trial progress, called after every segment airs ---- */
function pitchSeg(seg,notes0){const l=S.trials;if(!l||!l.length)return;const ids=seg.sides.flat().filter(Boolean);
 const notes={push:t=>{notes0.push(t);S.pitchNews=(S.pitchNews||[]).concat([{w:AW(),t}]).slice(-12)}};
 S.trials=l.filter(t=>{if(!ids.includes(t.a))return true;const P=PITCHES[t.k];if(!P||!pOwn(t.a))return true;
  const side=s=>seg.sides.findIndex(x=>x.includes(s));let hit=false;
  if(t.goal==='seg')hit=seg.stars>=t.min&&(!t.kind||t.kind===seg.kind);
  else if(t.goal==='pair')hit=!!t.b&&ids.includes(t.b);
  else if(t.goal==='team')hit=seg.kind==='match'&&!!t.b&&side(t.a)===side(t.b)&&seg.stars>=t.min;
  else if(t.goal==='wins')hit=seg.kind==='match'&&seg.won&&seg.won.includes(t.a);
  else if(t.goal==='me')hit=seg.kind==='match'&&seg.pos==='me';
  else if(t.goal==='title')hit=seg.kind==='match'&&seg.title===t.title;
  else if(t.goal==='rest'){if(seg.kind!=='match')return true;notes.push(P.fail(t));return false}
  else if(t.goal==='avoid'){if(t.b&&ids.includes(t.b)){notes.push(P.fail(t));return false}return true}
  if(t.k==='turn'&&S.w[t.a].al!==t.al)return false;
  if(hit){t.have=(t.have||0)+1;if(t.have>=t.need){notes.push(P.ok(t));return false}}return true})}
/* ---- briefing sections ---- */
function pitchBrief(){const sec=[];const p=S.pitch;
 if(p&&PITCHES[p.k]&&pOwn(p.a)){const P=PITCHES[p.k],x=pCtx(p);sec.push({i:'📨',t:'A pitch for you',tag:'New',rows:[`<div class="brow pitchrow" onclick="openPitch()"><span>${face(x.A)}</span><span><b>${esc(P.head(x))}</b><br><span class="muted tiny">${esc(P.cat)} · answer this week or they'll take it as a no</span></span><span class="gold">›</span></div>`]})}
 const tl=(S.trials||[]).filter(t=>PITCHES[t.k]&&pOwn(t.a));
 if(tl.length)sec.push({i:'🧪',t:'Trials and promises',rows:tl.map(t=>{const A=S.w[t.a],B=t.b&&S.w[t.b];const left=t.end-AW()+1;const P=PITCHES[t.k];
   const prog=t.goal==='rest'||t.goal==='avoid'?'':` · <b>${t.have||0}/${t.need}</b>`;
   return `<div class="brow"><b>${esc(P.head(pCtx(t)))}</b><br><span class="muted tiny">Goal: ${esc(t.txt)}${prog} · ${left<=1?'<b class="bad">last week</b>':`${left} weeks left`}${t.big?' · 🚀 you promised':''}</span></div>`})});
 const nw=(S.pitchNews||[]).filter(n=>AW()-n.w<=1&&n.w<AW());
 if(nw.length)sec.push({i:'📬',t:'How last week\'s calls turned out',rows:nw.map(n=>`<div class="brow tiny">${esc(n.t)}</div>`)});
 return sec}
