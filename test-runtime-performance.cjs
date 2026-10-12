const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url())});
await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.goto('http://127.0.0.1:5174/');
await p.evaluate(()=>{audio=new AudioContext();master=audio.createGain();master.connect(audio.destination)});
console.log(await p.evaluate(()=>{
 const chart=Array.from({length:10000},(_,i)=>({time:i*.1,duration:0,done:true}));chart.push({time:1001,duration:10,done:false});
 if(chartStart(chart)!==10000)throw Error('cursor');chart[10000].done=true;if(chartStart(chart)!==10001||chartStart([{done:false}])!==0)throw Error('reset');
 const holds=[{time:0,duration:20},{time:1,duration:0},{time:2,duration:0}];if(opponentFlashEnds(holds).some(n=>n!==20))throw Error('long hold flash skipped');
 const dense=Array.from({length:20000},(_,i)=>({time:i*.01,duration:0,done:true}));chartStart(dense);let visits=0;
 for(let frame=0;frame<120;frame++)for(let i=chartStart(dense);i<dense.length;i++)visits++;
 if(visits!==0)throw Error('old notes scanned');return 'PASS cursor reset, persistent long-hold flash and 2,400,000 redundant visits eliminated';
}));
const ids=await p.evaluate(()=>Object.keys(MOD_SONGS));let total=0;
for(const id of ids){for(const low of [false,true]){
 const result=await p.evaluate(async({id,low})=>{selectSong(id+(low?'-low':''));settings.difficulty=song.defaultDifficulty||Object.keys(song.charts)[0];await prepareMod();state='paused';notes=createChart();opponentNotes=createChart(settings.difficulty,'nova');
 for(const t of [5,song.duration/2,song.duration-3]){if(song.pack)extraUpdate(t,true);else updateMod(t);updateOpponent(t);updateNotes(t);draw(t);}
 if(song.pack==='impostor'){const v=impostorViewLayout();if(!['impostor-ejected','impostor-esculent','impostor-defeat'].includes(songId)&&impostorActorY('nova',v)<464)throw Error('floating opponent '+id);if(impostorLayers()!==impostorLayers())throw Error('layer cache');}
 return notes.length;},{id,low});assert(result>0,id);total++;
 }console.log('PASS',id);
 if(id==='impostor-sussus-moogus')await p.locator('#stage').screenshot({path:process.env.TEMP+'/fnf-position-after.png'});
}
assert.deepEqual(errors,[]);console.log('PASS',total,'normal/low mod render paths, start/middle/end, no resource errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
