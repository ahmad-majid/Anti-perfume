import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Heart, LayoutDashboard, Flame } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = ({ onCartOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSales, setActiveSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch active sales and navbar categories
  useEffect(() => {
    // 1. Active Sales
    fetch('http://localhost:5000/api/sales/active')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActiveSales(data.filter(s => s.showOnNavbar !== false));
        }
      })
      .catch(() => {});

    // 2. Site Config Categories
    fetch('http://localhost:5000/api/site-config')
      .then(res => res.json())
      .then(data => {
        if (data?.navbarCategories?.length > 0) {
          setCategories(data.navbarCategories.filter(c => c.isVisible !== false));
        } else {
          // Defaults if not set
          setCategories([
            { name: 'Floral', isVisible: true },
            { name: 'Woody', isVisible: true },
            { name: 'Citrus', isVisible: true },
            { name: 'Amber', isVisible: true },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const wishlistCount = wishlistItems?.length || 0;

  return (
    <header className="navbar-container glass-panel" style={{ borderBottom: '1px solid rgba(106,91,83,0.1)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 80, gap: 16 }}>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo" style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-burgundy)', fontWeight: 700, flexShrink: 0 }}>
          Anti
        </Link>

        {/* Desktop Navigation with Dynamic Categories & Active Sales */}
        <nav style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'nowrap' }} className="desktop-nav">
          <Link to="/shop" style={{ fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            All Perfumes
          </Link>

          {/* Admin-Controlled Category Links */}
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--color-burgundy)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-secondary)')}
            >
              {cat.name}
            </Link>
          ))}

          {/* Active Sales Campaign Buttons */}
          {activeSales.map((sale) => (
            <Link
              key={sale._id}
              to={`/sale/${sale.slug}`}
              style={{
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #A82C2C, var(--color-burgundy))',
                padding: '6px 14px',
                borderRadius: 20,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 8px rgba(168,44,44,0.25)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Flame size={13} fill="#FFE082" color="#FFE082" />
              {sale.name}
            </Link>
          ))}
        </nav>

        {/* Search autocomplete */}
        <div className="desktop-nav" style={{ flexShrink: 0 }}>
          <SearchAutocomplete />
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {user ? (
            <>
              {/* Profile */}
              <Link to="/profile" className="btn-icon" title="My Profile" aria-label="Profile">
                <User size={18} color="var(--color-burgundy)" />
              </Link>

              {/* Wishlist with count badge */}
              <Link to="/wishlist" className="btn-icon" style={{ position: 'relative' }} title="My Wishlist" aria-label="Wishlist">
                <Heart size={18} color="var(--color-burgundy)" />
                {wishlistCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-rose-dark)', color: 'white', fontSize: '0.68rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Admin badge + dashboard link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  title="Admin Dashboard"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', background: 'var(--color-gold)', color: 'white', padding: '5px 12px', borderRadius: 14, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}
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
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--color-burgundy)', color: 'white', fontSize: '0.72rem', fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
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
        <div style={{ background: 'var(--bg-primary)', padding: '18px 24px', borderTop: '1px solid rgba(106,91,83,0.1)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ marginBottom: 4 }}><SearchAutocomplete /></div>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 600 }}>Home</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 600 }}>All Perfumes</Link>
          
          {/* Mobile Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '6px 0' }}>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 16, color: 'var(--color-text-primary)' }}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Mobile Active Sales */}
          {activeSales.map((sale) => (
            <Link
              key={sale._id}
              to={`/sale/${sale.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'white',
                background: 'linear-gradient(135deg, #A82C2C, var(--color-burgundy))',
                padding: '10px 16px',
                borderRadius: 10,
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Flame size={16} fill="#FFE082" color="#FFE082" />
              {sale.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>My Wishlist ({wishlistCount})</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>My Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--color-gold)', fontWeight: 700 }}>Admin Dashboard</Link>
              )}
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--color-burgundy)', fontWeight: 600 }}>Login / Register</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
