from pathlib import Path
import json,re,hashlib
from PIL import Image,ImageOps
root=Path(__file__).resolve().parent.parent;r=Path('C:/Users/kht80/Desktop/fnf qt/assets');h=root/'analysis/import-extra-mods.py';ns={'__file__':str(h)};helper_source=h.read_text(encoding='utf-8-sig').split('for pack,folder in')[0];helper_source=helper_source.replace("matches=[f for f in frames if f['name'].startswith(a['name'])]","matches=[f for f in frames if re.sub(r'\\d+$','',f['name']).strip()==a['name']] or [f for f in frames if f['name'].startswith(a['name'])]");exec(helper_source,ns);art=ns['ART'];songs={};report={}
slugs=['carefree','careless','censory-overload','terminate','termination','cessation']
chars=['bf','gf','qt','qt-nervous','kb','qt-kb','bf-404','gf-404','kb-404','kb-404-angry']
for name in chars:
 d=ns['read'](r/'characters'/(name+'.json'));d['animations']=[a for a in d['animations'] if a['anim'].startswith(('idle','sing','dance')) and 'miss' not in a['anim'].lower()]
 if not any(a['anim']=='idle' for a in d['animations']):d['animations'].insert(0,{**d['animations'][0],'anim':'idle'})
 base=r/'shared/images'/d['image']
 if not base.with_suffix('.png').exists():base=r/'images'/d['image']
 a=ns['atlas'](base,'qt/characters/'+name,d,height=340);a['renderScale']=.83 if name.startswith('bf') else .85 if name.startswith('gf') else 1.1;a['flip']=False if name.startswith('bf') else d.get('flip_x',False);art['characters']['qt:'+name]=a
 if name=='qt':
  f=a['animations']['idle'][0];im=Image.open(root/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im.thumbnail((180,180))
  for pack in ['qt','qt-safe']:im.save(root/('assets/mod-icons/'+pack+'.webp'),quality=88)
for suffix in ['','Cute','Error']:
 bg=Image.open(r/('shared/images/hazard/qt-port/stage/streetBack'+suffix+'.png')).convert('RGBA');front=Image.open(r/('shared/images/hazard/qt-port/stage/streetFront'+suffix+'.png')).convert('RGBA');bg.alpha_composite(front,(0,bg.height-front.height));bg=ImageOps.fit(bg,(1120,530));dest=root/('assets/extra-mods/qt/stage/'+(suffix or 'Normal')+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);bg.save(dest,quality=88);art['sprites']['qt/stage/'+(suffix or 'Normal')]={'src':ns['web'](dest)}
# Use the native warning sprite; small atlas is decoded before playback.
base=r/'shared/images/hazard/qt-port/attack_alert_NEW';a=ns['atlas'](base,'qt/alert',height=150);art['sprites']['qt/alert']=a
ns['atlas'](r/'shared/images/hazard/qt-port/attackv6','qt/saw',{'animations':[{'anim':'idle','name':'kb_attack_animation_fire','fps':24,'loop':False}]},height=220)
art['sounds']['qt-alert']=ns['copy'](r/'shared/sounds/hazard/alert.ogg','qt/sounds')
for slug in slugs:
 folder=r/'data'/slug;base=ns['read'](folder/(slug+'.json'))['song'];charts={};events={};sections={};attacks={};sources={};bpms={}
 duration=max(ns['duration'](p) for p in (r/'songs'/slug).glob('*.ogg'))
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard'),('harder','-harder')]:
  p=folder/(slug+suffix+'.json')
  if not p.exists():continue
  d=ns['read'](p)['song'];c,ev,parts=ns['chart'](d)
  if (folder/'events.json').exists():ev+=ns['chart']({**ns['read'](folder/'events.json')['song'],'bpm':d['bpm']})[1]
  ev=sorted({json.dumps(e,sort_keys=True):e for e in ev}.values(),key=lambda e:e['time']);out=[]
  for e in ev:
   if e['name']=='Change Character OPTIONAL':out.append({**e,'name':'Change Character'})
   elif e['name']=='Alt Idle Animation':out.append(e)
   elif e['name']=='streetBG state':out.append({**e,'name':'QT Background'})
  attacks[diff]=sorted(set(round(e['time'],6) for e in ev if e['name'] in ['KB_AttackFire','KB_AttackFireDOUBLE'] and 0<=e['time']<duration))
  for side in c:
   c[side]=[dict(n,duration=min(n['duration'],duration-n['time']),hurt=n.get('sourceNoteType')=='Hurt Note') for n in c[side] if 0<=n['time']<duration]
  charts[diff]=c;events[diff]=out;sections[diff]=parts;sources[diff]=p.name;bpms[diff]=d['bpm']
 default='hard' if 'hard' in charts else 'normal';stage='Cute' if slug=='carefree' else 'Normal';scene='qt-'+slug;enemy='qt:'+base['player2'];bf='qt:'+base['player1'];gf='qt:'+(base.get('gfVersion') or 'gf');used=list(dict.fromkeys([enemy,bf,gf]+['qt:'+e['v2'] for ev in events.values() for e in ev if e['name']=='Change Character']))
 art['scenes'][scene]={'opponent':enemy,'player':bf,'spectator':gf,'characters':used,'spriteKeys':['qt/stage/'+s for s in ['Cute','Normal','Error']]+['qt/alert','qt/saw']};art['backgrounds'][scene]=[]
 audio=ns['copy'](r/'songs'/slug/'Inst.ogg','qt/audio/'+slug);vp=r/'songs'/slug/'Voices.ogg';voice=ns['copy'](vp,'qt/audio/'+slug) if vp.exists() else None
 for safe in [False,True]:
  sid=('qt-safe-' if safe else 'qt-')+slug;pack='qt-safe' if safe else 'qt';chart={d:{side:[dict(n) for n in ns if not(safe and n['hurt'])] for side,ns in c.items()} for d,c in charts.items()}
  songs[sid]={'title':'QT · '+base['song']+(' · 회피 없음' if safe else ' · 회피 있음'),'pack':pack,'sceneKey':scene,'stage':stage,'qtDodge':not safe,'qtAttacks':{} if safe else attacks,'bpm':bpms[default],'bpmByDifficulty':bpms,'duration':duration,'beats':duration*bpms[default]/60,'defaultDifficulty':default,'charts':chart,'events':events,'sections':sections[default],'sectionsByDifficulty':sections,'sourceCharts':sources,'audioSrc':audio,'sky':['#191b2d','#262236'],'description':'회피 없음 · 함정 제거' if safe else 'SPACE / 회피 버튼 · 회피 실패 또는 함정 입력 시 체력 10% 감소','genre':'QT MOD'}
  if voice:songs[sid]['voiceSrc']=voice
 report[slug]={'difficulties':list(charts),'attacks':{d:len(v) for d,v in attacks.items()},'duration':duration};print(slug,report[slug],flush=True)
p=root/'qt-mod.js';p.write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst QT_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],QT_ART[key]);\nObject.assign(EXTRA_ART.sprites,QT_ART.sprites);\n',encoding='utf8')
(root/'analysis/qt-import-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
p=root/'mod-assets.json';files=ns['read'](p)+['qt-mod.js','qt-runtime.js','assets/mod-icons/qt.webp','assets/mod-icons/qt-safe.webp']+[ns['web'](p) for p in (root/'assets/extra-mods/qt').rglob('*') if p.is_file()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf8')
