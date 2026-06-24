import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminAnalytics } from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';

const sections = [
  { key: 'users', titleKey: 'dashboard.stats.totalUsers', items: ['total', 'clients', 'freelancers', 'admins', 'blocked'] },
  { key: 'tasks', titleKey: 'dashboard.stats.totalTasks', items: ['total', 'open', 'inProgress', 'completed', 'cancelled'] },
  { key: 'contracts', titleKey: 'dashboard.stats.contracts', items: ['total', 'active', 'completed', 'disputed', 'cancelled'] },
  { key: 'bids', titleKey: 'bids.eyebrow', items: ['total', 'pending', 'accepted', 'rejected', 'averagePrice'] },
  { key: 'payments', titleKey: 'contracts.paymentsTitle', items: ['totalDeposited', 'totalReleased'] },
  { key: 'reviews', titleKey: 'reviews.title', items: ['total', 'averageRating'] },
  { key: 'disputes', titleKey: 'disputes.eyebrow', items: ['total', 'open', 'resolved', 'rejected'] },
];

function labelFromKey(key, t) {
  const labels = {
    total: t('dashboard.stats.totalTasks').replace(' tasks', ''),
    clients: 'CLIENT',
    freelancers: 'FREELANCER',
    admins: 'ADMIN',
    blocked: t('status.BLOCKED'),
    open: t('status.OPEN'),
    inProgress: t('status.IN_PROGRESS'),
    completed: t('status.COMPLETED'),
    cancelled: t('status.CANCELLED'),
    active: t('status.ACTIVE'),
    disputed: t('status.DISPUTED'),
    pending: t('status.PENDING'),
    accepted: t('status.ACCEPTED'),
    rejected: t('status.REJECTED'),
    resolved: t('status.RESOLVED'),
    averagePrice: t('admin.averagePrice'),
    totalDeposited: t('dashboard.stats.totalDeposited'),
    totalReleased: t('dashboard.stats.totalReleased'),
    averageRating: t('dashboard.stats.averageRating'),
  };

  return labels[key] || key;
}

function AdminAnalyticsPage() {
  const { t } = useTranslation();
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
          setError(requestError.message || t('dashboard.couldNotLoadAnalytics'));
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
  }, [t]);

  return (
    <PageSection
      eyebrow={t('admin.eyebrow')}
      title={t('admin.analyticsTitle')}
      description={t('admin.analyticsDescription')}
    >
      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('admin.loadingAnalytics')}</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && analytics ? (
        <div className="admin-analytics-stack">
          {sections.map((section) => (
            <section key={section.key} className="admin-analytics-section">
              <h3>{t(section.titleKey)}</h3>
              <div className="stats-grid admin-stats-grid">
                {section.items.map((item) => (
                  <article key={item} className="stat-card">
                    <span className="stat-card__label">{labelFromKey(item, t)}</span>
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
