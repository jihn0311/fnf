# Executed by build-allstars-stages.py with its source paths and output metadata.
def native_frames(name, animation):
 source=path(prefix+'act3/'+name)
 image=Image.open(source).convert('RGBA')
 frames=[f.attrib for f in ET.fromstring(source.with_suffix('.xml').read_text(encoding='utf8').lstrip('\ufeff')) if f.get('name','').startswith(animation)]
 assert frames,(name,animation)
 return image,frames

def native_part(data,index):
 image,frames=data;f=frames[index%len(frames)]
 x,y,w,h=[int(f[k]) for k in ('x','y','width','height')]
 full=Image.new('RGBA',(int(f.get('frameWidth',w)),int(f.get('frameHeight',h))))
 full.alpha_composite(image.crop((x,y,x+w,y+h)),(-int(f.get('frameX',0)),-int(f.get('frameY',0))))
 return full

base=fit(frame(prefix+'act3/Act3_Static','act3stat'))
overlay(base,frame(prefix+'act3/Act3_Hills','hills'),(0,365),(1120,282))
arm=frame(prefix+'act3/Act3_Ultra_Arm');w,h=arm.size
cx,cy,z=-260,420,.39
overlay(base,arm,(round(560+(-1175-cx)*z),round(265+(-775-cy)*z)),(round(w*z),round(h*z)))
foreground=frame(prefix+'act3/act3')
for pose,head,animation,bodyanim in [('act3','Act3_Ultra_M_Head','ultra m static head','torso idle 1'),('act3-lyrics1','Act3_Ultra_M_Head','ultra m lyrics 1','torso idle 1'),('act3-lyrics2','Act3_Ultra_M_Head2','ultra m lyrics 2','torso idle 2')]:
 head_data=native_frames(head,animation);body_data=native_frames('Act3_Ultra_M',bodyanim)
 count=max(len(head_data[1]),len(body_data[1])) if pose=='act3' else len(head_data[1])
 indices=list(range(0,count,3));entries=[];pages=[];cw,ch=560,265;cols,rows=4,8
 for j,n in enumerate(indices):
  cell=j%(cols*rows)
  if cell==0:atlas=Image.new('RGB',(cw*cols,ch*min(rows,(len(indices)-j+cols-1)//cols)))
  bg=base.copy()
  for data,index,x,y,scale in [(body_data,n,-1185,-50,1.4),(head_data,n,-475,-210,1.1)]:
   part=native_part(data,index);w,h=part.size
   overlay(bg,part,(round(560+(x-cx+w*(1-scale)/2)*z),round(265+(y-cy+h*(1-scale)/2)*z)),(round(w*scale*z),round(h*scale*z)))
  overlay(bg,foreground,(0,0),(1120,530),.25)
  xx=cell%cols*cw;yy=cell//cols*ch;atlas.paste(bg.convert('RGB').resize((cw,ch),Image.Resampling.LANCZOS),(xx,yy))
  dest=OUT/('all-stars-'+pose+'-motion-'+str(j//(cols*rows))+'.webp');url=dest.relative_to(ROOT).as_posix()
  entries.append(dict(src=url,x=xx,y=yy,w=cw,h=ch,ox=0,oy=0,fw=cw,fh=ch))
  if cell==cols*rows-1 or j==len(indices)-1:atlas.save(dest,quality=86,method=2);pages.append(url)
 data=art['sprites'][scene['phaseBackgrounds'][pose]]
 data.update(staticSrc=data['src'],pages=pages+[data['src']],animations={'idle':entries},config={'idle':{'fps':8,'loop':pose=='act3'}})
 print('Animated',pose,len(entries),'frames',flush=True)
 del head_data,body_data
