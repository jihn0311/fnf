'use strict';
let galaxyMotion=null;
function galaxyMotionActive(){return song.pack==='galaxy'&&!song.lowSpec&&settings.difficulty!=='easy'&&['galaxy-cona','galaxy-underworld','galaxy-cyber'].includes(songId);}
function galaxyNativeObject(lane,player,down){return {ID:lane,noteData:lane,mustPress:player,x:(player?690:50)+lane*112,y:down?550:50,angle:0,alpha:1,width:112,height:112,frameWidth:160,frameHeight:160,scale:{x:.7,y:.7},offset:{x:0,y:0},animation:{curAnim:{name:'note'}},isSustainNote:false,updateHitbox(){this.width=160*this.scale.x;this.height=160*this.scale.y;},setGraphicSize(w){this.scale.x=this.scale.y=w/160;this.updateHitbox();}};}
function resetGalaxyMotion(){
 const down=settings.scroll==='down',sy=down?550:50,env={};
 env.Conductor={songPosition:0,stepCrochet:15000/song.bpm};env.Std={int:Math.trunc};env.FlxMath={roundDecimal:(v,n)=>Math.round(v*10**n)/10**n,fastSin:Math.sin,fastCos:Math.cos};
 let seed=12345;env.FlxG={width:1280,height:720,fullscreen:false,save:{data:{downscroll:down}},random:{int:(a,b)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return a+seed%(b-a+1);}}};
 env.PlayState={SONG:{speed:song.originalSpeed*settings.speed/2.5},defaultCamZoom:1};
 env.PlayMoving={sy,xlist:[50,162,274,386],oxlist:[50,162,274,386],pxlist:[690,802,914,1026],poxlist:[690,802,914,1026],ylist:[sy,sy,sy,sy],pylist:[sy,sy,sy,sy],stage:[1280,720]};
 env.Lib={application:{window:{x:0,y:0,width:1280,height:720}}};env.PlayWindow={stage:[1280,720],res:[0,0,1280,720],pos:[0,0],camz:1,reset(){Object.assign(env.Lib.application.window,{x:0,y:0,width:1280,height:720});}};
 env.Note={swagWidth:112,noteWidth:[160,160,160,160],noteHeight:[160,160,160,160]};env.NoteObject={toScreen:(x,y,z)=>[640+(x-640)*200/(Math.abs(z)<.01?.01:z),360+(y-360)*200/(Math.abs(z)<.01?.01:z)]};
 env.RenderPath=class{};env.FixedScaleMode=class{};env.RatioScaleMode=class{};
 galaxyMotion={key:songId+'|'+settings.scroll+'|'+settings.speed,env,native:GALAXY_NATIVE[songId.replace('galaxy-','')](env),frame:-1,at:-1,line:{y:sy},camera:{x:0},receptors:Array.from({length:8},(_,i)=>galaxyNativeObject(i%4,i>=4,down))};
}
function updateGalaxyMotion(t){
 if(!galaxyMotionActive())return null;const key=songId+'|'+settings.scroll+'|'+settings.speed;
 if(!galaxyMotion||galaxyMotion.key!==key||t<galaxyMotion.at)resetGalaxyMotion();const s=galaxyMotion,target=Math.floor(Math.max(0,t)*60);
 // Fixed song-time steps preserve native state across low frame rates and seeks.
 for(;s.frame<target;){s.frame++;s.env.Conductor.songPosition=s.frame*1000/60;s.native.move?.(s.camera);for(const receptor of s.receptors){s.native.spos?.(receptor,s.line);if(receptor.mustPress)s.native.pspos?.(receptor,s.line);receptor.updateHitbox();}}
 s.env.Conductor.songPosition=t*1000;s.at=t;return s;
}
function galaxyNotePoint(note,side,t,at=note.time){
 const s=galaxyMotion,n=galaxyNativeObject(note.lane,side==='echo',settings.scroll==='down');n.strumTime=at*1000;n.angle=0;n.tooLate=t>at+.2;n.wasGoodHit=false;
 s.native.pos(n,s.line);if(n.angle===5)n.angle=(t*300)%360;if(at>t&&s.native.show?.(n))n.alpha=0;
 return {x:(n.x+n.width/2)*.875,y:(n.y+n.height/2)*530/720,size:Math.min(100,Math.max(2,n.width*.32)),alpha:Math.max(0,Math.min(1,n.alpha)),angle:n.angle*Math.PI/180};
}
function galaxyArrow(point,lane,lit,t,note=true){
 if(!Number.isFinite(point.x+point.y+point.size)||point.alpha<=0)return;
 ctx.save();ctx.globalAlpha*=point.alpha;ctx.translate(point.x,point.y);ctx.rotate(point.angle||0);
 if(galaxyDarkPhase(t)&&typeof GALAXY_PURPLE_SKIN!=='undefined'){
 const skin=GALAXY_PURPLE_SKIN,f=skin.frames[lane][note?'note':lit?'confirm':'idle'],im=modImages.get(skin.src);
 if(im){const scale=point.size*2/Math.max(f.w,f.h);ctx.drawImage(im,f.x,f.y,f.w,f.h,-f.w*scale/2,-f.h*scale/2,f.w*scale,f.h*scale);ctx.restore();return;}
 }
 stageArrow(0,0,lane,point.size,note||lit?COLORS[lane]:'#aab7cd',note,t);ctx.restore();
}
function drawGalaxyNotes(t){
 const s=updateGalaxyMotion(t);if(!s)return false;ctx.save();ctx.beginPath();ctx.rect(0,0,1120,530);ctx.clip();
 for(const side of ['nova','echo']){
 const chart=side===autoSide()?opponentNotes:notes;
 for(let lane=0;lane<4;lane++){const r=s.receptors[(side==='echo'?4:0)+lane];const lit=side===playerSide()&&(laneHeld(lane)||flashes[lane]>t);galaxyArrow({x:(r.x+r.width/2)*.875,y:(r.y+r.height/2)*530/720,size:Math.max(2,r.width*.32),alpha:r.alpha,angle:r.angle*Math.PI/180},lane,lit,t,false);}
 const horizon=t+Math.min(24,12/Math.max(.1,settings.speed));
 for(let i=chartStart(chart);i<chart.length;i++){const note=chart[i];if(note.time>horizon)break;if(note.done)continue;
 const holding=side===autoSide()?note.started:note.holding,begin=holding?Math.max(t,note.time):note.time,end=note.time+(note.duration||0);
 if(note.duration&&end>begin){ctx.save();ctx.strokeStyle=galaxyDarkPhase(t)?'#a000ef':COLORS[note.lane];ctx.lineWidth=18;ctx.globalAlpha*=.65;ctx.beginPath();const segments=Math.min(32,Math.max(2,Math.ceil((end-begin)*12)));let pen=false;for(let j=0;j<=segments;j++){const point=galaxyNotePoint(note,side,t,begin+(end-begin)*j/segments);if(!Number.isFinite(point.x+point.y)||Math.abs(point.x)>4000||Math.abs(point.y)>4000){pen=false;continue;}if(pen)ctx.lineTo(point.x,point.y);else{ctx.moveTo(point.x,point.y);pen=true;}}ctx.stroke();ctx.restore();}
 const point=galaxyNotePoint(note,side,t,begin);if(point.x>=-120&&point.x<=1240&&point.y>=-120&&point.y<=650)galaxyArrow(point,note.lane,false,t);
 }
 }
 ctx.restore();return true;
}
let galaxyWindowCanvas=null;
function drawGalaxyWindow(t){
 if(!galaxyMotionActive()||songId!=='galaxy-cyber'||!galaxyMotion)return;
 const w=galaxyMotion.env.Lib.application.window;const scale=Math.max(.4,Math.min(1,w.width/1280));if(scale>=.999)return;
 galaxyWindowCanvas??=Object.assign(document.createElement('canvas'),{width:1120,height:530});const c=galaxyWindowCanvas.getContext('2d');c.clearRect(0,0,1120,530);c.drawImage(canvas,0,0,1120,530);
 const width=1120*scale,height=530*scale,x=Math.max(0,Math.min(1120-width,w.x*.875)),y=Math.max(0,Math.min(530-height,w.y*530/720));ctx.save();ctx.setTransform(canvas.width/1120,0,0,canvas.height/530,0,0);ctx.fillStyle='#080810';ctx.fillRect(0,0,1120,530);ctx.drawImage(galaxyWindowCanvas,x,y,width,height);ctx.restore();
}
