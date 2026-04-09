import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: 'var(--green)', fontSize: 28 }}>◈</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading FlexMarket...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return children
}
