#!/bin/bash

# Get the absolute path of the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

# Purge the public directory
rm -rf "$SCRIPT_DIR/../public/starter-templates"

# Create the public directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/../public/starter-templates"


# Loop through all the subdirectories
for dir in ./*/; do
  # Remove the trailing slash from the directory name
  dir=${dir%/}

  # Zip the directory
  zip -rq "$SCRIPT_DIR/../public/starter-templates/${dir##*/}.zip" "$dir"
done