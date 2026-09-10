import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import sanitizeHtml from 'sanitize-html';
import archiver from 'archiver';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const ADMIN_USER = process.env.ADMIN_USER || 'editor';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ruta-digital-local';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';
const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_PROD = process.env.NODE_ENV === 'production';
const SEED_FILE = path.join(__dirname, 'seed', 'content.seed.json');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname,'data'));
const CONTENT_FILE = path.join(DATA_DIR,'content.json');
const UPLOAD_DIR = path.join(DATA_DIR,'uploads');
const pool = DATABASE_URL ? new Pool({ connectionString:DATABASE_URL, ssl:{rejectUnauthorized:false} }) : null;

fs.mkdirSync(DATA_DIR,{recursive:true}); fs.mkdirSync(UPLOAD_DIR,{recursive:true});
const seed = JSON.parse(fs.readFileSync(SEED_FILE,'utf8'));
if (!pool && !fs.existsSync(CONTENT_FILE)) fs.writeFileSync(CONTENT_FILE,JSON.stringify(seed,null,2));

const richTags=['p','br','b','strong','i','em','u','h2','h3','blockquote','ul','ol','li','a'];
const sanitizeOpts={allowedTags:richTags,allowedAttributes:{a:['href','target','rel']},allowedSchemes:['http','https','mailto'],transformTags:{a:sanitizeHtml.simpleTransform('a',{target:'_blank',rel:'noopener noreferrer'})}};
const collections=new Set(['videos','materials','capsules','notes','timeline','resources','news','libraryCollections']);
const rich=new Set(['capsules','notes']);

async function initDb(){
 if(!pool) return;
 await pool.query(`create table if not exists rd_content(id int primary key default 1, data jsonb not null, updated_at timestamptz not null default now());
 create table if not exists rd_media(id uuid primary key, name text not null, mime text not null, bytes bytea not null, size int not null, created_at timestamptz not null default now());`);
 const r=await pool.query('select id from rd_content where id=1');
 if(!r.rowCount) await pool.query('insert into rd_content(id,data) values(1,$1::jsonb)',[JSON.stringify(seed)]);
}
async function readContent(){
 if(pool){const r=await pool.query('select data from rd_content where id=1'); return r.rows[0]?.data||seed;}
 return JSON.parse(fs.readFileSync(CONTENT_FILE,'utf8'));
}
async function saveContent(data){
 if(pool){await pool.query('update rd_content set data=$1::jsonb,updated_at=now() where id=1',[JSON.stringify(data)]);return;}
 const tmp=CONTENT_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data,null,2));fs.renameSync(tmp,CONTENT_FILE);
}
const sort=(a=[])=>[...a].sort((x,y)=>(+x.position||9999)-(+y.position||9999));
async function publicContent(){const c=await readContent();const vis=a=>sort((a||[]).filter(x=>!['draft','hidden'].includes(x.status)));return{site:c.site||{},videos:vis(c.videos),materials:vis(c.materials),capsules:vis(c.capsules),notes:vis(c.notes),timeline:sort(c.timeline||[]),resources:sort(c.resources||[]),news:vis(c.news),libraryCollections:vis(c.libraryCollections)}};
function safeItem(col,body,old={}){const out={...old,...body};if(!out.id)out.id=`${col.slice(0,4)}-${crypto.randomUUID()}`;if(rich.has(col))out.bodyHtml=sanitizeHtml(String(out.bodyHtml||''),sanitizeOpts);['title','description','excerpt','author','category','tag','source','type','label','text','coverAlt','embedUrl','sourceUrl','url','imageUrl'].forEach(k=>{if(typeof out[k]==='string')out[k]=out[k].trim().slice(0,k==='description'||k==='excerpt'||k==='text'?1600:700)});out.position=Number(out.position)||1;out.updatedAt=new Date().toISOString();out.createdAt=old.createdAt||out.createdAt||out.updatedAt;return out}

