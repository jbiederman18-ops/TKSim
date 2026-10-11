"""Optimizes any image dropped into photos/ and rebuilds photos/manifest.json.

Files are named after the wrestler (e.g. "Will Ospreay.png", "adam_page.jpeg").
Each one is cropped to a 3:4 card, resized to 480x640 and saved as <slug>.jpg — or <slug>.png when it's already a cut-out
(a see-through background), so the game can set it on the card backdrop without any background removal.
"""
import json, os, re, unicodedata
from PIL import Image, ImageOps

DIR = 'photos'
EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.avif'}
W, H = 480, 640

def slug(s):
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

for name in sorted(os.listdir(DIR)):
    base, ext = os.path.splitext(name)
    if ext.lower() not in EXTS:
        continue
    src = os.path.join(DIR, name)
    try:
        im = ImageOps.exif_transpose(Image.open(src))
    except Exception as e:
        print('skip', name, e)
        continue
    cut = im.mode in ('RGBA', 'LA', 'PA') or (im.mode == 'P' and 'transparency' in im.info)
    if cut:
        im = im.convert('RGBA')
        cut = im.getchannel('A').histogram()[0] > im.width * im.height * .04
    if not cut:
        im = im.convert('RGB')
    out_name = slug(base) + ('.png' if cut else '.jpg')
    out = os.path.join(DIR, out_name)
    if name == out_name and im.size == (W, H):
        continue
    sc = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    left = (im.width - W) // 2
    top = int((im.height - H) * 0.2)
    card = im.crop((left, top, left + W, top + H))
    if cut:
        card.save(out, 'PNG', optimize=True)
    else:
        card.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    if src != out:
        os.remove(src)
    print('optimized', name, '->', out_name)

files = sorted(f for f in os.listdir(DIR) if f.endswith(('.jpg', '.png')))
manifest = {'photos': {f[:-4]: f for f in files}}
with open(os.path.join(DIR, 'manifest.json'), 'w') as fh:
    json.dump(manifest, fh, indent=1)
print(len(files), 'photos in manifest')
