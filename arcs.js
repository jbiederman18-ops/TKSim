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
 ARC_FANS=12000,ARC_G1=5,ARC_G2=8,ARC_FAIL=10,ARC_SLACK=3,ARC_MIN=2.5,ARC_BUILD=.25,ARC_PROVE=6,ARC_STORYH=[25,35,45,50],ARC_STORYP=60,ARC_CAS=.5,ARC_CASCAP=1;
const ARC_H=new WeakMap();
/* ---- the story lines: {A} is the wrestler, {B}/{C} the others in the arc. Leave a key out to use the default. ---- */
const ARC_TEXT=window.ARC_TEXT||{};window.ARC_TEXT=ARC_TEXT;
const ARC_DEF_TXT={start:'{A} starts down a new road.',step:'{A}\'s story moves forward.',pay:'{A}\'s story pays off.',great:'The crowd won\'t forget it.',good:'It landed.',fail:'{A} feels let down. The story went nowhere.'};
function arcLine(a,k){const D=ARCS[a.k];const T=ARC_TEXT[a.k]||{};let t=T[k]!=null?T[k]:D&&D.txt&&D.txt[k]!=null?D.txt[k]:ARC_DEF_TXT[k];if(Array.isArray(t))t=t[(a.have||0)%t.length];
 const nm=id=>id&&S.w[id]?S.w[id].name:'';return String(t||'').replace(/\{A\}/g,nm(a.a)).replace(/\{B\}/g,nm(a.b)||'their partner').replace(/\{C\}/g,nm(a.c)||'')}

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
function aCost(k){const D=ARCS[k];const base=typeof pCost==='function'?pCost():20;return base*(D.lane==='ring'||D.lane==='mic'?2:3)}
function aGrpOf(w){const g=typeof fgOf==='function'?fgOf(w):[];return g.filter(x=>x&&x!=='und')}
function aClash(x,y){return typeof grpPair==='function'&&grpPair(x,y)<0}
function aGood(x,y){return typeof grpPair==='function'&&grpPair(x,y)>=4&&x!==y}
function aStipFor(t){const sb=TRAITS[t]&&TRAITS[t].sb;if(!sb)return null;const l=Object.entries(sb).filter(([k])=>STIPS[k]&&!STIPS[k].ppv&&!STIPS[k].once&&(!STIPS[k].mt||STIPS[k].mt.includes('singles'))).sort((a,b)=>b[1]-a[1]);return l.length?l[0][0]:null}

