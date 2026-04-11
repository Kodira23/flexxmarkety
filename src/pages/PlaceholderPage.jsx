import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTicker } from '../hooks/useTicker'
import { supabase } from '../supabase'
import { useBalance } from './Dashboard'
import './PlaceholderPage.css'

const MIN_BALANCE = 50

// ── COIN LOGOS + FALLBACK COLORS ─────────────────────────────────────
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

const COIN_COLORS = {
  BTC:'#F7931A', ETH:'#627EEA', XRP:'#00AAE4', BNB:'#F3BA2F',
  SOL:'#9945FF', DOGE:'#C2A633', ADA:'#0033AD', TRX:'#EF0027',
  AVAX:'#E84142', LINK:'#2A5ADA', SHIB:'#FFA409', SUI:'#4DA2FF',
  XLM:'#7D00FF', DOT:'#E6007A', HBAR:'#00BABC', BCH:'#8DC351',
  UNI:'#FF007A', LTC:'#A8A9AD', PEPE:'#00A550', NEAR:'#00C1DE',
  ICP:'#29ABE2', FET:'#1D2B55', MATIC:'#8247E5', RNDR:'#CC3000',
  ARB:'#28A0F0', ATOM:'#6F7390', SEI:'#CC3333', RUNE:'#2ECC71',
  MKR:'#1AAB9B', QNT:'#272D5A', LDO:'#00A3FF', GALA:'#0033FF',
  JASMY:'#2B4EFF', SAND:'#04ADEF', FLOW:'#00EF8B', MANA:'#FF2D55',
  AXS:'#0055D5', APE:'#0054F9', OP:'#FF0420', INJ:'#00BFFF',
  GRT:'#6F4CFF', AAVE:'#B6509E', SNX:'#00D1FF', CRV:'#D63636',
  ENS:'#5284FF', BLUR:'#FF8700', IMX:'#17B5CB', CAKE:'#FE8C00',
  COMP:'#00D395', YFI:'#006AE3', BAL:'#1E1E1E', ZRX:'#555',
  CHZ:'#CD0124', ENJ:'#7866D5', BAT:'#FF5000', ZIL:'#29CCC4',
  ONE:'#00AEE9', KAVA:'#FF564F', ALGO:'#3A3A3A', VET:'#15BDFF',
  THETA:'#2AB8E6', FIL:'#0090FF', EOS:'#454545', XTZ:'#2C7DF7',
  IOTA:'#131F37', NEO:'#58BF00', WAVES:'#0155FF', DASH:'#008DE4',
  XMR:'#FF6600', ZEC:'#ECB244', EGLD:'#1A4FE0', ROSE:'#4E8DFF',
  KSM:'#E6007A', CELO:'#FBCC5C', ANKR:'#0066FF', SKL:'#444',
  STORJ:'#2683FF', BAND:'#4520E6', WLD:'#555', STX:'#5546FF',
  CFX:'#E15F1A', MAGIC:'#E2175F', TIA:'#7B2FBE', PYTH:'#8B5CF6',
  JTO:'#9945FF', JUP:'#7AC231', WIF:'#B08850', BOME:'#FF4B00',
  NOT:'#56A8FF', IO:'#00D4FF', ZK:'#1B53FF', LISTA:'#F0B90B',
  EIGEN:'#5A67D8', HMSTR:'#FF8C00', CATI:'#FFD700', DOGS:'#8B4513',
  MAJOR:'#4169E1', NEIRO:'#FF69B4',
}

// Try real logo, fall back to colored circle
function CoinCircle({ base, size = 36 }) {
  const [failed, setFailed] = useState(false)
  const logo  = COIN_LOGOS[base]
  const color = COIN_COLORS[base] || '#555'
  const label = base.length <= 2 ? base : base.slice(0, 2)
  const fontSize = size <= 20 ? 8 : size <= 32 ? 11 : 13

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={base}
        width={size}
        height={size}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, minWidth: size,
      borderRadius: '50%', backgroundColor: color,
      fontSize, fontWeight: 900, color: '#fff',
      flexShrink: 0, userSelect: 'none', lineHeight: 1,
      fontFamily: 'Inter, sans-serif', verticalAlign: 'middle',
    }}>
      {label}
    </span>
  )
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

