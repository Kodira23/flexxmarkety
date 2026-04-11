import { useState, useMemo } from 'react'
import { useTicker } from '../hooks/useTicker'
import './Markets.css'

const COIN_LOGOS = {
  BTC:   'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH:   'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  XRP:   'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  BNB:   'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  SOL:   'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  DOGE:  'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  ADA:   'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  TRX:   'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  AVAX:  'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  LINK:  'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  SHIB:  'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
  SUI:   'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg',
  XLM:   'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
  DOT:   'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  HBAR:  'https://assets.coingecko.com/coins/images/3688/large/hbar.png',
  BCH:   'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
  UNI:   'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  LTC:   'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  PEPE:  'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
  NEAR:  'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
  ICP:   'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
  FET:   'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  RNDR:  'https://assets.coingecko.com/coins/images/11636/large/rndr.png',
  ARB:   'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
  ATOM:  'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  SEI:   'https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png',
  RUNE:  'https://assets.coingecko.com/coins/images/6595/large/Rune200x200.png',
  MKR:   'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
  QNT:   'https://assets.coingecko.com/coins/images/3370/large/5ZOu7brX_400x400.jpg',
  LDO:   'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png',
  GALA:  'https://assets.coingecko.com/coins/images/12493/large/GALA-COINGECKO.png',
  JASMY: 'https://assets.coingecko.com/coins/images/13876/large/JASMY200x200.jpg',
  SAND:  'https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg',
  FLOW:  'https://assets.coingecko.com/coins/images/13446/large/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png',
  MANA:  'https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png',
  AXS:   'https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png',
  APE:   'https://assets.coingecko.com/coins/images/24383/large/apecoin.jpg',
  OP:    'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
  INJ:   'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png',
  GRT:   'https://assets.coingecko.com/coins/images/13397/large/Graph_Token.png',
  AAVE:  'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
  SNX:   'https://assets.coingecko.com/coins/images/3406/large/SNX.png',
  CRV:   'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
  ENS:   'https://assets.coingecko.com/coins/images/19785/large/acatxTm8_400x400.jpg',
  BLUR:  'https://assets.coingecko.com/coins/images/28453/large/blur.png',
  IMX:   'https://assets.coingecko.com/coins/images/17233/large/immutableX-symbol-BLK-RGB.png',
  CAKE:  'https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo_%281%29.png',
  COMP:  'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
  YFI:   'https://assets.coingecko.com/coins/images/11849/large/yearn-finance.png',
  BAL:   'https://assets.coingecko.com/coins/images/11683/large/Balancer.png',
  ZRX:   'https://assets.coingecko.com/coins/images/863/large/0x.png',
  CHZ:   'https://assets.coingecko.com/coins/images/8834/large/Chiliz.png',
  ENJ:   'https://assets.coingecko.com/coins/images/1102/large/enjin-coin-logo.png',
  BAT:   'https://assets.coingecko.com/coins/images/677/large/basic-attention-token.png',
  ZIL:   'https://assets.coingecko.com/coins/images/2687/large/Zilliqa-logo.png',
  ONE:   'https://assets.coingecko.com/coins/images/4344/large/Y88JAze.png',
  KAVA:  'https://assets.coingecko.com/coins/images/9761/large/kava.png',
  ALGO:  'https://assets.coingecko.com/coins/images/4380/large/download.png',
  VET:   'https://assets.coingecko.com/coins/images/1167/large/VeChain-Logo-768x725.png',
  THETA: 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png',
  FIL:   'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
  EOS:   'https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png',
  XTZ:   'https://assets.coingecko.com/coins/images/976/large/Tezos-logo.png',
  IOTA:  'https://assets.coingecko.com/coins/images/692/large/IOTA_Swirl.png',
  NEO:   'https://assets.coingecko.com/coins/images/480/large/NEO_512_512.png',
  WAVES: 'https://assets.coingecko.com/coins/images/425/large/waves.png',
  DASH:  'https://assets.coingecko.com/coins/images/19/large/dash-logo.png',
  XMR:   'https://assets.coingecko.com/coins/images/69/large/monero_logo.png',
  ZEC:   'https://assets.coingecko.com/coins/images/486/large/circle-zcash-color.png',
  EGLD:  'https://assets.coingecko.com/coins/images/12335/large/egld-token-logo.png',
  ROSE:  'https://assets.coingecko.com/coins/images/13162/large/rose.png',
  KSM:   'https://assets.coingecko.com/coins/images/9568/large/m4zRhP5e_400x400.jpg',
  CELO:  'https://assets.coingecko.com/coins/images/11090/large/InjXBNx9_400x400.jpg',
  ANKR:  'https://assets.coingecko.com/coins/images/8455/large/Ankr.png',
  SKL:   'https://assets.coingecko.com/coins/images/13245/large/SKALE_token_300x300.png',
  STORJ: 'https://assets.coingecko.com/coins/images/949/large/storj.png',
  BAND:  'https://assets.coingecko.com/coins/images/9545/large/Band_token_blue_violet_token.png',
  WLD:   'https://assets.coingecko.com/coins/images/31069/large/worldcoin.jpeg',
  STX:   'https://assets.coingecko.com/coins/images/2069/large/Stacks_logo_full.png',
  CFX:   'https://assets.coingecko.com/coins/images/13079/large/3vuYMbjN.png',
  MAGIC: 'https://assets.coingecko.com/coins/images/18623/large/magic.png',
  TIA:   'https://assets.coingecko.com/coins/images/33172/large/celestia.png',
  PYTH:  'https://assets.coingecko.com/coins/images/31924/large/pyth.png',
  JTO:   'https://assets.coingecko.com/coins/images/33228/large/jto.png',
  JUP:   'https://assets.coingecko.com/coins/images/34188/large/jup.png',
  WIF:   'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg',
  BOME:  'https://assets.coingecko.com/coins/images/36709/large/bome.png',
  NOT:   'https://assets.coingecko.com/coins/images/36190/large/notcoin.jpg',
  IO:    'https://assets.coingecko.com/coins/images/36143/large/io.jpg',
  ZK:    'https://assets.coingecko.com/coins/images/36730/large/zksync.jpg',
  LISTA: 'https://assets.coingecko.com/coins/images/36893/large/lista.jpg',
  EIGEN: 'https://assets.coingecko.com/coins/images/37173/large/eigen.jpg',
  HMSTR: 'https://assets.coingecko.com/coins/images/39102/large/hamster.jpg',
  CATI:  'https://assets.coingecko.com/coins/images/39173/large/cati.jpg',
  DOGS:  'https://assets.coingecko.com/coins/images/39201/large/dogs.jpg',
  MAJOR: 'https://assets.coingecko.com/coins/images/39202/large/major.jpg',
  NEIRO: 'https://assets.coingecko.com/coins/images/39204/large/neiro.jpg',
}

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

function CoinIcon({ base, size = 36 }) {
  const [err, setErr] = useState(false)
  const logo = COIN_LOGOS[base]
  return (
    <div className="pair-icon" style={{ width: size, height: size, minWidth: size }}>
      {logo && !err
        ? <img
            src={logo}
            alt={base}
            className="pair-coin-img"
            width={size}
            height={size}
            onError={() => setErr(true)}
          />
        : <span className="pair-icon-fallback">{base.slice(0, 3)}</span>
      }
    </div>
  )
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

      {/* Top Gainers / Losers */}
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
        <div className="markets-table-scroll">
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
