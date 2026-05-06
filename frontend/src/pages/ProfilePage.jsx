import React from 'react';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ProfilePage() {
  const { user } = useAuth();

  return (
    <PageSection
      eyebrow="Profile"
      title="Account overview"
      description="A simple profile shell for identity, role and future account settings."
    >
      <div className="detail-grid">
        <article className="panel">
          <h3>Current user</h3>
          <div className="profile-list">
            <span>Email</span>
            <strong>{user?.email || 'guest@example.com'}</strong>
            <span>Role</span>
            <strong>{user?.role || 'Guest'}</strong>
            <span>Status</span>
            <strong>{user?.status || 'N/A'}</strong>
            <span>Rating</span>
            <strong>{user?.rating ? Number(user.rating).toFixed(2) : 'Available after reviews'}</strong>
          </div>
        </article>
        <article className="panel">
          <h3>Next step</h3>
          <p>Later we can connect this page to backend profile data and edit forms.</p>
        </article>
      </div>
    </PageSection>
  );
}

export default ProfilePage;
