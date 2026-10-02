/* Tony Khan Simulator — extra match moments, promo scenes and promo twists.
   Merged into MEV, TWISTS and SCENES by index.html. Same fields as the built-in ones, plus these filters so every
   option fits the people involved:
     al / vs      {A} / {B} must be a face ('f') or heel ('h')
     nff:1        not face-vs-face (faces don't ambush or cheat against other faces)
     sty / bsty   {A} / {B} must have one of these styles ('fl|sh'): fl High-Flyer, te Technician, br Brawler, pw Powerhouse, sh Showman
     nsty         {A} must NOT have one of these styles
     mt           match type ('tag|trios|eight', 'triple|four'), matches only
     stip         stipulation keys or groups ('ladder', 'hard', 'nodq' = anything with no disqualifications), matches only
     bd:1         {B} is a heel, or it's a no-DQ match (for {B} bringing in weapons)
     held:1       {A} holds a title (promos) · fac:1 {A} is in a faction (promos)
     star:1 / und:1   {A} is a big star (popularity 72+) / an underdog (58 or less) · bstar:1 {B} is a big star */
'use strict';
const MEV_MORE=[
/* ---------- style-driven moments ---------- */
{id:'fly',w:2.5,sty:'fl',text:"{A} is perched on the top turnbuckle while {B} staggers around on the floor below.",ch:[
 {t:"Moonsault to the floor",s:'ring',d:.15,st:.75,fat:7,failInj:'A',ok:"{A} flies and connects — the front row is on its feet.",no:"{B} moves. {A} crashes onto the thin mats and stays down a worrying beat."},
 {t:"Springboard back in and wait for {B} to return",s:'ring',d:.1,st:.5,fat:4,ok:"Perfect timing — {B} rolls in right into a flying cutter.",no:"{A} slips on the springboard and has to scramble."},
 {t:"Stay patient and pick the moment",always:1,st:.25,ok:"No big risk, but {A} keeps control."},
 {al:'f',t:"Point to the fans, then take the leap",s:'pop',d:.15,st:.75,popA:2,fat:6,ok:"A highlight-reel dive the fans will be posting all week.",no:"{B} pulls a fan's chair in the way. Ouch."},
 {al:'h',t:"Fake the dive, then slide in to win by count-out",dq:1,s:'luck',d:.05,st:.25,heat:12,ok:"{A} celebrates a cheap count-out win. The crowd is livid.",no:"{B} beats the count by a hair and the crowd roars."}]},
{id:'power',w:2.5,sty:'pw',text:"{A} hoists {B} up into the air and just… holds them there. The crowd starts counting.",ch:[
 {t:"Hold the delayed vertical suplex as long as possible",s:'ring',d:.1,st:.5,fat:5,ok:"Ten… eleven… twelve… SLAM. The building explodes.",no:"{B} wriggles free and lands on their feet."},
 {t:"Launch {B} over the top rope to the floor",s:'ring',d:.1,st:.5,heat:8,ok:"{B} sails over the ropes. Pure power.",no:"{B} skins the cat and gets right back in."},
 {t:"Power bomb {B} straight into the mat",s:'ring',d:.15,st:.75,fat:5,ok:"The ring shakes. So does the crowd.",no:"{B} counters with a hurricanrana out of nowhere."},
 {al:'f',t:"Let the crowd count along, then slam",s:'pop',d:.05,st:.5,popA:2,ok:"The whole arena counts to ten with {A}. Iconic.",no:"The count loses steam at six. Awkward."},
 {al:'h',t:"Drop {B} throat-first on the ring apron",s:'ring',d:.05,st:.5,heat:14,ok:"The hardest part of the ring. {B} is in real trouble.",no:"{B} grabs the ropes and hangs on."}]},
{id:'chain',w:2.5,sty:'te',text:"{A} and {B} are locked in a chain-wrestling battle — reversal after reversal, nobody giving an inch.",ch:[
 {t:"Bust out a rare submission nobody has seen in years",s:'ring',d:.2,st:.75,ok:"The purists lose their minds. {B} is trapped.",no:"{B} knows the counter. Of course they do."},
 {t:"Grind {B} down with a methodical limb attack",always:1,st:.25,ok:"Not flashy, but {B}'s arm is done for the night."},
 {t:"Roll {B} into a pinning combination for a near-fall",s:'ring',d:.1,st:.5,ok:"Two and nine-tenths! The crowd leaps up.",no:"{B} rolls through and turns it into their own cover."},
 {al:'f',t:"Offer a clean break when {B} reaches the ropes",s:'pop',d:.05,st:.25,popA:2,ok:"Old-school sportsmanship. The fans applaud.",no:"{B} uses the break to slap {A}. The crowd boos — but {A} looks soft."},
 {al:'h',t:"Break the hold with a thumb to the eye",s:'luck',d:.05,st:.25,heat:10,ok:"The ref misses it. The fans don't.",no:"The ref catches it and warns {A}. Momentum gone."}]},
{id:'slug',w:2.5,sty:'br',text:"{A} and {B} stand toe-to-toe in the middle of the ring and start throwing bombs.",ch:[
 {t:"Slug it out until someone drops",s:'ring',d:.1,st:.5,fat:6,heat:8,ok:"Forearm for forearm. The crowd yells with every shot.",no:"{A} gets rocked and staggers into the corner."},
 {t:"A running lariat that turns {B} inside out",s:'ring',d:.1,st:.5,ok:"{B} does a full flip. Brutal.",no:"{B} ducks and {A} eats the turnbuckle."},
 {t:"Headbutt — the hardest head in the building",s:'luck',d:.05,st:.5,fat:3,ok:"Both are dazed, but {B} goes down first.",no:"That hurt {A} more than {B}."},
 {al:'f',t:"Fire up and no-sell {B}'s best shot",s:'pop',d:.15,st:.75,popA:3,ok:"{A} shakes their head and the crowd goes nuts. Here comes the comeback.",no:"{A} tries to fire up and walks right into another shot."},
 {al:'h',t:"Rake the eyes to escape the exchange",s:'luck',d:0,st:.25,heat:10,ok:"Cheap, effective, and hated.",no:"{B} blocks it and fires back even harder."}]},
{id:'show',w:2.5,sty:'sh',text:"{A} stops in the middle of the match to soak in the moment before the big move.",ch:[
 {t:"Hit the signature taunt, then the move",s:'pop',d:.1,st:.5,popA:2,ok:"The pose, the pop, the payoff. Perfect showmanship.",no:"{B} recovers mid-taunt and rolls {A} up for two."},
 {t:"Milk it — one more time for the crowd",s:'pop',d:.2,st:.75,popA:3,ok:"The crowd eats out of {A}'s hand. Main event aura.",no:"Milked it too long. {B} lands a cheap shot and takes over."},
 {t:"Skip the theatrics and finish it",always:1,st:.25,ok:"Business-like. Not memorable, but it works."},
 {al:'h',t:"Pose for the camera while {B} lies helpless",s:'mic',d:.05,st:.25,heat:10,ok:"The arrogance is unbearable. The boos are glorious.",no:"The camera cuts away and the moment is lost."}]},
{id:'catch',w:2,bsty:'fl',text:"{B} leaps off the top rope looking to end it — and flies straight into {A}'s arms.",ch:[
 {t:"Catch and counter into the finisher",s:'ring',d:.15,st:.75,ok:"Caught in mid-air and planted. The crowd can't believe it.",no:"{B} slips out the back and lands on their feet."},
 {t:"Catch {B} and toss them across the ring",sty:'pw|br',s:'ring',d:.05,st:.5,ok:"{B} bounces off the canvas like a rag doll.",no:"{B} twists free before {A} can throw them."},
 {t:"Let {B} crash and cover",always:1,st:.25,ok:"{B} hits nothing but canvas. {A} covers for a near-fall."},
 {al:'h',t:"Catch {B}, then drop them on the top turnbuckle",s:'ring',d:.1,st:.5,heat:12,ok:"A sickening landing. The crowd winces.",no:"{B} grabs the ropes and slides out."}]},
{id:'test',w:1.5,sty:'pw',bsty:'pw',text:"Two powerhouses lock up for a test of strength in the middle of the ring.",ch:[
 {t:"Win the test of strength outright",s:'ring',d:.15,st:.5,popA:2,ok:"{A} forces {B} to one knee. Pure brute force.",no:"{B} powers out and shoves {A} across the ring."},
 {t:"Collide with shoulder blocks until someone falls",s:'ring',d:.1,st:.5,fat:5,heat:6,ok:"On the fourth collision, {B} finally hits the mat.",no:"Neither budges. The crowd chants 'Both these guys!'"},
 {al:'h',t:"Kick {B} in the gut to break it",s:'luck',d:0,st:.25,heat:8,ok:"Cheap, but it works.",no:"{B} catches the leg."}]},
{id:'mat',w:1.5,sty:'te',bsty:'te',text:"Two technicians trade holds so fast the commentary team can't keep up.",ch:[
 {t:"Out-wrestle {B} with a counter to their counter",s:'ring',d:.2,st:.75,ok:"'This is wrestling!' chants fill the arena.",no:"{B} reads it and rolls through."},
 {t:"Stand off in the middle of the ring",always:1,st:.25,ok:"A standoff and a standing ovation."},
 {al:'f',t:"Shake hands after the exchange, then go at it again",s:'pop',d:.05,st:.5,popA:1,popB:1,ok:"Respect — and the crowd loves it.",no:"{B} slaps the hand away."},
 {al:'h',t:"Grab a handful of tights for the pin",s:'luck',d:.05,st:.25,heat:10,ok:"Two and a half before the ref notices. The crowd screams.",no:"The ref sees it immediately. Embarrassing."}]},
/* ---------- tags, trios and multi-person ---------- */
{id:'hottag',w:3,mt:'tag|trios|eight',need:'A2',text:"{A} is crawling toward the corner while {A2} reaches out, begging for the tag.",ch:[
 {t:"Hot tag! {A2} cleans house",s:'pop',d:.05,st:.75,popA:2,chemT:1,ok:"{A2} comes in like a house on fire. The crowd erupts.",no:"{B} pulls {A} back at the last second."},
 {t:"{B} cuts off the ring and drags {A} back",always:1,st:.25,heat:8,ok:"The heat segment continues. The crowd is desperate for a tag."},
 {al:'f',t:"{A2} leaps over the top rope to break up the pin",s:'ring',d:.1,st:.5,chemT:1,ok:"A save at two and a half. What a team.",no:"The ref cuts {A2} off and forces them back."},
 {al:'h',t:"{A2} distracts the ref while {A} gets a cheap shot in",s:'luck',d:.05,st:.5,heat:12,chemT:1,ok:"Textbook heel teamwork. The fans are furious.",no:"The ref turns around just in time."}]},
{id:'isolate',w:2.5,mt:'tag|trios|eight',need:'A2',text:"{A} and {A2} have {B} isolated in their corner, making quick tags.",ch:[
 {t:"Hit the double-team finisher",s:'ring',d:.15,st:.75,chemT:1,ok:"Timed to perfection. {B}'s partners can only watch.",no:"{B} slips out and {A} hits {A2} instead."},
 {t:"Keep {B} cut off with quick tags",always:1,st:.25,chemT:1,ok:"Smart, methodical tag team wrestling."},
 {al:'h',t:"Double-team {B} while the ref is distracted",s:'luck',d:.05,st:.5,heat:12,ok:"Illegal and effective.",no:"The ref catches them and forces {A2} out."},
 {al:'f',t:"Let {B} fight their way out, then tag in fresh",s:'pop',d:.1,st:.5,popA:1,ok:"A fair fight — and {A} still wins the exchange.",no:"{B} makes the tag and the tide turns."}]},
{id:'divetrain',w:2,mt:'trios|eight',text:"Everyone in the match is fighting at once, and the bodies are piling up on the floor.",ch:[
 {t:"Start a dive train — everyone flies",s:'ring',d:.15,st:1,fat:7,ok:"Dive after dive after dive. Social media will be on fire tonight.",no:"The last dive comes up short and someone crashes into the barricade."},
 {t:"Clear the ring and pose as a team",always:1,st:.25,chemT:1,ok:"A striking picture of unity."},
 {al:'h',t:"While everyone's outside, {A} steals a pin",s:'luck',d:.05,st:.5,heat:10,ok:"Opportunistic and smart.",no:"The ref is outside checking on everyone."}]},
{id:'tower',w:2.5,mt:'triple|four',text:"{B} and another competitor both have {A} set up in the corner for a tower of doom.",ch:[
 {t:"Take the tower of doom — everyone goes down",s:'ring',d:.2,st:.75,fat:8,ok:"Three bodies hit the mat at once. Everyone is on their feet.",no:"The timing is off and the spot looks clumsy."},
 {t:"{A} slips out and steals a pin",s:'luck',d:.05,st:.5,popA:2,ok:"The smartest wrestler in the match does the least work.",no:"{B} breaks it up at two."},
 {t:"Everyone pairs off and brawls",always:1,st:.25,ok:"Chaos everywhere."},
 {al:'h',t:"{A} throws another competitor out and covers",s:'luck',d:.05,st:.5,heat:10,ok:"Pure opportunism. The crowd hates it.",no:"The ref makes {A} wait while everyone recovers."}]},
/* ---------- stipulations ---------- */
{id:'ladder',w:3,stip:'ladder',text:"The ladder is standing in the middle of the ring and {A} and {B} are climbing opposite sides.",ch:[
 {t:"Slug it out at the very top",s:'ring',d:.2,st:1,fat:8,failInj:'A',ok:"Punches at the top of the ladder with the prize dangling above. Breathtaking.",no:"The ladder topples and {A} lands hard."},
 {t:"Tip the ladder and send {B} flying",s:'ring',d:.1,st:.75,heat:10,ok:"{B} crashes into the ropes. Scary.",no:"{B} leaps off before it falls."},
 {t:"Climb down and use the ladder as a weapon",s:'ring',d:.05,st:.5,heat:8,ok:"A ladder shot to the ribs. {B} is folded in half.",no:"{B} kicks the ladder back into {A}'s face."},
 {sty:'fl',t:"Dive off the top of the ladder onto everyone",s:'ring',d:.2,st:1,fat:10,failInj:'A',popA:3,ok:"The dive of the year. The fans are losing their minds.",no:"{A} crashes. Medics are checking on them."}]},
{id:'cage',w:3,stip:'cage',text:"{B} is climbing out over the top of the cage.",ch:[
 {t:"Drag {B} back down by the hair",s:'ring',d:.1,st:.5,heat:8,ok:"{B} comes crashing back into the ring.",no:"{B} kicks {A} away and keeps climbing."},
 {t:"Climb up after them and fight on top of the cage",s:'ring',d:.2,st:1,fat:10,failInj:'A',ok:"Two wrestlers brawling on top of the steel. The crowd can't breathe.",no:"{A} slips and falls back into the ring."},
 {t:"Superplex {B} off the top of the cage",s:'ring',d:.25,st:1,fat:10,failInj:'A',ok:"The ring collapses on impact. This one's going on the highlight reel forever.",no:"{B} blocks it and {A} crashes to the mat."},
 {al:'h',t:"Slam the cage door into {B}'s head",s:'luck',d:0,st:.5,heat:12,ok:"The clang echoes around the building.",no:"{B} ducks and {A} catches their own hand in the door."}]},
{id:'tables',w:3,stip:'tables',text:"{A} slides a table into the ring and sets it up in the corner.",ch:[
 {t:"Powerbomb {B} through the table",sty:'pw|br',s:'ring',d:.1,st:.75,ok:"The table explodes. So does the crowd.",no:"{B} back-drops {A} over the top instead."},
 {t:"Leg drop {B} through the table from the top rope",sty:'fl|sh|te',s:'ring',d:.2,st:.75,fat:6,failInj:'A',ok:"From the top rope, through the table. Carnage.",no:"{B} rolls away and {A} goes through it alone."},
 {t:"Set up a second table for a bigger spot",s:'luck',d:.1,st:.5,ok:"Two tables, one spot, huge reaction.",no:"The tables collapse before anyone goes through them."},
 {al:'h',t:"Spray lighter fluid on the table",s:'luck',d:.1,st:.75,heat:16,ok:"The crowd gasps. Even commentary is horrified.",no:"Officials put it out before {A} can use it."}]},
{id:'weapons',w:3,stip:'hard',text:"{A} reaches under the ring and pulls out a bag full of weapons.",ch:[
 {t:"Kendo stick shots to the back",s:'ring',d:.05,st:.5,heat:8,ok:"Every shot echoes. The crowd winces along.",no:"{B} catches the stick and turns it around."},
 {t:"Pour out the thumbtacks",s:'luck',d:.1,st:.75,heat:12,fat:4,ok:"Somebody's going in the tacks — and it's {B}.",no:"{A} ends up in their own thumbtacks."},
 {t:"Trash can lid duel",s:'pop',d:.05,st:.5,ok:"Clang, clang, clang. The crowd chants along.",no:"The lids go flying into the crowd."},
 {al:'f',vs:'h',t:"Use {B}'s own favorite weapon against them",s:'ring',d:.1,st:.75,popA:3,heat:10,ok:"Poetic justice. The crowd erupts.",no:"{B} knows exactly how it works and gets the upper hand."},
 {al:'h',t:"Wrap barbed wire around a baseball bat",s:'luck',d:.1,st:.75,heat:16,ok:"The crowd goes silent. This just became personal.",no:"The ref snatches it away before it gets used."}]},
{id:'iquit',w:3,stip:'iquit',text:"{A} has {B} trapped in a submission and shoves the microphone in their face.",ch:[
 {t:"Crank it harder until {B} says it",s:'ring',d:.15,st:.75,heat:12,ok:"{B} screams, but refuses. Incredible drama.",no:"{B} powers out and grabs the mic."},
 {t:"Let {B} speak — and they spit defiance",always:1,st:.5,heat:10,ok:"'NEVER!' The crowd rallies behind {B}."},
 {al:'h',t:"Threaten {B}'s friend at ringside",s:'mic',d:.1,st:.75,heat:18,ok:"{B} says the words to protect their friend. The crowd is disgusted.",no:"The friend fights back and {B} escapes."},
 {al:'f',t:"Demand {B} admit what they did",vs:'h',s:'mic',d:.1,st:.75,popA:2,heat:10,ok:"{B} is broken. The crowd has waited months for this.",no:"{B} laughs even in agony."}]},
{id:'count10',w:3,stip:'lms|texas',text:"{B} is down. The referee is counting… six… seven… eight…",ch:[
 {t:"{B} uses the ropes to stagger up at nine",always:1,st:.5,popB:2,ok:"Up at nine! The crowd is on its feet."},
 {t:"{A} hits one more big move to make sure",s:'ring',d:.1,st:.5,fat:5,ok:"No getting up from that.",no:"{B} catches the move and they both go down."},
 {al:'h',t:"Pile ring steps and debris on top of {B}",s:'luck',d:.05,st:.5,heat:14,ok:"{B} is buried under steel. Horrific — and effective.",no:"{B} kicks the pile off at nine."},
 {al:'f',t:"{A} rises to their own feet and stares {B} down",s:'pop',d:.1,st:.5,popA:2,ok:"The picture of resilience.",no:"{A} stumbles and goes back down."}]},
{id:'falls',w:3,stip:'iron|twoof3',text:"The falls are tied and time is running out.",ch:[
 {t:"Go for broke with everything left",s:'ring',d:.2,st:.75,fat:8,ok:"The final minutes are an all-out sprint. Instant classic.",no:"Exhaustion takes over and the finish is sloppy."},
 {t:"Trade near-falls to the final bell",s:'ring',d:.1,st:.5,fat:5,ok:"Every count is two-and-a-half. The crowd is losing its voice."},
 {al:'h',t:"Stall and try to sit on the lead",s:'luck',d:.05,st:.25,heat:12,ok:"{A} runs the clock with every dirty trick they know.",no:"The ref forces the action and {A} gets caught."},
 {al:'f',t:"Dig deep for one last flurry",s:'pop',d:.1,st:.75,popA:3,ok:"The crowd counts down the seconds with {A}.",no:"{B} counters and time expires."}]},
{id:'ropes',w:3,stip:'sub',text:"{A} locks in a submission in the middle of the ring — {B} is inches from the ropes, but ropes don't save you here.",ch:[
 {t:"Transition into an even nastier hold",s:'ring',d:.15,st:.75,ok:"Chain submission after chain submission. {B} has nowhere to go.",no:"{B} slips out during the transition."},
 {t:"Drag {B} back to the center of the ring",s:'ring',d:.1,st:.5,ok:"Nowhere to hide.",no:"{B} kicks free."},
 {al:'h',t:"Use the ropes for extra leverage",s:'luck',d:.05,st:.5,heat:10,ok:"The ref can't see it from that side. Villainous.",no:"The ref catches it and makes {A} break."}]},
{id:'crowdfight',w:2,stip:'falls|stampede|anarchy|street',text:"{A} and {B} fight up the aisle and into the concession stands.",ch:[
 {t:"Brawl through the crowd to the merch stand",s:'ring',d:.1,st:.5,fat:6,ok:"Merch, beer and bodies everywhere. Glorious chaos.",no:"Security has to step in to protect the fans."},
 {t:"Take it backstage — through the catering tables",s:'luck',d:.1,st:.75,fat:6,ok:"The cameras follow them through catering. Instant classic TV.",no:"The cameras lose them backstage."},
 {al:'f',t:"Let a fan hand {A} a weapon",s:'pop',d:.1,st:.5,popA:2,ok:"The fan becomes a legend.",no:"The 'weapon' is a foam finger."},
 {al:'h',t:"Throw a drink in a fan's face on the way past",s:'luck',d:0,st:.25,heat:8,ok:"Instant heat.",no:"The fan throws it right back."}]},
/* ---------- face / heel dynamics ---------- */
{id:'beg',w:2.5,al:'f',vs:'h',text:"{B} backs into the corner, hands up, begging {A} for mercy.",ch:[
 {t:"Back off honorably — and brace for the cheap shot",always:1,st:.25,heat:8,ok:"{B} tries the eye poke, but {A} sees it coming and fires back."},
 {t:"Ignore the plea and unload",s:'pop',d:.05,st:.5,popA:2,heat:10,ok:"Ten punches in the corner. The crowd counts every one.",no:"{B} slips out and escapes to the floor."},
 {t:"Drag {B} to the center of the ring and finish it",s:'ring',d:.1,st:.5,ok:"No escape. Justice served.",no:"{B} rolls to the apron and escapes."}]},
{id:'cowardout',w:2,al:'f',vs:'h',text:"{B} bails out of the ring and heads up the ramp, trying to take the count-out loss.",ch:[
 {t:"Chase {B} down and drag them back",s:'ring',d:.1,st:.5,popA:2,heat:8,ok:"{A} hauls {B} back to the ring by their hair.",no:"{B} makes it through the curtain. Count-out."},
 {t:"Dive onto {B} on the ramp",sty:'fl|sh',s:'ring',d:.15,st:.75,fat:6,popA:2,ok:"A flying tackle on the stage. {B} isn't going anywhere.",no:"{A} misses and {B} slips away."},
 {t:"Let {B} go and win by count-out",always:1,st:-.25,ok:"A win is a win, but the fans wanted more."}]},
{id:'homecrowd',w:2,al:'h',vs:'f',text:"{B}'s comeback has the whole building on its feet — the fans can smell a win.",ch:[
 {t:"Cut the comeback off with a cheap shot",s:'luck',d:.05,st:.5,heat:12,ok:"The air goes out of the building. Masterful villainy.",no:"{B} blocks it and keeps rolling."},
 {t:"Shush the crowd, then slap {B}",s:'mic',d:.1,st:.5,heat:14,ok:"Pure disrespect. The crowd is ready to riot.",no:"{B} slaps back harder."},
 {t:"Roll out of the ring and regroup",always:1,st:.25,heat:6,ok:"{A} takes a breather while the crowd boos."},
 {t:"Use the referee as a human shield",s:'luck',d:.1,st:.5,heat:10,ok:"{B} pulls up and {A} strikes from behind the ref.",no:"The ref steps aside."}]},
{id:'duel',w:2,al:'f',vs:'f',text:"The crowd duels: half chanting for {A}, half for {B}.",ch:[
 {t:"Trade strikes in time with the chants",s:'ring',d:.1,st:.75,fat:5,ok:"Every hit lands with a chant. The crowd is part of the match.",no:"The rhythm breaks and the chant dies out."},
 {t:"Trade signature moves back and forth",s:'ring',d:.15,st:.75,ok:"Each counter is better than the last.",no:"A botched exchange takes the air out."},
 {t:"Acknowledge each other before the finish",always:1,st:.25,popA:1,popB:1,ok:"A nod of respect. The crowd applauds."}]},
{id:'twoheels',w:2,al:'h',vs:'h',text:"{A} and {B} both go for the same foreign object at the same time.",ch:[
 {t:"Tug-of-war over it — until the ref grabs it",always:1,st:.25,heat:8,ok:"The ref confiscates it. Both are furious."},
 {t:"{A} gets it first and makes it count",s:'luck',d:.05,st:.5,heat:12,ok:"{A} won the cheating contest.",no:"{B} yanks it away and uses it first."},
 {t:"Both get caught and the ref throws it out",dq:1,always:1,st:-.25,nc:1,heat:15,ok:"The ref has had enough of both of them."}]},
{id:'hope2',w:2,al:'f',und:1,text:"{A} has been beaten from pillar to post, but refuses to stay down.",ch:[
 {t:"Small package out of nowhere",s:'luck',d:.05,st:.5,popA:3,ok:"One… two… so close! The crowd believes.",no:"{B} kicks out at one and a half."},
 {t:"Fight back with everything left",s:'pop',d:.15,st:.75,popA:3,ok:"The underdog is rallying. The whole building is behind {A}.",no:"{B} cuts it off with one big shot."},
 {t:"Survive to fight another day",always:1,st:.25,popA:1,ok:"{A} lost, but the fans won't forget that fight."}]},
{id:'clinic',w:2,star:1,text:"{A} slows the pace and puts on a clinic — a big star showing why they're at the top.",ch:[
 {t:"Break out a move nobody expected",s:'ring',d:.15,st:.75,popA:2,ok:"The crowd gasps. Superstar stuff.",no:"The fancy move doesn't quite connect."},
 {t:"Let {B} get their shine, then shut it down",always:1,st:.5,popB:2,ok:"A generous veteran performance. {B} looks like a player."},
 {al:'h',t:"Make {B} look foolish in front of everyone",s:'mic',d:.1,st:.5,heat:10,ok:"Arrogant, dominant and hated.",no:"{B} catches {A} being cocky."}]},
{id:'blood',w:1.5,big:1,text:"{B} is busted open. The crowd is stunned and the referee is checking the cut.",ch:[
 {t:"Keep going — this is a fight now",s:'ring',d:.1,st:.75,heat:10,ok:"Grit and blood. An unforgettable war.",no:"The doctor steps in and the match looks shaky."},
 {t:"Take it home quickly",always:1,st:.25,ok:"A fast finish."},
 {al:'h',t:"{A} targets the cut",s:'ring',d:.05,st:.5,heat:15,ok:"Relentless and cruel.",no:"{B} fires back with fury."},
 {al:'f',t:"{A} backs off until {B} says they're fine",s:'pop',d:.05,st:.25,popA:2,ok:"The fans applaud {A}'s decency.",no:"{B} takes advantage of the pause."}]},
{id:'bell',w:1,text:"The timekeeper rings the bell by mistake! Nobody knows if the match is over.",ch:[
 {t:"Restart and keep going",always:1,st:0,ok:"Confusion, then back to business."},
 {t:"{A} rolls {B} up while everyone's confused",s:'luck',d:.05,st:.25,ok:"Three! Or was it? The ref counts it.",no:"The ref waves it off."},
 {al:'h',t:"{A} celebrates like they won and heads to the back",s:'mic',d:.05,st:.25,heat:10,ok:"The ref drags {A} back. The crowd laughs at them.",no:"{A} gets counted out while arguing."}]},
{id:'mic2',w:1.5,sty:'sh',al:'h',text:"{A} grabs a mic from the timekeeper in the middle of the match.",ch:[
 {t:"Insult {B} while they're down",s:'mic',d:.1,st:.5,heat:12,ok:"The crowd is outraged — and hooked.",no:"{B} gets up and knocks the mic out of {A}'s hand."},
 {t:"Ask the crowd if they want to see {B} lose",s:'mic',d:.05,st:.25,heat:8,ok:"The boos are deafening.",no:"The crowd shouts back 'NO!' and rallies {B}."},
 {t:"Drop the mic and hit the finisher",s:'ring',d:.1,st:.5,ok:"Talk and action. Effective.",no:"{B} ducks."}]},
{id:'partner',w:1.5,mt:'tag|trios|eight',need:'A2',text:"{A2} hesitates on the apron. Something isn't right between {A} and {A2}.",ch:[
 {t:"{A2} makes the tag anyway",always:1,st:.25,chemT:1,ok:"Crisis averted — for now."},
 {t:"{A2} jumps off the apron and leaves {A} alone",s:'luck',d:.05,st:.5,heatT:15,chemT:-2,ok:"The crowd gasps. Is this the end of the team?",no:"{A2} comes back at the last second."},
 {al:'f',t:"{A} convinces {A2} to stick together",s:'pop',d:.05,st:.5,chemT:2,ok:"A heartfelt moment — and it wins them the match.",no:"{A2} isn't convinced."},
 {al:'h',t:"{A} shoves {A2}, blaming them for everything",s:'mic',d:.1,st:.5,heatT:12,chemT:-1,ok:"Cracks in the team. The crowd is buzzing.",no:"{A2} shoves back."}]},
{id:'intimidate',w:1.5,sty:'pw|br',bsty:'fl|te|sh',text:"{A} towers over {B} and just stares down at them. {B} takes a step back.",ch:[
 {t:"Squash {B} with pure power",s:'ring',d:.05,st:.25,popA:1,ok:"Dominant. Nobody's getting up from that.",no:"{B} uses speed to escape."},
 {t:"Let {B} bounce off, then flatten them",always:1,st:.5,ok:"Irresistible force, very movable object."},
 {al:'h',t:"Laugh at {B} and slap them",s:'mic',d:.05,st:.25,heat:10,ok:"Humiliating.",no:"{B} slaps back. Uh oh."},
 {al:'f',t:"Offer {B} the first shot",s:'pop',d:.05,st:.25,popA:1,ok:"{B} hits hard and {A} doesn't flinch.",no:"{B} catches {A} off guard."}]}];

