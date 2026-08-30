import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div
            className="site-footer-logo"
            style={{ backgroundImage: "url('/FM logo.jpeg')" }}
            role="img"
            aria-label="Flexxmarket"
          />
          <div className="site-footer-brand-text">
            <span className="site-footer-name">Flexxmarket</span>
            <span className="site-footer-tagline">Trading pro</span>
          </div>
        </div>

        <div className="site-footer-copy">
          © 2026 Flexxmarket. All rights reserved. Trading involves risk.
        </div>
      </div>
    </footer>
  );
}
