const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
p.on('pageerror',e=>errors.push(e.message));p.on('request',()=>requests++);await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});await p.goto('http://verify.local/');
if(await p.locator('#updates-dialog').isVisible())await p.locator('#updates-confirm').click();
await p.locator('[data-mod="undertale"]').click();const ids=await p.locator('#song option').evaluateAll(es=>es.map(e=>e.value));
for(const id of ids)for(const low of [false,true]){
const r=await p.evaluate(async({id,low})=>{selectSong(id+(low?'-low':''));settings.difficulty=song.defaultDifficulty;await prepareMod();state='paused';notes=createChart();opponentNotes=createChart(settings.difficulty,'nova');for(const t of [0,1,15,35,60,100,160,230,300]){extraUpdate(t,true);updateUndertale(t);draw(t);}return {notes:notes.length,images:modImages.size,duration:DURATION,canvas:canvas.toDataURL()};},{id,low});assert(r.notes>0&&r.images>0);if(!low)fs.writeFileSync(process.env.TEMP+'/'+id+'.png',Buffer.from(r.canvas.split(',')[1],'base64'));console.log('PASS',id,low,r.notes,r.duration);
}
await p.evaluate(()=>{selectSong('undertale-tutorial');settings.difficulty='normal';undertaleReset();undertaleMove(3,0);if(undertaleState.lane!==3)throw Error('Soul lane');undertaleSchedule(24,undertalePhase(24));if(!undertaleState.attacks.some(a=>a.kind==='beam'))throw Error('Missing tutorial attack');});

await p.evaluate(()=>{selectSong('undertale-tutorial');settings.bot=false;settings.rate=1;audio={currentTime:10};startTime=0;state='playing';resumeGraceUntil=-1;
const trial=(kind,jump,lane,bot=false)=>{undertaleReset();undertaleState.at=9.9;undertaleState.beat=16;undertaleState.lane=lane;undertaleState.jump=jump?9.8:-100;undertaleState.attacks=[{kind,lanes:[1],warning:9,at:10,done:false}];health=50;settings.bot=bot;updateUndertale(10);return health;};
if(trial('slash',false,1)!==45||trial('slash',true,1)!==50||trial('beam',false,1)!==45||trial('beam',false,2)!==50||trial('beam',false,1,true)!==50)throw Error('Dodge damage mismatch');
for(const kind of ['beam','slash','finale']){undertaleReset();undertaleState.at=9.9;undertaleState.beat=16;undertaleState.lane=1;undertaleState.attacks=[{kind,lanes:[1],warning:9,at:10,done:false}];health=50;settings.bot=false;updateUndertale(10.4);const expected=kind==='finale'?25:45;if(health!==expected)throw Error('Late-frame damage lost '+kind);updateUndertale(10.45);if(health!==expected)throw Error('Repeated damage');}
selectSong('undertale-your-worst-nightmare');settings.difficulty='normal';if(undertalePhase(144).opponentAlpha!==0||undertalePhase(200).opponentAlpha!==1)throw Error('Flowey soul transition');
selectSong('undertale-hopes-and-dreams');if(!undertalePhase(64).starBlaze)throw Error('Asriel stars');
selectSong('undertale-megalovania');if(!undertalePhase(200).starBlaze)throw Error('Sans bones');state='paused';});
const manifest=new Set(JSON.parse(fs.readFileSync('mod-assets.json','utf8')));const paths=await p.evaluate(()=>Object.values(MOD_SONGS).filter(s=>s.pack==='undertale').flatMap(s=>[s.audioSrc,s.voiceSrc,...MOD_ART.scenes[s.sceneKey].characters.flatMap(k=>MOD_ART.characters[k].pages),...MOD_ART.scenes[s.sceneKey].spriteKeys.flatMap(k=>EXTRA_ART.sprites[k].pages||[EXTRA_ART.sprites[k].src])]).filter(Boolean));for(const file of paths){assert(manifest.has(file),'Missing deployment file '+file);assert(fs.existsSync(file));assert(fs.statSync(file).size<100*1024*1024);}
console.log('PASS dodge damage, jumps, bot safety, phase changes and deployment assets');
await p.evaluate(()=>{selectSong('undertale-megalovania');window.introDone=false;playUndertaleIntro().then(()=>window.introDone=true);});
assert(await p.locator('#undertale-intro').isVisible());await p.locator('#undertale-intro button').last().click();assert(await p.evaluate(()=>window.introDone));
await p.evaluate(()=>{state='playing';audio={currentTime:10};startTime=0;undertaleReset();drawUndertaleHud(10);});
assert(!(await p.locator('#undertale-jump').isVisible()));await p.locator('#mobile-mode').click();assert.equal(await p.evaluate(()=>localStorage.getItem('fnf-mobile-mode')),'true');assert(await p.locator('#undertale-jump').isVisible());await p.locator('#undertale-jump').dispatchEvent('pointerdown');assert.equal(await p.evaluate(()=>undertaleState.jump),10);
await p.locator('#mobile-mode').click();assert(!(await p.locator('#undertale-jump').isVisible()));
console.log('PASS intro dialogue and mobile jump toggle');
for(const mode of ['fullscreen','game-only']){
 await p.evaluate(()=>{state='paused';});
 await p.locator('#'+mode).click();
 assert(await p.evaluate(()=>!!document.fullscreenElement),'Fullscreen entered');
 await p.evaluate(()=>{window.introDone=false;playUndertaleIntro().then(()=>window.introDone=true);});
 assert(await p.locator('#undertale-intro').isVisible(),mode+' dialogue visible');
 const first=await p.locator('#undertale-intro p').textContent();
 await p.locator('#undertale-intro button').first().click();
 assert.notEqual(await p.locator('#undertale-intro p').textContent(),first);
 await p.locator('#undertale-intro button').last().click();
 assert(await p.evaluate(()=>window.introDone));
 await p.evaluate(async()=>{setGameOnly(false);await document.exitFullscreen();});
}
console.log('PASS fullscreen and game-only dialogue visibility, next and skip');

assert.deepEqual(errors,[]);console.log('PASS soul movement, timeline, all scenes and browser errors');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
