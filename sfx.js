/* Tony Khan Simulator — sound effects (v258).
   Every sound is made in the browser except the crowd, which is real CC0 recordings from Freesound (sfx/, credits in the
   README). One switch and a volume in the Game menu; the party-night TV has its own mute in its header. On party night the
   phones stay quiet and the TV plays everything, so the room hears one set of sounds. Browsers only allow sound after a
   tap, so it wakes on the first tap anywhere (on the TV, the tap that puts the league on screen).
   Loaded after the rest of the game; hooks in by wrapping globals, plus a few direct calls in the showdowns and reveals. */
'use strict';
(function(){
let AC=null,M=null,VOL=.8;
function ac(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();M=AC.createGain();M.gain.value=VOL;const comp=AC.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;M.connect(comp);comp.connect(AC.destination)}if(AC.state==='suspended')AC.resume();return AC}
const now=()=>AC.currentTime+.02;
/* real crowd recordings (CC0, from Freesound — credits in the README) */
const CLIP={};let CLIPS=null;const CROWD_RATE=1,CHEER='cheer',BOO='boo';
function loadClips(){if(CLIPS)return CLIPS;CLIPS=Promise.all(['cheer','boo','applause'].map(async k=>{try{const r=await fetch('sfx/'+k+'.mp3');CLIP[k]=await AC.decodeAudioData(await r.arrayBuffer())}catch(e){console.warn('sound',k,e)}}));return CLIPS}
/* play a recording: fade in over att, out by the end; loops if asked for longer than the clip */
function sample(t,k,vol,o){o=o||{};const b=CLIP[k];if(!b)return;const src=AC.createBufferSource();src.buffer=b;const rt=(o.rate||1)*CROWD_RATE;src.playbackRate.setValueAtTime(rt*(o.from||1),t);if(o.from)src.playbackRate.linearRampToValueAtTime(rt,t+(o.glide||.8));
 const dur=o.dur||b.duration/rt;if(dur>b.duration/rt-.05){src.loop=true;src.loopStart=.3;src.loopEnd=b.duration-.1}
 const g=AC.createGain();const att=o.att||.02;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.setValueAtTime(vol,t+Math.max(att,dur-.6));g.gain.linearRampToValueAtTime(0,t+dur);
 src.connect(g);g.connect(M);src.start(t,o.offset||0);src.stop(t+dur+.05)}

/* ---------- building blocks ---------- */
function osc(t,f,dur,type,vol,f2){const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0004,t+dur);o.connect(g);g.connect(M);o.start(t);o.stop(t+dur+.05);return o}
function noiseBuf(sec){const b=AC.createBuffer(1,Math.ceil(AC.sampleRate*sec),AC.sampleRate),d=b.getChannelData(0);let p=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;p=.97*p+.03*w;d[i]=w*.5+p*3}return b}
function noise(t,dur,ftype,freq,q,vol,att,f2){const n=AC.createBufferSource();n.buffer=noiseBuf(dur+.1);const f=AC.createBiquadFilter();f.type=ftype;f.frequency.setValueAtTime(freq,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+dur);f.Q.value=q||1;
 const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(att||.005));g.gain.exponentialRampToValueAtTime(.0004,t+dur);n.connect(f);f.connect(g);g.connect(M);n.start(t);n.stop(t+dur+.1)}
function thud(t,f,dur,vol){osc(t,f*2.4,dur,'sine',vol,f)}
/* the ring bell: a struck tone with inharmonic partials */
function bell(t,base,vol,len){[[1,1],[2.76,.45],[5.4,.22],[8.9,.1]].forEach(([m,g])=>osc(t,base*m,m===1?(len||1.6):.7,'sine',(vol||.3)*g));noise(t,.03,'highpass',3000,1,.2)}
function chord(t,fs,dur,type,vol,gap){fs.forEach((f,i)=>osc(t+i*(gap||0),f,dur,type||'triangle',vol||.14))}
let NB=null;function nb(){if(!NB)NB=noiseBuf(4);return NB}
/* the arena's echo, for the synthesized crowd count */
let IR=null;function arenaIR(){if(IR&&IR.sampleRate===AC.sampleRate)return IR;const len=Math.floor(AC.sampleRate*2.2);IR=AC.createBuffer(2,len,AC.sampleRate);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<len;i++){const x=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-x,3.2)*(i<AC.sampleRate*.012?.2:1)}}return IR}
/* the room every crowd sound passes through: returns where to plug the voices in */
function arena(t,dur,o){o=o||{};const inp=AC.createGain();const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=o.hp||420;hp.Q.value=.6;
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;inp.connect(hp);hp.connect(lp);
 const dry=AC.createGain();dry.gain.value=o.dry||.45;const cv=AC.createConvolver();cv.buffer=arenaIR();const wet=AC.createGain();wet.gain.value=o.wet||.9;
 const mk=AC.createGain();mk.gain.value=4;mk.connect(M);lp.connect(dry);dry.connect(mk);lp.connect(cv);cv.connect(wet);wet.connect(mk);return inp}
