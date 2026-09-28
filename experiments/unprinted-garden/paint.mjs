import {Gfx,rng,oval,sample,tube,turn} from '@anidoodle/core';
import {bake,usePaper} from '@anidoodle/bake';
import {iris,umbel,dock,fern as fernPlate,willow,rock,mothPart} from './botany.mjs';
import {W,H,PLATE,platePoint,gardenPoint,along,clamp} from './state.mjs';
const C={paper:'#f4efe1',ink:'#283b40',blue:'#315461',shadow:'#172e35',brass:'#b19868',light:'#e7d29c',red:'#be493b',green:'#708e70',teal:'#5d9591',fog:'#b9c9c1'};
const PEN={nib:1,taper:1,pressure:1,retrace:true,wobble:.7,rough:.8};
const FORGE={x:500,y:460,s:1.15};
export function canvas(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return {canvas:c,ctx:c.getContext('2d',{willReadFrequently:true})};}
function env(W,H,scale=1){return {W,H,scale,canvas,cache:new Map()};}
function stroke(g,p,w=1,color=C.ink,seed=1,progress=1){g.pen(p,{w,color,seed,boil:0,wobble:.45,opacity:.85,retrace:false,progress});}
function wash(g,p,color,seed=1,alpha=.55){g.wash(p,color,{seed,alpha,dx:1.6,dy:2,shrink:.99,rim:true});}
function lineBox(x,y,w,h){return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];}
function blob(cx,cy,rx,ry,seed=1){const r=rng(seed);return Array.from({length:15},(_,i)=>{const a=i/15*Math.PI*2,k=.84+r()*.2;return [cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]});}
function shape(g,p,fill,seed=1){g.group('plain',()=>{g.fill(p,fill);for(let i=0;i<p.length;i++)stroke(g,[p[i],p[(i+1)%p.length]],1,C.ink,seed+i);});}
function plate(ctx,sp,x=0,y=0,scale=1,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.drawImage(sp.c,sp.x/sp.k,sp.y/sp.k,sp.w/sp.k,sp.h/sp.k);ctx.restore();}
function asset(e,key,draw){const s=bake(e,key,draw,{medium:PEN});return {...s,k:e.scale};}
function coursePoints(drawn){const out=[drawn[0]];for(let i=1;i<drawn.length;i++){const a=drawn[i-1],b=drawn[i],n=Math.max(1,Math.ceil(Math.hypot((b[0]-a[0])*2040,(b[1]-a[1])*650)/32));for(let k=1;k<=n;k++)out.push(a.map((v,j)=>v+(b[j]-v)*k/n));}return out;}
function bankPoint(drawn,at,side,d){const p=gardenPoint(along(drawn,at)),a=gardenPoint(along(drawn,Math.max(0,at-.006))),b=gardenPoint(along(drawn,Math.min(1,at+.006))),dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;return [p[0]-dy/n*side*d,p[1]+dx/n*side*d];}
// The bridge is deliberately limited to the old creature's authored M/L/Q/C contours.
// Motor has already evaluated every control point; this only samples them for Gfx's paint surface.
function contour(n){const commands=n.commands??n.drawing.commands,pts=[];let x=0,y=0;for(const c of commands){const old=[x,y];if(c[0]==='M'||c[0]==='L'){x=c[1];y=c[2];pts.push([x,y]);}else if(c[0]==='C'){for(let j=1;j<=6;j++){const t=j/6,u=1-t;pts.push([u*u*u*x+3*u*u*t*c[1]+3*u*t*t*c[3]+t*t*t*c[5],u*u*u*y+3*u*u*t*c[2]+3*u*t*t*c[4]+t*t*t*c[6]]);}x=c[5];y=c[6];}else if(c[0]==='Q'){for(let j=1;j<=6;j++){const t=j/6,u=1-t;pts.push([u*u*x+2*u*t*c[1]+t*t*c[3],u*u*y+2*u*t*c[2]+t*t*c[4]]);}x=c[3];y=c[4];}}
 const [a,b,c,d,e,f]=n.world;return pts.map(([x,y])=>[a*x+c*y+e,b*x+d*y+f]);}
