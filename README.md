# Open Research Nexus

🚀 **AI-Powered Research Collaboration Platform**

A comprehensive, real-time research collaboration platform built with React, Python Flask, and Firebase, featuring AI-powered research assistance through Google Gemini.

## ✨ Features

### 🤖 AI-Powered Research Tools
- **Smart Search**: Find academic papers and research with AI assistance
- **Writing Completion**: AI-powered writing assistance and content generation
- **Document Analysis**: Intelligent analysis of research documents
- **Plagiarism Detection**: Advanced plagiarism checking capabilities

### 👥 Real-Time Collaboration
- **Live Document Editing**: Collaborative editing with presence indicators
- **Real-time Sync**: Instant synchronization across all collaborators
- **Comment System**: Threaded comments and discussions
- **User Presence**: See who's online and actively editing

### 📁 Document Management
- **File Upload**: Drag-and-drop file upload with Firebase Storage
- **Version Control**: Document versioning and change tracking
- **Asset Management**: Link research papers, datasets, and resources
- **Cross-Platform**: Works seamlessly across devices

### 🔐 Authentication & Security
- **Multi-Provider Auth**: Google OAuth, Email/Password, Anonymous access
- **Secure Storage**: Firebase security rules and data protection
- **Demo Mode**: Fallback demo functionality for development

### 📊 Analytics & Insights
- **Document Metrics**: Word count, collaboration stats, activity tracking
- **Research Impact**: Citation analysis and relevance scoring
- **AI Insights**: Quality scores, readability analysis
- **Usage Analytics**: Comprehensive usage tracking and reporting

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive UI design
- **ReactQuill** for rich text editing
- **Lucide React** for beautiful icons
- **React Hot Toast** for notifications

### Backend
- **Python Flask** RESTful API server
- **Google Gemini AI** for research assistance
- **Firebase Admin SDK** for server-side operations
- **CORS** enabled for cross-origin requests

### Database & Storage
- **Firebase Firestore** for real-time database
- **Firebase Storage** for file management
- **Firebase Authentication** for user management
- **Real-time listeners** for live collaboration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Firebase project with Firestore and Storage enabled
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/P-Sreeshanth/research.git
   cd research
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

## 🏗 Project Structure

```
research/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # Firebase and API services
│   │   └── OpenResearchNexus.jsx # Main application
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Python Flask API
│   ├── ai_service_api.py    # Main API server
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── README.md               # This file
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Firebase Storage
4. Enable Authentication (Google, Email/Password, Anonymous)
5. Download service account key
6. Configure security rules in `firestore.rules`

### Google Gemini AI
1. Get API key from Google AI Studio
2. Add to backend `.env` file
3. Configure model parameters in `ai_service_api.py`

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Backend Deployment
The backend can be deployed to:
- **Railway**: Connect your GitHub repo and deploy
- **Heroku**: Use the provided `Procfile`
- **Google Cloud Run**: Containerized deployment
- **AWS Lambda**: Serverless deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful AI research assistance
- **Firebase** for real-time backend services
- **React** and **Vite** for the excellent development experience
- **Tailwind CSS** for beautiful, responsive design

## 📞 Support

For support and questions:
- 📧 Email: peddisreeshanth18@gmail.com
- 🐙 GitHub Issues: [Create an issue](https://github.com/P-Sreeshanth/research/issues)

---

**Built with ❤️ for researchers and academics worldwide** 🌍

*Empowering collaborative research through AI and real-time technology*