/* Payoff scripts. Each beat has a setup and two calls, with the safer call first. */
'use strict';
const ARC_REEL={
 heelturn:[
  'For weeks, {B} could trust {A} to watch {B:their} back. Tonight that trust is about to cost {B:them}.',
  ['{B} is still counting on {A}. There is one last moment where this could pass for a misunderstanding.',
   ['Leave a hand hanging','{B} reaches for the hand that has always been there. {A} leaves it hanging, waits until {B} turns back around and hits {B:them}.'],
   ['Hit {B} in the middle of the ring','{A} hits {B} in full view. The boos start before {B} can get back up.']],
  ['{B} looks up at the person who did it.',
   ['Stay on {B}’s face','{B} looks for some sign this was an accident. {A} walks past without a word.'],
   ['Let {A} say it aloud','“I knew you’d trust me.” {A} lets {B} hear it before leaving.']]],
 faceturn:[
  '{A} has spent weeks watching {B} take the kind of punishment {A} used to cheer for.',
  ['{B} braces for the worst. {A} finally steps forward.',
   ['Get between {B} and the trouble','{A} plants both feet in front of {B}. There is a pause before the crowd realizes who {A} is protecting.'],
   ['Put everything on the line for {B}','{A} takes the brunt of it, gets back up and draws the line again. The crowd comes up with {A}.']],
  ['{B} has to decide whether to trust the person standing beside {B:them}.',
   ['Offer a hand','{B} looks at the hand for a long second before taking it.'],
   ['Own what happened','“You needed me before. I should’ve been there.” {B} hears it. So does the whole building.']]],
 betrayal:[
  '{A} and {B} used to take shortcuts for each other. {B} is about to learn who those shortcuts were really for.',
  ['{B} turns away. {A} already knows exactly where to stand.',
   ['Make the ambush look rehearsed','{A} moves on the exact cue {B} used to give. The timing gives away how long this was planned.'],
   ['Show {A} could have done it sooner','{A} gives {B} a look at the trap before springing it. That was the point.']],
  ['{B} tries to make sense of it. {A} is already looking ahead.',
   ['Leave {B} with the realization','{A} steps past {B} like the business is finished.'],
   ['Give {A} the last word','“We were good together. I’m going to be better alone.”']]],
 voice:[
  'Three different opponents helped {A} find the words. This time {A} has to get a word in against a name the whole building knows.',
  ['{B} has the room’s attention as soon as the mic comes out. {A} has to make the room listen to a less familiar voice.',
   ['Wait for the room','{A} lets the chant for {B} die down. “You came to hear a star. Give me thirty seconds and see who you remember.”'],
   ['Turn their attention around','“These people already know every word you say. Let’s give them something they haven’t heard.” The room turns toward {A}.']],
  ['The room is quiet enough to hear what {A} says next.',
   ['Give them one line to remember','“You’re the biggest name I’ve ever called out. I’m going to make sure I’m yours.”'],
   ['Hand {B} the mic back','“Go ahead. Take all the time you need.” For once, it’s {B} who has to find the words.']]],
 mentor:[
  '{A} knows what comes next. For weeks, {B} has been teaching it one correction at a time.',
  ['There’s half a second to use something from those lessons.',
   ['Use the lesson as taught','{A} makes the tiny adjustment {B} used to stop practice for. This time it works first try.'],
   ['Add something of {A:their} own','{A} changes the last beat of the sequence. {B} recognizes the lesson a second too late.']],
  ['There is just enough time for {B} to see what those lessons produced.',
   ['Give {B} a nod','{A} nods. {B} recognizes the same look from the first day they worked together.'],
   ['Bring back the first lesson','The old drill comes back in the last exchange, fluid enough that the crowd can see how far {A} has come.']]],
 gauntlet:[
  '{A} got through three rounds of tougher competition to get here. Tonight the prize is {PRIZE}.',
  ['{O} cuts off the opening that got {A} through the last round.',
   ['Bring back a counter from the climb','{A} goes back to a counter from the earlier rounds. {O} has to let go and reset.'],
   ['Chain the lessons from all three matches','Three exchanges from three different weeks come back in one run. People start recognizing them.']],
  ['{A} can see the belt from the ring. One last exchange decides how close it comes.',
   ['Hold on the belt for a beat','The belt stays in the foreground, with {A} and the opposition fighting for the opportunity to take it.'],
   ['Make the opposition reach for a last answer','{O} needs an answer nobody in the earlier rounds had. The crowd sees how close {A} has come.']]],
 ironman:[
  'Week after week, {A} delivered wherever the card needed it. Tonight {A} is the one trusted to close the show.',
  ['The pace picks up where most people would slow it down.',
   ['Keep the exchanges sharp','{A} makes the late exchanges look as crisp as the first.'],
   ['Save the fastest stretch for now','{A} quickens the pace and the crowd comes up out of its seats without a cue.']],
  ['The last stretch belongs to the wrestler who’s been putting in these minutes all month.',
   ['Give it a steady final beat','{A} hits the last cue with the same timing as the first. The crowd stays standing.'],
   ['Let the crowd carry the closing stretch','They’ve seen {A} do this every week. This time the whole building calls {A}’s name for it.']]],
 proveit:[
  'The {G} crowd used to sit on its hands for {A}. Now its favorite, {B}, can hear people yelling for both sides.',
  ['This is the exchange the {G} crowd came to see.',
   ['Meet {B} on the crowd’s terms','{A} gives {B} the exchange that made the fans buy tickets and earns a cheer out of it.'],
   ['Win the holdouts over in one burst','The loudest section for {B} starts making noise for {A} too.']],
  ['People who used to look straight past {A} are leaning over the rail.',
   ['Let the chants compete','The section that always started {B}’s chant splits in two.'],
   ['Look straight into {B}’s section','{A} turns toward the hardest crowd to win. They stand up for {A}.']]],
 trial:[
  '{A} left the first big test with a loss and one useful thing: a very clear idea of what had to change.',
  ['{O} leaves the same opening that got {A} into trouble in the first test.',
   ['Show the adjustment early','{A} spots the opening and closes it before the move that ended the first test.'],
   ['Bait the old mistake','{A} offers the opening that cost {A:them} the first match. This time {O} is the one scrambling.']],
  ['The final exchange carries a familiar shape.',
   ['Let the replay explain it','The replay shows the same cue and a different answer. The crowd catches up as the bell rings.'],
   ['Hold on the bigger name’s face','For a second, the bigger name looks at {A} like somebody has swapped the wrestler out.']]],
 school:[
  '{A} has learned the {S} match one mistake and one opponent at a time. Tonight the audience gets the final exam.',
  ['The part of the match that used to trip up {A} has come around again.',
   ['Show the fix from practice','{A} spots the problem early and handles it without breaking stride.'],
   ['Turn the old weakness into the showpiece','{A} leans into the part of this match that used to cause the most trouble. The whole section rises.']],
  ['The final test is making this stipulation feel second nature.',
   ['Keep the last exchange simple','{A} reads the match correctly and wastes no movement.'],
   ['Call back to the toughest lesson','The replay shows where {A} used to hesitate. Tonight there isn’t a pause.']]],
 tap:[
  '{A} has been collecting wins. {B} wants to know whether {A} can win a match where the only way out is to make someone tap.',
  ['{L} is an inch from the ropes. {P} still has the hold.',
   ['Bring it back to center','{P} drags {L} back to the middle, where there’s nothing close enough to grab.'],
   ['Make the escape lead to the same hold','{L} gets free long enough to turn over. {P} catches the arm on the other side.']],
  ['The referee gets down beside {L}. One hand is free.',
   ['Hold on the hand as it hovers','{L} lifts the free hand and searches for the ropes one last time.'],
   ['Let the last escape get close','{L} reaches until the fingertips shake. The ropes stay out of reach.']]],
 cross:[
  '{A} spent this run trying to win over the {G} crowd. Listen for that section when the bell rings.',
  ['The {G} crowd sees the kind of opening it always responds to.',
   ['Work the sequence they came to see','{A} strings the exchange together and the {G} fans meet every beat.'],
   ['Turn their favorite exchange into a signature','{A} takes something this crowd knows by heart and makes it look different enough to chant for.']],
  ['The camera finds a section that used to save its cheers for somebody else.',
   ['Give their chant room','The {G} fans start their own chant for {A}.'],
   ['Take the moment right to their side','{A} plays the last beat to that section. They respond as loud as the fans who came for {A} in the first place.']]],
 team:[
  '{A} and {B} came in as two singles wrestlers. Somewhere along the way they stopped asking whose turn it was.',
  ['The other team cuts the ring in half. {A} and {B} can see each other across it.',
   ['Build to the hot tag','The hand finally connects and the whole corner erupts.'],
   ['Let them improvise a tandem save','One ducks without looking. The other is there exactly on time.']],
  ['They have one opening to finish it together.',
   ['Use the move they’ve been rehearsing','Both hit their part of the combination without a word.'],
   ['Make the decisive exchange a blind read','{A} turns and {B} is already in place. The replay makes it look like one person called both halves.']]],
 faction:[
  '{A}, {B} and {C} used to need an excuse to get booked together. Look at the three of them arriving side by side.',
  ['The other team tries to pick one off. The other two see it coming.',
   ['Run the three-person save','One blocks the way, another pulls the danger clear, and the third turns it around.'],
   ['Call their first triple-team','All three hit their cues. The camera has to pull back just to fit the payoff.']],
  ['The three of them have one more chance to show how the unit works.',
   ['Put all three in the last shot','Nobody steps in front. The audience gets a clean look at the group.'],
   ['Let the third wrestler make the difference','The opponent counts two threats. The third is already in position to turn the match.']]],
 join:[
  '{A} has been fighting at the side of {F}. Tonight the group has to make room at the front.',
  ['Somebody from {F} steps forward with the shirt. {A} waits for the rest to close ranks.',
   ['Name what {A} did to earn it','“Every time you needed someone on the apron, look who was there.” The group draws {A} closer.'],
   ['Let each member acknowledge {A}','One nod, then another. By the time the shirt goes on, the room knows what it means.']],
  ['There is an open space in the group’s usual pose.',
   ['Give {A} the open spot','{A} takes the spot as naturally as if it had been there all along.'],
   ['Give {A} the first word as a member','“Next time you come for one of us, count again.”']]],
 under:[
  'Every loss got a little louder for {A}. Tonight the opponent has the bigger name and {A} has the people who kept showing up.',
  ['The favorite has {A} in the same trouble that ended the last few matches.',
   ['Let the first escape be ugly','{A} claws out of the corner and gets to one foot. The crowd cheers just for that.'],
   ['Make them think the comeback is gone','{A} goes still. Just when the crowd is ready to give up, one hand finds a way back in.']],
  ['The favorite makes the mistake {A} has been waiting for.',
   ['Strike before the favorite can reset','{A} is through the opening before the favorite even realizes it is there.'],
   ['Let the favorite see the upset coming','The favorite sees it one heartbeat too late. The crowd starts celebrating ahead of the bell.']]],
 retire:[
  'The loser goes home for good. {A} and {B} both signed for that, and neither gets to take the signature back.',
  ['{A} and {B} stop for one breath. They both know one career has a few minutes left.',
   ['Give both a final signature exchange','One familiar move answers another. The crowd knows it might never see one of them again.'],
   ['Make the last escape feel desperate','Someone reaches for a second wind and finds just enough to keep the career alive for another exchange.']],
  ['The bell has ended a career. The crowd turns to {L}.',
   ['Leave the loser alone with the crowd','{W} clears the ring. {L} takes one last look at all four sides before stepping out.'],
   ['Stay on the moment it sinks in','{L} starts to reach for the ropes, then drops the hand. The match was the last chance to stay.']]],
 stakes:[
  '{A} and {B} have put the consequences in writing. This is the match where somebody has to live with them.',
  ['Neither wrestler wants to be the one reminded of the deal in the morning.',
   ['Make them look at what’s on the line','Both pause long enough for the crowd to see what losing would mean to them. Then they collide again.'],
   ['Keep the desperation in the ring','{A} and {B} fight over every inch, because losing means paying up in front of everybody.']],
  ['The last exchange will decide who has to honor the deal.',
   ['Stay with the wrestler in trouble','The camera stays on the face of the wrestler fighting to avoid being the one who pays.'],
   ['Hold on the last exchange','Neither looks away. The last exchange is going to decide who has to honor the deal.']]],
 torch:[
  '{A} has spent weeks giving {B} room to grow. Tonight the whole night can belong to {B}.',
  ['{B} gets the opening {A} used to get at this point in the night.',
   ['Let {B} answer the veteran’s best','{A} brings everything to the exchange. {B} has an answer for all of it.'],
   ['Give {B} the signature camera angle','{B} fills the same frame {A} has owned for years. The crowd is up before anyone tells them to be.']],
  ['{A} hangs back for a second. The crowd is waiting to see whether {B} gets the blessing.',
   ['Raise {B}’s hand and step back','{A} raises {B}’s hand once and leaves {B} alone in the middle of the ring.'],
   ['Tell the crowd whose time it is','“You gave me this spot once. I know who’s ready for it now.” {A} turns the spotlight over to {B}.']]],
 dream:[
  'After all the talk and all the years fans spent booking this in their heads, {A} and {B} are finally sharing a PPV ring.',
  ['The crowd knows the signature cues for both stars. Both are coming.',
   ['Trade the moves they came for','Each star hits the move the other half of the crowd came to see. The noise rolls back and forth.'],
   ['Make the signature moments collide','Both hit their familiar cues at the same time. Nobody in the crowd can stay seated.']],
  ['The two stars have one last exchange to give people something to replay.',
   ['Hold the wide shot','Both stars stay in frame as the crowd comes up around them.'],
   ['Bring back the opening staredown','For one beat their eyes meet just as they did at the start. This time the building knows what it cost to get back there.']]],
 farewell:[
  '{A} has had one last run of big nights. The bell tonight starts a match that will never happen again.',
  ['{A} gets a look at the old opening. Everybody who followed the career knows it by heart.',
   ['Bring back the old signature','{A} reaches into the old catalog. A section of the crowd recognizes it before the move is halfway done.'],
   ['Give the whole career one last run','{A} hits the early-career cue, the mid-career signature and the move that filled buildings. All in one stretch.']],
  ['The last bell of {A}’s career has rung.',
   ['Leave the center of the ring to {A}','Everyone else gives {A} space. Somebody in the front row mouths “thank you.”'],
   ['Let the crowd say goodbye first','The chant starts before {A} can go to the ropes. {A} waits there until it makes a full trip around the building.']]],
 shoot:[
  'For weeks {A} has been getting closer to saying something the office would rather leave off the air. {B} is here to hear it.',
  ['{B} waits for the line everyone rehearsed. {A} looks straight past that cue.',
   ['Name the grievance plainly','“{B}, you walked into that office and asked them to take me off this show. You couldn’t beat me for the spot, so you tried to get me sent home.”'],
   ['Tell the crowd where it happened','“In the hallway last week, {B} told the office to give my match away. Say it out here where I can answer you.”']],
  ['The headset in gorilla goes quiet. {A} still has the mic.',
   ['Let the silence carry it','“Take your time, {B}. I want everybody to hear the answer.”'],
   ['Say the part they cut from rehearsal','“If you want me to take it back, ask me while this thing’s still on.”']]],
 cult:[
  '{A} talked to them one at a time. Look how many of them know the words now.',
  ['{A} gives the usual signal. This is the first time the followers have to answer where everyone can see.',
   ['Let the first follower answer','One voice answers {A} before the rest join in. The pause makes the chorus feel twice as loud.'],
   ['Make the whole group move as one','They all turn at the same instant. People in the crowd look around to see who else noticed.']],
  ['The followers look to {A} one last time. They know what they’re being asked for.',
   ['Let the silence settle before the vow','The building goes quiet, and the followers give their answer without looking away.'],
   ['Have the followers start the refrain','{A} waits. The followers start the refrain on their own, and it follows them all the way out.']]],
 redemption:[
  '{A} had to face what the slump was doing in and out of the ring, then went to work. Tonight the crowd gets to decide how much of that it believes.',
  ['The match comes back around to the kind of decision that used to send {A} into a spiral.',
   ['Show the change under pressure','{A} takes a breath and does the thing a month ago {A:they} couldn’t do.'],
   ['Let the crowd recognize the old mistake','People start to groan at the setup. {A} changes the ending before they finish.']],
  ['The main event crowd has stayed to see what happens after the win.',
   ['Keep the celebration small','{A} nods into the hard camera as the crowd’s cheers come in, one section at a time.'],
   ['Give the crowd the first word','{A} lowers both hands and listens. Even the section that used to boo has joined in.']]],
 streak:[
  'The streak survived every name so far. Tonight {A} has to beat the more heavily favored {O} to keep it going.',
  ['For a second the building thinks this is where the streak ends.',
   ['Let the escape come late','The crowd starts to gasp and the escape comes right at the end of it.'],
   ['Run the most convincing false finish of the streak','The opponent starts to celebrate. {A} finds a way back in before the result can go official.']],
  ['The opponent has burned the best chance anybody has had to break it.',
   ['Give the streak a decisive last stretch','{A} answers once, sharply enough that everyone can see why the run is still alive.'],
   ['Keep the opponent’s disbelief in frame','{O} looks up as the streak clicks over again.']]],
 comeback:[
  'The injury took {A} off TV. The work to get back started after that. Tonight {A} gets to show it on PPV.',
  ['Everyone is watching to see whether {A} can still do the move that used to come without thinking.',
   ['Bring it out in stages','The first step is cautious. By the last one the old rhythm is there.'],
   ['Hit it at full speed','{A} hits it at the speed people remember. The reaction arrives as soon as both feet are back down.']],
  ['{A} gets a second to look out at the people who waited.',
   ['Let the relief show','{A} exhales, then looks up. The place is still standing.'],
   ['End on the old signature pose','{A} holds the pose long enough for the audience to realize they weren’t sure they would see it again.']]],
 fightchamp:[
  '{A} brought that title to every defense and kept answering challengers. Across the ring is the latest test.',
  ['The challenger finds a real opening, in full view of the belt.',
   ['Let the challenger prove the shot was earned','{A} gives ground and the challenger takes every inch. The crowd buys the threat.'],
   ['Make the champion answer immediately','{A} reads the danger and answers at full speed. The challenger has to come up with something new.']],
  ['The title is still on the line and neither wrestler has had an easy minute.',
   ['Stay with the belt after the bell','The camera holds on the plate and the hands it ends up in. Everybody just saw the price of it.'],
   ['Show what defending it took','{A} draws one long breath on the ropes. Even the next challenger will have seen what it took to get here.']]],
 techshow:[
  'Clean finishes and a run of technicians brought {A} here. Tonight a small adjustment can decide a whole fall.',
  ['The early grip fights are showing up again deeper into the match.',
   ['Trade counters and give both room to breathe','One adjustment answers another. The audience is applauding a wrist position.'],
   ['Make an early hold pay off late','{A} finds the same grip from the first fall and changes the exit. The other wrestler sees it just after the crowd does.']],
  ['The final exchange comes down to position and what each wrestler has left.',
   ['Stay wide so the whole sequence reads','Every change of balance is visible. The crowd follows right down to the last movement.'],
   ['Cut in on the deciding grip','The replay catches the adjustment in the hands that decided the exchange.']]],
 hometown:[
  '{A} put together a run of wins to get this slot. This is a bigger stage, and the fans already know who they came to see.',
  ['A chant for {A} starts on the far side and gathers people as it travels.',
   ['Work to the rhythm of the chant','{A} gives the crowd a beat to hit and the whole lower level hits it together.'],
   ['Turn the big exchange toward the loudest section','{A} turns the moment their way. The upper deck has to get louder to answer them.']],
  ['The match is closing. The crowd still has something left for {A}.',
   ['Hold on the fans along the rail','Faces light up all the way down the rail as {A} passes.'],
   ['Leave arena sound up after the bell','You can hear “{A}” on the broadcast long after the referee has done the job.']]],
 breakup:[
  'Two tag losses and one ugly conversation brought {A} and {B} here. They still know exactly how to get under each other’s skin.',
  ['One of them reaches for an old shared cue out of habit.',
   ['Let the silence answer the old cue','The cue hangs there. This time nobody comes.'],
   ['Turn their favorite shared cue against them','The old cue comes out perfectly, mean enough to get a reaction from the other side of the ring.']],
  ['There is one last chance for them to keep calling themselves a team.',
   ['Leave the matching gear behind','The matching colors stay on the mat after {A} and {B} walk out on opposite sides.'],
   ['Name the grudge everyone could see','“I was covering for you every week. Now everybody gets to see what you do on your own.”']]],
 reunion:[
  'The crowd remembers when {A} and {B} were a team. Half the building is waiting for their old signal.',
  ['A split-second opening puts the old teamwork back within reach.',
   ['Bring back the old tag signal','The hand goes up and the other wrestler moves before they can even see it.'],
   ['Bring back the tandem move cold','{A} and {B} hit the combination without a rehearsal in sight. A cheer starts with the fans who remember.']],
  ['They reach the last stretch together, like they used to.',
   ['Leave them side by side in the last shot','They end up shoulder to shoulder. The old team pose comes back without a word.'],
   ['Let the crowd bring the old name back','Somebody starts the old team chant. By the time they make the aisle, everybody remembers the words.']]],
 hardcore:[
  '{A} has worked up through rough matches to reach {S}. The people who go to these shows know exactly what the last step costs.',
  ['{A} has to get back up with the worst of the stipulation still in play.',
   ['Show the lesson that kept {A} in the match','{A} takes a moment to regroup, then stands up in the teeth of it. The Bloodhounds start pounding the rail.'],
   ['Make the hardest exchange the initiation','Both go down. {A} is the one who pulls up to face the next exchange without waiting for a cue.']],
  ['The Bloodhounds are still on their feet. {A} has to decide how much there is left to show them.',
   ['Let the cost show','{A} leans on the apron and breathes through it. The rail keeps shaking.'],
   ['Walk the aisle under {A:their} own power','{A} waves away help and has to stop once before the curtain. By then the whole aisle is applauding.']]],
 flyer:[
  'The cameras spent weeks trying to keep up with {A}. Tonight there’s a ladder in the ring and a prize above it.',
  ['Every camera is pointed at the ladder. {A} has one chance to give them the angle.',
   ['Run the aerial exchange in one shot','{A} takes off and lands in the same wide frame. It looks even bigger without a cut.'],
   ['Get the jump and the landing from opposite sides','The live shot catches the height. The replay catches the other wrestlers looking up in time to see it coming.']],
  ['The only way to win is to climb up and take {PRIZE}.',
   ['Stay on the rungs for the last climb','The ladder rocks with each step. The crowd looks up until hands reach the prize.'],
   ['Show the top of the ladder from the ring','From down on the canvas, every rung of the decisive climb looks farther away.']]],
 rebrand:[
  'Those vignettes showed pieces of a new wrestler. Tonight the music hits and everybody gets the whole thing at once.',
  ['{A} steps into the light. The crowd has to work out what it’s looking at.',
   ['Let the new look speak before the first word','The lights come up on the new gear. The fans stare long enough for the look to register.'],
   ['Make the first line the reveal','“There you are. I’ve been waiting to meet all of you.” The new voice makes the room sit up.']],
  ['The old entrance graphic goes dark. The new character has the crowd’s attention.',
   ['Tell them the old character is gone','“You’ll recognize the music next time. The person you used to chant for isn’t coming out.”'],
   ['Make the new voice unmistakable','“The next time that music hits, remember who came through the curtain tonight.”']]],
 lastchase:[
  'After one more run through the top of the card, {A} is back in a title match.',
  ['The title is a few feet away and both wrestlers are digging for the last exchange they have left.',
   ['Call back to {A}’s best title match','The old sequence comes back for a second. The champion has to fight through it at full speed.'],
   ['Let the champion take {A} as far as possible','The champion gives {A} one last fight worthy of a title shot. The crowd cannot tell which way it will go.']],
  ['The final exchange hangs in the balance. The belt is in reach.']],
 passtitle:[
  '{A} built {B} up to this fight. Now {A} has to give {B} a clean chance to take the belt.',
  ['{A} offers the same test that sent the last challengers home empty-handed.',
   ['Let {B} answer every part of it','{B} answers the champion’s strongest sequence all the way through. {A} can see the difference.'],
   ['Stretch the champ’s last stand','{A} has one answer after another until {B} finally brings the one the champion hasn’t seen.']],
  ['{B} has won it clean. Everybody looks to {A} before the belt is handed over.',
   ['Put the belt in {B}’s hands','{A} lifts the belt and sets it in {B}’s hands. The referee backs away.'],
   ['Leave {B} alone with the gold','{A} looks at the belt once, then steps through the ropes to give {B} the ring.']]],
 invasion:[
  '{A} spent crossover season taking ground one match and one callout at a time. Tonight both shows share a card, and the rival side is across the ring.',
  ['Both sides can hear their fans from across the building.',
   ['Give the opposing crowd one last rally','The fans backing the other show get loud enough to make {A} answer at full speed.'],
   ['Turn the rival’s loudest chant against them','{A} answers the chant in the ring, and the chant from the other side starts to drown it out.']],
  ['{A} has won for one show on the crossover card. The other side is waiting to see what happens next.',
   ['Hold the camera on the rival bench','One by one they realize the night belongs to the people who came in through their door.'],
   ['Give both sides a moment in the shot','The winning side makes its way to the middle. The other locker room stays at the foot of the ramp.']]],
 copycat:[
  '{A} copied the gear, the lines and the moves. For the first time {B} gets to stand across from the whole act.',
  ['They both hit the same cue. The crowd looks from one side to the other.',
   ['Mirror the original one more time','{A} matches the move beat for beat. The crowd watches {B} watching it happen.'],
   ['Change one beat of the copy','{A} keeps the signature shape and changes the ending. For a second the crowd follows {A} first.']],
  ['One of them starts the catchphrase. Everyone waits to see who gets to finish it.',
   ['Give the crowd both versions','The two versions overlap. The audience has to pick which one it’s repeating.'],
   ['Leave {B} staring at the imitation','The last shot catches the exact same pose on opposite sides of the ring. Only one looks comfortable in it.']]],
 transform:[
  'The last time this many people saw {A}, the biggest thing in the shot was the weight rack. The ring looks smaller tonight.',
  ['The opponent tries the same opening that used to move {A}.',
   ['Show the change on first contact','{A} stands still where the old version would have given ground. The crowd notices the difference right away.'],
   ['Bring the new power out all at once','{A} turns the exchange with strength the opponent had clearly prepared for in smaller numbers.']],
  ['There is just enough left to show what all that time in the weight room changed.',
   ['Keep the camera low for the last exchange','From the mat, the difference is plain.'],
   ['Let the opponent register the new gear','The opponent looks at {A} like the scouting tape just became useless.']]],
 factionwar:[
  '{F} and {F2} have spent weeks sending people after one another. Tonight the wrestlers they sent are in the same match.',
  ['Bodies are scattered. Whoever still has a teammate standing gets the next opening.',
   ['Make a rescue travel the whole team','One member keeps the fight alive long enough for the others to find their way back.'],
   ['Give both factions a synchronized charge','Both groups hit the same cue and the camera has to go wide to see where it ends.']],
  ['There is one last stretch where numbers still matter.',
   ['Follow the last save','One wrestler makes it back just in time. The last exchange belongs to the side that still has somebody to help.'],
   ['Hold the wide shot as they run out of bodies','The last people standing look around and see what it took to get the ring to themselves.']]],
 groundswell:[
  'Management gave {A} little to work with. The fans brought signs anyway. Tonight the people who made the signs get the main camera.',
  ['A chant starts far from the ring and comes forward row by row.',
   ['Leave room for the chant','{A} waits, and a section that had been quiet all night joins before the next exchange.'],
   ['Time the surge to the whole building','{A} moves as the chant peaks. It feels like the audience called the spot themselves.']],
  ['The fans finally get to see the win they spent weeks asking for.',
   ['Show the first homemade sign again','There’s the homemade sign that kept making it onto TV. Its owner can finally show it to {A} after a win.'],
   ['Leave the celebration to the crowd','{A} steps aside just enough for the camera to see the people who got this match on the card.']]],
 breakfree:[
  '{B} has taken the credit, handed out blame and called it loyalty. {A} hears one last order.',
  ['{B} points out of the ring. “Go wait backstage. I’ll tell them whose fault this was.”',
   ['Make {B} repeat the order','{A} stays put through the second order. When {B} reaches for {A:them}, {A} knocks the hand away and shoves {B} back.'],
   ['Have {A} turn on {B} in full view','{A} steps into the old position, then turns on {B}. The crowd cheers before {B} can get up.']],
  ['{B} tries the old command again. Even the front row knows it has stopped working.',
   ['Let {A} walk out alone','{A} leaves when {A:they} chooses to. The crowd follows the walk all the way to the curtain.'],
   ['Make the break public','“I heard you every time. That was the last one.” {A} drops the mic beside {B}.']]],
 sellout:[
  'The suit from the baby-powder company is sitting at ringside. The contract is on one knee and the pen is already uncapped.',
  ['The suit slides the folder up to the apron as the match reaches the last exchange.',
   ['Keep the wrestlers’ eyes on the ring','{A} finishes the exchange with the folder in plain sight. The suit still has to wait.'],
   ['Catch {A} looking at the signature line','For one second {A} looks down. The close-up gets the pen, the paper and the whole decision in one shot.']],
  ['The bell has rung. The suit steps between the ropes and holds out the pen.']],
 absolute:[
  'Holding the title has changed what {A} is willing to do. {B} volunteered to be the last person between that belt and the exit.',
  ['{A} looks from the belt to {B} as another opening comes up.',
   ['Let the old threat hang there','{A} reaches for the old advantage. The front row shouts a warning as {B} gets close.'],
   ['Make {B} force the champion into the open','{B} cuts off the easy exit and brings the fight where everyone can see what {A} is willing to do.']],
  ['The title is right there. So is everything {A} has done to keep it.',
   ['Hold on the belt and the champion','The plate catches the light as the last exchange goes down. The room can see how much this defense matters to both wrestlers.'],
   ['Let the last opening feel dangerous','For a heartbeat the champion has a chance to take a shortcut. The crowd sees it before {B} does.']]],
 earnfight:[
  '{B} picked the opponents and the stipulations. {A} survived all of them, and now there isn’t anybody left to send.',
  ['{B} has to take the exchange that somebody else would have taken a week ago.',
   ['Call back to one of the gauntlet matches','{A} brings back a move earned in the gauntlet. This time it’s {B} on the receiving end.'],
   ['Give {A} the first sustained run at {B}','Every time {B} looks for space, {A} closes it. The crowd remembers how long it took to get here.']],
  ['For the last time tonight, {B} sees {A} with a clear path between them.',
   ['Keep both in frame to the bell','The camera stays on the two people the whole detour was about.'],
   ['Have {A} remind {B} what it took','“You picked the opponents. You picked the rules. You’re the only one left.” {A} drives {B} back again.']]],
 number:[
  '{B} beat {A} over and over with the same answer. {A} has worked on the Dead Number: a counter that catches {B} mid-turn and drops {B:them} across {A}’s knee.',
  ['{B} gives the exact cue that ended the last match. {A} has been waiting for it.',
   ['Show the escape before the counter','{B} starts the familiar sequence. {A} slips out at the point that used to be too late.'],
   ['Make {B} think the old answer still works','The crowd sees {B} reach for the old opening and {A} quietly beat {B:them} to the next position.']],
  ['There is a clean opening for the Dead Number.',
   ['Let the move come out of the old trap','{A} catches {B} halfway through the old move, turns underneath, and drops {B:them} across a knee. That’s the Dead Number.'],
   ['Catch the instant {B} realizes what changed','The camera catches {B} recognizing the setup half a second before the Dead Number lands.']]],
 wedding:[
  '{B} and {C} planned one wedding. Then {A} produced two existing marriage certificates. The ring is the only venue that will still take the booking.',
  ['The three end up back in the middle, close enough to see who is still wearing a ring.',
   ['Show all three rings in the same shot','Three hands come up at once. The crowd starts counting out loud.'],
   ['Bring the vows back on the arena mic','The old wedding audio comes up for a second. Everyone in the ring recognizes the same vow.']],
  ['All three have stopped fighting just long enough to decide what they mean to each other.']],
 faith:[
  '{A} has been preaching to {F} for weeks. Tonight every member has to give an answer where the others can hear it.',
  ['{A} finishes the first words of the prayer. Eyes move around the group.',
   ['Hold on the first member to react','One member looks up. Somebody else lowers their eyes. {A} waits for both to decide.'],
   ['Let {A} ask for an answer out loud','“I’ve said what I believe. I want to hear you say what you believe while we’re all still here.”']],
  ['The members look from one to the next. Their answer is coming.']],
 haircut:[
  '{A} got a haircut. Commentary thinks the company signed somebody new. Only {B} seems to think those facts are connected.',
  ['{B} recognizes a sequence that should be brand-new to everybody.',
   ['Have commentary praise the newcomer’s originality','“I’ll tell you this. I’ve never seen anybody put those moves together quite like that.” {B} stares at the desk.'],
   ['Give {B} the side-by-side replay','The replay shows old gear, new hair and exactly the same move. Commentary praises the excellent coincidence.']],
  ['The broadcast flashes “New arrival.” {B} finally gets a hand on the mic.',
   ['Let {B} make the case','“It’s {A} with a haircut!” {B} points from the replay to the wrestler. The announcer thanks {B:them} for welcoming the new arrival.'],
   ['Cut to the scouting notes','The graphic reads “First match.” “It’s {A} with a haircut!” {B} points at the screen. The graphic still says “First match.”']]],
 goodwill:[
  'There were gifts for the kids, hugs for old opponents and an apology soufflé. {B} has been waiting for a moment when good intentions actually cost {A} something.',
  ['{B} is in trouble. Only {A} is in a position to reach {B:them}.',
   ['Let {B} reach out first','{B} reaches for the hand. {A} looks down at it for exactly as long as a person with a choice might.'],
   ['Put the whole spotlight on {A}','The rest of the ring clears out of the shot. Whatever happens, every person here will know who decided.']],
  ['Nobody else can reach {B} in time. This is {A}’s answer.']],
 townhero:[
  '{A} has spent weeks claiming {B}’s hometown. A section of fans from there came to see who gets to call it home.',
  ['{A} hears the local chant for {B} and starts pointing back like it’s for both of them.',
   ['Play the crowd like {A} grew up on this block','{A} gets half a section to answer before {B} can believe what is happening.'],
   ['Steal the local hero’s big entrance cue','{A} hits the hometown cue perfectly. The crowd laughs, then some of them shout it back.']],
  ['{B} has lost in front of the people who knew {B:them} before wrestling.',
   ['Let {A} thank the hometown fans','“You’ve always been there for me.” {B} looks around at the people trying to figure out when that started.'],
   ['Give {A} the local hero’s exit','{A} takes the long way along the rail, shaking hands like every one of these people was a neighbor.']]],
 war:[
  'The anthems, the speeches and the first strike brought both flags into a {S} match. They’re still upright at ringside.',
  ['Both wrestlers go down close enough to reach their flags.',
   ['Hold the shot as both reach','Neither has the strength to get there first. Each can see what the other is reaching for.'],
   ['Give the flags one more entrance beat','The crowd hears the two sides trying to sing over one another as {A} and {B} drag themselves back up.']],
  ['Both have a flag in reach. They can lower them or carry this past the bell.']],
 likeness:[
  '{F} already printed shirts with {B}’s face on them. The signed contract says tonight decides who gets to sell them.',
  ['The camera finds one of the bootlegs in the audience. {B} spots it too.',
   ['Let {B} wrestle angry at the evidence','{B} can hear the shirt vendor as the exchange starts. {A} doesn’t let that anger rush the moment.'],
   ['Have {F} model the shirt from ringside','{B} looks up and sees {B:their} face in a whole row of matching outfits.']],
  ['The contract is enforceable. Everybody is looking at the shirt table.',
   ['Put the first licensed shirt in the closing shot','A member of {F} holds up the same design with the new label stitched in.'],
   ['Let {B} see the first sale','Somebody pulls on the shirt right in front of {B}. {F} starts taking orders before the music ends.']]],
 pain:[
  '{A} kept taking more punishment on purpose and turned the doctor away. The first hard landing tonight makes that history visible.',
  ['{A} has a moment to breathe. The crowd can see how much work it takes just to stand.',
   ['Let the pause show the cost','{A} pauses and grips the rope until the legs are steady. The people in front stop shouting and watch.'],
   ['Let {A} finish the exchange through the pain','{A} gets to the end of it, then needs the ropes to stay upright. The cheer comes late and loud.']],
  ['The match has one last exchange. The trainer is still standing at the curtain.',
   ['Hold the shot as {A} takes the offered help','{A} makes it to the bell and finally sits down long enough for somebody to look.'],
   ['Give the crowd a look at the effort','{A} gets back to one knee for the crowd and stays there. Getting that far took everything left.']]],
 oil:[
  '{B} told {A} about the Maccabees, about the few against the many and about the little oil that lasted. Tonight they have just enough left for one exchange.',
  ['The other team has cut off {B}. {A} is still holding out a hand.',
   ['Build the comeback one escape at a time','One escape keeps the match alive, then another. The last tag gets a louder cheer than anything all night.'],
   ['Give the whole arena a moment to see the tag','{B} finds the last reach. The hand connects with nothing left to spare.']],
  ['Somehow the two of them still have enough to finish it.',
   ['Let {B} share the moment with {A}','{B} laughs and leans a forehead against {A}’s shoulder. “Just enough.”'],
   ['Hold the shot while the two catch their breath','The crowd has time to see how little they had left, and how far it got them.']]],
 peace:[
  '{A} went away and stayed away until there was something worth coming back with. The bell finds {A} looking calmer than anyone remembers.',
  ['The opponent offers the kind of provocation that would have worked before the time away.',
   ['Take a breath before answering','{A} lets the provocation pass and keeps an even pace. The opponent has to come up with a wrestling answer.'],
   ['Make an old trigger open a new exchange','{A} sees the trick, smiles and uses the room it leaves behind. The reaction comes from people who remember the old temper.']],
  ['The return is a win. {A} has a second to choose what to carry back out.',
   ['Let {A} leave at the same pace','The music hits and {A} walks out as calmly as {A:they} came in.'],
   ['Show the small change in the last shot','{A} straightens the apron for the crew on the way past. The calm holds after the bell.']]],
 twitch:[
  'Chat picked {S} for the last match. The producer has all the receipts, including the voters who only came in to post “do it again.”',
  ['The match has reached the bit that made chat vote for this stipulation.',
   ['Put the winning vote up in the corner','The graphic goes up right as {A} gets to the part chat voted to see. The arena points at it like it did the booking.'],
   ['Let chat see the gimmick from {A}’s angle','The camera drops into the action. The chat scroll speeds up too much to read.']],
  ['Chat gets one last look at what it booked. The next poll decides what kind of wrestler {A} becomes.',
   ['Freeze the closing poll over the replay','The replay plays underneath the vote. Half the messages are already campaigning for a new trait.'],
   ['Put the wildest reaction on the big screen','The room starts laughing at the live chat, then looks back in time to catch {A}’s last beat.']]]
};

