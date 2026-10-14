import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const meta=JSON.parse(await readFile(path.join(root,'.build-meta.json'),'utf8'));
const dist=path.join(root,'dist');
let count=0;
for(const page of meta.pages){
 const html=await readFile(path.join(dist,page),'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${page}: one h1`);
 assert(html.includes('lang="ko"')&&html.includes('name="viewport"'),`${page}: language and viewport`);
 assert(!/Q[1-9][.·]|미확인 URL|Lorem ipsum|TODO|OPIc IM2|\/private\/|\/Users\//.test(html),`${page}: no draft content`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,`${page}: unique IDs`);
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=match[1].replaceAll('&amp;','&');
  if(/^(https?:|mailto:)/.test(value))continue;
  const parsed=new URL(value,`https://test.local${meta.base}${page}`);
  assert(parsed.pathname.startsWith(meta.base),`${page}: path outside base ${value}`);
  let target=path.join(dist,decodeURIComponent(parsed.pathname.slice(meta.base.length)));
  if((await stat(target)).isDirectory())target=path.join(target,'index.html');
  assert((await stat(target)).isFile(),`${page}: missing file ${value}`);
  if(parsed.hash&&path.extname(target)==='.html'){
   const content=await readFile(target,'utf8');
   assert(content.includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),`${page}: missing anchor ${value}`);
  }
  count++;
 }
 for(const image of html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]*"/.test(image[0]),`${page}: image alt`);
}
console.log(`PASS: ${meta.pages.length} pages; ${count} local links/assets/anchors; base=${meta.base}; no draft text`);
