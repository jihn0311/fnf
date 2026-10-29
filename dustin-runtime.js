'use strict';
function dustinLayers(){return MOD_ART.scenes[song.sceneKey].spriteKeys.map(key=>({key,x:0,y:0,w:1120,h:530}));}
function dustinReset(){extraState.dustinLines=[...MOD_ART.scenes[song.sceneKey].dustinLines];extraState.dustinActive=0;}
function dustinCharacterEvent(e){const i=Number(e.v1);extraState.dustinLines[i]=e.v2;if(i===song.dustinPlayerLine)extraState.chars.echo=e.v2;else if(i===extraState.dustinActive)extraState.chars.nova=e.v2;const scene=MOD_ART.scenes[song.sceneKey];if(scene.spectator===scene.dustinLines[i])extraState.chars.gf=e.v2;}
function dustinNote(note,side){const i=note.dustinLine,key=extraState.dustinLines?.[i];if(key){extraState.chars[side]=key;if(side==='nova')extraState.dustinActive=i;}}
function drawDustinActors(t){if(extraState.chars.gf)extraActor('gf',t,560,365);extraActor('nova',t,280,470);extraActor('echo',t,850,470);}
function drawDustinStage(t){for(const l of dustinLayers())extraSprite(l.key,0,l.x,l.y,l.w,l.h);drawDustinActors(t);}
