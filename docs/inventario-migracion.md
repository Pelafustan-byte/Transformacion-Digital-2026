# Inventario y matriz de migración

## Proyecto Transformación Digital 2026

Fecha de levantamiento inicial: 9 de septiembre de 2026.

Este documento registra qué material ha sido localizado, qué contenido debe migrarse desde el antiguo Google Sites y cómo se propone reorganizarlo en la nueva plataforma independiente.

---

## 1. Fuente original

Sitio de referencia:

`https://sites.google.com/mconstitucion.cl/transformaciondigital/p%C3%A1gina-principal`

### Estado del levantamiento automático

La URL pública responde, pero el contenido interno del Google Sites no está siendo expuesto de forma íntegra a los mecanismos de extracción utilizados durante esta primera auditoría. La fuente nativa del Site tampoco apareció como archivo `application/vnd.google-apps.site` dentro del Drive conectado.

Por lo tanto, **no se considerará migrado ni inventariado ningún bloque del Google Sites que no haya sido efectivamente recuperado**. El levantamiento exacto de sus páginas, imágenes, enlaces, botones, videos, documentos embebidos y textos queda como tarea de migración pendiente.

Esto evita reconstruir contenido por inferencia o memoria y mantiene trazabilidad sobre la fuente.

---

## 2. Corpus institucional relacionado ya localizado

Aun cuando la estructura íntegra del Google Sites no pudo extraerse en esta primera pasada, se localizaron materiales institucionales directamente vinculados al proceso de Transformación Digital municipal que constituyen la base editorial y documental del nuevo sitio.

### 2.1 Política Institucional de Transformación Digital

Documento localizado:

- `080 Remite propuesta de Política Institucional de Transformación Digital de la I. Municipalidad de Constitución`

Contenidos útiles para migrar o convertir en cápsulas/secciones:

- marco institucional del proceso;
- Ley N.º 21.180 y normas relacionadas;
- gestión documental y expediente electrónico;
- firma electrónica;
- interoperabilidad y PISEE 2.0;
- infraestructura tecnológica;
- ciberseguridad;
- simplificación y mejora de procesos;
- capacitación y gestión del cambio;
- atención ciudadana digital;
- herramientas digitales del Estado;
- gobernanza y seguimiento institucional.

### 2.2 Diagnóstico y Plan de Intervención 2026

Documento localizado:

- `457 remite diagnostico transformacion digital`

Contenidos útiles:

- estado inicial de madurez digital;
- brechas de integración de procesos;
- brechas de interoperabilidad;
- ciberseguridad y continuidad operacional;
- capacitación y resistencia al cambio;
- infraestructura tecnológica;
- líneas de intervención 2026;
- hoja de ruta y seguimiento.

### 2.3 Gestión documental

Material localizado:

- carpeta `Gestor_Documental2026`;
- antecedentes de contratación del gestor documental y servicios asociados;
- documentos de autorización y requerimientos técnicos vinculados al proyecto.

Uso editorial propuesto:

- sección especial "Gestión documental";
- cápsulas sobre expediente electrónico, trazabilidad, firma y flujos;
- cronología de implementación;
- preguntas frecuentes para funcionarios.

### 2.4 Capacitación y gestión del cambio

Material localizado:

- consolidado de funcionarios en cursos de Transformación Digital;
- ficha general de cursos de Transformación Digital UTalca;
- convocatorias y antecedentes de capacitación.

Uso editorial propuesto:

- calendario de capacitación;
- recursos de aprendizaje;
- cápsulas breves;
- seguimiento de hitos de formación;
- sección de preguntas y soporte.

### 2.5 Antecedentes normativos y material formativo

Material localizado, entre otros:

- presentación sobre Ley N.º 21.180;
- documentos asociados a interoperabilidad;
- materiales de procedimientos digitales;
- documentación institucional generada durante 2025–2026.

Estos archivos deben ser clasificados antes de exponerlos públicamente, diferenciando:

1. normativa oficial externa;
2. instrumentos internos aprobados;
3. documentos de trabajo;
4. material de capacitación;
5. antecedentes históricos.

---

## 3. Inventario funcional del nuevo sitio

La nueva versión no replica visualmente Google Sites. Reorganiza el contenido como una experiencia editorial continua.

### Portada

1. **Hero institucional**
   - mensaje central del proceso;
   - contexto Constitución 2026;
   - acceso a contenidos destacados.

2. **Cinta viva de conceptos**
   - expediente electrónico;
   - interoperabilidad;
   - ciberseguridad;
   - firma electrónica;
   - servicios digitales;
   - gestión del cambio.

