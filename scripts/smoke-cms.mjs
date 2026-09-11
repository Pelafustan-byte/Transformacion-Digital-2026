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

  // --- Biblioteca visual -------------------------------------------------
  const manifestResponse=await fetch(base+'/assets/assets-manifest.json');
  if(!manifestResponse.ok)throw new Error('El manifiesto de activos no se sirve');
  const manifest=await manifestResponse.json();
  if(!Array.isArray(manifest.assets)||!manifest.assets.length)throw new Error('El manifiesto no declara activos');

  // Cada activo declarado debe existir de verdad y responder.
  const missing=[];
  for(const asset of manifest.assets){
    const head=await fetch(base+asset.file,{method:'HEAD'});
    if(!head.ok)missing.push(`${asset.id} -> ${asset.file} (${head.status})`);
    if(!asset.thumbnail)missing.push(`${asset.id}: sin miniatura`);
    else{
      const thumb=await fetch(base+asset.thumbnail,{method:'HEAD'});
      if(!thumb.ok)missing.push(`${asset.id}: miniatura ausente (${thumb.status})`);
    }
    for(const field of ['license','sourcePage','retrievedAt','alt']){
      if(!asset[field])missing.push(`${asset.id}: falta ${field}`);
    }
    if(!asset.width||!asset.height)missing.push(`${asset.id}: sin dimensiones`);
  }
  if(missing.length)throw new Error('Activos con problemas:\n  '+missing.join('\n  '));

  // Metadatos editables: se superponen al manifiesto sin tocar la procedencia.
  const sample=manifest.assets[0];
  const savedMeta=await request('/api/admin/asset-meta/'+encodeURIComponent(sample.id),{method:'PUT',body:JSON.stringify({alt:'Texto alternativo de verificación',license:'LICENCIA FALSIFICADA'})});
  if(savedMeta.alt!=='Texto alternativo de verificación')throw new Error('El alt editable no se guardó');
  if('license' in savedMeta)throw new Error('La licencia NO debe poder editarse desde el panel');
  const allMeta=await request('/api/admin/asset-meta');
  if(!allMeta[sample.id])throw new Error('Los metadatos no se leen de vuelta');

  console.log(JSON.stringify({ok:true,health,capsule:'create/edit/public/delete',note:'create/edit/delete',upload:'upload/read/cleanup',collections:admin.libraryCollections.length,assets:{declared:manifest.assets.length,allPresent:true,metaOverlay:'ok',licenseImmutable:true}},null,2));
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
