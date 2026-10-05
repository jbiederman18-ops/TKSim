/* Tony Khan Simulator — the 16-Bit look (v116).
   An optional per-device look: pixel fonts, purple arcade palette and pixel-art wrestlers.
   Wrestlers with a photo get a pixelated version of it; everyone else gets a generated sprite
   (built from their id, gender, style and alignment, so it stays the same every time).
   Loaded before the main script; the look itself lives in retro.css under html.r16. */
'use strict';
const LOOK_KEY='tksim_look',LOOK_PX='tksim_look_px';
/* the looks: Classic plus a family of retro video-game styles that share retro.css */
const LOOKS={classic:{n:'Classic',d:'Black and gold, broadcast style'},'16':{n:'🕹️ 16-Bit',d:'Pixel fonts and arcade colors'},
 rpg:{n:'🗡️ Quest',d:'Old-school RPG menu windows'},arc:{n:'👊 Arcade',d:'90s fighting-game cabinet'},
 y2k:{n:'💿 Y2K Blue',d:'Chrome and blue glass',f:'fy2'},y2s:{n:'⛓️ Y2K Steel Cage',d:'Gunmetal, brushed steel, blood red',f:'fy2'},y2g:{n:'🟢 Y2K Neon',d:'Black glass and toxic green',f:'fy2'},y2p:{n:'🏆 Y2K PPV Gold',d:'Chrome gold on purple glass',f:'fy2'}};
