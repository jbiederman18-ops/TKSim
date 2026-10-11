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
let SESS=null,PSESS=null,LOADING=null;
function prefs(){try{return JSON.parse(localStorage.getItem(CUT_KEY)||'{}')}catch(e){return {}}}
function setPrefs(p){try{localStorage.setItem(CUT_KEY,JSON.stringify(Object.assign(prefs(),p)))}catch(e){}}
/* on by default */
const cutOn=()=>prefs().auto!==false;
window.cutOn=cutOn;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s)})}
async function session(){if(SESS)return SESS;if(LOADING)return LOADING;
 LOADING=(async()=>{if(!window.ort)await loadScript(CUT_DIR+'ort.wasm.min.js');ort.env.wasm.wasmPaths=new URL(CUT_DIR,location.href).href;ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;
  const o={executionProviders:['wasm'],graphOptimizationLevel:'all'};
  /* v174: two models — U²-Netp finds the subject (and anything they're holding), and a person model (MediaPipe's
   selfie segmenter, Apache-2.0) knows what a body is, so dark suits, jackets and gear against a dark background stay in */
  const [a,b]=await Promise.all([ort.InferenceSession.create(CUT_DIR+'u2netp.onnx',o),ort.InferenceSession.create(CUT_DIR+'person.onnx',o).catch(()=>null)]);PSESS=b;SESS=a;return SESS})();
 try{return await LOADING}catch(e){LOADING=null;throw e}}
function imgOf(url){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url})}
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
/* is this picture already a cut-out? (a meaningful share of see-through pixels) */
function hasAlpha(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]<200)n++;return n>d.length/16*.04}
window.photoHasAlpha=hasAlpha;
/* v172: the cut-out pipeline.
   1. The model gives a rough subject probability at 320×320.
   2. A guided filter snaps that rough mask to the real edges of the photo at full resolution (keeps hair and
      shoulders, drops the blocky edge the low-resolution mask leaves).
   3. The edge is choked a touch, so there's no halo of the old background around the head.
   4. Edge pixels are re-coloured from the subject just inside them ("decontamination"), which removes the light
      fringe a bright background leaves around hair and skin.
   The work is done on a larger crop (480×640) and the finished card is scaled down to 240×320. */
async function probFor(src){const S0=320;const s=await session();const c=canvas(S0,S0);const x=c.getContext('2d');x.drawImage(src,0,0,S0,S0);const d=x.getImageData(0,0,S0,S0).data;
 const n=S0*S0,inp=new Float32Array(3*n),M=[.485,.456,.406],SD=[.229,.224,.225];
 for(let i=0;i<n;i++)for(let k=0;k<3;k++)inp[k*n+i]=(d[i*4+k]/255-M[k])/SD[k];
 const out=await s.run({[s.inputNames[0]]:new ort.Tensor('float32',inp,[1,3,S0,S0])});const o=out[s.outputNames[0]].data;
 let lo=Infinity,hi=-Infinity;for(let i=0;i<n;i++){if(o[i]<lo)lo=o[i];if(o[i]>hi)hi=o[i]}const r=hi-lo||1;
 const per=PSESS?await personFor(src,S0):null;
 const m=canvas(S0,S0);const mx=m.getContext('2d');const md=mx.createImageData(S0,S0);
 /* the union: anything either model is sure about stays. The person model only counts where it's fairly confident and
  right next to the main subject — so a shirt or tie the first model missed comes back, but people in the crowd don't */
 let gate=null;if(per){const core=new Float32Array(n);for(let i=0;i<n;i++)core[i]=(o[i]-lo)/r>.5?1:0;gate=box(core,S0,S0,Math.round(S0/28))}
 for(let i=0;i<n;i++){let v=(o[i]-lo)/r;if(per&&gate[i]>.02)v=Math.max(v,Math.min(1,Math.max(0,(per[i]-.45)/.45)));v=Math.round(v*255);md.data[i*4]=md.data[i*4+1]=md.data[i*4+2]=v;md.data[i*4+3]=255}
 mx.putImageData(md,0,0);return m}
