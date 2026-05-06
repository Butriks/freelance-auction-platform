import React, { useEffect, useMemo, useState } from 'react';
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

const typeLabels = {
  NEW_BID: 'New bid',
  BID_ACCEPTED: 'Bid accepted',
  CONTRACT_CREATED: 'Contract created',
  MILESTONE_SUBMITTED: 'Milestone submitted',
  MILESTONE_APPROVED: 'Milestone approved',
  MILESTONE_REJECTED: 'Milestone rejected',
  CONTRACT_COMPLETED: 'Contract completed',
  NEW_MESSAGE: 'New message',
  REVIEW_CREATED: 'New review',
  SYSTEM: 'System',
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : 'Just now';
}

function NotificationsPage() {
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
      setError(requestError.message || 'Unable to load notifications.');
      setNotifications([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [params]);

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
      setMessage('Notification marked as read.');
    } catch (requestError) {
      setMessage(requestError.message || 'Unable to mark notification as read.');
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
      setMessage('All notifications marked as read.');
    } catch (requestError) {
      setMessage(requestError.message || 'Unable to mark all notifications as read.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <PageSection
      eyebrow="Notifications"
      title="Inbox of marketplace events"
      description="Track bids, milestones, messages, reviews and system updates from one focused inbox."
      action={(
        <button className="btn btn-primary" type="button" disabled={isMutating || unreadCount === 0} onClick={handleMarkAllAsRead}>
          Mark all as read
        </button>
      )}
    >
      <div className="notification-summary">
        <article className="stat-card">
          <span className="stat-card__label">Unread</span>
          <strong className="stat-card__value">{unreadCount}</strong>
          <p className="stat-card__caption">Notifications waiting for attention.</p>
        </article>
      </div>

      <div className="filter-card notification-filter-card">
        <div className="segmented-control">
          <button className={`segment${readFilter === 'all' ? ' segment--active' : ''}`} type="button" onClick={() => handleReadFilterChange('all')}>All</button>
          <button className={`segment${readFilter === 'unread' ? ' segment--active' : ''}`} type="button" onClick={() => handleReadFilterChange('unread')}>Unread</button>
          <button className={`segment${readFilter === 'read' ? ' segment--active' : ''}`} type="button" onClick={() => handleReadFilterChange('read')}>Read</button>
        </div>

        <label className="form-field">
          <span>Type</span>
          <select value={typeFilter} onChange={handleTypeChange}>
            <option value="">All types</option>
            {notificationTypes.map((type) => (
              <option key={type} value={type}>{typeLabels[type]}</option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="form-success">{message}</p> : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading notifications</strong>
        </div>
      ) : null}

      {error ? (
        <div className="state-card state-card--error">
          <strong>{error}</strong>
        </div>
      ) : null}

      {!isLoading && !error && notifications.length === 0 ? (
        <div className="state-card">
          <strong>No notifications found</strong>
          <p>New platform events will appear here as work moves forward.</p>
        </div>
      ) : null}

      {!isLoading && !error && notifications.length > 0 ? (
        <>
          <div className="notification-list">
            {notifications.map((notification) => (
              <article key={notification.id} className={`notification-card${notification.isRead ? '' : ' notification-card--unread'}`}>
                <div className="notification-card__content">
                  <div className="notification-card__header">
                    <span className="type-badge">{typeLabels[notification.type] || notification.type}</span>
                    <span className={`read-badge${notification.isRead ? ' read-badge--read' : ''}`}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <time>{formatDate(notification.createdAt)}</time>
                </div>

                {!notification.isRead ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    disabled={isMutating}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as read
                  </button>
                ) : null}
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>
              Previous
            </button>
            <span>{count} notifications</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>
              Next
            </button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default NotificationsPage;
