/* Tony Khan Simulator — the promo exchange (v243).
   A two-person Callout, Champion's Address, Contract Signing or Sit-Down Interview is now a real back-and-forth.
   After the opening call the other wrestler answers, and you direct your wrestler like a producer in their earpiece:
   pick a tactic (go personal, get in their face, play to the crowd, stay cool, make it about the match, show respect)
   and the wrestler says it in their own voice — the line is written for what the other wrestler just said, and how
   it comes out depends on mic skill and alignment. The other wrestler answers that, and so on.

   • Length (v244): three decisions — the opening, one exchange call and the closer. A hot feud between two great
     talkers gets a second exchange call (and the option to skip it and go straight to the closer).
   • (v247: no longer shown.) Momentum tracks who's winning the exchange. Your calls pull it by their swing (a landed long shot pulls
     hard, a missed one gives ground) and the other wrestler's answers pull it back by what they said and how good
     they are on the mic. Where it sits decides the closer: way ahead and the mic drop is there for the taking; even and
     it boils over, ends on a stare or gets made official; behind and they get the last word, and you choose how to
     answer it.
   • Now and then a good talker winds up a big line instead of answering: cut them off (your mic, risky) or let them
     finish (it's on them). It takes the place of an exchange call, so it never makes a promo longer.
   • Balance: the mid-exchange calls are centred on zero for the promo score like the old response beat, the closer
     counts as a full call, and where the bar ends nudges the score a little. More calls change how a promo goes, not
     how high promos rate. The old random twist still replaces the closer about a quarter of the time (storyline twists
     — hijacks, the mystery figure, the countdown — at their usual rate). Loaded after retorts.js. */