function forge(g){
 const edge=(p,w=1.2,c=C.ink)=>{for(let i=0;i<p.length;i++)stroke(g,[p[i],p[(i+1)%p.length]],w,c,17+i);};
 const panel=(p,fill,shade)=>{g.group('plain',()=>g.fill(p,fill));g.group('ink',()=>edge(p,1.1));};
 g.group('paint',()=>wash(g,blob(390,626,220,21,77),'#627f70',56,.25));
 panel([[211,550],[519,550],[547,586],[510,609],[201,609],[192,590]],'#556d6b');
 panel([[212,550],[518,550],[528,565],[205,565]],'#b8b18a');
 for(const [x,s]of [[240,-1],[492,1]]){panel([[x-8,598],[x+15,598],[x+32+s*9,635],[x-32+s*9,635],[x-27+s*9,622]],'#354f50');}
 for(const x of [267,501]){panel([[x,550],[x-8,183],[x+17,183],[x+27,550]],'#c5b182');panel([[x+13,186],[x+17,186],[x+27,550],[x+15,550]],'#7b795c');g.group('ink',()=>{for(let j=0;j<63;j++){const y=207+j*5.1;stroke(g,[[x+12,y],[x+22,y-4]],.65,'#495657',x+j);}for(let j=0;j<4;j++)stroke(g,[[x-3+j*3,222],[x-2+j*3,318]],.4,'#6c715a',j);});}
 panel([[248,179],[280,162],[501,162],[535,181],[535,211],[248,211]],'#3c5659');
 panel([[250,181],[535,181],[535,188],[250,188]],'#b1ae88');
 g.group('ink',()=>{for(let j=0;j<95;j++){const x=251+j*2.94,shade=Math.max(Math.exp(-Math.pow((x-513)/18,2)),Math.exp(-Math.pow((x-276)/13,2))*.6,.15+(x-251)/1300);if(shade<.23&&j%3)continue;stroke(g,[[x,209],[x+2,206],[x+4,209-shade*20]],.35,'#c2b789',100+j);if(shade>.5)stroke(g,[[x-1,205],[x+5,208]],.35,'#87957e',2100+j);}for(const x of [279,510]){stroke(g,[...oval(x,184,4,4,16),oval(x,184,4,4,16)[0]],.9,'#263c40');stroke(g,[[x-2,183],[x+2,185]],.7);}});
 // The screw carries the platen. Engraving describes its helical thread, not a noise overlay.
 panel([[222,290],[558,290],[574,410],[214,410]],'#c8b990');
 panel([[214,411],[574,411],[580,425],[209,425]],'#3c5557');
 panel([[428,481],[560,481],[570,496],[428,496]],'#bbad7c');
 g.group('plain',()=>g.fill([[232,300],[553,300],[563,403],[222,403]],'#fffbef'));
 g.group('paint',()=>wash(g,[[225,400],[565,400],[553,410],[220,410]],'#a9916b',67,.24));
 g.group('ink',()=>{edge([[232,300],[553,300],[563,403],[222,403]],.55,'#6c7567');for(let i=0;i<5;i++)stroke(g,[[220,405+i],[565,405+i]],.45,'#697465',201+i);for(let j=0;j<49;j++)stroke(g,[[216+j*7,417],[211+j*7,423]],.5,'#c5b78b',300+j);});
 g.group('plain',()=>{
  for(const x of [269,503]){g.fill([[x-16,214],[x+27,214],[x+31,231],[x-18,231]],'#3b5355');g.fill([[x-15,214],[x+25,214],[x+27,219],[x-17,219]],'#c7b78c');for(let j=0;j<8;j++)stroke(g,[[x-13+j*5,221],[x-16+j*5,228]],.55,'#172f36',j+611);g.fill([[x-15,530],[x+32,530],[x+37,550],[x-18,550]],'#3a5457');stroke(g,[[x-15,530],[x+30,530],[x+33,536]],1.4,'#d5c698',623);for(const y of [223,541]){g.fill(oval(x+7,y,4,4,12),'#b6aa78');stroke(g,[[x+5,y-1],[x+9,y+1]],.8,'#2a4548');}}
  // Nut, mouth and shoulder of the screw socket. The lower ellipse is in shadow.
  g.fill(oval(394,212,32,11,40),'#223d44');g.fill([[365,198],[423,198],[423,212],[365,212]],'#82907a');g.fill(oval(394,198,29,8,40),'#d1c394');g.fill(oval(394,198,13,4,30),'#2a4247');stroke(g,[[366,202],[366,211],[392,220],[423,212]],1.2,'#233f45',19);for(let j=0;j<12;j++)stroke(g,[[400+j*1.7,201],[400+j*1.7,213-j*.4]],.55,'#425c55',43+j);
  for(let j=0;j<36;j++){const a=.1+j/36*2.8;stroke(g,[[394+Math.cos(a)*23,204+Math.sin(a)*5],[394+Math.cos(a)*29,209+Math.sin(a)*8]],.35,'#29463e',711+j);}
  // Curved shadow cuts make the plinth's recessed central panel turn away from the light.
  for(let j=0;j<26;j++){const x=242+j*10;stroke(g,[[x,583],[x+2,588],[x+8,592]],.8,'#223b43',841+j);}for(let j=0;j<11;j++){stroke(g,[[205+j*2,575+j*.3],[215+j*2,598]],.7,'#213b42',932+j);stroke(g,[[509+j*2,565],[504+j*2,589]],.65,'#253e45',972+j);}
 });
 // Maker's medallion, recessed braces, and form-following cuts.
 g.group('ink',()=>{stroke(g,[[226,564],[242,590],[488,590],[520,566]],2,'#273f45');for(let j=0;j<35;j++)stroke(g,[[244+j*7,575],[238+j*7,584]],.7,'#97a58e',j+600);stroke(g,[[252,603],[478,603]],.8,'#b0b18c');for(const x of [226,509])for(const y of [570,594]){stroke(g,[...oval(x,y,5,5,16),oval(x,y,5,5,16)[0]],1);stroke(g,[[x-2,y-2],[x+2,y+2]],.7);}stroke(g,[...oval(376,579,14,9,20),oval(376,579,14,9,20)[0]],.65,'#ddc997');stroke(g,[[365,583],[368,575],[376,582],[384,573]],1,'#dfc998',444);});
}
function wheelPlate(g,part){
 const cx=436,cy=468,p=(r,a)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r],ring=(r,w,c)=>stroke(g,[...oval(cx,cy,r,r,90),oval(cx,cy,r,r,90)[0]],w,c,181);
 g.group('plain',()=>{
  if(part==='spokes'){
   for(let j=0;j<6;j++){const a=j*Math.PI/3,co=Math.cos(a),si=Math.sin(a),q=(r,off)=>[cx+co*r-si*off,cy+si*r+co*off];g.fill([q(18,-4),q(58,-5),q(58,4),q(18,4)],'#47615d');stroke(g,[q(20,-2),q(55,-3)],1.1,'#d8c795',j+65);stroke(g,[q(20,4),q(55,4)],.9,'#233d42',j+76);}
   g.fill(oval(cx,cy,7.5,7.5,6,Math.PI/6),'#667661');stroke(g,[[cx-5,cy-3],[cx+4,cy+2]],1.3,'#203d42',80);return;
  }
  // Rotationally symmetric metal retains scene lighting while the spokes turn inside it.
  const annulus=(x,y,r,ix,iy,ir,color)=>g.fill([...oval(x,y,r,r,90),...oval(ix,iy,ir,ir,90).toReversed()],color);
  annulus(cx+3,cy+4,73,cx+3,cy+4,56,'#263f45');
  annulus(cx,cy,71,cx,cy,55,'#cbbb88');
  annulus(cx,cy,63,cx-1,cy-2,56,'#7a8062');
  ring(71,1.5,'#263f45');ring(66,.65,'#ecdda9');ring(55,1.1,'#374e4f');
  for(let j=0;j<210;j++){const a=j/210*Math.PI*2,shade=clamp((Math.cos(a)+Math.sin(a)+.35)/1.8);if(shade<.17&&j%4)continue;stroke(g,[p(66-shade*2,a),p(71,a)],.35+shade*.15,'#405347',j+900);if(shade>.38){const aa=a-.028;stroke(g,[p(57,aa),p(60,a),p(63,a+.027)],.4,'#304943',j+1200);}if(shade>.7)stroke(g,[p(64,a-.02),p(68,a+.026),p(70,a+.04)],.35,'#344f46',j+1500);}
  g.fill(oval(cx+2,cy+2,20,19,48),'#2c4649');g.fill(oval(cx-2,cy-3,18,17,48),'#c4b580');ring(17,.9,'#34484a');stroke(g,[[428,456],[434,452],[442,455]],1.2,'#f1e1ad',79);
  for(let j=0;j<32;j++){const a=-.2+j*.068;stroke(g,[p(12,a),p(16.5,a+.028)],.38,'#3f574a',110+j);}
 });
}
export class GardenPaint{
 constructor(target){this.target=target;this.ctx=target.getContext('2d',{willReadFrequently:true});const q=target.width/1600;this.worldEnv=env(W,H,q);this.forgeEnv=env(1200,752,2*q);this.actorEnv=env(1200,752,2*q);this.floraEnv=env(320,380,2*q);this.treeEnv=env(800,900,1.2*q);this.mothEnv=env(480,360,2*q);this.courseKey='';this.assets={};this.lastActor='';this.paintCount=0;}
 async prepare(){
  usePaper(this.forgeEnv,[['paper',.04]]);this.assets.forge=asset(this.forgeEnv,'press',forge);
  this.assets.screw=asset(this.forgeEnv,'screw',g=>{g.group('plain',()=>{g.fill([[382,202],[405,202],[405,320],[382,320]],'#b7a477');for(let i=0;i<34;i++)stroke(g,[[381,205+i*3.4],[406,200+i*3.4]],1.1,'#334c4e',i+110);stroke(g,[[389,205],[389,319]],1.2,'#e7d4a3');});});
  this.assets.platen=asset(this.forgeEnv,'platen',g=>{const top=[[232,300],[553,300],[563,393],[222,393]],lip=[[222,393],[563,393],[563,403],[222,403]];g.group('plain',()=>{g.fill(top,'#788775');g.fill(lip,'#c9ba87');stroke(g,[[232,300],[553,300]],1.1,'#243f43');stroke(g,[[553,300],[563,393]],1.1,'#243f43');stroke(g,[[233,301],[225,389]],1.2,'#e2d4ab');stroke(g,[[225,389],[561,389]],1.2,'#e2d4ab');for(let j=0;j<110;j++){const x=225+j*3.04,t=j/110;stroke(g,[[x,394],[x-2,401]],.36,'#405447',j+400);if(j>25)stroke(g,[[x,388],[x+Math.min(17,t*23),375-t*9]],.35,'#344d45',j+600);if(j>75)stroke(g,[[x,378],[x-10,366]],.35,'#3e5649',j+800);}stroke(g,[[223,402],[562,402]],2.1,'#1d3940',710);});});
  this.assets.wheel=asset(this.forgeEnv,'wheel',g=>wheelPlate(g,'rim'));this.assets.spokes=asset(this.forgeEnv,'wheel-spokes',g=>wheelPlate(g,'spokes'));
  for(const [name,draw] of Object.entries({iris,umbel,dock,fern:fernPlate})){for(let i=0;i<2;i++)this.assets[name+i]=asset(this.floraEnv,name+i,g=>draw(g,i));await new Promise(r=>setTimeout(r,0));}for(let i=0;i<2;i++)this.assets['willow'+i]=asset(this.treeEnv,'willow'+i,g=>willow(g,i));this.assets.rock=asset(this.floraEnv,'rock',g=>rock(g,0));
  this.assets.paper=asset(this.worldEnv,'paper',g=>{g.main.fillStyle=C.paper;g.main.fillRect(0,0,W,H);g.paper('coldpress',.045);g.paper('paper',.035);});
  this.assets.foreground=asset(this.worldEnv,'foreground-ground',g=>{g.group('paint',()=>{wash(g,blob(200,1390,540,155,71),'#738c65',933,.21);wash(g,blob(2240,1340,490,195,72),'#699177',936,.22);});});
  this.assets.distance=asset(this.worldEnv,'distance',g=>{g.group('paint',()=>{wash(g,[[30,570],[242,510],[442,535],[661,414],[917,436],[1166,362],[1393,426],[1714,374],[1923,448],[2365,386],[2410,1010],[0,1040]],'#adbeb9',220,.3);wash(g,[[0,770],[309,695],[571,717],[861,552],[1134,609],[1468,518],[1774,641],[2143,542],[2400,618],[2400,1250],[0,1250]],'#90ad9d',333,.22);});});
 }
 camera(pose){return pose.nodes.find(n=>n.id==='garden-camera').local;}
 screenToPlate(x,y,pose){const c=this.camera(pose),k=c.scaleX*this.target.width/1600;const wx=(x-this.target.width/2)/k+c.x,wy=(y-this.target.height/2)/k+c.y;return [(wx-FORGE.x)/FORGE.s-PLATE.x,(wy-FORGE.y)/FORGE.s-PLATE.y].map((v,i)=>clamp(v/(i?PLATE.h:PLATE.w)));}
 draw(s,pose){
  const c=this.ctx,w=this.target.width,h=this.target.height,cam=this.camera(pose),z=cam.scaleX*w/1600; c.setTransform(1,0,0,1,0,0);c.fillStyle=C.paper;c.fillRect(0,0,w,h);c.setTransform(z,0,0,z,w/2-cam.x*z,h/2-cam.y*z);
  plate(c,this.assets.paper);
  if(s.created){this.world(c,s,pose);this.transfer(c,s);}
  c.save();c.translate(FORGE.x,FORGE.y);c.scale(FORGE.s,FORGE.s);plate(c,this.assets.forge);
  this.printedLine(c,s);
  const pl=pose.nodes.find(n=>n.id==='garden-platen');c.save();c.beginPath();c.rect(378,203,34,Math.max(0,pl.local.y-203));c.clip();plate(c,this.assets.screw);c.restore();c.save();c.translate(0,pl.local.y);c.scale(1,pl.local.scaleY);c.translate(0,-300);plate(c,this.assets.platen);c.restore();
  plate(c,this.assets.wheel);const wheel=pose.nodes.find(n=>n.id==='wheel');c.save();c.translate(436,468);c.rotate(wheel.local.rotation*Math.PI/180);c.translate(-436,-468);plate(c,this.assets.spokes);c.restore();
  this.actor(c,pose);c.restore();
  if(s.created)this.organism(c,s,pose);this.foreground(c,s);
  if(!s.created){const p=platePoint(s.nib);c.save();c.translate(FORGE.x+p[0]*FORGE.s,FORGE.y+p[1]*FORGE.s);c.rotate(-.55);c.fillStyle=C.red;c.beginPath();c.moveTo(0,0);c.lineTo(-4,-22);c.quadraticCurveTo(0,-34,6,-23);c.closePath();c.fill();c.strokeStyle=C.ink;c.lineWidth=.8;c.stroke();c.restore();}
  this.paintCount++;
 }
 printedLine(c,s){if(s.stroke.length<2)return;
  c.save();const ps=s.stroke.map(platePoint);c.strokeStyle=s.created&&s.age>=2.1?C.ink:C.red;c.lineWidth=2.4;c.lineCap='round';c.beginPath();ps.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.restore();}
 actor(c,pose){
  const key=JSON.stringify([pose.inputs.effective.pull,pose.inputs.effective.reachX,pose.inputs.effective.reachY]);if(this.lastActor!==key){
   const e=this.actorEnv;for(const k of e.cache.keys())if(k.startsWith('sprite:actor@'))e.cache.delete(k);
   this.assets.actor=asset(e,'actor',g=>{const silhouette=pose.nodes.find(n=>n.id==='creature-silhouette'),body=contour(silhouette);
    g.group('plain',()=>g.fill(body,'#dce3d4'));
    g.group('paint',()=>{g.wash(body,'#386673',{seed:174,alpha:.7,dx:2,dy:3,shrink:.985,rim:true});const ys=body.map(p=>p[1]),y0=Math.min(...ys),y1=Math.max(...ys),c=g.cur;c.save();g.path(c,body);c.clip();const pool=c.createLinearGradient(0,y0,0,y1);pool.addColorStop(0,'#294a4a00');pool.addColorStop(.6,'#294a4a13');pool.addColorStop(1,'#1c414c8a');c.fillStyle=pool;c.fillRect(300,y0,600,y1-y0+5);c.restore();});
    g.group('plain',()=>{stroke(g,body.slice(0,24),2.3,C.ink,80);stroke(g,body.slice(29,44),1.6,C.ink,81);stroke(g,body.slice(47,63),1.5,C.ink,82);stroke(g,body.slice(77),2.2,C.ink,83);});
    g.group('paint',()=>{for(const [id,color,opacity]of [['pool-at-haunch','#213f49',.32],['washed-spine','#8ca08a',.34],['cheek-wash','#98b0a3',.27]]){const n=pose.nodes.find(n=>n.id===id);wash(g,contour(n),color,83,opacity);}});
    const first=pose.nodes.findIndex(n=>n.id==='creature-silhouette'),last=pose.nodes.findIndex(n=>n.id==='base-bolt-281');
    g.group('paint',()=>{for(const n of pose.nodes.slice(first+1,last)){if(['bracing-arm','reaching-arm'].includes(n.id)){g.fill(contour(n),'#567e7c');wash(g,contour(n),'#3c6870',61,.85);}}});
    g.group('plain',()=>{for(const id of ['bracing-arm','reaching-arm']){const n=pose.nodes.find(n=>n.id===id),p=contour(n);stroke(g,p.slice(0,Math.ceil(p.length*.52)),1.1,C.ink,119);stroke(g,p.slice(Math.ceil(p.length*.6)),1.5,C.ink,121);}for(const n of pose.nodes.slice(first+1,last)){if(!n.drawing||n.worldOpacity<.01)continue;const d=n.drawing;if(['group','bone'].includes(d.kind)||['bracing-arm','reaching-arm','pool-at-haunch','washed-spine','pulled-paper','shoulder-paper','cheek-wash'].includes(n.id))continue;if(d.kind==='path'){const pts=contour(n);if(pts.length<2)continue;if(d.fill)g.fill(pts,d.fill,n.worldOpacity);else stroke(g,pts,d.strokeWidth??1,d.stroke??C.ink,18);}else if(d.kind==='ellipse'){const [a,b,cc,dd,x,y]=n.world;const pts=oval(0,0,d.rx,d.ry,20).map(([u,v])=>[a*u+cc*v+x,b*u+dd*v+y]);g.fill(pts,d.fill??C.ink,n.worldOpacity);}}});
   });this.lastActor=key;
  }plate(c,this.assets.actor);
 }
 prepareCourse(drawn){
  const key=JSON.stringify(drawn);if(this.courseKey===key)return;this.courseKey=key;
  for(const e of [this.worldEnv,this.mothEnv,this.forgeEnv])for(const k of e.cache.keys())if(k.startsWith('sprite:course')||k.startsWith('sprite:moth'))e.cache.delete(k);
  this.assets.impression=asset(this.forgeEnv,'course-impression',g=>g.group('plain',()=>stroke(g,drawn.map(platePoint),.65,'#376867',100)));
  const course=coursePoints(drawn),pts=course.map(gardenPoint),rand=rng(1818);
  const shore=(distance,seed)=>pts.map(([x,y],i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,w=distance*(.75+course[i][2]*.45+.18*Math.sin(i*.41+seed));return [x-dy/len*w,y+dx/len*w];});
  const north=shore(-54,2),south=shore(62,3),bankNorth=shore(-120,8),bankSouth=shore(151,4);
  this.assets.course=asset(this.worldEnv,'course',g=>{
   g.group('paint',()=>{wash(g,[...bankNorth,...bankSouth.toReversed()],'#8daa85',844,.3);wash(g,[...shore(-83,3),...shore(102,9).toReversed()],'#659481',188,.34);wash(g,[...north,...south.toReversed()],'#7aaba6',144,.63);wash(g,[...shore(-17,7),...shore(25,6).toReversed()],'#c3d5c6',72,.68);});
   g.group('ink',()=>{for(let k=0;k<pts.length-2;k+=3){const p=north[k],q=north[Math.min(k+2,pts.length-1)];stroke(g,[p,q],1.25,'#446e67',k+130);if(k%2===0){const a=south[k],b=south[Math.min(k+1,pts.length-1)];stroke(g,[a,b],.75,'#597b68',k+132);}}});
   g.group('paint',()=>{for(const [at,side,rx,alpha]of [[.2,-1,146,.32],[.54,1,200,.48],[.72,1,160,.32]]){const p=bankPoint(drawn,at,side,103);wash(g,blob(p[0]+18,p[1]+9,rx,39,83),'#526e55',947,alpha);wash(g,blob(p[0]-14,p[1]-3,rx*.6,17,79),'#324f47',953,alpha*.55);}for(let j=0;j<42;j++){const at=rand(),p=along(pts,at),side=j%2?1:-1;wash(g,blob(p[0]+(rand()-.5)*90,p[1]+side*(50+rand()*69),30+rand()*48,12+rand()*16,j+130),'#a0ab7e',j+777,.3);}});
   g.group('ink',()=>{for(let j=0;j<175;j++){const at=rand(),p=along(pts,at),side=j%2?1:-1,x=p[0]+(rand()-.5)*40,y=p[1]+side*(54+rand()*72);stroke(g,[[x,y],[x+(rand()-.5)*12,y-8-rand()*17]],.45,'#4f7766',1200+j);if(j%5===0)stroke(g,[[x-8,y+3],[x+12,y]],.65,'#527b70',1800+j);}for(let j=0;j<60;j++){const p=along(pts,rand()),x=p[0]+(rand()-.5)*20,y=p[1]+(rand()-.5)*31;stroke(g,[[x-15,y],[x,y-1],[x+17,y]],.7,'#edf0d8',300+j);}});
  });
  // Cropped material parts retain the actual wet paint under Motor's wing transforms.
  for(const part of ['body','left','right'])this.assets['moth'+part]=asset(this.mothEnv,'moth'+part,g=>{g.push(240,200,1);mothPart(g,part,drawn);g.pop();});
 }
 world(c,s,pose){
  this.prepareCourse(s.created);const t=s.progress,pts=coursePoints(s.created).map(gardenPoint),travel=clamp((s.age-9)/18);if(travel<=0)return;
  c.save();c.beginPath();const n=Math.max(1,Math.ceil(pts.length*travel));for(let i=0;i<n;i++){const p=pts[i],r=95+clamp((travel-i/pts.length)*2.7)*420;c.moveTo(p[0]+r,p[1]);c.ellipse(p[0],p[1],r,r*.78,0,0,Math.PI*2);}c.clip();plate(c,this.assets.distance);c.restore();
  // The growing wash follows the actual recorded stroke, including a return or loop.
  c.save();c.beginPath();for(let i=0;i<n;i++){const p=pts[i],r=12+clamp((travel-i/pts.length)*7)*160;c.moveTo(p[0]+r,p[1]);c.ellipse(p[0],p[1],r,r*.8,0,0,Math.PI*2);}c.clip();plate(c,this.assets.course);c.restore();
  const positions=[{at:.1,side:-1,name:'willow0',k:.83},{at:.68,side:-1,name:'willow1',k:.68}];
  for(const item of positions){const p=bankPoint(s.created,item.at,item.side,108),born=clamp((s.age-9-item.at*13)/8);if(!born)continue;this.growing(c,this.assets[item.name],p[0]-370*item.k,p[1]-790*item.k,item.k,born,800,900);}
  // Each bank has authored drifts and rests, with different habits and views.
  const drifts=[[.02,-1,.68,'dock'],[.075,1,.75,'fern'],[.12,1,.6,'umbel'],[.2,-1,.8,'iris'],[.29,1,.65,'dock'],[.35,-1,.55,'fern'],[.43,-1,.74,'umbel'],[.54,1,.86,'iris'],[.62,-1,.72,'fern'],[.72,1,.87,'dock'],[.81,-1,.57,'umbel'],[.89,1,.66,'fern'],[.97,-1,.7,'iris']];
  for(let j=0;j<drifts.length;j++){const [at,side,k,name]=drifts[j],p=bankPoint(s.created,at,side,103),born=clamp((s.age-9-at*15)/4);if(!born)continue;const x=p[0]-155*k,y=p[1]-350*k;this.growing(c,this.assets[name+(j%2)],x,y,k,born);if(j%3===1)this.growing(c,this.assets.rock,p[0]-50,p[1]+60,.6,born,320,200);}
 }
 growing(c,sp,x,y,k,born,w=320,h=380){
  c.save();c.translate(x,y);c.scale(k,k);if(born<1){c.beginPath();const reach=born*(h+120);for(let j=0;j<8;j++){const yy=h-j*h/8;if(h-yy>reach)continue;const r=clamp((reach-(h-yy))/90)*w*.63;c.moveTo(w*.48+r,yy);c.ellipse(w*.48,yy,r,h/8+18,0,0,Math.PI*2);}c.clip();}plate(c,sp);c.restore();
 }
 foreground(c,s){if(!s.created)return;const age=s.age,done=clamp((age-21)/9);if(!done)return;const aa=gardenPoint(along(s.created,.12)),bb=gardenPoint(along(s.created,.86)),a=[Math.min(500,aa[0]),aa[1]],b=[Math.max(1850,bb[0]),bb[1]];
  c.save();c.beginPath();c.rect(0,1500-done*420,2400,done*420);c.clip();plate(c,this.assets.foreground);c.restore();
  for(const [x,y,k,n]of [[a[0]-420,1380,1.5,'dock0'],[a[0]-130,1470,1.55,'fern1'],[b[0]+230,1480,1.72,'iris1'],[b[0]+30,1390,1.45,'umbel0']])this.growing(c,this.assets[n],x,y-350*k,k,done);
 }
 transfer(c,s){if(s.age<8.5)return;this.prepareCourse(s.created);const u=clamp((s.age-8.5)/10),smooth=u*u*(3-2*u),sx=FORGE.s+(2040/PLATE.w-FORGE.s)*smooth,sy=FORGE.s+(650/PLATE.h-FORGE.s)*smooth,tx=FORGE.x*(1-smooth)+(170-PLATE.x*2040/PLATE.w)*smooth,ty=FORGE.y*(1-smooth)+(440-PLATE.y*650/PLATE.h)*smooth;c.save();c.transform(sx,0,0,sy,tx,ty);plate(c,this.assets.impression);c.restore();}
 organism(c,s,pose){if(s.age<3.2)return;this.prepareCourse(s.created);const markAt=(Math.floor((s.created.length-1)*.28)+Math.ceil((s.created.length-1)*.58))/2/(s.created.length-1),at=s.age<9?markAt:markAt+(1-markAt)*clamp((s.age-9)/21),p=gardenPoint(along(s.created,at)),start=platePoint(along(s.created,at)),unfold=clamp((s.age-9)/8),x=(FORGE.x+start[0]*FORGE.s)*(1-unfold)+p[0]*unfold,y=(FORGE.y+start[1]*FORGE.s)*(1-unfold)+p[1]*unfold;
  const lift=pose.nodes.find(n=>n.id==='living-mark').local.y;c.save();c.translate(x,y+lift);c.scale(FORGE.s,FORGE.s);const born=clamp((s.age-3.2)/1.8);if(born<1){c.beginPath();c.ellipse(0,0,185,2+born*115,0,0,Math.PI*2);c.clip();}
  for(const [id,part]of [['left-wing','left'],['right-wing','right']]){const a=pose.nodes.find(n=>n.id===id).local.rotation*Math.PI/180;c.save();c.rotate(a);plate(c,this.assets['moth'+part],-240,-200);c.restore();}plate(c,this.assets.mothbody,-240,-200);c.restore();
 }

}
