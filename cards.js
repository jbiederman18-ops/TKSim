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
const TC={act:null,mode:'w',sel:null,confirm:null,dr:{},wk:null,dealt:0,sx:0};
function wkKey(){return S?[S.season||0,S.week,S.gm,S.phase].join('|'):''}
function sync(){const k=wkKey();if(TC.wk!==k){TC.wk=k;TC.dr={};TC.act=null;TC.mode='w';TC.sel=null;TC.confirm=null}}
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
 const cls=['tc',w.al==='f'?'fc':'hl',t?'ch':'',worn?'worn':'',o.used?'used':'',o.cls||''].join(' ');
 return `<div class="${cls}" data-tcw="${w.id}" ${o.attr||''} tabindex="0" role="button" aria-label="${esc(w.name)}${t?', '+esc(t.n)+' champion':''}, ${cw}${o.tab?', '+esc(o.tab):''}">
 <div class="tcf"><div class="tcp">${portrait(w)}</div><span class="tco">${ovr(w)}</span>${o.tab?`<span class="tct ${o.tabc||''}">${esc(o.tab)}</span>`:''}<div class="tcb"><b class="tcn${w.name.length>13?' ln':''}">${esc(w.name)}</b><span class="tcc ${cc}">${esc(o.cond||cw)}</span>${t?`<i class="tcbelt">${esc(t.n)}</i>`:''}</div></div>${o.mark||''}</div>`}
window.tcCard=tcCard;

/* ---------------- dealing a hand ---------------- */
function defenseDue(id){return Object.values(S.titles||{}).some(t=>t.holders.includes(id)&&t.last!=null&&S.week-t.last>=4&&!card().some(sl=>sl&&sl.k==='match'&&sl.d&&sl.d.title===t.id))}
function promisedWith(id){let l=[];try{l=unmetPromises(card())}catch(e){}return l.filter(pr=>pr.a===id||pr.b===id).map(pr=>pr.a===id?pr.b:pr.a)}
function askMap(){try{return typeof attnAskMap==='function'?attnAskMap():new Map()}catch(e){return new Map()}}
function why(w,anchor,i,am,tg){const sl=card()[i],promo=sl.k==='promo';
 if(!anchor){
  if(!promo&&promisedWith(w.id).length)return ['Promised','must',90];
  if(am.has(w.id))return ['Asked for this','must',80];
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
 if(am.has(w.id))return ['Asked for this','must',26];
 if(A.al!==w.al&&tg!=='partner')return [met?'Face v heel':'Never met','',8];
 return [met?'':'Never met','',0]}
function hand(i){const sl=card()[i];if(!sl)return [];const m=cur(i);const here=idsOf(i,m);const promo=sl.k==='promo';
 const anchor=here.length?here[here.length-1]:null;const tg=defTarget(i,m);const am=askMap();
 const full=promo?new Set():fullIn('p',i);const used=usedIn('p',i);
 let pool=ownList('p').filter(w=>!w.inj&&!here.includes(w.id)&&!full.has(w.id));
 if(promo&&anchor)pool=pool.filter(w=>!promoPairBooked(anchor,w.id,i));
 const sc=pool.map(w=>{const r=why(w,anchor,i,am,tg&&tg.t);let v=(r?r[2]:0);
  v+=promo?(w.mic-70)/3:(ovr(w)-75)/3;if(anchor&&!promo)v+=Math.max(-6,Math.min(10,chemOpp(W_(anchor),w)));
  if(promo&&anchor)v+=Math.min(12,heatOf(anchor,w.id)/4);
  if(used.has(w.id))v-=45;v-=Math.max(0,(100-sta(w))-FAT_OK)/2;
  return {w,r,v}}).sort((a,b)=>b.v-a.v);
 let rubs=0;const out=[];for(const x of sc){if(x.r&&x.r[0]==='Rub'){if(rubs>=2)continue;rubs++}out.push(x);if(out.length>=TC_HAND)break}
 return out}

/* where a played card lands by default, and every place it could land */
function targets(i,m){const sl=card()[i];m=m||cur(i);
 if(sl.k==='promo')return !m.a?[{t:'a'}]:!m.b?[{t:'b'}]:[];
 const t=[];m.sides.forEach((s,j)=>{if(!s.length)t.push({t:'side',i:j})});if(t.length)return t;
 const sz=m.sides.map(s=>s.length);
 if(m.sides.length===2){const lo=Math.min(...sz);m.sides.forEach((s,j)=>{if(s.length<4&&s.length===lo)t.push({t:'partner',i:j})})}
 if(sz.every(n=>n===1)&&m.sides.length<4)t.push({t:'third'});
 return t}
function defTarget(i,m){const t=targets(i,m);return t.find(x=>x.t==='side'||x.t==='a'||x.t==='b')||(()=>{const p=t.filter(x=>x.t==='partner');return p.length===1?p[0]:null})()}

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
 tg=tg||defTarget(i,m);if(!tg)return toast(`${slotLab(i)} is set. Drop on + to add a partner or a third.`);
 if(tg.t==='side')m.sides[tg.i].push(id);
 else if(tg.t==='partner'){if(m.sides[tg.i].length>=4)return toast('That side is full.');m.sides[tg.i].push(id)}
 else if(tg.t==='third'){if(m.sides.some(s=>s.length>1))return toast('Triple threats and four-ways are one per corner.');if(m.sides.length>=4)return toast('Four corners is the most.');m.sides.push([id])}
 const was=!!card()[i].d;commit(i,m);TC.sel=null;TC.confirm=null;
 const now=card()[i].d;if(now&&!was&&tg.t==='side'){TC.mode='x';toast('Both sides set. Tap a card to pick the winner, or lay a stipulation.')}
 if(now&&tg.t==='partner'&&now.sides[tg.i].length>1&&typeof hyTeamName==='function'&&!hyTeamName(now.sides[tg.i]))toast(`New pairing: ${hyJoin(now.sides[tg.i])}.`);
 buzz();TC.dealt=1;render();land(i,id)}
