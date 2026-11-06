/* Tony Khan Simulator — the card table (v273).
   Every wrestler is a card, and every show is a table you play them onto. This module carries that idea through the
   week, on top of the game's own systems (nothing here changes how a match or promo is rated):

     Booking   — the running order becomes a table. Pick a slot (tap it, or a number above your hand) and you're dealt
                 a hand of about seven cards for it: promises, requests and title defenses first, then feuds, then
                 rested stars, each with a reason tab. Play a card (drag it onto any slot, or tap it) and the hand
                 re-deals with the best partners for that wrestler. A third card makes a triple threat; stacking a
                 partner onto a side makes a tag or trios match. Once both sides are set, the hand turns into
                 stipulation, title and pin cards. Tap a card on the table to make that side the winner, swipe it
                 sideways to send it back. Details opens the full editor (finishes, run-ins, everything else).
     Office    — the line outside your office is a stack of cards; a two-answer decision can be swiped.
     Live      — calls in the match and promo showdowns are cards you flick up (or tap).
     Reveal    — each segment flips over before its stars fill in.
     Party TV  — each GM's table fills with face-down cards as they book.

   Special matches (tournaments, the Rumble, Money in the Bank, the Casino Gauntlet, open challenges, squashes, dream
   matches) keep their own slots and editors. Settings › Card table switches the whole thing off (the classic Book
   screen comes back). Loaded last; hooks in by wrapping render, menuView, openInbox, tvWeek and a few others. */
