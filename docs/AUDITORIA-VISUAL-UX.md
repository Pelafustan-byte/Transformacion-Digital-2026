# Auditoría visual y de experiencia de uso

**Portal:** Ruta Digital Constitución — Municipalidad de Constitución, Región del Maule
**Auditado:** https://ruta-digital-visual-production.up.railway.app/ (rama `visual-polish-v1`)
**Fecha:** 10–11 de septiembre de 2026
**Rama de trabajo:** `visual-assets-constitucion-v1`

El despliegue en producción sirve exactamente el contenido de `visual-polish-v1`
(comprobado por diferencia byte a byte del HTML servido contra el de la rama).

## Método

Cada hallazgo se enuncia contra **la tarea concreta que le bloquea a un
funcionario municipal**, no como juicio estético. Los hallazgos se verificaron
en el navegador —interrogando el DOM y la red, no a ojo— y se reprodujeron en
los seis breakpoints del encargo mediante `scripts/capture-breakpoints.mjs`, que
genera las capturas de forma reproducible.

Las capturas están en `docs/screenshots/antes/` y `docs/screenshots/despues/`.

| Prioridad | Criterio |
|---|---|
| **P0** | Impide o corrompe una tarea. Hay pérdida de trabajo o de información |
| **P1** | La tarea se puede hacer, pero el portal entrega mal la información o excluye a parte de los usuarios |
| **P2** | Fricción, deuda técnica o incumplimiento de una regla del encargo |
| **P3** | Mejora de acabado |

---

## P0 — Impide la tarea

### P0-1 · El CMS no guarda nada de forma permanente

**Qué ocurre.** `GET /health` en producción devuelve `{"db": false}`: no hay
`DATABASE_URL` configurada. `server.js` cae entonces a modo archivo y escribe en
`data/content.json` y `data/uploads/` **dentro del contenedor**, y `railway.toml`
no declara ningún volumen.

**Tarea que bloquea.** Una funcionaria de comunicaciones redacta una cápsula,
sube una fotografía y la publica. En el siguiente despliegue —cualquier cambio
de código, un reinicio del servicio— su trabajo desaparece sin aviso. No hay
señal de que esto vaya a pasar: el panel confirma "Cambios publicados".

**Por qué es lo primero.** Invalida toda la Fase 5 del encargo: no tiene sentido
construir un gestor de biblioteca visual sobre un almacenamiento que se borra.

**Corregido.** `DATA_DIR` toma por defecto `RAILWAY_VOLUME_MOUNT_PATH`, de modo
que basta adjuntar un volumen en el panel de Railway. `/health` informa el modo
(`postgres` | `volume` | `local` | `ephemeral`) y si persiste. El arranque
registra una advertencia explícita. Y `/admin/` muestra un aviso visible **antes**
de que alguien edite creyendo que su trabajo queda guardado.
Procedimiento completo en [OPERACION.md](OPERACION.md).

> **Queda pendiente de la municipalidad:** adjuntar PostgreSQL o un volumen en
> Railway. El código ya está preparado; es un cambio de configuración, no de
> código.

### P0-2 · La portada nace vacía

**Qué ocurre.** Todo el contenido se pinta en el navegador desde
`/api/public/content`. El HTML que llega no contiene ni el titular ni las cifras.

**Verificado** en 390 × 844: durante la carga el hero aparece sin titular ni
texto, como un bloque azul de unos 600 px, y las cuatro cifras marcan `0`
—"0 recursos oficiales, 0 cápsulas publicadas"— hasta que responde la API.

**Tarea que bloquea.** Un funcionario abre el portal desde el móvil, con la red
municipal. Durante el primer segundo el portal comunica literalmente que no hay
nada: cero recursos, cero cápsulas. En los primeros cinco segundos —el criterio
del propio encargo— el propósito no se entiende porque no hay texto que leer.

**Efecto medible.** El LCP es texto que llega tarde, y las cifras saltan de `0`
a su valor definitivo, con desplazamiento de contenido.

### P0-3 · Una sección completa era ilegible: blanco sobre blanco

**Medido en producción.** La sección «Aprendizaje aplicado» (`#laboratorio`)
renderiza su texto en `rgb(255,255,255)` sobre un fondo `rgb(247,250,251)`.
Contraste **1,07:1**, cuando el mínimo AA para texto es 4,5:1.

**Qué se pierde.** El titular, las cuatro pestañas, el enunciado del quiz, las
tres opciones de respuesta y el botón «Reiniciar» son invisibles. Solo se ven
los elementos en cian. La sección de aprendizaje del portal —cuatro módulos
completos: quiz, datos, escenarios y recomendaciones por rol— no se puede usar.

**Causa.** `lab.css` construye toda la sección sobre fondo oscuro: su texto es
`#fff` y sus bordes `#ffffffXX`. Una regla posterior en `visual-polish.css`
—`.lab{background:#f7fafb}`— aclaró el fondo sin tocar los colores del texto.
Una línea inutilizó la sección entera.

