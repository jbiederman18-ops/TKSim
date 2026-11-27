/* v397: fanbase groups (see the project doc claude/tksim-fanbase-spec.md).
   Every wrestler belongs to one fan group (a few versatile stars two), shown on their card. v397 is data and display only:
   nothing reads the groups for ratings, fans or money yet (that's v398+).
   Groups: cas Casuals · tech Technical · blood Bloodhounds · flip Flippy · chaos Chaos fiends.
   Real wrestlers are set from their real-life style (Josh approved the list Nov 21, 2026). 'und' = undiscovered: the bottom tier
   of AEW/ROH/WWE starts with no group and will find one through who they work with (v398). Big indie and international stars
   keep their real identities. Anyone not listed (gimmick prospects, created characters) uses the style rule FG_STYLE.
   Keyed by wrestler id (slug of the original name), so a rebrand keeps the group. */
const FG_N={cas:'Casuals',tech:'Technical',blood:'Bloodhounds',flip:'Flippy',chaos:'Chaos fiends',und:'Undiscovered'};
const FG_STYLE={fl:'flip',te:'tech',br:'blood',sh:'chaos',pw:'blood'};
const FG_RAW=`Will Ospreay|flip,tech
Kenny Omega|tech,flip
Jon Moxley|blood
Claudio Castagnoli|tech
Wheeler Yuta|tech
Marina Shafir|tech
MJF|chaos
Hangman Adam Page|blood
Swerve Strickland|flip
Kofi Kingston|flip
Austin Creed|chaos
Darby Allin|flip,blood
Steven Borden|blood
Kyle Fletcher|tech
Ilja Dragunov|blood
Kevin Knight|flip
Konosuke Takeshita|tech
Kazuchika Okada|tech
Andrade El Ídolo|flip
Daniel Garcia|tech
Mark Davis|blood
Jack Perry|flip
Ricochet|flip
Christian Cage|chaos
Adam Copeland|blood
Cash Wheeler|tech
Dax Harwood|tech
Matt Jackson|flip
Nick Jackson|flip
Brody King|blood
Bandido|flip
Gabe Kidd|blood
Chris Jericho|chaos
Orange Cassidy|cas
Kyle O'Reilly|tech
Roderick Strong|tech
Adam Cole|chaos
Mark Briscoe|blood
Tommaso Ciampa|blood
Samoa Joe|tech
Hook|blood
Myron Reed|flip
Wardlow|cas
Josh Alexander|tech
Hechicero|tech
Komander|flip
Mascara Dorada|flip
Lance Archer|blood
Katsuyori Shibata|tech
Jay White|chaos
Eddie Kingston|blood
Lio Rush|flip
Mike Bailey|flip
Francesco Akira|flip
Bobby Lashley|cas
Shelton Benjamin|tech
Místico|flip
Tomohiro Ishii|blood
Brian Cage|cas
Ace Austin|flip
Juice Robinson|blood
Austin Gunn|chaos
Colten Gunn|chaos
David Finlay|blood
Clark Connors|blood
Bishop Kaun|blood
Toa Liona|blood
Dezmond Xavier|flip
Kota Ibushi|flip
Hologram|flip
Mercedes Moné|cas
Thekla|chaos
Willow Nightingale|cas
Jamie Hayter|blood
Alex Windsor|tech
Megan Bayne|blood
Lena Kross|blood
Persephone|tech
Maya World|chaos
Harley Cameron|chaos
Toni Storm|chaos
Kris Statlander|tech
Hikaru Shida|tech
Julia Hart|chaos
Skye Blue|flip
Athena|blood
Anna Jay|tech
Mina Shirakawa|tech
Riho|flip
Queen Aminata|blood
Thunder Rosa|blood
Serena Deeb|tech
Penelope Ford|flip
Britt Baker|cas
Dani Luna|tech
Hyan|tech
Deonna Purrazzo|tech
Yuka Sakazaki|flip
Sammy Guevara|flip
Dustin Rhodes|blood
MVP|chaos
Rush|blood
Dralístico|flip
Nick Wayne|flip
Action Andretti|flip
Alex Shelley|tech
Chris Sabin|flip
Buddy Matthews|blood
The Beast Mortos|flip
Blake Christian|flip
Lee Moriarty|tech
Billy Gunn|chaos
Rocky Romero|tech
Trent Beretta|tech
John Silver|blood
Preston Vance|blood
Lee Johnson|flip
Jake Doyle|cas
El Clon|tech
Luchasaurus|blood
Johnny TV|chaos
Mansoor|tech
Mason Madden|blood
AR Fox|flip
Anthony Ogogo|und
Angelo Parker|chaos
Michael Nakazawa|chaos
Peter Avalon|und
Shane Taylor|blood
Tommy Billington|flip
Truth Magnum|chaos
Turbo Floyd|chaos
Zachary Wentz|flip
Ruby Soho|blood
Kamille|und
Red Velvet|flip
Cassie Lee|chaos
Jessie McKay|chaos
Charlette Renegade|und
Robyn Renegade|und
Leila Grey|und
Mara Sadè|chaos
Tatevik|und
Bryan Keith|blood
Zayda Steel|chaos
Billie Starkz|flip
Jay Lethal|tech
Tony Nese|flip
Angelico|und
Evil Uno|chaos
Alex Reynolds|tech
Matt Sydal|flip
Dante Martin|flip
Darius Martin|flip
Griff Garrison|und
Cole Karter|und
Zack Gibson|tech
James Drake|blood
Aaron Solo|und
Alec Price|flip
Anthony Henry|und
Ariya Daivari|und
Carlie Bravo|und
Jordan Oliver|flip
Josh Woods|tech
Marshall Von Erich|und
Ross Von Erich|blood
Matt Menard|chaos
Mike Bennett|und
Nick Comoroto|und
Ortiz|blood
Satnam Singh|cas
Scorpio Sky|tech
Serpentico|und
Shawn Dean|und
Diamanté|blood
Rachel Ellering|und
Dalton Castle|und
QT Marshall|und
Adam Priest|und
Big Boom! A.J.|und
Jacked Jameson|und
JD Drake|und
Myles Hawkins|und
Isiah Kassidy|und
Marq Quen|und
Lacey Lane|und
VertVixen|und
Viva Van|und
Christyan XO|und
Trish Adora|und
Isla Dawn|und
Roman Reigns|cas
Jey Uso|cas
Jimmy Uso|cas
Jacob Fatu|blood
Solo Sikoa|chaos
Seth Rollins|tech
Bron Breakker|chaos
Bronson Reed|cas
Austin Theory|chaos
Logan Paul|chaos
LA Knight|cas
Oba Femi|cas
Penta|flip
Je'Von Evans|flip
Dominik Mysterio|chaos
JD McDonagh|tech
Rey Mysterio|flip
Dragon Lee|flip
Cruz Del Toro|flip
Joaquin Wilde|und
Chad Gable|tech
El Grande Americano|chaos
Joe Hendry|cas
Ethan Page|chaos
Rusev|blood
Otis|cas
Akira Tozawa|flip
Big Cass|chaos
Jacob Kasper|tech
Drew Kasper|tech
Royce Keys|cas
Cruz Montana|blood
Bronco Nima|und
Lucien Price|und
Montez Ford|flip
Angelo Dawkins|tech
Cody Rhodes|cas
CM Punk|tech,chaos
Sami Zayn|tech
Randy Orton|tech
Gunther|tech
Drew McIntyre|blood
Kevin Owens|chaos
Damian Priest|blood
Finn Bálor|tech
The Miz|chaos
R-Truth|cas
Shinsuke Nakamura|tech
Kyoki|blood
Johnny Gargano|tech
Carmelo Hayes|flip
Trick Williams|cas
Ricky Saints|chaos
Rey Fenix|flip
Axiom|flip
Nathan Frazer|flip
Baron Corbin|cas
Tama Tonga|blood
Talla Tonga|blood
Erik|blood
Ivar|flip
Kit Wilson|chaos
Elton Prince|chaos
Matt Cardona|blood
Danhausen|chaos
Becky Lynch|blood
Liv Morgan|chaos
Stephanie Vaquer|flip
IYO SKY|flip
Asuka|tech
Bayley|tech
Lyra Valkyria|tech
Raquel Rodriguez|cas
Roxanne Perez|tech
Sol Ruca|flip
Lola Vice|blood
Ivy Nile|tech
Jaida Parker|blood
Maxxine Dupri|cas
Naomi|flip
Charlotte Flair|tech
Tiffany Stratton|flip
Jade Cargill|cas
Bianca Belair|tech
Rhea Ripley|blood
Nia Jax|cas
Alexa Bliss|chaos
Chelsea Green|chaos
Giulia|blood
Jordynne Grace|blood
Nikki Bella|cas
Brie Bella|cas
Paige|tech
Blake Monroe|chaos
Lash Legend|cas
Michin|blood
B-Fab|chaos
Candice LeRae|tech
Tatum Paxley|chaos
Fallon Henley|blood
Jacy Jayne|chaos
Lainey Reid|blood
Kiana James|chaos
Piper Niven|blood
Leon Slater|flip
Nic Nemeth|tech
Frankie Kazarian|tech
Mance Warner|blood
Mustafa Ali|flip
EFFY|blood
Bear Bronson|blood
Moose|cas
Krule|blood
1 Called Manders|blood
Matt Riddle|tech
Joey Janela|blood
Joshua Bishop|blood
Kerry Morton|chaos
Trevor Lee|flip
Eddie Edwards|tech
Gringo Loco|flip
Alex Kane|tech
Rich Swann|flip
Daga|blood
Masha Slamovich|blood
Steph De Lander|blood
Jody Threat|blood
Man Like DeReiss|flip
Michael Oku|flip
Luke Jacobs|blood
Robbie X|flip
Ricky Knight Jr.|blood
Kidd Bandit|flip
Session Moth Martina|chaos
Yota Tsuji|tech
Zack Sabre Jr.|tech
Yoshiki Inamura|tech
KENTA|chaos
El Desperado|tech
Shota Umino|blood
Oleg Boltin|tech
Yuya Uemura|tech
Shingo Takagi|blood
Kenoh|blood
Kaito Kiyomiya|tech
Saya Kamitani|flip
Sareee|blood
Momo Watanabe|blood
Starlight Kid|flip
AZM|flip
Miyu Yamashita|blood
Templario|flip
Laredo Kid|flip
Averno|tech
Atlantis Jr.|flip
Titán|flip
Volador Jr.|flip
Galeno del Mal|blood
Bárbaro Cavernario|blood
Lady Flammer|flip
Zeuxis|blood
Dalys|cas`;
let FG=null;
function fgMap(){if(FG)return FG;FG={};FG_RAW.trim().split('\n').forEach(l=>{const [n,g]=l.split('|');FG[slug(n.trim())]=g.split(',')});return FG}
/* groups for a wrestler: ['blood'], ['flip','tech'] or ['und'] */
function fgOf(w){if(!w)return [];const x=typeof S!=='undefined'&&S&&S.fgx&&S.fgx[w.id];if(x&&x.g)return [x.g];if(w.fgc)return [w.fgc];const g=fgMap()[w.id];if(g)return g;return [FG_STYLE[w.st]||'cas']}
function fgUnd(w){return fgOf(w)[0]==='und'}
/* the words on a card or profile: "Bloodhounds", "Flippy · Technical", "Undiscovered" */
function fgWord(w){return fgOf(w).map(g=>FG_N[g]).join(' · ')}
const FG_C={cas:'#efe9dc',tech:'#7fa7d6',blood:'#e5463b',flip:'#3fc8b4',chaos:'#b77ee8',und:'#9a958c'};
/* v406: every crowd has a symbol (Josh's picks, Nov 22 2026): a drop of blood, a gear, a feather, a bomb, a crowd; undiscovered is a "?".
   Cards show the symbol alone; everywhere else the symbol sits in front of the crowd's name. Tabler outline icons (MIT), drawn in currentColor. */
