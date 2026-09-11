/**
 * Genera docs/ASSET-SOURCES.md y docs/MATRIZ-DE-USO.md desde el manifiesto.
 *
 * Se generan en vez de escribirse a mano para que no puedan desincronizarse de
 * public/assets/assets-manifest.json: la tabla de licencias que no coincide con
 * los archivos reales es peor que no tener tabla.
 *
 *   node scripts/build-docs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const MANIFEST = 'public/assets/assets-manifest.json';
const SEED = 'seed/content.seed.json';

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));

const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim() || '—';
const link = url => (/^https?:/.test(url) ? `[origen](${url})` : cell(url));

/* ------------------------------------------------- dónde se usa cada activo */

const usage = {};
const note = (url, where) => { if (url) (usage[url] ||= []).push(where); };

for (const [k, v] of Object.entries(seed.site || {})) {
  if (/image/i.test(k) && typeof v === 'string') {
    const label = k === 'territoryImage1' ? 'Identidad local · pieza principal'
      : k === 'territoryImage2' ? 'Identidad local · pieza institucional'
      : k === 'brandLogo' ? 'Cabecera y pie · marca'
      : k === 'municipalCrest' ? 'Cabecera · escudo'
      : `Portada · ${k}`;
    note(v, label);
  }
}
const LABEL = { capsules: 'Cápsula', notes: 'Nota', libraryCollections: 'Colección' };
for (const col of ['capsules', 'notes', 'libraryCollections']) {
  for (const item of seed[col] || []) note(item.imageUrl, `${LABEL[col]} · ${item.title || item.id}`);
}
// El escudo y el logo se referencian directamente en el HTML del pie.
note('/assets/images/escudo-constitucion.svg', 'Pie de página · escudo');
note('/assets/images/logo-ruta-digital.svg', 'Pie de página · marca');

/* ----------------------------------------------------- ASSET-SOURCES.md */

const approved = manifest.assets.filter(a => a.status === 'approved');
const photos = approved.filter(a => a.type === 'photo');
const plates = approved.filter(a => a.type === 'illustration' && a.category === 'ilustracion');
const marks = approved.filter(a => a.category === 'marca-oficial');

const row = a => `| ${cell(a.title)} | \`${a.file}\` | ${cell(a.author)} | ${cell(a.institution)} | ${cell(a.license)} | ${link(a.sourcePage)} | ${a.width}×${a.height} | ${a.retrievedAt} | ${cell((usage[a.file] || []).join('; ') || 'Disponible, sin uso asignado')} |`;

const header = '| Nombre | Archivo local | Autor | Institución | Licencia / autorización | Origen | Dimensiones | Consultado | Uso en el portal |\n|---|---|---|---|---|---|---|---|---|';

const sources = `# Fuentes de recursos visuales

> Documento generado por \`scripts/build-docs.mjs\` desde \`${MANIFEST}\`.
> No editar a mano: una tabla de licencias que no coincide con los archivos
> reales es peor que no tener tabla. Para cambiar la procedencia de un recurso,
> edita el registro en \`scripts/build-assets.mjs\` y vuelve a generar.

Generado el ${manifest.generatedAt.slice(0, 10)} · rama \`${manifest.branch}\`.

Todos los activos se sirven desde el propio repositorio. **No hay hotlinking**
de logos, fotografías ni ilustraciones.

## Criterio de licencias

**Se acepta:** ${manifest.policy.accepted.join(' · ')}

**Se excluye:** ${manifest.policy.excluded.join(' · ')}

${manifest.policy.note}

## Lo que este criterio implica

Bajo estas reglas **no existe fotografía contemporánea utilizable de
Constitución**. Se verificó contra Wikimedia Commons: todo el material moderno
en alta resolución —vistas de la ciudad, río Maule, costanera— está publicado
como CC BY-SA 3.0 o 4.0, excluido por decisión del proyecto. Lo compatible se
reduce a material histórico de 1896 con autor desconocido (que el encargo
excluye) y a una formación rocosa de interés turístico.

Por eso el portal **no incorpora fotografía contemporánea nueva**. Conserva las
tres fotografías aportadas por el propietario, apoya el resto del relato visual
en un sistema ilustrativo propio, y deja registrado en
\`docs/SOLICITUD-MATERIAL-MUNICIPAL.md\` qué material hay que pedirle a la
municipalidad y con qué resolución y autorización.

## Fotografías

${header}
${photos.map(row).join('\n')}

## Marcas e identidad institucional

Los símbolos oficiales se usan tal cual: no se recortan, no se recolorean y no
se modifican.

${header}
${marks.map(row).join('\n')}

## Sistema ilustrativo propio

Obra original del proyecto, generada por \`scripts/build-illustrations.mjs\`.
Sin material de terceros y sin dependencias externas: ${plates.length} láminas de
${plates[0]?.width || 1200}×${plates[0]?.height || 750} con un mismo lenguaje visual.

${header}
${plates.map(row).join('\n')}

## Revisados y no incorporados

Constancia de lo que se verificó y por qué no se usa. **Ninguno de estos
recursos está en el repositorio.**

| Recurso | Licencia declarada | Autor | Origen | Estado | Motivo |
|---|---|---|---|---|---|
${manifest.notUsed.map(r => `| ${cell(r.title)} | ${cell(r.license)} | ${cell(r.author)} | ${link(r.sourcePage)} | ${cell(r.status)} | ${cell(r.reason)} |`).join('\n')}

## Recursos remotos no críticos

Los videos pueden incrustarse desde Google Drive o YouTube y los recursos de la
biblioteca enlazan a fuentes oficiales. Son contenido navegable, no activos
visuales del diseño: si esos servicios no responden, el layout no se rompe.
`;

