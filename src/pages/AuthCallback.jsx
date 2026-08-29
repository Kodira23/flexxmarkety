import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

// Landing page for the link inside the confirmation e-mail
// (emailRedirectTo: `${origin}/auth/callback`).
//
// supabase-js has `detectSessionInUrl: true` by default, so it automatically
// reads the token/code out of the URL and establishes the session as soon as
// this page loads — we just need to wait for that and then push the user
// on to the dashboard.
//
// If the redirect URL isn't on the project's allow-list, or the link is
// otherwise invalid/expired, Supabase returns its own error in the URL
// (e.g. #error=access_denied&error_description=...) instead of a session.
// We surface that directly rather than making the user wait out a timeout.
export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let settled = false

    const finish = (session) => {
      if (settled) return
      settled = true
      if (session) {
        navigate('/dashboard', { replace: true })
      }
    }

    // Supabase puts auth errors in the URL hash (implicit flow) or search
    // params (PKCE flow) — check both before anything else.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const searchParams = new URLSearchParams(window.location.search)
    const errorDescription =
      hashParams.get('error_description') || searchParams.get('error_description')
    const errorCode = hashParams.get('error') || searchParams.get('error')

    if (errorCode) {
      settled = true
      setError(
        errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'This confirmation link is invalid or has expired.'
      )
      return
    }

    // Covers the case where the session is already parsed by the time
    // this effect runs.
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message)
        return
      }
      finish(data?.session)
    })

    // Covers the case where parsing finishes just after mount.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      finish(session)
    })

    // If nothing happens in a reasonable window, surface an error instead
    // of leaving the user stuck on a blank screen.
    const timeout = setTimeout(() => {
      if (!settled) {
        setError('This confirmation link is invalid or has expired.')
      }
    }, 8000)

    return () => {
      listener?.subscription?.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: 'center',
        padding: '24px',
      }}
    >
      {error ? (
        <>
          <p style={{ color: '#ef4444', fontWeight: 700, margin: 0, maxWidth: 420 }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: 12,
              padding: '10px 24px',
              background: '#22c55e',
              color: '#000',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to home
          </button>
        </>
      ) : (
        <p style={{ color: '#999', margin: 0 }}>Confirming your account...</p>
      )}
    </div>
  )
}