/* ---- a segment as the arcs see it ---- */
function aSegMatch(m,pos){const sh=typeof curShow==='function'?curShow():{};const win=m.nc?[]:(m.sides[m.winner]||[]);
 return {kind:'match',type:m.type,stip:typeof stipKey==='function'?stipKey(m):(m.stip||'std'),sides:m.sides,ids:m.sides.flat().filter(Boolean),win,fin:typeof finOf==='function'?finOf(m):'clean',pos:pos||'mid',ppv:!!(sh&&sh.ppv),title:m.title||null,nc:!!m.nc}}
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
  d:'Team them with a face friend or partner until the cracks show, then turn on them.',build:'On the same side as {B} (a match, or a promo together)',payoff:'Team with {B} again, and turn on them',
  tell:['Partners','Cracks showing','Breaking point'],
  pick:A=>{if(A.al!=='f')return null;const l=aMates(A.id).map(aW).filter(w=>w&&w.al==='f'&&!w.inj);const B=aBest(l.length?l:aRoster([A.id]).filter(w=>w.al==='f'),w=>aMate(A,w)*3+w.pop/10+(l.includes(w)?50:0));return B?{b:B.id}:null},
  step:(s,a)=>sSame(s,a.a,a.b)||sTog(s,a.a,a.b),pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(typeof pTurn==='function')pTurn(A);else{A.al='h';A.turnW=AW()}A.turnW=AW();bumpHeat(a.a,a.b,a.q==='great'?55:35,[],`${A.name} turned on ${B.name}`);mor(B,-6);n.push(`🔄😈 ${A.name} turns on ${B.name}! ${A.name} is a heel now.`)},
  win:(a,w,q)=>({mic:1,pop:q==='great'?3:1.5})},
 faceturn:{lane:'mic',gets:'Mic, popularity and {B} on their side, as a face',star:1,i:'🛡️',n:'Face Turn',need:3,
  d:'Keep them close to a face until they can\'t stand by any more, then stand with them.',build:'In a segment with {B} (any side)',payoff:'On the same side as {B}: the turn',
  tell:['Watching','Second thoughts','Enough'],
  pick:A=>{if(A.al!=='h')return null;const B=aBest(aRoster([A.id]).filter(w=>w.al==='f'),w=>w.pop+aMate(A,w)*2);return B?{b:B.id}:null},
  step:(s,a)=>s.ids.includes(a.a)&&s.ids.includes(a.b),pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(typeof pTurn==='function')pTurn(A);else A.al='f';A.turnW=AW();const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+2,-5,6);n.push(`🔄🛡️ ${A.name} stands with ${B.name}! ${A.name} is a face now.`)},
  win:(a,w,q)=>({mic:1,pop:q==='great'?3:1.5})},
 betrayal:{lane:'mic',gets:'Mic, popularity and a blood feud with {B}',star:1,i:'🗡️',n:'Betrayal',need:3,
  d:'Two heels on top of the world, until one of them wants it all.',build:'On the same side as {B} (at least one win along the way)',payoff:'Team with {B}, then turn on them',
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
 mouth:{lane:'mic',gets:'Mic for them, popularity for {B}',i:'📣',n:'Mouthpiece',need:3,
  d:'Talk for a partner, and make them look like a killer.',build:'A promo with {B} on a night {B} wins a match',planAll:1,payoff:'{B} wins a singles match in the main event or on a PPV',
  pick:A=>{const l=aRoster([A.id]).filter(w=>w.mic<A.mic-5&&w.ring>=A.ring-10);const B=aBest(l,w=>w.ring+aMate(A,w)*2+(aMates(A.id).includes(w.id)?20:0));return B?{b:B.id}:null},
  step:(s,a)=>{if(sTog(s,a.a,a.b))a.hyP=AW();if(sWon(s,a.b))a.hyW=AW();return a.hyP===AW()&&a.hyW===AW()},pay:(s,a)=>sSingles(s)&&sWon(s,a.b)&&sBig(s),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'singles',side:[a.b],n:1,win:0}]:[{kind:'match',type:'singles',side:[a.b],n:1,win:0,main:1}],
  win:(a,w,q)=>({mic:1.2,bpop:q==='great'?3:1.5,chem:1})},
 mentor:{lane:'ring',gets:'In-ring (more, the bigger the gap), and {B} is happier',i:'🧓',n:'Mentor & Protégé',need:3,
  d:'Learn from a veteran in the ring, then step up against them.',build:'In a match with {B} (either side)',payoff:'A singles match against {B}',
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
  d:'Win over the crowd that doesn\'t get them, then beat its favorite.',build:'A 3★+ match against a {G} wrestler',payoff:'A match against {B}',
  pick:A=>{const g=aGrpOf(A)[0];if(!g)return null;const l=aRoster([A.id]).filter(w=>aGrpOf(w).some(x=>aClash(g,x)));const B=aBest(l,w=>w.pop);return B?{b:B.id,g:aGrpOf(B).find(x=>aClash(g,x))}:null},
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
  d:'Win, win, win, then make a rival tap out in a Submission match.',build:'A win over someone new',payoff:'Win a Submission match against someone they have heat with',
  pick:A=>Array.isArray(A.tr)&&A.tr.length<TR_SLOTS&&!A.tr.includes('subs')&&TRAITS.subs?{t:'subs'}:null,
  step:(s,a)=>{if(!sWon(s,a.a))return false;a.opp=a.opp||[];const o=sOpps(s,a.a).filter(id=>!a.opp.includes(id));if(!o.length)return false;a.opp.push(...o);return true},
  pay:(s,a)=>sWon(s,a.a)&&s.stip==='sub'&&sOpps(s,a.a).some(id=>heatOf(a.a,id)>=10),
  plan:(a,st)=>{const A=aW(a.a);if(st==='build')return [{kind:'match',type:'singles',side:[a.a],n:1,oppF:w=>!(a.opp||[]).includes(w.id),win:0}];
   const o=aBest(aRoster([a.a]).filter(w=>heatOf(a.a,w.id)>=10),w=>heatOf(a.a,w.id));return o?[{kind:'match',type:'singles',vs:[a.a,o.id],stip:'sub',win:0}]:null},
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
  d:'Beat a rival twice, then put their career on the line. The loser retires for good.',build:'A win over {B}',payoff:'A Retirement match against {B}: whoever loses retires',
  pick:A=>{const B=aBest(aRoster([A.id]).filter(w=>heatOf(A.id,w.id)>=20&&w.pop<ARC_STAR&&!isChampW(w)),w=>heatOf(A.id,w.id));return B?{b:B.id}:null},
  step:(s,a)=>sWon(s,a.a)&&sOpps(s,a.a).includes(a.b),pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),
  plan:(a,st)=>[{kind:'match',type:'singles',vs:[a.a,a.b],win:st==='build'?0:null}],
  also:(a,s,n)=>{const lo=s.win.includes(a.a)?a.b:s.win.includes(a.b)?a.a:null;if(lo)arcRetire(aW(lo),n,`${aW(lo).name} lost the Retirement match and walks away from the ring for good.`);if(lo===a.a)a.lost=1},
  win:(a,w,q)=>a.lost?{}:({pop:q==='great'?5:3,heat:1})},
 stakes:{lane:'trait',gets:'Popularity for the winner; the loser pays for it',i:'✂️',n:'Stakes Match',need:2,
  d:'A feud this big needs something on the line: the loser pays for it.',build:'Face {B} (a match or a promo)',payoff:'A singles match against {B} with the stakes on it',
  pick:A=>{const B=aBest(aRoster([A.id]).filter(w=>heatOf(A.id,w.id)>=45),w=>heatOf(A.id,w.id));return B?{b:B.id}:null},
  step:(s,a)=>sVs(s,a.a,a.b)||sTog(s,a.a,a.b),pay:(s,a)=>sSingles(s)&&sVs(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'contract',a:a.a,b:a.b},{kind:'match',type:'singles',vs:[a.a,a.b]}]:[{kind:'match',type:'singles',vs:[a.a,a.b]}],
  also:(a,s,n)=>{const wi=s.win.includes(a.a)?a.a:s.win.includes(a.b)?a.b:null;const lo=wi===a.a?a.b:wi===a.b?a.a:null;if(!lo)return;popx(aW(lo),-4);mor(aW(lo),-6);popx(aW(wi),a.q==='great'?5:3);if(lo===a.a)a.lost=1;n.push(`✂️ ${aW(lo).name} lost, and pays the price.`)},
  win:(a,w,q)=>a.lost?{}:({heat:1})},
 torch:{lane:'star',gets:'A big popularity jump for {B}',i:'🔦',n:'Passing the Torch',need:3,
  d:'Work with a rising wrestler, then put them over clean.',build:'In a match with {B} (either side)',payoff:'{B} beats them clean in a singles match',
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
 farewell:{lane:'star',gets:'A huge payoff, then they retire a legend',i:'🎤',n:'Farewell Run',need:3,last:1,
  d:'One last run of big nights, then a final match, and they retire a legend.',build:'A 3½★+ match in the main event or on a PPV',payoff:'One final match',
  pick:A=>S.season>=2&&A.pop>=88?{}:null,
  step:(s,a)=>s.kind==='match'&&s.ids.includes(a.a)&&sBig(s),min:3.5,pay:(s,a)=>s.kind==='match'&&s.ids.includes(a.a),
  plan:(a,st)=>[{kind:'match',type:'singles',side:[a.a],n:1,main:1}],
  also:(a,s,n)=>{arcRetire(aW(a.a),n,`${aW(a.a).name} says goodbye. A legend retires.`);if(typeof hbLog==='function')try{hbLog('farewell',a.a)}catch(e){}},
  win:()=>({fans:2})}};
