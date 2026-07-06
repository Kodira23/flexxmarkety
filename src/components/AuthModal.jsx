import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import './AuthModal.css'

export default function AuthModal({ mode: initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode || 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSuccess('')
  }

  useEffect(() => {
    document.body.classList.add('auth-open')
    return () => document.body.classList.remove('auth-open')
  }, [])

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
        // Sign up without email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: undefined,
          },
        })
        if (error) throw error

        // If session is returned immediately, user is logged in — go straight to dashboard
        if (data?.session) {
          onClose()
          navigate('/dashboard')
        } else {
          // Supabase project still has email confirm ON — auto sign them in manually
          const { error: signInError } = await signIn(email, password)
          if (signInError) {
            setSuccess('Account created! You can now sign in.')
            setMode('signin')
          } else {
            onClose()
            navigate('/dashboard')
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-page">
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-image-panel">
          <img src="/logoz.jpeg" alt="FlexMarket" className="auth-image" />
          <div className="auth-image-overlay" />
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <h1 className="auth-title">
              {mode === 'signin' ? 'Welcome back' : 'Welcome'}
            </h1>
            <p className="auth-subtitle">Please enter your details.</p>

            <form onSubmit={handleSubmit} className="auth-form">
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
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="Enter your e-mail"
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

              {mode === 'signin' && (
                <div className="auth-row">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <a href="#" className="forgot-link">Forgot your password?</a>
                </div>
              )}

              {error && <div className="modal-error">{error}</div>}
              {success && <div className="modal-success">{success}</div>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'signin' ? 'Log in' : 'Register'}
              </button>
            </form>

            <p className="auth-switch">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => switchMode('signup')}>
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => switchMode('signin')}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
