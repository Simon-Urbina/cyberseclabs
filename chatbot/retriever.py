import json
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KNOWLEDGE_PATH = Path(__file__).parent / "knowledge.json"
MIN_SCORE = 0.10
TOP_K = 3


class FAQRetriever:
    def __init__(self):
        with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
            self.faqs: list[dict] = json.load(f)

        # Indexamos pregunta + respuesta para capturar sinónimos en ambos
        corpus = [f"{item['q']} {item['a']}" for item in self.faqs]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),   # unigramas y bigramas
            sublinear_tf=True,    # suaviza diferencias de frecuencia
            min_df=1,
        )
        self.matrix = self.vectorizer.fit_transform(corpus)

    def retrieve(self, query: str) -> list[dict]:
        qvec = self.vectorizer.transform([query])
        scores = cosine_similarity(qvec, self.matrix).flatten()
        top_indices = np.argsort(scores)[::-1][:TOP_K]
        return [
            self.faqs[i]
            for i in top_indices
            if scores[i] >= MIN_SCORE
        ]


# Instancia única cargada al arrancar el servidor
retriever = FAQRetriever()
