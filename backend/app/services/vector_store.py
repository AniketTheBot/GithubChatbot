import os
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

def embed_and_store(chunks):
    """
    Embeds chunks and stores them in Supabase in BATCHES to avoid SSL timeouts.
    """
    BATCH_SIZE = 100  # Process 100 chunks at a time
    total_chunks = len(chunks)
    
    print(f"Starting ingestion for {total_chunks} chunks...")

    for i in range(0, total_chunks, BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        print(f"Processing batch {i} to {i + len(batch)}...")

        # 1. Generate embeddings for this batch ONLY
        texts = [chunk["content"] for chunk in batch]
        try:
            embeds = embeddings.embed_documents(texts)
        except Exception as e:
            print(f"Error embedding batch {i}: {e}")
            continue

        # 2. Prepare data for Supabase
        vectors = []
        for j, chunk in enumerate(batch):
            vectors.append({
                "content": chunk["content"],
                "metadata": chunk["metadata"],
                "embedding": embeds[j]
            })
        
        # 3. Insert batch into Supabase
        try:
            supabase.table("documents").insert(vectors).execute()
        except Exception as e:
            print(f"Error inserting batch {i} into Supabase: {e}")
            continue
            
    print("Ingestion complete.")
    return {"status": "success", "count": total_chunks}

def clear_database():
    """
    Deletes all rows in the documents table.
    """
    response = supabase.table("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    return response

def search_documents(query: str, k=8):
    """
    Searches Supabase manually using the RPC function.
    """
    query_embedding = embeddings.embed_query(query)
    
    params = {
        "query_embedding": query_embedding,
        "match_threshold": 0.0,
        "match_count": k
    }
    
    response = supabase.rpc("match_documents", params).execute()
    
    class SimpleDoc:
        def __init__(self, content, metadata):
            self.page_content = content
            self.metadata = metadata

    return [SimpleDoc(r['content'], r['metadata']) for r in response.data]