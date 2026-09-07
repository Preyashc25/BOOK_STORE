// src/components/admin/BookFormModal.jsx
import { useState, useEffect } from 'react';
import { getAllCategories } from '../../services/categoryService';

const EMPTY_FORM = {
  title: '',
  author: '',
  isbn: '',
  price: '',
  discountPercent: '',
  stock: '',
  category: '',
  description: '',
  imageUrl: '',
  languages: 'English',
  page: '',
  publisher: '',
  pubishDate: '',
};

const BookFormModal = ({ book, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        price: book.price ?? '',
        discountPercent: book.discountPercent ?? '',
        stock: book.stock ?? '',
        category: book.category?._id || book.category || '',
        description: book.description || '',
        imageUrl: book.images?.[0]?.url || '',
        languages: book.languages || 'English',
        page: book.page ?? '',
        publisher: book.publisher || '',
        pubishDate: book.pubishDate ? book.pubishDate.slice(0, 10) : '',
      });
      setSelectedFile(null);
      setFilePreview(book.images?.[0]?.url || null);
      // If book already has an image, default to showing preview
      if (book.images?.[0]?.url && !book.images?.[0]?.publicId) {
        setImageInputMode('url');
      } else {
        setImageInputMode('file');
      }
    } else {
      setForm(EMPTY_FORM);
      setSelectedFile(null);
      setFilePreview(null);
      setImageInputMode('file');
    }
    setError('');
  }, [book]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
        return;
      }
      setError('');
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(book?.images?.[0]?.url || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('author', form.author);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('category', form.category);

      if (form.stock !== '' && form.stock !== undefined) {
        formData.append('stock', form.stock);
      }
      if (form.discountPercent !== '' && form.discountPercent !== undefined) {
        formData.append('discountPercent', form.discountPercent);
      }
      if (form.isbn && form.isbn.trim()) {
        formData.append('isbn', form.isbn.trim());
      }
      if (form.languages && form.languages.trim()) {
        formData.append('languages', form.languages.trim());
      }
      if (form.page !== '' && form.page !== undefined) {
        formData.append('page', form.page);
      }
      if (form.publisher && form.publisher.trim()) {
        formData.append('publisher', form.publisher.trim());
      }
      if (form.pubishDate) {
        formData.append('pubishDate', form.pubishDate);
      }

      // If admin selected an image file, send as multipart 'images' (handled by multer & Cloudinary in backend)
      if (selectedFile) {
        formData.append('images', selectedFile);
      } else if (imageInputMode === 'url' && form.imageUrl?.trim()) {
        formData.append('imageUrl', form.imageUrl.trim());
      }

      await onSave(formData, book?._id);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to save book.'
      );
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-6 py-8 backdrop-blur-xs">
      <div className="bg-white max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-ink/10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink/10">
          <h2 className="font-display text-2xl text-ink">
            {book ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/40 hover:text-ink text-xl leading-none px-2"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-oxblood/10 border border-oxblood/20 text-oxblood font-sans text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Title *
            </label>
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. The Great Gatsby"
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
            />
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Author *
            </label>
            <input
              name="author"
              required
              value={form.author}
              onChange={handleChange}
              placeholder="e.g. F. Scott Fitzgerald"
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="499"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                name="stock"
                required
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                ISBN
              </label>
              <input
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="978-3-16-148410-0"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Category *
            </label>
            <select
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Cover Image Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60">
                Cover Image
              </label>
              <div className="flex text-xs font-sans rounded border border-ink/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setImageInputMode('file')}
                  className={`px-3 py-1 transition-colors ${
                    imageInputMode === 'file'
                      ? 'bg-leather text-parchment font-medium'
                      : 'bg-white text-ink/70 hover:bg-shelf'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1 transition-colors ${
                    imageInputMode === 'url'
                      ? 'bg-leather text-parchment font-medium'
                      : 'bg-white text-ink/70 hover:bg-shelf'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageInputMode === 'file' ? (
              <div className="border-2 border-dashed border-ink/20 rounded p-4 text-center hover:border-leather transition-colors bg-parchment/40">
                {filePreview ? (
                  <div className="flex items-center gap-4 text-left">
                    <img
                      src={filePreview}
                      alt="Cover preview"
                      className="w-16 h-22 object-cover shadow-book border border-ink/10 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-ink font-medium truncate">
                        {selectedFile ? selectedFile.name : 'Current cover image'}
                      </p>
                      {selectedFile ? (
                        <p className="text-xs text-forest mt-0.5">
                          ✓ Ready to upload to Cloudinary ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      ) : (
                        <p className="text-xs text-ink/50 mt-0.5">
                          Existing cover image retained unless replaced.
                        </p>
                      )}
                      <div className="mt-2 flex gap-3">
                        <label className="cursor-pointer text-xs font-sans text-leather hover:underline font-medium">
                          Choose another file
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleClearFile}
                            className="text-xs font-sans text-oxblood hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="mx-auto h-8 w-8 text-ink/30 mb-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <label className="cursor-pointer font-sans text-sm text-leather hover:underline font-semibold block">
                      Click to upload image file
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-[11px] text-ink/50 mt-1">
                      PNG, JPG, WEBP up to 5MB (stored on Cloudinary)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather bg-white"
                />
                {form.imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={form.imageUrl}
                      alt="URL preview"
                      className="w-12 h-16 object-cover shadow-book border border-ink/10 rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-ink/60">Image URL preview</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Language
              </label>
              <input
                name="languages"
                value={form.languages}
                onChange={handleChange}
                placeholder="English"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Pages
              </label>
              <input
                type="number"
                name="page"
                value={form.page}
                onChange={handleChange}
                placeholder="320"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Publisher
              </label>
              <input
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Penguin Books"
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
              />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Publish Date
              </label>
              <input
                type="date"
                name="pubishDate"
                value={form.pubishDate}
                onChange={handleChange}
                className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={form.description}
              onChange={handleChange}
              placeholder="A brief summary of the book..."
              className="w-full border border-ink/20 px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink/10">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-parchment border-t-transparent rounded-full animate-spin"></span>
                  {selectedFile ? 'Uploading to Cloudinary…' : 'Saving…'}
                </>
              ) : book ? (
                'Save Changes'
              ) : (
                'Create Book'
              )}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex-1 font-sans text-sm border border-ink/20 text-ink px-6 py-2.5 hover:bg-shelf transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;