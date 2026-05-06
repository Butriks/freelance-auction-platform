import React from 'react';
import { Link } from 'react-router-dom';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const stats = [
  { label: 'Open Tasks', value: '18', caption: 'New work opportunities and client requests.' },
  { label: 'Active Contracts', value: '07', caption: 'Current delivery flow across milestones.' },
  { label: 'Notifications', value: '12', caption: 'Unread updates from bids, chat and reviews.' },
  { label: 'Analytics', value: '84%', caption: 'Healthy delivery trend and response rate.' },
];

const ctasByRole = {
  CLIENT: [
    { title: 'Create a task', text: 'Post a new project and start receiving bids.', to: '/tasks/create' },
    { title: 'Review bids on your tasks', text: 'Open your task board and compare freelancer offers.', to: '/tasks' },
    { title: 'View contracts', text: 'Track accepted bids, escrow and delivery milestones.', to: '/contracts' },
  ],
  FREELANCER: [
    { title: 'Browse open tasks', text: 'Find open tasks and prepare your next bid.', to: '/tasks' },
    { title: 'My contracts', text: 'Track active work and milestone delivery.', to: '/contracts' },
  ],
  ADMIN: [
    { title: 'Admin analytics', text: 'Open the marketplace metrics overview.', to: '/admin/analytics' },
    { title: 'Users management', text: 'Review accounts, roles and access states.', to: '/admin/users' },
    { title: 'All contracts', text: 'Review marketplace contracts from one workspace.', to: '/contracts' },
  ],
};

function DashboardPage() {
  const { user } = useAuth();
  const ctas = ctasByRole[user?.role] || [];

  return (
    <div className="page-stack">
      <PageSection
        eyebrow="Overview"
        title="A clean operations cockpit for the marketplace"
        description="Use the quick actions for your role, then move into tasks, contracts and administration as the workflow grows."
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
        {ctas.map((item) => (
          <article key={item.title} className="panel cta-panel">
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <Link className="btn btn-primary" to={item.to}>Open</Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
