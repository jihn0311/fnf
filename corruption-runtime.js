"use strict";
let corruptionVideo=null,corruptionVideoURL=null;
async function prepareCorruptionVideo(){
 if(corruptionVideo){corruptionVideo.pause();corruptionVideo.removeAttribute('src');corruptionVideo.load();corruptionVideo=null;}
 if(corruptionVideoURL){URL.revokeObjectURL(corruptionVideoURL);corruptionVideoURL=null;}
 if(song.pack!=='corruption'||!song.corruptionVideo)return;
 const response=await fetch(song.corruptionVideo);if(!response.ok)throw Error('Corruption 오프닝 다운로드 실패');corruptionVideoURL=URL.createObjectURL(await response.blob());
 const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';video.src=corruptionVideoURL;
 await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=()=>reject(Error('Corruption 오프닝 영상 로드 실패'));});
 corruptionVideo=video;
}
function corruptionLayers(){return [{key:'corruption/stage/'+(extraState?.corruptionBackground||song.stage),x:0,y:0,w:1120,h:530}];}
function drawCorruptionStage(t){
 if(song.corruptionVideo){
  rect(0,0,1120,530,'#000');const v=corruptionVideo;
  if(v){const at=Math.max(0,Math.min(t,v.duration-.05));v.playbackRate=Math.min(16,settings.rate||1);if(Math.abs(v.currentTime-at)>.25&&!v.seeking)v.currentTime=at;if(state==='playing'&&t>=0&&t<v.duration){if(v.paused)v.play().catch(()=>{});}else if(!v.paused)v.pause();if(v.readyState>=2)ctx.drawImage(v,0,0,1120,530);}
  return;
 }
 for(const l of corruptionLayers())extraSprite(l.key,0,l.x,l.y,l.w,l.h);
 const blood=song.corruptionSlug==='bloodlust';
 extraActor('nova',t,blood?820:300,455);extraActor('echo',t,blood?290:820,455);
}
