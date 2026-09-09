# Inventario y matriz de migración

## Proyecto Transformación Digital 2026

Fecha de levantamiento inicial: 9 de septiembre de 2026.  
Última actualización: 9 de septiembre de 2026, posterior al rescate mediante Google Takeout.

Este documento registra el contenido efectivamente recuperado del antiguo Google Sites, el material institucional asociado y la decisión de migración hacia la nueva plataforma independiente.

---

## 1. Fuente original y rescate

Sitio de referencia:

`https://sites.google.com/mconstitucion.cl/transformaciondigital/p%C3%A1gina-principal`

La exportación de Google Takeout permitió recuperar las versiones `PUBLISHED` y `DRAFT` de `Página principal`.

### Hallazgo principal

El sitio antiguo no estaba construido principalmente con bloques nativos de Google Sites. Google Sites funcionaba como contenedor de una **aplicación HTML/CSS/JavaScript de una sola página**, incrustada mediante un bloque de código.

El HTML interno fue recuperado íntegramente desde el atributo `data-code` de la exportación.

- Tamaño aproximado del portal incrustado: 104 KB.
- `PUBLISHED` y `DRAFT` contienen exactamente el mismo portal interno.
- 9 secciones principales.
- 30 encabezados.
- 10 enlaces estáticos visibles en el HTML base.
- 15 botones.
- 3 imágenes institucionales cargadas desde Google Drive.
- 2 videos embebidos mediante `iframe` de Google Drive.
- 30 recursos oficiales almacenados como matriz JavaScript.
- 10 noticias/referencias oficiales precargadas.
- 3 encuestas.
- 5 preguntas de quiz técnico.
- 3 mini-quizzes.
- Generador de dinámicas con 5 temas.
- Bitácora y resultados almacenados localmente mediante `localStorage`.

Por tanto, el inventario del sitio antiguo ya no se considera pendiente.

---

## 2. Estructura exacta del portal antiguo

### 2.1 Hero institucional

Título principal:

**Política, contenidos y herramientas para fortalecer la Transformación Digital**

Incluía:

- identificación de la Municipalidad de Constitución;
- logos institucionales;
- mensaje de apoyo, aprendizaje y acción;
- explicación del propósito del portal;
- conceptos destacados: Ley 21.180, FirmaGob, DocDigital, CasillaÚnica y ciberseguridad;
- explicación de las novedades incorporadas a la versión.

### 2.2 Acceso inmediato

Bloque de entradas rápidas a:

- descripción/ficha del curso;
- Ley 21.180;
- portal Gobierno Digital;
- FirmaGob.

Además incluía mini retos rápidos.

### 2.3 Videos destacados

Dos piezas audiovisuales:

1. Transformación digital en el ámbito municipal.
2. Ciberseguridad y resguardo institucional.

### 2.4 Recursos principales

Cuatro accesos principales:

- documento de presentación;
- presentación institucional;
- Ley 21.180;
- portal Gobierno Digital.

### 2.5 Laboratorio interactivo

El sitio contenía un módulo funcional con:

- encuestas rápidas;
- resultados almacenados en el navegador;
- quiz técnico;
- generador de preguntas y microactividades;
- bitácora local de ideas/notas.

### 2.6 Noticias oficiales

Bloque denominado **Actualidad reciente de Gobierno Digital**.

Las noticias no provenían de una API ni de un feed automático. Existían 10 registros precargados en JavaScript y debían actualizarse manualmente.

### 2.7 Recursos oficiales

Matriz de 30 recursos con filtros por:

- categoría;
- prioridad;
- público objetivo;
- orden.

Cada recurso contenía título, fuente, URL, tipo, prioridad, público objetivo, uso sugerido, sección del sitio y propuestas de material derivado.

### 2.8 Ejes temáticos

Tres líneas principales:

- Ley 21.180 y procedimientos electrónicos;
- DocDigital, firma electrónica y documentos;
- ciberseguridad y resguardo de la información.

### 2.9 Preguntas frecuentes

Bloque introductorio con preguntas sobre:

- cambios de la integración;
- incorporación de nuevos recursos;
- uso de la sección interactiva;
- actualidad de las noticias.

---

## 3. Matriz de 30 recursos recuperada

### Distribución por categoría

