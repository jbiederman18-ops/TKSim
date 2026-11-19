#!/usr/bin/env python3
"""Balance sweep: plays full seasons headlessly with an automated GM and prints a comparison table.

The bot books with the in-game "Suggest the rest" assistant and makes promo/match calls, contract and crisis decisions
with the same rules the offline rival uses, so differences between versions show up as drift in the numbers.

    pip install playwright && python3 -m playwright install chromium
    python3 tools/balance-sweep.py                       # this checkout, 10 games x 2 seasons per difficulty (~1 min)
    python3 tools/balance-sweep.py --compare <commit>    # also run an older commit side by side (fetched if needed)
    python3 tools/balance-sweep.py --engaged             # also a hands-on booker (stips, finishes, run-ins)
    python3 tools/balance-sweep.py --lazy                # also a GM who only taps Suggest and ignores the checklist
    python3 tools/balance-sweep.py --frugal              # the bot never buys production (it does by default, like the rival)

The default bot clears the Needs your attention checklist (promises, clauses, defenses, the weekly goal), answers the
office line, then taps Suggest the rest — an attentive player who leaves the creative booking to the assistant.
--compare runs the same bot on both builds, so it is meaningful from v260 (highlight reels) on.

Baseline (v352, Normal, 20 games x 2 seasons) — compare new numbers against these:
  default bot   show ~3.55-3.65, ~21% of nights, 0-10% of seasons, morale ~65-69
  --lazy        show ~3.8, ~35% of nights, 25-35% of seasons, morale ~63-65
  --engaged     show ~3.75-3.85, ~30% of nights, ~50% of seasons, morale ~74
Known (v352): clearing the checklist costs ~0.2 show stars a week (each must-do books a weaker match than Suggest would)
and isn't paid back in fans, so the default bot trails --lazy. Fix that in the game, not by changing the bot.
"""
import argparse, asyncio, json, os, socket, statistics as st, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIM = open(os.path.join(ROOT, 'tools', 'balance-sim.js')).read()


def port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


async def run(variants, games, weeks, spend=True):
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
                        r = await pg.evaluate(f"SIM({{diff:'{diff}',weeks:{weeks},spend:{str(spend).lower()},engaged:{str(v.get('engaged', False)).lower()},checklist:{str(v.get('checklist', True)).lower()},skip:{json.dumps(v.get('skip', []))},pitch:{json.dumps(v.get('pitch'))}}})")
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
                         'injured/wk': m([s['injP'] / s['weeks'] for s in S]), 'checklist/wk': m([s.get('checklist', 0) / s['weeks'] for s in S]), 'promo★': m([st.mean(s['promoStars']) for s in S if s['promoStars']]),
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
    ap.add_argument('--compare', help='an older commit/tag to run side by side')
    ap.add_argument('--frugal', action='store_true', help='the bot never buys production')
    ap.add_argument('--engaged', action='store_true', help='also a hands-on booker (stips, finishes, run-ins, title challenges) to compare with Suggest the rest')
    ap.add_argument('--lazy', action='store_true', help='also a GM who only taps Suggest the rest and ignores the checklist')
    a = ap.parse_args()
    variants = {'current': {'dir': ROOT}}
    if a.engaged: variants['engaged'] = {'dir': ROOT, 'engaged': True}
    if a.lazy: variants['lazy'] = {'dir': ROOT, 'checklist': False}
    wt = None
    if a.compare:
        if subprocess.run(['git', '-C', ROOT, 'cat-file', '-e', a.compare + '^{commit}'], capture_output=True).returncode:
            # a shallow clone (Claude's sessions start with one) doesn't have older commits: fetch enough history
            subprocess.run(['git', '-C', ROOT, 'fetch', '-q', '--depth=400', 'origin', 'main'], check=True)
        wt = tempfile.mkdtemp(prefix='tksim-'); subprocess.run(['git', '-C', ROOT, 'worktree', 'add', '-q', '--detach', wt, a.compare], check=True)
        variants[a.compare] = {'dir': wt}
    try:
        t = time.time(); res = asyncio.run(run(variants, a.games, a.seasons * 41, not a.frugal))
        print(f'{sum(len(v) for v in res.values())} games in {round(time.time() - t)}s\n'); table(res)
    finally:
        if wt: subprocess.run(['git', '-C', ROOT, 'worktree', 'remove', '--force', wt])


if __name__ == '__main__':
    main()
