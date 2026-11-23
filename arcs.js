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
function arcLine(a,k){const D=aD(a);const T=ARC_TEXT[a.k]||{};let t=T[k]!=null?T[k]:D&&D.txt&&D.txt[k]!=null?D.txt[k]:ARC_DEF_TXT[k];if(Array.isArray(t))t=t[(a.have||0)%t.length];
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
function aCost(k){const D=aDK(k);const base=typeof pCost==='function'?pCost():20;return base*(D.lane==='ring'||D.lane==='mic'?2:3)}
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
  d:'Team them with a face friend or partner until the cracks show, then turn on them.',build:'On the same side as {B} (a match, or a promo together)',payoff:'Team with {B} again, and turn on them',
  tell:['Partners','Cracks showing','Breaking point'],
  pick:A=>{if(A.al!=='f')return null;const l=aMates(A.id).map(aW).filter(w=>w&&w.al==='f'&&!w.inj);const B=aBest(l.length?l:aRoster([A.id]).filter(w=>w.al==='f'),w=>aMate(A,w)*3+w.pop/10+(l.includes(w)?50:0));return B?{b:B.id}:null},
  step:(s,a)=>sSame(s,a.a,a.b)||sTog(s,a.a,a.b),pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(A.al==='f'){if(typeof pTurn==='function')pTurn(A);else A.al='h'}A.turnW=AW();bumpHeat(a.a,a.b,a.q==='great'?55:35,[],`${A.name} turned on ${B.name}`);mor(B,-6);n.push(`🔄😈 ${A.name} turns on ${B.name}! ${A.name} is a heel now.`)},
  win:(a,w,q)=>({mic:1,pop:q==='great'?3:1.5})},
 faceturn:{lane:'mic',gets:'Mic, popularity and {B} on their side, as a face',star:1,i:'🛡️',n:'Face Turn',need:3,
  d:'Keep them close to a face until they can\'t stand by any more, then stand with them.',build:'In a segment with {B} (any side)',payoff:'On the same side as {B}: the turn',
  tell:['Watching','Second thoughts','Enough'],
  pick:A=>{if(A.al!=='h')return null;const B=aBest(aRoster([A.id]).filter(w=>w.al==='f'),w=>w.pop+aMate(A,w)*2);return B?{b:B.id}:null},
  step:(s,a)=>s.ids.includes(a.a)&&s.ids.includes(a.b),pay:(s,a)=>sSame(s,a.a,a.b),
  plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'tag',side:[a.a,a.b],n:2}],
  also:(a,s,n)=>{const A=aW(a.a),B=aW(a.b);if(A.al==='h'){if(typeof pTurn==='function')pTurn(A);else A.al='f'}A.turnW=AW();const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+2,-5,6);n.push(`🔄🛡️ ${A.name} stands with ${B.name}! ${A.name} is a face now.`)},
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
  win:()=>({fans:2})},
 /* ---- v427: more arcs, so a season's board has room (each runs once a season) ---- */
 shoot:{lane:'mic',star:1,i:'💣',n:'Shoot Promo',need:2,min:3.5,gets:'Mic, popularity and heat with {B}',
  d:'Blur the line on the mic until the whole building believes it, then aim it at their rival.',build:'A promo at 3½★+',payoff:'A promo against {B}',
  pick:A=>{if(A.mic<60)return null;const B=aBest(aRoster([A.id]).filter(w=>heatOf(A.id,w.id)>=20),w=>heatOf(A.id,w.id));return B?{b:B.id}:null},bstep:0,
  step:(s,a)=>s.kind==='promo'&&s.ids.includes(a.a),pay:(s,a)=>sTog(s,a.a,a.b),
  plan:(a,st)=>[{kind:'promo',type:'callout',a:a.a,b:a.b}],
  also:(a,s,n)=>{const last=a.st[a.st.length-1]||3;bumpHeat(a.a,a.b,a.q==='great'?20:12,[],`${aW(a.a).name} went off-script`);if(last<2){popx(aW(a.a),-3);a.bomb=1;n.push(`💣 ${aW(a.a).name}'s shoot promo bombed.`)}},
  win:(a,w,q)=>a.bomb?{mic:.5}:({mic:1.3,pop:q==='great'?3:1})},
 cult:{lane:'mic',i:'🕯️',n:'Cult of Personality',need:3,gets:'A faction they lead, and Mic',
  d:'Talk people into following them, one promo at a time.',build:'A promo with someone new (a follower)',payoff:'A Faction Rally with one of the followers',bstep:0,
  pick:A=>A.mic>=65&&!aTeams(A.id).some(t=>t.type==='faction')?{}:null,
  step:(s,a)=>{if(s.kind!=='promo'||!s.b||!s.ids.includes(a.a))return false;const o=s.a===a.a?s.b:s.a;a.opp=a.opp||[];if(a.opp.includes(o))return false;a.opp.push(o);return true},
  pay:(s,a)=>s.kind==='promo'&&s.type==='rally'&&s.ids.includes(a.a)&&(a.opp||[]).some(id=>s.ids.includes(id)),
  plan:(a,st)=>{if(st==='pay'){const f=(a.opp||[]).find(id=>aMine(id)&&!aW(id).inj);return f?[{kind:'promo',type:'rally',a:a.a,b:f}]:null}const A=aW(a.a);const o=aBest(aRoster([a.a]).filter(w=>!(a.opp||[]).includes(w.id)&&w.al===A.al&&w.pop<A.pop),w=>w.pop+aMate(A,w)*3);return o?[{kind:'promo',type:'rally',a:a.a,b:o.id}]:null},
  also:(a,s,n)=>{const m=[a.a].concat((a.opp||[]).filter(aMine).slice(0,2));if(m.length<3)return;const nm=`${aLast(aW(a.a))}'s following`;S.teams=S.teams||[];S.teams.push({id:'t'+(typeof partyNid==='function'?partyNid():S.nid++),n:nm,type:'faction',m});
   for(let i=0;i<m.length;i++)for(let j=i+1;j<m.length;j++){const k=key(m[i],m[j]);S.chem[k]=clamp((S.chem[k]||0)+(a.q==='great'?2:1),-5,6)}n.push(`🕯️ ${nm} is born.`)},
  win:(a,w,q)=>({mic:1})},
 redemption:{lane:'mic',i:'🌅',n:'Redemption Road',need:3,gets:'Mic, popularity and a big morale lift',
  d:'Own the slump on the mic, then win their way back.',build:'First a promo owning it, then wins',payoff:'A win in the main event',
  pick:A=>A.mor<55?{}:null,
  step:(s,a)=>(a.have||0)===0?s.kind==='promo'&&s.ids.includes(a.a):sWon(s,a.a),pay:(s,a)=>sWon(s,a.a)&&s.pos==='me',
  plan:(a,st)=>st==='build'&&!(a.have||0)?[{kind:'promo',type:'interview',a:a.a}]:[{kind:'match',type:'singles',side:[a.a],n:1,win:0,main:st==='pay'?1:0}],
  also:(a)=>{mor(aW(a.a),a.q==='great'?15:10)},win:(a,w,q)=>({mic:1,pop:q==='great'?2:1})},
 champvoice:{lane:'mic',star:1,i:'🎙️',n:"Champion's Voice",need:3,min:3,gets:'Mic, title prestige and popularity',
  d:'A champion who talks like one, then defends like one on the big stage.',build:"A Champion's Address at 3★+",payoff:'A title defense on a PPV',
  pick:A=>{const t=Object.values(S.titles||{}).find(t=>t.holders.includes(A.id));return t?{t2:t.id}:null},
  step:(s,a)=>s.kind==='promo'&&s.type==='champ'&&s.a===a.a,pay:(s,a)=>s.ppv&&s.title===a.t2&&s.ids.includes(a.a),
  plan:(a,st)=>{if(st==='build')return [{kind:'promo',type:'champ',a:a.a}];const t=S.titles[a.t2];if(!t||!t.holders.includes(a.a))return null;return [{kind:'match',type:'singles',side:t.holders.slice(),n:t.holders.length,title:a.t2,ppv:1,win:0}]},
  also:(a)=>{const t=S.titles[a.t2];if(t)t.prestige=(t.prestige||0)+(a.q==='great'?5:3)},win:(a,w,q)=>({mic:1,pop:q==='great'?2:1})},
 streak:{lane:'ring',i:'🔥',n:'Undefeated Streak',need:4,gets:'In-ring and popularity',
  d:'Win and keep winning. One loss and the streak starts over.',build:'A win (a loss starts it over)',payoff:'A main event or PPV win over someone more popular',
  pick:A=>({}),
  step:(s,a)=>{if(sLost(s,a.a)){a.have=0;a.st=[];return false}return sWon(s,a.a)},pay:(s,a)=>sWon(s,a.a)&&sBig(s)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>aW(a.a).pop),
  plan:(a,st)=>{const A=aW(a.a);return [{kind:'match',type:'singles',side:[a.a],n:1,win:0,main:st==='pay'&&!curShow().ppv?1:0,oppF:st==='pay'?w=>w.pop>A.pop:w=>w.pop<=A.pop+5}]},
  win:(a,w,q)=>({ring:1,pop:q==='great'?4:2})},
 comeback:{lane:'ring',i:'🩹',n:'Comeback',need:2,min:3,gets:'In-ring, popularity and a big morale lift',
  d:'Back from injury, and better than ever.',build:'A 3★+ match',payoff:'A PPV win',
  pick:A=>S.injSeen&&S.injSeen[A.id]!=null&&AW()-S.injSeen[A.id]<=6&&!A.inj?{}:null,
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
  pick:A=>{const tw=Object.keys(S.tagW||{}).filter(k=>k.split('|').includes(A.id)).map(k=>k.split('|').find(x=>x!==A.id));const fr=typeof fgKnown==='function'?fgKnown(A).map(o=>o.id):[];
   const l=[...new Set(tw.concat(fr))].filter(id=>aMine(id)&&!inTeam(A.id,id)&&!aW(id).inj);const B=aBest(l.map(aW),w=>w.pop);return B?{b:B.id}:null},
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
  also:(a,s,n)=>{const w=aW(a.a);w.rbArc=AW();w.rbDue=1;n.push(`🎭 ${w.name} debuts a whole new character. Open their profile to name it.`)},
  win:(a,w,q)=>({mic:.8,pop:q==='great'?6:3})},
 lastchase:{lane:'star',i:'⏳',n:'Last Chase',need:3,gets:'A huge payoff and popularity',
  d:'A veteran superstar\'s last run at the gold.',build:'A win over someone 80+ popularity',payoff:'A title match on a PPV',
  pick:A=>S.season>=2&&Object.values(S.titles||{}).some(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length&&!t.holders.includes(A.id))?{}:null,
  step:(s,a)=>sWon(s,a.a)&&sOpps(s,a.a).some(id=>aW(id)&&aW(id).pop>=80),pay:(s,a)=>s.ppv&&!!s.title&&s.ids.includes(a.a),
  plan:(a,st)=>{const A=aW(a.a);if(st==='build')return [{kind:'match',type:'singles',side:[a.a],n:1,win:0,oppF:w=>w.pop>=80}];const t=Object.values(S.titles).find(t=>t.kind==='singles'&&t.g===A.g&&t.holders.length===1&&aMine(t.holders[0])&&!aW(t.holders[0]).inj&&t.holders[0]!==a.a);return t?[{kind:'match',type:'singles',vs:[t.holders[0],a.a],title:t.id,ppv:1}]:null},
  win:(a,w,q)=>({pop:q==='great'?2:1})},
 passtitle:{lane:'star',i:'🏅',n:'Passing the Title',need:3,gets:'A champion is made: a big popularity jump for {B}',
  d:'A champion superstar builds up their successor, then hands them the belt.',build:'In a segment with {B}',payoff:'{B} wins the title from them, clean',
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
};
for(const k in ARCS)ARCS[k].k=k;window.ARCS=ARCS;window.ARC_STAR=ARC_STAR;window.ARC_SLOTS=ARC_SLOTS;window.ARC_MIN=ARC_MIN;
/* ---- variants: the big story arcs come in 2–3 versions, and each new game deals one (same name and reward, a different road) ---- */
const ARC_VARS={
 heelturn:[{vn:'Partners'},
  {vn:'The Rally',payoff:'A promo with {B} that ends in the turn',pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'promo',type:'attack',a:a.a,b:a.b}]},
  {vn:'Costly Run-in',payoff:'Run in on {B}\'s match and cost them it',pay:(s,a)=>s.rix===a.a&&s.rit===a.b&&(s.rik==='cost'||s.rik==='attack'),
   plan:(a,st)=>st==='build'?[{kind:'promo',type:'rally',a:a.a,b:a.b},{kind:'match',type:'tag',side:[a.a,a.b],n:2}]:[{kind:'match',type:'singles',side:[a.b],n:1,win:1,ri:{x:a.a,t:a.b,k:'cost',turn:true}}]}],
 faceturn:[{vn:'Side by Side'},
  {vn:'The Save',payoff:'Run in and save {B} from a heel',pay:(s,a)=>s.rix===a.a&&s.rik==='save'&&s.ids.includes(a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'match',type:'singles',side:[a.b],n:1,oppF:w=>w.al==='h'&&w.id!==a.a,ri:{x:a.a,t:'$opp',k:'save',turn:true}}]},
  {vn:'The Apology',payoff:'A promo with {B}: the apology, and the turn',pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'singles',vs:[a.a,a.b]},{kind:'promo',type:'callout',a:a.a,b:a.b}]:[{kind:'promo',type:'interview',a:a.a,b:a.b}]}],
 betrayal:[{vn:'After the Bell'},
  {vn:'Ambush',payoff:'A promo with {B} that ends in an ambush',pay:(s,a)=>sTog(s,a.a,a.b),
   plan:(a,st)=>st==='build'?[{kind:'match',type:'tag',side:[a.a,a.b],n:2,win:!(a.wins||0)?0:null}]:[{kind:'promo',type:'attack',a:a.a,b:a.b}]},
  {vn:'Costs Them the Big One',payoff:'Run in on {B}\'s PPV match and cost them it',pay:(s,a)=>s.ppv&&s.rix===a.a&&s.rit===a.b&&s.rik==='cost',
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
 reunion:[{vn:'Back Together'},
  {vn:'Back for Gold',payoff:'A tag title match together',pay:(s,a)=>sSame(s,a.a,a.b)&&!!s.title,
   plan:(a,st)=>{if(st==='build')return ARCS.reunion.plan(a,st);const A=aW(a.a);const t=Object.values(S.titles||{}).find(t=>t.kind!=='singles'&&t.holders.length===2&&t.holders.every(id=>aMine(id)&&!aW(id).inj)&&!t.holders.includes(a.a)&&!t.holders.includes(a.b));
    return t?[{kind:'match',type:'tag',vs2:[[a.a,a.b],t.holders.slice()],title:t.id}]:null}}]};
window.ARC_VARS=ARC_VARS;
function aVarOf(k){const l=ARC_VARS[k];if(!l||l.length<2)return 0;S.arcVar=S.arcVar||{};if(S.arcVar[k]==null)S.arcVar[k]=Math.floor(seeded((S.seed||'')+'|arcv|'+k)()*l.length);return S.arcVar[k]}
function aDK(k,v){const D=ARCS[k];if(!D)return D;const V=(ARC_VARS[k]||[])[v!=null?v:aVarOf(k)];return V?Object.assign({},D,V):D}
function aD(a){return aDK(a.k,a.v)}
window.aDK=aDK;
const aName=(k,v)=>{const D=aDK(k,v);return D?D.n+(D.vn&&ARC_VARS[k]&&ARC_VARS[k].length>1?` · ${D.vn}`:''):''};

/* ---- the board is dealt fresh every game: a core that's always there, story-locked arcs pinned to their milestone,
   and everything else shuffled across the open slots ---- */
const ARC_CORE=['heelturn','faceturn','mentor','team','voice','torch'];
const ARC_PIN=['betrayal','stakes','faction','join','fightchamp','retire','champvoice','passtitle','farewell','lastchase','invasion'];
function arcBoard(){if(S.arcBoard&&Object.keys(S.arcBoard).length===Object.keys(ARC_UNLOCK).length)return S.arcBoard;
 const B={};const fixed=new Set(ARC_CORE.concat(ARC_PIN));const slots=[],free=[];
 Object.keys(ARC_UNLOCK).forEach(k=>{if(fixed.has(k))B[k]=ARC_UNLOCK[k];else{slots.push(ARC_UNLOCK[k]);free.push(k)}});
 const r=seeded((S.seed||'')+'|arcboard');for(let i=free.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[free[i],free[j]]=[free[j],free[i]]}
 free.forEach((k,i)=>B[k]=slots[i]);return (S.arcBoard=B)}
window.arcBoard=arcBoard;

/* ---- hidden fits: everyone is secretly made for one arc. Run it with them and the payoff is bigger and they get more out of it;
   it's found for good once it pays off ---- */
const ARC_FIT=1.5;
function arcFitOf(w){if(!w)return null;S.arcFit=S.arcFit||{};if(S.arcFit[w.id]===undefined){const l=Object.keys(ARCS).filter(k=>ARCS[k].lane!=='star');S.arcFit[w.id]=l[Math.floor(seeded((S.seed||'')+'|arcfit|'+w.id)()*l.length)]}return S.arcFit[w.id]}
const arcFitKnown=w=>!!(w&&S.arcFitK&&S.arcFitK[w.id]);
window.arcFitOf=arcFitOf;
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
/* ---- the board: arcs unlock through milestones and the venue ladder; each runs once a season across the roster ---- */
const ARC_UNLOCK={heelturn:[1,'start'],faceturn:[1,'start'],voice:[1,'start'],mentor:[1,'start'],gauntlet:[1,'start'],trial:[1,'start'],school:[1,'start'],team:[1,'start'],under:[1,'start'],torch:[1,'start'],
 ironman:[1,'paid1'],mouth:[1,'paid1'],betrayal:[1,'turn'],stakes:[1,'f45'],faction:[1,'team'],join:[1,'team'],fightchamp:[1,'newch'],hometown:[1,'good'],dream:[1,'good'],
 cross:[2,'start'],proveit:[2,'start'],tap:[2,'start'],streak:[2,'start'],comeback:[2,'start'],techshow:[2,'start'],shoot:[2,'start'],cult:[2,'start'],breakup:[2,'start'],reunion:[2,'start'],
 retire:[2,'f75'],hardcore:[2,'f75'],flyer:[2,'ppvg'],rebrand:[2,'paid10'],redemption:[2,'paid10'],champvoice:[2,'reign10'],passtitle:[2,'reign10'],farewell:[2,'arena'],lastchase:[2,'arena'],invasion:[2,'fd']};
const ARC_MS={start:'Open at the start of the season',paid1:'Pay off your first arc',turn:'A turn arc pays off',f45:'A feud reaches 45 heat',team:'You have a tag team or faction',newch:'Crown a new champion',good:'Unlock the Good Building',
 f75:'A feud reaches 75 heat',ppvg:'A great arc payoff on a PPV',paid10:'Pay off 10 arcs',reign10:'Someone holds a title 10 weeks',arena:'Unlock the Actual Arena',fd:'Crossover season'};
window.ARC_UNLOCK=ARC_UNLOCK;
const aHeatMax=()=>{let m=0;for(const k in (S.heat||{})){if(S.heat[k]<=m)continue;if(k.split('|').every(aMine))m=S.heat[k]}return m};
/* milestones latch once met */
function arcMs(){S.arcM=S.arcM||{};const M=S.arcM;const set=k=>{M[k]=M[k]||AW()};
 if((S.arcDone||0)>=1)set('paid1');if(S.season>=2&&(S.arcDone||0)>=10)set('paid10');if((S.arcLog||[]).some(x=>x.k==='heelturn'||x.k==='faceturn'))set('turn');
 const h=aHeatMax();if(h>=45)set('f45');if((S.teams||[]).some(t=>t.m.filter(aMine).length>=2))set('team');
 if(typeof venOwns==='function'){try{if(venOwns('p','good'))set('good')}catch(e){}}
 /* season 2's milestones have to happen in season 2: a new blood feud, a reign that starts this year, a great PPV payoff this year */
 if(S.season>=2){if(!S.arcS2)S.arcS2={w:AW(),h:Object.keys(S.heat||{}).filter(k=>S.heat[k]>=75)};const z=S.arcS2;
  if(Object.keys(S.heat||{}).some(k=>S.heat[k]>=75&&!z.h.includes(k)&&k.split('|').every(aMine)))set('f75');
  if(Object.values(S.titles||{}).some(t=>t.holders.length&&t.holders.every(aMine)&&t.won!=null&&t.won>=z.w&&AW()-t.won>=10))set('reign10');
  if(typeof venOwns==='function'){try{if(venOwns('p','arena'))set('arena')}catch(e){}}
  try{if(typeof fdSeason==='function'&&fdSeason())set('fd')}catch(e){}}
 return M}
function arcOpenK(k){const u=arcBoard()[k];if(!u)return true;if(S.season>=3)return true;if(S.season<u[0])return false;return u[1]==='start'||!!(S.arcM||{})[u[1]]}
window.arcOpenK=arcOpenK;
function arcRan(k){return ((S.arcUsed||{})[S.season]||[]).includes(k)}
const arcRunningK=k=>arcList().some(a=>a.k===k&&!a.done&&aMine(a.a));
function arcLockTxt(k){const u=arcBoard()[k];if(!u)return '';const ms=u[1]==='start'?`Season ${u[0]}`:`${ARC_MS[u[1]]}${u[0]>1?` (season ${u[0]})`:''}`;return S.season<u[0]&&u[1]!=='start'?`Season ${u[0]}: ${ARC_MS[u[1]].replace(/^./,c=>c.toLowerCase())}`:ms}
/* announce what just opened up */
function arcUnlockTick(notes){arcMs();S.arcSeen=S.arcSeen||[];const now=Object.keys(ARCS).filter(arcOpenK);const nw=now.filter(k=>!S.arcSeen.includes(k));
 if(nw.length&&S.arcSeen.length){const t=`📖 New arc${nw.length>1?'s':''} on the board: ${nw.map(k=>aDK(k).i+' '+aDK(k).n).join(', ')}.`;news(t);if(notes)notes.push(t)}S.arcSeen=now}
window.arcUnlockTick=arcUnlockTick;
/* the arcs someone qualifies for: unlocked, not run yet this season, not running, and it fits who they are */
function arcOffer(id){const A=aW(id);if(!A||A.own!=='p')return [];arcMs();const star=aStar(A);
 return Object.keys(ARCS).filter(k=>{const D=aDK(k);return (star?D.lane==='star'||D.star:D.lane!=='star')&&arcOpenK(k)&&!arcRan(k)&&!arcRunningK(k)})
  .map(k=>{let p=null;try{p=aDK(k).pick(A)}catch(e){p=null}return p?Object.assign({k},p):null}).filter(Boolean)}
window.arcOffer=arcOffer;
function arcCanStart(id){const A=aW(id);if(!A||A.own!=='p'||A.retd)return 'Not on your roster';if(S.phase!=='season')return 'Arcs start once the season is under way';if(arcOf(id))return `${A.name} is already in an arc`;
 if(arcList().filter(a=>aMine(a.a)).length>=ARC_SLOTS)return `You have ${ARC_SLOTS} arcs running. Finish one first`;return ''}
window.arcCanStart=arcCanStart;
function arcWords(o,txt){const nm=id=>id&&aW(id)?aW(id).name:'';const t=(o.t&&TRAITS[o.t])?TRAITS[o.t].n:'';const st=o.stip&&STIPS[o.stip]?STIPS[o.stip].n:'';const g=o.g&&typeof FG_N!=='undefined'?FG_N[o.g]:o.g||'';
 return String(txt||'').replace(/\{S\} match/g,st&&/match$/i.test(st)?st:st+' match').replace(/\{B\}/g,nm(o.b)).replace(/\{C\}/g,nm(o.c)).replace(/\{S\}/g,st).replace(/\{G\}/g,g).replace(/\{F\}/g,o.fn||'the faction').replace(/\{T\}/g,t)}
function arcGain(D,A,a){if(aStar(A)&&D.lane!=='star')return 'A bigger payoff, popularity and heat'+(D.k==='heelturn'||D.k==='faceturn'||D.k==='betrayal'?' (and the turn)':'');return arcWords(a||{},D.gets||'')}
function arcStart(id,i){if(typeof mpLocked==='function'&&mpLocked())return;const why=arcCanStart(id);if(why)return toast(why);const l=arcOffer(id);const o=typeof i==='number'?l[i]:l.find(x=>x.k===i);if(!o)return;const D=aDK(o.k);const c=aCost(o.k);
 if(S.money.p<c)return toast(`This arc costs ${money(c)} up front.`);S.money.p-=c;const A=aW(id);A.arcN=(A.arcN||0)+1;
 const need=D.need2?D.need2({a:id,g:o.g}):D.need;const a=Object.assign({id:'a'+Date.now().toString(36)+Math.floor(Math.random()*999),a:id,start:AW(),end:AW()+need+ARC_SLACK,have:0,need,st:[],stage:'build',star:aStar(A)?1:0,cost:c,v:aVarOf(o.k),al0:A.al,fit:arcFitOf(A)===o.k?1:0},o);
 arcList().push(a);S.arcUsed=S.arcUsed||{};(S.arcUsed[S.season]=S.arcUsed[S.season]||[]).push(o.k);news(`📖 ${arcLine(a,'start')} (${D.n})`);save();render();arcOpen(id)}
window.arcStart=arcStart;
function arcDrop(id){const a=arcOf(id);if(!a)return;if(!confirm(`Drop ${aW(id).name}'s ${aD(a).n} arc? They'll be let down.`))return;arcFail(a,[]);S.arcs=arcList().filter(x=>x!==a);save();render();arcOpen(id)}
window.arcDrop=arcDrop;

/* ---- on the night: the payoff bonus before the rating is set, then progress after it airs ---- */
function arcBonus(a,s){const q=a.st.length?a.st.reduce((x,y)=>x+y,0)/a.st.length:3;let b=ARC_PAY0+clamp((q-3)*ARC_PAYQ,0,ARC_PAYMAX);if(s.ppv)b*=ARC_PAY_PPV;if(a.star||aD(a).lane==='star')b*=ARC_PAY_STORY;if(a.fit)b*=ARC_FIT;return Math.round(b*100)/100}
function arcPre(s){const out={seg:s,st:0,pay:[]};arcList().forEach(a=>{if(a.stage!=='pay'||a.done||AW()<(a.payFrom||0)||![a.a,a.b,a.c].some(id=>id&&s.ids.includes(id))||!aMine(a.a))return;const D=aD(a);let ok=false;try{ok=D.pay(s,a)}catch(e){}
  if(ok&&!out.pay.length){out.pay.push(a);out.st+=arcBonus(a,s)}});
 /* the crowd is invested in a story that's building: a little more each step, for a segment with the people in it */
 if(!out.pay.length){let bb=0;arcList().forEach(a=>{if(a.done||a.stage!=='build'||!a.have||!aMine(a.a)||!s.ids.includes(a.a)||a.b&&aD(a).bstep!==0&&!s.ids.includes(a.b))return;bb=Math.max(bb,ARC_BUILD*a.have)});out.st+=bb}
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
 arcList().slice().forEach(a=>{if(a.done||!aMine(a.a))return;const D=aD(a);
  if((s.arcPay||[]).includes(a)){a.st.push(stars);landed=true;arcFinish(a,s,stars,notes);return}
  if(a.stage!=='build'||a.lastStep===AW()||!s.ids.includes(a.a)&&!(a.b&&s.ids.includes(a.b)))return;
  let hit=false;try{hit=D.step(s,a)&&stars>=(D.min||ARC_MIN)}catch(e){}
  if(hit){a.have++;a.st.push(stars);a.lastStep=AW();const lab=D.tell&&D.tell[Math.min(a.have-1,D.tell.length-1)];
   notes.push(`📖 ${aW(a.a).name} · ${D.n}: ${lab?lab+' — ':''}step ${a.have} of ${a.need}.${a.have>=a.need&&(!D.ok||D.ok(a))?' The payoff is next.':''}`);
   if(a.have>=a.need&&(!D.ok||D.ok(a))){a.stage='pay';a.payFrom=AW()+1}}});
 S.arcs=arcList().filter(a=>!a.done);return landed};
function arcFinish(a,s,stars,notes){const D=aD(a);const A=aW(a.a);const q=a.st.reduce((x,y)=>x+y,0)/a.st.length;a.q=q>=ARC_GREAT?'great':'good';a.done=1;
 try{if(D.also)D.also(a,s,notes)}catch(e){console.warn('arc payoff',e)}
 let r={};try{r=D.win(a,A,a.q)||{}}catch(e){console.warn('arc reward',e)}
 const story=a.star||D.lane==='star';const parts=[];const FX=a.fit?ARC_FIT:1;if(a.fit){S.arcFitK=S.arcFitK||{};const was=S.arcFitK[a.a];S.arcFitK[a.a]=1;notes.push(`✨ ${was?'':'Found it: '}${A.name} was made for this. ${aName(a.k,a.v)} hits harder with them.`)}
 if(!story&&r.ring&&A.own){const g=trainGain(A.ring)*(a.q==='great'?ARC_G2:ARC_G1)*r.ring*FX;const v0=A.ring;addR(A,g);if(A.ring>v0)parts.push(`In-ring +${Math.round((A.ring-v0)*10)/10}`)}
 if(!story&&r.mic&&A.own){const g=trainGain(A.mic,1)*(a.q==='great'?ARC_G2:ARC_G1)*r.mic*FX;const v0=A.mic;addM(A,g);if(A.mic>v0)parts.push(`Mic +${Math.round((A.mic-v0)*10)/10}`)}
 const pop=Math.round(((r.pop||0)+(story?(a.q==='great'?2:1):0))*FX*10)/10;if(pop&&A.own){popx(A,pop);parts.push(`popularity +${pop}`)}
 if(r.bpop&&a.b&&aW(a.b)){popx(aW(a.b),r.bpop);parts.push(`${aW(a.b).name} popularity +${r.bpop}`)}
 if(r.chem&&a.b){const k=key(a.a,a.b);S.chem[k]=clamp((S.chem[k]||0)+r.chem,-5,6)}
 if(r.trait&&TRAITS[r.trait])parts.push(`${TRAITS[r.trait].i} ${TRAITS[r.trait].n}`);if(r.trq&&TRAITS[r.trq])parts.push(`${TRAITS[r.trq].i} ${TRAITS[r.trq].n} is first in line for their next trait slot`);
 if(r.fg2&&typeof FG_N!=='undefined')parts.push(`a second crowd: ${FG_N[r.fg2]}`);if(r.fgh&&typeof FG_N!=='undefined')parts.push(`halfway to winning over ${FG_N[r.fgh]}`);
 if(r.grp&&typeof fbHit==='function'&&A.own){try{fbHit('p',[A],Math.round(ARC_FANS*.6))}catch(e){}}
 if(A.own)mor(A,a.q==='great'?10:6);
 {const f=Math.round(ARC_FANS*(r.fans||1)*(a.q==='great'?1.3:1)*(typeof fanGrowF==='function'?fanGrowF(S.fans.p)/100:1)/100)*100;if(f>0){const ws=[A,a.b&&aW(a.b)].filter(w=>w&&w.own==='p');try{if(typeof fbHit==='function'&&ws.length)fbHit('p',ws,f);else S.fans.p+=f}catch(e){S.fans.p+=f}parts.push(`+${fmtFans(f)} fans`)}}
 S.arcLog=(S.arcLog||[]).concat([{w:AW(),k:a.k,v:a.v||0,a:a.a,b:a.b||null,q:a.q,fit:a.fit||0}]).slice(-40);S.arcDone=(S.arcDone||0)+1;if(a.q==='great')S.arcGreatN=(S.arcGreatN||0)+1;if(a.q==='great'&&s.ppv&&S.season>=2){S.arcM=S.arcM||{};S.arcM.ppvg=S.arcM.ppvg||AW()}
 notes.push(`📖✅ ${arcLine(a,'pay')} ${arcLine(a,a.q)} ${D.n} ${a.q==='great'?'— a great payoff':'paid off'}${parts.length?': '+parts.join(', '):''}.`);
 news(`📖 ${A.name}'s ${D.n} paid off${a.q==='great'?' in a big way':''}.`)}
function arcFail(a,notes){S.arcFailN=(S.arcFailN||0)+1;S.arcFailK=S.arcFailK||{};const fk=a.k+':'+a.stage+':'+a.have;S.arcFailK[fk]=(S.arcFailK[fk]||0)+1;const A=aW(a.a);if(A&&A.own==='p'){mor(A,-(a.star?ARC_FAIL+2:ARC_FAIL));if(a.b&&aW(a.b)&&aW(a.b).own==='p')mor(aW(a.b),-4)}a.done=1;const t=`📖❌ ${arcLine(a,'fail')} (${aD(a).n})`;news(t);(notes||[]).push(t);S.arcNews=(S.arcNews||[]).concat([{w:AW(),t}]).slice(-8)}
/* the deadline, and arcs whose people are gone: checked when a show is about to air */
function arcTick(){if(!S||!Array.isArray(S.arcs))return;S.arcs=S.arcs.filter(a=>{if(a.done)return false;const A=aW(a.a);if(!A||A.own!=='p')return false;
  if(a.gone||[a.b,a.c].some(id=>id&&(!aW(id)||aW(id).own!=='p'))){a.done=1;news(`📖 ${A.name}'s ${aD(a).n} arc ends — someone in it is gone.`);return false}
  if(AW()>a.end){arcFail(a,[]);return false}return true})}
window.arcTick=arcTick;
if(typeof airPair==='function'){const _ap=airPair;airPair=function(){let th={};try{if(typeof bothSides==='function')bothSides(arcTick);else arcTick();S.injSeen=S.injSeen||{};ownList('p').forEach(w=>{if(w.inj)S.injSeen[w.id]=AW()});Object.values(S.titles||{}).forEach(t=>th[t.id]=t.holders.join('|'))}catch(e){console.warn('arcs',e)}
 const r=_ap.apply(this,arguments);try{Object.values(S.titles||{}).forEach(t=>{if(th[t.id]!=null&&t.holders.length&&t.holders.join('|')!==th[t.id]&&t.holders.every(aMine)){S.arcM=S.arcM||{};S.arcM.newch=S.arcM.newch||AW()}});arcUnlockTick(r&&r.notes)}catch(e){console.warn('arcs',e)}return r}}

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
function arcFill(a,c,opt){opt=opt||{};const l=arcPlan(a);if(!l)return -1;const used=arcUsed(c);const sh=curShow();
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
 const lab=D.tell&&D.tell[Math.min(a.have,D.tell.length-1)];return `${lab?lab+' · ':''}Next: ${arcWords(o,D.build)}${D.min&&!/★/.test(D.build)?` (${D.min}★+)`:''}`}
function arcLeft(a){const l=a.end-AW()+1;return l<=1?'<b class="bad">Last week</b>':`${l} weeks left`}
function arcRowHtml(a,tap){const D=aD(a);const A=aW(a.a);return `<div class="arcrow"${tap?` onclick="showW('${a.a}')"`:''}><div class="row sb"><span><b>${D.i} ${esc(aName(a.k,a.v))}</b>${a.fit&&arcFitKnown(A)?' ✨':''}${tap?` · ${esc(A.name)}`:''}</span><span class="arcdots">${arcDots(a)}</span></div><div class="muted tiny">${esc(arcNow(a))} · ${arcLeft(a)}</div></div>`}
window.arcRowHtml=arcRowHtml;
/* the profile's Arc row */
window.arcProfile=function(w){if(!w||w.own!=='p')return '';const a=arcOf(w.id);
 if(a)return (arcFitKnown(w)&&ARCS[arcFitOf(w)]?`<div class="pf-row"><span class="pf-l">✨ Made for</span><span class="pf-v">${ARCS[arcFitOf(w)].i} ${esc(ARCS[arcFitOf(w)].n)}</span></div>`:'')+`<div class="pf-row pf-arc tap" onclick="arcOpen('${w.id}')"><span class="pf-l">📖 Arc</span><div class="pf-s">${arcRowHtml(a)}</div></div>`;
 const part=arcList().find(x=>x.b===w.id||x.c===w.id);if(part)return `<div class="pf-row"><span class="pf-l">📖 Arc</span><span class="pf-v">In ${esc(aW(part.a).name)}'s ${esc(aD(part).n)}</span></div>`;
 const why=arcCanStart(w.id);const n=why?0:arcOffer(w.id).length;const fk=arcFitKnown(w)?arcFitOf(w):null;const fitRow=fk&&ARCS[fk]?`<div class="pf-row"><span class="pf-l">✨ Made for</span><span class="pf-v">${ARCS[fk].i} ${esc(ARCS[fk].n)}</span></div>`:'';const rb=w.rbDue?`<div class="pf-row"><span class="pf-l">🎭 New character</span><span class="pf-v"><button class="pf-tg" onclick="arcRebrand('${w.id}')">Name it</button></span></div>`:'';
 return rb+fitRow+`<div class="pf-row"><span class="pf-l">📖 Arc</span><span class="pf-v">${why?`<small>${esc(why)}</small>`:n?`<button class="pf-tg" onclick="arcOpen('${w.id}')">Start an arc · ${n}</button>`:'<small>No open arc fits them yet</small>'}</span></div>`};
window.arcRebrand=function(id){const w=aW(id);if(!w||!w.rbDue)return;if(typeof rbAsk==='function'&&rbAsk(w,{i:'🎭',head:`${w.name}'s new character`,verb:'🎭 Debut it',where:'A brand new character.',go:()=>{delete w.rbDue},ok:()=>true}))return;delete w.rbDue;save();render()};
function arcOpen(id){const A=aW(id);if(!A)return;const a=arcOf(id);
 if(a){const D=aD(a);const pl=arcPlan(a);const can=pl&&S.card&&S.card.p&&S.phase==='season';
  return openModal(`<div class="h mhd">${D.i} ${esc(A.name)} · ${esc(aName(a.k,a.v))}</div><p class="muted" style="margin-top:0">${esc(arcWords(a,D.d))}</p>
  <div class="arcbig">${arcDots(a)}</div>
  <div class="brow"><b>${a.stage==='pay'?'The payoff':'Build'}</b><br><span class="muted tiny">${esc(a.stage==='pay'?arcWords(a,D.payoff):arcWords(a,D.build))}${a.stage==='build'&&!/★/.test(D.build)?` · ${D.min||ARC_MIN}★ or better`:''}</span></div>
  ${a.stage==='build'?`<div class="brow"><b>Then the payoff</b><br><span class="muted tiny">${esc(arcWords(a,D.payoff))}</span></div>`:''}
  <div class="brow"><b>What they get</b><br><span class="muted tiny">${esc(arcGain(D,A,a))}. A better build makes a bigger payoff.</span></div>
  <div class="muted tiny" style="margin:6px 0">${arcLeft(a).replace(/<[^>]+>/g,'')} · miss it and ${esc(A.name)} is let down.</div>
  ${can?`<button class="btn" onclick="arcBook('${id}')">Book ${a.stage==='pay'?'the payoff':'the next step'} tonight</button>`:''}
  <button class="btn ghost" onclick="arcDrop('${id}')">Drop the arc</button><button class="btn sec" onclick="showW('${id}')">Back</button>`)}
 const why=arcCanStart(id);if(why){toast(why);return}
 const o=arcOffer(id);if(!o.length)return openModal(`<div class="h mhd">📖 ${esc(A.name)}</div><p class="muted">None of the arcs open on your board fits ${esc(A.name)} right now. More unlock as you go, and every arc comes back next season.</p><button class="btn sec" onclick="showW('${id}')">Back</button>`);
 const lanes=aStar(A)?['star']:['mic','ring','trait'];const by=l=>o.filter(x=>aStar(A)||aDK(x.k).lane===l);
 openModal(`<div class="h mhd">📖 An arc for ${esc(A.name)}</div><p class="muted" style="margin-top:0">${aStar(A)?`A superstar's arc is all story: a bigger payoff, popularity and heat.`:'Every arc on your board that fits them.'} Each arc runs once a season, so pick where it counts. Pay now, book the build, then land the payoff.</p>
 ${lanes.map(l=>{const L=by(l);if(!L.length)return '';return `<div class="h small" style="margin:10px 0 4px">${ARC_LANES[l]}</div>`+L.map(x=>{const D=aDK(x.k);const c=aCost(x.k);return `<button class="choice arcch" ${S.money.p<c?'disabled':''} onclick="arcStart('${id}','${x.k}')"><div><div>${D.i} <b>${esc(aName(x.k))}</b>${arcFitKnown(A)&&arcFitOf(A)===x.k?' <span class="gold tiny">✨ Made for this</span>':''} <span class="muted tiny">· ${money(c)}</span></div>
  <div class="muted tiny">${esc(arcWords(x,D.d))}<br><b>Build, ${D.need2?D.need2({a:id,g:x.g}):D.need} times:</b> ${esc(arcWords(x,D.build))}<br><b>Payoff:</b> ${esc(arcWords(x,D.payoff))}<br><b>They get:</b> ${esc(arcGain(D,A,x))}</div></div></button>`}).join('')}).join('')}
 <button class="btn sec" onclick="showW('${id}')">Not now</button>`)}
window.arcOpen=arcOpen;
/* the Office card */
window.arcOfficeCard=function(){const l=arcList().filter(a=>aMine(a.a));const last=(S.arcNews||[]).filter(n=>AW()-n.w<=1);arcMs();
 const ks=Object.keys(ARCS);const open=ks.filter(k=>arcOpenK(k)&&!arcRan(k)&&!arcRunningK(k)),used=ks.filter(k=>arcRan(k)&&!arcRunningK(k)),lock=ks.filter(k=>!arcOpenK(k)).sort((x,y)=>(arcBoard()[x]||[9])[0]-(arcBoard()[y]||[9])[0]);
 const li=(k,t)=>`<div class="arcb"><span>${aDK(k).i} ${esc(aDK(k).n)}${aDK(k).lane==='star'?' <small>· superstars</small>':''}</span>${t?`<small>${esc(t)}</small>`:''}</div>`;
 return `<div class="card"><div class="h small">📖 Arcs (${l.length}/${ARC_SLOTS})</div>${l.map(a=>arcRowHtml(a,1)).join('')||'<div class="muted">Open a wrestler on your roster and tap Start an arc.</div>'}${last.map(n=>`<div class="muted tiny">${esc(n.t)}</div>`).join('')}
 <details class="arcbd"><summary>The arc board · ${open.length} open · ${used.length} run this season · ${lock.length} locked</summary>
 ${open.length?`<div class="arcbh">Open</div>${open.map(k=>li(k,ARC_LANES[aDK(k).lane])).join('')}`:''}${used.length?`<div class="arcbh">Run this season · back next season</div>${used.map(k=>li(k,'')).join('')}`:''}${lock.length?`<div class="arcbh">Locked</div>${lock.map(k=>li(k,arcLockTxt(k))).join('')}`:''}</details></div>`};

/* ---- the Book screen checklist: each arc's next step ---- */
if(typeof attnItems==='function'){const _ai=attnItems;attnItems=function(){const out=_ai.apply(this,arguments);try{if(!S||S.phase!=='season')return out;const c=(S.card&&S.card.p)||[];
 arcList().filter(a=>aMine(a.a)&&!a.done).forEach(a=>{const D=aD(a);const A=aW(a.a);if(A.inj)return;const pay=a.stage==='pay'&&AW()>=(a.payFrom||0);if(a.stage==='pay'&&!pay)return;
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
.arcbig{font-size:26px;letter-spacing:6px;margin:6px 0 10px}.arcbd{margin-top:8px}.arcbd summary{cursor:pointer;color:var(--gold);font-weight:600}.arcbh{margin:8px 0 2px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.5)}.arcb{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:14px}.arcb small{color:rgba(255,255,255,.55);text-align:right}#modal .choice.arcch{display:block}.pf-arc .pf-s{width:100%}`;document.head.appendChild(st)}
})();
