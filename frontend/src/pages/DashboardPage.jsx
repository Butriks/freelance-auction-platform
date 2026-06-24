import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function getQuickActions(t) {
  return {
    CLIENT: [
      { title: t('dashboard.cards.createTask'), text: t('dashboard.cards.createTaskText'), to: '/tasks/create' },
      { title: t('dashboard.cards.viewContracts'), text: t('dashboard.cards.viewContractsText'), to: '/contracts' },
      { title: t('dashboard.cards.viewNotifications'), text: t('dashboard.cards.viewNotificationsText'), to: '/notifications' },
      { title: t('dashboard.myDisputes'), text: t('dashboard.cards.myDisputesText'), to: '/disputes/my' },
    ],
    FREELANCER: [
      { title: t('dashboard.cards.browseTasks'), text: t('dashboard.cards.browseTasksText'), to: '/tasks' },
      { title: t('dashboard.myContracts'), text: t('dashboard.cards.freelancerContractsText'), to: '/contracts' },
      { title: t('navigation.notifications'), text: t('dashboard.cards.freelancerNotificationsText'), to: '/notifications' },
      { title: t('dashboard.myDisputes'), text: t('dashboard.cards.freelancerDisputesText'), to: '/disputes/my' },
    ],
    ADMIN: [
      { title: t('dashboard.cards.usersManagement'), text: t('dashboard.cards.usersManagementText'), to: '/admin/users' },
      { title: t('dashboard.cards.analytics'), text: t('dashboard.cards.analyticsText'), to: '/admin/analytics' },
      { title: t('dashboard.openDisputes'), text: t('dashboard.cards.adminDisputesText'), to: '/admin/disputes' },
      { title: t('dashboard.cards.logs'), text: t('dashboard.cards.logsText'), to: '/admin/logs' },
    ],
  };
}

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

function DashboardActionCard({ action, t }) {
  return (
    <article className="panel cta-panel dashboard-action-card">
      <div>
        <h3>{action.title}</h3>
        <p>{action.text}</p>
      </div>
      <Link className="btn btn-primary" to={action.to}>{t('common.open')}</Link>
    </article>
  );
}

