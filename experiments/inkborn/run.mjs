#!/usr/bin/env node
// INKBORN's scene-specific entry. External Motor does validation, evaluation and drawing.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {buildArt} from './art.mjs';
import {replay,POSES} from './gesture.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)), repo=path.resolve(here,'../..');
const argv=process.argv.slice(2), option=k=>argv[argv.indexOf(k)+1];
if(argv.includes('--help')||!argv.includes('--config')||!argv.includes('--out')) {
  console.log('node experiments/inkborn/run.mjs --config /private/local-tools.json --out /private/new-inkborn [--variant initial|bookplate|candidate] [--capture] [--study] [--film] [--verify] [--compare /private/initial-output] [--serve]');
  console.log('Config: {"motorRoot":"/existing/authorized/installation","chrome":"/installed/chrome"}. No installs. Output must be new and outside any Git worktree.');
  process.exit(argv.includes('--help')?0:2);
}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
try {
  const config=JSON.parse(await fs.readFile(path.resolve(option('--config')),'utf8'));
  if(!path.isAbsolute(config.motorRoot)||!path.isAbsolute(config.chrome))throw Error('Configure absolute motorRoot and chrome paths to existing authorized tools.');
  const motor=await fs.realpath(config.motorRoot),out=path.resolve(option('--out'));
  for(const p of ['motor','dist/motor.js','dist/player.js','dist/renderer-selection.js','bundle.json','renderer/manifest.json'])await fs.access(path.join(motor,p));
  await fs.access(config.chrome);
  if(argv.includes('--film')){if(!config.ffmpeg||!path.isAbsolute(config.ffmpeg))throw Error('--film requires an absolute path to existing ffmpeg in the private configuration.');await fs.access(config.ffmpeg);}
  let parent=path.dirname(out);await fs.mkdir(parent,{recursive:true});parent=await fs.realpath(parent);
  const destination=path.join(parent,path.basename(out));
  if(spawnSync('git',['-C',parent,'rev-parse','--show-toplevel'],{encoding:'utf8'}).status===0)throw Error('Private output must be outside every Git worktree.');
  const {resolveRenderer}=await import(pathToFileURL(path.join(motor,'dist/renderer-selection.js')));
  const selection=await resolveRenderer({backend:'rive',directory:path.join(motor,'renderer'),pixelRatio:1});
  const Motor=await import(pathToFileURL(path.join(motor,'dist/motor.js')));
  const tuning=JSON.parse(await fs.readFile(path.join(here,'tuning.json'))),variant=argv.includes('--variant')?option('--variant'):'candidate';
  if(!['initial','bookplate','candidate'].includes(variant))throw Error('variant must be initial, bookplate or candidate');
  const doc=Motor.parseDocument(buildArt(tuning[variant]));
  await fs.mkdir(destination); // Refuse overwrites; failed evidence is retained.
  const cli=(args)=>{
    const r=spawnSync(path.join(motor,'motor'),args,{cwd:repo,encoding:'utf8',env:{...process.env,MOTOR_CHROME:config.chrome,MOTOR_RENDERER_DIR:path.join(motor,'renderer')},maxBuffer:20*1024*1024});
    if(r.status!==0)throw Error(`Motor ${args[0]} failed: ${r.stderr||r.stdout||r.error}`);return r.stdout;
  };
  await json(path.join(destination,'inkborn.motor.json'),doc);await json(path.join(destination,'replay.json'),replay());
  const scene=path.join(destination,'inkborn.motor.json');
  await fs.writeFile(path.join(destination,'validation.json'),cli(['validate',scene]));
  await fs.writeFile(path.join(destination,'inspection.json'),cli(['inspect',scene]));
  cli(['embed',scene,path.join(destination,'play'),'--no-animation','--renderer','rive','--dpr','1']);
  // A tailored host around Motor's public browser API. The host never paints scene geometry.
  await fs.copyFile(path.join(motor,'dist/motor.js'),path.join(destination,'play','motor-api.js'));
  await fs.copyFile(path.join(here,'player.html'),path.join(destination,'play','index.html'));
  await fs.copyFile(path.join(here,'gesture.mjs'),path.join(destination,'play','gesture.mjs'));
  await fs.copyFile(scene,path.join(destination,'play','scene.json'));
  await fs.copyFile(path.join(repo,'third_party/anidoodle/LICENSE'),path.join(destination,'play','anidoodle-LICENSE.txt'));
  await fs.copyFile(path.join(repo,'third_party/anidoodle/NOTICE'),path.join(destination,'play','anidoodle-NOTICE.txt'));
  const sourceFiles=['art.mjs','marks.mjs','gesture.mjs','player.html','run.mjs','tuning.json','verify.mjs','comparison.html','ATTRIBUTION.md','README.md','REVIEW.md'];
  const sourceHashes={};for(const f of sourceFiles)sourceHashes[f]=hash(await fs.readFile(path.join(here,f)));
  const bundle=JSON.parse(await fs.readFile(path.join(motor,'bundle.json')));
  const identity={format:1,foundryBase:'d3d358d4b44400cf24d72df8e243f0240221665c',foundryHead:spawnSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).stdout.trim(),sourceHashes,variant,tuning:tuning[variant],motorSource:bundle.source,motorRuntimeSHA256:hash(await fs.readFile(path.join(motor,'dist/motor.js'))),renderer:selection.selection,anidoodle:'03ddf534328962f8a91eb115e3ae67e03da4de5a',sceneSHA256:hash(await fs.readFile(scene)),replaySHA256:hash(await fs.readFile(path.join(destination,'replay.json'))),independentReview:'pending human-launched non-author'};
  await json(path.join(destination,'identity.json'),identity);
  const captures=[...POSES,...(argv.includes('--study')?[{name:'04-strain',time:2.55},{name:'05-release',time:4.40},{name:'06-regrab',time:4.75},{name:'07-settled',time:7.3},{name:'08-opening',time:2.68},{name:'09-crown',time:2.85}]:[])];
  if(argv.includes('--capture')||argv.includes('--study'))for(const pose of captures)cli(['snapshot',scene,path.join(destination,pose.name),'--time',String(pose.time),'--no-animation','--replay',path.join(destination,'replay.json'),'--renderer','rive','--dpr','1']);
  if(argv.includes('--film')){
    const frames=path.join(destination,'replay-film'),receipt=JSON.parse(cli(['capture',scene,frames,'--no-animation','--replay',path.join(destination,'replay.json'),'--end','7.5','--renderer','rive','--dpr','1']));
    const video=path.join(destination,'play/replay.mp4');
    const encoded=spawnSync(config.ffmpeg,['-v','error','-n','-framerate',String(receipt.fps),'-i',path.join(frames,'frame-%04d.png'),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',video],{encoding:'utf8'});
    if(encoded.status!==0)throw Error('Replay film encoding failed: '+(encoded.stderr||encoded.error));
    await json(path.join(destination,'film.json'),{kind:'Motor-evaluated replay frames; not live performance capture',fps:receipt.fps,frames:receipt.count,duration:receipt.count/receipt.fps,sceneSHA256:identity.sceneSHA256,replaySHA256:identity.replaySHA256,videoSHA256:hash(await fs.readFile(video)),normalSpeedAestheticReview:'unverified'});
    const host=path.join(destination,'play/index.html');await fs.writeFile(host,(await fs.readFile(host,'utf8')).replace('<!-- replay-film -->','<a class="film" href="./replay.mp4">Replay film</a>'));
  }
  if(argv.includes('--compare')){
    if(!argv.includes('--capture')&&!argv.includes('--study'))throw Error('--compare requires --capture or --study');
    const before=path.resolve(option('--compare')),prior=JSON.parse(await fs.readFile(path.join(before,'identity.json')));
    if(prior.replaySHA256!==identity.replaySHA256)throw Error('Comparison rejected: replay bytes differ.');
    const comparison=path.join(destination,'play/comparison');await fs.mkdir(comparison);
    const extra=captures.slice(POSES.length).map(p=>`<button data-pose="${p.name}" aria-pressed="false">${p.name.slice(0,2)} · ${p.name.slice(3).replaceAll('-',' ')}</button>`).join('');
    await fs.writeFile(path.join(comparison,'index.html'),(await fs.readFile(path.join(here,'comparison.html'),'utf8')).replace('<!-- study-poses -->',extra));
    for(const pose of captures){
      await fs.copyFile(path.join(before,pose.name,'frame.png'),path.join(comparison,'before-'+pose.name+'.png'));
      await fs.copyFile(path.join(destination,pose.name,'frame.png'),path.join(comparison,'after-'+pose.name+'.png'));
    }
    await json(path.join(comparison,'identities.json'),{before:prior,after:identity,poses:captures});
  }
  if(argv.includes('--verify')){
    const {verify}=await import('./verify.mjs');await verify({Motor,doc,out:destination,motor,chrome:config.chrome,serve});
  }
  console.log(JSON.stringify({output:destination,play:path.join(destination,'play/index.html'),scene,sceneSHA256:identity.sceneSHA256,checks:argv.includes('--verify')?'passed':'not requested'},null,2));
  if(argv.includes('--serve')) {
    const server=serve(path.join(destination,'play'));await new Promise(r=>server.listen(0,'127.0.0.1',r));
    console.log(`INKBORN http://127.0.0.1:${server.address().port}/`);
    for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
  }
} catch(e) {console.error('INKBORN: '+e.message);process.exitCode=1;}
export function serve(root) {
  const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.wasm':'application/wasm','.png':'image/png','.mp4':'video/mp4'};
  return createServer(async(req,res)=>{try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
    if(!file.startsWith(root+path.sep))throw Error('outside output');
    const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}});
}
