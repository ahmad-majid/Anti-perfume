import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ArrowLeft, ShoppingBag, Wind, Heart } from 'lucide-react';
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
  const [size, setSize] = useState('100ml');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        // Default to first available size
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
              {[1,2,3].map(i => <SkeletonBlock key={i} height={80} borderRadius={12} />)}
            </div>
          </div>
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', minHeight: '80vh' }}>
        <h3 className="serif-title-small" style={{ color: 'var(--color-error)' }}>Fragrance Not Found</h3>
        <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>The requested luxury item does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-secondary" style={{ marginTop: 24 }}>Back to Collection</Link>
      </div>
    );
  }

  const displayPrice = size === '50ml' ? product.price - 25.00 : product.price;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    addToCart({ ...product, price: displayPrice }, quantity, size);
    toast.success(`${quantity}× ${product.name} (${size}) added to your cart.`);
  };

  const handleWishlistToggle = async () => {
    if (!user) { navigate('/login'); return; }
    const added = await toggle(product);
    if (added) toast.success(`${product.name} saved to wishlist.`);
    else toast.info(`${product.name} removed from wishlist.`);
  };

  return (
    <div className="container animate-fade" style={{ paddingTop: 60, minHeight: '80vh' }}>

      {/* Back button */}
      <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', marginBottom: 40, fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Collection
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'flex-start' }} className="detail-grid">

        {/* Left: Product Image */}
        <div style={{ position: 'relative' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 24, overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(106,91,83,0.1)', boxShadow: '0 12px 32px var(--color-shadow)' }}>
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              width={600}
              height={600}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {product.featured && (
            <span style={{ position: 'absolute', top: 20, left: 20, background: 'var(--color-gold)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '6px 16px', borderRadius: 30, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Signature Scent
            </span>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                {product.category} Collection
              </span>
              {/* Wishlist heart */}
              <button
                onClick={handleWishlistToggle}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                style={{ border: 'none', background: wishlisted ? 'rgba(166,110,99,0.1)' : 'transparent', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition-fast)', flexShrink: 0 }}
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
                  <Star key={i} size={16}
                    fill={i < Math.floor(product.rating) ? 'var(--color-gold)' : 'none'}
                    stroke={i < Math.floor(product.rating) ? 'none' : 'var(--color-gold)'}
                  />
                ))}
                <span style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: 6 }}>{product.rating}</span>
              </div>
              <span style={{ width: 1, height: 14, backgroundColor: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{product.reviewsCount} customer reviews</span>
            </div>
          </div>

          {/* Price */}
          <div style={{ borderTop: '1px solid rgba(106,91,83,0.1)', borderBottom: '1px solid rgba(106,91,83,0.1)', padding: '16px 0' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-burgundy)' }}>
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
            {product.description}
          </p>

          {/* Fragrance notes */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wind size={14} /> Fragrance Profile
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[['Top Notes', product.notes.top], ['Heart Notes', product.notes.middle], ['Base Notes', product.notes.base]].map(([label, value]) => (
                <div key={label} className="glass-panel" style={{ padding: 16, borderRadius: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>{label}</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 6 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 12, fontWeight: 600 }}>Select Size</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} style={{ padding: '12px 24px', borderRadius: 30, border: size === s ? 'none' : '1px solid rgba(106,91,83,0.2)', backgroundColor: size === s ? 'var(--color-burgundy)' : 'transparent', color: size === s ? 'white' : 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(106,91,83,0.2)', borderRadius: 30, padding: '6px 16px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 6 }}><Minus size={14} /></button>
              <span style={{ margin: '0 16px', fontSize: '1rem', fontWeight: 600, width: 20, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 6 }}><Plus size={14} /></button>
            </div>
            <button onClick={handleAddToCart} className="btn btn-primary" style={{ flexGrow: 1, display: 'inline-flex', gap: 12, letterSpacing: '0.1em' }}>
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>

          <span style={{ fontSize: '0.85rem', color: product.stock > 10 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
            {product.stock > 10 ? `In Stock (${product.stock} available)` : `Low Stock — Only ${product.stock} left!`}
          </span>
        </div>
      </div>

      {/* Related Products carousel */}
      <RelatedProducts currentProductId={product._id} category={product.category} />

      {/* Reviews section */}
      <ReviewSection productId={product._id} />

      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
};

export default ProductDetail;