const FG_IC={blood:'<path d="M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546"/>',
 tech:'<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
 flip:'<path d="M4 20l10 -10m0 -5v5h5m-9 -1v5h5m-9 -1v5h5m-5 -5l4 -4l4 -4"/><path d="M19 10c.638 -.636 1 -1.515 1 -2.486a3.515 3.515 0 0 0 -3.517 -3.514c-.97 0 -1.847 .367 -2.483 1m-3 13l4 -4l4 -4"/>',
 chaos:'<path d="M15.349 5.349l3.301 3.301a1.2 1.2 0 0 1 0 1.698l-.972 .972a7.5 7.5 0 1 1 -5 -5l.972 -.972a1.2 1.2 0 0 1 1.698 0l.001 .001"/><path d="M17 7l1.293 -1.293a2.414 2.414 0 0 0 .707 -1.707a1 1 0 0 1 1 -1h1"/><path d="M7 13a3 3 0 0 1 3 -3"/>',
 cas:'<path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"/><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M17 10h2a2 2 0 0 1 2 2v1"/><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M3 13v-1a2 2 0 0 1 2 -2h2"/>',
 und:'<path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4"/><path d="M12 19l0 .01"/>'};
function fgIc(g){return FG_IC[g]?`<svg class="fgi" viewBox="0 0 24 24" aria-hidden="true">${FG_IC[g]}</svg>`:''}
/* symbol + name, in the crowd's color: the standard label for a crowd anywhere outside a card */
function fgLbl(g,t){return `<i class="fg-${g}">${fgIc(g)}${t==null?FG_N[g]:t}</i>`}
/* the key: all five crowds in a row */
function fgKey(){return ['cas','tech','blood','flip','chaos'].map(g=>`<span class="fgw fgk">${fgLbl(g)}</span>`).join(' ')}
/* v398: on cards each group is a solid slanted chip (colored text on photos was hard to read); a second group gets its own chip */
function fgTag(w,cls){const g=fgOf(w);const card=cls==='tcfg';const ln=g[0]==='und'&&!card&&typeof fgLean==='function'?fgLean(w.id):null;
 if(card)return `<span class="fgw tcfg">${g.map(k=>`<i class="fg-${k}" title="${FG_N[k]}">${fgIc(k)}</i>`).join('')}</span>`;
 return `<span class="fgw ${cls||''}">${g.map(k=>fgLbl(k)).join('<b>·</b>')}${ln?`<b>·</b>${fgLbl(ln,'leaning '+FG_N[ln])}`:''}</span>`}
window.fgOf=fgOf;window.fgIc=fgIc;window.fgLbl=fgLbl;window.fgKey=fgKey;window.fgUnd=fgUnd;window.fgWord=fgWord;window.fgTag=fgTag;
/* ===================== v399: THE FAN ENGINE =====================
   Your audience is five groups (S.fb[b]); S.fans[b] stays their sum, so everything that reads the total still works.
   Fan changes made anywhere else in the game (promises, sell-outs, debuts, goals…) land on S.fans and fbSync files them:
   gains go to casuals (story and business reach casuals), losses come out of every group in proportion.
   Each show, every group reacts to the segments aimed at it (fbCalc): exposure from its wrestlers, the stipulation, run-ins
   and the match type; a group needs about one real match of its own to hold steady, extra matches for the same group count
   less, and each group's expectations rise toward what it has been getting. Gains come out of the big shared pool (so a small
   group can grow fast); losses come out of your own group. Numbers are tuned with tools/balance-sweep.py (see its docstring). */
const FB_G=['cas','tech','blood','flip','chaos'];const FB_HC=['tech','blood','flip','chaos'];
const FB_POOL=10e6,FB_SHARE={cas:.55,tech:.08,blood:.12,flip:.12,chaos:.13};
const FB_X0=3.5,FB_XK=.3,FB_XKC=.2;          /* starting expectation and how fast it moves (casuals slower) */
const FB_PER=5,FB_ME=1.3,FB_W=[1,.55,.3,.2],FB_CAP=1.25; /* % per star of exposure, main event, diminishing returns, cap per match */
const FB_HOLD=2.5,FB_STARVE=4.5;             /* % lost per show without a real match of their own (more when it keeps happening) */
const FB_GKC=.018,FB_GKH=.065;                  /* share of the pool a +1% show pulls in (gains come from the pool): casuals, hardcore */
const FB_FED=.25;                            /* a group that gets its own match at about what it expects still grows a little */
const FB_DRIFT=1.2;                          /* casuals tune out by this % each show unless something hooks them */
const FB_CONV=.004;                          /* casuals who convert on a 4★+ match that beats a group's expectations */
const FB_RI_TECH=3,FB_SCREW_TECH=1;          /* Technical fans hate match-costing run-ins and screwy finishes */
/* which group each stipulation and match type speaks to */
const FB_STIP={sub:'tech',twoof3:'tech',iron:'tech',street:'blood',iquit:'blood',lms:'blood',texas:'blood',barbed:'blood',cage:'blood',dog:'blood',bng:'blood',lights:'blood',
 ladder:'flip',tornado:'flip',tables:'flip',nodq:'chaos',falls:'chaos',anarchy:'chaos',stampede:'chaos',coffin:'cas'};
const FB_MULTI={triple:1,four:1,gauntlet:1,rumble:1,mitb:1};
/* v410: a stipulation gives its crowd a steady pull (FB_STIP0) with or without a feud — v405 made it depend on feud heat
   (FB_STIP1, now 0). What stops you running one everywhere is its toll (STIP_TOLL in index.html: stamina, injury risk, price).
   The same stipulation two shows running pulls its crowd at FB_REP: they've just seen one. */
const FB_STIP0=.35,FB_STIP1=0,FB_STIPH=45;
/* v494: the bloodiest matches pull Bloodhounds harder than other stipulations. Blood & Guts is a full match for them on its own. */
const FB_PULL={bng:1,barbed:.6,lights:.6,texas:.6};
const FB_REP=.5;
/* v405: casuals follow a story — the card's hottest feuds (heat over FB_STORY0) hook them, the top one most (x1.5 on a PPV) */
let FB_STORY0=10,FB_STORYH=35,FB_STORYW=[1,.6,.4],FB_STORYCAP=1.4,FB_CAVK=2.5;  /* v438: stories hook casuals more (cap was 1, weights [1,.5,.3]); show quality over what they expect a little less (was 3) */  /* v416: was 1.5 — a feud-heavy GM was pulling casuals far past the rival */
/* the hottest feud across the sides of a match */
function fbHeat(m){let x=0;if(!m||!m.sides||typeof heatOf!=='function')return 0;for(let i=0;i<m.sides.length;i++)for(let j=i+1;j<m.sides.length;j++)for(const a of m.sides[i])for(const b of m.sides[j])x=Math.max(x,heatOf(a,b));return x}
const fbN=g=>FG_N[g];
/* the crowd a wrestler's found hidden specialty reaches in this stipulation (null if none, not found yet, or a casuals gimmick) */
function fbSpecGroup(w,stip){if(!w||!stip||stip==='std'||typeof favOf!=='function'||!favKnown(w)||favOf(w)!==stip)return null;const g=FB_STIP[stip];return g&&g!=='cas'?g:null}
function fbHas(b){return !!(S.fb&&S.fb[b])}
/* first time a brand is seen (new game after the draft, or an old save): split its fans — mostly casuals, the rest random per
   game, nudged a little toward the groups its roster draws */
function fbInit(b){S.fb=S.fb||{};S.fbx=S.fbx||{};S.fbh=S.fbh||{};const tot=Math.max(0,S.fans[b]||0);const r=seeded((S.seed||0)+'|fb|'+b);
 const cas=.66+r()*.1;const ros=Object.values(S.w).filter(w=>w.own===b);const cnt={};FB_HC.forEach(g=>cnt[g]=0);let n=0;
 ros.forEach(w=>{const gs=fgOf(w);gs.forEach((g,i)=>{if(cnt[g]!=null){cnt[g]+=gs.length>1?(i?.4:.6):1;n++}})});
 const wt={};let ws=0;FB_HC.forEach(g=>{const share=n?cnt[g]/Math.max(1,ros.length):.2;wt[g]=FB_SHARE[g]*(.7+r()*.6)*(1+.5*(share-.2));ws+=wt[g]});
 const f={cas:Math.round(tot*cas)};FB_HC.forEach(g=>f[g]=Math.round(tot*(1-cas)*wt[g]/ws));f.cas+=tot-FB_G.reduce((a,g)=>a+f[g],0);
 S.fb[b]=f;S.fbx[b]={};FB_G.forEach(g=>S.fbx[b][g]=FB_X0);S.fbh[b]={}}
function fbSum(b){const f=S.fb[b];return FB_G.reduce((a,g)=>a+(f[g]||0),0)}
function fbSync(b){if(!S||!S.fans||S.fans[b]==null)return null;if(!fbHas(b))fbInit(b);const f=S.fb[b];const sum=fbSum(b),T=S.fans[b];const d=Math.round(T-sum);
 if(d>0)f.cas+=d;else if(d<0&&sum>0){const k=T/sum;FB_G.forEach(g=>f[g]=Math.round(f[g]*k));f.cas+=Math.round(T-fbSum(b))}
 return f}
function fbSyncAll(){if(S&&S.fans)Object.keys(S.fans).forEach(fbSync)}
/* one aired (or projected) segment, as the fans see it */
/* a match as a verdict names it: no winner or finish ("A vs B"), special matches by their own name */
function fbMatchName(m){try{return typeof isSp==='function'&&isSp(m)?'The '+spName(m).replace(/^the /i,''):m.sides.map(sideName).join(' vs ')}catch(e){return ''}}
function fbSeg(m,st,me){return {k:'match',ids:m.sides.flat(),n:m.sides.flat().length,stip:stipKey(m),type:m.type,ri:!!(typeof riOn==='function'&&riOn(m)),ric:!!(typeof riProt==='function'&&riProt(m)),fin:typeof finOf==='function'?finOf(m):'clean',st,me:!!me,title:!!m.title,txt:typeof matchText==='function'?matchText(m):'',nm:fbMatchName(m),sn:(()=>{try{return m.sides.map(sideName)}catch(e){return []}})(),h:fbHeat(m)}}
function fbPromo(p,st){return {k:'promo',ids:[p.a,p.b].filter(id=>id&&S.w[id]),st,txt:(S.w[p.a]?S.w[p.a].name:'')+(p.b&&S.w[p.b]?' & '+S.w[p.b].name:'')}}
/* how much a match speaks to each group: each wrestler gives their share to their group (two groups .6/.4; undiscovered and
   casual draws reach only casuals), the stipulation and multi-person chaos add their group, a run-in feeds Chaos fiends, and a
   match where everyone shares one group is purer (x1.4). Capped per match. */
