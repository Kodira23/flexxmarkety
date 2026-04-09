import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './DashNav.css'

const NAV = [
  { icon: '📊', label: 'Dashboard', to: '/dashboard' },
  { icon: '💱', label: 'Markets', to: '/markets' },
  { icon: '⚡', label: 'Trade', to: '/spot' },
  { icon: '🤖', label: 'Bots', to: '/bots' },
]

export default function DashNav() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const email = user?.email || 'Guest'
  const initials = email.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
  }

  return (
    <>
      {/* ── DESKTOP: top header ── */}
      <nav className="dashnav-header">
        <div className="dashnav-logo">
          <span className="logo-icon-nav">◈</span>
          <span>FlexxMarket</span>
        </div>

        <div className="dashnav-links">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `dashnav-link ${isActive ? 'active' : ''}`}
              end={n.to === '/dashboard'}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="dashnav-right">
          <div className="dashnav-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-email">{email}</span>
              <span className="user-plan">Free Plan</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleSignOut}>↪ Sign Out</button>
        </div>
      </nav>

      {/* ── MOBILE: bottom tab bar ── */}
      <nav className="dashnav-footer">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}
            end={n.to === '/dashboard'}
          >
            <span className="footer-icon">{n.icon}</span>
            <span className="footer-label">{n.label}</span>
          </NavLink>
        ))}
        <button className="footer-link footer-profile" onClick={handleSignOut}>
          <div className="footer-avatar">{initials}</div>
          <span className="footer-label">Profile</span>
        </button>
      </nav>
    </>
  )
}