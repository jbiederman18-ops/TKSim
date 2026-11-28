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
 love:["that was sick. no idea what was going on but it was sick",
  "LETS GOOOOO. who won",
  "haven’t watched since i was 12 and they still got it. is the rock still on this",
  "ok i’m back. is this the wwe one or the other one",
  "only turned it on for the main event. stayed for the whole thing. didn’t understand most of it",
  "the crowd was screaming so i screamed. great show",
  "had this on at the bar. nobody knew who anybody was but we were all yelling",
  "wait wrestling is good right now?? since when",
  "that ending had me out of my seat. what happened tho",
  "10/10 would watch the guys hit each other again",
  "saw a clip on tiktok so i watched the whole thing. still don’t know the guy from the clip’s name",
  "best episode in a long time. i think. i haven’t seen the other ones",
  "we are so back. wherever we were",
  "this is the stuff i watched as a kid. or close enough",
  "every match felt big. i couldn’t tell you why but it did",
  "didn’t look at my phone once. ok twice",
  "first time watching live in like 5 years. they changed the logo or something",
  "whole group chat is talking about this. i’m just saying what they said"],
 loveM:["{A} is HIM. whoever that is",
  "{A} vs {B} was a movie. i’d watch the movie",
  "{A} vs {B} was a ppv match for free. wait was it free",
  "ok {A} is a star. i’m buying the shirt",
  "didn’t know who {B} was before tonight. still kinda don’t but they were good",
  "{M} had the whole building rocking. i think. it was loud",
  "{A} vs {B} is why i watch. sometimes",
  "{A} got the biggest pop of the night. pop means cheer right",
  "already rewatched {M} twice. still don’t know who won",
  "run back {A} vs {B}. i’ll actually watch that one",
  "{A} has that aura. i don’t know what aura is but they have it",
  "my buddy who hates wrestling watched {M} with me. he still hates it but he watched",
  "people are saying {ST} stars for {M}. out of what. 10?",
  "{A} winning was the right call. i assume {A} won"],
 stars:["big names all night. the ones from the commercials",
  "every match had someone i’d actually heard of. that’s all i need",
  "finally they put the famous ones on. why don’t they always do that",
  "stacked card. felt like a ppv. or whatever they call it now",
  "put the guys i know on tv and i’ll watch. not hard",
  "every name on the card was somebody. i googled two of them but still",
  "you could tell it was a big show cause the entrances had fire",
  "the stars showed up. the guys from the video game"],
 titles:["title matches all night. big gold belts. that’s the whole point right",
  "the belts actually mattered tonight. i think there’s like 9 of them now",
  "when the gold’s on the line i’m locked in. which belt was it again",
  "championship matches? say less",
  "nothing beats a title match main event. what belt was that",
  "make the belts mean something and i’ll watch. simple",
  "they treated the titles like a big deal tonight. is that the heavyweight one",
  "i only care who has the belt. tonight i cared a lot. still don’t know who has it"],
 story:["didn’t follow any of this but those two REALLY hate each other",
  "that feud has me hooked. what are they fighting about tho",
  "had to look up why they’re mad at each other. still not sure. invested anyway",
  "this storyline is actually good? is it real",
  "the beef felt so real. is it real? like for real",
  "i’m here for the drama and they gave me drama",
  "when the story’s this good i don’t care about the moves. i don’t know the moves anyway",
  "they built that one for weeks and it paid off. i only saw this week but i could tell"],
 spec:["CAGE MATCH. i don’t need to know anything else",
  "the gimmick match was the selling point. gimmick means the cage right",
  "any time it’s a ladder match i’m watching. who climbs it",
  "the stipulation made it feel like an actual fight. whatever a stipulation is",
  "that match had extra rules and i loved it",
  "street fights and cages got me into wrestling. that’s basically all i watch"],
 meh:["it was fine. had it on while doing other stuff",
  "decent show i guess. won’t remember it tomorrow",
  "half watched it. the half i watched was ok",
  "skipped to the main event. who was in it again",
  "mid",
  "not bad not great. who was the guy in the blue",
  "had it on in the background. couldn’t tell you what happened",
  "it was a show. that’s all i got",
  "felt like filler. when’s the big one",
  "dozed off in the middle. was there a middle"],
 hate:["turned it off after 20 minutes",
  "this was so boring bro",
  "who is this show even for. not me",
  "nobody i know watched this and now i see why",
  "fell asleep. not even joking",
  "changed it to the game",
  "yeah i’m not watching next week. or whenever it’s on",
  "this product is dead lol. i think. i don’t really watch"],
 hateS:["who are any of these people",
  "not one guy i’ve heard of. are the famous ones hurt",
  "random guys wrestling random guys. pass",
  "put the big names on. the ones from the movies",
  "don’t know half these people and i’m not gonna learn",
  "where were the stars? turned it on for nothing",
  "felt like the b team. is this the minor leagues",
  "no names, no reason to watch"],
 hateQ:["the famous guys were there and it still sucked. how",
  "way worse than last week. i think i watched last week",
  "usually this show is good. not tonight",
  "they had the big names and wasted them",
  "how do you have the famous ones and put on that",
  "big downgrade. from what i remember"],
 hateF:["nobody’s mad at anybody. why are they even fighting",
  "no beef. no reason to watch",
  "just random matches. who’s supposed to be the bad guy",
  "who’s mad at who? nobody? ok then"],
 hateT:["no belts tonight? then what was the point",
  "nothing on the line. not even one belt",
  "no title matches. felt like practice",
  "if nobody’s winning a belt why am i watching"],
 hateX:["no cage, no ladders, no tables. just regular wrestling. boring",
  "needed a cage or something. this was so plain",
  "every match was the same kind of match. snooze",
  "not one big match. i wanted a cage"],
 sw:["switched to {OT}. wasn’t much better",
  "flipped over to {OT} at the first commercial and forgot to come back",
  "ended up watching {OT} instead. same thing right"],
 swS:["{OT} had the guys i know so i went there",
  "went to {OT}. at least i’ve heard of those guys",
  "{OT} had the famous ones tonight. easy choice",
  "switched to {OT} for the names. sorry"],
 swT:["{OT} had a belt match so i was over there",
  "went where the belts were. {OT} tonight",
  "{OT} had a title on the line. that’s where i was"],
 swF:["{OT} had {OM} and those two HATE each other",
  "watching {OT} for {OM}. that beef looks real. is it real",
  "{OT} has the better drama with {OM} rn"],
 swX:["{OT} had a cage or something. obviously i watched that",
  "{OT} had a match with extra rules. that’s where i went",
  "switched to {OT} for the big special match"],
 swQ:["{OT} was just better tonight",
  "{OT} cooked tonight. sorry",
  "had both on. {OT} won. i think"],
 swin:["came over from {OT}. this was better",
  "{OT} lost me. this one’s alright",
  "flipped over from {OT} and stayed. is this the same company"],
 swinS:["{OT} had nobody i’ve heard of so i switched to this",
  "left {OT}. no famous guys over there",
  "{OT} was a bunch of randoms. came here"],
 swinQ:["{OT} was so bad i changed the channel. this was way better",
  "{OT} was a snoozefest. switched and didn’t go back"],
 swinF:["nobody was mad at anybody on {OT}. this had beef",
  "{OT} had no drama. came here for drama"],
 swinT:["{OT} didn’t have a single belt match. came here",
  "no belts on {OT} tonight so i switched"],
 swinX:["{OT} was all regular matches. came here for the cage or whatever",
  "nothing special on {OT}. this had a special match"]},
