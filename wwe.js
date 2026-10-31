/* Tony Khan Simulator — the WWE update (v168).
   WWE's Raw and SmackDown rosters join the shared talent pool (draft and free agency), WWE's four world titles join the
   AEW belts, and the calendar alternates the biggest AEW and WWE PPVs. Royal Rumble and Money in the Bank bring their
   signature matches:
     • Royal Rumble (week RR_WEEK): a men's and a women's Rumble lock onto every brand's card. The winner earns a world title
       shot at WrestleMania — against their own brand's champion (belts never leave their show; if their brand's world titles are vacant they're first in line).
     • Money in the Bank (week MITB_WEEK): a men's and a women's ladder match. The winner holds the briefcase for a year and
       can cash in on a world champion of their division at any time — booked as its own match, or straight after any match
       the champion is in. Unused briefcases expire at the next Money in the Bank.
   Loaded before index.html's main script: the data is read when the main script builds the roster, and the functions run
   lazily, so they can use the main script's helpers. */
'use strict';

/* ===================== THE WWE ROSTER (Raw + SmackDown, as of Money in the Bank, Oct 10, 2026) =====================
   name|gender|style|align|ring|mic|pop|potential(optional) — same scale as the AEW roster. WWE's top names are the most
   popular wrestlers in the world, so the very top of the popularity scale belongs to them. */
const WWE_RAW=`Roman Reigns|M|pw|f|86|88|97
Jey Uso|M|br|f|80|80|87
Jimmy Uso|M|br|f|80|74|78
Jacob Fatu|M|pw|f|88|70|86|92
Solo Sikoa|M|br|h|76|70|74
Seth Rollins|M|te|f|90|90|92
Bron Breakker|M|pw|h|88|70|88|95
Bronson Reed|M|pw|h|84|64|80
Austin Theory|M|te|h|80|72|68|84
Logan Paul|M|sh|h|80|86|86
LA Knight|M|sh|f|78|92|87
Oba Femi|M|pw|f|86|70|82|95
Penta|M|fl|f|88|60|85|90
Je'Von Evans|M|fl|f|82|62|72|94
Dominik Mysterio|M|sh|h|80|80|86|86
JD McDonagh|M|te|h|82|62|60
Rey Mysterio|M|fl|f|78|72|82
Dragon Lee|M|fl|f|85|52|62|90
Cruz Del Toro|M|fl|f|76|50|48|84
Joaquin Wilde|M|fl|f|74|50|42
Chad Gable|M|te|h|86|76|74
El Grande Americano|M|te|h|80|64|64
Joe Hendry|M|sh|f|74|86|74|80
Ethan Page|M|br|h|80|78|64
Rusev|M|pw|h|80|72|72
Otis|M|pw|f|70|60|62
Akira Tozawa|M|fl|f|74|55|48
Big Cass|M|pw|h|66|72|60
Julius Creed|M|te|h|80|58|60|86
Brutus Creed|M|te|h|80|55|60|86
Royce Keys|M|pw|h|80|60|64|86
Bronco Nima|M|pw|h|72|50|50|82
Lucien Price|M|pw|h|72|50|50|82
Montez Ford|M|fl|f|82|72|70
Angelo Dawkins|M|pw|f|78|62|62
Cody Rhodes|M|sh|f|86|94|96
CM Punk|M|te|f|84|98|96
Sami Zayn|M|br|f|86|90|90
Randy Orton|M|te|f|84|86|90
Gunther|M|te|h|92|84|89
Drew McIntyre|M|br|h|86|86|86
Kevin Owens|M|br|h|86|90|86
Damian Priest|M|br|f|82|74|80
Finn Bálor|M|te|f|86|72|78
The Miz|M|sh|h|74|90|74
R-Truth|M|sh|f|60|86|76
Shinsuke Nakamura|M|te|h|82|62|70
Kyoki|M|br|h|76|48|48|84
Johnny Gargano|M|te|f|86|78|70
Carmelo Hayes|M|fl|h|84|78|68|90
Trick Williams|M|sh|f|80|82|80|90
Ricky Saints|M|sh|h|80|84|72|88
Rey Fenix|M|fl|f|90|52|76
Axiom|M|fl|f|84|50|58|90
Nathan Frazer|M|fl|f|85|55|58|90
Baron Corbin|M|pw|h|74|74|58
Tama Tonga|M|br|h|76|56|58
Talla Tonga|M|pw|h|70|45|52|82
Erik|M|pw|h|76|50|50
Ivar|M|pw|h|78|50|52
Kit Wilson|M|sh|h|72|72|52
Elton Prince|M|sh|h|72|68|50
Matt Cardona|M|sh|f|70|78|58
Danhausen|M|sh|f|62|80|66
Becky Lynch|F|br|h|86|92|91
Liv Morgan|F|sh|h|78|84|88
Stephanie Vaquer|F|fl|f|88|62|86|94
IYO SKY|F|fl|f|90|55|84
Asuka|F|te|h|86|72|78
Bayley|F|te|h|84|82|78
Lyra Valkyria|F|te|f|84|66|72|90
Raquel Rodriguez|F|pw|h|78|55|64
Roxanne Perez|F|te|h|84|72|70|92
Sol Ruca|F|fl|f|80|58|68|92
Lola Vice|F|br|f|72|62|58|84
Ivy Nile|F|te|h|76|52|52|84
Jaida Parker|F|br|h|76|62|58|88
Maxxine Dupri|F|sh|h|62|62|58|76
Naomi|F|fl|h|80|76|78
Charlotte Flair|F|te|f|86|84|88
Tiffany Stratton|F|fl|f|84|78|87|94
Jade Cargill|F|pw|h|78|66|82|86
Bianca Belair|F|pw|f|88|78|88
Rhea Ripley|F|br|f|86|80|92
Nia Jax|F|pw|h|76|72|72
Alexa Bliss|F|sh|f|72|80|80
Chelsea Green|F|sh|h|70|90|80
Giulia|F|br|h|86|58|72|92
Jordynne Grace|F|pw|f|84|66|70
Nikki Bella|F|br|f|68|78|76
Brie Bella|F|br|f|66|70|70
Paige|F|te|f|72|80|78
Blake Monroe|F|sh|h|78|84|72|90
Lash Legend|F|pw|h|72|70|64|86
Michin|F|br|h|72|62|56
B-Fab|F|sh|h|62|62|52
Candice LeRae|F|te|f|80|62|58
Tatum Paxley|F|sh|f|72|62|62|84
Fallon Henley|F|br|h|74|62|58
Jacy Jayne|F|sh|h|74|76|66|86
Lainey Reid|F|br|h|70|55|48|84
Kiana James|F|sh|h|70|74|56|82
Piper Niven|F|pw|h|78|66|58`;

