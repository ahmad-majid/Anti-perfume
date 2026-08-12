import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, error, setError } = useContext(AuthContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirect = new URLSearchParams(location.search).get('redirect') || '';

  useEffect(() => {
    if (user) {
      if (redirect) {
        navigate(`/${redirect}`);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
    setError(null);
  }, [user, navigate, redirect, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login submit error:', err);
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
          <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Welcome Back</span>
          <h2 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginTop: '8px' }}>Log In to Anti</h2>
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
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', letterSpacing: '0.1em' }}>
            Sign In
          </button>
        </form>

        {/* Register redirect */}
        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            to={redirect ? `/register?redirect=${redirect}` : '/register'}
            style={{ color: 'var(--color-burgundy)', fontWeight: '600', borderBottom: '1px solid var(--color-burgundy)' }}
          >
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
