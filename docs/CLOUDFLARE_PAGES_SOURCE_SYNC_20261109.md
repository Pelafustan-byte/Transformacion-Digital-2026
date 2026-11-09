# Publicación de Ruta Digital desde el repositorio

Fuente de verdad: rama `visual-polish-v1` de `Pelafustan-byte/Transformacion-Digital-2026`.
Proyecto: Cloudflare Pages `ruta-digital-codigo-actual`.

La salida pública procede de `public/`. Esta sincronización sustituye al Worker de reconstrucción parcial. Las rutas administrativas y API necesitan migración separada del servidor Express, base PostgreSQL Neon y R2 antes de habilitar acciones de edición.

No usar Railway como origen. Conservar datos y acceso administrativo hasta comprobar recuperación y permisos.
