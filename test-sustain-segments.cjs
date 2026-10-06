const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);

vm.runInContext(`
state='playing';audio={currentTime:1};startTime=0;settings.rate=1;resumeGraceUntil=-1;
notes=[{time:1,lane:0,duration:2,done:false}];inputDown('test',0);assert(!notes[0].done);assert.equal(hits.perfect,1);
audio.currentTime=1.4;inputUp('test');assert(!notes[0].done);const misses=hits.miss;
audio.currentTime=1.9;updateNotes(time());assert(hits.miss>misses);assert(!notes[0].done);
const before=hits.perfect;inputDown('test',0);assert(hits.perfect>before);const stopped=hits.miss;
audio.currentTime=2.5;updateNotes(time());assert.equal(hits.miss,stopped);assert(!notes[0].done);
audio.currentTime=3;updateNotes(time());assert(notes[0].done);inputUp('test');assert.equal(hits.miss,stopped);
for(const rate of [.5,1,2]){settings.rate=rate;audio.currentTime=10;startTime=10-1/rate;notes=[{time:1,lane:0,duration:10,done:false}];held.clear();inputDown('test',0);inputUp('test');const before=hits.miss;audio.currentTime=10.61;updateNotes(time());assert.equal(hits.miss-before,4);}
console.log('PASS sustain persists after release, repeated MISS, resume, automatic end, rate-independent tick intervals');
`,sandbox);