for(const k in ARCS)ARCS[k].k=k;window.ARCS=ARCS;window.ARC_STAR=ARC_STAR;window.ARC_SLOTS=ARC_SLOTS;window.ARC_MIN=ARC_MIN;
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
function arcOffer(id){const A=aW(id);if(!A||A.own!=='p')return [];const n=(A.arcN||0);const r=seeded((S.seed||'')+'|arc|'+id+'|'+n);
 const cand=lane=>Object.keys(ARCS).filter(k=>{const D=ARCS[k];return (lane==='star'?D.lane==='star'||D.star:D.lane===lane)}).map(k=>{let p=null;try{p=ARCS[k].pick(A)}catch(e){p=null}return p?Object.assign({k},p):null}).filter(Boolean);
 const pk=l=>l.length?l[Math.floor(r()*l.length)]:null;
 if(aStar(A)){const l=cand('star');const out=[];while(out.length<3&&l.length){const i=Math.floor(r()*l.length);const x=l.splice(i,1)[0];if(x.k==='farewell'&&r()<.7)continue;out.push(x)}return out}
 return ['mic','ring','trait'].map(l=>pk(cand(l))).filter(Boolean)}
window.arcOffer=arcOffer;
function arcCanStart(id){const A=aW(id);if(!A||A.own!=='p'||A.retd)return 'Not on your roster';if(S.phase!=='season')return 'Arcs start once the season is under way';if(arcOf(id))return `${A.name} is already in an arc`;
 if(arcList().filter(a=>aMine(a.a)).length>=ARC_SLOTS)return `You have ${ARC_SLOTS} arcs running. Finish one first`;return ''}
window.arcCanStart=arcCanStart;
function arcWords(o,txt){const nm=id=>id&&aW(id)?aW(id).name:'';const t=(o.t&&TRAITS[o.t])?TRAITS[o.t].n:'';const st=o.stip&&STIPS[o.stip]?STIPS[o.stip].n:'';const g=o.g&&typeof FG_N!=='undefined'?FG_N[o.g]:o.g||'';
 return String(txt||'').replace(/\{B\}/g,nm(o.b)).replace(/\{C\}/g,nm(o.c)).replace(/\{S\}/g,st).replace(/\{G\}/g,g).replace(/\{F\}/g,o.fn||'the faction').replace(/\{T\}/g,t)}
function arcGain(D,A,a){if(aStar(A)&&D.lane!=='star')return 'A bigger payoff, popularity and heat'+(D.k==='heelturn'||D.k==='faceturn'||D.k==='betrayal'?' (and the turn)':'');return arcWords(a||{},D.gets||'')}
function arcStart(id,i){if(typeof mpLocked==='function'&&mpLocked())return;const why=arcCanStart(id);if(why)return toast(why);const o=arcOffer(id)[i];if(!o)return;const D=ARCS[o.k];const c=aCost(o.k);
 if(S.money.p<c)return toast(`This arc costs ${money(c)} up front.`);S.money.p-=c;const A=aW(id);A.arcN=(A.arcN||0)+1;
 const need=D.need2?D.need2({a:id,g:o.g}):D.need;const a=Object.assign({id:'a'+Date.now().toString(36)+Math.floor(Math.random()*999),a:id,start:AW(),end:AW()+need+ARC_SLACK,have:0,need,st:[],stage:'build',star:aStar(A)?1:0,cost:c},o);
 arcList().push(a);news(`📖 ${arcLine(a,'start')} (${D.n})`);save();render();arcOpen(id)}
