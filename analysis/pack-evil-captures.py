from pathlib import Path
import json
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
# Source sheets are restored from video captures; missing/occluded pixels are reconstructed.
SOURCES={}
config=ROOT/'analysis/evil-restored-sheets.json'
if config.exists():SOURCES=json.loads(config.read_text(encoding='utf-8'))
ROWS={'guitar':['guitar-nova','guitar-echo'],'dad':['clean-dad','dearestresist','dearestend','bf'],'guests':['pico-player','spooky-player','corruptedmom'],'soul':['soul','bf-default']}
assets={}
for group,names in ROWS.items():
 src=Path(SOURCES[group]);src=src if src.is_absolute() else ROOT/src;im=Image.open(src).convert('RGBA');dest=ROOT/'assets/extra-mods/evil-reference'/('restored-'+group+('-v3' if group=='guitar' else '')+'.webp');im.save(dest,lossless=True);web=dest.relative_to(ROOT).as_posix();cw=im.width/5
 alpha=im.getchannel('A');bands=[];begin=None
 for y in range(im.height):
  occupied=sum(v>32 for v in alpha.crop((0,y,im.width,y+1)).getdata())>8
  if occupied and begin is None:begin=y
  if not occupied and begin is not None:bands.append([begin,y]);begin=None
 if begin is not None:bands.append([begin,im.height])
 merged=[]
 for band in bands:
  if merged and band[0]-merged[-1][1]<8:merged[-1][1]=band[1]
  else:merged.append(band)
 if len(merged)!=len(names):raise ValueError('Unexpected rows '+group+str(merged))
 edges=[0]+[(merged[j-1][1]+merged[j][0])//2 for j in range(1,len(names))]+[im.height]
 SOURCES[group]=web
 for row,name in enumerate(names):
  anim={};bounds=[]
  for col,key in enumerate(['idle','singLEFT','singDOWN','singUP','singRIGHT']):
   x0,y0,x1,y1=round(col*cw),edges[row],round((col+1)*cw),edges[row+1]
   crop=im.crop((x0,y0,x1,y1));bbox=crop.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
   if not bbox:raise ValueError('Empty pose '+name+key)
   l,top,r,b=bbox;bounds.append([l,top,r,b]);anim[key]=[{'x':x0,'y':y0,'w':x1-x0,'h':y1-y0,'ox':0,'oy':0,'fw':x1-x0,'fh':y1-y0}]
  assets['evil-reference/pose/'+name]={'src':web,'pages':[web],'animations':anim,'poseBounds':bounds,'captureRestored':True}
for name in ['dearest','dearestcanon']:assets['evil-reference/pose/'+name]=assets['evil-reference/pose/clean-dad']
text='const EVIL_CAPTURE_ART='+json.dumps(assets,separators=(',',':'))+';\nObject.assign(EXTRA_ART.sprites,EVIL_CAPTURE_ART);\nfor(const [id,scene] of Object.entries(MOD_ART.scenes)){if(!id.startsWith("evil-reference-"))continue;for(const key of scene.characters){const pose="evil-reference/pose/"+key.split(":")[1];if(EVIL_CAPTURE_ART[pose]&&!scene.spriteKeys.includes(pose))scene.spriteKeys.push(pose);}if(id.endsWith("soul-final"))scene.spriteKeys.push("evil-reference/pose/guitar-nova","evil-reference/pose/guitar-echo");}\n'
(ROOT/'evil-capture-mod.js').write_text(text,encoding='utf-8')
p=ROOT/'mod-assets.json';a=json.loads(p.read_text());a+=['evil-capture-mod.js']+[v['src'] for v in assets.values()];p.write_text(json.dumps(list(dict.fromkeys(a)),indent=2)+'\n',encoding='utf-8')
print('RESTORED',len(assets),'characters,',len(assets)*5,'poses')

config.write_text(json.dumps(SOURCES,indent=2),encoding='utf-8')