/* The three introductions recall the start, the escalation and the cost. The
   next fields describe the stipulation's obstacle, two heat calls and the finish. */
const BLOOD_REEL={
 std:[
  ["One fall settles the match. {A} and {B} get to fight it out under normal rules.", "The referee calls both sides to the center. A pin or submission gives one side the last word.", "The two sides meet under normal rules. This time the referee needs a fall."],
  "They’ve finally got the middle of the ring to themselves.",
  ["Trade the shots everyone remembers", "The last exchange from the feud comes back, and both stay on their feet."],
  ["Make the old escape fail", "The escape that bought another week before is gone. The crowd knows it before either wrestler does."],
  "{P} hooks {L}’s leg. The referee counts three. {W} wins."],
 barbed:[
  ["Barbed wire replaces the ropes. {A} and {B} have to keep fighting around the blasts.", "The wire is live and the crew has cleared ringside. A fall still decides the match.", "The crew finishes the last safety check. {A} and {B} are already staring through the wire."],
  "The first explosion has made both wrestlers flinch. There’s still a whole match to finish inside the wire.",
  ["Fight for the center", "Both claw their way back from the edge, then realize they’re standing inches apart again."],
  ["Let the next blast interrupt the charge", "The blast cuts across the charge. When the smoke moves, both are still trying to get up."],
  "The smoke clears long enough for the referee to count three with {P} covering {L}. {W} wins."],
 texas:[
  ["A scored fall starts the ten count. Getting up in time keeps the match alive.", "A pin earns a chance to finish it. The wrestler who takes the fall still has ten to get up.", "{A} and {B} can get knocked down as often as it takes. The count starts only after a fall."],
  "A scored fall starts the count. One wrestler is pulling upright by the ropes with the whole crowd counting along.",
  ["Make the first rise come at nine", "The count gets to nine. A hand finds the rope and the fight starts all over again."],
  ["Let both refuse to stay down", "Both fight back to their feet. Neither can take a full step before they reach for each other."],
  "{P} pins {L} for the fall. {L} tries to stand, but the referee reaches ten before {L} gets up. {W} wins."],
 lights:[
  ["The promotion declined to sanction this. The work lights come up and the referee stays to count the fall.", "The rest of the rules are gone. The referee is here to get one decision under the work lights.", "The lights come up on {A} and {B}. No sanction, no disqualifications, and a referee waiting for the fall."],
  "The lights narrow to the fight. The people closest to the ring can hear both wrestlers breathing.",
  ["Keep the exchange in the pool of light", "Every shot lands in view of the people who stayed to see this settled."],
  ["Follow the fight past the light", "For a second there’s only the sound. The camera catches both on the floor coming back into view."],
  "Under the work lights, {P} covers {L} for three. The unsanctioned fight goes to {W}."],
 iquit:[
  ["One wrestler has to say “I quit” into the mic for this to end.", "The referee tests the microphone. Only an audible surrender can end the match.", "{A} and {B} look at the mic. Neither can win with a pin."],
  "The ref lowers the mic. Everyone can hear the breathing that comes before the answer.",
  ["Leave the mic open through the refusal", "“I’m still in this.” The words are quiet, but they carry to the back row."],
  ["Make the first answer a dare", "“You want me to quit? Make me.” The referee pulls the mic back as the fight starts again."],
  "{L} says “I quit” into the microphone. The referee calls it for {W}, and {P} releases the hold."],
 lms:[
  ["The referee needs somebody to stay down for ten. A pin won’t stop it.", "{A} and {B} can fight anywhere they can stand. The ten count is for getting back to their feet.", "The referee raises an arm to show the count. Whoever can’t get up by ten loses."],
  "Someone starts to stand at eight and loses the ropes at nine.",
  ["Give the count one desperate escape", "One knee comes up and holds. A foot follows just as the ref is drawing breath for ten."],
  ["Let both use each other to get upright", "They climb back up on each other’s shoulders, then shove off at the same moment."],
  "The referee reaches ten with {L} still down. {W} wins Last Man Standing."],
 dog:[
  ["{A} and {B} are chained together at the neck. The first fall wins.", "The ref closes the last clasp. There’s no way to leave without bringing the other wrestler along.", "The chain barely has any slack. {A} and {B} can see how little distance there is to give."],
  "The chain comes taut. Both wrestlers can feel when the other stops moving.",
  ["Fight for the slack", "The chain drops an inch. Both reach for that inch at the same time."],
  ["Turn one retreat into a collision", "One tries to back away and the distance vanishes instantly. The chain lands in a heap between them."],
  "{P} pulls {L} close enough to hook the leg for three. The referee calls the match for {W} and unclips the chain."],
 cage:[
  ["The cage door locks with the wrestlers inside. A fall in the ring decides it.", "Nobody gets out or in before the decision. The referee stays inside the steel.", "Everyone at ringside is on the other side of the steel. The lock closes on {A} and {B}."],
  "The cage rattles. People at ringside take a step back and leave the rivals to it.",
  ["Let one look for help through the steel", "Nobody even approaches the door. The other wrestler is already closing in."],
  ["Make the steel answer for the feud", "The side of the cage shudders. Both have to fight their way back into the middle."],
  "{P} pins {L} inside the cage. After the three-count, the referee signals for the door to open."],
 street:[
  ["Anything goes in the Street Fight. The referee is here to count the fall.", "The path to the ring is clear. The referee doesn’t need the fight to stay between the ropes.", "The crew has cleared a path along the aisle. Both sides are already looking for room to fight."],
  "The aisle is clear, and both sides can see what the crew left in reach.",
  ["Follow them through the wreckage", "The camera passes the debris from the last exchange and catches both rivals still coming forward."],
  ["Bring the brawl straight back to ringside", "The front row pulls back as the fight comes home. Neither wrestler waits for space."],
  "{P} covers {L} in the wreckage. The referee counts three and calls it for {W}."],
 bng:[
  ["Two rings, one cage, and each side stays in until a wrestler surrenders for their team.", "The gates close. One surrender in either ring decides the whole match.", "{A} and {B} spot each other across the double cage. The only way out is for one side to surrender."],
  "The fight spreads to both rings. Someone has to clear a path before either faction can help its own.",
  ["Follow a rescue across both rings", "Help gets there a breath before the last ally gives in. The whole cage shakes with the reaction."],
  ["Keep both groups in the wide shot", "One ring goes quiet as the other surges. For a second the camera catches every person who can still stand."],
  "{L} surrenders for the team. The referee calls it for {W}, and the gates open."],
 anarchy:[
  ["The whole arena is in play. The referee can count the fall wherever it happens.", "The cameras spread out. The teams can fight all over the building for the same result.", "People stand to see down three aisles. Both teams are already spreading out."],
  "Both sides are scattered. The closest cameras are on different levels of the arena.",
  ["Cut from one rescue to the next", "A save up high gives a teammate time to rally on the floor. Nobody at home has the whole picture until the replay."],
  ["Bring both fights into the same shot", "Two fights spill together at the edge of the floor. The noise comes from all around them."],
  "The floor camera picks up the cover. {P} holds {L} down for three and {W} wins."],
 stampede:[
  ["The whole stadium is open to both teams. The referee follows until someone scores a fall.", "The feed cuts from one side of the stadium to the other. Any of those cameras could catch the finish.", "An empty stretch of stadium separates the sides. The referee is trying to stay close enough for a decision."],
  "The stadium cameras lose the fight for a second, then find both sides converging again.",
  ["Follow the last teammate back", "A member comes limping into frame just in time to stop the other side from closing the door."],
  ["Cut between both routes to the same fight", "The feeds cross and the whole brawl arrives in one place at the same instant."],
  "One stadium feed catches {P} pinning {L}. The referee counts three and calls it for {W}."],
 falls:[
  ["A pin counts anywhere in the building. The referee follows {A} and {B} up the aisle.", "The referee won’t call them back to the ring this time. The count can happen wherever the cover does.", "The camera is walking backward up the aisle. So is the referee, ready to count a pin there."],
  "They’re past the seats now. The referee is scrambling to keep up.",
  ["Follow them all the way around the concourse", "Fans part just in time, then close behind them. The ref has to keep asking for room."],
  ["Find the blind angle backstage", "The camera reaches the other side just as both come into view. The ref is there first for once."],
  "{P} pins {L} away from the ring. The referee counts three right there, and {W} wins."],
 nodq:[
  ["The referee will count a fall. Weapons and interference won’t get anyone disqualified.", "The official points to the bell. A fall can end this, and the things that normally draw warnings are legal.", "Both sides look under the ring. Anything they find is fair game."],
  "The official has backed away from both wrestlers and what’s lying between them.",
  ["Make them fight over the same opening", "They reach at the same time and neither comes away with an advantage. The room roars at the stalemate."],
  ["Show both passing up the chance to walk away", "One looks back toward the curtain. One step would do it. The next step is toward the fight."],
  "{P} holds {L} down for three. The referee calls it for {W}."],
 coffin:[
  ["The coffin is open. Getting an opponent inside and shutting the lid wins.", "{A} and {B} look toward the box at ringside. A pin can’t finish this.", "The crew checks the hinges. The bell comes once someone closes that lid on their opponent."],
  "The lid is open and neither wrestler will turn away from it.",
  ["Let a hand stop the lid at the last second", "Fingers appear just before the lid closes. The front row pulls in a breath together."],
  ["Hold on both wrestlers fighting back out", "They both make it away from the box with the lid still open behind them. It is all the crowd can look at."],
  "{P} gets {L} in the coffin and shuts the lid. The referee calls it for {W}."],
 ladder:[
  ["{PRIZE} hangs above the ring. Climb up and unhook it to win.", "They look up at {PRIZE}. No pin or submission can reach it.", "The ladders are ready. The winner has to come down with {PRIZE}."],
  "The ladder is swaying with both wrestlers up it and the prize just overhead.",
  ["Fight for one more rung", "Both get a hand up. The ladder wobbles hard enough to make the front row flinch."],
  ["Bring them both back to the canvas", "The ladder goes sideways and neither can make it to the prize. The next climb will have to start from the floor."],
  "{P} climbs past the last reaching hand and unhooks {PRIZE}. {W} wins."],
 tables:[
  ["The first wrestler put through a table loses.", "The referee eyes the standing table. Breaking one on its own won’t end the match.", "Both sides look over the furniture. The decisive break has to come with an opponent going through it."],
  "A table is still standing and neither wrestler wants to be the one looking up at it.",
  ["Tease the break on both sides", "Each gets the other close enough for everyone to see how little separates escape from the finish."],
  ["Let one table fold before either goes through", "The legs buckle while they’re still fighting for position. Both have to find another table."],
  "{P} puts {L} through the standing table. The referee signals the win for {W}."],
 twoof3:[
  ["The first side to score two falls wins. One fall only changes the score.", "The referee reminds both sides that the first fall won’t end it. They’re wrestling best of three.", "Two falls are enough to win. Both sides look for the first one."],
  "The score is one fall apiece. The opening from the first fall comes back around.",
  ["Let the early fall teach the answer", "The adjustment is just big enough for everyone who saw the first fall to recognize it."],
  ["Bring the first fall back in the replay", "The replay shows the opening that scored the first fall. This time the wrestler in trouble breaks free before the count."],
  "{P} pins {L} for the deciding fall. {W} takes it, two falls to one."],
 iron:[
  ["The clock runs for an hour. The wrestler ahead on falls when it expires wins.", "The first fall starts the score, and the clock decides when it’s final.", "{A} and {B} get sixty minutes to build a lead. Both keep an eye on the clock."],
  "Tied at one fall apiece, both start checking the clock between holds.",
  ["Let the clock interrupt the exchange", "They hear the time call together. For a second the slower pace vanishes and both go for it."],
  ["Bring back the opening sequence at full speed", "The building realizes they’re moving as fast as they did an hour ago. Neither can keep that up long."],
  "{P} pins {L} just before time expires. The final is two falls to one for {W}."],
 sub:[
  ["Only a tap-out can win. The referee drops down to watch their hands.", "A cover won’t end this. {A} and {B} need a hold the other side can’t escape.", "Both stare at the ropes. Whoever can’t reach them may have to tap."],
  "A familiar escape is turning into a second hold before the first one is all the way off.",
  ["Show the hand searching for a way out", "There’s a hand on the canvas and a long way still to go. The crowd sees the problem all at once."],
  ["Let the first release feed a second hold", "The escape works for barely a second. The wrestler who made it realizes it was the next opening."],
  "{L} finally taps out. {P} releases the hold. {W} wins."],
 tornado:[
  ["Everybody is legal at once. The first fall anywhere in the ring decides it.", "Nobody waits on the apron. Either team can end it with a fall at any moment.", "The referee waves both teams in. There’s no need to tag."],
  "Every teammate is legal, and both sides are running out of ways to cover for each other.",
  ["Follow the last double save", "One teammate comes to the rescue and needs a rescue a second later. The building is following both."],
  ["Call for a simultaneous charge", "Two fights hit the same corner at the same time. The camera barely has room."],
  "While the other wrestlers are still legal and fighting, {P} pins {L} for three. {W} wins."],
};