'use strict';
(function(){
const LS='tksim_cards';
let ONF=true;try{ONF=localStorage.getItem(LS)!=='0'}catch(e){}
const on=()=>ONF;
window.cardsOn=on;
window.TC_HAND=7;
function setOn(v){ONF=!!v;try{localStorage.setItem(LS,ONF?'1':'0')}catch(e){}document.documentElement.classList.toggle('tcards',ONF);TC.sel=null;TC.confirm=null;try{render()}catch(e){}}
window.cardsSet=setOn;
document.documentElement.classList.toggle('tcards',ONF);

/* ---------------- state ---------------- */
const TC={act:null,mode:'w',sel:null,confirm:null,dr:{},wk:null,dealt:0,sx:0,open:false,tg:null,rep:null,f:'fit',sh:{}};
function wkKey(){return S?[S.season||0,S.week,S.gm,S.phase].join('|'):''}
function sync(){const k=wkKey();if(TC.wk!==k){TC.wk=k;TC.dr={};TC.sh={};TC.act=null;TC.mode='w';TC.sel=null;TC.confirm=null;TC.tg=null;TC.rep=null;TC.open=false}}
const card=()=>(S&&S.card&&S.card.p)||[];
const ppvNow=()=>{try{return !!curShow().ppv}catch(e){return false}};
const W_=id=>S&&S.w[id];
const ln=w=>w.name.split(' ').slice(-1)[0];
const clone=o=>JSON.parse(JSON.stringify(o));
function locked(){try{return !!((typeof mpLockedQuiet==='function'&&mpLockedQuiet())||(ON()&&S.online&&S.online.booked&&S.online.booked.p)||LIVE)}catch(e){return false}}
function bookOn(){return on()&&S&&S.phase==='season'&&typeof tab!=='undefined'&&tab==='book'&&!(typeof TV!=='undefined'&&TV)}

/* which slots play as a table: promos, and matches that aren't one of the special kinds */
function plain(m){return !!m&&Array.isArray(m.sides)&&!m.tour&&!(typeof isSp==='function'&&isSp(m))&&!['open','gauntlet','squash'].includes(m.type)&&!!MT[m.type]}
function tableOk(sl){if(!sl)return false;if(sl.k==='promo')return true;if(sl.k!=='match')return false;return !sl.d||plain(sl.d)}
function slotLab(i){const c=card(),sl=c[i];if(!sl)return '';if(sl.k==='promo')return sl.opt?'Bonus promo':'Promo';if(sl.k==='xo')return 'Dream match';if(sl.k==='chal')return 'Challenge';try{const ml=mLab(c,i);return ml.main?'Main event':ml.lab}catch(e){return 'Match'}}
function chipLab(i){const c=card(),sl=c[i];if(!sl)return '';if(sl.k==='promo')return sl.opt?'Bonus':'Promo';if(sl.k!=='match')return sl.k==='xo'?'Dream':'Special';const d=sl.d;if(d&&!plain(d))return d.type==='rumble'?'Rumble':d.type==='mitb'?'Ladder':d.type==='gauntlet'?'Casino':d.type==='open'?'Open':d.type==='squash'?'Squash':d.tour?'Bracket':'Match';try{const ml=mLab(c,i);return ml.main?'Main':ml.opt?'Bonus':'Match'}catch(e){return 'Match'}}

/* the working model of a slot: a half-built match lives in TC.dr until it's legal, then it goes on the card */
function cur(i){const sl=card()[i];if(!sl)return null;if(TC.dr[i])return TC.dr[i];
 if(sl.k==='promo')return sl.d?{type:sl.d.type,a:sl.d.a,b:sl.d.b||''}:{type:'callout',a:'',b:''};
 return sl.d?clone(sl.d):{type:'singles',stip:'std',sides:[[],[]],winner:0,title:''}}
const idsOf=(i,m)=>{m=m||cur(i);if(!m)return [];return card()[i].k==='promo'?[m.a,m.b].filter(Boolean):m.sides.flat().filter(Boolean)};
function typeFor(sides){const sz=sides.map(s=>s.length);if(sides.length<2||sz.some(n=>!n))return null;
 if(sz.every(n=>n===1))return sides.length===2?'singles':sides.length===3?'triple':sides.length===4?'four':null;
 if(sides.length!==2||sz[0]!==sz[1])return null;return sz[0]===2?'tag':sz[0]===3?'trios':sz[0]===4?'eight':null}
function needTxt(m){const sz=m.sides.map(s=>s.length);if(!sz[0])return 'Play a card to start it';if(sz.some(n=>!n))return 'Needs an opponent';
 if(m.sides.length===2&&sz[0]!==sz[1])return sz[0]<sz[1]?'Needs a partner on the left':'Needs a partner on the right';if(m.sides.length>4)return 'Too many corners';return 'Not a legal match yet'}
function promoOk(p){return !!(p.a&&PT[p.type]&&(PT[p.type].b!=='req'||p.b))}

/* ---------------- the card ---------------- */
function condOf(w){if(w.inj)return ['Hurt','b'];const sw=staWord(sta(w));if(sw!=='Fresh')return [sw,sw==='Tired'?'t':'b'];
 if(w.own==='p'&&typeof moodWord==='function'&&w.mor<50)return [moodWord(w.mor)[1],w.mor<35?'b':'t'];return ['Fresh','']}
function tcCard(w,o){o=o||{};const [cw,cc]=condOf(w);const t=titlesOf(w.id)[0];const worn=!o.noWear&&(sta(w)<100-FAT_OK||w.inj);
 const cls=['tkc',w.al==='f'?'fc':'hl',t?'ch':'',worn?'worn':'',o.used?'used':'',o.cls||''].join(' ');
 return `<div class="${cls}" data-tcw="${w.id}" ${o.attr||''} tabindex="0" role="button" aria-label="${esc(w.name)}${t?', '+esc(t.n)+' champion':''}, ${cw}${o.tab?', '+esc(o.tab):''}">
 <div class="tcf ${hasPhoto(w)?'ph':''}">${hasPhoto(w)?`<div class="tcp">${portrait(w)}</div>`:`<div class="tcg">${esc(initials(w.name))}</div>`}<span class="tco">${ovr(w)}</span>${o.tab?`<span class="tct ${o.tabc||''}">${esc(o.tab)}</span>`:''}<div class="tcb"><b class="tcn${(o.name||w.name).length>13?' ln':''}">${esc(o.name||w.name)}</b><span class="tcc ${cc}">${esc(o.cond||cw)}</span>${t?`<i class="tcbelt">${esc(t.n)}</i>`:''}</div></div>${o.mark||''}</div>`}
window.tcCard=tcCard;
window.tcMini=w=>w&&on()?`<span class="tcmini">${tcCard(w,{noWear:true})}</span>`:'';

/* v280: every wrestler tile in the game (free agents, the draft, pickers, editor slots) is a card when the table is on */
if(typeof wcard==='function'){const wc0=wcard;
 const txt=h=>{const d=document.createElement('div');d.innerHTML=String(h||'');return d.textContent.replace(/\s+/g,' ').trim()};
 wcard=window.wcard=function(w,o){o=o||{};if(!on()||!w)return wc0.apply(this,arguments);
  const fdv=o.feud&&o.feud.h>=1?o.feud:null;
  let tab='',tabc='';if(o.bk){tab=o.bk;tabc='must'}else if(o.ask){tab=o.ask.length>26?o.ask.slice(0,24).replace(/\s+\S*$/,'')+'…':o.ask;tabc='must'}else if(o.why){tab=o.why;tabc=/rival|feud/i.test(o.why)?'feud':/asked|promis|due/i.test(o.why)?'must':''}
  else if(o.fl&&o.fl.length&&o.fl[0].o){tab=`Feud · ${ln(o.fl[0].o)}`;tabc='feud'}else if(fdv&&fdv.o){tab=`Feud · ${ln(fdv.o)}`;tabc='feud'}
  let cond=txt(o.info);if(o.gain&&w.own){const v=sta(w),a=Math.max(0,v-o.gain);cond=`Stamina ${v}→${a}`}
  const tags=(w.cw&&!w.own?'<span class="tcnew">New</span>':w.deb&&w.own?'<span class="tcnew">Debut</span>':'');
  const click=o.dis?'':o.on!=null?o.on:`showW('${w.id}')`;
  return tcCard(w,{tab,tabc,cond:cond||undefined,noWear:!w.own,cls:`${o.sel?'sel':''} ${o.dis?'dis':''} tcwc`,attr:`${o.attr||''} ${click?`onclick="${click}"`:''} ${o.dis?'aria-disabled="true"':''}`,mark:tags})}}

/* ---------------- dealing a hand ---------------- */
function defenseDue(id){return Object.values(S.titles||{}).some(t=>t.holders.includes(id)&&t.last!=null&&S.week-t.last>=4&&!card().some(sl=>sl&&sl.k==='match'&&sl.d&&sl.d.title===t.id))}
function promisedWith(id){let l=[];try{l=unmetPromises(card())}catch(e){}return l.filter(pr=>pr.a===id||pr.b===id).map(pr=>pr.a===id?pr.b:pr.a)}
function askTxt(am,id){const a=am.get(id);let t=String((a&&a.t)||'').replace(/^(Asking|Contract|Promised|Owed):\s*/,(m0,k)=>k==='Asking'?'':k+': ').replace(/\s+by week \d+/i,'').replace(/\s+within \d+ weeks?/i,'').trim();
 if(!t)return 'Has a request';t=t.charAt(0).toUpperCase()+t.slice(1);return t.length>42?t.slice(0,40).replace(/\s+\S*$/,'')+'…':t}
function askMap(){try{return typeof attnAskMap==='function'?attnAskMap():new Map()}catch(e){return new Map()}}
function why(w,anchor,i,am,tg){const sl=card()[i],promo=sl.k==='promo';
 if(!anchor){
  if(!promo&&promisedWith(w.id).length)return ['Promised','must',90];
  if(am.has(w.id))return [askTxt(am,w.id),'must',80];
  if(!promo&&defenseDue(w.id))return ['Defense due','must',75];
  const f=hotFeud(w);if(f&&f.h>=20&&f.o&&f.o.own==='p'&&!f.o.inj)return [`Feud · ${ln(f.o)}`,'feud',40+f.h/4];
  if(promo&&w.mic>=85)return ['Great talker','hot',30];
  if(isChamp(w.id))return ['Champion','gold',18];
  if(w.pop>=85&&sta(w)>=100-FAT_OK)return ['Top star','',12];
  return null}
 const A=W_(anchor);if(!A)return null;
 if(!promo&&promisedWith(anchor).includes(w.id))return ['Promised','must',95];
 const h=heatOf(anchor,w.id);if(h>=20)return ['Rivals','feud',55+h/4];if(h>=5)return ['Feud','feud',38+h/3];
 if(tg==='partner'){const t=inTeam(anchor,w.id);if(t)return ['Team','hot',50+t]}
 const met=metPair(anchor,w.id);const c=chemOpp(A,w);
 if(met&&c>=6)return [chemWord(c),'hot',30+c];
 if(!met&&c>=10)return ['Electric?','hot',20+c];
 if(promo&&w.mic>=85)return ['Great talker','hot',24];
 if(A.pop-w.pop>=15&&w.pop>=45&&tg!=='partner')return ['Rub','rub',14];
 if(am.has(w.id))return [askTxt(am,w.id),'must',26];
 if(A.al!==w.al&&tg!=='partner')return [met?'Face v heel':'Never met','',8];
 return [met?'':'Never met','',0]}
function hand(i,o){o=o||{};const sl=card()[i];if(!sl)return [];const m=cur(i);const here=idsOf(i,m);const promo=sl.k==='promo';
 const anchor=o.anchor!==undefined?o.anchor:here.length?here[here.length-1]:null;const tg=o.tg!==undefined?o.tg:defTarget(i,m);const am=askMap();
 const full=promo?new Set():fullIn('p',i);const used=usedIn('p',i);
 let pool=ownList('p').filter(w=>!w.inj&&!here.includes(w.id)&&!full.has(w.id));
 if(promo&&anchor)pool=pool.filter(w=>!promoPairBooked(anchor,w.id,i));
 const sc=pool.map(w=>{const r=why(w,anchor,i,am,tg&&tg.t);let v=(r?r[2]:0);
  v+=promo?(w.mic-70)/3:(ovr(w)-75)/3;if(anchor&&!promo)v+=Math.max(-6,Math.min(10,chemOpp(W_(anchor),w)));
  if(promo&&anchor)v+=Math.min(12,heatOf(anchor,w.id)/4);
  if(used.has(w.id))v-=45;v-=Math.max(0,(100-sta(w))-FAT_OK)/2;
  return {w,r,v}}).sort((a,b)=>b.v-a.v);
 let rubs=0;const out=[];for(const x of sc){if(x.r&&x.r[0]==='Rub'){if(rubs>=2)continue;rubs++}out.push(x);if(out.length>=(o.n||TC_HAND))break}
 return out}

/* where a played card lands by default, and every place it could land */
function targets(i,m){const sl=card()[i];m=m||cur(i);
 if(sl.k==='promo')return !m.a?[{t:'a'}]:!m.b?[{t:'b'}]:[];
 const t=[];m.sides.forEach((s,j)=>{if(!s.length)t.push({t:'side',i:j})});if(t.length)return t;
 const sz=m.sides.map(s=>s.length);
 if(m.sides.length===2){const lo=Math.min(...sz);m.sides.forEach((s,j)=>{if(s.length<4&&s.length===lo)t.push({t:'partner',i:j})})}
 if(sz.every(n=>n===1)&&m.sides.length<4)t.push({t:'third'});
 return t}
/* match shapes (v287): pick Singles, Tag, Trios, Triple threat or Four-way and the table lays out every space; the sheet fills them in turn */
const SHAPES=[['singles','Singles',2,1],['tag','Tag',2,2],['trios','Trios',2,3],['triple','Triple threat',3,1],['four','Four-way',4,1]];
function shapeOf(i,m){if(TC.sh[i])return TC.sh[i];const ty=typeFor(m.sides);if(ty&&SHAPES.some(x=>x[0]===ty))return ty;
 const n=m.sides.filter(x=>x.length).length,per=Math.max(1,...m.sides.map(x=>x.length));return n>=4?'four':n===3?'triple':per>=3?'trios':per===2?'tag':'singles'}
function shapeDims(k){const x=SHAPES.find(y=>y[0]===k)||SHAPES[0];return [x[2],x[3]]}
function shapeNext(m,k){const [n,per]=shapeDims(k);for(let r=0;r<per;r++)for(let j=0;j<n;j++){const sd=m.sides[j];if(!sd)return {t:'third'};if(sd.length<=r)return sd.length?{t:'partner',i:j}:{t:'side',i:j}}return null}
function defTarget(i,m){m=m||cur(i);const sl=card()[i];if(sl&&sl.k==='match'&&TC.sh[i])return shapeNext(m,TC.sh[i]);return defTarget0(i,m)}
window.tcShape=function(k){const i=TC.act;if(i==null||locked())return;const sl=card()[i];if(!sl||sl.k!=='match')return;const [n,per]=shapeDims(k);
 const m=clone(cur(i));const before=idsOf(i,m).length;m.sides=m.sides.slice(0,n).map(x=>x.slice(0,per));while(m.sides.length<2)m.sides.push([]);
 TC.sh[i]=k;const cut=before-idsOf(i,m).length;commit(i,m);TC.tg=null;TC.rep=null;TC.mode=shapeNext(cur(i),k)?'w':TC.mode;TC.f='fit';TC.dealt=1;render();center(i);
 if(cut>0)toast(`${cut} sent back to the roster.`)};
function defTarget0(i,m){const t=targets(i,m);return t.find(x=>x.t==='side'||x.t==='a'||x.t==='b')||(()=>{const p=t.filter(x=>x.t==='partner');return p.length===1?p[0]:null})()}

/* ---------------- playing a card ---------------- */
function commit(i,m){const sl=card()[i];const ppv=ppvNow();
 if(sl.k==='promo'){if(promoOk(m)){sl.d={type:m.type,a:m.a,b:m.b||null};delete TC.dr[i]}else{TC.dr[i]=m;if(sl.d)sl.d=null}save();return}
 m.sides=m.sides.map(s=>s.filter(Boolean));if(m.sides.length>2)m.sides=m.sides.filter(s=>s.length);while(m.sides.length<2)m.sides.push([]);
 const ty=typeFor(m.sides);
 if(ty){m.type=ty;if(!stipOk(m.stip||'std',ty,ppv))m.stip='std';if(m.winner==null||m.winner>=m.sides.length)m.winner=0;
  if(m.title&&!eligibleTitles(m).includes(m.title))m.title='';
  if(m.ri){const all=m.sides.flat();if(!all.includes(m.ri.t)||all.includes(m.ri.x))delete m.ri}
  if(m.pin&&!pinCands(m).includes(m.pin))delete m.pin;delete m.ev;
  sl.d=m;delete TC.dr[i]}
 else{TC.dr[i]=m;if(sl.d)sl.d=null}
 save()}
function play(i,id,tg,force){if(locked())return;const sl=card()[i];const w=W_(id);if(!sl||!w||!tableOk(sl))return;
 const m=clone(cur(i));
 if(idsOf(i,m).includes(id))return toast(`${w.name} is already in this ${sl.k==='promo'?'segment':'match'}.`);
 if(sl.k==='promo'){const k=tg&&tg.t==='b'?'b':!m.a?'a':'b';const other=k==='a'?m.b:m.a;
  if(other&&promoPairBooked(other,id,i))return toast(`${w.name} and ${W_(other).name} already share a promo tonight.`);
  m[k]=id;if(k==='a'&&PT[m.type]&&PT[m.type].champ&&!isChamp(id))m.type='callout';
  commit(i,m);TC.sel=null;TC.confirm=null;if(k==='b'||!m.b)TC.mode=m.b?'x':'w';buzz();TC.dealt=1;render();land(i,id);return}
 if(fullIn('p',i).has(id))return toast(`${w.name} can't take another match tonight — ${DD_MAX} is the limit.`);
 if(card().some(o=>o.k==='xo'&&o.d&&o.d.a===id))return toast(`${w.name} is already in the dream match tonight.`);
 if(!force&&usedIn('p',i).has(id)){TC.confirm={i,id,tg};TC.sel=null;render();return}
 tg=tg||defTarget(i,m);if(!tg)return toast(`${slotLab(i)} is full — pick a bigger match or swap someone out.`);
 if(tg.t==='side')m.sides[tg.i].push(id);
 else if(tg.t==='partner'){if(m.sides[tg.i].length>=4)return toast('That side is full.');m.sides[tg.i].push(id)}
 else if(tg.t==='third'){if(m.sides.some(s=>s.length>1))return toast('Triple threats and four-ways are one per corner.');if(m.sides.length>=4)return toast('Four corners is the most.');m.sides.push([id])}
 const was=!!card()[i].d;commit(i,m);TC.sel=null;TC.confirm=null;
 const now=card()[i].d;if(now&&!was&&tg.t==='side'){TC.mode='x';0}
 if(now&&tg.t==='partner'&&now.sides[tg.i].length>1&&typeof hyTeamName==='function'&&!hyTeamName(now.sides[tg.i]))0;
 buzz();TC.dealt=1;render();land(i,id)}
function takeOff(i,id){if(locked())return;const sl=card()[i];if(!sl||!tableOk(sl))return;const m=clone(cur(i));
 if(sl.k==='promo'){if(m.a===id){m.a=m.b||'';m.b=''}else if(m.b===id)m.b='';}
 else{if(sl.d&&typeof promiseOf==='function'&&promiseOf(sl.d))toast('That was a promised match — fans are still expecting it.');m.sides=m.sides.map(s=>s.filter(x=>x!==id));if(m.winner!=null&&!m.sides[m.winner])m.winner=0}
 commit(i,m);TC.mode='w';TC.dealt=1;render();0}
function pinPick(i,id){if(locked())return;const d=card()[i]&&card()[i].d;if(!d||!pinCands(d).includes(id))return;
 if(id!==pinOf(d)&&W_(id).own==='p'&&typeof ccOn==='function'&&ccOn(W_(id)))toast(`${W_(id).name} has creative control and won't agree to take the pin.`);
 d.pin=id;delete d.ev;save();buzz();render()}
function crownSide(i,si){if(locked()||typeof crownTap!=='function')return;const t0=toast;toast=window.toast=function(m){if(/won't|can't|costs/.test(m))return t0.apply(this,arguments)};try{crownTap(i,si)}finally{toast=window.toast=t0}buzz()}
function crown(i,id){if(locked())return;const sl=card()[i];const m=sl&&sl.d;
 if(sl&&sl.k==='promo')return showW(id);
 if(!m){return toast(needTxt(cur(i))+'.')}
 const si=m.sides.findIndex(s=>s.includes(id));if(si<0)return;
 if(typeof crownTap==='function')crownTap(i,si)}
function land(i,id){requestAnimationFrame(()=>{const el=document.querySelector(`.tcs[data-tcs="${i}"] [data-tcw="${id}"]`);if(el&&el.animate)try{el.animate([{transform:'translateY(-26px) scale(1.12)',opacity:.4},{transform:'none',opacity:1}],{duration:260,easing:'cubic-bezier(.2,1.3,.4,1)'})}catch(e){}})}
function hintN(){try{return +localStorage.getItem('tksim_tchint')||0}catch(e){return 0}}
function buzz(){try{localStorage.setItem('tksim_tchint',hintN()+1)}catch(e){}try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}try{window.SFX&&SFX.play&&SFX.play('tap')}catch(e){}}

/* extras: stipulations, titles, the pin, promo segments */
function extras(i){const sl=card()[i];const m=cur(i);const out=[];const ppv=ppvNow();
 if(sl.k==='promo'){const A=W_(m.a),B=m.b&&W_(m.b);
  Object.entries(PT).forEach(([k,t])=>{if(t.champ&&A&&!isChamp(A.id))return;const fit=A?promoFit(k,A,B):'';const need=t.b==='req'&&!B;
   out.push({x:`p:${k}`,k:'Segment',n:t.n,d:need?'Needs a second wrestler.':fit?fit.replace(/^\S+\s/,''):t.d.split('.')[0]+'.',fit:!!fit,on:m.type===k})});return out}
 if(!sl.d)return out;const d=sl.d;
 const ets=eligibleTitles(d).map(t=>S.titles[t]).filter(Boolean);const held=ets.filter(T=>T.holders.length),vac=ets.filter(T=>!T.holders.length);
 held.forEach(T=>out.push({x:`t:${T.id}`,k:'Championship',n:`${T.n} on the line`,d:d.title===T.id?'Tap to make it non-title.':'Counts as a title defense.',fit:true,on:d.title===T.id}));
 const stips=Object.entries(STIPS).filter(([k,s])=>stipOk(k,d.type,ppv)&&!bngLock(s,d)).map(([k,s])=>{const f=stipFits(s,d,ppv);const pr=stipPrice(k,'p');
  const fitN=k!=='std'&&f.spec.length;return {x:`s:${k}`,k:pr?`Stipulation · ${money(pr)}`:'Stipulation',n:s.n,d:fitN?`Suits ${shortNames(f.spec).replace(/&amp;/g,'&')}.`:f.tough.length&&k!=='std'?`Tough for ${shortNames(f.tough).replace(/&amp;/g,'&')}.`:s.d.split('.')[0]+'.',fit:!!fitN,on:stipKey(d)===k,o:fitN?2:k==='std'?1:f.tough.length?-1:0}});
 stips.sort((a,b)=>(b.on-a.on)||(b.o-a.o));out.push(...stips);
 vac.forEach(T=>out.push({x:`t:${T.id}`,k:'Vacant title',n:`Crown the first ${T.n} champion`,d:d.title===T.id?'Tap to make it non-title.':'The winner takes the belt.',fit:false,on:d.title===T.id}));

 out.push({x:'e',k:'Everything else',n:'Finish & run-ins',d:'Open the full match editor.',fit:false,on:false});
 return out}
function applyX(i,x){if(locked())return;const sl=card()[i];const [k,v]=[x.slice(0,1),x.slice(2)];
 if(k==='e')return openMatch(i);
 if(sl.k==='promo'){const m=clone(cur(i));m.type=v;commit(i,m);buzz();render();return}
 const d=sl.d;if(!d)return;
 if(k==='s'){d.stip=v;const st=STIPS[v];const f=stipFits(st,d);0}
 if(k==='t'){d.title=d.title===v?'':v;if(d.title)0}
 if(k==='n')d.pin=v;
 delete d.ev;save();buzz();render()}

/* ---------------- drawing the table ---------------- */
function tellFor(i){const sl=card()[i];const sh=curShow();
 if(sl.k==='promo'){const m=cur(i);if(!m.a)return '';if(!promoOk(m))return `<span class="tell muted">Needs a second wrestler</span>`;try{const t=tellOf(promoEst({type:m.type,a:m.a,b:m.b||null}),true);return `<span class="tell ${t[3]}">${t[1]} ${t[2]}</span>`}catch(e){return ''}}
 if(!sl.d){const m=cur(i);return idsOf(i,m).length?`<span class="tell muted">${needTxt(m)}</span>`:''}
 try{const r=rateMatch(sl.d,{ppv:sh.ppv,allin:sh.ppv&&SUPER(S.week),preview:true});return tellHtml(r)}catch(e){return ''}}
function slotHtml(i){const c=card(),sl=c[i];let act=i===TC.act&&!locked();const m=cur(i);const promo=sl.k==='promo';
 const ml=promo?null:(()=>{try{return mLab(c,i)}catch(e){return {}}})();const main=ml&&ml.main,opt=!!sl.opt;
 const tg=act&&TC.open&&TC.mode==='w'&&!TC.rep?targets(i,m):[];const ct=act&&TC.open&&TC.mode==='w'&&!TC.rep?(TC.tg||defTarget(i,m)):null;
 const same=t=>ct&&ct.t===t.t&&(ct.i==null||ct.i===t.i);
 const drop=(t,label,cls)=>`<div class="tcdrop ${cls||''} ${same(t)?'live':''}" role="button" tabindex="0" data-tct='${JSON.stringify(Object.assign({s:i},t))}'><b>+</b>${label}</div>`;
 const pr=!promo&&sl.d&&typeof promiseOf==='function'?promiseOf(sl.d):null;
 const fin=!promo&&sl.d&&!sl.d.nc&&typeof cwOk==='function'&&cwOk(sl.d);const pins=fin?pinCands(sl.d):[];const pinNow=pins.length>=2?pinOf(sl.d):null;const can=!locked();
 const onC=(id)=>{if(!W_(id))return '';const d=sl.d;let cls='';if(fin){const si=d.sides.findIndex(x=>x.includes(id));if(si===d.winner)cls='win';else if(pinNow===id)cls='pinned'}
  const c=tcCard(W_(id),{attr:`data-tcon="${i}"`,cls});
  /* who takes the pin: a toggle under each card on the losing side(s), when there's more than one to choose from */
  if(pinNow&&pins.includes(id))return `<div class="tccol">${c}<button class="tcpin ${pinNow===id?'on':''}" ${can?'':'disabled'} data-tcpin="${i}|${id}" aria-pressed="${pinNow===id}" aria-label="${esc(W_(id).name)} takes the pin">${pinNow===id?'Takes the pin':'Pin'}</button></div>`;
  return c};
 let mat='',many=false;
 if(promo){mat=(m.a?`<div class="tcside">${onC(m.a)}</div>`:act?`<div class="tcside">${drop({t:'a'},'On the mic')}</div>`:'')
  +((m.b||(act&&m.a))?`<div class="tcvs">&amp;</div><div class="tcside">${m.b?onC(m.b):drop({t:'b'},PT[m.type]&&PT[m.type].b==='req'?'Opponent':'Second (optional)')}</div>`:'')}
 else if((act&&TC.open)||idsOf(i,m).length){
  if(idsOf(i,m).length>3||(TC.sh[i]&&shapeDims(TC.sh[i])[0]*shapeDims(TC.sh[i])[1]>3))many=true;const act0=act;act=act&&TC.open;
  mat=m.sides.map((s,j)=>{const ps=s.map(onC).join('');const em=!s.length&&(act||idsOf(i,m).length)?drop({t:'side',i:j},j===0?'Pick':'Opponent'):'';
   const shp=TC.sh[i]?shapeDims(TC.sh[i]):null;const pt=shp?Array.from({length:Math.max(0,shp[1]-Math.max(1,s.length))},()=>s.length?drop({t:'partner',i:j},'Partner'):`<div class="tcdrop ghost" aria-hidden="true"><b>+</b>Partner</div>`).join(''):tg.find(t=>t.t==='partner'&&t.i===j)?drop({t:'partner',i:j},'','mini'):'';
   if(!fin||!s.length)return `<div class="tcside">${ps}${em}${pt}</div>`;const wn=sl.d.winner===j;
   return `<div class="tcsg"><div class="tcside">${ps}${em}${pt}</div><button class="tcwin ${wn?'on':''}" ${can&&!wn?'':'disabled'} data-tccr="${i}:${j}" aria-pressed="${wn}" aria-label="${wn?esc(sideName(s))+' wins':'Make '+esc(sideName(s))+' the winner'}"><b>👑</b>${wn?'Wins':'Win'}</button></div>`}).join('<div class="tcvs">vs</div>')
   +(TC.sh[i]?Array.from({length:Math.max(0,shapeDims(TC.sh[i])[0]-m.sides.length)},(x,q)=>`<div class="tcvs">vs</div><div class="tcside">${drop({t:'third'},m.sides.length+q===2?'Third':'Fourth')}</div>`).join(''):tg.find(t=>t.t==='third')?`<div class="tcvs">vs</div><div class="tcside">${drop({t:'third'},'Third')}</div>`:'');act=act0}
 const d=sl.d;let mods='';
 if(promo&&m.a&&PT[m.type])mods=`<span class="tcm g">${esc(PT[m.type].n)}</span>`;
 if(!promo&&d){const st=stipKey(d);const f=stipFits(STIPS[st],d);mods=`<span class="tcm ${st!=='std'&&f.spec.length?'g':st==='std'?'q':''}">${esc(STIPS[st].n)}</span>${d.title&&S.titles[d.title]?`<span class="tcm g">${esc(S.titles[d.title].n)} title</span>`:''}${d.ri&&d.ri.x&&W_(d.ri.x)?`<span class="tcm">Run-in · ${esc(ln(W_(d.ri.x)))}</span>`:''}${typeof finOf==='function'&&finOf(d)!=='clean'?'<span class="tcm">Screwy finish</span>':''}`}
 const empty=!idsOf(i,m).length;
 const sum=empty&&!act?`<div class="tcsum">${opt?'Optional. Tap to book it, or leave it empty.':'Tap to book it.'}</div>`
  
  :!promo&&d?`<div class="tcsum"><b>${esc(MT[d.type].n)}</b> · ${esc(sideName(d.sides[d.winner]))} wins${pr?` · <span class="gold">${pr.kind==='contract'?'Contracted':pr.kind==='shot'?'Earned title shot':'Promised'}</span>`:''}</div>`:'';
 const tl=tellFor(i);
 return `<div class="tcs ${act?'act':''} ${main?'me':''} ${opt?'opt':''}" data-tcs="${i}" data-dp="slot:${i}">
 <div class="tcnum" data-dg="slot:${i}" title="Hold and drag to move it">${i+1}</div>
 <div class="tcin"><div class="tchd"><span class="tclb">${esc(slotLab(i))}${d&&d.stip==='bng'?' · Blood &amp; Guts':''}</span>${tl?`<span class="tctl">${tl}</span>`:empty&&!act?`<span class="tcbk">${opt?'Add':'Book it'}</span>`:''}${!empty?`<button class="tcdet" onclick="event.stopPropagation();${promo?'openPromo':'openMatch'}(${i})">Details</button>`:''}</div>
 ${sum}${mat?`<div class="tcmat${many?' many':''}">${mat}</div>`:''}${mods?`<div class="tcmods">${mods}</div>`:''}</div></div>`}
/* the pick sheet (v280): tap a space on the table and the best cards for it slide up; tap one to place it */
function sheetTitle(i,m,tg){const sl=card()[i];const promo=sl.k==='promo';const L=slotLab(i);
 if(TC.rep&&W_(TC.rep))return [L,`Who replaces ${W_(TC.rep).name}?`];
 if(TC.mode==='x')return [L,promo?'Pick the segment':'Stipulation & title'];
 if(promo)return !m.a?[L,'Who’s on the mic?']:[L,`Who’s out there with ${ln(W_(m.a))}?`];
 if(!tg)return [L,'This match is full'];
 if(tg.t==='side'){const o=m.sides.find((x,j)=>j!==tg.i&&x.length);return [L+(m.sides.length===2?` · ${tg.i?'right':'left'} side`:''),o?`Who faces ${sideName(o)}?`:'Who opens it?']}
 if(tg.t==='partner')return [L,`Partner for ${sideName(m.sides[tg.i])}`];
 if(tg.t==='third')return [L,m.sides.length>=3?'Who’s the fourth corner?':'Who’s the third corner?'];
 return [L,'Pick a wrestler']}
/* who the cards are measured against: the other side (or, when swapping, whoever stays) */
function sheetAnchor(i,m,tg){const sl=card()[i];
 if(sl.k==='promo'){const o=[m.a,m.b].filter(x=>x&&x!==TC.rep);return o[0]||null}
 if(TC.rep){const si=m.sides.findIndex(x=>x.includes(TC.rep));const o=m.sides.find((x,j)=>j!==si&&x.length);return o?o[0]:null}
 if(tg&&tg.t==='partner')return m.sides[tg.i][0]||null;
 const ids=idsOf(i,m);return ids.length?ids[ids.length-1]:null}
function sheetCards(i,m,tg){const sl=card()[i];const promo=sl.k==='promo';const anchor=sheetAnchor(i,m,tg);const tt=tg&&tg.t;
 if(TC.f==='fit')return hand(i,{anchor,tg:tg||null,n:12});
 const here=idsOf(i,m);const full=promo?new Set():fullIn('p',i);const am=askMap();
 return ownList('p').filter(w=>!w.inj&&!here.includes(w.id)&&!full.has(w.id)&&(TC.f==='all'||(TC.f==='ch'?isChamp(w.id):w.al===TC.f)))
  .sort((a,b)=>(promo?b.mic-a.mic:ovr(b)-ovr(a))).map(w=>({w,r:why(w,anchor,i,am,tt)}))}
function dockHtml(){const i=TC.act;const sl=card()[i];if(!sl||!TC.open)return '';const m=cur(i);const promo=sl.k==='promo';
 const tl=targets(i,m);let tg=TC.rep?null:(TC.tg||defTarget(i,m)||(promo?tl[0]:null)||null);
 const [k,t]=sheetTitle(i,m,tg);const used=usedIn('p',i);
 const hasX=promo?!!m.a:!!sl.d;
 const pc=(x,n)=>tcCard(x.w,{tab:x.r&&x.r[0]?x.r[0]:'',tabc:x.r?x.r[1]:'',used:used.has(x.w.id),cls:TC.dealt?'deal':'',attr:`data-tcpick="${x.w.id}" style="animation-delay:${Math.min(n,8)*30}ms"`});
 let body='';
 if(TC.mode==='x'){const xs=extras(i);body=xs.length?`<div class="tcgx">${xs.map(x=>`<div class="tx ${x.fit?'fit':''} ${x.on?'on':''}" data-tcx="${esc(x.x)}" tabindex="0" role="button"><span class="txk">${esc(x.k)}</span><b class="txn">${esc(x.n)}</b><span class="txd">${esc(x.d)}</span></div>`).join('')}</div>`:`<div class="tcempty">${promo?'Pick who’s on the mic first.':'Fill both sides first.'}</div>`}
 else if(!tg&&!TC.rep)body=`<div class="tcempty">Every space is filled. Pick a bigger match above to add more, or tap someone on the table to swap them out.</div>`;
 else{const l=sheetCards(i,m,tg);
  if(!l.length)body=`<div class="tcempty">Nobody fits that filter tonight.</div>`;
  else if(TC.f==='fit'){const mu=l.filter(x=>x.r&&x.r[1]==='must'),rest=l.filter(x=>!(x.r&&x.r[1]==='must'));let n=0;
   body=`<div class="tcgrid">${mu.length?`<div class="tcwhy">Needs you tonight</div>${mu.map(x=>pc(x,n++)).join('')}`:''}${rest.length?`<div class="tcwhy">Best fits</div>${rest.map(x=>pc(x,n++)).join('')}`:''}</div>`}
  else{let n=0;body=`<div class="tcgrid">${l.map(x=>pc(x,n++)).join('')}</div>`}}
 const fc=[['fit','Best fit'],['ch','Champions'],['f','Faces'],['h','Heels'],['all','All']];
 const chips=`${hasX&&!TC.rep?`<button class="chip ${TC.mode==='x'?'on':''}" onclick="tcMode('${TC.mode==='x'?'w':'x'}')">${promo?'Segment':'Stips &amp; titles'}</button>`:''}${fc.map(([v,n])=>`<button class="chip ${TC.mode==='w'&&TC.f===v?'on':''}" onclick="tcF('${v}')">${n}</button>`).join('')}`;
 const shc=!promo&&!TC.rep?`<div class="tcshc tcshp">${SHAPES.map(([k,n])=>`<button class="chip ${shapeOf(i,m)===k?'on':''}" onclick="tcShape('${k}')">${n}</button>`).join('')}</div>`:'';
 const tch=false&&!TC.rep&&TC.mode==='w'&&tl.length>1&&!defTarget(i,m)?`<div class="tcshc">${tl.map((x,j)=>`<button class="chip ${tg&&x.t===tg.t&&x.i===tg.i?'on':''}" onclick="tcTg(${j})">${x.t==='partner'?`+ Partner · ${esc(ln(W_(m.sides[x.i][0])))}`:x.t==='third'?'+ Third corner':x.t==='side'?(x.i?'Right side':'Left side'):'Second'}</button>`).join('')}</div>`:'';
 const cf=TC.confirm&&W_(TC.confirm.id)?`<div class="tccf"><span>${esc(W_(TC.confirm.id).name)} is already on the card tonight. A second match costs ${DD_FAT}× the stamina.</span><button class="mini" onclick="tcNo()">No</button><button class="mini on" onclick="tcYes()">Book twice</button></div>`:'';
 const foot=TC.rep&&W_(TC.rep)?`<div class="tcsf"><button class="btn sec" onclick="tcBack()">Send back</button><button class="btn sec" onclick="showW('${TC.rep}')">Details</button></div>`:'';
 TC.dealt=0;
 return `<div class="tcscrim" onclick="tcScrim()"></div><div class="tcdock tcsheet" id="tcdock" role="dialog" aria-label="${esc(t)}"><button class="tcpull open" onclick="tcClose()" aria-label="Close"><span class="tcgrip"></span></button>
 <div class="tcsh"><div class="tcst"><span class="tcsk">${esc(k)}</span><b>${esc(t)}</b></div><button class="tcsx" onclick="tcClose()" aria-label="Close">✕</button></div>
 ${cf}${shc}<div class="tcsc">${chips}</div>${tch}<div class="tcsb" id="tcsb">${body}</div>${foot}</div>`}
function pickAct(){const c=card();if(TC.act!=null&&c[TC.act]&&tableOk(c[TC.act]))return;
 const ok=c.map((sl,i)=>tableOk(sl)?i:-1).filter(i=>i>=0);if(!ok.length){TC.act=null;return}
 const empty=ok.filter(i=>!c[i].opt&&!c[i].d&&!TC.dr[i]);let mi=-1;try{mi=mainMi(c)}catch(e){}
 TC.act=empty.length?(empty.includes(mi)?mi:empty[0]):(ok.includes(mi)?mi:ok[0])}
function decorate(){if(!bookOn())return;sync();const app=document.getElementById('app');const rord=app&&app.querySelector('main .rord');if(!rord)return;
 const lk=locked();pickAct();const c=card();
 c.forEach((sl,i)=>{if(!tableOk(sl))return;const el=rord.querySelector(`[data-dp="slot:${i}"]`);if(!el)return;const t=document.createElement('template');t.innerHTML=slotHtml(i).trim();el.replaceWith(t.content.firstChild)});
 rord.classList.add('tcrord');if(lk)rord.classList.add('tclock');
 const hd=rord.previousElementSibling;if(hd&&/running order/i.test(hd.textContent))hd.innerHTML=`<div class="h small" style="margin:0">Tonight's card</div><span class="row" style="gap:6px"><button class="mini" onclick="reorderOpen()">Running order</button></span>`;
 if(!lk&&TC.act!=null){const main=app.querySelector('main');const old=main.querySelector('#tcdock');if(old)old.remove();main.insertAdjacentHTML('beforeend',dockHtml());
  const pk=document.querySelector('.tcpk.on');if(pk&&pk.scrollIntoView)try{pk.scrollIntoView({inline:'nearest',block:'nearest'})}catch(e){}
  const h=document.getElementById('tchand');if(h){h.scrollLeft=TC.dealt?0:TC.sx;h.addEventListener('scroll',()=>{TC.sx=h.scrollLeft},{passive:true})}TC.dealt=0;
  document.body.classList.add('tcbody')}
 else document.body.classList.remove('tcbody')}

/* actions the markup calls */
window.tcAct=function(i,stay){const sl=card()[i];if(!sl)return;if(!tableOk(sl)){if(sl.k==='match')return openMatch(i);if(sl.k==='xo'&&typeof openXo==='function')return openXo(i);return}
 if(TC.act===i&&TC.open){if(!stay)center(i);return}
 if(TC.act!==i||!TC.open){TC.act=i;TC.sel=null;TC.confirm=null;TC.tg=null;TC.rep=null;TC.f='fit';if(sl.k==='match'&&!TC.sh[i])TC.sh[i]=shapeOf(i,cur(i));TC.mode=(sl.k==='promo'?promoOk(cur(i))&&cur(i).b:!!sl.d)?'x':'w'}
 TC.open=true;TC.dealt=1;render();if(!stay)center(i)};
/* put the slot in the middle of the space between the header and the hand */
function center(i){requestAnimationFrame(()=>requestAnimationFrame(()=>{const el=document.querySelector(`.tcs[data-tcs="${i}"]`);if(!el)return;
 const hd=document.querySelector('header.top');const dk=document.getElementById('tcdock');const top=hd?hd.getBoundingClientRect().bottom:0;const bot=dk?(dk.classList.contains('tcsheet')?innerHeight-dk.offsetHeight:dk.getBoundingClientRect().top):innerHeight;
 const r=el.getBoundingClientRect();const room=bot-top;const d=r.height>room-16?r.top-(top+8):r.top+r.height/2-(top+room/2);if(Math.abs(d)>4)window.scrollBy({top:d,behavior:TC.open?'auto':'smooth'})}))}
window.tcOpen=function(){if(TC.act==null)pickAct();if(TC.act==null)return;TC.open=true;TC.dealt=1;render();center(TC.act)};
window.tcClose=function(){TC.open=false;TC.sel=null;TC.confirm=null;TC.tg=null;TC.rep=null;render()};
/* the tap that opened the sheet also lands a click on the backdrop; ignore it */
window.tcScrim=function(){if(Date.now()-SUP<450)return;tcClose()};
window.tcF=function(k){TC.f=k;TC.mode='w';TC.dealt=1;render();const b=document.getElementById('tcsb');if(b)b.scrollTop=0};
window.tcTg=function(j){const t=targets(TC.act,cur(TC.act))[j];if(t){TC.tg=t;TC.dealt=1;render()}};
window.tcBack=function(){const i=TC.act,id=TC.rep;TC.rep=null;TC.open=false;if(i!=null&&id)takeOff(i,id);else render()};
/* open the sheet for one space on the table, or to swap out someone already there */
function sheetAt(i,tg){if(locked())return;const sl=card()[i];if(!sl||!tableOk(sl))return;if(sl.k==='match'&&!TC.sh[i])TC.sh[i]=shapeOf(i,cur(i));TC.act=i;TC.tg=tg||null;TC.rep=null;TC.sel=null;TC.confirm=null;TC.mode='w';TC.f='fit';TC.open=true;TC.dealt=1;render();center(i)}
function sheetRep(i,id){if(locked())return;const sl=card()[i];if(!sl||!tableOk(sl))return;TC.act=i;TC.tg=null;TC.rep=id;TC.sel=null;TC.confirm=null;TC.mode='w';TC.f='fit';TC.open=true;TC.dealt=1;render();center(i)}
/* a card tapped in the sheet goes into the space the sheet is filling; then the sheet moves on to the next open space or closes */
function sheetPick(id){const i=TC.act;if(i==null||locked())return;const before=JSON.stringify(cur(i));
 if(TC.rep){replaceWith(i,TC.rep,id);if(TC.confirm)return;TC.rep=null;return afterPick(i,before)}
 const m=cur(i);const tg=card()[i].k==='promo'?(TC.tg||(!m.a?{t:'a'}:{t:'b'})):(TC.tg||defTarget(i,m));
 if(!tg)return toast(`${slotLab(i)} is full — pick a bigger match or swap someone out.`);
 play(i,id,tg);if(TC.confirm)return;afterPick(i,before)}
function afterPick(i,before){if(JSON.stringify(cur(i))===before)return;TC.tg=null;TC.f='fit';const sl=card()[i];const m=cur(i);
 const more=sl.k==='promo'?!m.b:TC.sh[i]?!!defTarget(i,m):!sl.d&&!!defTarget(i,m);
 if(more){TC.mode='w';TC.open=true;TC.dealt=1}else TC.open=false;render();if(TC.open)center(i)}
window.tcMode=function(k){TC.mode=k;TC.sel=null;TC.dealt=1;render()};
window.tcYes=function(){const c=TC.confirm;if(!c)return;TC.confirm=null;const before=JSON.stringify(cur(c.i));if(c.tg&&c.tg.t==='swap'){replaceWith(c.i,c.tg.old,c.id,true);TC.rep=null}else play(c.i,c.id,c.tg,true);afterPick(c.i,before)};
window.tcNo=function(){TC.confirm=null;render()};
window.tcDeck=function(){const i=TC.act;const sl=card()[i];if(!sl)return;const m=cur(i);const here=new Set(idsOf(i,m));const promo=sl.k==='promo';
 const anchor=[...here].pop();const opps=anchor?[W_(anchor)]:[];
 openPicker({title:`Play a card into ${slotLab(i)}`,bk:true,except:i,sort:'fit',g:'all',fitMic:promo,
  bkNote:promo?'They can still cut this promo too.':`Anyone can work up to ${DD_MAX} matches a show — the second costs ${DD_FAT}× the stamina.`,
  rival:w=>pkRival(w,opps),chem:opps.length&&!promo?w=>chemOpp(w,opps[0]):null,feud:w=>opps.length?feudVs(w,opps):hotFeud(w),
  pool:()=>ownList('p').filter(w=>!w.inj&&!here.has(w.id)&&(promo||!fullIn('p',i).has(w.id))),
  info:w=>promo?`<em class="chm ${w.mic>=85?'cg':w.mic>=70?'cn':'cb'}">Mic ${Math.round(w.mic)}</em>`:anchor?`<em class="chm">${esc(chemWord(chemOpp(w,W_(anchor))))}${metPair(w.id,anchor)?'':' ❓'}</em>`:'',
  onPick:id=>{closeModal();if(id)setTimeout(()=>play(i,id,null),30)},back:()=>closeModal()})};

/* ---------------- touch: drag, flick, tap, hold, swipe off ---------------- */
let PD=null,DR=null,LP=null,SUP=0,MOM=0,AS=0;
const inBook=()=>bookOn()&&!locked();
/* hand cards: drag up to play, sideways to scroll, tap to play here, hold for details (opens when you let go).
   table cards: tap = winner, flick sideways = back to your hand, hold to pick up (then drop on another slot to move it,
   on another wrestler to trade places, or anywhere outside the card to send it back), hold and let go = details. */
const HOLD=260;
document.addEventListener('pointerdown',e=>{if(!inBook()||(e.pointerType==='mouse'&&e.button!==0))return;
 if(e.target.closest('.tccr,.tcwin,.tcpin'))return;const hc=e.target.closest('#tchand [data-tcw],#tchand .tx');const tc=e.target.closest('.tcs [data-tcon]');if(!hc&&!tc)return;
 const el=hc||tc;const h=document.getElementById('tchand');cancelAnimationFrame(MOM);
 PD={el,id:el.dataset.tcw,x2:el.dataset.tcx,x:e.clientX,y:e.clientY,pid:e.pointerId,hand:!!hc,on:tc?+tc.dataset.tcon:null,sl:h?h.scrollLeft:0,lx:e.clientX,lt:Date.now(),v:0};
 clearTimeout(LP);
 if(PD.id&&PD.hand)LP=setTimeout(()=>{if(PD){PD.long=true;buzz()}},480);
 if(PD.id&&!PD.hand)LP=setTimeout(()=>{if(!PD)return;buzz();startDrag({clientX:PD.x,clientY:PD.y},true)},HOLD)},true);
document.addEventListener('pointermove',e=>{
 if(DR){e.preventDefault();moveDrag(e.clientX,e.clientY);return}
 if(!PD||e.pointerId!==PD.pid)return;const dx=e.clientX-PD.x,dy=e.clientY-PD.y;if(Math.hypot(dx,dy)>8){clearTimeout(LP);PD.long=false}
 if(PD.hand){const h=document.getElementById('tchand');
  if(PD.scrub){e.preventDefault();if(h)h.scrollLeft=PD.sl-dx;const t=Date.now();PD.v=(e.clientX-PD.lx)/Math.max(1,t-PD.lt);PD.lx=e.clientX;PD.lt=t;return}
  if(dy<-8&&Math.abs(dy)>=Math.abs(dx)*.45){startDrag(e);return}
  if(Math.abs(dx)>8)PD.scrub=true}
 else{if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)){PD.flick=true;startDrag(e)}else if(Math.abs(dy)>12){clearTimeout(LP);PD=null}}},{passive:false});
