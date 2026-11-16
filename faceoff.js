/* Tony Khan Simulator — face-off cards for the promo and match showdowns (v261).
   Both wrestlers stay on stage side by side instead of the camera whipping between them. Whoever is acting lights up
   with a tag over their card: on the mic, on the attack (their card lunges at the other, who takes the hit), a miss
   (the card stumbles), or hurt. Everyone else dims. The classes travel with the HTML, so the party TV shows the same thing.
   v306: in the match showdown each line's move is read (foKind) and the cards act it out — dives, slams, spears,
   strikes, holds, pins, kick-outs, tap-outs and more, with a comic burst on the big hits.
   Loaded after promoshow.js and matchshow.js. */
'use strict';
/* v306: what the move is — named finishers and signatures first, then the words in the line. Lines are matched with
   the actor as {S} and the other side as {O}. Weak kinds (going up, playing to the crowd…) only win when nothing
   physical happens in the line. */
const FO_NAMED={'go to sleep':'strike','judas effect':'strike','rainmaker':'strike','hayterade':'strike','trick shot':'strike','boom knee':'strike','house call':'strike','v-trigger':'strike','curb stomp':'strike','stomp':'strike','svb':'strike','devil':'strike',
 'claymore':'spear','spear':'spear','pounce':'spear',
 'cross rhodes':'slam','death rider':'slam','k.o.d.':'slam','natural selection':'slam','oblivion':'slam','one-winged angel':'slam','rko':'slam','riptide':'slam','south of heaven':'slam','storm breaker':'slam','storm zero':'slam','stunner':'slam','unprettier':'slam','beach break':'slam','becksploder':'slam','mexican destroyer':'slam','backstabber':'slam','eye of the storm':'slam','staturday night fever':'slam','heat seeker':'slam','killswitch':'slam','jaded':'slam','moné maker':'slam','the message':'slam','fall from grace':'slam','double cross':'slam','bft':'slam','big pressure':'slam','muscle buster':'slam','manhandle slam':'slam',
 'code red':'fly','oscutter':'fly','tsunami':'fly','twisted bliss':'fly','coffin drop':'fly',
 'salt of the earth':'hold','statement maker':'hold','lockjaw':'hold','dis-arm-her':'hold','hurt lock':'hold'};
const FO_RX={
 fly:/off the (very )?top|from the top|comes off|springboard|(?<!mid-)\bleaps?\b|\bflies\b(?! up)|flying|\bdives?\b(?! on top)|\bjumps\b|moonsault|splash|senton|plancha|\btope\b|crossbody|shooting star|swanton|\b450\b|launch(es)? (through|off|over|into|themsel)|soars|takes flight/i,
 spear:/\bspears?\b|tackle|\bcharges?\b|runs through \{O\}|barrels|pounces?\b|shoulder block/i,
 slam:/slam(?!s the lid)|suplex|powerbomb|piledriv|driver\b|brainbuster|\bddt\b|belly-to-belly|through (the |a )?(table|announce|desk|barricade)|drives \{O\}|buster\b|\bthrows \{O\}|\btosses\b|hip toss|\blifts\b|hoists|presses \{O\}|muscles? \{O\} up|backbreaker|cutter|stunner|\brko\b|neckbreaker|bulldog(?! choke)|spine-first|destroyer|sends \{O\} (over|into|flying)|into the (post|turnbuckle|barricade)/i,
 weapon:/\bchairs?\b|kendo|belt shot|hammer|ladder into|with the ladder|swings the|trash can|barbed|thumbtack|\btacks\b|stapler|(ring|steel|the) steps\b|toolbox|crowbar|\bbat\b|the steel/i,
 strike:/punch|\bkicks?\b|superkick|lariat|clothesline|\bknees?\b|elbow|\bchops?\b|chop-block|forearm|\bslaps?\b(?! it away)|slapping|\bboots?\b|headbutt|\bstrikes?\b|fists|throwing hands|fires back|\bstomp(s|ing)?\b|dropkick|uppercut|enziguri|haymaker|flurry|beats? (down|on)|blindsides|rakes|\beyes\b|low blow|clobbers|lays (them|\{O\}) out|drops \{O\}|wallops|batters|clean shot/i,
 hold:/\bholds?\b(?! (it|on|the|up))|\block(s|ed)?\b|lock(s)? in|wristlock|headlock|chinlock|cravate|clutch|vise|\btrap(ped|s)?\b|choke|sleeper|figure[- ](four|eight)|sharpshooter|crossface|armbar|submission|crank|tightens|stretch|camel|dis-arm|anaconda|lockjaw|grapevine|wrenches|grinds|\bties\b|applies/i,
 pin:/\bcover(s|ing)?\b|hooks? the leg|rolls? (\{O\}|them) up|roll-?up|\bpin(s|fall)?\b|small package|drapes an arm|on top of them|dives on top|stacks \{O\}|shoulders (flat|down)|cradle|schoolboy/i};
