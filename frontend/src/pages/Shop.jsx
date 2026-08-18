import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Flame, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SkeletonCardGrid } from '../components/Skeleton';
import SearchAutocomplete from '../components/SearchAutocomplete';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSaleId = searchParams.get('saleId') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [saleId, setSaleId] = useState(initialSaleId);
  const [sort, setSort] = useState('newest');
  const [activeSales, setActiveSales] = useState([]);
  const [siteConfig, setSiteConfig] = useState(null);
  const { toast } = useToast();

  // Sync state whenever URL search params change (e.g. from navbar clicks or back/forward navigation)
  useEffect(() => {
    const qCat = searchParams.get('category');
    const qSale = searchParams.get('saleId');
    setCategory(qCat || 'All');
    setSaleId(qSale || 'All');
  }, [searchParams]);

  // Fetch active sales and categories from site config
  useEffect(() => {
    fetch('http://localhost:5000/api/sales/active')
      .then((r) => r.json())
      .then((data) => setActiveSales(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('http://localhost:5000/api/site-config')
      .then((r) => r.json())
      .then((data) => setSiteConfig(data))
      .catch(() => {});
  }, []);

  // Fetch products based on category, saleId, sort
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'All') queryParams.append('category', category);
        if (saleId && saleId !== 'All') queryParams.append('saleId', saleId);
        if (sort) queryParams.append('sort', sort);

        const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching shop products:', error);
        toast.error('Could not load the collection. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, saleId, sort]); // eslint-disable-line

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setSaleId('All');
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleSaleSelect = (sale) => {
    setSaleId(sale._id);
    setCategory('All');
    setSearchParams({ saleId: sale._id });
  };

  const categories = siteConfig?.navbarCategories?.length > 0
    ? ['All', ...siteConfig.navbarCategories.filter((c) => c.isVisible !== false).map((c) => c.name)]
    : ['All', 'Floral', 'Woody', 'Citrus', 'Amber', 'Fresh', 'Oriental', 'Gourmand'];

  return (
    <div className="container animate-fade" style={{ paddingTop: 40, minHeight: '80vh', paddingBottom: 80 }}>
      {/* Page title */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} /> Anti Haute Parfumerie
        </span>
        <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 8 }}>
          {saleId !== 'All'
            ? `${activeSales.find((s) => s._id === saleId)?.name || 'Special Sale'} Collection`
            : category !== 'All'
            ? `${category} Fragrances`
            : 'The Fragrance Collection'}
        </h2>
        <div style={{ width: 60, height: 2, backgroundColor: 'var(--color-gold)', margin: '16px auto 0' }} />
      </div>

      {/* Filter / search controls */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 28px',
          borderRadius: 18,
          marginBottom: 40,
          gap: 20,
        }}
      >
        {/* Category filters & Active Sales Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.map((cat) => {
            const isSelected = category.toLowerCase() === cat.toLowerCase() && saleId === 'All';
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 30,
                  border: isSelected ? 'none' : '1px solid rgba(106,91,83,0.2)',
                  backgroundColor: isSelected ? 'var(--color-burgundy)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--color-text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            );
          })}

          {/* Active Sales filter pills */}
          {activeSales.map((sale) => {
            const isSelected = saleId === sale._id;
            return (
              <button
                key={sale._id}
                onClick={() => handleSaleSelect(sale)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 30,
                  border: 'none',
                  background: isSelected
                    ? 'linear-gradient(135deg, #A82C2C, var(--color-burgundy))'
                    : 'rgba(168,44,44,0.12)',
                  color: isSelected ? 'white' : '#A82C2C',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'var(--transition-fast)',
                }}
              >
                <Flame size={13} /> {sale.name}
              </button>
            );
          })}
        </div>

        {/* Search autocomplete + sort */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <SearchAutocomplete />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={16} color="var(--color-text-secondary)" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 30,
                border: '1px solid rgba(106,91,83,0.2)',
                fontSize: '0.85rem',
                backgroundColor: 'transparent',
                outline: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product grid with dual-image hover transition */}
      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontStyle: 'italic', marginBottom: 16 }}>
            No fragrances found for {category !== 'All' ? `category "${category}"` : 'this selection'}.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => handleCategorySelect('All')}
          >
            Show All Fragrances
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