/* once a card is picked up the page must not scroll under the finger (iOS needs this on touchmove) */
document.addEventListener('touchmove',e=>{if(DR)e.preventDefault()},{passive:false});
document.addEventListener('pointerup',e=>{clearTimeout(LP);if(DR){endDrag(e.clientX,e.clientY);return}if(!PD)return;const p=PD;PD=null;
 if(p.scrub){SUP=Date.now();let v=p.v*16;const h=document.getElementById('tchand');const step=()=>{if(Math.abs(v)<.4||!h)return;h.scrollLeft-=v;TC.sx=h.scrollLeft;v*=.93;MOM=requestAnimationFrame(step)};MOM=requestAnimationFrame(step);return}
 if(Date.now()-SUP<300)return;SUP=Date.now();
 if(p.long&&p.id)return showW(p.id);
 if(p.hand)tapHand(p);else sheetRep(p.on,p.id)});
document.addEventListener('pointercancel',()=>{clearTimeout(LP);PD=null;if(DR){const d=DR;cleanup();if(d.on!=null&&d.flick&&Math.abs(d.lx-d.x)>12){SUP=Date.now();takeOff(d.on,d.id)}else render()}});
document.addEventListener('click',e=>{if(!on())return;if((Date.now()-SUP<350||(typeof DG_SUP!=='undefined'&&Date.now()<DG_SUP))&&e.target.closest&&e.target.closest('#tcdock,.tcs')&&(!e.target.closest('button')||e.target.closest('.tcpull'))){e.stopPropagation();e.preventDefault();return}
 if(!inBook())return;const cr=e.target.closest&&e.target.closest('[data-tccr]');if(cr){e.stopPropagation();e.preventDefault();if(cr.disabled)return;const [ci,si]=cr.dataset.tccr.split(':').map(Number);crownSide(ci,si);return}
 const pn=e.target.closest&&e.target.closest('[data-tcpin]');if(pn){e.stopPropagation();e.preventDefault();if(pn.disabled)return;const [ci,id]=pn.dataset.tcpin.split('|');pinPick(+ci,id);return}
 const pk=e.target.closest&&e.target.closest('#tcdock [data-tcpick]');if(pk){e.stopPropagation();e.preventDefault();sheetPick(pk.dataset.tcpick);return}
 const px=e.target.closest&&e.target.closest('#tcdock [data-tcx]');if(px){e.stopPropagation();e.preventDefault();applyX(TC.act,px.dataset.tcx);return}
 const d=e.target.closest&&e.target.closest('.tcdrop');if(d){e.stopPropagation();const t=JSON.parse(d.dataset.tct);const tg=Object.assign({},t);delete tg.s;sheetAt(t.s,tg);return}
 const s=e.target.closest&&e.target.closest('.tcs');if(s&&!e.target.closest('[data-tcon],button,.tcdrop')){tcAct(+s.dataset.tcs)}},true);
