import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const COLORS = {
  success: { bg: 'rgba(110, 138, 115, 0.12)', border: 'var(--color-success)', color: 'var(--color-success)' },
  error:   { bg: 'rgba(176, 92, 92, 0.12)',   border: 'var(--color-error)',   color: 'var(--color-error)' },
  warning: { bg: 'rgba(197, 160, 89, 0.12)',  border: 'var(--color-gold)',    color: '#A07828' },
  info:    { bg: 'rgba(89, 53, 48, 0.08)',    border: 'var(--color-burgundy)', color: 'var(--color-burgundy)' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error:   (msg, duration) => addToast(msg, 'error',   duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info:    (msg, duration) => addToast(msg, 'info',    duration),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'white',
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.border}`,
                boxShadow: '0 8px 24px rgba(44,34,30,0.12)',
                minWidth: '280px',
                maxWidth: '380px',
                pointerEvents: 'all',
                animation: 'toastIn 0.3s cubic-bezier(0.25,1,0.5,1) forwards',
              }}
            >
              <span style={{ color: c.color, flexShrink: 0 }}>{ICONS[t.type]}</span>
              <span style={{ flexGrow: 1, fontSize: '0.88rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                {t.message}
              </span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
