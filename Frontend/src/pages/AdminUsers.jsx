// src/pages/AdminUsers.jsx
import { useEffect, useState } from 'react';
import { getAllUsersAdmin, deleteUserAdmin } from '../services/userService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const data = await getAllUsersAdmin(params);
      setUsers(data?.users || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Could not load users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUserAdmin(id);
      loadUsers(search);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete user.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink tracking-tightish">
          Manage Users
        </h1>
        <button
          onClick={() => loadUsers(search)}
          className="text-xs font-sans border border-ink/20 px-3 py-1.5 hover:bg-shelf transition-colors text-ink/70"
        >
          ↻ Refresh
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 max-w-md">
        <div className="flex border border-ink/20 focus-within:border-leather transition-colors">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
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

      {error && (
        <div className="p-4 bg-oxblood/10 border border-oxblood/30 text-oxblood text-sm font-sans mb-6 max-w-md rounded flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadUsers(search)}
            className="text-xs underline font-semibold ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <div className="border border-ink/10 bg-white overflow-x-auto shadow-xs">
        {loading ? (
          <p className="font-sans text-ink/50 p-6">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="font-sans text-ink/40 p-6">No users found.</p>
        ) : (
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left bg-parchment/40">
                <th className="py-3 px-5 text-ink/60 font-semibold uppercase text-xs tracking-wide">Name</th>
                <th className="py-3 px-5 text-ink/60 font-semibold uppercase text-xs tracking-wide">Email</th>
                <th className="py-3 px-5 text-ink/60 font-semibold uppercase text-xs tracking-wide">Role</th>
                <th className="py-3 px-5 text-ink/60 font-semibold uppercase text-xs tracking-wide">Joined</th>
                <th className="py-3 px-5 text-ink/60 font-semibold uppercase text-xs tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-ink/5 hover:bg-shelf/20 transition-colors">
                  <td className="py-3.5 px-5 text-ink font-medium">{u.name}</td>
                  <td className="py-3.5 px-5 text-ink/70">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-sm uppercase tracking-wide font-medium ${
                        u.role === 'admin'
                          ? 'bg-leather/15 text-leather font-semibold'
                          : 'bg-shelf text-ink/70'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-ink/60 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="font-sans text-xs text-oxblood hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;