**Tarea que bloquea.** Un funcionario que entra a capacitarse encuentra una
zona en blanco con un botón suelto. No hay forma de saber que ahí hay contenido.

**Corregido.** Se devuelve el fondo oscuro institucional, coherente con el resto
del sistema. Contraste del titular medido tras el cambio: **13,86:1**.

---

## P1 — La tarea se puede hacer, pero mal

### P1-1 · El texto alternativo se pedía, se guardaba y se tiraba

**Qué ocurría.** El panel pide "Texto alternativo de portada" (`coverAlt`) y el
servidor lo saneaba correctamente. Pero `app.js` emitía `alt=""` y
`visual-polish.js` lo sobrescribía con la cadena de metadatos de la tarjeta.

**Verificado en producción.** Las portadas de cápsula anunciaban
*"Gestión documental · 10 sept 2026"*, y la portada de la nota
*"10 sept 2026 · Equipo de Transformación Digital"*.

**Tarea que bloquea.** Un funcionario con lector de pantalla escucha una fecha
donde debería oír qué muestra la imagen. Y la editora que se tomó el trabajo de
redactar el texto alternativo no tenía forma de saber que no se usaba.

**Corregido.** Manda el texto alternativo editorial. Si no lo hay, la imagen se
marca como decorativa (`alt=""`), que es lo correcto, en lugar de inventar una
descripción falsa. El *smoke test* comprueba que el campo llega al portal.

### P1-2 · Desplazamiento de contenido por imágenes sin dimensiones

**Qué ocurría.** De las once imágenes de la portada, solo dos declaraban `width`
y `height`. Peor: el logo del pie declaraba `120×42` y se renderizaba `42×42`
—la proporción declarada era falsa, lo que garantiza el salto en vez de evitarlo.

**Tarea que bloquea.** Un funcionario pulsa un enlace de la biblioteca y el
contenido se mueve bajo el dedo justo al llegar la imagen.

**Corregido.** Todas las imágenes declaran sus dimensiones reales, tomadas del
manifiesto de activos, y las tarjetas reservan su proporción.

### P1-3 · Fotografías usadas muy por encima de su resolución

**Medido.** `constitucion-aerea.webp` es de **640 × 360 px** y se usaba como
fondo a sangre del hero en pantallas de 1920 px *y además* como figura
territorial recortada a 345 × 300, una proporción distinta a la suya.
`municipalidad.webp` es de 480 × 270 y `atardecer-sol.webp` de 360 × 270.

**Tarea que bloquea.** El portal representa a la institución. Una imagen
visiblemente blanda en la portada comunica descuido, y es lo primero que ve
quien llega.

**Corregido.** Ver P1-4. Pendiente de material: ver
[SOLICITUD-MATERIAL-MUNICIPAL.md](SOLICITUD-MATERIAL-MUNICIPAL.md).

### P1-4 · Degradado oscuro para tapar la fotografía

**Qué ocurría.** `app.js` aplicaba un `linear-gradient` de tres paradas sobre la
imagen del hero. Es exactamente el recurso que el encargo prohíbe —"degradados
oscuros utilizados para esconder fotografías de mala calidad"— y existía porque
la fotografía no aguantaba el tamaño.

**Corregido.** El hero deja de llevar fotografía. Se sostiene en tipografía y
color institucional, con la retícula de plano que lo vincula al sistema
ilustrativo. No finge una imagen que no existe.

Además, el portal ahora **exige** que quien edita declare un ancho de 1800 px o
más (`heroImageMinWidth`) antes de volver a usar una fotografía como fondo a
sangre. Es la salvaguarda que evita repetir el problema.

### P1-5 · Recursos repetidos en varias secciones

**Verificado en el contenido real.** `municipalidad.webp` aparecía en la sección
territorial *y* como portada de nota. Las mismas tres ilustraciones
(`illustration-signature`, `illustration-identity`, `illustration-implementation`)
servían a la vez de portada de cápsula y de ilustración de colección.

**Corregido.** Catorce asignaciones, ninguna repetida; comprobado
programáticamente. La fotografía municipal aportada por el propietario se
conserva en su nota, que es donde tiene función: la prueba presencial ocurre en
ese edificio.

### P1-6 · El CMS dejaba editar imágenes que la hoja de estilos ocultaba

**Corrección de esta auditoría.** En una primera lectura registré la sección
territorial como una galería de tres fotografías. Al verificarlo en el navegador
resultó ser otra cosa, y peor: `visual-polish.css` contenía
`.territoryGrid figure:not(:first-child){display:none}`. En pantalla solo se veía
**una** fotografía. Las otras dos estaban en el contenido, se descargaban, y
nunca se mostraban.

**Tarea que bloquea.** Una editora entra a `/admin/`, cambia la fotografía
territorial secundaria, guarda, ve «Cambios publicados» y abre el portal: no ha
cambiado nada, y no hay ninguna pista de por qué. El panel ofrece un campo que
la hoja de estilos anula.

