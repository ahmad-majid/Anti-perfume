import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, shippingCost, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid rgba(106, 91, 83, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--color-burgundy)" />
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Cart</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Drawer Items List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <ShoppingBag size={48} strokeWidth={1} color="var(--color-text-muted)" />
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontStyle: 'italic' }}>Your cart is empty.</p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
              >
                Go to boutique
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item._id}-${item.size}`}
                style={{
                  display: 'flex',
                  gap: '16px',
                  borderBottom: '1px solid rgba(106, 91, 83, 0.05)',
                  paddingBottom: '16px',
                }}
              >
                {/* Product image */}
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: '500' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Size: {item.size}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(106, 91, 83, 0.2)', borderRadius: '20px', padding: '2px 8px' }}>
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ margin: '0 10px', fontSize: '0.85rem', fontWeight: '500' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', opacity: item.quantity >= item.stock ? 0.3 : 1, pointerEvents: item.quantity >= item.stock ? 'none' : 'auto' }}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    {/* Price */}
                    <span style={{ fontWeight: '600', color: 'var(--color-burgundy)', fontSize: '0.95rem' }}>
                      Rs. {Number(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item._id, item.size)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', alignSelf: 'flex-start', padding: '4px' }}
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Calculations */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid rgba(106, 91, 83, 0.1)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '600' }}>Rs. {Number(cartSubtotal).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <span>Shipping</span>
              <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>{shippingCost === 0 ? 'FREE across Pakistan' : `Rs. ${Number(shippingCost).toLocaleString()}`}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: '700',
                color: 'var(--color-burgundy)',
                paddingTop: '10px',
                borderTop: '1px solid rgba(106, 91, 83, 0.08)',
              }}
            >
              <span>Total</span>
              <span>Rs. {Number(cartTotal).toLocaleString()}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px', letterSpacing: '0.1em' }}
              onClick={handleCheckout}
            >
              Secure Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;