3. **Qué significa transformarse**
   - explicación simple del cambio;
   - énfasis en procesos, personas y servicios.

4. **Líneas de transformación**
   - gestión documental;
   - interoperabilidad;
   - ciberseguridad;
   - procesos simples;
   - personas y capacidades;
   - servicios digitales.

5. **Hoja de ruta 2026–2027**
   - preparación organizacional;
   - gestión documental;
   - interoperabilidad;
   - consolidación de servicios digitales.

6. **Flujo de cápsulas**
   - presentación editorial, no en cuadrícula;
   - fecha, tema, resumen, estado y tiempo de lectura;
   - contenido alimentado desde archivo JSON.

7. **Ecosistema digital del Estado**
   - DocDigital;
   - FirmaGob;
   - CPAT;
   - ClaveÚnica;
   - Domicilio Digital Único;
   - PISEE 2.0.

8. **Principios de implementación**
   - primero las personas;
   - simplificar antes de digitalizar;
   - seguridad desde el diseño;
   - uso responsable de datos;
   - medir y mejorar.

9. **Gobernanza**
   - transformación como responsabilidad transversal;
   - coordinación institucional;
   - correo de contacto del equipo.

---

## 4. Arquitectura de contenidos objetivo

Se propone evolucionar hacia la siguiente arquitectura:

```text
Inicio
│
├── El proceso
│   ├── ¿Qué es la Transformación Digital?
│   ├── Ley N.º 21.180
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
│   ├── Implementación del gestor documental
│   ├── Capacitación
│   └── Indicadores
│
├── Herramientas
│   ├── DocDigital
│   ├── FirmaGob
│   ├── CPAT
│   ├── ClaveÚnica
│   ├── Domicilio Digital Único
│   └── PISEE 2.0
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

## 5. Matriz de migración

| Tipo de contenido | Fuente | Estado | Acción propuesta |
|---|---|---|---|
| Textos de portada Google Sites | Google Sites | Pendiente extracción | Revisar, depurar y reescribir |
| Páginas interiores Google Sites | Google Sites | Pendiente extracción | Levantar estructura completa |
| Imágenes Google Sites | Google Sites | Pendiente extracción | Inventariar, descargar, optimizar y clasificar |
| Videos / embeds | Google Sites | Pendiente extracción | Registrar URL, proveedor y función |
| Botones y enlaces | Google Sites | Pendiente extracción | Validar vigencia y destino |
| Documentos adjuntos | Google Sites / Drive | Parcialmente localizado | Clasificar antes de publicar |
| Política TD | Drive | Localizada | Crear sección + cápsulas |
| Diagnóstico TD 2026 | Drive | Localizado | Convertir en hoja de ruta y avances |
| Gestor documental | Drive | Localizado | Crear microsubsección y cronología |
| Capacitación | Drive | Localizada | Crear recursos y seguimiento |
| Herramientas del Estado | Documentación institucional | Base creada | Completar fichas y enlaces oficiales |
| Normativa | Varias fuentes | Parcial | Crear biblioteca verificada |

---

## 6. Criterios para la migración

Todo material del sitio anterior se clasificará en una de estas categorías:

- **Migrar sin cambios:** contenido vigente y correctamente redactado.
- **Migrar y actualizar:** contenido válido pero desactualizado.
- **Reescribir:** información útil cuya presentación debe simplificarse.
- **Integrar:** contenido duplicado que debe incorporarse en una sola pieza.
- **Archivar:** contenido histórico que puede mantenerse como antecedente.
- **Descartar:** contenido obsoleto, duplicado o sin valor para el nuevo sitio.

---

## 7. Principio de diseño

El nuevo sitio evita deliberadamente una portada basada en mosaicos o una grilla de tarjetas repetitivas.

La navegación debe sentirse como un recorrido institucional vivo mediante:

- grandes bloques editoriales;
- jerarquía tipográfica marcada;
- líneas y secuencias horizontales;
- cápsulas presentadas como flujo;
- movimiento sutil;
- espacios amplios;
- contraste institucional azul/celeste;
- contenidos que puedan crecer sin romper la composición.

---

## 8. Próxima fase de inventario

El levantamiento del Google Sites se considerará terminado únicamente cuando se registre, para cada página:

- nombre y URL;
- orden dentro de la navegación;
- títulos y subtítulos;
- texto completo;
- imágenes y sus fuentes;
- videos o elementos embebidos;
- archivos adjuntos;
- botones y enlaces externos;
- formularios;
- llamados a la acción;
- fecha o vigencia del contenido;
- decisión de migración.

Este documento se irá actualizando a medida que cada pieza sea recuperada y migrada.
