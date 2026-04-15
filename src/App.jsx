function DashLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* DESKTOP FOOTER (visible ≥768px) */}
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

      {/* MOBILE FOOTER (visible only on <768px) */}
      <footer className="mobile-footer">
        <div className="mobile-footer-inner">
          <span className="mobile-footer-logo">◈ Flexxmarket</span>
          <span className="mobile-footer-copy">© 2026 · Pro Trading</span>
        </div>
      </footer>
    </div>
  );
}
