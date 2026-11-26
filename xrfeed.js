/* v505: X Redditino's timeline. After the crowd table in the reveal (and on Full results), your Head of PR reads the room:
   a one-line update, then posts from the crowds that loved or hated the show, each in that crowd's voice, and a "Next week"
   note that carries the crowd tip in his words. Tap the other booker's fan total and he reads their timeline instead.
   A show's posts are picked once and kept on its result (r.xr), so a replay shows the same timeline. Recently used posts
   (S.xrSeen) are skipped so the same line doesn't come back week after week.

   Writing posts: tokens are {A} and {B} (the first two names in the segment), {M} (the segment, e.g. "A vs B"),
   {ST} (its stars, e.g. 4¼), {OT} (the other booker) and {SH} (tonight's show). A post only runs when its tokens can be
   filled. Casual posts are lowercased whole. A post starting with ^ is shouted in caps. */
const XR_HANDLES={
 cas:['@JustHereForTheBelts','@MyDadWatchesThis','@CasualTuesdayKev','@BigMusclesBrad','@FlippedFromFootball','@SnackBreakSteve','@RemoteControlRon','@ThoughtThisWasBoxing','@OneEyeOnTheGame','@WhoIsThatGuy99'],
 tech:['@ChainWrestlingCarl','@HeadlockHistorian','@SnapSuplexSue','@WristlockWendell','@MatClassicsMarv','@SellingIsAnArt','@BridgingBernard','@FeelingOutProcess','@HammerlockHannah'],
 blood:['@CrimsonMaskMike','@BarbedWireBetty','@BladeJobBrandon','@StapleGunStacy','@TetanusTerry','@ChairShotCharlene','@RedCanvasRick','@StitchCountSteph'],
 flip:['@SpotMonkeyKai','@ShootingStarSam','@450Splashley','@GuardrailGraveyard','@NoGravityNico','@TopRopeTasha','@DiveCounterDev','@PhoenixSplashPaz'],
 chaos:['@RunInRhonda','@NoDQNate','@TrashCanTrevor','@RefBumpRandy','@ParkingLotPat','@LightsOutLola','@AfterTheBellBella','@SwerveSzn']};
