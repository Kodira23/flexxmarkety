import { useState, useMemo, memo } from 'react'
import { useTicker } from '../hooks/useTicker'
import './Markets.css'

const COIN_COLORS = {
  BTC:'#F7931A', ETH:'#627EEA', XRP:'#00AAE4', BNB:'#F3BA2F',
  SOL:'#9945FF', DOGE:'#C2A633', ADA:'#0033AD', TRX:'#EF0027',
  AVAX:'#E84142', LINK:'#2A5ADA', SHIB:'#FFA409', SUI:'#4DA2FF',
  XLM:'#7D00FF', DOT:'#E6007A', HBAR:'#00BABC', BCH:'#8DC351',
  UNI:'#FF007A', LTC:'#BFBBBB', PEPE:'#00A550', NEAR:'#00C1DE',
  ICP:'#29ABE2', FET:'#1D2B55', MATIC:'#8247E5', RNDR:'#CC3000',
  ARB:'#28A0F0', ATOM:'#2E3148', SEI:'#9B1C1C', RUNE:'#2ECC71',
  MKR:'#1AAB9B', QNT:'#272D5A', LDO:'#00A3FF', GALA:'#0033FF',
  JASMY:'#2B4EFF', SAND:'#04ADEF', FLOW:'#00EF8B', MANA:'#FF2D55',
  AXS:'#0055D5', APE:'#0054F9', OP:'#FF0420', INJ:'#00BFFF',
  GRT:'#6F4CFF', AAVE:'#B6509E', SNX:'#00D1FF', CRV:'#D63636',
  ENS:'#5284FF', BLUR:'#FF8700', IMX:'#17B5CB', CAKE:'#FE8C00',
  COMP:'#00D395', YFI:'#006AE3', BAL:'#666', ZRX:'#888',
  CHZ:'#CD0124', ENJ:'#7866D5', BAT:'#FF5000', ZIL:'#29CCC4',
  ONE:'#00AEE9', KAVA:'#FF564F', ALGO:'#3A3A3A', VET:'#15BDFF',
  THETA:'#2AB8E6', FIL:'#0090FF', EOS:'#454545', XTZ:'#2C7DF7',
  IOTA:'#131F37', NEO:'#58BF00', WAVES:'#0155FF', DASH:'#008DE4',
  XMR:'#FF6600', ZEC:'#ECB244', EGLD:'#1A4FE0', ROSE:'#4E8DFF',
  KSM:'#333', CELO:'#FBCC5C', ANKR:'#0066FF', SKL:'#444',
  STORJ:'#2683FF', BAND:'#4520E6', WLD:'#333', STX:'#5546FF',
  CFX:'#E15F1A', MAGIC:'#E2175F', TIA:'#7B2FBE', PYTH:'#8B5CF6',
  JTO:'#9945FF', JUP:'#7AC231', WIF:'#B08850', BOME:'#FF4B00',
  NOT:'#56A8FF', IO:'#00D4FF', ZK:'#1B53FF', LISTA:'#F0B90B',
  EIGEN:'#5A67D8', HMSTR:'#FF8C00', CATI:'#FFD700', DOGS:'#8B4513',
  MAJOR:'#4169E1', NEIRO:'#FF69B4',
}

const ICON_SUPPORTED = new Set([
  'BTC','ETH','XRP','BNB','SOL','DOGE','ADA','TRX','AVAX','LINK',
  'SHIB','XLM','DOT','BCH','UNI','LTC','NEAR','MATIC','ARB','ATOM',
  'MKR','SAND','FLOW','MANA','AXS','APE','OP','GRT','AAVE','SNX',
  'CRV','ENJ','BAT','ZIL','KAVA','ALGO','VET','THETA','FIL','EOS',
  'XTZ','NEO','WAVES','DASH','XMR','ZEC','KSM','ANKR','STORJ','BAND',
  'STX','COMP','YFI','BAL','ZRX','CHZ','ENS','CAKE','IMX','ONE',
])

