import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Plus, Play, Sparkles, Clock, Compass, Gift, Shield, CheckCircle, Truck, Heart, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { SkeletonCard } from '../components/Skeleton';

// ─── Default hero content (used before site-config loads) ────────────────────
const DEFAULT_HERO = {
  badge:           'Luxury Collection',
  headline:        'Elegance',
  subheadline:     'in Bloom',
  description:     'Experience timeless luxury perfumes crafted with passion and elegance, designed to leave a lasting impression.',
  ctaLabel:        'Explore Collection',
  videoUrl:        '',
  videoPlatform:   'youtube',
  heroProductName: '',
};

// ─── Helpers: extract YouTube / Vimeo embed URLs ──────────────────────────────
const getEmbedUrl = (url, platform) => {
  if (!url) return '';
  if (platform === 'youtube') {
    // Handle youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : url;
  }
  if (platform === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
  }
  return url; // 'direct' — raw mp4 / webm URL
};

// ─── Video Modal ──────────────────────────────────────────────────────────────
const VideoModal = ({ url, platform, onClose }) => {
  const embedUrl = getEmbedUrl(url, platform);
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,6,4,0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close video"
        style={{
          position: 'absolute', top: 24, right: 28,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: 44, height: 44, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', transition: 'background 0.2s',
        }}
      >
        <X size={20} />
      </button>

      {/* Video container — 16:9 */}
      <div style={{
        width: '100%', maxWidth: 900,
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        aspectRatio: '16/9',
        background: '#000',
      }}>
        {platform === 'direct' ? (
          <video
            src={url}
            autoPlay
            controls
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        ) : (
          <iframe
            src={embedUrl}
            title="Story Video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
};

// ─── Testimonials carousel ────────────────────────────────────────────────────
const DEFAULT_TESTIMONIALS = [
  { quote: 'Anti perfumes are truly exceptional. The scent lasts all day long and I always receive compliments!', author: 'Sophia M.', role: 'Verified Customer', rating: 5 },
  { quote: "Velvet Oud is absolutely divine — rich, mysterious, and long-lasting. I get stopped and asked what I'm wearing every time.", author: 'James K.', role: 'Verified Customer', rating: 5 },
  { quote: 'The packaging alone feels like a gift. Amber Royale is warm, luxurious and perfect for evenings.', author: 'Layla R.', role: 'Premium Member', rating: 5 },
];

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [active, setActive]             = useState(0);
  const [fading, setFading]             = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/site-config')
      .then(r => r.json())
      .then(data => { if (data?.testimonials?.length > 0) setTestimonials(data.testimonials); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => { setActive(i => (i + 1) % testimonials.length); setFading(false); }, 350);
    }, 7000);
    return () => clearInterval(timer);
  }, [testimonials]);

  const goTo = (idx) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => { setActive(idx); setFading(false); }, 350);
  };

  const t = testimonials[active] || DEFAULT_TESTIMONIALS[0];

  return (
    <div className="glass-panel" style={{ padding: 40, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 20, minHeight: 220 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill={i < (t.rating||5) ? 'var(--color-gold)' : 'none'} stroke={i < (t.rating||5) ? 'none' : 'var(--color-gold)'} />
        ))}
      </div>
      <div style={{ transition: 'opacity 0.35s ease', opacity: fading ? 0 : 1, flexGrow: 1 }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontStyle: 'italic', lineHeight: 1.65, color: 'var(--color-burgundy)' }}>
          "{t.quote}"
        </p>
        <div style={{ marginTop: 20 }}>
          <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{t.author}</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t.role || 'Verified Customer'}</span>
        </div>
      </div>
      {testimonials.length > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Testimonial ${i+1}`}
              style={{ width: i===active ? 24 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                background: i===active ? 'var(--color-burgundy)' : 'var(--color-rose-medium)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Wishlist preview strip ───────────────────────────────────────────────────
const WishlistPreview = ({ token, onAddToCart }) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggle }            = useWishlist();
  const { toast }             = useToast();
  const navigate              = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading || items.length === 0) return null;

  return (
    <section style={{ padding: '70px 0', backgroundColor: 'var(--color-rose-light)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Your Favourites</span>
            <h2 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heart size={22} fill="var(--color-rose-dark)" stroke="none" /> Saved for You
            </h2>
          </div>
          <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-burgundy)', fontWeight: 600, borderBottom: '1px solid var(--color-burgundy)', paddingBottom: 3, fontSize: '0.88rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
          {items.slice(0, 6).map(product => (
            <div key={product._id} className="perfume-card" style={{ minWidth: 240, flexShrink: 0, position: 'relative' }}>
              <button
                onClick={async (e) => { e.stopPropagation(); await toggle(product); setItems(prev => prev.filter(p => p._id !== product._id)); toast.info(`${product.name} removed from wishlist.`); }}
                style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(166,110,99,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Remove from wishlist"
              >
                <Heart size={14} fill="var(--color-rose-dark)" stroke="none" />
              </button>
              <div className="image-container" style={{ height: 200 }} onClick={() => navigate(`/product/${product._id}`)}>
                <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button className="btn-icon" onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                  style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: 'var(--color-burgundy)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: 36, height: 36 }} aria-label="Add to cart">
                  <Plus size={16} />
                </button>
              </div>
              <div className="details-panel" style={{ padding: '14px 16px' }}>
                <div onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{product.category}</span>
                  <h3 style={{ fontSize: '1.1rem', marginTop: 3, marginBottom: 6, color: 'var(--color-burgundy)' }}>{product.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <Star size={13} fill="var(--color-gold)" stroke="none" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{product.rating}</span>
                  </div>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>${product.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
};

// ─── Main Home component ──────────────────────────────────────────────────────
const Home = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hero, setHero]             = useState(DEFAULT_HERO);
  const [videoOpen, setVideoOpen]   = useState(false);

  const { addToCart }               = useContext(CartContext);
  const { user }                    = useContext(AuthContext);
  const { toast }                   = useToast();
  const { toggle, isWishlisted }    = useWishlist();
  const navigate                    = useNavigate();

  // Fetch products
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { toast.error('Could not load the collection.'); setLoading(false); });
  }, []); // eslint-disable-line

  // Fetch hero config
  useEffect(() => {
    fetch('http://localhost:5000/api/site-config')
      .then(r => r.json())
      .then(data => { if (data?.hero) setHero({ ...DEFAULT_HERO, ...data.hero }); })
      .catch(() => {});
  }, []);

  // Determine hero product: admin-chosen name first, then 'Floral Musk', then first product
  const heroProduct = (hero.heroProductName
    ? products.find(p => p.name === hero.heroProductName)
    : null) || products.find(p => p.name === 'Floral Musk') || products[0];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1, '100ml');
    toast.success(`${product.name} added to cart.`);
  };

  const handleWishlist = async (e, product) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const added = await toggle(product);
    if (added) toast.success(`${product.name} saved to wishlist.`); else toast.info(`${product.name} removed from wishlist.`);
  };

  const handleWatchStory = () => {
    if (!hero.videoUrl) { toast.info('Story video coming soon!'); return; }
    setVideoOpen(true);
  };

  return (
    <div className="animate-fade">

      {/* Video modal */}
      {videoOpen && hero.videoUrl && (
        <VideoModal url={hero.videoUrl} platform={hero.videoPlatform} onClose={() => setVideoOpen(false)} />
      )}

      {/* 1. Hero */}
      <section style={{ padding: '80px 0', minHeight: '85vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60, alignItems: 'center' }} className="hero-grid">

            {/* Left text — driven by site-config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
                <Sparkles size={14} /> {hero.badge}
              </div>
              <h1 className="serif-title-large" style={{ color: 'var(--color-burgundy)' }}>
                {hero.headline} <br />
                <span style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}>{hero.subheadline}</span>
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: 500, lineHeight: 1.8 }}>
                {hero.description}
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
                <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  {hero.ctaLabel} <ArrowRight size={16} />
                </Link>
                <button
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.08)' }}
                  onClick={handleWatchStory}
                >
                  <Play size={16} fill="var(--color-burgundy)" stroke="none" /> Watch Story
                </button>
              </div>
            </div>

            {/* Right hero image */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', backgroundColor: 'var(--color-rose-light)', filter: 'blur(60px)', zIndex: -1 }} />
              {heroProduct && (
                <div onClick={() => navigate(`/product/${heroProduct._id}`)} style={{ cursor: 'pointer', position: 'relative', transition: 'var(--transition-smooth)' }} className="hero-bottle-hover">
                  <div style={{ width: 360, height: 360, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.8)' }}>
                    <img src={heroProduct.imageUrl} alt={heroProduct.name} loading="eager" width={360} height={360} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="glass-panel" style={{ position: 'absolute', bottom: 20, left: -20, padding: '12px 24px', borderRadius: 30, boxShadow: '0 8px 24px rgba(44,34,30,0.08)' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold)', fontWeight: 600 }}>Hero Scent</span>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>{heroProduct.name}</h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Strip */}
      <section style={{ backgroundColor: 'var(--color-rose-light)', padding: '40px 0', borderTop: '1px solid rgba(106,91,83,0.08)', borderBottom: '1px solid rgba(106,91,83,0.08)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 30, textAlign: 'center' }}>
            {[
              { Icon: Sparkles, title: 'Premium Ingredients', sub: 'Sourced Globally' },
              { Icon: Clock,    title: 'Long Lasting',        sub: 'Premium Fragrances' },
              { Icon: Compass,  title: 'Artisan Crafted',     sub: 'Made for Perfection' },
              { Icon: Gift,     title: 'Luxury Packaging',    sub: 'Made with Love' },
            ].map(({ Icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Icon size={24} color="var(--color-burgundy)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About */}
      <section id="about" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="about-grid">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, position: 'relative' }}>
              <div style={{ width: '45%', height: 320, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <img src="/images/rose_divine.jpg" alt="About Rose Divine" loading="lazy" width={280} height={320} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ width: '50%', height: 400, borderRadius: 16, overflow: 'hidden', marginTop: -40, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <img src="/images/midnight_bloom.jpg" alt="About Midnight Bloom" loading="lazy" width={320} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)' }}>About Anti</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                At Anti, we blend rare ingredients from around the world to create perfumes that speak to the soul. Each bottle is a symbol of luxury, sophistication, and individuality.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                Our scent scientists curate layered sensory journeys that evolve throughout the day, providing an enduring aura of elegance.
              </p>
              <Link to="/shop" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 10 }}>Discover Our Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Products */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={13} /> Editor's Picks
              </span>
              <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginBottom: 8 }}>Featured Fragrances</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>Handpicked signatures worth experiencing</p>
            </div>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-burgundy)', fontWeight: 600, borderBottom: '1px solid var(--color-burgundy)', paddingBottom: 4 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 30 }}>
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 30 }}>
              {(products.filter(p => p.featured).length > 0 ? products.filter(p => p.featured) : products.slice(0, 4)).map((product) => {
                const wishlisted = isWishlisted(product._id);
                return (
                  <div key={product._id} className="perfume-card" style={{ position: 'relative' }}>
                    <button onClick={(e) => handleWishlist(e, product)} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(106,91,83,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition-fast)' }}>
                      <Heart size={15} fill={wishlisted ? 'var(--color-rose-dark)' : 'none'} stroke={wishlisted ? 'var(--color-rose-dark)' : 'var(--color-text-muted)'} strokeWidth={1.5} />
                    </button>
                    <div className="image-container" onClick={() => navigate(`/product/${product._id}`)}>
                      <img src={product.imageUrl} alt={product.name} loading="lazy" width={560} height={560} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button className="btn-icon" onClick={(e) => handleAddToCart(e, product)} style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'var(--color-burgundy)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} aria-label="Add to cart">
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="details-panel">
                      <div onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
                        <h3 style={{ fontSize: '1.3rem', marginTop: 4, marginBottom: 8, color: 'var(--color-burgundy)' }}>{product.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                          <Star size={14} fill="var(--color-gold)" stroke="none" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{product.rating}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>({product.reviewsCount})</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Wishlist preview (logged-in users with saved items) */}
      {user && (
        <WishlistPreview token={user.token} onAddToCart={(product) => { addToCart(product, 1, '100ml'); toast.success(`${product.name} added to cart.`); }} />
      )}

      {/* 6. Promo Banner */}
      <section style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'var(--color-burgundy)', zIndex: -1 }} />
        <div className="container" style={{ textAlign: 'center', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
          <h2 className="serif-title-medium" style={{ color: 'var(--color-rose-light)' }}>Scent of Elegance</h2>
          <p style={{ maxWidth: 600, fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.8 }}>
            "A fragrance is a masterpiece that stays with you long after you've gone. Rediscover your personal aura today."
          </p>
          <Link to="/shop" className="btn btn-gold" style={{ letterSpacing: '0.1em' }}>Shop Collection Now</Link>
        </div>
      </section>

      {/* 7. Testimonials & Trust Badges */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="about-grid">
            <TestimonialsCarousel />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              {[
                { Icon: Truck,       title: 'Free Express Shipping', text: 'Complimentary express delivery on all orders over $99.' },
                { Icon: Shield,      title: '100% Secure Payments',  text: 'Encrypted transaction servers integrated directly with Stripe.' },
                { Icon: CheckCircle, title: 'Satisfied Returns',     text: "Hassle-free returns within 30 days if you're not fully satisfied." },
              ].map(({ Icon, title, text }) => (
                <div key={title} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--color-rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @media (max-width: 768px) {
          .hero-grid, .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-bottle-hover { transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default Home;
