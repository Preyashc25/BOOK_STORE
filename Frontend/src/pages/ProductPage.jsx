// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { formatPrice } from "../utils/formatPrice";
import { getBookById } from "../services/bookService";
import { addItem } from "../features/cart/cartSlice";
import ReviewSection from "../components/books/ReviewSection";

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getBookById(id);
        setBook(data.book || data);
      } catch (err) {
        setError("Could not load this book. It may no longer be available.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center font-sans text-ink/50">
        Loading…
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center font-sans text-oxblood">
        {error || "Book not found."}
      </div>
    );
  }

  const {
    title,
    author,
    price,
    discountPercent,
    description,
    images,
    stock,
    ratingAvg,
    numReviews,
    category,
    publisher,
    languages,
    page,
  } = book;

  const finalPrice =
    discountPercent > 0 ? price - (price * discountPercent) / 100 : price;
  const coverUrl = images?.[0]?.url;
  const inStock = stock > 0;

  const handleAddToCart = () => {
    dispatch(
      addItem({
        bookId: book._id,
        title,
        author,
        price: finalPrice,
        coverImage: coverUrl,
        qty,
      }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-14">
          {/* Cover art */}
          <div className="flex justify-center md:justify-start">
            <div className="w-full max-w-sm shadow-bookHover sticky top-24">
              <img
                src={coverUrl}
                alt={`${title} cover`}
                className="w-full aspect-2/3 object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-leather">
              {category?.name || "Book"}
            </span>

            <h1 className="font-display text-4xl text-ink mt-2 tracking-tightish leading-tight">
              {title}
            </h1>
            <p className="font-sans text-ink/60 mt-2">by {author}</p>

            {ratingAvg > 0 && (
              <div className="flex items-center gap-1.5 mt-3 font-sans text-sm text-ink/70">
                <span className="text-oxblood">★</span>
                <span>
                  {ratingAvg.toFixed(1)} ({numReviews} review
                  {numReviews === 1 ? "" : "s"})
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <p className="font-display text-2xl text-leather">
                {formatPrice(finalPrice)}
              </p>
              {discountPercent > 0 && (
                <>
                  <p className="font-sans text-base text-ink/40 line-through">
                    {formatPrice(price)}
                  </p>
                  <span className="font-sans text-xs bg-oxblood text-parchment px-2 py-1">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="font-sans text-ink/80 leading-relaxed mt-6 max-w-xl">
              {description}
            </p>

            {/* Extra metadata */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 font-sans text-sm text-ink/60 max-w-md">
              {publisher && (
                <>
                  <dt className="text-ink/40">Publisher</dt>
                  <dd>{publisher}</dd>
                </>
              )}
              {languages && (
                <>
                  <dt className="text-ink/40">Language</dt>
                  <dd>{languages}</dd>
                </>
              )}
              {page && (
                <>
                  <dt className="text-ink/40">Pages</dt>
                  <dd>{page}</dd>
                </>
              )}
            </dl>

            <div className="mt-8 flex items-center gap-4">
              {/* Qty stepper */}
              <div className="flex items-center border border-ink/20">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 font-sans text-ink hover:bg-shelf transition-colors"
                >
                  −
                </button>
                <span className="px-4 font-sans text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  className="px-3 py-2 font-sans text-ink hover:bg-shelf transition-colors"
                >
                  +
                </button>
              </div>

              <button
                disabled={!inStock}
                onClick={handleAddToCart}
                className="font-sans text-sm bg-leather text-parchment px-8 py-3 hover:bg-ink transition-colors disabled:bg-ink/20 disabled:text-ink/40 disabled:cursor-not-allowed"
              >
                {inStock
                  ? added
                    ? "Added ✓"
                    : "Add to shelf"
                  : "Out of stock"}
              </button>
            </div>

            {!inStock && (
              <p className="font-sans text-sm text-oxblood mt-3">
                Currently out of stock — check back soon.
              </p>
            )}
            {inStock && stock <= 5 && (
              <p className="font-sans text-sm text-oxblood mt-3">
                Only {stock} left in stock.
              </p>
            )}
          </div>
        </div>
      </div>
      <ReviewSection bookId={book._id} />
    </>
  );
};

export default ProductPage;
