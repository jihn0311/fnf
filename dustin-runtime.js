'use strict';
function dustinPixel(){return songId==='dustin-perseverance'&&extraState?.chars.nova==='dustin:sans_pixel';}
function dustinLayers(){return [dustinPixel()?'dustin/pixel-hall':MOD_ART.scenes[song.sceneKey].spriteKeys[0]].map(key=>({key,x:0,y:0,w:1120,h:530}));}
function dustinReset(){if(typeof resetDustinEffects==='function')resetDustinEffects();extraState.dustinLines=[...MOD_ART.scenes[song.sceneKey].dustinLines];extraState.dustinActive=0;extraState.dustinActors={};extraState.brPhantomLead=false;extraState.brLeadCharacter=null;}
function dustinCharacterEvent(e){const i=Number(e.v1);if(song.sceneKey==='dustin-broken-reality'&&i===0){extraState.brPhantomLead=e.v2.includes('phantom_paps');if(extraState.brPhantomLead){extraState.brLeadCharacter=e.v2;return;}}extraState.dustinLines[i]=e.v2;if(i===song.dustinPlayerLine)extraState.chars.echo=e.v2;else if(i===extraState.dustinActive)extraState.chars.nova=e.v2;const scene=MOD_ART.scenes[song.sceneKey];if(scene.spectator===scene.dustinLines[i])extraState.chars.gf=e.v2;}
function dustinNote(note,side){if(dustinEnsemble()){extraState.dustinActors[note.dustinLine]={...actors[side]};for(const [i,line] of dustinEnsemble().entries()){if((line.type===1?'echo':line.type===2?'gf':'nova')!==side)continue;const pose=dustinEnsemblePose(line,note.time+.00001);if(Math.abs(pose.at-note.time)<.0001&&pose.lane===note.lane)extraState.dustinActors[i]={...actors[side]};}if(typeof dustinOnNote==='function')dustinOnNote(note,side);return;}if(typeof dustinOnNote==='function')dustinOnNote(note,side);const i=note.dustinLine,key=extraState.dustinLines?.[i];if(song.sceneKey==='dustin-broken-reality'&&extraState.brPhantomLead&&i===0){extraState.dustinActors[3]={...actors[side]};return;}if(songId==='dustin-heatwave'&&!song.lowSpec||song.sceneKey==='dustin-broken-reality'){extraState.dustinActors[i]={...actors[side]};if(song.sceneKey==='dustin-broken-reality'?i===3:i===2)return;}if(key){extraState.chars[side]=key;if(side==='nova')extraState.dustinActive=i;}}
function drawDustinActors(t,onlySide=null){
 if(dustinEnsemble()){drawDustinEnsemble(t,onlySide);return;}
 if(dustinPixel()){ctx.save();ctx.translate(560,450);ctx.scale(.8,.8);extraActor('nova',t,0,0);ctx.restore();return;}
 const scene=MOD_ART.scenes[song.sceneKey],v=scene.dustinView;
 for(const side of ['gf','nova','echo']){if(onlySide&&onlySide!==side)continue;if(song.sceneKey==='dustin-broken-reality'&&side==='nova'&&extraState.brPhantomLead&&dustinFull())continue;const key=extraState.chars[side];if(!key)continue;const i=side==='echo'?song.dustinPlayerLine:side==='nova'?extraState.dustinActive:scene.dustinLines.indexOf(scene.spectator),p=v?.slots[i]?.[key],a=typeof dustinEffectCharacter==='function'?dustinEffectCharacter(key):MOD_ART.characters[key];if(!a||p?.hidden)continue;
 if(!p){extraActor(side,t,side==='nova'?280:side==='echo'?850:560,side==='gf'?365:470);continue;}
 const ghost=dustinPerseveranceGhost(side,t);if(ghost.alpha<=0)continue;ctx.save();ctx.globalAlpha*=ghost.alpha;ctx.translate(ghost.x*v.scale,ghost.y*v.scale);const attackOffset=typeof dustinAttackOffset==='function'?dustinAttackOffset(side,t,v.scale):{x:0,y:0};ctx.translate((p.x-v.left)*v.scale+attackOffset.x+(song.sceneKey==='dustin-broken-reality'&&side==='echo'?70:0),(p.y-v.top)*v.scale+attackOffset.y);const z=p.z*v.scale/a.scale;ctx.scale(z,z);const savedActor=actors[side];if(songId==='dustin-heatwave'&&!song.lowSpec||song.sceneKey==='dustin-broken-reality')actors[side]=extraState.dustinActors[i]||{lane:-1,until:-1};try{extraActor(side,t,0,0);}finally{actors[side]=savedActor;ctx.restore();}
 }
}
function drawDustinStage(t){if(typeof drawDustinNativeStage==='function'&&drawDustinNativeStage(t))return;for(const l of dustinLayers())extraSprite(l.key,0,l.x,l.y,l.w,l.h);drawDustinActors(t);}

