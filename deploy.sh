#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
SITE_URL="https://stephenjayakar.com"
cd "$ROOT_DIR"

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
hugo --cleanDestinationDir --minify

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

# Collect added, updated, and deleted page URLs before the deploy commit.
INDEXNOW_URLS=()
while IFS= read -r page; do
  case "$page" in
    404.html)
      continue
      ;;
    index.html)
      INDEXNOW_URLS+=("$SITE_URL/")
      ;;
    */index.html)
      INDEXNOW_URLS+=("$SITE_URL/${page%index.html}")
      ;;
    *.html)
      INDEXNOW_URLS+=("$SITE_URL/$page")
      ;;
  esac
done < <(git diff --cached --name-only --diff-filter=ACDMRTUXB -- '*.html')

if git diff --cached --quiet; then
  echo "No generated site changes to deploy."
  cd "$ROOT_DIR"
  exit 0
fi

git commit -m "Deploy site"

# Push to the gh-pages branch
git push -f origin main:gh-pages

# Return to the project root directory
cd "$ROOT_DIR"

if [ "${#INDEXNOW_URLS[@]}" -gt 0 ]; then
  if ! "$ROOT_DIR/scripts/submit-indexnow.sh" "${INDEXNOW_URLS[@]}"; then
    echo "Warning: the site deployed, but the IndexNow notification failed." >&2
  fi
fi

echo "Site deployed successfully!"