const XR_POSTS={
cas:{
 love:["that was a great show. i don’t know who half of them were but they all looked very strong",
  "my dad said “that’s the guy” every time someone came out. he was right every time",
  "the lights went off and on and then a guy was just there. incredible. how do they do that",
  "watched the whole thing. didn’t even check my phone. well except for this",
  "my girlfriend asked if it was real and i said it doesn’t matter. she said that’s not an answer. great show though",
  "i only knew like three wrestlers and all three were on. good job tv",
  "the big guy did the big move. that’s all i need from life",
  "fell asleep last week. did not fall asleep this week. growth",
  "{SH} was awesome. i told my coworker about it and he didn’t care but i told him anyway",
  "every entrance had fire or smoke or both. i would watch a show that’s just entrances"],
 loveM:["{A} and {B}?? i know both of them!! from the internet",
  "{M} was so good i stood up. then i sat back down. then i stood up again",
  "the {A} match was like a movie. a long movie. a good long movie",
  "{A} came out and my whole family went quiet. even the baby",
  "i would pay money to watch {A} again. i guess i already do. that’s how tv works right",
  "{A} vs {B}. i don’t know what they were mad about but i’m also mad about it now",
  "my uncle says {A} is the best in the world. my uncle has never been wrong about anything except twice",
  "{M}. that’s it. that’s the tweet",
  "i only came for {A} and i was not disappointed. who else was on? doesn’t matter"],
 stars:["so many famous people on one show. it was like the oscars but they hit each other",
  "every time i looked up someone famous was getting hit. 10/10",
  "they put all the big names on tonight. that’s what i’m talking about. the big names",
  "my mom recognized three wrestlers. my mom. that’s how you know it was a big show"],
 titles:["belts!! so many belts!! i love when they hold them up",
  "someone held a belt over their head and i cheered and i don’t even know which belt",
  "title match means it matters. i read that somewhere. it mattered",
  "there were so many belts tonight. i counted 4. maybe 5. one guy had two??"],
 story:["ok i didn’t watch the last few weeks but i could tell they REALLY don’t like each other",
  "i finally get why those two are fighting. i think. it’s about respect? or a car?",
  "my wife and i are now invested in the drama. we have picked sides. we are not speaking",
  "i don’t know the backstory but the guy yelling at the other guy made me believe it"],
 spec:["there was a cage. i love when there’s a cage. cages are the best part",
  "they had a ladder and someone climbed it. i was so nervous. ladders are dangerous",
  "anything with a gimmick in the name i’m watching. that’s my rule",
  "big match, big stuff, big show. that’s all i ask"],
 meh:["it was fine. i was on my phone for some of it. it was fine",
  "kinda watched. kinda didn’t. i’ll probably watch next week. probably",
  "who was that guy. the one with the music. anyway it was ok",
  "decent. needed more people i’ve heard of",
  "half watched it while making nachos. the nachos were better but the show was close",
  "it was good when there was a famous person and less good when there wasn’t",
  "i’ll keep watching but somebody needs to win a belt or something"],
 hate:["flipped to the game at the main event. came back and the same two people were still lying down",
  "who are these people. where is the guy from the commercials",
  "no title matches?? then what are they even fighting about",
  "i don’t know any of these wrestlers and at this point i’m afraid to ask",
  "dad fell asleep during the second match. dad never falls asleep. dad watched a whole golf tournament once",
  "is this the b team? feels like the b team",
  "changed the channel to a cooking show. a man made bread. it was more exciting",
  "my friend said this show was good now. my friend lies",
  "zero people i’ve heard of. i heard of the ring though. nice ring",
  "turned it off and went to bed at 9. i’m 34"],
 sw:["switched over to {OT}. they had the famous ones",
  "sorry. {OT} had more belts",
  "{OT} had a guy i know. that’s all it takes. that’s the whole secret",
  "my brother made us watch {OT} instead. my brother was right. i hate when my brother is right"],
 swin:["came over from {OT} because my cousin said this one had the famous guys. my cousin was right for once",
  "{OT} was boring so i’m here now. is this the good one",
  "left {OT} at the commercial and never went back. i live here now"]},
tech:{
 love:["Clean finish. No run-ins. No nonsense. I wept quietly, then logged the match in my spreadsheet (tab 14).",
  "I rarely award a quarter star for a hammerlock transition. Tonight I awarded two. I am not well.",
  "Watched it twice. The second time with the commentary muted, as intended.",
  "Two technicians, a clean pinfall and not one wasted movement. This is what the medium is for. Everything else is merch.",
  "Finally, a show that respects the wristlock as a narrative device.",
  "My wife asked why I was applauding a headlock. I said she wouldn’t understand. She agreed.",
  "The mat work tonight had a vocabulary. You either speak it or you don’t.",
  "Ring psychology: present. Selling: consistent. Limb work: followed through. I may frame the card.",
  "Somewhere a 1987 house show is smiling."],
 loveM:["{M} was chain wrestling as chamber music.",
  "{A} and {B} worked the opening ten minutes like a chess game where both players actually know the rules.",
  "{M} at {ST} stars is, if anything, conservative. I’ve filed a correction with myself.",
  "The counter-for-counter sequence in {M} should be taught. I will be teaching it. To my nephew. He’s six.",
  "{A} worked a body part for twelve minutes and {B} sold it until the final bell. Continuity. What a concept.",
  "{M} reminded me why I still watch. It also reminded me why I watch alone.",
  "{M}. I have no notes. I have several notes, actually, but they’re all compliments.",
  "{A} vs {B} deserves a director’s commentary. I’ve started recording one."],
 meh:["One real wrestling match on the whole card. I’ll be rewatching it with the commentary muted.",
  "We got one serving of real wrestling and seven servings of “content.”",
  "A taste. I can’t live on a taste. I have a mortgage of opinions.",
  "Decent, but I’ve seen more technical acumen in an argument at a Denny’s booth.",
  "Fine. Not a clinic. A walk-in at best."],
 mehM:["{M} opened with a genuinely literate exchange of wristlocks before, regrettably, a story broke out.",
  "{M} was a fine appetizer. I was promised a meal. I was not promised a meal, technically, but I inferred one.",
  "{M} at {ST}. Good, not great. They rushed the feeling-out process like they had somewhere to be.",
  "The mat work in {M} was promising. Then someone did a dive and I had to look away.",
  "{A} built a beautiful foundation against {B}. Then everyone forgot about it. Selling is a commitment, not a suggestion."],
 hate:["Seven matches and not one feeling-out process. Do they think we’re animals?",
  "I expected more. I always expect more. That’s my curse and my brand.",
  "That was wrestling in the same way a microwave burrito is cuisine."],
 hateM:["{M} at {ST}. I’ve seen better holds in a Denny’s booth.",
  "{M} had everything a technical match needs except the technique.",
  "{A} vs {B} should have been a clinic. It was an urgent care.",
  "{M} had a beginning, a middle and an end, and none of them involved a single meaningful hold."],
 ign:["Not a single technical match tonight. I watched the whole show to confirm. I regret my thoroughness.",
  "Three hours and zero wristlocks. I timed it. I always time it.",
  "Another week, another show built for people who clap at fireworks.",
  "Nothing for us. Again. I’ve started rewatching old tapes out of protest.",
  "Booked for everyone except the people who actually understand what they’re watching.",
  "I have cancelled my plans to rewatch this show. My plans were to rewatch it. Now I have no plans."],
 runin:["A run-in decided the match. I have closed the tab. I have closed the browser. I am considering closing the laptop permanently.",
  "Someone ran in. Of course someone ran in. Why would we let two athletes finish what they started?",
  "The interference was so predictable I wrote it in my notebook ten minutes early. I’m not proud. I’m furious.",
  "A run-in. In this economy.",
  "Twenty minutes of beautiful wrestling, undone by a person in a hoodie sprinting down the ramp."],
 screw:["The finish was a low blow behind the referee’s back. I await a formal apology to the concept of wrestling.",
  "A screwy finish. I paid for a conclusion.",
  "Feet on the ropes for the pin. The referee was looking directly at it. He’s under review. By me.",
  "They wrestled a lovely match and then forgot the part where someone wins properly."],
 sw:["Watched {OT} instead. They had an actual wrestling match. Look it up.",
  "Defected to {OT} for the evening. Their mat work was competent. I’m not happy about it either.",
  "Spent the second hour on {OT}. Don’t make me do that again."],
 swin:["Came over from {OT}. Their idea of a technical match is two people hugging aggressively.",
  "Left {OT}. I can only watch so many superkicks before my soul leaves my body."]},
blood:{
 love:["the ring crew needed a mop. i need a nap. what a beautiful night",
  "a photo of the canvas after tonight is my new lock screen",
  "I could hear the chairs from my couch. Perfect sound mixing.",
  "Somebody bled on the announce desk and commentary just kept going. Professionals. Heroes.",
  "Mom asked why I was cheering at the TV. I said someone got hit with a door. She said that’s horrible. Anyway, great show.",
  "That’s the kind of show where the ring needs a new canvas. That’s how you know.",
  "Every week should feel like a hospital bill. This one did.",
  "my wife made me put a towel on the couch before the main event. she was right"],
 loveM:["{A} vs {B}. Somebody is going to need stitches and I want to see the stitches.",
  "{M} was violent, ugly and beautiful. I’m going to sleep like a baby.",
  "{M} was so stiff I flinched on my couch three times. I’d flinch three hundred more.",
  "{A} and {B} hit each other like they owe each other money.",
  "After {M} I need a tetanus shot and I didn’t even touch anything.",
  "{M}. {ST} stars. One for each staple. Probably.",
  "{A} walked out of there looking like a crime scene and honestly? Hero."],
 meh:["Good, not great. I could still see everyone’s forehead clearly. Unacceptable.",
  "Decent fight. Bring a cage next time and I’ll stop complaining. (I won’t stop complaining.)",
  "A little blood. A little. I want a LOT.",
  "fun show. the chairs were underused. somebody check on the chairs"],
 mehM:["{M} was close. A little blood. A little. I want a LOT.",
  "{M} had one chair shot. One. I’m a grown adult. I need a balanced diet of chair shots.",
  "{M} was stiff, but where were the weapons? Did someone lock the chair closet?",
  "{A} vs {B} got close to a war. Close isn’t a war."],
 hate:["i did not stay up past midnight to watch adults be polite to each other",
  "that was the cleanest show i’ve ever seen and i mean that as an insult"],
 hateM:["{M} and not ONE drop. Let them cook.",
  "{A} vs {B} should’ve been a war. It was a strongly worded email.",
  "pay-per-view prices for a show where the most violent thing was {M} slightly bumping the announce table",
  "{M} was so soft I could hear the mat apologize."],
 ign:["seven matches, zero weapons. did someone lock the chair closet",
  "Not a drop of blood all night. I’m starting to think they’re scared of us.",
  "no street fight. no cage. no barbed wire. what am I paying for, wrestling?",
  "a whole show and nobody went through a table. the tables were right there. they were begging.",
  "My son asked why I looked sad. I told him nobody got thrown into the steps tonight. He understood.",
  "Booking for Bloodhounds: zero. Booking for people who like handshakes: seven."],
 sw:["switched to {OT}. somebody over there was bleeding. sorry not sorry",
  "{OT} had a fight. you had a handshake. figure it out",
  "watched {OT} for the second half. the ring crew over there earned their money"],
 swin:["came over from {OT}. their idea of violence is a mean look",
  "left {OT} the second they started doing a dance-off. what is this, a wedding"]},
flip:{
 love:["^GRAVITY WAS OPTIONAL TONIGHT AND I LOVE THAT FOR US",
  "rewatching the dive at 0.25x speed with ominous music. it’s art. it’s my religion now",
  "started clipping the spots at the halfway point and ran out of phone storage",
  "my cat left the room during the big dive. my cat has no taste",
  "^SOMEBODY FLEW INTO THE THIRD ROW AND THE THIRD ROW CAUGHT THEM. TEAMWORK",
  "the guardrail had a terrible night and that’s beautiful",
  "every match tonight had at least one thing a physics teacher would call illegal",
  "my knees hurt just watching. 11/10 would watch my knees hurt again"],
 loveM:["^{A} WENT FLYING AND I HAVE NOT SAT DOWN SINCE",
  "the {M} spot is already at 2M views and climbing. give them a raise and a trampoline",
  "{M} had a sequence so fast my TV had to buffer",
  "watching {M} back in slow mo. still not slow enough to see how they did that",
  "{A} vs {B} was a highlight reel with a match attached and I mean that as the highest compliment",
  "i’d like to thank {A} for the gif i will be using for the rest of my life",
  "^{M}. {ST} STARS. ZERO GRAVITY. NO NOTES"],
 meh:["one dive. ONE. that’s a tease. i don’t like being teased",
  "good stuff but i need a multi-person match with no gravity and no rules about gravity",
  "almost got me out of my seat. almost. a ladder would’ve done it",
  "solid show but the top rope was mostly decorative tonight"],
 mehM:["{M} had ONE dive. one. that’s a tease. i don’t like being teased",
  "{M} was great on the ground but i didn’t come here for the ground",
  "close!! give {A} a ladder next time and step back",
  "{M} almost got me out of my seat. almost. a ladder would’ve done it"],
 hate:["if i wanted to watch people stand on the mat i’d go to my cousin’s jiu-jitsu class",
  "this show was sponsored by gravity and gravity won"],
 hateM:["{A} vs {B} and NOBODY left the ground?? give these people a ladder and step back",
  "{M} at {ST}?? they had flyers in there and booked it like a staring contest",
  "{M} was so grounded it should’ve paid property tax"],
 ign:["zero dives. ZERO. the guardrail was right there. it was begging.",
  "started a petition to bring back the flyers. it has a logo. it has 4,000 signatures. it has a theme song",
  "no ladder match, no multi-person, no dives. was this show sponsored by gravity",
  "nobody even went to the top rope tonight. the top rope was just decoration",
  "^WHERE WERE THE FLYERS. I AM ASKING CALMLY. (I AM NOT CALM.)",
  "came for people falling down on purpose. got people standing up on purpose."],
 sw:["watched {OT} for the multi-person match. they actually let people jump over there",
  "^{OT} HAD PEOPLE IN THE AIR. IS THAT SO HARD",
  "switched to {OT} halfway through. they actually gave us something"],
 swin:["came over from {OT}. i heard you people leave the ground here",
  "left {OT}. if i wanted to watch people lie on the mat i’d take a nap"]},
chaos:{
 love:["I threw a chair in my own living room. My landlord came up to complain and now HE’S a chaos fiend too.",
  "the run-in had a run-in. i need to lie down. i need someone to run in on me while i lie down",
  "I don’t know who the masked guy was and I don’t need to know. He’s my dad now.",
  "^NOBODY KNEW WHAT WAS GOING ON AND THAT’S THE POINT",
  "the referee got knocked out twice. the second ref got knocked out once. i want a third ref",
  "this show had the energy of a raccoon in a vending machine and i mean that with love",
  "I screamed at my TV so much tonight my neighbor slid a note under the door. The note said “same.”",
  "my therapist asked what brings me joy. i showed her the last ten minutes. we’re not done unpacking it"],
 loveM:["^{A} AND {B}. I THREW A CHAIR IN MY OWN LIVING ROOM",
  "weeks of talking and {A} and {B} finally got their hands on each other and I screamed so loud my neighbor screamed back",
  "{M} was so chaotic my smoke detector went off. there was no smoke. it just felt something.",
  "{A} with a live mic is a public safety issue and I want it every week",
  "{M} at {ST}. The extra stars were for the parts that weren’t legal.",
  "{A} vs {B} broke something in me and the something was my coffee table"],
 meh:["fun but nobody interfered. i had my sign ready. it said RUN IN.",
  "close!! but nobody got jumped after the bell. what are we doing",
  "almost unhinged. almost. next time someone needs to run in from the crowd with a trash can",
  "a nice appetizer. where’s the chaos entree"],
 mehM:["{M} was fun but nobody interfered. i had my sign ready. it said RUN IN.",
  "{M} was a nice appetizer. where’s the chaos entree",
  "{A} vs {B} got weird for a minute and then everybody calmed down. why would you calm down"],
 hate:["everybody stayed in their lane tonight. i hate lanes.",
  "clean finishes all night. who is this for. who asked. show me the person who asked"],
 hateM:["{M} was so clean it squeaked. who is this for",
  "{A} and {B} shook hands after. HANDS. SHOOK.",
  "{M} followed every rule and i’ve never been so offended"],
 ign:["a whole show and nobody interfered. not once. i had my sign ready. it said RUN IN.",
  "clean finishes all night. who is this for. who asked. show me the person who asked",
  "the most chaotic thing tonight was the ring announcer’s tie",
  "I have been sitting in the same position for three hours waiting for something to go wrong. Nothing went wrong. That’s what went wrong.",
  "no run-ins, no brawls, no live mics. they booked us a nap",
  "everybody stayed in their lane tonight. i hate lanes."],
 sw:["switched to {OT}. someone over there got jumped after the bell. that’s MY content",
  "{OT} had a run-in. you had a handshake. bye",
  "watched {OT}. their show felt like a fire alarm and i mean that as a compliment"],
 swin:["fled {OT}. too many handshakes. smelled like a church picnic",
  "came over from {OT} because nothing over there catches fire"]}};