/* WWE tag teams and factions (ids are slugs of the names above) */
const WWE_TEAMS=[
['The Bloodline','faction',['roman-reigns','jey-uso','jimmy-uso','jacob-fatu']],
['The Usos','team',['jey-uso','jimmy-uso']],
['The Vision','faction',['bron-breakker','bronson-reed','austin-theory','logan-paul','maxxine-dupri']],
['Breakker & Theory','team',['bron-breakker','austin-theory']],
['The Judgment Day','faction',['dominik-mysterio','jd-mcdonagh','liv-morgan','raquel-rodriguez','roxanne-perez']],
['LWO','faction',['rey-mysterio','dragon-lee','cruz-del-toro','joaquin-wilde']],
['American Made','faction',['julius-creed','brutus-creed','ivy-nile']],
['The Creed Brothers','team',['julius-creed','brutus-creed']],
['The 946','faction',['royce-keys','bronco-nima','lucien-price','jaida-parker']],
['OTM','team',['bronco-nima','lucien-price']],
['Alpha Academy','team',['otis','akira-tozawa']],
['The Street Profits','team',['montez-ford','angelo-dawkins']],
['Rusev & Ethan Page','team',['rusev','ethan-page']],
['The Lucha Bros','team',['penta','rey-fenix']],
['Fraxiom','team',['axiom','nathan-frazer']],
['The Baddies','faction',['jade-cargill','b-fab','michin']],
['Bakusai','team',['shinsuke-nakamura','kyoki']],
['The Bella Twins','team',['nikki-bella','brie-bella']],
['Fatal Influence','faction',['fallon-henley','jacy-jayne','lainey-reid']],
['The Irresistible Forces','team',['nia-jax','lash-legend']],
['The MFTs','team',['tama-tonga','talla-tonga']],
['The War Raiders','team',['erik','ivar']],
['Pretty Deadly','team',['elton-prince','kit-wilson']],
['Bliss & Paxley','team',['alexa-bliss','tatum-paxley']],
['Allies of Convenience','faction',['alexa-bliss','charlotte-flair','tatum-paxley']]];

/* durability, from each wrestler's real injury history (name|durability|note) */
const WWE_DUR=`Oba Femi|90|A powerhouse who has never missed time
Gunther|88|Iron-bodied workhorse who rarely gets hurt
The Miz|86|Almost never misses a show
Sami Zayn|82|Takes a beating every week and keeps going
Stephanie Vaquer|80|Wrestled all over the world without breaking down
Cody Rhodes|78|Wrestled Hell in a Cell with a torn pec — and barely misses time since
Jacob Fatu|78|Big, durable and constantly working
Bron Breakker|78|Explosive but rarely hurt
Roman Reigns|72|Keeps a part-time schedule and rarely gets hurt
Becky Lynch|62|Broken wrist and foot trouble over the years, but tough
Bronson Reed|58|Foot surgery in 2024
Kevin Owens|52|Neck surgery in 2025
Charlotte Flair|52|Tore her ACL and MCL in 2023
Liv Morgan|50|Separated shoulder in 2025
Rhea Ripley|48|Knee surgery in 2026 after a shoulder injury in 2024
Logan Paul|48|Torn triceps in 2026 after earlier knee and MCL injuries
Seth Rollins|42|Knee and back injuries; off TV with another one in 2026
Asuka|42|Long layoff for knee surgery
Randy Orton|38|Back fusion surgery kept him out 18 months
Rey Fenix|38|Concussions and back trouble
CM Punk|38|Torn triceps in 2023, and a long list of injuries before that
Rey Mysterio|34|More knee surgeries than anyone can count
Chelsea Green|34|Broken wrist, shoulder and an orbital bone in 2026
Matt Cardona|32|Torn pec and biceps over the years, hurt again in 2026
Brie Bella|32|Neck fusion history; broke her scapula at SummerSlam 2026
Nikki Bella|38|Neck surgery history
Piper Niven|44|Neck injury in 2026
Paige|25|Neck fusion ended her first career
Elton Prince|22|Neck fusion surgery in January 2026`;

