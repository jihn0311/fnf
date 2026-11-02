"use strict";
// Native chart events are kept separate from the unchanged low-spec chart.
let dustinFX=null;const dustinVideos=new Map(),dustinKeys=new Set();
function dustinFull(){return song.pack==='dustin'&&!song.lowSpec;}
function dustinEffectCharacter(key){return dustinFull()&&typeof DUSTIN_UNDYNE_QUALITY!=='undefined'&&DUSTIN_UNDYNE_QUALITY[key]||dustinFull()&&typeof DUSTIN_EFFECT_CHARACTERS!=='undefined'&&DUSTIN_EFFECT_CHARACTERS[key]||MOD_ART.characters[key];}
function dustinData(){return typeof DUSTIN_EFFECTS==='undefined'?null:DUSTIN_EFFECTS[songId];}
function dustinTempo(t){const list=dustinData()?.tempo[settings.difficulty]||[];let value={time:0,step:0,bpm:BPM};for(const item of list){if(item.time>t)break;value=item;}return value;}
function dustinStep(t){const v=dustinTempo(t);return v.step+(t-v.time)*v.bpm/15;}
function dustinStepTime(step){const list=dustinData()?.tempo[settings.difficulty]||[];let v={time:0,step:0,bpm:BPM};for(const item of list){if(item.step>step)break;v=item;}return v.time+(step-v.step)*15/v.bpm;}
function resetDustinEffects(){dustinKeys.clear();dustinFX={cursor:0,scriptCursor:0,pending:[],at:-Infinity,last:null,tweens:{},values:{hud:1,bars:0,cover:0,zoom:1,bloom:1,contrast:1,saturation:1,scroll:song.originalSpeed||1,vignette:0},layers:{},lyric:'',lyricColor:'#fff',lyricSize:24,lyricY:400,coverColor:'#000',flashes:[],camera:0,drain:1.2,drainEnabled:true,drainTime:0,karma:0,hate:0,madness:0,bones:0,direction:null,attack:null,attackCount:0,qte:null,qteDone:[],avulsionDrainStarted:false,dodgeUntil:-Infinity,dodgeReadyAt:-Infinity,blasterChecked:false,soul:{x:560,y:278,invulnerable:0,mode:'red',bombs:[],bullets:[],explosions:[],beam:null,beamIndex:-1,spawn:-1,shot:-1},echo:null,skin:{}};dustinApplyOperations(dustinData()?.scriptInitial||[],0);}
function dustinEase(p,name='linear',mode='In'){p=clamp01(p);let f=x=>x;if(name==='quad')f=x=>x*x;if(name==='cube'||name==='cubic')f=x=>x*x*x;if(name==='quart')f=x=>x**4;if(name==='quint')f=x=>x**5;if(name==='sine')f=x=>1-Math.cos(x*Math.PI/2);if(name==='circ')f=x=>1-Math.sqrt(1-x*x);if(name==='expo')f=x=>x===0?0:2**(10*x-10);return mode==='Out'?1-f(1-p):mode==='InOut'?(p<.5?f(p*2)/2:1-f((1-p)*2)/2):f(p);}
function dustinValue(key,t){const s=dustinFX;if(!s)return 1;const tw=s.tweens[key];if(!tw)return s.values[key]??0;const p=dustinEase(tw.duration?(t-tw.at)/tw.duration:1,tw.ease,tw.mode);return tw.from+(tw.to-tw.from)*p;}
function dustinTween(key,to,e,enabled,steps,ease,mode){const s=dustinFX,from=dustinValue(key,e.time);s.values[key]=Number(to)||0;s.tweens[key]={from,to:Number(to)||0,at:e.time,duration:enabled?Math.max(0,Number(steps)||0)*e.stepSeconds:0,ease,mode};}
function dustinColor(n){return '#'+((Number(n)>>>0)&0xffffff).toString(16).padStart(6,'0');}
function dustinNativeEvent(e){
 const s=dustinFX,p=e.params,t=e.time;const common=(key)=>dustinTween(key,p[1],e,p[0],p[2],p[3],p[4]);
 switch(e.name){
 case 'Change HUD Alpha':case 'New Change HUD Alpha':common('hud');break;
 case 'Cinematic Bars':common('bars');break;
 case 'Bloom Effect':common('bloom');break;
 case 'Contrast Effect':common('contrast');break;
 case 'Saturation Effect':common('saturation');break;
 case 'Change Scroll Speed':common('scroll');break;
 case 'Screen Vignette':dustinTween('vignette',p[1]*p[2],e,p[0],p[3],p[4],p[5]);break;
 case 'Screen Coverer':s.coverColor=dustinColor(p[1]);s.coverHUD=p[6]!=='camGame';s.coverFront=p[7]==='front';dustinTween('cover',p[2],e,p[0],p[3],p[4],p[5]);break;
 case 'Camera Flash':s.flashes.push({at:t,duration:Math.max(.01,p[2]*e.stepSeconds),color:dustinColor(p[1]),fade:p[0],hud:p[3]!=='camGame'});break;
 case 'Camera Bump':case 'Add Camera Zoom':extraState.bumps.push({at:t,amount:Number(p[0])||0});break;
 case 'Camera Bump Modulo':case 'Camera Modulo Change':extraState.bumpInterval=Math.max(.25,Number(p[0])||4);extraState.bumpMult=Number(p[1])||0;break;
 case 'Change Stage Zoom':if(p[0]||p[s.camera===song.dustinPlayerLine?1:s.camera===2?3:2])dustinTween('zoom',p[5]/(dustinData().sourceStageZoom||1),e,p[4],p[6],p[7],p[8]);break;
 case 'Camera Movement':s.camera=Number(p[0])||0;break;
 case 'Change Char Anim Suffix':{const side=Number(p[0])===song.dustinPlayerLine?'echo':Number(p[0])===2?'gf':'nova';extraState.alt[side]=p[1];break;}
 case 'Play Animation':{const side=Number(p[0])===song.dustinPlayerLine?'echo':Number(p[0])===2?'gf':'nova';extraState.special[side]={name:p[1],at:t};break;}
 case 'Character Ecco':s.echo={line:p[0],at:t,color:dustinColor(p[1]),alpha:p[3],scale:p[4]};break;
 case 'Change Strum Skin':s.skin[p[2]??0]=p[0];break;
 case 'Lyrics':if(p[0]==='Add Text')s.lyric=p[1];else if(p[0].includes('remove'))s.lyric='';else if(p[0]==='Set Color')s.lyricColor=dustinColor(p[2]);else if(p[0]==='Set Size')s.lyricSize=Math.min(60,Number(p[1])*.736);else if(p[0]==='Center')s.lyricY=230;else if(p[0]==='Cutscene')s.lyricY=445;break;
 case 'HScript Call':dustinCall(p[0],p[1],t);break;
 }
}
function dustinApplyOperations(ops,t){if(!dustinFX)return;for(const op of ops){if(op.delay){dustinFX.pending.push({time:t+op.delay,op:{...op,delay:0}});dustinFX.pending.sort((a,b)=>a.time-b.time);continue;}if(op.event){dustinNativeEvent({...op.event,time:t,stepSeconds:15/dustinTempo(t).bpm});continue;}const layer=dustinFX.layers[op.name]??={};layer[op.property]=op.value;if(op.property==='anim')layer.animAt=t;}}
function dustinCall(name,arg,t){const s=dustinFX;dustinApplyOperations(dustinData()?.scriptCalls[name]||[],t);
 switch(name){
 case 'lyrics':s.papyrusLyricsAt=t;break;
 case 'enableDrain':s.drainEnabled=true;s.drainTime=0;break;
 case 'disableDrain':s.drainEnabled=false;s.drainTime=0;break;
 case 'changeDrainAmount':s.drain=Number(arg)||1.2;break;
 case 'doAttack':if(!s.attack||t>=dustinAttackEnd(s.attack)){s.attack={at:t,speed:1.1,judged:false,hit:false,direction:++s.attackCount%2?1:-1};extraState.special.echo={name:'attack_prep',at:t};if(state==='playing'&&Math.abs(time()-t)<.15)extraSound('dustin:snd_b',.35);}break;
 case 'goDownScroll':dustinChangeScroll('down',t);break;
 case 'goUpScroll':dustinChangeScroll('up',t);break;
 // No goLeftScroll handler exists in this source build; preserve its no-op.
 case 'goLeftScroll':break;
 case 'moveBones':s.bones=arg==='appear'?1:0;break;
 case 'set_stageModulo':extraState.bumpInterval=Math.max(1,Number(arg)||9999);break;
 case 'mortoZoom':{const values=String(arg).split(',').map(Number);s.values.zoom=values[0]/(dustinData().sourceStageZoom||1);delete s.tweens.zoom;break;}
 case 'sansSpeaks':s.camera=song.dustinPlayerLine;break;
 case 'papsWhat':s.camera=0;break;
 case 'fadeSansStrums':s.opponentAlpha=Number(arg);break;
 case 'genoTextOpen':s.lyric='';break;
 case 'genoText':s.lyric+=String(arg).replaceAll('\\n','\n');s.lyricY=330;break;
 case 'flash_red':s.flashes.push({at:t,duration:.4,color:'#f00',fade:false});break;
 case 'pixelbump':case 'epicbump':case 'swagbump':case 'cineHit':extraState.bumps.push({at:t,amount:name==='pixelbump'?.04:.09});break;
 case 'epicimpact':s.flashes.push({at:t,duration:.13,color:'#fff',fade:false});break;
 case 'backgroundFade':s.backgroundDark=true;break;
 case 'phantomIn':s.phantom=true;break;
 case 'phantomOut':s.phantom=false;break;
 case 'toggleTv':s.tv=String(arg).includes('LOVE');break;
 case 'changeToSans':case 'switchToSans':s.sansStage=true;break;
 case 'bgFog':s.fog=true;break;
 case 'add_abberation':s.aberration=true;break;
 case 'remove_abberation':s.aberration=false;break;
 }
}
async function prepareDustinEffects(){
 for(const item of dustinVideos.values()){item.video.pause();item.video.removeAttribute('src');item.video.load();URL.revokeObjectURL(item.url);}dustinVideos.clear();
 if(!dustinFull())return;resetDustinEffects();const data=dustinData();if(!data)return;
 const keys=[...data.layers.map(l=>l.key),...Object.keys(EXTRA_ART.sprites).filter(k=>k.startsWith('dustin/effects/game/')&&(!k.includes('/notes/')||k.includes('/types/')||data.skins.some(s=>k.endsWith('/'+s)||k.endsWith('/'+s+'_END')||k.endsWith('/'+s+'_ENDs'))))];const charPaths=[...MOD_ART.scenes[song.sceneKey].characters,...(songId==='dustin-avulsion'?['dustin:papyrus_lyrics']:[])].flatMap(key=>{const a=dustinEffectCharacter(key);return a.pages||[a.src];});const paths=[...new Set([...charPaths,...keys.flatMap(k=>EXTRA_ART.sprites[k]?.pages||[EXTRA_ART.sprites[k]?.src]).filter(Boolean)])];let next=0;
 await Promise.all(Array.from({length:3},async()=>{while(next<paths.length){const src=paths[next++];if(modImages.has(src))continue;const im=new Image();im.src=src;await im.decode();modImages.set(src,im);}}));
 if(audio?.decodeAudioData)for(const [name,src] of Object.entries(data.sounds||{})){const key='dustin:'+name;if(!extraSoundBuffers.has(key)){const response=await fetch(src);if(!response.ok)throw Error('Dustin sound load failed: '+name);extraSoundBuffers.set(key,await audio.decodeAudioData(await response.arrayBuffer()));}}
 // Fetch complete videos before countdown: no late network fetch during an attack.
 for(const [name,src] of Object.entries({...data.videos,...Object.fromEntries(Object.entries(data.storyVideos||{}).map(([k,v])=>['story:'+k,v]))})){const r=await fetch(src);if(!r.ok)throw Error('더스틴 영상 준비 실패: '+name);const url=URL.createObjectURL(await r.blob()),video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';video.src=url;await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=()=>reject(Error('더스틴 영상 재생 불가: '+name));});dustinVideos.set(name,{video,url,story:name.startsWith('story:')});}
}
function updateDustinEffects(t){
 if(!dustinFull()||!dustinData())return;if(!dustinFX||t<dustinFX.at)resetDustinEffects();const s=dustinFX,events=dustinData().events[settings.difficulty]||[];
 const scriptSteps=dustinData().scriptSteps||[];
 // Merge all three clocks so seeks and frame stalls produce the same state as playback.
 while(true){const chartAt=events[s.cursor]?.time??Infinity,scriptAt=s.scriptCursor<scriptSteps.length?dustinStepTime(scriptSteps[s.scriptCursor].step):Infinity,pendingAt=s.pending[0]?.time??Infinity;const at=Math.min(chartAt,scriptAt,pendingAt);if(at>t||!Number.isFinite(at))break;if(chartAt===at)dustinNativeEvent(events[s.cursor++]);else if(scriptAt===at){const cue=scriptSteps[s.scriptCursor++];dustinApplyOperations(cue.operations,at);}else{const cue=s.pending.shift();dustinApplyOperations([cue.op],at);}}
 s.at=t;s.flashes=s.flashes.filter(f=>t<f.at+f.duration);
 if(s.attack&&t>=dustinAttackEnd(s.attack)&&extraState.special.echo?.name.startsWith('attack'))delete extraState.special.echo;
 if(state!=='playing'){s.last=null;return;}const dt=s.last===null?0:Math.max(0,Math.min(.1,(t-s.last)/(settings.rate||1)));s.last=t;
 if(s.drainEnabled&&s.drainTime>0&&songId==='dustin-broken-reality'){health=Math.max(7.5,health-2.5*s.drain*(s.attack?.hit?.65:1)*dt);s.drainTime=Math.max(0,s.drainTime-dt);}
 if(s.karma>0){s.karma=Math.max(0,s.karma-dt);health=Math.max(5,health-5*dt);}
 const step=dustinStep(t);
 if(songId==='dustin-avulsion'&&step>=2110&&step<2238){if(!s.avulsionDrainStarted){health=100;s.avulsionDrainStarted=true;}const ramp=step<2116?.3:.46+.2*clamp01((t-dustinStepTime(2116))/10)**2;if(!settings.bot)health=Math.max(0,health-ramp*.96*50*dt);}
 if(songId==='dustin-lorem-ipsum'){for(const cue of [234,1764,1812,1860,1908])if(step>=cue&&step<cue+12&&!s.qteDone.includes(cue)){s.qte={step:cue,end:dustinStepTime(cue+12)};s.qteDone.push(cue);}if(s.qte){if(settings.bot&&t>=s.qte.end-.12*(settings.rate||1))s.qte=null;else if(t>s.qte.end){health=0;s.qte=null;}}}
 if(songId==='dustin-perseverance'&&step>=2281&&!s.blasterChecked){s.blasterChecked=true;if(!settings.bot&&t>s.dodgeUntil)health=Math.min(health,2.5);}
 if(s.attack&&settings.bot&&!s.attack.judged&&t-s.attack.at>=.4+.5/s.attack.speed)dustinAttackPress(t);
 updateDustinSoul(t,dt,step);if(s.healthShown!==Math.round(health)){s.healthShown=Math.round(health);updateHud();}
}
function dustinOnNote(note,side){if(!dustinFull()||!dustinFX)return;if(side===autoSide()&&songId==='dustin-broken-reality')dustinFX.drainTime+=.12;if(side===autoSide()&&['dustin-overthrone','dustin-red-demon-o'].includes(songId)){const damage=[0,.003,.005,.008,.01,.012,.014,.016][Math.min(7,dustinFX.madness)]*50;if(health>1)health=Math.max(1,health-damage);}}
function dustinHazard(note,kind){if(!dustinFull()||!note.hurt)return false;note.done=true;note.holding=false;if(kind==='miss')return true;const s=dustinFX;
 if(note.sourceNoteType==='NOTE_karma')s.karma=5;
 else if(note.sourceNoteType==='NOTE_hate'){if(s.hate>=1)health=0;else s.hate=Math.min(1,s.hate+.2);}
 else{health=Math.max(0,health-5);s.madness++;if(s.madness>=8)health=0;}
 s.flashes.push({at:time(),duration:.2,color:'#f00'});feedback=note.sourceNoteType==='NOTE_karma'?'KARMA':note.sourceNoteType==='NOTE_hate'?'HATE':'MADNESS';feedbackAt=time();feedbackColor='#ff539d';feedbackOffsetMs=null;updateHud();return true;}
function dustinAttackPress(t){const s=dustinFX,a=s?.attack;if(!a||a.judged||t<a.at+.4||t>a.at+.4+1/a.speed)return false;const distance=Math.abs(-.5+(t-a.at-.4)*a.speed);if(distance>.3942)return true;const gain=distance<=.0547?.63:distance<=.1898?.45:.24;a.judged=true;a.hit=true;a.judgedAt=t;a.position=clamp01((t-a.at-.4)*a.speed);extraState.special.echo={name:'attack',at:t+.2};if(state==='playing')extraSound('dustin:snd_laz',1);a.rating=distance<=.0547?'PERFECT':distance<=.1898?'GOOD':'BAD';health=Math.min(100,health+gain*50*Math.max(1,s.drain*.47));return true;}
function dustinKey(e,down){if(!dustinFull()||state!=='playing')return false;const key=e.code||e.key;if(down)dustinKeys.add(key);else dustinKeys.delete(key);const step=dustinStep(time());if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyZ'].includes(key)&&dustinSoulActive(step)){e.preventDefault();return true;}if(down&&!e.repeat&&key==='Space'){e.preventDefault();if(songId==='dustin-avulsion'&&step>=2110&&step<2238)health=Math.min(100,health+.053*50);if(dustinFX.qte&&time()>=dustinFX.qte.end-.24*(settings.rate||1)&&time()<=dustinFX.qte.end)dustinFX.qte=null;if(songId==='dustin-perseverance'&&step>=2192&&step<=2281&&time()>=dustinFX.dodgeReadyAt){dustinFX.dodgeUntil=time()+.8*(settings.rate||1);dustinFX.dodgeReadyAt=time()+1*(settings.rate||1);extraState.special.echo={name:'dodge',at:time()};}dustinAttackPress(time());return true;}return false;}
function dustinSoulActive(step){return dustinFull()&&songId==='dustin-heatwave'&&((step>=4&&step<112)||(step>=1984&&step<2204));}
function updateDustinSoul(t,dt,step){if(!dustinSoulActive(step))return;const s=dustinFX.soul,scale=1120/1280;const dx=(dustinKeys.has('ArrowRight')?1:0)-(dustinKeys.has('ArrowLeft')?1:0),dy=(dustinKeys.has('ArrowDown')?1:0)-(dustinKeys.has('ArrowUp')?1:0);s.x=Math.max(452,Math.min(668,s.x+dx*176.7*dt*scale));s.y=Math.max(192,Math.min(364,s.y+dy*176.7*dt*scale));s.mode=step>=63?'yellow':'red';s.invulnerable=Math.max(0,s.invulnerable-dt);
 if(settings.bot){s.x=560;s.y=330;}
 if(dustinKeys.has('KeyZ')&&s.mode==='yellow'&&t-s.shot>.18){s.shot=t;s.bullets.push({x:s.x,y:s.y});}
 for(const b of s.bullets)b.y-=450*dt;s.bullets=s.bullets.filter(b=>b.y>140);
 if(step>=63&&step<112&&s.spawn<0){s.spawn=t;s.bombs.push({x:560,y:210,still:true});}
 if(step>=1984&&step<2180&&t-s.spawn>=1.5){s.spawn=t;const k=Math.floor(t/1.5);for(let i=0;i<2+k%3;i++)s.bombs.push({x:470+(k*37)%70+i*36,y:150});}
 for(const b of s.bombs){if(!b.still)b.y+=330*dt*scale;for(const bullet of s.bullets)if(Math.abs(b.x-bullet.x)<18&&Math.abs(b.y-bullet.y)<18){b.dead=true;s.explosions.push({x:b.x,y:b.y,at:t});bullet.y=-999;}if(!settings.bot&&s.invulnerable<=0&&Math.abs(b.x-s.x)<18&&Math.abs(b.y-s.y)<18&&step<2180){health=Math.max(0,health-5);s.invulnerable=2/3;}}
 s.bombs=s.bombs.filter(b=>!b.dead&&b.y<420);s.explosions=s.explosions.filter(e=>t-e.at<.35);for(const e of s.explosions)if(!settings.bot&&s.invulnerable<=0&&step<2180&&(Math.abs(e.x-s.x)<10||Math.abs(e.y-s.y)<10)){health=Math.max(0,health-5);s.invulnerable=2/3;}
 if(step>=1984&&step<2180){const index=Math.floor((step-1984)/32),phase=(step-1984)%32;if(phase>=6.9&&s.beamIndex!==index){s.beamIndex=index;s.beam={at:t,y:195+(index*47)%150,right:!!(index%2)};}if(s.beam&&t-s.beam.at>.65&&t-s.beam.at<1.05&&!settings.bot&&s.invulnerable<=0&&Math.abs(s.y-s.beam.y)<14){health=Math.max(0,health-15);s.invulnerable=2/3;}}
 // Bone walls follow the source sinusoidal corridor and use the same 0.1 health damage.
 if(step>=1984&&step<2180){const wall=24+14*Math.sin((t-dustinStepTime(1984))*2.5);if(!settings.bot&&s.invulnerable<=0&&(s.x<452+wall||s.x>668-wall)){health=Math.max(0,health-5);s.invulnerable=2/3;}}
}
function dustinScrollFactor(t){return dustinFull()&&dustinFX?Math.max(.05,dustinValue('scroll',t)/(song.originalSpeed||1)):1;}
function dustinScrollDirection(side='echo',t=typeof time==='function'?time():0){return dustinScrollLayout(side,t).sign<0?'down':'up';}
function dustinChangeScroll(direction,t){
 const s=dustinFX,from=dustinScrollLayout('echo',t),base=settings.scroll==='down'?-1:1;
 const sign=direction==='down'?-base:base;
 s.direction=direction;s.scrollTransition={at:t,stepSeconds:15/dustinTempo(t).bpm,from,to:{sign,y:sign<0?448:82}};
}
function dustinScrollLayout(side='echo',t=0){
 const sign=settings.scroll==='down'?-1:1,base={sign,y:sign<0?448:82};
 if(!dustinFull()||side!=='echo'||!dustinFX?.scrollTransition)return base;
 const q=dustinFX.scrollTransition,steps=(t-q.at)/q.stepSeconds;
 if(steps>=4)return q.to;if(steps<=0)return q.from;
 const p=steps<2.25?.35*dustinEase(steps/2.25,'sine','In'):.35+.65*dustinEase((steps-2.25)/1.75,'circ','Out');
 return {sign:q.from.sign+(q.to.sign-q.from.sign)*p,y:q.from.y+(q.to.y-q.from.y)*p};
}
function dustinOffset(lane,side,t){if(!dustinFull()||songId!=='dustin-kinemorto'||side!==playerSide())return {x:0,y:0};const step=dustinStep(t),active=step>=544&&step<800||step>=1000&&step<1592;if(!active)return {x:0,y:0};const amount=step>=1000?1.3:1;return {x:10*Math.cos(t*3+lane*BEAT*2)*amount,y:8*Math.sin(t*3+lane*BEAT*2)*amount};}
function drawDustinVideo(t){let active=null;for(const e of dustinData()?.events[settings.difficulty]||[]){if(e.time>t)break;if(e.name==='Video Cutscene'){const item=dustinVideos.get(e.params[0]);if(item&&t<e.time+item.video.duration)active={...item,at:e.time};}}
 for(const item of dustinVideos.values())if(!item.story&&item.video!==active?.video&&!item.video.paused)item.video.pause();if(!active)return false;const v=active.video,target=Math.max(0,t-active.at);if(!v.seeking&&Math.abs(v.currentTime-target)>.2)v.currentTime=target;v.playbackRate=settings.rate||1;if(state==='playing'){if(v.paused)v.play().catch(()=>{});}else if(!v.paused)v.pause();rect(0,0,1120,530,'#000');if(v.readyState>=2){const z=Math.min(1120/v.videoWidth,530/v.videoHeight);ctx.drawImage(v,(1120-v.videoWidth*z)/2,(530-v.videoHeight*z)/2,v.videoWidth*z,v.videoHeight*z);}return true;}
function drawDustinNativeStage(t){if(!dustinFull()||!dustinFX)return false;if(drawDustinVideo(t))return true;const data=dustinData();if(!data?.layers.length||dustinPixel())return false;const s=dustinFX;rect(0,0,1120,530,'#080810');ctx.save();const z=Math.max(.3,Math.min(songId==='dustin-broken-reality'?1.1:3,dustinValue('zoom',t)))*(songId==='dustin-heatwave'?.78:songId==='dustin-broken-reality'?.8:1);ctx.translate(560,265);ctx.scale(z,z);ctx.translate(-560,-265);ctx.filter='brightness('+dustinStageBrightness(t)+') contrast('+Math.max(0,dustinValue('contrast',t))+') saturate('+Math.max(0,dustinValue('saturation',t))+')';
 const layer=l=>{const o=s.layers[l.name]||{};if(l.variant==='sans'&&!s.sansStage)return;if(songId==='dustin-kinemorto'&&s.sansStage&&l.variant!=='sans'&&l.name!=='BG')return;if(!(o.visible??l.visible)&&l.variant!=='sans')return;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,o.alpha??l.alpha));extraSprite(l.key,o.anim?t-(o.animAt||0):t,l.x,l.y,l.w,l.h,o.anim||'idle');ctx.restore();};if(songId==='dustin-kinemorto'&&s.sansStage){for(const l of data.layers)layer(l);drawDustinActors(t);}else if(data.drawOrder?.length){for(const item of data.drawOrder){if(item.side){if(item.side==='gf'&&songId==='dustin-heatwave')drawDustinMettaton(t);else{if(item.side==='nova')drawDustinPhantom(t);drawDustinActors(t,item.side);}}else for(const l of data.layers)if(l.name===item.name)layer(l);}}else{for(const l of data.layers.filter(l=>!l.front))layer(l);drawDustinActors(t);for(const l of data.layers.filter(l=>l.front))layer(l);}if(s.backgroundDark)rect(0,0,1120,530,'#000a');ctx.restore();return true;}