window.arcStart=arcStart;
function arcDrop(id){const a=arcOf(id);if(!a)return;if(!confirm(`Drop ${aW(id).name}'s ${ARCS[a.k].n} arc? They'll be let down.`))return;arcFail(a,[]);S.arcs=arcList().filter(x=>x!==a);save();render();arcOpen(id)}
window.arcDrop=arcDrop;

/* ---- on the night: the payoff bonus before the rating is set, then progress after it airs ---- */
function arcBonus(a,s){const q=a.st.length?a.st.reduce((x,y)=>x+y,0)/a.st.length:3;let b=ARC_PAY0+clamp((q-3)*ARC_PAYQ,0,ARC_PAYMAX);if(s.ppv)b*=ARC_PAY_PPV;if(a.star||ARCS[a.k].lane==='star')b*=ARC_PAY_STORY;return Math.round(b*100)/100}
function arcPre(s){const out={seg:s,st:0,pay:[]};arcList().forEach(a=>{if(a.stage!=='pay'||a.done||AW()<(a.payFrom||0)||![a.a,a.b,a.c].some(id=>id&&s.ids.includes(id))||!aMine(a.a))return;const D=ARCS[a.k];let ok=false;try{ok=D.pay(s,a)}catch(e){}
  if(ok&&!out.pay.length){out.pay.push(a);out.st+=arcBonus(a,s)}});
 /* the crowd is invested in a story that's building: a little more each step, for a segment with the people in it */
 if(!out.pay.length){let bb=0;arcList().forEach(a=>{if(a.done||a.stage!=='build'||!a.have||!aMine(a.a)||!s.ids.includes(a.a)||a.b&&ARCS[a.k].bstep!==0&&!s.ids.includes(a.b))return;bb=Math.max(bb,ARC_BUILD*a.have)});out.st+=bb}
 s.arcPay=out.pay;return out}
window.arcMatchPre=function(m,mctx){try{const r=arcPre(aSegMatch(m,mctx&&mctx.pos));const h=arcStoryH(r.seg);if(h)ARC_H.set(m,h);return r}catch(e){console.warn('arcs',e);return null}};
/* a running arc is a story the casuals follow, like a feud: its heat grows with each step, and the payoff is a big one */
function arcStoryH(s){let h=0;if(s.arcPay&&s.arcPay.length)return ARC_STORYP;arcList().forEach(a=>{if(a.done||!a.have||!aMine(a.a)||!s.ids.includes(a.a))return;h=Math.max(h,ARC_STORYH[Math.min(a.have,ARC_STORYH.length)-1])});return h}
if(typeof fbSeg==='function'){const _fs=fbSeg;fbSeg=function(m,st,me){const r=_fs.apply(this,arguments);try{const h=ARC_H.get(m);if(h&&r){r.h=Math.max(r.h||0,h);r.arc=h>=ARC_STORYP?2:1}}catch(e){}return r}}
if(typeof fbPromo==='function'){const _fp=fbPromo;fbPromo=function(p){const r=_fp.apply(this,arguments);try{const h=ARC_H.get(p);if(h&&r)r.arc=h>=ARC_STORYP?2:1}catch(e){}return r}}
/* casuals follow your wrestlers' stories on top of the feuds: each arc segment on the card hooks a few more (a payoff counts double) */
if(typeof fbCalc==='function'){const _fc=fbCalc;fbCalc=function(b,segs,show,o){const r=_fc.apply(this,arguments);try{const n=(segs||[]).reduce((x,sg)=>x+(sg&&sg.arc||0),0);if(n&&r&&r.pct&&r.pct.cas!=null){const add=Math.min(ARC_CASCAP,n*ARC_CAS)*(show&&show.ppv?1.5:1);r.pct.cas+=add;r.arcStory=add;if(add>=.75&&r.why)r.why.cas='Hooked on the stories — they want to see where they go'}}catch(e){}return r}}
window.arcPromoPre=function(p){try{const r=arcPre(aSegPromo(p));const h=arcStoryH(r.seg);if(h)ARC_H.set(p,h);return r}catch(e){console.warn('arcs',e);return null}};
/* returns true when a payoff landed */
window.arcPost=function(ap,stars,notes){if(!ap||!ap.seg)return false;const s=ap.seg;let landed=false;
 arcList().slice().forEach(a=>{if(a.done||!aMine(a.a))return;const D=ARCS[a.k];
  if((s.arcPay||[]).includes(a)){a.st.push(stars);landed=true;arcFinish(a,s,stars,notes);return}
  if(a.stage!=='build'||a.lastStep===AW()||!s.ids.includes(a.a)&&!(a.b&&s.ids.includes(a.b)))return;
  let hit=false;try{hit=D.step(s,a)&&stars>=(D.min||ARC_MIN)}catch(e){}
  if(hit){a.have++;a.st.push(stars);a.lastStep=AW();const lab=D.tell&&D.tell[Math.min(a.have-1,D.tell.length-1)];
   notes.push(`📖 ${aW(a.a).name} · ${D.n}: ${lab?lab+' — ':''}step ${a.have} of ${a.need}.${a.have>=a.need&&(!D.ok||D.ok(a))?' The payoff is next.':''}`);
   if(a.have>=a.need&&(!D.ok||D.ok(a))){a.stage='pay';a.payFrom=AW()+1}}});
 S.arcs=arcList().filter(a=>!a.done);return landed};
