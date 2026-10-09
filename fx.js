/* Tony Khan Simulator — broadcast effects (v161).
   Eight visual upgrades for the Classic look, all in one place and all respecting the phone's reduce-motion setting:
     1. Title changes — a full-screen "AND NEW" moment with the belt plate sliding in (solo reveal and the party-night TV)
     2. Debuts & call-ups — a titantron entrance with a name slam and light sweeps; hotter ROH buzz = bigger pop
     3. Results that hit — 5★ segments shake with a star burst, flat ones go grey, "You win the night" fires confetti
     4. Live numbers — fans and money in the header count up or down with a floating +/- chip; hype bars fill
     5. Wrestler cards — 🔥 streak flame, mood badge for unhappy wrestlers, a soft face/heel edge glow, ROH buzz meters
     6. Broadcast lower-thirds — live promos and matches get Dynamite-style name bars and a news ticker
     7. Smoother navigation — screens slide in the direction you move, and the bottom-nav highlight glides between tabs
     8. ROH identity — the ROH screen gets its own red-and-black HonorClub styling
   Loaded last; hooks in by wrapping globals. */
'use strict';
(function(){
const RM=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
const css=`
#fxo{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:24px;background:radial-gradient(ellipse at center,rgba(40,30,8,.94),rgba(0,0,0,.97) 70%);cursor:pointer;overflow:hidden;animation:fxIn .25s ease-out both}
#fxo.out{animation:fxOut .35s ease-in both}
@keyframes fxIn{from{opacity:0}to{opacity:1}}@keyframes fxOut{to{opacity:0}}
#fxo .fl{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,rgba(255,236,170,.9),transparent 55%);opacity:0;animation:fxFlash .9s ease-out .15s both;pointer-events:none}
@keyframes fxFlash{0%{opacity:0}18%{opacity:1}100%{opacity:0}}
#fxo .kk{font:900 italic clamp(18px,5vw,34px)/1 'BC',Impact,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:var(--red,#e2332b);text-shadow:0 0 18px rgba(226,51,43,.6);animation:fxDrop .5s cubic-bezier(.2,1.4,.4,1) .2s both}
#fxo .nmx{font:900 italic clamp(38px,12vw,96px)/.95 'BC',Impact,sans-serif;text-transform:uppercase;color:var(--gold2,#f6dd8e);text-shadow:0 4px 0 #6b5212,0 0 40px rgba(246,221,142,.55);margin:14px 0 14px;animation:fxSlam .55s cubic-bezier(.2,1.5,.3,1) .9s both}
#fxo .sub{font:800 clamp(14px,3.8vw,24px)/1.2 'BC',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#e9dcc0;animation:fxDrop .5s ease-out 1.25s both}
#fxo .tap{position:absolute;bottom:22px;left:0;right:0;font:600 12px 'Barlow',sans-serif;color:#8d877a;letter-spacing:.1em;text-transform:uppercase;animation:fxIn .4s 1.8s both}
@keyframes fxDrop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:none}}
@keyframes fxSlam{0%{opacity:0;transform:scale(2.4)}60%{opacity:1;transform:scale(.94)}80%{transform:scale(1.03) rotate(-.6deg)}100%{transform:none}}
@keyframes fxBelt{from{opacity:0;transform:translateY(60px) scale(.7)}to{opacity:1;transform:none}}
.fxbi{display:block;max-width:min(88vw,560px);max-height:30vh;object-fit:contain;margin:6px auto 0;filter:drop-shadow(0 10px 30px rgba(0,0,0,.7)) drop-shadow(0 0 26px rgba(246,221,142,.35));animation:fxBelt .7s cubic-bezier(.2,1.2,.3,1) .45s both}
.fxplate{display:inline-block;margin:10px auto 0;padding:10px 26px;border-top:2px solid var(--gold,#d8b449);border-bottom:2px solid var(--gold,#d8b449);background:linear-gradient(90deg,transparent,rgba(216,180,73,.18),transparent);font:900 italic clamp(16px,4.6vw,30px)/1 'BC',Impact,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#f3e6c4;animation:fxBelt .7s cubic-bezier(.2,1.2,.3,1) .45s both}
#fxo .bm{position:absolute;bottom:-20%;width:40vmax;height:140vmax;background:linear-gradient(0deg,rgba(255,230,160,.0),rgba(255,230,160,.18) 60%,transparent);transform-origin:50% 100%;pointer-events:none;filter:blur(6px)}
#fxo .bm.a{left:5%;animation:fxBeamA 3.2s ease-in-out infinite}#fxo .bm.b{right:5%;animation:fxBeamB 3.2s ease-in-out infinite}
@keyframes fxBeamA{0%,100%{transform:rotate(-28deg)}50%{transform:rotate(14deg)}}@keyframes fxBeamB{0%,100%{transform:rotate(28deg)}50%{transform:rotate(-14deg)}}
#fxo.hot .bm{background:linear-gradient(0deg,transparent,rgba(255,120,60,.25) 60%,transparent)}
.fxspark{position:absolute;bottom:0;width:6px;height:6px;border-radius:50%;background:#ffd36b;box-shadow:0 0 8px #ffb02e;animation:fxSpark 1.6s ease-out both;pointer-events:none}
@keyframes fxSpark{from{transform:translate(0,0);opacity:1}to{transform:translate(var(--dx),var(--dy));opacity:0}}
.fxconf{position:fixed;top:-12px;width:8px;height:14px;z-index:9998;pointer-events:none;animation:fxFall var(--t) linear both}
@keyframes fxFall{to{transform:translate(var(--dx),110vh) rotate(var(--r))}}
.fx5{animation:fxShake .5s ease-in-out}@keyframes fxShake{0%,100%{transform:none}20%{transform:translate(-3px,1px) rotate(-.5deg)}40%{transform:translate(3px,-1px) rotate(.5deg)}60%{transform:translate(-2px,0)}80%{transform:translate(2px,0)}}
.fxstar{position:absolute;font-size:16px;color:#ffe08a;text-shadow:0 0 8px #ffb02e;pointer-events:none;animation:fxStar 1s ease-out both;z-index:5}
@keyframes fxStar{from{transform:translate(0,0) scale(.4);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(1.1);opacity:0}}
.fxflat{filter:grayscale(.85) brightness(.85);transition:filter .6s}
.hudc{position:relative}
.fxd{position:fixed;transform:translateX(-50%);font:800 11px/1 'Barlow',sans-serif;white-space:nowrap;padding:2px 5px;border-radius:3px;pointer-events:none;animation:fxDelta 2.2s ease-out both;z-index:20}
.fxd.up{color:#0b2a12;background:#5cd07a}.fxd.dn{color:#fff;background:#c0392b}
@keyframes fxDelta{0%{opacity:0;transform:translate(-50%,-4px)}15%{opacity:1;transform:translate(-50%,2px)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,12px)}}
.wc .fxb{position:absolute;right:7px;z-index:3;font:800 10px/1 'Barlow',sans-serif;padding:3px 5px;border-radius:3px;background:rgba(0,0,0,.75);color:#ffcf70;text-shadow:none}
.wc .fxb.st{top:30px}.wc .fxb.md{bottom:46%;font-size:13px;padding:2px 4px}
.wc.af:after,.wc.ah:after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none}
.wc.af:after{background:linear-gradient(90deg,rgba(80,150,255,.28),transparent 22%)}
.wc.ah:after{background:linear-gradient(90deg,rgba(255,70,80,.28),transparent 22%)}
.bzm{display:inline-block;vertical-align:middle;width:64px;height:6px;border-radius:3px;background:#2a2a30;overflow:hidden;margin-left:6px}.bzm i{display:block;height:100%;background:linear-gradient(90deg,#4aa8ff,#ffcf70 55%,#ff5a36);transition:width .8s}
.fxl3{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}
.fxl3 .b{position:relative;padding:5px 12px 5px 10px;background:linear-gradient(90deg,#0b0b0d,#1d1a12);border-left:4px solid var(--gold,#d8b449);clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%);animation:fxL3 .5s cubic-bezier(.2,1,.3,1) both}
.fxl3 .b:nth-child(2){animation-delay:.12s}.fxl3 .b:nth-child(3){animation-delay:.24s}.fxl3 .b:nth-child(4){animation-delay:.36s}
.fxl3 .b b{display:block;font:900 italic 15px/1 'BC',Impact,sans-serif;text-transform:uppercase;color:#fff}.fxl3 .b small{display:block;font:700 10px/1.3 'Barlow',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--gold2,#f6dd8e)}
@keyframes fxL3{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:none}}
.fxtk{position:relative;overflow:hidden;white-space:nowrap;margin:6px -2px 8px;background:#0a0a0c;border-top:1px solid #2a2618;border-bottom:1px solid #2a2618;font:600 12px/24px 'Barlow',sans-serif;color:#cfc6b0}
.fxtk:before{content:"NEWS";position:absolute;left:0;top:0;bottom:0;z-index:2;padding:0 8px;background:var(--red,#e2332b);color:#fff;font:900 italic 12px/24px 'BC',sans-serif;letter-spacing:.1em}
.fxtk span{display:inline-block;padding-left:100%;animation:fxTick var(--t,40s) linear infinite}
@keyframes fxTick{to{transform:translateX(-100%)}}
main.fxr>*{animation:fxSlideR .34s cubic-bezier(.2,.8,.2,1) both!important}main.fxl>*{animation:fxSlideL .34s cubic-bezier(.2,.8,.2,1) both!important}
@keyframes fxSlideR{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}@keyframes fxSlideL{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}
nav.tabs .nvi{position:absolute;top:0;height:3px;background:var(--gold2,#f6dd8e);box-shadow:0 0 10px var(--gold,#d8b449);clip-path:var(--slant);transition:left .32s cubic-bezier(.3,1.2,.4,1),width .32s;z-index:2}
nav.tabs.fxn button.on:before{opacity:0}
.roh-x .phead{background:linear-gradient(135deg,#2a0608,#0b0b0d 60%)!important;border-color:#7a1218!important}
.roh-x .phead .dround{color:#ff4b4b!important;text-shadow:0 0 22px rgba(255,60,60,.35)!important}
.roh-x .phead .dk{color:#ff8a8a!important}
.roh-x .card{border-left:3px solid #b3161d}
.roh-x .chip.on{background:linear-gradient(90deg,#b3161d,#6b0c10)!important;color:#fff!important}
.roh-x .h.small{color:#ff8a8a}
.roh-x .tg.good{background:rgba(179,22,29,.25);color:#ff9a9a}
@media (prefers-reduced-motion: reduce){#fxo *,#fxo,.fx5,.fxl3 .b,.fxtk span,main.fxr>*,main.fxl>*,.fxd,.fxconf,.fxstar,.fxspark{animation:none!important}.fxtk span{padding-left:0}nav.tabs .nvi{transition:none}}
`;
const st=document.createElement('style');st.id='fxcss';st.textContent=css;document.head.appendChild(st);

/* ---------------- overlays (one at a time, queued) ---------------- */
const Q=[];let ON_=false,MUTE=false;
function overlay(html,cls,ms,extra){if(MUTE)return;Q.push({html,cls,ms,extra});if(!ON_)next()}
function next(){const o=Q.shift();if(!o){ON_=false;return}ON_=true;let el=document.getElementById('fxo');if(el)el.remove();el=document.createElement('div');el.id='fxo';el.className=o.cls||'';el.innerHTML=o.html+'<div class="tap">Tap to continue</div>';document.body.appendChild(el);
 if(o.extra&&!RM())try{o.extra(el)}catch(e){}
 let done=false;const close=()=>{if(done)return;done=true;el.classList.add('out');setTimeout(()=>{el.remove();next()},330)};el.onclick=e=>{e.stopPropagation();close()};setTimeout(close,RM()?1800:o.ms||3600)}
window.fxOverlay=overlay;
function sparks(el,n,hot){for(let i=0;i<n;i++){const s=document.createElement('i');s.className='fxspark';s.style.left=(10+Math.random()*80)+'%';s.style.setProperty('--dx',(Math.random()*160-80)+'px');s.style.setProperty('--dy',-(200+Math.random()*420)+'px');s.style.animationDelay=(Math.random()*1.4)+'s';if(hot)s.style.background='#ff8a3b';el.appendChild(s)}}
function confetti(n){if(RM())return;const C=['#f6dd8e','#d8b449','#e2332b','#ffffff','#4aa8ff'];for(let i=0;i<(n||70);i++){const c=document.createElement('i');c.className='fxconf';c.style.left=Math.random()*100+'vw';c.style.background=C[i%C.length];c.style.setProperty('--dx',(Math.random()*120-60)+'px');c.style.setProperty('--r',(Math.random()*900-450)+'deg');c.style.setProperty('--t',(2.2+Math.random()*1.8)+'s');c.style.animationDelay=(Math.random()*.6)+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),5200)}}
window.fxConfetti=confetti;

