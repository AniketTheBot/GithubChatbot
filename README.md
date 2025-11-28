# Talk to Your Codebase 🤖💬

A cinematic, full‑stack Retrieval‑Augmented Generation (RAG) app that lets you chat with any GitHub repository. Features a firefly landing page, glassmorphic chat UI, deep code understanding, and traceable source citations.

## Highlights
- Cinematic Landing Page — Firefly mouse tracking + typewriter effect  
- Smart Ingestion — Clone → parse → chunk code (py, js, ts, rs, go, etc.)  
- RAG Pipeline — OpenAI embeddings + Supabase (pgvector)  
- Context‑Aware Chat — Maintains conversation memory and references code by file/snippet  
- Citations — Shows source files and code segments used to form answers  
- Dracula Syntax Highlighting — Pretty code blocks for outputs  
- Session Management — “New Repo” clears DB & state

## Tech Stack
- Frontend: React (Vite), TypeScript, Tailwind CSS, Framer Motion, Lucide React  
- Backend: FastAPI, GitPython, lightweight LangChain-style pipeline  
- DB: Supabase (Postgres + pgvector)  
- AI: OpenAI (chat + text-embedding-3-small)

---

## Quick Start

### Prerequisites
- Node.js & npm  
- Python 3.10+  
- git installed  
- Supabase project (anon/service role key)  
- OpenAI API key

### 1) Supabase (DB) Setup
Open Supabase SQL Editor and run:

```sql
-- Enable pgvector
create extension if not exists vector;

-- Documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  repo_url text,
  path text,
  filename text,
  content text,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Index for fast nearest neighbor
create index if not exists idx_documents_embedding on documents using ivfflat(embedding vector_l2_ops) with (lists = 100);

-- Search wrapper
create function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  repo_url text,
  path text,
  filename text,
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
    documents.repo_url,
    documents.path,
    documents.filename,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

Adjust vector dims if using a different embedding model.

### 2) Backend Setup
```powershell
cd backend

# Create and activate venv (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install deps
pip install -r requirements.txt
```

Create `backend/.env`:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=eyA...
SUPABASE_SCHEMA=public
BACKEND_PORT=8003
TEMP_REPOS_DIR=./temp_repos
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIM=1536
CHAT_MODEL=gpt-4o-mini
```

Run backend (dev):
```powershell
uvicorn app.main:app --port 8003
```
Backend base: http://127.0.0.1:8003

### 3) Frontend Setup
```bash
cd frontend
npm install
# ensure API URL in src/App.tsx:
# const API_URL = "http://127.0.0.1:8003";
npm run dev
```
Frontend: http://localhost:5173

---

## API (examples)
- POST /ingest
  Body: { "repo_url": "https://github.com/user/repo", "branch": "main", "max_file_size_kb": 200 }

- GET /status/:repo_id

- POST /query
  Body: { "repo_url": "https://github.com/user/repo", "query": "How does authentication work?" }

- POST /reset
  Body: { "repo_url": "https://github.com/user/repo" }

cURL examples:
```bash
curl -X POST "http://127.0.0.1:8003/ingest" \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/jwasham/practice-python","branch":"main"}'

curl -X POST "http://127.0.0.1:8003/query" \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/jwasham/practice-python","query":"How is authentication implemented?"}'
```

---

## How it works (high level)
1. User provides GitHub URL → backend clones repo to temp_repos/.  
2. Loader scans supported files (skip node_modules, .git, binaries).  
3. Chunker splits files into overlapping token chunks.  
4. Backend generates embeddings per chunk and stores vectors + metadata in Supabase.  
5. Query flow: embed query → match_documents → collect top chunks → call chat model with chunks as context → return answer + citations (file + snippet).

Key notes: keep metadata { repo_url, path, filename, commit_hash, language } for precise citations.

---

## Ingestion & Chunking Recommendations
- Skip files in .gitignore, node_modules, build, .venv.  
- Token-based chunks (300–500 tokens) with overlap (20–50 tokens).  
- Batch embeddings to reduce API calls.  
- Filter non-code and large files before embedding.

---

## Troubleshooting
- Invalid URL / 404: Use full GitHub URL (https://github.com/user/repo). Private repos require extra auth.  
- 500 errors: Check backend .env and server logs. Enable DEBUG to view tracebacks.  
- CORS errors: Ensure backend port matches frontend config and CORSMiddleware allows the origin.

---

## Production Tips
- Use Supabase service role key only on server side.  
- Run ingestion as background worker for large repos.  
- Add auth, rate limiting, pruning, or per‑repo namespaces.

---

## Feature ideas
- GitHub OAuth for private repos  
- Commit-aware ingestion / incremental updates  
- Per-line citations with direct file links  
- Multi-repo workspace mode  
- Export chats + citations

---

## License
MIT — modify and distribute freely.

## Contributing
Fork → branch feat/your-feature → add tests/docs → PR.

<!-- end of README -->