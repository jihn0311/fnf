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
