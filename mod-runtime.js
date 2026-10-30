'use strict';
// Web adaptation: original art/notes, deterministic local-clock effects.
const modImages=new Map();
let modRingNotes=[],modRings=0,modStaticUntil=-Infinity,modPoisonUntil=-Infinity;
function modSlug(){return song.sceneKey||(songId.startsWith('sonic-')?songId.slice(6):null);}
function modActive(){return typeof MOD_ART!=='undefined'&&!!modSlug();}
async function prepareMod(){lowSpecBackground=null;
 modRingNotes=(song.rings?.[settings.difficulty]||[]).map(n=>({...n,done:false}));modRings=0;modStaticUntil=modPoisonUntil=-Infinity;
 if(!modActive()||typeof Image==='undefined')return;
 if(song.pack){await extraPrepare();if(song.lowSpec)buildLowSpecBackground();return;}
 const slug=modSlug(),scene=MOD_ART.scenes[slug];
 const chars=[scene.opponent,scene.player,...(slug==='triple-trouble'?song.visualTimelineByDifficulty[settings.difficulty].flatMap(p=>[p.opponent,p.player]):[])];
 const specialTypes=new Set(Object.values(song.charts?.[settings.difficulty]||{}).flat().map(n=>n.type));
 const specialPaths=typeof SONIC_SPECIAL_SKINS!=='undefined'?Object.entries(SONIC_SPECIAL_SKINS).filter(([type])=>specialTypes.has(Number(type))).map(([,skin])=>skin.src):[];
 const paths=[...specialPaths,...MOD_ART.backgrounds[slug],...chars.map(c=>MOD_ART.characters[c].src)];
 // Release sprites from previous songs, keeping only the current stage.
 for(const key of modImages.keys())if(!paths.includes(key))modImages.delete(key);
 await Promise.all(paths.map(src=>{
  if(modImages.has(src))return Promise.resolve();
  return new Promise((resolve,reject)=>{const im=new Image();im.onload=async()=>{try{await im.decode();modImages.set(src,im);resolve();}catch(error){reject(error);}};im.onerror=()=>reject(Error('모드 이미지 로드 실패: '+src));im.src=src;});
 }));
 if(song.lowSpec)buildLowSpecBackground();
}
function modOffset(lane,side,t){if(song.lowSpec)return {x:0,y:0};
 if(songId==='agoti-a.g.o.t.i')return {x:0,y:10*Math.cos((t/BEAT+(lane+(side==='echo'?4:0))*.25)*Math.PI)};
 if(modSlug()!=='too-slow')return {x:0,y:0};
 const step=t*song.bpm/60*4,phase=(t*song.bpm/84+(lane+(side==='echo'?4:0))*.25)*Math.PI;
 return {x:step>=1049&&step<1176?2*Math.sin(phase):step>=1177&&step<1959?-6*Math.sin(phase):0,y:step>=789&&step<923?5*Math.sin(phase):step>=924&&step<1048?-5*Math.sin(phase):0};
}
function modActor(name,side,t,x,y){
 const actor=actors[side],sheet=MOD_ART.characters[name];if(!sheet)return;
 const image=modImages.get(sheet.src);if(!image)return;
 const singing=t<actor.until;
 let key=singing?['left','down','up','right'][actor.lane]:'idle';
 if(singing&&actor.miss)key=missAnimationKey(sheet,actor.lane)||key;
 const frames=sheet.animations[key]||sheet.animations.idle;
 const elapsed=singing?Math.max(0,t-(actor.at??t)):Math.max(0,t);
 const f=frames[Math.floor(elapsed*24)%frames.length];
 ctx.drawImage(image,f.x,f.y,f.w,f.h,x-f.fw/2+f.ox,y-f.fh+f.oy,f.w,f.h);
}
function drawModStage(t){if(song.lowSpec){drawLowSpecStage(t);return;}
 if(typeof tripleActive==='function'&&tripleActive()){drawTripleStage(t);return;}
 if(song.pack){extraStage(t);return;}
 const slug=modSlug(),scene=MOD_ART.scenes[slug];if(!scene)return;
 let opponent=scene.opponent;
 // Character IDs attached to notes do not drive Triple Trouble phase changes.
 ctx.save();
 const step=t*song.bpm/60*4;
 const zoom=slug==='too-slow'&&((step>=760&&step<786)||(step>=1392&&step<1428))?1.12:1+Math.max(0,Math.cos(t/BEAT*Math.PI*2))*.008;
 ctx.translate(560,265);ctx.scale(zoom,zoom);ctx.translate(-560,-265);
 for(const path of MOD_ART.backgrounds[slug]){const im=modImages.get(path);if(im)ctx.drawImage(im,0,0,1120,530);}
 modActor(opponent,'nova',t,290,460);modActor(scene.player,'echo',t,845,460);
 ctx.restore();
 label(opponent.replaceAll('_',' '),265,508,12,'#f58bc6');label('BOYFRIEND / YOU',850,508,12,'#8cf5d9');
}
function modRingPress(){
 if(state!=='playing'||!modActive())return;
 const now=time(),note=modRingNotes.find(n=>!n.done&&Math.abs(n.time-now)/(settings.rate||1)<=.18);
 if(note){note.done=true;modRings++;feedback='RING +1';feedbackOffsetMs=null;feedbackAt=now;feedbackColor='#ffd75e';}
}
function modJudge(note,kind){
 if(song.pack)return extraHurt(note,kind);
 if(!modActive())return false;
 if(note.type===3){
  note.done=true;
  if(kind!=='miss'){health=Math.max(0,health-12);modPoisonUntil=time()+2;feedback='PHANTOM';feedbackOffsetMs=null;feedbackAt=time();feedbackColor='#d77fff';updateHud();}
  return true;
 }
 if(kind==='miss'&&modRings>0){modRings--;health=Math.min(100,health+3);}
 if(kind!=='miss'&&note.type===2)modStaticUntil=time()+.55;
 return false;
}
function updateMod(t){
 if(song.pack)extraUpdate(t);
 for(const ring of modRingNotes)if(!ring.done&&t>ring.time+.18*(settings.rate||1))ring.done=true;
}
function drawModHud(t){
 if(song.pack){if(song.lowSpec){if(destructionInvulnerable(t))label('무적 '+((extraState.invulnerableUntil-t)/(settings.rate||1)).toFixed(1)+'s',560,480,12,'#fff');return;}extraHud(t);return;}
 if(!modActive())return;
 if(song.rings?.[settings.difficulty]?.length){
  label('RINGS '+modRings+' · SPACE',560,468,15,'#ffdb65');
  for(const ring of modRingNotes){if(ring.done||!['playing','paused'].includes(state))continue;const y=noteY(ring.time,t);if(y<0||y>490)continue;ctx.strokeStyle='#ffd653';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(560,y,11,16,0,0,Math.PI*2);ctx.stroke();}
  ctx.strokeStyle='#ffdc77';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(560,targetY(),16,20,0,0,Math.PI*2);ctx.stroke();
 }
 if(!song.lowSpec&&t<modStaticUntil){ctx.save();ctx.globalAlpha=.16;for(let i=0;i<40;i++)rect(0,(i*17+Math.floor(t*50))%530,1120,2,i%2?'#fff':'#000');ctx.restore();}
 if(!song.lowSpec&&t<modPoisonUntil){ctx.strokeStyle='#ab4bdd';ctx.lineWidth=12;ctx.strokeRect(6,6,1108,518);}
 if(state==='playing'&&t>=-3&&t<0){label(song.title.toUpperCase(),560,370,24,'#ffffff');}
}
function syncModUI(){
 const button=$('mod-cutscene'),ring=$('ring-input');
 if(button)button.hidden=!modActive()||!MOD_ART.videos[modSlug()];
 if(ring)ring.hidden=!song.rings?.[settings.difficulty]?.length;
 const scene=modActive()?MOD_ART.scenes[modSlug()]:null;
 const enemy=scene?scene.opponent.replaceAll('_',' '):'NOVA';
 if($('opponent-name'))$('opponent-name').textContent=enemy;
 if($('player-name'))$('player-name').textContent=scene?'BOYFRIEND':'ECHO';
 for(const [id,name,text] of [['enemy-avatar',scene?.opponent,'N'],['player-avatar',scene?.player,'E']]){
  const node=$(id);if(!node)continue;const icon=name&&MOD_ART.characters[name]?.icon;node.textContent=icon?'':text;node.style.backgroundImage=icon?'url("'+icon+'")':'';node.style.backgroundSize='contain';node.style.backgroundRepeat='no-repeat';node.style.backgroundPosition='center';
 }
 const status=$('mod-help');
 if(status)status.textContent=modActive()?'원본 아트 · 웹 연출 재현 | 금색 링: SPACE · 보라색 PHANTOM: 피하기 · 흰색 STATIC: 화면 효과':'';
}
const originalSyncModUI=syncModUI;syncModUI=function(){originalSyncModUI();if(typeof extraSync==='function')extraSync();if(typeof tripleSync==='function')tripleSync(state==='ready'?0:time(),true);};
function showModVideo(){
 if(!modActive()||!['ready','finished'].includes(state))return;
 const choices=MOD_ART.videos[modSlug()];if(!choices)return;const list=$('mod-video-choice');list.replaceChildren(...choices.map((src,i)=>{const option=document.createElement('option');option.value=src;option.textContent='영상 '+(i+1)+' · '+src.split('/').pop();return option;}));const src=choices[0];
 const panel=$('mod-cinema'),video=$('mod-video');panel.hidden=false;video.src=src;video.volume=muted?0:.65;video.play().catch(()=>{});
}
function closeModVideo(){const video=$('mod-video');video.pause();video.removeAttribute('src');video.load();$('mod-cinema').hidden=true;}

