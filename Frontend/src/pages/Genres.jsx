// src/pages/Genres.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import BookCard from "../components/books/BookCard";
import { getAllBooks } from "../services/bookService";
import { getAllCategories } from "../services/categoryService";

const genreDescriptions = {
  fiction: "Imaginative storytelling, complex characters, and timeless literary journeys.",
  nonfiction: "Real-world narratives, history, biography, and investigative journalism.",
  scifi: "Visions of the future, speculative science, alternate realities, and cosmos.",
  romance: "Heartfelt tales of passion, companionship, longing, and true connection.",
  mystery: "Enthralling whodunits, suspenseful thrillers, and dark crimes to unravel.",
  philosophy: "Inquiry into thought, consciousness, ethics, and the human condition.",
  history: "Chronicles of civilization, eras that shaped nations, and defining epochs.",
  technology: "Code, digital culture, artificial intelligence, and our evolving tools.",
  business: "Economics, entrepreneurship, strategy, and transformative leadership.",
};

const Genres = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGenreParam = searchParams.get("genre") || searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  // 1. Fetch categories
  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // 2. Identify active category
  useEffect(() => {
    if (!activeGenreParam || activeGenreParam === "all") {
      setActiveCategory(null);
    } else {
      const match = categories.find(
        (c) =>
          c._id === activeGenreParam ||
          c.slug?.toLowerCase() === activeGenreParam.toLowerCase() ||
          c.name?.toLowerCase() === activeGenreParam.toLowerCase()
      );
      setActiveCategory(match || null);
    }
  }, [activeGenreParam, categories]);

  // 3. Fetch books based on active genre (or all books if none selected)
  useEffect(() => {
    const fetchGenreBooks = async () => {
      setLoading(true);
      try {
        const params = { limit: 24, sort: "-createdAt" };
        if (activeCategory) {
          params.category = activeCategory._id;
        }
        const data = await getAllBooks(params);
        setBooks(data.books || []);
      } catch (err) {
        console.error("Failed to fetch books for genre:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreBooks();
  }, [activeCategory]);

  const selectGenre = (category) => {
    if (!category) {
      setSearchParams({});
    } else {
      setSearchParams({ genre: category.slug || category._id });
    }
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const currentDesc = activeCategory
    ? genreDescriptions[activeCategory.slug?.toLowerCase()] ||
      `Hand-picked volumes exploring the rich landscape of ${activeCategory.name}.`
    : "Explore literary traditions and fresh perspectives across all our curated collections.";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Editorial Header */}
      <div className="border-b border-ink/10 pb-10 mb-12">
        <span className="font-sans text-xs uppercase tracking-widest text-oxblood font-semibold">
          Curated Archives
        </span>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-2 tracking-tightish">
          Literary Genres
        </h1>
        <p className="font-sans text-ink/70 text-base mt-3 max-w-2xl leading-relaxed">
          Step into distinct literary worlds. Choose a genre below to explore its
          stories, or browse our entire cross-genre archive with no boundaries.
        </p>

        {/* Visual Genre Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {/* "All Genres" Card */}
          <button
            onClick={() => selectGenre(null)}
            className={`text-left p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              !activeCategory
                ? "border-leather bg-leather text-parchment shadow-md"
                : "border-ink/15 bg-white hover:border-leather hover:shadow-sm"
            }`}
          >
            <div>
              <span className={`font-sans text-xs uppercase tracking-wider block mb-1 ${!activeCategory ? "text-parchment/70" : "text-oxblood"}`}>
                The Entire Library
              </span>
              <h3 className="font-display text-lg leading-snug">All Genres</h3>
            </div>
            <p className={`font-sans text-xs mt-4 ${!activeCategory ? "text-parchment/80" : "text-ink/60"}`}>
              Cross-category showcase →
            </p>
          </button>

          {/* Individual Category Cards */}
          {categories.map((cat) => {
            const isSelected = activeCategory?._id === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => selectGenre(cat)}
                className={`text-left p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-leather bg-leather text-parchment shadow-md"
                    : "border-ink/15 bg-white hover:border-leather hover:shadow-sm"
                }`}
              >
                <div>
                  <span className={`font-sans text-[10px] uppercase tracking-wider block mb-1 ${isSelected ? "text-parchment/70" : "text-ink/40"}`}>
                    Collection
                  </span>
                  <h3 className="font-display text-lg leading-snug">{cat.name}</h3>
                </div>
                <p className={`font-sans text-xs mt-4 ${isSelected ? "text-parchment/80" : "text-leather font-medium"}`}>
                  View collection →
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Genre Banner */}
      <div className="bg-shelf/50 border border-ink/10 p-6 md:p-8 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest text-leather font-semibold">
            {activeCategory ? `Currently Browsing Genre` : `Full Archive`}
          </span>
          <h2 className="font-display text-2xl md:text-3xl text-ink mt-1">
            {activeCategory ? activeCategory.name : "All Genres & Categories"}
          </h2>
          <p className="font-sans text-sm text-ink/70 mt-1 max-w-xl">
            {currentDesc}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {activeCategory && (
            <button
              onClick={() => selectGenre(null)}
              className="font-sans text-xs border border-ink/20 px-3.5 py-2 hover:border-leather hover:text-leather bg-white transition-colors cursor-pointer"
            >
              Show all categories
            </button>
          )}
          <Link
            to="/shop"
            className="font-sans text-xs bg-leather text-parchment px-4 py-2 hover:bg-ink transition-colors"
          >
            Go to full bookshelf →
          </Link>
        </div>
      </div>

      {/* Books Display */}
      <div>
        {loading ? (
          <div className="py-24 text-center font-sans text-sm text-ink/50">
            Gathering titles for {activeCategory ? activeCategory.name : "all genres"}…
          </div>
        ) : books.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-12 text-center bg-white my-6">
            <h3 className="font-display text-xl text-ink mb-2">
              No titles currently filed under {activeCategory?.name || "this genre"}
            </h3>
            <p className="font-sans text-sm text-ink/60 mb-6 max-w-md mx-auto">
              We are constantly expanding our shelves. You can explore all
              other genres or return to the main library.
            </p>
            <button
              onClick={() => selectGenre(null)}
              className="inline-block font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors cursor-pointer"
            >
              Showcase all categories & books →
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-xs text-ink/60 uppercase tracking-wider">
                Showing {books.length} {books.length === 1 ? "work" : "works"}
                {activeCategory ? ` in ${activeCategory.name}` : ` across all genres`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-x-6 gap-y-10">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Genres;
