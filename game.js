'use strict';
const canvas = document.querySelector('#stage'), ctx = canvas.getContext('2d');
const $ = id => document.getElementById(id);
const COLORS = ['#c24b99','#00ffff','#00f000','#f9393f'];
const KEYS = {ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3,d:0,f:1,j:2,k:3};
const SONGS = {
  midnight:{title:'Midnight Circuit',bpm:120,beats:96,genre:'SYNTH POP',description:'네온빛 도시의 콜 앤 리스폰스',roots:[130.81,103.83,155.56,116.54],scale:[0,3,7,10],chord:[1,1.1892,1.4983],pattern:[0,1,2,3,2,1,0,2,3,1,2,0,1,3,2,1],parts:['nova','echo','nova','echo','duet','nova','echo','duet','nova','echo','duet'],voice:'triangle',sky:['#151c30','#253044']},
  sunrise:{title:'Peach Sunrise',bpm:100,beats:112,genre:'DREAM POP',description:'따뜻한 메이저 화음과 여유로운 그루브',roots:[130.81,174.61,146.83,196],scale:[0,4,7,11],chord:[1,1.2599,1.4983],pattern:[2,1,3,0,1,3,2,0,3,2,0,1,2,0,3,1],parts:['nova','echo','nova','echo','duet','duet','nova','echo','nova','echo','duet','nova','duet'],voice:'sine',sky:['#362238','#754950']},
  voltage:{title:'Voltage Rush',bpm:150,beats:128,genre:'CHIP ELECTRO',description:'빠른 아르페지오와 폭발하는 합주',roots:[164.81,130.81,196,146.83],scale:[0,7,10,12],chord:[1,1.1892,1.4983],pattern:[3,0,2,1,0,3,1,2,0,2,3,1,3,1,0,2],parts:['nova','echo','duet','nova','echo','duet','duet','nova','echo','duet','nova','echo','duet','duet','duet'],voice:'square',sky:['#20133b','#253a59']}
};
if(typeof IMPORTED_SONG!=='undefined')SONGS.self=IMPORTED_SONG;
if(typeof MOD_SONGS!=='undefined')Object.assign(SONGS,MOD_SONGS);
let songId='midnight',song=SONGS[songId],BPM=song.bpm,BEAT=60/BPM,DURATION=song.duration||song.beats*BEAT;
const LEAD=2.2;
function formatTime(seconds){const n=Math.max(0,Math.floor(seconds));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function selectSong(id){
  songId=SONGS[id]?id:'midnight';song=SONGS[songId];BPM=song.bpm;BEAT=60/BPM;DURATION=song.duration||song.beats*BEAT;
  $('track-title').textContent=song.title;$('track-meta').textContent=(song.audioSrc?'약 ':'')+BPM+' BPM · '+song.genre+' · '+formatTime(DURATION);
  $('track-number').textContent=(song.audioSrc?'YOUR TRACK / ':'ORIGINAL TRACK / ')+String(Object.keys(SONGS).indexOf(songId)+1).padStart(2,'0');
  $('song-description').textContent=song.description;
}
let audio, master, muted = false, state = 'ready', startTime = 0, pausedTime = 0;
let notes = [], score = 0, combo = 0, maxCombo = 0, health = 50, earned = 0, judged = 0;
let songIndex = 0, feedback = '', feedbackAt = -10, feedbackColor = '#fff', sources = [];
let feedbackOffsetMs = null;
function timingOffsetText(ms){if(!Number.isFinite(ms))return '— ms';const rounded=Math.round(ms*10)/10;return (rounded>0?'+':rounded<0?'−':'')+Math.abs(rounded).toFixed(1)+' ms';}
let hits = {perfect:0,good:0,bad:0,miss:0}, flashes = [0,0,0,0], held = new Map();
let settings = {difficulty:'normal',scroll:'up',speed:2.5,rate:1}, resumeGraceUntil = -1;
let splashes = [], opponentNotes=[], voiceEvents=[], voiceIndex=0;
const actors={nova:{lane:-1,until:-1,miss:false},echo:{lane:-1,until:-1,miss:false}};

function sectionAt(t){if(song.sections){const section=song.sections.find(s=>t>=s.start&&t<s.end);return section?section.mode:t<song.sections[0].start?'intro':'outro';}const beat=Math.round(t/BEAT*1e8)/1e8;return beat<8?'intro':beat>=song.beats-4?'outro':song.parts[Math.floor((beat-8)/8)];}
function sings(side,t){const part=sectionAt(t);return part===side||part==='duet';}
function laneX(lane,side='echo'){const swap=typeof tripleActive==='function'&&tripleActive()?tripleSwap():typeof extraSwap==='function'?extraSwap():0;return (side==='nova'?135+580*swap:715-580*swap)+lane*90;}
function animateSinger(side,lane,t,duration=0,miss=false){actors[side]={lane,at:t,until:t+Math.max(.23,duration),miss};}
function updateOpponent(t){
  for(const note of opponentNotes){
    if(note.time>t)break;
    if(note.done)continue;
    if(!note.started&&t>=note.time){note.started=true;animateSinger('nova',note.lane,note.time,note.duration);actors.nova.character=note.character||0;if(typeof extraNote==='function')extraNote(note,'nova');}
    if(note.started&&t>=note.time+note.duration)note.done=true;
  }
}
function buildVoices(){
  if(song.audioSrc){voiceEvents=[];voiceIndex=0;return;}
  voiceEvents=[...notes.map(n=>({...n,side:'echo'})),...opponentNotes.map(n=>({...n,side:'nova'}))].sort((a,b)=>a.time-b.time);voiceIndex=0;
}
function scheduleVoices(){
  if(song.audioSrc)return;
  while(voiceIndex<voiceEvents.length&&voiceEvents[voiceIndex].time<time()+.15){
    const event=voiceEvents[voiceIndex++],at=startTime+event.time/(settings.rate||1);
    if(at<audio.currentTime-.02)continue;
    const root=song.roots[Math.floor(event.time/(BEAT*8))%song.roots.length];
    const frequency=root*Math.pow(2,song.scale[event.lane]/12)*(event.side==='echo'?2:1);
    const length=event.duration||.19,pan=event.side==='nova'?-.55:.55;
    tone(frequency,at,length,song.voice,song.voice==='square'?.04:.095,frequency*.985,pan);
    tone(frequency*2,at,length*.85,'sine',.025,undefined,pan);
  }
}
function timingResult(delta){
  const ms=Math.round(Math.abs(delta)*1e9)/1e6;
  // PBOT1 score curve with wider 60/110/180 ms judgment windows.
  // UI maps sick to PERFECT, and combines bad/shit under BAD.
  if(ms>180)return {kind:'miss',value:0,points:-100};
  const points=ms<5?500:Math.trunc(500*(1-1/(1+Math.exp(-.08*(ms-54.99))))+9);
  if(ms<=60)return {kind:'perfect',value:1,points};
  if(ms<=110)return {kind:'good',value:.75,points};
  return {kind:'bad',value:ms<=150?.4:.1,points};
}
function splash(lane){splashes.push({lane,at:time()});}

function createChart(difficulty = settings.difficulty, side = 'echo'){
  if(song.charts)return song.charts[difficulty][side].map(note=>({...note,done:false,holding:false}));
  const chart=[], blockedUntil=[-1,-1,-1,-1];
  const step=difficulty==='easy'?2:difficulty==='hard'?.5:1;
  for(let beat=8;beat<song.beats-4;beat+=step){
    if(!sings(side,beat*BEAT)||beat%16===15)continue;
    const lane=song.pattern[(Math.floor((beat-8)%8)+(beat%1?5:0))%16], at=beat*BEAT;
    if(at<=blockedUntil[lane]+.2)continue;
    // Sustains begin with the chord on each two-bar boundary.
    const duration=beat%8===0?3*BEAT:0;
    chart.push({time:at,lane,duration,done:false,holding:false});
    blockedUntil[lane]=at+duration;
  }
  return chart;
}
function setSettingsLocked(locked){for(const id of ['song','difficulty','scroll','rate','practice'])$(id).disabled=locked;}
function readSettings(){
  selectSong($('song').value);
  const available=song.charts?Object.keys(song.charts):['easy','normal','hard'];
  for(const option of ($('difficulty').options||[]))option.disabled=!available.includes(option.value);
  if(!available.includes($('difficulty').value))$('difficulty').value=song.defaultDifficulty||available[0];
  if(song.sectionsByDifficulty)song.sections=song.sectionsByDifficulty[$('difficulty').value];
  settings={difficulty:$('difficulty').value,scroll:$('scroll').value,speed:Math.min(5,Math.max(.25,Number($('speed').value)||1)),rate:Number($('rate').value)||1};
  if(song.bpmByDifficulty){BPM=song.bpmByDifficulty[settings.difficulty];BEAT=60/BPM;}
  $('track-meta').textContent='원곡 '+BPM+' BPM (1×) · 현재 '+Number((BPM*settings.rate).toFixed(2))+' BPM ('+settings.rate+'×) · '+formatTime(DURATION/settings.rate);
  if(typeof syncModUI==='function')syncModUI();
  $('speed-value').textContent=settings.speed.toFixed(2)+'×';
  const chart=createChart();
  $('chart-info').textContent='내 노트 '+chart.length+'개 · 롱노트 '+chart.filter(n=>n.duration).length+'개 / '+BPM+' BPM';
}
function targetY(){return settings.scroll==='down'?448:82;}
function noteY(at,t){return targetY()+(settings.scroll==='down'?-1:1)*(at-t)/LEAD*430*settings.speed;}
function laneHeld(lane){return [...held.values()].includes(lane);}
function refreshButtons(){for(const button of document.querySelectorAll('[data-lane]'))button.classList.toggle('active',laneHeld(Number(button.dataset.lane)));}
function inputDown(source,lane){
  if(held.has(source))return;
  if(state==='playing')updateNotes(time());
  const wasHeld=laneHeld(lane);held.set(source,lane);refreshButtons();
  if(!wasHeld)press(lane);
}
// Sustain judgments use fixed real-time intervals, independent of frame rate.
function sustainTick(note,kind){
  judge({...note,done:false,holding:false},kind,kind==='miss'?0:note.headValue,kind==='miss'?0:Math.round((note.headPoints||0)/10));
}
function updateSustain(note,t){
  const end=note.time+note.duration,interval=.15*(settings.rate||1);
  while(note.nextTick<end&&note.nextTick<=t){
    if(note.nextTick>resumeGraceUntil||laneHeld(note.lane))sustainTick(note,laneHeld(note.lane)?note.headKind:'miss');
    note.nextTick+=interval;
  }
  if(t>=end){note.done=true;note.holding=false;}
}
function inputUp(source){
  const lane=held.get(source);if(lane===undefined)return;
  if(state==='playing')updateNotes(time());
  held.delete(source);refreshButtons();
  if(state==='playing'&&!laneHeld(lane))for(const note of notes){
    if(note.holding&&!note.done&&note.lane===lane){sustainTick(note,'miss');note.nextTick=time()+.15*(settings.rate||1);}
  }
}
function updateNotes(t){
  for(const note of notes){
    if(note.time>t)break;
    if(note.done)continue;
    if(note.holding)updateSustain(note,t);
    else if(timingResult((t-note.time)/(settings.rate||1)).kind==='miss'){
      if(note.duration&&!note.hurt){note.holding=true;note.headKind='perfect';note.headValue=1;note.headPoints=500;note.nextTick=note.time+.18*(settings.rate||1);updateSustain(note,t);}
      else judge(note,'miss',0);
    }
  }
}
function time(){return state==='playing' ? (audio.currentTime-startTime)*(settings.rate||1) : pausedTime;}
function tone(freq,at,length,type,volume,slide,pan=0){
  const rate=settings.rate||1;length/=rate;freq*=rate;if(slide)slide*=rate;
  const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,at+length);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+length);
  const panner=audio.createStereoPanner();panner.pan.value=pan;o.connect(g);g.connect(panner);panner.connect(master);o.start(at);o.stop(at+length+.02);sources.push(o);o.onended=()=>{o.disconnect();g.disconnect();panner.disconnect();sources=sources.filter(s=>s!==o);};
}
function scheduleMusic(){
  if(song.audioSrc)return;
  while(songIndex<song.beats*4 && songIndex*(BEAT/4)<time()+.15){
    const i=songIndex++,t=startTime+i*(BEAT/4)/(settings.rate||1);if(t<audio.currentTime-.02)continue;
    const beat=Math.floor(i/4),bar=Math.floor(beat/4),root=song.roots[Math.floor(bar/2)%song.roots.length];
    if(songId==='sunrise'?(i%16===0||i%16===10):i%4===0)tone(songId==='voltage'?155:130,t,.2,'sine',.3,42);
    if(i%8===4){tone(180,t,.09,'triangle',.13,65);tone(950,t,.055,'sawtooth',.035,300);}
    if(i%(songId==='voltage'?1:2)===0)tone(6400+(i%3)*500,t,.035,'square',.014,4100);
    if(i%(songId==='sunrise'?4:2)===0)tone(root/(songId==='voltage'&&i%8===6?1:2),t,BEAT*.38,'triangle',.16);
    if(i%16===0)for(const ratio of song.chord)tone(root*ratio,t,BEAT*3,'sine',.05);
    if(songId==='sunrise'&&i%4===2)tone(root*song.chord[Math.floor(i/4)%3]*2,t,BEAT*.7,'sine',.045);
    if(songId==='voltage'&&i%2===0)tone(root*Math.pow(2,[0,7,12,19,12,7,10,7][(i/2)%8]/12)*2,t,BEAT*.2,'square',.014);

  }
}
function stopSources(){for(const source of [...sources]){try{source.stop();}catch{}}sources=[];}
function updateHud(){ $('score').textContent=(score<0?'-':'')+String(Math.abs(score)).padStart(6,'0');$('accuracy').textContent=judged?(earned/judged*100).toFixed(1)+'%':'—';$('health').style.width=health+'%';$('health-icons').style.left=(100-health)+'%';$('health-meter').setAttribute('aria-valuenow',Math.round(health));$('health-number').textContent=Math.round(health)+'%';$('combo').textContent=combo;$('misses').textContent=hits.miss; }
const audioBuffers=new Map();
let pauseAfterLoad=false;
let pauseTransition=false;
function showPauseActions(visible){
  $('pause-actions').hidden=!visible;
  $('restart').disabled=!visible;
  $('stop-song').disabled=!visible;
}
async function restartSong(){
  if(state!=='paused'||pauseTransition)return;
  await start();
}
function stopSong(){
  if(state!=='paused'||pauseTransition)return;
  if(typeof extraReset==='function')extraReset();
  stopSources();state='ready';pausedTime=0;pauseAfterLoad=false;resumeGraceUntil=-1;
  notes=[];opponentNotes=[];voiceEvents=[];voiceIndex=0;songIndex=0;
  score=combo=maxCombo=earned=judged=0;health=50;hits={perfect:0,good:0,bad:0,miss:0};
  feedback='';feedbackOffsetMs=null;splashes=[];flashes=[-1,-1,-1,-1];held.clear();refreshButtons();
  actors.nova={lane:-1,until:-1,miss:false};actors.echo={lane:-1,until:-1,miss:false};
  showPauseActions(false);setSettingsLocked(false);updateHud();$('pause').disabled=true;
  $('overline').textContent='SELECT YOUR TRACK';$('title').textContent='곡을 멈췄어요.';
  $('description').textContent='다른 곡을 고르거나 같은 곡을 처음부터 시작하세요.';
  $('start').innerHTML='플레이 시작 <span>↗</span>';$('start').disabled=false;
  $('hint').textContent='방향키 또는 D · F · J · K';$('status').textContent='READY TO PLAY';
  $('overlay').classList.remove('hidden');$('song').focus?.();$('song').scrollIntoView?.({block:'center',behavior:'smooth'});
}
async function loadTrackAudio(track){
  if(audioBuffers.has(track.audioSrc))return audioBuffers.get(track.audioSrc);
  const load=(async()=>{
    let bytes;
    if(location.protocol==='file:'){
      if(!track.inlineSrc)throw Error('이 모드의 음원은 웹 주소로 실행해야 합니다. play.cmd를 실행한 뒤 http://127.0.0.1:5174/ 로 접속해 주세요.');
      if(typeof IMPORTED_AUDIO_BASE64==='undefined')await new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src=track.inlineSrc;script.onload=resolve;script.onerror=()=>{script.remove();reject(Error('음원 파일을 읽을 수 없습니다. assets 폴더를 확인해 주세요.'));};document.head.appendChild(script);
      });
      bytes=Uint8Array.from(atob(IMPORTED_AUDIO_BASE64),char=>char.charCodeAt(0)).buffer;
    }else{
      const response=await fetch(track.audioSrc);if(!response.ok)throw Error('음원을 불러오지 못했습니다. 새 게임 주소로 열어 주세요.');bytes=await response.arrayBuffer();
    }
    return audio.decodeAudioData(bytes);
  })();
  audioBuffers.set(track.audioSrc,load);
  try{return await load;}catch(error){audioBuffers.delete(track.audioSrc);throw error;}
}
function playTrackBuffer(buffer,when){
  const source=audio.createBufferSource();source.buffer=buffer;if(source.playbackRate)source.playbackRate.value=settings.rate||1;source.connect(master);sources.push(source);
  source.onended=()=>{source.disconnect();sources=sources.filter(item=>item!==source);};source.start(when);
}
async function start(){
  if(state==='loading')return;
  showPauseActions(false);$('pause').disabled=true;stopSources();
  state='loading';pausedTime=0;pauseAfterLoad=false;readSettings();setSettingsLocked(true);$('start').disabled=true;$('start').textContent='음원 준비 중…';$('status').textContent='LOADING';
  try{
    if(!audio){audio=new AudioContext();master=audio.createGain();master.gain.value=muted?0:.65;master.connect(audio.destination);}
    await audio.resume();
    if(typeof prepareMod==='function')await prepareMod();
    // Keep only the current track's stems in memory (long songs can decode to hundreds of MB).
    const voiceSources=song.voiceSources||(song.voiceSrc?[song.voiceSrc]:[]);
    for(const key of audioBuffers.keys())if(key!==song.audioSrc&&!voiceSources.includes(key))audioBuffers.delete(key);
    const buffers=song.audioSrc?await Promise.all([loadTrackAudio(song),...voiceSources.map(audioSrc=>loadTrackAudio({audioSrc}))]):[];
    const buffer=buffers[0];
    if(buffer)DURATION=Math.max(...buffers.map(b=>b.duration));
    notes=createChart();opponentNotes=createChart(settings.difficulty,'nova');buildVoices();actors.nova={lane:-1,until:-1,miss:false};actors.echo={lane:-1,until:-1,miss:false};score=combo=maxCombo=earned=judged=0;health=50;hits={perfect:0,good:0,bad:0,miss:0};songIndex=0;pausedTime=0;feedback='';feedbackOffsetMs=null;splashes=[];held.clear();refreshButtons();resumeGraceUntil=-1;flashes=[-1,-1,-1,-1];
    startTime=audio.currentTime+(buffer?3:.15);for(const stem of buffers)playTrackBuffer(stem,startTime);
    state='playing';$('overlay').classList.add('hidden');$('pause').disabled=false;$('pause').innerHTML='일시정지 <kbd>ESC</kbd>';$('status').textContent='LIVE / '+song.title.toUpperCase();updateHud();
    if(pauseAfterLoad||document.hidden)await pause();
  }catch(error){
    stopSources();state='ready';setSettingsLocked(false);$('overlay').classList.remove('hidden');$('title').textContent='음원을 준비하지 못했어요.';$('description').textContent=error.message;$('status').textContent='LOAD FAILED';
  }finally{$('start').disabled=false;$('start').innerHTML=state==='paused'?'계속 플레이 <span>↗</span>':'플레이 시작 <span>↗</span>';}
}
function judge(note,kind,value,points=note.headPoints||0){
  if(note.done)return;if(typeof modJudge==='function'&&modJudge(note,kind))return;note.done=true;note.holding=false;judged++;earned+=value;hits[kind]++;feedback=kind.toUpperCase();feedbackOffsetMs=kind==='miss'?null:(note.hitOffsetMs??null);feedbackAt=time();
  if(kind==='miss'){animateSinger('echo',note.lane,time(),0,true);score-=100;combo=0;health=Math.max(0,health-3);feedbackColor='#f58bc6';}
  else{
    if(kind==='bad'){combo=0;health=Math.max(0,health-1);}else{combo++;maxCombo=Math.max(combo,maxCombo);health=Math.min(100,health+1.4);}
    score+=points;feedbackColor=kind==='perfect'?'#8cf5d9':kind==='good'?'#82e6f5':'#ffd491';
    if(kind==='perfect'&&!note.duration)splash(note.lane);
  }
  if(typeof extraAfterJudge==='function')extraAfterJudge(kind);
  updateHud();
}
function press(lane){
  if(state!=='playing')return;const t=time();flashes[lane]=t+.13;
  const continuing=notes.find(n=>n.holding&&!n.done&&n.lane===lane&&t<n.time+n.duration);
  if(continuing){sustainTick(continuing,continuing.headKind);continuing.nextTick=t+.15*(settings.rate||1);animateSinger('echo',lane,t,continuing.time+continuing.duration-t);return;}
  const note=notes.find(n=>!n.done&&!n.holding&&n.lane===lane&&timingResult((n.time-t)/(settings.rate||1)).kind!=='miss');
  if(note){
    if(note.hurt&&typeof extraHurt==='function'){extraHurt(note,'hit');return;}
    note.hitOffsetMs=(t-note.time)/(settings.rate||1)*1000;
    const {kind,value,points}=timingResult((note.time-t)/(settings.rate||1));animateSinger('echo',lane,t,Math.max(0,note.time+(note.duration||0)-t));if(typeof extraNote==='function')extraNote(note,'echo');
    if(note.duration){note.holding=true;note.headKind=kind;note.headValue=value;note.headPoints=points;note.nextTick=Math.max(t,note.time)+.15*(settings.rate||1);judge({...note,done:false},kind,value,points);feedback=kind.toUpperCase()+' · HOLD';feedbackOffsetMs=note.hitOffsetMs;feedbackAt=t;feedbackColor=COLORS[lane];if(kind==='perfect')splash(lane);if(kind==='bad')combo=0;}
    else judge(note,kind,value,points);
  }
}
async function pause(){
  if(pauseTransition||!['playing','paused'].includes(state))return;
  pauseTransition=true;
  try{
    if(state==='playing'){
      pausedTime=time();state='paused';await audio.suspend();
      $('title').textContent='잠깐, 숨 고르기.';$('overline').textContent='PAUSED';
      $('description').textContent='롱노트 중이었다면 재개 직후 같은 키를 다시 누르세요.';
      $('start').innerHTML='계속하기 <span>▶</span>';$('hint').textContent='ESC로 계속하기 · 재시작과 곡 멈추기는 점수를 초기화합니다.';
      showPauseActions(true);$('overlay').classList.remove('hidden');$('status').textContent='PAUSED';$('start').focus?.();
    }else{
      await audio.resume();
    resumeGraceUntil=pausedTime+.25*(settings.rate||1);state='playing';showPauseActions(false);
      $('overlay').classList.add('hidden');$('status').textContent='LIVE / '+song.title.toUpperCase();
    }
  }finally{pauseTransition=false;}
}
function finish(failed=false){
  if(typeof extraHealthVisibility==='function')extraHealthVisibility(false);
  showPauseActions(false);
  pausedTime=failed?time():DURATION;state='finished';stopSources();setSettingsLocked(false);held.clear();refreshButtons();$('pause').disabled=true;$('status').textContent=failed?'GAME OVER':'TRACK COMPLETE';
  const accuracy=judged?earned/judged*100:0,rank=accuracy>=95?'S':accuracy>=85?'A':accuracy>=70?'B':accuracy>=50?'C':'D';
  $('overline').textContent=failed?'GAME OVER / HEALTH EMPTY':song.title+' / '+settings.difficulty.toUpperCase()+' / RANK '+rank;$('title').textContent=failed?'다시, 리듬을 잡아봐.':'너의 리듬, '+rank+' 랭크.';
  $('description').innerHTML=`점수 ${score.toLocaleString()} · 정확도 ${accuracy.toFixed(1)}%<br>최대 콤보 ${maxCombo} · 놓친 노트 ${hits.miss}<br>PERFECT ${hits.perfect} / GOOD ${hits.good} / BAD ${hits.bad} / MISS ${hits.miss}`;
  $('start').innerHTML='다시 플레이 <span>↗</span>';$('hint').textContent='다시 도전해서 최고 기록을 만들어 보세요.';$('overlay').classList.remove('hidden');
  if(typeof extraFinish==='function')extraFinish(failed);
}
const noteSkinImage=typeof Image!=='undefined'?new Image():null;
if(noteSkinImage)noteSkinImage.src='assets/note-skin.png';
function skinReady(){return typeof NOTE_SKIN!=='undefined'&&noteSkinImage?.complete&&noteSkinImage.naturalWidth>0;}
function skinFrame(frame,x,y,width,height){
  ctx.drawImage(noteSkinImage,frame.x,frame.y,frame.width,frame.height,x,y,width,height);
}
function skinArrow(x,y,lane,size,fill,color){
  if(!skinReady())return false;
  const skin=NOTE_SKIN[lane],lit=!fill&&color===COLORS[lane];
  const frame=skin[fill?'note':lit?'confirm':'idle'];
  const base=skin.idle,scale=size*2/Math.max(base.width,base.height);
  const fw=frame.frameWidth||frame.width,fh=frame.frameHeight||frame.height;
  skinFrame(frame,x-fw*scale/2-frame.frameX*scale,y-fh*scale/2-frame.frameY*scale,frame.width*scale,frame.height*scale);
  return true;
}
function sustainSkin(x,head,tail,lane,color){
  const top=Math.max(-30,Math.min(head,tail)),bottom=Math.min(560,Math.max(head,tail));
  if(!skinReady()){rect(x-12,top,24,Math.max(0,bottom-top),color);return;}
  const skin=NOTE_SKIN[lane],scale=72/Math.max(skin.idle.width,skin.idle.height);
  const width=skin.body.width*scale,capHeight=Math.min(Math.abs(tail-head),skin.tail.height*scale);
  const sign=tail>=head?1:-1;
  const bodyEnd=tail-sign*capHeight;
  const bodyTop=Math.max(-30,Math.min(head,bodyEnd)),bodyBottom=Math.min(560,Math.max(head,bodyEnd));
  if(bodyBottom>bodyTop)skinFrame(skin.body,x-width/2,bodyTop,width,bodyBottom-bodyTop);
  if(capHeight>0&&tail>=-60&&tail<=590){
    ctx.save();ctx.translate(x,bodyEnd);ctx.scale(1,sign);
    skinFrame(skin.tail,-width/2,0,width,capHeight);ctx.restore();
  }
}
function arrow(x,y,lane,size,color,fill=true){
  if(skinArrow(x,y,lane,size,fill,color))return;

  ctx.save();ctx.translate(x,y);ctx.rotate([Math.PI,Math.PI/2,-Math.PI/2,0][lane]);ctx.beginPath();
  for(const [i,p] of [[-1,-.35],[.05,-.35],[.05,-.8],[.85,0],[.05,.8],[.05,.35],[-1,.35]].entries()){if(i===0)ctx.moveTo(p[0]*size,p[1]*size);else ctx.lineTo(p[0]*size,p[1]*size);}
  ctx.closePath();ctx.lineJoin='round';ctx.lineWidth=fill?3:4;ctx.strokeStyle=color;if(fill){ctx.fillStyle=color;ctx.fill();}else ctx.stroke();ctx.restore();
}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function label(text,x,y,size,color,font='monospace'){ctx.fillStyle=color;ctx.textAlign='center';ctx.font=`700 ${size}px ${font}`;ctx.fillText(text,x,y);}
function character(x,y,color,isNova,t){
  const actor=actors[isNova?'nova':'echo'],singing=t<actor.until;
  const lane=singing?actor.lane:-1,bounce=Math.sin(t/BEAT*Math.PI*2)*6;
  const dx=lane===0?-20:lane===3?20:0,dy=lane===1?20:lane===2?-18:0;
  ctx.save();ctx.translate(x+dx,y+bounce+dy);ctx.rotate(lane===0?-.12:lane===3?.12:0);
  ctx.scale(lane===1?1.06:1,lane===1?.9:lane===2?1.07:1);if(!isNova)ctx.scale(-1,1);
  if(actor.miss&&singing)color='#9692b9';
  ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,153-bounce,82,13,0,0,Math.PI*2);ctx.fill();
  rect(-44,85,30,61,'#202b43');rect(15,85,30,61,'#202b43');rect(-51,139,39,14,color);rect(13,139,42,14,'#e1e8f2');
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-42,7);ctx.lineTo(34,7);ctx.lineTo(51,92);ctx.lineTo(-48,92);ctx.closePath();ctx.fill();
  rect(-19,24,34,46,'#162232');ctx.save();if(!isNova)ctx.scale(-1,1);label(isNova?'N':'E',-2,56,25,color);ctx.restore();
  ctx.strokeStyle=color;ctx.lineWidth=24;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-37,25);ctx.lineTo(-61,69);ctx.moveTo(32,24);ctx.lineTo(65,44);ctx.lineTo(84,10);ctx.stroke();
  rect(74,-10,12,29,'#26334a');ctx.fillStyle='#dbe3f0';ctx.beginPath();ctx.arc(80,-12,11,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e9bdaf';ctx.beginPath();ctx.roundRect(-35,-61,70,72,20);ctx.fill();
  ctx.fillStyle=isNova?'#df65ad':'#375979';ctx.beginPath();ctx.moveTo(-45,-28);ctx.lineTo(-44,-72);ctx.lineTo(-23,-63);ctx.lineTo(-8,-87);ctx.lineTo(7,-69);ctx.lineTo(31,-77);ctx.lineTo(43,-35);ctx.lineTo(3,-47);ctx.lineTo(-17,-28);ctx.closePath();ctx.fill();
  rect(-36,-31,70,20,'#141e30');rect(-24,-26,17,6,color);rect(6,-26,17,6,color);rect(0,-1,15,singing&&!actor.miss?10:3,'#945879');
  ctx.strokeStyle=color;ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,-29,44,Math.PI,Math.PI*2);ctx.stroke();rect(-48,-36,12,26,color);rect(36,-36,12,26,color);
  ctx.restore();
}
function draw(t){
  ctx.clearRect(0,0,1120,530);const bg=ctx.createLinearGradient(0,0,0,530);bg.addColorStop(0,song.sky[0]);bg.addColorStop(1,song.sky[1]);ctx.fillStyle=bg;ctx.fillRect(0,0,1120,530);
  if(typeof modActive==='function'&&modActive()){drawModStage(t);}else{
  ctx.fillStyle='#a5b8d755';for(let i=0;i<38;i++)ctx.fillRect((i*193)%1120,(i*71)%260,2,2);
  ctx.fillStyle='#b3c4e0';ctx.beginPath();ctx.arc(938,69,28,0,Math.PI*2);ctx.fill();
  for(let i=0;i<20;i++){const x=i*61,h=50+(i*47)%140;rect(x,320-h,54,h,'#101827');for(let j=0;j<4;j++)for(let k=0;k<3;k++)if((i+j+k)%3===0)rect(x+9+k*13,328-h+j*25,5,9,'#59617c66');}
  rect(0,320,1120,210,'#182332');ctx.strokeStyle='#334158';ctx.lineWidth=1;for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(560,305);ctx.lineTo(i*145-230,530);ctx.stroke();}for(let y=340;y<530;y+=35){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1120,y);ctx.stroke();}
  rect(50,255,76,102,'#101522');rect(994,255,76,102,'#101522');for(const x of [88,1032])for(const y of [282,326]){ctx.strokeStyle='#435268';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.stroke();}
  // Center speakers and two performers share the same open stage.
  rect(492,252,136,180,'#0a101c');rect(501,261,118,162,'#26334a');
  for(const y of [300,380]){ctx.fillStyle='#0c1422';ctx.beginPath();ctx.arc(560,y,32+Math.sin(t/BEAT*Math.PI*2)*2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#596681';ctx.lineWidth=3;ctx.stroke();}
  character(280,274,'#f58bc6',true,t);character(843,274,'#8cf5d9',false,t);
  label('NOVA / AUTO',265,508,12,'#f58bc6');label('ECHO / YOU',850,508,12,'#8cf5d9');
  }
  ctx.save();if(typeof extraHudAlpha==='function')ctx.globalAlpha=extraHudAlpha(t);
  const opponentLit=[false,false,false,false];
  for(const n of opponentNotes){if(n.time>t)break;if(n.started&&t<n.time+Math.max(.15,n.duration))opponentLit[n.lane]=true;}
  const visibleUntil=t+LEAD/settings.speed*1.3;
  for(const side of ['nova','echo']){
    const left=laneX(0,side)-47;
    const shade=ctx.createLinearGradient(0,0,0,530);shade.addColorStop(0,'#080e1da8');shade.addColorStop(.5,'#080e1d0a');shade.addColorStop(1,'#080e1d55');
    ctx.fillStyle=shade;ctx.fillRect(left,0,366,490);
    for(let lane=0;lane<4;lane++){
      const activeOpponent=opponentLit[lane];
      const lit=state==='playing'&&t>=0&&(side==='nova'?activeOpponent:(flashes[lane]>t||laneHeld(lane)));
      const offset=typeof modOffset==='function'?modOffset(lane,side,t):{x:0,y:0};const x=laneX(lane,side)+offset.x;
      if(lit)rect(x-38,targetY()-43,76,86,COLORS[lane]+'22');
      arrow(x,targetY()+offset.y,lane,36,lit?COLORS[lane]:'#aab7cd',false);
      if(side==='echo')label(['D','F','J','K'][lane],x,settings.scroll==='down'?492:33,10,'#a7b7cd');
    }
    ctx.save();ctx.beginPath();ctx.rect(left,0,366,490);ctx.clip();
    for(const note of side==='nova'?opponentNotes:notes){
      if(note.time>visibleUntil)break;
      if(note.done)continue;
      const holding=side==='nova'?note.started:note.holding;
      const offset=typeof modOffset==='function'?modOffset(note.lane,side,t):{x:0,y:0};const x=laneX(note.lane,side)+offset.x,y=(holding?targetY():noteY(note.time,t))+offset.y,tail=noteY(note.time+(note.duration||0),t)+offset.y;
      if(Math.max(y,tail)<-35||Math.min(y,tail)>565)continue;
      const color=note.type===3?'#bd7aff':note.type===2?'#ffffff':COLORS[note.lane];
      if(note.hurt&&typeof extraDrawHurt==='function'){extraDrawHurt(note,x,y,tail);continue;}
      if(note.duration){
        sustainSkin(x,y,tail,note.lane,COLORS[note.lane]);
      }
      ctx.shadowColor='#000';ctx.shadowBlur=8;arrow(x,y,note.lane,36,COLORS[note.lane]);ctx.shadowBlur=0;if(note.type===3||note.type===2)label(note.type===3?'×':'!',x,y+5,15,'#221533');
    }
    ctx.restore();
  }
  splashes=splashes.filter(effect=>t-effect.at<.45);
  for(const effect of splashes){
    const age=Math.max(0,t-effect.at),progress=age/.45,x=laneX(effect.lane),y=targetY();
    ctx.save();ctx.globalAlpha=1-progress;ctx.strokeStyle=COLORS[effect.lane];ctx.lineWidth=3*(1-progress)+1;
    ctx.beginPath();ctx.arc(x,y,25+progress*45,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<10;i++){
      const angle=i*Math.PI/5,radius=29+progress*65;
      ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*radius,y+Math.sin(angle)*radius);
      ctx.lineTo(x+Math.cos(angle)*(radius+12*(1-progress)),y+Math.sin(angle)*(radius+12*(1-progress)));ctx.stroke();
    }
    ctx.restore();
  }
  if(state==='playing'&&(song.audioSrc?t<0:t<8*BEAT)){const count=song.audioSrc?String(Math.ceil(-t/(settings.rate||1))):t<5*BEAT?'READY':String(Math.ceil(8-t/BEAT));label(count,560,270,45,'#8cf5d9');}
  if(t-feedbackAt<.65&&feedback){label(feedback,560,166,19,feedbackColor);if(/^(PERFECT|GOOD|BAD|MISS)/.test(feedback))label(timingOffsetText(feedbackOffsetMs),560,184,12,'#d5deec');if(combo>1){label(String(combo),560,222,29,'#ffffff');label('COMBO',560,239,9,'#8c9bb0');}}
  ctx.restore();
  if(typeof drawModHud==='function')drawModHud(t);
  rect(0,527,1120*Math.max(0,t)/DURATION,3,'#8cf5d9');
  if(typeof extraDeathFrame==='function')extraDeathFrame();
}
function frame(){const t=time();if(state==='playing'){scheduleMusic();scheduleVoices();if(typeof updateMod==='function')updateMod(t);updateOpponent(t);updateNotes(t);if(health<=0&&!$('practice').checked)finish(true);else if(t>=DURATION)finish();}
  draw(state==='ready'?0:t);const clockText=formatTime(Math.min(t,DURATION))+' / '+formatTime(DURATION);if($('time').textContent!==clockText)$('time').textContent=clockText;requestAnimationFrame(frame);
}
$('start').addEventListener('click',()=>state==='paused'?pause():start());$('pause').addEventListener('click',pause);
$('restart').addEventListener('click',restartSong);$('stop-song').addEventListener('click',stopSong);
$('sound').addEventListener('click',()=>{muted=!muted;if(master)master.gain.value=muted?0:.65;$('sound').textContent=muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-label',muted?'소리 켜기':'소리 끄기');});
document.addEventListener('keydown',e=>{
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key==='Escape'){if(!e.repeat){e.preventDefault();pause();}return;}
  if(e.target?.matches?.('select,input,button')&&state!=='playing')return;
  if(KEYS[key]!==undefined){e.preventDefault();if(!e.repeat)inputDown('key:'+key,KEYS[key]);}
});
document.addEventListener('keyup',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;inputUp('key:'+key);});
for(const button of document.querySelectorAll('[data-lane]')){
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);inputDown('pointer:'+e.pointerId,Number(button.dataset.lane));});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>inputUp('pointer:'+e.pointerId));
}
function loseFocus(){if(state==='loading')pauseAfterLoad=true;if(state==='playing')pause();held.clear();refreshButtons();}
window.addEventListener('blur',loseFocus);
document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();});
for(const id of ['song','difficulty','scroll','speed','rate'])$(id).addEventListener('input',()=>{if(state==='ready'||state==='finished'){const previous=songId;readSettings();if(previous!==songId){state='ready';pausedTime=0;notes=[];opponentNotes=[];voiceEvents=[];voiceIndex=0;score=combo=maxCombo=earned=judged=0;health=50;hits={perfect:0,good:0,bad:0,miss:0};splashes=[];feedback='';feedbackOffsetMs=null;actors.nova.until=actors.echo.until=-1;updateHud();$('title').textContent='새로운 비트, 새로운 무대.';$('description').textContent=song.description+' · 오른쪽 노트를 연주하세요.';$('overline').textContent='YOUR STAGE IS WAITING';$('start').innerHTML='플레이 시작 <span>↗</span>';$('hint').textContent='방향키 또는 D · F · J · K';$('status').textContent='READY TO PLAY';}}});
function changeScrollSpeed(value){
 const speed=Math.min(5,Math.max(.25,Number(value)||1));settings.speed=speed;
 $('speed').value=String(speed);$('speed-number').value=String(speed);$('speed-value').textContent=speed.toFixed(2)+'×';
}
$('speed').addEventListener('input',()=>changeScrollSpeed($('speed').value));
$('speed-number').addEventListener('change',()=>changeScrollSpeed($('speed-number').value));
readSettings();frame();
