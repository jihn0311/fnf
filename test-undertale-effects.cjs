const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
p.on('pageerror',e=>errors.push(e.message));p.on('request',()=>requests++);await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});await p.goto('http://verify.local/');
if(await p.locator('#updates-dialog').isVisible())await p.locator('#updates-confirm').click();

await p.evaluate(async()=>{audio=new AudioContext();master=audio.createGain();master.connect(audio.destination);selectSong('undertale-hopes-and-dreams');await prepareMod();if(!extraSoundBuffers.get('undertale-damage')?.duration)throw Error('Missing decoded damage sound');
const original=extraSprite,calls=[];extraSprite=(...args)=>{calls.push(args);return original(...args);};
drawUndertaleHopesEffects(70*BEAT,true);if(!calls.some(a=>a[0].endsWith('/star')&&a[4]>100))throw Error('Missing large stars');calls.length=0;
drawUndertaleHopesEffects(130*BEAT+.01,false);if(!calls.some(a=>a[0].endsWith('/thunder')))throw Error('Missing thunder');calls.length=0;
song.lowSpec=true;drawUndertaleHopesEffects(70*BEAT,true);if(calls.length)throw Error('Low spec effects');song.lowSpec=false;extraSprite=original;
const sound=extraSound;let count=0;extraSound=(name)=>{if(name==='undertale-damage')count++;};
for(const dodge of [false,true]){undertaleReset();undertaleState.at=10;undertaleState.beat=Math.floor(10/BEAT);undertaleState.jump=dodge?9.9:-100;undertaleState.attacks=[{kind:'slash',lanes:[0,1,2,3],warning:9,at:10,done:false}];state='playing';settings.bot=false;resumeGraceUntil=-1;health=100;updateUndertale(10);updateUndertale(10.01);}
if(count!==1)throw Error('Damage sound repeated or played on dodge');extraSound=sound;state='paused';await audio.close();});

await p.evaluate(()=>{
 selectSong('undertale-hopes-and-dreams');
 if(undertaleFinaleProtected(960*BEAT-.001)||!undertaleFinaleProtected(960*BEAT)||!undertaleFinaleProtected(1152*BEAT))throw Error('Finale boundary');
 const originals={time,finish,scheduleMusic,scheduleVoices,updateMod,updateOpponent,updateNotes,updateQT,updateUndertale,draw};
 let now=960*BEAT,result=null;time=()=>now;finish=failed=>{result=failed===true?'failed':'complete';};scheduleMusic=scheduleVoices=updateMod=updateOpponent=updateNotes=updateQT=updateUndertale=draw=()=>{};
 state='playing';health=0;$('practice').checked=false;frame(1000);if(result!==null)throw Error('Protected finale failed');
 now=960*BEAT-.001;frame(1016);if(result!=='failed')throw Error('Early protection');
 result=null;now=DURATION;frame(1032);if(result!=='complete')throw Error('Finale did not complete');
 ({time,finish,scheduleMusic,scheduleVoices,updateMod,updateOpponent,updateNotes,updateQT,updateUndertale,draw}=originals);state='paused';
 selectSong('undertale-megalovania');if(undertaleFinaleProtected(1200*BEAT))throw Error('Protected other song');
});
console.log('PASS zero-health finale protection, boundary, song completion and other-song exclusion');
assert.deepEqual(errors,[]);console.log('PASS native sound decode, hit-only playback, large stars, thunder and low-spec exclusion');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
