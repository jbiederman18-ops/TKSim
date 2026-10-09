'use strict';
/* ===================== ROOKIE GM ORIENTATION =====================
   A guided tour that spotlights the real screens, plus one-time coach tips the first time something comes up.

   KEEPING IT CURRENT — read this before changing a game system:
   • Every stop lists the systems it explains in `sys`. When you change one of those systems, update the stop's text.
   • Numbers come from the game itself through tv() (cardMatches, SEASON, PPVS, FAT_OK, UPKEEP_AT, FTIER…), so they
     follow the code. If a constant is renamed, tv() falls back and records it in TUT_MISS, and
     tools/check-tutorial.py fails until the stop is fixed.
   • Bump TUT_REV and set the stop's `since` to it when a change is worth re-showing. Players who already took the
     tour get a "what's new" replay of just those stops.
   • Run `python3 tools/check-tutorial.py` — it plays every stop and tip in a headless browser and fails on any
     missing target or stale value. */
const TUT_REV=8;
const TUT_KEY='tksim_tut';
const TUT_MISS=[];

/* a live value from the game, with a fallback so the tour never breaks if a name changes */
function tv(k,f,fb){try{const v=f();if(v===undefined||v===null||(typeof v==='number'&&!isFinite(v)))throw 0;return v}catch(e){if(!TUT_MISS.includes(k))TUT_MISS.push(k);return fb}}
const tvMoney=n=>tv('money',()=>money(n),'$'+Math.round(n/1000)+'K');
const tvCap=()=>tv('draft cap',()=>S.draft.cap,0);
const tvTier=i=>tv('FTIER',()=>FTIER[i][0],[20,45,75][i]);
const tvPPVs=()=>tv('PPVS',()=>Object.values(PPVS),[]);
const tvRival=()=>tv('rival name',()=>ON()?'the other GMs':esc(S.rival),'the rival');

/* ---------- look (theme tokens, so every Look restyles it) ---------- */
(function(){const c=document.createElement('style');c.id='tutcss';c.textContent=`
#tut{position:fixed;inset:0;z-index:40;pointer-events:auto}
#tut.nohole{background:rgba(0,0,0,.72);animation:fadein .2s}
#tut .tut-hole{position:fixed;display:none;border-radius:4px;box-shadow:0 0 0 2px var(--gold),0 0 22px 2px rgba(216,180,73,.45),0 0 0 200vmax rgba(0,0,0,.72);transition:top .28s ease,left .28s ease,width .28s ease,height .28s ease;pointer-events:none}
#tut .tut-card{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom));width:min(440px,calc(100vw - 24px));max-height:46vh;overflow:auto;background:linear-gradient(180deg,var(--st1),var(--st2));box-shadow:inset 0 0 0 1px var(--gold),0 18px 50px rgba(0,0,0,.7);clip-path:var(--cut);padding:14px 16px 12px;color:var(--text);animation:tutin .22s ease}
#tut .tut-card.at-top{bottom:auto;top:calc(12px + env(safe-area-inset-top))}
#tut .tut-card.at-mid{bottom:auto;top:50%;transform:translate(-50%,-50%);max-height:80vh}
@keyframes tutin{from{opacity:0;margin-top:8px}to{opacity:1;margin-top:0}}
#tut .tut-k{display:flex;justify-content:space-between;font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;letter-spacing:.08em;font-size:12.5px;color:var(--gold2)}
#tut .tut-bar{height:3px;background:var(--line);margin:7px 0 2px}#tut .tut-bar i{display:block;height:100%;background:var(--gold);transition:width .25s}
#tut .tut-t{font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;font-size:23px;line-height:1.1;margin:8px 0 6px;letter-spacing:.02em}
#tut .tut-b{font-size:15px;line-height:1.45;color:var(--text)}#tut .tut-b b{color:var(--gold2)}
#tut .tut-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px}
#tut .tut-row.col{flex-direction:column;align-items:stretch}
#tut .tut-nav{display:flex;gap:8px;align-items:center}
#tut .tut-go{border:0;background:var(--gold);color:#120d02;font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;letter-spacing:.06em;font-size:16px;padding:9px 18px 8px;clip-path:var(--slant);cursor:pointer}
#tut .tut-row.col .tut-go{font-size:18px;padding:12px}
#tut .tut-skip{background:none;border:0;color:var(--mut);font-size:13.5px;text-decoration:underline;padding:6px 0;cursor:pointer}
`;document.head.appendChild(c)})();

