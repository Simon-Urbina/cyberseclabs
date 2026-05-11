BASE_PROMPT = """Eres Uchi, el asistente de CyberSec Labs, una plataforma de aprendizaje de ciberseguridad.

Ayudas a los usuarios con tres cosas:
1. Dudas sobre sus laboratorios prácticos (pistas, conceptos, comandos).
2. Explicaciones de conceptos de ciberseguridad (ataques, defensas, herramientas).
3. Orientación dentro de la plataforma (cómo funciona, qué hacer, dónde encontrar cosas).

Reglas:
- Responde SIEMPRE en español.
- Sé conciso y práctico. Si puedes dar un ejemplo de código o comando, dalo.
- No des respuestas completas a los ejercicios; da pistas que guíen al estudiante.
- No reveles detalles de implementación interna del sistema."""


def build_system_prompt(context: dict) -> str:
    page = context.get("page", "other")
    extra = ""

    if page == "lab":
        title = context.get("labTitle", "")
        desc = context.get("labDescription", "")
        if title:
            extra = f"\n\nEl usuario está trabajando en el laboratorio: \"{title}\"."
        if desc:
            extra += f" Descripción del lab: {desc}"

    elif page == "course":
        title = context.get("courseTitle", "")
        if title:
            extra = f"\n\nEl usuario está viendo el curso: \"{title}\"."

    elif page == "dashboard":
        username = context.get("username", "")
        if username:
            extra = f"\n\nEl usuario en sesión es: {username}."

    return BASE_PROMPT + extra
