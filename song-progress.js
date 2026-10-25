'use strict';
// Lightweight, shared location; each pack keeps its own visual identity.
const PROGRESS_THEMES={original:'NEON DUET',sonic:'SONIC.EXE',virus:'VIRUS R',death:'DEATHMATCH',tainted:'TAINTED FATE',silly:'SILLY BILLY',impostor:'IMPOSTOR V4',survent:'MID-FIGHT MASSES',agoti:'A.G.O.T.I',kapi:'ARCADE SHOWDOWN',garcello:'SMOKE ’EM OUT STRUGGLE',mario:'MARIO’S MADNESS'};
let progressNodes=null,progressThemeKey='',progressText='',progressPercent=-1;
function updateSongProgress(chartTime){
 if(!progressNodes){const root=document.getElementById('song-progress');if(!root)return;progressNodes={root,brand:document.getElementById('progress-brand'),title:document.getElementById('progress-title'),label:document.getElementById('remaining-label'),time:document.getElementById('time'),track:document.getElementById('song-progress-track'),fill:document.getElementById('song-progress-fill')};}
 const n=progressNodes,family=song.pack||(songId.startsWith('sonic-')?'sonic':'original');
 let variant='';if(family==='mario')variant=song.stage==='landstage'?'gb':['hatebg','forest'].includes(song.stage)?'time':song.stage==='endstage'||song.stage==='warioworld'&&!songId.endsWith('-old')&&songId!=='mario-forbidden-star'?'vcr':song.stage==='piracy'?'ds':song.stage==='somari'?'nes':'';
 const themeKey=songId+'|'+family+'|'+variant;
 if(progressThemeKey!==themeKey){n.root.dataset.theme=family;n.root.dataset.variant=variant;n.brand.textContent=PROGRESS_THEMES[family]||family;n.title.textContent=song.title.replace(/ \[저사양\]$/,'');n.title.title=n.title.textContent;n.label.textContent=variant==='time'?'TIME · 남은 초':'남은 시간';progressThemeKey=themeKey;progressText='';progressPercent=-1;}
 const total=Math.max(0,Number(DURATION)||0),at=Math.max(0,Math.min(total,Number(chartTime)||0)),rate=Math.max(.01,Number(settings.rate)||1);
 const remaining=Math.ceil(Math.max(0,total-at)/rate),text=variant==='time'?String(remaining):formatTime(remaining);
 if(text!==progressText){n.time.textContent=text;n.track.setAttribute('aria-valuetext','남은 시간 '+Math.floor(remaining/60)+'분 '+remaining%60+'초');progressText=text;}
 // At most ten visual updates per second of chart time; no layout reads.
 const percent=total?Math.min(100,Math.floor(at*10)/10/total*100):0,rounded=total&&at>=total?100:Math.round(percent*100)/100;
 if(rounded!==progressPercent){n.fill.style.transform='scaleX('+(at>=total&&total?1:rounded/100)+')';n.track.setAttribute('aria-valuenow',String(at>=total&&total?100:Math.round(rounded)));progressPercent=rounded;}
}
