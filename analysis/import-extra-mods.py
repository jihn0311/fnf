from pathlib import Path
import json,re,shutil,struct,hashlib,sys,xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
DESKTOP=Path('C:/Users/kht80/Desktop')
OUT=ROOT/'assets/extra-mods';OUT.mkdir(parents=True,exist_ok=True)
ART={'characters':{},'backgrounds':{},'videos':{},'scenes':{},'sprites':{},'sounds':{}}
if '--charts-only' in sys.argv:
 text=(ROOT/'extra-mods.js').read_text(encoding='utf-8-sig');ART=json.loads(text.split('const EXTRA_ART=',1)[1].split(';\nfor(const key',1)[0])
SONGS={};REPORT={'songs':{},'limitations':['Virus R: compiled engine effects are unavailable; stages are an asset-based web adaptation.','Deathmatch: old Psych note types 1=Alt Animation and 3=Hurt Note follow upstream compatibility mapping; compiled custom effects may differ.','Tainted Fate: Lua timing ported to Canvas; shader and camera rendering are web approximations.']}
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def web(p):return p.relative_to(ROOT).as_posix()
def copy(p,folder):
 d=OUT/folder/p.name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d);return web(d)
def duration(p):
 b=p.read_bytes();i=b.index(b'\x01vorbis');sr=struct.unpack_from('<I',b,i+12)[0];pos=0;last=0
 while pos<len(b):
  if b[pos:pos+4]!=b'OggS':break
  g=struct.unpack_from('<Q',b,pos+6)[0]
  if g<2**63:last=max(last,g)
  n=b[pos+26];pos+=27+n+sum(b[pos+27:pos+27+n])
 return last/sr
def atlas(base,key,definition=None,height=250,bg=False):
 if key in ART['sprites']:return ART['sprites'][key]
 image=Image.open(base.with_suffix('.png')).convert('RGBA');xp=base.with_suffix('.xml')
 if not xp.exists():
  image.thumbnail((1400,800));dest=OUT/(key+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);image.save(dest,quality=87);result={'src':web(dest),'width':image.width,'height':image.height};ART['sprites'][key]=result;return result
 frames=[x.attrib for x in ET.parse(xp).getroot() if x.tag=='SubTexture'];groups={}
 for f in frames:groups.setdefault(re.sub(r'\d+$','',f['name']).strip(),[]).append(f)
 animations={};config={}
 if definition:
  for a in definition['animations']:
   matches=[f for f in frames if f['name'].startswith(a['name'])]
   if a.get('indices'):matches=[matches[i] for i in a['indices'] if i<len(matches)]
   if matches:animations[a['anim']]=matches;config[a['anim']]={'fps':a.get('fps',24),'loop':a.get('loop',False),'offsets':a.get('offsets',[0,0])}
 else:
  animations.update(groups)
  for k in ['idle','left','down','up','right']:
   opts=[g for g in groups if k in g.lower() and 'miss' not in g.lower()]
   if k=='idle' and not opts:opts=[g for g in groups if 'danc' in g.lower()]
   if opts:animations[k]=groups[min(opts,key=len)]
 if not animations:animations={'idle':frames}
 if 'idle' not in animations:animations['idle']=next(iter(animations.values()))
 f=animations['idle'][0];scale=min(1,height/max(1,int(f.get('frameHeight',f['height']))))
 if bg:scale=min(scale,1000/max(1,int(f.get('frameWidth',f['width']))))
 packed={};result={'src':'','animations':{},'config':config,'scale':scale,'flip':definition.get('flip_x',False) if definition else False,'pages':[]}
 page=Image.new('RGBA',(2048,4096));x=y=row=pageidx=0
 def savepage():
  dest=OUT/(key+'-'+str(pageidx)+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);page.crop((0,0,2048,max(1,y+row))).save(dest,quality=84,method=3);result['pages'].append(web(dest));return web(dest)
 for anim,fs in animations.items():
  result['animations'][anim]=[]
  for f in fs:
   token=f['name']
   if token not in packed:
    a,b,w,h=[int(f[k]) for k in ['x','y','width','height']];im=image.crop((a,b,a+w,b+h))
    if f.get('rotated','false').lower()=='true':im=im.transpose(Image.Transpose.ROTATE_90)
    w,h=im.size
    im=im.resize((max(1,round(w*scale)),max(1,round(h*scale))),Image.Resampling.LANCZOS)
    if x+im.width>2048:x=0;y+=row+2;row=0
    if y+max(row,im.height)>4096:
     savepage();pageidx+=1;page=Image.new('RGBA',(2048,4096));x=y=row=0
    dest=web(OUT/(key+'-'+str(pageidx)+'.webp'))
    packed[token]={'src':dest,'x':x,'y':y,'w':im.width,'h':im.height,'ox':round(-int(f.get('frameX',0))*scale),'oy':round(-int(f.get('frameY',0))*scale),'fw':round(int(f.get('frameWidth',w))*scale),'fh':round(int(f.get('frameHeight',h))*scale)}
    page.paste(im,(x,y));x+=im.width+2;row=max(row,im.height)
   result['animations'][anim].append(packed[token])
 savepage();result['src']=result['pages'][0];ART['sprites'][key]=result;print('ART',key,flush=True);return result
