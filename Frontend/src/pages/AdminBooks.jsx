// src/pages/AdminBooks.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import BookTable from "../components/admin/BookTable";
import BookFormModal from "../components/admin/BookFormModal";
import {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../services/bookService";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const debounceTimer = useRef(null);

  // Debounce search input (300ms)
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
    }, 300);
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const loadBooks = async (search = "") => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      const data = await getAllBooks(params);
      setBooks(data.books || []);
      setTotalCount(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks(debouncedSearch);
  }, [debouncedSearch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSave = async (formData, id) => {
    if (id) {
      await updateBook(id, formData);
    } else {
      await createBook(formData);
    }
    setModalOpen(false);
    setEditingBook(null);
    loadBooks(debouncedSearch);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    await deleteBook(id);
    loadBooks(debouncedSearch);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink tracking-tightish">
          Manage Books
        </h1>
        <button
          onClick={() => {
            setEditingBook(null);
            setModalOpen(true);
          }}
          className="font-sans text-sm bg-leather text-parchment px-5 py-2.5 hover:bg-ink transition-colors"
        >
          + Add Book
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <svg
              className="w-4 h-4 text-ink/35"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, author, or ISBN…"
            className="w-full border border-ink/20 bg-white pl-10 pr-10 py-2.5 font-sans text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-leather focus:ring-1 focus:ring-leather/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink/40 hover:text-ink transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {debouncedSearch && !loading && (
          <p className="font-sans text-xs text-ink/50 mt-2">
            {totalCount === 0
              ? `No books found for "${debouncedSearch}"`
              : `${totalCount} book${totalCount !== 1 ? "s" : ""} found for "${debouncedSearch}"`}
          </p>
        )}
      </div>

      <div className="border border-ink/10 bg-white p-6">
        {loading ? (
          <p className="font-sans text-ink/50">Loading books…</p>
        ) : (
          <BookTable
            books={books}
            onEdit={(book) => {
              setEditingBook(book);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      {modalOpen && (
        <BookFormModal
          book={editingBook}
          onClose={() => {
            setModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminBooks;