function fbExpo(sg){const e={};const add=(g,v)=>{if(g&&g!=='cas'&&g!=='und')e[g]=(e[g]||0)+v};
 if(sg.k==='promo'){sg.ids.forEach(id=>{const w=S.w[id];if(w&&fgOf(w).includes('chaos'))add('chaos',.4)});return e}
 const ws=sg.ids.map(id=>S.w[id]).filter(Boolean);const n=ws.length||1;const tags=[];
 ws.forEach(w=>{const gs=fgOf(w);const t=gs.slice();gs.forEach((g,i)=>add(g,(gs.length>1?(i?.4:.6):1)/n));
  /* v403: a found hidden specialty opens a second crowd — in their specialty match a wrestler also reaches the crowd that
     stipulation speaks to (a flyer who's a natural in a cage brings in Bloodhounds), and counts as theirs for a pure match */
  const sp=fbSpecGroup(w,sg.stip);if(sp&&!gs.includes(sp)){add(sp,1/n);t.push(sp)}tags.push(t)});
 add(FB_STIP[sg.stip],((FB_PULL[sg.stip]||FB_STIP0)+FB_STIP1*Math.min(1,(sg.h||0)/FB_STIPH))*(sg.rep?FB_REP:1));if(FB_MULTI[sg.type])add('flip',.5);if(sg.ri)add('chaos',.5);
 const hc=tags.map(gs=>gs.filter(g=>FB_HC.includes(g)));if(hc.length>1&&hc.every(x=>x.length)){FB_HC.forEach(g=>{if(hc.every(x=>x.includes(g))&&e[g])e[g]*=1.4})}
 for(const g in e)e[g]=Math.min(FB_CAP,e[g]);return e}
/* v455: coverage while booking — which crowds tonight's card gives a match of its own. Coverage only, never a forecast:
   a crowd is lit once a match reaches it fully, half-lit for a taste, dim with nothing. */
function fbMatchExpo(m){try{if(!m||!Array.isArray(m.sides)||!m.sides.flat().filter(Boolean).length)return null;return fbExpo(fbSeg(m,3,false))}catch(e){return null}}
function fbCasOf(m){try{return m.sides.flat().some(id=>S.w[id]&&fgOf(S.w[id]).includes('cas'))||!!m.title}catch(e){return false}}
function fbMatchGroups(m){const e=fbMatchExpo(m);if(!e)return [];const l=FB_HC.filter(g=>(e[g]||0)>=.5).sort((x,y)=>e[y]-e[x]);if(fbCasOf(m))l.unshift('cas');return l}
/* casuals tune in for the whole show: star power, their own draws, titles, spectacle and stories (fbCalc's hooks, minus how
   good the show turns out — that part is never previewed). Lit once the card clears their drift by a real margin. */
const FB_CAS_LIT=1;
/* v458: star power is the top four names on the card; a seat nobody's in yet counts as neutral (70), so booking a match while
   the card is still filling up never makes casuals look less hooked than an emptier card did. A full card is unchanged. */
const FB_TP0=70;
function fbCasHook(c){const sh=typeof curShow==='function'?curShow():{};const segs=[];(c||[]).forEach(sl=>{if(!sl||!sl.d)return;try{if(sl.k==='match'&&Array.isArray(sl.d.sides)&&sl.d.sides.flat().filter(Boolean).length)segs.push(fbSeg(sl.d,3,false));else if(sl.k==='promo'&&sl.d.a)segs.push(fbPromo(sl.d,3))}catch(e){}});
 if(!segs.length)return null;const ids=[...new Set(segs.flatMap(s=>s.ids))];const pops=ids.map(id=>S.w[id]?S.w[id].pop:0).sort((a,b)=>b-a).slice(0,4);const tp=pops.length?(pops.reduce((a,x)=>a+x,0)+FB_TP0*(4-pops.length))/4:0;
 const ms=segs.filter(s=>s.k==='match');const draws=Math.min(1.8,ms.reduce((a,s)=>a+s.ids.filter(id=>S.w[id]&&fgOf(S.w[id]).includes('cas')).length*.6,0));
 const tl=Math.min(1.2,segs.filter(s=>s.title).length*.6);const spec=Math.min(.8,ms.filter(s=>s.stip!=='std'||FB_MULTI[s.type]).length*.4);
 let story=0;ms.map(s=>s.h||0).sort((x,y)=>y-x).slice(0,FB_STORYW.length).forEach((h,i)=>story+=Math.max(0,h-FB_STORY0)/FB_STORYH*FB_STORYW[i]);story=Math.min(FB_STORYCAP,story)*(sh&&sh.ppv?1.5:1);
 const ppvK=sh&&sh.ppv?1.5:sh&&sh.special?1.5:1;let up=(tp-70)*.12+draws+tl+spec;if(up>0)up*=ppvK;return up+story-FB_DRIFT}
window.fbCasHook=fbCasHook;
/* v455: every light on one scale — the % a crowd would move tonight if each match lands right at what it expects (so how good
   the show turns out never enters). Lit at FB_CAS_LIT% or more, half-lit from 0 (holding steady), dim below (losing them).
   For the hardcore crowds that's fbCalc's own sums: exposure × the fed bonus (main event counts extra), the hold/starve loss for
   less than a real match, and Technical fans' run-in and screwy-finish penalty. */
/* v457: the lights now read the card exactly as the show will — promos count (a Chaos fiend on the mic feeds Chaos fiends),
   a stipulation repeated from last week pulls less, and a PPV's boost and a stacked crowd's burnout apply too. */
function fbHcHook(c,b){b=b||'p';const f=fbSync(b);if(!f)return null;const H=S.fbh[b]||{};const segs=[];let mi=-1;(c||[]).forEach((sl,i)=>{if(sl&&sl.k==='match'&&sl.d&&!sl.opt)mi=i});
 (c||[]).forEach((sl,i)=>{if(!sl||!sl.d)return;try{if(sl.k==='match'&&Array.isArray(sl.d.sides)&&sl.d.sides.flat().filter(Boolean).length)segs.push(fbSeg(sl.d,3,i===mi));else if(sl.k==='promo'&&sl.d.a&&!sl.d.cut)segs.push(fbPromo(sl.d,3))}catch(e){}});
 const last=(S.fbls&&S.fbls[b])||[];segs.forEach(sg=>{if(sg.k==='match')sg.rep=!!(sg.stip&&sg.stip!=='std'&&last.includes(sg.stip))});
 const sh=typeof curShow==='function'?curShow():{};const ppvK=sh&&sh.ppv?1.5:sh&&sh.special?1.5:1;const ms=segs.filter(s=>s.k==='match');
 const out={};FB_HC.forEach(g=>{const l=segs.map(sg=>({e:fbExpo(sg)[g]||0,sg})).filter(x=>x.e>0).sort((x,y)=>y.e-x.e);let E=0,sw=0;
  l.forEach((x,i)=>{if(i>=FB_W.length)return;const ee=x.e*FB_W[i];E+=ee;sw+=ee*FB_FED*FB_PER*(x.sg.me?FB_ME:1)});
  const hist=H[g]||[];const run=1+(hist[0]>=1.6?1+(hist[1]>=1.6?1:0):0);const burn=E>=1.6?(run>=3?.6:run>=2?.8:1):1;if(sw>0)sw*=burn*ppvK;
  const hold=E<1?-(1-E)*((hist[0]!=null&&hist[0]<1)?FB_STARVE:FB_HOLD):0;
  let pen=0;if(g==='tech'){const ri=ms.filter(s=>s.ric).length;const sc=ms.filter(s=>['cheat','dq','co'].includes(s.fin)&&fbExpo(s).tech).length;pen=-(ri*FB_RI_TECH+sc*FB_SCREW_TECH)}
  out[g]=sw+hold+pen});return out}
/* v457: a promo's crowds, for the tag under it — Chaos fiends when one's on the mic */
function fbPromoGroups(p){try{if(!p||!p.a||!S.w[p.a])return [];const e=fbExpo(fbPromo(p,3));return FB_HC.filter(g=>(e[g]||0)>0)}catch(e){return []}}
function fbPromoGroupsHtml(p){const l=fbPromoGroups(p);return l.length?`<span class="crseg">${l.map(g=>`<i class="fg-${g}" title="${FG_N[g]}">${fgIc(g)}</i>`).join('')}</span>`:''}
function fbCover(c){const lv=v=>v==null?0:v>=FB_CAS_LIT?2:v>=0?1:0;const hc=fbHcHook(c)||{};const out={cas:lv(fbCasHook(c))};FB_HC.forEach(g=>out[g]=lv(hc[g]));return out}
function fbCoverHtml(c){const v=fbCover(c);const W=['losing them: no real match of their own yet','holding steady','growing: a real match of their own'],WC=['not enough to hold them','just enough to hold them','hooked: stars, titles, spectacle or a story'];const wd=g=>(g==='cas'?WC:W)[v[g]];
 return `<div class="crcov"><span class="crcl">Crowds served</span>${FB_G.map(g=>`<span class="crc l${v[g]} fg-${g}" title="${FG_N[g]}: ${wd(g)}" aria-label="${FG_N[g]}: ${wd(g)}">${fgIc(g)}</span>`).join('')}</div>`}
function fbGroupsHtml(m){const l=fbMatchGroups(m);return l.length?`<span class="crseg">${l.map(g=>`<i class="fg-${g}" title="${FG_N[g]}">${fgIc(g)}</i>`).join('')}</span>`:''}
Object.assign(window,{fbCover,fbCoverHtml,fbGroupsHtml,fbMatchGroups,fbPromoGroupsHtml});
/* v500: a crowd's verdict says what happened to them, with one reason that names the cause and one thing to try next time.
   Explanations only: none of this changes how fans are scored. */
const FB_VD={'Loved it':'good','Hooked':'good','Wanted more':'warn','Watching':'warn','Let down':'bad','Ignored':'bad','Tuned out':'bad'};
const FB_NONE={tech:'No technical showcase tonight',blood:'No blood or weapons match',flip:'No flyers, ladder or multi-person match',chaos:'No run-ins, wild brawls or live Chaos mic'};
const FB_NEXT={tech:'a straight-up technical match with two technicians and a clean finish',blood:'a street fight, a cage or something with blood in it',flip:'high-flyers, a ladder match or a multi-person match',chaos:'a run-in, a No DQ brawl or a Chaos wrestler with a live mic'};
/* a promo says it's one */
function fbSegName(sg){return sg.k==='promo'?(sg.txt?sg.txt+'’s promo':'Their promo'):sg.nm||sg.txt||'Their match'}
function fbVerdict(g,o){const l=o.pc.map(([sg,c])=>({sg,c}));const want=`They want ${FB_NEXT[g]}.`;
 const what=o.ric?'the run-in':'the screwy finish';const fix=o.ric?'Keep run-ins from costing anyone the match.':'Give their kind of match a clean finish.';
 if(!l.length){if(o.pen<0)return {vd:'Let down',why:`Hated ${what}, with nothing else for them`,nx:fix,mt:''};
  const h=o.hist[0];return {vd:'Ignored',why:FB_NONE[g]+(h===0?'. Second show running':h!=null&&h<1?'. No full serving two shows running':''),nx:want,mt:''}}
 const sum=l.reduce((a,x)=>a+x.c,0);const name=x=>fbSegName(x.sg);
 const top=l.slice().sort((a,b)=>b.c-a.c)[0],low=l.slice().sort((a,b)=>a.c-b.c)[0];
 /* how far their segments landed from what they expect, weighted like the score itself (sw = exposure x (stars - expectation + FB_FED)) */
 let wt=0,gap=0;l.forEach((x,i)=>{const w=FB_W[i]*(x.sg.me?FB_ME:1);const e=fbExpo(x.sg)[g]||0;wt+=e*w;gap+=e*w*(x.sg.st-o.X)});gap=wt?gap/wt:0;
 const short=sum<=0;
 if(o.pen<0&&(short||-o.pen>=sum))return {vd:'Let down',why:short?`${name(low)} fell short, and they hated ${what}`:`Liked ${name(top)}, but hated ${what}`,nx:fix,mt:name(top)};
 const but=o.pen<0?`, but hated ${what}`:'';
 if(short)return {vd:'Let down',why:`${name(low)} wasn’t good enough for them${but}`,nx:'Their match needs to be better. Pick the pairing that will earn the most stars.',mt:name(low)};
 if(o.E<1)return {vd:'Wanted more',why:o.pen<0?`Only a taste, and they hated ${what}`:`${name(top)} only gave them a taste`,nx:o.pen<0?fix:`Give them a fuller serving: ${FB_NEXT[g]}.`,mt:name(top)};
 if(gap<0)return {vd:'Wanted more',why:`${name(top)} came close, but they expect better${but}`,nx:o.pen<0?fix:'Their match needs to be a little better.',mt:name(top)};
 return {vd:'Loved it',why:`${name(top)} delivered${o.burn<1?', though it’s getting familiar':''}${but}`,nx:o.pen<0?fix:o.burn<1?'Mix up what you give them.':'',mt:name(top)}}
