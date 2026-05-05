import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fallbackCategories } from '../api/categoryApi.js';
import { createTask } from '../api/taskApi.js';
import PageSection from '../components/PageSection.jsx';

const initialForm = {
  title: '',
  description: '',
  budget: '',
  deadline: '',
  categoryId: '',
};

function validateTaskForm(form) {
  if (!form.title.trim()) {
    return 'Title is required.';
  }

  if (!form.description.trim()) {
    return 'Description is required.';
  }

  if (!form.budget || Number(form.budget) <= 0) {
    return 'Budget must be greater than 0.';
  }

  if (!form.deadline) {
    return 'Deadline is required.';
  }

  if (!form.categoryId) {
    return 'Category is required.';
  }

  return '';
}

function CreateTaskPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateTaskForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        budget: Number(form.budget),
        deadline: form.deadline,
        categoryId: Number(form.categoryId),
      };
      const { data } = await createTask(payload);
      const taskId = data.task?.id || data.id;

      navigate(taskId ? `/tasks/${taskId}` : '/tasks', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageSection
      eyebrow="Create task"
      title="Post a new project"
      description="Describe the work clearly so freelancers can place accurate bids."
    >
      <form className="form-grid form-card task-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Title</span>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Create landing page"
            required
          />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea
            name="description"
            rows="6"
            value={form.description}
            onChange={handleChange}
            placeholder="Need a responsive landing page for a small business"
            required
          />
        </label>

        <div className="form-grid form-grid--columns">
          <label className="form-field">
            <span>Budget</span>
            <input
              name="budget"
              type="number"
              min="1"
              value={form.budget}
              onChange={handleChange}
              placeholder="500"
              required
            />
          </label>

          <label className="form-field">
            <span>Deadline</span>
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              required
            />
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

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish task'}
        </button>
      </form>
    </PageSection>
  );
}

export default CreateTaskPage;
