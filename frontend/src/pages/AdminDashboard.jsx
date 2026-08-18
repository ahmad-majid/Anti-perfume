import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingBag, Star, Trash2, Edit2, Plus, X,
  ChevronRight, Settings, Flame, Video, Image, Upload,
  CheckCircle, XCircle, Clock, Building, ExternalLink, RefreshCw
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonBlock } from '../components/Skeleton';

const API = '/api';

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

function useData(url, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url || !token) return;
    let cancelled = false;
    setLoading(true);
    apiFetch(url, token)
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url, token, tick]);

  const refetch = () => setTick((t) => t + 1);
  return { data, loading, error, refetch };
}

// ─── File Upload Helper ──────────────────────────────────────────────────────
const FileUploadField = ({ label, currentUrl, onUploaded, accept = 'image/*' }) => {
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState(currentUrl || '');
  const { toast } = useToast();

  useEffect(() => {
    setManualUrl(currentUrl || '');
  }, [currentUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setManualUrl(data.url);
        onUploaded(data.url);
        toast.success('File uploaded successfully.');
      } else {
        toast.error(data.message || 'Upload failed.');
      }
    } catch {
      toast.error('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Paste image/video URL or click Upload"
          value={manualUrl}
          onChange={(e) => {
            setManualUrl(e.target.value);
            onUploaded(e.target.value);
          }}
          style={{ flex: 1 }}
        />
        <label
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 8,
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(106,91,83,0.2)',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--color-burgundy)', whiteSpace: 'nowrap',
          }}
        >
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept={accept} onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>
      {manualUrl && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={manualUrl} alt="Preview" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} onError={(e) => (e.target.style.display = 'none')} />
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{manualUrl}</span>
        </div>
      )}
    </div>
  );
};

