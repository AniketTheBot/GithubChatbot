Talk to Your Codebase 🤖💬
A cinematic, full-stack RAG (Retrieval-Augmented Generation) application that allows you to chat with any GitHub repository. It features a "Firefly" landing page, a glassmorphic chat interface, and deep context awareness with source citations.
![alt text](https://img.shields.io/badge/Built%20With-FastAPI%20%2B%20React-000000?style=for-the-badge)
✨ Features
Cinematic Landing Page: Interactive "Firefly" mouse tracking and typewriter effects.
Smart Ingestion: Clones, parses, and chunks code files (Python, JS, TS, Rust, Go, etc.).
RAG Pipeline: Uses OpenAI Embeddings and Supabase (pgvector) to find relevant code.
Context-Aware Chat: Remembers previous messages ("Rewrite it in Rust").
Citations: Shows exactly which files were used to generate the answer.
Syntax Highlighting: Dracula-themed code blocks for better readability.
Session Management: "New Repo" button clears the database and state instantly.
🛠 Tech Stack
Frontend: React (Vite), Tailwind CSS, Framer Motion, Lucide React.
Backend: Python (FastAPI), LangChain, GitPython.
Database: Supabase (PostgreSQL + pgvector).
AI: OpenAI (GPT-4o-mini / Text-Embedding-3-Small).
🚀 Getting Started
Prerequisites
Node.js & npm installed.
Python 3.10+ installed.
Supabase Account (Free tier).
OpenAI API Key.
1. Database Setup (Supabase)
Before running the code, you must set up the vector database.
Go to your Supabase Dashboard.
Navigate to the SQL Editor.
Paste and Run the following SQL script to enable vectors and create the function:
code
SQL
-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create a table to store your documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- 3. Create the search function
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
Navigate to the backend folder:
code
Bash
cd backend
Create a Virtual Environment:
code
Bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
Install Dependencies:
code
Bash
pip install -r requirements.txt
Configure Environment Variables:
Create a .env file in the backend/ folder:
code
Env
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=ey... (Your 'anon' public key)
Run the Server (Port 8003):
code
Bash
uvicorn app.main:app --reload --port 8003
The backend is now running at http://127.0.0.1:8003.
3. Frontend Setup
Open a new terminal and navigate to the frontend folder:
code
Bash
cd frontend
Install Dependencies:
code
Bash
npm install
Configure API Port:
Ensure src/App.tsx points to port 8003. Open the file and check this line:
code
TypeScript
const API_URL = "http://127.0.0.1:8003";
Run the Frontend:
code
Bash
npm run dev
The frontend is now running at http://localhost:5173.
🎮 How to Use
Open http://localhost:5173 in your browser.
Ingest: Paste a GitHub repository URL (e.g., https://github.com/jwasham/practice-python) into the input bar and hit Enter.
Wait: The system will clone the repo, chunk the code, and store vectors. The screen will slide down when ready.
Chat: Ask questions like:
"How does the authentication logic work?"
"Show me the code for the binary search."
"Rewrite the login function in TypeScript."
Reset: Click the "New" button in the top right to wipe the database and start with a fresh repo.
📂 Project Structure
code
Code
root/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── github.py       # Clones repos
│   │   │   ├── loader.py       # Reads files (Polyglot support)
│   │   │   ├── chunker.py      # Splits code intelligently
│   │   │   ├── vector_store.py # Talks to Supabase
│   │   │   └── llm.py          # Talks to OpenAI
│   │   └── main.py             # FastAPI Endpoints
│   ├── temp_repos/             # Git clone storage (GitIgnored)
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main Orchestrator
│   │   ├── LandingPage.tsx     # Firefly UI
│   │   ├── ChatBot.tsx         # Chat Interface
│   │   └── ...
│   ├── public/
│   │   └── bg.jpg              # Background Asset
│   ├── tailwind.config.js
│   └── package.json
⚠️ Troubleshooting
"Invalid URL" Error: Ensure you include https://github.com/ in your input.
"500 Internal Server Error": Check your .env file in the backend. Are the API keys correct?
CORS Errors: Ensure the Backend is running specifically on port 8003, as configured in the Frontend API_URL.
📜 License
This project is open-source. Feel free to modify and distribute.