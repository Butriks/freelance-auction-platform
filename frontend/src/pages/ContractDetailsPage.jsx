import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getContractById } from '../api/contractApi.js';
import { createDispute } from '../api/disputeApi.js';
import {
  approveMilestone,
  createMilestone,
  rejectMilestone,
  submitMilestone,
} from '../api/milestoneApi.js';
import ContractChat from '../components/ContractChat.jsx';
import ContractReviews from '../components/ContractReviews.jsx';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initialMilestoneForm = {
  title: '',
  description: '',
  amount: '',
  dueDate: '',
};

const initialDisputeForm = {
  reason: '',
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function formatDate(value, fallback = 'N/A') {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

function getClientName(contract, t) {
  return contract.client?.companyName || contract.client?.user?.email || t('tasks.client');
}

function getFreelancerName(contract, t) {
  const firstName = contract.freelancer?.firstName || '';
  const lastName = contract.freelancer?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || contract.freelancer?.user?.email || t('contracts.freelancer');
}

function ContractDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState(initialMilestoneForm);
  const [disputeForm, setDisputeForm] = useState(initialDisputeForm);
  const [isDisputeFormOpen, setIsDisputeFormOpen] = useState(false);
  const [rejectReasonById, setRejectReasonById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpeningDispute, setIsOpeningDispute] = useState(false);
  const [actingMilestoneId, setActingMilestoneId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isClient = user?.role === 'CLIENT';
  const isFreelancer = user?.role === 'FREELANCER';
  const isActive = contract?.status === 'ACTIVE';
  const canUseDisputeUi = ['CLIENT', 'FREELANCER'].includes(user?.role);

  const loadContract = useCallback(async () => {
    const { data } = await getContractById(id);
    const nextContract = data.contract || data;
    setContract(nextContract);
    return nextContract;
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setIsLoading(true);
      setError('');

      try {
        await loadContract();
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || t('contracts.unableToLoadContract'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [loadContract, t]);

  const handleMilestoneChange = (event) => {
    const { name, value } = event.target;
    setMilestoneForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateMilestone = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!milestoneForm.title.trim() || Number(milestoneForm.amount) <= 0 || !milestoneForm.dueDate) {
      setMessage(t('milestones.validation'));
      return;
    }

    setIsCreating(true);

    try {
      await createMilestone(id, {
        title: milestoneForm.title.trim(),
        description: milestoneForm.description.trim() || undefined,
        amount: Number(milestoneForm.amount),
        dueDate: milestoneForm.dueDate,
      });
      setMilestoneForm(initialMilestoneForm);
      await loadContract();
      setMessage(t('milestones.created'));
    } catch (requestError) {
      setMessage(requestError.message || t('milestones.unableToCreate'));
    } finally {
      setIsCreating(false);
    }
  };

  const runMilestoneAction = async (milestoneId, action, successMessage) => {
    setActingMilestoneId(milestoneId);
    setMessage('');

    try {
      await action();
      await loadContract();
      setMessage(successMessage);
    } catch (requestError) {
      setMessage(requestError.message || t('milestones.unableToUpdate'));
    } finally {
      setActingMilestoneId(null);
    }
  };

  const handleReject = (milestoneId) => {
    const reason = rejectReasonById[milestoneId] || '';

    if (!reason.trim()) {
      setMessage(t('milestones.rejectValidation'));
      return;
    }

    runMilestoneAction(
      milestoneId,
      () => rejectMilestone(milestoneId, { reason: reason.trim() }),
      t('milestones.rejected'),
    );
  };

  const handleOpenDispute = async (event) => {
    event.preventDefault();
    setMessage('');

    const reason = disputeForm.reason.trim();

    if (reason.length < 10) {
      setMessage(t('disputes.reasonMin'));
      return;
    }

    if (reason.length > 3000) {
      setMessage(t('disputes.reasonMax'));
      return;
    }

    setIsOpeningDispute(true);

    try {
      await createDispute(contract.id, { reason });
      setDisputeForm(initialDisputeForm);
      setIsDisputeFormOpen(false);
      await loadContract();
      setMessage(t('disputes.opened'));
    } catch (requestError) {
      setMessage(
        requestError.response?.status === 409
          ? t('disputes.alreadyOpen')
          : requestError.message || t('disputes.unableToOpen'),
      );
    } finally {
      setIsOpeningDispute(false);
    }
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <span className="loading-state__spinner" />
        <strong>{t('common.loading')}</strong>
        <p>{t('contracts.unableToLoadContract')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-card--error">
        <strong>{error}</strong>
        <Link className="btn btn-secondary" to="/contracts">{t('contracts.backToContracts')}</Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageSection
        eyebrow={t('contracts.contract', { id: contract.id })}
        title={contract.task?.title || t('contracts.detailsTitle')}
        description={t('contracts.detailsDescription')}
        action={<Link className="btn btn-secondary" to="/contracts">{t('contracts.backToContracts')}</Link>}
      >
        <div className="contract-hero">
          <div>
            <span className={`status-pill status-pill--${contract.status?.toLowerCase()}`}>{t(`status.${contract.status}`)}</span>
            <h3>{formatMoney(contract.totalAmount)}</h3>
            <p>{t('contracts.startedAt', { date: formatDate(contract.startedAt, t('common.notAvailable')) })}{contract.completedAt ? t('contracts.completedAt', { date: formatDate(contract.completedAt, t('common.notAvailable')) }) : ''}</p>
          </div>
          <div className="task-card__meta">
            <span>
              <strong>{getClientName(contract, t)}</strong>
              {t('tasks.client')}
            </span>
            <span>
              <strong>{getFreelancerName(contract, t)}</strong>
              {t('contracts.freelancer')}
            </span>
          </div>
        </div>

        <div className="detail-grid">
          <article className="panel task-detail-panel">
            <div className="task-card__top">
              <h3>{t('contracts.taskSummary')}</h3>
              <span className={`status-pill status-pill--${contract.task?.status?.toLowerCase()}`}>{t(`status.${contract.task?.status}`)}</span>
            </div>
            <p>{contract.task?.description || t('common.notAvailable')}</p>
            <div className="task-card__meta">
              <span>
                <strong>{formatMoney(contract.task?.budget)}</strong>
                {t('tasks.budget')}
              </span>
              <span>
                <strong>{contract.task?.deadline || t('common.notAvailable')}</strong>
                {t('tasks.deadline')}
              </span>
            </div>
          </article>

          <article className="panel details-list">
            <h3>{t('contracts.participants')}</h3>
            <dl>
              <div>
                <dt>{t('tasks.client')}</dt>
                <dd>{getClientName(contract, t)}</dd>
              </div>
              <div>
                <dt>{t('contracts.freelancer')}</dt>
                <dd>{getFreelancerName(contract, t)}</dd>
              </div>
              <div>
                <dt>{t('reviews.rating')}</dt>
                <dd>{Number(contract.freelancer?.rating || 0).toFixed(2)}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="detail-grid">
          <article className="panel">
            <div className="task-card__top">
              <h3>{t('contracts.mockEscrow')}</h3>
              <span className={`status-pill status-pill--${contract.escrow?.status?.toLowerCase()}`}>{contract.escrow?.status ? t(`status.${contract.escrow.status}`) : t('common.notAvailable')}</span>
            </div>
            <p>{t('contracts.escrowText')}</p>
            <strong className="metric-value">{formatMoney(contract.escrow?.amount)}</strong>
          </article>

          <article className="panel">
            <h3>{t('contracts.acceptedBid')}</h3>
            <p>{contract.acceptedBid?.comment || t('contracts.noBidComment')}</p>
            <div className="task-card__meta">
              <span>
                <strong>{formatMoney(contract.acceptedBid?.price)}</strong>
                {t('common.price')}
              </span>
              <span>
                <strong>{contract.acceptedBid?.deliveryDays ? t('bids.days', { count: contract.acceptedBid.deliveryDays }) : t('common.notAvailable')}</strong>
                {t('bids.delivery')}
              </span>
            </div>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow={t('contracts.paymentsTitle')} title={t('contracts.paymentsTitle')}>
        {contract.payments?.length ? (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('contracts.type')}</th>
                  <th>{t('common.amount')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('contracts.from')}</th>
                  <th>{t('contracts.to')}</th>
                  <th>{t('common.date')}</th>
                </tr>
              </thead>
              <tbody>
                {contract.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.type}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td><span className={`status-pill status-pill--${payment.status?.toLowerCase()}`}>{t(`status.${payment.status}`)}</span></td>
                    <td>{payment.fromUser?.email || t('common.notAvailable')}</td>
                    <td>{payment.toUser?.email || t('common.notAvailable')}</td>
                    <td>{formatDate(payment.createdAt, t('common.notAvailable'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-card">
            <strong>{t('contracts.noPayments')}</strong>
          </div>
        )}
      </PageSection>

      {canUseDisputeUi ? (
        <PageSection
          eyebrow={t('disputes.eyebrow')}
          title={t('disputes.contractDispute')}
          description={t('disputes.contractDisputeDescription')}
        >
          {contract.status === 'DISPUTED' ? (
            <div className="state-card">
              <strong>{t('disputes.currentlyDisputed')}</strong>
              <p>{t('disputes.reviewProgress')}</p>
              <Link className="btn btn-secondary" to="/disputes/my">{t('disputes.openMyDisputes')}</Link>
            </div>
          ) : null}

          {contract.status === 'COMPLETED' ? (
            <div className="state-card">
              <strong>{t('disputes.closedCompleted')}</strong>
            </div>
          ) : null}

          {contract.status === 'ACTIVE' ? (
            <div className="panel dispute-panel">
              <div>
                <h3>{t('disputes.needReview')}</h3>
                <p>{t('disputes.needReviewText')}</p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => setIsDisputeFormOpen((current) => !current)}>
                {isDisputeFormOpen ? t('common.cancel') : t('disputes.openDispute')}
              </button>
            </div>
          ) : null}

          {contract.status === 'ACTIVE' && isDisputeFormOpen ? (
            <form className="form-grid form-card dispute-form" onSubmit={handleOpenDispute}>
              <label className="form-field">
                <span>{t('disputes.reason')}</span>
                <textarea
                  rows="5"
                  maxLength="3000"
                  value={disputeForm.reason}
                  onChange={(event) => setDisputeForm({ reason: event.target.value })}
                  placeholder={t('disputes.reasonPlaceholder')}
                  required
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={isOpeningDispute}>
                {isOpeningDispute ? t('disputes.opening') : t('disputes.submitDispute')}
              </button>
            </form>
          ) : null}
        </PageSection>
      ) : null}

      <PageSection eyebrow={t('milestones.eyebrow')} title={t('milestones.title')}>
        {message ? <p className="form-success">{message}</p> : null}

        {isClient && isActive ? (
          <form className="form-grid form-card milestone-form" onSubmit={handleCreateMilestone}>
            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>{t('common.title')}</span>
                <input name="title" value={milestoneForm.title} onChange={handleMilestoneChange} placeholder={t('milestones.placeholderTitle')} required />
              </label>
              <label className="form-field">
                <span>{t('common.amount')}</span>
                <input name="amount" type="number" min="1" value={milestoneForm.amount} onChange={handleMilestoneChange} placeholder="300" required />
              </label>
            </div>
            <label className="form-field">
              <span>{t('common.description')}</span>
              <textarea name="description" rows="3" value={milestoneForm.description} onChange={handleMilestoneChange} placeholder={t('milestones.descriptionPlaceholder')} />
            </label>
            <label className="form-field">
              <span>{t('milestones.dueDate')}</span>
              <input name="dueDate" type="date" value={milestoneForm.dueDate} onChange={handleMilestoneChange} required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={isCreating}>
              {isCreating ? t('milestones.creating') : t('milestones.create')}
            </button>
          </form>
        ) : null}

        {contract.milestones?.length ? (
          <div className="milestone-grid">
            {contract.milestones.map((milestone) => (
              <article key={milestone.id} className="milestone-card">
                <div className="bid-card__header">
                  <div>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description || t('milestones.noDescription')}</p>
                  </div>
                  <span className={`status-pill status-pill--${milestone.status?.toLowerCase()}`}>{t(`status.${milestone.status}`)}</span>
                </div>

                <div className="task-card__meta">
                  <span>
                    <strong>{formatMoney(milestone.amount)}</strong>
                    {t('common.amount')}
                  </span>
                  <span>
                    <strong>{milestone.dueDate || t('common.notAvailable')}</strong>
                    {t('milestones.dueDate')}
                  </span>
                </div>

                {isFreelancer && isActive && ['PENDING', 'REJECTED'].includes(milestone.status) ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={actingMilestoneId === milestone.id}
                    onClick={() => runMilestoneAction(milestone.id, () => submitMilestone(milestone.id), t('milestones.submitted'))}
                  >
                    {actingMilestoneId === milestone.id ? t('milestones.submitting') : t('milestones.submit')}
                  </button>
                ) : null}

                {isClient && isActive && milestone.status === 'SUBMITTED' ? (
                  <div className="milestone-actions">
                    <div className="button-row">
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={actingMilestoneId === milestone.id}
                        onClick={() => runMilestoneAction(milestone.id, () => approveMilestone(milestone.id), t('milestones.approved'))}
                      >
                        {actingMilestoneId === milestone.id ? t('milestones.approving') : t('milestones.approve')}
                      </button>
                    </div>
                    <label className="form-field">
                      <span>{t('milestones.rejectReason')}</span>
                      <input
                        value={rejectReasonById[milestone.id] || ''}
                        onChange={(event) => setRejectReasonById((current) => ({ ...current, [milestone.id]: event.target.value }))}
                        placeholder={t('milestones.rejectPlaceholder')}
                      />
                    </label>
                    <button
                      className="btn btn-danger"
                      type="button"
                      disabled={actingMilestoneId === milestone.id}
                      onClick={() => handleReject(milestone.id)}
                    >
                      {actingMilestoneId === milestone.id ? t('milestones.rejecting') : t('milestones.reject')}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="state-card">
            <strong>{t('milestones.empty')}</strong>
            <p>{t('milestones.emptyText')}</p>
          </div>
        )}
      </PageSection>

      <ContractChat contractId={contract.id} />
      <ContractReviews contract={contract} />
    </div>
  );
}

export default ContractDetailsPage;