function takeOff(i,id){if(locked())return;const sl=card()[i];if(!sl||!tableOk(sl))return;const m=clone(cur(i));
 if(sl.k==='promo'){if(m.a===id){m.a=m.b||'';m.b=''}else if(m.b===id)m.b='';}
 else{if(sl.d&&typeof promiseOf==='function'&&promiseOf(sl.d))toast('That was a promised match — fans are still expecting it.');m.sides=m.sides.map(s=>s.filter(x=>x!==id));if(m.winner!=null&&!m.sides[m.winner])m.winner=0}
 commit(i,m);TC.mode='w';TC.dealt=1;render();toast(`${W_(id).name} is back in your hand.`)}
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
 const pc=pinCands(d);if(pc.length>=2){const cp=pinOf(d);pc.slice().sort((a,b)=>S.w[a].pop-S.w[b].pop).forEach(id=>{const [c,t]=pinRub(d,id);out.push({x:`n:${id}`,k:d.type==='rumble'?'Eliminated last':'Takes the pin',n:S.w[id].name,d:t+'.',fit:c==='good',on:cp===id})})}
 out.push({x:'e',k:'Everything else',n:'Finish & run-ins',d:'Open the full match editor.',fit:false,on:false});
 return out}
function applyX(i,x){if(locked())return;const sl=card()[i];const [k,v]=[x.slice(0,1),x.slice(2)];
 if(k==='e')return openMatch(i);
 if(sl.k==='promo'){const m=clone(cur(i));m.type=v;commit(i,m);buzz();render();return}
 const d=sl.d;if(!d)return;
 if(k==='s'){d.stip=v;const st=STIPS[v];const f=stipFits(st,d);toast(f.spec.length&&v!=='std'?`${st.n} — suits ${shortNames(f.spec).replace(/&amp;/g,'&')}.`:`${st.n}.`)}
 if(k==='t'){d.title=d.title===v?'':v;if(d.title)toast(`${S.titles[v].n} title on the line.`)}
 if(k==='n')d.pin=v;
 delete d.ev;save();buzz();render()}

/* ---------------- drawing the table ---------------- */
function tellFor(i){const sl=card()[i];const sh=curShow();
 if(sl.k==='promo'){const m=cur(i);if(!m.a)return '';if(!promoOk(m))return `<span class="tell muted">Needs a second wrestler</span>`;try{const t=tellOf(promoEst({type:m.type,a:m.a,b:m.b||null}),true);return `<span class="tell ${t[3]}">${t[1]} ${t[2]}</span>`}catch(e){return ''}}
 if(!sl.d){const m=cur(i);return idsOf(i,m).length?`<span class="tell muted">${needTxt(m)}</span>`:''}
 try{const r=rateMatch(sl.d,{ppv:sh.ppv,allin:sh.ppv&&SUPER(S.week),preview:true});return tellHtml(r)}catch(e){return ''}}