function drawLowSpecStage(t){
 if(song.pack==='dustin'){drawDustinStage(t);return;}
 if(typeof qtActive==='function'&&qtActive()){drawQTStage(t);return;}
 if(song.pack==='mario'&&song.stagePhases){if(!extraState||extraState.id!==songId)extraReset();drawMarioStage(t);return;}
 if(lowSpecBackground)ctx.drawImage(lowSpecBackground,0,0);else{rect(0,0,1120,530,'#171d2b');rect(0,460,1120,70,'#101522');}
 if(song.pack){
  if(!extraState||extraState.id!==songId)extraReset();
  if(song.pack==='survent'&&song.stage==='churchSelever')drawCasanovaActors(t);
  else if(song.pack==='survent')drawSurventActors(t);
  else if(song.pack==='kapi')drawKapiActors(t);
  else if(song.pack==='camellia')drawCamelliaActors(t);
  else if(song.pack==='garcello')drawGarcelloActors(t);
  else if(song.pack==='dustin')drawDustinActors(t);
  else if(song.pack==='agoti')drawAgotiActors(t);
  else if(song.pack==='mario')drawMarioActors(t);
  else if(song.pack==='impostor')drawImpostorActors(t);
  else if(songId==='virus-virus-r')extraActor('nova',t,560,465);
  else{const swapped=songId==='tainted-destruction'&&t>=112*BEAT;extraActor('nova',t,swapped?835:285,465);extraActor('echo',t,swapped?285:835,465);}
 }else if(tripleActive()){
  const p=triplePhase(t);tripleSync(t);tripleActor(p.opponent,'nova',t,p.swap?835:285,475,p.enemyFlip,p);tripleActor(p.player,'echo',t,p.swap?285:835,475,p.playerFlip,p);
 }else{const scene=MOD_ART.scenes[modSlug()];modActor(scene.opponent,'nova',t,290,460);modActor(scene.player,'echo',t,845,460);}
}

