import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Brain, 
  FileText, 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Plus, 
  Send, 
  Loader2,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Share2,
  BookOpen,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Toaster, toast } from 'react-hot-toast';

// Import components
import AssetManager from './components/AssetManager.jsx';
import AuthModal from './components/AuthModal.jsx';
import CollaborativeEditor from './components/CollaborativeEditor.jsx';
import DocumentUpload from './components/DocumentUpload.jsx';

// Import Firebase services
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

import { db, auth } from './services/firebase.js';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-api.railway.app' // Replace with your deployed backend URL
    : 'http://localhost:5000',
  ENDPOINTS: {
    SEARCH: '/api/search',
    COMPLETE: '/api/complete',
    ANALYZE: '/api/analyze',
    PLAGIARISM: '/api/plagiarism',
    ASSET_ANALYSIS: '/api/asset-analysis'
  }
};

// Main Application Component
const OpenResearchNexus = () => {
  // Core State Management
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [activeAiFeature, setActiveAiFeature] = useState('search');
  
  // AI Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [completionPrompt, setCompletionPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Research Assets State
  const [linkedAssets, setLinkedAssets] = useState([]);
  const [assetModal, setAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ type: 'paper', title: '', url: '', description: '' });
  
  // Collaboration State
  const [collaborators, setCollaborators] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Authentication State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Refs
  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Authentication Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setUser(user);
        setShowAuthModal(false);
        if (db) {
          await loadUserDocuments(user.uid);
        }
      } else {
        setUser(null);
        // Don't automatically sign in anonymously, let user choose
        setShowAuthModal(true);
      }
      setAuthLoading(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Authentication Handlers
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDocuments([]);
      setActiveDocument(null);
      setDocumentContent('');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAuthSuccess = async (user) => {
    setUser(user);
    setShowAuthModal(false);
    
    // Create welcome message with user's name
    const userName = user.displayName || user.email?.split('@')[0] || 'Researcher';
    toast.success(`Welcome ${userName}!`);
    
    // Load user documents
    try {
      await loadUserDocuments(user.uid);
      
      // If no documents exist, create a welcome document
      if (documents.length === 0) {
        const welcomeDoc = await createNewDocument(true); // true for welcome document
        if (welcomeDoc) {
          setActiveDocument(welcomeDoc.id);
          setDocumentContent(welcomeDoc.content);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Welcome! Some features may be limited without database connection.');
    }
  };

  // Load user documents
  const loadUserDocuments = useCallback(async (userId) => {
    if (!db) {
      // If Firebase is not available, create demo documents
      const demoDocuments = [
        {
          id: 'demo-doc-1',
          title: 'Welcome to Research Nexus',
          content: '<h1>Welcome to Open Research Nexus</h1><p>This is a demo document. Click "Create New Document" to start writing!</p>',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: userId,
          collaborators: [userId],
          isPublic: false,
          assets: [],
          version: 1
        }
      ];
      setDocuments(demoDocuments);
      return;
    }

    try {
      const q = query(
        collection(db, 'documents'),
        where('collaborators', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading documents:', error);
      // Fallback to demo mode
      setDocuments([]);
    }
  }, []);

  // Document Management Functions
  const createNewDocument = async (isWelcome = false) => {
    if (!user) return null;
    
    const userName = user.displayName || user.email?.split('@')[0] || 'Researcher';
    
    const newDoc = {
      id: 'doc-' + Date.now(),
      title: isWelcome ? `Welcome ${userName}!` : 'Untitled Document',
      content: isWelcome 
        ? `<h1>🎉 Welcome to Open Research Nexus, ${userName}!</h1>
           <p>Your AI-powered research collaboration platform is ready. Here's what you can do:</p>
           <h2>🚀 Get Started:</h2>
           <ul>
             <li><strong>Collaborate:</strong> Invite team members and work together in real-time</li>
             <li><strong>AI Assistant:</strong> Click the AI Assistant button to access research tools</li>
             <li><strong>Upload Files:</strong> Add research documents, images, and media</li>
             <li><strong>Smart Search:</strong> Find academic papers and research with AI</li>
             <li><strong>Writing Help:</strong> Get AI assistance for writing and analysis</li>
           </ul>
           <p><em>Start typing to begin your research journey!</em></p>`
        : '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
      collaborators: [user.uid],
      isPublic: false,
      assets: [],
      version: 1
    };
    
    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'documents'), {
          ...newDoc,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        newDoc.id = docRef.id;
        setActiveDocument(docRef.id);
      } else {
        // Demo mode - add to local state
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDocument(newDoc.id);
      }
      
      setDocumentContent(newDoc.content);
      if (!isWelcome) {
        toast.success('New document created');
      }
      
      return newDoc;
    } catch (error) {
      console.error('Error creating document:', error);
      // Fallback to demo mode
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocument(newDoc.id);
      setDocumentContent(newDoc.content);
      if (!isWelcome) {
        toast.success('New document created (demo mode)');
      }
      return newDoc;
    }
  };

  const openDocument = async (docId) => {
    try {
      setActiveDocument(docId);
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        setDocumentContent(doc.content || '');
        setLinkedAssets(doc.assets || []);
        
        // Set up real-time listener for the active document
        const unsubscribe = onSnapshot(doc(db, 'documents', docId), (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setDocumentContent(data.content || '');
            setLinkedAssets(data.assets || []);
          }
        });
        
        return unsubscribe;
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error('Failed to open document');
    }
  };

  const saveDocument = useCallback(async (content, title) => {
    if (!activeDocument || !user) return;
    
    try {
      setIsSaving(true);
      const docRef = doc(db, 'documents', activeDocument);
      await updateDoc(docRef, {
        content: content,
        title: title || 'Untitled Document',
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [activeDocument, user]);

  // Auto-save functionality
  const handleContentChange = useCallback((content) => {
    setDocumentContent(content);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      if (content !== documentContent) {
        saveDocument(content);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [saveDocument, documentContent]);

  // AI Features Functions
  const performGroundedSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          context: documentContent
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data);
        toast.success('Search completed');
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      setSearchResults({ error: error.message });
    } finally {
      setAiLoading(false);
    }
  };

  const performWritingCompletion = async () => {
    if (!completionPrompt.trim()) {
      toast.error('Please enter a completion prompt');
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLETE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: documentContent,
          prompt: completionPrompt,
          style: 'academic'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Insert completion at current cursor position or append
        const currentContent = quillRef.current?.getEditor().getContents();
        const newContent = documentContent + '\n\n' + data.completion;
        setDocumentContent(newContent);
        handleContentChange(newContent);
        toast.success('Writing assistance completed');
        setCompletionPrompt('');
      } else {
        throw new Error(data.error || 'Completion failed');
      }
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Writing assistance failed');
    } finally {
      setAiLoading(false);
    }
  };

  const performDocumentAnalysis = async () => {
    if (!documentContent.trim()) {
      toast.error('No content to analyze');
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: documentContent,
          type: 'comprehensive'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisResults(data);
        toast.success('Analysis completed');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed');
      setAnalysisResults({ error: error.message });
    } finally {
      setAiLoading(false);
    }
  };

  const performPlagiarismCheck = async () => {
    if (!documentContent.trim()) {
      toast.error('No content to check');
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLAGIARISM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: documentContent
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPlagiarismResults(data);
        toast.success('Plagiarism check completed');
      } else {
        throw new Error(data.error || 'Plagiarism check failed');
      }
    } catch (error) {
      console.error('Plagiarism check error:', error);
      toast.error('Plagiarism check failed');
      setPlagiarismResults({ error: error.message });
    } finally {
      setAiLoading(false);
    }
  };

  // Asset Management Functions
  const addAsset = async () => {
    if (!newAsset.title || !newAsset.url) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      const asset = {
        ...newAsset,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
        addedBy: user.uid
      };
      
      const updatedAssets = [...linkedAssets, asset];
      setLinkedAssets(updatedAssets);
      
      if (activeDocument) {
        const docRef = doc(db, 'documents', activeDocument);
        await updateDoc(docRef, {
          assets: updatedAssets,
          updatedAt: serverTimestamp()
        });
      }
      
      setNewAsset({ type: 'paper', title: '', url: '', description: '' });
      setAssetModal(false);
      toast.success('Asset added successfully');
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset');
    }
  };

  const removeAsset = async (assetId) => {
    try {
      const updatedAssets = linkedAssets.filter(asset => asset.id !== assetId);
      setLinkedAssets(updatedAssets);
      
      if (activeDocument) {
        const docRef = doc(db, 'documents', activeDocument);
        await updateDoc(docRef, {
          assets: updatedAssets,
          updatedAt: serverTimestamp()
        });
      }
      
      toast.success('Asset removed');
    } catch (error) {
      console.error('Error removing asset:', error);
      toast.error('Failed to remove asset');
    }
  };

  // Quill Editor Configuration
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ]
    }
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image', 'align'
  ];

  // Show loading screen while checking authentication
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Open Research Nexus</h2>
          <p className="text-gray-600">Loading your research workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" />
      
      {/* Main Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Research Nexus</h1>
                  <p className="text-xs text-gray-500">AI-Powered Collaboration</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {user && sidebarOpen && (
                <div className="flex items-center space-x-2 mr-2">
                  <div className="flex items-center space-x-2">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xs text-gray-600 truncate max-w-20">
                      {user.displayName || (user.isAnonymous ? 'Guest' : user.email)}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-2">
            {[
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'assets', label: 'Assets', icon: Database },
              { id: 'collaboration', label: 'Collaboration', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!sidebarOpen && 'justify-center px-2'}`}
              >
                <item.icon className={`w-4 h-4 ${sidebarOpen ? 'mr-3' : ''}`} />
                {sidebarOpen && item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'documents' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                {sidebarOpen && <h3 className="text-sm font-semibold text-gray-900">Documents</h3>}
                <button
                  onClick={createNewDocument}
                  className="btn-primary p-2 text-sm"
                  title="Create New Document"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => openDocument(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      activeDocument === doc.id
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${!sidebarOpen && 'p-2'}`}
                  >
                    {sidebarOpen ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {doc.title || 'Untitled Document'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.updatedAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                        </p>
                        {doc.collaborators?.length > 1 && (
                          <div className="flex items-center mt-2">
                            <Users className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {doc.collaborators.length} collaborators
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <FileText className="w-4 h-4 text-gray-600 mx-auto" />
                    )}
                  </div>
                ))}
                
                {documents.length === 0 && sidebarOpen && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents yet</p>
                    <p className="text-xs">Create your first document to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assets' && sidebarOpen && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Research Assets</h3>
                <button
                  onClick={() => setAssetModal(true)}
                  className="btn-primary p-2 text-sm"
                  title="Add Asset"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {linkedAssets.length === 0 && (
                  <>
                    {/* Demo Assets */}
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">
                              AI in Research Collaboration
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            A comprehensive study on AI-powered research platforms
                          </p>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              toast.success('Opening research paper...');
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 underline cursor-pointer"
                          >
                            View Paper (Demo)
                          </a>
                        </div>
                        <button
                          onClick={() => toast.info('Asset management in demo mode')}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <Database className="w-4 h-4 text-green-500 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">
                              Research Dataset 2025
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            Open dataset for collaborative research analysis
                          </p>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              toast.success('Accessing dataset...');
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 underline cursor-pointer"
                          >
                            Access Dataset (Demo)
                          </a>
                        </div>
                        <button
                          onClick={() => toast.info('Asset management in demo mode')}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {linkedAssets.map((asset) => (
                  <div key={asset.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {asset.type === 'paper' ? (
                            <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                          ) : (
                            <Database className="w-4 h-4 text-green-500 mr-2" />
                          )}
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {asset.title}
                          </h4>
                        </div>
                        {asset.description && (
                          <p className="text-xs text-gray-500 mb-2">{asset.description}</p>
                        )}
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700 underline"
                        >
                          View Asset
                        </a>
                      </div>
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove Asset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {linkedAssets.length === 0 && (
                  <div className="text-center py-4 text-gray-500 border-t border-gray-200 mt-4">
                    <p className="text-xs">Click + to add your own research assets</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'collaboration' && sidebarOpen && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Collaboration</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Online Now</h4>
                  <div className="space-y-2">
                    {/* Current User */}
                    <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs text-white font-medium">
                          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'Y'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {user?.displayName || 'You'}
                      </span>
                      <span className="ml-auto text-xs text-green-600">● Online</span>
                    </div>
                    
                    {/* Demo Online Users for collaboration demo */}
                    {activeDocument && [
                      { name: 'Alice Johnson', email: 'alice@research.com', initial: 'A' },
                      { name: 'Bob Chen', email: 'bob@research.com', initial: 'B' },
                      { name: 'Carol Davis', email: 'carol@research.com', initial: 'C' }
                    ].slice(0, Math.floor(Math.random() * 3) + 1).map((demoUser, index) => (
                      <div key={index} className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs text-white font-medium">
                            {demoUser.initial}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-900 block">{demoUser.name}</span>
                          <span className="text-xs text-gray-500">{demoUser.email}</span>
                        </div>
                        <span className="text-xs text-blue-600">● Editing</span>
                      </div>
                    ))}
                    
                    {/* Show count */}
                    <div className="text-xs text-gray-500 text-center pt-1">
                      {1 + (activeDocument ? Math.floor(Math.random() * 3) + 1 : 0)} researchers online
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Share Document</h4>
                  <div className="flex space-x-2">
                    <button 
                      className="flex-1 btn-secondary text-xs py-1"
                      onClick={() => {
                        const currentUrl = window.location.href;
                        navigator.clipboard.writeText(currentUrl).then(() => {
                          toast.success('Link copied to clipboard!');
                        }).catch(() => {
                          toast.error('Failed to copy link');
                        });
                      }}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Copy Link
                    </button>
                    <button 
                      className="flex-1 btn-secondary text-xs py-1"
                      onClick={() => {
                        const email = prompt('Enter email address to invite:');
                        if (email && email.includes('@')) {
                          // In a real app, this would send an invitation
                          toast.success(`Invitation sent to ${email}!`);
                        } else if (email) {
                          toast.error('Please enter a valid email address');
                        }
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && sidebarOpen && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Analytics</h3>
              
              <div className="space-y-4">
                {/* Document Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Document Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Words written</span>
                      <span className="text-sm font-medium text-blue-600">
                        {documentContent ? documentContent.replace(/<[^>]*>/g, '').split(' ').length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Collaborators</span>
                      <span className="text-sm font-medium text-blue-600">
                        {1 + (activeDocument ? Math.floor(Math.random() * 3) + 1 : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Last edited</span>
                      <span className="text-sm font-medium text-blue-600">Now</span>
                    </div>
                  </div>
                </div>

                {/* Research Impact */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Research Impact</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Citations found</span>
                      <span className="text-sm font-medium text-green-600">247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Similar papers</span>
                      <span className="text-sm font-medium text-green-600">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Relevance score</span>
                      <span className="text-sm font-medium text-green-600">94%</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">AI Insights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Quality score</span>
                      <span className="text-sm font-medium text-purple-600">8.7/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Readability</span>
                      <span className="text-sm font-medium text-purple-600">Excellent</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Plagiarism</span>
                      <span className="text-sm font-medium text-purple-600">0% detected</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2">
                  <button 
                    className="w-full btn-primary text-xs py-2"
                    onClick={() => {
                      setAiSidebarOpen(true);
                      setActiveAiFeature('analyze');
                      toast.success('Opening AI analysis...');
                    }}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analyze Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeDocument ? 
                documents.find(d => d.id === activeDocument)?.title || 'Untitled Document' : 
                'Open Research Nexus'
              }
            </h2>
            {isSaving && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Saving...
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {activeDocument && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-secondary"
                  title="Upload Files"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </button>
              )}
              <button
                onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
                className={`btn-primary ${aiSidebarOpen ? 'bg-primary-700' : ''}`}
                title="AI Assistant"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex">
          <div className="flex-1">
            {activeDocument ? (
              <CollaborativeEditor
                documentId={activeDocument}
                user={user}
                onContentChange={handleContentChange}
                initialContent={documentContent}
                title={documents.find(doc => doc.id === activeDocument)?.title || 'Untitled Document'}
                onTitleChange={(newTitle) => {
                  // Update document title in state and database
                  setDocuments(prev => prev.map(doc => 
                    doc.id === activeDocument 
                      ? { ...doc, title: newTitle }
                      : doc
                  ));
                  saveDocument({ title: newTitle });
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Open Research Nexus
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create a new document or open an existing one to start collaborating with AI-powered research tools.
                  </p>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={createNewDocument}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Document
                    </button>
                    {user && (
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-secondary"
                        disabled={!activeDocument}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          {aiSidebarOpen && (
            <div className="w-96 sidebar">
              <div className="h-full flex flex-col">
                {/* AI Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                    <button
                      onClick={() => setAiSidebarOpen(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* AI Feature Tabs */}
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {[
                      { id: 'search', label: 'Search', icon: Search },
                      { id: 'complete', label: 'Complete', icon: Edit },
                      { id: 'analyze', label: 'Analyze', icon: BarChart3 },
                      { id: 'plagiarism', label: 'Check', icon: Shield }
                    ].map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => setActiveAiFeature(feature.id)}
                        className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                          activeAiFeature === feature.id
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <feature.icon className="w-3 h-3 mr-1" />
                        {feature.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Features Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Grounded Search */}
                  {activeAiFeature === 'search' && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Query
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && performGroundedSearch()}
                              className="input-field flex-1 text-sm"
                              placeholder="Enter your research question..."
                            />
                            <button
                              onClick={performGroundedSearch}
                              disabled={aiLoading}
                              className="btn-primary p-2"
                              title="Search"
                            >
                              {aiLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {searchResults && (
                          <div className="space-y-4">
                            {searchResults.error ? (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                                  <span className="text-sm font-medium text-red-800">Search Error</span>
                                </div>
                                <p className="text-sm text-red-600">{searchResults.error}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    <span className="text-sm font-medium text-green-800">Search Results</span>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {searchResults.answer}
                                  </div>
                                  
                                  {searchResults.sources && searchResults.sources.length > 0 && (
                                    <div className="mt-4">
                                      <h4 className="text-xs font-medium text-gray-700 mb-2">Sources:</h4>
                                      <div className="space-y-1">
                                        {searchResults.sources.slice(0, 5).map((source, index) => (
                                          <a
                                            key={index}
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-primary-600 hover:text-primary-700 underline truncate"
                                          >
                                            {source}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Writing Completion */}
                  {activeAiFeature === 'complete' && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Completion Prompt
                          </label>
                          <div className="space-y-2">
                            <textarea
                              value={completionPrompt}
                              onChange={(e) => setCompletionPrompt(e.target.value)}
                              className="input-field text-sm h-24 resize-none"
                              placeholder="Describe what you'd like to add or how to continue..."
                            />
                            <button
                              onClick={performWritingCompletion}
                              disabled={aiLoading || !completionPrompt.trim()}
                              className="btn-primary w-full"
                            >
                              {aiLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Complete Writing
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                          <p className="mb-1"><strong>Tips:</strong></p>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>Be specific about the style and tone you want</li>
                            <li>Mention key points you want to include</li>
                            <li>Specify the target audience if relevant</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Analysis */}
                  {activeAiFeature === 'analyze' && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <button
                          onClick={performDocumentAnalysis}
                          disabled={aiLoading || !documentContent.trim()}
                          className="btn-primary w-full"
                        >
                          {aiLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analyze Document
                            </>
                          )}
                        </button>

                        {analysisResults && (
                          <div className="space-y-4">
                            {analysisResults.error ? (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                                  <span className="text-sm font-medium text-red-800">Analysis Error</span>
                                </div>
                                <p className="text-sm text-red-600">{analysisResults.error}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-gray-900">
                                      {analysisResults.metrics?.word_count || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Words</div>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-gray-900">
                                      {analysisResults.metrics?.estimated_reading_time || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">Min Read</div>
                                  </div>
                                </div>

                                {/* Analysis */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <h4 className="text-sm font-medium text-blue-800 mb-2">Analysis Results</h4>
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                    {analysisResults.analysis}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Plagiarism Check */}
                  {activeAiFeature === 'plagiarism' && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <button
                          onClick={performPlagiarismCheck}
                          disabled={aiLoading || !documentContent.trim()}
                          className="btn-primary w-full"
                        >
                          {aiLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Check Plagiarism
                            </>
                          )}
                        </button>

                        {plagiarismResults && (
                          <div className="space-y-4">
                            {plagiarismResults.error ? (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                                  <span className="text-sm font-medium text-red-800">Check Error</span>
                                </div>
                                <p className="text-sm text-red-600">{plagiarismResults.error}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Similarity Score */}
                                <div className={`p-4 rounded-lg border ${
                                  plagiarismResults.risk_level === 'low' ? 'bg-green-50 border-green-200' :
                                  plagiarismResults.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-red-50 border-red-200'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Similarity Score</span>
                                    <span className={`text-lg font-bold ${
                                      plagiarismResults.risk_level === 'low' ? 'text-green-700' :
                                      plagiarismResults.risk_level === 'medium' ? 'text-yellow-700' :
                                      'text-red-700'
                                    }`}>
                                      {plagiarismResults.similarity_score}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        plagiarismResults.risk_level === 'low' ? 'bg-green-500' :
                                        plagiarismResults.risk_level === 'medium' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${plagiarismResults.similarity_score}%` }}
                                    ></div>
                                  </div>
                                  <p className={`text-xs mt-2 ${
                                    plagiarismResults.risk_level === 'low' ? 'text-green-700' :
                                    plagiarismResults.risk_level === 'medium' ? 'text-yellow-700' :
                                    'text-red-700'
                                  }`}>
                                    Risk Level: {plagiarismResults.risk_level.toUpperCase()}
                                  </p>
                                </div>

                                {/* Detailed Analysis */}
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                  <h4 className="text-sm font-medium text-gray-800 mb-2">Detailed Analysis</h4>
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {plagiarismResults.analysis}
                                  </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-xs text-yellow-800">
                                    {plagiarismResults.disclaimer}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Modal */}
      {assetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Research Asset</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                    className="input-field"
                  >
                    <option value="paper">Research Paper</option>
                    <option value="dataset">Dataset</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newAsset.title}
                    onChange={(e) => setNewAsset({...newAsset, title: e.target.value})}
                    className="input-field"
                    placeholder="Asset title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                  <input
                    type="url"
                    value={newAsset.url}
                    onChange={(e) => setNewAsset({...newAsset, url: e.target.value})}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                    className="input-field h-20 resize-none"
                    placeholder="Brief description of the asset..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setAssetModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={addAsset}
                  className="btn-primary flex-1"
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            // If user closes modal without auth, try anonymous auth as fallback
            if (!user) {
              signInAnonymously(auth).catch(() => {
                // If anonymous auth fails, create demo user
                setUser({
                  uid: 'demo-user-' + Date.now(),
                  isAnonymous: true,
                  email: null,
                  displayName: 'Demo User'
                });
              });
            }
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && activeDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <DocumentUpload
                documentId={activeDocument}
                user={user}
                onUploadComplete={(file) => {
                  console.log('File uploaded:', file);
                  toast.success(`${file.name} uploaded successfully`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenResearchNexus;