const FALLBACKS={
  'gestión documental':'/assets/illustrations/document.svg',
  'expediente electrónico':'/assets/illustrations/expedient.svg',
  'firma electrónica':'/assets/images/illustration-signature.svg',
  'docdigital':'/assets/illustrations/docdigital.svg',
  'notificaciones electrónicas':'/assets/illustrations/notifications.svg',
  'interoperabilidad':'/assets/illustrations/interoperability.svg',
  'identidad digital':'/assets/images/illustration-identity.svg',
  'autenticación':'/assets/illustrations/authentication.svg',
  'ciberseguridad':'/assets/images/illustration-security.svg',
  'protección de datos':'/assets/illustrations/privacy.svg',
  'gestión del cambio':'/assets/illustrations/change.svg',
  'capacitación':'/assets/illustrations/training.svg',
  'implementación municipal':'/assets/images/illustration-implementation.svg',
  'gobierno digital':'/assets/illustrations/government.svg'
};
const fallbackFor=label=>{
  const key=String(label||'').toLocaleLowerCase('es');
  return Object.entries(FALLBACKS).find(([name])=>key.includes(name))?.[1]||'/assets/illustrations/government.svg';
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
  if(!img.getAttribute('alt'))img.alt=label||'';
  img.addEventListener('error',()=>{const next=fallbackFor(label);if(!img.src.endsWith(next)){img.src=next;img.closest('.capImage,.noteImage,figure')?.classList.add('image-failed')}});
}
function decorate(){
  document.querySelectorAll('.baseCard').forEach(card=>{if(card.querySelector('.materialIcon'))return;const type=card.querySelector('small')?.textContent?.trim()||'Documento';const el=document.createElement('span');el.className='materialIcon';el.innerHTML=icon(type);card.prepend(el)});
  document.querySelectorAll('.capCard').forEach(card=>{const label=card.querySelector('small')?.textContent||'';let host=card.querySelector('.capImage');if(!host){host=document.createElement('div');host.className='capImage fallbackArt';host.innerHTML=`<img src="${fallbackFor(label)}" alt="Ilustración temática: ${label.split('·')[0].trim()}">`;card.prepend(host)}decorateImage(host.querySelector('img'),label)});
  document.querySelectorAll('.noteCard').forEach(card=>{const label=card.querySelector('small')?.textContent||'Nota institucional';let host=card.querySelector('.noteImage');if(!host){host=document.createElement('div');host.className='noteImage fallbackArt';host.innerHTML=`<img src="/assets/illustrations/government.svg" alt="Ilustración institucional de apoyo">`;card.prepend(host)}decorateImage(host.querySelector('img'),label)});
  document.querySelectorAll('.territoryGrid img,.dialogHero').forEach(img=>decorateImage(img,img.closest('figure')?.querySelector('figcaption')?.textContent||'Imagen institucional'));
  document.querySelectorAll('a[target="_blank"]').forEach(a=>{if(!a.rel.includes('noopener'))a.rel='noopener noreferrer'});
}
const nav=document.getElementById('nav'),menu=document.getElementById('menu');
if(nav&&!nav.querySelector('.adminLink')){const a=document.createElement('a');a.href='/admin/';a.className='adminLink';a.textContent='Administración';nav.append(a)}
if(menu){menu.setAttribute('aria-controls','nav');menu.setAttribute('aria-expanded','false');menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',document.body.classList.contains('open')?'true':'false'));nav?.addEventListener('click',e=>{if(e.target.closest('a')){document.body.classList.remove('open');menu.setAttribute('aria-expanded','false')}})}
const observer=new MutationObserver(decorate);['materialsGrid','capsuleGrid','notesGrid'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true})});
window.addEventListener('load',decorate,{once:true});
