import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
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
      setError(requestError.message || t('auth.unableToSignIn'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <p className="auth-card__eyebrow">{t('auth.welcomeBack')}</p>
        <h2>{t('auth.signInTitle')}</h2>
        <p>{t('auth.signInDescription')}</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>{t('common.email')}</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            required
          />
        </label>

        <label className="form-field">
          <span>{t('common.password')}</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('auth.passwordPlaceholder')}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </button>
      </form>

      <p className="auth-card__footer">
        {t('auth.newHere')} <Link to="/register">{t('auth.createAccount')}</Link>
      </p>
    </div>
  );
}

export default LoginPage;
