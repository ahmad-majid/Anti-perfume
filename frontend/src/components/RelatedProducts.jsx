import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonCard } from './Skeleton';

const RelatedProducts = ({ currentProductId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!category) return;
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/products?category=${encodeURIComponent(category)}`
        );
        const data = await res.json();
        // Exclude the current product
        setProducts(data.filter((p) => p._id !== currentProductId).slice(0, 6));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [category, currentProductId]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (!loading && products.length === 0) return null;

  return (
    <div style={{ marginTop: 70 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            You Might Also Love
          </span>
          <h3 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginTop: 4 }}>
            From the {category} Collection
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => scroll(-1)}
            className="btn-icon"
            style={{ width: 38, height: 38 }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="btn-icon"
            style={{ width: 38, height: 38 }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 8,
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ minWidth: 260, flexShrink: 0 }}>
                <SkeletonCard />
              </div>
            ))
          : products.map((product) => (
              <div
                key={product._id}
                className="perfume-card"
                style={{ minWidth: 260, flexShrink: 0, cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="image-container" style={{ height: 220 }}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="details-panel">
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.category}
                  </span>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--color-burgundy)', margin: '4px 0 8px' }}>
                    {product.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                    <Star size={13} fill="var(--color-gold)" stroke="none" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{product.rating}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      ({product.reviewsCount})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Rs. {Math.round(product.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