function crowd(t,dur,vol,att,opt){opt=opt||{};vol=vol||.35;att=att||.12;const v=vol*1.5;
 if(opt.pitch&&opt.pitch<1){sample(t,BOO,v,{att,dur,rate:.97});return}
 sample(t,CHEER,v,{att,dur,rate:.96+Math.random()*.08,offset:att>.6?0:.15});
 if(opt.claps!==0)sample(t+.1,'applause',v*.55*((opt.claps||14)/18),{att:Math.max(.05,att),dur:Math.max(.6,dur-.1),rate:.98+Math.random()*.04})}
/* one pair of hands: a sharp crack with a couple of tiny echoes, like a real clap */
function clap(t,vol,dest){const n=AC.createBufferSource();n.buffer=nb();const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1000+Math.random()*1400;f.Q.value=.9;const g=AC.createGain();
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.001);g.gain.exponentialRampToValueAtTime(vol*.15,t+.008);g.gain.linearRampToValueAtTime(vol*.6,t+.011);g.gain.exponentialRampToValueAtTime(vol*.1,t+.019);g.gain.linearRampToValueAtTime(vol*.35,t+.022);g.gain.exponentialRampToValueAtTime(.0004,t+.07);
 n.connect(f);f.connect(g);g.connect(dest||M);n.start(t,Math.random()*3);n.stop(t+.08)}
/* the crowd counting along: real words. Each word is the shape of a voice saying it — vowel resonances moving from
   sound to sound (w→uh→n, t→oo, th→r→ee) plus the consonants as puffs of air — and a crowd of voices shouts it together,
   a little out of sync, through the arena. cut: stop partway through (the "THR—" when a near fall is kicked out). */
const WORDS={
 one:{len:.44,pts:[[0,300,650,2200,.25],[.07,600,1100,2450,1],[.26,640,1190,2400,1],[.32,300,1350,2450,.4],[.44,250,1400,2500,0]]},
 two:{len:.48,fr:[[0,.035,3800,.7,'highpass']],pts:[[.035,360,1500,2350,.15],[.08,330,1050,2300,1],[.38,300,920,2250,.8],[.48,300,900,2250,0]]},
 no:{len:.95,pts:[[0,250,1450,2500,.3],[.07,280,1350,2450,.5],[.13,620,1050,2550,1],[.6,600,1000,2500,.95],[.95,560,950,2450,0]]},
 three:{len:.6,fr:[[0,.1,5200,.4,'bandpass']],pts:[[.085,430,1100,1600,.12],[.13,400,1200,1700,.6],[.22,310,2100,2800,1],[.5,285,2300,2950,.85],[.6,280,2300,2950,0]]}};
