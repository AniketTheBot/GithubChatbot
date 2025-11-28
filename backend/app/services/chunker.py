from langchain_text_splitters import RecursiveCharacterTextSplitter, Language

def chunk_files(documents):
    chunks = []

    for doc in documents:
        file_path = doc["file_path"]
        content = doc["content"]
        
        language = None
        
        # 1. Detect Language
        if file_path.endswith('.py'):
            language = Language.PYTHON
        elif file_path.endswith(('.js', '.jsx')):
            language = Language.JS
        elif file_path.endswith(('.ts', '.tsx')):
            language = Language.TS
        elif file_path.endswith('.rs'):
            language = Language.RUST
        elif file_path.endswith('.go'):
            language = Language.GO
        elif file_path.endswith('.java'):
            language = Language.JAVA
        elif file_path.endswith(('.cpp', '.h')):
            language = Language.CPP
        elif file_path.endswith(('.html', '.htm')):
            language = Language.HTML
        # Note: Shell (.sh), Batch (.bat), and Dockerfile use the default (None) splitter below
        
        # 2. Configure Splitter
        if language:
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=language, 
                chunk_size=1000, 
                chunk_overlap=200
            )
        else:
            # Generic splitter for Dockerfile, Shell, Batch, Markdown, etc.
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, 
                chunk_overlap=200
            )
        
        file_chunks = splitter.split_text(content)
        
        for i, chunk_text in enumerate(file_chunks):
            chunks.append({
                "content": chunk_text,
                "metadata": {
                    "file_path": file_path,
                    "chunk_index": i
                }
            })
            
    return chunks