/* who's hurt or off TV right now (weeks out) — used when an existing save picks up the new arrivals */
const WWE_OUT={'logan-paul':16,'rusev':6,'seth-rollins':6,'brie-bella':8,'rhea-ripley':8,'piper-niven':8,'elton-prince':16,'matt-cardona':6,'bianca-belair':20,'naomi':20,'drew-mcintyre':3,'asuka':4,'montez-ford':3,'angelo-dawkins':3,'carmelo-hayes':2};

/* birth years, so Father Time catches up with the veterans too */
const WWE_BORN={'r-truth':1972,'rey-mysterio':1974,'cm-punk':1978,'randy-orton':1980,'the-miz':1980,'shinsuke-nakamura':1980,'finn-balor':1981,'asuka':1981,'tama-tonga':1982,'nikki-bella':1983,'brie-bella':1983,'baron-corbin':1984,'sami-zayn':1984,'kevin-owens':1984,'nia-jax':1984,'erik':1984,'ivar':1984,'roman-reigns':1985,'cody-rhodes':1985,'drew-mcintyre':1985,'jey-uso':1985,'jimmy-uso':1985,'rusev':1985,'akira-tozawa':1985,'matt-cardona':1985,'candice-lerae':1985,'seth-rollins':1986,'charlotte-flair':1986,'big-cass':1986,'becky-lynch':1987,'gunther':1987,'naomi':1987,'johnny-gargano':1987,'bayley':1989,'alexa-bliss':1991,'chelsea-green':1991,'otis':1991,'paige':1992,'logan-paul':1995};

/* ===================== HELPERS ===================== */
let WWE_IDS=null;
function wweIds(){if(!WWE_IDS)WWE_IDS=new Set(WWE_RAW.trim().split('\n').map(l=>slug(l.split('|')[0].trim())));return WWE_IDS}
/* is this one of the wrestlers who came over from WWE's roster? */
function isWWE(w){return !!w&&!w.cw&&!w.rookie&&wweIds().has(w.id)}

/* ===================== CALENDAR ===================== */
const RR_WEEK=4,WM_WEEK=12,MITB_WEEK=20;
/* the world titles of each division: what the Rumble winner challenges for and what a briefcase can be cashed in on */
const WORLD_T={M:['world','wwe','whc'],F:['wworld','wwew','wwewc']};
const isWorldT=(id,g)=>(g?WORLD_T[g]:WORLD_T.M.concat(WORLD_T.F)).includes(id);

/* ===================== ROYAL RUMBLE & MONEY IN THE BANK ===================== */
/* sp: the special matches that lock onto every brand's card on those PPVs. size: entrants (fewer if the division is thin),
   min: the fewest it can run with */
const SPK={
 rr:{n:'Royal Rumble',i:'🏟️',type:'rumble',g:'M',size:8,min:6,week:RR_WEEK},
 rrw:{n:"Women's Royal Rumble",i:'🏟️',type:'rumble',g:'F',size:6,min:4,week:RR_WEEK},
 mitb:{n:'Money in the Bank',i:'💼',type:'mitb',g:'M',size:6,min:4,week:MITB_WEEK},
 mitbw:{n:"Women's Money in the Bank",i:'💼',type:'mitb',g:'F',size:5,min:3,week:MITB_WEEK}};
const isSp=m=>!!m&&(m.type==='rumble'||m.type==='mitb');
const spName=m=>m&&m.sp&&SPK[m.sp]?SPK[m.sp].n:m&&MT[m.type]?MT[m.type].n:'';
function spKeysFor(week){return Object.keys(SPK).filter(k=>SPK[k].week===week)}
/* the brand's entrants: healthy wrestlers of the division who aren't world champions (or already holding a briefcase).
   The biggest names headline it; the rest of the field skips anyone in a hot feud with a brandmate, so those feuds can
   still be settled one on one on the same card. */
function spMatch(b,k,used){const D=SPK[k];if(!D)return null;
 const champs=new Set(WORLD_T[D.g].map(id=>S.titles[id]).filter(t=>t&&t.holders.length).map(t=>t.holders[0]));
 const pool=ownList(b).filter(w=>w.g===D.g&&!w.inj&&!used.has(w.id)&&!champs.has(w.id)&&!(D.type==='mitb'&&S.mitb&&S.mitb[w.id]))
  .sort((x,y)=>(y.pop*.6+y.ring*.4)-(x.pop*.6+x.ring*.4));
 const n=Math.min(D.size,pool.length);if(n<D.min)return null;
 const hot=w=>ownList(b).some(o=>o.id!==w.id&&!o.inj&&!used.has(o.id)&&heatOf(w.id,o.id)>=30);
 const head=pool.slice(0,D.type==='rumble'&&D.g==='M'?3:2);const rest=pool.slice(head.length);
 const ids=head.concat(rest.filter(w=>!hot(w)),rest.filter(w=>hot(w))).slice(0,n).map(w=>w.id);ids.forEach(id=>used.add(id));
 return {type:D.type,stip:D.type==='mitb'?'ladder':'std',sides:ids.map(id=>[id]),winner:0,title:'',fin:'clean',sp:k}}
