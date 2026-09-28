import asyncio,sys
from playwright.async_api import async_playwright
import os; D=os.path.dirname(os.path.abspath(__file__))+'/'  # fonts.css = the @font-face rules copied from index.html
fonts=open(D+'fonts.css').read()
def plate_ring(n,r,cx=256,cy=256):
    import math
    pts=[]
    for i in range(n*2):
        a=math.pi*i/n-math.pi/2
        rr=r if i%2==0 else r-14
        pts.append(f"{cx+rr*math.cos(a):.1f},{cy+rr*math.sin(a):.1f}")
    return ' '.join(pts)
import math
gems=''.join(f'<circle cx="{256+132*math.cos(math.pi*i/4+math.pi/8):.1f}" cy="{256+132*math.sin(math.pi*i/4+math.pi/8):.1f}" r="7" fill="url(#ruby)" stroke="#5a0d09" stroke-width="1.5"/>' for i in range(8))
rays=''.join(f'<line x1="256" y1="256" x2="{256+118*math.cos(math.pi*i/18):.1f}" y2="{256+118*math.sin(math.pi*i/18):.1f}" stroke="#b8902e" stroke-width="3" opacity=".35"/>' for i in range(36))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>
 <radialGradient id="bg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#3a1a0c"/><stop offset=".45" stop-color="#17100d"/><stop offset="1" stop-color="#09090b"/></radialGradient>
 <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".28" stop-color="#f6dd8e"/><stop offset=".55" stop-color="#d8b449"/><stop offset=".8" stop-color="#9c7424"/><stop offset="1" stop-color="#e9c768"/></linearGradient>
 <linearGradient id="gold2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9c7424"/><stop offset=".5" stop-color="#f6dd8e"/><stop offset="1" stop-color="#7a5616"/></linearGradient>
 <radialGradient id="face" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".6" stop-color="#d8b449"/><stop offset="1" stop-color="#8a6420"/></radialGradient>
 <linearGradient id="strap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a31"/><stop offset=".5" stop-color="#141418"/><stop offset="1" stop-color="#050506"/></linearGradient>
 <radialGradient id="ruby" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".5" stop-color="#e2332b"/><stop offset="1" stop-color="#8f0f0b"/></radialGradient>
 <linearGradient id="red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a3d"/><stop offset="1" stop-color="#b3150f"/></linearGradient>
 <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" result="b"/><feColorMatrix in="b" values="1 0 0 0 .6  0 .8 0 0 .35  0 0 .2 0 0  0 0 0 .55 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="drop"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".7"/></filter>
</defs>
<rect width="512" height="512" fill="url(#bg)"/>
<!-- strap -->
<rect x="-10" y="196" width="532" height="120" fill="url(#strap)"/>
<rect x="-10" y="196" width="532" height="3" fill="#3a3a44"/>
<line x1="0" y1="208" x2="512" y2="208" stroke="#d8b449" stroke-width="2.5" stroke-dasharray="9 7" opacity=".75"/>
<line x1="0" y1="304" x2="512" y2="304" stroke="#d8b449" stroke-width="2.5" stroke-dasharray="9 7" opacity=".75"/>
<!-- side plates -->
<g filter="url(#drop)">
 <path d="M28 222 h56 l10 34 l-10 34 h-56 l-10 -34 z" fill="url(#gold)" stroke="#6b4a12" stroke-width="3"/>
 <path d="M484 222 h-56 l-10 34 l10 34 h56 l10 -34 z" fill="url(#gold)" stroke="#6b4a12" stroke-width="3"/>
 <circle cx="56" cy="256" r="10" fill="url(#ruby)" stroke="#5a0d09" stroke-width="2"/>
 <circle cx="456" cy="256" r="10" fill="url(#ruby)" stroke="#5a0d09" stroke-width="2"/>
</g>
<!-- main plate -->
<g filter="url(#glow)">
 <polygon points="{plate_ring(16,178)}" fill="url(#gold2)" stroke="#5c3f0c" stroke-width="4" stroke-linejoin="round"/>
</g>
<circle cx="256" cy="256" r="150" fill="url(#gold)" stroke="#6b4a12" stroke-width="4"/>
<circle cx="256" cy="256" r="120" fill="url(#face)" stroke="#7a5616" stroke-width="5"/>
{rays}
{gems}
<circle cx="256" cy="256" r="120" fill="none" stroke="#fff3c4" stroke-width="1.5" opacity=".5"/>
<!-- TK -->
<text x="252" y="292" text-anchor="middle" font-family="BC" font-style="italic" font-weight="900" font-size="150" fill="#2a1a05" opacity=".55" transform="translate(4 6)">TK</text>
<text x="252" y="292" text-anchor="middle" font-family="BC" font-style="italic" font-weight="900" font-size="150" fill="url(#gold)" stroke="#4a3208" stroke-width="5" paint-order="stroke">TK</text>
<!-- SIM banner -->
<g transform="translate(256 336)" filter="url(#drop)">
 <path d="M-62 -20 h130 l-8 40 h-130 z" fill="url(#red)" stroke="#5a0d09" stroke-width="3"/>
 <text x="0" y="12" text-anchor="middle" font-family="BC" font-style="italic" font-weight="800" font-size="32" letter-spacing="3" fill="#fff">SIM</text>
</g>
<!-- sheen -->
<path d="M150 150 Q256 90 362 150 Q256 130 150 170z" fill="#fff" opacity=".12"/>
</svg>'''
open(D+'icon.svg','w').write(svg)
html=f"<html><head><style>{fonts} body{{margin:0;background:#000}}</style></head><body>{svg}</body></html>"
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch();p=await b.new_page(viewport={'width':512,'height':512})
        await p.set_content(html);await p.wait_for_timeout(500)
        await p.screenshot(path=D+'icon-512.png',clip={'x':0,'y':0,'width':512,'height':512})
        await b.close()
asyncio.run(main())
from PIL import Image
im=Image.open(D+'icon-512.png').convert('RGB')
im.resize((192,192),Image.LANCZOS).save(D+'icon-192.png')
im.resize((180,180),Image.LANCZOS).save(D+'apple-touch-icon.png')
# preview: large, small, and maskable circle crop
pv=Image.new('RGB',(512+20+192+20+192,512),'#333');pv.paste(im,(0,0));pv.paste(im.resize((192,192),Image.LANCZOS),(532,0))
from PIL import ImageDraw
m=Image.new('L',(512,512),0);ImageDraw.Draw(m).ellipse((51,51,461,461),fill=255)
c=Image.new('RGB',(512,512),'#333');c.paste(im,(0,0),m);pv.paste(c.resize((192,192),Image.LANCZOS),(744,0))
pv.save(D+'icon-preview.png')
