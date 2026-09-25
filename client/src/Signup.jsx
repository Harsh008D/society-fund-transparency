
import { useState } from 'react'
import './Signup.css'

function Signup({ onBackToLogin, onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'https://society-fund-transparency.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            invitationCode,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      if (!data.token) {
        throw new Error('Account created, but no login token was returned.')
      }
      
      onRegister(data.token)
    } catch (err) {
      setError(err.message || 'Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-brand">
          <div className="signup-logo">S</div>
          <h1>Society<span>Fund</span></h1>
          <p>TRANSPARENCY PORTAL</p>
        </div>

        <h2>Create your account</h2>
        <p className="signup-subtitle">
          Join your society's transparency portal.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label>Society invitation code</label>
          <input
            type="text"
            placeholder="Enter your invitation code"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            required
          />

          {error && (
            <p className="signup-error">{error}</p>
          )}

          {message && (
            <p className="signup-success">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{' '}
          <button
            type="button"
            className="signup-link"
            onClick={onBackToLogin}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup