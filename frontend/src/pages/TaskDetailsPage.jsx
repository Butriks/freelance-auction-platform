import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { acceptBid, createBid, getTaskBids } from '../api/bidApi.js';
import { fallbackCategories } from '../api/categoryApi.js';
import { deleteTask, getTaskById, updateTask } from '../api/taskApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

const initialBidForm = {
  price: '',
  deliveryDays: '',
  comment: '',
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function getCategoryName(task) {
  return task?.category?.name || fallbackCategories.find((category) => category.id === Number(task?.categoryId))?.name || 'No category';
}

function getClientName(task) {
  return task?.client?.companyName || task?.client?.user?.email || 'Client';
}

function getFreelancerName(bid) {
  const firstName = bid.freelancer?.firstName || '';
  const lastName = bid.freelancer?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || bid.freelancer?.user?.email || 'Freelancer';
}

function buildEditForm(task) {
  return {
    title: task.title || '',
    description: task.description || '',
    budget: task.budget || '',
    deadline: task.deadline || '',
    categoryId: task.categoryId || '',
  };
}

function normalizeBid(bid, taskId) {
  return {
    ...bid,
    taskId: bid.taskId || Number(taskId),
    freelancerId: bid.freelancerId || bid.freelancer?.id,
  };
}

function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, status: socketStatus } = useSocket();
  const [task, setTask] = useState(null);
  const [bids, setBids] = useState([]);
  const [form, setForm] = useState(null);
  const [bidForm, setBidForm] = useState(initialBidForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [areBidsLoading, setAreBidsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBidSubmitting, setIsBidSubmitting] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState(null);
  const [error, setError] = useState('');
  const [bidsError, setBidsError] = useState('');
  const [formError, setFormError] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  const isOwner = user?.role === 'CLIENT'
    && (!task?.client?.userId || Number(task.client.userId) === Number(user.id));
  const canEdit = isOwner && task?.status === 'OPEN';
  const canSubmitBid = user?.role === 'FREELANCER' && task?.status === 'OPEN';
  const biddingClosed = user?.role === 'FREELANCER' && task?.status !== 'OPEN';

  const loadTask = useCallback(async () => {
    const { data } = await getTaskById(id);
    const nextTask = data.task || data;

    setTask(nextTask);
    setForm(buildEditForm(nextTask));
    return nextTask;
  }, [id]);

  const loadBids = useCallback(async () => {
    setAreBidsLoading(true);
    setBidsError('');

    try {
      const { data } = await getTaskBids(id);
      const nextBids = (data.bids || data || []).map((bid) => normalizeBid(bid, id));
      setBids(nextBids);
    } catch (requestError) {
      setBidsError(requestError.message || 'Unable to load bids.');
    } finally {
      setAreBidsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setIsLoading(true);
      setError('');

      try {
        await loadTask();

        if (isMounted) {
          await loadBids();
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load task.');
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
  }, [loadBids, loadTask]);

  useEffect(() => {
    if (!socket || !id) {
      return undefined;
    }

    const taskId = Number(id);

    socket.emit('join_task_room', { taskId }, (response) => {
      if (response && !response.ok) {
        console.warn('Unable to join task room:', response.message);
      }
    });

    const handleNewBid = (bid) => {
      const nextBid = normalizeBid(bid, taskId);

      if (Number(nextBid.taskId) !== taskId) {
        return;
      }

      setBids((currentBids) => {
        const exists = currentBids.some((currentBid) => currentBid.id === nextBid.id);

        if (exists) {
          return currentBids.map((currentBid) => (
            currentBid.id === nextBid.id ? { ...currentBid, ...nextBid } : currentBid
          ));
        }

        return [...currentBids, nextBid].sort((first, second) => Number(first.price) - Number(second.price));
      });
    };

    socket.on('new_bid', handleNewBid);

    return () => {
      socket.off('new_bid', handleNewBid);
      socket.emit('leave_task_room', { taskId });
    };
  }, [id, socket]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleBidChange = (event) => {
    const { name, value } = event.target;
    setBidForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || Number(form.budget) <= 0 || !form.deadline || !form.categoryId) {
      setFormError('Please fill in title, description, budget, deadline and category.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        budget: Number(form.budget),
        deadline: form.deadline,
        categoryId: Number(form.categoryId),
      };
      const { data } = await updateTask(id, payload);
      const updatedTask = data.task || data;

      setTask(updatedTask);
      setForm(buildEditForm(updatedTask));
      setIsEditing(false);
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to update task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setFormError('');

    try {
      await deleteTask(id);
      navigate('/tasks', { replace: true });
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to delete task.');
      setIsDeleting(false);
    }
  };

  const handleSubmitBid = async (event) => {
    event.preventDefault();
    setBidMessage('');

    if (Number(bidForm.price) <= 0) {
      setBidMessage('Price must be greater than 0.');
      return;
    }

    if (!Number.isInteger(Number(bidForm.deliveryDays)) || Number(bidForm.deliveryDays) <= 0) {
      setBidMessage('Delivery days must be greater than 0.');
      return;
    }

    if (bidForm.comment.length > 1000) {
      setBidMessage('Comment must be 1000 characters or less.');
      return;
    }

    setIsBidSubmitting(true);

    try {
      const payload = {
        price: Number(bidForm.price),
        deliveryDays: Number(bidForm.deliveryDays),
        comment: bidForm.comment.trim() || undefined,
      };
      const { data } = await createBid(id, payload);
      const nextBid = normalizeBid(data.bid || data, id);

      setBids((currentBids) => (
        currentBids.some((bid) => bid.id === nextBid.id)
          ? currentBids
          : [...currentBids, nextBid].sort((first, second) => Number(first.price) - Number(second.price))
      ));
      setBidForm(initialBidForm);
      setBidMessage('Your bid has been submitted.');
    } catch (requestError) {
      setBidMessage(
        requestError.response?.status === 409
          ? 'You have already submitted a bid for this task.'
          : requestError.message || 'Unable to submit bid.',
      );
    } finally {
      setIsBidSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    setAcceptingBidId(bidId);
    setBidMessage('');

    try {
      await acceptBid(id, bidId);
      await loadTask();
      await loadBids();
      setBidMessage('Bid accepted. Contract has been created.');
    } catch (requestError) {
      setBidMessage(requestError.message || 'Unable to accept bid.');
    } finally {
      setAcceptingBidId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="state-card">
        <span className="loading-state__spinner" />
        <strong>Loading task</strong>
        <p>Fetching task details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-card--error">
        <strong>{error}</strong>
        <Link className="btn btn-secondary" to="/tasks">Back to tasks</Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageSection
        eyebrow="Task details"
        title={task.title}
        description="Review the task, client details, bids and delivery constraints."
        action={<Link className="btn btn-secondary" to="/tasks">Back to tasks</Link>}
      >
        <div className="detail-grid">
          <article className="panel task-detail-panel">
            <div className="task-card__top">
              <span className={`status-pill status-pill--${task.status?.toLowerCase()}`}>{task.status}</span>
              <span className="task-card__category">{getCategoryName(task)}</span>
            </div>
            <p>{task.description}</p>
          </article>

          <article className="panel details-list">
            <h3>Project info</h3>
            <dl>
              <div>
                <dt>Budget</dt>
                <dd>{formatMoney(task.budget)}</dd>
              </div>
              <div>
                <dt>Deadline</dt>
                <dd>{task.deadline}</dd>
              </div>
              <div>
                <dt>Client</dt>
                <dd>{getClientName(task)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</dd>
              </div>
            </dl>
          </article>
        </div>

        {user?.role === 'CLIENT' ? (
          <div className="panel task-actions-panel">
            <div>
              <h3>Client controls</h3>
              <p>Backend ownership checks protect these actions. Open tasks can be edited or deleted.</p>
            </div>
            <div className="button-row">
              <button className="btn btn-secondary" type="button" disabled={!canEdit} onClick={() => setIsEditing((current) => !current)}>
                {isEditing ? 'Cancel edit' : 'Edit'}
              </button>
              {task.status === 'OPEN' ? (
                <button className="btn btn-danger" type="button" disabled={!isOwner || isDeleting} onClick={handleDelete}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {isEditing && form ? (
          <form className="form-grid form-card task-form" onSubmit={handleSave}>
            <label className="form-field">
              <span>Title</span>
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label className="form-field">
              <span>Description</span>
              <textarea name="description" rows="6" value={form.description} onChange={handleChange} required />
            </label>
            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>Budget</span>
                <input name="budget" type="number" min="1" value={form.budget} onChange={handleChange} required />
              </label>
              <label className="form-field">
                <span>Deadline</span>
                <input name="deadline" type="date" value={form.deadline} onChange={handleChange} required />
              </label>
            </div>
            <label className="form-field">
              <span>Category</span>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Select category</option>
                {fallbackCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            {formError ? <p className="form-error">{formError}</p> : null}
            <button className="btn btn-primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        ) : formError ? (
          <p className="form-error">{formError}</p>
        ) : null}
      </PageSection>

      <PageSection
        eyebrow="Bids"
        title="Auction bids"
        description="Compare freelancer offers by price, delivery time and reputation."
      >
        {socketStatus !== 'connected' ? (
          <div className="socket-note">Realtime connection is {socketStatus}. The list still refreshes after actions.</div>
        ) : null}

        {canSubmitBid ? (
          <form className="form-grid form-card bid-form" onSubmit={handleSubmitBid}>
            <div className="form-grid form-grid--columns">
              <label className="form-field">
                <span>Price</span>
                <input name="price" type="number" min="1" value={bidForm.price} onChange={handleBidChange} placeholder="450" required />
              </label>
              <label className="form-field">
                <span>Delivery days</span>
                <input name="deliveryDays" type="number" min="1" value={bidForm.deliveryDays} onChange={handleBidChange} placeholder="7" required />
              </label>
            </div>
            <label className="form-field">
              <span>Comment</span>
              <textarea name="comment" rows="4" maxLength="1000" value={bidForm.comment} onChange={handleBidChange} placeholder="I can complete this task." />
            </label>
            <button className="btn btn-primary" type="submit" disabled={isBidSubmitting}>
              {isBidSubmitting ? 'Submitting...' : 'Submit bid'}
            </button>
          </form>
        ) : null}

        {biddingClosed ? (
          <div className="state-card">
            <strong>Bidding is closed for this task.</strong>
            <p>The task is no longer accepting new bids.</p>
          </div>
        ) : null}

        {bidMessage ? <p className="form-success">{bidMessage}</p> : null}

        {areBidsLoading ? (
          <div className="state-card">
            <span className="loading-state__spinner" />
            <strong>Loading bids</strong>
            <p>Fetching freelancer offers.</p>
          </div>
        ) : null}

        {bidsError ? (
          <div className="state-card state-card--error">
            <strong>{bidsError}</strong>
          </div>
        ) : null}

        {!areBidsLoading && !bidsError && bids.length === 0 ? (
          <div className="state-card">
            <strong>No bids yet</strong>
            <p>When freelancers submit offers, they will appear here in realtime.</p>
          </div>
        ) : null}

        {!areBidsLoading && !bidsError && bids.length > 0 ? (
          <div className="bid-grid">
            {bids.map((bid) => (
              <article key={bid.id} className="bid-card">
                <div className="bid-card__header">
                  <div>
                    <h3>{getFreelancerName(bid)}</h3>
                    <p>Rating: {Number(bid.freelancer?.rating || 0).toFixed(2)}</p>
                  </div>
                  <span className={`status-pill status-pill--${bid.status?.toLowerCase()}`}>{bid.status}</span>
                </div>

                <div className="task-card__meta">
                  <span>
                    <strong>{formatMoney(bid.price)}</strong>
                    Price
                  </span>
                  <span>
                    <strong>{bid.deliveryDays} days</strong>
                    Delivery
                  </span>
                </div>

                {bid.comment ? <p>{bid.comment}</p> : <p>No comment provided.</p>}

                <div className="bid-card__footer">
                  <span>{bid.createdAt ? new Date(bid.createdAt).toLocaleString() : 'Recently'}</span>
                  {isOwner && task.status === 'OPEN' && bid.status === 'PENDING' ? (
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={acceptingBidId === bid.id}
                      onClick={() => handleAcceptBid(bid.id)}
                    >
                      {acceptingBidId === bid.id ? 'Accepting...' : 'Accept bid'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </PageSection>
    </div>
  );
}

export default TaskDetailsPage;
