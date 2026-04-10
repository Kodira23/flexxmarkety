import { useState, useMemo } from 'react'
import { useTicker } from '../hooks/useTicker'
import './Markets.css'

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
  PEPE: 'https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png',
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

function fmtVol(base) {
  const d = EXTRA_DATA[base]
  if (!d) return '—'
  return `$${d.volume}${d.volUnit}`
}

function fmtMcap(base) {
  const d = EXTRA_DATA[base]
  if (!d) return '—'
  return `$${d.mcap}${d.mcapUnit}`
}

export default function Markets() {
  const pairs = useTicker()
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [favorites, setFavorites] = useState(['BTC', 'ETH'])
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState('asc')

  const toggleFav = (sym) => {
    setFavorites(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    )
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const topGainers = useMemo(() =>
    [...pairs].sort((a, b) => b.change - a.change).slice(0, 3), [pairs])

  const topLosers = useMemo(() =>
    [...pairs].sort((a, b) => a.change - b.change).slice(0, 3), [pairs])

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
    <div className="dash-page">

      {/* Top Gainers / Losers */}
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
                    {logo
                      ? <img src={logo} alt={base} className="pair-coin-img" onError={e => e.target.style.display='none'} />
                      : <span className="pair-icon-fallback">{base.slice(0,3)}</span>
                    }
                  </div>
                  <div>
                    <div className="mover-sym">{base}</div>
                  </div>
                </div>
                <div className="mover-right">
                  <span className="mover-price font-mono">
                    ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
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
                    {logo
                      ? <img src={logo} alt={base} className="pair-coin-img" onError={e => e.target.style.display='none'} />
                      : <span className="pair-icon-fallback">{base.slice(0,3)}</span>
                    }
                  </div>
                  <div>
                    <div className="mover-sym">{base}</div>
                  </div>
                </div>
                <div className="mover-right">
                  <span className="mover-price font-mono">
                    ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className="mover-badge down">↘ {p.change.toFixed(2)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter + Search bar */}
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
              <th onClick={() => handleSort('name')} className="th-sort">
                Name <SortIcon k="name" />
              </th>
              <th onClick={() => handleSort('price')} className="th-sort">
                Price <SortIcon k="price" />
              </th>
              <th onClick={() => handleSort('change')} className="th-sort">
                24h <SortIcon k="change" />
              </th>
              <th>Volume</th>
              <th>Market Cap</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const base = p.symbol.split('/')[0]
              const logo = COIN_LOGOS[base]
              const isUp = p.change >= 0
              const isFav = favorites.includes(base)
              return (
                <tr key={p.symbol}>
                  <td className="td-star">
                    <button
                      className={`star-btn ${isFav ? 'active' : ''}`}
                      onClick={() => toggleFav(base)}
                    >
                      ★
                    </button>
                  </td>
                  <td className="td-pair">
                    <div className="pair-icon">
                      {logo
                        ? <img src={logo} alt={base} className="pair-coin-img" onError={e => { e.target.style.display='none' }} />
                        : <span className="pair-icon-fallback">{base.slice(0,3)}</span>
                      }
                    </div>
                    <div>
                      <div className="pair-name">{base}</div>
                      <div className="pair-sub">{base}/USDT</div>
                    </div>
                  </td>
                  <td className="td-price font-mono">
                    ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </td>
                  <td className={`td-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '↗' : '↘'} {isUp ? '+' : ''}{p.change.toFixed(2)}%
                  </td>
                  <td className="td-vol">{fmtVol(base)}</td>
                  <td className="td-mcap">{fmtMcap(base)}</td>
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