| Categoría | Cantidad |
|---|---:|
| Firma electrónica | 10 |
| Notificaciones electrónicas | 4 |
| Guías técnicas | 2 |
| Autenticación | 2 |
| Capacitación | 2 |
| Gestión del cambio | 2 |
| Marco normativo | 1 |
| Plataformas transversales | 1 |
| DocDigital | 1 |
| Interoperabilidad | 1 |
| Calidad de plataformas | 1 |
| Ciberseguridad | 1 |
| Gobierno Digital | 1 |
| Soporte | 1 |

Prioridad declarada en el sitio viejo:

- 23 recursos de prioridad alta;
- 7 recursos de prioridad media.

Entre los recursos se encuentran Ley 21.180, documentos y expedientes electrónicos, metadatos, FirmaGob, manuales de roles, segundo factor OTP, API de FirmaGob, habilitación de plataformas, DocDigital, autenticación, ClaveÚnica, notificaciones electrónicas, PISEE, calidad de plataformas, ciberseguridad, capacitación, manual del Coordinador TD y WikiGuías.

**Decisión:** conservar la matriz como fuente editorial, pero trasladarla desde JavaScript incrustado a archivos de contenido editables y revisar la vigencia de cada URL antes de publicación definitiva.

---

## 4. Componentes interactivos recuperados

### Encuestas

Tres preguntas iniciales sobre:

- tema que requiere mayor apoyo;
- principal barrera para la transformación digital;
- formato preferido para próximas cápsulas.

### Quiz técnico

Cinco preguntas sobre:

- expediente electrónico;
- CasillaÚnica;
- interoperabilidad;
- habilitación de FirmaGob;
- ciberseguridad.

### Mini-quizzes

- Ley 21.180.
- CasillaÚnica.
- Ciberseguridad.

### Generador de actividades

Cinco bancos temáticos:

- FirmaGob;
- DocDigital;
- Ley 21.180;
- ciberseguridad;
- coordinación y gestión del cambio.

**Decisión:** mantener la idea de aprendizaje interactivo, pero integrarla de forma más natural dentro de cápsulas y rutas formativas, evitando que el sitio se transforme en un panel de tarjetas.

---

## 5. Materiales físicos recuperados del Takeout

### Videos

#### Ruta Digital Constitución

- Archivo: `Ruta_Digital_Constitución.mp4`.
- Resolución: 1280 × 720.
- H.264 + AAC.
- 24 fps.
- Duración aproximada: 8 min 37 s.
- Incluye subtítulos en español.
- Contenido: introducción al equipo municipal, Ley 21.180, hitos de la transformación y beneficios del trabajo municipal digital.

#### Ley 21.719 / Protección de Datos

- Archivo: `Ley_21.mp4`.
- Resolución: 1280 × 720.
- H.264 + AAC.
- 24 fps.
- Duración aproximada: 7 min 34 s.
- Incluye subtítulos en español.
- Contenido centrado en protección de datos personales, obligaciones municipales y relación con ciberseguridad.

### Presentación institucional

Archivo: `Municipal_Digital_Transformation.pptx`.

Contiene 12 láminas gráficas:

1. Ley de Transformación Digital del Estado - Ley 21.180.
2. El mandato central: Digital por Defecto.
3. Los 6 principios rectores de la Administración Digital.
4. Paradigma tradicional vs. paradigma digital.
5. Anatomía del Expediente Electrónico.
6. Interoperabilidad: cero trámites innecesarios.
7. Notificaciones y Domicilio Digital Único.
8. Validez, digitalización y microformas.
9. Inclusión digital: el derecho a la excepción.
10. Caso práctico: modernización del Registro Automotor.
11. Hoja de ruta de implementación al 2027.
12. Compromiso: Ruta Digital Constitución.

Las 12 diapositivas están compuestas como imágenes 1376 × 768 dentro del PPTX.

### Ficha de capacitación UTalca

Archivo: `Ficha_general_curso_TD_UTalca_reformulada.docx`.

Incluye:

- modalidad online asincrónica;
- fechas de matrícula y ejecución;
- datos de contacto;
- descripción general;
- explicación de modalidad asincrónica;
- Gestión del Cambio;
- Fundamentos de Ciberseguridad;
- Liderazgo para la Transformación Digital;
- ruta de participación;
- canales de apoyo.

### Normativa

- Ley 21.180: PDF de 17 páginas.
- Ley 21.719: PDF de 56 páginas.

### Logos

- Escudo de Constitución.
- Logo Ruta Digital Constitución.
- Isotipo/escudo institucional adicional utilizado en el material gráfico.

---

## 6. Corpus institucional adicional localizado

