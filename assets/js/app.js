(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  const fallbackContent = {
    lineas: [
      ['01', 'Gestión documental', 'Expediente electrónico, documentos digitales, firma y trazabilidad administrativa.'],
      ['02', 'Interoperabilidad', 'Conectar procesos y aprovechar información que ya existe en otros organismos del Estado.'],
      ['03', 'Ciberseguridad', 'Seguridad de la información, continuidad operacional, accesos y cultura preventiva.'],
      ['04', 'Procesos simples', 'Revisar procedimientos antes de digitalizarlos para reducir pasos, tiempos y duplicidades.'],
      ['05', 'Personas y capacidades', 'Capacitación, acompañamiento y gestión del cambio para funcionarios y funcionarias.'],
      ['06', 'Servicios digitales', 'Mejor atención, accesibilidad y una relación más simple entre la Municipalidad y las personas.']
    ],
    herramientas: [
      ['DocDigital', 'Comunicaciones', 'Plataforma para comunicaciones oficiales entre órganos de la Administración del Estado.'],
      ['FirmaGob', 'Firma electrónica', 'Servicios de firma electrónica para documentos y actuaciones administrativas digitales.'],
      ['CPAT', 'Procedimientos', 'Catálogo de Procedimientos Administrativos y Trámites del Estado.'],
      ['ClaveÚnica', 'Identidad digital', 'Mecanismo de autenticación digital para acceder a servicios del Estado.'],
      ['Domicilio Digital Único', 'Notificaciones', 'Componente del ecosistema digital asociado a comunicaciones y notificaciones electrónicas.'],
      ['PISEE 2.0', 'Interoperabilidad', 'Infraestructura para el intercambio seguro de información entre organismos públicos.']
    ]
  };

  const fallbackCapsules = [
    {
      eyebrow: 'Gestión documental',
      title: 'Del papel al expediente electrónico',
      summary: 'La transformación digital no consiste solamente en escanear documentos. El cambio apunta a procedimientos trazables y expedientes electrónicos.',
      date: '2026-09-09',
      readingTime: '3 min',
      status: 'En desarrollo'
    },
    {
      eyebrow: 'Interoperabilidad',
      title: 'Cuando el Estado deja de pedirte lo que ya sabe',
      summary: 'La interoperabilidad permite que organismos públicos intercambien información de manera controlada y segura, reduciendo duplicidades.',
      date: '2026-09-09',
      readingTime: '4 min',
      status: 'Próximamente'
    }
  ];

  function setHeaderState() {
    header?.classList.toggle('scrolled', window.scrollY > 28);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
      const open = !body.classList.contains('menu-open');
      body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        body.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initializeReveal() {
    const elements = [...document.querySelectorAll('.reveal:not([data-reveal-ready])')];
    if (!elements.length) return;

    elements.forEach((el) => el.dataset.revealReady = 'true');

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -7% 0px'
    });

    elements.forEach((el) => observer.observe(el));
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(dateString) {
    try {
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(new Date(`${dateString}T00:00:00Z`));
    } catch {
      return dateString;
    }
  }

  function renderLines(lines = []) {
    const container = document.querySelector('#lineas-transformacion');
    if (!container) return;

    container.innerHTML = lines.map((line) => {
      const number = line.number ?? line[0];
      const title = line.title ?? line[1];
      const description = line.description ?? line[2];

      return `
        <div class="flow-line reveal">
          <span class="flow-number">${escapeHtml(number)}</span>
          <strong class="flow-title">${escapeHtml(title)}</strong>
          <span class="flow-description">${escapeHtml(description)}</span>
          <span class="flow-arrow" aria-hidden="true">↗</span>
        </div>`;
    }).join('');

    initializeReveal();
  }

  function renderTools(tools = []) {
    const container = document.querySelector('#tools-list');
    if (!container) return;

    container.innerHTML = tools.map((tool) => {
      const name = tool.name ?? tool[0];
      const tag = tool.tag ?? tool[1];
      const description = tool.description ?? tool[2];

      return `
        <article class="tool-row reveal">
          <div class="tool-row-top">
            <h3>${escapeHtml(name)}</h3>
            <span class="tool-tag">${escapeHtml(tag)}</span>
          </div>
          <p>${escapeHtml(description)}</p>
        </article>`;
    }).join('');

    initializeReveal();
  }

  function renderCapsules(capsules = []) {
    const container = document.querySelector('#capsule-stream');
    if (!container) return;

    container.innerHTML = capsules.map((capsule) => `
      <article class="capsule-item reveal">
        <div class="capsule-meta">
          <span class="capsule-eyebrow">${escapeHtml(capsule.eyebrow)}</span>
          <time datetime="${escapeHtml(capsule.date)}">${escapeHtml(formatDate(capsule.date))}</time>
        </div>
        <div class="capsule-body">
          <h3>${escapeHtml(capsule.title)}</h3>
          <p>${escapeHtml(capsule.summary)}</p>
        </div>
        <div class="capsule-aside" aria-label="Información de la cápsula">
          <span class="capsule-status">${escapeHtml(capsule.status)}</span>
          <span class="capsule-read">
            <span>${escapeHtml(capsule.readingTime)} de lectura</span>
            <i aria-hidden="true">→</i>
          </span>
        </div>
      </article>`).join('');

    initializeReveal();
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
    return response.json();
  }

  async function loadContent() {
    try {
      const [resources, capsules] = await Promise.all([
        loadJson('content/recursos.json'),
        loadJson('content/capsulas.json')
      ]);

      renderLines(resources.lineas ?? []);
      renderTools(resources.herramientas ?? []);
      renderCapsules(capsules ?? []);
    } catch (error) {
      console.warn('Se utilizó contenido de respaldo:', error);
      renderLines(fallbackContent.lineas);
      renderTools(fallbackContent.herramientas);
      renderCapsules(fallbackCapsules);
    }
  }

  initializeReveal();
  loadContent();
})();
