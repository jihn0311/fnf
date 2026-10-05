'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const routes={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/game.js':'game.js','/imported-chart.js':'imported-chart.js','/assets/self-embodiment.mp3':'assets/self-embodiment.mp3','/assets/self-embodiment-inline.js':'assets/self-embodiment-inline.js','/analysis/':'analysis/index.html','/analysis/analyze.js':'analysis/analyze.js'};
for(const file of JSON.parse(fs.readFileSync(path.join(root,'mod-assets.json'),'utf8')))routes['/'+file]=file;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.ogg':'audio/ogg','.webp':'image/webp','.mp4':'video/mp4'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:5174');
 if(req.method==='POST'&&url.pathname==='/analysis-results'){
  if(req.headers.origin!=='http://127.0.0.1:5174'){res.writeHead(403);res.end();return;}
  const chunks=[];let length=0;req.on('data',chunk=>{length+=chunk.length;if(length>20e6){req.destroy();return;}chunks.push(chunk);});
  req.on('end',()=>{try{const data=JSON.parse(Buffer.concat(chunks));if(!Number.isFinite(data.duration)||!Array.isArray(data.frames))throw Error('Invalid analysis');fs.writeFileSync(path.join(root,'analysis/features.json'),JSON.stringify(data));res.end('saved');}catch(e){res.writeHead(400);res.end(e.message);}});return;
 }
 let route;try{route=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}const file=routes[route];if(req.method!=='GET'||!file){res.writeHead(404);res.end('Not found');return;}
 const resolved=path.join(root,file);if(!fs.existsSync(resolved)){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
 const size=fs.statSync(resolved).size;res.setHeader('Accept-Ranges','bytes');
 if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416,{'Content-Range':'bytes */'+size});res.end();return;}
 const begin=Number(match[1]),end=match[2]?Math.min(Number(match[2]),size-1):size-1;
 if(begin>end||begin>=size){res.writeHead(416,{'Content-Range':'bytes */'+size});res.end();return;}
 res.writeHead(206,{'Content-Range':`bytes ${begin}-${end}/${size}`,'Content-Length':end-begin+1});fs.createReadStream(resolved,{start:begin,end}).pipe(res);return;}
 res.setHeader('Content-Length',size);fs.createReadStream(resolved).pipe(res);
}).listen(5174,'127.0.0.1',()=>console.log('NEON DUET: http://127.0.0.1:5174'));
