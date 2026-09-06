// src/pages/Shop.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/books/BookCard";
import { getAllBooks } from "../services/bookService";
import { getAllCategories } from "../services/categoryService";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (activeCategory) params.category = activeCategory;
        const search = searchParams.get("search");
        if (search) params.search = search;

        const data = await getAllBooks(params);
        setBooks(data.books || []);
        setTotalPages(data.totalPages || 1);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [activeCategory, currentPage, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = Object.fromEntries(searchParams);
    if (searchInput.trim()) {
      params.search = searchInput.trim();
    } else {
      delete params.search;
    }
    delete params.page; // reset to page 1 on new search
    setSearchParams(params);
  };

  const handleCategoryClick = (category) => {
    const params = Object.fromEntries(searchParams);
    if (category) {
      params.category = category;
    } else {
      delete params.category;
    }
    delete params.page;
    setSearchParams(params);
  };

  const goToPage = (page) => {
    const params = Object.fromEntries(searchParams);
    setSearchParams({ ...params, page });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-8">
        The Full Shelf
      </h1>

      <form onSubmit={handleSearchSubmit} className="mb-8 max-w-md">
        <div className="flex border border-ink/20 focus-within:border-leather transition-colors">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, author, or description…"
            className="flex-1 px-4 py-2.5 font-sans text-sm bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="font-sans text-sm text-ink/60 px-5 hover:text-leather transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        {/* Category sidebar */}
        <aside className="border-r border-ink/10 pr-6">
          <h2 className="font-sans text-xs uppercase tracking-widest text-ink/50 mb-4">
            Genres
          </h2>
          <ul className="space-y-1 font-sans text-sm">
            <li>
              <button
                onClick={() => handleCategoryClick("")}
                className={`w-full text-left py-1.5 border-l-2 pl-3 transition-colors ${
                  !activeCategory
                    ? "border-oxblood text-leather font-medium"
                    : "border-transparent text-ink/70 hover:text-leather hover:border-ink/20"
                }`}
              >
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <button
                  onClick={() => handleCategoryClick(cat._id)}
                  className={`w-full text-left py-1.5 border-l-2 pl-3 transition-colors ${
                    activeCategory === cat._id
                      ? "border-oxblood text-leather font-medium"
                      : "border-transparent text-ink/70 hover:text-leather hover:border-ink/20"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Book grid */}
        <div>
          {loading ? (
            <p className="font-sans text-ink/50 py-10">Loading books…</p>
          ) : books.length === 0 ? (
            <p className="font-sans text-ink/60 py-10">
              No titles found in this genre yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 font-sans text-sm border transition-colors ${
                          p === currentPage
                            ? "border-leather bg-leather text-parchment"
                            : "border-ink/20 text-ink/70 hover:border-leather hover:text-leather"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
