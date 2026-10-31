/* Tony Khan Simulator — face-off cards for the promo and match showdowns (v261).
   Both wrestlers stay on stage side by side instead of the camera whipping between them. Whoever is acting lights up
   with a tag over their card: on the mic, on the attack (their card lunges at the other, who takes the hit), a miss
   (the card stumbles), or hurt. Everyone else dims. The classes travel with the HTML, so the party TV shows the same thing.
   Loaded after promoshow.js and matchshow.js. */
'use strict';
const FO_TAG={talk:'🎤 On the mic',move:'💥 On the attack',hit:'Taking it',miss:'❌ Missed it',hurt:'🩹 Hurt',act:''};
/* side: 'a' | 'b' | null (nobody — commentary, crowd) · role: talk | move | miss | hurt | act · lab: optional tag text */
function foPose(side,role,lab){const sd=document.getElementById('sd');if(!sd||!sd.classList.contains('duo'))return;
 const other=side==='a'?'b':side==='b'?'a':null;
 ['a','b'].forEach(k=>{const c=sd.querySelector('.sdc.c'+k);if(!c)return;const t=c.querySelector('.sdact');
  c.classList.remove('on','dim','talk','move','hit','miss','hurt','act');void c.offsetWidth;
  let r=null;if(side&&k===side)r=role;else if(k===other&&role==='move')r='hit';
  if(r){c.classList.add('on',r)}else if(side)c.classList.add('dim');
  if(t){const tx=r?(k===side&&lab?lab:FO_TAG[r]||''):'';t.textContent=tx;t.className='sdact'+(tx?' show '+r:'')}})}
const foTag='<span class="sdact"></span>';
Object.assign(window,{foPose,foTag});
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
@media (prefers-reduced-motion:reduce){html .sd.duo .sdc.sdc.sdc .sdph{animation:none!important;transition:none!important}}`;document.head.appendChild(c)})();