// Keep each singer attached to its source strum line, including spectator vocals.
function dustinEnsemble(){return typeof DUSTIN_ENSEMBLE!=='undefined'&&DUSTIN_ENSEMBLE[song.sceneKey]?.[settings.difficulty];}
function dustinEnsemblePose(line,t){
 const notes=line.notes;let lo=0,hi=notes.length;
 while(lo<hi){const mid=(lo+hi)>>>1;if(notes[mid][0]<=t)lo=mid+1;else hi=mid;}
 if(!lo)return {lane:-1,until:-1};const [at,lane,duration]=notes[lo-1];return {lane,at,until:at+Math.max(.2,duration),sustainUntil:duration>0?at+duration:-1};
}
function drawDustinEnsemble(t,onlySide){
 const lines=dustinEnsemble(),scene=MOD_ART.scenes[song.sceneKey],v=scene.dustinView;
 for(const i of [...lines.keys()].sort((a,b)=>(lines[a].type===2?-2:song.sceneKey==='dustin-the-uprising'&&a===6?-1:0)-(lines[b].type===2?-2:song.sceneKey==='dustin-the-uprising'&&b===6?-1:0))){
 const line=lines[i],side=line.type===1?'echo':line.type===2?'gf':'nova';if(onlySide&&onlySide!==side)continue;
 const key=extraState.dustinLines[i];if(song.sceneKey==='dustin-cornered'&&key?.includes('undyne')&&extraState.dustinLines[0]?.includes('phantom_paps'))continue;const p=v.slots[i]?.[key],a=dustinEffectCharacter(key);if(!a||!p||p.hidden)continue;const presentation=dustinUprisingPresentation(i,t);if(presentation.alpha<=0)continue;
 const oldKey=extraState.chars[side],oldActor=actors[side];extraState.chars[side]=key;
 actors[side]=side===playerSide()?extraState.dustinActors[i]||{lane:-1,until:-1}:dustinEnsemblePose(line,t);
 const placement=dustinEnsemblePlacement(key,p);ctx.save();ctx.globalAlpha*=presentation.alpha;ctx.translate((placement.x+presentation.x-v.left)*v.scale,(placement.y+presentation.y-v.top)*v.scale);const z=p.z*v.scale/a.scale;ctx.scale(z,z);
 try{extraActor(side,t,0,0);}finally{ctx.restore();extraState.chars[side]=oldKey;actors[side]=oldActor;}
 }
}

// Cornered reference video: Undyne stands centrally behind the foreground bones.
// Use one offset for every form so transformations do not jump between anchors.
function dustinEnsemblePlacement(key,p){return song.sceneKey==='dustin-cornered'&&key?.startsWith('dustin:undyne')?{...p,x:p.x-140,y:p.y-70}:p;}

// Source: data/stages/surface.hx stepHit; evaluated from song time for seeks/restarts.
function dustinUprisingPresentation(i,t){
 if(song.sceneKey!=='dustin-the-uprising')return {alpha:1,x:0,y:0};
 const cues=i===2?[[1336,1,0]]:i===6?[[696,.9,3],[960,0,5],[1122,.5,.5],[1152,0,1],[2106,.9,2],[2232,0,1]]:i===5?[[400,.9,1],[1322,0,.5],[1600,.75,3],[2356,0,.7]]:i===3||i===4?[[400,.9,1],[2356,0,.7]]:[];
 let alpha=i>=2?0:1,from=alpha,at=0,duration=0,target=alpha;
 const value=time=>{const q=duration?clamp01((time-at)/duration):1,e=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;return from+(target-from)*e;};
 for(const [step,next,seconds] of cues){const start=dustinStepTime(step);if(t<start)break;alpha=value(start);from=alpha;target=next;at=start;duration=seconds;}
 alpha=value(t);const rise=i===5?clamp01((t-dustinStepTime(1600))/3):0;
 return {alpha,x:i===6?-400:0,y:i===6?-100:-300*rise};
}

function dustinPerseveranceGhost(side,t){
 if(song.sceneKey!=='dustin-perseverance'||side!=='gf')return {alpha:1,x:0,y:0};
 const start=dustinStepTime(2280),end=dustinStepTime(2288),q=clamp01((t-start)/(end-start));
 return {alpha:(.7+Math.sin(t)*.04)*.7*(1-(1-q)*(1-q)),x:Math.sin(t)*24,y:Math.sin(t*2)*6};
}
