// src/components/books/BookCard.jsx
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

const BookCard = ({ book }) => {
  const { _id, title, author, price, discountPercent, stock, images, ratingAvg } = book;
  const finalPrice = discountPercent ? price - (price * discountPercent) / 100 : price;
  const coverUrl = images?.[0]?.url;

  return (
    <Link to={`/book/${_id}`} className="group flex flex-col">
      <div className="relative overflow-hidden bg-shelf shadow-book group-hover:shadow-bookHover transition-shadow duration-300 aspect-[2/3]">
        <img
          src={coverUrl}
          alt={`${title} cover`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {stock === 0 && (
          <span className="absolute top-2 left-2 bg-ink/80 text-parchment text-xs px-2 py-1 font-sans">
            Out of stock
          </span>
        )}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-oxblood text-parchment text-xs px-2 py-1 font-sans">
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="mt-3 font-sans">
        <h3 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-leather transition-colors">
          {title}
        </h3>
        <p className="text-sm text-ink/60 mt-0.5">{author}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm text-leather font-medium">{formatPrice(finalPrice)}</span>
          {discountPercent > 0 && (
            <span className="text-xs text-ink/40 line-through">{formatPrice(price)}</span>
          )}
        </div>
        {ratingAvg > 0 && (
          <p className="text-xs text-ink/50 mt-1">★ {ratingAvg.toFixed(1)}</p>
        )}
      </div>
    </Link>
  );
};

export default BookCard;