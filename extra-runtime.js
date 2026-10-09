'use strict';
// Source event timing is preserved. Canvas camera/shaders adapt the native engine to this stage.
let extraState=null;
const extraSoundBuffers=new Map();
const clamp01=v=>Math.max(0,Math.min(1,v));
function extraActive(){return !!song.pack;}
function extraReset(){
 const scene=MOD_ART.scenes[song.sceneKey];
 extraState={id:songId,cursor:0,at:-Infinity,chars:scene?{nova:scene.opponent,echo:scene.player,gf:scene.spectator}:{},special:{},alt:{},black:0,hideHealth:false,zoom:1,zoomTween:null,bumps:[],flashes:[],shake:null,follow:null,bumpMult:1,bumpInterval:4,glitchUntil:-1,lastMisses:0,death:null};
 extraHealthVisibility(false);
}
function extraHealthVisibility(hide){const node=document.querySelector?.('.health');if(node&&node.style.opacity!==(hide?'0':'1'))node.style.opacity=hide?'0':'1';}
async function extraPrepare(){
 extraReset();virusBackdrop=null;const scene=MOD_ART.scenes[song.sceneKey];const assets=[];
 for(const key of scene.characters){const a=MOD_ART.characters[key];assets.push(...(a.pages||[a.src]));}
 for(const key of scene.spriteKeys.filter(key=>!song.lowSpec||key==='death/stage/hurt-notes')){const a=EXTRA_ART.sprites[key];if(song.pack==='virus'){if(!virusLayerKeys().includes(key))continue;const frames=a.animations?.idle||Object.values(a.animations||{})[0];assets.push(...(frames?frames.map(f=>f.src||a.src):[a.src]));}else assets.push(...(a.pages||[a.src]));}
 if(song.lowSpec)for(const layer of lowSpecLayers()){const src=lowSpecLayerSource(layer).src;if(src)assets.push(src);}
 for(const key of modImages.keys())if(!assets.includes(key))modImages.delete(key);
 await Promise.all([...new Set(assets)].map(src=>modImages.has(src)?null:new Promise((resolve,reject)=>{const im=new Image();im.onload=async()=>{try{await im.decode();modImages.set(src,im);resolve();}catch(error){reject(error);}};im.onerror=()=>reject(Error('모드 이미지 로드 실패: '+src));im.src=src;})));
 if(song.pack==='silly'&&!song.lowSpec)await sillyPrepare();
 if(song.pack==='impostor'&&!song.lowSpec)await prepareImpostorVideos();
 if(!song.lowSpec&&(song.pack==='tainted'||song.pack==='silly'))await Promise.all(Object.entries(EXTRA_ART.sounds).map(async([name,src])=>{if(!extraSoundBuffers.has(name)){const response=await fetch(src);if(!response.ok)throw Error('효과음 로드 실패: '+src);extraSoundBuffers.set(name,await audio.decodeAudioData(await response.arrayBuffer()));}}));
}
function extraSound(name,volume=1,offset=0){if(song.lowSpec)return;
 const buffer=extraSoundBuffers.get(name);if(!buffer||!audio||offset>=buffer.duration)return;
 const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffer;source.playbackRate.value=settings.rate||1;gain.gain.value=Math.max(0,Math.min(1,volume));source.connect(gain);gain.connect(master);sources.push(source);source.onended=()=>{source.disconnect();gain.disconnect();sources=sources.filter(s=>s!==source);};source.start(audio.currentTime,Math.max(0,offset));
}
function extraSide(value,animation=false){const v=String(value).toLowerCase();if(['bf','boyfriend','player'].includes(v))return 'echo';if(['dad','opponent'].includes(v))return 'nova';return v==='0'?(animation?'nova':'echo'):(animation?'echo':'nova');}
function extraZoom(t){const z=extraState?.zoomTween;if(!z)return extraState?.zoom||1;const p=clamp01((t-z.at)/Math.max(.00001,z.duration)),ease=p<.5?2*p*p:1-(-2*p+2)**2/2;return z.from+(z.to-z.from)*ease;}
function extraEvent(e,t,quiet=false){
 const s=extraState,a=e.v1,b=e.v2;
 if(song.pack==='impostor'&&impostorEvent(e,t))return;
 switch(e.name){
 case 'Silly':sillyEvent(e,t,quiet);break;
 case 'Change Character': {const key=song.pack+':'+b;if(MOD_ART.characters[key]){if(songId==='tainted-destruction'&&s.chars[extraSide(a)]!==key)s.invulnerableUntil=t+3*(settings.rate||1);s.chars[extraSide(a)]=key;delete s.special[extraSide(a)];extraActorLabels();}break;}
 case 'Play Animation': {const target=/^(0|1|2|bf|dad|boyfriend|opponent)$/i.test(a)?a:b,anim=target===a?b:a;s.special[extraSide(target,true)]={name:anim,at:e.time};break;}
 case 'Alt Idle Animation':s.alt[extraSide(a,true)]=b;break;
 case 'Cam Zoom Tween':s.zoomTween={from:extraZoom(e.time),to:Math.max(.35,Math.min(2.8,Number(a)||1)),at:e.time,duration:Math.max(0,Number(b)||0)};break;
 case 'Add Camera Zoom':s.bumps.push({at:e.time,amount:a===''?.015:Number(a)||0});break;
 case 'Bumpin Beat':if(a!=='')s.bumpMult=Number(a)||0;if(b!=='')s.bumpInterval=Math.max(1,Number(b)||1);break;
 case 'Camera Follow Pos':s.follow=a===''&&b===''?null:{x:Number(a)||0,y:Number(b)||0};break;
 case 'Screen Shake': {const [duration,amount]=a.split(',').map(Number);s.shake={at:e.time,duration:duration||0,amount:amount||0};break;}
 case 'ov black':if(Number(a)===1)s.black=1;if(Number(b)===2)s.black=0;break;
 case 'healt':if(Number(a)===1)s.hideHealth=true;if(Number(b)===2)s.hideHealth=false;break;
 case 'Flash Red':case 'Flash Camera':s.flashes.push({at:e.time,color:'#e90000',alpha:.5,duration:Number(a)||.5});break;
 case 'add Flash':case 'add Flash2':s.flashes.push({at:e.time,color:e.name==='add Flash2'?'#ff4000':'#ffffff',alpha:.3,duration:Number(a)||.5});break;
 case 'Play Sound':if(!quiet&&state==='playing'&&t-e.time<.2)extraSound(a,Number(b)||1,t-e.time);break;
 default:console.warn('Unimplemented mod event',e.name);
 }
}
function extraActorLabels(){
 if(!extraState)return;
 for(const [side,id,avatar] of [['nova','opponent-name','enemy-avatar'],['echo','player-name','player-avatar']]){
  const name=extraState.chars[side],a=MOD_ART.characters[name];if(!a)continue;
  if($(id))$(id).textContent=name.split(':')[1].replaceAll('_',' ').toUpperCase();
  if($(avatar)){$(avatar).style.backgroundImage=a.icon?'url("'+a.icon+'")':'';$(avatar).textContent=a.icon?'':side==='echo'?'P':'R';}
 }
}
function extraUpdate(t,quiet=false){
 if(!extraActive())return;
 if(!extraState||extraState.id!==songId||t<extraState.at)extraReset();
 const events=song.events?.[settings.difficulty]||[];
 while(extraState.cursor<events.length&&events[extraState.cursor].time<=t)extraEvent(events[extraState.cursor++],t,quiet);
 extraState.at=t;extraState.flashes=extraState.flashes.filter(f=>t<f.at+f.duration);extraState.bumps=extraState.bumps.filter(f=>t<f.at+1);
 const beat=t/BEAT;
 if(songId==='tainted-destruction'&&((beat>=112&&beat<182)||(beat>=320&&beat<388)))health=Math.max(10,health);
 extraHealthVisibility(!song.lowSpec&&extraState.hideHealth&&['playing','paused'].includes(state));
}
function extraSwap(t=time()){return songId==='tainted-destruction'&&state!=='ready'?clamp01((t-112*BEAT)/.3):0;}
function extraNote(note,side){
 if(!extraActive()||!extraState)return;
 if(note.noAnimation)actors[side].until=-1;
 actors[side].alt=note.alt;
 if(side==='nova'){
  if(note.sourceNoteType==='black')extraState.shake={at:note.time,duration:.02,amount:.02};
  const beat=note.time/BEAT;
  if(songId==='tainted-destruction'&&((beat>=182&&beat<320)||(beat>=382&&beat<384)||beat>=388))extraState.glitchUntil=note.time+.1;
 }
}
function destructionInvulnerable(t=time()){return songId==='tainted-destruction'&&!!extraState&&t<(extraState.invulnerableUntil??-Infinity);}
function extraAfterJudge(kind){
 if(!extraActive()||!extraState||kind!=='miss')return;
 if(destructionInvulnerable()){extraState.protectedMisses=(extraState.protectedMisses||0)+1;return;}
 const beat=time()/BEAT;
 if(songId==='tainted-defeat'&&hits.miss>=5)health=0;
 if(songId==='tainted-destruction'){
  const safe=(beat>=112&&beat<182)||(beat>=320&&beat<388);
  if(safe)health=Math.max(10,health);else if(beat>=182||hits.miss-(extraState.protectedMisses||0)>=5)health=0;
 }
}
function extraFrame(a,key,t,fps=24,loop=true){
 if(!a?.animations)return null;
 const frames=a.animations[key]||a.animations.idle||Object.values(a.animations)[0];if(!frames?.length)return null;
 const config=a.config?.[key];const i=Math.floor(Math.max(0,t)*(config?.fps||fps));return frames[(config?.loop??loop)?i%frames.length:Math.min(i,frames.length-1)];
}
function extraSprite(key,t,x=0,y=0,w=1120,h=530,anim='idle',fps=24,loop=true){
 const a=EXTRA_ART.sprites[key];if(!a)return;
 const f=extraFrame(a,anim,t,fps,loop),im=modImages.get(f?.src||a.src);if(!im)return;
 if(f)ctx.drawImage(im,f.x,f.y,f.w,f.h,x+f.ox*w/f.fw,y+f.oy*h/f.fh,f.w*w/f.fw,f.h*h/f.fh);else ctx.drawImage(im,x,y,w,h);
}
function extraActor(side,t,x,y,black=false){
 const s=extraState,a=MOD_ART.characters[s.chars[side]];if(!a)return;
 const actor=actors[side]||{lane:-1,until:-1};
 const singUntil=(songId==='tainted-defeat')&&actor.lane>=0&&Number.isFinite(actor.at)?Math.max(actor.until,actor.at+(song.pack==='impostor'?(a.singDuration||4):6.1)*BEAT/4):actor.until;
 const singing=t<singUntil;
 // Yourself's form is controlled by transformation events, not stale chart note tags.
 const alternate=song.pack==='silly'&&side==='nova'?s.alt.nova==='-alt':actor.alt;
 let key=singing?'sing'+['LEFT','DOWN','UP','RIGHT'][actor.lane]+(alternate?'-alt':''):'idle'+(s.alt[side]||'');
 if(!a.animations[key])key=singing?'sing'+['LEFT','DOWN','UP','RIGHT'][actor.lane]:'idle';
 if(!a.animations[key])key=singing?['left','down','up','right'][actor.lane]:'idle';
 if(!a.animations[key]&&singing)key='sing'+['LEFT','DOWN','UP','RIGHT'][actor.lane];
 let elapsed=singing?t-(actor.at??t):t%BEAT;
 const special=s.special[side];
 if(special&&a.animations[special.name]){const c=a.config?.[special.name],length=a.animations[special.name].length/(c?.fps||24);if(t-special.at<length||(song.pack!=='silly'&&songId!=='tainted-defeat'&&song.pack!=='impostor'&&!singing)){key=special.name;elapsed=t-special.at;}}
 const f=extraFrame(a,key,elapsed,24,false);if(!f)return;const im=modImages.get(f.src||a.src);if(!im)return;
 const off=a.config?.[key]?.offsets||[0,0];ctx.save();ctx.translate(x,y);ctx.scale(a.renderScale||1,a.renderScale||1);
 // Keep BF's feet anchored while enlarging the pre-white-background phases.
 if(songId==='tainted-destruction'&&t<320*BEAT&&s.chars[side].startsWith('tainted:bf_des'))ctx.scale(1.4,1.4);
 // Deathmatch character JSON describes the opponent-facing base; the player slot reverses it.
 const flip=(song.pack==='death'||song.pack==='impostor')?(!!a.flip)!==(side==='echo'):!!a.flip;
 const destructionMoved=songId==='tainted-destruction'&&t>=112*BEAT;
 // Destruction BF sprites already face the opponent from the right-hand position.
 const facingFlip=((song.pack==='silly'||songId==='tainted-defeat')&&side==='echo')||(songId==='tainted-destruction'&&s.chars[side].startsWith('tainted:bf_des'))?false:flip!==destructionMoved;
 if(facingFlip)ctx.scale(-1,1);if(black)ctx.filter='brightness(0)';
 if(song.pack==='impostor'){
  const layout=impostorViewLayout(),placement=layout?.actors[side];
  if(placement){const idle=a.animations.idle[0],factor=Math.min((a.nativeScale||placement.native)*layout.scale/a.scale,410/idle.h,550/idle.w);ctx.scale(factor,factor);}
  const idle=a.animations.idle[0],idleOff=a.config?.idle?.offsets||[0,0];
  // Flixel animation offsets are screen pixels: a 2x sprite must not double them.
  const offsetScale=a.scale/(a.nativeScale||1);
  const originX=-idle.w/2-idle.ox+idleOff[0]*offsetScale,originY=-idle.h-idle.oy+idleOff[1]*offsetScale;
  ctx.drawImage(im,f.x,f.y,f.w,f.h,originX+f.ox-off[0]*offsetScale,originY+f.oy-off[1]*offsetScale,f.w,f.h);
 }else if(song.pack==='silly'||songId==='tainted-defeat'){
  const anchor=a.animations.idle[0],ratio=a.config?.[key]?.frameScale||1;
  ctx.drawImage(im,f.x,f.y,f.w,f.h,-anchor.fw/2+f.ox*ratio-off[0]*a.scale,-anchor.fh+f.oy*ratio-off[1]*a.scale,f.w*ratio,f.h*ratio);
 }else ctx.drawImage(im,f.x,f.y,f.w,f.h,-f.fw/2+f.ox-off[0]*a.scale,-f.fh+f.oy-off[1]*a.scale,f.w,f.h);ctx.restore();
}
function extraStage(t){
 if(!extraState||extraState.id!==songId)extraReset();
 const s=extraState,beat=t/BEAT,step=beat*4;
 // Opaque base covers transparent finale layers and camera margins.
 if(songId==='tainted-destruction'&&step>=1566)rect(0,0,1120,530,'#000');
 const pulse=Math.exp(-(Math.max(0,beat)%s.bumpInterval)*5)*.012*s.bumpMult;
 const zoom=Math.max(.6,Math.min(1.6,1+(extraZoom(t)-1)*.35+Math.min(.3,s.bumps.reduce((v,b)=>v+b.amount*Math.exp(-(t-b.at)*9),0))+pulse));
 const shaking=s.shake&&t<s.shake.at+s.shake.duration;const shake=shaking?s.shake.amount*530:0;
 const bounce=songId==='tainted-crush'&&beat>=64&&beat<96;
 ctx.save();ctx.translate(560+Math.sin(t*177)*shake,265+Math.cos(t*137)*shake);ctx.scale(zoom,zoom);if(song.pack==='impostor'&&s.twist)ctx.rotate(Math.sin(beat*Math.PI)*s.twist*Math.PI/180);if(bounce)ctx.rotate((Math.floor(beat)%2?1:-1)*.035*Math.exp(-(beat%1)*4));ctx.translate(-560,-265);
 if(s.follow)ctx.translate(Math.max(-60,Math.min(60,(600-s.follow.x)*.08)),Math.max(-30,Math.min(30,(350-s.follow.y)*.05)));
 if(song.pack==='impostor'){
  drawImpostorStage(t);
 }else if(song.pack==='silly'){sillyStage(t);
 }else if(song.pack==='virus'){
  drawVirusBackdrop(t);
  if(songId==='virus-virus-r'){
   // The original window scene shows R alone in the central window.
   ctx.save();ctx.beginPath();ctx.rect(270,82,595,370);ctx.clip();
   const windowFill=ctx.createRadialGradient(567,255,30,567,255,390);windowFill.addColorStop(0,'#eeeeee');windowFill.addColorStop(1,'#888888');ctx.fillStyle=windowFill;ctx.fillRect(270,82,595,370);
   ctx.translate(560,465);ctx.scale(2.6,2.6);extraActor('nova',t,0,60);ctx.restore();
  }else{extraSpectator(t);extraActor('nova',t,285,475);extraActor('echo',t,850,475);}
 }else if(song.pack==='death'){
  const past=s.chars.nova.includes('past'),prefix='death/stage/';
  for(const key of past?['stagebackpast','stagefrontpast','stagecurtainspast']:['stagewall','stage','stagelights'])extraSprite(prefix+key,t);
  extraSpectator(t);extraActor('nova',t,280,475);extraActor('echo',t,840,475);
  // Foreground crowd and vignette omitted: they obscure the playable cast on this stage.
 }else if(songId==='tainted-crush'){
  const logo=step>=1&&step<20?clamp01(t-BEAT/4):step>=20?1-clamp01(t-BEAT*5):0;ctx.filter='blur('+(logo*6)+'px)';
  for(let i=1;i<=4;i++)extraSprite('tainted/BG/crush/'+i,t,0,0,1120,530,'idle',2);
  for(let i=0;i<20;i++){const p=(Math.max(0,t)+i*.53)%(7+i%6)/(7+i%6);extraSprite('tainted/BG/crush/leave',t,(i*97+p*650)%1200-40,p*650-60,24,20);}
  extraActor('nova',t,285,465);extraActor('echo',t,850,465);
  for(const i of [5,6]){ctx.save();if(i===6){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.7;}extraSprite('tainted/BG/crush/'+i,t);ctx.restore();}
  ctx.filter='none';
 }else if(songId==='tainted-defeat'){
  const silhouette=step>=1040&&step<1296;
  if(silhouette||step<144){rect(0,0,1120,530,'#fff');if(!silhouette)extraSprite('tainted/BG/defeat/vignette',t);}
  else if(step>=1360){extraSprite('tainted/BG/fi/8',t);extraSprite('tainted/BG/defeat/parBG',t);}
  else{extraSprite('tainted/BG/defBG',t);extraSprite('tainted/BG/def',t,300,125,520,400);}
  ctx.filter='blur('+(silhouette?(1-Math.cos((t-1040*BEAT/4)/3*Math.PI))*6:step<144?Math.max(0,1-(t-BEAT/4)/5)*6:0)+'px)';
  extraActor('nova',t,285,460,silhouette);extraActor('echo',t,850,460,silhouette);ctx.filter='none';
 }else if(songId==='tainted-destruction'){
  if(step>=1566){for(let i=1;i<=8;i++)extraSprite('tainted/BG/fi/'+i,t);}
  else{const phase2=(beat>=182&&beat<384)||beat>=388;extraSprite('tainted/BG/'+(phase2?'defBG':'vicBG'),t);extraSprite('tainted/BG/'+(phase2?'def':'vic'),t,300,125,520,400);}
  if(beat>=320&&beat<382){ctx.save();ctx.globalAlpha=beat<368?1:1-clamp01((t-368*BEAT)/4);rect(0,0,1120,530,'#fff');ctx.restore();}
  ctx.filter='blur('+(Math.max(0,1-(t-4*BEAT)/5)*6)+'px)';
  if(beat<320||beat>=384)extraActor('nova',t,beat>=112?850:285,465);
  extraActor('echo',t,beat>=112?285:850,465);ctx.filter='none';
  if(beat>=368&&beat<378)extraSprite('tainted/BG/BF_1',t,400-clamp01((t-368*BEAT)/4)*210,220,180,260);
  if(beat>=378&&beat<380)extraSprite('tainted/BG/BF_3',t-378*BEAT,190,220,260,260,'idle',12,false);
  if(beat>=382&&beat<384){extraSprite('tainted/BG/kill',t-382*BEAT,0,0,1120,530,'kill idle',25);extraSprite('tainted/BG/BF_4',t-382*BEAT,100,30,480,490,'idle',15,false);}
 }
 ctx.restore();
 if(songId==='tainted-destruction')extraShader(((beat>=182&&beat<320)||(beat>=382&&beat<384))?.5:beat>=388?1:0,t,false);
 const swap=extraSwap(t);label(s.chars.nova.split(':')[1].toUpperCase()+' / AUTO',265+580*swap,508,12,'#f58bc6');label('YOU / '+s.chars.echo.split(':')[1].toUpperCase(),845-580*swap,508,12,'#8cf5d9');
}
function extraHudAlpha(t){if(song.lowSpec)return 1;if(song.pack==='impostor')return impostorHudAlpha(t);if(song.pack==='silly')return 1;if(!extraActive()||songId!=='tainted-destruction')return 1;return state==='ready'?1:clamp01((t-28*BEAT)/.5);}
function extraHud(t){
 if(!extraActive()||!extraState)return;
 const s=extraState,beat=t/BEAT,step=beat*4;
 if(songId==='tainted-crush'){
  const alpha=step>=1&&step<20?clamp01(t-BEAT/4):step>=20?1-clamp01(t-5*BEAT):0;
  if(alpha>0){ctx.save();ctx.globalAlpha=alpha;extraSprite('tainted/BG/crush/logo',t,250,135,620,260);ctx.restore();}
  if(step>=568&&step<572)extraSprite('tainted/BG/crush/wd',t-568*BEAT/4,150,10,820,510,'idle',24,false);
  if(step>=572)extraSprite('tainted/BG/crush/p',t-572*BEAT/4,80,0,960,530,'idle',24,false);
 }
 if(songId==='tainted-defeat'&&step>=120&&step<176){
  const progress=step<144?clamp01(t-120*BEAT/4):1-clamp01((t-144*BEAT/4)/2),left=-560*(1-progress),right=560+560*(1-progress);
  extraSprite('tainted/BG/defeat/sceneBkBg',t,left,0,560,530);extraSprite('tainted/BG/defeat/sceneBfBg',t,right,0,560,530);
  for(const [side,key,x,prefix] of [['nova','sceneBk',left,'black_rad'],['echo','sceneBf',right,'BF_blue']]){const a=actors[side],anim=prefix+' '+(t<a.until?['left','down','up','right'][a.lane]:'idle');extraSprite('tainted/BG/defeat/'+key,t-(a.at||0),x,10,560,520,anim,10,false);}
 }
 if(songId==='tainted-destruction'){
  if(beat<320){ctx.save();ctx.globalAlpha=beat<316?1:1-clamp01(t-316*BEAT);const dy=clamp01((t-316*BEAT)/3)*530;extraSprite('tainted/BG/Q',t,10,(settings.scroll==='down'?35:405)+dy,90,100);extraSprite('tainted/BG/P',t,1010,(settings.scroll==='down'?35:405)+dy,90,100);ctx.restore();}
  if((beat>=182&&beat<320)||(beat>=382&&beat<384)||beat>=388){
   ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.08;ctx.fillStyle='#f04b6c';ctx.fillRect(0,0,4,530);ctx.fillStyle='#44ddff';ctx.fillRect(1116,0,4,530);ctx.restore();
   if(t<s.glitchUntil)extraShader(0,t,true);
  }
  const dark=beat>=460?1:1-clamp01((t-4*BEAT)/.5);if(dark>0&&t>=0){ctx.save();ctx.globalAlpha=dark;rect(0,0,1120,530,'#000');ctx.restore();}
  if(beat>=455&&beat<460)label('You never can be me.'.slice(0,Math.max(0,Math.floor((t-455*BEAT)/.1))),560,280,30,'#fff');
 }
 if(s.black&&song.pack!=='silly')rect(0,0,1120,530,'#000');
 for(const f of s.flashes){ctx.save();ctx.globalAlpha=f.alpha*(1-clamp01((t-f.at)/f.duration));rect(0,0,1120,530,f.color);ctx.restore();}
 if(song.pack==='silly')sillyHud(t);
 if(['playing','paused'].includes(state)){
  if(songId==='tainted-defeat')label('MISS '+hits.miss+' / 5'+($('practice').checked?' · PRACTICE':''),560,480,12,'#fff');
  if(songId==='tainted-destruction'){const safe=(beat>=112&&beat<182)||(beat>=320&&beat<388);label(destructionInvulnerable(t)?'무적 '+Math.max(0,(s.invulnerableUntil-t)/(settings.rate||1)).toFixed(1)+'s':safe?'SAFE PHASE':beat<112?'MISS '+(hits.miss-(s.protectedMisses||0))+' / 5':'SUDDEN DEATH'+($('practice').checked?' · PRACTICE':''),560,480,12,'#fff');}
 }
}
function extraSync(){
 extraHealthVisibility(false);
 if(!extraActive())return;
 const help=$('mod-help');if(song.pack==='impostor'){if(help)help.textContent='Impostor V4 · 원본 음원·채보·캐릭터 · 사용 가능한 배경 · 일부 원본 전용 연출은 미포함';return;}if(song.pack==='silly'){if(help)help.textContent='Silly Billy · 원본 Hard 채보 / 보컬 · 변신, 거울 파손, 가사, 영상 · 카메라는 웹 재현';return;}if(help)help.textContent=song.pack==='virus'?'Virus R · 원본 음원/채보/아트 · 무대 애니메이션 웹 재현 (원본 효과 코드 미포함)':song.pack==='death'?'Deathmatch · 원본 캐릭터 교체·카메라 이벤트 · 일반/Evil 별도 음원 · 검은 HURT 노트는 피하세요':'Tainted Fate · 원본 이벤트·무대 전환·레인 교체 · 셰이더 웹 재현 · 연습 모드는 즉사 제한 해제';
}
// RGB channel separation and scanline displacement approximate the native shaders.
let extraFxCanvas=null,extraTintCanvas=null;
function extraShader(amount,t,glitch=false){
 if(!amount&&!glitch)return;
 if(!extraFxCanvas){extraFxCanvas=document.createElement('canvas');extraTintCanvas=document.createElement('canvas');for(const c of [extraFxCanvas,extraTintCanvas]){c.width=1120;c.height=530;}}
 const copy=extraFxCanvas.getContext('2d'),tint=extraTintCanvas.getContext('2d');copy.globalCompositeOperation='copy';copy.drawImage(ctx.canvas,0,0,1120,530);
 if(amount){
  ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,1120,530);ctx.globalCompositeOperation='lighter';
  for(const [color,offset] of [['#ff0000',amount*4],['#00ffff',-amount*4]]){tint.globalCompositeOperation='copy';tint.drawImage(extraFxCanvas,0,0);tint.globalCompositeOperation='multiply';tint.fillStyle=color;tint.fillRect(0,0,1120,530);ctx.drawImage(extraTintCanvas,offset,0);}
  ctx.restore();
 }
 if(glitch){ctx.save();for(let i=0;i<10;i++){const y=(i*83+Math.floor(t*93))%518,offset=Math.sin(i*19+Math.floor(t*55))*25;ctx.drawImage(extraFxCanvas,0,y,1120,12,offset,y,1120,12);}ctx.restore();}
}
function extraFinish(failed){if(song.lowSpec){extraHealthVisibility(false);return;}
 extraHealthVisibility(false);
 if(!failed){if(songId==='tainted-destruction')showModVideo();return;}
 if(songId!=='tainted-destruction'||!extraState)return;
 const beat=pausedTime/BEAT,early=beat<112,finale=beat*4>=1566;
 extraState.death={at:audio.currentTime,chartTime:pausedTime,early,finale,duration:early?2:1.3};
 if(early){extraState.chars.echo='tainted:bf_des_p_death';extraState.special.echo={name:'pre_death',at:pausedTime};}
 else{extraState.chars.nova='tainted:bf_des_kill';extraState.special.nova={name:finale?'des2_pre_kill':'des_pre_kill',at:pausedTime};extraSound('game_over');}
 $('overlay').classList.add('hidden');setSettingsLocked(true);$('start').disabled=true;
}
function extraDeathFrame(){
 const d=extraState?.death;if(!d)return;
 const elapsed=audio.currentTime-d.at;
 if(elapsed>=d.duration){extraState.death=null;stopSources();$('overlay').classList.remove('hidden');setSettingsLocked(false);$('start').disabled=false;return;}
 const t=d.chartTime+elapsed;
 if(!d.early){
  if(elapsed>=.6)extraState.special.echo={name:'pre_death',at:d.chartTime+.6};
  if(elapsed>=.9)extraState.special.nova={name:d.finale?'des2_kill':'des_kill',at:d.chartTime+.9};
 }
 rect(0,0,1120,530,'#08030d');
 if(!d.early)extraActor('nova',t,380,480);
 extraActor('echo',t,760,480);
}

