import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

PROVIDER = os.getenv("PROVIDER", "ollama")

if PROVIDER == "groq":
    client = AsyncOpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY", ""),
    )
    MODEL = "llama-3.3-70b-versatile"
else:
    client = AsyncOpenAI(
        base_url=os.getenv("OLLAMA_URL", "http://localhost:11434/v1"),
        api_key="ollama",
    )
    MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
