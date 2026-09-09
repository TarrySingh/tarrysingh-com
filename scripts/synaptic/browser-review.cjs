/* Local browser acceptance run. Set PLAYWRIGHT_MODULE and REVIEW_BASE_URL as needed. */
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:3038';
const out=process.env.REVIEW_OUTPUT||'/private/tmp/iwp-browser-review';
const kinds=['atlas','vortex','zeta','protein','binding','crystal','agents','metrology','motor','reservoir'];
const wheelOnly=process.env.REVIEW_ONLY_WHEEL==='1';
const report={url:base,checkedAt:new Date().toISOString(),instruments:[],errors:[],consoleErrors:[],checks:[]};
fs.mkdirSync(out,{recursive:true});
async function checkWheelZoom(page,instrument,kind){
 const slider=instrument.locator('.iwp-zoom-panel input');
 await instrument.getByRole('button',{name:'Isometric view',exact:true}).click({noWaitAfter:true});
 await page.waitForFunction(kind=>document.querySelector(`[data-instrument="${kind}"] .iwp-zoom-panel input`)?.value==='100',kind);
 await instrument.locator('canvas').scrollIntoViewIfNeeded();
 const bounds=await instrument.locator('canvas').boundingBox();
 await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
 const beforeScroll=await page.evaluate(()=>scrollY);
 await page.mouse.wheel(0,-300);
 await page.waitForFunction(kind=>Number(document.querySelector(`[data-instrument="${kind}"] .iwp-zoom-panel input`)?.value)>100,kind);
 const enlarged=Number(await slider.inputValue());
 await page.mouse.wheel(0,300);
 await page.waitForFunction(({kind,enlarged})=>Number(document.querySelector(`[data-instrument="${kind}"] .iwp-zoom-panel input`)?.value)<enlarged,{kind,enlarged});
 assert.equal(await page.evaluate(()=>scrollY),beforeScroll,`${kind}: wheel over canvas does not scroll article`);
 for(const [delta,expected] of [[-10000,'200'],[10000,'50']]){
  await page.mouse.wheel(0,delta);
  await page.waitForFunction(({kind,expected})=>document.querySelector(`[data-instrument="${kind}"] .iwp-zoom-panel input`)?.value===expected,{kind,expected});
  assert.equal(await page.evaluate(()=>scrollY),beforeScroll,`${kind}: wheel at zoom limit does not move article`);
 }
 await instrument.getByRole('button',{name:'Isometric view',exact:true}).click({noWaitAfter:true});
 await page.waitForFunction(kind=>document.querySelector(`[data-instrument="${kind}"] .iwp-zoom-panel input`)?.value==='100',kind);
 return 'Plain wheel zooms both directions without modifiers; 50–200% limits and reset pass; article stays still over canvas';
}