const ARC_REEL_END={
 sellout:{sign:'{A} signs. The suit hands over the clippers, and {A} shaves {A:their} head in the ring. The suit hands {A} the bottle and a mic. {A} holds both up. “Baby powder, folks. I said I’d do anything for the top spot. Now you know how much it costs.” The crowd boos through the entire pitch.',
  refuse:'{A} tears the contract down the signature line and holds the scraps out for the suit. The crowd erupts.'},
 wedding:{split:'All three rings hit the mat. {B} and {C} call off their wedding. {A} picks up the mic long enough to say, “We’re all done.” By the time the three leave, each has chosen a different exit.',
  throuple:'{A} asks why any one of them has to leave. {B} and {C} both say they want the three of them together. They put their rings back on and the referee calls it a no contest.'},
 faith:{convert:'The first member of {F} kneels. The next joins in, then the next. {A} starts the prayer again and the whole group follows {A:their} lead.',
  out:'{B} takes the mic. “We’re done listening. You’re out of {F}.” The group jumps {A}. {A} walks up the aisle alone while the crowd calls {A:their} name.'},
 goodwill:{ruse:'{A} pulls the hand away and leaves {B} to the other team. {W} wins. {A} takes a mic. “The gifts, the apologies, the soufflé. I made sure they’d believe me when I told them you were the problem.” {B} looks for a friend in the aisle. Nobody comes.',
  real:'{A} reaches {B} just in time. The save turns the match, and they win it together. After the bell, {B} is the one reaching for a hug.'},
 war:{peace:'{A} lowers the flag first. {B} lowers the other, and both shake hands. The referee calls the match off while the flags stay on the mat.',
  war:'The bell settles the match. Neither flag goes down. {A} and {B} go straight back after each other, and people from both sides have to pull them apart.'},
 lastchase:{champ:'{A} holds up the title and asks for the mic. “I came back for one last shot. I’m retiring as champion.”',
  fall:'{A} asks for the mic. “That was my last shot. It was my last match, too.” The audience stays up while {A} takes the long walk out.'},
 invasion:{knife:'{A} gives the signal after the bell. The brigade jumps the opposing side. {A} tells the camera they came to win over the rival show’s fans, and they’re willing to take the whole show apart to do it.',
  peace:'{A} goes to the other corner and holds out a hand. {O} takes it. {A} tells the crowd both shows gave them a match worth coming back for.'}
};

