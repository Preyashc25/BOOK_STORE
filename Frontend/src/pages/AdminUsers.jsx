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
      setUsers(data.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load users.');
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteUserAdmin(id);
      loadUsers(search);
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not delete user.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-8">
        Manage Users
      </h1>

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
        <p className="font-sans text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 px-4 py-3 mb-6 max-w-md">
          {error}
        </p>
      )}

      <div className="border border-ink/10 bg-white overflow-x-auto">
        {loading ? (
          <p className="font-sans text-ink/50 p-6">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="font-sans text-ink/40 p-6">No users found.</p>
        ) : (
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Name</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Email</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Role</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Joined</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-ink/5">
                  <td className="py-3 px-5 text-ink">{u.name}</td>
                  <td className="py-3 px-5 text-ink/70">{u.email}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-1 uppercase tracking-wide ${
                        u.role === 'admin' ? 'bg-leather/10 text-leather' : 'bg-shelf text-ink/70'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-ink/60">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3 px-5">
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="font-sans text-xs text-oxblood hover:underline"
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