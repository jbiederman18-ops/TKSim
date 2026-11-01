/* Tony Khan Simulator — the split face-off look (v269).
   Wherever two sides meet, they share one panel cut by a diagonal seam: each half is tinted by alignment (face blue,
   heel red), each name sits on its outer edge with a face/heel underline, photos meet at the seam, and VS sits on it.
   The booking card, the match editor, the live header, the promo and match showdowns (phone and party TV), the
   tug-of-war reveal and the brand war on Home all use it. Loaded last so it sits on top of the older layers.
   v270: every other screen too — the roster and free agents are split rows (tinted photo | details), titles are
   belt | champion, the office splits money in | out and each expiring contract | re-sign, the draft splits you | the
   rival and the tale of the tape, offers split your bid | the sealed rival bid, and calendar PPVs split by brand.
   v271: the full redesign. Every shape in the game now uses the seam: the old two-sided parallelogram (--cut, --slant,
   --sl and their outline frames) becomes one straight edge and one diagonal cut, like half of a split panel; every
   banner is two-tone across a diagonal (red | deep red for shows and the live header, dark | gold for page heads);
   sheets open under a gold | red split rule; cards, chips, tabs and inputs are flat. */
'use strict';
/* a generic split pair: sides are {c:'f'|'h'|'p'|'x'|'g'|'b'|'n'|'v', h:html}; tints in the CSS below */
function sfPair(l,r,o){o=o||{};return `<div class="sfp ${o.cls||''}"><div class="sfa ${l.c}${l.on?' on':''}">${l.h}</div>${o.vs===''?'':`<span class="sfvs">${o.vs||'VS'}</span>`}<div class="sfb ${r.c}${r.on?' on':''}">${r.h}</div></div>`}
function sfMoney(inc,out){return sfPair({c:'g',h:`<small>Coming in</small><b>+${money(inc)}</b>`},{c:'b',h:`<small>Going out</small><b>−${money(out)}</b>`},{cls:'sfm'})}
function sfDraftHead(oc){const bs=brands();const side=(b,c)=>({c,on:oc===b,h:`<b>${b==='p'?'You':esc(nameOf(b))}${oc===b?' · on the clock':''}</b><small>${cnt(ownList(b))}</small>`});
 return sfPair(side(bs[0],bs[0]==='p'?'p':'x'),side(bs[1],bs[1]==='p'?'p':'x'),{cls:'sfdh mt'})}
function sfOffer(w,o,mine){const ofr=typeof offerOf==='function'?offerOf(w.id):null;const rv=ON()?'Other GMs':esc(S.rival);
 return sfPair({c:'p',on:!!mine,h:`<small>Your offer</small><b>${money(o.sal)}<i>/wk</i></b><span>${money(o.bonus)} bonus${o.perks.length?` · ${o.perks.length} promise${o.perks.length>1?'s':''}`:''}</span>`},
  {c:'x',h:`<small>${rv}</small><b class="sfseal">Sealed</b><span>${ofr&&Object.keys(ofr.by||{}).some(k=>k!=='p')?'An offer is in':'Revealed when the week airs'}</span>`},{cls:'sfo'})}
