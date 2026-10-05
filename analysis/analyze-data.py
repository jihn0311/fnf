import json, numpy as np
from pathlib import Path
p=Path(__file__).parent
f=json.loads((p/'features.json').read_text());x=np.array(f['frames']);hop=f['hop'];n=len(x)
# Whiten bands against local energy, then use positive log-energy changes.
logs=np.log1p(x*100)
flux=np.maximum(0,logs-np.roll(logs,3,axis=0));flux[:3]=0
onset=flux@np.array([.4,.3,.3]);onset=np.convolve(onset,[.2,.6,.2],mode='same')
def tempos(v):
 v=v-np.mean(v);m=1<<(len(v)*2-1).bit_length();sp=np.fft.rfft(v,m);a=np.fft.irfft(sp*np.conj(sp),m)[:len(v)];a/=np.maximum(1,np.arange(len(v),0,-1));a/=max(a[0],1e-9)
 peaks=[i for i in range(int(.28/hop),min(int(.9/hop),len(a)-1)) if a[i]>a[i-1] and a[i]>=a[i+1]]
 return [(round(60/(i*hop),2),round(float(a[i]),3)) for i in sorted(peaks,key=lambda i:a[i],reverse=True)[:6]]
print('duration',f['duration'],'sampleRate',f['sampleRate'],'hop',hop,'global',tempos(onset))
for start in range(0,int(f['duration'])-10,20):
 z=onset[int(start/hop):int((start+20)/hop)];print(start,tempos(z), 'rms',round(float(np.mean(x[int(start/hop):int((start+20)/hop)])),3))
np.savez(p/'features.npz',energy=x,onset=onset,hop=hop,duration=f['duration'])
