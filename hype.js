/* Tony Khan Simulator — the road to the PPV (v159).
   Every PPV has a hype meter (0–100) that each brand builds over the weeks before it:
     • every TV show adds hype for a good night and costs some for a bad one
     • hot feuds (35+ heat) you kept going this week add a little each
     • matches you've announced for the PPV — Contract Signings and callouts booked for that PPV — add a lot (up to 4)
     • the go-home show (the TV show right before the PPV) is big: a strong one adds a lot, a flat one costs you
   On the night, hype moves ticket sales (−15% to +15%) and the crowd: a hot build brings extra fans, a cold one costs some.
   Then the meter resets for the next PPV. Shown on Home and the Book screen, with the sell-through and what's driving it.
   Loaded after the main script; hooks in by wrapping globals. */
'use strict';
(function(){
const START=30,ANN=6,ANN_MAX=4;
function HY(b){S.hype=S.hype||{};return S.hype[b]=S.hype[b]||{v:START,log:[]}}
function np(){return PPVS[S.week]?{w:S.week,n:PPVS[S.week]}:nextPPVAfter(S.week)}
function announced(b,P){if(!P)return 0;if(b==='ai'&&!ON())return {easy:0,normal:1,hard:2}[S.diff]||1;/* the rival advertises its card; harder rivals build better */let n=0;try{if(b==='p'||!ON())n=(S.promises||[]).filter(pr=>pr.week===P.w&&(pr.kind==='contract'||pr.kind==='callout')).length}catch(e){}return Math.min(ANN_MAX,n)}
function hype(b){const h=HY(b);return clamp(Math.round(h.v+announced(b,np())*ANN),0,100)}
window.hypeOf=hype;
const word=v=>v>=80?['🔥','Sold out']:v>=60?['🎟️','Selling fast']:v>=40?['🙂','Steady']:v>=25?['😐','Slow']:['🥶','Empty seats'];
const sell=v=>Math.round(45+v*.55);
function addL(h,d,t){if(!d)return;h.v=clamp(h.v+d,0,100);if(Math.round(d))h.log=(h.log||[]).concat([{d:Math.round(d),t}]).slice(-6)}

/* ---------------- the weekly build (runs before endWeek clears this week's feud activity) ---------------- */
function build(notes){const sh=curShow();const P=np();if(!P)return;const wk=S.week;
 const last=(S.history||[]).filter(x=>x.s===S.season&&x.w===wk).slice(-1)[0];
 brands().forEach(b=>{const h=HY(b);
  if(sh.ppv){const v=hype(b);if(!h.paid){h.paid=wk;const fans=Math.round((v-50)/50*.025*(S.fans[b]||0));if(fans){S.fans[b]=Math.max(50000,S.fans[b]+fans)}
    if(b==='p'||ON()){const [ic,wd]=word(v);const who=ON()?nameOf(b)+"'s ":'';const n=v>=55?`${ic} ${who}${sh.name}: ${wd.toLowerCase()} — ${sell(v)}% of seats sold, and the hot build brought ${fans.toLocaleString()} extra fans.`:v<45?`${ic} ${who}${sh.name}: ${wd.toLowerCase()} — only ${sell(v)}% of seats sold after a cold build (${fans.toLocaleString()} fans).`:`${ic} ${who}${sh.name}: ${wd.toLowerCase()} — ${sell(v)}% of seats sold. A middling build (${fans>=0?'+':''}${fans.toLocaleString()} fans).`;notes.push(n);news(n)}}
   return}
  const r=last&&last[b];if(r!=null)addL(h,(r-3)*6,r>=3?'A good show':'A flat show');
  try{const hot=(S.touched||[]).filter(k=>(S.heat[k]||0)>=35&&k.split('|').some(id=>S.w[id]&&S.w[id].own===b)).length;if(hot)addL(h,Math.min(8,hot*2),`${hot} hot feud${hot>1?'s':''} kept going`)}catch(e){}
  if(P.w===wk+1&&r!=null){if(r>=3.5)addL(h,10,'Strong go-home show');else if(r<2.75)addL(h,-8,'Flat go-home show')}});}
/* reset after the PPV: the next build starts fresh */
function reset(){const P=np();brands().forEach(b=>{const h=HY(b);if(h.paid&&(!P||h.paid<S.week)){S.hype[b]={v:START,log:[]}}})}
if(typeof endWeek==='function'){const e0=endWeek;endWeek=function(notes){try{build(notes||[])}catch(e){console.warn('hype',e)}const out=e0.apply(this,arguments);try{reset()}catch(e){}return out}}
/* hype moves the gate on PPV night */
if(typeof tixRev==='function'){const t0=tixRev;tixRev=function(b,ppv){const v=t0.apply(this,arguments);if(!ppv||!S||!S.hype)return v;return Math.round(v*(.85+hype(b)*.003))}}

/* ---------------- display ---------------- */
function card(compact){const P=np();if(!P||S.phase!=='season')return '';const v=hype('p');const [ic,wd]=word(v);const h=HY('p');const ann=announced('p',P);const goHome=P.w===S.week+1;const tonight=P.w===S.week;
 const tips=[];if(ann<ANN_MAX)tips.push(`Announce PPV matches with a <b>Contract Signing</b> or a <b>callout</b> (${ann}/${ANN_MAX} announced)`);if(goHome)tips.push('This is the <b>go-home show</b>: feature your PPV names and make it a strong one');
 const rows=(h.log||[]).slice(-3).reverse().map(x=>`<div class="row sb tiny"><span>${esc(x.t)}</span><b class="${x.d>=0?'good':'bad'}">${x.d>=0?'+':''}${x.d}</b></div>`).join('')+(ann?`<div class="row sb tiny"><span>${ann} match${ann>1?'es':''} announced</span><b class="good">+${ann*ANN}</b></div>`:'');
 return `<div class="card"><div class="row sb"><b>${ic} ${tonight?'Tonight':`Road to ${esc(P.n)}`}</b><span class="tg ${v>=60?'good':v<25?'bad':''}">${wd} · ${sell(v)}% sold</span></div>
  <div style="height:8px;border-radius:4px;background:var(--line,#333);overflow:hidden;margin:8px 0"><div style="height:100%;width:${v}%;background:var(--gold2,#e8c35a)"></div></div>
  <div class="muted tiny">Hype ${v}/100 · ${tonight?'it pays off tonight: ticket sales and extra fans':`${P.w-S.week} week${P.w-S.week>1?'s':''} to go`}</div>
  ${compact?'':`${rows?`<div style="margin-top:6px">${rows}</div>`:''}${!tonight&&tips.length?`<div class="tiny" style="margin-top:6px">${tips.map(t=>'💡 '+t).join('<br>')}</div>`:''}`}</div>`}
window.hypeCard=card;
if(typeof homeView==='function'){const h0=homeView;homeView=function(){const out=h0.apply(this,arguments);let k='';try{k=card(true)}catch(e){}if(!k)return out;const i=out.indexOf('<div class="tiles">');return i<0?out+k:out.slice(0,i)+k+out.slice(i)}}
if(typeof bookView==='function'){const b0=bookView;bookView=function(){const out=b0.apply(this,arguments);let k='';try{k=card(false)}catch(e){}if(!k)return out;/* right under the show poster: before the card holding this week's goal, or the running order */const nb=out.indexOf('Now booking');const g=nb<0?-1:out.indexOf('<div class="card',nb);const i=g;return i<0?k+out:out.slice(0,i)+k+out.slice(i)}}
})();
