import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { Check, Download, Link2, Loader2, MessageSquare, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase.js';
import { isLocalId, updateProject } from '../lib/projects.js';
import Avatar from './ui/Avatar.jsx';

const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      [{ script: 'sub' }, { script: 'super' }],
      ['link', 'image'],
      ['clean'],
    ],
  },
  history: { delay: 1000, maxStack: 200, userOnly: true },
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet',
  'blockquote', 'code-block', 'script', 'link', 'image',
];

const CollaborativeEditor = forwardRef(function CollaborativeEditor(
  { documentId, user, onContentChange, initialContent = '', title = 'Untitled', onTitleChange, showComments, onToggleComments, toolbarSlot },
  ref
) {
  const local = isLocalId(documentId) || !db || user?.isDemo;
  const [content, setContent] = useState(initialContent);
  const [documentTitle, setDocumentTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedText, setSelectedText] = useState(null);

  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const titleTimeoutRef = useRef(null);
  const lastLocalContent = useRef(initialContent);

  // Let the workspace insert AI drafts at the cursor.
  useImperativeHandle(ref, () => ({
    insertHtml(html) {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
      const range = quill.getSelection(true);
      const index = range ? range.index + range.length : quill.getLength();
      quill.clipboard.dangerouslyPasteHTML(index, html, 'user');
    },
    getText: () => quillRef.current?.getEditor().getText() || '',
  }));

  // Remote changes from collaborators. Ignore echoes of our own saves.
  useEffect(() => {
    if (local) return;
    const unsub = onSnapshot(
      doc(db, 'documents', documentId),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (typeof data.content === 'string' && data.content !== lastLocalContent.current && !snap.metadata.hasPendingWrites) {
          lastLocalContent.current = data.content;
          setContent(data.content);
          onContentChange?.(data.content);
        }
        if (data.title && document.activeElement?.id !== 'doc-title') setDocumentTitle(data.title);
        if (data.updatedAt?.toDate) setLastSaved(data.updatedAt.toDate());
      },
      (error) => console.error('Error listening to document changes:', error)
    );
    return unsub;
  }, [documentId, local]); // eslint-disable-line react-hooks/exhaustive-deps

  // Presence: heartbeat every 30s, show others active in the last 2 minutes.
  useEffect(() => {
    if (local || !user) return;
    const presenceRef = doc(db, 'presence', `${documentId}_${user.uid}`);
    const beat = () =>
      setDoc(
        presenceRef,
        {
          userId: user.uid,
          docId: documentId,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null,
          lastSeen: serverTimestamp(),
          status: 'active',
        },
        { merge: true }
      ).catch((e) => console.warn('presence', e));
    beat();
    const interval = setInterval(beat, 30000);

    const unsub = onSnapshot(
      query(collection(db, 'presence'), where('docId', '==', documentId)),
      (snap) => {
        const now = Date.now();
        setOnlineUsers(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((p) => p.userId !== user.uid && p.status !== 'offline' && p.lastSeen?.toDate && now - p.lastSeen.toDate() < 120000)
        );
      },
      () => {}
    );

    return () => {
      clearInterval(interval);
      unsub();
      updateDoc(presenceRef, { status: 'offline', lastSeen: serverTimestamp() }).catch(() => {});
    };
  }, [documentId, user, local]);

  // Comments
  useEffect(() => {
    if (local) return;
    const q = query(
      collection(db, 'comments'),
      where('docId', '==', documentId),
      where('resolved', '==', false),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(
      q,
      (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.warn('comments', e)
    );
  }, [documentId, local]);

  const save = useCallback(
    async (updates) => {
      try {
        setIsSaving(true);
        await updateProject(user, documentId, updates);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving document:', error);
        toast.error('Couldn’t save — your changes are still here. Retrying on next edit.');
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, user]
  );

  const handleContentChange = useCallback(
    (next, _delta, source) => {
      setContent(next);
      if (source !== 'user') return;
      lastLocalContent.current = next;
      onContentChange?.(next);
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => save({ content: next }), 1500);
    },
    [save, onContentChange]
  );

  const handleTitleChange = (next) => {
    setDocumentTitle(next);
    onTitleChange?.(next);
    clearTimeout(titleTimeoutRef.current);
    titleTimeoutRef.current = setTimeout(() => save({ title: next || 'Untitled' }), 800);
  };

  useEffect(
    () => () => {
      clearTimeout(saveTimeoutRef.current);
      clearTimeout(titleTimeoutRef.current);
    },
    []
  );

  const handleSelectionChange = useCallback((range) => {
    const quill = quillRef.current?.getEditor();
    if (quill && range && range.length > 0) {
      setSelectedText({ text: quill.getText(range.index, range.length), range });
    }
  }, []);

  const addComment = async () => {
    if (!newComment.trim() || !user) return;
    if (local) return toast('Comments need a synced (signed-in) project.');
    try {
      await addDoc(collection(db, 'comments'), {
        docId: documentId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || null,
        content: newComment,
        selection: selectedText ? { text: selectedText.text, index: selectedText.range.index, length: selectedText.range.length } : null,
        createdAt: serverTimestamp(),
        resolved: false,
      });
      setNewComment('');
      setSelectedText(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const resolveComment = async (commentId) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), { resolved: true, resolvedAt: serverTimestamp(), resolvedBy: user.uid });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  const exportDocument = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${documentTitle}</title></head><body>${content}</body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = `${(documentTitle || 'manuscript').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const status = isSaving ? (
    <><Loader2 className="h-3 w-3 animate-spin" /> Saving</>
  ) : lastSaved ? (
    <><Check className="h-3 w-3" /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
  ) : (
    <>Draft</>
  );

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-rule bg-paper px-4 pb-3 pt-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="doc-title"
              type="text"
              value={documentTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="min-w-0 flex-1 rounded bg-transparent font-serif text-2xl font-medium tracking-tight text-ink placeholder:text-ink-3 focus:outline-none sm:text-[1.7rem]"
              placeholder="Untitled"
              aria-label="Project title"
            />
            <div className="flex items-center gap-1">
              {onlineUsers.length > 0 && (
                <span className="mr-2 flex -space-x-1.5" title={`${onlineUsers.length} other(s) here now`}>
                  {onlineUsers.slice(0, 4).map((u) => (
                    <Avatar key={u.id} name={u.displayName} photo={u.photoURL} size="h-7 w-7 text-[0.6rem]" ring />
                  ))}
                </span>
              )}
              <button
                onClick={onToggleComments}
                className={`icon-btn relative ${showComments ? 'bg-sunken text-ink' : ''}`}
                title="Comments"
                aria-pressed={showComments}
              >
                <MessageSquare className="h-4 w-4" />
                {comments.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[0.6rem] font-medium text-white">
                    {comments.length}
                  </span>
                )}
              </button>
              <button onClick={exportDocument} className="icon-btn" title="Export as HTML">
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied'))}
                className="icon-btn"
                title="Copy link"
              >
                <Link2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.12em] text-ink-3">{status}</span>
            {toolbarSlot}
          </div>
        </div>

        <div className="manuscript min-h-0 flex-1 overflow-y-auto">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            onChangeSelection={handleSelectionChange}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Start with the question you’re trying to answer…"
          />
        </div>
      </div>

      {showComments && (
        <aside className="flex w-full max-w-[20rem] shrink-0 flex-col border-l border-rule bg-surface max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-40 max-lg:shadow-lift">
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <p className="text-sm font-medium">Comments <span className="font-mono text-2xs text-ink-3">{comments.length}</span></p>
            <button onClick={onToggleComments} className="icon-btn" aria-label="Close comments"><X className="h-4 w-4" /></button>
          </div>
          <div className="border-b border-rule p-4">
            {selectedText && (
              <p className="mb-2 rounded-md bg-mark/40 px-2 py-1.5 font-serif text-sm italic text-ink-2">
                “{selectedText.text.slice(0, 80)}{selectedText.text.length > 80 ? '…' : ''}”
              </p>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={selectedText ? 'Comment on the selection…' : 'Select text to anchor a comment, or write a general note…'}
              className="input-field h-20 resize-none"
            />
            <button onClick={addComment} disabled={!newComment.trim()} className="btn-primary btn-sm mt-2 w-full">
              Comment
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-3">{local ? 'Comments sync once you sign in with an account.' : 'No open comments.'}</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-lg border border-rule p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <Avatar name={c.userName} photo={c.userPhoto} size="h-5 w-5 text-[0.55rem]" />
                        {c.userName}
                      </span>
                      <button onClick={() => resolveComment(c.id)} className="text-2xs text-ink-3 hover:text-accent" title="Resolve">
                        Resolve
                      </button>
                    </div>
                    {c.selection?.text && (
                      <p className="mt-2 border-l-2 border-mark pl-2 font-serif text-xs italic text-ink-3">{c.selection.text.slice(0, 60)}…</p>
                    )}
                    <p className="mt-2 text-sm text-ink-2">{c.content}</p>
                    <p className="mt-1.5 font-mono text-[0.6rem] text-ink-3">{c.createdAt?.toDate?.()?.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      )}
    </div>
  );
});

export default CollaborativeEditor;
