import './Navbar.css';
export default function Navbar({ onSignIn, onGetStarted }) {
  const handleSignIn = () => {
    console.log('Sign In clicked – implement your auth logic');
    if (onSignIn) onSignIn();
  };
  const handleGetStarted = () => {
    console.log('Get Started clicked');
    if (onGetStarted) onGetStarted();
  };
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo + brand + subline */}
        <div className="navbar-logo">
          <div
            className="navbar-logo-bg"
            style={{ backgroundImage: "url('/FM logo.jpeg')" }}
            role="img"
            aria-label="Flexxmarket"
          />
          <div className="navbar-brand-wrapper">
            <span className="navbar-brand-text">FlexxMarket</span>
            <span className="navbar-brand-sub">Trading pro</span>
          </div>
        </div>
        <div className="navbar-actions">
          <button className="btn-ghost" onClick={handleSignIn}>
            Sign In
          </button>
          <button className="btn-primary" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
