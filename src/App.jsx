import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

function DashLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
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
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashLayout><Dashboard /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/markets" element={
          <ProtectedRoute>
            <DashLayout><MarketsPage /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/spot" element={
          <ProtectedRoute>
            <DashLayout><SpotPage /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/futures" element={
          <ProtectedRoute>
            <DashLayout><FuturesPage /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/bots" element={
          <ProtectedRoute>
            <DashLayout><BotsPage /></DashLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
      </Routes>
      {!isAdmin && <ChatWidget />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
