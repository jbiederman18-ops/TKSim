/* Tony Khan Simulator — the split face-off look (v269).
   Wherever two sides meet, they share one panel cut by a diagonal seam: each half is tinted by alignment (face blue,
   heel red), each name sits on its outer edge with a face/heel underline, photos meet at the seam, and VS sits on it.
   The booking card, the match editor, the live header, the promo and match showdowns (phone and party TV), the
   tug-of-war reveal and the brand war on Home all use it. Loaded last so it sits on top of the older layers. */
'use strict';
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

@media (prefers-reduced-motion:reduce){html.lk-hy body .sd.duo .sdc,html.lk-hy body .sd.duo::after{transition:none}}
`;document.head.appendChild(c)})();
