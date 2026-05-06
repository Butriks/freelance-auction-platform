import React, { useEffect, useState } from 'react';
import { getAdminAnalytics } from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';

const sections = [
  { key: 'users', title: 'Users', items: ['total', 'clients', 'freelancers', 'admins', 'blocked'] },
  { key: 'tasks', title: 'Tasks', items: ['total', 'open', 'inProgress', 'completed', 'cancelled'] },
  { key: 'contracts', title: 'Contracts', items: ['total', 'active', 'completed', 'disputed', 'cancelled'] },
  { key: 'bids', title: 'Bids', items: ['total', 'pending', 'accepted', 'rejected', 'averagePrice'] },
  { key: 'payments', title: 'Payments', items: ['totalDeposited', 'totalReleased'] },
  { key: 'reviews', title: 'Reviews', items: ['total', 'averageRating'] },
  { key: 'disputes', title: 'Disputes', items: ['total', 'open', 'resolved', 'rejected'] },
];

function labelFromKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getAdminAnalytics();

        if (isMounted) {
          setAnalytics(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load analytics.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageSection
      eyebrow="Admin"
      title="Marketplace analytics"
      description="High-level platform health across users, tasks, contracts, payments, reviews and disputes."
    >
      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading analytics</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && analytics ? (
        <div className="admin-analytics-stack">
          {sections.map((section) => (
            <section key={section.key} className="admin-analytics-section">
              <h3>{section.title}</h3>
              <div className="stats-grid admin-stats-grid">
                {section.items.map((item) => (
                  <article key={item} className="stat-card">
                    <span className="stat-card__label">{labelFromKey(item)}</span>
                    <strong className="stat-card__value">{analytics[section.key]?.[item] ?? 0}</strong>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </PageSection>
  );
}

export default AdminAnalyticsPage;