const sessions=new Map();const attempts=new Map();
function hash(t){return crypto.createHmac('sha256',SESSION_SECRET).update(t).digest('hex')}
function auth(req,res,next){const raw=req.signedCookies.rd_session;if(!raw)return res.status(401).json({error:'AUTH_REQUIRED'});const s=sessions.get(hash(raw));if(!s||s.expires<Date.now())return res.status(401).json({error:'AUTH_REQUIRED'});next()}
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:80*1024*1024},fileFilter:(_r,f,cb)=>cb(null,/^(image\/(png|jpeg|webp|gif)|video\/(mp4|webm)|application\/pdf)$/.test(f.mimetype))});

const app=express();app.set('trust proxy',1);app.disable('x-powered-by');app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));app.use(express.json({limit:'8mb'}));app.use(cookieParser(SESSION_SECRET));
app.get('/health',(_q,r)=>r.json({ok:true,db:!!pool,service:'ruta-digital-cms'}));
app.get('/api/public/content',async(_q,r)=>{r.set('Cache-Control','no-store');r.json(await publicContent())});
app.get('/media/:id',async(req,res)=>{try{if(pool){const q=await pool.query('select name,mime,bytes,size from rd_media where id=$1',[req.params.id]);if(!q.rowCount)return res.sendStatus(404);const m=q.rows[0];res.set({'Content-Type':m.mime,'Content-Length':m.size,'Cache-Control':'public,max-age=31536000,immutable'});return res.end(m.bytes)}const p=path.join(UPLOAD_DIR,path.basename(req.params.id));if(!fs.existsSync(p))return res.sendStatus(404);return res.sendFile(p)}catch{res.sendStatus(404)}});

app.post('/api/auth/login',(req,res)=>{const ip=req.ip||'x',a=attempts.get(ip)||{n:0,until:0};if(a.until>Date.now())return res.status(429).json({message:'Espera unos minutos.'});const {user,password}=req.body||{};if(user!==ADMIN_USER||password!==ADMIN_PASSWORD){a.n++;if(a.n>=6){a.n=0;a.until=Date.now()+10*60e3}attempts.set(ip,a);return res.status(401).json({message:'Credenciales incorrectas.'})}attempts.delete(ip);const raw=crypto.randomBytes(32).toString('base64url');sessions.set(hash(raw),{expires:Date.now()+12*60*60e3});res.cookie('rd_session',raw,{signed:true,httpOnly:true,sameSite:'strict',secure:IS_PROD,maxAge:12*60*60e3,path:'/'});res.json({ok:true,user:ADMIN_USER})});
app.post('/api/auth/logout',auth,(req,res)=>{const raw=req.signedCookies.rd_session;if(raw)sessions.delete(hash(raw));res.clearCookie('rd_session',{path:'/'});res.json({ok:true})});
app.get('/api/auth/session',(req,res)=>{const raw=req.signedCookies.rd_session,s=raw?sessions.get(hash(raw)):null;if(!s||s.expires<Date.now())return res.status(401).json({authenticated:false});res.json({authenticated:true,user:ADMIN_USER})});
app.get('/api/admin/content',auth,async(_q,r)=>r.json(await readContent()));
app.put('/api/admin/site',auth,async(req,res)=>{const c=await readContent();c.site={...c.site,...req.body};await saveContent(c);res.json(c.site)});
app.post('/api/admin/media',auth,upload.single('file'),async(req,res)=>{if(!req.file)return res.status(400).json({message:'Archivo no válido.'});if(req.file.mimetype.startsWith('image/')&&req.file.size>8*1024*1024)return res.status(413).json({message:'Las imágenes no pueden superar 8 MB. Optimízala antes de subirla.'});const id=crypto.randomUUID();if(pool)await pool.query('insert into rd_media(id,name,mime,bytes,size) values($1,$2,$3,$4,$5)',[id,req.file.originalname,req.file.mimetype,req.file.buffer,req.file.size]);else fs.writeFileSync(path.join(UPLOAD_DIR,id),req.file.buffer);res.status(201).json({id,url:`/media/${id}`,name:req.file.originalname,mime:req.file.mimetype,size:req.file.size})});
app.post('/api/admin/:collection',auth,async(req,res)=>{const col=req.params.collection;if(!collections.has(col))return res.sendStatus(404);const c=await readContent();c[col] ||= [];const item=safeItem(col,req.body);if(!req.body.position)item.position=c[col].length+1;c[col].push(item);await saveContent(c);res.status(201).json(item)});
app.patch('/api/admin/:collection/:id',auth,async(req,res)=>{const col=req.params.collection;if(!collections.has(col))return res.sendStatus(404);const c=await readContent(),i=(c[col]||[]).findIndex(x=>x.id===req.params.id);if(i<0)return res.sendStatus(404);c[col][i]=safeItem(col,req.body,c[col][i]);await saveContent(c);res.json(c[col][i])});
app.delete('/api/admin/:collection/:id',auth,async(req,res)=>{const col=req.params.collection;if(!collections.has(col))return res.sendStatus(404);const c=await readContent();c[col]=(c[col]||[]).filter(x=>x.id!==req.params.id);await saveContent(c);res.json({ok:true})});
app.post('/api/admin/:collection/reorder',auth,async(req,res)=>{const col=req.params.collection;if(!collections.has(col)||!Array.isArray(req.body.ids))return res.status(400).json({error:'INVALID'});const c=await readContent(),map=new Map(req.body.ids.map((id,i)=>[id,i+1]));c[col]=(c[col]||[]).map((x,i)=>({...x,position:map.get(x.id)||i+1}));await saveContent(c);res.json(sort(c[col]))});

