'use strict';
// Web adaptation: original art/notes, deterministic local-clock effects.
const modImages=new Map();
let modRingNotes=[],modRings=0,modStaticUntil=-Infinity,modPoisonUntil=-Infinity;
function modSlug(){return songId.startsWith('sonic-')?songId.slice(6):null;}
function modActive(){return typeof MOD_ART!=='undefined'&&!!modSlug();}
async function prepareMod(){
 modRingNotes=(song.rings?.[settings.difficulty]||[]).map(n=>({...n,done:false}));modRings=0;modStaticUntil=modPoisonUntil=-Infinity;
 if(!modActive()||typeof Image==='undefined')return;
 const slug=modSlug(),scene=MOD_ART.scenes[slug];
 const chars=[scene.opponent,scene.player,...(slug==='triple-trouble'?['Tails','KnucklesEXE','eggman_soul','SONIC_X']:[])];
 const paths=[...MOD_ART.backgrounds[slug],...chars.map(c=>MOD_ART.characters[c].src)];
 // Release sprites from previous songs, keeping only the current stage.
 for(const key of modImages.keys())if(!paths.includes(key))modImages.delete(key);
 await Promise.all(paths.map(src=>{
  if(modImages.has(src))return Promise.resolve();
  return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{modImages.set(src,im);resolve();};im.onerror=()=>reject(Error('모드 이미지 로드 실패: '+src));im.src=src;});
 }));
}
function modOffset(lane,side,t){
 if(modSlug()!=='too-slow')return {x:0,y:0};
 const step=t*song.bpm/60*4,phase=(t*song.bpm/84+(lane+(side==='echo'?4:0))*.25)*Math.PI;
 return {x:step>=1049&&step<1176?2*Math.sin(phase):step>=1177&&step<1959?-6*Math.sin(phase):0,y:step>=789&&step<923?5*Math.sin(phase):step>=924&&step<1048?-5*Math.sin(phase):0};
}
function modActor(name,side,t,x,y){
 const actor=actors[side],sheet=MOD_ART.characters[name];if(!sheet)return;
 const image=modImages.get(sheet.src);if(!image)return;
 const singing=t<actor.until;
 const key=singing?['left','down','up','right'][actor.lane]:'idle';
 const frames=sheet.animations[key]||sheet.animations.idle;
 const elapsed=singing?Math.max(0,t-(actor.at??t)):Math.max(0,t);
 const f=frames[Math.floor(elapsed*24)%frames.length];
 ctx.drawImage(image,f.x,f.y,f.w,f.h,x-f.fw/2+f.ox,y-f.fh+f.oy,f.w,f.h);
}
function drawModStage(t){
 const slug=modSlug(),scene=MOD_ART.scenes[slug];if(!scene)return;
 let opponent=scene.opponent;
 if(slug==='triple-trouble')opponent=['Tails','KnucklesEXE','eggman_soul','SONIC_X'][actors.nova.character||0];
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
 const now=time(),note=modRingNotes.find(n=>!n.done&&Math.abs(n.time-now)<=.16);
 if(note){note.done=true;modRings++;feedback='RING +1';feedbackAt=now;feedbackColor='#ffd75e';}
}
function modJudge(note,kind){
 if(!modActive())return false;
 if(note.type===3){
  note.done=true;
  if(kind!=='miss'){health=Math.max(0,health-12);modPoisonUntil=time()+2;feedback='PHANTOM';feedbackAt=time();feedbackColor='#d77fff';updateHud();}
  return true;
 }
 if(kind==='miss'&&modRings>0){modRings--;health=Math.min(100,health+3);}
 if(kind!=='miss'&&note.type===2)modStaticUntil=time()+.55;
 return false;
}
function updateMod(t){
 for(const ring of modRingNotes)if(!ring.done&&t>ring.time+.16)ring.done=true;
}
function drawModHud(t){
 if(!modActive())return;
 if(song.rings?.[settings.difficulty]?.length){
  label('RINGS '+modRings+' · SPACE',560,468,15,'#ffdb65');
  for(const ring of modRingNotes){if(ring.done||!['playing','paused'].includes(state))continue;const y=noteY(ring.time,t);if(y<0||y>490)continue;ctx.strokeStyle='#ffd653';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(560,y,11,16,0,0,Math.PI*2);ctx.stroke();}
  ctx.strokeStyle='#ffdc77';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(560,targetY(),16,20,0,0,Math.PI*2);ctx.stroke();
 }
 if(t<modStaticUntil){ctx.save();ctx.globalAlpha=.16;for(let i=0;i<40;i++)rect(0,(i*17+Math.floor(t*50))%530,1120,2,i%2?'#fff':'#000');ctx.restore();}
 if(t<modPoisonUntil){ctx.strokeStyle='#ab4bdd';ctx.lineWidth=12;ctx.strokeRect(6,6,1108,518);}
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
  const node=$(id);if(!node)continue;node.textContent=name?'':text;node.style.backgroundImage=name?'url("'+MOD_ART.characters[name].icon+'")':'';node.style.backgroundSize='contain';node.style.backgroundRepeat='no-repeat';node.style.backgroundPosition='center';
 }
 const status=$('mod-help');
 if(status)status.textContent=modActive()?'원본 아트 · 웹 연출 재현 | 금색 링: SPACE · 보라색 PHANTOM: 피하기 · 흰색 STATIC: 화면 효과':'';
}
function showModVideo(){
 if(!modActive()||!['ready','finished'].includes(state))return;
 const choices=MOD_ART.videos[modSlug()];if(!choices)return;const list=$('mod-video-choice');list.replaceChildren(...choices.map((src,i)=>{const option=document.createElement('option');option.value=src;option.textContent='영상 '+(i+1)+' · '+src.split('/').pop();return option;}));const src=choices[0];
 const panel=$('mod-cinema'),video=$('mod-video');panel.hidden=false;video.src=src;video.volume=muted?0:.65;video.play().catch(()=>{});
}
function closeModVideo(){const video=$('mod-video');video.pause();video.removeAttribute('src');video.load();$('mod-cinema').hidden=true;}
