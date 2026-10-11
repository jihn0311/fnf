from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
r=Path('C:/Users/kht80/Desktop/fnf selever/bin/assets');art=ns['ART'];songs={}
for name,path in {'sarvente':'sacredmass/sarvente_sheet','sarvente-dark':'sacredmass/sarvente_dark','ruv':'sacredmass/ruv_sheet','bf':'BOYFRIEND','gf':'GF_assets','selever':'selever/fuckboi_sheet','sarvente-lucifer':'sacredmass/smokinhotbabe'}.items():
 a=ns['atlas'](r/'images'/path,'survent/characters/'+name,height=310 if name!='bf' else 220)
 art['characters']['survent:'+name]=a
for slug,stage in [('parish','church1'),('worship','church1'),('zavodila','church2'),('casanova','churchSelever'),('gospel','church3')]:
 sid='survent-'+slug;charts={};events={};sections={};base=None
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  data=json.loads((r/'data'/slug/(slug+suffix+'.json')).read_text(encoding='utf-8-sig').rstrip('\x00\r\n '))['song'];charts[diff],events[diff],sections[diff]=ns['chart'](data)
  if diff=='normal':base=data
 name=base['song'];inst=r/'music'/(name+'_Inst.ogg');voices=r/'music'/(name+'_Voices.ogg');duration=max(ns['duration'](f) for f in [inst,voices] if f.exists());keys=[]
 for part in ['bg','base','floor','pillars']:
  path=r/('images/selever' if stage=='churchSelever' else 'images/sacredmass')/stage/part
  if path.with_suffix('.png').exists():
   key='survent/stage/'+stage+'/'+part;ns['atlas'](path,key,height=530,bg=True);keys.append(key)
 enemy='survent:'+base['player2'];art['scenes'][sid]={'opponent':enemy,'player':'survent:bf','spectator':'survent:gf','characters':[enemy,'survent:bf','survent:gf'],'spriteKeys':keys};art['backgrounds'][sid]=[]
 songs[sid]={'title':'Mid-Fight Masses · '+name,'pack':'survent','sceneKey':sid,'stage':stage,'bpm':base['bpm'],'duration':duration,'beats':duration*base['bpm']/60,'genre':'MID-FIGHT MASSES','description':'원본 음원·Easy / Normal / Hard 채보 · 교회 무대','defaultDifficulty':'normal','charts':charts,'events':events,'sections':sections['normal'],'sectionsByDifficulty':sections,'audioSrc':ns['copy'](inst,'survent/audio/'+slug),'voiceSrc':ns['copy'](voices,'survent/audio/'+slug),'sky':['#271e35','#493451']}
 print(slug,{d:len(c['echo']) for d,c in charts.items()},flush=True)
(root/'survent-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst SURVENT_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],SURVENT_ART[key]);\nObject.assign(EXTRA_ART.sprites,SURVENT_ART.sprites);\n',encoding='utf-8')
p=root/'mod-assets.json';manifest=ns['read'](p)+['survent-mod.js']+[ns['web'](f) for f in (root/'assets/extra-mods/survent').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2),encoding='utf-8')
