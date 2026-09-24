(()=>{
 const form=document.getElementById('contactForm');
 const status=document.getElementById('contactStatus');
 if(!form||!status)return;
 const button=form.querySelector('button[type="submit"]');
 const setStatus=(message,error=false)=>{status.textContent=message||'';status.classList.toggle('is-error',!!error)};
 form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  setStatus('');
  if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form).entries());
  button.disabled=true;
  const old=button.querySelector('span')?.textContent||'Enviar formulario';
  if(button.querySelector('span'))button.querySelector('span').textContent='Enviando…';
  try{
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
   const body=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(body.message||'No fue posible enviar el formulario.');
   form.reset();
   setStatus(body.message||'Tu solicitud fue recibida correctamente.');
  }catch(error){
   setStatus(error?.message||'No fue posible enviar el formulario. Intenta nuevamente.',true);
  }finally{
   button.disabled=false;
   if(button.querySelector('span'))button.querySelector('span').textContent=old;
  }
 });
})();