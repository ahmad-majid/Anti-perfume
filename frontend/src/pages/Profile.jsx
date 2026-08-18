import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, ShoppingBag, Heart } from 'lucide-react';
import OrderTimeline from '../components/OrderTimeline';
import { SkeletonOrderRow } from '../components/Skeleton';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching user orders:', error);
        toast.error('Could not load your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]); // eslint-disable-line

  if (!user) return null;

  return (
    <div className="container animate-fade" style={{ paddingTop: 60, minHeight: '80vh' }}>

      {/* Welcome banner */}
      <div className="glass-panel" style={{ padding: 40, borderRadius: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 60 }}>
        <div>
          <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Your Lounge</span>
          <h2 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginTop: 8 }}>Hello, {user.username}</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          <span><strong>Email:</strong> {user.email}</span>
          <span><strong>Role:</strong> {user.role === 'admin' ? 'Administrator' : 'Premium Member'}</span>
        </div>
        <Link to="/wishlist" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px' }}>
          <Heart size={16} /> My Wishlist
        </Link>
      </div>

      <h3 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginBottom: 30 }}>Order History</h3>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[1, 2].map(i => <SkeletonOrderRow key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', border: '1px dashed rgba(106,91,83,0.3)', borderRadius: 16, color: 'var(--color-text-secondary)' }}>
          <ShoppingBag size={40} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontStyle: 'italic', marginBottom: 16 }}>You haven't placed any orders yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Shop Our Collection</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(106,91,83,0.1)' }}>

              {/* Order meta strip */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(106,91,83,0.08)' }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Order ID</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>#{order._id.slice(-8)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Placed On</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Total Amount</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-burgundy)' }}>Rs. {Math.round(order.totalAmount).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                <OrderTimeline status={order.status} statusHistory={order.statusHistory} />
              </div>

              {/* Order items */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {order.orderItems.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        width={50}
                        height={50}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Qty: {item.quantity} · Size: {item.size}</span>
                    </div>
                    <span style={{ fontWeight: 500 }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default Profile;
