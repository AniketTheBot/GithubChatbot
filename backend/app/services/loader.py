import os

def load_files_from_repo(repo_path: str):
    documents = []
    
    # 1. Update Allowed Extensions
    ALLOWED_EXTENSIONS = {
        # Code
        '.py', '.js', '.jsx', '.ts', '.tsx', 
        '.rs', '.go', '.java', '.cpp', '.c', '.h', 
        # Web
        '.html', '.htm', '.css', 
        # Scripts / Config
        '.sh', '.bash', '.bat', '.cmd', '.yaml', '.yml', '.json', '.md'
    }
    
    # Files specific names to include (extensions often empty)
    ALLOWED_FILENAMES = {'Dockerfile', 'dockerfile', 'Makefile', 'makefile'}

    for root, _, files in os.walk(repo_path):
        if ".git" in root:
            continue

        for file in files:
            file_path = os.path.join(root, file)
            _, ext = os.path.splitext(file)

            # Check if valid extension OR valid filename (like Dockerfile)
            if ext in ALLOWED_EXTENSIONS or file in ALLOWED_FILENAMES:
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        relative_path = os.path.relpath(file_path, repo_path)

                        documents.append({
                            "file_path": relative_path,
                            "content": content
                        })
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    
    print(f"Loaded {len(documents)} files from {repo_path}")
    return documents