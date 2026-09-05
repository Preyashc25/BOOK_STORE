// src/components/common/Navbar.jsx
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { items } = useSelector((state) => state.cart);
  const cartCount = items?.reduce((sum, i) => sum + i.qty, 0) || 0;

  return (
    <header className="border-b border-ink/10 bg-parchment sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="font-display text-2xl tracking-tightish text-ink"
        >
          Chapter&nbsp;&amp;&nbsp;Verse
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-sans text-sm text-ink/80">
          <Link to="/shop" className="hover:text-leather transition-colors">
            Shelf
          </Link>
          <Link
            to="/shop?genre=fiction"
            className="hover:text-leather transition-colors"
          >
            Genres
          </Link>
          <Link to="/orders" className="hover:text-leather transition-colors">
            My Orders
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            to="/login"
            className="font-sans text-sm text-ink/80 hover:text-leather transition-colors"
          >
            Account
          </Link>
          <Link to="/cart" className="relative font-sans text-sm">
            <span className="border border-ink/20 rounded-sm px-3 py-1.5 hover:border-leather hover:text-leather transition-colors">
              Cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-oxblood text-parchment text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
