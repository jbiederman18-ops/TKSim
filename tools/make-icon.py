# Builds the app icons in the card-table look (v286): "The Hand" — three wrestler cards fanned out on the dark table,
# a face card (blue edge) and a heel card (red edge) behind a gold-framed champion's card with a white italic TK and a
# gold title strip. The cards use the game's own card back (card-bg.jpg) so the icon matches the cards in the game.
# Writes tools/icon.svg and tools/icon-maskable.svg (self-contained, fonts and texture embedded), then renders
# icon-512.png, icon-192.png, apple-touch-icon.png and icon-maskable-512.png in the repo root.
# Run from anywhere:  python3 tools/make-icon.py   (needs playwright + Pillow; set CHROME_PATH to use a local Chrome)
import asyncio, os, re, base64
from playwright.async_api import async_playwright
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=D+'../'
# the game's own condensed font (BC), lifted from index.html so the icon matches the in-game type
html=open(ROOT+'index.html',encoding='utf8').read()
fonts='\n'.join(re.findall(r"@font-face\{font-family:'BC'[^}]*\}",html))

INK,GOLD,GOLD3,FACE,HEEL='#09090a','#f2c14e','#a8842e','#5aa8ec','#ef5b52'
BG='data:image/jpeg;base64,'+base64.b64encode(open(ROOT+'card-bg.jpg','rb').read()).decode()
DEFS=(f'<defs><style>{fonts}</style>'
      f'<pattern id="tex" patternUnits="userSpaceOnUse" x="0" y="0" width="200" height="280"><image href="{BG}" width="200" height="280" preserveAspectRatio="xMidYMid slice"/></pattern>'
      f'<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient>'
      '<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".7"/></filter>'
      '<clipPath id="cc"><rect width="200" height="280" rx="9"/></clipPath></defs>')

def card(edge=None,champ=False,inner='',right=False):
    # one 200x280 card, drawn at the origin (the heel card in the fan shows its edge on the outside)
    e=f'<rect x="{188 if right else 0}" width="12" height="280" fill="{edge}"/>' if edge else ''
    frame=f'<rect x="3" y="3" width="194" height="274" rx="7" fill="none" stroke="{GOLD}" stroke-width="6"/>' if champ else '<rect x="1.5" y="1.5" width="197" height="277" rx="8" fill="none" stroke="#3a3b42" stroke-width="3"/>'
    return f'<g filter="url(#sh)"><g clip-path="url(#cc)"><rect width="200" height="280" fill="#101012"/><rect width="200" height="280" fill="url(#tex)"/><rect width="200" height="280" fill="url(#fade)"/>{e}{inner}</g>{frame}</g>'

def art():
    # drawn on a 512 grid; the fan pivots around a point below the cards
    back=lambda edge,ang,dx:f'<g transform="translate(256 488) rotate({ang}) translate({dx-100} -380)">{card(edge,right=ang>0)}</g>'
    front=(f'<text x="100" y="168" text-anchor="middle" font-family="BC" font-style="italic" font-weight="900" font-size="138" fill="#fff" letter-spacing="-4">TK</text>'
           f'<rect x="0" y="228" width="200" height="52" fill="{GOLD}"/>'
           f'<text x="100" y="267" text-anchor="middle" font-family="BC" font-style="italic" font-weight="900" font-size="38" fill="#140f02" letter-spacing="4">SIM</text>')
    return (back(FACE,-16,-10)+back(HEEL,16,10)+
            f'<g transform="translate(156 112)">{card(None,True,front)}</g>')

def svg(scale=1.0):
    body=art()
    if scale!=1.0:  # maskable: everything shrinks into Android's round safe zone
        body=f'<g transform="translate(256 256) scale({scale}) translate(-256 -250)">{body}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">{DEFS}<rect width="512" height="512" fill="{INK}"/>{body}</svg>'

async def render(s,out):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(**({'executable_path':os.environ['CHROME_PATH']} if os.environ.get('CHROME_PATH') else {}));p=await b.new_page(viewport={'width':512,'height':512})
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