tech:{
 love:["Show of the year contender. Most of you won’t appreciate it, and that’s fine.",
  "Clean finishes, real selling, matches given time. Finally, a show booked for people who understand wrestling.",
  "Every match told a story and nobody no-sold anything. Is that really so much to ask? Apparently once a year.",
  "That card was built for actual wrestling fans. The ’too slow’ crowd can log off.",
  "Limb work that paid off in the finish. If you don’t know why that matters, I can’t help you.",
  "Let the workers work and this is what you get. Every match ****+ for me. Not that the star chasers would notice.",
  "No overbooking, no ref bumps, no nonsense. Just wrestling, the way it’s meant to be done.",
  "Best in-ring TV in a long time. Respectfully, if you were bored, the problem is you.",
  "Pacing on that card was perfect. A lesson in restraint most bookers will never learn.",
  "Cagematch is going to be very kind to this show. Deservedly.",
  "If you didn’t like that show, you don’t like wrestling. You like fireworks.",
  "Every finish was earned. Every near fall meant something. Take notes, everyone else.",
  "Rewatched it already. Holds up even better once you know what to look for. Most people don’t.",
  "Rare show where I didn’t have to explain to anyone why it was good. Almost rare enough to worry me."],
 loveM:["{M}. {ST} from me. If you only watched the finish, go back and watch the first ten minutes.",
  "{A} vs {B} was a clinic. Sold the leg the whole way through. Learn what selling is.",
  "{M} is going on my MOTY list. If it’s not on yours, I’d question the list.",
  "{A} and {B} have absurd chemistry. Give it 30 minutes at a PPV and the casuals might even notice.",
  "{ST} for {M} and frankly that’s conservative.",
  "The way {A} worked over {B} in {M}. Textbook. Not that most of this fanbase reads.",
  "{M} was the best TV match of the year. I don’t need anyone to agree.",
  "{A} is the best pure wrestler on the roster and {M} proved it to anyone paying attention.",
  "Every transition in {M} made sense. Watch it again and actually pay attention this time.",
  "Meltzer’s going to go high on {M}, and for once he’ll be right.",
  "{A} vs {B} is the kind of match I used to stay up for at 3am. You wouldn’t understand.",
  "{M} had zero wasted motion. Every hold set up the next one. That’s called psychology.",
  "{B} made {A} look like a million bucks in {M}. Selling is an art, not that you’d know."],
 meh:["One good match and a lot of filler for the casuals.",
  "The in-ring was fine. Fine isn’t what I watch for.",
  "Nobody got time to actually wrestle. I guess attention spans are what they are.",
  "Too many short matches. Give two real workers 20 minutes. I’ll wait.",
  "Serviceable. Nothing I’d recommend to anyone with taste.",
  "There was a good match in there somewhere, buried under promos for people who can’t sit through a headlock.",
  "Decent show for the masses. I expect more.",
  "*** show. Watchable, if you’re not particular. I am."],
 mehM:["{M} was building to something good and then went home early. Of course.",
  "{M} was {ST} for me. Good, not great. Another 10 minutes and it might have been worth discussing.",
  "{A} worked the arm the whole match and then {B} forgot about it. Unforgivable at this level.",
  "{M} had a great opening stretch and then remembered the crowd wanted fireworks.",
  "{A} vs {B} was solid. They’re capable of far better and they know it.",
  "{M} had way too much finisher spam at the end. Pandering.",
  "{M} was fine until the kickouts got silly. Restraint is a skill."],
 hate:["Worst in-ring show in months. I watched all of it so you didn’t have to.",
  "Nothing on that card was worth the time. Bad wrestling, booked for people who don’t watch wrestling.",
  "Sloppy, rushed and overbooked. Embarrassing, frankly.",
  "Every match looked laid out in the back five minutes before bell time. And people defend this."],
 hateM:["{M} getting {ST} is a joke. Some of you will rate anything.",
  "{A} vs {B} had zero psychology. Just moves until somebody stayed down. The marks will love it.",
  "{M} was a botchfest. I’m genuinely embarrassed for everyone involved.",
  "{A} and {B} have no chemistry. Anyone with eyes can see it.",
  "{M} was a spotfest with no selling. Enjoy it if you must. I won’t.",
  "{A} no-sold everything {B} did. That isn’t wrestling. That’s choreography.",
  "{M} at {ST}? Who’s handing these out, and have they watched wrestling before?",
  "{A} vs {B} looked great on paper. On TV it was amateur hour."],
 ign:["Nothing for actual wrestling fans tonight. Again. The rest of you enjoy your pyro.",
  "Not one real technical match on the card. Back to my New Japan backlog, where wrestling still exists.",
  "Brawls, dives and promos. Where’s the wrestling? Asking for the only people who care.",
  "Three hours and not one match I’d recommend to anyone with standards.",
  "Book two real workers against each other. It’s not complicated. Well, apparently it is.",
  "No chain wrestling, no mat work, no reason for anyone discerning to watch.",
  "Booked for casuals, top to bottom. Hope they enjoyed it.",
  "Didn’t see a single hold all night that wasn’t a rest hold. Remarkable, in the worst way."],
 runin:["Run-in finish. Of course. Can’t trust the audience to care about a clean result.",
  "Great match ruined by interference. Every single time. It’s insulting.",
  "15 great minutes and then somebody runs in. This is why nobody takes this seriously.",
  "The run-in killed that match. Let someone win like an adult.",
  "Ref bump into a run-in. Overbooked garbage for people who think that’s a story.",
  "Can we go one week without a run-in deciding a match? Rhetorical. I know the answer.",
  "Interference finish on a match that didn’t need it. Booked by someone who’s never watched a good match."],
 screw:["Feet on the ropes finish. Cheap, and beneath both of them.",
  "Low blow behind the ref’s back to end a great match. Spare me.",
  "Dusty finish. In this year. I can’t believe I have to type that.",
  "Screwy finish on the best match of the night. Typical.",
  "DQ finish. Tell me you don’t trust your workers without telling me.",
  "That match earned a clean finish and got cheap heat instead. Disappointing, if predictable."],
 sw:["{OT} had the better wrestling tonight. Obviously I watched that.",
  "Switched to {OT}. At least someone over there respects the craft.",
  "Ended up on {OT}. Better in-ring. Not close, not that most people could tell."],
 swM:["{OT} had {OM}. Anyone with taste was watching that.",
  "{OM} on {OT} was the best match on TV tonight. That’s not a debate.",
  "Went to {OT} for {OM}. The obvious choice for anyone who knows wrestling."],
 swin:["Came over from {OT}. Their in-ring tonight was an embarrassment.",
  "Left {OT} halfway through. I have standards."],
 swinI:["{OT} had zero real wrestling tonight. I came here out of necessity, not hope.",
  "Nothing technical on {OT} at all. Switched before I lost any more brain cells."],
 swinM:["Left {OT} for {M}. The correct decision, naturally.",
  "{OT} was beneath me tonight. Came over for {M} and it delivered."]},
