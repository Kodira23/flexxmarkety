import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './DashNav.css'

const NAV = [
  { icon: '⊞', label: 'Dashboard', to: '/dashboard' },
  { icon: '📈', label: 'Trade',     to: '/spot' },
  { icon: '📊', label: 'Markets',   to: '/markets' },
  { icon: '↑',  label: 'Deposit',   to: '/deposit' },
  { icon: '↓',  label: 'Withdraw',  to: '/withdraw' },
  { icon: '🤖', label: 'Bots',      to: '/bots' },
]

const MOBILE_NAV = [
  { icon: '⊞',  label: 'Dashboard', to: '/dashboard' },
  { icon: '📈', label: 'Trade',     to: '/spot' },
  { icon: '📊', label: 'Markets',   to: '/markets' },
  { icon: '🤖', label: 'Bots',      to: '/bots' },
]

export default function DashNav() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const email = user?.email || 'Guest'
  const initials = email.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setTimeout(() => { window.location.href = '/' }, 500)
  }

  return (
    <>
      {/* ── DESKTOP ── */}
      <nav className="dashnav-header">

        <div className="dashnav-logo">
          <span className="logo-gem">◈</span>
          <div className="logo-text">
            <span className="logo-top">FLEXX</span>
            <span className="logo-btm">MARKETZ</span>
          </div>
        </div>

        <div className="dashnav-links">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `dashnav-link${isActive ? ' active' : ''}`}
              end={n.to === '/dashboard'}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="dashnav-search">
          <span className="search-ico">🔍</span>
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="dashnav-right">
          <div className="nav-balance">
            <span className="bal-icon">💳</span>
            <span className="bal-amt">$0.00</span>
          </div>
          <button className="nav-icon-btn" onClick={() => navigate('/dashboard')} title="Profile">
            👤
          </button>
          <button className="nav-icon-btn sign-out-btn" onClick={handleSignOut} title="Sign Out">
            ↪
          </button>
        </div>
      </nav>

      {/* ── MOBILE ── */}
      <nav className="dashnav-footer">
        {MOBILE_NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `footer-link${isActive ? ' active' : ''}`}
            end={n.to === '/dashboard'}
          >
            <span className="footer-icon">{n.icon}</span>
            <span className="footer-label">{n.label}</span>
          </NavLink>
        ))}
        {/* Profile navigates to dashboard — does NOT logout */}
        <button className="footer-link" onClick={() => navigate('/dashboard')}>
          <div className="footer-avatar">{initials}</div>
          <span className="footer-label">Profile</span>
        </button>
      </nav>
    </>
  )
}
