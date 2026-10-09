from pathlib import Path
import json,re,copy as cp
p=Path(__file__).with_name('import-extra-mods.py');ns={'__file__':str(p)}
exec(p.read_text(encoding='utf-8-sig').split("for pack,folder in")[0],ns)
root=p.parent.parent;r=Path('C:/Users/kht80/Desktop/fnf impostor v4/bin/assets');art=ns['ART'];read=ns['read'];atlas=ns['atlas'];copy=ns['copy'];songs={};report={'fallbacks':[],'unsupportedEvents':{},'excludedDifficulties':[]}
cachefile=root/'analysis/impostor-atlas-cache.json'
cache=json.loads(cachefile.read_text(encoding='utf-8')) if cachefile.exists() else {}
originalatlas=atlas
def atlas(base,key,*args,**kwargs):
 if key in cache and all((root/f).exists() for f in cache[key].get('pages',[cache[key]['src']])):
  art['sprites'][key]=cache[key];return cp.deepcopy(cache[key])
 result=originalatlas(base,key,*args,**kwargs);cache[key]=cp.deepcopy(result);cachefile.write_text(json.dumps(cache,separators=(',',':')),encoding='utf-8');return result
def image(name):
 for folder in ['impostor/images','shared/images','images']:
  base=r/folder/name
  if base.with_suffix('.png').exists():return base
 return None
def character(name):
 key='impostor:'+name
 if key in art['characters']:return key
 path=r/'characters'/f'{name}.json'
 if not path.exists():report['fallbacks'].append(name);path=r/'characters/bf.json'
 data=read(path);base=image(data['image'])
 if not base:raise ValueError('missing image '+data['image'])
 sheet=atlas(base,'impostor/characters/'+name,data,height=300)
 sheet['singDuration']=data.get('sing_duration',4)
 sheet['nativeScale']=data.get('scale',1)
 icons=[r/'images/icons'/('icon-'+data.get('healthicon',name)+'.png'),r/'images/icons'/(data.get('healthicon',name)+'.png')]
 sheet['icon']=next((copy(f,'impostor/icons') for f in icons if f.exists()),'')
 art['characters'][key]=sheet;return key
