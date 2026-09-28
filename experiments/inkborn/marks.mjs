// Adapted geometry from anidoodle/core.ts at 03ddf534328962f8a91eb115e3ae67e03da4de5a.
// Copyright 2026 Alex Greenshpun. Apache-2.0; see ATTRIBUTION.md.
// The adaptation emits editable Motor paths; it has no drawing or animation runtime.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function sample(points, per = 8) {
  const at = i => points[Math.max(0, Math.min(points.length - 1, i))], out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0,p1,p2,p3] = [at(i-1),at(i),at(i+1),at(i+2)];
    for (let k=0;k<per;k++) { const t=k/per,t2=t*t,t3=t2*t;
      out.push([0,1].map(d => .5*(2*p1[d]+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3))); }
  }
  return [...out, points.at(-1)];
}
export function ribbon(points, width, seed=1) {
  const s=sample(points), left=[],right=[],r=rng(seed*31+7);
  for(let i=0;i<s.length;i++) {
    const t=i/(s.length-1),p=s[i],q=s[Math.min(s.length-1,i+1)],o=s[Math.max(0,i-1)];
    const dx=q[0]-o[0],dy=q[1]-o[1],len=Math.hypot(dx,dy)||1;
    const taper=Math.pow(Math.max(.04,Math.min(1,t/.14,(1-t)/.2)),.7);
    const pressure=Math.max(.14,.74+.3*Math.sin(t*5.5+(seed%17)*.37)+.14*Math.sin(t*17+(seed%11)*.53));
    const w=width*taper*pressure/2, j=(r()-.5)*Math.min(.5,width*.1);
    left.push([p[0]-dy/len*(w+j),p[1]+dx/len*(w+j)]);
    right.push([p[0]+dy/len*(w-j),p[1]-dx/len*(w-j)]);
  }
  return [...left,...right.reverse()].map((p,i)=>[i?'L':'M',...p]).concat([['Z']]);
}
