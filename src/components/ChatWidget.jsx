import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import './ChatWidget.css';

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const channelRef = useRef(null);

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Find or create this user's chat row ─────────────────────────────
  const getOrCreateChat = useCallback(async () => {
    if (!user) return null;

    const { data: existing, error: findErr } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (findErr) {
      console.error('Error finding chat:', findErr.message);
      setError('Could not load chat.');
      return null;
    }

    if (existing) return existing;

    const { data: created, error: createErr } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || null,
        last_message: null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createErr) {
      console.error('Error creating chat:', createErr.message);
      setError('Could not start chat.');
      return null;
    }

    return created;
  }, [user]);

  // ── Load chat + messages when the panel opens (or user changes) ────
  useEffect(() => {
    if (!open || !user) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      const chat = await getOrCreateChat();
      if (!isMounted) return;

      if (!chat) {
        setLoading(false);
        return;
      }

      setChatId(chat.id);

      const { data: msgs, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });

      if (!isMounted) return;

      if (msgErr) {
        console.error('Error loading messages:', msgErr.message);
        setError('Could not load messages.');
      } else {
        setMessages(msgs || []);
      }
      setLoading(false);
    })();

    return () => { isMounted = false; };
  }, [open, user, getOrCreateChat]);

  // ── Realtime subscription for new messages (e.g. admin replies) ────
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`widget-chat-${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ── Send a message to the admin panel ───────────────────────────────
  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !user) return;

    let activeChatId = chatId;
    if (!activeChatId) {
      const chat = await getOrCreateChat();
      if (!chat) return;
      activeChatId = chat.id;
      setChatId(chat.id);
    }

    setSending(true);
    setInput('');
    setError(null);

    const { data: inserted, error: sendErr } = await supabase
      .from('messages')
      .insert({
        chat_id: activeChatId,
        text,
        role: 'user',
        seen_by_user: true,
      })
      .select()
      .single();

    if (sendErr) {
      console.error('Error sending message:', sendErr.message);
      setError('Message failed to send.');
      setInput(text); // restore so they don't lose it
      setSending(false);
      return;
    }

    // Add locally in case the realtime event is slow/misses (dedup handles overlap)
    setMessages(prev => (prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted]));

    await supabase
      .from('chats')
      .update({ last_message: text, updated_at: new Date().toISOString() })
      .eq('id', activeChatId);

    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showEmptyState = !loading && !error && messages.length === 0;

  return (
    <div className="chat-widget-root">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-panel-title">
              <span className="chat-status-dot" />
              Support
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          <div className="chat-panel-body" ref={scrollRef}>
            {loading && (
              <div className="chat-bubble-row bot">
                <div className="chat-bubble bot">Loading…</div>
              </div>
            )}

            {error && (
              <div className="chat-bubble-row bot">
                <div className="chat-bubble bot" style={{ color: '#ff4d6a' }}>{error}</div>
              </div>
            )}

            {showEmptyState && (
              <div className="chat-bubble-row bot">
                <div className="chat-bubble bot">
                  Hi! 👋 Send us a message and our team will get back to you.
                </div>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`chat-bubble-row ${m.role === 'agent' ? 'bot' : 'user'}`}>
                <div className={`chat-bubble ${m.role === 'agent' ? 'bot' : 'user'}`}>
                  {m.text}
                  <span className="chat-bubble-time">{fmtTime(m.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-panel-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder={user ? 'Type a message…' : 'Sign in to chat…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!user || sending}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || sending || !user}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
