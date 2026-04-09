import { useTicker } from '../hooks/useTicker'
import './Ticker.css'

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

export default function Ticker() {
  const pairs = useTicker()
  const doubled = [...pairs, ...pairs]

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        {doubled.map((p, i) => {
          const base = p.symbol.split('/')[0]
          const logo = COIN_LOGOS[base]
          const isUp = p.change >= 0

          return (
            <span key={i} className="ticker-item">
              {logo && (
                <img
                  src={logo}
                  alt={base}
                  className="coin-logo"
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <span className="ticker-symbol">{p.symbol}</span>
              <span className="ticker-price">
                {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className={`ticker-change ${isUp ? 'up' : 'down'}`}>
                {isUp ? '+' : ''}{p.change.toFixed(2)} ({isUp ? '+' : ''}{p.change.toFixed(2)}%)
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
