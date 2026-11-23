/* Tony Khan Simulator — wrestler arcs (v426).
   You start an arc for someone on your roster from their profile: pay up front, book its build steps, then land the
   payoff segment. The payoff gets a story bonus on the night (more for a better build), brings in fans, and the wrestler
   comes out of it changed: In-ring or Mic, a trait, a second crowd, a team, a turn, a jump in popularity. Miss the
   deadline and the money's gone and they're let down (morale). Two arcs run at once. Superstars (ARC_STAR popularity)
   only get story arcs: the payoff, popularity and heat, never In-ring or Mic.
   Arcs are yours alone: the rival doesn't run them, and in a league each GM's arcs are private (PRIV in index.html).
   ARC_TEXT holds the story lines each arc plays; any line left out falls back to the default.
   Loaded after traits.js; everything here is only called once the game is running. */
(function(){'use strict';
const ARC_SLOTS=2,ARC_STAR=85,ARC_GREAT=3.9,ARC_PAY0=.6,ARC_PAYQ=.4,ARC_PAYMAX=.4,ARC_PAY_PPV=1.25,ARC_PAY_STORY=1.2,
 ARC_FANS=12000,ARC_G1=5,ARC_G2=8,ARC_FAIL=10,ARC_SLACK=3,ARC_MIN=2.5,ARC_VIGMIN=2,ARC_BUILD=.25,ARC_PROVE=6,ARC_STORYH=[25,35,45,50],ARC_STORYP=60,
 
 /* v437: arcs are for building people up. The price follows the popularity of whoever the story builds (half price at 45 or under,
    full at 80, superstars ×1.5; a build step asks up to ½★ less of someone at 55 or under), and a lower-card payoff lifts them more: up to +ARC_RISEPOP popularity and ×(1+ARC_RISEF) fans
    at 45, fading out at ARC_STAR. An upper-midcarder (70+) whose great payoff lands in the main event or on a PPV breaks through
    (+ARC_BREAK). A superstar in the payoff rubs off on someone below them (+ARC_RUB). Each earlier payoff for the same wrestler
    this season halves the rising-star part. */
 ARC_CP0=.5,ARC_CPLO=45,ARC_CPMID=80,ARC_CPUP=0,ARC_CPSTAR=1.5,ARC_EASE=.5,ARC_EASELO=55,ARC_RISEPOP=4,ARC_RISEF=.4,ARC_BREAK=3,ARC_RUB=2;
let ARC_CAS=.5,ARC_CASCAP=1;
const ARC_H=new WeakMap();
/* v439: an arc segment hooks the casuals once — as an arc (ARC_CAS a segment, up to ARC_CASCAP) or through the story heat it
   carries in the feud pull, whichever is bigger (ARC_ONCE 0: both, the v438 way). A payoff's fans follow the build: ARC_FBQ0 of
   them at an average build of ARC_FBQLO★ or less, all of them at ARC_GREAT (ARC_FBQ 0: always all). */
let ARC_ONCE=1,ARC_FBQ=1,ARC_FBQ0=.4,ARC_FBQLO=2.5;window.__arcTune=o=>{if('once' in o)ARC_ONCE=o.once;if('fbq' in o)ARC_FBQ=o.fbq;if('fbq0' in o)ARC_FBQ0=o.fbq0;if('cas' in o)ARC_CAS=o.cas;if('cap' in o)ARC_CASCAP=o.cap};
/* ---- the story lines: {A} is the wrestler, {B}/{C} the others in the arc. Leave a key out to use the default. ---- */
const ARC_TEXT=window.ARC_TEXT||{};window.ARC_TEXT=ARC_TEXT;
/* pronouns: {A:they} {B:their} {C:them} … become he/she, his/her, him/her for that wrestler (they when unknown) */
const ARC_PR={they:['he','she'],them:['him','her'],their:['his','her'],theirs:['his','hers'],themself:['himself','herself'],themselves:['himself','herself'],"they're":["he's","she's"],"they've":["he's","she's"],"they'll":["he'll","she'll"],"they'd":["he'd","she'd"]};
function aPr(w,word){const lw=word.toLowerCase();const f=ARC_PR[lw];const r=!w||!f||!(w.g==='M'||w.g==='F')?lw:f[w.g==='M'?0:1];return word[0]!==lw[0]?r[0].toUpperCase()+r.slice(1):r}
function aPrFill(t,o){o=o||{};return String(t==null?'':t).replace(/\{([ABC]):([A-Za-z']+)\}/g,(m,k,wd)=>aPr(o[k.toLowerCase()]&&S.w[o[k.toLowerCase()]],wd))}
window.aPr=aPr;
const ARC_DEF_TXT={start:'{A} starts down a new road.',step:'{A}\'s story moves forward.',pay:'{A}\'s story pays off.',great:'The crowd won\'t forget it.',good:'It landed.',fail:'{A} feels let down. The story went nowhere.'};
function arcLine(a,k){const D=aD(a);const T=ARC_TEXT[a.k]||{};const SL=arcStoryOf(a);let t=SL&&SL.txt&&SL.txt[k]!=null?SL.txt[k]:T[k]!=null?T[k]:D&&D.txt&&D.txt[k]!=null?D.txt[k]:ARC_DEF_TXT[k];if(Array.isArray(t))t=t[(a.have||0)%t.length];
 const nm=id=>id&&S.w[id]?S.w[id].name:'';return aPrFill(t||'',a).replace(/\{F2\}/g,a.fn2||'').replace(/\{F\}/g,a.fn||'').replace(/\{A\}/g,nm(a.a)).replace(/\{B\}/g,nm(a.b)||'their partner').replace(/\{C\}/g,nm(a.c)||'')}

/* ---- small helpers ---- */
const aW=id=>S.w[id];
const aMine=id=>{const w=aW(id);return !!(w&&w.own==='p')};
const aLast=w=>w.name.split(' ').slice(-1)[0];
const aStar=w=>(w.pop||0)>=ARC_STAR;
function arcList(){return (S.arcs=Array.isArray(S.arcs)?S.arcs:[])}
function arcOf(id){return arcList().find(a=>a.a===id)}
function arcIn(id){return arcList().some(a=>a.a===id||a.b===id||a.c===id)}
function aTeams(id){return (S.teams||[]).filter(t=>t.m.includes(id))}
function aMates(id){const s=new Set();aTeams(id).forEach(t=>t.m.forEach(x=>{if(x!==id)s.add(x)}));if(typeof fgKnown==='function'&&aW(id))fgKnown(aW(id)).forEach(o=>s.add(o.id));return [...s].filter(aMine)}
function aRoster(ex){ex=ex||[];return ownList('p').filter(w=>!w.inj&&!ex.includes(w.id)&&!w.retd)}
function aBest(l,f){let b=null,bv=-1e9;l.forEach(w=>{const v=f(w);if(v>bv){bv=v;b=w}});return b}
const aChem=(a,b)=>{try{return chemOpp(a,b)}catch(e){return 0}};
const aMate=(a,b)=>(S.chem&&S.chem[key(a.id,b.id)])||0;
/* the popularity of whoever this story builds: the successor in Passing the Torch / the Title, else the wrestler */
const ARC_BUILDS_B={torch:1,passtitle:1};
function aBuiltPop(k,id,o){const b=o&&o.b&&aW(o.b);if(ARC_BUILDS_B[k]&&b)return b.pop||0;const A=id&&aW(id);return A?(A.pop||0):null}
function aPopF(p){if(p==null)return 1;if(p>=ARC_STAR)return ARC_CPSTAR;if(p>=ARC_CPMID)return 1+(p-ARC_CPMID)*ARC_CPUP;return ARC_CP0+Math.max(0,p-ARC_CPLO)/(ARC_CPMID-ARC_CPLO)*(1-ARC_CP0)}
function aCost(k,id,o){const D=aDK(k);const base=typeof pCost==='function'?pCost():20;const c=base*(D.lane==='ring'||D.lane==='mic'?2:3)*aPopF(aBuiltPop(k,id,o));return Math.max(5,Math.round(c/5)*5)}
/* how much a payoff lifts someone on the way up: 1 at 45 or under, 0 at superstar, halved for each payoff they already had this season */
function aRiseF(w){if(!w||(w.pop||0)>=ARC_STAR)return 0;const n=(S.arcLog||[]).filter(e=>e.s===S.season&&(e.a===w.id||e.bb===w.id)).length;return clamp((ARC_STAR-(w.pop||0))/(ARC_STAR-ARC_CPLO),0,1)/Math.pow(2,n)}
window.aRiseF=aRiseF;window.aCost=aCost;
function aGrpOf(w){const g=typeof fgOf==='function'?fgOf(w):[];return g.filter(x=>x&&x!=='und')}
function aClash(x,y){return typeof grpPair==='function'&&grpPair(x,y)<0}
function aGood(x,y){return typeof grpPair==='function'&&grpPair(x,y)>=4&&x!==y}
function aStipFor(t){const sb=TRAITS[t]&&TRAITS[t].sb;if(!sb)return null;const l=Object.entries(sb).filter(([k])=>STIPS[k]&&!STIPS[k].ppv&&!STIPS[k].once&&(!STIPS[k].mt||STIPS[k].mt.includes('singles'))).sort((a,b)=>b[1]-a[1]);return l.length?l[0][0]:null}

/* ---- a segment as the arcs see it ---- */
function aSegMatch(m,pos){const sh=typeof curShow==='function'?curShow():{};const win=m.nc?[]:(m.sides[m.winner]||[]);
 return {kind:'match',type:m.type,stip:typeof stipKey==='function'?stipKey(m):(m.stip||'std'),sides:m.sides,ids:m.sides.flat().filter(Boolean),win,fin:typeof finOf==='function'?finOf(m):'clean',pos:pos||'mid',ppv:!!(sh&&sh.ppv),title:m.title||null,nc:!!m.nc,...(()=>{const r=typeof riOn==='function'?riOn(m):null;return {ri:!!r,rix:r?r.X.id:null,rit:r?r.T.id:null,rik:r?r.k:null}})()}}
function aSegPromo(p){const sh=typeof curShow==='function'?curShow():{};const ids=[p.a,p.b].filter(Boolean);return {kind:'promo',type:p.type,a:p.a,b:p.b||null,sides:[[p.a]].concat(p.b?[[p.b]]:[]),ids,win:[],ppv:!!(sh&&sh.ppv)}}
const sSide=(s,id)=>s.sides.findIndex(x=>x.includes(id));
const sSame=(s,a,b)=>s.kind==='match'&&s.ids.includes(a)&&s.ids.includes(b)&&sSide(s,a)===sSide(s,b);
const sVs=(s,a,b)=>s.kind==='match'&&s.ids.includes(a)&&s.ids.includes(b)&&sSide(s,a)!==sSide(s,b);
const sTog=(s,a,b)=>s.kind==='promo'&&s.ids.includes(a)&&s.ids.includes(b);
const sWon=(s,a)=>s.kind==='match'&&s.win.includes(a);
const sLost=(s,a)=>s.kind==='match'&&!s.nc&&s.ids.includes(a)&&s.win.length>0&&!s.win.includes(a);
const sOpps=(s,a)=>s.kind!=='match'?[]:s.sides.filter((x,i)=>i!==sSide(s,a)).flat();
const sSingles=s=>s.kind==='match'&&s.sides.length===2&&s.sides.every(x=>x.length===1);
const sBig=s=>s.ppv||s.pos==='me';

/* ---- the arcs ----
   lane: mic / ring / trait (traits, crowds, teams, popularity) / star (superstars only; turns can be star arcs too)
   pick(A): the people in it (b, c, t trait, g group) or null when it can't happen; step(s,a): a build step;
   ok(a): extra rule before the payoff opens; pay(s,a): the payoff; plan(a,stage): what to book (for the checklist's Book it);
   win(a,w,q): what they get (q 'great' or 'good'); also(a,s,notes): what happens on the payoff night whatever the quality;
   tell: the steps' labels in the progress display */
const ARCS={
 heelturn:{lane:'mic',gets:'Mic, popularity and a feud with {B}, as a heel',star:1,i:'😈',n:'Heel Turn',need:3,
  d:'Team {A:them} with a face friend or partner until the cracks show, then {A:they} turns on {B:them}.',build:'On the same side as {B} (a match, or a promo together)',payoff:'Team with {B} again, and turn on {B:them}',
  tell:['Partners','Cracks showing','Breaking point'],
  pick:A=>{if(A.al!=='f')return null;const l=aMates(A.id).map(aW).filter(w=>w&&w.al==='f'&&!w.inj);const B=aBest(l.length?l:aRoster([A.id]).filter(w=>w.al==='f'),w=>aMate(A,w)*3+w.pop/10+(l.includes(w)?50:0));return B?{b:B.id}:null},
  step:(s,a)=>sSame(s,a.a,a.b)||sTog(s,a.a,a.b),pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(A.al==='f'){if(typeof pTurn==='function')pTurn(A);else A.al='h'}A.turnW=AW();bumpHeat(a.a,a.b,a.q==='great'?55:35,[],`${A.name} turned on ${B.name}`);mor(B,-6);n.push(`🔄😈 ${A.name} turns on ${B.name}! ${A.name} is a heel now.`)},
  win:(a,w,q)=>({mic:1,pop:q==='great'?3:1.5})},
 faceturn:{lane:'mic',gets:'Mic, popularity and {B} on {A:their} side, as a face',star:1,i:'🛡️',n:'Face Turn',need:3,
  d:'Keep {A:them} close to a face until {A:they} can\'t stand by any more, then {A:they} stands with {B:them}.',build:'In a segment with {B} (any side)',payoff:'On the same side as {B}: the turn',
  tell:['Watching','Second thoughts','Enough'],
  pick:A=>{if(A.al!=='h')return null;const B=aBest(aRoster([A.id]).filter(w=>w.al==='f'),w=>w.pop+aMate(A,w)*2);return B?{b:B.id}:null},
  step:(s,a)=>s.ids.includes(a.a)&&s.ids.includes(a.b),pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(A.al==='h'){if(typeof pTurn==='function')pTurn(A);else A.al='f'}A.turnW=AW();const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+2,-5,6);n.push(`🔄🛡️ ${A.name} stands with ${B.name}! ${A.name} is a face now.`)},
  win:(a,w,q)=>({mic:1,pop:q==='great'?3:1.5})},
 betrayal:{lane:'mic',gets:'Mic, popularity and a blood feud with {B}',star:1,i:'🗡️',n:'Betrayal',need:3,
  d:'Two heels on top of the world, until one of them wants it all.',build:'On the same side as {B} (at least one win along the way)',payoff:'Team with {B}, then turn on {B:them}',
  tell:['Running buddies','Who\'s carrying who','Knife out'],
  pick:A=>{if(A.al!=='h')return null;const l=aMates(A.id).map(aW).filter(w=>w&&w.al==='h'&&!w.inj);const B=aBest(l.length?l:aRoster([A.id]).filter(w=>w.al==='h'),w=>aMate(A,w)*3+w.pop/10+(l.includes(w)?50:0));return B?{b:B.id}:null},
  step:(s,a)=>{const h=sSame(s,a.a,a.b);if(h&&sWon(s,a.a))a.wins=(a.wins||0)+1;return h},ok:a=>(a.wins||0)>=1,pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:st==='build'&&!(a.wins||0)?0:null}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);bumpHeat(a.a,a.b,a.q==='great'?85:60,[],`${A.name} betrayed ${B.name}`);mor(B,-8);(S.teams||[]).forEach(t=>{if(t.m.includes(a.a)&&t.m.includes(a.b))t.m=t.m.filter(x=>x!==a.a)});S.teams=(S.teams||[]).filter(t=>t.m.length>=2);
   const fr=typeof fgFriends==='function'?fgFriends(B):[];fr.filter(o=>o.id!==a.a).forEach(o=>mor(o,-4));
   n.push(`🗡️ ${A.name} turns on ${B.name}!${fr.some(o=>o.id===a.a)?` They were friends backstage, and the locker room takes it hard.`:''}`)},
  win:(a,w,q)=>({mic:1,pop:q==='great'?2:1})},
 voice:{lane:'mic',gets:'Mic',i:'🎙️',n:'Find Your Voice',need:3,
  d:'Promos against three different people, then call out someone bigger.',build:'A promo at 3★+ with someone new',payoff:'A promo with someone 10+ more popular',
  pick:A=>A.mic<90?{}:null,
  step:(s,a)=>{if(s.kind!=='promo'||!s.b||s.a!==a.a&&s.b!==a.a)return false;const o=s.a===a.a?s.b:s.a;a.opp=a.opp||[];if(a.opp.includes(o))return false;a.opp.push(o);return true},min:3,
  pay:(s,a)=>{if(s.kind!=='promo'||!s.ids.includes(a.a))return false;const o=s.a===a.a?s.b:s.a;return !!(o&&aW(o)&&aW(o).pop>=aW(a.a).pop+10)},
  plan:(a,st)=>{const A=aW(a.a);const o=st==='build'?aBest(aRoster([a.a]).filter(w=>!(a.opp||[]).includes(w.id)),w=>w.pop):aBest(aRoster([a.a]).filter(w=>w.pop>=A.pop+10),w=>-w.pop);return o?[{kind:'promo',type:'callout',a:a.a,b:o.id}]:null},
  win:(a,w,q)=>({mic:1.2})},
 mentor:{lane:'ring',gets:'In-ring (more, the bigger the gap), and {B} is happier',i:'🧓',n:'Mentor & Protégé',need:3,
  d:'Learn from a veteran in the ring, then step up against {B:them}.',build:'In a match with {B} (either side)',payoff:'A singles match against {B}',
  pick:A=>{const B=aBest(aRoster([A.id]).filter(w=>w.ring>=A.ring+15),w=>w.ring+aMate(A,w));return B?{b:B.id}:null},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.ids.includes(a.b),pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2},{kind:'match',type:'singles',vs:[a.a,a.b]}]:[{kind:'match',type:'singles',vs:[a.a,a.b]}],
  win:(a,w,q)=>{const B=aW(a.b);const gap=B?Math.max(0,B.ring-w.ring):15;if(B)mor(B,6);return {ring:1+gap/30}}},
 gauntlet:{lane:'ring',gets:'In-ring and popularity',i:'🪜',n:'The Gauntlet',need:3,
  d:'Three opponents, each more popular than the last, then a title match.',build:'A singles match against someone more popular than the last one',payoff:'A title match',
  pick:A=>Object.values(S.titles||{}).some(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length&&!t.holders.includes(A.id))?{}:null,
  step:(s,a)=>{if(!sSingles(s)||!s.ids.includes(a.a))return false;const o=aW(sOpps(s,a.a)[0]);if(!o)return false;const lp=a.lp!=null?a.lp:aW(a.a).pop-15;if(o.pop<=lp)return false;a.lp=o.pop;if(sWon(s,a.a))a.wins=(a.wins||0)+1;return true},ok:a=>(a.wins||0)>=1,
  pay:(s,a)=>s.kind==='match'&&!!s.title&&s.ids.includes(a.a),
  plan:(a,st)=>{const A=aW(a.a);if(st==='build'){const lp=a.lp!=null?a.lp:A.pop-15;return [{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.pop>lp&&w.pop<=lp+20,win:(a.wins||0)?null:0},{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.pop>lp,win:(a.wins||0)?null:0}]}
   const t=Object.values(S.titles).find(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length===1&&aMine(t.holders[0])&&!aW(t.holders[0]).inj&&t.holders[0]!==a.a);return t?[{kind:'match',type:'singles',vs:[t.holders[0],a.a],title:t.id}]:null},
  win:(a,w,q)=>({ring:1.1,pop:q==='great'?2.5:1})},
 ironman:{lane:'ring',gets:'In-ring, and on a great payoff Iron Body or Workhorse',i:'🔩',n:'Iron Man Run',need:4,
  d:'A good match every single week, then the main event.',build:'A 3★+ match this week (weeks in a row)',payoff:'The main event',
  pick:A=>A.ring<92?{}:null,
  step:(s,a)=>{if(s.kind!=='match'||!s.ids.includes(a.a))return false;if(a.lw!=null&&AW()>a.lw+1){a.have=0;a.st=[]}a.lw=AW();return true},min:3,pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.pos==='me',
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,main:st==='pay'?1:0}],
  win:(a,w,q)=>{if(q==='great'&&w.tr&&w.tr.length<TR_SLOTS){const t=['iron','work'].find(x=>!w.tr.includes(x));if(t){trAdd(w,t);return {ring:1,trait:t}}}return {ring:1}}},
 proveit:{lane:'ring',gets:'In-ring, and {G} fans',i:'🥊',n:'Prove It',need:2,bstep:0,
  d:'Win over the crowd that doesn\'t get {A:them}, then beat its favorite.',build:'A 3★+ match against a {G} wrestler',payoff:'A match against {B}',
  pick:A=>{const g=aGrpOf(A)[0];if(!g)return null;const l=aRoster([A.id]).filter(w=>aGrpOf(w).some(x=>aClash(g,x)));const B=aBest(l,w=>w.pop);return B?{b:B.id,g:aGrpOf(B).find(x=>aClash(g,x))}:null},
  recast:(A,o)=>{const g=aGrpOf(A)[0];const B=aW(o.b);return B?Object.assign({},o,{g:aGrpOf(B).find(x=>aClash(g,x))||o.g}):o},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aGrpOf(aW(id)).includes(a.g)),min:3,pay:(s,a)=>sVs(s,a.a,a.b),
  plan:(a,st)=>st==='pay'?[{kind:'match',type:'singles',vs:[a.a,a.b]}]:[{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.id!==a.b&&aGrpOf(w).includes(a.g)}],
  win:(a,w,q)=>({ring:1,grp:a.g})},
 trial:{lane:'ring',gets:'In-ring and popularity',i:'🔥',n:'Trial by Fire',need:2,
  d:'Lose to the best and look good doing it, then get the rematch.',build:'A 3★+ loss to someone 15+ more popular',payoff:'A singles match against someone 15+ more popular',
  pick:A=>A.pop<75&&aRoster([A.id]).some(w=>w.pop>=A.pop+15)?{}:null,
  step:(s,a)=>{const A=aW(a.a);if(!sLost(s,a.a))return false;return s.win.some(id=>aW(id)&&aW(id).pop>=A.pop+15)},min:3,
  pay:(s,a)=>{const A=aW(a.a);return sSingles(s)&&s.ids.includes(a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>=A.pop+15)},
  plan:(a,st)=>{const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.pop>=A.pop+15,win:st==='build'?1:null}]},
  win:(a,w,q)=>({ring:1,pop:q==='great'?3:1.5})},
 school:{lane:'trait',gets:'{T}',i:'🎓',n:'Schooling',need:3,
  d:'Learn a new skill the hard way: the same kind of match, again and again.',build:'A {S} match (against at least 2 different people)',payoff:'A {S} match in the main event or on a PPV',
  pick:A=>{if(!Array.isArray(A.tr)||A.tr.length>=TR_SLOTS)return null;let o=[];try{o=trOptions(A,A.tr.length+1)}catch(e){}const t=o.find(t=>aStipFor(t));return t?{t,stip:aStipFor(t)}:null},
  step:(s,a)=>{if(s.kind!=='match'||!s.ids.includes(a.a)||s.stip!==a.stip)return false;a.opp=a.opp||[];sOpps(s,a.a).forEach(id=>{if(!a.opp.includes(id))a.opp.push(id)});return true},ok:a=>(a.opp||[]).length>=2,
  pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.stip===a.stip&&sBig(s),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:a.stip,main:st==='pay'?1:0,oppF:w=>!(st==='build'&&(a.opp||[]).length===1&&a.opp.includes(w.id))}],
  win:(a,w,q)=>{if(q==='great'||!trOpenA(w)){trAdd(w,a.t);return {trait:a.t}}w.trQ=a.t;return {trq:a.t}}},
 tap:{lane:'trait',gets:'Submission Specialist',i:'🦂',n:'Make Them Tap',need:3,
  d:'Win, win, win, then make a rival tap out in a Submission match.',build:'A win over someone new',payoff:'Win a Submission match against {B}',bstep:0,
  pick:A=>Array.isArray(A.tr)&&A.tr.length<TR_SLOTS&&!A.tr.includes('subs')&&TRAITS.subs?{t:'subs'}:null,
  step:(s,a)=>{if(!sWon(s,a.a))return false;a.opp=a.opp||[];const o=sOpps(s,a.a).filter(id=>!a.opp.includes(id));if(!o.length)return false;a.opp.push(...o);return true},
  pay:(s,a)=>sWon(s,a.a)&&s.stip==='sub'&&sOpps(s,a.a).includes(a.b),
  plan:(a,st)=>{const A=aW(a.a);if(st==='build')return [{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>!(a.opp||[]).includes(w.id),win:0}];
   return [{kind:'match',type:'singles',vs:[a.a,a.b],stip:'sub',win:0}]},
  win:(a,w,q)=>{if(q==='great'||!trOpenA(w)){trAdd(w,'subs');return {trait:'subs'}}w.trQ='subs';return {trq:'subs'}}},
 cross:{lane:'trait',gets:'A second crowd: {G}',i:'🌉',n:'Crossover',need:3,
  d:'Win over a second crowd with great matches against its wrestlers.',build:'A 3★+ match against a {G} wrestler',payoff:'A match against a {G} wrestler in the main event or on a PPV',
  pick:A=>{const g=aGrpOf(A);if(g.length!==1||A.fg2)return null;const opts=Object.keys(GRP_M).filter(x=>x!=='cas'&&aGood(g[0],x)&&aRoster([A.id]).some(w=>aGrpOf(w).includes(x)));if(!opts.length)return null;const r=seeded((S.seed||'')+'|arcx|'+A.id)();return {g:opts[Math.floor(r*opts.length)]}},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aGrpOf(aW(id)).includes(a.g)),min:3,
  pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&sBig(s)&&sOpps(s,a.a).some(id=>aW(id)&&aGrpOf(aW(id)).includes(a.g)),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>aGrpOf(w).includes(a.g),main:st==='pay'?1:0}],
  need2:a=>aW(a.a)&&aW(a.a).fgh===a.g?2:3,
  win:(a,w,q)=>{if(q==='great'||w.fgh===a.g){w.fg2=a.g;delete w.fgh;return {fg2:a.g}}w.fgh=a.g;return {fgh:a.g}}},
 team:{lane:'trait',gets:'A tag team with {B}',i:'🤝',n:'Form a Tag Team',need:3,
  d:'Put two of them together until they click.',build:'A tag match together at 2¾★+',payoff:'A tag team win together',
  pick:A=>{const l=aRoster([A.id]).filter(w=>!inTeam(A.id,w.id)&&!arcIn(w.id));const B=aBest(l,w=>{try{return teamParts(A,w).reduce((s,x)=>s+x.v,0)*3+w.pop/10}catch(e){return w.pop/10}});return B?{b:B.id}:null},
  step:(s,a)=>sSame(s,a.a,a.b)&&s.sides.every(x=>x.length===2),min:2.75,pay:(s,a)=>sSame(s,a.a,a.b)&&sWon(s,a.a),
  plan:(a,st)=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:st==='pay'?0:null}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);const nm=`${aLast(A)} & ${aLast(B)}`;S.teams=(S.teams||[]);if(!S.teams.some(t=>t.m.includes(a.a)&&t.m.includes(a.b)))S.teams.push({id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n:nm,type:'team',m:[a.a,a.b]});
   const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+(a.q==='great'?3:1),-5,6);n.push(`🤝 ${nm} are officially a team.`)},
  win:()=>({})},
 faction:{lane:'trait',gets:'A faction with {B} and {C}',i:'🛡️',n:'Start a Faction',need:3,
  d:'Bring three together: matches side by side and rallies, then a trios win.',build:'On the same side as {B} or {C}, or a promo with one of them',payoff:'A trios win with {B} and {C}',
  pick:A=>{const l=aRoster([A.id]).filter(w=>w.g===A.g&&!arcIn(w.id)&&w.al===A.al).sort((x,y)=>(aMate(A,y)*3+y.pop/10)-(aMate(A,x)*3+x.pop/10));if(l.length<2)return null;if(aTeams(A.id).some(t=>t.type==='faction'))return null;return {b:l[0].id,c:l[1].id}},
  step:(s,a)=>sSame(s,a.a,a.b)||sSame(s,a.a,a.c)||sTog(s,a.a,a.b)||sTog(s,a.a,a.c),
  pay:(s,a)=>sSame(s,a.a,a.b)&&sSame(s,a.a,a.c)&&sWon(s,a.a),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:(a.have||0)%2?a.c:a.b},{kind:'match',type:'tag',side:[a.a,(a.have||0)%2?a.c:a.b],n:2}]:[{kind:'match',type:'trios',side:[a.a,a.b,a.c],n:3,win:0}],
  also:(a,s,n)=>{const A=aW(a.a);const nm=`${aLast(A)}'s crew`;S.teams=S.teams||[];S.teams.push({id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n:nm,type:'faction',m:[a.a,a.b,a.c]});
   [[a.a,a.b],[a.a,a.c],[a.b,a.c]].forEach(([x,y])=>{const k=key(x,y);S.chem[k]=clamp((S.chem[k]||0)+(a.q==='great'?2:1),-5,6)});n.push(`🛡️ A new faction is born: ${nm}.`)},
  win:()=>({})},
 join:{lane:'trait',gets:'A place in {F}',i:'🚪',n:'Join a Faction',need:3,bstep:0,
  d:'Earn a place in an existing group by fighting at its side.',build:'On the same side as a member of {F}, or a promo with one',payoff:'A Faction Rally with a member of {F}: the induction',
  pick:A=>{const l=(S.teams||[]).filter(t=>(t.type==='faction'||t.type==='trios')&&!t.m.includes(A.id)&&t.m.filter(aMine).length>=2&&t.m.every(id=>!aW(id)||aW(id).g===A.g));const F=aBest(l.map(t=>({t,pop:t.m.reduce((x,id)=>x+(aW(id)?aW(id).pop:0),0)})),x=>x.pop);return F?{f:F.t.id,fn:F.t.n,b:F.t.m.filter(aMine)[0]}:null},
  mem:a=>{const t=(S.teams||[]).find(t=>t.id===a.f);return t?t.m:[]},
  step:(s,a)=>ARCS.join.mem(a).some(id=>id!==a.a&&(sSame(s,a.a,id)||sTog(s,a.a,id))),pay:(s,a)=>s.kind==='promo'&&s.type==='rally'&&ARCS.join.mem(a).some(id=>sTog(s,a.a,id)),
  plan:(a,st)=>{const m=ARCS.join.mem(a).filter(id=>id!==a.a&&aMine(id)&&!aW(id).inj);if(!m.length)return null;return st==='build'?[{kind:'match',type:'tag',side:[a.a,m[0]],n:2},{kind:'promo',type:'rally',a:m[0],b:a.a}]:[{kind:'promo',type:'rally',a:m[0],b:a.a}]},
  also:(a,s,n)=>{const t=(S.teams||[]).find(t=>t.id===a.f);if(t&&!t.m.includes(a.a)){t.m.push(a.a);t.m.forEach(x=>{if(x===a.a)return;const k=key(x,a.a);S.chem[k]=clamp((S.chem[k]||0)+(a.q==='great'?2:1),-5,6)});n.push(`🚪 ${aW(a.a).name} is officially part of ${t.n}.`)}},
  win:(a,w,q)=>({pop:q==='great'?2:1})},
 under:{lane:'trait',gets:'A jump in popularity',i:'🐶',n:'Underdog Run',need:2,
  d:'Lose well, keep coming back, then pull off the upset.',build:'A 3★+ loss',payoff:'Beat someone 20+ more popular',
  pick:A=>A.pop<70&&aRoster([A.id]).some(w=>w.pop>=A.pop+20)?{}:null,
  step:(s,a)=>sLost(s,a.a),min:3,pay:(s,a)=>sWon(s,a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>=aW(a.a).pop+20),
  plan:(a,st)=>{const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.pop>=A.pop+(st==='pay'?20:5),win:st==='pay'?0:1,fin:st==='pay'?'upset':null}]},
  win:(a,w,q)=>({pop:q==='great'?6:3.5})},
 retire:{lane:'trait',gets:'Popularity and heat, and the loser retires',i:'🪦',n:'Force a Retirement',need:2,
  d:'Pick a rival, beat {B:them} twice as the feud boils over, then put {B:their} career on the line. The loser retires for good.',build:'A win over {B}; the feud heats up each time',payoff:'A Retirement match against {B}: whoever loses retires',heatStep:15,
  pick:A=>({}),
  step:(s,a)=>sWon(s,a.a)&&sOpps(s,a.a).includes(a.b),pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),
  plan:(a,st)=>[{kind:'match',type:'singles',vs:[a.a,a.b],win:st==='build'?0:null}],
  also:(a,s,n)=>{const lo=s.win.includes(a.a)?a.b:s.win.includes(a.b)?a.a:null;if(lo)arcRetire(aW(lo),n,`${aW(lo).name} lost the Retirement match and walks away from the ring for good.`);if(lo===a.a)a.lost=1},
  win:(a,w,q)=>a.lost?{}:({pop:q==='great'?5:3,heat:1})},
 stakes:{lane:'trait',gets:'Popularity for the winner; the loser pays for it',i:'✂️',n:'Stakes Match',need:2,
  d:'Pick a rival and build it into a feud so big something has to go on the line: the loser pays for it.',build:'Face {B} (a match or a promo); the feud heats up each time',payoff:'A singles match against {B} with the stakes on it',heatStep:15,
  pick:A=>({}),
  step:(s,a)=>sVs(s,a.a,a.b)||sTog(s,a.a,a.b),pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'contract',a:a.a,b:a.b},{kind:'match',type:'singles',vs:[a.a,a.b]}]:[{kind:'match',type:'singles',vs:[a.a,a.b]}],
  also:(a,s,n)=>{const wi=s.win.includes(a.a)?a.a:s.win.includes(a.b)?a.b:null;const lo=wi===a.a?a.b:wi===a.b?a.a:null;if(!lo)return;popx(aW(lo),-4);mor(aW(lo),-6);popx(aW(wi),a.q==='great'?5:3);if(lo===a.a)a.lost=1;n.push(`✂️ ${aW(lo).name} lost, and pays the price.`)},
  win:(a,w,q)=>a.lost?{}:({heat:1})},
 torch:{lane:'star',gets:'A big popularity jump for {B}',i:'🔦',n:'Passing the Torch',need:3,
  d:'Work with a rising wrestler, then put {B:them} over clean.',build:'In a match with {B} (either side)',payoff:'{B} beats {A:them} clean in a singles match',
  pick:A=>{const B=aBest(aRoster([A.id]).filter(w=>w.pop<70&&w.pop>=40&&w.g===A.g),w=>w.ring+w.mic/2);return B?{b:B.id}:null},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.ids.includes(a.b),pay:(s,a)=>sSingles(s)&&sWon(s,a.b)&&sVs(s,a.a,a.b)&&s.fin==='clean',
  plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'singles',vs:[a.b,a.a],win:0}],
  win:(a,w,q)=>{const B=aW(a.b);if(B){popx(B,q==='great'?8:5);mor(B,8)}return {mor:6}}},
 dream:{lane:'star',gets:'Popularity for both',i:'🌟',n:'Dream Match',need:2,
  d:'Two superstars talk their way into the match everyone wants.',build:'A promo with {B}',payoff:'A match against {B} on a PPV',
  pick:A=>{const r=seeded((S.seed||'')+'|dream|'+A.id+'|'+(A.arcN||0));const B=aBest(aRoster([A.id]).filter(w=>w.pop>=ARC_STAR&&!(recentMeets(A.id,w.id)||[]).length),w=>w.pop/10+r()*3);return B?{b:B.id}:null},
  step:(s,a)=>sTog(s,a.a,a.b),pay:(s,a)=>s.ppv&&sVs(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'singles',vs:[a.a,a.b],ppv:1}],
  win:(a,w,q)=>{const B=aW(a.b);if(B)popx(B,q==='great'?2:1);return {pop:q==='great'?2:1}}},
 farewell:{lane:'star',gets:'A huge payoff, then {A:they} retires a legend',i:'🎤',n:'Farewell Run',need:3,last:1,
  d:'One last run of big nights, then a final match, and {A:they} retires a legend.',build:'A 3½★+ match in the main event or on a PPV',payoff:'One final match',
  pick:A=>S.season>=2&&A.pop>=88?{}:null,
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&sBig(s),min:3.5,pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,main:1}],
  also:(a,s,n)=>{arcRetire(aW(a.a),n,`${aW(a.a).name} says goodbye. A legend retires.`);if(typeof hbLog==='function')try{hbLog('farewell',a.a)}catch(e){}},
  win:()=>({fans:2})},
 /* ---- v427: more arcs, so a season's board has room (each runs once a season) ---- */
 shoot:{lane:'mic',star:1,i:'💣',n:'Shoot Promo',need:2,min:3.5,gets:'Mic, popularity and heat with {B}',
  d:'Blur the line on the mic until the whole building believes it, then aim it at {A:their} rival.',build:'A promo at 3½★+',payoff:'A promo against {B}',
  pick:A=>A.mic>=60?{}:null,bstep:0,
  step:(s,a)=>s.kind==='promo'&&s.ids.includes(a.a),pay:(s,a)=>sTog(s,a.a,a.b),
  plan:(a,st)=>[{kind:'promo',type:'callout',a:a.a,b:a.b}],
  also:(a,s,n)=>{const last=a.st[a.st.length-1]||3;bumpHeat(a.a,a.b,a.q==='great'?20:12,[],`${aW(a.a).name} went off-script`);if(last<2){popx(aW(a.a),-3);a.bomb=1;n.push(`💣 ${aW(a.a).name}'s shoot promo bombed.`)}},
  win:(a,w,q)=>a.bomb?{mic:.5}:({mic:1.3,pop:q==='great'?3:1})},
 cult:{lane:'mic',i:'🕯️',n:'Cult of Personality',need:3,gets:'A faction {A:they} leads, and Mic',
  d:'Talk people into following {A:them}, one promo at a time.',build:'A promo with someone new (a follower)',payoff:'A Faction Rally with one of the followers',bstep:0,
  pick:A=>A.mic>=65&&!aTeams(A.id).some(t=>t.type==='faction')?{}:null,
  step:(s,a)=>{if(s.kind!=='promo'||!s.b||!s.ids.includes(a.a))return false;const o=s.a===a.a?s.b:s.a;a.opp=a.opp||[];if(a.opp.includes(o))return false;a.opp.push(o);return true},
  pay:(s,a)=>s.kind==='promo'&&s.type==='rally'&&s.ids.includes(a.a)&&(a.opp||[]).some(id=>s.ids.includes(id)),
  plan:(a,st)=>{if(st==='pay'){const f=(a.opp||[]).find(id=>aMine(id)&&!aW(id).inj);return f?[{kind:'promo',type:'rally',a:a.a,b:f}]:null}const A=aW(a.a);const o=aBest(aRoster([a.a]).filter(w=>!(a.opp||[]).includes(w.id)&&w.al===A.al&&w.pop<A.pop),w=>w.pop+aMate(A,w)*3);return o?[{kind:'promo',type:'rally',a:a.a,b:o.id}]:null},
  also:(a,s,n)=>{const m=[a.a].concat((a.opp||[]).filter(aMine).slice(0,2));if(m.length<3)return;const nm=`${aLast(aW(a.a))}'s following`;S.teams=S.teams||[];S.teams.push({id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n:nm,type:'faction',m});
   for(let i=0;i<m.length;i++)for(let j=i+1;j<m.length;j++){const k=key(m[i],m[j]);S.chem[k]=clamp((S.chem[k]||0)+(a.q==='great'?2:1),-5,6)}n.push(`🕯️ ${nm} is born.`)},
  win:(a,w,q)=>({mic:1})},
 redemption:{lane:'mic',i:'🌅',n:'Redemption Road',need:3,gets:'Mic, popularity and a big morale lift',
  d:'Own the slump on the mic, then win {A:their} way back.',build:'First a promo owning it, then wins',payoff:'A win in the main event',
  pick:A=>A.pop<ARC_STAR?{}:null,setup:(a,A)=>{mor(A,-8);news(`🌅 ${A.name} hits rock bottom. The road back starts now.`)},
  step:(s,a)=>(a.have||0)===0?s.kind==='promo'&&s.ids.includes(a.a):sWon(s,a.a),pay:(s,a)=>sWon(s,a.a)&&s.pos==='me',
  plan:(a,st)=>st==='build'&&!(a.have||0)?[{kind:'promo',type:'interview',a:a.a}]:[{kind:'match',type:'singles',side:[a.a],n:1,win:0,main:st==='pay'?1:0}],
  also:(a)=>{mor(aW(a.a),a.q==='great'?15:10)},win:(a,w,q)=>({mic:1,pop:q==='great'?2:1})},
 streak:{lane:'ring',i:'🔥',n:'Undefeated Streak',need:4,gets:'In-ring and popularity',
  d:'Win and keep winning. One loss and the streak starts over.',build:'A win (a loss starts it over)',payoff:'A main event or PPV win over someone more popular',
  pick:A=>({}),
  step:(s,a)=>{if(sLost(s,a.a)){a.have=0;a.st=[];return false}return sWon(s,a.a)},pay:(s,a)=>sWon(s,a.a)&&sBig(s)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>aW(a.a).pop),
  plan:(a,st)=>{const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,win:0,main:st==='pay'&&!curShow().ppv?1:0,oppF:st==='pay'?w=>w.pop>A.pop:w=>w.pop<=A.pop+5}]},
  win:(a,w,q)=>({ring:1,pop:q==='great'?4:2})},
 comeback:{lane:'ring',i:'🩹',n:'Comeback',need:2,min:3,gets:'In-ring, popularity and a big morale lift',
  d:'A storyline injury takes {A:them} off TV for two weeks. Then the comeback, better than ever.',build:'A 3★+ match',payoff:'A PPV win',
  pick:A=>!A.inj&&!isChampW(A)?{}:null,setup:(a,A)=>{A.inj=Math.max(A.inj||0,2);A.angle=AW();a.end+=2;news(`🩹 ${A.name} is "injured" in an angle and off TV for two weeks. The comeback starts after.`)},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a),pay:(s,a)=>s.ppv&&sWon(s,a.a),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,win:st==='pay'?0:null,ppv:st==='pay'?1:0}],
  also:(a)=>{mor(aW(a.a),a.q==='great'?12:6)},win:(a,w,q)=>({ring:1,pop:q==='great'?3:1.5})},
 fightchamp:{lane:'ring',star:1,i:'🏆',n:'Fighting Champion',need:3,min:3.5,gets:'In-ring, title prestige and popularity',
  d:'Defend the title against anyone, then defend it on the biggest stage.',build:'A 3½★+ title defense against a new challenger',payoff:'A title defense on a PPV',
  pick:A=>{const t=Object.values(S.titles||{}).find(t=>t.holders.includes(A.id));return t?{t2:t.id}:null},
  step:(s,a)=>{if(!(s.kind==='match'&&s.title===a.t2&&sWon(s,a.a)))return false;a.opp=a.opp||[];const o=sOpps(s,a.a).filter(id=>!a.opp.includes(id));if(!o.length)return false;a.opp.push(...o);return true},
  pay:(s,a)=>s.ppv&&s.title===a.t2&&s.ids.includes(a.a),
  plan:(a,st)=>{const t=S.titles[a.t2];if(!t||!t.holders.includes(a.a))return null;return [{kind:'match',type:'singles',side:t.holders.slice(),n:t.holders.length,title:a.t2,win:0,ppv:st==='pay'?1:0,oppF:w=>!(a.opp||[]).includes(w.id)}]},
  also:(a)=>{const t=S.titles[a.t2];if(t)t.prestige=(t.prestige||0)+(a.q==='great'?5:3)},win:(a,w,q)=>({ring:1,pop:q==='great'?2:1})},
 techshow:{lane:'ring',i:'⚙️',n:'Technical Showcase',need:3,min:3,gets:'In-ring, and Technical fans',
  d:'Pure wrestling: clean finishes, no run-ins, against the best technicians.',build:'A clean 3★+ match against a Technical wrestler, no run-ins',payoff:'A 2 Out of 3 Falls or Iron Man match',
  pick:A=>(aGrpOf(A).includes('tech')||(A.tr||[]).some(t=>TRAITS[t]&&TRAITS[t].g==='tech'))&&aRoster([A.id]).some(w=>aGrpOf(w).includes('tech'))?{}:null,
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.fin==='clean'&&!s.ri&&sOpps(s,a.a).some(id=>aW(id)&&aGrpOf(aW(id)).includes('tech')),
  pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&(s.stip==='twoof3'||s.stip==='iron'),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>aGrpOf(w).includes('tech'),stip:st==='pay'?(curShow().ppv?'iron':'twoof3'):'std'}],
  win:(a,w,q)=>({ring:1,grp:'tech'})},
 hometown:{lane:'trait',i:'🏠',n:'Hometown Hero',need:3,gets:'A big jump in popularity, and casual fans',
  d:'Win on TV week after week, then headline in a real building.',build:'A TV win',payoff:'The main event in the Good Building or bigger, or on a PPV',
  pick:A=>A.pop<85?{}:null,
  step:(s,a)=>!s.ppv&&sWon(s,a.a),pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&(s.ppv||s.pos==='me'&&typeof venOf==='function'&&venOf('p').k!=='aud'),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,win:st==='build'?0:null,main:st==='pay'?1:0}],
  win:(a,w,q)=>({pop:q==='great'?5:3,fans:1.5})},
 breakup:{lane:'trait',i:'💔',n:'Tag Team Breakup',need:3,gets:'Two singles careers: popularity and a feud',
  d:'The team is falling apart. Let it, and turn partners into rivals.',build:'Two tag losses together, then a promo together',payoff:'A singles match against {B}',
  pick:A=>{const t=aTeams(A.id).find(t=>t.type==='team'&&t.m.length===2&&t.m.every(aMine));return t?{b:t.m.find(x=>x!==A.id)}:null},
  step:(s,a)=>(a.have||0)<2?sSame(s,a.a,a.b)&&sLost(s,a.a):sTog(s,a.a,a.b),pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),
  plan:(a,st)=>st==='pay'?[{kind:'match',type:'singles',vs:[a.a,a.b]}]:(a.have||0)<2?[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:1}]:[{kind:'promo',type:'callout',a:a.a,b:a.b}],
  also:(a,s,n)=>{S.teams=(S.teams||[]).filter(t=>!(t.type==='team'&&t.m.includes(a.a)&&t.m.includes(a.b)));bumpHeat(a.a,a.b,a.q==='great'?50:25,[],'The team split');const wi=s.win[0];if(wi&&aW(wi))popx(aW(wi),3);if(a.q==='great'&&aW(a.b))popx(aW(a.b),2);n.push(`💔 ${aW(a.a).name} and ${aW(a.b).name} are done as a team.`)},
  win:(a,w,q)=>({pop:q==='great'?2:0})},
 reunion:{lane:'trait',i:'🔁',n:'Reunion',need:2,gets:'The team back together, with chemistry',
  d:'Old partners find their way back to each other.',build:'A save or a promo with {B}',payoff:'A tag win with {B}',
  pick:A=>({}),
  step:(s,a)=>sTog(s,a.a,a.b)||sSame(s,a.a,a.b),pay:(s,a)=>sSame(s,a.a,a.b)&&sWon(s,a.a),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:0}],
  also:(a,s,n)=>{const nm=`${aLast(aW(a.a))} & ${aLast(aW(a.b))}`;S.teams=S.teams||[];if(!S.teams.some(t=>t.m.includes(a.a)&&t.m.includes(a.b)))S.teams.push({id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n:nm,type:'team',m:[a.a,a.b]});const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+(a.q==='great'?3:2),-5,6);n.push(`🔁 ${nm} are back together.`)},
  win:(a,w,q)=>({pop:q==='great'?2:1})},
 hardcore:{lane:'trait',i:'🩸',n:'Hardcore Initiation',need:3,gets:'{T}, and Bloodhound fans',
  d:'Earn your stripes in the rough stuff, then survive a deathmatch.',build:'A hardcore stipulation match (Street Fight, No DQ, Tables…)',payoff:'A deathmatch (Barbed Wire, Texas Death, Lights Out) on a PPV',
  pick:A=>{if(!Array.isArray(A.tr)||A.tr.length>=TR_SLOTS)return null;const t=['bleed','hard'].find(x=>!A.tr.includes(x)&&TRAITS[x]);return t?{t}:null},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&STIPS[s.stip]&&STIPS[s.stip].g==='hard',pay:(s,a)=>s.ppv&&s.ids.includes(a.a)&&['barbed','texas','lights'].includes(s.stip),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:st==='pay'?'texas':'street',ppv:st==='pay'?1:0}],
  win:(a,w,q)=>{if(q==='great'||!trOpenA(w)){trAdd(w,a.t);return {trait:a.t,grp:'blood'}}w.trQ=a.t;return {trq:a.t,grp:'blood'}}},
 flyer:{lane:'trait',i:'🪂',n:'High-Flyer Showcase',need:3,min:3.5,gets:'{T}, and Flippy fans',
  d:'Spotfests and ladders until the highlight reels can\'t keep up.',build:'A 3½★+ Ladder, Tornado Tag or multi-person match',payoff:'A Ladder match on a PPV',
  pick:A=>{if(!Array.isArray(A.tr)||A.tr.length>=TR_SLOTS)return null;const t=['dare','hilite'].find(x=>!A.tr.includes(x)&&TRAITS[x]);return t?{t}:null},
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&(s.stip==='ladder'||s.stip==='tornado'||s.sides.length>=3),pay:(s,a)=>s.ppv&&s.ids.includes(a.a)&&s.stip==='ladder',
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:'ladder',ppv:st==='pay'?1:0}],
  win:(a,w,q)=>{if(q==='great'||!trOpenA(w)){trAdd(w,a.t);return {trait:a.t,grp:'flip'}}w.trQ=a.t;return {trq:a.t,grp:'flip'}}},
 rebrand:{lane:'trait',i:'🎭',n:'Rebrand',need:3,gets:'A new name and look, face or heel, a debut pop and Mic',
  d:'Tease a new character in vignettes, then debut it.',build:'A Backstage Vignette',payoff:'The new character\'s debut (a promo)',
  pick:A=>A.pop<75&&!A.rbArc?{}:null,
  step:(s,a)=>s.kind==='promo'&&s.type==='vignette'&&s.a===a.a,pay:(s,a)=>s.kind==='promo'&&s.a===a.a&&s.type!=='vignette',
  plan:(a,st)=>[{kind:'promo',type:st==='pay'?'callout':'vignette',a:a.a}],
  also:(a,s,n)=>{const w=aW(a.a);w.rbArc=AW();w.rbDue=1;n.push(`🎭 ${w.name} debuts a whole new character. Open ${aPr(w,'their')} profile to name it.`)},
  win:(a,w,q)=>({mic:.8,pop:q==='great'?6:3})},
 lastchase:{lane:'star',i:'⏳',n:'Last Chase',need:3,gets:'A huge payoff and popularity',
  d:'A veteran superstar\'s last run at the gold.',build:'A win over someone 80+ popularity',payoff:'A title match on a PPV',
  pick:A=>S.season>=2&&Object.values(S.titles||{}).some(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length&&!t.holders.includes(A.id))?{}:null,
  step:(s,a)=>sWon(s,a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>=80),pay:(s,a)=>s.ppv&&!!s.title&&s.ids.includes(a.a),
  plan:(a,st)=>{const A=aW(a.a);if(st==='build')return [{kind:'match',type:'singles',side:[a.a],n:1,win:0,oppF:w=>w.pop>=80}];const t=Object.values(S.titles).find(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length===1&&aMine(t.holders[0])&&!aW(t.holders[0]).inj&&t.holders[0]!==a.a);return t?[{kind:'match',type:'singles',vs:[t.holders[0],a.a],title:t.id,ppv:1}]:null},
  win:(a,w,q)=>({pop:q==='great'?2:1})},
 passtitle:{lane:'star',i:'🏅',n:'Passing the Title',need:3,gets:'A champion is made: a big popularity jump for {B}',
  d:'A champion superstar builds up {A:their} successor, then hands {B:them} the belt.',build:'In a segment with {B}',payoff:'{B} wins the title from {A:them}, clean',
  pick:A=>{const t=Object.values(S.titles||{}).find(t=>t.kind==='singles'&&t.holders.length===1&&t.holders[0]===A.id);if(!t)return null;const B=aBest(aRoster([A.id]).filter(w=>w.pop<70&&w.pop>=40&&w.g===A.g),w=>w.ring+w.mic/2);return B?{b:B.id,t2:t.id}:null},
  step:(s,a)=>s.ids.includes(a.a)&&s.ids.includes(a.b),pay:(s,a)=>s.title===a.t2&&sSingles(s)&&sWon(s,a.b)&&sVs(s,a.a,a.b)&&s.fin==='clean',
  plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'singles',vs:[a.b,a.a],title:a.t2,win:0}],
  win:(a,w,q)=>{const B=aW(a.b);if(B){popx(B,q==='great'?8:5);mor(B,10)}return {mor:6}}},
 invasion:{lane:'star',i:'🚪',n:'Invasion',need:3,gets:'A big payoff, popularity and casual fans',
  d:'Lead the charge in crossover season, then win on the crossover show.',build:'A win or a callout promo (at least 2 wins)',payoff:'A win on the crossover PPV',
  pick:A=>S.season>=2&&(typeof fdSeason!=='function'||fdSeason())?{}:null,
  step:(s,a)=>{if(sWon(s,a.a)){a.wins=(a.wins||0)+1;return true}return s.kind==='promo'&&s.a===a.a},ok:a=>(a.wins||0)>=2,
  pay:(s,a)=>s.ppv&&!!(curShow()&&curShow().fd)&&sWon(s,a.a),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,win:0,ppv:st==='pay'?1:0}],
  win:(a,w,q)=>({pop:q==='great'?2:1,fans:1.5})},

 /* ---- v429: arcs from Josh's storylines ---- */
 copycat:{lane:'trait',i:'🪞',n:'Copycat',need:3,gets:'Some of {B}\'s popularity and crowd, if it works',
  d:'Dress like {B:them}, talk like {B:them}, wrestle like {B:them}, then face the original. It could get {A:them} over, or crash and burn.',build:'A segment dressed as {B} (a promo or a match)',payoff:'A match against {B}',
  pick:A=>{if(A.pop>=80)return null;const B=aBest(aRoster([A.id]).filter(w=>w.pop>=A.pop+10&&w.g===A.g),w=>w.pop);return B?{b:B.id}:null},bstep:0,
  step:(s,a)=>s.ids.includes(a.a),pay:(s,a)=>sVs(s,a.a,a.b),
  plan:(a,st)=>st==='pay'?[{kind:'match',type:'singles',vs:[a.a,a.b]}]:[{kind:'promo',type:'callout',a:a.a,b:a.b},{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.id!==a.b}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);const last=a.st[a.st.length-1]||3;if(last<2.5){popx(A,-4);a.bomb=1;n.push(`🪞 ${A.name}'s copycat act crashed and burned.`);return}
   if(a.q==='great'){popx(B,-2);const g=aGrpOf(B)[0];if(g&&!aGrpOf(A).includes(g)&&!A.fg2)A.fg2=g;n.push(`🪞 The crowd is buying ${A.name} as the better version of ${B.name}.`)}},
  win:(a,w,q)=>a.bomb?{}:({pop:q==='great'?5:2.5})},
 transform:{lane:'trait',i:'💪',n:'Transformation',need:4,gets:'{T} and In-ring',
  d:'A month of backstage promos in the weight room, then {A:they} shows up a different animal.',build:'A Backstage Vignette',payoff:'A match on a PPV',
  pick:A=>{if(!Array.isArray(A.tr)||A.tr.length>=TR_SLOTS)return null;const t=['monster','hard'].find(x=>!A.tr.includes(x)&&TRAITS[x]&&!(x==='monster'&&A.tr.includes('under')));return t?{t}:null},
  step:(s,a)=>s.kind==='promo'&&s.type==='vignette'&&s.a===a.a,pay:(s,a)=>s.ppv&&s.kind==='match'&&s.ids.includes(a.a),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'vignette',a:a.a}]:[{kind:'match',type:'singles',side:[a.a],n:1,win:0,ppv:1}],
  win:(a,w,q)=>{if(q==='great'||!trOpenA(w)){trAdd(w,a.t);return {trait:a.t,ring:.6}}w.trQ=a.t;return {trq:a.t,ring:.4}}},
 factionwar:{lane:'trait',i:'⚔️',n:'Faction War',need:3,gets:'Popularity for the winners, and heat across both factions',
  d:'Two factions go to war: {A:theirs} and {B}\'s. If either doesn\'t have one yet, it forms now. Then they settle it on the biggest stage.',build:'A trios match against {B}\'s side, or a Faction Rally with {A:their} own',payoff:'A multi-person war against {B}\'s side on a PPV',
  pick:A=>aRoster([A.id]).filter(w=>w.g===A.g).length>=5?{}:null,
  setup:(a,A)=>{const own=(t,id)=>(t.type==='faction'||t.type==='trios')&&t.m.includes(id)&&t.m.filter(x=>aMine(x)).length>=3;const mk=(L,ex)=>{let F=(S.teams||[]).find(t=>own(t,L.id));if(F)return F;
    const two=aRoster([L.id].concat(ex)).filter(w=>w.g===L.g&&!arcIn(w.id)&&!ex.includes(w.id)).sort((x,y)=>(aMate(L,y)*3+y.pop/10+(y.al===L.al?5:0))-(aMate(L,x)*3+x.pop/10+(x.al===L.al?5:0))).slice(0,2);
    F={id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n:`${aLast(L)}'s crew`,type:'faction',m:[L.id].concat(two.map(w=>w.id))};S.teams=(S.teams||[]).concat([F]);news(`⚔️ ${F.n} forms around ${L.name}.`);return F};
   const B=aW(a.b);const F=mk(A,[a.b]);const G=mk(B,F.m);a.f=F.id;a.fn=F.n;a.f2=G.id;a.fn2=G.n},
  fm:(a,k)=>{const t=(S.teams||[]).find(t=>t.id===(k===2?a.f2:a.f));return t?t.m.filter(aMine):[]},
  step:(s,a)=>{const F=ARCS.factionwar.fm(a,1),G=ARCS.factionwar.fm(a,2);if(s.kind==='promo')return s.type==='rally'&&F.some(id=>id!==a.a&&sTog(s,a.a,id));return s.kind==='match'&&s.ids.includes(a.a)&&sOpps(s,a.a).some(id=>G.includes(id))},
  pay:(s,a)=>{const G=ARCS.factionwar.fm(a,2);return s.ppv&&s.kind==='match'&&s.ids.includes(a.a)&&s.ids.length>=6&&sOpps(s,a.a).filter(id=>G.includes(id)).length>=2},
  plan:(a,st)=>{const F=ARCS.factionwar.fm(a,1).filter(id=>id!==a.a&&!aW(id).inj),G=ARCS.factionwar.fm(a,2).filter(id=>!aW(id).inj);if(F.length<2||G.length<3)return st==='build'&&F.length?[{kind:'promo',type:'rally',a:a.a,b:F[0]}]:null;
   const m={kind:'match',type:'trios',vs2:[[a.a,F[0],F[1]],G.slice(0,3)]};if(st==='pay'){m.ppv=1;m.stip='anarchy';m.win=0}return st==='build'?[m,{kind:'promo',type:'rally',a:a.a,b:F[0]}]:[m]},
  also:(a,s,n)=>{const F=ARCS.factionwar.fm(a,1),G=ARCS.factionwar.fm(a,2);F.forEach(x=>G.forEach(y=>bumpHeat(x,y,a.q==='great'?15:8,[],'Faction war')));s.win.forEach(id=>{if(aW(id))popx(aW(id),a.q==='great'?3:1.5)});n.push(`⚔️ The war between ${a.fn} and ${a.fn2} comes to a head.`)},
  win:()=>({})},

 /* ---- v431: arcs from Josh's second round of storylines ---- */
 groundswell:{lane:'trait',i:'📣',n:'Groundswell',need:3,offShow:1,gets:'A huge jump in popularity and a wave of fans, after a few lean weeks',
  d:'Keep {A:them} off TV (or squash {A:them}) while the crowd gets louder and angrier every week. Then give {A:them} the big win.',build:'Leave {A:them} off the show, or have {A:them} lose a squash (it costs you some fans each week)',payoff:'A big win: the main event or on a PPV',
  pick:A=>A.pop<70?{}:null,step:()=>false,pay:(s,a)=>sWon(s,a.a)&&sBig(s),
  plan:(a,st)=>st==='pay'?[{kind:'match',type:'singles',side:[a.a],n:1,win:0,main:curShow().ppv?0:1}]:null,
  win:(a,w,q)=>({pop:q==='great'?10:6,fans:3})},
 breakfree:{lane:'mic',i:'⛓️',n:'Breaking Free',need:3,gets:'A face turn, popularity, a big morale lift and a feud with {B}',
  d:'Weeks of torment at the side of a heel leader, until {A:they} finally turns on {B:them}.',build:'On the same side as {B} (a match, or a promo together)',payoff:'Turns on {B}',
  pick:A=>({}),
  step:(s,a)=>sSame(s,a.a,a.b)||sTog(s,a.a,a.b),pay:(s,a)=>sSame(s,a.a,a.b)||sTog(s,a.a,a.b),
  plan:(a,st)=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:st==='build'?1:null},{kind:'promo',type:'rally',a:a.b,b:a.a}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(A.al==='h'){if(typeof pTurn==='function')pTurn(A);else A.al='f'}A.turnW=AW();bumpHeat(a.a,a.b,a.q==='great'?60:40,[],`${A.name} broke free of ${B.name}`);
   (S.teams||[]).forEach(t=>{if(t.m.includes(a.a)&&t.m.includes(a.b))t.m=t.m.filter(x=>x!==a.a)});S.teams=(S.teams||[]).filter(t=>t.m.length>=2);mor(A,a.q==='great'?12:8);n.push(`⛓️ ${A.name} has had enough, and turns on ${B.name}!`)},
  win:(a,w,q)=>({mic:.8,pop:q==='great'?4:2})},
 sellout:{lane:'trait',i:'💼',n:'The Corporate Offer',need:3,choice:[{k:'sign',n:'💼 Sign',d:'Suits, baby powder ads and a top spot. {A:They} turns heel if {A:they} was a face.'},{k:'refuse',n:'✊ Refuse',d:'{A:They} stays true to {A:themself} and the fans. {A:They} turns face if {A:they} was a heel.'}],
  gets:'Your call at the payoff: a top spot and money (sign), or the fans\' love (refuse)',
  d:'On the verge of stardom, an evil corporate force comes courting. Right before the payoff, you decide what {A:they} chooses.',build:'A promo (the corporation makes its pitch)',payoff:'A main event or PPV match: the decision',
  pick:A=>A.pop>=50&&A.pop<ARC_STAR?{}:null,
  step:(s,a)=>s.kind==='promo'&&s.ids.includes(a.a),pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&sBig(s),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'interview',a:a.a}]:[{kind:'match',type:'singles',side:[a.a],n:1,main:curShow().ppv?0:1}],
  also:(a,s,n)=>{const A=aW(a.a);if(!a.choice)a.choice=seeded((S.seed||'')+'|sell|'+a.id)()<.5?'sign':'refuse';
   if(a.choice==='sign'){if(A.al==='f'){if(typeof pTurn==='function')pTurn(A);else A.al='h'}A.turnW=AW();popx(A,a.q==='great'?8:5);S.money.p+=Math.round(aCost('sellout')*4);mor(A,4);n.push(`💼 ${A.name} signs with the corporation. Suits, baby powder, and a top spot.`)}
   else{if(A.al==='h'){if(typeof pTurn==='function')pTurn(A);else A.al='f'}A.turnW=AW();popx(A,a.q==='great'?5:3);mor(A,a.q==='great'?14:8);n.push(`✊ ${A.name} turns the corporation down, and the crowd loves ${aPr(A,'them')} for it.`)}},
  win:(a,w,q)=>a.choice==='refuse'?{fans:2}:{}},
 absolute:{lane:'ring',star:1,i:'👑',n:'Absolute Power',need:3,gets:'Heat, and a big night for whoever wins the final match',
  d:'A champion corrupted by the title will do anything to keep it, until someone has to stop {A:them} at any cost.',build:'A title defense {A:they} wins however {A:they} can (a dirty finish or a run-in counts)',payoff:'A title match against {B} on a PPV',
  pick:A=>{const t=Object.values(S.titles||{}).find(t=>t.kind==='singles'&&t.holders.length===1&&t.holders[0]===A.id);return t?{t2:t.id}:null},
  step:(s,a)=>{if(!(s.kind==='match'&&s.title===a.t2&&sWon(s,a.a)))return false;if((a.have||0)>=1){const A=aW(a.a);if(A.al==='f'){if(typeof pTurn==='function')pTurn(A);else A.al='h';A.turnW=AW()}}return true},
  pay:(s,a)=>s.ppv&&s.title===a.t2&&sVs(s,a.a,a.b),
  plan:(a,st)=>{const t=S.titles[a.t2];if(!t||!t.holders.includes(a.a))return null;return st==='build'?[{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.id!==a.b,title:a.t2,win:0,fin:'cheat'}]:[{kind:'match',type:'singles',vs:[a.a,a.b],title:a.t2,ppv:1}]},
  also:(a,s,n)=>{const wi=s.win[0];bumpHeat(a.a,a.b,40,[],'Absolute power');if(wi===a.b){popx(aW(a.b),a.q==='great'?8:5);n.push(`👑 ${aW(a.b).name} stops ${aW(a.a).name} at last.`)}else if(wi===a.a){popx(aW(a.a),3);n.push(`👑 Nobody can stop ${aW(a.a).name}. Not yet.`)}},
  win:()=>({})},
 earnfight:{lane:'ring',i:'🪓',n:'Earn the Fight',need:3,heatStep:10,bstep:0,gets:'In-ring, popularity and the beating {B} deserves',
  d:'To get {A:their} hands on a despised foe, {A:they} first has to run the gauntlet the foe puts in front of {A:them}. You book every stop.',build:'A win over someone new (each stop heats up the feud with {B})',payoff:'A PPV match against {B}',
  pick:A=>({}),
  step:(s,a)=>{if(!sWon(s,a.a)||sOpps(s,a.a).includes(a.b))return false;a.opp=a.opp||[];const o=sOpps(s,a.a).filter(id=>!a.opp.includes(id));if(!o.length)return false;a.opp.push(...o);return true},
  pay:(s,a)=>s.ppv&&sVs(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',side:[a.a],n:1,win:0,oppF:w=>w.id!==a.b&&!(a.opp||[]).includes(w.id)}]:[{kind:'match',type:'singles',vs:[a.a,a.b],ppv:1}],
  win:(a,w,q)=>({ring:1,pop:q==='great'?3:1.5})},
};
/* ---- v436: arcs from Josh's fourth round of storylines. Each lays out its own stops (stops: name n, text b, test s, plan p, min);
   aStopArc turns them into the arc's build steps. ---- */
{const vig=(s,a)=>s.kind==='promo'&&s.type==='vignette'&&s.a===a.a;vig.vig=1;const pVig=a=>[{kind:'promo',type:'vignette',a:a.a}];
 const tog=(s,a)=>sTog(s,a.a,a.b);const pTog=(t,bFirst)=>a=>[{kind:'promo',type:t,a:bFirst?a.b:a.a,b:bFirst?a.a:a.b}];
 const withB=(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.ids.includes(a.b);
 const fac=A=>aTeams(A.id).find(t=>(t.type==='faction'||t.type==='trios')&&t.m.filter(id=>id!==A.id&&aMine(id)).length>=2);
 const facM=a=>{const t=(S.teams||[]).find(t=>t.id===a.f);return t?t.m.filter(id=>id!==a.a&&aMine(id)):[]};
 const mkTeam=(n,m,type)=>{S.teams=S.teams||[];const t={id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n,type,m};S.teams.push(t);return t};
 const chemUp=(m,v)=>{for(let i=0;i<m.length;i++)for(let j=i+1;j<m.length;j++){const k=key(m[i],m[j]);S.chem[k]=clamp((S.chem[k]||0)+v,-5,6)}};
 const peace=(x,y,how)=>{const k=key(x,y);if(S.heat&&S.heat[k]>0&&typeof endFeud==='function')endFeud(k,how,'🤝')};
 const turnTo=(A,al)=>{if(A.al!==al){if(typeof pTurn==='function')pTurn(A);else A.al=al}A.turnW=AW()};
 Object.assign(ARCS,{
 number:{lane:'ring',i:'🧨',n:'Got Your Number',bstep:0,gets:'In-ring, and on a great payoff Daredevil',
  d:'{B} has {A:their} number. {A:They} loses to {B:them} again and again, until {A:they} comes up with a move too dangerous for anyone else to try. Then {A:they} tries it.',
  payoff:'A singles win over {B}: the move',
  pick:A=>A.ring<92?{}:null,
  stops:[{n:'Beaten',b:'A loss to {B}',s:(s,a)=>sLost(s,a.a)&&sOpps(s,a.a).includes(a.b),p:a=>[{kind:'match',type:'singles',vs:[a.a,a.b],win:1}]},
   {n:'Beaten again',b:'Another loss to {B}',s:(s,a)=>sLost(s,a.a)&&sOpps(s,a.a).includes(a.b),p:a=>[{kind:'match',type:'singles',vs:[a.a,a.b],win:1}]},
   {n:'Back to the drawing board',b:'A Backstage Vignette: a move too dangerous for anyone else',s:vig,p:pVig}],
  pay:(s,a)=>sSingles(s)&&sWon(s,a.a)&&sOpps(s,a.a).includes(a.b),pplan:a=>[{kind:'match',type:'singles',vs:[a.a,a.b],win:0}],
  also:(a,s,n)=>{n.push(`🧨 ${aW(a.a).name} hits the move nobody else would dare, and finally beats ${aW(a.b).name}.`)},
  win:(a,w,q)=>{if(q==='great'&&Array.isArray(w.tr)&&w.tr.length<TR_SLOTS&&!w.tr.includes('dare')&&TRAITS.dare){trAdd(w,'dare');return {ring:1,trait:'dare'}}return {ring:1.2}}},
 wedding:{lane:'trait',star:1,i:'💒',n:'The Wedding',bstep:0,gets:'Popularity and either a three-way feud or a throuple',
  d:'{B} and {C} are getting married, until {A} reveals {A:they}\'s been married to both of them all along. They settle it three ways, then you decide how it ends.',
  payoff:'A triple threat: {A}, {B} and {C}. Then they all break up, or form a throuple',
  pick:A=>aRoster([A.id]).length>=2?{}:null,
  stops:[{n:'The engagement',b:'A Backstage Vignette with {B} and {C}: the proposal',min:2,s:(s,a)=>s.kind==='promo'&&sTog(s,a.b,a.c),p:a=>[{kind:'promo',type:'vignette',a:a.b,b:a.c}]},
   {n:'Speak now',b:'A promo with {B}: {A} objects. {A:They}\'s been married to {B:them} all along',s:tog,p:pTog('callout')},
   {n:'Married twice',b:'A promo with {C}: and to {C:them} as well',s:(s,a)=>sTog(s,a.a,a.c),p:a=>[{kind:'promo',type:'callout',a:a.a,b:a.c}]}],
  pay:(s,a)=>s.kind==='match'&&s.sides.length===3&&new Set([a.a,a.b,a.c].map(id=>sSide(s,id))).size===3&&![a.a,a.b,a.c].some(id=>sSide(s,id)<0),
  pplan:a=>[{kind:'match',type:'triple',vs2:[[a.a],[a.b],[a.c]]}],
  choice:[{k:'split',n:'💔 They all break up',d:'Three ways to hate each other: a feud between all three.'},{k:'throuple',n:'💞 They form a throuple',d:'All three together: a new faction, with chemistry.'}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b),C=aW(a.c);if(!a.choice)a.choice=seeded((S.seed||'')+'|wed|'+a.id)()<.5?'split':'throuple';const m=[a.a,a.b,a.c];
   (S.teams||[]).forEach(t=>{if(t.type==='team'&&t.m.includes(a.b)&&t.m.includes(a.c))t.m=t.m.filter(x=>x!==a.c)});S.teams=(S.teams||[]).filter(t=>t.m.length>=2);
   if(a.choice==='throuple'){m.forEach((x,i)=>m.slice(i+1).forEach(y=>peace(x,y,'They became a throuple')));chemUp(m,a.q==='great'?3:2);const t=mkTeam(`${aLast(A)}, ${aLast(B)} & ${aLast(C)}`,m,'faction');n.push(`💞 ${A.name}, ${B.name} and ${C.name} are a throuple now: ${t.n}.`)}
   else{m.forEach((x,i)=>m.slice(i+1).forEach(y=>bumpHeat(x,y,a.q==='great'?40:25,[],'The wedding from hell')));chemUp([a.b,a.c],-2);[B,C].forEach(w=>mor(w,-4));n.push(`💔 The wedding is off. ${A.name}, ${B.name} and ${C.name} are all done with each other.`)}},
  win:(a,w,q)=>({pop:q==='great'?3:1.5})},
 faith:{lane:'mic',i:'🙏',n:'Crisis of Faith',gets:'Mic, and either a faction that converts or a feud with the one that kicks {A:them} out',
  d:'{A} becomes deeply religious, much to the discomfort of the rest of {F}, until the faction has to decide: convert, or kick {A:them} out.',
  payoff:'A Faction Rally with {B}: the faction converts, or kicks {A:them} out',
  recast:(A,o)=>{const F=aTeams(A.id).find(t=>(t.type==='faction'||t.type==='trios')&&t.m.includes(o.b));return F?Object.assign({},o,{f:F.id,fn:F.n}):o},
  pick:A=>{const F=fac(A);if(!F)return null;const B=aBest(F.m.filter(id=>id!==A.id&&aMine(id)).map(aW).filter(w=>w&&!w.inj),w=>w.pop);return B?{f:F.id,fn:F.n,b:B.id}:null},
  stops:[{n:'The calling',b:'A Backstage Vignette: {A:they} finds religion',s:vig,p:pVig},
   {n:'Preaching',b:'A Faction Rally with someone in {F}: {A:they} won\'t stop preaching',s:(s,a)=>s.kind==='promo'&&s.type==='rally'&&facM(a).some(id=>sTog(s,a.a,id)),p:a=>[{kind:'promo',type:'rally',a:a.a,b:a.b}]},
   {n:'Squirming',b:'On the same side as someone in {F}, who\'d rather not be',s:(s,a)=>facM(a).some(id=>sSame(s,a.a,id)),p:a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2}]}],
  pay:(s,a)=>s.kind==='promo'&&s.type==='rally'&&facM(a).some(id=>sTog(s,a.a,id)),pplan:a=>[{kind:'promo',type:'rally',a:a.b,b:a.a}],
  choice:[{k:'convert',n:'🙏 Everyone in {F} converts',d:'They find faith together: chemistry for the whole faction, and {A} leads the flock.'},{k:'out',n:'🚪 Kick {A:them} out',d:'{A} is out of {F}: heat with every member, and the crowd feels for {A:them}.'}],
  also:(a,s,n)=>{const A=aW(a.a);const t=(S.teams||[]).find(t=>t.id===a.f);if(!a.choice)a.choice=seeded((S.seed||'')+'|faith|'+a.id)()<.5?'convert':'out';if(!t)return;
   if(a.choice==='convert'){chemUp(t.m,a.q==='great'?2:1);t.m.forEach(id=>{if(id!==a.a&&aW(id))mor(aW(id),3)});n.push(`🙏 Everyone in ${t.n} finds faith. ${A.name} leads the flock now.`)}
   else{const was=t.m.filter(id=>id!==a.a);t.m=was;S.teams=(S.teams||[]).filter(x=>x.m.length>=2);was.forEach(id=>{if(aW(id))bumpHeat(a.a,id,a.q==='great'?35:25,[],`${t.n} kicked ${A.name} out`)});popx(A,a.q==='great'?3:2);n.push(`🚪 ${A.name} is out of ${t.n}.`)}},
  win:(a,w,q)=>({mic:1,pop:q==='great'?2:1})},
 haircut:{lane:'trait',i:'💇',n:'New Haircut',bstep:0,gets:'A new name and look, Mic and a debut pop, and {B} losing {B:their} mind',
  d:'{A} gets a haircut, and everyone is convinced {A:they}\'s a brand new member of the roster. Everyone except {B}, who goes mad trying to get {A:them} to admit it.',
  payoff:'A singles match against {B}: the "debut"',
  pick:A=>A.pop<80&&!A.rbArc?{}:null,
  stops:[{n:'The new arrival',b:'A Backstage Vignette: a "new" wrestler arrives',s:vig,p:pVig},
   {n:'"It\'s the same person!"',b:'A promo with {B}, who insists it\'s {A} with a haircut',s:tog,p:pTog('callout',1)},
   {n:'Losing it',b:'In a match with {B} (either side)',s:withB,p:a=>[{kind:'match',type:'singles',vs:[a.a,a.b]}]}],
  pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),pplan:a=>[{kind:'match',type:'singles',vs:[a.a,a.b]}],
  also:(a,s,n)=>{const w=aW(a.a),B=aW(a.b);w.rbArc=AW();w.rbDue=1;bumpHeat(a.a,a.b,a.q==='great'?30:20,[],`${B.name} won't let the haircut go`);mor(B,-4);
   n.push(`💇 Everyone welcomes the "new arrival". Open ${aPr(w,'their')} profile to name ${aPr(w,'them')}.`);n.push(`🤯 ${B.name} has lost it: "IT'S THE SAME PERSON!"`)},
  win:(a,w,q)=>({mic:.8,pop:q==='great'?5:2.5})},
 goodwill:{lane:'mic',star:1,i:'🎁',n:'Too Good to Be True',bstep:0,gets:'Mic and popularity, and either a face turn and a friend in {B}, or a blood feud with {B}',
  d:'{A} starts handing out presents, hugging opponents and baking apology soufflés. Everyone\'s buying it except {B}. Right before the payoff, you decide whether it was real.',
  payoff:'Team with {B}: the truth comes out',
  pick:A=>A.al==='h'?{}:null,
  stops:[{n:'Presents',b:'A Backstage Vignette: presents for the kids in the crowd',s:vig,p:pVig},
   {n:'Hugs',b:'A match against someone other than {B} (and a loving hug after)',s:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&!s.ids.includes(a.b),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.id!==a.b}]},
   {n:'The soufflé',b:'A Sit-Down Interview: an apology soufflé for everyone {A:they}\'s wronged',s:(s,a)=>s.kind==='promo'&&s.ids.includes(a.a)&&!s.ids.includes(a.b),p:a=>[{kind:'promo',type:'interview',a:a.a}]},
   {n:'Not buying it',b:'A promo with {B}, who\'s suspicious',s:tog,p:pTog('callout',1)}],
  pay:(s,a)=>sSame(s,a.a,a.b),pplan:a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  choice:[{k:'ruse',n:'🐍 It was all a ruse',d:'{A:They} got close to everyone {B} loves to turn them against {B:them}. {A} stays a heel, and {B} has a blood feud and a locker room that doubts {B:them}.'},
   {k:'real',n:'🤗 It was real',d:'{A} turns face, and {A:they} and {B} become friends.'}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(!a.choice)a.choice=seeded((S.seed||'')+'|gw|'+a.id)()<.5?'ruse':'real';
   if(a.choice==='ruse'){bumpHeat(a.a,a.b,a.q==='great'?70:50,[],`${A.name}'s kindness was a ruse`);mor(B,-8);(typeof fgFriends==='function'?fgFriends(B):[]).filter(o=>o.id!==a.a).forEach(o=>mor(o,-3));n.push(`🐍 It was all a ruse. ${A.name} turns on ${B.name}, and the people ${B.name} loves aren't so sure about ${aPr(B,'them')} anymore.`)}
   else{turnTo(A,'f');peace(a.a,a.b,'Became friends');chemUp([a.a,a.b],a.q==='great'?3:2);mor(B,6);n.push(`🤗 It was real. ${A.name} is a face now, and ${B.name} finally believes it.`)}},
  win:(a,w,q)=>({mic:1,pop:q==='great'?3:1.5})}});
 function aStopArc(D){const st=D.stops;const at=a=>st[Math.min((a&&a.have)||0,st.length-1)];D.need=st.length;D.builds=st.map(x=>x.b);D.mins=st.map(x=>x.min!=null?x.min:x.s&&x.s.vig?ARC_VIGMIN:ARC_MIN);D.build=st[0].b;
  if(!D.tell)D.tell=st.map(x=>x.n||'');D.step=(s,a)=>at(a).s(s,a);D.plan=(a,stg)=>stg==='build'?(at(a).p?at(a).p(a):null):D.pplan(a)}
 ['number','wedding','faith','haircut','goodwill'].forEach(k=>aStopArc(ARCS[k]))}
