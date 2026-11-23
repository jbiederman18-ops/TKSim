/* Arc stop-target sweep. Injected into the game page (with arcs.js patched to expose window.__arcT).
   For every wrestler on the player's roster, every arc they qualify for (arcCard), and every storyline that fits them,
   walks each build stop and the payoff and asks:
     plan  — does the game's own Book it (arcFill) produce a segment that passes the stop's test?
     any   — failing that, does ANY legal booking (random search over matches/promos, stips, titles, finishes, run-ins,
             main event / PPV) pass the test? If not, the stop is impossible for that wrestler.
   Star minimums are ignored (they're a quality bar, not a target). Returns a list of problems. */
window.ARCSWEEP = async function (opt) {
  opt = opt || {};
  const T = window.__arcT; const noop = () => {};
  render = noop; toast = noop; localBackup = noop; saveLocal = () => true; save = noop; if (typeof cloudSoon === 'function') cloudSoon = noop;
  try { closeModal = noop } catch (e) { }
  newGame('Bot', 'Rival', opt.diff || 'normal');
  let g = 0; while (S.phase === 'draft' && g++ < 2000) { const b = onClock(); const c = draftChoice(b); if (!c) { finishDraft(); break } draftPick(c.id, b) }
  if (S.phase !== 'season') return { err: 'not in season: ' + S.phase };
  /* opt.aged: season 2, every building owned, every title held by someone on the roster, some contracts near their end */
  if (opt.aged) {
    S.season = 2; try { venSt('p').own = BLDG.map(v => v.k) } catch (e) { }
    const busy = new Set();
    Object.values(S.titles).filter(t => !t.br || t.br === 'p').forEach(t => { const n = t.kind === 'singles' ? 1 : t.kind === 'tag' ? 2 : 3;
      const l = ownList('p').filter(w => w.g === t.g && !busy.has(w.id)).sort(() => Math.random() - .5).slice(0, n);
      if (l.length === n) { t.holders = l.map(w => w.id); if (t.kind === 'singles') l.forEach(w => busy.add(w.id)) } });
    ownList('p').forEach((w, i) => { if (i % 3 === 0) w.con = 8 });
  }
  const out = []; const R = Math.random;
  const rnd = l => l[Math.floor(R() * l.length)];
  const roster = () => ownList('p').filter(w => !w.inj && !w.retd);
  const copyA = a => { const o = Object.assign({}, a); for (const k in o) if (Array.isArray(o[k])) o[k] = o[k].slice(); return o };
  const PTK = Object.keys(PT); const FK = Object.keys(FINS); const RK = Object.keys(RUNIN);
  const ppvWeeks = Object.keys(PPVS).map(Number).filter(w => w !== RR_WEEK && w !== MITB_WEEK && w !== FD_WEEK).sort((a, b) => a - b);
  const tvAfter = w => { while (PPVS[w]) w++; return Math.min(w, SEASON) };
  const W = id => S.w[id];

  let pals = [];
  function randMatch(core, ppv) {
    const all = roster(); if (all.length < 4) return null;
    const t = rnd(['singles', 'singles', 'singles', 'tag', 'tag', 'trios', 'triple', 'four', 'squash']);
    const shape = { singles: [1, 1], squash: [1, 1], tag: [2, 2], trios: [3, 3], triple: [1, 1, 1], four: [1, 1, 1, 1] }[t];
    const used = new Set(); const pickOne = (first) => {
      const g0 = W(core[0]) && W(core[0]).g; const rr = R();
      const cands = (first ? core : rr < .3 ? core : rr < .45 ? pals : rr < .75 ? all.filter(w => w.g === g0).map(w => w.id) : all.map(w => w.id)).filter(id => W(id) && !used.has(id) && !W(id).inj && W(id).own === 'p');
      const l = cands.length ? cands : all.map(w => w.id).filter(id => !used.has(id)); if (!l.length) return null; const x = rnd(l); used.add(x); return x };
    const sides = []; let first = true;
    for (const n of shape) { const sd = []; for (let i = 0; i < n; i++) { const x = pickOne(first); first = false; if (!x) return null; sd.push(x) } sides.push(sd) }
    // shuffle side order sometimes
    if (R() < .3) sides.reverse();
    const m = { type: t, stip: 'std', sides, winner: Math.floor(R() * sides.length), title: '' };
    const sk = Object.keys(STIPS).filter(k => { try { return stipOk(k, t, ppv) } catch (e) { return false } });
    if (R() < .6 && sk.length) m.stip = rnd(sk);
    if (R() < .45) { let el = []; try { el = eligibleTitles(m) } catch (e) { } if (el.length) m.title = rnd(el) }
    if (R() < .4) { const f = rnd(FK); try { if (!finWhy(m, f)) m.fin = f } catch (e) { } }
    if (R() < .25) { const ids = sides.flat(); const xs = (R() < .6 ? core : all.map(w => w.id)).filter(id => W(id) && !ids.includes(id) && !W(id).inj); if (xs.length) { m.ri = { k: rnd(RK), x: rnd(xs), t: rnd(ids) }; try { if (!riOn(m)) delete m.ri } catch (e) { delete m.ri } } }
    if (R() < .04) m.nc = true;
    const s = T.aSegMatch(m, R() < .45 ? 'me' : 'mid'); s.ppv = ppv; return s;
  }
  function randPromo(core, ppv) {
    const all = roster().map(w => w.id); const t = rnd(PTK); const b0 = PT[t].b;
    const a = R() < .8 ? rnd(core) : rnd(all); let b = null;
    if (b0 === 'req' || (b0 === 'opt' && R() < .7)) { const l = (R() < .5 ? core : all).filter(x => x !== a); b = l.length ? rnd(l) : null; if (!b && b0 === 'req') return null }
    const s = T.aSegPromo({ type: t, a, b }); s.ppv = false; return s; // PPV cards have no promo slots
  }
  /* the step / payoff test the way arcPost / arcPre apply it */
  const passStep = (D, a, s) => { if (!s || (!s.ids.includes(a.a) && !(a.b && s.ids.includes(a.b)))) return false; const c = copyA(a); let h = false; try { h = !!D.step(s, c) } catch (e) { h = false } return h ? c : null };
  const passPay = (D, a, s) => { if (!s || ![a.a, a.b, a.c].some(id => id && s.ids.includes(id))) return false; const c = copyA(a); let h = false; try { h = !!D.pay(s, c) } catch (e) { h = false } return h ? c : null };

  function planSegs(a) {
    const c = emptyCard(!!PPVS[S.week]); const before = c.map(sl => sl && sl.d);
    let i = -1; try { i = arcFill(a, c) } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) } }
    if (i < 0) return { segs: [] };
    const ms = c.map((sl, j) => sl && sl.k === 'match' && !sl.opt ? j : -1).filter(j => j >= 0); const main = ms[ms.length - 1];
    const segs = []; c.forEach((sl, j) => { if (!sl || !sl.d || sl.d === before[j]) return; if (sl.k === 'match') { const s = T.aSegMatch(sl.d, j === main ? 'me' : 'mid'); segs.push(s) } else if (sl.k === 'promo') segs.push(T.aSegPromo(sl.d)) });
    return { segs };
  }
  function search(fn, core, n) {
    for (let i = 0; i < n; i++) { const ppv = R() < .4; const s = R() < .6 ? randMatch(core, ppv) : randPromo(core, ppv); const r = fn(s); if (r) return { s, r } }
    return null;
  }
  const segTxt = s => !s ? '-' : s.kind === 'promo' ? `promo:${s.type} ${[s.a, s.b].filter(Boolean).map(id => W(id).name).join(' & ')}` :
    `${s.type}${s.stip !== 'std' ? '/' + s.stip : ''}${s.title ? '/title' : ''}${s.pos === 'me' ? '/ME' : ''}${s.ppv ? '/PPV' : ''} ${s.sides.map(sd => sd.map(id => W(id).name).join('+')).join(' vs ')}${s.ri ? ` ri:${s.rik} ${W(s.rix).name}` : ''}`;

  const week0 = S.week; const N = opt.n || 2500;
  const ks = Object.keys(ARCS).filter(k => !opt.only || opt.only.includes(k));
  const tested = {}; let cases = 0;
  // offer windows (oil, seasonal) — try a handful of weeks so seasonal arcs show up
  const weeks = opt.weeks || [week0];
  for (const wk of weeks) {
    S.week = wk;
    for (const A of ownList('p').filter(w => !w.retd)) {
      if (A.inj) continue;
      for (const k of ks) {
        S.arcUsed = {}; S.arcUsedW = {}; S.arcs = [];
        const vars = ARC_VARS[k] && ARC_VARS[k].length > 1 ? ARC_VARS[k].map((_, i) => i) : [0];
        const combos = []; S.arcVar = S.arcVar || {}; const v0 = S.arcVar[k];
        for (const v of vars) {
          S.arcVar[k] = v; let p = null; try { p = T.arcCard(A, k) } catch (e) { out.push({ k, w: A.name, kind: 'error', msg: 'arcCard: ' + e.message }); continue }
          if (!p || !T.arcLaneOk(A, k)) continue;
          const l = (ARC_STORY[k] || []).filter(x => (x.vk == null || x.vk === v) && (() => { try { return !x.need || x.need(A, p.b ? W(p.b) : null) } catch (e) { return false } })());
          if (!l.length) combos.push({ v, sl: null, p }); else l.forEach(x => combos.push({ v, sl: x, p }));
        }
        if (v0 == null) delete S.arcVar[k]; else S.arcVar[k] = v0;
        for (const cb of combos) {
          const p = cb.p; S.arcVar[k] = cb.v;
          if (!cb.sl) { out.push({ k, w: A.name, v: cb.v, kind: 'nostory', msg: 'variant has no storyline that fits — arcCard would still offer the arc only if another variant is active' }); continue }
          const key = k + '|' + cb.v + '|' + cb.sl.id + '|' + A.id; if (tested[key]) continue; tested[key] = 1; cases++;
          const snap = { inj: A.inj, mor: A.mor, angle: A.angle, fat: A.fat };
          const a = Object.assign({ rd: cb.sl.road ? 1 : 0, id: 'sw', a: A.id, start: AW(), have: 0, st: [], stage: 'build', star: T.aStar(A) ? 1 : 0, cost: 0, v: cb.v, al0: A.al, fit: 0, sl: cb.sl.id }, p);
          const D = T.aD(a); a.need = D.need2 ? D.need2({ a: A.id, g: p.g }) : D.need; a.end = AW() + a.need + 6;
          try { if (D.setup) D.setup(a, A) } catch (e) { out.push({ k, w: A.name, kind: 'error', msg: 'setup ' + e.message }) }
          A.inj = 0; A.fat = 0;
          const core = [a.a, a.b, a.c].filter(Boolean);
          pals = [...new Set([].concat(...(S.teams || []).filter(t => t.m.some(x => core.includes(x))).map(t => t.m), ...Object.values(S.titles).filter(t => t.holders.some(x => core.includes(x))).map(t => t.holders)))].filter(id => W(id) && W(id).own === 'p');
          const tag = { k, v: cb.v, vn: (ARC_VARS[k] && ARC_VARS[k][cb.v] && ARC_VARS[k][cb.v].vn) || '', sl: cb.sl.id, w: A.name, pop: A.pop, al: A.al, g: A.g, b: a.b ? W(a.b).name : '', c: a.c ? W(a.c).name : '' };
          const savedWeek = S.week;
          let dead = false;
          for (let i = 0; i < a.need && !dead; i++) {
            S.week = tvAfter(savedWeek + i);
            if (D.offShow) { a.have = i + 1; a.st.push(3.5); continue } // Groundswell: steps happen off the show (arcGroundswell)
            let r = planSegs(a); let hit = null, how = 'plan';
            if (r.err) out.push(Object.assign({ stop: i + 1, kind: 'error', msg: 'arcFill ' + r.err }, tag));

            for (const s of r.segs || []) { hit = passStep(D, a, s); if (hit) break }
            if (!hit) { // try the PPV week
              const pw = ppvWeeks.find(x => x >= S.week); if (pw) { const w0 = S.week; S.week = pw; r = planSegs(a); for (const s of r.segs || []) { hit = passStep(D, a, s); if (hit) break } S.week = w0 } }
            if (!hit) { const f = search(s => passStep(D, a, s), core, N); how = f ? 'manual' : 'none'; if (f) hit = f.r;
              if (opt.dbg && opt.dbg.includes(k)) { const t = S.titles[a.t2]; tag.dbg = JSON.stringify({ t2: a.t2, t: t && { holders: t.holders.map(id => W(id).name), br: t.br, g: t.g, kind: t.kind }, lp: a.lp, opp: (a.opp || []).map(id => W(id).name), more: roster().filter(w => w.g === A.g && w.pop > (a.lp || 0)).map(w => w.name + ':' + w.pop) }) }
              if (opt.dbg && opt.dbg.includes(k)) { const t = S.titles[a.t2]; tag.dbg = JSON.stringify({ t2: a.t2, t: t && { holders: t.holders.map(id => W(id).name), br: t.br, g: t.g, kind: t.kind }, lp: a.lp, opp: (a.opp || []).map(id => W(id).name), more: roster().filter(w => w.g === A.g && w.pop > (a.lp || 0)).map(w => w.name + ':' + w.pop) }) }
              out.push(Object.assign({ stop: i + 1, of: a.need, kind: f ? 'planGap' : 'impossible', stopTxt: (D.builds ? D.builds[i] : D.build) || '', plan: (r.segs || []).map(segTxt).join(' | ') || 'no plan', found: f ? segTxt(f.s) : '' }, tag)); }
            if (!hit) { dead = true; break }
            Object.assign(a, hit); a.have = i + 1; a.st.push(3.5);
          }
          if (!dead) {
            if (D.ok && !D.ok(a)) out.push(Object.assign({ kind: 'okFail', msg: 'all stops done but ok() false' }, tag));
            a.stage = 'pay'; a.payFrom = 0; S.week = tvAfter(savedWeek + a.need);
            const payT = s => passPay(D, a, s);
            let r = planSegs(a); let hit = null; for (const s of r.segs || []) { hit = payT(s); if (hit) break }
            if (!hit) { const pw = ppvWeeks.find(x => x >= S.week); if (pw) { const w0 = S.week; S.week = pw; r = planSegs(a); for (const s of r.segs || []) { hit = payT(s); if (hit) break } S.week = w0 } }
            if (!hit) { const f = search(payT, core, N);
              if (opt.dbg && opt.dbg.includes(k)) { tag.tl = JSON.stringify(Object.values(S.titles).filter(t => t.kind === 'tag').map(t => [t.id, t.g, t.br, t.holders.map(id => W(id).name + ':' + W(id).own + ':' + (W(id).inj||0) + ':' + Math.round(sta(W(id))))])); const t = S.titles[a.t2]; const X = roster().find(w => w.id !== a.a && w.g === A.g); tag.dbg = JSON.stringify({ t2: a.t2, t: t && { holders: t.holders.map(id => W(id).name + '/' + W(id).own), br: t.br, g: t.g, kind: t.kind }, el: X && eligibleTitles({ type: 'singles', sides: [[a.a], [X.id]] }), opp: (a.opp || []).map(id => W(id).name) }) }
              out.push(Object.assign({ stop: 'pay', kind: f ? 'planGap' : 'impossible', stopTxt: D.payoff || '', plan: (r.segs || []).map(segTxt).join(' | ') || 'no plan', found: f ? segTxt(f.s) : '' }, tag)) }
          }
          S.week = savedWeek; Object.assign(A, snap); if (v0 == null) delete S.arcVar[k]; else S.arcVar[k] = v0;
        }
      }
    }
  }
  S.week = week0;
  return { cases, out, roster: ownList("p").length, tested: Object.keys(tested) };
};