function arcFinish(a,s,stars,notes){const D=ARCS[a.k];const A=aW(a.a);const q=a.st.reduce((x,y)=>x+y,0)/a.st.length;a.q=q>=ARC_GREAT?'great':'good';a.done=1;
 try{if(D.also)D.also(a,s,notes)}catch(e){console.warn('arc payoff',e)}
 let r={};try{r=D.win(a,A,a.q)||{}}catch(e){console.warn('arc reward',e)}
 const story=a.star||D.lane==='star';const parts=[];
 if(!story&&r.ring&&A.own){const g=trainGain(A.ring)*(a.q==='great'?ARC_G2:ARC_G1)*r.ring;const v0=A.ring;addR(A,g);if(A.ring>v0)parts.push(`In-ring +${Math.round((A.ring-v0)*10)/10}`)}
 if(!story&&r.mic&&A.own){const g=trainGain(A.mic,1)*(a.q==='great'?ARC_G2:ARC_G1)*r.mic;const v0=A.mic;addM(A,g);if(A.mic>v0)parts.push(`Mic +${Math.round((A.mic-v0)*10)/10}`)}
 const pop=(r.pop||0)+(story?(a.q==='great'?2:1):0);if(pop&&A.own){popx(A,pop);parts.push(`popularity +${pop}`)}
 if(r.bpop&&a.b&&aW(a.b)){popx(aW(a.b),r.bpop);parts.push(`${aW(a.b).name} popularity +${r.bpop}`)}
 if(r.chem&&a.b){const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+r.chem,-5,6)}
 if(r.trait&&TRAITS[r.trait])parts.push(`${TRAITS[r.trait].i} ${TRAITS[r.trait].n}`);if(r.trq&&TRAITS[r.trq])parts.push(`${TRAITS[r.trq].i} ${TRAITS[r.trq].n} is first in line for their next trait slot`);
 if(r.fg2&&typeof FG_N!=='undefined')parts.push(`a second crowd: ${FG_N[r.fg2]}`);if(r.fgh&&typeof FG_N!=='undefined')parts.push(`halfway to winning over ${FG_N[r.fgh]}`);
 if(r.grp&&typeof fbHit==='function'&&A.own){try{fbHit('p',[A],Math.round(ARC_FANS*.6))}catch(e){}}
 if(A.own)mor(A,a.q==='great'?10:6);
 {const f=Math.round(ARC_FANS*(r.fans||1)*(a.q==='great'?1.3:1)*(typeof fanGrowF==='function'?fanGrowF(S.fans.p)/100:1)/100)*100;if(f>0){const ws=[A,a.b&&aW(a.b)].filter(w=>w&&w.own==='p');try{if(typeof fbHit==='function'&&ws.length)fbHit('p',ws,f);else S.fans.p+=f}catch(e){S.fans.p+=f}parts.push(`+${fmtFans(f)} fans`)}}
 S.arcLog=(S.arcLog||[]).concat([{w:AW(),k:a.k,a:a.a,b:a.b||null,q:a.q}]).slice(-40);S.arcDone=(S.arcDone||0)+1;if(a.q==='great')S.arcGreatN=(S.arcGreatN||0)+1;
 notes.push(`📖✅ ${arcLine(a,'pay')} ${arcLine(a,a.q)} ${D.n} ${a.q==='great'?'— a great payoff':'paid off'}${parts.length?': '+parts.join(', '):''}.`);
 news(`📖 ${A.name}'s ${D.n} paid off${a.q==='great'?' in a big way':''}.`)}
function arcFail(a,notes){S.arcFailN=(S.arcFailN||0)+1;S.arcFailK=S.arcFailK||{};const fk=a.k+':'+a.stage+':'+a.have;S.arcFailK[fk]=(S.arcFailK[fk]||0)+1;const A=aW(a.a);if(A&&A.own==='p'){mor(A,-(a.star?ARC_FAIL+2:ARC_FAIL));if(a.b&&aW(a.b)&&aW(a.b).own==='p')mor(aW(a.b),-4)}a.done=1;const t=`📖❌ ${arcLine(a,'fail')} (${ARCS[a.k].n})`;news(t);(notes||[]).push(t);S.arcNews=(S.arcNews||[]).concat([{w:AW(),t}]).slice(-8)}
/* the deadline, and arcs whose people are gone: checked when a show is about to air */
function arcTick(){if(!S||!Array.isArray(S.arcs))return;S.arcs=S.arcs.filter(a=>{if(a.done)return false;const A=aW(a.a);if(!A||A.own!=='p')return false;
  if(a.gone||[a.b,a.c].some(id=>id&&(!aW(id)||aW(id).own!=='p'))){a.done=1;news(`📖 ${A.name}'s ${ARCS[a.k].n} arc ends — someone in it is gone.`);return false}
  if(AW()>a.end){arcFail(a,[]);return false}return true})}