function slotHtml(i){const c=card(),sl=c[i],act=i===TC.act&&!locked();const m=cur(i);const promo=sl.k==='promo';
 const ml=promo?null:(()=>{try{return mLab(c,i)}catch(e){return {}}})();const main=ml&&ml.main,opt=!!sl.opt;
 const tg=act&&TC.mode==='w'?targets(i,m):[];const live=act&&TC.sel&&TC.mode==='w';
 const drop=(t,label,cls)=>`<div class="tcdrop ${cls||''} ${live?'live':''}" data-tct='${JSON.stringify(Object.assign({s:i},t))}'>${label}</div>`;
 const pr=!promo&&sl.d&&typeof promiseOf==='function'?promiseOf(sl.d):null;
 const onC=(id)=>{if(!W_(id))return '';const d=sl.d;let mark='';if(d&&!promo&&!d.nc){if(d.sides[d.winner]&&d.sides[d.winner].includes(id))mark='<span class="tcw">Wins</span>';else{const p=pinCands(d).length>=2?pinOf(d):null;if(p===id)mark='<span class="tcw pin">Takes the pin</span>'}}
  return tcCard(W_(id),{attr:`data-tcon="${i}"`,mark})};
 let mat='',many=false;
 if(promo){mat=(m.a?`<div class="tcside">${onC(m.a)}</div>`:act?`<div class="tcside">${drop({t:'a'},'On the mic')}</div>`:'')
  +((m.b||(act&&m.a))?`<div class="tcvs">&amp;</div><div class="tcside">${m.b?onC(m.b):drop({t:'b'},PT[m.type]&&PT[m.type].b==='req'?'Opponent':'Second (optional)')}</div>`:'')}
 else if(act||idsOf(i,m).length){
  if(idsOf(i,m).length>3)many=true;
  mat=m.sides.map((s,j)=>{const ps=s.map(onC).join('');const em=!s.length&&act?drop({t:'side',i:j},j===0?'Play a card':'Opponent'):'';
   const pt=tg.find(t=>t.t==='partner'&&t.i===j)?drop({t:'partner',i:j},'+','mini'):'';return `<div class="tcside">${ps}${em}${pt}</div>`}).join('<div class="tcvs">vs</div>')
   +(tg.find(t=>t.t==='third')?`<div class="tcvs">vs</div><div class="tcside">${drop({t:'third'},'+ Third')}</div>`:'')}
 const d=sl.d;let mods='';
 if(promo&&m.a&&PT[m.type])mods=`<span class="tcm g">${esc(PT[m.type].n)}</span>`;
 if(!promo&&d){const st=stipKey(d);const f=stipFits(STIPS[st],d);mods=`<span class="tcm ${st!=='std'&&f.spec.length?'g':st==='std'?'q':''}">${esc(STIPS[st].n)}</span>${d.title&&S.titles[d.title]?`<span class="tcm g">${esc(S.titles[d.title].n)} title</span>`:''}${d.ri&&d.ri.x&&W_(d.ri.x)?`<span class="tcm">Run-in · ${esc(ln(W_(d.ri.x)))}</span>`:''}${typeof finOf==='function'&&finOf(d)!=='clean'?'<span class="tcm">Screwy finish</span>':''}`}
 const empty=!idsOf(i,m).length;
 const sum=empty&&!act?`<div class="tcsum">${opt?'Optional. Tap here or drag a card in — or leave it empty.':'Tap here or drag a card onto it.'}</div>`
  :empty&&act?`<div class="tcsum">${promo?'Your best talkers and anyone owed mic time lead your hand.':'Promises, requests and title defenses lead your hand.'}</div>`
  :!promo&&d?`<div class="tcsum"><b>${esc(MT[d.type].n)}</b> · ${esc(sideName(d.sides[d.winner]))} wins${pr?` · <span class="gold">${pr.kind==='contract'?'Contracted':pr.kind==='shot'?'Earned title shot':'Promised'}</span>`:''}</div>`:'';
 const tl=tellFor(i);
 return `<div class="tcs ${act?'act':''} ${main?'me':''} ${opt?'opt':''}" data-tcs="${i}" data-dp="slot:${i}">
 <div class="tcnum" data-dg="slot:${i}" title="Hold and drag to move it">${i+1}</div>
 <div class="tcin"><div class="tchd"><span class="tclb">${esc(slotLab(i))}${d&&d.stip==='bng'?' · Blood &amp; Guts':''}</span>${tl?`<span class="tctl">${tl}</span>`:empty&&!act?`<span class="tcbk">${opt?'Add':'Book it'}</span>`:''}${!empty?`<button class="tcdet" onclick="event.stopPropagation();${promo?'openPromo':'openMatch'}(${i})">Details</button>`:''}</div>
 ${sum}${mat?`<div class="tcmat${many?' many':''}">${mat}</div>`:''}${mods?`<div class="tcmods">${mods}</div>`:''}</div></div>`}