/* the first card on the page whose heading matches */
function tutCard(re){return [...document.querySelectorAll('main .card')].find(c=>{const h=c.querySelector('.h');return h&&re.test(h.textContent)})}

/* ---------- the stops ---------- */
const TUT_STEPS=[
/* ---- the draft ---- */
{id:'d.hello',track:'draft',since:1,sys:['goal','calendar'],t:'Welcome to the front office',
 b:()=>`You run a wrestling brand. First you draft a roster against ${tvRival()}. Then every week you book your show head-to-head against theirs, with a PPV every 4 weeks — ${tv('SEASON',()=>SEASON,40)} weeks from ${tvPPVs()[0]||'Revolution'} to ${tvPPVs().slice(-1)[0]||'Worlds End'}.<br><br><b>You win the season by gaining more fans.</b> Great shows earn fans; bad ones lose them.`},
{id:'d.cap',track:'draft',since:1,sys:['draft','cap','money'],sel:'main .card.dhead',t:'The salary cap',
 b:()=>`You have ${tvCap()?tvMoney(tvCap())+' a week':'a weekly cap'} to fill ${tv('draft rounds',()=>S.draft.rounds||24,24)} spots. Top stars cost far more than the midcard, so you can't draft an all-star team.<br><br>Anything you leave under the cap goes into your bank (×4) — money you'll spend all year on signings and production.`},
{id:'d.tape',track:'draft',since:1,sys:['ratings','popularity','alignment'],sel:'main .card.ttape',t:'Reading a wrestler',
 b:()=>`<b>Ring</b> makes matches good. <b>Mic</b> makes promos good. <b>Pop</b> (popularity) draws the crowd and moves fans the most.<br><br>Mix <span class="face">faces</span> and <span class="heel">heels</span> — face vs heel is how feuds catch fire. Styles matter too: some clash beautifully, some don't.`},
{id:'d.div',track:'draft',since:1,opt:true,sys:['divisions','titles'],sel:()=>[...document.querySelectorAll('main .chips')].find(e=>/women/i.test(e.textContent)),t:'Fill every division',
 b:()=>`There are men's, women's, tag and trios titles. Every show needs something for the women's division, and tag belts need partners who click.<br><br>Draft depth, not just headliners — tired stars have bad nights.`},
{id:'d.auto',track:'draft',since:1,opt:true,sys:['draft'],sel:'main [onclick^="simDraft"], main [onclick^="autoPick"]',t:'In a hurry?',
 b:()=>`<b>Auto-pick</b> takes the best fit for one pick. <b>Sim rest</b> drafts the rest of your roster for you.<br><br>When the draft ends, the tour picks up with your first week.`},

/* ---- the first week ---- */
{id:'s.show',track:'season',since:1,tab:'home',sel:'main .card.showcard',sys:['shows','calendar'],t:'Your show',
 b:()=>`Each week you book ${tv('show name',()=>esc(curShow().mine),'your show')} while ${tvRival()} books ${ON()?'theirs':tv('rival show',()=>esc(curShow().theirs),'theirs')}. The better show wins the night.<br><br>${tv('next PPV',()=>{const n=nextPPV();return n?`Next PPV: <b>${esc(n.n)}</b>${n.in?` in ${n.in} week${n.in>1?'s':''}`:' — this week'}. PPVs are where feuds pay off and fans swing big.`:''},'')}`},
{id:'s.war',track:'season',since:1,tab:'home',sel:()=>{const w=document.querySelector('main .war');return w&&w.closest('.card')},sys:['goal','fans'],t:'How you win',
 b:()=>`This is the scoreboard: <b>fans gained this season</b>. Your show rating earns or loses fans — the main event counts most, beating the rival's show adds a bonus, PPVs swing far more, and ${tv('All In',()=>PPVS[ALLIN_WEEK],'All In')} counts double.`},
{id:'s.brief',track:'season',since:4,tab:'home',opt:true,sel:'main [onclick="openBrief()"]',sys:['briefing','contracts','morale'],t:'The weekly briefing',
 b:()=>`The first time you open Home each week you get a rundown — <b>expiring contracts always come first</b> — then unhappy talent, injuries and what's coming. A <b>✍️ Contract countdown</b> card sits on Home whenever a deal is ${tv('CON_SOON',()=>CON_SOON,5)} weeks or less from ending (stars sooner), and you'll get a warning before you go live on anyone's last show. Wrestlers who want more will <b>pitch you</b> — a main event, a title shot, mic time, a raise. The unhappier they are, the more they ask.`},
{id:'s.mand',track:'season',since:1,tab:'home',opt:true,sel:'main .card.mand',sys:['mandates'],t:'Network mandates',
 b:()=>`The network wants something specific by the next PPV. Deliver for cash and fans; miss it and you lose fans. It's always on Home and Book with a live ✅/⏳ check on your card.`},
{id:'s.goal',track:'season',since:1,tab:'book',opt:true,sel:'main .card.wkg',sys:['weekly goals','chants'],t:'Small wins every week',
 b:()=>`A <b>weekly goal</b> pays a little cash and fans (no penalty for missing it), and the crowd <b>chants</b> for someone. Put them on the show for a bonus and a popularity bump.`},
{id:'s.card',track:'season',since:6,tab:'book',sel:'main .slot',sys:['card','promos'],t:'The running order',
 b:()=>`Weekly TV is ${tv('cardMatches',()=>cardMatches(false),3)} matches and 2 promos, plus an optional <b>bonus match</b> and <b>bonus promo</b> — book them when you have something worth showing, or leave them empty. PPVs are ${tv('cardMatches ppv',()=>cardMatches(true),5)} matches and a title challenge.<br><br>Promos build feud heat without anyone wrestling — a cheap way to make people care. Each kind has its own job: a <b>Sit-Down Interview</b> lifts morale, a <b>Faction Rally</b> lends a star's shine to a partner, a <b>Backstage Vignette</b> safely builds an unknown, a <b>Champion's Address</b> adds prestige to the belt. The picker marks ✓ Good fit when one suits who you've chosen. Hold and drag to reorder.`},
{id:'s.main',track:'season',since:1,tab:'book',sel:'main .slot.me',sys:['card','fans'],t:'The main event',
 b:()=>`The last match counts the most. Put your biggest names and hottest feud here, and make it the best thing on the show.`},
{id:'s.suggest',track:'season',since:1,tab:'book',opt:true,sel:'main [onclick="suggestFill()"]',sys:['booking'],t:'Need a starting point?',
 b:()=>`<b>Suggest the rest</b> fills any empty slots with a sensible card and keeps what you've already booked. Great for your first week — then tweak it.`},
{id:'s.buzz',track:'season',since:1,tab:'book',sel:()=>document.querySelector('main .slot .tellrow')||document.querySelector('main .slot:not(.done)'),sys:['ratings','chemistry','risk'],t:'Booking by feel',
 b:()=>`There's no star math while you book. Each match shows <b>crowd buzz</b> (🥶 → 🔥🔥🔥) and ▲/▼ tells on titles and finishes. Stipulations show a rough 📈 upside weighed against the 🔋 wear and 🩹 injury risk they add.<br><br>🎲 <b>Wild card</b> means it could land big or fall flat — first-time pairings, gimmick matches, screwy finishes, run-ins. Chemistry between two wrestlers is only a guess until they've shared a ring.`},
{id:'s.flow',track:'season',since:1,tab:'book',sel:'main .card.flowc',sys:['show flow'],t:'Show flow',
 b:()=>`The order matters. Open hot, keep the middle moving (back-to-back promos drag), build through the second half and close on your best match. This card grades your running order as you book.`},
{id:'s.feuds',track:'season',since:1,tab:'book',sel:()=>tutCard(/your feuds/i),sys:['feuds','heat','repetition'],t:'Feuds are the engine',
 b:()=>`Put the same two people in matches and promos week after week and heat builds: a rivalry at ${tvTier(0)}, a full feud at ${tvTier(1)}, a blood feud at ${tvTier(2)}. Face vs heel, title matches and messy finishes build the most.<br><br>Pay it off at a PPV once it's hot (35+) with a <b>clean finish</b>. Don't repeat the exact same thing two weeks running — the crowd tires of it.`},
{id:'s.stam',track:'season',since:1,tab:'book',opt:true,sel:'main details.lrd',sys:['stamina','injuries','durability'],t:'Stamina',
 b:()=>`Everyone has a stamina bar. A match drains it; a week off (or just a promo) refills it fastest. Below ${tv('FAT_OK',()=>100-FAT_OK,65)} stamina matches suffer, and below ${tv('FAT_RISK',()=>100-FAT_RISK,45)} injuries get likely. Rotate your stars — and check <b>Durability</b> on profiles: some bodies hold up, some don't.`},
{id:'s.live',track:'season',since:7,tab:'book',sel:'main .btn.live',sys:['live','calls','injuries'],t:'Go live',
 b:()=>`When every slot is filled, go live. Promos play out as short scenes where you make the calls (you'll hear how the crowd took it — 🥶 to 🔥🔥🔥 — but not the stars), and matches throw you decisions mid-match.<br><br>Calls stick: a risky spot can injure someone, a cheating heel can get disqualified, a partner can turn. ${ON()?'After the show,':"When the show airs, the results play out head to head, round by round — your segment against the rival's in the same slot — and the final star ratings land last (tap to hurry it, or Skip). Then"} tap <b>Why that rating?</b> to see what each part was worth.`},
{id:'s.stars',track:'season',since:1,tab:'roster',prep:()=>{rf='mine'},sel:()=>{const g=document.querySelector('main .cgrid');return g&&g.firstElementChild},sys:['popularity','the rub','development'],t:'Making new stars',
 b:()=>`Your top names can make the next ones. Beating someone more popular gives a wrestler <b>the rub</b> (an upset even more), and teaming with or sharing a multi-person match with a star rubs off too.<br><br>The very top is hard to reach and hard to hold: gains slow past 80 and 90, and stars at ${tv('UPKEEP_AT',()=>UPKEEP_AT,85)}+ slip in weeks they aren't featured. Tap any wrestler to see their best opponents and partners.`},
{id:'s.morale',track:'season',since:1,tab:'roster',prep:()=>{rf='mine'},sel:'main .card.phead',sys:['morale','contracts','promises'],t:'Keep them happy',
 b:()=>`Morale rises with main events, wins and kept promises, and drops when people sit or lose too much. Contracts run out — re-signing is a negotiation, and promises you make (main events, title shots, creative control) are contract terms. Break three and a wrestler may walk.`},
{id:'s.fa',track:'season',since:8,tab:'roster',prep:()=>{rf='fa'},after:()=>{rf='mine'},sel:()=>document.querySelector('main .cgrid')||tutCard(/on the market/i),sys:['free agency','offers','prospects','ROH','farm'],t:'Free agents & prospects',
 b:()=>`A few free agents are on the market at once, each for a few weeks. Big names (55+ popularity) want an offer — money plus promises — and ${tvRival()} can bid too, sealed. Scroll down to <b>Scouting</b>: prospects from the Indies, ROH and overseas. Sign them to AEW, or to your <b>🏟️ ROH</b> roster, where they develop at half salary without taking a roster spot until you call them up.`},
{id:'s.titles',track:'season',since:5,tab:'titles',sel:'main .card.belt',sys:['titles','prestige'],t:'The gold',
 b:()=>`The titles are split evenly between the shows, and yours start vacant — book a match and pick the title in the match editor to crown a champion. Nobody else can crown your belts. Defenses build a champion's credibility and the belt's prestige. Swap a title too fast and it loses prestige. The only way to take ${ON()?"another GM's":"the rival's"} gold is a PPV title challenge.`},
{id:'s.money',track:'season',since:3,tab:'office',sel:()=>tutCard(/finances/i),sys:['money','production','wages','stipulations'],t:'The money',
 b:()=>`Money comes from your TV deal, tickets, merch and ads — and hot shows earn more of all four. Payroll goes out every week. In the red, morale slips. Growing costs too: a bigger company pays bigger wages${tv('wage',()=>wageF('p')>1.01?` (yours: +${Math.round((wageF('p')-1)*100)}% right now)`:'',' ')}, bigger venues make production and stipulations pricier, and one show can only take in so much. Spend it on signings, production and stipulations when it'll pay off — money in the bank doesn't win the fan war.`},
{id:'s.end',track:'season',since:1,sel:'header .gsw',sys:['reference'],t:"You're ready",
 b:()=>`The ⚙️ menu has <b>How it all works</b> — the full rulebook — and you can replay this tour from there any time.<br><br>New things will get a quick tip the first time they come up. Go book a great show.`},

/* ---- one-time coach tips ---- */
{id:'t.editor',track:'tip',since:2,sel:'#modal .proj',sys:['ratings','chemistry','risk','stipulations'],t:'Crowd buzz',
 b:()=>`This is your read on the match: how hot the crowd is for it and whether it's a 🎲 wild card. Stipulations marked ⭐ are a <b>specialty</b> for someone in the match; each one shows its rough 📈 upside against the 🔋 wear and 🩹 injury risk it adds. Titles and finishes get ▲/▼ tells. Exact numbers stay hidden until after the show.`},
{id:'t.results',track:'tip',since:1,opt:true,sel:'#modal .whyd',sys:['ratings'],t:'Why that rating?',
 b:()=>`Open this under any of your matches to see what each part was worth — chemistry, stamina, the finish, the luck of the night. It's the fastest way to learn what works.`},
{id:'t.ppv',track:'tip',since:1,sel:'main .card.showcard',sys:['ppv','feuds','titles'],t:"It's PPV week",
 b:()=>`Bigger card, bigger crowd, bigger fan swings. This is the night to blow off hot feuds (35+ heat) with a clean finish, and your title challenge is the one way to take ${ON()?"another GM's":"the rival's"} gold.`}
];

