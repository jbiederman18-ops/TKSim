#!/usr/bin/env python3
"""Boot check: catches the release mistakes that break the installed (offline) game without breaking the code.

    python3 tools/check-boot.py            # needs: pip install playwright (set CHROME_PATH if Playwright's Chromium isn't installed)
    python3 tools/check-boot.py --static   # file checks only, no browser

Checks:
  1. every <script src> / stylesheet index.html loads is in sw.js FILES (or the offline game misses it),
     and every FILES entry exists on disk
  2. sw.js VERSION ('aegm-vNNN') matches APP_VERSION ('vNNN') in index.html
  3. no stray images in the repo root that nothing uses (screenshots committed by accident)
  4. the game boots, starts a new game, drafts and opens every tab with no page errors,
     and every hookStep() in the code has registered (HOOKS)
GitHub runs it on every push (.github/workflows/tutorial.yml).
"""
import asyncio, os, re, socket, subprocess, sys

# hookStep calls that only register when their function exists, which it doesn't at boot (none right now)
NOT_AT_BOOT = set()
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
problems = []


def read(p):
    return open(os.path.join(ROOT, p), encoding='utf8').read()


def static_checks():
    html, sw = read('index.html'), read('sw.js')
    files = [f[2:] for f in re.findall(r"'(\./[^']*)'", sw.split('const FILES')[1].split('];')[0])]
    files = [f for f in files if f]
    loaded = re.findall(r'<script[^>]*\ssrc="([^"]+)"', html) + re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"', html)
    for f in loaded:
        f = f.split('?')[0]
        if not f.startswith('http') and f not in files:
            problems.append(f'index.html loads {f} but it is not in sw.js FILES')
    for f in files:
        if not os.path.exists(os.path.join(ROOT, f)):
            problems.append(f'sw.js FILES lists {f}, which does not exist')
    v = re.search(r"const VERSION = 'aegm-(v\d+)'", sw)
    a = re.search(r"const APP_VERSION='(v\d+)'", html)
    if not v or not a or v.group(1) != a.group(1):
        problems.append(f"sw.js VERSION ({v and v.group(1)}) and APP_VERSION ({a and a.group(1)}) don't match")
    text = ''.join(read(f) for f in os.listdir(ROOT) if f.endswith(('.js', '.html', '.webmanifest', '.css')))
    for f in os.listdir(ROOT):
        if f.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')) and f not in text:
            problems.append(f'{f} in the repo root is not used anywhere — delete it (or move it out of the repo)')


async def boot_checks():
    from playwright.async_api import async_playwright
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', ROOT, '--bind', '127.0.0.1'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        await asyncio.sleep(1)
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH')
            b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
            pg = await b.new_page(viewport={'width': 390, 'height': 844})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
            # errors the game catches and only logs (a broken screen piece still shows as console.error/warn)
            pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type in ('error', 'warning') and re.search(r'ReferenceError|TypeError|SyntaxError|RangeError', m.text) else None)
            pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
            await pg.goto(f'http://127.0.0.1:{port}/index.html'); await pg.wait_for_timeout(1500)
            if errs: problems.append('page errors while booting: ' + ' | '.join(errs)); errs.clear()
            steps = ["startGame()", "simDraft()", "closeModal()",
                     "let g=0;while(S.phase==='draft'&&g++<2000){const b=onClock();const c=draftChoice(b);if(!c){finishDraft();break}draftPick(c.id,b)}",
                     "closeModal()"] + [f"go('{t}')" for t in ('home', 'book', 'roster', 'arcs', 'titles', 'office')] + ["go('book');suggestFill()", "go('home')", "go('book')"]
            for js in steps:
                try:
                    await pg.evaluate(f"(()=>{{try{{if(typeof TUT!=='undefined'&&TUT&&typeof tutEnd==='function')tutEnd()}}catch(e){{}};{js}}})()")
                except Exception as e:
                    problems.append(f'{js} failed: {str(e)[:160]}')
                await pg.wait_for_timeout(500)
                if errs: problems.append(f'page errors after {js}: ' + ' | '.join(errs)); errs.clear()
            hooks = await pg.evaluate("typeof HOOKS==='object'?Object.fromEntries(Object.entries(HOOKS).map(([k,v])=>[k,v.length])):null")
            if hooks is None: problems.append('HOOKS is missing')
            else:
                # every hookStep(...) in the code must have registered by the time the game is up
                want = {}
                for f in sorted(os.listdir(ROOT)):
                    if f.endswith('.js') and f not in ('firebase-sdk.js', 'sw.js') or f == 'index.html':
                        for m in re.finditer(r"hookStep\('([A-Za-z_$][\w$]*)',", read(f)):
                            want[m.group(1)] = want.get(m.group(1), 0) + 1
                want['endWeek'] -= 1  # the usage example in index.html's HOOKS comment
                for k in NOT_AT_BOOT: want.pop(k, None)
                for k, n in sorted(want.items()):
                    if hooks.get(k, 0) != n:
                        problems.append(f'{hooks.get(k, 0)} hookStep steps registered on {k}, {n} in the code — a step failed to register (is {k} a global function by then?)')
            print('hook steps registered:', sum((hooks or {}).values()))
            await b.close()
    finally:
        srv.kill()


static_checks()
if '--static' not in sys.argv:
    asyncio.run(boot_checks())
if problems:
    print('Boot check failed:'); [print('  ✗', x) for x in problems]; sys.exit(1)
print('Boot check passed ✓')
