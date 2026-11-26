/* v506: PPV reveals. Each pay-per-view's reveal gets its own stage, styled after the real show's look: Royal Rumble's
   entrant numbers, Revolution's neon hexagon and grid, WrestleMania's marquee, Double or Nothing's felt, neon and hanging
   casino chip, Money in the Bank's ladders and briefcase, All In's stadium lights, SummerSlam's sunset, All Out's
   Chicago stripes and stars, Full Gear's desert sunset and gold-rimmed gear, Survivor Series' WarGames cage.
   Only the stage changes: the fonts, plates, chart lines and straight edges stay the game's own. Picked by the show's
   name (o.title), so a PPV that isn't listed keeps the standard reveal. Static; nothing here animates. */
(function(){
const PX_BASE=`
#modal[class*="px-"] .sheet{position:relative;isolation:isolate}
#modal[class*="px-"] .pxd{position:absolute;left:0;right:0;top:0;height:330px;z-index:-1;pointer-events:none;overflow:hidden}
#modal[class*="px-"] .sr-top{position:relative;margin:6px 0 14px}
#modal[class*="px-"] .sr-title{font-size:40px;line-height:.95;letter-spacing:-.01em;margin-top:12px}
#modal[class*="px-"] .pxtag{margin-top:8px;font:700 11px/1.2 'BC',sans-serif;letter-spacing:.22em;text-transform:uppercase}
#modal[class*="px-"] .qhchart,#modal[class*="px-"] .qht{background:rgba(10,10,12,.95)}
#modal[class*="px-"] .twh{background:rgba(12,12,14,.7)}
`;
const PX_T={
rumble:{name:'Royal Rumble',wk:4,css:`
.px-rumble .sheet{background:linear-gradient(180deg,#0a1628 0,#08101c 400px,#0b0c10 100%)}
.px-rumble .pxd{background:repeating-linear-gradient(180deg,transparent 0 92px,rgba(255,255,255,.07) 92px 94px,transparent 94px 110px,rgba(198,40,40,.18) 110px 112px,transparent 112px 128px,rgba(255,255,255,.07) 128px 130px)}
.px-rumble .pxd .clk{position:absolute;left:-10px;right:-10px;top:26px;display:flex;justify-content:space-between;font:900 italic 64px/1 'BC',sans-serif;color:rgba(143,184,255,.06);white-space:nowrap}
.px-rumble .sr-title{color:#fff;text-shadow:0 0 22px rgba(143,184,255,.55)}
.px-rumble .pxtag{color:#8fb8ff}
.px-rumble .livebug b{background:#8fb8ff;color:#08101e}
.px-rumble .pxx{display:inline-flex;align-items:stretch;margin-top:10px;box-shadow:0 0 0 1px #2c4a78;background:#050a14}
.px-rumble .pxx b{display:flex;align-items:center;padding:4px 9px;background:#8fb8ff;color:#08101e;font:900 italic 20px/1 'BC',sans-serif}
.px-rumble .pxx span{display:flex;align-items:center;padding:0 9px;font:700 10px 'BC',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#9fb6da}
.px-rumble .pxx i{display:flex;align-items:center;padding:0 10px;font:900 italic 22px/1 'BC',sans-serif;color:#ff5a4e;font-style:italic;letter-spacing:.02em;border-left:1px solid #2c4a78}
.px-rumble .qhchart{box-shadow:inset 0 0 0 1px #24406a}
.px-rumble .twrd b,.px-rumble .twnext{color:#cfe0ff}
.px-rumble .winban.w{background:linear-gradient(180deg,#e9f1ff,#8fb8ff);color:#08101e}`,
 deco:`<div class="clk"><span>26</span><span>27</span><span>28</span><span>30</span></div>`,after:`<div class="pxx"><b>#29</b><span>Next entrant</span><i>0:10</i></div>`},
revolution:{name:'Revolution',wk:8,css:`
.px-revolution .sheet{background:radial-gradient(ellipse 90% 300px at 50% 150px,#3a1066 0,#1a0838 55%,#0c0618 100%) no-repeat,#0b0a10}
.px-revolution .pxd{top:0;bottom:0;height:auto}
.px-revolution .pxd .dots{position:absolute;left:0;right:0;top:0;height:200px;background:radial-gradient(circle,rgba(226,92,255,.55) 1.1px,transparent 1.6px) 0 0/9px 9px;-webkit-mask:radial-gradient(ellipse 60% 55% at 50% 45%,transparent 30%,#000 75%);mask:radial-gradient(ellipse 60% 55% at 50% 45%,transparent 30%,#000 75%);opacity:.7}
.px-revolution .pxd .dots{-webkit-mask:linear-gradient(90deg,#000,transparent 30%,transparent 70%,#000);mask:linear-gradient(90deg,#000,transparent 30%,transparent 70%,#000)}
.px-revolution .pxd .hex{position:absolute;left:50%;top:6px;width:150px;height:150px;margin-left:-75px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:#d64dff;box-shadow:0 0 20px #d64dff}
.px-revolution .pxd .hex::after{content:"";position:absolute;inset:3px;clip-path:inherit;background:radial-gradient(circle,#2a0b52,#14062a)}
.px-revolution .pxd .hx2{position:absolute;left:-20px;right:-20px;top:0;height:170px;clip-path:polygon(10% 0,90% 0,100% 50%,90% 100%,10% 100%,0 50%);background:linear-gradient(90deg,#ffb23e,#38d6ff 30%,#ff4fd8 50%,#38d6ff 70%,#ffb23e);opacity:.85}
.px-revolution .pxd .hx2::after{content:"";position:absolute;inset:2px 3px;clip-path:inherit;background:transparent;background:linear-gradient(180deg,#1a0838,#12062a)}
.px-revolution .grid{position:fixed;left:-20%;right:-20%;bottom:-20px;height:170px;background:repeating-linear-gradient(90deg,rgba(214,77,255,.55) 0 1px,transparent 1px 34px),repeating-linear-gradient(180deg,rgba(214,77,255,.55) 0 1px,transparent 1px 16px);transform:perspective(160px) rotateX(55deg);transform-origin:50% 0;-webkit-mask:linear-gradient(180deg,#000,transparent 85%);mask:linear-gradient(180deg,#000,transparent 85%)}
.px-revolution .sr-ctl,.px-revolution .twfoot{position:relative;z-index:1}
.px-revolution .grid::before{content:"";position:absolute;left:0;right:0;top:-2px;height:3px;background:#f07cff;box-shadow:0 0 14px 4px rgba(240,124,255,.7)}
.px-revolution .sr-title{position:relative;z-index:1;font-size:46px;color:#ffd21f;background:linear-gradient(180deg,#fff27a,#ffd21f 45%,#e8a10c);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(2px 3px 0 #7a3d00) drop-shadow(0 0 14px rgba(255,190,40,.45));letter-spacing:.01em}
.px-revolution .livebug b{background:#ffd21f;color:#2a0b52}
.px-revolution .qhcap span,.px-revolution .twrd b,.px-revolution .twnext{color:#ffe27a}
.px-revolution .qhchart{box-shadow:inset 0 0 0 1px #4a2378}
.px-revolution .winban.w{background:linear-gradient(180deg,#fff27a,#ffd21f 55%,#e8a10c);color:#2a0b52;box-shadow:0 0 24px rgba(214,77,255,.6)}`,
 deco:'<div class="hx2"></div><div class="dots"></div><div class="grid"></div><div class="hex"></div>'},
mania:{name:'WrestleMania',wk:12,css:`
.px-mania .sheet{background:linear-gradient(180deg,#1b0f33 0,#0e0918 420px,#0b0a0e 100%)}
.px-mania .pxd{background:repeating-conic-gradient(from 0deg at 50% 120px,rgba(245,207,104,.07) 0 4deg,transparent 4deg 12deg);-webkit-mask:radial-gradient(circle at 50% 120px,#000 10%,transparent 70%);mask:radial-gradient(circle at 50% 120px,#000 10%,transparent 70%)}
.px-mania .sr-title{display:table;margin:14px auto 0;padding:14px 20px 10px;color:#f5cf68;background:#140a24;
 box-shadow:0 0 0 2px #f5cf68,0 0 30px rgba(245,207,104,.35);
 background-image:radial-gradient(circle,#ffe9a8 2px,transparent 2.6px),radial-gradient(circle,#ffe9a8 2px,transparent 2.6px);background-size:12px 12px;background-position:0 0,0 100%;background-repeat:repeat-x}
.px-mania .pxtag{color:#d9c3ff}
.px-mania .livebug b{background:#f5cf68;color:#1b0f33}
.px-mania .qhchart{box-shadow:inset 0 0 0 1px #3a2a5e}
.px-mania .winban.w{background:linear-gradient(180deg,#fff1c0,#f5cf68 55%,#b8862a);color:#1b0f33;box-shadow:0 0 28px rgba(245,207,104,.5)}`,deco:''},
don:{name:'Double or Nothing',wk:16,css:`
.px-don .sheet{background:radial-gradient(ellipse 120% 380px at 50% 60px,#145236 0,#0b2b1d 55%,#0a0f0c 100%) no-repeat,#0b0c0d}
.px-don .pxd::before{content:"";position:absolute;left:0;right:0;top:0;height:8px;background:repeating-linear-gradient(90deg,#f5cf68 0 18px,#0b2b1d 18px 24px,#c8302a 24px 42px,#0b2b1d 42px 48px)}
.px-don .pxd .chip{position:absolute;left:50%;top:44px;width:230px;height:230px;margin-left:-115px;border-radius:50%;opacity:.16;
 background:radial-gradient(circle,#0b2b1d 0 44%,transparent 44.5%),repeating-conic-gradient(#f5cf68 0 15deg,#c8302a 15deg 30deg);
 -webkit-mask:radial-gradient(circle,transparent 0 30%,#000 30.5% 50%,transparent 50.5%);mask:radial-gradient(circle,transparent 0 30%,#000 30.5% 50%,transparent 50.5%)}
.px-don .pxd .chip::after{content:"";position:absolute;left:50%;top:-44px;width:2px;height:44px;margin-left:-1px;background:rgba(245,207,104,.6)}
.px-don .sr-title{color:#fff5d6;text-shadow:0 0 2px #fff,0 0 8px #ffcf5a,0 0 18px #ff9a2e,0 0 34px rgba(255,90,140,.6)}
.px-don .pxtag{color:#e8f3ec}
.px-don .livebug b{background:#f5cf68;color:#0b2b1d}
.px-don .qhchart{box-shadow:inset 0 0 0 1px #1f5a3e}
.px-don .winban.w::after{content:'  ×2';color:#0b2b1d}
.px-don .winban.w{background:#f5cf68;color:#0b2b1d}
.px-don .winban.l{background:#141414;color:#e8f3ec;box-shadow:inset 0 0 0 2px #c8302a}`,deco:'<div class="chip"></div>'},
mitb:{name:'Money in the Bank',wk:20,css:`
.px-mitb .sheet{background:linear-gradient(180deg,#0f2417 0,#0b120e 400px,#0b0c0d)}
.px-mitb .pxd::before,.px-mitb .pxd::after{content:"";position:absolute;top:0;bottom:0;width:22px;border-left:3px solid #3c6b4a;border-right:3px solid #3c6b4a;background:repeating-linear-gradient(180deg,transparent 0 30px,#3c6b4a 30px 34px);-webkit-mask:linear-gradient(180deg,#000 50%,transparent);mask:linear-gradient(180deg,#000 50%,transparent)}
.px-mitb .pxd::before{left:-6px}.px-mitb .pxd::after{right:-6px}
.px-mitb .pxd .case{position:absolute;right:34px;top:0;width:2px;height:24px;background:#9aa;}
.px-mitb .pxd .case i{position:absolute;left:-17px;top:24px;width:36px;height:26px;background:linear-gradient(180deg,#8fe09d,#4f9e5d);box-shadow:inset 0 0 0 2px #2c5a36}
.px-mitb .pxd .case i::before{content:"";position:absolute;left:11px;top:-6px;width:10px;height:6px;border:2px solid #8fe09d;border-bottom:0}
.px-mitb .pxd .case i::after{content:"";position:absolute;left:0;right:0;top:11px;height:2px;background:#f5cf68}
.px-mitb .sr-title{color:#e9f5ec;text-shadow:0 0 20px rgba(127,207,143,.35)}
.px-mitb .pxtag{color:#7fcf8f}
.px-mitb .livebug b{background:#7fcf8f;color:#0f2417}
.px-mitb .winban.w{background:linear-gradient(180deg,#a9efb4,#7fcf8f);color:#0f2417}`,deco:'<div class="case"><i></i></div>'},
allin:{name:'All In',wk:24,css:`
.px-allin .sheet{background:linear-gradient(180deg,#05081a 0,#090b16 420px,#0a0a0d)}
.px-allin .pxd{height:420px;background:
 conic-gradient(from 150deg at 0 0,transparent 0deg,rgba(220,230,255,.16) 8deg,transparent 20deg) ,
 conic-gradient(from 190deg at 100% 0,transparent 0deg,rgba(220,230,255,.16) 12deg,transparent 24deg),
 conic-gradient(from 168deg at 30% 0,transparent 0deg,rgba(220,230,255,.08) 6deg,transparent 14deg),
 conic-gradient(from 176deg at 70% 0,transparent 0deg,rgba(220,230,255,.08) 8deg,transparent 16deg)}
.px-allin .pxd .lt{position:absolute;top:-6px;display:flex;gap:3px}.px-allin .pxd .lt i{width:7px;height:7px;background:#fff;box-shadow:0 0 12px 3px rgba(220,230,255,.8)}
.px-allin .pxd .crowd{position:absolute;left:0;right:0;top:250px;height:60px;background:radial-gradient(circle at 3px 3px,rgba(255,250,220,.55) 1px,transparent 1.6px) 0 0/11px 9px,radial-gradient(circle at 7px 6px,rgba(255,250,220,.3) .8px,transparent 1.4px) 0 0/13px 11px;-webkit-mask:linear-gradient(180deg,transparent,#000 40%,transparent);mask:linear-gradient(180deg,transparent,#000 40%,transparent)}
.px-allin .sr-title{font-size:58px;color:#fff;letter-spacing:.01em;text-shadow:0 0 30px rgba(200,215,255,.5)}
.px-allin .pxtag{color:#b9c6ef}
.px-allin .livebug b{background:#fff;color:#05081a}
.px-allin .qhchart{box-shadow:inset 0 0 0 1px #1c2550}
.px-allin .winban.w{background:#fff;color:#05081a;box-shadow:0 0 30px rgba(220,230,255,.45)}`,
 deco:`<div class="lt" style="left:6px"><i></i><i></i><i></i></div><div class="lt" style="right:6px"><i></i><i></i><i></i></div><div class="crowd"></div>`},
slam:{name:'SummerSlam',wk:28,css:`
.px-slam .sheet{background:linear-gradient(180deg,#ff8a3d 0,#d23d6a 150px,#3a1440 300px,#120c14 420px,#0b0a0d)}
.px-slam .pxd .sun{position:absolute;left:50%;top:40px;width:220px;height:220px;margin-left:-110px;border-radius:50%;background:linear-gradient(180deg,#ffe27a,#ff9a3d);-webkit-mask:repeating-linear-gradient(180deg,#000 0 14px,transparent 14px 20px);mask:repeating-linear-gradient(180deg,#000 0 14px,transparent 14px 20px);opacity:.55}
.px-slam .sr-title{color:#fff6e0;text-shadow:3px 3px 0 #3a1440}
.px-slam .pxtag{color:#fff0d6}
.px-slam .livebug b{background:#3a1440;color:#ffe27a}
.px-slam .qhcap span{color:#fff6e0}.px-slam .qhcap em{color:#ffd9c4}
.px-slam .winban.w{background:linear-gradient(180deg,#ffe27a,#ff8a3d);color:#3a1440}`,deco:'<div class="sun"></div>'},
allout:{name:'All Out',wk:32,css:`
.px-allout .sheet{background:linear-gradient(180deg,#10161c 0,#0b0d10 420px,#0b0b0c)}
.px-allout .pxd .flag{position:absolute;left:0;right:0;top:0;height:46px;background:linear-gradient(180deg,transparent 0 6px,#7fc4ec 6px 13px,transparent 13px 33px,#7fc4ec 33px 40px,transparent 40px)}
.px-allout .pxd .flag b{position:absolute;left:0;right:0;top:15px;display:flex;justify-content:center;gap:34px;color:#e8362a;font:16px/1 sans-serif}
.px-allout .sr-title{color:#fff;font-size:52px}
.px-allout .sr-title::after{content:"";display:block;margin:8px auto 0;width:120px;height:4px;background:linear-gradient(90deg,#7fc4ec 0 40%,#e8362a 40% 60%,#7fc4ec 60%)}
.px-allout .pxtag{color:#a9d8f2}
.px-allout .livebug b{background:#e8362a;color:#fff}
.px-allout .qhchart{box-shadow:inset 0 0 0 1px #24384a}
.px-allout .winban.w{background:#fff;color:#111;box-shadow:inset 0 -4px 0 #7fc4ec}`,deco:'<div class="flag"><b><span>✶</span><span>✶</span><span>✶</span><span>✶</span></b></div>'},
gear:{name:'Full Gear',wk:36,css:`
.px-gear .sheet{background:linear-gradient(180deg,#2a1830 0,#6a2420 34px,#c4471f 72px,#f08a38 100px,#f6b85c 114px,#9a5226 126px,#5a3018 160px,#24160c 240px,#120c08 100%)}
.px-gear .pxd{height:250px;-webkit-mask:linear-gradient(180deg,#000 70%,transparent);mask:linear-gradient(180deg,#000 70%,transparent)}
.px-gear .pxd .mesa{position:absolute;right:-10px;top:52px;width:160px;height:76px;background:linear-gradient(180deg,#c2602c,#6e3418);clip-path:polygon(0 100%,8% 62%,22% 58%,30% 30%,46% 26%,52% 8%,70% 6%,76% 28%,88% 34%,100% 60%,100% 100%);opacity:.9}
.px-gear .pxd .dust{position:absolute;left:-20%;right:-20%;top:104px;height:100px;background:radial-gradient(ellipse at 50% 30%,rgba(210,140,80,.35),transparent 65%)}
.px-gear .cog{position:absolute;width:var(--d);height:var(--d);border-radius:50%;background:radial-gradient(circle,transparent 0 17%,var(--c) 17.5% 39%,rgba(0,0,0,.25) 39.5% 41%,transparent 41.5%)}
.px-gear .cog::before{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(var(--c) 0 11deg,transparent 11deg 22.5deg);-webkit-mask:radial-gradient(circle,transparent 0 38%,#000 38.5% 50%,transparent 50.5%);mask:radial-gradient(circle,transparent 0 38%,#000 38.5% 50%,transparent 50.5%)}
.px-gear .cog.big::after{content:"";position:absolute;inset:9%;border-radius:50%;box-shadow:0 0 0 2px #d9a63c,inset 0 0 0 2px #d9a63c,inset 0 0 22px rgba(0,0,0,.6)}
.px-gear .cog.big{filter:drop-shadow(0 0 1.5px #d9a63c)}
.px-gear .sr-title{position:relative;z-index:1;font-size:48px;background:linear-gradient(180deg,#ffffff,#d4d7dd 48%,#9aa0a9 52%,#e9ebef);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #b8862a) drop-shadow(0 0 10px rgba(0,0,0,.75))}
.px-gear .sr-title::after{content:"";display:block;margin:6px auto 0;width:150px;height:5px;background:linear-gradient(90deg,#8a5a1c,#ffd84a 50%,#8a5a1c)}
.px-gear .livebug b{background:#ffd84a;color:#1a120b}
.px-gear .qhcap span,.px-gear .twrd b{color:#f2d79a}
.px-gear .qhchart,.px-gear .qht{box-shadow:inset 0 0 0 1px #5a3c22}
.px-gear .winban.w{background:linear-gradient(180deg,#fff3b0,#ffd84a 50%,#c08a22);color:#1a120b}`,deco:`<div class="mesa"></div><div class="dust"></div><i class="cog" style="left:-46px;top:58px;--d:120px;--c:#7a4422;opacity:0.85"></i><i class="cog" style="left:338px;top:96px;--d:80px;--c:#6a3a1c;opacity:0.75"></i><i class="cog big" style="left:110px;top:-8px;--d:170px;--c:#2c2a2b;opacity:1"></i>`},
survivor:{name:'Survivor Series',wk:40,css:`
.px-survivor .sheet{background:linear-gradient(180deg,#16181b 0,#0c0d0f 420px,#0a0a0b)}
.px-survivor .pxd{height:360px;background:repeating-linear-gradient(90deg,transparent 0 17px,rgba(205,210,218,.16) 17px 19px),repeating-linear-gradient(45deg,transparent 0 9px,rgba(205,210,218,.07) 9px 10px),repeating-linear-gradient(-45deg,transparent 0 9px,rgba(205,210,218,.07) 9px 10px);-webkit-mask:linear-gradient(180deg,#000 30%,transparent);mask:linear-gradient(180deg,#000 30%,transparent)}
.px-survivor .pxd::after{content:"";position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(180deg,#c9ced6,#6b7079)}
.px-survivor .sr-title{background:linear-gradient(180deg,#ffffff,#aeb4bd 52%,#eef0f3 53%,#8b9099);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 #000)}
.px-survivor .pxtag{color:#c9ced6}
.px-survivor .livebug b{background:#c9ced6;color:#111}
.px-survivor .qhchart,.px-survivor .qht{box-shadow:inset 0 0 0 1px #3a3e45}
.px-survivor .winban.w{background:linear-gradient(180deg,#fff,#aeb4bd);color:#111}`,deco:''},
};
const PX_KEY={};Object.keys(PX_T).forEach(k=>PX_KEY[PX_T[k].name.toLowerCase()]=k);
/* every rule only applies under the themed modal; .sheet backgrounds win over the base sheet style */
const css=(PX_BASE+Object.values(PX_T).map(x=>x.css).join('\n')).replace(/(\.sheet\{background:[^}]*)\}/g,'$1 !important}').replace(/(^|\n|,)\s*(\.px-|#modal\[)/g,(m,a,b)=>a+'html '+(b==='.px-'?'#modal.px-':b));
const st=document.createElement('style');st.id='pxcss';st.textContent=css+`
html #modal[class*="px-"] .srv .pxfl{position:absolute;left:-16px;right:-16px;bottom:-24px;height:170px;z-index:-1;pointer-events:none;overflow:hidden}
html #modal[class*="px-"] .srv .pxfl .grid{position:absolute!important;left:-20%!important;right:-20%!important;top:auto!important;bottom:-20px!important}
@media (min-width:700px){html #modal[class*="px-"] .sr-title{font-size:46px}}`;document.head.appendChild(st);
function pxClear(){const m=document.getElementById('modal');if(!m)return;m.className=m.className.replace(/\bpx-\S+/g,'').replace(/\s+/g,' ').trim();m.querySelectorAll('.pxd,.pxfl').forEach(e=>e.remove())}
/* the theme for a reveal: its show's name, PPVs only */
function pxKey(o){if(!o||!o.ppv)return null;const n=String(o.title||'').toLowerCase();const k=Object.keys(PX_KEY).find(k=>n===k||n.startsWith(k));return k?PX_KEY[k]:null}
function pxApply(o){pxClear();const k=pxKey(o);if(!k)return;const t=PX_T[k],m=document.getElementById('modal');const sh=m&&m.querySelector('.sheet');const v=document.getElementById('srv');if(!sh||!v)return;
 m.classList.add('px-'+k);
 /* the floor grid (Revolution) sits at the bottom of the reveal; everything else is behind the header */
 const tmp=document.createElement('div');tmp.innerHTML=t.deco||'';const g=tmp.querySelector('.grid');if(g){g.remove();const f=document.createElement('div');f.className='pxfl';f.appendChild(g);v.appendChild(f)}
 const d=document.createElement('div');d.className='pxd';d.innerHTML=tmp.innerHTML;sh.insertBefore(d,sh.firstChild)}
if(typeof openModal==='function'){const o0=openModal;openModal=window.openModal=function(){pxClear();return o0.apply(this,arguments)}}
if(typeof closeModal==='function'){const c0=closeModal;closeModal=window.closeModal=function(){pxClear();return c0.apply(this,arguments)}}
if(typeof srStage==='function'){const s0=srStage;srStage=window.srStage=function(o){const r=s0.apply(this,arguments);try{pxApply(o)}catch(e){console.warn('ppv theme',e)}return r}}
Object.assign(window,{pxApply,pxClear,PX_T});
})();