let lowSpecBackground=null;
function lowSpecLayers(){
 if(song.pack==='dustin')return dustinLayers();
 if(typeof qtActive==='function'&&qtActive())return qtLayers();
 const full=key=>({key,x:0,y:0,w:1120,h:530});
 if(!song.pack)return MOD_ART.backgrounds[modSlug()].map(src=>({src,x:0,y:0,w:1120,h:530}));
 if(song.pack==='survent'&&song.stage==='churchSelever')return casanovaLayers();
 if(song.pack==='survent')return surventLayers();
 if(song.pack==='kapi')return kapiLayers();
 if(song.pack==='camellia')return camelliaLayers();
 if(song.pack==='garcello')return garcelloLayers();
 if(song.pack==='agoti')return agotiLayers();
 if(song.pack==='mario')return marioLayers();
 if(song.pack==='impostor')return impostorLayers().filter(l=>l.alpha>0);
 if(song.pack==='virus'){
 const keys=MOD_ART.scenes[song.sceneKey].spriteKeys,prefix=keys[0]?.slice(0,keys[0].lastIndexOf('/')+1)||'';
 const names=prefix.includes('cyber2')?['behindwall','wall','screen','floor','TV','blue','mute','blueline']:prefix.includes('window')?['week2BG','window_1','window_2','tiaowen']:['wall','Screen','floor','TV','TV left','TV right','line'];
 return names.map(n=>full(prefix+n));
 }
 if(song.pack==='death'){const past=MOD_ART.scenes[song.sceneKey].opponent.includes('past');return (past?['stagebackpast','stagefrontpast','stagecurtainspast']:['stagewall','stage','stagelights']).map(n=>full('death/stage/'+n));}
 if(song.pack==='silly')return [full('silly/bg/Silly_clouds'),{key:'silly/bg/silly_mirror',x:280,y:30,w:560,h:450},...['floor','pillar back','pillar front'].map(n=>full('silly/bg/'+n))];
 if(songId==='tainted-crush')return [1,2,3,4].map(n=>full('tainted/BG/crush/'+n));
 const name=songId==='tainted-destruction'?'vic':'def';return [full('tainted/BG/'+name+'BG'),{key:'tainted/BG/'+name,x:300,y:125,w:520,h:400}];
}
function lowSpecLayerSource(layer){const a=layer.key?EXTRA_ART.sprites[layer.key]:null,f=a?extraFrame(a,'idle',0):null;return {a,f,src:layer.src||f?.src||a?.src};}
function buildLowSpecBackground(){
 const c=document.createElement('canvas');c.width=1120;c.height=530;const g=c.getContext('2d');g.fillStyle='#171d2b';g.fillRect(0,0,1120,530);
 for(const layer of lowSpecLayers()){const {a,f,src}=lowSpecLayerSource(layer),im=modImages.get(src);if(!im)continue;const {x,y,w,h}=layer;g.globalAlpha=layer.alpha??1;if(f)g.drawImage(im,f.x,f.y,f.w,f.h,x+f.ox*w/f.fw,y+f.oy*h/f.fh,f.w*w/f.fw,f.h*h/f.fh);else g.drawImage(im,x,y,w,h);}
 lowSpecBackground=c;
}