let LOOK='classic',R16=false,R16PX=true;
try{LOOK=localStorage.getItem(LOOK_KEY)||'classic';if(LOOK==='r16')LOOK='16';if(!LOOKS[LOOK])LOOK='classic';R16PX=localStorage.getItem(LOOK_PX)!=='spr'}catch(e){}
R16=LOOK!=='classic';
function r16Apply(){const d=document.documentElement;Object.keys(LOOKS).forEach(k=>d.classList.remove('lk-'+k));d.classList.remove('r16','fy2');d.classList.toggle('rt',R16);if(R16){d.classList.add('lk-'+LOOK);if(LOOKS[LOOK].f)d.classList.add(LOOKS[LOOK].f)}
 const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',{classic:'#09090b','16':'#12061f',rpg:'#0a1250',arc:'#050304',y2k:'#030a1c',y2s:'#0b0c0f',y2g:'#020402',y2p:'#06030c'}[LOOK]||'#09090b')}
r16Apply();
function setLook(k){if(!LOOKS[k])k='classic';LOOK=k;R16=k!=='classic';try{localStorage.setItem(LOOK_KEY,k)}catch(e){}r16Apply();
 if(typeof render==='function')try{render()}catch(e){}
 if(typeof toast==='function')toast(R16?`${LOOKS[k].n} look on.`:'Classic look is back.')}
function setLookPx(on){R16PX=!!on;try{localStorage.setItem(LOOK_PX,R16PX?'px':'spr')}catch(e){}if(typeof render==='function')try{render()}catch(e){}}
/* the Game menu card */
function lookCard(){const opt=k=>`<button class="tp ${k===LOOK?'on':''}" onclick="setLook('${k}')"><b>${LOOKS[k].n}</b><span>${LOOKS[k].d}</span></button>`;
 return `<div class="card mt"><div class="h small">Look</div><p class="muted" style="margin-top:0">Pick how the game looks on this device. Your save and leagues aren't affected.</p>
 <div class="tpick">${Object.keys(LOOKS).map(opt).join('')}</div>
 ${R16?`<label>Wrestler pictures</label><div class="tpick"><button class="tp ${R16PX?'on':''}" onclick="setLookPx(true)"><b>Pixel photos</b><span>Photos turned into pixel art; sprites for the rest</span></button><button class="tp ${R16PX?'':'on'}" onclick="setLookPx(false)"><b>Sprites only</b><span>Everyone gets a pixel sprite</span></button></div>`:''}</div>`}

/* ---------- sprites ---------- */
const SPR=new Map(),PXP=new Map(),PXQ=new Set();
function r16Hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function r16Rng(seed){let a=seed||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SKIN=[['#ffd9b8','#e8b48e'],['#f2c39b','#cf9a72'],['#dca37a','#b77d55'],['#c08559','#985f37'],['#8f5a36','#6b3f22'],['#653b20','#4a2914']];
const HAIRC=['#1a1210','#1a1210','#3a2414','#5a3a1e','#2a1a10','#d9b25a','#b5571e','#d8d4cc','#ff5ea8','#3b8bff'];
const GEAR_F=[['#2f7bff','#1a4ab8'],['#3bd1ff','#1a8ab8'],['#ffffff','#b9c4d8'],['#ffd23b','#c48a12'],['#5cf07a','#2a9a44']];
const GEAR_H=[['#ff3b4b','#a8142a'],['#1c1c26','#0a0a10'],['#9b30ff','#5a128f'],['#ff8a3b','#b8521a'],['#ffd23b','#8a5a0a']];
const BG={fl:['#3b1d70','#24104a'],te:['#1d3a70','#10244a'],br:['#5a1d2a','#360f18'],pw:['#5a3a10','#36200a'],sh:['#5a1d5a','#360f36']};
function sprite(w){const key=`${w.id}|${w.al}|${w.g}|${w.st}`;if(SPR.has(key))return SPR.get(key);
 const W=24,H=32,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const R=r16Rng(r16Hash(w.id||w.name||'x'));const pick=a=>a[Math.floor(R()*a.length)];
 const F=w.g==='F',heel=w.al==='h';
 const P=(x,y,col)=>{c.fillStyle=col;c.fillRect(x,y,1,1)},Rc=(x,y,ww,hh,col)=>{c.fillStyle=col;c.fillRect(x,y,ww,hh)};
 // background: style tint, spotlight, floor ropes
 const bg=BG[w.st]||BG.sh;Rc(0,0,W,H,bg[1]);for(let y=0;y<20;y++){const r=9-Math.abs(y-8)*.4;Rc(Math.round(12-r),y,Math.round(r*2),1,bg[0])}
 const stars=Array.from({length:8},()=>[Math.floor(R()*W),Math.floor(R()*16)]);
 const [sk,sd]=SKIN[Math.floor(R()*SKIN.length)];
 let hair=pick(HAIRC);if(R()<.75&&(hair==='#ff5ea8'||hair==='#3b8bff'))hair='#1a1210';
 const gear=pick(heel?GEAR_H:GEAR_F),acc=pick(heel?GEAR_F:GEAR_H);
 const pw=w.st==='pw',big=pw||w.st==='br';
 // body / shoulders
 const sx=big?1:F?4:3,sw=W-sx*2;
 Rc(sx+1,22,sw-2,10,sk);Rc(sx,24,sw,8,sk);Rc(sx,24,1,8,sd);Rc(sx+sw-1,24,1,8,sd);
 const top=F?pick(['tank','top','jacket']):pick(['bare','bare','straps','tank','jacket','tee']);
 if(top==='straps'){Rc(sx+3,22,2,10,gear[0]);Rc(sx+sw-5,22,2,10,gear[0]);Rc(sx+3,29,sw-6,3,gear[0])}
 else if(top==='tank'||top==='top'){Rc(sx+2,24,sw-4,8,gear[0]);Rc(sx+4,22,2,2,gear[0]);Rc(sx+sw-6,22,2,2,gear[0]);Rc(10,23,4,2,sk);if(top==='top')Rc(sx+2,30,sw-4,2,sk)}
 else if(top==='tee'){Rc(sx,23,sw,9,gear[0]);Rc(10,23,4,2,sk);Rc(sx,26,1,6,gear[1]);Rc(sx+sw-1,26,1,6,gear[1])}
 else if(top==='jacket'){Rc(sx,22,sw,10,gear[0]);Rc(10,22,4,10,F?gear[1]:sk);Rc(9,23,1,9,acc[0]);Rc(14,23,1,9,acc[0]);Rc(sx,22,sw,1,gear[1])}
 else{Rc(sx+3,26,2,1,sd);Rc(sx+sw-5,26,2,1,sd);Rc(11,28,2,1,sd)}
 if(heel&&R()<.35)Rc(sx,31,sw,1,'#000');
 // neck
 Rc(10,18,4,4,sk);Rc(10,20,4,1,sd);
 // head
 Rc(7,7,10,11,sk);Rc(8,6,8,1,sk);Rc(8,18,8,1,sk);Rc(16,8,1,9,sd);Rc(8,18,8,1,sd);P(6,11,sk);P(6,12,sd);P(17,11,sk);P(17,12,sd);
 // hair
 const hs=F?pick(['long','long','pony','bun','bob','curly','pigs']):pick(['short','short','buzz','bald','long','mohawk','slick','curly','pony']);
 const hr=(x,y,ww,hh)=>Rc(x,y,ww,hh,hair);
 if(hs==='short'){hr(7,5,10,3);hr(6,6,1,4);hr(17,6,1,4);hr(8,4,8,1)}
 else if(hs==='buzz'){hr(7,6,10,2);c.globalAlpha=.6;hr(6,7,1,3);hr(17,7,1,3);c.globalAlpha=1}
 else if(hs==='bald'){P(9,7,'rgba(255,255,255,.45)');P(10,7,'rgba(255,255,255,.3)')}
 else if(hs==='mohawk'){hr(11,1,2,7);hr(10,3,4,3)}
 else if(hs==='slick'){hr(7,5,10,2);hr(6,6,1,5);hr(17,6,1,3);hr(8,4,9,1);P(16,7,hair)}
 else if(hs==='curly'){for(let y=3;y<9;y++)for(let x=6;x<18;x++)if((x+y)%2===0&&(y<7||x<8||x>15))P(x,y,hair);hr(7,4,10,3)}
 else if(hs==='pony'){hr(7,5,10,3);hr(6,6,1,5);hr(17,6,1,5);hr(8,4,8,1);hr(17,10,2,9)}
 else if(hs==='bun'){hr(7,5,10,3);hr(10,1,4,4);hr(6,6,1,4);hr(17,6,1,4)}
 else if(hs==='bob'){hr(6,5,12,3);hr(5,7,2,10);hr(17,7,2,10);hr(8,4,8,1)}
 else if(hs==='pigs'){hr(7,5,10,3);hr(6,6,1,5);hr(17,6,1,5);hr(3,9,3,6);hr(18,9,3,6)}
 else{hr(7,4,10,4);hr(5,6,2,15);hr(17,6,2,15);hr(8,3,8,1);if(!F){hr(5,6,2,11);hr(17,6,2,11)}}
 // extras
 const mask=w.st==='fl'&&!F&&R()<.28,paint=!mask&&R()<.08,shades=!mask&&!paint&&R()<.08,band=!mask&&R()<.1&&hs!=='bald';
 if(mask){const mc=acc[0],tr=acc[0]==='#ffd23b'?'#ff3b4b':'#ffd23b';Rc(7,5,10,13,mc);Rc(6,7,12,9,mc);Rc(8,4,8,1,mc);Rc(11,4,2,6,tr);Rc(7,9,4,4,tr);Rc(13,9,4,4,tr);Rc(8,10,2,2,'#fff');Rc(14,10,2,2,'#fff');P(9,11,'#000');P(14,11,'#000');Rc(10,15,4,2,sk);Rc(10,16,4,1,'#7a2a22')}
 // face
 if(!mask){
  const eye=heel?'#000':'#1a1210';
  if(shades){Rc(8,10,8,2,'#000');Rc(8,10,3,1,'#3a3a5a');Rc(13,10,3,1,'#3a3a5a')}
  else{P(9,11,eye);P(14,11,eye);P(9,10,'#fff');P(14,10,'#fff');
   if(heel){Rc(8,9,3,1,hair==='#d8d4cc'?'#555':hair);Rc(13,9,3,1,hair==='#d8d4cc'?'#555':hair);P(10,10,'#000');P(13,10,'#000')}
   else{Rc(8,9,2,1,sd);Rc(14,9,2,1,sd)}}
  P(12,13,sd);
  const beard=!F&&R()<.5?pick(['full','goatee','stache','stubble']):null;const bc=hair==='#ff5ea8'||hair==='#3b8bff'?'#1a1210':hair;
  if(beard==='full'){Rc(7,14,10,4,bc);Rc(8,18,8,1,bc);Rc(10,15,4,1,'#7a2a22')}
  else if(beard==='goatee'){Rc(10,16,4,3,bc);Rc(9,14,6,1,bc);Rc(10,15,4,1,'#7a2a22')}
  else if(beard==='stache'){Rc(9,14,6,1,bc);Rc(10,15,4,1,'#7a2a22')}
  else{if(beard==='stubble'){c.globalAlpha=.35;Rc(7,14,10,4,bc);c.globalAlpha=1}
   if(heel){Rc(10,15,4,1,'#5a1a1a');P(14,14,'#5a1a1a')}else{Rc(10,15,4,1,'#b84a4a');P(9,14,'#b84a4a');P(14,14,'#b84a4a')}}
  if(paint){Rc(7,10,10,1,heel?'#fff':acc[0]);Rc(7,12,2,1,heel?'#fff':acc[0]);Rc(15,12,2,1,heel?'#fff':acc[0])}
  if(F&&!shades){P(8,11,'#1a1210');P(15,11,'#1a1210');P(10,15,'#d04a6a');P(13,15,'#d04a6a')}
 }
 if(band){Rc(7,7,10,1,acc[0]);P(6,8,acc[0]);P(5,9,acc[0])}
 // outline the figure so it pops on the background
 const d=c.getImageData(0,0,W,H),px=d.data,bgc=new Set();
 const isBg=(x,y)=>{const i=(y*W+x)*4;const r=px[i],g=px[i+1],b=px[i+2];return [bg[0],bg[1]].some(h=>{const v=parseInt(h.slice(1),16);return Math.abs(r-(v>>16))<8&&Math.abs(g-(v>>8&255))<8&&Math.abs(b-(v&255))<8})};
 const edge=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!isBg(x,y))continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const X=x+dx,Y=y+dy;return X>=0&&Y>=0&&X<W&&Y<H&&!isBg(X,Y)}))edge.push([x,y])}
 edge.forEach(([x,y])=>{if(y>4)P(x,y,'#0a0414')});
 stars.forEach(([x,y])=>{if(isBg(x,y))P(x,y,'rgba(255,255,255,.4)')});
 const url=cv.toDataURL();SPR.set(key,url);return url}
