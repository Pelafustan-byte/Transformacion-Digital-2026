/**
 * Sistema ilustrativo "bitácora municipal digital".
 *
 * Genera las ilustraciones temáticas del portal como SVG planos y reproducibles.
 * Un solo lenguaje visual para las catorce piezas:
 *   · fondo navy institucional con retícula de plano técnico,
 *   · geometría clara de trazo fino, un solo objeto legible por tema,
 *   · acento cian reservado para aquello que el tema afirma,
 *   · una curva de río al pie, presente en todas: la firma territorial del Maule.
 *
 * Obra original del proyecto Ruta Digital Constitución. Sin dependencias
 * externas ni material de terceros.
 *
 *   node scripts/build-illustrations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public/assets/illustrations/transformacion-digital';
const W = 1200, H = 750;

const C = {
  ground: '#063b5c',
  groundDeep: '#032f4c',
  grid: '#ffffff14',
  paper: '#f7fafb',
  paperDim: '#cddde4',
  line: '#8fb4c8',
  cyan: '#13a6a6',
  cyanSoft: '#39c9c4',
  river: '#0a6fa4'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Retícula de plano y curva de río: el marco común de todas las piezas. */
function frame(offset = 0) {
  const step = 50;
  let grid = '';
  for (let x = step; x < W; x += step) grid += `<path d="M${x} 0V${H}"/>`;
  for (let y = step; y < H; y += step) grid += `<path d="M0 ${y}H${W}"/>`;
  const y0 = 640 + offset;
  const river = `M0 ${y0} C 200 ${y0 - 34}, 360 ${y0 + 30}, 560 ${y0 - 6} S 940 ${y0 - 52}, 1200 ${y0 - 20}`;
  return [
    `<rect width="${W}" height="${H}" fill="${C.ground}"/>`,
    `<g stroke="${C.grid}" stroke-width="1" fill="none">${grid}</g>`,
    `<path d="${river} L1200 ${H} L0 ${H}Z" fill="${C.groundDeep}"/>`,
    `<path d="${river}" fill="none" stroke="${C.river}" stroke-width="3" opacity=".85"/>`
  ].join('\n');
}

/** Hoja de papel con líneas de texto. */
function sheet(x, y, w, h, opts = {}) {
  const { lines = 4, tone = C.paper, rx = 10 } = opts;
  const pad = w * 0.12;
  const gap = (h - pad * 1.6) / (lines + 1);
  let inner = '';
  for (let i = 1; i <= lines; i++) {
    const lw = i === lines ? (w - pad * 2) * 0.55 : (w - pad * 2) * (i % 2 ? 1 : 0.82);
    inner += `<rect x="${x + pad}" y="${y + pad * 0.9 + gap * i - 5}" width="${lw}" height="9" rx="4.5" fill="${C.paperDim}"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${tone}"/>${inner}`;
}

/** Ventana de aplicación con barra superior. */
function appWindow(x, y, w, h, rx = 16) {
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${C.paper}"/>`,
    `<path d="M${x} ${y + 46}h${w}" stroke="${C.paperDim}" stroke-width="2"/>`,
    `<circle cx="${x + 26}" cy="${y + 23}" r="6" fill="${C.paperDim}"/>`,
    `<circle cx="${x + 48}" cy="${y + 23}" r="6" fill="${C.paperDim}"/>`,
    `<circle cx="${x + 70}" cy="${y + 23}" r="6" fill="${C.paperDim}"/>`
  ].join('');
}

function line(d, opts = {}) {
  const { w = 5, c = C.line, cap = 'round' } = opts;
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
}

function person(cx, cy, s = 1, c = C.cyan) {
  return `<g fill="${c}"><circle cx="${cx}" cy="${cy - 34 * s}" r="${19 * s}"/><path d="M${cx - 32 * s} ${cy + 42 * s}a${32 * s} ${34 * s} 0 0 1 ${64 * s} 0z"/></g>`;
}

