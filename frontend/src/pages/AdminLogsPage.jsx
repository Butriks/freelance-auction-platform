import React, { useEffect, useMemo, useState } from 'react';
import { getAdminLogs } from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';

const limit = 50;

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : 'N/A';
}

function metadataPreview(metadata) {
  if (!metadata) {
    return 'N/A';
  }

  const raw = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
  return raw.length > 140 ? `${raw.slice(0, 140)}...` : raw;
}

function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ action: '', entityType: '', userId: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({
    limit,
    offset,
    action: appliedFilters.action || undefined,
    entityType: appliedFilters.entityType || undefined,
    userId: appliedFilters.userId || undefined,
  }), [appliedFilters, offset]);
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < count;

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getAdminLogs(params);

        if (isMounted) {
          setLogs(data.logs || []);
          setCount(data.count || 0);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load logs.');
          setLogs([]);
          setCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
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
    const nextFilters = { action: '', entityType: '', userId: '' };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setOffset(0);
  };

  return (
    <PageSection
      eyebrow="Admin"
      title="Action logs"
      description="Audit important events across users, tasks, contracts, reviews and messages."
    >
      <form className="filter-card admin-filter-card" onSubmit={applyFilters}>
        <label className="form-field">
          <span>Action</span>
          <input name="action" value={filters.action} onChange={handleChange} placeholder="TASK_CREATED" />
        </label>
        <label className="form-field">
          <span>Entity type</span>
          <input name="entityType" value={filters.entityType} onChange={handleChange} placeholder="Task" />
        </label>
        <label className="form-field">
          <span>User ID</span>
          <input name="userId" type="number" min="1" value={filters.userId} onChange={handleChange} placeholder="1" />
        </label>
        <div className="filter-card__actions">
          <button className="btn btn-primary" type="submit">Apply</button>
          <button className="btn btn-secondary" type="button" onClick={resetFilters}>Reset</button>
        </div>
      </form>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading logs</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && logs.length === 0 ? (
        <div className="state-card">
          <strong>No logs found</strong>
          <p>Try another filter or wait for more platform activity.</p>
        </div>
      ) : null}

      {!isLoading && !error && logs.length > 0 ? (
        <>
          <div className="table-card">
            <table className="data-table admin-log-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Metadata</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.user?.email || 'System'}</td>
                    <td>{log.action}</td>
                    <td>{log.entityType}</td>
                    <td>{log.entityId || 'N/A'}</td>
                    <td><pre className="metadata-preview">{metadataPreview(log.metadata)}</pre></td>
                    <td>{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>Previous</button>
            <span>{count} logs</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>Next</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default AdminLogsPage;
