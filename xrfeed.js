/* v505 (posts rewritten v517): X Redditino's timeline. After the crowd table in the reveal (and on Full results), your Head of PR reads the room:
   a one-line update, then posts from the crowds that loved or hated the show, each in that crowd's voice, and a "Next week"
   note that carries the crowd tip in his words. Tap the other booker's fan total and he reads their timeline instead.
   A show's posts are picked once and kept on its result (r.xr), so a replay shows the same timeline. Recently used posts
   (S.xrSeen) are skipped so the same line doesn't come back week after week.

   Writing posts: tokens are {A} and {B} (the first two names in the segment), {M} (the segment, e.g. "A vs B"),
   {ST} (its stars, e.g. 4¼), {OT} (the other booker) and {SH} (tonight's show). A post only runs when its tokens can be
   filled. Casual posts are lowercased whole. A post starting with ^ is shouted in caps. */
const XR_HANDLES={
 cas:['@MainEventOnly','@MondayNightMike','@just_here_4_ppvs','@sportsguy_dan','@ufc_and_wwe','@WatchedAsAKid','@TheBigMatchGuy','@tiktok_clips_only','@RKOfan_2011','@BigNamesOrBust'],
 tech:['@StarRatingStan','@ChainWrestlingEnjoyer','@JuniorsAt3am','@SellTheLeg','@CagematchReviewer','@psychology_matters','@WONsubscriber','@limbwork','@PuroToTheGrave'],
 blood:['@GusherGang','@ultraviolent_til_death','@LightTubesFTW','@hardway_or_nothing','@BloodAndGutsFan','@FuckThePGEra','@crimsonmask_','@deathmatchonly'],
 flip:['@DiveTrain','@absolute_cinema_','@SpotfestSZN','@630enjoyer','@clipitall','@noselling_idc','@luchafan4life','@AirborneOnly'],
 chaos:['@CrashTV1999','@RussoWasRight','@runin_enjoyer','@SwerveMeBro','@ParkingLotBrawl','@nodq_nightly','@BackstageBrawlFan','@HardcoreTitle24_7']};
/* v525: every fan post rewritten to read like real wrestling posts on X and Reddit: short, blunt reactions in the slang each
   crowd actually uses (casuals: big names, "we’re so back", "turned it off"; technical fans: star ratings, selling, run-in
   complaints; Bloodhounds: all-caps, profane, gushers and weapons; Flippy fans: dives, clips, "spotfest and proud";
   Chaos fiends: crash TV, run-ins, swerves). Every bank still says the reason it’s picked for: a casual "titles" post is about
   the belts, a technical "runin" post is about the run-in, an "ign" post names the kind of match they never got.
   Casuals who tuned out say why: hateS (no stars), hateQ (a weaker show than usual), hateF (no feud), hateT (no title match),
   hateX (no big match type). New lines go on the end of a bank so the recent-post memory (S.xrSeen, by bank position) stays right. */
