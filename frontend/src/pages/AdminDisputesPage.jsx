import React, { useEffect, useMemo, useState } from 'react';
import {
  getAdminDisputes,
  resolveDispute,
} from '../api/adminApi.js';
import PageSection from '../components/PageSection.jsx';

const limit = 20;
const statuses = ['OPEN', 'RESOLVED', 'REJECTED'];

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

function AdminDisputesPage() {
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
      setError(requestError.message || 'Unable to load disputes.');
      setDisputes([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [params]);

  const handleResolve = async (dispute, nextStatus) => {
    const adminComment = commentById[dispute.id] || '';

    if (!adminComment.trim()) {
      setMessage('Please add an admin comment before resolving a dispute.');
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
      setMessage(`Dispute ${nextStatus.toLowerCase()} successfully.`);
    } catch (requestError) {
      setMessage(requestError.message || 'Unable to resolve dispute.');
    } finally {
      setActingDisputeId(null);
    }
  };

  return (
    <PageSection
      eyebrow="Admin"
      title="Disputes"
      description="Review open disputes and record admin decisions with clear comments."
    >
      <div className="filter-card filter-card--compact">
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setOffset(0); }}>
            <option value="">ALL</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {message ? <p className="form-success">{message}</p> : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading disputes</strong>
        </div>
      ) : null}

      {error ? <div className="state-card state-card--error"><strong>{error}</strong></div> : null}

      {!isLoading && !error && disputes.length === 0 ? (
        <div className="state-card">
          <strong>No disputes found</strong>
          <p>Open disputes will appear here for admin review.</p>
        </div>
      ) : null}

      {!isLoading && !error && disputes.length > 0 ? (
        <>
          <div className="admin-card-grid">
            {disputes.map((dispute) => (
              <article key={dispute.id} className="admin-card">
                <div className="bid-card__header">
                  <div>
                    <span className="contract-card__eyebrow">Dispute #{dispute.id}</span>
                    <h3>Contract #{dispute.contractId}</h3>
                  </div>
                  <span className={`status-pill status-pill--${dispute.status?.toLowerCase()}`}>{dispute.status}</span>
                </div>

                <p>{dispute.reason}</p>

                <div className="details-list details-list--compact">
                  <dl>
                    <div><dt>Opened by</dt><dd>{dispute.openedByUser?.email || 'N/A'}</dd></div>
                    <div><dt>Resolved by</dt><dd>{dispute.resolvedByAdmin?.email || 'N/A'}</dd></div>
                    <div><dt>Created</dt><dd>{formatDate(dispute.createdAt)}</dd></div>
                    <div><dt>Resolved</dt><dd>{formatDate(dispute.resolvedAt)}</dd></div>
                  </dl>
                </div>

                {dispute.adminComment ? <p className="admin-comment">{dispute.adminComment}</p> : null}

                {dispute.status === 'OPEN' ? (
                  <div className="milestone-actions">
                    <label className="form-field">
                      <span>Admin comment</span>
                      <textarea
                        rows="3"
                        value={commentById[dispute.id] || ''}
                        onChange={(event) => setCommentById((current) => ({ ...current, [dispute.id]: event.target.value }))}
                        placeholder="The dispute was reviewed and resolved."
                      />
                    </label>
                    <div className="button-row">
                      <button className="btn btn-primary" type="button" disabled={actingDisputeId === dispute.id} onClick={() => handleResolve(dispute, 'RESOLVED')}>
                        Resolve
                      </button>
                      <button className="btn btn-danger" type="button" disabled={actingDisputeId === dispute.id} onClick={() => handleResolve(dispute, 'REJECTED')}>
                        Reject
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>Previous</button>
            <span>{count} disputes</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>Next</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default AdminDisputesPage;
