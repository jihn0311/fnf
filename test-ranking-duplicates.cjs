const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const source=fs.readFileSync('leaderboard.js','utf8');
const response=await fetch(source.match(/const endpoint='([^']+)'/)[1]+'?select=score&limit=1',{headers:{apikey:source.match(/const key='([^']+)'/)[1]}});assert.equal(response.status,200);console.log('Live ranking read: HTTP 200');
const b=await chromium.launch({headless:true,channel:'msedge'});
try{const p=await b.newPage({viewport:{width:1280,height:800}});let posts=0;const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>requestAnimationFrame=()=>0);
await p.route('http://verify.local/**',r=>{const f=path.resolve(decodeURIComponent(new URL(r.request().url()).pathname).slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});});
await p.route('https://*.supabase.co/**',r=>{if(r.request().method()==='POST'){posts++;return r.fulfill({status:201,body:''});}return r.fulfill({json:[{nickname:'TEST',score:12345,accuracy:98.5,max_combo:123,misses:1},{nickname:'TEST',score:12345,accuracy:98.5,max_combo:123,misses:1},{nickname:'OTHER',score:12345,accuracy:98.5,max_combo:123,misses:1},{nickname:'TEST',score:12345,accuracy:98.5,max_combo:123,misses:2}]});});
await p.goto('http://verify.local');await p.waitForSelector('#ranking-rows tr');assert.equal(await p.locator('#ranking-rows tr').count(),3);assert.deepEqual(await p.locator('#ranking-rows tr td:first-child').allTextContents(),['1','2','3']);await p.locator('#open-ranking').click();assert.equal(await p.locator('#ranking-heading').evaluate(e=>document.activeElement===e),true);assert(await p.locator('#ranking-submit').isDisabled());assert.equal(posts,0);
await p.evaluate(()=>window.dispatchEvent(new CustomEvent('fnf:finished',{detail:{failed:false,bot:false,score:12345,accuracy:98.5,max_combo:123,misses:0,mode:{song_id:'test',difficulty:'normal',play_side:'echo',rate:1,practice:false,nightmare:false}}})));
assert(await p.locator('#ranking-submit').isEnabled());await p.locator('#ranking-name').fill('TEST');await p.locator('#ranking-submit').click();await p.waitForFunction(()=>document.querySelector('#ranking-submit-status').textContent==='기록을 저장했어!',{},{timeout:3000,polling:50});assert(await p.locator('#ranking-submit').isDisabled());assert.equal(posts,1);
await p.setViewportSize({width:390,height:844});await p.locator('#online-ranking').scrollIntoViewIfNeeded();await p.screenshot({path:'C:/Users/kht80/AppData/Local/Temp/ranking-mobile.png'});assert.deepEqual(errors,[]);console.log('PASS ranking navigation, rows, explicit submission, mobile rendering');
}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
