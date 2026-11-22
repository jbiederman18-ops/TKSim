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
   • Keep each stop under TUT_WORDS words — it's a card on a phone. The full detail belongs in HOWTO (the ⚙️ rulebook).
   • Run `python3 tools/check-tutorial.py` — it plays every stop and tip in a headless browser and fails on any
     missing target, stale value, stop over the word limit, or text that reads like patch notes.
   WRITING A STOP — the reader has never seen this game, its changelog or its design notes:
   • Teach only what they need to do to win, and why it pays: "Give each crowd a match of its own", not how the engine works.
   • Describe the game as it is. Never mention what it doesn't have, used to have, or was changed to ("there's no
     forecast", "no longer", "instead of the old…") — a new player wouldn't expect any of it.
   • No designer rationale or reassurance ("money in the bank doesn't win the fan war", "money's tight early", "exact
     numbers stay hidden"). If a choice matters, state the choice and its payoff.
   • Skip what the screen already makes obvious; keep thresholds the player acts on (35+ heat, stamina 65).
   • When a system changes, REWRITE the stop from scratch for a first-timer — don't append the change to the old text.
     Appending is how stops drift into patch notes.
   • tools/check-tutorial.py fails on history/design phrasing (TUT_BANNED). If it flags a line, rewrite it, don't
     dodge the pattern. */
const TUT_REV=77;
const TUT_KEY='tksim_tut';
const TUT_WORDS=190;  /* longest a stop may be (checked by tools/check-tutorial.py) */
const TUT_MISS=[];

/* a live value from the game, with a fallback so the tour never breaks if a name changes */
function tv(k,f,fb){try{const v=f();if(v===undefined||v===null||(typeof v==='number'&&!isFinite(v)))throw 0;return v}catch(e){if(!TUT_MISS.includes(k))TUT_MISS.push(k);return fb}}
const tvMoney=n=>tv('money',()=>money(n),'$'+Math.round(n/1000)+'K');
const tvCap=()=>tv('draft cap',()=>S.draft.cap,0);
const tvPPVs=()=>tv('PPVS',()=>Object.values(PPVS),[]);
const tvRival=()=>tv('rival name',()=>ON()?'the other GMs':esc(S.rival),'the rival');

/* ---------- look (theme tokens, so every Look restyles it) ---------- */
(function(){const c=document.createElement('style');c.id='tutcss';c.textContent=`
#tut{position:fixed;inset:0;z-index:40;pointer-events:auto}
#tut.nohole{background:rgba(0,0,0,.72);animation:fadein .2s}
#tut .tut-hole{position:fixed;display:none;border-radius:4px;box-shadow:0 0 0 2px var(--gold),0 0 22px 2px rgba(216,180,73,.45),0 0 0 200vmax rgba(0,0,0,.72);transition:top .28s ease,left .28s ease,width .28s ease,height .28s ease;pointer-events:none}
#tut .tut-card{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom));width:min(440px,calc(100vw - 24px));max-height:46vh;overflow:auto;background:linear-gradient(180deg,var(--st1),var(--st2));box-shadow:inset 0 0 0 1px var(--gold),0 18px 50px rgba(0,0,0,.7);clip-path:var(--cut);padding:14px 16px 12px;color:var(--text);animation:tutin .22s ease}
#tut .tut-card.at-top{bottom:auto;top:calc(12px + env(safe-area-inset-top))}
#tut .tut-card.at-side{bottom:auto;top:50%;transform:translateY(-50%);max-height:80vh}
#tut .tut-card.at-mid{bottom:auto;top:50%;transform:translate(-50%,-50%);max-height:80vh}
@keyframes tutin{from{opacity:0;margin-top:8px}to{opacity:1;margin-top:0}}
#tut .tut-k{display:flex;justify-content:space-between;font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;letter-spacing:.08em;font-size:12.5px;color:var(--gold2)}
#tut .tut-bar{height:3px;background:var(--line);margin:7px 0 2px}#tut .tut-bar i{display:block;height:100%;background:var(--gold);transition:width .25s}
#tut .tut-t{font-family:'BC','Barlow Condensed',sans-serif;font-weight:800;font-style:italic;text-transform:uppercase;font-size:23px;line-height:1.1;margin:8px 0 6px;letter-spacing:.02em}
#tut .tut-b{font-size:15px;line-height:1.45;color:var(--text)}#tut .tut-b b{color:var(--gold2)}
#tut .tut-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px}/* v372: on a long stop the buttons stay pinned to the bottom of the card while the text scrolls */
#tut .tut-row.col{flex-direction:column;align-items:stretch}
#tut .tut-card>.tut-row{position:sticky;bottom:-12px;margin:12px -16px -12px;padding:10px 16px 12px;background:var(--st2);box-shadow:0 -16px 14px -6px var(--st2)}
html.lk-hy #tut .tut-card>.tut-row{background:#1a1a1e;box-shadow:0 -16px 14px -6px #1a1a1e}
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
{id:'d.hello',track:'draft',since:77,sys:['goal','calendar'],t:'Welcome to the front office',
 b:()=>`You run a wrestling brand. First you draft a roster against ${tvRival()} from AEW and WWE's combined talent pool. Then every week you book your show ${tv('league size',()=>typeof allIn==='function'&&allIn()?'against all of theirs (each night is ranked 1st to last)':'head-to-head against theirs','head-to-head against theirs')}, with a PPV every 4 weeks — ${tv('SEASON',()=>SEASON,40)} weeks from ${tvPPVs()[0]||'Royal Rumble'} to ${tvPPVs().slice(-1)[0]||'Survivor Series'}.<br><br><b>You win the season with the bigger audience</b> — five crowds, each wanting something different. Draft wrestlers who can give every one of them a show.`},
{id:'d.cap',track:'draft',since:1,sys:['draft','cap','money'],sel:'main .card.dhead',t:'The salary cap',
 b:()=>`You have ${tvCap()?tvMoney(tvCap())+' a week':'a weekly cap'} to fill ${tv('draft rounds',()=>S.draft.rounds||24,24)} spots, and stars cost far more than the midcard. Prices are weekly salaries: ▲ means above your budget per remaining pick, 🚫 means they won't fit.<br><br>You start with ${tvMoney(tv('START_BANK',()=>START_BANK,350))} in the bank. Draft to the cap for a stronger roster now, or leave room: whatever you don't spend goes into your bank (×4) for free agents, a bigger building and production later. Don't hoard stars — with more than ${tv('EGO_ROOM',()=>EGO_ROOM,10)}, the ones left out of the spotlight get restless.`},
{id:'d.tape',track:'draft',since:1,sys:['ratings','popularity','alignment','fan groups'],sel:'main .card.ttape',t:'Reading a wrestler',
 b:()=>`<b>Ring</b> makes matches good. <b>Mic</b> makes promos good. <b>Pop</b> (popularity) draws the crowd and moves fans the most. The symbol on their card is the crowd they draw.<br><br>Mix <span class="face">faces</span> and <span class="heel">heels</span>: face vs heel is how feuds catch fire. Each wrestler's profile shows their best opponents and partners once they've worked together.`},
{id:'d.crowds',track:'draft',since:77,sys:['fan groups','fans','draft'],sel:'main .chips.flfg',t:'Draft for your crowds',
 b:()=>{const L=g=>tv('fgLbl',()=>fgLbl(g),({cas:'Casuals',tech:'Technical',blood:'Bloodhounds',flip:'Flippy',chaos:'Chaos fiends'})[g]);
  return `Your audience is five crowds, and each wrestler draws one (shown by the symbol on their card):<br><br>${L('cas')} — by far the biggest. They come for big stars and hot feuds, and drive your TV deal.<br>${L('tech')} — want great wrestlers against great wrestlers, and submission matches.<br>${L('blood')} — want violence: cages and blood.<br>${L('flip')} — want high flyers and ladders.<br>${L('chaos')} — want run-ins, No DQ and madness.<br><br>The four smaller crowds buy the tickets and merch. Each needs a real match of its own every week, or it drifts away — so draft at least a pair for every crowd. <b>Tap a symbol here</b> to see only that crowd's wrestlers; ? means a wrestler hasn't found theirs yet.`}},
{id:'d.div',track:'draft',since:1,opt:true,sys:['divisions','titles'],sel:()=>[...document.querySelectorAll('main .chips')].find(e=>/women/i.test(e.textContent)),t:'Fill every division',
 b:()=>`Every show has a men's and a women's world title, midcard title and tag title (one show also has the trios belts). Draft enough women to fill a division and tag partners who click.<br><br>Draft depth, not just headliners — tired stars have bad nights.`},
{id:'d.auto',track:'draft',since:1,opt:true,sys:['draft'],sel:'main [onclick^="simDraft"], main [onclick^="autoPick"]',t:'In a hurry?',
 b:()=>`<b>Auto-pick</b> takes the best fit for one pick. <b>Sim rest</b> drafts the rest of your roster for you.<br><br>When ${tvRival()} pick${ON()?'':'s'}, their pick flashes up at the top of the screen. When the draft ends, the tour picks up with your first week.`},

/* ---- the first week: the essentials only — everything else is a coach tip the first time it comes up ---- */
{id:'s.show',track:'season',since:75,tab:'home',sel:'main .card.showcard',sys:['shows','calendar','goal','fans','fan groups'],t:'Your show',
 b:()=>`Each week you book ${tv('show name',()=>esc(curShow().mine),'your show')} while ${tvRival()} books ${ON()?'theirs':tv('rival show',()=>esc(curShow().theirs),'theirs')}. The better show wins the night.<br><br><b>You win the season with the bigger audience</b>, made of five crowds: ${typeof fgKey==='function'?fgKey():'Casuals, Technical, Bloodhounds, Flippy and Chaos fiends'}. The symbol on a wrestler's card shows which crowd they draw (? means they haven't found one yet). Give every crowd a real match of its own each week; a crowd you ignore drifts away. PPVs swing the most. ${tv('next PPV',()=>{const n=nextPPV();return n?`Next up: <b>${esc(n.n)}</b> in ${n.in} week${n.in===1?'':'s'}.`:''},'')}`},
{id:'s.attn',track:'season',since:57,tab:'book',sel:'main .card.attn',sys:['weekly goals','chants','promises','pitches','contracts','titles','morale','backstage heat','briefing','mandates','inbox'],t:'Needs your attention',
 b:()=>`Tonight's to-do list, checked off as you book. What blocks the show sits on top — empty slots, a promised match, someone waiting on an answer — with chances for bonus fans, tired wrestlers and expiring contracts below. Most items have a button that takes you straight to the fix.<br><br>Each week, wrestlers who need a decision — a pitch, a demand, a title shot, a contract, an injury, a trade, a prospect's tape — line up <b>🚪 outside your office</b>, the ${tv('DESK_MAX',()=>DESK_MAX,4)} most urgent first. Say yes and it joins this list. Keep your word and they deliver, and the story draws fans; break it and the whole locker room hears about it.<br><br>The rest of the week's news is in <b>📰 This week</b> on Home.`},
{id:'s.suggest',track:'season',since:56,tab:'book',opt:true,sel:'main [onclick="suggestFill()"]',sys:['booking'],t:'Need a starting point?',
 b:()=>`<b>Suggest the rest</b> fills your empty slots with the best matches on paper and leaves what you've booked alone. Promises, title defenses, feuds, stamina and morale are on you — it will book someone exhausted or miserable if they look best on paper.`},
{id:'s.buzz',track:'season',since:54,tab:'book',sel:()=>document.querySelector('main .tcs.act')||document.querySelector('main .tcs')||document.querySelector('main .rord.pips .slot .mpip')||document.querySelector('main .slot .tellrow')||document.querySelector('main .slot:not(.done)'),sys:['ratings','chemistry','risk','card','card table'],t:'Play your cards',
 b:()=>`Every wrestler is a card. The line under their name shows <b>R</b>ing, <b>M</b>ic and <b>P</b>op, and the one that matters for the spot you're booking lights up.<br><br><b>Tap an empty space</b> and your roster slides up, best fit first: anything owed tonight on top under <b>Needs you tonight</b>, then rivals of whoever's across the ring. Tap a card, then their opponent. For a bigger match, pick a shape at the top of the sheet — <b>Tag</b>, <b>Trios</b>, <b>8-man tag</b>, <b>Triple threat</b>, <b>Four-way</b>, <b>Squash</b> or <b>Open challenge</b>. Once both sides are set, the sheet's tabs add a <b>Stipulation</b>, <b>Title</b>, <b>Finish</b> and <b>Run-in</b>.<br><br>Tap <b>👑 Win</b> to pick the winner (<b>Pin</b> picks who takes the fall in bigger matches). Hold a slot's number to reorder the show. 🎲 on a slot means it could land big or fall flat.<br><br>Your <b>last match is the main event</b> and counts the most: put your biggest names and hottest feud there.`},
{id:'s.feuds',track:'season',since:74,tab:'book',sel:()=>tutCard(/your feuds/i),sys:['feuds','heat','repetition'],t:'Feuds are the engine',
 b:()=>`Put the same two people in matches and promos week after week and heat builds — fastest with face vs heel and a title on the line. A hot feud makes its matches better and hooks the casuals, and a gimmick match is the way to pay one off.<br><br>Once it's hot (35+), pay it off with a clean finish: at a PPV for the biggest swing, or on TV with <b>Make it the blow-off</b>. A feud left sitting goes stale — freshen it with a gimmick match or by taking it up a level, or blow it off. Don't run the exact same match two weeks running; the crowd tires of it.`},
{id:'s.tpic',track:'season',since:20,tab:'titles',sel:'main .card.tpic',sys:['titles','title shots','feuds','heat'],t:'The title picture',
 b:()=>`Every title shot you owe is here — from Rumble, tournament and Casino Gauntlet wins, pitches and contracts — with when it's due and how hot things are with the champion. Earning a shot starts the rivalry (🔥${tv('TP_SEED',()=>TP_SEED,15)}). Build it past the gold line (🔥${tv('TP_READY',()=>TP_READY,35)}) before the night: <b>🎤 Build it</b> books them face to face.`},
{id:'s.live',track:'season',since:44,tab:'book',sel:'main .btn.live',sys:['live','calls','injuries','promos','crowd','whispers','production','fan groups'],t:'Go live',
 b:()=>`Right above this button, pick tonight's <b>🎆 production</b> — bigger production lifts the whole show — and pin it to keep it every week. Then go live.<br><br>Most of the card plays out on its own. Now and then you get a live call: a <b>🎬 highlight reel</b> in a red-hot feud or a big match, or a disaster brewing in one of yours. Every choice shows its risk — Safe, Risky or Playing with fire — and long shots swing hardest either way. In a promo you call the tactic and your wrestler finds the words. <b>The crowd</b> heats up or cools through the night, and a hot one makes big calls swing further.<br><br>The reveal ends with how each of your crowds took the show, and <b>Why that rating?</b> shows what each part was worth. New things get a quick tip the first time they come up; ⚙️ has the full rulebook.`},

/* ---- one-time coach tips ---- */
{id:'t.wwe',track:'tip',opt:true,since:18,sel:'main .card.showcard',sys:['calendar','wwe','rumble','money in the bank'],t:'AEW meets WWE',
 b:()=>`The year alternates AEW and WWE's biggest PPVs — ${tvPPVs().join(', ')} — and both brands run every one.<br><br>🏟️ <b>${tv('Rumble',()=>esc(PPVS[RR_WEEK]),'Royal Rumble')}</b> (week ${tv('RR_WEEK',()=>RR_WEEK,4)}): your men's and women's Rumbles lock onto the card, and each winner earns a world title shot at <b>${tv('Mania',()=>esc(PPVS[WM_WEEK]),'WrestleMania')}</b>.<br>💼 <b>${tv('MITB',()=>esc(PPVS[MITB_WEEK]),'Money in the Bank')}</b> (week ${tv('MITB_WEEK',()=>MITB_WEEK,20)}): the ladder match winner holds the briefcase for a year and can cash in on a world champion any time — even right after the champion's match. Book the champion, then look in that match's <b>Finish</b> tab.`},
{id:'t.card',track:'tip',opt:true,since:68,sel:'main .slot, main .tcs',sys:['card','promos','squash'],t:'The running order',
 b:()=>`Weekly TV is ${tv('cardMatches',()=>cardMatches(false),3)} matches and 2 promos, plus a <b>bonus promo</b> when you have something worth saying. PPVs are ${tv('cardMatches ppv',()=>cardMatches(true),5)} matches.<br><br>Any match can be a 💪 <b>Squash</b>: a quick win that builds someone up but tops out around ${tv('SQ_CAP',()=>SQ_CAP,2.5)}★. Against local enhancement talent it's free; against your own roster the loser pays, and squashing the same wrestler again and again wears off.<br><br>Promos build heat without tiring anyone, and a promo with both sides of a later match hypes that match. Each kind has a job: a <b>Sit-Down Interview</b> lifts morale, a <b>Faction Rally</b> lends a star's shine to a partner, a <b>Backstage Vignette</b> safely builds an unknown, a <b>Champion's Address</b> adds prestige to the belt. The picker outlines in gold the kind that suits who you've chosen.`},
{id:'t.flow',track:'tip',opt:true,since:75,sel:'main .rord',sys:['crowd read','fans','fan groups'],t:'Your crowds',
 b:()=>`Each crowd grows when it gets a real match of its own: its wrestlers, or a stipulation it loves. The booking sheet tags those for you — <b>Bloodhounds thirst for this</b> on a cage, a ladder for Flippy, a submission match for Technical, No DQ or a run-in for the Chaos fiends. Gimmick matches take a toll — stamina, injury risk and cash — and the same one two weeks running pulls half. A second match for the same crowd counts for less, and each crowd <b>expects</b> more the more you give it. You see how each one took the show at the end of the reveal.`},
{id:'t.stam',track:'tip',opt:true,since:56,sel:'main details.lrd:not(.fbd)',sys:['stamina','injuries','durability'],t:'Stamina',
 b:()=>`A match drains stamina; a week off or a promo refills it. Below ${tv('FAT_OK',()=>100-FAT_OK,65)} stamina matches suffer, and below ${tv('FAT_RISK',()=>100-FAT_RISK,45)} injuries get likely. Rotate your stars, and check <b>Durability</b> on profiles — some bodies hold up better than others.`},
{id:'t.stars',track:'tip',opt:true,since:60,sel:()=>{const g=document.querySelector('main .cgrid, main .tcrg');return g&&g.firstElementChild},sys:['popularity','the rub','development'],t:'Making new stars',
 b:()=>`Your top names make the next ones. Beating someone more popular gives a wrestler <b>the rub</b> (an upset even more), and teaming with or sharing a multi-person match with a star rubs off too.<br><br>The very top is hard to reach and hard to hold: popularity climbs slower past 80 and 90, and stars at ${tv('UPKEEP_AT',()=>UPKEEP_AT,85)}+ slip in weeks they aren't featured.<br><br>In-ring and Mic grow with good matches and promos. Anyone can become a megastar, but some learn faster than others, and it's different every game. In-ring of ${tv('SKILL_AT',()=>SKILL_AT,85)}+ slips in weeks without a strong match. Tap any wrestler to see their best opponents and partners.`},
{id:'t.morale',track:'tip',opt:true,since:66,sel:'main .card.phead',sys:['morale','contracts','promises','grievances','pitches','friends'],t:'Keep them happy',
 b:()=>`TV time, wins, main events and kept promises lift morale; sitting at home, clean losses, exhaustion and low pay drag it down. Tap anyone to see their <b>Mood</b> and why. Below ${tv('MOR_SLUMP',()=>MOR_SLUMP,50)} they phone it in; above ${tv('MOR_FIRE',()=>MOR_FIRE,75)} they go the extra mile. Stars (${tv('EGO_POP',()=>EGO_POP,80)}+) want the spotlight: with more than ${tv('EGO_ROOM',()=>EGO_ROOM,10)} of them, the ones you leave out sour faster.<br><br><b>Backstage friends:</b> your locker room is split into hidden friend groups. When something big happens to someone — a promise kept or broken, a title win, a bad loss — their friends feel ${tv('FG_SHARE',()=>Math.round(FG_SHARE*100)+'%','about a third')} of it, so burning a midcarder can sour a main eventer. Their Mood says when it's about a friend, and you learn who's close as the season goes. If the locker room's average drops under ${tv('LR_MID',()=>LR_MID,66)}, every segment suffers a little.<br><br>Unhappy wrestlers escalate: pay demands, walkout threats, shoot promos, real walkouts and calls from ${tvRival()}.`},
{id:'t.fa',track:'tip',opt:true,since:65,sel:()=>document.querySelector('main .cgrid')||tutCard(/on the market/i),sys:['free agency','offers','prospects','ROH','farm'],t:'Free agents & prospects',
 b:()=>`A few free agents are on the market at a time, each for a few weeks. Big names (55+ popularity) want an offer — money plus promises — and ${tvRival()} can bid too, sealed. Undrafted wrestlers you sign in season 1 arrive with a chip on their shoulder: happier, sharper and gaining popularity for their first ${tv('PTW_WK',()=>PTW_WK,4)} weeks.<br><br>Under <b>Scouting</b>, sign prospects to AEW or to your <b>🏟️ ROH</b> roster, which books itself every week. Wins and good matches there build <b>call-up buzz</b>; when someone's ready they come to your office, or you can call anyone up from the ROH screen. Prospects also send tapes to your office: pass, keep following or sign them. A call-up or ROH signing can come with a new ring name and a face or heel turn.`},
{id:'t.titles',track:'tip',opt:true,since:67,sel:'main .card.belt',sys:['titles','prestige'],t:'The gold',
 b:()=>`The titles are split evenly between the shows, and yours start vacant — put one on the line in a match to crown a champion. Defenses build the champion and the belt's prestige; changing hands too fast drains it. Men's and women's titles stay in their division, so intergender matches are non-title. A champion who leaves your show (traded, poached, released) vacates the belt.`},
{id:'t.money',track:'tip',opt:true,since:72,sel:()=>tutCard(/finances/i),sys:['money','production','wages','stipulations','venues'],t:'The money',
 b:()=>`Money comes from your TV deal, tickets, merch and ads. Casuals drive the TV deal and ads; your hardcore crowds buy the tickets, merch and PPVs, and buy more when you serve them well. As your viewership grows, the network's executive brings a <b>viewership bonus</b> to your office after each PPV.<br><br>Payroll goes out every week, injured wrestlers run up rehab bills, and a broken contract term pays out to their agent. A bigger company pays bigger wages${tv('wage',()=>wageF('p')>1.01?` (yours: +${Math.round((wageF('p')-1)*100)}% right now)`:'',' ')}. In the red, morale slips.<br><br><b>Your building:</b> you start in the ${tv('BLDG',()=>BLDG[0].n,'Piddly-Ass Auditorium')}, and it caps what one show can take in. Move up in Front office for a move-in fee and weekly rent: tickets sell for more and good shows bring more fans — if you fill it. Serving your crowds, a strong card and a happy locker room fill the seats.`},
{id:'t.editor',track:'tip',since:70,sel:'#modal .det',sys:['ratings','chemistry','risk','stipulations'],t:'Match details',
 b:()=>`Each part of the segment gets up to five pips, with the reason beside it. Tap <b>?</b> next to Chemistry to see which styles click. <b>Change it</b> takes you back to the sheet.<br><br><b>Stipulations</b> lift whoever they suit, and the weaker wrestler most — give the match type to the one who needs carrying. Every wrestler secretly shines in one match type that doesn't fit their style (🎯); you find out the first time they work it.`},
{id:'t.results',track:'tip',since:1,opt:true,sel:'#modal .whyd',sys:['ratings'],t:'Why that rating?',
 b:()=>`Open this under any of your matches to see what each part was worth — chemistry, stamina, the finish, the luck of the night. It's the fastest way to learn what works.`},
{id:'t.ppv',track:'tip',since:1,sel:'main .card.showcard',sys:['ppv','feuds','titles','hype'],t:"It's PPV week",
 b:()=>`Bigger card, bigger crowd, bigger fan swings. Blow off your hot feuds (35+ heat) with a clean finish and pay off the title shots you owe.<br><br>The 🎟️ <b>hype meter</b> you built over the last few weeks pays off tonight in ticket sales and extra fans. Build the next one by announcing PPV matches and nailing the go-home show.`}
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
 card.innerHTML=`<div class="tut-k"><span>🎓 ${lab}</span>${n>1?`<span>${i+1} / ${n}</span>`:''}</div>${n>1?`<div class="tut-bar"><i style="width:${(i+1)/n*100}%"></i></div>`:''}<div class="tut-t">${typeof st.t==='function'?st.t():st.t}</div><div class="tut-b">${st.b()}</div>
 <div class="tut-row">${n>1?`<button class="tut-skip" onclick="tutEnd(false)">${i===n-1?'':'Skip tour'}</button>`:'<span></span>'}<span class="tut-nav">${i>0?'<button class="mini" onclick="tutPrev()">‹ Back</button>':''}<button class="tut-go" onclick="tutNext()">${i===n-1?(TUT.track==='tip'?'Got it':'Let\'s go'):'Next ›'}</button></span></div>`;
 box.dataset.id=st.id;tutPlace(el)}

function tutPlace(el){const box=document.getElementById('tut');if(!box||!TUT)return;const hole=box.querySelector('.tut-hole'),card=box.querySelector('.tut-card');
 const H=innerHeight,W=innerWidth;let top=true;
 if(el){const r=el.getBoundingClientRect(),p=6;const t=Math.max(r.top-p,8),b=Math.min(r.bottom+p,H-8);
  hole.style.cssText=`display:block;top:${t}px;left:${Math.max(r.left-p,6)}px;width:${Math.min(r.width+p*2,W-12)}px;height:${Math.max(b-t,24)}px`;
  top=(t+b)/2>H/2;box.classList.remove('nohole')}
 else{hole.style.cssText='display:none';box.classList.add('nohole')}
 card.classList.toggle('at-top',el?top:false);card.classList.toggle('at-mid',!el);
 /* v374: on a computer screen the card sits beside what it points at when there's room, instead of on top of it */
 let side=null;if(el&&W>=1100&&!(typeof TV!=='undefined'&&TV)){const r=el.getBoundingClientRect(),cw=Math.min(440,W-24)+32;if(W-r.right>=cw)side=Math.round(r.right+16);else if(r.left>=cw)side=Math.round(r.left-cw+16);
  /* a tall target leaves no room above or below either: hug the window edge with more space so less of it is covered */
  else if(r.height>H*.45)side=W-r.right>=r.left?Math.round(W-cw+16):16}
 card.classList.toggle('at-side',side!=null);card.style.left=side!=null?side+'px':''}

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
 if(!o.ids)toast('No problem — the tour lives in ⚙️ → Rookie orientation.')}

/* who sees what, after every render */
function tutAuto(){/* v238: a draft-tour offer left unanswered (say, on auto-draft) must not linger into the season or over a live show */
 if(TUT_OFFER&&S&&((TUT_OFFER.track==='draft'&&S.phase!=='draft')||(typeof LIVE!=='undefined'&&LIVE)||(typeof partyLiveTurn==='function'&&partyLiveTurn())))tutOfferClose();
 if(!S||TUT||TUT_OFFER||(typeof TV!=='undefined'&&TV))return;
 if(typeof LIVE!=='undefined'&&LIVE)return;const m=document.getElementById('modal');if(m&&!m.classList.contains('hidden'))return;
 const st=tutStore();
 /* v412: the draft tour starts on its own (no offer to wave off), so every new GM drafts knowing what to look for.
    Skip tour is still there, and finishing or skipping it marks it done on this device. Not in the WWE supplemental draft,
    and not for someone who has already started picking. */
 if(xrIntroDue())return xrIntro();
 if(S.phase==='draft'&&!(st.draft>0)&&S.draft&&!S.draft.supp&&!(typeof draftRoster==='function'&&draftRoster('p').length))return tutStart('draft');
 if(S.phase!=='season'||typeof tab==='undefined')return;
 /* brand-new games only: the first two weeks of the first year */
 if(st.season===undefined&&S.week<=2&&!(S.season>1)&&tab==='home')return tutOffer('season');
 /* took the tour before: offer just the stops that changed since */
 if(st.season>0&&st.season<TUT_REV&&tab==='home'){const ids=TUT_STEPS.filter(s=>s.track==='season'&&s.since>st.season).map(s=>s.id);if(ids.length)return tutOffer('season',ids);tutPut({season:TUT_REV})}
 if(!tutTipsOn())return;
 /* v186: players who took the long tour already saw what the new coach tips teach */
 if(st.season>0&&st.season<18&&!st.mig18){const seen=st.seen||{};TUT_STEPS.filter(s=>s.track==='tip'&&s.since===18).forEach(s=>seen[s.id]=TUT_REV);tutPut({seen,mig18:true});return}
 if(tab==='book'&&tv('curShow',()=>curShow().ppv,false))return tutTip('t.ppv');
 /* tips for a screen fire the first time you visit it */
 if(tab==='titles')return tutTip('t.titles');
 if(tab==='office')return tutTip('t.money');
 if(tab==='roster'&&typeof rf!=='undefined'){if(rf==='fa')return tutTip('t.fa');if(rf==='mine'){const seen=st.seen||{};return tutTip(seen['t.stars']?'t.morale':'t.stars')}}
 /* the rest come up when they matter, at most one a week so they don't pile up */
 if(st.tipW===AW())return;const seen=st.seen||{};const want=[];
 if(tab==='home'&&S.week>=2)want.push('t.wwe');
 if(tab==='book'&&S.week>=2)want.push('t.card');
 if(tab==='book'&&tv('FAT_OK',()=>ownList('p').some(w=>!w.inj&&sta(w)<100-FAT_OK),false))want.push('t.stam');
 if(tab==='book'&&S.week>=3)want.push('t.flow');
 const id=want.find(x=>!tipSeen(seen,x));if(id){tutPut({tipW:AW()});tutTip(id)}}

/* ---------- v413: the cold open. A brand-new game opens with X Redditino, your Head of PR, waking you up for the draft.
   Plays once per game (remembered on this device by the game's seed), before the draft tour, and holds the draft until
   you're up. Not in the WWE supplemental draft, not on the TV, not once you've made a pick. */
let XR_INTRO=false;
function xrIntroSeen(){const l=tutStore().xri;return Array.isArray(l)&&l.includes(S.seed)}
function xrIntroDue(){return !!(S&&S.phase==='draft'&&S.draft&&!S.draft.supp&&S.season===1&&!(typeof TV!=='undefined'&&TV)
 &&!(typeof draftRoster==='function'&&draftRoster('p').length)&&!xrIntroSeen())}
function xrIntroLine(){const ss=tv('show names',()=>showNames(),{});
 const rk=ON()?tv('league seats',()=>localSeats().find(k=>k!=='p'),'ai'):'ai';
 const rn=tv('rival name',()=>nameOf(rk),''),rs=ss[rk]||'',mine=ss.p||'your show';
 const known=rn&&!/^(open seat|waiting for a gm|bye week)$/i.test(rn);
 const who=known?`${rn}’s show${rs?' '+rs:''}`:rs?`The competition over at ${rs}`:'The competition';
 const cap=tvCap();const bank=cap?`${tvMoney(cap)} a week`:tvMoney(tv('START_BANK',()=>START_BANK,350));
 return [`Boss! You’re finally awake! Good Lord, I don’t know how you fell asleep at a time like this! ${who} is snatching up wrestlers left and right, and all the socials are saying you’ve lost your touch and they’re losing the feeling!`,
  `Show them you’re wrong, boss. I know you can be the greatest wrestling booker to have ever lived. You’ve got ${bank} to build your perfect roster, and ${mine} goes live this week.`,
  `The network’s counting on you, and I’m counting on you. I can’t go back to doing the Wendy’s tweets, man. I can’t.`]}
function xrIntro(){if(XR_INTRO||typeof openModal!=='function')return;
 const lines=xrIntroLine();XR_INTRO={lines,i:0};xrIntroPage()}
/* v418: it plays like a highlight reel — the live stage with X Redditino on camera, his name tab on the dialogue box, each
   paragraph typed out with the dialogue blips, a BOSS! shout to wake you, and a LET'S GO! as you head into the draft.
   Tap the box (or the button on the last page) to keep it moving; a tap mid-line finishes the line. */
const xrRM=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function xrBtn(){return `<span class="key"><span>A</span></span><div>✨ "Let's go make some magic."</div>`}
function xrStage(){return `<div class="sd solo xr-sd" id="sd" onclick="xrIntroTap()"><div class="sdpan" id="sdpan"><div class="sdc ca xr-c">
 <div class="sdph xr-ph" id="xrPh"><div class="xr-mono"><b>XR</b><i>📱</i></div></div>
 <div class="sdpl"><b>X Redditino</b><span>Head of PR</span></div></div></div>
 <div class="sdflash" id="sdflash"></div><div class="sdfx" id="sdfx"></div></div>`}
function xrBox(){return `<div class="sdbox k-q" id="sdbox" onclick="xrIntroTap()"><div class="sdtab other">X Redditino</div><div class="sdsay" id="sdsay"></div><span class="sdnx" id="sdnx">▼</span></div>`}
function xrLow(last){return last?`<button class="choice xr-go" id="xriGo" onclick="xrIntroTap()">${xrBtn()}</button>`:`<div class="sdhint" id="xriGo">Tap to continue</div>`}
function xrIntroPage(){const X=XR_INTRO;if(!X)return;
 openModal(`<div class="sdw xr-w">${typeof liveHd==='function'?liveHd('','Draft day','Wake up, boss',[],'📱 Incoming'):''}${xrStage()}${xrBox()}<div id="xriLow">${xrLow(false)}</div></div>`);
 const m=document.getElementById('modal');if(m)m.dataset.xri='1';
 xrShout('Boss!','',()=>xrType())}
/* a shout across the stage, with the flash and the shake */
function xrShout(t,kind,then){const fx=document.getElementById('sdfx'),sd=document.getElementById('sd'),fl=document.getElementById('sdflash');
 if(!fx||xrRM()){if(then)then();return}
 fx.innerHTML=`<div class="sdshout ${kind}"><span>${esc(t)}</span></div>`;
 if(fl){fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on')}
 if(sd){sd.classList.remove('shake');void sd.offsetWidth;sd.classList.add('shake')}
 try{if(window.SFX)SFX.play(kind==='gold'?'pop':'door')}catch(e){}
 const X=XR_INTRO;if(X)X.busy=true;
 setTimeout(()=>{if(XR_INTRO!==X)return;fx.innerHTML='';if(X)X.busy=false;if(then)then()},kind==='gold'?750:820)}
/* type the current paragraph; the whole line is laid out first so the box never grows while it types */
function xrType(){const X=XR_INTRO;if(!X)return;const el=document.getElementById('sdsay'),nx=document.getElementById('sdnx'),ph=document.getElementById('xrPh');
 const t=X.lines[X.i],last=X.i>=X.lines.length-1;if(!el)return;if(nx)nx.classList.remove('on');
 const low=document.getElementById('xriLow');if(low)low.innerHTML=xrLow(false);
 if(ph){ph.classList.remove('talk');void ph.offsetWidth;ph.classList.add('talk')}
 const fin=()=>{clearInterval(X.iv);X.iv=null;X.typing=null;el.textContent=t;if(nx)nx.classList.add('on');
  if(last&&low){low.innerHTML=xrLow(true);try{MODAL_AT=Date.now()}catch(e){}/* the tap that finished the line can't also fire the button */}};
 if(xrRM()){fin();return}
 const A=document.createTextNode(''),H=document.createElement('span');H.className='sdtw';H.textContent=t;el.textContent='';el.append(A,H);
 let i=0;X.typing=fin;X.iv=setInterval(()=>{i+=2;A.data=t.slice(0,i);if(H.firstChild)H.firstChild.data=t.slice(i);try{if(window.SFX)SFX.blip()}catch(e){}if(i>=t.length)fin()},20)}
window.xrIntroTap=function(){const X=XR_INTRO;if(!X||X.busy)return;
 if(X.typing)return X.typing();
 if(X.i>=X.lines.length-1){X.busy=true;return xrShout("Let's go!",'gold',()=>xrIntroDone())}
 X.i++;xrType()};
window.xrIntroNext=window.xrIntroTap;
/* however the sheet closes (the button, swipe-down, back, tapping outside), the opening counts as played and the draft
   tour starts right away, even on a device that has seen it before */
function xrIntroEnd(){if(!XR_INTRO)return;XR_INTRO=false;const md=document.getElementById('modal');if(md)delete md.dataset.xri;const l=tutStore().xri;const seen=Array.isArray(l)?l.slice(-30):[];if(S&&!seen.includes(S.seed))seen.push(S.seed);tutPut({xri:seen});
 if(S&&S.phase==='draft'&&S.draft&&!S.draft.supp&&!TUT){try{tutStart('draft')}catch(e){}}
 if(!TUT)setTimeout(()=>{try{tutAuto()}catch(e){}},250)}
window.xrIntroDone=function(){const X=XR_INTRO;if(X&&X.iv)clearInterval(X.iv);if(typeof closeModal==='function')closeModal();xrIntroEnd()};
(function(){const c=document.createElement('style');c.textContent=`
.xr-sd .sdpan{width:100%}
.xr-ph{display:grid;place-items:center;background:radial-gradient(80% 60% at 50% 35%,#2a2214,#0c0c0e 75%)}
.xr-mono{display:grid;justify-items:center;gap:6px}
.xr-mono b{font:900 italic clamp(84px,26vw,140px)/.85 'BC','Barlow Condensed',sans-serif;letter-spacing:-.02em;background:linear-gradient(180deg,#fff6d6,var(--gold2) 40%,var(--gold) 70%,var(--gold3));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 rgba(0,0,0,.6))}
.xr-mono i{font-style:normal;font-size:34px;animation:xrbuzz 1.1s ease-in-out infinite}
@keyframes xrbuzz{0%,60%,100%{transform:none}65%{transform:rotate(-12deg)}72%{transform:rotate(10deg)}79%{transform:rotate(-8deg)}86%{transform:rotate(6deg)}}
.xr-w .sdbox{min-height:150px}
.xr-go{margin-top:12px;animation:sdin .3s ease-out}
@media (prefers-reduced-motion:reduce){.xr-mono i{animation:none}}`;document.head.appendChild(c)})();

/* v418: the draft holds still — the rival stays off the clock and "The pick is in" waits — while the opening or the draft tour
   is up, while either is still due to start (the gap of a render or two before tutAuto opens them), and while any sheet is open.
   Matches tutAuto's own rules for when the opening and the tour start, so the hold always lifts. Never on the TV. */
function draftHold(){if(!S||S.phase!=='draft'||(typeof TV!=='undefined'&&TV))return false;
 if(TUT||TUT_OFFER||XR_INTRO)return true;
 const m=document.getElementById('modal');if(m&&!m.classList.contains('hidden'))return true;
 if(xrIntroDue())return true;
 return !(tutStore().draft>0)&&!!S.draft&&!S.draft.supp&&!(typeof draftRoster==='function'&&draftRoster('p').length)}
window.draftHold=draftHold;

/* v350: a tip counts as seen only if it was seen after its text last changed (its `since`), so a reworded tip comes up again once */
function tipSeen(seen,id){const v=seen[id];if(!v)return false;const s=TUT_STEPS.find(x=>x.id===id);return !(typeof v==='number'&&s&&s.since>v)}
/* a one-time coach tip, shown the first time it applies */
function tutTip(id,force){if(TUT||TUT_OFFER||(typeof TV!=='undefined'&&TV))return;if(!force&&!tutTipsOn())return;const st=tutStore(),seen=st.seen||{};if(!force&&tipSeen(seen,id))return;
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
 if(typeof closeModal==='function'){const c0=closeModal;closeModal=window.closeModal=function(){const out=c0.apply(this,arguments);try{xrIntroEnd()}catch(e){}return out}}
 if(typeof segDetails==='function'){const d0=segDetails;segDetails=window.segDetails=function(){const out=d0.apply(this,arguments);try{tutTip('t.editor')}catch(e){}return out}}
 if(typeof showResults==='function'){const s0=showResults;showResults=function(rv){const out=s0.apply(this,arguments);/* the solo reveal shows this tip itself once it finishes */if(rv!==true)try{tutTip('t.results')}catch(e){}return out}}
 let raf=0;const re=()=>{if(!TUT||raf)return;raf=requestAnimationFrame(()=>{raf=0;if(TUT)tutPlace(tutFind(TUT.steps[TUT.i]))})};
 addEventListener('resize',re);addEventListener('scroll',re,true);
 setTimeout(()=>{try{tutAuto()}catch(e){}},900);
})();