/* ---------- saved progress (per device, never in the game save) ---------- */
function tutStore(){try{return JSON.parse(localStorage.getItem(TUT_KEY))||{}}catch(e){return {}}}
function tutPut(o){try{localStorage.setItem(TUT_KEY,JSON.stringify(Object.assign(tutStore(),o)))}catch(e){}}
function tutTipsOn(){return tutStore().tips===true}

/* ---------- the overlay ---------- */
let TUT=null;   /* {steps,i,track,label} while a tour is running */
let TUT_OFFER=null;

function tutEl(){let e=document.getElementById('tut');if(!e){e=document.createElement('div');e.id='tut';e.innerHTML='<div class="tut-hole"></div><div class="tut-card" role="dialog" aria-live="polite"></div>';document.body.appendChild(e)}return e}
function tutHide(){const e=document.getElementById('tut');if(e)e.remove();document.removeEventListener('keydown',tutKey)}
function tutFind(st){try{if(!st.sel)return null;const e=typeof st.sel==='function'?st.sel():document.querySelector(st.sel);return e&&e.getClientRects().length?e:null}catch(e){return null}}

function tutStart(track,ids){if(!S||(typeof TV!=='undefined'&&TV))return;
 const phaseOk=track==='draft'?S.phase==='draft':S.phase==='season'||S.phase==='over';
 if(!phaseOk&&!ids)return toast(track==='draft'?'The draft tour runs during the draft.':'The tour starts once the draft is done.');
 let steps=TUT_STEPS.filter(s=>s.track===track);if(ids)steps=steps.filter(s=>ids.includes(s.id));if(!steps.length)return;
 tutOfferClose();if(typeof closeModal==='function'&&!document.getElementById('modal').classList.contains('hidden'))closeModal();
 TUT={steps,i:0,track,back:typeof tab!=='undefined'?tab:'home',rf:typeof rf!=='undefined'?rf:'mine'};document.body.classList.add('lock');
 document.addEventListener('keydown',tutKey);tutShow(1)}

