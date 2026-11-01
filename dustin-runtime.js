'use strict';
function dustinPixel(){return songId==='dustin-perseverance'&&extraState?.chars.nova==='dustin:sans_pixel';}
function dustinLayers(){return [dustinPixel()?'dustin/pixel-hall':MOD_ART.scenes[song.sceneKey].spriteKeys[0]].map(key=>({key,x:0,y:0,w:1120,h:530}));}
function dustinReset(){if(typeof resetDustinEffects==='function')resetDustinEffects();extraState.dustinLines=[...MOD_ART.scenes[song.sceneKey].dustinLines];extraState.dustinActive=0;extraState.dustinActors={};}
function dustinCharacterEvent(e){const i=Number(e.v1);extraState.dustinLines[i]=e.v2;if(i===song.dustinPlayerLine)extraState.chars.echo=e.v2;else if(i===extraState.dustinActive)extraState.chars.nova=e.v2;const scene=MOD_ART.scenes[song.sceneKey];if(scene.spectator===scene.dustinLines[i])extraState.chars.gf=e.v2;}
function dustinNote(note,side){if(typeof dustinOnNote==='function')dustinOnNote(note,side);const i=note.dustinLine,key=extraState.dustinLines?.[i];if(songId==='dustin-heatwave'&&!song.lowSpec){extraState.dustinActors[i]={...actors[side]};if(i===2)return;}if(key){extraState.chars[side]=key;if(side==='nova')extraState.dustinActive=i;}}
function drawDustinActors(t,onlySide=null){
 if(dustinPixel()){ctx.save();ctx.translate(560,450);ctx.scale(.8,.8);extraActor('nova',t,0,0);ctx.restore();return;}
 const scene=MOD_ART.scenes[song.sceneKey],v=scene.dustinView;
 for(const side of ['gf','nova','echo']){if(onlySide&&onlySide!==side)continue;const key=extraState.chars[side];if(!key)continue;const i=side==='echo'?song.dustinPlayerLine:side==='nova'?extraState.dustinActive:scene.dustinLines.indexOf(scene.spectator),p=v?.slots[i]?.[key],a=typeof dustinEffectCharacter==='function'?dustinEffectCharacter(key):MOD_ART.characters[key];if(!a||p?.hidden)continue;
 if(!p){extraActor(side,t,side==='nova'?280:side==='echo'?850:560,side==='gf'?365:470);continue;}
 ctx.save();const attackOffset=typeof dustinAttackOffset==='function'?dustinAttackOffset(side,t,v.scale):{x:0,y:0};ctx.translate((p.x-v.left)*v.scale+attackOffset.x+(song.sceneKey==='dustin-broken-reality'&&side==='echo'?70:0),(p.y-v.top)*v.scale+attackOffset.y);const z=p.z*v.scale/a.scale;ctx.scale(z,z);const savedActor=actors[side];if(songId==='dustin-heatwave'&&!song.lowSpec)actors[side]=extraState.dustinActors[i]||{lane:-1,until:-1};try{extraActor(side,t,0,0);}finally{actors[side]=savedActor;ctx.restore();}
 }
}
function drawDustinStage(t){if(typeof drawDustinNativeStage==='function'&&drawDustinNativeStage(t))return;for(const l of dustinLayers())extraSprite(l.key,0,l.x,l.y,l.w,l.h);drawDustinActors(t);}
