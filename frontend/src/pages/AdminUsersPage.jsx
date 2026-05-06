import React, { useEffect, useMemo, useState } from 'react';
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

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

function getProfileInfo(user) {
  if (user.clientProfile) {
    return user.clientProfile.companyName || 'Client profile';
  }

  if (user.freelancerProfile) {
    return `${user.freelancerProfile.firstName || ''} ${user.freelancerProfile.lastName || ''}`.trim() || 'Freelancer profile';
  }

  return 'No profile';
}

function AdminUsersPage() {
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
      setError(requestError.message || 'Unable to load users.');
      setUsers([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [params]);

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

    if (!window.confirm(`Are you sure you want to ${actionLabel} ${targetUser.email}?`)) {
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
      setMessage(`User ${actionLabel}ed successfully.`);
    } catch (requestError) {
      setMessage(requestError.message || `Unable to ${actionLabel} user.`);
    } finally {
      setActingUserId(null);
    }
  };

  return (
    <PageSection
      eyebrow="Admin"
      title="User management"
      description="Search users, review profiles and manage blocked or active account states."
    >
      <form className="filter-card admin-filter-card" onSubmit={applyFilters}>
        <label className="form-field">
          <span>Email search</span>
          <input name="search" value={filters.search} onChange={handleChange} placeholder="client@test.com" />
        </label>
        <label className="form-field">
          <span>Role</span>
          <select name="role" value={filters.role} onChange={handleChange}>
            <option value="">ALL</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">ALL</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <div className="filter-card__actions">
          <button className="btn btn-primary" type="submit">Apply</button>
          <button className="btn btn-secondary" type="button" onClick={resetFilters}>Reset</button>
        </div>
      </form>

      {message ? <p className="form-success">{message}</p> : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading users</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && users.length === 0 ? (
        <div className="state-card">
          <strong>No users found</strong>
          <p>Try changing search or filters.</p>
        </div>
      ) : null}

      {!isLoading && !error && users.length > 0 ? (
        <>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Profile</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td><span className={`status-pill status-pill--${item.status?.toLowerCase()}`}>{item.status}</span></td>
                    <td>{getProfileInfo(item)}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      {item.status === 'ACTIVE' ? (
                        <button
                          className="btn btn-danger"
                          type="button"
                          disabled={actingUserId === item.id || item.id === currentUser?.id}
                          onClick={() => updateUserStatus(item, 'block')}
                        >
                          {actingUserId === item.id ? 'Blocking...' : 'Block'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={actingUserId === item.id}
                          onClick={() => updateUserStatus(item, 'unblock')}
                        >
                          {actingUserId === item.id ? 'Unblocking...' : 'Unblock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>Previous</button>
            <span>{count} users</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>Next</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default AdminUsersPage;
