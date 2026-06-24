import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="auth-shell">
      <section className="auth-shell__hero">
        <div className="auth-shell__hero-content">
          <p className="auth-shell__eyebrow">{t('common.appName')}</p>
          <h1>{t('auth.heroTitle')}</h1>
          <p>
            {t('auth.heroDescription')}
          </p>
          <div className="auth-shell__links">
            <Link className="btn btn-primary" to="/register">
              {t('auth.createAccount')}
            </Link>
            <Link className="btn btn-secondary" to="/login">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </section>

      <section className="auth-shell__panel">
        <Outlet />
      </section>
    </div>
  );
}

export default AuthLayout;
