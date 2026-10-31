/* Tony Khan Simulator — back-and-forth promos and the mic drop (v228).
   In a two-person callout, champion's address, contract signing or sit-down interview, the other wrestler now fires
   back after your first call, and your next three options answer what they actually said.

   How a response is chosen (rtScene):
     • what {A} just did — the option is read as an insult, a brag, a promise, mind games, a power play, a challenge,
       respect, a rough-up (shove, slap) or a big attack (chair, table, belt). See rtIntent.
     • whether it landed — a flubbed line gets mocked, a missed attack gets countered.
     • who {B} is — face or heel (vs), and how good they are on the mic. A weak talker (mic under 60, unless they have
       the Mouthpiece trait) only gets short, blunt or tongue-tied lines; the sharpest lines need a great talker (mic:'hi').
     • the situation — {B} or {A} holding a title (bt / at), a hot feud (hot), a PPV coming up for them (ppv), a big
       popularity gap (under = {B} is the underdog, big = {B} is the bigger star), and the setting (hk/nhk tags: no
       crowd lines in a studio interview, table lines only at a contract signing).
   Each response has a move (m) — mock, flip, brag, dismiss, personal, threat, accept, dodge, respect, laidout,
   fightback, retreat, crowd, rattled, defy, stumble — and {A}'s options come from that move's pool (FU) plus any
   options written for that exact line (ch), so every option is a direct answer to what {B} just said. Options follow
   the usual promo fields (al = {A}'s alignment, vs = {B}'s, s/d/h/p, ch = sets up a match).
   Balance: the response beat is centred on zero for the promo score (see roll below) and counts for RT_W of a normal
   call on heat and popularity; the rival's promos get it too, so the extra beat adds texture rather than stars. Loaded after the main script. */