const TWISTS_MORE=[
{when:'any',sty:'fl',text:"The crowd starts chanting 'This is awesome!' for a dive {A} hasn't even done yet.",ch:[{t:"Do a quick flip off the turnbuckle for them",s:'ring',d:.1,p:3,ok:"Gravity-defying. The crowd is thrilled."},{t:"Promise them something bigger on Sunday",s:'mic',d:.1,p:2},{al:'h',t:"Tell them they'll have to pay-per-view to see it",s:'mic',d:.05,p:2,ok:"Boos — and more buys."}]},
{when:'any',sty:'pw',text:"A ring crew member dares {A} to lift the steel ring steps.",ch:[{t:"Lift them over their head",s:'ring',d:.1,p:3,ok:"The steps go up. So does the crowd."},{t:"Toss them into the aisle",s:'ring',d:.05,p:2},{al:'h',t:"Throw the steps at the ring crew member",s:'luck',d:.05,p:2,ok:"Pure menace. The crowd boos."}]},
{when:'any',sty:'te',text:"A heckler yells that {A} is boring.",ch:[{t:"Explain wrestling fundamentals, slowly",s:'mic',d:.15,p:3,ok:"Weirdly captivating."},{t:"Demonstrate a hold on the ring announcer",s:'ring',d:.05,p:2},{al:'h',t:"Put the heckler in an arm bar over the barricade",s:'luck',d:.1,p:2,ok:"Security drags {A} off. The crowd is furious."}]},
{when:'any',sty:'br',text:"Someone throws a drink at {A} from the crowd.",ch:[{t:"Climb the barricade after them",s:'ring',d:.1,p:2},{t:"Laugh, wipe it off and keep talking",s:'mic',d:.05,p:3,ok:"Unbothered. That's a tough customer."},{al:'f',t:"Hand the fan a new drink",s:'pop',d:.05,p:3,ok:"A class move. The crowd cheers."}]},
{when:'any',sty:'sh',text:"The big screen glitches and starts playing {A}'s entrance video.",ch:[{t:"Dance along to their own music",s:'pop',d:.05,p:3},{t:"Play it off like it was planned",s:'mic',d:.1,p:2},{al:'h',t:"Demand the tech crew play it again, louder",s:'mic',d:.05,p:2}]},
{when:'any',held:1,text:"Someone in the front row is waving a fake {T} title belt.",ch:[{t:"Hold the real one up next to it",s:'pop',d:.05,p:3},{al:'f',t:"Invite the fan into the ring for a photo",s:'pop',d:.1,p:4,ok:"A moment that fan will never forget."},{al:'h',t:"Snatch the fake and snap it over their knee",s:'ring',d:.05,p:2,ok:"The fan is crushed. The boos are huge."}]},
{when:'any',held:1,x:1,text:"{X} appears on the stage holding up a contract with the {T} title written on it.",ch:[{t:"Tell {X} to get in line",s:'mic',d:.1,hx:10,p:2},{t:"Sprint up the ramp to confront {X}",s:'ring',d:.1,hx:14,p:2},{t:"Hold the belt higher and ignore {X}",s:'pop',d:.05,hx:6,p:2}]},
{when:'any',fac:1,text:"{F} marches down the ramp uninvited to back {A} up.",ch:[{t:"Welcome them into the ring",s:'pop',d:.05,p:3,c:2},{t:"Tell them to wait in the back",s:'mic',d:.1,p:2},{al:'h',t:"Make them kneel before {A}",s:'mic',d:.1,p:2,ok:"A power move. The crowd boos."}]},
{when:'any',x:1,text:"{X} appears on the big screen with a pre-recorded message for {A}.",ch:[{t:"Stare at the screen until it ends",s:'pop',d:.05,hx:8,p:2},{t:"Interrupt the message with a comeback",s:'mic',d:.1,hx:12,p:3},{t:"Throw the mic at the screen",s:'luck',d:0,hx:10,p:1}]},
{when:'any',al:'f',star:1,text:"The crowd starts chanting 'You deserve it!'",ch:[{t:"Take it all in",s:'pop',d:.05,p:3},{t:"Get emotional and thank them",s:'mic',d:.1,p:4},{t:"Promise them one more big moment",s:'mic',d:.1,p:3}]},
{when:'any',al:'f',und:1,text:"Nobody expected {A} to be out here — but the crowd starts warming up to them.",ch:[{t:"Ride the wave",s:'pop',d:.1,p:4,ok:"A star might be born tonight."},{t:"Stay humble",s:'mic',d:.05,p:2},{t:"Promise to prove everyone wrong",s:'mic',d:.1,p:3}]},
{when:'any',al:'h',und:1,text:"The crowd laughs at {A}. Not with — at.",ch:[{t:"Demand respect",s:'mic',d:.15,p:2,ok:"The laughter turns to boos. Progress."},{t:"Storm off",s:'luck',d:0,p:1},{t:"Laugh louder than them",s:'mic',d:.1,p:3,ok:"Unhinged. The crowd isn't sure what to do."}]},
{when:'any',al:'h',star:1,text:"A section of the crowd is secretly cheering {A}.",ch:[{t:"Point at them and demand silence",s:'mic',d:.1,p:3},{t:"Pretend not to notice",s:'luck',d:0,p:1},{t:"Insult the people cheering too",s:'mic',d:.1,p:3,ok:"They cheer even harder. Cool heel."}]},
{when:'duo',nff:1,text:"{B} throws their jacket into {A}'s face.",ch:[{t:"Toss the jacket into the crowd",s:'pop',d:.05,h:8,p:2},{t:"Brawl through the ropes",s:'ring',d:.1,h:14,p:1},{t:"Put it on and mock {B}",s:'mic',d:.1,h:10,p:3}]},
{when:'duo',al:'f',vs:'f',text:"{B} offers {A} a fist bump mid-promo.",ch:[{t:"Bump it — respect",s:'pop',d:0,h:4,p:3},{t:"Leave them hanging — this is competition",s:'mic',d:.1,h:9,p:2},{t:"Bump it, then say 'see you in the ring'",s:'mic',d:.05,h:6,p:3}]},
{when:'duo',al:'h',vs:'f',text:"{B}'s music plays again — the crowd wants {A} gone.",ch:[{t:"Run off and taunt from the ramp",s:'mic',d:.05,h:8,p:2},{t:"Hold your ground and demand the music stops",s:'mic',d:.1,h:10,p:2},{t:"Attack {B} during their entrance",s:'ring',d:.1,h:16,p:1}]},
{when:'duo',al:'f',vs:'h',text:"{B}'s associates appear on the ramp.",ch:[{t:"Stand your ground — let them come",s:'ring',d:.15,h:14,p:3,ok:"{A} fights them all off. Hero."},{t:"Back off and live to fight another day",s:'luck',d:0,h:4,p:1},{t:"Challenge them all to a match",s:'mic',d:.1,h:10,p:2}]},
{when:'duo',al:'h',vs:'h',text:"{A} and {B} both try to take credit for the last big moment on the show.",ch:[{t:"Claim it loudly",s:'mic',d:.1,h:10,p:2},{t:"Suggest an uneasy alliance",s:'mic',d:.1,h:4,c:2,p:2},{t:"Shove {B} out of the ring",s:'ring',d:.05,h:12,p:1}]},
{when:'solo',text:"Someone in the back starts pounding on the curtain — the locker room is listening.",ch:[{t:"Address the locker room directly",s:'mic',d:.1,p:3},{t:"Let the moment breathe",s:'luck',d:0,p:1},{al:'h',t:"Tell them nobody is safe",s:'mic',d:.1,p:3}]},
{when:'any',text:"The camera catches a famous musician in the front row.",ch:[{t:"Shout them out",s:'pop',d:.05,p:3},{t:"Invite them into the ring",s:'mic',d:.15,p:4,ok:"A viral moment."},{al:'h',t:"Insult their music",s:'mic',d:.05,p:2,ok:"Heat from their fans too."}]},
{when:'any',text:"A kid in a homemade costume of {A} is on their dad's shoulders in the front row.",ch:[{al:'f',t:"Give the kid a high five",s:'pop',d:0,p:3},{al:'f',t:"Mimic the kid's pose",s:'pop',d:.05,p:4},{al:'h',t:"Tell the kid to go home and get a real hero",s:'mic',d:.05,p:2,ok:"The dad looks livid."},{al:'h',t:"Pretend not to see them — but the camera catches a little smile",s:'luck',d:.1,p:3}]},
{when:'any',text:"The lights flicker. Something's wrong with the building's power.",ch:[{t:"Keep talking in the dark",s:'mic',d:.15,p:3,ok:"Hundreds of phone lights come on. Incredible."},{t:"Wait it out",s:'luck',d:0,p:1},{t:"Use the dark to disappear",s:'luck',d:.05,p:2}]}];

