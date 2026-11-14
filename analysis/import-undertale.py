from pathlib import Path
import json,sys,copy,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parent.parent
source=Path('C:/Users/kht80/AppData/Local/Temp/undertale-original')
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)};exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
art=ns['ART'];songs={};
old=root/'undertale-mod.js'
if old.exists():
 text=old.read_text();art.update(json.loads(text.split('const UNDERTALE_ART=',1)[1].split(';\nconst UNDERTALE_SKINS=',1)[0]))
limit=int(sys.argv[1]) if len(sys.argv)>1 else 4
slugs=['tutorial','hopes-and-dreams','your-worst-nightmare','megalovania'][:limit]
chars=['bf','gf']+(['dad'] if limit>1 else [])+(['flowey','bfBackwards'] if limit>2 else [])+(['sans','bfdark'] if limit>3 else [])
for name in chars:
 if 'undertale:'+name in art['characters']:continue
 d=ns['read'](source/'assets/preload/characters'/f'{name}.json');d['flip_x']=False
 a=ns['atlas'](source/'assets/shared/images'/d['image'],'undertale/characters/'+name,d,height=650)
 a['renderScale']=(240 if name.startswith('bf') else 280 if name=='gf' else 310)/a['animations']['idle'][0]['h'];art['characters']['undertale:'+name]=a
 if name=='gf':
  for anim in ['danceLeft','danceRight']:
   if anim in a['animations']:a['config'][anim]['fps']=24
for name in ['hall','grafix','star','bone','bonewall','soul','warning','box','Slash','lightning','vine','pellet','Souls','Souls1','Souls2','Souls3','FloweyStatic','speech_bubble']:
 ns['atlas'](source/'assets/shared/images'/name,'undertale/fx/'+name,height=650,bg=True)
skins={}
for typ,name in [('Hurt Note','HURTNOTE_assets'),('Heal Note','HEALNOTE_assets'),('Sans Note','SANSNOTE_assets')]:
 base=source/'assets/shared/images'/name;dest=root/'assets/extra-mods/undertale/notes'/f'{name}.webp';dest.parent.mkdir(parents=True,exist_ok=True);Image.open(base.with_suffix('.png')).save(dest,lossless=True)
 frames=[f.attrib for f in ET.parse(base.with_suffix('.xml')).getroot()];lanes=[]
 for color in ['purple','blue','green','red']:
  f=next(f for f in frames if f['name'].startswith(color+'0'));lanes.append({k:int(f[v]) for k,v in [('x','x'),('y','y'),('w','width'),('h','height')]})
 skins[typ]={'src':ns['web'](dest),'frames':lanes};art['sprites']['undertale/skin/'+typ]={'src':ns['web'](dest)}
for slug in slugs:
 folder=source/'assets/preload/data'/slug;charts={};events={};sections={}
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  if slug=='your-worst-nightmare' and diff!='normal':continue
  s=ns['read'](folder/(slug+suffix+'.json'))['song'];base=s
  charts[diff],events[diff],sections[diff]=ns['chart'](s)
  for side in charts[diff].values():
   for n in side:
    typ=n['sourceNoteType'];n['hurt']=typ in ['Hurt Note','Sans Note'];n['heal']=typ=='Heal Note'
 sid='undertale-'+slug;default='hard' if slug=='megalovania' else 'normal';opponent='gf' if slug=='tutorial' else 'dad' if slug=='hopes-and-dreams' else 'flowey' if slug=='your-worst-nightmare' else 'sans';player=base['player1'];scenechars=['undertale:'+n for n in dict.fromkeys([opponent,player,'gf'])]
 duration=ns['duration'](source/'assets/songs'/slug/'Inst.ogg')
 for chart in charts.values():
  for side in chart.values():
   side[:]=[n for n in side if n['time']<duration]
   for n in side:n['duration']=min(n['duration'],max(0,duration-n['time']))
 art['scenes'][sid]={'opponent':'undertale:'+opponent,'player':'undertale:'+player,'spectator':'undertale:gf','characters':scenechars,'spriteKeys':[k for k in art['sprites'] if k.startswith(('undertale/fx/','undertale/skin/'))]};art['backgrounds'][sid]=[]
 songs[sid]={'title':{'tutorial':'SOUL Tutorial','hopes-and-dreams':'Hopes and Dreams','your-worst-nightmare':'Your Worst Nightmare','megalovania':'Megalovania / Reality Check'}[slug],'pack':'undertale','sceneKey':sid,'stage':slug,'bpm':base['bpm'],'duration':duration,'beats':duration*base['bpm']/60,'defaultDifficulty':default,'genre':'UNDERTALE · ORIGINAL V1','description':'원본 구버전 채보·음원 · 방향키/지정 키로 SOUL 이동 · SPACE 점프','charts':charts,'sectionsByDifficulty':sections,'sections':sections[default],'events':events,'originalSpeed':base['speed'],'audioSrc':ns['copy'](source/'assets/songs'/slug/'Inst.ogg','undertale/audio/'+slug),'voiceSrc':ns['copy'](source/'assets/songs'/slug/'Voices.ogg','undertale/audio/'+slug) if (source/'assets/songs'/slug/'Voices.ogg').exists() else None,'sky':['#000000','#000000'],'undertaleDialogues':{p.stem:ns['read'](p).get('dialogue',[]) for p in folder.glob('*.json') if 'song' not in ns['read'](p)}}
 print('SONG',slug,duration,{d:len(c['echo']) for d,c in charts.items()},flush=True)
# Keep icon as original source artwork.
f=art['characters']['undertale:gf']['animations']['idle'][0];im=Image.open(root/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im.thumbnail((180,180));im.save(root/'assets/mod-icons/undertale.webp',quality=94)
(root/'undertale-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst UNDERTALE_ART='+json.dumps(art,separators=(',',':'))+';\nconst UNDERTALE_SKINS='+json.dumps(skins,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],UNDERTALE_ART[key]);Object.assign(EXTRA_ART.sprites,UNDERTALE_ART.sprites);\n',encoding='utf-8')
p=root/'mod-assets.json';p.write_text(json.dumps(list(dict.fromkeys(ns['read'](p)+['undertale-mod.js','undertale-runtime.js','assets/mod-icons/undertale.webp']+[ns['web'](p) for p in (root/'assets/extra-mods/undertale').rglob('*') if p.is_file()])),indent=2)+'\n')
