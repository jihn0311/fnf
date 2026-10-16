# Executed by import-mario.py with the same source and output context.
skincache={}
def skin(name,pixel=False,mono=False):
 token=(name,pixel,mono)
 if token in skincache:return skincache[token]
 p=img(('pixelUI/' if pixel else '')+name)
 if not p:return None
 im=Image.open(p).convert('RGBA')
 if mono:
  from PIL import ImageOps
  alpha=im.getchannel('A');im=ImageOps.grayscale(im).convert('RGBA');im.putalpha(alpha)
 frames=[]
 def rect(x,y,w,h):return {'x':x,'y':y,'width':w,'height':h,'frameX':0,'frameY':0,'frameWidth':0,'frameHeight':0}
 if pixel:
  w,h=im.width//4,im.height//5;ep=img('pixelUI/'+name+'ENDS');ends=Image.open(ep).convert('RGBA') if ep else None
  sheet=Image.new('RGBA',(max(im.width,ends.width if ends else 0),im.height+(ends.height if ends else 0)));sheet.paste(im,(0,0))
  if ends:sheet.paste(ends,(0,im.height))
  for lane in range(4):
   body=rect(lane*(ends.width//4),im.height,ends.width//4,ends.height//2) if ends else rect(lane*w,h,w,h)
   tail={**body,'y':body['y']+body['height']} if ends else body
   frames.append({'idle':rect(lane*w,0,w,h),'note':rect(lane*w,h,w,h),'confirm':rect(lane*w,h*4,w,h),'body':body,'tail':tail})
  im=sheet
 else:
  xp=p.with_suffix('.xml')
  if not xp.exists():return None
  nodes=list(ET.fromstring(xp.read_text(encoding='utf-8').lstrip('\ufeff')))
  def find(prefix):
   n=next((n for n in nodes if n.get('name','').startswith(prefix)),None)
   return {k:int(n.get(k,0)) for k in ['x','y','width','height','frameX','frameY','frameWidth','frameHeight']} if n is not None else None
  for color,direction in zip(['purple','blue','green','red'],['left','down','up','right']):
   head=find(color+'0') or (find('HongoPiola') if name.startswith('JM') else None)
   if not head:return None
   frames.append({'idle':find('arrow'+direction.upper()) or head,'note':head,'confirm':find(direction+' confirm') or head,'body':find(color+' hold piece') or head,'tail':find('pruple end hold' if color=='purple' else color+' hold end') or head})
 out=ROOT/'assets/extra-mods/mario/notes'/(('pixel-' if pixel else '')+name+('-mono' if mono else '')+'.webp');out.parent.mkdir(parents=True,exist_ok=True);im.save(out,lossless=True)
 result={'src':ns['web'](out),'frames':frames,'pixel':pixel};skincache[token]=result;return result
prefixes={'Hurt Note':'HURT','Nota veneno':'poison','Ring Note':'ring','Nota boo':'boo','Coin Note':'coin','Water Note':'water','Nota bomba':'bomb','Bullet':'Bullet','jumpscareM':'JM','Bullet Bill':'BulletBill','Bullet2':'BulletBill','Bad Poison':'bad'}
for sid,s in songs.items():
 stage=s['stage'];pixel=s['pixelStage'];name=s['nativeArrowSkin'] or 'Mario_NOTE_assets'
 if pixel:name={'virtual':'Virtual_NOTE_assets','landstage':'GB_NOTE_assets','somari':'NES_NOTE_assets','piracy':'DS_NOTE_assets'}.get(stage,name)
 if pixel and stage=='landstage' and sid.endswith('-old'):name='Mario_NOTE_assets'
 s['noteSkin']=skin(name,pixel,stage=='endstage' or stage=='landstage' and not sid.endswith('-old')) or skin('Mario_NOTE_assets')
 s['specialNoteSkins']={}
 for typ in {n['sourceNoteType'] for side in s['charts']['hard'].values() for n in side if isinstance(n['sourceNoteType'],str)}:
  if typ in prefixes:
   special=skin(prefixes[typ]+name,pixel) or skin(prefixes[typ]+'Mario_NOTE_assets')
   if special:s['specialNoteSkins'][typ]=special
   else:report.setdefault('missingNoteSkins',[]).append([sid,typ])
