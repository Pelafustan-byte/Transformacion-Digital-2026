# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El público principal son funcionarias, funcionarios y equipos de la Municipalidad de Constitución que necesitan consultar material, comprender obligaciones y aplicar la Transformación Digital en su trabajo cotidiano. El equipo editorial municipal utiliza `/admin/` para mantener el portal sin editar código.

## Product Purpose

Ruta Digital Constitución reúne contenidos, herramientas, avances y recursos oficiales para apoyar la implementación municipal de la Transformación Digital. El producto es exitoso cuando el personal municipal encuentra información vigente con rapidez y el equipo responsable puede publicar, ordenar y actualizar contenidos desde el CMS.

## Positioning

Es un portal público y editorial construido específicamente alrededor del proceso real de Transformación Digital de la Municipalidad de Constitución: conecta normativa y plataformas del Estado con hitos, capacitación y orientación municipal local.

## Operating Context

- Consulta pública desde escritorio, tablet y teléfono.
- Publicación frecuente de cápsulas, notas, videos, materiales, noticias, hitos, recursos y colecciones.
- Uso de fuentes oficiales del Estado y material institucional propio.
- Contenidos editoriales administrados desde `/admin/` y servidos por la API pública.
- Despliegue en Railway con PostgreSQL en producción y almacenamiento local como alternativa de desarrollo.

## Capabilities and Constraints

- El sitio público, la API, `/admin/`, la carga de archivos, los estados editoriales y el ordenamiento deben seguir funcionando.
- El frontend público debe reflejar cambios del CMS sin modificaciones de código.
- Ningún activo visual crítico puede depender de una URL externa.
- Las fotografías externas solo se incorporan cuando existe una licencia comprobable y documentada.
- Los símbolos oficiales no se rediseñan ni se alteran.
- Las imágenes deben tener fallbacks robustos y el layout no debe colapsar cuando falte contenido.
- El producto debe conservar accesibilidad, rendimiento responsive y soporte para `prefers-reduced-motion`.

## Brand Commitments

- Nombre: Ruta Digital Constitución.
- Descriptor: Transformación Digital · Municipalidad de Constitución.
- Carácter: institucional, municipal, moderno, útil y humano; no comercial ni turístico.
- Voz: directa, pública, chilena neutra y orientada al trabajo municipal, sin frases promocionales genéricas.
- Identidad visual vinculada a azul marino, azul municipal, celeste, turquesa, blanco y grises suaves.
- Las fotografías reales representan territorio, personas, edificios municipales o hechos locales; los conceptos digitales abstractos se representan mediante ilustración original.

## Evidence on Hand

- Contenido editorial base en `seed/content.seed.json`.
- Portal público en `public/index.html` y `public/assets/`.
- CMS React en `admin/` con compilado servido desde `public/admin/`.
- API y persistencia en `server.js`.
- Logos, escudos, fotografías e ilustraciones existentes en `public/assets/images/`.
- Inventario de migración y fuentes históricas en `docs/inventario-migracion.md`.
- No se deben fabricar testimonios, métricas de impacto ni afirmaciones institucionales no respaldadas.

## Product Principles

1. Identidad municipal antes que decoración.
2. Claridad y utilidad antes que densidad visual.
3. Contenido editable y mantenible antes que composiciones hardcodeadas.
4. Ilustración propia para lo digital; fotografía auténtica y puntual para lo territorial.
5. Fuentes oficiales, trazabilidad de activos y ausencia de hotlinks críticos.

## Accessibility & Inclusion

El portal debe preservar contraste suficiente, jerarquía semántica, navegación por teclado, foco visible, textos alternativos útiles, controles con tamaño legible y una experiencia estable con movimiento reducido.
