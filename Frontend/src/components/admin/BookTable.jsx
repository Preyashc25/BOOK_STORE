import { formatPrice } from "../../utils/formatPrice";

const BookTable = ({ books, onEdit, onDelete }) => {
  if (books.length === 0) {
    return (
      <p className="font-sans text-sm text-ink/40 py-10">
        No books yet. Add your first one.
      </p>
    );
  }

  return (
    <table className="w-full font-sans text-sm">
      <thead>
        <tr className="border-b border-ink/10 text-left">
          <th className="py-3 pr-4 text-ink/50 font-normal uppercase text-xs tracking-wide">
            Cover
          </th>
          <th className="py-3 pr-4 text-ink/50 font-normal uppercase text-xs tracking-wide">
            Title
          </th>
          <th className="py-3 pr-4 text-ink/50 font-normal uppercase text-xs tracking-wide">
            Author
          </th>
          <th className="py-3 pr-4 text-ink/50 font-normal uppercase text-xs tracking-wide">
            Price
          </th>
          <th className="py-3 pr-4 text-ink/50 font-normal uppercase text-xs tracking-wide">
            Stock
          </th>
          <th className="py-3 text-ink/50 font-normal uppercase text-xs tracking-wide">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book._id} className="border-b border-ink/5">
            <td className="py-3 pr-4">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-10 aspect-[2/3] object-cover shadow-book"
              />
            </td>
            <td className="py-3 pr-4 text-ink">{book.title}</td>
            <td className="py-3 pr-4 text-ink/70">{book.author}</td>
            <td className="py-3 pr-4 text-leather">
              {formatPrice(book.price)}
            </td>
            <td className="py-3 pr-4">
              <span
                className={book.stock <= 5 ? "text-oxblood" : "text-ink/70"}
              >
                {book.stock}
              </span>
            </td>
            <td className="py-3">
              <button
                onClick={() => onEdit(book)}
                className="text-leather hover:underline mr-4"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(book._id)}
                className="text-oxblood hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BookTable;
