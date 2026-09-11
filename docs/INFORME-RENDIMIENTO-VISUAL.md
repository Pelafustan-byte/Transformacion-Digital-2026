# Informe de rendimiento visual

Medido con `scripts/verify-visual.mjs` sobre la rama `visual-assets-constitucion-v1`,
en un Chrome real controlado por Playwright, en los seis breakpoints del encargo.
Los datos completos están en [`verificacion-visual.json`](verificacion-visual.json).

## Resultados

| Breakpoint | CLS | Imágenes | Peso transferido | Peticiones | Sin dimensiones | Descargadas y ocultas |
|---|---|---|---|---|---|---|
| 1920 × 1080 | 0,0111 | 10 | 59 kB | 9 | 0 | 0 |
| 1440 × 900 | 0,0021 | 10 | 59 kB | 9 | 0 | 0 |
| 1366 × 768 | 0,0027 | 10 | 59 kB | 9 | 0 | 0 |
| 1024 × 768 | 0,0068 | 10 | 62 kB | 10 | 0 | 0 |
| 768 × 1024 | **0** | 10 | 59 kB | 9 | 0 | 0 |
| 390 × 844 | **0** | 10 | 59 kB | 9 | 0 | 0 |

El umbral «bueno» de CLS es 0,1. El peor breakpoint queda en 0,0111.

## Desplazamiento de contenido: de 0,236 a 0

El problema no eran las fotografías. Era que el portal se pintaba entero en el
navegador: el HTML llegaba sin titular y con las cuatro cifras en `0`, y cuando
respondía `/api/public/content` el hero crecía y empujaba toda la página.

Medición antes de la corrección:

| Breakpoint | CLS antes | CLS después |
|---|---|---|
| 1920 × 1080 | 0,0653 | 0,0111 |
| 1440 × 900 | 0,0659 | 0,0021 |
| 1366 × 768 | 0,0818 | 0,0027 |
| 1024 × 768 | 0,0934 | 0,0068 |
| **768 × 1024** | **0,2362** | **0** |
| 390 × 844 | 0 | 0 |

La corrección fue servir la portada con el texto ya escrito en el HTML
(`renderIndex()` en `server.js`), rellenando los mismos nodos que rellenaría
`app.js`. El render de cliente sigue siendo la fuente de verdad y reescribe los
mismos valores; lo que cambia es que la primera pintura ya no está vacía.

Efecto secundario, más importante que la cifra: en los primeros cinco segundos
el portal ahora dice qué es. Antes anunciaba «0 recursos oficiales, 0 cápsulas
publicadas» hasta que respondía la API.

## Peso de imágenes: 59 kB en portada

El peso ya era bajo y sigue siéndolo. El desglose del repositorio:

| Carpeta | Peso |
|---|---|
| `public/assets/illustrations/` (16 láminas SVG) | 115 kB |
| `public/assets/images/` (fotografías y marcas) | 120 kB |
| `public/assets/thumbnails/` (catálogo del CMS) | 148 kB |
| `public/assets/photos/` (derivados responsive) | 20 kB |

Las miniaturas solo las carga `/admin/`, no el portal público.

## Sobre las variantes responsive: una conclusión honesta

Se construyó el pipeline completo —`scripts/build-assets.mjs` genera WebP y
AVIF en cuatro anchos y un mapa compacto para el navegador—, pero de **doce
derivados candidatos sobrevivieron dos**.

El motivo: las tres fotografías disponibles miden entre 360 y 640 px de ancho y
ya vienen comprimidas como WebP. Reescribirlas a menor tamaño producía archivos
**más pesados** que el original, con pérdida adicional y sin ganancia alguna:

| Original | Peso | Derivado candidato | Peso | Resultado |
|---|---|---|---|---|
| `constitucion-aerea.webp` 640×360 | 14 180 B | WebP 480 | 25 060 B | descartado |
| `constitucion-aerea.webp` | 14 180 B | AVIF 480 | 14 839 B | descartado |
| `municipalidad.webp` 480×270 | 6 056 B | ambos formatos | mayores | descartados |
| `atardecer-sol.webp` 360×270 | 7 276 B | AVIF 360 | 4 894 B | **conservado (−33 %)** |

El script descarta automáticamente cualquier derivado que no sea más ligero que
su original, en vez de servirlo. Servir el archivo de partida es, en estos
casos, la decisión correcta.

**Conclusión:** hoy no hay peso que recuperar por la vía de la entrega
responsive. El pipeline queda operativo y el manifiesto ya declara `srcset`,
de modo que cuando la municipalidad aporte fotografías de la resolución pedida
en [SOLICITUD-MATERIAL-MUNICIPAL.md](SOLICITUD-MATERIAL-MUNICIPAL.md) la
optimización rendirá de verdad. Prometer una mejora que no existe sería peor que
no medir.

## Otras verificaciones

| Comprobación | Resultado |
|---|---|
| Fallos de contraste AA | **0** en los seis breakpoints |
| Objetivos táctiles < 44 × 44 | **0** en los seis breakpoints |
| Focos sin indicador visible | **0** (14 elementos recorridos por breakpoint) |
| `prefers-reduced-motion` | Respetado: 0 elementos siguen con transición |
| Desplazamiento horizontal | **0** breakpoints desbordan |
| Imágenes sin `width`/`height` | **0** |
| Imágenes sin atributo `alt` | **0** |
| Imágenes descargadas pero ocultas | **0** |
| Activos declarados que no existen | **0** de 22 |
| Duplicados binarios | **0** |
| Hotlinking de activos de diseño | **Ninguno** |

## Punto de atención fuera de alcance

Los videos se incrustan desde Google Drive. En una sesión sin acceso, el
`iframe` devuelve 401 y 404 contra `accounts.google.com`: no es un defecto del
portal, pero implica que **si el archivo de Drive no está compartido
públicamente, el funcionario verá un error dentro del reproductor**. Conviene
verificar los permisos de cada video en Drive.

## Reproducir estas mediciones

```bash
node server.js                       # en otra terminal
BASE_URL=http://127.0.0.1:3210 node scripts/verify-visual.mjs
```
