import os
import hashlib
import argparse
import requests
import json

def hash_file(file_path):
    """Generate SHA-256 hash of a file."""
    hash_obj = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    except Exception as e:
        print(f"Error hashing file: {file_path}", e)
        return None

def get_all_files(dir_path):
    """Recursively retrieve all files in a directory, excluding certain folders."""
    excluded_dirs = {"node_modules", ".git", "venv", ".env", "package-lock.json"}
    all_files = []

    for root, dirs, files in os.walk(dir_path):
        if(any(excluded in root for excluded in excluded_dirs)):
            continue
        for file in files:
            all_files.append(os.path.join(root, file))

    return all_files

def hash_all(directory):
    """Hash all files in the given directory and store results in a variable."""
    file_hashes = {}
    
    try:
        all_files = get_all_files(directory)

        for file_path in all_files:
            relative_path = os.path.relpath(file_path, directory)
            file_hash = hash_file(file_path)
            if file_hash:
                file_hashes[relative_path] = file_hash
        
        return file_hashes  # Save result in a variable instead of writing to a file

    except Exception as e:
        print("Error processing files:", e)
        return {}

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description='Check Hash')
    parser.add_argument('code1', type=str, help='First code snippet')
    args = parser.parse_args()
    dirpath = args.code1
    hash_results = hash_all(dirpath)
    # print(hash_results)

    build_hash = json.loads(requests.get("http://localhost:3333/get-hash").text)['hash']
    buildfiles = build_hash.split('\n')
    build_hash_results = dict()
    for bf in buildfiles:
        splits = bf.split('\t')
        if(len(splits)!=2):
            continue
        k, v = splits
        build_hash_results[k] = v

    # print(build_hash_results)

    changed = True
    for bhr in build_hash_results:
        changed = changed and (hash_results[bhr] == build_hash_results[bhr])

    changed = not changed
    print("BUILD ARTEFACTS CHANGED", changed)

if(__name__ == '__main__'):
    main()