#!/usr/bin/env python3
"""Same-screens check: proves a cleanup changed nothing on screen.

    python3 tools/check-screens.py <older-commit> [--walks 2] [--steps 50]

Runs the older commit and this checkout side by side in two browsers on a virtual clock (seeded Math.random, Date,
timers and crypto), starts a game, then does the same seeded random walk of clicks in both (plus a walk that starts
from a live show). After every click it compares the page HTML and the computed style of every element (with
::before/::after), at phone (390px) and desktop (1400px) widths. Use it with tools/check-same.py for refactors and CSS
cleanup. Known noise it ignores: the tutorial spotlight (#tut) position. A sub-pixel difference on SVG text can be
font-loading timing — rerun that walk old-vs-old (ONLY=<walk> VW=<width>) to check.
Needs: pip install playwright (set CHROME_PATH if Playwright's own Chromium isn't installed). Takes ~5 minutes per walk.
"""
import asyncio, subprocess, sys, json, os, random, re, tempfile, shutil, argparse
from playwright.async_api import async_playwright

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
_ap = argparse.ArgumentParser(); _ap.add_argument('commit'); _ap.add_argument('--walks', type=int, default=2); _ap.add_argument('--steps', type=int, default=50)
_A = _ap.parse_args()
OLD = tempfile.mkdtemp(prefix='tksim-old-'); subprocess.run(f'git -C "{ROOT}" archive {_A.commit} | tar -x -C "{OLD}"', shell=True, check=True)
NEW, WALKS, STEPS = ROOT, _A.walks, _A.steps
LIVE = "let g=0;while(S.phase==='draft'&&g++<2000){const b=onClock();const c=draftChoice(b);if(!c){finishDraft();break}draftPick(c.id,b)};;closeModal();go('book');suggestFill();;goLive()"

SEED = """(()=>{let s=%d;Math.random=()=>{s=(s*1103515245+12345)%%2147483648;return s/2147483648};
const T0=Date.UTC(2026,10,26,12);let now=T0;const OD=Date;
window.Date=class extends OD{constructor(...a){if(!a.length)super(now);else super(...a)}static now(){return now}};
performance.now=()=>now-T0;
const q=[];let id=1;
window.setTimeout=(f,ms,...a)=>{const i=id++;q.push({i,t:now+Math.max(0,+ms||0),f,a});return i};
window.setInterval=(f,ms,...a)=>{const i=id++;const r=Math.max(10,+ms||0);q.push({i,t:now+r,f,a,rep:r});return i};
window.clearTimeout=window.clearInterval=i=>{const k=q.findIndex(x=>x.i===i);if(k>=0)q.splice(k,1)};
window.requestAnimationFrame=f=>window.setTimeout(()=>f(now-T0),16);window.cancelAnimationFrame=i=>window.clearTimeout(i);
window.requestIdleCallback=f=>window.setTimeout(()=>f({timeRemaining:()=>10,didTimeout:false}),1);
window.__adv=ms=>{const end=now+ms;let g=0;while(g++<50000){let k=-1;for(let j=0;j<q.length;j++)if(k<0||q[j].t<q[k].t||(q[j].t===q[k].t&&q[j].i<q[k].i))k=j;
  if(k<0||q[k].t>end)break;const x=q[k];now=x.t;if(x.rep)x.t+=x.rep;else q.splice(k,1);
  try{typeof x.f==='function'?x.f(...x.a):(0,eval)(x.f)}catch(e){console.error(e)}}now=end;return g};
let cr=99991;const c8=()=>{cr=(cr*1103515245+12345)%%2147483648;return cr&255};crypto.getRandomValues=a=>{const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(let i=0;i<u.length;i++)u[i]=c8();return a};crypto.randomUUID=()=>'00000000-0000-4000-8000-'+String(c8()*1e9+c8()).padStart(12,'0').slice(-12);
try{localStorage.clear()}catch(e){}})();"""

