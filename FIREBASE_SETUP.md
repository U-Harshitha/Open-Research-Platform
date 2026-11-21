# Firebase Service Account Setup

## For Backend Authentication (Python API)

### Step 1: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `research-e9734`
3. Click on the gear icon (⚙️) → Project Settings
4. Navigate to the "Service accounts" tab
5. Click "Generate new private key"
6. Save the JSON file as `firebase-service-account.json` in the `backend/` directory

### Step 2: Update Environment Variables

Create a `.env` file in the `backend/` directory with:

```bash
# Firebase Configuration (from service account JSON)
FIREBASE_PROJECT_ID=research-e9734
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-from-json\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@research-e9734.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key

# Flask Configuration
FLASK_APP=ai_service_api.py
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://research-e9734.web.app
```

### Step 3: Alternative - Use Service Account JSON File

Instead of environment variables, you can place the `firebase-service-account.json` file directly in the `backend/` directory. The code will automatically detect and use it.

## For Frontend (Already Configured)

The frontend is already configured with your Firebase project settings:

- **Project ID**: research-e9734  
- **Auth Domain**: research-e9734.firebaseapp.com
- **API Key**: AIzaSyCs_WPHPxQCq8Qcu4Ogd8ly8VJW5USiH3s

## Security Notes

⚠️ **Important**: Never commit the service account JSON file or private keys to version control!

Add to your `.gitignore`:
```
backend/firebase-service-account.json
backend/.env
```