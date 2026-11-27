/* v505 (posts rewritten v517): X Redditino's timeline. After the crowd table in the reveal (and on Full results), your Head of PR reads the room:
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
/* v517: every fan post rewritten so each crowd sounds more like itself (casuals dimmer, technical fans snobbier, Bloodhounds
   thirstier (and mostly in caps), Flippy fans louder, Chaos fiends more unhinged), and every bank says the reason it's picked for: a casual "titles"
   post is about the belts, a technical "runin" post is about the run-in, an "ign" post names the kind of match they never got.
   Casuals who tuned out say why: hateS (no stars), hateQ (a weaker show than usual), hateF (no feud), hateT (no title match),
   hateX (no big match type). New lines go on the end of a bank so the recent-post memory (S.xrSeen, by bank position) stays right. */
const XR_POSTS={
cas:{
 love:["what a show. i don’t know what happened but everybody was really good at it",
  "the guy in the black shorts won. or the other guy in the black shorts. either way great job black shorts",
  "my wife asked who i was rooting for and i said “yes.” that’s how good it was",
  "they did the thing where you count to three and then everybody screams. i love that thing",
  "best show ever. i say that every time i watch one but this time i really mean it. probably",
  "didn’t look at my phone once. well. i’m on it now. but that’s after",
  "i don’t know the rules and i don’t want to know the rules. it’s better this way",
  "is the ref on a team? whose team? doesn’t matter. great show",
  "i tried to do one of the moves on my brother in law. we are going to urgent care. worth it",
  "my 5 year old asked if they’re really hurt and i said “they’re professionals.” then i googled it. great show",
  "the announcer man said “BAH GAWD” and i said it too. then my wife said it. we’re a wrestling family now",
  "thought wrestling was the greek thing in the olympics. this was way better than the greek thing",
  "everybody was so shiny. are they oiled? should i be oiled",
  "big guy picked up a different big guy. physics is fake",
  "i clapped at my tv. alone. in my apartment. no regrets",
  "watched it with my dad and he only fell asleep once. that’s a 10",
  "bought a foam finger. it doesn’t say anything. i just like pointing at the tv with it",
  "every time somebody came out there was music. how do they know when to play the music. magic"],
 loveM:["{A}!! {B}!! i know both of them!! i think!!",
  "{M} was so good i forgot to eat my sandwich. found it later. still good. like {M}",
  "{A} is my favorite wrestler now. i didn’t have one before. now i have {A}",
  "{A} vs {B}. i didn’t understand why they were fighting but they fought SO hard",
  "my dad saw {A} and said “oh that’s a real one.” my dad doesn’t say that about anything. not even me",
  "{M}. i have watched it 4 times. on purpose. i have work tomorrow",
  "{A} and {B} should be in a movie. a movie where they fight. wait that’s what this was",
  "i yelled {A}’s name so loud my neighbor yelled it too. he doesn’t even watch",
  "{A} looked SO strong against {B}. i did a push up after. one. but still",
  "whoever {B} is, they’re my second favorite now. {A} is first. sorry {B}",
  "{M} was like a movie but i didn’t have to read anything",
  "i’m naming my next dog {A}. my current dog is also getting renamed {A}",
  "{A} vs {B}. i don’t know who won. i think we all won. me especially",
  "told my whole group chat about {M}. nobody replied. i know they saw it"],
 stars:["SO many famous guys tonight. it was like a celebrity golf thing but with punching",
  "every single wrestler was someone i’ve seen on a t-shirt. that’s how you know they’re good",
  "they had the big names on. the BIG ones. i know because the names were big on the screen",
  "my mom walked in and said “oh i know him.” MY MOM. she thinks netflix is a channel",
  "all the famous ones were there. did somebody have a party. i want to go to the party",
  "i recognized like 6 guys. that’s my personal record. i’m getting smarter",
  "saw the guy from the commercial. the car one? or the cereal one. one of the ones. he was there",
  "if i’ve heard of you, i’m watching. tonight i had heard of everyone. great night for me"],
 titles:["BELTS. they held up the BELTS. gold ones. i think gold. my tv is old",
  "i don’t know what the belt does but i want one. does it hold up pants",
  "it was for the championship so i sat up straight. that’s the rule",
  "somebody won a belt and cried and i cried and my cat looked at me weird",
  "how many belts are there. i counted five tonight. there might be a hundred. i love all of them",
  "title match means somebody gets a belt. that’s why i watch. for the belts",
  "they said “and NEWWWW” and i didn’t know what it meant but my body knew",
  "the champion held the belt so high. like a trophy. but you wear it. best trophy"],
 story:["haven’t watched in a while but i could tell those two REALLY don’t like each other. good. i don’t either",
  "ok so i think one guy stole the other guy’s… girlfriend? car? hat? anyway they fought about it and i’m on hat guy’s side",
  "my roommate caught me up on the whole drama in the bathroom line. i’m so invested now",
  "the yelling guy really meant it. you can’t fake that kind of yelling. or can you. no. you can’t",
  "i don’t know what happened weeks ago but i’m so glad they finally fought about it",
  "they’ve been mad at each other for like a month i think? that’s longer than my last relationship. respect",
  "my wife picked a side in the feud and i picked the other side. we are sleeping in different rooms",
  "the drama is better than my shows. and my shows have a lot of drama. and a lady with a cat"],
 spec:["there was a CAGE. i love cages. why isn’t it always a cage. put the whole show in a cage",
  "a ladder match!! they climb a ladder to get the thing!! i would also climb a ladder to get the thing",
  "they said “no disqualification” and i don’t know what disqualification is but i’m glad there wasn’t any",
  "any match with extra words in the name i’m in. the more words the better. three word matches are the best",
  "it was a special match with special rules. i didn’t learn the rules. i didn’t have to. it was special",
  "they had a TABLE. in the match. like a table you eat on. but they did not eat on it"],
 meh:["it was ok. i watched most of it. some of it. the parts i watched were ok",
  "decent show. i was also watching a video of a dog on a skateboard. dog won but it was close",
  "i liked the parts with the guys i know. there should be more of those parts",
  "was fine. somebody should win a belt next week or get put in a cage. for me",
  "pretty good. not great. i don’t know why. i’m not a scientist",
  "i stayed for the famous guy and then it was over. i guess i liked it",
  "it was like a 6. i don’t know what a 10 would be but it would have more stuff",
  "watched it while folding laundry. folded a lot of laundry. so",
  "i’ll watch next week. probably. if i remember. remind me",
  "it was good when the big guy was on and medium when he wasn’t"],
 hate:["changed the channel to a show about fixing houses. a man fixed a house. more exciting",
  "my friend said this show was good now. my friend has been lying to me for 11 years",
  "fell asleep. woke up. still on. fell back asleep. that’s my review",
  "dad got up to get a snack during the main event and never came back. i think he’s at the store",
  "i wanted to like it. i really did. i got snacks and everything",
  "my brother turned it off without asking and i didn’t even fight him. that’s how you know",
  "i stopped watching and started a puzzle. the puzzle is a picture of a barn. still more fun",
  "turned it off at 8:40. i was in bed by 9. i’m 41. i don’t regret it"],
 hateS:["who are all these people. i don’t know a single one. is this a different show",
  "where’s the guy. you know the guy. the famous one. they should put him on",
  "every wrestler tonight was a guy i’ve never heard of. how am i supposed to know who to clap for",
  "is this the junior varsity? where are the varsity guys",
  "they need to put on someone i’ve seen on a t-shirt. tonight was nobody from a t-shirt",
  "i asked my wife who the main event guys were and she said “i don’t know they look like accountants”",
  "no famous ones tonight. i don’t watch to meet new people. i have enough people",
  "googled the main event guy and google said “did you mean” and gave me a different guy. even google doesn’t know him"],
 hateQ:["the famous guys were there but it was kinda bad?? i didn’t know they could be famous AND bad",
  "it was boring and i can’t explain why. usually i can’t explain why it’s good either",
  "normally this show is good. tonight it was like the show was tired",
  "the main event was so slow my tv asked if i was still watching. i said no",
  "i didn’t yell once. i always yell. something was wrong",
  "it was worse than last week. i don’t remember last week but i know it was better"],
 hateF:["nobody was mad at anybody. why are they fighting if they’re not mad. explain",
  "i need someone to HATE someone. tonight everybody was just kind of… fine with each other",
  "two guys wrestled and they didn’t even seem upset. what’s the point if they’re not upset",
  "i watch for the drama. there was no drama. i could have watched my parents’ marriage for that"],
 hateT:["no belts tonight?? what are they even fighting FOR",
  "nobody won a belt. nobody even TRIED to win a belt. i don’t get it",
  "i waited the whole show for someone to hold up a belt. nobody held up a belt. i held up my remote. alone",
  "no title match is like a birthday party with no cake. a sad party. just a room"],
 hateX:["no cage, no ladder, no table. just guys in a ring. i could see that at the y",
  "every match was a regular match. i want the ones with extra words in the name",
  "nobody got put in anything. not a cage, not a box, nothing. what a waste of a ring",
  "where’s the gimmick. any gimmick. put a guy in a coffin. put a guy in a different coffin"],
 sw:["flipped to {OT}. it wasn’t great either but it was less not great",
  "my remote slipped and landed on {OT}. it was a little better there. i stayed",
  "{OT} was on the other channel and the other channel was slightly more fun. that’s math"],
 swS:["went over to {OT}. they had guys i know",
  "{OT} had more famous guys. i go where the famous guys are",
  "my brother put on {OT} because they had the guy from the commercials. my brother was right. i hate when he’s right",
  "{OT} had somebody i’ve seen on a t-shirt. that’s all it takes. that’s the whole secret"],
 swT:["{OT} had a belt match. sorry. i go where the belts go",
  "switched to {OT}. somebody over there was holding up a belt. i need to see belts held up",
  "{OT} said “for the championship” and my thumb just went there on its own"],
 swF:["{OT} had {OM} and those two HATE each other. i need people who hate each other",
  "flipped to {OT} for {OM}. i don’t know what happened between them but i need to see it",
  "my wife made us watch {OT} because of the drama in {OM}. now we’re both on a side"],
 swX:["{OT} had a special kind of match with extra words in the name. i live there now",
  "flipped to {OT} because they had one of the big gimmick matches. something big. i love big",
  "{OT} put people in a big special match. i don’t know the rules. i don’t need to know the rules"],
 swQ:["{OT} was just better tonight. i don’t know why. i’m not a scientist",
  "flipped to {OT} and it was more fun. don’t ask me to explain. i can’t",
  "{OT} had a better show. my dad said so and he only watched like 4 minutes"],
 swin:["came over from {OT}. it was ok over there. this is more ok",
  "flipped from {OT} during a commercial. stayed. this one’s a little better i think",
  "left {OT}. not for any reason. ok one reason. this is better"],
 swinS:["{OT} had nobody i’ve heard of so i came here. hi. who’s famous here",
  "left {OT} at the third guy i didn’t know. you have guys i know. i think",
  "my cousin said the famous ones are over here, not on {OT}. my cousin is right once a year and this is the once"],
 swinQ:["{OT} was boring so i’m here now. is this the good one",
  "left {OT} because it felt tired. like a show that needed a nap"],
 swinF:["nobody on {OT} was mad at anybody. i came here for people who are mad",
  "{OT} had no drama. i need drama. i came here. please be dramatic"],
 swinT:["{OT} didn’t have a single belt on the line. i came here for belts",
  "no title matches on {OT}. so i’m here. show me a belt"],
 swinX:["{OT} was all regular matches. i came over for the ones with extra words",
  "nobody on {OT} got put in a cage or anything. so here i am. put somebody in something"]},
tech:{
 love:["A clean finish. No interference. No nonsense. I allowed myself one small nod of approval. Do not expect a second.",
  "Tonight’s card would hold up on a 1994 Japanese tour. I don’t say that lightly. I’ve never said it before.",
  "Watched it once with commentary, once without, once with a stopwatch. It survived all three viewings.",
  "Finally, a show that trusts the audience to appreciate a headlock. Well, part of the audience. My part.",
  "I gave tonight’s card a full star more than I expected to. I am recalibrating my entire system.",
  "Selling: consistent. Limb work: followed through. Transitions: earned. I may have to update my all-time list. In pen.",
  "My partner asked why I was applauding a rest hold. It was not a rest hold. We are discussing whether to stay together.",
  "If you thought tonight was “slow,” you are the reason the rest of the week is fast.",
  "I sent the main event to my tape-trading group. Two members responded “acceptable.” That’s a standing ovation.",
  "I counted fourteen distinct counter-holds. I keep a ledger. It’s leather-bound.",
  "Someone sold an arm for twenty minutes and never once forgot. I had to step outside.",
  "No dives. No tables. Just two craftsmen disassembling each other. Pure. The casuals were confused. Perfect.",
  "Tonight I understood wrestling a little better. That has not happened since 2009.",
  "I won’t explain why this show was great. If you have to ask, you weren’t watching correctly."],
 loveM:["{M} was a seminar. Most of you watched it like a cartoon.",
  "{A} and {B} spent the first ten minutes just feeling each other out and I felt seen.",
  "{M} at {ST} stars? Conservative. Reckless, even. I’ve written a strongly worded memo to myself.",
  "The counter sequence in {M} should be studied. I’ve begun a syllabus. Enrollment: me.",
  "{A} targeted one limb the whole match and {B} sold it like their life depended on it. This is the art form.",
  "{M} is the reason I still watch. It’s also the reason I watch with headphones in.",
  "{A} vs {B} needs a director’s cut. I’ve made one. It’s mostly the wristlocks, slowed down.",
  "Nobody in the arena understood what {A} did to {B} at minute eight. I did. I’ll carry that alone.",
  "{M}. {ST}. I have notes. All of them are footnotes praising other footnotes.",
  "{A} reversed out of a hold I didn’t know had a reversal. I’ve been doing this for twenty-two years.",
  "If your favorite part of {M} was the finisher, please unfollow me.",
  "{A} vs {B} was the most literate thing on television tonight, and I watched a documentary about Latin.",
  "{M} restored my faith in the medium. Temporarily. Don’t push it."],
 meh:["One real wrestling match on the card. One. The rest was what the kids call “content.”",
  "Fine. Competent. The wrestling equivalent of a hotel breakfast. Give me a full technical showcase.",
  "A taste of real grappling, then a lot of shouting. I can’t survive on a taste. I have standards to feed.",
  "Watchable once. I will not be rewatching. I rewatch everything. Think about that.",
  "Nobody committed to the mat. It was like watching a pianist who refuses to use the left hand.",
  "Two decent minutes of chain wrestling surrounded by a festival of nonsense.",
  "Pleasant. Unambitious. I’ve logged it under “exists.”",
  "There was technical wrestling tonight, technically. Barely. Give two technicians the time next week."],
 mehM:["{M} began with a lovely exchange of holds and then, tragically, someone remembered the crowd exists.",
  "{M} was an appetizer. I’m still hungry. For wristlocks.",
  "{M} at {ST}. The feeling-out process was rushed like they had a dinner reservation.",
  "{A} built something beautiful against {B}, then abandoned it for a superkick. Selling is a commitment, not a hobby.",
  "{M} had a strong first act and then lost the plot. And the plot was a hammerlock.",
  "{A} vs {B} was fine. I didn’t take notes. I always take notes.",
  "{M} was close. With ten more minutes and a cleaner finish, it would’ve made my list."],
 hate:["I expected more. I always expect more. I am a professional at disappointment.",
  "That was wrestling the way a vending machine sandwich is a meal.",
  "I’ve seen better technical work at a regional high school tournament. The heavyweight was asleep. Still better.",
  "Not one sequence worth showing to anyone who respects the craft. So, not worth showing to me."],
 hateM:["{M} at {ST}. Generous. Very generous. Someone is being paid.",
  "{M} had all the ingredients of a technical match except the part where they wrestle technically.",
  "{A} vs {B} should have been a clinic. It was a walk-in clinic. With a long wait.",
  "{M} had a beginning, a middle and an end. None of them had a single hold worth remembering.",
  "{A} vs {B} was a list of moves with no connective tissue. A grocery list of offense.",
  "{M}. I have seen tighter headlocks on a child hugging a golden retriever.",
  "I gave {M} my full attention. I am requesting a refund of my attention.",
  "{A} and {B} wrestled like they learned from a video game tutorial. On easy."],
 ign:["Not one technical match on the entire card. I watched to the end to be sure. Thoroughness is my burden.",
  "Three hours. Zero wristlocks. I have the timestamps. I always have the timestamps.",
  "Another week booked for people who clap at pyro and think a dropkick is a story.",
  "Nothing for us. Again. I’m rewatching a 1985 house show in protest. On VHS. In the dark.",
  "No two technicians in the same ring all night. It’s like a cooking show with no ingredients.",
  "Every segment ended with someone diving or bleeding. Nobody tried to outwrestle anyone. Where are the scholars?",
  "Two technicians. A clean finish. That’s the whole recipe. It isn’t hard. Apparently it’s hard.",
  "My viewing spreadsheet has a tab for every show. Tonight’s tab is blank. Its emptiness haunts me."],
 runin:["A run-in decided the match. I’ve closed the tab, the browser and the curtains.",
  "Someone ran in. Of course someone ran in. God forbid two athletes settle something themselves.",
  "I wrote “run-in incoming” in my notebook eight minutes early. Being right has never felt so bad.",
  "A run-in finish. In the year of our lord.",
  "Twenty minutes of genuine craftsmanship, undone by a man in a hoodie sprinting down the ramp.",
  "The interference arrived just as the match reached its thesis. I would like the thesis back.",
  "Interference has a place. That place is the garbage. Next to the people who enjoy it."],
 screw:["A low blow behind the referee’s back to finish. I await a formal apology to the sport.",
  "A screwy finish. I paid for a conclusion, not a cliffhanger.",
  "Feet on the ropes for the pin. The referee was looking directly at it. I’ve filed a complaint with the referee’s mother.",
  "They wrestled a gorgeous match and then forgot the part where someone wins properly.",
  "A cheap finish on a match that earned a clean one. The universe owes me a pinfall.",
  "They went home on a disqualification. I went to bed on a disappointment."],
 sw:["Watched {OT} instead. They had an actual wrestling match. Look it up. Learn.",
  "Spent the evening with {OT}. Their mat work was competent. I resent that deeply.",
  "Switched to {OT} for the second hour. Do not make me admire them again."],
 swM:["{OT} had {OM}. Real wrestling. I’m admitting it publicly. Let the record show I’m furious.",
  "Defected to {OT} for {OM}. Two people who understand leverage. You should try booking some.",
  "{OM} on {OT} was the only literate thing on television tonight. I went where the literacy was."],
 swin:["Arrived from {OT}. Their idea of technical wrestling tonight was two people hugging and grunting.",
  "Left {OT}. Their mat work tonight was a rumor."],
 swinI:["{OT} had zero technical wrestling tonight. Not a wristlock. I came here out of necessity.",
  "Fled {OT}. Three hours without a single chain sequence. I’m told the wrestling lives here."],
 swinM:["Came over from {OT} for {M}. A sound decision. I make many.",
  "{OT} let me down, so I watched {M} here instead. Correct choice. As usual."]},
blood:{
 love:["^RED. RED EVERYWERE. GOOD SHOW",
  "^BLOOD WAS ON THE GROUND AND THEN MORE BLOOD WAS ON THE GROUND. THATS TWO BLOODS",
  "^I YELLED SO LOUD I PUKED A LITTLE. WORTH IT. DO IT AGAIN",
  "^SOMEBODY GOT BUSTED THE FUCK OPEN AND I STOOD UP AND SCREAMED AT MY TV FOR LIKE A MINUTE STRAIGHT",
  "^THE MAT WAS WHITE AND THEN IT WASNT. THATS WHAT I CALL ART",
  "^I DONT KNOW WHO WON I WAS LOOKING AT THE BLOOD THE WHOLE TIME",
  "^SMASH HIS FACE INTO THE STEPS. THEY DID. I SAID IT AND THEY DID IT",
  "^FRONT ROW GOT BLOOD ON THEM. LUCKY. SO FUCKING LUCKY",
  "^I GOT SO HYPED I PUNCHED A HOLE IN MY WALL. FUCK THE WALL. FUCK YEAH",
  "^THE REF WAS COVERED IN IT. THE REF. EVERYBODY GOT SOME",
  "^BLOOD GOOD. CHAIR GOOD. TONIGHT GOOD",
  "^MORE. MORE. MORE. MORE. MORE"],
 loveM:["^{A} GOT STUCK LIKE A PIG. OINK OINK MOTHERFUCKER",
  "^{A} AND {B} WERE BOTH BLEEDING SO I DONT EVEN CARE WHO WON. EVERYBODY WON. ME",
  "^I WANNA SEE {B}S FOREHEAD AGAIN. WHATS LEFT OF IT. THERE WASNT MUCH LEFT",
  "^{M}. {ST} STARS. SHOULD BE MORE STARS. BLEED MORE NEXT TIME FOR MORE STARS",
  "^{A} LOOKED LIKE THEY GOT HIT BY A TRUCK. RUN {A} OVER AGAIN",
  "^{A} HIT {B} WITH A CHAIR SO HARD IT BENT. HIT HIM WITH THE BENT ONE NEXT",
  "^{M} WAS A FUCKING MASACRE. MASSACRE. HOWEVER YOU SPELL IT IT WAS ONE",
  "^{A} WAS POURING BLOOD AND KEPT SWINGING. THATS A FUCKING MAN",
  "^{M} AT {ST}. WHY NOT FIVE. NOBODY WENT THRU THE STAGE THATS WHY. GO THRU THE STAGE",
  "^I WANT A SHIRT WITH {A}S FACE ON IT AFTER {B} GOT DONE WITH IT. EXTRA LARGE. RED SHIRT",
  "^{A} VS {B} WAS SO FUCKING SICK I CANT SIT DOWN. I WONT SIT DOWN",
  "^DOES {A} HAVE ANY BLOOD LEFT. LETS FIND OUT NEXT WEEK"],
 meh:["^I COULD STILL SEE THERE FACES. WHY CAN I SEE THERE FACES. PUT THEM IN A CAGE",
  "^LITTLE BIT OF BLOOD. LITTLE BIT. I WANT A BIG BIT. STREET FIGHT. BIG BIT",
  "^THE CHAIRS WERE JUST SITTING THERE. LIKE CHAIRS. USE THE FUCKING CHAIRS",
  "^SOMEBODY HAD A KENDO STICK AND DIDNT HIT NOBODY WITH IT. HIT SOMEBODY YOU COWARD",
  "^GOOD PUNCHING. NOT ENOUGH RED. GET THE BARB WIRE OUT",
  "^ALMOST GOOD. ALMOST. NEEDED A CAGE OR A TABLE OR A CAGE WITH A TABLE IN IT",
  "^OK SHOW. NOBODY WENT TO THE HOPSITAL THO. SOMEBODY NEEDS TO GO TO THE HOPSITAL"],
 mehM:["^{M} HAD A LITTLE BLOOD. A LITTLE. I WANT {A} DRIPPING",
  "^ONE CHAIR SHOT IN {M}. ONE. FUCKING ONE",
  "^{A} AND {B} JUST USED THERE HANDS. THERES WEAPONS UNDER THE RING. GRAB ONE",
  "^{A} VS {B} WAS ALMOST A WAR. ALMOST IS FOR PUSSIES",
  "^{M} NEEDED A TABLE. AND ANOTHER TABLE. AND THE STAPLE THING",
  "^{A} ONLY BLED LIKE A NOSEBLEED. I WANT {A} STUCK LIKE A PIG",
  "^{M} WAS ALMOST THERE THEN THEY STOPPED. WHY THE FUCK DID THEY STOP"],
 hate:["^I FUCKING HATE SOFT SHIT AND THIS WAS ALL SOFT SHIT",
  "^EVERYBODY WALKED TO THE BACK ON THERE OWN. NOBODY GOT CARRIED. WHATS THE FUCKING POINT",
  "^NOBODY BLED. NOT ONE GUY. NOT EVEN A LITTLE. FUCK THIS SHOW",
  "^THIS SHOW WAS FOR BABYS. PUSSY ASS SOFT SHIT"],
 hateM:["^{M} AND NO BLOOD. NO BLOOD. WHAT. OPEN SOMEBODY UP",
  "^{A} VS {B} WAS A FUCKING PILLOW FIGHT. HIT HIM WITH SOMETHING HARD",
  "^{M} WAS SOFT. I HATE SOFT. I HATE {A} NOW. SORRY {A}. NOT SORRY",
  "^{A} AND {B} TOUCHED EACH OTHER LIKE AT A WEDDING. HIT HIM. HIT HIM. WHY DIDNT YOU HIT HIM",
  "^THE MOST VIOLENT THING IN {M} WAS {A} FIXING THERE KNEEPAD",
  "^{M}. NO STAPLES. NO TABLES. NO BLOOD. NO NOTHING. ZERO",
  "^{A} AND {B} SHOOK HANDS AFTER. I WANTED SOMEBODY CARRIED OUT"],
 ign:["^NO WEAPONS. NONE. SOMEBODY LOCKED THE CHAIR ROOM. WHO HAS THE KEY",
  "^ZERO BLOOD. I WATCHED THE REPLAY. STILL ZERO. FUCK OFF",
  "^NO STREET FIGHT NO CAGE NO BARB WIRE. WHERES THE FUCKING VIOLENCE",
  "^THE TABLES WERE RIGHT THERE. NOBODY WENT THRU ONE. PUT SOMEBODY THRU A FUCKING TABLE",
  "^NOTHING FOR US AGAIN. I WANT BLOOD AND I WANT IT NEXT WEEK",
  "^NOBODY GOT THROWN INTO THE STEEL STEPS. NOT ONCE. SOFT",
  "^NOT ONE WEAPON. NOT ONE CHAIR. NOT ONE TABLE. BULLSHIT",
  "^PLEASE BOOK A STREET FIGHT. OR A CAGE. OR BOTH. A STREET FIGHT IN A CAGE",
  "^SOFT SHIT. 3 HOURS. I COUNTED. SOFT SHIT THE WHOLE TIME",
  "^BOOK SOMETHING VIOLENT OR IM DONE WITH THIS SOFT ASS SHOW"],
 sw:["^WENT TO {OT}. SOMEBODY OVER THERE GOT HURT. I LIKE HURT",
  "^{OT} HAD BLOOD AND YOU DIDNT. FUCK OFF",
  "^WATCHED {OT} FOR THE SECOND HALF. THEY ACTUALLY HURT SOMEBODY"],
 swM:["^{OT} HAD {OM}. THAT HAD THE HURTING IN IT. SO I WENT THERE",
  "^FLIPPED TO {OT} FOR {OM}. FINALLY SOMEBODY HIT SOMEBODY WITH SOMETHING",
  "^{OM} ON {OT} WAS BETTER THEN YOUR WHOLE SOFT ASS SHOW"],
 swin:["^CAME FROM {OT}. NOBODY GOT HURT OVER THERE. WHAT IS THE POINT OF THEM",
  "^LEFT {OT}. THERE FIGHT WAS A HUG. SOFT SHIT"],
 swinI:["^{OT} HAD NOTHING VIOLENT. NOTHING. IM HERE NOW. HIT SOMEBODY",
  "^{OT} WAS SOFT AS SHIT. CAME HERE. HURT SOMEBODY"],
 swinM:["^LEFT {OT} FOR {M}. FUCK YEAH",
  "^{OT} WAS SOFT SO I CAME FOR {M}. THIS IS WHERE THE HURTING IS"]},
flip:{
 love:["^GRAVITY CALLED IN SICK TONIGHT AND NOBODY NOTICED",
  "slowed the big dive to 0.1x and added choir music. i cried. my roommate cried. the choir would’ve cried",
  "my phone is out of storage. deleted my grandma’s birthday video for tonight’s clips. she’d understand. she wouldn’t",
  "^SOMEONE FLEW INTO THE FOURTH ROW. THE FOURTH ROW. THEY HAD TO PAY FOR THAT SEAT AND THEY GOT A WRESTLER",
  "the guardrail took the worst beating of its career and i want to buy it a drink",
  "every match had at least one move a physics teacher would call the cops about",
  "my knees physically hurt from watching. 11/10. please hurt my knees again",
  "^THE AIRSPACE WAS CONGESTED TONIGHT. NEEDED AIR TRAFFIC CONTROL",
  "my little brother jumped off the couch during the main event. he’s in a sling now. legacy",
  "stood up every time somebody climbed a turnbuckle. i don’t have legs anymore. i’m a torso and i’m happy",
  "every clip from tonight looks fake. they are ALL REAL. WATCH THE REPLAY. WATCH IT AGAIN",
  "they were moving so fast i couldn’t tell who was who. that’s the point. that’s the art",
  "i paused it mid-dive and the screenshot looks like a renaissance painting",
  "my smartwatch asked if i was doing a workout. no. i was watching people defy god"],
 loveM:["^{A} LEFT THE EARTH AND I HAVE NOT SAT DOWN SINCE",
  "the clip from tonight has 2M views already. give {A} a raise and a trampoline and a helmet",
  "{M} had a sequence so fast my tv buffered. my brain buffered. i’m still buffering",
  "watched it back frame by frame. STILL can’t see how {A} did that. maybe witchcraft",
  "{A} vs {B} was a highlight reel with a match attached and that is the nicest thing i’ve ever said",
  "thank you {A} for the gif i will be replying with for the rest of my life",
  "^{M}. {ST} STARS. ZERO GRAVITY. ZERO NOTES. ZERO FEAR",
  "{A} jumped off something that is NOT for jumping off of. thank you {A}. please see a doctor {A}",
  "the dive in {M} cleared three people, a camera guy and my expectations",
  "{A} vs {B} had the sequence of the year and i will not be taking questions",
  "^{M} WAS A VIDEO GAME AND I WAS MASHING BUTTONS AT MY TV",
  "every time {A} left the ground my soul left my body and tagged along"],
 meh:["one dive. ONE. that’s not a show, that’s a trailer. give me a ladder or a multi-person",
  "good stuff but i need a multi-person match with no gravity and no rules about gravity",
  "almost got me out of my seat. almost. a ladder would’ve launched me",
  "decent show but the top rope was basically decoration. like a fence. a sad fence",
  "the high flying was more like medium flying. economy class",
  "some good spots. not enough. it’s never enough. i will never be full",
  "fun but the guardrail made it home in one piece. unacceptable"],
 mehM:["{M} had ONE dive. ONE. stop teasing me",
  "{M} was cool on the mat but the mat is not where i live",
  "close!! give {A} a ladder next time and back away slowly",
  "{M} was one dive away from greatness and they didn’t take it",
  "{A} TEASED a dive on {B} and then just… walked away. war crime. hague. tribunal",
  "{A} vs {B} had two flyers and they wrestled on the floor. like owning a jet and driving it on the highway"],
 hate:["if i wanted to watch people roll around on the mat i’d go to my cousin’s jiu-jitsu class. i’ve been. it’s bad",
  "gravity won tonight. gravity always wins when we let it",
  "not ONE moonsault. what are we doing. what are we DOING",
  "i timed it. total time anyone spent in the air all show: four seconds"],
 hateM:["{A} vs {B} and NOBODY left the ground?? give these people a ladder and leave the building",
  "{M} at {ST}?? they had flyers in there and booked it like a chess game",
  "{M} was so grounded it pays property tax",
  "{M} had flyers in it and nobody flew. that’s false advertising. calling the FTC",
  "{A} vs {B} at {ST} because nobody took a single risk. i’m not mad. i’m screaming",
  "{M} was a ground game and i am a SKY person"],
 ign:["zero dives. ZERO. the guardrail was RIGHT THERE. it was begging",
  "started a petition to bring back the flyers. it has a logo, 4,000 signatures and a theme song with a key change",
  "no ladder, no multi-person, no dives. was this show sponsored by gravity",
  "nobody touched the top rope all night. someone check on the top rope. it’s lonely",
  "^WHERE WERE THE FLYERS. I AM ASKING CALMLY. (I AM NOT CALM.)",
  "came to see people fall down on purpose. watched people stand up on purpose",
  "no multi-person match, no ladder. i came for the sky and got the floor",
  "if next week doesn’t have a dive i’m diving off my couch in protest. onto my roommate. he’s been warned",
  "my clip folder for tonight is EMPTY. there is NOTHING IN IT",
  "i brought binoculars to look UP. never had to look up once"],
 sw:["switched to {OT} halfway through. at least somebody over there left their feet",
  "^{OT} HAD PEOPLE IN THE AIR. IS THAT SO HARD",
  "watched {OT}. they let people JUMP over there"],
 swM:["flipped to {OT} for {OM}. people left the ground. on purpose. imagine",
  "^{OM} ON {OT}. THAT’S WHERE THE SKY WAS",
  "{OT} had {OM}. i follow the flying. i don’t make the rules"],
 swin:["came over from {OT}. they barely left the ground tonight. heard you fly here",
  "left {OT}. if i wanted to watch people lie on a mat i’d take a nap on one"],
 swinI:["{OT} was so grounded i fell asleep standing up. nobody flew. not once",
  "{OT} had zero dives. ZERO. came here. please jump"],
 swinM:["{OT} kept everyone on the mat so i came over for {M}. good call, me",
  "^LEFT {OT} FOR {M}. NO REGRETS"]},
chaos:{
 love:["I threw a chair in my own living room. My landlord came up to yell and now HE’S throwing chairs.",
  "the run-in had a run-in. the second run-in had a run-in. i need someone to run in on me while i lie down",
  "I don’t know who the masked guy was. I don’t need to know. He’s my father now.",
  "^NOBODY KNEW WHAT WAS GOING ON AND THAT’S THE WHOLE POINT",
  "the ref got knocked out. the backup ref got knocked out. i would like to apply to be the third ref",
  "this show had the energy of a raccoon in a vending machine and i mean that with love",
  "My neighbor slid a note under my door. It said “stop screaming.” I slid it back. It said “no.”",
  "my therapist asked what brings me joy. i showed her the last ten minutes. now she has a therapist",
  "^EVERYTHING WENT WRONG AND IT WAS PERFECT",
  "someone came out of the crowd. someone came out of the ring. someone came out of my FRIDGE",
  "the lights went out and when they came back i had a new favorite wrestler and a new religion",
  "i don’t know who won ANYTHING and i’ve never been happier",
  "my dog barked at the tv during the brawl. he gets it. he’s chaos too",
  "no rules, no brakes, no seatbelts. i rode it the whole way down"],
 loveM:["^{A} AND {B}. I THREW A LAMP. I DON’T KNOW WHOSE LAMP",
  "weeks of trash talk and {A} and {B} finally got their hands on each other and i screamed so loud my neighbor screamed back",
  "{M} was so chaotic my smoke detector went off. there was no smoke. it just sensed the energy",
  "{A} with a live mic is a public safety hazard and i want it every single week",
  "{M} at {ST}. the extra stars are for the parts that broke the law",
  "{A} vs {B} broke something in me and the something was my coffee table",
  "{A} grabbed the mic and i swear the building’s insurance went up",
  "{M} spilled into the crowd and kept going. somebody check if it’s still going. i hope it’s still going",
  "{A} vs {B} ended with six people in the ring and nobody knows why. not even them. masterpiece",
  "{M} at {ST}. the referee needs hazard pay and a therapist",
  "{A} said something on the mic that’s going to get somebody fired and i want {A} to be president"],
 meh:["fun but nobody interfered. i had my sign ready. it said RUN IN.",
  "close!! but nobody got jumped after the bell. the bell is just a suggestion. ignore it",
  "almost unhinged. almost. next week somebody needs to run in from the crowd with a trash can",
  "a nice appetizer. where is the chaos entrée. where is the chaos dessert",
  "ok show. needed at least one parking lot brawl. ideally with a car. ideally on fire",
  "some chaos. not enough chaos. i need a balanced diet of chaos and it’s all chaos",
  "almost lost it at one point. ALMOST. almost is the worst word in english"],
 mehM:["{M} was fun but nobody interfered. i had my sign. it said RUN IN.",
  "{M} was an appetizer. where is the main course of mayhem",
  "{A} vs {B} got weird for a minute then everybody calmed down. why would you calm DOWN",
  "{M} was getting messy and then someone remembered the rules. boo. boo the rules",
  "{A} had a live mic for thirty seconds. that’s a teaser. give me the three-hour director’s cut",
  "{A} vs {B} was BEGGING for a run-in. nobody ran. nobody even jogged"],
 hate:["everybody stayed in their lane tonight. i hate lanes. i want a demolition derby",
  "clean finishes all night. who is this for. who asked. show me the person who asked and i’ll run in on them",
  "most polite wrestling show i’ve ever seen. i don’t want polite. i want a lawsuit",
  "nobody got jumped. nobody got betrayed. nobody yelled. was this a library. was this a funeral"],
 hateM:["{M} was so clean it squeaked. i want it to SMELL",
  "{A} and {B} shook hands after. HANDS. SHOOK. CONSENSUALLY",
  "{M} followed every single rule and i’ve never been so offended in my life",
  "{M} was so by-the-book i’m burning the book. and the library",
  "{A} and {B} had a perfectly clean match. GROSS. disinfect my tv",
  "{M} needed someone to come through the crowd with a trash can. NOBODY CAME. NOT EVEN A GUY WITH A RECYCLING BIN"],
 ign:["a whole show and nobody interfered. not once. i had my sign ready. it said RUN IN.",
  "the most chaotic thing tonight was the ring announcer’s tie",
  "I sat in the same position for three hours waiting for something to go wrong. Nothing went wrong. That’s what went wrong.",
  "no run-ins, no brawls, no live mics. they booked us a nap and a juice box",
  "not one run-in. i stood by my front door all night in case one ran into MY house",
  "no brawls, no betrayals, no thrown microphones. filing a missing persons report for the chaos",
  "everybody came out, wrestled, and left. like a dentist appointment. a GOOD dentist appointment. disgusting",
  "had popcorn ready for a riot. ate it during a handshake"],
 sw:["switched to {OT}. stuff actually went wrong over there. that’s MY content",
  "watched {OT}. their show felt like a fire alarm and i mean that as the highest compliment",
  "{OT} got messy. you stayed tidy. bye"],
 swM:["{OT} had {OM}. that’s where the mess was. i go where the mess is",
  "flipped to {OT} for {OM}. it was unhinged. i need unhinged",
  "{OM} on {OT} had more chaos than this whole show. sorry. not sorry"],
 swin:["fled {OT}. too polite over there tonight. smelled like a church picnic",
  "came over from {OT} because nothing over there was catching fire"],
 swinI:["{OT} was so calm i thought my tv was paused. nothing went wrong. NOTHING. hi",
  "zero run-ins, zero brawls on {OT}. i came here. please ruin something"],
 swinM:["left {OT} for {M}. it’s chaos over here. i’m home",
  "{OT} behaved. so i came over for {M}. good choice. bad behavior"]}};
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
function xrFill(t,c){let ok=true;const out=t.replace(/\{(A|B|M|ST|OT|OM|SH|TH)\}/g,(m,k)=>{const v=c[k];if(v==null||v===''){ok=false;return ''}return v});return ok?out:null}
/* one post from a crowd's bank (or the first bank that can fill it), skipping recent ones */
function xrPick(g,banks,c,used){S.xrSeen=S.xrSeen||[];const seen=S.xrSeen;
 for(const bk of banks){const l=(XR_POSTS[g]&&XR_POSTS[g][bk])||[];const fill=l.map((t,i)=>({id:g+'.'+bk+'.'+i,x:xrFill(t,c)})).filter(p=>p.x&&!used.has(p.id));if(!fill.length)continue;
  const fresh=fill.filter(p=>!seen.includes(p.id));const p=fresh.length?xrRand(fresh):fill.sort((a,b)=>seen.indexOf(a.id)-seen.indexOf(b.id))[0];
  used.add(p.id);seen.push(p.id);if(seen.length>XR_SEEN_MAX)seen.splice(0,seen.length-XR_SEEN_MAX);
  let x=p.x;if(x[0]==='^')x=x.slice(1).toUpperCase();if(g==='cas')x=x.toLowerCase();return x}
 return null}
