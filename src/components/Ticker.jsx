import { useTicker } from '../hooks/useTicker'
import './Ticker.css'

const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  USDT: 'tether',
  USDC: 'usd-coin',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TRX: 'tron',
}

function getCoinLogo(symbol) {
  const base = symbol.split('/')[0]
  const id = COIN_IDS[base]
  if (id) return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${base.toLowerCase()}.png`
  return null
}

function getBadgeLabel(symbol) {
  return symbol.split('/')[0]
}

export default function Ticker() {
  const pairs = useTicker()
  const doubled = [...pairs, ...pairs]

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        {doubled.map((p, i) => {
          const logo = getCoinLogo(p.symbol)
          return (
            <span key={i} className="ticker-item">
              <span className="ticker-icon">
                {logo
                  ? <img src={logo} alt={getBadgeLabel(p.symbol)} className="coin-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                  : null
                }
                <span className="coin-fallback" style={{ display: logo ? 'none' : 'flex' }}>
                  {getBadgeLabel(p.symbol).slice(0, 3)}
                </span>
              </span>
              <span className="ticker-symbol">{p.symbol}</span>
              <span className="ticker-price font-mono">
                {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className={`ticker-change font-mono ${p.change >= 0 ? 'up' : 'down'}`}>
                {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
