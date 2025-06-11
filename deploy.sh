#!/bin/bash

# Build the site with Vite
npm run build

# Create docs directory if it doesn't exist
mkdir -p docs

# Create docs/new-portfolio/js directory if it doesn't exist
mkdir -p docs/new-portfolio/js

# Copy all files from new-portfolio to docs
cp -R new-portfolio/* docs/

# Explicitly copy all JavaScript files to ensure they're in the right place
cp -R new-portfolio/js/* docs/new-portfolio/js/

# Copy the built files from dist to docs
cp -R dist/* docs/

# Create a .nojekyll file to prevent GitHub Pages from using Jekyll
touch docs/.nojekyll

# Copy the root index.html that redirects to new-portfolio
cp index.html docs/

# Fix the script references in the HTML file
sed -i '' 's|src="./assets/|src="./assets/|g' docs/new-portfolio/index.html

echo "Deployment files prepared in docs/ folder"
echo "Now commit and push to GitHub"
