from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from PIL import Image,ImageOps
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
code=helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0]
exec(code,ns)
ns["int"]=lambda value:int(float(value))
r=Path('C:/Users/kht80/Desktop/fnf/fnf corruption+');art=ns['ART'];songs={};report={}
out=root/'assets/extra-mods/corruption';out.mkdir(parents=True,exist_ok=True)
def asset(module,kind,name,ext):
 for b in [r/'content'/module,r/'content/global',r/'assets']:
  p=b/kind/(name+ext)
  if p.exists():return p
 raise FileNotFoundError((module,kind,name,ext))
def char(module,name):
 key='corruption:'+name
 if key in art['characters']:return key
 d=ns['read'](asset(module,'characters',name,'.json'))
 d['animations']=[a for a in d['animations'] if a['anim'] and 'miss' not in a['anim'].lower()]
 if name in ['momFront','momFrontSecond','gfRage']:
  base=asset(module,'images',d['image'],'.xml');frames=[x.attrib for x in ET.parse(base).getroot()]
  for anim in d['animations']:
   matched=[f for f in frames if f['name'].startswith(anim['name'])];count=len(matched)
   if count>24 and not anim.get('indices'):
    anim['indices']=[round(i*(count-1)/23) for i in range(24)];anim['fps']=anim.get('fps',24)*24/count
 a=ns['atlas'](asset(module,'images',d['image'],'.png').with_suffix(''),'corruption/characters/'+name,d,height=220 if name.startswith('momFront') else 280)
 # Source flip_x is expressed for the opponent slot; the player slot reverses it.
 a['pixel']=d.get('no_antialiasing',False);a['nativeScale']=d.get('scale',1)
 idle=a['animations']['idle'][0];a['renderScale']=min(300/max(1,idle['h']),440/max(1,idle['w']))
 art['characters'][key]=a
 return key
def picture(module,name):
 p=asset(module,'images',name,'.png');im=Image.open(p).convert('RGBA')
 if p.with_suffix('.xml').exists():
  f=list(ET.parse(p.with_suffix('.xml')).getroot())[0].attrib;x,y,w,h=[int(f[k]) for k in ['x','y','width','height']];im=im.crop((x,y,x+w,y+h))
 return im
def stage(key,module,layers):
 im=Image.new('RGBA',(1120,530),'#090811')
 for name,x,y,w,h in layers:
  src=picture(module,name);src=src.resize((w,h),Image.Resampling.NEAREST if module=='null' and key not in ['street','street-alt','forest'] else Image.Resampling.LANCZOS);im.alpha_composite(src,(x,y))
 p=out/'stage'/(key+'.webp');p.parent.mkdir(parents=True,exist_ok=True);im.convert('RGB').save(p,quality=91)
 art['sprites']['corruption/stage/'+key]={'src':ns['web'](p)}
stage('school','null',[('animatedEvilSchool',0,0,1120,530)])
stage('tunnel','null',[('NumberTunnel',0,0,1120,530)])
stage('access','null',[('nullSky',0,0,1120,530),('platform',70,380,980,150)])
stage('building','null',[('nullSky',0,0,1120,530),('nullBuilding',0,0,1120,530)])
stage('replay','null',[('weeb/weebSky',0,0,1120,530),('weeb/weebSchool',0,0,1120,530),('weeb/weebStreet',0,0,1120,530)])
stage('glitch','null',[('glitchSky',0,0,1120,530),('glitchBg',0,0,1120,530),('glitchFloor',0,340,1120,190)])
for key,suffix in [('street',''),('street-alt','-alt')]:
 stage(key,'null',[('bloodlust_sky',0,0,1120,530),('bloodlust_building',800,20,320,440),('bloodlust_wall'+suffix,0,0,1120,430),('bloodlust_floor'+suffix,0,360,1120,170)])
