// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllBooks } from "../services/bookService";
import { formatPrice } from "../utils/formatPrice";

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [fade, setFade] = useState(true);

  // Load featured books and new arrivals
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const [featuredRes, arrivalsRes] = await Promise.all([
          getAllBooks({ limit: 5, sort: "-ratingAvg" }),
          getAllBooks({ limit: 12, sort: "newest" }),
        ]);

        const fBooks = featuredRes.books || [];
        setFeaturedBooks(fBooks);

        const aBooks = arrivalsRes.books || [];
        setNewArrivals(aBooks);
      } catch (err) {
        console.error("Failed to load home books:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Auto-play slow slideshow for featured books (every 5.5 seconds)
  useEffect(() => {
    if (featuredBooks.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      triggerNext();
    }, 5500);

    return () => clearInterval(interval);
  }, [featuredBooks.length, isPaused, featuredIndex]);

  const triggerNext = () => {
    setFade(false);
    setTimeout(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredBooks.length);
      setFade(true);
    }, 350);
  };

  const triggerPrev = () => {
    setFade(false);
    setTimeout(() => {
      setFeaturedIndex((prev) =>
        prev === 0 ? featuredBooks.length - 1 : prev - 1
      );
      setFade(true);
    }, 350);
  };

  const currentBook = featuredBooks[featuredIndex] || null;

  return (
    <div className="overflow-hidden">
      {/* 1. HERO / FEATURED SLIDESHOW SECTION */}
      <section
        className="max-w-6xl mx-auto px-6 pt-12 pb-14"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {loading ? (
          <div className="py-24 text-center font-sans text-sm text-ink/50">
            Curating this week's featured titles…
          </div>
        ) : currentBook ? (
          <div>
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-500 ${
                fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              {/* Left Column: Cover Art with layered book shadow */}
              <div className="flex justify-center md:justify-end">
                <Link
                  to={`/book/${currentBook._id}`}
                  className="group relative block w-56 sm:w-64 md:w-72 aspect-2/3 shadow-bookHover hover:shadow-2xl transition-all duration-500 overflow-hidden bg-shelf"
                >
                  {currentBook.images?.[0]?.url ? (
                    <img
                      src={currentBook.images[0].url}
                      alt={`${currentBook.title} cover`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-shelf flex items-end p-6">
                      <span className="font-display text-2xl text-leather">
                        A good story is waiting.
                      </span>
                    </div>
                  )}
                  {currentBook.discountPercent > 0 && (
                    <span className="absolute top-3 right-3 bg-oxblood text-parchment text-xs font-sans px-2.5 py-1">
                      -{currentBook.discountPercent}% OFF
                    </span>
                  )}
                  {currentBook.ratingAvg > 0 && (
                    <span className="absolute bottom-3 left-3 bg-ink/85 backdrop-blur-xs text-parchment text-xs font-sans px-2.5 py-1">
                      ★ {currentBook.ratingAvg.toFixed(1)}
                    </span>
                  )}
                </Link>
              </div>

              {/* Right Column: Book Details */}
              <div className="md:pr-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-sans text-xs uppercase tracking-widest text-oxblood font-semibold">
                    Featured Spotlight
                  </span>
                  <span className="text-ink/30 text-xs">•</span>
                  <span className="font-sans text-xs text-ink/50">
                    {featuredIndex + 1} of {featuredBooks.length}
                  </span>
                  {currentBook.category?.name && (
                    <span className="font-sans text-xs bg-shelf/80 text-ink/70 px-2 py-0.5 border border-ink/10">
                      {currentBook.category.name}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink tracking-tightish leading-tight">
                  <Link
                    to={`/book/${currentBook._id}`}
                    className="hover:text-leather transition-colors"
                  >
                    {currentBook.title}
                  </Link>
                </h1>

                <p className="font-sans text-ink/70 text-base mt-2">
                  by{" "}
                  <span className="text-ink font-medium">
                    {currentBook.author}
                  </span>
                </p>

                <div className="flex items-baseline gap-3 mt-3">
                  <span className="font-sans text-lg font-semibold text-leather">
                    {formatPrice(
                      currentBook.discountPercent > 0
                        ? currentBook.price -
                            (currentBook.price * currentBook.discountPercent) /
                              100
                        : currentBook.price
                    )}
                  </span>
                  {currentBook.discountPercent > 0 && (
                    <span className="font-sans text-sm text-ink/40 line-through">
                      {formatPrice(currentBook.price)}
                    </span>
                  )}
                </div>

                <p className="font-sans text-ink/80 text-sm md:text-base mt-4 leading-relaxed line-clamp-3 max-w-md">
                  {currentBook.description ||
                    "An exceptional title carefully selected by our editorial team for its profound voice, narrative craft, and enduring power."}
                </p>

                {/* CTAs and Slide Controls */}
                <div className="flex items-center gap-5 mt-7 flex-wrap">
                  <Link
                    to={`/book/${currentBook._id}`}
                    className="font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors"
                  >
                    Explore this book →
                  </Link>
                  <Link
                    to="/shop"
                    className="font-sans text-sm text-ink/70 hover:text-leather underline underline-offset-4 transition-colors"
                  >
                    Browse full shelf
                  </Link>
                </div>
              </div>
            </div>

            {/* Slideshow Bottom Navigation Controls */}
            {featuredBooks.length > 1 && (
              <div className="flex items-center justify-between border-t border-ink/10 mt-12 pt-6">
                <div className="flex items-center gap-2">
                  {featuredBooks.map((b, i) => (
                    <button
                      key={b._id}
                      onClick={() => {
                        setFade(false);
                        setTimeout(() => {
                          setFeaturedIndex(i);
                          setFade(true);
                        }, 250);
                      }}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        i === featuredIndex
                          ? "w-8 h-2 bg-leather"
                          : "w-2 h-2 bg-ink/20 hover:bg-ink/40"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                      title={b.title}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerPrev}
                    className="w-9 h-9 flex items-center justify-center border border-ink/20 text-ink hover:bg-leather hover:text-parchment transition-colors cursor-pointer"
                    aria-label="Previous featured book"
                    title="Previous book"
                  >
                    ‹
                  </button>
                  <button
                    onClick={triggerNext}
                    className="w-9 h-9 flex items-center justify-center border border-ink/20 text-ink hover:bg-leather hover:text-parchment transition-colors cursor-pointer"
                    aria-label="Next featured book"
                    title="Next book"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* 2. SLOW CONTINUOUS LOOP / MARQUEE ANIMATION FOR NEW ARRIVALS */}
      <section className="py-14 bg-shelf/40 border-t border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 mb-8 flex items-end justify-between">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-leather font-semibold">
              Fresh Off The Press
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-ink mt-1 tracking-tightish">
              New Arrivals In Motion
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="font-sans text-xs uppercase tracking-wider text-ink/70 hover:text-leather transition-colors hidden sm:block"
          >
            View all new arrivals →
          </Link>
        </div>

        {/* Marquee Loop Container */}
        {newArrivals.length > 0 ? (
          <div className="marquee-container overflow-hidden py-4">
            <div className="animate-marquee gap-7 flex">
              {/* Render twice for an infinite, gapless loop */}
              {[...newArrivals, ...newArrivals].map((book, idx) => {
                const finalPrice = book.discountPercent
                  ? book.price - (book.price * book.discountPercent) / 100
                  : book.price;

                return (
                  <Link
                    key={`${book._id}-${idx}`}
                    to={`/book/${book._id}`}
                    className="group shrink-0 w-44 sm:w-48 bg-white border border-ink/10 p-3 shadow-book hover:shadow-bookHover transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="aspect-2/3 overflow-hidden bg-shelf relative mb-3">
                      {book.images?.[0]?.url ? (
                        <img
                          src={book.images[0].url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs font-display text-leather">
                          {book.title}
                        </div>
                      )}
                      {book.discountPercent > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-oxblood text-parchment text-[10px] font-sans px-1.5 py-0.5">
                          -{book.discountPercent}%
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-display text-sm text-ink leading-snug line-clamp-1 group-hover:text-leather transition-colors">
                        {book.title}
                      </h4>
                      <p className="font-sans text-xs text-ink/60 line-clamp-1 mt-0.5">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-sans text-xs font-semibold text-leather">
                          {formatPrice(finalPrice)}
                        </span>
                        {book.discountPercent > 0 && (
                          <span className="font-sans text-[11px] text-ink/40 line-through">
                            {formatPrice(book.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center font-sans text-sm text-ink/50">
            Loading recent arrivals…
          </div>
        )}
      </section>

      {/* 3. LITERARY QUOTE / INVITATION BANNER */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <blockquote className="font-display text-2xl md:text-3xl text-ink/90 italic leading-relaxed">
          “A reader lives a thousand lives before he dies. The man who never
          reads lives only one.”
        </blockquote>
        <p className="font-sans text-xs uppercase tracking-widest text-ink/50 mt-4">
          — George R.R. Martin
        </p>
        <div className="mt-8">
          <Link
            to="/genres"
            className="inline-block font-sans text-sm bg-leather text-parchment px-8 py-3.5 hover:bg-ink transition-colors"
          >
            Explore by Genre & Category →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
