#!/bin/bash

# GitHub Pages deployment script for TimeoffTracker React App

echo "🚀 Starting deployment to GitHub Pages..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository. Please initialize git first."
    exit 1
fi

# Check if gh-pages is installed
if ! command -v gh-pages &> /dev/null; then
    echo "📦 Installing gh-pages..."
    yarn add -D gh-pages
fi

# Build the project
echo "🔨 Building the project..."
yarn build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to GitHub Pages
echo "📤 Deploying to GitHub Pages..."
yarn deploy

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to GitHub Pages!"
    echo "🌐 Your app should be available at: https://xavier.github.io/TimeoffTracker-react"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
