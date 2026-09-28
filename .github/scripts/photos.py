"""Optimizes any image dropped into photos/ and rebuilds photos/manifest.json.

Files are named after the wrestler (e.g. "Will Ospreay.png", "adam_page.jpeg").
Each one is cropped to a 3:4 card, resized to 480x640 and saved as <slug>.jpg.
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
    out_name = slug(base) + '.jpg'
    out = os.path.join(DIR, out_name)
    try:
        im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    except Exception as e:
        print('skip', name, e)
        continue
    if name == out_name and im.size == (W, H):
        continue
    sc = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    left = (im.width - W) // 2
    top = int((im.height - H) * 0.2)
    im.crop((left, top, left + W, top + H)).save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    if src != out:
        os.remove(src)
    print('optimized', name, '->', out_name)

files = sorted(f for f in os.listdir(DIR) if f.endswith('.jpg'))
manifest = {'photos': {f[:-4]: f for f in files}}
with open(os.path.join(DIR, 'manifest.json'), 'w') as fh:
    json.dump(manifest, fh, indent=1)
print(len(files), 'photos in manifest')