/* the person model: 256×256 RGB in 0–1 (NHWC) → probability of a person, scaled up to S0×S0 */
async function personFor(src,S0){const P=256,c=canvas(P,P);const x=c.getContext('2d');x.drawImage(src,0,0,P,P);const d=x.getImageData(0,0,P,P).data;const inp=new Float32Array(P*P*3);
 for(let i=0;i<P*P;i++){inp[i*3]=d[i*4]/255;inp[i*3+1]=d[i*4+1]/255;inp[i*3+2]=d[i*4+2]/255}
 const out=await PSESS.run({[PSESS.inputNames[0]]:new ort.Tensor('float32',inp,[1,P,P,3])});const o=out[PSESS.outputNames[0]].data;
 const m=canvas(P,P);const mx=m.getContext('2d');const md=mx.createImageData(P,P);for(let i=0;i<P*P;i++){const v=Math.round(Math.max(0,Math.min(1,o[i]))*255);md.data[i*4]=md.data[i*4+1]=md.data[i*4+2]=v;md.data[i*4+3]=255}mx.putImageData(md,0,0);
 const u=canvas(S0,S0);const ux=u.getContext('2d');ux.imageSmoothingQuality='high';ux.drawImage(m,0,0,S0,S0);const ud=ux.getImageData(0,0,S0,S0).data;const r=new Float32Array(S0*S0);for(let i=0;i<S0*S0;i++)r[i]=ud[i*4]/255;return r}
/* mean over a (2r+1)² window, clamped at the edges, via an integral image */
function box(a,W,H,r){const I=new Float64Array((W+1)*(H+1));for(let y=0;y<H;y++){let row=0;for(let x=0;x<W;x++){row+=a[y*W+x];I[(y+1)*(W+1)+x+1]=I[y*(W+1)+x+1]+row}}
 const o=new Float32Array(W*H);for(let y=0;y<H;y++){const y0=Math.max(0,y-r),y1=Math.min(H,y+r+1);for(let x=0;x<W;x++){const x0=Math.max(0,x-r),x1=Math.min(W,x+r+1);
  o[y*W+x]=(I[y1*(W+1)+x1]-I[y0*(W+1)+x1]-I[y1*(W+1)+x0]+I[y0*(W+1)+x0])/((y1-y0)*(x1-x0))}}return o}
/* cut the subject out of canvas `sub` in place (its pixels get an alpha channel) */
async function cutOut(sub,opt){opt=opt||{};const W=sub.width,H=sub.height,n=W*H;const sx=sub.getContext('2d');const img=sx.getImageData(0,0,W,H);const d=img.data;
 /* rough mask, scaled up to the photo */
 const pm=await probFor(sub);const up=canvas(W,H);const ux=up.getContext('2d');ux.imageSmoothingQuality='high';ux.drawImage(pm,0,0,W,H);const ud=ux.getImageData(0,0,W,H).data;
 const p=new Float32Array(n),I=new Float32Array(n);for(let i=0;i<n;i++){p[i]=ud[i*4]/255;I[i]=(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114)/255}
 /* guided filter (He et al.): the rough mask, refined to follow the photo's own edges */
 const r=Math.max(3,Math.round(W/70)),eps=.006;
 const mI=box(I,W,H,r),mp=box(p,W,H,r),II=new Float32Array(n),Ip=new Float32Array(n);for(let i=0;i<n;i++){II[i]=I[i]*I[i];Ip[i]=I[i]*p[i]}
 const cII=box(II,W,H,r),cIp=box(Ip,W,H,r),A=new Float32Array(n),B=new Float32Array(n);
 for(let i=0;i<n;i++){const v=cII[i]-mI[i]*mI[i],c=cIp[i]-mI[i]*mp[i];A[i]=c/(v+eps);B[i]=mp[i]-A[i]*mI[i]}
 const mA=box(A,W,H,r),mB=box(B,W,H,r);const a=new Float32Array(n);
 /* choke: the faint haze outside the body goes, and the edge sits just inside the old background */
 const lo=opt.halo?.42:.3;for(let i=0;i<n;i++){const q=mA[i]*I[i]+mB[i];const blend=.65*q+.35*p[i];a[i]=Math.max(0,Math.min(1,(blend-lo)/.5))}
 /* v173: re-doing a photo that was already cut out — its old halo is a ring that's brighter than both the wrestler just
  inside it and the backdrop just outside it, so anything like that along the edge is dropped */
 if(opt.halo){const k=Math.max(2,Math.round(W/60));const wi=new Float32Array(n),wo=new Float32Array(n),li=new Float32Array(n),lo2=new Float32Array(n);
  for(let i=0;i<n;i++){const ai=a[i]**4,ao=(1-a[i])**4;wi[i]=ai;wo[i]=ao;li[i]=I[i]*ai;lo2[i]=I[i]*ao}
  const bwi=box(wi,W,H,k),bwo=box(wo,W,H,k),bli=box(li,W,H,k),blo=box(lo2,W,H,k),band=box(a,W,H,k);
  const kill=new Float32Array(n);for(let i=0;i<n;i++){if(band[i]<.03||band[i]>.97||a[i]>.97)continue;const inL=bwi[i]>1e-3?bli[i]/bwi[i]:0,outL=bwo[i]>1e-3?blo[i]/bwo[i]:0;
   const ex=Math.min(I[i]-inL,I[i]-outL-.04);if(ex>.05)kill[i]=Math.min(1,(ex-.05)/.08)}
  /* smoothed, so it peels the ring off evenly instead of leaving specks */
  const ks=box(kill,W,H,1);for(let i=0;i<n;i++)if(ks[i]>0)a[i]*=Math.max(0,1-Math.min(1,ks[i]*1.6))}
 /* decontaminate: edge pixels take the colour of the subject just inside them */
 const rr=Math.max(2,Math.round(W/120));const ch=[0,1,2].map(k=>{const f=new Float32Array(n);for(let i=0;i<n;i++)f[i]=d[i*4+k]*a[i]*a[i];return box(f,W,H,rr)});const wa=new Float32Array(n);for(let i=0;i<n;i++)wa[i]=a[i]*a[i];const mw=box(wa,W,H,rr);
 for(let i=0;i<n;i++){const al=a[i];if(al<.98&&al>0&&mw[i]>1e-3){const t=1-al;for(let k=0;k<3;k++)d[i*4+k]=Math.round(d[i*4+k]*(1-t)+(ch[k][i]/mw[i])*t)}d[i*4+3]=Math.round(al*255)}
 sx.putImageData(img,0,0)}
