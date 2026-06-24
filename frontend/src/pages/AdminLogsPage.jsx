import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminLogs } from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';

const limit = 50;

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleString() : fallback;
}

function metadataPreview(metadata, fallback) {
  if (!metadata) {
    return fallback;
  }

  const raw = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
  return raw.length > 140 ? `${raw.slice(0, 140)}...` : raw;
}

function AdminLogsPage() {
  const { t } = useTranslation();
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
          setError(requestError.message || t('common.couldNotLoad'));
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
    const nextFilters = { action: '', entityType: '', userId: '' };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setOffset(0);
  };

  return (
    <PageSection
      eyebrow={t('admin.eyebrow')}
      title={t('admin.logsTitle')}
      description={t('admin.logsDescription')}
    >
      <form className="filter-card admin-filter-card" onSubmit={applyFilters}>
        <label className="form-field">
          <span>{t('admin.action')}</span>
          <input name="action" value={filters.action} onChange={handleChange} placeholder="TASK_CREATED" />
        </label>
        <label className="form-field">
          <span>{t('admin.entityType')}</span>
          <input name="entityType" value={filters.entityType} onChange={handleChange} placeholder="Task" />
        </label>
        <label className="form-field">
          <span>{t('admin.userId')}</span>
          <input name="userId" type="number" min="1" value={filters.userId} onChange={handleChange} placeholder="1" />
        </label>
        <div className="filter-card__actions">
          <button className="btn btn-primary" type="submit">{t('common.apply')}</button>
          <button className="btn btn-secondary" type="button" onClick={resetFilters}>{t('common.reset')}</button>
        </div>
      </form>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('admin.loadingLogs')}</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && logs.length === 0 ? (
        <div className="state-card">
          <strong>{t('admin.logsEmpty')}</strong>
          <p>{t('admin.logsEmptyText')}</p>
        </div>
      ) : null}

      {!isLoading && !error && logs.length > 0 ? (
        <>
          <div className="table-card">
            <table className="data-table admin-log-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('common.name')}</th>
                  <th>{t('admin.action')}</th>
                  <th>{t('admin.entityType')}</th>
                  <th>{t('admin.entityType')} ID</th>
                  <th>{t('admin.metadata')}</th>
                  <th>{t('common.created')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.user?.email || t('admin.system')}</td>
                    <td>{log.action}</td>
                    <td>{log.entityType}</td>
                    <td>{log.entityId || t('common.notAvailable')}</td>
                    <td><pre className="metadata-preview">{metadataPreview(log.metadata, t('common.notAvailable'))}</pre></td>
                    <td>{formatDate(log.createdAt, t('common.notAvailable'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>{t('common.previous')}</button>
            <span>{count} {t('navigation.adminLogs').toLowerCase()}</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>{t('common.next')}</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default AdminLogsPage;