Object.assign(window,{sfPair,sfMoney,sfDraftHead,sfOffer});
(function(){const c=document.createElement('style');c.id='split-css';c.textContent=`
html.lk-hy{--sfF:#132438;--sfH:#33181e;--sfF2:#1a3150;--sfH2:#46202a;--sfP:#2c2410;--sfX:#2e1414;--seam:18px}

/* ---- Book: every two-sided match is one split bar ---- */
html.lk-hy body .hyface:not(.one):not(.multi){display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;position:relative;isolation:isolate;margin:8px 0 2px}
html.lk-hy body .hyface:not(.one):not(.multi)>.vs{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) skewX(-8deg);z-index:4;margin:0;font:900 italic 19px/1 'BC','Barlow Condensed',sans-serif;color:var(--gold);text-shadow:0 2px 0 #000;pointer-events:none}
html.lk-hy body .hyface>.fo,html.lk-hy body .hyface>.cpp{background:var(--sfH);box-shadow:none;overflow:hidden}
html.lk-hy body .hyface>.fo.fc,html.lk-hy body .hyface>.cpp.fc{background:var(--sfF)}
html.lk-hy body .hyface>.fo:before,html.lk-hy body .hyface>.cpp:before,html.lk-hy body .hyface>.fo.w:after,html.lk-hy body .hyface>.cpp.w:after{display:none}
html.lk-hy body .hyface:not(.one):not(.multi)>:first-child{clip-path:polygon(0 0,100% 0,calc(100% - var(--seam)) 100%,0 100%);margin-right:calc(var(--seam) / -2);padding-right:calc(var(--seam) + 6px)}
html.lk-hy body .hyface:not(.one):not(.multi)>:last-child{clip-path:polygon(var(--seam) 0,100% 0,100% 100%,0 100%);margin-left:calc(var(--seam) / -2);padding-left:calc(var(--seam) + 6px)}
html.lk-hy body .hyface:not(.one):not(.multi)>.fo:last-child{align-items:flex-end;text-align:right;padding-right:11px}
html.lk-hy body .hyface:not(.one):not(.multi)>.fo:first-child{padding-left:11px}
html.lk-hy body .hyface:not(.one):not(.multi)>.fo:last-child .fot{flex-direction:row-reverse}
html.lk-hy body .hyface.one>.fo{clip-path:polygon(0 0,100% 0,calc(100% - var(--seam)) 100%,0 100%);padding-left:11px;padding-right:calc(var(--seam) + 6px)}
html.lk-hy body .hyface.multi>.fo,html.lk-hy body .hyface.multi>.cpp{clip-path:var(--slant)}
/* the winner: a gold bar along the top instead of a frame (a frame can't follow the seam) */
html.lk-hy body .hyface>.fo.w,html.lk-hy body .hyface>.cpp.w{box-shadow:inset 0 3px 0 var(--gold)}
/* names carry the face/heel underline */
html.lk-hy body .hyface .fon,html.lk-hy body .hyface .cpp b{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-color:var(--heel);text-decoration-skip-ink:none}
html.lk-hy body .hyface .fc .fon,html.lk-hy body .hyface .cpp.fc b{text-decoration-color:var(--face)}
html.lk-hy body .hyface .fo.w .fon,html.lk-hy body .hyface .cpp.w b{color:var(--gold2)}
/* photos meet at the seam; the name and rating keep the outer side */
html.lk-hy body .hyface .fo{min-height:94px}
html.lk-hy body .hyface .fo>*:not(.fop){position:relative;z-index:1;max-width:68%}
html.lk-hy body .hyface:not(.multi) .fo:not(.tm) .fon{font-size:19px;line-height:1.02;overflow-wrap:normal;word-break:normal;hyphens:none}
html.lk-hy body .hyface:not(.multi) .fo:not(.tm) .fon.ln{font-size:16px}
html.lk-hy body .hyface .fo .fop{position:absolute;top:6px;bottom:0;width:38%;z-index:0;pointer-events:none;opacity:.9}
html.lk-hy body .hyface .fo .fop>*{display:block;width:100%;height:100%;object-fit:cover;object-position:center 12%}
html.lk-hy body .hyface:not(.one):not(.multi)>.fo:first-child .fop{right:calc(var(--seam) - 2px)}
html.lk-hy body .hyface:not(.one):not(.multi)>.fo:last-child .fop{left:calc(var(--seam) - 2px)}
html.lk-hy body .hyface.one>.fo .fop{right:calc(var(--seam) + 4px);width:30%}
html.lk-hy body .hyface.multi .fo .fop,html.lk-hy body .hyface .fo.tm .fop{display:none}
html.lk-hy body .hyface.multi .fo>*:not(.fop),html.lk-hy body .hyface .fo.tm>*{max-width:none}
html.lk-hy body .hyface .fo.tm{min-height:0}
/* compact plates: same split, no photos */
html.cmp.lk-hy body .hyface.cmpf:not(.one):not(.multi)>.cpp:last-child{flex-direction:row-reverse;text-align:right}
html.cmp.lk-hy body .hyface.cmpf:not(.one):not(.multi)>.cpp:last-child .cpn{align-items:flex-end}
html.cmp.lk-hy body .hyface.cmpf>.cpp{padding-top:7px;padding-bottom:7px}

/* ---- the match editor: the two wrestler cards meet at a seam with VS on it ---- */
html.lk-hy body .vsrow:has(>.vs){position:relative;gap:0}
html.lk-hy body .vsrow:has(>.vs)>.vs{position:absolute;left:50%;top:clamp(60px,21%,130px);transform:translate(-50%,-50%) skewX(-8deg);z-index:4;margin:0;font:900 italic 36px/1 'BC','Barlow Condensed',sans-serif;color:var(--gold);text-shadow:0 3px 0 #000;pointer-events:none}
html.lk-hy body .vsrow:has(>.vs)>.vscol:first-child{margin-right:-11px}
html.lk-hy body .vsrow:has(>.vs)>.vscol:last-child{margin-left:-11px}
html.lk-hy body .vsrow:has(>.vs)>.vscol:first-child .wc{clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%)}
html.lk-hy body .vsrow:has(>.vs)>.vscol:last-child .wc{clip-path:polygon(22px 0,100% 0,100% 100%,0 100%)}
html.lk-hy body .vsrow:has(>.vs)>.vscol:first-child .edi,html.lk-hy body .vsrow:has(>.vs)>.vscol:first-child .crown{margin-right:11px}
html.lk-hy body .vsrow:has(>.vs)>.vscol:last-child .edi,html.lk-hy body .vsrow:has(>.vs)>.vscol:last-child .crown{margin-left:11px}
html.lk-hy body .vsrow:has(>.vs)>.vscol:last-child .wc .o{left:18px}html.lk-hy body .vsrow:has(>.vs)>.vscol:last-child .wc .al{left:14px}
html.lk-hy body .vsrow .wc.af{background:var(--sfF)}html.lk-hy body .vsrow .wc.ah{background:var(--sfH)}

/* ---- the live header: both sides on one split panel ---- */
html.lk-hy body .lvfo.two{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0}
html.lk-hy body .lvfo.two>.lvvs{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) skewX(-8deg);z-index:3;color:var(--gold);font-size:26px;text-shadow:0 2px 0 #000;pointer-events:none}
html.lk-hy body .lvfo .lvp{background:var(--sfH)}html.lk-hy body .lvfo .lvp.fc{background:var(--sfF)}
html.lk-hy body .lvfo.two>.lvp:first-child{clip-path:polygon(0 0,100% 0,calc(100% - var(--seam)) 100%,0 100%);margin-right:calc(var(--seam) / -2);padding-right:calc(var(--seam) + 6px)}
html.lk-hy body .lvfo.two>.lvp:last-of-type{clip-path:polygon(var(--seam) 0,100% 0,100% 100%,0 100%);margin-left:calc(var(--seam) / -2);padding-left:calc(var(--seam) + 6px);text-align:right;align-items:flex-end}
html.lk-hy body .lvfo.two .lvph .pic{clip-path:none;background:none}
html.lk-hy body .lvfo.two .lvph .pic,html.lk-hy body .lvfo.one .lvph .pic{height:104px}
html.lk-hy body .lvfo .lvpn{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-color:var(--heel);text-decoration-skip-ink:none}
html.lk-hy body .lvfo .lvp.fc .lvpn{text-decoration-color:var(--face)}
html.lk-hy body .lvfo .lvp,html.lk-hy body .lvfo .lvp.fc{box-shadow:none}

/* ---- showdowns (promo, match, highlight reels — phone and party TV): one split stage; the seam leans away from
   whoever is acting, so the speaker or attacker takes more of the screen ---- */
html.lk-hy body .sd.duo::before{background:none}
html.lk-hy body .sd.duo{background:#09090a}
html.lk-hy body .sd.duo .sdc{flex:1 1 0;transition:flex-grow .38s cubic-bezier(.2,.9,.3,1);background:var(--sfH);overflow:hidden}
html.lk-hy body .sd.duo .sdc:has(.sdpl.fc){background:var(--sfF)}
html.lk-hy body .sd.duo .sdc.ca{clip-path:polygon(0 0,100% 0,calc(100% - 40px) 100%,0 100%);margin-right:-20px}
html.lk-hy body .sd.duo .sdc.cb{clip-path:polygon(40px 0,100% 0,100% 100%,0 100%);margin-left:-20px}
html.lk-hy body .sd.duo .sdc.on{flex-grow:1.4}
html.lk-hy body .sd.duo .sdc.on:has(.sdpl.fc){background:var(--sfF2)}html.lk-hy body .sd.duo .sdc.on:has(.sdpl.hl){background:var(--sfH2)}
html.lk-hy body .sd.duo::after{transition:left .38s cubic-bezier(.2,.9,.3,1);z-index:5}
html.lk-hy body .sd.duo:has(.sdc.ca.on)::after{left:56%}
html.lk-hy body .sd.duo:has(.sdc.cb.on)::after{left:44%}
html.lk-hy body .sd.duo .sdph{background:none;clip-path:none;box-shadow:none!important}
html.lk-hy body .sd.duo .sdc.on .sdph{filter:none}
html.lk-hy body .sd.duo .sdpl,html.lk-hy body .sd.duo .sdc.cb .sdpl{border-top:0;background:transparent;padding:0 6px 4px}
html.lk-hy body .sd.duo .sdc.ca .sdpl{left:7%;right:22%;align-items:flex-start;text-align:left}
html.lk-hy body .sd.duo .sdc.cb .sdpl{left:22%;right:7%;align-items:flex-end;text-align:right}
html.lk-hy body .sd.duo .sdpl b{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-color:var(--heel);text-decoration-skip-ink:none;text-shadow:0 2px 0 #000}
html.lk-hy body .sd.duo .sdpl.fc b{text-decoration-color:var(--face)}
html.lk-hy body .sd.duo .sdpl b{padding-bottom:6px;max-width:100%}
html.lk-hy body .sd.duo .sdc.ca .sdact{left:42%}
html.lk-hy body .sd.duo .sdc.cb .sdact{left:58%}

/* ---- the tug-of-war reveal: your slot over theirs, cut by a slanted seam ---- */
html.lk-hy body .twpair{gap:0}
html.lk-hy body .twh{border:0;background:var(--sfX);box-shadow:none}
html.lk-hy body .twh.p{background:var(--sfP);clip-path:polygon(0 0,100% 0,100% calc(100% - 14px),0 100%);padding-bottom:22px;margin-bottom:-7px}
html.lk-hy body .twh.p+.twh,html.lk-hy body .twh:not(.p):last-child{clip-path:polygon(0 14px,100% 0,100% 100%,0 100%);padding-top:22px;margin-top:-7px}
html.lk-hy body .twh.won{background:#3b3010;box-shadow:inset 0 3px 0 var(--gold)}
html.lk-hy body .twh:not(.p).won{background:#401818}
html.lk-hy body .twpair.main .twh{border:0}
html.lk-hy body .twpl{background:rgba(0,0,0,.28)}

/* ---- Home: the brand war is a split bar ---- */
html.lk-hy body .warnames{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;align-items:stretch;margin-bottom:8px}
html.lk-hy body .warnames>div{padding:9px 12px 10px;background:var(--sfP);clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%);margin-right:-8px;padding-right:24px}
html.lk-hy body .warnames>div.r{background:var(--sfX);clip-path:polygon(16px 0,100% 0,100% 100%,0 100%);margin:0 0 0 -8px;padding-left:24px;padding-right:12px}
html.lk-hy body .warnames>.vsdot{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) skewX(-8deg);z-index:2;font:900 italic 18px/1 'BC','Barlow Condensed',sans-serif;color:var(--gold);text-shadow:0 2px 0 #000;margin:0;background:none;padding:0}

/* ---- results: your show and theirs on one split bar ---- */
html.lk-hy body .score{position:relative;gap:0;align-items:stretch;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
html.lk-hy body .score>div{padding:10px 12px 12px;background:var(--sfX)}
html.lk-hy body .score>div:first-child{background:var(--sfP);clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%);margin-right:-8px;padding-right:22px}
html.lk-hy body .score>div:last-child:not(:first-child){clip-path:polygon(16px 0,100% 0,100% 100%,0 100%);margin-left:-8px;padding-left:22px}
html.lk-hy body .score>div.win{box-shadow:inset 0 3px 0 var(--gold)}
html.lk-hy body .score>i{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) skewX(-8deg);z-index:2;color:var(--gold);text-shadow:0 2px 0 #000}

/* ---- feuds (Home and Book): each pairing is a small split bar ---- */
html.lk-hy body .fb .frow{flex:1;min-width:0}
html.lk-hy body .fb .fbn{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;font:900 italic 15px/1.1 'BC','Barlow Condensed',sans-serif;text-transform:uppercase}
html.lk-hy body .fb .fbn>span:not(.muted){display:block;padding:7px 10px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html.lk-hy body .fb .fbn>span.face{background:var(--sfF)}html.lk-hy body .fb .fbn>span.heel{background:var(--sfH)}
html.lk-hy body .fb .fbn>span:first-child{clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);margin-right:-6px;padding-right:18px}
html.lk-hy body .fb .fbn>span:last-child{clip-path:polygon(12px 0,100% 0,100% 100%,0 100%);margin-left:-6px;padding-left:18px;text-align:right}
html.lk-hy body .fb .fbn>span.muted{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) skewX(-8deg);z-index:2;color:var(--gold);font-size:13px;text-shadow:0 2px 0 #000}
html.lk-hy body .fb .row.sb{gap:8px}

/* ---- the generic split pair (office, draft, offers, titles) ---- */
html.lk-hy body .sfp{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;margin:8px 0}
html.lk-hy body .sfp>.sfa,html.lk-hy body .sfp>.sfb{position:relative;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:3px;padding:10px 12px;border:0;color:var(--text);font:inherit;text-align:left;background:#151518}
html.lk-hy body .sfp>.sfa{clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%);margin-right:-8px;padding-right:24px}
html.lk-hy body .sfp>.sfb{clip-path:polygon(16px 0,100% 0,100% 100%,0 100%);margin-left:-8px;padding-left:24px;align-items:flex-end;text-align:right}
html.lk-hy body .sfp>.f{background:var(--sfF)}html.lk-hy body .sfp>.h{background:var(--sfH)}
html.lk-hy body .sfp>.p{background:var(--sfP)}html.lk-hy body .sfp>.x{background:var(--sfX)}
html.lk-hy body .sfp>.g{background:#16301f}html.lk-hy body .sfp>.b{background:#33181e}html.lk-hy body .sfp>.n{background:#1e1e22}
html.lk-hy body .sfp>.v{background:#121214;box-shadow:inset 0 0 0 1px #34343a}
html.lk-hy body .sfp>.on{box-shadow:inset 0 3px 0 var(--gold)}
html.lk-hy body .sfp>*>b{font:900 italic 19px/1.05 'BC','Barlow Condensed',sans-serif;text-transform:uppercase}
html.lk-hy body .sfp>*>b i{font-style:italic;font-size:13px;color:var(--mut)}
html.lk-hy body .sfp>*>small{font-size:11.5px;color:var(--mut);font-weight:600}
html.lk-hy body .sfp>*>span{font-size:12px;color:var(--mut)}
html.lk-hy body .sfp>.sfvs{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) skewX(-8deg);z-index:2;font:900 italic 16px/1 'BC','Barlow Condensed',sans-serif;color:var(--gold);text-shadow:0 2px 0 #000;pointer-events:none}
html.lk-hy body .sfp.sfm .g b{color:var(--good);font-size:24px}html.lk-hy body .sfp.sfm .b b{color:var(--bad);font-size:24px}
html.lk-hy body .sfp.sfdh .p b{color:var(--gold2)}html.lk-hy body .sfp.sfdh .x b{color:#ff8a80}
html.lk-hy body .sfp.sfo .p b{font-size:24px}html.lk-hy body .sfp.sfo .sfseal{color:#6b6860;font-size:24px}
/* contracts: name | re-sign */
html.lk-hy body .sfp.sfcon{grid-template-columns:minmax(0,1fr) 128px;margin:6px 0}
html.lk-hy body .sfp.sfcon .sfa{cursor:pointer}
html.lk-hy body .sfp.sfcon .sfa>b{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-color:var(--heel);text-decoration-skip-ink:none;font-size:17px}
html.lk-hy body .sfp.sfcon .sfa.f>b{text-decoration-color:var(--face)}
html.lk-hy body .sfp.sfcon .sfb{cursor:pointer;align-items:center;text-align:center}
html.lk-hy body .sfp.sfcon .sfb>b{font-size:16px;color:var(--gold2)}html.lk-hy body .sfp.sfcon .sfb.x{background:var(--red)}html.lk-hy body .sfp.sfcon .sfb.x>b,html.lk-hy body .sfp.sfcon .sfb.x>small{color:#fff}
html.lk-hy body .sfp.sfcon .sfa small b{font:inherit;font-weight:800}

/* ---- titles: belt | champion ---- */
html.lk-hy body .tlrow.sft{padding:5px 0 7px;border-top:0}
html.lk-hy body .tlrow.sft .sfp{margin:0;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)}
html.lk-hy body .tlrow.sft .tla{box-shadow:inset 3px 0 0 var(--gold)}
html.lk-hy body .tlrow.sft .tla .tbi{height:22px;max-width:56px;object-fit:contain;align-self:flex-start;margin-bottom:2px}
html.lk-hy body .tlrow.sft .tla>b{color:var(--gold2);font-size:17px}
html.lk-hy body .tlrow.sft .tlh .tlw{font:900 italic 18px/1.05 'BC','Barlow Condensed',sans-serif;text-transform:uppercase}
html.lk-hy body .tlrow.sft .tlh .tlw .face,html.lk-hy body .tlrow.sft .tlh .tlw .heel{color:var(--text);text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-skip-ink:none}
html.lk-hy body .tlrow.sft .tlh .tlw .face{text-decoration-color:var(--face)}html.lk-hy body .tlrow.sft .tlh .tlw .heel{text-decoration-color:var(--heel)}
html.lk-hy body .tlrow.sft .tlh.v .tlw{font:700 13px/1.3 'Barlow',sans-serif;text-transform:none}
html.lk-hy body .tlrow.sft .tlh small{font-size:11px;color:var(--mut);margin-top:3px}
html.lk-hy body .tlrow.sft .tlh .trp{position:static;gap:4px;margin-top:3px}html.lk-hy body .tlrow.sft .tlh .trp b{font-size:13px;color:var(--mut);min-width:0}
html.lk-hy body .tlrow.sft .trb{height:3px;border-radius:0;margin-top:4px}

/* ---- roster, free agents and created wrestlers: split rows (tinted photo | details) ---- */
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid,html.lk-hy body main.v-office .cgrid{grid-template-columns:minmax(0,1fr);gap:6px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc,html.lk-hy body main.v-office .cgrid .wc{aspect-ratio:auto;height:78px;display:grid;grid-template-columns:116px minmax(0,1fr);background:none;clip-path:none;overflow:visible}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .pic,html.lk-hy body main.v-office .cgrid .wc .pic{position:relative;inset:auto;grid-column:1;grid-row:1;background:var(--sfH);clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%);margin-right:-8px;display:flex;justify-content:flex-end;padding-right:18px;overflow:hidden}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc.af .pic,html.lk-hy body main.v-office .cgrid .wc.af .pic{background:var(--sfF)}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .pic>*,html.lk-hy body main.v-office .cgrid .wc .pic>*{width:62px;height:100%;object-fit:cover;object-position:center 12%}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .nm,html.lk-hy body main.v-office .cgrid .wc .nm{position:relative;inset:auto;grid-column:2;grid-row:1;background:#151518;clip-path:polygon(16px 0,100% 0,100% 100%,0 100%);margin-left:-8px;padding:8px 12px 8px 26px;display:flex;flex-direction:column;justify-content:center;min-width:0}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .nm b,html.lk-hy body main.v-office .cgrid .wc .nm b{font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-color:var(--heel);text-decoration-skip-ink:none;overflow-wrap:normal;padding-bottom:4px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc.af .nm b,html.lk-hy body main.v-office .cgrid .wc.af .nm b{text-decoration-color:var(--face)}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .nm b.ln,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .nm b.xl{font-size:17px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .al,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .alb,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .tt-bg,
html.lk-hy body main.v-office .cgrid .wc .al,html.lk-hy body main.v-office .cgrid .wc .alb{display:none}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .o,html.lk-hy body main.v-office .cgrid .wc .o{top:6px;left:6px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc.champ,html.lk-hy body main.v-office .cgrid .wc.champ{box-shadow:inset 0 3px 0 var(--gold)}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc.champ .nm,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc.champ .pic{border-top:3px solid var(--gold)}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .ic,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .cwb,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .bkb,html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .askb{top:auto;bottom:6px;left:6px;right:auto}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .trt{left:44px;top:6px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .sta{max-width:220px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .ms{display:flex;gap:10px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc .nm .fdl{order:3;margin-top:4px}
html.lk-hy body main:is(.v-roster,.v-office,.v-draft) .cgrid .wc.empty{height:56px;display:flex}

/* ---- the draft: tale of the tape is photo | details, the big board is split rows ---- */
html.lk-hy body .card.ttape{display:grid;grid-template-columns:132px minmax(0,1fr);gap:0 0;padding:0;background:none;clip-path:none;min-height:0;overflow:visible}
html.lk-hy body .card.ttape .tt-bg{display:none}
html.lk-hy body .card.ttape .tt-pic{position:relative;right:auto;top:auto;grid-column:1;grid-row:1/span 4;width:auto;height:auto;min-height:190px;background:var(--sfH);clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%);margin-right:-11px}
html.lk-hy body .card.ttape:has(.tt-al.fc) .tt-pic{background:var(--sfF)}
html.lk-hy body .card.ttape .tt-pic>*{object-fit:cover;object-position:center 12%}
html.lk-hy body .card.ttape>:not(.tt-pic):not(.tt-bg):not(.row){grid-column:2;background:#151518;margin-left:-11px;padding-left:30px;padding-right:12px}
html.lk-hy body .card.ttape .tt-k{padding-top:12px;clip-path:polygon(22px 0,100% 0,100% 100%,0 100%)}
html.lk-hy body .card.ttape .tt-n{padding-top:4px;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:5px;text-decoration-color:var(--heel)}
html.lk-hy body .card.ttape:has(.tt-al.fc) .tt-n{text-decoration-color:var(--face)}
html.lk-hy body .card.ttape .tt-g{padding-bottom:12px}
html.lk-hy body .card.ttape>.row{grid-column:1/-1;margin-top:8px}
html.lk-hy body .bbr{position:relative;border-left:0;background:#151518;padding-left:82px;clip-path:none;overflow:hidden}
html.lk-hy body .bbr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:70px;background:var(--sfF);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%)}
html.lk-hy body .bbr.hl::before{background:var(--sfH)}
html.lk-hy body .bbr .bbk{position:absolute;left:8px;z-index:1;color:var(--mut)}
html.lk-hy body .bbr .bbo{position:absolute;left:28px;z-index:1;color:var(--gold2)}
html.lk-hy body .bbr .bbs{display:none}
html.lk-hy body .bbr .bbn{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px;text-decoration-color:var(--face);text-decoration-skip-ink:none}
html.lk-hy body .bbr.hl .bbn{text-decoration-color:var(--heel)}

/* ---- the calendar: each PPV week is a split — brand | the show ---- */
html.lk-hy body .calrow.ppv,html.lk-hy body .calrow.sup{background:none;border:0;padding:0;border-radius:0;gap:0}
html.lk-hy body .calrow.ppv .calwk,html.lk-hy body .calrow.sup .calwk{width:64px;padding:9px 18px 9px 10px;background:var(--sfP);color:var(--gold2);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);margin-right:-6px}
html.lk-hy body .calrow.wwe .calwk{background:var(--sfX);color:#ff8a80}
html.lk-hy body .calrow.ppv .calbody,html.lk-hy body .calrow.sup .calbody{background:#151518;padding:8px 10px 8px 20px;clip-path:polygon(12px 0,100% 0,100% 100%,0 100%);margin-left:-6px}
html.lk-hy body .calrow.sup .calbody{box-shadow:inset 0 3px 0 var(--gold)}
html.lk-hy body .calrow.now{outline:0;box-shadow:inset 0 0 0 2px var(--gold2)}

/* ==== v271: the full split system ==== */
html.lk-hy{
 --cut:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);
 --slant:polygon(0 0,100% 0,calc(100% - 9px) 100%,0 100%);
 --sl:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%);
 --frame:polygon(evenodd,0 0,100% 0,calc(100% - 12px) 100%,0 100%,0 0,2px 2px,2px calc(100% - 2px),calc(100% - 13px) calc(100% - 2px),calc(100% - 2.7px) 2px,2px 2px);
 --frame8:polygon(evenodd,0 0,100% 0,calc(100% - 9px) 100%,0 100%,0 0,2px 2px,2px calc(100% - 2px),calc(100% - 10px) calc(100% - 2px),calc(100% - 2.6px) 2px,2px 2px);
 --frame3:polygon(evenodd,0 0,100% 0,calc(100% - 12px) 100%,0 100%,0 0,3px 3px,3px calc(100% - 3px),calc(100% - 13.5px) calc(100% - 3px),calc(100% - 4px) 3px,3px 3px);
 --sfRed:linear-gradient(103deg,var(--red) 0 63%,#7c1913 63% 100%);
 --sfRule:linear-gradient(103deg,var(--gold) 0 50%,var(--red) 50% 100%)}
/* cards are flat slabs; the seam is for things that face off, act, or move you forward */
html.lk-hy body .card:not(.showcard):not(.phead):not(.ttape){clip-path:none;background:#141417;border:0;box-shadow:none}
html.lk-hy body .card.warn{background:#1f150f;box-shadow:inset 3px 0 0 var(--ember)}
html.lk-hy body .card.mine{box-shadow:inset 3px 0 0 var(--gold)}
html.lk-hy body .tile{clip-path:none;background:#141417}
html.lk-hy body .tile:after{clip-path:none;width:100%;left:0;height:3px;background:var(--sfRule)}
/* banners: two tones across a diagonal */
html.lk-hy body .card.showcard,html.lk-hy body .res-hd,html.lk-hy body .lvhd,html.lk-hy body .hero{background:var(--sfRed)}
html.lk-hy body .card.showcard.ppv{background:linear-gradient(103deg,#b8862a 0 63%,#7a5a17 63% 100%)}
html.lk-hy body .card.showcard.ppv .showname,html.lk-hy body .card.showcard.ppv .kicker,html.lk-hy body .card.showcard.ppv .venue{color:#0d0b07;-webkit-text-fill-color:#0d0b07}
html.lk-hy body .card.phead{background:linear-gradient(103deg,#1c1c20 0 62%,var(--sfP) 62% 100%)}
html.lk-hy body .card.phead .phr b{color:var(--gold2)}
html.lk-hy body .wd-top.wdt{background:linear-gradient(103deg,#1c1c20 0 62%,var(--sfP) 62% 100%)}
html.lk-hy body .wd-top.wdt.af,html.lk-hy body .wdt:has(.alg.fc){background:linear-gradient(103deg,#1c1c20 0 62%,var(--sfF) 62% 100%)}
/* sheets open under the split rule */
html.lk-hy body .sheet{border-top:0;background:#111114}
html.lk-hy body .sheet::after{content:'';position:absolute;left:0;right:0;top:0;height:5px;background:var(--sfRule);pointer-events:none;z-index:3}
html.lk-hy body .sheet:before{clip-path:none}
/* chips, tabs and toggles: flat blocks, gold when on */
html.lk-hy body .chip{clip-path:none;border-radius:0;border:0;box-shadow:none;background:#1e1e22;color:var(--mut)}
html.lk-hy body .chip.on{background:var(--gold);color:var(--ink)}
html.lk-hy body .mini{clip-path:var(--sl)}
html.lk-hy body select,html.lk-hy body input,html.lk-hy body textarea{clip-path:none;border-radius:0;background:#0d0d10;border:1px solid #2c2c33}
/* the tab bar: flat, the open tab is a gold block cut on one side */
html.lk-hy body nav.tabs{background:#0e0e11}
html.lk-hy body nav.tabs:before{background:var(--sfRule);height:3px}
html.lk-hy body nav.tabs button.on:before{left:6%;right:6%}
/* header money/fans chips */
html.lk-hy body .hudc{clip-path:var(--sl)}
/* choice rows (promo calls, decisions, promises): a tinted key half, then the text half */
html.lk-hy body .choice{clip-path:none;background:#151518;padding-left:0;grid-template-columns:52px 1fr;overflow:hidden}
html.lk-hy body .choice .key{width:52px;height:auto;align-self:stretch;min-height:44px;background:var(--sfP);color:var(--gold2);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);display:flex;align-items:center;justify-content:center;margin-right:4px}
html.lk-hy body .choice.on .key,html.lk-hy body .choice.picked .key{background:var(--gold);color:var(--ink)}
/* the briefing's section rules and rows */
html.lk-hy body .rdsec i{background:var(--sfRule);height:2px}
html.lk-hy body .rdr{border-radius:0}

/* booking slots: the number tab is cut like a split half */
html.lk-hy body .slot{clip-path:none;background:#141417}
html.lk-hy body .slot .num,html.lk-hy body .slot:not(.done) .num{clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%)}
/* Home: the briefing strip is count | headline */
html.lk-hy body .bstrip{padding:0;gap:0;overflow:hidden}
html.lk-hy body .bstrip .bsn{align-self:stretch;display:flex;align-items:center;padding:10px 22px 10px 14px;background:var(--sfP);clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);margin-right:6px}
html.lk-hy body .bstrip.hot .bsn{background:var(--sfX)}
html.lk-hy body .bstrip>:not(.bsn){padding-top:10px;padding-bottom:10px}
html.lk-hy body .bstrip .bsc{padding-right:14px}
html.lk-hy body .tcr{background:#1a1a1e}
/* the briefing's three counts are one split strip */
html.lk-hy body .rundown .rdk{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
html.lk-hy body .rundown .rdk>div{clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%);margin:0 -7px;padding:10px 20px;background:#1e1e22;box-shadow:none;border:0}
html.lk-hy body .rundown .rdk>div:first-child{clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);margin-left:0;padding-left:12px}
html.lk-hy body .rundown .rdk>div:last-child{clip-path:polygon(14px 0,100% 0,100% 100%,0 100%);margin-right:0}
html.lk-hy body .rundown .rdk>div.m{background:var(--sfX)}html.lk-hy body .rundown .rdk>div.c{background:var(--sfP)}
/* wrestler details: the photo is a tinted half cut by the seam */
html.lk-hy body .wd-top .wd-pic{clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%);box-shadow:none;background-color:var(--sfP)}
/* pickers (teams, factions and the like): photo | name rows */
html.lk-hy body .tmrow{clip-path:none;background:#151518;padding:0;gap:0;flex-shrink:0;min-height:48px;align-items:stretch}
html.lk-hy body .tmrow .tmf{width:auto;flex:none;align-self:stretch;display:flex;align-items:center;padding:4px 20px 4px 8px;background:var(--sfH);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);margin-right:6px}
html.lk-hy body .tmrow.af .tmf{background:var(--sfF)}
html.lk-hy body .tmrow .tmn{padding:8px 0}html.lk-hy body .tmrow .tmck{padding-right:12px}
html.lk-hy body .tmrow.on{box-shadow:inset 0 0 0 2px var(--gold)}
/* the games lobby: the save you'll pick up is a split hero; every tile is cut like a split half */
html.lk-hy body .lbhero{border:0;background:linear-gradient(103deg,#1c1c20 0 60%,var(--sfP) 60% 100%);clip-path:none}
html.lk-hy body .lbtile{clip-path:var(--cut);background:#151518}
/* the scouting board */
html.lk-hy body .card.scout{box-shadow:inset 3px 0 0 var(--gold)}

@media (prefers-reduced-motion:reduce){html.lk-hy body .sd.duo .sdc,html.lk-hy body .sd.duo::after{transition:none}}
`;document.head.appendChild(c)})();
