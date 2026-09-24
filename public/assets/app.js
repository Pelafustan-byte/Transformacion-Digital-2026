const $=id=>document.getElementById(id);let D=null,activeCollection=null,allResources=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const isPlate=u=>/\/assets\/illustrations\//.test(String(u||''))||/\.svg(\?|$)/i.test(String(u||''));
// Las ilustraciones son láminas completas sobre fondo navy: se muestran enteras
// (contain) en vez de recortarse, para no perder la curva territorial del pie.
const coverImg=(url,alt,w,h)=>`<img src="${esc(url)}" alt="${esc(alt||'')}" width="${w}" height="${h}" loading="lazy" decoding="async" class="${isPlate(url)?'plate':'photo'}">`;
const fmt=d=>{if(!d)return'';try{return new Intl.DateTimeFormat('es-CL',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T00:00:00Z'))}catch{return d}};
async function load(){const [r,e,p]=await Promise.all([fetch('/api/public/content',{cache:'no-store'}),fetch('/data/editorial.json',{cache:'no-store'}).catch(()=>null),fetch('/data/policies.json',{cache:'no-store'}).catch(()=>null)]);if(!r.ok)throw new Error('content');D=await r.json();if(e?.ok){const x=await e.json();D={...D,materials:x.materials||D.materials,news:x.news||D.news,site:{...(D.site||{}),...(x.site||{})}}}if(p?.ok){const x=await p.json();D.policies=x.policies||[];D.policyNotice=x.notice||''}renderAll()}
function text(id,v){const e=$(id);if(e)e.textContent=v||''}
function renderAll(){const s=D.site||{};text('brandName',s.name);text('brandSubtitle',s.subtitle);text('heroEyebrow',s.heroEyebrow);text('heroTitle',s.heroTitle);text('heroEmphasis',s.heroEmphasis);text('heroText',s.heroText);text('eventLabel',s.eventLabel);text('eventTitle',s.eventTitle);text('eventText',s.eventText);text('eventDate',s.eventDate);text('videosTitle',s.videosTitle);text('videosText',s.videosText);text('materialsTitle',s.materialsTitle);text('materialsText',s.materialsText);text('capsulesTitle',s.capsulesTitle);text('capsulesText',s.capsulesText);text('localTitle',s.localTitle);text('localText',s.localText);text('resourcesTitle',s.resourcesTitle);text('resourcesText',s.resourcesText);text('notesTitle',s.notesTitle);text('notesText',s.notesText);text('newsTitle',s.newsTitle);text('newsText',s.newsText);text('labTitle',s.labTitle);text('labText',s.labText);text('footerName',s.name);text('footerText',s.footerText);text('territoryTitle',s.territoryTitle);text('territoryText',s.territoryText);[1,2,3].forEach(n=>{const img=$('territoryImage'+n),fig=img?.closest('figure'),url=s['territoryImage'+n];
 if(!img||!fig)return;
 if(!url){fig.remove();return}
 img.src=url;img.alt=s['territoryAlt'+n]||'';
 img.width=1200;img.height=750;img.loading='lazy';img.decoding='async';
 img.classList.add(isPlate(url)?'plate':'photo');
 fig.classList.toggle('hasPlate',isPlate(url));
});['territoryCaption1','territoryCaption2','territoryCaption3'].forEach(k=>text(k,s[k]));/* La identidad 2026 del encabezado es fija para preservar la marca. */if($('municipalCrestImg')&&s.municipalCrest)$('municipalCrestImg').src=s.municipalCrest;if(s.contactEmail&&$('footerEmail')){$('footerEmail').textContent='Correo institucional';$('footerEmail').href='mailto:'+s.contactEmail;$('footerEmail').setAttribute('aria-label','Escribir al Equipo de Transformación Digital')}// Un fondo fotográfico solo se aplica si la fotografía aguanta el tamaño: el
// gradiente de tres paradas que había servía para tapar una imagen de 640 px.
// Se exige un mínimo declarado por quien edita (heroImageMinWidth) antes de
// volver a usar el hero como fondo.
if(s.heroImage&&Number(s.heroImageMinWidth||0)>=1800){$('hero').classList.add('hasPhoto');$('hero').style.backgroundImage=`linear-gradient(100deg,rgba(3,29,48,.86),rgba(3,29,48,.45) 62%,transparent),url("${esc(s.heroImage)}")`}text('statResources',D.resources.length);text('statCapsules',D.capsules.length);text('statVideos',D.videos.length);text('statNotes',D.notes.length);renderVideos();renderMaterials();renderPolicies();renderCapsules();renderTimeline();renderLibrary();renderNotes();renderNews()}
function renderVideos(){
 const a=D.videos||[],host=$('videoHost'),playlist=$('videoPlaylist');
 if(!a.length){host.innerHTML='<div class="mediaEmpty">Sin videos publicados.</div>';playlist.innerHTML='';return}
 let currentIndex=0,slowTimer=null,playerSeq=0;
 const driveId=value=>{
  const raw=String(value||'').trim();
  return raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1]||raw.match(/[?&]id=([^&]+)/i)?.[1]||'';
 };
 const embedUrl=value=>{
  const raw=String(value||'').trim(),id=driveId(raw);
  return id?`https://drive.google.com/file/d/${id}/preview`:raw;
 };
 const formatTime=value=>{
  const sec=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
  return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
 };
 const ensureRetry=()=>{
  let button=$('videoRetry');
  if(!button){
   button=document.createElement('button');
   button.id='videoRetry';button.type='button';button.className='videoRetry';
   button.textContent='↻ Recargar reproductor';
   $('videoLink')?.insertAdjacentElement('afterend',button);
  }
  return button;
 };
 const setActive=i=>{
  playlist.querySelectorAll('button[data-i]').forEach((b,j)=>{
   const active=j===i;b.classList.toggle('on',active);
   b.setAttribute('aria-pressed',active?'true':'false');
  });
 };
 const mountIframe=(v,raw,seq)=>{
  if(seq!==playerSeq)return;
  clearTimeout(slowTimer);
  const u=embedUrl(raw);
  host.innerHTML=`<div class="videoEmbed videoEmbedFallback"><iframe src="${esc(u)}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="videoLoading" role="status" aria-live="polite"><span></span>Cargando reproductor alternativo…</div><div class="videoSlow">Si el reproductor no responde, usa “Recargar reproductor” o abre el archivo en Drive.</div></div>`;
  const frame=host.querySelector('iframe'),wrap=host.querySelector('.videoEmbed');
  if(frame&&wrap){
   const ready=()=>{clearTimeout(slowTimer);wrap.classList.add('is-ready');wrap.classList.remove('is-slow')};
   frame.addEventListener('load',ready,{once:true});
   slowTimer=setTimeout(()=>wrap.classList.add('is-slow'),7000);
  }
 };
 const mountNativeDrive=(v,id,raw,seq)=>{
  const urls=[`/api/public/video/${encodeURIComponent(id)}`];
  let sourceIndex=0,settled=false,loadTimer=null,controlsTimer=null;
  host.innerHTML=`<div class="nativeVideoShell is-loading">
    <video class="nativeDriveVideo" playsinline preload="metadata"></video>
    <button class="videoCenterPlay" type="button" aria-label="Reproducir ${esc(v.title)}"><span aria-hidden="true">▶</span></button>
    <div class="nativeVideoLoading" role="status" aria-live="polite"><span></span>Preparando video…</div>
    <div class="nativeVideoControls" aria-label="Controles de video">
      <button class="videoCtl videoToggle" type="button" aria-label="Reproducir"><span aria-hidden="true">▶</span></button>
      <input class="videoProgress" type="range" min="0" max="1000" value="0" step="1" aria-label="Posición del video">
      <span class="videoTime">0:00 / --:--</span>
      <button class="videoCtl videoFullscreen" type="button" aria-label="Pantalla completa"><span aria-hidden="true">⛶</span></button>
    </div>
  </div>`;
  const shell=host.querySelector('.nativeVideoShell'),video=host.querySelector('.nativeDriveVideo'),
        center=host.querySelector('.videoCenterPlay'),toggle=host.querySelector('.videoToggle'),
        progress=host.querySelector('.videoProgress'),time=host.querySelector('.videoTime'),
        fullscreen=host.querySelector('.videoFullscreen');
  const hideControls=()=>{
   clearTimeout(controlsTimer);
   if(!video.paused&&!video.ended)controlsTimer=setTimeout(()=>shell.classList.remove('show-controls'),850);
  };
  const showControls=()=>{
   shell.classList.add('show-controls');
   hideControls();
  };
  const updateUi=()=>{
   const duration=Number.isFinite(video.duration)?video.duration:0;
   const current=Number.isFinite(video.currentTime)?video.currentTime:0;
   if(duration)progress.value=String(Math.round(current/duration*1000));
   time.textContent=`${formatTime(current)} / ${duration?formatTime(duration):'--:--'}`;
   const paused=video.paused||video.ended;
   toggle.querySelector('span').textContent=paused?'▶':'Ⅱ';
   toggle.setAttribute('aria-label',paused?'Reproducir':'Pausar');
   center.querySelector('span').textContent=paused?'▶':'Ⅱ';
   center.setAttribute('aria-label',paused?`Reproducir ${v.title}`:`Pausar ${v.title}`);
   shell.classList.toggle('is-playing',!paused);
  };
  const useSource=index=>{
   if(seq!==playerSeq)return;
   sourceIndex=index;settled=false;
   clearTimeout(loadTimer);
   shell.classList.add('is-loading');
   video.src=urls[index];
   video.load();
   loadTimer=setTimeout(()=>{
    if(settled||seq!==playerSeq)return;
    if(index+1<urls.length)useSource(index+1);
    else mountIframe(v,raw,seq);
   },5000);
  };
  const fail=()=>{
   if(settled||seq!==playerSeq)return;
   clearTimeout(loadTimer);
   if(sourceIndex+1<urls.length)useSource(sourceIndex+1);
   else mountIframe(v,raw,seq);
  };
  video.addEventListener('loadedmetadata',()=>{
   if(seq!==playerSeq)return;
   settled=true;clearTimeout(loadTimer);shell.classList.remove('is-loading');updateUi();
  },{once:false});
  video.addEventListener('canplay',()=>{
   if(seq!==playerSeq)return;
   settled=true;clearTimeout(loadTimer);shell.classList.remove('is-loading');
  });
  video.addEventListener('error',fail);
  video.addEventListener('timeupdate',updateUi);
  video.addEventListener('durationchange',updateUi);
  video.addEventListener('play',()=>{updateUi();shell.classList.remove('show-controls');hideControls()});
  video.addEventListener('pause',()=>{updateUi();shell.classList.add('show-controls')});
  video.addEventListener('ended',()=>{updateUi();shell.classList.add('show-controls')});
  const togglePlay=()=>{
   if(video.paused||video.ended)video.play().catch(()=>showControls());
   else video.pause();
  };
  center.addEventListener('click',togglePlay);
  toggle.addEventListener('click',e=>{e.stopPropagation();togglePlay()});
  video.addEventListener('click',()=>{if(video.paused)togglePlay();else showControls()});
  shell.addEventListener('mousemove',()=>{if(!video.paused)showControls()},{passive:true});
  shell.addEventListener('touchstart',()=>{if(!video.paused)showControls()},{passive:true});
  shell.addEventListener('focusin',()=>shell.classList.add('show-controls'));
  progress.addEventListener('input',()=>{
   if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=(+progress.value/1000)*video.duration;
   showControls();
  });
  fullscreen.addEventListener('click',async e=>{
   e.stopPropagation();
   try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if(shell.requestFullscreen)await shell.requestFullscreen();
    else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
   }catch{}
   showControls();
  });
  useSource(0);
 };
 const show=(v,i)=>{
  currentIndex=i;playerSeq++;const seq=playerSeq;clearTimeout(slowTimer);
  const raw=v.embedUrl||v.sourceUrl||'',id=driveId(raw),u=embedUrl(raw);
  const direct=/^\/media\//.test(u)||/\.(mp4|webm)(\?|$)/i.test(u);
  host.dataset.playerManaged='true';
  text('videoTitle',v.title);text('videoDesc',v.description);
  const link=$('videoLink');link.href=v.sourceUrl||raw||u;link.textContent='Abrir en Drive ↗';
  setActive(i);
  const retry=ensureRetry();retry.onclick=()=>show(a[currentIndex],currentIndex);
  if(id){mountNativeDrive(v,id,raw,seq);return}
  if(direct){
   host.innerHTML=`<video class="directVideo" src="${esc(u)}" controls playsinline preload="metadata"></video>`;
   return;
  }
  mountIframe(v,raw,seq);
 };
 playlist.innerHTML=a.map((v,i)=>`<button class="videoPick ${i===0?'on':''}" type="button" data-i="${i}" aria-pressed="${i===0?'true':'false'}"><small>Cápsula ${String(i+1).padStart(2,'0')}</small><strong>${esc(v.title)}</strong><span>${esc(v.description||'')}</span></button>`).join('');
 playlist.onclick=e=>{const b=e.target.closest('button[data-i]');if(b)show(a[+b.dataset.i],+b.dataset.i)};
 show(a[0],0);
}
function renderMaterials(){$('materialsGrid').innerHTML=(D.materials||[]).map(m=>`<a class="baseCard" href="${esc(m.url)}" target="_blank" rel="noopener"><small>${esc(m.type||'Material')}</small><h3>${esc(m.title)}</h3><p>${esc(m.description||'')}</p><b>Abrir ↗</b></a>`).join('')}

let legalPolicyId='',legalArticleNumber=1,legalSearchTerm='';
const legalNormalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/([a-z])6(?=[a-z])/g,'$1o').replace(/[^a-z0-9ñ]+/g,' ').trim();
function legalHighlight(value,term){
 const safe=esc(value),q=esc(String(term||'').trim());
 if(q.length<2)return safe;
 const lower=safe.toLocaleLowerCase('es'),needle=q.toLocaleLowerCase('es');
 let out='',from=0,at=lower.indexOf(needle);
 while(at>=0){out+=safe.slice(from,at)+'<mark>'+safe.slice(at,at+q.length)+'</mark>';from=at+q.length;at=lower.indexOf(needle,from)}
 return out+safe.slice(from);
}
function legalBodyMarkup(value,term){return String(value||'').split(/\n{2,}/).filter(Boolean).map(block=>{const t=block.trim();if(t.startsWith('•'))return '<p class="legalBullet">'+legalHighlight(t.replace(/^•\s*/,''),term)+'</p>';if(/^\d+(?:[.,]\d+)+/.test(t))return '<h4>'+legalHighlight(t,term)+'</h4>';return '<p>'+legalHighlight(t,term).replace(/\n/g,'<br>')+'</p>'}).join('')}
function renderPolicies(){
 const policies=D.policies||[],select=$('policySelect');
 if(!select||!policies.length)return;
 if(!legalPolicyId||!policies.some(p=>p.id===legalPolicyId))legalPolicyId=policies[0].id;
 select.innerHTML=policies.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.shortName||p.title)+'</option>').join('');
 select.value=legalPolicyId;
 const render=()=>{
  const p=policies.find(x=>x.id===legalPolicyId)||policies[0],q=legalSearchTerm.trim(),nq=legalNormalize(q);
  text('legalDecreeType',p.decreeType||'Decreto');text('legalPolicyTitle',p.title);text('legalDecreeNumber',p.decreeNumber);text('legalDecreeDate',p.date);text('legalArticleCount',String((p.articles||[]).length));text('legalPolicySummary',p.summary);text('legalNotice',D.policyNotice||'');
  const pdf=$('legalPdfLink');if(pdf)pdf.href=p.pdfUrl||'#';
  $('legalSigners').innerHTML=(p.signers||[]).map(s=>'<div class="legalSigner"><span aria-hidden="true">✓</span><div><strong>'+esc(s.name)+'</strong><small>'+esc(s.role)+'</small></div></div>').join('');
  $('legalQuickTerms').innerHTML=(p.quickTerms||[]).map(term=>'<button type="button" data-legal-term="'+esc(term)+'">'+esc(term)+'</button>').join('');
  const all=p.articles||[];
  const filtered=nq?all.filter(a=>legalNormalize(a.title+' '+a.text+' artículo '+a.number).includes(nq)):all;
  if(!filtered.length){$('legalArticleList').innerHTML='<p class="legalEmpty">No hay artículos que coincidan con esta búsqueda.</p>';text('legalSearchStatus','0 coincidencias');return}
  if(!filtered.some(a=>a.number===legalArticleNumber))legalArticleNumber=filtered[0].number;
  text('legalSearchStatus',nq?filtered.length+' coincidencia'+(filtered.length===1?'':'s'):all.length+' artículos');
  $('legalArticleList').innerHTML=filtered.map(a=>'<button type="button" class="legalArticleBtn '+(a.number===legalArticleNumber?'on':'')+'" data-legal-article="'+a.number+'"><span>Art. '+a.number+'</span><strong>'+esc(a.title)+'</strong></button>').join('');
  const article=all.find(a=>a.number===legalArticleNumber)||all[0];
  text('legalArticleNumber','Artículo '+article.number);text('legalViewerPolicy',p.shortName||p.title);text('legalArticleTitle',article.title);
  $('legalArticleBody').innerHTML=legalBodyMarkup(article.text,q);
  const complex=$('legalComplexNote');if(complex)complex.hidden=!(p.complexLayoutArticles||[]).includes(article.number);
 };
 select.onchange=()=>{legalPolicyId=select.value;legalArticleNumber=1;legalSearchTerm='';$('policySearch').value='';render()};
 $('policySearch').oninput=e=>{legalSearchTerm=e.target.value;render()};
 $('policySearchClear').onclick=()=>{legalSearchTerm='';$('policySearch').value='';$('policySearch').focus();render()};
 $('legalQuickTerms').onclick=e=>{const b=e.target.closest('[data-legal-term]');if(!b)return;legalSearchTerm=b.dataset.legalTerm||'';$('policySearch').value=legalSearchTerm;render()};
 $('legalArticleList').onclick=e=>{const b=e.target.closest('[data-legal-article]');if(!b)return;legalArticleNumber=Number(b.dataset.legalArticle);render();$('legalArticleTitle')?.scrollIntoView({behavior:'smooth',block:'center'})};
 render();
}

