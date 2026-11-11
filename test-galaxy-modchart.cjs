const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context={song:{pack:'galaxy',bpm:160,originalSpeed:2.5},songId:'galaxy-cona',settings:{difficulty:'hard',scroll:'down',speed:2.5},console};vm.createContext(context);vm.runInContext(fs.readFileSync('galaxy-native.js','utf8')+'\n'+fs.readFileSync('galaxy-runtime.js','utf8'),context);
for(const slug of ['cona','underworld','cyber'])for(const scroll of ['up','down']){
 context.songId='galaxy-'+slug;context.settings.scroll=scroll;
 const result=vm.runInContext(`(()=>{let moves=0,last='';for(let t=0;t<210;t+=.25){const s=updateGalaxyMotion(t);for(let lane=0;lane<4;lane++)for(const side of ['nova','echo']){const p=galaxyNotePoint({lane,time:t+.5},side,t);if(!Number.isFinite(p.x+p.y+p.angle))throw Error('Invalid point at '+t);}
 const xy=JSON.stringify(s.receptors.map(r=>[r.x,r.y]));if(last&&last!==xy)moves++;last=xy;
 }updateGalaxyMotion(60);const first=JSON.stringify(galaxyMotion.receptors);updateGalaxyMotion(100);updateGalaxyMotion(60);if(first!==JSON.stringify(galaxyMotion.receptors))throw Error('Rewind mismatch');return moves;})()`,context);
 assert(result>0,slug+' no moving receptors');console.log('PASS',slug,scroll,result);
}
context.settings.difficulty='easy';assert.equal(vm.runInContext('galaxyMotionActive()',context),false);context.settings.difficulty='hard';context.song.lowSpec=true;assert.equal(vm.runInContext('galaxyMotionActive()',context),false);
console.log('PASS stable easy/low and all timeline sections');
