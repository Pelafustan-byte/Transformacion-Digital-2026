(()=>{
 const BASE='/assets/photos/constitucion/';
 const defaults={
  heroPhoto:BASE+'rocas-arco-constitucion.webp',
  heroPhotoAlt:'Formaciones rocosas del borde costero de Constitución.',
  heroPhotoCaption:'Constitución · Región del Maule',
  municipalBridgePhoto:BASE+'municipalidad-diurna.webp',
  municipalBridgeAlt:'Edificio consistorial de la Municipalidad de Constitución.',
  territoryGallery:[
   {src:BASE+'rocas-arco-constitucion.webp',alt:'Formaciones rocosas del borde costero de Constitución.',caption:'Borde costero · identidad territorial',className:'territoryLead'},
   {src:BASE+'rio-puente-ciudad.webp',alt:'Vista del río Maule, el puente y la ciudad de Constitución.',caption:'Río Maule · territorio y conectividad',className:'territoryWide'},
   {src:BASE+'iglesia-constitucion.webp',alt:'Iglesia en el centro urbano de Constitución.',caption:'Centro urbano · comunidad e identidad',className:'territoryWide'},
   {src:BASE+'costa-rocas.webp',alt:'Costa y formaciones rocosas de Constitución.',caption:'Costa · entorno local',className:'territoryThird'},
   {src:BASE+'municipalidad-nocturna.webp',alt:'Edificio municipal de Constitución durante la tarde y noche.',caption:'Municipalidad · institución y servicio',className:'territoryThird territoryPortrait'},
   {src:BASE+'vista-aerea-borde-costero.webp',alt:'Vista aérea del borde costero y trama urbana de Constitución.',caption:'Ciudad y borde costero',className:'territoryThird territoryPortrait'}
  ]
 };
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 async function siteData(){
  try{const r=await fetch('/api/public/content',{cache:'no-store'});if(r.ok)return (await r.json()).site||{}}catch{}
  return{};
 }
 function addHero(s){
  const host=document.querySelector('#hero .heroIn');if(!host||host.querySelector('.heroPhoto'))return;
  const src=s.heroPhoto||defaults.heroPhoto,alt=s.heroPhotoAlt||defaults.heroPhotoAlt,cap=s.heroPhotoCaption||defaults.heroPhotoCaption;
  const f=document.createElement('figure');f.className='heroPhoto';f.innerHTML=`<img src="${esc(src)}" alt="${esc(alt)}" decoding="async"><figcaption>${esc(cap)}</figcaption>`;
  host.appendChild(f);
 }
 function addBridge(s){
  const rail=document.querySelector('#implementacion .localRail');if(!rail||document.querySelector('.municipalBridge'))return;
  const src=s.municipalBridgePhoto||defaults.municipalBridgePhoto,alt=s.municipalBridgeAlt||defaults.municipalBridgeAlt;
  const node=document.createElement('article');node.className='municipalBridge';node.innerHTML=`<figure><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></figure><div class="municipalBridgeCopy"><small>Constitución · implementación local</small><h3>La transformación digital se instala desde la gestión municipal.</h3><p>La tecnología, los flujos y la firma electrónica se implementan sobre procesos reales de la Municipalidad de Constitución. Esta identidad local acompaña el portal sin reemplazar el foco técnico de sus contenidos.</p></div>`;
  rail.insertAdjacentElement('afterend',node);
 }
 function renderTerritory(s){
  const grid=document.querySelector('#territorio .territoryGrid');if(!grid)return;
  const items=Array.isArray(s.territoryGallery)&&s.territoryGallery.length?s.territoryGallery:defaults.territoryGallery;
  grid.innerHTML=items.slice(0,6).map((x,i)=>`<figure class="${esc(x.className||(i===0?'territoryLead':'territoryThird'))}"><img src="${esc(x.src)}" alt="${esc(x.alt||'Constitución')}" loading="lazy" decoding="async"><figcaption>${esc(x.caption||'Constitución')}</figcaption></figure>`).join('');
 }
 async function enhance(){const s={...defaults,...await siteData()};addHero(s);addBridge(s);renderTerritory(s)}
 window.addEventListener('load',()=>setTimeout(enhance,180),{once:true});
})();
