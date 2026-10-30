'use strict';
function dustinPixel(){return songId==='dustin-perseverance'&&extraState?.chars.nova==='dustin:sans_pixel';}
function dustinLayers(){return [dustinPixel()?'dustin/pixel-hall':MOD_ART.scenes[song.sceneKey].spriteKeys[0]].map(key=>({key,x:0,y:0,w:1120,h:530}));}
function dustinReset(){extraState.dustinLines=[...MOD_ART.scenes[song.sceneKey].dustinLines];extraState.dustinActive=0;}
function dustinCharacterEvent(e){const i=Number(e.v1);extraState.dustinLines[i]=e.v2;if(i===song.dustinPlayerLine)extraState.chars.echo=e.v2;else if(i===extraState.dustinActive)extraState.chars.nova=e.v2;const scene=MOD_ART.scenes[song.sceneKey];if(scene.spectator===scene.dustinLines[i])extraState.chars.gf=e.v2;}
function dustinNote(note,side){const i=note.dustinLine,key=extraState.dustinLines?.[i];if(key){extraState.chars[side]=key;if(side==='nova')extraState.dustinActive=i;}}
function drawDustinActors(t){
 if(dustinPixel()){ctx.save();ctx.translate(560,450);ctx.scale(.8,.8);extraActor('nova',t,0,0);ctx.restore();return;}
 const scene=MOD_ART.scenes[song.sceneKey],v=scene.dustinView;
 for(const side of ['gf','nova','echo']){const key=extraState.chars[side];if(!key)continue;const i=side==='echo'?song.dustinPlayerLine:side==='nova'?extraState.dustinActive:scene.dustinLines.indexOf(scene.spectator),p=v?.slots[i]?.[key],a=MOD_ART.characters[key];if(!a||p?.hidden)continue;
 if(!p){extraActor(side,t,side==='nova'?280:side==='echo'?850:560,side==='gf'?365:470);continue;}
 ctx.save();ctx.translate((p.x-v.left)*v.scale,(p.y-v.top)*v.scale);const z=p.z*v.scale/a.scale;ctx.scale(z,z);extraActor(side,t,0,0);ctx.restore();
 }
}
function drawDustinStage(t){for(const l of dustinLayers())extraSprite(l.key,0,l.x,l.y,l.w,l.h);drawDustinActors(t);}
