import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Heart, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = ({ onCartOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-container glass-panel" style={{ borderBottom: '1px solid rgba(106,91,83,0.1)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 80 }}>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo" style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-burgundy)', fontWeight: 600, flexShrink: 0 }}>
          Anti
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
          <Link to="/" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--color-text-primary)' }}>Home</Link>
          <Link to="/shop" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--color-text-primary)' }}>Collection</Link>
          <a href="#about" style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--color-text-primary)' }}>About</a>
        </nav>

        {/* Search autocomplete — desktop only */}
        <div className="desktop-nav">
          <SearchAutocomplete />
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              {/* Profile */}
              <Link to="/profile" className="btn-icon" title="My Profile" aria-label="Profile">
                <User size={18} color="var(--color-burgundy)" />
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="btn-icon" title="My Wishlist" aria-label="Wishlist">
                <Heart size={18} color="var(--color-burgundy)" />
              </Link>

              {/* Admin badge + dashboard link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  title="Admin Dashboard"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', background: 'var(--color-gold)', color: 'white', padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}
                >
                  <LayoutDashboard size={13} /> Admin
                </Link>
              )}

              {/* Logout */}
              <button onClick={handleLogout} className="btn-icon" title="Logout" aria-label="Logout">
                <LogOut size={18} color="var(--color-error)" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-icon" title="Login" aria-label="Login">
              <User size={18} color="var(--color-text-primary)" />
            </Link>
          )}

          {/* Cart */}
          <button onClick={onCartOpen} className="btn-icon" style={{ position: 'relative' }} title="Shopping Cart" aria-label="Open cart">
            <ShoppingBag size={18} color="var(--color-text-primary)" />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-burgundy)', color: 'white', fontSize: '0.72rem', fontWeight: 600, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn-icon mobile-menu-btn" style={{ display: 'none' }} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderTop: '1px solid rgba(106,91,83,0.1)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Mobile search */}
          <div style={{ marginBottom: 4 }}><SearchAutocomplete /></div>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Home</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Collection</Link>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>About</a>
          {user ? (
            <>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>My Wishlist</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>My Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--color-gold)', fontWeight: 600 }}>Admin Dashboard</Link>
              )}
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--color-burgundy)' }}>Login</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