CAP = r"""(detail)=>{
 document.getAnimations().forEach(a=>{try{a.finish()}catch(e){try{a.pause();a.currentTime=0}catch(e2){}}});
 const H=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
 const norm=s=>s.replace(/v5\d\d\b/g,'vX').replace(/aegm-v\d+/g,'aegm-vX').replace(/127\.0\.0\.1:\d+/g,'HOST').replace(/card flowc venpull/g,'card venpull');
 const ser=cs=>{const a=[];for(let j=0;j<cs.length;j++){const p=cs[j];a.push(p+':'+cs.getPropertyValue(p))}return a.sort().join(';')};
 const els=[...document.querySelectorAll('body *')].filter(e=>!e.closest('#tut'));
 const st=[];const det={};
 for(let i=0;i<els.length;i++){const el=els[i];const cs=getComputedStyle(el);let s=ser(cs);
  for(const ps of ['::before','::after']){const c=getComputedStyle(el,ps);if(c.content&&c.content!=='none'&&c.content!=='normal'){s+='|'+ps+'{'+ser(c)+'}'}}
  s=norm(s);st.push(H(s));if(detail&&detail.includes(i))det[i]={path:(el.tagName+'.'+[...el.classList].join('.')+(el.id?'#'+el.id:'')),s}}
 const cl=document.body.cloneNode(true);cl.querySelectorAll('script,#tut').forEach(e=>e.remove());const bh=norm(cl.innerHTML);
 window.__BH=bh;return {html:H(bh),htmlLen:bh.length,n:els.length,st,det}}"""

LIST = r"""()=>{const bad=/export|import|sign in|sign out|stop syncing|back up|backup|restore|download|install|test connection|use on another device|copy|share|join|host|invite|update|reset|delete|photo|paste|find|upload|bulk|log in|leave|tv mode|party|online|league/i;
 const els=[...document.querySelectorAll('button,[onclick],.choice,summary,a[href]')].filter(e=>{if(e.disabled)return false;const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;
  const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.pointerEvents==='none')return false;const t=(e.textContent||'')+' '+(e.getAttribute('onclick')||'')+' '+(e.getAttribute('aria-label')||'');return !bad.test(t)&&!(e.tagName==='A'&&!/^#|javascript/.test(e.getAttribute('href')||''))});
 window.__L=els;return els.map(e=>(e.textContent||'').trim().slice(0,40))}"""

async def serve(port, d):
    return subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', d, '--bind', '127.0.0.1'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

async def adv(pg, ms):
    for _ in range(3):
        await pg.evaluate(f"__adv({ms//3})"); await pg.wait_for_timeout(30)

async def page(b, port, seed, vw):
    ctx = await b.new_context(viewport=vw)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('console', lambda m: errs.append('console: ' + m.text[:160]) if m.type in ('error', 'warning') and not re.search(r'Failed to load resource|Firebase|firebase|network', m.text) else None)
    pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
    await pg.add_init_script(SEED % seed)
    await pg.goto(f'http://127.0.0.1:{port}/index.html'); await pg.wait_for_timeout(2500); await adv(pg, 3000)
    return ctx, pg, errs

async def compare(po, pn, label, report):
    a = await po.evaluate(f"({CAP})(null)"); b = await pn.evaluate(f"({CAP})(null)")
    bad = []
    if a['n'] != b['n']: bad.append(f"element count {a['n']} vs {b['n']}")
    if a['html'] != b['html']:
        ha = await po.evaluate("window.__BH"); hb = await pn.evaluate("window.__BH")
        j = next((j for j in range(min(len(ha), len(hb))) if ha[j] != hb[j]), 0)
        bad.append(f"html differs ({a['htmlLen']} vs {b['htmlLen']}): {ha[max(0,j-150):j+80]!r} VS {hb[max(0,j-150):j+80]!r}")
    diff = [i for i in range(min(len(a['st']), len(b['st']))) if a['st'][i] != b['st'][i]]
    if diff:
        da = await po.evaluate(f"({CAP})({json.dumps(diff[:3])})"); db = await pn.evaluate(f"({CAP})({json.dumps(diff[:3])})")
        for i in diff[:3]:
            x, y = da['det'][str(i)], db['det'][str(i)]
            xs, ys = x['s'], y['s']; j = next((j for j in range(min(len(xs), len(ys))) if xs[j] != ys[j]), min(len(xs), len(ys)))
            pd = [xs[max(0, j-90):j+60], ys[max(0, j-90):j+60]]
            bad.append(f"style differs on {x['path']}: {pd}")
        bad.append(f"{len(diff)} elements with style differences")
    report['states'] += 1
    if bad:
        report['diffs'].append((label, bad)); print('  DIFF', label, bad[:4], flush=True)
    return not bad

