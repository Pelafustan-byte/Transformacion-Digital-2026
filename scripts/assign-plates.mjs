/**
 * Asigna una lámina distinta por tema a cápsulas, notas y colecciones, y
 * redacta el texto alternativo editorial de cada portada.
 *
 * Motivo: las mismas tres ilustraciones servían a la vez de portada de cápsula
 * y de ilustración de colección, y `municipalidad.webp` aparecía en la sección
 * territorial y como portada de nota. El encargo prohíbe expresamente repetir
 * un recurso en varias secciones.
 *
 * Solo rellena o corrige asignaciones del contenido base del repositorio.
 * No toca imágenes que el municipio haya subido desde /admin/.
 *
 *   node scripts/assign-plates.mjs
 */
import fs from 'node:fs';

const SEED = 'seed/content.seed.json';
const P = '/assets/illustrations/transformacion-digital/';

/** id -> [lámina, texto alternativo contextual] */
const CAPSULES = {
  'cap-fedok': [P + 'expediente-electronico.svg',
    'Ilustración: una carpeta con pestañas indexadas y la trazabilidad de sus actuaciones, que representa el paso del documento suelto al expediente electrónico.'],
  'cap-firma': [P + 'firma-electronica.svg',
    'Ilustración: un documento firmado electrónicamente junto al sello circular de verificación que acredita su validez.'],
  'cap-interoperabilidad': [P + 'interoperabilidad.svg',
    'Ilustración: dos edificios institucionales que intercambian datos entre sí, para no volver a pedirle a la ciudadanía lo que el Estado ya tiene.']
};

const COLLECTIONS = {
  base: [P + 'transformacion-digital-estado.svg',
    'Ilustración: los servicios del Estado sostenidos por una capa digital común.'],
  firma: [P + 'validacion-documental.svg',
    'Ilustración: comprobación de que un documento electrónico es auténtico, íntegro y verificable.'],
  com: [P + 'notificaciones-electronicas.svg',
    'Ilustración: una comunicación oficial enviada por vía electrónica, con constancia de su recepción.'],
  interop: [P + 'identidad-digital-claveunica.svg',
    'Ilustración: credencial de identidad digital y la llave con que una persona accede a los servicios del Estado.'],
  seg: [P + 'ciberseguridad.svg',
    'Ilustración: la infraestructura municipal protegida por un escudo, como resguardo de los sistemas que sostienen el servicio.'],
  impl: [P + 'implementacion-municipal.svg',
    'Ilustración: la ruta de implementación por etapas, con los hitos ya cumplidos y los que siguen.']
};

// La nota conserva la fotografía municipal aportada por el propietario: es el
// lugar donde esa imagen tiene función —la prueba presencial ocurre allí— y deja
// de competir con la sección territorial, que era la duplicación real.
const NOTES = {
  'note-prueba-fedok': ['/assets/images/municipalidad.webp',
    'Edificio consistorial de la Municipalidad de Constitución, sede de la primera prueba presencial de FEDOK y firma electrónica.']
};

const data = JSON.parse(fs.readFileSync(SEED, 'utf8'));
const changes = [];

function apply(collection, map) {
  for (const item of data[collection] || []) {
    const entry = map[item.id];
    if (!entry) continue;
    const [file, alt] = entry;
    if (item.imageUrl !== file) {
      changes.push(`${collection}/${item.id}: imagen ${item.imageUrl || '(ninguna)'} -> ${file}`);
      item.imageUrl = file;
    }
    if (item.coverAlt !== alt) {
      changes.push(`${collection}/${item.id}: alt redactado`);
      item.coverAlt = alt;
    }
  }
}

apply('capsules', CAPSULES);
apply('libraryCollections', COLLECTIONS);
apply('notes', NOTES);

/* --------------------------------------------------------------- portada */

// El hero deja de llevar fotografía. La aérea disponible mide 640×360: usada
// como fondo a sangre en 1920 px obligaba a un gradiente de tres paradas para
// disimular su falta de resolución, que es justo el recurso que el encargo
// prohíbe. Sin una fotografía territorial que aguante ese tamaño, el hero es
// institucional y tipográfico, y la aérea se reserva para identidad local,
// donde se muestra a su proporción natural.
//
// Cuando la municipalidad entregue una aérea autorizada de al menos 2400 px de
// ancho, basta volver a definir `heroImage` desde /admin/ para recuperar el
// fondo fotográfico sin tocar código.
const site = data.site;
if (site.heroImage) {
  delete site.heroImage;
  changes.push('site: el hero deja de usar la aérea de 640×360 como fondo a sangre');
}
delete site.heroPanelImage;
delete site.heroPanelAlt;

// La sección territorial pasa de tres fotografías —que la hacían leerse como
// galería turística— a una pieza territorial y una lámina institucional.
if (site.territoryImage3) {
  delete site.territoryImage3;
  delete site.territoryCaption3;
  changes.push('site: se retira la tercera fotografía territorial (atardecer)');
}
if (site.territoryImage2 === '/assets/images/municipalidad.webp') {
  changes.push('site: territorio 2 pasa a lámina institucional (la foto municipal queda solo en su nota)');
  site.territoryImage2 = P + 'identidad-municipal.svg';
  site.territoryCaption2 = 'La institución que conduce el proceso';
}
site.territoryAlt1 = site.territoryAlt1 || 'Vista aérea de Constitución y su borde costero en la desembocadura del río Maule.';
site.territoryAlt2 = site.territoryAlt2 || 'Ilustración: el edificio municipal de Constitución sobre el territorio.';

fs.writeFileSync(SEED, JSON.stringify(data, null, 2) + '\n');
console.log(changes.length ? changes.map(c => '· ' + c).join('\n') : 'Sin cambios.');
console.log(`\n${changes.length} cambio(s) aplicados a ${SEED}`);
