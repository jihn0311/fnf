from pathlib import Path
import json,re,math,hashlib,xml.etree.ElementTree as ET
from PIL import Image,ImageOps
root=Path(__file__).resolve().parent.parent
r=Path("C:/Users/kht80/Desktop/fnf/fnf Dustin'/mods/dustin")
h=root/'analysis/import-extra-mods.py';ns={'__file__':str(h)};exec(h.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
art=ns['ART'];songs={};report={'limitations':['Mechanics-light adaptation: no dodge/minigames, madness/karma gauges, scripted lethal attacks, note displacement, shaders, videos or dialogue. Native charts, audio and explicit character-change events retained. Script-only scene choreography is not reproduced.'],'missing':[]}
out=root/'assets/extra-mods/dustin';out.mkdir(parents=True,exist_ok=True)
def xml(p):return ET.fromstring(re.sub(r'&(?!#?[A-Za-z0-9]+;)', '&amp;',re.sub(r'"(?=[A-Za-z_]+\s*=)','" ',p.read_text(encoding='utf-8-sig'))))
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def url(p):return p.relative_to(root).as_posix() if p.is_absolute() else p.as_posix()
def resolve(rel):
 for base in [r,r.parent.parent/'assets']:
  p=base/rel
  if p.exists() or p.with_suffix(".png").exists():return p
 return r/rel
cache=out/'character-cache.json';cached=read(cache) if cache.exists() else {}
def character(name):
 if 'dustin:'+name in art['characters']:return True
 if name in cached:art['characters']['dustin:'+name]=cached[name];return True
 cp=resolve('data/characters/'+name+'.xml')
 if not cp.exists():report['missing'].append('character '+name);return False
 d=xml(cp);sprite=d.get('sprite',name);base=resolve('images/characters/'+sprite)
 if base.is_dir() and (base/'Animation.json').exists():
  module={};exec((root/'analysis/camellia-assets.py').read_text(encoding='utf8').replace('480/(y1-y0),700/(x1-x0)','260/(y1-y0),420/(x1-x0)'),module)
  defs=[]
  for node in d.findall('anim'):
   key=node.get('name','')
   if not key.startswith(('idle','sing','dance')) or 'miss' in key.lower():continue
   indices=[];raw=node.get('indices','')
   if '..' in raw:
    lo,hi=map(int,raw.split('..'));indices=list(range(lo,hi+1))
   elif raw:indices=[int(i) for i in re.findall(r'\d+',raw)]
   defs.append({'name':key,'id':node.get('anim',key),'framerate':float(node.get('fps',24)),'looped':node.get('loop')=='true','offsets':[float(node.get('x',0)),float(node.get('y',0))],'indices':indices})
  a=module['adobe'](base,defs,out/'characters'/name)
  a['pages']=[url(Path(v)) for v in a['pages']];a['src']=a['pages'][0];a['renderScale']=1
  for frames in a['animations'].values():
   for f in frames:f['src']=url(Path(f['src']))
  art['characters']['dustin:'+name]=a;cached[name]=a;cache.write_text(json.dumps(cached),encoding='utf8');print('ADOBE',name,flush=True);return True
 pages=sorted(base.glob('*.xml')) if base.is_dir() else [base.with_suffix('.xml')]
 entries=[]
 for xp in pages:
  if xp.exists():entries.extend((xp.with_suffix('.png'),f.attrib) for f in xml(xp))
 if not entries:report['missing'].append('atlas '+name);return False
 animations={};config={}
 for a in d.findall('anim'):
  k=a.get('name','');prefix=a.get('anim',k)
  if not k.startswith(('idle','sing','dance')) or 'miss' in k.lower():continue
  matches=[v for v in entries if re.sub(r'\d+$','',v[1]['name']).strip()==prefix] or [v for v in entries if v[1]['name'].startswith(prefix)]
  if a.get('indices'):
   raw=a.get('indices');idx=list(range(int(raw.split('..')[0]),int(raw.split('..')[1])+1)) if '..' in raw else [int(n) for n in re.findall(r'\d+',raw)];matches=[matches[i] for i in idx if i<len(matches)]
  if not matches:continue
  step=max(1,math.ceil(len(matches)/16));animations[k]=matches[::step];config[k]={'fps':float(a.get('fps',24))/step,'loop':a.get('loop')=='true','offsets':[float(a.get('x',0)),float(a.get('y',0))]}
 if not animations:report['missing'].append('animations '+name);return False
 if 'idle' not in animations:
  key='danceLeft' if 'danceLeft' in animations else next(iter(animations));animations['idle']=animations[key];config['idle']=config[key]
 idle=animations['idle'][0][1];scale=min(260/max(1,int(idle.get('frameHeight',idle['height']))),420/max(1,int(idle.get('frameWidth',idle['width']))))
 sheet=Image.new('RGBA',(2048,2048));x=y=row=page=0;packed={};images={};a={'animations':{},'config':config,'pages':[],'scale':scale,'flip':(d.get('flipX')=='true')!=(d.get('isPlayer')=='true'),'renderScale':1,'nativeScale':float(d.get('scale',1))}
 def save():
  p=out/'characters'/(name+'-'+str(page)+'.webp');p.parent.mkdir(parents=True,exist_ok=True);sheet.crop((0,0,2048,max(1,y+row))).save(p,quality=84,method=2);a['pages'].append(url(p))
 for key,frames in animations.items():
  a['animations'][key]=[]
  for src,f in frames:
   token=(str(src),f['name'])
   if token not in packed:
    if src not in images:images[src]=Image.open(src).convert('RGBA')
    xx,yy,w,h=[int(f[k]) for k in ['x','y','width','height']];im=images[src].crop((xx,yy,xx+w,yy+h))
    if f.get('rotated')=='true':im=im.transpose(Image.Transpose.ROTATE_90)
    w,h=round(im.width*scale),round(im.height*scale);im=im.resize((max(1,w),max(1,h)),Image.Resampling.LANCZOS)
    if w>2048 or h>2048:raise ValueError('oversize '+name)
    if x+w>2048:x=0;y+=row+2;row=0
    if y+h>2048:save();sheet=Image.new('RGBA',(2048,2048));x=y=row=0;page+=1
    dest=out/'characters'/(name+'-'+str(page)+'.webp');packed[token]={'src':url(dest),'x':x,'y':y,'w':w,'h':h,'ox':-float(f.get('frameX',0))*scale,'oy':-float(f.get('frameY',0))*scale,'fw':float(f.get('frameWidth',int(f['width'])))*scale,'fh':float(f.get('frameHeight',int(f['height'])))*scale};sheet.paste(im,(x,y));x+=w+2;row=max(row,h)
   a['animations'][key].append(packed[token])
 save();a['src']=a['pages'][0];art['characters']['dustin:'+name]=a;cached[name]=a;cache.write_text(json.dumps(cached),encoding='utf8');print('CHAR',name,flush=True);return True

def stage(name):
 key='dustin/stage/'+name
 if key in art['sprites']:return key
 p=resolve('data/stages/'+name+'.xml');layers=[]
 if p.exists():
  d=xml(p);folder=d.get('folder','');
  for node in d:
   if node.tag in ['dad','bf','gf','player','opponent','girlfriend']:break
   if node.tag!='sprite' or float(node.get('alpha',1))<=0 or node.get('visible')=='false' or any(v.get('name')=='visible' and v.get('value')=='false' or v.get('name')=='alpha' and v.get('value')=='0' for v in node.findall('property')):continue
   if any(w in node.get('name','').lower() for w in ['vignette','overlay','particle','flash','hud','shade']):continue
   src=resolve('images/'+folder+'/'+node.get('sprite',''))
   src=src.with_suffix('.png')
   if not src.exists():continue
   im=Image.open(src).convert('RGBA');xp=src.with_suffix('.xml')
   if xp.exists():
    f=next(iter(xml(xp))).attrib;x,y,w,h=[int(f[k]) for k in ['x','y','width','height']];im=im.crop((x,y,x+w,y+h))
   z=float(node.get('scale',1));layers.append((im,float(node.get('x',0)),float(node.get('y',0)),z))
 if layers:
  # Flatten initial native background layers once; keep a fixed, lightweight scene.
  x0=min(x for _,x,y,z in layers);y0=min(y for _,x,y,z in layers);x1=max(x+im.width*z for im,x,y,z in layers);y1=max(y+im.height*z for im,x,y,z in layers);factor=min(1400/max(1,x1-x0),800/max(1,y1-y0));bg=Image.new('RGBA',(max(1,round((x1-x0)*factor)),max(1,round((y1-y0)*factor))),'#151625')
  for im,x,y,z in layers:
   im=im.resize((max(1,round(im.width*z*factor)),max(1,round(im.height*z*factor))),Image.Resampling.LANCZOS);bg.alpha_composite(im,(round((x-x0)*factor),round((y-y0)*factor)))
  bg=ImageOps.fit(bg,(1120,530),method=Image.Resampling.LANCZOS)
 else:bg=Image.new('RGB',(1120,530),'#151625');report['missing'].append('background '+name)
 dest=out/'stage'/(name+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);bg.convert('RGB').save(dest,quality=86);art['sprites'][key]={'src':url(dest)};return key
order=['perseverance','kinemorto','cornered','heatwave','avulsion','broken-reality','the-uprising','you-are','haunted','bonetravaganza','homie-cide','thermal-shock','overthrone','redscreen']
order+=sorted(p.name for p in (r/'songs').iterdir() if p.is_dir() and p.name not in order)
for slug in order:
 folder=r/'songs'/slug;paths=list((folder/'charts').glob('*.json'))
 if not paths:continue
 meta=read(folder/'meta.json');d=read(paths[0]);lines=d['strumLines'];events=d.get('events',[])+(read(folder/'events.json').get('events') or [] if (folder/'events.json').exists() else []);initial=[(l.get('characters') or ['gf'])[0] for l in lines];names=set(initial)|{e['params'][1] for e in events if e['name']=='Change Character'}
 for n in sorted(names):character(n)
 valid=[n if 'dustin:'+n in art['characters'] else None for n in initial];enemy=valid[0];player=next((valid[i] for i,l in enumerate(lines) if l.get('type')==1),None)
 if not enemy or not player:raise ValueError('Missing main character '+slug)
 audiofolder=folder/'song';inst=audiofolder/'Inst.ogg';duration=ns['duration'](inst);charts={};allevents={};allsections={};removed={}
 for path in paths:
  chart=read(path);linechars=valid[:];converted=[];notes={'nova':[],'echo':[]};dropped=0
  ev=sorted(chart.get('events',[])+(read(folder/'events.json').get('events') or [] if (folder/'events.json').exists() else []),key=lambda e:e['time'])
  for e in ev:
   if e['name']=='Change Character':
    i,n=e['params'][:2]
    if isinstance(i,int) and i<len(lines) and 'dustin:'+n in art['characters']:converted.append({'time':e['time']/1000,'name':'Dustin Character','v1':str(i),'v2':'dustin:'+n})
  for i,line in enumerate(chart['strumLines']):
   if line.get('type')==2:continue
   side='echo' if line.get('type')==1 else 'nova'
   for n in line['notes']:
    typ=n.get('type',0);typ=(chart.get('noteTypes',[])[typ-1] if isinstance(typ,int) and 0<typ<=len(chart.get('noteTypes',[])) else '')
    if typ in ['Madness_NOTE_assets','NOTE_karma','NOTE_hate']:dropped+=1;continue
    t=n['time']/1000
    if t<0 or t>=duration:continue
    notes[side].append({'time':t,'lane':int(n['id'])%4,'duration':min(max(0,n.get('sLen',0)/1000),duration-t),'type':0,'sourceNoteType':typ,'dustinLine':i,'noAnimation':typ in ['No Anim Note','No Animation']})
  for side in notes:
   seen={}
   for n in sorted(notes[side],key=lambda n:n['time']):
    key=(round(n['time'],4),n['lane']);old=seen.get(key)
    if old:old['duration']=max(old['duration'],n['duration'])
    else:seen[key]=n
   notes[side]=list(seen.values())
  diff=path.stem;charts[diff]=notes;allevents[diff]=converted;allsections[diff]=[{'start':0,'end':duration,'mode':'duet'}];removed[diff]=dropped
 sid='dustin-'+slug;bg=stage(d['stage']);used=['dustin:'+n for n in names if 'dustin:'+n in art['characters']];spectator=next((valid[i] for i,l in enumerate(lines) if l.get('type')==2 and valid[i]),None)
 art['scenes'][sid]={'opponent':'dustin:'+enemy,'player':'dustin:'+player,'spectator':'dustin:'+spectator if spectator else None,'characters':used,'spriteKeys':[bg],'dustinLines':['dustin:'+n if n else None for n in valid]};art['backgrounds'][sid]=[]
 # Skip unused cinematic actors when preloading.
 active={i for i,l in enumerate(lines) if l.get('type')!=2 and (i==0 or l.get('type')==1 or l.get('notes'))}
 if spectator:active.add(initial.index(spectator))
 needed={initial[i] for i in active}|{e['params'][1] for e in events if e['name']=='Change Character' and e['params'][0] in active}
 art['scenes'][sid]['characters']=['dustin:'+n for n in sorted(needed) if 'dustin:'+n in art['characters']]
 default='hard' if 'hard' in charts else next(iter(charts));song={'title':'Dustin · '+meta.get('displayName',slug),'pack':'dustin','sceneKey':sid,'stage':d['stage'],'bpm':meta['bpm'],'duration':duration,'beats':duration*meta['bpm']/60,'defaultDifficulty':default,'charts':charts,'events':allevents,'sections':allsections[default],'sectionsByDifficulty':allsections,'audioSrc':ns['copy'](inst,'dustin/audio/'+slug),'originalSpeed':d.get('scrollSpeed',1),'sky':['#141521','#272031'],'description':'경량 연주판 · 복잡한 기믹/화면 효과 제외 · 원본 음원·채보·캐릭터 교체','genre':'DUSTIN','dustinPlayerLine':next(i for i,l in enumerate(lines) if l.get('type')==1)}
 if (audiofolder/'Voices.ogg').exists():song['voiceSrc']=ns['copy'](audiofolder/'Voices.ogg','dustin/audio/'+slug)
 songs[sid]=song;report[slug]={'notes':{d:{s:len(n) for s,n in c.items()} for d,c in charts.items()},'removedHazards':removed,'characters':len(used),'duration':duration};print('SONG',slug,flush=True)
# Native promotional image serves as the mod selector icon.
im=Image.open(r/'dustin-header.webp');im=ImageOps.fit(im,(180,180));im.save(root/'assets/mod-icons/dustin.webp',quality=88)
(root/'dustin-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst DUSTIN_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],DUSTIN_ART[key]);\nObject.assign(EXTRA_ART.sprites,DUSTIN_ART.sprites);\n',encoding='utf8')
(root/'analysis/dustin-import-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
p=root/'mod-assets.json';files=read(p)+['dustin-mod.js','dustin-runtime.js','assets/mod-icons/dustin.webp']+[url(p) for p in out.rglob('*') if p.is_file() and p.suffix!='.json'];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf8')
