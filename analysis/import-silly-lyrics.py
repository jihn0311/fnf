from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parent.parent
r=Path('C:/Users/kht80/Desktop/fnf(꺼내서 플레이)/fnf silly billy/Silly Billy V-Slice Port/images/lyric')
a=json.loads((r/'Animation.json').read_text(encoding='utf-8-sig'));m=json.loads((r/'spritemap1.json').read_text(encoding='utf-8-sig'))
symbols={s['SYMBOL_name']:s['TIMELINE'] for s in a['SYMBOL_DICTIONARY']['Symbols']}
def mat(o):
 d=o.get('Matrix3D',{});return [d.get('m00',1),d.get('m01',0),d.get('m10',0),d.get('m11',1),d.get('m30',0),d.get('m31',0)]
def mul(a,b):
 A,B,C,D,E,F=a;x,y,z,w,u,v=b;return [A*x+C*y,B*x+D*y,A*z+C*w,B*z+D*w,A*u+C*v+E,B*u+D*v+F]
def walk(t,f,parent,out,depth=0):
 if depth>30:raise ValueError('cyclic symbol')
 for l in reversed(t['LAYERS']):
  fr=next((x for x in l['Frames'] if x['index']<=f<x['index']+x['duration']),None)
  if not fr:continue
  for el in fr.get('elements',[]):
   if 'ATLAS_SPRITE_instance' in el:
    obj=el['ATLAS_SPRITE_instance'];out.append([obj['name'],mul(parent,mat(obj))])
   elif 'SYMBOL_Instance' in el:
    obj=el['SYMBOL_Instance'];sub=symbols[obj['SYMBOL_name']];length=max(x['index']+x['duration'] for l in sub['LAYERS'] for x in l['Frames']);sf=obj.get('firstFrame',0)
    if obj.get('loop')!='singleframe':sf+=f-fr['index'];sf=sf%length if obj.get('loop')=='loop' else min(sf,length-1)
    walk(sub,sf,mul(parent,mat(obj)),out,depth+1)
frames=[]
for f in range(272):
 out=[];walk(a['ANIMATION']['TIMELINE'],f,[1,0,0,1,0,0],out);frames.append(out)
used={x[0] for f in frames for x in f};src=Image.open(r/'spritemap1.png').convert('RGBA');sprites={};page=Image.new('RGBA',(2048,4096));x=y=row=idx=0;paths=[]
def save():
 p=root/f'assets/extra-mods/silly/lyric-{idx}.webp';page.crop((0,0,2048,max(1,y+row))).save(p,quality=90);paths.append(p.relative_to(root).as_posix())
for item in m['ATLAS']['SPRITES']:
 s=item['SPRITE'];name=s['name']
 if name not in used:continue
 im=src.crop((s['x'],s['y'],s['x']+s['w'],s['y']+s['h']))
 if s['rotated']:im=im.transpose(Image.Transpose.ROTATE_90)
 if x+im.width>2048:x=0;y+=row+2;row=0
 if y+max(row,im.height)>4096:save();idx+=1;page=Image.new('RGBA',(2048,4096));x=y=row=0
 sprites[name]=[idx,x,y,im.width,im.height];page.paste(im,(x,y));x+=im.width+2;row=max(row,im.height)
save();xs=[];ys=[]
for fr in frames:
 for name,ma in fr:
  _,_,_,w,h=sprites[name];A,B,C,D,E,F=ma
  for u,v in [(0,0),(w,0),(0,h),(w,h)]:xs.append(A*u+C*v+E);ys.append(B*u+D*v+F)
data={'frames':frames,'sprites':sprites,'pages':paths,'bounds':[min(xs),min(ys),max(xs),max(ys)]}
(root/'silly-lyrics.js').write_text('const SILLY_LYRICS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
p=root/'mod-assets.json';manifest=json.loads(p.read_text());p.write_text(json.dumps(list(dict.fromkeys(manifest+paths+['silly-lyrics.js'])),indent=2)+'\n');print('frames',len(frames),'pages',len(paths),'bounds',data['bounds'])
