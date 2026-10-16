from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent.parent
scope={'__file__':str(ROOT/'analysis/import-mario.py')}
exec((ROOT/'analysis/import-mario.py').read_text(encoding='utf8').split('# Restrict to the opening scene')[0],scope)
text=(ROOT/'mario-mod.js').read_text(encoding='utf8')
songs=json.loads(text.split('Object.assign(MOD_SONGS,',1)[1].split(');\nconst MARIO_ART=',1)[0])
art=json.loads(text.split('const MARIO_ART=',1)[1].split(';\nfor(const key',1)[0])
scope['art']=art
exec((ROOT/'analysis/mario-character-events.py').read_text(encoding='utf8'),scope)
report={}
for sid,track in songs.items():
    p=scope['R']/track['sourceChart'];raw=scope['read'](p);s=raw['song'];events=[]
    for f in [p,p.parent/'events.json']:
        if not f.exists():continue
        src=scope['read'](f).get('song',{})
        for sec in src.get('notes',[]):
            for n in sec.get('sectionNotes',[]):
                if float(n[1])<0 and len(n)>=5:events.append({'time':float(n[0])/1000,'name':str(n[2]),'v1':str(n[3]),'v2':str(n[4])})
        for t,es in src.get('events',[]):
            for n in es:events.append({'time':float(t)/1000,'name':n[0],'v1':str(n[1]),'v2':str(n[2])})
    cues=scope['compile_mario_events'](s,events)
    track['events']['hard']=[e for e in track['events']['hard'] if not e.get('marioDerived')]+cues
    track['events']['hard'].sort(key=lambda e:e['time'])
    scene=art['scenes'][sid]
    for char in sorted({e['v2'] for e in cues if e['name'] in ('Change Character','Mario Guest')}):
        key=scope['character'](char)
        if not key:raise ValueError('Missing transition character '+sid+' '+char)
        if key not in scene['characters']:scene['characters'].append(key)
    report[sid]=cues
    print(sid,len(cues),flush=True)
(ROOT/'mario-mod.js').write_text('Object.assign(MOD_SONGS,'+json.dumps(songs,separators=(',',':'))+');\nconst MARIO_ART='+json.dumps(art,separators=(',',':'))+';\nfor(const key of ["characters","backgrounds","videos","scenes"])Object.assign(MOD_ART[key],MARIO_ART[key]);\nObject.assign(EXTRA_ART.sprites,MARIO_ART.sprites);\n',encoding='utf8')
(ROOT/'analysis/mario-character-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=ROOT/'mod-assets.json';files=json.loads(p.read_text())+[f.relative_to(ROOT).as_posix() for f in (ROOT/'assets/extra-mods/mario').rglob('*') if f.is_file()];p.write_text(json.dumps(list(dict.fromkeys(files)),indent=2)+'\n',encoding='utf8')
