import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  blockUser,
  getAdminUsers,
  unblockUser,
} from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const limit = 20;
const roles = ['CLIENT', 'FREELANCER', 'ADMIN'];
const statuses = ['ACTIVE', 'BLOCKED'];

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

function getProfileInfo(user, t) {
  if (user.clientProfile) {
    return user.clientProfile.companyName || t('auth.client');
  }

  if (user.freelancerProfile) {
    return `${user.freelancerProfile.firstName || ''} ${user.freelancerProfile.lastName || ''}`.trim() || t('auth.freelancer');
  }

  return t('profile.noProfile');
}

function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(true);
  const [actingUserId, setActingUserId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const params = useMemo(() => ({
    limit,
    offset,
    search: appliedFilters.search || undefined,
    role: appliedFilters.role || undefined,
    status: appliedFilters.status || undefined,
  }), [appliedFilters, offset]);
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < count;

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await getAdminUsers(params);
      setUsers(data.users || []);
      setCount(data.count || 0);
    } catch (requestError) {
      setError(requestError.message || t('common.couldNotLoad'));
      setUsers([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [params, t]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const nextFilters = { search: '', role: '', status: '' };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setOffset(0);
  };

  const updateUserStatus = async (targetUser, action) => {
    const actionLabel = action === 'block' ? 'block' : 'unblock';

    if (!window.confirm(`${actionLabel} ${targetUser.email}?`)) {
      return;
    }

    setActingUserId(targetUser.id);
    setMessage('');

    try {
      if (action === 'block') {
        await blockUser(targetUser.id);
      } else {
        await unblockUser(targetUser.id);
      }

      await loadUsers();
      setMessage(`${targetUser.email}: ${actionLabel}`);
    } catch (requestError) {
      setMessage(requestError.message || t('common.error'));
    } finally {
      setActingUserId(null);
    }
  };

  return (
    <PageSection
      eyebrow={t('admin.eyebrow')}
      title={t('admin.usersTitle')}
      description={t('admin.usersDescription')}
    >
      <form className="filter-card admin-filter-card" onSubmit={applyFilters}>
        <label className="form-field">
          <span>{t('admin.emailSearch')}</span>
          <input name="search" value={filters.search} onChange={handleChange} placeholder={t('admin.searchByEmail')} />
        </label>
        <label className="form-field">
          <span>{t('common.role')}</span>
          <select name="role" value={filters.role} onChange={handleChange}>
            <option value="">{t('admin.allRoles')}</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>{t('common.status')}</span>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">{t('admin.allStatuses')}</option>
            {statuses.map((status) => <option key={status} value={status}>{t(`status.${status}`)}</option>)}
          </select>
        </label>
        <div className="filter-card__actions">
          <button className="btn btn-primary" type="submit">{t('common.apply')}</button>
          <button className="btn btn-secondary" type="button" onClick={resetFilters}>{t('common.reset')}</button>
        </div>
      </form>

      {message ? <p className="form-success">{message}</p> : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('admin.loadingUsers')}</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && users.length === 0 ? (
        <div className="state-card">
          <strong>{t('admin.usersEmpty')}</strong>
          <p>{t('tasks.noTasksText')}</p>
        </div>
      ) : null}

      {!isLoading && !error && users.length > 0 ? (
        <>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('common.email')}</th>
                  <th>{t('common.role')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('navigation.profile')}</th>
                  <th>{t('common.created')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td><span className={`status-pill status-pill--${item.status?.toLowerCase()}`}>{t(`status.${item.status}`)}</span></td>
                    <td>{getProfileInfo(item, t)}</td>
                    <td>{formatDate(item.createdAt, t('common.notAvailable'))}</td>
                    <td>
                      {item.status === 'ACTIVE' ? (
                        <button
                          className="btn btn-danger"
                          type="button"
                          disabled={actingUserId === item.id || item.id === currentUser?.id}
                          onClick={() => updateUserStatus(item, 'block')}
                        >
                          {actingUserId === item.id ? `${t('admin.block')}...` : t('admin.block')}
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={actingUserId === item.id}
                          onClick={() => updateUserStatus(item, 'unblock')}
                        >
                          {actingUserId === item.id ? `${t('admin.unblock')}...` : t('admin.unblock')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>{t('common.previous')}</button>
            <span>{count} {t('navigation.adminUsers').toLowerCase()}</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>{t('common.next')}</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default AdminUsersPage;
