from pathlib import Path
import json,re,hashlib,xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
R=Path('C:/Users/kht80/Desktop/fnf/fnf mario madmess/Marios Madness/assets')
helper=ROOT/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
helper_code=helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0]
helper_code=helper_code.replace('ET.parse(xp)',"ET.ElementTree(ET.fromstring(xp.read_text(encoding='utf-8').lstrip('\\ufeff')))")
exec(helper_code,ns)
Image.MAX_IMAGE_PIXELS=None
art=ns['ART'];songs={};report={'unsupportedEvents':{},'missingCharacters':[],'stages':{},'limitations':['Native scripted cutscenes, minigames and phase-specific stage effects are not fully ported; backgrounds use source opening-stage composition.']}
source_path=Path('C:/Users/kht80/AppData/Local/Temp/mario-playstate.hx')
if not source_path.exists():
 import urllib.request
 source_path.write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/Dewott2501/Mario-Madness/main/source/PlayState.hx').read())
source=source_path.read_text(encoding='utf8');start=source.index('switch (curStage)');end=source.index('switch (curStage)',start+1)
blocks=dict(re.findall(r"^\t{3}case '([^']+)':(.*?)(?=^\t{3}case |\Z)",source[start:end],re.M|re.S))
cachepath=ROOT/'analysis/mario-import-cache.json';cache=json.loads(cachepath.read_text()) if cachepath.exists() else {}
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def img(name):
 name=name.removesuffix('.png')
 return next((R/d/(name+'.png') for d in ['images','shared/images'] if (R/d/(name+'.png')).exists()),None)
def character(name):
 key='mario:'+name
 if key in art['characters']:return key
 special={'web-lakitu':'Lakitu','web-gyromite':'Bird Up'}
 p=R/'characters'/(name+'.json')
 if name in special:d={'image':'mario/beatus/YouCannotBeatUS_Fellas_Assets','animations':[{'anim':'idle','name':special[name],'fps':24,'loop':True}],'scale':1,'healthicon':'mrSYS'}
 elif p.exists():d=read(p)
 else:report['missingCharacters'].append(name);return None
 if name in cache and all((ROOT/p).exists() for p in cache[name]['pages']):
  a=cache[name];a['renderScale']=min(360/max(1,a['animations']['idle'][0]['h']),.72*max(1,d.get('scale',1)));a['pixel']=d.get('no_antialiasing',False);art['characters'][key]=a;return key
 base=img(d['image'])
 if base is None:report['missingCharacters'].append(name+':'+d['image']);return None
 # Keep directional poses, idles and scripted animations; downscale once offline.
 a=ns['atlas'](base.with_suffix(''),'mario/characters/'+name,d,height=440)
 a['renderScale']=min(360/max(1,a['animations']['idle'][0]['h']),.72*max(1,d.get('scale',1)));a['pixel']=d.get('no_antialiasing',False);a['nativeScale']=d.get('scale',1);a['singDuration']=d.get('sing_duration',4)
 icon=img('icons/icon-'+d.get('healthicon',name)) or img('icons/'+d.get('healthicon',name))
 if icon:
  im=Image.open(icon).convert('RGBA');im=im.crop((0,0,min(im.width,im.height),im.height));im.thumbnail((96,96));out=ROOT/'assets/extra-mods/mario/icons'/ (name+'.webp');out.parent.mkdir(parents=True,exist_ok=True);im.save(out);a['icon']=ns['web'](out)
 art['characters'][key]=a;cache[name]=a;cachepath.write_text(json.dumps(cache));return key