window.arcTick=arcTick;
if(typeof airPair==='function'){const _ap=airPair;airPair=function(){try{if(typeof bothSides==='function')bothSides(arcTick);else arcTick()}catch(e){console.warn('arcs',e)}return _ap.apply(this,arguments)}}

/* ---- what to book: a slot filled straight from the arc (the Book it button and the sweep bot) ---- */
function arcPlan(a){const D=ARCS[a.k];if(!D||!D.plan||a.done)return null;try{return D.plan(a,a.stage)}catch(e){return null}}
window.arcPlan=arcPlan;
function arcUsed(c){const u=new Set();c.forEach(sl=>{if(!sl||!sl.d)return;if(sl.k==='match')sl.d.sides.flat().forEach(id=>u.add(id));if(sl.k==='promo'){u.add(sl.d.a);if(sl.d.b)u.add(sl.d.b)}});return u}
function arcFit(id){const w=aW(id);return !!(w&&!w.inj&&w.own==='p'&&(typeof sta!=='function'||typeof FAT_RISK==='undefined'||sta(w)>=100-FAT_RISK))}
/* the opponents a good booker would pick: the best projected match among the likeliest names */
function aCombos(l,n){if(n===1)return l.map(x=>[x]);const out=[];const go=(st,acc)=>{if(acc.length===n){out.push(acc.slice());return}for(let i=st;i<l.length;i++){acc.push(l[i]);go(i+1,acc);acc.pop()}};go(0,[]);return out}
function aPickOpp(core,pool,n,p,sh){const top=pool.slice(0,n===1?14:n===2?8:6);if(top.length<n)return null;const type=n===1?'singles':n===2?'tag':'trios';let best=null,bv=-1e9;
 aCombos(top,n).forEach(cb=>{const ids=cb.map(w=>w.id);const m={type,stip:p.stip||'std',sides:[core.slice(),ids],winner:p.win!=null?p.win:0,title:''};let v;try{v=rateMatch(m,{ppv:sh&&sh.ppv,preview:true}).raw}catch(e){v=cb.reduce((x,w)=>x+w.pop,0)/n}if(v>bv){bv=v;best=ids}});return best}
/* fill one open slot with the arc's next segment; returns the slot index or -1 */
function arcFill(a,c,opt){opt=opt||{};const l=arcPlan(a);if(!l)return -1;const used=arcUsed(c);const sh=curShow();
 for(const p of l){if(p.ppv&&!sh.ppv)continue;
  if(p.kind==='promo'){const i=c.findIndex(sl=>sl&&sl.k==='promo'&&!sl.d);if(i<0)continue;if([p.a,p.b].some(id=>id&&(used.has(id)||!aW(id)||aW(id).inj||aW(id).own!=='p')))continue;c[i].d={type:PT[p.type]?p.type:'callout',a:p.a,b:p.b||null,played:false};return i}
  const ms=c.map((sl,i)=>sl&&sl.k==='match'&&!sl.opt?i:-1).filter(i=>i>=0);const main=ms[ms.length-1];const open=ms.filter(i=>!c[i].d);if(!open.length)continue;
  let i=p.main?(open.includes(main)?main:-1):(open.filter(x=>x!==main)[0]!=null?open.filter(x=>x!==main)[0]:open[0]);if(i<0)continue;
  let sides;const core=p.vs?p.vs.slice():p.side.slice();if(core.some(id=>used.has(id)||!arcFit(id)))continue;
  if(p.vs)sides=[[p.vs[0]],[p.vs[1]]];
  else{const n=p.n||1;const g=aW(core[0]).g;const pool=aRoster(core).filter(w=>!used.has(w.id)&&arcFit(w.id)&&!core.includes(w.id)&&w.g===g&&!arcIn(w.id)&&!(c.some(sl=>sl&&sl.d&&sl.k==='match'&&sl.d.sides.flat().includes(w.id)))).sort((x,y)=>y.pop-x.pop);
   const opp=aPickOpp(core,(p.oppF?pool.filter(p.oppF):pool),n,p,sh);if(!opp)continue;sides=[core,opp]}
  const type=sides[0].length===1&&sides[1].length===1?'singles':sides[0].length===2?'tag':sides[0].length===3?'trios':p.type;
  let title=p.title||'';if(title&&!(typeof eligibleTitles!=='function'||eligibleTitles({type,sides}).includes(title)))title='';
  const win=p.win!=null?p.win:(()=>{let bi=0,bv=-1e9;sides.forEach((sd,k)=>{const v=sd.reduce((x,id)=>x+aW(id).pop,0)/sd.length;if(v>bv){bv=v;bi=k}});return bi})();
  c[i].d={type,stip:p.stip||'std',sides,winner:win,title};if(p.fin)c[i].d.fin=p.fin;
  try{if(typeof finWhy==='function'&&c[i].d.fin&&finWhy(c[i].d,c[i].d.fin))delete c[i].d.fin}catch(e){}return i}
 return -1}
