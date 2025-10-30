import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { 
  Users, 
  MessageCircle, 
  Save, 
  Clock, 
  Eye,
  Edit3,
  FileText,
  Download,
  Share2,
  MoreHorizontal,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CollaborativeEditor = ({ 
  documentId, 
  user, 
  onContentChange,
  initialContent = '',
  title = 'Untitled Document',
  onTitleChange 
}) => {
  const [content, setContent] = useState(initialContent);
  const [documentTitle, setDocumentTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedText, setSelectedText] = useState(null);
  
  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const presenceTimeoutRef = useRef(null);

  // Enhanced Quill modules with collaboration features
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ]
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: false
    }
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'blockquote', 'code-block', 'link', 'image', 'video'
  ];

  // Real-time document synchronization
  useEffect(() => {
    if (!documentId || !db) return;

    const docRef = doc(db, 'documents', documentId);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.content !== content) {
          setContent(data.content || '');
        }
        if (data.title !== documentTitle) {
          setDocumentTitle(data.title || 'Untitled Document');
        }
        setLastSaved(data.updatedAt?.toDate());
        setCollaborators(data.collaborators || []);
      }
    }, (error) => {
      console.error('Error listening to document changes:', error);
    });

    return () => unsubscribe();
  }, [documentId]);

  // Real-time presence tracking
  useEffect(() => {
    if (!documentId || !user || !db) return;

    const updatePresence = async () => {
      try {
        const presenceRef = doc(db, 'presence', `${documentId}_${user.uid}`);
        await updateDoc(presenceRef, {
          userId: user.uid,
          docId: documentId,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null,
          lastSeen: serverTimestamp(),
          status: 'active'
        }).catch(async () => {
          // Create if doesn't exist
          await addDoc(collection(db, 'presence'), {
            userId: user.uid,
            docId: documentId,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || null,
            lastSeen: serverTimestamp(),
            status: 'active'
          });
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Update presence immediately and then every 30 seconds
    updatePresence();
    presenceTimeoutRef.current = setInterval(updatePresence, 30000);

    // Listen to other users' presence
    const presenceQuery = query(
      collection(db, 'presence'),
      where('docId', '==', documentId)
    );

    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
      const users = [];
      const now = new Date();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate();
        
        // Consider user online if they were active in the last 2 minutes
        if (lastSeen && (now - lastSeen) < 120000 && data.userId !== user.uid) {
          users.push({ id: doc.id, ...data });
        }
      });
      
      setOnlineUsers(users);
    });

    // Cleanup function
    return () => {
      if (presenceTimeoutRef.current) {
        clearInterval(presenceTimeoutRef.current);
      }
      unsubscribePresence();
      
      // Update status to offline
      try {
        const presenceRef = doc(db, 'presence', `${documentId}_${user.uid}`);
        updateDoc(presenceRef, {
          status: 'offline',
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating offline status:', error);
      }
    };
  }, [documentId, user]);

  // Comments subscription
  useEffect(() => {
    if (!documentId || !db) return;

    const commentsQuery = query(
      collection(db, 'comments'),
      where('docId', '==', documentId),
      where('resolved', '==', false),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsList = [];
      snapshot.forEach((doc) => {
        commentsList.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsList);
    });

    return () => unsubscribe();
  }, [documentId]);

  // Auto-save functionality
  const saveDocument = useCallback(async (newContent, newTitle) => {
    if (!documentId || !user || !db) {
      // Fallback for demo mode
      setLastSaved(new Date());
      return;
    }

    try {
      setIsSaving(true);
      const docRef = doc(db, 'documents', documentId);
      const updateData = {
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid
      };

      if (newContent !== undefined) {
        updateData.content = newContent;
      }
      if (newTitle !== undefined) {
        updateData.title = newTitle;
      }

      await updateDoc(docRef, updateData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [documentId, user]);

  // Handle content changes with debounced auto-save
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    
    if (onContentChange) {
      onContentChange(newContent);
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(newContent);
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [saveDocument, onContentChange]);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle) => {
    setDocumentTitle(newTitle);
    
    if (onTitleChange) {
      onTitleChange(newTitle);
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save title
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(undefined, newTitle);
    }, 1000);
  }, [saveDocument, onTitleChange]);

  // Handle text selection for comments
  const handleSelectionChange = useCallback(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        const selectedTextContent = quill.getText(range.index, range.length);
        setSelectedText({
          text: selectedTextContent,
          range: range
        });
      } else {
        setSelectedText(null);
      }
    }
  }, []);

  // Add comment
  const addComment = async () => {
    if (!newComment.trim() || !user || !documentId || !db) return;

    try {
      await addDoc(collection(db, 'comments'), {
        docId: documentId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || null,
        content: newComment,
        selection: selectedText,
        createdAt: serverTimestamp(),
        resolved: false
      });

      setNewComment('');
      setSelectedText(null);
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Resolve comment
  const resolveComment = async (commentId) => {
    if (!db) return;

    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        resolved: true,
        resolvedAt: serverTimestamp(),
        resolvedBy: user.uid
      });
      toast.success('Comment resolved');
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  // Export document
  const exportDocument = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Document exported');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Document Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-4">
          {/* Editable Title */}
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:bg-gray-50 rounded px-2 py-1 flex-1 max-w-md"
            placeholder="Untitled Document"
          />

          {/* Save Status */}
          <div className="flex items-center text-sm text-gray-500">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : lastSaved ? (
              <>
                <Clock className="w-4 h-4 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-1" />
                Draft
              </>
            )}
          </div>
        </div>

        {/* Collaboration Tools */}
        <div className="flex items-center space-x-4">
          {/* Online Users */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  title={user.displayName}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.displayName?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
              ))}
              {onlineUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                  +{onlineUsers.length - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {onlineUsers.length + 1} online
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-lg transition-colors ${
                showComments 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Comments"
            >
              <MessageCircle className="w-4 h-4" />
              {comments.length > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1">
                  {comments.length}
                </span>
              )}
            </button>

            <button
              onClick={exportDocument}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            onChangeSelection={handleSelectionChange}
            modules={quillModules}
            formats={quillFormats}
            className="flex-1"
            placeholder="Start writing your research document..."
          />
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comments ({comments.length})
              </h3>
            </div>

            {/* Add Comment */}
            <div className="p-4 border-b border-gray-200">
              {selectedText && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>Selected text:</strong> "{selectedText.text.substring(0, 50)}..."
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="mt-2 w-full btn-primary py-2 text-sm disabled:opacity-50"
              >
                Add Comment
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Select text and add a comment</p>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium mr-2">
                            {comment.userPhoto ? (
                              <img 
                                src={comment.userPhoto} 
                                alt={comment.userName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              comment.userName?.[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {comment.userName}
                          </span>
                        </div>
                        <button
                          onClick={() => resolveComment(comment.id)}
                          className="text-xs text-gray-400 hover:text-green-600"
                          title="Resolve comment"
                        >
                          ✓
                        </button>
                      </div>
                      
                      {comment.selection && (
                        <div className="text-xs text-gray-500 mb-1 italic">
                          Re: "{comment.selection.text.substring(0, 30)}..."
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      
                      <div className="text-xs text-gray-400 mt-1">
                        {comment.createdAt?.toDate?.()?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeEditor;