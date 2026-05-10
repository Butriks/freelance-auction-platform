import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
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

function ContractDetailsPage() {
  const { id } = useParams();
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
          setError(requestError.message || 'Unable to load contract.');
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
  }, [loadContract]);

  const handleMilestoneChange = (event) => {
    const { name, value } = event.target;
    setMilestoneForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateMilestone = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!milestoneForm.title.trim() || Number(milestoneForm.amount) <= 0 || !milestoneForm.dueDate) {
      setMessage('Please fill title, amount and due date.');
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
      setMessage('Milestone created.');
    } catch (requestError) {
      setMessage(requestError.message || 'Unable to create milestone.');
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
      setMessage(requestError.message || 'Unable to update milestone.');
    } finally {
      setActingMilestoneId(null);
    }
  };

  const handleReject = (milestoneId) => {
    const reason = rejectReasonById[milestoneId] || '';

    if (!reason.trim()) {
      setMessage('Please add a rejection reason.');
      return;
    }

    runMilestoneAction(
      milestoneId,
      () => rejectMilestone(milestoneId, { reason: reason.trim() }),
      'Milestone rejected.',
    );
  };

  const handleOpenDispute = async (event) => {
    event.preventDefault();
    setMessage('');

    const reason = disputeForm.reason.trim();

    if (reason.length < 10) {
      setMessage('Dispute reason must be at least 10 characters.');
      return;
    }

    if (reason.length > 3000) {
      setMessage('Dispute reason must be 3000 characters or less.');
      return;
    }

    setIsOpeningDispute(true);

    try {
      await createDispute(contract.id, { reason });
      setDisputeForm(initialDisputeForm);
      setIsDisputeFormOpen(false);
      await loadContract();
      setMessage('Dispute opened. Admins have been notified.');
    } catch (requestError) {
      setMessage(
        requestError.response?.status === 409
          ? 'There is already an open dispute for this contract.'
          : requestError.message || 'Unable to open dispute.',
      );
    } finally {
      setIsOpeningDispute(false);
    }
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <span className="loading-state__spinner" />
        <strong>Loading contract</strong>
        <p>Fetching contract details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-card--error">
        <strong>{error}</strong>
        <Link className="btn btn-secondary" to="/contracts">Back to contracts</Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageSection
        eyebrow={`Contract #${contract.id}`}
        title={contract.task?.title || 'Contract details'}
        description="Review delivery progress, escrow state, milestones and mock payments."
        action={<Link className="btn btn-secondary" to="/contracts">Back to contracts</Link>}
      >
        <div className="contract-hero">
          <div>
            <span className={`status-pill status-pill--${contract.status?.toLowerCase()}`}>{contract.status}</span>
            <h3>{formatMoney(contract.totalAmount)}</h3>
            <p>Started {formatDate(contract.startedAt)}{contract.completedAt ? `, completed ${formatDate(contract.completedAt)}` : ''}</p>
          </div>
          <div className="task-card__meta">
            <span>
              <strong>{getClientName(contract)}</strong>
              Client
            </span>
            <span>
              <strong>{getFreelancerName(contract)}</strong>
              Freelancer
            </span>
          </div>
        </div>

        <div className="detail-grid">
          <article className="panel task-detail-panel">
            <div className="task-card__top">
              <h3>Task summary</h3>
              <span className={`status-pill status-pill--${contract.task?.status?.toLowerCase()}`}>{contract.task?.status}</span>
            </div>
            <p>{contract.task?.description || 'No task description.'}</p>
            <div className="task-card__meta">
              <span>
                <strong>{formatMoney(contract.task?.budget)}</strong>
                Budget
              </span>
              <span>
                <strong>{contract.task?.deadline || 'N/A'}</strong>
                Deadline
              </span>
            </div>
          </article>

          <article className="panel details-list">
            <h3>Participants</h3>
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
                <dt>Rating</dt>
                <dd>{Number(contract.freelancer?.rating || 0).toFixed(2)}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="detail-grid">
          <article className="panel">
            <div className="task-card__top">
              <h3>Mock escrow</h3>
              <span className={`status-pill status-pill--${contract.escrow?.status?.toLowerCase()}`}>{contract.escrow?.status || 'N/A'}</span>
            </div>
            <p>Funds are held in mock escrow until milestones are approved.</p>
            <strong className="metric-value">{formatMoney(contract.escrow?.amount)}</strong>
          </article>

          <article className="panel">
            <h3>Accepted bid</h3>
            <p>{contract.acceptedBid?.comment || 'No bid comment.'}</p>
            <div className="task-card__meta">
              <span>
                <strong>{formatMoney(contract.acceptedBid?.price)}</strong>
                Price
              </span>
              <span>
                <strong>{contract.acceptedBid?.deliveryDays || 'N/A'} days</strong>
                Delivery
              </span>
            </div>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="Payments" title="Mock payment history">
        {contract.payments?.length ? (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {contract.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.type}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td><span className={`status-pill status-pill--${payment.status?.toLowerCase()}`}>{payment.status}</span></td>
                    <td>{payment.fromUser?.email || 'N/A'}</td>
                    <td>{payment.toUser?.email || 'N/A'}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-card">
            <strong>No payments yet</strong>
          </div>
        )}
      </PageSection>

      {canUseDisputeUi ? (
        <PageSection
          eyebrow="Dispute"
          title="Contract dispute"
          description="Request admin review when contract delivery needs intervention."
        >
          {contract.status === 'DISPUTED' ? (
            <div className="state-card">
              <strong>This contract is currently disputed.</strong>
              <p>Admin review is in progress. You can track your dispute from My Disputes.</p>
              <Link className="btn btn-secondary" to="/disputes/my">Open My Disputes</Link>
            </div>
          ) : null}

          {contract.status === 'COMPLETED' ? (
            <div className="state-card">
              <strong>Dispute creation is closed for completed contracts.</strong>
            </div>
          ) : null}

          {contract.status === 'ACTIVE' ? (
            <div className="panel dispute-panel">
              <div>
                <h3>Need admin review?</h3>
                <p>Open a dispute if the work result or contract process no longer matches expectations.</p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => setIsDisputeFormOpen((current) => !current)}>
                {isDisputeFormOpen ? 'Cancel' : 'Open dispute'}
              </button>
            </div>
          ) : null}

          {contract.status === 'ACTIVE' && isDisputeFormOpen ? (
            <form className="form-grid form-card dispute-form" onSubmit={handleOpenDispute}>
              <label className="form-field">
                <span>Reason</span>
                <textarea
                  rows="5"
                  maxLength="3000"
                  value={disputeForm.reason}
                  onChange={(event) => setDisputeForm({ reason: event.target.value })}
                  placeholder="The work result does not match the agreed requirements."
                  required
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={isOpeningDispute}>
                {isOpeningDispute ? 'Opening...' : 'Submit dispute'}
              </button>
            </form>
          ) : null}
        </PageSection>
      ) : null}

      <PageSection eyebrow="Milestones" title="Delivery milestones">
        {message ? <p className="form-success">{message}</p> : null}

        {isClient && isActive ? (
          <form className="form-grid form-card milestone-form" onSubmit={handleCreateMilestone}>
            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>Title</span>
                <input name="title" value={milestoneForm.title} onChange={handleMilestoneChange} placeholder="Design phase" required />
              </label>
              <label className="form-field">
                <span>Amount</span>
                <input name="amount" type="number" min="1" value={milestoneForm.amount} onChange={handleMilestoneChange} placeholder="300" required />
              </label>
            </div>
            <label className="form-field">
              <span>Description</span>
              <textarea name="description" rows="3" value={milestoneForm.description} onChange={handleMilestoneChange} placeholder="Create page layout and visual design" />
            </label>
            <label className="form-field">
              <span>Due date</span>
              <input name="dueDate" type="date" value={milestoneForm.dueDate} onChange={handleMilestoneChange} required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create milestone'}
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
                    <p>{milestone.description || 'No description.'}</p>
                  </div>
                  <span className={`status-pill status-pill--${milestone.status?.toLowerCase()}`}>{milestone.status}</span>
                </div>

                <div className="task-card__meta">
                  <span>
                    <strong>{formatMoney(milestone.amount)}</strong>
                    Amount
                  </span>
                  <span>
                    <strong>{milestone.dueDate || 'N/A'}</strong>
                    Due date
                  </span>
                </div>

                {isFreelancer && isActive && ['PENDING', 'REJECTED'].includes(milestone.status) ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={actingMilestoneId === milestone.id}
                    onClick={() => runMilestoneAction(milestone.id, () => submitMilestone(milestone.id), 'Milestone submitted.')}
                  >
                    {actingMilestoneId === milestone.id ? 'Submitting...' : 'Submit'}
                  </button>
                ) : null}

                {isClient && isActive && milestone.status === 'SUBMITTED' ? (
                  <div className="milestone-actions">
                    <div className="button-row">
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={actingMilestoneId === milestone.id}
                        onClick={() => runMilestoneAction(milestone.id, () => approveMilestone(milestone.id), 'Milestone approved.')}
                      >
                        {actingMilestoneId === milestone.id ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                    <label className="form-field">
                      <span>Reject reason</span>
                      <input
                        value={rejectReasonById[milestone.id] || ''}
                        onChange={(event) => setRejectReasonById((current) => ({ ...current, [milestone.id]: event.target.value }))}
                        placeholder="Please fix layout issues"
                      />
                    </label>
                    <button
                      className="btn btn-danger"
                      type="button"
                      disabled={actingMilestoneId === milestone.id}
                      onClick={() => handleReject(milestone.id)}
                    >
                      {actingMilestoneId === milestone.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="state-card">
            <strong>No milestones yet</strong>
            <p>Create a milestone to split delivery into clear review steps.</p>
          </div>
        )}
      </PageSection>

      <ContractChat contractId={contract.id} />
      <ContractReviews contract={contract} />
    </div>
  );
}

export default ContractDetailsPage;
