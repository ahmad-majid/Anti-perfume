import React, { useState } from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SatisfiedCustomersCarousel = ({ testimonials = [] }) => {
  const [startIndex, setStartIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, testimonials.length - 1) : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section style={{ padding: '90px 0', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
      <div className="container">

        {/* Header matching screenshot */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', letterSpacing: '0.04em' }}>
            SATISFIED CUSTOMERS
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="var(--color-gold)" stroke="none" />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>4.87 ★</span>
            <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>(127)</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 600, marginLeft: 6 }}>
              <CheckCircle size={14} /> Verified
            </span>
          </div>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: -20,
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid rgba(106,91,83,0.15)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-burgundy)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Testimonial Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              width: '100%',
            }}
            className="testimonials-photo-grid"
          >
            {testimonials.map((t, idx) => (
              <div
                key={t._id || idx}
                className="glass-panel"
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'white',
                  boxShadow: '0 10px 30px rgba(44,34,30,0.06)',
                  border: '1px solid rgba(106,91,83,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {/* Customer Photo / Unboxing Image */}
                <div style={{ width: '100%', height: 220, overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
                  <img
                    src={t.customerPhoto || '/images/floral_musk.jpg'}
                    alt={t.author}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', gap: 16 }}>
                  
                  {/* Quote text */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, textAlign: 'center', minHeight: 65 }}>
                    "{t.quote}"
                  </p>

                  {/* Rating Stars */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="var(--color-gold)" stroke="none" />
                    ))}
                  </div>

                  {/* Customer Name & Verified Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {t.author}
                      {t.isVerified !== false && (
                        <CheckCircle size={14} color="var(--color-success)" fill="var(--color-success)" style={{ color: 'white' }} />
                      )}
                    </h4>
                  </div>

                  {/* Perfume Variant Tag */}
                  {t.perfumeVariant && (
                    <div style={{ textAlign: 'center', marginTop: 2 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.74rem',
                          color: 'var(--color-text-muted)',
                          background: 'var(--bg-secondary)',
                          padding: '4px 12px',
                          borderRadius: 20,
                          border: '1px solid rgba(106,91,83,0.1)',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.perfumeVariant}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: -20,
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid rgba(106,91,83,0.15)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-burgundy)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            aria-label="Next testimonial"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-photo-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default SatisfiedCustomersCarousel;
