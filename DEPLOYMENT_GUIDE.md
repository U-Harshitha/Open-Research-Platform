# 🚀 Open Research Nexus - Production Deployment Guide

## Overview
This guide will help you deploy Open Research Nexus to production with:
- **Frontend**: Firebase Hosting
- **Backend**: Railway/Render/Heroku
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Services**: Google Gemini API

## Prerequisites
- Firebase account with billing enabled
- GitHub account (for backend deployment)
- Google Cloud account with Gemini API access

## Step 1: Deploy Frontend to Firebase Hosting

### 1.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 1.2 Login to Firebase
```bash
firebase login
```

### 1.3 Deploy Frontend
```bash
# Run the deployment script
./deploy.bat  # Windows
# or
./deploy.sh   # Mac/Linux
```

Your frontend will be live at: **https://research-e9734.web.app**

## Step 2: Deploy Backend API

### Option A: Railway (Recommended)

1. **Push to GitHub**: Create a repository and push your `backend/` folder
2. **Connect Railway**: Go to [railway.app](https://railway.app) → Connect GitHub
3. **Deploy**: Select your repository and `backend` folder
4. **Environment Variables**: Add these in Railway dashboard:
   ```
   GEMINI_API_KEY=AIzaSyBBSB--cl-sEV4VRSTMMRxcApAtOxBuN0s
   FIREBASE_PROJECT_ID=research-e9734
   FLASK_ENV=production
   ALLOWED_ORIGINS=https://research-e9734.web.app
   ```
5. **Copy URL**: Railway will give you a URL like `https://your-app.railway.app`

### Option B: Render

1. **Connect GitHub**: Go to [render.com](https://render.com) → Connect repository
2. **Create Web Service**: Select your `backend` folder
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `python ai_service_api.py`
5. **Environment Variables**: Same as Railway above

### Option C: Heroku

1. **Install Heroku CLI**: Download from heroku.com
2. **Login**: `heroku login`
3. **Create App**: `heroku create your-app-name`
4. **Deploy**: 
   ```bash
   cd backend
   git init
   heroku git:remote -a your-app-name
   git add .
   git commit -m "Deploy backend"
   git push heroku master
   ```
5. **Set Environment Variables**:
   ```bash
   heroku config:set GEMINI_API_KEY=AIzaSyBBSB--cl-sEV4VRSTMMRxcApAtOxBuN0s
   heroku config:set FIREBASE_PROJECT_ID=research-e9734
   heroku config:set FLASK_ENV=production
   heroku config:set ALLOWED_ORIGINS=https://research-e9734.web.app
   ```

## Step 3: Configure Firebase Service Account

### 3.1 Generate Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/research-e9734)
2. Settings (⚙️) → Project Settings → Service Accounts
3. Click "Generate new private key"
4. Download the JSON file

### 3.2 Add to Backend Deployment
- **Railway/Render**: Copy the JSON content and add as environment variable `FIREBASE_SERVICE_ACCOUNT`
- **Heroku**: Use `heroku config:set FIREBASE_SERVICE_ACCOUNT='$(cat firebase-service-account.json)'`

## Step 4: Update Frontend API Configuration

1. **Edit API URL**: Update `frontend/src/OpenResearchNexus.jsx`
   ```javascript
   const API_CONFIG = {
     BASE_URL: process.env.NODE_ENV === 'production' 
       ? 'https://your-backend-url.railway.app' // Your actual backend URL
       : 'http://localhost:5000',
     // ... rest of config
   };
   ```

2. **Redeploy Frontend**:
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

## Step 5: Configure Firebase Authentication

### 5.1 Enable Authentication Methods
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Anonymous** authentication
3. Add your domain to authorized domains:
   - `research-e9734.web.app`
   - Your custom domain (if any)

### 5.2 Update CORS Settings
Make sure your backend allows requests from your frontend domain.

## Step 6: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Step 7: Verify Deployment

### ✅ Frontend Checklist
- [ ] Frontend loads at https://research-e9734.web.app
- [ ] Authentication works (anonymous sign-in)
- [ ] Can create documents
- [ ] Document editor loads

### ✅ Backend Checklist
- [ ] Backend responds at your deployed URL
- [ ] AI features work (search, completion, analysis)
- [ ] Firestore operations work
- [ ] CORS properly configured

### ✅ Integration Checklist
- [ ] Frontend can communicate with backend
- [ ] Real-time collaboration works
- [ ] Document saving works
- [ ] Asset management works

## Environment Variables Summary

### Backend (Railway/Render/Heroku)
```bash
GEMINI_API_KEY=AIzaSyBBSB--cl-sEV4VRSTMMRxcApAtOxBuN0s
FIREBASE_PROJECT_ID=research-e9734
FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>
FLASK_ENV=production
ALLOWED_ORIGINS=https://research-e9734.web.app
SECRET_KEY=<generate-random-secret>
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Enable Firebase App Check** for additional security
4. **Set up monitoring** with Firebase Analytics
5. **Regular security audits** of Firebase rules

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check `ALLOWED_ORIGINS` in backend
2. **Authentication Fails**: Verify Firebase config
3. **API Calls Fail**: Check backend URL in frontend
4. **Firestore Errors**: Verify security rules

### Logs and Monitoring
- **Frontend**: Browser Developer Tools
- **Backend**: Platform logs (Railway/Render/Heroku dashboard)
- **Firebase**: Firebase Console → Usage and billing

## Support

For issues:
1. Check browser console for frontend errors
2. Check backend logs in your deployment platform
3. Verify Firebase Console for database/auth issues

Your Open Research Nexus is now production-ready! 🎉