function drawDustinEffectsHud(t){if(!dustinFull()||!dustinFX)return;const s=dustinFX,step=dustinStep(t),bars=Math.max(0,Math.min(265,dustinValue('bars',t)*265));if(bars){rect(0,0,1120,bars,'#000');rect(0,530-bars,1120,bars,'#000');}const cover=clamp01(dustinValue('cover',t));if(cover&&s.coverHUD&&s.coverFront){ctx.save();ctx.globalAlpha=cover;rect(0,0,1120,530,s.coverColor);ctx.restore();}for(const f of s.flashes){ctx.save();ctx.globalAlpha=clamp01(f.fade?(t-f.at)/f.duration:1-(t-f.at)/f.duration);rect(0,0,1120,530,f.color);ctx.restore();}
 drawDustinLyricsActor(t);
 const vig=Math.min(.95,Math.max(s.hate,dustinValue('vignette',t)*.35));if(vig){const g=ctx.createRadialGradient(560,265,120,560,265,610);g.addColorStop(0,'#0000');g.addColorStop(1,'rgba(0,0,0,'+vig+')');ctx.fillStyle=g;ctx.fillRect(0,0,1120,530);}
 if(s.lyric)String(s.lyric).split('\n').forEach((line,i)=>label(line,560,s.lyricY+i*(s.lyricSize+3),s.lyricSize,s.lyricColor));
 if(s.fog){ctx.save();ctx.globalAlpha=.18;const fog=ctx.createLinearGradient(0,300,0,530);fog.addColorStop(0,'#bdd2dc00');fog.addColorStop(1,'#bdd2dc');ctx.fillStyle=fog;ctx.fillRect(0,300,1120,230);ctx.restore();}
 if(s.bones){const key='dustin/effects/game/mechanics/strum_covering_bones';extraSprite(key,t,650,180,430,300);}
 if(songId==='dustin-perseverance'&&step>=2256&&step<2284){label('SPACE · 회피',560,350,25,'#fff');extraSprite('dustin/effects/ruins_exit/BLASTER',Math.max(0,t-dustinStepTime(2256)),380,100,360,280,step>=2280?'blaster_blast':'blaster_idle');}
 drawDustinAttack(t);
 if(dustinSoulActive(step)){const soul=s.soul;rect(444,180,232,196,'#fff');rect(450,186,220,184,'#050505');if(step>=1984){const wall=24+14*Math.sin((t-dustinStepTime(1984))*2.5);for(let y=190;y<365;y+=12){rect(450,y,wall,5,'#eee');rect(670-wall,y,wall,5,'#eee');}}for(const b of soul.bombs)extraSprite('dustin/effects/game/undertale/spr_plusbomb',0,b.x-13,b.y-13,26,26);for(const e of soul.explosions){ctx.save();ctx.globalAlpha=1-(t-e.at)/.35;rect(450,e.y-6,220,12,'#fff');rect(e.x-6,186,12,184,'#fff');ctx.restore();}if(soul.beam&&t-soul.beam.at<1.1){const beam=soul.beam,age=t-beam.at;ctx.save();if(!beam.right){ctx.translate(560,0);ctx.scale(-1,1);ctx.translate(-560,0);}extraSprite('dustin/effects/game/undertale/spr_gasterblaster',age,680,beam.y-35,80,70);ctx.restore();if(age>.65)rect(450,beam.y-12,220,24,'#fff');else{ctx.save();ctx.globalAlpha=.3;rect(450,beam.y-2,220,4,'#ff3939');ctx.restore();}}for(const b of soul.bullets)rect(b.x-2,b.y,4,10,'#ffed30');label('♥',soul.x,soul.y+7,25,soul.mode==='yellow'?'#ffe52b':'#f22');label('방향키 이동 · Z 발사',560,404,15,'#fff');}
 if(s.qte){const span=s.qte.end-dustinStepTime(s.qte.step),progress=clamp01((t-dustinStepTime(s.qte.step))/Math.max(.01,span-.12));ctx.strokeStyle=t>=s.qte.end-.24*(settings.rate||1)?'#f22':'#fff';ctx.lineWidth=4;for(const radius of [34,34*(3.24-2.24*progress)]){ctx.beginPath();ctx.arc(560,265,radius,0,Math.PI*2);ctx.stroke();}label('빨갛게 변하면 SPACE',560,385,21,'#fff');}
 if(songId==='dustin-avulsion'&&step>=2110&&step<2238)label('SPACE 연타 · 버티기',560,360,25,'#ff3030');
 if(s.karma>0)label('KARMA '+s.karma.toFixed(1),560,475,13,'#f300ff');if(s.madness)label('MADNESS '+s.madness,560,493,13,'#f66');
}