def char(pack,r,name):
 key=pack+':'+name
 if key in ART['characters']:return key
 if pack=='virus':
  names={'bf':'BOYFRIEND','r':'R_Sprites','r3':'r3o','r-window':'Rweek2','acesora':'ask','gf':'GF_assets','gf-tv-r':'GF_assets_TV','gf-tv-ace':'GF_assets_TV'}
  base=r/'shared/images/characters'/names[name];data=None
  if name.startswith('gf-tv-'):data={'animations':[{'anim':'idle','name':'GF Dancing Beat_'+('r' if name=='gf-tv-r' else 'ace'),'fps':24,'loop':True}]}
 else:
  data=read(r/'characters'/(name+'.json'));base=r/('images' if pack=='tainted' else 'shared/images')/data['image']
 sheet=atlas(base,pack+'/characters/'+name,data,height=1000 if pack=='virus' and name=='r-window' else 250);icon=None
 if pack=='virus' and name=='r-window':sheet['renderScale']=.25
 iconname=data.get('healthicon',name) if data else name
 for p in [r/'images/icons'/('icon-'+iconname+'.png'),r/'images/icons'/(iconname+'.png')]:
  if p.exists():
   im=Image.open(p);im=im.crop((0,0,min(im.height,im.width),im.height));im.thumbnail((100,100));dest=OUT/pack/'icons'/(name+'.webp');dest.parent.mkdir(parents=True,exist_ok=True);im.save(dest);icon=web(dest);break
 sheet['icon']=icon or '';ART['characters'][key]=sheet;return key
def chart(s):
 sides={'echo':[],'nova':[]};events=[];sections=[];t=0;bpm=s['bpm']
 for sec in s.get('notes',[]):
  if sec.get('changeBPM') and sec.get('bpm',0)>0:bpm=sec['bpm']
  end=t+sec.get('lengthInSteps',16)*60/bpm/4;parts=set()
  for n in sec.get('sectionNotes',[]):
   if n[1]<0:
    if len(n)>=5:events.append({'time':n[0]/1000,'name':str(n[2]),'v1':str(n[3]),'v2':str(n[4])})
    continue
   side='echo' if bool(sec.get('mustHitSection'))^(int(n[1])>=4) else 'nova';parts.add(side)
   typ=n[3] if len(n)>3 else '';sides[side].append({'time':round(n[0]/1000,6),'lane':int(n[1])%4,'duration':round(max(0,n[2])/1000,6),'sourceNoteType':typ,'alt':bool(sec.get('altAnim')) or typ=='Alt Animation','noAnimation':typ=='No Animation'})
  sections.append({'start':t,'end':end,'mode':'duet' if len(parts)>1 else next(iter(parts),'intro')});t=end
 for side,ns in sides.items():
  merged={}
  for n in ns:
   key=(n['time'],n['lane'])
   if key in merged:merged[key]['duration']=max(merged[key]['duration'],n['duration'])
   else:merged[key]=n
  ns[:]=sorted(merged.values(),key=lambda n:n['time']);last={}
  for n in reversed(ns):
   if n['lane'] in last:n['duration']=min(n['duration'],max(0,last[n['lane']]-n['time']-.02))
   last[n['lane']]=n['time']
 for row in s.get('events',[]):
  for e in row[1]:events.append({'time':row[0]/1000,'name':e[0],'v1':str(e[1]),'v2':str(e[2])})
 return sides,events,sections
