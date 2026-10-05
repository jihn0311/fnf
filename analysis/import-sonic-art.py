from pathlib import Path
import json,shutil,xml.etree.ElementTree as E,re
from PIL import Image
root=Path.cwd();src=Path(r'C:\Users\kht80\Desktop\fnf sonic.exe c\bin\assets');dest=root/'assets/sonic-art';dest.mkdir(exist_ok=True)
chars=['BOYFRIEND','Sonic_EXE_Assets','P2Sonic_Assets','SONIC_X','Tails','KnucklesEXE','eggman_soul','Faker_EXE_Assets','Exe_Assets','Fleetway_Super_Sonic','SonicFunAssets','Sunky','sanic','Tails_Doll','endless_bf','SSBF_Assets']
art={'characters':{},'backgrounds':{},'videos':{},'scenes':{}}
for name in chars:
 base=src/'shared/images/characters'/name;xml=E.parse(base.with_suffix('.xml')).getroot();sheet=Image.open(base.with_suffix('.png')).convert('RGBA');groups={}
 for x in xml:
  group=re.sub(r'\d+$','',x.get('name')).strip();groups.setdefault(group,[]).append(x.attrib)
 anim={}
 for kind in ['idle','left','down','up','right','dodge','attack','dead','laugh']:
  keys=[k for k in groups if kind in k.lower() and 'miss' not in k.lower() and 'confirm' not in k.lower()]
  if keys:anim[kind]=groups[min(keys,key=len)]
 if 'idle' not in anim:anim['idle']=next(iter(groups.values()))
 idle=anim['idle'][0];scale=260/int(idle.get('frameHeight',idle['height']));packed=[];animations={}
 for kind,frames in anim.items():
  animations[kind]=[]
  for f in frames:
   x,y,w,h=[int(f[k]) for k in ['x','y','width','height']];im=sheet.crop((x,y,x+w,y+h));size=(max(1,round(w*scale)),max(1,round(h*scale)));im=im.resize(size,Image.Resampling.LANCZOS)
   animations[kind].append({'x':0,'y':0,'w':size[0],'h':size[1],'ox':round(-int(f.get('frameX',0))*scale),'oy':round(-int(f.get('frameY',0))*scale),'fw':round(int(f.get('frameWidth',w))*scale),'fh':round(int(f.get('frameHeight',h))*scale)})
   packed.append((im,animations[kind][-1]))
 width=max(1024,max(im.width for im,f in packed));x=y=row=0
 for im,f in packed:
  if x+im.width>width:x=0;y+=row+2;row=0
  f['x']=x;f['y']=y;x+=im.width+2;row=max(row,im.height)
 atlas=Image.new('RGBA',(width,y+row))
 for im,f in packed:atlas.paste(im,(f['x'],f['y']))
 atlas.save(dest/(name+'.webp'),quality=85,method=4);art['characters'][name]={'src':'assets/sonic-art/'+name+'.webp','animations':animations};sheet.close();print('sprite',name,flush=True)
backgrounds={'too-slow':['PolishedP1/SKY','PolishedP1/HILLS','PolishedP1/FLOOR2','PolishedP1/frontgrass'],'you-cant-run':['SonicP2/sky','SonicP2/backtrees','SonicP2/ground'],'triple-trouble':['Phase3/Trees','Phase3/Grass'],'cycles':['LordXStage/sky','LordXStage/hills1','LordXStage/floor'],'endless':['FunInfiniteStage/sonicFUNsky','FunInfiniteStage/Bush 1','FunInfiniteStage/floor BG'],'faker':['fakerBG/sky','fakerBG/mountains','fakerBG/grass'],'black-sun':['exeBg/sky','exeBg/backtrees','exeBg/ground'],'chaos':['Chamber/The Chamber','Chamber/Floor'],'milk':['SunkBG'],'sunshine':['TailsBG'],'too-fest':['sanicbg']}
for slug,layers in backgrounds.items():
 paths=[]
 for layer in layers:
  f=src/'exe/images'/(layer+'.png');im=Image.open(f).convert('RGBA');xml=f.with_suffix('.xml')
  if xml.exists():
   a=E.parse(xml).getroot()[0];x,y,w,h=[int(a.get(k)) for k in ['x','y','width','height']];im=im.crop((x,y,x+w,y+h))
  im.thumbnail((1500,900));name=layer.replace('/','_')+'.webp';im.save(dest/name,quality=88);paths.append('assets/sonic-art/'+name)
 art['backgrounds'][slug]=paths
for slug,name in [('too-slow','tooslowcutscene1.mp4'),('you-cant-run','youcantruncutscene2.mp4'),('milk','Milky.mp4')]:
 shutil.copy2(src/'videos'/name,dest/name);art['videos'][slug]='assets/sonic-art/'+name
pairs={'too-slow':'Sonic_EXE_Assets','you-cant-run':'P2Sonic_Assets','triple-trouble':'Tails','cycles':'SONIC_X','endless':'SonicFunAssets','faker':'Faker_EXE_Assets','black-sun':'Exe_Assets','chaos':'Fleetway_Super_Sonic','milk':'Sunky','sunshine':'Tails_Doll','too-fest':'sanic'}
for slug,char in pairs.items():art['scenes'][slug]={'opponent':char,'player':'endless_bf' if slug=='endless' else 'SSBF_Assets' if slug=='sunshine' else 'BOYFRIEND'}
(root/'mod-art.js').write_text('const MOD_ART = '+json.dumps(art,separators=(',',':'))+';',encoding='utf-8')
# Restore special metadata and previously omitted ring heads from the original charts.
p=root/'mod-songs.js';songs=json.loads(p.read_text(encoding="utf-8").split('=',1)[1].strip().rstrip(';'))
for id,track in songs.items():
 slug=id.removeprefix('sonic-');track['rings']={}
 for diff,path in track['sourceCharts'].items():
  s=json.loads((src/path).read_text())['song'];lookup={};rings=[];width=5 if s.get('isRing') else 4
  for sec in s['notes']:
   for n in sec['sectionNotes']:
    raw=int(n[1]);lane=raw%width;side='echo' if bool(sec.get('mustHitSection')) ^ (raw>=width) else 'nova'
    if width==5 and lane==2:
     if side=='echo':rings.append({'time':round(n[0]/1000,6)})
     continue
    if width==5:lane={0:0,1:1,3:2,4:3}[lane]
    lookup[(round(n[0]/1000,6),lane,side)]={'type':int(n[3]) if len(n)>3 else 0,'character':int(n[4]) if len(n)>4 else 0}
  for side,notes in track['charts'][diff].items():
   for n in notes:n.update(lookup.get((n['time'],n['lane'],side),{}))
  track['rings'][diff]=sorted(rings,key=lambda n:n['time'])
 track['description']='Sonic.exe · 원본 스프라이트·무대 · 링 SPACE · 특수 노트 웹 재현'
p.write_text('const MOD_SONGS = '+json.dumps(songs,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
manifest=json.loads((root/'mod-assets.json').read_text());manifest+=['mod-art.js','mod-runtime.js']+[str(f.relative_to(root)).replace('\\','/') for f in dest.iterdir()];(root/'mod-assets.json').write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2),encoding='utf-8')
