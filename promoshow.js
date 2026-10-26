/* Tony Khan Simulator — the promo showdown (v246).
   Live promos play as a face-off, one line at a time, like a courtroom game. The camera whips between the two
   wrestlers (their real card photos on the card background), whoever is talking gets a name tab on the dialogue box,
   and you tap to advance. Actions show in parentheses, the room and the crowd as gold camera notes. When it's your
   turn the call menu takes over the box. Big moments get a shout across the stage — TAKE THAT! when a big-swing call
   lands, HOLD IT! when you cut someone off, LISTEN UP! when they wind up a big line, MIC DROP! — and every call is
   stamped It lands / It misses with the crowd's reaction.

   How a line is split (bubbleParse): quoted words are a line for whoever is speaking; narration before or between
   quotes is stage direction for whoever its first sentence names (the name is dropped — the tab shows who it is);
   a run that doesn't start with a wrestler's name is a camera note; narration after the last quote is the reaction.
   Quoted words inside a sentence ("the crowd chants "Where are they?"") stay narration unless a wrestler is saying
   them ("MJF grabs the mic and says "Well —""). Every promo line was swept through this in v245.

   Everything else — the engine, the calls, scoring, twists, gorilla pitches, the result screen — is unchanged; this
   file only changes how a live promo is shown. Party-night TV gets each line as it appears. Loaded after exchange.js. */
'use strict';
(function(){
/* ---------- splitting a line into what's said and what's done ---------- */
const SIDELESS=/^(The|Half|Nobody|Everyone|Everybody|Somebody|Someone|Twenty|Ten|Fans|Security|Officials|Referees|It|That|This|A chant|A chorus)\b/;
const SAYS=/,?\s*(?:(?:and|then)\s+)?(?:says|say|said|yells|yelling|screams|whispers|asks|goes)[,:]?$/;
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function bubbleParse(text,owner,names,cam){
 const sides=Object.keys(names).filter(k=>names[k]).sort((x,y)=>names[y].length-names[x].length);
 const who=t=>{for(const s of sides){if(new RegExp('^'+reEsc(names[s])+"(?:'s)?\\b").test(t))return s}return null};
 const strip=(t,s)=>new RegExp('^'+reEsc(names[s])+"'s\\b").test(t)?t:t.replace(new RegExp('^'+reEsc(names[s])+'\\s+'),'');
 const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
 const parts=[];const re=/"([^"]+)"/g;let last=0,m;
 while((m=re.exec(text))){const q=m[1].trim();if(/^[a-z]/.test(q))continue;
  const pre=text.slice(last,m.index).trim();const before=text.slice(0,m.index).trim();let pre2=pre;
  if(before&&/[A-Za-z,]$/.test(before)){const sent=before.split(/(?<=[.!?…])\s+/).pop();if(!(who(sent)&&SAYS.test(sent)))continue;pre2=pre.replace(SAYS,'').trim()}
  if(pre2)parts.push({n:pre2});parts.push({q});last=re.lastIndex}
 const tail=text.slice(last).trim();if(tail)parts.push({n:tail});
 if(!parts.some(p=>p.q)){const s=cam?null:who(text);return {beats:s?[{side:s,only:text}]:[{cam:text}],react:''}}
 const lastQ=parts.map(p=>!!p.q).lastIndexOf(true);let speaker=owner;const beats=[];let react='';
 parts.forEach((p,i)=>{
  if(p.q){beats.push({side:speaker,q:p.q});return}
  if(i>lastQ&&/^[a-z]/.test(p.n)){const sn=p.n.split(/(?<=[.!?…])\s+/);beats.push({side:speaker,act:sn[0].replace(/[.]$/,'')});if(sn[1])react=sn[1];return}
  if(i>lastQ){react=p.n.split(/(?<=[.!?…])\s+/)[0];return}
  let g=null;const push=()=>{if(!g)return;const t=g.t.join(' ').replace(/[.:]$/,'');beats.push(g.side?{side:g.side,act:t}:{cam:t});if(g.side)speaker=g.side};
  p.n.split(/(?<=[.!?…])\s+/).forEach(s=>{const w=who(s);
   if(w&&(!g||g.side!==w)){push();g={side:w,t:[strip(s,w)]}}
   else if(w)g.t.push(cap(strip(s,w)));
   else if(!g)g={side:SIDELESS.test(s)||!parts.slice(0,i).some(x=>x.q)?null:speaker,t:[s]};
   else g.t.push(s)});
  push()});
 return {beats,react}}

