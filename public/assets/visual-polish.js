const PLATES='/assets/illustrations/transformacion-digital/';
const FALLBACKS={
  'gestión documental':PLATES+'gestion-documental.svg',
  'expediente electrónico':PLATES+'expediente-electronico.svg',
  'firma electrónica':PLATES+'firma-electronica.svg',
  'docdigital':PLATES+'docdigital.svg',
  'fedok':PLATES+'expediente-electronico.svg',
  'notificaciones electrónicas':PLATES+'notificaciones-electronicas.svg',
  'interoperabilidad':PLATES+'interoperabilidad.svg',
  'identidad digital':PLATES+'identidad-digital-claveunica.svg',
  'claveúnica':PLATES+'identidad-digital-claveunica.svg',
  'autenticación':PLATES+'identidad-digital-claveunica.svg',
  'ciberseguridad':PLATES+'ciberseguridad.svg',
  'seguridad':PLATES+'ciberseguridad.svg',
  'protección de datos':PLATES+'proteccion-datos.svg',
  'atención ciudadana':PLATES+'atencion-ciudadana-digital.svg',
  'gestión del cambio':PLATES+'gestion-del-cambio.svg',
  'capacitación':PLATES+'capacitacion.svg',
  'implementación municipal':PLATES+'identidad-municipal.svg',
  'implementación':PLATES+'identidad-municipal.svg',
  'gobierno digital':PLATES+'transformacion-digital-estado.svg'
};
const fallbackFor=label=>{
  const key=String(label||'').toLocaleLowerCase('es');
  return Object.entries(FALLBACKS).find(([name])=>key.includes(name))?.[1]||PLATES+'transformacion-digital-estado.svg';
};
const icon=(name)=>{
  const paths={
    Documento:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    Presentación:'<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21l4-4 4 4M7 9h10M7 12h6"/>',
    Normativa:'<path d="M4 21h16M6 17h12M8 17V9m4 8V9m4 8V9M5 9h14L12 3z"/>',
    'Guías oficiales':'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 6h8M8 10h8"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.Documento}</svg>`;
};
function decorateImage(img,label){
  if(img.dataset.robust==='1')return;
  img.dataset.robust='1';img.loading=img.closest('.hero')?'eager':'lazy';img.decoding='async';
  // El alt lo define quien edita (campo "Texto alternativo de portada" en /admin/).
  // Antes se rellenaba con la cadena de metadatos —"Gestión documental · 10 sept 2026"—
  // y un lector de pantalla recibía una fecha en vez de una descripción. Si no hay
  // alt editorial, la imagen es decorativa y se marca como tal.
  if(img.getAttribute('alt')===null)img.alt='';
  img.addEventListener('error',()=>{
    const next=fallbackFor(label);
    if(!img.src.endsWith(next)){
      img.src=next;
      img.classList.remove('photo');img.classList.add('plate');
      const host=img.closest('.capImage,.noteImage,figure');
      if(host){host.classList.add('image-failed','hasPlate')}
      if(!img.getAttribute('alt'))img.alt=`Ilustración temática: ${String(label||'').split('·')[0].trim()||'recurso institucional'}`;
    }
  });
}
function decorate(){
  document.querySelectorAll('.baseCard').forEach(card=>{if(card.querySelector('.materialIcon'))return;const type=card.querySelector('small')?.textContent?.trim()||'Documento';const el=document.createElement('span');el.className='materialIcon';el.innerHTML=icon(type);card.prepend(el)});
  document.querySelectorAll('.capCard').forEach(card=>{const label=card.querySelector('small')?.textContent||'';let host=card.querySelector('.capImage');if(!host){host=document.createElement('div');host.className='capImage fallbackArt hasPlate';const image=document.createElement('img');image.src=fallbackFor(label);image.className='plate';image.width=1200;image.height=750;image.alt=`Ilustración temática: ${label.split('·')[0].trim()}`;host.append(image);card.prepend(host)}decorateImage(host.querySelector('img'),label)});
  document.querySelectorAll('.noteCard').forEach(card=>{const label=card.querySelector('small')?.textContent||'Nota institucional';let host=card.querySelector('.noteImage');if(!host){host=document.createElement('div');host.className='noteImage fallbackArt hasPlate';const image=document.createElement('img');image.src='/assets/illustrations/transformacion-digital/identidad-municipal.svg';image.className='plate';image.width=1200;image.height=750;image.alt='Ilustración institucional de apoyo';host.append(image);card.prepend(host)}decorateImage(host.querySelector('img'),label)});
  document.querySelectorAll('.territoryGrid img,.dialogHero').forEach(img=>decorateImage(img,img.closest('figure')?.querySelector('figcaption')?.textContent||'Imagen institucional'));
  document.querySelectorAll('a[target="_blank"]').forEach(a=>{if(!a.rel.includes('noopener'))a.rel='noopener noreferrer'});
}
const nav=document.getElementById('nav'),menu=document.getElementById('menu');
if(nav&&!nav.querySelector('.adminLink')){const a=document.createElement('a');a.href='/admin/';a.className='adminLink';a.textContent='Administración';nav.append(a)}
if(menu){menu.setAttribute('aria-controls','nav');menu.setAttribute('aria-expanded','false');menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',document.body.classList.contains('open')?'true':'false'));nav?.addEventListener('click',e=>{if(e.target.closest('a')){document.body.classList.remove('open');menu.setAttribute('aria-expanded','false')}})}
const observer=new MutationObserver(decorate);['materialsGrid','capsuleGrid','notesGrid'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true})});
window.addEventListener('load',decorate,{once:true});
