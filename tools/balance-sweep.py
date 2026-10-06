#!/usr/bin/env python3
"""Balance sweep: plays full seasons headlessly with an automated GM and prints a comparison table.

The bot books with the in-game "Suggest the rest" assistant and makes promo/match calls, contract and crisis decisions
with the same rules the offline rival uses, so differences between versions show up as drift in the numbers.

    pip install playwright && python3 -m playwright install chromium
    python3 tools/balance-sweep.py                       # this checkout, 10 games x 2 seasons per difficulty
    python3 tools/balance-sweep.py --compare v130-commit # also run an older commit side by side
    python3 tools/balance-sweep.py --bonus               # also a variant that always books the bonus match
"""
import argparse, asyncio, json, os, socket, statistics as st, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM = open(os.path.join(ROOT, 'tools', 'balance-sim.js')).read()


def port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


async def run(variants, games, weeks):
    from playwright.async_api import async_playwright
    srv, results = [], {}
    for v in variants.values():
        v['port'] = port()
        srv.append(subprocess.Popen([sys.executable, '-m', 'http.server', str(v['port']), '-d', v['dir'], '--bind', '127.0.0.1'],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
    time.sleep(1)
    try:
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH')
            b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
            sem = asyncio.Semaphore(6)

            async def one(name, diff):
                v = variants[name]
                async with sem:
                    ctx = await b.new_context(); pg = await ctx.new_page(); perr = []
                    pg.on('pageerror', lambda e: perr.append(str(e)[:200]))
                    pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
                    try:
                        await pg.goto(f"http://127.0.0.1:{v['port']}/index.html"); await pg.wait_for_timeout(800)
                        await pg.add_script_tag(content=SIM)
                        r = await pg.evaluate(f"SIM({{diff:'{diff}',bonus:{str(v['bonus']).lower()},weeks:{weeks}}})")
                    except Exception as e:
                        r = {'seasons': [], 'errs': ['runner: ' + str(e)[:200]]}
                    r['perr'] = perr; results.setdefault(f'{name}|{diff}', []).append(r); await ctx.close()
            await asyncio.gather(*[one(n, d) for n in variants for d in ('easy', 'normal', 'hard') for _ in range(games)])
            await b.close()
    finally:
        for s in srv: s.kill()
    return results


def table(results):
    m = lambda x: round(st.mean(x), 2) if x else '-'
    rows = []
    for key in sorted(results):
        G = results[key]; errs = sum(len(g['errs']) + len(g['perr']) for g in G)
        for sn in (1, 2, 3):
            S = [s for g in G for s in g['seasons'] if s['season'] == sn and s['weeks'] >= 38]
            if not S: continue
            E = [s['end'] for s in S]
            rows.append({'variant|difficulty': key, 'season': sn, 'n': len(S),
                         'show★ you': m([st.mean(s['rp']) for s in S]), 'show★ rival': m([st.mean(s['rai']) for s in S]),
                         'weeks won': m([s['wins'] / s['weeks'] for s in S]),
                         'fans gained K you': m([e['fansGained']['p'] / 1000 for e in E]), 'fans gained K rival': m([e['fansGained']['ai'] / 1000 for e in E]),
                         'seasons won': m([1 if e['fansGained']['p'] > e['fansGained']['ai'] else 0 for e in E]),
                         'bank $K you': m([e['money']['p'] for e in E]), 'bank $K rival': m([e['money']['ai'] for e in E]),
                         'pop 90+': m([e['pop90'] for e in E]), 'pop 85+': m([e['pop85'] for e in E]), 'pop 80+': m([e['pop80'] for e in E]),
                         'median pop': m([e['medPop'] for e in E]), 'morale': m([e['mor']['p'] for e in E]),
                         'injured/wk': m([s['injP'] / s['weeks'] for s in S]), 'promo★': m([st.mean(s['promoStars']) for s in S if s['promoStars']]),
                         'match★': m([st.mean(s['matchStars']) for s in S if s['matchStars']]), 'title changes': m([s['titleChanges'] for s in S]),
                         'errors': errs})
    if not rows: print('no complete seasons'); return
    keys = list(rows[0])
    for k in keys: print(f'{k:>20} ' + ' '.join(f'{str(r[k]):>16}' for r in rows))
    bad = [e for G in results.values() for g in G for e in g['errs'] + g['perr']]
    print('\nerrors:', len(bad)); [print('  ' + e) for e in bad[:10]]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--games', type=int, default=10); ap.add_argument('--seasons', type=int, default=2)
    ap.add_argument('--compare', help='an older commit/tag to run side by side'); ap.add_argument('--bonus', action='store_true')
    a = ap.parse_args()
    variants = {'current': {'dir': ROOT, 'bonus': False}}
    if a.bonus: variants['current+bonus'] = {'dir': ROOT, 'bonus': True}
    wt = None
    if a.compare:
        wt = tempfile.mkdtemp(prefix='tksim-'); subprocess.run(['git', '-C', ROOT, 'worktree', 'add', '-q', '--detach', wt, a.compare], check=True)
        variants[a.compare] = {'dir': wt, 'bonus': False}
    try:
        t = time.time(); res = asyncio.run(run(variants, a.games, a.seasons * 41))
        print(f'{sum(len(v) for v in res.values())} games in {round(time.time() - t)}s\n'); table(res)
    finally:
        if wt: subprocess.run(['git', '-C', ROOT, 'worktree', 'remove', '--force', wt])


if __name__ == '__main__':
    main()