function xrNm(k){return k&&typeof nameOf==='function'?nameOf(k):''}
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
   else if(v==='Watching')add(g,['meh'],w*.6);else if(v==='Tuned out'){const y=(r.wy&&r.wy.cas)||'';const n=(y.match(/needed (.*)/)||[])[1]||'';
    const k=/up to your usual/.test(y)?'hateQ':/star power/.test(y)?'hateS':/^bigger stars/.test(n)?'hateS':/^a hot feud/.test(n)?'hateF':/^a title/.test(n)?'hateT':/^a big match type/.test(n)?'hateX':'hate';add(g,k==='hate'?['hate']:[k,'hate'],w)}return}
  const nx=(r.nx&&r.nx[g])||'';
  if(v==='Loved it')add(g,M?['loveM','love']:['love'],w);
  else if(v==='Wanted more')add(g,M?['mehM','meh']:['meh'],w*.8);
  else if(v==='Let down')add(g,g==='tech'&&/run-in/.test(nx)?['runin','hateM','hate']:g==='tech'&&/clean finish/.test(nx)?['screw','hateM','hate']:M?['hateM','hate']:['hate'],w*1.1);
  else if(v==='Ignored')add(g,['ign'],w)});
 /* the loudest crowd gets a second post on a big night */
 const top=FB_G.slice().sort((a,b)=>Math.abs(d(b))-Math.abs(d(a)))[0];if(top&&Math.abs(d(top))>=5000){const v=fbVd(r,top)[1];const c=ctx(top),M=!!(c.A&&c.B);add(top,v==='good'?(top==='cas'?['love','stars']:M?['loveM','love']:['love']):top==='cas'?['hate']:fbVd(r,top)[0]==='Ignored'?['ign']:M?['hateM','hate','meh']:['hate','meh'],Math.abs(d(top))*.7)}
 /* fans who switched shows. v517: each post names the show they actually went to or came from, and says only what that
    show's own result for that crowd shows: the segment that fed them, why casuals took to it, or that it had nothing for them */
 const sw=r.sw||{};let lost=0,won=0;const others=Object.keys(o.fb||{}).filter(k=>k!==br);
 const otFor=(g,d)=>others.filter(k=>((o.fb[k].sw||{})[g]||0)*d>0).sort((a,b)=>((o.fb[b].sw||{})[g]-(o.fb[a].sw||{})[g])*d)[0]||others[0];
 const casK=y=>/feud/i.test(y)?'F':/star power|favorite stars|kind of stars/i.test(y)?'S':/title/i.test(y)?'T':/match type/i.test(y)?'X':/better show|strong show|up to your usual/i.test(y)?'Q':'';
 const casOut=y=>{const n=(y.match(/needed (.*)/)||[])[1]||'';return /up to your usual/.test(y)?'Q':/star power/.test(y)||/^bigger stars/.test(n)?'S':/^a hot feud/.test(n)?'F':/^a title/.test(n)?'T':/^a big match type/.test(n)?'X':''};
 FB_G.forEach(g=>{const n=sw[g]||0;if(Math.abs(n)<1000||!others.length)return;const k=otFor(g,n<0?1:-1),r2=o.fb[k]||{};
  const c=Object.assign(ctx(g),{OT:xrNm(k)||null,OM:r2.ms&&r2.ms[g]&&r2.mt&&r2.mt[g]||null});const vd2=r2.vd&&r2.vd[g],y2=(r2.wy&&r2.wy[g])||'';
  let banks;
  if(n<0){if(g==='cas'){const x=FB_VD[vd2]==='good'?casK(y2):'';banks=x?['sw'+x,'sw']:['sw']}else banks=c.OM?['swM','sw']:['sw']}
  else{if(g==='cas'){const x=FB_VD[vd2]==='bad'?casOut(y2):'';banks=x?['swin'+x,'swin']:['swin']}else banks=vd2==='Ignored'?['swinI']:c.M?['swinM','swin']:['swin']}
  const x=xrPick(g,banks,c,used);if(x){posts.push({g,h:handle(g),x,w:Math.abs(n)*(n<0?1.5:1.2)});n<0?lost++:won++}});
 const otL=others.slice().sort((a,b)=>FB_G.reduce((s,g)=>s+((o.fb[b].sw||{})[g]||0)-((o.fb[a].sw||{})[g]||0),0))[0];
 const otW=others.slice().sort((a,b)=>FB_G.reduce((s,g)=>s+((o.fb[a].sw||{})[g]||0)-((o.fb[b].sw||{})[g]||0),0))[0];
 posts.sort((a,b)=>b.w-a.w);/* the first three you see come from different crowds when they can */
 const first=[];posts.forEach(p=>{if(first.length<3&&!first.some(q=>q.g===p.g))first.push(p)});const list=first.concat(posts.filter(p=>!first.includes(p))).slice(0,7);
 /* likes and reposts follow how many fans moved */
 let t=1;list.forEach(p=>{const lk=Math.max(40,p.w*(.2+Math.random()*.4));p.m=[xrNum(lk),xrNum(lk*(.08+Math.random()*.16))];p.t=t+'m';t+=1+Math.floor(Math.random()*3);delete p.w});
 const tot=FB_G.reduce((a,g)=>a+d(g),0);const c0={OT:ot||'the other show',TH:typeof nameOf==='function'?nameOf(br):'Their show'};
 const tier=own?(tot>=15000?'big':tot>=4000?'good':tot>=-2000?'mixed':tot>=-10000?'bad':'awful'):(tot>=8000?'rbig':tot>=0?'rmixed':'rbad');
 let say=xrFill(xrRand(XR_SAY[tier]),c0);
 if(own&&ot&&lost&&Math.random()<.7)say+=' '+xrFill(xrRand(XR_ADD.lost),Object.assign({},c0,{OT:xrNm(otL)}));else if(own&&ot&&won&&Math.random()<.7)say+=' '+xrFill(xrRand(XR_ADD.won),Object.assign({},c0,{OT:xrNm(otW)}));else if(o.ppv&&Math.random()<.5)say+=' '+xrRand(XR_ADD.ppv);
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
