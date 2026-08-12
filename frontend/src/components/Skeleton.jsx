import React from 'react';

/**
 * Skeleton — shimmer loading placeholder.
 *
 * Usage:
 *   <Skeleton width="100%" height={200} borderRadius={16} />
 *   <Skeleton variant="text" lines={3} />
 *   <Skeleton variant="card" count={4} />
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0e8e0 25%, #faf0e8 50%, #f0e8e0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 8,
};

// Single rectangular block
const SkeletonBlock = ({ width = '100%', height = 20, borderRadius = 8, style = {} }) => (
  <div style={{ ...shimmerStyle, width, height, borderRadius, flexShrink: 0, ...style }} />
);

// Text variant — N stacked lines
const SkeletonText = ({ lines = 3, gap = 10 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBlock
        key={i}
        height={14}
        width={i === lines - 1 ? '65%' : '100%'}
      />
    ))}
  </div>
);

// Perfume product card variant
const SkeletonCard = () => (
  <div
    style={{
      background: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(245,236,225,0.5)',
      boxShadow: '0 4px 20px rgba(44,34,30,0.04)',
    }}
  >
    {/* Image area */}
    <SkeletonBlock height={280} borderRadius={0} />
    {/* Details */}
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonBlock height={12} width="40%" />
      <SkeletonBlock height={22} width="75%" />
      <SkeletonBlock height={14} width="50%" />
      <SkeletonBlock height={18} width="35%" />
    </div>
  </div>
);

// Grid of card skeletons
const SkeletonCardGrid = ({ count = 4 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 30,
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Order row variant
const SkeletonOrderRow = () => (
  <div
    style={{
      background: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(106,91,83,0.1)',
    }}
  >
    <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', display: 'flex', gap: 32 }}>
      <SkeletonBlock height={14} width={80} />
      <SkeletonBlock height={14} width={100} />
      <SkeletonBlock height={14} width={70} />
    </div>
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <SkeletonBlock width={50} height={50} borderRadius={8} style={{ flexShrink: 0 }} />
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock height={14} width="60%" />
            <SkeletonBlock height={12} width="40%" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Skeleton = ({ variant = 'block', count, lines, width, height, borderRadius, style }) => {
  if (variant === 'card')      return <SkeletonCardGrid count={count || 4} />;
  if (variant === 'text')      return <SkeletonText lines={lines || 3} />;
  if (variant === 'order-row') return <SkeletonOrderRow />;
  return <SkeletonBlock width={width} height={height} borderRadius={borderRadius} style={style} />;
};

export default Skeleton;
export { SkeletonBlock, SkeletonText, SkeletonCard, SkeletonCardGrid, SkeletonOrderRow };
