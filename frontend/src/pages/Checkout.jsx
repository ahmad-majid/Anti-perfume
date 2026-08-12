import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CheckoutForm from './CheckoutForm';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  'pk_test_51Rmj3GGhXALDa0ca1zcFlC51ZhszBJj3d5roOwuBWXmZ2KONgjXsR3OX9tlhjs2O9u6JFgSnYT2GbFT4n5pZf5iq00W7nyfUSK'
);

const Checkout = () => {
  const { cartItems, cartSubtotal, shippingCost, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login?redirect=checkout'); return; }
    if (cartItems.length === 0) { navigate('/shop'); return; }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ cartItems }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Payment intent generation failed');
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Checkout initialization failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [user, cartItems, navigate]);

  const appearance = {
    theme: 'flat',
    variables: { colorPrimary: '#593530', colorBackground: '#ffffff', colorText: '#2c221e', fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '8px' },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', minHeight: '80vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--color-rose-medium)', borderTopColor: 'var(--color-burgundy)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Initializing secure checkout channel...</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', minHeight: '80vh' }}>
        <h3 className="serif-title-small" style={{ color: 'var(--color-error)' }}>Checkout Error</h3>
        <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 24 }}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade" style={{ paddingTop: 60, minHeight: '80vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 60, alignItems: 'flex-start' }} className="checkout-grid">

        {/* Left: Payment form */}
        <div>
          <h2 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginBottom: 30 }}>Secure Checkout</h2>
          {clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="glass-panel" style={{ padding: 30, borderRadius: 24, position: 'sticky', top: 120 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-burgundy)', borderBottom: '1px solid rgba(106,91,83,0.1)', paddingBottom: 16, marginBottom: 20 }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 250, overflowY: 'auto', marginBottom: 20 }}>
            {cartItems.map((item) => (
              <div key={`${item._id}-${item.size}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                  <img src={item.imageUrl} alt={item.name} loading="lazy" width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.size} × {item.quantity}</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(106,91,83,0.1)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-burgundy)', borderTop: '1px solid rgba(106,91,83,0.08)', paddingTop: 12, marginTop: 4 }}>
              <span>Total</span><span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
