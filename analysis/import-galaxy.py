from pathlib import Path
import json,re,math,random,hashlib,copy as cp,xml.etree.ElementTree as ET
from PIL import Image,ImageOps
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)};exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
r=Path('C:/Users/kht80/Desktop/fnf/fnf galaxy/GalaxyMod/assets');art=ns['ART'];songs={}
report={'source':'https://github.com/Allen98637/GalaxyMod','limitations':['Native shader, moving-keyboard/modchart and story videos are not ported.','Random note pairs use a reproducible seed. End-release notes use the web sustain rules.'],'songs':{}}
for name,d in ns['read'](root/'analysis/galaxy-characters.json').items():
 base=next(p for p in [r/'weeks/images'/d['image'],r/'shared/images'/d['image']] if p.with_suffix('.png').exists())
 a=ns['atlas'](base,'galaxy/characters/'+name,d,height=500)
 a['renderScale']=(220 if name.startswith('bf') else 200 if name.startswith('gf') else 300)/a['animations']['idle'][0]['h'];art['characters']['galaxy:'+name]=a
 if name=='kastimagina':
  f=a['animations']['idle'][0];im=Image.open(root/f['src']).crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im.thumbnail((180,180));im.save(root/'assets/mod-icons/galaxy.webp',quality=90)
def backdrop(name,layers):
 im=Image.new('RGBA',(2560,1400),(0,0,0,255))
 for layer in layers:
  p=r/'weeks/images'/layer;pic=Image.open(p.with_suffix('.png')).convert('RGBA')
  if p.with_suffix('.xml').exists():
   f=ET.parse(p.with_suffix('.xml')).getroot().find('SubTexture');x,y,w,h=[int(f.get(k)) for k in ['x','y','width','height']];piece=pic.crop((x,y,x+w,y+h));pic=Image.new('RGBA',(2560,1400));pic.alpha_composite(piece,(-int(f.get('frameX',0)),-int(f.get('frameY',0))))
  im.alpha_composite(pic)
 im=ImageOps.fit(im,(1120,530),method=Image.Resampling.LANCZOS);dest=root/'assets/extra-mods/galaxy/stage'/f'{name}.webp';dest.parent.mkdir(parents=True,exist_ok=True);im.convert('RGB').save(dest,quality=92);key='galaxy/stage/'+name;art['sprites'][key]={'src':ns['web'](dest)};return key
backdrop('ship',['ship/space','ship/star1','ship/earth','ship/wall','ship/front'])
backdrop('familanna',['ship/space','ship/star1','ship/planets','ship/wall','ship/front'])
for name,suffix in [('cona','0'),('cyber','')]:backdrop(name,['cor/'+k+suffix for k in ['sky','city','rock','ground']])
backdrop('somewhere',['somewhere/bg'+str(i) for i in range(1,8)])
for slug in ['galaxy','game','kastimagina','cona','underworld','cyber','newton','destiny','peace','familanna']:
 charts={};sections={};bpms={};sources={};events={};counts={};folder=r/'songs'/slug
 length=max(ns['duration'](folder/f) for f in ['Inst.ogg','Voices.ogg'])
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  path=r/'data'/slug/(slug+suffix+'.json')
  if not path.exists():continue
  original=ns['read'](path)['song'];base=original;s=cp.deepcopy(original);rng=random.Random(int.from_bytes(hashlib.sha256((slug+diff).encode()).digest()[:8],'big'));randoms=[];ri=0;special=0
  for section in s['notes']:
   for note in section['sectionNotes']:
    code=math.floor(note[1]);kind=code//10;lane=code%4;flip=3<code<10 or code>=10 and code%10>3
    if kind==1:lane=rng.randrange(4);randoms.append(lane)
    elif kind==2:
     if ri>=len(randoms):raise ValueError('Unpaired random note '+slug)
     lane=randoms[ri];ri+=1
    elif kind==3:lane=rng.randrange(4)
    elif kind==4:lane=(code-40)%4
    if code>=10 or note[1]!=code:special+=1
    note[1]=lane+(4 if flip else 0)
  c,_,sec=ns['chart'](s)
  for side in c:c[side]=[{**n,'duration':min(n['duration'],max(0,length-n['time']))} for n in c[side] if n['time']<length]
  charts[diff]=c;sections[diff]=sec;bpms[diff]=s['bpm'];sources[diff]=path.relative_to(r).as_posix();events[diff]=[];counts[diff]={'notes':{side:len(n) for side,n in c.items()},'special':special}
  if slug=='underworld':
   for beat,on in [(96,True),(160,False),(256,True),(384,False)]:
    for side,char in [('1','kalisax' if on else 'kalisa'),('0','bf-pur' if on else 'bf')]:events[diff].append({'time':beat*60/s['bpm'],'name':'Change Character','v1':side,'v2':char})
 stage='ship' if slug in ['galaxy','game','kastimagina'] else 'familanna' if slug=='familanna' else 'cyber' if slug=='cyber' else 'cona' if slug in ['cona','underworld'] else 'somewhere';gf='gf-twin' if stage in ['cona','cyber'] else 'gf-space' if stage=='somewhere' else 'gf';sid='galaxy-'+slug;chars=['galaxy:'+base['player2'],'galaxy:'+base['player1'],'galaxy:'+gf]
 if slug=='underworld':chars+=['galaxy:kalisax','galaxy:bf-pur']
 art['scenes'][sid]={'opponent':chars[0],'player':chars[1],'spectator':'galaxy:'+gf,'characters':chars,'spriteKeys':['galaxy/stage/'+stage]};art['backgrounds'][sid]=[]
 default='hard' if 'hard' in charts else next(iter(charts))
 songs[sid]={'title':'Galaxy · '+base['song'],'pack':'galaxy','sceneKey':sid,'stage':stage,'bpm':base['bpm'],'bpmByDifficulty':bpms,'duration':length,'beats':length*base['bpm']/60,'defaultDifficulty':default,'genre':'IN THE GALAXY','description':'원본 음원·채보·캐릭터 · 무대 웹 재구성 · 이동 채보·영상 연출 간소화','charts':charts,'sectionsByDifficulty':sections,'sections':sections[default],'events':events,'sourceCharts':sources,'originalSpeed':base['speed'],'audioSrc':ns['copy'](folder/'Inst.ogg','galaxy/audio/'+slug),'voiceSrc':ns['copy'](folder/'Voices.ogg','galaxy/audio/'+slug),'sky':['#101426','#342951']}
 report['songs'][slug]=counts;print('SONG',slug,counts,flush=True)
(root/'galaxy-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst GALAXY_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],GALAXY_ART[key]);\nObject.assign(EXTRA_ART.sprites,GALAXY_ART.sprites);\n',encoding='utf8')
(root/'analysis/galaxy-import-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
p=root/'mod-assets.json';p.write_text(json.dumps(list(dict.fromkeys(ns['read'](p)+['galaxy-mod.js','assets/mod-icons/galaxy.webp']+[ns['web'](f) for f in (root/'assets/extra-mods/galaxy').rglob('*') if f.is_file()])),indent=2),encoding='utf8')