/* more posts. New lines go on the end of a bank so the recent-post memory (S.xrSeen, by bank position) stays right. */
const XR_MORE={
cas:{
 love:["the guy with the music came out and the music was good and then he won. or lost. good either way",
  "watched with my roommate who says wrestling is fake. he didn’t blink for ten minutes. who’s fake now",
  "i made a sandwich during the first match and regretted it because i missed something cool. never again",
  "the announcers kept yelling so i knew it was important",
  "my 4 year old now does the pose. i don’t know whose pose it is but she does it perfect",
  "best part of my week and i got a promotion this week",
  "i’ve never been to a wrestling show but after tonight i googled tickets. they’re expensive. still thinking about it",
  "everybody was so big. like how are they so big. what do they eat"],
 loveM:["{A}!!! i yelled {A} at the tv like they could hear me. they could not",
  "{A} vs {B} was the best thing on tv tonight and i watched the news too",
  "i have now watched {M} three times. i should be asleep",
  "{A} is my favorite now. sorry to whoever was my favorite before",
  "told my coworkers about {M} at lunch. they did not care. i will tell them again tomorrow",
  "{A} looked like a movie star. {B} also looked like a movie star. two movie stars"],
 stars:["felt like every famous wrestler was on this show. did they all get the same day off",
  "i saw at least 3 people i know from commercials. that’s a good show",
  "it’s nice when they put the famous ones on. makes it easy"],
 titles:["the gold belt was so shiny on my tv i had to turn the brightness down",
  "when they ring the bell for a title match it feels like the olympics",
  "a belt was on the line. i love when the belt is on the line"],
 story:["i don’t even watch every week and i could tell this has been building. goosebumps",
  "my girlfriend explained the whole storyline to me during the commercials. i’m invested now. we are both invested",
  "they really hate each other huh. good. i hate them too. i mean i love them. you know what i mean"],
 spec:["there was a special kind of match tonight and it had rules i didn’t understand and i loved it",
  "anytime the match has extra words in the name i know it’s gonna be good"],
 meh:["it was ok but i kept checking who was coming out next",
  "decent show. i wanted more famous people and less of the guys i don’t know",
  "would’ve been better with a belt or two",
  "watched the first hour. caught the end. seemed fine"],
 hate:["i fell asleep and woke up and it was still the same match",
  "the show was ok but i don’t know anyone on it. who are these people. why should i care",
  "my girlfriend asked if this was the real show or a practice show",
  "watched for ten minutes and then found a documentary about sharks. sharks won",
  "remember when they had the famous ones on. me neither but i assume they did",
  "my uncle said “this ain’t it” and left the room. my uncle is never wrong (except twice)"],
 sw:["{OT} had the guy from the commercial. so i went there. simple as"],
 swin:["{OT} lost me at the third match nobody’s heard of. hi. i’m here now"]},
tech:{
 love:["A show built on fundamentals. I’ve sent the link to my old amateur coach. He replied “acceptable,” which from him is a parade.",
  "I counted eleven distinct submission attempts. I keep count. It’s not a problem. It’s a practice.",
  "Tonight, a wrestler sold a knee for an entire match and then limped to the back. Narrative integrity. I need a moment.",
  "Somebody finally remembered that a headlock can tell a story. Bless them.",
  "No dives, no plunder, no nonsense. Just two people solving each other. Exquisite.",
  "I’ve added three matches from tonight to my master list. The list is very exclusive. My cat isn’t on it."],
 loveM:["{A} kept going back to the same body part and {B} never forgot it was hurt. Peak wrestling. I’m emotional.",
  "{M} had the kind of reversal sequence you only appreciate on the second watch. I’m on my fourth.",
  "{A} vs {B} was a mat-based masterpiece. The crowd went quiet in the right places. That’s how you know.",
  "{M} at {ST}. I’d go higher but I have a reputation.",
  "The final five minutes of {M} were a conversation in a language most people don’t speak. I speak it fluently."],
 meh:["Pleasant, but nobody committed to the mat. It’s like watching a chef who won’t use salt.",
  "Three good minutes of grappling, followed by thirty minutes of flailing. Net neutral.",
  "Watchable. Not rewatchable. There’s a difference and I live in it."],
 mehM:["{M} had a promising first act and then abandoned its own thesis.",
  "{A} vs {B} was fine. Fine. I didn’t take notes, and I always take notes.",
  "{M} could have been great if anyone had committed to a single hold for longer than nine seconds."],
 hate:["I have watched better mat wrestling at my nephew’s middle school tournament. He lost. It was still better.",
  "Not a single sequence I’d show a student. And I don’t even have students. I’d hire some just to not show them this."],
 hateM:["{M} at {ST}. I’ve seen tighter wristlocks on a toddler holding a juice box.",
  "{A} vs {B} was a sequence of moves with no connective tissue. A playlist on shuffle.",
  "{M}: technically a match. Emphasis on technically. Not the good technically."],
 ign:["No technical match tonight. I’m going to go watch a 1983 tape in the dark like a monk.",
  "They gave us nothing. Absolutely nothing. I watched an arm drag in my memory instead.",
  "Every match ended with someone diving or bleeding. Nobody tried to outwrestle anybody. Where are the scholars?",
  "I have a spreadsheet. Tonight’s tab is empty. Do you know how that feels?"],
 runin:["The run-in arrived just as the match was reaching its thesis statement. Rude.",
  "Interference has its place. That place is not a technical match. That place is the trash."],
 screw:["A tainted finish on a match that deserved a clean one. I’ve lodged a complaint with the universe.",
  "They went home on a cheap finish and I went to bed on a cheap feeling."],
 sw:["{OT} had an actual chain-wrestling sequence tonight. I hate admitting that publicly. I am admitting it."],
 swin:["Left {OT} after their third consecutive superkick party. Is this where the wrestling is?"]},
blood:{
 love:["the referee needed new gloves three times. three. what a night",
  "I watched through my fingers like a horror movie. That’s what I pay for.",
  "somebody got thrown into the steps and the steps lost. beautiful",
  "Tonight the ring apron looked like a Jackson Pollock. Art.",
  "I yelled “AGAIN” at the TV and they DID IT AGAIN. They listen. They love us.",
  "kids, if you’re reading this, don’t try this at home. adults, please try this at work"],
 loveM:["{A} vs {B} sounded like a car crash and looked like a car crash. Five stars from the insurance company.",
  "{M}. That’s not a match, that’s a dental appointment.",
  "{A} took a chair shot from {B} that I felt in my own teeth. Stunning.",
  "the crowd chanted “this is awesome” during {M} and for once the crowd undersold it",
  "{M} at {ST}. The missing star is because nobody went through the stage. Next time."],
 meh:["Good hits. Not enough red. I’m a simple person.",
  "There was a weapon, but it was mostly used for posing. Weapons are for hitting.",
  "6/10 violence. I’ve seen worse. I’ve also seen way better."],
 mehM:["{A} vs {B} needed to go another ten minutes and through a table.",
  "{M} was so close to being violent I could taste it. Unfortunately what I tasted was popcorn.",
  "{M} gave us a little crimson. Like a garnish. I wanted the whole entrée."],
 hate:["a show so safe it should come with a bike helmet",
  "everybody walked to the back on their own two feet. what was the point"],
 hateM:["{A} vs {B} was so gentle I think they were cuddling.",
  "{M} had the violence level of a pillow fight. And not a good pillow fight.",
  "{M}: zero staples. zero tables. zero reasons to exist."],
 ign:["Not one weapon. Not one. I left a chair on my porch in protest.",
  "I paid for a violent show and they sent me a ballet. A nice ballet, but a ballet.",
  "The steel steps went home untouched. They’re probably confused. I am.",
  "Zero blood. I checked the replay. I checked the replay of the replay."],
 sw:["{OT} had a cage. I go where the cage is."],
 swin:["{OT}’s idea of a fight is pointing. I’m here. Hit somebody."]},
flip:{
 love:["^THE AIR WAS BUSY TONIGHT",
  "i watched it with my little brother and now he’s jumping off the couch. mom is mad. worth it",
  "every time someone climbed the ropes i stood up. my legs are tired. my soul is not",
  "clips from tonight are already everywhere and they all look fake and they are all real",
  "there was a sequence where i couldn’t tell who was who because they were moving too fast. perfect",
  "physics teacher here. i will be using tonight as an example of what not to do. 10/10"],
 loveM:["{A} jumped off something tonight that shouldn’t be jumped off. thank you {A}",
  "the dive in {M} cleared three people and my expectations",
  "{A} vs {B} had the best sequence of the year and i will not be taking questions",
  "^{M} WAS A VIDEO GAME AND I HAD THE CONTROLLER",
  "every time {A} left the ground my heart left my body. {ST} stars. no notes"],
 meh:["fun, but the high flying was a little low flying tonight",
  "a couple of good spots. not enough. never enough",
  "nice match but the guardrail survived. the guardrail should never survive"],
 mehM:["{M} was good. it was waiting to be GREAT. one more dive",
  "{A} teased a dive in {M} and then just… didn’t. a war crime",
  "{A} vs {B} had all the ingredients for chaos in the air and then they wrestled on the mat. why"],
 hate:["nobody even tried a moonsault. what are we doing. what are we DOING",
  "i timed it. people were in the air for a total of four seconds this whole show"],
 hateM:["{M} had flyers in it and nobody flew. that’s false advertising",
  "{A} vs {B} at {ST} because nobody took a risk. i’m not mad. i am mad",
  "{M} was a ground game and i’m a sky person"],
 ign:["the top rope must feel so lonely tonight",
  "no multi-person match? no ladder? i came for the sky and got the floor",
  "if the next show doesn’t have a dive i’m going to dive off my own couch in protest",
  "my clip folder for tonight is empty. EMPTY."],
 sw:["{OT} had a ladder match. i don’t make the rules. i follow the ladders"],
 swin:["{OT} was so grounded i fell asleep. i heard you fly here"]},
chaos:{
 love:["^EVERYTHING WENT WRONG AND IT WAS PERFECT",
  "somebody came out of the crowd. somebody came out from under the ring. i think somebody came out of my closet",
  "the lights went out and when they came back i had a new favorite wrestler",
  "i don’t know who won any of the matches tonight and i’ve never been happier",
  "my dog barked at the tv during the brawl. he gets it",
  "this show had no rules and no brakes. what a ride"],
 loveM:["{A} grabbed the mic and i swear i felt the building get nervous",
  "{M} spilled into the crowd and kept going. somebody check if it’s still going",
  "{A} vs {B} ended with five people in the ring and nobody knows why. masterpiece",
  "{M} at {ST}. the referee should be paid hazard pay",
  "{A} said something on the mic that is going to get somebody fired and i love {A}"],
 meh:["ok show. needed at least one parking lot brawl",
  "some chaos, not enough chaos. chaos is a balanced diet",
  "almost lost it at one point. ALMOST. that’s the problem"],
 mehM:["{M} started getting messy and then someone remembered the rules. boo",
  "{A} had a live mic for thirty seconds. that’s a teaser trailer. give us the movie",
  "{A} vs {B} needed a run-in. nobody ran in. tragic"],
 hate:["the most polite wrestling show i’ve ever seen. i don’t want polite",
  "nobody got jumped. nobody got betrayed. nobody even yelled. was this a library"],
 hateM:["{M} was so by-the-book i’m going to burn the book",
  "{A} and {B} had a perfectly clean match. GROSS",
  "{M} needed someone to come through the crowd with a trash can. NOBODY CAME"],
 ign:["not one run-in. i stood by the door all night in case one ran into MY house",
  "no brawls, no betrayals, no microphones thrown. i’m filing a missing persons report for the chaos",
  "everybody got their entrance, wrestled, and left. like a dentist appointment. a calm one",
  "i had popcorn ready for a riot. i ate the popcorn watching a handshake"],
 sw:["went to {OT}. they had someone attacked in the parking lot. i go where the parking lot is"],
 swin:["{OT} was so calm i thought my tv was paused. hi. is the chaos here"]}};
