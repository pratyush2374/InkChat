# 🖋️ InkChat - Chat with your PDFs

**InkChat** is a web application that allows users to chat with PDF documents using an LLM-powered backend. It uses **Next.js** for the frontend and a **FastAPI** backend integrated with **Qdrant** (for vector storage) and **Gemini** (for LLM responses).

---

## 🧱 Tech Stack

- **Frontend**: Next.js
- **Backend**: FastAPI
- **Vector DB**: Qdrant
- **LLM**: Gemini

---

## 🌐 Frontend Setup (Next.js)

### 🔧 Environment Variable

Create a `.env` file in the root of the frontend project and add:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
````

### ▶️ Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Backend Setup (FastAPI + Qdrant + Gemini)

### 🔧 Environment Variables

Create a `.env` file in the root of the backend project and add:

```env
GEMINI_API_KEY=your_gemini_api_key
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_ENDPOINT=https://your-qdrant-endpoint.com
BASE_URL=gemini_base_url_for_openai_compatibility
```

> Replace placeholder values with actual keys and endpoints.

### ▶️ Running the Backend

Make sure Python and `pip` are installed.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---
## 🚀 Features

* Upload and chat with PDFs.
* Uses Gemini LLM to answer based on PDF content.
* Vectorized context retrieval using Qdrant.

---

## 📌 Notes

* Ensure CORS is configured properly in FastAPI to allow frontend communication.
* PDFs should be parsed and chunked appropriately before vector storage.
* This is a local setup — configure deployment and secrets properly for production.

---

## 💡 Future Improvements

* Add authentication.
* Support for multiple file uploads.
* Conversation history and summaries.

---

## 🧑‍💻 Author

Made by Pratyush Sharma: 
[Portfolio](https://pratyush2374.vercel.app) · [GitHub](https://github.com/pratyush2374) · [LinkedIn](https://www.linkedin.com/in/pratyush2374)


