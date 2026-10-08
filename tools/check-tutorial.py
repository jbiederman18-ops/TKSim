#!/usr/bin/env python3
"""Plays the whole Rookie GM orientation in a headless browser and fails if any stop is broken.

Checks: the draft and first-week tours are offered to a new player, every stop finds what it points at,
every live number in the text still resolves (TUT_MISS is empty), each coach tip fires, and nothing throws.

    pip install playwright && python3 -m playwright install chromium
    python3 tools/check-tutorial.py            # add --shots DIR to save a screenshot of every stop
"""
import asyncio, os, subprocess, sys, time, socket, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


async def main(shots):
    from playwright.async_api import async_playwright
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', ROOT, '--bind', '127.0.0.1'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    problems, visited, n = [], [], 0
    try:
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH')
            b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
            pg = await b.new_page(viewport={'width': 390, 'height': 844})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
            await pg.goto(f'http://127.0.0.1:{port}/index.html')
            await pg.wait_for_timeout(1200)

            async def shot(name):
                nonlocal n
                if shots:
                    os.makedirs(shots, exist_ok=True); n += 1
                    await pg.screenshot(path=os.path.join(shots, f'{n:02d}-{name}.png'))

            async def expect_offer(what):
                try:
                    await pg.wait_for_selector('#tut.offer', timeout=4000)
                except Exception:
                    problems.append(f'the {what} tour was not offered to a new player'); return False
                await shot(f'offer-{what}')
                await pg.evaluate('tutAccept()')
                return True

            async def walk(what):
                guard = 0
                while guard < 60:
                    guard += 1
                    await pg.wait_for_timeout(450)
                    if not await pg.evaluate('!!TUT'):
                        return
                    sid = await pg.evaluate("TUT.steps[TUT.i].id")
                    hole = await pg.evaluate("getComputedStyle(document.querySelector('#tut .tut-hole')).display!=='none'")
                    has_sel = await pg.evaluate("!!TUT.steps[TUT.i].sel")
                    if has_sel and not hole:
                        problems.append(f'{sid}: its target is not on screen')
                    visited.append(sid)
                    await shot(sid)
                    await pg.evaluate('tutNext()')
                problems.append(f'the {what} tour never finished')

            await pg.fill('#gmName', 'Tester')
            await pg.evaluate('startGame()')
            await pg.wait_for_timeout(500)
            if await expect_offer('draft'):
                await walk('draft')

            await pg.evaluate('simDraft()')
            await pg.wait_for_timeout(800)
            if await pg.evaluate("!document.querySelector('#modal').classList.contains('hidden')"):
                problems.append('the weekly briefing opened on top of the tour offer')
                await pg.evaluate('closeModal()')
            if await expect_offer('first-week'):
                await walk('first-week')

            # coach tips: the match editor, the PPV card and the results
            await pg.evaluate("go('book')"); await pg.evaluate('suggestFill()'); await pg.wait_for_timeout(300)
            await pg.evaluate("openMatch(S.card.p.map(s=>s.k).lastIndexOf('match'))")
            await pg.wait_for_timeout(900)
            if await pg.evaluate("!(TUT&&TUT.steps[0].id==='t.editor')"):
                problems.append('t.editor: coach tip did not appear in the match editor')
            else:
                visited.append('t.editor'); await shot('t.editor'); await pg.evaluate('tutNext()')
            await pg.evaluate('closeModal()')
            await pg.evaluate("tutTip('t.ppv',true)"); await pg.wait_for_timeout(800)
            if await pg.evaluate("!(TUT&&TUT.steps[0].id==='t.ppv')"):
                problems.append('t.ppv: coach tip could not find its target')
            else:
                visited.append('t.ppv'); await shot('t.ppv'); await pg.evaluate('tutNext()')
            await pg.evaluate('goLive()'); await pg.wait_for_timeout(300)
            await pg.evaluate('finishLive()'); await pg.wait_for_timeout(300)
            await pg.evaluate("typeof srSkip==='function'&&srSkip()"); await pg.wait_for_timeout(900)
            if await pg.evaluate("!!(TUT&&TUT.steps[0].id==='t.results')"):
                visited.append('t.results'); await shot('t.results'); await pg.evaluate('tutNext()')

            missing = await pg.evaluate('TUT_MISS')
            for m in missing:
                problems.append(f'stale reference in the tour text or target: {m}')
            required = await pg.evaluate("TUT_STEPS.filter(s=>!s.opt).map(s=>s.id)")
            for sid in required:
                if sid not in visited:
                    problems.append(f'{sid}: this stop never showed')
            for e in errs:
                problems.append(f'page error: {e}')
            await b.close()
    finally:
        srv.kill()

    print(f'Visited {len(visited)} stops: ' + ', '.join(visited))
    if problems:
        print('\nTUTORIAL CHECK FAILED — update tutorial.js:')
        for pr in problems:
            print('  ✗ ' + pr)
        sys.exit(1)
    print('Tutorial check passed ✓')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--shots', help='folder to save a screenshot of every stop')
    asyncio.run(main(ap.parse_args().shots))
