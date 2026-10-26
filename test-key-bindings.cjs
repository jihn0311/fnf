const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>requestAnimationFrame=()=>0);await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''});});await p.goto('http://verify.local');
await p.locator('#bind-0').click();await p.keyboard.press('a');assert.equal(await p.locator('#keycap-d kbd').textContent(),'A');
await p.locator('#bind-1').click();await p.keyboard.press('a');assert.match(await p.locator('#binding-message').textContent(),/사용 중/);await p.keyboard.press('Escape');
await p.reload();assert.equal(await p.locator('#keycap-d kbd').textContent(),'A');
await p.evaluate(()=>{audio=new AudioContext();state='playing';startTime=audio.currentTime;notes=[];opponentNotes=[];});
const before=await p.evaluate(()=>keyPressCounts[0]);await p.keyboard.down('a');assert(await p.locator('#keycap-d').evaluate(e=>e.classList.contains('active')));await p.keyboard.up('a');assert.equal(await p.evaluate(()=>keyPressCounts[0]),before+1);assert.equal(await p.evaluate(()=>held.size),0);
await p.keyboard.press('d');assert.equal(await p.evaluate(()=>keyPressCounts[0]),before+1);await p.keyboard.down('ArrowLeft');assert.equal(await p.evaluate(()=>laneHeld(0)),true);await p.keyboard.up('ArrowLeft');
await p.locator('#reset-bindings').click();assert.equal(await p.locator('#keycap-d kbd').textContent(),'D');await p.reload();assert.equal(await p.locator('#keycap-d kbd').textContent(),'D');assert.deepEqual(errors,[]);console.log('PASS rebinding, duplicate rejection, cancellation, persistence, counters, held release, arrows and reset');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