Además del contenido del antiguo Google Sites, se localizaron antecedentes útiles para actualizar el relato 2026:

- Política Institucional de Transformación Digital;
- diagnóstico y Plan de Intervención 2026;
- antecedentes del Gestor Documental 2026;
- capacitación UTalca;
- interoperabilidad;
- ciberseguridad;
- protección de datos;
- instrumentos y antecedentes institucionales 2025-2026.

Estos contenidos permitirán que la nueva web no sea simplemente una réplica del sitio viejo, sino una versión actualizada al estado real del proceso municipal.

---

## 7. Diagnóstico del diseño antiguo

El contenido es valioso, pero la arquitectura visual presenta problemas que justifican una reconstrucción completa:

- exceso de tarjetas y bloques independientes;
- numerosas grillas;
- mucha información acumulada en una sola página;
- recursos, noticias y actividades compitiendo visualmente;
- dependencia de Google Drive para imágenes y videos;
- noticias hardcodeadas;
- contenido y lógica mezclados dentro del mismo HTML;
- dificultad para mantener contenidos sin editar código;
- experiencia más cercana a un tablero de recursos que a una publicación institucional viva.

Por esta razón, **no se replicará visualmente el Google Sites**.

---

## 8. Arquitectura objetivo del nuevo sitio

```text
Inicio
│
├── El proceso
│   ├── ¿Qué es la Transformación Digital?
│   ├── Ley 21.180
│   ├── Hoja de ruta municipal
│   └── Gobernanza
│
├── Cápsulas
│   ├── Gestión documental
│   ├── Interoperabilidad
│   ├── Ciberseguridad
│   ├── Personas y cambio
│   └── Servicios digitales
│
├── Avances
│   ├── Hitos 2026
│   ├── Gestor documental
│   ├── Capacitación
│   └── Indicadores
│
├── Herramientas
│   ├── DocDigital
│   ├── FirmaGob
│   ├── CPAT
│   ├── ClaveÚnica
│   ├── Domicilio Digital Único / CasillaÚnica
│   └── PISEE 2.0
│
├── Aprende
│   ├── Videos
│   ├── Mini-retos
│   ├── Quiz
│   └── Materiales de capacitación
│
├── Biblioteca
│   ├── Normativa
│   ├── Políticas
│   ├── Guías e instructivos
│   ├── Presentaciones
│   └── Material de capacitación
│
└── Equipo y contacto
```

---

## 9. Matriz de migración actualizada

| Tipo de contenido | Estado | Acción |
|---|---|---|
| HTML original | Recuperado | Conservar como referencia histórica |
| Textos de portada | Recuperados | Reescribir y actualizar |
| Estructura de secciones | Recuperada | Reorganizar completamente |
| Logos | Recuperados | Revisar identidad y optimizar |
| Videos | Recuperados | Migrar/optimizar y generar fichas |
| Presentación 12 láminas | Recuperada | Reutilizar visuales/contenido selectivamente |
| Ley 21.180 | Recuperada | Biblioteca normativa |
| Ley 21.719 | Recuperada | Biblioteca + cápsula protección de datos |
| Ficha UTalca | Recuperada | Sección Aprende/Capacitación |
| Matriz 30 recursos | Recuperada | Pasar a JSON, validar URLs y clasificar |
| 10 noticias precargadas | Recuperadas | No migrar como fuente estática; reemplazar por mecanismo actualizable |
| Encuestas | Recuperadas | Reutilizar conceptualmente |
| Quiz y mini-quizzes | Recuperados | Integrar en rutas de aprendizaje |
| Generador de dinámicas | Recuperado | Mantener como herramienta formativa opcional |
| Política TD 2026 | Localizada | Crear sección y cápsulas |
| Diagnóstico TD 2026 | Localizado | Convertir en hoja de ruta y avances |
| Gestor documental | Localizado | Crear microsubsección y cronología |

---

## 10. Principio de diseño

El nuevo sitio debe sentirse como Transformación Digital y no como una biblioteca de tarjetas.

La experiencia se organizará mediante:

- narrativa editorial continua;
- grandes cambios de escala y espacio;
- líneas de tiempo;
- flujo de cápsulas;
- rutas de aprendizaje;
- fotografías e identidad local;
- movimiento sutil;
- navegación clara;
- contenido separado del código;
- diseño responsive y accesible;
- recursos que puedan crecer sin romper la composición.

El Google Sites queda desde este punto como **fuente histórica y de contenido**, no como plantilla visual.