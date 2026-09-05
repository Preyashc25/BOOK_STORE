// src/pages/Cart.jsx
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { formatPrice } from "../utils/formatPrice";
import {
  incrementQty,
  decrementQty,
  removeItem,
} from "../features/cart/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.cart);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-3">
          Your shelf is empty
        </h1>
        <p className="font-sans text-ink/60 mb-8">
          Nothing here yet — go find something worth reading.
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
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-10">
        Your Shelf
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-14">
        {/* Line items */}
        <ul className="divide-y divide-ink/10">
          {items.map((item) => (
            <li key={item.bookId} className="flex gap-5 py-6">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-20 aspect-[2/3] object-cover shadow-book flex-shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg text-ink leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-ink/60 mt-1">
                    {item.author}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-ink/20">
                    <button
                      onClick={() => dispatch(decrementQty(item.bookId))}
                      className="px-3 py-1.5 font-sans text-ink hover:bg-shelf transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 font-sans text-sm">{item.qty}</span>
                    <button
                      onClick={() => dispatch(incrementQty(item.bookId))}
                      className="px-3 py-1.5 font-sans text-ink hover:bg-shelf transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-sm text-leather font-medium">
                      {formatPrice(item.price * item.qty)}
                    </span>
                    <button
                      onClick={() => dispatch(removeItem(item.bookId))}
                      className="font-sans text-xs text-oxblood hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary */}
        <aside className="bg-shelf p-6 h-fit">
          <h2 className="font-display text-xl text-ink mb-5">Summary</h2>
          <div className="flex justify-between font-sans text-sm text-ink/70 mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between font-sans text-sm text-ink/70 mb-4">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between font-display text-lg text-ink border-t border-ink/10 pt-4 mb-6">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="block text-center font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors"
          >
            Proceed to checkout →
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
