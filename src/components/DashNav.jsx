{menuOpen && (
  <>
    <div className="mobile-dropdown-backdrop" onClick={() => setMenuOpen(false)} />
    <div className="mobile-dropdown">
      {/* Top bar: logo left, close button right — matches Freddie Visuals layout */}
      <div className="mobile-dropdown-topbar">
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
        <button
          className="mobile-dropdown-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

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

      <button className="mobile-dropdown-logout" onClick={handleSignOut}>
        <LogoutIcon />
        <span>Sign Out</span>
      </button>
    </div>
  </>
)}
