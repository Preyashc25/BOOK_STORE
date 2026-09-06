// src/pages/AdminOrders.jsx
import { useEffect, useState } from 'react';
import { getAllOrdersAdmin, updateOrderStatus } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles = {
  processing: 'bg-shelf text-ink/70',
  shipped: 'bg-leather/10 text-leather',
  delivered: 'bg-forest/10 text-forest',
  cancelled: 'bg-oxblood/10 text-oxblood',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, orderStatus: newStatus } : o))
      );
    } catch {
      alert('Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-8">
        Manage Orders
      </h1>

      <div className="border border-ink/10 bg-white overflow-x-auto">
        {loading ? (
          <p className="font-sans text-ink/50 p-6">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="font-sans text-ink/40 p-6">No orders yet.</p>
        ) : (
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Order</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Customer</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Total</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Payment</th>
                <th className="py-3 px-5 text-ink/50 font-normal uppercase text-xs tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-ink/5">
                  <td className="py-3 px-5 text-ink/70">#{order._id?.slice(-8)}</td>
                  <td className="py-3 px-5 text-ink">
                    {order.user?.name || order.shippingAddress?.fullName || '—'}
                  </td>
                  <td className="py-3 px-5 text-leather">{formatPrice(order.totalAmount)}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-1 uppercase tracking-wide ${
                        order.paymentInfo?.status === 'paid'
                          ? 'bg-forest/10 text-forest'
                          : 'bg-shelf text-ink/70'
                      }`}
                    >
                      {order.paymentInfo?.status}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs px-2 py-1.5 uppercase tracking-wide border-none focus:outline-none ${
                        statusStyles[order.orderStatus] || 'bg-shelf text-ink/70'
                      }`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
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

export default AdminOrders;