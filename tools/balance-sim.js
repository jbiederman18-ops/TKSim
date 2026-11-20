/* Injected into the game page. Plays whole seasons with an automated GM and returns per-season stats.

   The bot plays like an attentive player who still lets the assistant do the creative booking:
   • the office line: front-office situations get a random answer; wrestler pitches get a trial about half the time
     (otherwise a gentle no); expiring contracts are re-signed by the offline rival's rule
   • the checklist (v352, opt.checklist): before tapping Suggest the rest it books what the Needs your attention list
     asks for — promised and contracted matches, contract clauses, pitch trials, the most overdue title defense, the
     weekly goal and the crowd's chant. Since v265 Suggest the rest ignores all of that on purpose, so a bot that only
     taps Suggest breaks every promise and its morale and fans fall well below any real player's. opt.checklist=false
     keeps that "lazy" GM for comparison.
   • stamina: anyone close to injury risk sits the week out (Suggest stopped protecting tired wrestlers in v353)
   • the card: Suggest the rest (or the old hands-on assistant with opt.engaged), then calls made by the rival's rules
   • money: production bought the way the rival buys it (opt.spend, on by default in the sweep)
   For digging into a result: opt.skip leaves out checklist steps by name (promises, clauses, trials, defenses, goal, chant,
   promos) and opt.pitch forces one answer to every pitch ('try', 'go' or 'no'); each season reports cl, the must-dos booked. */