document.addEventListener('keydown',e=>{if(!inBook())return;if(e.key==='Escape'&&TC.open){tcClose();return}if(e.key!=='Enter'&&e.key!==' ')return;
 const sk=e.target.closest&&e.target.closest('#tcdock [data-tcpick],#tcdock [data-tcx],.tcdrop');if(sk){e.preventDefault();sk.click();return}const c=e.target.closest&&e.target.closest('#tchand [data-tcw],#tchand .tx,.tcs [data-tcon]');if(!c)return;e.preventDefault();
 if(c.closest('#tchand'))tapHand({el:c,id:c.dataset.tcw,x2:c.dataset.tcx});else sheetRep(+c.dataset.tcon,c.dataset.tcw)});
document.addEventListener('contextmenu',e=>{if(on()&&e.target.closest&&e.target.closest('.tkc,.tx'))e.preventDefault()});
function tapHand(p){const i=TC.act;if(p.x2)return applyX(i,p.x2);
 if(TC.sel===p.id){TC.sel=null;return render()}
 const m=cur(i);const t=targets(i,m);if(!t.length)return toast(`${slotLab(i)} is full. Drop a card on someone to swap them, or pick another slot.`);
 const d=defTarget(i,m);if(d)return play(i,p.id,d);TC.sel=p.id;render();toast('Pick a space: a partner or a third.')}
function startDrag(e,held){const p=PD;PD=null;clearTimeout(LP);if(!p||!document.body.contains(p.el))return;const r=p.el.getBoundingClientRect();
 const g=p.el.cloneNode(true);g.classList.add('tcghost');g.classList.remove('sel','deal');g.querySelectorAll('.tcw').forEach(x=>x.remove());g.style.width=r.width+'px';g.style.height=r.height+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';document.body.appendChild(g);
 p.el.style.opacity='.25';if(!p.x2){if(p.hand)TC.sel=p.id;document.querySelectorAll('.tcs').forEach(x=>x.classList.add('drag-ok'));document.querySelectorAll('.tcs.act .tcdrop').forEach(x=>x.classList.add('live'))}
 DR=Object.assign(p,{g,held:!!held,ox:p.x-r.left,oy:p.y-r.top,lx:e.clientX,ly:e.clientY,lt:Date.now(),vy:0,vx:0});document.body.classList.add('tcdragging');moveDrag(e.clientX,e.clientY);autoScroll()}
function moveDrag(x,y){const t=Date.now(),dt=Math.max(1,t-DR.lt);DR.vy=(y-DR.ly)/dt;DR.vx=(x-DR.lx)/dt;DR.lx=x;DR.ly=y;DR.lt=t;
 DR.g.style.transform=`translate(${x-DR.ox-parseFloat(DR.g.style.left)}px,${y-DR.oy-parseFloat(DR.g.style.top)}px) rotate(-4deg) scale(1.06)`;clearOver();const h=hit(x,y);if(h)h.classList.add('over')}
/* what's under the finger: a card already on the table, an open space, a slot or a slot chip */
function hit(x,y){const el=document.elementFromPoint(x,y);if(!el)return null;if(DR.x2)return el.closest('.tcs.act');
 const c=el.closest('.tcs [data-tcon]');if(c&&c!==DR.el&&!(DR.on!=null&&+c.dataset.tcon===DR.on&&c.dataset.tcw===DR.id))return c;
 const d=el.closest('.tcdrop');if(d)return d;return el.closest('.tcs,[data-tcpk]')}
function clearOver(){document.querySelectorAll('.tcs.over,.tcdrop.over,[data-tcpk].over,.tcs [data-tcon].over').forEach(x=>x.classList.remove('over'))}
function cleanup(){cancelAnimationFrame(AS);clearOver();if(DR){DR.g.remove();DR.el.style.opacity=''}DR=null;document.body.classList.remove('tcdragging');document.querySelectorAll('.drag-ok').forEach(x=>x.classList.remove('drag-ok'))}
function autoScroll(){cancelAnimationFrame(AS);const step=()=>{if(!DR)return;const y=DR.ly;const dock=document.getElementById('tcdock');const top=dock?dock.getBoundingClientRect().top:innerHeight;const hd=document.querySelector('header.top');const ht=hd?hd.getBoundingClientRect().bottom:0;
 let v=0;if(y<ht+80)v=-Math.min(18,(ht+80-y)/5);else if((DR.vy>.05||!DR.hand)&&y>top-70&&y<top+40)v=Math.min(14,(y-(top-70))/4);
 if(v){window.scrollBy(0,v);clearOver();const h=hit(DR.lx,DR.ly);if(h)h.classList.add('over')}AS=requestAnimationFrame(step)};AS=requestAnimationFrame(step)}
/* put one wrestler where another stands (the other goes back to your hand, or trades places if they came from the table) */
function swapM(i,oldId,newId){const sl=card()[i];const m=clone(cur(i));if(sl.k==='promo'){if(m.a===oldId)m.a=newId;else if(m.b===oldId)m.b=newId}else{m.sides=m.sides.map(s=>s.map(x=>x===oldId?newId:x));if(m.ri&&m.ri.t===oldId)delete m.ri}return m}
function canJoin(j,id,ignore){const w=W_(id);const sl=card()[j];if(idsOf(j).filter(x=>x!==ignore).includes(id)){toast(`${w.name} is already in that ${sl.k==='promo'?'segment':'match'}.`);return false}
 if(sl.k==='match'){if(fullIn('p',j).has(id)&&!idsOf(j).includes(id)){toast(`${w.name} can't take another match tonight — ${DD_MAX} is the limit.`);return false}if(card().some(o=>o.k==='xo'&&o.d&&o.d.a===id)){toast(`${w.name} is already in the dream match tonight.`);return false}}
 else{const other=idsOf(j).find(x=>x!==ignore);if(other&&promoPairBooked(other,id,j)){toast(`${w.name} and ${W_(other).name} already share a promo tonight.`);return false}}
 return true}
