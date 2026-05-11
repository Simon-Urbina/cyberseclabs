# Documentación Técnica del Frontend — Cybersec Labs

> **Audience:** Desarrolladores o estudiantes que quieran entender cómo está construido el frontend de esta plataforma.  
> **Fecha:** 2026-05-11

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Rutas y Páginas](#4-rutas-y-páginas)
5. [Componentes Compartidos](#5-componentes-compartidos)
6. [Gestión de Estado](#6-gestión-de-estado)
7. [Comunicación con el Backend](#7-comunicación-con-el-backend)
8. [Sistema de Temas (Dark / Light)](#8-sistema-de-temas-dark--light)
9. [Convenciones de Estilos](#9-convenciones-de-estilos)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Comandos de Desarrollo](#11-comandos-de-desarrollo)
12. [Despliegue](#12-despliegue)
13. [Glosario de Términos](#13-glosario-de-términos)

---

## 1. Visión General

El frontend de Cybersec Labs es una **SPA** (*Single Page Application*) construida con React. Su responsabilidad es:

- Presentar el catálogo de cursos, módulos y laboratorios al usuario.
- Guiar al usuario a través de las actividades prácticas y los quizzes de cada laboratorio.
- Mostrar el ranking de usuarios y los perfiles públicos.
- Gestionar el inicio y cierre de sesión sin recargar la página.
- Adaptarse al tema claro u oscuro según la preferencia guardada en `localStorage`.

El frontend es completamente estático una vez compilado: solo contiene HTML, CSS y JavaScript. Toda la lógica de negocio y el acceso a la base de datos ocurre en el backend (Railway).

---

## 2. Stack Tecnológico

| Componente | Tecnología | Para qué sirve |
|---|---|---|
| **Runtime / Bundler** | [Bun](https://bun.sh) | Instala dependencias, ejecuta el dev server y compila el proyecto. Más rápido que npm/yarn. |
| **Framework UI** | [React 19](https://react.dev) | Librería para construir interfaces de usuario mediante componentes reutilizables. |
| **Lenguaje** | TypeScript | JavaScript con tipado estático. Detecta errores antes de ejecutar el código. |
| **Enrutamiento** | [React Router DOM v7](https://reactrouter.com) | Maneja la navegación entre páginas dentro de la SPA sin recargar el navegador. |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com) | Framework de estilos utilitarios. Se aplica con clases directamente en JSX. |
| **Dev server / Build** | [Vite](https://vite.dev) | Inicia el servidor de desarrollo en milisegundos. Compila el proyecto para producción con Rolldown. |
| **Linter** | ESLint + typescript-eslint | Detecta errores de código y malas prácticas. |

---

## 3. Estructura de Carpetas

```
frontend/
├── public/
│   ├── logo.svg                 ← Logo SVG de la plataforma
│   └── media/
│       └── simon_pic.jpg        ← Foto de perfil del autor (usada en AboutPage)
├── src/
│   ├── main.tsx                 ← Punto de entrada: monta <App /> en el DOM
│   ├── App.tsx                  ← Router principal, rutas protegidas y públicas
│   ├── context/
│   │   ├── AuthContext.tsx      ← Estado global de autenticación (user, token, login, logout)
│   │   └── ThemeContext.tsx     ← Estado global del tema (dark/light, toggle)
│   ├── lib/
│   │   └── api.ts               ← Cliente HTTP centralizado (get, post, put, patch, delete)
│   ├── components/
│   │   ├── Header.tsx           ← Barra de navegación superior
│   │   ├── Footer.tsx           ← Pie de página
│   │   ├── Logo.tsx             ← Logo SVG con enlace a la raíz
│   │   ├── ThemeToggle.tsx      ← Botón para alternar tema
│   │   ├── CourseCard.tsx       ← Tarjeta de curso en la lista del dashboard
│   │   ├── Ranking.tsx          ← Tabla de posiciones paginada
│   │   ├── AuthLayout.tsx       ← Layout centrado para páginas de autenticación
│   │   ├── EnrollConfirmModal.tsx ← Modal de confirmación de matrícula
│   │   └── ProfileEditModal.tsx   ← Modal para editar perfil
│   └── pages/
│       ├── LandingPage.tsx      ← Página de inicio pública con hero, features y ranking
│       ├── LoginPage.tsx        ← Formulario de inicio de sesión
│       ├── RegisterPage.tsx     ← Formulario de registro
│       ├── ForgotPasswordPage.tsx ← Solicitar restablecimiento de contraseña
│       ├── ResetPasswordPage.tsx  ← Formulario de nueva contraseña con token
│       ├── DashboardPage.tsx    ← Panel principal del usuario autenticado
│       ├── CoursePage.tsx       ← Detalle de un curso con sus módulos y labs
│       ├── LabPage.tsx          ← Laboratorio con contenido Markdown, actividades y quiz
│       ├── PublicProfilePage.tsx ← Perfil público de cualquier usuario (/u/:username)
│       ├── AboutPage.tsx        ← Página sobre el autor de la plataforma
│       └── NotFoundPage.tsx     ← Página 404
├── index.html                   ← HTML raíz con el div#root donde React se monta
├── vite.config.ts               ← Configuración de Vite (plugin React, plugin Tailwind)
├── tsconfig.json                ← Configuración del compilador TypeScript
└── package.json                 ← Dependencias y scripts del proyecto
```

---

## 4. Rutas y Páginas

Las rutas se definen en `src/App.tsx` usando React Router DOM. Hay tres tipos:

### Rutas públicas (sin autenticación)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `LandingPage` | Página de inicio: hero, features, stats, ranking |
| `/about` | `AboutPage` | Sobre el autor y la historia del proyecto |
| `/u/:username` | `PublicProfilePage` | Perfil público de un usuario |
| `/forgot-password` | `ForgotPasswordPage` | Formulario para pedir reset de contraseña |
| `/reset-password` | `ResetPasswordPage` | Formulario para establecer nueva contraseña |

### Rutas de autenticación (`PublicRoute`)

Solo accesibles si el usuario **no** está autenticado. Si ya tiene sesión, redirige a `/dashboard`.

| Ruta | Componente |
|---|---|
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |

### Rutas protegidas (`PrivateRoute`)

Solo accesibles si el usuario **sí** está autenticado. Si no tiene sesión, redirige a `/login`.

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `DashboardPage` | Panel principal: cursos inscritos y disponibles |
| `/courses/:slug` | `CoursePage` | Módulos y laboratorios de un curso |
| `/courses/:slug/:moduleSlug/:labSlug` | `LabPage` | Laboratorio completo con quiz |

### `PrivateRoute` y `PublicRoute`

```tsx
// PrivateRoute: redirige a /login si no hay token
function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

// PublicRoute: redirige a /dashboard si ya hay token
function PublicRoute({ children }) {
  const { token } = useAuth()
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />
}
```

---

## 5. Componentes Compartidos

### `Header`

Barra de navegación superior que aparece en la mayoría de páginas. Contiene:
- Logo con enlace a `/`
- Links de navegación (Dashboard, Ranking, About)
- Avatar del usuario con dropdown (perfil, cerrar sesión)
- `ThemeToggle` para cambiar el tema

### `Footer`

Pie de página con créditos y links externos. Se incluye en LandingPage y AboutPage.

### `CourseCard`

Tarjeta que muestra el resumen de un curso: título, dificultad, número de módulos/labs, puntos totales y estado de matrícula. Aparece en `DashboardPage`.

### `Ranking`

Tabla de clasificación paginada. Muestra posición, avatar, username, puntos y bio. Se usa tanto en `LandingPage` (previsualización) como en páginas dedicadas.

### `AuthLayout`

Layout centrado utilizado por las páginas de autenticación (Login, Register, ForgotPassword, ResetPassword). Mantiene la consistencia visual sin el Header/Footer principal.

### `EnrollConfirmModal`

Modal de confirmación antes de matricularse en un curso. Muestra el nombre del curso y los puntos que se pueden ganar.

### `ProfileEditModal`

Modal para editar el perfil del usuario autenticado: username, email, bio y foto de perfil. Llama a `PUT /api/users/me` y `POST /api/users/me/avatar`.

---

## 6. Gestión de Estado

El estado global se maneja con **React Context** — no se usa Redux ni Zustand. Hay dos contextos:

### `AuthContext` (`src/context/AuthContext.tsx`)

Gestiona la sesión del usuario. Expone:

| Valor / Función | Tipo | Descripción |
|---|---|---|
| `user` | `AuthUser \| null` | Datos del usuario autenticado (id, username, email, role) |
| `token` | `string \| null` | JWT guardado en `localStorage` |
| `login(token, user)` | función | Guarda el token y usuario en estado + `localStorage` |
| `logout()` | función | Limpia el estado y `localStorage` |
| `updateUser(patch)` | función | Actualiza parcialmente el usuario en estado + `localStorage` |

El estado se inicializa leyendo `localStorage` para que la sesión persista entre recargas de página.

**Uso:**
```tsx
const { user, token, logout } = useAuth()
```

### `ThemeContext` (`src/context/ThemeContext.tsx`)

Gestiona el tema visual. Expone:

| Valor / Función | Tipo | Descripción |
|---|---|---|
| `theme` | `'dark' \| 'light'` | Tema activo |
| `toggle()` | función | Alterna entre dark y light |

Al cambiar el tema, agrega/quita la clase `dark` en `<html>` y guarda la preferencia en `localStorage`.

**Uso:**
```tsx
const { theme, toggle } = useTheme()
const isDark = theme === 'dark'
```

---

## 7. Comunicación con el Backend

Todo el acceso al backend pasa por `src/lib/api.ts`. Es un cliente HTTP minimalista construido sobre `fetch`.

### Estructura

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', ... }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', ... }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', ... }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```

### Comportamiento automático

- **Token JWT**: Si hay un token en `localStorage`, lo incluye en el header `Authorization: Bearer <token>` automáticamente en cada petición.
- **Errores**: Si la respuesta HTTP no es OK (`!res.ok`), lanza un `Error` con el mensaje del campo `error` del JSON de respuesta.
- **Content-Type**: Siempre envía `Content-Type: application/json`.

### Ejemplo de uso en un componente

```tsx
import { api } from '../lib/api'

// GET con tipo de respuesta
const cursos = await api.get<Course[]>('/api/courses')

// POST con body
await api.post('/api/courses/intro-linux/enroll', {})

// Manejo de errores
try {
  await api.put('/api/users/me', { username: 'nuevo' })
} catch (err) {
  console.error(err.message) // Mensaje en español del backend
}
```

> **Nota sobre imágenes (avatar):** La subida de foto de perfil usa `fetch` directamente (no `api.ts`) porque se envía como `FormData` con `Content-Type: multipart/form-data`, no como JSON.

---

## 8. Sistema de Temas (Dark / Light)

El frontend soporta dos temas. El sistema funciona así:

1. `ThemeContext` lee el tema guardado en `localStorage` al cargar la app.
2. Al cambiar el tema, agrega/quita la clase `dark` en `document.documentElement` (`<html>`).
3. Los colores se aplican **inline** con condicionales `isDark ? '#color-dark' : '#color-light'`, en vez de usar variables CSS de Tailwind.

### Paleta de colores

| Uso | Dark | Light |
|---|---|---|
| Fondo principal | `#060D1F` | `#EEF3FC` |
| Fondo hero / secciones | `#0D1630` | `#E8EEFA` |
| Fondo tarjetas | `rgba(13,27,70,0.85)` | `#f8faff` |
| Texto principal | `#C8D5EE` | `#0A1545` |
| Texto secundario | `#7B9FE8` | `#2451C8` |
| Texto apagado | `#4A70CC` | `#4A70CC` |
| Acento azul oscuro | `#1A3F96` | `#1A3F96` |
| Acento azul claro | `#2596be` | `#2596be` |
| Acento amarillo | `#F5C500` | `#F5C500` |
| Borde tarjetas | `rgba(26,63,150,0.14)` | `rgba(26,63,150,0.10)` |

### Patrón de código

```tsx
const { theme } = useTheme()
const isDark = theme === 'dark'

// Uso en JSX
<div style={{ background: isDark ? '#060D1F' : '#EEF3FC' }}>
```

---

## 9. Convenciones de Estilos

### Clases de Tailwind vs. estilos inline

- **Tailwind** se usa para: layout (`flex`, `grid`, `items-center`), espaciado (`px-6`, `py-4`, `gap-3`), tipografía (`text-sm`, `font-mono`), tamaños (`w-12`, `h-12`), bordes (`rounded-2xl`), transiciones (`transition-all`, `duration-200`).
- **Estilos inline** se usan para: colores que dependen del tema (`isDark ? ... : ...`), colores de acento personalizados, sombras complejas, gradientes.

### Fuentes tipográficas

| Clase | Uso |
|---|---|
| `font-display` | Títulos principales (h1, h2) |
| `font-mono` | Labels, código, badges, etiquetas técnicas |
| `font-light` | Texto de cuerpo y descripciones |

### Animaciones

Las páginas usan animaciones de entrada escalonadas definidas con clases personalizadas:
- `animate-fade-up-1`, `animate-fade-up-2`, etc. — elementos que entran deslizándose hacia arriba con retraso creciente.
- `cursor-blink` — efecto de cursor parpadeante en el terminal de la AboutPage.
- `glowPulse` — efecto de brillo pulsante en los orbs decorativos.

### Hover interactivo

Los cards y botones usan `onMouseEnter` / `onMouseLeave` para aplicar estilos dinámicos (elevación, cambio de borde/color) porque los valores dependen del tema y de variables del componente, lo que no es posible solo con Tailwind.

---

## 10. Variables de Entorno

El frontend necesita una sola variable de entorno:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_API_URL` | ❌ | URL base del backend. Si no se define, usa `http://localhost:3000` |

**En desarrollo** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

**En producción**, se configura como variable de entorno en el proveedor de hosting (Netlify, Vercel, Cloudflare Pages, etc.) antes del build.

> **Importante:** Solo las variables que empiezan con `VITE_` son expuestas al código del navegador por Vite. Variables sin ese prefijo permanecen privadas en el servidor de build.

---

## 11. Comandos de Desarrollo

```bash
# Instalar dependencias
bun install

# Iniciar dev server (hot reload en localhost:5173)
bun dev

# Compilar para producción (genera frontend/dist/)
bun run build

# Previsualizar el build de producción localmente
bun preview

# Ejecutar el linter
bun run lint
```

El proceso de build (`bun run build`) ejecuta dos pasos:
1. `tsc -b` — verifica los tipos TypeScript sin emitir archivos.
2. `vite build` — compila y empaqueta el código en `dist/`.

El contenido de `dist/` es lo que se sube al servidor de hosting.

---

## 12. Despliegue

### Paso 1 — Construir el proyecto

```bash
# Con la URL del backend de Railway
VITE_API_URL=https://tu-backend.railway.app bun run build
```

O configurar `VITE_API_URL` como variable de entorno en el panel del proveedor y hacer el build ahí.

### Paso 2 — Subir `dist/` al hosting

El frontend compilado es completamente estático. Cualquier proveedor de hosting estático funciona.

| Proveedor | Notas |
|---|---|
| **Cloudflare Pages** | CDN global ultrarrápido, sin límite de builds, configuración de redirects para SPA muy simple. Recomendado. |
| **Netlify** | Muy popular, buen plan gratuito, detección automática de Vite. |
| **Vercel** | Optimizado para proyectos JavaScript/TypeScript, excelente DX. |
| **GitHub Pages** | Gratuito, pero requiere configuración extra para React Router (SPA con rutas anidadas). |

### Configuración SPA requerida

Dado que la app usa React Router con rutas como `/dashboard` o `/courses/:slug`, el servidor de hosting debe redirigir **todas las rutas** a `index.html`. Sin esto, una recarga directa en `/dashboard` dará 404.

**En Netlify** — archivo `public/_redirects`:
```
/*  /index.html  200
```

**En Cloudflare Pages** — se configura desde el panel de control (o `public/_redirects` también funciona).

**En Vercel** — archivo `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 13. Glosario de Términos

**Bundle / Build** — El proceso de compilar y empaquetar el código fuente (TypeScript, JSX, CSS) en archivos optimizados que el navegador puede ejecutar directamente.

**CDN** — *Content Delivery Network*. Red de servidores distribuidos globalmente que sirven los archivos estáticos desde el servidor más cercano al usuario, reduciendo la latencia.

**Context API** — Mecanismo nativo de React para compartir estado entre componentes sin necesidad de pasar props manualmente por cada nivel del árbol de componentes.

**CSR** — *Client-Side Rendering*. El navegador descarga un HTML mínimo y JavaScript, y React renderiza la interfaz en el cliente. Contrasta con SSR (Server-Side Rendering).

**ESLint** — Herramienta de análisis estático para JavaScript/TypeScript que detecta errores, malas prácticas y problemas de estilo en el código.

**Hook** — Función de React que permite usar características como estado (`useState`) o efectos secundarios (`useEffect`) dentro de componentes funcionales. Los hooks personalizados (como `useAuth`, `useTheme`) encapsulan lógica reutilizable.

**Hot Reload** — Característica del dev server de Vite que actualiza automáticamente el navegador cuando se guarda un archivo, sin perder el estado de la aplicación.

**JSX** — *JavaScript XML*. Extensión de sintaxis de JavaScript que permite escribir estructuras similares a HTML dentro de código JS. React las convierte en llamadas a funciones.

**LocalStorage** — API del navegador para guardar datos como strings en el disco local. El frontend la usa para persistir el token JWT y la preferencia de tema entre sesiones.

**PrivateRoute** — Componente que verifica si el usuario tiene sesión activa antes de renderizar su contenido. Si no la tiene, redirige al login.

**SPA** — *Single Page Application*. Aplicación web que carga una sola página HTML y actualiza el contenido dinámicamente con JavaScript, sin recargas completas del navegador.

**TypeScript** — Superset de JavaScript con tipos estáticos. Detecta errores de tipado en tiempo de desarrollo. Se "compila" a JavaScript normal para el navegador.

**Vite** — Herramienta moderna de build para proyectos frontend. Usa ES Modules nativos en desarrollo (arranque instantáneo) y Rolldown en producción (bundle optimizado).

**VITE_API_URL** — Variable de entorno que le dice al frontend dónde está el backend. Vite la inyecta en el código durante el build, por lo que el valor queda fijo en el bundle resultante.
