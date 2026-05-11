# Documentación Técnica del Backend — Cybersec Labs

> **Audience:** Desarrolladores o estudiantes que quieran entender cómo está construido el backend de esta plataforma.  
> **Fecha:** 2026-05-11

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Arquitectura en Capas](#4-arquitectura-en-capas)
5. [Base de Datos](#5-base-de-datos)
6. [Autenticación y Autorización](#6-autenticación-y-autorización)
7. [Endpoints de la API](#7-endpoints-de-la-api)
8. [Lógica de Negocio Clave](#8-lógica-de-negocio-clave)
9. [Manejo de Errores](#9-manejo-de-errores)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Despliegue](#11-despliegue)
12. [Glosario de Términos](#12-glosario-de-términos)

---

## 1. Visión General

El backend de Cybersec Labs es una **API REST** (Interfaz de Programación basada en HTTP) que sirve como núcleo de la plataforma de aprendizaje. Su responsabilidad es:

- Gestionar usuarios (registro, login, perfiles, ranking).
- Proveer el catálogo de cursos, módulos y laboratorios.
- Registrar el progreso de cada usuario en actividades y quizzes.
- Otorgar puntos automáticamente al completar un laboratorio.
- Exponer rutas exclusivas para administradores que permiten crear y editar contenido.

El servidor escucha peticiones HTTP del frontend (React) y responde siempre en formato **JSON**.

---

## 2. Stack Tecnológico

| Componente | Tecnología | Para qué sirve |
|---|---|---|
| **Runtime** | [Bun](https://bun.sh) | Ejecuta JavaScript/TypeScript directamente, sin necesidad de compilar a Node.js. Es más rápido que Node para arrancar y ejecutar. |
| **Framework HTTP** | [Hono](https://hono.dev) v4.12 | Define las rutas de la API y maneja peticiones/respuestas. Es ultra-ligero y optimizado para Bun. |
| **Base de datos** | PostgreSQL en [Supabase](https://supabase.com) | Motor de base de datos relacional. Supabase es un servicio en la nube que lo aloja. |
| **Driver de DB** | `postgres` v3.4 | Librería que permite ejecutar consultas SQL directamente desde TypeScript. |
| **Autenticación** | JSON Web Tokens (JWT) via `jsonwebtoken` v9 | Genera y verifica tokens de sesión. |
| **Hashing de contraseñas** | `Bun.password` (built-in) | Función nativa de Bun para almacenar contraseñas de forma segura. |
| **Lenguaje** | TypeScript | JavaScript con tipado estático, compila a JS pero con más seguridad en tiempo de desarrollo. |
| **Despliegue** | [Railway](https://railway.app) | Plataforma en la nube que aloja y ejecuta el servidor. |

---

## 3. Estructura de Carpetas

```
backend/
├── src/
│   ├── index.ts                 ← Punto de entrada: crea el servidor y registra las rutas
│   ├── types.ts                 ← Definiciones TypeScript de todos los tipos de datos
│   ├── db/
│   │   └── index.ts             ← Configuración y conexión a la base de datos
│   ├── middleware/
│   │   └── auth.ts              ← Funciones que se ejecutan ANTES de los controladores
│   ├── routes/
│   │   ├── auth.ts              ← Define qué URL lleva a qué controlador (autenticación)
│   │   ├── users.ts             ← Rutas de perfil de usuario
│   │   ├── courses.ts           ← Rutas de cursos, módulos y laboratorios
│   │   ├── activities.ts        ← Rutas de actividades prácticas
│   │   ├── submissions.ts       ← Rutas de envío de quizzes
│   │   ├── ranking.ts           ← Ruta de tabla de posiciones
│   │   └── admin.ts             ← Rutas exclusivas del administrador
│   ├── controllers/
│   │   ├── AuthController.ts    ← Extrae datos del request y llama al Service correcto
│   │   ├── UserController.ts
│   │   ├── CourseController.ts
│   │   ├── ActivityController.ts
│   │   └── SubmissionController.ts
│   ├── services/
│   │   ├── AuthService.ts       ← Contiene la lógica de negocio de autenticación
│   │   ├── UserService.ts
│   │   ├── CourseService.ts
│   │   ├── ActivityService.ts
│   │   └── SubmissionService.ts
│   ├── daos/
│   │   ├── UserDAO.ts           ← Consultas SQL relacionadas con usuarios
│   │   ├── CourseDAO.ts
│   │   ├── CourseModuleDAO.ts
│   │   ├── CourseEnrollmentDAO.ts
│   │   ├── LaboratoryDAO.ts
│   │   ├── LaboratoryQuestionDAO.ts
│   │   ├── LaboratoryQuestionOptionDAO.ts
│   │   ├── QuestionActivityDAO.ts
│   │   ├── SubmissionDAO.ts
│   │   ├── ActivityActionLogDAO.ts
│   │   ├── UserActivityProgressDAO.ts
│   │   └── UserLaboratoryProgressDAO.ts
│   └── utils/
│       ├── errors.ts            ← Clases de error personalizadas
│       └── response.ts          ← Generador de respuestas para actividades
├── database/
│   ├── schema.sql               ← Script SQL que crea todas las tablas
│   └── seed.sql                 ← Datos de ejemplo para pruebas
├── package.json                 ← Dependencias y comandos del proyecto
├── tsconfig.json                ← Configuración del compilador TypeScript
└── railway.json                 ← Configuración de despliegue en Railway
```

---

## 4. Arquitectura en Capas

El backend sigue un patrón de **arquitectura en capas** (*layered architecture*). Cada capa tiene una responsabilidad específica y solo puede hablar con la capa inmediatamente inferior. Esto hace el código más organizado, fácil de mantener y de probar.

```
HTTP Request
     ↓
┌─────────────┐
│   Routes    │  Define qué URL activa qué función. También aplica middleware.
└──────┬──────┘
       ↓
┌─────────────┐
│ Middleware  │  Se ejecuta antes del controller: verifica tokens JWT, valida roles.
└──────┬──────┘
       ↓
┌─────────────┐
│ Controllers │  "Recepcionistas": extraen datos del request (body, params, headers)
│             │  y delegan el trabajo al Service. Formatean la respuesta HTTP.
└──────┬──────┘
       ↓
┌─────────────┐
│  Services   │  "Cerebro": contienen la lógica de negocio. Validan reglas, calculan
│             │  resultados, coordinan múltiples DAOs. NO hablan con HTTP.
└──────┬──────┘
       ↓
┌─────────────┐
│    DAOs     │  "Archivistas": ejecutan consultas SQL. Solo saben hablar con la DB.
│  (Data Access│  Devuelven objetos TypeScript.
│   Objects)  │
└──────┬──────┘
       ↓
┌─────────────┐
│  PostgreSQL │  Base de datos. Almacena todos los datos de forma persistente.
└─────────────┘
```

### ¿Por qué esta separación?

- Si mañana se cambia PostgreSQL por otra base de datos, solo se modifican los DAOs.
- Si cambia una regla de negocio (ej: el quiz requiere 6 preguntas en vez de 5), solo se edita el Service.
- Si cambia el formato de la respuesta HTTP, solo se toca el Controller.

### Ejemplo del flujo completo: usuario envía un quiz

```
POST /api/labs/:labId/submit

1. Route (submissions.ts)
   └─ Aplica requireAuth middleware → verifica JWT → agrega userId al contexto

2. Middleware (auth.ts)
   └─ Extrae el token del header Authorization, lo verifica, pone el user en c.set('user', payload)

3. SubmissionController.submit()
   └─ Extrae labId de los params y answers del body
   └─ Llama a SubmissionService.submit(userId, labId, answers)

4. SubmissionService.submit()
   └─ Verifica que el usuario esté inscrito en el curso
   └─ Verifica que lleguen exactamente 5 respuestas
   └─ Para cada respuesta:
       - Si es multiple_choice: busca la opción y verifica is_correct
       - Si es activity_response: compara el texto contra el hash guardado
   └─ Calcula scorePercent = (correctas / 5) × 100
   └─ Llama a SubmissionDAO.create(...)

5. SubmissionDAO.create()
   └─ INSERT INTO submissions (...)
   └─ La base de datos ejecuta el trigger trg_sync_user_laboratory_progress_from_submission
      que actualiza user_laboratory_progress automáticamente
   └─ Si es la primera vez que completa → otro trigger agrega los puntos al usuario

6. SubmissionController devuelve:
   { submissionId, attemptNumber, correctAnswersCount, totalQuestions, scorePercent }
   con HTTP 201 (Created)
```

---

## 5. Base de Datos

### 5.1 Motor y Conexión

Se usa **PostgreSQL** (alojado en Supabase). La conexión se configura en `src/db/index.ts`:

```typescript
const sql = postgres(process.env.DATABASE_URL, {
  transform: {
    // Convierte nombres de columnas de snake_case (DB) a camelCase (JS)
    // Ejemplo: password_hash → passwordHash
    column: { from: camelCaseConverter }
  },
  ssl: { rejectUnauthorized: false },  // Requerido por Supabase
  prepare: false,   // Desactivado para compatibilidad con el pooler de Supabase
  max: 10,          // Máximo 10 conexiones simultáneas
  idle_timeout: 20  // Cierra conexiones inactivas después de 20 segundos
})
```

> **Nota sobre `prepare: false`:** Supabase usa un *connection pooler* (PgBouncer) que no soporta *prepared statements*. Por eso se desactiva esta optimización.

### 5.2 Jerarquía de Contenido

```
courses
  └── course_modules  (un curso tiene varios módulos)
        └── laboratories  (un módulo tiene varios laboratorios)
              └── laboratory_questions  (un lab tiene exactamente 5 preguntas)
                    ├── laboratory_question_options  (opciones de respuesta múltiple)
                    └── question_activities  (actividad práctica, relación 1:1)
```

### 5.3 Tablas Principales

#### `users`
Almacena todos los usuarios de la plataforma.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único generado automáticamente |
| `username` | VARCHAR(50) | Nombre de usuario único |
| `email` | VARCHAR(120) | Email único |
| `password_hash` | TEXT | Contraseña hasheada (nunca en texto plano) |
| `role` | ENUM | `'user'` o `'admin'` |
| `bio` | TEXT | Descripción del perfil |
| `profile_image` | BYTEA | Imagen guardada como bytes (no como URL) |
| `points` | INTEGER | Puntos acumulados, empieza en 0 |
| `deleted_at` | TIMESTAMPTZ | Si tiene valor, el usuario está eliminado (soft delete) |

> **Soft delete:** En vez de borrar el registro de la base de datos (lo que podría causar problemas de integridad), se marca con una fecha en `deleted_at`. Las consultas filtran por `WHERE deleted_at IS NULL`.

#### `courses`
| Columna | Tipo | Descripción |
|---|---|---|
| `slug` | VARCHAR(120) | Identificador legible en URLs, ej: `intro-linux-seguridad` |
| `difficulty` | ENUM | `principiante`, `intermedio`, `avanzado` |
| `is_published` | BOOLEAN | Solo los publicados aparecen para usuarios normales |

#### `laboratories`
| Columna | Tipo | Descripción |
|---|---|---|
| `content_markdown` | TEXT | Contenido del laboratorio en formato Markdown |
| `quiz_questions_required` | SMALLINT | Siempre 5 — número obligatorio de preguntas del quiz |
| `points` | INTEGER | Puntos que se otorgan al completarlo por primera vez |
| `estimated_minutes` | INTEGER | Tiempo estimado de completación |

#### `laboratory_questions`
| Columna | Tipo | Descripción |
|---|---|---|
| `question_order` | SMALLINT (1-5) | Posición de la pregunta en el quiz |
| `question_type` | ENUM | `multiple_choice` o `activity_response` |
| `explanation` | TEXT | Explicación que se muestra después de responder |

#### `submissions`
Cada vez que un usuario envía el quiz de un laboratorio.

| Columna | Tipo | Descripción |
|---|---|---|
| `attempt_number` | INTEGER | Intento número 1, 2, 3... |
| `answers` | JSONB | Array JSON con las 5 respuestas enviadas |
| `score_percent` | NUMERIC | Porcentaje de aciertos: 0, 20, 40, 60, 80 o 100 |
| `correct_answers_count` | SMALLINT | Número de respuestas correctas |

#### `user_laboratory_progress`
Estado del usuario en cada laboratorio.

| Columna | Tipo | Descripción |
|---|---|---|
| `status` | ENUM | `not_started`, `in_progress`, `completed` |
| `best_score_percent` | NUMERIC | El mejor puntaje de todos los intentos |
| `attempts_count` | INTEGER | Cuántas veces ha enviado el quiz |

#### `user_activity_progress`
Estado del usuario en cada actividad práctica.

| Columna | Tipo | Descripción |
|---|---|---|
| `generated_response` | TEXT | Hash único generado al completar la actividad |
| `status` | ENUM | `not_started`, `in_progress`, `completed` |

#### `activity_action_logs`
Registro de cada intento de actividad. Es un log inmutable (sin `UPDATE`).

### 5.4 Triggers de la Base de Datos

Los **triggers** son funciones que PostgreSQL ejecuta automáticamente cuando ocurre cierto evento (INSERT, UPDATE, DELETE) en una tabla. Se usan para mantener datos derivados sincronizados sin que el código del servidor tenga que preocuparse.

```
Trigger 1: trg_updated_at
  Evento: BEFORE UPDATE en cualquier tabla
  Acción: Pone updated_at = NOW() automáticamente

Trigger 2: trg_sync_user_activity_progress_from_action
  Evento: AFTER INSERT en activity_action_logs
  Acción: Crea o actualiza el registro en user_activity_progress
          (incrementa intentos, guarda si fue correcto, guarda el hash generado)

Trigger 3: trg_sync_user_laboratory_progress_from_submission
  Evento: AFTER INSERT en submissions
  Acción: Crea o actualiza user_laboratory_progress
          (actualiza mejor puntaje, estado, número de intentos)

Trigger 4: trg_award_laboratory_points
  Evento: AFTER UPDATE en user_laboratory_progress
  Condición: status cambió a 'completed' por PRIMERA vez
  Acción: Suma laboratories.points al campo users.points del usuario
```

> **Por qué usar triggers:** Desacoplan la lógica de puntuación del código de la aplicación. No importa desde dónde se inserte un `submission` (backend, migración, script), los puntos siempre se otorgan correctamente. Son una garantía a nivel de base de datos.

---

## 6. Autenticación y Autorización

### 6.1 JWT — JSON Web Token

La autenticación funciona con **tokens JWT**. Un JWT es como un "pase de acceso" que el servidor le entrega al usuario cuando inicia sesión. En cada petición posterior, el usuario adjunta ese pase y el servidor puede verificar su identidad sin consultar la base de datos.

```
┌──────────┐     POST /api/auth/login          ┌──────────────┐
│ Frontend │  ──────────────────────────────►  │   Backend    │
│          │     { email, password }            │              │
│          │  ◄──────────────────────────────  │              │
│          │     { token: "eyJ..." }            │              │
│          │                                    │              │
│          │     GET /api/users/me              │              │
│          │     Authorization: Bearer eyJ...   │              │
│          │  ──────────────────────────────►  │              │
│          │     { id, username, email, ... }   │              │
│          │  ◄──────────────────────────────  │              │
└──────────┘                                    └──────────────┘
```

**Estructura del JWT:**
```json
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "id": "uuid", "username": "simon", "email": "...", "role": "user", "iat": 123, "exp": 456 }
Firma:   HMAC-SHA256(header + payload, JWT_SECRET)
```

El token expira después de **7 días**. Si un usuario tiene el token de otra persona, no puede forjarlo porque no conoce el `JWT_SECRET` con el que fue firmado.

### 6.2 Middleware de Autenticación

En `src/middleware/auth.ts` hay tres funciones que actúan como "porteros":

```typescript
optionalAuth    // Intenta verificar el token; si no hay token, continúa sin usuario.
                // Usado en: GET /api/courses (ver cursos sin estar logueado)

requireAuth     // El token es obligatorio y debe ser válido.
                // Lanza 401 Unauthorized si falta o está vencido.
                // Usado en: matrícula, envío de quizzes, ver laboratorios

requireAdmin    // El token debe ser válido Y el rol debe ser 'admin'.
                // Lanza 403 Forbidden si el usuario es normal.
                // Usado en: crear/editar cursos, módulos, laboratorios
```

Cuando el middleware aprueba la petición, guarda los datos del usuario en el **contexto de Hono** (`c.set('user', payload)`) para que el controlador pueda accederlos con `c.get('user')`.

---

## 7. Endpoints de la API

Todos los endpoints comienzan con el prefijo `/api`.

### 7.1 Autenticación (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | ❌ | Registrar nuevo usuario |
| POST | `/login` | ❌ | Iniciar sesión, recibe token JWT |
| POST | `/logout` | ✅ | Cierra sesión (el token es stateless, solo es simbólico) |
| POST | `/forgot-password` | ❌ | Solicitar enlace de restablecimiento de contraseña |
| POST | `/reset-password` | ❌ | Restablecer contraseña con el token recibido por email |

**Registro — body esperado:**
```json
{ "username": "simon", "email": "simon@ejemplo.com", "password": "min8chars" }
```

**Respuesta de login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "username": "simon", "email": "...", "role": "user" }
}
```

### 7.2 Usuarios (`/api/users`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/me` | ✅ | Ver mi perfil completo (puntos, labs completados, rango) |
| PUT | `/me` | ✅ | Actualizar username, email o bio |
| POST | `/me/password` | ✅ | Cambiar contraseña |
| POST | `/me/avatar` | ✅ | Subir foto de perfil (JPG, máx 5 MB) |
| GET | `/:username` | ❌ | Ver perfil público de cualquier usuario |

### 7.3 Cursos (`/api/courses`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Opcional | Listar cursos publicados con estadísticas |
| GET | `/:slug` | Opcional | Ver detalle de un curso |
| POST | `/:slug/enroll` | ✅ | Matricularse en un curso |
| GET | `/:slug/modules` | ❌ | Ver módulos del curso |
| GET | `/:slug/modules/:moduleSlug/labs` | ❌ | Ver laboratorios del módulo |
| GET | `/:slug/modules/:moduleSlug/labs/:labSlug` | ✅ | Ver laboratorio completo con preguntas y progreso |

> **Nota sobre el último endpoint:** Requiere que el usuario esté matriculado en el curso padre. Si no lo está, recibe HTTP 403. Los administradores no necesitan matrícula.

**Respuesta de GET `/api/courses`:**
```json
[
  {
    "id": "uuid",
    "slug": "intro-linux",
    "title": "Introducción a Linux",
    "difficulty": "principiante",
    "moduleCount": 3,
    "labCount": 12,
    "totalPoints": 450,
    "isEnrolled": false
  }
]
```

### 7.4 Actividades (`/api/activities`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/:activityId/attempt` | ✅ | Intentar una actividad práctica |

El body es un JSON libre que representa la acción del usuario. El servidor lo compara contra la `expected_action_key` de la actividad.

**Respuesta:**
```json
{
  "isCorrect": true,
  "feedback": "¡Correcto! Ejecutaste el comando adecuado.",
  "generatedResponse": "A3F1B2C4D5E6F7A8",
  "alreadyCompleted": false
}
```

### 7.5 Envío de Quizzes (`/api/labs`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/:labId/submit` | ✅ | Enviar respuestas del quiz del laboratorio |

**Body esperado:**
```json
{
  "answers": [
    { "questionId": "uuid-1", "selectedOptionId": "uuid-opcion" },
    { "questionId": "uuid-2", "selectedOptionId": "uuid-opcion" },
    { "questionId": "uuid-3", "responseText": "A3F1B2C4D5E6F7A8" },
    { "questionId": "uuid-4", "selectedOptionId": "uuid-opcion" },
    { "questionId": "uuid-5", "selectedOptionId": "uuid-opcion" }
  ]
}
```

**Respuesta:**
```json
{
  "submissionId": "uuid",
  "attemptNumber": 2,
  "correctAnswersCount": 4,
  "totalQuestions": 5,
  "scorePercent": 80
}
```

### 7.6 Estadísticas Públicas (`/api/stats`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | ❌ | Métricas globales de la plataforma para mostrar en la landing |

**Respuesta:**
```json
{
  "courseCount": 3,
  "labCount": 18,
  "totalPoints": 5400,
  "userCount": 127
}
```

### 7.7 Ranking (`/api/ranking`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/?page=1&limit=20` | ❌ | Tabla de posiciones paginada |

**Respuesta:**
```json
{
  "data": [
    { "rank": 1, "username": "hacker_pro", "points": 2400, "bio": "..." },
    { "rank": 2, "username": "simon", "points": 1800, "bio": "..." }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### 7.8 Admin (`/api/admin`) — Solo para rol `admin`

Todos estos endpoints requieren token de administrador.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/courses` | Crear curso |
| PUT | `/courses/:id` | Editar curso |
| POST | `/courses/:courseId/modules` | Crear módulo |
| PUT | `/modules/:id` | Editar módulo |
| POST | `/modules/:moduleId/labs` | Crear laboratorio |
| PUT | `/labs/:id` | Editar laboratorio |
| POST | `/labs/:labId/questions` | Crear pregunta (máx 5 por lab) |
| PUT | `/questions/:id` | Editar pregunta |
| POST | `/questions/:questionId/options` | Crear opción de respuesta múltiple |
| POST | `/questions/:questionId/activity` | Crear actividad práctica |
| PUT | `/activities/:id` | Editar actividad |

---

## 8. Lógica de Negocio Clave

### 8.1 Sistema de Actividades Prácticas

Las preguntas de tipo `activity_response` requieren que el usuario "complete una tarea" (por ejemplo, ejecutar un comando específico en una terminal web). El flujo es:

```
1. El usuario envía un intento → POST /api/activities/:activityId/attempt
   Body: { "action": "ls -la /etc" }

2. ActivityService compara la acción enviada contra activity.expectedActionKey
   guardado en la base de datos.

3. Si es correcto:
   a. Se genera un hash determinístico:
      HMAC-SHA256("activity:{userId}:{activityId}", JWT_SECRET)
      Se toma solo los primeros 16 caracteres en mayúsculas.
      Ejemplo: "A3F1B2C4D5E6F7A8"

   b. Se guarda en activity_action_logs (trigger actualiza user_activity_progress)

   c. Se devuelve generatedResponse al usuario.
      Este valor es su "evidencia" de haber completado la actividad.

4. Cuando el usuario luego envía el quiz, en la pregunta activity_response
   debe pegar ese hash exactamente. Si coincide con user_activity_progress.generated_response,
   la respuesta es correcta.
```

**¿Por qué un hash determinístico?**

El hash es siempre el mismo para la misma combinación de usuario y actividad (gracias a `JWT_SECRET` como llave). Esto significa:
- Si el usuario recarga la página y vuelve a intentar la actividad, recibirá el mismo código.
- El código no puede ser adivinado ni compartido entre usuarios (cada uno tiene un código diferente).

### 8.2 Calificación del Quiz

```typescript
// En SubmissionService:
let correctCount = 0;

for (const answer of answers) {
  const question = preguntas.find(q => q.id === answer.questionId);

  if (question.questionType === 'multiple_choice') {
    const option = await optionDAO.findById(answer.selectedOptionId);
    if (option.isCorrect) correctCount++;

  } else if (question.questionType === 'activity_response') {
    const progress = await activityProgressDAO.find(userId, activityId);
    if (progress?.generatedResponse === answer.responseText) correctCount++;
  }
}

const scorePercent = (correctCount / 5) * 100;
// Posibles valores: 0, 20, 40, 60, 80, 100
```

### 8.3 Sistema de Puntos

Los puntos se otorgan **una sola vez** por laboratorio, al completarlo por primera vez. El puntaje del quiz no importa para recibir los puntos (solo importa haber enviado el quiz al menos una vez con cualquier nota).

El flujo exacto es:

```
1. Usuario envía quiz → se inserta en submissions
2. Trigger actualiza user_laboratory_progress
3. Si status cambia a 'completed' por primera vez:
   UPDATE users SET points = points + laboratories.points WHERE id = userId
```

Este mecanismo vive completamente en la base de datos (trigger SQL), garantizando que no importa desde dónde se haga el insert, los puntos siempre se otorgan correctamente.

> **¿Qué pasa si el usuario envía el quiz varias veces?** Puede hacerlo, cada intento guarda el puntaje, y `best_score_percent` en `user_laboratory_progress` siempre refleja el mejor intento. Pero los puntos solo se suman la primera vez que el status llega a `completed`.

### 8.4 Control de Acceso a Laboratorios

Para ver el contenido completo de un laboratorio (incluyendo preguntas), el usuario debe estar **matriculado** en el curso padre. El proceso es:

```
GET /:courseSlug/modules/:moduleSlug/labs/:labSlug (con JWT)

CourseService.getLaboratory():
  1. Busca el curso por slug
  2. Busca el módulo por slug dentro de ese curso
  3. Busca el laboratorio por slug dentro de ese módulo
  4. Busca la matrícula: CourseEnrollmentDAO.find(userId, courseId)
  5. Si no hay matrícula → throw HTTPError(403, "Debes estar matriculado")
  6. Si hay matrícula → devuelve lab con todas las preguntas y el progreso del usuario
```

Los administradores saltan este control (para poder revisar el contenido sin matricularse).

---

## 9. Manejo de Errores

### 9.1 Clases de Error

En `src/utils/errors.ts` hay dos clases:

```typescript
class HTTPError extends Error {
  // Representa cualquier error HTTP. Guarda el status code (404, 401, etc.)
}

class ValidationError extends HTTPError {
  // Hereda de HTTPError con status 400.
  // Recibe un array de mensajes en español.
  // Ejemplo: ["El username debe tener entre 3 y 50 caracteres", "El email no es válido"]
}
```

### 9.2 Manejador Global de Errores

En `src/index.ts` hay un manejador global que captura cualquier error lanzado en cualquier parte de la aplicación:

```typescript
app.onError((err, c) => {
  if (err instanceof HTTPError) {
    return c.json({ error: err.message }, err.status);
  }
  // Error no esperado → log en consola y responder 500
  console.error(err);
  return c.json({ error: "Error interno del servidor" }, 500);
});
```

### 9.3 Formato de Respuestas de Error

Todos los errores tienen el mismo formato JSON:

```json
{ "error": "Descripción del error en español" }
```

**Códigos de estado HTTP usados:**

| Código | Significado | Ejemplo |
|---|---|---|
| 400 | Bad Request — datos inválidos | Username muy corto |
| 401 | Unauthorized — token inválido o ausente | Sin token en header |
| 403 | Forbidden — no tiene permisos | Usuario normal en ruta admin |
| 404 | Not Found — recurso no existe | Curso con ese slug no existe |
| 409 | Conflict — ya existe | Email ya registrado |
| 500 | Internal Server Error | Error inesperado en el servidor |

---

## 10. Variables de Entorno

El backend necesita las siguientes variables en el archivo `.env` (o en Railway):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ | URL de conexión a PostgreSQL de Supabase |
| `JWT_SECRET` | ✅ | Clave secreta para firmar y verificar tokens JWT. Debe ser larga y aleatoria. |
| `PORT` | ❌ | Puerto donde escucha el servidor. Railway lo inyecta automáticamente. |
| `FRONTEND_URL` | ❌ | URL del frontend para la política CORS. Default: `http://localhost:5173` |

**Ejemplo de `DATABASE_URL` de Supabase:**
```
postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> **Seguridad:** Nunca se deben subir los valores reales de estas variables a Git. Solo se sube `.env.example` con los nombres de las variables sin valores.

---

## 11. Despliegue

### 11.1 Base de Datos — Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Ir al **SQL Editor** y ejecutar el contenido de `backend/database/schema.sql`.
3. Copiar la **connection string** del pooler (modo *transaction*) como `DATABASE_URL`.

El schema es **idempotente**: usa `CREATE TABLE IF NOT EXISTS`, `CREATE TYPE IF NOT EXISTS`, etc. Se puede ejecutar múltiples veces sin error.

### 11.2 Backend — Railway

La configuración de despliegue está en `backend/railway.json`:

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "bun install"
  },
  "deploy": {
    "startCommand": "bun run src/index.ts",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Pasos:**
1. Crear un nuevo servicio en Railway conectado al repositorio de GitHub.
2. Configurar las variables de entorno: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
3. Railway detecta automáticamente el `railway.json` y hace el deploy.

> **RAILPACK** es el builder de Railway que detecta el runtime (Bun en este caso) y construye una imagen optimizada. Es más rápido y liviano que Nixpacks.

### 11.3 Frontend — Vercel / Netlify

El frontend es estático (React compilado). Solo se necesita:
1. Configurar la variable de entorno `VITE_API_URL` con la URL del backend de Railway.
2. Apuntar el proveedor (Vercel, Netlify) a la carpeta `frontend/`.

### 11.4 Diagrama de Infraestructura

```
┌──────────────────┐     HTTPS      ┌──────────────────┐
│    Vercel /      │ ─────────────► │    Railway       │
│    Netlify       │                │    (Bun + Hono)  │
│  (React Frontend)│ ◄──────────── │    Backend       │
└──────────────────┘                └────────┬─────────┘
                                             │ SSL/PostgreSQL
                                             ▼
                                    ┌──────────────────┐
                                    │    Supabase      │
                                    │   PostgreSQL     │
                                    └──────────────────┘
```

---

## 12. Glosario de Términos

**API REST** — Interfaz de comunicación entre aplicaciones basada en HTTP. El frontend hace peticiones a URLs específicas del backend y recibe respuestas JSON.

**Bun** — Runtime moderno para JavaScript/TypeScript, alternativa a Node.js. Es más rápido para arrancar y tiene herramientas integradas (bundler, test runner, gestor de paquetes).

**BYTEA** — Tipo de dato de PostgreSQL para almacenar bytes crudos (imágenes, archivos binarios).

**camelCase** — Convención de nombres donde la primera letra es minúscula y cada palabra siguiente comienza con mayúscula: `firstName`, `passwordHash`.

**Connection Pooler** — Componente que reutiliza conexiones abiertas a la base de datos. Supabase usa PgBouncer: en vez de abrir una conexión nueva por cada petición, las reutiliza de un "pool" (pileta de conexiones).

**CORS** — *Cross-Origin Resource Sharing*. Política de seguridad del navegador que bloquea peticiones de un dominio a otro. El backend configura qué orígenes (dominios) tienen permiso de hacer peticiones, en este caso solo el dominio del frontend.

**DAO** — *Data Access Object*. Objeto cuya única responsabilidad es acceder a la base de datos. Encapsula todas las consultas SQL de una entidad específica.

**Determinístico** — Un proceso que, dado los mismos inputs, siempre produce el mismo output. El generador de hashes para actividades es determinístico: mismo usuario + misma actividad = siempre el mismo hash.

**Enum** — Tipo de dato con un conjunto fijo de valores posibles. En PostgreSQL: `CREATE TYPE user_role AS ENUM ('user', 'admin')`.

**Framework HTTP** — Librería que simplifica la creación de servidores web. Hono maneja el routing, middlewares, y la lectura/escritura de requests y responses.

**Hash** — Resultado de una función matemática que convierte datos de cualquier tamaño en una cadena de longitud fija. Es unidireccional: no se puede recuperar el original a partir del hash.

**HMAC** — *Hash-based Message Authentication Code*. Es un hash que usa una clave secreta adicional. Solo quien conoce la clave puede generar o verificar el hash.

**Hono** — Framework web ultra-ligero para TypeScript. Define rutas con `app.get('/ruta', handler)`, aplica middleware, y gestiona peticiones HTTP.

**Idempotente** — Una operación que puede ejecutarse múltiples veces sin efectos secundarios adicionales. `CREATE TABLE IF NOT EXISTS` es idempotente: si la tabla ya existe, no hace nada.

**JSONB** — Tipo de dato de PostgreSQL para almacenar JSON de forma binaria. Permite búsquedas e índices sobre el contenido JSON, a diferencia del tipo `JSON` que lo guarda como texto.

**JWT** — *JSON Web Token*. Estándar para transmitir información de forma segura entre partes como un string compacto. Tiene tres partes separadas por puntos: `header.payload.signature`.

**Middleware** — Función que se ejecuta "en el medio" entre que llega una petición HTTP y llega al handler final. Puede rechazar la petición, modificarla, o pasarla al siguiente paso.

**Migración** — Script SQL que modifica la estructura de la base de datos (agregar columnas, tablas, índices). En este proyecto el `schema.sql` funciona como una migración inicial.

**ORM** — *Object-Relational Mapper*. Librería que traduce entre objetos JavaScript y tablas de base de datos. En este proyecto se **usan consultas SQL crudas** en los DAOs en vez de un ORM, para mayor control.

**PostgreSQL** — Sistema de gestión de bases de datos relacional de código abierto. Muy robusto, soporta JSONB, triggers, extensiones y más.

**Railway** — Plataforma de despliegue en la nube ("Platform as a Service"). Conecta con GitHub, detecta el lenguaje y despliega automáticamente.

**RAILPACK** — Builder de Railway que analiza el proyecto y construye una imagen Docker optimizada para el runtime detectado (Bun, Node, Python, etc.).

**Slug** — Versión de un título optimizada para URLs. Sin espacios, sin caracteres especiales, todo en minúsculas. Ejemplo: "Introducción a Linux" → `introduccion-a-linux`.

**snake_case** — Convención de nombres donde las palabras se separan con guión bajo: `first_name`, `password_hash`. PostgreSQL usa snake_case por convención.

**Soft Delete** — Patrón donde en vez de eliminar un registro físicamente, se marca con una fecha de eliminación. Permite recuperar datos y mantiene la integridad referencial.

**Supabase** — Plataforma de backend como servicio basada en PostgreSQL. Provee base de datos, autenticación, y más. En este proyecto solo se usa como host de PostgreSQL.

**Trigger** — Función que PostgreSQL ejecuta automáticamente en respuesta a eventos en una tabla (INSERT, UPDATE, DELETE). Son parte de la lógica de negocio que vive en la base de datos.

**TypeScript** — Superset de JavaScript que añade tipos estáticos. El código TypeScript se "compila" (verifica) antes de ejecutarse, reduciendo errores en tiempo de ejecución.

**UUID** — *Universally Unique Identifier*. Identificador de 128 bits generado aleatoriamente. Formato: `550e8400-e29b-41d4-a716-446655440000`. Se usa como clave primaria en vez de números enteros para mayor seguridad y escalabilidad.

**Validación** — Proceso de verificar que los datos de entrada cumplen las reglas esperadas antes de procesarlos. Los Services validan antes de llamar a los DAOs.