async def walk(b, ports, seed, vw, steps, report, prefix=''):
    co, po, eo = await page(b, ports[0], seed, vw); cn, pn, en = await page(b, ports[1], seed, vw)
    rng = random.Random(seed * 7 + vw['width'])
    try:
        await compare(po, pn, f'{seed}/{vw["width"]} boot', report)
        for js in ["startGame()", "closeModal()", "simDraft()", "closeModal&&closeModal()"]:
            for p in (po, pn):
                try: await p.evaluate(f"(()=>{{try{{if(typeof TUT!=='undefined'&&TUT&&typeof tutEnd==='function')tutEnd()}}catch(e){{}};{js}}})()")
                except Exception: pass
            for p in (po, pn): await adv(p, 1500)
            await compare(po, pn, f'{seed}/{vw["width"]} {js}', report)
        if prefix:
            for js in prefix.split(';;'):
                for p in (po, pn):
                    try: await p.evaluate(f"(()=>{{{js}}})()")
                    except Exception as ex: print('  prefix err', str(ex)[:120], flush=True)
                for p in (po, pn): await adv(p, 2500)
                await compare(po, pn, f'{seed}/{vw["width"]} prefix {js}', report)
        clicked = []
        for k in range(steps):
            la = await po.evaluate(f"({LIST})()"); lb = await pn.evaluate(f"({LIST})()")
            if la != lb:
                report['diffs'].append((f'{seed}/{vw["width"]} step {k}', ['clickable lists differ'])); print('  DIFF clickables', seed, k, flush=True); break
            if not la:
                print('  no clickables at step',k,flush=True); break
            i = rng.randrange(len(la))
            for p in (po, pn):
                try: await p.evaluate(f"(()=>{{const e=window.__L[{i}];if(e)e.click()}})()")
                except Exception as ex: pass
            for p in (po, pn): await adv(p, 1500)
            if po.url.split('/',3)[3] != pn.url.split('/',3)[3] or '127.0.0.1' not in po.url:
                print('  url',po.url,flush=True); break
            clicked.append(la[i][:28]); ok = await compare(po, pn, f'{seed}/{vw["width"]} step {k} [{la[i]}]', report)
            if not ok: break
        print('  clicked:', ' | '.join(clicked), flush=True)
    finally:
        report['errs_old'] += eo; report['errs_new'] += en
        await co.close(); await cn.close()

async def main():
    P1, P2 = (int(x) for x in os.environ.get('PORTS', '9101,9102').split(','))
    srv = [await serve(P1, OLD), await serve(P2, NEW)]
    await asyncio.sleep(1)
    report = {'states': 0, 'diffs': [], 'errs_old': [], 'errs_new': []}
    try:
        async with async_playwright() as p:
            exe = os.environ.get('CHROME_PATH'); b = await p.chromium.launch(**({'executable_path': exe} if exe else {}))
            for w in ([int(os.environ['ONLY'])] if os.environ.get('ONLY') else range(WALKS + 1)):
                for vw in ([{'width': int(os.environ['VW']), 'height': 844}] if os.environ.get('VW') else ({'width': 390, 'height': 844}, {'width': 1400, 'height': 900})):
                    await walk(b, (P1, P2), 1000 + w * 17, vw, STEPS, report, LIVE if w == WALKS else '')
                    print(f"walk {w} {vw['width']}: states so far {report['states']}, diffs {len(report['diffs'])}", flush=True)
            await b.close()
    finally:
        [s.kill() for s in srv]
    print('STATES', report['states'], 'DIFFS', len(report['diffs']))
    print('errors old', len(report['errs_old']), report['errs_old'][:4]); print('errors new', len(report['errs_new']), report['errs_new'][:4])
    shutil.rmtree(OLD, ignore_errors=True)
    print('Same screens ✓' if not report['diffs'] else 'The screens differ ✗'); sys.exit(1 if report['diffs'] else 0)

asyncio.run(main())
