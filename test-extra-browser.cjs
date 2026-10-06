const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({viewport:{width:1440,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url())});
 await p.goto('http://127.0.0.1:5174/');await p.evaluate(()=>{requestAnimationFrame=()=>{};document.getElementById('overlay').classList.add('hidden');});
 const ids=await p.evaluate(()=>Object.keys(SONGS).filter(id=>SONGS[id].pack));assert.equal(ids.length,14);
 for(const id of ids){
  await p.selectOption('#song',id);
  await p.evaluate(async()=>{if(!audio){audio=new AudioContext();master=audio.createGain();master.connect(audio.destination);}await prepareMod();document.getElementById('overlay').classList.add('hidden');state='paused';pausedTime=10;extraUpdate(10,true);opponentNotes=createChart(settings.difficulty,'nova');notes=createChart();draw(10);});
  console.log('RENDER',id);
  if(['virus-virus-r','virus-invade','death-the-deathmatch','tainted-crush','tainted-defeat','tainted-destruction'].includes(id))await p.locator('#stage').screenshot({path:'analysis/'+id+'.png'});
  await p.evaluate(()=>{state='ready';});
 }
 await p.selectOption('#song','tainted-destruction');await p.evaluate(async()=>{await prepareMod();document.getElementById('overlay').classList.add('hidden');state='paused';pausedTime=43;extraUpdate(43,true);draw(43);});
 assert(await p.evaluate(()=>laneX(0,'echo')===135&&extraState.chars.echo==='tainted:black_des_p'));
 for(const at of [69,121,139,143.5,147,171,174]){await p.evaluate(at=>{pausedTime=at;extraUpdate(at,true);updateOpponent(at);draw(at);},at);await p.locator('#stage').screenshot({path:'analysis/destruction-'+at+'.png'});}
 await p.evaluate(()=>{state='ready';});await p.selectOption('#song','tainted-defeat');await p.evaluate(async()=>{await prepareMod();document.getElementById('overlay').classList.add('hidden');state='paused';pausedTime=80;extraUpdate(80,true);draw(80);});await p.locator('#stage').screenshot({path:'analysis/defeat-silhouette.png'});
 assert.deepEqual(errors,[]);console.log('PASS all 14 scenes, event transitions, lane swap, no missing assets or browser errors');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});