Object.keys(XR_MORE).forEach(g=>Object.keys(XR_MORE[g]).forEach(k=>{XR_POSTS[g][k]=(XR_POSTS[g][k]||[]).concat(XR_MORE[g][k])}));
/* his line up top: how the night went for you, or for the other booker on their tab */
const XR_SAY={
 big:["Boss, the mentions are on fire. In the good way. I checked twice.","We’re trending. Top five. I screenshotted it and sent it to my mom.",
  "My phone’s been buzzing for an hour. I put it on a pillow. It buzzed off the pillow.","Boss. BOSS. People are clipping everything. Even the commercial breaks.",
  "This is the good kind of chaos online. Enjoy it. It never lasts."],
 good:["Good night, boss. Mostly hearts. A couple of grumps. The grumps are always there.","Solid. The replies are friendly. Suspiciously friendly. I’m keeping an eye on it.",
  "We had a good one. Nobody’s tagging us in anything mean, which online is basically a parade.","Nice night. A few of the crowds want more, but the vibes are up."],
 mixed:["Mixed bag online tonight, but we held the room.","Solid. Some of them want more, though. Some of them always want more. That’s the job.",
  "It’s a split timeline. Half of them are thrilled, the other half are writing essays.","Decent buzz. A couple of crowds are restless. I’ll pass along the notes."],
 bad:["Not a great night in the replies, boss. I’ve muted four hashtags.","We lost people tonight. I have names. I have handles. I have screenshots.",
  "So. The ratio is not in our favor. I’ll explain what a ratio is later.","I drafted a statement. I deleted the statement. Let’s just do better next week."],
 awful:["Boss, I need you to sit down. Okay, now stay sitting down.","The timeline is on fire and not in the fun way. I’ve unplugged my router to cope.",
  "Someone made a meme about us. It’s good. That’s the worst part. It’s really good."],
 rbig:["{TH}’s mentions are hot, boss. I hate it. I’m still reading them, I’m a professional.","Credit where it’s due: {TH}’s timeline is happy. Don’t tell them I said that.",
  "{TH} had a good night. Their replies are all fire emojis. Ugh.","Their crowd is purring. I’ve never wanted to unfollow something so badly."],
 rmixed:["{TH}’s mentions are lukewarm. Half their crowds want more.","{TH}’s timeline is a mixed bag. Some of their hardcore fans are restless. Restless fans wander.",
  "Middle-of-the-road night for {TH}. I’ve read their replies. There are opportunities.","{TH}’s fans are posting, but nobody’s screaming. That’s a soft spot."],
 rbad:["{TH} is getting cooked online. I made popcorn.","{TH}’s replies are brutal, boss. I’ve been refreshing for twenty minutes. For research.",
  "{TH}’s fans are miserable. Miserable fans go looking for a new show. Hint hint.","Their timeline is a funeral. I sent flowers. Not really. But I thought about it."]};