// ── BOT DEFINITIONS ────────────────────────────────────────────────────
// $100 → $200 in 5 minutes = 300s
// interval=3000ms → 100 ticks in 300s
// Each tick: stake = alloc * 0.1, gained = stake * r
// Need total gain = $100 on $100 alloc
// Per tick needed: $100/100 = $1, stake=$10, so r=0.10 per tick on average
// With losses included: some ticks lose ~30%, net drift must still = 0.10
// So drift=0.13, volatility=0.06 → ~70% win rate, net ≈ 0.10/tick
const BOT_CONFIGS = [
  {
    id: 1,
    name: 'Bitcoin Accumulation',
    subtitle: 'Weekly • DCA',
    description: 'Dollar-cost averaging into Bitcoin on a weekly basis.',
    risk: 'Low',
    interval: 3000,
    drift: 0.14,
    volatility: 0.05,
    lossChance: 0.25,   // 25% losses → ~75% win rate
    lossMult: 0.35,     // losses are small
  },
  {
    id: 2,
    name: 'ETH DCA Pro',
    subtitle: 'Daily • DCA',
    description: 'Dynamic DCA based on RSI and volume indicators.',
    risk: 'Medium',
    interval: 3000,
    drift: 0.14,
    volatility: 0.06,
    lossChance: 0.26,   // 26% losses → ~74% win rate
    lossMult: 0.38,
  },
]

// ── INSUFFICIENT BALANCE BANNER ────────────────────────────────────────
function InsufficientBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff4d6a22, #ff4d6a08)',
      border: '1px solid #ff4d6a66', borderRadius: 14,
      padding: '20px 24px', marginBottom: 28,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#ff4d6a', marginBottom: 4 }}>
          Insufficient Balance
        </div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          You need a minimum of <strong>${MIN_BALANCE}.00</strong> to configure and run trading bots.
          Please deposit funds to get started.
        </div>
      </div>
    </div>
  )
}