/* ---------- pages ---------- */
const reduce=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const people=ctx=>({a:ctx.A,b:ctx.B,x:ctx.X,h:ctx.H});
function namesOf(ctx){const n={};Object.entries(people(ctx)).forEach(([k,w])=>{if(w&&w.name)n[k]=w.name});return n}
/* long lines break into pages the box can hold */
function chunks(t){const out=[];let cur='';t.split(/(?<=[.!?…])\s+/).forEach(s=>{if(cur&&(cur+' '+s).length>130){out.push(cur);cur=s}else cur=cur?cur+' '+s:s});if(cur)out.push(cur);return out}
function pagesOf(text,owner,ctx,cam,res){const {beats,react}=bubbleParse(fill(text,ctx),owner,namesOf(ctx),cam);const out=[];
 beats.forEach(b=>{if(b.cam)chunks(b.cam).forEach(t=>out.push({cam:t}));
  else if(b.only)chunks(b.only).forEach(t=>out.push({side:b.side,cam:t}));
  else if(b.act!=null)out.push({side:b.side,act:b.act});
  else chunks(b.q).forEach(t=>out.push({side:b.side,q:t}))});
 if(res)out.push({res:react||(res.ok?'The crowd is with it.':'It falls flat.'),ok:res.ok,stamp:1});
 else if(react)out.push({cam:react});
 return out}

/* ---------- the stage ---------- */
const short=w=>{const n=String(w.name||'');return n.length>16?n.split(' ').slice(-1)[0]:n};
function corner(w,k){if(!w)return '';const sub=typeof lvSub==='function'?lvSub([w]):'';
 return `<div class="sdc c${k}"><div class="sdph">${portrait(w)}</div><div class="sdpl ${w.al==='f'?'fc':'hl'}"><b>${esc(w.name)}</b>${sub?`<span>${esc(sub)}</span>`:''}</div></div>`}
function stageHtml(){const {ctx}=PS;const cam=PS.cam||'a';const two=!!ctx.B;
 return `<div class="sd${two?'':' solo'}" id="sd" onclick="sdTap()"><div class="sdpan${cam==='b'&&two?' at-b':''}" id="sdpan">${corner(ctx.A,'a')}${two?corner(ctx.B,'b'):''}</div>
 <div class="sdspeed" id="sdspeed"></div><div class="sdflash" id="sdflash"></div>
 <div class="sdcut" id="sdcut"></div><div class="sdtac" id="sdtac"></div><div class="sdfx" id="sdfx"></div></div>`}
function header(){const {scene,ctx}=PS;const lab=scene&&scene.ex&&typeof exLabel==='function'?exLabel(scene):PS.beat==='r'?'The response':PS.beat?'The twist':'On air';
 return liveHd(PS.live&&typeof LQ!=='undefined'&&LQ?LQ.show:'',`Promo · ${lab}`,esc(PT[PS.p.type].n),[],PS.live?'● Live':'Preview')}
/* an empty box holds the space while the stage plays something, so the sheet doesn't jump */
const HOLD='<div class="sdbox k-cam"><div class="sdsay"></div></div><div class="sdhint">&nbsp;</div>';
function frame(low){openModal(`<div class="sdw">${header()}${stageHtml()}<div id="sdlow">${low||HOLD}</div></div>`,true)}
function feed(){try{if(PS&&PS.live&&typeof partyFeed==='function'){const b=document.querySelector('#modal .sbody');if(b)partyFeed(b.innerHTML)}}catch(e){}}
const sleep=ms=>new Promise(r=>setTimeout(r,reduce()?Math.min(ms,60):ms));
async function panTo(k){if(!PS)return;const ctx=PS.ctx;if(k!=='a'&&k!=='b')return;if(k==='b'&&!ctx.B)return;if(PS.cam===k)return;PS.cam=k;
 const p=document.getElementById('sdpan'),sp=document.getElementById('sdspeed');if(!p)return;
 if(sp)sp.classList.add('on');p.classList.toggle('at-b',k==='b');await sleep(320);if(sp)sp.classList.remove('on')}
function cutIn(k){const el=document.getElementById('sdcut');if(!el)return;const w=people(PS.ctx)[k];
 el.innerHTML=(k==='x'||k==='h')&&w?`<div class="sdci"><div class="sdph">${portrait(w)}</div><b>${esc(short(w))}</b></div>`:''}
