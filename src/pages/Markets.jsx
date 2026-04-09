import { useTicker } from '../hooks/useTicker'
import './Markets.css'

export default function Markets() {
  const pairs = useTicker()

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Markets</h1>
          <p className="dash-sub">Live market data across all pairs</p>
        </div>
      </div>

      <div className="card markets-table-card">
        <table className="markets-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pair</th>
              <th>Price</th>
              <th>Change 24h</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={p.symbol}>
                <td className="td-num">{i + 1}</td>
                <td className="td-pair">
                  <div className="pair-icon">{p.symbol.slice(0, 3)}</div>
                  <div>
                    <div className="pair-name">{p.symbol}</div>
                  </div>
                </td>
                <td className="td-price font-mono">
                  {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>
                <td className={`td-change ${p.change >= 0 ? 'up' : 'down'}`}>
                  {p.change >= 0 ? '↑' : '↓'} {Math.abs(p.change).toFixed(2)}%
                </td>
                <td>
                  <button className="trade-btn">Trade →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
