# Material fotográfico que debe solicitarse a la Municipalidad

## Por qué existe este documento

El portal no incorpora fotografía contemporánea de Constitución porque, bajo el
criterio de licencias del proyecto —dominio público y CC BY, sin share-alike—,
**no existe ninguna disponible**. Se verificó recurso por recurso contra
Wikimedia Commons: todo el material moderno en alta resolución está publicado
como CC BY-SA, y lo compatible se reduce a material de 1896 con autor
desconocido y a una formación rocosa turística. El detalle está en
[ASSET-SOURCES.md](ASSET-SOURCES.md), sección «Revisados y no incorporados».

No se rellenaron esos espacios con imágenes dudosas. En su lugar el portal usa
un sistema ilustrativo propio, y este documento precisa qué hace falta pedir.

El diseño ya está preparado para recibir cada una de estas fotografías: se
asignan desde `/admin/` sin tocar código.

## Qué se necesita, por orden de impacto

### 1. Vista aérea de Constitución — prioridad alta

| | |
|---|---|
| **Dónde iría** | Portada (hero), como fondo a sangre |
| **Resolución mínima** | 2400 × 1350 px (16:9). Ideal 3840 × 2160 |
| **Formato de entrega** | JPEG o PNG sin comprimir agresivamente, o el RAW original |
| **Encuadre** | Ciudad y desembocadura del río Maule. Debe dejar espacio limpio a la izquierda para el titular |
| **Lo que hay hoy** | `constitucion-aerea.webp`, 640 × 360 px |
| **Por qué no sirve** | A 1920 px se ve blanda. Para disimularlo había un degradado de tres paradas encima, que es exactamente lo que el encargo prohíbe. Por eso el hero hoy no lleva fotografía |
| **Autorización necesaria** | Constancia escrita de que la Municipalidad es titular o tiene licencia de uso, y autorización para publicarla en este portal. Si la tomó un tercero (dron contratado, fotógrafo), hace falta el nombre del autor y su autorización |

### 2. Edificio consistorial — prioridad alta

| | |
|---|---|
| **Dónde iría** | Identidad local y notas sobre implementación |
| **Resolución mínima** | 1800 × 1200 px |
| **Encuadre** | Fachada completa, luz diurna, sin vehículos en primer plano |
| **Lo que hay hoy** | `municipalidad.webp`, 480 × 270 px |
| **Autorización necesaria** | Titularidad municipal o autorización del autor. Al ser un edificio público en vía pública no hay restricción de derechos de imagen sobre el inmueble |

### 3. Atención ciudadana en módulo digital — prioridad alta

| | |
|---|---|
| **Dónde iría** | Sección de atención ciudadana digital, hoy resuelta con ilustración |
| **Resolución mínima** | 1800 × 1200 px |
| **Encuadre** | Funcionario o funcionaria atendiendo en pantalla. Que se vea el trámite, no un posado |
| **Autorización necesaria** | **Consentimiento escrito de cada persona identificable**, indicando el uso en un portal público de acceso abierto y por tiempo indefinido. Es un dato personal: sin ese consentimiento no puede publicarse. Alternativa: encuadre que no permita identificar rostros |

### 4. Equipos municipales en capacitación — prioridad media

| | |
|---|---|
| **Dónde iría** | Sección de capacitación y gestión del cambio |
| **Resolución mínima** | 1800 × 1200 px |
| **Encuadre** | Sesión real de formación, no una foto de grupo |
| **Autorización necesaria** | Consentimiento escrito de las personas identificables, en los mismos términos del punto 3 |

### 5. Prueba presencial de FEDOK y firma electrónica — prioridad media

| | |
|---|---|
| **Dónde iría** | Nota de implementación local |
| **Resolución mínima** | 1600 × 900 px |
| **Encuadre** | El momento de la firma o la derivación del documento en pantalla |
| **Autorización necesaria** | Consentimiento de las personas que aparezcan |

### 6. Borde costero y río Maule — prioridad baja

| | |
|---|---|
| **Dónde iría** | Identidad local, como apoyo territorial |
| **Resolución mínima** | 2000 × 1125 px |
| **Nota** | Material de apoyo, no protagonista: el portal es una bitácora de transformación digital, no una página de turismo |
| **Autorización necesaria** | Titularidad o autorización del autor |

### 7. Plaza y centro urbano — prioridad baja

| | |
|---|---|
| **Resolución mínima** | 1800 × 1200 px |
| **Autorización necesaria** | Titularidad o autorización del autor. Consentimiento si hay personas identificables en primer plano |

## Qué debe acompañar a cada fotografía

Sin estos cuatro datos el recurso no puede incorporarse, por buena que sea la
imagen:

1. **Autor** — nombre de la persona o unidad que la tomó. «Autor desconocido»
   no es admisible: el encargo lo excluye expresamente.
2. **Titularidad o licencia** — quién posee los derechos y bajo qué condiciones
   se cede el uso.
3. **Autorización de publicación** — constancia escrita de que puede publicarse
   en este portal, de acceso abierto.
4. **Fecha de captura** — para poder informar la antigüedad del material.

Y cuando aparezcan personas identificables:

5. **Consentimiento informado de cada una**, por escrito, indicando que la
   imagen se publicará en un sitio web público y por tiempo indefinido.

## Cómo incorporarlas cuando lleguen

1. Colocar los originales en `public/assets/photos/constitucion/` o
   `public/assets/photos/municipalidad/`.
2. Añadir su registro de procedencia en `scripts/build-assets.mjs` con los datos
   de arriba.
3. Ejecutar `node scripts/build-assets.mjs` — genera derivados responsive,
   miniaturas y actualiza el manifiesto.
4. Ejecutar `node scripts/build-docs.mjs` — actualiza la tabla de fuentes.
5. Asignarlas desde `/admin/ → Biblioteca visual`, redactando el texto
   alternativo.

Para devolver la fotografía al hero, además, definir `heroImage` y
`heroImageMinWidth` en `/admin/ → Textos y portada`. El portal exige un ancho
declarado de 1800 px o más antes de volver a usar una fotografía como fondo a
sangre: es la salvaguarda que evita repetir el problema actual.