/* the special matches this brand still owes this week (skipping any already on its card) */
function spDue(b,used,have){if(!S||S.phase!=='season'||!PPVS[S.week])return [];const on=new Set((have||[]).filter(sl=>sl&&sl.d&&sl.d.sp).map(sl=>sl.d.sp));
 return spKeysFor(S.week).filter(k=>!on.has(k)).map(k=>spMatch(b,k,used)).filter(Boolean)}
/* before the bell: anyone hurt earlier in the night is pulled out (the match goes on without them) */
function spHeal(m){if(!isSp(m)||!m.sides)return;const D=SPK[m.sp]||{min:3};const ok=m.sides.filter(s=>s[0]&&S.w[s[0]]&&!S.w[s[0]].inj);if(ok.length===m.sides.length||ok.length<Math.max(2,D.min-1))return;
 const W=m.sides[m.winner]&&m.sides[m.winner][0];m.sides=ok;let wi=m.sides.findIndex(s=>s[0]===W);if(wi<0)wi=m.sides.map((s,i)=>[i,S.w[s[0]].pop]).sort((a,b)=>b[1]-a[1])[0][0];m.winner=wi;if(m.pin&&!m.sides.some(s=>s[0]===m.pin))delete m.pin}
/* per-brand state for this year's Rumble winners: shot = a shot at their own brand's champion */
function spw(b){S.spw=S.spw||{};let x=S.spw[b];if(!x||x.s!==S.season)x=S.spw[b]={s:S.season,shot:[]};return x}
/* the best world title of a division held on brand b (or anywhere but b, with other=true) */
function worldFor(g,b,other,not){return WORLD_T[g].map(id=>S.titles[id]).filter(t=>t&&t.holders.length===1&&S.w[t.holders[0]]&&t.holders[0]!==not&&(other?S.w[t.holders[0]].own&&S.w[t.holders[0]].own!==b:S.w[t.holders[0]].own===b)).sort((x,y)=>y.prestige-x.prestige)[0]||null}
function rumblePrize(b,m,notes){if(m.nc)return;const W=S.w[(m.sides[m.winner]||[])[0]];if(!W)return;const mine=b==='p'||ON();const D=SPK[m.sp]||SPK.rr;const wm=PPVS[WM_WEEK]||'WrestleMania';
 W.pop=clamp(W.pop+3,1,100);W.mor=clamp(W.mor+10,0,100);
 /* v259: the last one eliminated looks like a star too — the runner-up gets a smaller bump instead of nothing */
 {const ru=typeof pinOf==='function'?S.w[pinOf(m)]:null;if(ru&&ru.id!==W.id){ru.pop=clamp(ru.pop+1.5,1,100);ru.mor=clamp(ru.mor+5,0,100);if(b==='p'||ON())notes.push(`🥈 ${ru.name} was the last one eliminated — a strong showing (+1.5 popularity).`)}}
 if(WORLD_T[W.g].some(id=>S.titles[id]&&S.titles[id].holders.includes(W.id))){const n=`${D.i} ${W.name} wins the ${D.n} — as a world champion, they head to ${wm} with all the momentum in the world.`;notes.push(n);news(n);return}
 const own=worldFor(W.g,b,false,W.id);
 if(own){const h=S.w[own.holders[0]];if(b==='p')addPromise({kind:'shot',a:W.id,b:h.id,week:WM_WEEK,ppv:wm,title:own.id,why:'Royal Rumble winner'});else spw(b).shot.push({a:W.id,title:own.id});
  const n=`${D.i} ${W.name} wins the ${D.n}! They'll challenge ${h.name} for the ${own.n} title at ${wm}.${b==='p'&&!ON()?" It'll be waiting on your card.":''}`;notes.push(n);if(mine||W.own==='p')news(n);return}
 const n=`${D.i} ${W.name} wins the ${D.n} — with their show's world titles vacant, they're the favorite to be crowned at ${wm}.`;notes.push(n);news(n)}
/* WrestleMania: the rival's Rumble winner gets their shot at the rival's own champion */
function spShotsFor(b){if(S.week!==WM_WEEK)return [];return spw(b).shot.map(x=>{const w=S.w[x.a];if(!w||w.own!==b)return null;const t=S.titles[x.title];const tt=t&&t.holders.length===1&&S.w[t.holders[0]]&&S.w[t.holders[0]].own===b&&t.holders[0]!==w.id?t:worldFor(w.g,b,false,w.id);return tt?{a:w.id,title:tt.id}:null}).filter(Boolean)}

/* ---- the briefcase ---- */
function mitbPrize(b,m,notes){if(m.nc)return;const W=S.w[(m.sides[m.winner]||[])[0]];if(!W)return;S.mitb=S.mitb||{};S.mitb[W.id]={g:W.g,s:S.season,aw:AW(),b};
 W.pop=clamp(W.pop+3,1,100);W.mor=clamp(W.mor+10,0,100);
 const n=`💼 ${W.name} wins ${spName(m)}! The briefcase is a guaranteed world title shot, cashed in whenever they like for the next year — even right after the champion's match.`;notes.push(n);news(n)}