# Restrict to the opening scene, excluding later acts and HUD overlays.
folders={'execlassic':'EXE1','exesequel':'EXE1/starman','landstage':'EXE2/normal','exeport':'MX','hatebg':'IHY','warioworld':'Wario','promoshow':'promo','racing':'Races','betamansion':'LuigiBeta','superbad':'BadMario','somari':'Somari','directstream':'Real','bootleg':'dad7','luigiout':'cityout','virtual':'virtual','nesbeat':'beatus','forest':'Coronation/firstpart','demiseport':'MX/demise/1','realbg':'lisfalse','secretbg':'secret','turmoilsweep':'Turmoil','castlestar':'star','meatworld':'TooLateBG/street','endstage':'costume','allfinal':'allfinal/act1','wetworld':'abandoned','piracy':'piracy'}
def backdrop(stage,slug):
 key='mario/stage/'+slug;out=ROOT/'assets/extra-mods'/ (key+'.webp');out.parent.mkdir(parents=True,exist_ok=True)
 block=blocks.get(stage,'');chosen=[];prefix='mario/'+folders.get(stage,'')+'/'
 # Read literal declarations only; never execute source code.
 matches=list(re.finditer(r'(\w+)(?::\w+)?\s*=\s*new (?:BGSprite|FlxSprite)\(([^;]*?)\);',block,re.S))
 for i,m in enumerate(matches):
  name,args=m.groups();tail=block[m.start():matches[i+1].start() if i+1<len(matches) else len(block)]
  found=re.search(r"'([^']+)'\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)",args)
  if found:asset,x,y=found.groups()
  else:
   found=re.search(r"Paths\.(?:image|getSparrowAtlas)\('([^']+)'",tail);coords=re.match(r'\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)',args)
   if not found or not coords:continue
   asset=found[1];x,y=coords.groups()
  if not asset.startswith(prefix) or any(v in asset.lower() for v in ['foreground','overlay','static','game_over','cutscene','warning','popup','spotlight','hud_','sideBar'.lower()]):continue
  if '/old/' in asset and not slug.endswith('-old'):continue
  if slug.endswith('-old') and stage in ['execlassic','landstage','exeport','hatebg','betamansion'] and '/old/' not in asset:continue
  if re.search(re.escape(name)+r'\.(?:alpha\s*=\s*0(?:\.0+1)?\s*;|visible\s*=\s*false)',tail):continue
  if re.search(re.escape(name)+r'\.cameras\s*=',tail):continue
  if not re.search(r'add\('+re.escape(name)+r'\)',block):continue
  p=img(asset)
  if p is None:continue
  im=Image.open(p).convert('RGBA');xp=p.with_suffix('.xml')
  if xp.exists():
   frames=list(ET.parse(xp).getroot());anim=re.search(r"\['([^']+)'\]",args) or re.search(r"addByPrefix\('[^']+',\s*'([^']+)'",tail)
   f=next((f for f in frames if not anim or f.get('name','').startswith(anim[1])),None)
   if f is None:continue
   a=f.attrib;xx,yy,w,h=[int(a[k]) for k in ['x','y','width','height']];im=im.crop((xx,yy,xx+w,yy+h));x=float(x)-int(a.get('frameX',0));y=float(y)-int(a.get('frameY',0))
  scale=re.search(re.escape(name)+r'\.setGraphicSize\(Std.int\('+re.escape(name)+r'\.width\s*\*\s*([\d.]+)',tail);factor=float(scale[1]) if scale else 1
  chosen.append((im,float(x),float(y),factor,asset))
 if not chosen:
  candidates=[p for p in (R/'shared/images'/prefix).glob('*.png') if not p.with_suffix('.xml').exists()]
  if candidates:chosen=[(Image.open(candidates[0]).convert('RGBA'),0,0,1,candidates[0].name)]
 stagefile=R/'stages'/(stage+'.json');conf=read(stagefile) if stagefile.exists() else {};zoom=min(.8,max(.25,conf.get('defaultZoom',.6)))*.875
 op=conf.get('opponent',[100,100,400,350]);bf=conf.get('boyfriend',[1000,100,1000,400]);cx=(op[2]+bf[2])/2 if len(op)>2 and len(bf)>2 else 650;cy=(op[3]+bf[3])/2 if len(op)>3 and len(bf)>3 else 350
 canvas=Image.new('RGBA',(1120,530),(15,13,20,255))
 for im,x,y,factor,asset in chosen:
  im=im.resize((max(1,round(im.width*factor*zoom)),max(1,round(im.height*factor*zoom))),Image.Resampling.LANCZOS)
  canvas.alpha_composite(im,(round(560+(x-cx)*zoom),round(265+(y-cy)*zoom)))
 if stage=='piracy':
  panel=Image.new('RGBA',(484,363),(12,10,17,255))
  for asset,x in [('HallyBG2',0),('HallyBG4',240),('HallyBG3',240),('HallyBG1',0)]:
   im=Image.open(img('mario/piracy/'+asset)).convert('RGBA');im=im.resize((round(im.width*1.3),round(im.height*1.3)),Image.Resampling.NEAREST);panel.alpha_composite(im,(x,0))
  canvas=panel.resize((1120,530),Image.Resampling.NEAREST)
 if stage=='nesbeat':canvas=Image.open(img('bars')).convert('RGBA').resize((1120,530),Image.Resampling.NEAREST)
 canvas.convert('RGB').save(out,quality=90);art['sprites'][key]={'src':ns['web'](out)};report['stages'][slug]=[x[4] for x in chosen];return key