function moveTable(i,id,j){/* a card leaves slot i for slot j's next open space */
 const mj=cur(j);const tg=defTarget(j,mj);if(!tg){render();return toast(`${slotLab(j)} is full — drop on someone to swap them.`)}
 if(!canJoin(j,id)){render();return}
 const mi=clone(cur(i));const si=card()[i];if(si.k==='promo'){if(mi.a===id){mi.a=mi.b||'';mi.b=''}else if(mi.b===id)mi.b=''}else{mi.sides=mi.sides.map(s=>s.filter(x=>x!==id))}
 commit(i,mi);TC.act=j;TC.open=true;play(j,id,tg,true);0}
function tradeTable(i,id,j,other){/* two cards on the table trade places */
 if(i===j){const m=clone(cur(i));const sl=card()[i];if(sl.k==='promo'){const a=m.a;m.a=m.b;m.b=a}else m.sides=m.sides.map(s=>s.map(x=>x===id?other:x===other?id:x));commit(i,m);buzz();render();return 0}
 if(!canJoin(j,id,other)||!canJoin(i,other,id)){render();return}
 commit(i,swapM(i,id,other));commit(j,swapM(j,other,id));buzz();TC.dealt=1;render();0}
function replaceWith(j,other,id,force){/* a card from your hand takes someone's place; they go back to your hand */
 if(!canJoin(j,id,other)){render();return}
 if(!force&&card()[j].k==='match'&&usedIn('p',j).has(id)){TC.confirm={i:j,id,tg:{t:'swap',old:other}};TC.sel=null;render();return}
 commit(j,swapM(j,other,id));TC.act=j;TC.open=true;TC.sel=null;TC.confirm=null;buzz();TC.dealt=1;render();land(j,id);0}
function endDrag(x,y){const t=hit(x,y);const d=DR;cleanup();SUP=Date.now();
 if(d.x2){if(t||d.vy<-.5)applyX(TC.act,d.x2);else render();return}
 const moved=Math.hypot(x-d.x,y-d.y);
 if(d.on!=null){
  if(d.held&&moved<12)return showW(d.id);
  if(t&&t.dataset&&t.dataset.tcon!=null)return tradeTable(d.on,d.id,+t.dataset.tcon,t.dataset.tcw);
  if(t&&t.classList.contains('tcdrop')){const tg=JSON.parse(t.dataset.tct);if(tg.s!==d.on)return moveTable(d.on,d.id,tg.s)}
  const j=t?(t.dataset.tcpk!=null?+t.dataset.tcpk:t.dataset.tcs!=null?+t.dataset.tcs:null):null;
  if(j!=null&&j!==d.on){const sl=card()[j];if(!tableOk(sl)){render();return toast(`${slotLab(j)} has its own editor — tap it to open.`)}return moveTable(d.on,d.id,j)}
  if(j===d.on&&!(d.flick&&(Math.abs(d.vx)>.4||Math.abs(x-d.x)>90))){render();return}
  return takeOff(d.on,d.id)}
 if(t&&t.dataset&&t.dataset.tcon!=null)return replaceWith(+t.dataset.tcon,t.dataset.tcw,d.id);
 if(t&&t.classList.contains('tcdrop')){const tg=JSON.parse(t.dataset.tct);if(tg.s!==TC.act){TC.act=tg.s}play(tg.s,d.id,tg);return}
 const j=t?(t.dataset.tcpk!=null?+t.dataset.tcpk:t.dataset.tcs!=null?+t.dataset.tcs:null):null;
 if(j!=null){const sl=card()[j];if(!tableOk(sl)){TC.sel=null;render();return toast(`${slotLab(j)} has its own editor — tap it to open.`)}
  if(j!==TC.act){TC.act=j;TC.mode='w';TC.open=true}const m=cur(j);const df=defTarget(j,m);if(df)return play(j,d.id,df);if(targets(j,m).length){TC.sel=d.id;render();return toast('Drop it on + to add a partner or a third.')}TC.sel=null;render();return toast(`${slotLab(j)} is full — drop it on someone to swap them.`)}
 if(d.vy<-.45||(d.y-y)>90){const m=cur(TC.act);const df=defTarget(TC.act,m);if(df)return play(TC.act,d.id,df)}
 TC.sel=null;render()}

/* swipe the hand up to open it, down to put it away */
{let y0=null,x0=0,pid=null;
 document.addEventListener('pointerdown',e=>{if(!inBook())return;const z=e.target.closest&&e.target.closest('#tcdock .tcpull,#tcdock .tcsh');if(!z)return;y0=e.clientY;x0=e.clientX;pid=e.pointerId},true);
 document.addEventListener('pointerup',e=>{if(y0===null||e.pointerId!==pid)return;const dy=e.clientY-y0,dx=e.clientX-x0;y0=null;if(Math.abs(dy)<36||Math.abs(dy)<Math.abs(dx))return;
  SUP=Date.now();if(dy>0&&TC.open)tcClose()},true);
 document.addEventListener('pointercancel',()=>{y0=null},true)}
/* ---------------- hooks ---------------- */
if(typeof go==='function'){const g0=go;go=window.go=function(t){if(t==='book'&&tab!=='book'){TC.open=false;TC.sel=null}return g0.apply(this,arguments)}}
function attnDown(){if(!S||S.phase!=='season'||typeof tab==='undefined'||tab!=='book')return;const m=document.querySelector('#app main');if(!m)return;const a=m.querySelector('.card.attn');if(!a)return;
 const anchor=m.querySelector('.prodstrip')||m.querySelector('.lvdock')||m.querySelector('.btn.live');if(anchor&&anchor.parentElement)anchor.parentElement.insertBefore(a,anchor)}
/* Home (v280): tonight's headliners fanned out on the poster, and the hottest wrestlers as a row of cards */
function homeDeco(){if(!on()||!S||S.phase!=='season'||typeof tab==='undefined'||tab!=='home')return;const m=document.querySelector('#app main');if(!m||m.querySelector('.tchome'))return;
 const pc=m.querySelector('.card.showcard:not(.compact)');if(!pc)return;const mine=ownList('p');
 let ids=[];try{const c=card();const mi=mainMi(c);const d=c[mi]&&c[mi].d;if(d&&d.sides)ids=d.sides.flat()}catch(e){}
 ids=ids.filter(id=>W_(id)).slice(0,3);if(ids.length<3)mine.filter(w=>!w.inj&&!ids.includes(w.id)).sort((a,b)=>b.pop-a.pop).slice(0,3-ids.length).forEach(w=>ids.push(w.id));
 if(ids.length){const f=document.createElement('div');f.className='tcfan tchome';f.innerHTML=ids.map(id=>tcCard(W_(id),{noWear:true,attr:`onclick="showW('${id}')"`})).join('');const b=pc.querySelector(':scope>.btn');if(b)b.before(f);else pc.appendChild(f)}
 const hot=mine.filter(w=>!w.inj&&(w.mom||0)>0).sort((a,b)=>(b.mom||0)-(a.mom||0)||b.pop-a.pop).slice(0,8);
 if(hot.length>=3){const c=document.createElement('div');c.className='card tchome';c.innerHTML=`<div class="h small">Hottest right now</div><div class="tcrow">${hot.map(w=>tcCard(w,{tab:`▲ ${w.mom}`,tabc:'hot',noWear:true,attr:`onclick="showW('${w.id}')"`})).join('')}</div>`;
  const cal=m.querySelector('.seascal')||pc;cal.after(c)}}

/* ---------------- menus as cards (v284): Home's tiles become decks, the brand war a face-off, saved games show cards ---------------- */
const tcIni=n=>String(n||'').split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
function tcBk(inner,cls){return `<span class="tcbk2 ${cls||''}">${inner||''}</span>`}
function gmCard(name,you){return `<div class="tkc ${you?'fc':'hl'} tcgm"><div class="tcf"><div class="tcg">${esc(tcIni(name))}</div><span class="tct ${you?'must':''}">${you?'You':'Rival'}</span><div class="tcb"><b class="tcn">${esc(name)}</b><span class="tcc ${you?'t':'m'}">GM</span></div></div></div>`}
function pileOf(ws,dx){return `<span class="tcpile">${ws.map((w,k)=>`<span style="left:${k*dx}px;top:${k*3}px;transform:rotate(${(k-(ws.length-1)/2)*5}deg)">${tcCard(w,{noWear:true})}</span>`).join('')}</span>`}
function homeDecks(m){const tl=m.querySelector('.tiles');if(!tl||tl.dataset.tcd)return;tl.dataset.tcd='1';tl.classList.add('tcdecks');const mine=ownList('p');
 tl.querySelectorAll('.tile').forEach(t=>{const nm=(t.querySelector('b')||{}).textContent||'';let pile='';if(!/^(roster|titles)/i.test(nm))return;t.classList.add('tcdkt');
  if(/^roster/i.test(nm))pile=pileOf(mine.filter(w=>!w.inj).sort((a,b)=>ovr(b)-ovr(a)).slice(0,3),22);
  else if(/^titles/i.test(nm)){const ch=[];Object.values(S.titles).forEach(T=>{const w=W_(T.holders[0]);if(w&&w.own==='p'&&!ch.includes(w))ch.push(w)});pile=ch.length?pileOf(ch.sort((a,b)=>ovr(b)-ovr(a)).slice(0,2),26):tcBk('🏆')}
  else if(/office/i.test(nm))pile=`<span class="tccash"><small>Bank</small><b>${esc(money(S.money.p))}</b></span>`;
  else{const st=t.querySelector('span b');pile=tcBk(st?`<b class="tcst">${st.innerHTML}</b>`:'?')}
  t.insertAdjacentHTML('afterbegin',`<span class="tcdk">${pile}</span>`)})}
function homeWar(m){const n=m.querySelector('.warnames');if(!n||n.dataset.tcd)return;n.dataset.tcd='1';const box=n.closest('.card');const bar=box&&box.querySelector(':scope>.war');
 const pct=bar&&bar.querySelector('i')?parseFloat(bar.querySelector('i').style.width)||50:50;const rows=box?box.querySelectorAll(':scope>.row.sb'):[];
 const wins=`${S.hourWins.p||0}–${S.hourWins.ai||0}`;
 const np=(nm,you)=>`<div class="tcnp ${you?'y':''}"><span>${you?'You':ON()?'Friend':'Rival'}</span><b>${esc(nm)}</b></div>`;
 n.outerHTML=`<div class="tcwar">${np(S.gm,true)}<div class="tcrope"><span>Fan war</span><div class="r"><i style="left:${pct}%"></i></div><b>${wins}</b><span>Ratings wins</span></div>${np(S.rival,false)}</div>`;
 if(bar)bar.remove()}
function homeBrief(m){const b=m.querySelector('.bstrip .bsn');if(!b||b.dataset.tcd)return;b.dataset.tcd='1';b.innerHTML=`<span class="tcstk">${tcBk('')}${tcBk(b.textContent)}</span>`}
function homeMenus(){if(!on()||!S||S.phase!=='season'||typeof tab==='undefined'||tab!=='home')return;const m=document.querySelector('#app main');if(!m)return;homeDecks(m);homeWar(m)}
/* saved games: each one is a show card */
function showCard(g,big){const lg=g.k==='league';const wk=g.wk?(lg?`Wk ${Math.min(g.wk,SEASON)}/${SEASON}`:`Wk ${g.wk}`):'';
 const st=g.active?['now','Playing now']:g.turn==='mine'?['turn','Your turn']:g.turn==='wait'?['','Waiting']:g.at?['',whenTxt2(g.at)]:['',''];
 return `<span class="tcshow ${lg?'':'solo'} ${big?'cur':''}"><span class="sb">${lg?'League':'Solo'}<i>${esc(wk)}</i></span><span class="sg">${esc(tcIni(g.t))}</span><span class="sn">${esc(g.t)}</span><span class="sw">${esc(g.sub||'')}</span><span class="st ${st[0]}">${esc(st[1])}</span></span>`}
if(typeof gameHero==='function'){const gh0=gameHero;gameHero=window.gameHero=function(g){if(!on())return gh0.apply(this,arguments);
 const lab=g.turn==='mine'?"It's your turn":g.active?'Pick up where you left off':g.turn==='wait'?'Waiting on your friends':'Jump back in';const go=g.active?'closeModal()':gOpen(g);
 const stat=(v,l)=>v!=null&&v!==''?`<div><b>${v}</b><span>${l}</span></div>`:'';
 return `<div class="tchero"><button class="tcgo" onclick="${go}" aria-label="${esc(g.t)}">${showCard(g,true)}</button><div class="tchi"><span class="k">${esc(lab)}</span><b class="t">${esc(g.t)}</b>
 ${g.wk||g.fans?`<div class="tchs">${stat(g.wk?`${Math.min(g.wk,SEASON)}<small>/${SEASON}</small>`:'','Week')}${stat(g.fans?fmtFans(g.fans):'','Fans')}</div>`:''}
 <div class="tcha"><button class="btn" onclick="${go}">${g.turn==='mine'?'Take your turn':'Continue'}</button><button class="btn sec" onclick="gameMenu('${g.k}','${g.id}',${g.cur?1:0})" aria-label="More options">⋯</button></div></div></div>`}}
const r0=render;render=window.render=function(){const o=r0.apply(this,arguments);try{attnDown()}catch(e){}try{decorate()}catch(e){console.error('cards',e)}try{homeDeco()}catch(e){console.error('cards home',e)}try{homeMenus()}catch(e){console.error('cards menus',e)}return o};
/* Settings: a card to switch the table off */
if(typeof menuView==='function'){const mv=menuView;menuView=window.menuView=function(){const h=mv.apply(this,arguments);
 const cd=`<div class="card"><div class="row sb"><div class="h small" style="margin:0">🃏 Card table</div><div class="chips" style="margin:0"><button class="chip ${on()?'on':''}" onclick="cardsSet(true)">On</button><button class="chip ${on()?'':'on'}" onclick="cardsSet(false)">Off</button></div></div>
 <div class="muted tiny" style="margin-top:6px">${on()?'You book by tapping a space on the show and picking from the best wrestler cards for it. Hold a card on the show to drag it somewhere else.':'The classic Book screen: tap a slot to open its editor.'} The office line, live calls, the reveal and party-night TV follow this setting too.</div></div>`;
 return h.replace(/(<details class="card"><summary class="h small">How it all works)/,cd+'$1')}}
/* a new week or a new game starts a fresh table */
if(typeof suggestFill==='function'){const sf=suggestFill;suggestFill=window.suggestFill=function(){TC.dr={};return sf.apply(this,arguments)}}
if(typeof clearCard==='function'){const cc=clearCard;clearCard=window.clearCard=function(){TC.dr={};return cc.apply(this,arguments)}}
/* the full editors hand the slot back to the table when they close */
['saveMatch','savePromo','clearSlot'].forEach(fn=>{const f=window[fn];if(typeof f!=='function')return;window[fn]=function(){const i=fn==='savePromo'?(PE&&PE.i):(ED&&ED.i);const r=f.apply(this,arguments);if(i!=null)delete TC.dr[i];return r}});

