import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar({ onSignIn, onGetStarted }) {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">
            <span className="logo-main">Flexx</span>
            <span className="logo-sub">Market</span>
          </span>
        </Link>
        <div className="navbar-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Dashboard →</Link>
          ) : (
            <>
              <button className="btn-ghost" onClick={onSignIn}>Sign In</button>
              <button className="btn-primary" onClick={onGetStarted}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