const ARC_REEL_STORY={
 'heelturn/watch':['{A} used to show {B} the watch because they shared everything. Lately {A} has made more time for the watch than for {B}.'],
 'faceturn/ghosts':['The three ghosts showed {A} what standing by had cost and what it would go on costing. {B} is the first person who gets to see what stuck.'],
 'betrayal/policy':['{A} secretly took out a life insurance policy on {B}. Two tag losses helped make the sabotage look accidental.'],
 'voice/taxidermy':['The specimen in the workshop was one thing. {A} called this opponent the ultimate trophy before anybody had the nerve to ask what that meant.'],
 'mentor/fraud':['{B} took credit for teaching the whole sequence. {A} has seen the old tape: {B} copied it and cut the footage before the counter.'],
 'mentor/violence':['{A} used to apologize after a hard match. After training with {B}, {A} is going to use those lessons against {O}.'],
 'trial/mountain':['First came the loss, then the climb, then the test from the man who said he decided mortal fates. {A} is back down where a wrestling match can prove it.'],
 'tap/hell':['{A} promised a hold brought back from the deepest layer of hell. {B} still wants to find out whether that was a line.'],
 'team/twins':['They found the missing half of the family in a promo. Now {A} and {B} can show everybody how quickly they learned to work as twins.'],
 'stakes/home':['{B} threatened the baby. {A} burned down the house {B} grew up in. Neither has walked a word of it back.','{W} takes the last word after the threat to the baby and the fire.'],
 'stakes/dog':['{B} cooked {A}’s dog and fed it to {A:them}. {A} asked for the collars so {B} couldn’t walk away.','The referee unclips the chain from both collars. {L} stays down, still wearing the collar.'],
 'stakes/crimes':['{A} kept committing crimes in the ring and evading arrest. {B} agreed to face {A:them} without the promotion’s sanction.','The promotion refused to sanction it. The people in the building still saw {W} get the last word.'],
 'stakes/custody':['{A} claims to be Dominik Mysterio’s biological father. The custody papers are suspended above the ring. Whoever unhooks them wins custody.','{W} leaves with custody of Dominik.'],
 'torch/movie':['{A} landed the lead in “All Things Through Christ.” {A} picked {B} to take {A:their} place on the wrestling show while {A:they} films.'],
 'dream/catering':['The argument over the catering meat ban got personal. {A} and {B} still owe the fans the best match they can give them.'],
 'shoot/fourth':['The contract is running out. {A} walks up to the hard camera with a list that starts with the promotion and gets all the way to whoever is holding the phone.'],
 'redemption/tape':['The replay of the loss to {X} ran until the hair came off. {A} has another chance and one less reason to watch the tape tonight.'],
 'redemption/balloon':['{A} came out for the main event with red hair and one balloon. There’s another balloon waiting just past the curtain.','After the win, {A} walks back out holding the second balloon.'],
 'hardcore/blood':['Being beaten bloody was the first lesson. The veteran had a few more to teach. The front row remembers every one.'],
 'rebrand/box':['The box is finally in the ring. The music has already changed, and someone inside is about to open it.'],
 'rebrand/shadow':['Every trip into the shadow realm brought {A} back a little stranger. The new voice is the last thing the crowd hasn’t heard.'],
 'peace/wood':['{A} left for a cabin and a lathe. The first chair {A} finished by hand is waiting in the locker room.'],
 'peace/nature':['{A} took the noise into the wilderness. The wrestler who came back can hear it without rushing to answer.'],
 'peace/nuns':['{A} stayed with the nuns long enough to learn what silence sounded like with other people in the room. The arena is considerably louder.'],
 'peace/zen':['{A} went looking for inner peace. The opponent is about to see how much of it survived the walk through the curtain.'],
 'twitch/fcw':['Fan Controlled {A} is live. The fans picked {S}, and their last vote decides what {A} takes away from the series.']
};

