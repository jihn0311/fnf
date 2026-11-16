from pathlib import Path
import importlib.util,json,copy,subprocess
from PIL import Image
spec=importlib.util.spec_from_file_location('extract',Path(__file__).with_name('rebuild-evil-reference.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
cv2,np=m.cv2,m.np;ROOT,OUT,FF=m.ROOT,m.OUT,m.FF
helper=ROOT/'analysis/import-extra-mods.py';ns={'__file__':str(helper)};exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
art=ns['ART'];songs={};report={};native=Path('C:/Users/kht80/Desktop/fnf/fnf soulbf mod/Soul Boyfriend Week Demo/mods/Corruption')
old=ROOT/'evil-reference-mod.js'
if old.exists():art.update(json.JSONDecoder().raw_decode(old.read_text(encoding='utf-8-sig').split('const EVIL_REFERENCE_ART=')[1])[0])
for name in ['soul','bf-default','tv','scared-bf']:
 key='evil-reference:'+name
 if key in art['characters']:continue
 d=json.loads((native/'characters'/f'{name}.json').read_text(encoding='utf-8-sig'));d['flip_x']=False
 a=ns['atlas'](native/'images'/d['image'],'evil-reference/characters/'+name,d,height=500);a['renderScale']=(260 if name!='tv' else 200)/a['animations']['idle'][0]['h'];art['characters'][key]=a
art['characters']['evil-reference:soul']['flip']=True
existing=json.JSONDecoder().raw_decode((ROOT/'extra-mods.js').read_text(encoding='utf-8-sig').split('const EXTRA_ART=')[1])[0]
# Import the uncorrupted Day 1 opponent separately.
d=json.loads((native.parent.parent/'assets/characters/dad.json').read_text(encoding='utf-8-sig'));d['flip_x']=False
a=ns['atlas'](native.parent.parent/'assets/shared/images'/d['image'],'evil-reference/characters/clean-dad',d,height=650);a['renderScale']=380/a['animations']['idle'][0]['h'];art['characters']['evil-reference:clean-dad']=a
for name in ['bf','dearest','dearestresist','dearestcanon','dearestend','corruptedmom','pico-player','spooky-player']:
 a=copy.deepcopy(existing['characters']['death:'+name]);a['flip']=False;a['renderScale']=(380 if name.startswith('dearest') else 230)/a['animations']['idle'][0]['h'];art['characters']['evil-reference:'+name]=a
for name in ['TormentorBG','NeurosesBG','background','platform']:ns['atlas'](native/'images/mind'/name,'evil-reference/bg/'+name,bg=True)
for name in ['stage','stagewall','curtains','eyes']:art['sprites']['evil-reference/bg/'+name]=existing['sprites']['death/stage/'+name]
sky=OUT/'sky-capture.webp'
if True:
 f=m.capture(1,75);masks=np.zeros((360,640),np.uint8);masks[:82,:]=255;masks[85:300,60:285]=255;masks[180:335,350:550]=255;masks[225:290,0:70]=255
 f=cv2.inpaint(f,masks,7,cv2.INPAINT_TELEA);Image.fromarray(cv2.cvtColor(f,cv2.COLOR_BGR2RGB)).save(sky,quality=95)
art['sprites']['evil-reference/bg/sky']={'src':ns['web'](sky),'width':640,'height':360}
chart=m.extract(2,0,332)
for side,rect in [('nova',(5,40,305,300)),('echo',(330,130,300,205))]:
 key='evil-reference/capture/'+side
 if key in art['sprites'] and art['sprites'][key].get('cleanCapture'):continue
 frames={};sheet=Image.new('RGBA',(1280,1800));row=0
 for lane,anim in [(-1,'idle'),(0,'singLEFT'),(1,'singDOWN'),(2,'singUP'),(3,'singRIGHT')]:
  candidates=[n for n in chart[side] if 150<n['time']<160 and (lane<0 or n['lane']==lane)]
  at=154.0;frames[anim]=[]
  for j in range(2):
   f=m.capture(2,at+j/24);mask=np.zeros((360,640),np.uint8);cv2.grabCut(f,mask,rect,np.zeros((1,65)),np.zeros((1,65)),4,cv2.GC_INIT_WITH_RECT)
   rgba=cv2.cvtColor(f,cv2.COLOR_BGR2RGBA);rgba[:,:,3]=np.where((mask==1)|(mask==3),255,0).astype(np.uint8);im=Image.fromarray(rgba);sheet.paste(im,(j*640,row*360));frames[anim].append({'x':j*640,'y':row*360,'w':640,'h':360,'ox':0,'oy':0,'fw':640,'fh':360})
  row+=1
 path=OUT/(side+'-guitar-capture.webp');sheet.save(path,lossless=True);src=ns['web'](path);art['sprites'][key]={'src':src,'pages':[src],'scale':1,'animations':frames,'cleanCapture':True}
for index,slug,title,start,end in m.STAGES:
 # Refined gameplay endings exclude the credits and fan-art montages.
 end={0:195,3:112}.get(index,end)
 audio=OUT/(slug+'.m4a')
 if not audio.exists():subprocess.run([FF,'-loglevel','error','-ss',str(start),'-i',m.INFO[index]['file'],'-t',str(end-start),'-vn','-c:a','aac','-b:a','160k','-y',str(audio)],check=True)
 raw=copy.deepcopy(m.extract(index,start,end));charts={}
 for side,notes in raw.items():
  notes[:]=sorted((n for n in notes if 0<=n['time']<end-start),key=lambda n:n['time'])
  next_lane={}
  for n in reversed(notes):
   limit=min(end-start,next_lane.get(n['lane'],end-start))
   n['duration']=max(0,min(n.get('duration',0),limit-n['time']-.025))
   if n['duration']<.12:n['duration']=0
   next_lane[n['lane']]=n['time']
 for diff in ['easy','normal','hard']:
  charts[diff]={side:[{k:v for k,v in n.items() if k!='confidence'} for j,n in enumerate(notes) if n['time']<end-start and (diff!='easy' or j%3!=1)] for side,notes in raw.items()}
 sid='evil-reference-'+slug;dad=slug.startswith('dad');chars=['evil-reference:'+n for n in (['bf','clean-dad','dearest','dearestresist','dearestcanon','dearestend','corruptedmom','pico-player','spooky-player'] if dad else ['soul','bf-default','tv','scared-bf'])]
 keys=['evil-reference/bg/'+n for n in (['stage','stagewall','curtains','eyes'] if dad else ['TormentorBG','NeurosesBG','background','platform','sky'])]
 if slug=='soul-final':keys+=['evil-reference/capture/nova','evil-reference/capture/echo']
 art['scenes'][sid]={'opponent':chars[1] if dad else chars[0],'player':chars[0] if dad else chars[1],'characters':chars,'spriteKeys':keys};art['backgrounds'][sid]=[]
 songs[sid]={'title':title,'pack':'evil-reference','stage':slug,'sceneKey':sid,'bpm':120,'duration':end-start,'beats':(end-start)*2,'defaultDifficulty':'normal','genre':'CORRUPTION · VIDEO RECONSTRUCTION','description':'제공 영상 기반 재구성 · 캡처 대체 장면 · 영상 추정 채보 (원본과 오차 있음)','charts':charts,'events':{'easy':[],'normal':[],'hard':[]},'sections':[],'audioSrc':ns['web'](audio),'sky':['#100d19','#211b31'],'originalSpeed':1,'referenceStart':start}
 report[slug]={'source':Path(m.INFO[index]['file']).name,'range':[start,end],'notes':{k:len(v) for k,v in charts['normal'].items()},'chart':'Video tracking at 30 fps; occluded arrows, sustain endings and moving lanes can differ. Normal/Hard share reconstruction; Easy thins notes.','audio':'Video mix includes vocals and effects; no separate stems.','visuals':'Existing matching native sprites plus screenshot-derived sky and guitar poses. Camera/effect reconstruction is approximate.'}
 print('BUILT',slug,report[slug]['notes'],flush=True)
f=art['characters']['evil-reference:soul']['animations']['idle'][0];icon=Image.open(ROOT/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));icon.thumbnail((180,180));icon.save(ROOT/'assets/mod-icons/evil-reference.webp',lossless=True)
(ROOT/'evil-reference-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst EVIL_REFERENCE_ART='+json.dumps(art,separators=(',',':'))+';\nObject.assign(MOD_ART.characters,EVIL_REFERENCE_ART.characters);Object.assign(MOD_ART.scenes,EVIL_REFERENCE_ART.scenes);Object.assign(MOD_ART.backgrounds,EVIL_REFERENCE_ART.backgrounds);Object.assign(EXTRA_ART.sprites,EVIL_REFERENCE_ART.sprites);\n',encoding='utf-8')
(ROOT/'analysis/evil-reference-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
p=ROOT/'mod-assets.json';files=json.loads(p.read_text());files+=['evil-reference-mod.js','evil-reference-runtime.js','assets/mod-icons/evil-reference.webp']+[ns['web'](p) for p in OUT.rglob('*') if p.is_file()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2)+'\n')