const mitbOf=id=>S&&S.mitb&&S.mitb[id]||null;
/* every world champion a briefcase holder could cash in on in match m: [{a,t,c}] (c = the champion, who has to be in the match) */
function cashOpts(m,b){const out=[];if(!S||!S.mitb||!m||!m.sides||isSp(m))return out;const ids=m.sides.flat().filter(Boolean);
 for(const id in S.mitb){const A=S.w[id];if(!A||A.own!==b||A.inj)continue;
  WORLD_T[A.g].forEach(tid=>{const t=S.titles[tid];if(!t||t.holders.length!==1)return;const c=t.holders[0];const C=S.w[c];if(!C||C.own!==b||c===id||!ids.includes(c))return;out.push({a:id,t:tid,c})})}
 return out}
/* the match editor's cash-in row */
function cashRow(m,ok){if(!ok)return '';const l=cashOpts(m,'p');if(!l.length){if(m.cash)delete m.cash;return ''}
 if(m.cash&&!l.some(o=>o.a===m.cash.a&&o.t===m.cash.t))delete m.cash;
 const cur=m.cash;const nm=id=>esc(S.w[id].name);const opts=[{t:'No cash-in',sub:'Keep the briefcase for another night',on:!cur,pick:()=>{delete ED.m.cash;renderMatchEd(true)}}];
 l.forEach(o=>{const T=S.titles[o.t];const bell=m.type==='singles'&&m.title===o.t&&m.sides.flat().includes(o.a);
  if(bell)opts.push({group:'Announced',t:`💼 This match is ${nm(o.a)}'s cash-in`,sub:`Uses the briefcase — the ${esc(T.n)} title is on the line, and the finish you picked decides it (+¼★)`,on:!!(cur&&cur.a===o.a&&cur.t===o.t&&cur.bell),pick:()=>{ED.m.cash={a:o.a,t:o.t,bell:1};renderMatchEd(true)}});
  else{opts.push({group:'Right after the match',t:`💼 ${nm(o.a)} cashes in on ${nm(o.c)} — and wins`,sub:`The ${esc(T.n)} title changes hands on a worn-out champion (+½★ to this match)`,on:!!(cur&&cur.a===o.a&&cur.t===o.t&&!cur.bell&&cur.w),pick:()=>{ED.m.cash={a:o.a,t:o.t,w:1};renderMatchEd(true)}},
   {t:`💼 ${nm(o.a)} cashes in on ${nm(o.c)} — ${nm(o.c)} survives`,sub:'The briefcase is gone, but the champion pulls it out (+¼★)',on:!!(cur&&cur.a===o.a&&cur.t===o.t&&!cur.bell&&!cur.w),pick:()=>{ED.m.cash={a:o.a,t:o.t,w:0};renderMatchEd(true)}})}});
 const A=cur&&S.w[cur.a];const t=cur?(cur.bell?`💼 ${esc(A.name)}'s cash-in`:`💼 ${esc(A.name)} cashes in afterwards`):'No cash-in';
 return `<label>Money in the Bank</label>${dd('cash',{title:t,sub:cur?(cur.bell?'Announced — the briefcase is used':cur.w?`${esc(S.w[S.titles[cur.t].holders[0]].name)} loses the ${esc(S.titles[cur.t].n)} title`:`${esc(S.w[S.titles[cur.t].holders[0]].name)} survives`):`${l.length>1?'Cash-ins available':'A cash-in is available'} — the champion is in this match`,rerender:()=>renderMatchEd(true),opts})}`}
/* during the show: the cash-in happens straight after the match it's attached to */
function cashAfter(b,m,res,notes,ctx){const c=m.cash;if(!c)return;const A=S.w[c.a],t=S.titles[c.t];const mine=b==='p'||ON();if(!A||!t||!mitbOf(c.a))return;
 const bump=v=>{res.u=(res.u!=null?res.u:res.stars)+v;res.stars=clamp(res.u,.25,5);(res.bdx=res.bdx||[]).push(['Money in the Bank cash-in',v])};
 if(c.bell){if(m.title!==c.t||!m.sides.flat().includes(c.a))return;delete S.mitb[c.a];bump(.25);const n=`💼 ${A.name} cashed in Money in the Bank — this one was for the ${t.n} title.`;notes.unshift(n);news(n);return}
 const C=t.holders.length===1?S.w[t.holders[0]]:null;
 if(A.inj||A.own!==b||!C||C.id===A.id||C.own!==b||!m.sides.flat().includes(C.id)){if(mine)notes.push(`💼 ${A.name} had the briefcase ready, but the moment passed${!C||C.id===A.id?' — the title changed hands in that match':A.inj?' — they got hurt':''}. They keep it for another night.`);delete m.cash;return}
 delete S.mitb[A.id];notes.push(`💼 CASH-IN! ${A.name}'s music hits — they hand the referee the briefcase and go straight after ${C.inj?'an injured':'a worn-out'} ${C.name}!`);
 const cm={type:'singles',stip:'std',sides:[[A.id],[C.id]],winner:c.w?0:1,title:t.id,fin:'clean',quick:1,cashin:1};
 applyMatch(cm,{stars:c.w?3.75:3,sparks:[],rep:false},{ppv:false,name:ctx&&ctx.name,pos:'mid'},notes);
 if(c.w){bump(.5);A.pop=clamp(A.pop+2,1,100);news(`💼 ${A.name} cashed in Money in the Bank and won the ${t.n} title from ${C.name}!`)}
 else{bump(.25);A.mor=clamp(A.mor-4,0,100);const n=`🛡️ ${C.name} survives the cash-in! ${A.name}'s briefcase is gone, and the champion walks out with the ${t.n} title.`;notes.push(n);news(n)}}
