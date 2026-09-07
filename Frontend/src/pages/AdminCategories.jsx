// src/pages/AdminCategories.jsx
import { useEffect, useState } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load categories.');
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
    setSuccess('');
    setSaving(true);
    try {
      await createCategory({ name: newName.trim() });
      setNewName('');
      setSuccess('Category added successfully.');
      setTimeout(() => setSuccess(''), 3000);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      await updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      setSuccess('Category updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update category.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteCategory(id);
      setSuccess(`Category "${name}" deleted.`);
      setTimeout(() => setSuccess(''), 3000);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete category.');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-8">
        Manage Categories
      </h1>

      {/* Add new category */}
      <div className="bg-white border border-ink/10 p-6 mb-8">
        <h2 className="font-sans text-xs uppercase tracking-wider text-ink/60 mb-3 font-semibold">
          Add New Category
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Science Fiction, Biography"
            className="flex-1 border border-ink/20 bg-white px-4 py-2 font-sans text-sm focus:outline-none focus:border-leather"
          />
          <button
            type="submit"
            disabled={saving}
            className="font-sans text-sm bg-leather text-parchment px-6 py-2 hover:bg-ink transition-colors disabled:opacity-50 cursor-pointer font-medium"
          >
            {saving ? 'Adding…' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-oxblood/10 border border-oxblood/30 text-oxblood text-sm font-sans mb-6 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-forest/10 border border-forest/30 text-forest text-sm font-sans mb-6 rounded">
          {success}
        </div>
      )}

      {/* Category list */}
      <div className="border border-ink/10 bg-white">
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-parchment/40">
          <span className="font-sans text-xs uppercase tracking-wider text-ink/60 font-semibold">
            Category Name &amp; Slug
          </span>
          <span className="font-sans text-xs uppercase tracking-wider text-ink/60 font-semibold">
            Actions
          </span>
        </div>

        {loading ? (
          <p className="font-sans text-ink/50 p-6">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="font-sans text-ink/40 p-6">No categories yet. Create your first one above.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {categories.map((cat) => {
              const isEditing = editingId === cat._id;
              return (
                <li
                  key={cat._id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-shelf/20 transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 border border-ink/30 px-3 py-1 text-sm font-sans focus:outline-none focus:border-leather bg-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(cat._id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(cat._id)}
                        disabled={updating}
                        className="text-xs bg-leather text-parchment px-3 py-1.5 hover:bg-ink transition-colors disabled:opacity-50 cursor-pointer font-medium"
                      >
                        {updating ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updating}
                        className="text-xs border border-ink/20 text-ink px-3 py-1.5 hover:bg-shelf transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="font-sans text-sm text-ink font-medium">
                        {cat.name}
                      </span>
                      <span className="font-sans text-xs text-ink/40 ml-3">
                        /{cat.slug}
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="font-sans text-xs text-leather hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="font-sans text-xs text-oxblood hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;