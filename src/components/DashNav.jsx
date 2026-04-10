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

const MOBILE_NAV = [
  { icon: '📊', label: 'Dashboard', to: '/dashboard' },
  { icon: '💱', label: 'Markets', to: '/markets' },
  { icon: '🤖', label: 'Bots', to: '/bots' },
  { icon: '⚡', label: 'Trade', to: '/spot' },
]

export default function DashNav() {
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
      {/* ── DESKTOP: top header ── */}
      <nav className="dashnav-header">
        <div className="dashnav-logo">
          <span className="logo-icon-nav">◈</span>
          <div className="logo-text-stack">
            <span className="logo-top">Flexx</span>
            <span className="logo-bottom">MARKET</span>
          </div>
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
            </div>
          </div>
          <button className="logout-btn" onClick={handleSignOut}>↪ Sign Out</button>
        </div>
      </nav>

      {/* ── MOBILE: top header ── */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <span className="logo-icon-nav">◈</span>
          <div className="logo-text-stack">
            <span className="logo-top">Flexx</span>
            <span className="logo-bottom">MARKET</span>
          </div>
        </div>
        <div className="mobile-header-right">
          <div className="user-avatar" onClick={() => navigate('/dashboard')}>{initials}</div>
          <button className="mobile-signout" onClick={handleSignOut}>↪</button>
        </div>
      </header>

      {/* ── MOBILE: bottom tab bar ── */}
      <nav className="dashnav-footer">
        {MOBILE_NAV.map(n => (
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
      </nav>

      {/* ── DESKTOP: bottom footer (scrolls with page) ── */}
      <footer className="dashnav-desktop-footer">
        <div className="desktop-footer-inner">
          <div className="desktop-footer-logo">
            <span className="logo-icon-nav">◈</span>
            <div className="logo-text-stack">
              <span className="logo-top">Flexx</span>
              <span className="logo-bottom">MARKET</span>
            </div>
          </div>
          <div className="desktop-footer-copy">
            © 2026 Flexxmarket. All rights reserved. Trading involves risk.
          </div>
        </div>
      </footer>
    </>
  )
}
