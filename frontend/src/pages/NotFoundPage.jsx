import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="empty-state">
      <p className="empty-state__eyebrow">404</p>
      <h1>{t('common.notFound')}</h1>
      <p>{t('common.notFoundText')}</p>
      <Link className="btn btn-primary" to="/">
        {t('common.backToDashboard')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
