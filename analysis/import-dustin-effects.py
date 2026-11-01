from pathlib import Path
import json,re,xml.etree.ElementTree as ET,shutil
from PIL import Image
root=Path(__file__).resolve().parent.parent
r=Path("C:/Users/kht80/Desktop/fnf/fnf Dustin'/mods/dustin")
ns={'__file__':str(root/'analysis/import-extra-mods.py')};exec((root/'analysis/import-extra-mods.py').read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
ns['int']=lambda v:int(float(v))
text=(root/'dustin-mod.js').read_text(encoding='utf8');songs=json.loads(text.split('Object.assign(MOD_SONGS,')[1].split(');\nconst')[0]);base=json.loads(text.split('const DUSTIN_ART=')[1].split(';\nfor')[0]);art=ns['ART'];data={};audit={}
cache=root/'dustin-effects.js'
if cache.exists():
 art['sprites']=json.loads(cache.read_text(encoding='utf8').split('Object.assign(EXTRA_ART.sprites,')[1].rsplit(');',1)[0])
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def xml(p):return ET.fromstring(re.sub(r'&(?!#?[A-Za-z0-9]+;)', '&amp;',re.sub(r'"(?=[A-Za-z_]+\s*=)','" ',p.read_text(encoding='utf-8-sig'))))
def asset(rel):
 for b in [r,r.parent.parent/'assets']:
  p=b/rel
  if p.exists():return p
 return r/rel
def sprite(rel,key,height=530):
 if key in art['sprites']:return art['sprites'][key]
 p=asset('images/'+rel+'.png')
 if not p.exists():return None
 xp=p.with_suffix('.xml');defs=[]
 if xp.exists():
  groups={}
  for f in xml(xp):groups.setdefault(re.sub(r'\d+$','',f.get('name','')).strip(),[]).append(f)
  for name,frames in groups.items():
   stride=max(1,(len(frames)+11)//12);defs.append({'anim':name,'name':name,'indices':list(range(0,len(frames),stride)),'fps':24/stride,'loop':True})
 a=ns['atlas'](p.with_suffix(''),key,{'animations':defs} if defs else None,height=height,bg=True);return a
def script_operations(source,names,aliases):
 source=re.sub(r'/\*.*?\*/','',source,flags=re.S);source=re.sub(r'//[^\n]*','',source)
 functions={}
 for match in re.finditer(r'function\s+(\w+)\s*\([^)]*\)\s*(?:[:\w<>]+\s*)?\{',source):
  start=match.end();depth=1;i=start
  while i<len(source) and depth:
   if source[i]=='{':depth+=1
   elif source[i]=='}':depth-=1
   i+=1
  functions.setdefault(match[1],[]).append(source[start:i-1])
 def operations(body):
  ops=[]
  # Preserve source order and literal timer offsets; never run delayed callbacks early.
  timers=[]
  for tm in re.finditer(r'\.start\(\s*([0-9.]+)\s*,\s*(?:function\s*\([^)]*\)|\([^)]*\)\s*->)\s*\{',body):
   depth=1;j=tm.end()
   while j<len(body) and depth:
    if body[j]=='{':depth+=1
    elif body[j]=='}':depth-=1
    j+=1
   timers.append((tm.end(),j,float(tm[1])))
  def add(pos,op):
   op['delay']=sum(delay for start,end,delay in timers if start<=pos<end)
   ops.append((pos,op))
  target=r'(?:stage\.getSprite\("([^"\n]+)"\)|stage\.stageSprites\["([^"\n]+)"\]|(\w+))'
  for m in re.finditer(target+r'\.(visible|alpha)\s*=\s*(true|false|[-+]?(?:\d*\.)?\d+)\s*;',body):
   name=m[1] or m[2] or aliases.get(m[3],m[3])
   if name in names:add(m.start(),{'name':name,'property':m[4],'value':m[5]=='true' if m[5] in ['true','false'] else float(m[5])})
  for m in re.finditer(target+r'\.playAnim\("([^"\n]+)"',body):
   name=m[1] or m[2] or aliases.get(m[3],m[3])
   if name in names:add(m.start(),{'name':name,'property':'anim','value':m[4]})
  for m in re.finditer(r'executeEvent\(\{\s*name:\s*"([^"\n]+)"\s*,\s*time:\s*0\s*,\s*params:\s*(\[[^\]]*\])\s*\}\)',body):
   raw=re.sub(r'0x[0-9A-Fa-f]+',lambda h:str(int(h[0],16)),m[2])
   try:params=json.loads(raw)
   except (ValueError,TypeError):continue
   add(m.start(),{'event':{'name':m[1],'params':params}})
  return [op for _,op in sorted(ops,key=lambda item:item[0])]
 initial=[];steps=[];calls={}
 for name,bodies in functions.items():
  for body in bodies:
   if name in ['postCreate','create']:initial+=operations(body)
   elif name=='stepHit':
    matches=list(re.finditer(r'case\s+([0-9, |]+)\s*:',body))
    for i,m in enumerate(matches):
     ops=operations(body[m.end():matches[i+1].start() if i+1<len(matches) else len(body)])
     if ops:
      for step in map(int,re.findall(r'\d+',m[1])):steps.append({'step':step,'operations':ops})
   else:
    ops=operations(body)
    if ops:calls.setdefault(name,[]).extend(ops)
 return sorted(steps,key=lambda e:e['step']),initial,calls

for sid,song in songs.items():
 slug=sid[7:];folder=r/'songs'/slug;scene=base['scenes'][sid];v=scene['dustinView'];layers=[];stagefile=asset('data/stages/'+song['stage']+'.xml')
 scripts=list((folder/'scripts').glob('*.hx'));stagescript=asset('data/stages/'+song['stage']+'.hx')
 if stagescript.exists():scripts.append(stagescript)
 sources='\n'.join(p.read_text(encoding='utf-8-sig') for p in scripts);aliases=dict(re.findall(r'(\w+)\s*=\s*stage\.(?:stageSprites\[|getSprite\()"([^"\n]+)"',sources))
 if stagefile.exists():
  stage=xml(stagefile);front=False
  for node in list(stage)+list(stage.findall('precache-sans/sprite')):
   if node.tag in ['player','boyfriend','bf','opponent','dad','gf','girlfriend']:front=True;continue
   if node.tag!='sprite':continue
   variant=node in list(stage.findall('precache-sans/sprite'));name=node.get('name','');rel='/'.join(x.strip('/') for x in [stage.get('folder',''),node.get('sprite','')] if x);key='dustin/effects/'+song['stage']+'/'+('sans-' if variant else '')+name
   a=sprite(rel,key,400)
   if not a:continue
   p=asset('images/'+rel+'.png');im=Image.open(p);w,h=im.size
   if a.get('animations'):
    f=a['animations']['idle'][0];w,h=f['fw']/a['scale'],f['fh']/a['scale']
   scale=float(node.get('scale',1));props={x.get('name'):x.get('value') for x in node.findall('property')};visible=node.get('visible',props.get('visible','true'))!='false';alpha=float(node.get('alpha',props.get('alpha',1)))
   # Script-created mechanics are drawn by their own controllers.
   if any(t in name.upper() for t in ['IMPACT','BLASTER','PRESS_SPACE','SHADOW']):visible=False
   for alias,target in aliases.items():
    if target==name and re.search(r'\b'+re.escape(alias)+r'\.visible\s*=\s*false',sources[:sources.find('function stepHit') if 'function stepHit' in sources else 0]):visible=False
   layers.append({'key':key,'name':name,'x':(float(node.get('x',0))-v['left'])*v['scale'],'y':(float(node.get('y',0))-v['top'])*v['scale'],'w':w*scale*v['scale'],'h':h*scale*v['scale'],'alpha':alpha,'visible':visible,'front':front and not variant,'variant':'sans' if variant else 'base'})
 record={'layers':layers,'events':{},'hazards':{},'tempo':{},'videos':{},'sourceStageZoom':float(xml(stagefile).get('zoom',1)) if stagefile.exists() else 1,'scriptSteps':[]}
 for chartfile in (folder/'charts').glob('*.json'):
  c=read(chartfile);ev=(c.get('events') or [])+((read(folder/'events.json').get('events') or []) if (folder/'events.json').exists() else []);ev=sorted(ev,key=lambda e:e['time']);bpm=song['bpm'];at=step=0;tempo=[{'time':0,'step':0,'bpm':bpm}];out=[]
  for e in ev:
   t=e['time']/1000
   if e['name']=='BPM Change':step+=(t-at)*bpm/15;at=t;bpm=float(e['params'][0]);tempo.append({'time':t,'step':step,'bpm':bpm})
   out.append({'time':t,'name':e['name'],'params':e['params'],'stepSeconds':15/bpm})
   if e['name']=='Video Cutscene':
    name=e['params'][0];vp=asset('videos/'+name+'.'+(e['params'][1] or 'mp4'))
    if vp.exists():record['videos'][name]=ns['copy'](vp,'dustin/effects/video')
  hazards={'nova':[],'echo':[]}
  for i,line in enumerate(c['strumLines']):
   if line.get('type')==2:continue
   side='echo' if line.get('type')==1 else 'nova'
   for n in line['notes']:
    typ=n.get('type',0);typ=c.get('noteTypes',[])[typ-1] if isinstance(typ,int) and 0<typ<=len(c.get('noteTypes',[])) else ''
    if typ in ['Madness_NOTE_assets','NOTE_karma','NOTE_hate'] and 0<=n['time']/1000<song['duration']:hazards[side].append({'time':n['time']/1000,'lane':n['id']%4,'duration':0,'dustinLine':i,'sourceNoteType':typ,'hurt':True,'type':0})
  record['events'][chartfile.stem]=out;record['hazards'][chartfile.stem]=hazards;record['tempo'][chartfile.stem]=tempo
 record['noteSkin']=xml(stagefile).get('noteSkin','default') if stagefile.exists() else 'default'
 record['skins']=sorted({record['noteSkin']}|{e['params'][0] for ev in record['events'].values() for e in ev if e['name']=='Change Strum Skin'})
 for skin in record['skins']:
  sprite('game/notes/'+skin,'dustin/effects/game/notes/'+skin,100)
  for suffix in ['_END','_ENDs']:sprite('game/notes/'+skin+suffix,'dustin/effects/game/notes/'+skin+suffix,100)
 record['storyVideos']={}
 for kind,suffix in [('intro','-cutscene'),('outro','-end-cutscene')]:
  vp=asset('videos/'+slug+suffix+'.mp4')
  if vp.exists():record['storyVideos'][kind]=ns['copy'](vp,'dustin/effects/video')
 if stagefile.exists():
  roles={'player':'echo','boyfriend':'echo','bf':'echo','opponent':'nova','dad':'nova','gf':'gf','girlfriend':'gf'}
  record['drawOrder']=[{'side':roles[node.tag]} if node.tag in roles else {'name':node.get('name','')} for node in xml(stagefile) if node.tag in roles or node.tag=='sprite']
 record['scriptSteps'],record['scriptInitial'],record['scriptCalls']=script_operations(sources,{l['name'] for l in layers},aliases)
 # Keep a source audit rather than silently labeling unknown script choreography as implemented.
 calls=sorted({e['params'][0] for ev in record['events'].values() for e in ev if e['name']=='HScript Call'})
 audit[slug]={'scripts':[str(p.relative_to(r)) for p in scripts],'calls':calls,'events':sorted({e['name'] for ev in record['events'].values() for e in ev}),'layers':len(layers)}
 data[sid]=record;print(slug,len(layers),'layers',len(record['videos']),'videos',flush=True)
for kind in ['Madness_NOTE_assets','NOTE_karma','NOTE_hate']:sprite('game/notes/types/'+kind,'dustin/effects/game/notes/types/'+kind,100)
for rel in ['game/mechanics/strum_covering_bones','game/undertale/spr_heart_0','game/undertale/spr_target','game/undertale/spr_targetchoice','game/undertale/spr_plusbomb','game/undertale/spr_gasterblaster','game/undertale/spr_plusbomb_coreblast']:
 sprite(rel,'dustin/effects/'+rel,300)
# Special poses use separate atlases so the low-spec assets stay byte-for-byte unchanged.
charenv={'__file__':str(root/'analysis/import-dustin.py')}
charsource=(root/'analysis/import-dustin.py').read_text(encoding='utf8').split('order=')[0]
charsource=charsource.replace("out=root/'assets/extra-mods/dustin'","out=root/'assets/extra-mods/dustin/effects'")
charsource=charsource.replace("if not key.startswith(('idle','sing','dance')) or 'miss' in key.lower():continue","if 'miss' in key.lower():continue")
charsource=charsource.replace("if not k.startswith(('idle','sing','dance')) or 'miss' in k.lower():continue","if 'miss' in k.lower():continue")
charsource=charsource.replace("idx=list(range(int(raw.split('..')[0]),int(raw.split('..')[1])+1)) if '..' in raw else [int(n) for n in re.findall(r'\\d+',raw)]","idx=[value for token in raw.split(',') for value in (list(range(int(token.split('..')[0]),int(token.split('..')[1])+1)) if '..' in token else [int(token)])]")
exec(charsource,charenv)
for name in sorted({key.split(':',1)[1] for scene in base['scenes'].values() for key in scene['characters']}):
 cp=asset('data/characters/'+name+'.xml')
 if cp.exists() and any(not a.get('name','').startswith(('idle','sing','dance')) for a in xml(cp).findall('anim')):charenv['character'](name)
charenv['character']('papyrus_lyrics')
fullchars=charenv['art']['characters']
# The source aliases idle and lyrics to the same long timeline; share decoded pages.
paps=fullchars.get('dustin:papyrus_lyrics')
if paps:
 paps['animations']['idle']=paps['animations']['lyrics']
 paps['config']['idle']=paps['config']['lyrics']
 paps['pages']=list(dict.fromkeys(f['src'] for f in paps['animations']['lyrics']))
 paps['src']=paps['pages'][0]
(root/'dustin-effects.js').write_text('const DUSTIN_EFFECTS='+json.dumps(data,separators=(',',':'))+';\nconst DUSTIN_EFFECT_CHARACTERS='+json.dumps(fullchars,separators=(',',':'))+';\nObject.assign(EXTRA_ART.sprites,'+json.dumps(art['sprites'],separators=(',',':'))+');\n',encoding='utf8')
(root/'analysis/dustin-effects-audit.json').write_text(json.dumps(audit,indent=2),encoding='utf8')
p=root/'mod-assets.json';files=read(p)+['dustin-effects.js','dustin-effects-runtime.js']+[ns['web'](p) for p in (root/'assets/extra-mods/dustin/effects').rglob('*') if p.is_file() and p.suffix!='.json'];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf8')
