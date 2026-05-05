import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-shell__hero">
        <div className="auth-shell__hero-content">
          <p className="auth-shell__eyebrow">Freelance Auction Platform</p>
          <h1>Smart matching for projects, bids, contracts and delivery.</h1>
          <p>
            A clean starting point for clients, freelancers and admins to work
            inside one modern marketplace workspace.
          </p>
          <div className="auth-shell__links">
            <Link className="btn btn-primary" to="/register">
              Create account
            </Link>
            <Link className="btn btn-secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="auth-shell__panel">
        <Outlet />
      </section>
    </div>
  );
}

export default AuthLayout;