/* ---------------- 1. title changes ---------------- */
const TRX=/(NEW|INAUGURAL) (.+?) CHAMPIONS?: (.+?)(?: make| makes| —|!|$)/;
function titleFx(note){const m=TRX.exec(note||'');if(!m)return;const first=m[1]==='INAUGURAL';const title=m[2].replace(/\b\w+/g,w=>w.charAt(0)+w.slice(1).toLowerCase());const who=m[3].trim();
 overlay(`<div class="fl"></div><div class="kk">${first?'The first ever':'And new'}</div>${(()=>{const id=window.beltIdByName&&beltIdByName(title);const b=id&&window.beltImg&&beltImg(id);return b?`<img class="fxbi" src="${b}" alt="">`:`<div class="fxplate">${esc(title)}</div>`})()}<div class="nmx">${esc(who)}</div><div class="sub">${esc(title)} Champion${/&/.test(who)?'s':''}</div>`,'',4200,el=>sparks(el,26))}
window.fxTitle=titleFx;
function segTitles(notes){(notes||[]).forEach(n=>{if(TRX.test(n))titleFx(n)})}
/* solo reveal: when a segment's stars land */
if(typeof srDone==='function'){const d0=srDone;srDone=function(it){const was=it&&it.ok;const out=d0.apply(this,arguments);try{if(it&&!was&&!MUTE){hit(it);segTitles(it.s&&it.s.notes)}}catch(e){}return out}}
if(typeof srFinal==='function'){const f0=srFinal;srFinal=function(instant){if(instant)MUTE=true;let out;try{out=f0.apply(this,arguments)}finally{MUTE=false}
 try{const o=SRV&&SRV.o;if(o&&o.hourWin==='p')setTimeout(()=>confetti(80),instant?100:900)}catch(e){}return out}}