function word(t,w,vol,dest,o){o=o||{};const W=WORDS[w],k=o.stretch||1,fs=o.fs||1,f0=o.f0||220,end=o.cut?Math.min(W.len,o.cut):W.len;
 const src=AC.createOscillator();src.type='sawtooth';if(o.rise){src.frequency.setValueAtTime(f0*.95,t);src.frequency.linearRampToValueAtTime(f0*1.4,t+W.len*k*.45);src.frequency.linearRampToValueAtTime(f0*1.3,t+W.len*k)}
 else{src.frequency.setValueAtTime(f0*.96,t);src.frequency.linearRampToValueAtTime(f0*1.06,t+W.len*k*.35);src.frequency.linearRampToValueAtTime(f0*.98,t+W.len*k)}
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4500;const vg=AC.createGain();vg.gain.value=.28;src.connect(lp);lp.connect(vg);
 const n=AC.createBufferSource();n.buffer=nb();const ng=AC.createGain();ng.gain.value=.75;n.connect(ng);
 const env=AC.createGain();env.gain.setValueAtTime(0,t);env.connect(dest);
 const bp=[0,1,2].map(i=>{const b=AC.createBiquadFilter();b.type='bandpass';b.Q.value=[5,9,12][i];const g=AC.createGain();g.gain.value=[1,.6,.35][i];vg.connect(b);ng.connect(b);b.connect(g);g.connect(env);return b});
 W.pts.forEach(([tm,a,b2,c,amp],i)=>{const at=t+tm*k;[a,b2,c].forEach((f,j)=>i===0?bp[j].frequency.setValueAtTime(f*fs,at):bp[j].frequency.linearRampToValueAtTime(f*fs,at));
  if(tm<=end)env.gain.linearRampToValueAtTime(amp*vol,at)});
 if(o.cut){env.gain.cancelScheduledValues(t+end*k);env.gain.setValueAtTime(vol*.8,t+end*k);env.gain.linearRampToValueAtTime(0,t+end*k+.04)}
 (W.fr||[]).forEach(([tm,d,f,amp,ty])=>{const x=AC.createBufferSource();x.buffer=nb();const fl=AC.createBiquadFilter();fl.type=ty;fl.frequency.value=f;fl.Q.value=.8;const g=AC.createGain();
  g.gain.setValueAtTime(0,t+tm*k);g.gain.linearRampToValueAtTime(amp*vol,t+tm*k+.006);g.gain.exponentialRampToValueAtTime(.0004,t+(tm+d)*k);x.connect(fl);fl.connect(g);g.connect(dest);x.start(t+tm*k,Math.random()*3);x.stop(t+(tm+d)*k+.05)});
 const stop=t+(o.cut?end+.06:W.len)*k+.05;src.start(t);src.stop(stop);n.start(t,Math.random()*3);n.stop(stop)}
function chant(t,w,vol,cut,x){x=x||{};const room=arena(t,.8,{hp:600,dry:.8,wet:.45});for(let i=0;i<16;i++){const f0=(x.rise?290:250)+Math.random()*180;
 word(t+Math.random()*.08,w,vol*.5*(.7+Math.random()*.5),room,{f0,fs:1.1+Math.random()*.15,stretch:.92+Math.random()*.2,cut,rise:x.rise})}}
/* the ref's hand on the mat: a sharp slap on the canvas and the hollow boom of the ring underneath */
function slap(t,vol){vol=vol||1;noise(t,.05,'highpass',900,.7,.75*vol,.002);noise(t,.09,'bandpass',420,1.2,.5*vol,.002);osc(t,150,.12,'sine',.45*vol,70);osc(t,62,.38,'sine',.4*vol,52)}
/* a knuckle on a wooden desk: a click, a woody body and a short ring */
function knock(t,vol){vol=vol||1;noise(t,.018,'bandpass',2400,2,.35*vol,.001);osc(t,240,.09,'sine',.55*vol,190);osc(t,610,.05,'triangle',.18*vol,520);noise(t,.07,'bandpass',300,6,.4*vol,.002)}
const N={C4:261.63,E4:329.63,G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5,Bb3:233.08,F4:349.23,D4:293.66};