function fbCasVerdict(o){const ms=o.segs.filter(s=>s.k==='match');const hot=ms.slice().sort((a,b)=>(b.h||0)-(a.h||0))[0];
 if(!o.segs.length)return {vd:'Tuned out',why:'Nothing on TV for them',nx:'Put a show on for them.',mt:''};
 const uu=o.up+o.story,star=(o.tp-70)*.12;const mt=hot?fbSegName(hot):'';
 if(uu>=FB_DRIFT){const hooked=uu>=FB_DRIFT+1;
  const best=[['story',o.story],['stars',star],['draws',o.draws],['titles',o.tl],['spec',o.spec],['q',o.q]].sort((a,b)=>b[1]-a[1])[0][0];
  const W={story:[`The feud in ${mt} pulled them in`,'the feuds'],stars:['The star power pulled them in','the star power'],draws:['Their kind of stars drew them in','their favorite stars'],titles:['The title action pulled them in','the title action'],spec:['The big match types pulled them in','the big match types'],q:['A better show than they’ve come to expect','the strong show']}[best];
  return hooked?{vd:'Hooked',why:W[0],nx:'',mt}:{vd:'Watching',why:`Just enough to keep them, mostly for ${W[1]}`,nx:'Give them one more reason to stay: stars, titles, a big stipulation or a hot feud.',mt}}
 const sd=Math.max(0,-star),qd=Math.max(0,-o.q);
 if(qd>=.4&&qd>=sd)return {vd:'Tuned out',why:o.tp>=70?'The stars were there, but the show wasn’t up to your usual':'The show wasn’t up to your usual and lacked star power',nx:'Win them back with a stronger show, especially the main event.',mt};
 if(sd>=.4)return {vd:'Tuned out',why:'Not enough star power at the top of the card',nx:'Put bigger stars on the card.',mt};
 const miss=[];if(o.tp<80)miss.push('bigger stars');if(o.story<.3)miss.push('a hot feud');if(!o.tl)miss.push('a title match');if(!o.spec)miss.push('a big match type');
 const m=miss.slice(0,2);if(!m.length)return {vd:'Tuned out',why:'The card didn’t give them quite enough',nx:'Win them back with a stronger show, especially the main event.',mt};
 return {vd:'Tuned out',why:`Not enough to hold them. The card needed ${m.join(' or ')}`,nx:`They want ${m.join(' or ')}.`,mt}}
/* the verdict for a crowd; results aired before v500 fall back to their old words */
function fbVd(r,g){if(r.vd&&r.vd[g])return [r.vd[g],FB_VD[r.vd[g]]||''];const w=fbWord(g,r.pct[g]||0)||['','',''];return [w[1],w[2]]}
/* reasons only for the night's three biggest moves */
function fbTopMoves(r){return FB_G.map(g=>[g,Math.abs(Math.round(r.after[g]-r.before[g]))]).filter(x=>x[1]>=100).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0])}
/* Next time: the crowd that lost you the most fans (never one that was happy); nothing when there isn't one */
function fbNextHtml(r,at){if(!r.nx)return '';const d=g=>r.after[g]-r.before[g];const g=FB_G.filter(g=>d(g)<=-100&&r.nx[g]&&FB_VD[r.vd[g]]!=='good').sort((a,b)=>d(a)-d(b))[0];
 return g?`<div class="srnext"${at||''}><b class="fgw">Next time · ${fgLbl(g)}</b><span>${esc(r.nx[g])}</span></div>`:''}
/* v505: the segment a crowd's verdict is about, small enough to keep on the result (X Redditino's timeline names its wrestlers) */
function fbSegBrief(segs,nm){if(!nm)return null;const sg=segs.find(s=>fbSegName(s)===nm);if(!sg)return null;
 const sn=sg.k==='promo'?sg.ids.map(id=>S.w[id]&&S.w[id].name).filter(Boolean):(sg.sn||[]);return {k:sg.k,sn:sn.slice(0,4),st:sg.st,me:!!sg.me,title:!!sg.title,stip:sg.stip||''}}
/* the show's effect on each group (in %), with the reason. dry = a preview (nothing changes) */
function fbCalc(b,segs,show,o){o=o||{};const f=fbSync(b);const X0=S.fbx[b],H=S.fbh[b];const res={pct:{},why:{},wy:{},vd:{},nx:{},mt:{},ms:{},E:{},avg:{},conv:{},best:{}};
 /* v462: what each segment did for each crowd (in %), so the quarter-hour reveal can draw the night segment by segment */
 res.sc=segs.map(()=>({}));
 const sc=(sg,g,v)=>{const i=segs.indexOf(sg);if(i>=0&&isFinite(v))res.sc[i][g]=(res.sc[i][g]||0)+v};
 const X={};FB_G.forEach(g=>X[g]=X0[g]||FB_X0);   /* v491: every brand is judged only by what it has delivered, on every difficulty */
 const ppvK=show&&show.ppv?(o.allin?2:1.5):show&&show.special?1.5:1;
 const per={};FB_HC.forEach(g=>per[g]=[]);
 const last=(S.fbls&&S.fbls[b])||[];segs.forEach(sg=>{if(sg.k==='match')sg.rep=!!(sg.stip&&sg.stip!=='std'&&last.includes(sg.stip))});
 segs.forEach(sg=>{const e=fbExpo(sg);for(const g in e)per[g].push({e:e[g],sg})});
 FB_HC.forEach(g=>{const l=per[g].sort((a,b)=>b.e-a.e);let E=0,sw=0,ss=0,sx=0;
  const pc=[];l.forEach((x,i)=>{const w=FB_W[Math.min(i,FB_W.length-1)];if(i>=FB_W.length)return;const ee=x.e*w;E+=ee;const c=ee*(x.sg.st-X[g]+FB_FED)*FB_PER*(x.sg.me?FB_ME:1);sw+=c;pc.push([x.sg,c]);ss+=x.sg.st*x.e;sx+=x.e});
  const hist=H[g]||[];const run=1+(hist[0]>=1.6?1+(hist[1]>=1.6?1:0):0);const burn=E>=1.6?(run>=3?.6:run>=2?.8:1):1;
  const pk=sw>0?burn*ppvK:1;pc.forEach(([sg,c])=>{sc(sg,g,c*pk)});
  if(sw>0)sw*=burn*ppvK;let hold=0;if(E<1)hold=-(1-E)*((hist[0]!=null&&hist[0]<1)?FB_STARVE:FB_HOLD);
  let pen=0;if(g==='tech'){const ri=segs.filter(s=>s.k==='match'&&s.ric).length;const scr=segs.filter(s=>s.k==='match'&&['cheat','dq','co'].includes(s.fin)&&fbExpo(s).tech).length;pen=-(ri*FB_RI_TECH+scr*FB_SCREW_TECH);segs.forEach(s=>{if(s.k!=='match')return;if(s.ric)sc(s,'tech',-FB_RI_TECH);else if(['cheat','dq','co'].includes(s.fin)&&fbExpo(s).tech)sc(s,'tech',-FB_SCREW_TECH)})}
  res.pct[g]=sw+hold+pen;res.E[g]=E;res.avg[g]=sx?ss/sx:null;res.best[g]=l[0]?l[0].sg:null;
  const v=fbVerdict(g,{pc,E,burn,pen,X:X[g],hist,ric:segs.some(s=>s.k==='match'&&s.ric)});
  res.vd[g]=v.vd;res.wy[g]=res.why[g]=v.why;res.nx[g]=v.nx;res.mt[g]=v.mt;res.ms[g]=fbSegBrief(segs,v.mt);
  /* the best matches turn casuals into fans of that group */
  let cv=0;l.forEach(x=>{if(x.sg.st>=4&&x.sg.st>X[g])cv+=f.cas*FB_CONV*x.e*(x.sg.st-3.75)/1.25});res.conv[g]=Math.round(cv)});
 /* casuals: tune out unless star power, titles, spectacle and a good show hook them */
 const ids=[...new Set(segs.flatMap(s=>s.ids))];const pops=ids.map(id=>S.w[id]?S.w[id].pop:0).sort((a,b)=>b-a).slice(0,4);const tp=pops.length?(pops.reduce((a,x)=>a+x,0)+FB_TP0*(4-pops.length))/4:0;
 const draws=Math.min(1.8,segs.filter(s=>s.k==='match').reduce((a,s)=>a+s.ids.filter(id=>S.w[id]&&fgOf(S.w[id]).includes('cas')).length*.6,0));
 const tl=Math.min(1.2,segs.filter(s=>s.title).length*.6)+(o.newch?.6:0);const spec=Math.min(.8,segs.filter(s=>s.k==='match'&&(s.stip!=='std'||FB_MULTI[s.type])).length*.4);
 let cs=0,cw=0;segs.forEach((s,i)=>{const w=s.me?1.6:1;cs+=s.st*w;cw+=w});const cav=cw?cs/cw:0;
 const hs=segs.filter(s=>s.k==='match').map(s=>s.h||0).sort((x,y)=>y-x);let story=0;hs.slice(0,FB_STORYW.length).forEach((h,i)=>story+=Math.max(0,h-FB_STORY0)/FB_STORYH*FB_STORYW[i]);
 story=Math.min(FB_STORYCAP,story)*(show&&show.ppv?1.5:1);res.story=story;
 let up=(tp-70)*.12+draws+tl+spec+(cav-X.cas)*FB_CAVK;if(!segs.length)up=0;if(up>0)up*=ppvK;
 /* v462: the same casual hooks, segment by segment (the tune-out drift and a new champion's bump belong to the whole night) */
 if(segs.length){const k=up>0?ppvK:1,cs2=(sg,v,w)=>sc(sg,'cas',v,w);
  ids.map(id=>({id,p:S.w[id]?S.w[id].pop:0})).sort((a,b)=>b.p-a.p).slice(0,4).forEach(x=>{const sg=segs.find(s=>s.ids.includes(x.id));if(sg)cs2(sg,(x.p-FB_TP0)*.12/4*k)});
  const dr=segs.map(s=>s.k==='match'?s.ids.filter(id=>S.w[id]&&fgOf(S.w[id]).includes('cas')).length*.6:0),drT=dr.reduce((a,x)=>a+x,0);segs.forEach((s,i)=>{if(dr[i])cs2(s,dr[i]*Math.min(1,1.8/drT)*k)});
  const tN=segs.filter(s=>s.title).length;segs.forEach(s=>{if(s.title)cs2(s,.6*Math.min(1,1.2/(tN*.6))*k)});
  const spN=segs.filter(s=>s.k==='match'&&(s.stip!=='std'||FB_MULTI[s.type])).length;segs.forEach(s=>{if(s.k==='match'&&(s.stip!=='std'||FB_MULTI[s.type]))cs2(s,.4*Math.min(1,.8/(spN*.4))*k)});
  segs.forEach(s=>{cs2(s,(s.st-X.cas)*(s.me?1.6:1)/cw*FB_CAVK*k)});
  const hm=segs.filter(s=>s.k==='match').sort((x,y)=>(y.h||0)-(x.h||0)).slice(0,FB_STORYW.length);let sr=0;const sv=hm.map((s,i)=>{const v=Math.max(0,(s.h||0)-FB_STORY0)/FB_STORYH*FB_STORYW[i];sr+=v;return v});
  const sk=sr>0?Math.min(FB_STORYCAP,sr)/sr*(show&&show.ppv?1.5:1):0;hm.forEach((s,i)=>{if(sv[i])cs2(s,sv[i]*sk)})}
 res.nc=o.newch&&segs.length?.6*(up>0?ppvK:1):0;
 res.pct.cas=-FB_DRIFT+up+(segs.length?story:0);res.avg.cas=cw?cav:null;res.E.cas=1;
 const cv=fbCasVerdict({segs,up,story,tp,draws,tl,spec,q:(cav-X.cas)*FB_CAVK});
 res.vd.cas=cv.vd;res.wy.cas=res.why.cas=cv.why;res.nx.cas=cv.nx;res.mt.cas=cv.mt;res.ms.cas=fbSegBrief(segs,cv.mt);
 return res}