/* party-night TV reveal */
if(typeof tvRevealShow==='function'){const t0=tvRevealShow;tvRevealShow=function(stp,instant){const out=t0.apply(this,arguments);try{if(!instant){const el=document.getElementById(stp.id);if(el){const v=+el.dataset.st;if(v>=5)burst(el);else if(v&&v<2)el.classList.add('fxflat');[...el.querySelectorAll('.note')].forEach(n=>{if(TRX.test(n.textContent))titleFx(n.textContent)})}
 if(stp.final&&document.querySelector('#rv .rv-score.win'))setTimeout(()=>confetti(90),600)}}catch(e){}return out}}

/* ---------------- 3. results that hit ---------------- */
function burst(el){if(RM()||!el)return;el.classList.remove('fx5');void el.offsetWidth;el.classList.add('fx5');const pos=getComputedStyle(el).position;if(pos==='static')el.style.position='relative';
 for(let i=0;i<10;i++){const s=document.createElement('span');s.className='fxstar';s.textContent='★';s.style.left='50%';s.style.top='50%';const a=Math.random()*Math.PI*2,r=50+Math.random()*70;s.style.setProperty('--dx',Math.cos(a)*r+'px');s.style.setProperty('--dy',Math.sin(a)*r+'px');s.style.animationDelay=(Math.random()*.2)+'s';el.appendChild(s);setTimeout(()=>s.remove(),1400)}}