async function shout(t,kind){const fx=document.getElementById('sdfx'),sd=document.getElementById('sd'),fl=document.getElementById('sdflash');if(!fx)return;
 fx.innerHTML=`<div class="sdshout ${kind||''}"><span>${esc(t)}</span></div>`;feed();
 if(fl){fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on')}
 if(sd&&!reduce()){sd.classList.remove('shake');void sd.offsetWidth;sd.classList.add('shake')}
 await sleep(950);fx.innerHTML=''}

/* ---------- one page in the box ---------- */
let TYPE=null;
function boxHtml(pg){const ctx=PS.ctx;const w=pg.side?people(ctx)[pg.side]:null;
 const kind=pg.q!=null?'q':pg.act!=null?'act':pg.stamp?'res':'cam';
 const text=pg.q!=null?pg.q:pg.act!=null?`(${pg.act})`:pg.cam||pg.res||'';
 const tab=w&&(kind==='q'||kind==='act')?`<div class="sdtab ${pg.side==='a'?'mine':pg.side==='b'?'them':'other'}${pg.side==='b'?' r':''}">${esc(w.name)}</div>`:'';
 return `<div class="sdbox k-${kind}" id="sdbox" onclick="sdTap()">${tab}<div class="sdsay" id="sdsay" data-t="${esc(text)}">${esc(text)}</div><span class="sdnx" id="sdnx">▼</span></div><div class="sdhint">Tap to continue</div>`}
async function showPage(){const pg=PS.q[PS.qi];if(!pg)return;
 const low=document.getElementById('sdlow');if(!low){frame('');return showPage()}
 if(pg.side==='a'||pg.side==='b')await panTo(pg.side);cutIn(pg.side);
 const fx=document.getElementById('sdfx');
 if(pg.stamp&&fx)fx.innerHTML=`<div class="sdstamp ${pg.ok?'ok':'no'}">${pg.ok?'It lands':'It misses'}</div>`;
 low.innerHTML=boxHtml(pg);feed();
 const spr=pg.side&&document.querySelector(`#sd .c${pg.side} .sdph`);if(spr){spr.classList.remove('talk','hit');void spr.offsetWidth;spr.classList.add(pg.q!=null?'talk':'hit')}
 const el=document.getElementById('sdsay');if(!el||reduce())return done();
 const t=el.dataset.t;let i=0;el.textContent='';
 const iv=setInterval(()=>{i+=2;el.textContent=t.slice(0,i);if(i>=t.length)fin()},20);
 const fin=()=>{clearInterval(iv);el.textContent=t;TYPE=null;done()};TYPE={fin};
 function done(){const nx=document.getElementById('sdnx');if(nx)nx.classList.add('on')}}
function sdTap(){if(!PS||!PS.q)return;if(TYPE){TYPE.fin();return}
 const fx=document.getElementById('sdfx');if(fx&&PS.q[PS.qi]&&PS.q[PS.qi].stamp)fx.innerHTML='';
 PS.qi++;if(PS.qi<PS.q.length)return showPage();
 const after=PS.after;PS.q=null;PS.after=null;if(after)after();else renderPS()}
document.addEventListener('keydown',e=>{if(!PS||!PS.q||(e.key!==' '&&e.key!=='Enter'))return;if(e.target&&e.target.closest&&e.target.closest('button,input,select,textarea'))return;if(!document.getElementById('sdbox'))return;e.preventDefault();sdTap()});
function queue(pages,after){if(!pages.length){if(after)after();return}PS.q=pages;PS.qi=0;PS.after=after||null;showPage()}

/* ---------- what your wrestler actually says ----------
   v248: the menu shows tactics ("Go personal"), so the words behind a call are only in how it went. When that
   doesn't show your wrestler at all — most misses ("Frazer laughs. "Name one."") — the reaction would answer
   something nobody heard. So your wrestler first delivers the call: the line written for it (from its landed
   version), else a line in the call's own label, else the attempt itself ("goes to jump them from behind"). */
const lead=(t,A)=>{t=t.replace(/^\p{Extended_Pictographic}\S*\s*/u,'').split(/:\s/)[0].trim().replace(/[.!]$/,'');return A&&t.startsWith(A.name)?t:t.charAt(0).toLowerCase()+t.slice(1)};
function attempt(c,ok,ctx,shown){if(c.wait||c.drop||c.close)return [];
 const N=namesOf(ctx),A=ctx.A;const parse=t=>bubbleParse(t,'a',N).beats;
 if(parse(shown).some(b=>b.side==='a'))return [];
 /* the call as written, from its landed version: the lines up to their first spoken line */
 for(const t of [c.ok,c.g].filter(Boolean).map(t=>fill(t,ctx)).filter(t=>t!==shown)){const bs=parse(t);const qi=bs.findIndex(b=>b.side==='a'&&b.q!=null);if(qi<0)continue;
  const sl=bs.slice(0,qi+1).filter(b=>b.side==='a'&&(b.q!=null||b.act!=null));
  /* on a miss, a long lead-in ("swings the belt flush…") already describes it working — use the call itself instead */
  if(!ok&&sl.some(b=>b.act!=null&&b.act.split(/\s+/).length>4))break;
  return sl}
 if(ok)return [];
 const lab=fill(c.lt||c.t||'',ctx);const m=lab.match(/"([^"]+)"/);
 if(m&&!/^[a-z]/.test(m[1]))return [{side:'a',q:m[1].trim()}];
 const l=lead(lab,A);if(!l||/^(both|they|the|a|an|nobody|everyone|g[a-z]\d)\b/i.test(l)||l.startsWith(A.name))return [];
 return [{side:'a',act:'goes to '+l}]}