exec((ROOT/'analysis/mario-character-events.py').read_text(encoding='utf8'))
supported={'Mario Visibility','Mario Guest','Change Character','Play Animation','Alt Idle Animation','Add Camera Zoom','Camera Follow Pos','Screen Shake','Flash Camera','Change Scroll Speed'}
for folder in sorted((R/'data/songData').iterdir()):
 if not folder.is_dir():continue
 p=folder/(folder.name+'.json');audio=R/'songs'/folder.name
 if not p.exists() or not (audio/'Inst.ogg').exists():continue
 try:s=read(p)['song']
 except:continue
 if not s.get('notes'):continue
 s['bpm']=float(s['bpm'])
 for sec in s['notes']:
  sec['bpm']=float(sec.get('bpm') or 0)
  for n in sec.get('sectionNotes',[]):
   for i in range(2 if float(n[1])<0 else 3):
    try:n[i]=float(n[i] or 0)
    except (ValueError,TypeError):n[i]=0
 chart,events,sections=ns['chart'](s)
 eventfile=folder/'events.json'
 if eventfile.exists():
  e=read(eventfile).get('song',{});_,extra,_=ns['chart']({**e,'bpm':s['bpm']});events+=extra
 events+=compile_mario_events(s,events)
 chars={s['player1'],s['player2']};gf=s.get('player3') or s.get('gfVersion');gf=gf if gf not in ['gf','none',''] else None
 if gf:chars.add(gf)
 kept=[]
 for e in events:
  if e['name'] in ['Change Character','Mario Guest']:chars.add(e['v2'])
  if e['name'] in supported and e['name']!='Change Scroll Speed':kept.append(e)
  else:report['unsupportedEvents'][e['name']]=report['unsupportedEvents'].get(e['name'],0)+1
 keys=[k for c in sorted(chars) if (k:=character(c))]
 if 'mario:'+s['player1'] not in keys or 'mario:'+s['player2'] not in keys:raise ValueError('Missing principal character '+folder.name)
 sid='mario-'+folder.name;stage=s.get('stage','stage');bg=backdrop(stage,folder.name)
 art['scenes'][sid]={'opponent':'mario:'+s['player2'],'player':'mario:'+s['player1'],'spectator':'mario:'+gf if gf and 'mario:'+gf in keys else None,'characters':keys,'spriteKeys':[bg]};art['backgrounds'][sid]=[]
 duration=max(ns['duration'](f) for f in [audio/'Inst.ogg',audio/'Voices.ogg'] if f.exists())
 for notes in chart.values():
  for n in notes:n['hurt']=n['sourceNoteType'] in ['Hurt Note','Nota veneno','Nota bomba','Bad Poison','jumpscareM']
 song={'title':s['song'],'pack':'mario','sceneKey':sid,'stage':stage,'bpm':s['bpm'],'duration':duration,'beats':duration*s['bpm']/60,'defaultDifficulty':'hard','genre':"MARIO’S MADNESS",'description':'원본 음원·채보·캐릭터 · 웹 무대 (전용 컷신·미니게임 미지원)','charts':{'hard':chart},'sections':sections,'sectionsByDifficulty':{'hard':sections},'events':{'hard':sorted(kept,key=lambda e:e['time'])},'audioSrc':ns['copy'](audio/'Inst.ogg','mario/audio/'+folder.name),'sky':['#200e17','#17121e'],'sourceChart':p.relative_to(R).as_posix(),'sourceSpeed':s.get('speed',1),'nativeArrowSkin':s.get('arrowSkin'),'pixelStage':read(R/'stages'/(stage+'.json')).get('isPixelStage',False) if (R/'stages'/(stage+'.json')).exists() else False}
 if (audio/'Voices.ogg').exists():song['voiceSrc']=ns['copy'](audio/'Voices.ogg','mario/audio/'+folder.name)
 songs[sid]=song;print('SONG',sid,flush=True)
# Note skins are attached by the companion script before final serialization.
exec((ROOT/'analysis/mario-note-skins.py').read_text(encoding='utf8'))
(ROOT/'mario-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst MARIO_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],MARIO_ART[key]);\nObject.assign(EXTRA_ART.sprites,MARIO_ART.sprites);\n',encoding='utf8')
p=ROOT/'mod-assets.json';files=read(p)+['mario-mod.js']+[ns['web'](f) for f in (ROOT/'assets/extra-mods/mario').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2)+'\n',encoding='utf8')
report['songs']=len(songs);(ROOT/'analysis/mario-import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('IMPORTED',len(songs),flush=True)

# Rebuild the multi-act All-Stars backgrounds after a full import.
exec(compile((ROOT/'analysis/build-allstars-stages.py').read_text(encoding='utf8'),str(ROOT/'analysis/build-allstars-stages.py'),'exec'),{'__file__':str(ROOT/'analysis/build-allstars-stages.py')})