const ARC_REEL_VARIANT={
 "heelturn/runin":[
  "{B} never had a reason to look for {A} on the other side of the barricade. That’s where the camera finds {A} now.",
  ["{B} has an opening in the match. {A} is already on the way in.", ["Let the distraction come from someone {B} trusts", "{B} looks toward {A} for help. {A} pulls {B} out of position. The opponent seizes the opening {A} just handed over."], ["Put the whole run-in on the hard camera", "{A} trips {B} when the referee looks away. The other side takes over before {B} can get up."]]],
 "heelturn/postrunin":[
  "{B} expects {A} to come out to the ring after the match the way friends do. {A} is coming, all right.",
  ["The result is already on the board. {A} steps into the ring behind {B}.", ["Let {B} recognize the old greeting", "{B} turns at the familiar sound. {A} hits {B:them} before either can say a word."], ["Hold on the attack from the hard camera", "The crowd sees {A} knock {B} down from behind. Boos follow {A} all the way to the apron."]]],
 "betrayal/runin":[
  "{B} never gets a look at the floor on the side {A} has picked. It’s the same blind angle they used on other people for weeks.",
  ["{B} is right where {A} expected. The last step of the plan is just waiting for a cue.", ["Give {B} the old signal", "{B} looks for help when {A} gives the old signal. {A} grabs {B:their} ankle instead, giving the other side the opening it needed."], ["Let the camera catch the plan before {B} does", "The camera catches {A} waiting to trip {B}. The opponent takes control before {B} can recover."]]],
 "betrayal/postrunin":[
  "The match is over. {B} is still in the ring, exactly where {A} expected to find {B:them}.",
  ["{A} has been waiting for the referee to leave.", ["Show {A} waiting on the agreed cue", "The ref leaves. {A} comes through the ropes on cue and blindsides {B}."], ["Hold on {B} recognizing the plan", "{B} turns too late. {A} drops {B:them} and walks out without looking back."]]],
 "mentor/team":[
  "{B} has spent weeks drilling the same adjustment into {A}. Tonight they’re in the same corner and the other team is about to find out what stuck.",
  ["{O} is keeping {A} away from {B}. The old drill was for exactly this.", ["Make the opening with the old drill", "{A} uses the first adjustment {B} taught, slips the grip, and makes the tag."], ["Let the student call the combination", "{A} calls for the drill with one change. {B} sees it and hits the second half."]],
  ["The other side is starting to recognize the drill. {A} and {B} need one more change.", ["Let {B} hand over the last move", "{B} keeps the other corner busy. {A} uses the opening and sets up the fall."], ["Have them finish what they practiced", "{A} makes the change and {B} is there to finish the combination."]]],
 "mentor/violence":[
  "{A} used to apologize after a hard match. Tonight the lessons from {B} have to work against someone nobody expects {A} to beat.",
  ["{O} expects {A} to give ground in a rough match. {B} trained {A} for this moment.", ["Keep the hold when {O} fights back", "{A} holds on through the first counter and drives {O} back down when the second comes."], ["Make {O} back away first", "{A} uses {B}’s lesson to turn {O}’s charge into a hard landing. {O} backs away from the next exchange."]],
  ["{O} is waiting for the kind of apology {A} used to offer.", ["Cut straight to the last exchange", "{A} finds another opening and takes it before {O} can reset."], ["Let the crowd see what changed", "{A} goes right back into the exchange that would have ended the old match. This time {O} has to find a way out."]]],
 "dream/team":[
  "Fans spent years trying to book {A} and {B} together. Tonight they get both of them in the same corner.",
  ["The other team is about to see both stars reach for their signature exchange.", ["Let both stars hit their cues in turn", "The crowd gets the first signature and realizes the second one can still follow."], ["Turn both signatures into a tandem move", "One signature sets up the other. The other team has just enough time to see both coming."]],
  ["The other team is watching for the first signature again.", ["Let one signature make the opening for the other", "{A} starts the combination. {B} is already moving before the other side sees where the opening is."], ["Bring both stars into the last exchange", "{A} and {B} cut off the last escape together, leaving one clean opening for their team."]]],
 "torch/promo":[
  "{A} asked {B} to stand in the middle of the ring. There’s only one mic, and {A} has already decided who gets to leave with it.",
  ["{A} has the mic and the crowd knows who usually gets the last word.", ["Recall the first time {B} was ready", "“There was a moment when this whole place looked at you before it looked at me. I remember it.”"], ["Tell {B} what the spot costs", "“They’re going to ask you to carry the whole night. I know you can because I’ve been watching you do it.”"]],
  ["The crowd waits to see whether {B} gets the mic.", ["Pass the mic and step back", "{A} hands {B} the mic and steps out of the spotlight."], ["Give {B} the last word", "“You gave me this spot once. I know who’s ready for it now.” {A} hands {B} the mic. {B} takes it and faces the crowd."]]],
 "heelturn/promo":[
  "{A} and {B} walked out to the same music. {B} still thinks this is the part where they get to talk together.",
  ["{B} reaches to give {A} the mic like always.", ["Leave {B} standing with the offer", "{A} leaves {B} standing with the mic, then shoves {B:them} to the mat. The crowd catches on."], ["Let the turn interrupt the handoff", "{A} hits {B} before the mic changes hands. It takes the room a second to realize what it just saw."]]],
 "faceturn/promo":[
  "{A} asked for a mic and one chance to look {B} in the eye. The crowd has heard plenty from the old version.",
  ["{B} has every reason to walk out. {A} asks for one sentence first.", ["Apologize for the last time {B} needed help", "“I was there when it happened. I heard you call for somebody. I should have been that somebody.”"], ["Say what {A} is giving up", "“If doing the right thing costs me my place with them, they can have it. I’m here with you.”"]],
  ["{B} takes the mic. The whole building waits for an answer.", ["Let {B} accept the apology", "{B} says: “I can work with that. Next time I need somebody, I’m calling you.” {B} offers {A} a hand."], ["Let {B} set a condition", "{B} says: “Show up the next time it matters.” {A} nods and joins {B} in the same corner."]]],
 "betrayal/promo":[
  "{A} asked for the two of them to appear together. {B} still thinks the orders they gave backstage were for both of them.",
  ["The mic lowers. {A} already knows the exact cue.", ["Show that the interview was the trap", "{B} turns to the interviewer on cue. {A} hits {B:them} from behind and lets the mic hit the floor."], ["Let {A} give away how long it was planned", "“I asked for this time last week.” {A} lowers the mic and springs the ambush."]]],
 "breakup/promo":[
  "{A} and {B} asked for one last chance to talk after the losses. There is one entrance graphic and two wrestlers trying to get out from under it.",
  ["Somebody uses “we” out of habit. The other wrestler has been waiting for that word.", ["Make the last mistake about the team", "“Tell me the last time you meant both of us when you said that.”"], ["Let the partner finish the old line alone", "{A} starts the entrance line. {B} refuses to finish it. The crowd hears exactly where the team stops."]],
  ["There’s still one name on the entrance screen. Someone has to say what happens to it.", ["End it on the mic", "“I’m done carrying this team. Book us separately.” {A} puts the mic down between them."], ["Give both of them a word", "“You think I held you back?” {A} asks. {B} takes the mic. “We can find out. The team’s over.”"]]],
 "cult/match":[
  "{A} reached the followers one by one. Tonight two of them walk to the ring at exactly the same pace.",
  ["The other side thinks it has one of the followers isolated. Both partners hear the same signal.", ["Call a save on the signal", "The rescue arrives in unison. Nobody looks to the ref or asks whose turn it was."], ["Let the followers anticipate the signal", "Both move before {A} finishes giving the cue. Their opponents see it one beat late."]],
  ["The followers read {A}’s signal. Their opening is finally there.", ["Let the two followers make the save", "One keeps the other corner busy while the other opens a path for {A}."], ["Finish as a unit", "All three move on the same signal. The other side runs out of ways to cover the ring."]]],
 "faceturn/postrunin":[
  "{A} has spent weeks watching what happens to {B}. When {B} needs somebody tonight, {A} is the first one out.",
  ["The bell has rung. {O} goes after {B} again, and {A} comes down the aisle.", ["Get between {B} and the trouble", "{A} gets between {B} and {O} and drives {O} back up the aisle."], ["Take the hit meant for {B}", "{A} takes the shot {O} meant for {B}, then forces {O} away from the ring. {B} gets back up to a cheer."]]],
 "heelturn/team":[
  "{B} still expects {A} in the same corner after the match.",
  ["{A} waits until the other side clears the ring.", ["Make {B} reach for a handshake", "{B} reaches for the hand that was always there. {A} leaves it hanging, then drops {B} the moment {B:they} turns away."], ["Hit {B} in full view", "{A} knocks {B} down in the middle of the ring. The crowd sees the whole thing."]]],
 "betrayal/team":[
  "{A} and {B} used to take shortcuts for each other. Now {A} has one more planned.",
  ["{A} has been waiting for the referee to leave.", ["Show {A} waiting on the agreed cue", "The ref leaves. {A} comes through the ropes on cue and blindsides {B}."], ["Hold on {B} recognizing the plan", "{B} turns too late. {A} drops {B:them} and walks out without looking back."]]],
 "mentor/fraud":[
  "{A} confronts a childhood hero, {B}, with the part of the footage {B} cut.",
  ["The replay shows {B} claiming there’s no counter to the sequence. {A} invites {B} to try it.", ["Let {B} start the sequence", "{B} starts it the way it looked on tape. {A} slips the grip where the tape used to cut off."], ["Show the missing counter in one shot", "{A} runs the whole sequence with {B}, including the counter the edited footage never showed."]],
  ["{B} has to finish the match with the whole building knowing the trick.", ["Let {A} ask for the real footage", "{A} looks toward the camera and motions for the full replay. {B} looks the other way."], ["Leave the whole sequence on screen", "The broadcast plays the old edit beside the live counter. The crowd sees exactly where {B} cut it."]]],
 "voice/taxidermy":[
  "",
  ["{B} has heard about the workshop. {A} brings a framed brass nameplate to the interview.", ["Set the nameplate down between them", "“I’ve got one space left on my wall, {B}. I cut the brass to fit your name. You’re going to be my ultimate trophy.”"], ["Make the threat without a prop", "“The others were practice. I’m going to stuff you, {B}, and give you the best spot in the workshop.”"]],
  ["{B} takes one step toward {A}. The nameplate stays between them.", ["Make the threat specific", "“Get in the ring with me. Bring all those people who paid to see you. I want witnesses when I claim my trophy.”"], ["Let {B} answer", "{B} pushes the nameplate back. “The next time you bring that thing, I’ll make you swallow it.”"]]],
 "shoot/fourth":[
  "",
  ["{A} finds the hard camera before the promo can go where it was supposed to.", ["Start with the office", "“This promotion calls itself home until the money comes due. You, the booker, kept promising me a spot you already gave away.”"], ["Talk straight to the booker", "“You pick who gets a mic, who gets a belt, and who disappears. My contract’s up. You can’t make me thank you for it.”"]],
  ["{A} looks straight into the lens again, this time past the people on the stage.", ["Address the person holding the phone", "“And you, with the phone in your hand. You put me in this ring with two taps. Now put the phone down and go spend some time with the people who matter.”"], ["Make the booker and the player the same person", "“You want to know who I’m talking to? Whoever’s holding the phone and booking my last week. I see you.”"]]],
 "heelturn/watch":[
  "",
  ["{B} asks if {A} can get through one conversation without looking at the watch.", ["Check the time before answering", "{A} looks at the watch. “I make time for people who matter.” {A} knocks the mic out of {B}’s hand and hits {B:them}."], ["Let {B} interrupt the sales pitch", "{B} asks {A} to stop talking about the watch. {A} stops and hits {B:them} instead."]]],
 "rebrand/box":[
  "",
  ["The lid lifts. {A} steps out of the box and into the new entrance lights.", ["Let the new look speak first", "{A} waits on top of the box until the whole arena has a clear look at the new gear."], ["Let the new voice out first", "“You spent weeks asking what was in here. I was waiting for you to come close enough to hear.”"]]],
 "rebrand/shadow":[
  "",
  ["{A} steps through the light. When the mic comes up, the change from the shadow realm is in every word.", ["Let the crowd hear the new voice", "“You called for me to come back. Did you think I’d come back the way I left?”"], ["Make the new look and voice arrive together", "{A} lowers the hood. “You spent all those weeks looking for the old me. Have a good look now.”"]]],
 "rebrand/promo":[
  "",
  null,
  ["The new look is out in the open. {A} has one more chance to tell the room who walked in.", ["Say what the old version left behind", "“You’ve seen the last of the wrestler who used to walk out here. Look at me when this music hits again.”"], ["Let the room see it before the name arrives", "{A} takes one last look at the old graphic as the new colors take over the screen. The name can wait."]]],
 "breakfree/promo":[
  "{B} expects {A} to take the blame in front of the whole faction again.",
  ["{B} holds out the mic. “Tell them who lost us that match.”", ["Refuse to take the blame", "“I took the fall. You took the credit. I’m done doing both for you.”"], ["Take the mic and answer the order", "{A} takes the mic. “Tell them yourself. You don’t speak for me anymore.”"]],
  ["{B} calls for {A} to get back in line.", ["Walk out on the leader", "{A} puts the mic down and walks out while {B} is still shouting."], ["Make the split public", "“Next time you want me in your corner, check which side of the ring I’m standing on.”"]]],
 "cult/promo":[
  "{A} recruited the followers one by one. Tonight the group has to speak for itself.",
  ["{A} hands the mic to the first follower.", ["Ask for a public vow", "{B} says: “I was there on the first night. I’m with you now, in front of everybody.”"], ["Let the followers start the refrain", "{A} holds the mic out. Before {A:they} can speak, the followers answer, “We stand with you.”"]],
  ["Everyone waits to see what the followers do with the mic.", ["Let them name their leader", "{B} says: “{A} brought us here. {A} leads us from here.”"], ["Let them vow to stay together", "“This started with one of us. Wherever {A} goes now, the rest of us follow.”"]]],
};

