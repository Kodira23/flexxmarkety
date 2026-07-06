// ── DEPOSIT PAGE ───────────────────────────────────────────────────────
function DepositPage({ onBack }) {
  const { user } = useAuth()
  const [coin, setCoin] = useState('BTC')
  const [copied, setCopied] = useState(false)
  const [generatedAddresses, setGeneratedAddresses] = useState({})
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)

  useEffect(() => {
    if (!user) { setLoadingExisting(false); return }

    supabase
      .from('deposit_addresses')
      .select('coin')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading deposit addresses:', error)
          setGenError(`Could not load saved addresses: ${error.message}`)
        }
        const map = {}
        ;(data || []).forEach(row => { map[row.coin] = true })
        setGeneratedAddresses(map)
        setLoadingExisting(false)
      })
  }, [user])

  const isGenerated = !!generatedAddresses[coin]

  async function handleGenerate() {
    if (!user) return
    setGenerating(true)
    setGenError(null)

    const { error } = await supabase.from('deposit_addresses').insert({
      user_id: user.id,
      coin,
      address: WALLET_ADDRESSES[coin],
    })

    setGenerating(false)

    if (error) {
      console.error('Error generating deposit address:', error)
      if (error.code === '23505') {
        setGeneratedAddresses(prev => ({ ...prev, [coin]: true }))
      } else {
        setGenError(`Failed to generate address: ${error.message}`)
      }
      return
    }

    setGeneratedAddresses(prev => ({ ...prev, [coin]: true }))
  }

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
        <div className="fund-tabs single">
          <button className="fund-tab active">🪙 Crypto</button>
        </div>
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

        {genError && (
          <div style={{ background:'#ff4d6a18', border:'1px solid #ff4d6a55', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#ff4d6a', marginBottom:12 }}>
            ⚠️ {genError}
          </div>
        )}

        {loadingExisting ? (
          <div className="wallet-box">
            <p className="wallet-note">Loading…</p>
          </div>
        ) : !isGenerated ? (
          <div className="wallet-box">
            <h3>{coin === 'BTC' ? 'Bitcoin' : 'USDT (TRC20)'} Deposit Address</h3>
            <p className="wallet-note">Generate a deposit address for {coin === 'BTC' ? 'Bitcoin' : 'USDT'} to continue. Once generated, it will stay visible on your account permanently.</p>
            <button className="copy-btn" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate Address'}
            </button>
          </div>
        ) : (
          <div className="wallet-box">
            <h3>{coin === 'BTC' ? 'Bitcoin' : 'USDT (TRC20)'} Wallet Address</h3>
            <div className="wallet-addr font-mono">{WALLET_ADDRESSES[coin]}</div>
            <button className="copy-btn" onClick={copy}>{copied ? '✓ Copied!' : 'Copy Address'}</button>
            <p className="wallet-note">Deposit money into this address for your account to be credited.</p>
          </div>
        )}
      </div>
    </div>
  )
}
