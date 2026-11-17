const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage({viewport:{width:1400,height:950}}),errors=[];let requests=0;
p.on('pageerror',e=>errors.push(e.message));p.on('request',()=>requests++);await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});await p.goto('http://verify.local/');
if(await p.locator('#updates-dialog').isVisible())await p.locator('#updates-confirm').click();

await p.locator('[data-mod="evil-reference"]').click();const ids=await p.locator('#song option').evaluateAll(es=>es.map(e=>e.value));assert.equal(ids.length,7);
for(const id of ids)for(const low of [false,true]){const r=await p.evaluate(async({id,low})=>{selectSong(id+(low?'-low':''));settings.difficulty='normal';await prepareMod();state='paused';notes=createChart();opponentNotes=createChart('normal','nova');document.querySelector('.overlay').style.display='none';for(const t of [0,50,100,155,220,310].filter(t=>t<DURATION)){extraUpdate(t,true);draw(t);}return {notes:notes.length,opponent:opponentNotes.length,duration:DURATION,images:modImages.size};},{id,low});assert(r.notes>100&&r.opponent>80);console.log('PASS',id,low,r);if(!low)await p.locator('canvas').first().screenshot({path:process.env.TEMP+'/'+id+'.png'});}
await p.evaluate(async()=>{
 selectSong('evil-reference-dad-final');await prepareMod();
 const guitar=MOD_SONGS['evil-reference-soul-final'].charts.normal.echo;
 for(const [lo,hi] of [[104,114],[160,174],[300,314]])if(guitar.filter(n=>n.time>=lo&&n.time<hi).length<15)throw Error('Missing guitar chart section '+lo);
 const expected=[[70,'pico-player'],[95,'spooky-player'],[125,'corruptedmom'],[150,'bf']];
 for(const [t,name] of expected)if(evilReferencePhase(t).bf!==name)throw Error('Wrong transformation at '+t);
 for(const [key,a] of Object.entries(EVIL_CAPTURE_ART)){const frames=['idle','singLEFT','singDOWN','singUP','singRIGHT'].map(k=>a.animations[k]?.[0]);if(frames.some(f=>!f))throw Error('Missing direction '+key);if(new Set(frames.map(f=>f.x+','+f.y)).size!==5)throw Error('Reused directional pose '+key);}
 selectSong('evil-reference-soul-final');await prepareMod();
 const rendered=new Set();for(let lane=0;lane<4;lane++){animateSinger('echo',lane,155,1);extraNote({captureGuitar:true,time:155,lane},'echo');if(!evilGuitarFor('echo',155.1))throw Error('Guitar tag ignored');if(evilCapturePose('echo',155.1).key!=='sing'+['LEFT','DOWN','UP','RIGHT'][lane])throw Error('Wrong input pose');draw(155.1);rendered.add(canvas.toDataURL());}if(rendered.size!==4)throw Error('Directions rendered identically');
 extraNote({time:155,lane:3},'echo');if(evilGuitarFor('echo',155.1))throw Error('Microphone note kept guitar');
 for(const id of Object.keys(MOD_SONGS).filter(id=>id.startsWith('evil-reference-')&&!id.endsWith('-low'))){selectSong(id);await prepareMod();for(let lane=0;lane<4;lane++){for(const side of ['nova','echo'])Object.assign(actors[side],{lane,at:50,until:51,sustainUntil:51});extraUpdate(50.15,true);draw(50.15);}}
 // Verify actual draw transforms preserve source character proportions.
 const characterSources=new Set(Object.entries(MOD_ART.characters).filter(([key])=>key.startsWith('evil-reference:')).flatMap(([,a])=>a.pages||[a.src]));
 for(const a of Object.values(EVIL_CAPTURE_ART))characterSources.add(a.src);
 const proto=CanvasRenderingContext2D.prototype,originalDraw=proto.drawImage;let checked=0;
 proto.drawImage=function(...args){const im=args[0];if(args.length===9&&[...characterSources].some(src=>modImages.get(src)===im)){const m=this.getTransform(),sx=args[7]/args[3]*Math.hypot(m.a,m.b),sy=args[8]/args[4]*Math.hypot(m.c,m.d);if(Math.abs(sx-sy)>1e-5)throw Error('Stretched character '+im.src);checked++;}return originalDraw.apply(this,args);};
 try{for(const id of ['evil-reference-dad-final','evil-reference-soul-day1','evil-reference-soul-final']){selectSong(id);await prepareMod();for(const t of [70,95,125,155]){extraUpdate(t,true);draw(t);}}}finally{proto.drawImage=originalDraw;}
 if(checked<10)throw Error('Insufficient proportion checks');
});console.log('PASS transformation order, five captured poses and input-driven guitars and four-direction poses');
const manifest=new Set(JSON.parse(fs.readFileSync('mod-assets.json','utf8')));const assets=await p.evaluate(()=>Object.values(MOD_SONGS).filter(s=>s.pack==='evil-reference').flatMap(s=>[s.audioSrc,...MOD_ART.scenes[s.sceneKey].characters.flatMap(k=>MOD_ART.characters[k].pages),...MOD_ART.scenes[s.sceneKey].spriteKeys.flatMap(k=>EXTRA_ART.sprites[k].pages||[EXTRA_ART.sprites[k].src])]));for(const file of assets){assert(manifest.has(file),'Missing manifest '+file);assert(fs.existsSync(file));assert(fs.statSync(file).size<100*1024*1024);}
const decoded=await p.evaluate(async()=>{const ac=new AudioContext(),result=[];try{for(const s of Object.values(MOD_SONGS).filter(s=>s.pack==='evil-reference'&&!s.lowSpec)){const data=await (await fetch(s.audioSrc)).arrayBuffer();const buffer=await ac.decodeAudioData(data);if(Math.abs(buffer.duration-s.duration)>.2)throw Error('Audio duration mismatch '+s.title);result.push(s.title);}}finally{await ac.close();}return result;});assert.equal(decoded.length,7);console.log('PASS seven audio files decode with matching chart duration');
assert.deepEqual(errors,[]);console.log('PASS all seven stage scenes, low-spec variants, charts and deployment assets');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
