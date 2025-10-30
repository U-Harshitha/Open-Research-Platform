import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase.js';

// Document Management Service
class DocumentService {
  static async createDocument(userId, data) {
    try {
      const docRef = await addDoc(collection(db, 'documents'), {
        title: data.title || 'Untitled Document',
        content: data.content || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        collaborators: [userId],
        isPublic: data.isPublic || false,
        assets: data.assets || [],
        version: 1,
        lastEditedBy: userId
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  static async updateDocument(docId, updates) {
    try {
      const docRef = doc(db, 'documents', docId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(docId) {
    try {
      const docRef = doc(db, 'documents', docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  static async addCollaborator(docId, userId) {
    try {
      const docRef = doc(db, 'documents', docId);
      await updateDoc(docRef, {
        collaborators: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  static async removeCollaborator(docId, userId) {
    try {
      const docRef = doc(db, 'documents', docId);
      await updateDoc(docRef, {
        collaborators: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }

  static subscribeToUserDocuments(userId, callback) {
    const q = query(
      collection(db, 'documents'),
      where('collaborators', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    });
  }

  static subscribeToDocument(docId, callback) {
    const docRef = doc(db, 'documents', docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }
}

// Real-time Collaboration Service
class CollaborationService {
  static async updateUserPresence(docId, userId, presence) {
    try {
      const presenceRef = doc(db, 'presence', `${docId}_${userId}`);
      await updateDoc(presenceRef, {
        userId,
        docId,
        ...presence,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      // Document might not exist, create it
      try {
        await addDoc(collection(db, 'presence'), {
          userId,
          docId,
          ...presence,
          lastSeen: serverTimestamp()
        });
      } catch (createError) {
        console.error('Error updating user presence:', createError);
        throw createError;
      }
    }
  }

  static subscribeToDocumentPresence(docId, callback) {
    const q = query(
      collection(db, 'presence'),
      where('docId', '==', docId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out stale presence (older than 30 seconds)
        const lastSeen = data.lastSeen?.toDate();
        const now = new Date();
        if (lastSeen && (now - lastSeen) < 30000) {
          users.push({ id: doc.id, ...data });
        }
      });
      callback(users);
    });
  }

  static async addComment(docId, userId, comment) {
    try {
      await addDoc(collection(db, 'comments'), {
        docId,
        userId,
        content: comment.content,
        position: comment.position || null,
        selection: comment.selection || null,
        createdAt: serverTimestamp(),
        resolved: false
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static subscribeToDocumentComments(docId, callback) {
    const q = query(
      collection(db, 'comments'),
      where('docId', '==', docId),
      where('resolved', '==', false),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const comments = [];
      snapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      callback(comments);
    });
  }
}

// Asset Management Service
class AssetService {
  static async addAssetToDocument(docId, asset) {
    try {
      const docRef = doc(db, 'documents', docId);
      await updateDoc(docRef, {
        assets: arrayUnion({
          ...asset,
          id: Date.now().toString(),
          addedAt: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  }

  static async removeAssetFromDocument(docId, assetId) {
    try {
      // First get the document to find the asset
      const docRef = doc(db, 'documents', docId);
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const updatedAssets = (data.assets || []).filter(asset => asset.id !== assetId);
        
        await updateDoc(docRef, {
          assets: updatedAssets,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error removing asset:', error);
      throw error;
    }
  }

  static async analyzeAsset(asset) {
    try {
      const response = await fetch('/api/asset-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: asset.type,
          content: asset.description || asset.title,
          url: asset.url
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing asset:', error);
      throw error;
    }
  }
}

// Analytics Service
class AnalyticsService {
  static async logUserAction(userId, action, metadata = {}) {
    try {
      await addDoc(collection(db, 'analytics'), {
        userId,
        action,
        metadata,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }

  static async getDocumentAnalytics(docId) {
    try {
      const q = query(
        collection(db, 'analytics'),
        where('metadata.docId', '==', docId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const analytics = [];
      snapshot.forEach((doc) => {
        analytics.push({ id: doc.id, ...doc.data() });
      });
      
      return analytics;
    } catch (error) {
      console.error('Error getting document analytics:', error);
      throw error;
    }
  }
}

// Export all services
export { DocumentService, CollaborationService, AssetService, AnalyticsService };