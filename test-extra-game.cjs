const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict'),fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url())});
 await p.goto('http://127.0.0.1:5174/');await p.evaluate(()=>requestAnimationFrame=()=>{});
 const ids=await p.evaluate(()=>Object.keys(SONGS).filter(id=>SONGS[id].pack));
 for(const id of ids){
  await p.selectOption('#song',id);await p.click('#start');await p.waitForFunction(()=>state==='playing'||document.getElementById('status').textContent==='LOAD FAILED',{},{timeout:45000,polling:50});
  const data=await p.evaluate(()=>({state,sources:sources.length,expected:1+(song.voiceSources?.length||(song.voiceSrc?1:0)),duration:DURATION,declared:song.duration,notes:notes.length}));assert.equal(data.state,'playing',id);assert.equal(data.sources,data.expected);assert(Math.abs(data.duration-data.declared)<1,id+' duration');assert(data.notes>0);
  await p.evaluate(async()=>{await pause();});assert.equal(await p.evaluate(()=>audio.state),'suspended');
  const before=await p.evaluate(()=>time());await p.waitForTimeout(30);assert.equal(await p.evaluate(()=>time()),before);
  await p.evaluate(()=>stopSong());assert.equal(await p.evaluate(()=>sources.length),0);console.log('AUDIO',id,data.duration.toFixed(2));
 }
 await p.selectOption('#song','tainted-destruction');await p.selectOption('#rate','1.5');await p.click('#start');await p.waitForFunction(()=>state==='playing',null,{polling:50});
 assert.equal(await p.evaluate(()=>sources[0].playbackRate.value),1.5);
 await p.evaluate(()=>{stopSources();startTime=audio.currentTime-43/settings.rate;extraUpdate(time(),true);});assert.equal(await p.evaluate(()=>Math.round(laneX(0))),135);
 assert.equal(await p.evaluate(()=>extraState.chars.echo),'tainted:black_des_p');
 const swapped=await p.evaluate(()=>extraState.cursor);await p.evaluate(()=>extraUpdate(time(),true));assert.equal(await p.evaluate(()=>extraState.cursor),swapped);
 await p.evaluate(()=>{health=1;hits.miss=10;extraAfterJudge('miss');});assert.equal(await p.evaluate(()=>health),10);
 await p.evaluate(()=>{startTime=audio.currentTime-70/settings.rate;extraUpdate(time(),true);health=50;extraAfterJudge('miss');});assert.equal(await p.evaluate(()=>health),0);
 await p.evaluate(async()=>{await pause();await restartSong();});assert.equal(await p.evaluate(()=>extraState.cursor),0);assert.equal(await p.evaluate(()=>Math.round(laneX(0))),715);assert.equal(await p.evaluate(()=>extraState.chars.echo),'tainted:bf_des_p');
 await p.evaluate(()=>{health=50;hits.miss=4;extraAfterJudge('miss');});assert.equal(await p.evaluate(()=>health),50);await p.evaluate(()=>{hits.miss=5;extraAfterJudge('miss');});assert.equal(await p.evaluate(()=>health),0);
 await p.evaluate(()=>{startTime=audio.currentTime-70/settings.rate;extraUpdate(time(),true);finish(true);});assert(await p.evaluate(()=>!!extraState.death));assert(await p.locator('#overlay').evaluate(n=>n.classList.contains('hidden')));
 await p.evaluate(()=>{extraState.death.at-=2;draw(pausedTime);});assert.equal(await p.evaluate(()=>extraState.death),null);assert(!await p.locator('#start').isDisabled());
 await p.selectOption('#song','tainted-defeat');await p.evaluate(async()=>{await prepareMod();state='playing';hits.miss=5;health=50;extraAfterJudge('miss');});assert.equal(await p.evaluate(()=>health),0);
 await p.evaluate(()=>{state='ready';});await p.selectOption('#song','death-the-deathmatch-evil');await p.evaluate(async()=>{await prepareMod();extraUpdate(65,true);});assert.equal(await p.evaluate(()=>extraState.chars.echo),'death:pico-player');
 assert.equal(await p.evaluate(()=>modJudge({type:3},'miss')),false);
 const hurt=await p.evaluate(()=>{state='playing';health=50;hits.miss=0;const ignored={hurt:true,lane:0};extraHurt(ignored,'miss');const ignoredHealth=health;extraHurt({hurt:true,lane:0},'hit');state='ready';return {ignoredHealth,health,miss:hits.miss,ignored:ignored.done};});assert.deepEqual(hurt,{ignoredHealth:50,health:35,miss:1,ignored:true});
 await p.evaluate(()=>{extraUpdate(0,true);});assert.equal(await p.evaluate(()=>extraState.chars.echo),'death:pastbf');
 await p.selectOption('#song','tainted-crush');await p.evaluate(async()=>{await prepareMod();extraUpdate(63,true);});assert.equal(await p.evaluate(()=>extraState.chars.nova),'tainted:black_ap_choose');
 await p.evaluate(()=>{state='ready';});await p.selectOption('#song','tainted-destruction');await p.evaluate(async()=>{await prepareMod();state='playing';finish(false);});await p.waitForFunction(()=>document.getElementById('mod-video').readyState>=1,null,{polling:50});assert(await p.locator('#mod-video').evaluate(v=>v.duration>0));await p.evaluate(()=>closeModVideo());
 // Converted charts retain native timestamps and are playable without duplicate key presses.
 const charts=await p.evaluate(()=>Object.entries(SONGS).filter(([id,s])=>s.pack).map(([id,s])=>({id,duration:s.duration,charts:s.charts,events:s.events})));
 const supported=new Set(['Change Character','Play Animation','Alt Idle Animation','Cam Zoom Tween','Add Camera Zoom','Bumpin Beat','Camera Follow Pos','Screen Shake','ov black','healt','Flash Red','Flash Camera','add Flash','add Flash2','Play Sound']);
 for(const s of charts){for(const c of Object.values(s.charts))for(const ns of Object.values(c)){const last=new Map();for(const n of ns){assert(Number.isFinite(n.time)&&n.time>=0);assert(n.lane>=0&&n.lane<=3);assert(n.time+n.duration<s.duration+.15);const prev=last.get(n.lane);if(prev)assert(prev.time+prev.duration<n.time,s.id+' overlap');last.set(n.lane,n);}}for(const es of Object.values(s.events))for(const e of es)assert(supported.has(e.name),e.name);}
 assert.deepEqual(errors,[]);console.log('PASS 14 decoded tracks, stems, pause, rate, restart/reset, source event coverage, health rules, death animation, end video, chart bounds and overlaps');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