/* an arc whose step needs two segments the same night (planAll) books them all, or none */
const _af1=arcFill;function arcFillAll(a,c,opt){const D=ARCS[a.k];if(!D.planAll||a.stage!=='build')return _af1(a,c,opt);const l=arcPlan(a);if(!l)return -1;const keep=c.map(sl=>sl&&sl.d);let first=-1;
 for(let k=0;k<l.length;k++){const one=Object.assign({},a);const sv=D.plan;let r;try{D.plan=()=>[l[k]];r=_af1(a,c,opt)}finally{D.plan=sv}if(r<0){c.forEach((sl,i)=>{if(sl)sl.d=keep[i]});return -1}if(first<0)first=r}return first}
window.arcFill=arcFillAll;
window.arcBook=function(id){if(typeof mpLocked==='function'&&mpLocked())return;const a=arcOf(id);if(!a)return;const i=arcFillAll(a,S.card.p);if(i<0)return toast('No open slot fits it — clear a slot, or book it yourself from the steps.');try{closeModal()}catch(e){}save();render();toast(`📖 Booked: ${ARCS[a.k].n} for ${aW(id).name}. Change anything you like.`)};

/* ---- the progress display ---- */
function arcDots(a){const D=ARCS[a.k];let h='';for(let i=0;i<a.need;i++)h+=`<i class="ad ${i<a.have?'on':''}">${i<a.have?'●':'○'}</i>`;return h+`<i class="ad pay ${a.stage==='pay'?'on':''}">★</i>`}
function arcNow(a){const D=ARCS[a.k];const o=a;if(a.stage==='pay')return AW()<(a.payFrom||0)?'Payoff next week':`Payoff: ${arcWords(o,D.payoff)}`;
 const lab=D.tell&&D.tell[Math.min(a.have,D.tell.length-1)];return `${lab?lab+' · ':''}Next: ${arcWords(o,D.build)}${D.min&&!/★/.test(D.build)?` (${D.min}★+)`:''}`}
function arcLeft(a){const l=a.end-AW()+1;return l<=1?'<b class="bad">Last week</b>':`${l} weeks left`}
function arcRowHtml(a,tap){const D=ARCS[a.k];const A=aW(a.a);return `<div class="arcrow"${tap?` onclick="showW('${a.a}')"`:''}><div class="row sb"><span><b>${D.i} ${esc(D.n)}</b>${tap?` · ${esc(A.name)}`:''}</span><span class="arcdots">${arcDots(a)}</span></div><div class="muted tiny">${esc(arcNow(a))} · ${arcLeft(a)}</div></div>`}
window.arcRowHtml=arcRowHtml;
/* the profile's Arc row */
window.arcProfile=function(w){if(!w||w.own!=='p')return '';const a=arcOf(w.id);
 if(a)return `<div class="pf-row pf-arc tap" onclick="arcOpen('${w.id}')"><span class="pf-l">📖 Arc</span><div class="pf-s">${arcRowHtml(a)}</div></div>`;
 const part=arcList().find(x=>x.b===w.id||x.c===w.id);if(part)return `<div class="pf-row"><span class="pf-l">📖 Arc</span><span class="pf-v">In ${esc(aW(part.a).name)}'s ${esc(ARCS[part.k].n)}</span></div>`;
 const why=arcCanStart(w.id);return `<div class="pf-row"><span class="pf-l">📖 Arc</span><span class="pf-v">${why?`<small>${esc(why)}</small>`:`<button class="pf-tg" onclick="arcOpen('${w.id}')">Start an arc</button>`}</span></div>`};