function DashboardSection({
  title,
  description,
  state,
  emptyText,
  children,
  t,
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
          <strong>{t('common.loading')}</strong>
        </div>
      ) : null}

      {!state.loading && state.error ? (
        <div className="dashboard-inline-state dashboard-inline-state--error">
          <strong>{t('dashboard.couldNotLoadSection')}</strong>
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
  const { t } = useTranslation();
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
  const quickActions = getQuickActions(t)[role] || [];

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
          error: requestError.message || t('common.couldNotLoad'),
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
      { label: t('dashboard.stats.totalUsers'), value: analytics.users?.total ?? 0, caption: t('dashboard.stats.totalUsersCaption') },
      { label: t('dashboard.stats.totalTasks'), value: analytics.tasks?.total ?? 0, caption: t('dashboard.stats.totalTasksCaption') },
      { label: t('dashboard.stats.activeContracts'), value: analytics.contracts?.active ?? 0, caption: t('dashboard.stats.activeContractsCaption') },
      { label: t('dashboard.stats.completedContracts'), value: analytics.contracts?.completed ?? 0, caption: t('dashboard.stats.completedContractsCaption') },
      { label: t('dashboard.stats.openDisputes'), value: analytics.disputes?.open ?? 0, caption: t('dashboard.stats.openDisputesCaption') },
      { label: t('dashboard.stats.totalDeposited'), value: formatMoney(analytics.payments?.totalDeposited), caption: t('dashboard.stats.totalDepositedCaption') },
      { label: t('dashboard.stats.totalReleased'), value: formatMoney(analytics.payments?.totalReleased), caption: t('dashboard.stats.totalReleasedCaption') },
      { label: t('dashboard.stats.averageRating'), value: analytics.reviews?.averageRating ?? 0, caption: t('dashboard.stats.averageRatingCaption') },
    ];
  }, [sections.analytics.data, t]);

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
          <p className="page-section__eyebrow">{t('dashboard.eyebrow')}</p>
          <h2>{t('dashboard.welcome', { email: user?.email || 'user' })}</h2>
          <p>{t('dashboard.description')}</p>
        </div>
        <div className="dashboard-hero__badges">
          <span className="role-badge">{user?.role || 'UNKNOWN'}</span>
          <span className={`status-pill status-pill--${user?.status?.toLowerCase() || 'active'}`}>
            {t(`status.${user?.status || 'ACTIVE'}`)}
          </span>
        </div>
      </section>

      <PageSection
        eyebrow={t('dashboard.quickActions')}
        title={t('dashboard.startHere')}
        description={t('dashboard.shortcuts')}
      >
        <div className="dashboard-actions-grid">
          {quickActions.length ? quickActions.map((action) => (
            <DashboardActionCard key={action.to} action={action} t={t} />
          )) : (
            <div className="state-card">
              <strong>{t('dashboard.noActions')}</strong>
            </div>
          )}
        </div>
      </PageSection>

      {role === 'ADMIN' ? (
        <PageSection
          eyebrow={t('dashboard.cards.analytics')}
          title={t('dashboard.adminOverview')}
          description={t('dashboard.adminDescription')}
        >
          {sections.analytics.loading ? (
            <div className="state-card">
              <span className="loading-state__spinner" />
              <strong>{t('dashboard.loadingAnalytics')}</strong>
            </div>
          ) : null}

          {!sections.analytics.loading && sections.analytics.error ? (
            <div className="state-card state-card--error">
              <strong>{t('dashboard.couldNotLoadAnalytics')}</strong>
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
          eyebrow={t('dashboard.summary')}
          title={t('dashboard.workAtGlance')}
          description={t('dashboard.compactPreview')}
        >
          <div className="stats-grid dashboard-stats-grid">
            <DashboardStatCard
              label={role === 'CLIENT' ? t('dashboard.stats.recentTasks') : t('dashboard.openTasks')}
              value={getCount(sections.tasks.data, tasks)}
              caption={role === 'CLIENT' ? t('dashboard.stats.recentTasksCaption') : t('dashboard.stats.openTasksCaption')}
            />
            <DashboardStatCard
              label={t('dashboard.stats.contracts')}
              value={getCount(sections.contracts.data, contracts)}
              caption={t('dashboard.stats.contractsCaption')}
            />
            <DashboardStatCard
              label={t('dashboard.stats.unreadNotifications')}
              value={unreadCount}
              caption={t('dashboard.stats.unreadCaption')}
            />
            {role === 'CLIENT' ? (
              <DashboardStatCard
                label={t('dashboard.myDisputes')}
                value={getCount(sections.disputes.data, disputes)}
                caption={t('dashboard.stats.disputesCaption')}
              />
            ) : null}
          </div>
        </PageSection>
      ) : (
        <div className="state-card">
          <strong>{t('dashboard.notAvailableForRole')}</strong>
          <p>{t('dashboard.incorrectRole')}</p>
        </div>
      )}

      <div className="dashboard-section-grid">
        {role === 'CLIENT' ? (
          <>
            <DashboardSection
              title={t('dashboard.recentTasks')}
              description={t('dashboard.recentTasksDescription')}
              state={sections.tasks}
              t={t}
            >
              <SimpleList
                items={tasks}
                emptyText={t('dashboard.empty.recentTasks')}
                renderItem={(task) => (
                  <Link key={task.id} className="dashboard-list-row" to={`/tasks/${task.id}`}>
                    <strong>{task.title}</strong>
                    <span>{t(`status.${task.status}`)} - {formatMoney(task.budget)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title={t('dashboard.myContracts')} state={sections.contracts} t={t}>
              <SimpleList
                items={contracts}
                emptyText={t('dashboard.empty.contracts')}
                renderItem={(contract) => (
                  <Link key={contract.id} className="dashboard-list-row" to={`/contracts/${contract.id}`}>
                    <strong>{getContractTitle(contract)}</strong>
                    <span>{t(`status.${contract.status}`)} - {formatMoney(contract.totalAmount)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title={t('dashboard.myDisputes')} state={sections.disputes} t={t}>
              <SimpleList
                items={disputes}
                emptyText={t('dashboard.empty.disputes')}
                renderItem={(dispute) => (
                  <Link key={dispute.id} className="dashboard-list-row" to={`/contracts/${dispute.contractId}`}>
                    <strong>{getDisputeTitle(dispute)}</strong>
                    <span>{t(`status.${dispute.status}`)} - {formatDate(dispute.createdAt)}</span>
                  </Link>
                )}
              />
            </DashboardSection>
          </>
        ) : null}

        {role === 'FREELANCER' ? (
          <>
            <DashboardSection title={t('dashboard.openTasks')} state={sections.tasks} t={t}>
              <SimpleList
                items={tasks}
                emptyText={t('dashboard.empty.openTasks')}
                renderItem={(task) => (
                  <Link key={task.id} className="dashboard-list-row" to={`/tasks/${task.id}`}>
                    <strong>{task.title}</strong>
                    <span>{task.category?.name || t('tasks.noCategory')} - {formatMoney(task.budget)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title={t('dashboard.myContracts')} state={sections.contracts} t={t}>
              <SimpleList
                items={contracts}
                emptyText={t('dashboard.empty.contracts')}
                renderItem={(contract) => (
                  <Link key={contract.id} className="dashboard-list-row" to={`/contracts/${contract.id}`}>
                    <strong>{getContractTitle(contract)}</strong>
                    <span>{t(`status.${contract.status}`)} - {formatMoney(contract.totalAmount)}</span>
                  </Link>
                )}
              />
            </DashboardSection>
          </>
        ) : null}

        {role === 'ADMIN' ? (
          <>
            <DashboardSection title={t('dashboard.openDisputes')} state={sections.adminDisputes} t={t}>
              <SimpleList
                items={adminDisputes}
                emptyText={t('dashboard.empty.adminDisputes')}
                renderItem={(dispute) => (
                  <Link key={dispute.id} className="dashboard-list-row" to="/admin/disputes">
                    <strong>{t('dashboard.openDisputes')} #{dispute.id}</strong>
                    <span>{t('contracts.contract', { id: dispute.contractId })} - {formatDate(dispute.createdAt)}</span>
                  </Link>
                )}
              />
            </DashboardSection>

            <DashboardSection title={t('dashboard.recentLogs')} state={sections.adminLogs} t={t}>
              <SimpleList
                items={adminLogs}
                emptyText={t('dashboard.empty.logs')}
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

        <DashboardSection title={t('dashboard.latestNotifications')} state={sections.notifications} t={t}>
          <SimpleList
            items={notifications}
            emptyText={t('dashboard.empty.notifications')}
            renderItem={(notification) => (
              <Link key={notification.id} className="dashboard-list-row" to="/notifications">
                <strong>{notification.title}</strong>
                <span>{t(`notificationTypes.${notification.type}`)} - {formatDate(notification.createdAt)}</span>
              </Link>
            )}
          />
        </DashboardSection>
      </div>
    </div>
  );
}

export default DashboardPage;
