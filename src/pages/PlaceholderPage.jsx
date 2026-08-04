import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTicker } from '../hooks/useTicker'
import { supabase } from '../supabase'
import { useBalance } from './Dashboard'
import './PlaceholderPage.css'

const MIN_BALANCE = 1
const MIN_ALLOCATION = 49

// ── GLOBAL BOT INTERVALS ──────────────────────────────────────────────
const botIntervals = {}

// ── COINS TO EXCLUDE ───────────────────────────────────────────────────
const EXCLUDED = new Set(['BOME','NOT','IO','ZK','LISTA','EIGEN','HMSTR','CATI','DOGS','MAJOR','NEIRO'])

// ── COIN LOGOS ─────────────────────────────────────────────────────────
const COIN_LOGOS = {
  BTC:'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH:'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  XRP:'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  BNB:'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  SOL:'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  DOGE:'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  ADA:'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  TRX:'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  AVAX:'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  LINK:'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  SHIB:'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
  SUI:'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg',
  XLM:'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
  DOT:'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  HBAR:'https://assets.coingecko.com/coins/images/3688/large/hbar.png',
  BCH:'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
  UNI:'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  LTC:'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  PEPE:'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
  NEAR:'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
  ICP:'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
  FET:'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg',
  MATIC:'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  RNDR:'https://assets.coingecko.com/coins/images/11636/large/rndr.png',
  ARB:'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
  ATOM:'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  SEI:'https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png',
  RUNE:'https://assets.coingecko.com/coins/images/6595/large/Rune200x200.png',
  MKR:'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
  QNT:'https://assets.coingecko.com/coins/images/3370/large/5ZOu7brX_400x400.jpg',
  LDO:'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png',
  GALA:'https://assets.coingecko.com/coins/images/12493/large/GALA-COINGECKO.png',
  JASMY:'https://assets.coingecko.com/coins/images/13876/large/JASMY200x200.jpg',
  SAND:'https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg',
  FLOW:'https://assets.coingecko.com/coins/images/13446/large/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png',
  MANA:'https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png',
  AXS:'https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png',
  APE:'https://assets.coingecko.com/coins/images/24383/large/apecoin.jpg',
  OP:'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
  INJ:'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png',
  GRT:'https://assets.coingecko.com/coins/images/13397/large/Graph_Token.png',
  AAVE:'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
  SNX:'https://assets.coingecko.com/coins/images/3406/large/SNX.png',
  CRV:'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
  ENS:'https://assets.coingecko.com/coins/images/19785/large/acatxTm8_400x400.jpg',
  BLUR:'https://assets.coingecko.com/coins/images/28453/large/blur.png',
  IMX:'https://assets.coingecko.com/coins/images/17233/large/immutableX-symbol-BLK-RGB.png',
  CAKE:'https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo_%281%29.png',
  COMP:'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
  YFI:'https://assets.coingecko.com/coins/images/11849/large/yearn-finance.png',
  BAL:'https://assets.coingecko.com/coins/images/11683/large/Balancer.png',
  ZRX:'https://assets.coingecko.com/coins/images/863/large/0x.png',
  CHZ:'https://assets.coingecko.com/coins/images/8834/large/Chiliz.png',
  ENJ:'https://assets.coingecko.com/coins/images/1102/large/enjin-coin-logo.png',
  BAT:'https://assets.coingecko.com/coins/images/677/large/basic-attention-token.png',
  ZIL:'https://assets.coingecko.com/coins/images/2687/large/Zilliqa-logo.png',
  ONE:'https://assets.coingecko.com/coins/images/4344/large/Y88JAze.png',
  KAVA:'https://assets.coingecko.com/coins/images/9761/large/kava.png',
  ALGO:'https://assets.coingecko.com/coins/images/4380/large/download.png',
  VET:'https://assets.coingecko.com/coins/images/1167/large/VeChain-Logo-768x725.png',
  THETA:'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png',
  FIL:'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
  EOS:'https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png',
  XTZ:'https://assets.coingecko.com/coins/images/976/large/Tezos-logo.png',
  IOTA:'https://assets.coingecko.com/coins/images/692/large/IOTA_Swirl.png',
  NEO:'https://assets.coingecko.com/coins/images/480/large/NEO_512_512.png',
  WAVES:'https://assets.coingecko.com/coins/images/425/large/waves.png',
  DASH:'https://assets.coingecko.com/coins/images/19/large/dash-logo.png',
  XMR:'https://assets.coingecko.com/coins/images/69/large/monero_logo.png',
  ZEC:'https://assets.coingecko.com/coins/images/486/large/circle-zcash-color.png',
  EGLD:'https://assets.coingecko.com/coins/images/12335/large/egld-token-logo.png',
  ROSE:'https://assets.coingecko.com/coins/images/13162/large/rose.png',
  KSM:'https://assets.coingecko.com/coins/images/9568/large/m4zRhP5e_400x400.jpg',
  CELO:'https://assets.coingecko.com/coins/images/11090/large/InjXBNx9_400x400.jpg',
  ANKR:'https://assets.coingecko.com/coins/images/8455/large/Ankr.png',
  SKL:'https://assets.coingecko.com/coins/images/13245/large/SKALE_token_300x300.png',
  STORJ:'https://assets.coingecko.com/coins/images/949/large/storj.png',
  BAND:'https://assets.coingecko.com/coins/images/9545/large/Band_token_blue_violet_token.png',
  WLD:'https://assets.coingecko.com/coins/images/31069/large/worldcoin.jpeg',
  STX:'https://assets.coingecko.com/coins/images/2069/large/Stacks_logo_full.png',
  CFX:'https://assets.coingecko.com/coins/images/13079/large/3vuYMbjN.png',
  MAGIC:'https://assets.coingecko.com/coins/images/18623/large/magic.png',
  TIA:'https://assets.coingecko.com/coins/images/33172/large/celestia.png',
  PYTH:'https://assets.coingecko.com/coins/images/31924/large/pyth.png',
  JTO:'https://assets.coingecko.com/coins/images/33228/large/jto.png',
  JUP:'https://assets.coingecko.com/coins/images/34188/large/jup.png',
  WIF:'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg',
}

