import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyContracts } from '../api/contractApi.js';
import PageSection from '../components/PageSection.jsx';

const statuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'];
const limit = 20;

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function getClientName(contract) {
  return contract.client?.companyName || contract.client?.user?.email || 'Client';
}

function getFreelancerName(contract) {
  const firstName = contract.freelancer?.firstName || '';
  const lastName = contract.freelancer?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || contract.freelancer?.user?.email || 'Freelancer';
}

function ContractsPage() {
  const [contracts, setContracts] = useState([]);
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

    async function loadContracts() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getMyContracts(params);

        if (isMounted) {
          setContracts(data.contracts || []);
          setCount(data.count || 0);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load contracts.');
          setContracts([]);
          setCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContracts();

    return () => {
      isMounted = false;
    };
  }, [params]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setOffset(0);
  };

  return (
    <PageSection
      eyebrow="Contracts"
      title="Contracts and milestone delivery"
      description="Track active agreements, escrow state and delivery progress across client and freelancer work."
    >
      <div className="filter-card filter-card--compact">
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={handleStatusChange}>
            <option value="">All contracts</option>
            {statuses.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" type="button" onClick={() => handleStatusChange({ target: { value: '' } })}>
          Reset
        </button>
      </div>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading contracts</strong>
          <p>Fetching your contract workspace.</p>
        </div>
      ) : null}

      {error ? (
        <div className="state-card state-card--error">
          <strong>{error}</strong>
          <p>Check that the backend is running and your session is valid.</p>
        </div>
      ) : null}

      {!isLoading && !error && contracts.length === 0 ? (
        <div className="state-card">
          <strong>No contracts yet</strong>
          <p>Contracts appear after a client accepts a freelancer bid.</p>
          <Link className="btn btn-primary" to="/tasks">Open tasks</Link>
        </div>
      ) : null}

      {!isLoading && !error && contracts.length > 0 ? (
        <>
          <div className="contract-grid">
            {contracts.map((contract) => (
              <article key={contract.id} className="contract-card">
                <div className="contract-card__header">
                  <div>
                    <span className="contract-card__eyebrow">Contract #{contract.id}</span>
                    <h3>{contract.task?.title || 'Untitled task'}</h3>
                  </div>
                  <span className={`status-pill status-pill--${contract.status?.toLowerCase()}`}>{contract.status}</span>
                </div>

                <div className="task-card__meta">
                  <span>
                    <strong>{formatMoney(contract.totalAmount)}</strong>
                    Total amount
                  </span>
                  <span>
                    <strong>{contract.escrow?.status || 'N/A'}</strong>
                    Escrow
                  </span>
                </div>

                <div className="details-list details-list--compact">
                  <dl>
                    <div>
                      <dt>Client</dt>
                      <dd>{getClientName(contract)}</dd>
                    </div>
                    <div>
                      <dt>Freelancer</dt>
                      <dd>{getFreelancerName(contract)}</dd>
                    </div>
                    <div>
                      <dt>Started</dt>
                      <dd>{contract.startedAt ? new Date(contract.startedAt).toLocaleDateString() : 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <Link className="btn btn-secondary" to={`/contracts/${contract.id}`}>
                  View details
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>
              Previous
            </button>
            <span>{count} contracts</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>
              Next
            </button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default ContractsPage;
