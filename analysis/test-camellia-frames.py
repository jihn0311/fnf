import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
text=(root/'camellia-mod.js').read_text(encoding='utf8')
art=json.loads(text.split('const CAMELLIA_ART=')[1].split(';\nfor(const key')[0])
for name in ['camellia:gf','camellia:gf-halloween']:
 for key in ['idle','danceLeft','danceRight']:
  for i,f in enumerate(art['characters'][name]['animations'][key]):
   with Image.open(root/f['src'].split('?')[0]) as im:
    assert im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])).getbbox(),(name,key,i)
print('PASS: no blank frames in either Camellia GF dance cycle')