Esto explica además el hallazgo P1-7: las imágenes ocultas seguían
descargándose. Y explica por qué `municipalidad.webp` estaba duplicada en el
contenido sin que la duplicación se notara en pantalla.

**Corregido.** Se retira la regla que ocultaba las figuras. La sección pasa a
dos piezas con función distinta: la fotografía territorial a su proporción
natural —sin recorte forzado— y una lámina institucional. El degradado inferior
solo se aplica sobre fotografía, donde sirve para la legibilidad del pie; sobre
las láminas tapaba el dibujo sin ganar nada.

Al hacerlas visibles apareció un segundo defecto: combinar `aspect-ratio` con
`align-self:stretch` hacía que el ancho de la segunda figura se derivara de la
altura heredada (455 × 1,6 = 728 px) y desbordara su columna de 501 px,
provocando desplazamiento horizontal del documento (`scrollWidth` 1566 px en un
viewport de 1440). Corregido y verificado: `scrollWidth` = 1440.

La fotografía del atardecer se conserva íntegra y queda disponible en el gestor
visual: se retira del portal, no del repositorio.

### P1-7 · Descarga de imágenes que no se ven

**Medido** en 390 × 844: `municipalidad.webp` y `atardecer-sol.webp` se
descargaban con caja de `0 × 0` px. Bytes que nunca se ven.

**Corregido** por la reestructuración de la sección territorial.

---

## P2 — Fricción y deuda

### P2-1 · Sin entrega responsive de imágenes

No había `srcset`, `sizes` ni AVIF: una sola resolución para los seis
breakpoints.

**Corregido parcialmente, y con una salvedad honesta.** Se construyó el
pipeline completo (`scripts/build-assets.mjs`) con derivados WebP y AVIF
responsive y un mapa compacto para el navegador. Pero de doce derivados
candidatos **sobrevivieron dos**: estas fotografías son tan pequeñas y vienen
tan comprimidas que reescribirlas pesaba igual o más que el original. El script
descarta esos derivados en vez de servirlos.

La conclusión honesta es que **hoy no hay ganancia de peso que obtener por esta
vía**: las tres fotografías suman unos 27 kB. El pipeline queda operativo para
cuando lleguen fotografías reales. Detalle en
[INFORME-RENDIMIENTO-VISUAL.md](INFORME-RENDIMIENTO-VISUAL.md).

### P2-2 · No existía manifiesto de activos

`docs/ASSET-SOURCES.md` era una tabla escrita a mano, sin dimensiones, sin fecha
de consulta y sin estado de aprobación, que podía desincronizarse de los
archivos reales sin que nadie lo notara.

**Corregido.** `public/assets/assets-manifest.json` se genera desde el registro
de procedencia, y `docs/ASSET-SOURCES.md` se genera desde el manifiesto. Una
tabla de licencias que no coincide con los archivos es peor que no tener tabla.

### P2-3 · `SiteEditor` no exponía todos los campos visuales

El panel permitía editar `territoryImage1` pero no las piezas 2 y 3, y no
ofrecía campo de texto alternativo para el hero ni para el territorio.

**Corregido.** Ver `admin/src/main.jsx`.

### P2-4 · Política de seguridad de contenido desactivada

`server.js` arranca con `helmet({contentSecurityPolicy:false})`. Queda
**documentado, no corregido**: activar CSP sin revisar los `iframe` de video de
Drive y YouTube rompería la reproducción, y esa verificación excede el alcance
de este encargo visual. Recomendado abordarlo como trabajo propio.

---

## P3 — Acabado

- El aviso de error de carga del portal se inyecta con estilos en línea y sin
  `role="alert"`.
- El paquete de `/admin/` supera los 500 kB minificado; no afecta al portal
  público, que es estático.
- Las ilustraciones heredadas en `public/assets/images/illustration-*.svg`
  conviven con el sistema nuevo. Se conservan a propósito, porque contenido
  publicado puede referenciarlas.

---

## Lo que no se corrigió, y por qué

| Hallazgo | Estado | Motivo |
|---|---|---|
| P0-1 persistencia | Código listo, **falta configurar Railway** | Adjuntar PostgreSQL o un volumen es una acción sobre la infraestructura del municipio |
| P2-4 CSP | Documentado | Exige revisar los `iframe` de video; fuera del alcance visual |
| Fotografía contemporánea | **No existe bajo el criterio acordado** | Ver [ASSET-SOURCES.md](ASSET-SOURCES.md) y [SOLICITUD-MATERIAL-MUNICIPAL.md](SOLICITUD-MATERIAL-MUNICIPAL.md) |

## Nota de método sobre las capturas

El panel de navegador integrado no captura de forma fiable a 1440 × 900: el
marco de captura no coincide con el viewport y produce imágenes en blanco al
desplazarse. Por eso las capturas del entregable se generan con
`scripts/capture-breakpoints.mjs`, que controla un Chrome real y produce los
mismos archivos en cada ejecución.

```bash
BASE_URL=http://127.0.0.1:3210 OUT=docs/screenshots/despues node scripts/capture-breakpoints.mjs
```