const beatPages=bs=>bs.flatMap(b=>b.q!=null?chunks(b.q).map(t=>({side:'a',q:t})):[{side:'a',act:b.act}]);
const beatText=(bs,A)=>bs.map(b=>b.q!=null?`"${b.q}"`:`${A.name} ${b.act}.`).join(' ');

/* ---------- the call menu ---------- */
function menuHtml(){const {scene,ctx}=PS;
 const bar=scene.ex&&typeof exCall==='function'?callBar(...exCall(scene,ctx)):callBar(scene.rt?'Fire back':scene.hj?'👥 The crowd has a mind of its own':'🎧 Your call',scene.rt?`What does ${esc(ctx.A.name)} say back?`:`What does ${esc(ctx.A.name)} do?`);
 return `<div class="sdmenu">${bar}`+scene.ch.map((c,ci)=>`<button class="choice${c.drop?' mdrop':''}" onclick="psChoose(${ci})"><span class="key"><span>${'ABCDE'[ci]}</span></span><div>${esc(fill(c.t,ctx))}</div><div class="muted tiny">${c.al?`<span class="${c.al==='f'?'face':'heel'}">${c.al==='f'?'😇 Face move':'😈 Heel move'}</span> · `:''}${c.always?(c.close?'⏭️ Ends it here':'✅ Guaranteed'):`${STAT_ICON[c.wait?'luck':c.s]} · ${oddsWord(chance(c,ctx))} · ${swingWord(swingOf(chance(c,ctx)).w)}`}${c.tip?` · ${esc(fill(c.tip,ctx))}`:''}${c.turn?' · 🔄 turns them':''}${c.ch?' · 🎯 sets up a match':''}${c.stp?' · adds a stipulation':''}</div></button>`).join('')+'</div>'}

/* ---------- the flow ---------- */
const _render=renderPS,_choose=psChoose,_next=psNext;
renderPS=function(){if(!PS)return;const {scene,ctx}=PS;
 /* the result screen and gorilla pitches stay as they were */
 if(PS.done||(PS.beat===1&&!PS.gor&&scene&&scene.x&&ctx.X))return _render();
 if(PS.q)return frame(''),showPage();
 if(PS.shown!==scene){PS.shown=scene;
  const owner=PS.beat==='r'?'b':'a',cam=PS.beat===0||PS.beat===1;
  frame('');
  const pre=scene.ex==='time'?()=>{panTo('b').then(()=>shout('Listen up!','blue'))}:null;
  if(pre)pre();
  return setTimeout(()=>queue(pagesOf(scene.text,owner,ctx,cam),()=>renderPS()),pre?1300:0)}
 if((PS.beat===1||PS.beat==='r'&&scene.last)&&!PS.done&&!scene._md&&typeof mdAdd==='function'){scene._md=1;mdAdd(PS)}
 frame(menuHtml())};
