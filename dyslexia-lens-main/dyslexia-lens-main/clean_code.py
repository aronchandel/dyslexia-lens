import os
import re

def clean_comments_and_newlines(file_path):
    """clean comments to lowercase and remove excessive newlines"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # for javascript/jsx files
        if file_path.endswith(('.js', '.jsx')):
            # lowercase single-line comments
            content = re.sub(r'//\s*([A-Z][^\n]*)', lambda m: '// ' + m.group(1).lower(), content)
            # lowercase multi-line comments
            content = re.sub(r'/\*\s*([A-Z][^*]*)\*/', lambda m: '/* ' + m.group(1).lower() + ' */', content)
        
        # for python files
        elif file_path.endswith('.py'):
            # lowercase single-line comments
            content = re.sub(r'#\s*([A-Z][^\n]*)', lambda m: '# ' + m.group(1).lower(), content)
        
        # remove excessive newlines (more than 2 consecutive)
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # only write if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"cleaned: {file_path}")
        
    except Exception as e:
        print(f"error processing {file_path}: {e}")

def process_directory(directory, exclude_dirs):
    """process all js, jsx, py files in directory"""
    for root, dirs, files in os.walk(directory):
        # skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith(('.js', '.jsx', '.py')):
                file_path = os.path.join(root, file)
                clean_comments_and_newlines(file_path)

# directories to exclude
exclude = ['node_modules', 'venv', '__pycache__', 'dist', 'build', '.git']

# process each main directory
for directory in ['client/src', 'server/src', 'ai-engine/app']:
    if os.path.exists(directory):
        print(f"\nprocessing {directory}...")
        process_directory(directory, exclude)

print("\ndone!")
