import os

def load_files_from_repo(repo_path: str):
    """
    Walks through the repo directory and reads all code files.
    Returns a list of dicts: [{"file_path": "...", "content": "..."}]
    """
    documents = []
    
    ALLOWED_EXTENSIONS = {'.py', '.js', '.jsx', '.ts', '.tsx', '.md', '.html', '.css'}

    for root, _, files in os.walk(repo_path):
        # Skip .git folder
        if ".git" in root:
            continue

        for file in files:
            file_path = os.path.join(root, file)
            _, ext = os.path.splitext(file)

            # Only read allowed file types
            if ext in ALLOWED_EXTENSIONS:
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        
                        # Create a relative path for cleaner citations later
                        # e.g., /users/me/temp_repos/react/src/index.js -> src/index.js
                        relative_path = os.path.relpath(file_path, repo_path)

                        documents.append({
                            "file_path": relative_path,
                            "content": content
                        })
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    print(f"Loaded {len(documents)} files from {repo_path}")
    return documents