let dustinStoryCancel=null;
async function playDustinStory(kind){
 if(!dustinFull())return;const item=dustinVideos.get('story:'+kind);if(!item)return;
 const video=item.video,dialog=document.createElement('dialog'),skip=document.createElement('button');dialog.style.cssText='padding:0;border:2px solid #fff;background:#000;color:white;width:min(100vw,1100px);max-width:100vw';video.style.cssText='display:block;width:100%;max-height:80vh';video.controls=true;video.muted=muted;video.volume=.65;video.playbackRate=1;video.currentTime=0;skip.textContent='컷신 건너뛰기';skip.style.cssText='display:block;margin:10px auto;padding:10px 24px';dialog.append(video,skip);document.body.append(dialog);dialog.showModal();
 await new Promise(resolve=>{let closed=false;const done=()=>{if(closed)return;closed=true;video.pause();video.removeEventListener('ended',done);dialog.close();video.remove();dialog.remove();video.muted=true;video.controls=false;dustinStoryCancel=null;resolve();};dustinStoryCancel=done;video.addEventListener('ended',done);skip.onclick=done;dialog.addEventListener('cancel',e=>{e.preventDefault();done();});video.play().catch(()=>{});});
}
function pauseDustinVideos(){for(const item of dustinVideos.values())item.video.pause();dustinKeys.clear();}

