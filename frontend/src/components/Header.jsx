import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">{t('common.appName')}</p>
        <h1 className="app-header__title">{t('common.workspace')}</h1>
      </div>

      <div className="user-menu">
        <LanguageSwitcher />

        <Link className="notification-link" to="/notifications">
          {t('header.notifications')}
          {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
        </Link>

        <div className="user-menu__info">
          <span className="user-menu__label">{t('header.signedInAs')}</span>
          <strong>{user?.email || t('header.guest')}</strong>
          {user?.role ? <span className="role-badge">{user.role}</span> : null}
        </div>

        <button className="btn btn-secondary" type="button" onClick={handleLogout}>
          {t('header.logout')}
        </button>
      </div>
    </header>
  );
}

export default Header;