function extraSpectator(t){if(!extraState?.chars.gf)return;ctx.save();ctx.translate(560,400);ctx.scale(.65,.65);extraActor('gf',t,0,0);ctx.restore();}

function extraHurt(note,kind){
 if(!note.hurt)return false;
 note.done=true;note.holding=false;
 if(kind!=='miss'){
  health=Math.max(0,health-15);combo=0;score-=100;judged++;hits.miss++;
  feedback='HURT · MISS';feedbackOffsetMs=null;feedbackAt=time();feedbackColor='#ff4d6a';
  animateSinger('echo',note.lane,time(),0,true);
  extraState.flashes.push({at:time(),duration:.35,color:'#e90000',alpha:.4});updateHud();
 }
 return true;
}
function extraDrawHurt(note,x,y,tail){
 const colors=['purple','blue','green','red'],anim=colors[note.lane];
 if(note.duration){ctx.save();ctx.strokeStyle='#230b31';ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,tail);ctx.stroke();ctx.strokeStyle='#e8557e';ctx.lineWidth=3;ctx.stroke();ctx.restore();}
 extraSprite('death/stage/hurt-notes',0,x-36,y-36,72,72,anim);label('×',x,y+5,18,'#ff7897');
}

// Recompose only when a background animation frame changes; camera transforms stay live.
let virusBackdrop=null;
function virusLayerKeys(){
 const keys=MOD_ART.scenes[song.sceneKey].spriteKeys,prefix=keys[0]?.slice(0,keys[0].lastIndexOf('/')+1)||'';
 const names=prefix.includes('cyber2')?['behindwall','wall','screen','floor','TV','blue','mute','blueline']:prefix.includes('window')?['week2BG','window_1','window_2','tiaowen']:['wall','Screen','floor','TV','TV left','TV right','line'];
 return names.map(n=>prefix+n).filter(k=>EXTRA_ART.sprites[k]);
}
function drawVirusBackdrop(t){
 if(!virusBackdrop||virusBackdrop.id!==songId){const surface=document.createElement('canvas');surface.width=1120;surface.height=530;virusBackdrop={id:songId,surface,context:surface.getContext('2d'),keys:virusLayerKeys(),frames:null,builds:0};}
 const cache=virusBackdrop,frames=cache.keys.map(k=>extraFrame(EXTRA_ART.sprites[k],'idle',t,12));
 if(!cache.frames||frames.some((f,i)=>f!==cache.frames[i])){
 const g=cache.context;g.clearRect(0,0,1120,530);
 for(let i=0;i<cache.keys.length;i++){const a=EXTRA_ART.sprites[cache.keys[i]],f=frames[i],im=modImages.get(f?.src||a.src);if(!im)continue;if(f)g.drawImage(im,f.x,f.y,f.w,f.h,f.ox*1120/f.fw,f.oy*530/f.fh,f.w*1120/f.fw,f.h*530/f.fh);else g.drawImage(im,0,0,1120,530);}
 cache.frames=frames;cache.builds++;
 }
 ctx.drawImage(cache.surface,0,0);
}