function arcOpen(id){const A=aW(id);if(!A)return;const a=arcOf(id);
 if(a){const D=ARCS[a.k];const pl=arcPlan(a);const can=pl&&S.card&&S.card.p&&S.phase==='season';
  return openModal(`<div class="h mhd">${D.i} ${esc(A.name)} · ${esc(D.n)}</div><p class="muted" style="margin-top:0">${esc(arcWords(a,D.d))}</p>
  <div class="arcbig">${arcDots(a)}</div>
  <div class="brow"><b>${a.stage==='pay'?'The payoff':'Build'}</b><br><span class="muted tiny">${esc(a.stage==='pay'?arcWords(a,D.payoff):arcWords(a,D.build))}${a.stage==='build'&&!/★/.test(D.build)?` · ${D.min||ARC_MIN}★ or better`:''}</span></div>
  ${a.stage==='build'?`<div class="brow"><b>Then the payoff</b><br><span class="muted tiny">${esc(arcWords(a,D.payoff))}</span></div>`:''}
  <div class="brow"><b>What they get</b><br><span class="muted tiny">${esc(arcGain(D,A,a))}. A better build makes a bigger payoff.</span></div>
  <div class="muted tiny" style="margin:6px 0">${arcLeft(a).replace(/<[^>]+>/g,'')} · miss it and ${esc(A.name)} is let down.</div>
  ${can?`<button class="btn" onclick="arcBook('${id}')">Book ${a.stage==='pay'?'the payoff':'the next step'} tonight</button>`:''}
  <button class="btn ghost" onclick="arcDrop('${id}')">Drop the arc</button><button class="btn sec" onclick="showW('${id}')">Back</button>`)}
 const why=arcCanStart(id);if(why){toast(why);return}
 const o=arcOffer(id);if(!o.length)return openModal(`<div class="h mhd">📖 ${esc(A.name)}</div><p class="muted">No arc fits ${esc(A.name)} right now.</p><button class="btn sec" onclick="showW('${id}')">Back</button>`);
 openModal(`<div class="h mhd">📖 An arc for ${esc(A.name)}</div><p class="muted" style="margin-top:0">${aStar(A)?`A superstar's arc is all story: a bigger payoff, popularity and heat.`:'Pick a road. Pay now, book the build, then land the payoff.'} ${ARC_SLOTS} arcs can run at once.</p>
 ${o.map((x,i)=>{const D=ARCS[x.k];const c=aCost(x.k);return `<button class="choice" ${S.money.p<c?'disabled':''} onclick="arcStart('${id}',${i})"><span class="key"><span>${'ABC'[i]}</span></span><div><div>${D.i} <b>${esc(D.n)}</b> <span class="muted tiny">· ${ARC_LANES[aStar(A)?'star':D.lane]} · ${money(c)}</span></div>
  <div class="muted tiny">${esc(arcWords(x,D.d))}<br><b>Build, ${D.need2?D.need2({a:id,g:x.g}):D.need} times:</b> ${esc(arcWords(x,D.build))}<br><b>Payoff:</b> ${esc(arcWords(x,D.payoff))}<br><b>They get:</b> ${esc(arcGain(D,A,x))}</div></div></button>`}).join('')}
 <button class="btn sec" onclick="showW('${id}')">Not now</button>`)}
window.arcOpen=arcOpen;
/* the Office card */
window.arcOfficeCard=function(){const l=arcList().filter(a=>aMine(a.a));const last=(S.arcNews||[]).filter(n=>AW()-n.w<=1);
 return `<div class="card"><div class="h small">📖 Arcs (${l.length}/${ARC_SLOTS})</div>${l.map(a=>arcRowHtml(a,1)).join('')||'<div class="muted">Open a wrestler on your roster and tap Start an arc.</div>'}${last.map(n=>`<div class="muted tiny">${esc(n.t)}</div>`).join('')}</div>`};

/* ---- the Book screen checklist: each arc's next step ---- */
if(typeof attnItems==='function'){const _ai=attnItems;attnItems=function(){const out=_ai.apply(this,arguments);try{if(!S||S.phase!=='season')return out;const c=(S.card&&S.card.p)||[];
 arcList().filter(a=>aMine(a.a)&&!a.done).forEach(a=>{const D=ARCS[a.k];const A=aW(a.a);if(A.inj)return;const pay=a.stage==='pay'&&AW()>=(a.payFrom||0);if(a.stage==='pay'&&!pay)return;
  const left=a.end-AW()+1;const ids=[a.a,a.b,a.c].filter(Boolean);
  const on=c.some(sl=>sl&&sl.d&&(sl.k==='match'?sl.d.sides.flat().includes(a.a):sl.k==='promo'&&(sl.d.a===a.a||sl.d.b===a.a)));
  out.push({id:'arc'+a.id,g:left<=1?'must':'chance',i:D.i,h:`${A.name} · ${D.n}: ${pay?'the payoff':`step ${a.have+1} of ${a.need}`}`,d:`${arcWords(a,pay?D.payoff:D.build)}. ${left<=1?'Last week — miss it and they\'re let down.':`${left} weeks left.`}`,
   s:on?['ok','On the card']:[left<=1?'b':'w','Not on the card'],a:on?null:['Book it',`arcBook('${a.a}')`,left<=1?1:0],gate:false,who:ids,where:'📖 Their arc',
   chip:i=>{const d=c[i]&&c[i].d;if(!d)return null;const ws=c[i].k==='match'?d.sides.flat():[d.a,d.b];return ws.includes(a.a)?['ok',pay?`${D.n}: the payoff`:`${D.n}: step ${a.have+1}`]:null}})})}catch(e){console.warn('arc checklist',e)}return out};window.attnItems=attnItems}

/* ---- old saves: the Performance Center closes; nobody's mid-arc ---- */
function arcMigrate(st){if(!st)return;if(!Array.isArray(st.arcs))st.arcs=[];if(Array.isArray(st.training)&&st.training.length)st.training=[]}
window.arcMigrate=arcMigrate;
/* ---- looks ---- */
{const st=document.createElement('style');st.textContent=`.arcrow{padding:6px 0;border-top:1px solid rgba(255,255,255,.08)}.arcrow:first-of-type{border-top:0}
.arcdots{white-space:nowrap;letter-spacing:2px}.ad{font-style:normal;color:rgba(255,255,255,.35)}.ad.on{color:var(--gold)}.ad.pay{margin-left:4px}.ad.pay.on{color:var(--gold);text-shadow:0 0 6px rgba(255,200,0,.5)}
.arcbig{font-size:26px;letter-spacing:6px;margin:6px 0 10px}.pf-arc .pf-s{width:100%}`;document.head.appendChild(st)}
})();
