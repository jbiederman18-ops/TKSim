# Builds the app icons: a gold domed globe title plate with "TK" and a "SIM" nameplate, on a black leather strap,
# over the Dynamite ember glow (v125).
# Writes tools/icon.svg and tools/icon-maskable.svg (self-contained, fonts embedded), then renders
# icon-512.png, icon-192.png, apple-touch-icon.png and icon-maskable-512.png in the repo root.
# Run from anywhere:  python3 tools/make-icon.py   (needs playwright + Pillow)
import asyncio, os, re, math
from playwright.async_api import async_playwright
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=D+'../'
# the game's own condensed font (BC), lifted from index.html so the icon matches the in-game logo
html=open(ROOT+'index.html',encoding='utf8').read()
fonts='\n'.join(re.findall(r"@font-face\{font-family:'BC'[^}]*\}",html))

DEFS=f'''<defs><style>{fonts}</style>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d6"/><stop offset=".35" stop-color="#f6dd8e"/><stop offset=".65" stop-color="#d8b449"/><stop offset="1" stop-color="#9c7424"/></linearGradient>
<linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".3" stop-color="#eccb6a"/><stop offset=".6" stop-color="#c79c35"/><stop offset="1" stop-color="#8a6219"/></linearGradient>
<radialGradient id="dome" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#f3d77f"/><stop offset=".6" stop-color="#c49a33"/><stop offset="1" stop-color="#6e4c12"/></radialGradient>
<linearGradient id="strap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2b30"/><stop offset=".5" stop-color="#16161a"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient>
<radialGradient id="ember" cx="50%" cy="112%" r="80%"><stop offset="0" stop-color="#ff7a2e" stop-opacity=".95"/><stop offset=".28" stop-color="#96200a" stop-opacity=".75"/><stop offset=".55" stop-color="#280c06" stop-opacity=".55"/><stop offset=".8" stop-color="#09090b" stop-opacity="0"/></radialGradient>
<radialGradient id="spot" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="#3a2a12" stop-opacity=".9"/><stop offset="1" stop-color="#09090b" stop-opacity="0"/></radialGradient>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121317"/><stop offset="1" stop-color="#09090b"/></linearGradient>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".75"/></filter>
<filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".7"/></filter>
</defs>'''
BG='<rect width="512" height="512" fill="url(#bg)"/><rect width="512" height="512" fill="url(#ember)"/><rect width="512" height="512" fill="url(#spot)"/>'
def T(x,y,s,t,fill='url(#g)',ls=0,extra=''):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="BC" font-style="italic" font-weight="900" font-size="{s}" letter-spacing="{ls}" fill="{fill}" {extra}>{t}</text>'
def strap(y=142,h=196):
    return (f'<rect x="-40" y="{y}" width="592" height="{h}" rx="{h*.18}" fill="url(#strap)" stroke="#000" stroke-width="3"/>'
            f'<rect x="-40" y="{y+9}" width="592" height="{h-18}" fill="none" stroke="#6b5a3a" stroke-width="2.5" stroke-dasharray="9 7" opacity=".7"/>'
            f'<rect x="-40" y="{y+h/2-1}" width="592" height="2" fill="#000" opacity=".25"/>')
def globe(cx,cy,R,op=.35):
    g=''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="{R*f:.1f}" ry="{R}" fill="none" stroke="#7a5716" stroke-width="3" opacity="{op}"/>' for f in (.33,.67,1))
    g+=''.join(f'<line x1="{cx-math.sqrt(R*R-(R*f)**2):.1f}" y1="{cy+R*f:.1f}" x2="{cx+math.sqrt(R*R-(R*f)**2):.1f}" y2="{cy+R*f:.1f}" stroke="#7a5716" stroke-width="3" opacity="{op}"/>' for f in (-.67,-.33,0,.33,.67))
    return g
def plate(R=184,cy=236):
    s=f'<g filter="url(#drop)"><circle cx="256" cy="{cy}" r="{R}" fill="url(#gp)" stroke="#5a3e0e" stroke-width="7"/></g>'
    s+=f'<circle cx="256" cy="{cy}" r="{R-26}" fill="url(#dome)" stroke="#5a3e0e" stroke-width="4"/>'+globe(256,cy,R-26)
    s+='<g filter="url(#sh)">'+T(250,cy+70,int(R*1.1),'TK','url(#g)',-6,'stroke="#2a1c05" stroke-width="12" stroke-linejoin="round" paint-order="stroke"')+'</g>'
    nw=R*.95
    s+=(f'<g filter="url(#drop)"><rect x="{256-nw/2}" y="{cy+R-34}" width="{nw}" height="74" rx="12" fill="url(#gp)" stroke="#5a3e0e" stroke-width="6"/></g>'
        f'<rect x="{256-nw/2+12}" y="{cy+R-22}" width="{nw-24}" height="50" rx="7" fill="#141418"/>'+T(256,cy+R+19,46,'SIM','url(#g)',6))
    return s
def svg(scale=1.0):
    body=plate()
    if scale!=1.0:  # maskable: the strap stays full-width, the plate shrinks into Android's round safe zone
        body=f'<g transform="translate(256 256) scale({scale}) translate(-256 -262)">{body}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{DEFS}{BG}{strap()}{body}</svg>'

async def render(s,out):
    async with async_playwright() as pw:
        b=await pw.chromium.launch();p=await b.new_page(viewport={'width':512,'height':512})
        await p.set_content(f'<html><body style="margin:0;background:#000">{s}</body></html>')
        await p.evaluate('document.fonts.ready');await p.wait_for_timeout(500)
        await p.screenshot(path=out,clip={'x':0,'y':0,'width':512,'height':512});await b.close()

full,mask=svg(),svg(0.72)
open(D+'icon.svg','w').write(full);open(D+'icon-maskable.svg','w').write(mask)
asyncio.run(render(full,ROOT+'icon-512.png'));asyncio.run(render(mask,ROOT+'icon-maskable-512.png'))
im=Image.open(ROOT+'icon-512.png').convert('RGB');im.save(ROOT+'icon-512.png')
im.resize((192,192),Image.LANCZOS).save(ROOT+'icon-192.png')
im.resize((180,180),Image.LANCZOS).save(ROOT+'apple-touch-icon.png')
Image.open(ROOT+'icon-maskable-512.png').convert('RGB').save(ROOT+'icon-maskable-512.png')
print('icons written')