/* the rival cashes in when the moment is right — more often on PPVs, and before the year runs out */
function aiCash(brand,card,show){if(!S.mitb)return;for(const id in S.mitb){const A=S.w[id];if(!A||A.own!==brand||A.inj)continue;const x=S.mitb[id];const left=SEASON-(AW()-x.aw);
  const p=(show.ppv?.3:.1)+(left<=6?.35:left<=12?.1:0)+(A.al==='h'?.08:0);if(Math.random()>p)continue;
  const ms=card.filter(sl=>sl.k==='match'&&sl.d&&!sl.d.cash&&validMatch(sl.d));for(const sl of ms){const o=cashOpts(sl.d,brand).find(o=>o.a===id);if(o){sl.d.cash={a:id,t:o.t,w:Math.random()<.75?1:0};break}}}}
/* the start of each week: briefcases a year old expire, and a holder who left the company loses it */
function spWeek(notes){if(!S.mitb)return;for(const id in S.mitb){const x=S.mitb[id];const w=S.w[id];
  if(!w||!w.own){delete S.mitb[id];continue}
  if(AW()-x.aw>=SEASON){delete S.mitb[id];const n=`💼 ${w.name} never cashed in — the Money in the Bank briefcase has expired.`;notes&&notes.push(n);if(w.own==='p'||ON())news(n);w.mor=clamp(w.mor-6,0,100)}}}
/* the Book screen: who holds a briefcase, and what they can do with it */
function mitbBook(){if(!S.mitb)return '';const l=Object.keys(S.mitb).map(id=>S.w[id]).filter(w=>w&&w.own==='p');if(!l.length)return '';
 return `<div class="card"><div class="h small" style="margin:0 0 6px">💼 Money in the Bank</div>${l.map(w=>{const x=S.mitb[w.id];const left=SEASON-(AW()-x.aw);const ts=WORLD_T[w.g].map(id=>S.titles[id]).filter(t=>t&&t.holders.length===1&&S.w[t.holders[0]]&&S.w[t.holders[0]].own==='p'&&t.holders[0]!==w.id);
  return `<div style="margin:4px 0"><b>${esc(w.name)}</b>${w.inj?' <span class="bad tiny">(injured)</span>':''} <span class="muted tiny">· ${left} week${left===1?'':'s'} to cash in</span><div class="tiny muted">${ts.length?`Cash in on ${ts.map(t=>esc(S.w[t.holders[0]].name)+' ('+esc(t.n)+')').join(' or ')}: open any match they're in and pick the cash-in, or book ${esc(w.name)} against them for the title.`:"None of your brand's world champions in their division to cash in on right now."}</div></div>`}).join('')}</div>`}

/* ===================== EXISTING SAVES ===================== */
/* run once when a save picks up this update (from dataUpdate): the WWE wrestlers have already joined free agency there.
   Adds WWE's world titles (vacant, two and two between the brands), WWE's teams, and moves the save onto the new calendar —
   the weeks don't change (a PPV every 4 weeks, All In still midyear), only which show each PPV is. */
function wweData(st){if(!st||!st.w)return;const T=st.titles=st.titles||{};
 const brs=[...new Set(Object.values(T).map(t=>t.br).filter(Boolean))];const score=b=>Object.values(T).filter(t=>t.br===b).reduce((a,t)=>a+(t.prestige||0),0);
 const added=[];TITLES.forEach(([id,n,kind,g,h,pr])=>{if(T[id])return;T[id]={id,n,kind,g,holders:[],prestige:pr,since:0,last:0,inaug:1};added.push(T[id])});
 if(brs.length===2){[['wwe','whc'],['wwew','wwewc']].forEach(([hi,lo])=>{if(!T[hi]||!T[lo]||!added.includes(T[hi])||!added.includes(T[lo]))return;const lowB=brs.slice().sort((x,y)=>score(x)-score(y))[0];T[hi].br=lowB;T[lo].br=brs.find(b=>b!==lowB)})}
 added.filter(t=>!t.br).sort((a,b)=>b.prestige-a.prestige).forEach(t=>{if(brs.length)t.br=brs.slice().sort((x,y)=>score(x)-score(y))[0]});
 st.teams=st.teams||[];WWE_TEAMS.forEach(([n,type,m])=>{if(st.teams.some(t=>t.n===n))return;const mm=m.filter(id=>st.w[id]);if(mm.length<2)return;const own=new Set(mm.map(id=>st.w[id].own||''));if(own.size>1)return;st.nid=st.nid||1;st.teams.push({id:'t'+(st.nid++),n,type,m:mm})});
 /* the Continental Classic now ends at Full Gear; a save already in its closing weeks finishes this year's on the old schedule */
 if(st.phase==='season'&&st.week>=33)st.ccLate=st.season;
 st.news=st.news||[];
 if(added.length)st.news.push({w:st.week,t:`🏆 WWE's world titles have arrived: ${added.map(t=>t.n).join(', ')} — all vacant, ${brs.length===2?'two for each brand':'split between the brands'}. Crown your first champions on TV.`});
 if(st.phase==='season'||st.phase==='over')st.news.push({w:st.week,t:`📅 New calendar: the year now alternates AEW and WWE's biggest shows — ${Object.values(PPVS).join(', ')}. The Royal Rumble earns a WrestleMania title shot, Money in the Bank hands out a briefcase, and Survivor Series is the crossover show (and the end of the year).`})}

