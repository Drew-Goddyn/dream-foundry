import * as Motor from './motor-api.js';
import {GardenPaint} from './paint.mjs';
import {Performance} from './rig.mjs';
import {stateAt,guide,checkLog,clamp} from './state.mjs';
const el=id=>document.getElementById(id),target=el('scene'),status=el('status');
const doc=Motor.parseDocument(await (await fetch('./scene.json')).json());
let rig=new Performance(Motor,doc),paint=new GardenPaint(target),log=[],clock=0,origin=0,running=false,guided=false,frame,pose,s;
const audio=new Audio('./score.wav');audio.preload='auto';let sound=false,audioWanted=false;
await paint.prepare();
function time(){return running?(performance.now()-origin)/1000:clock;}
function audioSync(){const want=sound&&running&&s.created&&!s.paused&&s.age<32.9;if(!want){audio.pause();audioWanted=false;return;}if(!audioWanted||Math.abs(audio.currentTime-s.age)>.35){audio.currentTime=Math.max(0,Math.min(32.9,s.age));audio.play().catch(()=>{sound=false;el('sound').setAttribute('aria-pressed','false');el('sound').textContent='Enable sound';});}audioWanted=true;}
const instructions={waiting:'Draw a line on the small sheet. Let its bends choose the garden.',drawing:'A line is waiting to become something. Lift to keep it.',printing:'The press remembers your hand.',emergence:'Something in the ink is listening.',growing:'Your line finds water, roots and light.',garden:'An unprinted place, made by your hand. It will stay.'};
function update(t){clock=t;s=stateAt(log,t);status.textContent=s.paused?'The garden is waiting. Continue when you are ready.':instructions[s.stage];el('print').disabled=!!s.created||s.stroke.length<3;el('pause').disabled=!s.created;el('pause').textContent=s.paused?'Continue':'Pause';el('save').disabled=!s.created;el('replay').disabled=log.length===0;}
function render(t){update(t);pose=rig.at(s);paint.draw(s,pose);audioSync();return {time:t,stage:s.stage,age:s.age,paused:s.paused,created:s.created,stroke:s.stroke,pose};}
function loop(){if(!running)return;render(time());if(guided&&clock>=50){running=false;audioSync();return;}frame=requestAnimationFrame(loop);}
function start(){if(running)return;origin=performance.now()-clock*1000;running=true;frame=requestAnimationFrame(loop);}
function stop(){if(running)clock=time();running=false;cancelAnimationFrame(frame);audio.pause();audioWanted=false;}
function record(type,p,t){if(log.some(e=>e.t>t)){log=log.filter(e=>e.t<=t);rig=new Performance(Motor,doc);}guided=false;log.push({t,type,...(p?{p}:{} )});clock=t;}
function dispatch(type,p){const t=Math.max(time(),clock);record(type,p,t);render(t);start();}
function startGuide(){stop();log=guide();rig=new Performance(Motor,doc);guided=true;clock=0;render(0);start();}
function pOf(e){const b=target.getBoundingClientRect(),ratio=target.width/target.height;let w=b.width,h=b.height,x=b.left,y=b.top;if(w/h>ratio){const nw=h*ratio;x+=(w-nw)/2;w=nw;}else{const nh=w/ratio;y+=(h-nh)/2;h=nh;}return [...paint.screenToPlate((e.clientX-x)*target.width/w,(e.clientY-y)*target.height/h,pose),e.pressure||.5];}
// Raw input only records samples. The animation frame evaluates and paints once,
// even when the browser delivers many coalesced samples in one pointer event.
let activePointer=null;
function pointerRecord(type,e){
 const t=running?Math.max(clock,Math.min(time(),(e.timeStamp-origin)/1000)):clock;
 record(type,type==='up'?undefined:pOf(e),t);
}
function pointerUpdate(){update(clock);start();}
target.addEventListener('pointerdown',e=>{
 if(s.created||activePointer!==null)return;
 target.focus();activePointer=e.pointerId;target.setPointerCapture(e.pointerId);
 pointerRecord('down',e);pointerUpdate();
});
target.addEventListener('pointermove',e=>{
 if(s.created||e.pointerId!==activePointer)return;
 const samples=e.getCoalescedEvents?.();
 for(const sample of samples?.length?samples:[e])pointerRecord('point',sample);
 pointerUpdate();
});
const release=e=>{
 if(e.pointerId!==activePointer)return;
 // An up event can carry a last position with no preceding move. Cancellation
 // keeps the last known mark; it must not invent a new endpoint.
 if(e.type==='pointerup')pointerRecord('point',e);
 pointerRecord('up',e);activePointer=null;pointerUpdate();
 if(target.hasPointerCapture(e.pointerId))target.releasePointerCapture(e.pointerId);
};
target.addEventListener('pointerup',release);target.addEventListener('pointercancel',release);
target.addEventListener('lostpointercapture',e=>{
 if(e.pointerId!==activePointer)return;
 pointerRecord('up',e);activePointer=null;pointerUpdate();
});
target.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(moves[e.key]&&!s.created){e.preventDefault();const d=e.shiftKey ? .08 : .025,p=[clamp(s.nib[0]+moves[e.key][0]*d),clamp(s.nib[1]+moves[e.key][1]*d),.65];dispatch(s.drawing?'point':'move',p);}else if(e.key===' '&&!s.created){e.preventDefault();dispatch(s.drawing?'up':'down',s.drawing?undefined:s.nib);}else if(e.key==='Enter'){e.preventDefault();dispatch('print');}else if(e.key==='Escape'){e.preventDefault();if(s.drawing)dispatch('up');else if(s.created)dispatch(s.paused?'resume':'pause');}else if(e.key.toLowerCase()==='r'){e.preventDefault();dispatch('reset');}});
el('print').onclick=()=>dispatch('print');el('guide').onclick=startGuide;el('pause').onclick=()=>dispatch(s.paused?'resume':'pause');el('reset').onclick=()=>dispatch('reset');
el('sound').onclick=()=>{sound=!sound;el('sound').setAttribute('aria-pressed',String(sound));el('sound').textContent=sound?'Mute sound':'Enable sound';// Unlock only in the viewer's explicit activation, with no audible pre-roll.
 if(sound){audio.muted=true;audio.play().then(()=>{audio.pause();audio.muted=false;audioWanted=false;audioSync();}).catch(()=>{audio.muted=false;});}else audioSync();};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
el('save').onclick=()=>target.toBlob(b=>download(b,'my-unprinted-garden.png'));
el('replay').onclick=()=>download(new Blob([JSON.stringify({format:1,piece:'unprinted-garden',time:clock,events:log.filter(e=>e.t<=clock)},null,2)],{type:'application/json'}),'my-garden-replay.json');
function load(events,t=0){checkLog(events);if(!Number.isFinite(t)||t<0)throw Error('Replay time must be a finite, nonnegative number.');const next=structuredClone(events);stop();log=next;rig=new Performance(Motor,doc);guided=false;clock=t;return render(t);}
el('load').onchange=async e=>{try{const f=JSON.parse(await e.target.files[0].text());load(f.events,f.time??0);}catch(err){status.textContent='Could not open this replay: '+err.message;}e.target.value='';};
window.garden={ready:true,load,seek(t){if(!Number.isFinite(t)||t<0)throw Error('Replay time must be a finite, nonnegative number.');stop();return render(t);},guide:startGuide,dispatch,state:()=>structuredClone(s),history:()=>structuredClone(log),pose:()=>structuredClone(pose),savePlate:()=>target.toDataURL(),sound:()=>({enabled:sound,paused:audio.paused,time:audio.currentTime}),stats:()=>({paintCount:paint.paintCount}),async resolution(w,h){stop();target.width=w;target.height=h;paint=new GardenPaint(target);await paint.prepare();return render(clock);}};
for(const id of ['guide','sound','reset'])el(id).disabled=false;
render(0);start();
