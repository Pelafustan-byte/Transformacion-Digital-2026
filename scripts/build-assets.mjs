/**
 * Biblioteca de activos: procedencia, derivados responsive y manifiesto.
 *
 * Este script es la única fuente de verdad sobre la procedencia de cada imagen
 * del portal. El registro de abajo se completa a mano tras verificar la licencia
 * recurso por recurso; el script no infiere licencias ni las deduce del dominio
 * de origen.
 *
 * Qué hace:
 *   1. Recorre los activos declarados y comprueba que el archivo abre de verdad.
 *   2. Lee ancho, alto y proporción reales (sharp para mapa de bits, viewBox
 *      para SVG). No amplía nada: las variantes nunca superan el original.
 *   3. Genera WebP y AVIF responsive en public/assets/photos/… y miniaturas de
 *      catálogo en public/assets/thumbnails/, sin mover los originales, para no
 *      romper el contenido ya publicado que los referencia.
 *   4. Escribe public/assets/assets-manifest.json, que consume el portal y el
 *      gestor visual de /admin/.
 *
 *   node scripts/build-assets.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const MANIFEST = path.join(PUBLIC, 'assets', 'assets-manifest.json');
const THUMBS = 'assets/thumbnails';
const WIDTHS = [480, 768, 1200, 1600];
const THUMB_W = 320;

/* ------------------------------------------------------------------
   REGISTRO DE PROCEDENCIA

   Cada entrada se verificó individualmente. `license` transcribe lo que
   declara la fuente; no se interpreta ni se amplía. Si la licencia no está
   clara, el activo va con status "pending-authorization" y NO se descarga
   ni se usa.
   ------------------------------------------------------------------ */

const OWNER_GRANT = 'Autorización del propietario del proyecto para este portal';
const OWN_WORK = 'Obra original del proyecto Ruta Digital Constitución';

const REGISTRY = [
  /* --- Fotografía territorial aportada por el propietario ---------------- */
  {
    id: 'constitucion-aerea',
    file: 'assets/images/constitucion-aerea.webp',
    title: 'Vista aérea de Constitución',
    description: 'Vista aérea de la ciudad de Constitución en la desembocadura del río Maule, con el borde costero y la trama urbana.',
    alt: 'Vista aérea de Constitución y su borde costero en la desembocadura del río Maule.',
    category: 'territorio',
    tags: ['constitución', 'río maule', 'borde costero', 'vista aérea', 'territorio'],
    location: 'Constitución, Región del Maule, Chile',
    author: 'No informado',
    institution: 'Municipalidad de Constitución',
    sourcePage: 'No aplica: material entregado con el repositorio del proyecto',
    license: OWNER_GRANT,
    attribution: 'Municipalidad de Constitución',
    retrievedAt: '2026-09-10',
    usage: ['Identidad local · pieza territorial principal'],
    status: 'approved',
    responsive: true,
    notes: 'Resolución de origen 640×360: insuficiente para fondo a sangre en pantallas grandes. Se usa a proporción natural. Solicitar original de mayor resolución (ver docs/SOLICITUD-MATERIAL-MUNICIPAL.md).'
  },
  {
    id: 'municipalidad-edificio',
    file: 'assets/images/municipalidad.webp',
    title: 'Edificio consistorial de Constitución',
    description: 'Fachada del edificio de la Municipalidad de Constitución, sede de la atención y de las pruebas de implementación.',
    alt: 'Edificio consistorial de la Municipalidad de Constitución.',
    category: 'municipalidad',
    tags: ['municipalidad', 'edificio consistorial', 'institución', 'constitución'],
    location: 'Constitución, Región del Maule, Chile',
    author: 'No informado',
    institution: 'Municipalidad de Constitución',
    sourcePage: 'No aplica: material entregado con el repositorio del proyecto',
    license: OWNER_GRANT,
    attribution: 'Municipalidad de Constitución',
    retrievedAt: '2026-09-10',
    usage: ['Nota · primera prueba presencial de FEDOK y firma electrónica'],
    status: 'approved',
    responsive: true,
    notes: 'Resolución de origen 480×270.'
  },
  {
    id: 'atardecer-costa',
    file: 'assets/images/atardecer-sol.webp',
    title: 'Atardecer en el borde costero',
    description: 'Atardecer sobre el borde costero de Constitución.',
    alt: 'Atardecer sobre el borde costero de Constitución.',
    category: 'territorio',
    tags: ['constitución', 'borde costero', 'atardecer'],
    location: 'Constitución, Región del Maule, Chile',
    author: 'No informado',
    institution: 'Municipalidad de Constitución',
    sourcePage: 'No aplica: material entregado con el repositorio del proyecto',
    license: OWNER_GRANT,
    attribution: 'Municipalidad de Constitución',
    retrievedAt: '2026-09-10',
    usage: [],
    status: 'approved',
    responsive: true,
    notes: 'Disponible en el gestor visual pero sin uso asignado: como tercera fotografía de la sección territorial empujaba la lectura hacia galería turística. Se conserva íntegra para que la edición decida.'
  },

  /* --- Marcas institucionales ------------------------------------------- */
  {
    id: 'escudo-constitucion',
    file: 'assets/images/escudo-constitucion.svg',
    title: 'Escudo de la Municipalidad de Constitución',
    description: 'Escudo institucional de la Municipalidad de Constitución.',
    alt: 'Escudo de la Municipalidad de Constitución.',
    category: 'marca-oficial',
    tags: ['escudo', 'símbolo oficial', 'municipalidad'],
    location: 'Constitución, Región del Maule, Chile',
    author: 'Municipalidad de Constitución',
    institution: 'Municipalidad de Constitución',
    sourcePage: 'No aplica: material institucional entregado con el proyecto',
    license: 'Uso institucional. Símbolo oficial: no se modifica, no se recolorea, no se recorta.',
    // El .svg es en realidad un WebP incrustado en un <image>: librsvg no lo
    // decodifica y la miniatura salía transparente. Se genera desde el PNG
    // equivalente del mismo símbolo, ya presente en el repositorio.
    thumbnailSource: 'assets/brand/escudo-constitucion@2x.png',
    attribution: 'Municipalidad de Constitución',
    retrievedAt: '2026-09-10',
    usage: ['Cabecera', 'Pie de página'],
    status: 'approved',
    responsive: false,
    locked: true
  },
  {
    id: 'logo-ruta-digital',
    file: 'assets/images/logo-ruta-digital.svg',
    title: 'Logo Ruta Digital Constitución',
    description: 'Marca del programa Ruta Digital Constitución.',
    alt: 'Ruta Digital Constitución.',
    category: 'marca-oficial',
    tags: ['logo', 'ruta digital', 'marca'],
    location: 'Constitución, Región del Maule, Chile',
    author: 'Municipalidad de Constitución',
    institution: 'Municipalidad de Constitución',
    sourcePage: 'No aplica: material institucional entregado con el proyecto',
    license: 'Uso institucional. No se modifica.',
    attribution: 'Municipalidad de Constitución',
    retrievedAt: '2026-09-10',
    usage: ['Cabecera', 'Pie de página'],
    status: 'approved',
    responsive: false,
    locked: true
  },
  {
    id: 'emblema-contraloria',
    file: 'assets/images/emblema-contraloria.svg',
    title: 'Emblema Contraloría Municipal',
    description: 'Emblema de la Contraloría Municipal.',
    alt: 'Emblema de la Contraloría Municipal.',
    category: 'marca-oficial',
    tags: ['contraloría', 'emblema'],
    location: 'Constitución, Región del Maule, Chile',
    author: 'Municipalidad de Constitución',
    institution: 'Municipalidad de Constitución',
    sourcePage: 'No aplica: material institucional entregado con el proyecto',
    license: 'Uso institucional. No se modifica.',
    attribution: 'Municipalidad de Constitución',
    retrievedAt: '2026-09-10',
    usage: [],
    status: 'approved',
    responsive: false,
    locked: true
  }
];

/* Las láminas del sistema ilustrativo se incorporan desde su índice generado. */
const PLATES_DIR = 'assets/illustrations/transformacion-digital';
const platesIndexPath = path.join(PUBLIC, PLATES_DIR, 'index.json');
if (fs.existsSync(platesIndexPath)) {
  const idx = JSON.parse(fs.readFileSync(platesIndexPath, 'utf8'));
  for (const item of idx.items) {
    REGISTRY.push({
      id: `lamina-${item.slug}`,
      file: `${PLATES_DIR}/${item.slug}.svg`,
      title: item.title,
      description: item.desc,
      alt: `Ilustración: ${item.desc.charAt(0).toLowerCase()}${item.desc.slice(1)}`,
      category: 'ilustracion',
      tags: item.slug.split('-'),
      location: '',
      author: 'Proyecto Ruta Digital Constitución',
      institution: 'Municipalidad de Constitución',
      sourcePage: 'No aplica: obra original generada por scripts/build-illustrations.mjs',
      license: OWN_WORK,
      attribution: 'Ruta Digital Constitución',
      retrievedAt: '2026-09-10',
      usage: [],
      status: 'approved',
      responsive: false
    });
  }
}

