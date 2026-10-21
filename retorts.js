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
const RT_SC=1.6;        /* its swing on the promo score: +RT_SC×(1−odds) if it lands, −RT_SC×odds if it doesn't */
const RT_TYPES=['callout','champ','contract','interview'];
const MD_SCORE=.3;      /* what a mic drop locks in (a landed call is worth ~1.4, a missed one −1 — so about a typical call's average) */

/* ---------- reading the call {A} just made ---------- */
function rtIntent(c){const t=(c.t||'').toLowerCase();
 if(/laugh in their face|pull it away|taunt|hide behind|embarrassing|footage|crimes|evidence/.test(t))return 'insult';
 if(c.ch||c.stp||/\bchallenge\b|title match on the spot|any time, anywhere|prove it|stipulation|fight right here/.test(t))return 'challenge';
 if(/through the table|put .* through|table on|flip the table|smash|steel chair|nail .* with|press .* over|pull-apart brawl|by force/.test(t))return 'physical';
 if(/shove|slap|confetti|drag /.test(t))return 'rough';
 if(/greatest|not as great as|only weapon|unstoppable|record/.test(t))return 'brag';
 if(/won't take/.test(t))return 'snub';
 if(/handshake|shake /.test(t))return 'shake';
 if(/respectfully|toughest|history between|may the best|thank/.test(t))return 'respect';
 if(/kneel|beg|earn a title shot|fine print|clause|lawyer|security hold|partnership|hold the belt|belt in .* face|the belt —|belt to hold|refuse to sign|apologi/.test(t))return 'power';
 if(/stare|silence|calm|dissect|move by move|perfect line|empty chair|big screen|under their skin|weakness/.test(t))return 'mind';
 if(/promise|for everyone|nowhere left|what's coming|take something|crying by the end/.test(t))return 'promise';
 return 'insult'}
function rtTier(B){const m=B.mic+(hasT(B,'mouth')?10:0);return m<60?'lo':m>=80?'hi':'mid'}
function rtOn(p,ctx){return !!(p&&p.b&&ctx&&ctx.A&&ctx.B&&RT_TYPES.includes(p.type)&&!inTeam(p.a,p.b))}
/* the extra checks this file adds on top of okFor */
function rtExtra(o,ctx,x){if(o.bt&&!ctx.BT)return false;if(o.nbt&&ctx.BT)return false;if(o.at&&!ctx.T)return false;if(o.hot&&x.heat<40)return false;if(o.ppv&&!ctx.PPV)return false;
 if(o.under&&!(ctx.B.pop<=ctx.A.pop-12))return false;if(o.big&&!(ctx.B.pop>=ctx.A.pop+12))return false;return true}
function rtFit(o,ctx,x){if(!okFor(o,ctx)||!rtExtra(o,ctx,x))return false;
 if(o.i!=='*'&&!o.i.split(' ').includes(x.i))return false;
 const mt=o.mic||'';if(x.tier==='lo'){if(mt!=='lo'&&mt!=='*')return false}else{if(mt==='lo')return false;if(mt==='hi'&&x.tier!=='hi')return false}
 if(o.ok!=null&&o.ok!==x.ok)return false;return true}
const rtSpec=o=>(o.bt||o.at||o.hot||o.ppv||o.under||o.big||o.ok!=null||o.mic==='hi'||o.mic==='lo'||o.hk||o.al)?2.2:1;

/* ---------- {A}'s answers, by what {B} just did ---------- */
const FU={
mock:[
 {t:`Laugh it off: "That's the best you've got?"`,s:'mic',d:.1,h:10,p:2,ok:`{B}'s grin slips. The comeback stung more than the insult.`,no:`The laugh sounds forced. {B} knows they got to {A}.`},
 {t:`Fire back with something even more personal`,s:'mic',d:.15,h:14,p:1,ok:`The crowd gasps. That one crossed a line — and it worked.`,no:`It goes too far. Even {A}'s fans wince.`},
 {al:'f',hk:'live',t:`Let the crowd answer for them`,s:'pop',d:.05,h:8,p:3,ok:`The building drowns {B} out with "{A}" chants.`,no:`The chant never gets going. Awkward silence.`},
 {al:'h',t:`Pretend to cry, then smirk`,s:'mic',d:.05,h:12,p:2,ok:`The fake tears are so smug the whole place boos.`,no:`Nobody's sure it was a joke. Neither is {A}.`},
 {t:`Drop the mic and get in {B}'s face`,s:'ring',d:.1,h:13,p:1,ok:`Nose to nose. Nobody is laughing now.`,no:`{B} doesn't flinch. {A} looks like they ran out of words.`},
 {al:'f',t:`Admit it stung — and promise {B} will pay for it`,s:'mic',d:.1,h:10,p:3,ok:`Honest and fired up. The fans are right there with {A}.`,no:`It comes out more hurt than angry.`},
 {al:'h',t:`Tell {B} nobody here even knows their name`,s:'mic',d:.1,h:11,p:2,ok:`Cold. {B} looks around like they're checking.`,no:`The crowd chants {B}'s name to prove a point.`},
 {t:`Say nothing and just smile`,s:'luck',d:0,h:8,p:1,ok:`The smile says more than any comeback could.`,no:`It reads as speechless.`}],
flip:[
 {t:`Turn it right back on {B}`,s:'mic',d:.15,h:12,p:2,ok:`A perfect counter. {B} has nothing.`,no:`It comes out tangled. {B} wins the exchange.`},
 {t:`Concede the point — then land the knockout line`,s:'mic',d:.2,h:12,p:3,ok:`"You're right. And it won't matter." Huge reaction.`,no:`The setup works. The punchline doesn't.`},
 {t:`Tell {B} words don't win matches`,s:'ring',d:.05,h:9,p:1,ok:`{A} cracks their knuckles. Point made.`,no:`It sounds like {A} has run out of words.`},
 {al:'h',t:`Accuse {B} of reading off cue cards`,s:'mic',d:.1,h:10,p:2,ok:`{A} mimes flipping cards. The boos are loud.`,no:`{B} holds up empty hands. The crowd laughs at {A}.`},
 {al:'f',t:`Tell {B} clever lines won't help when the bell rings`,s:'mic',d:.05,h:9,p:2,ok:`Simple and true. The fans cheer.`,no:`It sounds a little defensive.`},
 {t:`Shove the mic into {B}'s chest`,s:'ring',d:.1,h:12,p:1,ok:`{B} stumbles back a step. Done talking.`,no:`{B} catches it and keeps talking.`}],
brag:[
 {t:`Remind everyone who {B} lost to last time`,s:'mic',d:.1,h:12,p:2,ok:`The air goes out of {B}'s victory lap.`,no:`{B} shrugs it off. Old news.`},
 {bt:1,t:`Tell {B} that {BT} title is only on loan`,s:'mic',d:.1,h:12,p:2,ok:`{B} grips the belt a little tighter.`,no:`{B} holds the belt up. Possession is nine-tenths of the law.`},
 {t:`Mock {B}'s bragging with a slow clap`,s:'luck',d:.05,h:10,p:2,ok:`Clap… clap… clap. The crowd joins in.`,no:`{B} bows. The clap backfires.`},
 {al:'f',hk:'live',t:`Tell {B} the fans see right through it`,s:'pop',d:.05,h:9,p:3,ok:`The fans roar in agreement.`,no:`A few fans actually cheer {B}.`},
 {al:'h',t:`Yawn loudly and check the time`,s:'luck',d:.05,h:10,p:2,ok:`Maximum disrespect. {B} is fuming.`,no:`It just looks rude.`},
 {t:`Promise to be the one who ends it`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`"I'll be the one." The match is on.`,no:`{B} laughs. "Get in line."`},
 {t:`Ask why someone so great still needs to say it`,s:'mic',d:.1,h:11,p:2,ok:`{B} opens their mouth, then closes it.`,no:`{B} has an answer ready. It's a good one.`}],
dismiss:[
 {t:`Refuse to leave until {B} takes this seriously`,s:'pop',d:.1,h:10,p:2,ok:`{A} plants their feet. {B} finally turns around.`,no:`{B} walks off anyway. {A} is left standing alone.`},
 {t:`Get right in {B}'s face so they can't look away`,s:'ring',d:.1,h:13,p:1,ok:`Now {B} is paying attention.`,no:`{B} looks straight through {A}.`},
 {al:'f',t:`Tell {B} they'll be thinking about {A} every night until the match`,s:'mic',d:.1,h:10,p:3,ok:`It gets under {B}'s skin. You can see it.`,no:`{B} waves it off again.`},
 {al:'h',t:`Jump {B} from behind as they turn away`,s:'luck',d:.05,h:16,p:1,ok:`{B} crumples. Now they're paying attention.`,no:`{B} sees it coming and slips out of the ring.`},
 {t:`Demand a match so {B} can't ignore them`,s:'mic',d:.05,h:9,p:2,ch:1,ok:`Put on the spot, {B} can't say no.`,no:`{B} keeps walking.`},
 {t:`Laugh: "Walk away. That's what you're good at."`,s:'mic',d:.1,h:11,p:2,ok:`{B} stops dead in their tracks.`,no:`{B} keeps walking — and waves.`}],
personal:[
 {al:'f',t:`Go quiet — then promise {B} will regret that`,s:'mic',d:.1,h:14,p:3,ok:`The anger in {A}'s voice gives the crowd chills.`,no:`{A} can't get the words out. {B} smirks.`},
 {al:'f',t:`Charge at {B} — security can't hold {A} back`,s:'ring',d:.1,h:16,p:2,ok:`It takes four officials to pull {A} off.`,no:`Security gets there first. {B} laughs from behind them.`},
 {al:'h',t:`Smile and say it doesn't hurt — then go even lower`,s:'mic',d:.2,h:16,p:1,ok:`Vicious. The boos are deafening.`,no:`Even heels have limits. The crowd turns on {A}.`},
 {t:`Tell {B} that line just cost them`,s:'mic',d:.1,h:12,p:2,ok:`Quiet and cold. The crowd knows it's serious now.`,no:`It sounds like a bluff.`},
 {t:`Throw the mic down and walk off without a word`,s:'luck',d:0,h:12,p:1,ok:`The silence is deafening. That hit home.`,no:`It looks like {B} won the exchange.`},
 {al:'h',t:`Pretend not to care, then cheap-shot {B}`,s:'luck',d:.1,h:15,p:1,ok:`Low blow. {B} drops.`,no:`{B} blocks it and shoves {A} away.`},
 {al:'f',t:`Take a breath: "That's low, even for you"`,s:'mic',d:.05,h:10,p:3,ok:`Calm and wounded. The crowd turns on {B}.`,no:`It sounds like {B} won that round.`},
 {t:`Bring up something {B} would rather forget`,s:'mic',d:.15,h:14,p:1,ok:`{B} goes pale. Two can play that game.`,no:`{B} laughs it off. It doesn't land.`}],
threat:[
 {t:`Tell {B} to stop talking and do it`,s:'ring',d:.1,h:12,p:2,ch:1,ok:`"Then do it." The match is on.`,no:`{B} smiles. "When I decide."`},
 {t:`Take off the jacket and wait`,s:'pop',d:.05,h:11,p:2,ok:`The crowd rises. {B} has to back it up now.`,no:`They stand there. Nothing happens.`},
 {al:'h',t:`Hide behind the referee, then taunt`,s:'luck',d:.05,h:10,p:2,ok:`Gutless and infuriating. Perfect.`,no:`The referee steps aside. {A} is exposed.`},
 {al:'f',t:`Step forward until they're nose to nose`,s:'ring',d:.1,h:13,p:2,ok:`Neither one blinks. The crowd is buzzing.`,no:`{B} shoves first. {A} is caught off balance.`},
 {t:`Say they've heard threats from better than {B}`,s:'mic',d:.1,h:11,p:2,ok:`{B}'s jaw tightens.`,no:`{B} laughs. "Name one."`},
 {al:'h',t:`Call security on {B} — then laugh`,s:'luck',d:.05,h:12,p:1,ok:`{B} is escorted out, seething.`,no:`Security takes {B}'s side.`},
 {al:'f',t:`Laugh: "Get in line"`,s:'mic',d:.05,h:9,p:2,ok:`Unbothered. The fans cheer.`,no:`{B} doesn't think it's funny. Neither does the crowd.`},
 {t:`Point to the ring: "Then let's go. Right now."`,s:'ring',d:.1,h:13,p:2,ch:1,ok:`{B} has to accept. The match is made.`,no:`{B} smiles and backs off. "Not yet."`}],
accept:[
 {t:`Make it official — right now`,s:'mic',d:.05,h:9,p:2,ch:1,ok:`It's done. The match is made.`,no:`They argue over terms. Nothing gets signed tonight.`},
 {t:`Raise the stakes: no excuses, no rematch`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`The crowd erupts. This just got serious.`,no:`{B} won't agree to the terms. Not yet.`},
 {al:'f',t:`Offer a handshake to seal it`,s:'pop',d:.05,h:6,p:3,ok:`They shake. The fans applaud.`,no:`{B} leaves the hand hanging.`},
 {al:'h',t:`Agree — then attack {B} before the handshake`,s:'luck',d:.1,h:16,p:1,ok:`Classic. {B} is down before they knew what hit them.`,no:`{B} expected it and counters.`},
 {t:`Tell {B} they just made the worst mistake of their career`,s:'mic',d:.1,h:11,p:2,ok:`Delivered with total conviction.`,no:`{B} grins. "We'll see."`},
 {t:`Stare {B} down until the lights go out`,s:'pop',d:.05,h:10,p:1,ok:`The lights cut out on two people who can't wait.`,no:`The director cuts away too early.`}],
dodge:[
 {al:'f',t:`Call {B} a coward in front of everyone`,s:'mic',d:.05,h:12,p:3,ok:`"Coward!" The fans pick it up instantly.`,no:`{B} shrugs. They've been called worse.`},
 {t:`Promise to keep showing up until {B} says yes`,s:'pop',d:.05,h:10,p:2,ok:`{B} realizes this isn't going away.`,no:`{B} looks relieved to leave.`},
 {hk:'live',t:`Block the ramp so {B} can't leave`,s:'ring',d:.1,h:13,p:2,ok:`{B} is trapped. Nowhere to run.`,no:`{B} goes through the crowd instead.`},
 {al:'f',hk:'live',t:`Get the crowd chanting for {B} to say yes`,s:'pop',d:.1,h:11,p:3,ch:1,ok:`Shamed in front of thousands, {B} finally agrees.`,no:`{B} covers their ears and walks off.`},
 {t:`Offer {B} whatever terms they want`,s:'mic',d:.1,h:9,p:2,ch:1,ok:`{B} can't resist. The match is on.`,no:`{B} still won't commit.`},
 {al:'h',t:`Out-weasel {B}: "Fine. I'll find you when you least expect it."`,s:'mic',d:.1,h:12,p:2,ok:`Now {B} has to look over their shoulder.`,no:`{B} laughs. Two cowards, one ring.`}],
respect:[
 {t:`Shake hands and promise to give everything`,s:'pop',d:.05,h:5,p:3,ok:`A real moment. The fans applaud them both.`,no:`It's a little awkward, but sincere.`},
 {t:`Thank {B}, then remind them friendship ends at the bell`,s:'mic',d:.05,h:8,p:2,ok:`Respect and fire. The perfect build.`,no:`It sounds more like a threat than intended.`},
 {al:'h',t:`Pretend to shake — then laugh in {B}'s face`,s:'mic',d:.1,h:14,p:1,ok:`Disgusting. The boos rain down.`,no:`{B} saw it coming and just shakes their head.`},
 {t:`Tell {B} this match will be the best of both their careers`,s:'mic',d:.1,h:7,p:3,ch:1,ok:`The crowd chants "Book it!" — so it's booked.`,no:`The crowd wants it, but nothing is signed.`},
 {al:'h',t:`Tell {B} respect is for losers`,s:'mic',d:.05,h:12,p:2,ok:`{B}'s face falls. The crowd boos.`,no:`It sounds petty.`},
 {t:`Nod once and walk away — nothing left to say`,s:'luck',d:0,h:5,p:2,ok:`Understated and classy.`,no:`It looks like {A} didn't know what to say.`}],
laidout:[
 {t:`Stand tall over {B}`,s:'pop',d:.05,h:10,p:3,ok:`{A} poses over the wreckage. The image of the night.`,no:`Officials pull {A} away before the shot lands.`},
 {al:'h',t:`Keep going — one more shot for good measure`,s:'ring',d:.1,h:15,p:1,ok:`Excessive. Cruel. The crowd is livid.`,no:`Referees swarm {A} before they can do it.`},
 {t:`Grab a mic and leave {B} a message`,s:'mic',d:.1,h:12,p:2,ok:`"Remember this feeling." Chilling.`,no:`The mic's dead. {A} throws it down.`},
 {al:'f',t:`Back off before it goes too far`,s:'pop',d:0,h:7,p:3,ok:`{A} knows when to stop. The fans respect it.`,no:`It looks like {A} lost their nerve.`},
 {al:'h',t:`Pose with {B}'s gear like a trophy`,s:'luck',d:.05,h:13,p:2,ok:`{A} drapes {B}'s jacket over their own shoulders. Vile.`,no:`The jacket rips. Less intimidating.`},
 {t:`Walk away without looking back`,s:'luck',d:0,h:9,p:1,ok:`Cold and calm. Business is done.`,no:`{B} starts to stir as {A} leaves. Not quite the finish.`},
 {al:'f',t:`Point to the crowd, then down at {B}: "That was for them"`,s:'pop',d:.05,h:10,p:3,ok:`The fans roar. Justice, at last.`,no:`{B} rolls away before {A} finishes.`}],
fightback:[
 {t:`Roll out of the ring and regroup`,s:'luck',d:0,h:8,p:1,ok:`{A} gets out before it gets worse.`,no:`{B} follows them out.`},
 {t:`Swing for the fences`,s:'ring',d:.15,h:14,p:2,ok:`It lands. Both are down — chaos.`,no:`{B} ducks again. {A} is hurting.`},
 {al:'h',t:`Beg off, then rake {B}'s eyes`,s:'luck',d:.1,h:13,p:1,ok:`Dirty, but it works. {A} escapes.`,no:`{B} isn't falling for it twice.`},
 {al:'f',t:`Fire up and trade blows in the middle of the ring`,s:'ring',d:.1,h:13,p:3,ok:`The crowd counts along with every punch.`,no:`{B} gets the last shot in.`},
 {t:`Back up the ramp, pointing: "This isn't over"`,s:'mic',d:.05,h:10,p:1,ok:`The threat lingers as the lights go down.`,no:`It looks like a retreat — because it is.`},
 {t:`Go right back at {B}`,s:'ring',d:.15,h:14,p:2,ok:`{A} levels {B}. Now it's even.`,no:`{B} is ready. {A} eats another one.`}],
retreat:[
 {hk:'live',t:`Chase {B} up the ramp`,s:'ring',d:.1,h:12,p:2,ok:`{A} catches them at the stage. The fans love it.`,no:`{B} gets through the curtain first.`},
 {t:`Let them run: "You can't hide forever"`,s:'mic',d:.05,h:10,p:2,ok:`The promise hangs over {B} for the week.`,no:`It sounds a little hollow.`},
 {al:'h',t:`Throw {B}'s gear after them`,s:'luck',d:.05,h:11,p:1,ok:`It sails over {B}'s head. Insult added to injury.`,no:`It barely makes it past the apron.`},
 {al:'f',hk:'live',t:`Get the crowd chanting "Coward!"`,s:'pop',d:.05,h:10,p:3,ok:`The whole place joins in. {B} can hear it backstage.`,no:`The chant fizzles.`},
 {t:`Promise that next time {B} won't be able to run`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`A match is made — and {B} can't back out.`,no:`{B} is already gone.`},
 {t:`Turn to the camera: "Same time next week."`,s:'mic',d:.05,h:9,p:2,ok:`A promise and a warning.`,no:`It comes off a little flat.`}],
crowd:[
 {al:'h',hk:'live',t:`Tell the crowd to shut up`,s:'mic',d:.1,h:11,p:2,ok:`They get louder. That's the point.`,no:`They don't stop, and {A} looks rattled.`},
 {al:'h',hk:'live',t:`Insult the city to win the heat back`,s:'mic',d:.05,h:12,p:2,ok:`Instant, unanimous boos. Mission accomplished.`,no:`The insult misses — wrong city.`},
 {al:'f',hk:'live',t:`Win the crowd back with one line`,s:'mic',d:.15,h:9,p:4,ok:`One line, and the building flips back to {A}.`,no:`The line doesn't land. {B} has them for now.`},
 {t:`Ignore the noise and talk straight to {B}`,s:'mic',d:.1,h:11,p:2,ok:`Focused and intense. The noise fades.`,no:`Nobody can hear a word.`},
 {al:'f',hk:'live',t:`Remind them who was here first`,s:'pop',d:.1,h:8,p:3,ok:`The cheers swing back to {A}.`,no:`The crowd is split down the middle.`},
 {t:`Wait for the noise to die down, then strike`,s:'mic',d:.1,h:10,p:2,ok:`Patient. When {A} finally speaks, every word lands.`,no:`The noise never dies down.`}],
rattled:[
 {t:`Keep pushing {B}'s buttons`,s:'mic',d:.1,h:13,p:2,ok:`{B} is coming apart on live TV.`,no:`{B} pulls it together. The moment passes.`},
 {t:`Smile — the plan is working`,s:'luck',d:.05,h:10,p:2,ok:`That smile makes {B} even angrier.`,no:`{B} catches the smile and calms right down.`},
 {t:`Step back and let {B} embarrass themselves`,s:'pop',d:.05,h:9,p:2,ok:`{B} rants at nobody. {A} barely had to do anything.`,no:`{B} stops before it gets bad.`},
 {al:'f',t:`Tell {B} to calm down before they get hurt`,s:'mic',d:.05,h:9,p:3,ok:`Cool and in control. The fans love it.`,no:`It just makes {B} angrier — in a focused way.`},
 {al:'h',t:`Poke {B} in the chest until they snap`,s:'luck',d:.1,h:14,p:1,ok:`{B} swings wildly — and gets themselves in trouble.`,no:`{B} grabs the finger. Uh oh.`},
 {t:`Make the match now, while {B} is too angry to think`,s:'mic',d:.1,h:11,p:2,ch:1,ok:`{B} agrees to everything without thinking.`,no:`{B} storms off before agreeing to anything.`}],
defy:[
 {al:'h',t:`"Fine. Then there's no deal."`,s:'mic',d:.05,h:11,p:2,ok:`{A} turns their back. {B} is left with nothing.`,no:`{B} calls the bluff. {A} blinks first.`},
 {al:'h',t:`Have security make {B} do it`,s:'luck',d:.1,h:13,p:1,ok:`Two guards force {B} down. Humiliating.`,no:`{B} fights off security. Chaos.`},
 {t:`Respect the fire — then double the stakes`,s:'mic',d:.1,h:10,p:2,ch:1,ok:`{B} accepts. This is going to be big.`,no:`{B} won't take the bait.`},
 {al:'f',t:`Tell {B} they've got guts — and they'll need them`,s:'mic',d:.05,h:8,p:3,ok:`Fiery and respectful. The crowd cheers.`,no:`It sounds like a compliment more than a warning.`},
 {t:`Stand there and wait for {B} to crack`,s:'pop',d:.1,h:10,p:1,ok:`The stare-off goes on forever. {B} looks away first.`,no:`{B} doesn't crack. {A} does.`},
 {al:'h',t:`Slap {B} for the disrespect`,s:'luck',d:.05,h:14,p:1,ok:`The sound echoes around the building.`,no:`{B} catches the wrist and stares {A} down.`},
 {al:'f',t:`Smile: "Good. I was hoping you'd say that."`,s:'mic',d:.05,h:9,p:3,ok:`The crowd loves a fight. Now they've got one.`,no:`It comes out a little smug.`},
 {t:`Push harder: "Then we do this the hard way"`,s:'mic',d:.1,h:11,p:2,ok:`Neither one gives an inch. The tension is unbearable.`,no:`{B} just stares. {A} blinks first.`}],
stumble:[
 {t:`Pounce: "Take your time. I'll wait."`,s:'mic',d:.05,h:10,p:3,ok:`The crowd laughs at {B}. Brutal.`,no:`{B} recovers just enough.`},
 {al:'h',t:`Hand {B} some cue cards`,s:'luck',d:.05,h:11,p:2,ok:`{A} produces actual cue cards. The boos are mixed with laughter.`,no:`{B} rips them up. Weirdly effective.`},
 {al:'f',t:`Let it go — the crowd already saw it`,s:'pop',d:0,h:6,p:2,ok:`Gracious. The crowd appreciates it.`,no:`{B} takes the reprieve and runs with it.`},
 {t:`Finish the sentence for them`,s:'mic',d:.1,h:12,p:2,ok:`Perfect timing. {B} is speechless — again.`,no:`{A} finishes it wrong. Both look silly.`},
 {al:'h',t:`Mock {B}'s stammering word for word`,s:'mic',d:.1,h:13,p:2,ok:`Mean-spirited and very effective.`,no:`It's too cruel. Even heel fans wince.`},
 {t:`Tell {B} to stick to wrestling`,s:'mic',d:.05,h:9,p:2,ok:`Fair point, delivered with a grin.`,no:`{B} shrugs. "Fine by me."`}]};

/* ---------- {B}'s responses ----------
   i: which of {A}'s calls it answers (space-separated, or '*'). V = insult brag promise mind. */
const V='insult brag promise mind',VC=V+' challenge',VP=V+' power';
const RT=[
/* — mock: {B} throws the insult right back — */
{m:'mock',i:V,vs:'h',t:`{B} smirks and leans into the mic. "That's cute. Did the fans write that one for you?"`},
{m:'mock',i:V,vs:'h',t:`{B} laughs. "You've been practicing that in the mirror all week, haven't you?"`},
{m:'mock',i:'insult promise',vs:'h',mic:'hi',t:`{B} doesn't even blink. "I've been called worse by better — and I beat all of them too."`},
{m:'mock',i:'insult',vs:'h',t:`{B} gasps in mock horror, then grins. "Oh no. Anyway."`},
{m:'mock',i:V,vs:'h',al:'f',t:`{B} rolls their eyes. "The hero speaks. How does it feel being everybody's second favorite?"`},
{m:'mock',i:V,vs:'f',al:'h',t:`{B} grabs a mic. "You talk a lot for somebody who hasn't won anything that matters in a long time."`},
{m:'mock',i:'insult',vs:'f',t:`{B} shakes their head. "Every week, the same tired insults. Get some new material."`},
{m:'mock',i:'insult brag',vs:'f',mic:'hi',t:`{B} smiles. "I'd have a battle of wits with you, but I don't fight people who show up unarmed."`},
{m:'mock',i:V,vs:'f',t:`{B} laughs it off. "That's it? My little cousin says meaner things to me at Thanksgiving."`},
{m:'mock',i:V,vs:'h',ok:0,t:`{B} slow claps. "Wow. That fell flatter than your last pay-per-view."`},
{m:'mock',i:V,vs:'f',ok:0,t:`{B} grins. "You might want to try that one again. Nobody laughed."`},
{m:'mock',i:'challenge',vs:'h',ok:0,t:`{B} laughs at the fumbled challenge. "Try again when you can finish a sentence."`},
{m:'mock',i:'insult brag',vs:'h',al:'h',t:`{B} smiles like a snake. "Takes one to know one. Difference is, I'm better at it."`},
{m:'mock',i:'power',vs:'h',al:'h',t:`{B} pretends to think it over. "Partners? Sure. Right up until I stab you in the back."`},
{m:'mock',i:'shake',vs:'h',t:`{B} slaps the hand away. "Respect? Keep it. I'm here to win."`},
{m:'mock',i:'promise',vs:'h',t:`{B} laughs. "Promises, promises. You've been saying that for weeks."`},
{m:'mock',i:'brag',vs:'h',mic:'hi',t:`{B} slow claps. "Beautiful speech. Shame nobody believes a word of it."`},
{m:'mock',i:V,vs:'h',al:'f',hk:'live',t:`{B} points at the front row. "Look at your fans. Easily the worst fans in the world."`},
{m:'mock',i:'rough physical',vs:'h',ok:0,mic:'*',t:`{B} rolls out of the way and laughs from the floor. "Too slow!"`},
{m:'mock',i:V,vs:'f',ok:0,t:`{B} lets the silence hang for a second. "You done? Because that was rough to watch."`},
{m:'mock',i:'mind',vs:'h',t:`{B} stares right back and starts laughing. "Is this supposed to scare me? I've seen scarier things in catering."`},
{m:'mock',i:'power',vs:'f',t:`{B} looks at the demand and laughs out loud. "You can't be serious."`},
/* — flip: {B} turns {A}'s words around — */
{m:'flip',i:V,mic:'hi',t:`{B} smiles. "Everything you just said about me? That's what they say about you the second you leave the room."`},
{m:'flip',i:'insult',vs:'h',t:`{B} shrugs. "Call me whatever you want. I'm the one they'll be talking about tomorrow."`},
{m:'flip',i:'insult promise',vs:'f',t:`{B} steps closer. "You keep telling everybody what I am. Funny how you never talk about what you've done."`},
{m:'flip',i:'mind',vs:'f',t:`{B} breaks the silence. "Staring at me won't win you a match. Trust me — people have tried."`},
{m:'flip',i:'promise',t:`{B} laughs. "You keep promising. I keep delivering. That's the difference between us."`},
{m:'flip',i:'power',vs:'f',t:`{B} folds their arms. "You need a title, a lawyer and a security team to feel big. I just need a match."`},
{m:'flip',i:'brag',t:`{B} smirks. "The greatest? You're not even the greatest in this ring."`},
{m:'flip',i:'brag',vs:'f',t:`{B} isn't impressed. "Great people don't need to tell you they're great."`},
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
{m:'brag',i:VC,vs:'h',at:1,t:`{B} points at the {T} title. "Enjoy it while it lasts. That belt's just been keeping my spot warm."`},
{m:'brag',i:VC,under:1,t:`{B} isn't backing down. "Everybody counts me out. Ask the last few people who did how that went."`},
{m:'brag',i:V,vs:'h',hk:'live',big:1,t:`{B} soaks in the boos and the cheers. "Love me or hate me, you can't stop watching me."`},
{m:'brag',i:'shake',vs:'h',big:1,t:`{B} looks at the hand, then at the crowd. "Of course you respect me. Everybody does. That's not the same as being ready for me."`},
/* — dismiss: {B} brushes {A} off — */
{m:'dismiss',i:VP,vs:'h',t:`{B} checks their watch. "Are we done? I've got somewhere more important to be. Anywhere, actually."`},
{m:'dismiss',i:VC,vs:'h',big:1,t:`{B} waves a hand. "Come back when people know your name."`},
{m:'dismiss',i:VC,vs:'h',bt:1,t:`{B} doesn't even look up from the {BT} title. "Take a number. There's a line."`},
{m:'dismiss',i:'insult mind promise',vs:'f',mic:'*',t:`{B} doesn't take the bait. "Say what you want. My wrestling does my talking."`},
{m:'dismiss',i:V,vs:'h',al:'f',t:`{B} laughs. "The fans' little hero. Run along — grown-ups are talking."`},
{m:'dismiss',i:V,vs:'h',hk:'interview',t:`{B} turns to the interviewer. "Can we get somebody interesting in that chair next time?"`},
{m:'dismiss',i:VP,vs:'f',hk:'interview',t:`{B} leans back in their chair. "I came here to talk about my match, not listen to this."`},
{m:'dismiss',i:'mind',ok:0,t:`{B} breaks into a grin. "Was that supposed to rattle me?"`},
{m:'dismiss',i:'shake',vs:'h',hk:'contract',t:`{B} leaves the hand hanging, signs with a flourish and slides the pen back.`},
{m:'dismiss',i:'insult power',vs:'f',hk:'contract',t:`{B} signs without reading a word. "Doesn't matter what's on the page. I'm still beating you."`},
{m:'dismiss',i:VP,vs:'h',hk:'live',t:`{B} plays to the hard camera. "Folks at home, this is when you go get a snack."`},
{m:'dismiss',i:VC,vs:'f',ppv:1,hk:'live',t:`{B} points to the {PPV} sign hanging over the stage. "Save it. Everything gets settled at {PPV}."`},
{m:'dismiss',i:'shake',mic:'*',vs:'h',t:`{B} stares at the offered hand, then walks right past it.`},
{m:'dismiss',i:V,mic:'lo',t:`{B} grabs the mic, says "Nope," and drops it.`},
/* — personal: {B} goes low — */
{m:'personal',i:V,vs:'h',hot:1,t:`{B} lowers their voice. "Remember who was there for you when nobody else was? Neither do I. Because it was nobody."`},
{m:'personal',i:V,vs:'h',t:`{B} smiles coldly. "How's the family? Do they still watch, or did they give up on you too?"`},
{m:'personal',i:V,vs:'h',mic:'hi',t:`{B} gets quiet. "Every time you look in the mirror, you see someone who almost made it. I know it. You know it."`},
{m:'personal',i:V,vs:'f',al:'h',hot:1,t:`{B} snaps. "You want personal? You've burned everyone who ever trusted you. I'm just the one who's going to make you pay for it."`},
{m:'personal',i:V,vs:'h',ok:0,t:`{B} pounces. "You can't even get through a promo. Imagine how the match is going to go."`},
{m:'personal',i:'respect shake',vs:'h',hk:'contract',t:`{B} signs, slides the pen across and whispers something that makes {A}'s jaw tighten.`},
{m:'personal',i:'insult',vs:'f',al:'f',t:`{B} looks genuinely hurt. "I thought we had respect for each other. Guess I was wrong about you."`,ch:[
 {t:`Apologize — it's business, not personal`,s:'mic',d:.05,h:6,p:3,ok:`{B} nods. The respect is back, and so is the rivalry.`,no:`The apology comes out half-hearted.`},
 {t:`Double down: "Respect is earned in the ring"`,s:'mic',d:.1,h:11,p:2,ok:`Now there's real fire between them.`,no:`It just sounds petty.`},
 {t:`Say nothing and let it sit`,s:'luck',d:0,h:8,p:1,ok:`The tension is thick. Nobody knows where this goes.`,no:`It reads as cold.`}]},
{m:'personal',i:V,vs:'f',al:'h',t:`{B} steps up, voice shaking. "You don't get to talk about me. Not after what you did."`},
/* — threat: {B} promises violence — */
{m:'threat',i:VP,vs:'f',al:'h',t:`{B} steps nose to nose. "Keep running your mouth. Next time I see you, there won't be a referee."`},
{m:'threat',i:V+' rough',vs:'f',t:`{B} cracks their neck. "You picked the wrong person to make an example of."`},
{m:'threat',i:V+' rough',vs:'f',hot:1,t:`{B} glares. "I'm done talking. The next thing you hear from me won't be words."`},
{m:'threat',i:VP,vs:'h',t:`{B} smiles. "Careful. Accidents happen around here. Ladders fall. Chairs swing."`},
{m:'threat',i:VP,vs:'h',at:1,t:`{B} circles {A} slowly. "That belt looks heavy. Maybe I should take it off your hands."`},
{m:'threat',i:VC,vs:'f',ppv:1,t:`{B} points right at {A}. "{PPV}. You and me. And I am going to hurt you."`},
{m:'threat',i:VC,vs:'h',ppv:1,t:`{B} grins. "Enjoy the next few weeks. At {PPV}, I end you."`},
{m:'threat',i:V+' rough',mic:'*',t:`{B} just points at {A} and slowly drags a thumb across their throat.`},
{m:'threat',i:VC,vs:'f',ppv:1,hot:1,t:`{B}'s voice cracks with anger. "I've circled {PPV} on my calendar. I'm counting the days."`},
{m:'threat',i:VC,vs:'h',ppv:1,under:1,t:`{B} snarls. "Everybody acts like you're the star. At {PPV}, I'm taking that from you."`},
{m:'threat',i:'mind',vs:'f',hk:'interview',t:`{B} leans across the table. "You can analyze me all you want. You can't stop me."`},
{m:'threat',i:'shake',vs:'h',mic:'*',t:`{B} takes the hand — then won't let go, squeezing until {A} winces.`},
{m:'threat',i:'rough',ok:1,vs:'f',t:`{B} rubs their jaw and smiles. "That's all you've got? Now you've done it."`},
{m:'threat',i:'rough',ok:1,vs:'f',hk:'live',mic:'*',t:`{B} storms right back in. The crowd wants a fight — and so does {B}.`},
{m:'threat',i:'rough',ok:1,vs:'h',t:`{B} is stunned, then furious. "You'll pay for that. In front of everyone."`},
{m:'threat',i:'rough',ok:1,mic:'*',t:`{B} stumbles back, touches their lip and comes up seeing red.`},
{m:'threat',i:'physical',ok:1,vs:'f',hot:1,mic:'*',t:`{B} pulls themselves up on the ropes, glaring through the pain. They're not done.`},
{m:'threat',i:'power',vs:'f',hot:1,t:`{B} gets right in {A}'s face. "Keep hiding behind your rules. They won't save you when the bell rings."`},
/* — accept: {B} takes the fight — */
{m:'accept',i:'challenge',vs:'f',t:`{B} doesn't hesitate. "You want me? You've got me. Name the day."`},
{m:'accept',i:'challenge',vs:'f',hot:1,t:`{B} pulls off their jacket. "I've been waiting for you to ask."`},
{m:'accept',i:'challenge',vs:'h',big:1,t:`{B} laughs, then nods. "Fine. I'll squeeze you in. It won't take long."`},
{m:'accept',i:'challenge',vs:'h',bt:1,t:`{B} pats the {BT} title. "A title shot? Earn it… actually, fine. I could use an easy defense."`},
{m:'accept',i:'challenge',vs:'f',mic:'*',t:`{B} takes the mic. "Yes." They drop it and start toward the ring.`},
{m:'accept',i:'challenge',vs:'f',al:'f',t:`{B} grins. "Me and you? I've wanted this one my whole career."`},
{m:'accept',i:'challenge',vs:'h',under:1,t:`{B} jumps at it. "You just handed me the biggest opportunity of my life. Thanks."`},
{m:'accept',i:'challenge',vs:'f',hk:'contract',t:`{B} reads the new terms and grabs the pen. "Make it worse. I'll still sign."`},
{m:'accept',i:'challenge',vs:'h',hk:'contract',t:`{B} reads the new stipulation and grins. "Fine. Just remember you asked for this."`},
{m:'accept',i:'challenge',vs:'f',bt:1,t:`{B} lifts the {BT} title. "You want this? Then let's do it. Champion's honor."`},
{m:'accept',i:'challenge',mic:'lo',t:`{B} nods, a little too eagerly. "Uh — yeah. You and me. Sure."`},
{m:'accept',i:'insult mind promise challenge',vs:'f',mic:'*',t:`{B} shrugs. "I don't do speeches. See you in the ring."`},
{m:'accept',i:'promise',vs:'f',t:`{B} steps up. "You keep promising me what's coming. Here I am. Bring it."`},
{m:'accept',i:'challenge',vs:'h',hot:1,t:`{B} stops smirking. "You want it that bad? Fine. But when I'm done with you, don't come crying."`},
/* — dodge: a heel {B} weasels out — */
{m:'dodge',i:'challenge',vs:'h',t:`{B} backs away. "A match? Tonight? Oh, I'd love to, but my doctor says no."`},
{m:'dodge',i:'challenge',vs:'h',t:`{B} laughs. "I'll face you when I decide you've earned it. Not one second before."`},
{m:'dodge',i:'challenge',vs:'h',bt:1,t:`{B} clutches the {BT} title. "You don't make the matches. Get in line like everybody else."`},
{m:'dodge',i:'challenge',vs:'h',hk:'live',t:`{B} is already halfway up the ramp. "Maybe next week!"`},
{m:'dodge',i:'power',vs:'h',hk:'contract',t:`{B} pushes the contract away. "I don't sign anything without my lawyer. And my lawyer is on vacation."`},
{m:'dodge',i:'challenge',vs:'h',mic:'lo',t:`{B} mumbles something about a bad back and backs toward the ropes.`},
{m:'dodge',i:'challenge',vs:'h',mic:'hi',t:`{B} wags a finger. "You don't get to decide when. I do. That's what being the best means."`},
/* — respect: {B} returns it — */
{m:'respect',i:'shake',vs:'f',t:`{B} takes the hand. "Best of luck. You're going to need it."`},
{m:'respect',i:'respect shake',vs:'f',al:'f',t:`{B} nods. "You're the real deal. Doesn't mean I'm letting you win."`},
{m:'respect',i:'shake',vs:'f',hot:1,t:`{B} pauses, then shakes. "After everything? Respect. Now let's tear the house down."`},
{m:'respect',i:'respect shake',vs:'f',under:1,t:`{B} smiles. "That means a lot coming from you. Now I've got to prove I belong."`},
{m:'respect',i:'respect mind',vs:'f',t:`{B} chuckles. "You've done your homework. So have I."`},
{m:'respect',i:'challenge',vs:'f',al:'f',t:`{B} steps forward, smiling. "Winner takes the spotlight? Deal. May the best one win."`},
{m:'respect',i:'shake',mic:'lo',vs:'f',t:`{B} shakes the hand, nods once and says nothing.`},
{m:'respect',i:'brag',vs:'f',al:'f',t:`{B} laughs. "Okay, you're good. I'm better. Let's find out."`},
{m:'respect',i:'respect shake',vs:'f',bt:1,t:`{B} offers the {BT} title to hold for a moment, then takes it back. "When you earn it, it's yours. Not before."`},
{m:'personal',i:'snub',vs:'f',t:`{B} looks at the hand, then at {A}. "After what you did? Not a chance."`},
{m:'mock',i:'snub',vs:'h',t:`{B} laughs at the outstretched hand. "You actually thought I'd shake that?"`},
{m:'dismiss',i:'snub',mic:'*',t:`{B} stands and walks off without a word, leaving the hand hanging.`},
{m:'threat',i:'snub',vs:'h',t:`{B} smacks the hand away. "Save the sportsmanship. You'll need help getting up."`},
{m:'mock',i:'snub',vs:'h',mic:'lo',t:`{B} shakes their head and sneers.`},
{m:'personal',i:'snub',vs:'f',mic:'lo',t:`{B} just shakes their head, jaw clenched.`},
{m:'mock',i:'respect',vs:'h',t:`{B} laughs. "Respect? That's adorable. I don't respect anybody I'm about to beat."`},
{m:'dismiss',i:'respect',vs:'h',t:`{B} rolls their eyes. "Save the speech for after the match. You'll need something to say when you lose."`},
{m:'brag',i:'respect',vs:'h',t:`{B} nods smugly. "Of course I'm the best you've faced. Glad you finally noticed."`},
{m:'dismiss',i:'respect',vs:'h',mic:'lo',t:`{B} shrugs. "Whatever."`},
{m:'respect',i:'respect',vs:'f',mic:'lo',t:`{B} nods. "Yeah. You too."`},
{m:'respect',i:'respect',vs:'f',al:'f',mic:'*',t:`{B} smiles and taps a fist to their chest.`},
{m:'respect',i:'respect',mic:'*',hk:'contract',vs:'f',t:`{B} signs too, and the two of them share a long look across the table.`},
{m:'dismiss',i:'respect',mic:'*',hk:'contract',vs:'h',t:`{B} signs without looking up and tosses the pen over their shoulder.`},
{m:'respect',i:'respect',mic:'lo',vs:'f',al:'h',t:`{B} squints at {A}, unsure what to make of it. "…Okay."`},
{m:'mock',i:'respect',mic:'lo',vs:'h',t:`{B} snorts. "Yeah, right."`},
{m:'respect',i:'respect',mic:'*',vs:'f',hk:'interview',t:`{B} nods slowly, taking it in.`},
{m:'rattled',i:'respect',mic:'lo',vs:'h',hk:'interview',t:`{B} doesn't know what to do with a compliment. They fidget and look away.`},
{m:'personal',i:'snub',vs:'f',hot:1,t:`{B} stares at the hand. "You don't get to play the good guy with me."`},
{m:'threat',i:'snub',vs:'f',t:`{B} ignores the hand and points at {A}. "Shake it after I beat you. If you can still lift it."`},
{m:'dismiss',i:'snub',vs:'f',t:`{B} pushes back from the table. "I didn't come here to make friends."`},
{m:'mock',i:'snub',vs:'h',mic:'hi',t:`{B} pulls out a bottle of hand sanitizer and makes a big show of using it.`},
{m:'dismiss',i:'snub',vs:'f',mic:'lo',t:`{B} looks at the hand and just walks away.`},
{m:'threat',i:'snub',vs:'h',mic:'lo',t:`{B} slaps the hand away and jabs a finger at {A}.`},
/* — laidout: {A}'s attack landed and {B} can't answer — */
{m:'laidout',i:'physical',ok:1,mic:'*',t:`{B} is down and not moving. Referees rush in from the back.`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'contract',t:`{B} is buried in the wreckage of the table. The pen is still in their hand.`},
{m:'laidout',i:'physical',ok:1,mic:'*',t:`{B} lies in a heap as officials surround {A}.`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'live',t:`{B} is laid out in the middle of the ring. The crowd can't believe what they just saw.`},
{m:'laidout',i:'physical',ok:1,mic:'*',hk:'interview',t:`{B} is on the studio floor among the broken chairs. The camera operator backs away.`},
/* — fightback: {A}'s attack missed and {B} made them pay — */
{m:'fightback',i:'physical rough',ok:0,mic:'*',t:`{B} saw it coming. They duck, and {A} eats a big right hand instead.`},
{m:'fightback',i:'physical rough',ok:0,vs:'f',mic:'*',t:`{B} blocks it and fires back. Now {A} is the one reeling.`},
{m:'fightback',i:'physical rough',ok:0,vs:'h',mic:'*',t:`{B} sidesteps and rakes {A}'s eyes. Cheap, but it works.`},
{m:'fightback',i:'physical',ok:0,mic:'*',hk:'contract',t:`{B} shoves the table back into {A}'s gut before they can lift it.`},
{m:'fightback',i:'physical',ok:0,vs:'h',mic:'*',hk:'contract',t:`{B} grabs the chair first and holds it up with a grin.`},
/* — retreat: a heel {B} gets out of there — */
{m:'retreat',i:'physical rough',ok:1,vs:'h',mic:'*',t:`{B} scrambles out of the ring holding their jaw, backing up the ramp and shouting threats.`},
{m:'retreat',i:'physical',ok:1,vs:'h',mic:'*',t:`{B} crawls under the bottom rope, screaming for a referee.`},
{m:'retreat',i:'rough',ok:1,vs:'h',mic:'*',t:`{B} backs into the corner, wide-eyed, and slides out of the ring.`},
{m:'retreat',i:'challenge',vs:'h',mic:'*',hk:'live',t:`{B} doesn't answer — they just grab their things and hurry up the ramp.`},
/* — crowd: {B} uses the crowd — */
{m:'crowd',i:V,vs:'f',al:'h',hk:'live',t:`{B} turns to the fans. "You heard that? Is that who you want running this place?" The boos pour down on {A}.`},
{m:'crowd',i:VC,vs:'f',hk:'live',t:`{B} gets the crowd chanting their name until {A} can't be heard.`},
{m:'crowd',i:V,vs:'f',hk:'live',big:1,t:`{B} doesn't say a word. They just raise a fist, and the building does the talking.`},
{m:'crowd',i:V,vs:'h',al:'f',hk:'live',t:`{B} cups an ear to the crowd. "Listen to them. They cheer you because they feel sorry for you."`},
/* — rattled: {B} loses their cool — */
{m:'rattled',i:'mind',ok:1,vs:'f',t:`{B} finally snaps. "Stop looking at me like that!" They're losing it.`},
{m:'rattled',i:'mind insult',ok:1,vs:'h',mic:'*',t:`{B} sputters, red-faced, and throws their mic at the ring post.`},
{m:'rattled',i:'mind',ok:1,mic:'*',t:`{B} starts to answer, then stops. For once, they've got nothing.`},
{m:'rattled',i:'insult promise',ok:1,vs:'h',hot:1,t:`{B} is yelling over the crowd, veins popping. It's gotten to them.`},
{m:'rattled',i:'mind',vs:'h',hk:'interview',t:`{B} snatches {A}'s notes off the table and tears them up. "Next question!"`},
{m:'rattled',i:'rough',ok:1,vs:'h',t:`{B} wipes their face, shaking with rage. "Security! Somebody arrest this lunatic!"`},
{m:'rattled',i:V,mic:'lo',vs:'h',t:`{B} turns bright red and points at {A} like they want to say something. Nothing comes out.`},
/* — defy: {B} won't bow to a power play — */
{m:'defy',i:'power',vs:'f',t:`{B} doesn't move. "I don't bow. Not to you. Not to anybody."`},
{m:'defy',i:'power',vs:'f',hk:'contract',t:`{B} slides the contract back across the table. "Your terms? No. My terms, or nothing."`},
{m:'defy',i:'power brag',vs:'f',at:1,t:`{B} stares at the {T} title. "You think that belt makes you better than me? It just makes you a target."`},
{m:'defy',i:'power',vs:'h',t:`{B} laughs. "You think I take orders? I give them."`},
{m:'defy',i:'power',vs:'f',hk:'contract',t:`{B} tears the fine print right off the bottom of the contract. "Nice try."`},
{m:'defy',i:'power',mic:'*',t:`{B} folds their arms. "Make me."`},
{m:'defy',i:'power',vs:'f',mic:'hi',t:`{B} steps up. "You can make me wait. You can make me jump through hoops. You can't make me afraid of you."`},
/* — stumble: a weak talker fumbles it — */
{m:'stumble',i:VP+' challenge',mic:'lo',t:`{B} grabs the mic, opens their mouth… and forgets what they were going to say.`},
{m:'stumble',i:VP,mic:'lo',t:`{B} snatches the mic. "Yeah? Well… you're worse!" Somebody in the crowd laughs.`},
{m:'stumble',i:VP+' challenge',mic:'lo',vs:'h',t:`{B} tries a comeback but trips over the words. "You… you… shut up!"`},
{m:'stumble',i:VP+' challenge',mic:'lo',vs:'f',t:`{B} tries to fire back, but it comes out mumbled. The crowd waits politely.`},
/* — more variety (v228 pass 2) — */
{m:'respect',i:'respect shake',vs:'f',al:'h',t:`{B} narrows their eyes. "Respect? From you? What's the catch?"`},
{m:'respect',i:'respect shake',vs:'f',al:'h',hk:'contract',t:`{B} signs, but never takes their eyes off {A}. "I'll believe it when I see it."`},
{m:'respect',i:'shake',vs:'f',mic:'lo',t:`{B} shakes it firmly. "Good luck."`},
{m:'respect',i:'shake',vs:'f',mic:'*',hot:1,t:`{B} hesitates, then takes the hand. A nod, nothing more.`},
{m:'mock',i:'shake',vs:'h',mic:'lo',t:`{B} grunts and swats the hand away.`},
{m:'respect',i:'shake',vs:'h',t:`{B} smiles a little too wide. "Of course. Respect." Nobody believes it.`,ch:[
 {t:`Shake it — but keep one eye on {B}`,s:'pop',d:.05,h:7,p:2,ok:`No cheap shot this time. {A} still doesn't relax.`,no:`{B} yanks {A} into a forearm. Of course.`},
 {t:`Pull the hand back: "I know that smile"`,s:'mic',d:.05,h:9,p:2,ok:`{B}'s grin freezes. Busted.`,no:`{B} shrugs. "Your loss."`},
 {al:'h',t:`Beat {B} to it — cheap-shot them first`,s:'luck',d:.1,h:14,p:1,ok:`It takes a snake to know one. {B} never saw it coming.`,no:`{B} was waiting for exactly that.`}]},
{m:'respect',i:'respect',vs:'f',hk:'interview',t:`{B} returns the compliment. "Same to you. That's why I've studied every match you've ever had."`},
{m:'brag',i:'respect',vs:'h',hk:'interview',t:`{B} shrugs. "Toughest? You haven't been in there with me yet."`},
{m:'fightback',i:'physical',ok:0,vs:'f',mic:'*',nhk:'interview',t:`{B} catches {A} coming in and drops them with a spinebuster. The tables have turned.`},
{m:'fightback',i:'physical',ok:0,vs:'f',mic:'*',hk:'interview',t:`{B} shoves the table right back into {A}. Chairs go flying.`},
{m:'fightback',i:'physical rough',ok:0,vs:'f',t:`{B} reverses it and stands over {A}. "Is that what you came here for?"`},
{m:'fightback',i:'physical rough',ok:0,vs:'f',mic:'*',hk:'live',t:`{B} counters, and the crowd explodes as {A} rolls to the floor.`},
{m:'flip',i:V,vs:'f',t:`{B} steps forward. "Funny. You didn't talk like that the last time we were in a ring together."`},
{m:'mock',i:V,vs:'f',al:'h',t:`{B} shakes their head. "You know your problem? You actually believe all this."`},
{m:'dismiss',i:V,vs:'f',t:`{B} smiles calmly. "Keep talking. I'll be the one smiling at the end."`},
{m:'crowd',i:'insult promise',vs:'f',hk:'live',t:`{B} turns to the crowd. "Does anybody here believe that?" The answer is a very loud "NO!"`},
{m:'respect',i:V,vs:'f',al:'f',t:`{B} laughs. "Come on. You and I are better than this. Let's settle it the right way."`},
{m:'accept',i:'promise',vs:'f',t:`{B} stares right back. "You want to take something from me? Come and try."`},
{m:'defy',i:'mind',vs:'f',mic:'*',hk:'live',t:`{B} meets the stare and doesn't blink. Ten seconds. Twenty. The crowd is roaring.`},
{m:'dismiss',i:V,vs:'h',t:`{B} examines their nails. "Sorry, were you saying something? I tuned out."`},
{m:'brag',i:V,vs:'h',mic:'hi',t:`{B} smiles thinly. "You're not my rival. You're my homework. And I always finish my homework."`},
{m:'flip',i:V,vs:'h',t:`{B} laughs. "That's rich, coming from you."`},
{m:'dismiss',i:'insult promise',vs:'h',al:'f',t:`{B} fakes a huge yawn. "Wake me when the hero's done."`},
{m:'brag',i:'promise',vs:'h',t:`{B} leans on the ropes. "What's coming to me is another win. Same as always."`},
{m:'mock',i:'mind',vs:'h',mic:'*',t:`{B} pretends to be terrified, then bursts out laughing.`},
{m:'dismiss',i:'mind',vs:'h',hk:'interview',t:`{B} cuts {A} off mid-sentence. "Let me stop you there, because nobody cares."`},
{m:'accept',i:'power',vs:'f',t:`{B} grits their teeth. "Fine. I'll play your little game. But when this is over, I'm coming for you."`},
{m:'flip',i:'power',vs:'h',mic:'*',hk:'contract',t:`{B} reads the clause, smirks, and scribbles in one of their own.`},
{m:'dismiss',i:'power',vs:'h',t:`{B} laughs. "Cute. You think this is your show?"`},
{m:'defy',i:'power',mic:'lo',t:`{B} shakes their head. "No."`},
{m:'accept',i:'challenge',vs:'f',mic:'hi',t:`{B} smiles. "I was about to ask you the same thing. You saved me the trouble."`},
{m:'accept',i:'challenge',vs:'h',t:`{B} thinks it over, then smiles. "Okay. But we do it my way."`},
{m:'accept',i:'challenge',vs:'h',at:1,t:`{B} grins. "A shot at the {T} title? Well, since you asked so nicely."`},
{m:'accept',i:'challenge',vs:'f',at:1,t:`{B} is stunned for a second. "A shot at the {T} title? I won't waste it."`},
{m:'threat',i:V,mic:'lo',vs:'f',t:`{B} grabs the mic. "Whatever. I'm gonna beat you." That's all they've got.`},
{m:'dismiss',i:V,mic:'lo',vs:'h',t:`{B} sneers. "Shut up." The crowd boos the effort.`},
{m:'accept',i:V+' challenge',mic:'lo',vs:'f',t:`{B} shrugs and points to the ring.`},
{m:'threat',i:'rough',ok:1,vs:'f',mic:'*',hk:'live',t:`{B} shoves {A} right back. Referees pour in to separate them.`},
{m:'rattled',i:'rough',ok:1,vs:'h',al:'f',t:`{B} holds their face, stunned. "You can't do that! I'll sue!"`},
{m:'mock',i:'insult brag promise',vs:'h',hk:'contract',t:`{B} signs with a flourish. "There's my autograph. Frame it — it'll be worth more than you."`},
{m:'threat',i:V,vs:'f',mic:'*',hk:'contract',t:`{B} signs, slams the pen down and stands. Talk is over.`},
{m:'dismiss',i:'mind',vs:'h',mic:'*',hk:'contract',t:`{B} pretends to read the contract upside down, taking their sweet time.`},
{m:'threat',i:V,at:1,vs:'f',t:`{B} points at the {T} title. "Say whatever you want. I'm walking out with that."`},
{m:'brag',i:V,at:1,vs:'h',t:`{B} eyes the {T} title. "Shiny. It'll look better on me."`},
{m:'threat',i:'power',at:1,vs:'f',t:`{B} doesn't look at the belt — only at {A}. "Keep it close. You won't have it much longer."`},
{m:'mock',i:'power',at:1,vs:'h',t:`{B} starts to bow, stops halfway and grins. "Oh — you were serious?"`},
{m:'personal',i:V,hot:1,vs:'f',t:`{B}'s hands are shaking. "After everything you've done, you've still got the nerve to stand there?"`},
{m:'threat',i:V,hot:1,vs:'h',t:`{B} laughs, but their eyes are cold. "You really want to keep doing this? Fine. I can do this all year."`},
{m:'dismiss',i:V,big:1,vs:'f',t:`{B} smiles. "Nice speech. Now go earn it."`},
{m:'defy',i:V+' power',under:1,vs:'f',t:`{B} won't back down. "Nobody thinks I belong in there with you. That's exactly why I'm going to win."`},
{m:'threat',i:V,under:1,vs:'h',t:`{B} sneers. "Everybody's waiting for me to fail. Stick around. You'll be the one who does."`},
{m:'flip',i:'brag',vs:'h',t:`{B} laughs. "If you were that good, you wouldn't need the speech."`},
{m:'personal',i:'insult',vs:'f',al:'h',mic:'hi',t:`{B} waits for the boos to die down. "You can say anything about me. I know who I am. Do you?"`},
{m:'mock',i:'insult promise',vs:'f',al:'h',hk:'live',t:`{B} cups their ear. "Hear that? That's thousands of people who'd rather listen to me."`},
{m:'stumble',i:VP+' challenge',mic:'lo',t:`{B} starts strong — "Listen here!" — then loses the thread completely.`},
{m:'rattled',i:'insult brag',ok:1,mic:'lo',vs:'f',t:`{B} clenches their fists, too angry to speak.`},
{m:'respect',i:'shake',vs:'f',mic:'lo',t:`{B} takes the hand and gives a thumbs-up. Short and sweet.`},
{m:'respect',i:'shake',vs:'f',al:'f',mic:'*',t:`{B} grips the hand and pulls {A} into a quick, hard hug.`},
{m:'respect',i:'shake',vs:'f',al:'h',mic:'lo',t:`{B} stares at the hand for a long time before shaking it. "Okay."`}
];

/* ---------- the response beat ---------- */
function rtScene(p,ctx,st,ai){if(!rtOn(p,ctx)||!st||!st.lastC)return null;
 const x={i:rtIntent(st.lastC),ok:(st.oks||[]).slice(-1)[0]?1:0,tier:rtTier(ctx.B),heat:heatOf(p.a,p.b)};
 const el=RT.filter(o=>rtFit(o,ctx,x));if(!el.length)return null;
 const e=wpick(el,o=>rtSpec(o)*(seenP(o.t)?.12:1));
 const own=(e.ch||[]).map(o=>Object.assign({key:1},o));const pool=own.concat(FU[e.m]||[]).filter(o=>rtExtra(o,ctx,x));
 let ch=dealChoices(pool,ctx,3);if(ch.length<2)return null;ch=ch.map(o=>Object.assign({},o,{rt:1,key:0}));
 if(!ai)noteP([e.t,...ch.map(o=>o.t)]);st.rtDone=1;return {text:e.t,ch,rt:1,m:e.m}}

/* ---------- the mic drop ---------- */
function mdOk(p,ctx,st,sc){if(!p||!ctx||!ctx.A||!st||!sc||!sc.ch)return false;if(['turn','vignette'].includes(p.type))return false;
 if(sc.x||sc.myst||sc.cd||sc.hj||/\{X\}/.test(sc.text||'')||sc.ch.some(c=>c.drop))return false;
 const oks=st.oks||[];const need=st.rtDone?2:1;if(oks.length<need||!oks.every(Boolean))return false;
 if(!st.rtDone&&ctx.A.mic+(hasT(ctx.A,'mouth')?10:0)<68)return false;
 return Math.random()<(st.rtDone?.6:.45)}
function mdChoice(ctx){const K=ctx.K||new Set();
 if(K.has('studio'))return {t:`🎤 End it on that line and walk out`,drop:1,always:1,s:'mic',tip:'Locks in a strong finish · ends the segment',ok:pick([`{A} stands, buttons their jacket and leaves. Nobody in the studio moves.`,`{A} pulls off the microphone, sets it on the table and walks out. Nothing left to say.`])};
 if(K.has('back')||K.has('lot'))return {t:`🎤 Walk off on that line`,drop:1,always:1,s:'mic',tip:'Locks in a strong finish · ends the segment',ok:pick([`{A} turns and walks away. The camera holds on the empty hallway.`,`{A} leaves it there. The cameraman doesn't know whether to follow.`])};
 return {t:`🎤 Drop the mic and walk off`,drop:1,always:1,s:'mic',tip:'Locks in a strong finish · ends the segment',ok:pick([`{A} lets the mic hit the canvas and walks off. The place erupts.`,`Mic drop. {A} doesn't look back, and the crowd loses it.`,`The mic hits the mat with a thud. {A} has said everything that needed saying.`])}}
function mdAdd(PSx){if(!mdOk(PSx.p,PSx.ctx,PSx.st,PSx.scene))return;PSx.scene.ch=PSx.scene.ch.concat([mdChoice(PSx.ctx)])}
/* the rival drops the mic when the twist looks risky */
function mdAI(p,ctx,st,tw){if(!mdOk(p,ctx,st,tw))return false;const best=aiChoose(tw.ch,ctx);if(chance(best,ctx)>=.7)return false;roll(mdChoice(ctx),ctx,st);return true}

/* ---------- hooks ---------- */
const _roll=roll;
roll=function(c,ctx,st){st.lastC=c;
 if(c.drop){st.drop=true;st.score+=MD_SCORE;st.heat+=2;st.pop+=1;const text=fill(c.ok,ctx);st.log.push(fill(c.t.replace(/^🎤\s*/,''),ctx)+' — '+text);(st.oks=st.oks||[]).push(true);return {success:true,text}}
 /* the response beat is centred: a landed answer is worth more the riskier it was, a miss costs more the safer it was,
    and on average it adds nothing — so the extra beat changes how a promo goes, not how high promos rate */
 if(c.rt){const f=['heat','hx','pop','chem'],s0={};f.forEach(k=>s0[k]=st[k]||0);const sc0=st.score,p=chance(c,ctx);const out=_roll(c,ctx,st);
  st.score=sc0+RT_SC*(out.success?(1-p):-p);f.forEach(k=>{st[k]=s0[k]+((st[k]||0)-s0[k])*RT_W});return out}
 return _roll(c,ctx,st)};
const _pc=promoCtx;
promoCtx=function(p,brand){const c=_pc(p,brand);c.brand=brand;if(c.B){const bt=titlesOf(c.B.id)[0];c.BT=bt?bt.n:'';
  let pv='';try{const pr=pendingPromises().find(x=>key(x.a,x.b)===key(p.a,p.b)&&x.ppv&&x.week>S.week);const np=nextPPVAfter(S.week);pv=pr?pr.ppv:np&&np.w-S.week<=4?np.n:''}catch(e){}c.PPV=pv}
 return c};
const _fill=fill;
fill=function(s,c){return _fill(s,c).replace(/\{BT\}/g,c.BT||'the title').replace(/\{PPV\}/g,c.PPV||'the next pay-per-view').replace(/\{H\}/g,c.H?c.H.name:'')};

/* ---------- look ---------- */
(function(){const c=document.createElement('style');c.textContent=`
#modal .scene.rtq{border-left:3px solid var(--gold);padding-left:12px;font-style:italic}
#modal .choice.mdrop{background:linear-gradient(90deg,rgba(216,180,73,.22),rgba(216,180,73,.04));box-shadow:inset 0 0 0 1px var(--gold)}
`;document.head.appendChild(c)})();

Object.assign(window,{rtScene,rtIntent,mdAdd,mdAI,mdOk,RT_LIB:RT,RT_FU:FU});
})();