window.SIM = async function (opt) {
  const noop = () => {};
  render = noop; toast = noop; localBackup = noop; saveLocal = () => true; save = noop;
  if (typeof cloudSoon === 'function') cloudSoon = noop;
  const errs = [];
  const nanScan = () => {
    const bad = [];
    for (const w of Object.values(S.w)) for (const k of ['pop', 'ring', 'mic', 'mor', 'fat', 'sal', 'con'])
      if (typeof w[k] === 'number' && !isFinite(w[k])) bad.push(w.name + '.' + k);
    for (const b of ['p', 'ai']) { if (!isFinite(S.money[b])) bad.push('money.' + b); if (!isFinite(S.fans[b])) bad.push('fans.' + b) }
    return bad;
  };
  const owned = b => Object.values(S.w).filter(w => w.own === b);

  /* the checklist: the must-dos a player books by hand before tapping Suggest the rest (Suggest's own pre-v265 logic) */
  const bookChecklist = () => {
    const sh = curShow(); const c = S.card.p; const used = new Set(); let n = 0;
    c.forEach(sl => { if (!sl.d) return; if (sl.k === 'match') sl.d.sides.flat().forEach(id => id && used.add(id)); if (sl.k === 'promo') { used.add(sl.d.a); if (sl.d.b) used.add(sl.d.b) } if (sl.k === 'chal' && sl.d.c) used.add(sl.d.c); if (sl.k === 'xo') used.add(sl.d.a) });
    (S.trials || []).forEach(t => { if (t.goal === 'rest') used.add(t.a) });
    const W = id => S.w[id]; const ok = id => { const w = W(id); return !!(w && w.own === 'p' && !w.inj && !used.has(id)) };
    const mIdx = () => c.map((sl, i) => sl.k === 'match' && !sl.opt ? i : -1).filter(i => i >= 0); const mainI = () => { const l = mIdx(); return l[l.length - 1] };
    const empty = () => mIdx().filter(i => !c[i].d);
    const onCard = id => c.some(sl => sl.d && (sl.k === 'match' ? sl.d.sides.flat().includes(id) : sl.k === 'promo' && (sl.d.a === id || sl.d.b === id)));
    const fit = w => sta(w) >= 100 - FAT_RISK;
    const pool = (g, ex) => ownList('p').filter(w => ok(w.id) && (!g || w.g === g) && fit(w) && !(ex || []).includes(w.id)).sort((a, b) => b.pop - a.pop);
    /* v354: picks the opponent the way a player reads the match tell — the game's own preview (opt.crude: the old pop formula) */
    const oppFor = (a, ex, g) => { let bo = null, bv = -1e9; pool(g || W(a).g, [a].concat(ex || [])).slice(0, opt.crude ? 12 : 30).forEach(w => { if (inTeam(a, w.id)) return;
      let v; if (opt.crude) v = w.pop + heatOf(a, w.id) * 1.2 + chemOpp(W(a), w) * 1.2 - recentMeets(a, w.id).length * 25;
      else { try { v = rateMatch({ type: 'singles', stip: 'std', sides: [[a], [w.id]], winner: 0, title: '' }, { ppv: sh.ppv, preview: true }).raw } catch (e) { v = -1e9 } }
      if (v > bv) { bv = v; bo = w } }); return bo };
    const winner = (sides, force) => { if (force != null) return force; let bi = 0, bv = -1e9; sides.forEach((sd, i) => { const v = avg(sd.map(id => W(id).pop + (W(id).mom || 0) * 3)) + (sd.some(id => typeof ccOn === 'function' && ccOn(W(id))) ? 50 : 0); if (v > bv) { bv = v; bi = i } }); return bi };
    const put = (i, type, sides, o) => { o = o || {}; c[i].d = { type, stip: o.stip || 'std', sides, winner: winner(sides, o.win), title: o.title || '' }; sides.flat().forEach(id => used.add(id)); n++ };
    const slotFor = main => { const e = empty(); if (!e.length) return -1; const mi = mainI(); if (main) return e.includes(mi) ? mi : -1; const nm = e.filter(i => i !== mi); return nm.length ? nm[0] : e[0] };
    const singlesTitle = (a, b) => (eligibleTitles({ type: 'singles', sides: [[a], [b]] }).filter(t => S.titles[t].kind === 'singles' && S.titles[t].holders.length))[0] || '';
    const step = (name, f) => { if ((opt.skip || []).includes(name)) return; const n0 = n; try { f() } catch (e) { errs.push('checklist ' + name + ': ' + e.message) } if (n > n0) cur.cl[name] = (cur.cl[name] || 0) + n - n0 };
    /* 1 · promised and contracted matches due tonight */
    step('promises', () => duePromises().forEach(pr => { if (!ok(pr.a) || !ok(pr.b)) return; const big = pr.kind === 'contract' || pr.kind === 'shot' || pr.ppv; let i = slotFor(big); if (i < 0) i = slotFor(false); if (i < 0) return;
      const t = pr.title && S.titles[pr.title] && S.titles[pr.title].holders.length ? pr.title : singlesTitle(pr.a, pr.b); put(i, 'singles', [[pr.a], [pr.b]], { stip: pr.stip || 'std', title: t }) }));
    /* 2 · contract clauses: a main event owed, a title shot owed, every PPV */
    step('clauses', () => { if (typeof dealOwed === 'function') dealOwed().forEach(({ w, k }) => { if (!ok(w.id) && !(k === 'me' && onCard(w.id))) return; const d = w.deal;
      if (k === 'me' && !onCard(w.id) && d.me.need - d.me.got >= d.me.by - AW() + 1) { const i = slotFor(true); const o = oppFor(w.id); if (i >= 0 && o) put(i, 'singles', [[w.id], [o.id]]) }
      else if (k === 'shot' && AW() >= d.shot.by - 1 && !onCard(w.id)) { const t = Object.values(S.titles).find(t => t.kind === 'singles' && t.g === w.g && t.holders.length === 1 && ok(t.holders[0])); const i = slotFor(false); if (t && i >= 0) put(i, 'singles', [[t.holders[0]], [w.id]], { title: t.id }) }
      else if (k === 'ppv' && sh.ppv && !onCard(w.id)) { const i = slotFor(false); const o = oppFor(w.id); if (i >= 0 && o) put(i, 'singles', [[w.id], [o.id]]) } }) });
    /* 3 · pitch trials a match can keep */
    step('trials', () => (S.trials || []).forEach(t => { const A = W(t.a); if (!A || A.own !== 'p' || A.inj || onCard(t.a) || !ok(t.a)) return; const B = t.b && W(t.b);
      if (t.goal === 'vs' && B && ok(t.b)) { const i = slotFor(false); if (i >= 0) put(i, 'singles', [[t.a], [t.b]]) }
      else if (t.goal === 'me') { const i = slotFor(true); const o = oppFor(t.a); if (i >= 0 && o) put(i, 'singles', [[t.a], [o.id]]) }
      else if (t.goal === 'wins') { const i = slotFor(false); const l = pool(A.g, [t.a]).filter(w => w.pop <= A.pop + 5); const o = l[l.length > 3 ? 2 : 0] || oppFor(t.a); if (i >= 0 && o) put(i, 'singles', [[t.a], [o.id]], { win: 0 }) }
      else if (t.goal === 'title' && t.title && S.titles[t.title]) { const T = S.titles[t.title]; if (T.kind === 'singles' && T.holders.length === 1 && ok(T.holders[0])) { const i = slotFor(false); if (i >= 0) put(i, 'singles', [[T.holders[0]], [t.a]], { title: T.id }) } }
      else if (t.goal === 'team' && B && ok(t.b)) { const opp = pool(A.g, [t.a, t.b]).slice(0, 2); const i = slotFor(false); if (i >= 0 && opp.length === 2) put(i, 'tag', [[t.a, t.b], opp.map(w => w.id)]) } }));
    /* 4 · titles: crown your vacant belts (every new game starts with them vacant), then the most overdue defense (up to 3 on a PPV) */
    step('defenses', () => { const mine = t => !t.br || t.br === 'p';
      const vac = Object.values(S.titles).filter(t => !t.holders.length && mine(t) && (t.kind === 'singles' || t.kind === 'tag'));
      const idle = Object.values(S.titles).filter(t => t.holders.length && t.holders.every(h => W(h) && W(h).own === 'p') && t.last != null && S.week - t.last >= (sh.ppv ? 2 : 4)).sort((a, b) => a.last - b.last);
      let k = c.filter(sl => sl.k === 'match' && sl.d && sl.d.title).length; const max = sh.ppv ? 3 : 1;
      for (const t of vac) { if (k >= max) break; if (c.some(sl => sl.k === 'match' && sl.d && sl.d.title === t.id)) continue; const i = slotFor(false); if (i < 0) break;
        let sides = null;
        if (t.kind === 'singles') { const l = pool(t.g); const o = l[0] && oppFor(l[0].id, [], t.g); if (o) sides = [[l[0].id], [o.id]] }
        else { const tm = S.teams.map(tt => tt.m.filter(id => ok(id) && W(id).g === t.g && fit(W(id)))).filter(a => a.length >= 2).map(a => a.slice(0, 2)); const b = tm[0] && tm.find(a => !a.some(id => tm[0].includes(id))); if (b) sides = [tm[0], b] }
        if (sides && eligibleTitles({ type: sides[0].length > 1 ? 'tag' : 'singles', sides }).includes(t.id)) { put(i, sides[0].length > 1 ? 'tag' : 'singles', sides, { title: t.id }); k++ } }
      for (const t of idle) { if (k >= max) break; if (c.some(sl => sl.k === 'match' && sl.d && sl.d.title === t.id)) continue; if (!t.holders.every(ok)) continue;
        const per = t.holders.length; const i = slotFor(false); if (i < 0) break;
        if (per === 1) { const o = oppFor(t.holders[0], [], t.g); if (o) { put(i, 'singles', [t.holders.slice(), [o.id]], { title: t.id }); k++ } }
        else { const opp = pool(t.g, t.holders).slice(0, per).map(w => w.id); if (opp.length === per) { put(i, per === 2 ? 'tag' : 'trios', [t.holders.slice(), opp], { title: t.id }); k++ } } } });
    /* 5 · the weekly goal, when it's about who's on the card */
    step('goal', () => { const g = S.goal && S.goal.p; if (!g || g.w !== AW() || g.done) return; const has = f => c.some(sl => sl.k === 'match' && sl.d && f(sl.d));
      if (g.k === 'women' && !has(m => m.sides.flat().every(id => W(id) && W(id).g === 'F'))) { const l = pool('F'); const i = slotFor(false); if (i >= 0 && l.length >= 2) { const o = oppFor(l[0].id, [], 'F'); if (o) put(i, 'singles', [[l[0].id], [o.id]]) } }
      if (g.k === 'title' && !has(m => m.title)) { const t = Object.values(S.titles).find(t => t.kind === 'singles' && t.holders.length === 1 && ok(t.holders[0])); const i = slotFor(false); if (t && i >= 0) { const o = oppFor(t.holders[0], [], t.g); if (o) put(i, 'singles', [[t.holders[0]], [o.id]], { title: t.id }) } }
      if (g.k === 'rookie' && !has(m => m.sides.flat().some(id => W(id) && W(id).rookie))) { const r = ownList('p').find(w => w.rookie && ok(w.id) && fit(w)); const i = slotFor(false); if (r && i >= 0) { const o = oppFor(r.id); if (o) put(i, 'singles', [[r.id], [o.id]]) } } });
    /* 6 · the crowd's chant: a spot in a match */
    step('chant', () => { const ch = S.chant && S.chant.p; if (ch && ch.w === AW() && !ch.hit && ok(ch.id) && !onCard(ch.id) && fit(W(ch.id))) { const i = slotFor(false); const o = oppFor(ch.id); if (i >= 0 && o) put(i, 'singles', [[ch.id], [o.id]]) } });
    /* 7 · promos a trial asks for */
    step('promos', () => { const want = (S.trials || []).filter(t => t.goal === 'seg' && (!t.kind || t.kind === 'promo')).map(t => t.a).filter(id => W(id) && W(id).own === 'p' && !W(id).inj && !onCard(id));
      c.forEach(sl => { if (sl.d || sl.k !== 'promo' || sl.opt) return; const w = want.shift(); if (w) { sl.d = { type: W(w).mic >= 70 ? 'callout' : 'vignette', a: w, b: null, played: false }; n++ } }) });
    return n;
  };

  /* the office line: a wrestler's pitch gets a trial when one's on offer, otherwise a gentle no */
  const answerPitch = () => {
    if (!S.pitch || typeof PITCHES === 'undefined' || !PITCHES[S.pitch.k]) { S.pitch = null; return }
    const P = PITCHES[S.pitch.k]; try { const want = opt.pitch || (opt.checklist && Math.random() < .5 ? 'try' : 'no'); pitchChoose(want !== 'no' && P[want] ? want : 'no'); cur.pitch = cur.pitch || {}; cur.pitch[S.pitchK && S.pitchK.slice(-1)[0] || '?'] = 1 } catch (e) { errs.push('pitch ' + e.message) }
    S.pitch = null; try { closeModal() } catch (e) { }
  };

  newGame('Bot', 'Rival', opt.diff);
  // draft: both sides use the game's own draft picker
  /* opt.draft (draft-sweep.py): how the bot spends its cap. 'auto' = the game's picker; 'stars' = the most popular
     wrestler that fits every pick, cheap fill at the end; a number (e.g. .7) = the game's picker held to that share of the cap */
  const dr = opt.draft == null ? 'auto' : opt.draft;
  if (typeof dr === 'number' && S.draft) S.draft.capB = { p: Math.round(S.draft.cap * dr), ai: S.draft.cap };
  const starPick = () => { const mine = ownList('p'), needF = mine.length >= 3 && mine.filter(w => w.g === 'F').length / mine.length < .3; let l = Object.values(S.w).filter(w => inPool(w) && draftOk(w, 'p')); if (needF && l.some(w => w.g === 'F')) l = l.filter(w => w.g === 'F'); return l.sort((a, b) => b.pop - a.pop || mkt(a) - mkt(b))[0] };
  let g = 0; while (S.phase === 'draft' && g++ < 2000) { const b = onClock(); const c = b === 'p' && dr === 'stars' ? starPick() || draftChoice(b) : draftChoice(b); if (!c) { finishDraft(); break } draftPick(c.id, b) }
  const draftOut = { payroll: payroll('p'), cap: econCap(), draftCap: S.draft && S.draft.cap, bank: S.money.p, top6: ownList('p').map(w => w.pop).sort((a, b) => b - a).slice(0, 6).reduce((a, x) => a + x, 0) / 6, n80: ownList('p').filter(w => w.pop >= 80).length, aiPay: payroll('ai'), aiBank: S.money.ai };
  if (S.draft) delete S.draft.capB;
  const wlog = []; let signed = 0, resigned = 0, faSpend = 0;

  const seasons = [];
  let cur = null;
  const startSeason = () => { cur = { season: S.season, weeks: 0, rp: [], rai: [], wins: 0, injP: 0, injAI: 0, promoStars: [], matchStars: [], fans0: { p: S.fans.p, ai: S.fans.ai }, crises: 0, errs: 0, titleChanges: 0, checklist: 0, cl: {}, rested: 0 } };
  startSeason();

  for (let wk = 0; wk < opt.weeks; wk++) {
    try {
      if (S.phase === 'over') {
        cur.end = snapshot(); seasons.push(cur); nextSeason(); closeModal(); startSeason(); continue;
      }
      // the office line
      if (S.crisis) { cur.crises++; try { const C = CRISES[S.crisis.k]; if (C) C.ch[Math.floor(Math.random() * C.ch.length)].fx(crisisCtx()) } catch (e) { errs.push('crisis ' + e.message) } S.crisis = null }
      answerPitch();
      // v356: the network exec's visit — the viewership bonus is collected at the office after each PPV
      if (S.view && S.view.p && S.view.p.due && S.view.p.amt > 0) { S.money.p += S.view.p.amt; S.view.p = { amt: 0, wks: 0 } }
      // contracts: same rule the offline rival uses
      owned('p').forEach(w => { if (w.con <= 1) { const c = resignCost(w); if (S.money.p >= c && w.mor > 25) { S.money.p -= c; resigned += c; w.sal = askSal(w); w.con += 26 } } });
      // free agency: top up a thin roster from the market
      /* opt.invest: spend the bank on the best free agent the weekly budget can carry (sealed-bid stars at their asking price) */
      if (opt.invest && S.phase === 'season' && owned('p').length < 30) { const room = weekEst('p') * opt.invest - payroll('p');
        const fa = Object.values(S.w).filter(w => !w.own && !w.inj && onMarket(w) && mkt(w) <= room).sort((a, b) => b.pop - a.pop)[0];
        if (fa && fa.pop >= 60 && S.money.p - signCost(fa) >= econCap() * 1.5) { faSpend += signCost(fa); S.money.p -= signCost(fa); fa.sal = mkt(fa); fa.own = 'p'; fa.con = 26; fa.mor = 80; fa.fee = 0; fa.deb = AW(); signed++ } }
      if (owned('p').length < 22) { const fa = Object.values(S.w).filter(w => !w.own && onMarket(w) && !dealNeedsOffer(w)).sort((a, b) => ovr(b) - ovr(a))[0]; if (fa && S.money.p > signCost(fa) * 3) { S.money.p -= signCost(fa); fa.sal = mkt(fa); fa.own = 'p'; fa.con = 26; fa.mor = 80; fa.fee = 0 } }
      // book: the checklist first, then the assistant
      if (opt.checklist) cur.checklist += bookChecklist();
      // stamina (v353: Suggest no longer protects tired wrestlers): the attentive bot sits anyone near injury risk out
      const rested = opt.checklist && !(opt.skip || []).includes('rest') && typeof FAT_RISK !== 'undefined' ? owned('p').filter(w => !w.inj && sta(w) < 100 - FAT_RISK) : [];
      rested.forEach(w => w.own = 'rest');
      try { if (opt.engaged && typeof suggestCardEngaged === 'function') S.card.p = suggestCardEngaged(); else suggestFill() } finally { rested.forEach(w => w.own = 'p') }
      cur.rested += rested.length;
      // Money in the Bank: cash in by the same rules the rival uses
      if (typeof aiCash === 'function') aiCash('p', S.card.p, curShow());
      if (opt.spend) { S.prod = S.prod || {}; const m = S.money.p / econCap(); S.prod.p = curShow().ppv ? (m > 5 ? 'max' : m > 2 ? 'plus' : 'std') : (m > 6 ? 'max' : m > 3.2 ? 'plus' : 'std') }
      const sh = curShow();
      // play the show: promos by the rival's rules; highlight reels decide which matches get calls (v260+)
      const c = S.card.p;
      c.forEach(sl => { if (sl.d && sl.k === 'promo') { const p = sl.d; delete p.res; p.played = false; if (S.w[p.a] && !S.w[p.a].inj && (!p.b || S.w[p.b] && !S.w[p.b].inj)) runAutoPromo(p, 'p'); else sl.d = null } else if (sl.d && sl.k === 'match') delete sl.d.ev });
      if (typeof hrAuto === 'function') hrAuto(c, 'p', sh);
      else { /* builds before v260 (for --compare): per-match calls by the rival's rules */
        const ms = c.filter(sl => sl.d && sl.k === 'match'); ms.forEach((sl, j) => { const m = sl.d, main = j === ms.length - 1; if (!validMatch(m)) return;
          if (main && typeof msOn === 'function' && msOn(m)) return msAuto(m, 'p', true); const ev = matchEvent(m, 'p', sh.ppv || main, main ? .65 : 0); if (ev) runEvAI(ev, m) }) }
      const before = Object.fromEntries(Object.values(S.titles).map(t => [t.id, t.holders.join('|')]));
      const out = airShow();
      const o = S.last || out;
      Object.values(S.titles).forEach(t => { if (before[t.id] && t.holders.join('|') !== before[t.id]) cur.titleChanges++ });
      if (o && o.ratings) { if (o.ratings.p != null) cur.rp.push(o.ratings.p); if (o.ratings.ai != null) cur.rai.push(o.ratings.ai); if (o.hourWin === 'p') cur.wins++ }
      if (o && o.blocks) { const PN = new Set(Object.values(PT).map(x => x.n)); o.blocks.filter(b => b.brand === 'p').forEach(b => b.segs.forEach(s => (PN.has(s.sub) ? cur.promoStars : cur.matchStars).push(s.stars))) }
      cur.injP += owned('p').filter(w => w.inj > 0).length; cur.injAI += owned('ai').filter(w => w.inj > 0).length;
      cur.weeks++;
      if (S.season === 1 && wlog.length < (opt.logWeeks || 0)) { const fa = Object.values(S.w).filter(w => !w.own && onMarket(w)).sort((a, b) => b.pop - a.pop)[0];
        wlog.push({ w: wlog.length + 1, ppv: !!sh.ppv, m: S.money.p, mai: S.money.ai, r: o && o.ratings ? o.ratings.p : null, rai: o && o.ratings ? o.ratings.ai : null, won: o && o.hourWin === 'p' ? 1 : 0, f: S.fans.p, fai: S.fans.ai,
          mor: owned('p').reduce((a, w) => a + w.mor, 0) / Math.max(1, owned('p').length), pay: payroll('p'), debt: (S.debt && S.debt.p) || 0, n: owned('p').length, faTop: fa ? fa.pop : 0, signed, fin: S.fin && S.fin.p, cash: o && o.cash && o.cash.p && { tix: o.cash.p.tix, merch: o.cash.p.merch, ad: o.cash.p.ad, gate: o.cash.p.gate || 0, spons: o.cash.p.spons, bill: o.cash.p.bill || 0, prod: o.cash.p.prod || 0, stip: o.cash.p.stip || 0, ceil: o.cash.p.ceil || 0, net: o.cash.p.net }, rs: resigned, fa$: faSpend }) }
      const bad = nanScan(); if (bad.length) errs.push('NaN: ' + bad.slice(0, 5).join(','));
    } catch (e) { errs.push((e && e.stack || String(e)).split('\n').slice(0, 2).join(' ')); cur.errs++; if (cur.errs > 5) break }
  }
  function snapshot() {
    const pops = b => owned(b).map(w => w.pop);
    const cnt = (b, t) => pops(b).filter(p => p >= t).length;
    const allOwned = Object.values(S.w).filter(w => w.own);
    return {
      fansGained: { p: S.fans.p - cur.fans0.p, ai: S.fans.ai - cur.fans0.ai }, fans: { p: S.fans.p, ai: S.fans.ai },
      money: { p: S.money.p, ai: S.money.ai }, payroll: { p: payroll('p'), ai: payroll('ai') },
      roster: { p: owned('p').length, ai: owned('ai').length },
      pop90: cnt('p', 90) + cnt('ai', 90), pop85: cnt('p', 85) + cnt('ai', 85), pop80: cnt('p', 80) + cnt('ai', 80),
      topPop: Math.max(...allOwned.map(w => w.pop)), medPop: allOwned.map(w => w.pop).sort((a, b) => a - b)[Math.floor(allOwned.length / 2)],
      mor: { p: owned('p').reduce((a, w) => a + w.mor, 0) / Math.max(1, owned('p').length), ai: owned('ai').reduce((a, w) => a + w.mor, 0) / Math.max(1, owned('ai').length) },
    };
  }
  if (cur.weeks) { cur.end = snapshot(); seasons.push(cur) }
  return { seasons, errs, draft: draftOut, wlog };
};
