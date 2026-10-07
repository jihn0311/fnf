const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);

vm.runInContext(`
state='playing';song={...song,pack:'death'};audio={currentTime:10};let hurtHits=0;function extraHurt(note){hurtHits++;note.done=true;}
for(const rate of [.5,1,2]){settings.rate=rate;startTime=10-10/rate;for(const ms of [-100,-46,-45,0,45,46,100]){notes=[{time:10+ms/1000*rate,lane:0,hurt:true}];const before=hurtHits;press(0);assert.equal(hurtHits-before,Math.abs(ms)<=45?1:0);}notes=[{time:10,lane:0,hurt:true},{time:10+.1*rate,lane:0}];const before=hurtHits;press(0);assert(notes[1].done);assert(!notes[0].done);assert.equal(hurtHits,before);}
console.log('PASS hazard +/-45ms boundaries, rate scaling and overlapping normal-note priority');
`,sandbox);
