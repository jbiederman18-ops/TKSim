/* Tony Khan Simulator — photo cut-outs (v170).
   Every wrestler photo can have its background removed so the whole roster matches: the subject is cut out on the device
   and set on the same backdrop the card uses for that wrestler's style (the gradient behind the silhouettes), with a soft
   shadow so they pop.
     • New photos are cut out automatically when the setting is on (Photo Studio, on by default).
     • A picture that's already a cut-out (a PNG with a see-through background) is used as is — no AI needed.
     • "Cut out all my photos" runs through every photo on this device, plus the shared repo photos.
   The cut-out runs on the phone itself: U²-Netp (Apache-2.0, 4.5MB) on onnxruntime-web (MIT, WebAssembly). The files live
   in vendor/cut and are downloaded when a photo is cut out (not stored on the device, which keeps room for photos).
   Loaded after the main script. */
'use strict';
(function(){
const CUT_KEY='tksim_cut',CUT_DIR='vendor/cut/';
let SESS=null,LOADING=null;
function prefs(){try{return JSON.parse(localStorage.getItem(CUT_KEY)||'{}')}catch(e){return {}}}
function setPrefs(p){try{localStorage.setItem(CUT_KEY,JSON.stringify(Object.assign(prefs(),p)))}catch(e){}}
/* on by default */
const cutOn=()=>prefs().auto!==false;
window.cutOn=cutOn;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s)})}
async function session(){if(SESS)return SESS;if(LOADING)return LOADING;
 LOADING=(async()=>{if(!window.ort)await loadScript(CUT_DIR+'ort.wasm.min.js');ort.env.wasm.wasmPaths=new URL(CUT_DIR,location.href).href;ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;
  SESS=await ort.InferenceSession.create(CUT_DIR+'u2netp.onnx',{executionProviders:['wasm'],graphOptimizationLevel:'all'});return SESS})();
 try{return await LOADING}catch(e){LOADING=null;throw e}}
function imgOf(url){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url})}
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
/* is this picture already a cut-out? (a meaningful share of see-through pixels) */
function hasAlpha(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]<200)n++;return n>d.length/16*.04}
window.photoHasAlpha=hasAlpha;
/* the subject mask (0–255 alpha) for a picture, from the model */
async function maskFor(src){const S0=320;const s=await session();const c=canvas(S0,S0);const x=c.getContext('2d');x.drawImage(src,0,0,S0,S0);const d=x.getImageData(0,0,S0,S0).data;
 const n=S0*S0,inp=new Float32Array(3*n),M=[.485,.456,.406],SD=[.229,.224,.225];
 for(let i=0;i<n;i++)for(let k=0;k<3;k++)inp[k*n+i]=(d[i*4+k]/255-M[k])/SD[k];
 const out=await s.run({[s.inputNames[0]]:new ort.Tensor('float32',inp,[1,3,S0,S0])});const o=out[s.outputNames[0]].data;
 let lo=Infinity,hi=-Infinity;for(let i=0;i<n;i++){if(o[i]<lo)lo=o[i];if(o[i]>hi)hi=o[i]}const r=hi-lo||1;
 const m=canvas(S0,S0);const mx=m.getContext('2d');const md=mx.createImageData(S0,S0);
 /* firm up the edges: faint haze becomes background, the body stays solid */
 for(let i=0;i<n;i++){const v=(o[i]-lo)/r;const a=Math.max(0,Math.min(1,(v-.12)/.6));md.data[i*4+3]=Math.round(a*255)}
 mx.putImageData(md,0,0);return m}
/* the backdrop: the card's own style gradient with the gold streaks, same as the photo-less silhouettes */
function backdrop(x,W,H,w){const c=(typeof SCOL!=='undefined'&&w&&SCOL[w.st])||['#6a5a3a','#140f08'];
 const g=x.createRadialGradient(W*.5,H*.3,0,W*.5,H*.3,Math.hypot(W,H)*.8);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.strokeStyle='rgba(243,215,122,.16)';x.lineWidth=W*7/120;const k=W/120;x.beginPath();x.moveTo(-20*k,130*k);x.lineTo(140*k,20*k);x.moveTo(-20*k,152*k);x.lineTo(140*k,42*k);x.stroke();x.restore()}
/* subject (a canvas with transparency) → finished card photo */
function compose(sub,w){const W=sub.width,H=sub.height;const c=canvas(W,H);const x=c.getContext('2d');backdrop(x,W,H,w);
 x.save();x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=Math.round(W/18);x.shadowOffsetY=Math.round(W/80);x.drawImage(sub,0,0);x.restore();
 return c.toDataURL('image/jpeg',.72)}
/* cut out one card photo (a data URL from fileToPhoto). Returns a new data URL. */
async function cutPhoto(url,id){const w=S&&S.w&&S.w[id];const im=await imgOf(url);const W=im.naturalWidth||im.width,H=im.naturalHeight||im.height;
 const sub=canvas(W,H);const sx=sub.getContext('2d');sx.drawImage(im,0,0,W,H);
 if(!hasAlpha(sub)){const m=await maskFor(im);sx.globalCompositeOperation='destination-in';sx.imageSmoothingQuality='high';sx.drawImage(m,0,0,W,H);sx.globalCompositeOperation='source-over'}
 return compose(sub,w)}
window.cutPhoto=cutPhoto;
/* the hook every photo goes through on its way in: cut it out if the setting is on. Never loses the photo — if the
   cut-out can't run (no connection the first time, an old browser), the photo is kept as it was. */