function impostorLayers(){
 const scene=MOD_ART.scenes[song.sceneKey],v=impostorViewLayout();
 return (scene.nativeLayers||[]).map(l=>({...l,x:v.x+l.x*v.scale,y:v.y+l.y*v.scale,w:l.w*v.scale,h:l.h*v.scale}));
}
function drawImpostorActors(t){
 const v=impostorViewLayout();
 if(extraState.ellie&&!extraState.hideSpectator)extraActor('gf',t,530,465);
 for(const side of ['nova','echo']){if(extraState.whoBuzz===1)continue;if(side==='echo'&&extraState.armedEnd!=null&&t>extraState.armedEnd+3.4)continue;if(side==='nova'&&(extraState.hiddenNova||extraState.tomongusDead))continue;const a=v?.actors[side];const x=songId==='impostor-defeat'?(side==='nova'?310:830):(a?v.x+a.x*v.scale:side==='nova'?285:835),y=a?v.y+a.y*v.scale:465;ctx.save();if(side==='nova'&&extraState.turbEnding!=null&&!song.lowSpec){const age=Math.max(0,t-extraState.turbEnding);ctx.translate(x+age*1200,y+age*350);ctx.rotate(age*8);ctx.translate(-x,-y);}extraActor(side,t,x,y);ctx.restore();}
}
function drawImpostorStage(t){
 rect(-1120,-530,3360,1590,'#000');
 for(const l of impostorLayers()){
  const alpha=impostorLayerAlpha(l,t);if(alpha<=0)continue;ctx.save();ctx.globalAlpha*=alpha;
  extraSprite(l.key,l.loop?t:Math.max(0,t)%(BEAT*4),l.x,l.y,l.w,l.h,'idle',24,l.loop);ctx.restore();
 }
 if(!extraState.impostorEnd){ctx.save();if(extraState.lightsOut)ctx.globalAlpha=.18;if(extraState.daveDead)extraState.hiddenNova=true;drawImpostorActors(t);ctx.restore();}
 if(extraState.lightsOut)rect(0,0,1120,530,'#0009');
 if(extraState.victoryDark)rect(0,0,1120,530,'#000d');
 if(extraState.pink&&!song.lowSpec){ctx.save();ctx.globalAlpha=.15+.07*Math.cos(t/BEAT*Math.PI*2);rect(0,0,1120,530,'#ff54bc');ctx.restore();}
 if(!song.lowSpec&&extraState.chrom)extraShader(extraState.chrom,t);
}

