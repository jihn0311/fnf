const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`
audio={currentTime:0};state='playing';startTime=0;notes=[];
inputDown('key:d',0);inputDown('key:d',0);assert.equal(keyPressCounts[0],1);
inputUp('key:d');inputDown('key:d',0);assert.equal(keyPressCounts[0],2);
for(const [lane,key] of [[1,'f'],[2,'j'],[3,'k']])inputDown('key:'+key,lane);
assert.equal(keyPressCounts.join(','),'2,1,1,1');assert.equal($('count-d').textContent,'2');
inputDown('key:ArrowLeft',0);inputDown('pointer:1',0);assert.equal(keyPressCounts[0],2);
state='paused';inputUp('key:f');inputDown('key:f',1);assert.equal(keyPressCounts[1],1);
showKeyPressCounts();assert.equal(keyPressCounts.join(','),'2,1,1,1');assert.equal($('count-d').textContent,'2');
console.log('PASS separate key counts, repeated holds, simultaneous keys, pause, arrows/touch exclusion and reset');
`,sandbox);