/* ---------------- the office line: a stack of cards ---------------- */
function lineDeck(){if(!on())return;const m=document.querySelector('#modal .sbody');if(!m||!m.querySelector('.ibx-k')||m.dataset.tcl)return;m.dataset.tcl='1';
 const box=document.querySelector('#modal .sheet')||m;box.classList.add('tcline');let n=0;try{n=inboxList().length}catch(e){}if(n>1)box.classList.add(n>2?'tcb2':'tcb1');
 /* whoever is at the door becomes their card, on top of the stack */
 let cu=null;try{cu=typeof inboxCur==='function'?inboxCur():null}catch(e){}
 const ids=[cu&&cu.w,cu&&cu.w2].filter(id=>id&&W_(id));
 if(ids.length){const hd=document.createElement('div');hd.className='tclh';
  hd.innerHTML=`<div class="tclc">${ids.map(id=>tcCard(W_(id),{cls:'tcsm',noWear:true})).join('')}</div><div class="tclt"><span class="tclk">${esc((cu.kick||'').replace(/^[^A-Za-z]+/,''))}</span><b>${esc(cu.head||'')}</b></div>`;
  const k=m.querySelector('.ibx-k');const q=m.querySelector('.ibx-q');(q||k).after(hd);
  /* the card and its headline replace the page's own avatar row and title */
  m.querySelectorAll(':scope>.h.mhd, :scope>.duo').forEach(x=>x.style.display='none')}
 else if(cu&&cu.k==='tape'){const nmEl=m.querySelector('.brow b, .scene b');const nm=nmEl?nmEl.textContent.replace(/^[^A-Za-z]+/,'').trim():'';
  const hd=document.createElement('div');hd.className='tclh';
  hd.innerHTML=`<div class="tclc"><div class="tkc fc tcdown" role="button" tabindex="0" aria-label="Watch the tape"><div class="tcf"><div class="tcg">${esc(nm.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><span class="tct must">Prospect</span><div class="tcb"><b class="tcn">${esc(nm)}</b><span class="tcc">On tape</span></div></div><div class="tcback">TK<small>Tap to watch</small></div></div></div><div class="tclt"><span class="tclk">A tape on your desk</span><b>${nm?'Someone sent a tape':'A tape landed'}</b></div>`;
  const k=m.querySelector('.ibx-k');const q=m.querySelector('.ibx-q');(q||k).after(hd);m.querySelectorAll(':scope>.h.mhd').forEach(x=>x.style.display='none');
  const c=hd.querySelector('.tcdown');const flip=()=>{if(c.classList.contains('up'))return;c.classList.add('up');buzz();const b=hd.querySelector('.tclt b');if(b&&nm)b.textContent=nm};c.addEventListener('click',flip);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}})}
 /* the rest of the line: face-down cards */
 const q=m.querySelector('.ibx-q');if(q){q.classList.add('tcq');if(n>1)q.insertAdjacentHTML('beforeend',`<span class="tcqn">${n-1} more waiting</span>`)}
 /* two answers: swipe right for the first, left for the second */
 const btns=[...m.querySelectorAll('.scene button, .brow button, .choice')].filter(b=>!b.disabled&&b.offsetParent!==null&&!/later|back|close/i.test(b.textContent));
 if(btns.length!==2)return;const [yes,no]=btns;
 box.insertAdjacentHTML('beforeend',`<div class="tcstamp y">${esc(yes.textContent.trim().slice(0,24))}</div><div class="tcstamp n">${esc(no.textContent.trim().slice(0,24))}</div>`);
 m.insertAdjacentHTML('beforeend','<p class="muted tiny center tcswh">Swipe the card right or left to answer, or tap a button.</p>');
 let x0=null,y0=0,dx=0,pid=null,go=false;
 box.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,input,details,summary,select'))return;x0=e.clientX;y0=e.clientY;dx=0;pid=e.pointerId;go=false});
 box.addEventListener('pointermove',e=>{if(x0===null||e.pointerId!==pid)return;dx=e.clientX-x0;const dy=e.clientY-y0;if(!go){if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.3)go=true;else{if(Math.abs(dy)>14)x0=null;return}}
  box.style.transition='none';box.style.transform=`translateX(${dx}px) rotate(${dx/26}deg)`;const sy=box.querySelector('.tcstamp.y'),sn=box.querySelector('.tcstamp.n');if(sy)sy.style.opacity=Math.max(0,dx/110);if(sn)sn.style.opacity=Math.max(0,-dx/110)});
 const end=()=>{if(x0===null)return;x0=null;box.style.transition='';if(!go)return;
  if(Math.abs(dx)>110){box.style.transform=`translateX(${dx>0?520:-520}px) rotate(${dx>0?16:-16}deg)`;box.style.opacity='0';buzz();setTimeout(()=>{box.style.transform='';box.style.opacity='';(dx>0?yes:no).click()},230)}
  else{box.style.transform='';box.querySelectorAll('.tcstamp').forEach(s=>s.style.opacity=0)}};
 box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end)}

/* ---------------- live calls: cards you flick up ---------------- */
function callDeck(){if(!on())return;document.querySelectorAll('#modal .sdmenu:not([data-tcc])').forEach(mn=>{mn.dataset.tcc='1';const cs=[...mn.querySelectorAll(':scope>.choice')];if(cs.length<2)return;
 const row=document.createElement('div');row.className='tccalls';cs[0].before(row);cs.forEach(c=>{row.appendChild(c);c.classList.add('tccall');flick(c)});
 mn.insertAdjacentHTML('beforeend','<div class="tchint" style="padding:4px 0 0">Flick a card up or tap it to make the call.</div>')})}
function flick(el){let y0=null,x0=0,pid=null,t0=0;
 el.addEventListener('pointerdown',e=>{y0=e.clientY;x0=e.clientX;pid=e.pointerId;t0=Date.now()});
 el.addEventListener('pointermove',e=>{if(y0===null||e.pointerId!==pid)return;const dy=e.clientY-y0;if(Math.abs(e.clientX-x0)>Math.abs(dy)&&Math.abs(e.clientX-x0)>10){y0=null;el.style.transform='';return}if(dy<0){el.style.transition='none';el.style.transform=`translateY(${Math.max(-90,dy)}px)`}});
 const end=e=>{if(y0===null)return;const dy=e.clientY-y0;y0=null;el.style.transition='';if(dy<-40){el.style.transform='translateY(-120px)';el.style.opacity='.0';buzz();setTimeout(()=>{el.style.opacity='';el.click()},160);SUP=Date.now()}else el.style.transform=''};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',()=>{y0=null;el.style.transform=''})}
/* the flick fires its own click; the browser's click after a flick is swallowed */
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('.tccall');if(c&&e.isTrusted&&Date.now()-SUP<400){e.stopPropagation();e.preventDefault()}},true);
const mo=new MutationObserver(()=>{try{lineDeck()}catch(e){}try{callDeck()}catch(e){}});
function watch(){const m=document.getElementById('modal');if(m)mo.observe(m,{childList:true,subtree:true});else setTimeout(watch,300)}
watch();

/* ---------------- party-night TV: face-down cards on each GM's table ---------------- */
if(typeof tvWeek==='function'){const tw=tvWeek;tvWeek=window.tvWeek=function(){let h=tw.apply(this,arguments);if(!on())return h;let n=5;try{n=cardOf(curShow().ppv).length}catch(e){}
 return h.replace(/(<div class="tv-gm ([^"]*)"[\s\S]*?<div class="tv-lock">[\s\S]*?<\/div>)/g,(all,blk,cls)=>{const lk=/\blk\b/.test(cls);
  return blk+`<div class="tvpile ${lk?'lk':''}">${Array.from({length:lk?n:1},(_,k)=>`<i style="animation-delay:${k*90}ms"></i>`).join('')}</div>`})}}