psChoose=function(ci){if(!PS||PS.done||PS.q)return;const c=PS.scene.ch[ci];if(!c)return;
 if(c.close&&typeof exClose==='function'){if(exClose(PS))renderPS();return}
 pickFlash(async p=>{if(!PS||PS.done||PS.q)return;PS.pick=p;const ctx=PS.ctx;
  const pr=chance(c,ctx);const out=roll(c,ctx,PS.st);
  frame('');const tac=document.getElementById('sdtac');
  if(tac&&PS.scene.ex){tac.textContent='🎧 '+fill(c.t,ctx).replace(/^\p{Extended_Pictographic}\S*\s/u,'');tac.classList.add('on')}
  await panTo('a');
  if(c.drop)await shout('Mic drop!','gold');else if(c.cut)await shout('Hold it!');else if(out.success&&swingOf(pr).w>=.55)await shout('Take that!');
  const pre=c.drop?[]:attempt(c,out.success,ctx,out.text);
  if(pre.length){const L=PS.st.log;if(L&&L.length)L[L.length-1]=fill(c.t,ctx)+' — '+beatText(pre,ctx.A)+' '+out.text}
  queue(beatPages(pre).concat(pagesOf(out.text,'a',ctx,false,{ok:out.success})),()=>{PS.out=out;_next()})})};

