/* Tony Khan Simulator — the match showdown (v254; v255: main event only, moments placed by whether they end the match).
   One match a show — the main event — plays out like the promo showdown: the camera whips between the two sides,
   the commentary booth calls it, and you make the calls through the match in three acts:

     Opening   — the tactic your winner starts with (fly out of the gate, chain wrestle, start a fight…)
     Heat      — the match's big moment (the same moments and disasters as any other match), or a heat tactic when
                 the moment is a finish
     Near fall — does the loser kick out (rope break, beat the count, tip the ladder…)? Kick out for a bigger finish
                 at a stamina cost, or let it end right there
     Finish    — how it ends, only from finishes that match type allows (no pinfalls in a ladder match)
     After the bell — the closing shot: a handshake, a beatdown, a celebration. Story only, no stars.

   Risk sets the swing like every other call (swingOf), scaled down because there are more calls, and the new calls
   together never move the match more than MS_CAP either way. The rival's main event runs the same calls by the
   rival's rules (msAuto), so neither side gets an edge. Loaded after crowd.js. */
'use strict';
(function(){
const MS_K=.2,MS_CAP=.75;
/* line codes: A = action by the winner's side, B = action by the loser's side, qa/qb = said by A/B,
   p = play-by-play, c = colour commentary, x = the crowd / camera. Optional 3rd item: a shout [text, 'gold'|''] */

/* ---------- Act 1: the opening ---------- */
const MS_OPEN=[
 {id:'fly',fit:'fl',t:'Fly out of the gate',sub:'A dive before {B} can settle in',s:'ring',d:.18,st:.6,
  hit:[[['A','({B} steps out to stall. {A} launches through the ropes and folds them over the barricade.)',['Oh my god!','']],['p','We are barely a minute in and {A} is already throwing their body away!'],['x','The whole building is on its feet.']],
       [['A','({A} springboards off the top rope before the bell has finished ringing and wipes out {B} on the floor.)',['Off the top!','']],['c','That is one way to say hello.'],['x','A "This is awesome!" chant starts already.']]],
  miss:[[['A','({A} goes for the dive. {B} simply steps aside and {A} crashes into the floor.)'],['qb','Smart. Real smart.'],['c','That\'s what happens when you don\'t look before you leap.']],
       [['A','({A} goes up top too early. {B} shoves them off and {A} lands on the apron, hard.)'],['p','A rough start, and {A} is clutching their ribs.'],['x','A wince runs through the building.']]]},
 {id:'chain',fit:'te',t:'Chain wrestle and out-think {B}',sub:'Hold for hold, let the match build',s:'ring',d:-.12,st:.4,
  hit:[[['A','({A} goes hold for hold with {B}, then snaps them over with an arm drag. {B} rolls out to regroup.)'],['p','{A} is out-wrestling {B} early, and {B} did not see that coming.'],['x','Applause, then a chant for {A} starts in the upper deck.']],
       [['A','({A} reverses a wristlock into a headlock takeover, then into a pin attempt for one.)'],['c','That\'s a wrestling clinic. Pay attention, kids.'],['x','The crowd claps along with every reversal.']]],
  miss:[[['B','(The lockups go nowhere. {B} keeps breaking clean in the corner and slapping {A} on the cheek.)'],['c','This crowd is getting restless.'],['x','Somebody yells "Boring!" and a few people laugh.']],
       [['A','({A} goes for a takedown and {B} sprawls on it, then grinds a forearm across {A}\'s face.)'],['p','{B} winning the early exchanges here.']]]},
 {id:'brawl',fit:'br',t:'Start a fight, not a match',sub:'Fists flying from the opening bell',s:'ring',d:.05,st:.5,
  hit:[[['A','({A} charges across the ring before the bell finishes ringing. Fists everywhere.)',['Fight!','']],['p','No feeling out process at all! They are throwing bombs!'],['x','The front row is up on the barricade.']],
       [['A','({A} drags {B} out by the hair and runs them spine-first into the ring steps.)',['Steel steps!','gold']],['qb','My back! Ref!'],['p','The referee has already lost control of this one!']]],
  miss:[[['A','({A} goes to whip {B} into the steps. {B} reverses and {A} hits the steel instead.)'],['c','Picked a fight with the wrong person.'],['x','Boos as {B} poses on the steps.']],
       [['A','({A} swings wild and {B} ducks every punch, then drops {A} with one clean shot.)'],['c','All that anger, nothing to show for it.']]]},
 {id:'power',fit:'pw',t:'Throw {B} around early',sub:'Suplexes and slams to set the tone',s:'ring',d:.02,st:.5,
  hit:[[['A','({A} catches {B} mid-leap and launches them across the ring with a belly-to-belly.)',['Suplex city!','gold']],['p','{B} just got thrown like a sack of laundry!'],['x','A big "Ooooh!" rolls around the arena.']],
       [['A','({A} presses {B} over their head, holds them there for a count of five, then drops them.)'],['c','That\'s not wrestling, that\'s a feat of strength.'],['x','The crowd counts along with the press.']]],
  miss:[[['A','({A} goes for the big slam and {B} slips out the back and chop-blocks the knee.)'],['p','{B} took the legs out from under {A}!']],
       [['A','({A} tries to muscle {B} up and can\'t get them off the ground. They both look at each other.)'],['x','Awkward laughter in the cheap seats.']]]},
 {id:'show',fit:'sh',t:'Play to the crowd before the lock-up',sub:'Pose, posture, make them wait',s:'pop',d:.05,st:.5,
  hit:[[['A','({A} stops in the middle of the ring, raises one hand and lets the crowd fill the silence.)'],['x','The whole building chants {A}\'s name.'],['c','{B} is standing there like a spare part.']],
       [['A','({A} mirrors {B}\'s pose, exaggerated, then winks at the hard camera.)'],['x','Laughter, then cheers. The crowd is all in on {A}.']]],
  miss:[[['A','({A} goes for the big pose and {B} clobbers them from behind before they finish.)'],['c','Read the room. Then read the opponent.']],
       [['A','({A} poses to each side. The crowd gives it a polite clap and nothing more.)'],['p','Not much reaction to the showboating there.']]]},
 {id:'fire',al:'f',t:'Fire up the crowd with a quick flurry',sub:'Hit everything fast and let them cheer',s:'pop',d:0,st:.5,
  hit:[[['A','({A} hits a dropkick, a hip toss and a running knee, then stands on the apron with arms raised.)'],['x','The crowd is clapping in rhythm. They are with {A}.'],['p','{A} has this building in the palm of their hand!']]],
  miss:[[['A','({A} goes for the flurry, but {B} rolls out after the first move and waits.)'],['c','Smart from {B}. Let the fire burn out.']]]},
 {id:'jump',al:'h',t:'Jump {B} before the bell',sub:'Cheap shot during the introductions',s:'luck',d:.05,st:.5,heat:5,
  hit:[[['A','({A} blindsides {B} during the ring announcement and stomps them into the corner.)'],['p','Before the bell! {A} has no shame at all!'],['x','Thunderous boos. They hate {A} for it.']]],
  miss:[[['A','({A} charges during the introductions. {B} sees it coming and sends {A} over the top rope.)'],['x','A huge cheer as {A} lands on the floor.']]]},
 {id:'feel',t:'Feel each other out',sub:'Safe and steady. Save the big stuff for later.',s:'ring',d:-.28,st:.3,
  hit:[[['A','({A} and {B} circle, trade holds and break clean. Nobody gives an inch.)'],['p','A careful start. Neither one wants to make the first mistake.']]],
  miss:[[['B','({B} catches {A} off a lockup and pounces early.)'],['c','So much for careful.']]]}];

/* ---------- Act 2 (when the big moment is saved for the finish): the heat ---------- */
const MS_HEAT=[
 {id:'limb',fit:'te',t:'Go after a body part',sub:'Work a leg or an arm so the finish means more',s:'ring',d:0,st:.5,
  hit:[[['A','({A} goes to work on {B}\'s knee — a dragon screw, then a figure-four around the ring post.)'],['c','Every move has a purpose. That knee is going to matter later.'],['x','{B} screams and the crowd winces with them.']]],
  miss:[[['A','({A} goes for the leg and {B} kicks them off into the turnbuckle.)'],['p','{B} wants no part of that.']]]},
 {id:'hope',al:'f',t:'Let {A} fight from underneath',sub:'A beating, then the comeback',s:'pop',d:.05,st:.6,
  hit:[[['B','({B} has {A} down and won\'t let up, stomping away in the corner.)'],['A','({A} blocks a punch, fires back with three of their own and the crowd explodes.)',['Here we go!','gold']],['p','Here comes the comeback!']]],
  miss:[[['B','({B} keeps {A} grounded for what feels like forever.)'],['x','The crowd starts to drift. A few people check their phones.']]]},
 {id:'cheat',al:'h',t:'Cheat behind the ref\'s back',sub:'Eye rake, hair pull, choke on the ropes',s:'luck',d:0,st:.5,heat:6,
  hit:[[['A','({A} rakes {B}\'s eyes while the ref is checking the ropes, then feigns innocence.)'],['c','Can somebody buy that referee a pair of glasses?'],['x','The boos are deafening.']]],
  miss:[[['A','({A} goes for the eyes and the ref turns around just in time. A big lecture follows.)'],['x','The crowd cheers the referee.']]]},
 {id:'floor',t:'Take it to the floor for a big spot',sub:'A dive or a slam through the timekeeper\'s table',s:'ring',d:.18,st:.65,fat:3,
  hit:[[['A','({A} sends {B} over the barricade and follows them into the crowd with a flying crossbody.)',['Into the crowd!','']],['p','They are in the fourth row! Where is security?']]],
  miss:[[['A','({A} goes for the big spot and both of them come up short. A long pause on the floor.)'],['c','That wasn\'t the plan. You could see it.']]]},
 {id:'slow',t:'Slow it down and grind',sub:'Rest holds and long chinlocks',s:'ring',d:-.25,st:.25,
  hit:[[['A','({A} slows it right down — a chinlock, a cravate, every hold telling a story.)'],['p','Methodical. {A} is in no hurry.']]],
  miss:[[['A','({A} applies a chinlock. Then another. Then another.)'],['x','Somebody yells "Boring!"']]]}];

/* ---------- Act 3: the near fall, by kind of finish ---------- */
const MS_FALL={
 pin:{set:[[['A','({A} hits their biggest move and hooks the leg.)'],['p','Cover! One! Two!']],[['A','({A} plants {B} with a finisher out of nowhere and dives on top.)'],['p','This could be it!']]],count:['1','2'],
  q:'{A} has the cover. Does {B} kick out?',kick:'{B} kicks out at 2.9',ksub:'More drama and a bigger finish. Costs stamina.',stay:'Stay down. That\'s three.',ssub:'{A} wins right here. Clean, no extra drama.',
  hit:[[['B','({B}\'s shoulder flies up a hair before three.)',['Kicked out!','']],['c','I had it counted! I thought that was it!'],['x','"This is awesome!" Clap clap, clap-clap-clap.']],[['B','({B} gets a shoulder up at the last possible moment.)',['Two point nine!','']],['p','How is {B} still in this?'],['x','The arena gasps, then roars.']]],
  miss:[[['B','({B}\'s shoulder comes up a beat late. The ref\'s hand was already on the way down.)'],['c','Was that three? I think that was three!'],['x','Confused murmurs around the building.']]],
  end:[['x','1… 2… 3!',['Three!','gold']],['p','{A} gets it done!']]},
 multi:{set:[[['A','({A} drills {B} with a finisher and covers in the middle of the ring.)'],['p','Cover! One! Two!']]],count:['1','2'],
  q:'{A} has {B} covered. Does someone break it up?',kick:'{C} dives in and breaks up the count',ksub:'More chaos and a bigger finish. Costs stamina.',stay:'Nobody gets there. That\'s three.',ssub:'{A} wins right here.',
  hit:[[['x','{C} flies in from nowhere and breaks up the pin at two point nine!',['Saved!','']],['p','Pandemonium! Nobody wants to lose this one!']]],
  miss:[[['x','{C} dives in a beat late and lands on the referee\'s back.'],['c','Was that three? Nobody seems sure.']]],
  end:[['x','1… 2… 3!',['Three!','gold']],['p','{A} pins {B} and wins it!']]},
 sub:{set:[[['A','({A} locks the hold in, right in the middle of the ring. {B} is fading.)'],['p','{B} is in trouble here!']]],
  q:'{B} is fading in the hold. Does {B} reach the ropes?',kick:'{B} crawls to the ropes',ksub:'More drama and a bigger finish. Costs stamina.',stay:'{B} taps',ssub:'{A} wins right here.',
  hit:[[['B','({B} crawls, inch by inch, and gets a fingertip on the bottom rope.)',['Rope break!','']],['x','The building erupts.'],['c','Pure guts from {B}!']]],
  miss:[[['B','({B} stretches for the rope and it\'s nowhere near. The ref lets it go on far too long.)'],['c','That ought to have been over a minute ago.']]],
  end:[['B','({B} taps out.)',['Tap out!','gold']],['p','{A} makes {B} submit!']]},
 iquit:{set:[[['A','({A} shoves the mic in {B}\'s face with the hold cranked all the way.)'],['qa','Say it!']]],
  q:'Does {B} say "I quit"?',kick:'{B} refuses',ksub:'More drama and a bigger finish. Costs stamina.',stay:'{B} says the words',ssub:'{A} wins right here.',
  hit:[[['qb','NO!',['Never!','']],['x','The crowd roars for {B}\'s defiance.'],['p','{B} would rather pass out than say it!']]],
  miss:[[['qb','No…'],['x','It comes out so quiet half the building thinks {B} said it.'],['c','Did they just quit? I can\'t tell.']]],
  end:[['qb','I… quit.',['I quit!','gold']],['p','{B} said it! {A} wins!']]},
 ladder:{set:[[['A','({A} climbs, fingertips brushing the prize.)'],['p','{A} is almost there!']]],
  q:'{A} is at the top of the ladder. Does {B} stop the climb?',kick:'{B} tips the ladder at the last second',ksub:'More drama and a bigger finish. Costs stamina.',stay:'{A} pulls it down',ssub:'{A} wins right here.',
  hit:[[['B','({B} charges the ladder and tips it. {A} goes crashing into the ropes.)',['Not yet!','']],['x','Half the arena screams. The other half cheers.']]],
  miss:[[['B','({B} shoves the ladder, but it wobbles and stays up. {A} just waits at the top.)'],['c','That was a strange moment.']]],
  end:[['A','({A} unhooks it and holds it high.)',['Got it!','gold']],['p','{A} has done it!']]},
 tables:{set:[[['A','({A} lays {B} across the table and climbs the top rope.)'],['p','Somebody is going through that table!']]],
  q:'{B} is on the table. Does {B} roll off in time?',kick:'{B} rolls off just in time',ksub:'More drama and a bigger finish. Costs stamina.',stay:'{A} puts {B} through it',ssub:'{A} wins right here.',
  hit:[[['B','({B} rolls off at the last second and {A} crashes through the table alone.)',['Moved!','']],['x','A gasp, then a roar.'],['c','The table didn\'t care who it was.']]],
  miss:[[['B','({B} rolls off, slowly, and {A} has to wait at the top and adjust.)'],['c','Not exactly at the last second, was it.']]],
  end:[['A','({A} comes off the top and puts {B} through the table.)',['Through it!','gold']],['p','{A} wins!']]},
 lms:{set:[[['B','({B} is down. The ref counts. Seven… eight…)']]],count:['8','9'],
  q:'{B} is down at nine. Does {B} beat the count?',kick:'{B} gets up at nine',ksub:'More drama and a bigger finish. Costs stamina.',stay:'{B} stays down for ten',ssub:'{A} wins right here.',
  hit:[[['B','({B} drags themself up using the ropes at nine.)',['Up at nine!','']],['x','The building comes unglued.']]],
  miss:[[['B','({B} gets up at nine, but it looks like ten from the hard camera.)'],['c','That ref counts slower than my grandmother.']]],
  end:[['x','Ten!',['Ten!','gold']],['p','{B} can\'t answer it! {A} wins!']]},
 coffin:{set:[[['A','({A} rolls {B} into the coffin and reaches for the lid.)']]],
  q:'{B} is in the coffin. Does {B} keep the lid open?',kick:'{B} pushes the lid back open',ksub:'More drama and a bigger finish. Costs stamina.',stay:'The lid slams shut',ssub:'{A} wins right here.',
  hit:[[['B','({B}\'s hand shoots up and shoves the lid back open.)',['Not done!','']],['x','Shrieks, then cheers.']]],
  miss:[[['B','({B} pushes on the lid. It opens about an inch, then closes again on its own.)'],['c','Well that was anticlimactic.']]],
  end:[['A','({A} slams the lid and sits on it.)',['Lid shut!','gold']],['p','It\'s over! {A} wins!']]},
 bng:{set:[[['A','({A} has {B} trapped on top of the cage. {B}\'s team is begging them to quit.)']]],
  q:'Does {B}\'s team surrender?',kick:'{B} refuses to quit',ksub:'More drama and a bigger finish. Costs stamina.',stay:'{B}\'s team throws in the towel',ssub:'{A}\'s team wins right here.',
  hit:[[['qb','Never!',['Never!','']],['x','The building shakes.']]],
  miss:[[['qb','I… no.'],['c','Even their own team isn\'t sure that was a no.']]],
  end:[['x','{B}\'s team surrenders.',['Surrender!','gold']],['p','It\'s over! {A}\'s team wins Blood & Guts!']]},
 rumble:{set:[[['A','({A} has {B} draped over the top rope, feet dangling.)'],['p','{B} is almost out!']]],
  q:'{B} is hanging on by a fingertip. Does {B} survive?',kick:'{B} skins the cat and hangs on',ksub:'More drama and a bigger finish. Costs stamina.',stay:'Over the top {B} goes',ssub:'{A} wins right here.',
  hit:[[['B','({B} hooks the rope with one hand, skins the cat and climbs back in.)',['Still in it!','']],['x','The whole building is on its feet.']]],
  miss:[[['B','({B} hangs on, but the feet look awfully close to the floor.)'],['c','Did their feet touch? The officials missed it.']]],
  end:[['B','({B} hits the floor.)',['Eliminated!','gold']],['p','{A} wins the Royal Rumble!']]}};

/* ---------- Act 3: the finish, by kind of finish ---------- */
const FIN_PIN=[
 {id:'clean',t:'The finisher, clean',sub:'One more big move, right in the middle',s:'ring',d:0,st:.55,
  hit:[[['A','({A} hits the finisher dead center and covers.)'],['x','1… 2… 3!',['Three!','gold']],['p','Clean as you like! {A} wins!']]],
  miss:[[['A','(The finisher only half connects and {A} has to go back for it.)'],['x','1… 2… 3.'],['c','A win\'s a win. That wasn\'t the finish they drew up.']]]},
 {id:'roll',t:'Roll-up out of nowhere',sub:'Steal it before anyone can react',s:'ring',d:-.18,st:.3,
  hit:[[['A','({B} lunges. {A} ducks under and rolls them up in a flash.)'],['x','1… 2… 3!',['Stolen!','gold']],['p','Out of nowhere! {A} steals it!']]],
  miss:[[['A','(The roll-up gets tangled up and {A} holds an awkward bridge through a long count.)'],['x','1… 2… 3. Cheers, but they wanted something bigger.']]]},
 {id:'top',fit:'fl',t:'Go bigger, off the top rope',sub:'The biggest version of the biggest move',s:'ring',d:.2,st:.75,fat:3,
  hit:[[['A','({A} climbs to the top, looks out at the crowd, and flies.)',['Oh my god!','']],['x','1… 2… 3!'],['p','Insanity! {A} has done it!']]],
  miss:[[['A','({A} leaps and clips the top rope on the way down. It barely connects.)'],['c','Get the trainer on standby.'],['x','1… 2… 3. More relief than celebration.']]]},
 {id:'ropes',al:'h',t:'Feet on the ropes',sub:'A cheap win with the ref\'s back turned',s:'luck',d:0,st:.5,heat:6,
  hit:[[['A','({A} covers with both feet on the middle rope. The ref never looks.)'],['x','1… 2… 3!'],['c','They cheated! The ref missed it!'],['x','The boos are deafening.']]],
  miss:[[['A','(The ref spots the feet and kicks them off. {A} has to win it the hard way.)'],['x','The crowd cheers the referee.']]]},
 {id:'double',need:'A2',t:'Double-team finisher with {A2}',sub:'The team\'s big move to end it',s:'ring',d:.05,st:.55,
  hit:[[['A','({A} and {A2} hit their double-team finisher in perfect sync.)',['Tag team!','gold']],['x','1… 2… 3!'],['p','That is a team that knows each other!']]],
  miss:[[['A','({A} and {A2} go for it and the timing\'s a beat off. They have to hit it again.)'],['x','1… 2… 3.']]]},
 {id:'fireup',al:'f',t:'Fire up and hit everything',sub:'The full comeback sequence, crowd on their feet',s:'pop',d:.05,st:.55,
  hit:[[['A','({A} shakes it off, fires back, and runs through every signature move to a roar.)',['Here we go!','gold']],['x','1… 2… 3!'],['p','The fans willed {A} to this one!']]],
  miss:[[['A','({A} fires up, but {B} cuts it short and {A} has to grind it out.)'],['x','1… 2… 3. Good, not great.']]]}];
const FIN={
 pin:FIN_PIN,
 sub:[
  {id:'tighter',t:'Lock it back in, tighter',sub:'No escape this time',s:'ring',d:0,st:.55,hit:[[['A','({A} drags {B} back to the middle and locks it in tighter than ever.)'],['B','({B} taps.)',['Tap out!','gold']],['p','There was nowhere to go!']]],miss:[[['A','({A} re-applies the hold, and it looks loose. {B} taps anyway.)'],['c','That one didn\'t look like it hurt much.']]]},
  {id:'switch',fit:'te',t:'Switch to a different submission',sub:'Transition to a hold they\'ve never seen',s:'ring',d:.12,st:.65,hit:[[['A','({A} rolls through and transitions into something {B} has never seen.)',['Tap out!','gold']],['c','That was textbook. Write that one down.']]],miss:[[['A','({A} goes for the transition and loses it. {B} eventually taps to the first hold anyway.)']]]},
  {id:'ropes',al:'h',t:'Use the ropes for leverage',sub:'Behind the ref\'s back',s:'luck',d:0,st:.5,heat:6,hit:[[['A','({A} grabs the ropes for extra leverage while the ref is on the other side.)'],['B','({B} taps.)'],['x','The boos are thunderous.']]],miss:[[['A','(The ref sees the hand on the rope and makes {A} let go. {A} grinds out the tap the hard way.)']]]}],
 iquit:[
  {id:'crank',t:'Crank the hold until {B} says it',sub:'No mercy',s:'ring',d:0,st:.55,hit:[[['A','({A} wrenches back until {B} can\'t take any more.)'],['qb','I quit! I quit!'],['x','A huge reaction.']]],miss:[[['A','({A} cranks and cranks. It takes forever.)'],['qb','…I quit.']]]},
  {id:'talk',t:'Talk {B} into it',sub:'Mind games on the mic',s:'mic',d:.1,st:.6,hit:[[['qa','Say it. Say it and this all stops.'],['qb','…I quit.'],['c','That was psychological warfare.']]],miss:[[['qa','Say it! Say it! Say… it…'],['x','It goes on too long. {B} finally mumbles it.']]]},
  {id:'chair',al:'h',t:'Bring a chair into it',sub:'Threaten {B} with the steel',s:'luck',d:0,st:.5,heat:8,hit:[[['A','({A} raises a steel chair over {B}\'s head.)'],['qb','Okay! I quit!'],['x','Furious boos.']]],miss:[[['A','({A} grabs a chair and the ref yanks it away. {A} has to finish it with the hold.)']]]}],
 ladder:[
  {id:'shove',t:'Shove {B} off and climb',sub:'Straight to the top',s:'ring',d:0,st:.55,hit:[[['A','({A} kicks {B} off the ladder and climbs.)'],['A','({A} unhooks it.)',['Got it!','gold']]]],miss:[[['A','({A} gets {B} off, but the climb takes forever. They get there eventually.)']]]},
  {id:'big',fit:'fl',t:'One huge ladder spot first',sub:'Off the top of the ladder',s:'ring',d:.2,st:.75,fat:4,hit:[[['A','({A} climbs the ladder and leaps off the very top onto {B}.)',['Oh my god!','']],['A','({A} drags themself up and unhooks it.)'],['p','Insanity!']]],miss:[[['A','({A} leaps and lands badly. A long minute before anyone moves.)'],['A','({A} finally climbs and grabs it.)']]]},
  {id:'weapon',t:'Use the ladder as a weapon',sub:'Wrap {B} up in it, then climb',s:'ring',d:.06,st:.55,hit:[[['A','({A} slams the ladder into {B}, then climbs over them to the top.)'],['A','({A} unhooks it.)',['Got it!','gold']]]],miss:[[['A','({A} swings the ladder and it hits nothing. A long recovery.)']]]}],
 tables:[
  {id:'bomb',fit:'pw',t:'Powerbomb {B} through it',sub:'Straight through the wood',s:'ring',d:0,st:.55,hit:[[['A','({A} powerbombs {B} through the table.)',['Through it!','gold']],['p','Splinters everywhere!']]],miss:[[['A','(The table doesn\'t break the first time. {A} has to do it again.)'],['c','Tough table.']]]},
  {id:'dive',fit:'fl',t:'Dive off the top through the table',sub:'The big one',s:'ring',d:.2,st:.75,fat:3,hit:[[['A','({A} flies off the top and puts {B} through the table.)',['Oh my god!','']],['x','The building shakes.']]],miss:[[['A','({A} flies and the table only cracks. The ref calls it anyway.)'],['c','That was a generous ruling.']]]},
  {id:'announce',t:'Through the announce table',sub:'Clear the desk first',s:'pop',d:.08,st:.6,hit:[[['A','({A} clears the announce desk and drives {B} through it.)',['Not the desk!','']],['c','My notes! My monitor!']]],miss:[[['A','({A} clears the desk, but the commentary table won\'t break. They have to go back to the ring table.)']]]}],
 lms:[
  {id:'finisher',t:'One more finisher, then walk away',sub:'Let the count do the rest',s:'ring',d:0,st:.55,hit:[[['A','({A} hits the finisher and walks away without looking back.)'],['x','The ref counts ten.',['Ten!','gold']]]],miss:[[['A','({A} hits the finisher, but {B} nearly gets up. Nearly.)'],['x','Ten.']]]},
  {id:'table',t:'Through the announce table',sub:'Nobody gets up from that',s:'ring',d:.15,st:.7,fat:3,hit:[[['A','({A} drives {B} through the announce table.)',['Not the desk!','']],['x','Ten!']]],miss:[[['A','(The desk doesn\'t break. {A} has to keep going.)'],['x','Ten, eventually.']]]},
  {id:'tie',al:'h',t:'Tie {B} up in the ropes',sub:'They can\'t answer the count',s:'luck',d:0,st:.5,heat:6,hit:[[['A','({A} ties {B}\'s arm in the ropes so they can\'t stand up.)'],['x','Ten. Thunderous boos.']]],miss:[[['A','({A} tries to tie {B} up and the ref stops counting until they\'re free.)']]]}],
 coffin:[
  {id:'sit',t:'Slam the lid and sit on it',sub:'Simple and final',s:'pop',d:0,st:.55,hit:[[['A','({A} slams the lid and sits on it, arms crossed.)',['Lid shut!','gold']]]],miss:[[['A','({A} slams the lid. It pops open. Slams it again.)']]]},
  {id:'fin',t:'Finisher into the coffin',sub:'Right into the box',s:'ring',d:.1,st:.65,hit:[[['A','({A} hits the finisher and {B} falls straight into the coffin.)',['Lid shut!','gold']]]],miss:[[['A','({A} goes for the finisher and {B} lands half in, half out. A long shove follows.)']]]},
  {id:'chain',al:'h',t:'Chain the lid shut',sub:'Make sure they stay in',s:'luck',d:0,st:.5,heat:6,hit:[[['A','({A} padlocks the coffin and pockets the key.)'],['x','Boos rain down.']]],miss:[[['A','({A} fumbles with the padlock for a while.)']]]}],
 bng:[
  {id:'dive',fit:'fl',t:'Dive off the top of the cage',sub:'The moment everyone came for',s:'ring',d:.22,st:.75,fat:4,hit:[[['A','({A} stands on top of the cage and jumps.)',['Oh my god!','']],['x','{B}\'s team throws in the towel.']]],miss:[[['A','({A} jumps and only half lands it. {B}\'s team surrenders anyway.)']]]},
  {id:'hold',t:'Trap {B} in a submission',sub:'Until the team gives up',s:'ring',d:0,st:.55,hit:[[['A','({A} locks {B} in and won\'t let go.)'],['x','{B}\'s team surrenders.',['Surrender!','gold']]]],miss:[[['A','({A} holds it for a long, long time.)'],['x','{B}\'s team finally surrenders.']]]},
  {id:'weapons',t:'Weapons from under the ring',sub:'Bring everything into the cage',s:'luck',d:.05,st:.6,hit:[[['A','({A} empties the bag of weapons into the cage.)'],['x','{B}\'s team surrenders.']]],miss:[[['A','(The weapons pile up but nobody uses them well.)'],['x','{B}\'s team surrenders anyway.']]]}],
 rumble:[
  {id:'clothes',t:'Clothesline {B} over the top',sub:'Straight and simple',s:'ring',d:0,st:.55,hit:[[['A','({A} runs {B} over the top with a clothesline.)',['Eliminated!','gold']]]],miss:[[['A','({A} clotheslines {B}, who hangs on. {A} has to push them over.)']]]},
  {id:'hang',t:'Hang on, then dump {B} over',sub:'Survive and steal it',s:'ring',d:.1,st:.65,hit:[[['A','({A} hangs on to the ropes, pulls them down and {B} sails over the top.)',['Eliminated!','gold']]]],miss:[[['A','(It\'s messy, but {B} eventually goes over.)']]]},
  {id:'apron',t:'Knock {B} off the apron',sub:'One last shot to the floor',s:'pop',d:.05,st:.6,hit:[[['A','({A} catches {B} on the apron and kicks them to the floor.)',['Eliminated!','gold']]]],miss:[[['A','({A} kicks at {B} on the apron and misses, then shoves them off.)']]]}]};

/* ---------- after the bell ---------- */
const MS_POST=[
 {id:'party',al:'f',t:'{A} celebrates with the fans',sub:'A babyface moment to close the show',popA:1,
  hit:[[['A','({A} climbs over the barricade and sits in the front row with arms raised.)'],['p','That\'s the picture. They\'ll be talking about that one.']]],note:'{A}\'s popularity is up'},
 {id:'shake',al:'f',vs:'f',t:'{A} and {B} shake hands',sub:'Respect between two faces',morB:3,popA:.5,popB:.5,
  hit:[[['A','({A} offers a hand. {B} takes it, and they hug.)'],['x','Applause for both of them.']]],note:'Respect: both look good'},
 {id:'slap',al:'f',vs:'h',t:'{A} offers a handshake',sub:'{B} decides what to do with it',heat:6,
  hit:[[['A','({A} offers a hand.)'],['B','({B} stares at it, slaps it away and storms up the ramp.)'],['p','Still no respect. This isn\'t over.']]],note:'Feud stays open'},
 {id:'jumped',vs:'h',al:'f',t:'{B} jumps {A} after the bell',sub:'A cheap shot to keep the feud hot',heat:12,
  hit:[[['B','({B} waits for {A} to turn around, then lays them out.)'],['qb','Enjoy it. It\'s never happening again.'],['x','Trash flies toward the ring.']]],note:'Feud heat up'},
 {id:'beat',al:'h',t:'{A} keeps beating on {B}',sub:'Post-match beatdown',heat:10,
  hit:[[['A','({A} keeps stomping on {B} long after the bell.)'],['c','The match is over! Somebody stop this!'],['x','Officials pour out from the back.']]],note:'Feud heat up'},
 {id:'pose',al:'h',t:'{A} poses over {B}',sub:'Rub it in',heat:6,
  hit:[[['A','({A} stands over {B} and poses for the hard camera.)'],['x','The boos follow {A} all the way up the ramp.']]],note:'Heat up'},
 {id:'fight',al:'h',vs:'f',t:'{B} fights back after the bell',sub:'The face gets the last word',heat:8,popB:1,
  hit:[[['B','({B} recovers, catches {A} on the ramp and sends them scrambling to the back.)'],['x','A huge cheer.']]],note:'{B} gets some of it back'},
 {id:'stare',t:'A long staredown',sub:'Nobody blinks',heat:5,
  hit:[[['A','({A} and {B} stand nose to nose as the show goes off the air.)'],['p','This isn\'t done, folks.']]],note:'Heat up a little'}];

/* the booth's reaction to the big moment */
const MS_BOOTH_OK=['What a moment! This place is unglued!','You will not see that anywhere else this week.','That is why this match is the main event!'],
 MS_BOOTH_NO=['Not how anyone drew that one up.','That one got away from them.','The crowd isn\'t sure what they just saw.'];

/* ---------- engine ---------- */
let MS=null;
const msW=w=>w&&typeof w==='object';
function msFam(m){if(m.type==='gauntlet')return 'none';if(m.type==='rumble')return 'rumble';if(m.type==='mitb')return 'ladder';
 const k=stipKey(m);return k==='sub'?'sub':k==='iquit'?'iquit':k==='ladder'?'ladder':k==='tables'?'tables':k==='lms'?'lms':k==='coffin'?'coffin':k==='bng'?'bng':'pin'}
function msRoles(m,brand){const win=m.sides[m.winner]||[];const A=S.w[win[0]];const A2=win.length>1?S.w[win[1]]:null;
 const pin=typeof pinOf==='function'?pinOf(m):null;const los=m.sides.filter((s,i)=>i!==m.winner);
 const B=S.w[pin||(los[0]||[])[0]];const Cid=m.sides.flat().find(id=>id!==B.id&&!win.includes(id)&&!(m.sides.find(s=>s.includes(B.id))||[]).includes(id));
 return {A,B,A2,C:Cid?S.w[Cid]:null,brand}}
function msFill(t,r){return String(t).replace(/\{(A2|A|B|C)\}/g,(_,k)=>r[k]?r[k].name:'')}
function msOk(c,r){return (!c.al||r.A.al===c.al)&&(!c.vs||r.B.al===c.vs)&&(!c.need||r[c.need])}
function msChance(c,r){const A=r.A;const fit=c.fit?(A.st===c.fit?-.1:.04):0;return clamp(chance(Object.assign({},c,{d:(c.d||0)+fit}),{A}),.12,.95)}
/* deal three calls: the one that fits the wrestler's style first, then the alignment move, then the rest at random */
function msDeal(list,r,n){const ok=list.filter(c=>msOk(c,r));const fit=ok.filter(c=>c.fit&&c.fit===r.A.st),al=ok.filter(c=>c.al&&!fit.includes(c)),rest=ok.filter(c=>!fit.includes(c)&&!al.includes(c));
 const out=[];[fit,al].forEach(g=>{if(g.length&&out.length<n)out.push(pick(g))});
 rest.slice().sort(()=>Math.random()-.5).forEach(c=>{if(out.length<n)out.push(c)});return out}
function msAdd(m,d,st){const ev=evNew(m);st.sum=st.sum||0;const nd=clamp(st.sum+d,-MS_CAP,MS_CAP)-st.sum;st.sum+=nd;ev.stars+=nd;return nd}
/* roll one of the new calls; returns {ok,d,lines} */
function msRoll(c,r,m,st,lab){const p=msChance(c,r);const ok=Math.random()<p;const sw=swingOf(p,c.st);
 const d=msAdd(m,ok?sw.w*MS_K:-sw.l*MS_K,st);const ev=evNew(m);
 if(c.heat&&ok&&r.B)ev.heat.push([r.A.id,r.B.id,c.heat]);if(c.fat)m.sides.flat().forEach(id=>ev.fat.push([id,c.fat]));
 if(c.al==='h'&&ok&&r.A.al==='f')ev.pop.push([r.A.id,-1]);
 ev.notes.push(`🎬 ${lab}: ${msFill(c.t,r)} — ${ok?'it lands':'it misses'}${d?` (${qStar(d)})`:''}`);
 return {ok,d,lines:pick(ok?c.hit:c.miss)}}
function msKick(m,r,st,F,lab){const B=r.B;const p=clamp(.25+((B.ring+r.A.ring)/2)/100*.6,.3,.85);const ok=Math.random()<p;const sw=swingOf(p,.6);
 const d=msAdd(m,ok?sw.w*MS_K:-sw.l*MS_K,st);const ev=evNew(m);m.sides.flat().forEach(id=>ev.fat.push([id,3]));
 ev.notes.push(`🎬 ${lab}: ${msFill(F.kick,r)} — ${ok?'the crowd buys every second':'the timing was off'}${d?` (${qStar(d)})`:''}`);return {ok,d,p,lines:pick(ok?F.hit:F.miss)}}
function msPost(c,r,m){const ev=evNew(m);if(c.heat&&r.B)ev.heat.push([r.A.id,r.B.id,c.heat]);if(c.popA)ev.pop.push([r.A.id,c.popA]);if(c.popB&&r.B)ev.pop.push([r.B.id,c.popB]);if(c.morB&&r.B)ev.mor.push([r.B.id,c.morB]);
 ev.notes.push(`🎬 After the bell: ${msFill(c.t,r)}`)}
function msPostDeal(r,m){if(m.nc||!r.B)return [];return msDeal(MS_POST,r,3)}
/* is this match getting the showdown? the main event of a live show, not a squash */
function msOn(m){return !!(m&&m.sides&&m.type!=='squash'&&!(typeof isSq==='function'&&isSq(m))&&validMatch(m))}
/* the moment for the heat act: forced situations first, then a random moment (always one in the main event) */
function msMoment(m,brand,big){try{return matchEvent(m,brand,big,1)}catch(e){console.warn(e);return null}}
/* v255: which calls end the match. Every outcome line was read in the v255 sweep; these phrases are how they end it
   (a count of three, a tap, a bell, a ten count, a win, a DQ, a prize pulled down…). A moment plays in the heat only
   with the calls that keep the match going; one that can't offer two of those is saved for the finish. */
const MS_END=[/\b(?:for|counts?|gets the|steals? the)\s+(?:a\s+)?three\b(?![- ]?(?:times|way|punches|count))/i,/\bslaps the mat three times\b/i,/\bthree count\b/i,/\bcheap three\b/i,/,\s*three\./i,
 /(?:one|1)\W{1,3}(?:two|2)\W{1,3}(?:three|3)\b/i,/(?:^|[.!?]\s+)three[.!]/i,/\b1-2-3\b/,/\b(?:wins?|won)\b(?!'t| (?:the (?:exchange|race|crowd|room|tug|test)|a title))/i,
 /\bdisqualif/i,/\bcount-?out\b/i,/\bno contest\b/i,/\bdouble (?:dq|knockout)\b/i,/\bstoppage\b/i,
 /\b(?:calls? for|rings?) the bell\b|\bthe bell rings\b|\bfinal bell\b|\btime expires\b|clock (?:hits zero|runs out)|time runs out|time-limit draw|\bat the time limit\b/i,
 /\btaps\b(?! (?:it|their|the mic))|\btaps out\b|\btapped\b/i,/\bI quit\b/i,/\b(?:waves? it off|throws? it out|stops (?:it|the match)|ref stops it|calls it)\b/i,
 /\bthe finish\b|\bfinish(?:es|ed)? (?:it|strong|one-armed)\b|\bfinishes\b/i,/\bit's over\b/i,/(?:^|[.!?]\s+)Ten[.!]/,/\bcounts? ten\b/i,/\bdeciding fall\b|\bfinal fall\b/i,
 /\bsteals? (?:it|the win)\b/i,/\bafter the bell\b/i,/\bcan't continue\b/i,/\bthe pin\b(?! (?:attempt|is broken|at))|(?:^|[.!?]\s+)Pin in\b|\bpins \S+ in the middle\b/i,
 /\bdrapes an arm over for the cover\b|\bcovers (?:and|as)\b/i,/\b(?:grabs|pulls|unhooks) the prize\b|\bprize down\b/i,/\bit counts\b/i,/\bFeet touch the floor\b/i,/\bbeats \S+ (?:clean|with)\b/i,/\b(?:be|get|gets|got) pinned\b/i,/\bleaves looking like\b/i,/\bruns? out the clock\b/i];
const msEnds=t=>{t=String(t||'');return MS_END.some(r=>r.test(t))};
const msChEnds=c=>!!(c.flip||c.nc||c.loseOk||c.loseNo||c.rematch||[c.ok,c.g,c.no,c.b].some(msEnds));
/* where the big moment plays: 'heat' (dealt only calls that keep the match going) or 'fin' (it decides the finish) */
function msPlan(g,m){if(!g||!g.e)return null;if(g.sit)return 'heat';const base=MEV.find(x=>x.id===g.e.id)||g.e;
 /* a general finish (a ref stoppage, a slow count) only ends pinfall and submission matches; ladder, tables, "I Quit",
    Last Man Standing, coffin, Blood & Guts and Rumble finishes come from their own moments or the finish call */
 const fin=()=>['pin','sub','none'].includes(msFam(m))||base.stip?'fin':null;
 if(callKind(g)==='finish')return fin();
 const mids=evChoices(base,m,g.r).filter(c=>!msChEnds(c));if(mids.length<2)return fin();
 g.e=Object.assign({},base,{ch:mids.length>3?mids.slice().sort(()=>Math.random()-.5).slice(0,3):mids});
 /* the crowd read was worked out on the old calls — re-tag it, and drop it if the new calls don't give the crowd a real choice */
 const C=g.r.CROWD;if(C){try{const A=g.r.A,B=g.r.B;const fav=C.lk==='upset'?B:C.lk==='face'?(A.al!==B.al?(A.al==='f'?A:B):(A.pop>=B.pop?A:B)):null;
  const tags={};g.e.ch.forEach(c=>{tags[c.t]=rcTag1(c,C.lk,fav===A)});const v=Object.values(tags);C.tags=tags;if(!v.includes('w')||!v.some(x=>x!=='w'))delete g.r.CROWD}catch(e){delete g.r.CROWD}}
 return 'heat'}
/* the match is over when the call says so — a no contest, a new winner, or words that end it */
const msOver=(m,out,w0)=>!!(m.nc||(out&&(out.nc||out.flip))||m.winner!==w0||(out&&msEnds(out.text)));

/* ---------- the rival (and the balance bot) run the same calls by the rival's rules ---------- */
function msAIPick(list,r){let best=list[0],bv=-1e9;list.forEach(c=>{const p=msChance(c,r);const sw=swingOf(p,c.st);const v=p*sw.w-(1-p)*sw.l+(c.heat||0)/40+Math.random()*.25;if(v>bv){bv=v;best=c}});return best}
function msAuto(m,brand,big){if(!msOn(m))return;const st={};const r=msRoles(m,brand);if(!r.A||!r.B)return;
 const fam=msFam(m);const g=msMoment(m,brand,big);const plan=msPlan(g,m);const w0=m.winner;
 msRoll(msAIPick(msDeal(MS_OPEN,r,3),r),r,m,st,'Opening');
 if(plan==='heat'){const out=runEvAI(g,m);if(msOver(m,out,w0))return msAutoPost(m,brand)}else msRoll(msAIPick(msDeal(MS_HEAT,r,3),r),r,m,st,'Heat');
 const r2=msRoles(m,brand);if(!r2.A||!r2.B)return;
 if(fam!=='none'){const F=MS_FALL[fam==='pin'&&m.sides.length>2&&r2.C?'multi':fam];
  const p=clamp(.25+((r2.B.ring+r2.A.ring)/2)/100*.6,.3,.85);const kick=p>=.6&&Math.random()<.7;
  if(kick){msKick(m,r2,st,F,'Near fall');if(plan==='fin')runEvAI(g,m);else msRoll(msAIPick(msDeal(FIN[fam]||FIN_PIN,r2,3),r2),r2,m,st,'Finish')}}
 else if(plan==='fin')runEvAI(g,m);
 msAutoPost(m,brand)}
function msAutoPost(m,brand){const r=msRoles(m,brand);if(!r.A||!r.B)return;const pl=msPostDeal(r,m);if(pl.length)msPost(pick(pl),r,m)}

/* ---------- the live showdown ---------- */
const msReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const msSleep=ms=>new Promise(res=>setTimeout(res,msReduce()?Math.min(ms,60):ms));
const msInits=w=>String(w.name||'').split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,3).toUpperCase();
function msCorner(sd,k){const w=sd[0];if(!w)return '';const sub=sd.length>1?sideName(sd.map(x=>x.id)):typeof lvSub==='function'?lvSub([w]):'';
 return `<div class="sdc c${k}"><div class="sdph" data-i="${esc(msInits(w))}">${portrait(w)}</div><div class="sdpl ${w.al==='f'?'fc':'hl'}"><b>${esc(sd.length>1?sideName(sd.map(x=>x.id)):w.name)}</b>${sub&&sd.length===1?`<span>${esc(sub)}</span>`:''}</div></div>`}
function msTitle(m){const k=stipKey(m);return (m.title&&S.titles[m.title]?S.titles[m.title].n+' title':MT[m.type].n)+(k!=='std'&&!SP_STIP[m.type]?' · '+STIPS[k].n:'')}
function msActs(){const a=MS.act||0;return `<div class="msacts">${['Opening','Heat','Finish'].map((t,i)=>`<span class="${i===a?'on':i<a?'done':''}">${t}</span>`).join('')}</div>`}
function msStage(){const m=MS.m,r=MS.r;const win=(m.sides[m.winner]||[]).map(id=>S.w[id]).filter(Boolean);const bs=(m.sides.find(s=>s.includes(r.B.id))||[r.B.id]).map(id=>S.w[id]).filter(Boolean);
 return `<div class="sd" id="sd" onclick="msTap()"><div class="sdpan${MS.cam==='b'?' at-b':''}" id="sdpan">${msCorner(win,'a')}${msCorner(bs,'b')}</div>
 <div class="sdspeed" id="sdspeed"></div><div class="sdflash" id="sdflash"></div><div class="msbooth" id="msbooth">Commentary</div><div class="sdfx" id="sdfx"></div></div>`}
function msHead(){return liveHd(MS.show,`Match ${MS.n} · Main event`,esc(msTitle(MS.m)),[],'● Live')+msActs()}
const MS_HOLD='<div class="sdbox k-cam"><div class="sdsay"></div></div><div class="sdhint">&nbsp;</div>';
function msFrame(low){openModal(`<div class="sdw msw">${msHead()}${msStage()}<div id="sdlow">${low||MS_HOLD}</div></div>`,true)}
function msFeed(){try{if(typeof partyFeed==='function'&&partyOn()){const b=document.querySelector('#modal .sbody');if(b)partyFeed(b.innerHTML)}}catch(e){}}
async function msPan(k){if(!MS||(k!=='a'&&k!=='b')||MS.cam===k)return;MS.cam=k;const p=document.getElementById('sdpan'),sp=document.getElementById('sdspeed');if(!p)return;
 if(sp)sp.classList.add('on');p.classList.toggle('at-b',k==='b');await msSleep(320);if(sp)sp.classList.remove('on')}
function msShout(s){const fx=document.getElementById('sdfx'),sd=document.getElementById('sd'),fl=document.getElementById('sdflash');if(!fx)return;
 fx.innerHTML=`<div class="sdshout ${s[1]||''}"><span>${esc(s[0])}</span></div>`;
 if(fl){fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on')}if(sd&&!msReduce()){sd.classList.remove('shake');void sd.offsetWidth;sd.classList.add('shake')}
 clearTimeout(MS.fxT);MS.fxT=setTimeout(()=>{const f=document.getElementById('sdfx');if(f&&f.querySelector('.sdshout'))f.innerHTML=''},1400)}
async function msStamp(t,cls,ms){const fx=document.getElementById('sdfx');if(!fx)return;clearTimeout(MS.fxT);fx.innerHTML=`<div class="sdstamp ${cls}">${esc(t)}</div>`;msFeed();await msSleep(ms||850);if(fx.querySelector('.sdstamp'))fx.innerHTML=''}
/* a line code → a page in the box */
function msPage(l){const [k,t,sh]=l;const r=MS.r;const text=msFill(t,r);
 const side=k==='A'||k==='qa'?'a':k==='B'||k==='qb'?'b':null;const kind=k==='qa'||k==='qb'?'q':k==='A'||k==='B'?'act':k==='p'||k==='c'?'booth':'cam';
 return {side,kind,t:text,who:k==='p'?'Play-by-play':k==='c'?'Colour':'',sh}}
/* moment texts are narration: sentences grouped into pages the box can hold; a page that starts with a wrestler's
   name turns the camera to them, the rest are camera notes */
function msNarr(text,rr){const g=MS.g&&MS.g.r||{};rr=rr||g;const A=rr.A||MS.r.A,B=rr.B||MS.r.B;
 const sent=String(text).match(/[^.!?…]+(?:[.!?…]+["”']?|$)\s*/g)||[String(text)];const out=[];let cur='';
 sent.forEach(x=>{x=x.trim();if(!x)return;if(cur&&(cur+' '+x).length>140){out.push(cur);cur=x}else cur=cur?cur+' '+x:x});if(cur)out.push(cur);
 const sideOf=t=>{const inA=(MS.m.sides[MS.m.winner]||[]).map(id=>S.w[id]&&S.w[id].name).filter(Boolean);const bs=(MS.m.sides.find(sd=>sd.includes(MS.r.B.id))||[]).map(id=>S.w[id]&&S.w[id].name).filter(Boolean);
  if([A&&A.name,...inA].some(n=>n&&t.startsWith(n)))return 'a';if([B&&B.name,...bs].some(n=>n&&t.startsWith(n)))return 'b';return null};
 return out.map(t=>{const sd=sideOf(t);return {side:sd,kind:sd?'act':'cam',t}})}
const people0=ctx=>({a:ctx.A,b:ctx.B,x:ctx.X});
function msBox(pg){const r=MS.r;const w=pg.side==='a'?r.A:pg.side==='b'?r.B:null;
 const tab=pg.kind==='booth'?`<div class="sdtab other">${esc(pg.who)}</div>`:w&&(pg.kind==='q')?`<div class="sdtab ${pg.side==='a'?'mine':'them'}${pg.side==='b'?' r':''}">${esc(w.name)}</div>`:'';
 const text=pg.kind==='q'?`“${pg.t}”`:pg.t;
 return `<div class="sdbox k-${pg.kind==='booth'?'q':pg.kind}${pg.kind==='booth'?' k-booth':''}" id="sdbox" onclick="msTap()">${tab}<div class="sdsay" id="sdsay" data-t="${esc(text)}">${esc(text)}</div><span class="sdnx" id="sdnx">▼</span></div><div class="sdhint">Tap to continue</div>`}
let MS_TYPE=null;
async function msShow(){const pg=MS.q[MS.qi];if(!pg)return;const low=document.getElementById('sdlow');if(!low){msFrame('');return msShow()}
 if(pg.side)await msPan(pg.side);const bb=document.getElementById('msbooth');if(bb)bb.classList.toggle('on',pg.kind==='booth');
 if(pg.sh)msShout(pg.sh);low.innerHTML=msBox(pg);msFeed();
 const spr=pg.side&&document.querySelector(`#sd .c${pg.side} .sdph`);if(spr){spr.classList.remove('talk','hit');void spr.offsetWidth;spr.classList.add(pg.sh?'hit':'talk')}
 const el=document.getElementById('sdsay');const done=()=>{const nx=document.getElementById('sdnx');if(nx)nx.classList.add('on')};if(!el||msReduce())return done();
 const t=el.dataset.t;let i=0;el.textContent='';const iv=setInterval(()=>{i+=2;el.textContent=t.slice(0,i);if(i>=t.length)fin()},20);
 const fin=()=>{clearInterval(iv);el.textContent=t;MS_TYPE=null;done()};MS_TYPE={fin}}
function msTap(){if(!MS||!MS.q)return;if(MS_TYPE){MS_TYPE.fin();return}MS.qi++;if(MS.qi<MS.q.length)return msShow();const a=MS.after;MS.q=null;MS.after=null;if(a)a()}
document.addEventListener('keydown',e=>{if(!MS||!MS.q||(e.key!==' '&&e.key!=='Enter'))return;if(e.target&&e.target.closest&&e.target.closest('button,input,select,textarea'))return;if(!document.getElementById('sdbox'))return;e.preventDefault();msTap()});
function msPlay(pages){return new Promise(res=>{pages=pages.filter(Boolean);if(!pages.length)return res();MS.q=pages;MS.qi=0;MS.after=res;msShow()})}
const msLines=ls=>ls.map(msPage);
/* the call menu: same buttons as every other call, so party-night TV shows which one you picked */
function msMenu(q,sub,items){return new Promise(res=>{MS.menu={q,sub,items,res};msDrawMenu()})}
function msDrawMenu(){const M=MS.menu;if(!M)return;const bb=document.getElementById('msbooth');if(bb)bb.classList.remove('on');
 const low=document.getElementById('sdlow');if(!low){msFrame('');return msDrawMenu()}
 low.innerHTML=`<div class="sdmenu">${callBar(M.q,M.sub)}${M.items.map((c,i)=>`<button class="choice" onclick="msPick(${i})"><span class="key"><span>${'ABCD'[i]}</span></span><div>${esc(c.label)}</div><div class="muted tiny">${c.info}</div></button>`).join('')}</div>`;msFeed()}
function msPick(i){if(!MS||!MS.menu)return;const M=MS.menu;pickFlash(()=>{if(!MS||MS.menu!==M)return;MS.menu=null;M.res(M.items[i])})}
function msInfo(c,r){const p=msChance(c,r);return `${c.al?`<span class="${c.al==='f'?'face':'heel'}">${c.al==='f'?'😇 Face move':'😈 Heel move'}</span> · `:''}${STAT_ICON[c.s]} · ${oddsWord(p)} · ${swingWord(swingOf(p,c.st).w)}${c.sub?' · '+esc(msFill(c.sub,r)):''}`}
const msItems=(list,r)=>list.map(c=>({c,label:msFill(c.t,r),info:msInfo(c,r)}));
async function msCall(list,lab,q,sub){const r=MS.r;const it=await msMenu(q,sub,msItems(list,r));const o=msRoll(it.c,r,MS.m,MS.st,lab);
 MS.log.push({lab,t:it.label,ok:o.ok});msFrame('');await msPan('a');await msStamp(o.ok?'It lands':'It misses',o.ok?'ok':'no');await msPlay(msLines(o.lines))}
/* the big moment: the same calls, odds and results as any other match moment */
async function msMomentAct(slot){const g=MS.g,m=MS.m,r=g.r;
 if(g.e.need==='X'&&r.X&&!g.gor){const X=r.X;const it=await msMenu('🎧 Your call in gorilla',`${esc(X.name)} wants to go out there and start something`,[{label:'Send them out there',info:`They crash the main event and could start a new rivalry · morale +${GOR_MOR}`,yes:1},{label:'Not tonight',info:`The match goes on as booked · morale −${GOR_MOR}`}]);
  gorMor(X,!!it.yes,true);if(!it.yes){const ng=genEvent(m,'p',true,true);if(ng&&ng.e.need!=='X'&&(msPlan(ng,m)==='heat')===(slot==='heat')){MS.g=ng;ng.gor=1;return msMomentAct(slot)}return null}g.gor=1}
 msFrame('');await msPlay(msNarr(evFill(g.e.text,r)));
 const ch=evChoices(g.e,m,r);const ck=CALLS[callKind(g)];
 const items=ch.map(c=>({c,label:evFill(c.t,r),info:`${c.al?`<span class="${c.al==='f'?'face':'heel'}">${c.al==='f'?'😇 Face move':'😈 Heel move'}</span> · `:c.heelA&&r.A.al==='f'?'<span class="heel">😈 Dirty — fans won\'t like it from a face</span> · ':''}${c.always?'✅ Guaranteed':STAT_ICON[c.s]+' · '+oddsWord(evChance(c,r))}${c.flip?' · changes the winner':''}${c.nc?' · no winner':''} · ${callStakes(c,g,c.always?null:evChance(c,r))}${g.sit&&c.tip?` · ${esc(sitTip(c,r))}`:''}${typeof rcTag==='function'?rcTag(c,g):''}`}));
 const note=(g.sit?g.info:'')+(g.r&&g.r.CROWD?(g.sit?' · ':'')+'👥 '+esc(g.r.CROWD.text):'');
 const it=await msMenu(`${ck.i} ${ck.n}`,note||ck.l,items);const w0=m.winner;
 const out=g.sit?sitRoll(it.c,r,m):evRoll(it.c,r,m);MS.log.push({lab:slot==='heat'?'Heat':'Finish',t:it.label,ok:out.success});
 msFrame('');await msStamp(out.success?'It lands':'It misses',out.success?'ok':'no');
 const pages=msNarr(out.text);pages.push({kind:'booth',who:'Play-by-play',t:pick(out.success?MS_BOOTH_OK:MS_BOOTH_NO)});
 (out.extra||[]).forEach(x=>pages.push({kind:'cam',t:x}));if(out.flip)pages.push({kind:'cam',t:`👑 New winner: ${sideName(m.sides[m.winner])}`});if(out.nc)pages.push({kind:'cam',t:'🚫 The match ends without a winner.'});
 out.over=msOver(m,out,w0)||(slot==='fin'&&msEnds(evFill(g.e.text,r)));
 /* at the finish, a call that keeps the match going still has to end it: the winner puts it away */
 if(slot==='fin'&&!out.over){const fam=msFam(m);const F=MS_FALL[fam==='pin'&&m.sides.length>2&&MS.r.C?'multi':fam];
  if(F){pages.push({kind:'cam',t:msFill(pick(['A minute later, {A} puts it away.','{A} regroups, and this time it\'s over.','It takes one more big move from {A}.']),MS.r)});pages.push(...msLines(F.end))}else pages.push({kind:'cam',t:msFill('A minute later, {A} puts it away and gets the win.',MS.r)});out.over=true}
 await msPlay(pages);return out}
function msIntro(m,hot){const ns=m.sides.map(sd=>sideName(sd));
 if(m.type==='rumble')return pick(['It\'s the Royal Rumble, and the clock is ticking down to the first entrant.','Royal Rumble time. Every number is a new chance.']);
 if(m.type==='gauntlet')return pick(['The Casino Gauntlet. Only one of them leaves a loser tonight.','Casino Gauntlet time. Nobody wants to be the one who gets pinned.']);
 if(m.type==='mitb')return 'Money in the Bank. The briefcase is hanging high above the ring.';
 const vs=ns.length===2?`${ns[0]} against ${ns[1]}`:`${ns.slice(0,-1).join(', ')} and ${ns[ns.length-1]}`;
 return pick(hot?[`${vs}, and this one has been building for weeks.`,`There is real bad blood here. ${vs}.`]:[`Main event time: ${vs}.`,`Main event: ${vs}. Buckle up.`,`${vs} closes the show tonight.`])}
async function msRun(){const m=MS.m;const fam=msFam(m);const plan=msPlan(MS.g,m);
 MS.act=0;msFrame('');const r0=MS.r;const hot=heatOf(r0.A.id,r0.B.id)>=30;
 await msPlay([{kind:'cam',t:pick(['The main event. The bell rings.','Main event time, and the crowd is on its feet for the opening bell.','Here we go. The main event is underway.'])},{kind:'booth',who:'Play-by-play',t:msIntro(m,hot)}]);
 await msCall(msDeal(MS_OPEN,MS.r,3),'Opening','🎬 The opening bell',`How does ${esc(MS.r.A.name)} start?`);
 MS.act=1;msFrame('');
 let over=false;
 if(plan==='heat'){const out=await msMomentAct('heat');if(out)over=out.over;else await msCall(msDeal(MS_HEAT,MS.r,3),'Heat','🎬 The heat','How does the middle of the match go?')}
 else await msCall(msDeal(MS_HEAT,MS.r,3),'Heat','🎬 The heat','How does the middle of the match go?');
 if(!over){MS.act=2;MS.r=msRoles(m,'p');const r=MS.r;msFrame('');
  if(fam!=='none'){const F=MS_FALL[fam==='pin'&&m.sides.length>2&&r.C?'multi':fam];
   await msPlay(msLines(pick(F.set)));if(F.count)for(const n of F.count)await msStamp(n,'count',560);
   const it=await msMenu('🏁 '+msFill(F.q,r),'You\'re calling the finish',[{label:msFill(F.kick,r),info:(pk=>`💪 In-ring · ${oddsWord(pk)} · ${swingWord(swingOf(pk,.6).w)} · ${esc(msFill(F.ksub,r))}`)(clamp(.25+((r.B.ring+r.A.ring)/2)/100*.6,.3,.85)),kick:1},{label:msFill(F.stay,r),info:`✅ Guaranteed · 🛡️ Small swing · ${esc(msFill(F.ssub,r))}`}]);
   if(it.kick){const o=msKick(m,r,MS.st,F,'Near fall');MS.log.push({lab:'Near fall',t:it.label,ok:o.ok});msFrame('');await msStamp(o.ok?'It lands':'It misses',o.ok?'ok':'no');await msPlay(msLines(o.lines));
    if(plan==='fin'&&MS.g)await msMomentAct('fin');
    else await msCall(msDeal(FIN[fam]||FIN_PIN,r,3),'Finish','🏁 Call the finish',`${esc(r.A.name)} is booked to win. How does it end?`)}
   else{MS.log.push({lab:'Near fall',t:it.label,ok:true});evNew(m).notes.push(`🎬 Near fall: ${it.label}`);msFrame('');await msPlay(msLines(F.end))}}
  else if(plan==='fin'&&MS.g)await msMomentAct('fin');
  else{msFrame('');await msPlay([{kind:'cam',t:msFill('{A} gets the win.',r)}])}}
 const r=msRoles(m,'p');MS.r=r;const pl=msPostDeal(r,m);
 if(pl.length){MS.act=3;msFrame('');const it=await msMenu('🎤 After the bell','What\'s the closing shot?',pl.map(c=>({c,label:msFill(c.t,r),info:`📖 Story only, no stars · ${esc(msFill(c.sub,r))}`})));
  msPost(it.c,r,m);MS.log.push({lab:'After',t:it.label,story:1,note:msFill(it.c.note||'',r)});msFrame('');await msStamp('Closing shot','gd',700);await msPlay(msLines(pick(it.c.hit)))}
 msDone()}
function msDone(){if(!MS)return;MS.fin=1;const m=MS.m;const rows=MS.log.map(e=>`<li><span class="mslab">${esc(e.lab)}</span><span>${esc(e.t)}</span><b class="${e.story?'msst':e.ok?'good':'bad'}">${e.story?'Story':e.ok?'Landed':'Missed'}</b></li>`).join('');
 const post=MS.log.find(e=>e.story);const res=m.nc?'No contest':`${sideName(m.sides[m.winner])} def. ${m.sides.filter((s,i)=>i!==m.winner).map(sideName).join(', ')}`;
 openModal(`<div class="sdw msw">${msHead()}<div class="msres"><h3>${esc(res)}</h3><ul class="mscalls">${rows}</ul>${post&&post.note?`<div class="muted tiny">${esc(post.note)}</div>`:''}<div class="muted tiny">The stars come in with the results.</div></div><button class="btn" onclick="msNext()">${MS.last?'Finish the show':'Continue the show ▸'}</button></div>`,true);msFeed()}
function msNext(){if(!MS||!MS.fin)return;MS=null;if(LQ)return liveNext();finishLive()}
function msStart(it,show,last){const m=it.m;const r=msRoles(m,'p');if(!r.A||!r.B)return false;
 MS={it,m,n:it.n,show,last,r,g:it.g||null,st:{},log:[],cam:'a',act:0};msRun().catch(e=>{console.error(e);if(MS){MS.fin=1;msNext()}});return true}
function renderMS(){if(!MS)return;if(MS.fin)return msDone();msFrame('');if(MS.q)return msShow();if(MS.menu)return msDrawMenu()}
Object.assign(window,{msTap,msPick,msNext,msStart,msAuto,msOn,renderMS,msMoment,msReset:()=>{MS=null},msLive:()=>!!MS});

(function(){const c=document.createElement('style');c.textContent=`
.msacts{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:-4px 0 10px}
.msacts span{font:900 italic 12px/1 'BC','Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;text-align:center;padding:5px 0 6px;background:#15161a;color:var(--mut);clip-path:var(--sl)}
.msacts span.done{color:var(--gold2)}.msacts span.on{background:var(--gold);color:#16120a}
.msbooth{position:absolute;top:10px;left:10px;z-index:3;display:flex;align-items:center;gap:6px;padding:3px 10px 4px;background:var(--red);color:#fff;font:900 italic 12px 'BC','Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;clip-path:var(--sl);opacity:0;transition:opacity .2s;pointer-events:none}
.msbooth.on{opacity:1}.msbooth::before{content:"";width:7px;height:7px;border-radius:50%;background:#fff;animation:msrec 1s infinite alternate}@keyframes msrec{to{opacity:.3}}
.sdbox.k-booth .sdsay{font-family:inherit;font-style:normal;font-weight:600;font-size:18px;line-height:1.45;text-transform:none;color:var(--text)}
.sdstamp.gd{background:var(--gold)}
.sdstamp.count{background:#f3efe6;font-size:clamp(56px,18vw,96px);padding:2px 26px 6px}
.msres{display:flex;flex-direction:column;gap:10px;margin:4px 0 14px;padding:16px;background:linear-gradient(90deg,rgba(216,180,73,.08),transparent 60%),#15161a;border:1px solid #3a3222;border-top:3px solid var(--gold);clip-path:var(--cut)}
.msres h3{margin:0;font:900 italic 22px/1.1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;color:#fff}
.mscalls{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.mscalls li{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:8px;align-items:baseline;font-size:14px;padding-bottom:6px;border-bottom:1px solid var(--line)}
.mscalls li:last-child{border-bottom:0}
.mslab{font:900 italic 12px 'BC','Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--gold2)}
.msst{color:#cfe0fb}
body.tv .tv-live-sheet .msw .msacts{grid-area:hd;margin-top:56px;align-self:end}
body.tv .tv-live-sheet .msacts span{font-size:18px}
body.tv .tv-live-sheet .sdstamp.count{font-size:120px}
body.tv .tv-live-sheet .msres h3{font-size:34px}body.tv .tv-live-sheet .mscalls li{font-size:22px;grid-template-columns:120px minmax(0,1fr) auto}
`;document.head.appendChild(c)})();
})();
