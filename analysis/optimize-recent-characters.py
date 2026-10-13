from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
from PIL import Image
p=root/'survent-mod.js';text=p.read_text(encoding='utf-8');prefix,rest=text.split('const SURVENT_ART=',1);body,suffix=rest.split(';\nfor(const key',1);art=json.loads(body)
for name in ['selever']:
 a=art['characters']['survent:'+name];images={};unique={};groups={}
 for key,frames in a['animations'].items():
  groups[key]=[];previous=None
  for f in frames:
   src=f.get('src',a['src']).split('?')[0]
   if src not in images:images[src]=Image.open(root/src).convert('RGBA')
   im=images[src].crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));bbox=im.getbbox()
   if not bbox:
    if name!='selever' or previous is None:raise ValueError('Unexpected empty frame '+name+'/'+key)
    groups[key].append(dict(previous));continue
   im=im.crop(bbox);token=(im.size,hashlib.sha256(im.tobytes()).digest())
   unique.setdefault(token,im)
   row={**f,'w':im.width,'h':im.height,'ox':f['ox']+bbox[0],'oy':f['oy']+bbox[1],'token':token};groups[key].append(row);previous=row
 placements={};pages=[];page=Image.new('RGBA',(2048,4096));x=y=rowh=index=0
 def save():
  dest=root/('assets/extra-mods/survent/characters/'+name+'-optimized-'+str(index)+'.webp')
  page.crop((0,0,2048,max(1,y+rowh))).save(dest,quality=90,method=5)
  pages.append(ns['web'](dest)+'?v='+hashlib.sha256(dest.read_bytes()).hexdigest()[:12])
 for token,im in sorted(unique.items(),key=lambda item:-item[1].height):
  if x+im.width>2048:x=0;y+=rowh+2;rowh=0
  if y+im.height>4096:save();index+=1;page=Image.new('RGBA',(2048,4096));x=y=rowh=0
  placements[token]=(index,x,y);page.paste(im,(x,y));x+=im.width+2;rowh=max(rowh,im.height)
 save()
 for frames in groups.values():
  for f in frames:
   idx,f['x'],f['y']=placements[f.pop('token')];f['src']=pages[idx]
 a['animations']=groups;a['src']=pages[0];a['pages']=pages;art['sprites']['survent/characters/'+name]=a
 print(name,'pages',len(images),'->',len(pages),flush=True)
p.write_text(prefix+'const SURVENT_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key'+suffix,encoding='utf-8')
# Delete only superseded character pages generated for these two packs.
manifest=root/'mod-assets.json';used=set()
def collect(v):
 if isinstance(v,dict):
  for child in v.values():collect(child)
 elif isinstance(v,list):
  for child in v:collect(child)
 elif isinstance(v,str) and v.startswith('assets/'):used.add(v.split('?')[0])
collect(art)
ag=json.loads((root/'agoti-mod.js').read_text(encoding='utf-8').split('const AGOTI_ART=')[1].split(';\nfor(const key')[0]);collect(ag)
for pack in ['agoti','survent']:
 directory=(root/'assets/extra-mods'/pack/'characters').resolve()
 for f in directory.glob('*.webp'):
  if f.resolve().parent!=directory:raise ValueError('Outside character directory')
  if ns['web'](f) not in used:f.unlink()
files=[f for f in ns['read'](manifest) if not f.startswith(('assets/extra-mods/agoti/','assets/extra-mods/survent/')) or (root/f).exists()]
files += [f for f in used if f.endswith('.webp')]
manifest.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf-8')
