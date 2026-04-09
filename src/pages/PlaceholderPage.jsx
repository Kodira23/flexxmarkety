import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import DashNav from '../components/DashNav'
import { useTicker } from '../hooks/useTicker'
import { supabase } from '../supabase'
import { useBalance } from './Dashboard'
import './PlaceholderPage.css'

const MIN_BALANCE = 50

// ── BOT DEFINITIONS — drift doubled from original ──────────────────────
const BOT_CONFIGS = [
  {
    id: 1,
    name: 'Bitcoin Accumulation',
    subtitle: 'Weekly • DCA',
    description: 'Dollar-cost averaging into Bitcoin on a weekly basis.',
    risk: 'Low',
    interval: 2000,    // fast: trade every 2s
    drift: 0.008,
    volatility: 0.012,
  },
  {
    id: 2,
    name: 'ETH DCA Pro',
    subtitle: 'Daily • DCA',
    description: 'Dynamic DCA based on RSI and volume indicators.',
    risk: 'Medium',
    interval: 1500,    // fast: trade every 1.5s
    drift: 0.014,
    volatility: 0.025,
  },
]

function InsufficientBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff4d6a22, #ff4d6a08)',
      border: '1px solid #ff4d6a66',
      borderRadius: 14,
      padding: '20px 24px',
      marginBottom: 28,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#ff4d6a', marginBottom: 4 }}>
          Insufficient Balance
        </div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          You need a minimum of <strong>${MIN_BALANCE}.00</strong> to configure and run trading bots.
          Please deposit funds to get started.
        </div>
      </div>
    </div>
  )
}