blood:{
 love:["^HOLY FUCKING SHIT THEY SPLIT HIS HEAD OPEN",
  "^GUSHER. FUCKING GUSHER. RUN IT BACK",
  "^BLOOD ALL OVER THE FUCKING MAT. BEST SHOW OF THE YEAR",
  "^THE RING LOOKED LIKE A FUCKING SLAUGHTERHOUSE. MORE",
  "^THAT WAS SICK AS FUCK. I WANT TO SEE SKULL NEXT TIME",
  "^THEY BLED. WE CHEERED. THATS FUCKING WRESTLING",
  "^FINALLY SOME REAL FUCKING VIOLENCE ON TV",
  "^CHAIRS. BLOOD. THUMBTACKS. GLASS. FUCK YES",
  "^BLOOD ON THE CAMERA LENS. FUCKING BEAUTIFUL",
  "^NOBODY WALKED OUT OF THERE CLEAN. FUCKING PERFECT",
  "^FUCK THE PG ERA. FUCK IT. THIS RULED",
  "^COLOR ALL NIGHT. I WANT THEM DRAINED. KEEP IT COMING"],
 loveM:["^{A} BUSTED {B} WIDE THE FUCK OPEN. HOLY SHIT",
  "^{A} WAS WEARING A FUCKING CRIMSON MASK. LEGEND SHIT",
  "^{M} WAS A FUCKING BLOODBATH. KILL EACH OTHER AGAIN",
  "^{B} BLED BUCKETS. FUCKING WARRIOR",
  "^{A} TOOK A CHAIR TO THE SKULL AND KEPT COMING. FUCKING ANIMAL",
  "^{M}. BLOOD FUCKING EVERYWHERE. MATCH OF THE YEAR",
  "^{A} TRIED TO MURDER {B}. LOVED EVERY FUCKING SECOND",
  "^{A} GOT OPENED UP HARDWAY. THAT SHIT WAS REAL AND I WANT MORE",
  "^{M} TURNED THE MAT RED. PAINT IT AGAIN",
  "^{A} AND {B} BEAT THE SHIT OUT OF EACH OTHER. FUCKING PERFECT",
  "^{B} GOT CARRIED OUT ON A STRETCHER. FUCK YEAH",
  "^{ST} FOR {M}?? FUCK STARS. THERE WAS BLOOD. INFINITY STARS"],
 meh:["^ONE LITTLE FUCKING TRICKLE. THATS IT??",
  "^NEEDED WAY MORE BLOOD. WAY FUCKING MORE",
  "^SOME CHAIR SHOTS BUT NOBODY BLED. WEAK SHIT",
  "^ALMOST GOOD. SPLIT SOMEBODY OPEN NEXT TIME",
  "^TOO MUCH WRESTLING NOT ENOUGH FUCKING FIGHTING",
  "^OK SHOW. NOT ENOUGH VIOLENCE. NEVER ENOUGH",
  "^WANTED A BLOODBATH AND GOT A FUCKING PAPER CUT"],
 mehM:["^{M} SHOULD HAVE BEEN A BLOODBATH. GOT A FUCKING TRICKLE",
  "^{A} BARELY BLED. CUT DEEPER. I WANT TO SEE BONE",
  "^{M} WAS OK. SOMEBODY SHOULDA GONE THROUGH A FUCKING TABLE",
  "^{A} VS {B} NEEDED WEAPONS. WHERE THE FUCK WERE THE WEAPONS",
  "^{M} HAD A LITTLE COLOR. NOT FUCKING ENOUGH",
  "^{A} HAD {B} BLEEDING AND THEN THEY JUST WRESTLED?? KEEP FUCKING HITTING HIM",
  "^{M}. {ST}. NOT ENOUGH BLOOD. NEVER ENOUGH BLOOD"],
 hate:["^SOFT ASS FUCKING SHOW",
  "^NOBODY BLED. NOBODY. WHAT THE FUCK",
  "^THIS WAS A FUCKING KIDS SHOW. FUCK THIS",
  "^SO FUCKING SOFT. IM DONE. FUCK OFF"],
 hateM:["^{M} AND NOBODY BLED. FUCKING EMBARRASSING",
  "^{A} VS {B} WAS SOFT AS SHIT. FUCKING PATHETIC",
  "^{M} WAS SUPPOSED TO BE VIOLENT. IT WASNT. FUCK THAT",
  "^{A} HITS LIKE THEYRE SCARED TO HURT SOMEBODY. HURT SOMEBODY YOU COWARD",
  "^{M}. NO BLOOD. NO WEAPONS. NO FUCKING POINT",
  "^THEY BUILT {A} VS {B} FOR WEEKS AND NOBODY EVEN GOT CUT. BULLSHIT",
  "^{A} AND {B} WRESTLED LIKE THEY WERE AFRAID TO BLEED. BLEED MOTHERFUCKER"],
 ign:["^NO BLOOD ALL NIGHT. FUCK OFF",
  "^NOT ONE FUCKING WEAPON ON THE WHOLE SHOW",
  "^WHERES THE VIOLENCE. WHERES THE FUCKING VIOLENCE",
  "^NO STREET FIGHT NO CAGE NO BLOOD. WHY THE FUCK DID I WATCH",
  "^EVERY MATCH WAS A WRESTLING MATCH. I DONT WANT WRESTLING MATCHES. I WANT BLOOD",
  "^PUT SOMEBODY THROUGH A FUCKING TABLE. ANYBODY",
  "^NO HARDCORE MATCH. NOT ONE. FUCK THIS SHOW",
  "^THE CHAIRS STAYED FOLDED ALL NIGHT. FUCKING BULLSHIT",
  "^BOOK A FUCKING DEATHMATCH YOU COWARDS",
  "^CLEAN FACES ALL NIGHT. DISGUSTING. CUT SOMEBODY"],
 sw:["^WENT TO {OT}. AT LEAST THEY HIT EACH OTHER WITH SHIT",
  "^SWITCHED TO {OT}. MORE FUCKING BLOOD OVER THERE",
  "^{OT} HAD THE VIOLENCE TONIGHT. SO FUCK IT I WENT THERE"],
 swM:["^{OT} HAD {OM}. THAT SHIT WAS FUCKING VIOLENT",
  "^WATCHED {OM} ON {OT}. SOMEBODY BLED. THATS ALL I FUCKING NEED",
  "^{OM} ON {OT} WAS A FUCKING FIGHT. WENT THERE"],
 swin:["^LEFT {OT}. TOO FUCKING SOFT OVER THERE",
  "^{OT} WAS SOFT AS SHIT. CAME HERE FOR BLOOD"],
 swinI:["^{OT} HAD ZERO VIOLENCE. ZERO. FUCK THEM. IM HERE NOW",
  "^NOT ONE WEAPON ON {OT}. FUCK THAT. SWITCHED"],
 swinM:["^LEFT {OT} FOR {M}. FUCK YEAH",
  "^CAME FROM {OT} FOR {M}. FUCKING WORTH IT"]},
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
 big:["Boss, we’re trending. Top five in the country.","Mentions are through the roof. Clips are doing big numbers everywhere.",
  "Best night online we’ve had. Sentiment’s almost all positive.","Every clip we posted is past a million views. People want more of this.",
  "The timeline’s ours tonight. Even the people who usually dunk on us are posting clips."],
 good:["Good night online, boss. Mostly positive, a few complaints.","Replies are solid. Engagement’s up on last week.",
  "Clips are moving and nobody’s dunking on us. That’s a win.","Good night. A couple of crowds want more, but the overall read is positive."],
 mixed:["Mixed timeline tonight. We held the room, barely.","Some love, some complaints. Normal week.",
  "Split reaction. Half the replies are hyped, half are quote-tweet essays.","Decent buzz. A couple of crowds are restless. Here’s what they’re saying."],
 bad:["Rough night in the replies, boss.","We lost people tonight, and they’re telling everyone why.",
  "We’re getting ratioed on our own posts.","Sentiment’s negative across the board. Here’s the damage."],
 awful:["Boss, it’s bad. Worst reaction we’ve had.","The timeline’s turned on us. We’re the punchline tonight.",
  "There’s already a meme about tonight. It’s everywhere."],
 rbig:["{TH} had a big night online. Their clips are everywhere.","Credit where it’s due: {TH}’s timeline is happy tonight.",
  "{TH} is trending. Their crowd is all in.","{TH}’s replies are all positive. We need to answer that."],
 rmixed:["{TH}’s mentions are lukewarm. Half their crowds want more.","{TH}’s timeline is a mixed bag. Some of their hardcore fans are restless, and restless fans wander.",
  "Middling night for {TH}. There’s an opening there.","{TH}’s fans are posting, but nobody’s excited. That’s a soft spot."],
 rbad:["{TH} is getting cooked online.","{TH}’s replies are brutal tonight.",
  "{TH}’s fans are miserable, and miserable fans go looking for a new show.","{TH}’s timeline is a mess. Their own fans are dunking on them."]};
