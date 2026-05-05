import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: 'client@test.com',
    password: '12345678',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <p className="auth-card__eyebrow">Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <p>Use your account to manage tasks, bids, contracts and messages.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="client@test.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="12345678"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-card__footer">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default LoginPage;
