"""Build compact All-Stars phase backgrounds from supplied native layers.
PlayState.hx: setup 3735-3944; phase switches 9815-10260.
Static stage composites preserve scene identity without decoding huge native atlases.
"""
from pathlib import Path
import json,xml.etree.ElementTree as ET
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parent.parent
R=Path('C:/Users/kht80/Desktop/fnf/fnf mario madmess/Marios Madness/assets')
OUT=ROOT/'assets/extra-mods/mario/stage';OUT.mkdir(parents=True,exist_ok=True)
Image.MAX_IMAGE_PIXELS=None
prefix='mario/allfinal/'
def path(name):
 return next(R/base/(name+'.png') for base in ['images','shared/images'] if (R/base/(name+'.png')).exists())
def frame(name,anim=None,index=0):
 p=path(name);im=Image.open(p).convert('RGBA');xp=p.with_suffix('.xml')
 if xp.exists():
  fs=[f.attrib for f in ET.fromstring(xp.read_text(encoding='utf8').lstrip('\ufeff')) if anim is None or f.get('name','').lower().startswith(anim.lower())]
  if not fs:raise ValueError('No frames '+name+' '+str(anim))
  f=fs[index%len(fs)];x,y,w,h=[int(f[k]) for k in ['x','y','width','height']];part=im.crop((x,y,x+w,y+h))
  if f.get('rotated')=='true':part=part.transpose(Image.Transpose.ROTATE_90)
  im=Image.new('RGBA',(int(f.get('frameWidth',part.width)),int(f.get('frameHeight',part.height))))
  im.alpha_composite(part,(-int(f.get('frameX',0)),-int(f.get('frameY',0))))
 return im

def fit(im):return ImageOps.fit(im,(1120,530),method=Image.Resampling.LANCZOS)
def overlay(bg,im,xy,size=None,alpha=1):
 if size:im=im.resize(size,Image.Resampling.LANCZOS)
 if alpha!=1:im=im.copy();im.putalpha(im.getchannel('A').point(lambda v:round(v*alpha)))
 bg.alpha_composite(im,xy)
def save(bg,name):
 p=OUT/('all-stars-'+name+'.webp');bg.convert('RGB').save(p,quality=90);return p.relative_to(ROOT).as_posix()
# Act 2: source sky, abyss and pipe layers in native draw order, fitted to shared stage.
bg=fit(frame(prefix+'act2/act2_static','act2stat'))
for asset in ['act2_scroll1','act2_pipes_far','act2_abyss_gradient','act2_pipes_middle','act2_pipes_close']:
 overlay(bg,frame(prefix+'act2/'+asset),(0,-40),(1120,700))
overlay(bg,frame(prefix+'act2/act2'),(0,0),(1120,530),.35)
images={'act2':save(bg,'act2')}
# Act 3: original Ultra M scenery, including the head/body/arm behind the singers.
bg=fit(frame(prefix+'act3/Act3_Static','act3stat'))
overlay(bg,frame(prefix+'act3/Act3_Hills','hills'),(0,365),(1120,282))
# Native coordinates and scale; use one fixed wide camera to fit both player lanes.
cx,cy,z=-260,420,.39
for name,x,y,scale,anim in [('Act3_Ultra_Arm',-1175,-775,1,None),('Act3_Ultra_M',-1185,-50,1.4,'torso idle 1'),('Act3_Ultra_M_Head',-475,-210,1.1,'ultra m static head'),('Act3_Ultra_Pupils',-175,105,1,'ultra pupils')]:
 im=frame(prefix+'act3/'+name,anim);w,h=im.size
 overlay(bg,im,(round(560+(x-cx+w*(1-scale)/2)*z),round(265+(y-cy+h*(1-scale)/2)*z)),(round(w*scale*z),round(h*scale*z)))
