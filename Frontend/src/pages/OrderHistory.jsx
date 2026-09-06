// src/pages/OrderHistory.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import { formatPrice } from "../utils/formatPrice";

const statusStyles = {
  processing: "bg-shelf text-ink/70",
  shipped: "bg-leather/10 text-leather",
  delivered: "bg-forest/10 text-forest",
  cancelled: "bg-oxblood/10 text-oxblood",
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError("Could not load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center font-sans text-ink/60">
        Loading your orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center font-sans text-oxblood">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-3">No orders yet</h1>
        <p className="font-sans text-ink/60 mb-8">
          Once you place an order, it'll show up here.
        </p>
        <Link
          to="/shop"
          className="inline-block font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors"
        >
          Browse the shelf →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-10">
        Your Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border border-ink/10 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="font-sans text-xs text-ink/50 uppercase tracking-wide">
                  Order #{order._id?.slice(-8)}
                </p>
                {order.createdAt && (
                  <p className="font-sans text-sm text-ink/70 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-sans text-xs px-3 py-1.5 uppercase tracking-wide ${
                    statusStyles[order.orderStatus] || "bg-shelf text-ink/70"
                  }`}
                >
                  {order.orderStatus}
                </span>
                <span
                  className={`font-sans text-xs px-3 py-1.5 uppercase tracking-wide ${
                    order.paymentInfo?.status === "paid"
                      ? "bg-forest/10 text-forest"
                      : order.paymentInfo?.status === "failed"
                        ? "bg-oxblood/10 text-oxblood"
                        : "bg-shelf text-ink/70"
                  }`}
                >
                  {order.paymentInfo?.status}
                </span>
              </div>
            </div>

            <ul className="divide-y divide-ink/10">
              {order.items?.map((item, idx) => (
                <li
                  key={idx}
                  className="py-3 flex justify-between font-sans text-sm"
                >
                  <span className="text-ink/80">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between font-display text-lg text-ink border-t border-ink/10 mt-3 pt-4">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