/* ===================== v177: THE WWE SUPPLEMENTAL DRAFT (saves from before the WWE update) =====================
   A save that started before v168 got the WWE roster dumped into free agency. Once, it can hold a supplemental draft
   instead: only the unsigned WWE wrestlers are in the pool, the brand behind in the fan war picks first, the same order every
   round, and each brand gets a supplemental budget on top of its current payroll. It runs on the normal draft screen
   (auto-pick, sim, league auto-draft all work), then drops straight back into the same week of the season. Whoever isn't
   picked stays in free agency. */
const SUPP_ROUNDS=3,SUPP_BUD=.9;
function suppPool(st){st=st||S;return Object.values(st.w).filter(w=>isWWE(w)&&!w.own&&!w.rookie)}
/* only saves where WWE wasn't part of the original draft (no WWE wrestler carries a draft pick) */
function suppDue(){if(!S||S.phase!=='season'||S.suppDone||!S.w)return false;if(Object.values(S.w).some(w=>isWWE(w)&&w.dr))return false;
 return suppPool().length>=brands().length*3}
function suppRounds(){return Math.max(1,Math.min(SUPP_ROUNDS,Math.floor(suppPool().length/brands().length)))}
/* the budget: 90% of what each brand's share of the top WWE names would cost — room for two big stars and a solid third pick.
   Six full-price rounds added ~$170K/wk of payroll mid-season and drained the bank within 16 weeks; this adds ~$85K/wk and
   money still trends up. */
