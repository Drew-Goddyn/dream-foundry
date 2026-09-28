import {ribbon,rng} from './marks.mjs';
import {REST} from './gesture.mjs';
const C={paper:'#f3ecd9',ink:'#122f3a',blue:'#254b55',wash:'#65867e',brass:'#b49a61',light:'#e2ca8a',red:'#c6462c',pale:'#e2dbbf'};
export function buildArt(tune) {
  const nodes=[],bindings=[],poseTracks=[]; let serial=0;
  const add=n=>{nodes.push(n);return n.id;};
  const group=(id,x=0,y=0,parent)=>add({id,kind:'group',x,y,...(parent?{parent}:{})});
  const path=(id,commands,fill,stroke,width=1,parent,more={})=>add({id,kind:'path',commands,...(fill?{fill}:{}),...(stroke?{stroke,strokeWidth:width}:{}),...(parent?{parent}:{}),...more});
  const ellipse=(id,x,y,rx,ry,fill,stroke,parent,more={})=>add({id,kind:'ellipse',x,y,rx,ry,...(fill?{fill}:{}),...(stroke?{stroke,strokeWidth:1.3}:{}),...(parent?{parent}:{}),...more});
  const line=(pts,w=1.5,color=C.ink,parent,opacity=1)=>path('mark-'+serial++,ribbon(pts,w,serial),color,null,1,parent,{opacity});
  const bone=(id,x,y,parent)=>add({id,kind:'bone',length:1,x,y,...(parent?{parent}:{})});
  const bind=(input,node,property,scale)=>bindings.push({input,node,property,scale});
  const held=(node,property,values)=>poseTracks.push({input:'pull',node,property,keys:values.map(([at,value])=>({at,value,easing:'smooth'}))});
  // Cubic silhouettes remain cubic. Influence fields move their existing control points.
  const skin=(id,weights)=>{const n=nodes.find(n=>n.id===id);n.skin={weights:n.commands.flatMap(c=>{
    const out=[];for(let i=1;i<c.length;i+=2)out.push(weights(c[i],c[i+1]));return out;})};};
  const one=bone=>[{bone,weight:1}];
  const blend=(a,b,t)=>t<.001?one(a):t>.999?one(b):[{bone:a,weight:1-t},{bone:b,weight:t}];
  const clip=(v)=>Math.max(0,Math.min(1,v));
  const attach=(weights,bone,t)=>t<.001?weights:t>.999?one(bone):[...weights.map(w=>({...w,weight:w.weight*(1-t)})),{bone,weight:t}];
  // Paper, rule and print registration. No external textures, fonts or images.
  const random=rng(1601);
  for(let i=0;i<260;i++) {const x=36+random()*1128,y=30+random()*700;line([[x,y],[x+1+random()*3,y-.5]],.55,'#bcb39b',null,.18);}
  path('plate-border',[['M',39,47],['L',1161,47],['L',1161,704],['L',39,704],['Z']],null,C.brass,.8);
  for(const [x,y,sx,sy] of [[49,57,1,1],[1151,57,-1,1],[49,694,1,-1],[1151,694,-1,-1]]){
    line([[x,y+22*sy],[x,y],[x+27*sx,y]],1.4,C.ink);
    ellipse('registration-'+serial++,x+9*sx,y+9*sy,2,2,C.brass);
  }
  // Cast shadow and uneven ink left on the stone. Light comes from upper left.
  for(let i=0;i<4;i++)ellipse('shadow-'+i,492+i*3,630-i*2,250-i*20,20-i*3,C.ink,null,null,{opacity:.035});
  line([[215,632],[401,635],[632,632],[754,632]],1.5,C.ink,null,.38);
  for(let i=0;i<12;i++)ellipse('ink-splash-'+i,588+random()*122,585+random()*43,1+random()*5,1+random()*2,C.ink,null,null,{opacity:.45});
  // Permanent press chassis, ink trough and splayed cast-iron feet.
  path('press-base',[['M',235,568],['L',501,568],['L',528,596],['L',518,610],['L',209,610],['L',198,598],['Z']],C.ink,C.ink,2);
  path('base-top',[['M',235,568],['L',501,568],['L',516,582],['L',220,582],['Z']],C.brass,C.ink,2);
  for(const x of [229,469])path('foot-'+x,[['M',x,600],['L',x+26,600],['L',x+38,632],['L',x-15,632],['L',x-13,624],['L',x+4,616],['Z']],C.ink,C.ink);
  path('arch',[['M',278,572],['L',278,452],['C',278,408,292,394,316,394],['L',416,394],['C',445,394,461,422,461,448],['L',461,572],['L',436,572],['L',436,451],['C',436,430,421,420,410,420],['L',322,420],['C',310,420,304,435,304,452],['L',304,572],['Z']],C.blue,C.ink,3);
  line([[291,557],[291,451],[298,423],[315,411],[412,411]],2,C.light);
  for(let i=0;i<17;i++)line([[280,475+i*5],[294,468+i*5]],.9,C.light,null,.5);
  // Upper print bed rises with the wheel. Bracing stays on the fixed right rail.
  if(tune.connected){bone('platen',366,354);}else{group('platen',366,394);}
  held('platen','y',tune.connected?[[0,354],[.35,341],[1,319]]:[[0,394],[.35,382],[1,319]]);
  path('platen-plate',[['M',-112,-13],['L',122,-13],['L',135,6],['L',-127,6],['Z']],C.brass,C.ink,2.7,'platen');
  line([[-106,-7],[111,-7]],1.4,C.light,'platen');
  for(let i=0;i<11;i++)line([[-100+i*20,1],[-96+i*20,-5]],.8,C.ink,'platen');
  path('fixed-rail',[['M',430,487],['L',560,487],['L',568,499],['L',430,499],['Z']],C.brass,C.ink,2);
  // Screws become stems; folded engraved plates open on their original pivots.
  for(const [side,x] of [[-1,302],[1,431]]) {
    const p='stem-'+side;group(p,x,tune.connected?410:386);held(p,'rotation',[[0,0],[.35,side*7*tune.spread],[1,side*34*tune.spread]]);
    path(p+'-shaft',[['M',-7,0],['C',-11,-76,-5,-141,-9,-198],['L',8,-198],['C',4,-125,11,-65,7,0],['Z']],C.brass,C.ink,2,p);
    for(let j=0;j<21;j++)line([[-7,-8-j*9],[8,-13-j*9]],.9,C.ink,p,.7);
    ellipse(p+'-cap',0,-198,13,8,C.ink,C.brass,p);
    const leaves=[[-1,-153,101,.7],[1,-121,127,1],[-1,-81,113,.85],[1,-42,88,.68]];
    for(let j=0;j<leaves.length;j++){
      const [d,y,len,size]=leaves[j],id=p+'-leaf-'+j;
      // The working press opens from the lower plates upward; the crown answers last.
      const onset=.12+(3-j)*.095+(side===1?.035:0),finish=.68+(3-j)*.09+(side===1?.015:0);
      const unfold=(closed,open)=>[[0,closed],[onset,closed],[finish,open],[1,open]];
      group(id,0,y,p);const initial=tune.connected?0:d*(9+j*3),opened=d*(58+j*4)*tune.spread;
      if(tune.connected)held(id,'y',tune.stagedBloom?unfold(-198+len,y):[[0,-198+len],[.25,-198+len],[.7,y-8],[1,y]]);
      held(id,'rotation',tune.stagedBloom?unfold(initial,opened):[[0,initial],[.25,initial],[.66,opened*.65],[1,opened]]);
      const cmds=[['M',0,6],['C',-11,-10,-35*size,-36,-25*size,-len*.65],['C',-20*size,-len*.89,-4,-len*.9,0,-len],['C',7,-len*.85,28*size,-len*.8,30*size,-len*.49],['C',28*size,-len*.18,9,-8,0,6],['Z']];

      const closed=[['M',0,6],['C',-10,0,-10,-36,-10,-len*.65],['C',-10,-len,-10,-len,0,-len],['C',10,-len,10,-len,10,-len*.49],['C',10,-len*.18,10,0,0,6],['Z']];
      const plate=tune.connected?closed:cmds;
      path(id+'-plate',plate,C.brass,C.ink,1.5,id);
      path(id+'-pigment',plate,C.wash,null,1,id,{opacity:0});
      if(tune.connected){
        const weights=[];let index=0;
        closed.forEach((c,ci)=>{for(let k=1;k<c.length;k+=2){const b=id+'-edge-'+index++;bone(b,c[k],c[k+1],id);if(tune.stagedBloom){held(b,'x',unfold(c[k],cmds[ci][k]));held(b,'y',unfold(c[k+1],cmds[ci][k+1]));}else{bind('pull',b,'x',cmds[ci][k]-c[k]);bind('pull',b,'y',cmds[ci][k+1]-c[k+1]);}weights.push(one(b));}});
        nodes.find(n=>n.id===id+'-plate').skin={weights};nodes.find(n=>n.id===id+'-pigment').skin={weights};
      }
      const detail=tune.connected?group(id+'-engraving',0,0,id):id;
      if(tune.connected)held(detail,'scaleX',tune.stagedBloom?unfold(.22,1):[[0,.22],[.35,.36],[1,1]]);
      held(id+'-pigment','opacity',tune.stagedBloom?unfold(0,tune.pigment):[[0,0],[.35,.06],[1,tune.pigment]]);
      line([[0,1],[1,-len*.4],[0,-len*.9]],2,C.ink,detail);
      for(let k=1;k<8;k++){const y=-len*k/9,w=Math.sin(k/9*Math.PI)*21*size;line([[0,y+8],[-w,y-5]],.85,C.ink,detail,.8);line([[1,y],[w,y-14]],1,C.ink,detail,.7);}
      line([[-17*size,-len*.34],[-19*size,-len*.61],[-8,-len*.82]],1.6,C.light,detail);
      ellipse(id+'-rivet',0,0,5,5,C.light,C.ink,id);
    }
  }
  if(tune.connected){
    path('press-bed',[['M',253,380],['L',480,380],['L',491,395],['L',245,395],['Z']],C.ink,C.ink,2);
    path('paper-stack',[['M',270,372],['L',457,372],['L',463,380],['L',266,380],['Z']],C.paper,C.ink,1.2);
    for(let i=0;i<3;i++)line([[271,375+i*1.5],[459,375+i*1.5]],.55,C.brass);
    const screw=[['M',358,251],['C',358,280,359,317,359,354],['L',373,354],['C',373,317,372,280,372,251],['Z']];
    path('type-screw-shaft',screw,C.brass,C.ink,1.5);
    skin('type-screw-shaft',(x,y)=>blend('crown','platen',clip((y-251)/103)));
    for(let i=0;i<15;i++){const id=line([[358,255+i*6.4],[372,250+i*6.4]],1.1,C.ink);skin(id,(x,y)=>blend('crown','platen',clip((y-251)/103)));}
    for(const [side,x] of [[-1,302],[1,431]]){
      const id='headstock-'+side,d=-side;group(id,0,-198,'stem-'+side);
      held(id,'rotation',[[0,0],[.4,0],[1,-side*42]]);held(id,'scaleY',[[0,.25],[.4,.35],[1,1]]);
      path(id+'-blade',[['M',0,-20],['C',d*29,-25,d*43,-21,d*64,0],['C',d*35,28,d*13,25,0,20],['Z']],C.brass,C.ink,1.8,id);
      line([[0,0],[d*59,0]],1.8,C.ink,id);
      ellipse(id+'-socket',0,0,9,9,C.ink,C.light,id);
      ellipse('stem-socket-'+side,x,410,13,13,C.ink,C.brass);
      ellipse('stem-pivot-'+side,x,410,5,5,C.light,C.ink);
    }
  }
  // The central type screw splits into an asymmetric, articulated brass calyx.
  if(tune.connected){bone('crown',365,251);}else{group('crown',365,251);}held('crown','y',[[0,251],[.3,243],[1,207]]);
  for(let j=0;j<5;j++){
    const id='crown-petal-'+j;group(id,0,0,'crown');
    if(tune.connected){held(id,'scaleX',tune.stagedBloom?[[0,.18],[.44,.18],[1,1]]:[[0,tune.expressive?.18:.3],[.4,.45],[1,1]]);held(id,'scaleY',tune.stagedBloom?[[0,.08],[.44,.08],[1,1]]:[[0,tune.expressive?.08:.25],[.4,.4],[1,1]]);}
    held(id,'rotation',tune.stagedBloom?[[0,(j-2)*72],[.44,(j-2)*72],[1,(j-2)*34*tune.spread]]:[[0,(j-2)*(tune.connected?72:6)],[.4,(j-2)*(tune.connected?42:8)],[1,(j-2)*34*tune.spread]]);
    path(id+'-outline',[['M',0,10],['C',-18,-22,-32,-71,-11,-98],['L',0,-119-j*3],['C',30,-79,27,-37,0,10],['Z']],j%2?C.light:C.brass,C.ink,1.8,id);
    line([[0,5],[-5,-56],[0,-110]],1.2,C.ink,id);
    for(let k=0;k<8;k++)line([[-4,-20-k*9],[13,-35-k*7]],.8,C.ink,id,.7);
  }
  ellipse('crown-boss',0,0,17,17,tune.connected?C.brass:C.red,C.ink,'crown');
  ellipse('crown-pin',-2,-3,4,4,C.light,null,'crown');
  // Wheel and tail share the wheel bone, so the attachment is evaluated, not painted over.
  bone('wheel',436,468);held('wheel','rotation',[[0,0],[1,-105]]);
  ellipse('wheel-rim',0,0,72,72,C.brass,C.ink,'wheel',{strokeWidth:4});
  ellipse('wheel-cutout',0,0,57,57,C.paper,C.ink,'wheel',{strokeWidth:2});
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[Math.cos(a)*13,Math.sin(a)*13],[Math.cos(a)*57,Math.sin(a)*57]],8,C.ink,'wheel');}
  for(let i=0;i<36;i++){const a=i*Math.PI/18;line([[Math.cos(a)*63,Math.sin(a)*63],[Math.cos(a)*69,Math.sin(a)*69]],1,C.ink,'wheel');}
  ellipse('wheel-hub',0,0,17,17,C.ink,C.light,'wheel');
  ellipse('tail-attachment',44,0,7,7,C.red,C.ink,'wheel');
  if(tune.connected){
    const rod=[['M',386,466],['L',360,354],['L',372,354],['L',398,470],['Z']];
    path('press-connecting-rod',rod,C.light,C.ink,2);
    skin('press-connecting-rod',(x,y)=>blend('platen','wheel',clip((y-354)/114)));
    ellipse('drive-pin',-44,0,9,9,C.brass,C.ink,'wheel');ellipse('drive-pin-center',-44,0,3,3,C.ink,null,'wheel');
    ellipse('platen-pin',0,0,7,7,C.brass,C.ink,'platen');
    line([[38,-7],[46,-6],[51,1],[47,7]],4,C.ink,'wheel');
  }
  // Ink creature: one tapering, curved silhouette, from wheel knot to upturned muzzle.
  bone('body',625,413);bone('head',708,287);bone('brace',550,487);bone('reach',781,295);
  bind('reachX','head','x',.3);bind('reachY','head','y',.25);bind('pull','head','x',52);bind('pull','head','y',-39*tune.headLift);
  if(tune.expressive){
    held('body','x',[[0,615],[.38,606],[1,672]]);held('body','y',[[0,428],[.38,432],[1,364]]);held('body','rotation',[[0,8],[.38,3],[1,-17]]);
    held('head','rotation',[[0,7],[.42,-11],[1,-5]]);
  }else{bind('pull','body','x',tune.connected?42:33);bind('pull','body','y',tune.connected?-42:-16);bind('pull','body','rotation',tune.connected?-12:-8);}
  if(tune.connected){bone('elbow',637,450);held('elbow','x',[[0,637],[.38,612],[1,652]]);held('elbow','y',[[0,450],[.38,468],[1,425]]);}
  bind('reachX','reach','x',.76);bind('reachY','reach','y',.8);
  const bodyWeight=(x,y)=>blend('body','head',clip((395-y)/112));
  const silhouette=tune.expressive?[['M',480,468],['C',492,488,544,548,581,530],['C',619,511,566,477,574,441],['C',583,396,642,394,660,356],['C',671,331,649,318,653,296],['C',651,278,641,260,647,240],['C',666,244,680,259,686,271],['C',704,244,736,246,755,266],['C',761,275,760,287,777,292],['C',781,300,769,312,754,310],['C',743,339,716,351,708,379],['C',699,420,646,444,658,491],['C',674,545,614,590,561,570],['C',510,549,476,506,480,468],['Z']]:[['M',480,468],['C',485,491,534,556,584,541],['C',638,523,579,479,583,443],['C',588,396,650,390,664,357],['C',674,334,656,319,660,298],['C',658,278,648,257,650,242],['C',667,244,681,258,686,271],['C',704,244,736,246,755,266],['C',761,275,760,287,777,292],['C',781,300,769,312,754,310],['C',743,339,716,351,708,379],['C',695,423,652,449,656,494],['C',660,542,615,581,567,567],['C',511,550,476,506,480,468],['Z']];
  const creatureWeight=(x,y)=>tune.expressive?(x<503?one('wheel'):bodyWeight(x,y)):(x<540?blend('wheel','body',clip((x-480)/60)):bodyWeight(x,y));
  path('creature-silhouette',silhouette,C.ink,tune.expressive?null:C.ink,1.6);skin('creature-silhouette',creatureWeight);
  // Several deliberately offset washes: thin first stain, concentrated pigment on turning form.
  const wash=[['M',591,538],['C',623,503,600,473,617,437],['C',631,407,679,386,688,351],['C',700,329,679,294,697,276],['C',723,259,745,269,745,288],['C',716,305,726,331,709,359],['C',688,401,651,421,646,456],['C',635,489,650,529,605,548],['Z']];
  for(let i=0;i<(tune.expressive?0:3);i++){path('body-wash-'+i,tune.connected?wash.map(c=>c.map((v,k)=>k===0?v:v+(k%2?i*1.5:-i*.6))):wash,i===0?'#527c7a':i===1?'#70928a':'#98aaa0',null,1,null,{opacity:.15+i*.025});skin('body-wash-'+i,creatureWeight);}
  const bodyMarks=[[[496,493],[549,546],[581,550]],[[603,516],[608,480],[626,442],[664,411]],[[630,421],[658,401],[680,374]],[[683,323],[680,305],[685,288]]];
  for(const pts of (tune.expressive?[]:bodyMarks)){const id=line(pts,2.2,C.light,null,.57);skin(id,creatureWeight);}
  for(let i=0;i<(tune.expressive?0:16);i++){const y=408+i*7,x=637-18*Math.sin(i*.21);const id=line([[x,y],[x+9,y-2],[x+17,y-10]],.9,'#95b0a0',null,.45);skin(id,bodyWeight);}
  if(tune.expressive){
    // Pigment pools inside the turn; broad tapering paper cuts follow the drawn force.
    const deposits=[
      ['pool-at-haunch',[['M',579,447],['C',583,424,607,411,629,408],['C',601,437,611,468,626,491],['C',643,523,622,553,586,553],['C',610,532,594,511,586,486],['C',578,471,576,457,579,447],['Z']],'#091f29',.8],
      ['washed-spine',[['M',598,536],['C',625,512,608,480,623,450],['C',637,420,665,407,682,374],['C',691,356,699,340,715,328],['C',700,358,706,376,689,401],['C',670,430,639,440,637,471],['C',634,505,643,532,607,546],['Z']],'#547f79',.5],
      ['pulled-paper',[['M',604,539],['C',623,527,628,513,624,496],['C',620,476,628,459,640,444],['C',631,468,635,484,637,500],['C',640,519,627,535,604,539],['Z']],C.paper,.75],
      ['shoulder-paper',[['M',646,428],['C',669,405,673,384,687,371],['C',675,398,674,410,646,428],['Z']],C.paper,.8],
      ['cheek-wash',[['M',686,305],['C',693,287,715,278,735,281],['C',716,289,699,304,701,319],['C',695,331,685,324,686,305],['Z']],'#547f79',.4]
    ];
    for(const [id,cmd,color,opacity] of deposits){path(id,cmd,color,null,1,null,{opacity});skin(id,creatureWeight);}

  }
  // A planted hand, then a reaching forearm. Both are skin fields between fixed named attachments.
  const brace=tune.connected?[['M',680,367],['C',653,376,664,422,637,440],['C',612,457,563,462,548,478],['C',537,478,533,485,538,490],['L',558,490],['C',580,488,624,487,650,462],['C',673,442,676,410,695,382],['Z']]:[['M',680,367],['C',650,371,622,407,596,430],['C',579,445,556,467,548,478],['C',537,478,533,485,538,490],['L',558,490],['C',564,485,557,480,559,477],['C',592,462,618,445,637,423],['C',656,407,684,399,695,382],['Z']];
  const braceWeights=(x,y)=>y>420?blend('brace','elbow',clip((x-572)/57)):attach(bodyWeight(x,y),'elbow',clip((y-377)/43));
  path('bracing-arm',brace,C.blue,C.ink,2);skin('bracing-arm',(x,y)=>tune.connected?braceWeights(x,y):blend('brace','head',clip((x-558)/128)));
  if(tune.connected){
    const crease=line([[668,403],[655,429],[637,446],[614,458]],3.1,C.ink);skin(crease,braceWeights);
    const shine=line([[604,469],[624,467],[645,453]],1.7,C.light,null,.62);skin(shine,braceWeights);
    path('palm-pressure',[['M',539,487],['C',547,484,558,486,562,492],['L',536,492],['Z']],C.ink);
    for(let j=0;j<(tune.expressive?0:8);j++){const id=line([[646+j*.75,393+j*6],[650+j*.8,399+j*6]],1.1,C.paper,null,.36);skin(id,bodyWeight);}
    for(let j=0;j<(tune.expressive?0:4);j++){const id=line([[513+j*5,522+j*3],[533+j*4,541+j*2],[555+j*2,549+j]],.8,C.paper,null,.45);skin(id,creatureWeight);}
  }
  for(let i=0;i<3;i++)line([[539+i*6,484],[543+i*6,488]],1.3,C.paper);
  const arm=[['M',712,344],['C',736,343,736,323,749,317],['C',757,311,768,313,776,304],['L',781,288],['C',785,284,786,289,785,295],['C',794,287,797,289,792,297],['C',804,294,802,300,795,304],['C',803,306,799,311,788,310],['C',777,327,760,328,754,341],['C',747,365,724,375,711,360],['Z']];
  path('reaching-arm',arm,C.blue,C.ink,2);skin('reaching-arm',(x,y)=>tune.connected?attach(bodyWeight(x,y),'reach',clip((x-740)/45)):blend('head','reach',clip((x-712)/68)));
  const armShine=line([[721,349],[741,333],[753,323],[772,318]],2,C.light,null,.58);skin(armShine,(x,y)=>tune.connected?attach(bodyWeight(x,y),'reach',clip((x-740)/45)):blend('head','reach',clip((x-712)/68)));
  // Face is in the head's local frame, including asymmetric lids, pupils, brow and muzzle.
  group('face',0,0,'head');
  if(tune.expressive){group('near-ocular',0,0,'face');group('far-ocular',0,0,'face');held('near-ocular','scaleY',[[0,1],[.4,.48],[.62,.65],[1,1.13]]);held('far-ocular','scaleY',[[0,.85],[.4,.62],[1,1.08]]);}
  path('far-eye',[['M',11,-16],['C',15,-29,28,-31,32,-20],['C',33,-8,20,-4,11,-16],['Z']],C.paper,C.ink,1.2,tune.expressive?'far-ocular':'face');
  path('near-eye',[['M',-20,-10],['C',-18,-32,4,-40,15,-21],['C',21,-1,-5,10,-20,-10],['Z']],C.paper,C.ink,1.8,tune.expressive?'near-ocular':'face');
  // The hand keeps reaching; at full pull the eyes notice what the press became.
  const nearGaze=tune.noticeBloom?group('near-gaze',0,0,'near-ocular'):(tune.expressive?'near-ocular':'face');
  const farGaze=tune.noticeBloom?group('far-gaze',0,0,'far-ocular'):(tune.expressive?'far-ocular':'face');
  if(tune.noticeBloom){held(nearGaze,'x',[[0,0],[.72,0],[1,-17]]);held(farGaze,'x',[[0,0],[.72,0],[1,-10]]);}
  ellipse('pupil-near',3,-16,5.2,9,C.ink,null,nearGaze);ellipse('pupil-far',26,-19,3.2,6,C.ink,null,farGaze);
  bind('reachX','pupil-near','x',.014);bind('reachY','pupil-near','y',.014);bind('reachX','pupil-far','x',.007);
  ellipse('glint',1,-20,1.5,2,C.paper,null,nearGaze);
  if(tune.connected){
    path('focused-lid',[['M',-23,-18],['C',-14,-38,9,-41,18,-18],['C',6,-21,-5,-24,-23,-18],['Z']],C.ink,null,1,'face',{opacity:0});
    held('focused-lid','opacity',tune.expressive?[[0,0],[1,0]]:[[0,0],[.33,.75],[.65,.5],[1,.06]]);
    path('lower-eye-pressure',[['M',-20,-2],['Q',-3,7,12,-5]],null,C.ink,2,'face');
  }
  const browParent=tune.noticeBloom?group('brow-notice',0,0,'face'):'face';
  if(tune.noticeBloom){held(browParent,'y',[[0,0],[.72,0],[1,-4]]);held(browParent,'rotation',[[0,0],[.72,0],[1,-8]]);}
  const brow=line([[-23,-34],[-8,-41],[5,-37]],3,C.ink,browParent);if(tune.expressive){held(brow,'y',[[0,0],[.42,15],[1,-4]]);held(brow,'rotation',[[0,-4],[.42,18],[1,-8]]);}
  line([[15,-36],[25,-37],[31,-33]],2,C.ink,'face');
  const mouth=line([[35,9],[48,12],[60,7]],1.7,C.paper,'face',.9);
  if(tune.expressive){held(mouth,'opacity',[[0,.9],[.25,0],[1,0]]);
    path('effort-mouth',[['M',21,14],['C',27,10,35,9,41,11],['L',38,14],['C',32,13,27,14,21,14],['Z']],C.paper,null,1,'face',{opacity:0});held('effort-mouth','opacity',[[0,0],[.3,1],[.64,1],[.86,0],[1,0]]);
    path('wonder-mouth',[['M',25,14],['C',27,7,38,6,40,12],['C',42,20,34,26,28,22],['C',24,20,24,17,25,14],['Z']],C.paper,null,1,'face',{opacity:0});held('wonder-mouth','opacity',[[0,0],[.66,0],[.9,.95],[1,.95]]);
  }
  line([[31,24],[39,20]],1.1,C.paper,'face',.65);
  line([[-39,-25],[-47,-34],[-49,-42]],2,C.wash,'face');
  for(let i=0;i<4;i++)line([[28+i*4,0],[30+i*4,1]],1,C.light,'face',.6);
  // Small engraved caption strokes and scrollwork keep the illustration a bookplate.
  for(const x of [281,451]){ellipse('base-bolt-'+x,x,593,4,4,C.light,C.ink);line([[x-2,593],[x+2,593]],.8,C.ink);}
  line([[316,592],[339,596],[395,596],[420,592]],1,C.light);
  // Vermilion is the single draggable object; Motor also draws its echo and white glint.
  group('drop',0,0);bind('dropX','drop','x',1);bind('dropY','drop','y',1);
  ellipse('drop-halo',0,2,29,29,C.red,null,'drop',{opacity:.065});
  path('vermilion-drop',[['M',0,-20],['C',-3,-10,-14,-2,-14,8],['C',-13,27,17,27,15,7],['C',14,-3,4,-12,0,-20],['Z']],C.red,C.ink,1.2,'drop');
  line([[-7,3],[-8,11],[-3,16]],2.2,C.paper,'drop');
  return {version:1,scene:{id:'inkborn',width:1200,height:752,background:C.paper},nodes,animations:[],inputs:Object.entries(REST).map(([id,def])=>({id,min:id==='dropX'?650:id==='dropY'?155:id==='pull'?0:-200,max:id==='dropX'?1050:id==='dropY'?460:id==='pull'?1:300,default:def,smoothing:{duration:id==='pull'?.65:.24,easing:'smooth'}})),bindings,poseTracks};
}