/* v176: the backdrop is AEW's own black-and-gold card art (card-bg.jpg), the same one behind every card slot.
   The old per-style gradient stays only as a fallback if the image can't load. */
let BG=null,BGP=null;
function bgReady(){if(BG)return Promise.resolve(BG);if(!BGP)BGP=new Promise(res=>{const im=new Image();im.onload=()=>{BG=im;res(im)};im.onerror=()=>{BGP=null;res(null)};im.src='card-bg.jpg'});return BGP}
bgReady();
function backdrop(x,W,H,w){if(BG){const iw=BG.naturalWidth,ih=BG.naturalHeight,s=Math.max(W/iw,H/ih);x.drawImage(BG,(W-iw*s)/2,(H-ih*s)/2,iw*s,ih*s);return}
 const c=(typeof SCOL!=='undefined'&&w&&SCOL[w.st])||['#6a5a3a','#140f08'];
 const g=x.createRadialGradient(W*.5,H*.3,0,W*.5,H*.3,Math.hypot(W,H)*.8);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.fillRect(0,0,W,H)}
/* subject (a canvas with transparency) → finished card photo */
const PW=240,PH=320;
function compose(sub,w){const W=sub.width,H=sub.height;const c=canvas(W,H);const x=c.getContext('2d');backdrop(x,W,H,w);
 x.save();x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=Math.round(W/16);x.shadowOffsetY=Math.round(W/90);x.drawImage(sub,0,0);x.restore();
 if(W===PW&&H===PH)return c.toDataURL('image/jpeg',.72);
 const o=canvas(PW,PH);const ox=o.getContext('2d');ox.imageSmoothingQuality='high';ox.drawImage(c,0,0,PW,PH);return o.toDataURL('image/jpeg',.72)}
/* cut out one card photo (a data URL from fileToPhoto — 480×640 for new photos, 240×320 for ones already saved).
   Returns the finished 240×320 card photo as a data URL. */
async function cutPhoto(url,id,opt){const w=S&&S.w&&S.w[id];const im=await imgOf(url);const W=im.naturalWidth||im.width,H=im.naturalHeight||im.height;
 const sub=canvas(W,H);const sx=sub.getContext('2d');sx.drawImage(im,0,0,W,H);
 if(!hasAlpha(sub))await cutOut(sub,opt);
 await bgReady();return compose(sub,w)}