def add(pack,r,slug,files,audiofolder,label):
 base=read(files.get('normal',next(iter(files.values()))))['song'];sid=pack+'-'+slug
 charts={};events={};source={};sections=[];bydiff={}
 for diff,p in files.items():
  s=read(p)['song'];charts[diff],events[diff],sections=chart(s);source[diff]=p.relative_to(r).as_posix();bydiff[diff]=sections
  if pack=='death':
   for ns in charts[diff].values():
    for n in ns:
     n['hurt']=n['sourceNoteType']==3
     n['alt']=n['alt'] or n['sourceNoteType']==1
  if pack=='tainted' and (p.parent/'events.json').exists():
   for row in read(p.parent/'events.json')['song'].get('events',[]):
    events[diff].extend({'time':row[0]/1000,'name':e[0],'v1':str(e[1]),'v2':str(e[2])} for e in row[1])
  if pack=='death' and slug=='the-deathmatch-evil':
   external=chart(read(p.parent/'events.json')['song'])[1]
   events[diff]+= [e for e in external if not any(abs(a['time']-e['time'])<.02 and a['name']==e['name'] and a['v1']==e['v1'] for a in events[diff])]
  dedup={json.dumps(e,sort_keys=True):e for e in events[diff]};events[diff]=sorted(dedup.values(),key=lambda e:e['time'])
 snd=audiofolder/'Inst.ogg';dur=duration(snd)
 track={'title':label,'bpm':base['bpm'],'duration':dur,'beats':dur*base['bpm']/60,'genre':{'virus':'VIRUS R','death':'DEATHMATCH','tainted':'TAINTED FATE'}[pack],'description':label+' · 원본 채보 · 캐릭터와 무대 효과 웹 재현','pack':pack,'sceneKey':sid,'stage':base.get('stage',slug),'audioSrc':copy(snd,pack+'/'+slug),'charts':charts,'events':events,'sections':sections,'sectionsByDifficulty':bydiff,'sourceCharts':source,'bpmByDifficulty':{d:read(p)['song']['bpm'] for d,p in files.items()},'sky':['#110e24','#292138']}
 if (audiofolder/'Voices.ogg').exists():track['voiceSrc']=copy(audiofolder/'Voices.ogg',pack+'/'+slug)
 splitvoices=[audiofolder/name for name in ['Voices-Opponent.ogg','Voices-Player.ogg'] if (audiofolder/name).exists()]
 if splitvoices:track['voiceSources']=[copy(p,pack+'/'+slug) for p in splitvoices]
 chars={base['player1'],base['player2']};spectator=base.get('gfVersion') or base.get('player3')
 if spectator and pack!='tainted':chars.add(spectator)
 for es in events.values():
  for e in es:
   if e['name']=='Change Character':
    if (r/'characters'/(e['v1']+'.json')).exists() and not (r/'characters'/(e['v2']+'.json')).exists():e['v1'],e['v2']=e['v2'],e['v1']
    chars.add(e['v2'])
 if pack=='tainted' and slug=='destruction':chars.update(['bf_des3','bf_des_kill','bf_des_p_death'])
 keys=[char(pack,r,c) for c in sorted(chars)]
 ART['scenes'][sid]={'opponent':pack+':'+base['player2'],'player':pack+':'+base['player1'],'characters':keys,'spectator':pack+':'+spectator if spectator and pack!='tainted' else None};ART['backgrounds'][sid]=[]
 SONGS[sid]=track;REPORT['songs'][sid]={'duration':dur,'notes':{d:{side:len(ns) for side,ns in c.items()} for d,c in charts.items()},'events':{d:len(e) for d,e in events.items()}}
