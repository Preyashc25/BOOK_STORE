import { useState } from "react";
import { formatPrice } from "../utils/formatPrice";

const ProductPage = ({ book }) => {
  const [qty, setQty] = useState(1);
  if (!book) return null;
  const {
    title,
    author,
    price,
    description,
    coverImage,
    inStock,
    category,
    rating,
  } = book;

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-14">
        <div className="flex justify-center md:justify-start">
          <div className="w-full max-w-sm shadow-bookHover sticky top-24">
            <img
              src={coverImage}
              alt={`${title} cover`}
              className="w-full aspect-[2/3] object-cover"
            />
          </div>
        </div>
        <div>
          <span className="font-sans text-xs uppercase tracking-widest text-leather">
            {category || "Fiction"}
          </span>
          <h1 className="font-display text-4xl text-ink mt-2 tracking-tightish leading-tight">
            {title}
          </h1>
          <p className="font-sans text-ink/60 mt-2">by {author}</p>
          {rating != null && (
            <div className="flex items-center gap-1.5 mt-3 font-sans text-sm text-ink/70">
              <span className="text-oxblood">★</span>
              <span>{rating.toFixed(1)} / 5</span>
            </div>
          )}
          <p className="font-display text-2xl text-leather mt-6">
            {formatPrice(price)}
          </p>
          <p className="font-sans text-ink/80 leading-relaxed mt-6 max-w-xl">
            {description}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-ink/20">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 font-sans text-ink hover:bg-shelf transition-colors"
              >
                −
              </button>
              <span className="px-4 font-sans text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.max(1, q + 1))}
                className="px-3 py-2 font-sans text-ink hover:bg-shelf transition-colors"
              >
                +
              </button>
            </div>
            <button
              disabled={!inStock}
              className="font-sans text-sm bg-leather text-parchment px-8 py-3 hover:bg-ink transition-colors disabled:bg-ink/20 disabled:text-ink/40 disabled:cursor-not-allowed"
            >
              {inStock ? "Add to shelf" : "Out of stock"}
            </button>
          </div>
          {!inStock && (
            <p className="font-sans text-sm text-oxblood mt-3">
              Currently out of stock - check back soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
