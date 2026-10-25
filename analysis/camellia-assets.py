"""Read data-only JSON5 and flatten Adobe Animate symbol timelines for Camellia."""
import ast,json,re,math
from pathlib import Path
from PIL import Image

def read5(p):
 text=Path(p).read_text(encoding='utf-8-sig');tokens=re.findall(r'''//[^\n]*|/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|0x[\da-fA-F]+|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[A-Za-z_$][\w$]*|[^\s]''',text)
 out=[]
 for i,t in enumerate(tokens):
  if t.startswith(('//','/*')):continue
  if t[0] in "\"'":out.append(json.dumps(ast.literal_eval(t)))
  elif t.startswith('0x'):out.append(str(int(t,16)))
  elif re.fullmatch(r'[A-Za-z_$][\w$]*',t) and t not in ['true','false','null']:out.append(json.dumps(t))
  elif t==',' and i+1<len(tokens) and tokens[i+1] in ['}',']']:continue
  else:out.append(t)
 return json.loads(''.join(out))

def mul(a,b):
 A,B,C,D,E,F=a;x,y,z,w,u,v=b;return [A*x+C*y,B*x+D*y,A*z+C*w,B*z+D*w,A*u+C*v+E,B*u+D*v+F]

def matrix(o):
 if 'MX' in o:return o['MX']
 if 'M3D' in o:
  m=o['M3D'];return [m[0],m[1],m[4],m[5],m[12],m[13]]
 return [1,0,0,1,0,0]

def adobe(folder,defs,out):
 data=read5(folder/'Animation.json');syms={s['SN']:s['TL'] for s in data['SD']['S']};parts={}
 for mp in folder.glob('spritemap*.json'):
  atlas=Image.open(mp.with_suffix('.png')).convert('RGBA')
  for item in read5(mp)['ATLAS']['SPRITES']:
   s=item['SPRITE'];im=atlas.crop((s['x'],s['y'],s['x']+s['w'],s['y']+s['h']))
   if s.get('rotated'):im=im.transpose(Image.Transpose.ROTATE_90)
   parts[str(s['name'])]=im
 def length(t):return max(f['I']+f['DU'] for l in t['L'] for f in l['FR'])
 def walk(t,n,m,res,depth=0):
  if depth>30:raise ValueError('symbol recursion')
  for layer in reversed(t['L']):
   f=next((f for f in layer['FR'] if f['I']<=n<f['I']+f['DU']),None)
   if not f:continue
   for el in f.get('E',[]):
    if 'ASI' in el:
     o=el['ASI'];res.append((str(o['N']),mul(m,matrix(o))))
    elif 'SI' in el:
     o=el['SI'];sub=syms[o['SN']];sf=o.get('FF',0)
     if o.get('LP')!='SF':sf+=n-f['I'];sf=sf%length(sub) if o.get('LP')=='LP' else min(sf,length(sub)-1)
     walk(sub,sf,mul(m,matrix(o)),res,depth+1)
 animations={};xs=[];ys=[]
 for d in defs:
  if d['id'] not in syms:continue
  frames=[];timeline=syms[d['id']];indices=d.get('indices') or list(range(length(timeline)))
  for n in indices[::2]:
   res=[];off=d.get('offsets',[0,0]);walk(timeline,n,[1,0,0,1,-off[0],-off[1]],res);frames.append(res)
   for name,m in res:
    w,h=parts[name].size;A,B,C,D,E,F=m
    for u,v in [(0,0),(w,0),(0,h),(w,h)]:xs.append(A*u+C*v+E);ys.append(B*u+D*v+F)
  animations[d['name']]=frames
 if not animations:raise ValueError('Missing Adobe symbols '+str(folder))
 x0,y0,x1,y1=min(xs),min(ys),max(xs),max(ys);scale=min(480/(y1-y0),700/(x1-x0));cw,ch=math.ceil((x1-x0)*scale)+2,math.ceil((y1-y0)*scale)+2
 out.mkdir(parents=True,exist_ok=True);pages=[];result={};idx=0;page=Image.new('RGBA',(cw*4,ch*6));configs={}
 total=sum(map(len,animations.values()))
 for key,frames in animations.items():
  result[key]=[];d=next(d for d in defs if d['name']==key);configs[key]={'fps':d.get('framerate',24)/2,'loop':d.get('looped',False),'offsets':[0,0]}
  for res in frames:
   canvas=Image.new('RGBA',(cw,ch))
   for name,m in res:
    A,B,C,D,E,F=mul([scale,0,0,scale,-x0*scale,-y0*scale],m);det=A*D-B*C
    if abs(det)<1e-8:continue
    inv=(D/det,-C/det,(C*F-D*E)/det,-B/det,A/det,(B*E-A*F)/det)
    canvas.alpha_composite(parts[name].transform((cw,ch),Image.Transform.AFFINE,inv,Image.Resampling.BICUBIC))
   j=idx%24;xx=j%4*cw;yy=j//4*ch;page.paste(canvas,(xx,yy));dest=out/(str(idx//24)+'.webp')
   result[key].append({'src':str(dest),'x':xx,'y':yy,'w':cw,'h':ch,'ox':0,'oy':0,'fw':cw,'fh':ch});idx+=1
   if idx%24==0 or idx==total:page.save(dest,quality=86,method=2);pages.append(str(dest));page=Image.new('RGBA',(cw*4,ch*6))
 if 'idle' not in result:result['idle']=result.get('danceLeft',next(iter(result.values())))
 return {'src':pages[0],'pages':pages,'animations':result,'config':configs,'scale':scale,'flip':False,'renderScale':.75}
