"""Build charts from measured sound changes, without snapping to a beat grid."""
import json, hashlib
from pathlib import Path
import numpy as np

p = Path(__file__).parent
source = json.loads((p / 'features.json').read_text(encoding='utf-8'))
energy = np.asarray(source['frames'], dtype=float)
hop = source['hop']
duration = source['duration']
bpm = 160
beat = 60 / bpm
# Reuse the established call/response arrangement; only the notes change.
old = (p / 'chart-before-change-detection.js').read_text(encoding='utf-8')
result = json.loads(old.split('=', 1)[1].strip().rstrip(';'))
sections = result['sections']

# Compare centered 30 ms neighborhoods, preserving drops as well as attacks.
logs = np.log1p(energy * 100)
smooth = np.stack([np.convolve(logs[:, b], np.ones(3)/3, mode='same') for b in range(3)], axis=1)
change = np.zeros(len(energy))
balance = energy / np.maximum(energy.sum(axis=1, keepdims=True), .012)
for i in range(4, len(energy)-4):
    before, after = smooth[i-3:i].mean(axis=0), smooth[i:i+3].mean(axis=0)
    amplitude = np.abs(after-before) @ np.array([.35, .35, .30])
    colour = np.abs(balance[i:i+3].mean(axis=0)-balance[i-3:i].mean(axis=0)).sum()
    # Quiet passages/noise must not produce a dense chart.
    audible = min(1., energy[i-3:i+3].mean() / .025)
    change[i] = audible * (amplitude + .30 * colour)

# RMS windows in the source look forward ~40 ms; assign their center as event time.
center = source['window'] / 2
peaks = [i for i in range(4, len(change)-4)
         if change[i] > .065 and change[i] == max(change[i-3:i+4])
         and change[i] > change[i-1]]
# Merge the shoulders of a single transition, strongest first.
selected = []
for i in sorted(peaks, key=lambda i: (-change[i], i)):
    if all(abs(i-j)*hop >= .115 for j in selected):
        selected.append(i)
selected.sort()
events = [{'time': round(i*hop+center, 4), 'strength': float(change[i]), 'frame': i} for i in selected]


def section_at(t):
    return next((s for s in sections if s['start'] <= t < s['end']), None)


def make(difficulty, side):
    spacing, percentile = {'easy': (.44, 58), 'normal': (.255, 30), 'hard': (.135, 8)}[difficulty]
    picked = []
    # Threshold locally so softer musical phrases are still represented.
    for section in sections:
        if section['mode'] not in [side, 'duet']:
            continue
        candidates = [e for e in events if section['start'] <= e['time'] < section['end']]
        if not candidates:
            continue
        threshold = max(.085, float(np.percentile([e['strength'] for e in candidates], percentile)))
        chosen = []
        for event in sorted(candidates, key=lambda e: (-e['strength'], e['time'])):
            if event['strength'] >= threshold and all(abs(event['time']-c['time']) >= spacing for c in chosen):
                chosen.append(event)
        picked.extend(chosen)
    picked.sort(key=lambda e: e['time'])
    notes, blocked = [], [-9.] * 4
    for event in picked:
        at, i = event['time'], event['frame']
        if notes and at-notes[-1]['time'] < spacing:
            continue
        # The frequency band that changed most drives direction (no periodic rotation).
        delta = smooth[min(i+2, len(smooth)-1)] - smooth[max(0, i-2)]
        dominant = int(np.argmax(np.abs(delta)))
        lane = [0, 2, 3][dominant] if delta[dominant] >= 0 else 1
        if side == 'nova':
            lane = 3-lane
        available = [j for j in range(4) if at > blocked[j]+.18]
        if not available:
            continue
        # Prefer the acoustic direction, but avoid long jacks and recycled motifs.
        # History is local to the phrase so the arrangement can breathe between turns.
        history = [n['lane'] for n in notes if n['time'] >= section_at(at)['start']][-24:]
        def lane_cost(candidate):
            cost = 0 if candidate == lane else .65 + abs(candidate-lane)*.1
            if history and candidate == history[-1]:
                cost += .9
            if len(history) >= 2 and history[-2:] == [candidate, candidate]:
                cost += 12
            sequence = history + [candidate]
            # Penalize immediate repeated motifs of 2, 3, or 4 arrows.
            for width in [2, 3, 4]:
                if len(sequence) >= width*2 and sequence[-width:] == sequence[-2*width:-width]:
                    cost += 4
            if len(sequence) >= 4:
                motif = sequence[-4:]
                cost += 1.5 * sum(history[j:j+4] == motif for j in range(len(history)-3))
            return cost
        lane = min(available, key=lambda candidate: (lane_cost(candidate), candidate))
        # Hold through an audible stable interval; release before its next transition.
        section = section_at(at)
        later = next((e['time'] for e in events if e['time'] > at+.15 and e['strength'] >= max(.14, event['strength']*.55)), section['end'])
        stop = min(later-.055, section['end']-.08, at+1.5)
        length = 0.
        sustain = energy[int((at+.08)/hop):int(stop/hop)].mean(axis=1)
        if stop-at >= .48 and len(sustain) and np.quantile(sustain, .2) > .018:
            length = stop-at
        notes.append({'time': at, 'lane': lane, 'duration': round(length, 4)})
        blocked[lane] = at+length
    return notes

charts = {d: {s: make(d, s) for s in ['echo', 'nova']} for d in ['easy', 'normal', 'hard']}
result.update(charts=charts, description='사용자 제공 음원 · 급격한 음량·음색 변화 기준 채보')
result['analysis'] = {
    'method': 'Bidirectional 3-band log-energy and band-balance change peaks; no beat-grid quantization',
    'sampleRate': source['sampleRate'], 'timeResolution': hop,
    'sourceSHA256': hashlib.sha256((p.parent/'assets/self-embodiment.mp3').read_bytes()).hexdigest(),
    'note': 'Detects mixed-audio loudness/timbre changes, not isolated vocal pitches. Holds end before a subsequent significant change. Solo/duet sections remain a gameplay arrangement.'
}
(p.parent/'imported-chart.js').write_text('const IMPORTED_SONG = '+json.dumps(result, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8')
summary = {'method': result['analysis']['method'], 'duration': duration, 'events': len(events),
           'charts': {d: {s: {'notes': len(c), 'holds': sum(n['duration']>0 for n in c)} for s,c in sides.items()} for d,sides in charts.items()}}
(p/'change-events.json').write_text(json.dumps(events, indent=2), encoding='utf-8')
(p/'chart-summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps(summary, indent=2))
