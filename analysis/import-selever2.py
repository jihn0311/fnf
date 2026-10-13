"""Import selected Selever 2.1 charts/audio, reusing existing Selever stage and actors."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
helper=root/'analysis/import-extra-mods.py';ns={'__file__':str(helper)}
exec(helper.read_text(encoding='utf-8-sig').split('for pack,folder in')[0],ns)
source=Path('C:/Users/kht80/Desktop/fnf selever2/Vs Selever 2.1/mods/vs-selever')
patches={}
for slug in ['casanova','demonila','attack']:
 charts={};sections={};bpms={};paths={}
 for diff,suffix in [('easy','-easy'),('normal',''),('hard','-hard')]:
  path=source/'data'/slug/(slug+suffix+'.json')
  data=ns['read'](path)['song'];charts[diff],_,sections[diff]=ns['chart'](data)
  bpms[diff]=data['bpm'];paths[diff]=path.relative_to(source).as_posix()
 patch={'charts':charts,'sectionsByDifficulty':sections,'sections':sections['hard'],'bpmByDifficulty':bpms,'bpm':bpms['hard'],'defaultDifficulty':'hard','chartVariant':'selever2','sourceCharts':paths}
 if slug!='casanova':
  folder=source/'songs'/slug
  duration=max(ns['duration'](folder/name) for name in ['Inst.ogg','Voices.ogg'])
  patch.update({'title':'Mid-Fight Masses · '+slug.title(),'duration':duration,'beats':duration*bpms['hard']/60,'audioSrc':ns['copy'](folder/'Inst.ogg','survent/audio/'+slug),'voiceSrc':ns['copy'](folder/'Voices.ogg','survent/audio/'+slug),'events':{diff:[] for diff in charts},'circleCues':[],'description':slug.title()+' · Selever 2.1 원본 채보·음원 · 기존 셀레버 캐릭터'})
 else:patch['description']='Casanova · Selever 2.1 채보 · 기존 캐릭터·무대·음원'
 patches['survent-'+slug]=patch
 print(slug,{diff:{side:len(notes) for side,notes in chart.items()} for diff,chart in charts.items()},flush=True)
output='const SELEVER2_PATCHES='+json.dumps(patches,separators=(',',':'))+';\n'
output+="for(const [id,patch] of Object.entries(SELEVER2_PATCHES))MOD_SONGS[id]={...MOD_SONGS['survent-casanova'],...patch};\n"
(root/'selever2-mod.js').write_text(output,encoding='utf-8')
p=root/'mod-assets.json';files=ns['read'](p)+['selever2-mod.js']+[ns['web'](f) for slug in ['attack','demonila'] for f in (root/'assets/extra-mods/survent/audio'/slug).glob('*.ogg')]
p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2),encoding='utf-8')
