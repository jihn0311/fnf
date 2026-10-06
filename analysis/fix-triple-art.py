from pathlib import Path
import json,xml.etree.ElementTree as E,re
from PIL import Image
root=Path(__file__).resolve().parent.parent;src=Path('C:/Users/kht80/Desktop/fnf sonic.exe c/bin/assets');dest=root/'assets/sonic-art'
p=root/'mod-art.js';art=json.loads(p.read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
for name in ['Beast','BFPhase3_Perspective','BFPhase3_Perspective_Flipped']:
 base=src/'shared/images/characters'/name;sheet=Image.open(base.with_suffix('.png')).convert('RGBA');groups={}
 for node in E.parse(base.with_suffix('.xml')).getroot():groups.setdefault(re.sub(r'\d+$','',node.get('name','')).strip(),[]).append(node.attrib)
 anim={}
 for kind in ['idle','left','down','up','right','laugh','leftMiss','downMiss','upMiss','rightMiss']:
  word=kind.replace('Miss','').lower();miss=kind.endswith('Miss');keys=[k for k in groups if word in k.lower() and ('miss' in k.lower())==miss]
  if keys:anim[kind]=groups[min(keys,key=len)]
 f=anim['idle'][0];scale=(330 if name=='Beast' else 230)/int(f.get('frameHeight',f['height']));frames={};items=[]
 for kind,fs in anim.items():
  frames[kind]=[]
  for f in fs:
   x,y,w,h=[int(f[k]) for k in ['x','y','width','height']];im=sheet.crop((x,y,x+w,y+h)).resize((max(1,round(w*scale)),max(1,round(h*scale))),Image.Resampling.LANCZOS)
   out={'x':0,'y':0,'w':im.width,'h':im.height,'ox':round(-int(f.get('frameX',0))*scale),'oy':round(-int(f.get('frameY',0))*scale),'fw':round(int(f.get('frameWidth',w))*scale),'fh':round(int(f.get('frameHeight',h))*scale)};frames[kind].append(out);items.append((im,out))
 width=2048;x=y=row=0
 for im,f in items:
  if x+im.width>width:x=0;y+=row+2;row=0
  f['x']=x;f['y']=y;x+=im.width+2;row=max(row,im.height)
 assert y+row<=16384
 atlas=Image.new('RGBA',(width,y+row))
 for im,f in items:atlas.paste(im,(f['x'],f['y']))
 atlas.save(dest/(name+'.webp'),quality=87,method=3)
 art['characters'][name]={'src':'assets/sonic-art/'+name+'.webp','animations':frames,'sourceScale':scale,'icon':art['characters']['BOYFRIEND']['icon'] if name!='Beast' else 'assets/sonic-art/icon-Beast.webp'}
 print(name,atlas.size,flush=True)
# Native trim and pose offsets use source pixels, independently of the web stage scale.
for name in ['Tails','KnucklesEXE','eggman_soul','BOYFRIEND']:
 frames=E.parse(src/'shared/images/characters'/(name+'.xml')).getroot();f=next(x for x in frames if 'idle' in x.get('name','').lower());a=art['characters'][name];a['sourceScale']=a['animations']['idle'][0]['fh']/int(f.get('frameHeight',f.get('height')))
icons=Image.open(src/'images/iconGrid.png');size=150;cols=icons.width//size;index=54;icons.crop(((index%cols)*size,(index//cols)*size,(index%cols+1)*size,(index//cols+1)*size)).save(dest/'icon-Beast.webp',quality=92)
im=Image.open(src/'exe/images/Phase3/Glitch.png');im.thumbnail((1400,800));im.save(dest/'Phase3_Glitch.webp',quality=88)
art['backgrounds']['triple-trouble']=['assets/sonic-art/Phase3_Glitch.webp',*art['backgrounds']['triple-trouble']]
art['backgrounds']['triple-trouble']=list(dict.fromkeys(art['backgrounds']['triple-trouble']))
p.write_text('const MOD_ART = '+json.dumps(art,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
p=root/'mod-songs.js';songs=json.loads(p.read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'));song=songs['sonic-triple-trouble'];song['visualTimelineByDifficulty']={};song['tempoMapByDifficulty']={}
phases=[(0,'Tails','BOYFRIEND',False,False,False),(1040,'Beast','BFPhase3_Perspective_Flipped',False,False,False),(1296,'KnucklesEXE','BOYFRIEND',True,True,True),(2320,'Beast','BFPhase3_Perspective',True,True,False),(2823,'eggman_soul','BOYFRIEND',False,False,False),(4111,'Beast','BFPhase3_Perspective_Flipped',False,False,False)]
for diff,path in song['sourceCharts'].items():
 s=json.loads((src/path).read_text())['song'];bpm=s['bpm'];t=0;step=0;tempo=[{'step':0,'time':0,'bpm':bpm}];timeline=[]
 for sec in s['notes']:
  if sec.get('changeBPM') and sec.get('bpm',0)>0:bpm=sec['bpm'];tempo.append({'step':step,'time':t,'bpm':bpm})
  length=sec.get('lengthInSteps',16)
  for at,enemy,player,swap,enemyFlip,playerFlip in phases:
   if step<=at<step+length:timeline.append({'step':at,'time':round(t+(at-step)*15/bpm,9),'opponent':enemy,'player':player,'swap':swap,'enemyFlip':enemyFlip,'playerFlip':playerFlip})
  t+=length*15/bpm;step+=length
 song['visualTimelineByDifficulty'][diff]=timeline;song['tempoMapByDifficulty'][diff]=tempo
song['description']='Triple Trouble · 원본 6개 구간의 캐릭터·BF 시점 전환 · 링 SPACE'
p.write_text('const MOD_SONGS = '+json.dumps(songs,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
manifest=json.loads((root/'mod-assets.json').read_text());manifest+=['triple-runtime.js']+['assets/sonic-art/'+n for n in ['Beast.webp','BFPhase3_Perspective.webp','BFPhase3_Perspective_Flipped.webp','icon-Beast.webp','Phase3_Glitch.webp']];(root/'mod-assets.json').write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2),encoding='utf-8')
print(json.dumps(song['visualTimelineByDifficulty'],indent=2))