function dustinSkinAt(t){let skin=dustinData().noteSkin;for(const e of dustinData().events[settings.difficulty]||[]){if(e.time>t)break;if(e.name==='Change Strum Skin')skin=e.params[0];}return skin;}
function dustinNoteSprite(skin,lane,x,y,kind='head',lit=false){
 const a=EXTRA_ART.sprites['dustin/effects/game/notes/'+skin];if(!a)return false;
 const color=['purple','blue','green','red'][lane],direction=['left','down','up','right'][lane];
 if(!a.animations){const im=modImages.get(a.src);if(!im)return false;const index=kind==='receptor'?(lit?12+lane:lane):4+lane;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,(index%4)*17,Math.floor(index/4)*17,17,17,x-36,y-36,72,72);ctx.restore();return true;}
 const key=kind==='receptor'?(lit?direction+' confirm':'arrow'+direction.toUpperCase()):color;const frames=a.animations[key];if(!frames?.length)return false;const f=frames[0],im=modImages.get(f.src||a.src);if(!im)return false;const ratio=Math.min(78/f.fw,78/f.fh);ctx.drawImage(im,f.x,f.y,f.w,f.h,x-f.fw*ratio/2+f.ox*ratio,y-f.fh*ratio/2+f.oy*ratio,f.w*ratio,f.h*ratio);return true;
}
function drawDustinReceptor(lane,x,y,lit,t){return dustinFull()&&dustinNoteSprite(dustinSkinAt(t),lane,x,y,'receptor',lit);}
function drawDustinNote(note,x,y,tail,t){if(!dustinFull())return false;const skin=note.hurt?'types/'+note.sourceNoteType:(note.dustinSkin||dustinData().noteSkin);if(note.duration){const a=EXTRA_ART.sprites['dustin/effects/game/notes/'+skin],key=['purple','blue','green','red'][note.lane]+' hold piece',f=a?.animations?.[key]?.[0],im=f&&modImages.get(f.src||a.src);if(im)ctx.drawImage(im,f.x,f.y,f.w,f.h,x-12,Math.min(y,tail),24,Math.abs(tail-y));else sustainSkin(x,y,tail,note.lane,COLORS[note.lane],false);}return dustinNoteSprite(skin,note.lane,x,y);}

