const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',()=>requests++);
 await page.addInitScript(()=>requestAnimationFrame=()=>0);
 await page.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});
 await page.goto('http://verify.local/');await page.waitForFunction(()=>typeof MARIO_ART!=='undefined',null,{polling:50});
 const phases=[[0,'act1'],[105.6,'act2'],[224,'act3'],[350.4,'act4'],[454.4,'solo'],[479.95,'finale']];
 for(const low of [false,true]){
  await page.evaluate(async low=>{selectSong('mario-all-stars'+(low?'-low':''));settings.difficulty='hard';await prepareMod();notes=createChart();opponentNotes=createChart('hard','nova');state='paused';},low);
  const before=requests;
  for(let i=0;i<phases.length;i++){
   const [at,phase]=phases[i];
   if(i)assert.equal(await page.evaluate(t=>marioPhase(t),at-.001),phases[i-1][1]);
   const result=await page.evaluate(({at,low})=>{
    extraUpdate(at+.001,true);const keys=marioLayers(at).map(l=>l.key),loaded=keys.every(key=>modImages.has(EXTRA_ART.sprites[key].src));
    const calls=[],sprite=extraSprite;extraSprite=(key,...args)=>{calls.push(key);return sprite(key,...args);};
    try{if(low)drawLowSpecStage(at+.001);else drawMarioStage(at+.001);}finally{extraSprite=sprite;}
    return {phase:marioPhase(at),keys,calls,loaded};
   },{at,low});assert.equal(result.phase,phase);assert.equal(result.keys.length,1);assert.deepEqual(result.calls,result.keys);assert(result.loaded);
   await page.evaluate(at=>draw(at+.01),at);
   if(!low)fs.writeFileSync(process.env.TEMP+'/allstars-phase-'+phase+'.png',Buffer.from((await page.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));
  }
  assert.equal(requests,before,'No network requests during any phase switch');
  const reset=await page.evaluate(()=>{extraUpdate(30,true);return marioLayers(30)[0].key;});assert.equal(reset,'mario/stage/all-stars');
  console.log('PASS six backgrounds, five exact boundaries, single-layer replacement, backward seek, no loads:',low?'low':'normal');
 }
 const old=await page.evaluate(()=>{selectSong('mario-all-stars-old');return {phases:song.stagePhases||null,keys:marioLayers(500).map(l=>l.key)};});assert.equal(old.phases,null);assert.deepEqual(old.keys,['mario/stage/all-stars-old']);
 assert.deepEqual(errors,[]);console.log('PASS legacy unchanged and no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
