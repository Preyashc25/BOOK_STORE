// src/components/admin/BookFormModal.jsx
import { useState, useEffect } from 'react';
import { getAllCategories } from '../../services/categoryService';

const EMPTY_FORM = {
  title: '', author: '', isbn: '', price: '', discountPercent: '',
  stock: '', category: '', description: '', imageUrl: '',
  languages: 'English', page: '', publisher: '', pubishDate: '',
};

const BookFormModal = ({ book, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCategories().then((data) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        price: book.price || '',
        discountPercent: book.discountPercent || '',
        stock: book.stock || '',
        category: book.category?._id || book.category || '',
        description: book.description || '',
        imageUrl: book.images?.[0]?.url || '',
        languages: book.languages || 'English',
        page: book.page || '',
        publisher: book.publisher || '',
        pubishDate: book.pubishDate?.slice(0, 10) || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [book]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // images array shape matches schema: [{ url, publicId }]
    const payload = { ...form, images: form.imageUrl ? [{ url: form.imageUrl }] : [] };
    delete payload.imageUrl;
    await onSave(payload, book?._id);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl text-ink mb-6">{book ? 'Edit Book' : 'Add New Book'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Title</label>
            <input name="title" required value={form.title} onChange={handleChange}
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Author</label>
            <input name="author" required value={form.author} onChange={handleChange}
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Price</label>
              <input type="number" name="price" required value={form.price} onChange={handleChange}
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Discount %</label>
              <input type="number" name="discountPercent" value={form.discountPercent} onChange={handleChange}
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Stock</label>
              <input type="number" name="stock" required value={form.stock} onChange={handleChange}
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">ISBN</label>
              <input name="isbn" value={form.isbn} onChange={handleChange}
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
            </div>
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Category</label>
            <select name="category" required value={form.category} onChange={handleChange}
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather bg-white">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Cover Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">Description</label>
            <textarea name="description" rows={3} required value={form.description} onChange={handleChange}
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 font-sans text-sm border border-ink/20 text-ink px-6 py-2.5 hover:bg-shelf transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;