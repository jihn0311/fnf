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
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('imported-chart.js','utf8')+'\n'+fs.readFileSync('mod-songs.js','utf8')+'\n'+fs.readFileSync('mod-art.js','utf8')+'\n'+fs.readFileSync('mod-runtime.js','utf8')+'\n'+fs.readFileSync('game.js','utf8'),sandbox);

(async()=>{
 for(const id of vm.runInContext('Object.keys(MOD_SONGS)',sandbox)){
  const track=vm.runInContext(`MOD_SONGS[${JSON.stringify(id)}]`,sandbox);
  for(const file of [track.audioSrc,track.voiceSrc])assert.equal(fs.readFileSync(file).subarray(0,4).toString(),'OggS');
  for(const difficulty of Object.keys(track.charts)){
   vm.runInContext(`$('song').value=${JSON.stringify(id)};$('difficulty').value=${JSON.stringify(difficulty)};readSettings();`,sandbox);
   for(const side of ['echo','nova']){
    const notes=vm.runInContext(`createChart(settings.difficulty,${JSON.stringify(side)})`,sandbox);
    assert(notes.length>0);
    for(let i=0;i<notes.length;i++){
     const n=notes[i];assert(n.time>=0&&n.duration>=0&&n.lane>=0&&n.lane<4);
     assert(n.time+n.duration<=track.duration+.1, `${id}: note after audio ${n.time}`);
     if(i)assert(n.time>=notes[i-1].time);
    }
    for(let lane=0;lane<4;lane++){
     const same=notes.filter(n=>n.lane===lane);
     for(let i=1;i<same.length;i++)assert(same[i-1].time+same[i-1].duration<same[i].time);
    }
   }
  }
  const before=starts.length;
  await vm.runInContext(`start()`,sandbox);
  assert.equal(starts.length-before,2);assert.equal(starts[before],starts[before+1]);
  await vm.runInContext(`pause()`,sandbox);
  assert.equal(vm.runInContext('state',sandbox),'paused');
  await vm.runInContext('restartSong()',sandbox);assert.equal(starts.length-before,4);
  await vm.runInContext('pause()',sandbox);vm.runInContext('stopSong()',sandbox);
  assert.equal(vm.runInContext('sources.length',sandbox),0);
  console.log('PASS',id,'charts, holds, synchronized stems, pause/restart/stop');
 }
 vm.runInContext(`$('song').value='sonic-black-sun';$('difficulty').value='easy';readSettings();assert.equal(settings.difficulty,'hard');`,sandbox);
 console.log('PASS unavailable difficulty fallback');
 await vm.runInContext(`(async()=>{
 $('song').value='sonic-triple-trouble';$('difficulty').value='hard';await start();
 assert(modRingNotes.length>0);const ring=modRingNotes[0];audio.currentTime=startTime+ring.time;modRingPress();assert.equal(modRings,1);assert(ring.done);
 await pause();await pause();assert.equal(modRings,1);assert(ring.done);
 const phantom={type:3,done:false};const old=health;assert(modJudge(phantom,'perfect'));assert.equal(health,old-12);
 const missed={type:3,done:false};const before=health;assert(modJudge(missed,'miss'));assert.equal(health,before);
 modJudge({type:2},'perfect');assert(modStaticUntil>time());
 await pause();stopSong();
 })()`,sandbox);
 console.log('PASS rings, pause persistence, phantom avoidance, static effect');
})().catch(e=>{console.error(e);process.exitCode=1;});
