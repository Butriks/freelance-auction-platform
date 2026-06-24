import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { navigationItems } from '../utils/navigation.js';

function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const items = navigationItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <span className="app-sidebar__logo">FA</span>
        <div>
          <strong>Freelance Auction</strong>
          <p>{t('navigation.brandSubtitle')}</p>
        </div>
      </div>

      <nav className="app-sidebar__nav" aria-label="Sidebar navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
          >
            <span className="nav-link__icon">{item.icon}</span>
            <span>{t(item.labelKey)}</span>
            {item.to === '/notifications' && unreadCount > 0 ? (
              <span className="notification-badge notification-badge--nav">{unreadCount}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
