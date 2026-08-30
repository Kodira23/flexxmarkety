import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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

const INITIAL_MESSAGE = {
  id: 'init',
  from: 'bot',
  text: "Hi! 👋 How can we help you today?",
  time: new Date(),
};

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const fmtTime = (d) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: Date.now(), from: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // TODO: replace with a real API call to your support/AI backend.
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: "Thanks for your message — our team will get back to you shortly.",
          time: new Date(),
        },
      ]);
      setSending(false);
    }, 900);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

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
            {messages.map(m => (
              <div key={m.id} className={`chat-bubble-row ${m.from}`}>
                <div className={`chat-bubble ${m.from}`}>
                  {m.text}
                  <span className="chat-bubble-time">{fmtTime(m.time)}</span>
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-bubble-row bot">
                <div className="chat-bubble bot chat-typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>

          <div className="chat-panel-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder={user ? 'Type a message…' : 'Sign in to chat…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!user}
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
