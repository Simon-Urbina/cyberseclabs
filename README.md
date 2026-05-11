# Laboratorios de Ciberseguridad

Plataforma de aprendizaje en ciberseguridad donde los usuarios se inscriben en cursos, trabajan laboratorios prácticos, completan actividades interactivas y responden quizzes. Los usuarios acumulan puntos al completar laboratorios.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | [Bun](https://bun.sh/) |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Backend | Hono 4 |
| Base de datos | PostgreSQL en [Supabase](https://supabase.com/) |
| Despliegue backend | Railway |
| Despliegue frontend | Cualquier host estático (Vercel, Netlify, etc.) |

---

## Estructura del repositorio

```
cybersec-labs/
├── backend/
│   ├── database/
│   │   └── schema.sql          # Esquema idempotente (seguro re-ejecutar)
│   └── src/
│       ├── index.ts             # Entrada Hono + CORS
│       ├── db/index.ts          # Conexión postgres
│       ├── middleware/auth.ts   # requireAuth / optionalAuth / requireAdmin
│       ├── types.ts             # TokenPayload y tipos compartidos
│       ├── models/              # Clases de dominio (sin ORM)
│       ├── daos/                # Acceso a datos (SQL crudo con postgres)
│       ├── services/            # Lógica de negocio
│       ├── controllers/         # Manejo request/response
│       ├── routes/              # Definición de rutas Hono
│       └── utils/               # errors.ts, response.ts
└── frontend/
    └── src/
        ├── context/             # AuthContext, ThemeContext
        ├── lib/                 # api.ts — cliente HTTP centralizado
        ├── components/          # Header, Footer, CourseCard, Ranking, modals…
        └── pages/               # Landing, Login, Register, ForgotPassword, ResetPassword,
                                 # Dashboard, CoursePage, LabPage, PublicProfilePage, AboutPage, NotFoundPage
```

---

## Primeros pasos

### Prerrequisitos

- [Bun](https://bun.sh/) instalado (incluye runtime, bundler y gestor de paquetes)
- Una base de datos PostgreSQL (recomendado: Supabase)

### 1. Clonar e instalar dependencias

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install
```

### 2. Variables de entorno

**`backend/.env`**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=tu_secreto_muy_seguro
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3000
```

### 3. Inicializar la base de datos

Ejecuta `backend/database/schema.sql` en el editor SQL de Supabase (o en cualquier cliente PostgreSQL). El script es idempotente: puede ejecutarse varias veces sin errores.

### 4. Correr en desarrollo

```bash
# Backend (hot reload con --watch)
cd backend
bun dev          # → http://localhost:3000

# Frontend (en otra terminal)
cd frontend
bun dev          # → http://localhost:5173
```

---

## Paquetes instalados

### Backend (`backend/package.json`)

| Paquete | Versión | Uso |
|---------|---------|-----|
| `hono` | ^4.12.5 | Framework web |
| `postgres` | ^3.4.8 | Driver PostgreSQL (SQL crudo) |
| `jsonwebtoken` | ^9.0.3 | Generación y verificación de JWT |
| `drizzle-orm` | ^0.45.1 | ORM (instalado, las queries usan `postgres` directamente) |
| `@types/bun` | ^1.3.10 | Tipos de Bun |
| `@types/jsonwebtoken` | ^9.0.9 | Tipos de jsonwebtoken |
| `@types/node` | ^24.10.1 | Tipos de Node |
| `typescript` | ~5.9.3 | Compilador TypeScript |

> El hashing de contraseñas usa `Bun.password.hash` / `Bun.password.verify` (API nativa de Bun, sin paquete adicional).

### Frontend (`frontend/package.json`)

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` | ^19.2.0 | UI |
| `react-dom` | ^19.2.0 | Renderizado DOM |
| `react-router-dom` | ^7.14.2 | Enrutamiento SPA |
| `tailwindcss` | ^4.2.4 | Estilos utilitarios |
| `@tailwindcss/vite` | ^4.2.4 | Plugin Tailwind para Vite |
| `vite` | ^7.3.1 | Dev server y bundler |
| `@vitejs/plugin-react` | ^5.1.1 | Plugin React para Vite |
| `typescript` | ~5.9.3 | Compilador TypeScript |
| `eslint` | ^9.39.1 | Linter |
| `typescript-eslint` | ^8.48.0 | Reglas ESLint para TS |

---

## Comandos de referencia

### Backend

```bash
bun dev          # Desarrollo con hot reload
bun start        # Producción
```

### Frontend

```bash
bun dev          # Dev server en localhost:5173
bun run build    # tsc -b + vite build (producción)
bun run lint     # ESLint
bun preview      # Vista previa del build de producción
```

---

## API — Endpoints disponibles

Base URL: `http://localhost:3000`

### Estadísticas (`/api/stats`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/stats` | — | Métricas globales (cursos, labs, usuarios, puntos) |

### Autenticación (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Registrar usuario |
| POST | `/api/auth/login` | — | Iniciar sesión → devuelve JWT |
| POST | `/api/auth/logout` | Bearer | Cerrar sesión |
| POST | `/api/auth/forgot-password` | — | Enviar email de restablecimiento |
| POST | `/api/auth/reset-password` | — | Restablecer contraseña con token |

### Usuarios (`/api/users`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/users/me` | Bearer | Perfil propio |
| PUT | `/api/users/me` | Bearer | Actualizar perfil (username, bio…) |
| POST | `/api/users/me/password` | Bearer | Cambiar contraseña |
| POST | `/api/users/me/avatar` | Bearer | Subir foto de perfil |
| GET | `/api/users/:username` | — | Perfil público |

### Cursos (`/api/courses`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/courses` | Opcional | Listar cursos publicados |
| GET | `/api/courses/:slug` | Opcional | Detalle de un curso |
| POST | `/api/courses/:slug/enroll` | Bearer | Inscribirse en un curso |
| GET | `/api/courses/:slug/modules` | — | Módulos del curso |
| GET | `/api/courses/:slug/modules/:moduleSlug/labs` | — | Laboratorios del módulo |
| GET | `/api/courses/:slug/modules/:moduleSlug/labs/:labSlug` | Bearer | Detalle de un laboratorio |

### Actividades y envíos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/activities/:activityId/attempt` | Bearer | Intentar una actividad práctica |
| POST | `/api/labs/:labId/submit` | Bearer | Enviar quiz del laboratorio (5 respuestas) |

### Ranking

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/ranking` | — | Tabla de clasificación global |

### Administración (`/api/admin`) — solo rol `admin`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/courses` | Crear curso |
| PUT | `/api/admin/courses/:id` | Actualizar curso |
| POST | `/api/admin/courses/:courseId/modules` | Crear módulo |
| PUT | `/api/admin/modules/:id` | Actualizar módulo |
| POST | `/api/admin/modules/:moduleId/labs` | Crear laboratorio |
| PUT | `/api/admin/labs/:id` | Actualizar laboratorio |
| POST | `/api/admin/labs/:labId/questions` | Agregar pregunta (máx. 5) |
| PUT | `/api/admin/questions/:id` | Actualizar pregunta |
| POST | `/api/admin/questions/:questionId/options` | Agregar opción de respuesta |
| POST | `/api/admin/questions/:questionId/activity` | Crear actividad práctica |
| PUT | `/api/admin/activities/:id` | Actualizar actividad |

### Health check

```
GET /health  →  { "status": "ok" }
```

---

## Arquitectura del backend

```
Routes → Controllers → Services → DAOs → PostgreSQL
```

- **Routes**: definen los endpoints y aplican middlewares (`requireAuth`, `optionalAuth`, `requireAdmin`)
- **Controllers**: reciben `Context` de Hono y delegan a Services
- **Services**: lógica de negocio (cálculo de `score_percent`, validaciones, etc.)
- **DAOs**: queries SQL crudas usando el driver `postgres`
- **Models**: clases de dominio con métodos de proyección (`toPublic()`, `toSummary()`, `toAdmin()`, `toProfile()`, `toSession()`, `toRankingRow()`)

### Autenticación

JWT via header `Authorization: Bearer <token>`. Tres middlewares:
- `optionalAuth`: adjunta el usuario si el token es válido; no falla si no hay token
- `requireAuth`: exige token válido (401 si no)
- `requireAdmin`: exige token válido con `role === 'admin'` (403 si no)

---

## Esquema de base de datos

Jerarquía principal: `courses → course_modules → laboratories → laboratory_questions → laboratory_question_options / question_activities`

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios con soft-delete (`deleted_at`) |
| `courses` | Cursos con slug único y dificultad (`principiante`, `intermedio`, `avanzado`) |
| `course_modules` | Módulos ordenados por posición dentro de un curso |
| `laboratories` | Laboratorios con contenido Markdown, puntos y quiz de exactamente 5 preguntas |
| `laboratory_questions` | Preguntas tipo `multiple_choice` o `activity_response` |
| `laboratory_question_options` | Opciones para preguntas de opción múltiple |
| `question_activities` | Actividad práctica vinculada 1:1 a una pregunta |
| `user_activity_progress` | Progreso del usuario por actividad |
| `activity_action_logs` | Registro de cada intento en una actividad |
| `submissions` | Envíos de quiz (exactamente 5 respuestas por envío) |
| `user_laboratory_progress` | Mejor puntaje y estado por usuario/laboratorio |
| `course_enrollments` | Inscripciones usuario-curso |

### Triggers automáticos

1. `activity_action_logs` INSERT → upserta `user_activity_progress`
2. `submissions` INSERT → upserta `user_laboratory_progress`
3. `user_laboratory_progress` cambia a `completed` (primera vez) → suma `laboratories.points` a `users.points`

---

## Despliegue

### Backend — Railway

Variables de entorno requeridas en Railway:
```
DATABASE_URL
JWT_SECRET
PORT
FRONTEND_URL
```

Configuración en `backend/railway.json`.

### Base de datos — Supabase

Ejecutar `backend/database/schema.sql` en el Editor SQL de Supabase.

### Frontend — host estático

Configurar `VITE_API_URL` apuntando al backend de Railway antes de hacer el build:

```bash
VITE_API_URL=https://tu-backend.railway.app bun run build
```

Subir el contenido de `frontend/dist/` a Vercel, Netlify u otro host estático.