/* ---------- the sounds ---------- */
const SND={
 /* party-night TV */
 bell2:t=>{bell(t,1180);bell(t+.32,1180)},
 yes:t=>{chord(t,[N.C5,N.E5,N.G5],.55,'triangle',.15,.06);osc(t+.18,N.C6,.7,'sine',.11)},
 no:t=>{osc(t,110,.42,'sawtooth',.08);osc(t,116,.42,'square',.045);thud(t,60,.35,.45)},
 door:t=>{thud(t,75,.4,.55);noise(t,.12,'lowpass',500,1,.3);thud(t+.09,55,.5,.35)},
 onair:t=>{noise(t,.5,'bandpass',400,2,.18,.4,3000);chord(t+.45,[N.A4,N.E5],.6,'square',.06);chord(t+.45,[N.A4*2],.6,'sine',.1)},
 picked:t=>{noise(t,.08,'lowpass',1800,1,.5);thud(t,110,.18,.5);osc(t+.04,N.G5,.25,'triangle',.12);osc(t+.1,N.C6,.35,'triangle',.1)},
 draft:t=>{knock(t,1);knock(t+.13,.85);bell(t+.42,1560,.16,.9)},
 draftB:t=>{noise(t,.45,'bandpass',500,1.5,.16,.35,3500);osc(t+.42,N.E5,.5,'triangle',.13);osc(t+.42,N.E5*2,.35,'sine',.05);osc(t+.62,N.A5,.9,'triangle',.13);osc(t+.62,N.A5*2,.5,'sine',.05)},
 star:(t,i)=>{const f=[N.C5,N.D5,N.E5,N.G5,N.A5][i||0];osc(t,f,.35,'triangle',.16);osc(t,f*2,.22,'sine',.06)},
 roundwin:t=>{crowd(t,1.8,.42,.12);chord(t+.05,[N.E5,N.G5,N.C6],.45,'triangle',.11,.05)},
 overtop:t=>{noise(t,.55,'bandpass',2200,1.4,.32,.05,250);thud(t+.5,48,.6,.75);noise(t+.5,.25,'lowpass',400,1,.35)},
 podium:t=>{const s=[N.C5,N.E5,N.G5,N.C6];s.forEach((f,i)=>{osc(t+i*.14,f,.5,'sawtooth',.05);osc(t+i*.14,f,.5,'triangle',.1)});chord(t+.6,[N.C5,N.E5,N.G5,N.C6],1.6,'sawtooth',.045);chord(t+.6,[N.C5,N.E5,N.G5,N.C6],1.6,'triangle',.08);crowd(t+.5,3,.38,.25)},
 newchamp:t=>{bell(t,1180,.32,.8);bell(t+.2,1180,.32,.8);bell(t+.4,1180,.32,1.4);chord(t+.75,[N.Bb3*2,N.D5,N.F4*2],.9,'sawtooth',.05,.0);chord(t+1.0,[N.C5,N.E5,N.G5,N.C6],1.5,'sawtooth',.05);chord(t+1.0,[N.C5,N.G5,N.C6],1.5,'triangle',.09);crowd(t+.85,3.4,.48,.1,{claps:18})},
 /* your live show */
 blip:t=>{for(let i=0;i<14;i++)if(i%3!==2)osc(t+i*.045,640+((i*37)%5)*28,.035,'square',.045)},
 hitbeat:t=>{noise(t,.18,'highpass',1200,1,.35);thud(t,140,.25,.6);osc(t+.02,N.A5,.18,'square',.05)},
 landed:t=>{osc(t,N.E5,.16,'triangle',.15);osc(t+.08,N.A5,.3,'triangle',.15);crowd(t+.05,1.3,.26,.1,{whistles:0})},
 missed:t=>{osc(t,220,.25,'triangle',.14,160);thud(t+.03,70,.22,.3)},
 /* the cover goes on, the crowd leans in, ONE… TWO… kickout! — the roar explodes */
 nearfall:t=>{crowd(t,1.9,.12,1.4,{claps:0});slap(t+.35);slap(t+1.2);
  noise(t+1.85,.22,'bandpass',700,1.2,.25,.01,2400);crowd(t+1.9,2.6,.5,.06,{claps:20,whistles:3})},
 /* a pinfall that ends it: one, two, three, and the bell */
 pinfall:t=>{crowd(t,2.6,.12,1.5,{claps:0});slap(t+.35);slap(t+1.2);slap(t+2.05,1.1);
  bell(t+2.45,1180,.3,.7);bell(t+2.67,1180,.3,.7);bell(t+2.89,1180,.3,1.4);crowd(t+2.15,3,.45,.08,{claps:16})},
 closebell:t=>{bell(t,1180,.3,.7);bell(t+.22,1180,.3,.7);bell(t+.44,1180,.3,1.4)},
 nearfallW:t=>{SND.nearfall(t);chant(t+.36,'one',.22);chant(t+1.21,'two',.3);chant(t+1.92,'three',.32,.12)},
 pinfallW:t=>{SND.pinfall(t);chant(t+.36,'one',.22);chant(t+1.21,'two',.3);chant(t+2.06,'three',.4)},
 /* the crowd's "NOOOO!" in stunned excitement: a bright, rising "no" with the cheer bursting in under it, starting high and settling */
 noo:t=>{chant(t,'no',.36,0,{rise:1});sample(t+.08,CHEER,1.45,{att:.12,dur:3.2,from:1.12,glide:.9})},
 /* a big kickout: ONE! TWO! NOOOO!, the crowd can't believe it wasn't three */
 nearfallN:t=>{crowd(t,1.9,.12,1.4,{claps:0});slap(t+.35);chant(t+.36,'one',.22);slap(t+1.2);chant(t+1.21,'two',.3);
  noise(t+1.85,.22,'bandpass',700,1.2,.2,.01,2400);SND.noo(t+1.9)},
 count:t=>{chant(t,'one',.5);chant(t+.85,'two',.6);chant(t+1.7,'three',.7)},
 pop:t=>{crowd(t,2.4,.5,.07,{claps:18,whistles:3})},
 swell:t=>{crowd(t,3.2,.42,1.6,{claps:10})},
 boo:t=>{crowd(t,2.4,.4,.25,{claps:0,whistles:0,pitch:.62})},
 /* solo reveal */
 tug:t=>{noise(t,.5,'bandpass',260,6,.35,.08,180);osc(t,70,.45,'sine',.18,55)},
 winner:t=>{chord(t,[N.G4,N.C5,N.E5],.25,'triangle',.12,.08);chord(t+.32,[N.C5,N.E5,N.G5,N.C6],1.3,'triangle',.11);chord(t+.32,[N.C5,N.G5],1.3,'sawtooth',.04)},
 /* menus */
 tap:t=>{osc(t,1900,.03,'sine',.08);noise(t,.012,'highpass',4000,1,.06)},
 confirm:t=>{osc(t,N.E5,.1,'triangle',.1);osc(t+.07,N.A5,.16,'triangle',.1)},
 signed:t=>{osc(t,N.C6,.12,'square',.04);osc(t+.08,N.E5*2,.4,'triangle',.11);for(let i=0;i<5;i++)osc(t+.12+i*.04,2400+i*300,.08,'sine',.03)},
 lockin:t=>{thud(t,95,.2,.6);noise(t,.05,'lowpass',2500,1,.4);noise(t+.07,.04,'highpass',2500,1,.25);osc(t+.16,N.G5,.35,'triangle',.1)},
 nope:t=>{osc(t,N.E4,.13,'triangle',.11);osc(t+.1,N.C4,.22,'triangle',.11)}};