/* ------------------------------------------------------ MATRIZ-DE-USO.md */

const allUsedUrls = new Set(Object.keys(usage));
const unused = approved.filter(a => !allUsedUrls.has(a.file));

const matrix = `# Matriz de uso de activos

> Documento generado por \`scripts/build-docs.mjs\`. Refleja el contenido base
> del repositorio (\`${SEED}\`); lo que la municipalidad asigne después desde
> \`/admin/\` no aparece aquí.

Generado el ${manifest.generatedAt.slice(0, 10)}.

Cada recurso tiene una función comunicacional asignada. Ninguno se repite en dos
secciones: la repetición era uno de los hallazgos de la auditoría.

| Sección / pieza | Activo | Tipo | Función comunicacional |
|---|---|---|---|
${Object.entries(usage).sort((a, b) => a[1][0].localeCompare(b[1][0])).flatMap(([url, places]) => {
  const asset = manifest.assets.find(a => a.file === url);
  return places.map(place => `| ${cell(place)} | \`${url.split('/').pop()}\` | ${asset?.type === 'photo' ? 'Fotografía' : 'Ilustración'} | ${cell(asset?.title)} |`);
}).join('\n')}

## Decisiones de asignación

| Sección | Decisión | Motivo |
|---|---|---|
| Portada (hero) | Sin fotografía | La única aérea disponible mide 640×360. A sangre en 1920 px exigía un degradado de tres paradas para tapar su falta de resolución, justo el recurso que el encargo prohíbe. El hero se sostiene en tipografía y color institucional. |
| Identidad local | Una fotografía + una lámina | Antes eran tres fotografías, lo que empujaba la lectura hacia galería turística. La aérea se muestra a proporción natural, no recortada. |
| Cápsulas | Una lámina distinta por tema | Antes tres ilustraciones servían a la vez de portada de cápsula y de colección. |
| Colecciones | Una lámina distinta por colección | Mismo motivo. |
| Notas | Fotografía municipal del propietario | Es el lugar donde esa imagen tiene función: la prueba presencial ocurre en ese edificio. |
| Cabecera y pie | Solo escudo y marca oficiales | Sin modificar, sin recortar, sin recolorear. |
| Ciberseguridad | Lámina institucional | Infraestructura municipal protegida, no iconografía de "hacker". |

## Aprobados sin uso asignado

Disponibles en el gestor visual de \`/admin/\` para que la edición decida.

${unused.length
  ? `| Activo | Tipo | Motivo de reserva |\n|---|---|---|\n${unused.map(a => `| ${cell(a.title)} | ${a.type === 'photo' ? 'Fotografía' : 'Ilustración'} | ${cell(a.notes || 'Parte del sistema ilustrativo, a disposición de la edición.')} |`).join('\n')}`
  : 'Ninguno: todos los activos aprobados tienen uso asignado.'}
`;

fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync(path.join('docs', 'ASSET-SOURCES.md'), sources);
fs.writeFileSync(path.join('docs', 'MATRIZ-DE-USO.md'), matrix);

console.log(`docs/ASSET-SOURCES.md   ${photos.length} fotografías · ${marks.length} marcas · ${plates.length} láminas · ${manifest.notUsed.length} no incorporados`);
console.log(`docs/MATRIZ-DE-USO.md   ${Object.keys(usage).length} activos con uso · ${unused.length} en reserva`);
