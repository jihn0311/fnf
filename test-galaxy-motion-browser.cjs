const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
p.on('pageerror',e=>errors.push(e.message));p.on('request',()=>requests++);await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});await p.goto('http://verify.local/');
for(const slug of ['cona','underworld','cyber']){
 await p.evaluate(async slug=>{selectSong('galaxy-'+slug);settings.difficulty='hard';settings.speed=2.5;settings.scroll='down';await prepareMod();state='paused';notes=createChart();opponentNotes=createChart(settings.difficulty,'nova');},slug);
 for(const t of [10,30,50,65,85,105,125,145,170]){
 const detail=await p.evaluate(t=>{extraUpdate(t,true);draw(t);return {active:galaxyMotionActive(),speed:song.originalSpeed,point:galaxyNotePoint({lane:0,time:t},'echo',t),receptor:galaxyMotion.receptors[4],purple:typeof GALAXY_PURPLE_SKIN!=='undefined'&&modImages.has(GALAXY_PURPLE_SKIN.src)};},t);assert(detail.active);assert(Number.isFinite(detail.point.x+detail.point.y));if(slug==='underworld')assert(detail.purple);
 if([50,65,105].includes(t))fs.writeFileSync(process.env.TEMP+'/galaxy-motion-'+slug+'-'+t+'.png',Buffer.from((await p.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));
 }console.log('PASS browser moving notes',slug);
}
assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