/* ===================== the game's side ===================== */
const KEY='tksim_sfx',TVKEY='tksim_tvmute';
function prefs(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');return {on:!p||p.on!==false,vol:p&&p.vol!=null?+p.vol:.8}}catch(e){return {on:true,vol:.8}}}
function setPrefs(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}VOL=p.vol;if(M)M.gain.value=p.vol}
VOL=prefs().vol;
const isTV=()=>typeof TV!=='undefined'&&!!TV;
function tvMuted(){try{return localStorage.getItem(TVKEY)==='1'}catch(e){return false}}
function muted(){const p=prefs();if(!p.on)return true;if(isTV())return tvMuted();try{if(typeof partyOn==='function'&&partyOn())return true}catch(e){}return false}
let UNLOCKED=false;
function unlock(){if(!ac())return;UNLOCKED=true;loadClips()}
['pointerdown','keydown','touchend'].forEach(ev=>document.addEventListener(ev,()=>{try{if(!muted()||isTV())unlock()}catch(e){}},{capture:true,passive:true}));
/* big sounds don't stack: one new-champion fanfare or crowd pop at a time */
const GAP={newchamp:4500,podium:4000,roundwin:1400,pop:1500,overtop:1200,swell:2500,onair:2000,bell2:1500},LAST={};
function play(k,arg,delay){if(muted()||!UNLOCKED||!AC||AC.state!=='running'||!SND[k])return;if(GAP[k]){const t=Date.now()+(delay||0)*1000;if(LAST[k]&&t-LAST[k]<GAP[k])return;LAST[k]=t}if(window.SFX_LOG)SFX_LOG.push(k);try{SND[k](now()+(delay||0),arg)}catch(e){console.warn('sound',k,e)}}
/* stars landing one by one, in time with the fill animation (step = seconds between stars) */
function starRun(v,step,delay){const n=Math.ceil(Math.max(0,Math.min(5,+v||0))-.001);for(let i=0;i<n;i++)play('star',i,(delay||0)+.05+i*step)}
let BLIPT=0;function blip(){const t=Date.now();if(t-BLIPT<75)return;BLIPT=t;if(muted()||!UNLOCKED||!AC)return;try{osc(now(),600+Math.random()*90,.032,'square',.035)}catch(e){}}
/* near falls: the count stamps (1, 2), then the call — a kickout that lands is the crowd's NOOOO!, one that misses is three */
let CNT=null,THREE=0;
function countHit(n){CNT={n,at:Date.now()};if(muted()||!UNLOCKED||!AC)return;if(window.SFX_LOG)SFX_LOG.push('count'+n);const t=now();try{slap(t);const w={1:'one',2:'two'}[n];if(w)chant(t+.01,w,n==='1'?.22:.3);else if(n==='9'||n==='8')SND.swell(t)}catch(e){}}
function three(){THREE=Date.now();CNT=null;if(muted()||!UNLOCKED||!AC)return;if(window.SFX_LOG)SFX_LOG.push('three');const t=now();try{slap(t,1.1);chant(t+.01,'three',.4);bell(t+.4,1180,.3,.7);bell(t+.62,1180,.3,.7);bell(t+.84,1180,.3,1.4);crowd(t+.1,3,.45,.08,{claps:16})}catch(e){}}
function stamp(text,cls,kind){text=String(text||'').trim();
 if(cls&&/count/.test(cls))return countHit(text);
 if(CNT&&Date.now()-CNT.at<90000&&kind!=='promo'){CNT=null;if(/ok/.test(cls))return play('noo');return three()}
 if(/\bok\b/.test(cls))return play(kind==='promo'?'hitbeat':'landed');if(/\bno\b/.test(cls))return play('missed')}