for(const k in ARCS)ARCS[k].k=k;window.ARCS=ARCS;window.ARC_STAR=ARC_STAR;window.ARC_SLOTS=ARC_SLOTS;window.ARC_MIN=ARC_MIN;
/* ---- variants: the big story arcs come in 2–3 versions, and each new game deals one (same name and reward, a different road) ---- */
const ARC_VARS={
 heelturn:[{vn:'Partners'},
  {vn:'The Rally',payoff:'A promo with {B} that ends in the turn',pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'promo',type:'attack',a:a.a,b:a.b}]},
  {vn:'Costly Run-in',payoff:'Run in on {B}\'s match and cost {B:them} it',pay:(s,a)=>s.rix===a.a&&s.rit===a.b&&(s.rik==='cost'||s.rik==='attack'),
   plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'singles',side:[a.b],n:1,win:1,ri:{x:a.a,t:a.b,k:'cost',turn:true}}]}],
 faceturn:[{vn:'Side by Side'},
  {vn:'The Save',payoff:'Run in and save {B} from a heel',pay:(s,a)=>s.rix===a.a&&s.rik==='save'&&s.ids.includes(a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'singles',side:[a.b],n:1,oppF:w=>w.al==='h'&&w.id!==a.a,ri:{x:a.a,t:'$opp',k:'save',turn:true}}]},
  {vn:'The Apology',payoff:'A promo with {B}: the apology, and the turn',pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'promo',type:'interview',a:a.a,b:a.b}]}],
 betrayal:[{vn:'After the Bell'},
  {vn:'Ambush',payoff:'A promo with {B} that ends in an ambush',pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:!(a.wins||0)?0:null}]:[{kind:'promo',type:'attack',a:a.a,b:a.b}]},
  {vn:'Costs Them the Big One',payoff:'Run in on {B}\'s PPV match and cost {B:them} it',pay:(s,a)=>s.ppv&&s.rix===a.a&&s.rit===a.b&&s.rik==='cost',
   plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:!(a.wins||0)?0:null}]:[{kind:'match',type:'singles',side:[a.b],n:1,win:1,ppv:1,ri:{x:a.a,t:a.b,k:'cost'}}]}],
 breakup:[{vn:'Settle It in the Ring'},
  {vn:'The Split on the Mic',build:'A tag loss together',payoff:'A promo together where they split',
   step:(s,a)=>sSame(s,a.a,a.b)&&sLost(s,a.a),pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='pay'?[{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:1}]}],
 mentor:[{vn:'Student vs Teacher'},
  {vn:'Graduation',payoff:'A tag win with {B} on a PPV',pay:(s,a)=>s.ppv&&sSame(s,a.a,a.b)&&sWon(s,a.a),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2},{kind:'match',type:'singles',vs:[a.a,a.b]}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:0,ppv:1}]}],
 gauntlet:[{vn:'One at a Time'},
  {vn:'Multi-Person Road',build:'A Triple Threat or Four-Way (at least 1 win along the way)',
   step:(s,a)=>{if(s.kind!=='match'||!s.ids.includes(a.a)||s.sides.length<3)return false;if(sWon(s,a.a))a.wins=(a.wins||0)+1;return true},
   plan:(a,st)=>{if(st==='build')return [{kind:'match',type:'triple',side:[a.a],ffa:2,win:(a.wins||0)?null:0}];return ARCS.gauntlet.plan(a,st)}}],
 torch:[{vn:'Clean in the Middle'},
  {vn:'The Endorsement',payoff:'A promo with {B} on a PPV: the handoff',pay:(s,a)=>s.ppv&&sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'promo',type:'rally',a:a.a,b:a.b,ppv:1}]}],
 dream:[{vn:'Face to Face'},
  {vn:'Dream Team',payoff:'A tag win together on a PPV',pay:(s,a)=>s.ppv&&sSame(s,a.a,a.b)&&sWon(s,a.a),
   plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:0,ppv:1}]}],
 stakes:[{vn:'Pay the Price'},
  {vn:'Loser Leaves Town',payoff:'A singles match against {B}: the loser leaves for 8 weeks',
   also:(a,s,n)=>{const wi=s.win.includes(a.a)?a.a:s.win.includes(a.b)?a.b:null;const lo=wi===a.a?a.b:wi===a.b?a.a:null;if(!lo)return;const L=aW(lo);L.inj=Math.max(L.inj||0,8);L.susp=true;mor(L,-8);popx(aW(wi),a.q==='great'?5:3);if(lo===a.a)a.lost=1;n.push(`🚪 ${L.name} lost, and leaves town for 8 weeks.`)}}],
 cult:[{vn:'The Rally'},
  {vn:'The Uprising',payoff:'A trios win with two of the followers',
   pay:(s,a)=>s.kind==='match'&&sWon(s,a.a)&&(a.opp||[]).filter(id=>sSame(s,a.a,id)).length>=2,
   plan:(a,st)=>{if(st==='build')return ARCS.cult.plan(a,st);const f=(a.opp||[]).filter(id=>aMine(id)&&!aW(id).inj).slice(0,2);return f.length===2?[{kind:'match',type:'trios',side:[a.a].concat(f),n:3,win:0}]:null}}],
 retire:[{vn:'Retirement'},
  {vn:'Absorption',gets:'Popularity and heat, the loser retires, and the winner takes one of the loser\'s traits',
   also:(a,s,n)=>{ARCS.retire.also(a,s,n);const wi=s.win.includes(a.a)?a.a:s.win.includes(a.b)?a.b:null;const lo=wi===a.a?a.b:wi===a.b?a.a:null;if(!wi||!lo)return;const W=aW(wi),L=aW(lo);
    const t=(L.tr||[]).find(x=>TRAITS[x]&&!(W.tr||[]).includes(x)&&!(typeof trClash==='function'&&trClash(x,W.tr||[])));if(t){W.tr=(W.tr||[]).concat([t]);n.push(`🌀 ${W.name} absorbs ${L.name}'s aura: ${TRAITS[t].i} ${TRAITS[t].n}.`)}}}],
 reunion:[{vn:'Back Together'},
  {vn:'Back for Gold',payoff:'A tag title match together',pay:(s,a)=>sSame(s,a.a,a.b)&&!!s.title,
   plan:(a,st)=>{if(st==='build')return ARCS.reunion.plan(a,st);const A=aW(a.a);const t=Object.values(S.titles||{}).find(t=>t.kind!=='singles'&&t.holders.length===2&&t.holders.every(id=>aMine(id)&&!aW(id).inj)&&!t.holders.includes(a.a)&&!t.holders.includes(a.b));
    return t?[{kind:'match',type:'tag',vs2:[[a.a,a.b],t.holders.slice()],title:t.id}]:null}}]};