// ── SINGLE BOT CARD ────────────────────────────────────────────────────
function BotCard({ bot, balance, userId }) {
  const canRun       = balance >= MIN_BALANCE
  const [active,     setActive]     = useState(false)
  const [configured, setConfigured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [allocation, setAllocation] = useState('')
  const [log,        setLog]        = useState([])
  const [pnl,        setPnl]        = useState(0)
  const [wins,       setWins]       = useState(0)
  const [losses,     setLosses]     = useState(0)
  const intervalRef  = useRef(null)
  const allocatedRef = useRef(0)

  useEffect(() => () => clearInterval(intervalRef.current), [])

  function addLog(msg, color = '#aaa') {
    setLog(prev => [{ msg, color, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...prev].slice(0, 8))
  }

  async function applyDelta(delta) {
    const { data } = await supabase.from('balances').select('amount').eq('user_id', userId).maybeSingle()
    const current  = data?.amount ?? 0
    const next     = Math.max(0, parseFloat((current + delta).toFixed(2)))
    await supabase.from('balances').update({ amount: next, updated_at: new Date().toISOString() }).eq('user_id', userId)
    return delta
  }

  const winsRef   = useRef(0)
  const lossesRef = useRef(0)

  function tick() {
    const total      = winsRef.current + lossesRef.current
    const currentWR  = total > 0 ? winsRef.current / total : 1
    // Force a win if win rate drops below 74%
    const forceWin   = currentWR < 0.74
    const isLoss     = forceWin ? false : Math.random() < bot.lossChance
    const noise      = (Math.random() * bot.volatility)
    const r          = isLoss
      ? -(bot.drift * bot.lossMult + noise)
      : (bot.drift + noise)
    const stake  = allocatedRef.current * 0.1
    const gained = parseFloat((stake * r).toFixed(2))

    applyDelta(gained).then(() => {
      setPnl(prev => parseFloat((prev + gained).toFixed(2)))
      if (gained >= 0) { setWins(w => w + 1); winsRef.current += 1 }
      else             { setLosses(l => l + 1); lossesRef.current += 1 }
      const up = gained >= 0
      addLog(
        `${up ? '↑' : '↓'} Trade ${up ? '+' : ''}$${gained.toFixed(2)} (${(r * 100).toFixed(2)}%)`,
        up ? '#16a34a' : '#ff4d6a'
      )
    })
  }

  function handleConfigure() {
    if (!canRun) return
    setShowConfig(v => !v)
  }

  async function handleStart() {
    if (!canRun || !configured) return
    if (active) {
      clearInterval(intervalRef.current)
      setActive(false)
      addLog('🛑 Bot stopped', '#ffaa00')
      return
    }
    const alloc = parseFloat(allocation)
    if (!alloc || alloc < 10) { addLog('⚠️ Set allocation ≥ $10 first', '#ff4d6a'); return }
    if (alloc > balance)      { addLog('⚠️ Allocation exceeds balance',  '#ff4d6a'); return }
    allocatedRef.current = alloc
    setActive(true)
    addLog(`🚀 Bot started with $${alloc.toFixed(2)} allocation`, '#16a34a')
    intervalRef.current = setInterval(tick, bot.interval)
  }

  function handleSaveConfig() {
    const alloc = parseFloat(allocation)
    if (!alloc || alloc < 10) { addLog('⚠️ Enter allocation ≥ $10', '#ff4d6a'); return }
    if (alloc > balance)      { addLog('⚠️ Allocation exceeds balance', '#ff4d6a'); return }
    setConfigured(true)
    setShowConfig(false)
    addLog(`✅ Configured — $${alloc.toFixed(2)} allocated`, '#16a34a')
  }

  const totalTrades  = wins + losses
  const statusLabel  = active ? 'Running' : configured ? 'Ready' : 'Not Configured'
  const statusColor  = active ? '#16a34a' : configured ? '#ffaa00' : '#888'
  const configureIsNext = canRun && !configured && !showConfig
  const saveIsNext      = showConfig
  const startIsNext     = canRun && configured && !active

  return (
    <div className="bot-card" style={{ opacity: canRun ? 1 : 0.55 }}>
      <div className="bot-card-top">
        <div>
          <div className="bot-name">{bot.name}</div>
          <div className="bot-subtitle">{bot.subtitle}</div>
        </div>
        <div className="bot-status-badge" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}55` }}>
          {active && <span style={{ marginRight: 5 }}>●</span>}{statusLabel}
        </div>
      </div>

      <p className="bot-desc">{bot.description}</p>

      <div className="bot-meta">
        <div className="bot-meta-item">
          <span className="bot-meta-label">Risk</span>
          <span className={`bot-meta-value risk-${bot.risk.toLowerCase()}`}>{bot.risk}</span>
        </div>
        <div className="bot-meta-item">
          <span className="bot-meta-label">P&L</span>
          <span className="bot-meta-value" style={{ color: pnl >= 0 ? '#16a34a' : '#ff4d6a', fontWeight: 700 }}>
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
          </span>
        </div>
        <div className="bot-meta-item">
          <span className="bot-meta-label">Wins</span>
          <span className="bot-meta-value" style={{ color: '#16a34a' }}>{wins}</span>
        </div>
        <div className="bot-meta-item">
          <span className="bot-meta-label">Losses</span>
          <span className="bot-meta-value" style={{ color: '#ff4d6a' }}>{losses}</span>
        </div>
        {totalTrades > 0 && (
          <div className="bot-meta-item">
            <span className="bot-meta-label">Win Rate</span>
            <span className="bot-meta-value">{((wins / totalTrades) * 100).toFixed(0)}%</span>
          </div>
        )}
        {configured && (
          <div className="bot-meta-item">
            <span className="bot-meta-label">Allocation</span>
            <span className="bot-meta-value">${parseFloat(allocation || 0).toFixed(2)}</span>
          </div>
        )}
      </div>

      {canRun && !active && (
        <div className="bot-steps">
          <div className={`bot-step ${!configured ? 'active-step' : 'done-step'}`}>
            <span className="step-num">{!configured ? '1' : '✓'}</span>
            <span>Configure</span>
          </div>
          <div className="step-line" />
          <div className={`bot-step ${configured && !active ? 'active-step' : configured ? 'done-step' : 'inactive-step'}`}>
            <span className="step-num">2</span>
            <span>Start Bot</span>
          </div>
        </div>
      )}

      {showConfig && (
        <div style={{ background: '#ffffff08', border: '1px solid #ffffff15', borderRadius: 10, padding: '14px 16px', margin: '10px 0' }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
            Available balance: <strong>${Number(balance).toFixed(2)}</strong>
          </div>
          <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 6 }}>Allocation amount (USD)</label>
          <input
            type="number" min="10" max={balance} placeholder="e.g. 100"
            value={allocation} onChange={e => setAllocation(e.target.value)}
            style={{ width: '100%', background: '#ffffff10', border: '1px solid #ffffff20', borderRadius: 8, padding: '8px 12px', color: 'inherit', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`bot-btn-start ${saveIsNext ? 'btn-next' : ''}`} onClick={handleSaveConfig} style={{ flex: 1 }}>
              💾 Save Config
            </button>
            <button className="bot-btn-configure" onClick={() => setShowConfig(false)} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div style={{ background: '#000000aa', borderRadius: 8, padding: '8px 12px', margin: '8px 0', maxHeight: 120, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.color, marginBottom: 2 }}>
              <span style={{ opacity: 0.45, marginRight: 6 }}>{l.ts}</span>{l.msg}
            </div>
          ))}
        </div>
      )}

      <div className="bot-actions">
        <button className={`bot-btn-configure ${configureIsNext ? 'btn-next' : ''}`} onClick={handleConfigure} disabled={!canRun || active}>
          {showConfig ? '✕ Close Config' : '⚙️ Configure'}
        </button>
        <button
          className={`bot-btn-start ${startIsNext ? 'btn-next' : ''}`}
          onClick={handleStart}
          disabled={!canRun || !configured}
          style={active ? { background: '#ff4d6a22', color: '#ff4d6a', border: '1px solid #ff4d6a55' } : {}}
        >
          {active ? `⏹ Stop Bot` : `▶ Start Bot`}
        </button>
      </div>
    </div>
  )
}

// ── PLACEHOLDER ────────────────────────────────────────────────────────
function PlaceholderPage({ title, icon, description }) {
  return (
    <div className="dash-main">
      <div className="placeholder-content">
        <div className="placeholder-card card">
          <div className="ph-icon">{icon}</div>
          <h2 className="ph-title">{title}</h2>
          <p className="ph-desc">{description}</p>
          <div className="ph-badge">Coming Soon</div>
        </div>
      </div>
    </div>
  )
}

// ── MARKETS PAGE ───────────────────────────────────────────────────────
export function MarketsPage() {
  const pairs = useTicker()
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [favorites, setFavorites] = useState(['BTC', 'ETH'])
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState('asc')

  const toggleFav = sym =>
    setFavorites(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym])

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const topGainers = useMemo(() => [...pairs].sort((a, b) => b.change - a.change).slice(0, 3), [pairs])
  const topLosers  = useMemo(() => [...pairs].sort((a, b) => a.change - b.change).slice(0, 3), [pairs])

  const filtered = useMemo(() => {
    let list = [...pairs]
    if (filter === 'gainers')   list = list.filter(p => p.change >= 0)
    if (filter === 'losers')    list = list.filter(p => p.change < 0)
    if (filter === 'favorites') list = list.filter(p => favorites.includes(p.symbol.split('/')[0]))
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
    <div className="dash-main">
      <div className="dash-content" style={{ padding: '24px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>Markets</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Explore and trade cryptocurrencies</p>
        </div>
        {/* Top Gainers / Losers */}
        <div className="movers-grid">
          {[
            { label: '🔥 Top Gainers', list: topGainers, isGain: true },
            { label: '⚡ Top Losers',  list: topLosers,  isGain: false },
          ].map(({ label, list, isGain }) => (
            <div key={label} className="movers-card card">
              <div className="movers-title">{label}</div>
              {list.map(p => {
                const base = p.symbol.split('/')[0]
                return (
                  <div key={p.symbol} className="mover-row">
                    <div className="mover-left">
                      <CoinCircle base={base} size={32} />
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
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'favorites' ? '★' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="markets-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search markets..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          </div>
        </div>

        {/* Table */}
        <div className="card markets-table-card">
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="markets-table" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th></th>
                  <th onClick={() => handleSort('name')}   className="th-sort">Name   <SortIcon k="name"   /></th>
                  <th onClick={() => handleSort('price')}  className="th-sort">Price  <SortIcon k="price"  /></th>
                  <th onClick={() => handleSort('change')} className="th-sort">24h    <SortIcon k="change" /></th>
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
                        <button className={`star-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFav(base)}>★</button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <CoinCircle base={base} size={36} />
                          <div>
                            <div className="pair-name">{base}</div>
                            <div className="pair-sub">{base}/USDT</div>
                          </div>
                        </div>
                      </td>
                      <td className="td-price font-mono">{fmt(p.price)}</td>
                      <td className={`td-change ${isUp ? 'up' : 'down'}`}>{isUp ? '↗' : '↘'} {isUp ? '+' : ''}{p.change.toFixed(2)}%</td>
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
    </div>
  )
}

