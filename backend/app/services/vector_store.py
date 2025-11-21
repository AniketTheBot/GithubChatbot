import os
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize OpenAI Embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

def embed_and_store(chunks):
    """
    Embeds chunks and stores them in Supabase (using raw API).
    """
    vectors = []
    
    # 1. Generate embeddings for all chunks in batch
    # This is faster than doing it one by one
    texts = [chunk["content"] for chunk in chunks]
    embeds = embeddings.embed_documents(texts)
    
    # 2. Prepare data for insertion
    for i, chunk in enumerate(chunks):
        vectors.append({
            "content": chunk["content"],
            "metadata": chunk["metadata"],
            "embedding": embeds[i]
        })
        
    # 3. Insert into Supabase
    response = supabase.table("documents").insert(vectors).execute()
    
    return {"status": "success", "count": len(vectors)}

def search_documents(query: str, k=8):
    """
    Searches Supabase manually using the RPC function.
    """
    # 1. Convert user query to vector
    query_embedding = embeddings.embed_query(query)
    
    # 2. Call the Database Function directly
    # We bypass LangChain's wrapper to avoid version conflicts
    params = {
        "query_embedding": query_embedding,
        "match_threshold": 0.0, # Lower this if you get no results
        "match_count": k
    }
    
    response = supabase.rpc("match_documents", params).execute()
    
    # 3. Convert response back to the format our LLM expects
    # We return a list of objects that behave like LangChain Documents
    class SimpleDoc:
        def __init__(self, content, metadata):
            self.page_content = content
            self.metadata = metadata

    return [SimpleDoc(r['content'], r['metadata']) for r in response.data]


# ... existing code ...

def clear_database():
    """
    Deletes all rows in the documents table to start fresh.
    """
    # Delete all rows where id is not equal to a dummy UUID (effectively all rows)
    # This is a standard Supabase trick to clear a table via API
    response = supabase.table("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    return response