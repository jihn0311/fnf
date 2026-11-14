let mobileMode=false;
try{mobileMode=localStorage.getItem('fnf-mobile-mode')==='true';}catch{}
function refreshMobileMode(){const button=document.getElementById('mobile-mode');button.textContent='모바일 모드 '+(mobileMode?'ON':'OFF');button.setAttribute('aria-pressed',String(mobileMode));const jump=document.getElementById('undertale-jump');if(jump)jump.hidden=!mobileMode||!undertaleActive()||song.lowSpec||state!=='playing';}
document.getElementById('mobile-mode').addEventListener('click',()=>{mobileMode=!mobileMode;try{localStorage.setItem('fnf-mobile-mode',String(mobileMode));}catch{}refreshMobileMode();});
refreshMobileMode();
'use strict';
let undertaleState=null;
function undertaleActive(){return song.pack==='undertale';}
function undertaleReset(){undertaleState={id:songId,at:-1,beat:-1,lane:1,jump:-100,attacks:[],selection:[0],serial:0,dialogue:null};}
function undertalePhase(beat){const list=UNDERTALE_EVENTS[song.stage]?.[settings.difficulty==='hard'?'hard':'normal']||[];let row=list[0];for(const item of list){if(item.beat>beat)break;row=item;}return row?.state||{};}
function undertaleMove(lane,t){if(!undertaleActive())return;if(!undertaleState||undertaleState.id!==songId)undertaleReset();undertaleState.lane=lane;}
function undertaleJump(){if(!undertaleActive()||song.lowSpec||state!=='playing')return;const t=time();if(!undertaleState)undertaleReset();if(t-undertaleState.jump>=.6*(settings.rate||1))undertaleState.jump=t;}
function undertaleSchedule(beat,s){const u=undertaleState,t=beat*BEAT;const add=(kind,lanes,delay)=>u.attacks.push({kind,lanes,warning:t,at:t+delay*BEAT,done:false});const lane=n=>((Math.imul(beat+17+n*31,1664525)>>>0)%4);
 if(s.slashAttack&&beat%4===0||s.slashExtra&&beat%4===2)add('slash',[0,1,2,3],1);
 if((s.lightningSlow||s.lightningFast)&&beat%4===0){u.selection=[lane(0)];add('beam',u.selection,s.lightningSlow?2:1);if(s.lightningFast)add('beam',u.selection,3);}
 if(s.lightningAll||s.lightningSequence)add('beam',[s.lightningSequence?beat%4:lane(0)],1);
 if(s.lightningTriple&&beat%4===0||s.lightningTripleBreakbeat&&(beat%8===0||beat%8===5))add('beam',[0,1,2,3].filter(i=>i!==lane(0)),2);
 if(s.lightningUnfair&&beat%4===0)add('finale',[0,1,2,3],0);
}
function updateUndertale(t){if(!undertaleActive())return;if(!undertaleState||undertaleState.id!==songId||t<undertaleState.at)undertaleReset();const u=undertaleState,beat=Math.floor(t/BEAT);
 // Rebuild only recent warnings on seek/resume; do not apply damage for skipped time.
 if(u.beat<beat-12)u.beat=beat-5;
 for(let b=Math.max(0,u.beat+1);b<=beat;b++){const s=undertalePhase(b);if(!song.lowSpec)undertaleSchedule(b,s);const rows=UNDERTALE_EVENTS[song.stage]?.[settings.difficulty==='hard'?'hard':'normal']||[];for(const row of rows)if(row.beat===b)for(const log of row.logs){if(log.dialogue){const lines=song.undertaleDialogues[log.dialogue]||[];u.dialogue={at:b*BEAT,lines};}if(log.text)u.title={at:b*BEAT,text:log.text};if(log.attack==='slash')u.attacks.push({kind:'slash',lanes:[0,1,2,3],warning:b*BEAT-BEAT,at:b*BEAT,done:false});}}
 u.beat=beat;for(const attack of u.attacks){if(attack.done||t<attack.at)continue;if(state!=='playing')continue;attack.done=true;if(settings.bot||attack.at<resumeGraceUntil||song.lowSpec)continue;const jumping=attack.at>=u.jump&&attack.at-u.jump<.6*(settings.rate||1);const hit=attack.kind==='slash'?!jumping:(attack.kind==='beam'||attack.kind==='finale')&&attack.lanes.includes(u.lane);if(hit){extraSound('undertale-damage',.8);health=attack.kind==='finale'?Math.min(health,25):Math.max(0,health-(song.stage==='hopes-and-dreams'?10:5));combo=0;hits.miss++;score-=100;feedback='SOUL HIT';feedbackAt=t;feedbackOffsetMs=null;feedbackColor='#ff7272';updateHud();}}
 u.attacks=u.attacks.filter(a=>t<a.at+Math.max(.5,13/24));u.at=t;
}
function undertaleLayers(){return song.stage==='megalovania'?[{key:'undertale/fx/hall',x:0,y:0,w:1120,h:530}]:[];}
function drawUndertaleActors(t){const phase=undertalePhase(t/BEAT),slug=song.stage;const actor=(side,x,y,scale=1)=>{ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);extraActor(side,t,0,0);ctx.restore();};
 if(slug==='tutorial'){actor('gf',530,435,1.1);actor('echo',710,485,1);return;}
 if(slug==='hopes-and-dreams'){actor('nova',300-Math.cos(t/BEAT*4/5.5)*85,400-Math.sin(t/BEAT*8/5.5)*25,.9);actor('echo',775,470,.66);return;}
 if(slug==='your-worst-nightmare'){if(phase.opponentAlpha!==0)actor('nova',350,475,1.4);actor('echo',835,475,.85);return;}
 actor('nova',285,485,1.14);actor('echo',840,485,1.05);
}
function drawUndertaleStage(t){const phase=undertalePhase(t/BEAT);rect(0,0,1120,530,'#000');for(const l of undertaleLayers())extraSprite(l.key,t,l.x,l.y,l.w,l.h);
 if(!song.lowSpec&&song.stage==='hopes-and-dreams'&&t/BEAT>=64){const g=ctx.createRadialGradient(550,290,10,550,290,650);g.addColorStop(0,'#000');g.addColorStop(1,`hsl(${t*32%360} 90% 24%)`);ctx.fillStyle=g;ctx.fillRect(0,0,1120,530);}
 if(!song.lowSpec&&song.stage==='your-worst-nightmare'){for(let i=0;i<4;i++)if(phase.souls?.[i])extraSprite('undertale/fx/Souls'+(i===3?'':i+1),t,80,30,720,470);if(phase.static){ctx.save();ctx.globalAlpha=.25;extraSprite('undertale/fx/FloweyStatic',t,0,0,1120,530);ctx.restore();}}
 drawUndertaleHopesEffects(t,false);
 drawUndertaleActors(t);
 if(song.lowSpec||!phase.starBlaze)return;
 const bone=song.stage==='megalovania',pellet=song.stage==='your-worst-nightmare';const key='undertale/fx/'+(bone?'bonewall':pellet?'pellet':'star');const count=bone?8:12;
 for(let i=0;i<count;i++){const age=(t+i*.43)%3,x=1250-age/3*1500+(i%3)*75,y=-80+age/3*650+(i%4)*35;ctx.save();ctx.translate(x,y);if(!bone)ctx.rotate(t+i);extraSprite(key,t,-(bone?10:30),-40,bone?450*126/1390:90,bone?450:90);ctx.restore();}
}
function drawUndertaleNote(note,x,y,tail){if(!undertaleActive())return false;const skin=UNDERTALE_SKINS[note.sourceNoteType];if(!skin)return false;const im=modImages.get(skin.src),f=skin.frames[note.lane];if(!im)return false;if(note.duration){ctx.save();ctx.strokeStyle=note.heal?'#66ff9b':'#efefff';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,tail);ctx.stroke();ctx.restore();}ctx.drawImage(im,f.x,f.y,f.w,f.h,x-36,y-36,72,72);return true;}
function undertaleDialogue(t){const u=undertaleState;if(!u?.dialogue)return;let age=t-u.dialogue.at,line;for(const l of u.dialogue.lines){const duration=Math.max(2.5,l.text.length*(l.speed||.03)+1.5);if(age<duration){line=l;break;}age-=duration;}if(!line)return;const text=line.text.slice(0,Math.max(0,Math.floor(age/(line.speed||.03))));ctx.save();ctx.globalAlpha=.93;ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(100,365,920,105,22);ctx.fill();ctx.restore();ctx.fillStyle='#12121b';ctx.font='bold 20px sans-serif';ctx.textAlign='left';let row='',y=402;for(const word of text.split(' ')){if(ctx.measureText(row+word).width>860){ctx.fillText(row,125,y);y+=26;row='';}row+=word+' ';}ctx.fillText(row,125,y);}
// Use the complete atlas frame (including trim offsets) so the strike stays anchored.
function drawUndertaleUnderlay(t){if(!undertaleActive())return;ctx.save();drawUndertaleHopesEffects(t,true);undertaleDialogue(t);ctx.restore();}
function undertaleAttackGeometry(side,lane,t){const spacing=Math.abs(laneX(1,side)-laneX(0,side)),scale=spacing/110,y=targetY(side,t),left=laneX(0,side)-48,width=spacing*3+96;return {x:laneX(lane,side),y,left,width,scale,boxScale:width/642,beamWidth:61*scale,beamTop:-172*530/720,beamHeight:988*scale};}
function drawUndertaleAttack(a,t,side){
 const warning=t<a.at,elapsed=Math.max(0,t-(warning?a.warning:a.at));
 if(a.kind==='slash'){
  const g=undertaleAttackGeometry(side,0,t),scale=g.boxScale;
  ctx.save();ctx.globalAlpha=.75;
  if(warning)extraSprite('undertale/fx/box',elapsed,g.left,g.y-79*scale,642*scale,158*scale,'note splash purple',24,false);
  else extraSprite('undertale/fx/'+(song.stage==='megalovania'?'bone':'Slash'),elapsed,g.left-188*scale,g.y-113*scale,1340*scale,226*scale,'note splash purple',24,false);
  ctx.restore();return;
 }
 for(const lane of a.lanes){const g=undertaleAttackGeometry(side,lane,t),anim='note splash '+['purple','blue','green','red'][lane];
  if(warning)extraSprite('undertale/fx/warning',elapsed,g.x-22,g.y-24,44,48,anim,24,false);
  else{ctx.save();ctx.globalAlpha=.65;const key=song.stage==='your-worst-nightmare'?'vine':song.stage==='hopes-and-dreams'?'lightning':'blaster';extraSprite('undertale/fx/'+key,elapsed,g.x-g.beamWidth/2,g.beamTop,g.beamWidth,g.beamHeight,anim,24,false);ctx.restore();}
 }
}
function drawUndertaleHud(t){const jumpButton=document.getElementById('undertale-jump');if(jumpButton)jumpButton.hidden=!mobileMode||!undertaleActive()||song.lowSpec||state!=='playing';if(!undertaleActive())return;const u=undertaleState;if(!u)return;if(song.lowSpec)return;const side=playerSide(),y=targetY(side,t);
 for(const a of u.attacks){if(t<a.warning||t>a.at+(a.kind==='slash'?13/24:.3))continue;drawUndertaleAttack(a,t,side);}
 let lane=u.lane;if(settings.bot){const a=u.attacks.find(a=>t>=a.warning&&t<a.at);if(a?.kind==='beam')lane=[0,1,2,3].find(l=>!a.lanes.includes(l))??lane;}
 const jumping=Math.max(0,Math.min(1,(t-u.jump)/(.6*(settings.rate||1)))),dy=jumping<1?Math.sin(jumping*Math.PI)*82:0;const x=laneX(lane,side),yy=y+(settings.scroll==='down'?-dy:dy);ctx.save();ctx.shadowColor='#20e9ff';ctx.shadowBlur=3;const a=EXTRA_ART.sprites['undertale/fx/soul'],f=extraFrame(a,'idle',t),im=f&&modImages.get(f.src||a.src);if(im){const k=a.scale||1,size=38;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,f.x+78*k,f.y+85*k,73*k,73*k,x-size/2,yy-size/2,size,size);}ctx.restore();
 if(u.title&&t-u.title.at<2)label(u.title.text,560,290,24,'#fff');
}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&undertaleActive()&&state==='playing'){e.preventDefault();if(!e.repeat)undertaleJump();}});