// Native miss names vary between engines and imported atlases.
const missKeyCache=new WeakMap();
function missAnimationKey(sheet,lane){
 if(!sheet?.animations||lane<0||lane>3)return null;
 if(!missKeyCache.has(sheet))missKeyCache.set(sheet,['left','down','up','right'].map(direction=>Object.keys(sheet.animations).find(key=>key.toLowerCase().includes(direction)&&key.toLowerCase().includes('miss'))||null));
 return missKeyCache.get(sheet)[lane];
}
function girlfriendPose(sheet,t){
 const beat=Math.max(0,t)/BEAT,index=Math.floor(beat),elapsed=(beat-index)*BEAT;
 if(sheet.animations.danceLeft&&sheet.animations.danceRight)return {key:index%2?'danceRight':'danceLeft',elapsed};
 const frames=sheet.animations.idle;
 // A combined GF atlas contains both 15-frame dance directions.
 if(frames?.length>=28&&frames.length<=32){const half=Math.floor(frames.length/2),frame=(index%2)*half+Math.min(half-1,Math.floor(elapsed*24));return {key:'idle',elapsed:frame/24};}
 return {key:'idle',elapsed};
}

function drawSonicSpecialNote(note,x,y,t){
 if(song.pack||!songId.startsWith('sonic-')||typeof SONIC_SPECIAL_SKINS==='undefined')return false;
 const skin=SONIC_SPECIAL_SKINS[note.type],im=skin&&modImages.get(skin.src);
 if(!im)return false;
 const frames=skin.lanes[note.lane],f=frames[song.lowSpec?0:Math.floor(Math.max(0,t)*24)%frames.length];
 const scale=72/Math.max(f.width,f.height);
 ctx.drawImage(im,f.x,f.y,f.width,f.height,x-f.width*scale/2,y-f.height*scale/2,f.width*scale,f.height*scale);
 return true;
}
