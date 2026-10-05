const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const listeners=new Map(),nodes=new Map();const drawing=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
function element(id){if(!nodes.has(id))nodes.set(id,{value:({song:'self',difficulty:'normal',scroll:'up',speed:'1'})[id],checked:true,textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(event,handler){listeners.set(id+':'+event,handler);},setAttribute(){},getContext:()=>drawing});return nodes.get(id);}
let starts=[],stops=0,decodes=0,fetches=0,failFetch=false;
class FakeAudio {
 currentTime=10;destination={};state='running';
 async resume(){this.state='running';}async suspend(){this.state='suspended';}
 createGain(){return {gain:{value:0},connect(){}};}
 createBufferSource(){return {connect(){},disconnect(){},start(when){starts.push(when);},stop(){stops++;}};}
 async decodeAudioData(bytes){decodes++;assert(bytes instanceof ArrayBuffer);return {duration:112.632};}
}
const sandbox={console,assert,ArrayBuffer,Uint8Array,AudioContext:FakeAudio,location:{protocol:'http:'},fetch:async()=>{fetches++;return {ok:!failFetch,arrayBuffer:async()=>new ArrayBuffer(4)};},document:{hidden:false,querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('imported-chart.js','utf8')+'\n'+fs.readFileSync('game.js','utf8'),sandbox);
(async()=>{
 await vm.runInContext(`(async()=>{
  assert.equal(songId,'self');assert.equal(DURATION,112.632);assert.equal(sectionAt(-3),'intro');assert.equal(sectionAt(112.632),'outro');
  let previous=0;
  for(const difficulty of ['easy','normal','hard']){
   const chart=createChart(difficulty);assert(chart.length>previous);previous=chart.length;
   for(const side of ['echo','nova']){
    const notes=createChart(difficulty,side);assert(notes.some(n=>n.duration));
    assert(notes.every((n,i)=>Number.isFinite(n.time)&&n.time>=0&&n.time+n.duration<DURATION&&n.lane>=0&&n.lane<=3&&sings(side,n.time)&&(!i||n.time>notes[i-1].time)));
    for(let lane=0;lane<4;lane++){const list=notes.filter(n=>n.lane===lane);for(let i=1;i<list.length;i++)assert(list[i].time>list[i-1].time+list[i-1].duration+.16);}
    for(const n of notes)if(n.duration)assert.equal(sectionAt(n.time),sectionAt(n.time+n.duration));
   }
   const other=createChart(difficulty,'nova');assert(chart.some(n=>sectionAt(n.time)==='duet'&&other.some(o=>o.time===n.time)));
   chart[0].done=true;assert(!createChart(difficulty)[0].done);
  }
  assert(song.sections.every((s,i)=>s.end>s.start&&(!i||s.start===song.sections[i-1].end)));
  await start();assert.equal(state,'playing');assert.equal(startTime,audio.currentTime+3);assert.equal(time(),-3);assert.equal(document.getElementById('song').disabled,true);assert.equal(voiceEvents.length,0);scheduleMusic();scheduleVoices();assert.equal(songIndex,0);
  const head=notes[0];audio.currentTime=startTime+head.time;inputDown('key:d',head.lane);audio.currentTime=startTime+head.time+head.duration;updateNotes(time());inputUp('key:d');assert.equal(hits.perfect,1);
  await pause();const frozen=time();audio.currentTime+=0;assert.equal(time(),frozen);assert.equal(state,'paused');await pause();assert.equal(state,'playing');
  // Simulate the full imported track without any generated accompaniment.
  for(let t=0;t<DURATION+.1;t+=.05){audio.currentTime=startTime+t;updateOpponent(t);updateNotes(t);}
  assert(notes.every(n=>n.done));assert(opponentNotes.every(n=>n.done));audio.currentTime=startTime+DURATION;frame();assert.equal(state,'finished');assert.equal(sources.length,0);assert.equal(document.getElementById('song').disabled,false);
  await start();assert.equal(state,'playing');assert.equal(time(),-3);assert(notes.every(n=>!n.done));assert.equal(score,0);assert.equal(judged,0);
 })()`,sandbox);
 assert.equal(decodes,1);assert.equal(fetches,1);assert.equal(starts.length,2);assert(stops>=1);
 await vm.runInContext(`finish();audioBuffers.clear();`,sandbox);failFetch=true;
 await vm.runInContext(`(async()=>{await start();assert.equal(state,'ready');assert.equal(document.getElementById('status').textContent,'LOAD FAILED');assert.equal(document.getElementById('start').disabled,false);assert.equal(document.getElementById('song').disabled,false);assert.equal(audioBuffers.size,0);})()`,sandbox);
 failFetch=false;await vm.runInContext(`start()`,sandbox);assert.equal(starts.length,3);
 // Returning to a synth song switches its scheduler and duration back correctly.
 await vm.runInContext(`finish();document.getElementById('song').value='midnight';`,sandbox);listeners.get('song:input')();
 vm.runInContext(`assert.equal(state,'ready');assert.equal(DURATION,48);assert.equal(songId,'midnight');assert.equal(notes.length,0);assert.equal(score,0);`,sandbox);
 // ESC menu actions work for both decoded MP3 and generated tracks.
 await vm.runInContext(`(async()=>{
  for(const id of ['self','midnight']){
   document.getElementById('song').value=id;await start();
   score=1234;combo=7;held.set('key:d',0);audio.currentTime=startTime+1;
   await Promise.all([pause(),pause()]);assert.equal(state,'paused');assert.equal(document.getElementById('pause-actions').hidden,false);assert.equal(document.getElementById('restart').disabled,false);
   const oldStart=startTime;let killed=0;sources.push({stop(){killed++;}});
   await restartSong();assert.equal(killed,1);assert.equal(state,'playing');assert(startTime>oldStart);assert.equal(score,0);assert.equal(combo,0);assert.equal(held.size,0);assert(notes.every(n=>!n.done));assert.equal(document.getElementById('pause-actions').hidden,true);assert.equal(songId,id);
   await pause();score=555;combo=3;held.set('key:d',0);stopSong();
   assert.equal(state,'ready');assert.equal(time(),0);assert.equal(sources.length,0);assert.equal(notes.length,0);assert.equal(opponentNotes.length,0);assert.equal(voiceEvents.length,0);assert.equal(score,0);assert.equal(combo,0);assert.equal(health,50);assert.equal(held.size,0);
   assert.equal(document.getElementById('song').disabled,false);assert.equal(document.getElementById('pause').disabled,true);assert.equal(document.getElementById('pause-actions').hidden,true);assert.equal(songId,id);
   await pause();assert.equal(state,'ready');await start();assert.equal(state,'playing');await pause();await pause();assert.equal(state,'playing');assert.equal(document.getElementById('pause-actions').hidden,true);await pause();stopSong();
  }
 })()`,sandbox);
 console.log('PASS: ESC menu, guarded rapid ESC, paused restart resets notes/score and stops old audio, stop returns to song selection, resume and fresh start (MP3 + synth)');
 console.log('PASS: imported MP3 charts, all difficulties, onsets/hold/duet boundaries, decoded audio starts on shared clock, pause/resume, full duration, restart cache, load error/retry, switching back to synth');
})().catch(error=>{console.error(error);process.exitCode=1;});
