import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  const { _id, title, author, price, coverImage, inStock } = book;

  return (
    <Link to={`/book/${_id}`} className="group flex flex-col">
      <div className="relative overflow-hidden bg-shelf shadow-book group-hover:shadow-bookHover transition-shadow duration-300 aspect-[2/3]">
        <img
          src={coverImage}
          alt={`${title} cover`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {!inStock && (
          <span className="absolute top-2 left-2 bg-ink/80 text-parchment text-xs px-2 py-1 font-sans">
            Out of Stock
          </span>
        )}
      </div>
      <div className="mt-3 font-sans">
        <h3 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-leather transition-colors">
          {title}
        </h3>
        <p className="text-sm text-ink/60 mt-0.5">{author}</p>
        <p className="text-sm text-leather mt-1.5 font-medium">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
};

export default BookCard;
