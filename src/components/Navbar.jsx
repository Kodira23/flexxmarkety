import './Navbar.css';

const NAV_LINKS = [
  { label: 'Markets', id: 'markets' },
  { label: 'Trade',   id: 'trade' },
  { label: 'Features',id: 'features' },
  { label: 'Pricing', id: 'pricing' },
];

export default function Navbar() {
  // Disabled navigation – links do nothing
  const handleClick = (id) => {
    console.log(`Navigation to ${id} is disabled.`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); handleClick('home'); }}>
          <span className="logo-icon">◈</span>
          <div className="logo-text">
            <span className="logo-main">Flexxmarket</span>
            <span className="logo-sub">Pro Trading</span>
          </div>
        </a>

        <div className="navbar-links">
          {NAV_LINKS.map(link => (
            <a
              key={link.id}
              href="#"
              onClick={(e) => { e.preventDefault(); handleClick(link.id); }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="btn-ghost" onClick={() => handleClick('signin')}>
            Sign In
          </button>
          <button className="btn-primary" onClick={() => handleClick('signup')}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
