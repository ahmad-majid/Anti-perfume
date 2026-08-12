import React, { useState, useEffect, useContext } from 'react';
import { Star, User, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StarInput = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        <Star
          size={24}
          fill={star <= value ? 'var(--color-gold)' : 'none'}
          stroke={star <= value ? 'var(--color-gold)' : 'var(--color-text-muted)'}
          strokeWidth={1.5}
        />
      </button>
    ))}
  </div>
);

const StarDisplay = ({ value, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        fill={star <= Math.round(value) ? 'var(--color-gold)' : 'none'}
        stroke={star <= Math.round(value) ? 'none' : 'var(--color-text-muted)'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

const ReviewSection = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [numReviews, setNumReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setNumReviews(data.numReviews || 0);
      setAverageRating(data.averageRating || 0);
    } catch {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.warning('Please select a star rating.'); return; }
    if (comment.trim().length < 5) { toast.warning('Comment must be at least 5 characters.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Failed to submit review.');
      } else {
        toast.success('Your review has been submitted!');
        setRating(0);
        setComment('');
        setFormOpen(false);
        fetchReviews();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 60 }}>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 className="serif-title-small" style={{ color: 'var(--color-burgundy)', marginBottom: 6 }}>
            Customer Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StarDisplay value={averageRating} size={16} />
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {averageRating.toFixed(1)}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              ({numReviews} {numReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {user && !formOpen && (
          <button
            className="btn btn-secondary"
            onClick={() => setFormOpen(true)}
            style={{ fontSize: '0.85rem', padding: '10px 22px' }}
          >
            Write a Review
          </button>
        )}
        {!user && (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Log in to leave a review
          </span>
        )}
      </div>

      {/* Review submission form */}
      {formOpen && user && (
        <div
          className="glass-panel"
          style={{ padding: '28px', borderRadius: 16, marginBottom: 30, border: '1px solid rgba(197,160,89,0.2)' }}
        >
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-burgundy)', marginBottom: 20 }}>
            Share Your Experience
          </h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="form-label">Your Rating</label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Your Review</label>
              <textarea
                rows={4}
                className="form-input"
                placeholder="Describe your experience with this fragrance..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: 'vertical', minHeight: 100 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '12px 28px' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setFormOpen(false); setRating(0); setComment(''); }}
                style={{ padding: '12px 22px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 90, borderRadius: 12, background: 'linear-gradient(90deg,#f0e8e0 25%,#faf0e8 50%,#f0e8e0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
          No reviews yet. Be the first to share your thoughts.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              className="glass-panel"
              style={{ padding: '22px 26px', borderRadius: 14, border: '1px solid rgba(106,91,83,0.08)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                      {review.user?.username || 'Anonymous'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <StarDisplay value={review.rating} />
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ReviewSection;
