#!/usr/bin/env python3
"""Plays the whole Rookie GM orientation in a headless browser and fails if any stop is broken.

Checks: the draft tour starts on its own and the first-week tour is offered to a new player, every stop finds what it points at,
every live number in the text still resolves (TUT_MISS is empty), each coach tip fires (the results tip after a real
show), no stop is longer than TUT_WORDS, returning players get a "What's new" replay of the stops changed since their
version, a reworded tip comes back once, and nothing throws.

    pip install playwright && python3 -m playwright install chromium
    python3 tools/check-tutorial.py            # add --shots DIR to save a screenshot of every stop
"""
import asyncio, os, re, subprocess, sys, time, socket, argparse

# phrases that only make sense to someone who watched the game being built
TUT_BANNED = [
    r"\bno longer\b", r"\bused to\b", r"\banymore\b", r"\bany more\b", r"\bthese days\b", r"\bnow (?:you|it|they|the|your|every)\b",
    r"\bthere(?:'|’)?s no\b", r"\bthere (?:is|are) no\b", r"\bno (?:forecast|preview|longer)\b", r"\binstead of\b",
    r"\bdoesn(?:'|’)?t win\b", r"\bnot (?:a|an) (?:bug|mistake)\b", r"\bon purpose\b", r"\bby design\b",
    r"\bmoney(?:'|’)?s tight\b", r"\bv\d{2,3}\b", r"\b(?:old|new|classic) (?:editor|book screen|version)\b",
    r"\bretired\b", r"\bremoved\b", r"\bdropped\b", r"\breplaced\b", r"\brenamed\b",
]

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
            # a new game opens with X Redditino, then the draft tour starts on its own
            try:
                await pg.wait_for_function("XR_INTRO&&!!document.querySelector('#modal[data-xri]')", timeout=4000)
                pages = await pg.evaluate('XR_INTRO.lines.length')
                # it plays on the highlight-reel stage: a shout, then each paragraph types out in the dialogue box.
                # A tap on the box finishes the line, the next tap moves on; the last page ends on a button.
                await pg.wait_for_function("!!document.querySelector('#modal #sd') && !!document.querySelector('#modal #sdbox')", timeout=4000)
                for k in range(pages):
                    await pg.wait_for_function("XR_INTRO && !XR_INTRO.busy", timeout=4000)
                    if await pg.evaluate('!!XR_INTRO.typing'):
                        await pg.click('#modal #sdbox')
                    await pg.wait_for_timeout(300)
                    said = await pg.inner_text('#modal #sdsay')
                    if said.strip() != (await pg.evaluate(f'XR_INTRO.lines[{k}]')).strip():
                        problems.append(f"X Redditino's paragraph {k+1} didn't show in full")
                    await shot(f'xr-intro-{k+1}')
                    if k < pages - 1:
                        await pg.click('#modal #sdbox')
                if 'make some magic' not in await pg.inner_text('#modal button.choice'):
                    problems.append("X Redditino's last page should end on Let's go make some magic")
                if await pg.evaluate("S.draft.ids && S.draft.ids.length > 0"):
                    problems.append('the rival drafted while X Redditino was still talking')
                await pg.wait_for_timeout(400)
                await pg.click('#modal button.choice')
            except Exception:
                problems.append("X Redditino's opening did not play at the start of a new game")
            # the draft tour starts on its own for a new player
            try:
                await pg.wait_for_function("!!(TUT&&TUT.track==='draft')", timeout=4000)
                if await pg.evaluate("(S.draft.ids||[]).length > 0 || (document.getElementById('dcall')||{}).className === 'in'"):
                    problems.append('the rival drafted (or its pick banner showed) before the draft tour started')
                await walk('draft')
            except Exception:
                problems.append('the draft tour did not start on its own for a new player')

            await pg.evaluate('simDraft()')
            await pg.wait_for_timeout(800)
            if await pg.evaluate("!document.querySelector('#modal').classList.contains('hidden')"):
                problems.append('a sheet (the office line?) opened on top of the first-week tour')
                await pg.evaluate('closeModal()')
            # the first-week tour starts on its own right after the draft
            try:
                await pg.wait_for_function("!!(TUT&&TUT.track==='season')", timeout=5000)
                await walk('first-week')
            except Exception:
                problems.append('the first-week tour did not start on its own after the draft')

            # coach tips: match details, the PPV card and the results
            await pg.evaluate("go('book')"); await pg.evaluate('suggestFill()'); await pg.wait_for_timeout(300)
            await pg.evaluate("segDetails(S.card.p.map(s=>s.k+(s.d?'1':'')).lastIndexOf('match1'))")
            await pg.wait_for_timeout(900)
            if await pg.evaluate("!(TUT&&TUT.steps[0].id==='t.editor')"):
                problems.append('t.editor: coach tip did not appear in match details')
            else:
                visited.append('t.editor'); await shot('t.editor'); await pg.evaluate('tutNext()')
            await pg.evaluate('closeModal()')
            await pg.evaluate("tutTip('t.ppv',true)"); await pg.wait_for_timeout(800)
            if await pg.evaluate("!(TUT&&TUT.steps[0].id==='t.ppv')"):
                problems.append('t.ppv: coach tip could not find its target')
            else:
                visited.append('t.ppv'); await shot('t.ppv'); await pg.evaluate('tutNext()')
            # v186: coach tips that used to be tour stops — each must find its target on its screen
            for tid, prep in [('t.wwe', "go('home')"), ('t.card', "go('book')"), ('t.flow', "go('book')"), ('t.stam', "go('book')"),
                              ('t.stars', "rf='mine';go('roster')"), ('t.traits', "rf='mine';go('roster');showW(ownList('p')[0].id)"), ('t.morale', "rf='mine';go('roster')"), ('t.fa', "rf='fa';go('roster')"),
                              ('t.titles', "go('titles')"), ('t.money', "go('office')")]:
                await pg.evaluate(prep); await pg.wait_for_timeout(500)
                if await pg.evaluate('!!TUT'): await pg.evaluate('tutNext()'); await pg.wait_for_timeout(200)
                await pg.evaluate(f"tutTip('{tid}',true)"); await pg.wait_for_timeout(800)
                if await pg.evaluate(f"!(TUT&&TUT.steps[0].id==='{tid}')"):
                    problems.append(f'{tid}: coach tip could not find its target')
                else:
                    visited.append(tid); await shot(tid); await pg.evaluate('tutNext()')
            await pg.evaluate('closeModal()'); await pg.wait_for_timeout(200)
            # v532: the traits tip comes up on its own the first time a wrestler's page opens
            await pg.evaluate("(()=>{const st=tutStore(),seen=st.seen||{};delete seen['t.traits'];tutPut({seen,tips:true})})()")
            await pg.evaluate("showW(ownList('p')[0].id)"); await pg.wait_for_timeout(900)
            if await pg.evaluate("!(TUT&&TUT.steps[0].id==='t.traits')"):
                problems.append("t.traits: coach tip did not come up on its own when a wrestler's page opened")
            else:
                await pg.evaluate('tutNext()')
            await pg.evaluate('closeModal()'); await pg.wait_for_timeout(200)
            await pg.evaluate("rf='mine';go('book')"); await pg.wait_for_timeout(400)
            wk = await pg.evaluate('AW()')
            await pg.evaluate('goLive()'); await pg.wait_for_timeout(300)
            await pg.evaluate('finishLive()'); await pg.wait_for_timeout(300)
            if await pg.evaluate('AW()') == wk:
                problems.append('Go live did not air the week-1 show (something at the office door, or the card is not full?)')
            # the first show's reveal pauses on your first segment for its own stops
            for _ in range(8):
                await pg.evaluate("typeof SRV!=='undefined'&&SRV&&!SRV.done&&!SRV.busy&&!TUT&&srAdvance()")
                try:
                    await pg.wait_for_function("!!(TUT&&TUT.track==='reveal')", timeout=9000)
                    break
                except Exception:
                    pass
            if await pg.evaluate("!!(TUT&&TUT.track==='reveal')"):
                for _ in range(2):
                    await pg.wait_for_timeout(700)
                    sid = await pg.evaluate("TUT&&TUT.steps[TUT.i].id")
                    if not sid:
                        break
                    visited.append(sid); await shot(sid)
                    await pg.evaluate('srAdvance()')  # the show holds still under a stop
                    await pg.evaluate('tutNext()')
                try:
                    await pg.wait_for_function("!TUT&&SRV&&!SRV.busy&&SRV.i>0", timeout=15000)
                except Exception:
                    problems.append('the reveal did not carry on after the first-show stops')
            else:
                problems.append('the first-show reveal stops did not appear')
            await pg.evaluate("typeof srSkip==='function'&&srSkip()"); await pg.wait_for_timeout(300)
            await pg.evaluate("document.getElementById('srv')&&showResults()"); await pg.wait_for_timeout(900)
            if await pg.evaluate("!!(TUT&&TUT.steps[0].id==='t.results')"):
                visited.append('t.results'); await shot('t.results'); await pg.evaluate('tutNext()')
            else:
                problems.append("t.results: the Why that rating? tip did not appear after the first show")
            await pg.evaluate("typeof closeModal==='function'&&closeModal()"); await pg.wait_for_timeout(300)

            # every stop fits on a phone card
            for sid, words, cap in await pg.evaluate("""TUT_STEPS.map(s=>{const d=document.createElement('div');d.innerHTML=s.b();
                    return [s.id,d.textContent.split(/\\s+/).filter(Boolean).length,TUT_WORDS]})"""):
                if words > cap:
                    problems.append(f'{sid}: {words} words — keep stops under {cap} (put the detail in HOWTO)')

            # stops teach a first-time player how to win, not the game's history or design: no "no longer", "there's no
            # forecast", "used to", version numbers or rationale lines. See "Writing a stop" in tutorial.js.
            for sid, txt in await pg.evaluate("""TUT_STEPS.map(s=>{const d=document.createElement('div');d.innerHTML=s.b();
                    return [s.id,(typeof s.t==='function'?s.t():s.t)+' '+d.textContent]})"""):
                for pat in TUT_BANNED:
                    m = re.search(pat, txt, re.I)
                    if m:
                        problems.append(f'{sid}: "{m.group(0)}" reads like design notes or history, not a lesson for a new player')

            # a returning player who took an older tour is offered just the stops changed since
            want = await pg.evaluate("TUT_STEPS.filter(s=>s.track==='season'&&s.since===TUT_REV).map(s=>s.id)")
            if want:
                await pg.evaluate("tutPut({season:TUT_REV-1});go('home')"); await pg.wait_for_timeout(1400)
                got = await pg.evaluate("TUT_OFFER&&TUT_OFFER.ids||null")
                if sorted(got or []) != sorted(want):
                    problems.append(f"What's new: expected a replay of {want}, got {got}")
                elif await expect_offer("what's-new"):
                    await walk("what's-new")
            # every new game gets the first-week tour, even on a device that has already taken it
            await pg.evaluate("TUT&&tutEnd(false);tutOfferClose();closeModal();tutPut({season:TUT_REV,tips:false});S.seed=S.seed+1;S.week=1;go('home')")
            try:
                # this stand-in new game reuses a later save, so office visitors may be waiting: put their sheet away
                for _ in range(16):
                    await pg.wait_for_timeout(600)
                    if await pg.evaluate("!!(TUT&&TUT.track==='season'&&!TUT.ids)"):
                        break
                    await pg.evaluate("document.getElementById('modal').classList.add('hidden');render()")
                await pg.wait_for_function("!!(TUT&&TUT.track==='season'&&!TUT.ids)", timeout=1000)
                await pg.evaluate('tutEnd(false)'); await pg.wait_for_timeout(1400)
                if await pg.evaluate("!!(TUT&&TUT.track==='season')"):
                    problems.append('the first-week tour started again after it was skipped in the same game')
                if await pg.evaluate('tutTipsOn()'):
                    problems.append('finishing the first-week tour turned coach tips back on after the player turned them off')
            except Exception:
                problems.append('a second new game on the same device did not get the first-week tour')
            # a tip seen before its text last changed comes back once; seen after, it stays quiet
            if not await pg.evaluate("""(()=>{const s=TUT_STEPS.find(x=>x.track==='tip'&&x.since>1);if(!s)return true;
                    const o={};o[s.id]=s.since-1;const n={};n[s.id]=s.since;return !tipSeen(o,s.id)&&tipSeen(n,s.id)})()"""):
                problems.append('tipSeen: a reworded tip does not come back (or comes back every time)')

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
