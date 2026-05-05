import React from 'react';
import PageSection from '../components/PageSection.jsx';

function AdminAnalyticsPage() {
  return (
    <PageSection
      eyebrow="Admin"
      title="Marketplace analytics"
      description="A visual placeholder for backend analytics blocks across users, tasks, contracts and disputes."
    >
      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">Users</span>
          <strong className="stat-card__value">1,284</strong>
          <p className="stat-card__caption">Clients, freelancers and admins overview.</p>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Tasks</span>
          <strong className="stat-card__value">372</strong>
          <p className="stat-card__caption">Open, active and completed work pipeline.</p>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Contracts</span>
          <strong className="stat-card__value">96</strong>
          <p className="stat-card__caption">Escrow-backed delivery and dispute health.</p>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Disputes</span>
          <strong className="stat-card__value">04</strong>
          <p className="stat-card__caption">A small placeholder for admin oversight.</p>
        </article>
      </div>
    </PageSection>
  );
}

export default AdminAnalyticsPage;
