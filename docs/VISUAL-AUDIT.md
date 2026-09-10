# Auditoría visual y editorial

## Estado de partida

- Sitio público servido desde `public/`; existían archivos estáticos históricos duplicados en la raíz que no forman parte del runtime.
- El hero usaba una fotografía local como fondo completo con un gradiente dominante y una escala tipográfica cercana a una landing comercial.
- Cápsulas y notas omitían por completo el bloque visual cuando `imageUrl` estaba vacío.
- Las colecciones ya almacenaban una ilustración editable, pero la hoja `visual-v4.css` que mejoraba su tratamiento no estaba enlazada.
- La sección territorial mostraba tres fotografías y corría el riesgo de leerse como galería turística.
- Material base utilizaba cajas uniformes sin una diferenciación visual clara por tipo.
- `/admin/` permitía editar recursos pero no exponía las colecciones de biblioteca, aunque la API sí las aceptaba.
- El proyecto tenía fuente React/Vite para el CMS, pero no declaraba las dependencias de desarrollo ni un script de compilación.
- Las fotografías existentes son locales y livianas, pero sus resoluciones (360–640 px de ancho) son menores que las recomendables para pantallas Retina. No se inventó detalle ni se sustituyeron por fotografías generadas.

## Implementación

- Nuevo sistema visual “bitácora municipal digital” documentado en `DESIGN.md`.
- Hero dividido entre información institucional y un único recurso territorial.
- Ritmo editorial variable para videos, material, cápsulas, hitos, biblioteca, notas y actualidad.
- Fallbacks SVG temáticos y recuperación automática ante errores de imagen.
- Header y footer institucionales, acceso discreto a Administración y salto al contenido.
- Soporte de foco visible, navegación responsive y `prefers-reduced-motion`.
- Edición de colecciones, ilustración, categorías y recurso recomendado desde `/admin/`.
- Límite explícito de 8 MB para imágenes subidas al CMS.

## Pendiente condicionado a fuentes

Se recomienda reemplazar la fotografía aérea de 640×360 por el original autorizado de mayor resolución si el municipio lo conserva. El diseño mantiene la proporción y el recorte preparados para esa sustitución desde el CMS.