function tutKey(e){if(!TUT&&!TUT_OFFER)return;if(e.key==='Escape')return TUT?tutEnd(false):tutOfferClose();if(!TUT)return;if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();tutNext()}if(e.key==='ArrowLeft'){e.preventDefault();tutPrev()}}
function tutNext(){if(!TUT)return;const st=TUT.steps[TUT.i];if(st.after)try{st.after()}catch(e){}if(TUT.i>=TUT.steps.length-1)return tutEnd(true);TUT.i++;tutShow(1)}
function tutPrev(){if(!TUT||TUT.i===0)return;const st=TUT.steps[TUT.i];if(st.after)try{st.after()}catch(e){}TUT.i--;tutShow(-1)}

/* move to the stop's screen, find what it points at, skip optional stops whose target isn't on screen */
function tutShow(dir){if(!TUT)return;const st=TUT.steps[TUT.i];
 if(st.prep)try{st.prep()}catch(e){}
 if(st.tab&&typeof go==='function'&&(tab!==st.tab||st.prep))go(st.tab);
 setTimeout(()=>{if(!TUT||TUT.steps[TUT.i]!==st)return;const el=tutFind(st);
  if(st.sel&&!el&&st.opt){const j=TUT.i+dir;if(j>=0&&j<TUT.steps.length){TUT.i=j;return tutShow(dir)}}
  if(st.sel&&!el&&!st.opt&&!TUT_MISS.includes('target '+st.id))TUT_MISS.push('target '+st.id);
  if(el){const r=el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-90)el.scrollIntoView({block:r.height>innerHeight*.6?'start':'center',behavior:'instant'})}
  tutPaint(st,el)},st.tab?260:30)}

