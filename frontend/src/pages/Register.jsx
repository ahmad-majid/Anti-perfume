import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, user, error, setError } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      navigate(redirect ? `/${redirect}` : '/profile');
    }
    // Clear any previous errors on mount
    setError(null);
  }, [user, navigate, redirect, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
    } catch (err) {
      console.error('Registration submit error:', err);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div
        className="glass-panel animate-fade"
        style={{
          width: '450px',
          maxWidth: '100%',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 12px 40px var(--color-shadow)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Join the Journey</span>
          <h2 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginTop: '8px' }}>Create Account</h2>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(176, 92, 92, 0.1)',
              borderLeft: '4px solid var(--color-error)',
              color: 'var(--color-error)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. EleganceSeeker"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password (Min 6 Characters)</label>
            <input
              type="password"
              required
              minLength={6}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', letterSpacing: '0.1em' }}>
            Register Now
          </button>
        </form>

        {/* Login redirect */}
        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link
            to={redirect ? `/login?redirect=${redirect}` : '/login'}
            style={{ color: 'var(--color-burgundy)', fontWeight: '600', borderBottom: '1px solid var(--color-burgundy)' }}
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
