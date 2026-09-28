// One event history and one explicit time for live play, guiding, capture and replay.
export const W=2400,H=1500,PLATE={x:232,y:300,w:324,h:104};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const guidedStroke=Array.from({length:65},(_,i)=>{const u=i/64;return [u,.5+.27*Math.sin(u*Math.PI*2-.8)+.08*Math.sin(u*Math.PI*5),.55+.25*Math.sin(u*Math.PI)]});
export function guide(){const e=[{t:0,type:'move',p:[.04,.3,.5]},{t:3,type:'down',p:guidedStroke[0]}];guidedStroke.slice(1).forEach((p,i)=>e.push({t:3+(i+1)*.14,type:'point',p}));e.push({t:12.1,type:'up'},{t:14,type:'print'},{t:23,type:'pause'},{t:25,type:'resume'});return e;}
export function checkLog(log){if(!Array.isArray(log))throw Error('A replay must contain an event array.');let t=-1;for(const e of log){if(!Number.isFinite(e.t)||e.t<t||e.t<0||!['down','point','move','up','print','pause','resume','reset'].includes(e.type))throw Error('Invalid or unordered garden event.');t=e.t;if(['down','point','move'].includes(e.type)&&(!Array.isArray(e.p)||e.p.length!==3||e.p.some(x=>!Number.isFinite(x)||x<0||x>1)))throw Error('Stroke coordinates and pressure must lie in 0…1.');}return log;}
export function stateAt(log,time){
 let s={stroke:[],drawing:false,created:null,started:null,paused:false,pauseAt:0,pausedFor:0,nib:[.1,.5,.5],revision:0,epoch:0,motor:[]};
 for(const e of log){if(e.t>time)break;
  if(e.type==='reset'){s={stroke:[],drawing:false,created:null,started:null,paused:false,pauseAt:0,pausedFor:0,nib:[.1,.5,.5],revision:s.revision+1,epoch:e.t,motor:[]};continue;}
  if(e.p){s.nib=[...e.p];if(!s.created)s.motor.push({time:e.t-s.epoch,input:'reachX',value:-260+e.p[0]*120},{time:e.t-s.epoch,input:'reachY',value:45+e.p[1]*70});}
  if(e.type==='down'&&!s.created){s.stroke=[[...e.p]];s.drawing=true;s.motor.push({time:e.t-s.epoch,input:'pull',value:.18});}
  if(e.type==='point'&&s.drawing&&s.stroke.length<512){const q=s.stroke.at(-1);if(Math.hypot(q[0]-e.p[0],q[1]-e.p[1])>.002)s.stroke.push([...e.p]);}
  if(e.type==='up'){s.drawing=false;if(!s.created)s.motor.push({time:e.t-s.epoch,input:'pull',value:0});}
  if(e.type==='print'&&!s.created&&s.stroke.length>=3){s.created=s.stroke.map(p=>[...p]);s.started=e.t;s.drawing=false;const t=e.t-s.epoch;s.motor.push({time:t,input:'pull',value:.83},{time:t,input:'reachX',value:-180},{time:t,input:'reachY',value:60},{time:t+3,input:'pull',value:.95},{time:t+9,input:'pull',value:.16},{time:t+9,input:'reachX',value:125});}
  if(e.type==='pause'&&s.created&&!s.paused){s.paused=true;s.pauseAt=e.t;}
  if(e.type==='resume'&&s.paused){s.pausedFor+=e.t-s.pauseAt;s.paused=false;}
 }
 s.age=s.started===null?0:Math.max(0,(s.paused?s.pauseAt:time)-s.started-s.pausedFor);
 s.rigTime=s.started===null?time-s.epoch:s.started-s.epoch+s.age;s.motor.sort((a,b)=>a.time-b.time);s.progress=clamp(s.age/30);s.stage=!s.created?(s.drawing?'drawing':'waiting'):s.age<3?'printing':s.age<12?'emergence':s.age<30?'growing':'garden';
 return s;
}
export const platePoint=p=>[PLATE.x+p[0]*PLATE.w,PLATE.y+p[1]*PLATE.h];
export const gardenPoint=p=>[170+p[0]*2040,440+p[1]*650];
export function along(points,t){if(!points?.length)return [0,0,.5];const n=clamp(t)*(points.length-1),i=Math.floor(n),a=points[i],b=points[Math.min(points.length-1,i+1)],f=n-i;return a.map((v,k)=>v+(b[k]-v)*f);}