window.ARC_VARS=ARC_VARS;
function aVarOf(k){const l=ARC_VARS[k];if(!l||l.length<2)return 0;S.arcVar=S.arcVar||{};if(S.arcVar[k]==null)S.arcVar[k]=Math.floor(seeded((S.seed||'')+'|arcv|'+k)()*l.length);return S.arcVar[k]}
function aDK(k,v,sl){const D=ARCS[k];if(!D)return D;const V=(ARC_VARS[k]||[])[v!=null?v:aVarOf(k)];const X=V?Object.assign({},D,V):D;return sl?aRoadOf(X,(ARC_STORY[k]||[]).find(x=>x.id===sl)):X}
/* v435: a storyline can lay its own road over the arc: stops [{n name, b text, s(seg,a) test, p(a) plan, min}], its own tell names,
   and its own payoff {payoff text, pay test, pplan}. Only runs started with it (a.rd) use it, so older runs keep their road. */
function aRoadOf(D,SL){const R=SL&&SL.road;if(!R)return D;const X=Object.assign({},D);if(R.tell)X.tell=R.tell;if(R.bstep!=null)X.bstep=R.bstep;
 if(R.stops){const st=R.stops;const at=a=>st[Math.min((a&&a.have)||0,st.length-1)];X.need=st.length;delete X.need2;X.ok=R.ok||null;X.offShow=0;
  X.builds=st.map(x=>x.b);X.mins=st.map(x=>x.min!=null?x.min:x.s&&x.s.vig?ARC_VIGMIN:ARC_MIN);delete X.min;X.build=st[0].b;if(!R.tell)X.tell=st.map(x=>x.n||'');
  X.step=(s,a)=>at(a).s(s,a);const P=D.plan;X.plan=(a,stg)=>stg==='build'?(at(a).p?at(a).p(a):null):(R.pplan?R.pplan(a):P(a,stg))}
 else if(R.pplan){const P=D.plan;X.plan=(a,stg)=>stg==='build'?P(a,stg):R.pplan(a)}
 if(R.payoff)X.payoff=R.payoff;if(R.pay)X.pay=R.pay;if(R.d)X.d=R.d;return X}