function impostorHudAlpha(t){const f=extraState?.hudFade;if(!f)return 1;const p=clamp01((t-f.at)/.7);return f.from+(f.to-f.from)*p;}
function impostorEvent(e,t){
 const s=extraState,a=e.v1,b=e.v2,n=Number(a)||0;
 const flash=(color='#fff',duration=.35,alpha=1)=>s.flashes.push({at:e.time,color,duration,alpha});
 switch(e.name){
 case 'Alter Camera Bop':s.bumpMult=Number.isFinite(Number(a))?Number(a):1;s.bumpInterval=Math.max(1,Number(b)||4);break;
 case 'Extra Cam Zoom':s.zoom=1+n;break;
 case 'Camera Twist':s.twist=Number(b)?n:0;break;
 case 'Reactor Beep':flash('#ff2020',.35,a===''?.4:Math.max(0,Math.min(1,n)));s.bumps.push({at:e.time,amount:.015});break;
 case 'flash':flash('#fff',n>=2?.55:.35);break;
 case 'HUD Fade':s.hudFade={at:e.time,from:impostorHudAlpha(e.time),to:n===1?0:1};break;
 case 'setChrom':case 'chromToggle':s.chrom=Math.max(0,Math.min(1,n));break;
 case 'Defeat Fade':s.defeatBodies={at:e.time,to:n===0?1:0};break;
 case 'Defeat Retro':s.defeatRetro=n===0;if(n===1){s.chars.echo='impostor:bf-defeat-scared';s.chars.nova='impostor:black';extraActorLabels();}break;
 case 'DefeatDark':s.defeatDark=n===1;break;
 case 'Finale Drop':s.finaleDrop=true;flash('#ff1266',.75);break;
 case 'Finale End':s.impostorEnd=true;flash('#ff1266',5);break;
 case 'Finale Flashback Change':s.finaleFlash=a;if(a==='flash')flash('#fff',1.2);break;
 case 'scream danger':s.dangerScream=true;break;
 case 'unscream danger':s.dangerScream=false;break;
 case 'Dave AUGH':s.daveDead=true;s.shake={at:e.time,duration:.6,amount:.05};break;
 case 'Lights out':case 'Lights Down OFF':s.lightsOut=true;flash();break;
 case 'Lights on':case 'Lights on Ending':s.lightsOut=false;flash();break;
 case 'pink toggle':s.pink=!s.pink;s.pinkAt=e.time;break;
 case 'Victory Darkness':s.victoryDark=a==='on';break;
 case 'Show Victory Guy':{s.victoryGuys??={};const key=a==='jor'?'bg_jor':a.startsWith('war')?'bg_war':a.startsWith('jelq')?'bg_jelq':null;if(key)s.victoryGuys[key]=b==='show'?1:0;else s.victoryGuys={bg_jor:0,bg_war:0,bg_jelq:0};break;}
 case 'Cam lock in Voting Time':case 'Cam lock in Who':s.zoom=a==='close'?1.25:a==='in'?1.2:1;s.follow=['in','close'].includes(a)?{x:b==='dad'?460:1470,y:700}:null;break;
 case 'Who Buzz':s.whoBuzz=n;s.hudFade={at:e.time,from:1,to:0};break;
 case 'Ejected Start':flash();break;
 case 'Lights Down O2':s.lightsOut=true;break;
 case 'WTF O2':if(a==='appear')s.lightsOut=false;else if(a==='die')flash('#ff0000',.75);else s.lightsOut=true;break;
 case 'Armed End':s.armedEnd=e.time;s.hudFade={at:e.time,from:1,to:0};break;
 case 'Turbulence Ending':s.turbEnding=e.time;break;
 case 'bye gf':s.hideSpectator=true;break;
 case 'Ellie Drop':s.chars.gf='impostor:ellie';s.ellie=true;break;
 case 'tomongusdie':s.tomongusDead=true;flash('#fff',.15);break;
 case 'Ejected Video':case 'Meltdown Video':s.impostorVideo={src:song.eventVideos?.[e.name],at:e.time};break;
 case 'Change Scroll Speed':s.scrollChange={at:e.time,from:impostorScrollSpeed(e.time),to:Math.max(.1,n||1),duration:Math.max(0,Number(b)||0)};break;


 default:return false;
 }return true;
}
function impostorLayerAlpha(l,t){
 const s=extraState;
 if(s.impostorEnd)return 0;
 if(s.victoryGuys&&l.name in s.victoryGuys)return s.victoryGuys[l.name];
 if(song.stage==='who'&&s.whoBuzz!=null){if(['starsBG','starsFG','whoAngered'].includes(l.name))return s.whoBuzz===1?1:0;if(['meeting','furiousRage','emergency'].includes(l.name))return s.whoBuzz===0?1:0;}
 if(song.stage==='defeat'){
  if(l.name==='mainoverlayDK')return s.defeatRetro?1:0;
  if(s.defeatDark&&l.name!=='mainoverlayDK')return 0;
  if(['bodies','bodies2','bodiesfront'].includes(l.name)){const f=s.defeatBodies;return f?f.to*clamp01((t-f.at)/.7):0;}
 }
 if(song.stage==='finalem'){
  if(['defeatthing','mainoverlayDK'].includes(l.name))return s.finaleDrop?0:l.alpha;
  if(l.name==='finaleFlashbackStuff')return s.finaleFlash&&s.finaleFlash!=='flash'?.5:0;
  if(!s.finaleDrop)return 0;
 }
 if(l.name==='airshipskyflash')return s.dangerScream?1:0;
 if(l.name==='daveDIE')return s.daveDead?1:0;
 return l.alpha;
}

