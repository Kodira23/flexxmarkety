import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import './Admin.css'

const TABS = ['👥 Users', '💬 Chats', '💰 Balances', '📤 Withdrawals']

export default function Admin() {
  const [tab, setTab] = useState(0)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    async function checkSession() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (!user) {
        setDebugInfo({ loggedIn: false, authErr: authErr?.message })
        return
      }
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      setDebugInfo({
        loggedIn: true,
        email: user.email,
        id: user.id,
        role: profile?.role ?? 'NO PROFILE ROW FOUND',
        profileErr: profileErr?.message,
      })
    }
    checkSession()
  }, [])

  return (
    <div className="admin-layout">
      {debugInfo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: debugInfo.role === 'admin' ? '#16a34a' : '#ff4d6a',
          color: '#fff', padding: '10px 16px', fontSize: 13, fontFamily: 'monospace',
        }}>
          {debugInfo.loggedIn
            ? `Logged in as: ${debugInfo.email} (${debugInfo.id}) — role: ${debugInfo.role}${debugInfo.profileErr ? ' | profile error: ' + debugInfo.profileErr : ''}`
            : `⚠️ NOT LOGGED IN — no active session${debugInfo.authErr ? ' (' + debugInfo.authErr + ')' : ''}`}
        </div>
      )}

      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">⬡ Admin Panel</div>
        </div>
        <nav className="admin-nav">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`admin-nav-btn ${tab === i ? 'active' : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-main">
        {tab === 0 && <UsersPanel />}
        {tab === 1 && <ChatsPanel />}
        {tab === 2 && <BalancesPanel />}
        {tab === 3 && <WithdrawalsPanel />}
      </div>
    </div>
  )
}

// ── ERROR BOX ──────────────────────────────────────────────────────────
function ErrorBox({ title, message, hint, onRetry }) {
  return (
    <div style={{
      background: '#ff4d6a18', border: '1px solid #ff4d6a55', borderRadius: 10,
      padding: '16px 20px', margin: '16px 0', color: 'var(--text, #fff)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ {title}</div>
      <div style={{ fontSize: 13, opacity: 0.85, marginBottom: hint ? 8 : 0 }}>{message}</div>
      {hint && (
        <div style={{
          fontSize: 12, opacity: 0.65, background: '#0004', borderRadius: 6,
          padding: '8px 12px', marginBottom: onRetry ? 10 : 0,
        }}>{hint}</div>
      )}
      {onRetry && (
        <button className="btn-edit" onClick={onRetry} style={{ marginTop: 4 }}>↺ Retry</button>
      )}
    </div>
  )
}

// ── USERS PANEL ────────────────────────────────────────────────────────
function UsersPanel() {
  const [users,      setUsers]      = useState([])
  const [statusMap,  setStatusMap]  = useState({})
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [toggling,   setToggling]   = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)

    const [{ data: usersData, error: usersErr }, { data: statusData }] = await Promise.all([
      supabase.from('admin_users').select('*').order('created_at', { ascending: false }),
      supabase.from('user_status').select('user_id, is_active'),
    ])

    setLoading(false)
    if (usersErr) { setError(usersErr.message); return }

    setUsers(usersData || [])
    const map = {}
    ;(statusData || []).forEach(s => { map[s.user_id] = s.is_active })
    setStatusMap(map)
  }

  async function toggleActive(user) {
    const currentlyActive = statusMap[user.id] !== false
    const newValue = !currentlyActive
    setToggling(user.id)

    const { error } = await supabase.from('user_status').upsert(
      { user_id: user.id, is_active: newValue, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    setToggling(null)
    if (error) {
      alert('Could not update status: ' + error.message)
      return
    }
    setStatusMap(prev => ({ ...prev, [user.id]: newValue }))
  }

  const filtered = users.filter(u =>
    (u.email     || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h2 className="admin-section-title">All Users</h2>
        <span className="admin-count">{users.length} registered</span>
      </div>

      <input className="admin-search full-w" placeholder="Search by name or email…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading && <div className="admin-empty-state"><p>Loading users…</p></div>}

      {error && (
        <ErrorBox
          title="Cannot load users"
          message={error}
          hint="Make sure you have run the CREATE VIEW public.admin_users SQL in the Supabase SQL Editor and granted SELECT to authenticated/anon roles."
          onRetry={fetchAll}
        />
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="admin-empty-state"><span>👥</span><p>No users found.</p></div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="balances-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th>
                <th>Registered</th><th>Last Login</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const isActive = statusMap[u.id] !== false
                return (
                  <tr key={u.id} style={{ opacity: isActive ? 1 : 0.55 }}>
                    <td className="td-date">{idx + 1}</td>
                    <td>{u.full_name || <span style={{ opacity: 0.4 }}>—</span>}</td>
                    <td className="td-email">{u.email}</td>
                    <td className="td-date">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="td-date">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString([], {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : <span style={{ opacity: 0.4 }}>Never</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${isActive ? 'approved' : 'rejected'}`}>
                        {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={isActive ? 'btn-reject' : 'btn-approve'}
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        disabled={toggling === u.id}
                        onClick={() => toggleActive(u)}
                      >
                        {toggling === u.id ? '…' : isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── CHATS PANEL ────────────────────────────────────────────────────────
function ChatsPanel() {
  const [chats,      setChats]      = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages,   setMessages]   = useState([])
  const [reply,      setReply]      = useState('')
  const [search,     setSearch]     = useState('')
  const [chatError,  setChatError]  = useState(null)
  const [msgError,   setMsgError]   = useState(null)
  const [sendError,  setSendError]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const bottomRef = useRef(null)

  const RLS_HINT = 'Go to Supabase → Table Editor → select the table → RLS Policies → add a policy allowing SELECT for authenticated users. Or disable RLS on the chats/messages tables temporarily.'

  useEffect(() => {
    fetchChats()
    const channel = supabase
      .channel('admin-chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, fetchChats)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchChats() {
    setLoading(true)
    setChatError(null)
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })
    setLoading(false)
    if (error) setChatError(error.message)
    else setChats(data || [])
  }

  useEffect(() => {
    if (!activeChat) return
    setMessages([])
    setMsgError(null)

    supabase.from('messages').select('*')
      .eq('chat_id', activeChat.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setMsgError(error.message)
        else setMessages(data || [])
      })

    const channel = supabase
      .channel(`admin-msg-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `chat_id=eq.${activeChat.id}`,
      }, payload => setMessages(prev => [...prev, payload.new]))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [activeChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendReply() {
    const text = reply.trim()
    if (!text || !activeChat) return
    setSendError(null)
    setReply('')
    const { error } = await supabase.from('messages').insert({
      chat_id: activeChat.id, text, role: 'agent', seen_by_user: false,
    })
    if (error) {
      setSendError(error.message)
      setReply(text)
      return
    }
    await supabase.from('chats').update({
      last_message: text, updated_at: new Date().toISOString(),
    }).eq('id', activeChat.id)
  }

  const filtered = chats.filter(c =>
    (c.user_name  || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.user_email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="chats-layout">
      <div className="chats-list-col">
        <div className="chats-list-header">
          <span className="admin-section-title">Support Inbox</span>
          <span className="admin-count">{chats.length}</span>
        </div>
        <input className="admin-search" placeholder="Search users..."
          value={search} onChange={e => setSearch(e.target.value)} />

        {chatError && (
          <div style={{ padding: '0 8px' }}>
            <ErrorBox title="Cannot load chats" message={chatError} hint={RLS_HINT} onRetry={fetchChats} />
          </div>
        )}

        <div className="admin-chat-list">
          {loading && !chatError && <div className="admin-empty-list">Loading…</div>}
          {!loading && !chatError && filtered.length === 0 &&
            <div className="admin-empty-list">No conversations yet</div>}
          {filtered.map(chat => (
            <div key={chat.id}
              className={`admin-chat-row ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="admin-chat-avatar">
                {(chat.user_name || chat.user_email || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="admin-chat-info">
                <div className="admin-chat-name">{chat.user_name || chat.user_email || chat.id}</div>
                <div className="admin-chat-last">{chat.last_message || 'No messages'}</div>
              </div>
              <div className="admin-chat-dot" />
            </div>
          ))}
        </div>
      </div>

      <div className="chats-thread-col">
        {!activeChat ? (
          <div className="admin-no-chat">
            <div className="admin-no-chat-icon">💬</div>
            <p>Select a conversation to start replying</p>
          </div>
        ) : (
          <>
            <div className="admin-chat-header">
              <div className="admin-chat-avatar lg">
                {(activeChat.user_name || activeChat.user_email || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="admin-chat-name">{activeChat.user_name || activeChat.user_email}</div>
                <div className="admin-chat-email">{activeChat.user_email}</div>
              </div>
              <div className="admin-online-badge">● Online</div>
            </div>

            <div className="admin-messages">
              {msgError && (
                <div style={{ padding: '12px 16px' }}>
                  <ErrorBox title="Cannot load messages" message={msgError} hint={RLS_HINT} />
                </div>
              )}
              {!msgError && messages.length === 0 &&
                <div className="admin-no-msgs">No messages yet.</div>}
              {messages.map(m => (
                <div key={m.id} className={`admin-msg ${m.role}`}>
                  <div className={`admin-bubble ${m.role}`}>{m.text}</div>
                  <div className="admin-msg-time">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {sendError && (
              <div style={{ padding: '0 12px' }}>
                <ErrorBox title="Failed to send message" message={sendError} hint={RLS_HINT} />
              </div>
            )}

            <div className="admin-reply-box">
              <textarea className="admin-reply-input" rows={2}
                placeholder="Type your reply and press Enter..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
                }}
              />
              <button className="admin-send-btn" onClick={sendReply} disabled={!reply.trim()}>
                Send ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── BALANCES PANEL ─────────────────────────────────────────────────────
function BalancesPanel() {
  const [rows,      setRows]      = useState([])
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel('admin-balances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'balances' }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchAll() {
    setLoading(true)

    const { data: users } = await supabase
      .from('admin_users')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })

    const { data: balances } = await supabase.from('balances').select('*')

    const balanceMap = {}
    ;(balances || []).forEach(b => { balanceMap[b.user_id] = b })

    const merged = (users || []).map(u => ({
      user_id:    u.id,
      user_email: u.email,
      user_name:  u.full_name || null,
      amount:     balanceMap[u.id]?.amount ?? 0,
      updated_at: balanceMap[u.id]?.updated_at ?? u.created_at,
      has_row:    !!balanceMap[u.id],
    }))

    setRows(merged)
    setLoading(false)
  }

  async function saveBalance() {
    if (!editing) return
    const newAmount = parseFloat(editing.amount)
    if (isNaN(newAmount)) { setSaveError('Please enter a valid number.'); return }

    setSaving(true)
    setSaveError(null)
    const now = new Date().toISOString()
    let error

    if (editing.has_row) {
      ;({ error } = await supabase
        .from('balances')
        .update({ amount: newAmount, updated_at: now })
        .eq('user_id', editing.user_id))
    } else {
      ;({ error } = await supabase
        .from('balances')
        .insert({ user_id: editing.user_id, amount: newAmount, updated_at: now }))
    }

    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setEditing(null)
    fetchAll()
  }

  const filtered = rows.filter(r =>
    (r.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.user_name  || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h2 className="admin-section-title">User Balances</h2>
        <span className="admin-count">{rows.length} users</span>
      </div>

      <input className="admin-search full-w" placeholder="Search by name or email…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {saveError && (
        <ErrorBox
          title="Could not save balance"
          message={saveError}
          hint="Check that your balances table has a user_id column and that RLS policies allow INSERT/UPDATE for admins."
        />
      )}

      {loading && <div className="admin-empty-state"><p>Loading…</p></div>}
      {!loading && filtered.length === 0 && (
        <div className="admin-empty-state"><span>💰</span><p>No users found.</p></div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="balances-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th><th>Email</th>
                <th>Balance (USD)</th><th>Last Updated</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.user_id}>
                  <td>{b.user_name || <span style={{ opacity: 0.4 }}>—</span>}</td>
                  <td className="td-email">{b.user_email}</td>
                  <td>
                    {editing?.user_id === b.user_id ? (
                      <input
                        className="inline-input"
                        type="number"
                        step="0.01"
                        value={editing.amount}
                        onChange={e => setEditing({ ...editing, amount: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && saveBalance()}
                        autoFocus
                      />
                    ) : (
                      <span className={`balance-amount ${b.amount === 0 ? 'zero' : ''}`}>
                        ${Number(b.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>
                  <td className="td-date">
                    {b.updated_at ? new Date(b.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {editing?.user_id === b.user_id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-save" onClick={saveBalance} disabled={saving}>
                          {saving ? '…' : 'Save'}
                        </button>
                        <button className="btn-cancel-sm"
                          onClick={() => { setEditing(null); setSaveError(null) }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="btn-edit" onClick={() =>
                        setEditing({
                          user_id:    b.user_id,
                          user_email: b.user_email,
                          user_name:  b.user_name,
                          amount:     b.amount,
                          has_row:    b.has_row,
                        })
                      }>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── WITHDRAWALS PANEL ──────────────────────────────────────────────────
function WithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState([])
  const [filter,      setFilter]      = useState('all')
  const [error,       setError]       = useState(null)
  const [processing,  setProcessing]  = useState(null)

  useEffect(() => {
    fetchWithdrawals()
    const channel = supabase
      .channel('admin-withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchWithdrawals)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchWithdrawals() {
    setError(null)
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setWithdrawals(data || [])
  }

  async function approveWithdrawal(w) {
    setProcessing(w.id)
    const now = new Date().toISOString()

    const { data: balRow, error: balErr } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', w.user_id)
      .single()

    if (balErr && balErr.code !== 'PGRST116') {
      alert('Could not fetch balance: ' + balErr.message)
      setProcessing(null)
      return
    }

    const currentAmount = balRow?.amount ?? 0
    const withdrawAmount = Number(w.amount)

    if (currentAmount < withdrawAmount) {
      alert(
        `Insufficient balance.\n\n` +
        `User balance: $${currentAmount.toFixed(2)}\n` +
        `Withdrawal: $${withdrawAmount.toFixed(2)}\n\n` +
        `Approve anyway?`
      )
    }

    const newAmount = Math.max(0, currentAmount - withdrawAmount)

    const { error: upsertErr } = await supabase
      .from('balances')
      .upsert(
        { user_id: w.user_id, amount: newAmount, updated_at: now },
        { onConflict: 'user_id' }
      )

    if (upsertErr) {
      alert('Failed to update balance: ' + upsertErr.message)
      setProcessing(null)
      return
    }

    const { error: statusErr } = await supabase
      .from('withdrawals')
      .update({ status: 'approved', updated_at: now })
      .eq('id', w.id)

    if (statusErr) alert('Balance updated but withdrawal status failed: ' + statusErr.message)
    setProcessing(null)
  }

  async function rejectWithdrawal(id) {
    setProcessing(id)
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) alert('Rejection failed: ' + error.message)
    setProcessing(null)
  }

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter)

  const counts = {
    all:      withdrawals.length,
    pending:  withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
  }

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h2 className="admin-section-title">Withdrawal Requests</h2>
        <span className="admin-count">{counts.pending} pending</span>
      </div>

      {error && (
        <ErrorBox title="Cannot load withdrawals" message={error}
          hint="Check RLS policies on the withdrawals table." onRetry={fetchWithdrawals} />
      )}

      <div className="filter-tabs">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {!error && filtered.length === 0 && (
        <div className="admin-empty-state">
          <span>📤</span>
          <p>No {filter === 'all' ? '' : filter} withdrawal requests yet.</p>
        </div>
      )}

      <div className="withdrawals-list">
        {filtered.map(w => (
          <div key={w.id} className="withdrawal-card">
            <div className="wc-left">
              <div className="wc-user">
                <div className="admin-chat-avatar sm">
                  {(w.user_name || w.user_email || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="wc-name">{w.user_name || w.user_email}</div>
                  <div className="wc-email">{w.user_email}</div>
                </div>
              </div>
              <div className="wc-details">
                <div className="wc-amount">
                  ${Number(w.amount).toLocaleString()} <span className="wc-coin">{w.coin}</span>
                </div>
                <div className="wc-addr">{w.address}</div>
                <div className="wc-date">{new Date(w.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="wc-right">
              <span className={`status-badge ${w.status}`}>{w.status}</span>
              {w.status === 'pending' && (
                <div className="wc-actions">
                  <button
                    className="btn-approve"
                    disabled={processing === w.id}
                    onClick={() => approveWithdrawal(w)}
                  >
                    {processing === w.id ? '…' : 'Approve'}
                  </button>
                  <button
                    className="btn-reject"
                    disabled={processing === w.id}
                    onClick={() => rejectWithdrawal(w.id)}
                  >
                    {processing === w.id ? '…' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