const COIN_COLORS = {
  BTC:'#F7931A',ETH:'#627EEA',XRP:'#00AAE4',BNB:'#F3BA2F',SOL:'#9945FF',DOGE:'#C2A633',ADA:'#0033AD',TRX:'#EF0027',
  AVAX:'#E84142',LINK:'#2A5ADA',SHIB:'#FFA409',SUI:'#4DA2FF',XLM:'#7D00FF',DOT:'#E6007A',HBAR:'#00BABC',BCH:'#8DC351',
  UNI:'#FF007A',LTC:'#A8A9AD',PEPE:'#00A550',NEAR:'#00C1DE',ICP:'#29ABE2',FET:'#1D2B55',MATIC:'#8247E5',RNDR:'#CC3000',
  ARB:'#28A0F0',ATOM:'#6F7390',SEI:'#CC3333',RUNE:'#2ECC71',MKR:'#1AAB9B',QNT:'#272D5A',LDO:'#00A3FF',GALA:'#0033FF',
  JASMY:'#2B4EFF',SAND:'#04ADEF',FLOW:'#00EF8B',MANA:'#FF2D55',AXS:'#0055D5',APE:'#0054F9',OP:'#FF0420',INJ:'#00BFFF',
  GRT:'#6F4CFF',AAVE:'#B6509E',SNX:'#00D1FF',CRV:'#D63636',ENS:'#5284FF',BLUR:'#FF8700',IMX:'#17B5CB',CAKE:'#FE8C00',
  COMP:'#00D395',YFI:'#006AE3',BAL:'#1E1E1E',ZRX:'#555',CHZ:'#CD0124',ENJ:'#7866D5',BAT:'#FF5000',ZIL:'#29CCC4',
  ONE:'#00AEE9',KAVA:'#FF564F',ALGO:'#3A3A3A',VET:'#15BDFF',THETA:'#2AB8E6',FIL:'#0090FF',EOS:'#454545',XTZ:'#2C7DF7',
  IOTA:'#131F37',NEO:'#58BF00',WAVES:'#0155FF',DASH:'#008DE4',XMR:'#FF6600',ZEC:'#ECB244',EGLD:'#1A4FE0',ROSE:'#4E8DFF',
  KSM:'#E6007A',CELO:'#FBCC5C',ANKR:'#0066FF',SKL:'#444',STORJ:'#2683FF',BAND:'#4520E6',WLD:'#555',STX:'#5546FF',
  CFX:'#E15F1A',MAGIC:'#E2175F',TIA:'#7B2FBE',PYTH:'#8B5CF6',JTO:'#9945FF',JUP:'#7AC231',WIF:'#B08850',
}