const HR_CROWD_HEAT={
 tech:['The Technical fans are following the grip fight.',
  ['Trade counters without a reset','Each wrestler adjusts once, then again. The crowd applauds before either can break away.'],
  ['Bring the early counter back with a new exit','{A} changes one part of the old sequence. The Technical section sees it and comes up first.']],
 flip:['The Flippy section comes to its feet when {A} looks up.',
  ['Keep the aerial exchange in one shot','{A} lands and turns straight into the next exchange. The Flippy section stands through both.'],
  ['Give the hard camera the biggest jump','The hard camera catches all the height and the crowd has time to get loud before {A} lands.']],
 blood:['The Bloodhounds start pounding the rail when {A} gets back up.',
  ['Let the crowd see {A} ask for another exchange','{A} looks tired enough to stop and asks for one more anyway. The rail starts shaking.'],
  ['Fight all the way back to the middle','{A} absorbs the pressure and comes forward. The Bloodhounds are still standing when both get back to center.']],
 chaos:['The Chaos fans rise as the fight starts moving faster than the camera.',
  ['Keep the pace through the scramble','Both are moving before the camera can cut. The crowd follows the whole exchange on its feet.'],
  ['Let one surprise feed another','Everybody looks one way. Two moves later the whole section is looking somewhere else and yelling.']],
 cas:['The Casual fans have a clear view of {A} and the trouble ahead.',
  ['Give the crowd a clear comeback cue','{A} stops long enough to make eye contact with the front row. The crowd gets loud before the first move back.'],
  ['Let the opponent celebrate one beat too soon','The celebration turns to disbelief before anybody has to explain what changed.']]
};
const BLOOD_DIRTY={
 std:'{P} grabs the ropes while pinning {L}. The referee sees the shoulders and counts three. The replay shows what held them down.',
 sub:'{L} taps while holding the bottom rope. The referee missed the grip and awards the match to {W}. The replay shows why the other side protests.',
 twoof3:'{P} scores the second fall for {W}. The replay shows {L}’s shoulder coming up before three.',
 tornado:'{P} pins {L} using the ropes for leverage. The referee is watching the shoulders and misses the grip.',
 iron:'The clock should be at zero when {P} scores. An extra second stays on the display, and the referee awards the deciding fall to {W}. The other side points to the timekeeper.',
 nodq:'{P} covers {L}. The replay shows a shoulder coming up before three, but the referee has already awarded the match to {W}.',
 falls:'The official counts three for {P} in the aisle with a piece of equipment blocking the view. The replay shows {L} was off the floor before the third count.',
 street:'The referee counts three for {P} amid the wreckage. From the other camera, {L}’s shoulders were up. The other side is demanding a review.',
 tables:'A table breaks beneath {L} as it gives way on its own. The official thinks {P} drove {L} through it and gives the win to {W}. The replay shows otherwise.',
 lights:'{P} covers {L} under the work lights. The referee counts three, but the replay catches {L} getting a shoulder up in the dark.',
 dog:'{P} pins {L} while holding the chain against the ropes for leverage. The ref counts three. The replay catches the grip.',
 iquit:'{P} says “I quit” first, but the mic cuts out. The floor camera catches the words. The referee hears nothing and lets them go on. Later {L} says it into the working mic. The referee awards the match to {W}.',
 lms:'The referee jumps from eight to ten as {L} is getting up. {W} gets the decision. The other corner counts it back out loud.',
 texas:'The referee starts the ten count before {P} has scored the fall. {L} is getting up when the ref reaches ten and gives {W} the match.',
 barbed:'The official counts a pin for {P} through the smoke. The replay shows {L} had a shoulder clear.',
 ladder:'{PRIZE} comes loose when the rig drops. {P} catches it. The referee rules that {P} unhooked it, and the replay shows why the other side disputes the win.',
 cage:'The referee counts the pin for {P} inside the cage. The replay catches {L} lifting a shoulder well before the count. Nobody had to get through the door to spoil the ending.',
 coffin:'The referee awards {P} the win as the lid comes down. The replay shows {L} wedged a hand in the gap and the lid never closed.',
 anarchy:'The referee calls a pin for {P} in the crowd. The close camera shows {L} roll clear while someone is blocking the official’s view.',
 stampede:'The floor referee calls the fall for {P}. A second stadium feed shows {L} escaping before three.',
 bng:'The referee hears a surrender and calls the match for {W}. The cage mic shows the voice was someone outside the losing team. They never gave up.'
};

const HR_ARC_MISS={
 heelturn:['The camera catches the blow a fraction late. {B} looks up and knows it was {A}.','The turn is clear. The crowd starts booing after it has already missed the close-up.'],
 faceturn:['{A} is a step late getting into position. {B} sees who came to help even if half the room misses it.','The olive branch goes over quietly. {B} accepts it in front of an audience still catching up.'],
 betrayal:['The cue is visible a beat too early. Everybody sees it coming except {B}.','{A} gives {B} a moment to understand it. The audience takes longer.'],
 tap:['The hold has to be adjusted. The ref waits while both find the position again.','The camera loses sight of {L}’s hand as the referee crouches to check the hold.'],
 torch:['{B} gets there just a beat late. The crowd takes another exchange to see what {A} is giving {B:them}.','{A} gives the blessing. The crowd applauds slowly, as if some of them need to hear it twice.'],
 number:['The escape is messy enough to give the trick away. {A} still gets another shot at the opening.','The Dead Number lands a little awkwardly. The replay lets the crowd see how it countered the old move.'],
 voice:['{A} gets the words out, but the audience is still laughing at the previous line.','The room is quiet enough for the last line. It stays quiet a little longer than {A} hoped.'],
 breakfree:['The break comes when part of the room is still watching {B}. The fans catch up as {A} turns away.','{A} makes the break clear. The cheer comes in pieces before {A} reaches the curtain.'],
};

