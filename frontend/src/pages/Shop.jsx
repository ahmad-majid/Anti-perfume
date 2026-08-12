import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, SlidersHorizontal, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { SkeletonCardGrid } from '../components/Skeleton';
import SearchAutocomplete from '../components/SearchAutocomplete';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'All') queryParams.append('category', category);
        if (sort) queryParams.append('sort', sort);

        const response = await fetch(`http://localhost:5000/api/products?${queryParams.toString()}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching shop products:', error);
        toast.error('Could not load the collection. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort]); // eslint-disable-line

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1, '100ml');
    toast.success(`${product.name} added to cart.`);
  };

  const handleWishlist = async (e, product) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const added = await toggle(product);
    if (added) toast.success(`${product.name} saved to wishlist.`);
    else toast.info(`${product.name} removed from wishlist.`);
  };

  return (
    <div className="container animate-fade" style={{ paddingTop: 40, minHeight: '80vh' }}>

      {/* Page title */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Anti Boutique</span>
        <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 8 }}>The Fragrance Collection</h2>
        <div style={{ width: 60, height: 2, backgroundColor: 'var(--color-gold)', margin: '16px auto 0' }} />
      </div>

      {/* Filter / search controls */}
      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderRadius: 16, marginBottom: 40, gap: 20 }}>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Floral', 'Woody', 'Citrus', 'Amber', 'Fresh'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 18px', borderRadius: 30,
                border: category === cat ? 'none' : '1px solid rgba(106,91,83,0.2)',
                backgroundColor: category === cat ? 'var(--color-burgundy)' : 'transparent',
                color: category === cat ? 'white' : 'var(--color-text-primary)',
                fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search autocomplete + sort */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <SearchAutocomplete />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={16} color="var(--color-text-secondary)" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: 30, border: '1px solid rgba(106,91,83,0.2)', fontSize: '0.85rem', backgroundColor: 'transparent', outline: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontStyle: 'italic', marginBottom: 16 }}>No fragrances matched your selection.</p>
          <button className="btn btn-secondary" onClick={() => setCategory('All')}>Reset Filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
          {products.map((product) => {
            const wishlisted = isWishlisted(product._id);
            return (
              <div key={product._id} className="perfume-card" style={{ position: 'relative' }}>
                {/* Wishlist heart */}
                <button
                  onClick={(e) => handleWishlist(e, product)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{
                    position: 'absolute', top: 12, left: 12, zIndex: 10,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(106,91,83,0.12)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <Heart
                    size={15}
                    fill={wishlisted ? 'var(--color-rose-dark)' : 'none'}
                    stroke={wishlisted ? 'var(--color-rose-dark)' : 'var(--color-text-muted)'}
                    strokeWidth={1.5}
                  />
                </button>

                {/* Image */}
                <div className="image-container" onClick={() => navigate(`/product/${product._id}`)}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    width={560}
                    height={560}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Add to cart quick button */}
                  <button
                    className="btn-icon"
                    onClick={(e) => handleAddToCart(e, product)}
                    style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'var(--color-burgundy)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    aria-label="Add to cart"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Details */}
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

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
};

export default Shop;
