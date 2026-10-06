'use strict';
// Sonic.exe 2.0 PlayState.stepHit: swaps are musical-step events, not note singer IDs.
// Reference: https://github.com/FlexMasterOfficial/Sonic.exe-source-2.0/blob/main/source/PlayState.hx
let tripleUiKey='';
function tripleActive(){return songId==='sonic-triple-trouble'&&!!song.visualTimelineByDifficulty;}
function tripleTimeline(){return song.visualTimelineByDifficulty?.[settings.difficulty]||[];}
function triplePhase(t){const list=tripleTimeline();let phase=list[0];for(const next of list){if(next.time>t+1e-8)break;phase=next;}return phase;}
function tripleStep(t){const map=song.tempoMapByDifficulty?.[settings.difficulty]||[{time:0,step:0,bpm:song.bpm}];let tempo=map[0];for(const next of map){if(next.time>t)break;tempo=next;}return tempo.step+(t-tempo.time)*tempo.bpm/15;}
function tripleTime(step){const map=song.tempoMapByDifficulty?.[settings.difficulty]||[{time:0,step:0,bpm:song.bpm}];let tempo=map[0];for(const next of map){if(next.step>step)break;tempo=next;}return tempo.time+(step-tempo.step)*15/tempo.bpm;}
function tripleSwap(t=time()){
 if(!tripleActive()||state==='ready')return 0;
 const list=tripleTimeline(),enter=list.find(p=>p.step===1296).time,leave=list.find(p=>p.step===2823).time;
 const ease=v=>1-(1-Math.max(0,Math.min(1,v)))**4;
 return t<enter?0:t<leave?ease((t-enter)/5):1-ease((t-leave)/5);
}
const tripleNames={Tails:'TAILS',Beast:'XENOPHANES',KnucklesEXE:'KNUCKLES',eggman_soul:'EGGMAN'};
function tripleSync(t,force=false){
 if(!tripleActive()){tripleUiKey='';return;}
 const p=triplePhase(t),key=settings.difficulty+':'+p.step;if(!force&&key===tripleUiKey)return;tripleUiKey=key;
 const name=$('opponent-name'),player=$('player-name');if(name)name.textContent=tripleNames[p.opponent];if(player)player.textContent='BOYFRIEND';
 for(const [id,char] of [['enemy-avatar',p.opponent],['player-avatar',p.player]]){const node=$(id);if(node){node.textContent='';node.style.backgroundImage='url("'+MOD_ART.characters[char].icon+'")';}}
 if($('mod-help'))$('mod-help').textContent='Triple Trouble · 6구간 캐릭터/BF 시점 전환 · 너클즈 구간부터 내 레인이 왼쪽, 에그맨 구간에서 오른쪽으로 복귀 · 링 SPACE';
}
const tripleOffsets={
 Tails:{idle:[0,0],up:[29,49],right:[14,-16],left:[158,-14],down:[33,-60]},
 KnucklesEXE:{idle:[0,0],right:[-59,-65],left:[124,-59],up:[29,49],down:[26,-95]},
 eggman_soul:{idle:[-5,5],up:[110,231],right:[40,174],left:[237,97],down:[49,-95],laugh:[-10,210]},
 Beast:{idle:[-18,70],up:[22,143],right:[-260,11],left:[177,-24],down:[-15,-57],laugh:[-78,-128]},
 beastLeft:{idle:[-13,79],up:[11,156],right:[451,24],left:[174,-13],down:[4,-15],laugh:[103,-144]},
 BFPhase3_Perspective:{idle:[5,4],up:[23,63],left:[31,9],right:[-75,-15],down:[-51,-1]},
 BFPhase3_Perspective_Flipped:{idle:[46,-12],up:[-22,41],right:[29,9],left:[96,-12],down:[74,-14]},
 BOYFRIEND:{idle:[-5,0],up:[-29,27],right:[-38,-7],left:[12,-6],down:[-10,-50]},
 bfLeft:{idle:[0,-2],up:[10,27],right:[44,-7],left:[-22,-7],down:[-13,-52]}
};
function tripleActor(name,side,t,x,y,flip,p){
 const sheet=MOD_ART.characters[name],im=modImages.get(sheet.src);if(!im)return;
 const a=actors[side],singing=t<a.until&&(a.at??-Infinity)>=p.time;
 let key=singing?['left','down','up','right'][a.lane]:'idle',elapsed=singing?t-a.at:Math.max(0,t);
 const offsets=tripleOffsets[name==='Beast'&&flip?'beastLeft':name==='BOYFRIEND'&&flip?'bfLeft':name];
 let offset=offsets[key]||[0,0];
 if((name==='BFPhase3_Perspective'||name==='KnucklesEXE')&&(key==='left'||key==='right'))key=key==='left'?'right':'left';
 if(singing&&a.miss&&sheet.animations[key+'Miss'])key+='Miss';
 let fps=24;
 if(name==='eggman_soul')for(const [begin,end] of [[2887,2895],[3015,3023],[4039,4048]])if(t>=tripleTime(begin)&&t<tripleTime(end)){key='laugh';offset=offsets.laugh;elapsed=t-tripleTime(begin);fps=35;}
 const frames=sheet.animations[key]||sheet.animations.idle,f=frames[key==='idle'?Math.floor(Math.max(0,elapsed)*fps)%frames.length:Math.min(frames.length-1,Math.floor(Math.max(0,elapsed)*fps))];
 const scale=sheet.sourceScale||1;
 ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(im,f.x,f.y,f.w,f.h,-f.fw/2+f.ox-offset[0]*scale,-f.fh+f.oy-offset[1]*scale,f.w,f.h);ctx.restore();
}
function drawTripleStage(t){
 const p=triplePhase(t);tripleSync(t);
 ctx.save();const beat=tripleStep(t)/4,zoom=1+Math.max(0,Math.cos(beat*Math.PI*2))*.008;ctx.translate(560,265);ctx.scale(zoom,zoom);ctx.translate(-560,-265);
 for(const path of MOD_ART.backgrounds['triple-trouble']){const im=modImages.get(path);if(im)ctx.drawImage(im,0,0,1120,530);}
 if(p.opponent==='Beast'){
  ctx.save();ctx.globalAlpha=.13;for(let i=0;i<35;i++)rect(0,(i*23+Math.floor(t*70))%530,1120,2,i%2?'#fff':'#9631b9');ctx.restore();
 }
 tripleActor(p.opponent,'nova',t,p.swap?835:285,475,p.enemyFlip,p);
 tripleActor(p.player,'echo',t,p.swap?285:835,475,p.playerFlip,p);ctx.restore();
 const swap=tripleSwap(t);label(tripleNames[p.opponent]+' / AUTO',265+580*swap,508,12,'#f58bc6');label('BOYFRIEND / YOU',845-580*swap,508,12,'#8cf5d9');
}