function BotCard({ bot, balance, userId }) {
  const canRun       = balance >= MIN_BALANCE
  const [active,     setActive]     = useState(false)
  const [configured, setConfigured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [allocation, setAllocation] = useState('')
  const [log,        setLog]        = useState([])
  const [pnl,        setPnl]        = useState(0)
  const [ticks,      setTicks]      = useState(0)
  const intervalRef  = useRef(null)
  const allocatedRef = useRef(0)

  useEffect(() => () => clearInterval(intervalRef.current), [])

  function addLog(msg, color = '#aaa') {
    setLog(prev => [
      { msg, color, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      ...prev,
    ].slice(0, 8))
  }

  async function applyDelta(delta) {
    const { data } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', userId)
      .maybeSingle()

    const current = data?.amount ?? 0
    const next    = Math.max(0, parseFloat((current + delta).toFixed(2)))

    await supabase
      .from('balances')
      .update({ amount: next, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    return delta
  }

  function tick() {
    // 75% win rate → profits 3x more frequent than losses
    const isWin  = Math.random() < 0.75
    const mag    = Math.random() * bot.volatility + bot.drift
    const r      = isWin ? Math.abs(mag) : -Math.abs(mag) * 0.4  // losses smaller too
    const stake  = allocatedRef.current * 0.1
    const gained = parseFloat((stake * r).toFixed(2))

    applyDelta(gained).then(() => {
      setPnl(prev => parseFloat((prev + gained).toFixed(2)))
      setTicks(t => t + 1)
      addLog(
        `${isWin ? '↑' : '↓'} Trade ${isWin ? '+' : ''}$${gained.toFixed(2)} (${(r * 100).toFixed(2)}%)`,
        isWin ? '#16a34a' : '#ff4d6a'
      )
    })
  }

  function handleConfigure() {
    if (!canRun) return
    setShowConfig(v => !v)
  }

  async function handleStart() {
    if (!canRun || !configured) return
    if (active) {
      clearInterval(intervalRef.current)
      setActive(false)
      addLog('🛑 Bot stopped', '#ffaa00')
      return
    }

    const alloc = parseFloat(allocation)
    if (!alloc || alloc < 10) { addLog('⚠️ Set allocation ≥ $10 first', '#ff4d6a'); return }
    if (alloc > balance)      { addLog('⚠️ Allocation exceeds balance', '#ff4d6a'); return }

    allocatedRef.current = alloc
    setActive(true)
    addLog(`🚀 Bot started with $${alloc.toFixed(2)} allocation`, '#16a34a')
    intervalRef.current = setInterval(tick, bot.interval)
  }

  function handleSaveConfig() {
    const alloc = parseFloat(allocation)
    if (!alloc || alloc < 10) { addLog('⚠️ Enter allocation ≥ $10', '#ff4d6a'); return }
    if (alloc > balance)      { addLog('⚠️ Allocation exceeds balance', '#ff4d6a'); return }
    setConfigured(true)
    setShowConfig(false)
    addLog(`✅ Configured — $${alloc.toFixed(2)} allocated`, '#16a34a')
  }

  const statusLabel = active ? 'Running' : configured ? 'Ready' : 'Not Configured'
  const statusColor = active ? '#16a34a' : configured ? '#ffaa00' : '#888'

  return (
    <div className="bot-card" style={{ opacity: canRun ? 1 : 0.55 }}>
      {/* Header */}
      <div className="bot-card-top">
        <div>
          <div className="bot-name">{bot.name}</div>
          <div className="bot-subtitle">{bot.subtitle}</div>
        </div>
        <div className="bot-status-badge" style={{
          background: statusColor + '22',
          color: statusColor,
          border: `1px solid ${statusColor}55`,
        }}>
          {active && <span style={{ marginRight: 5 }}>●</span>}{statusLabel}
        </div>
      </div>

      <p className="bot-desc">{bot.description}</p>

      {/* Stats */}
      <div className="bot-meta">
        <div className="bot-meta-item">
          <span className="bot-meta-label">Risk:</span>
          <span className={`bot-meta-value risk-${bot.risk.toLowerCase()}`}>{bot.risk}</span>
        </div>
        <div className="bot-meta-item">
          <span className="bot-meta-label">P&L:</span>
          <span className="bot-meta-value" style={{ color: pnl >= 0 ? '#16a34a' : '#ff4d6a', fontWeight: 700 }}>
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
          </span>
        </div>
        <div className="bot-meta-item">
          <span className="bot-meta-label">Trades:</span>
          <span className="bot-meta-value">{ticks}</span>
        </div>
        {configured && (
          <div className="bot-meta-item">
            <span className="bot-meta-label">Allocation:</span>
            <span className="bot-meta-value">${parseFloat(allocation || 0).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Config panel */}
      {showConfig && (
        <div style={{
          background: '#ffffff08', border: '1px solid #ffffff15',
          borderRadius: 10, padding: '14px 16px', margin: '10px 0',
        }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
            Available balance: <strong>${Number(balance).toFixed(2)}</strong>
          </div>
          <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 6 }}>
            Allocation amount (USD)
          </label>
          <input
            type="number"
            min="10"
            max={balance}
            placeholder="e.g. 100"
            value={allocation}
            onChange={e => setAllocation(e.target.value)}
            style={{
              width: '100%', background: '#ffffff10', border: '1px solid #ffffff20',
              borderRadius: 8, padding: '8px 12px', color: 'inherit',
              fontSize: 14, marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bot-btn-start-active" onClick={handleSaveConfig} style={{ flex: 1 }}>Save</button>
            <button className="bot-btn-configure"    onClick={() => setShowConfig(false)} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Trade log */}
      {log.length > 0 && (
        <div style={{
          background: '#000000aa', borderRadius: 8, padding: '8px 12px',
          margin: '8px 0', maxHeight: 120, overflowY: 'auto',
          fontFamily: 'monospace', fontSize: 11,
        }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.color, marginBottom: 2 }}>
              <span style={{ opacity: 0.45, marginRight: 6 }}>{l.ts}</span>{l.msg}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="bot-actions">
        <button
          className="bot-btn-configure"
          onClick={handleConfigure}
          disabled={!canRun || active}
          title={!canRun ? `Need $${MIN_BALANCE}+ balance` : ''}
        >
          {showConfig ? 'Close Config' : 'Configure'}
        </button>

        {/* Start / Stop — highly visible */}
        <button
          className={active ? 'bot-btn-stop' : 'bot-btn-start-active'}
          onClick={handleStart}
          disabled={!canRun || !configured}
          title={!canRun ? `Need $${MIN_BALANCE}+ balance` : !configured ? 'Configure first' : ''}
        >
          {active
            ? `⏹ Stop ${bot.name.split(' ')[0]} Bot`
            : `▶ Start ${bot.name.split(' ')[0]} Bot`}
        </button>
      </div>
    </div>
  )
}

function PlaceholderPage({ title, icon, description }) {
  return (
    <div className="dash-layout">
      <DashNav />
      <div className="dash-main">
        <div className="placeholder-content">
          <div className="placeholder-card card">
            <div className="ph-icon">{icon}</div>
            <h2 className="ph-title">{title}</h2>
            <p className="ph-desc">{description}</p>
            <div className="ph-badge">Coming Soon</div>
          </div>
        </div>
      </div>
      <TawkChat />
    </div>
  )
}

export function MarketsPage() {
  const pairs = useTicker()
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [selectedPair,   setSelectedPair]   = useState(null)

  const handleTrade = symbol => {
    const tv = symbol.includes('/') ? `FX:${symbol.replace('/', '')}` : symbol
    setSelectedSymbol(tv)
    setSelectedPair(symbol)
  }

  return (
    <div className="dash-layout">
      <DashNav />
      <div className="dash-main">
        <div className="markets-layout">
          <div className="markets-sidebar">
            <div className="markets-sidebar-header">
              <h2>Markets</h2>
              <span className="live-dot-badge"><span className="live-dot" />LIVE</span>
            </div>
            <div className="markets-list">
              {pairs.map(p => (
                <div key={p.symbol}
                  className={`market-list-row ${selectedPair === p.symbol ? 'active' : ''}`}
                  onClick={() => handleTrade(p.symbol)}
                >
                  <div className="mlr-left">
                    <div className="mlr-icon">{p.symbol.split('/')[0].slice(0, 3)}</div>
                    <div>
                      <div className="mlr-symbol">{p.symbol}</div>
                      <div className={`mlr-change ${p.change >= 0 ? 'up' : 'down'}`}>
                        {p.change >= 0 ? '↑' : '↓'} {Math.abs(p.change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="mlr-price font-mono">
                    {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="markets-chart-panel">
            <iframe
              key={selectedSymbol}
              src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${selectedSymbol}&interval=D&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=1e2330&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1&locale=en`}
              width="100%" height="100%"
              style={{ display: 'block', border: 'none' }}
              allowTransparency allowFullScreen
            />
          </div>
        </div>
      </div>
      <TawkChat />
    </div>
  )
}

export function SpotPage() {
  return <PlaceholderPage title="Spot Trading" icon="⚡" description="Advanced spot trading interface with real-time order book, depth chart, and one-click execution. Coming soon." />
}

export function FuturesPage() {
  return <PlaceholderPage title="Futures Trading" icon="🔮" description="Trade perpetual futures with up to 100x leverage. Advanced margin controls and liquidation protection. Coming soon." />
}

export function BotsPage() {
  const { user }             = useAuth()
  const { balance, loading } = useBalance()
  const canRun               = (balance ?? 0) >= MIN_BALANCE

  return (
    <div className="dash-layout">
      <DashNav />
      <div className="dash-main">
        <div className="bots-content">

          <div className="bots-hero">
            <div className="bots-hero-left">
              <h1 className="bots-hero-title">Automated Trading</h1>
              <p className="bots-hero-sub">Create and manage algorithmic trading strategies</p>
              <div className="bots-hero-stats">
                <div className="bots-stat">
                  <span className="bots-stat-value">{BOT_CONFIGS.length}</span>
                  <span className="bots-stat-label">Total Bots</span>
                </div>
                <div className="bots-stat">
                  <span className="bots-stat-value">
                    {loading ? '...' : `$${Number(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  </span>
                  <span className="bots-stat-label">Available Balance</span>
                </div>
                <div className="bots-stat">
                  <span className="bots-stat-value" style={{ color: canRun ? '#4ade80' : '#ff4d6a' }}>
                    {canRun ? 'Ready' : 'Locked'}
                  </span>
                  <span className="bots-stat-label">Bot Status</span>
                </div>
              </div>
            </div>
            <button className="bots-hero-btn">Create New Bot</button>
          </div>

          {!loading && !canRun && <InsufficientBanner />}

          <div className="bots-section">
            <div className="bots-section-header">
              <div>
                <h2 className="bots-section-title">Dollar-Cost Averaging Bots</h2>
                <p className="bots-section-sub">Regular purchases of assets regardless of price</p>
              </div>
              <button className="bots-create-btn" disabled={!canRun}
                title={!canRun ? `Need $${MIN_BALANCE}+ to create bots` : ''}>
                Create DCA Bot
              </button>
            </div>

            <div className="bots-grid">
              {BOT_CONFIGS.map(bot => (
                <BotCard key={bot.id} bot={bot} balance={balance ?? 0} userId={user?.id} />
              ))}
            </div>
          </div>

        </div>
      </div>
      <TawkChat />
    </div>
  )
}