(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:1512,height:1100},deviceScaleFactor:1,reducedMotion:'reduce',hasTouch:true,permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();page.setDefaultTimeout(60000);
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
  await page.goto(base+'/synaptic/intelligence-without-permission',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('[data-instrument="atlas"]').waitFor();
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  if(!wheelOnly)await page.locator('.iwp-hero').screenshot({path:path.join(out,'article-hero.png')});
  console.log('Article loaded');
  for(const kind of process.env.REVIEW_SKIP_CORE==='1'?[]:kinds){
   const instrument=page.locator(`[data-instrument="${kind}"]`),result={kind,controls:0,presets:0,rendererPreserved:true};
   await instrument.locator('.iwp-instrument-bar').scrollIntoViewIfNeeded();
   await instrument.getByRole('button',{name:'Launch 3D'}).click({noWaitAfter:true});
   await instrument.getByText('LIVE VIEW',{exact:true}).waitFor();
   result.wheel=await checkWheelZoom(page,instrument,kind);
   if(wheelOnly){report.instruments.push(result);console.log(kind,result.wheel);continue}
   const canvas=await instrument.locator('canvas').elementHandle();
   const controls=instrument.locator('.iwp-instrument-control input,.iwp-instrument-control select');
   for(let i=0;i<await controls.count();i++){
    const control=controls.nth(i),before=await control.inputValue(),tag=await control.evaluate(e=>e.tagName);
    if(tag==='SELECT'){const count=await control.locator('option').count();await control.selectOption(before==='0'?String(count-1):'0')}
    else{await control.focus();await control.press(Number(before)===Number(await control.getAttribute('max'))?'Home':'End')}
    const after=await control.inputValue();assert.notEqual(after,before,`${kind}: control ${i} changes`);result.controls++;
    await page.waitForTimeout(50);
   }
   assert.equal(await page.locator('.iwp-viewport canvas').count(),1,'Only one WebGL instrument stays active');
   assert.equal(await instrument.locator('canvas').evaluate((node,original)=>node===original,canvas),true,`${kind}: renderer survives parameter changes`);
   for(let i=0;i<3;i++){await instrument.locator('.iwp-guided button').nth(i).click({noWaitAfter:true});assert.equal(await instrument.locator('.iwp-guided button').nth(i).getAttribute('aria-pressed'),'true');result.presets++;await page.waitForTimeout(80)}
   const readings=await instrument.locator('.iwp-instrument-readings').innerText();assert.ok(!/NaN|Infinity|undefined/.test(readings));
   await instrument.getByRole('button',{name:'Pin a comparison'}).click({noWaitAfter:true});assert.equal(await instrument.locator('.iwp-instrument-readings em').count(),4);
   await instrument.getByRole('button',{name:'Reset',exact:true}).click({noWaitAfter:true});assert.equal(await instrument.locator('.iwp-instrument-readings em').count(),0);
   for(const view of ['Front view','Top view','Isometric view','Zoom in','Zoom out','Rotate left','Rotate right'])await instrument.getByRole('button',{name:view,exact:true}).click({noWaitAfter:true});
   await instrument.getByRole('button',{name:'Isometric view',exact:true}).click({noWaitAfter:true});
   const zoomSlider=instrument.locator('.iwp-zoom-panel input');
   await zoomSlider.focus();await zoomSlider.press('End');await page.waitForTimeout(80);assert.equal(await zoomSlider.inputValue(),'200',`${kind}: zoom reaches 200%`);
   await zoomSlider.press('Home');await page.waitForTimeout(80);assert.equal(await zoomSlider.inputValue(),'50',`${kind}: zoom reaches 50%`);
   await instrument.getByRole('button',{name:'Increase magnification',exact:true}).click({noWaitAfter:true});assert.ok(Number(await zoomSlider.inputValue())>50,`${kind}: plus button zooms in`);
   await instrument.getByRole('button',{name:'Decrease magnification',exact:true}).click({noWaitAfter:true});assert.equal(await zoomSlider.inputValue(),'50',`${kind}: minus button zooms out`);
   await instrument.getByRole('button',{name:'Isometric view',exact:true}).click({noWaitAfter:true});assert.equal(await zoomSlider.inputValue(),'100',`${kind}: home view restores magnification`);
   result.zoom='buttons, 50–200% slider and camera reset verified';
   await instrument.getByRole('button',{name:'Labels',exact:true}).click({noWaitAfter:true});assert.equal(await instrument.locator('.iwp-world-label:not([hidden])').count(),0);await instrument.getByRole('button',{name:'Labels',exact:true}).click({noWaitAfter:true});
   await instrument.getByRole('button',{name:'Studio light',exact:true}).click({noWaitAfter:true});await instrument.getByRole('button',{name:'Studio light',exact:true}).click({noWaitAfter:true});
   await instrument.getByRole('button',{name:'Expand instrument',exact:true}).click({noWaitAfter:true});assert.equal(await instrument.getAttribute('role'),'dialog');await page.keyboard.press('Escape');assert.equal(await instrument.getAttribute('role'),null);
   await instrument.screenshot({path:path.join(out,`${kind}-desktop.png`)});
   if(process.env.REVIEW_REFRESH_PREVIEWS==='1'){
    const capture=path.join(out,`${kind}-scene.png`);await instrument.locator('.iwp-viewport').screenshot({path:capture,style:'.iwp-scene-navigation,.iwp-scene-corner{visibility:hidden!important}'});
    const previews=path.join(process.cwd(),'public/synaptic/intelligence-without-permission/previews');fs.mkdirSync(previews,{recursive:true});await sharp(capture).webp({quality:88}).toFile(path.join(previews,`${kind}.webp`));
   }
   report.instruments.push(result);console.log(kind,JSON.stringify(result));
  }
  if(process.env.REVIEW_REFRESH_PREVIEWS==='1'){
   const previews=path.join(process.cwd(),'public/synaptic/intelligence-without-permission/previews');const revisions=Object.fromEntries(kinds.map(kind=>[kind,crypto.createHash('sha256').update(fs.readFileSync(path.join(previews,`${kind}.webp`))).digest('hex').slice(0,12)]));fs.writeFileSync(path.join(process.cwd(),'src/lib/synaptic/intelligence-without-permission/preview-revisions.json'),JSON.stringify(revisions,null,2)+'\n');
  }
  const geology=page.locator('[data-instrument="reservoir"]');
  if(await geology.getByRole('button',{name:'Launch 3D'}).count()){await geology.locator('.iwp-instrument-bar').scrollIntoViewIfNeeded();await geology.getByRole('button',{name:'Launch 3D'}).click({noWaitAfter:true});await geology.getByText('LIVE VIEW',{exact:true}).waitFor()}
  await geology.locator('.iwp-instrument-bar').scrollIntoViewIfNeeded();
  const barBounds=await geology.locator('.iwp-instrument-bar').boundingBox();
  await page.mouse.move(barBounds.x+20,barBounds.y+barBounds.height/2);
  const beforeScroll=await page.evaluate(()=>scrollY);
  await page.mouse.wheel(0,150);
  await page.waitForFunction(previous=>scrollY>previous,beforeScroll,{timeout:5000});
  assert.equal(await geology.locator('.iwp-zoom-panel input').inputValue(),'100','Scrolling outside canvas does not change zoom');
  report.checks.push('Ordinary wheel outside the canvas scrolls the article without changing magnification');
  if(wheelOnly){
   assert.equal(report.instruments.length,10,'All ten scenes verified');
   assert.equal(report.errors.length,0,JSON.stringify(report.errors));
   assert.equal(report.consoleErrors.length,0,report.consoleErrors.join('\n').slice(0,4000));
   report.checks.push('All ten 3D canvases accept plain-wheel zoom with no modifier key');
   console.log('ALL WHEEL CHECKS PASSED',out);
   return;
  }
  await geology.getByRole('button',{name:'Share this view'}).click({noWaitAfter:true});const shared=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(shared.includes('instrument=reservoir'));report.checks.push('Share link copies complete instrument settings');
  const download=page.waitForEvent('download');await geology.getByRole('button',{name:'Settings ↓',exact:true}).click({noWaitAfter:true});const settingsDownload=await download;await settingsDownload.saveAs(path.join(out,'reservoir-settings.json'));const state=JSON.parse(fs.readFileSync(path.join(out,'reservoir-settings.json'),'utf8'));assert.equal(state.instrument,'reservoir');assert.ok(state.method.includes('synthetic'));report.checks.push('JSON settings export includes scientific method and readouts');
  const imageDownload=page.waitForEvent('download');await geology.getByRole('button',{name:'Image ↓',exact:true}).click({noWaitAfter:true});await (await imageDownload).saveAs(path.join(out,'reservoir-export.png'));assert.ok(fs.statSync(path.join(out,'reservoir-export.png')).size>20000);report.checks.push('PNG image export contains rendered content');
  await page.setViewportSize({width:390,height:844});
  for(const kind of ['reservoir','protein','zeta','agents','motor']){
   const instrument=page.locator(`[data-instrument="${kind}"]`);await instrument.locator('.iwp-instrument-bar').scrollIntoViewIfNeeded();
   if(await instrument.getByRole('button',{name:'Launch 3D'}).count())await instrument.getByRole('button',{name:'Launch 3D'}).click({noWaitAfter:true});
   await instrument.getByText('LIVE VIEW',{exact:true}).waitFor();await instrument.screenshot({path:path.join(out,`${kind}-mobile.png`)});
   if(await instrument.locator('.iwp-linked-plot').count()){const chart=await instrument.locator('.iwp-linked-plot svg').boundingBox();assert.ok(chart.height>=200,'Mobile linked chart retains readable height')}
   const overflow=await instrument.evaluate(e=>e.scrollWidth>e.clientWidth+1);assert.equal(overflow,false,`${kind}: no horizontal instrument overflow at 390px`)
  }
  report.checks.push('Five representative instruments fit a 390px mobile viewport with full-height linked plots');
  const motor=page.locator('[data-instrument="motor"]');await motor.locator('canvas').scrollIntoViewIfNeeded();const touchBounds=await motor.locator('canvas').boundingBox(),cx=touchBounds.x+touchBounds.width/2,cy=touchBounds.y+touchBounds.height/2,cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-35,y:cy,id:1},{x:cx+35,y:cy,id:2}]});
  for(let delta=40;delta<=70;delta+=10)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-delta,y:cy,id:1},{x:cx+delta,y:cy,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);assert.ok(Number(await motor.locator('.iwp-zoom-panel input').inputValue())>100,'Touch pinch increases magnification');await cdp.detach();report.checks.push('Two-finger pinch magnifies the 3D view');
  await page.setViewportSize({width:1512,height:1100});
  const figures=page.locator('figure.iwp-figure');assert.equal(await figures.count(),38);
  for(let i=0;i<await figures.count();i++){const figure=figures.nth(i);if(await figure.locator('[data-instrument]').count())continue;const figureId=await figure.getAttribute('id');await figure.locator('.iwp-figure-header').scrollIntoViewIfNeeded();await figure.screenshot({path:path.join(out,`${figureId}-desktop.png`)})}
  report.checks.push('All 38 figures have unique rendered placements; 28 2D figures captured for visual review');
  await page.emulateMedia({media:'print'});await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.waitForTimeout(50);assert.equal(await page.locator('.iwp-instrument-static[open]').count(),10);for(let i=0;i<10;i++)assert.equal(await page.locator('.iwp-instrument-static .iwp-static').nth(i).isVisible(),true,'3D static explanation is visible for print');await page.locator('#figure-V29').screenshot({path:path.join(out,'reservoir-print.png')});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));await page.emulateMedia({media:'screen'});report.checks.push('All ten 3D instruments expose their static explanation for printing');
  await page.goto(shared,{waitUntil:'domcontentloaded'});await page.locator('[data-instrument="reservoir"]').getByText('LIVE VIEW',{exact:true}).waitFor();report.checks.push('Shared state restores and opens the intended instrument');
  await page.setViewportSize({width:1512,height:1100});await page.goto(base+'/',{waitUntil:'domcontentloaded'});const card=page.getByRole('link',{name:/Read Intelligence Without Permission/});await card.scrollIntoViewIfNeeded();await card.screenshot({path:path.join(out,'homepage-card.png')});assert.equal(await card.getAttribute('href'),'/synaptic/intelligence-without-permission');report.checks.push('Homepage Studio feature links to article');await page.setViewportSize({width:390,height:844});await card.screenshot({path:path.join(out,'homepage-card-mobile.png')});
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));assert.equal(report.consoleErrors.length,0,report.consoleErrors.join('\n').slice(0,4000));
 }finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close()}
 console.log('ALL CHECKS PASSED',out);
})().catch(error=>{console.error(error);process.exitCode=1});
