const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`
song={...song,charts:{normal:{nova:[{time:1,lane:0,duration:0}],echo:[{time:1,lane:3,duration:0}]}}};settings.playSide='nova';settings.difficulty='normal';settings.bot=false;audio={currentTime:1};startTime=0;state='playing';notes=createChart();opponentNotes=createChart('normal',autoSide());
assert.equal(notes[0].lane,0);assert.equal(opponentNotes[0].lane,3);updateOpponent(1);assert.equal(actors.echo.lane,3);press(0);assert.equal(actors.nova.lane,0);assert.equal(hits.perfect,1);assert(notes[0].done);assert(opponentNotes[0].done);
for(const side of ['nova','echo']){
 settings.playSide=side;settings.bot=true;held.clear();hits={perfect:0,good:0,bad:0,miss:0};score=combo=earned=judged=0;
 notes=[{time:1,lane:0,duration:1},{time:1,lane:1,duration:1.3},{time:1.2,lane:2,duration:0},{time:1.4,lane:3,duration:0,hurt:true}].map(n=>({...n,done:false,holding:false}));
 const counts=keyPressCounts.join(',');audio.currentTime=1.8;updateNotes(1.8);assert(notes[0].holding&&notes[1].holding);audio.currentTime=3;updateNotes(3);assert(notes.every(n=>n.done));assert.equal(hits.miss+hits.bad+hits.good,0);assert(hits.perfect>3);assert.equal(earned,judged);assert.equal(keyPressCounts.join(','),counts);
 const old=hits.perfect;updateNotes(3);assert.equal(hits.perfect,old);inputDown('key:d',0);assert.equal(held.size,0);
}
console.log('PASS opponent chart control, BF automatic animation, both bot sides, chords/holds/late frames, trap avoidance and no synthetic key counts');
`,sandbox);
