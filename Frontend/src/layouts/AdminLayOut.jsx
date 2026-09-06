// src/layouts/AdminLayout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../features/auth/authSlice";

// src/layouts/AdminLayout.jsx — update NAV_ITEMS
const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin" },
  { label: "Books", path: "/admin/books" },
  { label: "Categories", path: "/admin/categories" },
  { label: "Orders", path: "/admin/orders" },
  { label: "Users", path: "/admin/users" },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-parchment text-ink">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ink text-parchment flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-parchment/10">
          <Link to="/" className="font-display text-xl tracking-tightish">
            Chapter &amp; Verse
          </Link>
          <p className="font-sans text-xs text-parchment/40 mt-0.5 uppercase tracking-widest">
            Admin
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 md:py-6 flex md:block gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap block px-3 py-2.5 font-sans text-sm border-l-2 transition-colors ${
                  isActive
                    ? "border-oxblood text-parchment bg-parchment/5"
                    : "border-transparent text-parchment/60 hover:text-parchment hover:border-parchment/20"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block px-6 py-5 border-t border-parchment/10">
          <p className="font-sans text-sm text-parchment/70 mb-2">
            {user?.name}
          </p>
          <button
            onClick={handleLogout}
            className="font-sans text-xs text-parchment/50 hover:text-parchment transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