(function(){const c=document.createElement('style');c.textContent=`
.sdw .lvhd{margin-bottom:0}
.sd{position:relative;aspect-ratio:4/3;width:100%;overflow:hidden;margin:-10px 0 0;background:#0c0c0e url(card-bg.jpg) center/cover;clip-path:var(--cut);cursor:pointer;user-select:none;-webkit-user-select:none}
.sdpan{position:absolute;inset:0;width:200%;display:flex;transition:transform .32s cubic-bezier(.6,0,.3,1)}
.sd.solo .sdpan{width:100%}
.sdpan.at-b{transform:translateX(-50%)}
.sdc{position:relative;flex:1;overflow:hidden;background:radial-gradient(70% 60% at 50% 30%,rgba(255,226,160,.16),transparent 70%),radial-gradient(120% 60% at 50% 125%,rgba(226,51,43,.55),rgba(90,16,8,.25) 45%,transparent 75%)}
.sdph{position:absolute;left:50%;bottom:0;height:94%;aspect-ratio:3/4;max-width:100%;transform:translateX(-50%);background:#0c0c0e url(card-bg.jpg) center/cover;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%);box-shadow:0 0 0 2px rgba(216,180,73,.5)}
.sdph>*{width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block}
.sdph.talk{animation:sdbob .3s ease-out}.sdph.hit{animation:sdhit .45s ease-out}
@keyframes sdbob{0%{transform:translateX(-50%) translateY(5px)}100%{transform:translateX(-50%)}}
@keyframes sdhit{0%,100%{transform:translateX(-50%)}20%{transform:translateX(-54%)}45%{transform:translateX(-47%)}70%{transform:translateX(-51%)}}
.sdpl{position:absolute;left:10px;bottom:10px;max-width:62%;display:flex;flex-direction:column;gap:1px;padding:5px 12px 6px 10px;background:#09090b;border-left:4px solid var(--gold);clip-path:var(--sl)}
.sdpl.fc{border-color:var(--face)}.sdpl.hl{border-color:var(--heel)}
.sdpl b{font:900 italic 19px/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sdpl span{font-size:11px;font-weight:700;color:var(--gold2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sdc.cb .sdpl{left:auto;right:10px;border-left:0;border-right:4px solid var(--gold);align-items:flex-end;padding:5px 10px 6px 12px}
.sdc.cb .sdpl.fc{border-color:var(--face)}.sdc.cb .sdpl.hl{border-color:var(--heel)}
.sdspeed{position:absolute;inset:0;pointer-events:none;opacity:0;background:repeating-linear-gradient(180deg,transparent 0 9px,rgba(255,240,200,.5) 9px 10px,transparent 10px 23px);transition:opacity .1s}
.sdspeed.on{opacity:.85}
.sdflash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.sdflash.on{animation:sdfl .3s}@keyframes sdfl{0%{opacity:.8}100%{opacity:0}}
.sd.shake{animation:sdshk .35s}@keyframes sdshk{0%,100%{transform:none}25%{transform:translate(-5px,2px)}50%{transform:translate(4px,-3px)}75%{transform:translate(-3px,1px)}}
.sdhud{position:absolute;top:8px;left:10px;right:10px;z-index:3;pointer-events:none}
.sdhud .exbar{margin:0;padding:4px 8px;background:rgba(9,9,11,.78);clip-path:var(--sl)}
.sdhud .exlab{display:none}
.sdtac{position:absolute;top:44px;left:50%;transform:translateX(-50%);z-index:3;padding:3px 12px;background:var(--gold);color:#16120a;font:900 italic 13px 'BC','Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;clip-path:var(--sl);opacity:0;transition:opacity .2s;pointer-events:none}
.sdtac.on{opacity:1}
.sdcut{position:absolute;top:44px;right:10px;z-index:3;pointer-events:none}
.sdci{width:84px;display:grid;gap:3px;animation:sdin .3s ease-out}
.sdci .sdph{position:relative;left:auto;bottom:auto;transform:none;height:auto;width:100%}
.sdci b{font:900 italic 13px 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;background:#09090b;color:#fff;padding:2px 6px;clip-path:var(--sl);text-align:center}
@keyframes sdin{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}
.sdfx{position:absolute;inset:0;z-index:4;pointer-events:none;display:grid;place-items:center}
.sdshout{width:112%;display:flex;justify-content:center;padding:14px 0 16px;background:var(--red);transform:rotate(-6deg);box-shadow:0 6px 0 rgba(0,0,0,.5);animation:sdsh .6s cubic-bezier(.2,1.5,.4,1) both}
.sdshout.gold{background:var(--gold)}.sdshout.blue{background:#20365f}
.sdshout span{font:900 italic clamp(46px,14vw,84px)/.9 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.01em;background:linear-gradient(180deg,#fff6d6,var(--gold2) 40%,var(--gold) 70%,var(--gold3));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 rgba(0,0,0,.7))}
.sdshout.gold span{background:none;color:#16120a;filter:none}
@keyframes sdsh{0%{transform:translateX(-110%) rotate(-6deg)}100%{transform:rotate(-6deg)}}
.sdstamp{padding:4px 18px 6px;font:900 italic clamp(30px,9vw,48px)/1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;color:#09090b;clip-path:var(--sl);transform:rotate(-5deg);animation:sdst .35s cubic-bezier(.2,1.6,.4,1) both}
.sdstamp.ok{background:var(--good)}.sdstamp.no{background:var(--bad)}
@keyframes sdst{0%{transform:rotate(-5deg) scale(2);opacity:0}100%{transform:rotate(-5deg) scale(1);opacity:1}}
.sdbox{position:relative;margin:14px 0 0;min-height:118px;padding:20px 16px 22px;background:linear-gradient(90deg,rgba(216,180,73,.08),transparent 60%),#15161a;border:1px solid #3a3222;border-top:3px solid var(--gold);clip-path:var(--cut);cursor:pointer}
.sdtab{position:absolute;top:-1px;left:12px;max-width:78%;padding:3px 14px 4px;font:900 italic 16px/1.1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;clip-path:var(--sl)}
.sdtab.mine{background:var(--gold);color:#16120a}.sdtab.them{background:#f3efe6;color:#09090b}.sdtab.other{background:var(--red);color:#fff}
.sdtab.r{left:auto;right:12px}
.sdbox:has(.sdtab) .sdsay{margin-top:6px}
.sdsay{font-size:18px;line-height:1.45;font-weight:600;color:var(--text);overflow-wrap:anywhere;min-height:2.9em}
.sdbox.k-act .sdsay{font-style:italic;font-weight:500;color:#b8c9e8;font-size:16px}
.sdbox.k-cam .sdsay{font-style:italic;font-weight:500;color:var(--gold2);font-size:16px;text-align:center}
.sdbox.k-res .sdsay{font-style:italic;font-weight:500;color:var(--mut);font-size:16px;text-align:center}
.sdnx{position:absolute;right:16px;bottom:6px;color:var(--gold);font-size:13px;opacity:0}
.sdnx.on{opacity:1;animation:sdnx .8s infinite alternate}@keyframes sdnx{to{transform:translateY(3px)}}
.sdhint{margin:6px 0 0;text-align:center;font-size:12px;color:var(--mut)}
.sdmenu{margin-top:14px}
@media (prefers-reduced-motion:reduce){.sdpan{transition:none}.sd *,.sd{animation:none!important}}
body.tv .sdhint{display:none}
`;document.head.appendChild(c)})();

Object.assign(window,{bubbleParse,sdTap,promoPages:pagesOf,promoAttempt:attempt});
})();
