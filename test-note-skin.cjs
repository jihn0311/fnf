const {chromium}=require('C:/Users/kht80/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage({viewport:{width:1400,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5174/');await page.waitForFunction(()=>skinReady());
for(const scroll of ['up','down']){
 await page.evaluate(scroll=>{settings.scroll=scroll;state='paused';pausedTime=12;notes=[0,1,2,3].map(lane=>({time:12.55,lane,duration:1.1,done:false,holding:false}));opponentNotes=notes.map(n=>({...n}));document.getElementById('overlay').classList.add('hidden');draw(12);},scroll);
 await page.locator('#stage').screenshot({path:'analysis/note-skin-'+scroll+'.png'});
}
const result=await page.evaluate(()=>{const old=ctx.drawImage,seen=[];ctx.drawImage=function(...args){seen.push(args.slice(1));};for(let lane=0;lane<4;lane++){arrow(100,100,lane,36,COLORS[lane]);sustainSkin(100,100,400,lane,COLORS[lane]);sustainSkin(100,400,100,lane,COLORS[lane]);}ctx.drawImage=old;return {calls:seen.length,valid:seen.every(a=>a.every(Number.isFinite)&&a[6]>0&&a[7]>0)};});assert.equal(result.calls,20);assert(result.valid);assert.deepEqual(errors,[]);await browser.close();console.log('PASS original sprite heads/receptors, four colored bodies and both tail directions; no browser errors');})().catch(e=>{console.error(e);process.exit(1)});
