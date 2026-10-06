/* Injected into the game page. Plays whole seasons with an automated GM (the same decision rules the game's own
   rival uses) and returns per-season stats. */
window.SIM = async function (opt) {
  const R = {};
  const noop = () => {};
  render = noop; toast = noop; localBackup = noop; saveLocal = () => true; save = noop;
  if (typeof cloudSoon === 'function') cloudSoon = noop;
  if (typeof briefAuto === 'function') briefAuto = noop;
  const errs = [];
  const nanScan = () => {
    const bad = [];
    for (const w of Object.values(S.w)) for (const k of ['pop', 'ring', 'mic', 'mor', 'fat', 'sal', 'con'])
      if (typeof w[k] === 'number' && !isFinite(w[k])) bad.push(w.name + '.' + k);
    for (const b of ['p', 'ai']) { if (!isFinite(S.money[b])) bad.push('money.' + b); if (!isFinite(S.fans[b])) bad.push('fans.' + b) }
    return bad;
  };
  const owned = b => Object.values(S.w).filter(w => w.own === b);

  newGame('Bot', 'Rival', opt.diff);
  // draft: both sides use the game's own draft picker
  let g = 0; while (S.phase === 'draft' && g++ < 2000) { const b = onClock(); const c = draftChoice(b); if (!c) { finishDraft(); break } draftPick(c.id, b) }
  if (S.phase === 'rookies') { /* not expected */ }

  const seasons = [];
  let cur = null;
  const startSeason = () => { cur = { season: S.season, weeks: 0, rp: [], rai: [], wins: 0, injP: 0, injAI: 0, bonusBooked: 0, bonusStars: [], promoStars: [], matchStars: [], meStars: [], fans0: { p: S.fans.p, ai: S.fans.ai }, crises: 0, walkouts: 0, errs: 0, titleChanges: 0 } };
  startSeason();

  const bookBonus = () => {
    const c = S.card.p; const i = c.findIndex(s => s.k === 'match' && s.opt && !s.d); if (i < 0) return;
    const used = fullIn('p');
    const pool = owned('p').filter(w => !w.inj && !used.has(w.id) && sta(w) >= 70).sort((a, b) => (b.pop + b.ring) - (a.pop + a.ring));
    for (const a of pool) { const bb = pool.find(x => x !== a && x.g === a.g); if (bb) { c[i].d = { type: 'singles', stip: 'std', sides: [[a.id], [bb.id]], winner: a.pop >= bb.pop ? 0 : 1, title: '' }; return true } }
  };

  for (let wk = 0; wk < opt.weeks; wk++) {
    try {
      if (S.phase === 'over') {
        cur.end = snapshot(); seasons.push(cur); nextSeason(); closeModal(); startSeason(); continue;
      }
      // front office situations: pick at random, like a player who doesn't overthink it
      if (S.crisis) { cur.crises++; try { const C = CRISES[S.crisis.k]; if (C) C.ch[Math.floor(Math.random() * C.ch.length)].fx(crisisCtx()) } catch (e) { errs.push('crisis ' + e.message) } S.crisis = null }
      // contracts: same rule the offline rival uses
      owned('p').forEach(w => { if (w.con <= 1) { const c = resignCost(w); if (S.money.p >= c && w.mor > 25) { S.money.p -= c; w.sal = askSal(w); w.con += 26 } } });
      // free agency: top up a thin roster from the market
      if (owned('p').length < 22) { const fa = Object.values(S.w).filter(w => !w.own && onMarket(w) && !dealNeedsOffer(w)).sort((a, b) => ovr(b) - ovr(a))[0]; if (fa && S.money.p > signCost(fa) * 3) { S.money.p -= signCost(fa); fa.sal = mkt(fa); fa.own = 'p'; fa.con = 26; fa.mor = 80; fa.fee = 0 } }
      // book: the in-game "Suggest the rest" assistant
      suggestFill();
      if (opt.spend) { S.prod = S.prod || {}; const m = S.money.p / econCap(); S.prod.p = curShow().ppv ? (m > 5 ? 'max' : m > 2 ? 'plus' : 'std') : (m > 6 ? 'max' : m > 3.2 ? 'plus' : 'std') }
      const sh = curShow();
      if (opt.bonus && !sh.ppv && bookBonus()) cur.bonusBooked++;
      // play the show: promos and match calls made with the rival's own decision rules
      const c = S.card.p; const nM = c.filter(s => s.k === 'match' && s.d).length; let j = 0;
      c.forEach(sl => {
        if (!sl.d) return;
        if (sl.k === 'promo') { const p = sl.d; delete p.res; p.played = false; if (S.w[p.a] && !S.w[p.a].inj && (!p.b || S.w[p.b] && !S.w[p.b].inj)) runAutoPromo(p, 'p'); else sl.d = null }
        else if (sl.k === 'match') { const m = sl.d; delete m.ev; j++; const main = j === nM; if (!validMatch(m)) return; const ev = matchEvent(m, 'p', sh.ppv || main, main ? .65 : .3); if (ev) runEvAI(ev, m) }
      });
      const before = Object.fromEntries(Object.values(S.titles).map(t => [t.id, t.holders.join('|')]));
      const out = airShow();
      const o = S.last || out;
      Object.values(S.titles).forEach(t => { if (before[t.id] && t.holders.join('|') !== before[t.id]) cur.titleChanges++ });
      { const c = o && o.cash; const f = S.fin || {}; for (const bb of ['p', 'ai']) { const x = (c && c[bb]) || {}; const y = f[bb] || {}; cur.cash = cur.cash || { p: {}, ai: {} }; const acc = cur.cash[bb]; ['tix', 'merch', 'ad', 'gate', 'bill', 'prod', 'stip', 'ovfCash', 'spons'].forEach(k => acc[k] = (acc[k] || 0) + (x[k] || 0)); ['tv', 'pay', 'ops'].forEach(k => acc[k] = (acc[k] || 0) + (y[k] || 0)) } }
      if (o && o.ratings) { if (o.ratings.p != null) cur.rp.push(o.ratings.p); if (o.ratings.ai != null) cur.rai.push(o.ratings.ai); if (o.hourWin === 'p') cur.wins++ }
      if (o && o.blocks) { const PN = new Set(Object.values(PT).map(x => x.n)); o.blocks.filter(b => b.brand === 'p').forEach(b => b.segs.forEach(s => (PN.has(s.sub) ? cur.promoStars : cur.matchStars).push(s.stars))) }
      cur.injP += owned('p').filter(w => w.inj > 0).length; cur.injAI += owned('ai').filter(w => w.inj > 0).length;
      cur.weeks++;
      if (S.pitch) S.pitch = null;
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
      feuds: S.fhist ? Object.keys(S.fhist).length : null,
    };
  }
  if (cur.weeks) { cur.end = snapshot(); seasons.push(cur) }
  return { seasons, errs };
};