stage('forest','null',[('forestSky',0,0,1120,530),('forestTree3',0,0,1120,460),('forestTree2',0,0,1120,480),('forestFloor',0,380,1120,150)])
stage('pretence','if',[('layer1',0,0,1120,530),('layer2',0,0,1120,530),('layer3',0,0,1120,530),('layer3bg',0,0,1120,530),('layer4',0,0,1120,530)])
stage('pretence-forest','if',[('forestlayer0',0,0,1120,530),('forestlayer1',0,0,1120,530),('forestlayer2',0,0,1120,530)])
for slug,module,initial in [('opening','null','school'),('null-and-void','null','school'),('chkdsk','null','school'),('access-denied','null','access'),('bloodlust','null','street'),('pretence','if','pretence')]:
 folder=r/'content'/module/'songs'/slug;base=ns['read'](folder/(slug+'.json'))['song'];duration=ns['duration'](folder/'Inst.ogg');charts={};events={};secs={};chars={base['player1'],base['player2']};phases={initial};source={}
 for diff,suffix in [('normal',''),('easy','-safe')]:
  file=folder/(slug+suffix+'.json')
  if not file.exists():continue
  d=ns['read'](file)['song'];c,ev,sec=ns['chart'](d);outEvents=[];swap=0
  def event(time,name,a,b=''):outEvents.append({'time':time,'name':name,'v1':a,'v2':b})
  def change(t,side,name):chars.add(name);event(t,'Change Character',side,name)
  def bg(t,name):phases.add(name);event(t,'Corruption Background',name)
  for e in ev:
   t,n,a,b=e['time'],e['name'],e['v1'],e['v2']
   if n=='Change Character':change(t,a,b)
   elif n=='changeBf':
    if slug=='null-and-void':
     change(t,'bf','bf-pixel' if a=='1' else 'bf-pixelFront');change(t,'dad','senpaiNull' if a=='1' else 'senpaiBackFirst' if b=='1' else 'senpaiBack')
    elif slug=='chkdsk':
     mapping={'fall':('bf-pixel-dive','spiritBack','tunnel'),'altfall':('bf-pixel-dive','spiritSad','tunnel'),'main':('bf-pixel','spiritBack','school'),'sigh':('bf-pixelFront','spiritSad','school'),'removeStatic':('bf-pixelFront','spiritSad','school')}
     if a in mapping:
      bf,dad,back=mapping[a];change(t,'bf',bf);change(t,'dad',dad);bg(t,back)
    elif slug=='bloodlust':
     if a in ['gfnorm','gfrage','gfend']:change(t,'bf',{'gfnorm':'gfNorm','gfrage':'gfRage','gfend':'gfDark'}[a])
     if a in ['front','front2']:change(t,'dad','momFront' if a=='front' else 'momFrontSecond')
     if a=='run':bg(t,'forest');change(t,'bf','gfRun');change(t,'dad','momSpider')
     if a=='trapped':bg(t,'street-alt')
   elif n=='scene' and slug=='access-denied':
    if a in ['building','replay','glitchappears','front']:bg(t,{'building':'building','replay':'replay','glitchappears':'glitch','front':'glitch'}[a])
    if a in ['replay','glitchappears','spiritgray','hidespirit']:change(t,'dad',{'replay':'senpai','glitchappears':'senpai-angry','spiritgray':'spiritBackGray','hidespirit':'nullAccess'}[a])
    if a=='front':change(t,'bf','glitchBf')
   elif n=='swapbg' and slug=='bloodlust':
    swap=(swap+1)%6;bg(t,['forest','street','forest','street-alt','forest','street'][swap])
   elif n=='stoprun' and slug=='bloodlust':
    if a=='1':change(t,'bf','gfRage')
    if a in ['3','sad']:bg(t,'street');change(t,'dad','momCorrupt')
    if a=='return':bg(t,'forest')
  if slug=='pretence':
   chars.add('ftBf');change(0,'dad','ftBf')
   # Source modchart fades between the two views on these step boundaries.
   script=(folder/'pretence.hscript').read_text();full=re.findall(r'queueEaseFunc\((\d+), (\d+),[^\n]+\n([^}]+)',script)
   for start,end,body in full:
    m=re.search(r'forest.alpha = FlxMath.lerp\([^,]+, ([0-9.]+),',body)
    if m:
     on=float(m[1])>=.5;tm=int(end)*60/base['bpm']/4;bg(tm,'pretence-forest' if on else 'pretence');change(tm,'dad','falseThorn' if on else 'ftBf')
  for side,notes in c.items():
   c[side]=[{**n,'duration':min(n['duration'],max(0,duration-n['time']))} for n in notes if 0<=n['time']<duration]
  charts[diff]=c;events[diff]=sorted(outEvents,key=lambda e:e['time']);secs[diff]=sec or [{'start':0,'end':duration,'mode':'duet'}];source[diff]=str(file.relative_to(r))
 keys=[char(module,n) for n in sorted(chars)];sid='corruption-'+slug
 art['scenes'][sid]={'opponent':'corruption:'+base['player2'],'player':'corruption:'+base['player1'],'spectator':None,'characters':keys,'spriteKeys':['corruption/stage/'+v for v in sorted(phases)]};art['backgrounds'][sid]=[]
 songs[sid]={'title':'Corruption+ · '+slug.replace('-',' ').title(),'pack':'corruption','sceneKey':sid,'stage':initial,'corruptionSlug':slug,'bpm':base['bpm'],'duration':duration,'beats':duration*base['bpm']/60,'defaultDifficulty':'normal','difficultyLabels':{'normal':'Original','easy':'Safe'},'genre':'CORRUPTION+','description':'원본 음원·채보·캐릭터 전환 · 무대 웹 재구성 · 화면 왜곡/입력 방해/대량 파티클 제외','charts':charts,'events':events,'sections':secs['normal'],'sectionsByDifficulty':secs,'sourceCharts':source,'originalSpeed':base['speed'],'audioSrc':ns['copy'](folder/'Inst.ogg','corruption/audio/'+slug),'sky':['#0c0914','#27142e']}
 if (folder/'Voices.ogg').exists():songs[sid]['voiceSrc']=ns['copy'](folder/'Voices.ogg','corruption/audio/'+slug)
 if slug=='opening':songs[sid]['corruptionVideo']=ns['copy'](r/'content/null/videos/opening.mp4','corruption/video')
 report[slug]={'duration':duration,'vocals':(folder/'Voices.ogg').exists(),'notes':{d:{s:len(n) for s,n in c.items()} for d,c in charts.items()},'characters':keys,'stages':sorted(phases)};print(slug,report[slug],flush=True)
a=art['characters']['corruption:falseThorn'];f=a['animations']['idle'][0];im=Image.open(root/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im.thumbnail((180,180));im.save(root/'assets/mod-icons/corruption.webp')
(root/'corruption-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst CORRUPTION_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],CORRUPTION_ART[key]);\nObject.assign(EXTRA_ART.sprites,CORRUPTION_ART.sprites);\n',encoding='utf8')
(root/'analysis/corruption-import-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
p=root/'mod-assets.json';p.write_text(json.dumps(list(dict.fromkeys(ns['read'](p)+['corruption-mod.js','corruption-runtime.js','assets/mod-icons/corruption.webp']+[ns['web'](f) for f in out.rglob('*') if f.is_file()])),indent=2),encoding='utf8')
