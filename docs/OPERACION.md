# Operación y persistencia

## El problema

`server.js` guarda el contenido editable y los archivos subidos desde `/admin/` en uno de tres lugares,
en este orden de preferencia:

| Modo | Cuándo se activa | Persiste |
|---|---|---|
| `postgres` | Existe `DATABASE_URL` | Sí |
| `volume` | `DATA_DIR` apunta a un volumen montado (`RAILWAY_VOLUME_MOUNT_PATH`) | Sí |
| `local` | Fuera de producción (`NODE_ENV != production`) | Sí, en tu disco |
| `ephemeral` | Producción sin base de datos y sin volumen | **No** |

En el despliegue actual de Railway, `GET /health` devuelve `"db": false` y no hay volumen montado.
Eso significa que el CMS está escribiendo dentro del sistema de archivos del contenedor: **cada
redespliegue descarta todas las ediciones hechas desde `/admin/` y todas las imágenes subidas.**
No es un riesgo teórico; es el comportamiento actual.

Desde este cambio, `GET /health` informa el modo y el arranque registra una advertencia explícita
cuando el almacenamiento es efímero, y el panel `/admin/` muestra un aviso visible para que nadie
edite creyendo que su trabajo queda guardado.

## Solución recomendada: PostgreSQL

Es la opción preferible porque también guarda los archivos subidos (tabla `rd_media`) y sobrevive
a cambios de contenedor.

1. En el proyecto de Railway: **New → Database → Add PostgreSQL**.
2. En el servicio del portal, **Variables → Add Variable Reference** → selecciona `DATABASE_URL`
   de la base recién creada.
3. Redespliega. `server.js` crea las tablas (`rd_content`, `rd_media`) y carga `seed/content.seed.json`
   automáticamente la primera vez.
4. Verifica: `curl https://<dominio>/health` debe responder `"storage":"postgres","persistent":true`.

## Alternativa: volumen

Sirve si se prefiere mantener el contenido como archivos JSON.

1. En el servicio del portal: **Settings → Volumes → Add Volume**, con punto de montaje `/data`.
2. No hace falta configurar `DATA_DIR`: el servidor usa `RAILWAY_VOLUME_MOUNT_PATH` por defecto.
3. Verifica: `"storage":"volume","persistent":true`.

## Migrar el contenido que ya está publicado

Antes de cambiar el modo de almacenamiento, **descarga el contenido vigente** para no perderlo:

1. Entra a `/admin/` e inicia sesión.
2. Usa la exportación: `GET /api/admin/export/content.json` (botón de exportar en el panel).
3. Guarda ese archivo.

Tras adjuntar PostgreSQL o el volumen, el servidor arranca con el contenido de `seed/content.seed.json`.
Si el contenido publicado difería del seed, restaura desde el JSON exportado sustituyendo
`seed/content.seed.json` en la rama y redesplegando, o cargándolo vía la API de administración.

## Variables de entorno

| Variable | Obligatoria en producción | Nota |
|---|---|---|
| `ADMIN_USER` | Sí | Por defecto `editor`. |
| `ADMIN_PASSWORD` | Sí | El valor por defecto `ruta-digital-local` **no** debe usarse en producción. |
| `SESSION_SECRET` | Sí | Firma la cookie de sesión. Cambiar el valor por defecto. |
| `DATABASE_URL` | Recomendada | Activa el modo `postgres`. |
| `DATA_DIR` | No | Solo si se quiere forzar una ruta distinta a la del volumen. |
| `PORT` | No | Railway la inyecta. |

## Comprobación rápida

```bash
curl -s https://<dominio>/health
```

Respuesta esperada en un despliegue correcto:

```json
{"ok":true,"db":true,"service":"ruta-digital-cms","storage":"postgres","persistent":true}
```

Si aparece `"persistent": false`, el contenido editorial **no** está a salvo.
