import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DashNav from '../components/DashNav'
import { useTicker, CRYPTO_DATA } from '../hooks/useTicker'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '../supabase'
import './Dashboard.css'

const WALLET_ADDRESSES = {
  BTC:  'bc1qq59rs336fth00xz2putnh2cp1ufwmnvdy9kdc8',
  USDT: 'TDaZCfmg5cYEWPgHehwy5XWJrvrpW63yJ7',
}

const generateSparkline = (base, n = 20) => {
  let v = base
  return Array.from({ length: n }, () => {
    v = v * (1 + (Math.random() - 0.49) * 0.02)
    return { v: +v.toFixed(2) }
  })
}

// ── SHARED HOOK: real-time balance for the logged-in user ──────────────
export function useBalance() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setBalance(0); setLoading(false); return }

    supabase
      .from('balances')
      .select('amount')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setBalance(data?.amount ?? 0)
        setLoading(false)
      })

    const channel = supabase
      .channel(`balance-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'balances', filter: `user_id=eq.${user.id}` },
        payload => setBalance(payload.new?.amount ?? 0)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  return { balance, loading }
}

function SparkLine({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
          formatter={v => [`$${Number(v).toLocaleString()}`, '']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function CryptoCard({ coin }) {
  const spark = generateSparkline(coin.price)
  const color = coin.change >= 0 ? '#16a34a' : '#ff4d6a'
  const value = (coin.price * coin.amount).toFixed(2)
  const now   = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="crypto-card card">
      <div className="cc-header">
        <div className="cc-icon" style={{ background: coin.color + '22', color: coin.color }}>
          {coin.symbol.slice(0, 1)}
        </div>
        <div className="cc-meta">
          <div className="cc-symbol">{coin.symbol}</div>
        </div>
        <div className={`cc-change ${coin.change >= 0 ? 'up' : 'down'}`}>
          {coin.change >= 0 ? '+' : ''}{coin.change}%
        </div>
      </div>
      <div className="cc-price font-mono">${coin.price.toLocaleString()}</div>
      <div className="cc-amount-row">Amount: {coin.amount} {coin.symbol}</div>
      <div className="cc-value-row">Value: <strong>${Number(value).toLocaleString()}</strong></div>
      <SparkLine data={spark} color={color} />
      <div className="cc-footer">
        <button className="cc-trade-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Trade
        </button>
        <span className="cc-updated">Last updated: {now}</span>
      </div>
    </div>
  )
}

// ── DEPOSIT PAGE ───────────────────────────────────────────────────────
function DepositPage({ onBack }) {
  const [tab,    setTab]    = useState('crypto')
  const [coin,   setCoin]   = useState('BTC')
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(WALLET_ADDRESSES[coin])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="subpage">
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      <div className="subpage-header">
        <h1 className="subpage-title">Fund Your Account</h1>
        <p className="subpage-sub">Choose your preferred deposit method below</p>
      </div>
      <div className="fund-container">
        <div className="fund-tabs">
          <button className={`fund-tab ${tab === 'crypto' ? 'active' : ''}`} onClick={() => setTab('crypto')}>🪙 Crypto</button>
          <button className={`fund-tab ${tab === 'card'   ? 'active' : ''}`} onClick={() => setTab('card')}>💳 Card</button>
        </div>
        {tab === 'crypto' && (<>
          <div className="coin-grid">
            {[
              { id: 'BTC',  label: 'Bitcoin', icon: '₿', bg: '#f7931a' },
              { id: 'USDT', label: 'USDT',    icon: '₮', bg: '#26a17b' },
            ].map(c => (
              <button key={c.id} className={`coin-btn ${coin === c.id ? 'active' : ''}`} onClick={() => setCoin(c.id)}>
                <span className="coin-icon" style={{ background: c.bg }}>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <div className="fund-field">
            <label>Amount (USD)</label>
            <input className="fund-input" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="wallet-box">
            <h3>{coin === 'BTC' ? 'Bitcoin' : 'USDT (TRC20)'} Wallet Address</h3>
            <div className="wallet-addr font-mono">{WALLET_ADDRESSES[coin]}</div>
            <button className="copy-btn" onClick={copy}>{copied ? '✓ Copied!' : 'Copy Address'}</button>
            <p className="wallet-note">Send the exact amount to this address and your account will be credited automatically.</p>
          </div>
        </>)}
        {tab === 'card' && (
          <div className="coming-soon"><span>💳</span><p>Card payments coming soon.</p></div>
        )}
      </div>
    </div>
  )
}

// ── WITHDRAW PAGE ──────────────────────────────────────────────────────
const WITHDRAW_COINS = [
  { id: 'BTC',  label: 'Bitcoin',  icon: '₿', bg: '#f7931a' },
  { id: 'USDT', label: 'USDT',     icon: '₮', bg: '#26a17b' },
  { id: 'ETH',  label: 'Ethereum', icon: 'Ξ', bg: '#627eea' },
]
const WITHDRAW_PLACEHOLDERS = {
  BTC:  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  USDT: 'TQn9Y2khEsLJW1ChVTQQugS4TnxaHm6Ft5',
  ETH:  '0x742d35Cc6634C0532925a3b8D4C9E2C4e8b1A2c3',
}

function WithdrawPage({ onBack, balance }) {
  const { user } = useAuth()
  const [coin,       setCoin]       = useState('BTC')
  const [amount,     setAmount]     = useState('')
  const [addr,       setAddr]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState(null)
  const [pending,    setPending]    = useState([])

  useEffect(() => {
    if (!user) return
    supabase.from('withdrawals').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setPending(data || []))

    const channel = supabase.channel(`withdrawals-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${user.id}`,
      }, () => {
        supabase.from('withdrawals').select('*')
          .eq('user_id', user.id).order('created_at', { ascending: false })
          .then(({ data }) => setPending(data || []))
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function handleWithdraw() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0)  { setError('Enter a valid amount.'); return }
    if (amt > balance)     { setError('Amount exceeds your available balance.'); return }
    if (!addr.trim())      { setError('Enter a wallet address.'); return }
    setError(null); setSubmitting(true)
    const { error: err } = await supabase.from('withdrawals').insert({
      user_id: user.id, user_email: user.email,
      user_name: user.user_metadata?.full_name || null,
      amount: amt, coin, address: addr.trim(), status: 'pending',
    })
    setSubmitting(false)
    if (err) { setError(err.message); return }
    setSubmitted(true); setAmount(''); setAddr('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  const fmt = n => `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  return (
    <div className="subpage">
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      <div className="subpage-header">
        <h1 className="subpage-title">Withdraw Funds</h1>
        <p className="subpage-sub">Choose your preferred withdrawal method below</p>
      </div>
      <div className="balance-card">
        <div className="balance-amount font-mono">{fmt(balance)}</div>
        <div className="balance-label">Available Balance</div>
      </div>
      <div className="fund-container">
        <div className="fund-tabs single"><button className="fund-tab active">🪙 Crypto</button></div>
        <div className="coin-grid three">
          {WITHDRAW_COINS.map(c => (
            <button key={c.id} className={`coin-btn ${coin === c.id ? 'active' : ''}`} onClick={() => setCoin(c.id)}>
              <span className="coin-icon" style={{ background: c.bg }}>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <div className="fund-field">
          <label>Amount (USD)</label>
          <input className="fund-input" type="number" placeholder="100" value={amount}
            onChange={e => { setAmount(e.target.value); setError(null) }} />
        </div>
        <div className="fund-field">
          <label>Your Wallet Address</label>
          <input className="fund-input" type="text" placeholder={WITHDRAW_PLACEHOLDERS[coin]} value={addr}
            onChange={e => { setAddr(e.target.value); setError(null) }} />
        </div>
        {error && (
          <div style={{ background:'#ff4d6a18', border:'1px solid #ff4d6a55', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#ff4d6a', marginBottom:8 }}>
            ⚠️ {error}
          </div>
        )}
        {submitted && (
          <div style={{ background:'#16a34a18', border:'1px solid #16a34a55', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#16a34a', marginBottom:8 }}>
            ✓ Withdrawal request submitted! We'll process it shortly.
          </div>
        )}
        <button className="withdraw-submit"
          disabled={!amount || !addr || submitting || parseFloat(amount) > balance}
          onClick={handleWithdraw}>
          {submitting ? 'Submitting…' : 'Withdraw'}
        </button>
      </div>
      <div className="pending-section">
        <h2 className="pending-title">Pending Withdrawals</h2>
        {pending.length === 0 ? (
          <div className="pending-empty card"><span>📬</span><p>No pending withdrawals found.</p></div>
        ) : (
          <div className="pending-list">
            {pending.map(w => (
              <div key={w.id} className="pending-item card">
                <div className="pending-item-left">
                  <div className="pending-coin">{w.coin}</div>
                  <div className="pending-addr">{w.address.slice(0, 16)}…</div>
                  <div className="pending-date">
                    {new Date(w.created_at).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
                <div className="pending-item-right">
                  <div className="pending-amount">{fmt(w.amount)}</div>
                  <span className={`status-badge ${w.status}`}>{w.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────
export default function Dashboard() {
  const pairs = useTicker()
  const { balance, loading: balanceLoading } = useBalance()
  const [page,          setPage]          = useState('home')
  const [priceSource,   setPriceSource]   = useState('Binance')
  const [fetchingLabel, setFetchingLabel] = useState('')

  const fmt = n => `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  function handleRefreshPrices() {
    setFetchingLabel('Fetching CoinGecko...')
    setTimeout(() => { setFetchingLabel(''); setPriceSource('Binance') }, 2000)
  }

  return (
    <div className="dash-layout">
      <DashNav />
      <div className="dash-main">
        <div className="dash-content">

          {page === 'deposit'  && <DepositPage onBack={() => setPage('home')} />}
          {page === 'withdraw' && <WithdrawPage onBack={() => setPage('home')} balance={balance ?? 0} />}

          {page === 'home' && <>
            {/* Portfolio */}
            <div className="portfolio-card card">
              <div className="portfolio-label">REAL PORTFOLIO</div>
              <div className="portfolio-value font-mono">
                {balanceLoading ? '...' : fmt(balance)}
              </div>
              <div className="portfolio-change up">↑ +0.00%</div>
              <div className="portfolio-actions">
                <button className="btn-primary" onClick={() => setPage('deposit')}>Deposit</button>
                <button className="btn-outline" onClick={() => setPage('withdraw')}>Withdraw</button>
              </div>
            </div>

            {/* Watchlist + Crypto */}
            <div className="dash-grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Watchlist</h3>
                  <button className="see-all">See All</button>
                </div>
                <div className="watchlist">
                  {pairs.slice(0, 3).map(p => (
                    <div key={p.symbol} className="watch-row">
                      <div className="watch-icon" style={{
                        background: p.change >= 0 ? '#16a34a22' : '#ff4d6a22',
                        color:      p.change >= 0 ? '#16a34a'   : '#ff4d6a',
                      }}>
                        {p.symbol.split('/')[0].slice(0, 3)}
                      </div>
                      <div className="watch-info">
                        <span className="watch-symbol">{p.symbol.split('/')[0]}</span>
                        <span className="watch-name">{p.name || p.symbol.split('/')[0]}</span>
                      </div>
                      <div className="watch-right">
                        <span className="watch-price font-mono">
                          ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`watch-change ${p.change >= 0 ? 'up' : 'down'}`}>
                          {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="watchlist-footer">
                  <span className="coingecko-label">{fetchingLabel || `Using: ${priceSource}`}</span>
                  <button className="refresh-prices-btn" onClick={handleRefreshPrices} disabled={!!fetchingLabel}>
                    {fetchingLabel ? 'Refreshing...' : 'Refresh Prices'}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Your Crypto</h3>
                  <button className="see-all">See All</button>
                </div>
                <div className="crypto-mini-grid">
                  {CRYPTO_DATA.map(coin => <CryptoCard key={coin.id} coin={coin} />)}
                </div>
                <button className="refresh-all-btn">Refresh All Prices</button>
              </div>
            </div>
          </>}

        </div>
      </div>
    </div>
  )
}