let warned=false;
window.cutIn=async function(url,id){if(!url||!cutOn()||!S||!S.w||!S.w[id])return url;try{const out=await cutPhoto(url,id);markCut(id,out);return out}
 catch(e){console.warn('cut-out',e);if(!warned){warned=true;toast("Couldn't cut out the background this time (the cut-out tool needs a connection the first time). The photo was kept as is.")}return url}};
/* which photos are already cut out (keyed by length + a few characters, so a replaced photo counts as new) */
const sig=u=>u?u.length+':'+u.slice(-24):'';
function done(){return prefs().done||{}}
function markCut(id,u){const d=done();d[id]=sig(u);setPrefs({done:d})}
const isCut=id=>!!IMG[id]&&done()[id]===sig(IMG[id]);
window.photoIsCut=isCut;
/* batch: every photo on this device, plus shared repo photos (those get a cut-out copy saved on this device) */
let RUN=null;
window.cutAll=async function(){if(RUN)return;const ws=Object.values(S.w).filter(w=>(IMG[w.id]&&!isCut(w.id))||(!IMG[w.id]&&typeof repoPhoto==='function'&&repoPhoto(w)));
 if(!ws.length)return toast('Every photo is already cut out. ✂️');RUN={n:ws.length,i:0,ok:0,bad:0,stop:false};const backup=Object.assign({},IMG);
 const draw=()=>openModal(`<div class="h mhd">✂️ Cutting out photos</div><p class="muted">${RUN.i<1&&!SESS?'Loading the cut-out tool (about 15MB, only the first time)…':`${RUN.i} of ${RUN.n} done${RUN.bad?` · ${RUN.bad} skipped`:''}`}</p><div class="bar"><i style="width:${RUN.i/RUN.n*100}%"></i></div><p class="muted tiny">Keep the game open — it runs on this device. You can stop any time; the ones already done are kept.</p><button class="btn ghost" onclick="cutStop()">Stop</button>`,true);
 draw();
 try{await session()}catch(e){RUN=null;return openModal(`<div class="h mhd">Couldn't load the cut-out tool</div><p class="muted">It needs an internet connection the first time. Try again when you're online.</p><button class="btn" onclick="openStudio()">Back to Photo Studio</button>`)}
 /* v171: each photo is saved before moving on, so a full device stops the batch cleanly instead of losing photos silently */
 let full=false;
 for(const w of ws){if(RUN.stop)break;const prev=IMG[w.id];let out=null;try{const src=prev||await fileToPhoto(new URL(repoPhoto(w),location.href).href,true);out=await cutPhoto(src,w.id)}catch(e){console.warn(e);RUN.bad++}
  if(out){IMG[w.id]=out;if(await saveImgNow()){markCut(w.id,out);RUN.ok++}else{if(prev)IMG[w.id]=prev;else delete IMG[w.id];full=true;break}}
  RUN.i++;if(RUN.i%3===0||RUN.i===RUN.n)draw()}
 const r=RUN;RUN=null;render();
 if(full)return openModal(`<div class="h mhd">Device storage is full</div><p class="muted">${r.ok} photo${r.ok===1?'':'s'} were cut out and saved before this device ran out of room; the rest keep their old photos. ${await storeLine()}</p><p class="muted tiny">Free some space on the phone (or remove photos of wrestlers you don't use), then run it again — it picks up where it stopped.</p><button class="btn" onclick="openStudio()">Back to Photo Studio</button>`);
 toast(`✂️ ${r.ok} photo${r.ok===1?'':'s'} cut out${r.bad?` · ${r.bad} skipped`:''}.`);openStudio()};
/* how much of the device's storage the game is using */
async function storeLine(){try{const e=await navigator.storage.estimate();if(!e||!e.quota)return '';const mb=x=>x>=1e9?(x/1e9).toFixed(1)+' GB':Math.round(x/1e6)+' MB';return `The game is using ${mb(e.usage||0)} of the ${mb(e.quota)} this device allows it.`}catch(e){return ''}}
window.cutStore=async function(){const el=document.getElementById('cutstore');if(el)el.textContent=await storeLine()};
window.cutStop=function(){if(RUN)RUN.stop=true};
/* the Photo Studio card */
window.cutCard=function(){const all=Object.values(S.w);const mine=all.filter(w=>IMG[w.id]);const cut=mine.filter(w=>isCut(w.id)).length;const left=all.filter(w=>(IMG[w.id]&&!isCut(w.id))||(!IMG[w.id]&&typeof repoPhoto==='function'&&repoPhoto(w))).length;
 return `<div class="card mt"><div class="row sb" style="gap:10px"><div style="min-width:0"><b>✂️ Cut out backgrounds</b><div class="muted tiny">Removes the background and sets every wrestler on the same card backdrop, so the whole roster matches.</div></div><button class="mini ${cutOn()?'on':''}" onclick="cutToggle()">${cutOn()?'✓ On':'Off'}</button></div>
 <div class="muted tiny" style="margin-top:6px">${cutOn()?'New photos are cut out automatically.':'New photos keep their background.'} Already have a cut-out? A PNG with a see-through background is used as is.${cut?` · ${cut} cut out so far`:''}</div>
 ${left?`<button class="btn sec" style="margin:8px 0 0" onclick="cutAll()">✂️ Cut out ${left} existing photo${left===1?'':'s'}</button>`:''}<div class="muted tiny" id="cutstore" style="margin-top:6px"></div></div>${setTimeout(()=>window.cutStore&&cutStore(),0)?'':''}`};
window.cutToggle=function(){setPrefs({auto:!cutOn()});openStudio()};
})();
