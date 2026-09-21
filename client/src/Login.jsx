
import { useState } from 'react'
import './Login.css'

function Login({ onLogin, onSignupClick, onSocietyRegisterClick }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5050/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.log('Login API error:', response.status, data)
        throw new Error(
          data.message || data.error || `Login failed (${response.status})`
        )
      }

      if (!data.token) {
        throw new Error('Login response did not include a token')
      }

      onLogin(data.token)
    } catch (err) {
      setError(err.message || 'Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">S</div>
          <h1>Society<span>Fund</span></h1>
          <p>TRANSPARENCY PORTAL</p>
        </div>

        <h2>Welcome back</h2>
        <p className="login-subtitle">
          Sign in to access your society dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          className="society-register-btn"
          onClick={onSocietyRegisterClick}
        >
          <span>+</span> Register a New Society
        </button>

        <p className="login-footer">
          Don't have an account?{' '}
          <button
            type="button"
            className="signup-link"
            onClick={onSignupClick}
          >
            Create account
          </button>
        </p>

        <p className="login-footer">
          Secure access for society members
        </p>
      </div>
    </div>
  )
}

export default Login