import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173/';
const out=process.env.QA_OUTPUT||'/private/tmp/portfolio-qa';
await mkdir(out,{recursive:true});
const records=[];
try{
 for(const width of [1440,768,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().includes('missing-test'))errors.push(`${r.status()} ${r.url()}`)});
  for(const slug of ['', 'mapleplanet','filly','crush','speech-analysis']){
   const href=slug?`${base}projects/${slug}/`:base;
   const response=await page.goto(href);assert.equal(response.status(),200);
   if(slug){await page.reload();assert.equal(await page.locator('h1').count(),1);}
   await page.evaluate(async()=>{const images=[...document.images].filter(i=>i.hasAttribute('src'));await Promise.all(images.map(i=>{i.loading='eager';return i.decode()}));});
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
   assert(overflow.scroll<=overflow.width,`${width}/${slug}: horizontal overflow ${JSON.stringify(overflow)}`);
   const missing=await page.locator('img[src]').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));assert.deepEqual(missing,[]);
   if(slug){
    const trigger=page.locator('[data-lightbox]').first();await trigger.click();assert(await page.locator('dialog').evaluate(d=>d.open));
    await page.keyboard.press('Escape');assert(!(await page.locator('dialog').evaluate(d=>d.open)));
    assert(await trigger.evaluate(el=>document.activeElement===el));
    await page.locator('.toc nav a[href="#challenges"]').click();assert(page.url().endsWith('#challenges'));
    await page.goto(href);
   }
   await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.hasAttribute('src')).map(i=>{i.loading='eager';return i.decode()}));});
   if(width===1440||width===390)await page.screenshot({path:`${out}/${slug||'home'}-${width}.png`,fullPage:true});
   records.push({width,page:slug||'home',status:'passed'});
  }
  await page.goto(base);await page.locator('.project-copy h3 a').first().click();assert(page.url().includes('/projects/mapleplanet/'));
  await page.locator('.back-link').click();assert(page.url().endsWith('#projects'));
  const notFound=await page.goto(`${base}missing-test/`);assert.equal(notFound.status(),404);assert((await page.locator('h1').textContent()).includes('찾을 수'));
  assert.deepEqual(errors,[]);
  await context.close();
 }
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const p=await noJS.newPage();await p.goto(`${base}projects/filly/`);assert((await p.locator('h1').textContent()).includes('FILLY'));assert(await p.locator('[data-lightbox]').first().getAttribute('href'));
 await noJS.close();
 await writeFile(`${out}/report.json`,JSON.stringify({base,records,checks:['direct URLs and reload','images loaded','no horizontal overflow','modal open / Escape / focus return','table of contents','home/detail navigation','404 status','no JavaScript content'],result:'PASS'},null,2));
 console.log(`PASS: ${records.length} page/viewport combinations, modal, links, reload, 404 and no-JS rendering`);
}finally{await browser.close();}
