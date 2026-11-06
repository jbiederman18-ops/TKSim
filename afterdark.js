/* After Dark is broadcast dialogue only. Callers opt in at a known point in
   the segment, where the extra beat can follow the action already on screen. */
'use strict';
(function(){
const KEY='tksim_ad', MODE_KEY='tksim_ad_mode';
const MODES={auto:'Auto',raw:'Grudge',smoulder:'Tension'};
const CAP=2, RAW_HEAT=30;
const on=()=>{try{return localStorage.getItem(KEY)==='1'}catch(e){return false}};
function preference(){
 try{const mode=localStorage.getItem(MODE_KEY);return Object.hasOwn(MODES,mode)?mode:'auto'}catch(e){return 'auto'}
}
function flavour(state,A,B){
 if(!state.adTone){const mode=preference();
  state.adTone=mode==='auto'?(heatOf(A.id,B.id)>=RAW_HEAT?'raw':'smoulder'):mode}
 return state.adTone;
}
/* The show engine uses Math.random. These cosmetic draws have their own source. */
const roll=new Uint32Array(1);
function random(){return crypto.getRandomValues(roll)[0]/0x100000000}
const USED=new Map();
function draw(lines){
 const last=USED.get(lines);
 const choices=lines.filter(beat=>beat!==last);
 const beat=choices.length?choices[Math.floor(random()*choices.length)]:lines[0];
 USED.set(lines,beat);
 return beat;
}
const fillN=(t,A,B)=>t.replace(/\{A\}/g,()=>A.name).replace(/\{B\}/g,()=>B.name);

/* a/b are spoken lines, p/c are booth calls, x is a camera note.
   Keep studio dialogue free of physical spots. Match spots can echo the
   current action, or follow a compatible closing shot, without changing it. */
const PROMO={
 raw:{
  open:[
   [['a',"I want the first shot to split your lip. I want you to taste it every time you think about asking for a rematch."]],
   [['a',"{B}, if you want me to stop, tell the referee. I want everybody to hear you do it."]],
   [['a',"When you put your hand on the rope, I'm going to make the referee count to four. Then we'll find out if you're stupid enough to reach for it twice."]],
   [['a',"I can win in three seconds. I want to see how long it takes you to realize I'd rather make you give up."]],
   [['a',"There's a look people get when they finally realize they have to fight their way out. That's the part I'm here for."]],
   [['a',"You can come out smiling, {B}. By the end I want the camera close enough to see where the blood gets between your teeth."]]],
  exchange:[
   [['a',"That's the voice I want you to use when you're asking the ref to get me off you."],['b',"You'll have to get me down first."]],
   [['a',"You want to know what I think of you? I'm going to leave it across your chest in the shape of my hand."]],
   [['a',"Keep going. I want to know which word you're going to regret first."],['b',"All of them if you can make me."]],
   [['a',"When you're swallowing blood, try saying that again. I want to see which one you choke on."]],
   [['a',"I was going to settle for a pin. Say it like that one more time and I'll make you give up where everybody can see it."]],
   [['a',"I'm going to work that arm until you forget which hand you were pointing with."],['b',"Get close enough to take it."]]]},
 smoulder:{
  open:[
   [['a',"I've watched enough tape to know exactly how close you get before you throw a shot. That's the part I keep rewinding."]],
   [['a',"{B}, you can get close enough to make me forget what I was going to say. The problem is I know I can do the same thing to you."]],
   [['a',"If you're going to look at me like that, at least wait until I've finished pretending I came out here to talk."]],
   [['a',"All week I've been thinking about that first lockup. The half second before either of us decides what to do with our hands."]],
   [['a',"I like it when you try to get under my skin. You always get a little too close and wait to see if I'll move."]],
   [['a',"The bell only tells me when I have to let go. It doesn't tell me how long I'm allowed to think about it afterward."]]],
  exchange:[
   [['a',"You do that thing with your voice when you want me to come closer."],['b',"And you always notice."]],
   [['a',"Keep looking at my mouth. I'll tell you when you miss something."],['b',"I heard you just fine."]],
   [['a',"I can feel you waiting for me to back off."],['b',"I was waiting to see if you wanted to."]],
   [['a',"Careful. There's a difference between getting in my head and making me want you there."],['b',"I know."]],
   [['a',"Ask me again when there's nobody else to hear what I say."],['b',"I'd rather hear you say it now."]],
   [['a',"If you wanted me to keep my distance, you'd stop giving me reasons to close it."],['b',"Who said I wanted that?"]]]}
};
const MATCH={
 raw:{
  open:[
   [['a',"First one across the mouth is free."],['b',"Come collect the second one."]],
   [['p',"Listen to how quiet they've gone now that the bell's rung."],['c',"You only get that look when the other person can hear you breathe."]],
   [['a',"When it starts to hurt, look at me."],['b',"I plan to."]],
   [['c',"Watch the hands. They're both leaving their chins out there because they want an excuse to hit first."]]],
  heat:[
   [['c',"There are easier ways to win a match. Neither one of them is looking for one."]],
   [['p',"Somebody at ringside just flinched harder than either wrestler."],['c',"They're sitting twelve feet away. It sounds a lot worse in there."]],
   [['c',"Every time they get a second to breathe, they spend it looking for somewhere else to hit."]],
   [['p',"Keep a camera tight on them. I want to see who takes the first full breath."]]],
  limb:[
   [['c',"That's the knee {A} went after. Watch {B} try to put weight on it. {A} is watching, too."]],
   [['p',"You could hear {B} cry out over the crowd."],['c',"And you could see the second {A} decided to go back to the same leg."]]],
  cheat:[
   [['c',"The referee missed the rake. {B} knows exactly whose fingers those were."]],
   [['p',"{B} is trying to blink the sting out of their eyes."],['c',"Good luck watching for the next one while you're doing that."]]],
  floor:[
   [['p',"The fans got out of the way just in time."],['c',"You could hear the barricade hit the concrete. Imagine being the one who went over it."]],
   [['p',"The people in that row aren't cheering yet. They're still looking for somewhere safe to stand."]]],
  beat:[
   [['x',"{A} lunges between two officials for one more forearm. They catch the arm before it lands."],['a',"You can ring it again. I heard it the first time."]],
   [['p',"The result is official. Look at the way the referees are standing between them."],['c',"They're making sure {B} gets out with what they came in with."]]],
  jumped:[
   [['b',"That's for turning your back. You want the rest, turn around."],['p',"Somebody get between them. {B} is still looking for a way in."]],
   [['x',"{B} drops to one knee and lands one more forearm before a referee hauls them back."],['c',"{B} waited until there was nobody between them. That was the point."]]],
  hostile:[
   [['c',"Put whatever result you want in the book. Neither of them got what they came here for."]],
   [['p',"Keep the camera on them. This is the face they're both going to remember when they get home."]]]},
 smoulder:{
  open:[
   [['b',"You could've taken a step back when the bell rang."],['a',"You first."]],
   [['a',"How close do you need me?"],['b',"I'll tell you when you get there."]],
   [['b',"You're staring."],['a',"I like watching you decide how close you're going to get."]],
   [['p',"The crowd went quiet enough to hear the bell stop ringing."],['c',"Feels like we're interrupting something, doesn't it?"]]],
  heat:[
   [['a',"You still want me to give you room?"],['b',"I never asked you to."]],
   [['b',"You're breathing harder now."],['a',"You keep finding reasons to get close enough to check."]],
   [['a',"Tell me when you've had enough."],['b',"You'd like hearing me say that, wouldn't you?"]],
   [['c',"Every time there's space between them, one of them closes it. I can't tell who's doing it on purpose."]],
   [['b',"You looked away."],['a',"Just long enough to find out if you were still watching."]]],
  respect:[
   [['x',"The camera stays on their hands for the last beat of the handshake."],['a',"Funny how much easier it is to let go when somebody tells you to."]],
   [['b',"Good match."],['a',"Say it again without the cameras."]],
   [['c',"That handshake took a little longer than it needed to."],['p',"I think they both knew it."]]],
  stare:[
   [['b',"You know you can leave."],['a',"I know. You haven't asked me to."]],
   [['a',"If I move now, are you going to follow me?"],['b',"Do you want me to?"]],
   [['c',"We can go to break whenever they stop looking at each other. I wouldn't count on that being soon."]]]}
};
const PROMO_TYPES=new Set(['callout','champ','contract','interview']);
const VERBAL=new Set(['mock','flip','brag','defy','personal','threat']);
const HOSTILE=new Set(['slap','pose','fight','stare']);
const GRUDGE_SPOTS=new Set(['limb','cheat','floor']);
function promoEligible(PS){
 const {A,B,K}=PS.ctx;
 return !!(PS.live&&A&&B&&PROMO_TYPES.has(PS.p.type)&&K&&(K.has('live')||K.has('studio'))
   &&!inTeam(A.id,B.id));
}
function matchEligible(MS){
 const {A,B}=MS.r;
 return !!(A&&B&&!MS.m.nc&&MS.m.type==='singles'&&MS.m.sides.length===2&&MS.m.sides.every(side=>side.length===1));
}
function extend(pages,state,pool,odds,pageOf){
 if(!pages.length||!pool||(state._ad||0)>=CAP||random()>=odds)return pages;
 const {A,B}=state.ctx||state.r;
 state._ad=(state._ad||0)+1;
 return pages.concat(draw(pool).map(([code,line])=>pageOf(code,fillN(line,A,B))));
}
function adPromo(pages,PS,slot){
 if(!on()||!promoEligible(PS))return pages;
 if(slot==='exchange'&&(!VERBAL.has(PS.scene.m)||PS.st.ex?.bGone||PS.st.gone||PS.ctx.BGONE||PS.ctx.BDOWN))return pages;
 return extend(pages,PS,PROMO[flavour(PS,PS.ctx.A,PS.ctx.B)][slot],slot==='open'?.8:.7,(side,q)=>({side,q}));
}
function adMatch(pages,MS,slot,detail){
 if(!on()||!matchEligible(MS))return pages;
 const {A,B}=MS.r, mode=flavour(MS,A,B);
 let key=slot;
 if(slot==='post'){
  if(mode==='raw')key=detail==='beat'||detail==='jumped'?detail:HOSTILE.has(detail)?'hostile':null;
  else key=detail==='shake'?'respect':detail==='stare'?'stare':null;
 }else if(slot==='heat'&&mode==='raw'&&GRUDGE_SPOTS.has(detail))key=detail;
 const odds=slot==='open'?.5:slot==='post'?.9:.8;
 return extend(pages,MS,MATCH[mode][key],odds,(code,t)=>{
  if(code==='x')return {kind:'cam',t};
  if(code==='p'||code==='c')return {kind:'booth',who:code==='p'?'Play-by-play':'Colour',t};
  return {side:code,kind:'q',t};
 });
}
function adBadge(state,kind){
 if(!on()||!(kind==='promo'?promoEligible(state):matchEligible(state)))return '';
 const {A,B}=kind==='promo'?state.ctx:state.r, mode=flavour(state,A,B);
 return `<div class="adbadge${mode==='smoulder'?' sm':''}">🌙 ${MODES[mode]}</div>`;
}
function adSet(v){try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}if(typeof render==='function')render()}
function adSetMode(mode){
 if(!Object.hasOwn(MODES,mode))return;
 try{localStorage.setItem(MODE_KEY,mode)}catch(e){}
 if(typeof render==='function')render();
}
function adCard(){
 const o=on(), selected=preference();
 const modes=Object.entries(MODES).map(([mode,label])=>`<button class="chip ${mode===selected?'on':''}" aria-pressed="${mode===selected}" onclick="adSetMode('${mode}')">${label}</button>`).join('');
 return `<div class="card"><div class="row sb"><div class="h small" style="margin:0">🌙 After Dark</div><div class="chips" style="margin:0"><button class="chip ${o?'on':''}" onclick="adSet(true)">On</button><button class="chip ${o?'':'on'}" onclick="adSet(false)">Off</button></div></div>
 <p class="muted tiny" style="margin:8px 0 0">Extra dialogue for any roster pairing in eligible live face-offs and singles matches. <b>Grudge</b> brings threats and rougher action. <b>Tension</b> brings mutual flirtation. <b>Auto</b> chooses Grudge for heated rivalries and Tension for the rest. Ratings work the same.</p>
 ${o?`<div class="chips" role="group" aria-label="After Dark tone" style="margin:8px 0 0">${modes}</div>`:''}</div>`;
}
Object.assign(window,{adPromo,adMatch,adBadge,adSet,adSetMode,adCard});

(function(){const c=document.createElement('style');c.textContent=`
.sd .adbadge{position:absolute;top:8px;right:10px;z-index:5;pointer-events:none;padding:2px 10px 3px;background:rgba(9,9,11,.82);color:#c9b6ff;font:900 italic 12px 'BC','Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;clip-path:var(--sl);border-left:3px solid #7a5cff}
.sd .adbadge.sm{color:#ffb3c7;border-color:#e2334b}
body.tv .tv-live-sheet .sd .adbadge{font-size:18px;padding:4px 14px 5px}`;document.head.appendChild(c)})();
})();