const aBuildAt=(D,i)=>D.builds?D.builds[Math.min(i||0,D.builds.length-1)]:D.build;
/* a lower-card wrestler's build steps ask a little less of them: up to ARC_EASE ★ off at ARC_EASELO popularity or under, none at ARC_CPMID */
const aEase=w=>!w?0:Math.round(clamp((ARC_CPMID-(w.pop||0))/(ARC_CPMID-ARC_EASELO),0,1)*ARC_EASE*2)/2;
const aMinAt=(D,i)=>D.mins&&D.mins[Math.min(i||0,D.mins.length-1)]!=null?D.mins[Math.min(i||0,D.mins.length-1)]:(D.min||ARC_MIN);
function aD(a){return aDK(a.k,a.v,a.rd?a.sl:null)}
window.aDK=aDK;
const aName=(k,v)=>{const D=aDK(k,v);return D?D.n+(D.vn&&ARC_VARS[k]&&ARC_VARS[k].length>1?` · ${D.vn}`:''):''};

/* ---- the board is dealt fresh every game: a core that's always there, story-locked arcs pinned to their milestone,
   and everything else shuffled across the open slots ---- */

/* ---- hidden fits: everyone is secretly made for one arc. Run it with them and the payoff is bigger and they get more out of it;
   it's found for good once it pays off ---- */
const ARC_FIT=1.5;
function arcFitOf(w){if(!w)return null;S.arcFit=S.arcFit||{};if(S.arcFit[w.id]===undefined){const l=Object.keys(ARCS).filter(k=>ARCS[k].lane!=='star');S.arcFit[w.id]=l[Math.floor(seeded((S.seed||'')+'|arcfit|'+w.id)()*l.length)]}return S.arcFit[w.id]}
const arcFitKnown=w=>!!(w&&S.arcFitK&&S.arcFitK[w.id]);
window.arcFitOf=arcFitOf;
/* ---- v429: storylines. An arc is the skeleton; a storyline is the story it tells. Each run deals one of the arc's storylines
   (or none: the default lines). head is the one-line pitch ({A} = the wrestler, {B}/{C} = the others); txt holds the lines
   that play at each moment (start, step, pay, great, good, fail) — leave one out and the arc's default plays. ---- */
const ARC_STORY=window.ARC_STORY||{
 cult:[{id:'cult',head:'{A} starts a cult',txt:{}}],
 mentor:[{id:'bastard',head:'{A} is revealed to be the illegitimate child of {B}',txt:{}},{id:'fraud',head:"{A}'s childhood hero {B} is turning out to be a fraud",txt:{}}],
 gauntlet:[{id:'father',head:'{A} must conquer the gauntlet to discover who {A:their} true father really is',txt:{}}],
 betrayal:[{id:'jealous',head:'{A} was {B}\'s biggest supporter, until the jealousy took over',txt:{}}],
 breakup:[{id:'jealous',head:'{A} was {B}\'s biggest supporter, until the jealousy took over',txt:{}},{id:'toxic',head:'{A} breaks up with {A:their} terrible, toxic partner to be with a handsome hunk on the roster',romance:1,txt:{}}],
 reunion:[{id:'toxic',head:'{A} leaves {A:their} terrible, toxic partner to be with {B}',romance:1,txt:{}}],
 redemption:[{id:'shoot',head:'{A} tried to shoot on an opponent, and now faces a trial and rehabilitation',txt:{}}],
 stakes:[{id:'home',head:"{A} burns down {B}'s childhood home after {B} threatened {A:their} baby",txt:{}}],
 retire:[{id:'home',head:"{A} burns down {B}'s childhood home after {B} threatened {A:their} baby",txt:{}},{id:'absorb',head:'{A} absorbs {B} into {A:their} body and inherits {B:their} aura',vk:1,txt:{}}],
 rebrand:[{id:'dream',head:"{A}'s hero's journey takes place entirely inside a dream",txt:{}},{id:'shadow',head:'{A} enters the shadow realm and comes out a little different, and stranger every week',txt:{}}],
 trial:[{id:'mountain',head:'{A} must prove {A:themself} to a wise old man on a mountain who decides the fates of all mortal souls',txt:{}}],
 join:[{id:'love',head:'{A} falls in love with someone in {F}',romance:1,txt:{}}],
 faceturn:[{id:'love',head:'{A} falls in love with {B}, from the other side of the line',romance:1,txt:{}}],
 copycat:[{id:'copy',head:'{A} starts dressing exactly like {B}: the catchphrases, the moves, everything',txt:{}}],
 transform:[{id:'bulk',head:'{A} spends a full month of television bulking up in backstage promos',txt:{}}],
 factionwar:[{id:'holy',head:'A holy war breaks out between {F} and {F2}',txt:{}}],
 /* v431: Josh's second round */
 groundswell:[{id:'social',head:'{A} starts a groundswell on social media after being left off TV, until the crowd is too loud to ignore',txt:{}}],
 breakfree:[{id:'abuse',head:'{A} is fed up after weeks of torment from {B}, and finally turns on {B:them} in one glorious, cathartic moment',txt:{}}],
 sellout:[{id:'corp',head:'On the verge of stardom, {A} is courted by an evil corporation: wear suits, sell baby powder, get a top spot',txt:{}}],
 absolute:[{id:'power',head:'{A} is corrupted by the power of the title and will do anything to keep it, until {B} stops {A:them} at any cost',txt:{}}],
 earnfight:[{id:'run',head:"To give {B} the beating {B:they} truly deserves, {A} must first run {B}'s gauntlet",txt:{}}],
};
(ARC_STORY.heelturn=ARC_STORY.heelturn||[]).push({id:'watch',head:'{A} gets really into {A:their} new luxury watch, and lets it slowly take over {A:their} whole personality',txt:{}});
(ARC_STORY.gauntlet=ARC_STORY.gauntlet||[]).push({id:'finish',head:'{A} sets out to finish the story: impossible odds, all the way to the top',txt:{}});
(ARC_STORY.under=ARC_STORY.under||[]).push({id:'finish',head:'{A} sets out to finish the story: impossible odds, all the way to the top',txt:{}});
ARC_STORY.stakes.push({id:'dog',head:"{B} cooked {A}'s dog and fed it to {A:them}. Now {A} will make {B} feel what a dog feels like",stip:'dog',txt:{}},
 {id:'crimes',head:'{A} commits crimes in the ring week after week and evades arrest, until {B} agrees to an unsanctioned Lights Out match to stop {A:them}',stip:'lights',txt:{}},
 {id:'custody',head:"A bombshell: {A} is Dominik Mysterio's biological father, and must wrestle {B} for custody",stip:'ladder',txt:{}});
(ARC_STORY.tap=ARC_STORY.tap||[]).push({id:'hell',head:'{A} travels to the deepest layer of hell to learn the most painful submission hold on this or any plane of existence',txt:{}});
ARC_STORY.rebrand.push({id:'box',head:'{A} spends weeks inside a big mysterious box before {A:their} debut',txt:{}});
ARC_STORY.redemption.push({id:'tape',head:'After a big loss, {A} watches the match over and over, cutting off {A:their} hair as {A:they} goes mad figuring out what went wrong',txt:{}});
(ARC_STORY.streak=ARC_STORY.streak||[]).push({id:'pinfall',head:'{A} took two straight falls in a 2 Out of 3 Falls match, and vows never to be pinned again',txt:{}});
ARC_STORY.mentor.push({id:'violence',head:'{A}, a sweet, lovable babyface, learns the ways of unsettling violence from {B} to beat a foe far more dangerous',need:(A,B)=>A.al==='f'&&!!B&&aGrpOf(B).includes('blood'),txt:{}});
(ARC_STORY.voice=ARC_STORY.voice||[]).push({id:'stutter',head:'{A} overcomes a stutter to become the King of Speech',txt:{}});
ARC_STORY.join.push({id:'cultjoin',head:'{A} joins a cult: {F}',txt:{}});
/* v432: Josh's third round — every arc now tells a story */
const aTagTitle=(a)=>Object.values(S.titles||{}).find(t=>t.kind!=='singles'&&t.holders.length===2&&t.holders.every(id=>aMine(id)&&!aW(id).inj)&&!t.holders.includes(a.a)&&!t.holders.includes(a.b));
Object.assign(ARC_STORY,{
 team:[{id:'twins',head:'{A} discovers {B} is {A:their} fraternal twin, separated at birth. They come together and lock it in with a tag title win',
  payPlan:a=>{const t=aTagTitle(a);return t?[{kind:'match',type:'tag',vs2:[[a.a,a.b],t.holders.slice()],title:t.id,win:0}]:null},txt:{}}],
 ironman:[{id:'smile',head:'{A} has lost {A:their} smile. A new challenge with a new stipulation every week, nothing fitting quite right, until {A:they} finally smiles again',vary:1,txt:{}}],
 comeback:[{id:'dirk',head:'Mourning the death of {A:their} beloved Dirk, {A} tries to power through and gets hurt. Now it\'s agonizing rehab and the stages of grief',txt:{}}],
 hometown:[{id:'proveit',head:'{A} is frantic to rise up the card before {A:their} big hometown return, to prove to friends and family this career is actually going well',txt:{}}],
 school:[{id:'manifest',head:'{A} suddenly manifests a new power mid-match, stunning everyone, {A:themself} included. Now {A:they} must control it before it destroys {A:them}',txt:{}}],
 torch:[{id:'movie',head:'{A} finally scored a starring role in next year\'s direct-to-streaming "All Things Through Christ", and hand-picks {B} to take {A:their} spot',txt:{}}],
 faction:[{id:'cult',head:'{A} starts a cult',txt:{}}],
 fightchamp:[{id:'nobody',head:'With no one left to conquer, {A} issues open challenges, until someone comes out {A:they} simply cannot contend with',
  payPlan:a=>{const t=S.titles[a.t2];if(!t||!t.holders.includes(a.a))return null;const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,title:a.t2,ppv:1,win:1,oppF:w=>w.pop>=A.pop}]},txt:{}}],
 proveit:[{id:'beautiful',head:'Furious at the crowd\'s narrow-mindedness and quote-tweeting in all caps, {A} sets out to prove every style of wrestling is beautiful',txt:{}}],
 cross:[{id:'statusquo',head:'Furious at the idea that every style of wrestling is beautiful, {A} sets out to prove {A:their} style belongs only with the ones that suit it',txt:{}}],
 techshow:[{id:'mainstream',head:'{A} is going to make technical wrestling a mainstream thing even if it kills {A:them}',txt:{}}],
 hardcore:[{id:'blood',head:'After losing violently, {A} gets a taste for blood with no way to quench it, until a hardcore legend teaches {A:them} to leave the mat sticky and the fans squeamish',txt:{}}],
 flyer:[{id:'high',head:'{A} can jump really high, and {A:they} wants people to see that',txt:{}}],
 dream:[{id:'catering',head:'{A} and {B} promise the crowd the best match they\'ve ever seen, until one finds out the other got meat banned from catering',need:(A,B)=>A.al==='f'&&!!B&&B.al==='f',txt:{}}],
 farewell:[{id:'demons',head:'Ready to hang it up after a long career, {A} must battle the demons of {A:their} past to rid {A:themself} of the guilt that\'s plagued {A:them}, and retire in peace',txt:{}}],
 lastchase:[{id:'hangup',head:'Ready to hang it up after a long career, {A} has one last thing to do: squash that stupid little fucker holding the world title, then retire in peace',
  choice:[{k:'champ',n:'👑 Retire as champion',d:'{A:They} wins the title tonight, then walks away on top.',win:'a'},{k:'fall',n:'🙇 Go out on {A:their} back',d:'{A:They} loses tonight, then retires.',win:'b'}],
  after:(a,s,n)=>{const A=aW(a.a);if(!A||A.retd)return;arcRetire(A,n,a.choice==='champ'?`${A.name} retires as champion. A legend walks away on top.`:`${A.name} gave it everything, and retires.`)},txt:{}}],
 passtitle:[{id:'worthy',head:'Holder of more world titles than {A:they} can count, {A} can\'t find peace until {B} finally gives {A:them} a fight worth having',txt:{}}],
 invasion:[{id:'brigade',head:'{A} leads a tribal brigade to destroy everything the other show holds dear and become the one true wrestling show',
  choice:[{k:'knife',n:'🔪 Stick the knife in',d:'Fans walk over from the other show.',fx:(a,s,n)=>{const x=20000;if(S.fans.ai!=null){const t=Math.min(x,Math.max(0,S.fans.ai-50000));S.fans.ai-=t;S.fans.p+=t;n.push(`🔪 ${aW(a.a).name} sticks the knife in: ${fmtFans(t)} fans walk over from ${S.rival||'the other show'}.`)}}},
   {k:'peace',n:'🤝 Find common ground',d:'The power of friendship. Your locker room is happier for it.',fx:(a,s,n)=>{ownList('p').forEach(w=>mor(w,4));S.fans.p+=8000;n.push(`🤝 ${aW(a.a).name} finds common ground with the other show. The locker room loves it (+8K fans).`)}}],txt:{}}]});
(ARC_STORY.shoot=ARC_STORY.shoot||[]).push({id:'fourth',head:'With {A:their} contract running out and nothing left to lose, {A} buries the promotion, the booker, and you, the disgusting pig playing vibecoded wrestling simulators on your phone',need:A=>(A.con||99)<=10,
 after:(a,s,n)=>{if(a.bomb)return;const A=aW(a.a);const t=Object.values(S.titles||{}).find(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length&&!t.holders.includes(A.id));if(t&&typeof tpContender==='function'){tpContender(t.id,A.id,null,n);n.push(`🎙️ It got enormously over: ${A.name} is now the number one contender for the ${t.n} title.`)}},txt:{}});
