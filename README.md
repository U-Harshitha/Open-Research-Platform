# Open Research Nexus

🚀 **AI-Powered Research Collaboration Platform**

A real-time research collaboration platform built with React, Python Flask and Firebase. AI help runs on Groq's free tier, and Find searches real papers on OpenAlex.

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
- Free Groq and OpenAlex API keys (see DEPLOYMENT_GUIDE.md)

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
   GROQ_API_KEY=your-groq-key
   OPENALEX_API_KEY=your-openalex-key
   ALLOWED_ORIGINS=http://localhost:3000
   FLASK_ENV=development
   ```

5. **Add Firebase Service Account**
   - Download your Firebase service account JSON
   - Place it in `backend/firebase-service-account.json`

6. **Frontend config (optional)**
   - Copy `frontend/.env.example` to `frontend/.env.local` to set the AI service URL, base path or portfolio link
   - Firebase web config lives in `frontend/src/config/firebase.js` (overridable with `VITE_FIREBASE_*`)

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
   Application runs on `http://localhost:3000/research/`

## 📖 Usage

### Getting Started
1. Open `http://localhost:3000/research/` in your browser
2. Sign in using Google, email/password, or continue as guest
3. Create your first research document
4. Invite collaborators and start researching together!

### Key Features
- **Document Creation**: Click the "+" button to create new documents
- **AI Assistant**: Use the AI Assistant for research help and writing assistance
- **File Upload**: Upload research documents, images, and media files
- **Collaboration**: Share documents and work together in real-time
- **Analytics**: View document insights and research metrics


## 🌍 Going live

Same setup as the Hangman game: a **Render Blueprint** (`render.yaml`) deploys the static site
and the Flask API, and the portfolio's Vercel rewrites serve it at
`harshitha-upadhyayula.vercel.app/research`. Step by step: **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**.

## 🗺️ Site map

| Route | What it is |
|---|---|
| `/research/` | Landing page |
| `/research/explore` | Discover projects by field, stage, and who's seeking collaborators |
| `/research/p/:slug` | Project page: abstract, CRediT contributors, open questions, data & materials, open reviews, versions, BibTeX |
| `/research/library` | Research: OpenAlex papers (filters, references, cited-by, citations per year, watch for new citations), authors, topic trends. Stories: comparable titles (Open Library), classics (Gutenberg), Words (Datamuse) |
| `/research/collaborate` | Open calls for expertise across disciplines |
| `/research/guides` | Short guides for first-time research writers |
| `/research/u/:handle` | Researcher profile |
| `/research/new` | Start a project from a template |
| `/research/workspace` | Editor with real-time sync, comments, per-project chat, dictation, AI assistant, materials and insights |
| `/research/workspace/inbox` | Mail-style Updates: chat, comments and new citations of watched papers |

### Two modes: Research and Stories
A switch in the header flips the whole site between **Research** (papers, CRediT roles, OpenAlex)
and **Stories** (fiction, poetry and memoir: genres, drafts, beta notes, remixes, Open Library).
Same engine and accounts; each mode has its own vocabulary, templates, sample content and theme.
Opening a project switches to its mode. `?mode=stories` in any URL selects it too.

Explore, project, collaborate and profile pages currently show clearly labelled **sample data**
(`frontend/src/data/samples.js`) until public projects are queried from Firestore.
