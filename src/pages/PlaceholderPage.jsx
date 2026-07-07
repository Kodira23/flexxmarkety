import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTicker } from '../hooks/useTicker'
import { supabase } from '../supabase'
import { useBalance } from './Dashboard'
import './PlaceholderPage.css'

const MIN_BALANCE = 1
const MIN_ALLOCATION = 49   // 🔥 changed from 10 to 49

// ── GLOBAL BOT INTERVALS (persist across page navigation) ──────────
const botIntervals = {}

// ── COINS TO EXCLUDE ───────────────────────────────────────────────────
const EXCLUDED = new Set(['BOME','NOT','IO','ZK','LISTA','EIGEN','HMSTR','CATI','DOGS','MAJOR','NEIRO'])

// ── COIN LOGOS ─────────────────────────────────────────────────────────
const COIN_LOGOS = { /* ... same as before ... */ }

const COIN_COLORS = { /* ... same as before ... */ }

const EXTRA_DATA = { /* ... same as before ... */ }

// ── SHARED HELPERS ─────────────────────────────────────────────────────
function CoinCircle({ base, size = 36 }) { /* ... same as before ... */ }

const fmt = p => { /* ... same as before ... */ }

// ── BOT CONFIGS ────────────────────────────────────────────────────────
const BOT_CONFIGS = [
  { id:1, name:'Bitcoin Accumulation', subtitle:'Weekly • DCA', description:'Dollar-cost averaging into Bitcoin on a weekly basis.', risk:'Low', interval:3000, drift:0.14, volatility:0.05, lossChance:0.25, lossMult:0.35 },
  { id:2, name:'ETH DCA Pro', subtitle:'Daily • DCA', description:'Dynamic DCA based on RSI and volume indicators.', risk:'Medium', interval:3000, drift:0.14, volatility:0.06, lossChance:0.26, lossMult:0.38 },
]

