'use strict';
const mobilePanel=document.createElement('div');mobilePanel.id='mobile-play';mobilePanel.hidden=true;
const mobileCanvas=document.createElement('canvas');mobileCanvas.width=400;mobileCanvas.height=760;mobileCanvas.setAttribute('aria-label','세로형 터치 리듬게임');mobilePanel.append(mobileCanvas);
const mobilePointers=new Set();
for(let lane=0;lane<4;lane++){
 const b=document.createElement('button');b.type='button';b.className='mobile-arrow';b.style.left=(lane*25)+'%';b.setAttribute('aria-label',['왼쪽','아래','위','오른쪽'][lane]+' 노트');
 b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);const id='pointer:mobile:'+e.pointerId;mobilePointers.add(id);inputDown(id,lane);});
 b.addEventListener('pointermove',e=>{
  const id='pointer:mobile:'+e.pointerId;if(!mobileMode||!mobilePointers.has(id))return;e.preventDefault();
  const r=mobilePanel.getBoundingClientRect(),band=b.getBoundingClientRect();
  const next=e.clientX>=r.left&&e.clientX<r.right&&e.clientY>=band.top&&e.clientY<band.bottom?Math.min(3,Math.floor((e.clientX-r.left)/r.width*4)):-1;
  if(held.get(id)===(next<0?undefined:next))return;
  inputUp(id);if(next>=0)inputDown(id,next);
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{const id='pointer:mobile:'+e.pointerId;inputUp(id);mobilePointers.delete(id);});
 b.addEventListener('contextmenu',e=>e.preventDefault());mobilePanel.append(b);
}
document.querySelector('.stage-viewport').append(mobilePanel);
function mobilePortraitActive(){return mobileMode;}
function refreshMobilePlay(){
 for(const id of mobilePointers)inputUp(id);mobilePointers.clear();
 document.querySelector('.game').classList.toggle('mobile-layout',mobileMode);document.body.classList.toggle('mobile-layout-enabled',mobileMode);mobilePanel.hidden=!mobileMode;
 if(mobileMode){for(const id of ['undertale-jump','qt-dodge','ring-input']){const b=document.getElementById(id);if(b)b.hidden=true;}}
 if(typeof draw==='function')draw(typeof time==='function'?time():0);
}
function drawMobilePortrait(t){
 const main=ctx,g=mobileCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.fillStyle='#21182e';g.fillRect(0,0,400,760);
 // Crop the stage around the selected performer without stretching it.
 const sourceX=playerSide()==='echo'?430:0;
 const sx=canvas.width/1120,sy=canvas.height/530;
 g.drawImage(canvas,sourceX*sx,0,690*sx,530*sy,0,62,400,530*400/690);
 try{
 ctx=g;const target=620,spacing=100,speed=430*settings.speed/LEAD;
 const gradient=g.createLinearGradient(0,300,0,760);gradient.addColorStop(0,'#21182e00');gradient.addColorStop(1,'#21182eee');g.fillStyle=gradient;g.fillRect(0,300,400,460);
 g.save();g.beginPath();g.rect(0,90,400,610);g.clip();
 const end=t+650/speed;
 for(let i=chartStart(notes);i<notes.length;i++){
  const n=notes[i];if(n.time>end)break;if(n.done)continue;
  const x=50+n.lane*spacing,y=n.holding?target:target-(n.time-t)*speed,tail=target-(n.time+(n.duration||0)-t)*speed;
  if(Math.max(y,tail)<80||Math.min(y,tail)>700)continue;
  if(n.duration)sustainSkin(x,y,tail,n.lane,COLORS[n.lane],false);
  stageArrow(x,y,n.lane,40,n.hurt?'#ff496f':COLORS[n.lane],true,t);
 }
 for(let lane=0;lane<4;lane++){
  const lit=state==='playing'&&(laneHeld(lane)||flashes[lane]>t),x=50+lane*spacing;
  if(lit){g.fillStyle=COLORS[lane]+'44';g.fillRect(lane*100,540,100,160);}
  stageArrow(x,target,lane,42,lit?COLORS[lane]:'#aab7cd',false,t);
 }
 g.restore();
 if(feedback&&t-feedbackAt<.65){label(feedback,200,450,25,feedbackColor);if(feedbackOffsetMs!==null)label(Math.round(feedbackOffsetMs)+' ms',200,477,13,'#fff');}
 if(t<0){const cue=countdownCue(t);if(cue)label(['READY?','SET!?','GO!'][cue.index],200,400,42,['#ff9e00','#ffe45b','#00e516'][cue.index]);}
 label(song.title,200,22,14,'#fff');label('SCORE '+Math.round(score)+'  ·  COMBO '+combo,200,44,12,'#fff');
 label(state==='paused'?'일시정지':state==='playing'?'화살표를 터치하세요':'곡을 시작하면 화살표를 터치할 수 있어요',200,720,12,'#c2b7ce');
 }finally{ctx=main;}
}
refreshMobilePlay();
