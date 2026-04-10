import { useState, useMemo } from 'react'
import './Markets.css'

const COINS = [
  { sym: 'BTC',   name: 'Bitcoin',           price: 97500,    change:  2.58,  vol: '$42.50B',  mcap: '$1920.00B', logo: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png' },
  { sym: 'ETH',   name: 'Ethereum',           price: 3450.45,  change: -2.41,  vol: '$18.20B',  mcap: '$415.00B',  logo: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png' },
  { sym: 'XRP',   name: 'XRP',                price: 2.35,     change:  5.38,  vol: '$5.20B',   mcap: '$135.00B',  logo: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png' },
  { sym: 'BNB',   name: 'BNB',                price: 680,      change:  2.29,  vol: '$1.80B',   mcap: '$98.00B',   logo: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png' },
  { sym: 'SOL',   name: 'Solana',             price: 185.75,   change:  4.65,  vol: '$4.80B',   mcap: '$82.00B',   logo: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png' },
  { sym: 'DOGE',  name: 'Dogecoin',           price: 0.32,     change:  6.67,  vol: '$2.80B',   mcap: '$47.00B',   logo: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png' },
  { sym: 'ADA',   name: 'Cardano',            price: 0.95,     change: -4.04,  vol: '$980.00M', mcap: '$33.50B',   logo: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png' },
  { sym: 'TRX',   name: 'TRON',               price: 0.24,     change:  4.35,  vol: '$620.00M', mcap: '$21.00B',   logo: 'https://assets.coingecko.com/coins/images/1094/thumb/tron-logo.png' },
  { sym: 'AVAX',  name: 'Avalanche',          price: 42.20,    change: -4.74,  vol: '$780.00M', mcap: '$17.20B',   logo: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png' },
  { sym: 'LINK',  name: 'Chainlink',          price: 24.00,    change:  5.49,  vol: '$920.00M', mcap: '$14.50B',   logo: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png' },
  { sym: 'SHIB',  name: 'Shiba Inu',          price: 0.000024, change:  4.76,  vol: '$450.00M', mcap: '$13.00B',   logo: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png' },
  { sym: 'SUI',   name: 'Sui',                price: 4.20,     change:  8.25,  vol: '$680.00M', mcap: '$12.80B',   logo: 'https://assets.coingecko.com/coins/images/26375/thumb/sui_asset.jpeg' },
  { sym: 'XLM',   name: 'Stellar',            price: 0.42,     change:  5.00,  vol: '$280.00M', mcap: '$12.50B',   logo: 'https://assets.coingecko.com/coins/images/100/thumb/Stellar_symbol_black_RGB.png' },
  { sym: 'DOT',   name: 'Polkadot',           price: 7.50,     change:  4.90,  vol: '$420.00M', mcap: '$10.80B',   logo: 'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png' },
  { sym: 'HBAR',  name: 'Hedera',             price: 0.28,     change:  7.69,  vol: '$380.00M', mcap: '$10.50B',   logo: 'https://assets.coingecko.com/coins/images/3688/thumb/hbar.png' },
  { sym: 'BCH',   name: 'Bitcoin Cash',       price: 485.00,   change:  2.65,  vol: '$380.00M', mcap: '$9.50B',    logo: 'https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash-circle.png' },
  { sym: 'UNI',   name: 'Uniswap',            price: 14.50,    change:  4.92,  vol: '$220.00M', mcap: '$8.70B',    logo: 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png' },
  { sym: 'LTC',   name: 'Litecoin',           price: 108.00,   change: -2.88,  vol: '$520.00M', mcap: '$8.10B',    logo: 'https://assets.coingecko.com/coins/images/2/thumb/litecoin.png' },
  { sym: 'PEPE',  name: 'Pepe',               price: 0.000018, change: 11.76,  vol: '$1.20B',   mcap: '$8.00B',    logo: 'https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg' },
  { sym: 'NEAR',  name: 'NEAR Protocol',      price: 5.20,     change:  5.69,  vol: '$320.00M', mcap: '$5.80B',    logo: 'https://assets.coingecko.com/coins/images/10365/thumb/near.jpg' },
  { sym: 'ICP',   name: 'Internet Computer',  price: 11.50,    change:  4.74,  vol: '$185.00M', mcap: '$5.40B',    logo: 'https://assets.coingecko.com/coins/images/14495/thumb/Internet_Computer_logo.png' },
  { sym: 'FET',   name: 'Fetch.ai',           price: 2.10,     change:  9.38,  vol: '$420.00M', mcap: '$5.30B',    logo: 'https://assets.coingecko.com/coins/images/5681/thumb/Fetch.jpg' },
  { sym: 'MATIC', name: 'Polygon',            price: 0.52,     change:  4.00,  vol: '$320.00M', mcap: '$4.80B',    logo: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png' },
  { sym: 'RNDR',  name: 'Render',             price: 8.50,     change:  8.28,  vol: '$320.00M', mcap: '$4.40B',    logo: 'https://assets.coingecko.com/coins/images/11636/thumb/rndr.png' },
  { sym: 'ARB',   name: 'Arbitrum',           price: 1.10,     change:  4.76,  vol: '$380.00M', mcap: '$4.40B',    logo: 'https://assets.coingecko.com/coins/images/16547/thumb/photo_2023-03-29_21.47.00.jpeg' },
  { sym: 'ATOM',  name: 'Cosmos',             price: 9.80,     change:  3.90,  vol: '$180.00M', mcap: '$3.90B',    logo: 'https://assets.coingecko.com/coins/images/1481/thumb/cosmos_hub.png' },
  { sym: 'SEI',   name: 'Sei',                price: 0.48,     change:  9.09,  vol: '$280.00M', mcap: '$1.80B',    logo: 'https://assets.coingecko.com/coins/images/28205/thumb/Sei_Logo_-_Transparent.png' },
  { sym: 'RUNE',  name: 'THORChain',          price: 5.50,     change:  6.80,  vol: '$185.00M', mcap: '$1.80B',    logo: 'https://assets.coingecko.com/coins/images/6595/thumb/Rune200x200.png' },
  { sym: 'MKR',   name: 'Maker',              price: 1850.00,  change:  4.82,  vol: '$95.00M',  mcap: '$1.70B',    logo: 'https://assets.coingecko.com/coins/images/1364/thumb/Mark_Maker.png' },
  { sym: 'QNT',   name: 'Quant',              price: 118.00,   change:  4.89,  vol: '$42.00M',  mcap: '$1.70B',    logo: 'https://assets.coingecko.com/coins/images/3370/thumb/5ZOu7brX_400x400.jpg' },
  { sym: 'LDO',   name: 'Lido DAO',           price: 1.90,     change:  4.97,  vol: '$145.00M', mcap: '$1.70B',    logo: 'https://assets.coingecko.com/coins/images/13573/thumb/Lido_DAO.png' },
  { sym: 'GALA',  name: 'GALA',               price: 0.04,     change:  7.69,  vol: '$185.00M', mcap: '$1.60B',    logo: 'https://assets.coingecko.com/coins/images/12493/thumb/GALA-COINGECKO.png' },
  { sym: 'JASMY', name: 'JasmyCoin',          price: 0.03,     change:  6.67,  vol: '$185.00M', mcap: '$1.60B',    logo: 'https://assets.coingecko.com/coins/images/13876/thumb/JASMY200x200.jpg' },
  { sym: 'SAND',  name: 'The Sandbox',        price: 0.58,     change:  5.45,  vol: '$145.00M', mcap: '$1.40B',    logo: 'https://assets.coingecko.com/coins/images/12129/thumb/sandbox_logo.jpg' },
  { sym: 'FLOW',  name: 'Flow',               price: 0.85,     change:  4.60,  vol: '$65.00M',  mcap: '$1.30B',    logo: 'https://assets.coingecko.com/coins/images/13446/thumb/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png' },
]

const fmt = (p) => {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (p >= 1)    return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toFixed(8)}`
}

function CoinIcon({ coin, size = 36 }) {
  const [err, setErr] = useState(false)
  return (
    <div className="pair-icon" style={{ width: size, height: size }}>
      {!err
        ? <img src={coin.logo} alt={coin.sym} className="pair-coin-img" onError={() => setErr(true)} />
        : <span className="pair-icon-fallback">{coin.sym.slice(0, 3)}</span>
      }
    </div>
  )
}

export default function Markets() {
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [favorites, setFavorites] = useState(['BTC', 'ETH'])
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState('asc')

  const toggleFav = (sym) =>
    setFavorites(p => p.includes(sym) ? p.filter(s => s !== sym) : [...p, sym])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const topGainers = useMemo(() => [...COINS].sort((a, b) => b.change - a.change).slice(0, 3), [])
  const topLosers  = useMemo(() => [...COINS].sort((a, b) => a.change - b.change).slice(0, 3), [])

  const filtered = useMemo(() => {
    let list = [...COINS]
    if (filter === 'gainers')   list = list.filter(c => c.change >= 0)
    if (filter === 'losers')    list = list.filter(c => c.change < 0)
    if (filter === 'favorites') list = list.filter(c => favorites.includes(c.sym))
    if (search) list = list.filter(c =>
      c.sym.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    )
    if (sortKey === 'name')   list.sort((a, b) => sortDir === 'asc' ? a.sym.localeCompare(b.sym) : b.sym.localeCompare(a.sym))
    if (sortKey === 'price')  list.sort((a, b) => sortDir === 'asc' ? a.price - b.price : b.price - a.price)
    if (sortKey === 'change') list.sort((a, b) => sortDir === 'asc' ? a.change - b.change : b.change - a.change)
    return list
  }, [filter, search, favorites, sortKey, sortDir])

  const SortIcon = ({ k }) => (
    <span className={`sort-icon ${sortKey === k ? 'active' : ''}`}>
      {sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
    </span>
  )

  return (
    <div className="dash-page">

      {/* Top Gainers / Losers */}
      <div className="movers-grid">
        {[
          { label: '🔥 Top Gainers', list: topGainers, isGain: true },
          { label: '⚡ Top Losers',  list: topLosers,  isGain: false },
        ].map(({ label, list, isGain }) => (
          <div key={label} className="movers-card card">
            <div className="movers-title">{label}</div>
            {list.map(c => (
              <div key={c.sym} className="mover-row">
                <div className="mover-left">
                  <CoinIcon coin={c} />
                  <div className="mover-sym">{c.sym}</div>
                </div>
                <div className="mover-right">
                  <span className="mover-price font-mono">{fmt(c.price)}</span>
                  <span className={`mover-badge ${isGain ? 'up' : 'down'}`}>
                    {isGain ? `↗ +${c.change.toFixed(2)}%` : `↘ ${c.change.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="markets-toolbar">
        <div className="markets-filters">
          {['all', 'favorites', 'gainers', 'losers'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'favorites' ? '★' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="markets-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card markets-table-card">
        <table className="markets-table">
          <thead>
            <tr>
              <th></th>
              <th className="th-sort" onClick={() => handleSort('name')}>
                Name <SortIcon k="name" />
              </th>
              <th className="th-sort" onClick={() => handleSort('price')}>
                Price <SortIcon k="price" />
              </th>
              <th className="th-sort" onClick={() => handleSort('change')}>
                24h <SortIcon k="change" />
              </th>
              <th>Volume</th>
              <th>Market Cap</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const isUp  = c.change >= 0
              const isFav = favorites.includes(c.sym)
              return (
                <tr key={c.sym}>
                  <td className="td-star">
                    <button
                      className={`star-btn ${isFav ? 'active' : ''}`}
                      onClick={() => toggleFav(c.sym)}
                    >★</button>
                  </td>
                  <td>
                    <div className="td-pair">
                      <CoinIcon coin={c} />
                      <div>
                        <div className="pair-name">{c.sym}</div>
                        <div className="pair-sub">{c.sym}/USDT</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-price font-mono">{fmt(c.price)}</td>
                  <td className={`td-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '↗' : '↘'} {isUp ? '+' : ''}{c.change.toFixed(2)}%
                  </td>
                  <td className="td-vol">{c.vol}</td>
                  <td className="td-mcap">{c.mcap}</td>
                  <td>
                    <button className="trade-btn">Trade</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