const XR_ADD={ppv:["Pay-per-view crowds don’t whisper.","Big show, big timeline.","Everything’s louder on a pay-per-view."],
 lost:["And some of them watched {OT} instead. They’re telling everyone.","Also, a few of them flipped to {OT}. Loudly."],
 won:["Bonus: some of {OT}’s fans wandered over. Be nice to them.","And a few of {OT}’s fans came over. They’re already posting."]};
/* his "Next week" note: a lead-in in his voice, then the crowd's tip (r.nx) */
const XR_LEAD={tech:["The tech crowd sent a list. Single-spaced.","Technical fans asked me to pass this along. They used footnotes.","From the headlock people:"],
 blood:["Bloodhounds, mostly in caps:","The Bloodhounds have a request. It’s written in something red. I’m choosing to believe it’s ketchup.","From the blood crowd:"],
 flip:["The Flippy kids sent notes. One of them is a GIF.","Flippy fans, direct quote, minus the screaming:","From the high-flyer crowd:"],
 chaos:["Chaos fiends left me a voicemail. It was mostly yelling. The parts that weren’t:","The chaos crowd wants this, and also for you to “let it rip,” whatever that means:","From the run-in people:"],
 cas:["Casuals, in their own words, translated by me:","The casual crowd’s note, cleaned up:","From the people who watch with one eye:"]};