function matchEnd(){if(Date.now()-THREE<20000)return;play('closebell');play('pop',null,.5)}
/* nothing a sound does may ever break the game */
const safe=f=>function(){try{return f.apply(this,arguments)}catch(e){console.warn('sound',e)}};
window.SFX={play:safe(play),stars:safe(starRun),blip:safe(blip),stamp:safe(stamp),three:safe(three),matchEnd:safe(matchEnd),muted:safe(muted),unlock:safe(unlock),
 on:()=>prefs().on,set(on,vol){const p=prefs();if(on!=null)p.on=!!on;if(vol!=null)p.vol=Math.max(0,Math.min(1,+vol));setPrefs(p);if(p.on)unlock()},
 tvMuted,tvToggle(){/* the first tap only wakes the sound up; after that it switches it off and on */
  if(!(UNLOCKED&&AC&&AC.state==='running')&&!tvMuted()){unlock();setTimeout(()=>{play('bell2');try{render()}catch(e){}},150);return}
  try{localStorage.setItem(TVKEY,tvMuted()?'0':'1')}catch(e){}unlock();if(!tvMuted())setTimeout(()=>play('bell2'),150);try{render()}catch(e){}},
 ready:()=>UNLOCKED&&!!AC&&AC.state==='running'};
/* the Game menu card */
window.sfxCard=function(){const p=prefs();return `<div class="card"><div class="row sb"><div class="h small" style="margin:0">🔊 Sound effects</div><div class="chips" style="margin:0"><button class="chip ${p.on?'on':''}" onclick="SFX.set(true);SFX.play('confirm');render()">On</button><button class="chip ${p.on?'':'on'}" onclick="SFX.set(false);render()">Off</button></div></div>
 ${p.on?`<label class="muted tiny" for="sfxVol" style="display:block;margin-top:10px">Volume</label><input id="sfxVol" type="range" min="0" max="100" value="${Math.round(p.vol*100)}" style="width:100%;accent-color:var(--gold)" oninput="SFX.set(null,this.value/100)" onchange="SFX.play('bell2')">`:''}
 <p class="muted tiny" style="margin:8px 0 0">The ring bell, the crowd, star reveals and your calls landing. On party night your phone stays quiet and the TV plays them for the room.</p></div>`};