'use strict';
(function(){
const RT_W=.25;         /* the response beat's weight on heat and popularity against a normal call */
const RT_SC=1.6;
const RT_RS=.6;          /* v236: the response beat swings like any call (riskier = bigger either way), at 60% of a full call */        /* its swing on the promo score: +RT_SC×(1−odds) if it lands, −RT_SC×odds if it doesn't */
const RT_TYPES=['callout','champ','contract','interview'];
const MD_SCORE=.3;
/* v233: once a promo has a back-and-forth, the old random twist is an occasional extra instead of a third beat every time.
   When it's skipped, the response is the closing call and counts as a full call (so ratings and heat hold). Twists that
   carry a storyline of their own — a crowd hijack, the mystery figure, the countdown clock — still come at their usual rate. */
const TW_RT_P=.25;
/* the closing response is weighted to match what the twist it replaces used to add on average (score, heat, popularity) */
const RT_LAST={score:.9,heat:.66,pop:1.4};      /* what a mic drop locks in (a landed call is worth ~1.4, a missed one −1 — so about a typical call's average) */

/* ---------- reading the call {A} just made ---------- */
function rtIntent(c){const t=(c.t||'').toLowerCase();
 if(/laugh in their face|pull it away|taunt|hide behind|embarrassing|footage|crimes|evidence/.test(t))return 'insult';
 if(/title match on the spot|any time, anywhere/.test(t))return 'accepted';
 if(c.ch||c.stp||/\bchallenge\b|prove it|stipulation|fight right here/.test(t))return 'challenge';
 if(/through the table|put .* through|table on|flip the table|smash|steel chair|nail .* with|press .* over|pull-apart brawl|by force/.test(t))return 'physical';
 if(/shove|slap|drag /.test(t))return 'rough';
 if(/greatest|not as great as|only weapon|unstoppable|record/.test(t))return 'brag';
 if(/won't take/.test(t))return 'snub';
 if(/handshake|shake /.test(t))return 'shake';
 if(/respectfully|toughest|history between|may the best|thank/.test(t))return 'respect';
 if(/kneel|\bbegs?\b|apologi/.test(t))return 'kneel';
 if(/fine print|clause/.test(t))return 'sneak';
 if(/partnership/.test(t))return 'partner';
 if(/hold the belt|belt in .* face|the belt —|belt to hold/.test(t))return 'belt';
 if(/earn a title shot|lawyer|security hold|refuse to sign/.test(t))return 'power';
 if(/stare|silen(?:ce|t)|calm|dissect|move by move|perfect line|empty chair|big screen|under their skin|weakness/.test(t))return 'mind';
 if(/promise|for everyone|nowhere left|what's coming|take something|crying by the end/.test(t))return 'promise';
 return 'insult'}
function rtTier(B){const m=B.mic+(hasT(B,'mouth')?10:0);return m<60?'lo':m>=80?'hi':'mid'}
function rtOn(p,ctx){return !!(p&&p.b&&ctx&&ctx.A&&ctx.B&&RT_TYPES.includes(p.type)&&!inTeam(p.a,p.b))}
/* the extra checks this file adds on top of okFor */
function rtExtra(o,ctx,x){if(o.nt&&x.tc&&o.nt.split(' ').includes(x.tc))return false;if(o.nx&&x.i&&o.nx.split(' ').includes(x.i+(x.ok?'+ok':'+no')))return false;if(o.bt&&!ctx.BT)return false;if(o.nbt&&ctx.BT)return false;if(o.at&&!ctx.T)return false;if(o.hot&&x.heat<40)return false;if(o.ppv&&!ctx.PPV)return false;
 if(o.under&&!(ctx.B.pop<=ctx.A.pop-12))return false;if(o.big&&!(ctx.B.pop>=ctx.A.pop+12))return false;return true}
function rtFit(o,ctx,x){if(!okFor(o,ctx)||!rtExtra(o,ctx,x))return false;
 if(o.i!=='*'&&!x.anyI&&!o.i.split(' ').includes(x.i))return false;
 const mt=o.mic||'';if(x.tier==='lo'){if(mt!=='lo'&&mt!=='*')return false}else{if(mt==='lo')return false;if(mt==='hi'&&x.tier!=='hi')return false}
 if(o.ok!=null&&o.ok!==x.ok)return false;return true}
const rtSpec=o=>(o.bt||o.at||o.hot||o.ppv||o.under||o.big||o.ok!=null||o.mic==='hi'||o.mic==='lo'||o.hk||o.al)?2.2:1;

/* ---------- {A}'s answers, by what {B} just did ---------- */
const FU={
mock:[
 {t:`Laugh it off: "That's the best you've got?"`,s:'mic',d:.1,h:10,p:2,ok:`{A} laughs. "That's the best you've got?" {B}'s grin slips.`,g:`{A} laughs, long and real. "That's it? I've had worse from my own family. At least they rehearse." {B}'s grin slips. The comeback stung more than the insult.`,no:`{A} laughs. "That's the best you've got?" The laugh sounds forced. {B} knows they got to {A}.`,b:`{A} laughs, chokes on it, coughs. "That's — the best you got?" {B} knows they got to {A}.`},
 {nxi:'shake snub kneel partner sneak respect rough physical accepted belt',t:`Fire back with something even more personal`,s:'mic',d:.15,h:14,p:1,ok:`{A} fires back. "At least my family still returns my calls, {B}." {B} flinches. That one crossed a line, and it worked.`,g:`{A} goes quiet, then says one true thing. "Everybody in the back knows why your partner left, {B}. They're just too polite to say it." {B} flinches. That one crossed a line, and it worked.`,no:`{A} fires back. "Yeah? Well, at least my mother likes me, {B}." It goes too far. Even {A}'s fans wince.`,b:`{A} fires back. "Oh yeah? Well — your — remember the thing with the bus?" Nobody understands it. Even {A}'s fans wince.`},
 {al:'f',hk:'live',t:`Let the crowd answer for {A}`,s:'pop',d:.05,h:8,p:3,ok:`{A} turns to the crowd. "You want to answer that for me?" The building drowns {B} out with "{A}" chants.`,g:`{A} lowers the mic and just holds it out to the crowd. "Go ahead." They answer, loud, and {A} never has to say another word. The building drowns {B} out with "{A}" chants.`,no:`{A} holds the mic out. "Tell {B} what you think!" The chant never gets going. Awkward silence.`,b:`{A} holds the mic out. "Tell 'em! Say my — say it!" The crowd chants {B}'s name instead. Awkward.`},
 {al:'h',t:`Pretend to cry, then smirk`,s:'mic',d:.05,h:12,p:2,ok:`{A} rubs their eyes. "Boo hoo." Then smirks. The fake tears are so smug it's sickening.`,g:`{A} sniffles, dabs an eye, wobbles their lip — and then the smirk, slow and nasty. "Oh no. Anyway." The fake tears are so smug it's sickening.`,no:`{A} fakes a sniffle. "Oh, that's so hurtful." Nobody's sure it was a joke. Neither is {A}.`,b:`{A} pretends to cry. "Boo hoo, you hurt my — oh no." {A} actually starts to. Nobody's sure it was a joke. Neither is {A}.`},
 {t:`Drop the mic and get in {B}'s face`,s:'ring',d:.1,h:13,p:1,ok:`{A} drops the mic and gets in {B}'s face. "Say it again." Nose to nose. Nobody is laughing now.`,g:`{A} lets the mic drop to the mat and steps in until there's no air between them. Off-mic, but everyone can read it: "Again. Say it again." Nobody is laughing now.`,no:`{A} drops the mic and steps in. "Say it to my face." {B} doesn't flinch. "I just did." {A} looks like they ran out of words.`,b:`{A} drops the mic on their own foot. "Ow — say it — say it to my face." {B} doesn't flinch.`},
 {nxi:'shake snub kneel partner sneak respect rough physical accepted belt',al:'f',t:`Admit it stung — and promise {B} will pay for it`,s:'mic',d:.1,h:10,p:3,ok:`"Okay, that stung. You're gonna pay for it." Honest and fired up. The fans are right there with {A}.`,g:`"Yeah. That one hurt." {A} nods, almost thankful. "Remember that it did. Because I'll remember who said it at {PPV}." Honest and fired up. The fans are right there with {A}.`,no:`{A} nods. "Okay. That one stung. You'll pay for it." It comes out more hurt than angry.`,b:`"That — that hurt my feelings. And you'll — you'll pay." It comes out more hurt than angry.`},
 {al:'h',t:`Tell {B} nobody here even knows their name`,s:'mic',d:.1,h:11,p:2,ok:`"Nobody here even knows your name." Cold. {B} looks around like they're checking.`,g:`{A} squints at {B}. "Sorry. Who are you, again?" Turns to the camera. "Anyone? Anyone know?" Cold. {B} looks around like they're checking.`,no:`{A} sneers. "Nobody here even knows your name." {B} leans into the mic. "{B}." Slowly, with a smile. Everybody knows it.`,b:`"Nobody even knows your name, {B}!" Saying it out loud, {A} realizes the problem.`},
 {t:`Say nothing and just smile`,s:'luck',d:0,h:8,p:1,ok:`{A} lowers the mic. "Mm." And just smiles. The smile says more than any comeback could.`,g:`{A} says one word. "Sure." Then just smiles. Holds it. Keeps holding it until {B} looks away first. The smile says more than any comeback could.`,no:`{A} smiles. "...Okay." Nothing follows. It reads as speechless.`,b:`{A} smiles. "Heh. Yeah." Then the smile slips, then comes back. It reads as speechless.`}],
flip:[
 {t:`Turn it right back on {B}`,s:'mic',d:.15,h:12,p:2,ok:`"Funny. That's exactly what everybody says about you." A perfect counter. {B} has nothing.`,g:`"Everything you just said about me?" {A} steps in. "Say it into a mirror. Out loud. Then call me and tell me how it went." A perfect counter. {B} has nothing.`,no:`{A} points right back. "No — that's you. Everything you said, that's you." It comes out tangled. {B} wins the exchange.`,b:`"No, you are! The thing you said! You're that." It comes out tangled. {B} wins the exchange.`},
 {t:`Concede the point — then land the knockout line`,s:'mic',d:.2,h:12,p:3,ok:`"You're right. And it won't matter." Huge reaction.`,g:`"You're right." {A} lets that sit. Lets {B} smile. "Every word. And at {PPV}, it won't matter even a little." Huge reaction.`,no:`{A} nods. "You're right." A pause. "And... that's fine, because, at {PPV}, it'll all — it won't matter." The setup works. The punchline doesn't.`,b:`"You're right. You're — you're right." {A} forgets the second half. The setup works. There's no punchline.`},
 {t:`Tell {B} words don't win matches`,s:'ring',d:.05,h:9,p:1,ok:`"Words don't win matches, {B}." {A} cracks their knuckles. Point made.`,g:`{A} cracks their knuckles one by one. "Talk all week, {B}. The bell doesn't listen." Point made.`,no:`{A} cracks their knuckles. "Words don't win matches." A long pause. It sounds like {A} has run out of words.`,b:`"Words don't win matches!" A long pause. "That's — that was my words." It sounds like {A} has run out.`},
 {al:'h',t:`Accuse {B} of reading off cue cards`,s:'mic',d:.1,h:10,p:2,ok:`{A} mimes flipping cue cards at {B}. "Did somebody write that for you?" Nasty, and very effective.`,g:`{A} mimes flipping a cue card. Then another. Then pretends to squint. "Sorry, {B}, could you hold that next one closer? I can't read your writer's handwriting." Nasty, and very effective.`,no:`{A} mimes flipping cue cards. "Who wrote that for you?" {B} holds up empty hands. "Nobody. That was all me." {A} looks silly.`,b:`{A} squints at {B}. "You're reading that off cue cards!" {A} is visibly glancing at something written on their own hand. {A} looks silly.`},
 {al:'f',t:`Tell {B} clever lines won't help when the bell rings`,s:'mic',d:.05,h:9,p:2,ok:`"Clever lines won't help you when that bell rings." Simple and true. The fans cheer.`,g:`"Great line, {B}. Really." {A} nods. "Bring it to {PPV}. See if the referee laughs." Simple and true. The fans cheer.`,no:`{A} shrugs. "Clever lines won't help when the bell rings. They won't. Trust me." It sounds a little defensive.`,b:`"Clever lines don't — the bell won't — it doesn't help." It sounds a little defensive.`},
 {ri:'shove',t:`Shove the mic into {B}'s chest`,s:'ring',d:.1,h:12,p:1,ok:`{A} shoves the mic into {B}'s chest. "Keep it." {B} stumbles back a step. Done talking.`,g:`{A} jams the mic into {B}'s chest hard enough to push them back a step. "Keep it. You'll need it to explain why you lost." Done talking.`,no:`{A} shoves the mic at {B}. "Here. You need it more than me." {B} catches it and keeps talking.`,b:`{A} shoves the mic at {B}. "Here, you — oops." It hits {B}'s shoulder and falls. {B} picks it up and keeps talking.`}],
brag:[
 {t:`Remind everyone who {B} lost to last time`,s:'mic',d:.1,h:12,p:2,ok:`"Remind everyone who beat you last time, {B}. Oh, right. Me." The air goes out of {B}'s victory lap.`,g:`"Funny, {B}. The last time you talked like this, you were on your back by the twelve-minute mark." {A} smiles. "I was there. I counted." The air goes out of {B}'s victory lap.`,no:`{A} grins. "Remind everyone who beat you last time." {B} shrugs. "That was two years ago." Old news.`,b:`"Remember who you lost to last time?" {B} names someone. Not {A}. {A} hadn't checked. {B} shrugs it off.`},
 {bt:1,t:`Tell {B} that {BT} title is only on loan`,s:'mic',d:.1,h:12,p:2,ok:`"That {BT} title? It's only on loan." {B} grips the belt a little tighter.`,g:`"Nice belt. Enjoy it." {A} taps the {BT} title. "It's a rental, {B}. And the return date is {PPV}." {B} grips the belt a little tighter.`,no:`{A} points at the belt. "That title's on loan." {B} holds it up. "Then come get it back." Possession is nine-tenths of the law.`,b:`"That title is only on loan! From — from the title. To you." {B} holds the belt up, unbothered.`},
 {t:`Mock {B}'s bragging with a slow clap`,s:'luck',d:.05,h:10,p:2,ok:`Clap… clap… clap. {A} slow claps the bragging. "Bravo. Really." It catches on.`,g:`Clap. A long wait. Clap. {A} doesn't smile once. "Take a bow." By the sixth, {B} has to stop talking. It catches on.`,no:`{A} slow claps. "Wonderful. Bravo." {B} bows. The clap backfires.`,b:`{A} starts a slow clap. "Bravo, brav—" It speeds up into normal applause. {B} bows.`},
 {al:'f',hk:'live',t:`Tell {B} the fans see right through it`,s:'pop',d:.05,h:9,p:3,ok:`"These fans see right through you, {B}." The fans roar in agreement.`,g:`{A} doesn't even look at {B}. Turns to the crowd. "Do you believe a word of that?" The answer comes back from twenty thousand people. The fans roar in agreement.`,no:`{A} turns to the crowd. "They see right through you, {B}!" A few fans actually cheer {B}.`,b:`"The fans see right through you! Right, fans?" A few fans actually cheer {B}.`},
 {al:'h',t:`Yawn loudly and check the time`,s:'luck',d:.05,h:10,p:2,ok:`{A} yawns loudly and checks the time. "Are we nearly done?" Maximum disrespect. {B} is fuming.`,g:`{A} yawns into the mic, enormous and slow, and checks a watch they aren't wearing. "Sorry. You were saying? Something about you?" Maximum disrespect. {B} is fuming.`,no:`{A} yawns. "Sorry. Long day." It just looks rude.`,b:`{A} yawns, then checks the time. "Is it — what time is it?" {A} actually looks tired. It just looks rude.`},
 {t:`Promise to be the one who ends it`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`"I'll be the one who ends it." The match is on.`,g:`"Everybody's tried to end it, {B}. I'm not trying." {A} points down at the mat. "I'm the one who does it, at {PPV}." The match is on.`,no:`{B} laughs. "Get in line."`,b:`"I'll end it! I'll be the — the one. Who ends." {B} laughs. "Get in line."`},
 {t:`Ask why someone so great still needs to say it`,s:'mic',d:.1,h:11,p:2,ok:`"If you're so great, why do you keep needing to say it?" {B} opens their mouth, then closes it.`,g:`"If you're the greatest, {B}…" {A} tilts their head. "Why do you keep telling us? The great ones never have to." {B} opens their mouth, then closes it.`,no:`{A} tilts their head. "If you're so great, why keep saying it?" {B} has an answer ready. "Because you keep needing to hear it." It's a good one.`,b:`"If you're so great, why do you — why are you saying it so much?" {B} has an answer ready. It's a good one.`}],
dismiss:[
 {gone:'no b',back:'ok g',t:`Refuse to leave until {B} takes this seriously`,s:'pop',d:.1,h:10,p:2,ok:`"I'm not leaving until you take this seriously." {A} plants their feet. {B} finally turns around.`,g:`{A} sits down cross-legged right where they are. "I've got all night, {B}. I'm not going anywhere until you look at me." {A} plants their feet. {B} finally turns around.`,no:`{A} plants their feet. "I'm not leaving until you take this seriously." {B} walks off anyway. {A} is left standing alone.`,b:`"I'm not leaving!" {B} walks off. {A} waits. Then leaves. {A} is left standing alone first.`},
 {back:1,t:`Get right in {B}'s face so they can't look away`,s:'ring',d:.1,h:13,p:1,ok:`{A} gets right in {B}'s face. "Look at me. Right here." Now {B} is paying attention.`,g:`{A} steps in close, closer, until {B} has to look at {A} or look at nothing. "There you are." Now {B} is paying attention.`,no:`{A} gets in close. "Look at me." {B} looks straight through {A}.`,b:`{A} gets in {B}'s face. "Look at — over here — look at me." {B} turns their head. {A} moves too. They do this for a while.`},
 {al:'f',t:`Tell {B} they'll be thinking about {A} every night until the match`,s:'mic',d:.1,h:10,p:3,ok:`"You're gonna be thinking about me every night until {PPV}." It gets under {B}'s skin.`,g:`"Go home, {B}. Brush your teeth. Turn off the light." {A} leans in. "That's when you'll see me. Every night until {PPV}." It gets under {B}'s skin. You can see it.`,no:`{A} leans in. "You'll be thinking about me every night until {PPV}." {B} waves it off again.`,b:`"You'll think about me every night! Every single night. When you sleep." {B} waves it off.`},
 {bw:1,ri:'rough',al:'h',gone:1,t:`Jump {B} from behind as they turn away`,s:'luck',d:.05,h:16,p:1,ok:`{B} turns to leave. {A} jumps them from behind. "Don't you walk away from me!" {B} crumples. Now they're paying attention.`,g:`{B} turns to leave. {A} is already moving: one shot, right in the back. "Turn around next time." {B} crumples. Now they're paying attention.`,no:`{B} turns to leave. {A} lunges. "Don't you turn your back on—" {B} sees it coming and slips away.`,b:`{A} lunges from behind. "Gotcha!" {A} misses by a mile. {B} slips away.`},
 {bw:1,gone:'no b',back:'ok g',t:`Demand a match so {B} can't ignore them`,s:'mic',d:.05,h:9,p:2,ch:1,ok:`"You can't ignore me forever, {B}. You and me, {PPV}." Put on the spot, {B} can't say no.`,g:`"You can walk away from me. You can't walk away from a contract." {A} points at {B}. "You and me at {PPV}. Say no in front of everybody." Put on the spot, {B} can't say no.`,no:`{A} calls after {B}. "You and me at {PPV}! You hear me?" {B} keeps walking.`,b:`"I demand a match! Right — later. A match later." {B} keeps walking.`},
 {bw:1,gone:'no b',back:'ok g',t:`Laugh: "Walk away. That's what you're good at."`,s:'mic',d:.1,h:11,p:2,ok:`"Walk away. That's what you're good at." {B} stops dead in their tracks.`,g:`{A} laughs into the mic. "That's it, {B}. Walk away. You've had a lot of practice." {B} stops dead in their tracks.`,no:`{A} laughs. "Walk away. That's what you're good at." {B} keeps walking — and waves.`,b:`"Walk away! That's what you — you're good at walking." {B} keeps walking — and waves.`}],
personal:[
 {al:'f',t:`Go quiet — then promise {B} will regret that`,s:'mic',d:.1,h:14,p:3,ok:`{A} goes quiet, then: "You're gonna regret that." The anger in {A}'s voice gives everyone chills.`,g:`{A} goes completely still. When {A} speaks, it's barely above a whisper. "You're going to wish you hadn't said that. I'm going to make sure of it." The anger in {A}'s voice gives everyone chills.`,no:`{A} goes quiet. "You're — that's —" {A} can't get the words out. {B} smirks.`,b:`{A} goes quiet, then louder, then: "You'll re — you'll regret that." {B} smirks.`},
 {ri:'rough',gone:'ok g',al:'f',t:`Charge at {B} — security can't hold {A} back`,s:'ring',d:.1,h:16,p:2,ok:`{A} charges at {B}. "Come here! Come HERE!" It takes four officials to pull {A} off.`,g:`{A} drops the mic and charges. "You don't talk about that! Ever!" It takes four officials and one producer to drag {A} off, still pointing at {B}.`,no:`{A} charges. "Get over here!" Security gets there first. {B} laughs from behind them.`,b:`{A} charges. "I'm gonna — whoa!" {A} trips over the mic cord, and security gets there first. {B} laughs from behind them.`},
 {al:'h',t:`Smile and say it doesn't hurt — then go even lower`,s:'mic',d:.2,h:16,p:1,ok:`{A} smiles. "That didn't hurt." Then goes even lower. Vicious. Nobody can believe it.`,g:`{A} shrugs. "Doesn't hurt. Want to know what would?" And says it — the one thing nobody says about {B}. Vicious. Nobody can believe it.`,no:`{A} smiles. "That didn't hurt. You know what would? Your kid watching you lose." Even heels have limits. Everyone turns on {A}.`,b:`"Didn't hurt! But this will —" {A} trails off into something that makes no sense at all. Everyone turns on {A}.`},
 {t:`Tell {B} that line just cost them`,s:'mic',d:.1,h:12,p:2,ok:`"That line just cost you, {B}." Quiet and cold. Everyone knows it's serious now.`,g:`"That line." {A} nods slowly. "You'll pay for that line every minute of {PPV}. I'll make it last." Quiet and cold. Everyone knows it's serious now.`,no:`{A} points. "That line just cost you." It sounds like a bluff.`,b:`"That just cost you! Big. That cost a lot." It sounds like a bluff.`},
 {gone:1,t:`Throw the mic down and walk off without a word`,s:'luck',d:0,h:12,p:1,ok:`{A} looks at {B} for a long second. "We're done." Throws the mic down and walks off. The silence is deafening. That hit home.`,g:`{A} says two words, very quietly: "Not here." Drops the mic, turns, and walks away without a single look back. The silence is deafening. That hit home.`,no:`{A} throws the mic down. "I don't need this." {A} walks off. It looks like {B} won the exchange.`,b:`{A} throws the mic down. "I'm done!" It bounces back up at them. They walk off. It looks like {B} won.`},
 {ri:'rough',gone:'ok g',al:'h',t:`Pretend not to care, then cheap-shot {B}`,s:'luck',d:.1,h:15,p:1,ok:`{A} shrugs. "Whatever. Doesn't matter." Then cheap-shots {B}. Low blow. {B} drops.`,g:`"That doesn't bother me." {A} shrugs, turns half away — and drops {B} with a low blow. "Now it bothers you." Low blow. {B} drops.`,no:`{A} shrugs. "Doesn't bother me." {A} swings, but {B} blocks it and shoves {A} away.`,b:`{A} shrugs. "I don't care. At all. Not even —" {A} winds up so obviously that {B} blocks it.`},
 {al:'f',t:`Take a breath: "That's low, even for you"`,s:'mic',d:.05,h:10,p:3,ok:`{A} takes a breath. "That's low, even for you." Calm and wounded. Everyone turns on {B}.`,g:`{A} takes a long breath. "That's low, {B}. Even for you." A pause. "I'm going to remember you said it." Calm and wounded. Everyone turns on {B}.`,no:`{A} takes a breath. "That's low, even for you." It sounds like {B} won that round.`,b:`"That's low. That's really — that's low." It sounds like {B} won that round.`},
 {t:`Bring up something {B} would rather forget`,s:'mic',d:.15,h:14,p:1,ok:`{A} leans in. "You want to talk about Louisville, {B}? Because I will." {B} goes pale. Two can play that game.`,g:`{A} leans in. "Want to talk about the night in Louisville? No?" A small smile. "Then don't bring up mine." {B} goes pale. Two can play that game.`,no:`{A} leans in. "Want to talk about the night in Louisville?" {B} laughs. "Sure. I won." It doesn't land.`,b:`{A} leans in. "Remember when you got fired from — that was someone else." It doesn't land.`}],
threat:[
 {t:`Tell {B} to stop talking and do it`,s:'ring',d:.1,h:12,p:2,ch:1,ok:`"Then stop talking and do it." The match is on.`,g:`"Stop telling me what you'll do." {A} points at the floor between them. "Then do it." The match is on.`,no:`{B} smiles. "When I decide."`,b:`"Stop talking! And — do it! Do the thing." {B} smiles. "When I decide."`},
 {t:`Take off the jacket and wait`,s:'pop',d:.05,h:11,p:2,ok:`{A} takes off the jacket. "Whenever you're ready." The air changes. {B} has to back it up now.`,g:`{A} takes off the jacket, folds it neatly and sets it down. "Go on, then." The air changes. {B} has to back it up now.`,no:`{A} takes off the jacket. "Let's go." They stand there. Nothing happens.`,b:`{A} yanks at the jacket. "Let's — hang on — let's go." The sleeve is stuck. They stand there. Nothing happens.`},
 {ri:'insult',al:'h',hk:'live',t:`Hide behind the referee, then taunt`,s:'luck',d:.05,h:10,p:2,ok:`{A} hides behind the referee. "Come on, then! Hit the ref!" Gutless and infuriating. Perfect.`,g:`{A} slides behind the referee, peeks out, and wiggles their fingers at {B}. "Come on, then. Hit a ref on TV." Gutless and infuriating. Perfect.`,no:`{A} ducks behind the referee. "Go on, {B}—" The referee steps aside. {A} is exposed.`,b:`{A} crouches behind the referee. "Can't get me!" The referee is very short. The referee steps aside. {A} is exposed.`},
 {al:'f',t:`Step forward until they're nose to nose`,s:'ring',d:.1,h:13,p:2,ok:`{A} steps forward until they're nose to nose. "Do something." Neither one blinks. The tension is real.`,g:`{A} takes one slow step forward. Then another. "I'm right here." Until they're nose to nose. Neither one blinks. The tension is real.`,no:`{A} steps forward. "I'm right here, {B}." {B} shoves first. {A} is caught off balance.`,b:`{A} steps forward too fast. "Right here! Ow." They bump foreheads. {B} shoves first.`},
 {t:`Say they've heard threats from better than {B}`,s:'mic',d:.1,h:11,p:2,ok:`"I've heard threats from better people than you." {B}'s jaw tightens.`,g:`"I've been threatened by better, {B}." A slow look up and down. "Then I beat them. They're still in physical therapy." {B}'s jaw tightens.`,no:`{B} laughs. "Name one."`,b:`"I've had better threats! From — people." {B} laughs. "Name one."`},
 {ri:'power',gone:'ok g b',al:'h',t:`Call security on {B} — then laugh`,s:'luck',d:.05,h:12,p:1,ok:`{A} waves at the guards. "Security! This one's threatening me!" {A} laughs as {B} is escorted out, seething.`,g:`{A} waves over the guards. "This one, please. I'm scared." {A} laughs as {B} is walked out. "Bye, {B}!" {B} is escorted out, seething.`,no:`{A} waves at the guards. "Get them out of here!" Security takes {B}'s side.`,b:`{A} waves at the guards. "Security! Take — no, not me!" Security escorts {A} out instead.`},
 {al:'f',t:`Laugh: "Get in line"`,s:'mic',d:.05,h:9,p:2,ok:`{A} laughs. "Get in line." Unbothered. The fans cheer.`,g:`{A} laughs. "Get in line, {B}." Points at the long line of people behind them. "It's long. It moves slow. Nobody's ever made it to the front." Unbothered. The fans cheer.`,no:`{A} laughs. "Get in line." {B} doesn't think it's funny.`,b:`"Get in line! There's a line. Behind — behind other people." {B} doesn't think it's funny.`},
 {hk:'live',t:`Point to the ring: "Then let's go. Right now."`,s:'ring',d:.1,h:13,p:2,ch:1,ok:`"Then let's go. Right now." {B} has to accept. The match is made.`,g:`{A} points to the ring. "You want to hurt me? There it is. Right now. Nobody's stopping you." {B} has to accept. The match is made.`,no:`{B} smiles and backs off. "Not yet."`,b:`"Let's go! Right now! In the — in there." {B} smiles and backs off. "Not yet."`}],
accept:[
 {t:`Make it official — right now`,s:'mic',d:.05,h:9,p:2,ch:1,ok:`"Let's make it official, right now." It's done. The match is made.`,g:`{A} won't let {B} take it back. "You heard it. Everybody heard it. It's official." The match is made.`,no:`{A} grabs a pen. "Let's make it official, right now." They argue over terms. Nothing gets signed tonight.`,b:`"Let's make it official!" Nobody has a pen. They argue over terms. Nothing gets signed tonight.`},
 {t:`Raise the stakes: no excuses, no rematch`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`"No excuses. No rematch." This just got serious.`,g:`"No excuses. No rematch. No 'I was hurt.'" {A} holds out a hand. "Whoever loses, never asks again." This just got serious.`,no:`{A} holds out a hand. "No excuses. No rematch." {B} won't take it. "Not on your terms." Not yet.`,b:`"No excuses! No rematch! No — rematches." {B} won't agree. Not yet.`},
 {al:'f',t:`Offer a handshake to seal it`,s:'pop',d:.05,h:6,p:3,ok:`{A} offers a hand. "Let's do this right." They shake. The fans applaud.`,g:`{A} holds out a hand. "Let's give them the best one we've got." {B} shakes it. They hold the grip. The fans applaud.`,no:`{A} offers a hand. "Deal?" {B} leaves the hand hanging.`,b:`{A} offers a hand. "Deal? Wait —" {A} switches the mic to the other hand. {B} leaves the hand hanging.`},
 {ri:'rough',gone:'ok g',al:'h',t:`Agree — then attack {B} before the handshake`,s:'luck',d:.1,h:16,p:1,ok:`{A} nods. "Deal." Then attacks {B} before the handshake. Classic. {B} is down before they knew what hit them.`,g:`"Deal." {A} holds out a hand, warm smile, and the second {B} reaches — the shot. "Never trust a handshake, {B}." Classic. {B} is down before they knew what hit them.`,no:`{A} holds out a hand. "Deal." {B} expected it and counters.`,b:`{A} into the mic: "Deal! And now I attack you." {B} expected it and counters.`},
 {t:`Tell {B} they just made the worst mistake of their career`,s:'mic',d:.1,h:11,p:2,ok:`"You just made the worst mistake of your career." Delivered with total conviction.`,g:`"You just signed up for the worst night of your career, {B}." {A} doesn't smile. "I'll make sure people remember it. You won't want to." Delivered with total conviction.`,no:`{B} grins. "We'll see."`,b:`"That was the worst mistake you've ever made! In your career. Or — ever." {B} grins. "We'll see."`},
 {t:`Stare {B} down until the lights go out`,s:'pop',d:.05,h:10,p:1,ok:`{A} lowers the mic. "{PPV}." Then stares {B} down until the lights go out. Two people who can't wait.`,g:`{A} says one word: "Soon." Neither of them moves after that. Neither of them speaks. The lights dim, then cut out on two people who can't wait for {PPV}.`,no:`{A} stares {B} down. "Soon." The director cuts away too early.`,b:`{A} stares {B} down. "Soon. Very — oh." {A} blinks first. The director cuts away too early anyway.`}],
dodge:[
 {al:'f',t:`Call {B} a coward in front of everyone`,s:'mic',d:.05,h:12,p:3,ok:`"You're a coward, {B}. Everybody knows it." It sticks instantly.`,g:`{A} looks around. "Somebody say it, because {B} won't." A beat. "Coward." It sticks instantly.`,no:`{A} points. "You're a coward." {B} shrugs. "I've been called worse by better." It doesn't stick.`,b:`"You're a coward! A cowardly coward." {B} shrugs. They've been called worse.`},
 {gone:'no b',t:`Promise to keep showing up until {B} says yes`,s:'pop',d:.05,h:10,p:2,ok:`"I'll keep showing up until you say yes." {B} realizes this isn't going away.`,g:`"Say no tonight. Say no next week." {A} shrugs. "I'll be here. I'll keep coming back. You'll run out of no before I run out of weeks." {B} realizes this isn't going away.`,no:`{A} points. "I'll keep showing up until you say yes." {B} looks relieved to leave.`,b:`"I'll keep showing up! Every week. Until... you say yes. Or I get bored." {B} looks relieved to leave.`},
 {hk:'live',gone:'no b',back:'ok g',t:`Block the ramp so {B} can't leave`,s:'ring',d:.1,h:13,p:2,ok:`{A} walks up the ramp and blocks it. "Where are you going?" {B} is trapped. Nowhere to run.`,g:`{A} walks up the ramp and stands at the top, arms folded, blocking the curtain. "Other way, {B}." {B} is trapped. Nowhere to run.`,no:`{A} blocks the ramp. "You're not leaving." {B} goes through the crowd instead.`,b:`{A} plants themselves on the ramp. "Nobody leaves!" {B} just uses the other entrance.`},
 {al:'f',hk:'live',gone:'no b',back:'ok g',t:`Get the crowd chanting for {B} to say yes`,s:'pop',d:.1,h:11,p:3,ch:1,ok:`{A} turns to the crowd. "Tell {B} to say yes!" They do. Shamed in front of thousands, {B} finally agrees.`,g:`{A} holds the mic up to the crowd and starts it: "Say yes!" Twenty thousand people take over. {A} just points at {B}. Shamed in front of thousands, {B} finally agrees.`,no:`{A} lifts the mic to the crowd. "Say yes! Say yes!" {B} covers their ears and walks off.`,b:`{A} lifts the mic to the crowd. "Everybody! Say — say yes!" The crowd chants "NO." {B} covers their ears and walks off.`},
 {back:1,t:`Offer {B} whatever terms they want`,s:'mic',d:.1,h:9,p:2,ch:1,ok:`"Whatever terms you want. Just say yes." {B} can't resist. The match is on.`,g:`"Pick the date. Pick the rules. Pick the referee if you want." {A} spreads their hands. "Then show up." {B} can't resist. The match is on.`,no:`{A} spreads their hands. "Whatever terms you want." {B} still won't commit.`,b:`"Any terms! Any — well, not any. Most terms." {B} still won't commit.`},
 {al:'h',t:`Out-weasel {B}: "Fine. I'll find you when you least expect it."`,s:'mic',d:.1,h:12,p:2,ok:`"Fine. I'll find you when you least expect it." Now {B} has to look over their shoulder.`,g:`"Fine." {A} shrugs. "Don't sign anything. I'll find you when you least expect it. Parking lot. Catering. Your hotel." A wink. "Sleep well." Now {B} has to look over their shoulder.`,no:`{A} shrugs. "Fine. I'll find you when you least expect it." {B} laughs. "That's my line." Two cowards, one ring.`,b:`"I'll find you when you least — when you don't expect it! Next Tuesday." {B} laughs. Two cowards, one ring.`}],
respect:[
 {nxi:'shake snub',t:`Shake hands and promise to give everything`,s:'pop',d:.05,h:5,p:3,ok:`{A} offers a hand. "Everything I've got. Same from you." {B} shakes it. A real moment. The fans applaud them both.`,g:`{A} offers a hand. "I'll give you everything I've got. And I expect the same." {B} shakes it. A real moment. The fans applaud them both.`,no:`{A} offers a hand. "I'll, uh — give everything. You know." They shake. It's a little awkward, but sincere.`,b:`{A} offers a hand. "Everything I've — wrong hand. Sorry." They grab the wrong hands. It's a little awkward, but sincere.`},
 {t:`Thank {B}, then remind them friendship ends at the bell`,s:'mic',d:.05,h:8,p:2,ok:`"Thanks, {B}. But when that bell rings, we're not friends." Respect and fire. The perfect build.`,g:`"Thank you, {B}. I mean it." {A} holds the handshake. "And when the bell rings, I'm going to try to end your career." Respect and fire. The perfect build.`,no:`{A} nods. "Thanks. And when the bell rings, I'll hurt you." It sounds more like a threat than intended.`,b:`"Thank you. But at the bell — friendship ends. Then it starts again after." It sounds more like a threat than intended.`},
 {ri:'insult',al:'h',nxi:'shake+ok',t:`Pretend to shake — then laugh in {B}'s face`,s:'mic',d:.1,h:14,p:1,ok:`{A} reaches out, then pulls the hand back. "Ha! As if." {A} laughs in {B}'s face. Disgusting. Everyone hates it.`,g:`{A} reaches out, {B} reaches back, and {A} pulls the hand up to fix their hair, laughing. "Did you really think so? After everything?" Disgusting. Everyone hates it.`,no:`{A} reaches out. "Respect, right?" {B} saw it coming and just shakes their head. "Not falling for that."`,b:`{A} reaches out to fake it. "Respect, sure—" {A} actually shakes by mistake, then laughs anyway. "Ha! Got you." {B} just shakes their head.`},
 {t:`Tell {B} this match will be the best of both their careers`,s:'mic',d:.1,h:7,p:3,ch:1,ok:`"This is going to be the best match either of us has ever had." Everyone wants it, so it's booked.`,g:`"Best match of your career, {B}." {A} nods at them. "Best of mine too. And only one of us gets to remember it as a win." Everyone wants it, so it's booked.`,no:`{A} nods. "This'll be the best match either of us ever has." Everyone wants it, but nothing is signed.`,b:`"It'll be the best match of our careers! Of my career. Yours too." Everyone wants it, but nothing is signed.`},
 {al:'h',t:`Tell {B} respect is for losers`,s:'mic',d:.05,h:12,p:2,ok:`"Respect is for losers, {B}." {B}'s face falls. Cold.`,g:`{A} looks at the offered hand. "Respect is what people give you when you lose and they feel bad." A shrug. "I don't need it." {B}'s face falls. Cold.`,no:`{A} sneers. "Respect is for losers." It sounds petty.`,b:`"Respect is for losers! And I'm not a loser. So no respect." It sounds petty.`},
 {gone:1,t:`Nod once and walk away — nothing left to say`,s:'luck',d:0,h:5,p:2,ok:`{A} nods once. "See you there." And walks away. Nothing left to say. Understated and classy.`,g:`{A} nods once at {B}. Puts the mic to their mouth, then thinks better of it. "...Yeah." Puts it down. Walks away. Everybody knows. Understated and classy.`,no:`{A} nods. "Right." And walks away. It looks like {A} didn't know what to say.`,b:`{A} nods once, walks away, then comes back to grab the mic and say "Okay." It looks like {A} didn't know what to say.`}],
laidout:[
 {gone:1,t:`Stand tall over {B}`,s:'pop',d:.05,h:10,p:3,ok:`{A} stands tall over {B}. "Look at you." {A} poses over the wreckage. The image of the night.`,g:`{A} plants a boot on {B}'s chest and raises one arm. "Get the shot." Waits for the camera. Holds it. Holds it. The image of the night.`,no:`{A} stands over {B}. "One more for—" Officials pull {A} away before the shot lands.`,b:`{A} poses over {B}. "Who's the — hey!" {B} rolls out from under the boot. Officials pull {A} away.`},
 {gone:1,al:'h',t:`Keep going — one more shot for good measure`,s:'ring',d:.1,h:15,p:1,ok:`{A} picks {B} up. "We're not done." One more shot for good measure. Excessive. Cruel. Everyone is livid.`,g:`The refs are coming. {A} sees them, smiles, and drops one more shot anyway — slow, deliberate. "That one was extra." Excessive. Cruel. Everyone is livid.`,no:`{A} reaches for {B}. "One more—" Referees swarm {A} before they can do it.`,b:`{A} winds up. "One more for — oh no." {A} hits the referee instead. Referees swarm {A}.`},
 {gone:1,t:`Grab a mic and leave {B} a message`,s:'mic',d:.1,h:12,p:2,ok:`{A} grabs a mic and leans down. "Remember this feeling." Chilling.`,g:`{A} kneels with the mic, close to {B}'s ear. "Remember this feeling. You'll have it again at {PPV}. Longer." Chilling.`,no:`{A} grabs a mic and leans down. "Remember this—" The mic's dead. {A} throws it down.`,b:`{A} grabs a mic and forgets the message. "Uh — this. Remember this." The mic's dead anyway.`},
 {gone:1,al:'f',t:`Back off before it goes too far`,s:'pop',d:0,h:7,p:3,ok:`{A} raises a hand and steps back. "That's enough." {A} knows when to stop. The fans respect it.`,g:`{A} stops, hand raised, and steps back. "That's enough." Looks down at {B}. "I want you healthy at {PPV}." {A} knows when to stop. The fans respect it.`,no:`{A} steps back. "Okay. That's — that's enough." It looks like {A} lost their nerve.`,b:`{A} backs off. "Enough." Steps back in. "No — enough." Backs off again. It looks like {A} lost their nerve.`},
 {gone:1,al:'h',t:`Pose with {B}'s gear like a trophy`,s:'luck',d:.05,h:13,p:2,ok:`{A} drapes {B}'s jacket over their own shoulders. "Looks better on me." Vile.`,g:`{A} picks up {B}'s jacket, puts it on and does {B}'s own pose right over them. "Is this how it goes?" Vile.`,no:`{A} pulls on {B}'s jacket. "Look at me, I'm—" The jacket rips. Less intimidating.`,b:`{A} wrestles with {B}'s jacket. "Look at — why are there so many arms—" The jacket rips. Less intimidating.`},
 {gone:1,t:`Walk away without looking back`,s:'luck',d:0,h:9,p:1,ok:`{A} turns away. "Done." Walks off without looking back. Cold and calm. Business is done.`,g:`{A} steps over {B}, picks up their own jacket and says it to no one in particular: "Next." Walks away without once looking back. Cold and calm. Business is done.`,no:`{A} turns. "We're finished." {B} starts to stir as {A} leaves. Not quite the finish.`,b:`{A} walks away. "Done. Totally done." Glances back to check, twice. {B} starts to stir. Not quite the finish.`},
 {gone:1,al:'f',hk:'live',t:`Point to the crowd, then down at {B}: "That was for them"`,s:'pop',d:.05,h:10,p:3,ok:`{A} points to the crowd, then down at {B}: "That was for them." The fans roar. Justice, at last.`,g:`{A} points to the crowd, every side of the building, then down at {B}. "That was for them. Every single one." The fans roar. Justice, at last.`,no:`{A} points to the crowd. "That was for—" {B} rolls away before {A} finishes.`,b:`{A} points to the crowd, then down. "That was for them!" {B} has already rolled away.`}],
fightback:[
 {ri:'rough',hk:'live',gone:'ok g',t:`Roll out of the ring and regroup`,s:'luck',d:0,h:8,p:1,ok:`{A} rolls out of the ring. "Not like this. Not tonight." {A} gets out before it gets worse.`,g:`{A} rolls out, holds the ropes and takes a breath, eyes never leaving {B}. "Okay. Okay." {A} gets out before it gets worse.`,no:`{A} rolls out. "Time out, time out—" {B} follows them out.`,b:`{A} rolls out of the ring and lands awkwardly. "Ow. Timeout!" {B} follows them out.`},
 {ri:'rough',gone:'ok g',t:`Swing for the fences`,s:'ring',d:.15,h:14,p:2,ok:`{A} plants a foot. "Here it comes!" The swing lands. Both are down. Chaos.`,g:`{A} plants a foot. "Come on, then!" Swings everything they've got. It lands. Both of them go down. Chaos.`,no:`{A} winds up. "Here it comes!" {B} ducks again. {A} is hurting.`,b:`{A} winds way back. "Here comes the big —" {B} steps aside. {A} spins around and falls. {A} is hurting.`},
 {ri:'rough',al:'h',gone:'ok g',t:`Beg off, then rake {B}'s eyes`,s:'luck',d:.1,h:13,p:1,ok:`{A} puts their hands up. "Wait, wait, please—" Then rakes {B}'s eyes. Dirty, but it works. {A} escapes.`,g:`{A} drops to their knees, hands up, pleading — "Please, {B}, please" — then rakes the eyes and scrambles away. Dirty, but it works. {A} escapes.`,no:`{A} puts their hands up. "Please, I'm done, I'm—" {B} isn't falling for it twice. "Nice try."`,b:`{A} puts their hands up, way too dramatic. "Please! I'm SO hurt!" Everyone sees the trick coming. {B} isn't falling for it.`},
 {hk:'live',ri:'rough',gone:'g',al:'f',t:`Fire up and trade blows in the middle of the ring`,s:'ring',d:.1,h:13,p:3,ok:`{A} fires up. "Come on! COME ON!" They trade blows. Every one of {A}'s punches lands.`,g:`{A} shakes off the shot and screams. "THAT ALL YOU GOT?" Right. Left. Right. {A} doesn't stop until {B} drops.`,no:`{A} fires up. "Come on!" They trade blows, and {B} gets the last shot in.`,b:`{A} fires up. "One! Two! Uh — four?" {A} loses count of their own punches. {B} gets the last shot in.`},
 {hk:'live',gone:1,t:`Back up the ramp, pointing: "This isn't over"`,s:'mic',d:.05,h:10,p:1,ok:`{A} backs up the ramp, pointing: "This isn't over." The threat lingers as the lights go down.`,g:`{A} backs up the ramp, slowly, one finger pointed at {B} the whole way. At the top: "This isn't over." The lights go down. The threat lingers.`,no:`{A} backs up the ramp, pointing. "This isn't over!" It looks like a retreat — because it is.`,b:`{A} backs up the ramp. "This isn't over! This isn't — whoa!" {A} trips on the top step and disappears backwards. It looks like a retreat.`},
 {ri:'rough',gone:'ok g',t:`Go right back at {B}`,s:'ring',d:.15,h:14,p:2,ok:`{A} gets up. "My turn." {A} goes right back at {B} and levels them. Now it's even.`,g:`{A} gets up and walks straight back at {B}, no hesitation. "Is that it?" Then the hardest shot of the night. Now it's even.`,no:`{A} gets up. "My turn!" {B} is ready. {A} eats another one.`,b:`{A} charges back in. "Now you're —" A wild swing misses. {B} is ready. {A} eats another one.`},
 {hk:'studio',ri:'rough',gone:'ok g',t:`Shove the table aside and go after {B}`,s:'ring',d:.12,h:13,p:2,ok:`{A} shoves the table aside. "Sit down? Make me." They crash into the backdrop together, and the feed cuts out.`,g:`{A} plants both hands on the table and drives it into {B}'s legs. "Sit down yourself." Then they're on each other, the crew dives in, and the feed cuts out.`,no:`{A} shoves the table. It doesn't budge for {A} either. {B} just watches.`,b:`{A} heaves at the table. "Come — this stupid —" It's bolted down. {B} waits, arms folded.`},
 {hk:'studio',t:`Sit back down like nothing happened`,s:'luck',d:.05,h:9,p:1,ok:`{A} sits back down and straightens their jacket. "Where were we?" Cold, and somehow worse.`,g:`{A} sits, crosses one leg over the other and smiles at {B}. "Go on. You were saying?" {B} has no idea what to do with that.`,no:`{A} sits back down. "Fine." It looks like {A} backed off, because {A} did.`,b:`{A} goes to sit down and misses the chair. {B} doesn't even laugh. That's worse.`}],
retreat:[
 {hk:'live',gone:'no b',back:'ok g',t:`Chase {B} up the ramp`,s:'ring',d:.1,h:12,p:2,ok:`{A} sprints up the ramp. "Where do you think you're going?" {A} catches {B} at the stage. The fans love it.`,g:`{A} sprints up the ramp. "No, no, no — you're not leaving!" {A} catches {B} at the stage, right in front of the screen. The fans love it.`,no:`{A} runs after {B}. "Get back here!" {B} gets through the curtain first.`,b:`{A} chases {B}. "Get back — hold on — get back here." {A} runs out of breath halfway. {B} gets through the curtain first.`},
 {t:`Let them run: "You can't hide forever"`,s:'mic',d:.05,h:10,p:2,ok:`{A} lets {B} run: "You can't hide forever." The promise hangs over {B} for the week.`,g:`{A} lets them go. Doesn't move. "Run, {B}. You can run all the way to {PPV}." A beat. "I'll be at the end of it." The promise hangs over {B} for the week.`,no:`{A} watches them go. "You can't hide forever." It sounds a little hollow.`,b:`"You can't hide forever! Or — for long. A while, maybe." It sounds a little hollow.`},
 {ri:'rough',al:'h',t:`Throw {B}'s gear after them`,s:'luck',d:.05,h:11,p:1,ok:`{A} hurls {B}'s gear after them. "Don't forget your stuff!" It sails over {B}'s head. Insult added to injury.`,g:`{A} picks up {B}'s gear and hurls it after them. It sails over {B}'s head and hits the screen. "You forgot this!" Insult added to injury.`,no:`{A} throws {B}'s gear after them. "You forgot this!" It barely makes it halfway.`,b:`{A} throws {B}'s gear. "Here's your — oh." It lands right back at {A}'s feet.`},
 {al:'f',hk:'live',t:`Get the crowd chanting "Coward!"`,s:'pop',d:.05,h:10,p:3,ok:`{A} turns to the crowd. "Tell them what they are!" The crowd starts chanting "Coward!" The whole place joins in. {B} can hear it backstage.`,g:`{A} turns to the crowd, opens their arms, and starts it once: "Cow-ard!" The whole place takes over. {B} can hear it backstage.`,no:`{A} turns to the crowd. "Cow-ard! Come on! Cow-ard!" The chant fizzles.`,b:`{A} turns to the crowd. "Cow! Ard! Cowww-ard!" The rhythm is all wrong. The chant fizzles.`},
 {t:`Promise that next time {B} won't be able to run`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`"Next time, you won't be able to run." A match is made — and {B} can't back out.`,g:`"Run tonight, {B}. Next time, it's in a cage." {A} looks at the camera. "Let's see you run from that." A match is made — and {B} can't back out.`,no:`{A} calls after them. "Next time, you won't be able to run!" {B} is already gone.`,b:`"Next time you won't run! Because — because you won't." {B} is already gone.`},
 {gone:'g',t:`Turn to the camera: "Same time next week."`,s:'mic',d:.05,h:9,p:2,ok:`{A} turns to the camera: "Same time next week." A promise and a warning.`,g:`{A} turns slowly to the hard camera and smiles. "Same time next week, {B}." And walks out. A promise and a warning.`,no:`{A} turns to the camera. "Same time next week." It comes off a little flat.`,b:`{A} turns to the wrong camera: "Same time next week." It comes off a little flat.`}],
crowd:[
 {al:'h',hk:'live',t:`Tell the crowd to shut up`,s:'mic',d:.1,h:11,p:2,ok:`"Shut up! All of you!" They get louder. That's the point.`,g:`{A} stands perfectly still. "Shut. Up." The crowd gets louder. {A} smiles. "Thank you." They get louder. That's the point.`,no:`{A} snaps. "Shut up! All of you!" They don't stop, and {A} looks rattled.`,b:`"Shut up! Please! Shut up." They don't stop, and {A} looks rattled.`},
 {al:'h',hk:'live',t:`Insult the city to win the heat back`,s:'mic',d:.05,h:12,p:2,ok:`{A} smirks. "This city? The best thing about it is the airport." Instant, unanimous boos. Mission accomplished.`,g:`"You know what I love about this city?" A long pause. "The highway out of it." Instant, unanimous boos. Mission accomplished.`,no:`{A} sneers. "Typical Cleveland." It's Pittsburgh. The insult misses.`,b:`{A} sneers. "You people in — Ohio? Is this Ohio?" It isn't. Then the state's wrong too. The insult misses.`},
 {al:'f',hk:'live',t:`Win the crowd back with one line`,s:'mic',d:.15,h:9,p:4,ok:`{A} raises the mic. "They're loud for you tonight. They've been loud for me for years." The building flips back to {A}.`,g:`{A} waits. Lets {B} enjoy it. Then: "You've got them tonight, {B}." A smile. "I've had them for ten years." One line, and the building flips back to {A}.`,no:`{A} tries. "Remember who's always been here for you." The line doesn't land. {B} has them for now.`,b:`{A} tries. "Remember who you — I've always — the cheering." The words come out in the wrong order. {B} has them for now.`},
 {t:`Ignore the noise and talk straight to {B}`,s:'mic',d:.1,h:11,p:2,ok:`{A} ignores the noise. "This is between you and me, {B}. Nobody else." Focused and intense. The noise fades.`,g:`{A} doesn't raise their voice or look at the crowd. "They can't help you. They won't be in the ring." Low and steady, until the noise has nowhere to go. The noise fades.`,no:`{A} talks straight at {B}. "Listen to me—" Nobody can hear a word.`,b:`{A} mumbles into the mic. "This is between us. Just us. Okay?" It's far too quiet to hear.`},
 {al:'f',hk:'live',t:`Remind them who was here first`,s:'pop',d:.1,h:8,p:3,ok:`"Remember who was here first." The cheers swing back to {A}.`,g:`"Before {B} was here, I was. Before the shirts, before the songs." {A} points at the crowd. "You were here too. Remember that?" The cheers swing back to {A}.`,no:`{A} points around the building. "Remember who was here first." The crowd is split down the middle.`,b:`"I was here first! Before — before everybody." The crowd is split down the middle.`},
 {t:`Wait for the noise to die down, then strike`,s:'mic',d:.1,h:10,p:2,ok:`{A} waits. When it's quiet: "Are you finished? Good." Every word lands.`,g:`{A} waits. And waits. When it's finally quiet, {A} says one sentence. "Now that you're done, let me tell you how this ends." Every word lands.`,no:`{A} waits. "Whenever you're ready." The noise never dies down.`,b:`{A} waits, gets impatient. "Okay, so — anyway —" The noise comes right back.`}],
rattled:[
 {t:`Keep pushing {B}'s buttons`,s:'mic',d:.1,h:13,p:2,ok:`{A} leans in. "Angry? Good. Stay angry." {B} is coming apart on live TV.`,g:`"Getting angry, {B}? That's fine." {A} leans in. "Angry people make mistakes. Keep going. Please." {B} is coming apart on live TV.`,no:`{A} leans in. "Getting angry, {B}?" {B} breathes. "Not anymore." The moment passes.`,b:`{A} keeps poking. "Angry? Angry? Huh? Ang—" {B} shoves {A}, then pulls it together.`},
 {t:`Smile — the plan is working`,s:'luck',d:.05,h:10,p:2,ok:`{A} smiles. "That's it. Let it out." That smile makes {B} even angrier.`,g:`{A} smiles at {B}, small and patient, the way you'd smile at a toddler having a tantrum. "Take your time." That smile makes {B} even angrier.`,no:`{A} smiles. "See? This is what I wanted." {B} catches the smile and calms right down.`,b:`{A} grins way too wide. "Heh. It's working." It looks like a grimace. {B} calms right down.`},
 {t:`Step back and let {B} embarrass themselves`,s:'pop',d:.05,h:9,p:2,ok:`{A} steps back. "Go on. Keep going." {B} rants at nobody.`,g:`{A} steps back and folds their arms. "Floor's yours." {B} rants, points, screams — at nobody. {A} barely had to do anything.`,no:`{A} steps back. "Go ahead, embarrass yourself." {B} stops before it gets bad.`,b:`{A} steps back. "Go ahead, keep — whoa!" {A} falls through the ropes. {B} stops ranting to laugh.`},
 {al:'f',t:`Tell {B} to calm down before they get hurt`,s:'mic',d:.05,h:9,p:3,ok:`"Calm down, {B}, before you get hurt." Cool and in control. The fans love it.`,g:`"Breathe, {B}." {A} holds up a calm hand. "Breathe. You're going to need all that at {PPV}. Don't waste it on me tonight." Cool and in control. The fans love it.`,no:`{A} holds up a hand. "Calm down before you get hurt." It just makes {B} angrier — in a focused way.`,b:`"Calm down! Calm — CALM DOWN!" {A} isn't calm either. It just makes {B} angrier.`},
 {ri:'rough',al:'h',t:`Poke {B} in the chest until they snap`,s:'luck',d:.1,h:14,p:1,ok:`{A} pokes {B} in the chest. "Do something. Go on." Poke. {B} swings wildly — and gets themselves in trouble.`,g:`{A} pokes {B} in the chest. "What are you gonna do?" Poke. "Hm?" Poke. {B} swings wildly — and the swing hits the ref. Now {B} is in trouble.`,no:`{A} pokes {B}. "What are you gonna do?" {B} grabs the finger. Uh oh.`,b:`{A} pokes {B}. "What are you — ow, my finger." {B} grabs it. Uh oh.`},
 {gone:'no b',t:`Make the match now, while {B} is too angry to think`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`{A} shoves the mic at {B}. "Say yes. Right now." {B} agrees to everything without thinking.`,g:`"You want me? Say yes. Right now." {A} shoves the mic at {B} while {B} is still shaking, and the yes comes out before {B} can think. {B} agrees to everything without thinking.`,no:`{A} pushes the mic at {B}. "Say yes. Right now." {B} storms off before agreeing to anything.`,b:`{A} pushes the mic at {B}. "Say yes to the — the match, with the — rules." {B} storms off.`}],
defy:[
 {al:'h',gone:'no b',xi:'power kneel sneak partner',t:`"Fine. Then there's no deal."`,s:'mic',d:.05,h:11,p:2,ok:`"Fine. Then there's no deal." {A} turns their back. {B} is left with nothing.`,g:`"Fine." {A} shrugs and turns away. "Then there's no deal. Enjoy the undercard, {B}." {A} turns their back. {B} is left with nothing.`,no:`{A} turns away. "Fine. No deal." {B} calls the bluff. "Okay. Bye." {A} blinks first.`,b:`"Then there's no deal!" {B} says okay and leaves. {A} chases after them. {A} blinks first.`},
 {ri:'power',al:'h',xi:'kneel',t:`Have security make {B} do it`,s:'luck',d:.1,h:13,p:1,ok:`{A} snaps their fingers. "Help them down." Two guards force {B} to one knee. Humiliating.`,g:`{A} snaps fingers. Two guards take {B} by the shoulders and push them down to one knee. {A} pats {B}'s head. "There. Was that so hard?" Humiliating.`,no:`{A} snaps their fingers. "Make them kneel." {B} fights off security. Chaos.`,b:`{A} snaps at security. "Grab — not ME!" They grab {A}. Then {B} fights everybody off. Chaos.`},
 {t:`Respect the fire — then double the stakes`,s:'mic',d:.1,h:10,p:2,ch:1,ok:`"Okay, you've got fire. Let's double the stakes." {B} accepts. This is going to be big.`,g:`"I like that fire, {B}. Let's feed it." {A} smiles. "Same match. Same night. Loser leaves the title picture for a year." {B} accepts. This is going to be big.`,no:`{A} nods. "You've got fire. Let's double the stakes." {B} won't take the bait. "Nice try."`,b:`"You've got fire! Let's double it. Double the — the stakes. The steak." {B} won't take the bait.`},
 {al:'f',t:`Tell {B} they've got guts — and they'll need them`,s:'mic',d:.05,h:8,p:3,ok:`"You've got guts. You're gonna need them." Fiery and respectful.`,g:`"You've got guts, {B}. Real guts." {A} nods. "Hang on to them. You'll need every bit at {PPV}." Fiery and respectful.`,no:`{A} nods. "You've got guts." A pause. "Nice." It sounds like a compliment more than a warning.`,b:`"You've got guts! Nice guts." It sounds like a compliment more than a warning.`},
 {t:`Stand there and wait for {B} to crack`,s:'pop',d:.1,h:10,p:1,ok:`{A} says one word. "Well?" Then just waits for {B} to crack. The stare-off goes on forever. {B} looks away first.`,g:`{A} doesn't move. Just looks at {B}, steady, while the seconds tick by. Finally, quietly: "Thought so." {B} looks away first.`,no:`{A} folds their arms. "I can wait." {B} doesn't crack. {A} does. "Fine! Fine."`,b:`{A} stares at {B}. "I can — sorry — I can wait." {A} has to blink, a lot. {B} doesn't crack. {A} does.`},
 {al:'h',t:`Slap {B} for the disrespect`,s:'luck',d:.05,h:14,p:1,ok:`{A} slaps {B}. "Watch your mouth." Everyone heard that.`,g:`The slap lands so loud it echoes. {A} shakes out the hand. "That's for the tone." Everyone heard that.`,no:`{A} swings. "Watch your—" {B} catches the wrist and stares {A} down.`,b:`{A} slaps {B}. "Watch your — ear. Sorry." It mostly gets the ear. {B} catches the wrist on the second try.`},
 {ri:'mind',al:'f',t:`Smile: "Good. I was hoping you'd say that."`,s:'mic',d:.05,h:9,p:3,ok:`{A} smiles: "Good. I was hoping you'd say that." Everyone loves a fight. Now there is one.`,g:`{A} smiles. "Good. I was hoping you'd say that." Steps in. "I'd hate to beat you when you were being polite." Everyone loves a fight. Now there is one.`,no:`{A} smiles. "Good. I was hoping you'd say that." It comes out a little smug.`,b:`"Good! That's what I — I was hoping. For that." It comes out a little smug.`},
 {t:`Push harder: "Then we do this the hard way"`,s:'mic',d:.1,h:11,p:2,ok:`"Then we do this the hard way." Neither one gives an inch. The tension is unbearable.`,g:`"Then we do this the hard way, {B}." {A} doesn't move. Neither does {B}. Neither one gives an inch. The tension is unbearable.`,no:`{A} leans in. "Then we do this the hard way." {B} just stares. {A} blinks first.`,b:`"Then the hard way! The hard — the hard way." {B} just stares. {A} blinks first.`}],
stumble:[
 {t:`Pounce: "Take your time. I'll wait."`,s:'mic',d:.05,h:10,p:3,ok:`"Take your time. I'll wait." {B} looks lost. Brutal.`,g:`{B} trips on the words. {A} just tilts their head and waits. "Take your time, {B}. I'll wait. We all will." {B} looks lost. Brutal.`,no:`{A} tilts their head. "Take your time. I'll wait." {B} recovers just enough. "Thanks. I'm done."`,b:`"Take your time!" {A} trips on the words too. {B} recovers just enough.`},
 {al:'h',t:`Hand {B} some cue cards`,s:'luck',d:.05,h:11,p:2,ok:`{A} pulls out a stack of cue cards. "Here. These might help." Mean, and hilarious.`,g:`{A} pulls a stack of real cue cards from a back pocket and hands them over. "Here. Somebody wrote you a better one." Mean, and hilarious.`,no:`{A} hands over cue cards. "Try reading off these." {B} rips them up. "Don't need them." Weirdly effective.`,b:`{A} hands {B} cue cards. "Here, read these!" They're {A}'s own notes for this segment. {B} reads them out loud. "'Remember to look tough.'"`},
 {al:'f',hk:'live',t:`Let it go — the crowd already saw it`,s:'pop',d:0,h:6,p:2,ok:`{A} raises a hand. "Let it go. Everybody saw it." Gracious. The crowd appreciates it.`,g:`{A} lets {B}'s stumble hang there, then raises a hand. "That's alright, {B}. Everybody saw it." A gracious nod. The crowd appreciates it.`,no:`{A} waves it off. "It's fine. Happens to everybody." {B} takes the reprieve and runs with it.`,b:`{A} tries to be gracious. "It's fine, we all — we all trip on the — things." {B} takes the reprieve and runs with it.`},
 {t:`Finish the sentence for them`,s:'mic',d:.1,h:12,p:2,ok:`{B} stalls mid-sentence. {A} finishes it: "...and that's why you're going to lose. Was that it?" Perfect timing. {B} is speechless — again.`,g:`{B} starts the sentence and stalls. {A} finishes it, perfectly, in {B}'s voice: "...and then I lost, like always." Hands the mic back. {B} is speechless, again.`,no:`{B} stalls. {A} jumps in. "...and that's why you're scared!" {B} blinks. "That's not what I was going to say." Both look silly.`,b:`{B} stalls. {A} jumps in. "...because you're a — a sandwich?" Completely wrong. Both look silly.`},
 {al:'h',t:`Mock {B}'s stammering word for word`,s:'mic',d:.1,h:13,p:2,ok:`{A} mimics it back. "I-I-I'm g-gonna b-beat you." Mean-spirited and very effective.`,g:`{A} repeats it back, word for word, every stumble, every "uh," perfectly. Then smiles. "Did I get it? I wanted to get it right." Mean-spirited and very effective.`,no:`{A} mimics {B}. "Uh, I'm gonna, uh—" It's too cruel. Even heel fans wince.`,b:`{A} mimics {B}'s stammer. "I-I'm g-g— hang on. I-I'm—" {A} stammers doing it. It's too cruel, and it's not even good.`},
 {ri:'insult',t:`Tell {B} to stick to wrestling`,s:'mic',d:.05,h:9,p:2,ok:`"Stick to wrestling, {B}." Fair point, delivered with a grin.`,g:`{A} grins. "Stick to wrestling, {B}. You're good at that. Well." A beat. "Better at that." Fair point, delivered with a grin.`,no:`{B} shrugs. "Fine by me."`,b:`"Stick to wrestling! Because talking isn't — you know." {B} shrugs. "Fine by me."`}]};

/* ---------- {B}'s responses ----------
   i: which of {A}'s calls it answers (space-separated, or '*'). V = insult brag promise mind. */
const V='insult brag promise mind',VC=V+' challenge',VP=V+' power kneel belt partner';
const RT=[
/* v253: answers for calls that had too few of their own (a belt shoved in {B}'s face, a brawl stopped before it starts, a refused handshake) */
{m:'defy',i:'belt',vs:'f',at:1,t:`{B} doesn't even look at the {T} title. Only at {A}. "I don't want to hold it. I want to take it."`},
{m:'threat',i:'belt',vs:'h',at:1,t:`{B} taps the {T} title with one finger. "Keep it polished. I want it shiny when I take it off you."`},
{m:'brag',i:'belt',at:1,mic:'hi',t:`{B} glances at the {T} title, then back at {A}. "Funny. It looked bigger on TV." A smile. "It'll fit me better."`},
{m:'mock',i:'belt',at:1,mic:'lo',t:`{B} points at the {T} title. "Mine. Soon." That's all {B} has.`},
{m:'personal',i:'belt',at:1,vs:'f',hot:1,t:`{B} stares past the {T} title, straight at {A}. "You've been hiding behind that thing for months. It won't hide you at {PPV}."`},
{m:'threat',i:'brawl',ok:0,mic:'*',t:`{B} straightens their jacket while security holds {A} back. "Save it. I'll be there."`},
{m:'mock',i:'brawl',ok:0,vs:'h',mic:'*',t:`{B} smirks from behind the guards. "Look at that. They had to save you from me."`},
{m:'dismiss',i:'shake',ok:0,vs:'f',mic:'*',t:`{B} lets the hand hang there. "Shake it after the match. If you still want to."`},
{m:'mock',i:'shake',ok:0,vs:'h',t:`{B} looks at the hand, then at {A}, and laughs. "Cute."`},
{m:'mock',i:'respect',vs:'h',mic:'hi',t:`{B} puts a hand over their heart. "Touching. Really." The hand comes down. "Doesn't change a thing."`},
/* — mock: {B} throws the insult right back — */
{m:'mock',i:V,vs:'h',t:`{B} smirks and leans into the mic. "That's it? I expected a lot more from you."`},
{m:'mock',i:V,nt:'cool face',vs:'h',t:`{B} laughs. "You've been working on that one all week. I can tell."`},
{m:'mock',i:'insult promise',vs:'h',mic:'hi',t:`{B} doesn't even blink. "I've been called worse by better — and I beat all of them too."`},
{m:'mock',i:'insult',vs:'h',t:`{B} rolls their eyes. "Yeah, okay. Anything else?"`},
{m:'mock',i:V,vs:'h',al:'f',t:`{B} rolls their eyes. "The hero speaks. How does it feel being everybody's second favorite?"`},
{m:'mock',i:V,nt:'cool face',vs:'f',al:'h',t:`{B} grabs a mic. "You talk a lot for somebody who hasn't won anything that matters in a long time."`},
{m:'mock',i:'insult',nt:'cool face',vs:'f',t:`{B} shakes their head. "Every week, the same tired insults. Get some new material."`},
{m:'mock',i:'insult brag',vs:'f',mic:'hi',t:`{B} smiles. "I'd have a battle of wits with you, but I don't fight people who show up unarmed."`},
{m:'mock',i:V,vs:'f',t:`{B} laughs it off. "That's it? I've heard worse in the locker room. From the ring crew."`},
{m:'mock',i:V,nt:'cool face',vs:'h',ok:0,t:`{B} slow claps. "Wow. Want to try that one again?"`},
{m:'mock',i:V,nt:'cool face',vs:'f',ok:0,t:`{B} grins. "You might want to try that one again. Nobody laughed."`},
{m:'mock',i:'challenge',vs:'h',ok:0,t:`{B} laughs at the fumbled challenge. "Try again when you can finish a sentence."`},
{m:'mock',i:'insult brag',vs:'h',al:'h',t:`{B} smiles like a snake. "Takes one to know one. Difference is, I'm better at it."`},
{m:'mock',i:'partner',vs:'h',t:`{B} pretends to think it over. "Partners? Sure. Right up until I stab you in the back."`},
{m:'mock',i:'shake',ok:0,vs:'h',t:`{B} slaps the hand away. "Respect? Keep it. I'm here to win."`},
{m:'mock',i:'promise',vs:'h',t:`{B} laughs. "Promises, promises. You've been saying that for weeks."`},
{m:'mock',i:'brag',nt:'cool crowd face',vs:'h',mic:'hi',t:`{B} slow claps. "Beautiful speech. Shame nobody believes a word of it."`},
{m:'mock',i:V,vs:'h',al:'f',hk:'live',t:`{B} points at the front row. "Look at your fans. They deserve a lot better than you."`},
{m:'fightback',i:'rough physical shove',vs:'h',ok:0,mic:'*',t:`{B} laughs at {A}. "Too slow! Way too slow!"`},
{m:'mock',i:V,vs:'f',ok:0,t:`{B} lets the silence hang for a second. "You done? Because that was rough to watch."`},
{m:'mock',i:'mind',nt:'cool',vs:'h',t:`{B} stares right back and starts laughing. "Is this supposed to scare me?"`},
{m:'mock',i:'power partner kneel',vs:'f',t:`{B} looks at the demand and laughs out loud. "You can't be serious."`},
/* — flip: {B} turns {A}'s words around — */
{m:'flip',i:V,nt:'face crowd',mic:'hi',t:`{B} smiles. "Everything you just said about me? That's what they say about you the second you leave the room."`},
{m:'flip',i:'insult',vs:'h',t:`{B} shrugs. "Call me whatever you want. I'm the one they'll be talking about tomorrow."`},
{m:'flip',i:'insult promise',nt:'cool face',vs:'f',t:`{B} steps closer. "You keep telling everybody what I am. Funny how you never talk about what you've done."`},
{m:'flip',i:'mind',nt:'cool',vs:'f',t:`{B} breaks the silence. "Staring at me won't win you a match. Trust me — people have tried."`},
{m:'flip',i:'promise',t:`{B} laughs. "You keep promising. I keep delivering. That's the difference between us."`},
{m:'flip',i:'power',vs:'f',t:`{B} folds their arms. "You need a title, a lawyer and a security team to feel big. I just need a match."`},
{m:'flip',i:'brag',nt:'crowd',t:`{B} smirks. "The greatest? You're not even the greatest in this ring."`},
{m:'flip',i:'brag',nt:'crowd',vs:'f',t:`{B} isn't impressed. "Great people don't need to tell you they're great."`},
{m:'flip',i:'insult',vs:'f',mic:'hi',hot:1,t:`{B} nods slowly. "You're right about one thing — I'm not who I was. I'm worse. For you."`},
/* — brag: {B} reminds everyone who they are — */
{m:'brag',i:VC,vs:'h',bt:1,t:`{B} hoists the {BT} title. "Say whatever you want. I've got the gold — you've got opinions."`},
{m:'brag',i:VC,vs:'f',bt:1,t:`{B} raises the {BT} title. "I earned this the hard way. If you want it, you'll have to take it from me."`},
{m:'brag',i:'insult',vs:'h',bt:1,t:`{B} kisses the {BT} title. "Insult me all you want. The belt doesn't care."`},
{m:'brag',i:V,vs:'h',big:1,t:`{B} spreads their arms wide. "Look around. They paid to see me. You're the opening act."`},
{m:'brag',i:V,vs:'h',t:`{B} counts on their fingers. "Wins. Titles. Main events. Remind me what you've got?"`},
{m:'brag',i:V,vs:'f',hk:'live',t:`{B} points to the crowd. "They chant my name for a reason. Every single night, I deliver."`},
{m:'brag',i:V,vs:'h',mic:'hi',t:`{B} adjusts their jacket. "I'm the best thing that ever happened to this company. You're a footnote."`},
{m:'brag',i:VC,vs:'f',t:`{B} grins. "I've beaten everybody you ever looked up to. You're just next on the list."`},
{m:'brag',i:VC+' belt',vs:'h',at:1,t:`{B} points at the {T} title. "Enjoy it while it lasts. That belt's just been keeping my spot warm."`},
{m:'brag',i:VC,under:1,t:`{B} isn't backing down. "Everybody counts me out. Ask the last few people who did how that went."`},
{m:'brag',i:V,vs:'h',hk:'live',big:1,t:`{B} soaks in the boos and the cheers. "Love me or hate me, you can't stop watching me."`},
{m:'brag',i:'shake',ok:0,vs:'h',big:1,t:`{B} looks at the hand, then back up. "Of course you respect me. Everybody does. That's not the same as being ready for me."`},
/* — dismiss: {B} brushes {A} off — */
{m:'dismiss',w:1,i:VP,vs:'h',t:`{B} checks their watch. "Are we done? I've got better things to do."`},
{m:'dismiss',i:VC,vs:'h',big:1,t:`{B} waves a hand. "Come back when people know your name."`},
{m:'dismiss',i:VC,vs:'h',bt:1,t:`{B} doesn't even look up from the {BT} title. "Take a number. There's a line."`},
{m:'dismiss',i:'insult mind promise',vs:'f',mic:'*',t:`{B} doesn't take the bait. "Say what you want. My wrestling does my talking."`},
{m:'dismiss',i:V,vs:'h',al:'f',t:`{B} laughs. "The fans' little hero. Run along — grown-ups are talking."`},
{m:'dismiss',i:V,vs:'h',hk:'studio',t:`{B} turns to the interviewer. "Can we get somebody interesting in that chair next time?"`},
{m:'dismiss',i:VP,vs:'f',hk:'studio',t:`{B} leans back in their chair. "I came here to talk about my match, not listen to this."`},
{m:'dismiss',i:'mind',ok:0,t:`{B} breaks into a grin. "Was that supposed to rattle me?"`},
{m:'dismiss',i:'shake',ok:0,vs:'h',hk:'contract',t:`{B} leaves the hand hanging, signs with a flourish and slides the pen back. "Keep your hand. I'll take the match."`},
{m:'dismiss',i:'insult power',vs:'f',hk:'contract',t:`{B} signs without reading a word. "Doesn't matter what's on the page. I'm still beating you."`},
{m:'dismiss',i:VP,vs:'h',hk:'live',t:`{B} plays to the hard camera. "Folks at home, this is when you go get a snack."`},
{m:'dismiss',i:VC,vs:'f',ppv:1,hk:'live',t:`{B} points to the {PPV} sign hanging over the stage. "Save it. Everything gets settled at {PPV}."`},
{m:'dismiss',i:'shake',ok:0,w:1,mic:'*',vs:'h',t:`{B} stares at the offered hand, then walks right past it. "Shake it after you've earned it."`},
{gone:1,m:'dismiss',i:V,mic:'lo',t:`{B} grabs the mic. "Nope." {B} drops it and walks away.`},
/* — personal: {B} goes low — */
{m:'personal',i:V,vs:'h',hot:1,t:`{B} lowers their voice. "Remember who was there for you when nobody else was? Neither do I. Because it was nobody."`},
{m:'personal',i:V,vs:'h',t:`{B} smiles coldly. "How's the family? Do they still watch, or did they give up on you too?"`},
{m:'personal',i:V,vs:'h',mic:'hi',t:`{B} gets quiet. "Every time you look in the mirror, you see someone who almost made it. I know it. You know it."`},
{m:'personal',i:V,vs:'f',al:'h',hot:1,t:`{B} snaps. "You want personal? You've burned everyone who ever trusted you. I'm just the one who's going to make you pay for it."`},
{m:'personal',i:V,vs:'h',ok:0,t:`{B} pounces. "You can't even get through a promo. Imagine how the match is going to go."`},
{m:'personal',i:'respect shake',vs:'h',hk:'contract',t:`{B} signs and slides the pen across. Then leans in and whispers, just loud enough: "I know what you did in Atlanta." {A}'s jaw tightens.`},
{m:'personal',i:'insult',vs:'f',al:'f',t:`{B} looks genuinely hurt. "I thought we had respect for each other. Guess I was wrong about you."`,ch:[
 {tc:'resp',ri:'respect',t:`Apologize — it's business, not personal`,s:'mic',d:.05,h:6,p:3,ok:`{B} nods. The respect is back, and so is the rivalry.`,no:`The apology comes out half-hearted.`},
 {tc:'pers',ri:'insult',t:`Double down: "Respect is earned in the ring"`,s:'mic',d:.1,h:11,p:2,ok:`Now there's real fire between them.`,no:`It just sounds petty.`},
 {tc:'cool',t:`Say nothing and let it sit`,s:'luck',d:0,h:8,p:1,ok:`The tension is thick. Nobody knows where this goes.`,no:`It reads as cold.`}]},
{m:'personal',i:V,vs:'f',al:'h',t:`{B} steps up, voice shaking. "You don't get to talk about me. Not after what you did."`},
/* — threat: {B} promises violence — */
{m:'threat',i:VP,nt:'cool face',vs:'f',al:'h',t:`{B} steps nose to nose. "Keep running your mouth. Next time I see you, there won't be a referee."`},
{m:'threat',i:V+' rough',vs:'f',t:`{B} cracks their neck. "You picked the wrong person to make an example of."`},
{m:'threat',i:V+' rough',vs:'f',hot:1,t:`{B} glares. "I'm done talking. The next thing you hear from me won't be words."`},
{m:'threat',i:VP,vs:'h',t:`{B} smiles. "Careful. Accidents happen around here. Ladders fall. Chairs swing."`},
{m:'threat',i:VP,vs:'h',at:1,t:`{B} circles {A} slowly. "That belt looks heavy. Maybe I should take it off your hands."`},
{m:'threat',i:VC,vs:'f',ppv:1,t:`{B} points right at {A}. "You and me at {PPV}. And I am going to hurt you."`},
{m:'threat',i:VC,vs:'h',ppv:1,t:`{B} grins. "Enjoy the next few weeks. At {PPV}, I end you."`},
{m:'threat',i:V+' rough',mic:'*',t:`{B} just points at {A}. "You." Then slowly drags a thumb across their throat.`},
{m:'threat',i:VC,vs:'f',ppv:1,hot:1,t:`{B}'s voice cracks with anger. "I've circled {PPV} on my calendar. I'm counting the days."`},
{m:'threat',i:VC,vs:'h',ppv:1,under:1,t:`{B} snarls. "Everybody acts like you're the star. At {PPV}, I'm taking that from you."`},
{m:'threat',i:'mind',nt:'cool face',vs:'f',hk:'studio',t:`{B} leans across the table. "You can analyze me all you want. You can't stop me."`},
{m:'threat',i:'shake',ok:1,vs:'h',mic:'*',t:`{B} takes the hand — then won't let go, squeezing until {A} winces. "Feel that? That's {PPV}."`},
{m:'threat',i:'rough brawl',ok:1,vs:'f',t:`{B} rubs their jaw and smiles. "That's all you've got? Now you've done it."`},
{m:'threat',i:'rough brawl shove',ok:1,vs:'f',hk:'live',mic:'*',t:`{B} storms right back in. "You want a fight? You've got one!" The crowd wants it — and so does {B}.`},
{m:'threat',i:'rough shove',ok:1,vs:'h',t:`{B} is stunned, then furious. "You'll pay for that. In front of everyone."`},
{m:'threat',i:'rough brawl',ok:1,mic:'*',t:`{B} stumbles back and touches their lip. Looks at the blood. "Oh, you shouldn't have done that." {B} is seeing red.`},
{m:'threat',i:'physical',ok:1,vs:'f',hot:1,mic:'*',t:`{B} pulls themselves up, glaring through the pain. "That all you've got?" They're not done.`},
{m:'threat',i:'power',vs:'f',hot:1,t:`{B} gets right in {A}'s face. "Keep hiding behind your rules. They won't save you when the bell rings."`},
/* — accept: {B} takes the fight — */
{m:'accept',i:'challenge',ok:1,vs:'f',t:`{B} doesn't hesitate. "You want me? You've got me. Name the day."`},
{m:'accept',i:'challenge',ok:1,vs:'f',hot:1,t:`{B} pulls off their jacket. "I've been waiting for you to ask."`},
{m:'accept',i:'challenge',ok:1,vs:'h',big:1,t:`{B} laughs, then nods. "Fine. I'll squeeze you in. It won't take long."`},
{m:'accept',i:'challenge',ok:1,vs:'h',bt:1,t:`{B} pats the {BT} title. "A title shot? Earn it… actually, fine. I could use an easy defense."`},
{m:'accept',i:'challenge',ok:1,vs:'f',mic:'*',t:`{B} takes the mic and says one word. "Yes." Then {B} hands it back and waits.`},
{m:'accept',i:'challenge',ok:1,vs:'f',al:'f',t:`{B} grins. "Me and you? I've wanted this one my whole career."`},
{m:'accept',i:'challenge',ok:1,vs:'h',under:1,t:`{B} jumps at it. "You just handed me the biggest opportunity of my life. Thanks."`},
{m:'accept',i:'challenge',ok:1,vs:'f',hk:'contract',t:`{B} reads the new terms and grabs the pen. "Make it worse. I'll still sign."`},
{m:'accept',i:'challenge',ok:1,vs:'h',hk:'contract',t:`{B} reads the new stipulation and grins. "Fine. Just remember you asked for this."`},
{m:'accept',i:'challenge',ok:1,vs:'f',bt:1,t:`{B} lifts the {BT} title. "You want this? Then let's do it. Champion's honor."`},
{m:'accept',i:'challenge',ok:1,mic:'lo',t:`{B} nods, a little too eagerly. "Uh — yeah. You and me. Sure."`},
{m:'accept',i:'insult mind promise challenge',vs:'f',mic:'*',t:`{B} shrugs. "I don't do speeches. See you in the ring."`},
{m:'accept',i:'promise',vs:'f',t:`{B} steps up. "You keep promising me what's coming. Here I am. Bring it."`},
{m:'accept',i:'challenge',ok:1,vs:'h',hot:1,t:`{B} stops smirking. "You want it that bad? Fine. But when I'm done with you, don't come crying."`},
/* — dodge: a heel {B} weasels out — */
{m:'dodge',i:'challenge',ok:0,vs:'h',t:`{B} backs away. "A match? Tonight? Oh, I'd love to, but my doctor says no."`},
{m:'dodge',i:'challenge',ok:0,vs:'h',t:`{B} laughs. "I'll face you when I decide you've earned it. Not one second before."`},
{m:'dodge',i:'challenge',ok:0,vs:'h',bt:1,t:`{B} clutches the {BT} title. "You don't make the matches. Get in line like everybody else."`},
{gone:1,m:'dodge',i:'challenge',ok:0,vs:'h',hk:'live',t:`{B} is already halfway up the ramp. "Maybe next week!"`},
{m:'dodge',i:'power',vs:'h',hk:'contract',t:`{B} pushes the contract away. "I don't sign anything without my lawyer. Next week. Maybe."`},
{m:'dodge',i:'challenge',ok:0,vs:'h',mic:'lo',t:`{B} rubs their lower back. "Bad back. Real bad. Doctor says no." {B} backs toward the ropes.`},
{m:'dodge',i:'challenge',ok:0,vs:'h',mic:'hi',t:`{B} wags a finger. "You don't get to decide when. I do. That's what being the best means."`},
/* — respect: {B} returns it — */
{m:'respect',i:'shake',ok:1,vs:'f',t:`{B} takes the hand. "Best of luck. You're going to need it."`},
{m:'respect',i:'respect shake',nx:'shake+no',vs:'f',al:'f',t:`{B} nods. "You're the real deal. Doesn't mean I'm letting you win."`},
{m:'respect',i:'shake',ok:1,vs:'f',hot:1,t:`{B} pauses, then shakes. "After everything? Respect. Now let's tear the house down."`},
{m:'respect',i:'respect shake',nx:'shake+no',vs:'f',under:1,t:`{B} smiles. "That means a lot coming from you. Now I've got to prove I belong."`},
{m:'respect',i:'respect mind',nt:'cool face resp',vs:'f',t:`{B} chuckles. "You've done your homework. So have I."`},
{m:'respect',i:'challenge',ok:1,vs:'f',al:'f',t:`{B} steps forward, smiling. "Winner takes the spotlight? Deal. May the best one win."`},
{m:'respect',i:'shake',ok:1,mic:'lo',vs:'f',t:`{B} shakes the hand and nods once. "Yeah." That's all.`},
{m:'respect',i:'brag',nt:'crowd',vs:'f',al:'f',t:`{B} laughs. "Okay, you're good. I'm better. Let's find out."`},
{m:'respect',i:'respect shake',nx:'shake+no',vs:'f',bt:1,t:`{B} offers the {BT} title to hold for a moment, then takes it back. "When you earn it, it's yours. Not before."`},
{m:'personal',i:'snub',ok:1,vs:'f',t:`{B} looks at the hand, then at {A}. "After what you did? Not a chance."`},
{m:'mock',i:'snub',ok:1,vs:'h',t:`{B} laughs at the outstretched hand. "You actually thought I'd shake that?"`},
{gone:1,m:'dismiss',i:'snub',ok:1,mic:'*',t:`{B} stands. "We're done." And walks off, leaving the hand hanging.`},
{m:'threat',i:'snub',ok:1,vs:'h',t:`{B} smacks the hand away. "Save the sportsmanship. You'll need help getting up."`},
{m:'mock',i:'snub',ok:1,vs:'h',mic:'lo',t:`{B} shakes their head and sneers. "Nah."`},
{m:'personal',i:'snub',ok:1,vs:'f',mic:'lo',t:`{B} just shakes their head, jaw clenched. "Fine. Be like that."`},
{m:'mock',i:'respect',vs:'h',t:`{B} laughs. "Respect? That's adorable. I don't respect anybody I'm about to beat."`},
{m:'dismiss',i:'respect',vs:'h',t:`{B} rolls their eyes. "Save the speech for after the match. You'll need something to say when you lose."`},
{m:'brag',i:'respect',vs:'h',t:`{B} nods smugly. "Of course I'm the best you've faced. Glad you finally noticed."`},
{m:'dismiss',i:'respect',vs:'h',mic:'lo',t:`{B} shrugs. "Whatever."`},
{m:'respect',i:'respect',vs:'f',mic:'lo',t:`{B} nods. "Yeah. You too."`},
{m:'respect',i:'respect',vs:'f',al:'f',mic:'*',t:`{B} smiles and taps a fist to their chest. "Right back at you."`},
{m:'respect',i:'respect',mic:'*',hk:'contract',vs:'f',t:`{B} signs too. The two of them share a long look across the table. "See you there."`},
{m:'dismiss',i:'respect',mic:'*',hk:'contract',vs:'h',t:`{B} signs without looking up and tosses the pen over their shoulder. "Save the speech."`},
{m:'respect',i:'respect',mic:'lo',vs:'f',al:'h',t:`{B} squints at {A}, unsure what to make of it. "…Okay."`},
{m:'mock',i:'respect',mic:'lo',vs:'h',t:`{B} snorts. "Yeah, right."`},
{m:'respect',i:'respect',mic:'*',vs:'f',hk:'interview',t:`{B} nods slowly, taking it in. "That means a lot. It won't change anything, but it means a lot."`},
{m:'respect',i:'respect',mic:'lo',vs:'h',hk:'interview',t:`{B} doesn't know what to do with a compliment. They fidget and look away. "Uh. Okay. Thanks, I guess."`},
{m:'personal',i:'snub',ok:1,vs:'f',hot:1,t:`{B} stares at the hand. "You don't get to play the good guy with me."`},
{m:'threat',i:'snub',ok:1,vs:'f',t:`{B} ignores the hand and points at {A}. "Shake it after I beat you. If you can still lift it."`},
{m:'dismiss',i:'snub',ok:1,vs:'f',t:`{B} pushes back from the table. "I didn't come here to make friends."`},
{m:'mock',i:'snub',ok:1,vs:'h',mic:'hi',t:`{B} pulls out a bottle of hand sanitizer and makes a big show of using it. "You don't know where that hand's been. I do."`},
{gone:1,m:'dismiss',i:'snub',ok:1,vs:'f',mic:'lo',t:`{B} looks at the hand. "No." And just walks away.`},
{m:'threat',i:'snub',ok:1,vs:'h',mic:'lo',t:`{B} slaps the hand away and jabs a finger at {A}. "Don't touch me."`},
/* — laidout: {A}'s attack landed and {B} can't answer — */
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'live',t:`{B} is down and not moving. Referees rush in from the back. From the mat, barely: "...Not done."`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'contract',t:`{B} is buried in the wreckage of the table, the pen still in their hand. {B} groans. "...Still signed it."`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'back|lot',t:`{B} is down on the concrete and not getting up. Crew members come running. {B} lifts one hand off the floor. "...Not done."`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'live',t:`{B} lies in a heap as officials surround {A}. {B} coughs into the mat. "Get... back here..."`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'live',t:`{B} is laid out in the middle of the ring. The crowd can't believe what they just saw. {B} rolls onto their side. "That's... the one you get."`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'studio',t:`{B} is on the studio floor among the broken chairs. The camera operator backs away. {B} spits. "Roll the camera. I want them to see this."`},
/* — fightback: {A}'s attack missed and {B} made them pay — */
{m:'fightback',i:'physical rough shove',ok:0,mic:'*',t:`{B} shakes their head at {A}. "Telegraphed it. From the parking lot."`},
{m:'fightback',i:'physical rough shove',ok:0,vs:'f',mic:'*',t:`{B} shoves {A} back, twice as hard. "My turn!" Now {A} is the one reeling.`},
{m:'fightback',i:'physical rough shove',ok:0,vs:'h',mic:'*',t:`{B} laughs right in {A}'s face. "Oops. Was that supposed to work?"`},
{m:'fightback',i:'physical',ok:0,mic:'*',hk:'contract',t:`{B} straightens their jacket. "Nice try. Now sit down and sign."`},
{m:'fightback',i:'physical',ok:0,vs:'h',mic:'*',hk:'contract',t:`{B} picks up the chair, sets it upright and sits on it. "Looking for this? I'll keep it warm."`},
/* — retreat: a heel {B} gets out of there — */
{gone:1,m:'retreat',i:'physical rough',ok:1,vs:'h',mic:'*',t:`{B} scrambles away holding their jaw. "You're dead! You hear me? Dead!" Shouting threats all the way.`},
{gone:1,m:'retreat',i:'physical',ok:1,vs:'h',mic:'*',t:`{B} scrambles away on all fours. "Ref! REF! Somebody!" Screaming for a referee.`},
{gone:1,m:'retreat',i:'rough shove',ok:1,vs:'h',mic:'*',t:`{B} backs away, wide-eyed. "Okay. Okay. Not tonight." And gets out of there.`},
{gone:1,m:'retreat',i:'challenge',ok:0,vs:'h',mic:'*',hk:'live',t:`{B} grabs their things. "I'll think about it." They hurry up the ramp without another word.`},
/* — crowd: {B} uses the crowd — */
{m:'crowd',i:V,vs:'f',al:'h',hk:'live',t:`{B} turns to the fans. "You heard that? Is that who you want running this place?" The boos pour down on {A}.`},
{m:'crowd',i:VC,vs:'f',hk:'live',t:`{B} turns to the crowd. "Who do you want to hear from?" They chant {B}'s name until {A} can't be heard.`},
{m:'crowd',i:V,vs:'f',hk:'live',big:1,t:`{B} raises a fist. "Tell them." And the building does the talking.`},
{m:'crowd',i:V,vs:'h',al:'f',hk:'live',t:`{B} cups an ear to the crowd. "Listen to them. They cheer you because they feel sorry for you."`},
/* — rattled: {B} loses their cool — */
{m:'rattled',i:'mind',ok:1,vs:'f',t:`{B} finally snaps. "Stop looking at me like that!" They're losing it.`},
{m:'rattled',i:'mind insult',ok:1,vs:'h',mic:'*',t:`{B} sputters, red-faced. "You — you don't get to —" {B} throws the mic at the wall.`},
{m:'rattled',i:'mind',ok:1,mic:'*',t:`{B} starts to answer. "Well, I —" Then stops. For once, they've got nothing.`},
{m:'rattled',i:'insult promise',ok:1,vs:'h',hot:1,t:`{B} is yelling now, veins popping. "Say that again! SAY IT AGAIN!" It's gotten to them.`},
{m:'rattled',i:'mind',vs:'h',hk:'studio',t:`{B} snatches {A}'s notes off the table and tears them up. "Next question!"`},
{m:'rattled',i:'rough',ok:1,vs:'h',t:`{B} wipes their face, shaking with rage. "Security! Get them out of here!"`},
{m:'rattled',i:V,mic:'lo',vs:'h',t:`{B} turns bright red and points at {A}. "You — I — you!" Nothing else comes out.`},
/* — defy: {B} won't bow to a power play — */
{m:'defy',i:'kneel',vs:'f',t:`{B} doesn't move. "I don't bow. Not to you. Not to anybody."`},
{m:'defy',i:'kneel power',vs:'f',hk:'contract',t:`{B} slides the contract back across the table. "Your terms? No. My terms, or nothing."`},
{m:'defy',i:'power brag belt',vs:'f',at:1,t:`{B} stares at the {T} title. "You think that belt makes you better than me? It just makes you a target."`},
{m:'defy',i:'power kneel',vs:'h',t:`{B} laughs. "You think I take orders? I give them."`},
{m:'defy',i:'sneak',ok:0,vs:'f',mic:'*',hk:'contract',t:`{B} tears the fine print right off the bottom of the contract. "Nice try."`},
{m:'defy',i:'power kneel',mic:'*',t:`{B} folds their arms. "Make me."`},
{m:'defy',i:'power kneel',vs:'f',mic:'hi',t:`{B} steps up. "You can make me wait. You can make me jump through hoops. You can't make me afraid of you."`},
/* — stumble: a weak talker fumbles it — */
{m:'stumble',i:VP+' challenge',mic:'lo',t:`{B} grabs the mic. "Listen here, you..." And forgets what they were going to say.`},
{m:'stumble',i:VP,mic:'lo',t:`{B} snatches the mic. "Yeah? Well… you're worse!" Somebody laughs, and it isn't {A}.`},
{m:'stumble',i:VP+' challenge',mic:'lo',vs:'h',t:`{B} tries a comeback but trips over the words. "You… you… shut up!"`},
{m:'stumble',i:VP+' challenge',mic:'lo',vs:'f',t:`{B} tries to fire back. "Yeah, well, you're... not... that great." It comes out mumbled. Everyone waits politely.`},
/* — more variety (v228 pass 2) — */
{m:'respect',i:'respect shake',nx:'shake+no',vs:'f',al:'h',t:`{B} narrows their eyes. "Respect? From you? What's the catch?"`},
{m:'respect',i:'respect shake',nx:'shake+no',vs:'f',al:'h',hk:'contract',t:`{B} signs, but never takes their eyes off {A}. "I'll believe it when I see it."`},
{m:'respect',i:'shake',ok:1,vs:'f',mic:'lo',t:`{B} shakes it firmly. "Good luck."`},
{m:'respect',i:'shake',ok:1,vs:'f',mic:'*',hot:1,t:`{B} hesitates, then takes the hand. A nod. "Fair enough."`},
{m:'mock',i:'shake',ok:0,vs:'h',mic:'lo',t:`{B} grunts and swats the hand away. "Nope."`},
{m:'respect',i:'shake',ok:0,vs:'h',t:`{B} smiles a little too wide. "Of course. Respect." Nobody believes it.`,ch:[
 {tc:'resp',t:`Shake it — but keep one eye on {B}`,s:'pop',d:.05,h:7,p:2,ok:`No cheap shot this time. {A} still doesn't relax.`,no:`{B} yanks {A} into a forearm. Of course.`},
 {tc:'cool',ri:'insult',t:`Pull the hand back: "I know that smile"`,s:'mic',d:.05,h:9,p:2,ok:`{B}'s grin freezes. Busted.`,no:`{B} shrugs. "Your loss."`},
 {al:'h',tc:'face',ri:'rough',t:`Beat {B} to it — cheap-shot them first`,s:'luck',d:.1,h:14,p:1,ok:`It takes a snake to know one. {B} never saw it coming.`,no:`{B} was waiting for exactly that.`}]},
{m:'respect',i:'respect',vs:'f',hk:'interview',t:`{B} returns the compliment. "Same to you. That's why I've studied every match you've ever had."`},
{m:'brag',i:'respect',nt:'resp',vs:'h',hk:'interview',t:`{B} shrugs. "Toughest? You haven't been in there with me yet."`},
{m:'fightback',i:'physical',ok:0,vs:'f',mic:'*',nhk:'interview',t:`{B} squares up, breathing hard. "Welcome to my house." The tables have turned.`},
{m:'fightback',i:'physical',ok:0,vs:'f',mic:'*',hk:'studio',t:`{B} raps a knuckle on the table that wouldn't move. "Sit down. We're not finished."`},
{m:'fightback',i:'physical rough shove',ok:0,vs:'f',t:`{B} doesn't even flinch. "Is that what you came here for?"`},
{m:'fightback',i:'physical rough shove',ok:0,vs:'f',mic:'*',hk:'live',t:`{B} plays to the crowd. "Not tonight!" The building explodes.`},
{m:'flip',i:V,nt:'cool face',vs:'f',t:`{B} steps forward. "Funny. You didn't talk like that the last time we were in a ring together."`},
{m:'mock',i:V,vs:'f',al:'h',t:`{B} shakes their head. "You know your problem? You actually believe all this."`},
{m:'dismiss',i:V,nt:'cool face',vs:'f',t:`{B} smiles calmly. "Keep talking. I'll be the one smiling at the end."`},
{m:'crowd',i:'insult promise',vs:'f',hk:'live',t:`{B} turns to the crowd. "Does anybody here believe that?" The answer is a very loud "NO!"`},
{m:'respect',i:V,vs:'f',al:'f',t:`{B} laughs. "Come on. You and I are better than this. Let's settle it the right way."`},
{m:'accept',i:'promise',vs:'f',t:`{B} stares right back. "You want to take something from me? Come and try."`},
{m:'defy',i:'mind',nt:'cool',vs:'f',mic:'*',hk:'live',t:`{B} meets the stare. "Go ahead. I've got all night." Ten seconds. Twenty. Neither blinks. The crowd is roaring.`},
{m:'dismiss',i:V,vs:'h',t:`{B} examines their nails. "Sorry, were you saying something? I tuned out."`},
{m:'brag',i:V,vs:'h',mic:'hi',t:`{B} smiles thinly. "You're not my rival. You're my homework. And I always finish my homework."`},
{m:'flip',i:V,vs:'h',t:`{B} laughs. "That's rich, coming from you."`},
{m:'dismiss',i:'insult promise',vs:'h',al:'f',t:`{B} fakes a huge yawn. "Wake me when the hero's done."`},
{m:'brag',i:'promise',vs:'h',t:`{B} leans back. "What's coming to me is another win. Same as always."`},
{m:'mock',i:'mind',nt:'cool',vs:'h',mic:'*',t:`{B} pretends to be terrified. "Oh no. Oh, please, not the scary face." Then bursts out laughing.`},
{m:'dismiss',i:'mind',vs:'h',hk:'interview',t:`{B} cuts {A} off mid-sentence. "Let me stop you there, because nobody cares."`},
{m:'accept',i:'power kneel partner',vs:'f',t:`{B} grits their teeth. "Fine. I'll play your little game. But when this is over, I'm coming for you."`},
{m:'defy',i:'sneak',ok:0,vs:'h',mic:'*',hk:'contract',t:`{B} reads the clause and smirks. "Cute. Here's mine." {B} scribbles in one of their own.`},
{m:'dismiss',i:'power kneel partner belt',vs:'h',t:`{B} laughs. "Cute. You think this is your show?"`},
{m:'defy',i:'power kneel partner',mic:'lo',t:`{B} shakes their head. "No."`},
{m:'accept',i:'challenge',ok:1,vs:'f',mic:'hi',t:`{B} smiles. "I was about to ask you the same thing. You saved me the trouble."`},
{m:'accept',i:'challenge',ok:1,vs:'h',t:`{B} thinks it over, then smiles. "Okay. But we do it my way."`},
{m:'accept',i:'challenge accepted',ok:1,vs:'h',at:1,t:`{B} grins. "A shot at the {T} title? Well, since you asked so nicely."`},
{m:'accept',i:'challenge accepted',ok:1,vs:'f',at:1,t:`{B} is stunned for a second. "A shot at the {T} title? I won't waste it."`},
{m:'threat',i:V,mic:'lo',vs:'f',t:`{B} grabs the mic. "Whatever. I'm gonna beat you." That's all they've got.`},
{m:'dismiss',i:V,mic:'lo',vs:'h',t:`{B} sneers. "Shut up." That's the whole answer.`},
{m:'accept',i:V+' challenge',mic:'lo',vs:'f',t:`{B} shrugs and jabs a thumb toward the ring. "There. Whenever."`},
{m:'threat',i:'rough shove',ok:1,vs:'f',mic:'*',hk:'live',t:`{B} shoves {A} right back. "Don't you ever put your hands on me!" Referees pour in to separate them.`},
{m:'rattled',i:'rough',ok:1,vs:'h',al:'f',t:`{B} holds their face, stunned. "You can't do that! You can't — I'm calling the office!"`},
{m:'mock',i:'insult brag promise',vs:'h',hk:'contract',t:`{B} signs with a flourish. "There. Now you've got my autograph. Hang on to it."`},
{m:'threat',i:V,vs:'f',mic:'*',hk:'contract',t:`{B} signs, slams the pen down and stands. "Talk's over."`},
{m:'dismiss',i:'mind',vs:'h',mic:'*',hk:'contract',t:`{B} picks up the contract upside down. "Hm. Interesting. Very interesting." Taking their sweet time.`},
{m:'threat',i:V+' belt',at:1,vs:'f',t:`{B} points at the {T} title. "Say whatever you want. I'm walking out with that."`},
{m:'brag',i:V+' belt',at:1,vs:'h',t:`{B} eyes the {T} title. "Shiny. It'll look better on me."`},
{m:'threat',i:'power belt',at:1,vs:'f',t:`{B} doesn't look at the belt — only at {A}. "Keep it close. You won't have it much longer."`},
{m:'mock',i:'kneel',vs:'h',t:`{B} starts to bow, stops halfway and grins. "Oh — you were serious?"`},
{m:'personal',i:V,hot:1,vs:'f',t:`{B}'s hands are shaking. "After everything you've done, you've still got the nerve to stand there?"`},
{m:'threat',i:V,hot:1,vs:'h',t:`{B} laughs, but their eyes are cold. "You really want to keep doing this? Fine. I can do this all year."`},
{m:'dismiss',i:V,nt:'cool face',big:1,vs:'f',t:`{B} smiles. "Nice speech. Now go earn it."`},
{m:'defy',i:V+' power',under:1,vs:'f',t:`{B} won't back down. "Nobody thinks I belong in there with you. That's exactly why I'm going to win."`},
{m:'threat',i:V,under:1,vs:'h',t:`{B} sneers. "Everybody's waiting for me to fail. Stick around. You'll be the one who does."`},
{m:'flip',i:'brag',nt:'crowd',vs:'h',t:`{B} laughs. "If you were that good, you wouldn't need the speech."`},
{m:'personal',i:'insult',nt:'cool face',vs:'f',al:'h',mic:'hi',t:`{B} waits a beat. "You can say anything about me. I know who I am. Do you?"`},
{m:'mock',i:'insult promise',vs:'f',al:'h',hk:'live',t:`{B} cups their ear. "Hear that? That's thousands of people who'd rather listen to me."`},
{m:'stumble',i:VP+' challenge',mic:'lo',t:`{B} starts strong — "Listen here!" — then loses the thread completely.`},
{m:'rattled',i:'insult brag',ok:1,mic:'lo',vs:'f',t:`{B} clenches their fists. "You... I swear..." Too angry to finish.`},
{m:'respect',i:'shake',ok:1,vs:'f',mic:'lo',t:`{B} takes the hand and gives a thumbs-up. "Good luck." Short and sweet.`},
{m:'respect',i:'shake',ok:1,vs:'f',al:'f',mic:'*',t:`{B} grips the hand and pulls {A} into a quick, hard hug. "Let's tear the house down."`},
{m:'respect',i:'shake',ok:1,vs:'f',al:'h',mic:'lo',t:`{B} stares at the hand for a long time before shaking it. "Okay."`},
/* — v250: answers for calls the old lists didn't fit — */
{m:'dismiss',i:'sneak',ok:1,vs:'h',mic:'*',hk:'contract',t:`{B} pushes the signed contract back without a second glance. "Done. See you there."`},
{m:'mock',i:'sneak',ok:1,vs:'f',mic:'*',hk:'contract',t:`{B} caps the pen. "That's it? I thought this would take longer."`},
{m:'brag',i:'sneak',ok:1,mic:'hi',hk:'contract',t:`{B} signs without looking down. "Read it? I don't need to read it. I just need to show up."`},
{m:'accept',i:'accepted',mic:'*',t:`{B} nods slowly. "Good. No backing out now."`},
{m:'threat',i:'accepted',vs:'h',t:`{B} grins. "You just made the biggest mistake of your career."`},
{m:'respect',i:'accepted',vs:'f',t:`{B} breaks into a smile. "That's all I wanted to hear."`},
{m:'accept',i:'accepted',mic:'lo',t:`{B} pumps a fist. "Yes! Okay. Yes."`},
{m:'flip',i:'accepted',vs:'h',mic:'hi',t:`{B} lets the moment sit. "You could have made me wait. You didn't." A thin smile. "That tells me everything."`},
{m:'dismiss',i:'shake',ok:0,vs:'f',mic:'lo',t:`{B} looks at the hand, then shrugs. "After. Not before."`},
{m:'threat',i:'snub',ok:0,mic:'*',t:`{B} finally lets go, smiling. "Firm handshake. Remember that feeling."`},
/* — v229: great-talker comebacks (mic 80+) — specific, personal, a pause, a hard last line — */
{m:'mock',i:V,nt:'cool face crowd',vs:'h',mic:'hi',t:`{B} lets {A} finish, then waits a little longer. "You practiced that. I can tell. The pause before the big word? Lovely." A beat. "Shame about the big word."`},
{m:'mock',i:V,nt:'cool face crowd',vs:'f',mic:'hi',t:`{B} smiles. "I've heard that speech before. Better. From people I beat." A shrug. "You can ask them. They're in the back, icing something."`},
{m:'mock',i:'insult',vs:'h',al:'f',mic:'hi',t:`{B} nods along. "The hero, the people's choice, the good one." {B} leans in. "Every hero I've ever met needed somebody like me to stand next to. You're welcome."`},
{m:'mock',i:'promise',vs:'h',mic:'hi',t:`{B} laughs, softly. "You promised them that last year. And the year before. At some point, those aren't promises. They're a tradition."`},
{m:'mock',i:'brag',nt:'crowd',vs:'f',mic:'hi',t:`{B} counts on one hand, slowly, then puts the hand down. "You listed a lot. You left out the part where I beat you."`},
{m:'mock',i:V,vs:'h',ok:0,mic:'hi',t:`{B} waits. Lets the silence sit. "Take your time. Honestly. We'll all wait." It's devastating, and {B} hasn't even raised their voice.`},
{m:'flip',i:V,nt:'face crowd',vs:'h',mic:'hi',t:`{B} nods. "Everything you just said is true." A long pause. "About you. You've just never had anyone tell you to your face."`},
{m:'flip',i:'insult promise',nt:'cool face',vs:'f',mic:'hi',t:`{B} steps closer. "You talk about who I am. I'll tell you what you are. You're the reason I get up at five. Thank you. I mean that."`},
{m:'flip',i:'brag',nt:'crowd',mic:'hi',t:`{B} smiles. "If you have to tell them you're the best, you've already lost the argument. The best never have to say it." A shrug. "I'm not saying it."`},
{m:'flip',i:'power',vs:'f',mic:'hi',hk:'contract',t:`{B} looks at the lawyer, the guards, the paperwork. "You brought all of this. I brought me." A beat. "One of us is scared."`},
{m:'brag',i:VC,vs:'h',bt:1,mic:'hi',t:`{B} doesn't even lift the {BT} title. Just taps it. "Every name on this belt thought they'd keep it. I'm the first one who actually will."`},
{m:'brag',i:V,vs:'f',mic:'hi',t:`{B} looks away for a second. "Ten years ago I wrestled in front of eleven people. I remember every face." A pause. "I'll remember yours too, when I'm done with you."`},
{m:'brag',i:VC,vs:'h',big:1,mic:'hi',t:`{B} spreads their arms. "They didn't buy a ticket for you. They bought one for me and you came free with it."`},
{m:'dismiss',i:VP,vs:'h',mic:'hi',t:`{B} checks the time, very politely. "I'll give you this. That was the longest you've ever held a room." A beat. "Was."`},
{m:'dismiss',i:VC,nt:'cool face',vs:'f',mic:'hi',t:`{B} doesn't raise their voice. "Everything you said, I've heard. Everything you'll do, I've seen. Save it for {PPV}. That's where it counts."`},
{m:'personal',i:V,vs:'h',hot:1,mic:'hi',t:`{B} gets very quiet. "I was there the night you nearly quit. I drove you home. Remember what you said in the car?" A long pause. "I do."`},
{m:'personal',i:V,nt:'cool face',vs:'f',al:'h',mic:'hi',t:`{B} takes a breath. "You can say what you want about me. But you know what you did. And every night, so do the people who trusted you."`},
{m:'personal',i:'insult',vs:'h',mic:'hi',t:`{B} smiles, and it isn't friendly. "You want to talk about families? Fine. How many of yours still pick up when you call?"`},
{m:'threat',i:VC,vs:'f',ppv:1,mic:'hi',t:`{B} doesn't blink. "At {PPV}, I'm going to hurt you in a way that makes you think about it every time you get out of bed." A pause. "For a long time."`},
{m:'threat',i:VP,vs:'h',mic:'hi',t:`{B} smiles. "You know what I like about you? You keep showing up. Most people learn." {B} leans in. "I'll teach you."`},
{m:'threat',i:'rough brawl',ok:1,vs:'f',hot:1,mic:'hi',t:`{B} wipes their mouth and looks at the blood on their hand. "Okay. Now I'm interested."`},
{m:'accept',i:'challenge',ok:1,vs:'f',mic:'hi',t:`{B} takes the mic, looks at {A} for a long second, and nods. "Yes." The mic goes down. "Now we stop talking."`},
{m:'accept',i:'challenge',ok:1,vs:'h',mic:'hi',t:`{B} laughs. "You want me? Fine. But understand what you're asking for." {B} taps {A}'s chest. "You're asking me to end your year."`},
{m:'accept',i:'challenge',ok:1,vs:'f',hot:1,mic:'hi',t:`{B} pulls the jacket off and drops it. "I've wanted this since the first night you put your hands on me. Thank you for asking."`},
{m:'dodge',i:'challenge',ok:0,vs:'h',mic:'hi',t:`{B} holds up a hand. "No. Not because I'm scared. Because you haven't earned it, and if I give it to you, you'll think you did."`},
{m:'respect',i:'shake',ok:1,vs:'f',mic:'hi',t:`{B} holds the handshake. "You're the best I've faced. I'm saying it now so nobody thinks I'm saying it because I lost."`},
{m:'respect',i:'respect shake',nx:'shake+no',vs:'f',al:'f',mic:'hi',t:`{B} nods slowly. "We came up together. Same vans, same bad motels." A smile. "One of us gets to be the one who made it. I'm sorry it's not you."`},
{m:'respect',i:'respect',vs:'h',mic:'hi',t:`{B} pauses. "I don't respect many people. I respect you." A thin smile. "That's why I'm going to enjoy this so much."`},
{m:'crowd',i:V,vs:'f',al:'h',hk:'live',mic:'hi',t:`{B} doesn't say anything. Just turns to the crowd and lets them answer. Twenty thousand people. {B} turns back. "Any questions?"`},
{m:'crowd',i:V,vs:'h',al:'f',hk:'live',mic:'hi',t:`{B} listens to the cheers for {A}, smiling. "Enjoy it. They cheered the last one too. Ask them where that one is now."`},
{m:'defy',i:'power kneel',vs:'f',mic:'hi',hk:'contract',t:`{B} looks at the paper, then at {A}. "I've signed worse. I've lost worse. I've come back from worse." {B} signs. "You haven't."`},
{m:'defy',i:'kneel',vs:'h',mic:'hi',hk:'champ',t:`{B} laughs. "Kneel? I've stood in rings with people who'd eat you for breakfast. I didn't kneel then."`},
{m:'rattled',i:'mind',ok:1,vs:'h',mic:'hi',t:`{B} starts a comeback, stops, starts again. For a second, the sharpest talker around has nothing. Then: "...You'll pay for that." It isn't convincing.`},
/* — v229: weak-talker comebacks (mic under 60) — short, blunt, sometimes tangled — */
{m:'mock',i:V,mic:'lo',t:`{B} grabs the mic. "That's... that's dumb." Everyone waits for more. There isn't more.`},
{m:'mock',i:'brag',mic:'lo',vs:'h',t:`{B} rolls their eyes. "Yeah. Sure. Okay." That's the whole comeback.`},
{m:'mock',i:V,mic:'lo',vs:'f',t:`{B} laughs, a beat too late. "Ha. No." It doesn't help {B} at all.`},
{m:'brag',i:V,mic:'lo',vs:'h',t:`{B} points at themselves. "I'm better. Than you. Way better." It lands with a thud.`},
{m:'brag',i:V,mic:'lo',vs:'f',t:`{B} holds up a fist. "I've won before. I'll win again." Short and honest.`},
{m:'threat',i:VC,mic:'lo',vs:'h',t:`{B} jabs a finger at {A}. "You're dead. You're — you're so dead." It's loud, at least.`},
{m:'threat',i:VC,mic:'lo',vs:'f',ppv:1,t:`{B} nods hard. "At {PPV}, I'm gonna... yeah. You'll see." Points for intent.`},
{m:'rattled',i:V,mic:'lo',vs:'f',t:`{B} stares. "That's — you can't say that." {B} looks around for help. "Can they say that?"`},
{m:'stumble',i:V,mic:'lo',vs:'h',t:`{B} tries to go personal. "Your — your mom! Your mom thinks you're..." {B} gives up mid-sentence. Painful.`},
{m:'stumble',i:V,mic:'lo',t:`{B} snaps back: "No, YOU are!" A pause. "...That." It doesn't land.`},
{m:'accept',i:'challenge',ok:1,mic:'lo',vs:'h',t:`{B} shrugs. "Fine. Whatever. I'll beat you." {B} drops the mic. It isn't a mic drop. It's just dropping it.`},
{m:'dismiss',i:VC,w:1,mic:'lo',vs:'h',t:`{B} waves a hand. "Boring." And turns away, clearly hoping that was enough. It mostly was.`},
{m:'respect',i:'respect',mic:'lo',vs:'f',al:'f',t:`{B} scratches the back of their neck. "Thanks. You're, uh — you're good too. Real good." Sincere, if not smooth.`},
{m:'stumble',i:VP+' challenge',mic:'lo',t:`{B} starts — "At {PPV}, I'm gonna —" — and gets the show name wrong. {A} says the right one. {B} points at them. "That one."`},
{m:'stumble',i:VP,mic:'lo',vs:'h',t:`{B} pulls a crumpled note out of their tights. "You're going... down... at the..." Puts it away. Everyone saw it.`},
{m:'stumble',i:VP,mic:'lo',vs:'f',t:`{B} goes for the big line. "At {PPV}, Steve, you're—" Wrong name. {A} just waits for them to fix it.`}
];

/* ---------- the response beat ---------- */
function rtScene(p,ctx,st,ai){if(!rtOn(p,ctx)||!st||!st.lastC)return null;
 const x={i:rtIntent(st.lastC),ok:(st.oks||[]).slice(-1)[0]?1:0,tier:rtTier(ctx.B),heat:heatOf(p.a,p.b)};
 const el=RT.filter(o=>rtFit(o,ctx,x));if(!el.length)return null;
 /* v229: a great talker mostly gets the great lines written for them */
 const e=wpick(el,o=>rtSpec(o)*(x.tier==='hi'&&o.mic==='hi'?2.5:1)*(seenP(o.t)?.03:1));
 const own=(e.ch||[]).map(o=>Object.assign({key:1},o));const pool=own.concat(FU[e.m]||[]).filter(o=>rtExtra(o,ctx,x));
 let ch=dealChoices(pool,ctx,3);if(ch.length<2)return null;ch=ch.map(o=>Object.assign({},o,{rt:1,key:0}));
 if(!ai)noteP([e.t,...ch.map(o=>o.t)]);st.rtDone=1;
 const tw=pickTwist(p,ctx,ai);const keep=!!(tw&&(tw.hj||tw.myst||tw.cd))||Math.random()<(window.TW_P!=null?window.TW_P:TW_RT_P);
 st.tw=keep?tw:null;if(!keep){ctx.MYST=null;ctx.CD=null}st.rtFull=!keep;return {text:e.t,ch,rt:1,m:e.m,last:!keep}}

/* ---------- the mic drop ---------- */
function mdOk(p,ctx,st,sc){if(!p||!ctx||!ctx.A||!st||!sc||!sc.ch)return false;if(['turn','vignette'].includes(p.type))return false;
 if(sc.x||sc.myst||sc.cd||sc.hj||/\{X\}/.test(sc.text||'')||sc.ch.some(c=>c.drop))return false;
 const oks=st.oks||[];const need=sc.rt?1:st.rtDone?2:1;if(oks.length<need||!oks.every(Boolean))return false;
 if(!st.rtDone&&ctx.A.mic+(hasT(ctx.A,'mouth')?10:0)<68)return false;
 return Math.random()<(st.rtDone?.6:.45)}
function mdChoice(ctx){const K=ctx.K||new Set();const hi=typeof voiceTier==='function'&&voiceTier(ctx.A)==='hi';
 /* v229: a great talker's mic drop gets a line before it; everyone else just lets the moment end */
 const P=(g,ok)=>pick(hi?g:ok);
 if(K.has('studio'))return {t:`🎤 End it on that line and walk out`,drop:1,always:1,s:'mic',tip:'Locks in a strong finish · ends the segment',ok:P([`"That's all." {A} stands, buttons their jacket and leaves. Nobody in the studio moves.`,`{A} pulls off the microphone and sets it on the table. "Ask me again after." Then walks out. Nothing left to say.`],[`{A} stands, buttons their jacket and leaves. Nobody in the studio moves.`,`{A} pulls off the microphone, sets it on the table and walks out. Nothing left to say.`])};
 if(K.has('back')||K.has('lot'))return {t:`🎤 Walk off on that line`,drop:1,always:1,s:'mic',tip:'Locks in a strong finish · ends the segment',ok:P([`{A} lets the line sit, then: "Think about it." And walks. The camera holds on the empty hallway.`,`"You heard me." {A} leaves it there. The cameraman doesn't know whether to follow.`],[`{A} turns and walks away. The camera holds on the empty hallway.`,`{A} leaves it there. The cameraman doesn't know whether to follow.`])};
 return {t:`🎤 Drop the mic and walk off`,drop:1,always:1,s:'mic',tip:'Locks in a strong finish · ends the segment',ok:P([`{A} looks at the crowd, then at the mic. "I'm done." It hits the canvas and the place erupts.`,`"See you at {PPV}." Mic drop. {A} doesn't look back, and the crowd loses it.`,`{A} holds the mic out at arm's length. Waits. Lets it fall. The thud is the loudest thing in the building, until the crowd.`],[`{A} lets the mic hit the canvas and walks off. The place erupts.`,`Mic drop. {A} doesn't look back, and the crowd loses it.`,`The mic hits the mat with a thud. {A} has said everything that needed saying.`])}}
function mdAdd(PSx){if(!mdOk(PSx.p,PSx.ctx,PSx.st,PSx.scene))return;PSx.scene.ch=PSx.scene.ch.concat([mdChoice(PSx.ctx)])}
/* the rival drops the mic when the twist looks risky */
function mdAI(p,ctx,st,tw){if(!mdOk(p,ctx,st,tw))return false;const best=aiChoose(tw.ch,ctx);if(chance(best,ctx)>=.7)return false;roll(mdChoice(ctx),ctx,st);return true}

/* ---------- hooks ---------- */
const _roll=roll;
roll=function(c,ctx,st){st.lastC=c;
 if(c.drop){st.drop=true;st.score+=MD_SCORE;st.heat+=2;st.pop+=1;const text=fill(c.ok,ctx);st.log.push(fill(c.t.replace(/^🎤\s*/,''),ctx)+' — '+text);(st.oks=st.oks||[]).push(true);return {success:true,text}}
 /* the response beat is centred: a landed answer is worth more the riskier it was, a miss costs more the safer it was,
    and on average it adds nothing — so the extra beat changes how a promo goes, not how high promos rate */
 if(c.rt&&st.rtFull){const s0=st.score,h0=st.heat,p0=st.pop;const out=_roll(c,ctx,st);
  st.score=s0+(st.score-s0)*RT_LAST.score;st.heat=h0+(st.heat-h0)*RT_LAST.heat;st.pop=p0+(st.pop-p0)*RT_LAST.pop;return out}
 if(c.rt&&!st.rtFull){const f=['heat','hx','pop','chem'],s0={};f.forEach(k=>s0[k]=st[k]||0);const sc0=st.score,p=chance(c,ctx);const out=_roll(c,ctx,st);
  {const sw=swingOf(p);st.score=sc0+RT_RS*(out.success?sw.w:-sw.l)/.35}f.forEach(k=>{st[k]=s0[k]+((st[k]||0)-s0[k])*RT_W});return out}
 return _roll(c,ctx,st)};
const _pc=promoCtx;
promoCtx=function(p,brand){const c=_pc(p,brand);c.brand=brand;if(c.B){const bt=titlesOf(c.B.id)[0];c.BT=bt?bt.n:''}
 /* v229: every promo knows the next PPV (a promised match's PPV first), so lines can name it */
 let pv='';try{const pr=c.B&&pendingPromises().find(x=>key(x.a,x.b)===key(p.a,p.b)&&x.ppv&&x.week>S.week);const np=nextPPVAfter(S.week);pv=pr?pr.ppv:np&&np.w-S.week<=4?np.n:''}catch(e){}c.PPV=pv
 return c};
const _fill=fill;
fill=function(s,c){return _fill(s,c).replace(/\{BT\}/g,c.BT||'the title').replace(/\{PPV\}/g,c.PPV||'the next pay-per-view').replace(/\{H\}/g,c.H?c.H.name:'')};

/* ---------- look ---------- */
(function(){const c=document.createElement('style');c.textContent=`
#modal .scene.rtq{border-left:3px solid var(--gold);padding-left:12px;font-style:italic}
#modal .choice.mdrop{background:linear-gradient(90deg,rgba(216,180,73,.22),rgba(216,180,73,.04));box-shadow:inset 0 0 0 1px var(--gold)}
`;document.head.appendChild(c)})();

Object.assign(window,{rtScene,rtIntent,rtTier,rtFit,rtExtra,rtSpec,mdAdd,mdAI,mdOk,mdChoice,RT_LIB:RT,RT_FU:FU,RT_RS,RT_LAST,TW_RT_P});
})();
