import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDisputes } from '../api/disputeApi.js';
import PageSection from '../components/PageSection.jsx';

const limit = 20;
const statuses = ['OPEN', 'RESOLVED', 'REJECTED'];

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

function getContractTitle(dispute) {
  return dispute.contract?.task?.title || `Contract #${dispute.contractId}`;
}

function UserDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({
    limit,
    offset,
    status: status || undefined,
  }), [offset, status]);
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < count;

  useEffect(() => {
    let isMounted = true;

    async function loadDisputes() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getMyDisputes(params);

        if (isMounted) {
          setDisputes(data.disputes || []);
          setCount(data.count || 0);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load disputes.');
          setDisputes([]);
          setCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDisputes();

    return () => {
      isMounted = false;
    };
  }, [params]);

  return (
    <PageSection
      eyebrow="Disputes"
      title="My disputes"
      description="Track disputes opened on your contracts and follow admin resolution status."
    >
      <div className="filter-card filter-card--compact">
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setOffset(0); }}>
            <option value="">ALL</option>
            {statuses.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

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
          <p>If a contract needs admin review, you can open a dispute from contract details.</p>
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
                    <h3>{getContractTitle(dispute)}</h3>
                  </div>
                  <span className={`status-pill status-pill--${dispute.status?.toLowerCase()}`}>{dispute.status}</span>
                </div>

                <p>{dispute.reason}</p>

                <div className="details-list details-list--compact">
                  <dl>
                    <div><dt>Contract</dt><dd>#{dispute.contractId}</dd></div>
                    <div><dt>Created</dt><dd>{formatDate(dispute.createdAt)}</dd></div>
                    <div><dt>Resolved</dt><dd>{formatDate(dispute.resolvedAt)}</dd></div>
                  </dl>
                </div>

                {dispute.adminComment ? <p className="admin-comment">{dispute.adminComment}</p> : null}

                <Link className="btn btn-secondary" to={`/contracts/${dispute.contractId}`}>
                  View contract
                </Link>
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

export default UserDisputesPage;
