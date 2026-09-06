// src/components/books/ReviewSection.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getBookReviews,
  addBookReview,
  updateBookReview,
  deleteBookReview,
} from '../../services/reviewService';
import ReviewStars from './ReviewStar';

const ReviewSection = ({ bookId }) => {
  const { user } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null); // this user's own review, if any

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getBookReviews(bookId);
      setReviews(data.reviews || []);
      const mine = data.reviews?.find((r) => r.user?._id === user?.id);
      setMyReview(mine || null);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment || '');
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadReviews();
    else setLoading(false);
  }, [bookId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a rating.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (myReview) {
        await updateBookReview(myReview._id, { rating, comment });
      } else {
        await addBookReview(bookId, { rating, comment });
      }
      loadReviews();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save review.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteBookReview(reviewId);
      loadReviews();
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not delete review.');
    }
  };

  if (!user) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-ink/10">
        <h2 className="font-display text-2xl text-ink mb-3">Reviews</h2>
        <p className="font-sans text-ink/60 text-sm">
          Sign in to read and write reviews for this book.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 border-t border-ink/10">
      <h2 className="font-display text-2xl text-ink mb-8">Reviews</h2>

      {/* Write / edit review form */}
      <form onSubmit={handleSubmit} className="mb-10 max-w-lg border border-ink/10 p-6 bg-white">
        <h3 className="font-display text-lg text-ink mb-3">
          {myReview ? 'Edit your review' : 'Write a review'}
        </h3>
        <ReviewStars value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share your thoughts on this book…"
          className="w-full mt-4 border border-ink/20 px-4 py-2.5 font-sans text-sm focus:outline-none focus:border-leather"
        />
        {error && <p className="font-sans text-sm text-oxblood mt-2">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : myReview ? 'Update review' : 'Submit review'}
        </button>
      </form>

      {/* Review list */}
      {loading ? (
        <p className="font-sans text-ink/50">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="font-sans text-ink/40">No reviews yet — be the first to write one.</p>
      ) : (
        <ul className="space-y-6 max-w-2xl">
          {reviews.map((review) => (
            <li key={review._id} className="border-b border-ink/10 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-ink font-medium">{review.user?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ReviewStars value={review.rating} readOnly />
                    {review.isVerifiedPurchase && (
                      <span className="font-sans text-xs text-forest bg-forest/10 px-2 py-0.5">
                        Verified purchase
                      </span>
                    )}
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="font-sans text-xs text-oxblood hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="font-sans text-sm text-ink/70 mt-3 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ReviewSection;