const XR_POSTS={
cas:{
 love:["that was actually a good show ngl",
  "LETS GOOOOO what a night",
  "haven’t watched in years and that was sick",
  "ok i’m back. wrestling is good again",
  "only tuned in for the main event and stayed for the whole thing. that never happens",
  "the crowd was going crazy and so was i",
  "had this on at the bar and the whole place was watching",
  "why was nobody telling me wrestling was this good right now",
  "that ending had me out of my seat fr",
  "10/10 no notes",
  "saw clips on tiktok and had to go watch the whole thing. worth it",
  "best episode in a long time and it’s not close",
  "we are so back",
  "this is the stuff i watched as a kid. more of this",
  "every match felt big tonight. that’s how you do it",
  "didn’t look at my phone once until right now",
  "first time watching live in like 5 years. good choice",
  "whole group chat is talking about this one"],
 loveM:["{A} is HIM",
  "{A} vs {B} was a movie",
  "{A} vs {B} was a ppv match on free tv",
  "ok {A} is a star. push them to the moon",
  "didn’t know who {B} was before tonight. i do now",
  "{M} had the whole building rocking",
  "{A} vs {B} is why i watch",
  "{A} got the biggest pop of the night and it wasn’t close",
  "already rewatched {M} twice",
  "run back {A} vs {B} at the next ppv. i’ll be there",
  "{A} has that aura. you can’t teach that",
  "my buddy who hates wrestling watched {M} with me and asked when the next one is",
  "people are saying {ST} stars for {M}. no idea what that means but it rocked",
  "{A} winning was the right call. everybody wanted that"],
 stars:["big names all night. this is what i tune in for",
  "every match had someone i actually know. imagine that",
  "finally they put the stars on tv instead of saving them for ppvs",
  "stacked card. felt like a ppv for free",
  "put the top guys on and people watch. not complicated",
  "every name on the card was somebody. no randoms",
  "you could tell it was a big show just from the entrances",
  "the stars showed up tonight. that’s all i want"],
 titles:["title matches all night. that’s real stakes",
  "the belts actually mattered tonight and you could feel it",
  "when the gold’s on the line i’m locked in",
  "championship matches? say less",
  "nothing beats a title match main event",
  "make the belts mean something and people watch. simple",
  "they treated the titles like a big deal tonight. respect",
  "i only care who has the belt and tonight i cared a lot"],
 story:["didn’t follow any of this but you could tell they genuinely hate each other",
  "that feud has me hooked. i need the next part",
  "had to look up why they’re mad at each other. now i’m invested",
  "this storyline is actually good? didn’t expect that",
  "the beef felt real tonight. that’s what wrestling needs",
  "i’m here for the drama and they gave me drama",
  "when the story’s this good i don’t even care about the moves",
  "they built that one for weeks and it paid off. that’s how you do it"],
 spec:["cage match main event. instantly watching",
  "the gimmick match was the selling point and it delivered",
  "any time it’s a ladder match or a cage i’m tuning in",
  "the stipulation made it feel like an actual fight. loved it",
  "that stipulation made the whole thing feel like a ppv",
  "street fights and cages got me into wrestling. more please"],
 meh:["it was fine. had it on while doing other stuff",
  "decent show i guess. won’t remember it tomorrow",
  "half watched it. the half i watched was ok",
  "skipped to the main event. it was alright",
  "mid",
  "not bad not great. kinda forgettable",
  "had it on in the background. couldn’t tell you what happened",
  "it was a show. that’s about all i got",
  "felt like filler. waiting for the big one",
  "some good moments but i dozed off in the middle"],
 hate:["turned it off after 20 minutes",
  "this was so boring bro",
  "who is this show even for",
  "nobody i know watched this and now i see why",
  "fell asleep. not even joking",
  "changed it to the game. sorry",
  "yeah i’m not watching next week",
  "this product is dead lol"],
 hateS:["who are any of these people",
  "not one star on the card. why would i watch that",
  "random guys wrestling random guys. pass",
  "put the big names on tv. nobody’s tuning in for this",
  "don’t know half these people and i’m not gonna learn",
  "where were the stars? turned it on for nothing",
  "felt like the b team. watched 10 min and bailed",
  "no names, no reason to watch"],
 hateQ:["the big names were there and it still sucked somehow",
  "way worse than last week",
  "usually this show is good. not tonight",
  "they had the stars and wasted them",
  "how do you have that card and put on that",
  "big downgrade from last week"],
 hateF:["nobody has a reason to fight anybody. why should i care",
  "no feuds, no beef, no reason to watch",
  "just random matches with zero story. hard pass",
  "who’s mad at who? nobody? ok then"],
 hateT:["no title matches? then what was the point",
  "nothing on the line all night. boring",
  "no belts defended. felt like a house show",
  "if the titles aren’t on the line why am i watching"],
 hateX:["no cage, no ladders, no street fight. just regular matches all night",
  "needed a gimmick match or something. this was so plain",
  "every match was the same kind of match. snooze",
  "not one big match. nothing to make it feel special"],
 sw:["switched to {OT}. wasn’t much better",
  "flipped over to {OT} at the first commercial",
  "ended up watching {OT} instead"],
 swS:["{OT} had the big names so i went there",
  "went to {OT}. at least i know who those guys are",
  "{OT} had the stars tonight. easy choice",
  "switched to {OT} for the names. sorry not sorry"],
 swT:["{OT} had a title match so i was over there",
  "went where the belts were. {OT} tonight",
  "{OT} put a title on the line. that’s where i was"],
 swF:["{OT} had {OM} and that feud is actually good",
  "watching {OT} for {OM}. that beef is real",
  "{OT} has the better story going with {OM} rn"],
 swX:["{OT} had a gimmick match. obviously i watched that",
  "{OT} had a stipulation match. that’s where i went",
  "switched to {OT} for the big match. felt like a ppv"],
 swQ:["{OT} was just the better show tonight",
  "{OT} cooked tonight. sorry",
  "had both on. {OT} won"],
 swin:["came over from {OT}. this was better",
  "{OT} lost me. this one’s alright",
  "flipped over from {OT} and stayed"],
 swinS:["{OT} had nobody i’ve heard of so i switched to this",
  "left {OT}, no stars over there tonight",
  "{OT} card was a bunch of randoms. came here"],
 swinQ:["{OT} was so bad i changed the channel. this was way better",
  "{OT} was a snoozefest. switched and didn’t go back"],
 swinF:["nothing going on story-wise on {OT}. this had beef",
  "{OT} had no feuds worth caring about. came here"],
 swinT:["{OT} didn’t defend a single belt. came here",
  "no titles on {OT} tonight so i switched"],
 swinX:["{OT} was all regular matches. came here for the big one",
  "nothing special on {OT}. this had a gimmick match"]},
tech:{
 love:["Wrestling show of the year contender, and I don’t throw that around.",
  "Clean finishes, real selling, matches given time. Whoever booked this, keep doing it.",
  "Every match told a story and nobody no-sold anything. That’s all I ask.",
  "That card was built for people who actually like wrestling. Rare W.",
  "Limb work that mattered all the way to the finish. Psychology isn’t dead.",
  "Hell of a show. The workrate crowd is eating tonight.",
  "Let the boys work and this is what you get. Every match ****+ for me.",
  "No overbooking, no ref bumps, no nonsense. Just wrestling.",
  "Best in-ring TV in a long time. Nobody talk about ratings for one night.",
  "Pacing on that card was perfect. Not one match overstayed.",
  "Cagematch is going to be very kind to this show.",
  "If you didn’t like that show you just don’t like wrestling. Sorry.",
  "Every finish was earned. Every near fall meant something.",
  "Rewatched it already. Holds up even better the second time."],
 loveM:["{M}. {ST} from me. Go watch it.",
  "{A} vs {B} was a clinic. Sold the leg the whole way through.",
  "{M} is going on my MOTY list. Not a debate.",
  "{A} and {B} have absurd chemistry. Run it back at a PPV with 30 minutes.",
  "{ST} for {M} and I might be low on it.",
  "The way {A} worked over {B} in {M}. Textbook.",
  "{M} was the best TV match of the year. I said what I said.",
  "{A} is the best pure wrestler on the roster and {M} proved it.",
  "Every transition in {M} made sense. That’s rarer than it should be.",
  "Meltzer’s going to go high on {M} and for once I won’t argue.",
  "{A} vs {B} reminded me why I used to stay up for Junior tournaments at 3am.",
  "{M} had zero wasted motion. Every hold set up the next one.",
  "{B} made {A} look like a million bucks in {M}. Selling is an art."],
 meh:["One good match and a lot of filler.",
  "The in-ring was fine. Fine isn’t what I tune in for.",
  "Nobody got time to actually wrestle. Everything felt rushed.",
  "Too many short matches. Give two workers 20 minutes and let them cook.",
  "Solid enough. Nothing I’d go back to.",
  "There was a good match in there somewhere, buried under the promos.",
  "Decent show, but give the workers some time.",
  "*** show. Watchable. Forgettable."],
 mehM:["{M} was building to something good and then went home way too early.",
  "{M} was {ST} for me. Good, not great. Needed another 10.",
  "{A} worked the arm the whole match and then {B} just stopped selling it. Why.",
  "{M} had a great opening stretch and fell apart in the finishing run.",
  "{A} vs {B} was solid. Felt like they were saving it for a bigger match.",
  "{M} had way too much finisher spam in the last five minutes.",
  "{M} was fine. The kickouts got silly at the end."],
 hate:["Worst in-ring show in months.",
  "Nothing on that card was worth the time. Bad wrestling show.",
  "Sloppy, rushed and overbooked. Rough one.",
  "Every match looked like it was laid out in the back five minutes before bell time."],
 hateM:["{M} getting {ST} is a joke. Sloppy start to finish.",
  "{A} vs {B} had zero psychology. Just moves until somebody stayed down.",
  "{M} was a botchfest. Hard to watch.",
  "{A} and {B} have no chemistry. Stop booking this.",
  "{M} was a spotfest with no selling. Not for me.",
  "{A} no-sold everything {B} did. What was the point.",
  "{M} at {ST}? Who’s handing these out.",
  "{A} vs {B} looked great on paper. On TV it was a mess."],
 ign:["Nothing for actual wrestling fans tonight. Again.",
  "Not one real technical match on the card. Back to my New Japan backlog.",
  "Brawls, dives and promos. Where’s the wrestling.",
  "Three hours and not one match I’d recommend to a wrestling fan.",
  "Book two real workers against each other. It’s not that hard.",
  "No chain wrestling, no mat work, no reason for me to watch.",
  "This show is booked for casuals and it shows.",
  "Didn’t see a single hold all night that wasn’t a rest hold."],
 runin:["Run-in finish. Of course.",
  "Great match ruined by interference. Every single time.",
  "15 great minutes and then somebody runs in. Why do they do this.",
  "The run-in killed that match. Just let someone win.",
  "Ref bump into a run-in. Overbooked garbage.",
  "Can we go one week without a run-in deciding a match.",
  "Interference finish on a match that didn’t need it. Classic."],
 screw:["Feet on the ropes finish. Cheap.",
  "Low blow behind the ref’s back to end a great match. Come on.",
  "Dusty finish. They’re really doing this.",
  "Screwy finish on the best match of the night. Infuriating.",
  "DQ finish. Tell me you don’t trust your workers without telling me.",
  "Cheap finish. That match deserved a clean result."],
 sw:["{OT} had the better wrestling tonight. Watched that.",
  "Switched to {OT}. At least they let people work.",
  "Ended up on {OT}. Better in-ring, not close."],
 swM:["{OT} had {OM}. Obviously I watched that.",
  "{OM} on {OT} was the best match on TV tonight. Sorry.",
  "Went to {OT} for {OM}. Easy call."],
 swin:["Came over from {OT}. Their in-ring tonight was rough.",
  "Left {OT} halfway through. Sloppy show over there."],
 swinI:["{OT} had zero real wrestling tonight. Came here.",
  "Nothing technical on {OT} at all. Switched."],
 swinM:["Left {OT} for {M}. Right call.",
  "{OT} wasn’t doing it for me. Came over for {M} and it delivered."]},
blood:{
 love:["^HOLY SHIT THEY BUSTED HIM OPEN",
  "^GUSHER. FUCKING GUSHER",
  "^BLOOD ALL OVER THE MAT. BEST SHOW OF THE YEAR",
  "^THE RING LOOKED LIKE A CRIME SCENE. MORE",
  "^THAT WAS FUCKING VIOLENT. HELL YEAH",
  "^THEY BLED. WE CHEERED. THATS WRESTLING",
  "^FINALLY SOME FUCKING VIOLENCE ON TV",
  "^CHAIRS. BLOOD. THUMBTACKS. FUCK YES",
  "^BLOOD ON THE CAMERA LENS. 10/10",
  "^NOBODY WALKED OUT OF THERE CLEAN. PERFECT SHOW",
  "^FUCK THE PG ERA. THIS RULED",
  "^COLOR ALL NIGHT. KEEP IT COMING"],
 loveM:["^{A} BUSTED {B} WIDE OPEN. HOLY SHIT",
  "^{A} WAS WEARING A CRIMSON MASK BY THE END. LEGEND",
  "^{M} WAS A FUCKING BLOODBATH",
  "^{B} BLED BUCKETS. RESPECT",
  "^{A} TOOK A CHAIR TO THE HEAD AND KEPT COMING. ANIMAL",
  "^{M}. BLOOD EVERYWHERE. MATCH OF THE YEAR",
  "^{A} TRIED TO KILL {B}. LOVED EVERY SECOND",
  "^{A} GOT OPENED UP HARDWAY. THAT SHIT WAS REAL",
  "^{M} TURNED THE MAT RED. MORE OF THAT",
  "^{A} AND {B} BEAT THE SHIT OUT OF EACH OTHER. PERFECT",
  "^{B} GOT CARRIED OUT. THATS HOW YOU LOSE",
  "^{ST} FOR {M}?? SHOULD BE MORE. THERE WAS BLOOD"],
 meh:["^ONE LITTLE TRICKLE. THATS IT??",
  "^NEEDED MORE BLOOD. WAY MORE",
  "^SOME CHAIR SHOTS BUT NOBODY BLED. WEAK",
  "^ALMOST GOOD. BUST SOMEBODY OPEN NEXT TIME",
  "^TOO MUCH WRESTLING NOT ENOUGH FIGHTING",
  "^OK SHOW. NOT ENOUGH VIOLENCE",
  "^WANTED A BLOODBATH AND GOT A PAPER CUT"],
 mehM:["^{M} SHOULD HAVE BEEN A BLOODBATH. GOT A TRICKLE",
  "^{A} BARELY BLED. CUT DEEPER",
  "^{M} WAS OK. SOMEBODY SHOULDA GONE THROUGH A TABLE",
  "^{A} VS {B} NEEDED WEAPONS. WHERE WERE THE WEAPONS",
  "^{M} HAD A LITTLE COLOR. NOT ENOUGH",
  "^{A} HAD {B} BLEEDING AND THEN THEY JUST WRESTLED?? KEEP HITTING HIM",
  "^{M}. {ST}. NOT ENOUGH BLOOD"],
 hate:["^SOFT ASS SHOW",
  "^NOBODY BLED. NOBODY. WHAT THE FUCK",
  "^THIS WAS A KIDS SHOW. FUCK THIS",
  "^SO FUCKING SOFT. IM DONE"],
 hateM:["^{M} AND NOBODY BLED. FUCKING EMBARRASSING",
  "^{A} VS {B} WAS SOFT AS SHIT",
  "^{M} WAS SUPPOSED TO BE VIOLENT. IT WASNT",
  "^{A} HITS LIKE THEYRE SCARED TO HURT SOMEBODY. HURT SOMEBODY",
  "^{M}. NO BLOOD. NO WEAPONS. NO POINT",
  "^THEY BUILT {A} VS {B} FOR WEEKS AND NOBODY EVEN GOT CUT",
  "^{A} AND {B} WRESTLED LIKE THEY WERE AFRAID TO GET HURT. GET HURT"],
 ign:["^NO BLOOD ALL NIGHT. FUCK OFF",
  "^NOT ONE WEAPON ON THE WHOLE SHOW",
  "^WHERES THE VIOLENCE. WHERES THE FUCKING VIOLENCE",
  "^NO STREET FIGHT NO CAGE NO BLOOD. WHY DID I WATCH",
  "^EVERY MATCH WAS A WRESTLING MATCH. I DONT WANT WRESTLING MATCHES",
  "^PUT SOMEBODY THROUGH A TABLE. ANYBODY",
  "^NO HARDCORE MATCH. NOT ONE. FUCK THIS SHOW",
  "^THE CHAIRS STAYED FOLDED ALL NIGHT. BULLSHIT",
  "^BOOK A FUCKING DEATHMATCH",
  "^CLEAN FACES ALL NIGHT. DISGUSTING"],
 sw:["^WENT TO {OT}. AT LEAST THEY HIT EACH OTHER WITH SHIT",
  "^SWITCHED TO {OT}. MORE BLOOD OVER THERE",
  "^{OT} HAD THE VIOLENCE TONIGHT. SO I WAS THERE"],
 swM:["^{OT} HAD {OM}. THAT SHIT WAS VIOLENT",
  "^WATCHED {OM} ON {OT}. SOMEBODY BLED. THATS ALL I NEED",
  "^{OM} ON {OT} WAS A FUCKING FIGHT. WENT THERE"],
 swin:["^LEFT {OT}. TOO SOFT OVER THERE",
  "^{OT} WAS SOFT. CAME HERE FOR BLOOD"],
 swinI:["^{OT} HAD ZERO VIOLENCE. ZERO. IM HERE NOW",
  "^NOT ONE WEAPON ON {OT}. FUCK THAT. SWITCHED"],
 swinM:["^LEFT {OT} FOR {M}. FUCK YEAH",
  "^CAME FROM {OT} FOR {M}. WORTH IT"]},
flip:{
 love:["^THE DIVES TONIGHT WERE INSANE",
  "absolute cinema. every match had something i’ve never seen before",
  "people can cry about selling all they want, that show was ELECTRIC",
  "^HOLY SHIT HOLY SHIT HOLY SHIT",
  "the highspots tonight had me standing on my couch",
  "spotfest? yeah. and it ruled. cope",
  "every time someone went up top the whole building stood up",
  "the dive train tonight was unreal",
  "that show was one long highlight reel. clips are already everywhere",
  "nobody stayed on the ground and that’s how it should be",
  "^CLIP EVERY MATCH. ALL OF IT",
  "best night for the high flyers in forever",
  "if you didn’t like that you hate fun. simple as",
  "crowd was popping for every single spot. electric"],
 loveM:["{A} hit a dive to the floor i’m still thinking about",
  "^{A} IS NOT HUMAN",
  "{M} was the most athletic thing i’ve seen on tv all year",
  "{A} vs {B} was a spotfest and i loved every second",
  "the springboard {A} hit in {M}??? rewind it",
  "{A} and {B} were flying all over the place. clip it all",
  "{M} at {ST} is disrespectful. that’s higher",
  "{A} went off the top to the floor and the building lost it",
  "the near falls in {M} were ridiculous. couldn’t breathe",
  "{A} vs {B} had more highspots than most ppvs",
  "{A} is the most exciting wrestler on the roster and it’s not close",
  "{M} had everyone on their feet the whole last 5 minutes"],
 meh:["one dive all night. one",
  "decent show but way too grounded. let people fly",
  "some cool moments but nothing that had me jumping",
  "kinda slow tonight. needed a ladder match or a scramble",
  "fine i guess. nothing clip worthy",
  "too many headlocks, not enough highspots",
  "show was ok. barely anyone left their feet"],
 mehM:["{M} had like one good dive and that’s it",
  "{A} vs {B} was building to something then just ended",
  "{A} can fly and they kept them on the mat. why",
  "{M} needed a big spot to finish. didn’t get one",
  "{M} was fine. {A} didn’t get to do their stuff",
  "{A} vs {B} was too slow. let them go"],
 hate:["boring. nobody flew. nobody did anything",
  "one rest hold after another. turned it off",
  "zero excitement. this show felt like homework",
  "worst show for actual athletes in a long time"],
 hateM:["{A} vs {B} and nobody left the ground. what a waste",
  "{M} was so slow. so slow",
  "{A} is one of the best flyers on the roster and got stuck in a headlock match",
  "{M} had the energy of a nap",
  "{A} vs {B} botched the one big spot they tried. rough",
  "{M} was 15 minutes of chinlocks. no"],
 ign:["zero dives. zero",
  "nobody went to the top rope all night. not once",
  "where are the high flyers?? did they get fired",
  "no ladder match, no scramble, no multi-man. nothing for us",
  "every match was two guys trading forearms. snooze",
  "not a single clip worth posting from this whole show",
  "the cruiserweights must have had the night off",
  "book a multi-man scramble. please. i’m begging",
  "nothing exciting happened in the ring all night",
  "grounded, slow and boring. not my show"],
 sw:["switched to {OT}. at least people were flying over there",
  "{OT} had the better spots tonight. watched that",
  "flipped to {OT} halfway through. way more exciting"],
 swM:["{OT} had {OM}. obviously i’m watching that",
  "watched {OM} on {OT} instead. the dives were nuts",
  "{OM} on {OT} was the most fun match on tv tonight"],
 swin:["came from {OT}. nobody flew over there",
  "left {OT}. way too slow"],
 swinI:["{OT} was all mat wrestling. switched over",
  "nobody left the ground on {OT}. came here"],
 swinM:["left {OT} for {M}. right call",
  "{OT} was dead so i put on {M}. so good"]},
chaos:{
 love:["^THAT WAS PURE CHAOS AND I LOVED IT",
  "run-ins, swerves, brawls into the crowd. this is crash tv baby",
  "felt like 1999 Raw. no notes",
  "nobody knew what was coming next. THAT’S wrestling",
  "the whole show went off the rails and it was perfect",
  "^ANYTHING CAN HAPPEN AND IT DID",
  "parking lot brawl, run-in, ref bump. we’re so back",
  "my timeline is losing its mind. good",
  "the purists hate this show. that’s how you know it’s good",
  "Russo would be proud of tonight and i mean that as a compliment",
  "every segment ended in a brawl. as it should",
  "most fun i’ve had watching wrestling in years",
  "attitude era energy all night",
  "the swerve at the end had me screaming"],
 loveM:["^{A} RUNNING IN DURING {M}. LOST MY MIND",
  "{A} vs {B} turned into a full brawl and the refs couldn’t stop it. perfect",
  "{M} ended in total chaos. exactly what i wanted",
  "{A} and {B} fought through the whole building. AMAZING",
  "nobody saw what happened in {M} coming. great tv",
  "{M} had a ref bump, a run-in and a chair. 10/10",
  "{A} is the most unpredictable person on the roster and {M} proved it",
  "^{A} VS {B} WAS ANARCHY",
  "{M} was a car crash in the best way",
  "{A} vs {B} broke down into a brawl and i was here for every second",
  "{ST} stars for {M}? who cares. it was CHAOS"],
 meh:["fine show but way too predictable",
  "needed a run-in. a swerve. something",
  "everything went exactly how i thought it would. boring",
  "solid but nobody got jumped. what are we doing",
  "where was the chaos? one brawl isn’t enough",
  "too clean. too safe. too normal",
  "decent show but nothing went off the rails"],
 mehM:["{M} was fine but it needed someone to run in",
  "{A} vs {B} was too clean. mess it up",
  "{M} ended exactly how everyone expected",
  "{A} and {B} should’ve brawled into the crowd. they didn’t",
  "{M} had one ref bump. ONE. go bigger",
  "{A} vs {B} needed a swerve at the end"],
 hate:["^BORING. NOTHING HAPPENED",
  "most predictable show i’ve ever watched",
  "every match ended clean. who asked for this",
  "this show was so safe it was painful"],
 hateM:["{M} was so by-the-numbers it hurt",
  "{A} vs {B} ended with a clean pin. lame",
  "{M} had zero surprises. zero",
  "{A} and {B} just wrestled. that’s it. boring",
  "nobody interfered in {M}. why even book it",
  "{M} was predictable from bell to bell"],
 ign:["no run-ins, no brawls, no swerves. dead show",
  "clean finishes all night. kill me",
  "not one segment went off the rails",
  "booked like a sports show. i don’t want a sports show",
  "nobody got jumped backstage all night. weird",
  "every match ended exactly how it was supposed to. where’s the chaos",
  "no hardcore, no no-DQ, nothing. what are we doing",
  "too clean. give me a swerve. give me anything"],
 sw:["switched to {OT}. stuff actually went wrong over there",
  "{OT} had the chaos tonight. went there",
  "flipped to {OT}. way more unhinged"],
 swM:["{OT} had {OM}. that was the mess i wanted",
  "watched {OM} on {OT}. pure chaos",
  "{OM} on {OT} went completely off the rails. had to"],
 swin:["left {OT}. too clean over there",
  "{OT} was so predictable. came here"],
 swinI:["nothing happened on {OT}. nothing. switched",
  "{OT} was all clean finishes. came here for chaos"],
 swinM:["left {OT} for {M}. chaos over here. good",
  "came over from {OT} for {M}. worth it"]}};
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