const FO_WEAK={stare:/\bcircle\b|stare|face to face|nose to nose|square off|lockups?|sizes? (each other|\{O\}) up/i,
 taunt:/crowd|\bposes?\b|taunt|arms? raised|arms crossed|raises (one|both|a|his|her|their) (hand|arm|fist)|soaks|winks?\b|mirrors|plays to|points (at|to)|salute|celebrat/i,
 climb:/\bclimbs?\b|\bclimbing\b|the climb|to the top|up the ladder|goes up top|perches?/i,
 out:/\brolls? out\b|to the floor|hits the floor|tumbles|crashes (into|to) the floor|spills|falls? (off|out|to)|\bis down\b|regroup|stumbles/i};
const FO_LAB={fly:'🦅 Off the top',spear:'⚡ Spear',slam:'💥 Slam',weapon:'🪑 Weapon shot',strike:'👊 Strike',hold:'🔒 Locked in',pin:'📌 The cover',climb:'🪜 Going up',out:'⬇️ Down and out',taunt:'🙌 Playing to the crowd',stare:'👀 Face to face',kickout:'✋ Kicks out',tap:'🏳️ Taps out',dodge:'↩️ Slips away',rope:'🪢 To the ropes',fin:'💥 The finisher'};
const FO_EMO={fly:'🦅',spear:'⚡',slam:'💥',weapon:'🪑',strike:'👊',hold:'🔒',pin:'📌'};
const FO_SOLO={climb:1,out:1,taunt:1,tap:1,rope:1};
const foClean=s=>String(s||'').replace(/^(a|an|the)\s+/i,'');
function foNamed(n){const k=foClean(n).toLowerCase();if(Object.hasOwn(FO_NAMED,k))return FO_NAMED[k];for(const kd in FO_RX)if(kd!=='pin'&&FO_RX[kd].test(k))return kd;return null}
const foMk=(k,lab,x)=>Object.assign({k,lab:lab||FO_LAB[k],solo:FO_SOLO[k]?1:0},x||{});
/* t: the line with the actor as {S}, the other side as {O} · move: {name, fin} when the line names a move */
function foKind(t,move){t=String(t||'');const lead=/^\W*\{S\}/.test(t);
 if(lead&&/^\W*\{S\} (eventually |finally )?taps\b/i.test(t))return foMk('tap');
 if(lead&&/kicks? out|shoulder|shoots up/i.test(t))return foMk('kickout');
 if(lead&&/\bropes?\b/i.test(t)&&/reach|crawl|fingertip|leg on|foot on|boot (on|down)|grab|hooks the rope|drags|using the ropes|skins the cat/i.test(t))return foMk('rope');
 if(lead&&/^\W*\{S\} (simply |just |somehow )?(steps aside|sidesteps|side-steps|ducks|rolls (off|away|out of the way|underneath|through)|moves at the last|dodges|slides (out|off)|gets out of the way|slips out)/i.test(t))return foMk('dodge');
 if(/unhooks it|grabs it|holds it (high|up)/i.test(t))return foMk('taunt','🏆 Grabs it',{solo:1});
 if(/offers a hand|handshake|\bhugs?\b/i.test(t))return foMk('taunt','🤝 Shows respect',{solo:1});
 if(move&&move.name){const k=foNamed(move.name)||(move.fin?'slam':null);if(k)return foMk(k,(FO_EMO[k]||'💥')+' '+foClean(move.name),{fin:move.fin?1:0,solo:0})}
 if(/\b(hits|goes for|drills \{O\} with) (the|a) finisher\b/i.test(t))return foMk('slam',FO_LAB.fin,{fin:1});
 let best=null,at=1e9;for(const k in FO_RX){const m=t.match(FO_RX[k]);if(m&&m.index<at){at=m.index;best=k}}
 if(best)return foMk(best);
 for(const k in FO_WEAK)if(FO_WEAK[k].test(t))return foMk(k);
 return null}