/* apply a show's result: returns what each group did, for the results screen */
function fbApply(b,segs,show,o){const r=fbCalc(b,segs,show,o);const f=S.fb[b],X=S.fbx[b],H=S.fbh[b];const before=Object.assign({},f);
 const grow=1;/* gains come from the pool and casuals tune out in proportion, so growth levels off by itself (no fanGrowF) */let conv=0;const out={before,after:{},pct:r.pct,why:r.why,wy:r.wy,vd:r.vd,nx:r.nx,mt:r.mt,ms:r.ms,conv:0,flat:0,sc:r.sc,E:r.E,nc:r.nc,arcStory:r.arcStory};
 FB_G.forEach(g=>{const p=r.pct[g];let d=p>0?FB_POOL*FB_SHARE[g]*p/100*(g==='cas'?FB_GKC:FB_GKH)*grow:f[g]*p/100;f[g]=Math.max(0,f[g]+Math.round(d))});
 out.cv={};FB_HC.forEach(g=>{const c=Math.min(r.conv[g],f.cas*.05);if(c>0){out.cv[g]=Math.round(c);f[g]+=Math.round(c);f.cas-=Math.round(c);conv+=Math.round(c)}});
 /* everything else that moves fans on the night (head-to-head, main event war, debuts, chants, 5★ overflow) reaches casuals */
 const flat=Math.round(o.flat||0);if(flat){if(flat>0)f.cas+=Math.round(flat*(flat>0?grow:1));else f.cas=Math.max(0,f.cas+flat)}
 FB_HC.forEach(g=>{H[g]=[r.E[g]].concat(H[g]||[]).slice(0,3);if(r.avg[g]!=null)X[g]+=FB_XK*(r.avg[g]-X[g])});if(r.avg.cas!=null)X.cas+=FB_XKC*(r.avg.cas-X.cas);
 FB_G.forEach(g=>X[g]=clamp(X[g],2.5,4.6));
 S.fbls=S.fbls||{};S.fbls[b]=segs.filter(sg=>sg.k==='match'&&sg.stip&&sg.stip!=='std').map(sg=>sg.stip);
 let T=fbSum(b);if(T<50000){f.cas+=50000-T;T=50000}S.fans[b]=T;FB_G.forEach(g=>out.after[g]=f[g]);out.conv=conv;try{fbMoodAdd(b,{pct:r.pct,before})}catch(e){}return out}

/* ---- v400: fans switch shows. After a night with two or more shows, each group drifts toward the show that served it best.
   Casuals switch on any clear gap. Hardcore fans only walk out on a show that let them down tonight (their group went backwards)
   and only toward a show that fed them; Technical fans are the stickiest. Fans keep their group — a Bloodhound stays a Bloodhound,
   they just watch the other show. Capped per night. This replaced the flat head-to-head (+4K) and main event war (+3K) bonuses. ---- */
const FB_SW={cas:.02,tech:.025,blood:.05,flip:.05,chaos:.06},FB_SWGAP={cas:1.5,hc:1.5},FB_SWFULL={cas:8,hc:8};
function fbDefect(order,out){if(order.length<2||!out.fb)return;const mv={};order.forEach(b=>mv[b]={});
 FB_G.forEach(g=>{const r=order.filter(b=>out.fb[b]&&out.fb[b].pct&&out.fb[b].pct[g]!=null);if(r.length<2)return;
  const W=r.slice().sort((a,b)=>out.fb[b].pct[g]-out.fb[a].pct[g])[0];const pw=out.fb[W].pct[g];
  r.forEach(L=>{if(L===W)return;const pl=out.fb[L].pct[g],gap=pw-pl;const hc=g!=='cas';
   if(gap<(hc?FB_SWGAP.hc:FB_SWGAP.cas))return;if(hc&&(pl>=0||pw<=0))return;
   const n=Math.round(S.fb[L][g]*FB_SW[g]*Math.min(gap,hc?FB_SWFULL.hc:FB_SWFULL.cas)/(hc?FB_SWFULL.hc:FB_SWFULL.cas));if(n<100)return;
   S.fb[L][g]-=n;S.fb[W][g]+=n;mv[L][g]=(mv[L][g]||0)-n;mv[W][g]=(mv[W][g]||0)+n})});
 order.forEach(b=>{let T=fbSum(b);if(T<50000){S.fb[b].cas+=50000-T;T=50000}const d=T-S.fans[b];S.fans[b]=T;out.fans[b]=(out.fans[b]||0)+d;const r=out.fb[b];r.sw=mv[b];FB_G.forEach(g=>r.after[g]=S.fb[b][g])});
 const me=order.includes('p')?'p':null;if(!me)return;const won=FB_G.filter(g=>(mv.p[g]||0)>=500),lost=FB_G.filter(g=>(mv.p[g]||0)<=-500);
 const who=g=>{const o=order.filter(b=>b!=='p'&&(mv[b][g]||0)*(mv.p[g]||0)<0);return o.length?o.map(nameOf).join(' and '):'the other shows'};
 if(won.length)out.notes.push(`🔀 Switched over to you tonight: ${won.map(g=>`${fmtFans(mv.p[g])} ${fbN(g)} from ${who(g)}`).join(', ')}.`);
 if(lost.length)out.notes.push(`🔀 Switched away tonight: ${lost.map(g=>`${fmtFans(-mv.p[g])} ${fbN(g)} to ${who(g)}`).join(', ')}.`)}
/* fans from (or lost by) a story beat go to the crowds of the wrestlers in it — a kept Moxley promise grows the Bloodhounds */
/* v504: every story fan counts toward the night. While a show is airing, fbStory notes what each story move did to each
   crowd (by league seat, so it lands on the right booker however the view is swapped); airPair adds it to that night. */
let FBL=null;
function fbStoryStart(){FBL=[]}
function fbStoryTake(){if(!FBL)return [];const l=FBL.map(x=>({b:typeof localKey==='function'?localKey(x.k):x.k,g:x.g}));FBL=[];return l}
function fbStoryStop(){FBL=null}
function fbStory(fn){if(!FBL||!S||!S.fans)return fn();const ks=Object.keys(S.fans);const snap=()=>ks.map(k=>{const f=fbSync(k);return f?Object.assign({},f):null});
 const a=snap();fn();const z=snap();ks.forEach((k,i)=>{if(!a[i]||!z[i])return;const g={};let any=false;FB_G.forEach(x=>{g[x]=z[i][x]-a[i][x];if(g[x])any=true});if(any)FBL.push({k:typeof canonKey==='function'?canonKey(k):k,g})})}
Object.assign(window,{fbStory,fbStoryStart,fbStoryTake,fbStoryStop});
function fbHit(b,ws,n){return fbStory(()=>fbHitRaw(b,ws,n))}
function fbHitRaw(b,ws,n){if(!S.fans||S.fans[b]==null)return;fbSync(b);const f=S.fb[b];const gs=[];
 ws.filter(Boolean).forEach(w=>{const g=fgOf(w).filter(x=>FB_HC.includes(x));(g.length?g:['cas']).forEach(x=>gs.push(x))});if(!gs.length)gs.push('cas');
 const per=n/gs.length;gs.forEach(g=>{f[g]=Math.max(0,f[g]+Math.round(per))});let T=fbSum(b);if(T<50000){f.cas+=50000-T;T=50000}S.fans[b]=T}
Object.assign(window,{fbDefect,fbHit});

/* ---- v401: money follows the groups. Each kind of money sees its own audience, scaled so that at the typical starting split
   (FB_C0 casuals) every one of them equals your total — so a casual-heavy company earns more from TV and ads, and a hardcore-heavy
   one more from tickets, merch and PPV buys. Buzz (tickets, filling the building) is the fans' mood: how well your crowds were
   served lately (S.fbm, a running average of tonight's fan-weighted reaction). ---- */
const FB_C0=.71,FB_AUD={tv:.4,live:2,ppv:1.33};  /* tv: hardcore count .4 of a casual; live: hardcore count 2x a casual; ppv: 1.33x */
const FB_MOOD_K=.4,FB_BUZZ0=2.9,FB_BUZZK=.22;
function fbAud(b,k){if(!S||!S.fans||S.fans[b]==null)return 0;if(!fbHas(b))return S.fans[b];fbSync(b);const f=S.fb[b];const hc=FB_HC.reduce((a,g)=>a+f[g],0);const w=FB_AUD[k]||1;
 return Math.round((f.cas+w*hc)/(FB_C0+w*(1-FB_C0)))}
function fbMood(b){return S&&S.fbm&&S.fbm[b]!=null?S.fbm[b]:null}
function fbBuzz(b){const m=fbMood(b);return m==null?null:clamp(FB_BUZZ0+m*FB_BUZZK,1.5,5)}
function fbMerchF(b){if(!fbHas(b)||!S.fans[b])return 1;return clamp(Math.sqrt(fbAud(b,'live')/S.fans[b]),.8,1.25)}
function fbMoodAdd(b,r){if(!r||!r.pct)return;const f=S.fb[b];const T=fbSum(b)||1;let m=0;FB_G.forEach(g=>m+=(r.before[g]||f[g])*clamp(r.pct[g],-8,8));m/=T;
 S.fbm=S.fbm||{};S.fbm[b]=S.fbm[b]==null?m:S.fbm[b]+FB_MOOD_K*(m-S.fbm[b])}
Object.assign(window,{fbAud,fbBuzz,fbMerchF,fbMood});

/* ---- v402: the offline rival books a little for its own audience (Josh: "a little, not perfect play"). After its usual
   card, it may swap one standard match's stipulation for one its hungriest crowd loves — the crowd that's biggest and got the
   least last week, skipping any the card already feeds — if the wrestlers in that match suit it and it can afford it.
   How often it bothers grows with difficulty (FB_AI_TUNE). Suggest the rest (autoBook for you) never does this. ---- */
