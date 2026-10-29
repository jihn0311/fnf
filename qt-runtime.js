'use strict';
function qtActive(){return song.pack==='qt'||song.pack==='qt-safe';}
let qtState=null,qtAlertBuffer=null;
async function prepareQT(){
 qtState={attacks:(song.qtAttacks?.[settings.difficulty]||[]).map(at=>({at,done:false,dodged:false,warned:false})),cursor:0,last:null,flashUntil:-1,protectedUntil:-1,bg:song.stage};
 if(song.qtDodge&&!qtAlertBuffer&&audio){const response=await fetch(QT_ART.sounds['qt-alert']);if(!response.ok)throw Error('QT 경고음 준비 실패');qtAlertBuffer=await audio.decodeAudioData(await response.arrayBuffer());}
}
function qtLayers(){return [{key:'qt/stage/'+(qtState?.bg||song.stage),x:0,y:0,w:1120,h:530}];}
function drawQTActors(t){extraActor('gf',t,560,400);extraActor('nova',t,270,480);extraActor('echo',t,865,480);}
function drawQTStage(t){extraSprite(qtLayers()[0].key,0,0,0,1120,530);drawQTActors(t);}
function qtDamage(){health=Math.max(0,health-10);qtState.flashUntil=time()+.3*(settings.rate||1);updateHud();}
function updateQT(t){
 if(!qtActive()||!qtState||!song.qtDodge||state!=='playing')return;
 const q=qtState,rate=settings.rate||1,stalled=q.last!==null&&t-q.last>.12*rate;q.last=t;
 while(q.cursor<q.attacks.length&&q.attacks[q.cursor].done)q.cursor++;
 for(let i=q.cursor;i<q.attacks.length;i++){
  const a=q.attacks[i];if(a.at>t+.65*rate)break;if(a.done)continue;
  if(!a.warned){a.warned=true;a.warnAt=t;if(qtAlertBuffer&&audio&&master){const node=audio.createBufferSource(),gain=audio.createGain();node.buffer=qtAlertBuffer;gain.gain.value=.5;node.connect(gain);gain.connect(master);node.start();node.onended=()=>{node.disconnect();gain.disconnect();sources=sources.filter(s=>s!==node);};sources.push(node);}}
  if(settings.bot&&t>=a.at)a.dodged=true;
  // A stalled frame must not turn an unseen/expired warning into damage.
  if(stalled&&a.at<=t+.18*rate){a.done=true;q.protectedUntil=t+.8*rate;continue;}
  if(t>a.at+.18*rate){a.done=true;if(!a.dodged){if(a.warnAt>a.at-.25*rate)q.protectedUntil=t+.8*rate;else qtDamage();}}
 }
}
function dodgeQT(){
 if(!qtActive()||!song.qtDodge||!qtState||state!=='playing'||settings.bot)return;
 const t=time(),rate=settings.rate||1;
 for(let i=qtState.cursor;i<qtState.attacks.length;i++){const a=qtState.attacks[i];if(a.at>t+.22*rate)break;if(!a.done&&t<=a.at+.18*rate){a.dodged=true;}}
}
function drawQTHud(t){
 if(!qtActive()||!song.qtDodge||!qtState)return;
 const a=qtState.attacks.slice(qtState.cursor,qtState.cursor+4).find(a=>!a.done&&a.at-t<=.65*(settings.rate||1)&&t<=a.at+.18*(settings.rate||1)&&!a.dodged);
 const strike=qtState.attacks.slice(Math.max(0,qtState.cursor-4),qtState.cursor+4).find(a=>t>=a.at&&t<a.at+.25*(settings.rate||1));
 if(strike&&!song.lowSpec)extraSprite('qt/saw',(t-strike.at)/(settings.rate||1),760,285,280,200);
 if(a){if(!song.lowSpec)extraSprite('qt/alert',Math.max(0,t-(a.at-.65)),875,185,100,100);rect(386,218,348,70,'#17121fee');label('⚠ SPACE · 회피',560,250,23,'#ffbf58');label('실패 시 체력 −10%',560,273,13,'#fff');}
 if(t<qtState.flashUntil)label('회피 실패 · 체력 −10%',560,307,18,'#ff6688');
 else if(t<qtState.protectedUntil)label('화면 지연 · 회피 피해 보호',560,307,15,'#8cf5d9');
}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&qtActive()&&song.qtDodge&&!document.getElementById('key-settings-dialog')?.open){e.preventDefault();if(!e.repeat)dodgeQT();}});
document.getElementById('qt-dodge')?.addEventListener('pointerdown',e=>{e.preventDefault();dodgeQT();});