exec((root/'analysis/impostor-stage-source.py').read_text(encoding='utf-8'))
supported={'Change Character','Play Animation','Alt Idle Animation','Add Camera Zoom','Camera Follow Pos','Screen Shake','Play Sound','Alter Camera Bop','Extra Cam Zoom','Camera Twist','flash','HUD Fade','Reactor Beep','setChrom','chromToggle','Defeat Fade','Defeat Retro','DefeatDark','Finale Drop','Finale End','Finale Flashback Change','scream danger','unscream danger','Dave AUGH','Lights out','Lights on','Lights Down OFF','Lights on Ending','pink toggle','Victory Darkness','Show Victory Guy','Cam lock in Voting Time','Cam lock in Who','Who Buzz','Ejected Start','Lights Down O2','WTF O2','Armed End','Turbulence Ending','bye gf','Ejected Video','Meltdown Video','Change Scroll Speed','Ellie Drop','tomongusdie'}
for folder in sorted((r/'data').iterdir()):
 if not folder.is_dir():continue
 files={}
 for file in folder.glob('*.json'):
  if file.name=='events.json':continue
  try:s=read(file)['song']
  except:continue
  if not isinstance(s,dict) or not s.get('notes') or not (r/'songs'/s.get('song','').lower()/'Inst.ogg').exists():continue
  diff='easy' if file.stem.endswith('-easy') else 'hard' if file.stem.endswith('-hard') else 'normal'
  files[diff]=file
 if not files:continue
 base=read(files.get('hard',next(iter(files.values()))))['song'];trackaudio=r/'songs'/base['song'].lower();trackduration=max(ns['duration'](f) for f in [trackaudio/'Inst.ogg',trackaudio/'Voices.ogg'] if f.exists());sid='impostor-'+folder.name;charts={};events={};sections={};chars={base['player1'],base['player2']}
 for diff,file in files.items():
  s=read(file)['song']
  for section in s['notes']:
   for note in section.get('sectionNotes',[]):
    for i in range(min(2 if float(note[1])<0 else 3,len(note))):
     try:note[i]=float(note[i])
     except (ValueError,TypeError):note[i]=0
  charts[diff],es,sections[diff]=ns['chart'](s)
  if max((n['time'] for side in charts[diff].values() for n in side),default=0)>trackduration+.5:
   report['excludedDifficulties'].append({'song':sid,'difficulty':diff,'reason':'chart extends beyond supplied audio'});del charts[diff];del sections[diff];continue
  eventfile=folder/'events.json'
  if eventfile.exists():
   eventdata=read(eventfile).get('song',{})
   for sec in eventdata.get('notes',[]):
    for n in sec.get('sectionNotes',[]):
     if float(n[1])<0 and len(n)>=5:es.append({'time':float(n[0])/1000,'name':str(n[2]),'v1':str(n[3]),'v2':str(n[4])})
   evs=eventdata.get('events',[])
   for row in evs:
    for e in row[1]:es.append({'time':row[0]/1000,'name':e[0],'v1':str(e[1]),'v2':str(e[2])})
  events[diff]=[]
  for e in es:
   if e['name']=='Change Character':chars.add(e['v2'])
   if e['name']=='Ellie Drop':chars.add('ellie')
   if e['name'] in supported:events[diff].append(e)
   else:report['unsupportedEvents'][e['name']]=report['unsupportedEvents'].get(e['name'],0)+1
  events[diff]=sorted({json.dumps(e,sort_keys=True):e for e in events[diff]}.values(),key=lambda e:e['time'])
  for notes in charts[diff].values():
   for n in notes:n['hurt']=n['sourceNoteType'] in ['Hurt Note','Kill Note'];n['duration']=min(n['duration'],max(0,trackduration-n['time']-.02))
 audio=r/'songs'/base['song'].lower();duration=trackduration
 keys=[character(c) for c in sorted(chars)];stage=base.get('stage','skeld');layers=[]
 aliases={'polus2':'polus','grey':'airship','defeat':'airship','alpha':'skeld','school':'weeb','miraHQ':'mira','airshipRoom':'airship/newAirship','plantroom':'mira','toogus':'mira','reactor2':'reactor','finalem':'finale','turbulence':'airship/turbulence','pretender':'mira/pretender','voting':'airship','lounge':'airship','warehouse':'polus'}
 nativeLayers=source_stage(stage)
 layers=[layer['key'] for layer in nativeLayers]
 layout=source_layout(base,stage,keys)
 art['scenes'][sid]={'opponent':'impostor:'+base['player2'],'player':'impostor:'+base['player1'],'characters':keys,'spriteKeys':layers,'spectator':None,'nativeLayers':nativeLayers,'layout':layout};art['backgrounds'][sid]=[]
 if not layers:report['fallbacks'].append('stage:'+stage)
 song={'title':'Impostor V4 · '+base['song'],'bpm':base['bpm'],'duration':duration,'beats':duration*base['bpm']/60,'defaultDifficulty':'hard' if 'hard' in charts else next(iter(charts)),'genre':'IMPOSTOR V4','description':'원본 음원·채보·캐릭터 · 웹 무대 재현','pack':'impostor','sceneKey':sid,'stage':stage,'charts':charts,'events':events,'sections':sections[next(iter(sections))],'sectionsByDifficulty':sections,'audioSrc':copy(audio/'Inst.ogg','impostor/audio/'+folder.name),'sky':['#121827','#253344']}
 if (audio/'Voices.ogg').exists():song['voiceSrc']=copy(audio/'Voices.ogg','impostor/audio/'+folder.name)

 videoNames={'Ejected Video':'ejected','Meltdown Video':'meltdown'}
 song['eventVideos']={name:copy(r/'videos'/(file+'.mp4'),'impostor/videos') for name,file in videoNames.items() if any(e['name']==name for es in events.values() for e in es)}
 songs[sid]=song;print('SONG',sid,flush=True)
js='Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst IMPOSTOR_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],IMPOSTOR_ART[key]);\nObject.assign(EXTRA_ART.sprites,IMPOSTOR_ART.sprites);\n'
(root/'impostor-mod.js').write_text(js,encoding='utf-8')
p=root/'mod-assets.json';manifest=read(p)+['impostor-mod.js']+[ns['web'](f) for f in (root/'assets/extra-mods/impostor').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2)+'\n',encoding='utf-8')
(root/'analysis/impostor-import-report.json').write_text(json.dumps({'songs':len(songs),**report},indent=2),encoding='utf-8');print('IMPORTED',len(songs),flush=True)
