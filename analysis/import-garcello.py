from pathlib import Path
import json
from PIL import Image,ImageOps
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
r=Path('C:/Users/kht80/Desktop/fnf/fnf garcello/SeoS/assets');art=ns['ART'];songs={};report={}
for name in ['garcello','garcellotired','garcellodead','garcelloghosty','bf','gf']:
 file='BOYFRIEND' if name=='bf' else 'GF_assets' if name=='gf' else name+'_assets'
 pre='garcellotired' if name=='garcellotired' else 'garcello'
 if name=='gf':mapping={'idle':'GF Dancing Beat0'}
 elif name=='bf':mapping={'idle':'BF idle dance0',**{d:'BF NOTE '+d.upper()+'0' for d in ['left','down','up','right']}}
 else:mapping={'idle':pre+' idle dance',**{d:pre+' Sing Note '+d.upper() for d in ['left','down','up','right']}}
 definition={'animations':[{'anim':key,'name':value,'fps':24} for key,value in mapping.items()]}
 a=ns['atlas'](r/'shared/images'/file,'garcello/characters/'+name,definition,height=480 if name!='bf' else 440)
 a['renderScale']=.7 if name.startswith('gar') else .55
 art['characters']['garcello:'+name]=a
 if name=='garcello':
  f=a['animations']['idle'][0];im=Image.open(root/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im.thumbnail((180,180));dest=root/'assets/mod-icons/garcello.webp';im.save(dest,quality=90)
for variant,back,front in [('night','garStagebg','garStage'),('ghost','garStagebgAlt','garStagealt'),('dawn','garStagebgRise','garStageRise')]:
 im=Image.new('RGBA',(2560,1400),'black')
 for name in [back,front]:im.alpha_composite(Image.open(r/'shared/images'/(name+'.png')).convert('RGBA'))
 im=ImageOps.fit(im,(1120,530),method=Image.Resampling.LANCZOS);dest=root/'assets/extra-mods/garcello/stage'/(variant+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);im.convert('RGB').save(dest,quality=90)
 art['sprites']['garcello/stage/'+variant]={'src':ns['web'](dest)}
for slug,variant in [('headache','night'),('nerves','night'),('release','ghost'),('fading','dawn')]:
 folder=r/'songs'/slug;duration=max(ns['duration'](folder/n) for n in ['Inst.ogg','Voices.ogg']);charts={};sections={};bpms={};source={};trim={}
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  p=r/'data'/slug/(slug+suffix+'.json');d=ns['read'](p)['song'];c,events,sec=ns['chart'](d);trim[diff]=sum(n['time']>=duration for notes in c.values() for n in notes)
  for side in c:
   c[side]=[{**n,'duration':min(n['duration'],max(0,duration-n['time']))} for n in c[side] if n['time']<duration]
  charts[diff]=c;sections[diff]=[{**s,'end':min(s['end'],duration)} for s in sec if s['start']<duration];bpms[diff]=d['bpm'];source[diff]=p.relative_to(r).as_posix()
 base=ns['read'](r/'data'/slug/(slug+'.json'))['song'];sid='garcello-'+slug;enemy='garcello:'+base['player2'];gf='garcello:gf'
 art['scenes'][sid]={'opponent':enemy,'player':'garcello:bf','spectator':gf,'characters':[enemy,'garcello:bf',gf],'spriteKeys':['garcello/stage/'+variant]};art['backgrounds'][sid]=[]
 songs[sid]={'title':'Garcello · '+base['song'],'pack':'garcello','sceneKey':sid,'stage':variant,'bpm':base['bpm'],'bpmByDifficulty':bpms,'duration':duration,'beats':duration*base['bpm']/60,'defaultDifficulty':'hard','genre':'SMOKE ’EM OUT STRUGGLE','description':'원본 음원·Easy / Normal / Hard 채보 · 가셀로 골목 무대','charts':charts,'sectionsByDifficulty':sections,'sections':sections['hard'],'events':{diff:[] for diff in charts},'sourceCharts':source,'originalSpeed':base['speed'],'audioSrc':ns['copy'](folder/'Inst.ogg','garcello/audio/'+slug),'voiceSrc':ns['copy'](folder/'Voices.ogg','garcello/audio/'+slug),'sky':['#171b28','#302735']}
 report[slug]={'duration':duration,'opponent':enemy,'trimmedAfterAudio':trim,'notes':{d:{side:len(notes) for side,notes in c.items()} for d,c in charts.items()}}
 print(slug,report[slug],flush=True)
(root/'garcello-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst GARCELLO_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],GARCELLO_ART[key]);\nObject.assign(EXTRA_ART.sprites,GARCELLO_ART.sprites);\n',encoding='utf8')
(root/'analysis/garcello-import-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
p=root/'mod-assets.json';files=ns['read'](p)+['garcello-mod.js','assets/mod-icons/garcello.webp']+[ns['web'](f) for f in (root/'assets/extra-mods/garcello').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf8')
