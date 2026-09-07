// src/components/common/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../features/auth/authSlice";
import { useState } from "react";

const Navbar = () => {
  const { items } = useSelector((state) => state.cart);
  const cartCount = items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isShelfOrGenresPage =
    location.pathname === "/shop" || location.pathname === "/genres";

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileQuery.trim())}`);
      setMobileQuery("");
      setMenuOpen(false);
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
          className="font-display text-2xl tracking-tightish text-ink shrink-0"
        >
          Chapter&nbsp;&amp;&nbsp;Verse
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-sans text-sm text-ink/80">
          <Link
            to="/shop"
            className={`hover:text-leather transition-colors ${
              location.pathname === "/shop" ? "text-leather font-medium" : ""
            }`}
          >
            Shelf
          </Link>
          <Link
            to="/genres"
            className={`hover:text-leather transition-colors ${
              location.pathname === "/genres" ? "text-leather font-medium" : ""
            }`}
          >
            Genres
          </Link>
          <Link
            to="/orders"
            className={`hover:text-leather transition-colors ${
              location.pathname === "/orders" ? "text-leather font-medium" : ""
            }`}
          >
            My Orders
          </Link>
        </nav>

        {/* Desktop Search: only displayed on pages other than Shelf and Genres to avoid duplicate searchbars */}
        {!isShelfOrGenresPage && (
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
            <svg
              className="w-4 h-4 text-ink/40 absolute left-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shelf & genres…"
              className="border border-ink/15 pl-9 pr-3 py-1.5 font-sans text-sm w-56 focus:outline-none focus:border-leather transition-colors bg-white/70 focus:bg-white"
            />
          </form>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 font-sans text-sm text-ink/80">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="font-sans text-xs uppercase tracking-widest bg-leather text-parchment px-3 py-1.5 hover:bg-ink transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="hover:text-leather transition-colors"
              >
                Hi, {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-leather transition-colors cursor-pointer"
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
            className="md:hidden border border-ink/20 px-2.5 py-1.5 font-sans text-xs hover:border-leather hover:text-leather transition-colors cursor-pointer"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 px-6 py-4 bg-parchment space-y-4">
          {!isShelfOrGenresPage && (
            <form onSubmit={handleMobileSearch} className="flex items-center relative">
              <svg
                className="w-4 h-4 text-ink/40 absolute left-3 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="Search shelf & genres…"
                className="w-full border border-ink/15 pl-9 pr-3 py-2 font-sans text-sm focus:outline-none focus:border-leather bg-white"
              />
            </form>
          )}
          <nav className="flex flex-col gap-3 font-sans text-sm text-ink/80">
            <Link to="/shop" onClick={() => setMenuOpen(false)}>
              Shelf
            </Link>
            <Link to="/genres" onClick={() => setMenuOpen(false)}>
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
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-leather font-medium"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
