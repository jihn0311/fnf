const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`(async()=>{
for(const [ms,kind,points] of [[0,'perfect',500],[4.999,'perfect',500],[5,'perfect',499],[20,'perfect',480],[44.999,'perfect',353],[45,'perfect',353],[45.001,'good',353],[80,'good',68],[89.999,'good',37],[90,'good',37],[90.001,'bad',37],[134.999,'bad',9],[135,'bad',9],[135.001,'bad',9],[159.999,'bad',9],[160,'bad',9],[160.001,'bad',9],[180,'bad',9],[180.001,'miss',-100]]){for(const sign of [-1,1]){const result=timingResult(sign*ms/1000);assert.equal(result.kind,ms<=60?'perfect':ms<=110?'good':ms<=180?'bad':'miss');assert.equal(result.points,points);}}
const charts=['easy','normal','hard'].map(difficulty=>createChart(difficulty));
assert(charts[0].length<charts[1].length&&charts[1].length<charts[2].length);
for(const chart of charts){
 assert(chart.some(n=>n.duration>0));
 assert(chart.every((n,i)=>n.time>=4&&n.time+n.duration<DURATION&&n.lane>=0&&n.lane<4&&(!i||chart[i-1].time<=n.time)));
 for(let lane=0;lane<4;lane++){const group=chart.filter(n=>n.lane===lane);for(let i=1;i<group.length;i++)assert(group[i].time>group[i-1].time+group[i-1].duration+.16);}
 for(const n of chart){assert.equal((n.time/BEAT)% .5,0);if(n.duration)assert.equal((n.time/BEAT)%8,0);}
}
audio={currentTime:4,resume:async()=>{},suspend:async()=>{}};startTime=0;state='playing';songIndex=384;
notes=[{time:4,lane:0,done:false}];press(1);assert.equal(score,0);press(0);assert.equal(score,500);press(0);assert.equal(score,500);assert.equal(combo,1);
notes=[{time:5,lane:1,done:false}];audio.currentTime=5.08;press(1);assert.equal(hits.good,1);assert.equal(score,568);
notes=[{time:6,lane:2,done:false}];audio.currentTime=6.14;press(2);assert.equal(hits.bad,1);assert.equal(score,577);assert.equal(combo,0);assert.equal(splashes.length,1);assert.equal(splashes[0].lane,0);
notes=[{time:7,lane:3,done:false}];audio.currentTime=7.2;frame();assert.equal(hits.miss,1);assert.equal(score,477);assert.equal(combo,0);assert.equal(maxCombo,2);assert.equal(judged,4);
// Segmented sustains preserve GOOD, support shared keys and pause grace.
notes=[{time:8,lane:0,duration:1.5,done:false}];audio.currentTime=8.08;const goodBefore=hits.good;inputDown('key:d',0);assert(notes[0].holding);audio.currentTime=9.5;updateNotes(time());assert(notes[0].done);assert(hits.good>goodBefore);inputUp('key:d');
notes=[{time:12,lane:2,duration:1.5,done:false}];audio.currentTime=12;inputDown('key:j',2);inputDown('key:ArrowUp',2);const missBefore=hits.miss;audio.currentTime=12.5;inputUp('key:j');assert(!notes[0].done);assert.equal(hits.miss,missBefore);audio.currentTime=13.5;inputUp('key:ArrowUp');assert(notes[0].done);
notes=[{time:20,lane:0,duration:1.5,done:false}];audio.currentTime=20;inputDown('key:d',0);audio.currentTime=20.5;await pause();inputUp('key:d');assert(!notes[0].done);assert.equal(time(),20.5);await pause();audio.currentTime=20.6;updateNotes(time());assert(!notes[0].done);inputDown('key:d',0);audio.currentTime=21.5;updateNotes(time());assert(notes[0].done);inputUp('key:d');
// Direction and speed affect position only; every note crosses its target at song time.
for(const scroll of ['up','down'])for(const speed of [.5,1,2.5]){settings.scroll=scroll;settings.speed=speed;assert.equal(noteY(25,25),targetY());assert.equal(Math.sign(noteY(26,25)-targetY()),scroll==='up'?1:-1);assert.equal(Math.round(Math.abs(noteY(26,25)-targetY())),Math.round(430/LEAD*speed));}
state='playing';audio.currentTime=48;frame();assert.equal(state,'finished');assert.equal(document.getElementById('status').textContent,'TRACK COMPLETE');assert.equal(document.getElementById('difficulty').disabled,false);
// Alternating solos, simultaneous duets, and opponent notes never change player score.
assert.equal(sectionAt(4),'nova');assert.equal(sectionAt(8),'echo');assert.equal(sectionAt(20),'duet');assert.equal(sectionAt(48),'outro');
for(const difficulty of ['easy','normal','hard']){
 const player=createChart(difficulty,'echo'),opponent=createChart(difficulty,'nova');
 assert(player.every(n=>sings('echo',n.time)));assert(opponent.every(n=>sings('nova',n.time)));
 assert(!player.some(n=>n.time>=4&&n.time<8));assert(!opponent.some(n=>n.time>=8&&n.time<12));
 assert(player.some(n=>sectionAt(n.time)==='duet'&&opponent.some(o=>o.time===n.time)));
 assert(player.every(n=>n.duration===0||sectionAt(n.time)===sectionAt(n.time+n.duration)));
}
const scoreBeforeOpponent=score,judgmentsBeforeOpponent=judged,healthBeforeOpponent=health;
opponentNotes=[{time:4,lane:2,duration:1.5,done:false}];updateOpponent(4);assert(opponentNotes[0].started);assert(!opponentNotes[0].done);assert.equal(actors.nova.lane,2);updateOpponent(5.5);assert(opponentNotes[0].done);assert.equal(score,scoreBeforeOpponent);assert.equal(judged,judgmentsBeforeOpponent);assert.equal(health,healthBeforeOpponent);
notes=createChart('normal');opponentNotes=createChart('normal','nova');buildVoices();assert.equal(voiceEvents.length,notes.length+opponentNotes.length);assert(voiceEvents.every((v,i)=>!i||voiceEvents[i-1].time<=v.time));
// Each voice is scheduled once, with matching time, sustain length and stereo side.
const toneOriginal=tone,recorded=[];tone=(...args)=>recorded.push(args);
voiceEvents=[{time:20,lane:0,duration:1.5,side:'nova'},{time:20,lane:0,duration:1.5,side:'echo'}];voiceIndex=0;state='playing';audio.currentTime=19.9;scheduleVoices();scheduleVoices();assert.equal(recorded.length,4);assert.equal(recorded[0][1],20);assert.equal(recorded[0][2],1.5);assert.equal(recorded[0][6],-.55);assert.equal(recorded[2][6],.55);assert.equal(recorded[2][0],recorded[0][0]*2);tone=toneOriginal;
notes=[];opponentNotes=[];voiceEvents=[];songIndex=384;health=0;audio.currentTime=30;document.getElementById('practice').checked=true;frame();assert.equal(state,'playing');document.getElementById('practice').checked=false;frame();assert.equal(state,'finished');assert.equal(pausedTime,30);assert.equal(document.getElementById('status').textContent,'GAME OVER');
console.log('PASS: alternating solos, duet overlap, automatic opponent isolation, stereo phrase scheduling, practice and game over');
// Every song and difficulty has independent valid charts and a complete arrangement.
const songCounts=[];
for(const id of Object.keys(SONGS)){
 selectSong(id);
 assert.equal(DURATION,song.beats*60/song.bpm);
 const counts=[];
 for(const difficulty of ['easy','normal','hard']){
  const chart=createChart(difficulty),rival=createChart(difficulty,'nova');counts.push(chart.length);
  assert(chart.length>0&&rival.length>0);assert(chart.some(n=>n.duration));
  assert(chart.every(n=>n.time+n.duration<DURATION&&sings('echo',n.time)));
  assert(rival.every(n=>sings('nova',n.time)));
  assert(chart.some(n=>sectionAt(n.time)==='duet'&&rival.some(o=>o.time===n.time)));
  for(const n of chart){assert(Math.abs(n.time/BEAT*2-Math.round(n.time/BEAT*2))<1e-7);if(n.duration)assert.equal(sectionAt(n.time),sectionAt(n.time+n.duration));}
  for(let lane=0;lane<4;lane++){const group=chart.filter(n=>n.lane===lane);for(let i=1;i<group.length;i++)assert(group[i].time>group[i-1].time+group[i-1].duration+.16);}
 }
 assert(counts[0]<counts[1]&&counts[1]<counts[2]);songCounts.push([song.title,...counts]);
 for(let beat=0;beat<song.beats;beat++)assert(sectionAt(beat*BEAT));
 const tones=[];tone=(...args)=>tones.push(args);notes=createChart('normal');opponentNotes=createChart('normal','nova');buildVoices();songIndex=0;state='playing';health=50;document.getElementById('practice').checked=true;
 for(let t=0;t<=DURATION+.2;t+=.05){audio.currentTime=t;scheduleMusic();scheduleVoices();updateOpponent(t);updateNotes(t);}
 assert.equal(songIndex,song.beats*4);assert.equal(voiceIndex,voiceEvents.length);assert(notes.every(n=>n.done));assert(opponentNotes.every(n=>n.done));
 assert(tones.length>500);assert(tones.every(a=>Number.isFinite(a[0])&&a[1]>=0&&a[1]<DURATION&&a[2]>0));
 audio.currentTime=DURATION;frame();assert.equal(state,'finished');assert.equal(document.getElementById('song').disabled,false);
 tone=toneOriginal;
}
assert.equal(formatTime(67.2),'01:07');selectSong('midnight');
console.log('PASS: all songs x three difficulties, BPM-aligned sustains, duet arrangement, full music/voice scheduling and completion',songCounts);
console.log('PASS: PBOT1 reference values and inclusive boundaries, MISS -100, difficulty density, beat alignment, no hold overlap, four judgments, duplicate inputs, sustain completion/release, shared lane keys, pause/resume grace, scroll/speed timing, result');
console.log('Note counts:',charts.map(c=>c.length).join(' / '));
})()`,sandbox).catch(e=>{console.error(e);process.exitCode=1;});
