import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Clock, Compass, Gift, ChevronRight } from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import DiscountedProductsCarousel from '../components/DiscountedProductsCarousel';
import StudioVideosCarousel from '../components/StudioVideosCarousel';
import SatisfiedCustomersCarousel from '../components/SatisfiedCustomersCarousel';
import WhyUsSection from '../components/WhyUsSection';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState(null);
  const navigate = useNavigate();

  // Fetch products and site-config
  useEffect(() => {
    // 1. Products
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Site Config
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => setSiteConfig(data))
      .catch(() => {});
  }, []);

  const banner1 = siteConfig?.banner1 || {
    imageUrl: '/images/floral_musk.jpg',
    bgImageUrl: '/images/floral_musk.jpg',
    ctaLink: '/shop',
    active: true,
  };

  const textBanner = siteConfig?.textBanner || {
    tag: 'Signature Scent',
    title: 'Scent of Elegance',
    subtitle: 'A fragrance that stays with you long after you have gone.',
    description: 'Crafted with the rarest florals and rich amber resins. Rediscover your personal signature aroma today.',
    ctaLabel: 'Shop Collection Now',
    ctaLink: '/shop',
    active: true,
  };

  const banner2 = siteConfig?.banner2 || {
    imageUrl: '/images/amber_royale.jpg',
    bgImageUrl: '/images/amber_royale.jpg',
    ctaLink: '/shop',
    active: true,
  };

  // Find product for hero display
  const heroProduct =
    products.find((p) => p.name === 'Floral Musk') ||
    products[0];

  const banner1Img = banner1.imageUrl || banner1.bgImageUrl || '/images/floral_musk.jpg';
  const banner2Img = banner2.imageUrl || banner2.bgImageUrl || '/images/amber_royale.jpg';

  return (
    <div className="animate-fade">

      {/* ── 1. Top Hero Section ───────────────────────────────────── */}
      <section
        style={{
          padding: '70px 0 80px',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
          backgroundImage: 'radial-gradient(ellipse at top right, rgba(230, 214, 206, 0.45) 0%, rgba(250, 246, 240, 1) 70%)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: 50,
              alignItems: 'center',
            }}
            className="hero-grid"
          >
            {/* Left text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  color: 'var(--color-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                }}
              >
                <Sparkles size={14} /> Luxury Haute Parfumerie
              </div>
              <h1 className="serif-title-large" style={{ color: 'var(--color-burgundy)' }}>
                Elegance <br />
                <span style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
                  in Bloom
                </span>
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: 500, lineHeight: 1.8 }}>
                Experience timeless luxury perfumes crafted with passion and elegance, designed to leave an unforgettable lasting impression.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
                <Link
                  to="/shop"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px' }}
                >
                  Explore Collection <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.1)',
                    padding: '14px 24px',
                  }}
                >
                  View All Perfumes
                </Link>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  maxWidth: 380,
                  height: 380,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-rose-light)',
                  filter: 'blur(60px)',
                  zIndex: 0,
                }}
              />
              {heroProduct ? (
                <div
                  onClick={() => navigate(`/product/${heroProduct._id}`)}
                  style={{ cursor: 'pointer', position: 'relative', zIndex: 1, transition: 'var(--transition-smooth)', width: '100%', maxWidth: 360 }}
                  className="hero-bottle-hover"
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      borderRadius: 24,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(255,255,255,0.8)',
                    }}
                  >
                    <img
                      src={heroProduct.imageUrl}
                      alt={heroProduct.name}
                      loading="eager"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      left: -15,
                      padding: '10px 22px',
                      borderRadius: 30,
                      boxShadow: '0 8px 24px rgba(44,34,30,0.08)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-gold)',
                        fontWeight: 700,
                      }}
                    >
                      Signature Perfume
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>
                      {heroProduct.name}
                    </h4>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    maxWidth: 360,
                    aspectRatio: '1/1',
                    borderRadius: 24,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <img
                    src="/images/floral_musk.jpg"
                    alt="Hero Perfume"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Value Strip Section ────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--color-rose-light)',
          padding: '36px 0',
          borderTop: '1px solid rgba(106,91,83,0.08)',
          borderBottom: '1px solid rgba(106,91,83,0.08)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
              textAlign: 'center',
            }}
          >
            {[
              { Icon: Sparkles, title: 'Premium Ingredients', sub: 'Sourced Globally' },
              { Icon: Clock, title: 'Long Lasting', sub: 'Eau de Parfum 24H+' },
              { Icon: Compass, title: 'Artisan Crafted', sub: 'Master Perfumers' },
              { Icon: Gift, title: 'Luxury Packaging', sub: 'Collector Edition Box' },
            ].map(({ Icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Icon size={24} color="var(--color-burgundy)" />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 1st Full-Width Widescreen Image Banner ─────────────── */}
      {banner1.active !== false && banner1Img && (
        <section style={{ padding: '40px 0 0', width: '100%', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
            <Link
              to={banner1.ctaLink || '/shop'}
              style={{
                display: 'block',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(44, 34, 30, 0.08)',
                transition: 'opacity 0.3s ease',
              }}
              className="widescreen-banner-link"
            >
              <img
                src={banner1Img}
                alt="Promotional Banner 1"
                loading="lazy"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '480px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Link>
          </div>
        </section>
      )}

      {/* ── 4. Mega Discounted Products Carousel (Directly After 1st Banner) ── */}
      <DiscountedProductsCarousel products={products} />

      {/* ── 5. Featured Fragrances Collection (Centered Heading) ─── */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          {/* Centered Heading */}
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                color: 'var(--color-gold)',
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={14} /> Scent Masterpieces
            </span>
            <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 2, marginBottom: 4 }}>
              Featured Fragrances
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.96rem', lineHeight: 1.6 }}>
              Hover over any fragrance to reveal its packaging & bottle silhouette
            </p>

            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--color-burgundy)',
                fontWeight: 700,
                fontSize: '0.86rem',
                borderBottom: '1.5px solid var(--color-burgundy)',
                paddingBottom: 2,
                marginTop: 8,
              }}
            >
              View Full Collection <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Pro Text Banner ("Scent of Elegance" - Before Straight from the Studio) ── */}
      {textBanner.active !== false && (
        <section
          style={{
            padding: '110px 0',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'var(--color-burgundy)',
            backgroundImage: 'radial-gradient(ellipse at center, rgba(140, 75, 68, 0.4) 0%, rgba(61, 34, 30, 0.98) 100%)',
            borderTop: '1px solid rgba(197, 160, 89, 0.25)',
            borderBottom: '1px solid rgba(197, 160, 89, 0.25)',
          }}
          className="pro-text-banner"
        >
          {/* Subtle decorative glow circles */}
          <div style={{ position: 'absolute', top: -80, left: '20%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(197, 160, 89, 0.08)', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, right: '20%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(218, 170, 160, 0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          <div
            className="container"
            style={{
              textAlign: 'center',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 22,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {textBanner.tag && (
              <span
                style={{
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--color-gold-light)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Sparkles size={13} color="var(--color-gold-light)" /> {textBanner.tag}
              </span>
            )}

            <h2
              className="serif-title-medium"
              style={{
                color: 'var(--color-rose-light)',
                fontSize: '3rem',
                letterSpacing: '0.04em',
                lineHeight: 1.15,
                maxWidth: 800,
              }}
            >
              {textBanner.title || 'Scent of Elegance'}
            </h2>

            <p
              style={{
                maxWidth: 680,
                fontSize: '1.2rem',
                opacity: 0.95,
                lineHeight: 1.8,
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                color: '#FFF8F2',
              }}
            >
              "{textBanner.subtitle || 'A fragrance that stays with you long after you have gone.'}"
            </p>

            {textBanner.description && (
              <p style={{ maxWidth: 620, fontSize: '0.96rem', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.7 }}>
                {textBanner.description}
              </p>
            )}

            <Link
              to={textBanner.ctaLink || '/shop'}
              className="btn btn-gold"
              style={{
                letterSpacing: '0.12em',
                marginTop: 10,
                padding: '15px 38px',
                fontSize: '0.88rem',
                fontWeight: 700,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              }}
            >
              {textBanner.ctaLabel || 'Shop Collection Now'} <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ── 7. Behind the Scenes / Straight from the Studio Videos Carousel ── */}
      <StudioVideosCarousel videos={siteConfig?.studioVideos} />

      {/* ── 8. Satisfied Customers Testimonials Carousel ───────────── */}
      <SatisfiedCustomersCarousel testimonials={siteConfig?.testimonials} />

      {/* ── 9. 2nd Full-Width Widescreen Image Banner ──────────────── */}
      {banner2.active !== false && banner2Img && (
        <section style={{ padding: '30px 0 0', width: '100%', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
            <Link
              to={banner2.ctaLink || '/shop'}
              style={{
                display: 'block',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(44, 34, 30, 0.08)',
                transition: 'opacity 0.3s ease',
              }}
              className="widescreen-banner-link"
            >
              <img
                src={banner2Img}
                alt="Promotional Banner 2"
                loading="lazy"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '480px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Link>
          </div>
        </section>
      )}

      {/* ── 10. Why Us Feature Grid (Shown After 2nd Banner - Matching Reference) ── */}
      <WhyUsSection />

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .widescreen-banner-link:hover {
          opacity: 0.96;
        }
        .explore-btn-hover:hover {
          background-color: var(--color-burgundy) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-bottle-hover { transform: scale(0.95); margin: 0 auto; }
          .pro-text-banner h2 { font-size: 2.1rem !important; }
          .pro-text-banner p { font-size: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
