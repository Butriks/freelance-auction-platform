import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import TaskDetailsPage from '../pages/TaskDetailsPage.jsx';
import CreateTaskPage from '../pages/CreateTaskPage.jsx';
import ContractsPage from '../pages/ContractsPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        <Route path="/tasks/create" element={<CreateTaskPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/app" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
