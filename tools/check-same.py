#!/usr/bin/env python3
"""Same-game check: proves a cleanup changed nothing about how the game plays.

    python3 tools/check-same.py <older-commit> [--weeks 30]

Plays the same seeded games (Math.random and the clock are fixed, then reseeded right before the run) in an older commit
and in this checkout with tools/balance-sim.js, and compares the final save byte for byte (S.fmt, the save-format stamp,
is ignored). Use it for refactors that must not change play: moving code, hookStep conversions, removing dead code.
Gameplay or balance changes will (correctly) show DIFFERENT — use tools/balance-sweep.py for those.
Needs: pip install playwright (set CHROME_PATH if Playwright's own Chromium isn't installed).
"""
import argparse, asyncio, hashlib, os, shutil, socket, subprocess, sys, tempfile

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
RUNS = [(7, 'normal', False), (99, 'hard', False), (12345, 'easy', False), (4242, 'normal', False), (31, 'normal', True)]


def seed_js(seed):
    return ("(()=>{let s=%d;Math.random=()=>{s=(s*1103515245+12345)%%2147483648;return s/2147483648};"
            "let t=Date.UTC(2026,10,26,12);Date.now=()=>(t+=7);let q=0;performance.now=()=>(q+=7);"
            "window.__reseed=()=>{s=%d;t=Date.UTC(2026,10,26,12);q=0}})();" % (seed, seed))


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0)); return s.getsockname()[1]


async def play(p, port, seed, diff, engaged, weeks, sim):
    exe = os.environ.get('CHROME_PATH')
    b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
    pg = await (await b.new_context()).new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:150]))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
    await pg.add_init_script(seed_js(seed))
    await pg.goto(f'http://127.0.0.1:{port}/index.html'); await pg.wait_for_timeout(500)
    await pg.add_script_tag(content=sim)
    out = await pg.evaluate("(__reseed(),SIM({diff:'%s',weeks:%d,spend:true,engaged:%s,checklist:true,skip:[]})"
                            ".then(r=>{const s=Object.assign({},S);delete s.fmt;return JSON.stringify([r.seasons,r.errs,s])}))"
                            % (diff, weeks, 'true' if engaged else 'false'))
    await b.close()
    return hashlib.md5(out.encode()).hexdigest(), errs


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('commit'); ap.add_argument('--weeks', type=int, default=30)
    a = ap.parse_args()
    from playwright.async_api import async_playwright
    old = tempfile.mkdtemp(prefix='tksim-old-')
    subprocess.run(f'git -C "{ROOT}" archive {a.commit} | tar -x -C "{old}"', shell=True, check=True)
    sim = open(os.path.join(ROOT, 'tools', 'balance-sim.js'), encoding='utf8').read()
    ports = {'old': free_port(), 'new': free_port()}
    srv = [subprocess.Popen([sys.executable, '-m', 'http.server', str(ports[k]), '-d', d, '--bind', '127.0.0.1'],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) for k, d in (('old', old), ('new', ROOT))]
    ok = True
    try:
        await asyncio.sleep(1)
        async with async_playwright() as p:
            for seed, diff, eng in RUNS:
                x = await play(p, ports['old'], seed, diff, eng, a.weeks, sim)
                y = await play(p, ports['new'], seed, diff, eng, a.weeks, sim)
                same = x[0] == y[0] and not y[1]; ok &= same
                print(f"seed {seed:>5} {diff:<6} {'engaged' if eng else 'default':<8} {'SAME' if same else 'DIFFERENT'}"
                      + (f"  errors: {y[1][:2]}" if y[1] else ''))
    finally:
        [s.kill() for s in srv]; shutil.rmtree(old, ignore_errors=True)
    print('Same game ✓' if ok else 'The game plays differently ✗'); sys.exit(0 if ok else 1)

asyncio.run(main())
