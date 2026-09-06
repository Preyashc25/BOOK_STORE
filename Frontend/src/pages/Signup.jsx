// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { useDispatch } from "react-redux";


const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
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
      console.log(formData)
      const data = await register(formData);
      localStorage.setItem("token", data.accessToken);
      dispatch(setUser(data.user));
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left panel — leather brown this time, to differ slightly from Login's ink panel */}
      <div className="hidden md:flex flex-col justify-between bg-leather text-parchment px-14 py-12">
        <Link to="/" className="font-display text-2xl tracking-tightish">
          Chapter&nbsp;&amp;&nbsp;Verse
        </Link>

        <div className="max-w-sm">
          <span className="font-sans text-xs uppercase tracking-widest text-parchment/70">
            Join us
          </span>
          <h1 className="font-display text-4xl mt-3 leading-tight tracking-tightish">
            Start a shelf worth coming back to.
          </h1>
          <p className="font-sans text-parchment/70 mt-5 leading-relaxed text-sm">
            Create an account to track orders, save favorites, and get first
            look at new arrivals.
          </p>
        </div>

        <p className="font-sans text-xs text-parchment/40">
          © {new Date().getFullYear()} Chapter &amp; Verse
        </p>
      </div>

      {/* Right panel — white form surface */}
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
            Start your shelf
          </h2>
          <p className="font-sans text-sm text-ink/50 mb-8">
            Just a few details to get you set up.
          </p>

          {error && (
            <p className="font-sans text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 px-4 py-3 mb-6">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-ink/15 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
                placeholder="Jane Doe"
              />
            </div>

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
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-ink/15 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="font-sans text-sm text-ink/60 text-center mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-leather hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
