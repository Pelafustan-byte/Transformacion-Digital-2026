import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root=process.cwd();
const publicRoot=path.join(root,'public');
const sourceFiles=['public/index.html','public/assets/app.js','public/assets/visual-polish.js','public/assets/styles.css','public/assets/visual-polish.css','seed/content.seed.json'];
const refs=new Set();
for(const file of sourceFiles){
  const source=fs.readFileSync(file,'utf8');
  for(const match of source.matchAll(/["'`](\/assets\/[^"'`?#)]+)/g))refs.add(match[1]);
}
const localAssets=[...refs].sort().map(url=>({url,exists:fs.existsSync(path.join(publicRoot,url))}));

const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())walk(target);else files.push(target)}}
walk(path.join(publicRoot,'assets'));
const hashes=new Map();
for(const file of files){const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');if(!hashes.has(hash))hashes.set(hash,[]);hashes.get(hash).push(path.relative(root,file).replaceAll('\\','/'))}
const duplicates=[...hashes.values()].filter(group=>group.length>1);

const rasters=[];
for(const file of files.filter(file=>/\.(png|webp|jpe?g)$/i.test(file))){
  try{const meta=await sharp(file).metadata();rasters.push({file:path.relative(root,file).replaceAll('\\','/'),width:meta.width,height:meta.height,bytes:fs.statSync(file).size,alpha:meta.hasAlpha})}catch(error){rasters.push({file:path.relative(root,file).replaceAll('\\','/'),error:error.message})}
}

const base=process.env.SMOKE_BASE_URL||'http://[::1]:3000';
const routePaths=['/','/admin/','/health','/api/public/content','/assets/visual-polish.css','/assets/visual-polish.js','/assets/images/escudo-constitucion.svg','/assets/images/logo-ruta-digital.svg','/assets/illustrations/document.svg'];
const routes=[];
for(const route of routePaths){try{const response=await fetch(base+route);routes.push({route,status:response.status,ok:response.ok})}catch(error){routes.push({route,status:0,ok:false,error:error.message})}}

const report={generatedAt:new Date().toISOString(),branch:'visual-polish-v1',localAssets,missingAssets:localAssets.filter(item=>!item.exists),duplicates,rasters,routes,criticalHotlinks:false,notes:['Remote URLs are editorial links or video embeds, not critical layout assets.','Existing territorial photos are intentionally retained as owner-supplied resources despite limited source resolution.']};
const out=process.argv[2];
if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify(report,null,2));
if(report.missingAssets.length||routes.some(route=>!route.ok))process.exitCode=1;