'use strict';
(function(){
const EX_RS=window.RT_RS||.6;   /* a mid-exchange call's swing on the promo score, against a full call */
const EX_HW=.2;                 /* the mid-exchange calls' total weight on heat and popularity (split across them) */
const EX_MB=0;                  /* v247: the meter is gone — how the exchange went still picks the closer, but adds nothing to the score */
const EX_TP=.25;                /* chance of one "big line" timing call in an exchange */
const RT=window.RT_LIB,FU=window.RT_FU;

/* ---------- the tactics ---------- */
const TACS=['pers','face','crowd','cool','chal','resp'];
const TAC={
 pers:{n:'🗡️ Go personal',tip:'Cut deep'},
 face:{n:'😤 Get in their face',tip:'Back them down'},
 crowd:{n:'📣 Play to the crowd',nh:'📣 Turn on the crowd',tip:'Let the building pick a side',th:'Make them hate you'},
 cool:{n:'😏 Stay cool',tip:'Let them do the talking'},
 chal:{n:'🎯 Make it about the match',tip:'Bring it back to the fight'},
 resp:{n:'🤝 Show respect',nh:'🤝 Backhanded respect',tip:'Take the high road',th:'A compliment with teeth'}};
const tacName=(tc,A)=>A&&A.al==='h'&&TAC[tc].nh||TAC[tc].n;
const tacTip=(tc,A)=>A&&A.al==='h'&&TAC[tc].th||TAC[tc].tip;
/* which tactic each written answer is, in the order retorts.js lists them */
const TG={
 mock:'cool pers crowd cool face pers pers cool',flip:'pers cool chal pers chal face',brag:'pers chal cool crowd cool chal pers',
 dismiss:'face face pers face chal pers',personal:'cool face pers chal cool face cool pers',threat:'chal face cool face pers cool cool chal',
 accept:'chal chal resp face pers cool',dodge:'pers chal face crowd chal cool',respect:'resp resp pers resp pers cool',
 laidout:'cool face pers resp cool cool crowd',fightback:'cool face face face chal face face cool',retreat:'face cool face crowd chal cool',
 crowd:'crowd crowd crowd pers crowd cool',rattled:'pers cool cool cool face chal',defy:'cool face chal resp cool face chal face',
 stumble:'cool pers crowd pers pers chal'};
function cls(c){const t=(c.t||'').toLowerCase();if(c.ch||c.stp)return 'chal';if(/respect|thank|shake|handshake/.test(t))return 'resp';
 if(c.s==='ring')return 'face';if(c.s==='pop')return 'crowd';if(c.s==='luck')return 'cool';return 'pers'}
Object.keys(FU).forEach(m=>{const tg=(TG[m]||'').split(' ');if(tg.length!==FU[m].length)console.warn('exchange: tactic tags for',m,'need updating');
 FU[m].forEach((c,i)=>{c.tc=tg.length===FU[m].length&&TAC[tg[i]]?tg[i]:cls(c)})});
/* what the other wrestler hears, so their answer fits */
const TI={pers:'insult',face:'mind',crowd:'brag',cool:'mind',chal:'promise',resp:'respect'};
function intentOf(c){if(!c)return 'insult';if(c.ri)return c.ri;const r=rtIntent(c.lt?Object.assign({},c,{t:c.lt}):c);return r!=='insult'?r:(TI[c.tc]||'insult')}
/* how much each kind of answer pulls the bar their way (negative) or hands it back (positive) */
const MV={mock:-1,flip:-1,brag:-.5,dismiss:-1,personal:-1.25,threat:-.75,accept:0,dodge:.75,respect:0,laidout:1.25,fightback:-.75,retreat:1,crowd:-1,rattled:1,defy:-.75,stumble:1.25};

/* lines for when nothing written for that answer fits the tactic (ri = how the other wrestler reads it) */
const GEN={
pers:[
 {t:'gp1',lb:`Say what nobody else would about {B}`,s:'mic',d:.15,h:12,p:2,ok:`{A} leans in. "I know why your last partner left, {B}. Everybody does." {B}'s jaw tightens.`,g:`{A} waits for {B} to finish, then says it quietly: "You know why nobody in the back trusts you. Want me to tell them?" {B}'s jaw tightens. That one was real.`,no:`{A} leans in. "Your kid's going to watch you lose. Think about that." It goes too far. The groans aren't aimed at {B}.`,b:`{A} leans in. "Remember when you lost to — in Boise, wasn't it?" {B} corrects them, slowly. "Tacoma. And I won."`},
 {t:'gp2',lb:`Bring up {B}'s family`,al:'h',s:'mic',d:.15,h:13,p:2,ok:`{A} smirks. "Your family still skipping your matches?" Low, nasty and right on target.`,g:`{A} tilts their head. "Does your family still watch, {B}? Or did they stop when you did?" Low, nasty and right on target. {B} has to be held back.`,no:`{A} smirks. "Your family still skipping your matches?" Even the people who boo {B} think that was cheap. It just sits there.`,b:`"Your family — your mom — they don't even —" {A} loses the thread. It just sits there.`},
 {t:'gp3',lb:`Tell {B} everyone knows who they really are`,al:'f',s:'mic',d:.12,h:11,p:2,ok:`"Everybody knows who you really are, {B}. They just stopped saying it out loud." A chorus of "ooooh."`,g:`"You know what I remember about you, {B}? Who you were before all this. Scared. You still are. You just got louder." A chorus of "ooooh."`,no:`{A} points. "I know who you really are, {B}." It comes out bitter instead of cutting.`,b:`"I know who you really are! Deep down. You're — you know what you are." It comes out bitter, not cutting.`},
 {t:'gp4',lb:`Tell {B} it's been personal for months`,hot:1,s:'mic',d:.15,h:12,p:1,ok:`"You want to make this personal? It's been personal since the day you walked in here." {B} goes quiet.`,g:`"Personal?" {A} almost laughs. "I've been carrying what you did around for months, {B}. This stopped being business a long time ago." {B} goes quiet.`,no:`{B} shrugs. "Then act like it."`,b:`"It's personal. Very personal. That's how personal it is." {B} shrugs. "Then act like it."`}],
face:[
 {t:'gf1',nbm:'respect accept',lb:`Step in nose to nose with {B}`,s:'ring',d:.1,h:11,p:1,ok:`{A} steps in until they're nose to nose. "Keep going." {B} stops talking.`,g:`{A} walks forward one slow step at a time until there's nowhere left for {B} to look. "Finish the sentence." {B} stops talking.`,no:`{A} steps in nose to nose. "Say that again." {B} doesn't give an inch. "Gladly." Stalemate.`,b:`{A} steps in too fast. "Say that ag— ow." They bump foreheads. {B} rubs it and laughs.`},
 {t:'gf2',nbm:'respect accept',lb:`Back {B} into the corner`,hk:'live',s:'ring',d:.1,h:12,p:1,ok:`{A} walks {B} back into the corner. "Where are you going to go now?" The crowd is on its feet.`,g:`{A} walks {B} backwards across the ring until {B}'s back hits the turnbuckle. "No more room." Then just stands there. The crowd is on its feet.`,no:`{A} walks {B} backwards. "Nowhere to run—" {B} slides out of the corner and the moment's gone.`,b:`{A} steps forward. "Back — back up — I said back—" {A} backs into the corner instead.`},
 {t:'gf3',lb:`Shove {B} mid-sentence`,al:'h',ri:'shove',s:'ring',d:.1,h:13,p:1,ok:`{A} shoves {B} mid-sentence. "Enough." Officials rush in to separate them.`,g:`{A} lets {B} get halfway through the next sentence, then shoves them hard enough to knock the words out. "That's enough out of you." Officials come running.`,no:`{A} shoves {B}. "Shut up!" {B} shoves back harder. Officials have to save {A}.`,b:`{A} shoves {B}. "Back off!" {B} barely moves. {A} stumbles backward instead.`},
 {t:'gf4',nbm:'respect accept',lb:`Knock the mic out of {B}'s hand`,al:'f',ri:'mind',s:'ring',d:.08,h:11,p:2,ok:`{A} knocks the mic out of {B}'s hand. "Say it to my face." The crowd roars.`,g:`{A} snatches the mic out of {B}'s hand and tosses it away. "No mic. Say it to my face." The crowd roars.`,no:`{A} knocks the mic away. "Say it to my face." {B} just picks up another mic. "Happy to."`,b:`{A} grabs for the mic. "Give me — gimme that—" {A} misses. {B} pulls it back and keeps going.`},
 {t:'gf5',lb:`Stand up and kick the chair back`,hk:'studio',s:'ring',d:.1,h:12,p:1,ok:`{A} stands and kicks the chair back. "Stand up." {B} is on their feet too. The interviewer leans away.`,g:`{A} stands, slowly, and the chair scrapes back. "Stand up." {B} stands. Nobody in the studio breathes.`,no:`{A} stands. "Stand up." {B} stays seated and smiles. "I'm comfortable." {A} looks silly standing.`,b:`{A} stands too fast. "Stand up! Oh — sorry." {A} knocks the water over. {B} stays seated and smiles.`}],
crowd:[
 {t:'gc1',nbm:'respect accept rattled stumble',lb:`Ask the fans if they believe {B}`,al:'f',hk:'live',s:'pop',d:.05,h:8,p:3,ok:`{A} turns to the fans. "You believe a word of that?" The answer is deafening.`,g:`{A} doesn't look at {B} at all. Turns to the crowd. "Raise your hand if you believe {B}." Not one. The answer is deafening.`,no:`{A} turns to the fans. "You believe a word of that?" A few cheers, but {B} talks right over them.`,b:`{A} turns to the fans. "Do you believe {B}?" Somebody in the crowd yells "YES!" {B} laughs.`},
 {t:'gc2',lb:`Get the whole building chanting`,al:'f',hk:'live',s:'pop',d:.05,h:8,p:3,ok:`{A} turns to the crowd. "Let them hear you!" The whole building chants until {B} can't be heard.`,g:`{A} cups a hand to an ear. "Louder." Then the other. By the third time the chant is so loud {B} lowers the mic and waits. The building chose a side.`,no:`{A} turns to the crowd. "Come on, let's hear it!" The chant starts and fizzles.`,b:`{A} turns to the crowd. "Everybody! {B}! {B}! — no, wait—" {A} starts {B}'s chant by accident.`},
 {t:'gc3',lb:`Turn on the crowd`,al:'h',hk:'live',s:'pop',d:.05,h:10,p:2,ok:`{A} turns on the crowd. "And you people cheer for this?" The boos pour down, and {A} soaks them in.`,g:`"Look at them, {B}. These are your people." {A} sneers at the front row. "No wonder you turned out like this." The boos pour down, and {A} soaks them in.`,no:`{A} sneers at the crowd. "You cheer for this?" The crowd ignores {A} and keeps cheering {B}.`,b:`{A} sneers. "You people in Denver are pathetic!" It's Phoenix. They boo anyway, just less.`},
 {t:'gc4',lb:`Tell the crowd to shut up`,al:'h',hk:'live',s:'pop',d:.08,h:10,p:2,ok:`{A} snaps at the crowd. "Shut up." They get louder. That was the point.`,g:`{A} waits. And waits. "Are you done?" The crowd isn't. "Fine. I'll wait." Ten seconds of the loudest boos of the night, all of it for {A}.`,no:`{A} snaps. "Will you all shut up?" It just makes {A} look like they're losing the room.`,b:`"Shut up! Shut — everyone just —" It makes {A} look like they're losing the room.`}],
cool:[
 {t:'gk1',lb:`Smile and let it hang`,s:'luck',d:0,h:7,p:1,ok:`{A} smiles. "Go on." Lets it hang. The longer {B} talks, the worse it sounds.`,g:`{A} lets {B} finish. Waits. Waits a little longer. "…Are you done?" The pause did all the work.`,no:`{A} smiles. "Mm-hm." The smile looks frozen. {B} keeps going.`,b:`{A} folds their arms. "I'm fine. Totally fine. Not bothered." {A} looks very bothered.`},
 {t:'gk2',lb:`Tell {B} to keep talking`,s:'mic',d:.05,h:8,p:1,ok:`"Keep talking. I'm learning a lot." {A} never raises their voice.`,g:`"No, keep going." {A} folds their arms. "Every word tells me exactly how scared you are." {A} never raises their voice once.`,no:`{A} shrugs. "Keep talking." Nothing follows. It sounds like {A} has nothing else.`,b:`"Keep talking. I'm… listening. To the talking." It sounds like {A} has nothing.`},
 {t:'gk3',lb:`Check their nails while {B} talks`,al:'h',s:'luck',d:0,h:9,p:1,ok:`{A} checks their nails. "Sorry, still going?" Then checks the time. {B} is fuming.`,g:`{A} examines a fingernail, then holds the mic out for {B} like a waiter with the check. "Go on." {B} is fuming.`,no:`{A} checks their nails. "Wake me when you're done." {B} ignores it and keeps rolling.`,b:`{A} checks a watch they aren't wearing. "Look at the time!" Nobody laughs. {B} keeps rolling.`},
 {t:'gk4',lb:`Ask {B} if they're done`,al:'f',s:'luck',d:0,h:7,p:2,ok:`{A} nods slowly. "You done?" Calm. The fans love it.`,g:`{A} nods along like {B} is reading a grocery list. When it's over: "Cool." The fans love it.`,no:`{A} nods. "Uh huh. Sure." It reads as checked out.`,b:`{A} nods. And nods. "Mm. Yeah. Mm." So long it looks like they stopped listening. Maybe they did.`}],
chal:[
 {t:'gm1',lb:`Name the date`,s:'mic',d:.1,h:10,p:2,ok:`"Enough talking. {PPV}. You and me." {B} has nothing for that.`,g:`"You've said a lot tonight, {B}. Here's the only part that matters." {A} points at the ring. "{PPV}. Just us." {B} has nothing for that.`,no:`{B} laughs. "That's all you've got? A date?"`,b:`"{PPV}! You and — me. At it." {B} laughs. "That's all you've got?"`},
 {t:'gm2',lb:`Point at {B}'s title`,bt:1,s:'mic',d:.1,h:11,p:2,ok:`{A} points at the {BT} title. "That's the only thing I want from you."`,g:`{A} doesn't look at {B}. Looks at the {BT} title. "You can keep the words. I'm here for that." {B} pulls the belt closer.`,no:`{B} lifts the belt higher. "Come take it. If you can."`,b:`"I want — that." {A} points vaguely at {B}'s waist. "The title." {B} lifts the belt higher.`},
 {t:'gm3',lb:`Demand a yes from {B}`,s:'mic',d:.12,h:11,p:2,ch:1,ok:`"You want to settle it? Then say yes." The match is on.`,g:`"We can stand here and talk all night, {B}." {A} leans in. "Or we can do it properly. Say yes." {B} says yes. The match is on.`,no:`{A} leans in. "Want to settle it? Say yes." {B} won't commit. "When I'm ready." Not yet.`,b:`"Match. You. Me. Yes?" {B} won't commit. Not yet.`},
 {t:'gm4',nbm:'respect',lb:`Point down at the canvas`,hk:'live',s:'ring',d:.08,h:10,p:1,ok:`{A} points down at the canvas. "Words don't count in there."`,g:`{A} taps the canvas with the mic. "Talk all you want. In there, nobody's listening." {B} looks down at the spot.`,no:`{B} shrugs. "Then why'd you bring a microphone?"`,b:`"In there, words don't —" {A} taps the mat and the mic squeals. {B} shrugs.`}],
resp:[
 {t:'gr1',bm:'brag',lb:`Tell {B} they're as good as they say`,al:'f',s:'pop',d:.05,h:6,p:3,ok:`"You're as good as you say you are, {B}. That's why beating you will mean something."`,g:`"I'm not going to stand here and pretend you're not great, {B}. You are. That's exactly why I want you." The fans applaud both of them.`,no:`{A} nods. "You're as good as you say you are." It comes across as soft.`,b:`"You're good, {B}. Really good. Probably better than — anyway." It comes across as soft.`},
 {t:'gr2',lb:`Pay {B} a backhanded compliment`,al:'h',s:'mic',d:.1,h:9,p:2,ok:`"Credit where it's due, {B}. You're the second-best person standing here." Backhanded and smug.`,g:`"I'll give you this, {B}." {A} smiles. "You're very good at being almost as good as me." Backhanded and smug, and {B} hates it.`,no:`{A} shrugs. "Credit where it's due. You're good." {B} takes it. "Thanks." It just sounds like a compliment.`,b:`"You're… pretty good. For you." It just sounds like a compliment. {B} takes it.`},
 {t:'gr3',nxi:'shake snub',nbm:'rattled crowd',lb:`Offer {B} a handshake`,al:'f',vs:'f',ri:'shake',s:'pop',d:.05,h:5,p:3,ok:`{A} offers a hand. "Best one wins." {B} shakes it, and the crowd stands for both of them.`,g:`{A} holds out a hand and doesn't say anything. {B} looks at it for a long moment, then shakes. "Best one wins." The crowd stands for both of them.`,no:`{A} offers a hand. "Best one wins." {B} leaves the hand hanging. Not yet.`,b:`{A} offers a hand. "Best one w—" {B} is still mid-sentence. {B} leaves it hanging.`}]};

/* ---------- the big line: a timing call ---------- */
const TIME_TX=[
 {t:`{B} takes a long breath and steadies the mic. Whatever's coming next, they've been saving it.`},
 {t:`{B} smiles. "You want to know what I really think of you? I'll tell you —"`},
 {hk:'live',t:`{B} holds up a hand to quiet the crowd. This one has been rehearsed.`},
 {nhk:'live',t:`{B} leans toward the camera. "Let me tell you something about {A} nobody knows —"`}];
const TIME_CH=[
 {t:'✋ Cut them off',tip:'Steal the moment before it lands',s:'mic',d:.12,h:9,p:2,ex:'time',cut:1,always:0,ok:`{A} cuts in before {B} gets there: "Nobody wants to hear it." {B} is left holding a dead line.`,g:`"No." {A} says it right over {B}. "You don't get to finish. Not tonight." {B} is left standing there with the best line they had and nobody to hear it.`,no:`{A} cuts in. "Nobody wants to—" {B} talks right over {A}: "—and THAT'S why you'll never beat me." It lands twice as hard.`,b:`{A} tries to cut in. "Nobody wants to hear—" The mic isn't on. {B} finishes: "—and THAT'S why you'll never beat me." It lands twice as hard.`},
 {t:'🤫 Let them finish',tip:"It's on {B} now",s:'luck',d:0,h:6,p:1,ex:'time',wait:1,ok:`{B} reaches the big line. "You're nothing but a — a —" It comes out half-baked. {A} just raises an eyebrow. "Mm." That's all {A} needed.`,no:`{B} nails it. "You've spent this whole time telling everybody who you are. Funny thing is, nobody asked." A chorus of "ooooh." Now {A} has to answer that.`}];
const HOLD_TX=[{t:`{B} lets the line hang. Now {A} has to answer it.`},{t:`{B} lowers the mic and waits. The whole building is waiting with them.`},{t:`{B} doesn't add a word. They don't need to. It's on {A} now.`}];
const mm=w=>w.mic+(hasT(w,'mouth')?10:0);
const waitP=ctx=>clamp(1.05-(.2+mm(ctx.B)/100*.75),.2,.85);

/* ---------- the closer ---------- */
const CLOSE_TX={
 up:[{t:`{B} is out of answers. One more and this is over.`},{hk:'live',t:`{B} keeps glancing at the ramp. {A} has them exactly where they want them.`},{t:`{B} is rattled, and everyone can see it.`}],
 even:[{hk:'live',t:`Neither one is giving an inch. Officials start drifting toward the ring.`},{t:`Nobody's winning this, and nobody's backing down. It has to go somewhere.`},{hk:'studio',t:`The interviewer has stopped asking questions. Neither of them is backing down.`}],
 down:[{hk:'live',t:`{B} gets the last word: "Enjoy the noise tonight. It's the last time you'll hear it."`},{nhk:'live',t:`{B} gets the last word: "Take a good look at this face. You'll be seeing it a lot more than you'd like."`},{vs:'h',t:`{B} leans in for the last word: "You're not the main character here. You never were."`},{vs:'f',t:`{B} gets the last word, and it's a good one: "You've had your say. I'll have mine at {PPV}."`},{vs:'h',t:`{B} gets the last word: "Go ahead. Stand there. That's all you were ever good at."`}]};
const CLOSE={
 up:[
  {t:'🗡️ Twist the knife',rage:1,s:'mic',d:.2,h:11,p:2,ok:`{A} stops on the way out. "And {B}? Nobody will remember you after this." The cruelest line of the night. {B} has nothing.`,g:`"And {B}?" {A} stops on the way out. "When it's over, I'll be the only reason anyone remembers your name." {B} has nothing left.`,no:`{A} turns back. "And another thing—" One line too many. {B} gets a breath back.`,b:`{A} turns back. "And — you're — bad!" It's the weakest line of the night. {B} gets a breath back.`},
  {t:'🏆 Hold the moment',hk:'live',s:'pop',d:.05,h:8,p:3,ok:`{A} lowers the mic. "Listen to that." Then just stands there and soaks it in. The moment is theirs.`,g:`{A} raises a fist and holds it there, eyes on {B}. One word, off-mic: "Listen." The noise builds and builds. The moment is theirs.`,no:`{A} raises a fist. "This is—" The music hits early and steps on it.`,b:`{A} poses. "Yeah!" Poses again. "Yeah!" A third time. The moment drags.`},
  {t:'🏆 Hold the moment',hk:'back|lot',s:'pop',d:.05,h:8,p:3,ok:`{A} leans against the wall. "Take your time." Then says nothing else. {B} has to fill the silence and can't. The moment is theirs.`,g:`{A} straightens {B}'s collar, slowly. "There." And just waits. {B} has nothing to fill the silence with. The moment is theirs.`,no:`{A} leans back against the wall. "I'll wait." A crew member walks right between them and the moment's gone.`,b:`{A} leans back against the wall. "Take your — whoa!" It's a door. It opens. The moment's gone.`},
  {t:'🏆 Hold the moment',hk:'studio',s:'pop',d:.05,h:8,p:3,ok:`{A} leans back. "Your turn." Then lets the silence win. The moment is theirs.`,g:`{A} leans back and crosses one leg over the other. "Take your time." Then nothing. {B} has to fill the silence and can't. The moment is theirs.`,no:`{A} leans back. "I'll wait." The interviewer jumps in too early and the moment's gone.`,b:`{A} leans back. "Take your — whoa!" The chair tips. The moment's gone.`}],
 even:[
  {t:'💥 Let it boil over',rage:1,hk:'live',s:'ring',d:.1,h:12,p:1,ok:`{A} steps in. "Come on, then!" They go at it. It takes half the locker room to pull them apart.`,g:`{A} drops the mic. "Enough talking." Nobody knows who threw first. Then it's everyone: referees, security, half the roster, and {A} and {B} still reaching for each other over the pile.`,no:`{A} lunges. "Let's go!" Security gets there before a punch lands. It fizzles.`,b:`{A} lunges. "Let me at — let me AT —" {A} gets tangled in security before reaching {B}. It fizzles.`},
  {t:'💥 Let it boil over',rage:1,hk:'back|lot',s:'ring',d:.1,h:12,p:1,ok:`{A} drops the mic. "Come here." They crash into the equipment cases and it takes half the crew to pull them apart.`,g:`{A} shoves {B} into the wall. "Now." They go through a rack of road cases, crew everywhere, and the camera loses them in the pile.`,no:`{A} lunges. "Let's go!" Crew members get between them before it starts.`,b:`{A} lunges. "Let me at —" A road case rolls into {A}'s shins. Crew members get between them.`},
  {t:'💥 Let it boil over',rage:1,hk:'studio',s:'ring',d:.1,h:12,p:1,ok:`{A} stands. "We're done talking." The table goes over, the chairs go flying and the feed cuts to black.`,g:`{A} shoves the table out of the way. "Come here!" They're on each other before it lands. Crew everywhere. The feed cuts to black mid-scuffle.`,no:`{A} stands. "Let's go." Crew members get between them before it starts.`,b:`{A} grabs the table. "Let's — it won't —" It's bolted down. Crew members get between them.`},
  {t:'👀 Stare them down',s:'luck',d:0,h:9,p:1,ok:`{A} steps in. "Go on. Blink." Nose to nose. Nobody blinks. The segment ends on the stare.`,g:`{A} steps in and says it off-mic, barely a whisper: "{PPV}." They stand there, nose to nose, as the noise builds around them. The show goes to break on the stare.`,no:`{A} steps in. "Look at me." {B} turns away first, but on their own terms.`,b:`{A} steps in. "Don't blink. Don't — oh." {A} blinks first. Then again. {B} smiles.`},
  {t:'🤝 Shake on it',calm:1,s:'pop',d:.05,h:6,p:3,ok:`{A} holds out a hand. "Best one wins." {B} takes it. They hold the grip for the cameras, and the crowd stands for both of them.`,g:`{A} holds out a hand and doesn't say a word. {B} looks at it, then at {A}, and shakes. Neither lets go first. The crowd stands for both of them.`,no:`{A} offers a hand. "Best one wins." {B} looks at it a beat too long before taking it. The moment is a little stiff.`,b:`{A} offers the wrong hand, the one holding the mic. "Best one — sorry." They sort it out. The moment is a little stiff.`},
  {t:'🎯 Make it official',s:'mic',d:.05,h:10,p:2,ch:1,ok:`"Then let's settle it. {PPV}." {B} nods. It's on.`,g:`"Fine. No more talking." {A} holds the mic out to {B}. "Say yes." {B} takes it. "Yes." It's on.`,no:`{A} points. "{PPV}. You and me." {B} walks off without answering.`,b:`"So — the match. Is it? Are we?" {B} walks off without answering.`}],
 down:[
  {t:'👊 Make them pay for it',rage:1,s:'ring',d:.1,h:11,p:1,ok:`{A} doesn't answer with words — just one: "Okay." Then {B} gets dropped, and suddenly nobody remembers the last word.`,g:`{A} lets {B} enjoy it for exactly one second. "That's your last word?" Then {B} is on the floor with {A} standing over them, and nobody remembers what {B} said.`,no:`{A} swings. "Say it again!" {B} sees it coming and slides away, smiling.`,b:`{A} swings. "Take th—" {A} misses. {B} is already backing away, smiling.`},
  {t:'🎤 Grab the mic back',s:'mic',d:.22,h:12,p:2,ok:`{A} takes the mic back. "Nice line. Shame you won't be able to say it at {PPV}." The last word isn't {B}'s after all.`,g:`{A} grabs the mic back. "Funny. You've been saying that for years. How's it working out?" Huge reaction. The last word isn't {B}'s after all.`,no:`{A} grabs the mic back. "Yeah, well — we'll see." Nothing lands. {B} wins this one.`,b:`{A} grabs the mic. "Well —" Nothing else comes. {B} wins this one.`},
  {t:'🚶 Let them have it',s:'luck',d:-.15,h:7,p:0,ok:`{A} shrugs. "Enjoy it." And walks off. It'll keep.`,g:`{A} nods, almost impressed. "Good one. Save it." And walks off. Whatever happens next, it's not happening here. It'll keep.`,no:`{A} shrugs. "Whatever." And walks off. It looks like {A} lost, because {A} did.`,b:`{A} walks off. "I'm — I'll get you next time." It looks like {A} lost.`}]};
const ZONE_TIP={up:`You're winning the exchange`,even:'Dead even',down:`{B} is winning the exchange`};
const zoneOf=M=>M>=1.5?'up':M<=-1.5?'down':'even';

/* ---------- building the beats ---------- */
/* v244: three decisions a promo (opening, one exchange call, closer); a hot feud between two great talkers gets a fourth */
function exLen(p,ctx){return heatOf(p.a,p.b)>=40&&mm(ctx.A)>=75&&mm(ctx.B)>=75?2:1}
const swPull=(ok,p)=>{const sw=swingOf(p);return ok?.75+sw.w:-(.5+sw.l*1.2)};
function xOf(p,ctx,st,o){const x=st.ex;const c=x.lastC||{};return Object.assign({i:intentOf(x.lastC),tc:(c.ex==='mid'?c.tc:c.rtc)||'',ok:x.lastOk?1:0,tier:rtTier(ctx.B),heat:heatOf(p.a,p.b)},o||{})}
/* v250: an answer never repeats a line the call's outcome just used ("Make me." twice in a row) */
const quotes=t=>(String(t).match(/"([^"]{4,})"/g)||[]).map(q=>q.slice(1,-1).toLowerCase());
const echoes=(o,st)=>{const L=String(st.lastTx||'').toLowerCase();return !!L&&quotes(o.t).some(q=>L.includes(q))};
function bLine(ctx,st,xi,moves){const x=st.ex;const ok=o=>!x.used.has(o.t)&&(!moves||moves.includes(o.m))&&!echoes(o,st);
 let el=RT.filter(o=>ok(o)&&rtFit(o,ctx,xi));
 /* nothing written for this exact call: fall back to the all-purpose answers (the ones written for any insult, brag, promise or mind game) before anything at all */
 if(!el.length){const any=RT.filter(o=>ok(o)&&rtFit(o,ctx,Object.assign({},xi,{anyI:1})));el=any.filter(o=>o.i==='*'||['insult','brag','promise','mind'].every(t=>o.i.split(' ').includes(t)));if(!el.length)el=any}
 if(!el.length)return null;
 return wpick(el,o=>rtSpec(o)*(xi.tier==='hi'&&o.mic==='hi'?2.5:1)*(seenP(o.t)?.12:1)*(o.m===x.lastM?.25:1))}
/* v250: xi / nxi limit an answer to (or keep it away from) what {B} was answering — "kneel", or "shake+ok" for a handshake that happened */
function gate(o,xi){const k=[xi.i,xi.i+(xi.ok?'+ok':'+no')];return (!o.xi||o.xi.split(' ').some(t=>k.includes(t)))&&(!o.nxi||!o.nxi.split(' ').some(t=>k.includes(t)))}
/* v253: bm / nbm keep an answer to (or away from) the kind of line {B} just said; bw needs {B} to be walking away */
const fitsB=(o,e)=>(!o.bw||!!(e.w||e.gone))&&(!o.bm||o.bm.split(' ').includes(e.m))&&(!o.nbm||!o.nbm.split(' ').includes(e.m));
/* v256: once the match is made — a contract on the table, or a challenge already accepted tonight — nobody asks for a yes again */
const made=(p,st)=>!!(p&&p.type==='contract'||st&&st.chal);
function genLine(tc,ctx,xi,e,mk){const l=(GEN[tc]||[]).filter(o=>okFor(o,ctx)&&rtExtra(o,ctx,xi)&&gate(o,xi)&&(!e||fitsB(o,e))&&!(mk&&o.ch));return l.length?wpick(l,o=>(seenP(o.ok)?.15:1)*(o.al||o.vs||o.hk||o.bt||o.hot?2:1)):null}
function tacScene(p,ctx,st,e,ai,pull){const x=st.ex;x.lastM=e.m;x.used.add(e.t);x.M0=x.M;x.bGone=!!e.gone;
 if(pull!==false){let v=MV[e.m]||0;const tier=rtTier(ctx.B);if(v<0)v*=tier==='hi'?1.3:tier==='lo'?.6:1;x.M=clamp(x.M+v,-4,4)}
 const xi=xOf(p,ctx,st);const live=tagHit('live',ctx.K||SC_DEF);
 const mk=made(p,st);const pool=(e.ch||[]).concat(FU[e.m]||[]).filter(o=>okFor(o,ctx)&&rtExtra(o,ctx,xi)&&gate(o,xi)&&fitsB(o,e)&&!(mk&&o.ch));
 const by={};pool.forEach(o=>{const t=o.tc||cls(o);(by[t]=by[t]||[]).push(o)});
 const lines={};TACS.forEach(tc=>{if(tc==='crowd'&&!live)return;if(tc==='resp'&&ctx.A.al!=='f'&&!by.resp&&!['respect','accept'].includes(e.m))return;
  /* after a beatdown, a counter or a retreat only the answers written for it make sense — no generic talk lines */
  const l=by[tc]?wpick(by[tc],o=>seenP(o.t)?.2:1):['laidout','fightback','retreat'].includes(e.m)||e.gone?null:genLine(tc,ctx,xi,e,mk);if(l)lines[tc]={l,own:!!by[tc]}});
 /* four calls: the ones written for this exact moment first, then the rest; shown in the same order every time */
 let ks=shuffle(Object.keys(lines).filter(k=>lines[k].own)).concat(shuffle(Object.keys(lines).filter(k=>!lines[k].own))).slice(0,4);
 ks=TACS.filter(k=>ks.includes(k));
 const ch=ks.map(tc=>{const l=lines[tc].l;return Object.assign({},l,{t:tacName(tc,ctx.A),tip:tacTip(tc,ctx.A),lt:l.lb||l.t,tc,ex:'mid',key:0,rt:0})});
 if(x.T>=1&&x.T<x.Tmax)ch.push({t:'🎬 Go to the closer',tip:'End it here',close:1,always:1,s:'luck'});
 if(!ai)noteP([e.t,...ch.filter(c=>c.lt).map(c=>c.lt)]);
 return {text:e.t,ch,rt:1,ex:'tac',m:e.m}}
function timeScene(ctx,st){st.ex.M0=st.ex.M;const tx=TIME_TX.filter(o=>okFor(o,ctx));return {text:pick(tx).t,ch:TIME_CH.map(c=>Object.assign({},c)),rt:1,ex:'time'}}
/* v250: right after {B} lands their big line, the set-up for the closer doesn't hand them a second last word */
/* v256: after a respectful call lands (a handshake, an honest compliment) the closer doesn't pretend it's a war:
   calmer set-up lines, and no brawl, cheap shot or knife-twist on the menu */
const CLOSE_CALM={up:`{B} nods. There's nothing left to argue about, and {A} has the room.`,even:`They've both said what they came to say. All that's left is how it ends.`,down:`{B} gets the last word, and it's a gracious one: "Good. Then let's give them a night to remember at {PPV}."`};
const CLOSE_AFTER={up:`{B} got that one in, but {A} still has the room.`,even:`That one landed. Now it's dead even, and it has to go somewhere.`,down:`{B} lets the line hang. Every eye in the building is on {A}.`};
function closeScene(p,ctx,st,ai,bLanded){const x=st.ex;x.M0=x.M;x.zone=zoneOf(x.M);const z=x.zone;
 const lc=x.lastC,calm=!bLanded&&!!x.lastOk&&!!lc&&lc.ex==='mid'&&lc.tc==='resp',mk=made(p,st);
 const tx=CLOSE_TX[z].filter(o=>okFor(o,ctx));const text=bLanded?CLOSE_AFTER[z]:calm?CLOSE_CALM[z]:(wpick(tx,o=>(seenP(o.t)?.2:1)*(o.vs?2:1))||CLOSE_TX[z][0]).t;
 let ch=dealChoices(CLOSE[z].filter(c=>(calm?!c.rage:!c.calm)&&!(mk&&c.ch)),ctx,z==='up'?2:3).map(c=>Object.assign({},c,{ex:'close'}));
 if(z==='up')ch=[mdChoice(ctx)].concat(ch);
 if(!ai)noteP([text]);return {text,ch,rt:1,ex:'close',zone:z,last:true,_md:1}}

/* v250: when a call ends with someone leaving ("{B} walks off", "{A} walks out"), the exchange is over — nobody answers
   a wrestler who isn't there. gone / back name the versions it applies to ('ok g no b', or 1 for all of them):
   gone — after this call, someone has left; back — after the other wrestler walked off, this call brings them back */
const verOf=(c,ok,w)=>{const t=voiceTier(w);return ok?(t==='hi'&&c.g?'g':'ok'):(t==='lo'&&c.b?'b':'no')};
const hasV=(f,c,ok,w)=>!!f&&(f===1||String(f).split(' ').includes(verOf(c,ok,w)));
const goneAfter=(c,ok,ctx)=>!!c&&hasV(c.gone,c,ok,ctx.A);
/* the same check for any promo: end — the segment is over (both are gone); gone — the other wrestler has left */
const exGone=(c,ok,ctx,f)=>!!c&&hasV(c[f||'gone'],c,ok,ctx.A);
/* the first beat — replaces the single response beat (rtScene) */
function exStart(p,ctx,st,ai){if(!rtOn(p,ctx)||!st||!st.lastC)return null;
 const c0=st.lastC,ok0=!!(st.oks||[]).slice(-1)[0];
 /* v256: an opening that ends the segment (a pull-apart brawl, a walk-out) ends it — nobody answers a brawl that already cleared the ring */
 if(goneAfter(c0,ok0,ctx)||exGone(c0,ok0,ctx,'end')){st.gone=1;return null}
 st.ex={T:0,Tmax:exLen(p,ctx),M:clamp(swPull(ok0,chance(c0,ctx))*.6,-4,4),M0:0,used:new Set(),lastC:c0,lastOk:ok0,hw:EX_HW/Math.max(1,exLen(p,ctx))};
 const e=bLine(ctx,st,xOf(p,ctx,st));if(!e){st.ex=null;return null}
 st.rtDone=1;
 /* v256: a twist that takes the closer's place comes after a face-to-face back-and-forth, so only twists written to land
    in the middle of a confrontation (fx) qualify — no crowd sing-alongs or "You deserve it!" while {B} is standing right there */
 ctx.EXTW=1;const tw=pickTwist(p,ctx,ai);ctx.EXTW=0;const keep=!!(tw&&(tw.hj||tw.myst||tw.cd))||Math.random()<(window.TW_P!=null?window.TW_P:(window.TW_RT_P||.25));
 st.tw=keep?tw:null;if(!keep){ctx.MYST=null;ctx.CD=null}
 if(rtTier(ctx.B)!=='lo'&&Math.random()<EX_TP){st.ex.tUsed=1;return timeScene(ctx,st)}
 return tacScene(p,ctx,st,e,ai)}
function rtOn(p,ctx){return !!(p&&p.b&&ctx&&ctx.A&&ctx.B&&['callout','champ','contract','interview'].includes(p.type)&&!inTeam(p.a,p.b))}
/* what comes after a call: another answer, a big line, the closer, or the twist in its place. {b:'r'|1, sc} or null when it's over */
function exNext(p,ctx,st,ai){const x=st.ex;if(!x||x.closed||st.drop)return null;
 if(x.lastC&&x.lastC.ex==='mid'&&!x.timing){const c=x.lastC,ok=x.lastOk;
  if(goneAfter(c,ok,ctx)||exGone(c,ok,ctx,'end')||x.bGone&&!hasV(c.back,c,ok,ctx.A)){x.closed=1;st.tw=null;st.gone=1;return null}x.bGone=0}
 if(x.T>=x.Tmax||x.toClose){const tm=x.timing;x.closed=1;x.timing=null;if(st.tw){const tw=st.tw;st.tw=null;return {b:1,sc:tw}}return {b:'r',sc:closeScene(p,ctx,st,ai,tm==='wait'||tm==='cut')}}
 if(x.timing){const t=x.timing;x.timing=null;
  const e=t==='ok'?bLine(ctx,st,xOf(p,ctx,st,{ok:1}),['rattled','stumble']):bLine(ctx,st,xOf(p,ctx,st,{ok:t==='cut'?0:1}),['personal','mock','flip']);
  /* v253: when {B}'s big line landed, {A} answers that line — {B} doesn't get a second one on top of it */
  if(e){const big=t!=='ok';const sc=tacScene(p,ctx,st,big?Object.assign({},e,{ch:null}):e,ai,false);if(big)sc.text=pick(HOLD_TX).t;return {b:'r',sc}}}
 else if(!x.tUsed&&x.T>=1&&rtTier(ctx.B)!=='lo'&&Math.random()<EX_TP){x.tUsed=1;return {b:'r',sc:timeScene(ctx,st)}}
 const e=bLine(ctx,st,xOf(p,ctx,st));if(!e){x.toClose=1;return exNext(p,ctx,st,ai)}
 return {b:'r',sc:tacScene(p,ctx,st,e,ai)}}
function exGo(PSx){const r=exNext(PSx.p,PSx.ctx,PSx.st);if(!r)return false;PSx.beat=r.b;PSx.scene=r.sc;return true}
/* "Go to the closer" skips straight there, no roll */
function exClose(PSx){if(!PSx.st.ex)return false;PSx.st.ex.toClose=1;return exGo(PSx)}
/* the rival's promos run the same exchange */
function exAuto(p,ctx,st,sc){let g=0;while(sc&&g++<14){const ch=sc.ch.filter(c=>!c.close);roll(aiChoose(ch,ctx),ctx,st);if(st.drop)return;
  const r=exNext(p,ctx,st,1);if(!r)return;sc=r.sc;if(r.b===1){if(!(typeof mdAI==='function'&&mdAI(p,ctx,st,sc)))roll(aiChoose(sc.ch,ctx),ctx,st);return}}}

/* ---------- scoring the calls ---------- */
const _chance=chance;
chance=function(c,ctx){return c&&c.wait&&ctx&&ctx.B?waitP(ctx):_chance(c,ctx)};
const _roll=roll;
roll=function(c,ctx,st){const out=roll0(c,ctx,st);if(st)st.lastTx=out&&out.text;return out};
function roll0(c,ctx,st){const x=st&&st.ex;
 if(x&&(c.ex==='mid'||c.ex==='time')){const f=['heat','hx','pop','chem'],s0={};f.forEach(k=>s0[k]=st[k]||0);const sc0=st.score,p=chance(c,ctx);let out;
  if(c.wait){const ok=Math.random()<p;if(ok){st.heat+=c.h||0;st.pop+=c.p||0}const text=fill(ok?c.ok:c.no,ctx);st.log.push(fill(c.t,ctx)+' — '+text);(st.oks=st.oks||[]).push(ok);st.lastC=c;out={success:ok,text}}
  else out=_roll(c,ctx,st);
  /* centred: what this call adds is how it went against how it was expected to go, plus a share of one old
     response beat's average, so a longer exchange swings more without rating higher */
  const sw=swingOf(p),ev=p*sw.w-(1-p)*sw.l;st.score=sc0+EX_RS*((out.success?sw.w:-sw.l)-ev)/.35;f.forEach(k=>{st[k]=s0[k]+((st[k]||0)-s0[k])*x.hw});
  const d=c.cut?(out.success?2:-2):c.wait?(out.success?1:-1.5):swPull(out.success,p);x.M0=x.M;x.M=clamp(x.M+d,-4,4);
  x.T++;if(c.ex==='mid'){x.lastC=c;x.lastOk=out.success}else x.timing=out.success?'ok':c.cut?'cut':'wait';
  return out}
 if(x&&(c.ex==='close'||c.drop)){const s0=st.score,h0=st.heat,p0=st.pop;const out=_roll(c,ctx,st);
  if(!c.drop){const L=window.RT_LAST||{score:1,heat:1,pop:1};st.score=s0+(st.score-s0)*L.score;st.heat=h0+(st.heat-h0)*L.heat;st.pop=p0+(st.pop-p0)*L.pop}
  st.score+=clamp(x.M,-3,3)*EX_MB;x.M0=x.M;x.M=clamp(x.M+(out.success?1:-1),-4,4);x.closed=1;return out}
 return _roll(c,ctx,st)}

/* ---------- the tug-of-war bar ---------- */
const short=w=>{const n=String(w.name||'');return n.length>14?n.split(' ').slice(-1)[0]:n};
function exBar(st,ctx){const x=st&&st.ex;if(!x||!ctx.B)return '';const pos=m=>50-m/4*44;
 const lab=x.M>=1.5?`${ctx.A.name} is winning the exchange`:x.M<=-1.5?`${ctx.B.name} is winning the exchange`:x.M>.4?`${ctx.A.name} has the edge`:x.M<-.4?`${ctx.B.name} has the edge`:'Dead even';
 const side=x.M>=1.5?'a':x.M<=-1.5?'b':'';
 return `<div class="exbar ${side}" style="--f:${pos(x.M0).toFixed(1)}%;--t:${pos(x.M).toFixed(1)}%"><span class="exn">${esc(short(ctx.A))}</span><div class="exrope"><u style="left:${Math.min(50,pos(x.M)).toFixed(1)}%;width:${Math.abs(pos(x.M)-50).toFixed(1)}%"></u><i></i><b></b></div><span class="exn">${esc(short(ctx.B))}</span></div><div class="exlab">${esc(lab)}</div>`}
const exLabel=sc=>sc.ex==='close'?'The closer':sc.ex==='time'?'The big line':'The exchange';
function exCall(sc,ctx){return sc.ex==='close'?['🎬 Take it home',`How does ${esc(ctx.A.name)} end it?`]:sc.ex==='time'?['⏱️ Timing',`${esc(ctx.B.name)} is winding up. What does ${esc(ctx.A.name)} do?`]:['🎧 In their ear',`How should ${esc(ctx.A.name)} answer?`]}

(function(){const c=document.createElement('style');c.textContent=`
.exbar{display:flex;align-items:center;gap:8px;margin:2px 0 2px}
.exbar .exn{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;opacity:.75;max-width:30%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.exbar.a .exn:first-child,.exbar.b .exn:last-child{opacity:1;color:var(--gold)}
.exrope{position:relative;flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.12)}
.exrope u{position:absolute;top:0;bottom:0;background:rgba(216,180,73,.45);border-radius:3px;transition:none}
.exrope i{position:absolute;top:-5px;bottom:-5px;left:50%;width:2px;margin-left:-1px;background:rgba(255,255,255,.4)}
.exrope b{position:absolute;top:50%;left:var(--t);width:18px;height:18px;margin:-9px 0 0 -9px;background:var(--gold);transform:skewX(-14deg);box-shadow:0 0 10px rgba(216,180,73,.55);animation:exk .8s cubic-bezier(.3,1.5,.5,1)}
@keyframes exk{from{left:var(--f)}to{left:var(--t)}}
.exlab{text-align:center;font-size:12px;opacity:.8;margin:2px 0 8px}
@media (prefers-reduced-motion:reduce){.exrope b{animation:none}}
`;document.head.appendChild(c)})();

window.rtScene=exStart;
Object.assign(window,{exGone,exStart,exNext,exGo,exClose,exAuto,exBar,exLabel,exCall,EX_GEN:GEN,EX_CLOSE:CLOSE,EX_CLOSE_TX:CLOSE_TX,EX_TIME_TX:TIME_TX,EX_TIME_CH:TIME_CH,EX_TAC:TAC});
})();