/* ------------------------------------------------------------------
   RECURSOS DESCARTADOS Y PENDIENTES

   Se registran explícitamente para dejar constancia de qué se revisó y por
   qué no se usa. No se descargan ni se incorporan al repositorio.
   ------------------------------------------------------------------ */

const REJECTED = [
  {
    id: 'commons-puerto-constitucion-1896',
    title: 'Puerto de Constitución (Nueva Bilbao)',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Chile_-_puerto_Constituci%C3%B3n_(nueva_Bilbao).jpg',
    license: 'Dominio público (obra de 1896)',
    author: 'Autor desconocido',
    institution: 'Prensa Histórica, Ministerio de Cultura de España',
    width: 977, height: 520,
    retrievedAt: '2026-09-10',
    status: 'rejected',
    reason: 'El encargo excluye expresamente las imágenes de autor desconocido. Además es material de 1896: situaría al portal en clave patrimonial, no de transformación digital.'
  },
  {
    id: 'commons-piedra-lobo-1896',
    title: 'Piedra del Lobo, Constitución',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Chile_-_Constituci%C3%B3n,_piedra_del_lobo.jpg',
    license: 'Dominio público (obra de 1896)',
    author: 'Autor desconocido',
    institution: 'Prensa Histórica, Ministerio de Cultura de España',
    width: 977, height: 676,
    retrievedAt: '2026-09-10',
    status: 'rejected',
    reason: 'Autor desconocido (excluido por el encargo) y motivo turístico sin relación con el proceso digital.'
  },
  {
    id: 'commons-piedra-iglesia-1896',
    title: 'Vista de la Piedra de la Iglesia, Constitución',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Chile_-_Constituci%C3%B3n,_vista_de_la_piedra_de_la_iglesia.jpg',
    license: 'Dominio público (obra de 1896)',
    author: 'Autor desconocido',
    institution: 'Prensa Histórica, Ministerio de Cultura de España',
    width: 1128, height: 526,
    retrievedAt: '2026-09-10',
    status: 'rejected',
    reason: 'Autor desconocido (excluido por el encargo) y motivo turístico.'
  },
  {
    id: 'commons-piedra-iglesia-ccby',
    title: 'Piedra de la Iglesia',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Piedra_de_la_Iglesia.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    author: 'Tomás Jorquera Sepúlveda',
    institution: 'Flickr / Wikimedia Commons',
    width: 1024, height: 768,
    retrievedAt: '2026-09-10',
    status: 'available-unused',
    reason: 'Licencia compatible y verificada (CC BY 2.0, atribución obligatoria). No se incorpora porque es una formación rocosa de interés turístico: el encargo pide expresamente no convertir el portal en una página de turismo. Queda documentada por si la edición decide usarla con crédito visible.'
  },
  {
    id: 'commons-constitucion-contemporaneas',
    title: 'Fotografías contemporáneas de Constitución en Wikimedia Commons',
    sourcePage: 'https://commons.wikimedia.org/wiki/Category:Constituci%C3%B3n,_Chile',
    license: 'CC BY-SA 3.0 / CC BY-SA 4.0',
    author: 'Varios',
    institution: 'Wikimedia Commons',
    retrievedAt: '2026-09-10',
    status: 'rejected',
    reason: 'Todo el material contemporáneo en alta resolución (vistas de ciudad, río Maule, costanera) es share-alike, excluido por decisión del proyecto. Es la razón por la que el portal no incorpora fotografía contemporánea nueva.'
  }
];

/* ------------------------------------------------------------------ util */

const rel = p => path.relative(ROOT, p).replaceAll('\\', '/');