let capFilter='Todos';function renderCapsules(){const caps=D.capsules||[],cats=['Todos',...new Set(caps.map(x=>x.category).filter(Boolean))];$('capsuleFilters').innerHTML=cats.map(c=>`<button class="capFilter ${c===capFilter?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');const arr=capFilter==='Todos'?caps:caps.filter(x=>x.category===capFilter);$('capsuleGrid').innerHTML=arr.length?arr.map((c,i)=>`<article class="capCard ${i===0?'featured':''}" data-id="${c.id}">${c.imageUrl?`<div class="capImage${isPlate(c.imageUrl)?' hasPlate':''}">${coverImg(c.imageUrl,c.coverAlt,1200,750)}</div>`:''}<div class="capBody"><small>${esc(c.category||'Cápsula')} · ${esc(fmt(c.publishedAt))}</small><h3>${esc(c.title)}</h3><p>${esc(c.excerpt||'')}</p><div><span>${esc(c.author||'Equipo de Transformación Digital')}</span><button class="readBtn" data-kind="capsules" data-id="${c.id}">Leer →</button></div></div></article>`).join(''):'<div class="emptyPublic">Sin cápsulas publicadas en esta categoría.</div>';}
$('capsuleFilters').onclick=e=>{const b=e.target.closest('button[data-c]');if(b){capFilter=b.dataset.c;renderCapsules()}};
function renderTimeline(){$('timeline').innerHTML=(D.timeline||[]).map((x,i)=>`<article class="mile ${i===2?'now':''}"><small>${esc(x.label)}</small><h3>${esc(x.title)}</h3><p>${esc(x.text||'')}</p></article>`).join('')}
function renderLibrary(){const R=D.resources||[],C=(D.libraryCollections||[]).length?D.libraryCollections:buildCollections(R);activeCollection=activeCollection||C[0]?.id;text('resourceCount',R.length);text('collectionCount',C.length);$('essential').innerHTML=R.slice(0,6).map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`).join('');$('collections').innerHTML=C.map(c=>`<button class="ctab ${c.id===activeCollection?'on':''}" data-id="${c.id}"><small><span>${esc(c.label||'')}</span><span>${R.filter(r=>(c.categories||[]).includes(r.category)).length}</span></small><strong>${esc(c.title)}</strong></button>`).join('');$('collections').onclick=e=>{const b=e.target.closest('button[data-id]');if(!b)return;activeCollection=b.dataset.id;allResources=false;$('search').value='';renderLibrary()};renderResources(R,C)}
function buildCollections(R){return [...new Set(R.map(r=>r.category))].map((c,i)=>({id:'c'+i,label:String(i+1).padStart(2,'0'),title:c,description:'Recursos oficiales de '+c,categories:[c],focusId:R.find(r=>r.category===c)?.id}))}
function renderResources(R,C){const c=C.find(x=>x.id===activeCollection)||C[0]||{},term=$('search').value.trim().toLowerCase();text('idx',c.label);text('storyTitle',c.title);text('storyDesc',c.description);const story=$('story');if(story){story.style.setProperty('--story-image',c.imageUrl?`url("${c.imageUrl}")`:'none');story.classList.toggle('hasImage',!!c.imageUrl)}text('workTitle',term?'Resultados de búsqueda':allResources?'Todos los recursos':c.title);let focus=R.find(r=>r.id===c.focusId)||R.find(r=>(c.categories||[]).includes(r.category));$('focus').innerHTML=focus?`<small>Recomendado</small><a href="${esc(focus.url)}" target="_blank" rel="noopener">${esc(focus.title)}<span>↗</span></a>`:'';let arr=R;if(term)arr=R.filter(r=>(r.title+' '+r.category).toLowerCase().includes(term));else if(!allResources)arr=R.filter(r=>(c.categories||[]).includes(r.category));text('count',`${arr.length} recurso${arr.length===1?'':'s'}`);$('showAll').textContent=allResources?'Volver a la colección':`Ver los ${R.length}`;$('resGrid').innerHTML=arr.map(r=>`<a class="resCard" href="${esc(r.url)}" target="_blank" rel="noopener"><div class="resTop"><small>${esc(r.id.toUpperCase())}</small><em>${esc(r.category)}</em></div><h3>${esc(r.title)}</h3><div class="resFoot"><span>Fuente oficial</span><b>Abrir ↗</b></div></a>`).join('')}
$('search').addEventListener('input',()=>renderResources(D.resources,D.libraryCollections));$('showAll').onclick=()=>{allResources=!allResources;$('search').value='';renderResources(D.resources,D.libraryCollections)};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('search').focus()}});
function renderNotes(){$('notesGrid').innerHTML=(D.notes||[]).map((n,i)=>`<article class="noteCard ${i===0?'leadNote':''}">${n.imageUrl?`<div class="noteImage${isPlate(n.imageUrl)?' hasPlate':''}">${coverImg(n.imageUrl,n.coverAlt,1200,750)}</div>`:''}<div><small>${esc(fmt(n.publishedAt))} · ${esc(n.author||'Equipo de Transformación Digital')}</small><h3>${esc(n.title)}</h3><p>${esc(n.excerpt||'')}</p><button class="readBtn" data-kind="notes" data-id="${n.id}">Leer nota →</button></div></article>`).join('')||'<div class="emptyPublic">Sin notas publicadas.</div>'}
function renderNews(){const a=D.news||[];if(!a.length){$('newsGrid').innerHTML='<div class="emptyPublic">Sin noticias publicadas.</div>';return}const lead=a[0];$('newsGrid').innerHTML=`<a class="newsFeature" href="${esc(lead.url)}" target="_blank" rel="noopener"><small>${esc(lead.tag||'Actualidad')} · ${esc(fmt(lead.publishedAt))}</small><h3>${esc(lead.title)}</h3><p>${esc(lead.description||'')}</p><b>${esc(lead.source||'Fuente oficial')} · Abrir ↗</b></a><div class="newsSide">${a.slice(1,5).map(n=>`<a class="newsSmall" href="${esc(n.url)}" target="_blank" rel="noopener"><small>${esc(n.tag||'Actualidad')} · ${esc(fmt(n.publishedAt))}</small><h3>${esc(n.title)}</h3><p>${esc(n.description||'')}</p><b>${esc(n.source||'Fuente oficial')} ↗</b></a>`).join('')}</div>`}
document.body.addEventListener('click',e=>{const b=e.target.closest('.readBtn');if(!b)return;const item=(D[b.dataset.kind]||[]).find(x=>x.id===b.dataset.id);if(!item)return;text('dialogTitle',item.title);$('dialogContent').innerHTML=`${item.imageUrl?`<img class="dialogHero ${isPlate(item.imageUrl)?'plate':'photo'}" src="${esc(item.imageUrl)}" alt="${esc(item.coverAlt||'')}" width="1200" height="750" decoding="async">`:''}<p class="dialogMeta">${esc(item.author||'Equipo de Transformación Digital')} · ${esc(fmt(item.publishedAt))}</p><p class="dialogExcerpt">${esc(item.excerpt||'')}</p><div class="richPublic">${item.bodyHtml||''}</div>`;$('contentDialog').showModal()});$('dialogClose').onclick=()=>$('contentDialog').close();$('menu').onclick=()=>document.body.classList.toggle('open');
load().catch(e=>{console.error(e);document.body.insertAdjacentHTML('afterbegin','<div style="padding:10px;background:#fee;color:#700;text-align:center">No fue posible cargar el contenido. Recarga la página.</div>')});