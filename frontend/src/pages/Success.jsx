import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, ArrowRight, Clipboard } from 'lucide-react';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = new URLSearchParams(location.search).get('orderId');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Order details not found');
        }

        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching success order details:', error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, orderId, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-rose-medium)', borderTopColor: 'var(--color-burgundy)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
        <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Fetching your order invoice details...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade" style={{ paddingTop: '80px', minHeight: '80vh', maxWidth: '600px', textAlign: 'center' }}>
      
      {/* Huge Gold Check icon */}
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.15)', color: 'var(--color-gold)', marginBottom: '32px' }}>
        <CheckCircle size={44} strokeWidth={1.5} />
      </div>

      <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600', display: 'block' }}>
        Payment Authorized
      </span>
      
      <h1 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: '8px', marginBottom: '16px' }}>
        Thank You for Your Order
      </h1>
      
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '40px' }}>
        Your transaction was successful. We have received your order details and our scent alchemists are already packaging your fragrances.
      </p>

      {/* Invoice details box */}
      {order && (
        <div
          className="glass-panel"
          style={{
            padding: '30px',
            borderRadius: '16px',
            textAlign: 'left',
            marginBottom: '40px',
            border: '1px solid rgba(106, 91, 83, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(106, 91, 83, 0.08)', paddingBottom: '12px', marginBottom: '16px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>Order Number</span>
            <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>#{order._id}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '16px' }}>
            {order.orderItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {item.name} <strong style={{ color: 'var(--color-text-muted)' }}>({item.size} x{item.quantity})</strong>
                </span>
                <span style={{ fontWeight: '500' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(106, 91, 83, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Total Amount</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-burgundy)' }}>${order.totalAmount.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span><strong>Deliver to:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</span>
            </div>
          </div>
        </div>
      )}

      {/* Next actions */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/profile" className="btn btn-primary" style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
          View My Orders <ArrowRight size={16} />
        </Link>
        <Link to="/shop" className="btn btn-secondary">
          Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Success;