const CoinIcon = memo(function CoinIcon({ base, size = 36 }) {
  const [failed, setFailed] = useState(false)
  const color = COIN_COLORS[base] || '#555'
  const fontSize = size <= 20 ? 7 : size <= 24 ? 8 : size <= 32 ? 11 : 13

  if (!ICON_SUPPORTED.has(base) || failed) {
    return (
      <div style={{
        width: size, height: size, minWidth: size, flexShrink: 0,
        borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 800, color: '#fff',
        letterSpacing: '-0.5px', userSelect: 'none',
      }}>
        {base.slice(0, 3)}
      </div>
    )
  }

  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${base.toLowerCase()}.png`}
      alt={base}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block' }}
      onError={() => setFailed(true)}
    />
  )
})

const EXTRA_DATA = {
  BTC:   { vol: '$42.50B',  mcap: '$1920.00B' },
  ETH:   { vol: '$18.20B',  mcap: '$415.00B'  },
  XRP:   { vol: '$5.20B',   mcap: '$135.00B'  },
  BNB:   { vol: '$1.80B',   mcap: '$98.00B'   },
  SOL:   { vol: '$4.80B',   mcap: '$82.00B'   },
  DOGE:  { vol: '$2.80B',   mcap: '$47.00B'   },
  ADA:   { vol: '$980.00M', mcap: '$33.50B'   },
  TRX:   { vol: '$620.00M', mcap: '$21.00B'   },
  AVAX:  { vol: '$780.00M', mcap: '$17.20B'   },
  LINK:  { vol: '$920.00M', mcap: '$14.50B'   },
  SHIB:  { vol: '$450.00M', mcap: '$13.00B'   },
  SUI:   { vol: '$680.00M', mcap: '$12.80B'   },
  XLM:   { vol: '$280.00M', mcap: '$12.50B'   },
  DOT:   { vol: '$420.00M', mcap: '$10.80B'   },
  HBAR:  { vol: '$380.00M', mcap: '$10.50B'   },
  BCH:   { vol: '$380.00M', mcap: '$9.50B'    },
  UNI:   { vol: '$220.00M', mcap: '$8.70B'    },
  LTC:   { vol: '$520.00M', mcap: '$8.10B'    },
  PEPE:  { vol: '$1.20B',   mcap: '$8.00B'    },
  NEAR:  { vol: '$320.00M', mcap: '$5.80B'    },
  ICP:   { vol: '$185.00M', mcap: '$5.40B'    },
  FET:   { vol: '$420.00M', mcap: '$5.30B'    },
  MATIC: { vol: '$320.00M', mcap: '$4.80B'    },
  RNDR:  { vol: '$320.00M', mcap: '$4.40B'    },
  ARB:   { vol: '$380.00M', mcap: '$4.40B'    },
  ATOM:  { vol: '$180.00M', mcap: '$3.90B'    },
  SEI:   { vol: '$280.00M', mcap: '$1.80B'    },
  RUNE:  { vol: '$185.00M', mcap: '$1.80B'    },
  MKR:   { vol: '$95.00M',  mcap: '$1.70B'    },
  QNT:   { vol: '$42.00M',  mcap: '$1.70B'    },
  LDO:   { vol: '$145.00M', mcap: '$1.70B'    },
  GALA:  { vol: '$185.00M', mcap: '$1.60B'    },
  JASMY: { vol: '$185.00M', mcap: '$1.60B'    },
  SAND:  { vol: '$145.00M', mcap: '$1.40B'    },
  FLOW:  { vol: '$65.00M',  mcap: '$1.30B'    },
  MANA:  { vol: '$95.00M',  mcap: '$720.00M'  },
  AXS:   { vol: '$75.00M',  mcap: '$680.00M'  },
  APE:   { vol: '$85.00M',  mcap: '$480.00M'  },
  OP:    { vol: '$210.00M', mcap: '$2.30B'    },
  INJ:   { vol: '$180.00M', mcap: '$2.10B'    },
  GRT:   { vol: '$65.00M',  mcap: '$420.00M'  },
  AAVE:  { vol: '$95.00M',  mcap: '$2.80B'    },
  SNX:   { vol: '$45.00M',  mcap: '$380.00M'  },
  CRV:   { vol: '$55.00M',  mcap: '$310.00M'  },
  ENS:   { vol: '$35.00M',  mcap: '$850.00M'  },
  BLUR:  { vol: '$42.00M',  mcap: '$320.00M'  },
  IMX:   { vol: '$65.00M',  mcap: '$1.20B'    },
  CAKE:  { vol: '$55.00M',  mcap: '$580.00M'  },
  COMP:  { vol: '$28.00M',  mcap: '$580.00M'  },
  YFI:   { vol: '$22.00M',  mcap: '$240.00M'  },
  BAL:   { vol: '$18.00M',  mcap: '$185.00M'  },
  ZRX:   { vol: '$15.00M',  mcap: '$360.00M'  },
  CHZ:   { vol: '$45.00M',  mcap: '$480.00M'  },
  ENJ:   { vol: '$18.00M',  mcap: '$185.00M'  },
  BAT:   { vol: '$22.00M',  mcap: '$340.00M'  },
  ZIL:   { vol: '$12.00M',  mcap: '$340.00M'  },
  ONE:   { vol: '$8.00M',   mcap: '$225.00M'  },
  KAVA:  { vol: '$18.00M',  mcap: '$225.00M'  },
  ALGO:  { vol: '$32.00M',  mcap: '$1.40B'    },
  VET:   { vol: '$28.00M',  mcap: '$2.60B'    },
  THETA: { vol: '$22.00M',  mcap: '$1.45B'    },
  FIL:   { vol: '$85.00M',  mcap: '$2.20B'    },
  EOS:   { vol: '$35.00M',  mcap: '$1.10B'    },
  XTZ:   { vol: '$18.00M',  mcap: '$680.00M'  },
  IOTA:  { vol: '$12.00M',  mcap: '$610.00M'  },
  NEO:   { vol: '$22.00M',  mcap: '$810.00M'  },
  WAVES: { vol: '$15.00M',  mcap: '$195.00M'  },
  DASH:  { vol: '$35.00M',  mcap: '$310.00M'  },
  XMR:   { vol: '$55.00M',  mcap: '$3.00B'    },
  ZEC:   { vol: '$25.00M',  mcap: '$450.00M'  },
  EGLD:  { vol: '$28.00M',  mcap: '$875.00M'  },
  ROSE:  { vol: '$22.00M',  mcap: '$215.00M'  },
  KSM:   { vol: '$18.00M',  mcap: '$385.00M'  },
  CELO:  { vol: '$12.00M',  mcap: '$415.00M'  },
  ANKR:  { vol: '$15.00M',  mcap: '$385.00M'  },
  SKL:   { vol: '$8.00M',   mcap: '$185.00M'  },
  STORJ: { vol: '$12.00M',  mcap: '$175.00M'  },
  BAND:  { vol: '$8.00M',   mcap: '$120.00M'  },
  WLD:   { vol: '$85.00M',  mcap: '$1.20B'    },
  STX:   { vol: '$55.00M',  mcap: '$2.50B'    },
  CFX:   { vol: '$35.00M',  mcap: '$520.00M'  },
  MAGIC: { vol: '$22.00M',  mcap: '$280.00M'  },
  TIA:   { vol: '$75.00M',  mcap: '$1.50B'    },
  PYTH:  { vol: '$55.00M',  mcap: '$1.20B'    },
  JTO:   { vol: '$35.00M',  mcap: '$580.00M'  },
  JUP:   { vol: '$65.00M',  mcap: '$760.00M'  },
  WIF:   { vol: '$185.00M', mcap: '$1.45B'    },
  BOME:  { vol: '$95.00M',  mcap: '$580.00M'  },
  NOT:   { vol: '$45.00M',  mcap: '$620.00M'  },
  IO:    { vol: '$28.00M',  mcap: '$340.00M'  },
  ZK:    { vol: '$35.00M',  mcap: '$480.00M'  },
  LISTA: { vol: '$22.00M',  mcap: '$450.00M'  },
  EIGEN: { vol: '$42.00M',  mcap: '$560.00M'  },
  HMSTR: { vol: '$18.00M',  mcap: '$350.00M'  },
  CATI:  { vol: '$15.00M',  mcap: '$180.00M'  },
  DOGS:  { vol: '$12.00M',  mcap: '$150.00M'  },
  MAJOR: { vol: '$8.00M',   mcap: '$420.00M'  },
  NEIRO: { vol: '$35.00M',  mcap: '$800.00M'  },
}

const fmt = (p) => {
  if (p >= 1000) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (p >= 1)    return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toFixed(8)}`
}

export default function Markets() {
  const pairs = useTicker()
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [favorites, setFavorites] = useState(['BTC', 'ETH'])
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState('asc')

  const toggleFav = (sym) =>
    setFavorites(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym])

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
    const base = (p) => p.symbol.split('/')[0]
    if (filter === 'gainers')   list = list.filter(p => p.change >= 0)
    if (filter === 'losers')    list = list.filter(p => p.change < 0)
    if (filter === 'favorites') list = list.filter(p => favorites.includes(base(p)))
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

      <div className="movers-grid">
        {[
          { label: '🔥 Top Gainers', list: topGainers, isGain: true  },
          { label: '⚡ Top Losers',  list: topLosers,  isGain: false },
        ].map(({ label, list, isGain }) => (
          <div key={label} className="movers-card card">
            <div className="movers-title">{label}</div>
            {list.map(p => {
              const base = p.symbol.split('/')[0]
              return (
                <div key={p.symbol} className="mover-row">
                  <div className="mover-left">
                    <CoinIcon base={base} size={32} />
                    <div className="mover-sym">{base}</div>
                  </div>
                  <div className="mover-right">
                    <span className="mover-price font-mono">{fmt(p.price)}</span>
                    <span className={`mover-badge ${isGain ? 'up' : 'down'}`}>
                      {isGain ? `↗ +${p.change.toFixed(2)}%` : `↘ ${p.change.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

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

      <div className="card markets-table-card">
        <div className="markets-table-scroll">
          <table className="markets-table">
            <thead>
              <tr>
                <th></th>
                <th className="th-sort" onClick={() => handleSort('name')}>Name <SortIcon k="name" /></th>
                <th className="th-sort" onClick={() => handleSort('price')}>Price <SortIcon k="price" /></th>
                <th className="th-sort" onClick={() => handleSort('change')}>24h <SortIcon k="change" /></th>
                <th>Volume</th>
                <th>Market Cap</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const base  = p.symbol.split('/')[0]
                const isUp  = p.change >= 0
                const isFav = favorites.includes(base)
                const extra = EXTRA_DATA[base] || { vol: '—', mcap: '—' }
                return (
                  <tr key={p.symbol}>
                    <td className="td-star">
                      <button
                        className={`star-btn ${isFav ? 'active' : ''}`}
                        onClick={() => toggleFav(base)}
                      >★</button>
                    </td>
                    <td>
                      <div className="td-pair">
                        <CoinIcon base={base} size={36} />
                        <div>
                          <div className="pair-name">{base}</div>
                          <div className="pair-sub">{base}/USDT</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-price font-mono">{fmt(p.price)}</td>
                    <td className={`td-change ${isUp ? 'up' : 'down'}`}>
                      {isUp ? '↗' : '↘'} {isUp ? '+' : ''}{p.change.toFixed(2)}%
                    </td>
                    <td className="td-vol">{extra.vol}</td>
                    <td className="td-mcap">{extra.mcap}</td>
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
