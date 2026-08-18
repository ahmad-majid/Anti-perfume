import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const FloatingWhatsApp = ({ phone = '0347-6903990' }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    'Assalam-o-Alaikum Anti Luxury Fragrances, I would like to consult regarding your signature perfumes.'
  )}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}
    >
      {/* Friendly Chat Tooltip */}
      {showTooltip && (
        <div
          style={{
            background: 'white',
            color: '#1E1E24',
            padding: '10px 14px',
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(106,91,83,0.12)',
            animation: 'fadeIn 0.3s ease',
            maxWidth: 220,
          }}
        >
          <span>Need help finding a scent? Chat with us!</span>
          <button
            onClick={() => setShowTooltip(false)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#888' }}
            aria-label="Dismiss tooltip"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="whatsapp-float-btn"
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
          transition: 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s',
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        <MessageCircle size={32} fill="white" stroke="none" />

        {/* Green pulse dot */}
        <span
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 13,
            height: 13,
            borderRadius: '50%',
            backgroundColor: '#00E676',
            border: '2px solid white',
          }}
        />
      </a>

      <style>{`
        .whatsapp-float-btn:hover {
          transform: scale(1.1) translateY(-3px);
          box-shadow: 0 12px 30px rgba(37, 211, 102, 0.6) !important;
        }
      `}</style>
    </div>
  );
};

export default FloatingWhatsApp;
