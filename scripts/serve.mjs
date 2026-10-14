import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const meta=JSON.parse(await readFile(path.join(root,'.build-meta.json'),'utf8'));
const dist=path.join(root,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(url.pathname);
  if(!pathname.startsWith(meta.base)){res.writeHead(404);res.end('Not found');return;}
  let filename=path.resolve(dist,pathname.slice(meta.base.length)||'.');
  if(filename!==dist&&!filename.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}
  let info;
  try{info=await stat(filename);}catch{}
  if(info?.isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}
   filename=path.join(filename,'index.html');
  }
  let data,status=200;
  try{data=await readFile(filename);}catch{filename=path.join(dist,'404.html');data=await readFile(filename);status=404;}
  res.writeHead(status,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(400);res.end('Bad request');}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}${meta.base}`));
