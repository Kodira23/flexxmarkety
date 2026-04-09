import { useState, useEffect } from 'react'

const PAIRS = [
  { symbol: 'BTC/USDT',  price: 66558.00, change: 0.68 },
  { symbol: 'ETH/USDT',  price: 2044.43,  change: 0.99 },
  { symbol: 'BNB/USDT',  price: 606.97,   change: 0.97 },
  { symbol: 'SOL/USDT',  price: 84.49,    change: 2.33 },
  { symbol: 'XRP/USDT',  price: 1.3566,   change: 1.03 },
  { symbol: 'ADA/USDT',  price: 0.2568,   change: 2.39 },
  { symbol: 'DOGE/USDT', price: 0.1423,   change: 1.15 },
  { symbol: 'TRX/USDT',  price: 0.1234,   change: 0.54 },
  { symbol: 'AVAX/USDT', price: 28.45,    change: -0.87 },
  { symbol: 'LINK/USDT', price: 13.22,    change: 1.44 },
  { symbol: 'DOT/USDT',  price: 6.48,     change: -0.33 },
  { symbol: 'MATIC/USDT',price: 0.5821,   change: 0.72 },
  { symbol: 'LTC/USDT',  price: 82.34,    change: -0.21 },
  { symbol: 'UNI/USDT',  price: 7.93,     change: 1.88 },
  { symbol: 'ATOM/USDT', price: 8.12,     change: -0.56 },
]

export function useTicker() {
  const [pairs, setPairs] = useState(PAIRS)

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prev => prev.map(p => ({
        ...p,
        price: +(p.price * (1 + (Math.random() - 0.5) * 0.001)).toFixed(p.price > 1000 ? 2 : 4),
        change: +((p.change + (Math.random() - 0.5) * 0.05)).toFixed(2)
      })))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return pairs
}

export const CRYPTO_DATA = [
  { id: 'BTC',  name: 'Bitcoin',  symbol: 'BTC',  price: 66558.00, change: 0.68,  amount: 0.01, color: '#F7931A' },
  { id: 'ETH',  name: 'Ethereum', symbol: 'ETH',  price: 2044.43,  change: 0.99,  amount: 0.25, color: '#627EEA' },
  { id: 'SOL',  name: 'Solana',   symbol: 'SOL',  price: 84.49,    change: 2.14,  amount: 1.5,  color: '#9945FF' },
  { id: 'BNB',  name: 'BNB',      symbol: 'BNB',  price: 606.97,   change: -0.42, amount: 0.5,  color: '#F3BA2F' },
]
