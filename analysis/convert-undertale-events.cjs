const fs=require('fs'),path=require('path');const root='C:/Users/kht80/AppData/Local/Temp/undertale-original';let src=fs.readFileSync(root+'/source/PlayState.hx','utf8');src=src.slice(src.indexOf('override function beatHit()'));src=src.slice(src.indexOf('super.beatHit();')+16,src.indexOf('if(lastBeatHit >= curBeat)'));src=src.replace(/\/\/[^\n]*/g,'').replace(/:String/g,'');
const flags=['starBlaze','slashAttack','slashExtra','lightningFast','lightningSlow','lightningAll','lightningTriple','lightningTripleBreakbeat','lightningSequence','lightningUnfair'];const output={};
for(const slug of ['tutorial','hopes-and-dreams','your-worst-nightmare','megalovania']){output[slug]={};for(const hard of [false,true]){
 let beat=0,logs=[],rows=[],previous='';const sprite=()=>({alpha:0,color:0,animation:{play(){}}});
 const data={curSong:slug,curBeat:0,curStep:0,storyDifficulty:hard?2:1,deathCounter:0,health:1,songMisses:0,jumping:false,ClientPrefs:{moreSoul:hard},Paths:{formatToSongPath:x=>x,json:x=>x,sound:x=>x},OpenFlAssets:{exists:x=>fs.existsSync(root+'/assets/preload/data/'+x+'.json')},DialogueBoxPsych:{parseDialogue:x=>({key:x.split('/').pop()})},FlxG:{sound:{play(){}},camera:{shake(){}}},FlxColor:{fromRGB:()=>0},Conductor:{songPosition:0},dad:sprite(),bg:sprite(),fstatic:sprite(),souls1:sprite(),souls2:sprite(),souls3:sprite(),souls4:sprite(),trace(){},createSaveText(){},createSpookyText(text){logs.push({text});},spawnSlashOnNote(){logs.push({attack:'slash'});},startDialogue(d){if(d?.key)logs.push({dialogue:d.key});}};data.dad.alpha=1;
 for(const flag of flags)data[flag]=false;
 const scope=new Proxy(data,{has:()=>true,get:(o,k)=>k===Symbol.unscopables?undefined:o[k],set:(o,k,v)=>(o[k]=v,true)});const run=new Function('scope','with(scope){'+src+'}');
 for(beat=0;beat<1300;beat++){data.curBeat=beat;logs=[];run(scope);const state=Object.fromEntries(flags.map(k=>[k,data[k]]));state.opponentAlpha=data.dad.alpha;state.souls=[1,2,3,4].map(i=>data['souls'+i].alpha);state.static=data.fstatic.alpha;const serial=JSON.stringify(state);if(serial!==previous||logs.length)rows.push({beat,state,logs});previous=serial;}
 output[slug][hard?'hard':'normal']=rows;
}}
fs.writeFileSync('undertale-events.js','const UNDERTALE_EVENTS='+JSON.stringify(output)+';\n');console.log(Object.fromEntries(Object.entries(output).map(([k,v])=>[k,v.normal.length])));