function drawDustinLyricsActor(t){
 const at=dustinFX?.papyrusLyricsAt;if(songId!=='dustin-avulsion'||at==null||t<at)return;
 const a=dustinEffectCharacter('dustin:papyrus_lyrics');if(!a)return;
 const frames=a.animations.lyrics||a.animations.idle,c=a.config?.lyrics||a.config?.idle;
 const elapsed=t-at,duration=frames.length/(c?.fps||24);if(elapsed>duration)return;
 const f=extraFrame(a,'lyrics',elapsed,24,false),im=f&&modImages.get(f.src||a.src);if(!im)return;
 const view=MOD_ART.scenes[song.sceneKey].dustinView;
 ctx.save();ctx.globalAlpha=clamp01(elapsed/(12*15/dustinTempo(at).bpm));
 // Use the native XML scale and song camera anchor, not the regular spectator slot.
 const anchor=frames[0],scale=Math.min(620/(anchor.fw||anchor.w),440/(anchor.fh||anchor.h)),x=560-(anchor.fw||anchor.w)*scale/2,y=65;
 const off=c?.offsets||[500,300];ctx.translate(x,y);ctx.scale(scale,scale);
 ctx.drawImage(im,f.x,f.y,f.w,f.h,(f.ox||0),(f.oy||0),f.w,f.h);ctx.restore();
}

