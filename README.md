# Transformación Digital 2026 — Municipalidad de Constitución

Sitio institucional independiente para comunicar el proceso de Transformación Digital de la Municipalidad de Constitución.

## Objetivo

Reemplazar progresivamente el antiguo Google Sites por una experiencia web propia, moderna, institucional y fácil de mantener, que permita publicar:

- cápsulas y noticias breves;
- avances de implementación;
- hitos de la hoja de ruta 2026–2027;
- normativa y documentos útiles;
- herramientas del Estado;
- material de capacitación;
- contenidos sobre gestión documental, interoperabilidad, ciberseguridad y atención digital.

## Enfoque técnico inicial

La primera versión se construye como sitio estático, sin dependencias ni backend, para que pueda alojarse en prácticamente cualquier hosting municipal (Apache, Nginx, cPanel u otro) copiando los archivos del repositorio.

La publicación de cápsulas y recursos se centraliza en archivos JSON dentro de `/content`, evitando editar directamente la estructura visual de la portada.

## Estructura

```text
/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/app.js
└── content/
    ├── capsulas.json
    └── recursos.json
```

## Próximas etapas

1. Inventario y migración del contenido del Google Sites original.
2. Incorporación de identidad gráfica municipal definitiva y fotografías auténticas de Constitución.
3. Desarrollo de páginas interiores para cápsulas, normativa, recursos y hoja de ruta.
4. Buscador y filtros por temas.
5. Flujo editorial simplificado para que el equipo pueda publicar sin tocar código.
6. Preparación de paquete final para hosting municipal y despliegue de prueba.

## Estado

Prototipo base en construcción — septiembre de 2026.
