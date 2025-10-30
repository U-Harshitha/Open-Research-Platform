import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  X, 
  Check,
  AlertCircle,
  Activity,
  Cloud,
  FolderOpen,
  Download
} from 'lucide-react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { storage, db } from '../services/firebase.js';
import { toast } from 'react-hot-toast';

// File type icons mapping
const getFileIcon = (fileType, size = 'w-6 h-6') => {
  const iconProps = { className: size };
  
  if (fileType.startsWith('image/')) return <Image {...iconProps} />;
  if (fileType.startsWith('video/')) return <Video {...iconProps} />;
  if (fileType.startsWith('audio/')) return <Music {...iconProps} />;
  if (fileType === 'application/pdf') return <FileText {...iconProps} />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
    return <Archive {...iconProps} />;
  }
  if (fileType.includes('document') || fileType.includes('text')) {
    return <FileText {...iconProps} />;
  }
  return <File {...iconProps} />;
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File type validation
const isValidFileType = (file) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mp3', 'audio/wav', 'audio/ogg',
    'application/pdf',
    'text/plain', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-zip-compressed',
    'application/json'
  ];
  
  return allowedTypes.includes(file.type);
};

const DocumentUpload = ({ 
  documentId, 
  user, 
  onUploadComplete,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedTypes = null 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [showFileManager, setShowFileManager] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Subscribe to document files
  React.useEffect(() => {
    if (!documentId || !db) return;

    const filesQuery = query(
      collection(db, 'documentFiles'),
      where('documentId', '==', documentId)
    );

    const unsubscribe = onSnapshot(filesQuery, (snapshot) => {
      const files = [];
      snapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });
      // Sort by upload date, newest first
      files.sort((a, b) => {
        const aTime = a.uploadedAt?.toDate?.() || new Date(0);
        const bTime = b.uploadedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setDocumentFiles(files);
    });

    return () => unsubscribe();
  }, [documentId]);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Validate and process files
  const handleFiles = useCallback((files) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxFileSize)}`);
        return;
      }

      // Check file type
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    // Upload valid files
    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  }, [user, maxFileSize]);

  // Upload files to Firebase Storage
  const uploadFiles = useCallback(async (files) => {
    if (!user || !storage || !db) return;

    setIsUploading(true);

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fileName = `${fileId}_${file.name}`;
        const storageRef = ref(storage, `documents/${documentId}/files/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Create upload tracking object
        const uploadInfo = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'uploading',
          error: null
        };

        setUploads(prev => [...prev, uploadInfo]);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploads(prev => prev.map(upload => 
              upload.id === fileId 
                ? { ...upload, progress: Math.round(progress) }
                : upload
            ));
          },
          (error) => {
            console.error('Upload error:', error);
            setUploads(prev => prev.map(upload => 
              upload.id === fileId 
                ? { ...upload, status: 'error', error: error.message }
                : upload
            ));
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Save file metadata to Firestore
              const fileDoc = await addDoc(collection(db, 'documentFiles'), {
                documentId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                downloadURL,
                storagePath: `documents/${documentId}/files/${fileName}`,
                uploadedBy: user.uid,
                uploaderName: user.displayName || 'Anonymous',
                uploadedAt: serverTimestamp()
              });

              setUploads(prev => prev.map(upload => 
                upload.id === fileId 
                  ? { ...upload, status: 'complete', downloadURL, docId: fileDoc.id }
                  : upload
              ));

              if (onUploadComplete) {
                onUploadComplete({
                  id: fileDoc.id,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  downloadURL
                });
              }

              resolve(fileDoc.id);
            } catch (error) {
              console.error('Error saving file metadata:', error);
              setUploads(prev => prev.map(upload => 
                upload.id === fileId 
                  ? { ...upload, status: 'error', error: 'Failed to save file metadata' }
                  : upload
              ));
              reject(error);
            }
          }
        );
      });
    });

    try {
      await Promise.allSettled(uploadPromises);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Some files failed to upload');
    } finally {
      setIsUploading(false);
      // Clear completed uploads after 3 seconds
      setTimeout(() => {
        setUploads(prev => prev.filter(upload => upload.status !== 'complete'));
      }, 3000);
    }
  }, [user, documentId, onUploadComplete, storage, db]);

  // Delete file
  const deleteFile = useCallback(async (fileDoc) => {
    if (!user || !storage || !db) return;

    try {
      // Delete from storage
      const storageRef = ref(storage, fileDoc.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'documentFiles', fileDoc.id));

      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, [user, storage, db]);

  // Download file
  const downloadFile = useCallback((fileDoc) => {
    const link = document.createElement('a');
    link.href = fileDoc.downloadURL;
    link.download = fileDoc.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          {isDragging ? (
            <div className="text-primary-600">
              <Upload className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Drop files here</p>
            </div>
          ) : (
            <div className="text-gray-600">
              <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Upload Files</p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-primary inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Supported: Images, Videos, Audio, PDFs, Documents</p>
          <p>Max file size: {formatFileSize(maxFileSize)}</p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploading Files</h4>
          {uploads.map((upload) => (
            <div key={upload.id} className="bg-white rounded-lg border p-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getFileIcon(upload.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.size)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {upload.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{upload.progress}%</span>
                    </div>
                  )}
                  {upload.status === 'complete' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              {upload.error && (
                <p className="text-xs text-red-600 mt-1">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Manager Toggle */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">
          Document Files ({documentFiles.length})
        </h4>
        <button
          onClick={() => setShowFileManager(!showFileManager)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
        >
          <FolderOpen className="w-4 h-4 mr-1" />
          {showFileManager ? 'Hide' : 'Show'} Files
        </button>
      </div>

      {/* File Manager */}
      {showFileManager && (
        <div className="bg-gray-50 rounded-lg p-4">
          {documentFiles.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentFiles.map((fileDoc) => (
                <div key={fileDoc.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(fileDoc.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={fileDoc.fileName}>
                        {fileDoc.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(fileDoc.fileSize)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        By {fileDoc.uploaderName} • {fileDoc.uploadedAt?.toDate?.()?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => downloadFile(fileDoc)}
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {(fileDoc.uploadedBy === user?.uid) && (
                          <button
                            onClick={() => deleteFile(fileDoc)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;