/* ---- v435: roads that follow the story. A storyline whose arc's stops don't tell its story gets its own stops (and payoff);
   the rest get stop names that match. The reward is always the arc's. ---- */
{const vig=(s,a)=>s.kind==='promo'&&s.type==='vignette'&&s.a===a.a;vig.vig=1;const pVig=a=>[{kind:'promo',type:'vignette',a:a.a}];
 const pro=(s,a)=>s.kind==='promo'&&s.ids.includes(a.a);const tog=(s,a)=>sTog(s,a.a,a.b);const pTog=(t,bFirst)=>a=>[{kind:'promo',type:t,a:bFirst?a.b:a.a,b:bFirst?a.a:a.b}];
 const hard=s=>!!(STIPS[s.stip]&&STIPS[s.stip].g==='hard');const pTag=a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2}];
 const withB=(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&s.ids.includes(a.b);
 const SL=(k,id)=>(ARC_STORY[k]||[]).find(x=>x.id===id)||{};
 const road=(k,id,r)=>{const x=SL(k,id);if(x.id)x.road=r};
 road('trial','mountain',{d:"Lose to the best, climb the mountain to be judged, then come back and win.",stops:[
   {n:'Humbled',b:'A 3★+ loss to someone 15+ more popular',min:3,s:(s,a)=>{if(!sLost(s,a.a))return false;const f=s.win.find(id=>aW(id)&&aW(id).pop>=aW(a.a).pop+15);if(!f)return false;a.foe=f;return true},
    p:a=>{const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.pop>=A.pop+15,win:1}]}},
   {n:'The climb',b:'A Backstage Vignette: the climb up the mountain',s:vig,p:pVig},
   {n:'The wise old man',b:'A Backstage Vignette: the wise old man\'s test',s:vig,p:pVig}],
  payoff:'The return: a singles win over someone 15+ more popular',pay:(s,a)=>sSingles(s)&&sWon(s,a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>=aW(a.a).pop+15),
  pplan:a=>{const A=aW(a.a);const l=[];if(a.foe&&aW(a.foe)&&aW(a.foe).pop>=A.pop+15)l.push({kind:'match',type:'singles',vs:[a.a,a.foe],win:0});l.push({kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.pop>=A.pop+15,win:0});return l}});
 road('heelturn','watch',{d:"Show off the watch, let it come between {A:them} and {B}, then turn on {B:them}.",stops:[
   {n:'The new watch',b:'A Backstage Vignette: {A:they} shows off the watch',s:vig,p:pVig},
   {n:'Checking the time',b:'On the same side as {B} (a match, or a promo together)',s:(s,a)=>sSame(s,a.a,a.b)||tog(s,a),p:pTag},
   {n:'Watch over friendship',b:'A promo with {B}, who calls out the watch',s:tog,p:pTog('callout',1)}]});
 road('mentor','bastard',{d:"Face the truth with {B}, fight it out, then settle it.",stops:[
   {n:'The secret',b:'A promo with {B}: the truth comes out',s:tog,p:pTog('interview')},
   {n:'Bad blood',b:'In a match with {B} (either side)',s:withB,p:a=>[{kind:'match',type:'singles',vs:[a.a,a.b]}]},
   {n:'Blood is thicker',b:'In a match with {B} (either side)',s:withB,p:pTag}]});
 road('mentor','fraud',{d:"Team with {A:their} hero, see through {B:them}, then expose {B:them}.",stops:[
   {n:'Hero worship',b:'A tag match alongside {B}',s:(s,a)=>sSame(s,a.a,a.b),p:pTag},
   {n:'Cracks in the legend',b:'A promo with {B}',s:tog,p:pTog('interview')},
   {n:'The truth',b:'In a match with {B} (either side)',s:withB,p:pTag}],
  payoff:'A singles match against {B}: expose {B:them}',pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),pplan:a=>[{kind:'match',type:'singles',vs:[a.a,a.b]}]});
 road('mentor','violence',{d:"Learn violence from {B} in the rough stuff, then use it on someone bigger.",stops:[
   {n:'The lessons',b:'A tag match alongside {B}',s:(s,a)=>sSame(s,a.a,a.b),p:pTag},
   {n:'First blood',b:'A hardcore stipulation match (Street Fight, No DQ, Tables…)',s:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&hard(s),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:'street',oppF:w=>w.id!==a.b}]},
   {n:'Unsettling',b:'Another hardcore stipulation match',s:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&hard(s),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:'street',oppF:w=>w.id!==a.b}]}],
  payoff:'Beat someone more popular in a hardcore match',pay:(s,a)=>sWon(s,a.a)&&hard(s)&&sOpps(s,a.a).some(id=>id!==a.b&&aW(id)&&aW(id).pop>aW(a.a).pop),
  pplan:a=>{const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,stip:'street',win:0,oppF:w=>w.id!==a.b&&w.pop>A.pop}]}});
 const home={d:"{B} makes the threat, {A:they} lights the match, then it's settled in the ring.",stops:[
   {n:'The threat',b:'A promo with {B}, who threatens the baby',s:tog,p:pTog('callout',1)},
   {n:'The fire',b:'A Backstage Vignette: {A:they} lights the match',s:vig,p:pVig}]};
 road('stakes','home',home);road('retire','home',home);
 road('stakes','crimes',{d:"Win dirty week after week until {B} agrees to stop {A:them}.",stops:[
   {n:'Crime spree',b:'A win by heel shenanigans or a run-in',s:(s,a)=>sWon(s,a.a)&&(s.fin==='cheat'||s.ri),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,win:0,fin:'cheat',oppF:w=>w.id!==a.b}]},
   {n:'Still at large',b:'Another win by heel shenanigans or a run-in',s:(s,a)=>sWon(s,a.a)&&(s.fin==='cheat'||s.ri),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,win:0,fin:'cheat',oppF:w=>w.id!==a.b}]},
   {n:'Someone steps up',b:'A promo with {B}, who agrees to the match',s:tog,p:pTog('contract',1)}]});
 SL('stakes','crimes').need=A=>A.al==='h';
 road('stakes','dog',{tell:['The dinner','Unforgivable']});road('stakes','custody',{tell:['The bombshell','Fit to be a father']});
 road('breakup','toxic',{d:"Lose together, look elsewhere, then end it.",stops:[
   {n:'It\'s not working',b:'A tag loss with {B}',s:(s,a)=>sSame(s,a.a,a.b)&&sLost(s,a.a),p:a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:1}]},
   {n:'Wandering eyes',b:'A Backstage Vignette: someone new catches {A:their} eye',s:vig,p:pVig},
   {n:'The last straw',b:'A tag loss with {B}',s:(s,a)=>sSame(s,a.a,a.b)&&sLost(s,a.a),p:a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:1}]}]});
 road('breakup','jealous',{tell:['Second fiddle','Resentment','Boiling over']});
 road('redemption','shoot',{d:"Face the trial, do the rehab, then win {A:their} way back.",stops:[
   {n:'The trial',b:'A promo: {A:they} faces the music',s:pro,p:a=>[{kind:'promo',type:'interview',a:a.a}]},
   {n:'Rehab',b:'A Backstage Vignette: rehab',s:vig,p:pVig},
   {n:'Back in the ring',b:'A win',s:(s,a)=>sWon(s,a.a),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,win:0}]}]});
 road('redemption','tape',{d:"Watch the tape until it breaks {A:them}, then win {A:their} way back.",stops:[
   {n:'The tape',b:'A Backstage Vignette: watching it again',s:vig,p:pVig},
   {n:'The hair goes',b:'A Backstage Vignette: going mad',s:vig,p:pVig},
   {n:'Figured it out',b:'A win',s:(s,a)=>sWon(s,a.a),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,win:0}]}]});
 road('tap','hell',{d:"Go down into hell to learn the hold, come back winning, then make {B} tap.",stops:[
   {n:'The descent',b:'A Backstage Vignette: down into hell',s:vig,p:pVig},
   {n:'The deepest layer',b:'A Backstage Vignette: learning the hold',s:vig,p:pVig},
   {n:'Back from hell',b:'A win over someone new',s:(s,a)=>ARCS.tap.step(s,a),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>w.id!==a.b,win:0}]}]});
 road('team','twins',{d:"The reveal, then tag matches together until they click, then a tag win.",stops:[
   {n:'The reveal',b:'A promo with {B}: separated at birth',s:tog,p:pTog('interview')},
   {n:'Getting to know each other',b:'A tag match together at 2¾★+',min:2.75,s:(s,a)=>sSame(s,a.a,a.b)&&s.sides.every(x=>x.length===2),p:pTag},
   {n:'In sync',b:'A tag match together at 2¾★+',min:2.75,s:(s,a)=>sSame(s,a.a,a.b)&&s.sides.every(x=>x.length===2),p:pTag}]});
 road('comeback','dirk',{d:"Rehab and grief off TV, a match to show {A:they}'s back, then a PPV win.",stops:[
   {n:'Rehab and grief',b:'A Backstage Vignette: the stages of grief',s:vig,p:pVig},
   {n:'Powering through',b:'A 3★+ match',min:3,s:(s,a)=>s.kind==='match'&&s.ids.includes(a.a),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1}]}]});
 road('hardcore','blood',{d:"Lose bloody, chase the taste, learn from a Bloodhound, then survive a deathmatch.",stops:[
   {n:'Beaten bloody',b:'A loss in a hardcore stipulation match',s:(s,a)=>sLost(s,a.a)&&hard(s),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:'street',win:1}]},
   {n:'The taste',b:'A hardcore stipulation match',s:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&hard(s),p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:'nodq'}]},
   {n:'The legend\'s lessons',b:'A hardcore stipulation match against a Bloodhound',s:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&hard(s)&&sOpps(s,a.a).some(id=>aW(id)&&aGrpOf(aW(id)).includes('blood')),
    p:a=>[{kind:'match',type:'singles',side:[a.a],n:1,stip:'street',oppF:w=>aGrpOf(w).includes('blood')}]}]});
 road('farewell','demons',{d:"Face the past, a couple more big nights, then one final match.",stops:[
   {n:'The guilt',b:'A Backstage Vignette: facing the past',min:3,s:vig,p:pVig},
   {n:'One more big night',b:'A 3½★+ match in the main event or on a PPV',min:3.5,s:(s,a)=>ARCS.farewell.step(s,a),p:a=>ARCS.farewell.plan(a,'build')},
   {n:'At peace',b:'A 3½★+ match in the main event or on a PPV',min:3.5,s:(s,a)=>ARCS.farewell.step(s,a),p:a=>ARCS.farewell.plan(a,'build')}]});
 [['dream','catering',['The promise','The catering ban']],['faceturn','love',['Stolen glances','Torn','Love wins']],['school','manifest',['It happens','Losing control','Getting a grip']],
  ['betrayal','jealous',['Biggest fan','Second fiddle','Jealousy wins']],['reunion','toxic',['Sparks','Back together']],['gauntlet','father',['The first clue','Getting closer','The last door']],
  ['gauntlet','finish',['Long odds','Longer odds','Impossible odds']],['under','finish',['Down','Down again','Still standing']],['rebrand','shadow',['Into the dark','Stranger','Stranger still']],
  ['rebrand','dream',['Falling asleep','Deeper','Lucid']],['rebrand','box',['The box arrives','Something moves','It opens soon']],['transform','bulk',['Bulking','Bigger','Bigger still','Unrecognizable']],
  ['voice','stutter',['First words','Finding a rhythm','Speaking up']],['copycat','copy',['The outfit','The catchphrases','The moves']],['streak','pinfall',['Never again','Still standing','Untouchable','Unpinnable']],
  ['torch','movie',['Casting call','Rehearsals','The handoff']],['hometown','proveit',['Making moves','Calling home','Booking the flight']],['join','love',['Crossing paths','Falling','Welcome to the family']]]
  .forEach(([k,id,t])=>{const x=SL(k,id);if(x.id&&!x.road)x.road={tell:t}})}
/* ---- v436: Josh's fourth round. Five new arcs bring their own roads; five storylines join older arcs with roads that tell them ---- */
{const vig=(s,a)=>s.kind==='promo'&&s.type==='vignette'&&s.a===a.a;vig.vig=1;const pVig=a=>[{kind:'promo',type:'vignette',a:a.a}];
 const tog=(s,a)=>sTog(s,a.a,a.b);const pTog=(t,bFirst)=>a=>[{kind:'promo',type:t,a:bFirst?a.b:a.a,b:bFirst?a.a:a.b}];
 const hard=s=>!!(STIPS[s.stip]&&STIPS[s.stip].g==='hard');const pTag=a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2}];
 const inFac=A=>aTeams(A.id).some(t=>(t.type==='faction'||t.type==='trios')&&t.m.some(id=>id!==A.id&&aMine(id)));
 const mates=a=>{const s=new Set();aTeams(a.a).filter(t=>t.type==='faction'||t.type==='trios').forEach(t=>t.m.forEach(id=>{if(id!==a.a&&aMine(id))s.add(id)}));return [...s]};
 Object.assign(ARC_STORY,{
  number:[{id:'move',head:'{B} has {A}\'s number, and beats {A:them} again and again, until {A} comes up with a new move too dangerous for anyone else to try, one that could maybe, just maybe, get the win at last',txt:{}}],
  wedding:[{id:'married',head:'{B} and {C}\'s wrestling wedding goes very wrong when {A} reveals {A:they}\'s been married to both of them all along',romance:1,txt:{}}],
  faith:[{id:'religion',head:'{A} becomes deeply religious, much to the discomfort of the rest of {F}, until the faction must decide: convert, or kick {A:them} out',txt:{}}],
  haircut:[{id:'haircut',head:'{A} changes {A:their} hair and everyone is convinced {A:they}\'s an entirely new member of the roster, except {B}, who goes mad trying to get everyone to admit it\'s just {A} with a haircut',txt:{}}],
  goodwill:[{id:'souffle',head:'{A} suddenly starts giving presents to children in the crowd, hugging {A:their} opponents lovingly and baking apology soufflés for everyone {A:they}\'s wronged. Many are getting on board, but {B} is still suspicious something is amiss',txt:{}}]});
 const add=(k,x)=>(ARC_STORY[k]=ARC_STORY[k]||[]).push(x);
 add('team',{id:'blood',head:'In the middle of a blood-soaked brawl, {A} and {B} look at each other in awe, realize they have more in common than they ever thought, and form a tag team',
  road:{d:'Beat each other bloody, see each other for the first time, then fight side by side.',stops:[
   {n:'The brawl',b:'A hardcore stipulation match against {B} (Street Fight, No DQ, Tables…)',s:(s,a)=>sVs(s,a.a,a.b)&&hard(s),p:a=>[{kind:'match',type:'singles',vs:[a.a,a.b],stip:'street'}]},
   {n:'The realization',b:'A promo with {B}: more in common than they thought',s:tog,p:pTog('interview')},
   {n:'Side by side',b:'A tag match together at 2¾★+',min:2.75,s:(s,a)=>sSame(s,a.a,a.b)&&s.sides.every(x=>x.length===2),p:pTag}]},
  after:(a,s,n)=>{const k=key(a.a,a.b);if(S.heat&&S.heat[k]>0&&typeof endFeud==='function'){endFeud(k,'Became a tag team','🤝');n.push(`🩸🤝 The feud between ${aW(a.a).name} and ${aW(a.b).name} is over. They're partners now.`)}},txt:{}});
 add('betrayal',{id:'policy',head:'{A} secretly takes out a life insurance policy on {A:their} tag partner {B}, then starts sabotaging their matches to collect',
  road:{d:'Sign the policy, cost {B} match after match, then finish the job.',stops:[
   {n:'The policy',b:'A Backstage Vignette: {A:they} signs the papers',s:vig,p:pVig},
   {n:'Sabotage',b:'A tag loss with {B}',s:(s,a)=>sSame(s,a.a,a.b)&&sLost(s,a.a),p:a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:1}]},
   {n:'Accidents happen',b:'Another tag loss with {B}',s:(s,a)=>sSame(s,a.a,a.b)&&sLost(s,a.a),p:a=>[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:1}]}],bstep:0},
  after:(a,s,n)=>{const B=aW(a.b);if(!B||B.own!=='p'||isChampW(B))return;B.inj=Math.max(B.inj||0,2);B.angle=AW();n.push(`🚑 ${B.name} is stretchered out and off TV for two weeks. ${aW(a.a).name} files the claim.`)},txt:{}});
 add('redemption',{id:'balloon',head:'After a big loss, {A} sinks into a deep depression, starts carrying around a single balloon and dyes {A:their} hair red',
  road:{d:'Sink low with the balloon and the red hair, talk it through, then win {A:their} way back.',stops:[
   {n:'The balloon',b:'A Backstage Vignette: {A:they} carries a single balloon everywhere',s:vig,p:pVig},
   {n:'Red',b:'A Backstage Vignette: the red hair',s:vig,p:pVig},
   {n:'Talking about it',b:'A Sit-Down Interview: {A:they} opens up',s:(s,a)=>s.kind==='promo'&&s.type==='interview'&&s.ids.includes(a.a),p:a=>[{kind:'promo',type:'interview',a:a.a}]}],
   payoff:'A win in the main event: {A:they} lets the balloon go'},txt:{}});
 add('voice',{id:'taxidermy',head:'{A} gets deeply into taxidermy and starts cutting ominous promos threatening to stuff {A:their} opponents, and the rest of {A:their} faction is getting uncomfortable',need:A=>inFac(A),
  road:{d:'Show off the workshop, threaten the roster, unsettle {A:their} own faction, then threaten someone bigger.',stops:[
   {n:'The workshop',b:'A Backstage Vignette: {A:they} shows off {A:their} latest specimen',s:vig,p:pVig},
   {n:'Fresh specimens',b:'A promo with someone outside {A:their} faction: a threat to stuff them',s:(s,a)=>s.kind==='promo'&&!!s.b&&s.ids.includes(a.a)&&!s.ids.some(id=>mates(a).includes(id)),
    p:a=>{const m=mates(a);const o=aBest(aRoster([a.a]).filter(w=>!m.includes(w.id)),w=>w.pop);return o?[{kind:'promo',type:'callout',a:a.a,b:o.id}]:null}},
   {n:'Uncomfortable',b:'A Faction Rally with someone in {A:their} faction, who\'d rather be anywhere else',s:(s,a)=>s.kind==='promo'&&s.type==='rally'&&mates(a).some(id=>sTog(s,a.a,id)),
    p:a=>{const m=mates(a).filter(id=>!aW(id).inj);return m.length?[{kind:'promo',type:'rally',a:a.a,b:m[0]}]:null}}],
   payoff:'A promo with someone 10+ more popular: the ultimate trophy'},txt:{}});
 add('faceturn',{id:'ghosts',head:'Over one month, {A} is visited by the ghosts of {A:their} past, present and future, and slowly realizes the error of {A:their} ways',
  road:{d:'Three ghosts, three weeks, then {A:they} wakes up changed and stands with {B}.',bstep:0,stops:[
   {n:'The ghost of the past',b:'A Backstage Vignette: the Ghost of Wrestling Past',s:vig,p:pVig},
   {n:'The ghost of the present',b:'A Backstage Vignette: the Ghost of Wrestling Present',s:vig,p:pVig},
   {n:'The ghost of the future',b:'A Backstage Vignette: the Ghost of Wrestling Yet to Come',s:vig,p:pVig}]},txt:{}})}
window.ARC_STORY=ARC_STORY;
/* the storyline a run would get: dealt by the game, the arc and the wrestler, so the offer and the run agree. vk: only with that variant */
function arcStoryPick(k,id,v,b){const A=aW(id),B=b?aW(b):null;const l=(ARC_STORY[k]||[]).filter(x=>(x.vk==null||x.vk===(v!=null?v:aVarOf(k)))&&(!x.need||(()=>{try{return x.need(A,B)}catch(e){return false}})()));if(!l.length)return null;
 const r=seeded((S.seed||'')+'|arcst|'+k+'|'+id+'|'+S.season)();return l[Math.floor(r*l.length)].id}
function arcStoryOf(a){return a&&a.sl?(ARC_STORY[a.k]||[]).find(x=>x.id===a.sl)||null:null}
function arcHead(a,o){const st=o&&o.id?o:arcStoryOf(a);if(!st)return '';const nm=id=>id&&aW(id)?aW(id).name:'';
 return aPrFill(st.head,a).replace(/\{A\}/g,nm(a.a)).replace(/\{B\}/g,nm(a.b)||'their rival').replace(/\{C\}/g,nm(a.c)).replace(/\{F2\}/g,a.fn2||'the other faction').replace(/\{F\}/g,a.fn||'the other faction')}
window.arcStoryPick=arcStoryPick;
function trOpenA(w){return typeof trOpen==='function'&&trOpen(w)}
function isChampW(w){return Object.values(S.titles||{}).some(t=>t.holders.includes(w.id))}
const ARC_LANES={mic:'🎙️ Mic',ring:'🤼 In-ring',trait:'✨ Trait or popularity',star:'🌟 Story'};

/* Prove It: while it runs, they work that crowd's wrestlers like they mean it */
if(typeof chemParts==='function'){const _cp=chemParts;chemParts=function(x,y){const p=_cp(x,y);try{if(x&&y&&S&&Array.isArray(S.arcs))S.arcs.forEach(a=>{if(a.k!=='proveit'||a.done)return;const me=a.a===x.id?x:a.a===y.id?y:null;if(!me)return;const o=me===x?y:x;if(aGrpOf(o).includes(a.g))p.push({t:`${me.name.split(' ')[0]} is proving it`,v:ARC_PROVE})})}catch(e){}return p}}
/* ---- retirement: gone from the roster for good, never back on the market ---- */
function arcRetire(w,notes,msg){if(!w)return;const was=w.own;w.retd=AW();if(typeof leave==='function')leave(w,`🪦 ${msg}`,notes||[]);else{w.own=null;news(msg)}
 Object.values(S.titles||{}).forEach(t=>{if(t.holders.includes(w.id)){t.holders=[];news(`🏆 The ${t.n} title is vacant — ${w.name} has retired.`)}});
 (S.teams||[]).forEach(t=>t.m=t.m.filter(x=>x!==w.id));S.teams=(S.teams||[]).filter(t=>t.m.length>=2);if(S.fa)delete S.fa[w.id];if(was)arcList().filter(a=>a.b===w.id||a.c===w.id).forEach(a=>a.gone=1)}
if(typeof onMarket==='function'){const _om=onMarket;onMarket=function(w){return !!w&&!w.retd&&_om(w)};window.onMarket=onMarket}
if(typeof inPool==='function'){const _ip=inPool;inPool=function(w){return !w.retd&&_ip(w)}}
/* a second crowd won through a Crossover */
if(typeof fgOf==='function'){const _fg=fgOf;fgOf=function(w){const r=_fg(w);if(!w||!w.fg2||r[0]==='und'||r.includes(w.fg2))return r;return r.slice(0,1).concat([w.fg2])};window.fgOf=fgOf}
/* a trait earned through a Schooling arc waits at the front of the options when the slot opens */
if(typeof trOptions==='function'){const _to=trOptions;trOptions=function(w,slot){const o=_to(w,slot);if(!w||!w.trQ||!TRAITS[w.trQ]||(w.tr||[]).includes(w.trQ))return o;return [w.trQ].concat(o.filter(t=>t!==w.trQ)).slice(0,3)};window.trOptions=trOptions}
if(typeof trAdd==='function'){const _ta=trAdd;trAdd=function(w,t){_ta(w,t);if(w&&w.trQ&&(w.tr||[]).includes(w.trQ))delete w.trQ}}

/* ---- what's on offer for someone: one Mic, one In-ring, one trait/popularity arc (superstars: three story arcs) ---- */
/* ---- v430: hands. Each wrestler holds three arcs dealt from who they are: their crowd, face or heel, superstar or not,
   weighted by the size of story the calendar calls for. The story doesn't have to exist first — starting an arc creates it.
   Each arc still runs once a season across the roster. A few arcs need a bigger stage. Milestones earn redeals. ---- */
const ARC_GATE={hometown:'good',dream:'good',farewell:'arena',lastchase:'arena',retire:'s2'};
const ARC_GATE_TXT={good:'Needs the Good Building',arena:'Needs the Actual Arena',s2:'Season 2 and later'};
function arcGateOk(k){const g=ARC_GATE[k];if(!g)return true;if(g==='s2')return S.season>=2;try{return typeof venOwns==='function'&&!!venOwns('p',g)}catch(e){return false}}
function arcOpenK(k){return arcGateOk(k)}
window.arcOpenK=arcOpenK;
function arcLockTxt(k){return ARC_GATE_TXT[ARC_GATE[k]]||''}
function arcBoard(){return {}}
function arcRan(k){return ((S.arcUsed||{})[S.season]||[]).includes(k)}
const arcRunningK=k=>arcList().some(a=>a.k===k&&!a.done&&aMine(a.a));
/* story size: small arcs early and right after the big shows, big ones on the road to the season's climaxes */
const ARC_SIZE={heelturn:'s',faceturn:'s',voice:'s',mentor:'s',team:'s',under:'s',trial:'s',school:'s',mouth:'s',ironman:'s',comeback:'s',reunion:'s',hometown:'s',redemption:'s',
 gauntlet:'m',betrayal:'m',breakup:'m',stakes:'m',cult:'m',cross:'m',proveit:'m',tap:'m',streak:'m',techshow:'m',shoot:'m',faction:'m',join:'m',rebrand:'m',transform:'m',flyer:'m',hardcore:'m',fightchamp:'m',champvoice:'m',torch:'m',
 groundswell:'m',breakfree:'s',number:'m',haircut:'m',faith:'m',goodwill:'m',wedding:'b',sellout:'b',absolute:'b',earnfight:'m',factionwar:'b',retire:'b',copycat:'b',dream:'b',farewell:'b',lastchase:'b',passtitle:'b',invasion:'b'};
/* the crowd an arc leans toward: three times as likely for a wrestler of that crowd */
const ARC_LEAN={techshow:'tech',tap:'tech',school:'tech',hardcore:'blood',transform:'blood',flyer:'flip',shoot:'chaos',cult:'chaos',copycat:'chaos',rebrand:'chaos',hometown:'cas',dream:'cas',under:'cas',number:'flip',haircut:'chaos',wedding:'chaos',goodwill:'cas'};
const ARC_LEAN_X=3;
function arcPhase(){const wk=S.week||1;const cl=Object.keys(PPVS).map(Number).filter(w=>/WrestleMania|All In/.test(PPVS[w]));if(!cl.length)cl.push(Math.max(...Object.keys(PPVS).map(Number)));
 const to=cl.filter(w=>w>=wk).map(w=>w-wk)[0],from=cl.filter(w=>w<wk).map(w=>wk-w).pop();let p;
 if(to!=null&&to<=6)p={s:.8,m:1.3,b:2.5,t:'the road to the big show'};else if(from!=null&&from<=3)p={s:2.5,m:1,b:.4,t:'fresh starts after the big show'};else if(wk<=8)p={s:3,m:1,b:.3,t:'the start of the season'};else p={s:1.3,m:2,b:.8,t:'the middle of the season'};
 if(S.season>=2)p=Object.assign({},p,{b:p.b*1.3,m:p.m*1.1});return p}