document.getElementById('undertale-jump')?.addEventListener('pointerdown',e=>{e.preventDefault();undertaleJump();});

async function playUndertaleIntro(){
 if(!undertaleActive()||song.lowSpec||song.stage==='tutorial')return;
 const lines=song.undertaleDialogues?.dialogue1||[];if(!lines.length)return;
 const dialog=document.createElement('dialog');dialog.id='undertale-intro';dialog.style.cssText='width:min(820px,85vw);border:3px solid white;border-radius:22px;background:#fff;color:#111;padding:24px;font-size:20px';
 const text=document.createElement('p'),next=document.createElement('button'),skip=document.createElement('button');next.textContent='다음 ▶';skip.textContent='대사 건너뛰기';skip.style.marginLeft='16px';dialog.append(text,next,skip);document.querySelector('.game').append(dialog);
 await new Promise(resolve=>{let index=0;const show=()=>{text.textContent=lines[index].text;next.textContent=index===lines.length-1?'연주 시작 ▶':'다음 ▶';};const done=()=>{dialog.close();dialog.remove();resolve();};const advance=()=>{index++;if(index>=lines.length)done();else show();};next.onclick=advance;skip.onclick=done;dialog.addEventListener('cancel',e=>{e.preventDefault();done();});dialog.addEventListener('keydown',e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();advance();}});show();dialog.showModal();next.focus();});
}

