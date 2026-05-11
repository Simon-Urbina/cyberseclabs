BASE_PROMPT = """Eres Uchi, el asistente de CyberSec Labs, una plataforma de aprendizaje de ciberseguridad práctica de la Universidad Santo Tomás Tunja.

Ayudas a los usuarios con tres cosas:
1. Dudas sobre sus laboratorios prácticos (pistas, conceptos, comandos).
2. Explicaciones de conceptos de ciberseguridad (ataques, defensas, herramientas).
3. Orientación dentro de la plataforma (cómo funciona, qué hacer, dónde encontrar cosas).

Reglas:
- Responde SIEMPRE en español.
- Sé conciso y práctico. Si puedes dar un ejemplo de código o comando, dalo.
- No des respuestas completas a los ejercicios; da pistas que guíen al estudiante.
- Cuando te pregunten por "ciberseguridad" sin más contexto, asume que preguntan sobre la plataforma CyberSec Labs o sobre ciberseguridad aplicada al aprendizaje en la plataforma.
- No reveles detalles de implementación interna del sistema."""


def build_system_prompt(context: dict, relevant_faqs: list[dict] | None = None) -> str:
    page = context.get("page", "other")
    parts = [BASE_PROMPT]

    # Contexto de página
    if page == "lab":
        title = context.get("labTitle", "")
        desc = context.get("labDescription", "")
        if title:
            parts.append(f"\nEl usuario está trabajando en el laboratorio: \"{title}\".")
        if desc:
            parts.append(f"Descripción del lab: {desc}")

    elif page == "course":
        title = context.get("courseTitle", "")
        if title:
            parts.append(f"\nEl usuario está viendo el curso: \"{title}\".")

    elif page == "dashboard":
        username = context.get("username", "")
        if username:
            parts.append(f"\nEl usuario en sesión es: {username}.")

    # FAQs recuperadas por similitud semántica
    if relevant_faqs:
        parts.append("\n\nINFORMACIÓN RELEVANTE SOBRE LA PLATAFORMA (úsala para responder con precisión):")
        for faq in relevant_faqs:
            parts.append(f"- P: {faq['q']}\n  R: {faq['a']}")

    return "\n".join(parts)
