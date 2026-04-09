import { useTicker } from '../hooks/useTicker'
import './Ticker.css'

const TOKEN_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  BNB: '#F3BA2F',
  XRP: '#00A3FF',
  USD: '#38B2AC',
  EUR: '#7F9CF5',
  GBP: '#F687B3',
  default: '#4A5568',
}

function getBadgeColor(symbol) {
  const base = symbol.split('/')[0]
  return TOKEN_COLORS[base] || TOKEN_COLORS.default
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
        {doubled.map((p, i) => (
          <span key={i} className="ticker-item">
            <span
              className="ticker-icon"
              style={{ background: getBadgeColor(p.symbol) }}
            >
              {getBadgeLabel(p.symbol)}
            </span>
            <span className="ticker-symbol">{p.symbol}</span>
            <span className="ticker-price font-mono">
              {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className={`ticker-change font-mono ${p.change >= 0 ? 'up' : 'down'}`}>
              {p.change >= 0 ? '↑' : '↓'} {Math.abs(p.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