/* ===================== hooks ===================== */
const wrap=(name,fn)=>{const f0=window[name];if(typeof f0!=='function')return;const w=function(){return fn(f0,this,arguments)};window[name]=w};
/* menus: a soft tap on buttons, a confirm on decisions, the lock-in thud, a "can't do that" when something's blocked */
document.addEventListener('click',e=>{if(isTV())return;const b=e.target&&e.target.closest&&e.target.closest('button,.chip,.choice,.tile,.slot');if(b&&!b.disabled)play('tap')},true);
['pitchChoose','crisisChoose','saveCreate','saveTeam'].forEach(n=>wrap(n,(f,t,a)=>{const out=f.apply(t,a);play('confirm');return out}));
['partyLockCard','mpLockCard','simLockCard'].forEach(n=>wrap(n,(f,t,a)=>{const out=f.apply(t,a);play('lockin');return out}));
wrap('mpLocked',(f,t,a)=>{const out=f.apply(t,a);if(out)play('nope');return out});
['sign','callUp'].forEach(n=>wrap(n,(f,t,a)=>{const id=a[0];const was=S&&S.w[id]&&S.w[id].own;const out=f.apply(t,a);try{if(S.w[id]&&S.w[id].own==='p'&&was!=='p')play('signed')}catch(e){}return out}));
wrap('farmSign',(f,t,a)=>{const out=f.apply(t,a);play('signed');return out});
/* your own show going live */
wrap('goLive',(f,t,a)=>{const was=typeof LIVE!=='undefined'&&LIVE;const out=f.apply(t,a);try{if(!was&&LIVE)play('onair')}catch(e){}return out});
/* the solo star reveal: the knot moving, a title changing hands, the win */
wrap('srRope',(f,t,a)=>{const out=f.apply(t,a);if(a[2])play('tug');return out});
let SR_INST=false;
const TRX=/(NEW|INAUGURAL) .+? CHAMPIONS?:/;
wrap('srDone',(f,t,a)=>{const it=a[0];const was=it&&it.ok;const out=f.apply(t,a);try{if(it&&!was&&!SR_INST&&(it.s.notes||[]).some(n=>TRX.test(n)))play('newchamp',null,.4)}catch(e){}return out});
wrap('srFinal',(f,t,a)=>{SR_INST=!!a[0];let out;try{out=f.apply(t,a)}finally{SR_INST=false}try{if(!a[0]&&typeof srNight==='function'&&SRV&&srNight(SRV.o)==='p')play('winner',null,.3)}catch(e){}return out});
/* the party-night TV reveal: stars, a title changing hands, the winner on the podium */
wrap('tvRevealShow',(f,t,a)=>{const st=a[0],inst=a[1];const out=f.apply(t,a);try{if(!inst&&st){const el=document.getElementById(st.id);
  if(el&&el.dataset.st!=null){starRun(+el.dataset.st,.24,.1);if([...el.querySelectorAll('.note')].some(n=>TRX.test(n.textContent)))play('newchamp',null,1.4)}
  if(st.final&&!document.querySelector('#rv.ry'))play('podium',null,.2)}}catch(e){}return out});
wrap('ryStage',(f,t,a)=>{const out=f.apply(t,a);if(a[0]==='podium')play('podium',null,.2);return out});
/* the TV following the league: the draft, a GM going live, and the live GM's calls as they're mirrored to the screen */
let TV_LAST={pick:null,live:null,stamp:'',picked:'',res:''};
wrap('tvIncoming',(f,t,a)=>{const out=f.apply(t,a);try{if(!isTV()||!S)return out;
  const pick=S.phase==='draft'&&S.draft?S.draft.last+'@'+(S.draft.log||[]).length:null;if(pick&&TV_LAST.pick&&pick!==TV_LAST.pick)play('draftB');TV_LAST.pick=pick;
  const live=S.online&&S.online.live&&typeof partyLiveNow==='function'?partyLiveNow():null;if(live&&live!==TV_LAST.live)play('onair');TV_LAST.live=live;
  const h=TV.feed&&TV.feed.html||'';
  const pk=(h.match(/class="tv-picked"[\s\S]{0,400}?<\/span><\/span>/)||[''])[0]||((/\bchoice picked\b/.test(h))?h.length+':'+(h.match(/choice picked[\s\S]{0,160}/)||[''])[0]:'');
  if(pk&&pk!==TV_LAST.picked){if(/class="tv-picked"/.test(pk)&&/three/i.test(pk)&&/Stay down/i.test(pk))three();else if(/\bchoice picked\b/.test(h))play('picked')}TV_LAST.picked=pk;
  const sm=h.match(/<div class="sdstamp ([^"]+)">([^<]*)<\/div>/);const sk=sm?sm[1]+'|'+sm[2]:'';
  if(sk&&sk!==TV_LAST.stamp)stamp(sm[2],sm[1],/class="sdw msw/.test(h)?'match':'promo');TV_LAST.stamp=sk;
  const res=/class="msres"/.test(h)?h.length+'':'';if(res&&!TV_LAST.res)matchEnd();TV_LAST.res=res}catch(e){console.warn(e)}return out});
})();
