import shutil
import os
import stat
from git import Repo

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLONE_DIR = os.path.join(BASE_DIR, "temp_repos")

def remove_readonly(func, path, excinfo):
    """
    Error handler for shutil.rmtree.
    If the file is read-only (like git files), change it to writable and try again.
    """
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clone_repository(repo_url: str):
    repo_name = repo_url.split("/")[-1].replace(".git", "")
    repo_path = os.path.join(CLONE_DIR, repo_name)

    # If it already exists, delete it
    if os.path.exists(repo_path):
        shutil.rmtree(repo_path, onerror=remove_readonly)

    os.makedirs(repo_path, exist_ok=True)

    try:
        print(f"Cloning {repo_url} into {repo_path}...")
        Repo.clone_from(repo_url, repo_path)
        return {"status": "success", "path": repo_path}
    except Exception as e:
        return {"status": "error", "message": str(e)}