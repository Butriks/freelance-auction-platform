import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
          {user?.role ? <span className="role-badge">{user.role}</span> : null}
        </div>

        <button className="btn btn-secondary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
