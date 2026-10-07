/* Tony Khan Simulator — between-show event pack 2 (v141): a big new round of front office situations and opportunities
   so the weeks between shows repeat less. Same shape as CRISES in index.html:
     t, i (emoji), good (opportunity), need:2 (needs a second wrestler {B}), text, ch:[{t,d,fx(c)}]
   plus two optional fields this pack adds:
     who(r)  → picks [A,B] from r (your healthy roster); return null if the event doesn't fit right now and another is drawn
     vars    → list of variants; one is chosen per event and fills {VAR}
   Loaded after the main script and merged into CRISES. */
'use strict';
(function(){
const has=(w,t)=>(w.tr||[]).includes(t);
const shuf=a=>shuffle(a.slice());
const chemx=(a,b,d)=>{const k=key(a.id,b.id);S.chem[k]=clamp((S.chem[k]||0)+d,-5,6)};
const momx=(w,d)=>w.mom=clamp((w.mom||0)+d,-5,5);
const pair=(r,ok)=>{for(const a of shuf(r))for(const b of shuf(r))if(a!==b&&!inTeam(a.id,b.id)&&(!ok||ok(a,b)))return [a,b];return null};

const CR2={
/* ---------------- opportunities ---------------- */
airport:{t:'The sign at the airport',i:'🪧',good:true,who:r=>{const a=shuf(r.filter(w=>w.pop<62))[0];return a?[a]:null},
 text:'A kid was waiting at arrivals with a homemade poster that read "{A} IS MY FAVORITE WRESTLER." {A} stopped and talked with them for ten minutes. The video is making the rounds.',ch:[
 {t:'Bring the kid to Dynamite',d:'A feel-good moment on TV. Great for a face, awkward for a heel.',fx:c=>{if(c.A.al==='h'){popx(c.A,1);mor(c.A,4);return `${c.A.name} tries to stay mean on camera and fails completely. The crowd doesn't know how to feel.`}popx(c.A,5);fansx(3000);momx(c.A,1);return `The crowd melts. ${c.A.name}'s merch line doubles by the end of the night (+5 popularity).`}},
 {t:'Send the family a signed care package',d:'Quiet, kind, and {A} appreciates it.',fx:c=>{S.money.p-=5;mor(c.A,8);popx(c.A,2);return `The family posts the unboxing. ${c.A.name} is touched you did it.`}},
 {t:'Let the clip speak for itself',d:'A small bump.',fx:c=>{popx(c.A,2);return `The clip runs its course. A few more fans know ${c.A.name}'s name now.`}}]},

charity:{t:'Hospital visit',i:'🏥',good:true,text:'{A} quietly spent the off day visiting a children\'s hospital — no cameras, no announcement. A nurse posted about it and it\'s spreading.',ch:[
 {t:'Match it with a company donation ($50K)',d:'Fans and the locker room notice.',fx:c=>{S.money.p-=50;fansx(8000);mor(c.A,10);ownList('p').forEach(w=>{if(w!==c.A)mor(w,2)});return `The donation makes the local news. Fans and wrestlers alike respect it.`}},
 {t:'Feature it on TV',d:'Big for popularity — but {A} didn\'t do it for attention.',fx:c=>{popx(c.A,5);if(Math.random()<.4){mor(c.A,-6);return `The package plays well (+5 popularity), but ${c.A.name} wishes it had stayed private.`}return `A short package airs. The crowd gives ${c.A.name} a standing ovation (+5 popularity).`}},
 {t:'Thank them privately',d:'{A} feels respected.',fx:c=>{mor(c.A,8);popx(c.A,1);return `A handwritten note from the office. ${c.A.name} keeps it in their bag.`}}]},

movie:{t:'Hollywood calling',i:'🎬',good:true,who:r=>{const a=shuf(r.filter(w=>w.pop>=70&&!isChamp(w.id)))[0];return a?[a]:null},
 text:'A studio wants {A} for a supporting role in an action movie. Filming would keep them away for three weeks.',ch:[
 {t:'Let them go — the exposure is worth it',d:'{A} misses 3 weeks but comes back a bigger star.',fx:c=>{c.A.inj=Math.max(c.A.inj||0,3);popx(c.A,6);mor(c.A,12);fansx(10000);S.money.p+=40;return `${c.A.name} heads to set. The trailer drops a week later and new fans tune in (+6 popularity, +$40K).`}},
 {t:'Negotiate: shoot around the TV schedule',d:'Could work. Could leave {A} exhausted.',fx:c=>{if(Math.random()<.55){popx(c.A,4);mor(c.A,6);return `The studio agrees. ${c.A.name} films on off days and never misses a show (+4 popularity).`}c.A.fat=Math.min(100,(c.A.fat||0)+30);mor(c.A,-4);return `The schedule is brutal. ${c.A.name} is running on fumes.`}},
 {t:'Turn it down — we need them here',d:'{A} will be very disappointed.',fx:c=>{mor(c.A,-18);return `${c.A.name} takes the news badly. "This was my shot," they say on the way out.`}}]},

merch:{t:'Sold out',i:'👕',good:true,text:'{A}\'s new shirt sold out at every arena this week. Fans are paying double from resellers.',ch:[
 {t:'Rush a reprint ($20K)',d:'Probably pays for itself several times over.',fx:c=>{S.money.p-=20;if(Math.random()<.8){S.money.p+=70;popx(c.A,2);return `The reprint sells out too (+$50K profit).`}S.money.p+=15;return `The reprint arrives just as the hype cools. Roughly break-even.`}},
 {t:'Make it a limited edition',d:'Scarcity is cool. Less money, more buzz.',fx:c=>{popx(c.A,4);S.money.p+=20;return `"Never coming back." Fans who got one wear it everywhere (+4 popularity).`}},
 {t:'Give {A} a bigger cut of merch',d:'Costs you, but builds loyalty.',fx:c=>{S.money.p-=10;mor(c.A,14);c.A.con+=4;return `${c.A.name} is thrilled and adds a few weeks to their deal on the spot.`}}]},

cover:{t:'Magazine cover',i:'📰',good:true,who:r=>{const a=shuf(r.filter(w=>w.pop>=62))[0];return a?[a]:null},
 text:'A major sports magazine wants {A} on the cover of next month\'s issue — but they want an exclusive interview too.',ch:[
 {t:'Do it all',d:'Mainstream exposure. Mic-skill check on the interview.',fx:c=>{if(Math.random()<.35+c.A.mic/150){popx(c.A,6);fansx(9000);return `${c.A.name} nails the interview. New fans everywhere (+6 popularity).`}popx(c.A,2);return `The cover looks great, the interview is forgettable (+2 popularity).`}},
 {t:'Cover only — no interview',d:'Safe and good-looking.',fx:c=>{popx(c.A,3);fansx(3000);return `A striking cover. People notice (+3 popularity).`}},
 {t:'Insist they shoot it with a title',d:'Makes the belts look important. {A} gets a little less spotlight.',fx:c=>{const t=Object.values(S.titles).sort((a,b)=>b.prestige-a.prestige)[0];if(t)t.prestige=Math.min(100,t.prestige+4);popx(c.A,2);return `The ${t?t.n:'championship'} gleams on newsstands everywhere.`}}]},

game:{t:'Video game roster',i:'🎮',good:true,text:'A video game studio wants {A} in the roster of their next wrestling game. They\'re offering a licensing fee.',ch:[
 {t:'Take the deal',d:'Money and a bit of popularity.',fx:c=>{S.money.p+=40;popx(c.A,3);mor(c.A,6);return `${c.A.name} is in the game. The entrance animation is spot on (+$40K).`}},
 {t:'Hold out for a cover spot',d:'Bigger payoff — or the studio walks.',fx:c=>{if(Math.random()<.4){S.money.p+=90;popx(c.A,6);mor(c.A,10);return `They bite! ${c.A.name} is the cover star (+$90K, +6 popularity).`}mor(c.A,-6);return `The studio picks someone else. ${c.A.name} isn't in the game at all.`}},
 {t:'Ask for the whole roster to be included',d:'Less for {A}, a little for everyone.',fx:c=>{S.money.p+=30;ownList('p').forEach(w=>mor(w,2));return `A roster-wide licensing deal. The locker room is buzzing about their ratings.`}}]},

chant:{t:'They won\'t stop chanting',i:'📣',good:true,who:r=>{const a=shuf(r.filter(w=>w.pop>=45&&w.pop<78))[0];return a?[a]:null},
 text:'For two weeks running, crowds have chanted {A}\'s name during other people\'s matches. Fans want them pushed — now.',ch:[
 {t:'Strike while it\'s hot',d:'Momentum and popularity. Someone higher up the card may resent it.',fx:c=>{popx(c.A,5);momx(c.A,2);const top=ownList('p').filter(w=>w!==c.A&&w.pop>c.A.pop).sort((a,b)=>b.pop-a.pop)[0];if(top&&Math.random()<.5){mor(top,-8);return `${c.A.name} rockets up the card (+5 popularity). ${top.name} isn't thrilled about it.`}return `${c.A.name} rockets up the card (+5 popularity).`}},
 {t:'Make the fans wait',d:'If it\'s real, it\'ll still be there later. {A} is impatient.',fx:c=>{popx(c.A,2);mor(c.A,-6);return `The chants get louder. ${c.A.name} keeps asking when it's their turn.`}},
 {t:'Have {A} turn on the fans',d:'A bold heel turn — huge if it works.',fx:c=>{if(c.A.al==='h'){popx(c.A,3);return `${c.A.name} was already a heel — now they're one the fans love to hate (+3 popularity).`}if(Math.random()<.5){c.A.al='h';popx(c.A,4);const n=`🔄 ${c.A.name} has turned HEEL!`;news(n);return `The betrayal stuns everyone. ${n}`}popx(c.A,-3);return `The fans refuse to boo. The turn fizzles (-3 popularity).`}}]},

promo:{t:'The promo idea',i:'🗣️',good:true,text:'{A} came to your office with a promo they swear will "set the building on fire." They\'ve been rehearsing it in the hotel mirror all week.',ch:[
 {t:'Hand them the open mic',d:'Mic-skill check. High ceiling, real risk.',fx:c=>{if(Math.random()<.3+c.A.mic/130){popx(c.A,5);c.A.mic=Math.min(Math.max(c.A.mic,c.A.potM),c.A.mic+1);return `It's a career promo. The clip is everywhere by morning (+5 popularity).`}popx(c.A,-2);mor(c.A,-4);return `It runs long and the crowd checks out (-2 popularity).`}},
 {t:'Polish it with the writers first',d:'Safer, smaller.',fx:c=>{popx(c.A,2);mor(c.A,3);return `A tight, solid segment (+2 popularity).`}},
 {t:'Pass',d:'{A} won\'t love that.',fx:c=>{mor(c.A,-7);return `${c.A.name} folds up the notes and leaves without a word.`}}]},

school:{t:'The training school',i:'🏫',good:true,who:r=>{const a=shuf(r.filter(w=>w.ring>=80))[0];return a?[a]:null},
 text:'{A} wants to open a wrestling school near their home town and is asking if the company will back it.',ch:[
 {t:'Fund it ($40K)',d:'{A} is grateful, and the whole roster sharpens up a little.',fx:c=>{S.money.p-=40;mor(c.A,14);c.A.con+=4;ownList('p').forEach(w=>{if(w.ring<w.pot)w.ring=Math.min(w.pot,w.ring+.3)});return `The school opens its doors. ${c.A.name} adds a few weeks to their contract out of loyalty.`}},
 {t:'Lend the company name, not money',d:'Free, and it helps a bit.',fx:c=>{mor(c.A,5);popx(c.A,1);return `"An official partner school." ${c.A.name} is pleased enough.`}},
 {t:'Ask them to wait until their contract is up',d:'{A} feels brushed off.',fx:c=>{mor(c.A,-8);return `${c.A.name} nods, but they're clearly frustrated.`}}]},

carpool:{t:'Road warriors',i:'🚐',good:true,need:2,who:r=>pair(r,(a,b)=>a.al===b.al&&a.g===b.g),
 text:'{A} and {B} have been riding together between every town for a month. Their car-ride videos are a hit online.',ch:[
 {t:'Make them a tag team',d:'Instant chemistry.',fx:c=>{const nm=pick(['The Long Haul','Mile Markers','Rest Stop Legends','Shotgun Rules','The Detour']);S.teams.push({id:'t'+partyNid(),n:nm,type:'team',m:[c.A.id,c.B.id]});chemx(c.A,c.B,3);return `"${nm}" are official. They already finish each other's sentences.`}},
 {t:'Plant the seeds of a betrayal',d:'A slow burn — one of them will turn on the other someday.',fx:c=>{chemx(c.A,c.B,2);addBeef(c.A.id,c.B.id,10);popx(c.A,1);popx(c.B,1);return `The cameras keep rolling on their friendship. Fans have no idea what's coming.`}},
 {t:'Put their videos on the company channel',d:'Popularity for both.',fx:c=>{popx(c.A,3);popx(c.B,3);fansx(3000);return `The car rides become a weekly web series (+3 popularity each).`}}]},

award:{t:'Fan-voted award',i:'🏅',good:true,who:r=>{const a=r.slice().sort((x,y)=>y.pop-x.pop).slice(0,6);return a.length?[pick(a)]:null},
 text:'Readers of a big wrestling site just voted {A} their "Wrestler of the Month."',ch:[
 {t:'Present the award on Dynamite',d:'Popularity. A heel might use it to gloat.',fx:c=>{popx(c.A,4);if(c.A.al==='h')popx(c.A,1);return `${c.A.name} holds the trophy up to the crowd. ${c.A.al==='h'?'The boos are deafening — exactly what they wanted.':'A huge pop.'}`}},
 {t:'Congratulate them privately',d:'{A} appreciates it.',fx:c=>{mor(c.A,8);return `${c.A.name} puts the trophy in their locker where everyone can see it.`}},
 {t:'Have a rival mock the award',d:'Instant heat for whoever {A} is feuding with.',fx:c=>{const o=ownList('p').filter(w=>w!==c.A&&!inTeam(w.id,c.A.id)).sort((a,b)=>heatOf(b.id,c.A.id)-heatOf(a.id,c.A.id))[0];if(!o){popx(c.A,2);return `Nobody steps up to mock it. ${c.A.name} enjoys the moment.`}const n=[];bumpHeat(c.A.id,o.id,14,n,'a mocked award');return `${o.name} calls it a "participation trophy." ${n.join(' ')}`}}]},

/* ---------------- front office situations ---------------- */
rivaldinner:{t:'Spotted at dinner',i:'🍽️',who:r=>{const a=shuf(r.filter(w=>w.pop>=60&&w.con<=14))[0];return a?[a]:null},
 text:'{A} was photographed having dinner with executives from the rival brand. Their contract is up in {CON} weeks.',ch:[
 {t:'Offer an extension now (+10% raise)',d:'Locks them in for 10 more weeks.',fx:c=>{const was=sal(c.A);c.A.sal=Math.round(was*1.1)+1;c.A.con+=10;mor(c.A,10);return `${c.A.name} signs on the spot — salary ${money(was)} → ${money(sal(c.A))}/wk.`}},
 {t:'Call their bluff',d:'Maybe it was just dinner. Maybe not.',fx:c=>{if(Math.random()<.55){mor(c.A,2);return `"It was just dinner," ${c.A.name} says. You believe them. Mostly.`}mor(c.A,-15);return `${c.A.name} feels disrespected. That contract talk is going to be tough.`}},
 {t:'Turn it into a "Are they leaving?" storyline',d:'Fans get invested. {A} may not love the speculation.',fx:c=>{popx(c.A,4);fansx(4000);if(Math.random()<.4)mor(c.A,-6);return `Every crowd wants to know if ${c.A.name} is staying. Ratings tick up (+4 popularity).`}}]},

finisher:{t:'Stolen finisher',i:'🌀',need:2,who:r=>pair(r,(a,b)=>a.g===b.g),
 text:'{B} has started using {A}\'s finishing move — and calling it by a different name. {A} found out from a fan.',ch:[
 {t:'Make it a feud: whose move is it?',d:'Strong feud heat.',fx:c=>{const n=[];bumpHeat(c.A.id,c.B.id,20,n,'a stolen finisher');popx(c.A,2);return `${c.A.name} hits ${c.B.name} with "their" move on TV. ${n.join(' ')}`}},
 {t:'Tell {B} to drop it',d:'{A} is happy. {B} sulks.',fx:c=>{mor(c.A,8);mor(c.B,-10);return `${c.B.name} goes back to the drawing board, grumbling.`}},
 {t:'Let both of them use it',d:'{A} won\'t take this well.',fx:c=>{mor(c.A,-12);addBeef(c.A.id,c.B.id,20);return `${c.A.name} is furious and hasn't spoken to ${c.B.name} since.`}}]},

prank:{t:'Prank gone wrong',i:'🧴',need:2,who:r=>pair(r),
 text:'{A} filled {B}\'s boots with shaving cream an hour before their match. {B} had to wrestle in sneakers and is not laughing.',ch:[
 {t:'Turn it into a TV rivalry',d:'Feud heat. Could get personal.',fx:c=>{const n=[];bumpHeat(c.A.id,c.B.id,16,n,'a backstage prank');if(Math.random()<.3)addBeef(c.A.id,c.B.id,20);return `${c.B.name} gets revenge on camera with a bucket of ice water. ${n.join(' ')}`}},
 {t:'Make {A} buy {B} new boots',d:'Fair. Both stay reasonably happy.',fx:c=>{mor(c.B,6);mor(c.A,-2);chemx(c.A,c.B,1);return `New boots and a handshake. They're laughing about it by the weekend.`}},
 {t:'Laugh it off — locker rooms need fun',d:'Everyone else loves it. {B} doesn\'t.',fx:c=>{ownList('p').forEach(w=>{if(w!==c.B)mor(w,2)});mor(c.B,-10);addBeef(c.A.id,c.B.id,12);return `The locker room is cracking up. ${c.B.name} is quietly plotting revenge.`}}]},

critic:{t:'Old school vs new school',i:'🧓',need:2,who:r=>{const v=shuf(r.filter(w=>w.ring>=86))[0];if(!v)return null;const y=shuf(r.filter(w=>w!==v&&w.ring<w.pot-3&&!inTeam(w.id,v.id)))[0];return y?[y,v]:null},
 text:'{B} told an interviewer that {A}\'s style is "all flips and no psychology." {A} shot back online. The comment sections are a war zone.',ch:[
 {t:'Book it: settle it in the ring',d:'Feud heat and a chance for {A} to prove it.',fx:c=>{const n=[];bumpHeat(c.A.id,c.B.id,18,n,'old school vs new school');popx(c.A,2);return `The debate becomes a storyline. Fans pick sides. ${n.join(' ')}`}},
 {t:'Make {B} mentor {A}',d:'{A} grows as a wrestler — if their pride allows.',fx:c=>{if(Math.random()<.6){c.A.ring=Math.min(c.A.pot,c.A.ring+2);chemx(c.A,c.B,2);mor(c.A,4);return `It's awkward at first, then it clicks. ${c.A.name} is visibly improving.`}mor(c.A,-8);mor(c.B,-4);return `Two sessions in, ${c.A.name} walks out. That didn't work.`}},
 {t:'Tell them both to stay off the internet',d:'Calms things down. Nobody is happy.',fx:c=>{mor(c.A,-4);mor(c.B,-4);return `The posts stop. The tension doesn't.`}}]},

tagspat:{t:'Trouble in the team',i:'💔',need:2,who:r=>{const ids=new Set(r.map(w=>w.id));const t=shuf(S.teams.filter(t=>t.type==='team'&&t.m.length===2&&t.m.every(id=>ids.has(id))))[0];return t?[S.w[t.m[0]],S.w[t.m[1]]]:null},
 text:'{A} and {B} got into a shouting match about who keeps taking the pin. Their partnership is on thin ice.',ch:[
 {t:'Split them up — it\'s feud time',d:'Big heat. Their team is done (unless they hold tag gold).',fx:c=>{const n=[];bumpHeat(c.A.id,c.B.id,26,n,'a tag team split');chemx(c.A,c.B,-3);const champ=isChamp(c.A.id)||isChamp(c.B.id);if(!champ)S.teams=S.teams.filter(t=>!(t.type==='team'&&t.m.length===2&&t.m.includes(c.A.id)&&t.m.includes(c.B.id)));return `${champ?'They stay a team for now, but it\'s only a matter of time.':'The team is finished.'} ${n.join(' ')}`}},
 {t:'Give each a singles match to blow off steam',d:'Morale for both. The team survives.',fx:c=>{mor(c.A,6);mor(c.B,6);return `A few weeks of singles action and they're getting along again.`}},
 {t:'Lock them in a room until they sort it out',d:'Could strengthen them — or end it.',fx:c=>{if(Math.random()<.55){chemx(c.A,c.B,2);mor(c.A,4);mor(c.B,4);return `They come out an hour later, laughing. Stronger than ever.`}chemx(c.A,c.B,-2);addBeef(c.A.id,c.B.id,20);return `They come out an hour later, not speaking.`}}]},

knee:{t:'Playing hurt',i:'🦵',who:r=>{const a=shuf(r.filter(w=>(w.fat||0)>=25))[0]||shuf(r)[0];return a?[a]:null},
 text:'{A} has been wrestling through a nagging knee problem and hasn\'t told anyone. The trainer just pulled you aside.',ch:[
 {t:'Rest them for 2 weeks',d:'They come back fully healthy.',fx:c=>{c.A.inj=Math.max(c.A.inj||0,2);c.A.fat=0;mor(c.A,4);return `${c.A.name} grumbles but takes the time. They'll be back fresh.`}},
 {t:'Tape it up and keep going',d:'Probably fine. Probably.',fx:c=>{if(Math.random()<.7){mor(c.A,3);return `The knee holds up. ${c.A.name} appreciates the trust.`}c.A.inj=Math.max(c.A.inj||0,4);return `The knee gives out at the next show. ${c.A.name} is out for 4 weeks.`}},
 {t:'Promos only for a week',d:'Fresh legs, and it gives them mic time.',fx:c=>{c.A.fat=Math.max(0,(c.A.fat||0)-25);c.A.inj=Math.max(c.A.inj||0,1);popx(c.A,1);return `${c.A.name} talks instead of wrestles for a week. The knee feels better.`}}]},

late:{t:'Late again',i:'⏰',text:'{A} rolled into the arena 40 minutes after call time — for the third show in a row.',ch:[
 {t:'Fine them ($10K)',d:'A clear message.',fx:c=>{S.money.p+=10;mor(c.A,-8);return `${c.A.name} is fined. They show up an hour early next week.`}},
 {t:'Find out what\'s going on',d:'Maybe there\'s a reason.',fx:c=>{if(Math.random()<.6){mor(c.A,10);return `There's a family situation at home. You adjust their travel. ${c.A.name} is grateful.`}mor(c.A,-2);return `No real reason — they just hate early flights. At least you asked.`}},
 {t:'Bump them down the card',d:'Effective. {A} will feel it.',fx:c=>{popx(c.A,-2);mor(c.A,-12);ownList('p').forEach(w=>{if(w!==c.A)mor(w,1)});return `${c.A.name} is opening the show for a while. The locker room gets the message.`}}]},

dirtsheet:{t:'"Difficult to work with"',i:'🗞️',text:'A dirt sheet report claims {A} is "difficult to work with" and has been refusing finishes. {A} says it\'s all made up.',ch:[
 {t:'Back {A} publicly',d:'{A} is loyal to you for it.',fx:c=>{mor(c.A,12);if(Math.random()<.3){ownList('p').filter(w=>w!==c.A).slice(0,3).forEach(w=>mor(w,-3));return `${c.A.name} is grateful. A few wrestlers mutter that the report wasn't entirely wrong.`}return `${c.A.name} is grateful. The story dies within a week.`}},
 {t:'Have {A} read the report on TV',d:'Fans love when wrestlers mock the dirt sheets.',fx:c=>{popx(c.A,3);fansx(3000);return `${c.A.name} reads it out loud and rips it in half. Big pop (+3 popularity).`}},
 {t:'Say nothing',d:'People might believe it.',fx:c=>{if(Math.random()<.5)return `Nobody cares by next week.`;popx(c.A,-3);mor(c.A,-6);return `The story sticks. ${c.A.name} feels hung out to dry.`}}]},

kayfabe:{t:'Caught being nice',i:'🤳',who:r=>{const a=shuf(r.filter(w=>w.al==='h'))[0];return a?[a]:null},
 text:'A fan video shows {A} — one of your most hated heels — happily posing for photos and hugging kids outside the arena. "They\'re actually lovely!" is trending.',ch:[
 {t:'Turn them face',d:'The fans have spoken.',fx:c=>{c.A.al='f';popx(c.A,3);const n=`🔄 ${c.A.name} has turned FACE!`;news(n);return `The crowd embraces them immediately. ${n}`}},
 {t:'Have {A} "deny it" on TV',d:'A heel promo about how fake the video is. Mic-skill check.',fx:c=>{if(Math.random()<.35+c.A.mic/150){popx(c.A,4);return `"That was my evil twin." The crowd boos and laughs at the same time (+4 popularity).`}popx(c.A,-1);return `Nobody buys it. The heel act feels a little softer.`}},
 {t:'Ignore it',d:'It blows over.',fx:c=>{mor(c.A,4);return `It's a nice moment and nothing more.`}}]},

snub:{t:'The airport snub',i:'🛄',who:r=>{const a=shuf(r.filter(w=>w.al==='f'))[0];return a?[a]:null},
 text:'A video shows {A}, one of your top fan favorites, brushing past a group of fans at the airport without stopping. {A} says they were about to miss a flight.',ch:[
 {t:'Have them apologize and make it right',d:'Contained. Mic-skill check.',fx:c=>{if(Math.random()<.4+c.A.mic/160){popx(c.A,1);return `${c.A.name} tracks down the fans and invites them to the next show. All is forgiven.`}popx(c.A,-3);return `The apology sounds rehearsed. Some fans aren't buying it.`}},
 {t:'Lean in — turn them heel',d:'Big swing.',fx:c=>{if(Math.random()<.55){c.A.al='h';popx(c.A,3);const n=`🔄 ${c.A.name} has turned HEEL!`;news(n);return `"I don't owe you anything." The crowd turns instantly. ${n}`}popx(c.A,-4);mor(c.A,-6);return `The turn feels forced. Fans are just confused.`}},
 {t:'Say nothing',d:'It may fade, or snowball.',fx:c=>{if(Math.random()<.5)return `The clip fades out by the weekend.`;popx(c.A,-4);fansx(-5000);return `It snowballs. Fans start chanting at ${c.A.name} during matches.`}}]},

gimmick:{t:'The gimmick pitch',i:'🎭',vars:['a time traveler from 1987 who doesn\'t understand phones','a disgraced game show host','an evil substitute teacher','a medieval knight who refuses to acknowledge cars','a motivational speaker who is clearly not okay','a cowboy who has never seen a horse','a luxury real estate agent who sells "dream homes" in the ring'],
 text:'{A} wants to repackage themselves as {VAR}. They\'ve already ordered the costume.',ch:[
 {t:'Greenlight it',d:'Could be a breakout — or a disaster.',fx:c=>{if(Math.random()<.35+c.A.mic/180){popx(c.A,7);mor(c.A,10);momx(c.A,1);return `Against all odds, it works. Fans are buying the merch (+7 popularity).`}popx(c.A,-4);mor(c.A,4);return `It doesn't land. ${c.A.name} had fun at least (-4 popularity).`}},
 {t:'Keep the attitude, ditch the costume',d:'A safer middle ground.',fx:c=>{popx(c.A,2);mor(c.A,3);return `A sharper version of ${c.A.name} debuts. Solid (+2 popularity).`}},
 {t:'Absolutely not',d:'{A} will be disappointed.',fx:c=>{mor(c.A,-9);return `${c.A.name} returns the costume. Grudgingly.`}}]},

indie:{t:'Weekend indie booking',i:'🎟️',who:r=>{const a=shuf(r.filter(w=>w.pop<75))[0];return a?[a]:null},
 text:'{A} wants permission to work a big independent show this weekend. It\'s a sold-out crowd and a dream match for them.',ch:[
 {t:'Allow it',d:'Popularity, but more wear and tear.',fx:c=>{popx(c.A,3);mor(c.A,8);c.A.fat=Math.min(100,(c.A.fat||0)+18);if(Math.random()<.15){c.A.inj=Math.max(c.A.inj||0,2);return `The match steals the show — but ${c.A.name} tweaks something and misses 2 weeks.`}return `The match goes viral. ${c.A.name} comes back buzzing (+3 popularity).`}},
 {t:'Allow it and send a company producer ($10K)',d:'Safer, and good for the brand.',fx:c=>{S.money.p-=10;popx(c.A,3);mor(c.A,6);fansx(2000);return `The show is a hit and your brand gets the credit (+3 popularity).`}},
 {t:'Say no',d:'{A} is frustrated.',fx:c=>{mor(c.A,-9);return `${c.A.name} posts a sad emoji and nothing else.`}}]},

retire:{t:'Retirement whispers',i:'🌅',who:r=>{const a=shuf(r.filter(w=>w.pop>=65&&w.ring>=84&&w.con<=12))[0];return a?[a]:null},
 text:'{A} told a podcast they\'ve "been thinking about how many years they have left." The fans are already worried.',ch:[
 {t:'Offer a "final run" storyline',d:'Popularity now; {A} feels honored.',fx:c=>{popx(c.A,5);mor(c.A,10);fansx(5000);return `Every match feels like it could be the last. Crowds are on their feet (+5 popularity).`}},
 {t:'Offer a long extension with a lighter schedule',d:'{A} stays longer and rests more.',fx:c=>{c.A.con+=12;c.A.fat=0;mor(c.A,8);S.money.p-=20;return `${c.A.name} signs 12 more weeks. "I've got more in me."`}},
 {t:'Leave it alone',d:'They might be fine. They might not.',fx:c=>{if(Math.random()<.5){mor(c.A,-6);return `${c.A.name} feels nobody cares if they stay.`}return `It was just podcast talk. ${c.A.name} is fine.`}}]},

rumor:{t:'The rumor mill',i:'👂',need:2,who:r=>pair(r),
 text:'Someone started a rumor that {B} has been trashing {A} to management. It\'s not true, but {A} believes it.',ch:[
 {t:'Bring them both in and clear the air',d:'Probably fixes it.',fx:c=>{if(Math.random()<.7){chemx(c.A,c.B,1);mor(c.A,3);return `It's sorted in ten minutes. ${c.A.name} and ${c.B.name} shake hands.`}addBeef(c.A.id,c.B.id,15);return `${c.A.name} doesn't believe the denial. Things are icy.`}},
 {t:'Use the tension on TV',d:'Feud heat with a real edge.',fx:c=>{const n=[];bumpHeat(c.A.id,c.B.id,15,n,'a backstage rumor');addBeef(c.A.id,c.B.id,15);return `The rumor becomes a storyline. ${n.join(' ')}`}},
 {t:'Find who started it',d:'Locker room gets the message. Everyone feels watched.',fx:c=>{ownList('p').forEach(w=>mor(w,-2));mor(c.A,4);mor(c.B,4);return `The source is found and quietly dealt with. Gossip drops off a cliff.`}}]},

celeb:{t:'Celebrity sighting',i:'⭐',good:true,vars:['a pop star with a huge following','a famous NFL linebacker','a reality TV villain','a viral streamer','a late-night talk show host'],
 text:'{VAR} is a huge fan of {A} and wants to appear on Dynamite alongside them.',ch:[
 {t:'Book the celebrity segment',d:'New eyeballs. Hardcore fans may groan.',fx:c=>{fansx(12000);popx(c.A,3);if(Math.random()<.35){S.money.p-=15;return `Big ratings, but the celebrity's entourage blew the catering budget (+3 popularity, -$15K).`}return `Mainstream buzz all week. ${c.A.name} gets a big rub (+3 popularity).`}},
 {t:'Have {A} humiliate them',d:'Great for a heel. Risky for a face.',fx:c=>{if(c.A.al==='h'){popx(c.A,5);fansx(6000);return `${c.A.name} embarrasses the celebrity on live TV. Pure heat (+5 popularity).`}popx(c.A,-2);fansx(4000);return `The crowd doesn't like seeing their hero be mean (-2 popularity).`}},
 {t:'Front row seats only',d:'A cameo on camera. Low risk.',fx:c=>{fansx(3000);popx(c.A,1);return `A wave from the front row and a shout-out from ${c.A.name}.`}}]}
};

if(typeof CRISES!=='undefined')Object.assign(CRISES,CR2);
})();