function tutPaint(st,el){if(!TUT)return;const box=tutEl(),hole=box.querySelector('.tut-hole'),card=box.querySelector('.tut-card');
 const n=TUT.steps.length,i=TUT.i,lab=TUT.track==='draft'?'Draft tour':TUT.track==='tip'?'Coach tip':TUT.ids?"What's new":'Your first week';
 card.innerHTML=`<div class="tut-k"><span>🎓 ${lab}</span>${n>1?`<span>${i+1} / ${n}</span>`:''}</div>${n>1?`<div class="tut-bar"><i style="width:${(i+1)/n*100}%"></i></div>`:''}<div class="tut-t">${st.t}</div><div class="tut-b">${st.b()}</div>
 <div class="tut-row">${n>1?`<button class="tut-skip" onclick="tutEnd(false)">${i===n-1?'':'Skip tour'}</button>`:'<span></span>'}<span class="tut-nav">${i>0?'<button class="mini" onclick="tutPrev()">‹ Back</button>':''}<button class="tut-go" onclick="tutNext()">${i===n-1?(TUT.track==='tip'?'Got it':'Let\'s go'):'Next ›'}</button></span></div>`;
 box.dataset.id=st.id;tutPlace(el)}

function tutPlace(el){const box=document.getElementById('tut');if(!box||!TUT)return;const hole=box.querySelector('.tut-hole'),card=box.querySelector('.tut-card');
 const H=innerHeight,W=innerWidth;let top=true;
 if(el){const r=el.getBoundingClientRect(),p=6;const t=Math.max(r.top-p,8),b=Math.min(r.bottom+p,H-8);
  hole.style.cssText=`display:block;top:${t}px;left:${Math.max(r.left-p,6)}px;width:${Math.min(r.width+p*2,W-12)}px;height:${Math.max(b-t,24)}px`;
  top=(t+b)/2>H/2;box.classList.remove('nohole')}
 else{hole.style.cssText='display:none';box.classList.add('nohole')}
 card.classList.toggle('at-top',el?top:false);card.classList.toggle('at-mid',!el)}

