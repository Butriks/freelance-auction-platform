import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AccessDeniedPage() {
  const { t } = useTranslation();

  return (
    <div className="empty-state empty-state--panel">
      <p className="empty-state__eyebrow">{t('common.accessDenied')}</p>
      <h1>{t('common.accessDeniedTitle')}</h1>
      <p>{t('common.accessDeniedText')}</p>
      <Link className="btn btn-primary" to="/">
        {t('common.backToDashboard')}
      </Link>
    </div>
  );
}

export default AccessDeniedPage;