const FB_AI_TUNE={easy:[.5,1],normal:[1,3],hard:[1,4]};  /* v405: was easy [.4,1] / normal [.8,2] / hard [.95,3] */  /* [chance per crowd, how many crowds a show] */
function fbAiTune(b,card,show){if(!card||!S.fb||!S.fb[b])return card;const T=FB_AI_TUNE[S.diff||'normal']||FB_AI_TUNE.normal;
 const ms=card.filter(sl=>sl&&sl.k==='match'&&sl.d&&sl.d.sides&&!sl.d.tour);const H=S.fbh[b]||{};const score=g=>S.fb[b][g]*(H[g]&&H[g][0]!=null&&H[g][0]<1?1.5:1);
 for(let n=0;n<T[1];n++){if(Math.random()>T[0])continue;
  const fed={};ms.forEach(sl=>{const e=fbExpo(fbSeg(sl.d,3.5,false));for(const g in e)fed[g]=(fed[g]||0)+e[g]});
  const g=FB_HC.filter(g=>(fed[g]||0)<1).sort((x,y)=>score(y)-score(x))[0];if(!g)break;
  const opts=Object.keys(FB_STIP).filter(k=>FB_STIP[k]===g);const cash=typeof bgLeft==='function'?bgLeft(b,card,{noProd:true}):S.money[b]||0;let best=null;
  ms.forEach(sl=>{const m=sl.d;if(m.stip&&m.stip!=='std')return;const ws=m.sides.flat().map(id=>S.w[id]).filter(Boolean);if(!ws.length)return;
   /* v410: the rival doesn't repeat last show's stipulations (they'd only pull half) */const last=(S.fbls&&S.fbls[b])||[];
   opts.forEach(k=>{if(!stipOk(k,m.type,!!show.ppv)||STIPS[k].once||stipPrice(k,b)*4>cash||stipPrice(k,b)>cash||last.includes(k))return;const bon=ws.reduce((a,w)=>a+stipBon(w,k,false),0)/ws.length;if(bon<-.25)return;
    const v=bon+ws.filter(w=>fgOf(w).includes(g)).length/ws.length+Math.random()*.3;if(!best||v>best.v)best={v,m,k}})});
  if(!best)break;best.m.stip=best.k}
 return card}
if(typeof autoBook==='function'){hookStep('autoBook','fanbase.js',{after(ctx,c,brand,show,extUsed,opt){try{if(brand==='ai'&&!(typeof ON==='function'&&ON())&&show)fbAiTune(brand,c,show)}catch(e){console.warn('ai tune',e)}return c}})}

/* ---- v402: a brand's audience as one bar of its five crowds (league standings, Home, party TV) and last week's crowds on the TV ---- */
function fbBar(b){if(!S||!S.fans||S.fans[b]==null)return '';const f=fbSync(b);const T=fbSum(b)||1;
 return `<div class="fbbar" title="${FB_G.map(g=>fbN(g)+' '+fmtFans(f[g])).join(' · ')}">${FB_G.map(g=>`<i style="width:${(f[g]/T*100).toFixed(1)}%;background:${FG_C[g]}"></i>`).join('')}</div>`}
function fbLegend(){return `<div class="fbleg">${FB_G.map(g=>`<span>${fgLbl(g)}</span>`).join('')}</div>`}
function fbTvCard(){const L=S&&S.last;if(!L||!L.fb)return '';const ks=Object.keys(L.fb).filter(k=>L.fb[k]&&L.fb[k].before);if(!ks.length)return '';
 const rows=ks.sort((a,b)=>S.fans[b]-S.fans[a]).map(k=>{const r=L.fb[k];return `<div class="tv-row fbtv"><b>${esc(nameOf(k))}</b><span>${FB_G.map(g=>{const d=r.after[g]-r.before[g];return Math.abs(d)<500?'':`<span class="fbd">${fgLbl(g)} <b class="${d>0?'good':'bad'}">${d>0?'▲':'▼'}${fbK(Math.abs(d))}</b></span>`}).join('')}</span></div>`}).join('');
 let best=null,worst=null;ks.forEach(k=>FB_G.forEach(g=>{const d=L.fb[k].after[g]-L.fb[k].before[g];if(!best||d>best.d)best={k,g,d};if(!worst||d<worst.d)worst={k,g,d}}));
 const post=(x,good)=>x&&Math.abs(x.d)>=1000?`<div class="xrp"><span class="fgw">${fgLbl(x.g)}</span> <b>${esc(fbPick(FB_HANDLE[x.g],x.k+x.g))}</b><div>${esc(good?`${nameOf(x.k)} gets us. Best show on TV tonight.`:`${nameOf(x.k)} forgot we exist. Changing the channel.`)}</div></div>`:'';
 return `<div class="card xred"><div class="xrh"><b>Last week's crowds</b><span>X Redditino · Head of PR</span></div>${rows}${post(best,true)}${post(worst,false)}</div>`}
Object.assign(window,{fbBar,fbLegend,fbTvCard});
/* ---- v404: the Crowd read is gone from the Book screen (watching it became the game). Instead the crowds' night closes the
   reveal, and the booking sheet tags what each crowd craves (fbTag on stipulation, finish and run-in tiles). ---- */
const FB_WORD=[[3,'Eating well tonight','good'],[1,'Happy','good'],[-.5,'Lukewarm',''],[-2,'Only a taste — drifting','warn'],[-99,'Starving — they’re leaving','bad']];
const FB_CWORD=[[1.5,'Hooked','good'],[.3,'Tuned in','good'],[-1,'Restless',''],[-99,'Changing the channel','bad']];
function fbWord(g,p){const t=g==='cas'?FB_CWORD:FB_WORD;return t.find(x=>p>=x[0])}
const FB_THIRST={tech:'Technical fans savor this',blood:'Bloodhounds thirst for this',flip:'Flippy fans live for this',chaos:'Chaos fiends eat this up',cas:'Casuals love the spectacle'};
function fbTag(g,t,bad){return g&&FG_C[g]?`<span class="txc${bad?' no':''}" style="--fgc:${FG_C[g]}">${fgIc(g)}${t}</span>`:''}
function fbStipTag(k){const g=FB_STIP[k];return g?fbTag(g,FB_THIRST[g]):''}
/* a screwy finish only costs you with Technical fans when the match is one of theirs */
function fbFinTag(k,d){if(!['cheat','dq','co'].includes(k))return '';try{if(d&&!fbExpo(fbSeg(d,0,false)).tech)return ''}catch(e){}return fbTag('tech','Technical fans hate it',1)}
function fbRiTag(k){return fbTag('chaos',FB_THIRST.chaos)+(k==='cost'?fbTag('tech','Technical fans hate it',1):'')}
/* the end of the reveal: one line per crowd — how they took it and how many came or went */
/* v462: the quarter-hour reveal — tonight's fans, segment by segment. Each crowd's real change on the night (before → after,
   switchers included) is shared out: every segment gets what it did for that crowd (fbCalc's sc), the night-wide pieces
   (casuals tuning out, a crowd left without a match, fans switching shows) are spread evenly, and the shares always add up
   to the crowd's real total. Returns [{t: fans, g: {crowd: fans}, ic: [[crowd, ±1]…]}] in the card's segment order. */
const FB_IC_MIN=150,FB_IC_REL=.3;  /* a plate shows a crowd once that segment moved it by 150+ fans and by 30%+ of the night's biggest single move */
const FB_WHO={cas:'Casuals',tech:'Technical fans',blood:'Bloodhounds',flip:'Flippy fans',chaos:'Chaos fiends'};
function fbSplit(r,n){if(!r||!r.before||!r.after||!n)return null;const sc=r.sc&&r.sc.length===n?r.sc:null;const night={};
 const out=Array.from({length:n},()=>({t:0,g:{},ic:[]}));const sig=Array.from({length:n},()=>({}));
 const bell=[],add=(t,v)=>{if(v)bell.push([t,v])},cvt=r.cv||{},sw=r.sw||{};const cvAll=FB_HC.reduce((a,g)=>a+(cvt[g]||0),0);
 const bonus=r.bonus||[];const bonusT=bonus.reduce((a,x)=>a+x[1],0);let other=0;const hungry=[];
 FB_G.forEach(g=>{const D=Math.round((r.after[g]||0)-(r.before[g]||0));const cv=p=>p>0?FB_POOL*FB_SHARE[g]*p/100*(g==='cas'?FB_GKC:FB_GKH):(r.before[g]||0)*p/100;
  /* v465: a segment keeps only what it did itself; the night-wide rest is its own beat */
  let u=Array(n).fill(0),base=0;
  if(sc){const raw=sc.map((x,i)=>{sig[i][g]=cv(x[g]||0);return sig[i][g]});const sum=sc.reduce((a,x)=>a+(x[g]||0),0);
   /* v503: gains and losses convert at different rates, so segments pulling both ways don't add up on their own — the
      difference is shared across the segments, leaving only real night-wide causes for the bell */
   const mag=raw.reduce((a,v)=>a+Math.abs(v),0),gap=cv(sum)-raw.reduce((a,v)=>a+v,0);u=raw.map(v=>Math.round(mag?v+gap*Math.abs(v)/mag:v));base=cv(sum)}
  else{const res=D/n;let acc=0;u=u.map((x,i)=>{const v=i===n-1?D-acc:Math.round(res);acc+=v;return v})}
  u.forEach((v,i)=>{out[i].g[g]=v;out[i].t+=v});night[g]=D-u.reduce((a,x)=>a+x,0);
  if(!sc)return;
  /* what moved the crowd beyond its segments: the casual drop-off (and a new champion), or going short of a full serving */
  const p=r.pct&&r.pct[g]||0,own=Math.round(cv(p)-base);let used=own+(g==='cas'?bonusT-cvAll:(cvt[g]||0))+(sw[g]||0);
  if(g==='cas'){const champ=r.nc?Math.round(cv(p)-cv(p-r.nc)):0;const nc=r.nc||0,arc=r.arcStory?Math.round(cv(p-nc)-cv(p-nc-r.arcStory)):0;add('New champion buzz',champ);add('Casuals following the arcs',arc);add('Casual weekly drop-off',own-champ-arc)}
  else if(own)hungry.push([g,own,r.E&&r.E[g]>.001]);
  other+=night[g]-used});
 hungry.forEach(([g,v,taste])=>add(taste?`${FB_WHO[g]} only got a taste`:`Nothing on the card for ${FB_WHO[g]}`,v));
 bonus.forEach(([t,v])=>add(t,v));
 /* fans who switched shows, by direction, naming the crowds ({them} is filled in with the other booker at the reveal) */
 [1,-1].forEach(d=>{const l=FB_G.filter(g=>(sw[g]||0)*d>0).sort((a,b)=>(sw[b]-sw[a])*d);if(!l.length)return;
  add(`${fbList(l.map(g=>FB_WHO[g]))} ${d>0?'came over from':'left for'} {them}`,l.reduce((a,g)=>a+sw[g],0))});
 /* rounding and the floor on total fans: folded into the biggest line unless it's big enough to name */
 const tot=FB_G.reduce((a,g)=>a+night[g],0);const left=tot-bell.reduce((a,x)=>a+x[1],0);
 if(Math.abs(left)>=100||!bell.length)add('Other fan changes',left);else if(left){bell.slice().sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0][1]+=left}
 bell.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
 const top=Math.max(0,...sig.flatMap(x=>Object.values(x).map(Math.abs))),cut=Math.max(FB_IC_MIN,top*FB_IC_REL);
 out.forEach((o,i)=>{o.ic=FB_G.map(g=>[g,sig[i][g]||0]).filter(x=>Math.abs(x[1])>=cut).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,3).map(x=>[x[0],x[1]>0?1:-1])});
 /* conversions move fans between your own crowds, so they sit beside the receipt rather than in it */
 return {segs:out,night:tot,bell,conv:FB_HC.filter(g=>(cvt[g]||0)>=100).map(g=>[g,cvt[g]])}}
