(()=>{
  const byId=id=>document.getElementById(id);
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const shorten=(value,length=120)=>{const text=String(value??'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();return text.length>length?`${text.slice(0,length-1).trim()}…`:text};
  const externalAttrs='target="_blank" rel="noopener noreferrer"';
  let portalData=null;
  let lastDialogTrigger=null;

  function buildSearchIndex(data){
    const items=[];
    const add=(rows,type,section,options={})=>(rows||[]).forEach(row=>items.push({
      id:row.id,
      type,
      section,
      title:row.title||'',
      description:row.description||row.excerpt||row.text||'',
      category:row.category||row.type||row.tag||'',
      source:row.source||options.source||'',
      url:row.url||row.sourceUrl||'',
      kind:options.kind||'',
      anchor:options.anchor||'',
      official:Boolean(options.official)
    }));
    add(data.resources,'Biblioteca oficial','Biblioteca',{official:true});
    add(data.materials,'Documento institucional','Material',{official:true});
    add(data.capsules,'Cápsula del equipo','Cápsulas',{kind:'capsules'});
    add(data.notes,'Nota del equipo','Notas',{kind:'notes'});
    add(data.videos,'Video','Videos',{official:true});
    add(data.news,'Actualidad oficial','Actualidad',{official:true});
    add(data.timeline,'Hito de implementación','Implementación',{anchor:'#implementacion'});
    return items;
  }

  function scoreItem(item,term){
    const full=normalize(term);
    const tokens=[...new Set(full.split(/\s+/).filter(token=>token.length>1))];
    const title=normalize(item.title);
    const haystack=normalize(`${item.title} ${item.description} ${item.category} ${item.source} ${item.section}`);
    let score=haystack.includes(full)?80:0;
    tokens.forEach(token=>{
      if(title.includes(token))score+=24;
      else if(haystack.includes(token))score+=9;
    });
    if(tokens.length&&tokens.every(token=>haystack.includes(token)))score+=35;
    return score;
  }

  function resultMarkup(item){
    const meta=[item.type,item.category,item.official?'Fuente oficial':''].filter(Boolean).join(' · ');
    const body=`<span class="globalResultKind">${escapeHtml(meta)}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(shorten(item.description)||'Abrir contenido relacionado.')}</p><b aria-hidden="true">→</b>`;
    if(item.kind)return `<button class="globalResult readBtn" type="button" data-kind="${escapeHtml(item.kind)}" data-id="${escapeHtml(item.id)}">${body}</button>`;
    if(item.url)return `<a class="globalResult" href="${escapeHtml(item.url)}" ${externalAttrs}>${body}</a>`;
    return `<a class="globalResult" href="${escapeHtml(item.anchor||'#inicio')}">${body}</a>`;
  }

  function emptyMarkup(){
    return `<div class="globalEmpty"><h4>No encontramos una coincidencia directa</h4><p>Prueba con una palabra más breve o usa uno de estos accesos frecuentes.</p><div class="globalSuggestions"><button type="button" data-task-query="firma electrónica">Firma electrónica</button><button type="button" data-task-query="expediente">Expedientes</button><button type="button" data-task-query="DocDigital">DocDigital</button><button type="button" data-task-query="ciberseguridad">Ciberseguridad</button></div></div>`;
  }

  function renderGlobalSearch(term,{focusResults=false}={}){
    const input=byId('globalSearch');
    const panel=byId('globalResults');
    const list=byId('globalResultsList');
    const title=byId('globalResultsTitle');
    const status=byId('globalSearchStatus');
    const clear=byId('clearGlobalSearch');
    const query=String(term??input?.value??'').trim();
    if(input&&input.value!==term&&term!==undefined)input.value=term;
    if(clear)clear.hidden=!query;
    if(!portalData){
      if(status)status.textContent='La búsqueda estará disponible cuando termine la carga.';
      return;
    }
    if(query.length<2){
      if(panel)panel.hidden=true;
      if(status)status.textContent=query?'Escribe al menos dos caracteres.':'Escribe una necesidad para buscar en todo el portal.';
      return;
    }
    const matches=buildSearchIndex(portalData)
      .map(item=>({...item,score:scoreItem(item,query)}))
      .filter(item=>item.score>0)
      .sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'es'))
      .slice(0,12);
    if(title)title.textContent=matches.length?`${matches.length} resultado${matches.length===1?'':'s'} para “${query}”`:`Sin resultados para “${query}”`;
    if(list)list.innerHTML=matches.length?matches.map(resultMarkup).join(''):emptyMarkup();
    if(panel){panel.hidden=false;panel.setAttribute('aria-busy','false')}
    if(status)status.textContent=matches.length?`Se encontraron ${matches.length} resultados para ${query}.`:`No se encontraron resultados para ${query}. Se muestran búsquedas sugeridas.`;
    if(focusResults){panel?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});setTimeout(()=>panel?.focus({preventScroll:true}),350)}
  }

  function activateTask(query){
    const input=byId('globalSearch');
    if(input)input.value=query;
    renderGlobalSearch(query,{focusResults:true});
  }

  function setAttributeIfChanged(element,name,value){
    if(element&&element.getAttribute(name)!==String(value))element.setAttribute(name,String(value));
  }

  function syncPressed(selector){
    document.querySelectorAll(selector).forEach(button=>setAttributeIfChanged(button,'aria-pressed',button.classList.contains('on')?'true':'false'));
  }

  function syncTabs(buttonSelector,paneResolver){
    document.querySelectorAll(buttonSelector).forEach((button,index)=>{
      const active=button.classList.contains('on');
      const pane=paneResolver(button,index);
      if(!button.id)button.id=`${buttonSelector.includes('labTab')?'lab-tab':'collection-tab'}-${index+1}`;
      setAttributeIfChanged(button,'role','tab');
      setAttributeIfChanged(button,'aria-selected',active?'true':'false');
      setAttributeIfChanged(button,'tabindex',active?'0':'-1');
      if(pane){
        if(!pane.id)pane.id=`tabpanel-${index+1}`;
        setAttributeIfChanged(button,'aria-controls',pane.id);
        setAttributeIfChanged(pane,'role','tabpanel');
        setAttributeIfChanged(pane,'aria-labelledby',button.id);
        pane.hidden=!active;
      }
    });
  }

  function enhanceVideoFacade(){
    const host=byId('videoHost');
    const frame=host?.querySelector('iframe');
    if(!host||!frame||host.dataset.videoActivated==='true')return;
    const src=frame.getAttribute('src')||'';
    const title=frame.getAttribute('title')||'Video institucional';
    host.innerHTML=`<button class="videoFacade" type="button" aria-label="Reproducir: ${escapeHtml(title)}"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg> Reproducir video</span></button>`;
    host.querySelector('.videoFacade')?.addEventListener('click',()=>{
      host.dataset.videoActivated='true';
      host.innerHTML=`<iframe src="${escapeHtml(src)}" title="${escapeHtml(title)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    });
  }

  function syncAccessibility(){
    document.querySelector('.adminLink')?.remove();
    byId('inicio')?.setAttribute('aria-label','Contenido principal de Ruta Digital Constitución');
    [[document.querySelector('.stats'),'Resumen de contenidos disponibles'],[byId('timeline'),'Hitos de implementación municipal']].forEach(([region,label])=>{if(region){region.tabIndex=0;setAttributeIfChanged(region,'role','region');setAttributeIfChanged(region,'aria-label',label)}});
    enhanceVideoFacade();
    const taskList=document.querySelector('.taskList');
    taskList?.removeAttribute('role');
    taskList?.removeAttribute('aria-label');
    document.querySelectorAll('.taskItem').forEach(button=>button.removeAttribute('role'));
    syncPressed('.videoPick,.capFilter,.factDot,.scenarioPick,.tipRole');
    const collections=byId('collections');
    if(collections){setAttributeIfChanged(collections,'role','tablist');setAttributeIfChanged(collections,'aria-label','Colecciones de la biblioteca')}
    const workspace=document.querySelector('.workspace');
    if(workspace&&!workspace.id)workspace.id='libraryPanel';
    const collectionTabs=[...document.querySelectorAll('.ctab')];
    collectionTabs.forEach((button,index)=>{
      const active=button.classList.contains('on');
      if(!button.id)button.id=`collection-tab-${index+1}`;
      setAttributeIfChanged(button,'role','tab');
      setAttributeIfChanged(button,'aria-selected',active?'true':'false');
      setAttributeIfChanged(button,'tabindex',active?'0':'-1');
      if(workspace)setAttributeIfChanged(button,'aria-controls',workspace.id);
    });
    if(workspace){
      const selected=collectionTabs.find(button=>button.classList.contains('on'));
      setAttributeIfChanged(workspace,'role','tabpanel');
      if(selected)setAttributeIfChanged(workspace,'aria-labelledby',selected.id);
      workspace.hidden=false;
    }
    const labNav=document.querySelector('.labNav');
    if(labNav){setAttributeIfChanged(labNav,'role','tablist');setAttributeIfChanged(labNav,'aria-label','Actividades de aprendizaje')}
    syncTabs('.labTab',button=>byId(`pane-${button.dataset.pane}`));
    const count=byId('count');
    if(count){setAttributeIfChanged(count,'role','status');setAttributeIfChanged(count,'aria-live','polite')}
    ['fb','scenarioResult'].forEach(id=>{const node=byId(id);if(node){setAttributeIfChanged(node,'role','status');setAttributeIfChanged(node,'aria-live','polite')}});
    document.querySelectorAll('.capCard img[alt=""],.noteCard img[alt=""]').forEach(img=>{img.alt=img.closest('article')?.querySelector('h3')?.textContent?.trim()||'Ilustración institucional'});
    const dialogImage=document.querySelector('.dialogHero[alt=""]');
    if(dialogImage)dialogImage.alt=byId('dialogTitle')?.textContent?.trim()||'Imagen del contenido';
  }

  function updateMenuState(){
    const menu=byId('menu');
    if(!menu)return;
    const open=document.body.classList.contains('open');
    menu.setAttribute('aria-expanded',open?'true':'false');
    menu.setAttribute('aria-label',open?'Cerrar navegación':'Abrir navegación');
  }

  function markReady(data){
    if(portalData)return;
    portalData=data;
    document.body.classList.remove('is-loading');
    const pageStatus=byId('pageStatus');
    pageStatus?.classList.add('is-ready');
    syncAccessibility();
    if(byId('globalSearch')?.value.trim())renderGlobalSearch(byId('globalSearch').value);
  }

  function showLoadError(){
    const status=byId('pageStatus');
    const text=byId('pageStatusText');
    if(!status||status.classList.contains('is-ready'))return;
    status.classList.add('is-error');
    if(text)text.innerHTML='No pudimos cargar los contenidos. <button type="button" id="retryPage">Reintentar</button>';
    byId('retryPage')?.addEventListener('click',()=>location.reload());
  }

  byId('globalSearch')?.addEventListener('input',event=>renderGlobalSearch(event.target.value));
  byId('clearGlobalSearch')?.addEventListener('click',()=>{const input=byId('globalSearch');if(input){input.value='';input.focus()}renderGlobalSearch('')});
  byId('closeGlobalResults')?.addEventListener('click',()=>{byId('globalResults').hidden=true;byId('globalSearch').focus()});

  document.addEventListener('click',event=>{
    if(event.target.closest('.videoPick')){const host=byId('videoHost');if(host)host.dataset.videoActivated='false'}
    const task=event.target.closest('[data-task-query]');
    if(task)activateTask(task.dataset.taskQuery);
    if(event.target.closest('.readBtn'))lastDialogTrigger=event.target.closest('.readBtn');
    if(event.target.closest('#menu'))setTimeout(updateMenuState);
  },true);

  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
      event.preventDefault();
      event.stopImmediatePropagation();
      byId('globalSearch')?.focus();
      byId('busqueda-global')?.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    if(event.key==='Escape'&&document.body.classList.contains('open')){
      document.body.classList.remove('open');
      updateMenuState();
      byId('menu')?.focus();
    }
    const tab=event.target.closest('.labTab,.ctab');
    if(tab&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)){
      event.preventDefault();
      const buttons=[...tab.parentElement.querySelectorAll(tab.classList.contains('labTab')?'.labTab':'.ctab')];
      const current=buttons.indexOf(tab);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length;
      buttons[next]?.focus();
      buttons[next]?.click();
    }
  },true);

  const dialog=byId('contentDialog');
  dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  dialog?.addEventListener('close',()=>lastDialogTrigger?.focus());
  const dialogObserver=new MutationObserver(()=>{syncAccessibility();if(dialog?.open)setTimeout(()=>byId('dialogClose')?.focus(),0)});
  if(dialog)dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open'],childList:true,subtree:true});

  const interfaceObserver=new MutationObserver(()=>{
    syncAccessibility();
    const legacyError=[...document.body.children].find(node=>node.tagName==='DIV'&&node.textContent.includes('No fue posible cargar el contenido'));
    if(legacyError){legacyError.remove();showLoadError()}
  });
  interfaceObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

  let attempts=0;
  const readyPoll=setInterval(()=>{
    attempts++;
    if(typeof D!=='undefined'&&D){clearInterval(readyPoll);markReady(D)}
    else if(attempts>160){clearInterval(readyPoll);showLoadError()}
  },50);
  setTimeout(showLoadError,10000);
  syncAccessibility();
  updateMenuState();
})();
