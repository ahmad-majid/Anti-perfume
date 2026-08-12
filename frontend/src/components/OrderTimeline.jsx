import React from 'react';
import { Clock, Package, Truck, MapPin, CheckCircle, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'Processing',      label: 'Processing',       icon: Clock,        color: '#C5A059' },
  { key: 'Shipped',         label: 'Shipped',          icon: Package,      color: '#593530' },
  { key: 'Out for Delivery',label: 'Out for Delivery', icon: Truck,        color: '#A66E63' },
  { key: 'Delivered',       label: 'Delivered',        icon: CheckCircle,  color: '#6E8A73' },
];

const CANCELLED = { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: '#B05C5C' };

const OrderTimeline = ({ status, statusHistory = [] }) => {
  if (status === 'Cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(176,92,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <XCircle size={18} color="#B05C5C" />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: '#B05C5C', fontSize: '0.9rem' }}>Order Cancelled</p>
          {statusHistory.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {new Date(statusHistory[statusHistory.length - 1].timestamp).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  // Build timestamp lookup from statusHistory
  const tsMap = {};
  if (statusHistory && statusHistory.length > 0) {
    statusHistory.forEach((entry) => {
      if (!tsMap[entry.status]) tsMap[entry.status] = entry.timestamp;
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
      {STEPS.map((step, idx) => {
        const isDone = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        const Icon = step.icon;
        const ts = tsMap[step.key];

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
            {/* Step node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: isDone ? step.color : 'transparent',
                  border: isDone ? 'none' : '2px solid rgba(106,91,83,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? `0 0 0 4px ${step.color}28` : 'none',
                }}
              >
                <Icon size={16} color={isDone ? 'white' : 'var(--color-text-muted)'} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isDone ? step.color : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {step.label}
                </p>
                {ts && (
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginTop: 18,
                  minWidth: 30,
                  background: idx < currentIndex
                    ? `linear-gradient(90deg, ${step.color}, ${STEPS[idx + 1].color})`
                    : 'rgba(106,91,83,0.15)',
                  transition: 'background 0.4s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