const EXTRA_DATA = {
  BTC:{vol:'$42.50B',mcap:'$1920.00B'},ETH:{vol:'$18.20B',mcap:'$415.00B'},XRP:{vol:'$5.20B',mcap:'$135.00B'},
  BNB:{vol:'$1.80B',mcap:'$98.00B'},SOL:{vol:'$4.80B',mcap:'$82.00B'},DOGE:{vol:'$2.80B',mcap:'$47.00B'},
  ADA:{vol:'$980.00M',mcap:'$33.50B'},TRX:{vol:'$620.00M',mcap:'$21.00B'},AVAX:{vol:'$780.00M',mcap:'$17.20B'},
  LINK:{vol:'$920.00M',mcap:'$14.50B'},SHIB:{vol:'$450.00M',mcap:'$13.00B'},SUI:{vol:'$680.00M',mcap:'$12.80B'},
  XLM:{vol:'$280.00M',mcap:'$12.50B'},DOT:{vol:'$420.00M',mcap:'$10.80B'},HBAR:{vol:'$380.00M',mcap:'$10.50B'},
  BCH:{vol:'$380.00M',mcap:'$9.50B'},UNI:{vol:'$220.00M',mcap:'$8.70B'},LTC:{vol:'$520.00M',mcap:'$8.10B'},
  PEPE:{vol:'$1.20B',mcap:'$8.00B'},NEAR:{vol:'$320.00M',mcap:'$5.80B'},ICP:{vol:'$185.00M',mcap:'$5.40B'},
  FET:{vol:'$420.00M',mcap:'$5.30B'},MATIC:{vol:'$320.00M',mcap:'$4.80B'},RNDR:{vol:'$320.00M',mcap:'$4.40B'},
  ARB:{vol:'$380.00M',mcap:'$4.40B'},ATOM:{vol:'$180.00M',mcap:'$3.90B'},SEI:{vol:'$280.00M',mcap:'$1.80B'},
  RUNE:{vol:'$185.00M',mcap:'$1.80B'},MKR:{vol:'$95.00M',mcap:'$1.70B'},QNT:{vol:'$42.00M',mcap:'$1.70B'},
  LDO:{vol:'$145.00M',mcap:'$1.70B'},GALA:{vol:'$185.00M',mcap:'$1.60B'},JASMY:{vol:'$185.00M',mcap:'$1.60B'},
  SAND:{vol:'$145.00M',mcap:'$1.40B'},FLOW:{vol:'$65.00M',mcap:'$1.30B'},MANA:{vol:'$95.00M',mcap:'$720.00M'},
  AXS:{vol:'$75.00M',mcap:'$680.00M'},APE:{vol:'$85.00M',mcap:'$480.00M'},OP:{vol:'$210.00M',mcap:'$2.30B'},
  INJ:{vol:'$180.00M',mcap:'$2.10B'},GRT:{vol:'$65.00M',mcap:'$420.00M'},AAVE:{vol:'$95.00M',mcap:'$2.80B'},
  SNX:{vol:'$45.00M',mcap:'$380.00M'},CRV:{vol:'$55.00M',mcap:'$310.00M'},ENS:{vol:'$35.00M',mcap:'$850.00M'},
  BLUR:{vol:'$42.00M',mcap:'$320.00M'},IMX:{vol:'$65.00M',mcap:'$1.20B'},CAKE:{vol:'$55.00M',mcap:'$580.00M'},
  COMP:{vol:'$28.00M',mcap:'$580.00M'},YFI:{vol:'$22.00M',mcap:'$240.00M'},BAL:{vol:'$18.00M',mcap:'$185.00M'},
  ZRX:{vol:'$15.00M',mcap:'$360.00M'},CHZ:{vol:'$45.00M',mcap:'$480.00M'},ENJ:{vol:'$18.00M',mcap:'$185.00M'},
  BAT:{vol:'$22.00M',mcap:'$340.00M'},ZIL:{vol:'$12.00M',mcap:'$340.00M'},ONE:{vol:'$8.00M',mcap:'$225.00M'},
  KAVA:{vol:'$18.00M',mcap:'$225.00M'},ALGO:{vol:'$32.00M',mcap:'$1.40B'},VET:{vol:'$28.00M',mcap:'$2.60B'},
  THETA:{vol:'$22.00M',mcap:'$1.45B'},FIL:{vol:'$85.00M',mcap:'$2.20B'},EOS:{vol:'$35.00M',mcap:'$1.10B'},
  XTZ:{vol:'$18.00M',mcap:'$680.00M'},IOTA:{vol:'$12.00M',mcap:'$610.00M'},NEO:{vol:'$22.00M',mcap:'$810.00M'},
  WAVES:{vol:'$15.00M',mcap:'$195.00M'},DASH:{vol:'$35.00M',mcap:'$310.00M'},XMR:{vol:'$55.00M',mcap:'$3.00B'},
  ZEC:{vol:'$25.00M',mcap:'$450.00M'},EGLD:{vol:'$28.00M',mcap:'$875.00M'},ROSE:{vol:'$22.00M',mcap:'$215.00M'},
  KSM:{vol:'$18.00M',mcap:'$385.00M'},CELO:{vol:'$12.00M',mcap:'$415.00M'},ANKR:{vol:'$15.00M',mcap:'$385.00M'},
  SKL:{vol:'$8.00M',mcap:'$185.00M'},STORJ:{vol:'$12.00M',mcap:'$175.00M'},BAND:{vol:'$8.00M',mcap:'$120.00M'},
  WLD:{vol:'$85.00M',mcap:'$1.20B'},STX:{vol:'$55.00M',mcap:'$2.50B'},CFX:{vol:'$35.00M',mcap:'$520.00M'},
  MAGIC:{vol:'$22.00M',mcap:'$280.00M'},TIA:{vol:'$75.00M',mcap:'$1.50B'},PYTH:{vol:'$55.00M',mcap:'$1.20B'},
  JTO:{vol:'$35.00M',mcap:'$580.00M'},JUP:{vol:'$65.00M',mcap:'$760.00M'},WIF:{vol:'$185.00M',mcap:'$1.45B'},
}

// ── TRADINGVIEW CHART OVERRIDES ──────────────────────────────────────
const TV_CHART_OVERRIDES = encodeURIComponent(JSON.stringify({
  'mainSeriesProperties.candleStyle.upColor': '#16a34a',
  'mainSeriesProperties.candleStyle.borderUpColor': '#16a34a',
  'mainSeriesProperties.candleStyle.wickUpColor': '#16a34a',
  'mainSeriesProperties.candleStyle.downColor': '#ef4444',
  'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
  'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
  'paneProperties.background': '#0a0a0d',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.vertGridProperties.color': 'rgba(0,0,0,0)',
  'paneProperties.horzGridProperties.color': 'rgba(0,0,0,0)',
  'timeScale.rightOffset': 3,
}))

// ── SHARED HELPERS ─────────────────────────────────────────────────────
function CoinCircle({ base, size = 36 }) {
  const [failed, setFailed] = useState(false)
  const logo  = COIN_LOGOS[base]
  const color = COIN_COLORS[base] || '#333'
  const label = base.length <= 2 ? base : base.slice(0, 2)
  const fontSize = size <= 20 ? 8 : size <= 32 ? 11 : 13
  if (logo && !failed) {
    return (
      <img
        src={logo} alt={base} width={size} height={size}
        style={{ borderRadius:'50%', objectFit:'cover', flexShrink:0, display:'inline-block', verticalAlign:'middle' }}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:size, height:size, minWidth:size, borderRadius:'50%',
      backgroundColor:color, fontSize, fontWeight:900, color:'#fff', flexShrink:0,
      userSelect:'none', lineHeight:1, fontFamily:'Inter,sans-serif', verticalAlign:'middle'
    }}>{label}</span>
  )
}