async function prepareUndertaleSound(){if(song.pack!=='undertale'||song.lowSpec||!audio||extraSoundBuffers.has('undertale-damage'))return;const r=await fetch('assets/extra-mods/undertale/sounds/damage.ogg');if(!r.ok)throw Error('피격음 로드 실패');extraSoundBuffers.set('undertale-damage',await audio.decodeAudioData(await r.arrayBuffer()));}
// Native stepHit: large foreground stars and background thunder every two steps.
// Compute bounded live particles from song time; no per-frame allocations or timers.
function drawUndertaleHopesEffects(t,foreground){
 if(song.stage!=='hopes-and-dreams'||song.lowSpec)return;
 const interval=BEAT/2,last=Math.floor(t/interval),rand=(n,s)=>((Math.imul(n+1,s)>>>0)%10000)/10000;
 for(let n=Math.max(0,last-Math.ceil(3.1/interval));n<=last;n++){
  const phase=undertalePhase(n/2),age=t-n*interval;
  if(foreground&&phase.starBlaze){const duration=2.1+rand(n,34729);if(age>=duration)continue;const q=age/duration,rx=rand(n,76123)*1000-500,ry=rand(n,19237)*1000-500,size=230*(.5+rand(n,31123))*1120/1280;
   const x=(3000+rx+(-6000+ry-rx)*q)*1120/1280,y=(-500+ry+(1500+rx-ry)*q)*530/720;
   ctx.save();ctx.translate(x+size/2,y+size/2);ctx.rotate((1-(1-q)**5)*Math.PI*4);extraSprite('undertale/fx/star',t,-size/2,-size/2,size,size);ctx.restore();
  }
  if(!foreground&&['lightningAll','lightningFast','lightningSequence','lightningUnfair','lightningTriple','lightningSlow'].some(k=>phase[k])){const duration=.1+rand(n,15731)*.4;if(age>=duration)continue;const q=age/duration,w=57*(4.1+rand(n,27791)*4)*1120/1280;
   ctx.save();ctx.globalAlpha=.5*(1-q);extraSprite('undertale/fx/thunder',t,rand(n,59183)*1120-w/2,-100,Math.max(1,w*(1-q)),850);ctx.restore();
  }
 }
}
