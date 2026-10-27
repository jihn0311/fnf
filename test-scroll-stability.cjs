const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const nodes=new Map();function element(id){if(!nodes.has(id))nodes.set(id,{value:({difficulty:'normal',scroll:'up',speed:'1'})[id],textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext:()=>context});return nodes.get(id);}
const sandbox={console,document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`
state='playing';song.lowSpec=false;stageDisplayWidth=2240;resetRenderBudget();
prepareStageResolution();assert.equal(canvas.width,1400);
for(let i=0;i<46;i++)trackRenderBudget(i*33.333);
assert.equal(renderScaleLimit,1);prepareStageResolution();assert.equal(canvas.width,1120);
for(let i=46;i<240;i++)trackRenderBudget(1500+(i-46)*8.333);
assert.equal(renderScaleLimit,1);
resetRenderBudget();state='paused';for(let i=0;i<100;i++)trackRenderBudget(i*100);assert.equal(renderScaleLimit,1.25);
state='playing';resetRenderBudget();for(let i=0;i<100;i++)trackRenderBudget(i*16.667);assert.equal(renderScaleLimit,1.25);
settings.speed=2.5;settings.scroll='down';const velocity=430*2.5/LEAD;
for(const [a,b] of [[0,.016],[.016,.049],[.049,.132]])assert(Math.abs((noteY(5,b)-noteY(5,a))/(b-a)-velocity)<1e-8);
console.log('PASS bounded resolution, sustained frame-pressure fallback, no quality oscillation, pause exclusion, stable frame handling and audio-time-linear note motion');
`,sandbox);
