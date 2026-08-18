import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const DiscountedProductsCarousel = ({ products = [] }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter only products that have discounts
  const discountedProducts = products.filter(
    (p) => (p.originalPrice && p.originalPrice > p.price) || (p.saleId && p.saleId !== null)
  );

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  if (discountedProducts.length === 0) return null;

  return (
    <section style={{ padding: '75px 0 90px', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
      <div className="container">

        {/* Centered Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              color: '#A82C2C',
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(168,44,44,0.1)',
              padding: '4px 14px',
              borderRadius: 20,
            }}
          >
            <Flame size={14} fill="#A82C2C" color="#A82C2C" /> MEGA DEALS & DISCOUNTS
          </span>
          <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 4, marginBottom: 4 }}>
            Exclusive Limited-Time Offers
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.96rem', lineHeight: 1.6 }}>
            Handcrafted signature perfumes available at exclusive discounted promotional prices.
          </p>

          {/* Carousel Arrows & View All */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous discounted products"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '1px solid rgba(106,91,83,0.15)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                cursor: canScrollLeft ? 'pointer' : 'default',
                opacity: canScrollLeft ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-burgundy)',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--color-burgundy)',
                fontWeight: 700,
                fontSize: '0.86rem',
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(89,53,48,0.08)',
              }}
            >
              View All Deals <ArrowRight size={14} />
            </Link>

            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next discounted products"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '1px solid rgba(106,91,83,0.15)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                cursor: canScrollRight ? 'pointer' : 'default',
                opacity: canScrollRight ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-burgundy)',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Scroll Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          style={{
            display: 'flex',
            gap: 24,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: 16,
            paddingTop: 8,
          }}
          className="discounted-carousel-track"
        >
          {discountedProducts.map((product) => (
            <div
              key={product._id}
              style={{
                flex: '0 0 calc(25% - 18px)',
                minWidth: '260px',
                scrollSnapAlign: 'start',
              }}
              className="discounted-carousel-card-wrap"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .discounted-carousel-track::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          .discounted-carousel-card-wrap {
            flex: 0 0 calc(33.333% - 16px) !important;
          }
        }
        @media (max-width: 768px) {
          .discounted-carousel-card-wrap {
            flex: 0 0 calc(50% - 12px) !important;
            min-width: 200px !important;
          }
        }
        @media (max-width: 480px) {
          .discounted-carousel-card-wrap {
            flex: 0 0 calc(80% - 10px) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default DiscountedProductsCarousel;
