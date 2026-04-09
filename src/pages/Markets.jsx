import { useTicker } from '../hooks/useTicker'
import './Markets.css'

const COIN_LOGOS = {
  BTC:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png',
  ETH:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png',
  BNB:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png',
  SOL:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png',
  XRP:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png',
  ADA:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png',
  DOGE: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png',
  TRX:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/trx.png',
  AVAX: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png',
  LINK: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png',
  DOT:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png',
  MATIC:'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/matic.png',
  LTC:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ltc.png',
  UNI:  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/uni.png',
  ATOM: 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/atom.png',
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
