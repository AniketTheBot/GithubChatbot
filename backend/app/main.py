from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from app.services.github import clone_repository
from app.services.loader import load_files_from_repo
from app.services.chunker import chunk_files
from app.services.vector_store import embed_and_store, clear_database
from app.services.llm import generate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoRequest(BaseModel):
    url: str


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[dict]] = []


@app.get("/")
def read_root():
    return {"message": "Talk to codebase API is running"}


@app.post("/ingest")
def ingest_repo(request: RepoRequest):
    try:

        if not request.url.startswith("https://github.com/"):
            raise HTTPException(status_code=400, detail="Invalid URL. Please provide a full GitHub URL (e.g., https://github.com/user/repo).")

        # 1. Clone
        clone_result = clone_repository(request.url)

        if clone_result["status"] == "error":
            raise HTTPException(
                status_code=400, detail=clone_result["message"])

        # 2. Load Files
        path = clone_result["path"]
        documents = load_files_from_repo(path)

        # 3. Chunk Code
        chunks = chunk_files(documents)

        # 4. Embed & Store
        # This might take a few seconds as it talks to OpenAI
        store_result = embed_and_store(chunks)

        return {
            "status": "completed",
            "repo": request.url,
            "files_processed": len(documents),
            "chunks_stored": store_result["count"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat_with_codebase(request: ChatRequest):
    try:
        result = generate_answer(request.question, request.history)

        return {
            "status": "success",
            "answer": result["answer"],
            "sources": result["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/delete")
def delete_index():
    try:
        clear_database()
        return {"status": "success", "message": "Database cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
