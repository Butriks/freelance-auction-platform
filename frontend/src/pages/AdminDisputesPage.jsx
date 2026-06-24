import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAdminDisputes,
  resolveDispute,
} from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';

const limit = 20;
const statuses = ['OPEN', 'RESOLVED', 'REJECTED'];

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

function AdminDisputesPage() {
  const { t } = useTranslation();
  const [disputes, setDisputes] = useState([]);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [commentById, setCommentById] = useState({});
  const [actingDisputeId, setActingDisputeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const params = useMemo(() => ({
    limit,
    offset,
    status: status || undefined,
  }), [offset, status]);
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < count;

  const loadDisputes = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await getAdminDisputes(params);
      setDisputes(data.disputes || []);
      setCount(data.count || 0);
    } catch (requestError) {
      setError(requestError.message || t('common.couldNotLoad'));
      setDisputes([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [params, t]);

  const handleResolve = async (dispute, nextStatus) => {
    const adminComment = commentById[dispute.id] || '';

    if (!adminComment.trim()) {
      setMessage(t('admin.commentRequired'));
      return;
    }

    setActingDisputeId(dispute.id);
    setMessage('');

    try {
      await resolveDispute(dispute.id, {
        status: nextStatus,
        adminComment: adminComment.trim(),
      });
      await loadDisputes();
      setMessage(t('admin.disputeUpdated', { status: t(`status.${nextStatus}`) }));
    } catch (requestError) {
      setMessage(requestError.message || t('admin.unableToResolve'));
    } finally {
      setActingDisputeId(null);
    }
  };

  return (
    <PageSection
      eyebrow={t('admin.eyebrow')}
      title={t('admin.disputesTitle')}
      description={t('admin.disputesDescription')}
    >
      <div className="filter-card filter-card--compact">
        <label className="form-field">
          <span>{t('common.status')}</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setOffset(0); }}>
            <option value="">{t('common.all')}</option>
            {statuses.map((item) => <option key={item} value={item}>{t(`status.${item}`)}</option>)}
          </select>
        </label>
      </div>

      {message ? <p className="form-success">{message}</p> : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('admin.loadingDisputes')}</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && disputes.length === 0 ? (
        <div className="state-card">
          <strong>{t('disputes.empty')}</strong>
          <p>{t('disputes.emptyText')}</p>
        </div>
      ) : null}

      {!isLoading && !error && disputes.length > 0 ? (
        <>
          <div className="admin-card-grid">
            {disputes.map((dispute) => (
              <article key={dispute.id} className="admin-card">
                <div className="bid-card__header">
                  <div>
                    <span className="contract-card__eyebrow">{t('disputes.eyebrow')} #{dispute.id}</span>
                    <h3>{t('contracts.contract', { id: dispute.contractId })}</h3>
                  </div>
                  <span className={`status-pill status-pill--${dispute.status?.toLowerCase()}`}>{t(`status.${dispute.status}`)}</span>
                </div>

                <p>{dispute.reason}</p>

                <div className="details-list details-list--compact">
                  <dl>
                    <div><dt>{t('admin.openedBy')}</dt><dd>{dispute.openedByUser?.email || t('common.notAvailable')}</dd></div>
                    <div><dt>{t('admin.resolvedBy')}</dt><dd>{dispute.resolvedByAdmin?.email || t('common.notAvailable')}</dd></div>
                    <div><dt>{t('common.created')}</dt><dd>{formatDate(dispute.createdAt, t('common.notAvailable'))}</dd></div>
                    <div><dt>{t('disputes.resolved')}</dt><dd>{formatDate(dispute.resolvedAt, t('common.notAvailable'))}</dd></div>
                  </dl>
                </div>

                {dispute.adminComment ? <p className="admin-comment">{dispute.adminComment}</p> : null}

                {dispute.status === 'OPEN' ? (
                  <div className="milestone-actions">
                    <label className="form-field">
                      <span>{t('admin.adminComment')}</span>
                      <textarea
                        rows="3"
                        value={commentById[dispute.id] || ''}
                        onChange={(event) => setCommentById((current) => ({ ...current, [dispute.id]: event.target.value }))}
                        placeholder={t('admin.commentPlaceholder')}
                      />
                    </label>
                    <div className="button-row">
                      <button className="btn btn-primary" type="button" disabled={actingDisputeId === dispute.id} onClick={() => handleResolve(dispute, 'RESOLVED')}>
                        {t('admin.resolve')}
                      </button>
                      <button className="btn btn-danger" type="button" disabled={actingDisputeId === dispute.id} onClick={() => handleResolve(dispute, 'REJECTED')}>
                        {t('admin.reject')}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>{t('common.previous')}</button>
            <span>{count} {t('navigation.adminDisputes').toLowerCase()}</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>{t('common.next')}</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default AdminDisputesPage;