/* photos → pixel art: shrink to 30×40, cut the colours down, scale back up with hard edges */
function pxPhoto(id,src){if(PXP.has(id))return PXP.get(id);if(PXQ.has(id))return null;PXQ.add(id);
 const im=new Image();im.onload=()=>{try{const W=30,H=40,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
  const r=Math.max(W/im.width,H/im.height),dw=im.width*r,dh=im.height*r;c.imageSmoothingEnabled=true;c.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh);
  const d=c.getImageData(0,0,W,H),p=d.data;for(let i=0;i<p.length;i+=4){for(let k=0;k<3;k++){const v=Math.min(255,p[i+k]*1.08+6);p[i+k]=Math.round(v/36)*36}}
  c.putImageData(d,0,0);const url=cv.toDataURL();PXP.set(id,url);
  document.querySelectorAll(`img[data-pxs="${CSS.escape(id)}"]`).forEach(x=>{x.src=url;x.classList.remove('pxq')})}catch(e){PXP.set(id,src)}};
 im.onerror=()=>PXP.set(id,src);im.src=src;return null}
function r16Portrait(w){
 const src=R16PX&&(typeof IMG!=='undefined'&&IMG[w.id]||(typeof repoPhoto==='function'&&repoPhoto(w)));
 if(src){const px=pxPhoto(w.id,src);return px?`<img class="px" src="${px}" alt="">`:`<img class="px pxq" data-pxs="${esc(w.id)}" src="${src}" alt="">`}
 return `<img class="px spr" src="${sprite(w)}" alt="">`}
