import '../pages/Dashboard.css'; // reuses existing .dashboard-footer styles

export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer-inner">
        <div className="footer-logo">
          <div
            className="footer-logo-bg"
            style={{ backgroundImage: "url('/FM logo.jpeg')" }}
            role="img"
            aria-label="Flexxmarket"
          />
          <div className="footer-brand-wrapper">
            <span className="footer-brand-text">Flexxmarket</span>
            <span className="footer-brand-sub">Trading pro</span>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 Flexxmarket. All rights reserved. Trading involves risk.
        </div>
      </div>
    </footer>
  );
}
