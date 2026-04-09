import { useState, useEffect } from 'react'

const PAIRS = [
  { symbol: 'USD/JPY', price: 147.154, change: 0.09 },
  { symbol: 'AUD/USD', price: 0.6599, change: -0.21 },
  { symbol: 'USD/CAD', price: 1.3958, change: 0.18 },
  { symbol: 'USD/CHF', price: 0.8456, change: 0.15 },
  { symbol: 'EUR/GBP', price: 0.8721, change: -0.12 },
  { symbol: 'NZD/USD', price: 0.6123, change: -0.34 },
  { symbol: 'EUR/USD', price: 1.0842, change: 0.22 },
  { symbol: 'GBP/USD', price: 1.2634, change: -0.08 },
  { symbol: 'BTC/USD', price: 66558, change: 0.68 },
  { symbol: 'ETH/USD', price: 2044.43, change: 0.99 },
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
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 66558.00, change: 0.68, amount: 0.01, color: '#F7931A' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 2044.43, change: 0.99, amount: 0.25, color: '#627EEA' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 142.30, change: 2.14, amount: 1.5, color: '#9945FF' },
  { id: 'BNB', name: 'BNB', symbol: 'BNB', price: 415.20, change: -0.42, amount: 0.5, color: '#F3BA2F' },
]
