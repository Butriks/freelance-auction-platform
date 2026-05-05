import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fallbackCategories } from '../api/categoryApi.js';
import { deleteTask, getTaskById, updateTask } from '../api/taskApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function getCategoryName(task) {
  return task?.category?.name || fallbackCategories.find((category) => category.id === Number(task?.categoryId))?.name || 'No category';
}

function getClientName(task) {
  return task?.client?.companyName || task?.client?.user?.email || 'Client';
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

function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const isOwner = user?.role === 'CLIENT'
    && (!task?.client?.userId || Number(task.client.userId) === Number(user.id));
  const canEdit = isOwner && task?.status === 'OPEN';

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getTaskById(id);
        const nextTask = data.task || data;

        if (isMounted) {
          setTask(nextTask);
          setForm(buildEditForm(nextTask));
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

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
        description="Review the task, client details and delivery constraints."
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
              <p>
                Backend ownership checks still protect these actions. Open tasks can be edited or deleted.
              </p>
            </div>
            <div className="button-row">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={!canEdit}
                onClick={() => setIsEditing((current) => !current)}
              >
                {isEditing ? 'Cancel edit' : 'Edit'}
              </button>
              {task.status === 'OPEN' ? (
                <button
                  className="btn btn-danger"
                  type="button"
                  disabled={!isOwner || isDeleting}
                  onClick={handleDelete}
                >
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
    </div>
  );
}

export default TaskDetailsPage;
