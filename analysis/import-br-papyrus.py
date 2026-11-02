from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
source=(root/'analysis/import-dustin.py').read_text(encoding='utf8').split('order=')[0]
source=source.replace("out=root/'assets/extra-mods/dustin'", "out=root/'assets/extra-mods/dustin/br-papyrus'")
source=source.replace('260/max(1,int(idle.get', '480/max(1,int(idle.get').replace('420/max(1,int(idle.get', '800/max(1,int(idle.get')
source=source.replace('quality=84','quality=94')
env={'__file__':str(root/'analysis/import-dustin.py')}
exec(source,env)
for name in ['phantom_paps_br_body']:
 env['cached'].pop(name,None)
 env['character'](name)
a=env['art']['characters']
(root/'br-papyrus.js').write_text('const DUSTIN_BR_PAPYRUS='+json.dumps(a,separators=(',',':'))+';\n',encoding='utf8')
p=root/'mod-assets.json';files=json.loads(p.read_text(encoding='utf8'))
for f in ['br-papyrus.js']+[p for a in a.values() for p in a['pages']]:
 if f not in files:files.append(f)
p.write_text(json.dumps(files,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
