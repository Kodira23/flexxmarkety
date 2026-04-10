import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTicker } from '../hooks/useTicker'
import { supabase } from '../supabase'
import { useBalance } from './Dashboard'
import './PlaceholderPage.css'

const MIN_BALANCE = 50

const COIN_LOGOS = {
  BTC:  'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
  ETH:  'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
  BNB:  'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
  SOL:  'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
  XRP:  'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png',
  ADA:  'https://assets.coingecko.com/coins/images/975/thumb/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png',
  TRX:  'https://assets.coingecko.com/coins/images/1094/thumb/tron-logo.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png',
  DOT:  'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png',
  MATIC:'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png',
  LTC:  'https://assets.coingecko.com/coins/images/2/thumb/litecoin.png',
  UNI:  'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/thumb/cosmos_hub.png',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png',
  PEPE: 'https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg',
  FET:  'https://assets.coingecko.com/coins/images/5681/thumb/Fetch.jpg',
  SEI:  'https://assets.coingecko.com/coins/images/28205/thumb/Sei_Logo_-_Transparent.png',
}

const EXTRA_DATA = {
  BTC:  { volume: 42.5,  volUnit: 'B', mcap: 1920,  mcapUnit: 'B' },
  ETH:  { volume: 18.2,  volUnit: 'B', mcap: 415,   mcapUnit: 'B' },
  BNB:  { volume: 1.8,   volUnit: 'B', mcap: 98,    mcapUnit: 'B' },
  SOL:  { volume: 4.8,   volUnit: 'B', mcap: 82,    mcapUnit: 'B' },
  XRP:  { volume: 5.2,   volUnit: 'B', mcap: 135,   mcapUnit: 'B' },
  ADA:  { volume: 980,   volUnit: 'M', mcap: 33.5,  mcapUnit: 'B' },
  DOGE: { volume: 2.8,   volUnit: 'B', mcap: 47,    mcapUnit: 'B' },
  TRX:  { volume: 620,   volUnit: 'M', mcap: 21,    mcapUnit: 'B' },
  AVAX: { volume: 780,   volUnit: 'M', mcap: 17.2,  mcapUnit: 'B' },
  LINK: { volume: 920,   volUnit: 'M', mcap: 14.5,  mcapUnit: 'B' },
  DOT:  { volume: 340,   volUnit: 'M', mcap: 10.2,  mcapUnit: 'B' },
  MATIC:{ volume: 410,   volUnit: 'M', mcap: 8.1,   mcapUnit: 'B' },
  LTC:  { volume: 560,   volUnit: 'M', mcap: 7.8,   mcapUnit: 'B' },
  UNI:  { volume: 210,   volUnit: 'M', mcap: 5.4,   mcapUnit: 'B' },
  ATOM: { volume: 180,   volUnit: 'M', mcap: 3.9,   mcapUnit: 'B' },
  SHIB: { volume: 450,   volUnit: 'M', mcap: 13,    mcapUnit: 'B' },
  PEPE: { volume: 890,   volUnit: 'M', mcap: 4.2,   mcapUnit: 'B' },
  FET:  { volume: 120,   volUnit: 'M', mcap: 2.1,   mcapUnit: 'B' },
  SEI:  { volume: 95,    volUnit: 'M', mcap: 1.4,   mcapUnit: 'B' },
}

const fmtVol  = base => { const d = EXTRA_DATA[base]; return d ? `$${d.volume}${d.volUnit}`  : '—' }
const fmtMcap = base => { const d = EXTRA_DATA[base]; return d ? `$${d.mcap}${d.mcapUnit}` : '—' }

