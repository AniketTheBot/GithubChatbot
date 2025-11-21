Talk to Your Codebase 🤖💬

A cinematic, full-stack RAG (Retrieval-Augmented Generation) application that allows you to chat with any GitHub repository.
It features a Firefly landing page, glassmorphic chat interface, and deep context awareness with source citations.

✨ Features

🎆 Cinematic Landing Page — Firefly motion, parallax, typewriter.

📥 Smart Ingestion — Clones + parses + chunks code (Python, JS, TS, Rust, Go…)

🧠 RAG Pipeline — OpenAI Embeddings + Supabase pgvector.

💬 Context-Aware Chat — Maintains conversation memory.

📌 Citations — Shows which files were used.

🧩 Syntax Highlighting — Dracula-themed code blocks.

🔄 Session Management — “New Repo” clears DB + state instantly.

🛠 Tech Stack
Frontend

React (Vite)

Tailwind CSS

Framer Motion

Lucide Icons

Backend

FastAPI

LangChain

GitPython

Database

Supabase (PostgreSQL + pgvector)

AI

OpenAI GPT-4o-mini

Text-Embedding-3-Small

🚀 Getting Started
✅ Prerequisites

Node.js & npm

Python 3.10+

Supabase Account

OpenAI API Key

1. Database Setup (Supabase)

Go to Supabase Dashboard → SQL Editor
Paste and run:

-- Enable pgvector
create extension if not exists vector;

-- Documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- Search function
create function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

2. Backend Setup
cd backend

Create virtual environment
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

Install dependencies
pip install -r requirements.txt

Environment variables

Create backend/.env:

OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=ey...

Run FastAPI server
uvicorn app.main:app --reload --port 8003


Backend is live at:

http://127.0.0.1:8003

3. Frontend Setup
cd frontend
npm install

Ensure API URL is correct

In src/App.tsx:

const API_URL = "http://127.0.0.1:8003";

Run Vite dev server
npm run dev


Your frontend runs at:

http://localhost:5173

🎮 How to Use

Open the app.

Paste a GitHub URL (e.g., https://github.com/jwasham/practice-python)

Click Ingest

Wait while:

Cloning

Chunking

Embedding

Storing

Start chatting:

"How does the authentication work?"
"Show me the binary search function."
"Rewrite this in Rust."


Click New to reset.

📂 Project Structure
root/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── github.py        # Clone repos
│   │   │   ├── loader.py        # Read + detect file types
│   │   │   ├── chunker.py       # Split intelligently
│   │   │   ├── vector_store.py  # Supabase + pgvector
│   │   │   └── llm.py           # OpenAI calls
│   │   └── main.py              # FastAPI endpoints
│   ├── temp_repos/
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── LandingPage.tsx
│   │   ├── ChatBot.tsx
│   ├── public/
│   ├── tailwind.config.js
│   └── package.json

⚠️ Troubleshooting
❌ "Invalid URL"

Use https://github.com/...

❌ 500 Internal Server Error

Check backend .env

❌ CORS Errors

Backend must run on port 8003.

📜 License

Open-source. Modify & distribute freely.