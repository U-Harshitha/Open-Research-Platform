# Open Research Nexus

🚀 **AI-Powered Research Collaboration Platform**

A comprehensive, real-time research collaboration platform built with React, Python Flask, and Firebase, featuring AI-powered research assistance through Google Gemini.

## ✨ Features

### AI-Powered Research Tools
- **Smart Search**: Find academic papers and research with AI assistance
- **Writing Completion**: AI-powered writing assistance and content generation
- **Document Analysis**: Intelligent analysis of research documents
- **Plagiarism Detection**: Advanced plagiarism checking capabilities

### Real-Time Collaboration
- **Live Document Editing**: Collaborative editing with presence indicators
- **Real-time Sync**: Instant synchronization across all collaborators
- **Comment System**: Threaded comments and discussions
- **User Presence**: See who's online and actively editing

### Document Management
- **File Upload**: Drag-and-drop file upload with Firebase Storage
- **Version Control**: Document versioning and change tracking
- **Asset Management**: Link research papers, datasets, and resources
- **Cross-Platform**: Works seamlessly across devices


## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Firebase project with Firestore and Storage enabled
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/U-Harshitha/Open-Research-Platform.git
   cd Open-Research-Platform
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   
   Create `.env` in the backend directory:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   FIREBASE_PROJECT_ID=your-project-id
   GEMINI_API_KEY=your-gemini-api-key
   FLASK_ENV=development
   ```

5. **Add Firebase Service Account**
   - Download your Firebase service account JSON
   - Place it in `backend/firebase-service-account.json`

6. **Update Firebase Config**
   - Update `frontend/src/services/firebase.js` with your Firebase config

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python ai_service_api.py
   ```
   Server runs on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## 📖 Usage

### Getting Started
1. Open `http://localhost:3000` in your browser
2. Sign in using Google, email/password, or continue as guest
3. Create your first research document
4. Invite collaborators and start researching together!

### Key Features
- **Document Creation**: Click the "+" button to create new documents
- **AI Assistant**: Use the AI Assistant for research help and writing assistance
- **File Upload**: Upload research documents, images, and media files
- **Collaboration**: Share documents and work together in real-time
- **Analytics**: View document insights and research metrics


### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```
