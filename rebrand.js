/* Tony Khan Simulator — rebrands (v341).
   Calling someone up from ROH, or signing a prospect to ROH, is a fresh start — so before it happens you get a chance to
   repackage them: a new ring name (yours, or one of a few ideas) and which side of the line they start on. Keeping
   everything as it is stays one tap.
   Wraps callUp(id), farmSign(reg,i,'roh'), tapeAct(i,'roh') and followAct(i,'roh'). The new look is put on the wrestler
   before the original runs (so the call-up entrance shows the new name) and taken back off if the original refuses
   (no money, roster full…), so nothing changes on a failed signing. The old name is kept as w.aka for the history.
   Loaded after fx.js, sfx.js and inbox.js so it wraps the finished versions. */
'use strict';
(function(){
const MONO=['Vortex','Havoc','Onyx','Ember','Riot','Solace','Nova','Brick','Zenith','Wraith','Saint','Rook','Blaze','Mercy','Titan','Venom','Halo','Static','Jinx','Echo','Ravage','Lynx','Ash','Fury','Ghost','Spark','Kaos','Sable','Dagger','Valor'];
const NICK=['"The Natural"','"Big Time"','"The Spark"','"Hollywood"','"Wildcat"','"The Sniper"','"Sweet"','"The Phenom"','"Lights Out"','"The Prodigy"'];
/* v350: every name in the game, not only signed wrestlers — both ROH rosters, the scouting boards, tapes and the watchlist */
function allNames(){const l=Object.values(S.w||{});try{Object.values(S.farm||{}).forEach(f=>l.push(...Object.values((f&&f.r)||{})))}catch(e){}
 try{const s=S.scout||{};Object.values(s).forEach(v=>{if(Array.isArray(v))l.push(...v)})}catch(e){}
 try{(S.tapes||[]).concat(S.follow||[]).forEach(x=>{if(x&&x.w)l.push(x.w)})}catch(e){}return l}
const used=(n,self)=>allNames().some(x=>x&&x!==self&&x.name&&x.name.toLowerCase()===n.toLowerCase());
function ideas(w){const out=[];const add=n=>{if(n&&n!==w.name&&!used(n)&&!out.includes(n))out.push(n)};
 const F=w.g==='M'?FIRST_M:FIRST_F;const last=w.name.split(' ').slice(-1)[0];
 for(let i=0;i<12&&out.length<1;i++)add(pick(MONO));
 for(let i=0;i<12&&out.length<2;i++)add(pick(F)+' '+pick(LAST));
 for(let i=0;i<12&&out.length<3;i++)add(pick(NICK)+' '+(w.name.split(' ').length>1?w.name.split(' ')[0]:last));
 return out}
let RB=null;   /* {w, go:fn, verb, n, al, ideas} */
const clean=v=>String(v||'').replace(/[<>"`]/g,'').replace(/\s+/g,' ').trim().slice(0,28);
function sheet(){const r=RB;if(!r)return;const w=r.w;const nm=clean(r.n)||w.name;const ch=nm!==w.name||r.al!==w.al;
 openModal(`<div class="h mhd mt">${r.i} ${esc(r.head)}</div><div class="rbc">${card(w,nm,r.al)}</div>
 <p class="muted tiny" style="margin:6px 0 10px">Change the name or the character, or keep them as they are.</p>
 <label>Ring name</label><input id="rbName" maxlength="28" value="${esc(nm)}" oninput="rbType(this.value)">
 <div class="chips" style="margin-top:6px;flex-wrap:wrap"><button type="button" class="chip ${nm===w.name?'on':''}" onclick="rbPick(-1)">${esc(w.name)}</button>${r.ideas.map((n,i)=>`<button type="button" class="chip ${nm===n?'on':''}" onclick="rbPick(${i})">${esc(n)}</button>`).join('')}<button type="button" class="chip" onclick="rbMore()">↻ More</button></div>
 <label style="margin-top:12px;display:block">Character</label><div class="chips"><button type="button" class="chip ${r.al==='f'?'on':''}" onclick="rbAl('f')">Face</button><button type="button" class="chip ${r.al==='h'?'on':''}" onclick="rbAl('h')">Heel</button></div>
 <button class="btn" id="rbGo" style="margin-top:14px" onclick="rbGo()">${esc(r.verb)}${ch?` as ${esc(nm)}${r.al!==w.al?` (${r.al==='f'?'face':'heel'})`:''}`:''}</button>
 <button class="btn ghost" onclick="rbCancel()">Not now</button>`)}
/* their wrestler card, wearing the new look as you pick it */
function card(w,nm,al){if(typeof tcCard!=='function')return face(w);let h='';try{h=tcCard(Object.assign({},w,{name:nm,al}),{cls:'tcsm',noWear:true})}catch(e){return face(w)}return h}
function ask(w,o){if(typeof mpLocked==='function'&&mpLocked())return false;RB=Object.assign({w,n:w.name,al:w.al,ideas:ideas(w)},o);sheet();return true}
window.rbType=function(v){if(!RB)return;RB.n=v;const b=document.getElementById('rbGo');const w=RB.w;const nm=clean(v)||w.name;
 if(b)b.textContent=RB.verb+(nm!==w.name||RB.al!==w.al?` as ${nm}${RB.al!==w.al?` (${RB.al==='f'?'face':'heel'})`:''}`:'');
 const cn=document.querySelector('#modal .rbc .tcn');if(cn)cn.textContent=nm;
 document.querySelectorAll('#modal .chips .chip').forEach(c=>{if(!/Face|Heel|More/.test(c.textContent))c.classList.toggle('on',c.textContent===nm)})};
window.rbPick=function(i){if(!RB)return;RB.n=i<0?RB.w.name:RB.ideas[i];sheet()};
window.rbMore=function(){if(!RB)return;RB.n=clean((document.getElementById('rbName')||{}).value)||RB.n;RB.ideas=ideas(RB.w);sheet()};
window.rbAl=function(a){if(!RB)return;RB.n=clean((document.getElementById('rbName')||{}).value)||RB.n;RB.al=a;sheet()};
window.rbCancel=function(){RB=null;closeModal()};
window.rbGo=function(){const r=RB;if(!r)return;RB=null;const w=r.w;let nm=clean((document.getElementById('rbName')||{}).value)||w.name;
 if(nm!==w.name&&used(nm,w)){RB=r;r.n=nm;return toast(`There's already a ${nm} in the game.`)}
 const old={name:w.name,al:w.al,aka:w.aka};const ren=nm!==w.name,turn=r.al!==w.al;
 if(ren){w.aka=w.aka||old.name;w.name=nm}if(turn)w.al=r.al;
 /* the sheet goes first, so the original's own toasts and entrance land on a clear screen (and the office line moves on) */
 closeModal();let ok=false;try{r.go();ok=r.ok()}catch(e){console.warn('rebrand',e)}
 if(!ok){w.name=old.name;w.al=old.al;if(old.aka==null)delete w.aka;else w.aka=old.aka;try{save();render()}catch(e){}return}
 if(ren||turn){news(`🎭 ${ren?`${old.name} is now ${nm}`:nm}${turn?` — and ${ren?'they\'re':'is'} a ${r.al==='f'?'face':'heel'} now`:''}. ${r.where}`);save();try{render()}catch(e){}}};
/* skip the sheet when the original would refuse anyway, so its own message shows right away */
const farmFull=()=>{try{return Object.keys(((S.farm||{}).p||{}).r||{}).length>=(window.FARM&&FARM.FARM_MAX||8)}catch(e){return false}};
const W0=(n,fn)=>{const f=window[n];if(typeof f!=='function')return;window[n]=fn(f)};
W0('callUp',f0=>function(id){const fr=((S.farm||{}).p||{}).r||{};const w=fr[id];const a=arguments,t=this;
 if(!w||w.exc||(S.phase!=='season'&&S.phase!=='over')||ownList('p').length>=30)return f0.apply(t,a);
 if(!ask(w,{i:'📣',head:`Calling up ${w.name}`,verb:'📣 Call them up',where:'Fresh off the call-up from ROH.',go:()=>f0.apply(t,a),ok:()=>!!(S.w[id]&&S.w[id].own==='p')}))return f0.apply(t,a)});
const inFarm=w=>Object.values(((S.farm||{}).p||{}).r||{}).includes(w);
W0('farmSign',f0=>function(reg,i,dest){const a=arguments,t=this;if(dest!=='roh')return f0.apply(t,a);const s=S.scout||{};const w=(reg==='indie'?s.l:s[reg]||[])[i];
 if(!w||farmFull()||S.money.p<0)return f0.apply(t,a);
 if(!ask(w,{i:'🏟️',head:`Signing ${w.name} to ROH`,verb:'🏟️ Sign to ROH',where:'Starting fresh on ROH.',go:()=>f0.apply(t,a),ok:()=>inFarm(w)}))return f0.apply(t,a)});
W0('tapeAct',f0=>function(i,k){const a=arguments,t=this;if(k!=='roh')return f0.apply(t,a);const x=(S.tapes||[])[i];const w=x&&x.w;
 if(!w||farmFull())return f0.apply(t,a);
 if(!ask(w,{i:'🏟️',head:`Signing ${w.name} to ROH`,verb:'🏟️ Sign to ROH',where:'Starting fresh on ROH.',go:()=>{const j=(S.tapes||[]).indexOf(x);if(j>=0)f0.call(t,j,'roh')},ok:()=>inFarm(w)}))return f0.apply(t,a)});
W0('followAct',f0=>function(i,k){const a=arguments,t=this;if(k!=='roh')return f0.apply(t,a);const x=(S.follow||[])[i];const w=x&&x.w;
 if(!w||farmFull())return f0.apply(t,a);
 if(!ask(w,{i:'🏟️',head:`Signing ${w.name} to ROH`,verb:'🏟️ Sign to ROH',where:'Starting fresh on ROH.',go:()=>{const j=(S.follow||[]).indexOf(x);if(j>=0)f0.call(t,j,'roh')},ok:()=>inFarm(w)}))return f0.apply(t,a)});
(function(){const c=document.createElement('style');c.textContent=`#modal .rbc{display:flex;justify-content:center;margin:4px 0 2px}#modal .rbc .tkc{pointer-events:none}`;document.head.appendChild(c)})();
})();
