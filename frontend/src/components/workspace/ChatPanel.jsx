import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendMessage, subscribeMessages } from '../../lib/chat.js';
import { isLocalId } from '../../lib/projects.js';
import Avatar from '../ui/Avatar.jsx';

const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const day = (ms) => new Date(ms).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export default function ChatPanel({ project, user }) {
  const [messages, setMessages] = useState(null);
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState('');
  const end = useRef(null);

  useEffect(() => {
    setMessages(null);
    return subscribeMessages(user, project.id, (list, err) => {
      setFailed(!!err);
      setMessages(list || []);
    });
  }, [user, project.id]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages?.length]);

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    try {
      await sendMessage(user, project.id, t);
    } catch (err) {
      console.error(err);
      setText(t);
      toast.error('Message not sent');
    }
  };

  let lastDay = null;
  return (
    <div className="flex h-full flex-col">
      <p className="border-b border-rule px-4 py-2 text-2xs text-ink-3">
        {isLocalId(project.id) || user.isDemo ? 'Saved in this browser — sign in with an account to chat with collaborators.' : 'Visible to this project’s collaborators only.'}
      </p>
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {messages === null && <p className="text-sm text-ink-3">Loading…</p>}
        {failed && <p className="text-xs text-ink-3">Chat couldn’t load. If you deployed recently, deploy the Firestore rules and indexes.</p>}
        {messages?.length === 0 && !failed && (
          <div className="py-10 text-center">
            <p className="font-serif text-lg">Say hello 👋</p>
            <p className="mt-1 text-xs text-ink-3">Quick questions, decisions, links — right next to the draft.</p>
          </div>
        )}
        {messages?.map((m, i) => {
          const mine = m.userId === user.uid;
          const prev = messages[i - 1];
          const grouped = prev && prev.userId === m.userId && m.createdAt - prev.createdAt < 5 * 60000;
          const d = day(m.createdAt);
          const showDay = d !== lastDay;
          lastDay = d;
          return (
            <React.Fragment key={m.id}>
              {showDay && <p className="py-2 text-center font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-3">{d}</p>}
              <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''} ${grouped ? '' : 'pt-2'}`}>
                <span className={grouped ? 'invisible' : ''}>
                  <Avatar name={m.userName} photo={m.userPhoto} size="h-6 w-6 text-[0.55rem]" />
                </span>
                <div className={`max-w-[78%] ${mine ? 'items-end text-right' : ''}`}>
                  {!grouped && !mine && <p className="mb-0.5 text-2xs font-medium text-ink-2">{m.userName}</p>}
                  <p className={`pop-in inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-left text-sm ${mine ? 'rounded-br-md bg-ink text-paper' : 'rounded-bl-md bg-sunken text-ink'}`}>{m.text}</p>
                  <p className="mt-0.5 font-mono text-[0.58rem] text-ink-3">{time(m.createdAt)}</p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex items-end gap-2 border-t border-rule p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(e)}
          rows={1}
          placeholder="Message the project…"
          className="input-field max-h-32 min-h-[2.4rem] flex-1 resize-none"
          aria-label="Message"
        />
        <button type="submit" disabled={!text.trim()} className="btn-primary h-10 w-10 p-0" aria-label="Send"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
