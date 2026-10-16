const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>requestAnimationFrame=()=>0);
 await page.route('http://verify.local/**',route=>{const name=decodeURIComponent(new URL(route.request().url()).pathname).slice(1)||'index.html',file=path.resolve(name);if(!file.startsWith(process.cwd()+path.sep)||!fs.existsSync(file)){errors.push('missing '+name);return route.fulfill({status:404,body:'missing'});}return route.fulfill({path:file});});
 await page.goto('http://verify.local/');await page.waitForFunction(()=>typeof MARIO_ART!=='undefined',null,{polling:50});
 assert.equal(await page.locator('.mod-card').count(),10);assert.equal(await page.locator('.song-picker').isVisible(),false);
 await page.screenshot({path:process.env.TEMP+'/mario-mod-menu.png',fullPage:true});
 for(const family of await page.locator('.mod-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.mod))){
  await page.locator('[data-mod="'+family+'"]').click();assert.equal(await page.evaluate(()=>[...$('song').options].every(o=>songFamily(o.value,SONGS[o.value])===selectedMod)),true);await page.locator('#change-mod').click();
 }
 await page.locator('[data-mod="mario"]').click();assert.equal(await page.locator('#song option').count(),41);
 await page.selectOption('#performance-mode','low');assert.equal(await page.evaluate(()=>[...$('song').options].every(o=>SONGS[o.value].lowSpec)),true);
 await page.selectOption('#performance-mode','normal');
 const ids=await page.evaluate(()=>Object.keys(MOD_SONGS).filter(id=>MOD_SONGS[id].pack==='mario'));assert.equal(ids.length,41);
 for(const id of ids){
  for(const low of [false,true]){
   const result=await page.evaluate(async({id,low})=>{selectSong(id+(low?'-low':''));settings.difficulty='hard';await prepareMod();notes=createChart();opponentNotes=createChart('hard','nova');state='paused';for(const t of [5,song.duration/2,song.duration-3]){extraUpdate(t,true);draw(t);}return {notes:notes.length,enemy:opponentNotes.length,skin:!!customNoteSkin(),chars:Object.values(extraState.chars).filter(Boolean).every(c=>!!MOD_ART.characters[c]),images:[...modImages.values()].every(i=>i.complete&&i.naturalWidth)};},{id,low});assert(result.notes>0&&result.enemy>0&&result.skin&&result.chars&&result.images,JSON.stringify({id,low,result}));
  }
  console.log('PASS',id);
 }
 for(const id of ['mario-its-a-me','mario-golden-land','mario-no-party','mario-paranoia']){
  await page.evaluate(async id=>{selectSong(id);settings.difficulty='hard';await prepareMod();notes=createChart();opponentNotes=createChart('hard','nova');state='paused';extraUpdate(10,true);draw(10)},id);
  fs.writeFileSync(process.env.TEMP+'/'+id+'.png',Buffer.from((await page.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));
 }
 await page.evaluate(()=>{state='ready';setSettingsLocked(false);});
 await page.selectOption('#song','mario-its-a-me');await page.locator('#start').click();
 await page.waitForFunction(()=>state==='playing'||state==='paused',null,{polling:100,timeout:60000});
 assert.equal(await page.locator('#change-mod').isDisabled(),true);
 assert(await page.evaluate(()=>audioBuffers.size>=2));
 await page.evaluate(async()=>{if(state==='playing')await pause();stopSong();});
 assert.equal(await page.locator('#change-mod').isEnabled(),true);
 await page.locator('#change-mod').click();await page.setViewportSize({width:390,height:844});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);console.log('PASS menu filtering, 41 normal/low scenes, skins and resource loading');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exit(1)});