const FO_TAG={talk:'🎤 On the mic',move:'💥 On the attack',hit:'',miss:'❌ Missed it',hurt:'🩹 Hurt',act:''};
const FO_RTAG={hold:'😣 Trapped',pin:'📌 Pinned',stare:'',kickout:'',dodge:'',spear:'',weapon:''};
/* the comic burst over whoever takes it, timed to the moment of impact in that move's animation */
/* v308: a pool per move, campy '60s-TV-fight style — one is picked at random each hit */
const FO_POW={strike:['POW!','BAM!','BIFF!','SOCK!','WHAM!','ZOK!','KAPOW!','THWACK!','BOFF!','ZAP!','YOWCH!','OOOF!'],
 slam:['THUD!','KA-RUNCH!','CRUNCH!','WHAMM!','ZLOPP!','KER-SPLAT!','OOOFF!','MAMMA MIA!','BONK!'],
 fly:['BOOM!','ZOWIE!','KA-BLAM!','SPLAT!','WHOOSH!','GOLLY GEE!','ZWAPP!'],
 spear:['SMASH!','KRUNCH!','WHAP!','KER-POW!','OOOFF!','YOWCH!'],
 weapon:['CRACK!','CLANK!','KLONK!','BONK!','THWACK!','CLANG!'],
 fin:['KA-BOOM!','MAMMA MIA!','ZOWIE!','KAPOW!','WHAMMM!','HOLY MOLY!'],
 flymiss:['THUD!','SPLAT!','OUCH!','YOWCH!','KER-PLUNK!']};
const foPow=k=>{const a=FO_POW[k];return a[Math.floor(Math.random()*a.length)]};
const FO_KS=['fly','spear','slam','weapon','strike','hold','pin','climb','out','taunt','stare','kickout','tap','dodge','rope'];
/* side: 'a' | 'b' | null (nobody — commentary, crowd) · role: talk | move | miss | hurt | act · lab: optional tag text
   mv (v306): what the move is (foKind) — the cards act it out: a dive arcs over and crashes down, a slam lifts the
   other card and drives it into the mat, a hold drags both cards together and shakes, a kick-out throws the other card off */
function foPose(side,role,lab,mv){const sd=document.getElementById('sd');if(!sd||!sd.classList.contains('duo'))return;
 const other=side==='a'?'b':side==='b'?'a':null;
 const live=mv&&(role==='move'||role==='act'||role==='miss')?mv:null;const miss=live&&role==='miss';
 /* v305: clear both cards, then one reflow to restart their animations (was one forced layout per card) */
 const CL=['on','dim','talk','move','hit','miss','hurt','act','fin','rmiss',...FO_KS.map(k=>'k-'+k),...FO_KS.map(k=>'r-'+k)];sd.querySelectorAll('.sdc.ca,.sdc.cb').forEach(c=>c.classList.remove(...CL));
 let fx=sd.querySelector('.fofx');if(!fx){fx=document.createElement('div');fx.className='fofx';sd.appendChild(fx)}fx.className='fofx';fx.textContent='';
 sd.classList.remove(...FO_KS.map(k=>'q-'+k));void sd.offsetWidth;
 ['a','b'].forEach(k=>{const c=sd.querySelector('.sdc.c'+k);if(!c)return;const t=c.querySelector('.sdact');
  let r=null,x=[];if(side&&k===side){r=role;if(live){x.push('k-'+live.k);if(live.fin&&!miss)x.push('fin')}}
  else if(k===other){if(live&&!live.solo){if(miss){r='act';x.push('rmiss','r-'+live.k)}else{r='hit';x.push('r-'+live.k)}}else if(role==='move'&&!live)r='hit'}
  if(r){c.classList.add('on',r,...x)}else if(side)c.classList.add('dim');
  let tx='';if(r){if(k===side)tx=lab||(live?(miss?'❌ '+live.lab.replace(/^\S+\s/,''):live.lab):FO_TAG[r]||'');else tx=live?(miss?'':(Object.hasOwn(FO_RTAG,live.k)?FO_RTAG[live.k]:FO_TAG.hit)):FO_TAG[r]||''}
  if(t){t.textContent=tx;t.className='sdact'+(tx?' show '+(k!==side?'hit':r==='act'&&live?'move':r):'')}});
 if(live&&!miss&&!live.solo&&other){const pw=FO_POW[live.k];if(pw&&!(live.noPow)){fx.textContent=foPow(live.fin?'fin':live.k);fx.className='fofx show at-'+other+' p-'+live.k+(live.fin?' fin':'')+(fx.textContent.length>7?' long':'')}
  if(live.k==='slam'||live.k==='fly'||live.k==='spear'||live.fin)sd.classList.add('q-'+live.k)}
 else if(live&&miss&&live.k==='fly'){fx.textContent=foPow('flymiss');fx.className='fofx show at-'+side+' p-flymiss'+(fx.textContent.length>7?' long':'');sd.classList.add('q-fly')}}