/* extra promo openers and choices, by promo type — merged into SCENES */
const SCENES_MORE={
callout:{solo:{texts:[
 {al:'f',t:"{A} jogs down the aisle, slapping every outstretched hand, and grabs a mic with a grin."},
 {al:'h',t:"{A} walks out flanked by security they definitely didn't need and demands the lights come up."},
 {und:1,t:"{A} walks out to a surprised crowd. It's been a while since they've had a mic in their hand."},
 {star:1,t:"{A}'s music hits and the crowd rises. The biggest star in the building has something to say."}],ch:[
 {sty:'te',t:"Break down exactly how they'd dismantle anyone in the back",s:'mic',d:.15,p:3,ok:"Surgical. The locker room is taking notes.",no:"Too technical. The crowd drifts."},
 {sty:'br',t:"Promise to fight anyone, anywhere, tonight",s:'ring',d:.05,p:2,ok:"The crowd loves a fighter.",no:"Nobody answers. {A} is left staring at the ramp."},
 {sty:'fl',t:"Promise to do something nobody's ever seen",s:'pop',d:.1,p:3,ok:"The crowd is buzzing to see it.",no:"The promise sounds like bluster."},
 {sty:'pw',t:"Flip the announce desk to make a point",s:'ring',d:.05,p:2,ok:"Monitors everywhere. Point made.",no:"The desk barely budges."},
 {sty:'sh',t:"Turn the promo into a full-on show",s:'pop',d:.15,p:4,ok:"Music, pyro, a dance — the crowd is on their feet.",no:"Too much. The crowd waits it out."},
 {und:1,al:'f',t:"Admit nobody believed in them — then promise to prove it",s:'mic',d:.1,p:4,ok:"A rallying cry for every underdog in the building.",no:"The crowd isn't sure they believe it either."},
 {und:1,al:'h',t:"Blame the office for holding them down",s:'mic',d:.1,p:3,ok:"Bitter and compelling. The boos have an edge.",no:"It sounds like whining."},
 {star:1,al:'h',t:"Remind the fans who pays for their tickets",s:'mic',d:.1,p:3,ok:"Arrogant and true. The crowd hates it.",no:"The crowd chants that {A} is overrated."},
 {star:1,al:'f',t:"Promise this is the best they've ever been",s:'mic',d:.1,p:3,ok:"The crowd believes every word.",no:"A little too humble to be convincing."},
 {al:'f',t:"Invite the whole crowd to sing their entrance",s:'pop',d:.05,p:3,ok:"Twenty thousand voices, one song.",no:"The crowd isn't sure of the words."},
 {al:'h',t:"Take a selfie with the boos in the background",s:'luck',d:.05,p:2,ok:"The selfie goes viral with a new caption: 'most hated'.",no:"The phone falls off the ring apron."}]},
 duo:{texts:[
 {al:'f',vs:'h',t:"{A} walks out holding a folder of {B}'s dirty tricks."},
 {al:'h',vs:'f',t:"{A} interrupts {B}'s victory celebration and starts clapping, slowly."},
 {al:'f',vs:'f',t:"{A} walks out and points at the sign in the arena: '{B} vs {A} — WHO'S BETTER?'"},
 {al:'h',vs:'h',t:"{A} storms out, furious that {B} is getting all the attention."}],ch:[
 {nff:1,t:"Promise to take something from {B}",s:'mic',d:.1,h:12,p:2,ok:"The stakes just got personal.",no:"{B} laughs it off."},
 {al:'f',vs:'h',t:"Read out {B}'s crimes from the folder",s:'mic',d:.15,h:14,p:3,ok:"The crowd boos every line. {B} is squirming.",no:"The list goes on too long."},
 {al:'f',vs:'h',t:"Tell {B} there's nowhere left to hide",s:'mic',d:.1,h:12,p:3,ok:"The crowd roars. {B} looks rattled.",no:"{B} smirks and walks off."},
 {al:'h',vs:'f',t:"Say {B}'s fans will be crying by the end of the night",s:'mic',d:.1,h:14,p:2,ok:"The crowd is ready to riot.",no:"The crowd laughs at the threat."},
 {al:'h',vs:'f',t:"Slap {B} across the face — then run",s:'luck',d:.05,h:16,p:1,ok:"Cowardly and infuriating. Perfect.",no:"{B} catches {A} before they reach the ramp."},
 {al:'f',vs:'f',t:"Challenge {B} to prove it in the ring, winner takes the spotlight",ch:1,s:'mic',d:.05,h:10,p:3,ok:"Two good guys, one ring. The crowd can't wait.",no:"The challenge sounds half-hearted."},
 {al:'f',vs:'f',t:"Admit {B} is great — but not as great as {A}",s:'mic',d:.1,h:9,p:3,ok:"Confident but respectful. Everyone wants this match.",no:"It sounds arrogant."},
 {al:'h',vs:'h',t:"Offer {B} a partnership — with {A} in charge",s:'mic',d:.15,h:12,p:2,ok:"{B} is insulted. Great television.",no:"{B} isn't listening."},
 {sty:'pw|br',nff:1,t:"Drag {B} out of the back by force",s:'ring',d:.15,h:16,p:1,ok:"Raw power. The crowd is stunned.",no:"Security stops {A} at the curtain."}]}},
attack:{duo:{texts:[
 {al:'h',t:"{B} is saying goodbye to their family in the parking lot when {A} pulls up."},
 {al:'f',vs:'h',t:"{B} is gloating in the ring about their last win when {A}'s music hits."},
 {al:'f',vs:'f',t:"{B} is shaking hands with fans at ringside when {A} comes running down the ramp to make a point."}],ch:[
 {al:'f',vs:'f',t:"Jump {B} to prove a point — then offer a hand up",s:'mic',d:.1,h:12,p:2,ok:"Respect, with an edge. Game on.",no:"{B} slaps the hand away."},
 {al:'f',vs:'f',t:"Hit {B} with their own finisher to send a message",s:'ring',d:.15,h:14,p:3,ok:"The crowd is shocked, but loves it.",no:"{B} counters into their own finisher."},
 {al:'f',vs:'f',t:"Stand tall over {B} with the crowd split down the middle",s:'pop',d:.05,h:10,p:2,ok:"Half the crowd cheers, half boos. Fascinating.",no:"The crowd isn't sure what they just saw."},
 {al:'h',t:"Throw {B} into the side of a car",s:'ring',d:.1,h:20,p:1,ok:"The dent is still in the door. Horrifying.",no:"{B} rolls under the car and escapes."},
 {sty:'pw',nff:1,t:"Powerbomb {B} through the announce table",s:'ring',d:.15,h:22,p:2,ok:"The desk explodes and commentary runs for cover.",no:"{B} slips free and leaves {A} standing alone."},
 {sty:'fl',nff:1,t:"Dive off the stage onto {B}",s:'ring',d:.2,h:18,p:2,ok:"A jaw-dropping leap. {B} doesn't see it coming.",no:"{B} steps aside at the last second."},
 {sty:'te',nff:1,t:"Lock in a submission until the refs pull them off",s:'ring',d:.1,h:16,p:1,ok:"Calculated violence. {B} has to be helped out.",no:"{B} fights free."},
 {al:'h',t:"Attack {B}, then pose with {B}'s gear",s:'luck',d:.05,h:14,p:2,ok:"Humiliating.",no:"{A} drops the gear and has to run."},
 {al:'f',vs:'h',t:"Save a young wrestler {B} was bullying",s:'pop',d:.05,h:10,p:4,ok:"A hero moment. The crowd erupts.",no:"{B} escapes before {A} can land a shot."}]}},
interview:{solo:{texts:[
 {star:1,t:"The lights dim and {A} sits in a leather chair for a career-spanning interview."},
 {und:1,t:"{A} sits down nervously — it's their first big interview."},
 {sty:'br',t:"{A} does the interview from the gym, sweat dripping."}],ch:[
 {und:1,t:"Talk about the long road to get here",s:'mic',d:.1,p:4,ok:"The crowd feels every mile of it.",no:"It rambles."},
 {star:1,t:"Reflect on what's left to prove",s:'mic',d:.1,p:3,ok:"Surprisingly vulnerable. The fans lean in.",no:"It sounds like a retirement speech."},
 {star:1,al:'h',t:"List everything {A} has won and dare anyone to match it",s:'mic',d:.05,p:3,ok:"Unbearably smug.",no:"The list has gaps and the crowd notices."},
 {al:'f',t:"Talk about who they wrestle for",s:'mic',d:.1,p:4,ok:"Emotional and sincere.",no:"It gets a little sappy."},
 {al:'h',t:"Answer every question with 'next question'",s:'mic',d:.1,p:2,ok:"Infuriating. The crowd boos every 'next question'.",no:"The interviewer walks out. Awkward."},
 {sty:'sh',t:"Turn the interview into a stand-up bit",s:'mic',d:.15,p:3,ok:"The crowd is in stitches.",no:"Nobody laughs."},
 {sty:'te',t:"Break down tape of their last match",s:'mic',d:.1,p:2,ok:"A master class. The hardcore fans love it.",no:"Too long, too technical."}]},
 duo:{texts:[
 {al:'f',vs:'h',t:"{A} sits across from {B}, who won't stop smirking."},
 {al:'f',vs:'f',t:"{A} and {B} sit side-by-side with mutual respect — and a match to sell."}],ch:[
 {al:'f',vs:'f',t:"Talk about the history between them",s:'mic',d:.1,h:8,p:3,ok:"The crowd wants to see this match even more.",no:"It meanders."},
 {al:'f',vs:'f',t:"Point out {B}'s one weakness, respectfully",s:'mic',d:.15,h:10,p:2,ok:"A competitive edge creeps in.",no:"{B} shrugs it off."},
 {al:'f',vs:'h',t:"Keep calm while {B} tries to get under their skin",s:'mic',d:.15,h:9,p:3,ok:"{A} stays cool. {B} looks petty.",no:"{A} loses their temper."},
 {al:'h',vs:'f',t:"Tell {B} they're only popular because they're nice",s:'mic',d:.1,h:10,p:2,ok:"The crowd boos. {B} takes it personally.",no:"The insult is weak."},
 {sty:'te',t:"Explain move by move how the match will go",s:'mic',d:.15,h:9,p:2,ok:"Chillingly specific.",no:"It sounds robotic."}]}},
contract:{duo:{texts:[
 {al:'f',vs:'h',t:"The contract signing is set up in the ring. {B} is already sitting, smirking."},
 {al:'h',vs:'f',t:"{A} arrives at the contract signing with a lawyer."}],ch:[
 {al:'f',vs:'f',t:"Sign it and shake hands — may the best one win",s:'pop',d:.05,h:6,p:3,ok:"A classy moment. Everyone wants to see the match.",no:"{B} leaves them hanging."},
 {al:'h',t:"Have the lawyer add fine print",s:'mic',d:.15,h:14,p:2,ok:"{B} signs without reading. Uh oh.",no:"{B} catches the fine print."},
 {al:'f',vs:'h',t:"Refuse to sign until {B} apologizes to the fans",s:'mic',d:.1,h:12,p:3,ok:"{B} squirms. The crowd chants 'SAY IT!'",no:"{B} refuses and walks off."},
 {sty:'pw',nff:1,t:"Press {B} over their head and drop them on the table",s:'ring',d:.15,h:20,p:2,ok:"The table buckles under {B}. Violence signed and sealed.",no:"{B} slips free."}]}},
rally:{solo:{texts:[
 {fac:1,t:"{F} marches down the ramp in formation."},
 {al:'h',fac:1,t:"{F} storms out and surrounds the ring. {A} holds the mic."}],ch:[
 {fac:1,t:"Introduce every member of {F}",s:'pop',d:.05,p:2,c:2,ok:"Everyone gets their moment. Strong unit.",no:"The introductions drag."},
 {fac:1,al:'f',t:"Promise {F} will protect the locker room",s:'mic',d:.1,p:3,c:2,ok:"A band of heroes.",no:"It sounds cheesy."},
 {fac:1,al:'h',t:"Declare {F} runs this company now",s:'mic',d:.1,p:3,c:2,ok:"Arrogant — and scary.",no:"The crowd chants 'no you don't'."},
 {t:"Call for new recruits",s:'mic',d:.15,p:2,ok:"The locker room is listening.",no:"Nobody seems interested."},
 {al:'f',t:"Lead the crowd in the faction chant",s:'pop',d:.05,p:3,ok:"The whole arena chants along.",no:"The chant never catches on."},
 {al:'h',t:"Ban the crowd from chanting",s:'mic',d:.1,p:2,ok:"They chant louder. Perfect.",no:"The crowd ignores them completely."}]},
 duo:{texts:[{al:'f',t:"{A} brings {B} out as the newest member."},{al:'h',t:"{A} and {B} stand on the stage like they own it."}],ch:[
 {t:"Show off the new team's handshake",s:'pop',d:.05,c:3,p:2,ok:"It's cheesy, and the crowd loves it.",no:"They botch it."},
 {al:'f',t:"Promise the fans a team they can believe in",s:'mic',d:.1,c:2,p:3,ok:"The crowd is sold.",no:"It sounds generic."},
 {al:'h',t:"Threaten every tag team in the back",s:'mic',d:.1,c:2,p:2,ok:"Dangerous. The crowd boos.",no:"It lacks bite."},
 {sty:'pw|br',t:"Flex together and dare anyone to come out",s:'pop',d:.05,c:2,p:2,ok:"Nobody dares.",no:"A random wrestler comes out and embarrasses them."}]}},
champ:{solo:{texts:[
 {al:'f',t:"{A} comes out with the {T} title held high and a proud smile."},
 {al:'h',t:"{A} walks out with the {T} title draped over their shoulder like they own the place."}],ch:[
 {al:'h',t:"Announce they'll only defend it on their terms",s:'mic',d:.1,p:2,ok:"The crowd is furious.",no:"Nobody cares."},
 {al:'h',t:"Rename the title after themselves",s:'mic',d:.15,p:3,ok:"The boos are deafening. Iconic heel move.",no:"Even the crowd laughs."},
 {sty:'te',t:"Promise a title defense that'll be a wrestling clinic",s:'mic',d:.1,p:2,ok:"The purists are excited.",no:"It sounds boring."},
 {sty:'sh',t:"Unveil a custom version of the belt",s:'pop',d:.1,p:3,ok:"Flashy and fun.",no:"It looks cheap."}]},
 duo:{texts:[{al:'f',vs:'h',t:"The champion {A} is interrupted by the challenger {B}."},{al:'h',vs:'f',t:"{B} marches out and stares at {A}'s title."}],ch:[
 {t:"Hold the belt in {B}'s face",s:'mic',d:.05,h:10,p:2,ok:"A tense stare-down.",no:"{B} knocks it away."},
 {al:'f',t:"Accept the challenge — any time, anywhere",ch:1,s:'mic',d:.05,h:10,p:3,ok:"The crowd erupts. A fighting champion.",no:"The acceptance sounds half-hearted."},
 {al:'f',vs:'f',t:"Hand {B} the belt to hold — then take it back",s:'pop',d:.05,h:8,p:3,ok:"Respectful, with a message.",no:"{B} doesn't want to give it back."}]}},
vignette:{solo:{texts:[
 {sty:'br',t:"A grainy film shows {A} training in a dingy boxing gym."},
 {sty:'fl',t:"A slow-motion vignette shows {A} flipping off rooftops at dawn."},
 {sty:'te',t:"A black-and-white vignette shows {A} studying tape in a dark room."},
 {sty:'pw',t:"A vignette shows {A} dragging a truck across a parking lot."},
 {sty:'sh',t:"A glitzy vignette shows {A} under stage lights, rehearsing a new entrance."}],ch:[
 {sty:'br',t:"Hit the heavy bag until it bursts",s:'ring',d:.05,p:2,ok:"Raw and gritty.",no:"The bag just sways."},
 {sty:'fl',t:"Show off a new aerial move",s:'ring',d:.15,p:3,ok:"The internet will be talking about this.",no:"It looks unfinished."},
 {sty:'te',t:"Explain a new submission in chilling detail",s:'mic',d:.1,p:2,ok:"Creepy and effective.",no:"Too technical."},
 {sty:'pw',t:"Lift something impossibly heavy",s:'ring',d:.1,p:3,ok:"Unreal strength.",no:"The camera angle ruins it."},
 {sty:'sh',t:"Tease a big announcement",s:'mic',d:.1,p:3,ok:"The fans are dying to know.",no:"It sounds overhyped."},
 {al:'h',t:"Buy out a restaurant so nobody else can eat there",s:'mic',d:.05,p:2,ok:"Petty and hated.",no:"It comes off as boring."}]},
 duo:{texts:[{al:'f',vs:'f',t:"A vignette shows {A} and {B} training together, with a hint of rivalry."},{nff:1,t:"A vignette shows {A} watching tape of {B} in a dark room."}],ch:[
 {nff:1,t:"Circle {B}'s mistakes on a whiteboard",s:'mic',d:.1,h:9,p:2,ok:"Obsessive and scary.",no:"It's hard to read."},
 {al:'f',vs:'f',t:"Spar hard — a little too hard",s:'ring',d:.1,h:10,p:2,ok:"Friendly competition just turned serious.",no:"It looks like practice."},
 {al:'h',t:"Burn {B}'s photo",s:'luck',d:.05,h:12,p:2,ok:"A dark, menacing message.",no:"The lighter won't light."},
 {al:'f',vs:'h',t:"Promise {B} their time is up",s:'mic',d:.1,h:10,p:3,ok:"A hero with a mission.",no:"It lacks fire."}]}},
turn:{solo:{ch:[
 {al:'f',sty:'te',t:"Declare that the fans never appreciated real wrestling",s:'mic',d:.1,p:3,ok:"Bitter and believable. A cold new heel.",no:"The crowd just shrugs."},
 {al:'f',sty:'sh',t:"Rip off their colorful gear to reveal all black",s:'pop',d:.05,p:3,ok:"A new look, a new attitude.",no:"The gear gets stuck. Awkward."},
 {al:'h',sty:'br',t:"Admit they were only ever fighting for themselves — until now",s:'mic',d:.1,p:3,ok:"Raw honesty. The crowd embraces {A}.",no:"The crowd isn't sure they mean it."},
 {al:'h',und:1,t:"Thank the fans for sticking by them",s:'mic',d:.1,p:4,ok:"Emotional. The crowd welcomes {A} home.",no:"It feels rushed."}]}}};
