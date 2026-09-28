#!/usr/bin/env node
// One scene, existing tools, private outputs. Never writes into a dependency.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {spawnSync,spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {buildRig} from './rig.mjs';
import {guide} from './state.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../..'),argv=process.argv.slice(2),option=k=>argv[argv.indexOf(k)+1];
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
if(argv.includes('--help')||!argv.includes('--config')||!argv.includes('--out')){console.log('node experiments/unprinted-garden/run.mjs --config /private/garden-tools.json --out /private/new-garden [--capture] [--verify] [--film] [--serve]\nPrivate config: absolute motorRoot, anidoodleRoot (pinned canvas-core source), chrome, ffmpeg, optional anchors and baseline directories. Existing tools only. Output must be new, outside Git.');process.exit(argv.includes('--help')?0:2);}
let server,browser;
try{
 const cfg=JSON.parse(await fs.readFile(path.resolve(option('--config')),'utf8'));
 for(const k of ['motorRoot','anidoodleRoot','chrome'])if(!path.isAbsolute(cfg[k]??''))throw Error('Configure an existing absolute '+k);
 const motor=await fs.realpath(cfg.motorRoot),up=await fs.realpath(cfg.anidoodleRoot),require=createRequire(path.join(motor,'package.json'));
 const esbuild=require('esbuild');
 const pinned=JSON.parse(await fs.readFile(path.join(here,'anidoodle-source.json')));for(const [f,want]of Object.entries(pinned.files))if(hash(await fs.readFile(path.join(up,f)))!==want)throw Error('Pinned anidoodle source mismatch: '+f);
 if(argv.includes('--film')&&!path.isAbsolute(cfg.ffmpeg??''))throw Error('--film requires an absolute path to installed ffmpeg');
 const Motor=await import(pathToFileURL(path.join(motor,'dist/motor.js')));
 const out=path.resolve(option('--out'));await fs.mkdir(path.dirname(out),{recursive:true});
 if(spawnSync('git',['-C',path.dirname(out),'rev-parse','--show-toplevel'],{encoding:'utf8'}).status===0)throw Error('Output must be outside Git.');
 await fs.mkdir(out);await fs.mkdir(path.join(out,'source'));for(const f of await fs.readdir(here))if(/\.(mjs|html|md|json)$/.test(f))await fs.copyFile(path.join(here,f),path.join(out,'source',f));const play=path.join(out,'play');await fs.mkdir(play);
 const doc=Motor.parseDocument(buildRig());Motor.compileDocument(doc);
 await json(path.join(out,'garden.motor.json'),doc);await json(path.join(play,'scene.json'),doc);await json(path.join(out,'replay.json'),{format:1,piece:'unprinted-garden',time:50,events:guide()});
 await fs.copyFile(path.join(motor,'dist/motor.js'),path.join(play,'motor-api.js'));
 await fs.copyFile(path.join(here,'player.html'),path.join(play,'index.html'));
 const alias={'@anidoodle/core':path.join(up,'core.ts'),'@anidoodle/bake':path.join(up,'bake.ts'),'@anidoodle/music/plan':path.join(up,'music/plan.ts'),'@anidoodle/music/render':path.join(up,'music/render.ts')};
 await esbuild.build({entryPoints:[path.join(here,'player.mjs')],outfile:path.join(play,'player.js'),bundle:true,format:'esm',platform:'browser',external:['./motor-api.js'],alias,logLevel:'warning'});
 const scoreFile=path.join(out,'score.mjs');await esbuild.build({entryPoints:[path.join(here,'score.mjs')],outfile:scoreFile,bundle:true,format:'esm',platform:'node',alias,logLevel:'warning'});
 const {renderScore,score}=await import(pathToFileURL(scoreFile));const music=renderScore(),sr=24000,n=music.L.length,wav=Buffer.alloc(44+n*4);
 wav.write('RIFF',0);wav.writeUInt32LE(36+n*4,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);let peak=0,energy=0;
 for(let i=0;i<n;i++)for(let ch=0;ch<2;ch++){const v=(ch?music.R:music.L)[i];if(!Number.isFinite(v))throw Error('Non-finite score sample');peak=Math.max(peak,Math.abs(v));energy+=v*v;wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*4+ch*2);}
 await fs.writeFile(path.join(play,'score.wav'),wav);await json(path.join(out,'score.json'),score());await json(path.join(out,'sound-check.json'),{duration:n/sr,sampleRate:sr,channels:2,samplePeak:peak,rms:Math.sqrt(energy/(2*n)),master:music.masterMode,gainDb:music.gainDb,listening:'not established by measurements'});
 for(const f of ['LICENSE','NOTICE'])await fs.copyFile(path.join(repo,'third_party/anidoodle',f),path.join(play,'anidoodle-'+f+'.txt'));
 const sources={};for(const f of (await fs.readdir(here)).sort())if(/\.(mjs|html|md|json)$/.test(f))sources[f]=hash(await fs.readFile(path.join(here,f)));
 for(const f of ['art.mjs','marks.mjs','gesture.mjs'])sources['../inkborn/'+f]=hash(await fs.readFile(path.join(here,'../inkborn',f)));
 const usedUpstream={};for(const f of ['core.ts','bake.ts',...['render','plan','perform','dsp','instruments','theory','meter','guards','piano','tables'].map(n=>'music/'+n+'.ts')])usedUpstream[f]=hash(await fs.readFile(path.join(up,f)));
 const bundle=JSON.parse(await fs.readFile(path.join(motor,'bundle.json'))),identity={format:1,foundryBase:'fc602cc4317292cf3f1a60faf25cf12d3f7526cc',sourceSHA256:hash(JSON.stringify(sources)),foundryHead:spawnSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).stdout.trim(),sources,motorSource:bundle.source,motorRuntimeSHA256:hash(await fs.readFile(path.join(motor,'dist/motor.js'))),anidoodle:'03ddf534328962f8a91eb115e3ae67e03da4de5a',upstream:usedUpstream,sceneSHA256:hash(await fs.readFile(path.join(play,'scene.json'))),replaySHA256:hash(await fs.readFile(path.join(out,'replay.json'))),audioSHA256:hash(wav)};
 await json(path.join(out,'identity.json'),identity);
 const comparison=path.join(play,'comparison');await fs.mkdir(comparison);
 if(cfg.anchors)for(const f of ['wren.png','pocketWatch.png','lighthouse.png','identity.json'])await fs.copyFile(path.join(cfg.anchors,f),path.join(comparison,f));
 if(cfg.baseline)await fs.copyFile(path.join(cfg.baseline,'03-unfurled/frame.png'),path.join(comparison,'baseline.png'));
 const figure=(file,title,caption)=>`<figure><a href="${file}.png"><img src="${file}.png" alt="${title}"></a><figcaption><strong>${title}</strong><span>${caption}</span></figcaption></figure>`;
 await fs.writeFile(path.join(comparison,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Garden · material and world comparison</title><style>*{box-sizing:border-box}body{margin:0;background:#f4efe1;color:#283b40;font:17px/1.45 Georgia;padding:38px}main{max-width:1720px;margin:auto}h1{font-weight:400;font-size:44px;margin:16px 0 8px}h2{font:12px system-ui;letter-spacing:.14em;text-transform:uppercase;border-top:1px solid #adb2a1;padding-top:22px;margin-top:28px}p{max-width:1150px}a{color:inherit}.pair,.anchors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.anchors{grid-template-columns:repeat(3,minmax(0,1fr))}figure{margin:0;min-width:0}img{display:block;width:100%;height:auto}figcaption{padding:9px 0 18px}strong,span{display:block}span{font:13px/1.5 system-ui;color:#586b61;margin-top:3px}.anchors img{aspect-ratio:1;object-fit:contain}@media(max-width:700px){body{padding:18px}.pair,.anchors{grid-template-columns:1fr}h1{font-size:30px}}</style><main><a href="../">Play the garden</a><h1>A line becomes a world</h1><p>Actual rendered output. The retained INKBORN pose is the starting point; the Garden follows a viewer's recorded stroke through printing, emergence and a persistent habitat. Click any plate for its original resolution.</p><h2>Retained baseline → created world</h2><section class="pair">${cfg.baseline?figure('baseline','INKBORN · retained baseline','fc602cc · the original press transformation.'):''}${figure('03-garden','The Unprinted Garden · wide reveal','The recorded bend becomes the watercourse and planting structure.')}</section><h2>From the printing bed to a living mark</h2><section class="pair">${figure('01-opening','1 · The line on the press','The opening preserves the actual drawn stroke.')}${figure('02-emergence','2 · The first living impression','A fragment of that same line becomes the body of the new organism.')}</section>${cfg.anchors?`<h2>Original upstream craft anchors · anidoodle 03ddf534</h2><section class="anchors">${figure('pocketWatch','Engraved form','Directional line density, recess and preserved light.')}${figure('wren','Line and wet pigment','Selective contour, displacement, pooled colour and paper.')}${figure('lighthouse','Depth through overlapping masses','Different distances and materials separate the composition.')}</section><p><span>Original comparison plates rendered from alexgreensh/anidoodle, Apache-2.0. These subjects are references, not Garden assets. Different framing and subject matter; no cross-renderer pixel match is claimed.</span></p>`:''}</main></html>`);

 server=serve(play);await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 if(argv.includes('--capture')||argv.includes('--verify')||argv.includes('--film')){
  const {chromium}=require('playwright');browser=await chromium.launch({executablePath:cfg.chrome,headless:true});const context=await browser.newContext({viewport:{width:1600,height:1200},deviceScaleFactor:1}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.garden?.ready,{},{timeout:180000});
  await page.evaluate(e=>window.garden.load(e),guide());
  if(argv.includes('--capture')){await page.evaluate(()=>window.garden.resolution(2400,1500));for(const [name,t]of [['01-opening',11.8],['02-emergence',18.5],['03-garden',48]]){await page.evaluate(t=>window.garden.seek(t),t);const data=await page.evaluate(()=>window.garden.savePlate());await fs.writeFile(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));await fs.copyFile(path.join(out,name+'.png'),path.join(comparison,name+'.png'));}await page.evaluate(()=>window.garden.resolution(1600,1000));const comparisonPage=await context.newPage();await comparisonPage.setViewportSize({width:1800,height:1200});await comparisonPage.goto(url+'comparison/');await comparisonPage.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));await comparisonPage.screenshot({path:path.join(out,'comparison.png'),fullPage:true});await fs.copyFile(path.join(out,'comparison.png'),path.join(comparison,'comparison.png'));await comparisonPage.close();}
  if(argv.includes('--verify')){const {verify}=await import('./verify.mjs');await verify({page,out,Motor,doc});}
  if(argv.includes('--film')){
   const fps=24,frames=1201,video=path.join(play,'replay.mp4');
   await page.evaluate(()=>window.garden.resolution(1280,800));
   const encoder=spawn(cfg.ffmpeg,['-v','error','-n','-f','image2pipe','-vcodec','png','-framerate',String(fps),'-i','pipe:0','-i',path.join(play,'score.wav'),'-filter_complex','[1:a]asplit=2[head][tail];[head]atrim=0:9,asetpts=PTS-STARTPTS[first];[tail]atrim=start=9,asetpts=PTS-STARTPTS[rest];anullsrc=r=24000:cl=stereo,atrim=duration=2[silence];[first][silence][rest]concat=n=3:v=0:a=1,adelay=14000|14000[a]','-map','0:v','-map','[a]','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',video],{stdio:['pipe','ignore','pipe']});let error='';encoder.stderr.on('data',b=>error+=b);const completion=once(encoder,'close');
   for(let i=0;i<frames;i++){await page.evaluate(t=>window.garden.seek(t),i/fps);const data=await page.evaluate(()=>window.garden.savePlate());if(!encoder.stdin.write(Buffer.from(data.split(',')[1],'base64')))await once(encoder.stdin,'drain');}encoder.stdin.end();const [code]=await completion;if(code!==0)throw Error('Film encoding failed: '+error);
   await json(path.join(out,'film.json'),{kind:'deterministic replay film; not live performance recording',fps,frames,duration:frames/fps,width:1280,height:800,audioPause:[23,25],sceneSHA256:identity.sceneSHA256,replaySHA256:identity.replaySHA256,videoSHA256:hash(await fs.readFile(video)),normalSpeedViewing:'not established',listening:'not established'});
  }
  if(errors.length)throw Error('Browser errors: '+errors.join('; '));await browser.close();browser=null;
 }
 console.log(JSON.stringify({output:out,url,identity:identity.sceneSHA256,sourceSHA256:identity.sourceSHA256,checks:argv.includes('--verify')?'passed':'not requested'},null,2));
 if(!argv.includes('--serve')){await new Promise(r=>server.close(r));server=null;}else for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
}catch(e){console.error('GARDEN: '+e.stack);await browser?.close();server?.close();process.exitCode=1;}
function serve(root){return createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),p=decodeURIComponent(url.pathname),file=path.resolve(root,'.'+(p.endsWith('/')?p+'index.html':p));if(!file.startsWith(root+path.sep))throw Error('outside output');const b=await fs.readFile(file),type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.wav':'audio/wav','.mp4':'video/mp4','.txt':'text/plain'}[path.extname(file)]??'application/octet-stream';res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(b);}catch{res.writeHead(404);res.end('Not found');}});}
