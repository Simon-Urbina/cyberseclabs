import json
import unicodedata
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KNOWLEDGE_PATH = Path(__file__).parent / "knowledge.json"
MIN_SCORE = 0.10
TOP_K = 3


def normalize(text: str) -> str:
    """Minúsculas + elimina tildes/diacríticos para matching robusto."""
    nfd = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


class FAQRetriever:
    def __init__(self):
        with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
            self.faqs: list[dict] = json.load(f)

        # Normalizar antes de indexar: "qué" == "que", "cómo" == "como"
        corpus = [normalize(f"{item['q']} {item['a']}") for item in self.faqs]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1,
        )
        self.matrix = self.vectorizer.fit_transform(corpus)

    def retrieve(self, query: str) -> list[dict]:
        qvec = self.vectorizer.transform([normalize(query)])
        scores = cosine_similarity(qvec, self.matrix).flatten()
        top_indices = np.argsort(scores)[::-1][:TOP_K]
        return [
            self.faqs[i]
            for i in top_indices
            if scores[i] >= MIN_SCORE
        ]


# Instancia única cargada al arrancar el servidor
retriever = FAQRetriever()
