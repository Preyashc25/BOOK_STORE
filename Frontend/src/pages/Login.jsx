// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Replace with real authService.login(formData) call once service layer is wired up
      console.log('Login attempt:', formData);
      // On success: dispatch(setUser(response.data)) then navigate('/')
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <span className="font-sans text-xs uppercase tracking-widest text-oxblood">
          Welcome back
        </span>
        <h1 className="font-display text-3xl text-ink mt-2 tracking-tightish">
          Sign in to your shelf
        </h1>
      </div>

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
            className="w-full border border-ink/20 bg-parchment px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
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
            className="w-full border border-ink/20 bg-parchment px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-sans text-sm bg-leather text-parchment px-6 py-3 hover:bg-ink transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="font-sans text-sm text-ink/60 text-center mt-8">
        New here?{' '}
        <Link to="/signup" className="text-leather hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;