// ── SPOT/TRADE PAGE ────────────────────────────────────────────────────
export function SpotPage() {
  const pairs = useTicker()
  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [orderType, setOrderType] = useState('limit')
  const [side, setSide] = useState('buy')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [pctSelected, setPctSelected] = useState(null)
  const { balance } = useBalance()

  const currentPair = pairs.find(p => p.symbol === selectedPair) || pairs[0]
  const base = currentPair?.symbol.split('/')[0] || 'BTC'
  const isUp = (currentPair?.change || 0) >= 0

  const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : ''

  const handlePct = (pct) => {
    setPctSelected(pct)
    if (currentPair && balance) {
      if (side === 'buy') {
        const spend = (balance * pct / 100)
        const p = currentPair.price
        setPrice(p.toFixed(2))
        setAmount((spend / p).toFixed(6))
      } else {
        setAmount((0.01 * pct / 100).toFixed(6))
        setPrice(currentPair.price.toFixed(2))
      }
    }
  }

  // Generate fake order book
  const askOrders = Array.from({ length: 8 }, (_, i) => {
    const p = (currentPair?.price || 97500) + (8 - i) * 97.5
    return { price: p.toFixed(2), amount: (Math.random() * 2).toFixed(4), total: (p * Math.random() * 2).toFixed(3) }
  }).reverse()

  const bidOrders = Array.from({ length: 8 }, (_, i) => {
    const p = (currentPair?.price || 97500) - i * 97.5
    return { price: p.toFixed(2), amount: (Math.random() * 2).toFixed(4), total: (p * Math.random() * 2).toFixed(3) }
  })

  const [obTab, setObTab] = useState('both')

  const topPairs = pairs.slice(0, 6)

  return (
    <div className="dash-main" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)', flexShrink: 0, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CoinCircle base={base} size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
                  {currentPair?.symbol}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bitcoin</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 22, fontWeight: 700, color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {fmt(currentPair?.price || 0)}
              </div>
              <div style={{ fontSize: 12, color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {isUp ? '+' : ''}{currentPair?.change.toFixed(2)}%
              </div>
            </div>
            {[
              { label: '24h High', val: fmt((currentPair?.price || 0) * 1.008) },
              { label: '24h Low',  val: fmt((currentPair?.price || 0) * 0.992) },
              { label: '24h Volume', val: EXTRA_DATA[base]?.vol || '—' },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: 'var(--text-primary)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* Chart area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, background: '#131722', position: 'relative', minHeight: 300 }}>
              <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=BINANCE:${base}USDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=131722&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&showpopupbutton=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title="TradingView Chart"
              />
            </div>
          </div>

          {/* Order book */}
          <div style={{
            width: 260, flexShrink: 0, borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', background: 'var(--bg-card)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Order Book</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['both','bids','asks'].map(t => (
                  <button key={t} onClick={() => setObTab(t)} style={{
                    flex: 1, padding: '4px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    background: obTab === t ? 'var(--green)' : 'var(--bg-secondary)',
                    color: obTab === t ? '#000' : 'var(--text-muted)',
                  }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 16px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>
              <span>PRICE</span><span>AMOUNT</span><span>TOTAL</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(obTab !== 'bids') && askOrders.map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 16px', fontSize: 11, fontFamily: 'JetBrains Mono,monospace' }}>
                  <span style={{ color: 'var(--red)' }}>{o.price}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{o.amount}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{o.total}</span>
                </div>
              ))}
              <div style={{ padding: '6px 16px', background: 'var(--bg-secondary)', fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: 14, color: isUp ? 'var(--green)' : 'var(--red)', textAlign: 'center' }}>
                {fmt(currentPair?.price || 0)}
              </div>
              {(obTab !== 'asks') && bidOrders.map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 16px', fontSize: 11, fontFamily: 'JetBrains Mono,monospace' }}>
                  <span style={{ color: 'var(--green)' }}>{o.price}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{o.amount}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{o.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trade panel */}
          <div style={{
            width: 280, flexShrink: 0, borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', background: 'var(--bg-card)',
            padding: 16, gap: 12, overflowY: 'auto',
          }}>
            {/* Buy/Sell tabs */}
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {['buy','sell'].map(s => (
                <button key={s} onClick={() => setSide(s)} style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 14, fontFamily: 'Syne,sans-serif',
                  background: side === s ? (s === 'buy' ? 'var(--green)' : 'var(--red)') : 'transparent',
                  color: side === s ? '#000' : 'var(--text-muted)',
                }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Limit/Market */}
            <div style={{ display: 'flex', gap: 8 }}>
              {['limit','market'].map(t => (
                <button key={t} onClick={() => setOrderType(t)} style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: orderType === t ? 'var(--bg-secondary)' : 'transparent',
                  color: orderType === t ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Price input */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Price (USDT)</div>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder={currentPair?.price.toFixed(2)}
                style={{
                  width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14,
                  fontFamily: 'JetBrains Mono,monospace', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Amount input */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Amount ({base})</div>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14,
                  fontFamily: 'JetBrains Mono,monospace', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Percentage buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} onClick={() => handlePct(pct)} style={{
                  padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600,
                  background: pctSelected === pct ? 'var(--green)' : 'var(--bg-secondary)',
                  color: pctSelected === pct ? '#000' : 'var(--text-muted)',
                }}>
                  {pct}%
                </button>
              ))}
            </div>

            {/* Total */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Total (USDT)</div>
              <input
                type="text" readOnly value={total}
                placeholder="0.00"
                style={{
                  width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 14,
                  fontFamily: 'JetBrains Mono,monospace', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Submit button */}
            <button style={{
              width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15,
              background: side === 'buy' ? 'var(--green)' : 'var(--red)',
              color: '#000', marginTop: 4,
            }}>
              {side === 'buy' ? `Buy ${base}` : `Sell ${base}`}
            </button>

            {/* Balance info */}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Available: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                ${Number(balance || 0).toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FuturesPage() {
  return <PlaceholderPage title="Futures Trading" icon="🔮" description="Trade perpetual futures with up to 100x leverage. Advanced margin controls and liquidation protection. Coming soon." />
}

// ── BOTS PAGE ──────────────────────────────────────────────────────────
export function BotsPage() {
  const { user }             = useAuth()
  const { balance, loading } = useBalance()
  const canRun               = (balance ?? 0) >= MIN_BALANCE

  return (
    <div className="dash-main">
      <div className="bots-content">
        <div className="bots-hero">
          <div className="bots-hero-left">
            <h1 className="bots-hero-title">Automated Trading</h1>
            <p className="bots-hero-sub">Create and manage algorithmic trading strategies</p>
            <div className="bots-hero-stats">
              <div className="bots-stat">
                <span className="bots-stat-value">{BOT_CONFIGS.length}</span>
                <span className="bots-stat-label">Total Bots</span>
              </div>
              <div className="bots-stat">
                <span className="bots-stat-value">
                  {loading ? '...' : `$${Number(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
                <span className="bots-stat-label">Available Balance</span>
              </div>
              <div className="bots-stat">
                <span className="bots-stat-value" style={{ color: canRun ? '#16a34a' : '#ff4d6a' }}>
                  {canRun ? 'Ready' : 'Locked'}
                </span>
                <span className="bots-stat-label">Bot Status</span>
              </div>
            </div>
          </div>
          <button className="bots-hero-btn">Create New Bot →</button>
        </div>

        {!loading && !canRun && <InsufficientBanner />}

        <div className="bots-section">
          <div className="bots-section-header">
            <div>
              <h2 className="bots-section-title">Dollar-Cost Averaging Bots</h2>
              <p className="bots-section-sub">Regular purchases of assets regardless of price</p>
            </div>
            <button className="bots-create-btn" disabled={!canRun}>Create DCA Bot</button>
          </div>
          <div className="bots-grid">
            {BOT_CONFIGS.map(bot => (
              <BotCard key={bot.id} bot={bot} balance={balance ?? 0} userId={user?.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
