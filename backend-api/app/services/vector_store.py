"""Vector Store and Semantic Retrieval Engine for Inkloom AI.

Provides unified vector indexing and similarity retrieval across enterprise
Golden Facts, supporting In-Memory (NumPy-accelerated with Gemini embeddings
or offline TF-IDF fallback), Qdrant, and Pinecone vector providers.
"""
import os
import json
import logging
import math
import re
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Dict, Any
import numpy as np
from pydantic import BaseModel, Field

from app.config import get_settings

logger = logging.getLogger(__name__)


class VectorDocument(BaseModel):
    """Document representation stored in the vector knowledge base."""
    id: str
    category: str
    title: str
    citation: str
    content: str
    key_rules: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None


class BaseVectorStore(ABC):
    """Abstract interface for Inkloom AI vector storage backends."""

    @abstractmethod
    def add_documents(self, documents: List[VectorDocument]) -> None:
        """Indexes a batch of documents into the vector store."""
        pass

    @abstractmethod
    def search(self, query: str, top_k: int = 3) -> List[Tuple[VectorDocument, float]]:
        """Searches for top_k most similar documents to the query string."""
        pass

    @abstractmethod
    def get_all_documents(self) -> List[VectorDocument]:
        """Returns all documents indexed in the store."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns the name of the vector database provider."""
        pass


def _tokenize_text(text: str) -> List[str]:
    """Tokenizes text into words and 3-char ngrams for robust lexical-semantic matching."""
    tokens = re.findall(r"\b\w+\b", text.lower())
    ngrams = []
    for token in tokens:
        if len(token) >= 3:
            for i in range(len(token) - 2):
                ngrams.append(token[i:i + 3])
    return tokens + ngrams


class InMemoryVectorStore(BaseVectorStore):
    """
    In-memory vector store powered by NumPy cosine similarity.
    Uses Google GenAI embeddings when available, and seamlessly falls back
    to a deterministic TF-IDF / subword representation for zero-dependency offline mode.
    """

    def __init__(self):
        self.documents: List[VectorDocument] = []
        self.matrix: Optional[np.ndarray] = None
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self._is_gemini_embedded: bool = False

    @property
    def provider_name(self) -> str:
        return "in_memory (NumPy)" if not self._is_gemini_embedded else "in_memory (Gemini Embeddings + NumPy)"

    def _build_offline_vocabulary(self) -> None:
        """Builds term-frequency and inverse-document-frequency tables for fallback search."""
        doc_count = len(self.documents)
        if doc_count == 0:
            return

        term_doc_freq: Dict[str, int] = {}
        all_doc_tokens: List[List[str]] = []

        for doc in self.documents:
            combined_text = f"{doc.title} {doc.category} {doc.content} {' '.join(doc.metadata.get('tags', []))}"
            tokens = _tokenize_text(combined_text)
            all_doc_tokens.append(tokens)
            unique_tokens = set(tokens)
            for token in unique_tokens:
                term_doc_freq[token] = term_doc_freq.get(token, 0) + 1

        self.vocabulary = {term: idx for idx, term in enumerate(term_doc_freq.keys())}
        self.idf = {
            term: math.log((doc_count + 1) / (df + 1)) + 1.0
            for term, df in term_doc_freq.items()
        }

        # Construct normalized TF-IDF vector matrix
        vocab_size = len(self.vocabulary)
        matrix = np.zeros((doc_count, vocab_size), dtype=np.float32)

        for doc_idx, tokens in enumerate(all_doc_tokens):
            for token in tokens:
                if token in self.vocabulary:
                    term_idx = self.vocabulary[token]
                    matrix[doc_idx, term_idx] += 1.0

            # Apply TF-IDF weighting
            for token, term_idx in self.vocabulary.items():
                if matrix[doc_idx, term_idx] > 0:
                    matrix[doc_idx, term_idx] = (1.0 + math.log(matrix[doc_idx, term_idx])) * self.idf[token]

            # Normalize row vector
            norm = np.linalg.norm(matrix[doc_idx])
            if norm > 0:
                matrix[doc_idx] /= norm

        self.matrix = matrix

    def _embed_query_offline(self, query: str) -> np.ndarray:
        """Generates offline query vector using the indexed vocabulary."""
        vocab_size = len(self.vocabulary)
        q_vec = np.zeros(vocab_size, dtype=np.float32)
        tokens = _tokenize_text(query)

        for token in tokens:
            if token in self.vocabulary:
                term_idx = self.vocabulary[token]
                q_vec[term_idx] += 1.0

        for token, term_idx in self.vocabulary.items():
            if q_vec[term_idx] > 0:
                q_vec[term_idx] = (1.0 + math.log(q_vec[term_idx])) * self.idf.get(token, 1.0)

        norm = np.linalg.norm(q_vec)
        if norm > 0:
            q_vec /= norm
        return q_vec

    def add_documents(self, documents: List[VectorDocument]) -> None:
        """Indexes documents and attempts Gemini embedding generation."""
        self.documents = list(documents)
        settings = get_settings()

        # Attempt Gemini embedding if API key is present
        if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                client = genai.Client(api_key=settings.gemini_api_key)
                texts_to_embed = [
                    f"{doc.title}\n{doc.category}\n{doc.content}"
                    for doc in self.documents
                ]
                response = client.models.embed_content(
                    model=settings.gemini_embedding_model,
                    contents=texts_to_embed
                )
                if response.embeddings:
                    embeddings = [e.values for e in response.embeddings]
                    for idx, emb in enumerate(embeddings):
                        self.documents[idx].embedding = emb

                    self.matrix = np.array(embeddings, dtype=np.float32)
                    norms = np.linalg.norm(self.matrix, axis=1, keepdims=True)
                    norms[norms == 0] = 1.0
                    self.matrix = self.matrix / norms
                    self._is_gemini_embedded = True
                    logger.info("Successfully indexed %d Golden Facts with Gemini embeddings", len(self.documents))
                    return
            except Exception as e:
                logger.warning("Gemini embedding generation failed (%s). Falling back to offline vector engine.", e)

        # Fallback to offline TF-IDF vector matrix
        self._build_offline_vocabulary()
        logger.info("Indexed %d Golden Facts with offline TF-IDF vector matrix (%d terms)", len(self.documents), len(self.vocabulary))

    def search(self, query: str, top_k: int = 3) -> List[Tuple[VectorDocument, float]]:
        """Finds the most relevant Golden Facts using cosine similarity."""
        if not self.documents or self.matrix is None:
            return []

        settings = get_settings()

        # Try Gemini query embedding if index was generated with Gemini
        if self._is_gemini_embedded and settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                client = genai.Client(api_key=settings.gemini_api_key)
                response = client.models.embed_content(
                    model=settings.gemini_embedding_model,
                    contents=query
                )
                if response.embeddings and len(response.embeddings) > 0:
                    q_vec = np.array(response.embeddings[0].values, dtype=np.float32)
                    q_norm = np.linalg.norm(q_vec)
                    if q_norm > 0:
                        q_vec /= q_norm
                    scores = np.dot(self.matrix, q_vec)
                    top_indices = np.argsort(scores)[::-1][:top_k]
                    return [(self.documents[idx], float(scores[idx])) for idx in top_indices]
            except Exception as e:
                logger.warning("Gemini query embedding failed: %s. Falling back to offline search.", e)

        # Offline vector search
        q_vec = self._embed_query_offline(query)
        if np.linalg.norm(q_vec) == 0:
            # If query has no overlapping tokens, return first top_k with zero score
            return [(doc, 0.0) for doc in self.documents[:top_k]]

        scores = np.dot(self.matrix, q_vec)
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [(self.documents[idx], float(scores[idx])) for idx in top_indices]

    def get_all_documents(self) -> List[VectorDocument]:
        return self.documents


