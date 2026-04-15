import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ChatWidget from './components/ChatWidget'
import DashNav from './components/DashNav'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { MarketsPage, SpotPage, FuturesPage, BotsPage } from './pages/PlaceholderPage'
import './components/DashNav.css'

// Layout that receives activePage and onNavigate
function DashLayout({ children, activePage, onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashNav activePage={activePage} onNavigate={onNavigate} />
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* DESKTOP FOOTER */}
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

      {/* MOBILE FOOTER */}
      <footer className="mobile-footer">
        <div className="mobile-footer-inner">
          <span className="mobile-footer-logo">◈ Flexxmarket</span>
          <span className="mobile-footer-copy">© 2026 · Pro Trading</span>
        </div>
      </footer>
    </div>
  )
}

// Wrapper component that manages navigation state
function ProtectedPages() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active page based on current path
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'home';
    if (path === '/markets') return 'markets';
    if (path === '/spot') return 'spot';
    if (path === '/futures') return 'futures';
    if (path === '/bots') return 'bots';
    return 'home';
  };

  const handleNavigate = (pageId) => {
    switch (pageId) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'markets':
        navigate('/markets');
        break;
      case 'spot':
        navigate('/spot');
        break;
      case 'futures':
        navigate('/futures');
        break;
      case 'bots':
        navigate('/bots');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Render the appropriate page component based on route
  const renderPage = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return <Dashboard />;
      case '/markets':
        return <MarketsPage />;
      case '/spot':
        return <SpotPage />;
      case '/futures':
        return <FuturesPage />;
      case '/bots':
        return <BotsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashLayout activePage={getActivePage()} onNavigate={handleNavigate}>
      {renderPage()}
    </DashLayout>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedPages />
          </ProtectedRoute>
        } />
        <Route path="/markets" element={
          <ProtectedRoute>
            <ProtectedPages />
          </ProtectedRoute>
        } />
        <Route path="/spot" element={
          <ProtectedRoute>
            <ProtectedPages />
          </ProtectedRoute>
        } />
        <Route path="/futures" element={
          <ProtectedRoute>
            <ProtectedPages />
          </ProtectedRoute>
        } />
        <Route path="/bots" element={
          <ProtectedRoute>
            <ProtectedPages />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
      </Routes>
      {!isAdmin && <ChatWidget />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
