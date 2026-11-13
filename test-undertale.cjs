const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
p.on('pageerror',e=>errors.push(e.message));p.on('request',()=>requests++);await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});await p.goto('http://verify.local/');
await p.locator('[data-mod="undertale"]').click();const ids=await p.locator('#song option').evaluateAll(es=>es.map(e=>e.value));
for(const id of ids)for(const low of [false,true]){
const r=await p.evaluate(async({id,low})=>{selectSong(id+(low?'-low':''));settings.difficulty=song.defaultDifficulty;await prepareMod();state='paused';notes=createChart();opponentNotes=createChart(settings.difficulty,'nova');for(const t of [0,1,15,35,60,100,160,230,300]){extraUpdate(t,true);updateUndertale(t);draw(t);}return {notes:notes.length,images:modImages.size,duration:DURATION,canvas:canvas.toDataURL()};},{id,low});assert(r.notes>0&&r.images>0);if(!low)fs.writeFileSync(process.env.TEMP+'/'+id+'.png',Buffer.from(r.canvas.split(',')[1],'base64'));console.log('PASS',id,low,r.notes,r.duration);
}
await p.evaluate(()=>{selectSong('undertale-tutorial');settings.difficulty='normal';undertaleReset();undertaleMove(3,0);if(undertaleState.lane!==3)throw Error('Soul lane');undertaleSchedule(24,undertalePhase(24));if(!undertaleState.attacks.some(a=>a.kind==='beam'))throw Error('Missing tutorial attack');});
assert.deepEqual(errors,[]);console.log('PASS soul movement, timeline, all scenes and browser errors');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
