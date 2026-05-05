import React from 'react';
import { Link } from 'react-router-dom';

function AccessDeniedPage() {
  return (
    <div className="empty-state empty-state--panel">
      <p className="empty-state__eyebrow">Access denied</p>
      <h1>You do not have access to this page</h1>
      <p>Your account role does not allow opening this section.</p>
      <Link className="btn btn-primary" to="/">
        Back to dashboard
      </Link>
    </div>
  );
}

export default AccessDeniedPage;
