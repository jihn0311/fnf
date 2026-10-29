const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''});});await p.goto('http://verify.local');
assert.equal(await p.locator('[data-mod="qt"]').count(),1);assert.equal(await p.locator('[data-mod="qt-safe"]').count(),1);
const ids=await p.evaluate(()=>Object.keys(MOD_SONGS).filter(id=>['qt','qt-safe'].includes(MOD_SONGS[id].pack)));
for(const id of ids)for(const low of [false,true]){
 const info=await p.evaluate(async({id,low})=>{selectSong(id+(low?'-low':''));settings.difficulty=song.defaultDifficulty;audio??=new AudioContext();await prepareMod();state='paused';notes=createChart();opponentNotes=createChart(settings.difficulty,'nova');for(const t of [0,30,100]){extraUpdate(t,true);draw(t);}const valid=Object.values(song.charts).every(c=>Object.values(c).every(ns=>ns.every(n=>n.time<song.duration&&n.time+n.duration<=song.duration+.0001)));if(!song.qtDodge&&Object.values(song.charts).some(c=>Object.values(c).some(ns=>ns.some(n=>n.hurt))))throw Error('Safe traps');return {valid,count:notes.length,images:modImages.size};},{id,low});assert(info.valid&&info.images);console.log('PASS',id,low,info.count);
 if(!low&&id.startsWith('qt-')&&!id.startsWith('qt-safe')){fs.writeFileSync(process.env.TEMP+'/'+id+'.png',Buffer.from((await p.evaluate(()=>canvas.toDataURL())).split(',')[1],'base64'));await p.evaluate(async()=>{for(const src of [song.audioSrc,song.voiceSrc].filter(Boolean)){const b=await audio.decodeAudioData(await (await fetch(src)).arrayBuffer());if(b.duration<5)throw Error('Audio length');}});}
}
console.log(await p.evaluate(async()=>{
 selectSong('qt-termination');settings.difficulty='normal';settings.rate=1;settings.bot=false;await prepareMod();state='playing';startTime=audio.currentTime-1;master=audio.createGain();master.connect(audio.destination);qtAlertBuffer=null;
 const reset=()=>{health=100;qtState={attacks:[{at:1,done:false,dodged:false,warned:false}],cursor:0,last:null,flashUntil:-1,protectedUntil:-1,bg:'Normal'};};
 reset();for(let t=.4;t<1.3;t+=.05)updateQT(t);if(health!==90)throw Error('Not 10 percent '+health);updateQT(2);if(health!==90)throw Error('Double damage');
 reset();updateQT(.4);dodgeQT();for(let t=.45;t<1.3;t+=.05)updateQT(t);if(health!==100)throw Error('Dodge failed');
 reset();updateQT(.4);updateQT(1.5);if(health!==100)throw Error('Stall damage');
 reset();updateQT(1.5);if(health!==100)throw Error('Unseen warning damage');
 reset();settings.bot=true;for(let t=.4;t<1.3;t+=.05)updateQT(t);if(health!==100)throw Error('Bot dodge');
 reset();settings.bot=false;const trap={hurt:true};extraHurt(trap,'hit');if(health!==90)throw Error('Trap damage');
 return 'PASS 10% damage, single resolution, dodge, stall/unseen warning protection, bot dodge and trap damage';}));
assert.deepEqual(errors,[]);console.log('PASS all QT normal/safe/low tracks');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