/* a big intake photo that couldn't be cut out still gets saved at the usual card size */
async function small(url){const im=await imgOf(url);if((im.naturalWidth||im.width)<=PW)return url;const c=canvas(PW,PH);const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,PW,PH);return c.toDataURL(url.startsWith('data:image/png')?'image/png':'image/jpeg',.7)}
window.cutWork=()=>cutOn()?[480,640]:[240,320];
window.cutPhoto=cutPhoto;
/* the hook every photo goes through on its way in: cut it out if the setting is on. Never loses the photo — if the
   cut-out can't run (no connection the first time, an old browser), the photo is kept as it was. */
let warned=false;
window.cutIn=async function(url,id){if(!url)return url;if(!cutOn()||!S||!S.w||!S.w[id])return small(url).catch(()=>url);try{const out=await cutPhoto(url,id);markCut(id,out);return out}
 catch(e){console.warn('cut-out',e);if(!warned){warned=true;toast("Couldn't cut out the background this time (the cut-out tool needs a connection). The photo was kept as is.")}try{return await small(url)}catch(x){return url}}};
/* which photos are already cut out (keyed by length + a few characters, so a replaced photo counts as new) */
const sig=u=>u?u.length+':'+u.slice(-24):'';
function done(){return prefs().done||{}}
/* clean: cut out with the v172+ edges (no halo). Photos cut out before that can be cleaned up in place. */
function markCut(id,u){const d=done(),c=prefs().clean||{},b=prefs().bg||{};d[id]=c[id]=b[id]=sig(u);setPrefs({done:d,clean:c,bg:b})}
const isCut=id=>!!IMG[id]&&done()[id]===sig(IMG[id]);
const isClean=id=>!!IMG[id]&&(prefs().clean||{})[id]===sig(IMG[id]);
const needsClean=id=>isCut(id)&&!isClean(id);
/* v176: cut-outs made on the old generated gradients get re-set on the AEW backdrop */
const needsBg=id=>isCut(id)&&(prefs().bg||{})[id]!==sig(IMG[id]);
/* v173: an older cut-out is re-done from the card itself: the wrestler is cut out again from their backdrop, and the
   light ring the old edges left is peeled off (two passes) — no need to re-paste the original */
async function cleanPhoto(url,id){const a=await cutPhoto(url,id,{halo:true});return cutPhoto(a,id,{halo:true})}
window.photoIsCut=isCut;
window.cutNeedsBg=()=>S&&S.w?Object.values(S.w).filter(w=>needsBg(w.id)).length:0;
/* batch: every photo on this device, plus shared repo photos (those get a cut-out copy saved on this device) */
let RUN=null;
window.cutAll=async function(mode){if(RUN)return;const clean=mode==='clean',bgm=mode==='bg';const ws=Object.values(S.w).filter(w=>bgm?needsBg(w.id):clean?needsClean(w.id):(IMG[w.id]&&!isCut(w.id))||(!IMG[w.id]&&typeof repoPhoto==='function'&&repoPhoto(w)));
 if(!ws.length)return toast(bgm?'Every cut-out is already on the AEW backdrop. ✂️':clean?'Every cut-out already has clean edges. ✂️':'Every photo is already cut out. ✂️');RUN={n:ws.length,i:0,ok:0,bad:0,stop:false};const backup=Object.assign({},IMG);
 const draw=()=>openModal(`<div class="h mhd">✂️ ${bgm?'Moving cut-outs to the new backdrop':clean?'Cleaning up edges':'Cutting out photos'}</div><p class="muted">${RUN.i<1&&!SESS?'Loading the cut-out tool (about 15MB)…':`${RUN.i} of ${RUN.n} done${RUN.bad?` · ${RUN.bad} skipped`:''}`}</p><div class="bar"><i style="width:${RUN.i/RUN.n*100}%"></i></div><p class="muted tiny">Keep the game open — it runs on this device. You can stop any time; the ones already done are kept.</p><button class="btn ghost" onclick="cutStop()">Stop</button>`,true);
 draw();
 try{await session()}catch(e){RUN=null;return openModal(`<div class="h mhd">Couldn't load the cut-out tool</div><p class="muted">It needs an internet connection the first time. Try again when you're online.</p><button class="btn" onclick="openStudio()">Back to Photo Studio</button>`)}
 /* v171: each photo is saved before moving on, so a full device stops the batch cleanly instead of losing photos silently */
 let full=false;
 for(const w of ws){if(RUN.stop)break;const prev=IMG[w.id];let out=null;try{const src=prev||await fileToPhoto(new URL(repoPhoto(w),location.href).href,true);out=bgm?await cutPhoto(src,w.id,{halo:true}):clean?await cleanPhoto(src,w.id):await cutPhoto(src,w.id)}catch(e){console.warn(e);RUN.bad++}
  if(out){IMG[w.id]=out;if(await saveImgNow()){markCut(w.id,out);RUN.ok++}else{if(prev)IMG[w.id]=prev;else delete IMG[w.id];full=true;break}}
  RUN.i++;if(RUN.i%3===0||RUN.i===RUN.n)draw()}
 const r=RUN;RUN=null;render();
 if(full)return openModal(`<div class="h mhd">Device storage is full</div><p class="muted">${r.ok} photo${r.ok===1?'':'s'} were cut out and saved before this device ran out of room; the rest keep their old photos. ${await storeLine()}</p><p class="muted tiny">Free some space on the phone (or remove photos of wrestlers you don't use), then run it again — it picks up where it stopped.</p><button class="btn" onclick="openStudio()">Back to Photo Studio</button>`);
 toast(`✂️ ${r.ok} photo${r.ok===1?'':'s'} ${bgm?'moved to the new backdrop':clean?'cleaned up':'cut out'}${r.bad?` · ${r.bad} skipped`:''}.`);openStudio()};