function drawDustinMettaton(t){
 const step=dustinStep(t);if(step<1088||step>=2224)return;
 const scene=MOD_ART.scenes[song.sceneKey],v=scene.dustinView,key='dustin:mtt',p=v.slots[2]?.[key],a=dustinEffectCharacter(key);if(!p||!a)return;
 const previous=extraState.chars.gf,previousActor=actors.gf;extraState.chars.gf=key;actors.gf=extraState.dustinActors?.[2]||{lane:-1,until:-1};
 const emerging=step<1216,dy=emerging?1000*(1-clamp01((step-1088)/116)):51*Math.sin(t*2),dx=emerging?0:204*Math.sin(t);
 ctx.save();ctx.translate((p.x-v.left+dx)*v.scale,(p.y-v.top+dy)*v.scale);const z=p.z*v.scale/a.scale*.72;ctx.scale(z,z);try{extraActor('gf',t,0,0);}finally{ctx.restore();extraState.chars.gf=previous;actors.gf=previousActor;}
}

function dustinUnderlay(t){
 if(!dustinFull()||!dustinFX)return;const s=dustinFX;
 if(s.coverHUD&&s.coverFront)return;
 const alpha=clamp01(dustinValue('cover',t));if(!alpha)return;
 ctx.save();ctx.globalAlpha=alpha;rect(0,0,1120,530,s.coverColor);ctx.restore();
}