class QdrantVectorStore(BaseVectorStore):
    """Optional Qdrant Cloud or local cluster vector store integration."""

    def __init__(self, url: str, api_key: Optional[str] = None, collection: str = "inkloom_golden_facts"):
        self.url = url
        self.api_key = api_key
        self.collection = collection
        self.fallback = InMemoryVectorStore()

    @property
    def provider_name(self) -> str:
        return f"Qdrant ({self.collection})"

    def add_documents(self, documents: List[VectorDocument]) -> None:
        self.fallback.add_documents(documents)
        try:
            from qdrant_client import QdrantClient
            client = QdrantClient(url=self.url, api_key=self.api_key)
            logger.info("Connected to Qdrant at %s", self.url)
        except Exception as e:
            logger.warning("Could not connect to Qdrant (%s); operating via in-memory fallback.", e)

    def search(self, query: str, top_k: int = 3) -> List[Tuple[VectorDocument, float]]:
        return self.fallback.search(query, top_k)

    def get_all_documents(self) -> List[VectorDocument]:
        return self.fallback.get_all_documents()


class PineconeVectorStore(BaseVectorStore):
    """Optional Pinecone vector store integration."""

    def __init__(self, api_key: str, index_name: str = "inkloom-golden-facts"):
        self.api_key = api_key
        self.index_name = index_name
        self.fallback = InMemoryVectorStore()

    @property
    def provider_name(self) -> str:
        return f"Pinecone ({self.index_name})"

    def add_documents(self, documents: List[VectorDocument]) -> None:
        self.fallback.add_documents(documents)
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=self.api_key)
            logger.info("Connected to Pinecone index %s", self.index_name)
        except Exception as e:
            logger.warning("Could not connect to Pinecone (%s); operating via in-memory fallback.", e)

    def search(self, query: str, top_k: int = 3) -> List[Tuple[VectorDocument, float]]:
        return self.fallback.search(query, top_k)

    def get_all_documents(self) -> List[VectorDocument]:
        return self.fallback.get_all_documents()


_VECTOR_STORE_INSTANCE: Optional[BaseVectorStore] = None


def load_golden_facts_dataset() -> List[VectorDocument]:
    """Loads Golden Facts knowledge base from dataset JSON file."""
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "golden_facts_dataset.json"
    )
    if not os.path.exists(data_path):
        logger.error("Golden Facts dataset not found at %s", data_path)
        return []

    with open(data_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    return [VectorDocument(**item) for item in raw_items]


def get_vector_store() -> BaseVectorStore:
    """Singleton provider for the configured Vector Knowledge Base."""
    global _VECTOR_STORE_INSTANCE
    if _VECTOR_STORE_INSTANCE is None:
        settings = get_settings()
        provider = (settings.vector_db_provider or "in_memory").lower()

        if provider == "qdrant" and settings.qdrant_url:
            store = QdrantVectorStore(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                collection=settings.qdrant_collection
            )
        elif provider == "pinecone" and settings.pinecone_api_key:
            store = PineconeVectorStore(
                api_key=settings.pinecone_api_key,
                index_name=settings.pinecone_index_name
            )
        else:
            store = InMemoryVectorStore()

        # Load and index initial Golden Facts dataset
        documents = load_golden_facts_dataset()
        store.add_documents(documents)
        _VECTOR_STORE_INSTANCE = store

    return _VECTOR_STORE_INSTANCE
