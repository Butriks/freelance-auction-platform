import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="empty-state">
      <p className="empty-state__eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The route exists in the app shell, but this path does not match any page.</p>
      <Link className="btn btn-primary" to="/">
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
