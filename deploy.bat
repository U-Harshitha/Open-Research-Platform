@echo off
REM Open Research Nexus Deployment Script for Windows

echo 🚀 Deploying Open Research Nexus...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI is not installed. Installing now...
    npm install -g firebase-tools
)

REM Login to Firebase (if not already logged in)
echo 🔐 Checking Firebase authentication...
firebase login

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

REM Build frontend
echo 🏗️  Building frontend application...
call npm run build

REM Go back to root directory
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt

REM Go back to root directory
cd ..

REM Deploy Firestore rules and indexes
echo � Deploying Firestore security rules...
firebase deploy --only firestore

REM Deploy frontend to Firebase Hosting
echo 🌐 Deploying frontend to Firebase Hosting...
firebase deploy --only hosting

echo ✅ Frontend deployed successfully!
echo 🌐 Your frontend is now live at: https://research-e9734.web.app
echo.
echo 🔧 Next steps for backend deployment:
echo 1. Deploy backend to Railway, Render, or Heroku:
echo    - Railway: https://railway.app/
echo    - Render: https://render.com/
echo    - Heroku: https://heroku.com/
echo.
echo 2. Update API_BASE_URL in frontend/src/OpenResearchNexus.jsx
echo    with your deployed backend URL
echo.
echo 3. Set up your Firebase service account key (see FIREBASE_SETUP.md)
echo.
echo 4. Redeploy frontend after updating backend URL:
echo    firebase deploy --only hosting
echo.
echo 📚 For detailed setup instructions, check FIREBASE_SETUP.md

pause