function suppBudget(r){const n=brands().length;const top=suppPool().map(w=>mkt(w)).sort((a,b)=>b-a).slice(0,n*r);return Math.round(top.reduce((a,b)=>a+b,0)/n*SUPP_BUD)}
function suppCard(){if(!suppDue())return '';const n=suppPool().length,r=suppRounds();const ord=suppOrder();
 return `<div class="card warn"><b>🌍 WWE Supplemental Draft</b><div class="muted" style="margin:4px 0 8px">${n} WWE wrestlers are sitting in free agency. Hold a one-time supplemental draft for them: ${r} rounds, ${ord[0]==='p'?'you pick first (you\'re behind in the fan war)':`${esc(nameOf(ord[0]))} picks first (they're behind in the fan war)`}, with ${money(suppBudget(r))}/wk to spend on top of your payroll. Anyone not picked stays a free agent.</div>
 <div class="row" style="gap:8px"><button class="btn" style="flex:1" onclick="startSupp()">Start the draft</button><button class="btn sec" style="flex:1" onclick="skipSupp()">Skip it</button></div></div>`}
function suppOrder(){return brands().slice().sort((a,b)=>((S.fans&&S.fans[a])||0)-((S.fans&&S.fans[b])||0))}
function startSupp(){if(typeof mpLocked==='function'&&mpLocked())return;if(!suppDue())return;
 const pool=suppPool();const r=suppRounds();const bud=suppBudget(r);const ord=suppOrder();const capB={};ord.forEach(b=>capB[b]=payroll(b)+bud);
 let lost=0;pool.forEach(w=>{/* v180: nobody enters the draft hurt from real life */if(w.inj>0&&!w.w&&!w.l&&!w.lm)w.inj=0;if(S.offers&&S.offers[w.id]){delete S.offers[w.id];lost++}if(S.fa)delete S.fa[w.id]});
 S.draft={supp:pool.map(w=>w.id),round:1,pick:0,order:ord,rounds:r,log:[],capB,pk:(S.draft&&S.draft.pk)||0,prev:S.draft||null};
 S.phase='draft';S.suppDone=1;dv='pick';
 news(`🌍 The WWE Supplemental Draft is on: ${r} rounds for ${pool.length} WWE free agents.${lost?' Open offers on them were withdrawn.':''}`);
 save();tab='home';if(ON()){S.online.auto=S.online.auto||{};if(onClock()!=='p')mpPass(`${S.gm} started the WWE Supplemental Draft — you're on the clock.`,onClock());else mpPush()}render()}
function skipSupp(){if(typeof mpLocked==='function'&&mpLocked())return;if(!confirm('Skip the supplemental draft? The WWE wrestlers stay in free agency, and this can\'t be undone.'))return;S.suppDone=1;save();if(ON())mpPush();render()}
/* called from finishDraft: back to the same week, nothing about the season resets */
function finishSupp(){const d=S.draft;const got={};d.supp.forEach(id=>{const w=S.w[id];if(!w)return;if(w.own){w.pop0=w.pop;w.mor=Math.max(w.mor||0,70);(got[w.own]=got[w.own]||[]).push(w.name)}else w.con=0});
 S.draft=d.prev||null;S.phase='season';S.suppEnd=1;
 brands().forEach(b=>{if(got[b])news(`🌍 ${nameOf(b)} drafted ${got[b].join(', ')}.`)});
 news(`📋 The WWE Supplemental Draft is complete — back to week ${S.week}. The WWE wrestlers who weren't picked are still free agents.`);save()}

/* ===================== v178: PPV CARDS DEALT BEFORE THE NEW CALENDAR =====================
   A save that was sitting on a PPV week when the WWE update arrived kept the card it had been dealt under the old calendar —
   so Revolution's week became the Royal Rumble with no Rumbles on it (and Forbidden Door's week became Double or Nothing
   with dream-match slots). This re-deals that one card under the new layout: the Rumbles / ladder matches go on, the
   matches you'd booked stay (promised and tournament matches first, then your main event), and anything that no longer
   fits comes off. Runs once per PPV week. */
function ppvFit(c){if(!Array.isArray(c))return null;const tpl=emptyCard(true);const sig=a=>a.map(x=>x&&x.k+(x.opt?'?':'')).sort().join(',');
 const need=spKeysFor(S.week);const has=new Set(c.filter(x=>x&&x.d&&x.d.sp).map(x=>x.d.sp));
 if(sig(c)===sig(tpl)&&need.every(k=>has.has(k)))return null;
 const slots=tpl.map((x,i)=>x.k==='match'?i:-1).filter(i=>i>=0);
 const spOld=c.filter(x=>x&&x.k==='match'&&x.d&&x.d.sp&&need.includes(x.d.sp)).map(x=>x.d);
 const reg=c.filter(x=>x&&x.k==='match'&&x.d&&!x.d.sp);const last=reg[reg.length-1];
 const pri=x=>(x.d.tour||(typeof promiseOf==='function'&&promiseOf(x.d)))?3:x===last?2:1;
 const used=new Set();spOld.forEach(m=>m.sides.flat().forEach(id=>used.add(id)));
 /* keep the best of what was booked (promised and tournament matches, then your main event), leaving room for the sp
  matches; the Rumble field is then drawn from everyone who's free — and if it comes up short, the leftover slots go back to your matches */
 const rank=reg.map((x,i)=>({x,i})).sort((a,b)=>pri(b.x)-pri(a.x)||b.i-a.i);
 let keep=rank.slice(0,Math.max(0,slots.length-need.length));const u2=new Set(used);keep.forEach(o=>o.x.d.sides.flat().forEach(id=>u2.add(id)));
 const sp=spOld.concat(spDue('p',u2,spOld.map(d=>({d}))));
 if(sp.length<need.length)keep=rank.filter(o=>!sp.some(m=>m.sides.flat().some(id=>o.x.d.sides.flat().includes(id)))).slice(0,Math.max(0,slots.length-sp.length));
 keep=keep.sort((a,b)=>a.i-b.i).map(o=>o.x.d);
 const out=tpl.map(x=>Object.assign({},x));let f=0,bk=slots.length-1;
 sp.forEach(m=>{const D=SPK[m.sp];if(f>bk)return;const i=D&&D.g==='M'?slots[bk--]:slots[f++];out[i].d=m});
 /* your old main event stays the main event when there's no men's match to close the show */
 const free=slots.filter(i=>!out[i].d);keep.forEach((m,j)=>{if(free[j]!=null)out[free[j]].d=m});
 const xo=c.filter(x=>x&&x.k==='xo'&&x.d);const ox=out.filter(x=>x.k==='xo');xo.forEach((x,j)=>{if(ox[j])ox[j].d=x.d});
 const drop=reg.length-keep.length+Math.max(0,xo.length-ox.length);
 return {c:out,drop,sp:sp.length}}
function ppvMigrate(){if(!S||S.phase!=='season'||!S.card)return;
 /* promises made for a PPV under its old name show the new one */
 (S.promises||[]).forEach(pr=>{if(pr.ppv&&PPVS[pr.week]&&pr.ppv!==PPVS[pr.week])pr.ppv=PPVS[pr.week]});
 if(!PPVS[S.week])return;
 if(S.card.p&&!(ON()&&S.online&&S.online.booked&&S.online.booked.p)){const r=ppvFit(S.card.p);
  /* (a roster too thin for a Rumble re-deals to the same card every time — only act on a real change) */
  if(r&&JSON.stringify(r.c)!==JSON.stringify(S.card.p)){S.card.p=r.c;
   const sh=PPVS[S.week];const what=r.sp?(S.week===RR_WEEK?'the Royal Rumbles are':S.week===MITB_WEEK?'the Money in the Bank ladder matches are':'it\'s')+' on the card now':'the card has been reset to the new layout';
   setTimeout(()=>toast(`This week is ${sh} on the new calendar — ${what}${r.drop?`. ${r.drop} booked match${r.drop>1?'es':''} came off to make room`:''}.`),1200)}}
 if(!ON()&&S.card.ai&&spKeysFor(S.week).some(k=>!S.card.ai.some(sl=>sl&&sl.d&&sl.d.sp===k)))try{const a=autoBook('ai',curShow(),null);if(a.some(sl=>sl&&sl.d&&sl.d.sp))S.card.ai=a}catch(e){console.warn(e)}}
