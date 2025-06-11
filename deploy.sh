#!/bin/bash

# Build the site with Vite
npm run build

# Create docs directory if it doesn't exist
mkdir -p docs

# Copy all files from new-portfolio to docs
cp -R new-portfolio/* docs/

# Copy the built files from dist to docs
cp -R dist/* docs/

# Create a .nojekyll file to prevent GitHub Pages from using Jekyll
touch docs/.nojekyll

# Copy the root index.html that redirects to new-portfolio
cp index.html docs/

echo "Deployment files prepared in docs/ folder"
echo "Now commit and push to GitHub"
