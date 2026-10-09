# Read declarative sprite setup from the creator's PlayState; never execute Haxe.
import re
from PIL import Image
source_path=Path('C:/Users/kht80/AppData/Local/Temp/impostor-playstate.hx')
source_text=source_path.read_text(encoding='utf-8')
setup=source_text[source_text.index('switch (curStage)'):source_text.index('switch (curStage.toLowerCase())')]
blocks=dict(re.findall(r"^\t{3}case '([^']+)'\s*:(.*?)(?=^\t{3}case |\Z)",setup,re.M|re.S))
num=r'-?\d+(?:\.\d+)?'
def source_stage(stage):
 block=blocks.get(stage,'');block=re.sub(r'//[^\n]*','',block)
 declarations=list(re.finditer(r'(\w+)(?::\w+)?\s*=\s*new (FlxSprite|BGSprite)\(([^;]*?)\);',block))
 layers=[]
 for index,m in enumerate(declarations):
  name,kind,args=m.groups();end=declarations[index+1].start() if index+1<len(declarations) else len(block);tail=block[m.start():end]
  if kind=='BGSprite':
   match=re.match(r"'([^']+)'\s*,\s*("+num+r')\s*,\s*('+num+')',args)
   if not match:continue
   asset,x,y=match.groups()
  else:
   coords=re.match(r'('+num+r')\s*,\s*('+num+r')',args)
   assetmatch=re.search(r"Paths\.(?:image|getSparrowAtlas)\('([^']+)'",tail)
   if not coords or not assetmatch:continue
   x,y=coords.groups();asset=assetmatch[1]
  f=image(asset)
  if not f:continue
  # Only include sprites actually added to the stage, excluding HUD-only pictures.
  if not re.search(r'add\('+re.escape(name)+r'\)',block) or re.search(re.escape(name)+r'\.cameras\s*=\s*\[cam(?:HUD|Other)\]',tail):continue
  scale=re.search(re.escape(name)+r'\.setGraphicSize\(Std.int\('+re.escape(name)+r'\.width\s*\*\s*('+num+r')',tail)
  scale2=re.search(re.escape(name)+r'\.scale.set\(('+num+r')',tail)
  factor=float(scale[1] if scale else scale2[1] if scale2 else 1)
  alpha=re.search(re.escape(name)+r'\.alpha\s*=\s*('+num+r')',tail)
  visible=not re.search(re.escape(name)+r'\.visible\s*=\s*false',tail)
  prefix=re.search(re.escape(name)+r"\.animation.addByPrefix\('[^']+',\s*'([^']+)',\s*(\d+),\s*(true|false)",tail)
  definition={'animations':[{'anim':'idle','name':prefix[1],'fps':int(prefix[2]),'loop':prefix[3]=='true'}]} if prefix else None
  key='impostor/source-stage/'+stage+'/'+name
  sheet=atlas(f,key,definition,height=650,bg=True)
  if sheet.get('animations'):
   frame=sheet['animations']['idle'][0];w=frame['fw']/sheet['scale'];h=frame['fh']/sheet['scale']
  else:w,h=Image.open(f.with_suffix('.png')).size
  layers.append({'key':key,'name':name,'x':float(x),'y':float(y),'w':w*factor,'h':h*factor,'alpha':float(alpha[1]) if alpha and visible else 1 if visible else 0,'loop':prefix[3]=='true' if prefix else False,'animated':bool(prefix)})

 if not layers:
  lua=r/'stages'/(stage+'.lua')
  if lua.exists():
   text=lua.read_text(encoding='utf-8-sig')
   for match in re.finditer(r"makeLuaSprite\(\s*['\"]([^'\"]+)['\"],\s*['\"]([^'\"]+)['\"],\s*("+num+r"),\s*("+num+r")",text):
    name,asset,x,y=match.groups();f=image(asset)
    if not f:continue
    key='impostor/source-stage/'+stage+'/'+name;sheet=atlas(f,key,height=650,bg=True);w,h=Image.open(f.with_suffix('.png')).size
    layers.append({'key':key,'name':name,'x':float(x),'y':float(y),'w':w,'h':h,'alpha':1,'animated':False,'loop':False})
 return layers

def source_layout(base,stage,keys):
 data=read(r/'stages'/(stage+'.json')) if (r/'stages'/(stage+'.json')).exists() else {}
 actors={}
 for side,char,slot in [('nova',base['player2'],'opponent'),('echo',base['player1'],'boyfriend')]:
  path=r/'characters'/(char+'.json');cfg=read(path if path.exists() else r/'characters/bf.json');a=art['characters']['impostor:'+char];f=a['animations']['idle'][0];native=float(cfg.get('scale',1));w=f['fw']/a['scale']*native;h=f['fh']/a['scale']*native
  pos=data.get(slot,[100 if side=='nova' else 770,100]);offset=cfg.get('position',[0,0]);x=pos[0]+offset[0];y=pos[1]+offset[1]
  actors[side]={'x':x+w/2,'y':y+h,'w':w,'h':h,'native':native}
 left=min(a['x']-a['w']/2 for a in actors.values());right=max(a['x']+a['w']/2 for a in actors.values());bottom=max(a['y'] for a in actors.values())
 scale=min(.65,980/max(1,right-left),365/max(a['h'] for a in actors.values()))
 return {'scale':scale,'x':560-(left+right)/2*scale,'y':465-bottom*scale,'actors':actors}
