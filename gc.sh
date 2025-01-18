#!/bin/bash


# Usage
# chmod +x gc.sh
# ./gc.sh

# Get list of modified files
modified_files=$(git status --porcelain | grep -E '^(\?\?|.M)' | sed 's/^...//')

# Check if there are any modified files
if [ -z "$modified_files" ]; then
    echo "No modified files found"
    exit 0
fi

# Loop through each modified file
while IFS= read -r file; do
    echo "Committing: $file"
    git add "$file"
    git commit -m "added major updates"
done <<< "$modified_files"

# Single push after all commits
git push

echo "All files have been committed individually and pushed"
