import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createReview, getContractReviews } from '../api/reviewApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const initialReviewForm = {
  rating: '5',
  comment: '',
};

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

function RatingBadge({ rating }) {
  return <span className="rating-badge">{Number(rating || 0)} / 5</span>;
}

function ContractReviews({ contract }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(initialReviewForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const alreadyReviewed = useMemo(() => (
    reviews.some((review) => Number(review.fromUserId || review.fromUser?.id) === Number(user?.id))
  ), [reviews, user?.id]);
  const canReview = contract.status === 'COMPLETED'
    && ['CLIENT', 'FREELANCER'].includes(user?.role)
    && !alreadyReviewed;

  const loadReviews = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await getContractReviews(contract.id);
      setReviews(data.reviews || []);
    } catch (requestError) {
      setError(requestError.message || t('reviews.unableToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [contract.id, t]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const rating = Number(form.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage(t('reviews.validation'));
      return;
    }

    if (form.comment.length > 2000) {
      setMessage(t('reviews.commentValidation'));
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview(contract.id, {
        rating,
        comment: form.comment.trim() || undefined,
      });
      setForm(initialReviewForm);
      await loadReviews();
      setMessage(t('reviews.created'));
    } catch (requestError) {
      setMessage(requestError.message || t('reviews.unableToCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="reviews-card">
      <div className="chat-card__header">
        <div>
          <p className="page-section__eyebrow">{t('reviews.title')}</p>
          <h2>{t('reviews.feedbackTitle')}</h2>
        </div>
      </div>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {canReview ? (
        <form className="form-grid form-card review-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>{t('reviews.rating')}</span>
            <select name="rating" value={form.rating} onChange={handleChange} required>
              <option value="5">5 / 5</option>
              <option value="4">4 / 5</option>
              <option value="3">3 / 5</option>
              <option value="2">2 / 5</option>
              <option value="1">1 / 5</option>
            </select>
          </label>
          <label className="form-field">
            <span>{t('reviews.comment')}</span>
            <textarea
              name="comment"
              rows="4"
              maxLength="2000"
              value={form.comment}
              onChange={handleChange}
              placeholder={t('reviews.commentPlaceholder')}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('reviews.submitting') : t('reviews.submit')}
          </button>
        </form>
      ) : null}

      {contract.status === 'COMPLETED' && alreadyReviewed ? (
        <div className="state-card">
          <strong>{t('reviews.alreadySubmitted')}</strong>
        </div>
      ) : null}

      {contract.status !== 'COMPLETED' ? (
        <div className="state-card">
          <strong>{t('reviews.openAfterCompletion')}</strong>
        </div>
      ) : null}

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('reviews.loading')}</strong>
        </div>
      ) : null}

      {!isLoading && reviews.length === 0 ? (
        <div className="state-card">
          <strong>{t('reviews.empty')}</strong>
          <p>{t('reviews.completedHint')}</p>
        </div>
      ) : null}

      {!isLoading && reviews.length > 0 ? (
        <div className="review-grid">
          {reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="bid-card__header">
                <div>
                  <h3>{review.fromUser?.email || t('reviews.reviewer')}</h3>
                  <p>{review.fromUser?.role || 'USER'} {t('reviews.to')} {review.toUser?.email || t('reviews.participant')}</p>
                </div>
                <RatingBadge rating={review.rating} />
              </div>
              <p>{review.comment || t('reviews.noComment')}</p>
              <time>{formatDate(review.createdAt, t('common.notAvailable'))}</time>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default ContractReviews;
