const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({viewport:{width:1400,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url())});await p.goto('http://127.0.0.1:5174/');await p.selectOption('#song','sonic-triple-trouble');await p.evaluate(()=>requestAnimationFrame=()=>{});
 const expected=[['Tails','BOYFRIEND'],['Beast','BFPhase3_Perspective_Flipped'],['KnucklesEXE','BOYFRIEND'],['Beast','BFPhase3_Perspective'],['eggman_soul','BOYFRIEND'],['Beast','BFPhase3_Perspective_Flipped']];
 for(const diff of ['normal','hard']){
  await p.selectOption('#difficulty',diff);await p.evaluate(async()=>{await prepareMod();state='paused';$('overlay').classList.add('hidden');notes=[];opponentNotes=[];});
  const phases=await p.evaluate(()=>tripleTimeline());assert.equal(phases.length,6);
  for(let i=0;i<phases.length;i++){
   const at=phases[i].time;
   assert.deepEqual(await p.evaluate(t=>{const p=triplePhase(t);return [p.opponent,p.player];},at+.0001),expected[i]);
   if(i)assert.deepEqual(await p.evaluate(t=>{const p=triplePhase(t);return [p.opponent,p.player];},at-.0001),expected[i-1]);
   const result=await p.evaluate(t=>{pausedTime=t;actors.nova={character:0,lane:0,at:t,until:t+.5};actors.echo={lane:3,at:t,until:t+.5};draw(t);return {enemy:$('opponent-name').textContent,icon:$('enemy-avatar').style.backgroundImage,left:laneX(0),right:laneX(0,'nova'),phase:triplePhase(t)};},at+6);
   assert.equal(result.left,phases[i].swap?135:715);assert.equal(result.right,phases[i].swap?715:135);if(phases[i].opponent==='Beast'){assert.equal(result.enemy,'XENOPHANES');assert(result.icon.includes('icon-Beast'));}
   if(diff==='hard')await p.locator('#stage').screenshot({path:'analysis/triple-phase-'+i+'.png'});
  }
  assert(Math.abs(phases[5].time-406.531193266)<.00001);
  assert(Math.abs(await p.evaluate(()=>tripleStep(290.9589041095899))-2832)<.00001);
  // Arrow swap returns to its exact base on restart; state is determined by song time alone.
  await p.evaluate(()=>{pausedTime=0;actors.nova.character=3;draw(0);});assert.equal(await p.evaluate(()=>laneX(0)),715);assert.equal(await p.evaluate(()=>$('opponent-name').textContent),'TAILS');
  await p.evaluate(()=>state='ready');console.log('PASS',diff,'all six phase boundaries, directional forms, note-ID isolation, BPM change, lane and icon reset');
 }
 await p.selectOption('#rate','1.5');await p.evaluate(()=>start());await p.waitForFunction(()=>state==='playing',null,{polling:50});
 await p.evaluate(()=>{stopSources();startTime=audio.currentTime-240/settings.rate;draw(time());});assert.equal(await p.evaluate(()=>triplePhase(time()).step),2320);
 await p.evaluate(()=>pause());const frozen=await p.evaluate(()=>time());await p.waitForTimeout(50);assert.equal(await p.evaluate(()=>time()),frozen);
 await p.evaluate(()=>restartSong());assert.equal(await p.evaluate(()=>triplePhase(time()).step),0);assert.equal(await p.evaluate(()=>laneX(0)),715);
 await p.evaluate(async()=>{await pause();stopSong();});assert.equal(await p.evaluate(()=>sources.length),0);
 assert.deepEqual(errors,[]);console.log('PASS real playback, 1.5x timing, pause/restart and no missing assets');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
