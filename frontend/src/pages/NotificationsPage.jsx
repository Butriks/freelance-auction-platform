import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNotifications } from '../api/notificationApi.js';
import PageSection from '../components/PageSection.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

const limit = 20;
const notificationTypes = [
  'NEW_BID',
  'BID_ACCEPTED',
  'CONTRACT_CREATED',
  'MILESTONE_SUBMITTED',
  'MILESTONE_APPROVED',
  'MILESTONE_REJECTED',
  'CONTRACT_COMPLETED',
  'NEW_MESSAGE',
  'REVIEW_CREATED',
  'SYSTEM',
];

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleString() : fallback;
}

function NotificationsPage() {
  const { t } = useTranslation();
  const {
    unreadCount,
    latestNotification,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [readFilter, setReadFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const params = useMemo(() => ({
    limit,
    offset,
    type: typeFilter || undefined,
    isRead: readFilter === 'all' ? undefined : readFilter === 'read',
  }), [offset, readFilter, typeFilter]);
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < count;

  const loadNotifications = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await getNotifications(params);
      setNotifications(data.notifications || []);
      setCount(data.count || 0);
      await refreshUnreadCount();
    } catch (requestError) {
      setError(requestError.message || t('notifications.unableToLoad'));
      setNotifications([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [params, t]);

  useEffect(() => {
    if (!latestNotification) {
      return;
    }

    const matchesReadFilter = readFilter === 'all'
      || (readFilter === 'unread' && !latestNotification.isRead)
      || (readFilter === 'read' && latestNotification.isRead);
    const matchesTypeFilter = !typeFilter || latestNotification.type === typeFilter;

    if (!matchesReadFilter || !matchesTypeFilter) {
      return;
    }

    setNotifications((currentNotifications) => {
      if (currentNotifications.some((notification) => notification.id === latestNotification.id)) {
        return currentNotifications;
      }

      return [latestNotification, ...currentNotifications].slice(0, limit);
    });
    setCount((current) => current + 1);
  }, [latestNotification, readFilter, typeFilter]);

  const handleReadFilterChange = (nextFilter) => {
    setReadFilter(nextFilter);
    setOffset(0);
  };

  const handleTypeChange = (event) => {
    setTypeFilter(event.target.value);
    setOffset(0);
  };

  const handleMarkAsRead = async (id) => {
    setIsMutating(true);
    setMessage('');

    try {
      const notification = await markAsRead(id);
      setNotifications((currentNotifications) => currentNotifications.map((item) => (
        item.id === id ? notification : item
      )));
      setMessage(t('notifications.markedRead'));
    } catch (requestError) {
      setMessage(requestError.message || t('notifications.unableToMark'));
    } finally {
      setIsMutating(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMutating(true);
    setMessage('');

    try {
      await markAllAsRead();
      setNotifications((currentNotifications) => currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })));
      setMessage(t('notifications.allMarkedRead'));
    } catch (requestError) {
      setMessage(requestError.message || t('notifications.unableToMark'));
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <PageSection
      eyebrow={t('notifications.eyebrow')}
      title={t('notifications.title')}
      description={t('notifications.description')}
      action={(
        <button className="btn btn-primary" type="button" disabled={isMutating || unreadCount === 0} onClick={handleMarkAllAsRead}>
          {isMutating ? t('notifications.marking') : t('notifications.markAll')}
        </button>
      )}
    >
      <div className="notification-summary">
        <article className="stat-card">
          <span className="stat-card__label">{t('notifications.unread')}</span>
          <strong className="stat-card__value">{unreadCount}</strong>
          <p className="stat-card__caption">{t('dashboard.stats.unreadCaption')}</p>
        </article>
      </div>

      <div className="filter-card notification-filter-card">
        <div className="segmented-control">
          <button className={`segment${readFilter === 'all' ? ' segment--active' : ''}`} type="button" onClick={() => handleReadFilterChange('all')}>{t('notifications.all')}</button>
          <button className={`segment${readFilter === 'unread' ? ' segment--active' : ''}`} type="button" onClick={() => handleReadFilterChange('unread')}>{t('notifications.unread')}</button>
          <button className={`segment${readFilter === 'read' ? ' segment--active' : ''}`} type="button" onClick={() => handleReadFilterChange('read')}>{t('notifications.read')}</button>
        </div>

        <label className="form-field">
          <span>{t('notifications.type')}</span>
          <select value={typeFilter} onChange={handleTypeChange}>
            <option value="">{t('notifications.allTypes')}</option>
            {notificationTypes.map((type) => (
              <option key={type} value={type}>{t(`notificationTypes.${type}`)}</option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="form-success">{message}</p> : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('notifications.loading')}</strong>
        </div>
      ) : null}

      {error ? (
        <div className="state-card state-card--error">
          <strong>{error}</strong>
        </div>
      ) : null}

      {!isLoading && !error && notifications.length === 0 ? (
        <div className="state-card">
          <strong>{t('notifications.empty')}</strong>
          <p>{t('notifications.emptyText')}</p>
        </div>
      ) : null}

      {!isLoading && !error && notifications.length > 0 ? (
        <>
          <div className="notification-list">
            {notifications.map((notification) => (
              <article key={notification.id} className={`notification-card${notification.isRead ? '' : ' notification-card--unread'}`}>
                <div className="notification-card__content">
                  <div className="notification-card__header">
                    <span className="type-badge">{t(`notificationTypes.${notification.type}`)}</span>
                    <span className={`read-badge${notification.isRead ? ' read-badge--read' : ''}`}>
                      {notification.isRead ? t('notifications.readState') : t('notifications.unreadState')}
                    </span>
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <time>{formatDate(notification.createdAt, t('bids.recently'))}</time>
                </div>

                {!notification.isRead ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={isMutating}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    {t('notifications.markRead')}
                  </button>
                ) : null}
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>
              {t('common.previous')}
            </button>
            <span>{count} {t('navigation.notifications').toLowerCase()}</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>
              {t('common.next')}
            </button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default NotificationsPage;
