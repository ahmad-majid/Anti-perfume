import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid rgba(106, 91, 83, 0.1)', padding: '80px 0 40px 0', marginTop: '100px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '48px', marginBottom: '60px' }}>
          
          {/* Logo & Slogan Column */}
          <div>
            <h3 style={{ fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-burgundy)', fontWeight: '600', marginBottom: '20px' }}>
              Anti
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '300px' }}>
              Redefining luxury through fragrance and elegance. Experiencing timeless perfumes crafted with passion.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '24px', fontWeight: '600' }}>
              Shop
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li><a href="/shop" style={{ color: 'var(--color-text-primary)' }}>All Collection</a></li>
              <li><a href="/shop?category=Floral" style={{ color: 'var(--color-text-primary)' }}>Best Sellers</a></li>
              <li><a href="/shop?category=Woody" style={{ color: 'var(--color-text-primary)' }}>Oud Collection</a></li>
              <li><a href="/shop?category=Citrus" style={{ color: 'var(--color-text-primary)' }}>Citrus Fresh</a></li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '24px', fontWeight: '600' }}>
              Our Story
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li><a href="/#about" style={{ color: 'var(--color-text-primary)' }}>The Brand</a></li>
              <li><a href="/#about" style={{ color: 'var(--color-text-primary)' }}>Ingredients</a></li>
              <li><a href="/#about" style={{ color: 'var(--color-text-primary)' }}>Craftsmanship</a></li>
              <li><a href="/#about" style={{ color: 'var(--color-text-primary)' }}>Returns & FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '24px', fontWeight: '600' }}>
              Stay in the Loop
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Subscribe to receive exclusive offers, new perfume arrivals, and fragrance journals.
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', position: 'relative' }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 16px',
                  borderRadius: '30px',
                  border: '1px solid rgba(106, 91, 83, 0.2)',
                  backgroundColor: 'white',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-burgundy)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)',
                }}
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom copyright details */}
        <div style={{ borderTop: '1px solid rgba(106, 91, 83, 0.08)', paddingTop: '30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <p>© {new Date().getFullYear()} Anti. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;