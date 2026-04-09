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
}

export default function Markets() {
  const pairs = useTicker()

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Markets</h1>
          <p className="dash-sub">Live market data across all pairs</p>
        </div>
      </div>
      <div className="card markets-table-card">
        <table className="markets-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pair</th>
              <th>Price</th>
              <th>Change 24h</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => {
              const base = p.symbol.split('/')[0]
              const logo = COIN_LOGOS[base]
              const isUp = p.change >= 0
              return (
                <tr key={p.symbol}>
                  <td className="td-num">{i + 1}</td>
                  <td className="td-pair">
                    <div className="pair-icon">
                      {logo
                        ? <img src={logo} alt={base} className="pair-coin-img" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                        : null
                      }
                      <span className="pair-icon-fallback" style={{ display: logo ? 'none' : 'flex' }}>
                        {base.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <div className="pair-name">{p.symbol}</div>
                    </div>
                  </td>
                  <td className="td-price font-mono">
                    {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </td>
                  <td className={`td-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '↑' : '↓'} {Math.abs(p.change).toFixed(2)}%
                  </td>
                  <td>
                    <button className="trade-btn">Trade →</button>
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
