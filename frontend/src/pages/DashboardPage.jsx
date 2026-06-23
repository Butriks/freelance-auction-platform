import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminAnalytics,
  getAdminDisputes,
  getAdminLogs,
} from '../api/adminApi.js';
import { getMyContracts } from '../api/contractApi.js';
import { getMyDisputes } from '../api/disputeApi.js';
import { getNotifications } from '../api/notificationApi.js';
import { getTasks } from '../api/taskApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

const emptySection = { data: null, error: '', loading: true };

const quickActionsByRole = {
  CLIENT: [
    { title: 'Create new task', text: 'Post work and start collecting freelancer bids.', to: '/tasks/create' },
    { title: 'View my contracts', text: 'Track escrow, milestones and delivery progress.', to: '/contracts' },
    { title: 'View notifications', text: 'Review bids, messages and contract events.', to: '/notifications' },
    { title: 'My disputes', text: 'Follow disputes opened on your contracts.', to: '/disputes/my' },
  ],
  FREELANCER: [
    { title: 'Browse tasks', text: 'Find open marketplace tasks ready for bids.', to: '/tasks' },
    { title: 'My contracts', text: 'Manage delivery, milestones and chat.', to: '/contracts' },
    { title: 'Notifications', text: 'Stay current on approvals, messages and reviews.', to: '/notifications' },
    { title: 'My disputes', text: 'Track dispute status for your contract work.', to: '/disputes/my' },
  ],
  ADMIN: [
    { title: 'Users management', text: 'Review accounts, roles and access states.', to: '/admin/users' },
    { title: 'Analytics', text: 'Open marketplace metrics and totals.', to: '/admin/analytics' },
    { title: 'Open disputes', text: 'Resolve disputes that need admin review.', to: '/admin/disputes' },
    { title: 'Logs', text: 'Audit important platform actions.', to: '/admin/logs' },
  ],
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

function getContractTitle(contract) {
  return contract.task?.title || `Contract #${contract.id}`;
}

function getDisputeTitle(dispute) {
  return dispute.contract?.task?.title || `Contract #${dispute.contractId}`;
}

function getItems(data, key) {
  return data?.[key] || data?.rows || [];
}

function getCount(data, items) {
  return data?.count ?? items.length;
}

function DashboardStatCard({ label, value, caption }) {
  return (
    <article className="stat-card dashboard-stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {caption ? <p className="stat-card__caption">{caption}</p> : null}
    </article>
  );
}

function DashboardActionCard({ action }) {
  return (
    <article className="panel cta-panel dashboard-action-card">
      <div>
        <h3>{action.title}</h3>
        <p>{action.text}</p>
      </div>
      <Link className="btn btn-primary" to={action.to}>Open</Link>
    </article>
  );
}

function DashboardSection({
  title,
  description,
  state,
  emptyText,
  children,
}) {
  return (
    <article className="panel dashboard-section">
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>

      {state.loading ? (
        <div className="dashboard-inline-state">
          <span className="loading-state__spinner" />
          <strong>Loading</strong>
        </div>
      ) : null}

      {!state.loading && state.error ? (
        <div className="dashboard-inline-state dashboard-inline-state--error">
          <strong>Could not load this section</strong>
          <p>{state.error}</p>
        </div>
      ) : null}

      {!state.loading && !state.error ? children : null}

      {!state.loading && !state.error && !children ? (
        <div className="dashboard-inline-state">
          <strong>{emptyText}</strong>
        </div>
      ) : null}
    </article>
  );
}

function SimpleList({ items, renderItem, emptyText }) {
  if (!items?.length) {
    return (
      <div className="dashboard-inline-state">
        <strong>{emptyText}</strong>
      </div>
    );
  }

  return (
    <div className="dashboard-list">
      {items.map(renderItem)}
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [sections, setSections] = useState({
    tasks: emptySection,
    contracts: emptySection,
    disputes: emptySection,
    notifications: emptySection,
    analytics: emptySection,
    adminDisputes: emptySection,
    adminLogs: emptySection,
  });

  const role = user?.role;
  const quickActions = quickActionsByRole[role] || [];

  useEffect(() => {
    let isMounted = true;

    const setSection = (name, nextState) => {
      if (!isMounted) {
        return;
      }

      setSections((current) => ({
        ...current,
        [name]: {
          ...current[name],
          ...nextState,
        },
      }));
    };

    const loadSection = async (name, request) => {
      setSection(name, { loading: true, error: '' });

      try {
        const { data } = await request();
        setSection(name, { data, loading: false, error: '' });
      } catch (requestError) {
        setSection(name, {
          data: null,
          loading: false,
          error: requestError.message || 'Request failed.',
        });
      }
    };

    setSections({
      tasks: emptySection,
      contracts: emptySection,
      disputes: emptySection,
      notifications: emptySection,
      analytics: emptySection,
      adminDisputes: emptySection,
      adminLogs: emptySection,
    });

    if (role === 'CLIENT') {
      loadSection('tasks', () => getTasks({ limit: 5, offset: 0 }));
      loadSection('contracts', () => getMyContracts({ limit: 5, offset: 0 }));
      loadSection('disputes', () => getMyDisputes({ limit: 5, offset: 0 }));
      loadSection('notifications', () => getNotifications({ limit: 5, offset: 0 }));
    } else if (role === 'FREELANCER') {
      loadSection('tasks', () => getTasks({ status: 'OPEN', limit: 5, offset: 0 }));
      loadSection('contracts', () => getMyContracts({ limit: 5, offset: 0 }));
      loadSection('notifications', () => getNotifications({ limit: 5, offset: 0 }));
    } else if (role === 'ADMIN') {
      loadSection('analytics', getAdminAnalytics);
      loadSection('adminDisputes', () => getAdminDisputes({ status: 'OPEN', limit: 5, offset: 0 }));
      loadSection('adminLogs', () => getAdminLogs({ limit: 5, offset: 0 }));
      loadSection('notifications', () => getNotifications({ limit: 5, offset: 0 }));
    }

    return () => {
      isMounted = false;
    };
  }, [role]);

  const analyticsCards = useMemo(() => {
    const analytics = sections.analytics.data;

    if (!analytics) {
      return [];
    }

    return [
      { label: 'Total users', value: analytics.users?.total ?? 0, caption: 'Registered platform accounts.' },
      { label: 'Total tasks', value: analytics.tasks?.total ?? 0, caption: 'Marketplace task volume.' },
      { label: 'Active contracts', value: analytics.contracts?.active ?? 0, caption: 'Contracts currently in delivery.' },
      { label: 'Completed contracts', value: analytics.contracts?.completed ?? 0, caption: 'Finished contract work.' },
      { label: 'Open disputes', value: analytics.disputes?.open ?? 0, caption: 'Needs admin attention.' },
      { label: 'Total deposited', value: formatMoney(analytics.payments?.totalDeposited), caption: 'Mock escrow deposits.' },
      { label: 'Total released', value: formatMoney(analytics.payments?.totalReleased), caption: 'Mock released funds.' },
      { label: 'Average rating', value: analytics.reviews?.averageRating ?? 0, caption: 'Average review score.' },
    ];
  }, [sections.analytics.data]);

  const tasks = getItems(sections.tasks.data, 'tasks');
  const contracts = getItems(sections.contracts.data, 'contracts');
  const disputes = getItems(sections.disputes.data, 'disputes');
  const notifications = getItems(sections.notifications.data, 'notifications');
  const adminDisputes = getItems(sections.adminDisputes.data, 'disputes');
  const adminLogs = getItems(sections.adminLogs.data, 'logs');

  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <div>
          <p className="page-section__eyebrow">Dashboard</p>
          <h2>Welcome back, {user?.email || 'user'}</h2>
          <p>Here is the current state of your marketplace workspace.</p>
        </div>
        <div className="dashboard-hero__badges">
          <span className="role-badge">{user?.role || 'UNKNOWN'}</span>
          <span className={`status-pill status-pill--${user?.status?.toLowerCase() || 'active'}`}>{user?.status || 'ACTIVE'}</span>
        </div>
      </section>

      <PageSection
        eyebrow="Quick actions"
        title="Start from here"
        description="Shortcuts are tailored to your current role."
      >
        <div className="dashboard-actions-grid">
          {quickActions.length ? quickActions.map((action) => (
            <DashboardActionCard key={action.to} action={action} />
          )) : (
            <div className="state-card">
              <strong>No role-specific actions available.</strong>
            </div>
          )}
        </div>
      </PageSection>

      {role === 'ADMIN' ? (
        <PageSection
          eyebrow="Analytics"
          title="Admin overview"
          description="Live platform metrics from the backend analytics endpoint."
        >
          {sections.analytics.loading ? (
            <div className="state-card">
              <span className="loading-state__spinner" />
              <strong>Loading analytics</strong>
            </div>
          ) : null}

          {!sections.analytics.loading && sections.analytics.error ? (
            <div className="state-card state-card--error">
              <strong>Could not load analytics</strong>
              <p>{sections.analytics.error}</p>
            </div>
          ) : null}

          {!sections.analytics.loading && !sections.analytics.error ? (
            <div className="stats-grid dashboard-stats-grid">
              {analyticsCards.map((card) => (
                <DashboardStatCard key={card.label} {...card} />
              ))}
            </div>
          ) : null}
        </PageSection>
      ) : role === 'CLIENT' || role === 'FREELANCER' ? (
        <PageSection
          eyebrow="Summary"
          title="Your work at a glance"
          description="A compact preview of marketplace activity relevant to you."
        >
          <div className="stats-grid dashboard-stats-grid">
            <DashboardStatCard
              label={role === 'CLIENT' ? 'Recent tasks' : 'Open tasks'}
              value={getCount(sections.tasks.data, tasks)}
              caption={role === 'CLIENT' ? 'Recent marketplace tasks preview.' : 'Tasks currently open for bidding.'}
            />
            <DashboardStatCard
              label="Contracts"
              value={getCount(sections.contracts.data, contracts)}
              caption="Contracts connected to your account."
            />
            <DashboardStatCard
              label="Unread notifications"
              value={unreadCount}
              caption="Events waiting for your attention."
            />
            {role === 'CLIENT' ? (
              <DashboardStatCard
                label="My disputes"
                value={getCount(sections.disputes.data, disputes)}
                caption="Disputes opened on your contracts."
              />
            ) : null}
          </div>
        </PageSection>
      ) : (
        <div className="state-card">
          <strong>Dashboard is not available for this role.</strong>
          <p>Please contact an administrator if your account role looks incorrect.</p>
        </div>
      )}

      <div className="dashboard-section-grid">
        {role === 'CLIENT' ? (
          <>
            <DashboardSection
              title="Recent marketplace tasks"
              description="Backend currently exposes marketplace tasks; owned-task filtering is applied only when profile data is available."
              state={sections.tasks}
            >
              <SimpleList
                items={tasks}
                emptyText="No recent tasks found."
                renderItem={(task) => (
                  <Link key={task.id} className="dashboard-list-row" to={`/tasks/${task.id}`}>
                    <strong>{task.title}</strong>
                    <span>{task.status} - {formatMoney(task.budget)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title="My contracts" state={sections.contracts}>
              <SimpleList
                items={contracts}
                emptyText="No contracts yet."
                renderItem={(contract) => (
                  <Link key={contract.id} className="dashboard-list-row" to={`/contracts/${contract.id}`}>
                    <strong>{getContractTitle(contract)}</strong>
                    <span>{contract.status} - {formatMoney(contract.totalAmount)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title="My disputes" state={sections.disputes}>
              <SimpleList
                items={disputes}
                emptyText="No disputes yet."
                renderItem={(dispute) => (
                  <Link key={dispute.id} className="dashboard-list-row" to={`/contracts/${dispute.contractId}`}>
                    <strong>{getDisputeTitle(dispute)}</strong>
                    <span>{dispute.status} - {formatDate(dispute.createdAt)}</span>
                  </Link>
                )}
              />
            </DashboardSection>
          </>
        ) : null}

        {role === 'FREELANCER' ? (
          <>
            <DashboardSection title="Open tasks" state={sections.tasks}>
              <SimpleList
                items={tasks}
                emptyText="No open tasks found."
                renderItem={(task) => (
                  <Link key={task.id} className="dashboard-list-row" to={`/tasks/${task.id}`}>
                    <strong>{task.title}</strong>
                    <span>{task.category?.name || 'No category'} - {formatMoney(task.budget)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title="My contracts" state={sections.contracts}>
              <SimpleList
                items={contracts}
                emptyText="No contracts yet."
                renderItem={(contract) => (
                  <Link key={contract.id} className="dashboard-list-row" to={`/contracts/${contract.id}`}>
                    <strong>{getContractTitle(contract)}</strong>
                    <span>{contract.status} - {formatMoney(contract.totalAmount)}</span>
                  </Link>
                )}
              />
            </DashboardSection>
          </>
        ) : null}

        {role === 'ADMIN' ? (
          <>
            <DashboardSection title="Open disputes" state={sections.adminDisputes}>
              <SimpleList
                items={adminDisputes}
                emptyText="No open disputes."
                renderItem={(dispute) => (
                  <Link key={dispute.id} className="dashboard-list-row" to="/admin/disputes">
                    <strong>Dispute #{dispute.id}</strong>
                    <span>Contract #{dispute.contractId} - {formatDate(dispute.createdAt)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title="Recent logs" state={sections.adminLogs}>
              <SimpleList
                items={adminLogs}
                emptyText="No recent logs."
                renderItem={(log) => (
                  <Link key={log.id} className="dashboard-list-row" to="/admin/logs">
                    <strong>{log.action}</strong>
                    <span>{log.entityType} #{log.entityId || 'N/A'} - {formatDate(log.createdAt)}</span>
                  </Link>
                )}
              />
            </DashboardSection>
          </>
        ) : null}

        <DashboardSection title="Latest notifications" state={sections.notifications}>
          <SimpleList
            items={notifications}
            emptyText="No notifications yet."
            renderItem={(notification) => (
              <Link key={notification.id} className="dashboard-list-row" to="/notifications">
                <strong>{notification.title}</strong>
                <span>{notification.type} - {formatDate(notification.createdAt)}</span>
              </Link>
            )}
          />
        </DashboardSection>
      </div>
    </div>
  );
}

export default DashboardPage;
