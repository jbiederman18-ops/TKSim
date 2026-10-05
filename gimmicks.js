/* Tony Khan Simulator — deeply silly gimmick prospects.
   Now and then the scouting board turns up one of these. Each has a bio, its own match moment (m) and its own promo
   opener and lines (p), which only come up when that wrestler is involved. Everything else (training, feuds, titles)
   works like any other prospect. Entries marked old:1 are retired: they no longer turn up for scouting or pitches, but
   wrestlers who already have them keep their moments. pal links two gimmicks that click as partners. Fields: k key · n name · g M/F · st style · al face/heel · tier · bio · ring/mic/pop
   stat nudges · m {t, ch} · p {t, ch}. */
'use strict';
const GIMMICKS=[
{k:'mime',n:'Silence the Mime',g:'M',st:'sh',al:'h',tier:'bluechip',mic:-15,pop:6,bio:"Has not spoken a word since 2011. Communicates exclusively through an invisible box.",
 m:{t:"{A} traps {B} in an invisible box. The referee is genuinely unsure whether this counts as a submission.",ch:[
  {t:"Pull an invisible rope and 'drag' {B} into the corner",s:'pop',d:.1,st:.5,popA:2,heat:6,ok:"{B} sells it. The crowd has no idea why they're cheering.",no:"{B} simply walks out of the invisible box. Devastating."},
  {al:'h',t:"Mime a steel chair — then hit {B} with a real one",s:'luck',d:.05,st:.5,heat:14,ok:"Nobody saw the real chair coming. The purest deception in wrestling history.",no:"The ref confiscates the real chair. The invisible one is allowed."}]},
 p:{t:"{A} walks to the ring, picks up the microphone, and stares at it. For a long time.",ch:[
  {key:1,t:"Perform an entire promo in total silence",s:'pop',d:.15,p:4,ok:"Four minutes of mime. The crowd somehow understood every word. Standing ovation.",no:"The crowd chants 'SAY SOMETHING'. {A} refuses. Nobody wins."},
  {t:"Mime crying about how misunderstood they are",s:'pop',d:.05,p:3,ok:"A single invisible tear. The front row is emotionally destroyed.",no:"It looks like they have something in their eye."}]}},
{k:'actor',old:1,n:'Famous Actor Chad Brightwell',g:'M',st:'sh',al:'h',tier:'prospect',mic:8,bio:"Insists he's a household-name Hollywood star. Nobody has seen any of his movies. Neither has IMDb.",
 m:{t:"{A} stops mid-match to ask the director — there is no director — for another take.",ch:[
  {t:"Redo the last move, 'with more feeling'",s:'pop',d:.1,st:.5,popA:2,ok:"Take two is a masterpiece. The crowd demands an Oscar.",no:"Take two is somehow worse than take one."},
  {al:'h',t:"Demand {B} 'hit their mark' and then clothesline them on it",s:'ring',d:.05,st:.5,heat:12,ok:"{B} stands exactly where they were told and gets flattened. Hollywood is brutal.",no:"{B} ignores the blocking notes."}]},
 p:{t:"{A} walks out in sunglasses and a bathrobe, signing autographs nobody asked for.",ch:[
  {key:1,t:"Recite the plot of his 'upcoming blockbuster'",s:'mic',d:.1,p:3,ok:"It's the plot of a movie that already exists. The crowd boos with delight.",no:"He forgets the plot halfway through."},
  {t:"Thank the Academy",s:'mic',d:.05,p:2,ok:"There is no award. The speech is eleven minutes long. Incredible heat.",no:"The music plays him off. Like at the real Oscars."}]}},
{k:'teacher',old:1,n:'Substitute Teacher Ms. Pembrook',g:'F',st:'te',al:'h',tier:'prospect',mic:6,bio:"Takes attendance before every match. Will not start until everyone in the arena is seated and quiet.",
 m:{t:"{A} blows a whistle and informs {B} that they are being sent to the principal's office.",ch:[
  {t:"Give {B} detention in a surfboard stretch",s:'ring',d:.1,st:.5,heat:8,ok:"{B} learns a valuable lesson about respecting substitutes.",no:"{B} asks for a hall pass and escapes."},
  {t:"Hand out a pop quiz mid-match",s:'mic',d:.1,st:.25,popA:2,ok:"{B} fails. Visibly shaken.",no:"{B} gets a perfect score. {A} demands to see their work."}]},
 p:{t:"{A} walks to the ring with a clipboard and begins taking attendance.",ch:[
  {key:1,t:"Mark the entire front row absent",s:'mic',d:.05,p:3,ok:"They are present. They are furious. Beautiful heat.",no:"The front row answers 'here' in unison. Checkmate."},
  {t:"Announce that there will be a test on Friday",s:'mic',d:.1,p:2,ok:"Twenty thousand people groan at once.",no:"Nobody believes her. It's Tuesday."}]}},
{k:'trophy',old:1,n:'The Human Participation Trophy',g:'M',st:'br',al:'f',tier:'prospect',pop:8,bio:"Has never won a match. Gets a trophy after every single one anyway. The fans adore him for it.",
 m:{t:"{A} is losing badly, but a ringside attendant is already polishing a trophy for them.",ch:[
  {t:"Fight on — everyone's a winner",s:'pop',d:.15,st:.75,popA:3,ok:"'YOU TRIED YOUR BEST' chants shake the building.",no:"They lost. They still get the trophy."},
  {t:"Hit {B} with the trophy",loseOk:'dq',dq:1,s:'luck',d:.05,st:.25,heat:10,ok:"Disqualified. Still gets the trophy.",no:"The trophy is plastic. It breaks. Tears."}]},
 p:{t:"{A} comes out clutching a shelf full of trophies to thunderous applause.",ch:[
  {key:1,t:"Thank every opponent who ever beat them",s:'pop',d:.05,p:4,ok:"It takes a while. The crowd cheers every name.",no:"The list is so long the show goes to commercial."},
  {t:"Promise that someday they'll win one for real",s:'mic',d:.1,p:3,ok:"Not a dry eye in the house.",no:"The crowd isn't sure they believe it either."}]}},
{k:'posh',old:1,n:'Sir Reginald Crumpet III',g:'M',st:'te',al:'h',tier:'bluechip',mic:6,bio:"Arrives by horse-drawn carriage. Wrestles with his pinky extended. Believes the ring is 'rather common'.",
 m:{t:"{A} pauses the match for afternoon tea, served by a butler who is already in the ring.",ch:[
  {t:"Finish the tea, then apply a very proper wristlock",s:'ring',d:.1,st:.5,heat:8,ok:"Civilised and devastating.",no:"{B} knocks the teacup over. An international incident."},
  {al:'h',t:"Have the butler trip {B}",s:'luck',d:.05,st:.5,heat:12,ok:"The butler does it without changing his expression. Chilling.",no:"The butler refuses. He has standards."}]},
 p:{t:"A trumpet fanfare plays. {A} is carried to the ring on a velvet chair.",ch:[
  {key:1,t:"Refer to the crowd as 'the peasantry'",s:'mic',d:.05,p:3,ok:"The peasantry is outraged.",no:"The peasantry doesn't know what peasantry means."},
  {t:"Challenge anyone to a duel, pistols optional",s:'mic',d:.1,p:2,ok:"Nobody accepts. {A} declares victory by default.",no:"Someone accepts. {A} suddenly remembers a prior engagement."}]}},
{k:'hr',old:1,n:'Brenda from HR',g:'F',st:'pw',al:'h',tier:'prospect',ring:4,bio:"Files a formal complaint against every opponent. Has a disturbing number of forms.",
 m:{t:"{A} pulls a form from their gear and begins filing a complaint against {B} mid-match.",ch:[
  {t:"Suspend {B} with a powerbomb 'pending review'",s:'ring',d:.1,st:.5,heat:10,ok:"The review found {B} guilty.",no:"{B} reports {A} to a higher HR department."},
  {t:"Schedule a mandatory sensitivity seminar right now",s:'mic',d:.1,st:.25,popA:2,ok:"{B} has to sit through a slideshow. The crowd boos gleefully.",no:"The projector doesn't work."}]},
 p:{t:"{A} walks out with a stack of forms and a lanyard.",ch:[
  {key:1,t:"Read the locker room's complaints aloud",s:'mic',d:.1,p:3,ok:"The locker room will never feel safe again.",no:"Most of the complaints are about Brenda."},
  {t:"Announce a mandatory team-building exercise",s:'mic',d:.05,p:2,ok:"Nobody wants to do trust falls. The crowd boos.",no:"Nobody shows up to it."}]}},
{k:'doll',old:1,n:'The Haunted Victorian Doll',g:'F',st:'fl',al:'h',tier:'bluechip',pop:6,bio:"Found in an attic in 1893. Never blinks. The lights flicker whenever she wins.",
 m:{t:"The lights flicker. When they come back, {A} is standing directly behind {B}. Nobody saw her move.",ch:[
  {t:"Tilt her head slowly, then strike",s:'pop',d:.1,st:.75,heat:10,ok:"The crowd screams. Genuinely.",no:"{B} turns around first. Awkward for everyone."},
  {t:"Sit perfectly still until {B} gets too close",s:'luck',d:.05,st:.5,heat:8,ok:"{B} leans in and gets rolled up. Terrifying.",no:"{B} just leaves her there."}]},
 p:{t:"A music box plays. {A} is wheeled to the ring in a glass case.",ch:[
  {key:1,t:"Say nothing and let the music box play",s:'pop',d:.1,p:4,ok:"Twenty thousand people are too scared to boo.",no:"The music box runs down. Silence."},
  {t:"Whisper a name from the locker room",s:'mic',d:.1,p:3,ok:"Somewhere in the back, a wrestler screams.",no:"Nobody hears it."}]}},
{k:'pirate',old:1,n:'Captain Seagull',g:'M',st:'br',al:'f',tier:'prospect',pop:5,bio:"A fearsome pirate who is afraid of water, boats and, to a lesser degree, seagulls.",
 m:{t:"{A} hears a seagull noise from the crowd and freezes in terror.",ch:[
  {t:"Overcome the fear and hit a flying elbow",s:'pop',d:.15,st:.75,popA:3,ok:"The crowd roars. A pirate reborn!",no:"The seagull noise happens again. He's out."},
  {t:"Make {B} walk the plank off the apron",s:'ring',d:.1,st:.5,ok:"{B} takes a long fall to the floor. Arrrr.",no:"{B} refuses to walk the plank."}]},
 p:{t:"{A} swaggers out in full pirate gear and immediately gets seasick on the ramp.",ch:[
  {key:1,t:"Promise to lead the fans to buried treasure",s:'mic',d:.1,p:3,ok:"The treasure is a box of t-shirts. The fans are thrilled.",no:"He can't find the map."},
  {t:"Lead the crowd in a sea shanty",s:'pop',d:.05,p:3,ok:"The whole arena sings. Pure joy.",no:"Nobody knows the words."}]}},
{k:'vamp',old:1,n:'Discount Dracula',g:'M',st:'sh',al:'h',tier:'prospect',bio:"An ancient creature of the night who is scared of the dark, allergic to garlic and deeply in debt.",
 m:{t:"{A} lunges for {B}'s neck and gets distracted by their own reflection in the ring post.",ch:[
  {t:"Recover with a menacing cape swirl",s:'pop',d:.1,st:.5,popA:2,ok:"The cape is magnificent. The crowd hisses.",no:"The cape gets caught in the ropes."},
  {al:'h',t:"Throw 'garlic' (a breadstick) at {B}",s:'luck',d:.05,st:.25,heat:10,ok:"{B} is confused enough to be pinned.",no:"{B} eats the breadstick."}]},
 p:{t:"The lights go out. {A} asks, quite urgently, for them to be turned back on.",ch:[
  {key:1,t:"Declare that the night belongs to him",s:'mic',d:.1,p:3,ok:"It's 8:15pm. The crowd boos anyway.",no:"Someone points out it's still light outside."},
  {t:"Hypnotise a fan in the front row",s:'luck',d:.1,p:3,ok:"It works?! The fan cheers for {A}. Everyone is unsettled.",no:"The fan just laughs."}]}},
{k:'grandma',old:1,n:'Grandma Knuckles',g:'F',st:'br',al:'f',tier:'prospect',ring:-2,pop:10,bio:"Seventy-two years old. Undefeated at bingo. Has hit more people with a purse than anyone alive.",
 m:{t:"{A} reaches into her purse. The whole building knows what's coming.",ch:[
  {t:"Purse shot!",dq:1,s:'luck',d:.05,st:.5,popA:3,heat:8,ok:"The ref 'didn't see it'. The crowd erupts.",no:"The ref saw it. Grandma doesn't care."},
  {t:"Pull out a hard candy and offer {B} one",s:'pop',d:.05,st:.25,popA:2,ok:"{B} accepts. Roll-up. Three count.",no:"{B} declines. Grandma is offended."}]},
 p:{t:"{A} slowly makes her way down the ramp with a walker, which she then throws at the ring.",ch:[
  {key:1,t:"Tell the locker room they're all too soft",s:'mic',d:.1,p:4,ok:"The crowd agrees completely.",no:"She drifts into a story about 1968."},
  {t:"Pinch the ring announcer's cheek",s:'pop',d:0,p:3,ok:"He's embarrassed. The crowd loves it.",no:"He dodges. She's disappointed in him."}]}},
{k:'influencer',old:1,n:"Like & Subscribe Kayleigh",g:'F',st:'sh',al:'h',tier:'prospect',mic:5,bio:"Films every match on a ring light attached to her head. Four million followers. Nine of them are real.",
 m:{t:"{A} stops to film a quick vertical video for her followers — with {B} still in the ring.",ch:[
  {t:"Film a reaction video of {B}'s pain",s:'mic',d:.05,st:.25,heat:10,ok:"The video goes viral. The crowd is disgusted.",no:"The ring light blinds her."},
  {t:"Ask chat what move to do next",loseNo:'pin',s:'luck',d:.1,st:.5,popA:2,ok:"Chat says 'moonsault'. She actually hits it.",no:"Chat says 'lose'. She loses."}]},
 p:{t:"{A} livestreams her entrance, narrating to her followers.",ch:[
  {key:1,t:"Remind everyone to like and subscribe",s:'mic',d:.05,p:3,ok:"The crowd chants 'NO'. Great engagement.",no:"The stream crashes."},
  {t:"Announce a new merch drop",s:'pop',d:.1,p:2,ok:"It's a hoodie that costs $180. Pure villainy.",no:"The website crashes."}]}},
{k:'cop',old:1,n:'Mall Cop Marv',g:'M',st:'pw',al:'f',tier:'prospect',bio:"Takes mall security extremely seriously. Rides a Segway to the ring. Has never made an arrest.",
 m:{t:"{A} blows a whistle and informs {B} that they are loitering in the ring.",ch:[
  {t:"Escort {B} off the premises with a powerslam",s:'ring',d:.1,st:.5,popA:2,ok:"Order is restored to the food court.",no:"{B} shows a receipt and is allowed to stay."},
  {t:"Chase {B} around the ring on the Segway",s:'luck',d:.1,st:.25,popA:2,ok:"He catches them. Barely.",no:"The Segway battery dies."}]},
 p:{t:"{A} rides a Segway down the ramp at a stately four miles an hour.",ch:[
  {key:1,t:"Remind the fans that running is not allowed",s:'mic',d:.05,p:3,ok:"The crowd walks, briskly, to the concessions. Order!",no:"Everyone runs anyway."},
  {t:"Check everyone's bags for outside snacks",s:'pop',d:.1,p:2,ok:"He confiscates a pretzel. The crowd cheers.",no:"He eats the pretzel. The crowd boos."}]}},
{k:'nap',old:1,n:'Mister Nap',g:'M',st:'te',al:'f',tier:'bluechip',mic:-5,bio:"The most talented technical wrestler of his generation. Falls asleep in rest holds. Sometimes in his own.",
 m:{t:"{A} locks in a rest hold… and starts snoring.",ch:[
  {t:"Wake up and roll into a submission",loseNo:'pin',s:'ring',d:.15,st:.75,popA:2,ok:"He was never asleep! Or was he? The crowd goes wild.",no:"He was asleep. The ref counts three."},
  {t:"Let the crowd wake him with a chant",s:'pop',d:.05,st:.5,popA:3,ok:"'WAKE UP NAP!' He springs to life.",no:"He rolls over."}]},
 p:{t:"{A} walks out in pajamas holding a pillow.",ch:[
  {key:1,t:"Try to cut a promo before dozing off",s:'mic',d:.15,p:3,ok:"He gets through it. The crowd applauds his effort.",no:"Asleep by the third sentence."},
  {t:"Tuck in the front row",s:'pop',d:.05,p:3,ok:"The coziest segment in history.",no:"They don't want to be tucked in."}]}},
{k:'weather',old:1,n:'Stormy Pete, Channel 7 Weather',g:'M',st:'sh',al:'f',tier:'prospect',mic:8,bio:"Delivers a full forecast before every match. Has never once been right.",
 m:{t:"{A} pauses the match to point at a green screen that isn't there.",ch:[
  {t:"Forecast a 90% chance of a clothesline",s:'mic',d:.05,st:.5,popA:2,ok:"The forecast is correct for the first time. Historic.",no:"Unseasonably sunny. {B} hits him first."},
  {t:"Hit a move called the Cold Front",s:'ring',d:.1,st:.5,ok:"It's just a dropkick, but the name sells it.",no:"The cold front stalls over the apron."}]},
 p:{t:"{A} walks out holding a clicker and gestures at an imaginary weather map.",ch:[
  {key:1,t:"Deliver the five-day forecast",s:'mic',d:.1,p:3,ok:"Warm and informative. The crowd applauds the barometric pressure.",no:"He gets every day wrong. It's raining in the building."},
  {t:"Issue a severe storm warning for his opponents",s:'mic',d:.1,p:3,ok:"The locker room takes shelter.",no:"Nobody evacuates."}]}},
{k:'box',old:1,n:'The Box',g:'M',st:'pw',al:'h',tier:'bluechip',ring:4,mic:-15,bio:"A cardboard box that walks to the ring. Nobody knows who is inside. The contract was signed with a crayon.",
 m:{t:"{A} sits down in the corner and becomes completely motionless. It is, at this point, just a box.",ch:[
  {t:"Wait for {B} to check inside, then strike",s:'luck',d:.05,st:.75,heat:10,ok:"{B} peeks in. {B} is never the same.",no:"{B} just leaves the box alone."},
  {t:"Tip over and roll across the ring onto {B}",s:'ring',d:.1,st:.5,ok:"A shocking amount of force for a box.",no:"The box rolls out of the ring."}]},
 p:{t:"A large cardboard box is placed in the ring. It has a mic taped to the side.",ch:[
  {key:1,t:"Stay completely silent",s:'pop',d:.1,p:4,ok:"The box says nothing. The crowd chants 'BOX! BOX! BOX!'",no:"The crowd is bored of the box."},
  {t:"A small hand emerges and waves",s:'luck',d:.05,p:3,ok:"The crowd screams. Who is in there?!",no:"The hand goes back in."}]}},
{k:'chef',old:1,n:'Chef Remy Flambé',g:'M',st:'sh',al:'h',tier:'prospect',bio:"Classically trained. Cooks a three-course meal at ringside during his matches. Nobody is allowed to eat it.",
 m:{t:"{A} ducks out to the ringside stove to check on the soufflé.",ch:[
  {t:"Serve {B} a knuckle sandwich",s:'ring',d:.05,st:.5,heat:6,ok:"Perfectly seasoned.",no:"{B} sends it back to the kitchen."},
  {al:'h',t:"Throw flour in {B}'s eyes",s:'luck',d:.05,st:.5,heat:12,ok:"{B} is blinded. Delicious villainy.",no:"The flour goes everywhere. Including {A}."}]},
 p:{t:"{A} wheels a kitchen station down the ramp and lights a pan on fire.",ch:[
  {key:1,t:"Call the fans' taste in food 'pedestrian'",s:'mic',d:.05,p:3,ok:"The crowd is personally offended. Great heat.",no:"The fans agree, honestly."},
  {t:"Eat the entire meal in front of the crowd",s:'luck',d:0,p:2,ok:"The boos are hungry and angry.",no:"It's too hot. He burns his tongue."}]}},
{k:'spell',old:1,n:'Two-Time Spelling Bee Champion Priya Anand',g:'F',st:'te',al:'f',tier:'bluechip',mic:4,bio:"Spells the name of every move before she does it. The referee is required to confirm the spelling.",
 m:{t:"{A} announces she's going to do a move and asks for its definition and use in a sentence.",ch:[
  {t:"Spell 'B-R-I-D-G-I-N-G S-U-P-L-E-X' and hit it",s:'ring',d:.15,st:.75,popA:3,ok:"Correct! Three count!",no:"She spells it wrong and loses her concentration."},
  {t:"Challenge {B} to spell their own finisher",s:'mic',d:.1,st:.25,popA:2,ok:"{B} can't. Devastating psychological damage.",no:"{B} spells it perfectly. Humiliating."}]},
 p:{t:"{A} walks out holding a dictionary and a trophy from 2009.",ch:[
  {key:1,t:"Spell out the name of her next opponent — slowly",s:'mic',d:.1,p:3,ok:"The crowd spells along. Every letter lands.",no:"Their name has a silent letter. Chaos."},
  {t:"Correct the crowd's signs",s:'pop',d:.05,p:2,ok:"The crowd appreciates the feedback. Mostly.",no:"The signs were correct. She's shaken."}]}},
{k:'chiro',old:1,n:'The Unlicensed Chiropractor',g:'M',st:'te',al:'h',tier:'prospect',bio:"Cracks backs. Nobody asked. His diploma is written on a napkin.",
 m:{t:"{A} grabs {B} in a bear hug and announces that it's 'just an adjustment'.",ch:[
  {t:"Crack {B}'s back until something pops",s:'ring',d:.1,st:.5,heat:10,ok:"{B} feels, somehow, better. Then {A} pins them.",no:"Nothing pops. Awkward silence."},
  {al:'h',t:"Offer {B} a free consultation — then attack",s:'luck',d:.05,st:.5,heat:12,ok:"{B} fell for it. Classic malpractice.",no:"{B} checks his credentials first."}]},
 p:{t:"{A} walks out with a portable massage table and a stack of business cards.",ch:[
  {key:1,t:"Offer the front row a free adjustment",s:'mic',d:.1,p:3,ok:"Security has to step in. The crowd boos gleefully.",no:"Nobody volunteers."},
  {t:"Announce that he's now accepting insurance",s:'mic',d:.05,p:2,ok:"He's not. The crowd is outraged.",no:"Nobody believes him anyway."}]}},
{k:'pigeon',old:1,n:'Lord Pigeon',g:'M',st:'fl',al:'h',tier:'prospect',pop:5,bio:"Claims to command every pigeon in the city. Has one pigeon. Its name is Gerald.",
 m:{t:"{A} lets out a shrill whistle. Somewhere in the rafters, a single pigeon stirs.",ch:[
  {t:"Fly off the top rope like the pigeons taught him",s:'ring',d:.15,st:.75,fat:5,ok:"A majestic dive. Gerald would be proud.",no:"Pigeons are not known for their landing."},
  {al:'h',t:"Have Gerald distract the referee",s:'luck',d:.1,st:.5,heat:10,ok:"Gerald lands on the ref's head. {A} cheats freely.",no:"Gerald doesn't show up. Gerald never shows up."}]},
 p:{t:"{A} walks out with a pigeon on his shoulder and demands silence for Gerald.",ch:[
  {key:1,t:"Explain the pigeon hierarchy",s:'mic',d:.1,p:3,ok:"It's weirdly detailed. The crowd is hooked.",no:"Gerald flies away mid-speech."},
  {t:"Threaten the city's statues",s:'mic',d:.05,p:2,ok:"The crowd boos on behalf of the statues.",no:"Nobody knows why this is a threat."}]}},
{k:'karaoke',old:1,n:'Karaoke Katie',g:'F',st:'sh',al:'f',tier:'prospect',mic:6,pop:6,bio:"Sings her own entrance music, live, badly, every single time. The crowd sings along anyway.",
 m:{t:"{A} grabs the ring announcer's mic and starts singing mid-match.",ch:[
  {t:"Hit a big move on the high note",s:'pop',d:.1,st:.5,popA:3,ok:"The note is flat. The move is perfect. The crowd loves both.",no:"She holds the note too long and {B} rolls her up."},
  {t:"Get the whole crowd singing to rally",s:'pop',d:.05,st:.5,popA:2,ok:"Twenty thousand people sing a power ballad. The comeback is on.",no:"The crowd picks a different song."}]},
 p:{t:"{A} comes out singing her own theme, badly, and the crowd sings louder than her.",ch:[
  {key:1,t:"Hand the mic to a fan for a duet",s:'pop',d:.05,p:4,ok:"The fan is incredible. A star is born.",no:"The fan freezes. {A} finishes the song alone."},
  {t:"Dedicate a song to her next opponent",s:'mic',d:.1,p:3,ok:"It's a breakup song. Brutal.",no:"She forgets the lyrics."}]}},
{k:'timeshare',n:'Timeshare Terry',g:'M',st:'br',al:'h',tier:'prospect',mic:6,bio:"Won't wrestle anyone until they've sat through a ninety-minute presentation. There is a free buffet.",
 m:{t:"{A} pulls out a laminated brochure and tries to sell {B} a week in a condo mid-match.",ch:[
  {t:"Close the deal with a lariat",s:'ring',d:.1,st:.5,heat:8,ok:"{B} signs. There's no cancellation policy.",no:"{B} says they need to think about it."},
  {al:'h',t:"Hide a foreign object in the brochure",s:'luck',d:.05,st:.5,heat:12,ok:"The fine print was a roll of quarters.",no:"The ref reads the fine print."}]},
 p:{t:"{A} sets up a small folding table in the ring with a bowl of mints.",ch:[
  {key:1,t:"Pitch the crowd a 'limited-time opportunity'",s:'mic',d:.1,p:3,ok:"The crowd is furious. Several people take brochures anyway.",no:"The crowd walks out to the concessions."},
  {t:"Offer the locker room a free weekend getaway",s:'mic',d:.05,p:2,ok:"There's a catch. There's always a catch.",no:"Nobody takes the bait."}]}},
{k:'jeff',old:1,n:'Jeff',g:'M',st:'te',al:'f',tier:'gen',mic:-12,pop:-4,bio:"Just Jeff. No gimmick. No catchphrase. No entrance music. Might be the most gifted wrestler in the world.",
 m:{t:"{A} just… wrestles. It's incredible. Nobody knows how to react.",ch:[
  {t:"Keep doing it",s:'ring',d:.1,st:.75,ok:"'JEFF! JEFF! JEFF!' The crowd has discovered him.",no:"He's too subtle for the crowd tonight."},
  {t:"Give a small thumbs up",s:'pop',d:.05,st:.25,popA:3,ok:"The most charisma Jeff has ever shown. The crowd explodes.",no:"Nobody sees it."}]},
 p:{t:"{A} walks to the ring in plain black trunks. There's no music.",ch:[
  {key:1,t:"Say 'Hi. I'm Jeff.'",s:'mic',d:.1,p:3,ok:"The crowd chants 'HI JEFF'. A movement begins.",no:"Silence. Jeff leaves."},
  {t:"Do one perfect push-up and leave",s:'pop',d:.05,p:2,ok:"The crowd respects it.",no:"Nobody understands."}]}},
/* ---- v98: Josh's gimmick list ---- */
{k:'dblmeat',n:'"Double Meat" Popeye Mulligan',g:'M',st:'pw',al:'f',tier:'prospect',pop:4,bio:"Orders everything double meat. Sandwiches, burritos, salads. Nobody has ever told him no.",
 m:{t:"{A} pulls a foil-wrapped sandwich out of his kneepad mid-match and takes a huge bite.",ch:[
  {t:"Power up on the double meat and hit a double powerbomb",s:'ring',d:.1,st:.5,popA:2,ok:"Two powerbombs. Double meat. The crowd gets it.",no:"Cramps. Should have waited thirty minutes."},
  {t:"Offer {B} the other half",s:'pop',d:.05,st:.25,popA:2,ok:"{B} takes it. For one beautiful moment, there is peace.",no:"{B} slaps it to the mat. The crowd gasps in horror."}]},
 p:{t:"{A} walks out holding a sandwich so tall he needs both hands.",ch:[
  {key:1,t:"Demand double meat on everything — the card, the show, the title",s:'mic',d:.1,p:3,ok:"'DOUBLE MEAT! DOUBLE MEAT!' shakes the building.",no:"The crowd is just hungry now."},
  {t:"Hand out sliders to the front row",s:'pop',d:.05,p:2,ok:"The front row would run through a wall for him.",no:"Health code violation."}]}},
{k:'seger1',n:'"Against the Wind" Dan Bath',g:'M',st:'br',al:'f',tier:'prospect',pal:'seger2',bio:"Charges to the ring every week, somehow always into a headwind — even indoors. Best friends with \"Hollywood Nights\" Bob Arlington.",
 m:{t:"A gust from the arena vents hits — {A} leans into it and keeps charging at {B}.",ch:[
  {t:"Run against the wind, straight into a shoulder tackle",s:'ring',d:.1,st:.5,popA:2,ok:"Nothing can stop him. Not even the air conditioning.",no:"The wind wins this one."},
  {t:"Point to the rafters and wait for the breeze to turn",s:'luck',d:.05,st:.25,ok:"It turns. So does the match.",no:"It doesn't. Long, awkward pause."}]},
 p:{t:"{A} walks out slowly, hair blowing back from a box fan someone set at the top of the ramp.",ch:[
  {key:1,t:"Talk about every mile he ran to get here",s:'mic',d:.1,p:3,ok:"Dads in the crowd are openly weeping.",no:"Too many miles. The crowd drifts off."},
  {t:"Call out for Bob Arlington",s:'pop',d:.05,p:2,ok:"The whole building chants 'BOB! BOB! BOB!'",no:"Bob is stuck in traffic."}]}},
{k:'seger2',n:'"Hollywood Nights" Bob Arlington',g:'M',st:'sh',al:'f',tier:'prospect',mic:4,pal:'seger1',bio:"Spent one weekend in Hollywood in 1987. Has not stopped talking about it. Best friends with \"Against the Wind\" Dan Bath.",
 m:{t:"{A} stops to put on sunglasses in the middle of the match. It's 9 p.m. Indoors.",ch:[
  {t:"Hit a slow-motion, movie-style dropkick",s:'ring',d:.1,st:.5,popA:2,ok:"Somebody yell cut — that was perfect.",no:"Wrong take. Way too slow."},
  {t:"Wave to the 'producers' in the crowd",s:'pop',d:.05,st:.25,ok:"A guy in a beret waves back. The crowd loves it.",no:"Nobody here is a producer. Nobody."}]},
 p:{t:"{A} rolls into the arena in a convertible with the top down.",ch:[
  {key:1,t:"Tell the story of that one Hollywood night",s:'mic',d:.1,p:3,ok:"It's a great story. It's always a great story.",no:"The crowd has heard it four times this month."},
  {t:"Sign headshots of himself for the front row",s:'pop',d:.05,p:2,ok:"The front row is framing them.",no:"They're using them as napkins."}]}},
{k:'predator',n:'The Sexual Predator',g:'M',st:'sh',al:'h',tier:'prospect',pop:3,bio:"Loved the movie Predator so much he started wrestling dressed as the creature. Then one day he caught his reflection and realized he's kind of sexy. Changed his name accordingly.",
 m:{t:"{A} switches on his 'cloaking device' — a bedsheet painted to look like the arena — and disappears against the turnbuckle.",ch:[
  {t:"Decloak and hit a top-rope splash",s:'ring',d:.1,st:.5,heat:6,ok:"Nobody saw him coming. Least of all the bedsheet.",no:"The bedsheet snags on the turnbuckle."},
  {al:'h',t:"Stop mid-move to admire himself in the ring post",s:'pop',d:.05,st:.25,popA:2,ok:"He's not wrong. He does look good.",no:"{B} rolls him up while he's posing."}]},
 p:{t:"{A} walks out in the full creature mask, then slowly peels it off and shakes out his hair.",ch:[
  {key:1,t:"Explain his journey from movie superfan to heartthrob",s:'mic',d:.1,p:3,ok:"The crowd boos and swoons at the same time.",no:"The crowd chants for him to put the mask back on."},
  {t:"Flex, blow a kiss to the hard camera, and leave",s:'pop',d:.05,p:2,ok:"Somehow it works.",no:"It's a lot."}]}},
{k:'minotaur',n:'Pat Minotaur',g:'M',st:'pw',al:'h',tier:'prospect',ring:2,bio:"Half man, half bull, all Pat. Lives in a labyrinth (a two-bedroom in Delaware with a very confusing floor plan).",
 m:{t:"{A} scrapes his boot across the mat and lowers his horns at {B}.",ch:[
  {t:"Charge! Full-speed gore",s:'ring',d:.1,st:.5,heat:8,ok:"{B} goes flying through the ropes. Olé.",no:"{B} sidesteps and Pat hits the turnbuckle horns-first."},
  {al:'h',t:"Trap {B} in the corner — the labyrinth has no exit",s:'luck',d:.05,st:.5,heat:10,ok:"There's no way out. There's never a way out.",no:"{B} finds the exit. It was the ropes."}]},
 p:{t:"{A} snorts into the microphone for a full thirty seconds.",ch:[
  {key:1,t:"Challenge any hero brave enough to enter the labyrinth",s:'mic',d:.1,p:3,ok:"Nobody volunteers. The crowd is genuinely scared.",no:"Someone asks if it's the one in Delaware."},
  {t:"Get the crowd waving red towels",s:'pop',d:.05,p:2,ok:"A sea of red. Pat is losing his mind.",no:"One guy brought a towel. It's beige."}]}},
{k:'priest',n:'"The Catholic Priest" Saul Lebowitz',g:'M',st:'te',al:'f',tier:'prospect',bio:"Insists he is a Catholic priest. Has never once explained the name. The locker room stopped asking years ago.",
 m:{t:"{A} pauses to bless the ring, the referee and, somehow, {B}.",ch:[
  {t:"Hit a Hail Mary crossbody off the top",s:'ring',d:.15,st:.5,popA:2,ok:"A miracle on the top rope.",no:"It was not answered."},
  {t:"Hear {B}'s confession in the middle of a headlock",s:'mic',d:.1,st:.25,heat:6,ok:"{B} confesses everything. Including the tights.",no:"{B} has nothing to confess. Apparently."}]},
 p:{t:"{A} walks to the ring swinging incense. The smoke alarm considers its options.",ch:[
  {key:1,t:"Deliver a sermon on the sin of cheating",s:'mic',d:.1,p:3,ok:"Even the heels in the back feel guilty.",no:"The congregation falls asleep."},
  {t:"Take one question about the name",s:'luck',d:.1,p:2,ok:"He answers with total confidence. Nobody understands it. Everybody accepts it.",no:"He stares at the fan until they sit down."}]}},
{k:'deppcuz',n:"Johnny Depp's Cousin",g:'M',st:'sh',al:'h',tier:'prospect',mic:3,bio:"Says he's Johnny Depp's cousin. Can't name a single other family member. Brings it up constantly.",
 m:{t:"{A} stops mid-match to remind everyone that his cousin is a very famous actor.",ch:[
  {t:"Hit his finisher, The Family Connection",s:'ring',d:.1,st:.5,heat:6,ok:"Connected.",no:"There is no connection. There never was."},
  {al:'h',t:"Warn {B} that his cousin knows people",s:'mic',d:.05,st:.25,heat:10,ok:"{B} hesitates just long enough to get pinned.",no:"{B} asks for the cousin's number."}]},
 p:{t:"{A} holds up a blurry photo of the back of someone's head.",ch:[
  {key:1,t:"Insist that's definitely his cousin",s:'mic',d:.1,p:3,ok:"The crowd chants 'THAT'S NOT HIM!'",no:"It's very clearly a mailbox."},
  {t:"Name-drop every movie he can think of",s:'mic',d:.05,p:2,ok:"He gets most of them right. A few he made up.",no:"He only knows the pirate ones."}]}},
{k:'bakula',n:'Scott Bakula',g:'M',st:'te',al:'f',tier:'prospect',bio:"Not that Scott Bakula. No relation. Gets asked about it every single day and has made his peace with it.",
 m:{t:"Someone in the crowd yells 'Oh boy!' and {A} visibly sighs.",ch:[
  {t:"Take a quantum leap off the top rope",s:'ring',d:.15,st:.5,popA:2,ok:"He lands somewhere else entirely — right on top of {B}.",no:"He leaps. He does not land well."},
  {t:"Ignore it and wrestle a technical clinic",s:'ring',d:.05,st:.25,ok:"The crowd finally starts chanting his actual name. Well, the same name. You know what we mean.",no:"They're still yelling 'Oh boy!'"}]},
 p:{t:"{A} starts every promo the same way: \"Not that one.\"",ch:[
  {key:1,t:"Explain, once and for all, that he is not the actor",s:'mic',d:.1,p:3,ok:"The crowd respects it. Mostly.",no:"Someone asks for an autograph anyway."},
  {t:"Give in and sign the autograph",s:'pop',d:.05,p:2,ok:"He signs it 'Scott Bakula (no relation)'. The crowd adores him.",no:"The fan asks for a refund."}]}},
{k:'butternuts',n:'Francis Butternuts',g:'M',st:'fl',al:'f',tier:'prospect',bio:"Grew up on the family squash farm. Proud of the name. Will fight anyone who laughs at it.",
 m:{t:"Someone in the front row giggles at the name and {A} stops dead.",ch:[
  {t:"Take it out on {B} with a furious flurry",s:'ring',d:.1,st:.5,popA:2,ok:"Nobody's laughing now.",no:"Too fired up — he gets sloppy."},
  {t:"Dive onto the giggler's section (carefully)",s:'ring',d:.15,st:.5,fat:5,ok:"Respect restored.",no:"He lands in the nachos."}]},
 p:{t:"{A} holds up a framed family crest featuring a single butternut squash.",ch:[
  {key:1,t:"Give a heartfelt speech about family pride",s:'mic',d:.1,p:3,ok:"The crowd chants 'BUTTERNUTS!' with total respect.",no:"Somebody laughs. It's over."},
  {t:"Hand out squash to the front row",s:'pop',d:.05,p:2,ok:"Great roasted, apparently.",no:"Nobody knows what to do with a whole squash."}]}},
{k:'asapgreg',n:'ASAP Greg',g:'M',st:'fl',al:'h',tier:'prospect',bio:"Everything is urgent. Every email is high priority. Every match should have ended five minutes ago.",
 m:{t:"{A} checks his watch, sighs loudly and starts speed-running his offense.",ch:[
  {t:"Hit every signature move in thirty seconds",s:'ring',d:.15,st:.5,fat:6,ok:"Efficient. Terrifyingly efficient.",no:"He skipped a step. Several steps."},
  {al:'h',t:"Tell the referee to count faster",s:'luck',d:.05,st:.25,heat:10,ok:"The rattled ref counts at double speed. Three!",no:"The ref slows down out of spite."}]},
 p:{t:"{A} jogs to the ring, already mid-sentence.",ch:[
  {key:1,t:"Deliver the whole promo in eleven seconds",s:'mic',d:.1,p:3,ok:"Nobody caught a word. Everybody loved it.",no:"Too fast, even for him."},
  {t:"Mark the segment URGENT and leave",s:'pop',d:.05,p:2,ok:"The crowd respects the hustle.",no:"Nobody knows what was urgent."}]}},
{k:'beefsteak',n:'Beefsteak Tony',g:'M',st:'br',al:'f',tier:'prospect',pop:3,bio:"A big man with a big appetite and a bigger family. Every cousin is in the front row, and every cousin is named Tony.",
 m:{t:"The Tony section in the front row starts pounding on the barricade.",ch:[
  {t:"Feed off the Tonys and hit a running splash",s:'pop',d:.05,st:.5,popA:2,ok:"The Tonys go wild.",no:"The Tonys are disappointed. All of them."},
  {t:"Toss {B} into the Tony section",s:'ring',d:.1,st:.5,heat:8,ok:"The Tonys toss {B} right back in.",no:"The Tonys catch {A} instead."}]},
 p:{t:"{A} comes out with a steak on a fork and a napkin tucked into his singlet.",ch:[
  {key:1,t:"Introduce every Tony in the front row",s:'mic',d:.1,p:3,ok:"Tony, Tony, Tony, Tony and Big Tony all get a huge pop.",no:"He loses count around Tony number nine."},
  {t:"Challenge the whole locker room to an eating contest",s:'mic',d:.05,p:2,ok:"The crowd desperately wants to see it.",no:"Nobody takes him up on it. Smart."}]}},
{k:'wingspan',n:'"Wingspan" Hawk Barnaby',g:'M',st:'fl',al:'f',tier:'bluechip',ring:2,bio:"Arm span of a small aircraft. Will tell you the exact measurement in centimeters, then inches, then hawks.",
 m:{t:"{A} spreads his arms wide on the top rope. His shadow covers half the ring.",ch:[
  {t:"Soar off the top with a wingspan crossbody",s:'ring',d:.15,st:.75,popA:2,fat:5,ok:"He blots out the arena lights. Majestic.",no:"Clips the ring post with a wing."},
  {t:"Clothesline {B} from impossibly far away",s:'ring',d:.1,st:.5,ok:"He didn't even move. The arms did.",no:"Too far. Way too far."}]},
 p:{t:"{A} stretches his arms across the entire ring for his entrance pose.",ch:[
  {key:1,t:"Announce his exact wingspan to a hushed crowd",s:'mic',d:.1,p:3,ok:"The crowd gasps. That's huge.",no:"Someone yells that their uncle's is bigger."},
  {t:"High-five the entire front row in one sweep",s:'pop',d:.05,p:2,ok:"One sweep. Twenty high fives.",no:"He knocks over a camera."}]}},
{k:'bubbler',n:'Dave "The Bubbbler" Sandoval',g:'M',st:'pw',al:'f',tier:'prospect',bio:"Wisconsin's own. Refuses to call it a water fountain. Will fight you about it. (Yes, three b's. Don't ask.)",
 m:{t:"{A} takes a long sip from the bubbler he insisted they install next to the ring post.",ch:[
  {t:"Spray a mist of bubbler water and hit the powerslam",s:'ring',d:.1,st:.5,ok:"Hydrated and dominant.",no:"Water on the mat. He slips."},
  {t:"Make {B} admit it's called a bubbler",s:'mic',d:.1,st:.25,heat:8,ok:"\"FINE! It's a bubbler!\" {B} taps out on principle.",no:"{B} says 'water fountain.' This is war."}]},
 p:{t:"{A} wheels a drinking fountain to the ring on a dolly.",ch:[
  {key:1,t:"Explain, at length, why it's called a bubbler",s:'mic',d:.1,p:3,ok:"The whole crowd chants 'BUB-BLER!'",no:"Someone yells 'it's a water fountain.' It gets heated."},
  {t:"Offer the front row a drink",s:'pop',d:.05,p:2,ok:"Refreshing.",no:"It's lukewarm."}]}},
{k:'finewine',n:'"Fine Wine" Whitney Cheese',g:'F',st:'te',al:'f',tier:'bluechip',mic:4,bio:"Only gets better with age. Pairs well with any opponent. Brings a charcuterie board to every match.",
 m:{t:"{A} swirls an imaginary glass and studies {B} like a vintage.",ch:[
  {t:"Uncork a perfectly aged submission",s:'ring',d:.1,st:.5,popA:2,ok:"Complex. Full-bodied. {B} taps.",no:"Corked."},
  {t:"Pair {B}'s offense with the perfect counter",s:'ring',d:.05,st:.25,ok:"A flawless pairing.",no:"Notes of overconfidence."}]},
 p:{t:"{A} arrives with a cheese board and her own sommelier.",ch:[
  {key:1,t:"Describe her next opponent like a disappointing wine",s:'mic',d:.1,p:3,ok:"\"Thin. Bitter. Gone too soon.\" The crowd howls.",no:"Too many tasting notes."},
  {t:"Share the cheese board with the front row",s:'pop',d:.05,p:2,ok:"The brie goes fast.",no:"Nobody wants the blue cheese."}]}},
{k:'apollo',n:'"Apollo 11" Michael Collins',g:'M',st:'te',al:'f',tier:'prospect',bio:"Named for the astronaut who flew Apollo 11 and stayed with the ship while the other two walked on the Moon. Same energy: always reliable, never in the photo.",
 m:{t:"{A} circles patiently on the outside while everyone else gets the spotlight.",ch:[
  {t:"Wait for the perfect moment, then launch",s:'ring',d:.1,st:.5,popA:2,ok:"Liftoff.",no:"Mission scrubbed."},
  {t:"Stay in orbit and let {B} wear themselves out",s:'luck',d:.05,st:.25,ok:"Patience pays off. {B} is exhausted.",no:"{B} is also patient. Nothing happens for six minutes."}]},
 p:{t:"{A} walks out in a vintage flight suit to a ten-second countdown.",ch:[
  {key:1,t:"Give a stirring speech about the unsung heroes",s:'mic',d:.1,p:3,ok:"There isn't a dry eye in the house.",no:"The crowd chants for the other two guys."},
  {t:"Salute the crowd and let them do the rest",s:'pop',d:.05,p:2,ok:"\"COL-LINS! COL-LINS!\" The ship holds steady.",no:"Houston, we have a quiet crowd."}]}},
{k:'tiger',n:'Tony "The Gay" Tiger',g:'M',st:'sh',al:'f',tier:'bluechip',pop:6,mic:4,bio:"Out, proud and GRRREAT. Has the best entrance in the company and an unbeatable breakfast routine.",
 m:{t:"{A} strikes a pose on the turnbuckle and the whole crowd roars along with him.",ch:[
  {t:"Pounce off the top rope",s:'ring',d:.1,st:.5,popA:2,ok:"GRRREAT!",no:"A little less than great."},
  {t:"Strut, pose, then hit the finisher",s:'pop',d:.05,st:.5,popA:2,ok:"Confidence is a finishing move.",no:"{B} interrupts the strut. Rude."}]},
 p:{t:"{A} arrives to a rainbow-lit entrance, carrying a bowl of cereal.",ch:[
  {key:1,t:"Tell the crowd to start every day like a champion",s:'mic',d:.1,p:3,ok:"Everyone is GRRREAT. The whole building.",no:"It's a night show. The breakfast message doesn't land."},
  {t:"Toss mini cereal boxes into the crowd",s:'pop',d:.05,p:2,ok:"The front row fights over the frosted ones.",no:"Someone gets bonked."}]}},
{k:'turbo',n:'Todd N Turbo',g:'M',st:'fl',al:'f',tier:'prospect',pop:4,bio:"Comes out to \"Thunderstruck\" by AC/DC every single week, no matter what it costs. It costs a lot.",
 m:{t:"The arena DJ accidentally plays {A}'s music mid-match, and he's instantly re-energized.",ch:[
  {t:"Go full turbo with a flurry of strikes",s:'ring',d:.1,st:.5,popA:2,ok:"Thunder. Struck.",no:"Turbo lag."},
  {t:"Air guitar on the top rope",s:'pop',d:.1,st:.25,popA:2,ok:"The whole crowd plays along.",no:"{B} unplugs him."}]},
 p:{t:"That opening guitar riff hits, and {A} sprints to the ring.",ch:[
  {key:1,t:"Get the whole building chanting along",s:'pop',d:.1,p:3,ok:"Twenty thousand people chanting. Goosebumps.",no:"The music cuts out early. Licensing."},
  {t:"Explain what the 'N' stands for",s:'mic',d:.05,p:2,ok:"It stands for 'N'. Iconic.",no:"Nobody asked."}]}},
{k:'hughandshake',n:"Dustin \"I Don't Know if I'm Supposed to Hug or Shake Hands with This Girl I Met Once Before\" Howard",g:'M',st:'te',al:'f',tier:'prospect',bio:"Socially paralyzed. Longest nickname in wrestling. The ring announcer needs a water break halfway through it.",
 m:{t:"{B} offers a pre-match handshake just as {A} goes in for a hug.",ch:[
  {t:"Commit to the hug",s:'luck',d:.1,st:.5,popA:2,ok:"It's awkward, it's sweet — and then it's a German suplex.",no:"It becomes a half-hug, half-handshake. Everyone dies a little inside."},
  {t:"Panic and go for a roll-up",s:'luck',d:.05,st:.25,ok:"It's so awkward {B} never sees it coming. Three!",no:"{B} kicks out. More awkwardness."}]},
 p:{t:"The ring announcer starts {A}'s full nickname. Two minutes later, he's still going.",ch:[
  {key:1,t:"Thank the announcer, wave, then also try to shake his hand",s:'pop',d:.1,p:3,ok:"The crowd feels this one in their bones.",no:"Nobody knows where to look."},
  {t:"Tell the story of the girl he met once before",s:'mic',d:.05,p:2,ok:"The whole building is rooting for him.",no:"She's in the front row. He freezes."}]}},
{k:'binoculars',n:'"Looks Good from Here" Brian Binoculars',g:'M',st:'sh',al:'h',tier:'prospect',bio:"Watches every match through binoculars. From inside the ring. Including his own.",
 m:{t:"{A} backs into the far corner and studies {B} through his binoculars.",ch:[
  {t:"Spot the weakness and strike",s:'ring',d:.1,st:.5,heat:6,ok:"Looked good from there. Looks even better up close.",no:"He was looking through the wrong end."},
  {al:'h',t:"Clock {B} with the binoculars",loseNo:'dq',s:'luck',d:.05,st:.5,heat:12,ok:"Pinpoint accuracy.",no:"The ref saw it. Without binoculars."}]},
 p:{t:"{A} surveys the crowd through binoculars for a very long time.",ch:[
  {key:1,t:"Rate the crowd from a distance",s:'mic',d:.1,p:3,ok:"\"Looks good from here.\" The crowd boos and cheers at once.",no:"He rates the crowd a four. They are furious."},
  {t:"Spot someone in the upper deck and wave",s:'pop',d:.05,p:2,ok:"The upper deck goes nuts.",no:"Nobody's up there."}]}},
{k:'kraken',n:'Mick "The Kraken" McKraken',g:'M',st:'pw',al:'h',tier:'bluechip',ring:2,bio:"Rises from the deep every Wednesday night. Says he has eight limbs (the other four are 'emotional'). Smells faintly of low tide.",
 m:{t:"Someone yells 'RELEASE THE KRAKEN!' and {A} rises from underneath the ring.",ch:[
  {t:"Wrap {B} up in the tentacle hold",s:'ring',d:.1,st:.5,heat:8,ok:"Every limb accounted for. {B} taps.",no:"He runs out of tentacles."},
  {al:'h',t:"Drag {B} under the ring — back to the deep",s:'luck',d:.1,st:.5,heat:12,ok:"{B} reappears a minute later, damp and defeated.",no:"Officials pull {B} back out by the ankles."}]},
 p:{t:"Fog floods the ramp. {A} emerges from it, dripping.",ch:[
  {key:1,t:"Threaten to drag the whole roster to the depths",s:'mic',d:.1,p:3,ok:"The crowd is genuinely nervous.",no:"The fog machine drowns him out."},
  {t:"Squirt the front row with 'ink' (it's water)",s:'pop',d:.05,p:2,ok:"The splash zone loves it.",no:"It was actually ink."}]}},
{k:'samurai',n:'"No Gimmicks Needed" Steve the Samurai',g:'M',st:'te',al:'h',tier:'gen',mic:-4,bio:"Full armor. Foam katana. Battle flag. A gong. Insists he has no gimmick and is just a regular guy named Steve.",
 m:{t:"{A} draws a foam katana and bows deeply to {B}.",ch:[
  {t:"Hit a precise, honorable suplex",s:'ring',d:.1,st:.75,ok:"Clean. Disciplined. Still in full armor.",no:"The armor is very heavy."},
  {al:'h',t:"Use the foam katana while the ref looks away",s:'luck',d:.05,st:.25,heat:10,ok:"It doesn't hurt, but {B} is too confused to move.",no:"The ref confiscates it. Steve is heartbroken."}]},
 p:{t:"A gong sounds as {A} walks out in full samurai armor.",ch:[
  {key:1,t:"Insist he has no gimmick",s:'mic',d:.1,p:3,ok:"\"I'm just Steve.\" The gong sounds again. The crowd loses it.",no:"Someone points at the armor. He refuses to acknowledge it."},
  {t:"Meditate in the center of the ring",s:'pop',d:.05,p:2,ok:"Twenty thousand people go silent. Powerful.",no:"Someone starts a 'BORING' chant."}]}},
{k:'cuba3',n:'Cuba Gooding the Third',g:'M',st:'sh',al:'f',tier:'prospect',pop:3,bio:"Insists the name is a proud family tradition. Will not say where 'the Second' is. Extremely confident about all of it.",
 m:{t:"{A} points at {B} and yells \"SHOW ME THE MOVES!\"",ch:[
  {t:"Hit a showstopping spinning heel kick",s:'ring',d:.15,st:.5,popA:2,ok:"An award-worthy performance.",no:"Straight to video."},
  {t:"Celebrate early with a victory dance",s:'pop',d:.05,st:.25,popA:2,ok:"The crowd dances with him. Then he wins.",no:"{B} rolls him up mid-dance."}]},
 p:{t:"{A} comes out in a tuxedo, clutching a trophy he will not explain.",ch:[
  {key:1,t:"Give an acceptance speech for an award nobody gave him",s:'mic',d:.1,p:3,ok:"He thanks his agent, his mom and 'the Second'. The crowd is moved.",no:"The music plays him off."},
  {t:"Ask the crowd to show him some love",s:'pop',d:.05,p:2,ok:"They show him a LOT of love.",no:"Lukewarm. He's hurt."}]}},
{k:'cooldad',n:'"Cool Dad" Don Crenshaw',g:'M',st:'br',al:'f',tier:'prospect',pop:3,bio:"Grills in the parking lot before every show. Calls everyone 'champ'. Wears his sunglasses on the back of his head.",
 m:{t:"{A} stops to adjust his sunglasses and tell {B} he's proud of the effort.",ch:[
  {t:"Dad strength: one perfect bodyslam",s:'ring',d:.05,st:.5,popA:2,ok:"He didn't even spill his iced tea.",no:"He pulled something. He'll be fine. He says."},
  {t:"Give {B} a pep talk mid-match",loseNo:'pin',s:'mic',d:.1,st:.25,ok:"{B} feels great about themselves — and gets pinned.",no:"{B} feels great about themselves and wins."}]},
 p:{t:"{A} walks out in cargo shorts, holding grill tongs.",ch:[
  {key:1,t:"Tell the crowd a dad joke",s:'mic',d:.1,p:3,ok:"The groan is deafening. It's perfect.",no:"It ran long. He lost the punchline."},
  {t:"Toss hot dogs off the grill to the crowd",s:'pop',d:.05,p:2,ok:"Perfect grill marks. The fans love him.",no:"He forgot the buns."}]}},
{k:'volkoff',n:'Nickleback Volkoff',g:'M',st:'pw',al:'h',tier:'prospect',mic:3,bio:"Before every match he demands the crowd stand in silence while he sings an entire Nickelback song. They have never once done it.",
 m:{t:"{A} grabs the ring announcer's mic and starts singing. {B} is begging him to stop.",ch:[
  {al:'h',t:"Keep singing until {B} snaps",s:'mic',d:.1,st:.5,heat:12,ok:"{B} charges in a blind rage — straight into a powerslam.",no:"{B} puts in earplugs."},
  {t:"Stop singing and just wrestle",s:'ring',d:.05,st:.25,ok:"The crowd cheers. Mostly because he stopped singing.",no:"He hums the rest of the match."}]},
 p:{t:"{A} demands the crowd rise 'for the anthem.'",ch:[
  {key:1,t:"Sing the whole song",s:'mic',d:.1,p:3,ok:"The boos are thunderous. Mission accomplished.",no:"A few people sing along. That's somehow worse."},
  {t:"Insult the town's taste in music",s:'mic',d:.05,p:2,ok:"The crowd has never hated anyone more.",no:"They kind of agree with him."}]}},
{k:'boomer',n:'Boomer Scarborough',g:'M',st:'br',al:'h',tier:'prospect',bio:"Believes any problem can be solved with a firm handshake and a printed résumé. Owns a landline. Is 26.",
 m:{t:"{A} tries to hand {B} a printed challenge mid-match.",ch:[
  {t:"Apply The Firm Handshake, a grip of death",s:'ring',d:.1,st:.5,ok:"Firm. Eye contact. {B} taps.",no:"Limp. Disappointing."},
  {al:'h',t:"Lecture {B} about how nobody wants to work anymore",s:'mic',d:.1,st:.25,heat:8,ok:"{B} is so annoyed they make a mistake.",no:"{B} says \"OK, Boomer.\" Devastating."}]},
 p:{t:"{A} reads his promo off a printed sheet in a plastic sleeve.",ch:[
  {key:1,t:"Complain about the price of everything",s:'mic',d:.1,p:3,ok:"The crowd groans in agreement.",no:"He reads the wrong page."},
  {t:"Hand out business cards",s:'pop',d:.05,p:2,ok:"Surprisingly classy cards.",no:"Nobody takes one."}]}},
{k:'keides',n:'Anthony Keides',g:'M',st:'fl',al:'f',tier:'prospect',ring:2,bio:"Wrestles shirtless, bouncing, upside down whenever possible. Spells his name differently and wants you to know it.",
 m:{t:"{A} bounces around the ring like he's at a festival, refusing to stand still.",ch:[
  {t:"Handspring into a cutter",s:'ring',d:.15,st:.5,popA:2,ok:"Pure funk.",no:"Over-bounced."},
  {t:"Hang upside down from the turnbuckle and taunt {B}",s:'pop',d:.05,st:.25,ok:"The crowd goes wild.",no:"All the blood rushes to his head."}]},
 p:{t:"{A} bounces to the ring in a beanie and absolutely nothing else above the waist.",ch:[
  {key:1,t:"Spell his last name for the crowd",s:'mic',d:.1,p:3,ok:"K-E-I-D-E-S. The crowd spells it back.",no:"He spells it wrong. His own name."},
  {t:"Do a headstand on the turnbuckle",s:'pop',d:.05,p:2,ok:"Upside down and loving it.",no:"He tips over."}]}},
{k:'mahogony',n:'"Hardwood" Rich Mahogony',g:'M',st:'sh',al:'h',tier:'bluechip',mic:5,bio:"Very important. Owns many leather-bound books. Everything he touches smells of rich hardwood.",
 m:{t:"{A} pauses mid-match to polish the turnbuckle with a cloth.",ch:[
  {t:"Hit the Grain of the Wood elbow drop",s:'ring',d:.1,st:.5,heat:6,ok:"Polished. Expensive. Effective.",no:"Splinters."},
  {al:'h',t:"Hit {B} with a leather-bound book",loseNo:'dq',s:'luck',d:.05,st:.5,heat:12,ok:"First edition. Very heavy.",no:"The ref saw the book. Classy cheating, though."}]},
 p:{t:"{A} enters to smooth jazz, wearing a velvet smoking jacket.",ch:[
  {key:1,t:"Read a passage from one of his leather-bound books",s:'mic',d:.1,p:3,ok:"The crowd is furious and somehow impressed.",no:"Too much reading."},
  {t:"Tell the crowd they could never afford his furniture",s:'mic',d:.05,p:2,ok:"The boos echo off his solid hardwood.",no:"Someone yells 'IKEA!'"}]}},
{k:'scoot',n:'Scoot Tatum',g:'M',st:'fl',al:'f',tier:'prospect',bio:"Arrives everywhere on a kick scooter. Everywhere. Including the top rope.",
 m:{t:"{A} rolls into the ring on his scooter mid-match.",ch:[
  {t:"Scoot off the apron into a dive",s:'ring',d:.15,st:.5,popA:2,fat:5,ok:"Elite scoot.",no:"He forgot to brake."},
  {t:"Land a kickflip while {B} watches",s:'pop',d:.1,st:.25,popA:2,ok:"{B} is mesmerized. Roll-up. Three!",no:"The scooter shoots into the crowd."}]},
 p:{t:"{A} scoots up the ramp, kicks off and glides all the way to the ring.",ch:[
  {key:1,t:"Challenge the locker room to a scooter race",s:'mic',d:.1,p:3,ok:"The crowd wants that race so badly.",no:"Nobody else owns a scooter."},
  {t:"Give his scooter to a kid in the crowd",s:'pop',d:.05,p:2,ok:"The kid is losing their mind. So is everyone else.",no:"He immediately asks for it back."}]}}];
