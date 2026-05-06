import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import TaskDetailsPage from '../pages/TaskDetailsPage.jsx';
import CreateTaskPage from '../pages/CreateTaskPage.jsx';
import ContractsPage from '../pages/ContractsPage.jsx';
import ContractDetailsPage from '../pages/ContractDetailsPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          )}
        />
      </Route>

      <Route
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        <Route
          path="/tasks/create"
          element={(
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <CreateTaskPage />
            </ProtectedRoute>
          )}
        />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/contracts/:id" element={<ContractDetailsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/admin/users"
          element={(
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/analytics"
          element={(
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          )}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/app" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
