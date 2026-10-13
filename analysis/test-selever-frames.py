import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
text=(root/'survent-mod.js').read_text(encoding='utf-8')
art=json.loads(text.split('const SURVENT_ART=')[1].split(';\nfor(const key')[0]);char=art['characters']['survent:selever'];images={}
assert len(char['animations']['up'])==11
for key,frames in char['animations'].items():
 for f in frames:
  src=f['src'].split('?')[0]
  if src not in images:images[src]=Image.open(root/src).convert('RGBA')
  assert images[src].crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])).getbbox(),key
print('PASS Selever animation duration retained and every frame visible')