const fbList=l=>l.length<2?l.join(''):l.slice(0,-1).join(', ')+' and '+l[l.length-1];
function fbNight(r){return r&&r.before&&r.after?FB_G.reduce((a,g)=>a+Math.round((r.after[g]||0)-(r.before[g]||0)),0):null}
window.fbSplit=fbSplit;window.fbNight=fbNight;
/* one line on why a crowd moved */
function fbWhyLine(r,g){return r&&r.wy&&r.wy[g]?`<i class="srwy">${esc(r.wy[g])}</i>`:''}
function fbRevealHtml(o,instant){const r=o&&o.fb&&o.fb.p;if(!r||!r.before||!r.after||!r.pct)return '';const top=fbTopMoves(r);
 const rows=FB_G.map((g,n)=>{const v=fbVd(r,g);const d=Math.round(r.after[g]-r.before[g]);
  return `<div class="srcr"${instant?'':` style="animation-delay:${n*110}ms"`}><span class="fgw">${fgLbl(g)}</span><b class="${v[1]}">${v[0]}</b>${Math.abs(d)<100?'<em class="muted">steady</em>':`<em class="${d>0?'good':'bad'}">${d>0?'▲':'▼'}${fbK(Math.abs(d))}</em>`}${top.includes(g)?fbWhyLine(r,g):''}</div>`}).join('');
 return `<div class="srcrowd${instant?'':' in'}"><div class="srch">How they took your show</div>${rows}${fbNextHtml(r,instant?'':` style="animation-delay:${FB_G.length*110}ms"`)}</div>`}
/* the crowd reveal, after both main events and before the winner: one booker's night at a time. The two fan totals above
   the chart switch between them (srWho in index.html). It opens on 'p': the names come up, then each row's verdict and fans. */
const FB_REV={row:90,cell:200,p0:550};
const FB_REV_MS=FB_REV.p0+6*FB_REV.cell+250;
/* br: whose night. who: that booker's name, or empty for your own. A Next time tip only shows on your own. */
function fbCrowdOne(o,br,instant,who){const r=o&&o.fb&&o.fb[br];if(!r||!r.before||!r.after||!r.pct)return '';
 const dl=g=>Math.round(r.after[g]-r.before[g]);const n=FB_G.length;
 const at=t=>instant?'':` style="animation-delay:${t}ms"`;
 /* the reasons are worded for the booker reading about their own show */
 const why=g=>{const t=r.wy&&r.wy[g];return t&&who?t.replace('than your usual','than their usual').replace('up to your usual','up to their usual'):t};
 const top=fbTopMoves(r);
 const rows=FB_G.map((g,k)=>{const v=fbVd(r,g),d=dl(g),pop=at(FB_REV.p0+k*FB_REV.cell),w=top.includes(g)?why(g):'';return `<div class="srcr2"${at(k*FB_REV.row)}><span class="fgw">${fgLbl(g)}<b class="srv2 ${v[1]}"${pop}>${v[0]}</b></span><em class="srv2 ${Math.abs(d)<100?'muted':d>0?'good':'bad'}"${pop}>${Math.abs(d)<100?'steady':(d>0?'▲':'▼')+fbK(Math.abs(d))}</em>${w?`<span class="srv2 srwyr"${pop}><i class="srwy">${esc(w)}</i></span>`:''}</div>`}).join('');
 const t=FB_G.reduce((a,g)=>a+dl(g),0);
 return `<div class="srcrowd srone${instant?'':' in'}" data-br="${br}"><div class="srcr2 hd"><span class="srch">How they took ${who?esc(who)+'’s':'your'} show</span></div>${rows}<div class="srcr2 tot"${at(n*FB_REV.row)}><span>All fans</span><b class="srv2 ${t>=0?'good':'bad'}"${at(FB_REV.p0+n*FB_REV.cell)}>${t>=0?'+':'−'}${fbK(Math.abs(t))}</b></div>${typeof xrFeedHtml==='function'?xrFeedHtml(o,br,!who,at(FB_REV_MS-250),who):who?'':fbNextHtml(r,at(FB_REV_MS-250))}</div>`}
window.fbCrowdOne=fbCrowdOne;window.FB_REV_MS=FB_REV_MS;
/* ---- after the show: The fans, then X Redditino (Head of PR) ---- */
const FB_HANDLE={cas:['@JustHereForTheBelts','@MyDadWatchesThis','@CasualTuesdayKev'],tech:['@ChainWrestlingCarl','@HeadlockHistorian','@SnapSuplexSue'],
 blood:['@CrimsonMaskMike','@BarbedWireBetty','@BladeJobBrandon'],flip:['@SpotMonkeyKai','@ShootingStarSam','@450Splashley'],chaos:['@RunInRhonda','@NoDQNate','@SwerveSzn']};
const FB_WANT={cas:'bigger stars and title matches',tech:'a straight-up technical match — two technicians, clean finish, no run-ins',blood:'a street fight, a cage, something with blood in it',flip:'high-flyers, a ladder match or a multi-person spotfest',chaos:'run-ins, a No DQ brawl, a Chaos wrestler with a live mic'};
function fbPick(a,k){let h=0;const s=String(k)+'|'+AW();for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return a[Math.abs(h)%a.length]}
const fbK=n=>Math.abs(n)<10000?(Math.abs(n)<100?'0':(n/1000).toFixed(1).replace(/\.0$/,'')+'K'):fmtFans(n);
function fbResultsCard(o){const r=o&&o.fb&&o.fb.p;if(!r||!r.before)return '';const tb=FB_G.reduce((a,g)=>a+r.before[g],0),ta=FB_G.reduce((a,g)=>a+r.after[g],0);
 const rows=FB_G.map(g=>{const d=r.after[g]-r.before[g];const sw=r.sw&&r.sw[g]||0;const why=(r.vd&&r.vd[g]?r.vd[g]+': ':'')+(r.why[g]||'')+(Math.abs(sw)>=500?` · ${fmtFans(Math.abs(sw))} ${sw>0?'switched over from':'switched to'} the other show`:'');return `<div class="fbr"><span class="fgw">${fgLbl(g)}</span><span class="fbn">${fmtFans(r.before[g])} → <b>${fmtFans(r.after[g])}</b> <b class="${d>=0?'good':'bad'}">${d>=0?'▲':'▼'}${fbK(Math.abs(d))}</b></span><small>${esc(why)}</small></div>`}).join('');
 return `<div class="card fbres"><div class="row sb"><div class="h small" style="margin:0">The fans</div><span class="tiny">${fmtFans(tb)} → <b>${fmtFans(ta)}</b></span></div>${rows}${r.conv>=500?`<div class="muted tiny" style="margin-top:6px">${fmtFans(r.conv)} casual fans became hardcore fans tonight.</div>`:''}</div>
 ${typeof xrFeedHtml==='function'?`<div class="card" style="padding:0">${xrFeedHtml(o,'p',true,'')}</div>`:''}`}
/* ---- undiscovered wrestlers find their crowd through who they work with ---- */
const FB_LINE=45,FB_BREAK=50,FB_FIND=4,FB_LEAD=1.5;
function fgLean(id){const x=S.fgx&&S.fgx[id];if(!x||!x.l)return null;const e=Object.entries(x.l).sort((a,b)=>b[1]-a[1]);return e.length&&e[0][1]>0?e[0][0]:null}
function fgLock(w,g,why,notes){S.fgx=S.fgx||{};const x=S.fgx[w.id]=S.fgx[w.id]||{l:{},n:0};x.g=g;x.at=AW();
 if(w.own==='p'||(typeof ON==='function'&&ON()&&w.own)){const n=`🔎 ${w.name} has found their crowd: ${fbN(g)}${why?' — '+why:''}.`;news(n);if(notes)notes.push(n)}}
function fgAfterShow(segs,notes){S.fgx=S.fgx||{};segs.filter(s=>s.k==='match').forEach(s=>{const ws=s.ids.map(id=>S.w[id]).filter(Boolean);
 ws.forEach(w=>{if(!fgUnd(w))return;const x=S.fgx[w.id]=S.fgx[w.id]||{l:{},n:0};const others=ws.filter(o=>o!==w&&!fgUnd(o));
  others.forEach(o=>{const gs=fgOf(o).filter(g=>FB_HC.includes(g));gs.forEach((g,i)=>x.l[g]=(x.l[g]||0)+(gs.length>1?(i?.4:.6):1)/Math.max(1,others.length))});
  const sg=FB_STIP[s.stip];if(sg&&sg!=='cas')x.l[sg]=(x.l[sg]||0)+.5;if(FB_MULTI[s.type])x.l.flip=(x.l.flip||0)+.5;if(s.ri)x.l.chaos=(x.l.chaos||0)+.5;x.n++;
  const e=Object.entries(x.l).sort((a,b)=>b[1]-a[1]);if(x.n>=FB_FIND&&e[0]&&e[0][1]>=2&&e[0][1]>=(e[1]?e[1][1]:0)*FB_LEAD)fgLock(w,e[0][0],'',notes)})})}
/* a popularity breakout locks the current lean; warn first, while there's still time to steer them */
function fgWeek(notes){Object.values(S.w).forEach(w=>{if(!fgUnd(w))return;S.fgx=S.fgx||{};const x=S.fgx[w.id]=S.fgx[w.id]||{l:{},n:0};const ln=fgLean(w.id);
 if(w.pop>=FB_BREAK){fgLock(w,ln||FG_STYLE[w.st]||'blood','their breakout locked it in',notes);return}
 if(w.pop>=FB_LINE&&!x.warn&&w.own==='p'){x.warn=AW();const n=`📈 ${w.name} is about to break out${ln?` — still leaning ${fbN(ln)}`:' and hasn’t leaned any way yet'}. Book them with the crowd you want them to land with before it locks in.`;news(n);if(notes)notes.push(n)}})}
/* reinvention: a wrestler who's been left off TV for weeks or is miserable asks to try a different crowd */
const FB_REIN_WK=6,FB_REIN_MOR=35,FB_REIN_OUT=4;
function fgReinWant(w){if(!w||w.own!=='p'||w.inj||fgUnd(w))return false;const x=S.fgx&&S.fgx[w.id];if(x&&x.ask&&AW()-x.ask<(x.did?40:20))return false;if(w.rein||w.inj||w.con<=FB_REIN_OUT+1)return false;try{if(isChamp(w.id)||(typeof arcIn==='function'&&arcIn(w.id))||inFeud(w.id))return false}catch(e){}if(x&&x.g&&x.at&&AW()-x.at<10)return false;
 return (S.week-(w.last||0))>=FB_REIN_WK&&S.week>FB_REIN_WK||w.mor<FB_REIN_MOR}
function fgReinvent(id,g){const w=S.w[id];if(!w)return;S.fgx=S.fgx||{};const x=S.fgx[id]=S.fgx[id]||{l:{},n:0};x.ask=AW();
 if(g&&g!=='no'){x.pend=g;x.did=1;w.inj=Math.max(w.inj||0,FB_REIN_OUT);w.susp=true;w.rein=1;w.mor=clamp(w.mor+8,0,100);news(`🎭 ${w.name} is away for ${FB_REIN_OUT} weeks, relearning how to work for the ${fbN(g)}.`)}else{w.mor=clamp(w.mor-4,0,100);news(`🎭 You told ${w.name} to stay the course.`)}
 try{save()}catch(e){}try{if(typeof closeModal==='function')closeModal()}catch(e){}try{render()}catch(e){}}