const XR_OFF=["I’m just the messenger.","Your call, boss.","","",""];
const XR_SEEN_MAX=160;
function xrRand(l){return l[Math.floor(Math.random()*l.length)]}
function xrStars(s){const f=Math.floor(s+1e-9),r=s-f;return f+(r>=.74?'¾':r>=.49?'½':r>=.24?'¼':'')}
/* fill a template; null when a token can't be filled */
function xrFill(t,c){let ok=true;const out=t.replace(/\{(A|B|M|ST|OT|SH|TH)\}/g,(m,k)=>{const v=c[k];if(v==null||v===''){ok=false;return ''}return v});return ok?out:null}
/* one post from a crowd's bank (or the first bank that can fill it), skipping recent ones */
function xrPick(g,banks,c,used){S.xrSeen=S.xrSeen||[];const seen=S.xrSeen;
 for(const bk of banks){const l=(XR_POSTS[g]&&XR_POSTS[g][bk])||[];const fill=l.map((t,i)=>({id:g+'.'+bk+'.'+i,x:xrFill(t,c)})).filter(p=>p.x&&!used.has(p.id));if(!fill.length)continue;
  const fresh=fill.filter(p=>!seen.includes(p.id));const p=fresh.length?xrRand(fresh):fill.sort((a,b)=>seen.indexOf(a.id)-seen.indexOf(b.id))[0];
  used.add(p.id);seen.push(p.id);if(seen.length>XR_SEEN_MAX)seen.splice(0,seen.length-XR_SEEN_MAX);
  let x=p.x;if(x[0]==='^')x=x.slice(1).toUpperCase();if(g==='cas')x=x.toLowerCase();return x}
 return null}
