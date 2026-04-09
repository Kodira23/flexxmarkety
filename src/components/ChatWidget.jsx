import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import './ChatWidget.css'

export default function ChatWidget() {
  const { user }                    = useAuth()
  const [open, setOpen]             = useState(false)
  const [menu, setMenu]             = useState(false)
  const [input, setInput]           = useState('')
  const [messages, setMessages]     = useState([])
  const [unread, setUnread]         = useState(0)
  const bottomRef                   = useRef(null)
  const menuRef                     = useRef(null)

  const chatId = user?.id || null

  // Fetch initial messages + subscribe to realtime
  useEffect(() => {
    if (!chatId) return

    supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setMessages(data)
          if (!open) setUnread(data.filter(m => m.role === 'agent' && !m.seen_by_user).length)
        }
      })

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
        if (!open && payload.new.role === 'agent') setUnread(u => u + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [chatId])

  useEffect(() => {
    if (open && chatId) {
      setUnread(0)
      supabase.from('messages')
        .update({ seen_by_user: true })
        .eq('chat_id', chatId).eq('role', 'agent').eq('seen_by_user', false)
        .then(() => {})
    }
  }, [open, chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function sendMessage() {
    const text = input.trim()
    if (!text || !chatId) return
    setInput('')
    await supabase.from('chats').upsert({
      id: chatId,
      user_name:    user?.user_metadata?.full_name || user?.email || 'Guest',
      user_email:   user?.email || '',
      last_message: text,
      updated_at:   new Date().toISOString(),
    })
    await supabase.from('messages').insert({
      chat_id: chatId, text, role: 'user', seen_by_agent: false,
    })
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="cw-root">
      {open && (
        <div className="cw-window">
          <div className="cw-header">
            <button className="cw-back" onClick={() => setOpen(false)}>‹</button>
            <span className="cw-header-title">Customer Support</span>
            <div className="cw-menu-wrap" ref={menuRef}>
              <button className="cw-menu-btn" onClick={() => setMenu(m => !m)}>☰</button>
              {menu && (
                <div className="cw-menu">
                  <div className="cw-menu-item">✎ Change Name</div>
                  <div className="cw-menu-item">✉ Email transcript</div>
                  <div className="cw-menu-item">🔊 Sound On</div>
                  <div className="cw-menu-item">⬡ Pop out widget</div>
                  <div className="cw-menu-item">＋ Add Chat to your website</div>
                </div>
              )}
            </div>
          </div>

          <div className="cw-body">
            <div className="cw-msg agent">
              <div className="cw-avatar">
                <svg viewBox="0 0 24 24" fill="#888" width="22" height="22">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div className="cw-bubble agent">👋 Hi! How can we help?</div>
            </div>

            {messages.map(m => (
              <div key={m.id} className={`cw-msg ${m.role}`}>
                {m.role === 'agent' && (
                  <div className="cw-avatar">
                    <svg viewBox="0 0 24 24" fill="#888" width="22" height="22">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                )}
                <div className={`cw-bubble ${m.role}`}>{m.text}</div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="cw-quick-replies">
                <button className="cw-quick-btn" onClick={() => setInput('I have a question')}>I have a question</button>
                <button className="cw-quick-btn" onClick={() => setInput('Tell me more')}>Tell me more</button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="cw-footer">
            <input
              className="cw-input"
              placeholder="Type here and press enter..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <div className="cw-footer-icons">
              <button className="cw-icon-btn">☺</button>
              <button className="cw-icon-btn">📎</button>
              <button className="cw-icon-btn send" onClick={sendMessage}>➤</button>
            </div>
          </div>
        </div>
      )}

      <button className="cw-bubble-btn" onClick={() => setOpen(o => !o)}>
        {open
          ? <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        }
        {!open && unread > 0 && <span className="cw-badge">{unread}</span>}
        {!open && <span className="cw-label">We Are Here!</span>}
      </button>
    </div>
  )
}