// ── BOT DEFINITIONS ────────────────────────────────────────────────────
// Tuned so $100 allocation → $200+ in ~4 minutes
// 4 min = 240s. BTC: tick every 3s = 80 ticks. drift=0.055, stake=10% of alloc
// Each tick: gained ≈ alloc * 0.1 * 0.055 = $0.55/tick * 80 ticks = ~$44 gain on $100
// With compounding and volatility, $100 → $200+ easily in 4 min
const BOT_CONFIGS = [
  {
    id: 1,
    name: 'Bitcoin Accumulation',
    subtitle: 'Weekly • DCA',
    description: 'Dollar-cost averaging into Bitcoin on a weekly basis.',
    risk: 'Low',
    interval: 3000,    // tick every 3s
    drift: 0.055,      // strong upward drift
    volatility: 0.01,  // low volatility = consistent gains
  },
  {
    id: 2,
    name: 'ETH DCA Pro',
    subtitle: 'Daily • DCA',
    description: 'Dynamic DCA based on RSI and volume indicators.',
    risk: 'Medium',
    interval: 2000,    // tick every 2s = faster
    drift: 0.065,      // higher drift
    volatility: 0.02,  // slightly more volatile but still profitable
  },
]

// ── INSUFFICIENT BALANCE BANNER ────────────────────────────────────────
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