function hit(it){const v=it.s&&it.s.stars;if(v==null)return;const id=it.b.brand==='p'?'srh-p':it.b.brand==='ai'?'srh-ai':'srh-x';const el=document.getElementById(id)||document.getElementById(`srw-${it.bi}-${it.si}`);if(!el)return;
 if(v>=5)burst(el);else if(v<2)el.classList.add('fxflat')}

/* ---------------- 2. debuts & call-ups ---------------- */
function entrance(w,kind,buzz){if(!w)return;const hot=(buzz||0)>=9;const big=hot||kind==='star';
 overlay(`<div class="bm a"></div><div class="bm b"></div><div class="fl"></div><div class="kk">${kind==='callup'?'Called up from ROH':kind==='star'?'All Elite':'Debuting'}</div><div class="nmx">${esc(w.name)}</div><div class="sub">${w.g==='M'?"Men's":"Women's"} division · ${STYLE_N[w.st]} · ${w.al==='f'?'Face':'Heel'}${hot?' · 🔥 Hot buzz':''}</div>`,hot?'hot':'',big?4200:3400,el=>sparks(el,big?44:18,hot))}
window.fxEntrance=entrance;
const wrapG=(name,fn)=>{const f0=window[name];if(typeof f0!=='function')return;const w=function(){return fn(f0,this,arguments)};window[name]=w;try{if(name==='sign')sign=w}catch(e){}};
wrapG('callUp',(f0,t,a)=>{const id=a[0];let buzz=0;try{const r=(S.farm&&S.farm.p&&S.farm.p.r)||{};buzz=r[id]?r[id].buzz||0:0}catch(e){}const out=f0.apply(t,a);try{const w=S.w[id];if(w&&w.own==='p')entrance(w,'callup',buzz)}catch(e){}return out});
wrapG('sign',(f0,t,a)=>{const id=a[0];const was=S.w[id]&&S.w[id].own;const out=f0.apply(t,a);try{const w=S.w[id];if(w&&w.own==='p'&&was!=='p')entrance(w,w.pop>=70?'star':'debut')}catch(e){}return out});
wrapG('farmSign',(f0,t,a)=>{const [reg,i,dest]=a;let w=null;try{const s=S.scout||{};w=(reg==='indie'?s.l:s[reg]||[])[i]}catch(e){}const out=f0.apply(t,a);try{if(dest==='aew'&&w){const W=Object.values(S.w).find(x=>x.name===w.name&&x.own==='p');if(W)entrance(W,'debut')}}catch(e){}return out});

