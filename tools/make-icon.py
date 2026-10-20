# Builds the app icons in the pay-per-view look (v222): "Fan war" — a white italic TK over the brand-war rope,
# a charcoal track with your red end, the centre line and the slanted gold knot pulled your way. Flat, no gradients.
# Writes tools/icon.svg and tools/icon-maskable.svg (self-contained, fonts embedded), then renders
# icon-512.png, icon-192.png, apple-touch-icon.png and icon-maskable-512.png in the repo root.
# Run from anywhere:  python3 tools/make-icon.py   (needs playwright + Pillow)
import asyncio, os, re
from playwright.async_api import async_playwright
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=D+'../'
# the game's own condensed font (BC), lifted from index.html so the icon matches the in-game type
html=open(ROOT+'index.html',encoding='utf8').read()
fonts='\n'.join(re.findall(r"@font-face\{font-family:'BC'[^}]*\}",html))

INK,TRACK,LINE,GOLD,RED='#09090a','#1e1e22','#6f6c66','#f2c14e','#c8302a'
DEFS=f'<defs><style>{fonts}</style></defs>'

def art():
    # drawn on a 512 grid (the mock-up's 1024 grid, halved)
    return (f'<text x="252" y="304" text-anchor="middle" font-family="BC" font-style="italic" font-weight="900" font-size="292" fill="#fff">TK</text>'
            f'<rect x="55" y="342" width="402" height="45" fill="{TRACK}"/>'
            f'<rect x="55" y="342" width="95" height="45" fill="{RED}"/>'
            f'<rect x="254" y="327" width="4" height="75" fill="{LINE}"/>'
            f'<polygon points="320,322 360,322 345,407 305,407" fill="{GOLD}"/>')

def svg(scale=1.0):
    body=art()
    if scale!=1.0:  # maskable: everything shrinks into Android's round safe zone
        body=f'<g transform="translate(256 256) scale({scale}) translate(-256 -262)">{body}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{DEFS}<rect width="512" height="512" fill="{INK}"/>{body}</svg>'

async def render(s,out):
    async with async_playwright() as pw:
        b=await pw.chromium.launch();p=await b.new_page(viewport={'width':512,'height':512})
        await p.set_content(f'<html><body style="margin:0;background:#000">{s}</body></html>')
        await p.evaluate('document.fonts.ready');await p.wait_for_timeout(500)
        await p.screenshot(path=out,clip={'x':0,'y':0,'width':512,'height':512});await b.close()

full,mask=svg(),svg(0.74)
open(D+'icon.svg','w').write(full);open(D+'icon-maskable.svg','w').write(mask)
asyncio.run(render(full,ROOT+'icon-512.png'));asyncio.run(render(mask,ROOT+'icon-maskable-512.png'))
im=Image.open(ROOT+'icon-512.png').convert('RGB');im.save(ROOT+'icon-512.png')
im.resize((192,192),Image.LANCZOS).save(ROOT+'icon-192.png')
im.resize((180,180),Image.LANCZOS).save(ROOT+'apple-touch-icon.png')
Image.open(ROOT+'icon-maskable-512.png').convert('RGB').save(ROOT+'icon-maskable-512.png')
print('icons written')