/* These consequences happen even when a presentation call falls flat. */
const ARC_REEL_CLOSE={
 heelturn:reel=>reel.a.sl==='watch'
  ?'{B} reaches for {A} from the mat. {A} checks the watch instead and walks out.'
  :reel.variant==='runin'?'{B} points at {A} from the ring. “You cost me the match.” {A} keeps walking.'
  :'{A} leaves without looking back at {B}. They’re on opposite sides now.',
 faceturn:reel=>reel.a.sl==='love'
  ?'{B} takes {A}’s hand. “I know what it cost you to stand beside me. I wanted you there.”'
  :'{A} makes a point of leaving with {B}. The next time they come out, everyone knows which side {A} is on.',
 betrayal:reel=>{
  if(reel.a.sl!=='policy')return reel.variant==='runin'
   ?'{B} shouts after {A}, “We were partners. You cost me my match.” {A} doesn’t look back.'
   :'{A} walks away from the partnership and leaves {B} to answer for it alone.';
  const b=S.w[reel.a.b];
  return b?.own==='p'&&!Object.values(S.titles).some(t=>t.holders.includes(b.id))
   ?'The medics take {B} out on a stretcher. {A} makes a call from the aisle. “I’d like to file a claim.”'
   :'{A} holds up the policy so {B} can finally see whose name was on it.';
 },
 voice:reel=>reel.a.sl==='stutter'
  ?'{A} waits through the silence, finds the next word, and finishes the callout. This time the room waits to hear every word.':'',
 mentor:reel=>reel.a.sl==='bastard'
  ?'{A} offers {B} a hand after the bell. “I spent weeks fighting you over the truth. I know who you are to me now.”'
  :reel.variant==='team'?'{B} points to {A} as the referee raises their hands. The student knew what to do with the opening.':'',
 ironman:reel=>reel.a.sl==='smile'?'{A} gets to the ropes, looks up, and breaks into the smile the crowd has been waiting weeks to see.':'',
 proveit:(reel,m,w)=>m.nc?'The fans that came for {B} still applaud {A} for making them watch.':w.includes(reel.a.a)
  ?'{A} beat their favorite, and the {G} fans give {A} a chant of {A:their} own.'
  :'{A} leaves without the win. The {G} fans who came for {B} stay on their feet for {A}.',
 cross:reel=>reel.a.sl==='statusquo'
  ?'{A} points to the {G} section. They got behind the match as soon as {A} wrestled in a style they recognized. That’s the audience {A} was trying to reach.':'',
 trial:reel=>reel.a.sl==='mountain'?'{A} takes one breath at the bell, just as the old man taught. The calm under pressure made the difference against {O}.':'',
 school:reel=>reel.a.sl==='manifest'
  ?'The replay catches {A} holding the grip and waiting. The flicker of power comes on cue, just long enough to escape, then stops when {A} lets go.'
  :'{A} shows the crowd the adjustment one more time in the replay. The part of {S} that used to trip {A:them} up is the part {A:they} now knows how to handle.',
 tap:reel=>reel.a.sl==='hell'?'{A} tells the ringside camera that the final lock was the hold brought back from hell.':'',
 team:reel=>reel.a.sl==='blood'
  ?'{A} and {B} raise their hands together. “That fight’s over. From here on, you book us as a team.”'
  :'{A} and {B} tell the camera they’ll be coming back as a tag team.',
 faction:reel=>reel.a.sl==='cult'
  ?'{B} and {C} repeat {A}’s vow together. “We follow {A}.” The three leave as a faction.'
  :'{A}, {B} and {C} tell the crowd that this is their new faction. They walk out together.',
 join:reel=>reel.a.sl==='love'
  ?'{B} gives {A} the faction shirt. “You came here because you fell for one of us. You earned your place with all of us.”'
  :'{B} hands over the shirt and makes the announcement. {A} is officially in {F}.',
 retire:'{L} leaves the ring for good. The loser’s career was the price of this match.',
 stakes:reel=>reel.result.length?'':'{L} has to face the crowd after losing the fight and the bragging rights.',
 dream:reel=>reel.variant==='team'?'{A} and {B} raise each other’s hands. The two signatures worked better together than either did alone.':'',
 farewell:reel=>reel.a.sl==='demons'
  ?'{A} takes the mic one last time. “I thought I owed this place one more win. I owed it a goodbye.” {A} leaves the boots in the ring and walks out at peace.'
  :'{A} leaves the boots in the ring. This was the last match.',
 cult:reel=>reel.variant==='match'
  ?'{B} and {C} stand on either side of {A} at the bell. They announce they’re staying together as a faction under {A}’s lead.'
  :'{A} calls {B} and {C} forward and offers both a place in the faction. They raise their hands and accept together.',
 redemption:(reel,m)=>reel.a.sl==='tape'
  ?m.sides.filter((side,i)=>i!==m.winner).flat().includes(reel.a.foe)
   ?'{A} points at {X} as the replay goes up. The wrestler from the tape is the one {A:they} finally beat.'
   :'{A} looks into the camera. “I came back to beat {X}. I couldn’t get that match tonight, but I still got the win I needed.”'
  :reel.a.sl==='shoot'?'{A} stays out for the applause after the win. The trial and the rehab were what it took to be allowed back out here.':'',
 streak:reel=>reel.a.sl==='pinfall'?'{A} points to the referee as the streak continues. Those two straight pins were the reason {A:they} started this run.':'',
 comeback:reel=>reel.a.sl==='dirk'
  ?'{A} touches the tape on one wrist, where Dirk’s name is written. “I wanted you to see me make it back.”'
  :'{A} won on PPV. The injury and the work to come back are behind {A:them}.',
 absolute:(reel,m,w)=>m.nc?'Both are still looking at the belt as the officials separate them.':w.includes(reel.a.a)
  ?'{B} tried to take the belt and {A} found another way to keep it.'
  :['dq','co'].includes(finOf(m))?'{B} got the win. {A} still has the belt and uses that fact to taunt {B} on the way out.'
  :w.includes(reel.a.b)?'{B} finally stopped {A} and walks out with the title.'
  :'{A} looks for the title. It’s already on the other side of the ring.',
 techshow:reel=>reel.cast.stip==='iron'
  ?'The replay shows the grip change that made the difference in the falls before time expired.'
  :'The replay shows the adjustment that scored the second fall. The first one set it up.',
 hometown:reel=>reel.a.sl==='proveit'?'{A} finds the friends and family who came to see if all that time away was worth it. They’re still on their feet.':'',
 townhero:'The hometown section starts chanting for {A}. {B} hears a chant from home turn into one for somebody else.',
 breakup:reel=>reel.a.sl==='toxic'
  ?'{A} says the relationship is over as well as the tag team. “I’ve met somebody else. I’m done being treated like this.”'
  :'{A} and {B} leave separately. They’re done taking bookings as a team.',
 reunion:reel=>reel.a.sl==='toxic'
  ?'{A} says the old relationship is over. {B} reaches for {A}’s hand. They came back to the same corner because they wanted to be there together.'
  :'{A} and {B} tell the camera the reunion lasts past tonight.',
 copycat:(reel,m,w)=>m.nc?'Neither version got a decision. The crowd leaves arguing over who made the act work.':w.includes(reel.a.a)
  ?'{A} wins using the act {B} used to own. The front row repeats the catchphrase for the copy.'
  :w.includes(reel.a.b)?'{B} gets the better of the imitation. This time the crowd asks the original to finish the line.':'The other side wins while both versions are still trying to outdo each other.',
 factionwar:(reel,m)=>m.nc?'Both factions pull their wrestlers apart. Neither group got a decision.':
  '{W} took the match. {F} and {F2} still have people waiting for each other in the aisle.',
 groundswell:reel=>reel.a.sl==='social'?'{A} lifts a sign with the words that started showing up online. The crowd turns the same words into a chant.':'',
 breakfree:reel=>S.teams.some(t=>t.m.includes(reel.a.a)&&t.m.includes(reel.a.b))
  ?'{A} makes it official on the mic. “Count me out of your group.”'
  :'{A} tells {B} to find somebody else to blame. The next time they come out, they’ll be on opposite sides.',
 lastchase:reel=>!reel.decision&&reel.a.sl!=='hangup'?'{A} looks back at the ring on the way out. It was one more chance at the gold.':'',
 likeness:'The announcer reads the result of the signed contract. {F} can now sell {B}’s likeness for eight weeks.',
 pain:'{A} finally lets the trainer have a look. Getting through the match took everything, and {A} needs a week to heal.',
 oil:'{B} says the little oil kept the lights going longer than it should have. {A} looks back at the ring. “Now I get it. We shouldn’t have had enough left either.”',
 peace:reel=>reel.a.sl==='wood'?'{A} takes a seat in the first chair {A:they} made. “Spent a long time learning I couldn’t rush a good thing.”':'',
 twitch:reel=>{
  const trait=arcChatTrait(reel.a,S.w[reel.a.a]);
  return trait?`The final poll goes live on the screen. Chat picked ${TRAITS[trait].n} for {A}.`
   :'Chat votes for more time in the ring and on the mic. {A} gets the work in both instead of taking on a new trait.';
 }
};

