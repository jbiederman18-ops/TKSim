/* Tony Khan Simulator — belt photos (v162).
   Add a real photo for every championship, the same way as wrestler photos: paste a copied picture, add one from the
   device, or drop files into the repo's photos/belts folder (listed under "belts" in photos/manifest.json) so every
   device gets them. Pictures keep their shape (no card crop); a plain background is cleared by flood-fill from the edges and the result is trimmed, keeping transparency.
   Stored with the wrestler photos on this device (IndexedDB) under "belt:<title id>" — ROH titles use "belt:roh-<id>" —
   so photo exports and backups include them. Used on the Titles screen, the ROH champions card, the history book and
   the "AND NEW" title-change moment. Loaded after fx.js. */
'use strict';
(function(){
const K=id=>'belt:'+id;
let RB={};
const ROHT={rw:"ROH World",rwom:"ROH Women's World",rtv:'ROH TV',rpure:'ROH Pure'};
function allTitles(){const l=Object.values((S&&S.titles)||{}).map(t=>({id:t.id,n:t.n}));Object.entries(ROHT).forEach(([k,n])=>l.push({id:'roh-'+k,n,roh:1}));return l}
function beltImg(id){return (typeof IMG!=='undefined'&&IMG[K(id)])||RB[id]||null}
window.beltImg=beltImg;
/* match a title name (as it appears in results text) to its id */
function titleIdByName(n){n=String(n||'').toLowerCase().replace(/ (title|championship)$/,'');const l=allTitles();const t=l.find(x=>x.n.toLowerCase()===n)||l.find(x=>n.endsWith(x.n.toLowerCase()))||l.find(x=>x.n.toLowerCase().includes(n));return t?t.id:null}
window.beltIdByName=titleIdByName;

/* ---------------- processing: keep the aspect, trim borders, keep transparency ---------------- */
function loadImgEl(src,cors){return new Promise((res,rej)=>{const i=new Image();if(cors)i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function toBelt(src){let img,u=null;if(src.blob){if(typeof createImageBitmap==='function'){try{img=await createImageBitmap(src.blob)}catch(e){}}if(!img){u=URL.createObjectURL(src.blob);img=await loadImgEl(u)}}else img=await loadImgEl(src.url,true);
 /* scale first (max 900×600), then clear the plain background and trim */
 const sc=Math.min(1,900/img.width,600/img.height);const W=Math.max(1,Math.round(img.width*sc)),H=Math.max(1,Math.round(img.height*sc));
 const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(img,0,0,W,H);if(u)URL.revokeObjectURL(u);if(img.close)img.close();
 let id;try{id=x.getImageData(0,0,W,H)}catch(e){return c.toDataURL('image/png')}/* cross-origin: keep as is */
 const d=id.data;const px=(X,Y)=>(Y*W+X)*4;
 /* background = the corners, if they agree; flood-fill from every edge pixel that matches it, so the belt itself is never touched */
 const cs=[px(0,0),px(W-1,0),px(0,H-1),px(W-1,H-1)].map(i=>[d[i],d[i+1],d[i+2],d[i+3]]);const bg=cs[0];
 const near=(a,b,t)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<t;
 if(bg[3]>200&&cs.every(q=>near(q,bg,60))){const T=54;const seen=new Uint8Array(W*H);const st=[];
  for(let X=0;X<W;X++){st.push(X,0,X,H-1)}for(let Y=0;Y<H;Y++){st.push(0,Y,W-1,Y)}
  while(st.length){const Y=st.pop(),X=st.pop();if(X<0||Y<0||X>=W||Y>=H)continue;const k=Y*W+X;if(seen[k])continue;seen[k]=1;const i=k*4;if(d[i+3]<10||near([d[i],d[i+1],d[i+2]],bg,T)){d[i+3]=0;st.push(X+1,Y,X-1,Y,X,Y+1,X,Y-1)}}
  /* soften the cut edge: pixels next to cleared ones that are close-ish to the background fade partly */
  for(let Y=1;Y<H-1;Y++)for(let X=1;X<W-1;X++){const i=px(X,Y);if(d[i+3]===0)continue;if(d[px(X+1,Y)+3]===0||d[px(X-1,Y)+3]===0||d[px(X,Y+1)+3]===0||d[px(X,Y-1)+3]===0){if(near([d[i],d[i+1],d[i+2]],bg,110))d[i+3]=Math.min(d[i+3],140)}}
  x.putImageData(id,0,0)}
 /* trim transparent borders */
 let t=0,b=H-1,l=0,r=W-1;const rowE=Y=>{for(let X=0;X<W;X++)if(d[px(X,Y)+3]>12)return false;return true},colE=X=>{for(let Y=t;Y<=b;Y++)if(d[px(X,Y)+3]>12)return false;return true};
 while(t<b&&rowE(t))t++;while(b>t&&rowE(b))b--;while(l<r&&colE(l))l++;while(r>l&&colE(r))r--;
 const pad=Math.round(Math.max(r-l,b-t)*.03);l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(W-1,r+pad);b=Math.min(H-1,b+pad);
 const o=document.createElement('canvas');o.width=r-l+1;o.height=b-t+1;o.getContext('2d').drawImage(c,l,t,o.width,o.height,0,0,o.width,o.height);return o.toDataURL('image/png')}
async function setBelt(id,src){try{const old=IMG[K(id)];IMG[K(id)]=await toBelt(src);if(!saveImg()){if(old)IMG[K(id)]=old;else delete IMG[K(id)];return false}return true}catch(e){toast("That image couldn't be used. Try saving it to your device and adding it from there.");return false}}
window.beltPaste=async function(id){let src;try{src=await clipImage()}catch(e){return toast(e==='unsupported'?"Pasting isn't supported in this browser — use Add photo instead.":'Allow paste to use the copied picture.')}
 if(!src.blob&&!src.url)return toast('No picture copied. Long-press an image and choose Copy.');if(await setBelt(id,src)){toast('🏆 Belt photo added.');openBelts()}};
window.beltAdd=function(id){const i=fileInput();i.accept='image/*';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(await setBelt(id,{blob:f})){toast('🏆 Belt photo added.');openBelts()}};i.click()};
window.beltDel=function(id){delete IMG[K(id)];saveImg();openBelts();render()};
const search=n=>'https://www.google.com/search?tbm=isch&q='+encodeURIComponent((/^ROH/.test(n)?'':'AEW ')+n+' championship belt');

/* ---------------- the belt studio ---------------- */
window.openBelts=function(){const l=allTitles();const have=l.filter(t=>beltImg(t.id)).length;
 openModal(`<div class="h mhd">🏆 Belt photos</div><div class="row sb"><span class="muted">${have} of ${l.length} titles have a photo</span><b class="gold">${Math.round(have/l.length*100)}%</b></div>
 <p class="muted tiny" style="margin:6px 0 10px">Tap <b>🔍 Find</b> to search for the belt, long-press a picture → <b>Copy</b>, come back and tap <b>Paste</b>. Pictures keep their shape, and plain backgrounds (like the white behind a product photo) are cleared automatically. To share belts with every device, put them in the repo's <b>photos/belts</b> folder and list them under <b>"belts"</b> in photos/manifest.json (e.g. <b>"world": "world.png"</b>).</p>
 ${l.map(t=>{const b=beltImg(t.id);const own=IMG[K(t.id)];return `<div class="card" style="padding:10px 12px"><div class="row sb"><b>${esc(t.n)}</b>${b?'<span class="tg good">✅ Photo</span>':''}</div>${b?`<div style="margin:8px 0;text-align:center;background:radial-gradient(ellipse,#2a2416,#0b0b0d);padding:8px;border-radius:6px"><img src="${b}" alt="" style="max-width:100%;max-height:110px;object-fit:contain"></div>`:''}
  <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><a class="mini" href="${search(t.n)}" target="_blank" rel="noopener">🔍 Find</a><button class="mini" onclick="beltPaste('${t.id}')">📋 Paste</button><button class="mini" onclick="beltAdd('${t.id}')">📷 Add</button>${own?`<button class="mini" onclick="beltDel('${t.id}')">Remove</button>`:''}</div></div>`}).join('')}
 <button class="btn ghost" onclick="closeModal()">Done</button>`,true)};

/* ---------------- shared belts from the repo ---------------- */
function loadRepoBelts(){if(typeof fetch==='undefined')return;fetch('photos/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).then(m=>{const b=(m&&m.belts)||{};const map={};Object.entries(b).forEach(([k,f])=>{if(typeof f==='string')map[k]='photos/belts/'+f});RB=map;if(S)try{render()}catch(e){}}).catch(()=>{})}
loadRepoBelts();

/* ---------------- where belts show up ---------------- */
const plate=(id,h)=>{const b=beltImg(id);return b?`<div class="beltimg" style="text-align:center;margin:8px 0 2px"><img src="${b}" alt="" style="max-width:100%;max-height:${h||90}px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(0,0,0,.6))"></div>`:''};
window.beltPlate=plate;
/* Titles screen: the belt on each title card, plus the studio button */
if(typeof titlesView==='function'){const t0=titlesView;titlesView=function(){let out=t0.apply(this,arguments);try{
 Object.values(S.titles).forEach(t=>{const p=plate(t.id,84);if(!p)return;const mark=`<div class="h">${t.n}</div>`;const i=out.indexOf(mark);if(i<0)return;const j=out.indexOf('<div class="champ">',i);if(j>0)out=out.slice(0,j)+p+out.slice(j)});
 const b=`<button class="btn sec" style="margin:0 0 12px" onclick="openBelts()">🏆 Belt photos — add the real belts</button>`;const k=out.indexOf('<p class="muted">The titles were split');out=k<0?out+b:out.slice(0,k)+b+out.slice(k)}catch(e){console.warn(e)}return out}}
/* Office → Photo Studio gets a shortcut too */
if(typeof openStudio==='function'){const s0=openStudio;openStudio=function(){const out=s0.apply(this,arguments);try{const m=document.querySelector('#modal .mhd');if(m&&!document.getElementById('beltBtn'))m.insertAdjacentHTML('afterend',`<button id="beltBtn" class="btn sec" style="margin:8px 0" onclick="openBelts()">🏆 Belt photos</button>`)}catch(e){}return out}}
/* ROH champions card: a small belt next to each title */
if(typeof window.farmView==='function'){const v0=window.farmView;window.farmView=function(){let h=v0.apply(this,arguments);try{Object.entries(ROHT).forEach(([k,n])=>{const b=beltImg('roh-'+k);if(!b)return;const re=new RegExp('(🏆|👑|📺|🥋) '+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=<)');h=h.replace(re,`<img src="${b}" alt="" style="height:22px;max-width:56px;object-fit:contain;vertical-align:middle;margin-right:6px">${n}`)})}catch(e){}return h}}
/* history book: the belt above each title's lineage */
if(typeof window.openHistory==='function'){const h0=window.openHistory;window.openHistory=function(t){const out=h0.apply(this,arguments);try{const tid=window.HT_T&&S.titles[window.HT_T]?window.HT_T:Object.keys(S.titles)[0];const hd=[...document.querySelectorAll('#modal .h.small')].find(e=>/title history/.test(e.textContent));if(hd&&beltImg(tid))hd.insertAdjacentHTML('afterend',plate(tid,80))}catch(e){}return out}}
})();