overlay(bg,frame(prefix+'act3/act3'),(0,0),(1120,530),.25)
images['act3']=save(bg,'act3')
# Act 4 switches from the static/ripple setting into the dark second perspective.
bg=fit(frame(prefix+'act4/gray static','static'))
overlay(bg,frame(prefix+'act4/bg ripple','bg ripple'),(0,195),(1120,308))
overlay(bg,frame(prefix+'act4/bf pipe final'),(775,453),(130,132))
images['act4']=save(bg,'act4')
solo=Image.new('RGBA',(1120,530),(0,0,0,255))
overlay(solo,frame(prefix+'act4/spotlight'),(0,0),(1120,530),.65)
overlay(solo,frame('characters/Act_4_secondperspective','pipe'),(760,440),(170,175))
images['solo']=save(solo,'solo')
# Finale restores the Act 4 setting with shifted scenery; no previous phase can bleed through.
final=fit(frame(prefix+'act4/gray static','static'))
overlay(final,frame(prefix+'act4/bg ripple','bg ripple'),(125,240),(1120,308))
images['finale']=save(final,'finale')
# Small transparent sheet for native lightning, decoded once. Low-spec omits it.
light=Image.new('RGBA',(256*8,320));p=path(prefix+'act4/Act_4_FINALE_Lightingmcqueen');fs=[f for f in ET.fromstring(p.with_suffix('.xml').read_text(encoding='utf8').lstrip('\ufeff')) if f.get('name','').startswith('line')]
for i in range(8):
 im=frame(prefix+'act4/Act_4_FINALE_Lightingmcqueen','line',round(i*(len(fs)-1)/7));im.thumbnail((256,320),Image.Resampling.LANCZOS);light.alpha_composite(im,(i*256+(256-im.width)//2,0))
lightpath=OUT/'all-stars-lightning.webp';light.save(lightpath,quality=90)
# Derive phase switch times from the original chart's Triggers Universal events.
raw=json.loads((R/'data/songData/all-stars/all-stars.json').read_text(encoding='utf-8-sig'))['song']
pairs={('2','0'):'act2',('3','0'):'act3',('4','0'):'act4',('4','2'):'solo',('4','6'):'finale'}
timeline=[]
for section in raw['notes']:
 for n in section['sectionNotes']:
  if float(n[1])<0 and n[2] in ('Triggers Universal','Triggers All-Stars') and (str(n[3]),str(n[4])) in pairs:timeline.append({'time':float(n[0])/1000,'phase':pairs[str(n[3]),str(n[4])]})
timeline.sort(key=lambda e:e['time']);assert len(timeline)==5
p=ROOT/'mario-mod.js';text=p.read_text(encoding='utf8');songs=json.loads(text.split('Object.assign(MOD_SONGS,',1)[1].split(');\nconst MARIO_ART=',1)[0]);art=json.loads(text.split('const MARIO_ART=',1)[1].split(';\nfor(const key',1)[0])
scene=art['scenes']['mario-all-stars'];scene['phaseBackgrounds']={'act1':'mario/stage/all-stars'}
for phase,src in images.items():
 key='mario/stage/all-stars-'+phase;scene['phaseBackgrounds'][phase]=key;art['sprites'][key]={'src':src}
 if key not in scene['spriteKeys']:scene['spriteKeys'].append(key)
key='mario/stage/all-stars-lightning';art['sprites'][key]={'src':lightpath.relative_to(ROOT).as_posix()}
if key not in scene['spriteKeys']:scene['spriteKeys'].append(key)
songs['mario-all-stars']['stagePhases']=timeline
p.write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst MARIO_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],MARIO_ART[key]);\nObject.assign(EXTRA_ART.sprites,MARIO_ART.sprites);\n',encoding='utf8')
p=ROOT/'mod-assets.json';files=json.loads(p.read_text())+list(images.values())+[lightpath.relative_to(ROOT).as_posix()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2)+'\n',encoding='utf8')
print(json.dumps(timeline));print('Background bytes',sum((ROOT/f).stat().st_size for f in images.values()))
