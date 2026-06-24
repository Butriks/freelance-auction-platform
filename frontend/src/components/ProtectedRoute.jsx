import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-state__card">
          <span className="loading-state__spinner" />
          <strong>{t('common.loadingWorkspace')}</strong>
          <p>{t('common.checkingSession')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <AccessDeniedPage />;
  }

  return children;
}

export default ProtectedRoute;
