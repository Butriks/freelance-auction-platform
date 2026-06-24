import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = {
  role: 'CLIENT',
  email: '',
  password: '',
  companyName: '',
  description: '',
  firstName: '',
  lastName: '',
  bio: '',
  hourlyRate: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
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

    const payload = {
      email: form.email,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'CLIENT') {
      payload.companyName = form.companyName;
      payload.description = form.description;
    } else {
      payload.firstName = form.firstName;
      payload.lastName = form.lastName;
      payload.bio = form.bio;
      payload.hourlyRate = form.hourlyRate ? Number(form.hourlyRate) : null;
    }

    try {
      await register(payload);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || t('auth.unableToRegister'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card auth-card--wide">
      <div className="auth-card__header">
        <p className="auth-card__eyebrow">{t('auth.createAccount')}</p>
        <h2>{t('auth.registerTitle')}</h2>
        <p>{t('auth.registerDescription')}</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>{t('common.role')}</span>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="CLIENT">{t('auth.client')}</option>
            <option value="FREELANCER">{t('auth.freelancer')}</option>
          </select>
        </label>

        <div className="form-grid form-grid--columns">
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
              placeholder={t('auth.newPasswordPlaceholder')}
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        {form.role === 'CLIENT' ? (
          <div className="form-grid form-grid--columns">
            <label className="form-field">
              <span>{t('auth.companyName')}</span>
              <input
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                placeholder={t('auth.companyPlaceholder')}
                required
              />
            </label>

            <label className="form-field">
              <span>{t('common.description')}</span>
              <input
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                placeholder={t('auth.clientDescriptionPlaceholder')}
              />
            </label>
          </div>
        ) : (
          <>
            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>{t('auth.firstName')}</span>
                <input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Ivan"
                  required
                />
              </label>

              <label className="form-field">
                <span>{t('auth.lastName')}</span>
                <input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Ivanov"
                  required
                />
              </label>
            </div>

            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>{t('auth.bio')}</span>
                <input
                  name="bio"
                  type="text"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Node.js developer"
                />
              </label>

              <label className="form-field">
                <span>{t('auth.hourlyRate')}</span>
                <input
                  name="hourlyRate"
                  type="number"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="20"
                  min="1"
                  required
                />
              </label>
            </div>
          </>
        )}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </button>
      </form>

      <p className="auth-card__footer">
        {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.signIn')}</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
