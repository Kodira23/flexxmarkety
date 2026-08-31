import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ChatWidget from './components/ChatWidget';
import DashNav from './components/DashNav';
import Footer from './components/Footer';
import './components/DashNav.css';

// Route-level code splitting: each page only downloads once it's
// actually navigated to (or refreshed directly on), instead of every
// page's JS shipping in one bundle on first load. This is what was
// making a plain refresh feel slow — the browser had to fetch and
// parse the whole app before anything could render, no matter which
// single page was actually needed.
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// PlaceholderPage exports these as named exports from one module, so
// each lazy() call has to resolve to a { default: ... } shape itself.
const MarketsPage = lazy(() =>
  import('./pages/PlaceholderPage').then(m => ({ default: m.MarketsPage }))
);
const SpotPage = lazy(() =>
  import('./pages/PlaceholderPage').then(m => ({ default: m.SpotPage }))
);
const FuturesPage = lazy(() =>
  import('./pages/PlaceholderPage').then(m => ({ default: m.FuturesPage }))
);
const BotsPage = lazy(() =>
  import('./pages/PlaceholderPage').then(m => ({ default: m.BotsPage }))
);

// Same loading UI used both for the auth check below and as the
// Suspense fallback while a lazy-loaded page chunk downloads — so a
// refresh always shows something instead of a blank white screen.
function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: 'var(--green)', fontSize: 28 }}>◈</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading FlexMarket...</p>
    </div>
  );
}

function HomeOrDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

// Layout – header + page content + footer, consistent on every protected page
function DashLayout({ children, activePage, onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashNav activePage={activePage} onNavigate={onNavigate} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
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
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
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
