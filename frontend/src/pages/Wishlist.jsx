import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { SkeletonCardGrid } from '../components/Skeleton';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login?redirect=wishlist'); return; }
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load your wishlist.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId, productName) => {
    try {
      await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.info(`${productName} removed from wishlist.`);
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1, '100ml');
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <div className="container animate-fade" style={{ paddingTop: 60, minHeight: '80vh' }}>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
          Your Curated List
        </span>
        <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Heart size={28} fill="var(--color-rose-dark)" stroke="none" />
          My Wishlist
        </h2>
        <div style={{ width: 60, height: 2, backgroundColor: 'var(--color-gold)', margin: '16px auto 0' }} />
      </div>

      {loading ? (
        <SkeletonCardGrid count={4} />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', border: '1px dashed rgba(106,91,83,0.3)', borderRadius: 16, color: 'var(--color-text-secondary)' }}>
          <Heart size={48} color="var(--color-text-muted)" strokeWidth={1} style={{ marginBottom: 16 }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', marginBottom: 16 }}>
            Your wishlist is empty.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>
            Explore the Collection
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 30 }}>
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
            {products.map((product) => (
              <div key={product._id} className="perfume-card" style={{ position: 'relative' }}>
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(product._id, product.name)}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    zIndex: 10,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(176,92,92,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-fast)',
                  }}
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={15} color="var(--color-error)" />
                </button>

                {/* Image */}
                <div
                  className="image-container"
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div className="details-panel">
                  <div onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {product.category}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', marginTop: 4, marginBottom: 8, color: 'var(--color-burgundy)' }}>
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                      <Star size={13} fill="var(--color-gold)" stroke="none" />
                      <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{product.rating}</span>
                      <span style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>({product.reviewsCount})</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product)}
                      style={{ padding: '10px 18px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