/* back from retraining: the new crowd takes effect now */
function fgReinBack(w){const x=S.fgx&&S.fgx[w.id];const g=x&&x.pend;delete w.rein;w.fat=0;if(x&&g){x.g=g;x.at=AW();delete x.pend;return `🎭 ${w.name} is back, rebuilt for the ${fbN(g)}.`}return `✅ ${w.name} is back.`}
function fgReinBrief(){if(!S||S.phase!=='season')return [];const ask=Object.values(S.w).filter(fgReinWant).sort((a,b)=>a.mor-b.mor).slice(0,1);
 return ask.map(w=>{const cur=fgOf(w)[0];const opts=FB_G.filter(g=>g!==cur);
  return {i:'🎭',t:`${w.name} wants a reinvention`,u:false,rows:[`<div class="brow">${esc(w.name)} <span class="fgw">${fgLbl(cur)}</span><br><span class="muted tiny">${w.mor<FB_REIN_MOR?'Miserable':'Off TV for weeks'}. Pick a new crowd and they're gone ${FB_REIN_OUT} weeks relearning how to work, or tell them to stay the course.</span><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">${opts.map(g=>`<button class="mini" onclick="fgReinvent('${w.id}','${g}')">${fbN(g)}</button>`).join('')}<button class="mini ghost" onclick="fgReinvent('${w.id}','no')">Stay the course</button></div></div>`]}})}
if(typeof briefItems==='function'){hookStep('briefItems','fanbase.js',{around(b0,...args){const s=b0.apply(this,args);try{return fgReinBrief().concat(s)}catch(e){console.warn('rein',e);return s}}})}
hookStep('endWeek','fan groups: weekly',{before(ctx,notes){try{fgWeek(notes)}catch(e){console.warn('fg week',e)}}});
(function(){const c=document.createElement('style');c.textContent=`
.srcr2 .srwyr,.srcr .srwy{grid-column:1/-1}.srcr2 .srwyr .srwy,.srcr .srwy{font-size:13px;line-height:1.3;color:#c9c4bc;margin-top:2px}
.srcrowd .srcr2{align-items:center;row-gap:0;padding:4px 0}.srcrowd .srcr2 .fgw{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:0 8px}.srcrowd.srone{margin-top:2px;padding-top:6px}.srcrowd .srcr2 .fgw b{margin:0;font-size:16px}.srcrowd .srcr2 .fgw b.good,.srcrowd .srcr b.good{color:var(--good)}.srcrowd .srcr2 .fgw b.bad,.srcrowd .srcr b.bad{color:var(--bad)}
.srcrowd .srcr2.hd{align-items:end;padding:0 0 2px}.srcrowd .srcr2.tot{padding:6px 0 1px}.srcr2.hd .srch{grid-column:1/-1;text-align:left;color:var(--gold);margin:0;white-space:normal;font-size:11px;letter-spacing:.1em}
.srnext{margin:6px 0 0;padding:6px 10px;background:#1d1d22}.srnext b{display:block;font-size:12px;margin-bottom:3px}.srnext span{display:block;font:500 14px/1.35 'Barlow',system-ui,sans-serif}
.srcrowd.in .srnext{opacity:0;animation:srcrIn .3s ease-out forwards}.srcrowd.now .srnext{animation:none!important;opacity:1!important}`;document.head.appendChild(c)})();
Object.assign(window,{fbSync,fbSyncAll,fbSeg,fbPromo,fbCalc,fbApply,fbResultsCard,fbRevealHtml,fbTag,fbStipTag,fbFinTag,fbRiTag,fgAfterShow,fgReinvent,fgReinBack,fgLean,FB_STIP});

(function(){const s=document.createElement('style');s.textContent=`
.fgw{font:800 italic 1em/1 'BC',sans-serif;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}.fgw b{margin:0 .3em;color:#8a8580;font-weight:700}
.fgi{display:inline-block;width:1.2em;height:1.2em;margin-right:.25em;vertical-align:-.24em;fill:none;stroke:currentColor;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round;flex:none}
.fg-cas{color:#efe9dc}.fg-tech{color:#7fa7d6}.fg-blood{color:#e5463b}.fg-flip{color:#3fc8b4}.fg-chaos{color:#b77ee8}.fg-und{color:#9a958c}
.tkc .tcfg{display:flex;flex-wrap:wrap;gap:2px 3px;margin-bottom:calc(var(--w)*.035);font-size:calc(var(--w)*.088);text-shadow:none}.tkc .tcfg b{display:none}
.tkc .tcfg i{display:flex;align-items:center;justify-content:center;width:calc(var(--w)*.2);height:calc(var(--w)*.2);min-width:13px;min-height:13px;background:#000;box-shadow:inset 0 0 0 1px #4a4128}.tkc .tcfg .fgi{width:72%;height:72%;margin:0;stroke-width:2.5}
.fbres .fbr{display:grid;grid-template-columns:7.2em 1fr;gap:0 10px;align-items:baseline;padding:6px 0;border-top:1px solid rgba(255,255,255,.06)}
.fbres .fbr:first-of-type{border-top:0}.fbres .fbr .fgw{font-size:13px}
.fbres .fbr small{grid-column:2;color:var(--muted,#9a958c);font-size:12.5px}
.fbres .fbn{font-size:14px}.fbres .fbn b{font-weight:700}
.xred{border-left:3px solid var(--gold)}.xred .xrh{display:flex;gap:8px;align-items:baseline}.xred .xrh b{font:900 italic 17px/1 'BC',sans-serif;text-transform:uppercase}.xred .xrh span{color:var(--gold);font:700 12px 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase}
.xred .xro{margin:8px 0 6px;font-size:15px}.xred .xrp{margin-top:8px;padding:8px 10px;background:#0f0f12;clip-path:polygon(0 0,100% 0,calc(100% - 8px) 100%,0 100%);font-size:14px}.xred .xrp .fgw{font-size:11px}.xred .xrp b{font-size:13px;color:#ddd}
.fbbar{display:flex;height:6px;margin-top:4px;background:#222;overflow:hidden}.fbbar i{display:block;height:100%}
.fbleg{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:6px;font-size:12px;color:var(--muted,#9a958c)}.fbleg .fgi{width:13px;height:13px;margin-right:3px;vertical-align:-2px}
.fbtv{align-items:baseline;gap:12px}.fbtv>span{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:flex-end}.fbtv .fbd i{font:800 italic 1em 'BC',sans-serif;text-transform:uppercase;font-style:italic}
.xred .xra{margin-top:8px;color:var(--gold);font-size:13.5px}
.txc{display:block;margin-top:5px;padding-left:5px;border-left:3px solid var(--fgc);color:var(--fgc);font:800 italic 10.5px/1.15 'BC',sans-serif;letter-spacing:.04em;text-transform:uppercase}
.txc .fgi{width:1.25em;height:1.25em;margin-right:.3em;vertical-align:-.28em}.txc.no .fgi{color:var(--fgc)}.fgk{margin-right:.4em}.flfg .chip.fgc{display:inline-flex;align-items:center;gap:4px;min-width:40px;justify-content:center}.flfg .chip.fgc .fgi{margin:0;width:17px;height:17px}.flfg .chip.fgc.on span{color:#140f02}
.txc.no{color:#9a958c}.txc.no::before{content:"✕ ";color:#e0574f}.txc+.txc{margin-top:3px}.tx.on .txc{color:#3a2e0a}
.srcrowd{margin:8px auto 4px;width:100%;max-width:420px;padding:8px 12px 6px;background:#0f0f12;border-top:2px solid var(--gold);text-align:left}
.srch{font:800 italic 11px/1 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}
.srcr{display:grid;grid-template-columns:7.4em 1fr auto;gap:8px;align-items:baseline;padding:4px 0;border-top:1px solid rgba(255,255,255,.06)}
.srcr:first-of-type{border-top:0}.srcr .fgw{font-size:12.5px}.srcr b{font:800 italic 14px/1.1 'BC',sans-serif;text-transform:uppercase}.srcr b.warn{color:var(--gold)}
.srcr em{font:700 13px 'BC',sans-serif;font-style:normal;white-space:nowrap}
.crcov{display:grid;grid-template-columns:auto repeat(5,1fr);align-items:center;gap:6px;margin:2px 0 10px}.crcov .crcl{font:800 italic 11px/1.05 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-right:4px;max-width:5.5em}
.crcov .crc{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:40px;background:#111114;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);transition:background .25s,box-shadow .25s,color .25s}
.crcov .crc .fgi{display:block;width:18px;height:18px;margin:0;transition:filter .25s,opacity .25s}
.crcov .crc::after{content:'';display:block;width:16px;height:3px;background:linear-gradient(90deg,var(--lt1,rgba(255,255,255,.14)) 0 7px,transparent 7px 9px,var(--lt2,rgba(255,255,255,.14)) 9px)}
.crcov .crc.l0{color:rgba(255,255,255,.3)}.crcov .crc.l0 .fgi{opacity:.55}
.crcov .crc.l1{background:color-mix(in srgb,currentColor 9%,#111114);box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 45%,transparent);--lt1:currentColor}.crcov .crc.l1 .fgi{opacity:.85}
.crcov .crc.l2{background:color-mix(in srgb,currentColor 24%,#111114);box-shadow:inset 0 0 0 2px currentColor,0 0 12px color-mix(in srgb,currentColor 45%,transparent);--lt1:currentColor;--lt2:currentColor}.crcov .crc.l2 .fgi{filter:drop-shadow(0 0 4px currentColor)}
.tell.fmeet{color:var(--gold2);background:rgba(216,180,73,.12);box-shadow:inset 0 0 0 1px rgba(216,180,73,.45)}
.crseg{display:inline-flex;gap:3px;vertical-align:middle;margin-right:4px}.crseg i{display:inline-grid;place-items:center}.crseg .fgi{width:15px;height:15px}
.srcr2{display:grid;grid-template-columns:1fr 5.2em;gap:8px;align-items:baseline;padding:5px 0;border-top:1px solid rgba(255,255,255,.06)}.srcr2 .fgw{font-size:12.5px;display:flex;flex-direction:column;gap:1px}.srcr2 .fgw b{font:800 italic 12px/1.1 'BC',sans-serif;text-transform:uppercase}.srcr2 .fgw b.warn{color:var(--gold)}
.srcr2 em{font:700 13px 'BC',sans-serif;font-style:normal;white-space:nowrap;text-align:right}.srcr2.hd{border-top:0;padding-bottom:2px}.srcr2.hd span{font:800 italic 11px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--gold2);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.srcr2.tot{border-top:1px solid rgba(255,255,255,.2)}.srcr2.tot span{font:800 italic 13px 'BC',sans-serif;text-transform:uppercase}.srcr2.tot b{text-align:right;font:800 15px 'BC',sans-serif}
.srcrowd.in .srcr2{opacity:0;animation:srcrIn .35s ease-out forwards}.srcrowd.in .srcr2.hd{opacity:1;animation:none}
.srcrowd.in .srcr{opacity:0;animation:srcrIn .3s ease-out forwards}
.srcrowd.in .srcr2 .srv2{opacity:0;animation:srcrPop .32s cubic-bezier(.2,1.4,.4,1) forwards}@keyframes srcrPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.srcrowd.now .srcr2,.srcrowd.now .srv2{animation:none!important;opacity:1!important;transform:none!important}
.srcr2 em.srv2,.srcr2 b.srv2{display:block}.srcr2 span.srv2{display:block}.srwy{display:block;margin-top:2px;font:500 12px/1.3 system-ui,sans-serif;font-style:normal;letter-spacing:0;text-transform:none;color:#a29d96;white-space:normal}@keyframes srcrIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
body.tv .srcrowd{display:none}
.tlrow .tkc .tcfg,.twcd .tkc .tcfg{display:none}
`;document.head.appendChild(s)})();