/* Blood feud beats are separate from the stipulation beats used by arc payoffs. */
const BLOOD_BLOWOFF={
 std:{
  heat:['The referee keeps asking for a break. Every time they get one, {A} and {B} go straight back to each other.',
   ['Let the body shots take their toll','{A} digs in with a shot to the ribs. {B} loses a breath, gives one back, and both have to take a step before they can swing again.','They trade glancing shots. Both stay upright, close enough for the referee to get between them.'],
   ['Trade lariats in the middle','{A} and {B} hit each other flush. Both hit the mat. One gets a shoulder up off the canvas just to look at the other.','They clip shoulders on the charge. Both stagger to opposite ropes and turn around to try again.']],
  decisive:'{P} stops {L} cold with a short lariat. The sound of the landing carries through the pause in the crowd.',
  breakdown:'The referee gets between them once. {A} and {B} surge past the official, and the crew pours into the ring.'
 },
 barbed:{
  heat:['The first blast rattles the camera. Smoke hangs over the wire and a line of blood runs into the tape at {A}’s wrist.',
   ['Fight out of the wire','{B} is trapped against the wire for a beat. When both stumble clear, a strip of gear stays caught behind them.','{B} slips away before hitting the wire. The crowd can see how close it came.'],
   ['Let the blast swallow both rivals','A white flash wipes out the picture. The camera comes back to both wrestlers on the canvas, smoke rolling over them and blood on the mat between them.','The blast goes off as both pull up short. Through the smoke, neither can see the other well enough to follow.']],
  decisive:'{L} lurches out of the smoke and straight into {P}’s finishing slam. The wire is still shaking when the referee drops beside them.',
  breakdown:'The smoke clears on two wrestlers still reaching for each other. The referee waves both corners back and signals to stop it.'
 },
 texas:{
  heat:['There’s already blood on the canvas. The referee starts the count after a fall, and {A} and {B} are both listening for nine.',
   ['Give the count one ugly escape','At nine, {B} gets to unsteady feet. {A} steps in again, and the next exchange ends with both dropping beside a crushed trash can.','The count gets to seven before {B} stands. {A} has to find something worse if this is going to stick.'],
   ['Bring the fight down on the steel','The scramble spills across the steps and the remains of a table. Blood darkens the wood as both wrestlers drag themselves back toward the ring. Nobody looks ready to beat another count.','They reach the steps and lose their grip on each other. The collision everyone braced for never comes.']],
  decisive:'{P} puts {L} down hard amid the wreckage. {L} reaches up for something to pull on and finds nothing but the apron.',
  breakdown:'Officials crowd the apron as both wrestlers keep reaching through the wreckage. The referee stops it before another fall can be scored.'
 },
 lights:{
  heat:['The work lights come up on bare boards and torn canvas. The people who fought for this match don’t wait to see who’s watching.',
   ['Let the ring come apart around them','{A} drives {B} down onto the exposed boards. The hollow crack carries past commentary. {B} rolls over with blood on the side of the face.','They collide beside the torn canvas. Both get enough of a grip to keep from hitting the boards.'],
   ['Follow the fight into the dark','The camera loses both beyond the lights. Something metallic crashes. When the wrestlers come back into view, one is dragging the other by a fistful of ruined gear.','The picture loses them past the work lights. They come back separated, both waiting for the other to step in first.']],
  decisive:'{P} catches {L} with one last slam on the boards. For a beat the work lights are the only things still moving over the ring.',
  breakdown:'The brawl disappears past the work lights and the referee loses sight of both sides. The bell stops the match. The shouting beyond the light goes on.'
 },
 iquit:{
  heat:['The microphone is close enough to catch a ragged breath. A drop of blood hits the canvas while the referee waits for an answer.',
   ['Leave the mic on through the refusal','{B} takes a hard shot and folds over the ropes. The ref puts the mic in close. “Ask me when I can’t get up.” {B} pulls upright again.','{B} knocks the mic away before the referee can get an answer. The mic thumps against the mat.'],
   ['Make them fight over the microphone','{A} and {B} crash into the steps reaching for the mic. The feed catches a sharp breath and cuts to the referee holding the question open. Neither gives in.','The mic scrapes against the steps and the feed buzzes. The referee pulls it clear before putting the question again.']],
  decisive:'{P} pulls {L} back into the hold. The referee has to lean close to hear any words through the crowd.',
  breakdown:'{A} and {B} keep fighting after the microphone skids out of reach. The referee waves the officials in and ends it without a surrender.'
 },
 lms:{
  heat:['The referee is up to eight. One wrestler is trying to push upright beside the wreckage and keeps getting only one knee off the floor.',
   ['Stand at nine and go again','The hand comes off the floor at nine. The first shot back rattles both wrestlers against the rail, and the front row starts the count all over again.','The wrestler up at nine is too unsteady to follow through. Both back off while the referee resets the count.'],
   ['Put both sides down in the wreckage','The collision knocks them into the announce desk. The referee starts counting with the monitors on the ground and both wrestlers trying to turn over.','The desk shifts as they hit the edge, but both catch enough of it to stay up. The referee backs away.']],
  decisive:'{P} drives {L} down one last time and uses the barricade to stay upright. At nine, {L} gets one elbow off the floor and slips back down.',
  breakdown:'Officials pour in while the fight is still moving. The referee waves off the match before anyone stays down for ten.'
 },
 dog:{
  heat:['The chain goes taut and pulls both wrestlers short. Blood is already spotting the canvas underneath it.',
   ['Make the chain drag them back together','They try to get away in opposite directions. The chain catches and brings them back into a furious exchange at arm’s length.','The chain snags on the bottom rope. Both stop to pull it clear, glaring across the slack.'],
   ['Cut off an escape with the chain','{B} thinks there’s a step left to retreat. The chain snaps taut and {A} is on top of {B:them} in the corner. The crowd hears the steel hit the canvas when they go down.','The chain goes tight a beat too soon and both stumble to a knee. The fight starts again from there.']],
  decisive:'{P} catches {L} trying to get distance. The chain draws them back in range for one last blow, and {L} drops.',
  breakdown:'The officials can’t get them apart with the chain still on. The referee calls it off and sends both corners in to help separate them.'
 },
 cage:{
  heat:['The locked door rattles with every collision. The referee has to step over a loose strip of tape as the fight comes back into the middle.',
   ['Ram the rivalry into the mesh','The cage booms and rocks. {B} comes off the steel with a smear of blood over one eye, still swinging.','Both turn their shoulders in time. The mesh shakes, but neither takes the full impact.'],
   ['Make the wall stop their momentum','{A} and {B} collide against the wall so hard the camera beside it shakes. Both stumble off the steel and meet again before either can catch a breath.','One hits the wall alone and slides down it. The other gets close, then has to back off from a swing.']],
  decisive:'{P} cuts off {L}’s last charge and sends {L} crashing into the steel. The cage is still ringing when they hit the mat.',
  breakdown:'The referee signals through the mesh. Officials get the door open after the bell and step between the wrestlers.'
 },
 street:{
  heat:['The fight has left a trail of broken ringside gear. A bent trash can rolls down the aisle and neither side gives it room.',
   ['Drive the brawl back through ringside','A shoulder sends the barricade sideways. The next shot flattens the trash can against the floor, and the wrestlers are still coming forward.','The barricade shifts but stays up. The wrestlers have to turn around and find each other through the gap.'],
   ['Crash into the announce desk','The desk gives way under the collision. Commentary drops out for a beat, and the strongest sound on the feed is someone trying to breathe.','They hit the edge and slide off opposite sides. The desk stays up, and both climb back into view.']],
  decisive:'{P} catches {L} in the middle of the wreckage with a finishing slam. The referee drops right beside the broken desk.',
  breakdown:'The brawl goes past the wreckage with officials in pursuit. The referee calls it off as people from both corners try to clear the aisle.'
 },
 bng:{
  heat:['The last gate shuts. The camera goes wide and finds one ring smeared with blood and the other full of wrestlers trying to reach their teammates.',
   ['Send the rescue through the gap','The cage shakes as the save cuts between rings. The teammate who needed help is still down, but the other side has to turn and fight for the space again.','The rescue runs into bodies between the rings. The trapped teammate has to crawl clear on their own.'],
   ['Make the whole cage shake','The two fights slam into the steel almost together. A chair skids across the gap. One team clears the near ring and the other can suddenly see who’s isolated.','The teams reach the gap out of step. Half the charge stops at the ropes while the fight goes on around them.']],
  decisive:'{P}’s side isolates {L} against the steel. {L} sees one teammate still taking punishment in the next ring and signals to the referee.',
  breakdown:'The referee calls it off and signals for the gates. The officials come in as the teams shout across the gap.'
 },
 anarchy:{
  heat:['The broadcast can’t stay with one camera. A fight batters through the lower bowl while another knocks the entrance rig sideways.',
   ['Cut between the two fights','The aisle camera catches a body slamming through a rail. The stage camera finds a teammate answering with a running shot that sends the opposite corner into the set.','The camera cuts a beat late. It catches both fights reforming, with the crowd already pointing to the next collision.'],
   ['Bring the fights together on the floor','Both fights hit the same stretch of floor. A stack of chairs goes over and the crowd stumbles back as a save turns into another brawl.','They reach the same aisle from either side, but the railing keeps the fights apart. The broadcast has to keep cutting.']],
  decisive:'{P} sends {L} crashing onto the arena floor just as the other fight spills into view. The nearest referee gets down beside them.',
  breakdown:'The referees lose control of the floor as the fights split again. The bell calls it off, but both sides still have people fighting on different cameras.'
 },
 stampede:{
  heat:['One feed shows the field. Another catches a fight coming out of the service tunnel. The stadium is too big for any one camera to keep up.',
   ['Make the tunnel fight spill out','The tunnel door bangs open under the weight of the collision. One wrestler tumbles onto the turf and the rest of the fight comes out behind them.','The camera waits outside the tunnel. The fight goes the other way and has to be picked up on a second feed.'],
   ['Bring both sides together at field level','Two feeds converge on the same tackle. Bodies and equipment go down at the mouth of the tunnel, and only one team gets back to the field together.','The teams take different exits. By the time the wide shot finds them, both sides are regrouping across the turf.']],
  decisive:'{P} intercepts {L} coming out of the tunnel and drives {L} down onto the turf. The stadium camera stays wide as the referee runs in.',
  breakdown:'Officials stop the match as the teams scatter down separate tunnels. The stadium feed keeps finding fights after the decision is off.'
 },
 falls:{
  heat:['The referee follows the brawl off the arena floor. On the screen, the crowd sees {A} and {B} pass the concourse before either thinks to look back.',
   ['Take it through the concourse','A running collision sends both into a stack of equipment cases. The referee gets low enough to see if anyone can make a cover right there.','The cases roll apart before the charge hits. The fight keeps moving through the concourse.'],
   ['Follow the impact backstage','The backstage camera turns at the crash. {A} and {B} are on the concrete beside an overturned cart, and the referee never stops running toward them.','The cart rolls out of the way and both wrestlers miss the collision. They keep going past the camera.']],
  decisive:'{P} drops {L} onto the concrete beside the loading doors. The referee is close enough to count the cover where it happens.',
  breakdown:'The fight disappears through a service door. The referee calls it off in the hallway, with neither side there to take a fall.'
 },
 nodq:{
  heat:['The referee sees the chair come up and backs out of the way. {A} and {B} both know there won’t be a warning.',
   ['Fight over the chair','The fight over the chair ends with a clang and two wrestlers down. The referee keeps watching for a cover through the noise.','The chair skids under the ropes before either gets to use it. Both have to go back to their hands.'],
   ['Let the weapon swing turn the fight','The chair shot rings out. The wrestler who took it catches the ropes, answers with a desperate shot, and both go down beside the bent seat.','The swing hits the turnbuckle instead. Both back away from the rebound and come in again.']],
  decisive:'{P} cuts off {L}’s comeback with a blow that leaves the chair folded on the canvas. The official watches for the cover.',
  breakdown:'The referee calls it off when both corners pour into the ring. Nobody has been disqualified and nobody gets the win.'
 },
 coffin:{
  heat:['The lid is open. When the fight reaches the side of the coffin, the front row hears the wood take the weight of both wrestlers.',
   ['Fight at the lip of the coffin','{A} and {B} slam against the coffin hard enough to shift it. An arm disappears over the lip, then comes back out with a grip that keeps the lid open.','The coffin slides away from the collision. Both stumble back to the apron with the lid still open.'],
   ['Make the lid crash just short','The lid hits the rim with a crack as the wrestler inside rolls over it to the floor. The crowd hears the crash a beat before it sees the escape.','The lid drops partway and catches. Both wrestlers back away before either can take advantage.']],
  decisive:'{L} braces on the rim of the open coffin. {P} drives the fight right to the lip, and {L}’s grip gives.',
  breakdown:'The lid is still open when both sides crash to the floor. The referee waves it off as officials rush in.'
 },
 ladder:{
  heat:['A ladder lies twisted at ringside. The one under {PRIZE} is still upright, and both sides are coming back for it.',
   ['Make them fight for the same rung','The ladder bucks with every shot. Both wrestlers slide down a rung and hook an arm through to keep from falling.','One lets go early and drops to the canvas. The other stays on the ladder long enough to steady it.'],
   ['Send the climb crashing down','The ladder tips. Both hit the canvas, and the ladder lands hard enough beside them to drown out the first reaction from the crowd.','They spot the tilt in time and climb down opposite sides. The ladder wobbles itself still between them.']],
  decisive:'{P} sends {L} tumbling off the ladder. The base of the ladder jumps off the canvas. {P} steadies it for the last climb.',
  breakdown:'The ring fills with officials after the last ladder goes over. {PRIZE} is still hanging when the referee stops the match.'
 },
 tables:{
  heat:['A table is standing on the floor. The wrestlers keep getting close enough to see the grain in it and pulling each other back.',
   ['Fight on the edge of the table','The tabletop groans as the weight shifts. Both wrestlers roll off beside it, and the crowd’s gasp turns into noise when they see it’s still standing.','One wrestler steps clear early and the edge of the table just catches the other on the way past.'],
   ['Let the table break a beat too early','The legs give way under the struggle. Both crash to the floor beside the splinters. The referee waves it on and the other table comes into view.','The table slides out of reach. They hit the floor hard, and the table is still intact.']],
  decisive:'{P} staggers up first and gets between {L} and the ropes. The table is right behind them.',
  breakdown:'They tumble off the apron beside the table. The referee calls it off with the table still intact.'
 },
 twoof3:{
  heat:['It’s one fall apiece. Every grip is slower now, and both wrestlers know which exchange the other one wants to bring back.',
   ['Make the old counter hurt','The first-fall counter comes back and sends both down hard. They know the position well enough to escape, but getting up is a different matter.','They feel the counter coming and break away before either can take the fall.'],
   ['Fight through the last reversal','The first wrestler slips the grip and walks straight into the return. Two hard takedowns later, both are reaching for the ropes.','The second reversal comes a beat late. They land awkwardly and have to square up again.']],
  decisive:'{P} catches {L} in the exchange that cost the first fall. This time the counter leaves {L} flat on the canvas.',
  breakdown:'At one fall each, the referee loses control of the exchange and waves it off. Neither side gets the second fall.'
 },
 iron:{
  heat:['It’s one fall apiece. There’s barely time left, and both wrestlers stand up as if they’ve already been counted down.',
   ['Make the last minute a fight for position','{A} and {B} trade takedowns that would have been sharp an hour ago. The second landing is heavy enough to stop the crowd counting down for a beat.','They drag each other down without getting control. The clock keeps running.'],
   ['Sprint on legs that won’t cooperate','They hit the ropes once at full speed. The impact drops both wrestlers and a few seconds go by before either can turn over.','They try to sprint out of the break and both stumble. The clock takes more time than either has to give.']],
  decisive:'{P} makes one last adjustment on the canvas. {L} tries to turn a shoulder and can barely move it.',
  breakdown:'The referee waves it off while the clock is still running. The scoreboard never gets a deciding fall.'
 },
 sub:{
  heat:['The referee crouches beside the hold. The only sounds close to the mat are a quick breath, a shoe scraping, and the crowd calling for the escape.',
   ['Roll the escape into another hold','The first hold comes loose and the next one bites immediately. The wrestler caught in it can only drag one leg back toward the ropes.','The first escape works. Neither can get the second hold on before they have to reset.'],
   ['Make the fingertips miss the rope','Fingers catch the fringe of the apron. The grip slips away, and the referee gets close enough for the crowd to see the free hand trembling.','The rope comes into reach and the referee forces the break. Both stay down for a moment even after the hold comes off.']],
  decisive:'{P} pulls {L} away from the last rope break and locks the hold back in. The referee stays where the free hand is visible.',
  breakdown:'Neither will give the official room to separate them. The referee calls it off without a tap.'
 },
 tornado:{
  heat:['Everyone is legal. A wrestler trying to make a save takes the next hit, and the fight has already moved before anyone can see who’s down.',
   ['Make two saves collide','Two wrestlers dive into the same exchange from opposite sides. The impact leaves a pile in the corner and both teams have to find someone still standing.','The saves arrive out of order. Each team gets someone clear, but neither gets to take over.'],
   ['Send the whole match into one corner','The two brawls hit the corner together. A wrestler staggers out into a tandem shot and the partners who could help are still on the canvas.','The corner clears before anyone hits it square. The two fights split again before either side can follow up.']],
  decisive:'{P} catches {L} with a finishing shot while the other wrestlers are occupied. Nobody reaches the cover in time.',
  breakdown:'The referee can’t get the bodies in the ring separated. The bell rings without a fall as the officials come in from both sides.'
 }
};
