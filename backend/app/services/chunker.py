from langchain_text_splitters import RecursiveCharacterTextSplitter, Language

def chunk_files(documents):
    """
    Takes a list of file dictionaries and splits them into chunks based on code structure.
    """
    chunks = []

    for doc in documents:
        file_path = doc["file_path"]
        content = doc["content"]
        
        # Determine language for splitting based on extension
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
        else:
            language = None 
        
        # Configure the splitter
        # chunk_size=1000: roughly 200-300 lines of code
        # chunk_overlap=200: keeps some context from the previous chunk so we don't lose meaning at the cut
        if language:
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=language, 
                chunk_size=1000, 
                chunk_overlap=200
            )
        else:
            # Fallback for READMEs, etc.
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, 
                chunk_overlap=200
            )
        
        # Split the content
        file_chunks = splitter.split_text(content)
        
        # Format chunks with metadata (Important for citations later!)
        for i, chunk_text in enumerate(file_chunks):
            chunks.append({
                "content": chunk_text,
                "metadata": {
                    "file_path": file_path,
                    "chunk_index": i
                }
            })
            
    return chunks