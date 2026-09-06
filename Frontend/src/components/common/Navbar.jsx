// src/components/common/Navbar.jsx
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const { items } = useSelector((state) => state.cart);
  const cartCount = items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <header className="border-b border-ink/10 bg-parchment sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
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
        <form onSubmit={handleSearch} className="hidden lg:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books…"
            className="border border-ink/15 px-3 py-1.5 font-sans text-sm w-48 focus:outline-none focus:border-leather transition-colors"
          />
        </form>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 font-sans text-sm text-ink/80">
              <Link
                to="/profile"
                className="hover:text-leather transition-colors"
              >
                Hi, {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-leather transition-colors"
              >
                Logout
              </button>  
            </div>
          ) : (
            <Link
              to="/login"
              className="font-sans text-sm text-ink/80 hover:text-leather transition-colors"
            >
              Account
            </Link>
          )}
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
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden border border-ink/20 px-2.5 py-1.5 font-sans text-xs hover:border-leather hover:text-leather transition-colors"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 px-6 py-4 bg-parchment">
          <nav className="flex flex-col gap-3 font-sans text-sm text-ink/80">
            <Link to="/shop" onClick={() => setMenuOpen(false)}>
              Shelf
            </Link>
            <Link to="/shop?genre=fiction" onClick={() => setMenuOpen(false)}>
              Genres
            </Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setMenuOpen(false)}
            >
              {user ? "Profile" : "Account"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
