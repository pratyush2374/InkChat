from pathlib import Path
import time
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_ENDPOINT = os.getenv("QDRANT_ENDPOINT")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def create_embeddings(path: str, filename: str) -> bool:
    try:
        loader = PyPDFLoader(file_path=path)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splitted_docs = splitter.split_documents(documents=docs)

        embedder = GoogleGenerativeAIEmbeddings(
            google_api_key=GEMINI_API_KEY, model="models/text-embedding-004"
        )

        start = time.time()
        vector_store = QdrantVectorStore.from_documents(
            documents=splitted_docs,
            url=QDRANT_ENDPOINT,
            api_key=QDRANT_API_KEY,
            collection_name=filename,
            embedding=embedder,
        )
        # vector_store.add_documents(documents=splitted_docs)
        print(f"Qdrant vector store created in {time.time() - start:.2f} seconds")
        return True

    except Exception as e:
        print(e)
        return False
