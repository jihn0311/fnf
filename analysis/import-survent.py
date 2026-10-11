from pathlib import Path
import json,hashlib,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
r=Path('C:/Users/kht80/Desktop/fnf selever/bin/assets');art=ns['ART'];songs={}
for name,path in {'sarvente':'sacredmass/sarvente_sheet','sarvente-dark':'sacredmass/sarvente_dark','ruv':'sacredmass/ruv_sheet','bf':'BOYFRIEND','gf':'GF_assets','selever':'selever/fuckboi_sheet','sarvente-lucifer':'sacredmass/smokinhotbabe'}.items():
 definition=None
 if name=='gf':definition={'animations':[{'anim':'idle','name':'GF Dancing Beat0'}]}
 if name=='bf':
  names={'idle':'BF idle dance0',**{d:'BF NOTE '+d.upper()+'0' for d in ['left','down','up','right']},**{d+'Miss':'BF NOTE '+d.upper()+' MISS0' for d in ['left','down','up','right']}}
  definition={'animations':[{'anim':key,'name':prefix} for key,prefix in names.items()]}
 a=ns['atlas'](r/'images'/path,'survent/characters/'+name,definition,height=620 if name!='bf' else 440)
 a['renderScale']=.5
 art['characters']['survent:'+name]=a
for slug,stage in [('parish','church1'),('worship','church1'),('zavodila','church2'),('casanova','churchSelever'),('gospel','church3')]:
 sid='survent-'+slug;charts={};events={};sections={};base=None
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  data=json.loads((r/'data'/slug/(slug+('-alt' if diff=='hard' else suffix)+'.json')).read_text(encoding='utf-8-sig').rstrip('\x00\r\n '))['song'];charts[diff],events[diff],sections[diff]=ns['chart'](data)
  if diff=='normal':base=data
 name=base['song'];inst=r/'music'/(name+'_Inst.ogg');voices=r/'music'/(name+'_Voices.ogg');duration=max(ns['duration'](f) for f in [inst,voices] if f.exists());keys=[]
 for part in ['bg','base','floor','pillars']:
  path=r/('images/selever' if stage=='churchSelever' else 'images/sacredmass')/stage/part
  if path.with_suffix('.png').exists():
   key='survent/stage/'+stage+'/'+part;ns['atlas'](path,key,height=530,bg=True);keys.append(key)
 if slug in ['worship','gospel']:
  for part in ['circ0','circ1','circ2']:
   key='survent/fx/'+part;im=Image.open(r/'images/sacredmass/church3'/(part+'.png')).convert('RGBA');im=im.crop(im.getbbox());im.thumbnail((1000,1000));dest=root/'assets/extra-mods'/(key+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);im.save(dest,quality=90);art['sprites'][key]={'src':ns['web'](dest),'width':im.width,'height':im.height};keys.append(key)
 if slug=='casanova':
  key='survent/fx/circle';ns['atlas'](r/'images/selever/circ',key,bg=True);keys.append(key)
 enemy='survent:'+base['player2'];art['scenes'][sid]={'opponent':enemy,'player':'survent:bf','spectator':'survent:gf','characters':[enemy,'survent:bf','survent:gf'],'spriteKeys':keys};art['backgrounds'][sid]=[]
 songs[sid]={'title':'Mid-Fight Masses · '+name,'pack':'survent','sceneKey':sid,'stage':stage,'bpm':base['bpm'],'duration':duration,'beats':duration*base['bpm']/60,'genre':'MID-FIGHT MASSES','description':'원본 음원·Easy / Normal / Hard 채보 · 교회 무대','defaultDifficulty':'normal','charts':charts,'events':events,'sections':sections['normal'],'sectionsByDifficulty':sections,'audioSrc':ns['copy'](inst,'survent/audio/'+slug),'voiceSrc':ns['copy'](voices,'survent/audio/'+slug),'sky':['#271e35','#493451']}
 song=songs[sid];song['defaultDifficulty']='hard';song['chartVariant']='alt';song['description']=name+' ALT · 원본 채보 · 영상 기준 교회 무대'
 if slug=='casanova':
  song=songs[sid];song['bpm']=131;song['beats']=duration*131/60;song['defaultDifficulty']='hard';song['bpmByDifficulty']={'easy':100,'normal':100,'hard':131};song['description']='Casanova ALT · 영상 기준 채보 · 붉은 마법진 · 교회 무대';song['chartVariant']='alt'
  groups={}
  for n in charts['hard']['nova']:groups.setdefault(n['time'],[]).append(n)
  song['circleCues']=[{'time':t,'duration':max(.18,max(n['duration'] for n in group))} for t,group in groups.items() if len({n['lane'] for n in group})>=2]
 print(slug,{d:len(c['echo']) for d,c in charts.items()},flush=True)
note_src=r/'images/sacredmass/NOTE_assets2A.png'
note_dest=root/'assets/extra-mods/survent/gospel-notes.webp'
Image.open(note_src).save(note_dest,lossless=True)
frames={f.attrib['name']:f.attrib for f in ET.parse(r/'images/sacredmass/NOTE_assets2.xml').getroot() if f.tag=='SubTexture'}
skin=[]
for direction,color in [('left','purple'),('down','blue'),('up','green'),('right','red')]:
 row={}
 for kind,name in {'idle':'arrow'+direction.upper()+'0000','note':color+'0000','confirm':direction+' confirm0000','body':color+' hold piece0000','tail':('pruple end hold' if color=='purple' else color+' hold end')+'0000'}.items():
  row[kind]={key:int(frames[name].get(key,0)) for key in ['x','y','width','height','frameX','frameY','frameWidth','frameHeight']}
 skin.append(row)
songs['survent-gospel']['noteSkin']={'src':ns['web'](note_dest),'frames':skin}
def version_character(value):
 if isinstance(value,dict):return {k:version_character(v) for k,v in value.items()}
 if isinstance(value,list):return [version_character(v) for v in value]
 if isinstance(value,str) and value.startswith('assets/extra-mods/survent/characters/'):
  path=value.split('?')[0];return path+'?v='+hashlib.sha256((root/path).read_bytes()).hexdigest()[:12]
 return value
art['characters']=version_character(art['characters'])
(root/'survent-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst SURVENT_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],SURVENT_ART[key]);\nObject.assign(EXTRA_ART.sprites,SURVENT_ART.sprites);\n',encoding='utf-8')
p=root/'mod-assets.json';manifest=ns['read'](p)+['survent-mod.js']+[ns['web'](f) for f in (root/'assets/extra-mods/survent').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2),encoding='utf-8')
