import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Paste your Supabase user UID here
// Find it: Supabase Dashboard → Authentication → Users → your account → copy the UUID
const ADMIN_UIDS = [
  '5d0d3819-23d1-416e-bd83-9340cd9945be',
]

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user || !ADMIN_UIDS.includes(user.id)) {
    return <Navigate to="/" replace />
  }

  return children
}