/* ---------------- styles ---------------- */
const css=document.createElement('style');css.textContent=`
html.tcards .tkc{--w:92px;position:relative;flex:none;width:var(--w);aspect-ratio:5/7;max-width:100%;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;transition:transform .3s cubic-bezier(.2,.9,.3,1.2),opacity .2s;cursor:pointer}
.tkc .tcf{position:absolute;inset:0;overflow:hidden;border-radius:3px;background:#111 url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1px #3a3b42,0 6px 14px rgba(0,0,0,.55)}
.tkc .tcf::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;z-index:4;background:var(--face)}.tkc.hl .tcf::before{background:var(--heel)}
.tkc.ch .tcf{box-shadow:inset 0 0 0 2px var(--gold),0 6px 14px rgba(0,0,0,.55)}
.tkc .tcg{position:absolute;right:-6px;top:13%;font:900 italic calc(var(--w)*.62)/.8 'BC',Impact,sans-serif;letter-spacing:-.04em;color:rgba(242,193,78,.13);pointer-events:none}
.tkc .tcp{position:absolute;inset:0}.tkc .tcp img,.tkc .tcp svg{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block}
.tkc .tcf.ph::after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.45),transparent 28%,transparent 48%,rgba(0,0,0,.92) 80%)}
.tkc .tco{position:absolute;left:9px;top:6px;z-index:3;font:900 italic calc(var(--w)*.21)/1 'BC',Impact,sans-serif;color:#fff;text-shadow:0 1px 0 #000,0 0 8px rgba(0,0,0,.6)}
.tkc .tct{position:absolute;left:5px;top:calc(var(--w)*.3);z-index:3;max-width:calc(100% - 5px);font:800 italic calc(var(--w)*.105)/1.15 'BC',sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:2px 10px 2px 6px;background:#1e1e22;color:var(--text);clip-path:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.tkc .tct.must{background:var(--gold);color:#111}.tkc .tct.feud{background:var(--red);color:#fff}.tkc .tct.hot{background:#22382a;color:var(--good)}.tkc .tct.rub{background:#2a2a40;color:#b9b6ff}.tkc .tct.gold{background:#2c2410;color:var(--gold2)}
.tkc .tcb{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:0 5px 6px 9px}
.tkc .tcn{display:block;font:900 italic calc(var(--w)*.15)/.92 'BC',sans-serif;text-transform:uppercase;letter-spacing:.005em;text-wrap:balance;overflow-wrap:anywhere;text-shadow:0 1px 0 #000}.tkc .tcn.ln{font-size:calc(var(--w)*.135)}
.tkc .tcc{display:block;margin-top:3px;font:700 calc(var(--w)*.11)/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--good)}.tkc .tcc.t{color:var(--gold)}.tkc .tcc.b{color:var(--bad)}
.tkc.ch .tcb{padding-bottom:calc(var(--w)*.2)}
.tkc .tcbelt{position:absolute;left:5px;right:0;bottom:0;height:calc(var(--w)*.17);display:flex;align-items:center;padding-left:5px;font:900 italic calc(var(--w)*.1)/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#140f02;background:linear-gradient(90deg,var(--gold3),var(--gold),var(--gold3));white-space:nowrap;overflow:hidden}
.tkc.worn .tcp,.tkc.worn .tcg{filter:saturate(.3) brightness(.7)}.tkc.worn .tcf{background-blend-mode:luminosity}.tkc.worn .tcb::before{content:"";position:absolute;left:0;right:0;bottom:0;height:400%;z-index:-1;background:repeating-linear-gradient(115deg,transparent 0 9px,rgba(255,255,255,.04) 9px 10px);pointer-events:none}
.tkc.used .tcf::after{content:"ON CARD";position:absolute;left:50%;top:44%;inset:auto;z-index:5;transform:translate(-50%,-50%) rotate(-14deg);font:900 italic calc(var(--w)*.15)/1 'BC',sans-serif;letter-spacing:.06em;color:var(--gold);border:2px solid var(--gold);padding:2px 6px;background:rgba(0,0,0,.65);white-space:nowrap}
.tkc .tcw{position:absolute;left:50%;top:-12px;z-index:5;transform:translateX(-50%);font:900 italic 12px/1 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;background:var(--gold);color:#111;padding:3px 9px 2px;clip-path:var(--slant);white-space:nowrap}.tkc .tcw.pin{background:#1d1e23;color:var(--bad);box-shadow:inset 0 0 0 1px var(--bad)}
.tkc .tccr{position:absolute;left:50%;top:-16px;z-index:6;transform:translateX(-50%);width:38px;height:28px;display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1;background:#141417;border:0;box-shadow:inset 0 0 0 1.5px var(--gold3);clip-path:var(--slant);cursor:pointer;filter:grayscale(.85) brightness(1.1);opacity:.9;touch-action:manipulation}
.tkc .tccr:hover,.tkc .tccr:focus-visible{filter:none;opacity:1;box-shadow:inset 0 0 0 2px var(--gold)}.tkc .tccr:active{transform:translateX(-50%) scale(.92)}
.tkc .tcw.pin+.tccr{top:12px}
.tcs .tcsg{display:flex;flex-direction:column;gap:6px;align-items:stretch}.tcs .tcsg .tcside{justify-content:center}
.tcs .tccol{display:flex;flex-direction:column;gap:5px}
.tcwin{display:flex;align-items:center;justify-content:center;gap:6px;min-height:30px;padding:0 10px;font:900 italic 13px/1 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#141417;color:var(--mut);border:0;box-shadow:inset 0 0 0 1.5px #3d3e46;clip-path:var(--slant);cursor:pointer;touch-action:manipulation}
.tcwin b{font-size:15px;filter:grayscale(1) brightness(1.2);opacity:.75}.tcwin:not(.on):active{transform:scale(.96)}.tcwin:not(.on):hover,.tcwin:not(.on):focus-visible{color:var(--gold);box-shadow:inset 0 0 0 1.5px var(--gold)}
.tcwin.on{background:var(--gold);color:#111;box-shadow:none;cursor:default}.tcwin.on b{filter:none;opacity:1}.tcwin:disabled:not(.on){opacity:.5;cursor:default}
.tcpin{min-height:24px;padding:0 6px;font:800 italic 11px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;background:#141417;color:var(--mut);border:0;box-shadow:inset 0 0 0 1px #3d3e46;clip-path:var(--slant);cursor:pointer;white-space:nowrap;touch-action:manipulation}
.tcpin.on{background:var(--red);color:#fff;box-shadow:none}.tcpin:not(.on):hover,.tcpin:not(.on):focus-visible{color:var(--text);box-shadow:inset 0 0 0 1px var(--bad)}
.tkc.win .tcf{box-shadow:inset 0 0 0 2px var(--gold),0 0 0 2px rgba(242,193,78,.25),0 6px 14px rgba(0,0,0,.55)}
.tkc.pinned .tcf{box-shadow:inset 0 0 0 2px var(--red),0 6px 14px rgba(0,0,0,.55)}.tkc.pinned .tcp,.tkc.pinned .tcg{filter:saturate(.5) brightness(.8)}
.tkc:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
/* the table */
.tcrord{display:flex;flex-direction:column;gap:10px}
.tcs{position:relative;display:grid;grid-template-columns:30px 1fr;background:#141417;box-shadow:inset 0 0 0 1px var(--line);cursor:pointer;transition:box-shadow .2s,background .2s}
.tcs.act{box-shadow:inset 0 0 0 2px var(--gold)}.tcs.drag-ok{box-shadow:inset 0 0 0 1px rgba(242,193,78,.45)}.tcs.over{box-shadow:inset 0 0 0 3px var(--gold);background:#1d1a12}
.tcs .tcnum{background:var(--gold);color:#111;font:900 italic 22px/1 'BC',sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none}.tcs.opt .tcnum{background:var(--gold3)}.tcs.me .tcnum{background:var(--red);color:#fff}
.tcs .tcin{padding:9px 12px 12px;min-width:0}
.tcs .tchd{display:flex;align-items:center;gap:6px 8px;flex-wrap:wrap}.tcs .tctl{order:3;flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap}.tcs .tcmat.many .tkc{--w:62px}.tcs .tcmat.many .tcdrop{width:62px}.tcs .tcmat.many .tcs [data-tcon].over .tcf{box-shadow:inset 0 0 0 3px var(--gold),0 0 0 3px rgba(242,193,78,.35)}.tcs [data-tcon].over{transform:scale(1.05)}
.tcdrop.mini{width:30px}.tcs .tclb{flex:1;min-width:0;font:800 italic 14px/1.1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.tcs .tctl .tell{margin:0}.tcs .tcbk{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px 3px;background:var(--gold);color:#111;clip-path:var(--slant)}.tcs.opt .tcbk{background:#1d1e23;color:var(--gold)}
.tcs .tcdet{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px 4px;background:#1d1e23;color:var(--mut);clip-path:var(--slant);border:0;cursor:pointer}
.tcs .tcsum{font-size:13px;color:var(--mut);margin-top:3px}.tcs .tcsum b{color:var(--text);font-weight:600}
.tcs .tcmat{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;row-gap:16px;margin-top:14px}
.tcs .tcside{display:flex;gap:4px;align-items:stretch;position:relative}.tcs .tcside .tkc{--w:76px}
.tcs .tcvs{font:900 italic 18px/1 'BC',sans-serif;color:var(--red)}
.tcdrop{flex:none;width:76px;aspect-ratio:3/4;border:2px dashed #3d3e46;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px;font:800 italic 12px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);transition:border-color .15s,background .15s,color .15s}
.tcdrop.mini{width:36px;aspect-ratio:auto;font-size:18px}.tcdrop.live{border-color:var(--gold);color:var(--gold);background:rgba(242,193,78,.06);animation:tcpulse 1.1s ease-in-out infinite}.tcdrop.over{background:rgba(242,193,78,.22);border-style:solid}
@keyframes tcpulse{50%{background:rgba(242,193,78,.15)}}
.tcs .tcmods{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.tcm{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px 3px 12px;background:#1d1e23;clip-path:var(--slant)}.tcm.g{background:var(--gold);color:#111}.tcm.q{color:var(--mut)}
.tcrord.tclock .tcs{cursor:default}
/* the hand */
.tcdock{position:sticky;bottom:var(--navh,72px);z-index:5;margin:10px -16px 0;padding:14px 0 8px;background:linear-gradient(180deg,rgba(9,9,10,0),var(--bg,#09090a) 14px)}
.tcdock.shut{padding:10px 0 6px}
.tcpull{display:flex;align-items:center;gap:12px;width:calc(100% - 32px);margin:0 16px;padding:8px 14px 9px;background:#141417;box-shadow:inset 0 0 0 1px var(--gold3);border:0;color:var(--text);text-align:left;cursor:pointer;clip-path:var(--slant);position:relative;touch-action:none}
.tcpull .tcgrip{position:absolute;left:50%;top:4px;width:36px;height:3px;margin-left:-18px;background:#3d3e46;border-radius:2px}
.tcpull .tcpt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;padding-top:4px}.tcpull .tcpt b{font:900 italic 16px/1 'BC',sans-serif;text-transform:uppercase;letter-spacing:.04em;color:var(--gold)}.tcpull .tcpt span{font-size:12px;color:var(--mut)}
.tcpull .tcpa{font-size:14px;color:var(--gold)}
.tcpull.open{width:72px;margin:-6px auto 4px;padding:8px 0 6px;background:none;box-shadow:none;clip-path:none;justify-content:center}.tcpull.open .tcgrip{position:static;margin:0;width:44px;height:4px;background:#55565e}
.tcdock .tcpks{display:flex;gap:5px;padding:0 16px 8px;overflow-x:auto;scrollbar-width:none}.tcdock .tcpks::-webkit-scrollbar{display:none}
.tcpk{flex:1 0 auto;display:flex;align-items:center;justify-content:center;gap:4px;font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.03em;text-transform:uppercase;padding:7px 10px 6px 9px;background:#1d1e23;color:var(--mut);clip-path:var(--slant);border:0;white-space:nowrap;overflow:hidden;cursor:pointer}
.tcpk i{font-style:italic;font-weight:900;color:var(--gold)}.tcpk.done{color:var(--text);box-shadow:inset 0 -2px 0 var(--good)}.tcpk.sp{opacity:.7}
.tcpk.on{background:var(--gold);color:#111}.tcpk.on i{color:#111}.tcpk.over{background:var(--gold2);color:#111}
.tcdock .tcbar{display:flex;align-items:center;gap:8px;padding:0 16px 4px;touch-action:none}.tcdock .tcpks{touch-action:pan-x}
.tcdt{flex:1;min-width:0;font:800 italic 13px/1.2 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tcdt b{color:var(--gold)}
.tcseg{display:flex}.tcseg button{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:6px 11px 5px;background:#1d1e23;color:var(--mut);clip-path:var(--slant);border:0;cursor:pointer}.tcseg button.on{background:var(--gold);color:#111}
.tchand{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:16px 16px 4px;min-height:140px;align-items:flex-start}.tchand::-webkit-scrollbar{display:none}
.tchand .tkc{touch-action:none;cursor:grab}.tchand .tkc.sel{transform:translateY(-14px)}.tchand .tkc.sel .tcf{box-shadow:inset 0 0 0 2px var(--gold)}
.tchand .tkc.deal,.tchand .tx.deal{animation:tcdeal .36s cubic-bezier(.2,.9,.3,1.15) both}@keyframes tcdeal{from{transform:translateY(60px) rotate(8deg);opacity:0}}
.tx{flex:none;width:96px;aspect-ratio:5/7;background:#141417;box-shadow:inset 0 0 0 1px var(--line),0 6px 14px rgba(0,0,0,.5);border-radius:3px;padding:9px 8px;display:flex;flex-direction:column;gap:4px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;transition:transform .3s}
.tx.fit{box-shadow:inset 0 0 0 2px var(--gold)}.tx.on{background:var(--gold);color:#111}
.tx .txk{font:800 italic 10px/1.1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}.tx.on .txk,.tx.on .txd{color:#3a2e0a}
.tx .txn{font:900 italic 16px/.95 'BC',sans-serif;text-transform:uppercase;overflow-wrap:anywhere}.tx .txd{font-size:11px;line-height:1.25;color:var(--mut);margin-top:auto}
.tcdeck{flex:none;width:64px;align-self:stretch;min-height:120px;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#141417;box-shadow:inset 0 0 0 1px var(--line);border:0;font:800 italic 12px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);cursor:pointer}.tcdeck b{font-size:22px}
.tcempty{padding:30px 0;color:var(--mut);font-size:13px}
.tchint{font-size:12px;color:var(--mut);padding:2px 16px 0}
.tccf{margin:0 16px 8px;background:#1d1e23;padding:10px 12px;display:flex;align-items:center;gap:8px;font-size:13px}.tccf span{flex:1}
html.tcards .tkc.tcghost,.tx.tcghost{position:fixed!important;z-index:200;pointer-events:none;transition:none!important;animation:none!important;margin:0;opacity:.95}html.tcards .tkc.tcghost{--w:92px}.tx.tcghost{box-shadow:inset 0 0 0 2px var(--gold),0 14px 30px rgba(0,0,0,.6)}html.tcards .tkc.tcghost .tcf{box-shadow:inset 0 0 0 2px var(--gold),0 14px 30px rgba(0,0,0,.6)}
body.tcbody .lvdock{margin-bottom:6px}body.tcbody #toast{bottom:auto;top:calc(76px + env(safe-area-inset-top,0px))}
body.tcdragging{user-select:none;-webkit-user-select:none}.tcs,.tcdock{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
/* the office line */
#modal .tcline{position:relative;transition:transform .3s cubic-bezier(.2,.9,.3,1.1),opacity .25s;touch-action:pan-y}
#modal .sheet.tcb1{box-shadow:0 -7px 0 -3px #23242a,0 -1px 0 0 var(--gold3)}#modal .sheet.tcb2{box-shadow:0 -7px 0 -3px #23242a,0 -13px 0 -6px #1a1b20,0 -1px 0 0 var(--gold3)}
#modal .tclh{display:flex;gap:12px;align-items:flex-end;margin:6px 0 12px}#modal .tclc{display:flex;gap:6px;flex:none}#modal .tclc .tkc{--w:92px;cursor:default}
#modal .tclt{min-width:0;display:flex;flex-direction:column;gap:4px;padding-bottom:4px}#modal .tclk{font:800 italic 12px/1.1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}#modal .tclt b{font:900 italic 21px/1.02 'BC',sans-serif;text-transform:uppercase;text-wrap:balance}
#modal .tcdown{cursor:pointer}#modal .tcdown .tcback{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 2px var(--gold3);clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));font:900 italic 30px/1 'BC',sans-serif;color:var(--gold);transition:transform .35s,opacity .35s}#modal .tcdown .tcback small{font:700 11px/1 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}#modal .tcdown.up .tcback{transform:perspective(500px) rotateY(90deg);opacity:0}
#modal .tcq .tcqn{font-size:12px;color:var(--mut);margin-left:16px}
#modal .tcq .ibx-a{clip-path:none;width:26px;height:34px;opacity:1;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1px var(--gold3);margin-right:-10px;transform:rotate(-4deg)}
#modal .tcq .ibx-a>*{opacity:0}#modal .tcq .ibx-a.on{display:none}
.tcstamp{position:absolute;top:18px;z-index:9;font:900 italic 24px/1 'BC',sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:4px 12px;border:3px solid;opacity:0;pointer-events:none;max-width:60%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:rgba(0,0,0,.7)}
.tcstamp.y{left:16px;color:var(--good);transform:rotate(-10deg)}.tcstamp.n{right:16px;color:var(--bad);transform:rotate(10deg)}
/* live calls */
.tccalls{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:14px 2px 6px;margin:0 -2px}.tccalls::-webkit-scrollbar{display:none}
.tccalls .choice.tccall{flex:1 0 132px;max-width:190px;margin:0;display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:150px;padding:12px 10px;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1px #3a3c44;border:0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:transform .25s cubic-bezier(.2,.9,.3,1.2),opacity .16s;touch-action:pan-x}
.tccalls .choice.tccall>div:first-of-type{font:800 italic 17px/1.05 'BC',sans-serif;text-transform:uppercase;letter-spacing:.01em}
.tccalls .choice.tccall .muted.tiny{margin-top:auto;font-size:11.5px;line-height:1.3}
.tccalls .choice.tccall .key{position:static}
/* the reveal: each segment flips over before its stars fill */
html.tcards .twpair .twh[data-k]{animation:tcflip .5s cubic-bezier(.2,.9,.3,1.1) both;transform-origin:50% 50%;backface-visibility:hidden}
html.tcards .twpair .twh[data-k]+.twh[data-k]{animation-delay:.12s}
@keyframes tcflip{from{transform:perspective(700px) rotateY(88deg);filter:brightness(.4)}to{transform:none;filter:none}}
/* party TV */
.tvpile{display:flex;justify-content:center;gap:4px;margin-top:8px;min-height:30px}
.tvpile i{display:block;width:22px;height:30px;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1px var(--gold3);animation:tvslam .35s cubic-bezier(.2,1.3,.4,1) both}
.tvpile:not(.lk) i{animation:tvbob 1.4s ease-in-out infinite}
@keyframes tvslam{from{opacity:0;transform:translateY(-40%) scale(1.5) rotate(-8deg)}}@keyframes tvbob{50%{transform:translateY(-4px) rotate(-3deg)}}
/* every tile, avatar and sheet in the card style (v280) */
html.tcards .cgrid{gap:16px 10px;justify-items:center}html.tcards .cgrid .tkc{--w:min(28vw,124px);width:var(--w)}
html.tcards .eslot .tkc{--w:min(30vw,112px);width:var(--w);margin:0 auto}html.tcards .vscol .tkc{--w:min(30vw,112px);width:var(--w);margin:0 auto}
html.tcards .tkc.sel .tcf{box-shadow:inset 0 0 0 3px var(--gold),0 0 0 2px rgba(242,193,78,.3),0 6px 14px rgba(0,0,0,.55)}html.tcards .tkc.dis{opacity:.45;cursor:default}
.tkc .tcnew{position:absolute;right:4px;top:6px;z-index:3;font:900 italic 10px/1 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px 2px;background:var(--red);color:#fff;clip-path:var(--slant)}
html.tcards .wc.empty{aspect-ratio:5/7;width:min(30vw,112px);margin:0 auto;background:none;border:2px dashed #3d3e46;clip-path:none;box-shadow:none;color:var(--gold);font:800 italic 13px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase}
html.tcards.lk-hy .fav,html.tcards.lk-hy .lr .fav,html.tcards.lk-hy .duo .fav,html.tcards.lk-hy .tmrow .tmf .fav{width:26px;height:36px;border-radius:2px;clip-path:none;border:0;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 3px 0 0 var(--face),inset 0 0 0 1px #3a3b42}
html.tcards.lk-hy .fav.ah,html.tcards.lk-hy .duo .fav.ah{border:0;box-shadow:inset 3px 0 0 var(--heel),inset 0 0 0 1px #3a3b42}html.tcards.lk-hy .fav.af,html.tcards.lk-hy .duo .fav.af{border:0}
html.tcards #modal:not(.lobbyM) .sheet:not(.tv-live-sheet){background:linear-gradient(180deg,#1b1c21,#101115);border-top:0;box-shadow:0 -1px 0 var(--gold3),0 -20px 40px rgba(0,0,0,.6);padding-top:26px}
html.tcards #modal:not(.lobbyM) .sheet:not(.tv-live-sheet):before{display:block;top:8px;width:44px;height:4px;margin-left:-22px;background:#55565e;border-radius:2px;clip-path:none}
html.tcards #modal .mhd{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:var(--text);-webkit-text-fill-color:currentColor;font-size:24px;line-height:1.02;text-wrap:balance}
html.tcards .wd-pic.tcwd{width:auto;aspect-ratio:auto;overflow:visible;clip-path:none;box-shadow:none}html.tcards .wd-pic.tcwd .tkc{--w:118px;cursor:default}
/* menus as cards (v284): straight edges everywhere; containers are the table, things are cards */
html.tcards.lk-hy{--cut:none;--slant:none;--sl:none;--band:none}
html.tcards.lk-hy .card,html.tcards.lk-hy .tile,html.tcards.lk-hy .btn,html.tcards.lk-hy .mini,html.tcards.lk-hy .chip,html.tcards.lk-hy .slot,html.tcards.lk-hy .tcs,html.tcards.lk-hy .lbrow,html.tcards.lk-hy .lbtile,html.tcards.lk-hy .lbhero,html.tcards.lk-hy nav.tabs button.on{border-radius:3px}
html.tcards.lk-hy .hyb i{transform:none}html.tcards.lk-hy nav.tabs button.on:before{display:none}
html.tcards.lk-hy .tile em,html.tcards.lk-hy .tile:after{display:none}
.tcbk2{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--bw,66px);aspect-ratio:5/7;border-radius:3px;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1.5px var(--gold3),0 6px 14px rgba(0,0,0,.5);font:900 italic calc(var(--bw,66px)*.36)/1 'BC',sans-serif;color:var(--gold)}
.tcbk2 .tcst{position:absolute;left:6px;right:4px;bottom:7px;font-size:11px;letter-spacing:.02em;color:var(--gold);text-align:left;white-space:nowrap}
html.tcards .tiles.tcdecks .tile{height:auto;min-height:0;display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:12px}html.tcards .tiles.tcdecks .tile.tcdkt>svg{display:none}html.tcards .tiles.tcdecks .tile:not(.tcdkt){justify-content:flex-end}
.tcdk{position:relative;display:block;height:112px;width:100%}html.tcards .tiles.tcdecks .tile.tcdkt b{position:relative;z-index:1;margin-top:0}
html.tcards.lk-hy .showcard{background:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.78)),#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 4px 0 var(--red),inset 0 0 0 1px var(--gold3);border-radius:3px;padding-bottom:16px}html.tcards.lk-hy .showcard .kicker{color:var(--gold)}html.tcards.lk-hy .showcard .kicker i{background:var(--red);box-shadow:0 0 8px var(--red)}.tcpile{position:absolute;left:0;top:0;display:block}.tcpile>span{position:absolute}html.tcards .tcpile .tkc{--w:66px;width:66px;cursor:inherit;pointer-events:none}
.tccash{position:absolute;left:0;top:0;width:66px;aspect-ratio:5/7;border-radius:3px;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 2px var(--gold),0 6px 14px rgba(0,0,0,.5);display:flex;flex-direction:column;justify-content:flex-end;padding:6px 7px}.tccash b{font:900 italic 16px/1 'BC',sans-serif;color:var(--gold2)}.tccash small{font:700 9px/1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.tcwar{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,1.1fr) minmax(0,1fr);align-items:center;gap:10px;margin:4px 0 12px}
.tcnp{min-width:0;display:flex;flex-direction:column;gap:4px;padding:10px 10px 10px 12px;background:#1d1e23;border-radius:3px;box-shadow:inset 3px 0 0 var(--heel)}.tcnp.y{box-shadow:inset 3px 0 0 var(--gold)}.tcnp:last-child{text-align:right;box-shadow:inset -3px 0 0 var(--heel)}
.tcnp span{font:700 11px/1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}.tcnp b{font:900 italic 17px/1 'BC',sans-serif;text-transform:uppercase;text-wrap:balance;overflow-wrap:anywhere}.tcnp.y b{color:var(--gold)}
.tcrope{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}.tcrope .r{position:relative;width:100%;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--gold) 0 50%,var(--heel) 50%)}.tcrope .r::after{content:"";position:absolute;left:50%;top:-6px;bottom:-6px;width:1px;background:var(--mut)}
.tcrope .r i{position:absolute;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--gold2);box-shadow:0 0 0 3px #141417,0 0 12px rgba(246,221,142,.6)}
.tcrope b{font:900 italic 22px/1 'BC',sans-serif;font-variant-numeric:tabular-nums}.tcrope span{font:700 11px/1.2 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);text-align:center}
html.tcards .bstrip .bsn{display:flex;align-items:center}.tcstk{position:relative;display:block;width:42px;height:58px}.tcstk .tcbk2{position:absolute;inset:0;--bw:42px}.tcstk .tcbk2:first-child{transform:rotate(-8deg) translate(-3px,2px)}.tcstk .tcbk2:last-child{transform:rotate(5deg) translate(3px,0)}
/* saved games */
.tcshow{position:relative;display:block;width:var(--gw,120px);aspect-ratio:5/7;border-radius:3px;overflow:hidden;background:#0c0c0e url(card-bg.jpg) center/cover;box-shadow:inset 0 0 0 1px #3a3b42,0 8px 18px rgba(0,0,0,.55);text-align:left}
.tcshow.cur{box-shadow:inset 0 0 0 2px var(--gold),0 10px 24px rgba(0,0,0,.6)}
.tcshow .sb{position:absolute;left:0;right:0;top:0;height:calc(var(--gw,120px)*.2);display:flex;align-items:center;justify-content:space-between;padding:0 8px;background:var(--red);font:900 italic calc(var(--gw,120px)*.1)/1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#fff}.tcshow.solo .sb{background:#24252b;color:var(--gold)}.tcshow .sb i{font-style:normal;letter-spacing:.04em;opacity:.85}
.tcshow .sg{position:absolute;right:-4px;top:24%;font:900 italic calc(var(--gw,120px)*.5)/.8 'BC',sans-serif;letter-spacing:-.04em;color:rgba(242,193,78,.12)}
.tcshow .sn{position:absolute;left:9px;right:8px;bottom:calc(var(--gw,120px)*.26);font:900 italic calc(var(--gw,120px)*.15)/.92 'BC',sans-serif;text-transform:uppercase;text-wrap:balance;overflow-wrap:anywhere;color:var(--text);text-shadow:0 1px 0 #000;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.tcshow .sw{position:absolute;left:9px;right:8px;bottom:calc(var(--gw,120px)*.15);font:700 calc(var(--gw,120px)*.085)/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tcshow .st{position:absolute;left:0;right:0;bottom:0;height:calc(var(--gw,120px)*.13);display:flex;align-items:center;padding-left:9px;font:900 italic calc(var(--gw,120px)*.085)/1 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#1d1e23;color:var(--mut)}.tcshow .st.turn{background:linear-gradient(90deg,var(--gold3),var(--gold),var(--gold3));color:#140f02}.tcshow .st.now{background:#1d2a22;color:var(--good)}
.tcgo{border:0;padding:0;background:none;cursor:pointer;display:block}.tcgo:active{transform:scale(.97)}
html.tcards.lk-hy #games .lbtag{border-radius:2px;background:var(--red);color:#fff}html.tcards.lk-hy #games .lbtag.solo{background:#24252b;color:var(--gold)}html.tcards.lk-hy #games .lbst.turn{border-radius:2px}
.tcgame{position:relative;--gw:min(28vw,124px)}.tcgame .tcgm2{position:absolute;right:4px;top:calc(var(--gw)*.24);width:30px;height:26px;padding:0;border-radius:2px;background:rgba(0,0,0,.6);color:var(--text)}
.tchero{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:end;margin-bottom:18px;--gw:min(44vw,176px)}
.tchi{display:flex;flex-direction:column;gap:10px;min-width:0}.tchi .k{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}.tchi .t{font:900 italic 24px/1 'BC',sans-serif;text-transform:uppercase;text-wrap:balance;overflow-wrap:anywhere}
.tchs{display:flex;gap:16px}.tchs div{display:flex;flex-direction:column;gap:3px}.tchs b{font:900 italic 24px/1 'BC',sans-serif;font-variant-numeric:tabular-nums}.tchs b small{font-size:14px;color:var(--mut)}.tchs span{font:700 11px/1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
.tcha{display:flex;gap:6px}.tcha .btn{margin:0;min-height:46px;font-size:17px}.tcha .btn.sec{width:50px;flex:none;padding:0}
/* menu screens (v283): every panel is the same flat tile as the table, headed by a gold label */
html.tcards.lk-hy .card:not(.showcard):not(.ttape),html.tcards.lk-hy .tile{background:#141417;border:0;box-shadow:inset 0 0 0 1px var(--line)}
html.tcards.lk-hy .card.tcard,html.tcards.lk-hy .card.mine{box-shadow:inset 3px 0 0 var(--gold),inset 0 0 0 1px var(--line);border-top:0}
html.tcards.lk-hy .card.warn,html.tcards.lk-hy .card.conbar.warn,html.tcards.lk-hy .card.bstrip.hot{background:#141417;border-top:0;box-shadow:inset 3px 0 0 var(--red),inset 0 0 0 1px var(--line)}
html.tcards.lk-hy .card.conbar{border-top:0}
html.tcards.lk-hy .card .h.small,html.tcards.lk-hy .conbar>.row>b{font:800 13px/1.2 'BC','Barlow Condensed',sans-serif!important;font-style:italic!important;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
html.tcards.lk-hy .bstrip .bst b{font:900 italic 19px/1 'BC',sans-serif;text-transform:uppercase}html.tcards.lk-hy .bstrip .bsn{color:var(--gold)}
html.tcards.lk-hy .tile em{color:rgba(242,193,78,.16)}
.tcrow .tkc.tccon{--w:92px;width:92px}.tcmore{flex:none;width:92px;aspect-ratio:5/7;border:2px dashed #3d3e46;background:none;color:var(--mut);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:800 italic 12px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;text-align:center;cursor:pointer;padding:6px}.tcmore b{font-size:24px;color:var(--gold)}
.tcr .tcrm{display:flex;gap:3px;flex:none;margin-right:10px}.tcr .tcrm .tcmini .tkc{--w:28px;width:28px}
/* one look everywhere (v282): showdowns, live plates, the reveal, the draft */
.tcmini{display:inline-flex;flex:none;vertical-align:middle}.tcmini .tkc{--w:30px;width:30px;cursor:inherit;pointer-events:none}.tcmini .tkc .tcb,.tcmini .tkc .tct,.tcmini .tkc .tco,.tcmini .tkc .tcbelt,.tcmini .tkc .tcf::after{display:none}.tcmini .tkc .tcf{box-shadow:inset 0 0 0 1px #3a3b42}.tcmini .tkc.ch .tcf{box-shadow:inset 0 0 0 1.5px var(--gold)}.tcmini .tkc .tcf::before{width:3px}
html.tcards .sdph.tcin{aspect-ratio:5/7;height:92%;background:none;clip-path:none;box-shadow:none;overflow:visible}html.tcards .sdph.tcin>.tkc{--w:150px;width:100%;height:100%;cursor:default}
html.tcards .sdci .sdph.tcin{height:auto;width:72px;position:relative;left:auto;transform:none}html.tcards .sdci .sdph.tcin>.tkc{--w:72px}
html.tcards .lvp.tcl{background:none;box-shadow:none;padding:0;align-items:center;gap:6px}html.tcards .lvp.tcl .lvcs{display:flex;gap:4px;justify-content:center}html.tcards .lvp.tcl .tkc{--w:88px;width:var(--w);cursor:default}html.tcards .lvfo.many .lvp.tcl .tkc,html.tcards .lvp.tcl .lvcs.n3 .tkc{--w:62px}html.tcards .lvp.tcl .lvcs.n2 .tkc{--w:72px}
html.tcards .lvp.tcl .lvpn{font-size:15px;text-align:center}
html.tcards .twpl .tcmini{margin-right:8px}html.tcards .twpl .tcmini .tkc{--w:34px;width:34px}
html.tcards .tt-pic.tcin{width:auto;height:auto;overflow:visible;clip-path:none;background:none}html.tcards .tt-pic.tcin .tkc{--w:96px}html.tcards .ttape .tt-bg{display:none}
html.tcards .dtr .tcmini{margin-right:6px}
html.tcards .tv-last .tkc{--w:180px;width:var(--w)}
/* roster, titles and home in cards (v280) */
.tcrg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px 10px;justify-items:center;margin-top:12px}.tcrg .tkc{--w:min(29vw,124px)}html.tcards .tcrg .tkc{width:var(--w)}
@media(min-width:620px){.tcrg{grid-template-columns:repeat(5,1fr)}.tcrg .tkc{--w:112px}}
.tlrow .tlc{display:flex;gap:4px;flex:none}.tlrow .tlc .tkc{--w:58px}
.tcfan{display:flex;justify-content:center;gap:8px;margin:14px 0 4px}.tcfan .tkc{--w:min(24vw,96px)}.tcfan .tkc:nth-child(1){transform:rotate(-5deg) translateY(4px)}.tcfan .tkc:nth-child(3){transform:rotate(5deg) translateY(4px)}
.tcrow{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 8px;margin:0 -2px}.tcrow::-webkit-scrollbar{display:none}.tcrow .tkc{--w:84px}
/* the pick sheet (v280) */
.tcscrim{position:fixed;inset:0;z-index:14;background:rgba(0,0,0,.45);animation:tcfade .2s ease both}@keyframes tcfade{from{opacity:0}}
.tcdock.tcsheet{position:fixed;left:0;right:0;bottom:0;z-index:15;max-width:640px;margin:0 auto;padding:6px 0 env(safe-area-inset-bottom,0px);max-height:min(66vh,600px);display:flex;flex-direction:column;background:linear-gradient(180deg,#1b1c21,#101115);box-shadow:0 -1px 0 var(--gold3),0 -20px 40px rgba(0,0,0,.6);animation:tcup .3s cubic-bezier(.2,.9,.3,1) both}
@keyframes tcup{from{transform:translateY(100%)}}
.tcsheet .tcpull.open{flex:none;margin:0 auto 2px}
.tcsh{flex:none;display:flex;align-items:flex-end;gap:10px;padding:0 16px 10px;touch-action:none}
.tcst{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.tcsk{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.tcst b{font:900 italic 21px/1.02 'BC',sans-serif;text-transform:uppercase;text-wrap:balance}
.tcsx{flex:none;width:40px;height:36px;border:0;background:#1d1e23;color:var(--mut);clip-path:var(--slant);font:900 17px/1 'BC',sans-serif;cursor:pointer}
.tcdrop.ghost{opacity:.5;pointer-events:none}.tcshp{padding-bottom:8px}html.tcards #tcdock .tcshp .chip.on{background:var(--text);color:var(--ink);box-shadow:none}
.tcsc,.tcshc{flex:none;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 16px 10px}.tcsc::-webkit-scrollbar,.tcshc::-webkit-scrollbar{display:none}.tcsc .chip,.tcshc .chip{flex:none;margin:0}
.tcsb{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;border-top:1px solid var(--line);touch-action:pan-y}
.tcgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 10px;justify-items:center;padding:16px 16px 20px}
.tcgrid .tkc{--w:min(29vw,118px)}html.tcards .tcgrid .tkc{width:var(--w)}
.tcgrid .tkc:active{transform:scale(.95)}.tcgrid .tkc.deal{animation:tcdeal .32s cubic-bezier(.2,.9,.3,1.15) both}
.tcwhy{grid-column:1/-1;justify-self:stretch;font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);border-top:1px solid var(--line);padding-top:14px}.tcwhy:first-child{border:0;padding-top:0}
.tcgx{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;padding:16px}.tcgx .tx{width:auto;cursor:pointer;touch-action:manipulation}
.tcsheet .tcempty{padding:28px 16px;text-align:center}
.tcsf{flex:none;display:flex;gap:8px;padding:10px 16px;border-top:1px solid var(--line)}.tcsf .btn{margin:0}
.tcsheet .tccf{margin:0 16px 10px}
.tcdrop{cursor:pointer;flex-direction:column;gap:4px}.tcdrop b{font:900 26px/1 'BC',sans-serif;color:var(--gold)}.tcdrop.mini b{font-size:20px}
.tcs .tcside .tkc{--w:84px}.tcs .tcdrop{width:84px}.tcs .tcdrop.mini{width:36px}.tcs .tcmat.many .tcdrop{width:62px}
@media (prefers-reduced-motion:reduce){.tcscrim,.tcdock.tcsheet,.tkc,.tx,.tchand .tkc.deal,.tvpile i,html.tcards .twpair .twh[data-k]{animation:none!important;transition:none!important}}
`;document.head.appendChild(css);
window.TCARD=TC;
})();
