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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSuccess('')
    setResendMessage('')
  }

  useEffect(() => {
    document.body.classList.add('auth-open')
    return () => document.body.classList.remove('auth-open')
  }, [])

  // Prefill remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('flexx_remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
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

        // Persist or clear the remembered email based on the checkbox
        if (rememberMe) {
          localStorage.setItem('flexx_remembered_email', email)
        } else {
          localStorage.removeItem('flexx_remembered_email')
        }

        onClose()
        navigate('/dashboard')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error

        if (data?.session) {
          // Project has email confirmation OFF — user is signed in immediately
          onClose()
          navigate('/dashboard')
        } else {
          // Email confirmation is required — do not attempt to sign the user in.
          // Show a "check your inbox" screen instead.
          setPendingEmail(email)
          setMode('confirm')
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendMessage('')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setResendMessage('Confirmation email resent.')
    } catch (err) {
      setResendMessage(err.message || 'Could not resend the email.')
    } finally {
      setResendLoading(false)
    }
  }

  if (mode === 'confirm') {
    return (
      <div className="auth-overlay">
        <div className="auth-page">
          <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="auth-visual-panel">
            <div className="auth-visual-inner">
              <h2 className="auth-visual-heading">
                Beyond Every<br />
                <span className="auth-visual-heading-accent">Market</span>
              </h2>
              <p className="auth-visual-copy">
                Access real-time crypto data, advanced charts, and automated trading
                tools — all in one powerful platform.
              </p>
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-form-inner">
              <h1 className="auth-title">Check your e-mail</h1>
              <p className="auth-subtitle">
                We sent a confirmation link to <strong>{pendingEmail}</strong>.
                Click it to activate your account, then sign in below.
              </p>

              {resendMessage && <div className="modal-success">{resendMessage}</div>}

              <button
                type="button"
                className="auth-submit"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend confirmation email'}
              </button>

              <p className="auth-switch">
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchMode('signin')}
                >
                  Back to sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-overlay">
      <div className="auth-page">
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-visual-panel">
          <div className="auth-visual-inner">
            <h2 className="auth-visual-heading">
              Beyond Every<br />
              <span className="auth-visual-heading-accent">Market</span>
            </h2>

            <p className="auth-visual-copy">
              Access real-time crypto data, advanced charts, and automated trading
              tools — all in one powerful platform.
            </p>

            <div className="auth-visual-stats">
              <div className="auth-stat">
                <span className="auth-stat-value">50+</span>
                <span className="auth-stat-label">Markets</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat-value">1.95x</span>
                <span className="auth-stat-label">Multiplier</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat-value">24/7</span>
                <span className="auth-stat-label">Trading</span>
              </div>
            </div>

            <ul className="auth-visual-features">
              <li>
                <span className="auth-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                Lightning-fast execution
              </li>
              <li>
                <span className="auth-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                Bank-grade security
              </li>
              <li>
                <span className="auth-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <circle cx="8" cy="16" r="1" />
                    <circle cx="16" cy="16" r="1" />
                  </svg>
                </span>
                Auto trading bot included
              </li>
            </ul>
          </div>
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
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
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
