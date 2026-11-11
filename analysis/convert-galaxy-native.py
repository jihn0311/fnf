from pathlib import Path
import re
root=Path.cwd();out=['// Adapted from Allen98637/GalaxyMod source/modcharts (Apache-2.0).','// Haxe to JavaScript adaptation; window operations use a virtual in-canvas window.','const GALAXY_NATIVE={};']
for name in ['cona','underworld','cyber']:
 src=Path(f'analysis/galaxy-native-source/M_{name}.hx').read_text(encoding='utf-8-sig')
 src=re.sub(r'/\*.*?\*/|//[^\n]*','',src,flags=re.S)
 funcs=[];names=[]
 for m in re.finditer(r'function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*\w+)?\s*\{',src):
  start=m.end();depth=1;i=start
  while depth:
   if src[i]=='{':depth+=1
   elif src[i]=='}':depth-=1
   i+=1
  body=src[start:i-1]
  body=re.sub(r':\s*(?:Array<\w+>|Float|Int|Bool|String|FlxPoint)','',body).replace('var ','var ')
  # Haxe switches do not fall through. Track brace depth for nested switches.
  tokens=list(re.finditer(r'\bswitch\s*\([^\n]*|\bcase\s+\d+\s*:|\bdefault\s*:|[{}]',body));stack=[];pending=False;inserts=[]
  for token in tokens:
   value=token.group()
   if value.startswith('switch'):pending=True
   elif value=='{':stack.append({'switch':pending,'case':False});pending=False
   elif value=='}':
    level=stack.pop() if stack else None
    if level and level['switch'] and level['case']:inserts.append(token.start())
   elif value.startswith(('case','default')) and stack and stack[-1]['switch']:
    if stack[-1]['case']:inserts.append(token.start())
    stack[-1]['case']=True
  for at in reversed(inserts):body=body[:at]+'break;\n'+body[at:]
  args=re.sub(r':\w+','',m[2]);funcs.append('function '+m[1]+'('+args+'){'+body+'}');names.append(m[1])
 out.append("GALAXY_NATIVE['"+name+"']=function(env){const {Conductor,FlxG,FlxMath,PlayState,PlayMoving,PlayWindow,Lib,Note,NoteObject,Std,RenderPath,FixedScaleMode,RatioScaleMode}=env;let count=0;"+'\n'.join(funcs)+'\nreturn {'+','.join(names)+'};};')
(root/'galaxy-native.js').write_text('\n'.join(out),encoding='utf8')

