'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (email !== 'info@taskivetech.tech') {
        throw new Error('Access denied. This area is restricted to authorized personnel.')
      }

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.')
        }
        throw signInError
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <div className="login-page"><div className="login-card">Loading...</div></div>
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="title">Admin Access</h1>
        <p className="subtitle">Please sign in to continue</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@taskive.dev"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-background);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          border-radius: 16px;
          background-color: var(--color-background-white);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--color-border-light);
        }

        .title {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 8px;
          text-align: center;
        }

        .subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 32px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--color-text-primary);
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .error-message {
          padding: 12px;
          background-color: #FEF2F2;
          color: #DC2626;
          font-size: 13px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background-color: var(--color-text-primary);
          color: var(--color-background);
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .login-btn:hover {
          opacity: 0.9;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
