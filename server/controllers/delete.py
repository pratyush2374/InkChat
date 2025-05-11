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

QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_ENDPOINT = os.getenv("QDRANT_ENDPOINT")


def delete_collection(collection_name: str) -> dict:
    client = QdrantClient(url=QDRANT_ENDPOINT, api_key=QDRANT_API_KEY)
    client.delete_collection(collection_name)
    return {"message": "Collection deleted successfully"}
