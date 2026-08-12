import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * AnnouncementBar
 * Fetches /api/site-config on mount.
 * Renders nothing if the announcement is disabled or already dismissed this session.
 */
const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed]       = useState(false);

  useEffect(() => {
    // Check if user already dismissed this session
    if (sessionStorage.getItem('announcement_dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    fetch('http://localhost:5000/api/site-config')
      .then(r => r.json())
      .then(data => {
        if (data?.announcement?.enabled) {
          setAnnouncement(data.announcement);
        }
      })
      .catch(() => {}); // fail silently — bar is non-critical
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('announcement_dismissed', 'true');
    setDismissed(true);
  };

  if (!announcement || dismissed) return null;

  const bg   = announcement.bgColor   || '#593530';
  const fg   = announcement.textColor || '#FFFFFF';
  const text = announcement.text      || '';
  const link = announcement.link      || '';
  const linkLabel = announcement.linkLabel || 'Shop Now';

  return (
    <div
      role="banner"
      style={{
        backgroundColor: bg,
        color: fg,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontSize: '0.85rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        position: 'relative',
        zIndex: 200,
      }}
    >
      {/* Icon */}
      <Tag size={14} style={{ flexShrink: 0, opacity: 0.85 }} />

      {/* Message */}
      <span style={{ textAlign: 'center', lineHeight: 1.5 }}>{text}</span>

      {/* Optional CTA link */}
      {link && (
        <Link
          to={link.startsWith('http') ? undefined : link}
          href={link.startsWith('http') ? link : undefined}
          target={link.startsWith('http') ? '_blank' : undefined}
          rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
          style={{
            color: fg,
            fontWeight: 700,
            borderBottom: `1px solid ${fg}`,
            paddingBottom: 1,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          {linkLabel} →
        </Link>
      )}

      {/* Dismiss button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: fg,
          opacity: 0.75,
          display: 'flex',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
