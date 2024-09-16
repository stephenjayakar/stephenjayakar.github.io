#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if CNAME file exists, if not, prompt to create it
if [ ! -f "CNAME" ]; then
  echo "CNAME file does not exist. Please create it before deploying."
  exit 1
fi

# Get the current branch name
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# Check if the current branch is 'main'
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "You are not on the 'main' branch. Aborting deployment."
  exit 1
fi

# Install Hugo if not already installed
if ! command -v hugo &> /dev/null; then
    echo "Hugo could not be found"
    exit 1
fi

# Build the site with minification
hugo --minify

# Copy CNAME file to the public directory
cp CNAME public/

# Navigate to the public directory
cd public

# Initialize Git if needed and commit changes
if [ ! -d ".git" ]; then
  git init
  git remote add origin git@github.com:stephenjayakar/stephenjayakar.github.io.git
fi

# Add and commit the new changes
git add .
git commit -m "Deploy site"

# Push to the gh-pages branch
git push -f origin main:gh-pages

# Return to the project root directory
cd ..

echo "Site deployed successfully!"
