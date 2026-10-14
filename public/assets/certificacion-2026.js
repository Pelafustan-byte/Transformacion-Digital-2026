(()=>{
 const root=document.getElementById('certificacionCarousel');
 if(!root)return;
 const track=document.getElementById('certificacionTrack');
 const dots=document.getElementById('certificacionDots');
 const current=document.getElementById('certificacionSlideCurrent');
 const total=document.getElementById('certificacionSlideTotal');
 const status=document.getElementById('certificacionGalleryStatus');
 const prev=root.querySelector('.certPrev'),next=root.querySelector('.certNext');
 let photos=[],index=0,autoplay=null,waits=0,startX=null;
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const move=n=>{
  if(!photos.length)return;
  index=(n+photos.length)%photos.length;
  track.style.transform='translateX(-'+(index*100)+'%)';
  track.querySelectorAll('figure').forEach((el,i)=>el.classList.toggle('is-active',i===index));
  dots.querySelectorAll('button').forEach((el,i)=>{el.classList.toggle('on',i===index);el.setAttribute('aria-selected',i===index?'true':'false')});
  current.textContent=String(index+1);
 };
 const pause=()=>{clearInterval(autoplay);autoplay=null};
 const play=()=>{pause();if(!reduced&&photos.length>1&&!document.hidden)autoplay=setInterval(()=>move(index+1),5700)};
 const interact=n=>{move(n);play()};
 async function load(){
  try{
   const r=await fetch('/api/public/certificacion-photos',{cache:'no-store'});
   if(!r.ok)throw new Error('No se pudo cargar la galería');
   const data=await r.json();
   if(!data.ready||!Array.isArray(data.photos)||data.photos.length!==16){
    if(++waits<90){status.textContent='Subiendo fotografías a Cloudflare R2...';setTimeout(load,4000)}
    else{status.textContent='Galería temporalmente no disponible';track.querySelector('.certificacionLoading').textContent='Fotografías en preparación. Actualiza esta página en unos minutos.'}
    return;
   }
   photos=data.photos;
   track.innerHTML=photos.map((p,i)=>'<figure class="fedokSlide'+(i===0?' is-active':'')+(p.originalPosition===16?' is-poster':'')+'"><img src="'+escape(p.url)+'" alt="'+escape(p.alt)+'" loading="'+(i===0?'eager':'lazy')+'" decoding="async"><figcaption><b>'+String(i+1).padStart(2,'0')+'</b> <span>'+escape(p.caption)+'</span></figcaption></figure>').join('');
   dots.innerHTML=photos.map((p,i)=>'<button type="button" data-cert-slide="'+i+'" role="tab" aria-label="Ver fotografía '+(i+1)+'" aria-selected="'+(i===0?'true':'false')+'" class="'+(i===0?'on':'')+'"></button>').join('');
   total.textContent=String(photos.length);
   status.textContent=photos.length+' fotografías · Cloudflare R2';
   prev.disabled=false;next.disabled=false;
   move(0);play();
  }catch(e){
   if(++waits<45){status.textContent='Preparando galería...';setTimeout(load,6000)}
   else{status.textContent='No fue posible cargar las fotografías';}
  }
 }
 prev.addEventListener('click',()=>interact(index-1));
 next.addEventListener('click',()=>interact(index+1));
 dots.addEventListener('click',e=>{const b=e.target.closest('[data-cert-slide]');if(b)interact(Number(b.dataset.certSlide))});
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();interact(index-1)}if(e.key==='ArrowRight'){e.preventDefault();interact(index+1)}});
 root.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null},{passive:true});
 root.addEventListener('touchend',e=>{if(startX===null)return;const delta=(e.changedTouches[0]?.clientX??startX)-startX;if(Math.abs(delta)>50)interact(index+(delta<0?1:-1));startX=null},{passive:true});
 root.addEventListener('mouseenter',pause);root.addEventListener('mouseleave',play);
 root.addEventListener('focusin',pause);root.addEventListener('focusout',play);
 document.addEventListener('visibilitychange',()=>document.hidden?pause():play());
 load();
})();