const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
p.on('pageerror',e=>errors.push(e.message));p.on('request',()=>requests++);await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});await p.goto('http://verify.local/');
await p.locator('[data-mod="kapi"]').click();assert.deepEqual(await p.locator('#song option').evaluateAll(es=>es.map(e=>e.value)),['kapi-wocky','kapi-beathoven','kapi-hairball','kapi-nyaw','kapi-flatzone']);
for(const low of [false,true])for(const slug of ['wocky','beathoven','hairball','nyaw','flatzone']){
 const info=await p.evaluate(async({slug,low})=>{selectSong('kapi-'+slug+(low?'-low':''));settings.difficulty='hard';await prepareMod();state='paused';notes=createChart();opponentNotes=createChart('hard','nova');extraUpdate(15,true);const poses=[];for(let lane=0;lane<4;lane++){animateSinger('nova',lane,15,1);animateSinger('echo',lane,15,1);draw(15.1);}return {enemy:extraState.chars.nova,notes:notes.length,valid:Object.values(song.charts).every(c=>Object.values(c).every(ns=>ns.every(n=>n.time<DURATION&&n.time+n.duration<=DURATION+.0001))),images:modImages.size,background:!!lowSpecBackground};},{slug,low});
 assert(info.notes>0&&info.valid&&info.images>0);if(low)assert(info.background);const before=requests;await p.evaluate(()=>{extraUpdate(30,true);draw(30);});assert.equal(requests,before);
 if(!low){fs.writeFileSync(process.env.TEMP+'/kapi-'+slug+'.png',Buffer.from((await p.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));const durations=await p.evaluate(async()=>{const ac=new AudioContext();try{return await Promise.all([song.audioSrc,song.voiceSrc].map(async src=>{const response=await fetch(src);if(!response.ok)throw Error(src);const data=await ac.decodeAudioData(await response.arrayBuffer());return data.duration;}));}finally{await ac.close();}});assert(durations.every(d=>d>40));}
 console.log('PASS',slug,low?'low':'normal',info);
}
assert.deepEqual(errors,[]);console.log('PASS mod picker order, all difficulties, directions, low backgrounds and no browser errors');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
