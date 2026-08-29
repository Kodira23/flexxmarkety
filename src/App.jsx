import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBalance } from '../pages/Dashboard'; // 👈 import the hook
import './DashNav.css';

// ── Icons (same as before) ──
const GridIcon = () => (/* ... */);
const BarChartIcon = () => (/* ... */);
const ZapIcon = () => (/* ... */);
const CpuIcon = () => (/* ... */);
const UserIcon = () => (/* ... */);
const LogoutIcon = () => (/* ... */);
const WalletIcon = () => (/* ... */);

const NAV_ITEMS = [
  { id: 'home',    label: 'Dashboard', icon: <GridIcon /> },
  { id: 'markets', label: 'Markets',   icon: <BarChartIcon /> },
  { id: 'spot',    label: 'Spot',      icon: <ZapIcon /> },
  { id: 'bots',    label: 'Bots',      icon: <CpuIcon /> },
];

function fmtBalance(n) {
  return `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function DashNav({ activePage, onNavigate }) {
  const { user, signOut } = useAuth();
  const { balance } = useBalance(); // 👈 fetch balance here
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

  // Close dropdown on outside click
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
      {/* ─── Desktop Header ─── */}
      <header className="dashnav-header">
        <button className="dashnav-logo" onClick={() => handleNav('home')}>
          <div className="dashnav-logo-bg" style={{ backgroundImage: "url('/FM logo.jpeg')" }} />
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
          <div className="user-avatar"><UserIcon /></div>
          <button className="icon-logout-btn" onClick={handleSignOut}><LogoutIcon /></button>
        </div>
      </header>

      {/* ─── Mobile Header ─── */}
      <header className="mobile-header">
        <button className="mobile-logo" onClick={() => handleNav('home')}>
          <div className="mobile-logo-bg" style={{ backgroundImage: "url('/FM logo.jpeg')" }} />
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
            >
              <span className="ham-line" /><span className="ham-line" /><span className="ham-line" />
            </button>

            {menuOpen && (
              <>
                <div className="mobile-dropdown-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="mobile-dropdown">
                  <div className="mobile-dropdown-profile">
                    <div className="mobile-dropdown-avatar"><UserIcon /></div>
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
                    <LogoutIcon /> Sign Out
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