function dockHtml(){const i=TC.act;const sl=card()[i];if(!sl)return '';const m=cur(i);const promo=sl.k==='promo';const ids=idsOf(i,m);
 const title=TC.mode==='x'?`Lay on <b>${esc(slotLab(i))}</b>`:!ids.length?`Dealing for <b>${esc(slotLab(i))}</b>`:defTarget(i,m)||promo?`Best with <b>${esc(W_(ids[ids.length-1]).name)}</b>`:`<b>${esc(slotLab(i))}</b> set · + partner or third`;
 let h='';
 if(TC.mode==='x'){const xs=extras(i);h=xs.length?xs.map(x=>`<div class="tx ${x.fit?'fit':''} ${x.on?'on':''}" data-tcx="${esc(x.x)}" tabindex="0" role="button"><span class="txk">${esc(x.k)}</span><b class="txn">${esc(x.n)}</b><span class="txd">${esc(x.d)}</span></div>`).join(''):`<div class="tcempty">${promo?'Play a card first.':'Fill both sides first.'}</div>`}
 else{const l=hand(i);h=l.map((x,k)=>tcCard(x.w,{tab:x.r&&x.r[0]?x.r[0]:'',tabc:x.r?x.r[1]:'',used:usedIn('p',i).has(x.w.id),cls:(TC.sel===x.w.id?'sel ':'')+(TC.dealt?'deal':''),attr:`data-tch="1" style="animation-delay:${k*40}ms"`})).join('')
  +`<button class="tcdeck" onclick="tcDeck()"><b>${ownList('p').filter(w=>!w.inj).length}</b>Full deck</button>`}
 const chips=card().map((x,j)=>{const done=x.d&&(x.k!=='promo'||promoOk(x.d));return `<button class="tcpk ${j===i?'on':''} ${done?'done':''} ${tableOk(x)?'':'sp'}" data-tcpk="${j}" onclick="tcAct(${j})"><i>${j+1}</i>${esc(chipLab(j))}</button>`}).join('');
 const cf=TC.confirm&&W_(TC.confirm.id)?`<div class="tccf"><span>${esc(W_(TC.confirm.id).name)} is already on the card tonight. A second match costs ${DD_FAT}× the stamina.</span><button class="mini" onclick="tcNo()">No</button><button class="mini on" onclick="tcYes()">Book twice</button></div>`:'';
 return `<div class="tcdock" id="tcdock">${cf}<div class="tcpks">${chips}</div><div class="tcbar"><div class="tcdt">${title}</div><div class="tcseg"><button class="${TC.mode==='w'?'on':''}" onclick="tcMode('w')">Wrestlers</button><button class="${TC.mode==='x'?'on':''}" onclick="tcMode('x')">${promo?'Segment':'Stips &amp; more'}</button></div></div>
 <div class="tchand" id="tchand">${h}</div><div class="tchint" ${hintN()>=6?'hidden':''}>${TC.mode==='w'?'Drag a card onto any slot or number. Tap plays it here. Hold for details.':'Gold cards suit them. Tap one to lay it on the slot.'}</div></div>`}
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
  const h=document.getElementById('tchand');if(h){h.scrollLeft=TC.dealt?0:TC.sx;h.addEventListener('scroll',()=>{TC.sx=h.scrollLeft},{passive:true})}TC.dealt=0;
  document.body.classList.add('tcbody')}
 else document.body.classList.remove('tcbody')}

/* actions the markup calls */
window.tcAct=function(i){const sl=card()[i];if(!sl)return;if(!tableOk(sl)){if(sl.k==='match')return openMatch(i);if(sl.k==='xo'&&typeof openXo==='function')return openXo(i);return}
 if(TC.act===i)return;TC.act=i;TC.sel=null;TC.confirm=null;TC.mode=(sl.k==='promo'?promoOk(cur(i))&&cur(i).b:!!sl.d)?'x':'w';TC.dealt=1;render();
 requestAnimationFrame(()=>{const el=document.querySelector(`.tcs[data-tcs="${i}"]`);if(el&&!noScroll)el.scrollIntoView({block:'center',behavior:'smooth'});noScroll=false})};
let noScroll=false;
window.tcMode=function(k){TC.mode=k;TC.sel=null;TC.dealt=1;render()};
window.tcYes=function(){const c=TC.confirm;if(!c)return;TC.confirm=null;play(c.i,c.id,c.tg,true)};
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
document.addEventListener('pointerdown',e=>{if(!inBook()||(e.pointerType==='mouse'&&e.button!==0))return;
 const hc=e.target.closest('#tchand [data-tcw],#tchand .tx');const tc=e.target.closest('.tcs [data-tcon]');if(!hc&&!tc)return;
 const el=hc||tc;const h=document.getElementById('tchand');cancelAnimationFrame(MOM);
 PD={el,id:el.dataset.tcw,x2:el.dataset.tcx,x:e.clientX,y:e.clientY,pid:e.pointerId,hand:!!hc,on:tc?+tc.dataset.tcon:null,sl:h?h.scrollLeft:0,lx:e.clientX,lt:Date.now(),v:0};
 clearTimeout(LP);if(PD.id)LP=setTimeout(()=>{if(!PD)return;const id=PD.id;PD=null;SUP=Date.now();buzz();showW(id)},480)},true);
document.addEventListener('pointermove',e=>{
 if(DR){e.preventDefault();moveDrag(e.clientX,e.clientY);return}
 if(!PD||e.pointerId!==PD.pid)return;const dx=e.clientX-PD.x,dy=e.clientY-PD.y;if(Math.hypot(dx,dy)>8)clearTimeout(LP);
 if(PD.hand){const h=document.getElementById('tchand');
  if(PD.scrub){e.preventDefault();if(h)h.scrollLeft=PD.sl-dx;const t=Date.now();PD.v=(e.clientX-PD.lx)/Math.max(1,t-PD.lt);PD.lx=e.clientX;PD.lt=t;return}
  if(dy<-8&&Math.abs(dy)>=Math.abs(dx)*.45){startDrag(e);return}
  if(Math.abs(dx)>8)PD.scrub=true}
 else{if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy))startDrag(e);else if(Math.abs(dy)>12){clearTimeout(LP);PD=null}}},{passive:false});
