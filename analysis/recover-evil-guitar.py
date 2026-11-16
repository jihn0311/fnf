from pathlib import Path
import importlib.util,json,subprocess
sp=importlib.util.spec_from_file_location('m',Path('analysis/rebuild-evil-reference.py'));m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
cv2,np=m.cv2,m.np
ref=cv2.resize(m.capture(2,110),(320,180));template=cv2.cvtColor(ref[120:144,145:169],cv2.COLOR_BGR2GRAY)
result=[]
for start,end in [(96,114),(151,174),(298,314)]:
 p=subprocess.Popen([m.FF,'-loglevel','error','-ss',str(start),'-i',m.INFO[2]['file'],'-t',str(end-start),'-vf','scale=320:180,fps=30','-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
 tracks=[];frame=0
 def finish(tr):
  a=tr['points']
  if len(a)<3:return
  ts=np.array([v[0] for v in a]);ys=np.array([v[1] for v in a]);slope,intercept=np.polyfit(ts,ys,1)
  if not -500<slope<-35 or np.max(abs(ys-(ts*slope+intercept)))>4:return
  hit=(32-intercept)/slope
  if not start<=hit<=end:return
  result.append({'time':round(float(hit),3),'lane':tr['lane'],'duration':0,'evidence':'moving colored guitar circle','confidence':round(float(np.mean([v[2] for v in a])),3)})
 while True:
  raw=p.stdout.read(320*180*3)
  if len(raw)!=320*180*3:break
  f=np.frombuffer(raw,np.uint8).reshape(180,320,3);t=start+frame/30;frame+=1
  gray=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY);v=cv2.matchTemplate(gray[44:180],template,cv2.TM_CCOEFF_NORMED);detections=[]
  for _ in range(12):
   _,score,_,loc=cv2.minMaxLoc(v)
   if score<.73:break
   x,y=loc[0]+12,loc[1]+56;v[max(0,loc[1]-15):loc[1]+16,max(0,loc[0]-15):loc[0]+16]=-1
   hsv=cv2.cvtColor(f[max(0,y-13):min(180,y+13),max(0,x-13):min(320,x+13)],cv2.COLOR_BGR2HSV);h,sat,val=cv2.split(hsv)
   counts=[np.count_nonzero((h>130)&(h<175)&(sat>75)&(val>60)),np.count_nonzero((h>70)&(h<105)&(sat>75)&(val>60)),np.count_nonzero((h>35)&(h<70)&(sat>75)&(val>60))]
   if max(counts)<10:continue
   detections.append((x,y,int(np.argmax(counts)),score))
  used=set()
  for x,y,lane,score in detections:
   possible=[(abs(tr['x']-x)+abs(tr['points'][-1][1]-y),i,tr) for i,tr in enumerate(tracks) if i not in used and tr['lane']==lane and abs(tr['x']-x)<12 and -.01<t-tr['points'][-1][0]<.11 and -28<y-tr['points'][-1][1]<5]
   if possible:
    _,i,tr=min(possible,key=lambda q:q[0]);used.add(i);tr['x']=x;tr['points'].append((t,y,score))
   else:tracks.append({'lane':lane,'x':x,'points':[(t,y,score)]});used.add(len(tracks)-1)
  active=[]
  for tr in tracks:
   if t-tr['points'][-1][0]>.11:finish(tr)
   else:active.append(tr)
  tracks=active
 for tr in tracks:finish(tr)
 p.wait()
unique=[]
for n in sorted(result,key=lambda n:n['time']):
 if any(n['lane']==o['lane'] and abs(n['time']-o['time'])<.12 for o in unique[-8:]):continue
 unique.append(n)
print('RECOVERED',len(unique));print(unique[:10])
Path('analysis/evil-reference-chart-recovery.json').write_text(json.dumps({'soul-final':{'echo':unique}},indent=2),encoding='utf-8')
