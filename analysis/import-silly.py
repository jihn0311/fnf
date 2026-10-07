from pathlib import Path
import json,copy as copymodule
p=Path(__file__).with_name('import-extra-mods.py')
ns={'__file__':str(p)}
exec(p.read_text(encoding='utf-8-sig').split('def chart(s):')[0],ns)
root=p.parent.parent
r=Path('C:/Users/kht80/Desktop/fnf(꺼내서 플레이)/fnf silly billy/Silly Billy V-Slice Port')
read=ns['read'];atlas=ns['atlas'];copy=ns['copy'];art=ns['ART']
for name in ['evilLookalike','bfurself']:
 data=read(r/'data/characters'/f'{name}.json');sheet=None
 groups={}
 for a in data['animations']:
  asset=a.get('assetPath',data['assetPath'])
  if not (r/'shared/images'/asset).with_suffix('.png').exists():continue
  groups.setdefault(asset,[]).append({'anim':a['name'],'name':a['prefix'],'fps':36 if a['name']=='unshrink' else a.get('frameRate',24),'loop':a.get('looped',False),'offsets':a.get('offsets',[0,0])})
 for i,(asset,anims) in enumerate(groups.items()):
  part=atlas(r/'shared/images'/asset,'silly/characters/'+name+str(i),{'animations':anims,'flip_x':data.get('flipX',False)},height=350 if name=='evilLookalike' else 250)
  if sheet is None:sheet=copymodule.deepcopy(part)
  else:
   wanted={a['anim'] for a in anims}
   for config in part['config'].values():config['frameScale']=sheet['scale']/part['scale']
   sheet['animations'].update({k:v for k,v in part['animations'].items() if k in wanted});sheet['config'].update(part['config']);sheet['pages']+=part['pages']
 sheet['icon']=copy(r/'images/icons'/('billyicon.png' if name=='evilLookalike' else 'icon-bfurself.png'),'silly/icons')
 art['characters']['silly:'+name]=sheet
for name in ['Silly_clouds','silly_mirror','broken_mirror']:
 atlas(r/'images/bg'/name,'silly/bg/'+name,height=530,bg=True)
stage=read(r/'data/stages/billy.json')
for prop in stage['props']:
 a=prop['animations'][0]
 atlas(r/'images'/prop['assetPath'],'silly/bg/'+prop['name'],{'animations':[{'anim':'idle','name':a['prefix'],'fps':1,'loop':True}]},height=530,bg=True)
c=read(r/'data/songs/silly-billy/silly-billy-chart.json');m=read(r/'data/songs/silly-billy/silly-billy-metadata.json')
sides={'echo':[],'nova':[]}
for n in c['notes']['hard']:
 sides['echo' if n['d']<4 else 'nova'].append({'time':n['t']/1000,'lane':n['d']%4,'duration':n.get('l',0)/1000,'alt':n.get('k') in ['small','altbf']})
for side in sides:
 merged={}
 for n in sides[side]:
  key=(n['time'],n['lane'])
  if key not in merged or n['duration']>merged[key]['duration']:merged[key]=n
 sides[side]=sorted(merged.values(),key=lambda n:n['time']);last={}
 for n in reversed(sides[side]):
  if n['lane'] in last:n['duration']=min(n['duration'],max(0,last[n['lane']]-n['time']-.02))
  last[n['lane']]=n['time']
events=[{'time':e['t']/1000,'name':'Silly','v1':'','v2':'','kind':e['e'],'value':e['v']} for e in c['events']]
folder=r/'songs/silly-billy';duration=ns['duration'](folder/'Inst.ogg')
song={'title':'Silly Billy','bpm':173,'duration':duration,'beats':duration*173/60,'genre':'SILLY BILLY','description':'V-Slice 원본 Hard 채보 · 분리 보컬 · 웹 연출','pack':'silly','sceneKey':'silly-billy','audioSrc':copy(folder/'Inst.ogg','silly/audio'),'voiceSources':[copy(folder/f,'silly/audio') for f in ['Voices-evilLookalike.ogg','Voices-bfurself.ogg']],'charts':{'hard':sides},'events':{'hard':events},'sections':[{'start':0,'end':duration,'mode':'duet'}],'sky':['#151828','#242436']}
art['scenes']['silly-billy']={'opponent':'silly:evilLookalike','player':'silly:bfurself','characters':list(art['characters']),'spriteKeys':list(art['sprites']),'spectator':None}
art['backgrounds']['silly-billy']=[]
art['videos']['silly-billy']=[copy(r/'videos/videos'/f,'silly/videos') for f in ['open.mp4','SO_STAY_FINAL.mp4']]
art['sounds']['mirror_break']=copy(r/'sounds/mirror_break.ogg','silly/sounds')
js='Object.assign(MOD_SONGS,'+json.dumps({'silly-billy':song},separators=(',',':'))+');\nconst SILLY_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],SILLY_ART[key]);\nObject.assign(EXTRA_ART.sprites,SILLY_ART.sprites);Object.assign(EXTRA_ART.sounds,SILLY_ART.sounds);\n'
(root/'silly-mod.js').write_text(js,encoding='utf-8')
manifest=read(root/'mod-assets.json');manifest+=['silly-mod.js','silly-runtime.js']+[ns['web'](f) for f in (root/'assets/extra-mods/silly').rglob('*') if f.is_file()]
(root/'mod-assets.json').write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2)+'\n',encoding='utf-8')
print('Silly Billy',duration,{k:len(v) for k,v in sides.items()},flush=True)