document.addEventListener('pointerup',e=>{clearTimeout(LP);if(DR){endDrag(e.clientX,e.clientY);return}if(!PD)return;const p=PD;PD=null;
 if(p.scrub){SUP=Date.now();let v=p.v*16;const h=document.getElementById('tchand');const step=()=>{if(Math.abs(v)<.4||!h)return;h.scrollLeft-=v;TC.sx=h.scrollLeft;v*=.93;MOM=requestAnimationFrame(step)};MOM=requestAnimationFrame(step);return}
 if(Date.now()-SUP<300)return;SUP=Date.now();
 if(p.hand)tapHand(p);else crown(p.on,p.id)});
document.addEventListener('pointercancel',()=>{clearTimeout(LP);PD=null;if(DR){const d=DR;cleanup();if(d.on!=null&&Math.abs(d.lx-d.x)>12){SUP=Date.now();takeOff(d.on,d.id)}else render()}});
document.addEventListener('click',e=>{if(!on())return;if((Date.now()-SUP<350||(typeof DG_SUP!=='undefined'&&Date.now()<DG_SUP))&&e.target.closest&&e.target.closest('#tcdock,.tcs')&&!e.target.closest('button')){e.stopPropagation();e.preventDefault();return}
 if(!inBook())return;const d=e.target.closest&&e.target.closest('.tcdrop');if(d&&TC.sel){e.stopPropagation();const t=JSON.parse(d.dataset.tct);play(t.s,TC.sel,t);return}
 const s=e.target.closest&&e.target.closest('.tcs');if(s&&!e.target.closest('[data-tcon],button,.tcdrop')){tcAct(+s.dataset.tcs)}},true);
document.addEventListener('keydown',e=>{if(!inBook()||(e.key!=='Enter'&&e.key!==' '))return;const c=e.target.closest&&e.target.closest('#tchand [data-tcw],#tchand .tx,.tcs [data-tcon]');if(!c)return;e.preventDefault();
 if(c.closest('#tchand'))tapHand({el:c,id:c.dataset.tcw,x2:c.dataset.tcx});else crown(+c.dataset.tcon,c.dataset.tcw)});
document.addEventListener('contextmenu',e=>{if(on()&&e.target.closest&&e.target.closest('.tc'))e.preventDefault()});
function tapHand(p){const i=TC.act;if(p.x2)return applyX(i,p.x2);
 if(TC.sel===p.id){TC.sel=null;return render()}
 const m=cur(i);const t=targets(i,m);if(!t.length)return toast(`${slotLab(i)} is full. Pick another slot to deal for it.`);
 const d=defTarget(i,m);if(d)return play(i,p.id,d);TC.sel=p.id;render();toast('Pick a space: a partner or a third.')}
function startDrag(e){const p=PD;PD=null;clearTimeout(LP);const r=p.el.getBoundingClientRect();
 const g=p.el.cloneNode(true);g.classList.add('tcghost');g.classList.remove('sel','deal');g.style.width=r.width+'px';g.style.height=r.height+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';document.body.appendChild(g);
 p.el.style.opacity='.25';if(p.hand&&!p.x2){TC.sel=p.id;document.querySelectorAll('.tcs').forEach(x=>x.classList.add('drag-ok'));document.querySelectorAll('.tcs.act .tcdrop').forEach(x=>x.classList.add('live'))}
 DR=Object.assign(p,{g,ox:p.x-r.left,oy:p.y-r.top,lx:e.clientX,ly:e.clientY,lt:Date.now(),vy:0,vx:0});document.body.classList.add('tcdragging');moveDrag(e.clientX,e.clientY);autoScroll()}
function moveDrag(x,y){const t=Date.now(),dt=Math.max(1,t-DR.lt);DR.vy=(y-DR.ly)/dt;DR.vx=(x-DR.lx)/dt;DR.lx=x;DR.ly=y;DR.lt=t;
 DR.g.style.transform=`translate(${x-DR.ox-parseFloat(DR.g.style.left)}px,${y-DR.oy-parseFloat(DR.g.style.top)}px) rotate(-4deg) scale(1.06)`;clearOver();const h=hit(x,y);if(h)h.classList.add('over')}
function hit(x,y){const el=document.elementFromPoint(x,y);if(!el)return null;if(DR.x2)return el.closest('.tcs.act');const d=el.closest('.tcdrop');if(d)return d;return el.closest('.tcs,[data-tcpk]')}
function clearOver(){document.querySelectorAll('.tcs.over,.tcdrop.over,[data-tcpk].over').forEach(x=>x.classList.remove('over'))}
function cleanup(){cancelAnimationFrame(AS);clearOver();if(DR){DR.g.remove();DR.el.style.opacity=''}DR=null;document.body.classList.remove('tcdragging');document.querySelectorAll('.drag-ok').forEach(x=>x.classList.remove('drag-ok'))}
function autoScroll(){cancelAnimationFrame(AS);const step=()=>{if(!DR)return;const y=DR.ly;const dock=document.getElementById('tcdock');const top=dock?dock.getBoundingClientRect().top:innerHeight;
 let v=0;if(y<150)v=-Math.min(18,(150-y)/5);else if(DR.vy>.05&&y>top-70&&y<top)v=Math.min(14,(y-(top-70))/4);
 if(v){window.scrollBy(0,v);clearOver();const h=hit(DR.lx,DR.ly);if(h)h.classList.add('over')}AS=requestAnimationFrame(step)};AS=requestAnimationFrame(step)}
