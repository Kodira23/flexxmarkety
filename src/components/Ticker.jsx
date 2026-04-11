import { useState } from 'react'
import { useTicker } from '../hooks/useTicker'
import './Ticker.css'

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

// Coins available in the cryptocurrency-icons package
const ICON_SUPPORTED = new Set([
  'BTC','ETH','XRP','BNB','SOL','DOGE','ADA','TRX','AVAX','LINK',
  'SHIB','XLM','DOT','BCH','UNI','LTC','NEAR','MATIC','ARB','ATOM',
  'MKR','SAND','FLOW','MANA','AXS','APE','OP','GRT','AAVE','SNX',
  'CRV','ENJ','BAT','ZIL','KAVA','ALGO','VET','THETA','FIL','EOS',
  'XTZ','NEO','WAVES','DASH','XMR','ZEC','KSM','ANKR','STORJ','BAND',
  'STX','COMP','YFI','BAL','ZRX','CHZ','ENS','CAKE','IMX','ONE',
])

function CoinIcon({ base, size }) {
  const [failed, setFailed] = useState(false)
  const color = COIN_COLORS[base] || '#555'
  const fontSize = size <= 20 ? 7 : size <= 24 ? 8 : size <= 32 ? 11 : 13

  if (!ICON_SUPPORTED.has(base) || failed) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, minWidth: size, flexShrink: 0,
        borderRadius: '50%', background: color,
        fontSize, fontWeight: 800, color: '#fff',
        letterSpacing: '-0.5px', userSelect: 'none',
      }}>
        {base.slice(0, 3)}
      </span>
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
}

export default function Ticker() {
  const pairs = useTicker()
  const doubled = [...pairs, ...pairs]

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        {doubled.map((p, i) => {
          const base = p.symbol.split('/')[0]
          const isUp = p.change >= 0
          return (
            <span key={i} className="ticker-item">
              <CoinIcon base={base} size={20} />
              <span className="ticker-symbol">{p.symbol}</span>
              <span className="ticker-price">
                {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className={`ticker-change ${isUp ? 'up' : 'down'}`}>
                {isUp ? '+' : ''}{p.change.toFixed(2)}%
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
