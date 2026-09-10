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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const SEED_FILE = path.join(__dirname, 'seed', 'content.seed.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const ADMIN_USER = process.env.ADMIN_USER || 'editor';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ruta-digital-local';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-this-session-secret';
const IS_PROD = process.env.NODE_ENV === 'production';

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(CONTENT_FILE)) fs.copyFileSync(SEED_FILE, CONTENT_FILE);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser(SESSION_SECRET));

const sessions = new Map();
const loginAttempts = new Map();
const allowedCollections = new Set(['videos','materials','capsules','notes','timeline','resources','news','libraryCollections']);
const richTextCollections = new Set(['capsules','notes']);
const sanitizeOptions = {
  allowedTags: ['p','br','b','strong','i','em','h2','h3','blockquote','ul','ol','li','a'],
  allowedAttributes: { a: ['href','target','rel'] },
  allowedSchemes: ['http','https','mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }) },
};

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}
function atomicWrite(json) {
  const temp = `${CONTENT_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(json, null, 2), 'utf8');
  fs.renameSync(temp, CONTENT_FILE);
}
function backupContent() {
  const dir = path.join(DATA_DIR, 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(CONTENT_FILE, path.join(dir, `content-${stamp}.json`));
  const files = fs.readdirSync(dir).sort().reverse();
  for (const old of files.slice(15)) fs.rmSync(path.join(dir, old), { force: true });
}
function saveContent(json) {
  backupContent();
  atomicWrite(json);
}
function sortByPosition(list=[]) {
  return [...list].sort((a,b)=>(Number(a.position)||9999)-(Number(b.position)||9999));
}
function publicContent() {
  const c = readContent();
  const visible = arr => sortByPosition((arr || []).filter(x => x.status !== 'draft' && x.status !== 'hidden'));
  return {
    site: c.site || {},
    videos: visible(c.videos),
    materials: visible(c.materials),
    capsules: visible(c.capsules),
    notes: visible(c.notes),
    timeline: sortByPosition(c.timeline || []),
    resources: sortByPosition(c.resources || []),
    news: visible(c.news),
    libraryCollections: c.libraryCollections || [],
    updatedAt: fs.statSync(CONTENT_FILE).mtime.toISOString(),
  };
}
function sessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}
function hashToken(token) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex');
}
function requireAdmin(req,res,next) {
  const raw = req.signedCookies.rd_session;
  if (!raw) return res.status(401).json({ error:'AUTH_REQUIRED' });
  const session = sessions.get(hashToken(raw));
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(hashToken(raw));
    return res.status(401).json({ error:'AUTH_REQUIRED' });
  }
  req.admin = session;
  next();
}
function safeItem(collection, body, existing={}) {
  const out = { ...existing, ...body };
  delete out.__proto__;
  if (!out.id) out.id = `${collection.slice(0,4)}-${crypto.randomUUID()}`;
  if (richTextCollections.has(collection)) {
    out.bodyHtml = sanitizeHtml(String(out.bodyHtml || ''), sanitizeOptions);
  }
  for (const key of ['title','description','excerpt','author','category','tag','source','type','label','text','coverAlt']) {
    if (key in out && typeof out[key] === 'string') out[key] = out[key].trim().slice(0, key === 'text' || key === 'description' || key === 'excerpt' ? 900 : 180);
  }
  if ('position' in out) out.position = Number(out.position) || 1;
  out.updatedAt = new Date().toISOString();
  if (!existing.createdAt) out.createdAt = out.createdAt || out.updatedAt;
  return out;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req,_file,cb)=>cb(null,UPLOAD_DIR),
    filename: (_req,file,cb)=>{
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g,'');
      cb(null, `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext || '.bin'}`);
    }
  }),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req,file,cb)=> cb(null, /^image\/(png|jpeg|webp|gif)$/.test(file.mimetype)),
});

app.get('/health', (_req,res)=>res.json({ ok:true, service:'ruta-digital-cms' }));
app.get('/api/public/content', (_req,res)=>{
  res.set('Cache-Control','no-store');
  res.json(publicContent());
});
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge:'1h', etag:true }));

app.post('/api/auth/login', (req,res)=>{
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count:0, until:0 };
  if (attempt.until > now) return res.status(429).json({ error:'TOO_MANY_ATTEMPTS', message:'Espera unos minutos antes de volver a intentar.' });
  const { user, password } = req.body || {};
  const okUser = typeof user === 'string' && user.length === ADMIN_USER.length && crypto.timingSafeEqual(Buffer.from(user), Buffer.from(ADMIN_USER));
  const okPass = typeof password === 'string' && password.length === ADMIN_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
  if (!okUser || !okPass) {
    const count = attempt.count + 1;
    loginAttempts.set(ip, count >= 6 ? { count:0, until:now + 10*60*1000 } : { count, until:0 });
    return res.status(401).json({ error:'INVALID_CREDENTIALS', message:'Usuario o contraseña incorrectos.' });
  }
  loginAttempts.delete(ip);
  const raw = sessionToken();
  sessions.set(hashToken(raw), { user: ADMIN_USER, createdAt:now, expiresAt:now + 12*60*60*1000 });
  res.cookie('rd_session', raw, { signed:true, httpOnly:true, sameSite:'strict', secure:IS_PROD, maxAge:12*60*60*1000, path:'/' });
  res.json({ ok:true, user:ADMIN_USER });
});
app.post('/api/auth/logout', requireAdmin, (req,res)=>{
  const raw = req.signedCookies.rd_session;
  if (raw) sessions.delete(hashToken(raw));
  res.clearCookie('rd_session', { path:'/' });
  res.json({ ok:true });
});
app.get('/api/auth/session', (req,res)=>{
  const raw = req.signedCookies.rd_session;
  const s = raw ? sessions.get(hashToken(raw)) : null;
  if (!s || s.expiresAt < Date.now()) return res.status(401).json({ authenticated:false });
  res.json({ authenticated:true, user:s.user });
});

app.get('/api/admin/content', requireAdmin, (_req,res)=>res.json(readContent()));
app.put('/api/admin/site', requireAdmin, (req,res)=>{
  const content = readContent();
  const incoming = req.body || {};
  const allowed = Object.fromEntries(Object.entries(incoming).filter(([,v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'));
  content.site = { ...content.site, ...allowed };
  saveContent(content);
  res.json(content.site);
});
app.post('/api/admin/:collection', requireAdmin, (req,res)=>{
  const { collection } = req.params;
  if (!allowedCollections.has(collection)) return res.status(404).json({ error:'UNKNOWN_COLLECTION' });
  const content = readContent();
  content[collection] ||= [];
  const item = safeItem(collection, req.body || {});
  if (!('position' in item)) item.position = content[collection].length + 1;
  content[collection].push(item);
  saveContent(content);
  res.status(201).json(item);
});
app.patch('/api/admin/:collection/:id', requireAdmin, (req,res)=>{
  const { collection,id } = req.params;
  if (!allowedCollections.has(collection)) return res.status(404).json({ error:'UNKNOWN_COLLECTION' });
  const content = readContent();
  const index = (content[collection] || []).findIndex(x=>x.id === id);
  if (index < 0) return res.status(404).json({ error:'NOT_FOUND' });
  const item = safeItem(collection, req.body || {}, content[collection][index]);
  content[collection][index] = item;
  saveContent(content);
  res.json(item);
});
app.delete('/api/admin/:collection/:id', requireAdmin, (req,res)=>{
  const { collection,id } = req.params;
  if (!allowedCollections.has(collection)) return res.status(404).json({ error:'UNKNOWN_COLLECTION' });
  const content = readContent();
  const before = (content[collection] || []).length;
  content[collection] = (content[collection] || []).filter(x=>x.id !== id);
  if (content[collection].length === before) return res.status(404).json({ error:'NOT_FOUND' });
  saveContent(content);
  res.json({ ok:true });
});
app.post('/api/admin/:collection/reorder', requireAdmin, (req,res)=>{
  const { collection } = req.params;
  if (!allowedCollections.has(collection) || !Array.isArray(req.body?.ids)) return res.status(400).json({ error:'INVALID_REQUEST' });
  const content = readContent();
  const order = new Map(req.body.ids.map((id,i)=>[id,i+1]));
  content[collection] = (content[collection] || []).map((item,i)=>({ ...item, position: order.get(item.id) || i+1, updatedAt:new Date().toISOString() }));
  saveContent(content);
  res.json(sortByPosition(content[collection]));
});
app.post('/api/admin/media', requireAdmin, upload.single('image'), (req,res)=>{
  if (!req.file) return res.status(400).json({ error:'NO_IMAGE', message:'Selecciona una imagen JPG, PNG, WebP o GIF de hasta 12 MB.' });
  res.status(201).json({ url:`/uploads/${req.file.filename}`, name:req.file.originalname, size:req.file.size, mime:req.file.mimetype });
});
app.get('/api/admin/media', requireAdmin, (_req,res)=>{
  const items = fs.readdirSync(UPLOAD_DIR).filter(n=>!n.startsWith('.')).map(name=>{
    const stat = fs.statSync(path.join(UPLOAD_DIR,name));
    return { name, url:`/uploads/${name}`, size:stat.size, modifiedAt:stat.mtime.toISOString() };
  }).sort((a,b)=>b.modifiedAt.localeCompare(a.modifiedAt));
  res.json({ items });
});
app.get('/api/admin/export/content.json', requireAdmin, (_req,res)=>res.download(CONTENT_FILE, 'ruta-digital-content.json'));
app.get('/api/admin/export/site.zip', requireAdmin, (_req,res)=>{
  const stamp = new Date().toISOString().slice(0,10);
  res.attachment(`ruta-digital-constitucion-${stamp}.zip`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => { console.error(err); if (!res.headersSent) res.status(500).end(); else res.end(); });
  archive.pipe(res);
  archive.file(path.join(__dirname,'server.js'), { name:'server.js' });
  archive.file(path.join(__dirname,'package.json'), { name:'package.json' });
  archive.directory(path.join(__dirname,'public'), 'public');
  archive.directory(path.join(__dirname,'seed'), 'seed');
  archive.file(CONTENT_FILE, { name:'data/content.json' });
  if (fs.existsSync(UPLOAD_DIR)) archive.directory(UPLOAD_DIR, 'data/uploads');
  archive.append('PORT=3000\nADMIN_USER=editor\nADMIN_PASSWORD=CAMBIAR_ESTA_CLAVE\nSESSION_SECRET=CAMBIAR_POR_UNA_CADENA_LARGA_Y_ALEATORIA\nDATA_DIR=./data\n', { name:'.env.example' });
  archive.append(`RUTA DIGITAL CONSTITUCIÓN · PAQUETE PORTABLE\n\n1. Instalar Node.js 20 o superior.\n2. Ejecutar: npm install --omit=dev\n3. Definir variables de entorno ADMIN_USER, ADMIN_PASSWORD y SESSION_SECRET.\n4. Ejecutar: node server.js\n5. Publicar el puerto configurado (por defecto 3000) detrás de Apache/Nginx.\n6. Apuntar transformaciondigital.constitucion.cl al servidor o proxy correspondiente.\n\nLos contenidos están en data/content.json y las imágenes subidas por el editor en data/uploads/.\nEl panel editorial se encuentra en /admin/.\n`, { name:'README_INSTALACION.txt' });
  archive.finalize();
});
app.post('/api/admin/import', requireAdmin, (req,res)=>{
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object' || !incoming.site) return res.status(400).json({ error:'INVALID_BACKUP' });
  saveContent(incoming);
  res.json({ ok:true });
});

app.use(express.static(path.join(__dirname,'public'), { extensions:['html'], maxAge: IS_PROD ? '15m' : 0 }));
app.use((err,_req,res,_next)=>{
  console.error(err);
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error:'FILE_TOO_LARGE', message:'La imagen supera 12 MB.' });
  res.status(500).json({ error:'SERVER_ERROR', message:'Ocurrió un error interno.' });
});

app.listen(PORT, ()=>{
  console.log(`Ruta Digital CMS escuchando en :${PORT}`);
  if (IS_PROD && ADMIN_PASSWORD === 'ruta-digital-local') console.warn('ADVERTENCIA: define ADMIN_PASSWORD en producción.');
});