function xrNum(n){n=Math.max(1,Math.round(n));return n<1000?String(n):(n/1000).toFixed(n<10000?1:0).replace(/\.0$/,'')+'K'}
/* the timeline for one booker's night. own: you (Next week note, your-show voice) or someone else's tab */
function xrBuild(o,br,own){const r=o.fb[br];const ot=(()=>{const k=Object.keys(o.fb||{}).find(k=>k!==br);return k?(typeof nameOf==='function'?nameOf(k):''):''})();
 const sh=o.title||'';const used=new Set(),hs=new Set();const posts=[];
 const d=g=>Math.round((r.after[g]||0)-(r.before[g]||0));
 const ctx=g=>{const m=r.ms&&r.ms[g];const sn=m&&m.sn||[];return {A:sn[0]||null,B:sn[1]||null,M:r.mt&&r.mt[g]||null,ST:m&&m.st?xrStars(m.st):null,OT:ot||null,SH:sh||null}};
 const handle=g=>{const l=XR_HANDLES[g].filter(h=>!hs.has(h));const h=xrRand(l.length?l:XR_HANDLES[g]);hs.add(h);return h};
 const add=(g,banks,w)=>{const x=xrPick(g,banks,ctx(g),used);if(x)posts.push({g,h:handle(g),x,w})};
 FB_G.forEach(g=>{const v=fbVd(r,g)[0],D=d(g),c=ctx(g),M=!!(c.A&&c.B);const w=Math.abs(D)+1;
  if(g==='cas'){if(v==='Hooked'){const y=(r.wy&&r.wy.cas)||'';const k=/feud|stor/i.test(y)?'story':/star power|favorite stars|their kind of stars/i.test(y)?'stars':/title/.test(y)?'titles':/match types/.test(y)?'spec':'love';add(g,M?[k,'loveM','love']:[k,'love'],w)}
   else if(v==='Watching')add(g,['meh'],w*.6);else if(v==='Tuned out')add(g,['hate'],w);return}
  const nx=(r.nx&&r.nx[g])||'';
  if(v==='Loved it')add(g,M?['loveM','love']:['love'],w);
  else if(v==='Wanted more')add(g,M?['mehM','meh']:['meh'],w*.8);
  else if(v==='Let down')add(g,g==='tech'&&/run-in/.test(nx)?['runin','hateM','hate']:g==='tech'&&/clean finish/.test(nx)?['screw','hateM','hate']:M?['hateM','hate']:['hate'],w*1.1);
  else if(v==='Ignored')add(g,['ign'],w)});
 /* the loudest crowd gets a second post on a big night */
 const top=FB_G.slice().sort((a,b)=>Math.abs(d(b))-Math.abs(d(a)))[0];if(top&&Math.abs(d(top))>=5000){const v=fbVd(r,top)[1];const c=ctx(top),M=!!(c.A&&c.B);add(top,v==='good'?(top==='cas'?['love','stars']:M?['loveM','love']:['love']):top==='cas'?['hate']:fbVd(r,top)[0]==='Ignored'?['ign']:M?['hateM','hate','meh']:['hate','meh'],Math.abs(d(top))*.7)}
 /* fans who switched shows */
 const sw=r.sw||{};let lost=0,won=0;FB_G.forEach(g=>{const n=sw[g]||0;if(n<=-1000&&ot){add(g,['sw'],-n*1.5);lost++}else if(n>=1000&&ot){add(g,['swin'],n*1.2);won++}});
 posts.sort((a,b)=>b.w-a.w);/* the first three you see come from different crowds when they can */
 const first=[];posts.forEach(p=>{if(first.length<3&&!first.some(q=>q.g===p.g))first.push(p)});const list=first.concat(posts.filter(p=>!first.includes(p))).slice(0,7);
 /* likes and reposts follow how many fans moved */
 let t=1;list.forEach(p=>{const lk=Math.max(40,p.w*(.2+Math.random()*.4));p.m=[xrNum(lk),xrNum(lk*(.08+Math.random()*.16))];p.t=t+'m';t+=1+Math.floor(Math.random()*3);delete p.w});
 const tot=FB_G.reduce((a,g)=>a+d(g),0);const c0={OT:ot||'the other show',TH:typeof nameOf==='function'?nameOf(br):'Their show'};
 const tier=own?(tot>=15000?'big':tot>=4000?'good':tot>=-2000?'mixed':tot>=-10000?'bad':'awful'):(tot>=8000?'rbig':tot>=0?'rmixed':'rbad');
 let say=xrFill(xrRand(XR_SAY[tier]),c0);
 if(own&&ot&&lost&&Math.random()<.7)say+=' '+xrFill(xrRand(XR_ADD.lost),c0);else if(own&&ot&&won&&Math.random()<.7)say+=' '+xrFill(xrRand(XR_ADD.won),c0);else if(o.ppv&&Math.random()<.5)say+=' '+xrRand(XR_ADD.ppv);
 /* the Next week note: the crowd that lost you the most fans, never one that was happy (as the old Next time tip) */
 let note=null;if(own&&r.nx){const g=FB_G.filter(g=>d(g)<=-100&&r.nx[g]&&FB_VD[r.vd&&r.vd[g]]!=='good').sort((a,b)=>d(a)-d(b))[0];
  if(g)note={g,t:(xrRand(XR_LEAD[g])+' '+r.nx[g]+' '+xrRand(XR_OFF)).trim()}}
 return {say,posts:list,note}}
