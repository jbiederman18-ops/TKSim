/* Tony Khan Simulator — After Dark (v268).
   An optional mode (⚙️ Game menu, off by default) that turns up the temperature in live promos and matches.
   It only adds lines to what the promo and match showdowns already play — the engine, calls, odds and scoring
   are untouched, so it never changes how a show rates.

   Two flavours, chosen by who's in the segment:
     • Smoulder — both wrestlers are created ORIGINAL characters (the 🎭 Original character box on the create
       screen). Charged, flirty, almost-a-kiss tension. Suggestive, never explicit.
     • Raw — everyone else, including every real wrestler on the roster and created wrestlers who are real people.
       Real people never get the smoulder lines: their After Dark is pure intensity — personal, venomous grudges.

   Pacing: at most two extra beats a promo and two a match, so promos don't get longer than they need to be.
   Lines are written without pronouns for the wrestlers (the game is gender-agnostic).
   Line codes: A>/B> = what {A}/{B} does (written without the name), a:/b: = said by {A}/{B}, P:/C: = play-by-play /
   colour commentary, ~ = the camera / the crowd. Loaded after matchshow.js. */
'use strict';
(function(){
const KEY='tksim_ad';
const on=()=>{try{return localStorage.getItem(KEY)==='1'}catch(e){return false}};
const PROMO_CAP=2,MATCH_CAP=2,P_OPEN=.7,P_AFTER=.45,P_MATCH=.5;

/* ================= promos ================= */
const PROMO={
 smoulder:{
  open:[
   ['~The lights drop low. Somebody in the crowd wolf-whistles.','A>circles {B} slowly, close enough to feel the heat coming off them.','a:You\'ve been thinking about this all week. Don\'t lie to me.'],
   ['B>leans in until their foreheads almost touch.','b:Careful. You\'re starting to look like you want this.','~Nobody in the building breathes.'],
   ['A>takes the mic, eyes never leaving {B}.','a:Every time I close my eyes, there you are. And I hate it.'],
   ['B>tilts {A}\'s chin up with one finger.','b:Look at me when you lie.'],
   ['~The camera catches it: neither of them is looking at the crowd anymore.','a:Say my name like that one more time.','B>smirks and says nothing at all.'],
   ['A>steps in close and whispers something off-mic.','~Whatever it was, {B} has to look away first. The crowd loses its mind.'],
   ['b:You know what your problem is? You can\'t decide if you want to beat me or—','A>presses a finger to {B}\'s lips.','a:Finish that sentence in the ring.'],
   ['~A slow, low "ooooh" rolls around the building.','B>looks {A} up and down, taking their time about it.','b:Not bad. Not bad at all.'],
   ['a:I\'ve studied every inch of you on tape. Every. Inch.','b:Funny. I didn\'t need the tape.'],
   ['A>straightens {B}\'s collar, far too gently.','a:There. Now you look like someone worth beating.'],
   ['~Someone in the front row fans themselves with a sign.','b:You\'re staring.','a:You\'re letting me.'],
   ['B>takes the mic back, fingers brushing {A}\'s and lingering there.','b:Whoops.']],
  after:[
   ['B>wets their lips, completely unbothered.','b:Keep talking. I like it when you get worked up.'],
   ['B>steps into {A}\'s space, chest to chest, breathing hard.','~The referee outside the ring isn\'t sure whether to step in.'],
   ['b:You say that like you haven\'t been dreaming about me.','~The crowd howls.'],
   ['B>laughs, low and slow.','b:You\'re cute when you\'re angry.'],
   ['~For a second it looks like they might kiss. Then it looks like they might kill each other. Maybe both.'],
   ['B>reaches out and tucks a loose strand of hair behind {A}\'s ear.','b:Easy. Save some of that for later.'],
   ['B>doesn\'t step back. Doesn\'t blink.','b:Closer. Say it closer.'],
   ['~The director cuts to a wide shot. The two of them haven\'t moved an inch apart.'],
   ['b:Mmm. Again.','~The building comes unglued.'],
   ['B>traces a slow line down {A}\'s arm with one finger.','b:We\'ll finish this somewhere with fewer witnesses.'],
   ['A>catches {B}\'s wrist mid-gesture and holds it a beat too long.','~Neither one pulls away.'],
   ['b:You\'re shaking.','a:So are you.']]},
 raw:{
  open:[
   ['~The lights stay harsh. Nobody\'s playing to the cameras tonight.','A>stares {B} down in dead silence for a full ten seconds.','a:I don\'t like you. I never have.'],
   ['B>spits on the mat at {A}\'s feet.','~A gasp, then a roar.'],
   ['a:This isn\'t a storyline anymore. You made it personal, so here we are.'],
   ['A>pulls the mic close, voice low and shaking.','a:I lie awake planning what I\'m going to do to you.'],
   ['B>gets right in {A}\'s face, nose to nose.','b:Then do something about it.'],
   ['~The truck kills the music. It\'s just the two of them and a building holding its breath.'],
   ['a:Everyone in the back tells me to let it go. I am not letting it go.'],
   ['B>shoves past security to get closer.','b:You don\'t get to walk away from me this time.'],
   ['~A fan in the upper deck yells "FIGHT!" and nobody laughs.'],
   ['A>slams the mic against the turnbuckle, then picks it back up.','a:Sorry. Where was I? Right. You.']],
  after:[
   ['B>doesn\'t flinch. Just smiles, cold.','b:That all you\'ve got?'],
   ['B>grabs {A} by the back of the neck and pulls them in close.','b:Say it again. I dare you.'],
   ['~Security hits the ring. Both of them shove security away without looking.'],
   ['b:You\'re going to regret every word of that.'],
   ['B>breathes hard, jaw clenched, fists white.','~The crowd is on its feet, waiting for the first punch.'],
   ['b:I\'ll see you in the ring. Bring a doctor.'],
   ['~Someone in the back cuts the house lights. When they come back up, the two are still nose to nose.'],
   ['B>laughs, but there\'s nothing funny in it.','b:Keep pushing. See what happens.'],
   ['B>slaps the mic out of {A}\'s hand.','~It thuds on the canvas and the place erupts.'],
   ['b:I know where you came from. I know what you\'re scared of. Keep talking.']]}};

/* ================= matches ================= */
const MATCH={
 smoulder:{
  0:[
   ['~The bell rings. Neither of them moves.','A>circles slowly, eyes locked on {B}.','C:Somebody turn up the air conditioning in here.'],
   ['A>locks up with {B} and neither one lets go, foreheads pressed together.','a:Missed me?','b:Every single day.'],
   ['B>wins a test of strength and pulls {A} in close instead of pressing the advantage.','~A low "ooooh" rolls through the crowd.'],
   ['P:A clean break in the corner... a very slow, very clean break.','C:Longest clean break I have ever seen.'],
   ['A>slaps {B} across the face. {B} just smiles and steps closer.','b:Do that again.'],
   ['~They meet in the middle of the ring, close enough to share a breath.','C:I feel like I should look away. I am not looking away.']],
  1:[
   ['A>pins {B} against the ropes and holds there, chest heaving.','b:You could finish it. You won\'t.','P:What is going on between these two?'],
   ['B>reverses the hold and ends up on top, face inches from {A}\'s.','~The camera lingers on the shot a little too long.'],
   ['C:These two have chemistry you can\'t teach.','P:Chemistry? Is that what we\'re calling it?'],
   ['A>wraps {B} up in a slow, grinding submission, both of them breathing hard.','a:Give up.','b:Make me.'],
   ['B>cups {A}\'s jaw gently... then cracks a forearm across it.','~Half the crowd swoons. The other half winces.'],
   ['~They roll to the floor in a tangle and come up still holding on to each other.','P:Somebody separate them! ...Nobody is separating them.'],
   ['A>whispers something into {B}\'s ear mid-headlock.','~Whatever it was, {B} goes red and fights out with a fury.']],
  3:[
   ['A>helps {B} up. Their hands stay locked a beat too long.','C:Get a room! ...I say that with respect.'],
   ['B>catches {A} on the ramp, spins them around, and the two just stare at each other, breathing hard.','~The show goes to commercial on that shot.'],
   ['A>kneels over {B} and brushes the hair out of their eyes.','a:Rematch. Your place or mine.','~The crowd explodes.'],
   ['B>pulls {A} into a slow, long embrace that nobody can read.','P:Is that respect? A threat? Something else?','C:Yes.'],
   ['~They stand nose to nose in the middle of the ring long after the bell, saying nothing.','C:I need a cold shower and I wasn\'t even in the match.']]},
 raw:{
  0:[
   ['~No handshake. No feeling-out process. The bell rings and they just collide.','P:They hate each other, folks, and they are not hiding it.'],
   ['A>spits at {B}\'s feet before the bell.','B>doesn\'t wait for the referee.'],
   ['a:I\'ve waited months for this.','b:Then stop talking.','P:And here we go!'],
   ['A>and {B} trade open-hand slaps so loud they echo off the rafters.','C:You could hear that in the parking lot.'],
   ['~The referee tries to check them for weapons. Neither one will look away from the other long enough to let him.']],
  1:[
   ['A>grinds a forearm across {B}\'s face.','a:Look at me. LOOK at me.','C:That\'s not wrestling, that\'s a grudge.'],
   ['B>bites down on {A}\'s fingers to break the hold.','P:Nothing is off limits tonight!'],
   ['~They spill into the crowd, still swinging. Fans scatter.','P:Security! Somebody!'],
   ['B>stomps a mudhole in {A} in the corner, screaming the whole time.'],
   ['A>rakes {B}\'s eyes and drags them back up.','b:Is that all?','C:This is personal. This is so personal.'],
   ['P:I\'ve called a lot of matches. I don\'t like how this one feels.','C:Me neither. And I can\'t look away.']],
  3:[
   ['A>keeps swinging after the bell. It takes three referees to pull them apart.'],
   ['B>staggers up and points straight at {A}.','b:This isn\'t over. Not even close.'],
   ['~The winner\'s music hits, but nobody\'s celebrating. They\'re still screaming at each other all the way up the ramp.'],
   ['A>stands over {B}, breathing hard, and grabs a mic.','a:Again.'],
   ['B>shoves a referee aside to get one last look at {A}.','~The cameras follow them all the way to the back.']]}};

/* ================= picking and building ================= */
const USED={};
function draw(key,list){const u=USED[key]||(USED[key]=new Set());if(u.size>=list.length)u.clear();
 const free=list.map((x,i)=>i).filter(i=>!u.has(i));const i=free[Math.floor(Math.random()*free.length)];u.add(i);return list[i]}
const orig=w=>!!(w&&w.oc&&w.cw);
const flavour=(A,B)=>orig(A)&&orig(B)?'smoulder':'raw';
const fillN=(t,A,B)=>String(t).replace(/\{A\}/g,A.name).replace(/\{B\}/g,B.name);
/* promo pages: acts are shown "(…)" under the speaker's tab, so they're written without the name */
function promoPage(l,A,B){const c=l.slice(0,2),t=fillN(l.slice(2),A,B);
 if(l[0]==='~')return {cam:fillN(l.slice(1),A,B)};
 if(c==='A>')return {side:'a',act:t};if(c==='B>')return {side:'b',act:t};
 if(c==='a:')return {side:'a',q:t};if(c==='b:')return {side:'b',q:t};return {cam:fillN(l,A,B)}}
/* match pages: acts are narration, so they lead with the name */
function matchPage(l,A,B){const c=l.slice(0,2),t=fillN(l.slice(2),A,B);
 if(l[0]==='~')return {side:null,kind:'cam',t:fillN(l.slice(1),A,B)};
 if(c==='A>')return {side:'a',kind:'act',t:A.name+' '+t};if(c==='B>')return {side:'b',kind:'act',t:B.name+' '+t};
 if(c==='a:')return {side:'a',kind:'q',t};if(c==='b:')return {side:'b',kind:'q',t};
 if(c==='P:')return {side:null,kind:'booth',who:'Play-by-play',t};if(c==='C:')return {side:null,kind:'booth',who:'Colour',t};
 return {side:null,kind:'cam',t:fillN(l,A,B)}}

window.adPromo=function(pages,PS){try{
 if(!on()||!PS||!PS.ctx||!pages||!pages.length)return pages;const A=PS.ctx.A,B=PS.ctx.B;if(!A||!B)return pages;
 if((PS._ad||0)>=PROMO_CAP)return pages;
 const last=pages[pages.length-1];const after=!!(last&&last.stamp);
 if(Math.random()>(after?P_AFTER:P_OPEN))return pages;
 const fl=flavour(A,B);const set=PROMO[fl][after?'after':'open'];
 const add=draw('p'+fl+(after?'a':'o'),set).map(l=>promoPage(l,A,B));PS._ad=(PS._ad||0)+1;
 return after?pages.slice(0,-1).concat(add,[last]):pages.concat(add)}catch(e){console.warn(e);return pages}};

window.adMatch=function(pages,MS){try{
 if(!on()||!MS||!MS.r||!MS.m||!pages||!pages.length)return pages;const A=MS.r.A,B=MS.r.B;if(!A||!B)return pages;
 if((MS.m.sides||[]).length>2||MS.m.type==='rumble'||MS.m.type==='gauntlet')return pages;
 const act=MS.act||0;if(act===2)return pages;   /* never in the middle of a finish */
 if((MS._ad||0)>=MATCH_CAP||Math.random()>P_MATCH)return pages;
 const fl=flavour(A,B);const set=MATCH[fl][act];if(!set)return pages;
 MS._ad=(MS._ad||0)+1;return pages.concat(draw('m'+fl+act,set).map(l=>matchPage(l,A,B)))}catch(e){console.warn(e);return pages}};

/* the badge on the stage — it's in the stage's own markup, so party-night TV shows it too */
window.adBadge=function(A,B){if(!on()||!A||!B)return '';return `<div class="adbadge${flavour(A,B)==='smoulder'?' sm':''}">🌙 After Dark</div>`};

/* the Game menu card */
window.adSet=function(v){try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}if(typeof render==='function')render()};
window.adCard=function(){const o=on();return `<div class="card"><div class="row sb"><div class="h small" style="margin:0">🌙 After Dark</div><div class="chips" style="margin:0"><button class="chip ${o?'on':''}" onclick="adSet(true)">On</button><button class="chip ${o?'':'on'}" onclick="adSet(false)">Off</button></div></div>
 <p class="muted tiny" style="margin:8px 0 0">Live promos and matches get more heated. Real wrestlers get raw, personal intensity. When both wrestlers are created <b>🎭 Original characters</b>, the tension turns flirty and charged. Adds a couple of lines here and there; it never changes how a segment rates.</p></div>`};

(function(){const c=document.createElement('style');c.textContent=`
.sd .adbadge{position:absolute;top:8px;right:10px;z-index:5;pointer-events:none;padding:2px 10px 3px;background:rgba(9,9,11,.82);color:#c9b6ff;font:900 italic 12px 'BC','Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;clip-path:var(--sl);border-left:3px solid #7a5cff}
.sd .adbadge.sm{color:#ffb3c7;border-color:#e2334b}
body.tv .tv-live-sheet .sd .adbadge{font-size:18px;padding:4px 14px 5px}`;document.head.appendChild(c)})();
})();