/* ---------------- 4. live numbers ---------------- */
let LAST=null;
function fmtF(v){return typeof fmtFans==='function'?fmtFans(v):String(v)}
function tween(el,from,to,fmt){if(RM()||!el){if(el)el.textContent=fmt(to);return}const t0=performance.now(),D=900;const step=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
function chip(host,d,txt){if(!host||!d)return;const r=host.getBoundingClientRect();const c=document.createElement('span');c.className='fxd '+(d>0?'up':'dn');c.style.left=(r.left+r.width/2)+'px';c.style.top=(r.bottom+2)+'px';c.textContent=(d>0?'+':'−')+txt;document.body.appendChild(c);setTimeout(()=>c.remove(),2300)}
function numbers(){if(!S||!S.fans||!S.money||!(S.phase==='season'||S.phase==='over')){LAST=null;return}const now={f:S.fans.p,m:S.money.p,k:(S.gm||'')+'|'+S.season};
 if(LAST&&LAST.k===now.k){const h=document.querySelectorAll('header .hud .hudc');const fe=h[1]&&h[1].querySelector('b'),me=h[2]&&h[2].querySelector('b');
  if(now.f!==LAST.f&&fe){tween(fe,LAST.f,now.f,fmtF);chip(h[1],now.f-LAST.f,fmtF(Math.abs(now.f-LAST.f)))}
  if(now.m!==LAST.m&&me){tween(me,LAST.m,now.m,money);chip(h[2],now.m-LAST.m,money(Math.abs(now.m-LAST.m)))}}
 LAST=now;
 /* hype bars fill from where they were */
 document.querySelectorAll('[data-hyv]').forEach(b=>{const v=+b.dataset.hyv;const p=window.__HYP;if(p!=null&&p!==v&&!RM()){b.style.transition='none';b.style.width=p+'%';void b.offsetWidth;b.style.transition='width .9s cubic-bezier(.2,.8,.2,1)';b.style.width=v+'%'}window.__HYP=v})}

/* ---------------- 5. wrestler cards ---------------- */
if(typeof wcard==='function'){const w0=wcard;wcard=function(w,o){let h=w0.apply(this,arguments);try{if(!w)return h;const inS=S&&(S.phase==='season'||S.phase==='over');let add='';
 if(inS&&(w.strk||0)>=3)add+=`<span class="fxb st">🔥${w.strk}</span>`;
 if(inS&&w.own==='p'&&w.mor<50&&typeof moodWord==='function')add+=`<span class="fxb md" title="${esc(moodWord(w.mor)[1])}">${moodWord(w.mor)[0]}</span>`;
 h=h.replace('<button class="wc ','<button class="wc '+(w.al==='f'?'af ':'ah '));
 if(add){const i=h.indexOf('<div class="nm">');if(i>0)h=h.slice(0,i)+add+h.slice(i)}}catch(e){}return h}}
/* ROH buzz meter on farm cards */
if(typeof window.farmCard==='function'){const f0=window.farmCard;window.farmCard=function(w){let h=f0.apply(this,arguments);try{const b=clamp((w.buzz||0)/15*100,0,100);h=h.replace(/(Call-up buzz [^<]*<b>[^<]*<\/b>)/,`$1<span class="bzm"><i style="width:${b}%"></i></span>`)}catch(e){}return h}}

/* ---------------- 6. lower-thirds & ticker on live segments ---------------- */
function tickerHtml(){const l=(S.news||[]).slice(-8).reverse().map(n=>n.t).filter(Boolean);if(!l.length)return '';const txt=l.map(esc).join('  ✦  ');return `<div class="fxtk"><span style="--t:${Math.max(20,Math.round(txt.length/7))}s">${txt}</span></div>`}
if(typeof liveHd==='function'){const l0=liveHd;liveHd=function(show,lab,title,sides){let h=l0.apply(this,arguments);try{const ss=(sides||[]).map(sd=>(sd||[]).filter(Boolean)).filter(sd=>sd.length);
 const bars=ss.slice(0,4).map(sd=>{const w=sd[0];const tl=sd.map(x=>titlesOf(x.id)[0]).find(Boolean);const c=w.cr||{};const info=tl?`${tl.n} Champion${sd.length>1?'s':''}`:sd.length>1?(S.teams.find(t=>sd.every(x=>t.m.includes(x.id)))||{}).n||`${sd.length}-person team`:c.m?`${c.w}–${c.l} · ${STYLE_N[w.st]}`:STYLE_N[w.st];
  return `<div class="b"><b>${esc(sd.length>1?sideName(sd.map(x=>x.id)):w.name)}</b><small>${esc(info)}</small></div>`}).join('');
 h+=(bars?`<div class="fxl3">${bars}</div>`:'')+tickerHtml()}catch(e){}return h}}

/* ---------------- 7. smoother navigation ---------------- */
const ORDER=['home','book','roster','titles','office','menu'];let DIR=null,NAVL=null;
if(typeof go==='function'){const g0=go;go=function(t){const a=ORDER.indexOf(tab),b=ORDER.indexOf(t);DIR=a>=0&&b>=0&&a!==b?(b>a?'fxr':'fxl'):null;return g0.apply(this,arguments)}}
function navFx(){const n=document.querySelector('nav.tabs');if(!n)return;const on=n.querySelector('button.on');if(!on){NAVL=null;return}n.classList.add('fxn');let i=n.querySelector('.nvi');if(!i){i=document.createElement('i');i.className='nvi';n.appendChild(i)}
 const L=on.offsetLeft+on.offsetWidth*.22,W=on.offsetWidth*.56;if(NAVL&&!RM()){i.style.transition='none';i.style.left=NAVL.l+'px';i.style.width=NAVL.w+'px';void i.offsetWidth;i.style.transition=''}i.style.left=L+'px';i.style.width=W+'px';NAVL={l:L,w:W}}
if(typeof render==='function'){const r0=render;render=function(){const d=DIR;DIR=null;const out=r0.apply(this,arguments);try{const m=document.querySelector('main');if(m&&d&&!RM()){m.classList.remove('enter');m.classList.add(d)}navFx();numbers()}catch(e){}return out}}

/* ---------------- 8. ROH identity ---------------- */
if(typeof window.farmView==='function'){const v0=window.farmView;window.farmView=function(){return `<div class="roh-x">${v0.apply(this,arguments)}</div>`}}
})();
