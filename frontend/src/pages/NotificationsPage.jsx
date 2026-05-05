import React from 'react';
import PageSection from '../components/PageSection.jsx';

const mockNotifications = [
  'New bid received for your landing page task.',
  'Milestone submitted for review.',
  'You received a new message in contract chat.',
];

function NotificationsPage() {
  return (
    <PageSection
      eyebrow="Notifications"
      title="Inbox of marketplace events"
      description="Ready for backend data, read states and filters."
    >
      <div className="list-card">
        {mockNotifications.map((item) => (
          <div key={item} className="list-row">
            <div>
              <strong>{item}</strong>
              <p>Just now</p>
            </div>
            <button className="btn btn-secondary" type="button">Mark read</button>
          </div>
        ))}
      </div>
    </PageSection>
  );
}

export default NotificationsPage;
