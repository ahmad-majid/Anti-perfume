import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/products/search/autocomplete?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToProduct = (id) => {
    setQuery('');
    setOpen(false);
    setResults([]);
    navigate(`/product/${id}`);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      goToProduct(results[activeIndex]._id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Input */}
      <div style={{ position: 'relative', width: 220 }}>
        <Search
          size={15}
          color="var(--color-text-muted)"
          style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => query && results.length && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search fragrances..."
          style={{
            width: '100%',
            padding: '9px 36px 9px 36px',
            borderRadius: 30,
            border: '1px solid rgba(106,91,83,0.2)',
            fontSize: '0.83rem',
            outline: 'none',
            background: 'rgba(255,255,255,0.7)',
            color: 'var(--color-text-primary)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocusCapture={(e) => {
            e.target.style.borderColor = 'var(--color-gold)';
            e.target.style.boxShadow = '0 0 0 3px rgba(197,160,89,0.15)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = 'rgba(106,91,83,0.2)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {query && (
          <button
            onClick={clear}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, display: 'flex' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(44,34,30,0.14)',
            border: '1px solid rgba(106,91,83,0.1)',
            overflow: 'hidden',
            zIndex: 500,
            minWidth: 280,
          }}
        >
          {loading ? (
            <div style={{ padding: '14px 16px', fontSize: '0.83rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '14px 16px', fontSize: '0.83rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              No fragrances found
            </div>
          ) : (
            results.map((p, i) => (
              <div
                key={p._id}
                onClick={() => goToProduct(p._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: i === activeIndex ? 'var(--bg-secondary)' : 'transparent',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(106,91,83,0.06)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {p.category} — Rs. {Math.round(p.price).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
