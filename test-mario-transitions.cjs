const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',()=>requests++);
 await page.addInitScript(()=>requestAnimationFrame=()=>0);
 await page.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});
 await page.goto('http://verify.local/');await page.waitForFunction(()=>typeof MARIO_ART!=='undefined',null,{polling:50});
 const audit=await page.evaluate(()=>{
  const failures=[];let checked=0;
  for(const [id,track] of Object.entries(MOD_SONGS).filter(([,s])=>s.pack==='mario'))for(const low of [false,true]){
   selectSong(id+(low?'-low':''));settings.difficulty='hard';const scene=MOD_ART.scenes[song.sceneKey];
   const points=[0,...song.events.hard.filter(e=>e.marioDerived).flatMap(e=>[e.time-.00001,e.time+.00001]),song.duration];
   for(const t of points){
    const chars={nova:scene.opponent,echo:scene.player,gf:scene.spectator},hidden={gf:['exesequel','nesbeat'].includes(song.stage)};
    for(const e of song.events.hard.filter(e=>e.time<=t)){
     if(e.name==='Change Character')chars[({'0':'echo','1':'nova','2':'gf',bf:'echo',boyfriend:'echo',dad:'nova',gf:'gf'})[e.v1.toLowerCase()]||'nova']='mario:'+e.v2;
     if(e.name==='Mario Guest')chars[e.v1]='mario:'+e.v2;
     if(e.name==='Mario Visibility')hidden[e.v1]=e.v2==='0';
    }
    extraUpdate(t,true);checked++;
    if(JSON.stringify(chars)!==JSON.stringify(extraState.chars)||JSON.stringify(hidden)!==JSON.stringify(extraState.marioHidden))failures.push([id,low,t,chars,extraState.chars]);
    for(const key of Object.values(chars).filter(Boolean))if(!MOD_ART.characters[key]||!scene.characters.includes(key))failures.push(['missing preload',id,key]);
   }
  }return {checked,failures};
 });assert.deepEqual(audit.failures,[]);console.log('PASS transition boundaries, backwards seek/reset, normal/low preloads:',audit.checked);
 const fixtures=[['all-stars',2,0,'omega'],['all-stars',2,2,'w4r'],['all-stars',3,0,'gx'],['all-stars',4,6,'mario_ultra3'],['promotion',1,0,'stanley'],['powerdown',5,0,'mxV2']];
 for(const [slug,a,b,char] of fixtures){assert(await page.evaluate(({slug,a,b,char})=>MOD_SONGS['mario-'+slug].events.hard.some(e=>e.marioDerived&&e.name==='Change Character'&&e.v2===char&&Number(e.sourceTrigger[1])===a&&Number(e.sourceTrigger[2])===b),{slug,a,b,char}),slug+' '+char);}
 for(const slug of ['all-stars','demise','unbeatable','promotion','starman-slaughter','abandoned','powerdown']){
  await page.evaluate(async slug=>{selectSong('mario-'+slug);settings.difficulty='hard';await prepareMod();notes=createChart();opponentNotes=createChart('hard','nova');state='paused';},slug);
  const before=requests;
  const info=await page.evaluate(()=>{
   let count=0;for(const e of song.events.hard.filter(e=>e.marioDerived)){extraUpdate(e.time+.001,true);draw(e.time+.001);count++;}
   const bytes=[...modImages.values()].reduce((sum,i)=>sum+i.naturalWidth*i.naturalHeight*4,0);
   return {count,decodedMiB:Math.round(bytes/1048576),loaded:[...modImages.values()].every(i=>i.complete&&i.naturalWidth)};
  });assert(info.loaded);assert.equal(requests,before,'No loads at transition '+slug);
  fs.writeFileSync(process.env.TEMP+'/mario-transition-'+slug+'.png',Buffer.from((await page.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));
  console.log('PASS render + no transition requests',slug,info);
 }
 const routing=await page.evaluate(()=>{selectSong('mario-all-stars');extraReset();animateSinger('nova',2,120,.5);extraNote({sourceNoteType:'Yoshi Note',time:120,lane:2},'nova');return [actors.nova.until,extraState.marioActors.guest.lane,extraState.marioActors.guest.until];});assert.equal(routing[0],-1);assert.equal(routing[1],2);assert(routing[2]>=120.5);
 assert.deepEqual(errors,[]);console.log('PASS companion singing routing and no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
