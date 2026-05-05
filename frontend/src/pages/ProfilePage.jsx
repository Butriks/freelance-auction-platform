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
          <p>Email: {user?.email || 'guest@example.com'}</p>
          <p>Role: {user?.role || 'Guest'}</p>
          <p>Status: {user?.status || 'N/A'}</p>
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