const XR_ADD={ppv:["Pay-per-view numbers are always louder.","Big show, big timeline.","Everything’s louder on a pay-per-view."],
 lost:["And some of them watched {OT} instead. They’re posting about it.","A chunk of them flipped to {OT}, and they’re saying so."],
 won:["We also picked up some of {OT}’s fans tonight. They’re already posting.","A few of {OT}’s fans came over. They’re posting about it."]};
/* his "Next week" note: a lead-in in his voice, then the crowd’s tip (r.nx) */
const XR_LEAD={tech:["The technical fans are loud about this one:","From the workrate crowd:","The tech crowd’s main complaint:"],
 blood:["The Bloodhounds, cleaned up:","From the blood crowd:","The Bloodhounds want one thing:"],
 flip:["The Flippy fans keep saying the same thing:","From the high-flyer crowd:","Flippy fans’ main ask:"],
 chaos:["The chaos crowd is asking for this:","From the run-in crowd:","Chaos fiends’ main ask:"],
 cas:["The casuals keep saying the same thing:","From the casual crowd:","Casuals’ main ask:"]};
const XR_OFF=["Your call, boss.","","","",""];
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
 return `<div class="xrf"${at||''}><div class="xrfh"><span class="xrav" aria-hidden="true"></span><div><b>X Redditino</b><small>Head of PR · ${own?'reading the timeline':'reading '+esc(who||'their')+'’s timeline'}</small></div></div>
 <div class="xrsay">“${esc(F.say)}”</div>${F.posts.length?`<div class="xrps">${vis.map(xrPostHtml).join('')}${rest.length?`<details class="xrmore"><summary>${rest.length} more post${rest.length>1?'s':''}</summary>${rest.map(xrPostHtml).join('')}</details>`:''}</div>`:''}
 ${F.note?`<div class="xrnote"><b>Next week · ${fgLbl(F.note.g)}</b><span>${esc(F.note.t)}</span></div>`:''}</div>`}
Object.assign(window,{xrFeed,xrFeedHtml,XR_POSTS});
(function(){const c=document.createElement('style');c.textContent=`
.xrf{margin:10px 0 2px;background:#111114;box-shadow:inset 0 0 0 1px var(--line);position:relative;text-align:left}
.xrf::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--red) 60%,transparent)}
.xrfh{display:flex;align-items:center;gap:10px;padding:12px 12px 7px}
.xrav{flex:none;width:40px;height:54px;border-radius:3px;background:url(x-redditino.webp) 53% 1%/290% auto no-repeat,#111 url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1px #3a3b42,0 3px 8px rgba(0,0,0,.55)}
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