const fmt = p => {
  if (p >= 1000) return `$${p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`
  if (p >= 1)    return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toFixed(8)}`
}

// ── SIMULATED PRICE FEED FOR BOT COMMENTARY ───────────────────────────
const BASE_PRICES = { BTC: 97500, ETH: 3400 }

// ── BOT ACTIVITY COMMENT GENERATOR (blue log lines) ────────────────────
function randomComment(base, price) {
  const p = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const templates = [
    `Buy ${base} @ $${p}`,
    `Sell ${base} @ $${p}`,
    `Scanning ${base}/USDT order book`,
    `RSI signal confirmed on ${base}`,
    `Rebalancing ${base} allocation`,
    `Volume spike detected on ${base}`,
    `Executing DCA order for ${base}`,
    `Market trend: ${base} consolidating`,
    `Spread tightening on ${base}/USDT`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

// ── BOT CONFIGS ────────────────────────────────────────────────────────
const BOT_CONFIGS = [
  { id:1, name:'Bitcoin Accumulation', subtitle:'Weekly • DCA', description:'Dollar-cost averaging into Bitcoin on a weekly basis.', risk:'Low', interval:3000, drift:0.14, volatility:0.05, lossChance:0.12, lossMult:0.35, pair:'BTC' },
  { id:2, name:'ETH DCA Pro', subtitle:'Daily • DCA', description:'Dynamic DCA based on RSI and volume indicators.', risk:'Medium', interval:3000, drift:0.14, volatility:0.06, lossChance:0.14, lossMult:0.38, pair:'ETH' },
]

// ── BOT CARD (full, one‑page layout) ─────────────────────────────────
function BotCard({ bot, balance, userId, onStatsChange }) {
  const canRun = balance >= MIN_BALANCE
  const [active, setActive] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [allocation, setAllocation] = useState('')
  const [log, setLog] = useState([])
  const [pnl, setPnl] = useState(0)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const allocatedRef = useRef(0)
  const winsRef = useRef(0)
  const lossesRef = useRef(0)
  const priceRef = useRef(BASE_PRICES[bot.pair] || 100)
  const intervalKey = `${userId}-${bot.id}`

  function addLog(msg, color = '#aaa') {
    setLog(prev => [{ msg, color, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...prev].slice(0, 20))
  }

  async function persist(patch) {
    try {
      const { error } = await supabase
        .from('bot_simulated_pnl')
        .upsert({
          user_id: userId,
          bot_id: bot.id,
          pnl,
          wins,
          losses,
          allocation: allocatedRef.current,
          configured,
          active,
          updated_at: new Date().toISOString(),
          ...patch,
        }, { onConflict: 'user_id,bot_id' })
      if (error) console.error('bot_simulated_pnl upsert failed:', error.message)
    } catch (err) { console.error('Persist error:', err) }
  }

  const tick = useCallback(async () => {
    try {
      if (allocatedRef.current === 0) return

      // ── simulate a small price move and drop a blue market comment ──
      priceRef.current = priceRef.current * (1 + (Math.random() - 0.5) * 0.004)
      addLog(randomComment(bot.pair, priceRef.current), '#3b82f6')

      // ── win-rate targeting (78–82% window) ──
      const total = winsRef.current + lossesRef.current
      let isLoss = false
      if (total > 0) {
        const wr = winsRef.current / total
        if (wr < 0.78) isLoss = false
        else if (wr > 0.82) isLoss = true
        else isLoss = Math.random() < bot.lossChance
      } else {
        isLoss = Math.random() < bot.lossChance
      }

      // ── fixed profit/loss bands ──
      const gained = isLoss
        ? -parseFloat((0.90 + Math.random() * 0.90).toFixed(2))   // -$0.90 to -$1.80
        : parseFloat((3.40 + Math.random() * 1.00).toFixed(2))     // +$3.40 to +$4.40

      setPnl(prev => {
        const next = parseFloat((prev + gained).toFixed(2))
        const newWins = gained >= 0 ? winsRef.current + 1 : winsRef.current
        const newLosses = gained < 0 ? lossesRef.current + 1 : lossesRef.current
        winsRef.current = newWins
        lossesRef.current = newLosses
        setWins(newWins)
        setLosses(newLosses)

        supabase
          .from('bot_simulated_pnl')
          .upsert({
            user_id: userId,
            bot_id: bot.id,
            pnl: next,
            wins: newWins,
            losses: newLosses,
            allocation: allocatedRef.current,
            configured: true,
            active: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,bot_id' })
          .then(({ error }) => { if (error) console.error('DB upsert error:', error.message) })
          .catch(err => console.error('DB upsert catch:', err))

        supabase.rpc('increment_balance', { p_user_id: userId, p_delta: gained })
          .then(({ error }) => { if (error) console.error('Balance update error:', error.message) })
          .catch(err => console.error('Balance RPC error:', err))

        return next
      })

      const up = gained >= 0
      addLog(`${up ? '↑' : '↓'} Trade ${up ? '+' : ''}$${gained.toFixed(2)}`, up ? '#00c853' : '#ff3b5c')
    } catch (err) {
      console.error('Error in tick:', err)
      addLog('⚠️ Bot error – check console', '#ff3b5c')
    }
  }, [bot, userId])

  useEffect(() => {
    if (!userId) return
    const loadState = async () => {
      try {
        const { data, error } = await supabase
          .from('bot_simulated_pnl')
          .select('*')
          .eq('user_id', userId)
          .eq('bot_id', bot.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setPnl(data.pnl ?? 0)
          setWins(data.wins ?? 0)
          setLosses(data.losses ?? 0)
          setAllocation(data.allocation ? String(data.allocation) : '')
          setConfigured(!!data.configured)
          winsRef.current = data.wins ?? 0
          lossesRef.current = data.losses ?? 0
          allocatedRef.current = data.allocation ?? 0
          if (data.active) {
            setActive(true)
            if (!botIntervals[intervalKey]) {
              botIntervals[intervalKey] = setInterval(tick, bot.interval)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load bot state:', err)
      } finally {
        setLoaded(true)
      }
    }
    loadState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bot.id])

  async function handleStart() {
    if (!canRun || !configured) return

    if (active) {
      clearInterval(botIntervals[intervalKey])
      delete botIntervals[intervalKey]
      setActive(false)
      allocatedRef.current = 0
      setAllocation('')
      setConfigured(false)
      setLog([])
      await persist({ active: false, allocation: 0, configured: false })
      return
    }

    const alloc = parseFloat(allocation)
    if (!alloc || alloc < MIN_ALLOCATION) {
      addLog(`⚠️ Allocation must be $${MIN_ALLOCATION} or above`, '#ff3b5c')
      return
    }
    if (alloc > balance) {
      addLog('⚠️ Allocation exceeds balance', '#ff3b5c')
      return
    }

    allocatedRef.current = alloc
    setActive(true)
    addLog(`🚀 Bot started with $${alloc.toFixed(2)} allocation (real funds NOT deducted)`, '#00c853')
    await persist({ active: true, allocation: alloc, configured: true })

    if (!botIntervals[intervalKey]) {
      botIntervals[intervalKey] = setInterval(tick, bot.interval)
    }
  }

  async function handleSaveConfig() {
    const alloc = parseFloat(allocation)
    if (!alloc || alloc < MIN_ALLOCATION) {
      addLog(`⚠️ Allocation must be $${MIN_ALLOCATION} or above`, '#ff3b5c')
      return
    }
    if (alloc > balance) {
      addLog('⚠️ Allocation exceeds balance', '#ff3b5c')
      return
    }
    allocatedRef.current = alloc
    setConfigured(true)
    setShowConfig(false)
    addLog(`✅ Configured — $${alloc.toFixed(2)} allocated (funds not yet deducted)`, '#00c853')
    await persist({ allocation: alloc, configured: true })
  }

  const totalTrades = wins + losses

  useEffect(() => {
    if (!loaded) return
    onStatsChange?.(bot.id, {
      pnl,
      wins,
      losses,
      allocation: configured ? parseFloat(allocation || 0) : 0,
      active,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, pnl, wins, losses, allocation, active, configured])

  const statusLabel = active ? 'Running' : configured ? 'Ready' : 'Not Configured'
  const statusColor = active ? '#00c853' : configured ? '#ffaa00' : '#6b7280'

  if (!loaded) {
    return (
      <div className="bot-card bot-card-skeleton">
        <div className="skeleton-line skeleton-w60" />
        <div className="skeleton-line skeleton-w40" />
        <div className="skeleton-block" />
      </div>
    )
  }

  return (
    <div className={`bot-card ${active ? 'bot-card-live' : ''}`}>
      {/* ─── Header ─── */}
      <div className="bot-card-header">
        <div className="bot-id-block">
          <div className={`bot-avatar ${active ? 'live' : ''}`}>
            <CoinCircle base={bot.pair} size={40} />
          </div>
          <div>
            <div className="bot-name">{bot.name}</div>
            <div className="bot-subtitle">
              {bot.subtitle}
              <span className="bot-subtitle-dot">•</span>
              <span className={`risk-tag risk-${bot.risk.toLowerCase()}`}>{bot.risk} Risk</span>
            </div>
          </div>
        </div>
        <div className="bot-status-badge" style={{ background: statusColor + '1a', color: statusColor, border: `1px solid ${statusColor}55` }}>
          {active && <span className="status-dot" style={{ background: statusColor }} />}
          {statusLabel}
        </div>
      </div>

      <p className="bot-desc">{bot.description}</p>

      {/* ─── Config Box ─── */}
      {showConfig && (
        <div className="bot-config-box">
          {!canRun && (
            <div className="bot-inline-alert">
              ⚠️ Minimum balance ${MIN_BALANCE} required to run bots.
            </div>
          )}

          <div className="bot-order-section">
            <div className="bot-order-field-row">
              <div className="bot-order-field">
                <label className="bot-order-label">Allocation size</label>
                <div className="bot-order-input-wrap">
                  <input
                    type="number"
                    min={MIN_ALLOCATION}
                    max={balance}
                    placeholder={`Min ${MIN_ALLOCATION}`}
                    value={allocation}
                    onChange={e => setAllocation(e.target.value)}
                    className="bot-order-input"
                    disabled={!canRun}
                  />
                  <span className="bot-order-unit-badge">USD</span>
                </div>
              </div>
              <div className="bot-order-field">
                <label className="bot-order-label">Available balance</label>
                <div className="bot-order-static-value">${Number(balance).toFixed(2)}</div>
              </div>
            </div>

            <div className="bot-order-hint">Minimum allocation is ${MIN_ALLOCATION}</div>
          </div>

          <div className="bot-config-actions">
            <button
              className="bot-btn-start-active"
              onClick={handleSaveConfig}
              disabled={!canRun || !allocation || parseFloat(allocation) < MIN_ALLOCATION || parseFloat(allocation) > balance}
            >
              Save Configuration
            </button>
            <button className="bot-btn-configure" onClick={() => setShowConfig(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      <div className="bot-actions">
        <button
          className={configured ? 'bot-btn-configure' : 'bot-btn-start-active'}
          onClick={() => { if (canRun) setShowConfig(v => !v) }}
          disabled={!canRun || active}
        >
          {showConfig ? 'Close' : 'Configure'}
        </button>
        <button
          className={active ? 'bot-btn-stop' : 'bot-btn-start-active'}
          onClick={handleStart}
          disabled={!canRun || !configured}
        >
          {active ? 'Stop Bot' : 'Start Bot'}
        </button>
      </div>

      {/* ─── Logs (expands when running) ─── */}
      {log.length > 0 && (
        <div className="bot-log-panel">
          <div className="bot-log-head">Activity Log</div>
          <div
            className="bot-log"
            style={{
              maxHeight: active ? '260px' : '110px',
              transition: 'max-height 0.3s ease',
            }}
          >
            {log.map((l, i) => (
              <div key={i} className="bot-log-line" style={{ color: l.color }}>
                <span className="bot-log-ts">{l.ts}</span>{l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PLACEHOLDER PAGE ──────────────────────────────────────────────────
function PlaceholderPage({ title, icon, description }) {
  return (
    <div className="dash-main">
      <div className="placeholder-content">
        <div className="placeholder-card">
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
export function MarketsPage({ onNavigate }) {
  const allPairs = useTicker()
  const pairs = useMemo(() => allPairs.filter(p => !EXCLUDED.has(p.symbol.split('/')[0])), [allPairs])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState(['BTC', 'ETH'])
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const toggleFav = sym => setFavorites(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym])
  const handleSort = key => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  const topGainers = useMemo(() => [...pairs].sort((a, b) => b.change - a.change).slice(0, 3), [pairs])
  const topLosers = useMemo(() => [...pairs].sort((a, b) => a.change - b.change).slice(0, 3), [pairs])

  const filtered = useMemo(() => {
    let list = [...pairs]
    if (filter === 'gainers') list = list.filter(p => p.change >= 0)
    if (filter === 'losers') list = list.filter(p => p.change < 0)
    if (filter === 'favorites') list = list.filter(p => favorites.includes(p.symbol.split('/')[0]))
    if (search) list = list.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()))
    if (sortKey === 'name') list.sort((a, b) => sortDir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol))
    if (sortKey === 'price') list.sort((a, b) => sortDir === 'asc' ? a.price - b.price : b.price - a.price)
    if (sortKey === 'change') list.sort((a, b) => sortDir === 'asc' ? a.change - b.change : b.change - a.change)
    return list
  }, [pairs, filter, search, favorites, sortKey, sortDir])

  const SortIcon = ({ k }) => (
    <span className={`sort-icon ${sortKey === k ? 'active' : ''}`}>
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  const handleTrade = () => {
    if (onNavigate) onNavigate('home')
  }

  return (
    <div className="dash-main">
      <div className="markets-page-wrapper">
        <div className="movers-grid">
          {[
            { label: '🔥 Top Gainers', list: topGainers, isGain: true },
            { label: '⚡ Top Losers', list: topLosers, isGain: false }
          ].map(({ label, list, isGain }) => (
            <div key={label} className="movers-card">
              <div className="movers-title">{label}</div>
              {list.map(p => {
                const base = p.symbol.split('/')[0]
                return (
                  <div key={p.symbol} className="mover-row">
                    <div className="mover-left">
                      <CoinCircle base={base} size={34} />
                      <div className="mover-sym">{base}</div>
                    </div>
                    <div className="mover-right">
                      <span className="mover-price">{fmt(p.price)}</span>
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

        <div className="markets-toolbar">
          <div className="markets-filters">
            {['all', 'favorites', 'gainers', 'losers'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'favorites' ? '★ Watchlist' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="markets-search">
            <span className="search-icon">🔍</span>
            <input
              type="text" placeholder="Search markets..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="markets-table-card">
          <div className="markets-table-scroll">
            <table className="markets-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th className="th-sort" onClick={() => handleSort('name')}>Name <SortIcon k="name" /></th>
                  <th className="th-sort" onClick={() => handleSort('price')}>Price <SortIcon k="price" /></th>
                  <th className="th-sort" onClick={() => handleSort('change')}>24h <SortIcon k="change" /></th>
                  <th className="th-vol">Volume</th>
                  <th className="th-mcap">Market Cap</th>
                  <th className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const base = p.symbol.split('/')[0]
                  const isUp = p.change >= 0
                  const isFav = favorites.includes(base)
                  const extra = EXTRA_DATA[base] || { vol: '—', mcap: '—' }
                  return (
                    <tr key={p.symbol}>
                      <td className="td-star">
                        <button className={`star-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFav(base)}>★</button>
                      </td>
                      <td>
                        <div className="td-coin">
                          <CoinCircle base={base} size={36} />
                          <div>
                            <div className="pair-name">{base}</div>
                            <div className="pair-sub">{base}/USDT</div>
                          </div>
                        </div>
                      </td>
                      <td className="td-price">{fmt(p.price)}</td>
                      <td>
                        <span className={`change-pill ${isUp ? 'up' : 'down'}`}>
                          {isUp ? '↗ +' : '↘ '}{p.change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="td-muted td-vol">{extra.vol}</td>
                      <td className="td-muted td-mcap">{extra.mcap}</td>
                      <td className="td-action">
                        <button className="trade-btn" onClick={handleTrade}>Trade</button>
                      </td>
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

// ── RECENT TRADES FEED ─────────────────────────────────────────────────
function RecentTradesFeed({ basePrice }) {
  const [trades, setTrades] = useState(() =>
    Array.from({ length: 16 }, (_, i) => {
      const p = basePrice + (Math.random() - 0.5) * 200
      const now = new Date(); now.setSeconds(now.getSeconds() - i * 5)
      return { id: i, price: p.toFixed(2), amount: (Math.random() * 0.5 + 0.01).toFixed(4), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), isBuy: Math.random() > 0.5 }
    })
  )
  useEffect(() => {
    const iv = setInterval(() => {
      const p = basePrice + (Math.random() - 0.5) * 200
      setTrades(prev => [{
        id: Date.now(), price: p.toFixed(2), amount: (Math.random() * 0.5 + 0.01).toFixed(4),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), isBuy: Math.random() > 0.45
      }, ...prev].slice(0, 30))
    }, 1500)
    return () => clearInterval(iv)
  }, [basePrice])
  return (
    <>
      <div className="ob-section-divider">Recent Trades</div>
      <div className="ob-cols rt-cols"><span>Price</span><span>Amount</span><span>Time</span></div>
      <div className="recent-trades-scroll">
        {trades.map((t, i) => (
          <div key={t.id} className={`ob-row ${i === 0 ? 'rt-new' : ''}`}>
            <span className={`ob-price ${t.isBuy ? 'buy' : 'sell'}`}>{t.price}</span>
            <span className="ob-amt">{t.amount}</span>
            <span className="ob-time">{t.time}</span>
          </div>
        ))}
      </div>
    </>
  )
}

