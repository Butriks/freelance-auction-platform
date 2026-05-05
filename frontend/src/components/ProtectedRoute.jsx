import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-state__card">
          <span className="loading-state__spinner" />
          <strong>Loading workspace</strong>
          <p>Checking your session...</p>
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
