import os
from pathlib import Path

# --- Configuration ---
ROOT_DIR = Path('.')
OUTPUT_FILE = "project_structure.txt"

# Folders to ignore completely
IGNORE_DIRS = {
    '.venv', 'venv', 'env', 
    '.git', '.vscode', '.idea', 
    '__pycache__', 'node_modules'
}

# Files to ignore
IGNORE_FILES = {
    '.DS_Store', 'Thumbs.db', 
    'generate_tree.py', OUTPUT_FILE
}

def format_size(size):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"

def generate_tree(dir_path, prefix="", file_output=None):
    # Get sorted list of files and dirs
    try:
        entries = sorted(list(dir_path.iterdir()), key=lambda x: (not x.is_dir(), x.name.lower()))
    except PermissionError:
        return

    # Filter out ignored items
    entries = [
        e for e in entries 
        if e.name not in IGNORE_DIRS and e.name not in IGNORE_FILES
    ]

    total_items = len(entries)
    for index, entry in enumerate(entries):
        is_last = (index == total_items - 1)
        connector = "└── " if is_last else "├── "
        
        if entry.is_dir():
            line = f"{prefix}{connector}📂 {entry.name}/"
            print(line)
            if file_output: file_output.write(line + "\n")
            
            new_prefix = prefix + ("    " if is_last else "│   ")
            generate_tree(entry, new_prefix, file_output)
        else:
            size = format_size(entry.stat().st_size)
            line = f"{prefix}{connector}📄 {entry.name} ({size})"
            print(line)
            if file_output: file_output.write(line + "\n")

if __name__ == "__main__":
    print(f"Generating tree for: {ROOT_DIR.resolve().name}\n")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"Project Tree for: {ROOT_DIR.resolve().name}\n")
        f.write("=" * 40 + "\n")
        generate_tree(ROOT_DIR, file_output=f)
    
    print(f"\n✅ Tree saved to {OUTPUT_FILE}")