function dustinAttackEnd(a){return a.hit?a.judgedAt+50/30:a.at+.4+1/a.speed+16/30;}
function dustinAttackPose(side,t){
 if(!dustinFull()||songId!=='dustin-broken-reality'||side!=='echo')return null;
 const a=dustinFX?.attack;if(!a||t<a.at||t>=dustinAttackEnd(a))return null;
 if(a.hit&&t>=a.judgedAt+.2)return {key:'attack',elapsed:t-a.judgedAt-.2};
 const expired=a.at+.4+1/a.speed;
 if(!a.hit&&t>=expired)return {key:'attack_back',elapsed:t-expired};
 return t-a.at<.5?{key:'attack_prep',elapsed:t-a.at}:{key:'attack_prep-loop',elapsed:t-a.at-.5};
}
function drawDustinAttack(t){
 const a=dustinFX?.attack;if(!a||t<a.at||t>=dustinAttackEnd(a))return;
 const expired=a.at+.4+1/a.speed,miss=!a.hit&&t>=expired;
 const alpha=clamp01((t-a.at)/.15)*clamp01((dustinAttackEnd(a)-t)/.2);
 ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
 const w=430,x=560-w/2,y=settings.scroll==='down'?82:410;
 extraSprite('dustin/effects/game/undertale/spr_target',0,x,y,w,60);
 if(t>=a.at+.4&&!miss){const p=a.hit?a.position:clamp01((t-a.at-.4)*a.speed),cx=x+w*(a.direction===-1?1-p:p);extraSprite('dustin/effects/game/undertale/spr_targetchoice',a.hit?t-a.judgedAt:0,cx-6,y-3,12,66);}
 label(a.hit?a.rating:miss?'MISS...':'SPACE · 공격',560,y-12,15,a.hit?'#a8ffa8':miss?'#ff4444':'#fff');ctx.restore();
}

