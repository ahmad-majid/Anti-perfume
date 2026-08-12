import React, { useState, useContext } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Tag, CheckCircle, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// ─── CouponInput sub-component ───────────────────────────────────────────────

const CouponInput = ({ subtotal, onApply, onRemove, applied }) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Invalid coupon.');
      } else {
        toast.success(`Coupon applied! You save $${data.discountAmount.toFixed(2)}`);
        onApply({ code: data.couponCode, discountAmount: data.discountAmount });
        setCode('');
      }
    } catch {
      toast.error('Could not validate coupon.');
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(110,138,115,0.1)', border: '1px solid var(--color-success)',
        }}
      >
        <CheckCircle size={16} color="var(--color-success)" />
        <span style={{ flexGrow: 1, fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-success)' }}>
          {applied.code} applied — saving ${applied.discountAmount.toFixed(2)}
        </span>
        <button
          onClick={onRemove}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          aria-label="Remove coupon"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag size={14} /> Promo Code
      </h4>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && validate()}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={validate}
          disabled={loading || !code.trim()}
          style={{ padding: '12px 20px', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

// ─── Main CheckoutForm ───────────────────────────────────────────────────────

const CheckoutForm = ({ clientSecret, subtotal, shipping }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, cartTotal, cartSubtotal, shippingCost, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  const [coupon, setCoupon] = useState(null); // { code, discountAmount }
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const effectiveSubtotal = cartSubtotal;
  const discount = coupon ? coupon.discountAmount : 0;
  const finalTotal = Math.max(0, effectiveSubtotal - discount) + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const cardElement = elements.getElement(CardElement);

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            address: { line1: address, city, state, postal_code: postalCode, country },
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const orderData = {
          orderItems: cartItems.map((item) => ({
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            imageUrl: item.imageUrl,
          })),
          shippingAddress: { address, city, state, postalCode, country },
          totalAmount: finalTotal,
          stripePaymentIntentId: paymentIntent.id,
          couponCode: coupon?.code || null,
        };

        const res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to register your order on our servers');
        }

        clearCart();
        toast.success('Order placed successfully! Thank you.');
        navigate(`/success?orderId=${data._id}`);
      }
    } catch (err) {
      console.error('Payment execution error:', err);
      setErrorMessage(err.message || 'An unexpected payment error occurred.');
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#2c221e',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#b05c5c', iconColor: '#b05c5c' },
    },
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Shipping details */}
      <div>
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16, fontWeight: 600 }}>
          Shipping Address
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="form-row-mobile">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="e.g. Sophia Miller" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Street Address</label>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="form-input" placeholder="123 Luxury Ave" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="form-row-4-mobile">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">City</label>
            <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="form-input" placeholder="New York" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">State</label>
            <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="form-input" placeholder="NY" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Zip Code</label>
            <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="form-input" placeholder="10001" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Country</label>
            <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="form-input" placeholder="US" />
          </div>
        </div>
      </div>

      {/* Coupon input */}
      <CouponInput
        subtotal={cartSubtotal}
        applied={coupon}
        onApply={setCoupon}
        onRemove={() => setCoupon(null)}
      />

      {/* Discount line */}
      {coupon && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '10px 14px', background: 'rgba(110,138,115,0.08)', borderRadius: 8 }}>
          <span style={{ color: 'var(--color-success)' }}>Discount ({coupon.code})</span>
          <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>−${coupon.discountAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Card Details */}
      <div>
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16, fontWeight: 600 }}>
          Credit Card Info
        </h4>
        <div style={{ padding: '16px 20px', borderRadius: 8, border: '1px solid rgba(106,91,83,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}>
          <CardElement options={cardStyle} />
        </div>
      </div>

      {errorMessage && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(176,92,92,0.1)', borderLeft: '4px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 4, fontSize: '0.85rem' }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe || !elements}
        className="btn btn-primary"
        style={{ width: '100%', padding: 16, letterSpacing: '0.1em', marginTop: 4 }}
      >
        {processing ? 'Processing Secure Transaction...' : `Pay $${finalTotal.toFixed(2)}`}
      </button>

      <style>{`
        @media (max-width: 768px) {
          .form-row-mobile { grid-template-columns: 1fr !important; }
          .form-row-4-mobile { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </form>
  );
};

export default CheckoutForm;
