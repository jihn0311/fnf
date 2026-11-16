from pathlib import Path
import sys,json,subprocess,re,copy
sys.path.insert(0,'C:/Users/kht80/AppData/Local/Temp/fnf-video-tools')
import cv2,numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
CACHE=Path('C:/Users/kht80/AppData/Local/Temp/evil-reference')
CACHE.mkdir(parents=True,exist_ok=True)
INFO=json.loads(Path(__file__).with_name('evil-reference-sources.json').read_text(encoding='utf-8'))
FF='C:/Users/kht80/AppData/Local/CapCut/Apps/9.6.0.4097/ffmpeg.exe'
OUT=ROOT/'assets/extra-mods/evil-reference';OUT.mkdir(parents=True,exist_ok=True)
STAGES=[(6,'dad-day1','Daddy Dearest · DAY 1',0,118),(4,'dad-day2','Daddy Dearest · DAY 2',0,150),(5,'dad-final','Daddy Dearest · FINAL BATTLE',0,211),(3,'soul-day1','Soul BF · DAY 1 — Tormentor',0,112),(0,'soul-day2','Soul BF · DAY 2 — Neuroses',0,195),(2,'soul-final','Soul BF · FINAL BATTLE — Discharge',0,332),(1,'soul-escape','Soul BF · ESCAPE',70,178)]
def capture(index,t):
 c=cv2.VideoCapture(INFO[index]['file']);c.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,f=c.read();c.release()
 if not ok:raise ValueError('Cannot read frame')
 return cv2.resize(f,(640,360))
def mask(f):
 b,g,r=cv2.split(f.astype(np.int16));return ((g-r>9)&(b-r>12)&(abs(b-g)<45)&(g>75)&(g<235)).astype(np.uint8)*255
reference=cv2.resize(capture(6,20),(320,180));up=mask(reference)[13:38,69:94]
templates=[cv2.rotate(up,cv2.ROTATE_90_COUNTERCLOCKWISE),cv2.rotate(up,cv2.ROTATE_180),up,cv2.rotate(up,cv2.ROTATE_90_CLOCKWISE)]
xs=[25,53,81,109,187,215,243,271]
def extract(index,start,end):
 dest=CACHE/f'chart-{index}.json'
 if dest.exists():return json.loads(dest.read_text())
 pipe=subprocess.Popen([FF,'-loglevel','error','-ss',str(start),'-i',INFO[index]['file'],'-t',str(end-start),'-vf','scale=320:180,fps=30','-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
 tracks=[[] for _ in xs];finished=[[] for _ in xs];tails=[];frame=0
 def close(lane):
  a=tracks[lane];tracks[lane]=[]
  if len(a)<3:return
  ts=np.array([x[0] for x in a]);ys=np.array([x[1] for x in a]);slope,intercept=np.polyfit(ts,ys,1)
  if not -650<slope<-45:return
  hit=(25-intercept)/slope
  if hit<0 or hit>end-start:return
  if np.max(abs(ys-(ts*slope+intercept)))>6:return
  finished[lane].append({'time':round(float(hit),3),'lane':lane%4,'duration':0,'confidence':round(float(np.mean([x[2] for x in a])),3)})
 while True:
  raw=pipe.stdout.read(320*180*3)
  if len(raw)!=320*180*3:break
  f=np.frombuffer(raw,np.uint8).reshape(180,320,3);m=mask(f);t=frame/30;frame+=1
  tails.append([bool(np.count_nonzero(m[40:49,x-1:x+2])>22) for x in xs])
  for lane,x in enumerate(xs):
   strip=m[39:98,x-14:x+15];v=cv2.matchTemplate(strip,templates[lane%4],cv2.TM_CCOEFF_NORMED);_,score,_,loc=cv2.minMaxLoc(v);y=39+loc[1]+12
   if score<.59:
    if tracks[lane] and t-tracks[lane][-1][0]>.075:close(lane)
    continue
   old=tracks[lane]
   if old and (y>old[-1][1]+4 or t-old[-1][0]>.1):close(lane)
   tracks[lane].append((t,y,score))
 for lane in range(8):close(lane)
 pipe.wait();result={'nova':[],'echo':[]}
 for lane,notes in enumerate(finished):
  unique=[]
  for n in sorted(notes,key=lambda n:n['time']):
   if unique and n['time']-unique[-1]['time']<.095:continue
   # Sustain estimate from the thin rail crossing the same scan line.
   begin=int((n['time']+.12)*30);j=begin
   while j<len(tails) and tails[j][lane] and j/30-n['time']<6:j+=1
   if j-begin>=6:n['duration']=round(max(0,j/30-n['time']-.18),3)
   unique.append(n)
  result['nova' if lane<4 else 'echo']+=unique
 for side in result:result[side].sort(key=lambda n:n['time'])
 dest.write_text(json.dumps(result));print('CHART',index,{k:len(v) for k,v in result.items()},flush=True);return result
if __name__=='__main__':
 for index,slug,title,start,end in STAGES:extract(index,start,end)
