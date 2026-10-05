import numpy as np
from pathlib import Path
f=np.load(Path(__file__).parent/'features.npz');v=f['onset'];hop=float(f['hop']);t=np.arange(len(v))*hop+.02
mask=(t>3)&(t<108);t=t[mask];v=v[mask];v=np.maximum(v-np.quantile(v,.55),0)
bpms=np.arange(156,164,.01);coherence=np.array([abs(np.sum(v*np.exp(2j*np.pi*t*b/60))) for b in bpms]);b=bpms[np.argmax(coherence)]
z=np.sum(v*np.exp(2j*np.pi*t*b/60));period=60/b;offset=(np.angle(z)/(2*np.pi)%1)*period
print('bpm',round(b,3),'offset',round(offset,4),'coherence',round(float(abs(z)/sum(v)),3))
for b in [159.9,160,160.1]:
 z=np.sum(v*np.exp(2j*np.pi*t*b/60));print(b,float(abs(z)/sum(v)),(np.angle(z)/(2*np.pi)%1)*60/b)