function tutEnd(done){if(!TUT)return;const T=TUT;TUT=null;tutHide();
 const st=T.steps[T.i];if(st&&st.after)try{st.after()}catch(e){}
 if(T.track!=='tip'){const o={};o[T.track]=TUT_REV;if(T.track==='season')o.tips=true;tutPut(o);document.body.classList.remove('lock');
  if(typeof rf!=='undefined')rf=T.rf;if(T.track==='season'&&typeof go==='function'&&S&&S.phase==='season')go(T.back==='menu'?'menu':'home')
  else if(typeof render==='function')render();
  if(!done&&T.track!=='tip')toast('Replay the tour any time from ⚙️ → Rookie orientation.')}}

/* ---------- offering the tour ---------- */
function tutOffer(track,ids){if(TUT||TUT_OFFER)return;TUT_OFFER={track,ids};const box=tutEl();box.classList.add('nohole','offer');box.querySelector('.tut-hole').style.display='none';
 const card=box.querySelector('.tut-card');card.classList.add('at-mid');
 const what=ids?`The tour has ${ids.length} new stop${ids.length>1?'s':''} since you took it — a quick look at what's changed.`:track==='draft'?'New to the job? A one-minute walk through the draft: the cap, what the numbers mean and who to look for.':"Your first week is here. Take two minutes to see how a show comes together and how you win the fan war.";
 card.innerHTML=`<div class="tut-k"><span>🎓 Rookie orientation</span></div><div class="tut-t">${ids?"What's new":track==='draft'?'Draft day':'Welcome to week 1'}</div><div class="tut-b">${what}</div>
 <div class="tut-row col"><button class="tut-go" onclick="tutAccept()">${ids?'Show me':'Show me around'}</button><button class="mini" onclick="tutDecline()">${ids?'Not now':'I know the ropes'}</button></div>`;
 document.addEventListener('keydown',tutKey)}
