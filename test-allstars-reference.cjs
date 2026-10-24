const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',()=>requests++);
 await page.addInitScript(()=>requestAnimationFrame=()=>0);
 await page.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});
 await page.goto('http://verify.local/');await page.waitForFunction(()=>typeof MARIO_ART!=='undefined',null,{polling:50});

 const samples=[40,140,170,200,280,345,355,400,458,484,510];
 for(const low of [false,true]){
  await page.evaluate(async low=>{selectSong('mario-all-stars'+(low?'-low':''));settings.difficulty='hard';await prepareMod();notes=createChart();opponentNotes=createChart('hard','nova');state='paused';},low);
  const checked=await page.evaluate(()=>{
   const results=[];
   for(const order of [[1,2],[2,1]]){
    extraUpdate(456.8,true);state='playing';audio={currentTime:456.8};startTime=0;settings.rate=1;
    notes=song.charts.hard.echo.filter(n=>Math.abs(n.time-456.8)<.001).map(n=>({...n}));held.clear();
    for(const lane of order)inputDown('test'+lane,lane);
    results.push({lane:actors.echo.lane,until:actors.echo.until,both:notes.every(n=>n.holding)});
    audio.currentTime=457;updateHeldPose(457);results.push({lane:actors.echo.lane,until:actors.echo.until});
    held.clear();
   }
   state='paused';
   const key=MOD_ART.scenes[song.sceneKey].phaseBackgrounds.act3,a=EXTRA_ART.sprites[key];
   const f1=extraFrame(a,'idle',.1),f2=extraFrame(a,'idle',.4);
   return {results,moving:JSON.stringify(f1)!==JSON.stringify(f2),frames:a.animations.idle.length};
  });
  for(const r of checked.results){assert.equal(r.lane,1,'No Animation chord must preserve singing lane');assert(r.until>=457.3);if('both' in r)assert(r.both);}
  assert(checked.moving);assert(checked.frames>1);
  console.log('PASS simultaneous hold input in both orders and native animated Act 3 frames');
  const before=requests;
  for(const t of samples){
   const info=await page.evaluate(t=>{
    extraUpdate(t,true);const poses=[],original=extraActor;ctx.save();ctx.setTransform(1,0,0,1,0,0);
    extraActor=(side)=>{const m=ctx.getTransform();poses.push({side,x:m.e,y:m.f,scale:m.a});};
    try{drawMarioActors(t);}finally{extraActor=original;ctx.restore();}
    draw(t);return {poses,cinema:allStarsCinemaActive(t)};
   },t);
   if(t===140){assert.equal(info.poses.find(p=>p.side==='echo').x,560);assert.equal(info.poses.find(p=>p.side==='nova').x,560);}
   if(t===400)assert(info.poses.find(p=>p.side==='echo').scale<info.poses.find(p=>p.side==='nova').scale);
   if(t===458)assert.equal(info.poses.find(p=>p.side==='echo').x,560);
   if([355,510].includes(t))assert.equal(info.cinema,!low);
   if(!low)fs.writeFileSync(process.env.TEMP+'/allstars-corrected-'+t+'.png',Buffer.from((await page.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));
  }
  assert.equal(requests,before,'No mid-play requests');
  console.log('PASS video-based actor layout, cinema, and preload',low?'low':'normal');
 }
 const hidden=await page.evaluate(()=>{selectSong('mario-all-stars');return song.charts.hard.echo.filter(n=>allStarsCinemaActive(n.time)).length;});assert.equal(hidden,0,'No playable notes hidden by cinematics');
 assert.deepEqual(errors,[]);console.log('PASS no hidden playable notes or browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
