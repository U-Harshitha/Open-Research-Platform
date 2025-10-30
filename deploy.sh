#!/bin/bash

# Open Research Nexus Deployment Script

echo "🚀 Deploying Open Research Nexus to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing now..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --reauth

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🏗️  Building frontend application..."
npm run build

# Go back to root directory
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Go back to root directory
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting,firestore

# Deploy backend as Firebase Function (if configured)
# firebase deploy --only functions

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is now live at: https://research-e9734.web.app"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your backend API on a cloud service (Heroku, Railway, etc.)"
echo "2. Update API_BASE_URL in frontend/src/config/firebase.js"
echo "3. Configure Firebase service account for backend authentication"
echo ""
echo "📚 For more deployment options, check the README.md file"