// ── SPOT PAGE ──────────────────────────────────────────────────────────
export function SpotPage() {
  const allPairs = useTicker()
  const pairs = useMemo(() => allPairs.filter(p => !EXCLUDED.has(p.symbol.split('/')[0])), [allPairs])

  const [selectedPair, setSelectedPair] = useState('BTC/USDT')
  const [orderType, setOrderType] = useState('limit')
  const [side, setSide] = useState('buy')
  const [orderOpen, setOrderOpen] = useState(false)
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [pctSelected, setPctSelected] = useState(null)
  const [obTab, setObTab] = useState('both')
  const [mobileTab, setMobileTab] = useState('chart')
  const { balance } = useBalance()

  const currentPair = pairs.find(p => p.symbol === selectedPair) || pairs[0]
  const base = currentPair?.symbol.split('/')[0] || 'BTC'
  const isUp = (currentPair?.change || 0) >= 0
  const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : ''

  const handlePct = pct => {
    setPctSelected(pct)
    if (currentPair && balance) {
      if (side === 'buy') { const spend = balance * pct / 100; const p = currentPair.price; setPrice(p.toFixed(2)); setAmount((spend / p).toFixed(6)) }
      else { setAmount((0.01 * pct / 100).toFixed(6)); setPrice(currentPair.price.toFixed(2)) }
    }
  }

  const handleSideClick = s => {
    if (side === s && orderOpen) {
      // same button pressed again → collapse
      setOrderOpen(false)
    } else {
      setSide(s)
      setOrderOpen(true)
    }
  }

  const askOrders = Array.from({ length: 8 }, (_, i) => { const p = (currentPair?.price || 97500) + (8 - i) * 97.5; return { price: p.toFixed(2), amount: (Math.random() * 2).toFixed(4), total: (p * Math.random() * 2).toFixed(3) } }).reverse()
  const bidOrders = Array.from({ length: 8 }, (_, i) => { const p = (currentPair?.price || 97500) - i * 97.5; return { price: p.toFixed(2), amount: (Math.random() * 2).toFixed(4), total: (p * Math.random() * 2).toFixed(3) } })

  return (
    <div className="dash-main spot-main">
      <div className="spot-wrap">
        <div className="spot-header-bar">
          <div className="spot-header-left">
            <CoinCircle base={base} size={34} />
            <span className="spot-pair-name">{currentPair?.symbol}</span>
            <span className={`spot-cur-price ${isUp ? 'up' : 'down'}`}>{fmt(currentPair?.price || 0)}</span>
            <span className={`spot-change-tag ${isUp ? 'up' : 'down'}`}>{isUp ? '+' : ''}{currentPair?.change.toFixed(2)}%</span>
          </div>
          <div className="spot-header-stats">
            {[
              { label: '24h High', val: fmt((currentPair?.price || 0) * 1.008) },
              { label: '24h Low', val: fmt((currentPair?.price || 0) * 0.992) },
              { label: '24h Vol', val: EXTRA_DATA[base]?.vol || '—' }
            ].map(({ label, val }) => (
              <div key={label} className="spot-stat">
                <span className="spot-stat-label">{label}</span>
                <span className="spot-stat-val">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="spot-mobile-tabs">
          {['chart', 'book'].map(t => (
            <button key={t} className={`spot-mobile-tab ${mobileTab === t ? 'active' : ''}`} onClick={() => setMobileTab(t)}>
              {t === 'chart' ? '📈 Chart' : '📒 Book'}
            </button>
          ))}
        </div>

        <div className="spot-body">
          <div className={`spot-chart-area ${mobileTab !== 'chart' ? 'mob-hide' : ''}`}>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=BINANCE:${base}USDT&interval=60&range=5D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0a0a0d&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&showpopupbutton=1&overrides=${TV_CHART_OVERRIDES}&locale=en`}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title="TradingView Chart"
            />
          </div>

          <div className={`spot-ob-panel ${mobileTab !== 'book' ? 'mob-hide' : ''}`}>
            <div className="ob-header">
              <span className="ob-title">Order Book</span>
              <div className="ob-tabs">
                {['both', 'bids', 'asks'].map(t => (
                  <button key={t} className={`ob-tab ${obTab === t ? 'active' : ''}`} onClick={() => setObTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="ob-cols"><span>Price</span><span>Amount</span><span>Total</span></div>
            <div className="ob-rows">
              {obTab !== 'bids' && askOrders.map((o, i) => (
                <div key={i} className="ob-row">
                  <span className="ob-price sell">{o.price}</span>
                  <span className="ob-amt">{o.amount}</span>
                  <span className="ob-total">{o.total}</span>
                </div>
              ))}
              <div className="ob-mid" style={{ color: isUp ? '#00c853' : '#ff3b5c' }}>
                {fmt(currentPair?.price || 0)}
              </div>
              {obTab !== 'asks' && bidOrders.map((o, i) => (
                <div key={i} className="ob-row">
                  <span className="ob-price buy">{o.price}</span>
                  <span className="ob-amt">{o.amount}</span>
                  <span className="ob-total">{o.total}</span>
                </div>
              ))}
            </div>
            <RecentTradesFeed basePrice={currentPair?.price || 97500} />
          </div>

          <div className={`spot-trade-panel ${mobileTab !== 'chart' ? 'mob-hide' : ''}`}>
            {orderOpen && (
              <>
                <div className="order-type-row">
                  {['limit', 'market'].map(t => (
                    <button key={t} className={`order-type-btn ${orderType === t ? 'active' : ''}`} onClick={() => setOrderType(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="trade-field">
                  <label className="trade-label">Price (USDT)</label>
                  <input type="number" className="trade-input" value={price} onChange={e => setPrice(e.target.value)} placeholder={currentPair?.price.toFixed(2)} />
                </div>
                <div className="trade-field">
                  <label className="trade-label">Amount ({base})</label>
                  <input type="number" className="trade-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="pct-row">
                  {[25, 50, 75, 100].map(pct => (
                    <button key={pct} className={`pct-btn ${pctSelected === pct ? 'active' : ''}`} onClick={() => handlePct(pct)}>{pct}%</button>
                  ))}
                </div>
                <div className="trade-field">
                  <label className="trade-label">Total (USDT)</label>
                  <input type="text" className="trade-input readonly" readOnly value={total} placeholder="0.00" />
                </div>
                <div className="trade-info-row"><span>Fee (0.1%)</span><span>${total ? (parseFloat(total) * 0.001).toFixed(4) : '0.0000'}</span></div>
                <div className="trade-info-row avail">
                  <span>📋 Available (USDT)</span>
                  <span className="avail-val">{Number(balance || 0).toFixed(0)} USDT</span>
                </div>
              </>
            )}

            <div className="trade-action-row">
              <button className={`trade-side-btn buy ${side === 'buy' && orderOpen ? 'active' : ''}`} onClick={() => handleSideClick('buy')}>
                Buy {base}
              </button>
              <button className={`trade-side-btn sell ${side === 'sell' && orderOpen ? 'active' : ''}`} onClick={() => handleSideClick('sell')}>
                Sell {base}
              </button>
            </div>

            {orderOpen && (
              <button className={`trade-submit-btn ${side}`}>{side === 'buy' ? `Confirm Buy ${base}` : `Confirm Sell ${base}`}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FuturesPage() {
  return <PlaceholderPage title="Futures Trading" icon="🔮" description="Trade perpetual futures with up to 100x leverage. Advanced margin controls and liquidation protection. Coming soon." />
}

// ── BOTS PAGE (one‑page, no detail navigation) ──────────────────────
export function BotsPage() {
  const { user } = useAuth()
  const { balance, loading } = useBalance()
  const [botStats, setBotStats] = useState({})

  const handleStatsChange = useCallback((botId, stats) => {
    setBotStats(prev => ({ ...prev, [botId]: stats }))
  }, [])

  const aggregate = useMemo(() => {
    const all = Object.values(botStats)
    const totalPnl = all.reduce((sum, s) => sum + (s.pnl || 0), 0)
    const totalWins = all.reduce((sum, s) => sum + (s.wins || 0), 0)
    const totalLosses = all.reduce((sum, s) => sum + (s.losses || 0), 0)
    const totalTrades = totalWins + totalLosses
    const totalAllocated = all.reduce((sum, s) => sum + (s.allocation || 0), 0)
    const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : null
    return { totalPnl, totalTrades, totalAllocated, winRate }
  }, [botStats])

  return (
    <div className="dash-main">
      <div className="bots-content">
        <div className="bots-hero">
          <div className="bots-hero-left">
            <h1 className="bots-hero-title">Automated Trading</h1>
            <p className="bots-hero-sub">Create and manage algorithmic trading strategies</p>
            <div className="bots-hero-stats">
              <div className="bots-stat">
                <span className="bots-stat-value" style={{ color: aggregate.totalPnl >= 0 ? '#4ade80' : '#ff6b81' }}>
                  {aggregate.totalPnl >= 0 ? '+' : ''}${aggregate.totalPnl.toFixed(2)}
                </span>
                <span className="bots-stat-label">P&amp;L</span>
              </div>
              <div className="bots-stat">
                <span className="bots-stat-value">{aggregate.winRate !== null ? `${aggregate.winRate}%` : '—'}</span>
                <span className="bots-stat-label">Win Rate</span>
              </div>
              <div className="bots-stat">
                <span className="bots-stat-value">{aggregate.totalTrades}</span>
                <span className="bots-stat-label">Trades</span>
              </div>
              <div className="bots-stat">
                <span className="bots-stat-value">${aggregate.totalAllocated.toFixed(0)}</span>
                <span className="bots-stat-label">Allocated</span>
              </div>
            </div>
          </div>
          <button className="bots-hero-btn">Create New Bot →</button>
        </div>

        <div className="bots-section">
          <div className="bots-section-header">
            <div>
              <h2 className="bots-section-title">Dollar-Cost Averaging Bots</h2>
              <p className="bots-section-sub">Regular purchases of assets regardless of price</p>
            </div>
            <button className="bots-create-btn" disabled={(balance ?? 0) < MIN_BALANCE}>
              Create DCA Bot
            </button>
          </div>
          <div className="bots-grid">
            {BOT_CONFIGS.map(bot => (
              <BotCard key={bot.id} bot={bot} balance={balance ?? 0} userId={user?.id} onStatsChange={handleStatsChange} />
            ))}
          </div>
          <p className="bots-disclaimer">
            ⓘ Automated bots trade based on your configuration and market conditions. Past performance
            does not guarantee future results. Only allocate funds you can afford to have at risk.
          </p>
        </div>
      </div>
    </div>
  )
}
