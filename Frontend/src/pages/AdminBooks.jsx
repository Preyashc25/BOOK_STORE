// src/pages/AdminBooks.jsx
import { useEffect, useState } from "react";
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

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await getAllBooks();
      setBooks(data.books || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSave = async (formData, id) => {
    if (id) {
      await updateBook(id, formData);
    } else {
      await createBook(formData);
    }
    setModalOpen(false);
    setEditingBook(null);
    loadBooks();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    await deleteBook(id);
    loadBooks();
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