// ─── Shared UI Helpers ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Pending Confirmation': { bg: 'rgba(197,160,89,0.15)', color: '#A07828' },
    'Pending Verification': { bg: 'rgba(197,160,89,0.25)', color: '#A07828' },
    Approved:              { bg: 'rgba(110,138,115,0.2)', color: 'var(--color-success)' },
    Confirmed:             { bg: 'rgba(110,138,115,0.2)', color: 'var(--color-success)' },
    Processing:            { bg: 'rgba(89,53,48,0.12)', color: 'var(--color-burgundy)' },
    Shipped:               { bg: 'rgba(89,53,48,0.12)', color: 'var(--color-burgundy)' },
    'Out for Delivery':    { bg: 'rgba(166,110,99,0.2)', color: 'var(--color-rose-dark)' },
    Delivered:             { bg: 'rgba(110,138,115,0.2)', color: 'var(--color-success)' },
    Cancelled:             { bg: 'rgba(176,92,92,0.2)', color: 'var(--color-error)' },
    Rejected:              { bg: 'rgba(176,92,92,0.2)', color: 'var(--color-error)' },
  };
  const s = map[status] || { bg: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' };
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const TH = ({ children }) => (
  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
    {children}
  </th>
);
const TD = ({ children, style }) => <td style={{ padding: '12px 16px', ...style }}>{children}</td>;

// ─── Order Inspection & Payment Verification Modal ───────────────────────────
const OrderModal = ({ order, token, onClose, onSaved }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'Pending Verification');
  const [saving, setSaving] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleUpdatePaymentStatus = async (newPayStatus) => {
    setProcessingPayment(true);
    try {
      await apiFetch(`${API}/orders/${order._id}/payment-status`, token, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus: newPayStatus }),
      });
      setPaymentStatus(newPayStatus);
      if (newPayStatus === 'Approved') {
        setStatus('Confirmed');
        toast.success(`Payment verified & marked as Approved! Order Confirmed.`);
      } else if (newPayStatus === 'Rejected') {
        setStatus('Cancelled');
        toast.error(`Payment marked as Rejected. Order Cancelled.`);
      } else {
        toast.info(`Payment status updated to ${newPayStatus}.`);
      }
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const saveOrderStatus = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/orders/${order._id}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      toast.success('Order lifecycle status updated.');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,34,30,0.65)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(106,91,83,0.1)' }}>
          <div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Order & Payment Verification</p>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-burgundy)', marginTop: 2 }}>Order #{order._id.slice(-8)}</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}><X size={22} /></button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Customer & Payment Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 12 }}>
              <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>Customer Details</p>
              <p style={{ fontWeight: 600 }}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName || order.user?.username}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{order.contactInfo?.emailOrPhone || order.user?.email}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>📞 {order.shippingAddress?.phone || '—'}</p>
            </div>
            <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 12 }}>
              <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>Payment Method</p>
              <p style={{ fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '1.05rem' }}>{order.paymentMethod}</p>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Status:</span>
                <StatusBadge status={paymentStatus} />
              </div>
            </div>
          </div>

          {/* Dedicated Payment Verification Section */}
          <div style={{ background: 'rgba(197,160,89,0.08)', padding: 20, borderRadius: 16, border: '1.5px solid rgba(197,160,89,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={18} /> Admin Payment Verification Control
              </h4>
              <StatusBadge status={paymentStatus} />
            </div>

            {/* Quick Status Selector Buttons */}
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 600 }}>Select Payment Verification Status:</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { key: 'Approved', label: '✓ Approved (Payment Verified)', color: 'var(--color-success)', bg: 'rgba(110,138,115,0.15)' },
                { key: 'Pending Verification', label: '⏳ Pending Verification', color: '#A07828', bg: 'rgba(197,160,89,0.15)' },
                { key: 'Rejected', label: '✕ Rejected (Declined)', color: 'var(--color-error)', bg: 'rgba(176,92,92,0.15)' },
              ].map((ps) => (
                <button
                  key={ps.key}
                  disabled={processingPayment}
                  onClick={() => handleUpdatePaymentStatus(ps.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: paymentStatus === ps.key ? `2px solid ${ps.color}` : '1px solid rgba(106,91,83,0.2)',
                    background: paymentStatus === ps.key ? ps.bg : 'white',
                    color: ps.color,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: paymentStatus === ps.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ps.label}
                </button>
              ))}
            </div>

            {/* Transaction ID & Screenshot Details */}
            {order.paymentProof?.transactionId && (
              <div style={{ background: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', marginBottom: 12 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Transaction ID / Ref: </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '0.92rem' }}>{order.paymentProof.transactionId}</span>
              </div>
            )}

            {order.paymentProof?.screenshotUrl ? (
              <div style={{ background: 'white', padding: 14, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Payment Receipt Screenshot:</span>
                  <a href={order.paymentProof.screenshotUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--color-burgundy)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Open Full Image <ExternalLink size={12} />
                  </a>
                </div>
                <a href={order.paymentProof.screenshotUrl} target="_blank" rel="noreferrer">
                  <img src={order.paymentProof.screenshotUrl} alt="Bank Receipt" style={{ width: '100%', maxHeight: 240, borderRadius: 8, objectFit: 'contain', background: '#F9F6F0', border: '1px solid rgba(0,0,0,0.08)' }} />
                </a>
              </div>
            ) : order.paymentMethod === 'Bank Transfer' ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', background: 'white', padding: '10px 14px', borderRadius: 8 }}>
                No screenshot uploaded. Customer may have shared proof directly on WhatsApp (0314-1774008).
              </p>
            ) : null}
          </div>

          {/* Order Lifecycle Status */}
          <div>
            <p style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 10 }}>Order Lifecycle Status</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: '8px 16px', borderRadius: 20,
                    border: status === s ? 'none' : '1px solid rgba(106,91,83,0.2)',
                    background: status === s ? 'var(--color-burgundy)' : 'transparent',
                    color: status === s ? 'white' : 'var(--color-text-primary)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Order Items list */}
          <div>
            <p style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 10 }}>Order Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.orderItems?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{item.size || '100ml'} × {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>Rs. {Math.round(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '12px 18px', borderRadius: 12 }}>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>Delivery Destination</p>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)' }}>
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(106,91,83,0.1)', paddingTop: 14 }}>
            <span style={{ fontWeight: 600 }}>Total Order Amount</span>
            <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--color-burgundy)' }}>Rs. {Math.round(order.totalAmount || 0).toLocaleString()}</span>
          </div>

          <button onClick={saveOrderStatus} disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: 14 }}>
            {saving ? 'Saving...' : 'Save Lifecycle Status & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 1. Orders Tab ───────────────────────────────────────────────────────────
const OrdersTab = ({ token }) => {
  const { data, loading, refetch } = useData(`${API}/orders`, token);
  const [selected, setSelected] = useState(null);
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const { toast } = useToast();
  const list = Array.isArray(data) ? data : [];

  const handleQuickPaymentStatus = async (e, orderId, paymentStatus) => {
    e.stopPropagation();
    try {
      await apiFetch(`${API}/orders/${orderId}/payment-status`, token, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus }),
      });
      toast.success(`Order payment marked as ${paymentStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredList = list.filter((o) => {
    const matchMethod = filterMethod === 'All' ? true : o.paymentMethod === filterMethod;
    const matchPay = filterPayment === 'All' ? true : (o.paymentStatus || 'Pending Verification') === filterPayment;
    return matchMethod && matchPay;
  });

  if (loading) return <SkeletonBlock height={300} borderRadius={16} />;

  return (
    <>
      {selected && <OrderModal order={selected} token={token} onClose={() => setSelected(null)} onSaved={refetch} />}
      <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(106,91,83,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '0.9rem' }}>{filteredList.length} orders</span>
            <span style={{ color: 'rgba(0,0,0,0.2)' }}>|</span>
            {['All', 'Bank Transfer', 'Cash on Delivery (COD)'].map((m) => (
              <button key={m} onClick={() => setFilterMethod(m)} style={{ padding: '5px 12px', borderRadius: 16, border: filterMethod === m ? 'none' : '1px solid rgba(106,91,83,0.15)', background: filterMethod === m ? 'var(--color-burgundy)' : 'transparent', color: filterMethod === m ? 'white' : 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                {m}
              </button>
            ))}
            <span style={{ color: 'rgba(0,0,0,0.2)' }}>|</span>
            {['All', 'Pending Verification', 'Approved', 'Rejected'].map((p) => (
              <button key={p} onClick={() => setFilterPayment(p)} style={{ padding: '5px 12px', borderRadius: 16, border: filterPayment === p ? 'none' : '1px solid rgba(106,91,83,0.15)', background: filterPayment === p ? 'var(--color-gold)' : 'transparent', color: filterPayment === p ? 'white' : 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={refetch} style={{ border: '1px solid rgba(106,91,83,0.2)', background: 'white', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-burgundy)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
                {['Order ID', 'Customer', 'Payment Method', 'Payment Verification', 'Total', 'Order Status', 'Date', 'Actions'].map((h, i) => <TH key={i}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No matching orders found.</td></tr>
              ) : (
                filteredList.map((o) => (
                  <tr key={o._id} onClick={() => setSelected(o)} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <TD style={{ fontFamily: 'monospace', fontSize: '0.79rem', fontWeight: 700 }}>#{o._id.slice(-8)}</TD>
                    <TD>
                      <span style={{ fontWeight: 600 }}>{o.shippingAddress?.firstName} {o.shippingAddress?.lastName || o.user?.username}</span>
                      <br />
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{o.contactInfo?.emailOrPhone || o.user?.email}</span>
                    </TD>
                    <TD><span style={{ fontWeight: 600, color: o.paymentMethod === 'Bank Transfer' ? 'var(--color-burgundy)' : 'inherit' }}>{o.paymentMethod}</span></TD>
                    <TD>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.paymentStatus || 'Pending Verification'}
                          onChange={(e) => handleQuickPaymentStatus(e, o._id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 14,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            border: '1px solid rgba(106,91,83,0.2)',
                            background: o.paymentStatus === 'Approved' ? 'rgba(110,138,115,0.15)' : o.paymentStatus === 'Rejected' ? 'rgba(176,92,92,0.15)' : 'rgba(197,160,89,0.18)',
                            color: o.paymentStatus === 'Approved' ? 'var(--color-success)' : o.paymentStatus === 'Rejected' ? 'var(--color-error)' : '#A07828',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="Pending Verification">⏳ Pending</option>
                          <option value="Approved">✓ Approved</option>
                          <option value="Rejected">✕ Rejected</option>
                        </select>
                      </div>
                    </TD>
                    <TD style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>Rs. {Math.round(o.totalAmount || 0).toLocaleString()}</TD>
                    <TD><StatusBadge status={o.status} /></TD>
                    <TD style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{new Date(o.createdAt).toLocaleDateString()}</TD>
                    <TD>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                        style={{ border: '1px solid var(--color-burgundy)', background: 'transparent', color: 'var(--color-burgundy)', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Inspect
                      </button>
                    </TD>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ─── 2. Sales Tab ────────────────────────────────────────────────────────────
const SalesTab = ({ token }) => {
  const { toast } = useToast();
  const { data, loading, refetch } = useData(`${API}/sales`, token);
  const emptySale = { name: '', slug: '', badgeText: '', description: '', discountPercent: 0, bannerImage: '', isActive: true, showOnNavbar: true };
  const [form, setForm] = useState(emptySale);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const list = Array.isArray(data) ? data : [];

  const submit = async (e) => {
    e.preventDefault();
    const url = editId ? `${API}/sales/${editId}` : `${API}/sales`;
    const method = editId ? 'PUT' : 'POST';
    try {
      await apiFetch(url, token, { method, body: JSON.stringify(form) });
      toast.success(editId ? 'Sale campaign updated.' : 'Sale campaign created.');
      setShowForm(false); setEditId(null); setForm(emptySale); refetch();
    } catch (e) { toast.error(e.message); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete sale "${name}"? Associated products will be unlinked safely.`)) return;
    try {
      await apiFetch(`${API}/sales/${id}`, token, { method: 'DELETE' });
      toast.success(`${name} removed.`); refetch();
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <SkeletonBlock height={200} borderRadius={16} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Sales & Campaigns</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Create special sale events (e.g. Azadi Sale) and assign perfumes. Disabling a sale resets all product assignments automatically.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptySale); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
          <Plus size={16} /> New Sale Campaign
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>
            {editId ? 'Edit Sale Campaign' : 'Create New Sale Campaign'}
          </h4>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sale Name</label>
              <input type="text" required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Azadi Sale" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Badge Text</label>
              <input type="text" className="form-input" value={form.badgeText} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} placeholder="e.g. Azadi Sale 🔥" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Discount Percentage (%)</label>
              <input type="number" className="form-input" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} placeholder="15" />
            </div>
            <FileUploadField label="Banner Image (Upload or URL)" currentUrl={form.bannerImage} onUploaded={(url) => setForm((p) => ({ ...p, bannerImage: url }))} />
            <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <textarea rows={2} className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Special promo description..." />
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', paddingTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.86rem' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ width: 16, height: 16 }} />
                Active Campaign
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.86rem' }}>
                <input type="checkbox" checked={form.showOnNavbar} onChange={(e) => setForm({ ...form, showOnNavbar: e.target.checked })} style={{ width: 16, height: 16 }} />
                Show Button on Navbar
              </label>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>{editId ? 'Update Sale' : 'Create Sale'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ padding: '10px 18px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
                {['Campaign Name', 'Slug', 'Discount', 'Status', 'Navbar Button', 'Actions'].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No sales campaigns yet. Create your first one!</td></tr>
              ) : (
                list.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                    <TD style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>{s.name}</TD>
                    <TD style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>/sale/{s.slug}</TD>
                    <TD style={{ fontWeight: 600 }}>{s.discountPercent ? `${s.discountPercent}% OFF` : '—'}</TD>
                    <TD><span style={{ color: s.isActive ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>{s.isActive ? 'Active' : 'Disabled'}</span></TD>
                    <TD><span style={{ color: s.showOnNavbar ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>{s.showOnNavbar ? '✓ Shown' : 'Hidden'}</span></TD>
                    <TD>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditId(s._id); setForm(s); setShowForm(true); }} style={{ border: 'none', background: 'rgba(89,53,48,0.08)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Edit2 size={14} color="var(--color-burgundy)" /></button>
                        <button onClick={() => del(s._id, s.name)} style={{ border: 'none', background: 'rgba(176,92,92,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}><Trash2 size={14} color="var(--color-error)" /></button>
                      </div>
                    </TD>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── 3. Products Tab ─────────────────────────────────────────────────────────
const ProductsTab = ({ token }) => {
  const { toast } = useToast();
  const { data, loading, refetch } = useData(`${API}/products`, token);
  const { data: salesData } = useData(`${API}/sales`, token);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  const emptyNew = { name: '', description: '', price: '', originalPrice: '', imageUrl: '', hoverImageUrl: '', category: 'Floral', saleId: '', stock: 50, notes: { top: '', middle: '', base: '' }, sizes: ['50ml', '100ml'], featured: false };
  const [newP, setNewP] = useState(emptyNew);
  const salesList = Array.isArray(salesData) ? salesData : [];

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await apiFetch(`${API}/products/${id}`, token, { method: 'DELETE' });
      toast.success(`${name} deleted.`); refetch();
    } catch (e) { toast.error(e.message); }
  };

  const addP = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`${API}/products`, token, {
        method: 'POST',
        body: JSON.stringify({ ...newP, price: Number(newP.price), originalPrice: newP.originalPrice ? Number(newP.originalPrice) : null, stock: Number(newP.stock), saleId: newP.saleId || null }),
      });
      toast.success('Product created with dual-image support.');
      setShowAdd(false); setNewP(emptyNew); refetch();
    } catch (e) { toast.error(e.message); }
  };

  const saveEdit = async (id) => {
    try {
      await apiFetch(`${API}/products/${id}`, token, { method: 'PUT', body: JSON.stringify(form) });
      toast.success('Product updated.'); setEditingId(null); refetch();
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <SkeletonBlock height={300} borderRadius={16} />;
  const list = Array.isArray(data) ? data : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Perfume Catalogue</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Manage dual images (main & hover) and assign perfumes to sales campaigns via the dropdown.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showAdd && (
        <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>New Fragrance</h4>
          <form onSubmit={addP} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input type="text" required className="form-input" value={newP.name} onChange={(e) => setNewP({ ...newP, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={newP.category} onChange={(e) => setNewP({ ...newP, category: e.target.value })}>
                {['Floral', 'Woody', 'Citrus', 'Amber', 'Fresh', 'Oriental', 'Gourmand'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Original Price (Regular / Before Discount Rs.)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 159.99"
                value={newP.originalPrice}
                onChange={(e) => setNewP({ ...newP, originalPrice: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Final Selling Price (After Discount Rs.)</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                placeholder="e.g. 129.99"
                value={newP.price}
                onChange={(e) => setNewP({ ...newP, price: e.target.value })}
              />
            </div>

            {/* Live Discount Calculator Preview */}
            {newP.originalPrice && Number(newP.originalPrice) > Number(newP.price) && Number(newP.price) > 0 && (
              <div style={{ gridColumn: '1/-1', background: 'rgba(168,44,44,0.08)', border: '1px solid rgba(168,44,44,0.25)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flame size={16} color="#A82C2C" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A82C2C' }}>
                  Live Discount: {Math.round(((Number(newP.originalPrice) - Number(newP.price)) / Number(newP.originalPrice)) * 100)}% OFF
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  (Customer saves Rs. {Math.round(Number(newP.originalPrice) - Number(newP.price)).toLocaleString()} on this fragrance)
                </span>
              </div>
            )}

            <FileUploadField label="Main Image 1 (Upload or URL)" currentUrl={newP.imageUrl} onUploaded={(url) => setNewP((p) => ({ ...p, imageUrl: url }))} />
            <FileUploadField label="Hover Image 2 (Upload or URL)" currentUrl={newP.hoverImageUrl} onUploaded={(url) => setNewP((p) => ({ ...p, hoverImageUrl: url }))} />
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assign to Sale Campaign</label>
              <select className="form-input" value={newP.saleId} onChange={(e) => setNewP({ ...newP, saleId: e.target.value })}>
                <option value="">-- None (Regular Catalogue) --</option>
                {salesList.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.discountPercent ? `${s.discountPercent}% off` : 'Sale'})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Stock Units</label>
              <input type="number" required className="form-input" value={newP.stock} onChange={(e) => setNewP({ ...newP, stock: e.target.value })} />
            </div>
            {['top', 'middle', 'base'].map((n) => (
              <div key={n} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{n.charAt(0).toUpperCase() + n.slice(1)} Notes</label>
                <input type="text" className="form-input" value={newP.notes[n]} onChange={(e) => setNewP({ ...newP, notes: { ...newP.notes, [n]: e.target.value } })} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <textarea rows={2} className="form-input" value={newP.description} onChange={(e) => setNewP({ ...newP, description: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Fragrance</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ padding: '10px 18px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid rgba(106,91,83,0.08)' }}>
                {['Images', 'Name', 'Category', 'Discount / Sale', 'Price', 'Stock', 'Rating', 'Actions'].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No products yet.</td></tr>
              ) : (
                list.map((p) => {
                  const pct = p.originalPrice && p.originalPrice > p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : null;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(106,91,83,0.06)' }}>
                      <TD>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <img src={p.imageUrl} alt="Main" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} title="Main Image" />
                          {p.hoverImageUrl && <img src={p.hoverImageUrl} alt="Hover" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', opacity: 0.8 }} title="Hover Image 2" />}
                        </div>
                      </TD>
                      <TD style={{ fontWeight: 600 }}>{p.name}</TD>
                      <TD>{p.category}</TD>
                      <TD>
                        {pct ? (
                          <span style={{ background: 'linear-gradient(135deg, #A82C2C, #7A1C1C)', color: 'white', padding: '3px 8px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Flame size={11} fill="#FFE082" color="#FFE082" /> {pct}% OFF
                          </span>
                        ) : p.saleId ? (
                          <span style={{ background: 'rgba(168,44,44,0.12)', color: '#A82C2C', padding: '3px 8px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 700 }}>
                            {typeof p.saleId === 'object' ? p.saleId.name : 'On Sale 🔥'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Regular Price</span>
                        )}
                      </TD>
                      <TD>
                        <span style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>Rs. {Math.round(p.price).toLocaleString()}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span style={{ marginLeft: 6, fontSize: '0.76rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                            Rs. {Math.round(p.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </TD>
                      <TD>{p.stock}</TD>
                      <TD>{p.rating} ★</TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => {
                              setEditingId(p._id);
                              setForm({
                                name: p.name, category: p.category, price: p.price,
                                originalPrice: p.originalPrice || '',
                                imageUrl: p.imageUrl, hoverImageUrl: p.hoverImageUrl || '',
                                saleId: typeof p.saleId === 'object' && p.saleId?._id ? p.saleId._id : p.saleId || '',
                                stock: p.stock, description: p.description,
                                notes: p.notes || { top: '', middle: '', base: '' },
                              });
                            }}
                            style={{ border: 'none', background: 'rgba(89,53,48,0.08)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }}
                            title="Edit Fragrance"
                          >
                            <Edit2 size={14} color="var(--color-burgundy)" />
                          </button>
                          <button onClick={() => del(p._id, p.name)} style={{ border: 'none', background: 'rgba(176,92,92,0.1)', borderRadius: 8, cursor: 'pointer', padding: '7px 9px' }} title="Delete">
                            <Trash2 size={14} color="var(--color-error)" />
                          </button>
                        </div>
                      </TD>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,34,30,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditingId(null)}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Edit Fragrance</h4>
              <button onClick={() => setEditingId(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveEdit(editingId); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input type="text" required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {['Floral', 'Woody', 'Citrus', 'Amber', 'Fresh', 'Oriental', 'Gourmand'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Original Price (Strike-through Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="e.g. 159.99"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Final Selling Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="e.g. 129.99"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>

              {/* Live Discount Calculator Preview in Edit Modal */}
              {form.originalPrice && Number(form.originalPrice) > Number(form.price) && Number(form.price) > 0 && (
                <div style={{ gridColumn: '1/-1', background: 'rgba(168,44,44,0.08)', border: '1px solid rgba(168,44,44,0.25)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Flame size={16} color="#A82C2C" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A82C2C' }}>
                    Live Discount: {Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% OFF
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    (Customer saves Rs. {Math.round(Number(form.originalPrice) - Number(form.price)).toLocaleString()})
                  </span>
                </div>
              )}

              <FileUploadField label="Main Image 1 (Upload or URL)" currentUrl={form.imageUrl} onUploaded={(url) => setForm((p) => ({ ...p, imageUrl: url }))} />
              <FileUploadField label="Hover Image 2 (Upload or URL)" currentUrl={form.hoverImageUrl} onUploaded={(url) => setForm((p) => ({ ...p, hoverImageUrl: url }))} />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign to Sale Campaign</label>
                <select className="form-input" value={form.saleId || ''} onChange={(e) => setForm({ ...form, saleId: e.target.value || null })}>
                  <option value="">-- None (Original Category Only) --</option>
                  {salesList.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.discountPercent ? `${s.discountPercent}% off` : 'Sale'})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stock Units</label>
                <input type="number" required className="form-input" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea rows={2} className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '10px 18px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 4. Banners Tab ──────────────────────────────────────────────────────────
const BannersTab = ({ token }) => {
  const { toast } = useToast();
  const [siteConfig, setSiteConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/site-config').then((r) => r.json()).then(setSiteConfig).catch(() => {});
  }, []);

  const saveBanners = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/site-config/banners`, token, {
        method: 'PUT',
        body: JSON.stringify({
          banner1: siteConfig.banner1,
          banner2: siteConfig.banner2,
          textBanner: siteConfig.textBanner,
        }),
      });
      toast.success('Banners saved successfully.');
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (!siteConfig) return <SkeletonBlock height={300} borderRadius={16} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Homepage Banners Control</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Manage pure image banners (Banner 1 & Banner 2) and the Scent of Elegance editorial text banner.</p>
      </div>

      {/* ── 1. Banner 1: Image Banner (After Value Strip) ── */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>
              1st Image Banner (Shown after Value Strip)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Pure graphic image banner (no overlaid text). Clicking takes the customer to the destination link.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={siteConfig.banner1?.active !== false}
              onChange={(e) => setSiteConfig({ ...siteConfig, banner1: { ...siteConfig.banner1, active: e.target.checked } })}
              style={{ width: 16, height: 16 }}
            />
            Show on Homepage
          </label>
        </div>

        {/* Recommended size box */}
        <div style={{ background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.35)', borderRadius: 10, padding: '10px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>📐 Recommended Banner Dimensions:</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}><strong>1400 × 450 px</strong> (or 1920 × 600 px — Landscape 16:5 / 21:9 ratio)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FileUploadField
              label="Banner 1 Image (Upload or Paste URL)"
              currentUrl={siteConfig.banner1?.imageUrl || siteConfig.banner1?.bgImageUrl || ''}
              onUploaded={(url) => setSiteConfig({ ...siteConfig, banner1: { ...siteConfig.banner1, imageUrl: url, bgImageUrl: url } })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Destination Link when Clicked</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.banner1?.ctaLink || '/shop'}
              onChange={(e) => setSiteConfig({ ...siteConfig, banner1: { ...siteConfig.banner1, ctaLink: e.target.value } })}
              placeholder="/shop or /sale/azadi-sale"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Pro Text Banner ("Scent of Elegance" - Before Studio Videos) ── */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>
              Text Promo Banner (Shown before "Behind the Scenes / Straight from the Studio")
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              High-end luxury text banner with custom title, quote, description, and "Shop Collection Now" button.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={siteConfig.textBanner?.active !== false}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), active: e.target.checked } })}
              style={{ width: 16, height: 16 }}
            />
            Show on Homepage
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tag Badge</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.textBanner?.tag ?? 'Signature Scent'}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), tag: e.target.value } })}
              placeholder="Signature Scent"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Title Headline</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.textBanner?.title ?? 'Scent of Elegance'}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), title: e.target.value } })}
              placeholder="Scent of Elegance"
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
            <label className="form-label">Subtitle Quote</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.textBanner?.subtitle ?? 'A fragrance that stays with you long after you have gone.'}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), subtitle: e.target.value } })}
              placeholder="A fragrance that stays with you long after you have gone."
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
            <label className="form-label">Description Text</label>
            <textarea
              rows={2}
              className="form-input"
              value={siteConfig.textBanner?.description ?? 'Crafted with the rarest florals and rich amber resins. Rediscover your personal signature aroma today.'}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), description: e.target.value } })}
              placeholder="Crafted with the rarest florals..."
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">CTA Button Label</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.textBanner?.ctaLabel ?? 'Shop Collection Now'}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), ctaLabel: e.target.value } })}
              placeholder="Shop Collection Now"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">CTA Button Link</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.textBanner?.ctaLink ?? '/shop'}
              onChange={(e) => setSiteConfig({ ...siteConfig, textBanner: { ...(siteConfig.textBanner || {}), ctaLink: e.target.value } })}
              placeholder="/shop"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Banner 2: Image Banner (After Satisfied Customers) ── */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>
              2nd Image Banner (Shown after Satisfied Customers)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Pure graphic image banner (no overlaid text). Appears directly below the customer reviews carousel.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={siteConfig.banner2?.active !== false}
              onChange={(e) => setSiteConfig({ ...siteConfig, banner2: { ...siteConfig.banner2, active: e.target.checked } })}
              style={{ width: 16, height: 16 }}
            />
            Show on Homepage
          </label>
        </div>

        {/* Recommended size box */}
        <div style={{ background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.35)', borderRadius: 10, padding: '10px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>📐 Recommended Banner Dimensions:</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}><strong>1400 × 450 px</strong> (or 1920 × 600 px — Landscape 16:5 / 21:9 ratio)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FileUploadField
              label="Banner 2 Image (Upload or Paste URL)"
              currentUrl={siteConfig.banner2?.imageUrl || siteConfig.banner2?.bgImageUrl || ''}
              onUploaded={(url) => setSiteConfig({ ...siteConfig, banner2: { ...siteConfig.banner2, imageUrl: url, bgImageUrl: url } })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Destination Link when Clicked</label>
            <input
              type="text"
              className="form-input"
              value={siteConfig.banner2?.ctaLink || '/shop'}
              onChange={(e) => setSiteConfig({ ...siteConfig, banner2: { ...siteConfig.banner2, ctaLink: e.target.value } })}
              placeholder="/shop or /sale/azadi-sale"
            />
          </div>
        </div>
      </div>

      <button onClick={saveBanners} disabled={saving} className="btn btn-primary" style={{ padding: '14px 36px', alignSelf: 'flex-start' }}>
        {saving ? 'Saving Banners...' : 'Save All Banners'}
      </button>
    </div>
  );
};

// ─── 5. Studio Videos Tab ────────────────────────────────────────────────────
const StudioVideosTab = ({ token }) => {
  const { toast } = useToast();
  const [siteConfig, setSiteConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/site-config').then((r) => r.json()).then(setSiteConfig).catch(() => {});
  }, []);

  const addVideo = () => {
    const newVideo = { title: 'Studio Tour', tag: 'NEW', thumbnailUrl: '', videoUrl: '', videoPlatform: 'direct', active: true };
    setSiteConfig({ ...siteConfig, studioVideos: [...(siteConfig.studioVideos || []), newVideo] });
  };

  const removeVideo = (idx) => setSiteConfig({ ...siteConfig, studioVideos: siteConfig.studioVideos.filter((_, i) => i !== idx) });

  const saveVideos = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/site-config/studio-videos`, token, { method: 'PUT', body: JSON.stringify({ studioVideos: siteConfig.studioVideos }) });
      toast.success('Studio videos carousel updated.');
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (!siteConfig) return <SkeletonBlock height={300} borderRadius={16} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Straight from the Studio Videos</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Vertical 9:16 video cards carousel. Auto-changes every 1 minute on the homepage.</p>
        </div>
        <button className="btn btn-secondary" onClick={addVideo} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px' }}>
          <Plus size={15} /> Add Video Card
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {(siteConfig.studioVideos || []).map((v, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: 20, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '0.9rem' }}>Video Card #{idx + 1}</span>
              <button onClick={() => removeVideo(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-error)' }}><Trash2 size={15} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Overlay Tag (Badge)</label>
              <input type="text" className="form-input" value={v.tag} onChange={(e) => { const u = [...siteConfig.studioVideos]; u[idx].tag = e.target.value; setSiteConfig({ ...siteConfig, studioVideos: u }); }} placeholder="13,000+ CUSTOMERS!" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Title</label>
              <input type="text" className="form-input" value={v.title} onChange={(e) => { const u = [...siteConfig.studioVideos]; u[idx].title = e.target.value; setSiteConfig({ ...siteConfig, studioVideos: u }); }} />
            </div>
            <FileUploadField label="Thumbnail (Upload or URL)" currentUrl={v.thumbnailUrl} onUploaded={(url) => { const u = [...siteConfig.studioVideos]; u[idx].thumbnailUrl = url; setSiteConfig({ ...siteConfig, studioVideos: u }); }} />
            <FileUploadField label="Video File / URL (MP4, Youtube, Vimeo)" currentUrl={v.videoUrl} accept="video/*" onUploaded={(url) => { const u = [...siteConfig.studioVideos]; u[idx].videoUrl = url; setSiteConfig({ ...siteConfig, studioVideos: u }); }} />
          </div>
        ))}
      </div>
      <button onClick={saveVideos} disabled={saving} className="btn btn-primary" style={{ padding: '12px 30px', alignSelf: 'flex-start' }}>
        {saving ? 'Saving...' : 'Save Studio Videos'}
      </button>
    </div>
  );
};

// ─── 6. Testimonials Tab ─────────────────────────────────────────────────────
const TestimonialsTab = ({ token }) => {
  const { toast } = useToast();
  const [siteConfig, setSiteConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/site-config').then((r) => r.json()).then(setSiteConfig).catch(() => {});
  }, []);

  const addTestimonial = () => {
    const newT = { customerPhoto: '', quote: 'Exceptional quality. Stays all day!', author: 'Customer Name', rating: 5, perfumeVariant: 'Spectra — Best Male', isVerified: true };
    setSiteConfig({ ...siteConfig, testimonials: [...(siteConfig.testimonials || []), newT] });
  };

  const removeTestimonial = (idx) => setSiteConfig({ ...siteConfig, testimonials: siteConfig.testimonials.filter((_, i) => i !== idx) });

  const saveTestimonials = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/site-config/testimonials`, token, { method: 'PUT', body: JSON.stringify({ testimonials: siteConfig.testimonials }) });
      toast.success('Testimonials updated.');
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (!siteConfig) return <SkeletonBlock height={300} borderRadius={16} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>Satisfied Customers Testimonials</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Manage customer unboxing photos, review quotes, star ratings, and perfume variant tags.</p>
        </div>
        <button className="btn btn-secondary" onClick={addTestimonial} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px' }}>
          <Plus size={15} /> Add Testimonial
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {(siteConfig.testimonials || []).map((t, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: 20, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '0.9rem' }}>Review #{idx + 1}</span>
              <button onClick={() => removeTestimonial(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-error)' }}><Trash2 size={15} /></button>
            </div>
            <FileUploadField label="Customer / Unboxing Photo" currentUrl={t.customerPhoto} onUploaded={(url) => { const u = [...siteConfig.testimonials]; u[idx].customerPhoto = url; setSiteConfig({ ...siteConfig, testimonials: u }); }} />
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Author Name</label>
              <input type="text" className="form-input" value={t.author} onChange={(e) => { const u = [...siteConfig.testimonials]; u[idx].author = e.target.value; setSiteConfig({ ...siteConfig, testimonials: u }); }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Perfume Variant Tag</label>
              <input type="text" className="form-input" value={t.perfumeVariant} onChange={(e) => { const u = [...siteConfig.testimonials]; u[idx].perfumeVariant = e.target.value; setSiteConfig({ ...siteConfig, testimonials: u }); }} placeholder="Azadi Bundle — Any 3" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quote</label>
              <textarea rows={2} className="form-input" value={t.quote} onChange={(e) => { const u = [...siteConfig.testimonials]; u[idx].quote = e.target.value; setSiteConfig({ ...siteConfig, testimonials: u }); }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={saveTestimonials} disabled={saving} className="btn btn-primary" style={{ padding: '12px 30px', alignSelf: 'flex-start' }}>
        {saving ? 'Saving...' : 'Save All Testimonials'}
      </button>
    </div>
  );
};

// ─── 7. Settings Tab (Categories + Bank) ─────────────────────────────────────
const SettingsTab = ({ token }) => {
  const { toast } = useToast();
  const [siteConfig, setSiteConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/site-config').then((r) => r.json()).then(setSiteConfig).catch(() => {});
  }, []);

  const saveBankDetails = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/site-config/bank-details`, token, { method: 'PUT', body: JSON.stringify(siteConfig.bankDetails) });
      toast.success('Bank details saved.');
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const saveCategories = async () => {
    setSaving(true);
    try {
      await apiFetch(`${API}/site-config/navbar-categories`, token, { method: 'PUT', body: JSON.stringify({ navbarCategories: siteConfig.navbarCategories }) });
      toast.success('Navbar category visibility updated.');
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (!siteConfig) return <SkeletonBlock height={300} borderRadius={16} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Navbar Categories Visibility */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)', marginBottom: 8 }}>Navbar Categories Visibility</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>Check which category buttons to display on the top navigation bar.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {(siteConfig.navbarCategories || []).map((cat, idx) => (
            <label key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: cat.isVisible ? 'rgba(89,53,48,0.06)' : 'white', border: cat.isVisible ? '1.5px solid var(--color-burgundy)' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={cat.isVisible}
                onChange={(e) => {
                  const updated = [...siteConfig.navbarCategories];
                  updated[idx].isVisible = e.target.checked;
                  setSiteConfig({ ...siteConfig, navbarCategories: updated });
                }}
                style={{ width: 16, height: 16, accentColor: 'var(--color-burgundy)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat.name}</span>
            </label>
          ))}
        </div>
        <button onClick={saveCategories} disabled={saving} className="btn btn-primary" style={{ marginTop: 20, padding: '10px 24px' }}>Save Category Visibility</button>
      </div>

      {/* Bank Account Settings */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 16 }}>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)', marginBottom: 8 }}>Bank Transfer Settings (Manual Payment)</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>Configures bank name, account number, and the automatic discount displayed at checkout.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[['Bank Name', 'bankName'], ['Account Title', 'accountTitle'], ['Account Number', 'accountNumber'], ['IBAN', 'iban'], ['WhatsApp Support Phone', 'supportPhone']].map(([label, key]) => (
            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{label}</label>
              <input type="text" className="form-input" value={siteConfig.bankDetails?.[key] || ''} onChange={(e) => setSiteConfig({ ...siteConfig, bankDetails: { ...siteConfig.bankDetails, [key]: e.target.value } })} />
            </div>
          ))}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bank Transfer Discount (%)</label>
            <input type="number" className="form-input" value={siteConfig.bankDetails?.discountPercent ?? 5} onChange={(e) => setSiteConfig({ ...siteConfig, bankDetails: { ...siteConfig.bankDetails, discountPercent: Number(e.target.value) } })} />
          </div>
        </div>
        <button onClick={saveBankDetails} disabled={saving} className="btn btn-primary" style={{ marginTop: 20, padding: '10px 24px' }}>Save Bank Details</button>
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
const TABS = [
  { key: 'orders', label: 'Orders & Approvals', icon: ShoppingBag },
  { key: 'sales', label: 'Sales & Campaigns', icon: Flame },
  { key: 'products', label: 'Products & Hover', icon: Package },
  { key: 'banners', label: 'Homepage Banners', icon: Image },
  { key: 'studioVideos', label: 'Studio Videos', icon: Video },
  { key: 'testimonials', label: 'Testimonials', icon: Star },
  { key: 'settings', label: 'Categories & Bank', icon: Settings },
];

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') navigate('/');
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 80, minHeight: '80vh', textAlign: 'center' }}>
        <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Loading luxury control panel...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="container animate-fade" style={{ paddingTop: 40, minHeight: '85vh', paddingBottom: 80 }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Anti Luxury Control Center</span>
        <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 6 }}>Admin Dashboard</h2>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 6, borderRadius: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 700,
              background: tab === key ? 'white' : 'transparent',
              color: tab === key ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
              boxShadow: tab === key ? '0 2px 8px rgba(44,34,30,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'orders'       && <OrdersTab token={user.token} />}
      {tab === 'sales'        && <SalesTab token={user.token} />}
      {tab === 'products'     && <ProductsTab token={user.token} />}
      {tab === 'banners'      && <BannersTab token={user.token} />}
      {tab === 'studioVideos' && <StudioVideosTab token={user.token} />}
      {tab === 'testimonials' && <TestimonialsTab token={user.token} />}
      {tab === 'settings'     && <SettingsTab token={user.token} />}
    </div>
  );
};

export default AdminDashboard;