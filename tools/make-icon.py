# Builds the app icons from the Classic look: gold TONY KHAN stacked over the red slanted SIMULATOR bar,
# on the Dynamite ember glow (v118).
# Writes tools/icon.svg and tools/icon-maskable.svg (self-contained, fonts embedded), then renders
# icon-512.png, icon-192.png, apple-touch-icon.png and icon-maskable-512.png in the repo root.
# Run from anywhere:  python3 tools/make-icon.py   (needs playwright + Pillow)
import asyncio, os, re, random
from playwright.async_api import async_playwright
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=D+'../'
# the game's own condensed font (BC), lifted from index.html so the icon matches the in-game logo
html=open(ROOT+'index.html',encoding='utf8').read()
fonts='\n'.join(re.findall(r"@font-face\{font-family:'BC'[^}]*\}",html))

DEFS='''<defs>
 <style>%s</style>
 <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d6"/><stop offset=".35" stop-color="#f6dd8e"/><stop offset=".65" stop-color="#d8b449"/><stop offset="1" stop-color="#9c7424"/></linearGradient>
 <linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a3d"/><stop offset="1" stop-color="#a8130d"/></linearGradient>
 <radialGradient id="ember" cx="50%%" cy="112%%" r="80%%"><stop offset="0" stop-color="#ff7a2e" stop-opacity=".95"/><stop offset=".28" stop-color="#96200a" stop-opacity=".75"/><stop offset=".55" stop-color="#280c06" stop-opacity=".55"/><stop offset=".8" stop-color="#09090b" stop-opacity="0"/></radialGradient>
 <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121317"/><stop offset="1" stop-color="#09090b"/></linearGradient>
 <filter id="sh" x="-20%%" y="-20%%" width="140%%" height="140%%"><feDropShadow dx="0" dy="6" stdDeviation="0" flood-color="#000" flood-opacity=".8"/></filter>
 <filter id="glow" x="-30%%" y="-30%%" width="160%%" height="160%%"><feDropShadow dx="0" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".85"/><feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#ff8a2e" flood-opacity=".45"/></filter>
</defs>'''%fonts

def T(x,y,s,t,fill='url(#g)',w=900,ls=0):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="BC" font-style="italic" font-weight="{w}" font-size="{s}" letter-spacing="{ls}" fill="{fill}">{t}</text>'
def slant(x,y,w,h,k=0.28):
    d=h*k
    return f'{x+d},{y} {x+w},{y} {x+w-d},{y+h} {x},{y+h}'
def sparks(n=7,ymin=230,ymax=470):
    random.seed(7);o=''
    for _ in range(n):
        x=random.randint(40,470);y=random.randint(ymin,ymax);r=random.choice([2.2,2.8,3.4])
        o+=f'<circle cx="{x}" cy="{y}" r="{r*2.6}" fill="#ff7a2e" opacity=".35"/><circle cx="{x}" cy="{y}" r="{r}" fill="#fff1c8"/>'
    return o
def logo():
    return (f'<g filter="url(#glow)">{T(256,222,150,"TONY")}{T(256,356,150,"KHAN")}</g>'
            f'<g filter="url(#sh)"><polygon points="{slant(78,384,356,64)}" fill="url(#r)"/>{T(256,430,44,"SIMULATOR",fill="#fbeee6",w=800,ls=14)}</g>')
def svg(scale=1.0):
    bg='<rect width="512" height="512" fill="url(#bg)"/><rect width="512" height="512" fill="url(#ember)"/>'
    body=sparks()+logo()
    if scale!=1.0:  # maskable: keep everything inside Android's round safe zone
        body=f'<g transform="translate(256 262) scale({scale}) translate(-256 -315)">{body}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{DEFS}{bg}{body}</svg>'

async def render(s,out):
    async with async_playwright() as pw:
        b=await pw.chromium.launch();p=await b.new_page(viewport={'width':512,'height':512})
        await p.set_content(f'<html><body style="margin:0;background:#000">{s}</body></html>')
        await p.evaluate('document.fonts.ready');await p.wait_for_timeout(500)
        await p.screenshot(path=out,clip={'x':0,'y':0,'width':512,'height':512});await b.close()

full,mask=svg(),svg(0.7)
open(D+'icon.svg','w').write(full);open(D+'icon-maskable.svg','w').write(mask)
asyncio.run(render(full,ROOT+'icon-512.png'));asyncio.run(render(mask,ROOT+'icon-maskable-512.png'))
im=Image.open(ROOT+'icon-512.png').convert('RGB');im.save(ROOT+'icon-512.png')
im.resize((192,192),Image.LANCZOS).save(ROOT+'icon-192.png')
im.resize((180,180),Image.LANCZOS).save(ROOT+'apple-touch-icon.png')
Image.open(ROOT+'icon-maskable-512.png').convert('RGB').save(ROOT+'icon-maskable-512.png')
print('icons written')
