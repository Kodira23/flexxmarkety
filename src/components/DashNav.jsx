import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './DashNav.css';

const NAV_ITEMS = [
  { id: 'home',    label: 'Dashboard', icon: '📊' },
  { id: 'markets', label: 'Markets',   icon: '📈' },
  { id: 'spot',    label: 'Spot',      icon: '⚡' },
  { id: 'bots',    label: 'Bots',      icon: '🤖' },
];

export default function DashNav({ activePage, onNavigate }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'FL';

  const handleNav = (id) => {
    if (onNavigate) onNavigate(id);
    setMenuOpen(false);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    signOut?.();
  };

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="dashnav-header">
        <button className="dashnav-logo" onClick={() => handleNav('home')}>
          <span className="logo-icon-nav">◈</span>
          <div className="logo-text-stack">
            <span className="logo-top">Flexxmarket</span>
            <span className="logo-bottom">Pro Trading</span>
          </div>
        </button>

        <nav className="dashnav-links">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`dashnav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dashnav-right">
          <div className="dashnav-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-email">{user?.email || 'trader@flexx.com'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <button className="mobile-logo" onClick={() => handleNav('home')}>
          <span className="mobile-logo-icon">◈</span>
          <span className="mobile-logo-text">Flexxmarket</span>
        </button>
        <div className="mobile-header-right">
          <div className="mobile-user-icon">
            <div className="mobile-avatar-small">{initials}</div>
          </div>
          <button
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Open menu"
          >
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        </div>
      </header>

      {/* BACKDROP & DROPDOWN */}
      <div
        className={`mobile-dropdown-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <nav className={`mobile-dropdown ${menuOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`mobile-dropdown-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNav(item.id)}
          >
            <span className="mobile-dropdown-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="mobile-dropdown-divider" />
        <div className="mobile-dropdown-user">
          <div className="mobile-dropdown-avatar">{initials}</div>
          <span className="mobile-dropdown-email">{user?.email || 'trader@flexx.com'}</span>
        </div>
        <button className="mobile-dropdown-logout" onClick={handleSignOut}>
          <span className="mobile-dropdown-icon">🚪</span> Sign Out
        </button>
      </nav>
    </>
  );
}
