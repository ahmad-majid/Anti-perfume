import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, Truck, RotateCcw, ShieldCheck, ArrowRight, HeartHandshake, Globe } from 'lucide-react';

const WhyUsSection = () => {
  return (
    <section style={{ padding: '80px 0 60px', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid rgba(106,91,83,0.08)' }}>
      <div className="container">

        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.4rem',
              color: 'var(--color-burgundy)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            WHY ANTI LUXURY
          </h2>
          <div style={{ width: 60, height: 2, backgroundColor: 'var(--color-gold)', margin: '12px auto 0' }} />
        </div>

        {/* 3 Feature Cards Grid (Matching Reference) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 30,
            marginBottom: 48,
          }}
          className="why-us-grid"
        >
          {/* Card 1: Imported Perfume Oils */}
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#F5F5F7',
              borderRadius: 16,
              padding: '44px 30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(106,91,83,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                color: 'var(--color-burgundy)',
              }}
            >
              <Gem size={34} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-burgundy)', marginBottom: 8 }}>
              Imported Perfume Oils
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 240 }}>
              Premium perfumes that our customers love
            </p>
          </div>

          {/* Card 2: Delivery */}
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#F5F5F7',
              borderRadius: 16,
              padding: '44px 30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(106,91,83,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                color: 'var(--color-burgundy)',
              }}
            >
              <Globe size={34} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-burgundy)', marginBottom: 8 }}>
              Delivery
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 240 }}>
              Free Shipping all across Pakistan
            </p>
          </div>

          {/* Card 3: Easy Refund */}
          <div
            className="glass-panel"
            style={{
              backgroundColor: '#F5F5F7',
              borderRadius: 16,
              padding: '44px 30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(106,91,83,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                color: 'var(--color-burgundy)',
              }}
            >
              <HeartHandshake size={34} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-burgundy)', marginBottom: 8 }}>
              Easy Refund
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 240 }}>
              Return and Refunds within 15 Days
            </p>
          </div>
        </div>

        {/* Center Action Button */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#1E1E24',
              color: 'white',
              padding: '16px 40px',
              borderRadius: 8,
              fontSize: '0.86rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
            className="explore-btn-hover"
          >
            EXPLORE OUR COLLECTION <ArrowRight size={15} />
          </Link>
        </div>

        {/* Bottom Trust Assurance Strip */}
        <div
          style={{
            borderTop: '1px solid rgba(106,91,83,0.12)',
            paddingTop: 32,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 40,
            flexWrap: 'wrap',
            textAlign: 'center',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={18} color="var(--color-burgundy)" />
            <span>Free Shipping All Across Pakistan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RotateCcw size={18} color="var(--color-burgundy)" />
            <span>15-Day Easy Returns</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} color="var(--color-burgundy)" />
            <span>Secure Checkout</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyUsSection;