window.arcPhase=arcPhase;
function arcWeight(k,A){const ph=arcPhase();let w=ph[ARC_SIZE[k]||'m'];const l=ARC_LEAN[k];if(l&&aGrpOf(A).includes(l))w*=ARC_LEAN_X;if((A.arcLast||[]).includes(k))w*=.3;return w}
/* who can be cast: the people a player chooses between when starting the arc (the default is the best fit) */
const aHeat=(x,y)=>typeof heatOf==='function'?heatOf(x,y):0;
const ARC_CAST={
 heelturn:{b:{lab:'The friend {A:they} turns on',f:(A,w)=>w.al==='f',r:(A,w)=>(aMates(A.id).includes(w.id)?100:0)+aMate(A,w)*3+w.pop/10}},
 faceturn:{b:{lab:'The face {A:they} stands with',f:(A,w)=>w.al==='f',r:(A,w)=>w.pop+aMate(A,w)*2}},
 betrayal:{b:{lab:'The partner {A:they} betrays',f:(A,w)=>w.al==='h',r:(A,w)=>(aMates(A.id).includes(w.id)?100:0)+aMate(A,w)*3+w.pop/10}},
 mentor:{b:{lab:'The mentor',f:(A,w)=>w.ring>=A.ring+15,r:(A,w)=>w.ring+aMate(A,w)}},
 proveit:{b:{lab:'The star {A:they} has to beat',f:(A,w)=>{const g=aGrpOf(A)[0];return !!g&&aGrpOf(w).some(x=>aClash(g,x))},r:(A,w)=>w.pop}},
 team:{b:{lab:'{A:Their} partner',f:(A,w)=>!inTeam(A.id,w.id),r:(A,w)=>{try{return teamParts(A,w).reduce((s,x)=>s+x.v,0)*3+w.pop/10}catch(e){return w.pop/10}}}},
 faction:{b:{lab:'First recruit',f:(A,w)=>w.g===A.g&&w.al===A.al,r:(A,w)=>aMate(A,w)*3+w.pop/10},c:{lab:'Second recruit',f:(A,w)=>w.g===A.g&&w.al===A.al,r:(A,w)=>aMate(A,w)*3+w.pop/10}},
 retire:{b:{lab:'The rival whose career is on the line',f:(A,w)=>w.pop<ARC_STAR&&!isChampW(w),r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 stakes:{b:{lab:'The rival',f:(A,w)=>true,r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 tap:{b:{lab:'Who {A:they} makes tap',f:(A,w)=>w.g===A.g,r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 shoot:{b:{lab:'Who {A:they} aims it at',f:(A,w)=>true,r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 reunion:{b:{lab:'{A:Their} old partner',f:(A,w)=>!inTeam(A.id,w.id),r:(A,w)=>(Object.keys(S.tagW||{}).some(k=>k.split('|').includes(A.id)&&k.split('|').includes(w.id))?100:0)+aMate(A,w)*3+w.pop/10}},
 copycat:{b:{lab:'Who {A:they} copies',f:(A,w)=>w.pop>=A.pop+10&&w.g===A.g,r:(A,w)=>w.pop}},
 torch:{b:{lab:'Who gets the torch',f:(A,w)=>w.pop<70&&w.pop>=40&&w.g===A.g,r:(A,w)=>w.ring+w.mic/2}},
 passtitle:{b:{lab:'The successor',f:(A,w)=>w.pop<70&&w.pop>=40&&w.g===A.g,r:(A,w)=>w.ring+w.mic/2}},
 dream:{b:{lab:'The dream opponent',f:(A,w)=>w.pop>=ARC_STAR,r:(A,w)=>w.pop}},
 breakfree:{b:{lab:'The leader tormenting {A:them}',f:(A,w)=>w.al==='h'&&w.pop>=A.pop-5,r:(A,w)=>(aTeams(A.id).some(t=>t.m.includes(w.id))?100:0)+w.pop}},
 absolute:{b:{lab:'Who has to stop {A:them}',f:(A,w)=>w.g===A.g,r:(A,w)=>w.pop+aHeat(A.id,w.id)}},
 earnfight:{b:{lab:'The despised foe',f:(A,w)=>true,r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 number:{b:{lab:'Who has {A:their} number',f:(A,w)=>w.g===A.g,r:(A,w)=>aHeat(A.id,w.id)*2+w.pop+w.ring/2}},
 wedding:{b:{lab:'Half of the happy couple',f:(A,w)=>true,r:(A,w)=>aMate(A,w)*3+w.pop/10},c:{lab:'The other half',f:(A,w)=>true,r:(A,w)=>aMate(A,w)*3+w.pop/10}},
 faith:{b:{lab:'Who in the faction pushes back',f:(A,w)=>aTeams(A.id).some(t=>(t.type==='faction'||t.type==='trios')&&t.m.includes(w.id)&&t.m.filter(id=>id!==A.id&&aMine(id)).length>=2),r:(A,w)=>w.pop}},
 haircut:{b:{lab:'The rival who isn\'t fooled',f:(A,w)=>true,r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 goodwill:{b:{lab:'The rival who isn\'t buying it',f:(A,w)=>w.al==='f',r:(A,w)=>aHeat(A.id,w.id)*2+w.pop}},
 factionwar:{b:{lab:'The rival leader',f:(A,w)=>!aTeams(A.id).some(t=>(t.type==='faction'||t.type==='trios')&&t.m.includes(w.id)),r:(A,w)=>w.pop+(w.al!==A.al?20:0)}}};
window.ARC_CAST=ARC_CAST;
function arcCastList(A,k,role,ex){const R=(ARC_CAST[k]||{})[role];if(!R)return [];return aRoster([A.id].concat(ex||[])).filter(w=>!arcIn(w.id)&&R.f(A,w)&&(role!=='b'||!!arcStoryPick(k,A.id,null,w.id))).sort((x,y)=>R.r(A,y)-R.r(A,x)).slice(0,6)}
window.arcCastList=arcCastList;
/* one card: the arc as it would run for them, or null when it can't */
function arcCard(A,k){if(!arcOpenK(k)||arcRan(k)||arcRunningK(k))return null;const D=ARCS[k];let p=null;try{p=D.pick(A)}catch(e){p=null}if(!p)return null;
 const C=ARC_CAST[k];if(C){for(const r of ['b','c']){if(!C[r])continue;const l=arcCastList(A,k,r,r==='c'&&p.b?[p.b]:[]);if(!p[r]||!l.some(w=>w.id===p[r])){if(!l.length)return null;p[r]=l[0].id}}}
 if(p.b&&p.c&&p.b===p.c)return null;if(D.recast)try{p=D.recast(A,p)||p}catch(e){}
 /* every arc runs with a storyline that fits them (and their partner or rival); none fits, no arc */
 if(!arcStoryPick(k,A.id,null,p.b))return null;return Object.assign({k,a:A.id},p)}
function arcLaneOk(A,k){const D=ARCS[k];return aStar(A)?(D.lane==='star'||D.star):D.lane!=='star'}
/* deal a hand: one Mic, one In-ring, one trait/popularity (superstars: three story arcs); an empty lane borrows from the others */
function arcDeal(A,n){S.arcHand=S.arcHand||{};A.arcDeal=(A.arcDeal||0)+1;const r=seeded((S.seed||'')+'|deal|'+A.id+'|'+A.arcDeal+'|'+S.season);const out=[];
 const lanes=aStar(A)?[null,null,null]:['mic','ring','trait'];while(lanes.length<(n||3))lanes.push(null);
 const draw=lane=>{const l=Object.keys(ARCS).filter(k=>!out.includes(k)&&arcLaneOk(A,k)&&(!lane||ARCS[k].lane===lane||(lane==='mic'&&ARCS[k].star&&ARCS[k].lane==='mic'))).map(k=>({k,c:arcCard(A,k)})).filter(x=>x.c);
  if(!l.length)return null;const ws=l.map(x=>arcWeight(x.k,A));const tot=ws.reduce((a,b)=>a+b,0);let x=r()*tot;for(let i=0;i<l.length;i++){x-=ws[i];if(x<=0)return l[i].k}return l[l.length-1].k};
 lanes.forEach(l=>{const k=draw(l)||draw(null);if(k)out.push(k)});
 S.arcHand[A.id]={k:out,at:AW(),ppv:S.arcPPV||0,al:A.al,star:aStar(A)?1:0,end:A.arcEnd||0};return out}
/* the hand they hold now: redealt after a PPV, after one of their arcs ends, or when they turn or become a superstar */
function arcHand(id){const A=aW(id);if(!A||A.own!=='p')return [];S.arcHand=S.arcHand||{};let h=S.arcHand[id];
 if(!h||h.ppv!==(S.arcPPV||0)||h.al!==A.al||h.star!==(aStar(A)?1:0)||(A.arcEnd||0)>h.end)arcDeal(A,h&&h.extra?4:3),h=S.arcHand[id];
 let cards=h.k.map(k=>arcCard(A,k)).filter(Boolean);if(!cards.length&&h.k.length){arcDeal(A);h=S.arcHand[id];cards=h.k.map(k=>arcCard(A,k)).filter(Boolean)}return cards}
function arcOffer(id){return arcHand(id)}
window.arcOffer=arcOffer;
/* milestones earn redeals: the first great payoff, a blood feud, a new champion, a new team or faction, and a turn paying off — once each a season */
const ARC_TOK_MS={great:'your first great payoff of the season',f75:'a blood feud',newch:'a new champion',team:'a new team or faction',turn:'a turn paying off'};
function arcTokTick(notes){S.arcTokM=S.arcTokM||{};const got=S.arcTokM[S.season]=S.arcTokM[S.season]||[];const give=k=>{if(got.includes(k))return;got.push(k);S.arcTok=(S.arcTok||0)+1;const t=`🔀 Reshuffle earned for ${ARC_TOK_MS[k]}: use it to reshuffle any wrestler's arcs.`;news(t);if(notes)notes.push(t)};
 const L=(S.arcLog||[]).filter(x=>x.s===S.season);if(L.some(x=>x.q==='great'))give('great');if(L.some(x=>x.k==='heelturn'||x.k==='faceturn'))give('turn');
 if(aHeatMax()>=75)give('f75');if(S.arcM&&S.arcM.newch&&S.arcM.newch>=(S.arcS0||0))give('newch');
 const nt=(S.teams||[]).filter(t=>t.m.filter(aMine).length>=2).length;if(S.arcTeamN!=null&&nt>S.arcTeamN)give('team');S.arcTeamN=nt}
const aHeatMax=()=>{let m=0;for(const k in (S.heat||{})){if(S.heat[k]<=m)continue;if(k.split('|').every(aMine))m=S.heat[k]}return m};
window.arcRedeal=function(id){if(typeof mpLocked==='function'&&mpLocked())return;if(!(S.arcTok>0))return toast('No reshuffles left. Earn them with milestones.');const A=aW(id);if(!A)return;S.arcTok--;arcDeal(A);save();render();arcOpen(id)};
/* stage gates opening get announced */
function arcUnlockTick(notes){S.arcSeen=S.arcSeen||[];const now=Object.keys(ARC_GATE).filter(arcOpenK);const nw=now.filter(k=>!S.arcSeen.includes(k));
 if(nw.length&&S.arcSeen.length+Object.keys(ARC_GATE).length>0&&S.arcSeenInit){const t=`📖 Bigger stories open up: ${nw.map(k=>ARCS[k].i+' '+ARCS[k].n).join(', ')} can now be assigned.`;news(t);if(notes)notes.push(t)}S.arcSeen=now;S.arcSeenInit=1}
window.arcUnlockTick=arcUnlockTick;
function arcCanStart(id){const A=aW(id);if(!A||A.own!=='p'||A.retd)return 'Not on your roster';if(S.phase!=='season')return 'Arcs start once the season is under way';if(arcOf(id))return `${A.name} is already in an arc`;
 if(arcList().filter(a=>aMine(a.a)).length>=ARC_SLOTS)return `You have ${ARC_SLOTS} arcs running. Finish one first`;return ''}
window.arcCanStart=arcCanStart;
function arcWords(o,txt){const nm=id=>id&&aW(id)?aW(id).name:'';const t=(o.t&&TRAITS[o.t])?TRAITS[o.t].n:'';const st=o.stip&&STIPS[o.stip]?STIPS[o.stip].n:'';const g=o.g&&typeof FG_N!=='undefined'?FG_N[o.g]:o.g||'';
 return aPrFill(txt||'',o).replace(/\{A\}/g,nm(o.a)||'they').replace(/\{S\} match/g,st&&/match$/i.test(st)?st:st+' match').replace(/\{B\}/g,nm(o.b)).replace(/\{C\}/g,nm(o.c)).replace(/\{S\}/g,st).replace(/\{G\}/g,g).replace(/\{F2\}/g,o.fn2||'the other faction').replace(/\{F\}/g,o.fn||'the faction').replace(/\{T\}/g,t)}
function arcGain(D,A,a){if(aStar(A)&&D.lane!=='star')return 'A bigger payoff, popularity and heat'+(D.k==='heelturn'||D.k==='faceturn'||D.k==='betrayal'?' (and the turn)':'');return arcWords(a||{},D.gets||'')}
function arcStart(id,i,cast){if(typeof mpLocked==='function'&&mpLocked())return;const why=arcCanStart(id);if(why)return toast(why);const l=arcOffer(id);let o=typeof i==='number'?l[i]:l.find(x=>x.k===i);if(!o)return;const D=aDK(o.k);
 if(cast){const A0=aW(id);o=Object.assign({},o);['b','c'].forEach(r=>{if(cast[r]&&arcCastList(A0,o.k,r,r==='c'?[cast.b||o.b]:[]).some(w=>w.id===cast[r]))o[r]=cast[r]});if(o.b&&o.c&&o.b===o.c)return toast('Pick two different people.');if(D.recast)try{o=D.recast(A0,o)||o}catch(e){}}
 const c=aCost(o.k,id,o);if(S.money.p<c)return toast(`This arc costs ${money(c)} up front.`);S.money.p-=c;const A=aW(id);A.arcN=(A.arcN||0)+1;
 const sl0=arcStoryPick(o.k,id,aVarOf(o.k),o.b);const SL0=sl0&&(ARC_STORY[o.k]||[]).find(x=>x.id===sl0);const DR=SL0&&SL0.road?aDK(o.k,null,sl0):D;const need=DR.need2?DR.need2({a:id,g:o.g}):DR.need;const a=Object.assign({rd:SL0&&SL0.road?1:0,id:'a'+Date.now().toString(36)+Math.floor(Math.random()*999),a:id,start:AW(),end:AW()+need+ARC_SLACK,have:0,need,st:[],stage:'build',star:aStar(A)?1:0,cost:c,v:aVarOf(o.k),al0:A.al,fit:arcFitOf(A)===o.k?1:0},o);
 a.sl=arcStoryPick(o.k,id,a.v,a.b);if(!a.sl){S.money.p+=c;A.arcN--;return toast('No storyline fits that pairing.')}try{if(D.setup)D.setup(a,A)}catch(e){console.warn('arc setup',e)}arcList().push(a);if(S.arcHand)delete S.arcHand[id];S.arcUsed=S.arcUsed||{};(S.arcUsed[S.season]=S.arcUsed[S.season]||[]).push(o.k);news(`📖 ${arcHead(a)||arcLine(a,'start')} (${D.n})`);save();render();arcOpen(id)}
window.arcStart=arcStart;
function arcDrop(id){const a=arcOf(id);if(!a)return;if(!confirm(`Drop ${aW(id).name}'s ${aD(a).n} arc? ${aPr(aW(id),"They'll")} be let down.`))return;arcFail(a,[]);S.arcs=arcList().filter(x=>x!==a);save();render();arcOpen(id)}
window.arcDrop=arcDrop;

/* ---- on the night: the payoff bonus before the rating is set, then progress after it airs ---- */
function arcBonus(a,s){const q=a.st.length?a.st.reduce((x,y)=>x+y,0)/a.st.length:3;let b=ARC_PAY0+clamp((q-3)*ARC_PAYQ,0,ARC_PAYMAX);if(s.ppv)b*=ARC_PAY_PPV;if(a.star||aD(a).lane==='star')b*=ARC_PAY_STORY;if(a.fit)b*=ARC_FIT;return Math.round(b*100)/100}
function arcPre(s){const out={seg:s,st:0,pay:[]};arcList().forEach(a=>{if(a.stage!=='pay'||a.done||AW()<(a.payFrom||0)||![a.a,a.b,a.c].some(id=>id&&s.ids.includes(id))||!aMine(a.a))return;const D=aD(a);let ok=false;try{ok=D.pay(s,a)}catch(e){}
  if(ok&&!out.pay.length){out.pay.push(a);out.st+=arcBonus(a,s)}});
 /* the crowd is invested in a story that's building: a little more each step, for a segment with the people in it */
 if(!out.pay.length){let bb=0;arcList().forEach(a=>{if(a.done||a.stage!=='build'||!a.have||!aMine(a.a)||!s.ids.includes(a.a)||a.b&&aD(a).bstep!==0&&!s.ids.includes(a.b))return;bb=Math.max(bb,ARC_BUILD*a.have*(1+aRiseF(aW(a.a))))});out.st+=bb}
 s.arcPay=out.pay;return out}
window.arcMatchPre=function(m,mctx){try{const r=arcPre(aSegMatch(m,mctx&&mctx.pos));const h=arcStoryH(r.seg);if(h)ARC_H.set(m,h);return r}catch(e){console.warn('arcs',e);return null}};
/* a running arc is a story the casuals follow, like a feud: its heat grows with each step, and the payoff is a big one */
function arcStoryH(s){let h=0;if(s.arcPay&&s.arcPay.length)return ARC_STORYP;arcList().forEach(a=>{if(a.done||!a.have||!aMine(a.a)||!s.ids.includes(a.a))return;h=Math.max(h,ARC_STORYH[Math.min(a.have,ARC_STORYH.length)-1])});return h}
if(typeof fbSeg==='function'){const _fs=fbSeg;fbSeg=function(m,st,me){const r=_fs.apply(this,arguments);try{const h=ARC_H.get(m);if(h&&r){if(ARC_ONCE)r.arcH=h;else r.h=Math.max(r.h||0,h);r.arc=h>=ARC_STORYP?2:1}}catch(e){}return r}}
if(typeof fbPromo==='function'){const _fp=fbPromo;fbPromo=function(p){const r=_fp.apply(this,arguments);try{const h=ARC_H.get(p);if(h&&r)r.arc=h>=ARC_STORYP?2:1}catch(e){}return r}}
/* casuals follow your wrestlers' stories on top of the feuds: each arc segment on the card hooks a few more (a payoff counts double) */
if(typeof fbCalc==='function'){const _fc=fbCalc;fbCalc=function(b,segs,show,o){const r=_fc.apply(this,arguments);try{const n=(segs||[]).reduce((x,sg)=>x+(sg&&sg.arc||0),0);if(n&&r&&r.pct&&r.pct.cas!=null){let add=Math.min(ARC_CASCAP,n*ARC_CAS)*(show&&show.ppv?1.5:1);
   if(ARC_ONCE&&typeof FB_STORYW!=='undefined'){const pull=hs=>{let v=0;hs.sort((x,y)=>y-x).slice(0,FB_STORYW.length).forEach((h,i)=>v+=Math.max(0,h-FB_STORY0)/FB_STORYH*FB_STORYW[i]);return Math.min(FB_STORYCAP,v)*(show&&show.ppv?1.5:1)};
    const ms=segs.filter(sg=>sg&&sg.k==='match');const viaHeat=pull(ms.map(sg=>Math.max(sg.h||0,sg.arcH||0)))-pull(ms.map(sg=>sg.h||0));add=Math.max(add,viaHeat)}r.pct.cas+=add;r.arcStory=add;if(add>=.75&&r.why)r.why.cas='Hooked on the stories — they want to see where they go'}}catch(e){}return r}}
window.arcPromoPre=function(p){try{const r=arcPre(aSegPromo(p));const h=arcStoryH(r.seg);if(h)ARC_H.set(p,h);return r}catch(e){console.warn('arcs',e);return null}};
/* returns true when a payoff landed */
window.arcPost=function(ap,stars,notes){if(!ap||!ap.seg)return false;const s=ap.seg;let landed=false;
 if(!S.arcSeenW||S.arcSeenW.w!==AW())S.arcSeenW={w:AW(),ids:[]};s.ids.forEach(id=>{if(!S.arcSeenW.ids.includes(id))S.arcSeenW.ids.push(id)});
 arcList().forEach(a=>{if(a.k==='groundswell'&&s.type==='squash'&&sLost(s,a.a))a.sqL=AW()});
 arcList().slice().forEach(a=>{if(a.done||!aMine(a.a))return;const D=aD(a);
  if((s.arcPay||[]).includes(a)){a.st.push(stars);landed=true;arcFinish(a,s,stars,notes);return}
  if(a.stage!=='build'||a.lastStep===AW()||!s.ids.includes(a.a)&&!(a.b&&s.ids.includes(a.b)))return;
  const mn=aMinAt(D,a.have)-aEase(aW(a.a));let hit=false;try{hit=D.step(s,a)&&stars>=mn}catch(e){}
  if(hit){a.have++;a.st.push(stars);a.lastStep=AW();if(D.heatStep&&a.b)try{bumpHeat(a.a,a.b,D.heatStep,[],`${D.n}: the story builds`)}catch(e){}const lab=D.tell&&D.tell[Math.min(a.have-1,D.tell.length-1)];
   notes.push(`📖 ${aW(a.a).name} · ${D.n}: ${lab?lab+' — ':''}step ${a.have} of ${a.need}.${a.have>=a.need&&(!D.ok||D.ok(a))?' The payoff is next.':''}`);
   if(a.have>=a.need&&(!D.ok||D.ok(a))){a.stage='pay';a.payFrom=AW()+1}}});
 S.arcs=arcList().filter(a=>!a.done);return landed};
function arcFinish(a,s,stars,notes){const D=aD(a);const A=aW(a.a);const q=a.st.reduce((x,y)=>x+y,0)/a.st.length;a.q=q>=ARC_GREAT-aEase(A)?'great':'good';a.done=1;
 try{if(D.also)D.also(a,s,notes)}catch(e){console.warn('arc payoff',e)}
 try{const SL=arcStoryOf(a);if(SL&&SL.choice){if(!a.choice){const wa=s.win.includes(a.a);const o=SL.choice.find(o=>o.win&&(o.win==='a')===wa)||SL.choice[Math.floor(seeded((S.seed||'')+'|ch|'+a.id)()*SL.choice.length)];a.choice=o.k}const o=SL.choice.find(o=>o.k===a.choice);if(o&&o.fx)o.fx(a,s,notes)}if(SL&&SL.after)SL.after(a,s,notes)}catch(e){console.warn('arc storyline',e)}
 const RW=ARC_BUILDS_B[a.k]&&a.b&&aW(a.b)?aW(a.b):A;const rf=RW&&RW.own==='p'&&!(RW===A&&(a.star||D.lane==='star'))?aRiseF(RW):0;const rp0=RW?(RW.pop||0):0;
 let r={};try{r=D.win(a,A,a.q)||{}}catch(e){console.warn('arc reward',e)}
 const story=a.star||D.lane==='star';const parts=[];const FX=a.fit?ARC_FIT:1;if(a.fit){S.arcFitK=S.arcFitK||{};const was=S.arcFitK[a.a];S.arcFitK[a.a]=1;notes.push(`✨ ${was?'':'Found it: '}${A.name} was made for this. ${aName(a.k,a.v)} hits harder with ${aPr(A,'them')}.`)}
 if(!story&&r.ring&&A.own){const g=trainGain(A.ring)*(a.q==='great'?ARC_G2:ARC_G1)*r.ring*FX;const v0=A.ring;addR(A,g);if(A.ring>v0)parts.push(`In-ring +${Math.round((A.ring-v0)*10)/10}`)}
 if(!story&&r.mic&&A.own){const g=trainGain(A.mic,1)*(a.q==='great'?ARC_G2:ARC_G1)*r.mic*FX;const v0=A.mic;addM(A,g);if(A.mic>v0)parts.push(`Mic +${Math.round((A.mic-v0)*10)/10}`)}
 const pop=Math.round(((r.pop||0)+(story?(a.q==='great'?2:1):0))*FX*10)/10;if(pop&&A.own){popx(A,pop);parts.push(`popularity +${pop}`)}
 if(r.bpop&&a.b&&aW(a.b)){popx(aW(a.b),r.bpop);parts.push(`${aW(a.b).name} popularity +${r.bpop}`)}
 /* v437: building someone up — the lower on the card, the bigger the lift; a superstar in the payoff rubs off; an upper-midcarder breaks through */
 if(RW&&RW.own==='p'&&rp0<ARC_STAR&&!(RW===A&&(a.star||D.lane==='star'))){const who=RW===A?'':RW.name+' ';let x=0;const lab=[];
  if(rf>0){const v=ARC_RISEPOP*rf*(a.q==='great'?1.25:1)*FX;if(v>=.1){x+=v;lab.push('on the rise')}}
  const st=s.ids.find(id=>id!==RW.id&&aW(id)&&(aW(id).pop||0)>=ARC_STAR);if(st){x+=ARC_RUB;lab.push(`the rub from ${aW(st).name}`);if(aW(st).own==='p')mor(aW(st),3)}
  if(rp0>=70&&a.q==='great'&&sBig(s)){x+=ARC_BREAK;lab.push('a breakthrough night')}
  x=Math.round(Math.min(x,ARC_RISEPOP+ARC_RUB)*10)/10;if(x>0){popx(RW,x);parts.push(`${who}popularity +${x} (${lab.join(', ')})`)}}
 if(r.chem&&a.b){const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+r.chem,-5,6)}
 if(r.trait&&TRAITS[r.trait])parts.push(`${TRAITS[r.trait].i} ${TRAITS[r.trait].n}`);if(r.trq&&TRAITS[r.trq])parts.push(`${TRAITS[r.trq].i} ${TRAITS[r.trq].n} is first in line for ${aPr(A,'their')} next trait slot`);
 if(r.fg2&&typeof FG_N!=='undefined')parts.push(`a second crowd: ${FG_N[r.fg2]}`);if(r.fgh&&typeof FG_N!=='undefined')parts.push(`halfway to winning over ${FG_N[r.fgh]}`);
 if(r.grp&&typeof fbHit==='function'&&A.own){try{fbHit('p',[A],Math.round(ARC_FANS*.6))}catch(e){}}
 if(A.own)mor(A,a.q==='great'?10:6);
 {const bq=ARC_FBQ&&a.q!=='great'?ARC_FBQ0+(1-ARC_FBQ0)*clamp((q-ARC_FBQLO)/(ARC_GREAT-aEase(A)-ARC_FBQLO),0,1):1;const f=Math.round(ARC_FANS*(r.fans||1)*bq*(a.q==='great'?1.3:1)*(1+ARC_RISEF*rf)*(typeof fanGrowF==='function'?fanGrowF(S.fans.p):1)/100)*100;if(f>0){const ws=[A,a.b&&aW(a.b)].filter(w=>w&&w.own==='p');try{if(typeof fbHit==='function'&&ws.length)fbHit('p',ws,f);else S.fans.p+=f}catch(e){S.fans.p+=f}parts.push(`+${fmtFans(f)} fans`)}}
 A.arcEnd=AW();A.arcLast=(A.arcLast||[]).concat([a.k]).slice(-4);S.arcLog=(S.arcLog||[]).concat([{s:S.season,w:AW(),k:a.k,v:a.v||0,a:a.a,b:a.b||null,q:a.q,fit:a.fit||0,sl:a.sl||null,bb:RW&&RW!==A?RW.id:null}]).slice(-40);S.arcDone=(S.arcDone||0)+1;if(a.q==='great')S.arcGreatN=(S.arcGreatN||0)+1;if(a.q==='great'&&s.ppv&&S.season>=2){S.arcM=S.arcM||{};S.arcM.ppvg=S.arcM.ppvg||AW()}
 notes.push(`📖✅ ${arcLine(a,'pay')} ${arcLine(a,a.q)} ${D.n} ${a.q==='great'?'— a great payoff':'paid off'}${parts.length?': '+parts.join(', '):''}.`);
 news(`📖 ${A.name}'s ${D.n} paid off${a.q==='great'?' in a big way':''}.`)}
function arcFail(a,notes){S.arcFailN=(S.arcFailN||0)+1;{const A0=aW(a.a);if(A0){A0.arcEnd=AW();A0.arcLast=(A0.arcLast||[]).concat([a.k]).slice(-4)}}S.arcFailK=S.arcFailK||{};const fk=a.k+':'+a.stage+':'+a.have;S.arcFailK[fk]=(S.arcFailK[fk]||0)+1;const A=aW(a.a);if(A&&A.own==='p'){mor(A,-(a.star?ARC_FAIL+2:ARC_FAIL));if(a.b&&aW(a.b)&&aW(a.b).own==='p')mor(aW(a.b),-4)}a.done=1;const t=`📖❌ ${arcLine(a,'fail')} (${aD(a).n})`;news(t);(notes||[]).push(t);S.arcNews=(S.arcNews||[]).concat([{w:AW(),t}]).slice(-8)}
/* the deadline, and arcs whose people are gone: checked when a show is about to air */
function arcTick(){if(!S||!Array.isArray(S.arcs))return;S.arcs=S.arcs.filter(a=>{if(a.done)return false;const A=aW(a.a);if(!A||A.own!=='p')return false;
  if(a.gone||[a.b,a.c].some(id=>id&&(!aW(id)||aW(id).own!=='p'))){a.done=1;news(`📖 ${A.name}'s ${aD(a).n} arc ends — someone in it is gone.`);return false}
  if(AW()>a.end){arcFail(a,[]);return false}return true})}
window.arcTick=arcTick;
if(typeof airPair==='function'){const _ap=airPair;airPair=function(){let th={};try{if(typeof bothSides==='function')bothSides(arcTick);else arcTick();S.injSeen=S.injSeen||{};ownList('p').forEach(w=>{if(w.inj)S.injSeen[w.id]=AW()});th.__ppv=!!(curShow()&&curShow().ppv);th.__w=AW();if(S.arcS0s!==S.season){S.arcS0s=S.season;S.arcS0=AW()}Object.values(S.titles||{}).forEach(t=>{th[t.id]=t.holders.join('|')})}catch(e){console.warn('arcs',e)}
 const r=_ap.apply(this,arguments);try{Object.values(S.titles||{}).forEach(t=>{if(th[t.id]!=null&&t.holders.length&&t.holders.join('|')!==th[t.id]&&t.holders.every(aMine)){S.arcM=S.arcM||{};S.arcM.newch=AW()}});if(th.__ppv)S.arcPPV=(S.arcPPV||0)+1;arcGroundswell(th.__w,r&&r.notes);arcUnlockTick(r&&r.notes);arcTokTick(r&&r.notes)}catch(e){console.warn('arcs',e)}return r}}

/* Groundswell: a week they're kept off the show (or squashed) is a step; the crowd's anger costs a few fans each time */
const ARC_GS_COST=4000;
function arcGroundswell(wk,notes){arcList().forEach(a=>{if(a.k!=='groundswell'||a.done||a.stage!=='build'||!aMine(a.a))return;const A=aW(a.a);if(A.inj)return;
  const seen=S.arcSeenW&&S.arcSeenW.w===wk?S.arcSeenW.ids:[];if(seen.includes(a.a)&&a.sqL!==wk)return;
  a.have++;a.st.push(3.5);a.lastStep=wk;const cost=ARC_GS_COST+1000*a.have;S.fans.p=Math.max(50000,S.fans.p-cost);
  const t=`📣 "WE WANT ${aLast(A).toUpperCase()}!" The groundswell grows (step ${a.have} of ${a.need}, −${fmtFans(cost)} fans).${a.have>=a.need?` Give ${aPr(A,'them')} the big win.`:''}`;news(t);if(notes)notes.push(t);
  if(a.have>=a.need){a.stage='pay';a.payFrom=wk+1}})}
/* The Corporate Offer: right before its payoff segment plays live, you decide what they choose */
if(typeof liveNext==='function'){const _ln=liveNext;liveNext=function(){try{if(typeof LQ!=='undefined'&&LQ){const nx=LQ.items[LQ.k+1];if(nx&&!nx.arcAsked&&(nx.kind==='seg'||nx.kind==='promo')){const seg=nx.kind==='promo'?aSegPromo(S.card.p[nx.i].d):aSegMatch(nx.m,nx.main?'me':'mid');
  const chOf=a=>aD(a).choice||(arcStoryOf(a)||{}).choice;
  const a=arcList().find(a=>!a.done&&!a.choice&&chOf(a)&&a.stage==='pay'&&AW()>=(a.payFrom||0)&&aMine(a.a)&&(()=>{try{return aD(a).pay(seg,a)}catch(e){return false}})());
  if(a){nx.arcAsked=1;window.__arcNx=nx;const D=Object.assign({},aD(a),{choice:chOf(a)});const A=aW(a.a);return openModal(`<div class="h mhd">${D.i} ${esc(A.name)}: the decision</div>${arcHead(a)?`<p class="arcst">📜 ${esc(arcHead(a))}</p>`:''}<p class="muted" style="margin-top:0">It all comes down to tonight. What does ${esc(A.name)} choose?</p>
   ${D.choice.map(o=>`<button class="choice" onclick="arcChoose('${a.id}','${o.k}')"><div><b>${esc(arcWords(a,o.n))}</b><div class="muted tiny">${esc(arcWords(a,o.d))}</div></div></button>`).join('')}`)}}}}catch(e){console.warn('arc choice',e)}return _ln.apply(this,arguments)}}
window.arcChoose=function(id,k){const a=arcList().find(x=>x.id===id);if(a){a.choice=k;const o=((aD(a).choice||(arcStoryOf(a)||{}).choice)||[]).find(o=>o.k===k);const nx=window.__arcNx;
  if(o&&o.win&&nx&&nx.m&&Array.isArray(nx.m.sides)){const si=nx.m.sides.findIndex(sd=>sd.includes(a.a));if(si>=0)nx.m.winner=o.win==='a'?si:(si===0?1:0)}}try{closeModal()}catch(e){}liveNext()};
/* ---- what to book: a slot filled straight from the arc (the Book it button and the sweep bot) ---- */
function arcPlan(a){const D=aD(a);if(!D||!D.plan||a.done)return null;try{return D.plan(a,a.stage)}catch(e){return null}}
window.arcPlan=arcPlan;
function arcUsed(c){const u=new Set();c.forEach(sl=>{if(!sl||!sl.d)return;if(sl.k==='match')sl.d.sides.flat().forEach(id=>u.add(id));if(sl.k==='promo'){u.add(sl.d.a);if(sl.d.b)u.add(sl.d.b)}});return u}
function arcFit(id){const w=aW(id);return !!(w&&!w.inj&&w.own==='p'&&(typeof sta!=='function'||typeof FAT_RISK==='undefined'||sta(w)>=100-FAT_RISK))}
/* the opponents a good booker would pick: the best projected match among the likeliest names */
function aCombos(l,n){if(n===1)return l.map(x=>[x]);const out=[];const go=(st,acc)=>{if(acc.length===n){out.push(acc.slice());return}for(let i=st;i<l.length;i++){acc.push(l[i]);go(i+1,acc);acc.pop()}};go(0,[]);return out}
function aPickOpp(core,pool,n,p,sh){const top=pool.slice(0,n===1?14:n===2?8:6);if(top.length<n)return null;const type=n===1?'singles':n===2?'tag':'trios';let best=null,bv=-1e9;
 aCombos(top,n).forEach(cb=>{const ids=cb.map(w=>w.id);const m={type,stip:p.stip||'std',sides:[core.slice(),ids],winner:p.win!=null?p.win:0,title:''};let v;try{v=rateMatch(m,{ppv:sh&&sh.ppv,preview:true}).raw}catch(e){v=cb.reduce((x,w)=>x+w.pop,0)/n}if(v>bv){bv=v;best=ids}});return best}
/* fill one open slot with the arc's next segment; returns the slot index or -1 */
function arcFill(a,c,opt){opt=opt||{};let l=arcPlan(a);{const SL=arcStoryOf(a);if(SL&&SL.payPlan&&a.stage==='pay'){try{const pp=SL.payPlan(a);if(pp)l=pp}catch(e){}}
  if(!l)return -1;if(SL&&SL.stip&&a.stage==='pay'&&STIPS[SL.stip])l=l.map(p=>p.kind==='match'?Object.assign({},p,{stip:SL.stip}):p);
  if(SL&&SL.vary&&a.stage==='build'){const pool=['street','nodq','falls','sub','tables','lms','iquit','cage','twoof3','ladder'].filter(k=>STIPS[k]&&!STIPS[k].ppv&&!(a.stipU||[]).includes(k));const k=pool[0];if(k){l=l.map(p=>p.kind==='match'&&!p.stip?Object.assign({},p,{stip:k}):p);a.stipU=(a.stipU||[]).concat([k])}}}const used=arcUsed(c);const sh=curShow();
 for(const p of l){if(p.ppv&&!sh.ppv)continue;
  if(p.kind==='promo'){const i=c.findIndex(sl=>sl&&sl.k==='promo'&&!sl.d);if(i<0)continue;if([p.a,p.b].some(id=>id&&(used.has(id)||!aW(id)||aW(id).inj||aW(id).own!=='p')))continue;c[i].d={type:PT[p.type]?p.type:'callout',a:p.a,b:p.b||null,played:false};return i}
  const ms=c.map((sl,i)=>sl&&sl.k==='match'&&!sl.opt?i:-1).filter(i=>i>=0);const main=ms[ms.length-1];const open=ms.filter(i=>!c[i].d);if(!open.length)continue;
  let i=p.main?(open.includes(main)?main:-1):(open.filter(x=>x!==main)[0]!=null?open.filter(x=>x!==main)[0]:open[0]);if(i<0)continue;
  let sides;const core=p.vs2?p.vs2.flat():p.vs?p.vs.slice():p.side.slice();if(core.some(id=>used.has(id)||!arcFit(id)))continue;
  if(p.ri&&(used.has(p.ri.x)||!arcFit(p.ri.x)||core.includes(p.ri.x)))continue;
  if(p.vs2)sides=p.vs2.map(x=>x.slice());
  else if(p.vs)sides=[[p.vs[0]],[p.vs[1]]];
  else if(p.ffa){const g=aW(core[0]).g;const ex=core.concat(p.ri?[p.ri.x]:[]);const pool=aRoster(ex).filter(w=>!used.has(w.id)&&arcFit(w.id)&&w.g===g&&!arcIn(w.id)&&!(c.some(sl=>sl&&sl.d&&sl.k==='match'&&sl.d.sides.flat().includes(w.id)))).sort((x,y)=>y.pop-x.pop);
   const o=(p.oppF?pool.filter(p.oppF):pool).slice(0,p.ffa);if(o.length<p.ffa)continue;sides=[core].concat(o.map(w=>[w.id]))}
  else{const n=p.n||1;const g=aW(core[0]).g;const pool=aRoster(core.concat(p.ri?[p.ri.x]:[])).filter(w=>!used.has(w.id)&&arcFit(w.id)&&!core.includes(w.id)&&w.g===g&&!arcIn(w.id)&&!(c.some(sl=>sl&&sl.d&&sl.k==='match'&&sl.d.sides.flat().includes(w.id)))).sort((x,y)=>y.pop-x.pop);
   const opp=aPickOpp(core,(p.oppF?pool.filter(p.oppF):pool),n,p,sh);if(!opp)continue;sides=[core,opp]}
  const type=sides.length===3?'triple':sides.length===4?'four':sides[0].length===1&&sides[1].length===1?'singles':sides[0].length===2?'tag':sides[0].length===3?'trios':p.type;
  let title=p.title||'';if(title&&!(typeof eligibleTitles!=='function'||eligibleTitles({type,sides}).includes(title)))title='';
  const win=p.win!=null?p.win:(()=>{let bi=0,bv=-1e9;sides.forEach((sd,k)=>{const v=sd.reduce((x,id)=>x+aW(id).pop,0)/sd.length;if(v>bv){bv=v;bi=k}});return bi})();
  c[i].d={type,stip:p.stip||'std',sides,winner:win,title};if(p.fin)c[i].d.fin=p.fin;
  if(p.ri){const t=p.ri.t==='$opp'?(sides[1]||[])[0]:p.ri.t;if(t)c[i].d.ri={k:p.ri.k,x:p.ri.x,t,turn:!!p.ri.turn}}
  try{if(typeof finWhy==='function'&&c[i].d.fin&&finWhy(c[i].d,c[i].d.fin))delete c[i].d.fin}catch(e){}return i}
 return -1}
/* an arc whose step needs two segments the same night (planAll) books them all, or none */
const _af1=arcFill;function arcFillAll(a,c,opt){const D=aD(a);if(!D.planAll||a.stage!=='build')return _af1(a,c,opt);const l=arcPlan(a);if(!l)return -1;const keep=c.map(sl=>sl&&sl.d);let first=-1;
 for(let k=0;k<l.length;k++){const one=Object.assign({},a);const sv=D.plan;let r;try{D.plan=()=>[l[k]];r=_af1(a,c,opt)}finally{D.plan=sv}if(r<0){c.forEach((sl,i)=>{if(sl)sl.d=keep[i]});return -1}if(first<0)first=r}return first}
window.arcFill=arcFillAll;
window.arcBook=function(id){if(typeof mpLocked==='function'&&mpLocked())return;const a=arcOf(id);if(!a)return;const i=arcFillAll(a,S.card.p);if(i<0)return toast('No open slot fits it — clear a slot, or book it yourself from the steps.');try{closeModal()}catch(e){}save();render();toast(`📖 Booked: ${aD(a).n} for ${aW(id).name}. Change anything you like.`)};

/* ---- the progress display ---- */
function arcDots(a){const D=aD(a);let h='';for(let i=0;i<a.need;i++)h+=`<i class="ad ${i<a.have?'on':''}">${i<a.have?'●':'○'}</i>`;return h+`<i class="ad pay ${a.stage==='pay'?'on':''}">★</i>`}
function arcNow(a){const D=aD(a);const o=a;if(a.stage==='pay')return AW()<(a.payFrom||0)?'Payoff next week':`Payoff: ${arcWords(o,D.payoff)}`;
 const lab=D.tell&&D.tell[Math.min(a.have,D.tell.length-1)];const bt=aBuildAt(D,a.have),mn=aMinAt(D,a.have)-aEase(aW(a.a));return `${lab?lab+' · ':''}Next: ${arcWords(o,bt)}${(D.min||D.mins)&&!/★/.test(bt)?` (${mn}★+)`:''}`}
function arcLeft(a){const l=a.end-AW()+1;return l<=1?'<b class="bad">Last week</b>':`${l} weeks left`}
/* ---- v433: how arcs look. The storyline leads; the stops are a track you can read at a glance; tapping an arc opens
   the road (every stop, the payoff) and the reward. Arcs have their own tab. ---- */
const aFull=()=>arcList().filter(a=>aMine(a.a)&&!a.done).length>=ARC_SLOTS;
const aStopN=(D,id,x)=>D.need2?D.need2({a:id,g:x&&x.g}):D.need;
const aStopName=(D,i)=>(D.tell&&D.tell[i])||'';
const aKick=(D,k,v,extra)=>`<div class="akick"><span>${D.i} ${esc(aName(k,v))}</span>${extra?`<small>${extra}</small>`:''}</div>`;
/* the horizontal track: one diamond per stop, then the payoff star */
function arcTrack(n,have,stage,done){let h='<div class="atrk">';for(let i=0;i<n;i++){const on=i<have,now=!done&&stage==='build'&&i===have;h+=(i?`<i class="atl ${i<=have?'on':''}"></i>`:'')+`<b class="atn ${on?'on':now?'now':''}"><span>${on?'✓':i+1}</span></b>`}
 return h+`<i class="atl ${have>=n?'on':''}"></i><b class="atp ${done?'on':stage==='pay'?'now':''}">★</b></div>`}
/* the vertical road on an arc's own screen */
function arcRoad(D,o,n,have,stage,payTxt,wid){let h='<div class="aroad">';const ez=aEase(aW(wid||(o&&o.a)));for(let i=0;i<n;i++){const on=i<have,now=stage==='build'&&i===have;const nm=aStopName(D,i);
  h+=`<div class="ars ${on?'on':now?'now':''}"><b class="arn"><span>${on?'✓':i+1}</span></b><div class="art"><div class="arh">Stop ${i+1}${nm?` · ${esc(nm)}`:''}${now?' <em>Next</em>':''}</div><div class="ard">${esc(arcWords(o,aBuildAt(D,i)))}${!/★/.test(aBuildAt(D,i))?` · ${aMinAt(D,i)-ez}★ or better`:''}</div></div></div>`}
 return h+`<div class="ars pay ${stage==='pay'?'now':''}"><b class="arn"><span>★</span></b><div class="art"><div class="arh">The payoff${stage==='pay'?' <em>Next</em>':''}</div><div class="ard">${esc(payTxt)}</div></div></div></div>`}
/* the reward as tags */
function arcReward(D,A,o){const t=arcGain(D,A,o);const l=[].concat(...t.split(/,\s*(?:and\s+)?|;\s*/).map(x=>x.split(/\s+and\s+(?=[a-z])/))).map(x=>x.trim()).filter(Boolean);
 const RW=ARC_BUILDS_B[D.k]&&o&&o.b&&aW(o.b)?aW(o.b):A;const rise=RW&&!(RW===A&&(aStar(A)||D.lane==='star'))?aRiseF(RW):0;
 const brk=RW&&RW.own==='p'&&RW.pop>=70&&RW.pop<ARC_STAR&&!(RW===A&&(aStar(A)||D.lane==='star'))?`<span class="argt">${RW===A?'A':esc(RW.name)+':'} breakthrough if the payoff is great in the main event or on a PPV</span>`:'';
 const rl=rise>=.5?`${RW===A?'On the rise':esc(RW.name)+' is on the rise'}: a bigger popularity jump and more fans`:rise>0?'A little extra popularity on the way up':'';
 return `<div class="arwd">${l.map(x=>`<span class="argt">${esc(x.charAt(0).toUpperCase()+x.slice(1))}</span>`).join('')}${rl?`<span class="argt">${rl}</span>`:''}${brk}</div><div class="muted tiny">A cleaner build makes a bigger payoff.</div>`}
/* faction names for a Faction War that hasn't started yet: their faction, or the crew that would form */
const aFacN=L=>{const t=(S.teams||[]).find(t=>(t.type==='faction'||t.type==='trios')&&t.m.includes(L.id)&&t.m.filter(x=>aMine(x)).length>=3);return t?t.n:`${aLast(L)}'s crew`};
const aPrev=(id,k,o)=>k==='factionwar'&&o.b&&aW(o.b)?Object.assign({},o,{fn:o.fn||aFacN(aW(id)),fn2:o.fn2||aFacN(aW(o.b))}):o;
const aHeadOf=(id,k,o)=>{o=aPrev(id,k,o);const sid=arcStoryPick(k,id,null,o.b);const so=sid&&(ARC_STORY[k]||[]).find(y=>y.id===sid);return so?arcHead(Object.assign({a:id,k},o),so):''};
const aPayTxt=(D,o,sl)=>arcWords(o,D.payoff)+(sl&&sl.stip&&STIPS[sl.stip]?` (${STIPS[sl.stip].n})`:'');

/* a running arc, compact: used on the Arcs tab, the profile and anywhere else that lists arcs */
function arcRowHtml(a,tap){const D=aD(a);const A=aW(a.a);const pay=a.stage==='pay';
 return `<div class="arun"${tap?` onclick="arcOpen('${a.a}')"`:''}>${aKick(D,a.k,a.v,`${esc(A.name)}${a.fit&&arcFitKnown(A)?' ✨':''}`)}<div class="ahd sm">${esc(arcHead(a)||D.d)}</div>${arcTrack(a.need,a.have,a.stage)}
 <div class="anx"><span>${pay?'★ Payoff':`Stop ${a.have+1} of ${a.need}`}: ${esc(arcNow(a).replace(/^Payoff: /,'').replace(/Next: /,''))}</span><b>${arcLeft(a)}</b></div></div>`}
window.arcRowHtml=arcRowHtml;
/* the profile's Arcs row */
window.arcProfile=function(w){if(!w||w.own!=='p')return '';const a=arcOf(w.id);
 const fk=arcFitKnown(w)?arcFitOf(w):null;const fitRow=fk&&ARCS[fk]?`<div class="pf-row"><span class="pf-l">✨ Made for</span><span class="pf-v">${ARCS[fk].i} ${esc(ARCS[fk].n)}</span></div>`:'';
 if(a)return fitRow+`<div class="pf-row pf-arc tap"><span class="pf-l">📖 Arc</span><div class="pf-s">${arcRowHtml(a,1)}</div></div>`;
 const part=arcList().find(x=>x.b===w.id||x.c===w.id);if(part)return `<div class="pf-row"><span class="pf-l">📖 Arc</span><span class="pf-v">In ${esc(aW(part.a).name)}'s ${esc(aD(part).n)}</span></div>`;
 const why=arcCanStart(w.id);const n=why?0:arcOffer(w.id).length;const rb=w.rbDue?`<div class="pf-row"><span class="pf-l">🎭 New character</span><span class="pf-v"><button class="pf-tg" onclick="arcRebrand('${w.id}')">Name it</button></span></div>`:'';
 return rb+fitRow+`<div class="pf-row"><span class="pf-l">📖 Arcs</span><span class="pf-v">${why?`<small>${esc(why)}</small>`:n?`<button class="pf-tg" onclick="arcOpen('${w.id}')">${n} arc${n>1?'s':''}</button>`:`<small>No story fits ${aPr(w,'them')} right now</small>`}</span></div>`};
window.arcRebrand=function(id){const w=aW(id);if(!w||!w.rbDue)return;if(typeof rbAsk==='function'&&rbAsk(w,{i:'🎭',head:`${w.name}'s new character`,verb:'🎭 Debut it',where:'A brand new character.',go:()=>{delete w.rbDue},ok:()=>true}))return;delete w.rbDue;save();render()};

/* a wrestler's arcs, or their running arc */
function arcOpen(id){const A=aW(id);if(!A)return;const a=arcOf(id);
 if(a){const D=aD(a);const pl=arcPlan(a);const can=pl&&S.card&&S.card.p&&S.phase==='season';const sl=arcStoryOf(a);
  return openModal(`${aKick(D,a.k,a.v,`${esc(A.name)} · ${ARC_LANES[a.star?'star':D.lane]}`)}<div class="ahd">${esc(arcHead(a)||D.d)}</div>${arcHead(a)?`<p class="muted adsc">${esc(arcWords(a,D.d))}</p>`:''}
  ${arcTrack(a.need,a.have,a.stage)}
  <div class="asec">The road</div>${arcRoad(D,a,a.need,a.have,a.stage,aPayTxt(D,a,sl))}
  <div class="asec">The reward</div>${arcReward(D,A,a)}
  <div class="aleft ${a.end-AW()<1?'bad':''}">${arcLeft(a).replace(/<[^>]+>/g,'')} · miss it and ${esc(A.name)} is let down</div>
  ${can?`<button class="btn" onclick="arcBook('${id}')">Book ${a.stage==='pay'?'the payoff':`stop ${a.have+1}`} tonight</button>`:''}
  <button class="btn ghost" onclick="arcDrop('${id}')">Drop the arc</button><button class="btn sec" onclick="${tab==='arcs'?'closeModal()':`showW('${id}')`}">Back</button>`)}
 const why=arcCanStart(id);const full=aFull();if(why&&!full){toast(why);return}
 const o=arcOffer(id);const rd=S.arcTok>0?`<button class="btn ghost" onclick="arcRedeal('${id}')">🔀 Reshuffle ${aPr(A,'their')} arcs (${S.arcTok} left)</button>`:'';
 const back=`<button class="btn sec" onclick="${tab==='arcs'?'closeModal()':`showW('${id}')`}">Not now</button>`;
 if(!o.length)return openModal(`<div class="h mhd">📖 ${esc(A.name)}</div><p class="muted">No story fits ${esc(A.name)} right now. Arcs reshuffle after the next PPV.</p>${rd}${back}`);
 openModal(`<div class="h mhd">📖 ${esc(A.name)}'s arcs</div><p class="muted adsc">${aStar(A)?'Superstar stories: a bigger payoff, popularity and heat.':`Stories that fit who ${aPr(A,'they')} is.`} Assign one, book every stop, land the payoff. Arcs reshuffle after the next PPV.</p>
 ${o.map(x=>{const D=aDK(x.k,null,arcStoryPick(x.k,id,null,x.b));const c=aCost(x.k,id,x);const n=aStopN(D,id,x);const fit=arcFitKnown(A)&&arcFitOf(A)===x.k;
  return `<button class="arct" onclick="arcCast('${id}','${x.k}')">${aKick(D,x.k,null,`${ARC_LANES[aStar(A)?'star':D.lane]} · ${money(c)}`)}<div class="ahd sm">${esc(aHeadOf(id,x.k,x))}</div>${arcTrack(n,0,'build')}<div class="anx"><span>${n} stop${n>1?'s':''}, then the payoff${fit?' · <b class="gold">✨ Made for this</b>':''}</span><b>›</b></div></button>`}).join('')}
 ${rd}${back}`)}
/* one arc up close before you start it: the road, the reward, and (when it has one) who you cast */
window.arcCast=function(id,k,sel){const A=aW(id);const card=arcOffer(id).find(x=>x.k===k);if(!A||!card)return;const C=ARC_CAST[k];
 sel=Object.assign({b:card.b,c:card.c},window.__arcSel&&window.__arcSel.k===k&&window.__arcSel.id===id?window.__arcSel:{},sel||{});window.__arcSel=Object.assign({id,k},sel);
 const o=aPrev(id,k,Object.assign({},card,sel));const sid=arcStoryPick(k,id,null,o.b);const D=aDK(k,null,sid);const n=aStopN(D,id,o);const c=aCost(k,id,o);const sl=sid&&(ARC_STORY[k]||[]).find(y=>y.id===sid);
 const row=(r,w)=>`<button class="arccast ${sel[r]===w.id?'on':''}" onclick="arcCast('${id}','${k}',{${r}:'${w.id}'})"><b>${esc(w.name)}</b><small>${Math.round(w.pop)} pop · ${w.al==='h'?'heel':'face'}${typeof fgTag==='function'?' '+fgTag(w):''}</small></button>`;
 const roles=C?['b','c'].filter(r=>C[r]):[];
 openModal(`${aKick(D,k,null,`${esc(A.name)} · ${ARC_LANES[aStar(A)?'star':D.lane]}`)}<div class="ahd">${esc(sl?arcHead(Object.assign({a:id,k},o),sl):D.d)}</div><p class="muted adsc">${esc(arcWords(o,D.d))}</p>
 ${roles.map(r=>{const l=arcCastList(A,k,r,r==='c'?[sel.b]:[]);return `<div class="asec">${esc(arcWords(o,C[r].lab))}</div><div class="arccastl">${l.map(w=>row(r,w)).join('')}</div>`}).join('')}
 <div class="asec">The road · ${n} stop${n>1?'s':''} in ${n+ARC_SLACK} weeks</div>${arcRoad(D,o,n,0,'',aPayTxt(D,o,sl),id)}
 <div class="asec">The reward</div>${arcReward(D,A,o)}
 ${aFull()?`<button class="btn" disabled>Both arc slots are busy</button>`:`<button class="btn" ${S.money.p<c?'disabled':''} onclick="window.__arcSel=null;arcStart('${id}','${k}',{b:'${sel.b||''}',c:'${sel.c||''}'})">Assign this arc · ${money(c)}</button>`}<button class="btn sec" onclick="window.__arcSel=null;arcOpen('${id}')">Back</button>`)};
window.arcOpen=arcOpen;
/* the Arcs tab */
/* the Arcs tab: Active (what's running) and Potential (who has a story ready), each led by the wrestler's card */
let ARC_TABV='act';window.arcTabV=function(v){ARC_TABV=v;render()};
const aMini=(id,sm)=>{const w=aW(id);return w&&typeof tcCard==='function'?`<span class="acard${sm===2?' xs':sm?' sm':''}">${tcCard(w,{noWear:true,nofg:!!sm})}${sm===1?`<i>${esc(w.name)}</i>`:''}</span>`:''};
function arcActHtml(a){const D=aD(a);const A=aW(a.a);const pay=a.stage==='pay';const cast=[a.b,a.c].filter(id=>id&&aW(id));
 return `<button class="aact" onclick="arcOpen('${a.a}')"><div class="acol">${aMini(a.a)}${cast.length?`<div class="awith${cast.length>1?' two':''}"><small>with</small>${cast.map(id=>aMini(id,1)).join('')}</div>`:''}</div>
 <div class="abody">${aKick(D,a.k,a.v,`${ARC_LANES[a.star?'star':D.lane]}`)}<div class="ahd sm">${esc(arcHead(a)||D.d)}</div>${arcTrack(a.need,a.have,a.stage)}
 <div class="anx"><span>${pay?'★ Payoff':`Stop ${a.have+1} of ${a.need}`}: ${esc(arcNow(a).replace(/^Payoff: /,'').replace(/Next: /,''))}</span></div><div class="aleft2 ${a.end-AW()<1?'bad':''}">${arcLeft(a).replace(/<[^>]+>/g,'')}</div></div></button>`}
window.arcsView=function(){const l=arcList().filter(a=>aMine(a.a)&&!a.done);const ph=arcPhase();
 const head=typeof pageHead==='function'?pageHead('Storylines','Arcs',`<b>${l.length}/${ARC_SLOTS}</b><small>Running</small>`,{sub:`Stories lean ${ph.b>=2?'big and season-defining':ph.s>=2.5?'small, fresh starts':'mid-sized'} right now: ${esc(ph.t)}`}):'';
 if(S.phase!=='season')return head+`<div class="card"><div class="muted">Arcs start once the season is under way.</div></div>`;
 const open=ARC_SLOTS-l.length;
 const busy=id=>arcList().some(a=>!a.done&&(a.a===id||a.b===id||a.c===id));
 const ready=ownList('p').filter(w=>!w.retd&&!busy(w.id)&&(!arcCanStart(w.id)||aFull())).map(w=>({w,o:arcOffer(w.id)})).filter(x=>x.o.length).sort((x,y)=>y.w.pop-x.w.pop);
 const v=ARC_TABV==='pot'?'pot':'act';
 const seg=`<div class="aseg"><button class="${v==='act'?'on':''}" onclick="arcTabV('act')">Active <b>${l.length}/${ARC_SLOTS}</b></button><button class="${v==='pot'?'on':''}" onclick="arcTabV('pot')">Potential <b>${ready.length}</b></button></div>`;
 const news_=(S.arcNews||[]).filter(n=>AW()-n.w<=1);
 let body;
 if(v==='act'){
  body=`<div class="card arcsrun">${l.map(arcActHtml).join('')}${open>0?Array(open).fill(`<button class="aslot" onclick="arcTabV('pot')">Open slot · <b>pick a potential arc</b></button>`).join(''):''}</div>`
   +(news_.length?`<div class="card">${news_.map(n=>`<div class="muted tiny">${esc(n.t)}</div>`).join('')}</div>`:'');
 }else{
  const ks=Object.keys(ARCS);const used=ks.filter(k=>arcRan(k)&&!arcRunningK(k)),gate=ks.filter(k=>!arcOpenK(k));
  const li=(k,t)=>`<div class="arcb"><span>${ARCS[k].i} ${esc(ARCS[k].n)}</span>${t?`<small>${esc(t)}</small>`:''}</div>`;
  const more=used.length||gate.length?`<div class="card"><details class="arcbd"><summary>${used.length} run this season · ${gate.length} waiting on a bigger stage</summary>${used.length?`<div class="arcbh">Run this season · back next season</div>${used.map(k=>li(k,'')).join('')}`:''}${gate.length?`<div class="arcbh">Waiting on a bigger stage</div>${gate.map(k=>li(k,arcLockTxt(k))).join('')}`:''}</details></div>`:'';
  body=`<div class="card arcsav">${open<=0?'<div class="abusy">Both slots are busy. Land or drop an arc to assign one of these.</div>':''}${S.arcTok>0?`<div class="muted tiny" style="margin-bottom:6px">🔀 ${S.arcTok} reshuffle${S.arcTok>1?'s':''} to spend</div>`:''}
  ${ready.length?arcPotGroups(ready):'<div class="muted">No story fits anyone right now. Arcs reshuffle after the next PPV.</div>'}</div>`+more;
 }
 return head+seg+body};
/* v435: Potential, by arc. Each arc once, with the wrestlers who could run it as small cards; tap it to see each one's story */
let ARC_POTK=null;window.arcPotK=function(k){ARC_POTK=ARC_POTK===k?null:k;render()};
const AGP={they:['he','she','he or she'],them:['him','her','him or her'],their:['his','her','his or her'],theirs:['his','hers','his or hers'],themself:['himself','herself','himself or herself'],themselves:['himself','herself','himself or herself'],"they're":["he's","she's","he or she is"],"they've":["he's","she's","he or she has"],"they'll":["he'll","she'll","he or she will"],"they'd":["he'd","she'd","he or she would"]};
/* a line with no one cast yet: the wrestler is "your wrestler" (he / she when the whole group is one or the other), the rest are someone */
function aGen(t,g){const x=g==='M'?0:g==='F'?1:2;let r=String(t||'').replace(/\{([ABC]):([A-Za-z']+)\}/g,(m,k,wd)=>{const lw=wd.toLowerCase();const f=AGP[lw];const v=f?f[k==='A'?x:2]:lw;return wd[0]!==lw[0]?v[0].toUpperCase()+v.slice(1):v})
  .replace(/\{A\}/g,'your wrestler').replace(/\{B\}/g,'someone').replace(/\{C\}/g,'someone else').replace(/\{F2\}/g,'another faction').replace(/\{F\}/g,'a faction').replace(/\{G\}/g,'another crowd').replace(/\{T\}/g,'a new trait').replace(/\{S\} match/g,'one kind of match').replace(/\{S\}/g,'one kind of');
 return r.charAt(0).toUpperCase()+r.slice(1)}
function arcPotGroups(ready){const G={};ready.forEach(({w,o})=>o.forEach(x=>{(G[x.k]=G[x.k]||[]).push({w,x,sid:arcStoryPick(x.k,w.id,null,x.b)})}));
 const ord={mic:0,ring:1,trait:2,star:3};const ks=Object.keys(G).sort((p,q)=>(ord[ARCS[p].lane]-ord[ARCS[q].lane])||(G[q].length-G[p].length)||ARCS[p].n.localeCompare(ARCS[q].n));
 let h='',lane=null;ks.forEach(k=>{const D=aDK(k);const l=G[k];const open=ARC_POTK===k;
  /* the storylines this arc would tell, each with who'd get it */
  const SG=[];l.forEach(e=>{let g=SG.find(y=>y.sid===e.sid);if(!g)SG.push(g={sid:e.sid,l:[]});g.l.push(e)});
  const gOf=L=>L.every(e=>e.w.g==='M')?'M':L.every(e=>e.w.g==='F')?'F':null;
  const head=sid=>{const so=(ARC_STORY[k]||[]).find(y=>y.id===sid);return so?so.head:D.d};
  if(D.lane!==lane){lane=D.lane;h+=`<div class="asec apsec">${ARC_LANES[lane]}</div>`}
  const faces=l.slice(0,5).map(({w})=>aMini(w.id,2)).join('')+(l.length>5?`<b class="apmore">+${l.length-5}</b>`:'');
  const one=SG.length===1;
  h+=`<div class="apg${open?' on':''}"><button class="apgh" onclick="arcPotK('${k}')"><div class="akick"><span>${D.i} ${esc(aName(k))}</span><small>${(()=>{const cs=l.map(e=>aCost(k,e.w.id,e.x));const lo=Math.min(...cs),hi=Math.max(...cs);return lo===hi?money(lo):money(lo)+'–'+money(hi)})()}</small></div>
   <div class="${one?'ahd sm apgs':'apgd'}">${esc(one?aGen(head(SG[0].sid),gOf(l)):`${SG.length} stories: ${aGen(D.d,gOf(l))}`)}</div>${open?'':`<div class="apgf"><span class="apfc">${faces}</span><small>${l.length} wrestler${l.length>1?'s':''} <b>▾</b></small></div>`}</button>`;
  if(open)h+=`<div class="apgl">${SG.map(g=>{const DS=aDK(k,null,g.sid);const n=aStopN(DS,g.l[0].w.id,g.l[0].x);
    return `${one?'':`<div class="ahd sm apgs2">${esc(aGen(head(g.sid),gOf(g.l)))}</div>`}<div class="apgt">${arcTrack(n,0,'build')}<small>${n} stop${n>1?'s':''}, then the payoff · tap a wrestler</small></div>
    <div class="apgw">${g.l.map(({w})=>{const fit=arcFitKnown(w)&&arcFitOf(w)===k;return `<button class="apw2" onclick="arcCast('${w.id}','${k}')">${aMini(w.id)}${fit?'<i class="gold">✨ Made for this</i>':''}</button>`}).join('')}</div>`}).join('')}
   <button class="apgx" onclick="arcPotK('${k}')">Close ▴</button></div>`;
  h+='</div>'});return h}
/* the Office keeps a pointer; the arcs live on their own tab */
window.arcOfficeCard=function(){return ''};
{const st=document.createElement('style');st.textContent=`
.akick{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;letter-spacing:.06em;color:var(--gold2);font-size:14px}
.akick small{color:rgba(255,255,255,.55);font-size:12px;font-style:normal;font-weight:700;text-align:right}
.ahd{font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;font-size:24px;line-height:1.1;color:#fff;margin:6px 0 4px}
.ahd.sm{font-size:18px;margin:4px 0 8px}.adsc{margin:0 0 8px}
.atrk{display:flex;align-items:center;margin:10px 4px 6px}
.atn{width:16px;height:16px;flex:none;transform:rotate(45deg);border:2px solid rgba(255,255,255,.28);display:grid;place-items:center;background:#141418}
.atn span{transform:rotate(-45deg);font:800 10px/1 'Barlow',sans-serif;color:rgba(255,255,255,.55)}
.atn.on{background:var(--gold);border-color:var(--gold)}.atn.on span{color:#111}
.atn.now{border-color:var(--gold2);box-shadow:0 0 10px rgba(240,190,70,.6)}.atn.now span{color:var(--gold2)}
.atl{flex:1;height:2px;background:rgba(255,255,255,.16);margin:0 3px;min-width:10px}.atl.on{background:var(--gold)}
.atp{flex:none;font-size:22px;line-height:1;color:rgba(255,255,255,.25);font-style:normal}.atp.now{color:var(--gold2);text-shadow:0 0 10px rgba(240,190,70,.6)}.atp.on{color:var(--gold)}
.anx{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:rgba(255,255,255,.6)}.anx b{white-space:nowrap;color:rgba(255,255,255,.8)}
.arun{padding:12px 0;border-top:1px solid rgba(255,255,255,.08);cursor:pointer}.arun:first-of-type{border-top:0}
.aslot{padding:14px;margin-top:8px;border:1px dashed rgba(255,255,255,.18);color:rgba(255,255,255,.45);text-align:center;font-size:13px}
#modal .arct{display:block;width:100%;text-align:left;padding:12px 14px 10px;margin:0 0 10px;background:rgba(255,255,255,.04);border:0;border-left:3px solid var(--gold);color:inherit}
#modal .arct:active{background:rgba(255,255,255,.08)}
.asec{margin:16px 0 6px;padding-bottom:4px;border-bottom:2px solid rgba(207,171,85,.5);font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;letter-spacing:.06em;color:var(--gold2);font-size:15px}
.aroad{position:relative;margin:4px 0}.aroad:before{content:"";position:absolute;left:10px;top:16px;bottom:16px;width:2px;background:rgba(255,255,255,.14)}
.ars{display:flex;gap:14px;padding:7px 0;position:relative}
.arn{width:20px;height:20px;flex:none;margin-top:2px;transform:rotate(45deg);border:2px solid rgba(255,255,255,.3);background:#17171b;display:grid;place-items:center}
.arn span{transform:rotate(-45deg);font:800 11px/1 'Barlow',sans-serif;color:rgba(255,255,255,.6)}
.ars.on .arn{background:var(--gold);border-color:var(--gold)}.ars.on .arn span{color:#111}.ars.on .art{opacity:.55}
.ars.now .arn{border-color:var(--gold2);box-shadow:0 0 10px rgba(240,190,70,.55)}.ars.now .arn span{color:var(--gold2)}
.ars.pay .arn{transform:none;border:0;background:#17171b;width:20px}.ars.pay .arn span{transform:none;font-size:20px;color:rgba(255,255,255,.35)}.ars.pay.now .arn{box-shadow:none}.ars.pay.now .arn span{color:var(--gold2)}
.arh{font-weight:800;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#fff}.arh em{font-style:normal;color:#111;background:var(--gold2);padding:0 5px;margin-left:4px;font-size:11px}
.ard{font-size:14px;color:rgba(255,255,255,.7);margin-top:1px}
.arwd{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}.argt{padding:4px 9px;border:1px solid rgba(207,171,85,.7);color:var(--gold2);font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.05em;background:rgba(207,171,85,.08)}
.aleft{margin:14px 0 8px;font-size:13px;color:rgba(255,255,255,.6)}.aleft.bad{color:#ff8a7a}
.arw{display:block;width:100%;text-align:left;background:none;border:0;border-top:1px solid rgba(255,255,255,.08);padding:10px 0;color:inherit;cursor:pointer}.arw:first-of-type{border-top:0}
.arwn{display:flex;justify-content:space-between;align-items:baseline}.arwn b{font-size:16px}.arwn small{color:rgba(255,255,255,.5)}
.arwl{display:flex;flex-direction:column;gap:3px;margin-top:5px}.arwl span{font-size:13.5px;font-style:italic;color:rgba(255,255,255,.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.aseg{display:flex;margin:0 0 12px;border:1px solid rgba(207,171,85,.45)}.aseg button{flex:1;padding:10px 0;background:none;border:0;color:rgba(255,255,255,.6);font:800 italic 16px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}
.aseg button b{margin-left:4px;color:rgba(255,255,255,.45)}.aseg button.on{background:var(--gold);color:#111}.aseg button.on b{color:#111}
.aact,.apa,.aslot{font-family:inherit}.aact{display:flex;gap:12px;width:100%;text-align:left;background:none;border:0;border-top:1px solid rgba(255,255,255,.08);padding:12px 0;color:inherit;cursor:pointer}.aact:first-child{border-top:0;padding-top:2px}
.acol{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px}.abody{flex:1;min-width:0}
.acard{display:block;flex:none;pointer-events:none}.acard .tkc{--w:78px}.acard.sm{width:64px;text-align:center}.acard.sm .tkc{--w:52px;margin:0 auto}.acard.sm .tkc .tcb{display:none}.acard.sm i{display:block;margin-top:3px;font:700 11px/1.15 'Barlow',sans-serif;font-style:normal;color:rgba(255,255,255,.8)}
.awith{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;width:84px}.awith small{width:100%;text-align:center}.awith.two .acard.sm{width:40px}.awith.two .acard.sm .tkc{--w:38px}.awith.two .acard.sm i{font-size:9.5px}.awith small{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.aleft2{margin-top:4px;font-weight:800;font-size:13px;color:rgba(255,255,255,.8)}.aleft2.bad{color:#ff8a7a}
.aslot{display:block;width:100%;background:none;cursor:pointer}.aslot b{color:var(--gold2)}
.abusy{padding:8px 10px;margin-bottom:10px;border-left:3px solid var(--gold);background:rgba(207,171,85,.08);font-size:13px;color:rgba(255,255,255,.75)}
.apot{display:flex;gap:12px;padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.apot:first-of-type{border-top:0}
.apot .acard .tkc{--w:72px}.apl{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.apa{display:flex;gap:8px;align-items:flex-start;width:100%;text-align:left;background:rgba(255,255,255,.04);border:0;border-left:3px solid rgba(207,171,85,.7);padding:6px 8px;color:inherit;cursor:pointer}
.apa:active{background:rgba(255,255,255,.09)}.api{flex:none;font-size:15px;line-height:1.3}
.apt{min-width:0;font:700 italic 14px/1.2 'Barlow',sans-serif;color:#fff;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.apgs{margin:4px 0 10px}.apgs2{margin:10px 0 2px;font-size:17px}
.apgt{display:flex;flex-direction:column;gap:2px;margin:2px 0 8px}.apgt .atrk{margin:6px 2px 2px;max-width:260px}.apgt small{font-size:12px;color:rgba(255,255,255,.55)}
.apgw{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:10px 8px;margin-bottom:6px}
.apw2{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;padding:0;color:inherit;cursor:pointer;font-family:inherit}
.apw2 .acard .tkc{--w:72px}.apw2 i{font:700 12px/1.15 'Barlow',sans-serif;font-style:normal;color:rgba(255,255,255,.85);text-align:center}
.apgx{display:block;width:100%;margin-top:6px;padding:8px 0;background:none;border:0;border-top:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.55);font:800 italic 13px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}
.apsec{margin:14px 0 4px}.apsec:first-child{margin-top:0}
.apg{border-top:1px solid rgba(255,255,255,.08)}.apg+.apsec{margin-top:18px}
.apgh{display:block;width:100%;text-align:left;background:none;border:0;border-left:3px solid rgba(207,171,85,.7);padding:10px 10px 10px 12px;color:inherit;cursor:pointer;font-family:inherit}
.apg.on .apgh{background:rgba(207,171,85,.08);border-left-color:var(--gold)}.apgh:active{background:rgba(255,255,255,.06)}
.apgd{font-size:13.5px;color:rgba(255,255,255,.7);margin:3px 0 8px}
.apgf{display:flex;align-items:center;justify-content:space-between;gap:8px}.apgf small{font-size:12px;font-weight:700;color:rgba(255,255,255,.6);white-space:nowrap}.apgf small b{color:var(--gold2);margin-left:2px}
.apfc{display:flex;align-items:center;gap:4px;min-width:0}.acard.xs .tkc{--w:34px}.acard.xs .tkc .tcb{display:none}.apmore{font:800 12px 'Barlow',sans-serif;color:rgba(255,255,255,.55);margin-left:2px}
.apgl{padding:2px 0 8px 12px;border-left:3px solid var(--gold);background:rgba(207,171,85,.04)}
.apw{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;border-top:1px solid rgba(255,255,255,.07);padding:10px 10px 10px 0;color:inherit;cursor:pointer;font-family:inherit}.apw:first-child{border-top:0}
.apw .acard .tkc{--w:60px}.apwt{flex:1;min-width:0}.apwt small{display:block;font:800 italic 12px/1.2 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.6)}
.apwt>b{display:block;font:700 italic 15px/1.2 'Barlow',sans-serif;color:#fff;margin-top:2px}.apwt .atrk{margin:8px 2px 0}.apw>i{font-style:normal;color:var(--gold2);font-size:20px}
.apt small{display:block;font:800 italic 11px/1.2 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--gold2);margin-bottom:2px}
`;document.head.appendChild(st)}

/* ---- the Book screen checklist: each arc's next step ---- */
if(typeof attnItems==='function'){const _ai=attnItems;attnItems=function(){const out=_ai.apply(this,arguments);try{if(!S||S.phase!=='season')return out;const c=(S.card&&S.card.p)||[];
 arcList().filter(a=>aMine(a.a)&&!a.done).forEach(a=>{const D=aD(a);const A=aW(a.a);if(A.inj)return;const pay=a.stage==='pay'&&AW()>=(a.payFrom||0);if(a.stage==='pay'&&!pay)return;
  const left=a.end-AW()+1;const ids=[a.a,a.b,a.c].filter(Boolean);
  const on=c.some(sl=>sl&&sl.d&&(sl.k==='match'?sl.d.sides.flat().includes(a.a):sl.k==='promo'&&(sl.d.a===a.a||sl.d.b===a.a)));
  out.push({id:'arc'+a.id,g:left<=1?'must':'chance',i:D.i,h:`${A.name} · ${D.n}: ${pay?'the payoff':`step ${a.have+1} of ${a.need}`}`,d:`${arcWords(a,pay?D.payoff:aBuildAt(D,a.have))}. ${left<=1?`Last week — miss it and ${aPr(A,"they're")} let down.`:`${left} weeks left.`}`,
   s:D.offShow&&!pay?(on?['w',`On the card: the groundswell needs ${aPr(A,'them')} off it`]:['ok','Kept off the show']):on?['ok','On the card']:[left<=1?'b':'w','Not on the card'],a:on||D.offShow&&!pay?null:['Book it',`arcBook('${a.a}')`,left<=1?1:0],gate:false,who:ids,where:`📖 ${aPr(A,'Their')} arc`,
   chip:i=>{const d=c[i]&&c[i].d;if(!d)return null;const ws=c[i].k==='match'?d.sides.flat():[d.a,d.b];return ws.includes(a.a)?['ok',pay?`${D.n}: the payoff`:`${D.n}: step ${a.have+1}`]:null}})})}catch(e){console.warn('arc checklist',e)}return out};window.attnItems=attnItems}

/* ---- old saves: the Performance Center closes; nobody's mid-arc ---- */
function arcMigrate(st){if(!st)return;if(!Array.isArray(st.arcs))st.arcs=[];if(Array.isArray(st.training)&&st.training.length)st.training=[]}
window.arcMigrate=arcMigrate;
/* ---- looks ---- */
{const st=document.createElement('style');st.textContent=`.arcrow{padding:6px 0;border-top:1px solid rgba(255,255,255,.08)}.arcrow:first-of-type{border-top:0}
.arcdots{white-space:nowrap;letter-spacing:2px}.ad{font-style:normal;color:rgba(255,255,255,.35)}.ad.on{color:var(--gold)}.ad.pay{margin-left:4px}.ad.pay.on{color:var(--gold);text-shadow:0 0 6px rgba(255,200,0,.5)}
.arcbig{font-size:26px;letter-spacing:6px;margin:6px 0 10px}.arcbd{margin-top:8px}.arcbd summary{cursor:pointer;color:var(--gold);font-weight:600}.arcbh{margin:8px 0 2px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.5)}.arcb{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:14px}.arcb small{color:rgba(255,255,255,.55);text-align:right}#modal .choice.arcch{display:block}.pf-arc .pf-s{width:100%}.arcst{font-style:italic;color:var(--gold);margin:2px 0 6px}.arccastl{display:flex;flex-wrap:wrap;gap:6px}.arccast{display:flex;flex-direction:column;align-items:flex-start;padding:8px 10px;min-width:44%;flex:1 1 44%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);color:inherit;text-align:left}.arccast small{opacity:.65;font-size:12px}.arccast.on{border-color:var(--gold);background:rgba(255,200,0,.12)}`;document.head.appendChild(st)}
})();
