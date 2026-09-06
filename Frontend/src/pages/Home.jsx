import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookGrid from "../components/books/BookGrid";
import { getAllBooks } from "../services/bookService";

const Home = () => {
  const [featuredBook, setFeaturedBook] = useState(null);
  const [newArrival, setNewArrival] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await getAllBooks({ page: 1, limit: 6, sort: "newest" });
        const books = data.books || [];
        setFeaturedBook(books[0] || null);
        setNewArrival(books.slice(1));
      } catch {
        setFeaturedBook(null);
        setNewArrival([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  return (
    <div className="">
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center border-b border-ink/10 pb-14">
          {/* Left "page":cover art */}
          <div className="flex justify-center md:justify-end">
            <div className="w-56 md:w-72 shadow-bookHover">
              {featuredBook?.images?.[0]?.url ? (
                <img
                  src={featuredBook.images[0].url}
                  alt={`${featuredBook.title} cover`}
                  className="w-full aspect-2/3 object-cover"
                />
              ) : (
                <div className="w-full aspect-2/3 bg-shelf flex items-end p-6">
                  <span className="font-display text-2xl text-leather">
                    A good story is waiting.
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Right "page":ediorial blurb */}
          <div className="md:pr-10">
            <span className="font-sans text-xs uppercase tracking-widest text-oxblood">
              Featured this week
            </span>
            <h1 className="font-display text-4xl md:text-5xl text-ink mt-3 tracking-tightish leading-tight">
              {featuredBook?.title || "A Title Worth Opening"}
            </h1>
            <p className="font-sans text-ink/70 mt-2 text-sm">
              by {featuredBook?.author || "Author Name"}
            </p>
            <p className="font-sans text-ink/80 mt-5 leading-relaxed max-w-md">
              {featuredBook?.description ||
                "A short editorial blurb goes here — why this book earned the front page this week, in the voice of someone who actually reads."}
            </p>
            <Link
              to={featuredBook ? `/book/${featuredBook._id}` : "/shop"}
              className="inline-block mt-7 font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors"
            >
              {featuredBook ? "Read the note →" : "Browse the shelf →"}
            </Link>
          </div>
        </div>
      </section>
      {loading ? (
        <div className="max-w-6xl mx-auto px-6 py-14 font-sans text-sm text-ink/50">
          Arranging the latest arrivals…
        </div>
      ) : (
        <BookGrid books={newArrival} title="New Arrivals" />
      )}
    </div>
  );
};

export default Home;
