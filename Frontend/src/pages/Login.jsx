// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../features/auth/authSlice";
import { login } from "../services/authService";
import { useDispatch } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(formData);
      localStorage.setItem("token", data.accessToken);
      dispatch(setUser(data.user));
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left panel — ink background, editorial branding */}
      <div className="hidden md:flex flex-col justify-between bg-ink text-parchment px-14 py-12">
        <Link to="/" className="font-display text-2xl tracking-tightish">
          Chapter&nbsp;&amp;&nbsp;Verse
        </Link>

        <div className="max-w-sm">
          <span className="font-sans text-xs uppercase tracking-widest text-oxblood">
            Welcome back
          </span>
          <h1 className="font-display text-4xl mt-3 leading-tight tracking-tightish">
            Every good story deserves a return visit.
          </h1>
          <p className="font-sans text-parchment/60 mt-5 leading-relaxed text-sm">
            Sign in to pick up your orders, revisit your wishlist, and keep
            browsing where you left off.
          </p>
        </div>

        <p className="font-sans text-xs text-parchment/40">
          © {new Date().getFullYear()} Chapter &amp; Verse
        </p>
      </div>

      {/* Right panel — clean white form surface, distinct from parchment bg */}
      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="md:hidden text-center mb-8">
            <Link
              to="/"
              className="font-display text-2xl text-ink tracking-tightish"
            >
              Chapter&nbsp;&amp;&nbsp;Verse
            </Link>
          </div>

          <h2 className="font-display text-2xl text-ink tracking-tightish mb-1">
            Sign in to your shelf
          </h2>
          <p className="font-sans text-sm text-ink/50 mb-8">
            Enter your details below to continue.
          </p>

          {error && (
            <p className="font-sans text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 px-4 py-3 mb-6">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-ink/15 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-ink/15 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="font-sans text-sm text-ink/60 text-center mt-8">
            New here?{" "}
            <Link to="/signup" className="text-leather hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
