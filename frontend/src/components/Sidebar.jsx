import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../utils/navigation.js';

function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <span className="app-sidebar__logo">FA</span>
        <div>
          <strong>Freelance Auction</strong>
          <p>Client and freelancer workspace</p>
        </div>
      </div>

      <nav className="app-sidebar__nav" aria-label="Sidebar navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
          >
            <span className="nav-link__icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
