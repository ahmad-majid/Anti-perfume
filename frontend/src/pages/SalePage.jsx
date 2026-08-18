import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, ArrowLeft, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/Skeleton';

const SalePage = () => {
  const { slug } = useParams();
  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/sales/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Sale campaign not found or has ended');
        return res.json();
      })
      .then((data) => {
        setSale(data.sale);
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="container animate-fade" style={{ paddingTop: 60, minHeight: '80vh' }}>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="container animate-fade" style={{ textAlign: 'center', padding: '120px 0', minHeight: '80vh' }}>
        <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)' }}>Sale Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 12, marginBottom: 24 }}>
          {error || 'This sales event is currently inactive.'}
        </p>
        <Link to="/shop" className="btn btn-primary">
          Explore All Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ minHeight: '80vh', paddingBottom: 80 }}>
      {/* Sale Hero Banner */}
      <section
        style={{
          padding: '70px 0',
          background: sale.bannerImage
            ? `linear-gradient(rgba(89, 53, 48, 0.88), rgba(44, 34, 30, 0.94)), url(${sale.bannerImage})`
            : 'linear-gradient(135deg, var(--color-burgundy) 0%, #3D1C18 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          marginBottom: 50,
        }}
      >
        <div className="container">
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.84rem',
              marginBottom: 20,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to All Perfumes
          </Link>

          <div style={{ display: 'inline-block', marginBottom: 12 }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: 'var(--color-gold-light)',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Flame size={15} fill="#FFE082" color="#FFE082" />
              {sale.badgeText || 'Special Event'}
            </span>
          </div>

          <h1 className="serif-title-large" style={{ color: 'white', marginBottom: 14 }}>
            {sale.name}
          </h1>

          {sale.description && (
            <p style={{ maxWidth: 650, margin: '0 auto', fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.7 }}>
              {sale.description}
            </p>
          )}

          {sale.discountPercent > 0 && (
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: '0.9rem', background: 'var(--color-gold)', color: 'var(--color-burgundy)', padding: '4px 14px', borderRadius: 12, fontWeight: 700 }}>
                Instant {sale.discountPercent}% Off Applied at Checkout
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Sale Products Grid */}
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h3 className="serif-title-small" style={{ color: 'var(--color-burgundy)' }}>
            Products on Sale ({products.length})
          </h3>
        </div>

        {products.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 20 }}>
            <Sparkles size={32} color="var(--color-gold)" style={{ marginBottom: 14 }} />
            <h4 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', marginBottom: 8 }}>
              New Products Landing Soon
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Products are being added to this sale. Check back shortly or browse our full catalogue.
            </p>
            <Link to="/shop" className="btn btn-secondary">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalePage;
