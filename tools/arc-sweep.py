#!/usr/bin/env python3
"""Arc stop-target sweep: can every arc's stops and payoff actually be booked for the wrestlers it's offered to?

For each wrestler, each arc they qualify for, every variant and every storyline that fits them, it walks the stops and the
payoff and reports:
  impossible  no legal booking passes the stop's test (a bug: the arc can never finish for that wrestler)
  planGap     a hand booking passes, but Book it (arcFill) can't book it
Star minimums are ignored (they're a quality bar, not a target). Groundswell's off-show stops count as done.

    python3 tools/arc-sweep.py                 # 6 fresh games, start of season 1 (titles vacant)
    AGED=1 python3 tools/arc-sweep.py . 8      # season 2, every building owned, every title held, some contracts ending
    ONLY='["gauntlet"]' AGED=1 python3 tools/arc-sweep.py . 4     # one arc, with debug detail
Args: [repo_dir] [games] [random tries per stop, default 2500]. Needs playwright (set CHROME_PATH if needed).
v453 baseline: 0 impossible, 0 planGap over 10 fresh + 10 aged games (~18K arc/storyline/wrestler cases)."""
import asyncio, json, os, shutil, socket, subprocess, sys, tempfile, time, collections

repo = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__))); games = int(sys.argv[2]) if len(sys.argv) > 2 else 6; N = int(sys.argv[3]) if len(sys.argv) > 3 else 2500; ONLY = os.environ.get('ONLY','null'); AGED = 'true' if os.environ.get('AGED') else 'false'
here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.mkdtemp(); dst = os.path.join(tmp, 'g'); shutil.copytree(repo, dst, ignore=shutil.ignore_patterns('.git', 'photos', 'sfx'))
src = open(os.path.join(dst, 'arcs.js')).read()
expose = "window.__arcT={arcCard,aD,aDK,aSegMatch,aSegPromo,aMinAt,aStar,arcLaneOk,arcStoryPick};\n})();"
i = src.rstrip().rfind('})();'); src = src[:i] + expose + src[i + 5:]
open(os.path.join(dst, 'arcs.js'), 'w').write(src)
# no service worker caching in the test copy
SW = open(os.path.join(here, 'arc-sweep.js')).read()

s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', dst, '--bind', '127.0.0.1'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

async def main():
    from playwright.async_api import async_playwright
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
        sem = asyncio.Semaphore(4)
        async def one(gi):
            async with sem:
                ctx = await b.new_context(); pg = await ctx.new_page(); perr = []
                pg.on('pageerror', lambda e: perr.append(str(e)[:200])); pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
                await pg.goto(f'http://127.0.0.1:{port}/index.html'); await pg.wait_for_timeout(800)
                await pg.add_script_tag(content=SW)
                try:
                    r = await pg.evaluate(f"ARCSWEEP({{n:{N},weeks:[3,31,37],aged:{AGED},only:{ONLY},dbg:{ONLY}}})")
                except Exception as e:
                    r = {'err': str(e)[:300]}
                r['perr'] = perr; res.append(r); await ctx.close()
        await asyncio.gather(*[one(i) for i in range(games)])
        await b.close()
    return res

try:
    res = asyncio.run(main())
finally:
    srv.kill()
json.dump(res, open(os.path.join(tmp, 'out.json'), 'w'), indent=1); print('full results:', os.path.join(tmp, 'out.json'))
print('cases', [r.get('cases') for r in res], 'errs', [r.get('err') for r in res if r.get('err')], 'perr', sum(len(r['perr']) for r in res))
C = collections.Counter(); ex = {}
for r in res:
    for o in r.get('out', []):
        key = (o['kind'], o['k'], o.get('vn', ''), o.get('sl', ''), str(o.get('stop', '')))
        C[key] += 1; ex.setdefault(key, o)
for key, n in sorted(C.items(), key=lambda x: (x[0][0], x[0][1])):
    o = ex[key]
    print(f"{key[0]:10} {key[1]:11} v={key[2]:<22} sl={key[3]:<14} stop={key[4]:<4} x{n:<3} e.g. {o['w']} (pop {o.get('pop')},{o.get('al')},{o.get('g')}) B={o.get('b')} C={o.get('c')} | {o.get('stopTxt', o.get('msg',''))} | plan: {o.get('plan','')} | found: {o.get('found','')} {o.get('dbg','')} {o.get('tl','')}")
T = collections.Counter(); W = collections.defaultdict(set)
for r in res:
    for t in r.get('tested', []): k = t.split('|')[0]; T[k] += 1; W[k].add(t.split('|')[3] if False else t.split('|')[2])
import re
src2 = open(os.path.join(repo, 'arcs.js')).read()
allk = re.findall(r"^ ([a-z0-9]+):\{lane:'", src2, re.M)
print('never tested:', [k for k in allk if k not in T])
print('tested counts:', dict(sorted(T.items(), key=lambda x: x[1])))
