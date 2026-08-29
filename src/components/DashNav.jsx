import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './DashNav.css';

// ── SVG Icons ──
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const WalletIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'home',    label: 'Dashboard', icon: <GridIcon /> },
  { id: 'markets', label: 'Markets',   icon: <BarChartIcon /> },
  { id: 'spot',    label: 'Spot',      icon: <ZapIcon /> },
  { id: 'bots',    label: 'Bots',      icon: <CpuIcon /> },
];

function fmtBalance(n) {
  return `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function DashNav({ activePage, onNavigate, balance = 0 }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
          <div className="dashnav-wallet">
            <WalletIcon />
            <span className="wallet-balance">{fmtBalance(balance)}</span>
          </div>
          <div className="user-avatar">
            <UserIcon />
          </div>
          <button className="icon-logout-btn" onClick={handleSignOut} aria-label="Sign out">
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* ─── MOBILE HEADER ─── */}
      <header className="mobile-header">
        <button className="mobile-logo" onClick={() => handleNav('home')}>
          <div
            className="mobile-logo-bg"
            style={{ backgroundImage: "url('/FM logo.jpeg')" }}
            role="img"
            aria-label="FlexxMarket"
          />
          <div className="mobile-logo-text-stack">
            <span className="mobile-logo-top">FlexxMarket</span>
            <span className="mobile-logo-bottom">pro trading</span>
          </div>
        </button>

        <div className="mobile-header-right">
          <div className="mobile-wallet">
            <WalletIcon />
            <span className="wallet-balance">{fmtBalance(balance)}</span>
          </div>

          <div className="mobile-menu-wrap" ref={menuRef}>
            <button
              className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Open menu"
            >
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </button>

            {menuOpen && (
              <>
                <div className="mobile-dropdown-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="mobile-dropdown">
                  <div className="mobile-dropdown-profile">
                    <div className="mobile-dropdown-avatar">
                      <UserIcon />
                    </div>
                    <div className="mobile-dropdown-userinfo">
                      <span className="mobile-dropdown-username">{username}</span>
                      <span className="mobile-dropdown-email">{email}</span>
                    </div>
                  </div>

                  <div className="mobile-dropdown-divider" />

                  <div className="mobile-dropdown-links">
                    {NAV_ITEMS.map(item => (
                      <button
                        key={item.id}
                        className={`mobile-dropdown-link ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => handleNav(item.id)}
                      >
                        <span className="mobile-dropdown-icon">{item.icon}</span>
                        <span className="mobile-dropdown-label">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mobile-dropdown-divider" />

                  <button className="mobile-dropdown-logout" onClick={handleSignOut}>
                    <LogoutIcon />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
