import React from 'react';
import PageSection from '../components/PageSection.jsx';

const stats = [
  { label: 'Open Tasks', value: '18', caption: 'New work opportunities and client requests.' },
  { label: 'Active Contracts', value: '07', caption: 'Current delivery flow across milestones.' },
  { label: 'Notifications', value: '12', caption: 'Unread updates from bids, chat and reviews.' },
  { label: 'Analytics', value: '84%', caption: 'Healthy delivery trend and response rate.' },
];

function DashboardPage() {
  return (
    <div className="page-stack">
      <PageSection
        eyebrow="Overview"
        title="A clean operations cockpit for the marketplace"
        description="This dashboard is intentionally lightweight for now, but the layout is ready for real metrics, filters and live backend data."
      >
        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span className="stat-card__label">{stat.label}</span>
              <strong className="stat-card__value">{stat.value}</strong>
              <p className="stat-card__caption">{stat.caption}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <div className="content-grid">
        <article className="panel">
          <h3>Recent activity</h3>
          <ul className="activity-list">
            <li>New bid received for Landing Page Redesign.</li>
            <li>Milestone submitted for Mobile App UI contract.</li>
            <li>Review created after contract completion.</li>
          </ul>
        </article>

        <article className="panel">
          <h3>Quick notes</h3>
          <p>
            The layout already supports cards, lists, table surfaces and forms.
            The next step can be wiring in real dashboard metrics from backend analytics.
          </p>
        </article>
      </div>
    </div>
  );
}

export default DashboardPage;