function tutOfferClose(){if(!TUT_OFFER)return;TUT_OFFER=null;if(!TUT)tutHide();const b=document.getElementById('tut');if(b)b.classList.remove('offer')}
function tutAccept(){const o=TUT_OFFER;TUT_OFFER=null;tutHide();if(o)tutStart(o.track,o.ids);if(TUT&&o&&o.ids)TUT.ids=o.ids}
function tutDecline(){const o=TUT_OFFER;tutOfferClose();if(!o)return;const p={};p[o.track]=o.ids?TUT_REV:-TUT_REV;if(o.track==='season'&&!o.ids)p.tips=true;tutPut(p);
 if(!o.ids)toast('No problem — the tour lives in ⚙️ → Rookie orientation.');if(typeof briefAuto==='function')briefAuto()}

/* who sees what, after every render */
function tutAuto(){if(!S||TUT||TUT_OFFER||(typeof TV!=='undefined'&&TV))return;
 if(typeof LIVE!=='undefined'&&LIVE)return;const m=document.getElementById('modal');if(m&&!m.classList.contains('hidden'))return;
 const st=tutStore();
 if(S.phase==='draft'&&st.draft===undefined&&!(S.draft&&S.draft.log&&S.draft.log.length>4))return tutOffer('draft');
 if(S.phase!=='season'||typeof tab==='undefined')return;
 /* brand-new games only: the first two weeks of the first year */
 if(st.season===undefined&&S.week<=2&&!(S.season>1)&&tab==='home')return tutOffer('season');
 /* took the tour before: offer just the stops that changed since */
 if(st.season>0&&st.season<TUT_REV&&tab==='home'){const ids=TUT_STEPS.filter(s=>s.track==='season'&&s.since>st.season).map(s=>s.id);if(ids.length)return tutOffer('season',ids);tutPut({season:TUT_REV})}
 if(tutTipsOn()&&tab==='book'&&tv('curShow',()=>curShow().ppv,false))tutTip('t.ppv')}