/* how much of the device's storage the game is using */
async function storeLine(){try{const e=await navigator.storage.estimate();if(!e||!e.quota)return '';const mb=x=>x>=1e9?(x/1e9).toFixed(1)+' GB':Math.round(x/1e6)+' MB';return `The game is using ${mb(e.usage||0)} of the ${mb(e.quota)} this device allows it.`}catch(e){return ''}}
window.cutStore=async function(){const el=document.getElementById('cutstore');if(el)el.textContent=await storeLine()};
window.cutStop=function(){if(RUN)RUN.stop=true};
/* the Photo Studio card */
window.cutCard=function(){const all=Object.values(S.w);const mine=all.filter(w=>IMG[w.id]);const cut=mine.filter(w=>isCut(w.id)).length;const left=all.filter(w=>(IMG[w.id]&&!isCut(w.id))||(!IMG[w.id]&&typeof repoPhoto==='function'&&repoPhoto(w))).length;
 return `<div class="card mt"><div class="row sb" style="gap:10px"><div style="min-width:0"><b>✂️ Cut out backgrounds</b><div class="muted tiny">Removes the background and sets every wrestler on the same card backdrop, so the whole roster matches.</div></div><button class="mini ${cutOn()?'on':''}" onclick="cutToggle()">${cutOn()?'✓ On':'Off'}</button></div>
 <div class="muted tiny" style="margin-top:6px">${cutOn()?'New photos are cut out automatically.':'New photos keep their background.'} Already have a cut-out? A PNG with a see-through background is used as is.${cut?` · ${cut} cut out so far`:''}</div>
 ${left?`<button class="btn sec" style="margin:8px 0 0" onclick="cutAll()">✂️ Cut out ${left} existing photo${left===1?'':'s'}</button>`:''}${(()=>{const k=mine.filter(w=>needsBg(w.id)).length;return k?`<button class="btn sec" style="margin:8px 0 0" onclick="cutAll('bg')">🖤 Put ${k} cut-out${k===1?'':'s'} on the new AEW backdrop</button><div class="muted tiny">Swaps the old coloured backgrounds for the black-and-gold card art. Takes a few seconds each.</div>`:''})()}${(()=>{const k=mine.filter(w=>needsClean(w.id)).length;return k?`<button class="btn sec" style="margin:8px 0 0" onclick="cutAll('clean')">🧹 Clean up the edges on ${k} earlier cut-out${k===1?'':'s'}</button><div class="muted tiny">Removes the light outline the first version of the cut-out left around heads and hair. Takes a few seconds each.</div>`:''})()}<div class="muted tiny" id="cutstore" style="margin-top:6px"></div></div>${setTimeout(()=>window.cutStore&&cutStore(),0)?'':''}`};
/* v176: one-time heads-up that older cut-outs can move to the new backdrop */
setTimeout(()=>{try{if(prefs().bgNudged)return;const k=window.cutNeedsBg();if(!k)return;setPrefs({bgNudged:1});typeof toast==='function'&&toast(`New AEW card backdrop! Open Photo Studio to move your ${k} cut-out${k===1?'':'s'} onto it.`)}catch(e){}},3000);
window.cutToggle=function(){setPrefs({auto:!cutOn()});openStudio()};
})();
