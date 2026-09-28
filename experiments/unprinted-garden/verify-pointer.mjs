import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {checkLog} from './state.mjs';

// A real fixed-cadence cursor gesture, separate from guide/reducer playback.
export async function verifyPointer({page,out}){
 const p=await page.context().newPage();
 try{
  await p.addInitScript(()=>{
   const probe=window.pointerCheck={active:false,handlers:[],frames:[],pointerId:null};
   const add=EventTarget.prototype.addEventListener;
   EventTarget.prototype.addEventListener=function(type,fn,options){
    if(this instanceof HTMLCanvasElement&&this.id==='scene'&&type.startsWith('pointer')&&typeof fn==='function'){
     return add.call(this,type,function(e){
      if(type==='pointerdown')probe.pointerId=e.pointerId;
      if(!probe.active)return fn.call(this,e);
      const start=performance.now(),paints=window.garden.stats().paintCount;
      try{return fn.call(this,e);}finally{probe.handlers.push({type,ms:performance.now()-start,paints:window.garden.stats().paintCount-paints});}
     },options);
    }
    return add.call(this,type,fn,options);
   };
   const tick=()=>{if(probe.active){const now=performance.now();probe.frames.push(now-probe.last);probe.last=now;}requestAnimationFrame(tick);};requestAnimationFrame(tick);
  });
  await p.goto(page.url());await p.waitForFunction(()=>window.garden?.ready,{},{timeout:180000});
  const cdp=await p.context().newCDPSession(p);
  const points=Array.from({length:97},(_,i)=>[.05+.9*i/96,.5+.3*Math.sin(i/96*Math.PI*4),.5]);
  const xy=await p.evaluate(ps=>{
   const c=document.getElementById('scene'),b=c.getBoundingClientRect(),cam=window.garden.pose().nodes.find(n=>n.id==='garden-camera').local;
   const ratio=c.width/c.height;let w=b.width,h=b.height,x=b.left,y=b.top;
   if(w/h>ratio){const nw=h*ratio;x+=(w-nw)/2;w=nw;}else{const nh=w/ratio;y+=(h-nh)/2;h=nh;}
   const z=cam.scaleX*c.width/1600;
   return ps.map(([u,v])=>({x:x+(c.width/2+(500+(232+u*324)*1.15-cam.x)*z)*w/c.width,y:y+(c.height/2+(460+(300+v*104)*1.15-cam.y)*z)*h/c.height}));
  },points);
  const mouse=(type,q)=>cdp.send('Input.dispatchMouseEvent',{type,...q,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1,pointerType:'mouse'});
  await p.evaluate(()=>{const q=window.pointerCheck;q.active=true;q.last=performance.now();});
  await mouse('mousePressed',xy[0]);
  const start=performance.now(),pending=[];
  for(let i=1;i<xy.length;i++){
   const delay=start+(i-1)*1000/60-performance.now();if(delay>0)await new Promise(r=>setTimeout(r,delay));
   pending.push(mouse('mouseMoved',xy[i]));
  }
  await Promise.all(pending);const drainMs=performance.now()-start;
  await mouse('mouseReleased',xy.at(-1));await p.waitForTimeout(150);
  const real=await p.evaluate(()=>{const q=window.pointerCheck;q.active=false;return {handlers:q.handlers,frames:q.frames,state:window.garden.state(),history:window.garden.history()};});
  checkLog(real.history);const error=Math.max(...points.map((q,i)=>Math.hypot(q[0]-(real.state.stroke[i]?.[0]??-1),q[1]-(real.state.stroke[i]?.[1]??-1))));
  await p.screenshot({path:path.join(out,'pointer-stroke.png')});
  // A forced coalesced burst catches per-sample paints even on browsers that
  // happen to deliver the trusted gesture as individual events on this run.
  await p.locator('#reset').click();await mouse('mousePressed',xy[0]);
  const burst=await p.evaluate(qs=>{
   const c=document.getElementById('scene'),id=window.pointerCheck.pointerId;
   const samples=qs.map(q=>new PointerEvent('pointermove',{clientX:q.x,clientY:q.y,pointerId:id,pressure:.5}));
   const e=new PointerEvent('pointermove',{pointerId:id});Object.defineProperty(e,'getCoalescedEvents',{value:()=>samples});
   const paints=window.garden.stats().paintCount,start=performance.now();c.dispatchEvent(e);
   return {ms:performance.now()-start,paints:window.garden.stats().paintCount-paints,stroke:window.garden.state().stroke};
  },xy.slice(1,33));
  // Flush an endpoint that was never sent as a move, then preserve it on reopen.
  await mouse('mouseReleased',xy[33]);
  const released=await p.evaluate(()=>({state:window.garden.state(),events:window.garden.history()}));
  checkLog(released.events);
  const report={kind:'trusted 96-move pointer gesture at 60 Hz plus synthetic 32-sample burst',drainMs,maxHandlerMs:Math.max(...real.handlers.map(h=>h.ms)),handlerPaints:real.handlers.reduce((n,h)=>n+h.paints,0),maxFrameGapMs:Math.max(...real.frames),points:real.state.stroke.length,maxPointError:error,burst,history:real.history};
  await fs.writeFile(path.join(out,'pointer-check.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(real.state.stroke.length,97);assert.ok(error<=.001,'Pointer stroke lost a sample');assert.equal(real.state.drawing,false);
  assert.equal(report.handlerPaints,0,'Pointer handlers must not paint');assert.ok(report.maxHandlerMs<=16.7,'Pointer handler blocks input');
  assert.ok(drainMs<=2100,'1.6-second stroke took too long to drain');assert.ok(report.maxFrameGapMs<=150,'Drawing frame blocked on queued work');
  assert.equal(burst.paints,0);assert.ok(burst.ms<=16.7,'Coalesced batch blocks input');assert.equal(burst.stroke.length,33);
  assert.equal(released.state.drawing,false);assert.equal(released.state.stroke.length,34);
  assert.ok(Math.hypot(...released.state.stroke.at(-1).slice(0,2).map((v,i)=>v-points[33][i]))<=.001,'Release endpoint lost');
  await p.evaluate(events=>window.garden.load(events,events.at(-1).t),released.events);
  assert.deepEqual((await p.evaluate(()=>window.garden.state())).stroke,released.state.stroke,'Saved pointer stroke changes on reopen');
 }finally{await p.close();}
}
