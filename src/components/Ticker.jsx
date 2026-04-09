import { useTicker } from '../hooks/useTicker'
import './Ticker.css'

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