function endDrag(x,y){const t=hit(x,y);const d=DR;cleanup();SUP=Date.now();
 if(d.x2){if(t||d.vy<-.5)applyX(TC.act,d.x2);else render();return}
 if(d.on!=null){const el=document.elementFromPoint(x,y);const stay=el&&el.closest(`.tcs[data-tcs="${d.on}"]`);if(!stay||Math.abs(d.vx)>.6)takeOff(d.on,d.id);else render();return}
 if(t&&t.classList.contains('tcdrop')){const tg=JSON.parse(t.dataset.tct);if(tg.s!==TC.act){TC.act=tg.s}play(tg.s,d.id,tg);return}
 const j=t?(t.dataset.tcpk!=null?+t.dataset.tcpk:t.dataset.tcs!=null?+t.dataset.tcs:null):null;
 if(j!=null){const sl=card()[j];if(!tableOk(sl)){TC.sel=null;render();return toast(`${slotLab(j)} has its own editor — tap it to open.`)}
  if(j!==TC.act){TC.act=j;TC.mode='w'}const m=cur(j);const df=defTarget(j,m);if(df)return play(j,d.id,df);if(targets(j,m).length){TC.sel=d.id;render();return toast('Drop it on + to add a partner or a third.')}TC.sel=null;render();return toast(`${slotLab(j)} is full.`)}
 if(d.vy<-.45||(d.y-y)>90){const m=cur(TC.act);const df=defTarget(TC.act,m);if(df)return play(TC.act,d.id,df)}
 TC.sel=null;render()}

