import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { MarketsPage, SpotPage, FuturesPage, BotsPage } from './pages/PlaceholderPage'

function AppRoutes() {
  const location = useLocation()
  const isAdmin  = location.pathname === '/admin'

  return (
    <>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/markets"   element={<ProtectedRoute><MarketsPage /></ProtectedRoute>} />
        <Route path="/spot"      element={<ProtectedRoute><SpotPage /></ProtectedRoute>} />
        <Route path="/futures"   element={<ProtectedRoute><FuturesPage /></ProtectedRoute>} />
        <Route path="/bots"      element={<ProtectedRoute><BotsPage /></ProtectedRoute>} />
        <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>

      {/* ChatWidget appears on every page except /admin */}
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