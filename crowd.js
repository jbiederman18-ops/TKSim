/* Tony Khan Simulator — the crowd as a character (v228): Read the Crowd and Crowd Hijack.
   The crowd only steps in when there's a real reason, and never more than once a show (CRWD):
   • Read the crowd — on a finish call (or a big-moment call in a main event, title match or PPV), when the match has
     a reason for the crowd to lean (a hot feud, a big popularity gap, a title, a PPV), about half the finish calls
     that qualify get a tell: who or what the crowd wants. Calls that give it to them are tagged and earn +¼★ when
     they land; calls that go against them build heat instead. The good options against the crowd are still there.
   • Crowd hijack — rarely, in a live promo, the crowd starts chanting for someone else on the roster who is clearly
     more over than the people in the ring (and nobody in the ring is a top star). It replaces the twist: fight it,
     lean into it (they come out — a rub, a rivalry or a new star), or cut to commercial (safe, weak).
   Both work the same for the rival's show. Loaded after the main script and retorts.js. */
'use strict';
(function(){
const CRWD={p:0,ai:0};
const crowdFree=b=>!CRWD[b||'p'];
const crowdUse=b=>{CRWD[b||'p']=1};
const RC_BONUS=.25,RC_HEAT=8;
const HJ_P=.22;   /* chance a qualifying live promo gets hijacked */
const RC_P={finish:.5,spot:.3};
const last=n=>String(n||'').split(' ').slice(-1)[0];

/* ---------- read the crowd ---------- */
const RC_TELL={
 faceA:[`The crowd is desperate to see {FAV} finish {OTH} off.`,`"{FAVL}! {FAVL}!" — the fans want to see {OTH} get what's coming.`,`Every shot {OTH} takes gets a cheer. They want {FAV} to end this.`,`They've waited weeks for this. They want {FAV} to put {OTH} away.`],
 faceB:[`The crowd is begging for a {FAV} comeback.`,`The fans are stomping and clapping, willing {FAV} back into this.`,`They won't let {FAV} stay down — the whole building wants a comeback.`,`"Let's go, {FAVL}!" is shaking the arena. They want {FAV} to fight back.`],
 upset:[`They smell an upset. Every near-fall for {FAV} gets louder.`,`Nobody gave {FAV} a chance — now the crowd thinks they can pull it off.`,`The underdog chants are deafening. They want {FAV} to steal it.`],
 epic:[`This crowd wants it to go the distance.`,`They're on their feet chanting "This is awesome!" — nobody wants this to end yet.`,`They paid to see a war, and they want one.`,`Both sets of fans are dueling chants. They want an epic.`]};
/* v231: c.rc pins a call's reading when its wording was rewritten (c cheat, e epic, b {B}'s moment, x cuts {B} off, m {A}'s moment; '-' none) */
function rcTag1(c,lk,favIsA){const t=(c.t||'').toLowerCase();const P=c.rc!=null?c.rc:null;const has=(k,re)=>P!=null?P.includes(k):re.test(t);
 const bWin=!!(c.flip||c.loseOk);
 const cheat=!!(c.heelA||has('c',/cheap shot|feet on the ropes|leverage|stall|regroup|roll out|human shield|shush|rake|low blow|debris|sit on the lead|let \{b\} go|by count-out/));
 const epic=has('e',/one more|false finish|trade|go for broke|everything left|until one stays down|near-fall|dig deep|fight back|flurry/)||((c.st||0)>=.75&&c.s==='ring');
 const bMoment=bWin||has('b',/\{b\}[^.]*(comeback|stagger|steals|completes|survive)|let \{b\} make|small package|out of nowhere/);
 const aCut=has('x',/cut[^.]*(comeback|off)|make sure|finish it|unload|ignore the plea|finisher clean/);
 const aMoment=(!bWin&&!cheat&&(c.s==='ring'||c.s==='pop')&&(c.st||0)>=.5)||has('m',/fires up|comeback flurry|rises to their own feet|stares [^.]* down|finish it|finisher clean/);
 if(lk==='face'){if(favIsA){if(bWin||cheat)return 'a';if(aMoment||c.al==='f')return 'w';return ''}if(bMoment)return 'w';if(cheat||aCut)return 'a';return ''}
 if(lk==='upset'){if(bMoment)return 'w';if(aCut||cheat||(aMoment&&!epic))return 'a';return ''}
 if(epic&&!bWin&&!cheat)return 'w';if(cheat||(c.always&&(c.st||0)<=.25&&!bWin))return 'a';return ''}
function rcTry(g,m,brand,big){if(!crowdFree(brand)||!m||!m.sides||m.sides.length!==2)return;
 const kind=callKind(g);if(kind!=='finish'&&kind!=='spot')return;if(kind==='spot'&&!(big||m.title))return;
 const r=g.r,A=r&&r.A,B=r&&r.B;if(!A||!B)return;
 const heat=heatOf(A.id,B.id),ppv=!!PPVS[S.week],gap=A.pop-B.pop;
 if(!(heat>=40||ppv||m.title||Math.abs(gap)>=15))return;
 if(Math.random()>=RC_P[kind])return;
 let lk,fav=null;
 if(gap>=15&&(B.al==='f'||hasT(B,'under'))&&Math.random()<.6){lk='upset';fav=B}
 else if(A.al!==B.al){lk='face';fav=A.al==='f'?A:B}
 else if(heat>=40||ppv){lk='epic'}
 else{lk='face';fav=A.pop>=B.pop?A:B}
 const favIsA=fav===A;const tags={};let w=0,o=0;
 (g.e.ch||[]).forEach(c=>{const tg=rcTag1(c,lk,favIsA);tags[c.t]=tg;if(tg==='w')w++;else o++});
 if(!w||!o)return;
 const oth=fav?(fav===A?B:A):null;const key=lk==='face'?(favIsA?'faceA':'faceB'):lk;
 const text=fpick(RC_TELL[key]).replace(/\{FAVL\}/g,fav?last(fav.name):'').replace(/\{FAV\}/g,fav?fav.name:'').replace(/\{OTH\}/g,oth?oth.name:'');
 r.CROWD={lk,tags,text};crowdUse(brand)}
function rcNote(g){const C=g&&g.r&&g.r.CROWD;return C?`<div class="note crowdn">👥 <b>Read the crowd:</b> ${esc(C.text)}</div>`:''}
function rcTag(c,g){const C=g&&g.r&&g.r.CROWD;if(!C)return '';const t=C.tags[c.t];return t==='w'?' · <span class="good">👥 Gives them what they want</span>':t==='a'?' · <span class="bad">👥 Goes against them</span>':''}

/* ---------- crowd hijack ---------- */
const HJ_TXT={solo:[`The crowd starts chanting "{H}! {H}!" — they've stopped listening to {A}.`,`A "We want {H}!" chant rolls around the arena, louder every second.`,`Half the building is chanting for {H}. {A} has lost the room.`,`Somebody holds up a giant {H} sign, and the whole section starts chanting.`],
 duo:[`Neither {A} nor {B} can get a word in — the whole crowd is chanting for {H}.`,`"We want {H}!" drowns out {A} and {B} mid-sentence.`,`The fans have decided this segment needs {H}. The chant won't stop.`]};
const HJ_SAFE={t:`Cut to commercial`,safe:1,always:1,s:'luck',tip:'Safe, but a weak finish to the segment',ok:`The director cuts away. Nobody's thrilled, but the segment survives.`,g:`{A} smiles into the hard camera over the chant. "Don't go anywhere." The director cuts away on it. Nobody's thrilled, but the segment survives.`};
function hjChoices(A,H){const ch=[];
 if(A.al==='f'){
  ch.push({t:`Tell them {H} will get their turn — tonight is {A}'s`,s:'mic',d:.15,p:3,h:4,ok:`"I love {H} too. They'll get their turn. Tonight is mine." Gracious and firm. The crowd comes back around.`,g:`{A} lets the chant run, nods along, then raises a hand. "I hear you. {H} will get their night." A beat. "This one's mine." Gracious and firm. The crowd comes back around to {A}.`,no:`The chant only gets louder. {A} has lost them.`,b:`"{H} will get their turn! Tonight it's — it's — " The chant drowns out the rest. {A} has lost them.`});
  if(H.al==='f')ch.push({t:`Lean into it — call {H} out to the ring`,hj:'join',s:'pop',d:.05,p:2,tip:`{H} gets a big rub`,ok:`"Okay! {H}, get out here!" {H} comes out to a monster pop and stands with {A}. A moment nobody planned.`,g:`{A} turns to the stage and holds the mic out. "Well? You heard them, {H}." {H} comes out to a monster pop and stands with {A}. A moment nobody planned.`,no:`{H} doesn't come out. The chant dies awkwardly.`,b:`{A} calls {H} out by the wrong name. {H} doesn't come out. The chant dies awkwardly.`});
  else ch.push({t:`Lean into it — call {H} out to settle it`,hj:'face',s:'pop',d:.1,hx:12,p:2,tip:`Could start something with {H}`,ok:`"Fine. {H}, come out here and let's settle it." {H} walks out to a roar, nose to nose with {A}. Something's starting.`,g:`"You want {H}?" {A} points to the curtain. "Then let's find out right now who they'd rather have." {H} walks out to a roar and goes nose to nose with {A}. Something's starting.`,no:`{H} stays in the back. The crowd groans.`,b:`"{H}! Come settle it! Come — settle it." Nobody comes. The crowd groans.`})}
 else{
  ch.push({t:`Tell them {H} isn't coming to save them`,s:'mic',d:.15,p:2,hx:6,ok:`"Keep chanting. {H} isn't coming to save you." The boos are thunderous — pure heat for {A}.`,g:`{A} lets them chant, then laughs. "{H}'s in catering. {H} isn't coming. Nobody's coming. It's just me." The boos are thunderous — the chant turns into pure heat for {A}.`,no:`They just chant louder. {A} storms around the ring.`,b:`"{H} isn't coming!" A pause. "Probably." They just chant louder. {A} storms around the ring.`});
  if(H.al==='f')ch.push({t:`Call {H} out — then jump them on the ramp`,hj:'attack',s:'luck',d:.1,hx:14,p:2,tip:`Starts something with {H}`,ok:`{A} calls {H} out, then jumps them on the ramp. The fans are livid.`,g:`{A} waves {H} out with a big smile, offers a hand at the bottom of the ramp, and as {H} reaches for it — the shot. {H} comes out to a hero's welcome and {A} ambushes them. The fans are livid.`,no:`{H} sees it coming and sends {A} scrambling.`,b:`{A} calls {H} out and charges too early, before {H} is even through the curtain. {H} sends {A} scrambling.`});
  else ch.push({t:`Wave {H} out and share the spotlight`,hj:'join',s:'pop',d:.05,p:2,tip:`{H} gets a big rub`,ok:`{A} waves {H} out to share the spotlight. They soak in the boos together. A dangerous pairing.`,g:`{A} waves {H} out, and they stand shoulder to shoulder, soaking in the boos without a word, both smiling. A dangerous pairing.`,no:`{H} waves from the stage and leaves {A} hanging.`,b:`{A} waves {H} out and {H} waves back from the stage, then leaves. {A} is left hanging.`})}
 ch.push(HJ_SAFE);return ch}
function hjTry(p,ctx,ai){if(!p||!ctx||!ctx.A||!S)return null;const brand=ctx.brand||'p';
 if(brand==='p'&&!ai&&!LIVE)return null;if(!crowdFree(brand))return null;
 if(!['callout','champ','contract','rally'].includes(p.type))return null;
 const K=ctx.K||new Set();if(!K.has('live'))return null;
 const A=ctx.A,B=ctx.B;const top=Math.max(A.pop,B?B.pop:0);if(top>=82)return null;
 const cands=Object.values(S.w).filter(w=>w.own===brand&&!w.inj&&w.id!==A.id&&(!B||w.id!==B.id)&&w.pop>=Math.max(65,top+10)&&(w.al==='f'||w.pop>=82)&&!inTeam(w.id,A.id));
 if(!cands.length||Math.random()>=HJ_P)return null;
 const H=wpick(cands,w=>Math.max(1,w.pop-60));ctx.H=H;ctx.X=H;ctx.MYST=null;ctx.CD=null;crowdUse(brand);
 const ch=hjChoices(A,H);const text=fpick(B?HJ_TXT.duo:HJ_TXT.solo);if(!ai)noteP([text]);
 return {text,ch,hj:1}}

/* ---------- hooks ---------- */
const _gl=goLive;goLive=function(){if(!LIVE)CRWD.p=0;return _gl.apply(this,arguments)};
/* the rival's show (and the next week's live show) start with a fresh crowd */
const _ap=airPair;airPair=function(){CRWD.ai=0;CRWD.p=0;return _ap.apply(this,arguments)};
const _pt=pickTwist;pickTwist=function(p,ctx,ai){let h=null;try{h=hjTry(p,ctx,ai)}catch(e){console.warn(e)}return h||_pt(p,ctx,ai)};
const _me=matchEvent;matchEvent=function(m,brand,big,rate){const g=_me(m,brand,big,rate);if(g&&!g.sit)try{rcTry(g,m,brand,big)}catch(e){console.warn(e)}return g};
const _er=evRoll;evRoll=function(c,r,m){const out=_er(c,r,m);const C=r&&r.CROWD;
 if(C&&!C.done){C.done=1;const tg=C.tags[c.t];
  if(out.success&&tg==='w'){const ev=evNew(m);ev.stars+=RC_BONUS;ev.notes.push('👥 Gave the crowd exactly what they wanted (+¼★)');(out.extra=out.extra||[]).push('👥 The crowd got exactly what they wanted (+¼★)')}
  else if(out.success&&tg==='a'&&r.A&&r.B){const ev=evNew(m);ev.heat.push([r.A.id,r.B.id,RC_HEAT]);ev.notes.push(`👥 Went against the crowd — they're furious (heat +${RC_HEAT})`);(out.extra=out.extra||[]).push(`👥 The crowd is furious — ${r.A.name} vs ${r.B.name} heat +${RC_HEAT}`)}}
 return out};
const _roll=roll;roll=function(c,ctx,st){
 if(c.safe){st.lastC=c;st.score+=.3;const text=fill(typeof voiceText==='function'?voiceText(c,true,ctx.A):c.ok,ctx);st.log.push(fill(c.t,ctx)+' — '+text);(st.oks=st.oks||[]).push(true);return {success:true,text}}
 const out=_roll(c,ctx,st);if(c.hj&&out.success&&ctx.H)st.hj={id:ctx.H.id,k:c.hj};return out};
const _fp=finalizePromo;finalizePromo=function(p,ctx,st){_fp(p,ctx,st);if(p.res&&st&&st.hj)p.res.hj=st.hj};
const _apr=applyPromo;applyPromo=function(p,notes){_apr(p,notes);const r=p&&p.res;if(!r||!r.hj)return;const H=S.w[r.hj.id],A=S.w[p.a];if(!H||!A)return;
 const was=H.pop;const g=was<70?4:was<80?2.5:1.5;H.pop=clamp(H.pop+g*(1-H.pop/110),1,100);H.mor=clamp(H.mor+3,0,100);
 if(r.hj.k==='join'){const k=key(A.id,H.id);S.chem[k]=clamp((S.chem[k]||0)+1,-5,6);if(H.pop>A.pop)A.pop=clamp(A.pop+1,1,100)}
 if(A.own==='p'){notes.push(was<75?`🌟 The crowd hijacked ${A.name}'s segment for ${H.name} — and made them look like a star.`:`👥 The crowd got their wish: ${H.name} crashed ${A.name}'s segment.`)}};

(function(){const c=document.createElement('style');c.textContent=`#modal .note.crowdn{border-left:3px solid var(--gold);padding-left:10px}`;document.head.appendChild(c)})();
Object.assign(window,{rcNote,rcTag,rcTry,hjTry,CRWD});
})();
