import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashNav from '../components/DashNav'
import './DashLayout.css'

export default function DashLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/')
  }, [user, loading, navigate])

  if (loading) return (
    <div className="dash-loading">
      <span className="loading-logo">◈</span>
    </div>
  )

  return (
    <div className="dash-layout">
      <DashNav />
      <div className="dash-main">
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
