import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {request,REST,replay} from './gesture.mjs';
const drawing=p=>p.nodes.map(n=>({id:n.id,local:n.local,world:n.world,opacity:n.worldOpacity,commands:n.commands}));
const node=(p,id)=>p.nodes.find(n=>n.id===id);
const close=(a,b,epsilon=1e-7)=>assert.ok(Math.abs(a-b)<epsilon,`${a} differs from ${b}`);
export async function verify({Motor,doc,out,motor,chrome,serve}) {
  const results=[],check=(name,fn)=>{fn();results.push({name,result:'PASS'});};
  const compiled=Motor.compileDocument(doc),r=replay();
  check('release and reversal retain the current evaluated drawing at the request instant',()=>{
    const i=Motor.createInstance(compiled,null);i.evaluate(0);
    for(const [t,v] of [[.1,request(1050,155)],[.31,request(690,400)],[.44,REST],[.51,request(1030,175)]]){
      const before=drawing(i.evaluate(t));for(const [k,value] of Object.entries(v))i.setInput(k,value);
      assert.deepEqual(drawing(i.evaluate(t)),before);
    }
    const end=i.evaluate(1.3);close(end.inputs.effective.pull,request(1030,175).pull);
  });
  check('near, far, reverse, release and interrupted replay match forward evaluation',()=>{
    const i=Motor.createInstance(compiled,null),j=Motor.createInstance(compiled,null);
    for(const rec of r){i.evaluate(rec.time);i.setInput(rec.input,rec.value);}
    assert.deepEqual(i.evaluate(7.4),j.replay(r,7.4));
    assert.deepEqual(drawing(i.evaluate(7.5)),drawing(Motor.createInstance(compiled,null).evaluate(0)));
  });
  check('tail stays on its drive pin and the bracing fingers stay on the ledge through 181 sampled poses',()=>{
    const i=Motor.createInstance(compiled,null);
    for(let f=0;f<=180;f++){
      const p=i.replay(r,f/25),tail=node(p,'creature-silhouette').commands[0],pin=node(p,'tail-attachment').world;
      close(tail[1],pin[4]);close(tail[2],pin[5]);
      const hand=node(p,'bracing-arm').commands[3];close(hand[5],538);close(hand[6],490);
      assert.ok(p.nodes.every(n=>n.world.every(Number.isFinite)));
    }
  });
  check('reset restores rest, retained snapshots remain detached, and instances are independent',()=>{
    const a=Motor.createInstance(compiled,null),b=Motor.createInstance(compiled,null),saved=a.evaluate(0),copy=structuredClone(saved);
    a.replay(r,3.6);assert.deepEqual(saved,copy);assert.deepEqual(b.evaluate(0),copy);a.reset();assert.deepEqual(a.evaluate(0),copy);
  });
  const {chromium}=await import(pathToFileURL(path.join(motor,'node_modules/playwright/index.mjs')));
  const server=serve(path.join(out,'play')),errors=[],external=[];
  let browser,page;
  try {
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    browser=await chromium.launch({executablePath:chrome,headless:true});
    const context=await browser.newContext({viewport:{width:1320,height:1060},deviceScaleFactor:1});
    page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))external.push(r.url());});
    await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.inkborn?.frameCount>2);
    assert.equal(await page.evaluate(()=>window.inkborn.renderer),'rive');
    const drop=page.getByRole('button',{name:'Vermilion drop',exact:true});
    await drop.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(850);
    assert.ok(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull>0));
    await page.keyboard.press('Escape');await page.waitForTimeout(800);
    close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),0);
    results.push({name:'actual keyboard focus, arrow reach and Escape release',result:'PASS'});
    // Actual pointer capture continues outside the drop, then releases from its current pose.
    await page.getByRole('button',{name:'Reset impression'}).click();
    const c=await page.locator('canvas').boundingBox(),d=await drop.boundingBox();
    await page.mouse.move(d.x+d.width/2,d.y+d.height/2);await page.mouse.down();
    await page.mouse.move(c.x+c.width*1040/1200,c.y+c.height*165/752,{steps:15});await page.waitForTimeout(850);
    assert.ok(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull>.9));
    await page.mouse.move(c.x+c.width*730/1200,c.y+c.height*370/752,{steps:8});await page.waitForTimeout(100);
    await page.mouse.move(c.x+c.width*1010/1200,c.y+c.height*180/752,{steps:8});await page.waitForTimeout(150);
    // Recording and pose must be collected in one browser turn for exact times.
    const paired=await page.evaluate(async()=>{
      const Motor=await import('./motor-api.js'),source=await(await fetch('./scene.json')).json();
      const recording=window.inkborn.recording,pose=window.inkborn.pose;
      return {recording,pose,replayed:Motor.createInstance(source,null).replay(recording.records,recording.time)};
    });
    // Bit-exact complete-pose comparison in the same browser engine. Node and Chrome
    // can differ by one floating-point unit in their trigonometric implementations.
    assert.deepEqual(paired.replayed,paired.pose);
    await page.mouse.up();await page.waitForTimeout(800);close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),0);
    results.push({name:'actual far drag, reversal, interruption, captured release and exact replay of browser requests',result:'PASS'});
    const slider=page.getByRole('slider',{name:'Pull',exact:true});
    await slider.focus();await page.keyboard.press('End');await page.waitForTimeout(850);
    close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),1);
    await page.keyboard.press('Home');await page.waitForTimeout(850);
    close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),0);assert.equal(await slider.inputValue(),'0');
    results.push({name:'native Pull slider reaches full pull and exact rest with End and Home',result:'PASS'});
    // Scripted lifecycle events supplement the real pointer/keyboard checks.
    await drop.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(120);
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(800);
    close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),0);
    await page.getByLabel('Reduced motion',{exact:true}).check();await drop.focus();await page.keyboard.press('ArrowRight');
    const reduced=await page.evaluate(()=>window.inkborn.pose.inputs);close(reduced.effective.pull,reduced.requested.pull);
    await page.getByRole('button',{name:'Show unfurled pose',exact:true}).click();
    const still=drawing(await page.evaluate(()=>window.inkborn.pose));await page.waitForTimeout(300);
    assert.deepEqual(drawing(await page.evaluate(()=>window.inkborn.pose)),still);
    close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),1);
    await page.keyboard.press('r');close(await page.evaluate(()=>window.inkborn.pose.inputs.effective.pull),0);
    results.push({name:'scripted blur interruption, reduced-motion static preview and direct input settling, and keyboard reset',result:'PASS'});
    await page.getByLabel('Reduced motion',{exact:true}).uncheck();
    const captures=[];
    for(const [label,width,height] of [['desktop',1320,1060],['mobile',390,844]]){
      await page.setViewportSize({width,height});await page.evaluate(({r})=>{window.inkborn.stop();window.inkborn.seek(r,3.6);},{r});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const box=await drop.boundingBox(),canvas=await page.locator('canvas').boundingBox();
      close(box.x+box.width/2,canvas.x+canvas.width*1040/1200,.2);close(box.y+box.height/2,canvas.y+canvas.height*165/752,.2);
      const file=path.join(out,`${label}.png`);await page.screenshot({path:file,fullPage:true});captures.push(file);
    }
    results.push({name:'desktop and mobile sizing, no horizontal overflow and drop hit area aligned to the Motor marker',result:'PASS'});
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    results.push({name:'Rive startup without page errors or external requests',result:'PASS'});
    await fs.writeFile(path.join(out,'browser-recording.json'),JSON.stringify(paired,null,2));
  } catch(error) {
    await fs.writeFile(path.join(out,'browser-failure.json'),JSON.stringify({message:error.message,errors,external,state:page?await page.evaluate(()=>({hidden:document.hidden,frames:window.inkborn?.frameCount,time:window.inkborn?.recording.time,status:document.querySelector('#state')?.textContent})).catch(()=>null):null},null,2));
    if(page)await page.screenshot({path:path.join(out,'browser-failure.png'),fullPage:true}).catch(()=>{});throw error;
  } finally {await browser?.close().catch(()=>{});await new Promise(r=>server.close(r));}
  await fs.writeFile(path.join(out,'checks.json'),JSON.stringify({kind:'local author checks',results,limits:['sampled frames and browser interaction checks; no independent visual verdict','scripted blur is not an OS focus-change test','no screen-reader or touch-device qualification']},null,2)+'\n');
}