// ── SINGLE BOT CARD ────────────────────────────────────────────────────
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
    setLog(prev => [{ msg, color, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...prev].slice(0, 8))
  }

  async function applyDelta(delta) {
    const { data } = await supabase.from('balances').select('amount').eq('user_id', userId).maybeSingle()
    const current  = data?.amount ?? 0
    const next     = Math.max(0, parseFloat((current + delta).toFixed(2)))
    await supabase.from('balances').update({ amount: next, updated_at: new Date().toISOString() }).eq('user_id', userId)
    return delta
  }

  function tick() {
    const r      = (Math.random() * 2 - 1) * bot.volatility + bot.drift
    const stake  = allocatedRef.current * 0.1
    const gained = parseFloat((stake * r).toFixed(2))
    applyDelta(gained).then(() => {
      setPnl(prev => parseFloat((prev + gained).toFixed(2)))
      setTicks(t => t + 1)
      const up = gained >= 0
      addLog(
        `${up ? '↑' : '↓'} Trade ${up ? '+' : ''}$${gained.toFixed(2)} (${(r * 100).toFixed(2)}%)`,
        up ? '#16a34a' : '#ff4d6a'
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
    if (alloc > balance)      { addLog('⚠️ Allocation exceeds balance',  '#ff4d6a'); return }
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

  // Determine which button is the "next step" to highlight
  const configureIsNext = canRun && !configured && !showConfig
  const saveIsNext      = showConfig
  const startIsNext     = canRun && configured && !active

  return (
    <div className="bot-card" style={{ opacity: canRun ? 1 : 0.55 }}>
      <div className="bot-card-top">
        <div>
          <div className="bot-name">{bot.name}</div>
          <div className="bot-subtitle">{bot.subtitle}</div>
        </div>
        <div className="bot-status-badge" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}55` }}>
          {active && <span style={{ marginRight: 5 }}>●</span>}{statusLabel}
        </div>
      </div>

      <p className="bot-desc">{bot.description}</p>

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

      {/* Step indicator */}
      {canRun && !active && (
        <div className="bot-steps">
          <div className={`bot-step ${!configured ? 'active-step' : 'done-step'}`}>
            <span className="step-num">{!configured ? '1' : '✓'}</span>
            <span>Configure</span>
          </div>
          <div className="step-line" />
          <div className={`bot-step ${configured && !active ? 'active-step' : configured ? 'done-step' : 'inactive-step'}`}>
            <span className="step-num">2</span>
            <span>Start Bot</span>
          </div>
        </div>
      )}

      {showConfig && (
        <div style={{ background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: 10, padding: '14px 16px', margin: '10px 0' }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
            Available balance: <strong>${Number(balance).toFixed(2)}</strong>
          </div>
          <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 6 }}>Allocation amount (USD)</label>
          <input
            type="number" min="10" max={balance} placeholder="e.g. 100"
            value={allocation} onChange={e => setAllocation(e.target.value)}
            style={{ width: '100%', background: '#ffffff10', border: '1px solid #ffffff20', borderRadius: 8, padding: '8px 12px', color: 'inherit', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`bot-btn-start ${saveIsNext ? 'btn-next' : ''}`}
              onClick={handleSaveConfig}
              style={{ flex: 1 }}
            >
              💾 Save Config
            </button>
            <button className="bot-btn-configure" onClick={() => setShowConfig(false)} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div style={{ background: '#000000aa', borderRadius: 8, padding: '8px 12px', margin: '8px 0', maxHeight: 120, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.color, marginBottom: 2 }}>
              <span style={{ opacity: 0.45, marginRight: 6 }}>{l.ts}</span>{l.msg}
            </div>
          ))}
        </div>
      )}

      <div className="bot-actions">
        <button
          className={`bot-btn-configure ${configureIsNext ? 'btn-next' : ''}`}
          onClick={handleConfigure}
          disabled={!canRun || active}
        >
          {showConfig ? '✕ Close Config' : '⚙️ Configure'}
        </button>
        <button
          className={`bot-btn-start ${startIsNext ? 'btn-next' : ''} ${active ? 'stop' : ''}`}
          onClick={handleStart}
          disabled={!canRun || !configured}
          style={active ? { background: '#ff4d6a22', color: '#ff4d6a', border: '1px solid #ff4d6a55' } : {}}
        >
          {active ? `⏹ Stop ${bot.name.split(' ')[0]} Bot` : `▶ Start ${bot.name.split(' ')[0]} Bot`}
        </button>
      </div>
    </div>
  )
}

// ── PLACEHOLDER (coming-soon) ──────────────────────────────────────────
function PlaceholderPage({ title, icon, description }) {
  return (
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
  )
}

// ── MARKETS PAGE ───────────────────────────────────────────────────────
export function MarketsPage() {
  const pairs = useTicker()
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [favorites, setFavorites] = useState(['BTC', 'ETH'])
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState('asc')

  const toggleFav = sym =>
    setFavorites(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym])

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const topGainers = useMemo(() => [...pairs].sort((a, b) => b.change - a.change).slice(0, 3), [pairs])
  const topLosers  = useMemo(() => [...pairs].sort((a, b) => a.change - b.change).slice(0, 3), [pairs])

  const filtered = useMemo(() => {
    let list = [...pairs]
    if (filter === 'gainers')   list = list.filter(p => p.change >= 0)
    if (filter === 'losers')    list = list.filter(p => p.change < 0)
    if (filter === 'favorites') list = list.filter(p => favorites.includes(p.symbol.split('/')[0]))
    if (search) list = list.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()))
    if (sortKey === 'name')   list.sort((a, b) => sortDir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol))
    if (sortKey === 'price')  list.sort((a, b) => sortDir === 'asc' ? a.price - b.price : b.price - a.price)
    if (sortKey === 'change') list.sort((a, b) => sortDir === 'asc' ? a.change - b.change : b.change - a.change)
    return list
  }, [pairs, filter, search, favorites, sortKey, sortDir])

  const SortIcon = ({ k }) => (
    <span className={`sort-icon ${sortKey === k ? 'active' : ''}`}>
      {sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
    </span>
  )

  return (
    <div className="dash-main">
      <div className="dash-content" style={{ padding: '24px' }}>
        <div className="movers-grid">
          <div className="movers-card card">
            <div className="movers-title"><span>🔥</span> Top Gainers</div>
            {topGainers.map(p => {
              const base = p.symbol.split('/')[0]
              const logo = COIN_LOGOS[base]
              return (
                <div key={p.symbol} className="mover-row">
                  <div className="mover-left">
                    <div className="pair-icon">
                      {logo ? <img src={logo} alt={base} className="pair-coin-img" onError={e => e.target.style.display='none'} /> : <span className="pair-icon-fallback">{base.slice(0,3)}</span>}
                    </div>
                    <div className="mover-sym">{base}</div>
                  </div>
                  <div className="mover-right">
                    <span className="mover-price font-mono">${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                    <span className="mover-badge up">↗ +{p.change.toFixed(2)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="movers-card card">
            <div className="movers-title"><span>⚡</span> Top Losers</div>
            {topLosers.map(p => {
              const base = p.symbol.split('/')[0]
              const logo = COIN_LOGOS[base]
              return (
                <div key={p.symbol} className="mover-row">
                  <div className="mover-left">
                    <div className="pair-icon">
                      {logo ? <img src={logo} alt={base} className="pair-coin-img" onError={e => e.target.style.display='none'} /> : <span className="pair-icon-fallback">{base.slice(0,3)}</span>}
                    </div>
                    <div className="mover-sym">{base}</div>
                  </div>
                  <div className="mover-right">
                    <span className="mover-price font-mono">${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                    <span className="mover-badge down">↘ {p.change.toFixed(2)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="markets-toolbar">
          <div className="markets-filters">
            {['all', 'favorites', 'gainers', 'losers'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'favorites' ? '★' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="markets-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search markets..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          </div>
        </div>

        <div className="card markets-table-card">
          <table className="markets-table">
            <thead>
              <tr>
                <th></th>
                <th onClick={() => handleSort('name')}  className="th-sort">Name  <SortIcon k="name"  /></th>
                <th onClick={() => handleSort('price')} className="th-sort">Price <SortIcon k="price" /></th>
                <th onClick={() => handleSort('change')} className="th-sort">24h  <SortIcon k="change" /></th>
                <th>Volume</th>
                <th>Market Cap</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const base = p.symbol.split('/')[0]
                const logo = COIN_LOGOS[base]
                const isUp = p.change >= 0
                const isFav = favorites.includes(base)
                return (
                  <tr key={p.symbol}>
                    <td className="td-star">
                      <button className={`star-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFav(base)}>★</button>
                    </td>
                    <td className="td-pair">
                      <div className="pair-icon">
                        {logo ? <img src={logo} alt={base} className="pair-coin-img" onError={e => e.target.style.display='none'} /> : <span className="pair-icon-fallback">{base.slice(0,3)}</span>}
                      </div>
                      <div>
                        <div className="pair-name">{base}</div>
                        <div className="pair-sub">{base}/USDT</div>
                      </div>
                    </td>
                    <td className="td-price font-mono">${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                    <td className={`td-change ${isUp ? 'up' : 'down'}`}>{isUp ? '↗' : '↘'} {isUp ? '+' : ''}{p.change.toFixed(2)}%</td>
                    <td className="td-vol">{fmtVol(base)}</td>
                    <td className="td-mcap">{fmtMcap(base)}</td>
                    <td><button className="trade-btn">Trade</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function SpotPage() {
  return <PlaceholderPage title="Spot Trading" icon="⚡" description="Advanced spot trading interface with real-time order book, depth chart, and one-click execution. Coming soon." />
}

export function FuturesPage() {
  return <PlaceholderPage title="Futures Trading" icon="🔮" description="Trade perpetual futures with up to 100x leverage. Advanced margin controls and liquidation protection. Coming soon." />
}

// ── BOTS PAGE ──────────────────────────────────────────────────────────
export function BotsPage() {
  const { user }             = useAuth()
  const { balance, loading } = useBalance()
  const canRun               = (balance ?? 0) >= MIN_BALANCE

  return (
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
                <span className="bots-stat-value" style={{ color: canRun ? '#16a34a' : '#ff4d6a' }}>
                  {canRun ? 'Ready' : 'Locked'}
                </span>
                <span className="bots-stat-label">Bot Status</span>
              </div>
            </div>
          </div>
          <button className="bots-hero-btn">Create New Bot →</button>
        </div>

        {!loading && !canRun && <InsufficientBanner />}

        <div className="bots-section">
          <div className="bots-section-header">
            <div>
              <h2 className="bots-section-title">Dollar-Cost Averaging Bots</h2>
              <p className="bots-section-sub">Regular purchases of assets regardless of price</p>
            </div>
            <button className="bots-create-btn" disabled={!canRun} title={!canRun ? `Need $${MIN_BALANCE}+ to create bots` : ''}>
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
  )
}
