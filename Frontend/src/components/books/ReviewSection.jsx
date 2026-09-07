// src/components/books/ReviewSection.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getBookReviews,
  addBookReview,
  updateBookReview,
  deleteBookReview,
} from "../../services/reviewService";
import ReviewStars from "./ReviewStar";

const ReviewSection = ({ bookId }) => {
  const { user } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    if (!bookId) return;
    setLoading(true);
    try {
      const data = await getBookReviews(bookId);
      const fetchedReviews = data.reviews || [];
      setReviews(fetchedReviews);
      const mine = fetchedReviews.find(
        (r) => r.user?._id === (user?.id || user?._id)
      );
      setMyReview(mine || null);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment || "");
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [bookId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (myReview) {
        await updateBookReview(myReview._id, { rating, comment });
      } else {
        await addBookReview(bookId, { rating, comment });
      }
      loadReviews();
      setReviews([]);
      setRating(0);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save review.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteBookReview(reviewId);
      loadReviews();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not delete review.");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 border-t border-ink/10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl text-ink tracking-tightish">
            Reader Reviews
          </h2>
          <p className="font-sans text-xs text-ink/50 mt-1">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"} recorded
          </p>
        </div>
      </div>

      {/* If not logged in, prompt to log in */}
      {!user ? (
        <div className="mb-10 p-5 border border-ink/10 bg-shelf/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-base text-ink">
              Have you read this book?
            </p>
            <p className="font-sans text-xs text-ink/60 mt-0.5">
              Sign in to write a review and help fellow readers find their next story.
            </p>
          </div>
          <Link
            to="/login"
            className="shrink-0 font-sans text-xs bg-leather text-parchment px-5 py-2.5 hover:bg-ink transition-colors"
          >
            Sign in to review →
          </Link>
        </div>
      ) : (
        /* Write / edit review form */
        <form
          onSubmit={handleSubmit}
          className="mb-10 max-w-lg border border-ink/10 p-6 bg-white shadow-xs"
        >
          <h3 className="font-display text-lg text-ink mb-3">
            {myReview ? "Edit your review" : "Write a review"}
          </h3>
          <ReviewStars value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your honest thoughts, reflections, and impressions…"
            className="w-full mt-4 border border-ink/20 px-4 py-2.5 font-sans text-sm focus:outline-none focus:border-leather transition-colors"
          />
          {error && (
            <p className="font-sans text-xs text-oxblood bg-oxblood/10 border border-oxblood/20 px-3 py-2 mt-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="mt-4 font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : myReview ? "Update review" : "Submit review"}
          </button>
        </form>
      )}

      {/* Review list */}
      {loading ? (
        <p className="font-sans text-ink/50 text-sm">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="font-sans text-ink/50 text-sm italic">
          No reviews yet — be the first to leave a thought.
        </p>
      ) : (
        <ul className="space-y-6 max-w-2xl divide-y divide-ink/10">
          {reviews.map((review) => (
            <li key={review._id} className="pt-6 first:pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-ink font-semibold">
                    {review.user?.name || "Reader"}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <ReviewStars value={review.rating} readOnly />
                    {review.isVerifiedPurchase && (
                      <span className="font-sans text-[11px] text-forest bg-forest/10 px-2 py-0.5 border border-forest/20">
                        Verified reader
                      </span>
                    )}
                  </div>
                </div>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="font-sans text-xs text-oxblood hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="font-sans text-sm text-ink/80 mt-3 leading-relaxed">
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