import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyDisputes } from '../api/disputeApi.js';
import PageSection from '../components/PageSection.jsx';

const limit = 20;
const statuses = ['OPEN', 'RESOLVED', 'REJECTED'];

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

function getContractTitle(dispute, t) {
  return dispute.contract?.task?.title || t('contracts.contract', { id: dispute.contractId });
}

function UserDisputesPage() {
  const { t } = useTranslation();
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
          setError(requestError.message || t('common.couldNotLoad'));
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
  }, [params, t]);

  return (
    <PageSection
      eyebrow={t('disputes.eyebrow')}
      title={t('disputes.title')}
      description={t('disputes.description')}
    >
      <div className="filter-card filter-card--compact">
        <label className="form-field">
          <span>{t('common.status')}</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setOffset(0); }}>
            <option value="">{t('disputes.all')}</option>
            {statuses.map((item) => (
              <option key={item} value={item}>{t(`status.${item}`)}</option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('disputes.loading')}</strong>
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
                    <h3>{getContractTitle(dispute, t)}</h3>
                  </div>
                  <span className={`status-pill status-pill--${dispute.status?.toLowerCase()}`}>{t(`status.${dispute.status}`)}</span>
                </div>

                <p>{dispute.reason}</p>

                <div className="details-list details-list--compact">
                  <dl>
                    <div><dt>{t('navigation.contracts')}</dt><dd>#{dispute.contractId}</dd></div>
                    <div><dt>{t('common.created')}</dt><dd>{formatDate(dispute.createdAt, t('common.notAvailable'))}</dd></div>
                    <div><dt>{t('disputes.resolved')}</dt><dd>{formatDate(dispute.resolvedAt, t('common.notAvailable'))}</dd></div>
                  </dl>
                </div>

                {dispute.adminComment ? <p className="admin-comment">{dispute.adminComment}</p> : null}

                <Link className="btn btn-secondary" to={`/contracts/${dispute.contractId}`}>
                  {t('disputes.viewContract')}
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button className="btn btn-secondary" type="button" disabled={!hasPrevious} onClick={() => setOffset((current) => Math.max(0, current - limit))}>{t('common.previous')}</button>
            <span>{count} {t('navigation.myDisputes').toLowerCase()}</span>
            <button className="btn btn-secondary" type="button" disabled={!hasNext} onClick={() => setOffset((current) => current + limit)}>{t('common.next')}</button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default UserDisputesPage;
