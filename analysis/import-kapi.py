from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parent.parent;ROOT=root
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
helper_source=helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0]
# A dance prefix also matches Hair Landing/Blowing; prefer its numbered group.
helper_source=helper_source.replace("matches=[f for f in frames if f['name'].startswith(a['name'])]", "matches=[f for f in frames if re.sub(r'\\d+$','',f['name']).strip()==a['name']] or [f for f in frames if f['name'].startswith(a['name'])]")
exec(helper_source,ns)
def safe_xml(path):
 text=Path(path).read_text(encoding='utf-8-sig');return ET.ElementTree(ET.fromstring(re.sub(r'&(?!#?[A-Za-z0-9]+;)', '&amp;', text)))
ns['ET'].parse=safe_xml
r=Path('C:/Users/kht80/Desktop/fnf/fnf kapi/Arcade Showdown/mods');native=r.parent/'assets';art=ns['ART'];songs={};report={}
def img(name):
 p=r/'images'/(name+'.png')
 if p.exists():return p
 for base in [native/'images',native/'shared/images',native/'week5/images',native/'week6/images']:
  p=base/(name+'.png')
  if p.exists():return p
 raise FileNotFoundError(name)
source=(root/'analysis/mario-note-skins.py').read_text().split('prefixes=')[0].replace('assets/extra-mods/mario/notes','assets/extra-mods/kapi/notes');exec(source)
for name in ['KAPI','KAPI_ANGRY','KAPIBOYFRIEND','KAPIGIRLFRIEND','G&W','dad','bf','gf','parents-christmas','bf-pixel','gf-christmas','senpai','pico','gf-pixel','mom','mom-car']:
 cp=r/'characters'/(name+'.json');d=ns['read'](cp if cp.exists() else native/'characters'/(name+'.json'));d['animations']=[a for a in d['animations'] if 'miss' not in a['anim'].lower() and not any(x in a['anim'].lower() for x in ['death','attack','dodge'])]
 if not any(v['anim']=='idle' for v in d['animations']):d['animations'].insert(0,{**next(v for v in d['animations'] if v['anim']=='danceLeft'),'anim':'idle'})
 if name in ['KAPIGIRLFRIEND','gf','gf-christmas','gf-pixel']:d['animations']=[a for a in d['animations'] if a['anim'] in ['idle','danceLeft','danceRight']]
 # This sheet has 30 dance frames, so index 30 must use the last dance pose.
 if name=='KAPIGIRLFRIEND':
  for animation in d['animations']:
   if animation['name']=='GF Dancing Beat':animation['indices']=[min(i,29) for i in animation.get('indices',[])]
 target=280 if name in ['KAPIGIRLFRIEND','KAPIBOYFRIEND','gf','bf','gf-christmas'] else 400
 a=ns['atlas'](img(d['image']).with_suffix(''),'kapi/characters/'+name,d,height=target);a['renderScale']=1.05 if name in ['KAPI','KAPI_ANGRY'] else .68 if name=='G&W' else .55;a['flip']=False if name=='KAPIBOYFRIEND' else d.get('flip_x',False)
 a['renderScale']*=480/target
 if name=='dad':a['renderScale']=1.1
 if name in ['parents-christmas','mom','mom-car']:a['renderScale']=.85
 if name in ['senpai','pico','gf-pixel']:a['renderScale']=4;a['pixel']=True
 if name in ['bf','bf-pixel','pico']:a['flip']=False
 if name=='G&W':
  seen=set();pages={}
  for frames in a['animations'].values():
   for f in frames:
    if id(f) in seen:continue
    seen.add(id(f));page=pages.setdefault(f['src'],Image.open(root/f['src']).convert('RGBA'));box=page.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])).getbbox()
    if box:f.update(x=f['x']+box[0],y=f['y']+box[1],w=box[2]-box[0],h=box[3]-box[1],ox=0,oy=0,fw=box[2]-box[0],fh=box[3]-box[1])
 art['characters']['kapi:'+name]=a
 if name=='KAPI':
  f=a['animations']['idle'][0];im=Image.open(root/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im.thumbnail((180,180));im.save(root/'assets/mod-icons/kapi.webp',quality=90)
stages={
 'stageback':[('stagebackkapiold',-600,-300,1,None,0,False),('stagefrontkapiold',-650,600,1.1,None,0,False),('lights',-600,-300,1,'lightblink',3,False)],
 'stageBop':[('stagebackkapiold',-600,-300,1,None,0,False),('stagefrontkapiold',-650,600,1.1,None,0,False),('littleguys',10,100,1,'Bottom Level Boppers',24,False),('lights',-600,-300,1,'lightblink',3,False)],
 'sunset':[('stagesunset',-600,-300,1,None,0,False),('stagefrontkapiold',-650,600,1.1,None,0,False),('littleguys',10,100,1,'Bottom Level Boppers',25,False),('lights',-600,-300,1,'lightblink',2,False),('upperBop',-550,-250,1,'Upper Crowd Bob',18,True)],
 'closed':[('closed',-600,-300,1,None,0,False),('stagefrontkapiold',-650,600,1.1,None,0,False),('lights',-600,-300,1,'lightblink',3,False),('bgFreaks',-600,-300,1,'Bottom Level Boppers',28,False),('upperBop',-550,-250,1,'Upper Crowd Bob',24,True)],
 'stage':[('stageback',-600,-300,1,None,0,False),('stagefront',-650,600,1.1,None,0,False)],
 'mall':[('christmas/bgWalls',-600,-300,.8,None,0,False),('christmas/bgEscalator',-600,-300,.8,None,0,False),('christmas/christmasTree',370,-250,.8,None,0,False),('christmas/fgSnow',-600,700,1,None,0,False)],
 'school':[('weeb/weebSky',-600,-300,6,None,0,False),('weeb/weebSchool',-400,-300,6,None,0,False),('weeb/weebStreet',-400,-300,6,None,0,False)],
 'flatfuck':[('halloween_bggame',-250,-150,1,None,0,False)]}
def source_chart(d):
 for section in d.get('notes',[]):
  notes=[]
  for n in section.get('sectionNotes',[]):
   if isinstance(n[2],str):
    if len(n)<5:continue
    n=[n[0],-1,*n[2:]]
   notes.append(n)
  section['sectionNotes']=notes
 return ns['chart'](d)

for slug in ['wocky','beathoven','hairball','nyaw','flatzone','meowgen','scratch-post','sanctuary','pyoro']:
 source=r if (r/'data'/slug).exists() else native
 charts={};events={};sections={};bpms={};sources={};base=ns['read'](source/'data'/slug/(slug+'.json'))['song'];stage=base.get('stage') or ('mall' if slug=='sanctuary' else 'stage');layers=[]
 for name,x,y,scale,anim,fps,front in stages[stage]:
  key='kapi/stage/'+name;a=ns['atlas'](img(name).with_suffix(''),key,{'animations':[{'anim':'idle','name':anim,'fps':fps,'loop':True}]} if anim else None,height=530,bg=True)
  if name=='halloween_bggame':
   im=Image.open(img(name)).crop((0,0,2100,1080)).resize((1120,530));dest=root/'assets/extra-mods/kapi/stage/flatzone.webp';im.save(dest,quality=90);a={'src':ns['web'](dest)};art['sprites'][key]=a
  if anim:
   f=a['animations']['idle'][0];w=f['fw']/a['scale'];h=f['fh']/a['scale']
  else:w,h=Image.open(img(name)).size
  z=1120/2400
  if stage=='flatfuck':xx=yy=0;ww=1120;hh=530
  else:xx=(x+600)*z;yy=(y+300)*z;ww=w*scale*z;hh=h*scale*z
  if stage=='school':xx*=1.3;ww*=1.3
  layers.append(dict(key=key,x=xx,y=yy,w=ww,h=hh,front=front,fps=fps or 24))
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  p=source/'data'/slug/(slug+suffix+'.json');d=ns['read'](p)['song'];charts[diff],ev,sections[diff]=source_chart(d);sources[diff]=p.relative_to(r.parent).as_posix();bpms[diff]=d['bpm']
  ep=p.parent/'events.json'
  if ep.exists():ev+=ns['chart']({**ns['read'](ep)['song'],'bpm':base['bpm']})[1]
  for e in ev:
   if e['name']=='Play Animation' and e['v2'] in ['KAPI','KAPI_ANGRY']:e['v2']='dad'
  events[diff]=sorted({json.dumps(e,sort_keys=True):e for e in ev}.values(),key=lambda e:e['time'])
 folder=source/'songs'/slug;duration=max(ns['duration'](folder/n) for n in ['Inst.ogg','Voices.ogg']);sid='kapi-'+slug;enemy='kapi:'+base['player2'];bf='kapi:'+base['player1'];gf='kapi:'+(base.get('gfVersion') or ('gf-pixel' if stage=='school' else 'gf-christmas' if stage=='mall' else 'gf'))
 art['scenes'][sid]={'opponent':enemy,'player':bf,'spectator':gf,'characters':list(dict.fromkeys([enemy,bf,gf]+['kapi:'+e['v2'] for ev in events.values() for e in ev if e['name']=='Change Character' and 'kapi:'+e['v2'] in art['characters']])),'spriteKeys':[l['key'] for l in layers],'layers':layers};art['backgrounds'][sid]=[]
 songs[sid]={'title':'Kapi · '+base['song'],'pack':'kapi','sceneKey':sid,'stage':stage,'bpm':base['bpm'],'bpmByDifficulty':bpms,'duration':duration,'beats':duration*base['bpm']/60,'defaultDifficulty':'hard','genre':'ARCADE SHOWDOWN','description':'원본 음원·Easy / Normal / Hard 채보 · Arcade Showdown','charts':charts,'sectionsByDifficulty':sections,'sections':sections['hard'],'events':events,'sourceCharts':sources,'noteSkin':skin('NOTE_assetsDesat' if slug=='flatzone' else 'kapiNOTE_assets'),'playerNoteSkin':skin('BFNOTES'),'audioSrc':ns['copy'](folder/'Inst.ogg','kapi/audio/'+slug),'voiceSrc':ns['copy'](folder/'Voices.ogg','kapi/audio/'+slug),'sky':['#181424','#312338']}
 report[slug]={'duration':duration,'stage':stage,'opponent':enemy,'notes':{d:{s:len(n) for s,n in c.items()} for d,c in charts.items()},'events':{d:len(e) for d,e in events.items()}};print(slug,report[slug],flush=True)
(root/'kapi-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst KAPI_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],KAPI_ART[key]);\nObject.assign(EXTRA_ART.sprites,KAPI_ART.sprites);\n',encoding='utf8')
(root/'analysis/kapi-import-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
p=root/'mod-assets.json';files=ns['read'](p)+['kapi-mod.js','assets/mod-icons/kapi.webp']+[ns['web'](f) for f in (root/'assets/extra-mods/kapi').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf8')

# Version regenerated images independently of the script cache.
import hashlib
from functools import lru_cache
@lru_cache(None)
def image_version(path):return hashlib.sha256((root/path).read_bytes()).hexdigest()[:12]
p=root/"kapi-mod.js"
s=p.read_text(encoding='utf8')
s=re.sub(r'"(assets/extra-mods/kapi/[^"?]+\.webp)"',lambda m:'"'+m[1]+'?v='+image_version(m[1])+'"',s)
p.write_text(s,encoding='utf8')
