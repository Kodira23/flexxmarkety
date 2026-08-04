import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './DashNav.css';

// ── SVG Icon Components (white outline sketches) ──
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </svg>
);

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CpuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M1 9h3" />
    <path d="M1 15h3" />
    <path d="M20 9h3" />
    <path d="M20 15h3" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'home',    label: 'Dashboard', icon: <GridIcon /> },
  { id: 'markets', label: 'Markets',   icon: <BarChartIcon /> },
  { id: 'spot',    label: 'Spot',      icon: <ZapIcon /> },
  { id: 'bots',    label: 'Bots',      icon: <CpuIcon /> },
];

export default function DashNav({ activePage, onNavigate }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const email = user?.email || 'trader@flexx.com';
  const username = email.split('@')[0];

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
      {/* ─── DESKTOP HEADER ─── */}
      <header className="dashnav-header">
        <button className="dashnav-logo" onClick={() => handleNav('home')}>
          <div
            className="dashnav-logo-bg"
            style={{ backgroundImage: "url('/FM logo.jpeg')" }}
            role="img"
            aria-label="FlexxMarket"
          />
          <div className="logo-text-stack">
            <span className="logo-top">FlexxMarket</span>
            <span className="logo-bottom">pro trading</span>
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
            <div className="user-avatar">
              <UserIcon />
            </div>
            <div className="user-info">
              <span className="user-email">{username}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      {/* ─── MOBILE HEADER ─── */}
      <header className="mobile-header">
        <button className="mobile-logo" onClick={() => handleNav('home')}>
          <div
            className="mobile-logo-bg"
            style={{ backgroundImage: "url('/FM logo.jpeg')" }}
            role="img"
            aria-label="Flexxmarket"
          />
          <span className="mobile-logo-text">Flexxmarket</span>
        </button>
        <div className="mobile-header-right">
          <div className="mobile-user-icon">
            <div className="mobile-avatar-small">
              <UserIcon />
            </div>
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

      {/* ─── BACKDROP & DROPDOWN ─── */}
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
          <div className="mobile-dropdown-avatar">
            <UserIcon />
          </div>
          <span className="mobile-dropdown-email">{username}</span>
        </div>
        <button className="mobile-dropdown-logout" onClick={handleSignOut}>
          <span className="mobile-dropdown-icon"><LogoutIcon /></span>
          Sign out
        </button>
      </nav>
    </>
  );
}
