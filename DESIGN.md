# Design System — Ruta Digital Constitución

## Direction

**Bitácora municipal digital.** El portal combina la claridad de una carpeta de implementación pública con la precisión de un mapa de procesos. La identidad territorial aparece como contexto y horizonte; los conceptos digitales se explican mediante un sistema vectorial propio.

## Surface Modes

- Portal público: `Read`, con jerarquía editorial, rutas de consulta y lectura progresiva.
- Panel `/admin/`: `Operate`, denso, predecible y orientado a publicar sin fricción.

## Color

- Azul bahía — `#063B5C`: identidad institucional principal.
- Azul municipal — `#0A6FA4`: acciones, enlaces y estados activos.
- Turquesa señal — `#13A6A6`: hitos, foco y confirmación.
- Celeste papel — `#E8F3F7`: fondos de apoyo y agrupación.
- Tinta — `#173042`: texto principal.
- Gris costa — `#667C88`: texto secundario.
- Blanco — `#FFFFFF`: superficie y contraste.

El color comunica estado y estructura; nunca es la única señal. No se usan gradientes decorativos intensos ni resplandores.

## Typography

Fuente principal: `Inter`, `Segoe UI`, sans-serif del sistema. Títulos con peso 700–780 y tracking contenido; cuerpo de 16–18 px con líneas de 60–75 caracteres. No se usan cursivas serif como adorno ni etiquetas sistemáticamente en mayúsculas.

## Layout

Una línea vertical de proceso y una retícula de 12 columnas unen las secciones. La página alterna tres ritmos: lectura amplia, bandas operativas compactas y módulos editoriales asimétricos. Los bordes y números solo aparecen cuando codifican colección, secuencia o estado.

## Component Character

- Esquinas moderadas de 12–18 px, no una cápsula universal.
- Sombras mínimas; separación mediante contraste, bordes y espacio.
- Botones rectangulares con radio pequeño y verbos claros.
- Tarjetas solo cuando existe una unidad editorial real.
- Estados de foco visibles con anillo turquesa de alto contraste.

## Imagery

- Una fotografía territorial decisiva en portada.
- Fotografía local solo para territorio, edificio, personas o hechos concretos.
- Ilustraciones SVG originales, geométricas y de dos o tres tintas para conceptos digitales.
- Cada imagen tiene proporción estable, dimensiones declaradas, texto alternativo y fallback por categoría.
- Ningún activo crítico depende de hotlinks.

## Motion

Una sola gramática: la línea de proceso se activa al recorrer la página y los cambios de filtro/colección son inmediatos. Con `prefers-reduced-motion`, todo se presenta en su estado final.

## Responsive

La jerarquía se conserva reduciendo columnas, no encogiendo tipografía. En móvil, navegación desplegable accesible, módulos de ancho completo y carriles horizontales solo cuando el patrón expresa una secuencia real.

## Anti-patterns

- No estética SaaS o landing comercial.
- No mosaicos de tarjetas idénticas.
- No fotografías como fondos universales.
- No frases promocionales genéricas.
- No iconos sueltos que no expliquen una función.
- No vidrio, glow, blobs o gradientes como sustitutos de contenido.
