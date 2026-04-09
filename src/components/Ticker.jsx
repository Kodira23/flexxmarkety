import { useTicker } from '../hooks/useTicker'
import './Ticker.css'

function getCoinLogo(symbol) {
  const base = symbol.split('/')[0].toLowerCase()
  return `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`
    .replace('1/small/bitcoin', getCoinGeckoPath(base))
}

function getCoinGeckoPath(base) {
  const map = {
    btc: '1/small/bitcoin',
    eth: '279/small/ethereum',
    bnb: '825/small/binance-coin-logo',
    sol: '4128/small/solana',
    xrp: '44/small/xrp-symbol-white-128',
    doge: '5/small/dogecoin',
    ada: '975/small/cardano',
    trx: '1094/small/tron-logo',
    usdt: '325/small/Tether',
    usdc: '6319/small/USD_Coin_icon',
  }
  return map[base] || '1/small/bitcoin'
}

export default function Ticker() {
  const pairs = useTicker()
  const doubled = [...pairs, ...pairs]

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        {doubled.map((p, i) => {
          const base = p.symbol.split('/')[0].toLowerCase()
          const logo = getCoinLogo(p.symbol)
          const isUp = p.change >= 0

          return (
            <span key={i} className="ticker-item">
              <img
                src={logo}
                alt={base}
                className="coin-logo"
                onError={e => e.target.style.display = 'none'}
              />
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
