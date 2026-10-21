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
# Act 3 body/head poses also follow the two lyric-section changes.
for pose,head,anim,index in [('act3','Act3_Ultra_M_Head','ultra m static head',0),('act3-lyrics1','Act3_Ultra_M_Head','ultra m lyrics 1',96),('act3-lyrics2','Act3_Ultra_M_Head2','ultra m lyrics 2',96)]:
 bg=fit(frame(prefix+'act3/Act3_Static','act3stat'))
 overlay(bg,frame(prefix+'act3/Act3_Hills','hills'),(0,365),(1120,282))
 cx,cy,z=-260,420,.39
 for name,x,y,scale,animation,frameidx in [('Act3_Ultra_Arm',-1175,-775,1,None,0),('Act3_Ultra_M',-1185,-50,1.4,'torso idle 1' if pose!='act3-lyrics2' else 'torso idle 2',0),(head,-475,-210,1.1,anim,index)]:
  im=frame(prefix+'act3/'+name,animation,frameidx);w,h=im.size
  overlay(bg,im,(round(560+(x-cx+w*(1-scale)/2)*z),round(265+(y-cy+h*(1-scale)/2)*z)),(round(w*scale*z),round(h*scale*z)))
 overlay(bg,frame(prefix+'act3/act3'),(0,0),(1120,530),.25)
 images[pose]=save(bg,pose)
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
# Reference-video corrections: compact native cinematic frames and foreground props.
def sheet(name,anim,key,cell=(480,270),stride=3):
 source=path(name);im=Image.open(source).convert('RGBA')
 frames=[f.attrib for f in ET.fromstring(source.with_suffix('.xml').read_text(encoding='utf8').lstrip('\ufeff')) if f.get('name','').startswith(anim)]
 selected=frames[::stride];w,h=cell;cols=4;rows=12;pages=[];entries=[];atlas=None
 for i,f in enumerate(selected):
  j=i%(cols*rows)
  if j==0:atlas=Image.new('RGBA',(w*cols,h*min(rows,(len(selected)-i+cols-1)//cols)))
  x,y,fw,fh=[int(f[k]) for k in ['x','y','width','height']];part=im.crop((x,y,x+fw,y+fh));full=Image.new('RGBA',(int(f.get('frameWidth',fw)),int(f.get('frameHeight',fh))))
  full.alpha_composite(part,(-int(f.get('frameX',0)),-int(f.get('frameY',0))))
  full=ImageOps.contain(full,cell,method=Image.Resampling.LANCZOS)
  xx=j%cols*w;yy=j//cols*h;atlas.alpha_composite(full,(xx+(w-full.width)//2,yy+(h-full.height)//2))
  dest=OUT/(key+'-'+str(i//(cols*rows))+'.webp');url=dest.relative_to(ROOT).as_posix()
  entries.append({'src':url,'x':xx,'y':yy,'w':w,'h':h,'ox':0,'oy':0,'fw':w,'fh':h})
  if j==cols*rows-1 or i==len(selected)-1:atlas.save(dest,quality=87,method=3);pages.append(url)
 return {'pages':pages,'src':pages[0],'animations':{'idle':entries},'config':{'idle':{'fps':24/stride,'loop':False}}}
extra={
 'intro':sheet(prefix+'act4/Act_4_Voiceline','thingy','all-stars-intro'),
 'ending':sheet(prefix+'act4/Act_4_FINALE_DEATH','Death','all-stars-ending',(400,270)),
}
for label,asset in [('memory1','memory'),('memory2','she got infected with the exe'),('gameover','Act_4_FINALE_Gameover'),('pipe','bf pipe final')]:
 im=frame(prefix+'act4/'+asset);im.thumbnail((500,350),Image.Resampling.LANCZOS);dest=OUT/('all-stars-'+label+'.webp');im.save(dest,quality=90);extra[label]={'src':dest.relative_to(ROOT).as_posix()}
# Export the ten native drifting objects in one small atlas.
extra['floaters']=sheet(prefix+'act4/floating objects','floating objects','all-stars-floaters',(160,140),1)
for label,data in extra.items():
 key='mario/stage/all-stars-'+label;art['sprites'][key]=data
 if key not in scene['spriteKeys']:scene['spriteKeys'].append(key)
scene['presentationKeys']={k:'mario/stage/all-stars-'+k for k in extra}
# Preserve source cue timing rather than video timestamps or wall-clock callbacks.
cues={}
for section in raw['notes']:
 for n in section['sectionNotes']:
  if float(n[1])<0 and n[2]=='Triggers Universal':cues[str(n[3])+':'+str(n[4])]=float(n[0])/1000
songs['mario-all-stars']['presentationCues']=cues
p.write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst MARIO_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],MARIO_ART[key]);\nObject.assign(EXTRA_ART.sprites,MARIO_ART.sprites);\n',encoding='utf8')
p=ROOT/'mod-assets.json';files=json.loads(p.read_text())+list(images.values())+[lightpath.relative_to(ROOT).as_posix()]+[f.relative_to(ROOT).as_posix() for f in OUT.glob('all-stars-*.webp')];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2)+'\n',encoding='utf8')
print(json.dumps(timeline));print('Background bytes',sum((ROOT/f).stat().st_size for f in images.values()))
