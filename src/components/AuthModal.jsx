import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './AuthModal.css'

export default function AuthModal({ mode: initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode || 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
        navigate('/dashboard')
      } else {
        const { error } = await signUp(email, password, username)
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-logo">
          <span className="logo-icon-sm">◈</span>
          <span className="modal-brand">FlexMarket</span>
        </div>

        <div className="modal-tabs">
          <button className={mode === 'signin' ? 'tab active' : 'tab'} onClick={() => { setMode('signin'); setError(''); setSuccess('') }}>Sign In</button>
          <button className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="yourname"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">{success}</div>}

          <button type="submit" className="btn-primary modal-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p className="modal-disclaimer">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
