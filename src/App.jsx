import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';
import DashNav from './components/DashNav';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import { MarketsPage, SpotPage, FuturesPage, BotsPage } from './pages/PlaceholderPage';
import './components/DashNav.css';

function HomeOrDashboard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

// Layout – only header, no footer
function DashLayout({ children, activePage, onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashNav activePage={activePage} onNavigate={onNavigate} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

function ProtectedPages() {
  const location = useLocation();
  const navigate = useNavigate();

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
      case 'home': navigate('/dashboard'); break;
      case 'markets': navigate('/markets'); break;
      case 'spot': navigate('/spot'); break;
      case 'futures': navigate('/futures'); break;
      case 'bots': navigate('/bots'); break;
      default: navigate('/dashboard');
    }
  };

  const renderPage = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return <Dashboard />;
      case '/markets': return <MarketsPage />;
      case '/spot': return <SpotPage />;
      case '/futures': return <FuturesPage />;
      case '/bots': return <BotsPage />;
      default: return <Dashboard />;
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
        <Route path="/" element={<HomeOrDashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><ProtectedPages /></ProtectedRoute>} />
        <Route path="/markets" element={<ProtectedRoute><ProtectedPages /></ProtectedRoute>} />
        <Route path="/spot" element={<ProtectedRoute><ProtectedPages /></ProtectedRoute>} />
        <Route path="/futures" element={<ProtectedRoute><ProtectedPages /></ProtectedRoute>} />
        <Route path="/bots" element={<ProtectedRoute><ProtectedPages /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
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
