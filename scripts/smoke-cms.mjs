import fs from 'node:fs';
import path from 'node:path';

const base=process.env.SMOKE_BASE_URL||'http://[::1]:3000';
const user=process.env.ADMIN_USER||'editor';
const password=process.env.ADMIN_PASSWORD||'ruta-digital-local';
let cookie='';
const created=[];
let uploadedId='';

async function request(url,options={}){
  const headers={...(options.headers||{})};
  if(cookie)headers.cookie=cookie;
  if(options.body&&!(options.body instanceof FormData))headers['content-type']='application/json';
  const response=await fetch(base+url,{...options,headers});
  if(!response.ok)throw new Error(`${options.method||'GET'} ${url}: ${response.status} ${await response.text()}`);
  const setCookie=response.headers.get('set-cookie');
  if(setCookie)cookie=setCookie.split(';')[0];
  const type=response.headers.get('content-type')||'';
  return type.includes('json')?response.json():response;
}

try{
  const health=await request('/health');
  await request('/api/auth/login',{method:'POST',body:JSON.stringify({user,password})});
  const admin=await request('/api/admin/content');
  if(!Array.isArray(admin.libraryCollections)||admin.libraryCollections.length<1)throw new Error('Colecciones no disponibles');

  const capsule=await request('/api/admin/capsules',{method:'POST',body:JSON.stringify({title:'Prueba técnica temporal',category:'Gestión documental',excerpt:'Registro temporal de verificación.',author:'Prueba automatizada',publishedAt:'2026-09-10',status:'draft',bodyHtml:'<p>Contenido temporal.</p>'})});
  created.push(['capsules',capsule.id]);
  await request(`/api/admin/capsules/${capsule.id}`,{method:'PATCH',body:JSON.stringify({...capsule,status:'published',title:'Prueba técnica temporal editada'})});
  const publicContent=await request('/api/public/content');
  if(!publicContent.capsules.some(item=>item.id===capsule.id))throw new Error('La cápsula publicada no llegó a la API pública');

  const note=await request('/api/admin/notes',{method:'POST',body:JSON.stringify({title:'Nota técnica temporal',excerpt:'Registro temporal de verificación.',author:'Prueba automatizada',publishedAt:'2026-09-10',status:'draft',bodyHtml:'<p>Contenido temporal.</p>'})});
  created.push(['notes',note.id]);
  await request(`/api/admin/notes/${note.id}`,{method:'PATCH',body:JSON.stringify({...note,status:'hidden',title:'Nota técnica temporal editada'})});

  const image=fs.readFileSync('public/assets/images/municipalidad.webp');
  const form=new FormData();
  form.append('file',new Blob([image],{type:'image/webp'}),'smoke-municipalidad.webp');
  const upload=await request('/api/admin/media',{method:'POST',body:form});
  uploadedId=upload.id;
  const media=await fetch(base+upload.url);
  if(!media.ok)throw new Error('El archivo subido no se puede leer');

  console.log(JSON.stringify({ok:true,health,capsule:'create/edit/public/delete',note:'create/edit/delete',upload:'upload/read/cleanup',collections:admin.libraryCollections.length},null,2));
}finally{
  for(const [collection,id] of created.reverse()){
    try{await request(`/api/admin/${collection}/${id}`,{method:'DELETE',body:'{}'})}catch(error){console.error('Cleanup item failed',collection,id,error.message)}
  }
  if(uploadedId){
    const target=path.resolve('data','uploads',uploadedId);
    const root=path.resolve('data','uploads')+path.sep;
    if(target.startsWith(root)&&fs.existsSync(target))fs.unlinkSync(target);
  }
}
