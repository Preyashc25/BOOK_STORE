// src/pages/Shop.jsx
import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import BookCard from "../components/books/BookCard";
import { getAllBooks } from "../services/bookService";
import { getAllCategories } from "../services/categoryService";

const sortOptions = [
  { value: "-createdAt", label: "Newest Arrivals", icon: "✨" },
  { value: "price", label: "Price: Low to High", icon: "↑" },
  { value: "-price", label: "Price: High to Low", icon: "↓" },
  { value: "title", label: "Title: A–Z", icon: "🔤" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get("category") || searchParams.get("genre") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "-createdAt";
  const inStockOnly = searchParams.get("inStock") === "true";

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const debounceRef = useRef(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all categories once
  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Determine active category
  const matchedCategory = categories.find(
    (c) =>
      c._id === rawParam ||
      c.slug?.toLowerCase() === rawParam.toLowerCase() ||
      c.name?.toLowerCase() === rawParam.toLowerCase()
  );

  const activeCategoryId = matchedCategory ? matchedCategory._id : "";
  const activeCategoryName = matchedCategory ? matchedCategory.name : "All Genres";

  // Sync search input if URL changes externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch);
    }
  }, [searchParams]);

  // Fetch books whenever filters/page/sort change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12, sort: currentSort };
        if (activeCategoryId) {
          params.category = activeCategoryId;
        }
        const search = searchParams.get("search");
        if (search) {
          params.search = search;
        }

        const data = await getAllBooks(params);
        setBooks(data.books || []);
        setTotalPages(data.totalPages || 1);
        setTotalBooks(data.total !== undefined ? data.total : (data.books?.length || 0));
      } catch {
        setBooks([]);
        setTotalPages(1);
        setTotalBooks(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [activeCategoryId, currentPage, currentSort, searchParams]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const params = Object.fromEntries(searchParams);
      if (value.trim()) {
        params.search = value.trim();
      } else {
        delete params.search;
      }
      delete params.page;
      setSearchParams(params);
    }, 350);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = Object.fromEntries(searchParams);
    if (searchInput.trim()) {
      params.search = searchInput.trim();
    } else {
      delete params.search;
    }
    delete params.page;
    setSearchParams(params);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    const params = Object.fromEntries(searchParams);
    delete params.search;
    delete params.page;
    setSearchParams(params);
  };

  const handleCategoryClick = (categoryId) => {
    const params = Object.fromEntries(searchParams);
    delete params.genre;
    if (categoryId) {
      params.category = categoryId;
    } else {
      delete params.category;
    }
    delete params.page;
    setSearchParams(params);
  };

  const handleSortSelect = (sortValue) => {
    const params = Object.fromEntries(searchParams);
    params.sort = sortValue;
    delete params.page;
    setSearchParams(params);
    setSortOpen(false);
  };

  const toggleInStock = () => {
    const params = Object.fromEntries(searchParams);
    if (inStockOnly) {
      delete params.inStock;
    } else {
      params.inStock = "true";
    }
    delete params.page;
    setSearchParams(params);
  };

  const resetAllFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchParams({});
  };

  const goToPage = (page) => {
    const params = Object.fromEntries(searchParams);
    setSearchParams({ ...params, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedSortOption =
    sortOptions.find((o) => o.value === currentSort) || sortOptions[0];

  const displayedBooks = inStockOnly ? books.filter((b) => b.stock > 0) : books;
  const hasActiveFilters = Boolean(
    activeCategoryId || searchParams.get("search") || inStockOnly
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header & Refined Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-ink/10 pb-6">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest text-oxblood font-semibold">
            The Catalog
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-ink tracking-tightish mt-1">
            The Bookshelf
          </h1>
          <p className="font-sans text-sm text-ink/60 mt-1">
            Explore our entire library of literary classics, discoveries, and contemporary works.
          </p>
        </div>

        {/* Custom Toolbar Beside the Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Polished Single Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64 min-w-[200px]">
            <svg
              className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by title, author…"
              className="w-full pl-9 pr-8 py-2 border border-ink/20 bg-white font-sans text-xs focus:outline-none focus:border-leather transition-colors shadow-2xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-oxblood font-sans text-sm px-1 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          {/* In-Stock Filter Pill */}
          <button
            type="button"
            onClick={toggleInStock}
            className={`flex items-center gap-1.5 px-3 py-2 border font-sans text-xs transition-colors cursor-pointer shadow-2xs ${
              inStockOnly
                ? "bg-forest/10 border-forest text-forest font-semibold"
                : "bg-white border-ink/20 text-ink/70 hover:border-leather hover:text-leather"
            }`}
            title="Filter available stock"
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                inStockOnly ? "bg-forest" : "bg-ink/30"
              }`}
            />
            In Stock Only
          </button>

          {/* Bespoke Literary Sort Dropdown (Custom UI, NOT standard select) */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 bg-white border border-ink/20 px-3.5 py-2 font-sans text-xs text-ink hover:border-leather transition-colors cursor-pointer shadow-2xs"
            >
              <svg
                className="w-3.5 h-3.5 text-leather"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              <span className="text-ink/60">Sort:</span>
              <span className="font-medium">{selectedSortOption.label}</span>
              <svg
                className={`w-3.5 h-3.5 text-ink/40 transition-transform duration-200 ${
                  sortOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu Card */}
            {sortOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-ink/15 shadow-bookHover z-30 py-1.5 font-sans text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink/40 font-semibold border-b border-ink/5 mb-1">
                  Sort collection by
                </div>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                      currentSort === opt.value
                        ? "bg-shelf text-leather font-semibold"
                        : "text-ink/80 hover:bg-shelf/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    {currentSort === opt.value && (
                      <span className="text-leather font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Genre Bar */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-3 mb-6 border-b border-ink/10 no-scrollbar">
        <button
          onClick={() => handleCategoryClick("")}
          className={`shrink-0 px-3.5 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            !activeCategoryId
              ? "bg-leather text-parchment"
              : "border border-ink/15 text-ink/70 hover:border-leather"
          }`}
        >
          All Genres
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategoryClick(cat._id)}
            className={`shrink-0 px-3.5 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeCategoryId === cat._id
                ? "bg-leather text-parchment"
                : "border border-ink/15 text-ink/70 hover:border-leather"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        {/* Desktop Category Sidebar */}
        <aside className="hidden md:block border-r border-ink/10 pr-6">
          <button
            onClick={() => handleCategoryClick("")}
            className="group flex items-center justify-between w-full text-left mb-4 cursor-pointer"
            title="Showcase all books of all categories"
          >
            <h2 className="font-sans text-xs uppercase tracking-widest text-ink/50 group-hover:text-leather transition-colors">
              Filter by Genre
            </h2>
            <span className="font-sans text-xs text-ink/40 group-hover:text-leather">
              (All)
            </span>
          </button>

          <ul className="space-y-1 font-sans text-sm">
            <li>
              <button
                onClick={() => handleCategoryClick("")}
                className={`w-full text-left py-1.5 border-l-2 pl-3 transition-colors cursor-pointer ${
                  !activeCategoryId
                    ? "border-oxblood text-leather font-medium bg-leather/5"
                    : "border-transparent text-ink/70 hover:text-leather hover:border-ink/20"
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => {
              const isSelected = activeCategoryId === cat._id;
              return (
                <li key={cat._id}>
                  <button
                    onClick={() => handleCategoryClick(cat._id)}
                    className={`w-full text-left py-1.5 border-l-2 pl-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "border-oxblood text-leather font-medium bg-leather/5"
                        : "border-transparent text-ink/70 hover:text-leather hover:border-ink/20"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-6 border-t border-ink/10">
            <Link
              to="/genres"
              className="group block p-3 bg-shelf/50 hover:bg-shelf border border-ink/10 transition-colors"
            >
              <span className="font-sans text-[10px] uppercase tracking-wider text-leather font-semibold block">
                Visual Collections
              </span>
              <span className="font-display text-sm text-ink group-hover:text-leather transition-colors block mt-0.5">
                Explore Genres Archive →
              </span>
            </Link>
          </div>
        </aside>

        {/* Book Grid Area */}
        <div>
          {/* Active Filter Indicators Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-shelf border border-ink/10 text-xs font-sans">
              <span className="text-ink/50">Active Filters:</span>
              {activeCategoryId && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 text-ink">
                  Genre: <strong>{activeCategoryName}</strong>
                  <button
                    onClick={() => handleCategoryClick("")}
                    className="text-ink/40 hover:text-oxblood cursor-pointer"
                    title="Remove genre filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              {searchParams.get("search") && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 text-ink">
                  Search: <strong>"{searchParams.get("search")}"</strong>
                  <button
                    onClick={clearSearch}
                    className="text-ink/40 hover:text-oxblood cursor-pointer"
                    title="Remove search"
                  >
                    ✕
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-ink/15 px-2.5 py-1 text-forest">
                  <strong>In Stock Only</strong>
                  <button
                    onClick={toggleInStock}
                    className="text-ink/40 hover:text-oxblood cursor-pointer"
                    title="Remove in-stock filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="ml-auto text-oxblood hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <p className="font-sans text-xs text-ink/50 mb-4">
              Showing {displayedBooks.length}{" "}
              {displayedBooks.length === 1 ? "book" : "books"}
              {totalBooks > displayedBooks.length ? ` of ${totalBooks}` : ""}
              {activeCategoryId ? ` in ${activeCategoryName}` : " across all genres"}
            </p>
          )}

          {/* Book Cards */}
          {loading ? (
            <div className="py-20 text-center font-sans text-sm text-ink/50">
              Searching the shelf…
            </div>
          ) : displayedBooks.length === 0 ? (
            <div className="border border-dashed border-ink/20 p-12 text-center my-6 bg-shelf/40">
              <h3 className="font-display text-xl text-ink mb-2">
                No titles found
              </h3>
              <p className="font-sans text-sm text-ink/60 mb-6 max-w-md mx-auto">
                {activeCategoryId
                  ? `No books currently found under "${activeCategoryName}". Try exploring other genres or browse our full collection.`
                  : `No books matched your criteria. Try adjusting your search terms or toggling the in-stock filter.`}
              </p>
              <button
                onClick={resetAllFilters}
                className="inline-block font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors cursor-pointer"
              >
                Browse all genres & books →
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {displayedBooks.map((book) => (
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
                        className={`w-9 h-9 font-sans text-sm border transition-colors cursor-pointer ${
                          p === currentPage
                            ? "border-leather bg-leather text-parchment font-medium"
                            : "border-ink/20 text-ink/70 hover:border-leather hover:text-leather bg-white"
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