/* ------------------------------------------------------------------ temas */

const themes = [
  {
    slug: 'gestion-documental',
    title: 'Gestión documental',
    desc: 'Documentos en papel que ingresan a un repositorio digital ordenado.',
    art: () => [
      sheet(180, 150, 250, 330, { lines: 5, tone: '#e3edf2' }),
      sheet(215, 185, 250, 330, { lines: 5 }),
      line('M500 300 H660', { c: C.cyanSoft, w: 6 }),
      line('M636 274 L664 300 L636 326', { c: C.cyanSoft, w: 6 }),
      `<rect x="700" y="185" width="330" height="300" rx="18" fill="${C.groundDeep}" stroke="${C.line}" stroke-width="3"/>`,
      sheet(736, 225, 258, 60, { lines: 1, rx: 8 }),
      sheet(736, 305, 258, 60, { lines: 1, rx: 8 }),
      sheet(736, 385, 258, 60, { lines: 1, rx: 8 }),
      `<circle cx="1000" cy="465" r="30" fill="${C.cyan}"/>`,
      line('M986 465 l10 11 20 -23', { c: C.groundDeep, w: 6 })
    ]
  },
  {
    slug: 'expediente-electronico',
    title: 'Expediente electrónico',
    desc: 'Carpeta con pestañas indexadas y la trazabilidad de sus actuaciones.',
    art: () => [
      `<rect x="470" y="168" width="86" height="40" rx="8" fill="${C.paperDim}"/>`,
      `<rect x="572" y="168" width="86" height="40" rx="8" fill="${C.paperDim}"/>`,
      `<rect x="674" y="168" width="86" height="40" rx="8" fill="${C.cyan}"/>`,
      `<path d="M250 200h180l40 52h330a18 18 0 0 1 18 18v230a18 18 0 0 1-18 18H250a18 18 0 0 1-18-18V218a18 18 0 0 1 18-18z" fill="${C.paper}"/>`,
      line('M290 330 H700', { c: C.paperDim, w: 9 }),
      line('M290 386 H620', { c: C.paperDim, w: 9 }),
      line('M290 442 H660', { c: C.paperDim, w: 9 }),
      line('M880 230 V500', { c: C.line, w: 4 }),
      `<circle cx="880" cy="262" r="17" fill="${C.cyan}"/>`,
      `<circle cx="880" cy="352" r="17" fill="${C.cyan}"/>`,
      `<circle cx="880" cy="442" r="17" fill="${C.paperDim}"/>`,
      line('M918 262 H1030', { c: C.paperDim, w: 8 }),
      line('M918 352 H1002', { c: C.paperDim, w: 8 }),
      line('M918 442 H1040', { c: C.paperDim, w: 8 })
    ]
  },
  {
    slug: 'docdigital',
    title: 'DocDigital',
    desc: 'Plataforma de documentos con derivación entre unidades municipales.',
    art: () => [
      appWindow(200, 160, 800, 420),
      sheet(240, 240, 230, 300, { lines: 4, tone: '#eef5f8' }),
      `<rect x="510" y="240" width="450" height="60" rx="10" fill="${C.cyan}"/>`,
      line('M540 270 H760', { c: C.groundDeep, w: 8 }),
      sheet(510, 330, 450, 70, { lines: 1, tone: '#eef5f8', rx: 10 }),
      sheet(510, 420, 450, 70, { lines: 1, tone: '#eef5f8', rx: 10 }),
      line('M540 520 H700', { c: C.paperDim, w: 8 }),
      `<circle cx="930" cy="520" r="24" fill="${C.cyan}"/>`,
      line('M919 520 h22 M932 511 l9 9 -9 9', { c: C.groundDeep, w: 5 })
    ]
  },
  {
    slug: 'firma-electronica',
    title: 'Firma electrónica',
    desc: 'Documento validado mediante firma electrónica avanzada y su sello de verificación.',
    art: () => [
      sheet(310, 140, 420, 470, { lines: 6 }),
      line('M360 500 C 410 452, 448 552, 498 486 S 592 430, 646 480', { c: C.cyanSoft, w: 8 }),
      `<circle cx="820" cy="360" r="106" fill="none" stroke="${C.cyan}" stroke-width="6" stroke-dasharray="14 11"/>`,
      `<circle cx="820" cy="360" r="76" fill="${C.cyan}"/>`,
      line('M786 360 l24 26 46 -54', { c: C.groundDeep, w: 10 })
    ]
  },
  {
    slug: 'identidad-digital-claveunica',
    title: 'Identidad digital y ClaveÚnica',
    desc: 'Credencial de identidad digital con la que una persona accede a los servicios del Estado.',
    art: () => [
      `<rect x="250" y="200" width="460" height="300" rx="22" fill="${C.paper}"/>`,
      `<circle cx="350" cy="300" r="44" fill="${C.paperDim}"/>`,
      `<path d="M306 380a44 46 0 0 1 88 0z" fill="${C.paperDim}"/>`,
      line('M440 276 H660', { c: C.paperDim, w: 11 }),
      line('M440 326 H600', { c: C.paperDim, w: 11 }),
      `<rect x="440" y="380" width="220" height="14" rx="7" fill="${C.cyan}"/>`,
      `<rect x="290" y="424" width="380" height="14" rx="7" fill="${C.paperDim}"/>`,
      `<g transform="translate(800 220)">`,
      `<path d="M40 120v-42a60 60 0 0 1 120 0v42" fill="none" stroke="${C.cyan}" stroke-width="22"/>`,
      `<rect x="0" y="120" width="200" height="170" rx="20" fill="${C.cyan}"/>`,
      `<circle cx="100" cy="196" r="20" fill="${C.groundDeep}"/>`,
      `<rect x="90" y="206" width="20" height="42" rx="10" fill="${C.groundDeep}"/>`,
      `</g>`
    ]
  },
  {
    slug: 'interoperabilidad',
    title: 'Interoperabilidad',
    desc: 'Dos instituciones del Estado intercambian datos para no volver a pedirlos a la ciudadanía.',
    art: () => [
      `<path d="M285 178l150 52H135z" fill="${C.paperDim}"/>`,
      `<rect x="150" y="230" width="270" height="230" rx="16" fill="${C.paper}"/>`,
      line('M200 300 V430 M285 300 V430 M370 300 V430', { c: C.paperDim, w: 16, cap: 'butt' }),
      `<path d="M915 178l150 52H765z" fill="${C.paperDim}"/>`,
      `<rect x="780" y="230" width="270" height="230" rx="16" fill="${C.paper}"/>`,
      line('M830 300 V430 M915 300 V430 M1000 300 V430', { c: C.paperDim, w: 16, cap: 'butt' }),
      line('M440 316 H760', { c: C.cyanSoft, w: 7 }),
      line('M726 292 L762 316 L726 340', { c: C.cyanSoft, w: 7 }),
      line('M760 400 H440', { c: C.cyanSoft, w: 7 }),
      line('M474 376 L438 400 L474 424', { c: C.cyanSoft, w: 7 }),
      `<circle cx="600" cy="358" r="34" fill="${C.cyan}"/>`,
      line('M586 358 h28 M600 344 v28', { c: C.groundDeep, w: 6 })
    ]
  },
  {
    slug: 'ciberseguridad',
    title: 'Ciberseguridad institucional',
    desc: 'Infraestructura municipal protegida: resguardo de los sistemas que sostienen el servicio.',
    art: () => [
      `<rect x="200" y="250" width="300" height="80" rx="12" fill="${C.paper}"/>`,
      `<rect x="200" y="352" width="300" height="80" rx="12" fill="${C.paper}"/>`,
      `<rect x="200" y="454" width="300" height="80" rx="12" fill="${C.paper}"/>`,
      `<circle cx="246" cy="290" r="12" fill="${C.cyan}"/>`,
      `<circle cx="246" cy="392" r="12" fill="${C.cyan}"/>`,
      `<circle cx="246" cy="494" r="12" fill="${C.paperDim}"/>`,
      line('M290 290 H452 M290 392 H420 M290 494 H452', { c: C.paperDim, w: 9 }),
      `<path d="M790 210l142 50v150c0 88-70 134-142 158-72-24-142-70-142-158V260z" fill="${C.cyan}" opacity=".16"/>`,
      `<path d="M790 160l190 66v186c0 116-94 176-190 206-96-30-190-90-190-206V226z" fill="none" stroke="${C.cyan}" stroke-width="8"/>`,
      line('M716 400 l52 54 108 -122', { c: C.cyanSoft, w: 12 })
    ]
  },
  {
    slug: 'proteccion-datos',
    title: 'Protección de datos personales',
    desc: 'Datos personales bajo resguardo: se accede solo a lo que corresponde y queda registrado.',
    art: () => [
      sheet(230, 160, 430, 450, { lines: 3 }),
      `<rect x="282" y="400" width="200" height="16" rx="8" fill="${C.groundDeep}"/>`,
      `<rect x="282" y="446" width="286" height="16" rx="8" fill="${C.groundDeep}"/>`,
      `<rect x="282" y="492" width="152" height="16" rx="8" fill="${C.groundDeep}"/>`,
      `<g transform="translate(730 250)">`,
      `<path d="M48 112V64a67 67 0 0 1 134 0v48" fill="none" stroke="${C.paper}" stroke-width="24"/>`,
      `<rect x="0" y="112" width="230" height="190" rx="22" fill="${C.paper}"/>`,
      `<circle cx="115" cy="192" r="24" fill="${C.cyan}"/>`,
      `<rect x="103" y="204" width="24" height="52" rx="12" fill="${C.cyan}"/>`,
      `</g>`
    ]
  },
  {
    slug: 'atencion-ciudadana-digital',
    title: 'Atención ciudadana digital',
    desc: 'Módulo de atención municipal donde el trámite se resuelve en pantalla, con la persona presente.',
    art: () => [
      appWindow(210, 150, 560, 330),
      sheet(250, 230, 200, 210, { lines: 3, tone: '#eef5f8' }),
      `<rect x="480" y="230" width="250" height="52" rx="10" fill="${C.cyan}"/>`,
      sheet(480, 306, 250, 60, { lines: 1, tone: '#eef5f8', rx: 10 }),
      sheet(480, 384, 250, 56, { lines: 1, tone: '#eef5f8', rx: 10 }),
      `<rect x="180" y="512" width="620" height="18" rx="9" fill="${C.paperDim}"/>`,
      person(920, 310, 1.5),
      `<rect x="836" y="424" width="168" height="86" rx="14" fill="${C.paper}"/>`,
      line('M868 456 H972 M868 486 H940', { c: C.paperDim, w: 9 })
    ]
  },
  {
    slug: 'capacitacion',
    title: 'Capacitación municipal',
    desc: 'Sesión de formación para equipos municipales en torno a una pantalla compartida.',
    art: () => [
      `<rect x="290" y="130" width="620" height="360" rx="18" fill="${C.paper}"/>`,
      `<rect x="330" y="176" width="300" height="34" rx="8" fill="${C.cyan}"/>`,
      line('M330 254 H860 M330 306 H790 M330 358 H846 M330 410 H700', { c: C.paperDim, w: 12 }),
      line('M600 490 V536', { c: C.paperDim, w: 10 }),
      `<rect x="500" y="536" width="200" height="14" rx="7" fill="${C.paperDim}"/>`,
      person(330, 620, 1.15),
      person(600, 620, 1.15),
      person(870, 620, 1.15)
    ]
  },
  {
    slug: 'gestion-del-cambio',
    title: 'Gestión del cambio',
    desc: 'El paso del trámite en papel al procedimiento digital, acompañando a quienes lo ejecutan.',
    art: () => [
      sheet(170, 250, 230, 290, { lines: 4, tone: '#dfe9ee' }),
      sheet(198, 222, 230, 290, { lines: 4, tone: '#eaf1f5' }),
      line('M470 380 C 560 250, 700 250, 790 380', { c: C.cyanSoft, w: 8 }),
      line('M760 342 L794 382 L750 396', { c: C.cyanSoft, w: 8 }),
      appWindow(800, 230, 260, 300, 14),
      sheet(830, 300, 200, 60, { lines: 1, tone: '#eef5f8', rx: 8 }),
      sheet(830, 378, 200, 60, { lines: 1, tone: '#eef5f8', rx: 8 }),
      `<circle cx="1030" cy="500" r="28" fill="${C.cyan}"/>`,
      line('M1017 500 l9 10 18 -21', { c: C.groundDeep, w: 6 }),
      person(600, 596, 1.1)
    ]
  },
  {
    slug: 'transformacion-digital-estado',
    title: 'Transformación digital del Estado',
    desc: 'Servicios del Estado sostenidos por una capa digital común.',
    art: () => [
      `<path d="M600 128l290 100H310z" fill="${C.paper}"/>`,
      `<rect x="340" y="228" width="520" height="24" rx="8" fill="${C.paper}"/>`,
      line('M406 268 V450 M520 268 V450 M680 268 V450 M794 268 V450', { c: C.paper, w: 30, cap: 'butt' }),
      `<rect x="330" y="450" width="540" height="26" rx="8" fill="${C.paper}"/>`,
      `<rect x="300" y="512" width="600" height="46" rx="12" fill="${C.cyan}" opacity=".28"/>`,
      `<rect x="340" y="522" width="140" height="26" rx="13" fill="${C.cyan}"/>`,
      `<rect x="500" y="522" width="200" height="26" rx="13" fill="${C.cyanSoft}"/>`,
      `<rect x="720" y="522" width="140" height="26" rx="13" fill="${C.cyan}"/>`
    ]
  },
  {
    slug: 'identidad-municipal',
    title: 'Identidad municipal de Constitución',
    desc: 'El edificio municipal sobre el territorio: la institución que sostiene el proceso.',
    art: () => [
      line('M600 150 V96', { c: C.cyanSoft, w: 6 }),
      `<path d="M600 100h74l-18 20 18 20h-74z" fill="${C.cyan}"/>`,
      `<path d="M600 150l250 92H350z" fill="${C.paper}"/>`,
      `<rect x="376" y="242" width="448" height="22" rx="8" fill="${C.paper}"/>`,
      line('M440 282 V466 M540 282 V466 M660 282 V466 M760 282 V466', { c: C.paper, w: 28, cap: 'butt' }),
      `<rect x="560" y="330" width="80" height="136" rx="8" fill="${C.cyan}"/>`,
      `<rect x="366" y="466" width="468" height="26" rx="8" fill="${C.paper}"/>`,
      `<rect x="300" y="524" width="600" height="16" rx="8" fill="${C.paperDim}" opacity=".5"/>`
    ]
  },
  {
    slug: 'implementacion-municipal',
    title: 'Implementación municipal',
    desc: 'La ruta de implementación por etapas, con los hitos ya cumplidos y los que siguen.',
    art: () => [
      line('M180 400 H1020', { c: C.line, w: 4 }),
      `<circle cx="250" cy="400" r="26" fill="${C.cyan}"/>`,
      `<circle cx="450" cy="400" r="26" fill="${C.cyan}"/>`,
      `<circle cx="650" cy="400" r="30" fill="${C.cyanSoft}"/>`,
      `<circle cx="650" cy="400" r="48" fill="none" stroke="${C.cyanSoft}" stroke-width="4" stroke-dasharray="10 8"/>`,
      `<circle cx="850" cy="400" r="26" fill="none" stroke="${C.paperDim}" stroke-width="6"/>`,
      `<circle cx="1010" cy="400" r="26" fill="none" stroke="${C.paperDim}" stroke-width="6"/>`,
      line('M238 400 l9 10 18 -21', { c: C.groundDeep, w: 5 }),
      line('M438 400 l9 10 18 -21', { c: C.groundDeep, w: 5 }),
      sheet(196, 190, 216, 150, { lines: 2, rx: 10 }),
      sheet(560, 190, 216, 150, { lines: 2, rx: 10 }),
      sheet(378, 462, 216, 150, { lines: 2, tone: '#e3edf2', rx: 10 }),
      sheet(760, 462, 216, 150, { lines: 2, tone: '#e3edf2', rx: 10 })
    ]
  },
  {
    slug: 'validacion-documental',
    title: 'Validación documental',
    desc: 'Comprobación de que un documento electrónico es auténtico, íntegro y verificable.',
    art: () => [
      sheet(200, 170, 360, 420, { lines: 5 }),
      sheet(420, 210, 360, 420, { lines: 5, tone: '#ffffff' }),
      `<circle cx="880" cy="330" r="92" fill="none" stroke="${C.cyan}" stroke-width="7"/>`,
      `<circle cx="880" cy="330" r="66" fill="none" stroke="${C.cyanSoft}" stroke-width="4" stroke-dasharray="9 9"/>`,
      line('M852 330 l20 22 38 -46', { c: C.cyanSoft, w: 9 }),
      line('M800 470 H1030 M800 520 H960', { c: C.paperDim, w: 9 })
    ]
  },
  {
    slug: 'notificaciones-electronicas',
    title: 'Notificaciones electrónicas',
    desc: 'Comunicación oficial enviada por vía electrónica, con constancia de su recepción.',
    art: () => [
      `<rect x="300" y="220" width="520" height="330" rx="18" fill="${C.paper}"/>`,
      `<path d="M300 240l260 190 260-190" fill="none" stroke="${C.paperDim}" stroke-width="14"/>`,
      `<circle cx="880" cy="300" r="72" fill="${C.cyan}"/>`,
      line('M848 300 l22 24 44 -50', { c: C.groundDeep, w: 10 }),
      line('M960 470 H1080 M960 520 H1030', { c: C.paperDim, w: 9 }),
      `<circle cx="930" cy="470" r="11" fill="${C.cyanSoft}"/>`,
      `<circle cx="930" cy="520" r="11" fill="${C.paperDim}"/>`
    ]
  }
];

/* ---------------------------------------------------------------- emisión */

fs.mkdirSync(OUT, { recursive: true });
const index = [];

themes.forEach((t, i) => {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t-${t.slug} d-${t.slug}">`,
    `<title id="t-${t.slug}">${esc(t.title)}</title>`,
    `<desc id="d-${t.slug}">${esc(t.desc)}</desc>`,
    frame((i % 3) * 8),
    t.art().join('\n'),
    `</svg>`
  ].join('\n') + '\n';

  const file = path.join(OUT, `${t.slug}.svg`);
  fs.writeFileSync(file, svg);
  index.push({
    slug: t.slug,
    title: t.title,
    desc: t.desc,
    file: `/assets/illustrations/transformacion-digital/${t.slug}.svg`,
    bytes: Buffer.byteLength(svg)
  });
  console.log(`· ${t.slug}.svg  ${Buffer.byteLength(svg)} B`);
});

fs.writeFileSync(
  path.join(OUT, 'index.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), width: W, height: H, items: index }, null, 2) + '\n'
);
console.log(`\n${index.length} ilustraciones generadas en ${OUT}`);
