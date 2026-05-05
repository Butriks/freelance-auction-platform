import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">Freelance Auction Platform</p>
        <h1 className="app-header__title">Workspace</h1>
      </div>

      <div className="user-menu">
        <div className="user-menu__info">
          <span className="user-menu__label">Signed in as</span>
          <strong>{user?.email || 'Guest'}</strong>
        </div>

        {isAuthenticated ? (
          <button className="btn btn-secondary" type="button" onClick={logout}>
            Logout
          </button>
        ) : (
          <button className="btn btn-secondary" type="button">
            User Menu
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
