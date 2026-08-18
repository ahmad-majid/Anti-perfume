import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ArrowLeft, ShoppingBag, Wind, Heart, Sparkles, Flame, MessageCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import RelatedProducts from '../components/RelatedProducts';
import { SkeletonBlock } from '../components/Skeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('100ml');
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.imageUrl);
        if (data.sizes?.length) setSize(data.sizes[data.sizes.length - 1]);
      } catch (error) {
        console.error('Error fetching product detail:', error);
        toast.error('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]); // eslint-disable-line

  // Scroll listener for sticky mobile Add to Cart bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 420) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="container animate-fade" style={{ paddingTop: 60, minHeight: '80vh' }}>
        <SkeletonBlock height={16} width={120} style={{ marginBottom: 40 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60 }} className="detail-grid">
          <SkeletonBlock height={480} borderRadius={24} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SkeletonBlock height={16} width="40%" />
            <SkeletonBlock height={48} width="80%" />
            <SkeletonBlock height={20} width="50%" />
            <SkeletonBlock height={36} width="35%" />
            <SkeletonBlock height={80} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} height={80} borderRadius={12} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', minHeight: '80vh' }}>
        <h3 className="serif-title-small" style={{ color: 'var(--color-error)' }}>Fragrance Not Found</h3>
        <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>
          The requested luxury item does not exist or has been removed.
        </p>
        <Link to="/shop" className="btn btn-secondary" style={{ marginTop: 24 }}>
          Back to Collection
        </Link>
      </div>
    );
  }

  // Adjust price for 50ml vs 100ml in PKR
  const priceAdjustment = size === '50ml' ? 800 : 0;
  const displayPrice = Math.max(product.price - priceAdjustment, 1000);
  const wishlisted = isWishlisted(product._id);
  const images = [product.imageUrl, product.hoverImageUrl].filter(Boolean);

  const handleAddToCart = () => {
    addToCart({ ...product, price: displayPrice }, quantity, size);
    toast.success(`${quantity}× ${product.name} (${size}) added to your cart.`);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const added = await toggle(product);
    if (added) toast.success(`${product.name} saved to wishlist.`);
    else toast.info(`${product.name} removed from wishlist.`);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > displayPrice;
  const savings = hasDiscount ? (product.originalPrice - displayPrice).toLocaleString() : null;
  const pct = hasDiscount ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100) : null;

  // WhatsApp Order URL
  const whatsappOrderUrl = `https://wa.me/923141774008?text=${encodeURIComponent(
    `Assalam-o-Alaikum Anti Luxury Fragrances,\n\nI would like to order:\n• Perfume: ${product.name}\n• Bottle Size: ${size}\n• Quantity: ${quantity}\n• Price: Rs. ${(displayPrice * quantity).toLocaleString()}\n\nPlease confirm my order and share delivery details.`
  )}`;

  return (
    <div className="container animate-fade" style={{ paddingTop: 50, minHeight: '80vh', paddingBottom: 80 }}>

      {/* Breadcrumb / Back button */}
      <Link
        to="/shop"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--color-text-secondary)',
          marginBottom: 36,
          fontWeight: 500,
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} /> Back to All Fragrances
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'flex-start' }} className="detail-grid">

        {/* Left: Dual Image Gallery with Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 24,
              overflow: 'hidden',
              aspectRatio: '1',
              border: '1px solid rgba(106,91,83,0.1)',
              boxShadow: '0 12px 32px var(--color-shadow)',
              position: 'relative',
            }}
          >
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              loading="eager"
              width={600}
              height={600}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
            />

            {/* Sale / Featured Badge */}
            {product.saleId ? (
              <span
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  background: 'linear-gradient(135deg, #A82C2C, var(--color-burgundy))',
                  color: 'white',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 16px',
                  borderRadius: 30,
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 4px 12px rgba(168,44,44,0.3)',
                }}
              >
                <Flame size={14} fill="#FFE082" color="#FFE082" />
                {typeof product.saleId === 'object' && product.saleId?.name ? product.saleId.name : 'ON SALE'}
              </span>
            ) : product.featured ? (
              <span
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  background: 'var(--color-gold)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 16px',
                  borderRadius: 30,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Signature Scent
              </span>
            ) : null}
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 14 }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid var(--color-burgundy)' : '2px solid transparent',
                    boxShadow: selectedImage === img ? '0 0 0 3px rgba(89,53,48,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                {product.category} Collection
              </span>
              <button
                onClick={handleWishlistToggle}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                style={{
                  border: 'none',
                  background: wishlisted ? 'rgba(166,110,99,0.12)' : 'rgba(106,91,83,0.06)',
                  borderRadius: '50%',
                  width: 44,
                  height: 44,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)',
                  flexShrink: 0,
                }}
              >
                <Heart
                  size={22}
                  fill={wishlisted ? 'var(--color-rose-dark)' : 'none'}
                  stroke={wishlisted ? 'var(--color-rose-dark)' : 'var(--color-text-muted)'}
                  strokeWidth={1.5}
                />
              </button>
            </div>
            <h1 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 8, marginBottom: 12 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating || 5) ? 'var(--color-gold)' : 'none'}
                    stroke={i < Math.floor(product.rating || 5) ? 'none' : 'var(--color-gold)'}
                  />
                ))}
                <span style={{ fontSize: '0.92rem', fontWeight: 700, marginLeft: 6 }}>{product.rating || 5.0}</span>
              </div>
              <span style={{ width: 1, height: 14, backgroundColor: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                {product.reviews?.length || product.reviewsCount || 1} verified customer reviews
              </span>
            </div>
          </div>

          {/* Price & Savings in PKR */}
          <div style={{ borderTop: '1px solid rgba(106,91,83,0.1)', borderBottom: '1px solid rgba(106,91,83,0.1)', padding: '16px 0', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.3rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
              Rs. {Number(displayPrice).toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                  Rs. {Number(product.originalPrice).toLocaleString()}
                </span>
                <span style={{ background: 'linear-gradient(135deg, #A82C2C, #7A1C1C)', color: 'white', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={13} fill="#FFE082" color="#FFE082" />
                  {pct}% OFF
                </span>
                <span style={{ fontSize: '0.86rem', color: 'var(--color-success)', fontWeight: 700 }}>
                  (Save Rs. {savings})
                </span>
              </>
            )}
          </div>

          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
            {product.description}
          </p>

          {/* Fragrance notes */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wind size={14} /> Olfactory Notes
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[['Top Notes', product.notes.top], ['Heart Notes', product.notes.middle], ['Base Notes', product.notes.base]].map(([label, value]) => (
                <div key={label} className="glass-panel" style={{ padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 700 }}>{label}</span>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: 4 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 12, fontWeight: 700 }}>
              Bottle Size
            </h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    padding: '12px 26px',
                    borderRadius: 30,
                    border: size === s ? 'none' : '1px solid rgba(106,91,83,0.2)',
                    backgroundColor: size === s ? 'var(--color-burgundy)' : 'transparent',
                    color: size === s ? 'white' : 'var(--color-text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart + WhatsApp Order */}
          {product.stock <= 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button disabled className="btn" style={{ width: '100%', padding: '16px 28px', backgroundColor: 'var(--color-text-muted)', color: 'white', border: 'none', cursor: 'not-allowed', letterSpacing: '0.08em', borderRadius: '30px', fontWeight: 700 }}>
                OUT OF STOCK
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(106,91,83,0.2)', borderRadius: 30, padding: '6px 16px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 6 }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ margin: '0 16px', fontSize: '1rem', fontWeight: 700, width: 20, textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 6, opacity: quantity >= product.stock ? 0.3 : 1, pointerEvents: quantity >= product.stock ? 'none' : 'auto' }}
                    aria-label="Increase quantity"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Standard Add To Cart */}
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{ flexGrow: 1, display: 'inline-flex', gap: 12, letterSpacing: '0.08em', padding: '16px 28px', minWidth: '180px', justifyContent: 'center' }}
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              </div>

              {/* 1-Click WhatsApp Direct Order Button (Item 1) */}
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-order-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: 30,
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                  transition: 'transform 0.2s, background 0.2s',
                }}
              >
                <MessageCircle size={20} fill="white" stroke="none" />
                Order on WhatsApp (Instant Confirmation)
              </a>
            </div>
          )}

          <span style={{ fontSize: '0.86rem', color: product.stock > 10 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
            {product.stock > 10 ? `✓ In Stock (${product.stock} bottles available for dispatch)` : product.stock > 0 ? `⚠️ Low Stock — Only ${product.stock} left!` : `❌ Out of Stock`}
          </span>
        </div>
      </div>

      {/* Related Products carousel */}
      <RelatedProducts currentProductId={product._id} category={product.category} />

      {/* Verified Customer Reviews section (Item 7) */}
      <ReviewSection productId={product._id} initialReviews={product.reviews || []} />

      {/* Sticky Mobile Add to Cart Bar (Item 5) */}
      {showStickyBar && product.stock > 0 && (
        <div
          className="sticky-mobile-cart-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(106,91,83,0.15)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
            padding: '10px 16px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            animation: 'slideUp 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-burgundy)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>
                {product.name}
              </h4>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Rs. {Number(displayPrice).toLocaleString()} ({size})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ padding: '10px 16px', fontSize: '0.82rem', borderRadius: 20 }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <style>{`
        .whatsapp-order-btn:hover {
          background-color: #1EBE5D !important;
          transform: translateY(-2px);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .sticky-mobile-cart-bar { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
