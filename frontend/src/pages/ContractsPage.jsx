import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          setError(requestError.message || t('contracts.unableToLoad'));
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
  }, [params, t]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setOffset(0);
  };

  return (
    <PageSection
      eyebrow={t('contracts.eyebrow')}
      title={t('contracts.title')}
      description={t('contracts.description')}
    >
      <div className="filter-card filter-card--compact">
        <label className="form-field">
          <span>{t('common.status')}</span>
          <select value={status} onChange={handleStatusChange}>
            <option value="">{t('contracts.allContracts')}</option>
            {statuses.map((item) => (
              <option key={item} value={item}>{t(`status.${item}`)}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" type="button" onClick={() => handleStatusChange({ target: { value: '' } })}>
          {t('common.reset')}
        </button>
      </div>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('contracts.loading')}</strong>
          <p>{t('contracts.loadingText')}</p>
        </div>
      ) : null}

      {error ? (
        <div className="state-card state-card--error">
          <strong>{error}</strong>
          <p>{t('common.couldNotLoad')}</p>
        </div>
      ) : null}

      {!isLoading && !error && contracts.length === 0 ? (
        <div className="state-card">
          <strong>{t('contracts.empty')}</strong>
          <p>{t('contracts.emptyText')}</p>
          <Link className="btn btn-primary" to="/tasks">{t('contracts.openTasks')}</Link>
        </div>
      ) : null}

      {!isLoading && !error && contracts.length > 0 ? (
        <>
          <div className="contract-grid">
            {contracts.map((contract) => (
              <article key={contract.id} className="contract-card">
                <div className="contract-card__header">
                  <div>
                    <span className="contract-card__eyebrow">{t('contracts.contract', { id: contract.id })}</span>
                    <h3>{contract.task?.title || 'Untitled task'}</h3>
                  </div>
                  <span className={`status-pill status-pill--${contract.status?.toLowerCase()}`}>{t(`status.${contract.status}`)}</span>
                </div>

                <div className="task-card__meta">
                  <span>
                    <strong>{formatMoney(contract.totalAmount)}</strong>
                    {t('contracts.totalAmount')}
                  </span>
                  <span>
                    <strong>{contract.escrow?.status || 'N/A'}</strong>
                    {t('contracts.escrow')}
                  </span>
                </div>

                <div className="details-list details-list--compact">
                  <dl>
                    <div>
                      <dt>{t('tasks.client')}</dt>
                      <dd>{getClientName(contract)}</dd>
                    </div>
                    <div>
                      <dt>{t('contracts.freelancer')}</dt>
                      <dd>{getFreelancerName(contract)}</dd>
                    </div>
                    <div>
                      <dt>{t('contracts.started')}</dt>
                      <dd>{contract.startedAt ? new Date(contract.startedAt).toLocaleDateString() : 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <Link className="btn btn-secondary" to={`/contracts/${contract.id}`}>
                  {t('common.viewDetails')}
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>
              {t('common.previous')}
            </button>
            <span>{count} {t('navigation.contracts').toLowerCase()}</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>
              {t('common.next')}
            </button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default ContractsPage;
