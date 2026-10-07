/* Tony Khan Simulator — scenario pack 2 (v138): another big round of match moments, promo twists and promo options
   so weekly shows repeat less. Same fields and filters as scenarios.js (see the notes at the top of that file).
   Loaded right after scenarios.js and folded into MEV_MORE / TWISTS_MORE / SCENES_MORE before index.html merges them. */
'use strict';
(function(){
const MEV2=[
/* ---------- anywhere, any match ---------- */
{id:'sigcounter',w:2.5,text:"{A} sets up the signature move — but {B} has clearly been studying the tape.",ch:[
 {t:"Counter the counter",s:'ring',d:.15,st:.75,ok:"A reversal of a reversal. The crowd gasps, then explodes.",no:"{B} was a step ahead. {A} eats the mat."},
 {t:"Abandon it and go to plan B",always:1,st:.25,ok:"{A} adapts on the fly. Smart, if not flashy."},
 {t:"Fake the setup, then hit something new",s:'ring',d:.1,st:.5,ok:"{B} bit on the fake. Nobody saw the new move coming.",no:"The new move looks unrehearsed."},
 {al:'h',t:"Rake the eyes and hit it anyway",s:'luck',d:.05,st:.25,heat:10,ok:"Cheating in plain sight. The move lands.",no:"The ref sees the rake and backs {A} off."},
 {al:'f',t:"Smile, nod at {B}, and try it again",s:'pop',d:.1,st:.5,popA:2,ok:"Second time's the charm. The fans love the confidence.",no:"{B} counters it again. Now it's in {A}'s head."}]},
{id:'apron',w:2,text:"{A} and {B} are fighting on the ring apron — the hardest part of the ring.",ch:[
 {t:"Hit a big move right on the apron",iB:.12,s:'ring',d:.15,st:.75,fat:6,heat:8,ok:"The thud echoes around the building. Everyone winces.",no:"{B} blocks it and they both tumble to the floor."},
 {t:"Fight back into the ring",always:1,st:.25,ok:"Cooler heads prevail. Back to the action."},
 {t:"Knock {B} off the apron into the barricade",s:'ring',d:.05,st:.5,heat:6,ok:"{B} crashes into the steel. {A} takes control.",no:"{B} hangs on to the ropes."},
 {al:'h',t:"Tease the apron move until the crowd begs {A} not to",s:'mic',d:.1,st:.5,heat:12,ok:"The crowd screams 'NO!' — and {A} does it anyway.",no:"{B} recovers while {A} is hamming it up."}]},
{id:'limit',w:1.5,text:"The ring announcer calls five minutes left in the time limit.",ch:[
 {t:"Pick up the pace — everything in the tank",s:'ring',d:.15,st:.75,fat:7,ok:"A frantic final stretch. The crowd counts down with them.",no:"They rush it and the moves get sloppy."},
 {t:"Go for a flash pin before time runs out",s:'luck',d:.05,st:.25,ok:"A cradle out of nowhere — and it's over.",no:"Kicked out. The clock keeps ticking."},
 {t:"Time-limit draw",rematch:1,always:1,st:-.25,nc:1,heat:14,ok:"The bell rings with both wrestlers still standing. Nobody's satisfied — they'll want this again."},
 {al:'h',t:"Stall on the outside to run out the clock",s:'mic',d:.05,st:.25,heat:12,ok:"The crowd counts down the seconds in fury.",no:"{B} drags {A} back in with seconds to spare."}]},
{id:'kickone',w:2,text:"{A} hits the finisher clean — and {B} kicks out at ONE!",ch:[
 {t:"Hit it again, harder",s:'ring',d:.1,st:.5,fat:5,ok:"Nobody kicks out of the second one. Three.",no:"{B} kicks out again. {A} can't believe it."},
 {t:"Stare at {B} in disbelief, then go to war",s:'ring',d:.15,st:.75,fat:6,heat:8,ok:"The fight goes to another level. Standing ovation at the end.",no:"The moment drags and the crowd loses the thread."},
 {t:"Lock in a submission instead",always:1,st:.25,ok:"If the pin won't work, the hold will. {B} taps."},
 {al:'h',t:"Lose it and attack the referee",dq:1,loseNo:'dq',s:'luck',d:.05,st:.25,heat:14,ok:"A total meltdown. The crowd loves to hate it.",no:"{A} is disqualified. Every fan in the building cheers."}]},
{id:'doubledown',w:2,text:"{A} and {B} hit each other with simultaneous clotheslines. Both are down. The ref starts counting.",ch:[
 {t:"Both rise at nine — then trade blows",s:'ring',d:.1,st:.75,fat:5,ok:"The crowd cheers every punch on the way up.",no:"It drags. The crowd wanted one of them to get up first."},
 {t:"{A} crawls over for a lazy cover",always:1,st:.25,ok:"Two-count, but {A} has momentum now."},
 {t:"Ten count — double knockout",rematch:1,always:1,st:-.25,nc:1,heat:14,ok:"Neither answers the count. They'll have to settle this another night."},
 {al:'f',t:"The crowd chants {A} up to their feet",s:'pop',d:.05,st:.5,popA:2,ok:"A roar lifts {A} at eight. Goosebumps.",no:"{B} beats {A} to their feet."}]},
{id:'desk',w:2,text:"{B} gets thrown into the commentary desk. The headsets go flying.",ch:[
 {t:"Clear the desk and set {B} up on it",iB:.1,s:'ring',d:.15,st:.75,fat:6,heat:10,ok:"Through the desk! The commentary team runs for cover.",no:"The desk won't break. That's going to hurt {A} more."},
 {t:"Take it back to the ring",always:1,st:.25,ok:"No need for the extra risk. {A} has the upper hand."},
 {t:"Grab a headset and talk to the commentators mid-match",s:'mic',d:.1,st:.25,popA:1,ok:"A great bit of television. Then {A} gets right back to it.",no:"{B} recovers while {A} is chatting."},
 {al:'h',t:"Choke {B} with a headset cord",s:'luck',d:.05,st:.25,heat:12,ok:"Nasty and creative.",no:"The cord snaps. The crowd laughs."}]},
{id:'fan',w:1,text:"A fan hops the barricade and gets as far as the ring apron before security grabs them.",ch:[
 {t:"Ignore it and keep wrestling",always:1,st:0,ok:"Total pros. The match barely skips a beat."},
 {t:"Use the confusion for a quick roll-up",s:'luck',d:.05,st:.25,ok:"While everyone watches security, {A} sneaks the pin.",no:"{B} wasn't distracted at all."},
 {al:'f',t:"Calm the fan down before security takes them",s:'pop',d:.05,st:.25,popA:2,ok:"A kind moment, then right back to work.",no:"{B} uses the moment for a cheap shot."},
 {al:'h',t:"Blame {B} for 'planting' the fan",s:'mic',d:.1,st:.25,heat:8,ok:"Ridiculous — and the crowd boos even louder.",no:"Nobody buys it, not even {A}."}]},
{id:'superplex',w:2,nsty:'pw',text:"{A} and {B} are both standing on the top rope, fighting for position.",ch:[
 {t:"Superplex from the very top",iAn:.25,iB:.1,s:'ring',d:.2,st:.75,fat:8,ok:"The ring shakes. Both are down and the crowd is on its feet.",no:"The ropes buckle and the move turns ugly."},
 {t:"Shove {B} off to the floor",s:'ring',d:.05,st:.5,ok:"{B} crashes to the outside. {A} takes control.",no:"{B} grabs the rope and hangs on."},
 {t:"Head-butt {B} off the top and fly",s:'ring',d:.15,st:.75,fat:6,ok:"Down goes {B} — then {A} flies. Huge.",no:"{B} rolls away before {A} lands."},
 {al:'h',t:"Rake the eyes and crotch {B} on the turnbuckle",s:'luck',d:.05,st:.25,heat:12,ok:"Every fan in the building winces.",no:"{B} blocks it and pushes {A} off."}]},
{id:'ropebreak',w:2,text:"{B} is trapped in a hold, inches from the ropes.",ch:[
 {t:"Drag {B} back to the middle of the ring",s:'ring',d:.1,st:.5,ok:"No escape. The tension in the arena is unbearable.",no:"{B} wriggles closer and grabs the bottom rope."},
 {t:"Let them reach — and wait for the next opening",always:1,st:.25,ok:"Rope break. {A} stays in control."},
 {t:"Switch holds before {B} reaches the ropes",s:'ring',d:.15,st:.5,ok:"A seamless transition. {B} is stuck again.",no:"The switch gives {B} enough space to escape."},
 {al:'f',t:"Get the crowd behind the escape attempt — for {B}",vs:'f',s:'pop',d:.05,st:.5,popB:1,ok:"The crowd roots for both. Everyone is invested.",no:"The crowd isn't sure who to cheer."},
 {al:'h',t:"Pull {B}'s hair to keep them away from the ropes",s:'luck',d:.05,st:.25,heat:10,ok:"Illegal, effective and hated.",no:"The ref sees it and forces a break."}]},
{id:'mistake',w:1.5,text:"{A} lands awkwardly after a big move and grimaces, shaking out an arm.",ch:[
 {t:"Wrestle one-armed to the finish",iAn:.12,s:'ring',d:.15,st:.5,popA:2,ok:"Pure grit. The crowd rallies behind the effort.",no:"{B} goes straight for the hurt arm."},
 {t:"Call for the finish now",always:1,st:-.25,ok:"A quick, smart finish. Better safe than sorry."},
 {t:"Shake it off — adrenaline takes over",iAn:.1,s:'luck',d:.05,st:.25,ok:"Nothing wrong at all. {A} finishes strong.",no:"It's sore. {A} is a step slower for the rest of the match."}]},
{id:'escape',w:1.5,text:"{B} rolls to the floor and grabs a chair from ringside — then thinks better of it.",bd:1,ch:[
 {t:"{A} tells {B} to bring it",s:'pop',d:.05,st:.25,popA:1,heat:8,ok:"{B} drops the chair. The crowd cheers {A}'s nerve.",no:"{B} brings it. {A} takes a shot to the ribs."},
 {t:"Slide out and chase {B} around ringside",s:'ring',d:.05,st:.5,fat:4,ok:"A frantic chase that ends with {A} catching {B}.",no:"{B} slides back in and ambushes {A}."},
 {t:"Wait in the ring for {B} to come back",always:1,st:.25,ok:"{B} eventually returns and walks right into {A}."}]},
/* ---------- face / heel, stars and underdogs ---------- */
{id:'fakeshake',w:2,al:'h',vs:'f',text:"{A} offers {B} a handshake in the middle of the ring. The crowd is screaming at {B} not to take it.",ch:[
 {t:"Shake it — then a kick to the gut",s:'luck',d:.05,st:.25,heat:12,ok:"Oldest trick in the book. Still works.",no:"{B} saw it coming and blocks the kick."},
 {t:"Pull {B} into a small package",s:'luck',d:.05,st:.25,heat:10,ok:"1, 2, 3! Robbed in broad daylight.",no:"{B} kicks out and the crowd roars."},
 {t:"Actually shake it — and stun the building",always:1,st:.25,heat:4,ok:"Confusing. Is {A} changing? Nobody knows."}]},
{id:'fakeinj',w:2,al:'h',text:"{A} clutches their knee and calls for the doctor. Something about it seems... theatrical.",ch:[
 {t:"Wait for {B} to check on them — then strike",s:'luck',d:.05,st:.25,heat:14,ok:"The crowd knew it all along. {B} didn't.",no:"{B} stays well back. The act falls flat."},
 {t:"Sell it so well even the ref believes it",s:'mic',d:.15,st:.5,heat:12,ok:"An Oscar-worthy performance — and a roll-up win.",no:"{A} forgets which knee they were holding."},
 {t:"Give up the act and get back to work",always:1,st:0,ok:"The fans boo the whole charade."}]},
{id:'kidring',w:1.5,al:'f',text:"A kid in the front row is holding a sign: '{A}, PLEASE WIN FOR ME!'",ch:[
 {t:"Point at the kid, then fire up",s:'pop',d:.05,st:.5,popA:2,ok:"The crowd goes nuts. That kid will remember this forever.",no:"{B} cuts off the moment with a cheap shot."},
 {t:"Hand the kid a wristband after the match",always:1,st:.25,popA:1,ok:"A small gesture. A big moment for one young fan."},
 {t:"Win with the kid's favorite move",s:'ring',d:.1,st:.5,popA:1,ok:"Delivered. The front row is in tears.",no:"The move misses. The kid's face drops."}]},
{id:'upset',w:2,und:1,bstar:1,text:"{A} has the big star {B} reeling. The crowd can't believe what it's seeing.",ch:[
 {t:"Go for the upset of the year",s:'ring',d:.2,st:.75,popA:3,ok:"A star is born tonight. The crowd will talk about this for weeks.",no:"{B} snaps back to life and puts {A} in their place."},
 {t:"Make {B} work for every inch",always:1,st:.5,popA:2,ok:"{A} loses but looks like a contender. That's a win."},
 {al:'f',t:"Rally the crowd for one big comeback",s:'pop',d:.1,st:.75,popA:3,ok:"The building is willing {A} on.",no:"The rally falls short."},
 {al:'h',t:"Steal it with a handful of tights",s:'luck',d:.05,st:.25,popA:2,heat:14,ok:"The biggest win of {A}'s career — and the dirtiest.",no:"The ref catches the tights."}]},
{id:'veteran',w:1.5,star:1,text:"{A} slows things down and grabs a quick word with the referee. The veteran is in full control.",ch:[
 {t:"Take {B} to deep waters and outlast them",s:'ring',d:.1,st:.5,fat:4,ok:"{B} has never been in a match this long. {A} is just getting started.",no:"{B} has more gas than expected."},
 {t:"Make {B} look like a million bucks before winning",always:1,st:.5,popB:2,ok:"A generous performance. {B} leaves looking like a future star."},
 {t:"Let {B} hit their best stuff, then shake their head",s:'pop',d:.1,st:.5,popA:1,ok:"{B} threw everything. {A} is still standing. The crowd is in awe.",no:"{B}'s best stuff turns out to be very good."},
 {al:'h',t:"Use every veteran trick in the book",s:'luck',d:.05,st:.25,heat:10,ok:"Thumb to the eye, feet on the ropes, win. Masterclass in villainy.",no:"{B} has seen those tricks before."}]},
{id:'manager',w:2,al:'h',text:"{A}'s manager hops on the apron and starts screaming at the referee.",ch:[
 {t:"Use the distraction for a low blow",s:'luck',d:.05,st:.25,heat:12,ok:"The ref never saw it. Every fan did.",no:"The ref turns around just in time."},
 {t:"The manager slips {A} a foreign object",loseNo:'dq',s:'luck',d:.1,st:.5,heat:14,ok:"One shot and it's over. The crowd is irate.",no:"The ref finds it and tosses it to the floor."},
 {t:"{B} knocks the manager off the apron",always:1,st:.25,heat:8,ok:"The crowd loves it — but {A} catches {B} from behind."},
 {vs:'f',t:"The ref ejects the manager from ringside",always:1,st:.25,heat:6,ok:"The manager is escorted out, kicking and screaming. The crowd waves goodbye."}]},
/* ---------- tags, trios and multi-person ---------- */
{id:'blindtag',w:2.5,mt:'tag|trios|eight',need:'A2',text:"{A} is in trouble in the corner — and {A2} sneaks a blind tag.",ch:[
 {t:"{A2} surprises {B} from behind",s:'luck',d:.05,st:.5,chemT:1,ok:"{B} has no idea who's legal. {A2} takes over.",no:"The ref didn't see the tag and sends {A2} back."},
 {t:"Hit a double-team move as {A2} enters",s:'ring',d:.15,st:.75,chemT:1,ok:"In sync. The crowd loves this team.",no:"Timing's off. {B} escapes."},
 {t:"Play it straight and make a regular tag",always:1,st:.25,chemT:1,ok:"Solid teamwork."},
 {al:'h',t:"{A2} hides behind the ref, then cheap-shots {B}",s:'luck',d:.05,st:.25,heat:10,chemT:1,ok:"Underhanded tag-team wrestling at its finest.",no:"{B} reads it and decks {A2}."}]},
{id:'parade',w:2,mt:'trios|eight',text:"Everyone hits their finisher in a row — a parade of big moves with nobody making a cover.",ch:[
 {t:"Let it build to the biggest move of the night",s:'ring',d:.15,st:1,fat:7,ok:"Bodies everywhere. The crowd chants 'This is awesome!'",no:"Someone misses their cue and it gets messy."},
 {t:"{A} grabs the pin while everyone recovers",always:1,st:.5,ok:"The smart veteran move. Three."},
 {t:"Stand off in the middle of the ring",s:'pop',d:.05,st:.5,popA:1,ok:"Six wrestlers staring each other down. Huge reaction.",no:"The stand-off goes on too long."}]},
{id:'twoonone',w:2,mt:'triple|four',text:"{B} and another competitor team up on {A}.",ch:[
 {t:"Fight them both off",s:'ring',d:.15,st:.75,popA:2,fat:5,ok:"{A} clears the ring by themselves. Huge pop.",no:"Two-on-one is too much. {A} goes down."},
 {t:"Let them beat each other up instead",always:1,st:.25,ok:"The temporary alliance cracks immediately. {A} picks up the pieces."},
 {t:"Sneak in at the end to steal the pin",s:'luck',d:.05,st:.5,popA:1,ok:"The smartest wrestler in the match. Three.",no:"Both of them turn on {A} again."},
 {al:'h',t:"Join the alliance and turn on someone else",s:'luck',d:.05,st:.25,heat:10,ok:"Treachery everywhere. The crowd is loving the chaos.",no:"Nobody trusts {A}. They both turn on them."}]},
{id:'breakpin',w:2,mt:'triple|four',text:"{B} has the pin — one, two — and {A} dives in to break it up!",ch:[
 {t:"Throw {B} out and cover the other wrestler",s:'ring',d:.1,st:.5,ok:"Swift, ruthless and smart.",no:"Everyone is too tired to pin anyone."},
 {t:"Break it up with a huge splash off the top",nsty:'pw',s:'ring',d:.15,st:.75,fat:6,ok:"A flying save. The crowd explodes.",no:"{A} lands on the wrong person."},
 {t:"Pull the referee out of the ring",dq:1,always:1,st:0,heat:10,ok:"Chaos. The ref resets and the match continues."},
 {t:"Stack everyone up in the corner for a big splash",s:'ring',d:.15,st:.75,fat:6,ok:"Three bodies in one corner. {A} wipes them all out.",no:"Everyone moves at once."},
 {t:"Catch your breath and let the others fight",always:1,st:.25,ok:"Smart energy management. {A} is fresh for the finish."}]},
/* ---------- stipulations ---------- */
{id:'ladder2',w:2.5,stip:'ladder',text:"{B} is climbing — fingertips brushing the prize — when {A} spots a second ladder.",ch:[
 {t:"Set up the second ladder and climb face to face",s:'ring',d:.15,st:1,fat:7,ok:"Two ladders, two wrestlers, one prize. The whole arena is standing.",no:"The ladders slide apart and both crash down."},
 {t:"Tip {B}'s ladder over",iB:.15,s:'ring',d:.1,st:.75,fat:5,ok:"{B} topples into the ropes. {A} climbs.",no:"{B} jumps clear and lands on their feet."},
 {t:"Spear the ladder with {B} on it",nsty:'te',s:'ring',d:.15,st:.75,fat:6,ok:"A brutal collision. The ladder bends in half.",no:"{A} bounces right off the ladder."},
 {t:"Climb up underneath and shove {B} off",always:1,st:.25,ok:"{A} grabs the prize."}]},
{id:'cage2',w:2.5,stip:'cage',text:"{A} is climbing over the top of the cage — one leg over — when {B} grabs their boot.",ch:[
 {t:"Fight on the top of the cage",iAn:.12,s:'ring',d:.2,st:1,fat:8,ok:"Twenty feet up and trading punches. The crowd can't look away.",no:"They both fall back inside. Ouch."},
 {t:"Kick {B} off and drop to the floor",s:'luck',d:.05,st:.5,ok:"Feet touch the floor. {A} escapes.",no:"{B} pulls {A} back inside."},
 {t:"Climb back in and finish it inside",always:1,st:.25,ok:"No shortcuts. {A} pins {B} in the middle of the ring."},
 {sty:'fl',t:"Leap off the top of the cage onto {B}",iAn:.4,s:'ring',d:.25,st:1,fat:9,ok:"A breathtaking leap. Everyone will see it on their phone tonight.",no:"{B} moves. {A} hits steel."}]},
{id:'tables2',w:2.5,stip:'tables',text:"There's a table set up in the corner — and {B} is lying on the turnbuckle above it.",ch:[
 {t:"Superplex {B} through the table",iAn:.15,s:'ring',d:.2,st:1,fat:8,ok:"Wood explodes everywhere. That's a win.",no:"{B} slips free and the table stays whole."},
 {t:"Push {B} through the table from behind",always:1,st:.25,ok:"Not glamorous, but it counts."},
 {t:"Stack two tables on the floor first",s:'ring',d:.15,st:.75,fat:6,ok:"Double table. Double the destruction.",no:"Setting up takes too long. {B} recovers."}]},
{id:'weapons2',w:2.5,stip:'hard',text:"{A} pulls a kendo stick out from under the ring.",ch:[
 {t:"Swing for the fences",s:'ring',d:.05,st:.5,heat:8,ok:"CRACK. The front row jumps out of their seats.",no:"{B} ducks and {A} hits the ring post."},
 {t:"Toss it to {B} and dare them to use it",s:'mic',d:.1,st:.5,popA:1,heat:6,ok:"{B} hesitates — and {A} hits them with a fist instead.",no:"{B} doesn't hesitate."},
 {t:"Go back under the ring for something bigger",s:'luck',d:.05,st:.75,fat:5,ok:"Out comes a trash can, a cookie sheet and a road sign. Chaos.",no:"Nothing under there but cables."},
 {al:'h',t:"Choke {B} with the stick",s:'luck',d:.05,st:.25,heat:12,ok:"Vicious and illegal anywhere else.",no:"{B} breaks free and grabs the stick."}]},
{id:'sub2',w:2.5,stip:'sub',text:"{B} is caught in a submission and their hand is hovering over the mat.",ch:[
 {t:"Wrench it back — make them tap",s:'ring',d:.1,st:.5,ok:"{B} taps. Clean win.",no:"{B} powers out somehow."},
 {t:"Transition into a second hold",s:'ring',d:.15,st:.75,ok:"Two holds, one tap. Technical masterpiece.",no:"The transition gives {B} space to escape."},
 {t:"Let {B} fight to the ropes — rope breaks still count",always:1,st:.25,ok:"{B} survives. But for how long?"},
 {al:'h',t:"Use the ropes for extra leverage",s:'luck',d:.05,st:.25,heat:10,ok:"{B} taps. The crowd hates it.",no:"The ref sees and breaks the hold."}]},
{id:'iron2',w:2,stip:'iron|twoof3',text:"The falls are even and the clock is running down.",ch:[
 {t:"One more desperate pinning combination",s:'luck',d:.05,st:.5,ok:"A last-second fall. What a finish.",no:"Kicked out — and time runs out."},
 {t:"Go for the submission to end it for good",s:'ring',d:.15,st:.75,fat:6,ok:"{B} taps with seconds remaining.",no:"{B} reaches the ropes at the bell."},
 {t:"Pace it out — make the last minute count",always:1,st:.5,ok:"A smart, measured final stretch that ends with {A} ahead."}]},
{id:'falls2',w:2.5,stip:'falls|stampede|anarchy|street',text:"The fight spills all the way backstage into catering.",ch:[
 {t:"Fight through the kitchen",s:'ring',d:.1,st:.75,fat:6,heat:8,ok:"Pots, pans and a dessert table. A legendary brawl.",no:"The camera can't keep up. Nobody sees much."},
 {t:"Pin {B} on the catering table",s:'luck',d:.05,st:.5,ok:"A ref arrives just in time. Three!",no:"There's no ref back here yet."},
 {t:"Drag {B} back out to the arena",always:1,st:.25,ok:"Back in front of the crowd, and {A} finishes it."},
 {al:'h',t:"Lock {B} in the walk-in freezer",s:'luck',d:.05,st:.25,heat:12,ok:"{B} is banging on the door as {A} walks off. Win by... confusion?",no:"{B} kicks the door open."}]},
{id:'lights',w:2.5,stip:'lights',text:"Lights Out — no rules, no restrictions. {A} lifts the ring skirt and starts pulling out weapons.",ch:[
 {t:"Bring out every weapon under the ring",s:'ring',d:.1,st:.75,fat:6,heat:10,ok:"Chairs, tables and a ladder. The crowd loves the creativity.",no:"{B} uses the time to recover."},
 {t:"Go up the ramp and through the set",iB:.1,s:'ring',d:.15,st:1,fat:7,ok:"A crash through the stage set. An unforgettable spot.",no:"The set is sturdier than it looks."},
 {t:"Keep it simple — fists and boots",always:1,st:.25,ok:"An old-school fight. {A} wins it."},
 {t:"Bring in a bag of thumbtacks",iB:.1,s:'luck',d:.1,st:.75,heat:12,ok:"{B} lands right in them. The crowd shrieks.",no:"{A} lands in them instead."}]},
{id:'dog',w:2.5,stip:'dog',text:"{A} and {B} are chained together by the neck. {A} has the slack of the chain in their hands.",ch:[
 {t:"Yank {B} face-first into the turnbuckle",s:'ring',d:.05,st:.5,heat:10,ok:"The chain snaps tight. A sickening collision.",no:"{B} pulls back and {A} stumbles."},
 {t:"Wrap the chain around a fist and swing",iB:.1,s:'ring',d:.1,st:.75,heat:12,ok:"Brutal. {B} is out on their feet.",no:"{B} blocks and wraps the chain around {A}'s neck."},
 {t:"Drag {B} around the ring like a prize",s:'mic',d:.1,st:.5,heat:10,ok:"A hateful image. The fans scream for {B}.",no:"{B} uses the slack to trip {A}."},
 {t:"Fight for control of the chain",always:1,st:.25,ok:"A tug of war that ends with {A} on top."}]},
{id:'coffin',w:2.5,stip:'coffin',text:"The coffin lid is open at ringside. {B} is staggering beside it.",ch:[
 {t:"Shove {B} in and slam the lid",s:'ring',d:.1,st:.5,ok:"The lid comes down. It's over.",no:"{B} wedges a foot in the lid."},
 {t:"Fight on top of the coffin",s:'ring',d:.15,st:.75,fat:6,ok:"A wild brawl on the lid. Pure spectacle.",no:"The coffin tips over and the momentum dies."},
 {t:"Climb in after {B} and finish it there",s:'luck',d:.1,st:.5,ok:"Two people in a coffin, one getting out. A memorable finish.",no:"It gets crowded. And weird."},
 {al:'h',t:"Lie in the coffin and dare {B} to come close",s:'mic',d:.1,st:.5,heat:10,ok:"Creepy, unsettling and genius.",no:"{B} just closes the lid on {A}."}]},
{id:'barbed',w:2.5,stip:'barbed|bng',text:"The ropes are wrapped in barbed wire. Both wrestlers are terrified of the corners.",ch:[
 {t:"Whip {B} into the wire",iB:.15,s:'ring',d:.1,st:.75,heat:12,ok:"The crowd gasps. {B} is cut and furious.",no:"{B} reverses and {A} goes into the wire."},
 {t:"Avoid the wire — keep it in the middle",always:1,st:0,ok:"Careful and safe. The crowd wanted more."},
 {t:"Bring out a barbed-wire board",s:'ring',d:.15,st:1,fat:6,heat:14,ok:"Through it. The crowd goes silent, then roars.",no:"The board catches {A}'s gear on the way up."},
 {al:'f',t:"Endure the wire and fire back",iAn:.1,s:'pop',d:.1,st:.75,popA:2,ok:"{A} won't stay down. The fans are standing.",no:"The cuts slow {A} down."}]},
{id:'bng',w:2.5,stip:'bng|anarchy|stampede',text:"There are bodies everywhere. {A} looks up at the top of the structure.",ch:[
 {t:"Climb all the way up and fly",iAn:.4,s:'ring',d:.25,st:1,fat:9,ok:"A jaw-dropping dive onto the pile below.",no:"{A} misses most of the pile."},
 {t:"Pick off a straggler in the corner",s:'luck',d:.05,st:.5,ok:"Smart and ruthless. One down.",no:"The straggler is tougher than they look."},
 {t:"Pair off and keep brawling",always:1,st:.25,ok:"Fights everywhere. The crowd doesn't know where to look."}]},
{id:'tornado',w:2,stip:'tornado',need:'A2',text:"Tornado tag — all four are legal — and {A} and {A2} have {B} cornered.",ch:[
 {t:"Double-team finisher",s:'ring',d:.15,st:.75,chemT:1,ok:"Perfectly timed. The crowd goes wild.",no:"{B}'s partner breaks it up."},
 {t:"Split up and fight everywhere at once",always:1,st:.25,ok:"Chaos in every corner. {A} and {A2} come out on top."},
 {t:"{A2} holds off the other partner while {A} goes for the pin",s:'luck',d:.05,st:.5,chemT:1,ok:"Teamwork wins it.",no:"{A2} gets taken out first."}]},
{id:'lms2',w:2,stip:'lms|texas|iquit',text:"{B} is down. The ref is counting — four, five, six...",ch:[
 {t:"Hit one more big move to make sure",s:'ring',d:.1,st:.75,fat:5,ok:"Ten. {B} doesn't move.",no:"{B} stirs at nine anyway."},
 {t:"Wait and see if {B} beats the count",s:'luck',d:.1,st:.5,ok:"Ten! {A} wins.",no:"{B} pulls themselves up on the ropes at nine."},
 {t:"Wedge {B} under a ladder so they can't get up",s:'ring',d:.1,st:.75,heat:10,ok:"Pinned under the steel. {B} can't rise.",no:"{B} kicks the ladder off."}]},
/* ---------- styles meet ---------- */
{id:'flyfly',w:1.5,sty:'fl',bsty:'fl',text:"Two high-flyers — and they're trying to out-do each other in the air.",ch:[
 {t:"Bigger and bigger dives",iAn:.3,s:'ring',d:.2,st:1,fat:8,ok:"A highlight reel. The internet will be talking about this one.",no:"One dive too many. Someone lands badly."},
 {t:"Stand off after a mirrored dodge",always:1,st:.5,ok:"A standoff and a standing ovation."},
 {t:"Ground {B} so they can't fly",s:'ring',d:.1,st:.25,ok:"A smart change of pace. {B} can't get airborne.",no:"{B} escapes and takes off again."}]},
{id:'tebr',w:1.5,sty:'te',bsty:'br|pw',text:"{A} is trying to out-wrestle {B}, but {B} just wants to fight.",ch:[
 {t:"Take {B} down and tie them up",s:'ring',d:.15,st:.5,ok:"Technique beats power. {B} is trapped.",no:"{B} powers out and lands a haymaker."},
 {t:"Stand and trade — show {B} you can fight too",s:'ring',d:.1,st:.75,fat:5,heat:8,ok:"Surprising grit. The crowd respects it.",no:"Bad idea. {B} wins the exchange."},
 {t:"Target {B}'s legs to slow them down",always:1,st:.25,ok:"Smart. {B} is limping by the finish."}]}];

const TW2=[
{when:'solo',text:"The crowd starts a chant for {A}'s old tag team partner.",ch:[{t:"Acknowledge them with a smile",s:'pop',d:.05,p:3,ok:"A nice moment of nostalgia."},{t:"Tell the crowd that chapter is closed",s:'mic',d:.1,p:2},{al:'h',t:"Tell the crowd their old partner held them back",s:'mic',d:.1,p:3,ok:"Cold. The boos rain down."}]},
{when:'solo',text:"The ring announcer's mic is the only one working — and {A} has to share it.",ch:[{t:"Make the announcer do the talking",s:'mic',d:.1,p:3,ok:"A hilarious double act. The crowd is in stitches."},{t:"Wait for the tech crew",s:'luck',d:0,p:1},{al:'h',t:"Snatch it and shove the announcer out",s:'mic',d:.05,p:2,ok:"Rude, abrupt and very heel."}]},
{when:'solo',text:"Someone in the upper deck holds up a sign: '{A} CAN'T WIN THE BIG ONE.'",ch:[{t:"Read the sign out loud and promise to prove it wrong",s:'mic',d:.1,p:3,ok:"A fire is lit under {A}."},{t:"Laugh it off",s:'pop',d:.05,p:2},{al:'h',t:"Demand security remove the fan",s:'mic',d:.05,p:2,ok:"Petty, insecure and hilarious."}]},
{when:'solo',cd:1,w:1,text:"The countdown clock on the big screen glitches and starts counting toward... something.",ch:[{t:"Stare at the screen until it stops",s:'pop',d:.05,p:2,cdh:1,ok:"Creepy. Fans start theorising immediately.",no:"The clock blinks out before anyone notices."},{t:"Ignore it and keep talking",s:'mic',d:.1,p:2,ok:"Business as usual — but the clock keeps ticking in the corner of the screen.",no:"Nobody's listening. Everyone is watching the clock."},{t:"Tell everyone it's counting down to something big",s:'mic',d:.15,p:4,cdh:2,ok:"Speculation runs wild online.",no:"It sounds like {A} has no idea either."},{al:'h',t:"Demand to know who's behind it",s:'mic',d:.1,p:3,cdh:1,ok:"{A} looks rattled for the first time in months.",no:"The clock just keeps counting. {A} storms off."}]},
{when:'solo',star:1,text:"A section of the crowd chants 'ONE MORE YEAR!' at {A}.",ch:[{t:"Promise them a lot more than one",s:'mic',d:.1,p:4,ok:"Huge pop."},{t:"Take it all in, quietly",s:'pop',d:.05,p:3},{al:'h',t:"Tell them they don't deserve one more year",s:'mic',d:.1,p:3,ok:"Mean and memorable."}]},
{when:'solo',und:1,text:"A small but loud group of fans has made custom shirts for {A}.",ch:[{t:"Point them out and thank them",s:'pop',d:.05,p:4,ok:"The section goes wild. More fans want those shirts."},{t:"Promise to make them proud",s:'mic',d:.1,p:3},{al:'h',t:"Tell them to buy official merch instead",s:'mic',d:.05,p:2,ok:"Hilariously petty."}]},
{when:'duo',text:"{B} snatches the mic out of {A}'s hand mid-sentence.",ch:[{t:"Snatch it right back",s:'mic',d:.1,h:10,p:2,ok:"A tug-of-war over a microphone. The tension is real."},{t:"Grab a second mic from the timekeeper",s:'mic',d:.05,h:6,p:3},{t:"Shove {B} into the ropes",nff:1,s:'ring',d:.05,h:14,p:1}]},
{when:'duo',text:"{B} walks out holding a stack of old photos of {A}.",ch:[{t:"Laugh along — they were a great look",s:'pop',d:.05,h:6,p:3,ok:"The crowd loves {A}'s sense of humor."},{t:"Grab the photos and rip them up",s:'luck',d:.05,h:12,p:2},{t:"Pull out embarrassing photos of {B}",s:'mic',d:.15,h:12,p:3,ok:"Turnabout is fair play. The crowd howls."}]},
{when:'duo',nff:1,text:"{B} spits at {A}'s feet.",ch:[{t:"Go after {B} right now",s:'ring',d:.1,h:16,p:2},{t:"Stay cool and promise payback",s:'mic',d:.1,h:10,p:3,ok:"Composure. The crowd knows what's coming."},{t:"Wipe it up with {B}'s jacket",s:'luck',d:.05,h:12,p:3}]},
{when:'duo',al:'f',vs:'f',text:"The crowd starts chanting 'WE WANT BOTH!' — they want a match between {A} and {B}.",ch:[{t:"Give the crowd what they want — make it official",s:'mic',d:.1,h:8,p:3,ok:"Everyone wants to see this one."},{t:"Shake hands and save it for later",s:'pop',d:.05,h:4,p:3,c:1},{t:"Tease a tag team instead",s:'mic',d:.1,p:2,c:2,ok:"Wait — the crowd likes that too."}]},
{when:'duo',al:'h',vs:'h',text:"{A} and {B} realize they're wearing the same jacket.",ch:[{t:"Demand {B} take theirs off",s:'mic',d:.1,h:10,p:3,ok:"Ridiculous and perfect."},{t:"Suggest they're clearly meant to be a team",s:'mic',d:.1,c:2,p:2},{t:"Walk off in disgust",s:'luck',d:0,h:6,p:1}]},
{when:'duo',text:"The lights go out. When they come back on, {B} is standing right behind {A}.",ch:[{t:"Turn slowly and stare them down",s:'pop',d:.05,h:10,p:3,ok:"Nobody blinks. The crowd is holding its breath."},{t:"Spin around swinging",nff:1,s:'ring',d:.1,h:14,p:2},{t:"Act like nothing happened",s:'mic',d:.1,h:8,p:2}]},
{when:'any',text:"Someone in the crowd throws a replica of {A}'s gear into the ring.",ch:[{t:"Put it on and pose",s:'pop',d:.05,p:3,ok:"A perfect fit. The crowd cheers."},{t:"Throw it back with a wink",s:'pop',d:.05,p:2},{al:'h',t:"Tear it apart in front of the fan",s:'mic',d:.05,p:2,ok:"Heartless. The boos are loud."}]},
{when:'any',text:"The production truck accidentally plays the wrong entrance music.",ch:[{t:"Dance to it anyway",s:'pop',d:.1,p:3,ok:"The crowd sings along. A viral moment."},{t:"Glare at the stage until it stops",s:'mic',d:.05,p:2},{t:"Pretend it's the new theme",s:'mic',d:.15,p:3,ok:"The internet loves the commitment."}]},
{when:'any',x:1,text:"{X} is sitting in the front row with a bag of popcorn, watching.",ch:[{t:"Call {X} out by name",s:'mic',d:.1,hx:10,p:3},{t:"Ignore {X} completely",s:'luck',d:0,hx:4,p:1},{t:"Walk over and take some popcorn",s:'pop',d:.05,hx:8,p:3,ok:"The crowd laughs. {X} doesn't."}]},
{when:'any',x:1,text:"A backstage camera catches {X} smashing a monitor while {A} talks.",ch:[{t:"Tell {X} to come out and say it to their face",s:'mic',d:.1,hx:12,p:3},{t:"Ask the crowd if they want to see {X} get hurt",s:'pop',d:.1,hx:10,p:3},{t:"Keep going like nothing happened",s:'luck',d:0,hx:4,p:1}]},
{when:'any',text:"The crowd breaks into an impromptu sing-along of {A}'s entrance theme.",ch:[{t:"Conduct the crowd",s:'pop',d:.05,p:4,ok:"A goosebumps moment."},{t:"Wait for it to finish, smiling",s:'pop',d:0,p:2},{al:'h',t:"Tell them to stop — they're off-key",s:'mic',d:.1,p:3,ok:"Insulting, and the crowd sings louder."}]},
{when:'any',held:1,text:"The {T} title plate catches the spotlight and nearly blinds the front row.",ch:[{t:"Point it at the crowd like a mirror",s:'pop',d:.05,p:3,ok:"Pure showmanship."},{t:"Tell the fans this is what they all want",s:'mic',d:.1,p:3},{al:'h',t:"Blind the camera on purpose",s:'luck',d:.05,p:2,ok:"Annoying and funny."}]},
{when:'any',fac:1,text:"Only half of {F} comes out to support {A}. Where are the rest?",ch:[{t:"Ask the crowd if they've seen them",s:'mic',d:.1,p:2},{t:"Promise there's no trouble in {F}",s:'mic',d:.15,p:3,ok:"Nobody believes it — which makes it great TV."},{t:"Keep going like nothing's wrong",s:'luck',d:0,p:1}]},
{when:'any',al:'h',text:"The crowd is chanting so loud {A} can't hear themselves.",ch:[{t:"Wait them out with folded arms",s:'mic',d:.1,p:3,ok:"An endless stand-off. The crowd eventually gives up."},{t:"Shout over them until they're hoarse",s:'mic',d:.1,p:2},{t:"Leave and come back later",s:'luck',d:0,p:1}]},
{when:'any',al:'f',text:"A veteran fan in the front row has been at every show since day one.",ch:[{t:"Give them a hug over the barricade",s:'pop',d:.05,p:4,ok:"A lovely moment. The crowd cheers."},{t:"Dedicate the night to them",s:'mic',d:.1,p:3},{t:"Shake their hand and get back to business",s:'pop',d:0,p:2}]}];

/* promo scenes: openers (texts) and choices (ch) by promo type and solo/duo */
const SC2={
callout:{solo:{texts:[
 {t:"{A} walks out with a stack of printed rankings and drops them on the mat."},
 {al:'h',t:"{A} has the house lights cut so the only thing on is a spotlight on them."},
 {al:'f',t:"{A} jogs out wearing a fan-made shirt and grabs the mic with a grin."}],ch:[
 {t:"Call out whoever thinks they're next in line",s:'mic',d:.1,x:1,hx:10,p:2,ok:"{X} heard it. Everyone backstage did.",no:"The challenge goes unanswered."},
 {t:"Read out their win-loss record like a resume",s:'mic',d:.15,p:3,ok:"The numbers speak for themselves.",no:"The record is a bit worse than they remember."},
 {t:"Promise a surprise at the next PPV",s:'mic',d:.1,p:3,ok:"Fans start guessing right away.",no:"It's so vague no one cares."},
 {al:'f',t:"Bring a kid from the front row into the ring to help",s:'pop',d:.05,p:4,ok:"The cutest callout in history.",no:"The kid freezes. Adorable, but the promo stalls."},
 {al:'h',t:"Rank the whole locker room — and put everyone below {A}",s:'mic',d:.15,p:3,ok:"Insulting everyone at once. Impressive.",no:"The list gets too long."},
 {al:'h',t:"Tell the crowd they're lucky {A} showed up tonight",s:'mic',d:.05,p:2,ok:"Arrogant and infuriating.",no:"The crowd yells back 'GO HOME!' and it sticks."}]},
 duo:{texts:[
 {t:"{A} walks out with a rolled-up poster of {B} and unrolls it slowly."},
 {nff:1,t:"{A} interrupts {B}'s entrance halfway down the ramp."},
 {al:'f',vs:'h',t:"{A} walks out to a roar and stares straight at {B} on the big screen."}],ch:[
 {t:"Tell {B} exactly when and where it'll happen",ch:1,s:'mic',d:.05,h:10,p:2,ok:"A date and a place. It's on.",no:"{B} isn't paying attention."},
 {t:"Point out every time {B} has dodged {A}",s:'mic',d:.1,h:12,p:3,ok:"The list is long. {B} looks scared.",no:"{B} has an answer for every one."},
 {nff:1,t:"Tear the poster of {B} in half",s:'pop',d:.05,h:12,p:2,ok:"A simple, effective message.",no:"The poster is laminated. It won't tear."},
 {al:'f',vs:'h',t:"Promise the fans {B} won't escape this time",s:'mic',d:.1,h:12,p:3,ok:"The crowd roars. {B} is cornered.",no:"{B} slips out the back."},
 {al:'h',vs:'f',t:"Mock {B}'s catchphrase in front of their fans",s:'mic',d:.1,h:14,p:2,ok:"Pure disrespect. The crowd boos every word.",no:"The crowd chants the catchphrase back louder."},
 {al:'f',vs:'f',t:"Ask the crowd who they'd rather see win",s:'pop',d:.1,h:8,p:3,ok:"An even split. Everyone wants this match.",no:"The crowd clearly picks {B}. Awkward."}]}},
attack:{duo:{texts:[
 {nff:1,t:"{B} is warming up backstage when the lights in the hallway go out."},
 {al:'h',t:"{B} is signing autographs at ringside when {A} jumps the barricade from the crowd."},
 {al:'f',vs:'h',t:"{B} is in the middle of mocking {A} on the big screen when {A} appears behind them."}],ch:[
 {t:"Leave {B} laid out with a calling card",s:'mic',d:.1,h:14,p:2,ok:"A chilling message. Everyone knows who did it.",no:"The calling card blows away."},
 {nff:1,t:"Drag {B} into the arena and finish the job in front of everyone",s:'ring',d:.15,h:18,p:2,ok:"The fans watch helplessly. Brutal.",no:"Security pulls {A} away halfway up the ramp."},
 {nff:1,t:"Attack from the crowd, then disappear back into it",s:'luck',d:.05,h:16,p:2,ok:"In and out. A ghost.",no:"Fans block the escape route."},
 {al:'h',t:"Hit {B} with a ring bell",s:'ring',d:.1,h:20,p:1,ok:"A horrible sound. The crowd is outraged.",no:"{B} dodges and grabs the bell."},
 {al:'f',vs:'h',t:"Turn the tables on {B} mid-gloat",s:'pop',d:.05,h:12,p:4,ok:"Poetic justice. The crowd erupts.",no:"{B} escapes over the barricade."},
 {sty:'br|pw',nff:1,t:"Throw {B} through the backstage curtain",s:'ring',d:.1,h:16,p:2,ok:"The curtain comes down with {B} in it.",no:"{B} holds on to the curtain rail."}]}},
interview:{solo:{texts:[
 {t:"{A} sits down for a pre-tape at the gym where they started."},
 {al:'h',t:"{A} insists the interview be done in a dark room with a single lamp."},
 {al:'f',t:"{A} brings their family to the interview."}],ch:[
 {t:"Tell the story of their first-ever match",s:'mic',d:.1,p:3,ok:"Funny, sweet and real.",no:"It goes on a bit long."},
 {t:"Reveal a goal they've never said out loud",s:'mic',d:.15,p:4,ok:"Fans lean in. Now everyone wants to see it happen.",no:"It sounds a little unrealistic."},
 {t:"Talk about the one match they want before they're done",s:'mic',d:.1,x:1,hx:8,p:3,ok:"{X} is listening. A dream match is born.",no:"Nobody backstage reacts."},
 {al:'f',t:"Introduce their family to the fans",s:'pop',d:.05,p:4,ok:"The crowd at home falls in love.",no:"Sweet, but the segment drags."},
 {al:'h',t:"Refuse to answer anything that isn't about winning",s:'mic',d:.1,p:2,ok:"Cold and single-minded. Intimidating.",no:"The interview goes nowhere."},
 {al:'h',t:"Turn the questions back on the interviewer",s:'mic',d:.15,p:3,ok:"The interviewer squirms. Fans love it.",no:"The interviewer handles it well."}]},
 duo:{texts:[
 {t:"Two chairs, a table and an interviewer who clearly regrets taking this job."},
 {al:'h',vs:'h',t:"{A} and {B} sit down, both refusing to look at each other."},
 {al:'f',vs:'h',t:"{A} sits calmly while {B} keeps checking their phone."}],ch:[
 {t:"Lay out exactly why {A} wins the match",s:'mic',d:.1,h:10,p:3,ok:"Clear, confident and convincing.",no:"{B} pokes holes in every point."},
 {t:"Bring up something personal about {B}",nff:1,s:'mic',d:.15,h:14,p:2,ok:"The temperature in the room drops.",no:"{B} laughs it off."},
 {t:"Stay silent until {B} cracks",s:'luck',d:.05,h:8,p:2,ok:"{B} rants for a minute and looks unhinged.",no:"{B} is happy to stay silent too. Long pause."},
 {al:'f',vs:'h',t:"Take {B}'s phone and read their messages",s:'luck',d:.1,h:12,p:3,ok:"Embarrassing texts. The crowd howls.",no:"The phone is locked. Of course."},
 {al:'f',vs:'f',t:"Say this is the match they've wanted their whole career",s:'mic',d:.1,h:6,p:3,c:1,ok:"Respect. This match just got bigger.",no:"{B} takes it as a weakness."},
 {al:'h',t:"Flip the table and walk out",nff:1,s:'ring',d:.05,h:14,p:2,ok:"The interviewer dives for cover. Great TV.",no:"The table is bolted down."}]}},
contract:{duo:{texts:[
 {t:"The contract signing is in the middle of the ring — and the table has already been checked for weapons."},
 {al:'h',t:"{A} shows up with a pen that's clearly been sharpened."},
 {al:'f',vs:'f',t:"{A} and {B} both arrive early. They sit in silence."}],ch:[
 {t:"Read the contract out loud, slowly",s:'mic',d:.1,h:10,p:3,ok:"Every clause lands. The stakes feel enormous.",no:"The legal language bores the crowd."},
 {t:"Sign — then demand a bigger stage for the match",stp:1,s:'mic',d:.15,h:12,p:3,ok:"Done. The match just got upgraded.",no:"The demand falls flat."},
 {t:"Sign, stand, and stare {B} down until they leave",s:'pop',d:.05,h:10,p:2,ok:"{B} blinks first. Advantage {A}.",no:"{B} stares back. Nobody leaves."},
 {al:'f',vs:'h',t:"Make {B} sign first so they can't back out",s:'mic',d:.1,h:12,p:3,ok:"{B} signs. No escape now.",no:"{B} signs with an 'X'. Is that legal?"},
 {al:'h',t:"Sign with {B}'s pen, then snap it",s:'luck',d:.05,h:12,p:2,ok:"A small, petty act. The crowd hates it.",no:"The pen won't snap."},
 {al:'h',vs:'f',t:"Hide a weapon under the table",s:'luck',d:.1,h:18,p:2,ok:"{B} goes down hard. The signing ends in chaos.",no:"{B} finds it first."}]}},
rally:{solo:{texts:[
 {t:"{A} stands in the middle of the ring as {F} fill the entrance ramp."},
 {al:'h',t:"{F} have taken over the ring. {A} sits on a throne in the middle."}],ch:[
 {t:"Lay out the group's goals for the year",s:'mic',d:.1,p:3,ok:"Clear, ambitious and a little scary.",no:"Nobody remembers the goals."},
 {t:"Have each member say one word",s:'pop',d:.1,p:2,ok:"A perfect, chilling moment.",no:"Someone forgets their word."},
 {t:"Debut new matching entrance music",s:'pop',d:.05,p:3,ok:"The crowd sings along immediately.",no:"The music is a little too long."},
 {al:'f',t:"Invite the crowd to join the group's chant",s:'pop',d:.05,p:4,ok:"Thousands chanting together.",no:"The chant is too complicated."},
 {al:'h',t:"Make a rival group's tag champions bow",s:'ring',d:.1,x:1,hx:12,p:3,ok:"{X} is furious at the disrespect.",no:"Nobody bows."}]},
 duo:{texts:[
 {t:"{A} and {B} come out in matching jackets."},
 {al:'f',t:"{A} and {B} come out through the crowd, high-fiving everyone."}],ch:[
 {t:"Name their team",s:'mic',d:.1,p:3,c:2,ok:"The name sticks. Merch is coming.",no:"Nobody likes the name."},
 {t:"Challenge the tag champions",s:'mic',d:.15,p:3,c:1,ok:"A real contender.",no:"The champions just laugh."},
 {t:"Do a synchronized pose",s:'pop',d:.05,p:2,c:2,ok:"Perfectly in sync. The crowd loves it.",no:"One of them is a beat late."},
 {al:'f',t:"Tell the story of how they met",s:'mic',d:.1,p:3,c:2,ok:"Funny and heartfelt.",no:"Their stories don't match."},
 {al:'h',t:"Promise to embarrass everyone in their way",s:'mic',d:.1,p:2,c:1,ok:"Two of the most hated people in the building.",no:"They argue over who gets to embarrass them first."}]}},
champ:{solo:{texts:[
 {t:"{A} walks out to the ring and lays the {T} title on the mat before speaking."},
 {al:'h',t:"{A} arrives with the {T} title in a velvet bag."}],ch:[
 {t:"Talk about what the {T} title means",s:'mic',d:.1,p:3,ok:"Heartfelt and powerful.",no:"It sounds rehearsed."},
 {t:"Count down the days of the reign",s:'pop',d:.05,p:2,ok:"The fans cheer every milestone.",no:"The reign isn't that long yet."},
 {t:"Name the next challenger themselves",s:'mic',d:.1,x:1,hx:12,p:3,ok:"{X} has a title shot — and a target on their back.",no:"{X} doesn't take the bait."},
 {al:'f',t:"Hand the title to a fan to hold for a moment",s:'pop',d:.1,p:4,ok:"Pure joy. A lifetime memory.",no:"The fan won't give it back."},
 {al:'h',t:"Make the ring announcer introduce them as 'the greatest'",s:'mic',d:.1,p:3,ok:"The announcer is mortified. The crowd boos.",no:"The announcer refuses."}]},
 duo:{texts:[
 {t:"{A} and {B} meet face to face, the {T} title between them."},
 {al:'f',vs:'f',t:"{A} invites {B} into the ring to talk about the {T} title."}],ch:[
 {t:"Set the date for the title match",ch:1,s:'mic',d:.05,h:10,p:3,ok:"It's official. The crowd can't wait.",no:"The details are muddled."},
 {t:"Hand {B} the title to hold — just for a second",s:'pop',d:.1,h:10,p:2,ok:"{B} looks at it a little too long.",no:"{B} won't hand it back."},
 {nff:1,t:"Drop {B} with the title belt",s:'ring',d:.15,h:16,p:2,ok:"The champion makes a statement.",no:"{B} ducks and grabs the title."},
 {al:'f',vs:'f',t:"Promise the best match of the year",s:'mic',d:.1,h:6,p:3,c:1,ok:"The crowd believes it.",no:"A big promise. Can they deliver?"},
 {al:'h',vs:'f',t:"Tell {B} they'll never be good enough",s:'mic',d:.1,h:14,p:2,ok:"Harsh and cruel. The crowd boos.",no:"{B} has a great comeback."}]}},
turn:{solo:{texts:[
 {al:'f',t:"{A} walks out with no music. The silence is deafening."},
 {al:'f',t:"{A} grabs a mic, looks at the crowd for a long time, and sighs."},
 {al:'h',t:"{A} walks out without their usual entourage."},
 {al:'h',t:"{A} kneels in the middle of the ring."}],ch:[
 {al:'f',t:"Tell the fans they've been taking {A} for granted",s:'mic',d:.1,p:3,ok:"Bitter and believable.",no:"The crowd isn't sure what's happening."},
 {al:'f',t:"Attack the backstage interviewer",s:'ring',d:.05,p:2,ok:"Shocking and cruel. A new heel is born.",no:"The interviewer runs away."},
 {al:'h',t:"Tell the crowd they changed {A}'s mind",s:'mic',d:.1,p:4,ok:"A redemption story. The crowd embraces it.",no:"Feels a little sudden."},
 {al:'h',t:"Apologize to the people they've hurt by name",s:'mic',d:.15,p:4,ok:"Powerful and sincere. The fans believe.",no:"The list is so long it gets awkward."}]},
 duo:{texts:[
 {al:'f',t:"{A} is in {B}'s corner tonight — but keeps glancing at the ramp."},
 {al:'h',t:"{B} is surrounded and outnumbered. {A} is watching from the stage."}],ch:[
 {al:'f',t:"Hand {B} a weapon — then take it back and use it on them",s:'ring',d:.1,h:16,p:3,ok:"A cruel double-cross.",no:"{B} sees it coming — but the turn is done."},
 {al:'f',t:"Walk away and leave {B} alone",s:'luck',d:0,h:12,p:2,ok:"Abandonment. Cold and memorable.",no:"Nobody notices at first — but they will."},
 {al:'h',t:"Clear the ring and help {B} up",s:'ring',d:.05,h:2,p:4,c:2,ok:"A hero's welcome. The crowd erupts.",no:"Just a step too late — but the intention is clear."},
 {al:'h',t:"Stand between {B} and their attackers",s:'pop',d:.05,h:2,p:3,c:2,ok:"The crowd roars. Allies at last.",no:"The attackers retreat before anything happens."}]}},
vignette:{solo:{texts:[
 {t:"The camera follows {A} on a long drive at night."},
 {al:'f',t:"{A} shows up at a local wrestling school to help train students."},
 {al:'h',t:"{A} is sitting in an empty arena, staring at the ring."}],ch:[
 {t:"Talk to the camera about what drives them",s:'mic',d:.1,p:3,ok:"Raw and personal.",no:"A bit flat."},
 {t:"Show off a new move in the training ring",s:'ring',d:.1,p:2,ok:"The fans can't wait to see it.",no:"It doesn't look finished yet."},
 {t:"A cryptic hint about the next PPV",s:'mic',d:.15,p:3,ok:"Fans are already theorising.",no:"Too vague to care about."},
 {al:'f',t:"Spar with a student — and let them win",s:'pop',d:.05,p:4,ok:"A lovely moment. The student is beaming.",no:"The student gets carried away."},
 {al:'h',t:"Sit in silence until the camera crew leaves",s:'mic',d:.1,p:3,ok:"Unsettling and memorable.",no:"It just looks like a blank tape."},
 {al:'h',t:"Burn their old gear in a trash can",s:'luck',d:.05,p:3,ok:"A dark, defining image.",no:"The fire alarm goes off."}]},
 duo:{texts:[
 {t:"{A} and {B} end up in the same backstage hallway, alone."},
 {al:'h',vs:'f',t:"{A} watches {B} warm up from the shadows."},
 {al:'f',vs:'h',t:"{A} catches {B} talking about them to another wrestler."}],ch:[
 {t:"A long, silent stare-down",s:'pop',d:.05,h:8,p:2,ok:"The tension is unbearable.",no:"Someone walks between them and the moment is lost."},
 {t:"Throw a towel in {B}'s face",nff:1,s:'luck',d:.05,h:10,p:2,ok:"A small insult with big consequences.",no:"{B} catches it."},
 {t:"Offer {B} a drink — then pour it out",s:'mic',d:.05,h:10,p:2,ok:"Petty and perfect.",no:"{B} declines before {A} can pour it."},
 {al:'f',vs:'h',t:"Confront {B} about what they said",s:'mic',d:.1,h:12,p:3,ok:"{B} has no answer.",no:"{B} denies everything."},
 {al:'h',vs:'f',t:"Sabotage {B}'s gear before their match",s:'luck',d:.05,h:12,p:2,ok:"{B}'s boot laces are cut. Diabolical.",no:"{B} catches {A} in the act."},
 {al:'f',vs:'f',t:"Help {B} tape their wrists before their match",s:'pop',d:.05,p:3,c:2,ok:"A sign of respect. The fans love it.",no:"{B} doesn't seem to want the help."}]}}};

if(typeof MEV_MORE!=='undefined')MEV_MORE.push(...MEV2);
if(typeof TWISTS_MORE!=='undefined')TWISTS_MORE.push(...TW2);
if(typeof SCENES_MORE!=='undefined')for(const k in SC2)for(const sd in SC2[k]){const x=SC2[k][sd];SCENES_MORE[k]=SCENES_MORE[k]||{};const b=SCENES_MORE[k][sd];
 if(!b){SCENES_MORE[k][sd]={texts:x.texts||[],ch:x.ch||[]};continue}
 b.texts=(b.texts||[]).concat(x.texts||[]);b.ch=(b.ch||[]).concat(x.ch||[])}
})();
