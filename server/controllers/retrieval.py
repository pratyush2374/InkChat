import os
import json
from openai import OpenAI
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

# Load environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_ENDPOINT = os.getenv("QDRANT_ENDPOINT")
BASE_URL = os.getenv("BASE_URL")

client = OpenAI(api_key=GEMINI_API_KEY, base_url=BASE_URL)


# Schema for structured response
class IndividualResponse(BaseModel):
    answer: str
    relevant_pages: List[int]


# Generate hypothetical answer
def generate_hypothetical_answer(prompt: str) -> str:
    system_prompt = (
        system_prompt
    ) = """
        You are a helpful AI assistant built to write hypothetical answers to the user's question. "
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt},
    ]

    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=messages,
        max_tokens=500,
        n=1,
    )

    return response.choices[0].message.content


# Fetch the final structured answer
def fetch_answer(question: str, file_name: str) -> dict:
    hypo = generate_hypothetical_answer(question)

    # Initialize clients
    embedder = GoogleGenerativeAIEmbeddings(
        google_api_key=GEMINI_API_KEY,
        model="models/text-embedding-004",
    )

    retriever = QdrantVectorStore.from_existing_collection(
        url=QDRANT_ENDPOINT,
        api_key=QDRANT_API_KEY,
        collection_name=file_name,
        embedding=embedder,
    )

    results_with_score = retriever.similarity_search_with_score(query=hypo, k=7)

    # Filtering
    relevant_results = [doc for doc, score in results_with_score if score > 0.6]

    if not relevant_results:
        return {
            "answer": "Invalid prompt, it seems your input is not related to the PDF.",
            "relevant_pages": [],
        }

    text = "\n\n".join(
        f"Page {doc.metadata.get('page_label')}:\n{doc.page_content}"
        for doc in relevant_results
    )
    print(text)
    system_prompt = """
        "You are a helpful AI assistant. "
        "You will parse the provided text documents and generate a well-structured explanation based on the user's prompt, human-readable answer. "
        "Rules:"
        1. If no relevant info is found, return return {
            "answer": "Invalid prompt, it seems your input is not related to the PDF.",
            "relevant_pages": [],
        }
        2. Always return a list of relevant pages in the format of [PAGE, PAGE, PAGE] if any relevant pages are found.
        3. The final answer should be a well-structured, human-readable answer."
        4. Use the style and tone of beginner-friendly explanations, similar to what's found in the documentation.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text},
    ]

    response = client.beta.chat.completions.parse(
        model="gemini-2.0-flash",
        messages=messages,
        n=1,
        max_tokens=5000,
        response_format=IndividualResponse,
    )

    return response.choices[0].message.parsed