/* ---------------- hooks ---------------- */
const r0=render;render=window.render=function(){const o=r0.apply(this,arguments);try{decorate()}catch(e){console.error('cards',e)}return o};
/* Settings: a card to switch the table off */
if(typeof menuView==='function'){const mv=menuView;menuView=window.menuView=function(){const h=mv.apply(this,arguments);
 const cd=`<div class="card"><div class="row sb"><div class="h small" style="margin:0">🃏 Card table</div><div class="chips" style="margin:0"><button class="chip ${on()?'on':''}" onclick="cardsSet(true)">On</button><button class="chip ${on()?'':'on'}" onclick="cardsSet(false)">Off</button></div></div>
 <div class="muted tiny" style="margin-top:6px">${on()?'You book by playing wrestler cards onto the show: drag or tap them in, and your hand is dealt for each slot.':'The classic Book screen: tap a slot to open its editor.'} The office line, live calls, the reveal and party-night TV follow this setting too.</div></div>`;
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
  hd.innerHTML=`<div class="tclc"><div class="tc fc tcdown" role="button" tabindex="0" aria-label="Watch the tape"><div class="tcf"><div class="tcp"><svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice"><text x="60" y="64" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-size="60" fill="#f3d77a" fill-opacity=".2">${esc(nm.split(' ').map(x=>x[0]).join('').slice(0,2))}</text></svg></div><span class="tct must">Prospect</span><div class="tcb"><b class="tcn">${esc(nm)}</b><span class="tcc">On tape</span></div></div><div class="tcback">TK<small>Tap to watch</small></div></div></div><div class="tclt"><span class="tclk">A tape on your desk</span><b>${nm?'Someone sent a tape':'A tape landed'}</b></div>`;
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
html.tcards .tc{--w:92px;position:relative;flex:none;width:var(--w);aspect-ratio:3/4;max-width:100%;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;transition:transform .3s cubic-bezier(.2,.9,.3,1.2),opacity .2s;cursor:pointer}
.tc .tcf{position:absolute;inset:0;overflow:hidden;background:#0c0c0e url(card-bg.jpg) center/cover;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));box-shadow:inset 0 0 0 1px #3a3c44}
.tc .tcf::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;z-index:3;background:var(--face)}.tc.hl .tcf::before{background:var(--heel)}
.tc.ch .tcf{box-shadow:inset 0 0 0 2px #f1d27a,inset 0 0 18px rgba(246,221,142,.3)}
.tc .tcp{position:absolute;inset:0}.tc .tcp img,.tc .tcp svg{width:100%;height:100%;object-fit:cover;display:block}
.tc .tco{position:absolute;top:4px;left:7px;z-index:3;background:#000;color:var(--gold2);font:900 italic calc(var(--w)*.17)/1 'BC',Impact,sans-serif;padding:2px 6px 1px 4px;clip-path:var(--slant)}
.tc .tct{position:absolute;left:4px;top:calc(var(--w)*.28);z-index:3;max-width:calc(100% - 4px);font:800 italic calc(var(--w)*.105)/1.15 'BC',sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:2px 9px 1px 5px;background:#1d1e23;color:var(--text);clip-path:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tc .tct.must{background:var(--gold);color:#111}.tc .tct.feud{background:var(--red);color:#fff}.tc .tct.hot{background:#1d3324;color:var(--good)}.tc .tct.rub{background:#26264a;color:#c3c0ff}.tc .tct.gold{background:#2c2410;color:var(--gold2)}
.tc .tcb{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:22px 5px 5px 8px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.86) 40%,#000)}
.tc .tcn{display:block;font:800 italic calc(var(--w)*.15)/.95 'BC',sans-serif;text-transform:uppercase;letter-spacing:.01em;overflow-wrap:anywhere}.tc .tcn.ln{font-size:calc(var(--w)*.13)}
.tc .tcc{display:block;margin-top:2px;font:700 calc(var(--w)*.1)/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--good)}.tc .tcc.t{color:var(--gold)}.tc .tcc.b{color:var(--bad)}
.tc .tcbelt{display:block;margin:3px -5px -5px -8px;padding:2px 6px;font:900 italic calc(var(--w)*.095)/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#140f02;background:linear-gradient(90deg,var(--gold3),var(--gold),var(--gold3));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tc.worn .tcp{filter:saturate(.3) brightness(.7)}.tc.worn .tcf::after{content:"";position:absolute;inset:0;z-index:1;background:repeating-linear-gradient(115deg,transparent 0 9px,rgba(255,255,255,.04) 9px 10px)}
.tc.used .tcf::after{content:"ON CARD";position:absolute;left:50%;top:46%;z-index:4;transform:translate(-50%,-50%) rotate(-14deg);font:900 italic calc(var(--w)*.15)/1 'BC',sans-serif;letter-spacing:.06em;color:var(--gold);border:2px solid var(--gold);padding:2px 6px;background:rgba(0,0,0,.65);white-space:nowrap}
.tc .tcw{position:absolute;left:50%;top:-10px;z-index:5;transform:translateX(-50%);font:900 italic 11px/1 'BC',sans-serif;letter-spacing:.08em;text-transform:uppercase;background:var(--gold);color:#111;padding:3px 9px 2px;clip-path:var(--slant);white-space:nowrap}.tc .tcw.pin{background:#1d1e23;color:var(--bad);box-shadow:inset 0 0 0 1px var(--bad)}
.tc:focus-visible{outline:2px solid var(--gold2);outline-offset:2px}
/* the table */
.tcrord{display:flex;flex-direction:column;gap:10px}
.tcs{position:relative;display:grid;grid-template-columns:30px 1fr;background:#141417;box-shadow:inset 0 0 0 1px var(--line);cursor:pointer;transition:box-shadow .2s,background .2s}
.tcs.act{box-shadow:inset 0 0 0 2px var(--gold)}.tcs.drag-ok{box-shadow:inset 0 0 0 1px rgba(242,193,78,.45)}.tcs.over{box-shadow:inset 0 0 0 3px var(--gold);background:#1d1a12}
.tcs .tcnum{background:var(--gold);color:#111;font:900 italic 22px/1 'BC',sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none}.tcs.opt .tcnum{background:var(--gold3)}.tcs.me .tcnum{background:var(--red);color:#fff}
.tcs .tcin{padding:9px 12px 12px;min-width:0}
.tcs .tchd{display:flex;align-items:center;gap:6px 8px;flex-wrap:wrap}.tcs .tctl{order:3;flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap}.tcs .tcmat.many .tc{--w:62px}.tcs .tcmat.many .tcdrop{width:62px}.tcs .tcmat.many .tcdrop.mini{width:30px}.tcs .tclb{flex:1;min-width:0;font:800 italic 14px/1.1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.tcs .tctl .tell{margin:0}.tcs .tcbk{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px 3px;background:var(--gold);color:#111;clip-path:var(--slant)}.tcs.opt .tcbk{background:#1d1e23;color:var(--gold)}
.tcs .tcdet{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px 4px;background:#1d1e23;color:var(--mut);clip-path:var(--slant);border:0;cursor:pointer}
.tcs .tcsum{font-size:13px;color:var(--mut);margin-top:3px}.tcs .tcsum b{color:var(--text);font-weight:600}
.tcs .tcmat{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;row-gap:16px;margin-top:14px}
.tcs .tcside{display:flex;gap:4px;align-items:stretch;position:relative}.tcs .tcside .tc{--w:76px}
.tcs .tcvs{font:900 italic 18px/1 'BC',sans-serif;color:var(--red)}
.tcdrop{flex:none;width:76px;aspect-ratio:3/4;border:2px dashed #3d3e46;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px;font:800 italic 12px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);transition:border-color .15s,background .15s,color .15s}
.tcdrop.mini{width:36px;aspect-ratio:auto;font-size:18px}.tcdrop.live{border-color:var(--gold);color:var(--gold);background:rgba(242,193,78,.06);animation:tcpulse 1.1s ease-in-out infinite}.tcdrop.over{background:rgba(242,193,78,.22);border-style:solid}
@keyframes tcpulse{50%{background:rgba(242,193,78,.15)}}
.tcs .tcmods{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.tcm{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px 3px 12px;background:#1d1e23;clip-path:var(--slant)}.tcm.g{background:var(--gold);color:#111}.tcm.q{color:var(--mut)}
.tcrord.tclock .tcs{cursor:default}
/* the hand */
.tcdock{position:sticky;bottom:var(--navh,72px);z-index:5;margin:10px -16px 0;padding:14px 0 8px;background:linear-gradient(180deg,rgba(9,9,10,0),var(--bg,#09090a) 14px)}
.tcdock .tcpks{display:flex;gap:5px;padding:0 16px 8px}
.tcpk{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:4px;font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.03em;text-transform:uppercase;padding:7px 2px 6px;background:#1d1e23;color:var(--mut);clip-path:var(--slant);border:0;white-space:nowrap;overflow:hidden;cursor:pointer}
.tcpk i{font-style:italic;font-weight:900;color:var(--gold)}.tcpk.done{color:var(--text);box-shadow:inset 0 -2px 0 var(--good)}.tcpk.sp{opacity:.7}
.tcpk.on{background:var(--gold);color:#111}.tcpk.on i{color:#111}.tcpk.over{background:var(--gold2);color:#111}
.tcdock .tcbar{display:flex;align-items:center;gap:8px;padding:0 16px 4px}
.tcdt{flex:1;min-width:0;font:800 italic 13px/1.2 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tcdt b{color:var(--gold)}
.tcseg{display:flex}.tcseg button{font:800 italic 12px/1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:6px 11px 5px;background:#1d1e23;color:var(--mut);clip-path:var(--slant);border:0;cursor:pointer}.tcseg button.on{background:var(--gold);color:#111}
.tchand{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:16px 16px 4px;min-height:140px;align-items:flex-start}.tchand::-webkit-scrollbar{display:none}
.tchand .tc{touch-action:none;cursor:grab}.tchand .tc.sel{transform:translateY(-14px)}.tchand .tc.sel .tcf{box-shadow:inset 0 0 0 2px var(--gold)}
.tchand .tc.deal,.tchand .tx.deal{animation:tcdeal .36s cubic-bezier(.2,.9,.3,1.15) both}@keyframes tcdeal{from{transform:translateY(60px) rotate(8deg);opacity:0}}
.tx{flex:none;width:104px;min-height:122px;background:#141417;box-shadow:inset 0 0 0 1px var(--line);clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));padding:9px 8px;display:flex;flex-direction:column;gap:4px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;transition:transform .3s}
.tx.fit{box-shadow:inset 0 0 0 2px var(--gold)}.tx.on{background:var(--gold);color:#111}
.tx .txk{font:800 italic 10px/1.1 'BC',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}.tx.on .txk,.tx.on .txd{color:#3a2e0a}
.tx .txn{font:900 italic 17px/.95 'BC',sans-serif;text-transform:uppercase}.tx .txd{font-size:11px;line-height:1.25;color:var(--mut);margin-top:auto}
.tcdeck{flex:none;width:64px;align-self:stretch;min-height:122px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#141417;box-shadow:inset 0 0 0 1px var(--line);border:0;font:800 italic 12px/1.1 'BC',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);cursor:pointer}.tcdeck b{font-size:22px}
.tcempty{padding:30px 0;color:var(--mut);font-size:13px}
.tchint{font-size:12px;color:var(--mut);padding:2px 16px 0}
.tccf{margin:0 16px 8px;background:#1d1e23;padding:10px 12px;display:flex;align-items:center;gap:8px;font-size:13px}.tccf span{flex:1}
.tcghost{position:fixed;z-index:200;pointer-events:none;transition:none!important;--w:92px}
body.tcbody .lvdock{margin-bottom:6px}body.tcbody #toast{bottom:auto;top:calc(76px + env(safe-area-inset-top,0px))}
body.tcdragging{user-select:none;-webkit-user-select:none}
/* the office line */
#modal .tcline{position:relative;transition:transform .3s cubic-bezier(.2,.9,.3,1.1),opacity .25s;touch-action:pan-y}
#modal .sheet.tcb1{box-shadow:0 -7px 0 -3px #23242a,0 -1px 0 0 var(--gold3)}#modal .sheet.tcb2{box-shadow:0 -7px 0 -3px #23242a,0 -13px 0 -6px #1a1b20,0 -1px 0 0 var(--gold3)}
#modal .tclh{display:flex;gap:12px;align-items:flex-end;margin:6px 0 12px}#modal .tclc{display:flex;gap:6px;flex:none}#modal .tclc .tc{--w:92px;cursor:default}
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
@media (prefers-reduced-motion:reduce){.tc,.tx,.tchand .tc.deal,.tvpile i,html.tcards .twpair .twh[data-k]{animation:none!important;transition:none!important}}
`;document.head.appendChild(css);
window.TCARD=TC;
})();
