import React, { useState, useEffect, useContext } from 'react';
import { Star, User, CheckCircle, MessageSquarePlus, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StarInput = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 3, transition: 'transform 0.15s ease' }}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        <Star
          size={26}
          fill={star <= value ? 'var(--color-gold)' : 'none'}
          stroke={star <= value ? 'var(--color-gold)' : 'rgba(106,91,83,0.3)'}
          strokeWidth={1.5}
        />
      </button>
    ))}
  </div>
);

const StarDisplay = ({ value, size = 15 }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        fill={star <= Math.round(value) ? 'var(--color-gold)' : 'none'}
        stroke={star <= Math.round(value) ? 'none' : 'rgba(106,91,83,0.25)'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

const ReviewSection = ({ productId, initialReviews = [] }) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(user?.username || '');
  const [comment, setComment] = useState('');
  const [variant, setVariant] = useState('100ml Eau de Parfum');
  const [formOpen, setFormOpen] = useState(false);

  const fetchProductReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.username && !name) {
      setName(user.username);
    }
  }, [user, name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Please enter your name.'); return; }
    if (!rating) { toast.warning('Please select a star rating.'); return; }
    if (comment.trim().length < 5) { toast.warning('Comment must be at least 5 characters.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim(), variant }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Failed to submit review.');
      } else {
        toast.success('Thank you! Your verified review has been posted.');
        setComment('');
        setFormOpen(false);
        fetchProductReviews();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div style={{ marginTop: 70, paddingTop: 40, borderTop: '1px solid rgba(106,91,83,0.1)' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={13} /> Verified Customer Feedback
          </span>
          <h3 className="serif-title-small" style={{ color: 'var(--color-burgundy)', margin: 0 }}>
            Customer Reviews & Experiences
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <StarDisplay value={Number(avgRating)} size={18} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-burgundy)' }}>
              {avgRating} / 5.0
            </span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.86rem' }}>
              ({reviews.length} {reviews.length === 1 ? 'customer review' : 'customer reviews'})
            </span>
          </div>
        </div>

        {!formOpen && (
          <button
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
            style={{ fontSize: '0.86rem', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <MessageSquarePlus size={16} /> Write a Review
          </button>
        )}
      </div>

      {/* Review Submission Form */}
      {formOpen && (
        <div
          className="glass-panel"
          style={{ padding: '30px', borderRadius: 20, marginBottom: 36, border: '1px solid rgba(197,160,89,0.3)', backgroundColor: '#FFFFFF' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-burgundy)', margin: 0 }}>
              Share Your Fragrance Experience
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Required fields are marked *</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Purchased Variant</label>
                <select className="form-input" value={variant} onChange={(e) => setVariant(e.target.value)}>
                  <option>100ml Eau de Parfum</option>
                  <option>50ml Eau de Parfum</option>
                  <option>Tester Discovery Box</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Overall Rating *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <StarInput value={rating} onChange={setRating} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                  {rating === 5 ? 'Exceptional (5/5)' : rating === 4 ? 'Great (4/5)' : rating === 3 ? 'Good (3/5)' : 'Fair'}
                </span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Your Honest Review & Scent Longevity *</label>
              <textarea
                rows={3}
                required
                className="form-input"
                placeholder="Tell us about the scent notes, longevity (e.g. 24H+), compliment factor, and luxury packaging..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '12px 30px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {submitting ? 'Posting Review...' : 'Post Verified Review'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormOpen(false)}
                style={{ padding: '12px 22px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '45px 0', color: 'var(--color-text-secondary)', background: 'var(--bg-secondary)', borderRadius: 16 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)', marginBottom: 4 }}>
            Be the First to Review This Masterpiece
          </p>
          <p style={{ fontSize: '0.85rem' }}>Experience the aroma and share your thoughts with fellow connoisseurs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {reviews.map((rev, idx) => (
            <div
              key={rev._id || idx}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: 16,
                backgroundColor: 'white',
                border: '1px solid rgba(106,91,83,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <StarDisplay value={rev.rating || 5} size={15} />
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-success)',
                      fontWeight: 700,
                      background: 'rgba(56,142,60,0.08)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CheckCircle size={11} /> Verified Buyer
                  </span>
                </div>

                <p style={{ fontSize: '0.94rem', color: 'var(--color-text-primary)', lineHeight: 1.6, fontStyle: 'italic', margin: '8px 0' }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(106,91,83,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-burgundy)', margin: 0 }}>
                    {rev.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {rev.variant || '100ml Eau De Parfum'}
                  </p>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
