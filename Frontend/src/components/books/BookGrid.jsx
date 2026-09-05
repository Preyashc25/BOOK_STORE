import BookCard from "./BookCard";

const BookGrid = ({ books, title }) => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      {title && (
        <h2 className="font-display text-2xl text-ink mb-6 tracking-tightish">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
        {books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default BookGrid;
