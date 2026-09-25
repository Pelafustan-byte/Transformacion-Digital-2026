(()=>{'use strict';
const q=id=>document.getElementById(id),qa=(s,r=document)=>[...r.querySelectorAll(s)],esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modules=[
 {id:'videos',icon:'▶',title:'Minutos Digitales',text:'Videos y cápsulas'},
 {id:'base',icon:'DOC',title:'Insumos esenciales',text:'Documentos clave'},
 {id:'normativa',icon:'LEY',title:'Normativa',text:'Políticas y artículos'},
 {id:'capsulas',icon:'IDEA',title:'Cápsulas',text:'Contenido del equipo'},
 {id:'implementacion',icon:'26',title:'Implementación',text:'Avance municipal'},
 {id:'territorio',icon:'CTN',title:'Constitución',text:'Identidad local'},
 {id:'recursos',icon:'↗',title:'Biblioteca',text:'Fuentes oficiales'},
 {id:'notas',icon:'N',title:'Notas',text:'Orientaciones'},
 {id:'laboratorio',icon:'LAB',title:'Aprendizaje',text:'Quiz y simuladores'}
];
let currentModule='';
function relocateEvent(){
 const hero=q('hero'),brief=hero?.querySelector('.heroBrief'),copy=hero?.querySelector('.heroIn>div:first-child');
 if(!brief||!copy||brief.classList.contains('relocatedEvent'))return;
 brief.classList.add('relocatedEvent');copy.append(brief);
}
async function loadNews(){
 const sources=[
  fetch('/data/editorial.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
  fetch('/api/public/content',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
 ];
 const [editorial,api]=await Promise.all(sources);
 return (editorial?.news?.length?editorial.news:api?.news||[]).filter(n=>n?.title&&n?.url);
}
function buildTicker(news){
 if(!news.length)return;
 const header=document.querySelector('header');if(!header||q('radar-digital'))return;
 const ticker=document.createElement('aside');ticker.id='radar-digital';ticker.className='newsTicker';ticker.setAttribute('aria-label','Radar Digital: titulares de actualidad');
 const item=n=>`<a class="newsTickerItem" href="${esc(n.url)}" target="_blank" rel="noopener"><small>${esc(n.source||n.tag||'Actualidad')}</small><span>${esc(n.title)}</span><b aria-hidden="true">↗</b></a>`;
 const set=news.slice(0,8).map(item).join('');
 ticker.innerHTML=`<div class="newsTickerLabel"><i aria-hidden="true"></i><span>Radar Digital</span></div><div class="newsTickerViewport"><div class="newsTickerTrack">${set}${set}</div></div>`;
 header.insertAdjacentElement('afterend',ticker);
}
function buildModuleHub(){
 const anchor=q('videos'),after=q('herramientas');if(!anchor||!after||q('explorar'))return;
 const hub=document.createElement('section');hub.id='explorar';hub.className='moduleHub';
 hub.innerHTML=`<div class="shell"><div class="moduleHubHead"><div><small>Acceso modular</small><h2>Explora sólo lo que necesitas.</h2></div><p>El contenido completo sigue disponible, pero ya no se apila en una página interminable. Abre un módulo cuando lo necesites y ciérralo al terminar.</p></div><div class="moduleRail" role="list" aria-label="Módulos de Ruta Digital">${modules.map(m=>`<button class="modulePick" type="button" data-module="${m.id}" role="listitem" aria-expanded="false"><span class="moduleIcon">${m.icon}</span><span><strong>${m.title}</strong><small>${m.text}</small></span></button>`).join('')}</div><p class="moduleHint"><i></i>Selecciona un módulo para desplegarlo<i></i></p></div>`;
 after.insertAdjacentElement('afterend',hub);
 modules.forEach(m=>{
   const section=q(m.id);if(!section)return;
   section.classList.add('module-managed','module-closed');
   const shell=section.querySelector(':scope > .shell');
   if(shell&&!shell.querySelector('.moduleActiveBar')){
     const bar=document.createElement('div');bar.className='moduleActiveBar';
     bar.innerHTML=`<span>Módulo abierto · <b>${esc(m.title)}</b></span><button type="button" data-close-module>Cerrar módulo ↑</button>`;
     shell.prepend(bar);
   }
 });
 q('noticias')?.classList.remove('module-managed','module-open');
 q('noticias')?.classList.add('module-closed');
}
function setButtons(id){
 qa('.modulePick').forEach(b=>{const on=b.dataset.module===id;b.classList.toggle('on',on);b.setAttribute('aria-expanded',on?'true':'false')});
}
function openModule(id,{scroll=true,hash=true}={}){
 if(!modules.some(m=>m.id===id))return;
 modules.forEach(m=>{const s=q(m.id);if(!s)return;s.classList.toggle('module-open',m.id===id);s.classList.toggle('module-closed',m.id!==id)});
 currentModule=id;setButtons(id);
 if(hash&&location.hash!=='#'+id)history.replaceState(null,'','#'+id);
 if(scroll)setTimeout(()=>q(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}),40);
}
function closeModules({scroll=true}={}){
 modules.forEach(m=>{const s=q(m.id);if(s){s.classList.remove('module-open');s.classList.add('module-closed')}});currentModule='';setButtons('');
 if(location.hash&&modules.some(m=>'#'+m.id===location.hash))history.replaceState(null,'','#explorar');
 if(scroll)setTimeout(()=>q('explorar')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
}
function handleHash({initial=false}={}){
 const id=location.hash.replace('#','').split('/')[0];
 if(modules.some(m=>m.id===id))openModule(id,{scroll:!initial,hash:false});
 else if(id==='noticias'||id==='radar-digital'){q('radar-digital')?.scrollIntoView({behavior:initial?'auto':'smooth',block:'start'});}
}
function bind(){
 document.addEventListener('click',e=>{
   const pick=e.target.closest('[data-module]');if(pick){openModule(pick.dataset.module);return}
   if(e.target.closest('[data-close-module]')){closeModules();return}
 });
 window.addEventListener('hashchange',()=>handleHash());
}

function initFedokCarousel(){
 const root=q('fedokCarousel');if(!root)return;
 const track=root.querySelector('.fedokCarouselTrack'),slides=qa('.fedokSlide',root),dots=qa('[data-fedok-slide]',root),current=q('fedokSlideCurrent');
 if(!track||slides.length<2)return;
 let index=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const set=i=>{
   index=(i+slides.length)%slides.length;
   track.style.transition=reduced?'none':'transform .45s ease';
   track.style.transform=`translateX(-${index*100}%)`;
   slides.forEach((s,n)=>s.classList.toggle('is-active',n===index));
   dots.forEach((d,n)=>d.classList.toggle('on',n===index));
   if(current)current.textContent=String(index+1);
 };
 root.querySelector('.fedokPrev')?.addEventListener('click',()=>set(index-1));
 root.querySelector('.fedokNext')?.addEventListener('click',()=>set(index+1));
 dots.forEach(d=>d.addEventListener('click',()=>set(Number(d.dataset.fedokSlide)||0)));
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')set(index-1);if(e.key==='ArrowRight')set(index+1)});
 let touchX=null;
 root.addEventListener('touchstart',e=>{touchX=e.touches?.[0]?.clientX??null},{passive:true});
 root.addEventListener('touchend',e=>{if(touchX==null)return;const x=e.changedTouches?.[0]?.clientX??touchX,dx=x-touchX;touchX=null;if(Math.abs(dx)>45)set(index+(dx<0?1:-1))},{passive:true});
 set(0);
}

function updateNav(){
 const nav=document.querySelector('#nav');if(!nav)return;
 const news=nav.querySelector('a[href="#noticias"]');if(news)news.href='#radar-digital';
}
async function init(){
 relocateEvent();updateNav();buildModuleHub();bind();initFedokCarousel();handleHash({initial:true});
 try{buildTicker(await loadNews())}catch(e){console.error('ticker',e)}
 if(location.hash==='#noticias'||location.hash==='#radar-digital')setTimeout(()=>q('radar-digital')?.scrollIntoView({block:'start'}),80);
 window.routeModules={open:openModule,close:closeModules,current:()=>currentModule};
}
init();
})();