const foTag='<span class="sdact"></span>';
Object.assign(window,{foPose,foTag,foKind});
(function(){const c=document.createElement('style');c.textContent=`
.sd.duo{aspect-ratio:5/4}
.sd.duo .sdpan{width:100%!important;transform:none!important;transition:none}
.sd.duo .sdc{flex:1 1 50%;overflow:visible;background:none}
.sd.duo::before{content:'';position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 30%,rgba(255,226,160,.14),transparent 70%),radial-gradient(120% 60% at 50% 125%,rgba(226,51,43,.5),rgba(90,16,8,.22) 45%,transparent 75%);pointer-events:none}
.sd.duo::after{content:'VS';position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) skewX(-8deg);z-index:3;font:900 italic clamp(26px,8vw,42px)/1 'BC','Barlow Condensed',sans-serif;color:var(--gold);text-shadow:0 3px 0 #000;pointer-events:none}
.sd.duo .sdspeed{display:none}
.sd.duo .sdph{--dir:1;left:50%;bottom:16%;height:auto;width:84%;max-width:none;aspect-ratio:3/4;transform:translateX(-50%);filter:brightness(.62) saturate(.7);transition:filter .25s,box-shadow .25s,transform .28s cubic-bezier(.2,.9,.3,1.2)}
.sd.duo .cb .sdph{--dir:-1}
.sd.duo .sdpl,.sd.duo .sdc.cb .sdpl{left:8%;right:8%;bottom:4%;max-width:none;border:0;border-top:3px solid var(--gold);align-items:center;text-align:center;padding:5px 6px 6px;clip-path:none}
.sd.duo .sdpl.fc,.sd.duo .sdc.cb .sdpl.fc{border-color:var(--face)}.sd.duo .sdpl.hl,.sd.duo .sdc.cb .sdpl.hl{border-color:var(--heel)}
.sd.duo .sdpl b{font-size:clamp(13px,3.8vw,19px);max-width:100%}
.sd.duo .sdpl span{max-width:100%}
.sd.duo .sdact{position:absolute;left:50%;top:3%;z-index:4;transform:translate(-50%,6px);opacity:0;white-space:nowrap;max-width:96%;overflow:hidden;text-overflow:ellipsis;font:900 italic 13px/1 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px 3px;clip-path:var(--sl);transition:opacity .15s,transform .15s;pointer-events:none}
.sd.duo .sdact.show{opacity:1;transform:translate(-50%,0)}
.sdact.talk{background:var(--gold);color:#16120a}.sdact.move{background:var(--red);color:#fff}.sdact.hit{background:#f3efe6;color:var(--red)}.sdact.miss{background:#3a3c44;color:#e6e6e6}.sdact.hurt{background:var(--bad);color:#16120a}.sdact.act{background:#f3efe6;color:#09090b}
.sd.duo .sdc.on .sdph{filter:none;box-shadow:0 0 0 3px var(--gold),0 12px 30px rgba(242,193,78,.25)}
.sd.duo .sdc.dim .sdph{filter:brightness(.42) saturate(.45)}
.sd.duo .sdc.dim .sdpl{opacity:.6}
.sd.duo .sdc.talk .sdph,.sd.duo .sdc.act .sdph{transform:translateX(-50%) translateY(-5px) scale(1.04)}
.sd.duo .sdc.move .sdph{transform:translateX(-50%) translateY(-4px) scale(1.03);animation:foLunge .55s cubic-bezier(.2,.9,.3,1)!important}
@keyframes foLunge{35%{transform:translateX(calc(-50% + var(--dir)*26%)) rotate(calc(var(--dir)*4deg)) scale(1.06)}100%{transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.hit .sdph{animation:foHit .5s!important}
@keyframes foHit{0%{filter:brightness(2.2)}15%{transform:translateX(calc(-50% - var(--dir)*10px)) rotate(calc(var(--dir)*-3deg))}35%{transform:translateX(calc(-50% + var(--dir)*6px))}60%{transform:translateX(calc(-50% - var(--dir)*3px))}100%{filter:none}}
.sd.duo .sdc.miss .sdph{filter:grayscale(.6) brightness(.8);animation:foMiss .6s forwards!important}
@keyframes foMiss{40%{transform:translateX(calc(-50% + var(--dir)*16%)) rotate(calc(var(--dir)*6deg))}100%{transform:translateX(-50%) translateY(8px) rotate(calc(var(--dir)*-2deg)) scale(.97)}}
.sd.duo .sdc.hurt .sdph{filter:none;box-shadow:0 0 0 3px var(--bad)}
.sd.duo .sdc.hurt .sdph::after{content:'🩹 Hurt';position:absolute;left:0;right:0;top:44%;text-align:center;font:900 italic 16px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;background:rgba(255,106,85,.92);color:#16120a;padding:5px 0 4px}
.sd.duo .sdcut{top:auto;bottom:22%;right:50%;transform:translateX(50%);z-index:5}
body.tv .tv-live-sheet .sd.duo{aspect-ratio:16/11}
body.tv .tv-live-sheet .sd.duo .sdph{height:auto!important;max-width:none!important;width:70%}
body.tv .tv-live-sheet .sd.duo .sdc{filter:none!important}
body.tv .tv-live-sheet .sd.duo .sdact{font-size:22px;padding:6px 14px 5px}
body.tv .tv-live-sheet .sd.duo .sdpl b{font-size:24px}
@media (prefers-reduced-motion:reduce){html .sd.duo .sdc.sdc.sdc .sdph{animation:none!important;transition:none!important}}
/* ---- v306: the cards act the moves out. Each card's own --dir points at the other card ---- */
.sd.duo .sdc.on .sdph{z-index:2}.sd.duo .sdc.k-fly .sdph,.sd.duo .sdc.k-spear .sdph,.sd.duo .sdc.k-pin .sdph,.sd.duo .sdc.k-hold .sdph{z-index:4}
.sd.duo .sdc.on.fin .sdph{box-shadow:0 0 0 3px var(--gold),0 0 40px 6px rgba(242,193,78,.55)}
.sd.duo .sdc.move.k-strike .sdph,.sd.duo .sdc.act.k-strike .sdph{animation:foStrA .5s cubic-bezier(.2,.9,.3,1)!important}
@keyframes foStrA{30%{transform:translateX(calc(-50% + var(--dir)*30%)) rotate(calc(var(--dir)*7deg)) scale(1.07)}100%{transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.r-strike .sdph,.sd.duo .sdc.r-weapon .sdph{animation:foStrB .55s!important}
@keyframes foStrB{0%,22%{transform:translateX(-50%)}30%{filter:brightness(2.4);transform:translateX(calc(-50% - var(--dir)*12%)) rotate(calc(var(--dir)*-7deg))}48%{transform:translateX(calc(-50% + var(--dir)*3%)) rotate(calc(var(--dir)*2deg))}70%{transform:translateX(calc(-50% - var(--dir)*2%))}100%{filter:none;transform:translateX(-50%)}}
.sd.duo .sdc.move.k-fly .sdph,.sd.duo .sdc.act.k-fly .sdph{animation:foFlyA 1s cubic-bezier(.3,.6,.4,1)!important}
@keyframes foFlyA{22%{transform:translateX(calc(-50% - var(--dir)*6%)) translateY(-30%) rotate(calc(var(--dir)*-8deg)) scale(1.04)}34%{transform:translateX(calc(-50% - var(--dir)*4%)) translateY(-34%) rotate(calc(var(--dir)*-10deg)) scale(1.05)}58%{transform:translateX(calc(-50% + var(--dir)*52%)) translateY(-26%) rotate(calc(var(--dir)*16deg)) scale(1.12)}70%{transform:translateX(calc(-50% + var(--dir)*60%)) translateY(6%) rotate(calc(var(--dir)*10deg)) scale(1.02)}100%{transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.r-fly .sdph{animation:foFlyB 1s!important}
@keyframes foFlyB{0%,64%{transform:translateX(-50%)}71%{filter:brightness(2.4);transform:translateX(-50%) translateY(12%) scale(1.06,.8)}84%{transform:translateX(-50%) translateY(4%) scale(.98,1.02)}100%{filter:none;transform:translateX(-50%)}}
.sd.duo .sdc.miss.k-fly .sdph{animation:foFlyMiss 1.05s cubic-bezier(.3,.6,.4,1) forwards!important}
@keyframes foFlyMiss{22%{transform:translateX(calc(-50% - var(--dir)*6%)) translateY(-30%) rotate(calc(var(--dir)*-8deg))}58%{transform:translateX(calc(-50% + var(--dir)*52%)) translateY(-24%) rotate(calc(var(--dir)*16deg)) scale(1.1)}72%{filter:none;transform:translateX(calc(-50% + var(--dir)*44%)) translateY(20%) rotate(calc(var(--dir)*30deg)) scale(1.02)}100%{filter:grayscale(.6) brightness(.75);transform:translateX(calc(-50% + var(--dir)*14%)) translateY(12%) rotate(calc(var(--dir)*12deg)) scale(.97)}}
.sd.duo .sdc.rmiss .sdph{filter:none;animation:foSlip .9s cubic-bezier(.3,.8,.3,1)!important}
@keyframes foSlip{0%,30%{transform:translateX(-50%)}46%,70%{transform:translateX(calc(-50% - var(--dir)*26%)) rotate(calc(var(--dir)*-6deg))}100%{transform:translateX(-50%)}}
.sd.duo .sdc.move.k-slam .sdph,.sd.duo .sdc.act.k-slam .sdph{animation:foSlamA 1s cubic-bezier(.3,.7,.3,1)!important}
@keyframes foSlamA{22%{transform:translateX(calc(-50% + var(--dir)*30%)) scale(1.04)}44%{transform:translateX(calc(-50% + var(--dir)*30%)) translateY(-7%) scale(1.06)}62%{transform:translateX(calc(-50% + var(--dir)*26%)) translateY(5%) scale(1.04)}100%{transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.r-slam .sdph{animation:foSlamB 1s cubic-bezier(.4,0,.6,1)!important}
@keyframes foSlamB{0%,20%{transform:translateX(-50%)}46%{transform:translateX(calc(-50% + var(--dir)*4%)) translateY(-40%) rotate(calc(var(--dir)*-28deg)) scale(1.03)}62%{filter:brightness(2.4);transform:translateX(calc(-50% - var(--dir)*4%)) translateY(14%) rotate(calc(var(--dir)*-72deg)) scale(.92)}82%{filter:brightness(1.1);transform:translateX(calc(-50% - var(--dir)*4%)) translateY(12%) rotate(calc(var(--dir)*-68deg)) scale(.92)}100%{filter:none;transform:translateX(-50%)}}
.sd.duo .sdc.move.k-spear .sdph,.sd.duo .sdc.act.k-spear .sdph{animation:foSpearA .8s cubic-bezier(.5,0,.2,1)!important}
@keyframes foSpearA{25%{transform:translateX(calc(-50% - var(--dir)*12%)) translateY(4%) rotate(calc(var(--dir)*-6deg)) scale(.97)}46%{transform:translateX(calc(-50% + var(--dir)*72%)) translateY(8%) rotate(calc(var(--dir)*14deg)) scale(1.08)}60%{transform:translateX(calc(-50% + var(--dir)*64%)) translateY(10%) rotate(calc(var(--dir)*10deg))}100%{transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.r-spear .sdph{animation:foSpearB .8s!important}
@keyframes foSpearB{0%,40%{transform:translateX(-50%)}48%{filter:brightness(2.4);transform:translateX(calc(-50% - var(--dir)*24%)) translateY(4%) rotate(calc(var(--dir)*-26deg))}68%{transform:translateX(calc(-50% - var(--dir)*20%)) translateY(14%) rotate(calc(var(--dir)*-40deg)) scale(.94)}100%{filter:none;transform:translateX(-50%)}}
.sd.duo .sdc.move.k-weapon .sdph,.sd.duo .sdc.act.k-weapon .sdph{animation:foWepA .7s cubic-bezier(.4,0,.2,1)!important}
@keyframes foWepA{32%{transform:translateX(calc(-50% - var(--dir)*4%)) translateY(-9%) rotate(calc(var(--dir)*-12deg)) scale(1.05)}52%{transform:translateX(calc(-50% + var(--dir)*30%)) rotate(calc(var(--dir)*12deg)) scale(1.07)}100%{transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.r-weapon .sdph{animation-delay:.18s!important}
.sd.duo .sdc.move.k-hold .sdph,.sd.duo .sdc.act.k-hold .sdph{animation:foHoldA .45s cubic-bezier(.3,.8,.3,1) forwards,foCrankA 1.1s .45s ease-in-out infinite!important}
@keyframes foHoldA{100%{transform:translateX(calc(-50% + var(--dir)*40%)) translateY(2%) rotate(calc(var(--dir)*5deg)) scale(1.03)}}
@keyframes foCrankA{0%,100%{transform:translateX(calc(-50% + var(--dir)*40%)) translateY(2%) rotate(calc(var(--dir)*5deg)) scale(1.03)}50%{transform:translateX(calc(-50% + var(--dir)*37%)) translateY(4%) rotate(calc(var(--dir)*9deg)) scale(1.04)}}
.sd.duo .sdc.r-hold .sdph{box-shadow:0 0 0 3px var(--red),0 0 26px rgba(226,51,43,.55);animation:foHoldB .45s cubic-bezier(.3,.8,.3,1) forwards,foTremble .16s .45s linear infinite!important}
@keyframes foHoldB{100%{transform:translateX(calc(-50% + var(--dir)*16%)) translateY(6%) rotate(calc(var(--dir)*-6deg)) scale(.97)}}
@keyframes foTremble{0%,100%{transform:translateX(calc(-50% + var(--dir)*16%)) translateY(6%) rotate(calc(var(--dir)*-6deg)) scale(.97)}50%{transform:translateX(calc(-50% + var(--dir)*16% + 3px)) translateY(6%) rotate(calc(var(--dir)*-7deg)) scale(.97)}}
.sd.duo .sdc.move.k-pin .sdph,.sd.duo .sdc.act.k-pin .sdph{animation:foPinA .7s cubic-bezier(.3,.7,.3,1) forwards!important}
@keyframes foPinA{40%{transform:translateX(calc(-50% + var(--dir)*40%)) translateY(-10%) rotate(calc(var(--dir)*8deg)) scale(1.05)}100%{transform:translateX(calc(-50% + var(--dir)*44%)) translateY(10%) rotate(calc(var(--dir)*14deg)) scale(1.02)}}
.sd.duo .sdc.r-pin .sdph{animation:foPinB .7s cubic-bezier(.3,.7,.3,1) forwards!important}
@keyframes foPinB{0%,35%{transform:translateX(-50%)}100%{filter:brightness(.8);transform:translateX(-50%) translateY(16%) rotate(calc(var(--dir)*-8deg)) scale(1,.84)}}
.sd.duo .sdc.k-kickout .sdph{animation:foKickA .75s cubic-bezier(.2,1.4,.4,1)!important}
@keyframes foKickA{0%{transform:translateX(-50%) translateY(16%) scale(1,.84)}22%{filter:brightness(1.8);transform:translateX(-50%) translateY(-14%) scale(1.1)}100%{filter:none;transform:translateX(-50%) translateY(-4px) scale(1.03)}}
.sd.duo .sdc.r-kickout .sdph{filter:none;animation:foKickB .8s cubic-bezier(.2,.8,.3,1)!important}
@keyframes foKickB{0%{transform:translateX(calc(-50% + var(--dir)*44%)) translateY(10%) rotate(calc(var(--dir)*14deg))}24%{transform:translateX(calc(-50% + var(--dir)*12%)) translateY(-32%) rotate(calc(var(--dir)*-24deg))}55%{transform:translateX(calc(-50% - var(--dir)*8%)) translateY(6%) rotate(calc(var(--dir)*-8deg))}100%{transform:translateX(-50%)}}
.sd.duo .sdc.k-tap .sdph{animation:foTap .9s ease-in forwards!important;box-shadow:0 0 0 3px #f3efe6}
@keyframes foTap{0%{transform:translateX(-50%) translateY(10%) scale(.96)}14%,42%,70%{transform:translateX(-50%) translateY(16%) scale(.96,.9)}28%,56%,84%{transform:translateX(-50%) translateY(8%) scale(.96)}100%{filter:grayscale(.4);transform:translateX(-50%) translateY(14%) scale(.95)}}
.sd.duo .sdc.k-dodge .sdph{animation:foSlip .9s cubic-bezier(.3,.8,.3,1)!important}
.sd.duo .sdc.r-dodge .sdph{filter:none;animation:foWhiff .9s cubic-bezier(.3,.6,.4,1) forwards!important}
@keyframes foWhiff{30%{transform:translateX(calc(-50% + var(--dir)*30%)) rotate(calc(var(--dir)*8deg)) scale(1.04)}58%{transform:translateX(calc(-50% + var(--dir)*66%)) translateY(14%) rotate(calc(var(--dir)*26deg))}100%{filter:grayscale(.5) brightness(.75);transform:translateX(calc(-50% + var(--dir)*16%)) translateY(10%) rotate(calc(var(--dir)*10deg)) scale(.97)}}
.sd.duo .sdc.k-climb .sdph{animation:foClimb 1.1s ease-out forwards!important}
@keyframes foClimb{25%,40%{transform:translateX(-50%) translateY(-9%) rotate(calc(var(--dir)*-2deg))}65%,78%{transform:translateX(-50%) translateY(-17%) rotate(calc(var(--dir)*2deg))}100%{transform:translateX(-50%) translateY(-22%) scale(1.04)}}
.sd.duo .sdc.k-out .sdph{animation:foOut .8s cubic-bezier(.5,0,.8,.6) forwards!important}
@keyframes foOut{30%{transform:translateX(calc(-50% - var(--dir)*6%)) translateY(-5%) rotate(calc(var(--dir)*-6deg))}100%{filter:brightness(.6) saturate(.6);transform:translateX(calc(-50% - var(--dir)*10%)) translateY(34%) rotate(calc(var(--dir)*-14deg)) scale(.95)}}
.sd.duo .sdc.k-rope .sdph{animation:foRope 1s cubic-bezier(.3,.7,.3,1) forwards!important}
@keyframes foRope{0%{transform:translateX(-50%) translateY(14%) scale(.95)}45%{transform:translateX(calc(-50% - var(--dir)*12%)) translateY(12%) rotate(calc(var(--dir)*-6deg)) scale(.95)}75%{transform:translateX(calc(-50% - var(--dir)*20%)) translateY(10%) rotate(calc(var(--dir)*-12deg)) scale(1.02,.95)}100%{transform:translateX(calc(-50% - var(--dir)*22%)) translateY(8%) rotate(calc(var(--dir)*-10deg)) scale(1.03,.96)}}
.sd.duo .sdc.k-taunt .sdph{animation:foTaunt 1.1s ease-out forwards!important}
@keyframes foTaunt{25%{transform:translateX(-50%) translateY(-11%) scale(1.1)}45%{transform:translateX(-50%) translateY(-9%) rotate(calc(var(--dir)*-4deg)) scale(1.09)}65%{transform:translateX(-50%) translateY(-9%) rotate(calc(var(--dir)*4deg)) scale(1.09)}100%{transform:translateX(-50%) translateY(-7%) scale(1.07)}}
.sd.duo .sdc.k-taunt .sdph{box-shadow:0 0 0 3px var(--gold),0 0 34px 4px rgba(242,193,78,.45)}
.sd.duo .sdc.k-stare .sdph,.sd.duo .sdc.r-stare .sdph{filter:none;animation:foStare .7s cubic-bezier(.3,.8,.3,1) forwards!important}
@keyframes foStare{70%{transform:translateX(calc(-50% + var(--dir)*20%)) scale(1.04)}85%{transform:translateX(calc(-50% + var(--dir)*17%)) scale(1.04)}100%{transform:translateX(calc(-50% + var(--dir)*18%)) scale(1.04)}}
/* misses: the rest of the moves stumble the usual way (foMiss); the other card leans out of it */
.sd.duo .sdc.on.rmiss.r-hold .sdph,.sd.duo .sdc.on.rmiss.r-pin .sdph{box-shadow:none;animation:foSlip .9s cubic-bezier(.3,.8,.3,1)!important}
/* the screen jolts on the big landings — "translate" is separate from "transform", which the pan pins down */
.sd.duo.q-slam .sdpan{animation:foQuake .32s .6s}.sd.duo.q-fly .sdpan{animation:foQuake .32s .68s}.sd.duo.q-spear .sdpan{animation:foQuake .28s .44s}
@keyframes foQuake{0%,100%{translate:0 0}20%{translate:-5px 3px}40%{translate:5px -2px}60%{translate:-3px 2px}80%{translate:2px -1px}}
.fofx{position:absolute;top:30%;white-space:nowrap;z-index:6;opacity:0;pointer-events:none;transform:translate(-50%,-50%) scale(.3) rotate(-8deg);font:900 italic clamp(22px,7vw,38px)/1 'BC','Barlow Condensed',sans-serif;color:#16120a;--burst:var(--gold);letter-spacing:.02em}
.fofx::before{content:'';position:absolute;inset:-62% -30%;z-index:-1;background:var(--burst);clip-path:polygon(50% 0,61% 22%,86% 8%,78% 34%,100% 40%,80% 56%,96% 82%,68% 74%,58% 100%,46% 78%,20% 96%,24% 70%,0 62%,20% 46%,4% 20%,32% 26%)}
.fofx.long{font-size:clamp(17px,5.2vw,28px)}.fofx.long::before{inset:-90% -34%}
.fofx.at-a{left:28%}.fofx.at-b{left:72%}
.fofx.show{animation:foPow .7s cubic-bezier(.2,1.4,.4,1) both}
.fofx.p-strike{animation-delay:.12s}.fofx.p-weapon{animation-delay:.32s;--burst:#f3efe6;color:var(--red)}.fofx.p-spear{animation-delay:.34s;--burst:var(--red);color:#fff}.fofx.p-slam{animation-delay:.58s;--burst:var(--red);color:#fff}.fofx.p-fly{animation-delay:.66s}.fofx.p-flymiss{animation-delay:.7s;--burst:#3a3c44;color:#e6e6e6}
.fofx.fin{--burst:var(--gold);color:#16120a;font-size:clamp(28px,9vw,48px)}.fofx.fin.long{font-size:clamp(20px,6.4vw,34px)}
@keyframes foPow{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-8deg)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(-6deg)}70%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-4deg)}100%{opacity:0;transform:translate(-50%,-60%) scale(.95) rotate(-4deg)}}
body.tv .tv-live-sheet .fofx{font-size:56px}body.tv .tv-live-sheet .fofx.long{font-size:42px}
@media (prefers-reduced-motion:reduce){html .sd.duo .sdpan{animation:none!important}html .fofx{display:none}}`;document.head.appendChild(c)})();
