'use strict';
// Supplied-video reconstruction. See analysis/evil-reference-report.json for limits.
function evilReferencePhase(t){
 const stage=song.stage;
 if(stage==='dad-day1')return {bg:'theatre',dad:'clean-dad',bf:'bf'};
 if(stage==='dad-day2')return {bg:'theatre',dad:t<80?'dearestresist':'dearestcanon',bf:'bf'};
 if(stage==='dad-final')return {bg:'theatre',dad:t<118?'dearestcanon':t<140?'clean-dad':t<192?'dearestresist':'dearestend',bf:t>=68&&t<88?'pico-player':t>=88&&t<118?'spooky-player':t>=118&&t<142?'corruptedmom':'bf',eyes:t>=50};
 if(stage==='soul-day1')return {bg:'TormentorBG',tv:true};
 if(stage==='soul-day2')return {bg:t<160?'NeurosesBG':'background',tv:t<160,hideSoul:t>=160,pulse:t>=45&&t<160};
 if(stage==='soul-final')return {bg:'background',hideSoul:t<91,guitar:(t>=96&&t<113)||(t>=151&&t<173)||(t>=211&&t<268)||(t>=298&&t<316),portal:t>=211&&t<268};
 return {bg:'sky',flying:t>=62,tilt:(t>=12&&t<30)||(t>=68&&t<95)};
}
function evilReferenceLayers(t){const phase=evilReferencePhase(t);return phase.bg==='theatre'?[{key:'evil-reference/bg/stagewall',x:0,y:0,w:1120,h:530},{key:'evil-reference/bg/stage',x:0,y:385,w:1120,h:145},{key:'evil-reference/bg/curtains',x:0,y:0,w:1120,h:530}]:[{key:'evil-reference/bg/'+phase.bg,x:0,y:0,w:1120,h:530}];}
function evilCapturePose(side,t,guitar=false){
 const a=actors[side]||{},active=a.lane>=0&&t<a.until;
 return {key:active?'sing'+['LEFT','DOWN','UP','RIGHT'][a.lane]:'idle',active,age:Math.max(0,t-(a.at||0)),guitar};
}
function drawEvilCapture(side,name,t,x,y,height){
 const asset=EXTRA_ART.sprites['evil-reference/pose/'+name];if(!asset)return false;
 const pose=evilCapturePose(side,t,name.startsWith('guitar-')),index=pose.active?actors[side].lane+1:0;
 const f=asset.animations[pose.key]?.[0],im=modImages.get(asset.src);if(!f||!im)return false;
 const idle=asset.poseBounds[0],bounds=asset.poseBounds[index],scale=height/(idle[3]-idle[1]);
 // All poses share one scale and a fixed foot anchor; down poses stay shorter.
 const bob=pose.active?Math.sin(t/BEAT*Math.PI*2)*2:Math.sin(t/BEAT*Math.PI*2)*3;
 ctx.save();ctx.translate(x,y+bob);ctx.scale(scale,scale);
 ctx.drawImage(im,f.x,f.y,f.w,f.h,-(bounds[0]+bounds[2])/2,-bounds[3],f.w,f.h);ctx.restore();return true;
}
function evilGuitarFor(side,t){
 if(song.stage!=='soul-final'||t<95||t>=326)return false;
 const a=actors[side]||{};
 if(t<a.until)return !!a.captureGuitar;
 if(side==='nova')return true;
 return (t<114)||(t>=151.5&&t<171.3)||(t>=298&&t<313);
}
function drawEvilReferenceStage(t){
 if(!extraState||extraState.id!==songId)extraReset();const p=evilReferencePhase(t);ctx.save();
 if(p.tilt&&!song.lowSpec){ctx.translate(560,265);ctx.rotate(-.13);ctx.scale(1.16,1.16);ctx.translate(-560,-265);}
 for(const layer of evilReferenceLayers(t)){extraSprite(layer.key,t,layer.x,layer.y,layer.w,layer.h);if(layer.key.endsWith('/stagewall')&&song.stage!=='dad-final'){const g=ctx.createRadialGradient(570,210,160,570,210,360);g.addColorStop(0,'#21162b');g.addColorStop(.7,'#21162b');g.addColorStop(1,'#21162b00');ctx.fillStyle=g;ctx.fillRect(150,0,850,450);}}
 const draw=(side,key,x,y,scale=1)=>{extraState.chars[side]='evil-reference:'+key;const base=key.startsWith('dearest')||key==='clean-dad'?380:key==='bf'||key==='pico-player'||key==='spooky-player'||key==='corruptedmom'?230:260;if(drawEvilCapture(side,key,t,x,y,base*scale))return;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);extraActor(side,t,0,0);ctx.restore();};
 if(p.bg==='theatre'){if(p.eyes&&!song.lowSpec){ctx.save();ctx.globalCompositeOperation='screen';extraSprite('evil-reference/bg/eyes',t,0,0,1120,530);ctx.restore();}draw('nova',p.dad,270,485);draw('echo',p.bf,820,490,p.bf==='corruptedmom'?340/230:p.bf==='spooky-player'?260/230:1);}
 else{
  if(p.tv){draw('gf','tv',560,255,.85);}
  if(p.portal&&!song.lowSpec){const g=ctx.createRadialGradient(820,310,20,820,310,220);g.addColorStop(0,'#050010');g.addColorStop(.7,'#6500b088');g.addColorStop(1,'#52009a00');ctx.fillStyle=g;ctx.fillRect(580,70,500,460);}
  const bob=p.flying&&!song.lowSpec?Math.sin(t*2)*14:0;
  if(!p.hideSoul){if(evilGuitarFor('nova',t))drawEvilCapture('nova','guitar-nova',t,280,445+bob,325);else draw('nova','soul',280,445+bob,1.25);}
  if(p.bg==='sky'&&!p.flying)extraSprite('evil-reference/bg/platform',0,675,430,300,100);
  if(evilGuitarFor('echo',t))drawEvilCapture('echo','guitar-echo',t,820,490-bob,221);else draw('echo','bf-default',820,490-bob,.85);
  if(p.pulse&&!song.lowSpec){ctx.strokeStyle='#4a082c';ctx.lineWidth=12;ctx.globalAlpha=.25+.1*Math.sin(t*7);ctx.strokeRect(5,5,1110,520);ctx.globalAlpha=1;}
 }
 ctx.restore();
}

function drawEvilReferenceNote(note,x,y,tail){if(song.pack!=='evil-reference')return false;if(note.duration){ctx.strokeStyle='#8aa9b2';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,tail);ctx.stroke();}stageArrow(x,y,note.lane,36,'#8aa9b2',false,time());return true;}
