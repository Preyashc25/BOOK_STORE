// src/pages/Checkout.jsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { createOrder, verifyPayment } from "../services/orderService";
import { clearCart } from "../features/cart/cartSlice";

const Checkout = () => {
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create order on backend with shipping address & cart items
      const orderPayload = {
        shippingAddress: address,
        items: items.map((i) => ({
          bookId: i.bookId,
          quantity: i.qty,
        })),
      };
      const { order, razorpayOrder, razorpayKeyId } =
        await createOrder(orderPayload);

      // 2. Open Razorpay checkout modal
      const options = {
        key: razorpayKeyId, // comes from backend
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Chapter & Verse",
        description: "Book order payment",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            dispatch(clearCart());
            navigate("/orders");
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setError(
              verifyErr?.response?.data?.message ||
                "Payment succeeded but verification failed. Contact support.",
            );
            setLoading(false);
          }
        },
        prefill: {
          name: address.fullName || user?.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: {
          color: "#5C3A21",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Could not start payment. Try again.",
      );
      setLoading(false);
    }
  };
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-3">
          Nothing to check out
        </h1>
        <p className="font-sans text-ink/60">Add a book to your shelf first.</p>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-10">
        Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-14">
        {/* Shipping address form */}
        <form onSubmit={handlePayment} className="space-y-5">
          <h2 className="font-display text-xl text-ink mb-4">
            Shipping address
          </h2>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={address.fullName}
              onChange={handleChange}
              className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={address.phone}
              onChange={handleChange}
              className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Street address
            </label>
            <input
              type="text"
              name="street"
              required
              value={address.street}
              onChange={handleChange}
              className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                required
                value={address.city}
                onChange={handleChange}
                className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
              />
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                State
              </label>
              <input
                type="text"
                name="state"
                required
                value={address.state}
                onChange={handleChange}
                className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              required
              value={address.pincode}
              onChange={handleChange}
              className="w-full max-w-50 border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
            />
          </div>
          {error && (
            <p className="font-sans text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 px-4 py-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="font-sans text-sm bg-leather text-parchment px-8 py-3 hover:bg-ink transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing…" : `Pay ${formatPrice(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <aside className="bg-shelf p-6 h-fit">
          <h2 className="font-display text-xl text-ink mb-5">Order Summary</h2>
          <ul className="divide-y divide-ink/10 mb-5">
            {items.map((item) => (
              <li
                key={item.bookId}
                className="py-3 flex justify-between font-sans text-sm"
              >
                <span className="text-ink/80">
                  {item.title} × {item.qty}
                </span>
                <span className="text-ink">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 font-sans text-sm text-ink/70 pb-4 border-b border-ink/10">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="flex justify-between font-display text-lg text-ink pt-4">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
