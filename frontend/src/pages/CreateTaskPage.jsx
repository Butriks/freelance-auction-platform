import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function validateTaskForm(form, t) {
  if (!form.title.trim()) {
    return t('tasks.titleRequired');
  }

  if (!form.description.trim()) {
    return t('tasks.descriptionRequired');
  }

  if (!form.budget || Number(form.budget) <= 0) {
    return t('tasks.budgetRequired');
  }

  if (!form.deadline) {
    return t('tasks.deadlineRequired');
  }

  if (!form.categoryId) {
    return t('tasks.categoryRequired');
  }

  return '';
}

function CreateTaskPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateTaskForm(form, t);
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
      setError(requestError.message || t('tasks.unableToCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageSection
      eyebrow={t('tasks.createTitle')}
      title={t('tasks.postTitle')}
      description={t('tasks.postDescription')}
    >
      <form className="form-grid form-card task-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>{t('common.title')}</span>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder={t('tasks.titlePlaceholder')}
            required
          />
        </label>

        <label className="form-field">
          <span>{t('common.description')}</span>
          <textarea
            name="description"
            rows="6"
            value={form.description}
            onChange={handleChange}
            placeholder={t('tasks.descriptionPlaceholder')}
            required
          />
        </label>

        <div className="form-grid form-grid--columns">
          <label className="form-field">
            <span>{t('tasks.budget')}</span>
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
            <span>{t('tasks.deadline')}</span>
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
          <span>{t('tasks.category')}</span>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">{t('tasks.selectCategory')}</option>
            {fallbackCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('tasks.publishing') : t('tasks.publish')}
        </button>
      </form>
    </PageSection>
  );
}

export default CreateTaskPage;
