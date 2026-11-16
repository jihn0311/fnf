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
function drawEvilReferenceStage(t){
 if(!extraState||extraState.id!==songId)extraReset();const p=evilReferencePhase(t);ctx.save();
 if(p.tilt&&!song.lowSpec){ctx.translate(560,265);ctx.rotate(-.13);ctx.scale(1.16,1.16);ctx.translate(-560,-265);}
 for(const layer of evilReferenceLayers(t)){extraSprite(layer.key,t,layer.x,layer.y,layer.w,layer.h);if(layer.key.endsWith('/stagewall')&&song.stage!=='dad-final'){const g=ctx.createRadialGradient(570,210,160,570,210,360);g.addColorStop(0,'#21162b');g.addColorStop(.7,'#21162b');g.addColorStop(1,'#21162b00');ctx.fillStyle=g;ctx.fillRect(150,0,850,450);}}
 const draw=(side,key,x,y,scale=1)=>{extraState.chars[side]='evil-reference:'+key;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);extraActor(side,t,0,0);ctx.restore();};
 if(p.bg==='theatre'){if(p.eyes&&!song.lowSpec){ctx.save();ctx.globalCompositeOperation='screen';extraSprite('evil-reference/bg/eyes',t,0,0,1120,530);ctx.restore();}draw('nova',p.dad,270,485);draw('echo',p.bf,820,490);}
 else{
  if(p.tv){draw('gf','tv',560,255,.85);}
  if(p.portal&&!song.lowSpec){const g=ctx.createRadialGradient(820,310,20,820,310,220);g.addColorStop(0,'#050010');g.addColorStop(.7,'#6500b088');g.addColorStop(1,'#52009a00');ctx.fillStyle=g;ctx.fillRect(580,70,500,460);}
  if(p.guitar){const start=t>=298?298:t>=211?211:t>=151?151:96;for(const side of ['nova','echo'])extraSprite('evil-reference/capture/'+side,t-start,0,0,1120,530,'idle',12,true);}
  else{const bob=p.flying&&!song.lowSpec?Math.sin(t*2)*14:0;if(!p.hideSoul)draw('nova','soul',280,445+bob,1.12);if(p.bg==='sky'&&!p.flying)extraSprite('evil-reference/bg/platform',0,675,430,300,100);draw('echo','bf-default',820,490-bob,.85);}
  if(p.pulse&&!song.lowSpec){ctx.strokeStyle='#4a082c';ctx.lineWidth=12;ctx.globalAlpha=.25+.1*Math.sin(t*7);ctx.strokeRect(5,5,1110,520);ctx.globalAlpha=1;}
 }
 ctx.restore();
}

function drawEvilReferenceNote(note,x,y,tail){if(song.pack!=='evil-reference')return false;if(note.duration){ctx.strokeStyle='#8aa9b2';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,tail);ctx.stroke();}stageArrow(x,y,note.lane,36,'#8aa9b2',false,time());return true;}
