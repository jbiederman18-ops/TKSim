/* Tony Khan Simulator — deeply silly gimmick prospects.
   Now and then the scouting board turns up one of these. Each has a bio, its own match moment (m) and its own promo
   opener and lines (p), which only come up when that wrestler is involved. Everything else (training, feuds, titles)
   works like any other prospect. Fields: k key · n name · g M/F · st style · al face/heel · tier · bio · ring/mic/pop
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
{k:'actor',n:'Famous Actor Chad Brightwell',g:'M',st:'sh',al:'h',tier:'prospect',mic:8,bio:"Insists he's a household-name Hollywood star. Nobody has seen any of his movies. Neither has IMDb.",
 m:{t:"{A} stops mid-match to ask the director — there is no director — for another take.",ch:[
  {t:"Redo the last move, 'with more feeling'",s:'pop',d:.1,st:.5,popA:2,ok:"Take two is a masterpiece. The crowd demands an Oscar.",no:"Take two is somehow worse than take one."},
  {al:'h',t:"Demand {B} 'hit their mark' and then clothesline them on it",s:'ring',d:.05,st:.5,heat:12,ok:"{B} stands exactly where they were told and gets flattened. Hollywood is brutal.",no:"{B} ignores the blocking notes."}]},
 p:{t:"{A} walks out in sunglasses and a bathrobe, signing autographs nobody asked for.",ch:[
  {key:1,t:"Recite the plot of his 'upcoming blockbuster'",s:'mic',d:.1,p:3,ok:"It's the plot of a movie that already exists. The crowd boos with delight.",no:"He forgets the plot halfway through."},
  {t:"Thank the Academy",s:'mic',d:.05,p:2,ok:"There is no award. The speech is eleven minutes long. Incredible heat.",no:"The music plays him off. Like at the real Oscars."}]}},
{k:'teacher',n:'Substitute Teacher Ms. Pembrook',g:'F',st:'te',al:'h',tier:'prospect',mic:6,bio:"Takes attendance before every match. Will not start until everyone in the arena is seated and quiet.",
 m:{t:"{A} blows a whistle and informs {B} that they are being sent to the principal's office.",ch:[
  {t:"Give {B} detention in a surfboard stretch",s:'ring',d:.1,st:.5,heat:8,ok:"{B} learns a valuable lesson about respecting substitutes.",no:"{B} asks for a hall pass and escapes."},
  {t:"Hand out a pop quiz mid-match",s:'mic',d:.1,st:.25,popA:2,ok:"{B} fails. Visibly shaken.",no:"{B} gets a perfect score. {A} demands to see their work."}]},
 p:{t:"{A} walks to the ring with a clipboard and begins taking attendance.",ch:[
  {key:1,t:"Mark the entire front row absent",s:'mic',d:.05,p:3,ok:"They are present. They are furious. Beautiful heat.",no:"The front row answers 'here' in unison. Checkmate."},
  {t:"Announce that there will be a test on Friday",s:'mic',d:.1,p:2,ok:"Twenty thousand people groan at once.",no:"Nobody believes her. It's Tuesday."}]}},
{k:'trophy',n:'The Human Participation Trophy',g:'M',st:'br',al:'f',tier:'prospect',pop:8,bio:"Has never won a match. Gets a trophy after every single one anyway. The fans adore him for it.",
 m:{t:"{A} is losing badly, but a ringside attendant is already polishing a trophy for them.",ch:[
  {t:"Fight on — everyone's a winner",s:'pop',d:.15,st:.75,popA:3,ok:"'YOU TRIED YOUR BEST' chants shake the building.",no:"They lost. They still get the trophy."},
  {t:"Hit {B} with the trophy",dq:1,s:'luck',d:.05,st:.25,heat:10,ok:"Disqualified. Still gets the trophy.",no:"The trophy is plastic. It breaks. Tears."}]},
 p:{t:"{A} comes out clutching a shelf full of trophies to thunderous applause.",ch:[
  {key:1,t:"Thank every opponent who ever beat them",s:'pop',d:.05,p:4,ok:"It takes a while. The crowd cheers every name.",no:"The list is so long the show goes to commercial."},
  {t:"Promise that someday they'll win one for real",s:'mic',d:.1,p:3,ok:"Not a dry eye in the house.",no:"The crowd isn't sure they believe it either."}]}},
{k:'posh',n:'Sir Reginald Crumpet III',g:'M',st:'te',al:'h',tier:'bluechip',mic:6,bio:"Arrives by horse-drawn carriage. Wrestles with his pinky extended. Believes the ring is 'rather common'.",
 m:{t:"{A} pauses the match for afternoon tea, served by a butler who is already in the ring.",ch:[
  {t:"Finish the tea, then apply a very proper wristlock",s:'ring',d:.1,st:.5,heat:8,ok:"Civilised and devastating.",no:"{B} knocks the teacup over. An international incident."},
  {al:'h',t:"Have the butler trip {B}",s:'luck',d:.05,st:.5,heat:12,ok:"The butler does it without changing his expression. Chilling.",no:"The butler refuses. He has standards."}]},
 p:{t:"A trumpet fanfare plays. {A} is carried to the ring on a velvet chair.",ch:[
  {key:1,t:"Refer to the crowd as 'the peasantry'",s:'mic',d:.05,p:3,ok:"The peasantry is outraged.",no:"The peasantry doesn't know what peasantry means."},
  {t:"Challenge anyone to a duel, pistols optional",s:'mic',d:.1,p:2,ok:"Nobody accepts. {A} declares victory by default.",no:"Someone accepts. {A} suddenly remembers a prior engagement."}]}},
{k:'hr',n:'Brenda from HR',g:'F',st:'pw',al:'h',tier:'prospect',ring:4,bio:"Files a formal complaint against every opponent. Has a disturbing number of forms.",
 m:{t:"{A} pulls a form from their gear and begins filing a complaint against {B} mid-match.",ch:[
  {t:"Suspend {B} with a powerbomb 'pending review'",s:'ring',d:.1,st:.5,heat:10,ok:"The review found {B} guilty.",no:"{B} reports {A} to a higher HR department."},
  {t:"Schedule a mandatory sensitivity seminar right now",s:'mic',d:.1,st:.25,popA:2,ok:"{B} has to sit through a slideshow. The crowd boos gleefully.",no:"The projector doesn't work."}]},
 p:{t:"{A} walks out with a stack of forms and a lanyard.",ch:[
  {key:1,t:"Read the locker room's complaints aloud",s:'mic',d:.1,p:3,ok:"The locker room will never feel safe again.",no:"Most of the complaints are about Brenda."},
  {t:"Announce a mandatory team-building exercise",s:'mic',d:.05,p:2,ok:"Nobody wants to do trust falls. The crowd boos.",no:"Nobody shows up to it."}]}},
{k:'doll',n:'The Haunted Victorian Doll',g:'F',st:'fl',al:'h',tier:'bluechip',pop:6,bio:"Found in an attic in 1893. Never blinks. The lights flicker whenever she wins.",
 m:{t:"The lights flicker. When they come back, {A} is standing directly behind {B}. Nobody saw her move.",ch:[
  {t:"Tilt her head slowly, then strike",s:'pop',d:.1,st:.75,heat:10,ok:"The crowd screams. Genuinely.",no:"{B} turns around first. Awkward for everyone."},
  {t:"Sit perfectly still until {B} gets too close",s:'luck',d:.05,st:.5,heat:8,ok:"{B} leans in and gets rolled up. Terrifying.",no:"{B} just leaves her there."}]},
 p:{t:"A music box plays. {A} is wheeled to the ring in a glass case.",ch:[
  {key:1,t:"Say nothing and let the music box play",s:'pop',d:.1,p:4,ok:"Twenty thousand people are too scared to boo.",no:"The music box runs down. Silence."},
  {t:"Whisper a name from the locker room",s:'mic',d:.1,p:3,ok:"Somewhere in the back, a wrestler screams.",no:"Nobody hears it."}]}},
{k:'pirate',n:'Captain Seagull',g:'M',st:'br',al:'f',tier:'prospect',pop:5,bio:"A fearsome pirate who is afraid of water, boats and, to a lesser degree, seagulls.",
 m:{t:"{A} hears a seagull noise from the crowd and freezes in terror.",ch:[
  {t:"Overcome the fear and hit a flying elbow",s:'pop',d:.15,st:.75,popA:3,ok:"The crowd roars. A pirate reborn!",no:"The seagull noise happens again. He's out."},
  {t:"Make {B} walk the plank off the apron",s:'ring',d:.1,st:.5,ok:"{B} takes a long fall to the floor. Arrrr.",no:"{B} refuses to walk the plank."}]},
 p:{t:"{A} swaggers out in full pirate gear and immediately gets seasick on the ramp.",ch:[
  {key:1,t:"Promise to lead the fans to buried treasure",s:'mic',d:.1,p:3,ok:"The treasure is a box of t-shirts. The fans are thrilled.",no:"He can't find the map."},
  {t:"Lead the crowd in a sea shanty",s:'pop',d:.05,p:3,ok:"The whole arena sings. Pure joy.",no:"Nobody knows the words."}]}},
{k:'vamp',n:'Discount Dracula',g:'M',st:'sh',al:'h',tier:'prospect',bio:"An ancient creature of the night who is scared of the dark, allergic to garlic and deeply in debt.",
 m:{t:"{A} lunges for {B}'s neck and gets distracted by their own reflection in the ring post.",ch:[
  {t:"Recover with a menacing cape swirl",s:'pop',d:.1,st:.5,popA:2,ok:"The cape is magnificent. The crowd hisses.",no:"The cape gets caught in the ropes."},
  {al:'h',t:"Throw 'garlic' (a breadstick) at {B}",s:'luck',d:.05,st:.25,heat:10,ok:"{B} is confused enough to be pinned.",no:"{B} eats the breadstick."}]},
 p:{t:"The lights go out. {A} asks, quite urgently, for them to be turned back on.",ch:[
  {key:1,t:"Declare that the night belongs to him",s:'mic',d:.1,p:3,ok:"It's 8:15pm. The crowd boos anyway.",no:"Someone points out it's still light outside."},
  {t:"Hypnotise a fan in the front row",s:'luck',d:.1,p:3,ok:"It works?! The fan cheers for {A}. Everyone is unsettled.",no:"The fan just laughs."}]}},
{k:'grandma',n:'Grandma Knuckles',g:'F',st:'br',al:'f',tier:'prospect',ring:-2,pop:10,bio:"Seventy-two years old. Undefeated at bingo. Has hit more people with a purse than anyone alive.",
 m:{t:"{A} reaches into her purse. The whole building knows what's coming.",ch:[
  {t:"Purse shot!",dq:1,s:'luck',d:.05,st:.5,popA:3,heat:8,ok:"The ref 'didn't see it'. The crowd erupts.",no:"The ref saw it. Grandma doesn't care."},
  {t:"Pull out a hard candy and offer {B} one",s:'pop',d:.05,st:.25,popA:2,ok:"{B} accepts. Roll-up. Three count.",no:"{B} declines. Grandma is offended."}]},
 p:{t:"{A} slowly makes her way down the ramp with a walker, which she then throws at the ring.",ch:[
  {key:1,t:"Tell the locker room they're all too soft",s:'mic',d:.1,p:4,ok:"The crowd agrees completely.",no:"She drifts into a story about 1968."},
  {t:"Pinch the ring announcer's cheek",s:'pop',d:0,p:3,ok:"He's embarrassed. The crowd loves it.",no:"He dodges. She's disappointed in him."}]}},
{k:'influencer',n:"Like & Subscribe Kayleigh",g:'F',st:'sh',al:'h',tier:'prospect',mic:5,bio:"Films every match on a ring light attached to her head. Four million followers. Nine of them are real.",
 m:{t:"{A} stops to film a quick vertical video for her followers — with {B} still in the ring.",ch:[
  {t:"Film a reaction video of {B}'s pain",s:'mic',d:.05,st:.25,heat:10,ok:"The video goes viral. The crowd is disgusted.",no:"The ring light blinds her."},
  {t:"Ask chat what move to do next",s:'luck',d:.1,st:.5,popA:2,ok:"Chat says 'moonsault'. She actually hits it.",no:"Chat says 'lose'. She loses."}]},
 p:{t:"{A} livestreams her entrance, narrating to her followers.",ch:[
  {key:1,t:"Remind everyone to like and subscribe",s:'mic',d:.05,p:3,ok:"The crowd chants 'NO'. Great engagement.",no:"The stream crashes."},
  {t:"Announce a new merch drop",s:'pop',d:.1,p:2,ok:"It's a hoodie that costs $180. Pure villainy.",no:"The website crashes."}]}},
{k:'cop',n:'Mall Cop Marv',g:'M',st:'pw',al:'f',tier:'prospect',bio:"Takes mall security extremely seriously. Rides a Segway to the ring. Has never made an arrest.",
 m:{t:"{A} blows a whistle and informs {B} that they are loitering in the ring.",ch:[
  {t:"Escort {B} off the premises with a powerslam",s:'ring',d:.1,st:.5,popA:2,ok:"Order is restored to the food court.",no:"{B} shows a receipt and is allowed to stay."},
  {t:"Chase {B} around the ring on the Segway",s:'luck',d:.1,st:.25,popA:2,ok:"He catches them. Barely.",no:"The Segway battery dies."}]},
 p:{t:"{A} rides a Segway down the ramp at a stately four miles an hour.",ch:[
  {key:1,t:"Remind the fans that running is not allowed",s:'mic',d:.05,p:3,ok:"The crowd walks, briskly, to the concessions. Order!",no:"Everyone runs anyway."},
  {t:"Check everyone's bags for outside snacks",s:'pop',d:.1,p:2,ok:"He confiscates a pretzel. The crowd cheers.",no:"He eats the pretzel. The crowd boos."}]}},
{k:'nap',n:'Mister Nap',g:'M',st:'te',al:'f',tier:'bluechip',mic:-5,bio:"The most talented technical wrestler of his generation. Falls asleep in rest holds. Sometimes in his own.",
 m:{t:"{A} locks in a rest hold… and starts snoring.",ch:[
  {t:"Wake up and roll into a submission",s:'ring',d:.15,st:.75,popA:2,ok:"He was never asleep! Or was he? The crowd goes wild.",no:"He was asleep. The ref counts three."},
  {t:"Let the crowd wake him with a chant",s:'pop',d:.05,st:.5,popA:3,ok:"'WAKE UP NAP!' He springs to life.",no:"He rolls over."}]},
 p:{t:"{A} walks out in pajamas holding a pillow.",ch:[
  {key:1,t:"Try to cut a promo before dozing off",s:'mic',d:.15,p:3,ok:"He gets through it. The crowd applauds his effort.",no:"Asleep by the third sentence."},
  {t:"Tuck in the front row",s:'pop',d:.05,p:3,ok:"The coziest segment in history.",no:"They don't want to be tucked in."}]}},
{k:'weather',n:'Stormy Pete, Channel 7 Weather',g:'M',st:'sh',al:'f',tier:'prospect',mic:8,bio:"Delivers a full forecast before every match. Has never once been right.",
 m:{t:"{A} pauses the match to point at a green screen that isn't there.",ch:[
  {t:"Forecast a 90% chance of a clothesline",s:'mic',d:.05,st:.5,popA:2,ok:"The forecast is correct for the first time. Historic.",no:"Unseasonably sunny. {B} hits him first."},
  {t:"Hit a move called the Cold Front",s:'ring',d:.1,st:.5,ok:"It's just a dropkick, but the name sells it.",no:"The cold front stalls over the apron."}]},
 p:{t:"{A} walks out holding a clicker and gestures at an imaginary weather map.",ch:[
  {key:1,t:"Deliver the five-day forecast",s:'mic',d:.1,p:3,ok:"Warm and informative. The crowd applauds the barometric pressure.",no:"He gets every day wrong. It's raining in the building."},
  {t:"Issue a severe storm warning for his opponents",s:'mic',d:.1,p:3,ok:"The locker room takes shelter.",no:"Nobody evacuates."}]}},
{k:'box',n:'The Box',g:'M',st:'pw',al:'h',tier:'bluechip',ring:4,mic:-15,bio:"A cardboard box that walks to the ring. Nobody knows who is inside. The contract was signed with a crayon.",
 m:{t:"{A} sits down in the corner and becomes completely motionless. It is, at this point, just a box.",ch:[
  {t:"Wait for {B} to check inside, then strike",s:'luck',d:.05,st:.75,heat:10,ok:"{B} peeks in. {B} is never the same.",no:"{B} just leaves the box alone."},
  {t:"Tip over and roll across the ring onto {B}",s:'ring',d:.1,st:.5,ok:"A shocking amount of force for a box.",no:"The box rolls out of the ring."}]},
 p:{t:"A large cardboard box is placed in the ring. It has a mic taped to the side.",ch:[
  {key:1,t:"Stay completely silent",s:'pop',d:.1,p:4,ok:"The box says nothing. The crowd chants 'BOX! BOX! BOX!'",no:"The crowd is bored of the box."},
  {t:"A small hand emerges and waves",s:'luck',d:.05,p:3,ok:"The crowd screams. Who is in there?!",no:"The hand goes back in."}]}},
{k:'chef',n:'Chef Remy Flambé',g:'M',st:'sh',al:'h',tier:'prospect',bio:"Classically trained. Cooks a three-course meal at ringside during his matches. Nobody is allowed to eat it.",
 m:{t:"{A} ducks out to the ringside stove to check on the soufflé.",ch:[
  {t:"Serve {B} a knuckle sandwich",s:'ring',d:.05,st:.5,heat:6,ok:"Perfectly seasoned.",no:"{B} sends it back to the kitchen."},
  {al:'h',t:"Throw flour in {B}'s eyes",s:'luck',d:.05,st:.5,heat:12,ok:"{B} is blinded. Delicious villainy.",no:"The flour goes everywhere. Including {A}."}]},
 p:{t:"{A} wheels a kitchen station down the ramp and lights a pan on fire.",ch:[
  {key:1,t:"Call the fans' taste in food 'pedestrian'",s:'mic',d:.05,p:3,ok:"The crowd is personally offended. Great heat.",no:"The fans agree, honestly."},
  {t:"Eat the entire meal in front of the crowd",s:'luck',d:0,p:2,ok:"The boos are hungry and angry.",no:"It's too hot. He burns his tongue."}]}},
{k:'spell',n:'Two-Time Spelling Bee Champion Priya Anand',g:'F',st:'te',al:'f',tier:'bluechip',mic:4,bio:"Spells the name of every move before she does it. The referee is required to confirm the spelling.",
 m:{t:"{A} announces she's going to do a move and asks for its definition and use in a sentence.",ch:[
  {t:"Spell 'B-R-I-D-G-I-N-G S-U-P-L-E-X' and hit it",s:'ring',d:.15,st:.75,popA:3,ok:"Correct! Three count!",no:"She spells it wrong and loses her concentration."},
  {t:"Challenge {B} to spell their own finisher",s:'mic',d:.1,st:.25,popA:2,ok:"{B} can't. Devastating psychological damage.",no:"{B} spells it perfectly. Humiliating."}]},
 p:{t:"{A} walks out holding a dictionary and a trophy from 2009.",ch:[
  {key:1,t:"Spell out the name of her next opponent — slowly",s:'mic',d:.1,p:3,ok:"The crowd spells along. Every letter lands.",no:"Their name has a silent letter. Chaos."},
  {t:"Correct the crowd's signs",s:'pop',d:.05,p:2,ok:"The crowd appreciates the feedback. Mostly.",no:"The signs were correct. She's shaken."}]}},
{k:'chiro',n:'The Unlicensed Chiropractor',g:'M',st:'te',al:'h',tier:'prospect',bio:"Cracks backs. Nobody asked. His diploma is written on a napkin.",
 m:{t:"{A} grabs {B} in a bear hug and announces that it's 'just an adjustment'.",ch:[
  {t:"Crack {B}'s back until something pops",s:'ring',d:.1,st:.5,heat:10,ok:"{B} feels, somehow, better. Then {A} pins them.",no:"Nothing pops. Awkward silence."},
  {al:'h',t:"Offer {B} a free consultation — then attack",s:'luck',d:.05,st:.5,heat:12,ok:"{B} fell for it. Classic malpractice.",no:"{B} checks his credentials first."}]},
 p:{t:"{A} walks out with a portable massage table and a stack of business cards.",ch:[
  {key:1,t:"Offer the front row a free adjustment",s:'mic',d:.1,p:3,ok:"Security has to step in. The crowd boos gleefully.",no:"Nobody volunteers."},
  {t:"Announce that he's now accepting insurance",s:'mic',d:.05,p:2,ok:"He's not. The crowd is outraged.",no:"Nobody believes him anyway."}]}},
{k:'pigeon',n:'Lord Pigeon',g:'M',st:'fl',al:'h',tier:'prospect',pop:5,bio:"Claims to command every pigeon in the city. Has one pigeon. Its name is Gerald.",
 m:{t:"{A} lets out a shrill whistle. Somewhere in the rafters, a single pigeon stirs.",ch:[
  {t:"Fly off the top rope like the pigeons taught him",s:'ring',d:.15,st:.75,fat:5,ok:"A majestic dive. Gerald would be proud.",no:"Pigeons are not known for their landing."},
  {al:'h',t:"Have Gerald distract the referee",s:'luck',d:.1,st:.5,heat:10,ok:"Gerald lands on the ref's head. {A} cheats freely.",no:"Gerald doesn't show up. Gerald never shows up."}]},
 p:{t:"{A} walks out with a pigeon on his shoulder and demands silence for Gerald.",ch:[
  {key:1,t:"Explain the pigeon hierarchy",s:'mic',d:.1,p:3,ok:"It's weirdly detailed. The crowd is hooked.",no:"Gerald flies away mid-speech."},
  {t:"Threaten the city's statues",s:'mic',d:.05,p:2,ok:"The crowd boos on behalf of the statues.",no:"Nobody knows why this is a threat."}]}},
{k:'karaoke',n:'Karaoke Katie',g:'F',st:'sh',al:'f',tier:'prospect',mic:6,pop:6,bio:"Sings her own entrance music, live, badly, every single time. The crowd sings along anyway.",
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
{k:'jeff',n:'Jeff',g:'M',st:'te',al:'f',tier:'gen',mic:-12,pop:-4,bio:"Just Jeff. No gimmick. No catchphrase. No entrance music. Might be the most gifted wrestler in the world.",
 m:{t:"{A} just… wrestles. It's incredible. Nobody knows how to react.",ch:[
  {t:"Keep doing it",s:'ring',d:.1,st:.75,ok:"'JEFF! JEFF! JEFF!' The crowd has discovered him.",no:"He's too subtle for the crowd tonight."},
  {t:"Give a small thumbs up",s:'pop',d:.05,st:.25,popA:3,ok:"The most charisma Jeff has ever shown. The crowd explodes.",no:"Nobody sees it."}]},
 p:{t:"{A} walks to the ring in plain black trunks. There's no music.",ch:[
  {key:1,t:"Say 'Hi. I'm Jeff.'",s:'mic',d:.1,p:3,ok:"The crowd chants 'HI JEFF'. A movement begins.",no:"Silence. Jeff leaves."},
  {t:"Do one perfect push-up and leave",s:'pop',d:.05,p:2,ok:"The crowd respects it.",no:"Nobody understands."}]}}];
