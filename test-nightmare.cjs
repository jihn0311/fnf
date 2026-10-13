const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`
audio={currentTime:10};state='playing';startTime=0;$('nightmare').checked=true;
function enemyHit(){opponentNotes=[{time:10,lane:0,duration:0,done:false}];updateOpponent(10);}
health=50;enemyHit();assert.equal(health,49.55);
health=1.2;enemyHit();assert.equal(health,1);
for(let i=0;i<100;i++)enemyHit();assert.equal(health,1);
health=.4;enemyHit();assert.equal(health,.4);
health=0;enemyHit();assert.equal(health,0);
health=1;judge({time:10,lane:0,done:false},'miss',0);assert.equal(health,0);enemyHit();assert.equal(health,0);
health=1;judge({time:10,lane:0,done:false},'bad',.1,9);assert.equal(health,0);
health=1;$('nightmare').checked=false;enemyHit();assert.equal(health,1);
$('nightmare').checked=true;globalThis.destructionInvulnerable=()=>true;health=50;enemyHit();assert.equal(health,50);
console.log('PASS nightmare drain floor, repeated/chord drain, no healing or revival, lethal player MISS/BAD, disabled mode and invulnerability');
`,sandbox);