function impostorScrollSpeed(t){const c=extraState?.scrollChange;if(song.pack!=='impostor'||!c)return 1;const p=c.duration?clamp01((t-c.at)/c.duration):1;return c.from+(c.to-c.from)*p;}
async function prepareImpostorVideos(){
 await Promise.all(Object.values(song.eventVideos||{}).map(src=>new Promise((resolve,reject)=>{
  if(sillyVideos.has(src)){resolve();return;}const v=document.createElement('video');v.preload='auto';v.muted=true;v.playsInline=true;v.onloadeddata=()=>{sillyVideos.set(src,v);resolve();};v.onerror=()=>reject(Error('모드 영상 로드 실패'));v.src=src;v.load();
 })));
}
function impostorVideoFrame(t){
 if(song.pack!=='impostor'||song.lowSpec)return false;
 const active=extraState?.impostorVideo,v=active&&sillyVideos.get(active.src);
 if(!v)return false;const elapsed=t-active.at;
 if(elapsed<0||elapsed>=v.duration){v.pause();return false;}
 v.playbackRate=settings.rate||1;if(Math.abs(v.currentTime-elapsed)>.25)v.currentTime=elapsed;
 if(state==='playing')v.play().catch(()=>{});else v.pause();
 ctx.drawImage(v,0,0,1120,530);return true;
}

function impostorViewLayout(){
 const v=MOD_ART.scenes[song.sceneKey].layout;
 if(songId!=='impostor-defeat'||!v)return v;
 const zoom=.82;
 return {...v,scale:v.scale*zoom,x:560+(v.x-560)*zoom,y:265+(v.y-265)*zoom};
}
