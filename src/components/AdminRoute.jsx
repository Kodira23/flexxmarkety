import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Paste your Supabase user UID here
// Find it: Supabase Dashboard → Authentication → Users → your account → copy the UUID
const ADMIN_UIDS = [
  'c4e52c6e-09a7-4909-add2-2a5bdf2b757f',
]

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user || !ADMIN_UIDS.includes(user.id)) {
    return <Navigate to="/" replace />
  }

  return children
}