// ── BOT CARD ─────────────────────────────────────────────────────────
function BotCard({ bot, balance, userId }) {
  const canRun = balance >= MIN_BALANCE
  const [active,setActive]         = useState(false)
  const [configured,setConfigured] = useState(false)
  const [showConfig,setShowConfig] = useState(false)
  const [allocation,setAllocation] = useState('')
  const [log,setLog]               = useState([])
  const [pnl,setPnl]               = useState(0)
  const [wins,setWins]             = useState(0)
  const [losses,setLosses]         = useState(0)
  const [loaded,setLoaded]         = useState(false)
  const allocatedRef = useRef(0)
  const winsRef      = useRef(0)
  const lossesRef    = useRef(0)
  const intervalKey  = `${userId}-${bot.id}`

  // ── Load saved state ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    supabase
      .from('bot_simulated_pnl')
      .select('*')
      .eq('user_id', userId)
      .eq('bot_id', bot.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPnl(data.pnl ?? 0)
          setWins(data.wins ?? 0)
          setLosses(data.losses ?? 0)
          setAllocation(data.allocation ? String(data.allocation) : '')
          setConfigured(!!data.configured)
          winsRef.current = data.wins ?? 0
          lossesRef.current = data.losses ?? 0
          allocatedRef.current = data.allocation ?? 0
          if (data.active) {
            setActive(true)
            // 🔥 Start global interval if not already running
            if (!botIntervals[intervalKey]) {
              botIntervals[intervalKey] = setInterval(tick, bot.interval)
            }
          }
        }
        setLoaded(true)
      })
    // 🔥 Do NOT clear interval on unmount – keep it alive globally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  function addLog(msg, color='#aaa') {
    setLog(prev => [{ msg, color, ts: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) }, ...prev].slice(0,8))
  }

  async function persist(patch) {
    const { error } = await supabase.from('bot_simulated_pnl').upsert({
      user_id: userId,
      bot_id: bot.id,
      pnl, wins, losses,
      allocation: allocatedRef.current,
      configured,
      active,
      updated_at: new Date().toISOString(),
      ...patch,
    }, { onConflict: 'user_id,bot_id' })
    if (error) console.error('bot_simulated_pnl upsert failed:', error.message)
  }

  // ── Tick: simulates trade, updates P&L and balance ──────────────
  function tick() {
    const total     = winsRef.current + lossesRef.current
    let isLoss = false

    // Force win rate between 62% and 65%
    if (total > 0) {
      const wr = winsRef.current / total
      if (wr < 0.62) isLoss = false
      else if (wr > 0.65) isLoss = true
      else isLoss = Math.random() < bot.lossChance
    } else {
      isLoss = Math.random() < bot.lossChance
    }

    const noise = Math.random() * bot.volatility
    const r     = isLoss ? -(bot.drift * bot.lossMult + noise) : (bot.drift + noise)
    const stake = allocatedRef.current * 0.1
    const gained = parseFloat((stake * r).toFixed(2))

    setPnl(prev => {
      const next = parseFloat((prev + gained).toFixed(2))
      const newWins   = gained >= 0 ? winsRef.current + 1 : winsRef.current
      const newLosses = gained < 0  ? lossesRef.current + 1 : lossesRef.current
      winsRef.current = newWins
      lossesRef.current = newLosses
      setWins(newWins)
      setLosses(newLosses)

      // Persist bot P&L
      supabase.from('bot_simulated_pnl').upsert({
        user_id: userId, bot_id: bot.id,
        pnl: next, wins: newWins, losses: newLosses,
        allocation: allocatedRef.current, configured: true, active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,bot_id' }).catch(err => console.error(err))

      // Update real balance by gained amount
      supabase.rpc('increment_balance', { p_user_id: userId, p_delta: gained })
        .catch(err => console.error('Balance update failed:', err.message))

      return next
    })

    const up = gained >= 0
    addLog(`${up?'↑':'↓'} Trade ${up?'+':''}$${gained.toFixed(2)} (${(r*100).toFixed(2)}%)`, up?'#00c853':'#ff3b5c')
  }

  // ── Start / Stop ──────────────────────────────────────────────────
  function handleStart() {
    if (!canRun || !configured) return

    if (active) {
      // Stop: clear global interval and reset state
      clearInterval(botIntervals[intervalKey])
      delete botIntervals[intervalKey]
      setActive(false)
      allocatedRef.current = 0
      setAllocation('')
      setConfigured(false)
      addLog('🛑 Bot stopped', '#ffaa00')
      persist({ active: false, allocation: 0, configured: false })
      return
    }

    // Start: no deduction – only trades affect balance
    const alloc = parseFloat(allocation)
    if (!alloc || alloc < MIN_ALLOCATION) {
      addLog(`⚠️ Allocation must be $${MIN_ALLOCATION} or above`, '#ff3b5c')
      return
    }
    if (alloc > balance) {
      addLog('⚠️ Allocation exceeds balance', '#ff3b5c')
      return
    }

    allocatedRef.current = alloc
    setActive(true)
    addLog(`🚀 Bot started with $${alloc.toFixed(2)} allocation (real funds NOT deducted)`, '#00c853')
    persist({ active: true, allocation: alloc, configured: true })

    // 🔥 Start global interval – survives page navigation
    if (!botIntervals[intervalKey]) {
      botIntervals[intervalKey] = setInterval(tick, bot.interval)
    }
  }

  function handleSaveConfig() {
    const alloc = parseFloat(allocation)
    if (!alloc || alloc < MIN_ALLOCATION) {
      addLog(`⚠️ Allocation must be $${MIN_ALLOCATION} or above`, '#ff3b5c')
      return
    }
    if (alloc > balance) {
      addLog('⚠️ Allocation exceeds balance', '#ff3b5c')
      return
    }
    allocatedRef.current = alloc
    setConfigured(true)
    setShowConfig(false)
    addLog(`✅ Configured — $${alloc.toFixed(2)} allocated (funds not yet deducted)`, '#00c853')
    persist({ allocation: alloc, configured: true })
  }

  const totalTrades    = wins + losses
  const statusLabel    = active ? 'Running' : configured ? 'Ready' : 'Not Configured'
  const statusColor    = active ? '#00c853' : configured ? '#ffaa00' : '#555'
  const configureIsNext = canRun && !configured && !showConfig
  const saveIsNext      = showConfig
  const startIsNext     = canRun && configured && !active

  if (!loaded) {
    return <div className="bot-card" style={{ opacity: 0.5 }}>Loading…</div>
  }

  return (
    <div className="bot-card" style={{ opacity: canRun ? 1 : 0.55 }}>
      <div className="bot-card-top">
        <div>
          <div className="bot-name">{bot.name}</div>
          <div className="bot-subtitle">{bot.subtitle}</div>
        </div>
        <div className="bot-status-badge" style={{ background:statusColor+'22', color:statusColor, border:`1px solid ${statusColor}55` }}>
          {active && <span style={{marginRight:5}}>●</span>}{statusLabel}
        </div>
      </div>
      <p className="bot-desc">{bot.description}</p>
      <div className="bot-meta">
        <div className="bot-meta-item"><span className="bot-meta-label">Risk</span><span className={`bot-meta-value risk-${bot.risk.toLowerCase()}`}>{bot.risk}</span></div>
        <div className="bot-meta-item"><span className="bot-meta-label">P&L</span><span className="bot-meta-value" style={{color:pnl>=0?'#00c853':'#ff3b5c',fontWeight:700}}>{pnl>=0?'+':''}${pnl.toFixed(2)}</span></div>
        <div className="bot-meta-item"><span className="bot-meta-label">Wins</span><span className="bot-meta-value" style={{color:'#00c853'}}>{wins}</span></div>
        <div className="bot-meta-item"><span className="bot-meta-label">Losses</span><span className="bot-meta-value" style={{color:'#ff3b5c'}}>{losses}</span></div>
        {totalTrades > 0 && <div className="bot-meta-item"><span className="bot-meta-label">Win Rate</span><span className="bot-meta-value">{((wins/totalTrades)*100).toFixed(0)}%</span></div>}
        {configured && <div className="bot-meta-item"><span className="bot-meta-label">Allocation</span><span className="bot-meta-value">${parseFloat(allocation||0).toFixed(2)}</span></div>}
      </div>
      {canRun && !active && (
        <div className="bot-steps">
          <div className={`bot-step ${!configured?'active-step':'done-step'}`}><span className="step-num">{!configured?'1':'✓'}</span><span>Configure</span></div>
          <div className="step-line"/>
          <div className={`bot-step ${configured&&!active?'active-step':configured?'done-step':'inactive-step'}`}><span className="step-num">2</span><span>Start Bot</span></div>
        </div>
      )}
      {showConfig && (
        <div className="bot-config-box">
          <div style={{fontSize:12,opacity:0.6,marginBottom:8}}>Available balance: <strong>${Number(balance).toFixed(2)}</strong></div>
          {!canRun && (
            <div style={{fontSize:13,color:'#ff3b5c',marginBottom:10,padding:'6px 10px',background:'#ff3b5c22',borderRadius:6}}>
              ⚠️ Minimum balance ${MIN_BALANCE} required to run bots.
            </div>
          )}
          <label className="bot-config-label">Allocation amount (USD)</label>
          <input
            type="number"
            min={MIN_ALLOCATION}
            max={balance}
            placeholder=""
            value={allocation}
            onChange={e=>setAllocation(e.target.value)}
            className="bot-config-input"
            disabled={!canRun}
          />
          {/* 🔥 Alert note under the input */}
          <div style={{fontSize:12, color:'#ffaa00', marginTop:4}}>
            ⚠️ Allocation must be ${MIN_ALLOCATION} or above
          </div>
          <div style={{display:'flex',gap:8, marginTop:8}}>
            <button
              className={`bot-btn-start ${saveIsNext?'btn-next':''}`}
              onClick={handleSaveConfig}
              style={{flex:1}}
              disabled={!canRun}
            >
              💾 Save Config
            </button>
            <button className="bot-btn-configure" onClick={()=>setShowConfig(false)} style={{flex:1}}>Cancel</button>
          </div>
        </div>
      )}
      {log.length > 0 && (
        <div className="bot-log">
          {log.map((l,i) => (
            <div key={i} style={{color:l.color,marginBottom:2}}>
              <span style={{opacity:0.45,marginRight:6}}>{l.ts}</span>{l.msg}
            </div>
          ))}
        </div>
      )}
      <div className="bot-actions">
        <button
          className={`bot-btn-configure ${configureIsNext?'btn-next':''}`}
          onClick={()=>{if(canRun)setShowConfig(v=>!v)}}
          disabled={!canRun||active}
        >
          {showConfig?'✕ Close Config':'⚙️ Configure'}
        </button>
        <button
          className={`bot-btn-start ${startIsNext?'btn-next':''}`}
          onClick={handleStart}
          disabled={!canRun||!configured}
          style={active?{background:'#ff3b5c22',color:'#ff3b5c',border:'1px solid #ff3b5c55'}:{}}
        >
          {active?'⏹ Stop Bot':'▶ Start Bot'}
        </button>
      </div>
    </div>
  )
}

// ── Placeholder, Markets, Spot, Futures, BotsPage ────────────────────
// (All other components remain unchanged – only the BotCard was updated.)
// For brevity, the rest of the file is identical to the previous version.
// I'll include the BotsPage with the removed status stat.

export function BotsPage() {
  const { user } = useAuth()
  const { balance, loading } = useBalance()

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
                  {loading ? '...' : '$' + (balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="bots-stat-label">Available Balance</span>
              </div>
              {/* ❌ Removed the "Ready/Locked" status stat */}
            </div>
          </div>
          <button className="bots-hero-btn">Create New Bot →</button>
        </div>

        <div className="bots-section">
          <div className="bots-section-header">
            <div>
              <h2 className="bots-section-title">Dollar-Cost Averaging Bots</h2>
              <p className="bots-section-sub">Regular purchases of assets regardless of price</p>
            </div>
            <button className="bots-create-btn" disabled={(balance ?? 0) < MIN_BALANCE}>
              Create DCA Bot
            </button>
          </div>
          <div className="bots-grid">
            {BOT_CONFIGS.map(bot => (
              <BotCard key={bot.id} bot={bot} balance={balance ?? 0} userId={user?.id}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