function dustinAttackOffset(side,t,scale){
 const a=dustinFX?.attack;if(!dustinFull()||songId!=='dustin-broken-reality'||!a?.hit)return {x:0,y:0};
 const age=t-a.judgedAt;
 if(side==='echo'&&age>=.55&&age<1.3)return {x:2660*scale,y:-330*scale};
 if(side==='nova'&&age>=.9&&age<1.3){const recoil=1-clamp01((age-.9)/.4);return {x:200*scale*recoil,y:70*scale*recoil};}
 return {x:0,y:0};
}

function dustinStageBrightness(t){return Math.max(1,Math.min(3,dustinValue('bloom',t)));}
function drawDustinPhantom(t){
 if(!dustinFull()||songId!=='dustin-broken-reality')return;
 let at=null,visible=false;const step=dustinStep(t);
 for(const cue of [{step:976,on:true},{step:1104,on:false},{step:1320,on:true},{step:1360,on:false},{step:4834,on:true},{step:4928,on:false},{step:5186,on:true}]){if(cue.step>step)break;at=dustinStepTime(cue.step);visible=cue.on;}
 if(at===null&&!extraState.brPhantomLead)return;const alpha=extraState.brPhantomLead?.56:.56*(visible?clamp01((t-at)/2):1-clamp01((t-at)/.5));if(alpha<=0)return;
 const scene=MOD_ART.scenes[song.sceneKey],v=scene.dustinView,key=extraState.dustinLines[3],a=dustinEffectCharacter(key),sans=extraState.dustinLines[0],p=v.slots[0]?.[sans];if(!a||!p)return;
 const old=extraState.chars.gf,oldActor=actors.gf;extraState.chars.gf=key;actors.gf=extraState.dustinActors[3]||{lane:-1,until:-1};
 ctx.save();ctx.globalAlpha=alpha;ctx.translate((p.x-v.left+250)*v.scale,(p.y-v.top-60)*v.scale);const z=1.3*v.scale/a.scale;ctx.scale(z,z);try{extraActor('gf',t,0,0);}finally{ctx.restore();extraState.chars.gf=old;actors.gf=oldActor;}
}