app.get('/api/admin/media',auth,async(_q,res)=>{if(pool){const q=await pool.query('select id,name,mime,size,created_at from rd_media order by created_at desc limit 100');return res.json({items:q.rows.map(x=>({...x,url:`/media/${x.id}`}))})}res.json({items:fs.readdirSync(UPLOAD_DIR).map(id=>({id,url:`/media/${id}`}))})});
app.get('/api/admin/export/content.json',auth,async(_q,res)=>{res.type('json').attachment('ruta-digital-content.json').send(JSON.stringify(await readContent(),null,2))});
app.get('/api/admin/export/site.zip',auth,async(_q,res)=>{const c=await readContent();res.attachment(`ruta-digital-${new Date().toISOString().slice(0,10)}.zip`);const z=archiver('zip',{zlib:{level:9}});z.pipe(res);z.file(path.join(__dirname,'server.js'),{name:'server.js'});z.file(path.join(__dirname,'package.json'),{name:'package.json'});z.directory(path.join(__dirname,'public'),'public');z.directory(path.join(__dirname,'seed'),'seed');z.append(JSON.stringify(c,null,2),{name:'data/content.json'});z.append('PORT=3000\nADMIN_USER=editor\nADMIN_PASSWORD=CAMBIAR\nSESSION_SECRET=CAMBIAR\nDATA_DIR=./data\n',{name:'.env.example'});z.append('Instalar Node.js 20+, ejecutar npm install --omit=dev y node server.js. El panel está en /admin/. Para servidor municipal sin DATABASE_URL se usa data/content.json y data/uploads/.',{name:'README_INSTALACION.txt'});await z.finalize()});
app.use(express.static(path.join(__dirname,'public'),{maxAge:IS_PROD?'5m':0,extensions:['html']}));
app.use((err,_q,res,_n)=>{console.error(err);if(err?.code==='LIMIT_FILE_SIZE')return res.status(413).json({message:'Máximo 80 MB por archivo.'});res.status(500).json({message:'Error interno.'})});
await initDb();app.listen(PORT,()=>console.log(`Ruta Digital CMS :${PORT} | db=${!!pool}`));
