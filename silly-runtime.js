'use strict';
const sillyVideos=new Map();
async function sillyPrepare(){
 await Promise.all(SILLY_LYRICS.pages.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=async()=>{try{await im.decode();modImages.set(src,im);resolve();}catch(e){reject(e)}};im.onerror=reject;im.src=src;})));
 await Promise.all(MOD_ART.videos['silly-billy'].map(src=>new Promise((resolve,reject)=>{if(sillyVideos.has(src)){resolve();return;}const v=document.createElement('video');v.preload='auto';v.muted=true;v.playsInline=true;v.onloadeddata=()=>{sillyVideos.set(src,v);resolve();};v.onerror=()=>reject(Error('Silly Billy 영상 로드 실패'));v.src=src;v.load();})));
}
function sillyEvent(e,t,quiet){const s=extraState,v=e.value;
 if(e.kind==='PlayAnimation'){const side=v.target==='bf'?'echo':'nova';s.special[side]={name:v.anim,at:e.time};if(v.anim==='shrink')s.alt.nova='-alt';if(v.anim==='unshrink')s.alt.nova='';}
 if(e.kind==='PlayVideo')s.video={src:MOD_ART.videos['silly-billy'][v.path==='open'?0:1],at:e.time};
 if(e.kind==='SetCameraBop'){s.bumpMult=Number(v.intensity)||1;}
 if(e.kind!=='SillyEvents')return;
 switch(Number(v.sillyType)){
 case 0:s.lyricAnimationAt=e.time;break;
 case 2:s.broken=true;s.flashes.push({at:e.time,color:'#fff',alpha:.8,duration:1.75});s.shake={at:e.time,duration:.25,amount:.01};if(!quiet&&state==='playing'&&t-e.time<.2)extraSound('mirror_break');break;
 case 3:s.lyric=v.stringVal||'';break;
 case 4:s.sillyHud=0;break;
 case 5:s.middle=true;s.sillyHud=1;break;
 case 6:case 12:s.black=1;break;
 case 7:if(!quiet&&health>25)health=Math.max(25,health-2.5);break;
 case 9:case 13:s.zoomTween={from:extraZoom(e.time),to:Math.max(.65,Math.min(1.5,extraZoom(e.time)+(Number(v.floatVal)||0)*(Number(v.sillyType)===13?.45:1))),at:e.time,duration:Number(v.floatVal2)||.25};break;
 case 10:s.bumpMult=Number(v.floatVal)||1;break;
 case 11:s.lyricAnimationAt=null;s.middle=false;s.lyric='';break;
 case 14:s.black=0;s.sillyHud=1;break;
 }
}
function sillyStage(t){
 rect(0,0,1120,530,'#151825');extraSprite('silly/bg/Silly_clouds',t);
 extraSprite('silly/bg/'+(extraState.broken?'broken_mirror':'silly_mirror'),t,280,30,560,450);
 for(const key of ['floor','pillar back','pillar front'])extraSprite('silly/bg/'+key,t);
 if(extraState.lyricAnimationAt!=null&&t>=extraState.lyricAnimationAt)sillyLyricActor(t-extraState.lyricAnimationAt);else extraActor('nova',t,325,465);extraActor('echo',t,825,465);
}
function sillyUnderlay(t){
 if(extraState?.black)rect(0,0,1120,530,'#000');
 const active=extraState?.video;for(const [src,v] of sillyVideos){const elapsed=active&&src===active.src?t-active.at:-1;if(songId!=='silly-billy'||elapsed<0||elapsed>=v.duration){if(!v.paused)v.pause();continue;}v.playbackRate=settings.rate||1;if(Math.abs(v.currentTime-elapsed)>.25)v.currentTime=elapsed;if(state==='playing'){if(v.paused)v.play().catch(()=>{});}else if(!v.paused)v.pause();if(v.readyState>=2)ctx.drawImage(v,0,0,1120,530);}
}
function sillyHud(t){
 if(extraState?.lyric){ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=5;label(extraState.lyric,560,410,27,'#fff','serif');ctx.restore();}
}

function sillyLyricActor(elapsed){
 const data=SILLY_LYRICS,frame=data.frames[Math.min(data.frames.length-1,Math.floor(Math.max(0,elapsed)*24))];
 const [left,top,right,bottom]=data.bounds,scale=Math.min(600/(right-left),440/(bottom-top));
 ctx.save();ctx.translate(420-(left+right)*scale/2,475-bottom*scale);ctx.scale(scale,scale);
 for(const [name,matrix] of frame){const [page,x,y,w,h]=data.sprites[name],im=modImages.get(data.pages[page]);if(!im)continue;ctx.save();ctx.transform(...matrix);ctx.drawImage(im,x,y,w,h,0,0,w,h);ctx.restore();}ctx.restore();
}
