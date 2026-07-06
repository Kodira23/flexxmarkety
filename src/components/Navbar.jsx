import './Navbar.css';

export default function Navbar({ onSignIn, onGetStarted }) {
  // Sign In is fully functional – you can pass a real auth function
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
        {/* Logo only – no links */}
        <div className="navbar-logo">
          <img src="/logoz.jpeg" alt="Flexxmarket" className="navbar-logo-img" />
        </div>
        {/* No navigation links – removed */}
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
