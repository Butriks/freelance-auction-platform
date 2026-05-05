import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fallbackCategories } from '../api/categoryApi.js';
import { getTasks } from '../api/taskApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const limit = 10;

function getTaskList(data) {
  return data.tasks || data.rows || [];
}

function getCategoryName(task) {
  return task.category?.name || fallbackCategories.find((category) => category.id === Number(task.categoryId))?.name || 'No category';
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    categoryId: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Math.floor(offset / limit) + 1;
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < count;

  const queryParams = useMemo(() => ({
    limit,
    offset,
    search: appliedFilters.search || undefined,
    status: appliedFilters.status || undefined,
    categoryId: appliedFilters.categoryId || undefined,
  }), [appliedFilters, offset]);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getTasks(queryParams);

        if (isMounted) {
          setTasks(getTaskList(data));
          setCount(data.count || 0);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || 'Unable to load tasks.');
          setTasks([]);
          setCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [queryParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const nextFilters = { search: '', status: '', categoryId: '' };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setOffset(0);
  };

  return (
    <PageSection
      eyebrow="Tasks"
      title="Task board"
      description="Browse client tasks, filter open opportunities and move into details when something looks worth a closer look."
      action={user?.role === 'CLIENT' ? (
        <Link className="btn btn-primary" to="/tasks/create">
          Create Task
        </Link>
      ) : null}
    >
      <form className="filter-card" onSubmit={applyFilters}>
        <label className="form-field">
          <span>Search</span>
          <input
            name="search"
            type="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by title or description"
          />
        </label>

        <label className="form-field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Category</span>
          <select name="categoryId" value={filters.categoryId} onChange={handleChange}>
            <option value="">All categories</option>
            {fallbackCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <div className="filter-card__actions">
          <button className="btn btn-primary" type="submit">Apply</button>
          <button className="btn btn-secondary" type="button" onClick={resetFilters}>Reset</button>
        </div>
      </form>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>Loading tasks</strong>
          <p>Fetching the latest task board.</p>
        </div>
      ) : null}

      {error ? (
        <div className="state-card state-card--error">
          <strong>{error}</strong>
          <p>Check that the backend is running and your session is still valid.</p>
        </div>
      ) : null}

      {!isLoading && !error && tasks.length === 0 ? (
        <div className="state-card">
          <strong>No tasks found</strong>
          <p>Try another filter or create the first task as a client.</p>
        </div>
      ) : null}

      {!isLoading && !error && tasks.length > 0 ? (
        <>
          <div className="task-grid">
            {tasks.map((task) => (
              <article key={task.id} className="task-card">
                <div className="task-card__top">
                  <span className={`status-pill status-pill--${task.status?.toLowerCase()}`}>
                    {task.status}
                  </span>
                  <span className="task-card__category">{getCategoryName(task)}</span>
                </div>

                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>

                <div className="task-card__meta">
                  <span>
                    <strong>{formatMoney(task.budget)}</strong>
                    Budget
                  </span>
                  <span>
                    <strong>{task.deadline}</strong>
                    Deadline
                  </span>
                </div>

                <Link className="btn btn-secondary" to={`/tasks/${task.id}`}>
                  View details
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination-bar">
            <button
              className="btn btn-secondary"
              type="button"
              disabled={!hasPrevious}
              onClick={() => setOffset((current) => Math.max(0, current - limit))}
            >
              Previous
            </button>
            <span>Page {page} of {Math.max(1, Math.ceil(count / limit))}</span>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={!hasNext}
              onClick={() => setOffset((current) => current + limit)}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </PageSection>
  );
}

export default TasksPage;
