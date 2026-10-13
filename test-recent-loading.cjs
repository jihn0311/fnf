const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage();const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});p.on('console',m=>console.log('BROWSER',m.text()));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.join(process.cwd(),decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'Missing '+f})});await p.goto('http://verify.local/');
for(const low of [false,true]){
 await p.selectOption('#performance-mode',low?'low':'normal');
 for(const slug of ['casanova','demonila','attack']){
 const id='survent-'+slug+(low?'-low':'');await p.selectOption('#song',id);await p.click('#start');await p.waitForFunction(()=>state==='playing'||state==='ready',null,{polling:50});assert.equal(await p.evaluate(()=>state),'playing',id);
 const result=await p.evaluate(()=>{const scene=MOD_ART.scenes[song.sceneKey];for(const t of [5,DURATION/2,DURATION-1]){extraUpdate(t,true);draw(t);}return {chars:scene.characters,duration:DURATION,last:Math.max(...notes.map(n=>n.time+n.duration)),sources:sources.length};});
 assert.deepEqual(result.chars,['survent:selever','survent:bf','survent:gf']);assert(result.last<result.duration);assert.equal(result.sources,6);
 if(!low&&slug==='attack')fs.writeFileSync(path.join(process.env.TEMP,'selever2-attack.png'),Buffer.from((await p.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));
 await p.evaluate(async()=>{await pause();stopSong()});console.log('PASS audio, actors, stage, pause',id);
 }
}
assert.deepEqual(errors,[]);
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