function svgSize(absolute) {
  const src = fs.readFileSync(absolute, 'utf8');
  const vb = src.match(/viewBox\s*=\s*["']\s*[\d.+-]+\s+[\d.+-]+\s+([\d.+-]+)\s+([\d.+-]+)/i);
  if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
  const w = src.match(/\bwidth\s*=\s*["'](\d+)/i), h = src.match(/\bheight\s*=\s*["'](\d+)/i);
  if (w && h) return { width: +w[1], height: +h[1] };
  return null;
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function ratio(w, h) {
  const g = gcd(w, h) || 1;
  return `${w / g}:${h / g}`;
}

/* ----------------------------------------------------------------- build */

const manifest = [];
const problems = [];
const notes = [];

for (const entry of REGISTRY) {
  const absolute = path.join(PUBLIC, entry.file);

  if (!fs.existsSync(absolute)) {
    problems.push(`FALTA  ${entry.file} (declarado como ${entry.id})`);
    continue;
  }

  const bytes = fs.statSync(absolute).size;
  const isSvg = /\.svg$/i.test(entry.file);
  let size = null;

  if (isSvg) {
    size = svgSize(absolute);
    if (!size) problems.push(`SIN DIMENSIONES  ${entry.file}: el SVG no declara viewBox ni width/height`);
  } else {
    try {
      const meta = await sharp(absolute).metadata();
      // Comprobación real de que el archivo abre y no está corrupto.
      await sharp(absolute).stats();
      size = { width: meta.width, height: meta.height };
    } catch (error) {
      problems.push(`CORRUPTO  ${entry.file}: ${error.message}`);
      continue;
    }
  }

  const record = {
    id: entry.id,
    file: '/' + entry.file,
    thumbnail: '',
    title: entry.title,
    description: entry.description,
    alt: entry.alt,
    category: entry.category,
    tags: entry.tags,
    location: entry.location,
    author: entry.author,
    institution: entry.institution,
    sourcePage: entry.sourcePage,
    sourceFile: '/' + entry.file,
    license: entry.license,
    attribution: entry.attribution,
    retrievedAt: entry.retrievedAt,
    width: size?.width ?? 0,
    height: size?.height ?? 0,
    aspectRatio: size ? ratio(size.width, size.height) : '',
    bytes,
    type: isSvg ? 'illustration' : 'photo',
    locked: !!entry.locked,
    usage: entry.usage,
    status: entry.status,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
  };
  if (entry.notes) record.notes = entry.notes;

  /* Derivados: solo para mapa de bits y nunca por encima del original. */
  if (!isSvg && entry.responsive && size) {
    const folder = entry.category === 'municipalidad' ? 'photos/municipalidad' : 'photos/constitucion';
    const outDir = path.join(PUBLIC, 'assets', folder);
    fs.mkdirSync(outDir, { recursive: true });

    // Anchos candidatos: nunca por encima del original, y siempre incluyendo su
    // tamaño real para poder comparar formatos contra el archivo de partida.
    const targets = [...new Set([...WIDTHS.filter(w => w < size.width), size.width])];
    const sources = [];
    const discarded = [];

    for (const w of targets) {
      for (const [fmt, opts] of [['avif', { quality: 52 }], ['webp', { quality: 80 }]]) {
        const name = `${entry.id}-${w}.${fmt}`;
        const target = path.join(outDir, name);
        await sharp(absolute)
          .resize({ width: w, withoutEnlargement: true })
          .toFormat(fmt, opts)
          .toFile(target);                          // sharp no arrastra EXIF por defecto
        const derivedBytes = fs.statSync(target).size;

        // Estos originales ya vienen comprimidos y son pequeños (360–640 px):
        // reescribirlos puede pesar MÁS que el archivo de partida, con pérdida
        // adicional y sin ganancia. En ese caso el derivado se descarta: servir
        // el original es la opción correcta.
        if (derivedBytes >= bytes) {
          fs.unlinkSync(target);
          discarded.push({ format: fmt, width: w, bytes: derivedBytes });
          continue;
        }
        sources.push({ format: fmt, width: w, url: `/assets/${folder}/${name}`, bytes: derivedBytes });
      }
    }

    if (sources.length) {
      record.sources = sources;
      record.srcset = {
        avif: sources.filter(s => s.format === 'avif').map(s => `${s.url} ${s.width}w`).join(', '),
        webp: sources.filter(s => s.format === 'webp').map(s => `${s.url} ${s.width}w`).join(', ')
      };
    }
    if (discarded.length) {
      record.discardedDerivatives = discarded;
      notes.push(`${entry.file}: ${discarded.length} derivado(s) descartado(s) por pesar igual o más que el original (${bytes} B).`);
    }
  }

  /* Miniatura de catálogo para el gestor visual de /admin/. */
  const thumbDir = path.join(PUBLIC, THUMBS);
  fs.mkdirSync(thumbDir, { recursive: true });
  const thumbName = `${entry.id}.webp`;
  const thumbPath = path.join(thumbDir, thumbName);
  const thumbSourceRel = entry.thumbnailSource || entry.file;
  const thumbSource = path.join(PUBLIC, thumbSourceRel);
  try {
    const sourceIsSvg = /\.svg$/i.test(thumbSourceRel);
    await sharp(thumbSource, sourceIsSvg ? { density: 120 } : {})
      .resize({ width: THUMB_W, withoutEnlargement: !sourceIsSvg })
      .webp({ quality: 78 })
      .toFile(thumbPath);

    // Una miniatura puede escribirse sin error y salir completamente vacía:
    // ocurre con los SVG que solo envuelven un WebP incrustado, que librsvg no
    // decodifica. Se comprueba que tenga contenido real en vez de confiar en
    // que la conversión no lanzó excepción.
    const stats = await sharp(thumbPath).stats();
    const blank = stats.channels.every(c => c.max === 0);
    if (blank) {
      fs.unlinkSync(thumbPath);
      problems.push(`MINIATURA EN BLANCO  ${thumbSourceRel}: se generó sin contenido visible. Declara "thumbnailSource" con un archivo rasterizable.`);
    } else {
      record.thumbnail = `/${THUMBS}/${thumbName}`;
      if (entry.thumbnailSource) record.thumbnailSource = '/' + thumbSourceRel;
    }
  } catch (error) {
    problems.push(`MINIATURA  ${thumbSourceRel}: ${error.message}`);
  }

  manifest.push(record);
}

/* Duplicados binarios entre activos declarados. */
const byHash = new Map();
for (const r of manifest) {
  if (!byHash.has(r.sha256)) byHash.set(r.sha256, []);
  byHash.get(r.sha256).push(r.file);
}
const duplicates = [...byHash.values()].filter(g => g.length > 1);
for (const g of duplicates) problems.push(`DUPLICADO  mismo contenido en: ${g.join(', ')}`);

const out = {
  generatedAt: new Date().toISOString(),
  branch: 'visual-assets-constitucion-v1',
  policy: {
    accepted: ['Dominio público', 'CC BY', 'Obra original del proyecto', 'Material institucional con autorización del propietario'],
    excluded: ['CC BY-SA (share-alike)', 'Autor desconocido', 'Todos los derechos reservados', 'Redes sociales', 'Prensa sin autorización', 'Hotlinking'],
    note: 'Las licencias se transcriben de la fuente verificada individualmente. Ninguna se infiere del dominio de origen.'
  },
  counts: {
    approved: manifest.filter(r => r.status === 'approved').length,
    photos: manifest.filter(r => r.type === 'photo').length,
    illustrations: manifest.filter(r => r.type === 'illustration').length,
    rejectedOrPending: REJECTED.length
  },
  assets: manifest,
  notUsed: REJECTED,
  problems,
  notes
};

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2) + '\n');


/*
 * Mapa compacto para el portal público: url original -> variantes.
 *
 * El manifiesto completo pesa demasiado para pedirlo en cada visita; este mapa
 * contiene solo lo que el navegador necesita para elegir formato y tamaño.
 * Hoy incluye una sola fotografía —las otras dos ya venían tan comprimidas que
 * todo derivado pesaba más que el original y se descartó—, pero deja la entrega
 * responsive operativa para cuando la municipalidad aporte material real.
 */
const sourceMap = {};
for (const r of manifest) {
  if (!r.srcset) continue;
  sourceMap[r.file] = { width: r.width, height: r.height, avif: r.srcset.avif, webp: r.srcset.webp };
}
fs.writeFileSync(
  path.join(PUBLIC, 'assets', 'image-sources.json'),
  JSON.stringify(sourceMap, null, 2) + String.fromCharCode(10)
);

console.log(`Activos aprobados : ${out.counts.approved}`);
console.log(`  fotografías     : ${out.counts.photos}`);
console.log(`  ilustraciones   : ${out.counts.illustrations}`);
console.log(`Descartados/pend. : ${out.counts.rejectedOrPending}`);
console.log(`Manifiesto        : ${rel(MANIFEST)}`);
if (notes.length) {
  console.log('\nNotas de optimización:');
  for (const n of notes) console.log('  · ' + n);
}
if (problems.length) {
  console.log('\nIncidencias:');
  for (const p of problems) console.log('  · ' + p);
  process.exitCode = 1;
} else {
  console.log('\nSin incidencias: todos los archivos abren y no hay duplicados binarios.');
}
