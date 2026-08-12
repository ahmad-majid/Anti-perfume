import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Package, ShoppingBag, Star, Tag, Users,
  DollarSign, CheckCircle, XCircle, Trash2, Edit2, Plus, X,
  ChevronRight, Mail, Calendar, Sparkles, Settings,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonBlock } from '../components/Skeleton';
import OrderTimeline from '../components/OrderTimeline';

const API = 'http://localhost:5000/api';

// ─── Simple fetch helper (no hooks magic, just plain async) ─────────────────
async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ─── Generic data-loading hook (stable, no infinite loops) ──────────────────
function useData(url, token) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);          // bump to refetch

  useEffect(() => {
    if (!url || !token) return;
    let cancelled = false;
    setLoading(true);
    apiFetch(url, token)
      .then(d  => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url, token, tick]);                              // tick is the only "re-run" trigger

  const refetch = () => setTick(t => t + 1);
  return { data, loading, error, refetch };
}

// ─── Shared widgets ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'var(--color-burgundy)' }) => (
  <div className="glass-panel" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 18 }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>{value ?? '—'}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Processing:         { bg: 'rgba(197,160,89,0.15)',  color: '#A07828' },
    Shipped:            { bg: 'rgba(89,53,48,0.1)',     color: 'var(--color-burgundy)' },
    'Out for Delivery': { bg: 'rgba(166,110,99,0.15)',  color: 'var(--color-rose-dark)' },
    Delivered:          { bg: 'rgba(110,138,115,0.15)', color: 'var(--color-success)' },
    Cancelled:          { bg: 'rgba(176,92,92,0.15)',   color: 'var(--color-error)' },
  };
  const s = map[status] || { bg: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' };
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const TH = ({ children }) => (
  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
    {children}
  </th>
);
const TD = ({ children, style }) => (
  <td style={{ padding: '12px 16px', ...style }}>{children}</td>
);

// ─── Order detail modal ──────────────────────────────────────────────────
const OrderModal = ({ order, token, onClose, onSaved }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/orders/${order._id}/status`, token, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      toast.success('Order status updated.');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,34,30,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(106,91,83,0.1)' }}>
          <div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Details</p>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-burgundy)', marginTop: 2 }}>#{order._id.slice(-10)}</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* customer */}
          <div className="glass-panel" style={{ padding: '14px 20px', borderRadius: 12 }}>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>Customer</p>
            <p style={{ fontWeight: 600 }}>{order.user?.username || '—'}</p>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>{order.user?.email}</p>
          </div>

          {/* timeline */}
          <div>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 12 }}>Progress</p>
            <OrderTimeline status={order.status} statusHistory={order.statusHistory} />
          </div>

          {/* status buttons */}
          <div>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 10 }}>Update Status</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Processing','Shipped','Out for Delivery','Delivered','Cancelled'].map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{ padding: '8px 16px', borderRadius: 20, border: status === s ? 'none' : '1px solid rgba(106,91,83,0.2)', background: status === s ? 'var(--color-burgundy)' : 'transparent', color: status === s ? 'white' : 'var(--color-text-primary)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* items */}
          <div>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 12 }}>Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                    <img src={item.imageUrl} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{item.size} × {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* shipping */}
          <div className="glass-panel" style={{ padding: '14px 20px', borderRadius: 12 }}>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>Ship To</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
            </p>
          </div>

          {/* total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px solid rgba(106,91,83,0.1)' }}>
            <span style={{ fontWeight: 600 }}>Order Total</span>
            <span style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--color-burgundy)' }}>${order.totalAmount?.toFixed(2)}</span>
          </div>

          <button onClick={save} disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: 14 }}>
            {saving ? 'Saving...' : 'Save Status & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics tab ────────────────────────────────────────────────────────
const AnalyticsTab = ({ token }) => {
  const { data, loading } = useData(`${API}/admin/analytics`, token);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
      {[1,2,3,4].map(i => <SkeletonBlock key={i} height={100} borderRadius={16} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
        <StatCard icon={DollarSign} label="Total Revenue"  value={`$${(data?.totalRevenue || 0).toFixed(2)}`} color="var(--color-gold)" />
        <StatCard icon={ShoppingBag} label="Total Orders"  value={data?.totalOrders  ?? 0} />
        <StatCard icon={Users}       label="Total Users"   value={data?.totalUsers   ?? 0} color="var(--color-success)" />
        <StatCard icon={Package}     label="Products"      value={data?.totalProducts ?? 0} color="var(--color-rose-dark)" />
      </div>

      {data?.monthlySales?.length > 0 && (
        <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>Monthly Sales</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead><tr style={{ borderBottom: '2px solid rgba(106,91,83,0.1)', background: 'var(--bg-secondary)' }}>
                {['Month','Orders','Revenue'].map(h => <TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {data.monthlySales.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                    <TD>{r._id}</TD>
                    <TD style={{ color: 'var(--color-text-secondary)' }}>{r.count}</TD>
                    <TD style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>${r.revenue.toFixed(2)}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.recentOrders?.length > 0 && (
        <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>Recent Orders</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead><tr style={{ borderBottom: '2px solid rgba(106,91,83,0.1)', background: 'var(--bg-secondary)' }}>
                {['Order ID','Customer','Amount','Status','Date'].map(h => <TH key={h}>{h}</TH>)}
              </tr></thead>
              <tbody>
                {data.recentOrders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                    <TD style={{ fontFamily: 'monospace', fontSize: '0.79rem' }}>#{o._id.slice(-8)}</TD>
                    <TD>{o.user?.username || '—'}</TD>
                    <TD style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>${o.totalAmount?.toFixed(2)}</TD>
                    <TD><StatusBadge status={o.status} /></TD>
                    <TD style={{ color: 'var(--color-text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Orders tab ───────────────────────────────────────────────────────────
const OrdersTab = ({ token }) => {
  const { data, loading, refetch } = useData(`${API}/orders`, token);
  const [selected, setSelected] = useState(null);
  const list = Array.isArray(data) ? data : [];

  if (loading) return <SkeletonBlock height={300} borderRadius={16} />;

  return (
    <>
      {selected && <OrderModal order={selected} token={token} onClose={() => setSelected(null)} onSaved={refetch} />}
      <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(106,91,83,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.87rem' }}>{list.length} orders total</span>
          <button onClick={refetch} style={{ border: '1px solid rgba(106,91,83,0.2)', background: 'transparent', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-burgundy)', fontWeight: 600 }}>↻ Refresh</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead><tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
              {['Order ID','Customer','Total','Items','Status','Date',''].map((h,i) => <TH key={i}>{h}</TH>)}
            </tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No orders found.</td></tr>
              ) : list.map(o => (
                <tr key={o._id} onClick={() => setSelected(o)} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <TD style={{ fontFamily: 'monospace', fontSize: '0.79rem' }}>#{o._id.slice(-8)}</TD>
                  <TD><span style={{ fontWeight: 600 }}>{o.user?.username || '—'}</span><br /><span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{o.user?.email}</span></TD>
                  <TD style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>${o.totalAmount?.toFixed(2)}</TD>
                  <TD style={{ color: 'var(--color-text-secondary)' }}>{o.orderItems?.length}</TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD style={{ color: 'var(--color-text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</TD>
                  <TD><ChevronRight size={16} color="var(--color-text-muted)" /></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ─── Customers tab ────────────────────────────────────────────────────────
const CustomersTab = ({ token }) => {
  const { data, loading } = useData(`${API}/admin/customers`, token);
  const [expanded, setExpanded] = useState(null);
  const list = Array.isArray(data) ? data : [];

  if (loading) return <SkeletonBlock height={250} borderRadius={16} />;

  return (
    <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(106,91,83,0.08)' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.87rem' }}>{list.length} registered customers</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead><tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
            {['Customer','Email','Joined','Orders','Total Spent',''].map((h,i) => <TH key={i}>{h}</TH>)}
          </tr></thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No customers yet.</td></tr>
            ) : list.map(c => (
              <React.Fragment key={c._id}>
                <tr onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                  style={{ borderBottom: '1px solid rgba(106,91,83,0.06)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = expanded === c._id ? 'rgba(250,246,240,0.6)' : 'transparent'}>
                  <TD style={{ fontWeight: 600 }}>{c.username}</TD>
                  <TD style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Mail size={13} />{c.email}</span>
                  </TD>
                  <TD style={{ color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />{new Date(c.createdAt).toLocaleDateString()}</span>
                  </TD>
                  <TD>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(89,53,48,0.08)', color: 'var(--color-burgundy)', fontWeight: 700, fontSize: '0.82rem' }}>{c.orderCount}</span>
                  </TD>
                  <TD style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>${c.totalSpent.toFixed(2)}</TD>
                  <TD>
                    <ChevronRight size={16} color="var(--color-text-muted)" style={{ transition: 'transform 0.2s', transform: expanded === c._id ? 'rotate(90deg)' : 'none' }} />
                  </TD>
                </tr>

                {/* Expanded order rows for this customer */}
                {expanded === c._id && (
                  <tr style={{ borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
                    <td colSpan={6} style={{ padding: 0, background: 'rgba(250,246,240,0.6)' }}>
                      <div style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: 14 }}>
                          Orders by {c.username}
                        </p>
                        {c.orders.length === 0 ? (
                          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.87rem' }}>No orders placed yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {c.orders.map(o => (
                              <div key={o._id} style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(106,91,83,0.1)', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', padding: '12px 16px', fontSize: '0.85rem' }}>
                                  <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>#{o._id.slice(-8)}</span>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>{o.orderItems?.length} item{o.orderItems?.length !== 1 ? 's' : ''}</span>
                                  <StatusBadge status={o.status} />
                                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-burgundy)' }}>${o.totalAmount?.toFixed(2)}</span>
                                </div>
                                {/* Items mini-list */}
                                <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {o.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                      <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                                        <img src={item.imageUrl} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      </div>
                                      <span style={{ fontSize: '0.83rem', color: 'var(--color-text-primary)' }}>{item.name}</span>
                                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{item.size} × {item.quantity}</span>
                                      <span style={{ marginLeft: 'auto', fontSize: '0.83rem', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                {/* Shipping */}
                                <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(106,91,83,0.06)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                  📦 {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.postalCode}
                                </div>
                                {/* Timeline */}
                                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(106,91,83,0.06)' }}>
                                  <OrderTimeline status={o.status} statusHistory={o.statusHistory} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Products tab (with featured toggle) ─────────────────────────────────
const ProductsTab = ({ token }) => {
  const { toast } = useToast();
  const { data, loading, refetch } = useData(`${API}/products`, token);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState({});
  const [showAdd, setShowAdd]       = useState(false);
  const emptyNew = { name: '', description: '', price: '', imageUrl: '', category: 'Floral', stock: 50, notes: { top: '', middle: '', base: '' }, sizes: ['50ml','100ml'], featured: false };
  const [newP, setNewP] = useState(emptyNew);

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await apiFetch(`${API}/products/${id}`, token, { method: 'DELETE' }); toast.success(`${name} deleted.`); refetch(); }
    catch (e) { toast.error(e.message); }
  };

  const saveEdit = async (id) => {
    try { await apiFetch(`${API}/products/${id}`, token, { method: 'PUT', body: JSON.stringify(form) }); toast.success('Updated.'); setEditingId(null); refetch(); }
    catch (e) { toast.error(e.message); }
  };

  const toggleFeatured = async (p) => {
    try {
      await apiFetch(`${API}/products/${p._id}`, token, { method: 'PUT', body: JSON.stringify({ featured: !p.featured }) });
      toast.success(`${p.name} ${!p.featured ? 'marked as featured' : 'removed from featured'}.`);
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const addP = async (e) => {
    e.preventDefault();
    try { await apiFetch(`${API}/products`, token, { method: 'POST', body: JSON.stringify({ ...newP, price: Number(newP.price), stock: Number(newP.stock) }) }); toast.success('Product added.'); setShowAdd(false); setNewP(emptyNew); refetch(); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <SkeletonBlock height={300} borderRadius={16} />;
  const list = Array.isArray(data) ? data : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showAdd && (
        <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>New Product</h4>
          <form onSubmit={addP} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{l:'Name',k:'name',t:'text'},{l:'Price ($)',k:'price',t:'number'},{l:'Image URL',k:'imageUrl',t:'text'},{l:'Stock',k:'stock',t:'number'}].map(f => (
              <div key={f.k} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{f.l}</label>
                <input type={f.t} required className="form-input" value={newP[f.k]} onChange={e => setNewP(p => ({ ...p, [f.k]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea rows={2} className="form-input" value={newP.description} onChange={e => setNewP(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={newP.category} onChange={e => setNewP(p => ({ ...p, category: e.target.value }))}>
                {['Floral','Woody','Citrus','Amber','Fresh'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {['top','middle','base'].map(n => (
              <div key={n} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{n.charAt(0).toUpperCase()+n.slice(1)} Notes</label>
                <input type="text" className="form-input" value={newP.notes[n]} onChange={e => setNewP(p => ({ ...p, notes: { ...p.notes, [n]: e.target.value } }))} />
              </div>
            ))}
            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input type="checkbox" id="newFeatured" checked={newP.featured} onChange={e => setNewP(p => ({ ...p, featured: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <label htmlFor="newFeatured" className="form-label" style={{ marginBottom: 0 }}>Featured on Homepage</label>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, marginTop: 4 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ padding: '12px 20px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead><tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
              {['Image','Name','Category','Price','Stock','Featured','Rating','Actions'].map(h => <TH key={h}>{h}</TH>)}
            </tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                  <TD><div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary)' }}><img src={p.imageUrl} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div></TD>
                  <TD style={{ fontWeight: 600 }}>{editingId === p._id ? <input className="form-input" style={{ padding: '6px 10px' }} value={form.name ?? p.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /> : p.name}</TD>
                  <TD style={{ color: 'var(--color-text-secondary)' }}>{p.category}</TD>
                  <TD>{editingId === p._id ? <input type="number" className="form-input" style={{ padding: '6px 10px', width: 80 }} value={form.price ?? p.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} /> : `$${p.price.toFixed(2)}`}</TD>
                  <TD>{editingId === p._id ? <input type="number" className="form-input" style={{ padding: '6px 10px', width: 70 }} value={form.stock ?? p.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} /> : <span style={{ color: p.stock < 10 ? 'var(--color-error)' : 'inherit', fontWeight: p.stock < 10 ? 600 : 400 }}>{p.stock}</span>}</TD>
                  <TD>
                    {/* Featured toggle */}
                    <button
                      onClick={() => toggleFeatured(p)}
                      title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                      style={{ border: 'none', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: p.featured ? 'rgba(197,160,89,0.18)' : 'rgba(106,91,83,0.08)', color: p.featured ? 'var(--color-gold)' : 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Sparkles size={12} /> {p.featured ? 'Featured' : 'Set Featured'}
                    </button>
                  </TD>
                  <TD>{p.rating} ★</TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {editingId === p._id ? (
                        <>
                          <button className="btn btn-primary" onClick={() => saveEdit(p._id)} style={{ padding: '7px 14px', fontSize: '0.78rem' }}>Save</button>
                          <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '7px 12px', fontSize: '0.78rem' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(p._id); setForm({ name: p.name, price: p.price, stock: p.stock }); }} style={{ border: 'none', background: 'rgba(89,53,48,0.08)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }} title="Edit"><Edit2 size={14} color="var(--color-burgundy)" /></button>
                          <button onClick={() => del(p._id, p.name)} style={{ border: 'none', background: 'rgba(176,92,92,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }} title="Delete"><Trash2 size={14} color="var(--color-error)" /></button>
                        </>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Reviews tab ──────────────────────────────────────────────────────────
const ReviewsTab = ({ token }) => {
  const { toast } = useToast();
  const { data, loading, refetch } = useData(`${API}/reviews/admin/all`, token);
  const list = Array.isArray(data) ? data : [];

  const toggleApproval = async (id) => {
    try { await apiFetch(`${API}/reviews/admin/${id}/approve`, token, { method: 'PUT' }); toast.success('Updated.'); refetch(); }
    catch (e) { toast.error(e.message); }
  };
  const del = async (id) => {
    try { await apiFetch(`${API}/reviews/${id}`, token, { method: 'DELETE' }); toast.success('Review deleted.'); refetch(); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <SkeletonBlock height={200} borderRadius={16} />;

  return (
    <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead><tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
            {['User','Product','Rating','Comment','Status','Date','Actions'].map(h => <TH key={h}>{h}</TH>)}
          </tr></thead>
          <tbody>
            {list.length === 0
              ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No reviews yet.</td></tr>
              : list.map(r => (
              <tr key={r._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                <TD style={{ fontWeight: 500 }}>{r.user?.username}</TD>
                <TD style={{ color: 'var(--color-text-secondary)' }}>{r.product?.name}</TD>
                <TD>{'★'.repeat(r.rating)}</TD>
                <TD style={{ maxWidth: 200, color: 'var(--color-text-secondary)' }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.comment}</span></TD>
                <TD>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 600, background: r.isApproved ? 'rgba(110,138,115,0.15)' : 'rgba(176,92,92,0.12)', color: r.isApproved ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {r.isApproved ? <CheckCircle size={12} /> : <XCircle size={12} />}{r.isApproved ? 'Approved' : 'Hidden'}
                  </span>
                </TD>
                <TD style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString()}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggleApproval(r._id)} style={{ border: 'none', background: r.isApproved ? 'rgba(176,92,92,0.1)' : 'rgba(110,138,115,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 10px', fontSize: '0.75rem', fontWeight: 600, color: r.isApproved ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {r.isApproved ? 'Hide' : 'Approve'}
                    </button>
                    <button onClick={() => del(r._id)} style={{ border: 'none', background: 'rgba(176,92,92,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Trash2 size={14} color="var(--color-error)" /></button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Coupons tab ──────────────────────────────────────────────────────────
const CouponsTab = ({ token }) => {
  const { toast } = useToast();
  const { data, loading, refetch } = useData(`${API}/coupons`, token);
  const emptyForm = { code: '', discountType: 'percentage', discountValue: '', minPurchase: 0, maxUses: '', expiresAt: '', isActive: true };
  const [form, setForm]       = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]   = useState(null);
  const list = Array.isArray(data) ? data : [];

  const submit = async (e) => {
    e.preventDefault();
    const url    = editId ? `${API}/coupons/${editId}` : `${API}/coupons`;
    const method = editId ? 'PUT' : 'POST';
    try {
      await apiFetch(url, token, { method, body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), minPurchase: Number(form.minPurchase), maxUses: form.maxUses ? Number(form.maxUses) : null }) });
      toast.success(editId ? 'Coupon updated.' : 'Coupon created.');
      setShowForm(false); setEditId(null); setForm(emptyForm); refetch();
    } catch (e) { toast.error(e.message); }
  };

  const del = async (id, code) => {
    if (!window.confirm(`Delete ${code}?`)) return;
    try { await apiFetch(`${API}/coupons/${id}`, token, { method: 'DELETE' }); toast.success(`${code} deleted.`); refetch(); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <SkeletonBlock height={200} borderRadius={16} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px' }}>
          <Plus size={16} /> New Coupon
        </button>
      </div>
      {showForm && (
        <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>{editId ? 'Edit' : 'Create'} Coupon</h4>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{l:'Code',k:'code',t:'text'},{l:'Discount Value',k:'discountValue',t:'number'},{l:'Min Purchase ($)',k:'minPurchase',t:'number'},{l:'Max Uses',k:'maxUses',t:'number'},{l:'Expires At',k:'expiresAt',t:'date'}].map(f => (
              <div key={f.k} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{f.l}</label>
                <input type={f.t} className="form-input" value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} required={f.k !== 'maxUses'} />
              </div>
            ))}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Type</label>
              <select className="form-input" value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input type="checkbox" id="ca" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <label htmlFor="ca" className="form-label" style={{ marginBottom: 0 }}>Active</label>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>{editId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} style={{ padding: '12px 20px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead><tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
              {['Code','Type','Value','Min','Used/Max','Expires','Active',''].map((h,i) => <TH key={i}>{h}</TH>)}
            </tr></thead>
            <tbody>
              {list.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                  <TD style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-burgundy)' }}>{c.code}</TD>
                  <TD style={{ textTransform: 'capitalize' }}>{c.discountType}</TD>
                  <TD style={{ fontWeight: 600 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</TD>
                  <TD>${c.minPurchase}</TD>
                  <TD>{c.usedCount}/{c.maxUses ?? '∞'}</TD>
                  <TD style={{ color: new Date(c.expiresAt) < new Date() ? 'var(--color-error)' : 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{new Date(c.expiresAt).toLocaleDateString()}</TD>
                  <TD><span style={{ color: c.isActive ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>{c.isActive ? '✓' : '✗'}</span></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditId(c._id); setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minPurchase: c.minPurchase, maxUses: c.maxUses ?? '', expiresAt: c.expiresAt?.slice(0,10), isActive: c.isActive }); setShowForm(true); }} style={{ border: 'none', background: 'rgba(89,53,48,0.08)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Edit2 size={14} color="var(--color-burgundy)" /></button>
                      <button onClick={() => del(c._id, c.code)} style={{ border: 'none', background: 'rgba(176,92,92,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Trash2 size={14} color="var(--color-error)" /></button>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminDashboard component ─────────────────────────────────────────
const TABS = [
  { key: 'analytics', label: 'Analytics', icon: BarChart2 },
  { key: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'products',  label: 'Products',  icon: Package },
  { key: 'reviews',   label: 'Reviews',   icon: Star },
  { key: 'coupons',   label: 'Coupons',   icon: Tag },
  { key: 'settings',  label: 'Settings',  icon: Settings },
];

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('analytics');

  useEffect(() => {
    // Wait until AuthContext has finished restoring the session from
    // localStorage before deciding whether to kick the user out. Without
    // this check, `user` is briefly null on the very first render (even
    // for a logged-in admin), which was causing an immediate redirect to
    // "/" on page refresh or when navigating to /admin directly.
    if (loading) return;
    if (!user || user.role !== 'admin') navigate('/');
  }, [user, loading, navigate]);

  // Still restoring session from localStorage — show a lightweight loading
  // state instead of bouncing the user out prematurely.
  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 80, minHeight: '80vh', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--color-rose-medium)', borderTopColor: 'var(--color-burgundy)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }} />
        <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="container animate-fade" style={{ paddingTop: 50, minHeight: '80vh', paddingBottom: 60 }}>
      <div style={{ marginBottom: 40 }}>
        <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
          Control Center
        </span>
        <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 8 }}>Admin Dashboard</h2>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 6, borderRadius: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600, background: tab === key ? 'white' : 'transparent', color: tab === key ? 'var(--color-burgundy)' : 'var(--color-text-muted)', boxShadow: tab === key ? '0 2px 8px rgba(44,34,30,0.08)' : 'none', transition: 'all 0.2s ease' }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Tab content — each tab manages its own data independently */}
      {tab === 'analytics' && <AnalyticsTab token={user.token} />}
      {tab === 'orders'    && <OrdersTab    token={user.token} />}
      {tab === 'customers' && <CustomersTab token={user.token} />}
      {tab === 'products'  && <ProductsTab  token={user.token} />}
      {tab === 'reviews'   && <ReviewsTab   token={user.token} />}
      {tab === 'coupons'   && <CouponsTab   token={user.token} />}
      {tab === 'settings'  && <SiteSettingsTab token={user.token} />}
    </div>
  );
};

// ─── Site Settings tab ──────────────────────────────────────────────────
const SiteSettingsTab = ({ token }) => {
  const { toast } = useToast();

  // ── Announcement state ──────────────────────────────────────────────
  const [ann, setAnn]         = useState({ enabled: false, text: '', bgColor: '#593530', textColor: '#FFFFFF', link: '', linkLabel: 'Shop Now' });
  const [annSaving, setAnnSaving] = useState(false);

  // ── Hero state ──────────────────────────────────────────────────────
  const [hero, setHero]       = useState({ badge: 'Luxury Collection', headline: 'Elegance', subheadline: 'in Bloom', description: 'Experience timeless luxury perfumes crafted with passion and elegance, designed to leave a lasting impression.', ctaLabel: 'Explore Collection', videoUrl: '', videoPlatform: 'youtube', heroProductName: '' });
  const [heroSaving, setHeroSaving] = useState(false);
  const [products, setProducts] = useState([]);

  // ── Testimonials state ────────────────────────────────────────────────
  const [testimonials, setTestimonials] = useState([]);
  const [testSaving, setTestSaving]     = useState(false);
  const [editingIdx, setEditingIdx]     = useState(null);
  const [editForm, setEditForm]         = useState({ quote: '', author: '', role: 'Verified Customer', rating: 5 });
  const [showAddForm, setShowAddForm]   = useState(false);
  const [addForm, setAddForm]           = useState({ quote: '', author: '', role: 'Verified Customer', rating: 5 });

  // Fetch everything on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/site-config')
      .then(r => r.json())
      .then(data => {
        if (data?.announcement) setAnn(data.announcement);
        if (data?.hero)         setHero(h => ({ ...h, ...data.hero }));
        if (data?.testimonials?.length) setTestimonials(data.testimonials);
      })
      .catch(() => toast.error('Failed to load site config.'));

    // Also fetch products list for the hero product selector
    fetch('http://localhost:5000/api/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []); // eslint-disable-line

  // ── Save helpers ────────────────────────────────────────────────────
  const saveAnnouncement = async () => {
    setAnnSaving(true);
    try { await apiFetch(`${API}/site-config/announcement`, token, { method: 'PUT', body: JSON.stringify(ann) }); toast.success('Announcement saved.'); }
    catch (e) { toast.error(e.message); }
    finally { setAnnSaving(false); }
  };

  const saveHero = async () => {
    setHeroSaving(true);
    try { await apiFetch(`${API}/site-config/hero`, token, { method: 'PUT', body: JSON.stringify(hero) }); toast.success('Hero content saved.'); }
    catch (e) { toast.error(e.message); }
    finally { setHeroSaving(false); }
  };

  const saveTestimonials = async (list) => {
    setTestSaving(true);
    try { await apiFetch(`${API}/site-config/testimonials`, token, { method: 'PUT', body: JSON.stringify({ testimonials: list }) }); toast.success('Testimonials saved.'); }
    catch (e) { toast.error(e.message); }
    finally { setTestSaving(false); }
  };

  const startEdit = (idx)  => { setEditingIdx(idx); setEditForm({ ...testimonials[idx] }); };
  const saveEdit  = async () => {
    const updated = testimonials.map((t, i) => i === editingIdx ? { ...editForm } : t);
    setTestimonials(updated); setEditingIdx(null); await saveTestimonials(updated);
  };
  const deleteTestimonial = async (idx) => {
    const updated = testimonials.filter((_, i) => i !== idx);
    setTestimonials(updated); await saveTestimonials(updated);
  };
  const addTestimonial = async () => {
    if (!addForm.quote.trim() || !addForm.author.trim()) { toast.warning('Quote and author are required.'); return; }
    const updated = [...testimonials, { ...addForm }];
    setTestimonials(updated); setShowAddForm(false);
    setAddForm({ quote: '', author: '', role: 'Verified Customer', rating: 5 });
    await saveTestimonials(updated);
  };

  // Shared input style
  const fi = { marginBottom: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* ── Hero Content ──────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Hero Section</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Controls the homepage headline, description, CTA button and story video.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={fi}>
            <label className="form-label">Badge Text</label>
            <input type="text" className="form-input" value={hero.badge} onChange={e => setHero(h => ({ ...h, badge: e.target.value }))} placeholder="Luxury Collection" />
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">CTA Button Label</label>
            <input type="text" className="form-input" value={hero.ctaLabel} onChange={e => setHero(h => ({ ...h, ctaLabel: e.target.value }))} placeholder="Explore Collection" />
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Headline (line 1)</label>
            <input type="text" className="form-input" value={hero.headline} onChange={e => setHero(h => ({ ...h, headline: e.target.value }))} placeholder="Elegance" />
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Sub-headline (line 2, italic)</label>
            <input type="text" className="form-input" value={hero.subheadline} onChange={e => setHero(h => ({ ...h, subheadline: e.target.value }))} placeholder="in Bloom" />
          </div>
          <div className="form-group" style={{ ...fi, gridColumn: '1/-1' }}>
            <label className="form-label">Hero Description</label>
            <textarea rows={3} className="form-input" value={hero.description} onChange={e => setHero(h => ({ ...h, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          {/* Hero product selector — visual card grid */}
          <div className="form-group" style={{ ...fi, gridColumn: '1/-1' }}>
            <label className="form-label">Hero Product (shown in right panel)</label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginTop: 10 }}>

              {/* "Auto" option */}
              <div
                onClick={() => setHero(h => ({ ...h, heroProductName: '' }))}
                style={{
                  borderRadius: 12,
                  border: hero.heroProductName === '' ? '2px solid var(--color-burgundy)' : '2px solid rgba(106,91,83,0.15)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: hero.heroProductName === '' ? 'rgba(89,53,48,0.06)' : 'white',
                  transition: 'border-color 0.2s, background 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '18px 10px',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✨</div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: hero.heroProductName === '' ? 'var(--color-burgundy)' : 'var(--color-text-secondary)', lineHeight: 1.3 }}>Auto</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>Floral Musk or first product</span>
                {hero.heroProductName === '' && (
                  <span style={{ fontSize: '0.7rem', background: 'var(--color-burgundy)', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Selected</span>
                )}
              </div>

              {/* One card per product */}
              {products.map(p => {
                const selected = hero.heroProductName === p.name;
                return (
                  <div
                    key={p._id}
                    onClick={() => setHero(h => ({ ...h, heroProductName: p.name }))}
                    style={{
                      borderRadius: 12,
                      border: selected ? '2px solid var(--color-burgundy)' : '2px solid rgba(106,91,83,0.15)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      background: selected ? 'rgba(89,53,48,0.04)' : 'white',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: selected ? '0 0 0 3px rgba(89,53,48,0.12)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Product image */}
                    <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {selected && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(89,53,48,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ background: 'var(--color-burgundy)', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>✓</span>
                        </div>
                      )}
                    </div>
                    {/* Name + category */}
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: selected ? 'var(--color-burgundy)' : 'var(--color-text-primary)', lineHeight: 1.3, marginBottom: 2 }}>{p.name}</p>
                      <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{p.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Story video */}
          <div className="form-group" style={fi}>
            <label className="form-label">Story Video Platform</label>
            <select className="form-input" value={hero.videoPlatform} onChange={e => setHero(h => ({ ...h, videoPlatform: e.target.value }))}>
              <option value="youtube">YouTube (paste watch URL)</option>
              <option value="vimeo">Vimeo (paste vimeo.com URL)</option>
              <option value="direct">Direct URL (mp4 / webm link)</option>
            </select>
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Story Video URL</label>
            <input type="text" className="form-input" value={hero.videoUrl} onChange={e => setHero(h => ({ ...h, videoUrl: e.target.value }))}
              placeholder={hero.videoPlatform === 'youtube' ? 'https://youtube.com/watch?v=...' : hero.videoPlatform === 'vimeo' ? 'https://vimeo.com/...' : 'https://example.com/video.mp4'} />
          </div>

          {/* Live video preview label */}
          {hero.videoUrl && (
            <div style={{ gridColumn: '1/-1', padding: '10px 14px', borderRadius: 8, background: 'rgba(110,138,115,0.1)', border: '1px solid var(--color-success)', fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 500 }}>
              ✓ Video URL is set — "Watch Story" button will open a modal player.
            </div>
          )}
        </div>

        <button onClick={saveHero} disabled={heroSaving} className="btn btn-primary" style={{ marginTop: 24, padding: '12px 32px' }}>
          {heroSaving ? 'Saving...' : 'Save Hero Content'}
        </button>
      </div>

      {/* ── Announcement Bar ──────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Announcement Bar</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Dismissable banner at the top of every page.</p>
          </div>
          <button onClick={() => setAnn(a => ({ ...a, enabled: !a.enabled }))}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 30, border: 'none', cursor: 'pointer', background: ann.enabled ? 'rgba(110,138,115,0.15)' : 'rgba(176,92,92,0.1)', color: ann.enabled ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span style={{ width: 36, height: 20, borderRadius: 10, background: ann.enabled ? 'var(--color-success)' : 'rgba(176,92,92,0.4)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 3, left: ann.enabled ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </span>
            {ann.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {ann.text && (
          <div style={{ marginBottom: 20, padding: '10px 20px', borderRadius: 8, background: ann.bgColor, color: ann.textColor, fontSize: '0.84rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {ann.text}{ann.link && <span style={{ fontWeight: 700, borderBottom: `1px solid ${ann.textColor}` }}> {ann.linkLabel} →</span>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ ...fi, gridColumn: '1/-1' }}>
            <label className="form-label">Announcement Text</label>
            <input type="text" className="form-input" value={ann.text} onChange={e => setAnn(a => ({ ...a, text: e.target.value }))} placeholder="🌸 Free shipping on orders over $99!" />
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Link URL (optional)</label>
            <input type="text" className="form-input" value={ann.link} onChange={e => setAnn(a => ({ ...a, link: e.target.value }))} placeholder="/shop or https://..." />
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Link Label</label>
            <input type="text" className="form-input" value={ann.linkLabel} onChange={e => setAnn(a => ({ ...a, linkLabel: e.target.value }))} placeholder="Shop Now" />
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Background Colour</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={ann.bgColor} onChange={e => setAnn(a => ({ ...a, bgColor: e.target.value }))} style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid rgba(106,91,83,0.2)', cursor: 'pointer', padding: 2 }} />
              <input type="text" className="form-input" value={ann.bgColor} onChange={e => setAnn(a => ({ ...a, bgColor: e.target.value }))} style={{ flex: 1 }} />
            </div>
          </div>
          <div className="form-group" style={fi}>
            <label className="form-label">Text Colour</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={ann.textColor} onChange={e => setAnn(a => ({ ...a, textColor: e.target.value }))} style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid rgba(106,91,83,0.2)', cursor: 'pointer', padding: 2 }} />
              <input type="text" className="form-input" value={ann.textColor} onChange={e => setAnn(a => ({ ...a, textColor: e.target.value }))} style={{ flex: 1 }} />
            </div>
          </div>
        </div>

        <button onClick={saveAnnouncement} disabled={annSaving} className="btn btn-primary" style={{ marginTop: 24, padding: '12px 32px' }}>
          {annSaving ? 'Saving...' : 'Save Announcement'}
        </button>
      </div>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Customer Testimonials</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>Rotate automatically every 7 seconds on the homepage.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
            <Plus size={15} /> Add Testimonial
          </button>
        </div>

        {showAddForm && (
          <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 12, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1rem' }}>New Testimonial</h4>
            <div className="form-group" style={fi}>
              <label className="form-label">Quote</label>
              <textarea rows={3} className="form-input" value={addForm.quote} onChange={e => setAddForm(f => ({ ...f, quote: e.target.value }))} placeholder="What the customer said..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
              <div className="form-group" style={fi}><label className="form-label">Author</label><input type="text" className="form-input" value={addForm.author} onChange={e => setAddForm(f => ({ ...f, author: e.target.value }))} placeholder="Jane D." /></div>
              <div className="form-group" style={fi}><label className="form-label">Role</label><input type="text" className="form-input" value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))} placeholder="Verified Customer" /></div>
              <div className="form-group" style={fi}><label className="form-label">Stars</label><select className="form-input" value={addForm.rating} onChange={e => setAddForm(f => ({ ...f, rating: Number(e.target.value) }))}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={addTestimonial} disabled={testSaving} style={{ padding: '10px 22px' }}>{testSaving ? 'Saving...' : 'Add'}</button>
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ padding: '10px 18px' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {testimonials.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No testimonials yet.</p>}
          {testimonials.map((t, idx) => (
            <div key={idx} style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(106,91,83,0.08)' }}>
              {editingIdx === idx ? (
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group" style={fi}><label className="form-label">Quote</label><textarea rows={3} className="form-input" value={editForm.quote} onChange={e => setEditForm(f => ({ ...f, quote: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
                    <div className="form-group" style={fi}><label className="form-label">Author</label><input type="text" className="form-input" value={editForm.author} onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))} /></div>
                    <div className="form-group" style={fi}><label className="form-label">Role</label><input type="text" className="form-input" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} /></div>
                    <div className="form-group" style={fi}><label className="form-label">Stars</label><select className="form-input" value={editForm.rating} onChange={e => setEditForm(f => ({ ...f, rating: Number(e.target.value) }))}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={testSaving} style={{ padding: '9px 22px' }}>{testSaving ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-secondary" onClick={() => setEditingIdx(null)} style={{ padding: '9px 18px' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={i < t.rating ? 'var(--color-gold)' : 'none'} stroke={i < t.rating ? 'none' : 'var(--color-text-muted)'} />)}
                    </div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-burgundy)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 8 }}>"{t.quote}"</p>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t.author} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>— {t.role}</span></p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => startEdit(idx)} style={{ border: 'none', background: 'rgba(89,53,48,0.08)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Edit2 size={14} color="var(--color-burgundy)" /></button>
                    <button onClick={() => deleteTestimonial(idx)} style={{ border: 'none', background: 'rgba(176,92,92,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Trash2 size={14} color="var(--color-error)" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;