for pack,folder in [('virus','fnf virus r c'),('death','fnf deathmatch c'),('tainted','fnf Impostor Tainted Fate')]:
 r=DESKTOP/folder/('mods' if pack=='tainted' else 'assets')
 if pack=='virus':
  for d in sorted((r/'data').iterdir()):
   if not d.is_dir() or not (r/'songs'/d.name/'Inst.ogg').exists():continue
   fs={diff:p for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')] if (p:=d/(d.name+suffix+'.json')).exists()}
   add(pack,r,d.name,fs,r/'songs'/d.name,'Virus R · '+d.name.title()+(' [Bonus]' if d.name=='test' else ''))
  for p in (r/'r/images/stage').rglob('*.png'):atlas(p,'virus/stage/'+p.relative_to(r/'r/images/stage').with_suffix('').as_posix(),height=530,bg=True)
 elif pack=='death':
  for slug in ['the-deathmatch','tutorial']:
   for variant in ['','-evil']:
    p=r/'data'/slug/(slug+variant+'.json');s=read(p)['song'];audiofolder=r/'songs'/s['song'].lower()
    add(pack,r,slug+variant,{'normal':p},audiofolder,'Deathmatch · '+('Tutorial [Bonus]' if slug=='tutorial' else 'Deathmatch')+(' Evil' if variant else ''))
  atlas(r/'shared/images/HURTNOTE_assets','death/stage/hurt-notes',height=150)
  for p in (r/'shared/images/deathmatch').glob('*.png'):
   if not p.name.startswith('past_'):atlas(p,'death/stage/'+p.stem,height=530,bg=True)
 else:
  for slug in ['crush','defeat','destruction']:add(pack,r,slug,{'normal':r/'data'/slug/(slug+'-tainted.json')},r/'data'/slug,'Tainted Fate · '+slug.title())
  for p in (r/'images/BG').rglob('*.png'):
   if 'old' not in p.parts:atlas(p,'tainted/BG/'+p.relative_to(r/'images/BG').with_suffix('').as_posix(),height=530,bg=True)
  for p in (r/'sounds').glob('*.ogg'):
   if p.stem in ['nou','game_over']:ART['sounds'][p.stem]=copy(p,'tainted/sounds')
  ART['videos']['tainted-destruction']=[copy(r/'videos/dumb.mp4','tainted/videos')]
# Scene-specific loading prevents retaining assets from unrelated packs.
for sid,scene in ART['scenes'].items():
 pack=SONGS[sid]['pack'];slug=sid.removeprefix(pack+'-')
 if pack=='virus':
  stage='window' if slug=='virus-r' else 'cyber2' if slug in ['warning','the-battle-of-robbery'] else 'cyber'
  scene['spriteKeys']=[k for k in ART['sprites'] if k.startswith('virus/stage/'+stage+'/')]
 elif pack=='death':scene['spriteKeys']=[k for k in ART['sprites'] if k.startswith('death/stage/')]
 else:scene['spriteKeys']=[k for k in ART['sprites'] if k.startswith('tainted/BG/') and ('/crush/' in k if slug=='crush' else '/crush/' not in k)]
(ROOT/'extra-mods.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(SONGS,ensure_ascii=False,separators=(',',':'))+');\nconst EXTRA_ART='+json.dumps(ART,ensure_ascii=False,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],EXTRA_ART[key]);\n',encoding='utf-8')
manifest=read(ROOT/'mod-assets.json');manifest+=['extra-mods.js','extra-runtime.js']+[web(p) for p in OUT.rglob('*') if p.is_file()];(ROOT/'mod-assets.json').write_text(json.dumps(list(dict.fromkeys(manifest)),indent=2),encoding='utf-8')
(ROOT/'analysis/extra-import-report.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),encoding='utf-8')
print('IMPORTED',len(SONGS),'songs',flush=True)
