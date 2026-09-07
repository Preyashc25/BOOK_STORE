// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { formatPrice } from '../utils/formatPrice';
import api from '../services/api';

const StatCard = ({ label, value, accent }) => (
  <div className="border border-ink/10 p-6 bg-white shadow-xs">
    <p className="font-sans text-xs uppercase tracking-widest text-ink/50 mb-2">{label}</p>
    <p className={`font-display text-3xl tracking-tightish ${accent || 'text-ink'}`}>{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users/dashboard-status');
      setStats(data?.stats || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Could not load dashboard stats.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <p className="font-sans text-ink/50 py-10">Loading dashboard stats…</p>;
  }

  if (error) {
    return (
      <div className="py-8 max-w-lg">
        <div className="p-4 bg-oxblood/10 border border-oxblood/30 text-oxblood text-sm font-sans mb-4 rounded">
          {error}
        </div>
        <button
          onClick={fetchStats}
          className="text-xs font-sans bg-leather text-parchment px-4 py-2 hover:bg-ink transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink tracking-tightish">
          Dashboard
        </h1>
        <button
          onClick={fetchStats}
          className="text-xs font-sans border border-ink/20 px-3 py-1.5 hover:bg-shelf transition-colors text-ink/70"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Total Books" value={stats?.totalBooks ?? 0} />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
        <StatCard
          label="Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          accent="text-leather"
        />
        <StatCard label="Registered Users" value={stats?.totalUsers ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by status */}
        <div className="border border-ink/10 p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg text-ink mb-4">Orders by Status</h2>
          {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 ? (
            <ul className="space-y-2 font-sans text-sm">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <li key={status} className="flex justify-between text-ink/80 border-b border-ink/5 pb-1.5 last:border-b-0">
                  <span className="capitalize">{status}</span>
                  <span className="text-ink font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-ink/40">No orders recorded yet.</p>
          )}
        </div>

        {/* Low stock books */}
        <div className="border border-ink/10 p-6 bg-white shadow-xs">
          <h2 className="font-display text-lg text-ink mb-4">Low Stock Books (≤ 5)</h2>
          {stats?.lowStockBooks?.length > 0 ? (
            <ul className="divide-y divide-ink/10">
              {stats.lowStockBooks.map((book) => (
                <li key={book._id} className="py-2.5 flex justify-between font-sans text-sm">
                  <span className="text-ink/80 truncate mr-2">{book.title}</span>
                  <span className="text-oxblood font-medium shrink-0">{book.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-forest">✓ All titles are well stocked.</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="border border-ink/10 p-6 bg-white mt-8 shadow-xs">
        <h2 className="font-display text-lg text-ink mb-4">Recent Orders</h2>
        {stats?.recentOrders?.length > 0 ? (
          <ul className="divide-y divide-ink/10">
            {stats.recentOrders.map((order) => (
              <li key={order._id} className="py-3 flex items-center justify-between font-sans text-sm">
                <div>
                  <span className="text-ink/60 font-mono text-xs">
                    #{order._id ? order._id.slice(-8) : '—'}
                  </span>
                  {order.user?.name && (
                    <span className="ml-3 text-ink/80 font-medium">
                      {order.user.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2 py-0.5 uppercase tracking-wide rounded ${
                      order.orderStatus === 'delivered'
                        ? 'bg-forest/10 text-forest'
                        : order.orderStatus === 'cancelled'
                        ? 'bg-oxblood/10 text-oxblood'
                        : 'bg-shelf text-ink/70'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-ink font-semibold">
                    {formatPrice(order.totalAmount || 0)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-sans text-sm text-ink/40">No orders placed yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;