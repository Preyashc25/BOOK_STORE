// src/pages/AdminCategories.jsx
import { useEffect, useState } from 'react';
import { getAllCategories, createCategory, deleteCategory } from '../services/categoryService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data.categories || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setSaving(true);
    try {
      await createCategory({ name: newName.trim() });
      setNewName('');
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Books using it may be affected.')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete category.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-8">
        Manage Categories
      </h1>

      {/* Add new category */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-8 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm focus:outline-none focus:border-leather"
        />
        <button
          type="submit"
          disabled={saving}
          className="font-sans text-sm bg-leather text-parchment px-6 py-2.5 hover:bg-ink transition-colors disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="font-sans text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 px-4 py-3 mb-6 max-w-md">
          {error}
        </p>
      )}

      {/* Category list */}
      <div className="border border-ink/10 bg-white max-w-md">
        {loading ? (
          <p className="font-sans text-ink/50 p-6">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="font-sans text-ink/40 p-6">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center justify-between px-5 py-3">
                <span className="font-sans text-sm text-ink">{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="font-sans text-xs text-oxblood hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;