// The only gesture mapping. Motor owns all interpolation and evaluated geometry.
export const HOME = {x:805,y:272};
export const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
export function request(x,y) {
  x=clamp(x,650,1050); y=clamp(y,155,460);
  return {dropX:x,dropY:y,reachX:x-HOME.x,reachY:y-HOME.y,
    pull:clamp((Math.hypot(x-525,y-445)-320)/240,0,1)};
}
export const REST = {...request(HOME.x,HOME.y),pull:0};
export function recordsAt(time, values) {return Object.entries(values).map(([input,value])=>({time,input,value}));}
export function replay() {
  const moves=[[0,HOME.x,HOME.y],[.5,690,365],[1.4,850,265],[2.3,1040,165],[3.8,725,360],[4.03,1035,180],[4.3,null,null],[4.48,985,210],[5.4,1040,165],[6.4,null,null]];
  return moves.flatMap(([t,x,y])=>recordsAt(t,x===null?REST:request(x,y)));
}
export const POSES=[{name:'01-curiosity',time:.3},{name:'02-reaching',time:2.12},{name:'03-unfurled',time:3.6}];
