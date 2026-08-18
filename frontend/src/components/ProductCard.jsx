import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Heart, Flame } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const wishlisted = isWishlisted(product._id);
  const hoverImg = product.hoverImageUrl || product.imageUrl;

  // Calculate discount percentage (e.g. 23% OFF, 10% OFF)
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.saleId && typeof product.saleId === 'object' && product.saleId?.discountPercent
      ? product.saleId.discountPercent
      : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1, '100ml');
    toast.success(`${product.name} added to cart.`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const added = await toggle(product);
    if (added) {
      toast.success(`${product.name} saved to wishlist.`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  return (
    <div
      className="perfume-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(106, 91, 83, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, background 0.2s ease',
        }}
      >
        <Heart
          size={16}
          fill={wishlisted ? 'var(--color-rose-dark)' : 'none'}
          stroke={wishlisted ? 'var(--color-rose-dark)' : 'var(--color-text-muted)'}
          strokeWidth={1.5}
        />
      </button>

      {/* Percentage OFF badge (e.g. 23% OFF / 10% OFF) or Sale Campaign Badge */}
      {discountPercent && discountPercent > 0 ? (
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            background: 'linear-gradient(135deg, #A82C2C, #7A1C1C)',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 20,
            letterSpacing: '0.04em',
            boxShadow: '0 4px 12px rgba(168, 44, 44, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Flame size={12} fill="#FFE082" color="#FFE082" />
          {discountPercent}% OFF
        </span>
      ) : product.saleId ? (
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            background: 'linear-gradient(135deg, #A82C2C, var(--color-burgundy))',
            color: 'white',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 20,
            letterSpacing: '0.04em',
            boxShadow: '0 2px 8px rgba(168,44,44,0.3)',
          }}
        >
          {typeof product.saleId === 'object' && product.saleId?.name ? product.saleId.name : 'SALE 🔥'}
        </span>
      ) : null}

      {/* Dual Image Container with Smooth Fade Transition */}
      <div
        className="image-container"
        onClick={() => navigate(`/product/${product._id}`)}
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', aspectRatio: '1' }}
      >
        {/* Primary Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
            opacity: isHovered ? 0 : 1,
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />

        {/* Secondary / Hover Image */}
        <img
          src={hoverImg}
          alt={`${product.name} view 2`}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1.06)' : 'scale(1.02)',
          }}
        />

        {/* Quick Add To Cart Button */}
        {product.stock > 0 ? (
          <button
            className="btn-icon"
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              zIndex: 10,
              backgroundColor: 'var(--color-burgundy)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              width: 38,
              height: 38,
            }}
            aria-label="Add to cart"
          >
            <Plus size={18} />
          </button>
        ) : (
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              zIndex: 10,
              backgroundColor: 'var(--color-text-muted)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: 20,
              letterSpacing: '0.05em',
            }}
          >
            SOLD OUT
          </div>
        )}
      </div>

      {/* Details Panel */}
      <div className="details-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
        <div onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            {product.category}
          </span>
          <h3 style={{ fontSize: '1.2rem', marginTop: 4, marginBottom: 6, color: 'var(--color-burgundy)', fontWeight: 600 }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <Star size={13} fill="var(--color-gold)" stroke="none" />
            <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{product.rating}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing area in PKR with strike-through and savings tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
            Rs. {Number(product.price).toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
              Rs. {Number(product.originalPrice).toLocaleString()}
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span style={{ fontSize: '0.76rem', color: '#A82C2C', fontWeight: 700, background: 'rgba(168,44,44,0.1)', padding: '2px 6px', borderRadius: 6 }}>
              Save {discountPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
