import {buildArt} from '../inkborn/art.mjs';
import {gardenPoint,along,clamp} from './state.mjs';
const tune={connected:true,expressive:true,noticeBloom:true,stagedBloom:true,spread:1,headLift:1.15,pigment:.6};
export function buildRig(){
 const d=buildArt(tune);d.scene.id='unprinted-garden-rig';const rx=d.inputs.find(i=>i.id==='reachX');rx.min=-280;rx.default=-180;d.inputs.find(i=>i.id==='reachY').default=65;d.bindings.find(b=>b.node==='head'&&b.input==='reachX').scale=.15;
 d.inputs.push({id:'creation',min:0,max:1,default:0},{id:'attention',min:0,max:1,default:0});
 d.nodes.push({id:'garden-camera',kind:'group',x:1020,y:880,scaleX:2.15,scaleY:2.15},{id:'garden-platen',kind:'group',x:220,y:310},{id:'living-mark',kind:'group',x:400,y:400},{id:'left-wing',kind:'group',rotation:-8},{id:'right-wing',kind:'group',rotation:12});
 const held=(node,property,keys)=>d.poseTracks.push({input:'creation',node,property,keys:keys.map(([at,value])=>({at,value,easing:'smooth'}))});
 held('garden-camera','x',[[0,1170],[.25,1130],[.55,1200],[1,1200]]);held('garden-camera','y',[[0,920],[.25,895],[.6,780],[1,750]]);
 held('garden-camera','scaleX',[[0,1.55],[.24,1.55],[.52,.9],[.9,2/3],[1,2/3]]);held('garden-camera','scaleY',[[0,1.55],[.24,1.55],[.52,.9],[.9,2/3],[1,2/3]]);
 held('garden-platen','y',[[0,225],[.06,300],[.095,300],[.16,210],[1,210]]);
 held('garden-platen','scaleY',[[0,.16],[.06,1],[.095,1],[.16,.16],[1,.16]]);
 held('living-mark','y',[[0,0],[.12,0],[.15,-7],[.22,-45],[.3,-75],[.5,-60],[1,-74]]);
 held('left-wing','rotation',[[0,-8],[.11,-8],[.2,-63],[.32,-21],[.46,-45],[.62,-28],[.8,-38],[1,-30]]);
 held('right-wing','rotation',[[0,12],[.13,12],[.24,61],[.36,24],[.5,48],[.66,20],[.83,35],[1,28]]);
 // The Garden paints its own press and botany. Keep only the inherited creature
 // contours and their six Motor bones, plus this scene's performance controls.
 const first=d.nodes.findIndex(n=>n.id==='creature-silhouette'),last=d.nodes.findIndex(n=>n.id==='base-bolt-281');
 const used=new Set([...d.nodes.slice(first,last+1).map(n=>n.id),'body','head','brace','reach','elbow','wheel','garden-camera','garden-platen','living-mark','left-wing','right-wing']);
 d.nodes=d.nodes.filter(n=>used.has(n.id));
 d.bindings=d.bindings.filter(b=>used.has(b.node));
 d.poseTracks=d.poseTracks.filter(t=>used.has(t.node));
 return d;
}
// Evaluate detached public snapshots. Motor alone skins body curves and poses the rig.
export class Performance{
 constructor(Motor,doc){this.instance=Motor.createInstance(Motor.compileDocument(doc),null);this.last=-1;this.lastRevision=-1;this.applied=0;}
 at(s){
  const time=s.rigTime;
  if(time<this.last||s.revision!==this.lastRevision){this.instance.reset();this.applied=0;}
  while(this.applied<s.motor.length&&s.motor[this.applied].time<=time){
   const at=s.motor[this.applied].time;this.instance.evaluate(at);
   // Requests at one instant share the same evaluated pose. Preserve their order
   // and every timestamp; no recorded input is dropped to save work.
   do{const r=s.motor[this.applied++];this.instance.setInput(r.input,r.value);}while(this.applied<s.motor.length&&s.motor[this.applied].time===at);
  }
  this.instance.evaluate(time);this.instance.setInput('creation',s.progress);
  const pose=this.instance.evaluate(time);this.last=time;this.lastRevision=s.revision;return pose;
 }
}
