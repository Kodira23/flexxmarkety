import { useEffect, useRef } from 'react'
import './CandleChart.css'

const generateCandles = (n = 40) => {
  const candles = []
  let price = 100
  for (let i = 0; i < n; i++) {
    const open = price
    const change = (Math.random() - 0.48) * 6
    const close = open + change
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3
    candles.push({ open, close, high, low })
    price = close
  }
  return candles
}

export default function CandleChart() {
  const candles = generateCandles(50)
  const maxHigh = Math.max(...candles.map(c => c.high))
  const minLow = Math.min(...candles.map(c => c.low))
  const range = maxHigh - minLow

  const toY = (v) => ((maxHigh - v) / range) * 100

  return (
    <div className="candle-chart">
      <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="chart-svg">
        {candles.map((c, i) => {
          const x = (i / candles.length) * 500 + 5
          const bullish = c.close >= c.open
          const color = bullish ? '#16a34a' : '#ff4d6a'
          const bodyTop = toY(Math.max(c.open, c.close))
          const bodyBot = toY(Math.min(c.open, c.close))
          const bodyH = Math.max(bodyBot - bodyTop, 1)

          return (
            <g key={i} style={{ animationDelay: `${i * 0.03}s` }} className="candle-group">
              {/* Wick */}
              <line
                x1={x + 4} y1={toY(c.high) * 2}
                x2={x + 4} y2={toY(c.low) * 2}
                stroke={color} strokeWidth="0.5" strokeOpacity="0.6"
              />
              {/* Body */}
              <rect
                x={x} y={bodyTop * 2}
                width={8} height={bodyH * 2}
                fill={color} fillOpacity={bullish ? 0.85 : 0.7}
                rx="1"
              />
            </g>
          )
        })}
      </svg>
      {/* Grid lines */}
      <div className="chart-grid">
        {[0, 25, 50, 75, 100].map(p => (
          <div key={p} className="grid-line" style={{ top: `${p}%` }} />
        ))}
      </div>
    </div>
  )
}