/* the timeline, built the first time it's shown and kept on the result */
function xrFeed(o,br,own){const r=o&&o.fb&&o.fb[br];if(!r||!r.before||!r.after)return null;const k=own?'xr':'xro';
 if(!r[k]){try{r[k]=xrBuild(o,br,own);if(typeof save==='function')save()}catch(e){console.warn('xr feed',e);return null}}return r[k]}
function xrPostHtml(p){return `<div class="xrq" style="--fgc:${FG_C[p.g]}"><div class="xrqh">${fgIc(p.g)}<span class="xrqn">${esc(p.h)}</span><span class="xrqg">${esc(FG_N[p.g])}</span><em>${p.t||''}</em></div><div class="xrqt">${esc(p.x)}</div>${p.m?`<div class="xrqm"><span>♥ <b>${p.m[0]}</b></span><span>↻ <b>${p.m[1]}</b></span></div>`:''}</div>`}
/* at: the fade-in attribute from the reveal (empty when shown instantly). own: your show (with the Next week note) */
function xrFeedHtml(o,br,own,at,who){const F=xrFeed(o,br,own);if(!F)return '';const vis=F.posts.slice(0,3),rest=F.posts.slice(3);
 return `<div class="xrf"${at||''}><div class="xrfh"><span class="xrav">XR</span><div><b>X Redditino</b><small>Head of PR · ${own?'reading the timeline':'reading '+esc(who||'their')+'’s timeline'}</small></div></div>
 <div class="xrsay">“${esc(F.say)}”</div>${F.posts.length?`<div class="xrps">${vis.map(xrPostHtml).join('')}${rest.length?`<details class="xrmore"><summary>${rest.length} more post${rest.length>1?'s':''}</summary>${rest.map(xrPostHtml).join('')}</details>`:''}</div>`:''}
 ${F.note?`<div class="xrnote"><b>Next week · ${fgLbl(F.note.g)}</b><span>${esc(F.note.t)}</span></div>`:''}</div>`}
Object.assign(window,{xrFeed,xrFeedHtml,XR_POSTS});
(function(){const c=document.createElement('style');c.textContent=`
.xrf{margin:10px 0 2px;background:#111114;box-shadow:inset 0 0 0 1px var(--line);position:relative;text-align:left}
.xrf::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--red) 60%,transparent)}
.xrfh{display:flex;align-items:center;gap:10px;padding:12px 12px 7px}
.xrav{flex:none;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#1d1d22;box-shadow:inset 0 0 0 1px var(--gold3);color:var(--gold2);font:900 italic 16px/1 'BC',sans-serif}
.xrfh div{display:flex;flex-direction:column;min-width:0}
.xrfh b{font:900 italic 17px/1.05 'BC',sans-serif;text-transform:uppercase;letter-spacing:.02em;color:var(--text)}
.xrfh small{font:700 10.5px/1.3 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.xrsay{margin:0 12px 10px;font-style:italic;font-size:15px;line-height:1.4;color:var(--text)}
.xrps{border-top:1px solid var(--line)}
.xrq{position:relative;padding:9px 12px 8px 15px;border-bottom:1px solid var(--line)}
.xrq::before{content:"";position:absolute;left:0;top:9px;bottom:9px;width:3px;background:var(--fgc)}
.xrqh{display:flex;align-items:center;gap:6px;min-width:0;font-size:13px}
.xrqh .fgi{width:14px;height:14px;flex:none;color:var(--fgc);stroke:var(--fgc)}
.xrqn{font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.xrqg{font:700 10px/1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--fgc);white-space:nowrap}
.xrqh em{margin-left:auto;font-style:normal;color:var(--mut);font-size:12px;white-space:nowrap}
.xrqt{font-size:15px;line-height:1.38;margin-top:3px;color:#ece8df;overflow-wrap:anywhere}
.xrqm{display:flex;gap:14px;margin-top:4px;font-size:12px;color:var(--mut)}.xrqm b{font-weight:600;color:#cfcac0}
details.xrmore>summary{list-style:none;cursor:pointer;padding:9px 12px;color:var(--gold2);font:800 italic 13px 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase}
details.xrmore>summary::-webkit-details-marker{display:none}details.xrmore>summary::after{content:' ▾'}details.xrmore[open]>summary::after{content:' ▴'}
details.xrmore[open]>summary{border-bottom:1px solid var(--line)}
.xrnote{display:flex;flex-direction:column;gap:3px;padding:10px 12px 12px;background:#17171b}
.xrnote b{font:900 italic 12px/1.4 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--gold2)}.xrnote b .fgi{width:13px;height:13px}
.xrnote span{font-size:14px;line-height:1.4;color:var(--text)}
.srcrowd.in .xrf{opacity:0;animation:srcrIn .3s ease-out forwards}.srcrowd.now .xrf{animation:none!important;opacity:1!important}
.card .xrf{margin:0}`;document.head.appendChild(c)})();
