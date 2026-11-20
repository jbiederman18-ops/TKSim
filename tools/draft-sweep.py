#!/usr/bin/env python3
"""Draft-strategy sweep: does the draft give a real choice between stacking stars and banking money, and how hard is
money in the first weeks?

Each strategy drafts differently and then plays the same attentive bot as balance-sweep.py (checklist, rests people,
Suggest the rest, buys production like the rival). With --invest (on by default) every strategy spends spare money
on free agents once the bank can carry them — the "build down the line" plan.

    python3 tools/draft-sweep.py                     # 16 games per strategy, Normal, 1 season + early-week table
    python3 tools/draft-sweep.py --diff hard --games 24 --seasons 2

Strategies: auto (the game's own picker), stars (most popular wrestler that fits each pick), cap .85 / .7 / .55
(the game's picker held to that share of the draft cap, banking the rest: 4 weeks of the unused cap at the draft's end).
"""
import argparse, asyncio, json, os, socket, statistics as st, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM = open(os.path.join(ROOT, 'tools', 'balance-sim.js')).read()
STRATS = {'stars': 'stars', 'auto': 'auto', 'cap .85': .85, 'cap .7': .7, 'cap .55': .55}


def port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


async def run(games, weeks, diff, invest, log, pre=None):
    from playwright.async_api import async_playwright
    pt = port(); srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(pt), '-d', ROOT, '--bind', '127.0.0.1'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1); res = {}
    try:
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH'); b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
            sem = asyncio.Semaphore(6)

            async def one(name):
                async with sem:
                    ctx = await b.new_context(); pg = await ctx.new_page(); perr = []
                    pg.on('pageerror', lambda e: perr.append(str(e)[:200])); pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
                    try:
                        await pg.goto(f'http://127.0.0.1:{pt}/index.html'); await pg.wait_for_timeout(800)
                        if pre: await pg.add_script_tag(content=pre)
                        await pg.add_script_tag(content=SIM)
                        o = {'diff': diff, 'weeks': weeks, 'spend': True, 'checklist': True, 'draft': STRATS[name], 'invest': invest, 'logWeeks': log}
                        r = await pg.evaluate(f'SIM({json.dumps(o)})')
                    except Exception as e:
                        r = {'seasons': [], 'errs': ['runner: ' + str(e)[:200]], 'wlog': [], 'draft': {}}
                    r['perr'] = perr; res.setdefault(name, []).append(r); await ctx.close()
            await asyncio.gather(*[one(n) for n in STRATS for _ in range(games)])
            await b.close()
    finally:
        srv.kill()
    return res


def report(res, log):
    m = lambda x, d=2: round(st.mean(x), d) if x else '-'
    print('DRAFT'); print(f"{'strategy':>9} {'payroll/wk':>10} {'% of cap':>8} {'bank wk0':>8} {'top-6 pop':>9} {'80+ pop':>7}")
    for n, G in res.items():
        D = [g['draft'] for g in G if g.get('draft')]
        print(f"{n:>9} {m([d['payroll'] for d in D], 0):>10} {m([d['payroll'] / d['draftCap'] * 100 for d in D], 0):>8} {m([d['bank'] for d in D], 0):>8} {m([d['top6'] for d in D], 1):>9} {m([d['n80'] for d in D], 1):>7}")
    print('\nEARLY WEEKS (season 1) — bank $K / show ★ / nights won / % of games in the red / FA signed')
    marks = [w for w in (1, 2, 3, 4, 6, 8, 10, 12, 16, 20) if w <= log]
    for n, G in res.items():
        L = [g['wlog'] for g in G if g.get('wlog')]
        row = []
        for w in marks:
            W = [l[w - 1] for l in L if len(l) >= w]
            if not W: continue
            row.append(f"w{w}: ${m([x['m'] for x in W], 0)} {m([x['r'] for x in W if x['r'] is not None])}★ red {round(100 * sum(1 for x in W if x['m'] < 0) / len(W))}%")
        print(f'{n:>9} ' + ' | '.join(row))
        first = [l[:log] for l in L]
        print(f"{'':>9} first {log} wks: ★ {m([x['r'] for l in first for x in l if x['r'] is not None])}  nights won {m([x['won'] for l in first for x in l])}  "
              f"ever in red {round(100 * sum(1 for l in first if any(x['m'] < 0 for x in l)) / max(1, len(first)))}%  red 2+ wks {round(100 * sum(1 for l in first if any(x['debt'] >= 2 for x in l)) / max(1, len(first)))}%  "
              f"low bank {m([min(x['m'] for x in l) for l in first], 0)}  fans {m([l[-1]['f'] / 1000 for l in first], 0)}K vs rival {m([l[-1]['fai'] / 1000 for l in first], 0)}K  morale {m([l[-1]['mor'] for l in first], 0)}  signed {m([l[-1]['signed'] for l in first], 1)}  best FA pop {m([x['faTop'] for l in first for x in l], 0)}")
    print('\nSEASONS')
    for n, G in res.items():
        for sn in (1, 2, 3):
            S = [s for g in G for s in g['seasons'] if s['season'] == sn and s['weeks'] >= 38]
            if not S: continue
            E = [s['end'] for s in S]
            print(f"{n:>9} S{sn} n={len(S)}  ★ {m([st.mean(s['rp']) for s in S])} vs {m([st.mean(s['rai']) for s in S])}  nights {m([s['wins'] / s['weeks'] for s in S])}  "
                  f"seasons won {m([1 if e['fansGained']['p'] > e['fansGained']['ai'] else 0 for e in E])}  fans+ {m([e['fansGained']['p'] / 1000 for e in E], 0)}K vs {m([e['fansGained']['ai'] / 1000 for e in E], 0)}K  "
                  f"bank ${m([e['money']['p'] for e in E], 0)}K  payroll {m([e['payroll']['p'] for e in E], 0)}  morale {m([e['mor']['p'] for e in E], 0)}")
    bad = [e for G in res.values() for g in G for e in g['errs'] + g['perr']]
    print('\nerrors:', len(bad)); [print('  ' + e) for e in bad[:8]]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--games', type=int, default=16); ap.add_argument('--seasons', type=int, default=1)
    ap.add_argument('--diff', choices=['easy', 'normal', 'hard'], default='normal')
    ap.add_argument('--invest', type=float, default=1.0, help='free agents signed while payroll stays under this share of weekly income (0 = never)')
    ap.add_argument('--log', type=int, default=12, help='season-1 weeks in the early-week table')
    ap.add_argument('--strats', help='comma-separated subset of: ' + ', '.join(STRATS))
    ap.add_argument('--dump', help='write the raw results to this JSON file')
    ap.add_argument('--pre', help='a JS file run before the bot (for testing a constant)')
    a = ap.parse_args()
    pre = open(a.pre).read() if a.pre else None
    if a.strats:
        keep = [x.strip() for x in a.strats.split(',')]
        for k in list(STRATS):
            if k not in keep: del STRATS[k]
    t = time.time(); res = asyncio.run(run(a.games, a.seasons * 41, a.diff, a.invest, a.log, pre))
    print(f'{sum(len(v) for v in res.values())} games in {round(time.time() - t)}s ({a.diff})\n'); report(res, a.log)
    if a.dump: json.dump(res, open(a.dump, 'w'))


if __name__ == '__main__':
    main()
