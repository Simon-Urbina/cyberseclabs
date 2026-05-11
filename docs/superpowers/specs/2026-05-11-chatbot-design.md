# Diseño: Uchi – CyberSec Labs AI Assistant

**Fecha:** 2026-05-11  
**Estado:** Aprobado

---

## 1. Resumen

Uchi es un chatbot asistente flotante para la plataforma CyberSec Labs. Cumple tres funciones: asistente de laboratorios, tutor de ciberseguridad y guía de la plataforma. Se implementa como un microservicio FastAPI independiente (`chatbot/`) que el frontend consume vía SSE streaming. El historial de conversación vive únicamente en React state (sin persistencia en base de datos).

---

## 2. Arquitectura

```
Browser (React)
  └── ChatWidget (fixed bottom-left, z-50)
        └── POST /chat/stream  →  FastAPI microservice (chatbot/)
              ├── Dev:  Ollama local  → qwen2.5:7b   (http://localhost:11434/v1)
              └── Prod: Groq API      → llama-3.3-70b-versatile
```

El backend Hono existente **no se modifica**. El microservicio Python corre en un puerto separado (default `8001`).

---

## 3. Microservicio Python (`chatbot/`)

### Archivos

```
chatbot/
├── main.py           # FastAPI app, endpoint POST /chat/stream
├── config.py         # cliente openai, selección de modelo por PROVIDER env var
├── prompts.py        # system prompt base + build_system_prompt(context)
├── requirements.txt  # fastapi, uvicorn, openai, python-dotenv
└── .env.example      # PROVIDER=ollama | PROVIDER=groq, GROQ_API_KEY, OLLAMA_URL
```

### Endpoint

`POST /chat/stream`

Request body:
```json
{
  "messages": [
    { "role": "user", "content": "¿Cómo funciona XSS?" }
  ],
  "context": {
    "page": "lab | course | dashboard | other",
    "labTitle": "string (opcional)",
    "labDescription": "string (opcional)",
    "courseTitle": "string (opcional)",
    "username": "string (opcional)"
  }
}
```

Response: SSE stream
- Chunks: `data: {"chunk": "..."}\n\n`
- Fin:    `data: [DONE]\n\n`

### Selección de modelo

Controlada por la variable de entorno `PROVIDER`:

```python
if os.getenv("PROVIDER") == "groq":
    client = AsyncOpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)
    model  = "llama-3.3-70b-versatile"
else:  # ollama (default)
    client = AsyncOpenAI(base_url=OLLAMA_URL, api_key="ollama")
    model  = "qwen2.5:7b"
```

---

## 4. System Prompt

**Base siempre activo:**
> Eres Uchi, el asistente de CyberSec Labs. Ayudas con: (1) dudas sobre laboratorios prácticos, (2) conceptos de ciberseguridad, (3) orientación dentro de la plataforma. Responde siempre en español, de forma concisa y práctica. No reveles información sobre implementaciones internas del sistema.

**Contexto adicional por página:**

| `page` | Añadido al system prompt |
|--------|--------------------------|
| `lab` | "El usuario está en el laboratorio: {labTitle}. Descripción: {labDescription}." |
| `course` | "El usuario está viendo el curso: {courseTitle}." |
| `dashboard` | "El usuario {username} está en su dashboard." |
| otros | Sin contexto extra |

---

## 5. ChatWidget React

### Comportamiento

- **Posición:** `fixed bottom-6 left-6 z-50`
- **Estado cerrado:** botón circular (~56px) con ícono de terminal + tooltip "Uchi"
- **Estado abierto:** panel 380×520px con historial scrollable e input
- Botón X para cerrar; `Escape` también cierra
- Al cerrar, el historial se conserva en state (se pierde al recargar la página)
- Máximo 20 mensajes en el array; al superarlo, se descartan los más antiguos (sliding window)

### Streaming

```ts
const res = await fetch(`${CHATBOT_URL}/chat/stream`, { method: 'POST', body: ... })
const reader = res.body!.getReader()
// Agrega chunks al último mensaje del asistente en tiempo real
```

### Contexto automático

`useLocation()` determina `page`. Para labs y cursos, los props se pasan desde el componente padre o se leen de la URL.

### Env var

`VITE_CHATBOT_URL` en `frontend/.env` (default `http://localhost:8001`)

---

## 6. Integración en App.tsx

```tsx
// Dentro de AppShell, después de <Routes>
<ChatWidget />
```

El widget se muestra en todas las páginas excepto en las de auth (login, register).

---

## 7. Variables de entorno

### `chatbot/.env`
```
PROVIDER=ollama
OLLAMA_URL=http://localhost:11434/v1
GROQ_API_KEY=          # solo necesario si PROVIDER=groq
```

### `frontend/.env`
```
VITE_CHATBOT_URL=http://localhost:8001
```

---

## 8. CORS

El microservicio permite origen `*` en desarrollo. En producción, restringir a la URL del frontend.