/* a one-time coach tip, shown the first time it applies */
function tutTip(id,force){if(TUT||TUT_OFFER||(typeof TV!=='undefined'&&TV))return;if(!force&&!tutTipsOn())return;const st=tutStore(),seen=st.seen||{};if(!force&&seen[id])return;
 const step=TUT_STEPS.find(s=>s.id===id);if(!step)return;
 setTimeout(()=>{if(TUT||TUT_OFFER)return;const el=tutFind(step);if(!el){if(!step.opt&&!TUT_MISS.includes('target '+id))TUT_MISS.push('target '+id);return}
  seen[id]=TUT_REV;tutPut({seen});TUT={steps:[step],i:0,track:'tip'};document.addEventListener('keydown',tutKey);
  const r=el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-90)el.scrollIntoView({block:'center',behavior:'instant'});tutPaint(step,el)},380)}

/* ---------- Game menu card ---------- */
function tutMenuCard(){if(!S)return '';const dr=S.phase==='draft',on=tutTipsOn();
 return `<div class="card mt"><div class="h small">🎓 Rookie orientation</div><p class="muted" style="margin-top:0">${dr?'A quick walk through the draft — the cap, the numbers and who to look for.':'A guided tour of how a show comes together, how feuds and stars are built, and how you win the fan war.'}</p>
 <button class="btn" onclick="tutStart('${dr?'draft':'season'}')">${dr?'Take the draft tour':'Take the tour'}</button>
 <div class="row sb mt"><span class="muted">Coach tips the first time something new comes up</span><button class="mini" onclick="tutPut({tips:${!on}${on?'':',seen:{}'}});render()">${on?'On':'Off'}</button></div></div>`}

/* ---------- hooks into the game ---------- */
(function(){
 if(typeof render==='function'){const r0=render;render=function(){const out=r0.apply(this,arguments);
  if(TUT){const st=TUT.steps[TUT.i];setTimeout(()=>{if(TUT&&TUT.steps[TUT.i]===st)tutPlace(tutFind(st))},40)}
  else setTimeout(()=>{try{tutAuto()}catch(e){}},420);return out}}
 /* the weekly briefing waits while the tour is up or about to be offered */
 if(typeof briefAuto==='function'){const b0=briefAuto;briefAuto=function(){if(TUT||TUT_OFFER)return;const st=tutStore();
  if(S&&S.phase==='season'&&st.season===undefined&&S.week<=2&&!(S.season>1))return;return b0.apply(this,arguments)}}
 if(typeof renderMatchEd==='function'){const m0=renderMatchEd;renderMatchEd=function(){const out=m0.apply(this,arguments);try{tutTip('t.editor')}catch(e){}return out}}
 if(typeof showResults==='function'){const s0=showResults;showResults=function(rv){const out=s0.apply(this,arguments);/* the solo reveal shows this tip itself once it finishes */if(rv!==true)try{tutTip('t.results')}catch(e){}return out}}
 let raf=0;const re=()=>{if(!TUT||raf)return;raf=requestAnimationFrame(()=>{raf=0;if(TUT)tutPlace(tutFind(TUT.steps[TUT.i]))})};
 addEventListener('resize',re);addEventListener('scroll',re,true);
 setTimeout(()=>{try{tutAuto()}catch(e){}},900);
})();
