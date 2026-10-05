import json
from pathlib import Path
p=Path(__file__).parent
read=lambda f:json.loads(f.read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
old=read(p/'chart-before-change-detection.js'); new=read(p.parent/'imported-chart.js')
events={e['time'] for e in json.loads((p/'change-events.json').read_text())}
for d in ['easy','normal','hard']:
    for side in ['echo','nova']:
        notes=new['charts'][d][side]
        assert all(n['time'] in events for n in notes), 'Note not aligned to detected change'
        assert len(notes)==len({n['time'] for n in notes})
    def repeats(chart):
        count=0
        for s in new['sections']:
            lanes=[n['lane'] for n in chart if s['start']<=n['time']<s['end']]
            for width in [2,3,4]:
                count+=sum(lanes[i-width:i]==lanes[i-2*width:i-width] for i in range(2*width,len(lanes)+1))
        return count
    before=repeats(old['charts'][d]['echo']); after=repeats(new['charts'][d]['echo'])
    print(d, 'adjacent repeated motifs:', before, '->', after)
    assert after<=before
print('PASS: change-event alignment, unique timestamps, reduced phrase-pattern repetition')
