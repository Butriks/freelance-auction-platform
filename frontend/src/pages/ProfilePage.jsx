import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserReviews } from '../api/reviewApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(value, fallback) {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

function ProfileDetails({ user, t }) {
  const clientProfile = user?.clientProfile;
  const freelancerProfile = user?.freelancerProfile;

  if (clientProfile) {
    return (
      <div className="profile-list">
        <span>{t('profile.companyName')}</span>
        <strong>{clientProfile.companyName || t('common.notAvailable')}</strong>
        <span>{t('common.description')}</span>
        <strong>{clientProfile.description || t('common.notAvailable')}</strong>
        <span>{t('profile.rating')}</span>
        <strong>{Number(clientProfile.rating || 0).toFixed(2)}</strong>
      </div>
    );
  }

  if (freelancerProfile) {
    return (
      <div className="profile-list">
        <span>{t('profile.firstName')}</span>
        <strong>{freelancerProfile.firstName || t('common.notAvailable')}</strong>
        <span>{t('profile.lastName')}</span>
        <strong>{freelancerProfile.lastName || t('common.notAvailable')}</strong>
        <span>{t('profile.bio')}</span>
        <strong>{freelancerProfile.bio || t('common.notAvailable')}</strong>
        <span>{t('profile.hourlyRate')}</span>
        <strong>{freelancerProfile.hourlyRate ? `$${freelancerProfile.hourlyRate}` : t('common.notAvailable')}</strong>
        <span>{t('profile.rating')}</span>
        <strong>{Number(freelancerProfile.rating || 0).toFixed(2)}</strong>
      </div>
    );
  }

  return <p>{t('profile.noProfile')}</p>;
}

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      if (!user?.id) {
        setIsLoadingReviews(false);
        return;
      }

      setIsLoadingReviews(true);
      setReviewsError('');

      try {
        const { data } = await getUserReviews(user.id, {
          limit: 20,
          offset: 0,
        });

        if (isMounted) {
          setReviews(data.reviews || []);
        }
      } catch (requestError) {
        if (isMounted) {
          setReviewsError(requestError.message || t('profile.unableToLoadReviews'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [user?.id, t]);

  return (
    <PageSection
      eyebrow={t('profile.eyebrow')}
      title={t('profile.title')}
      description={t('profile.description')}
    >
      <div className="detail-grid">
        <article className="panel">
          <h3>{t('profile.account')}</h3>
          <div className="profile-list">
            <span>{t('profile.userId')}</span>
            <strong>{user?.id || t('common.notAvailable')}</strong>
            <span>{t('common.email')}</span>
            <strong>{user?.email || t('header.guest')}</strong>
            <span>{t('common.role')}</span>
            <strong>{user?.role || t('header.guest')}</strong>
            <span>{t('common.status')}</span>
            <strong>{user?.status ? t(`status.${user.status}`) : t('common.notAvailable')}</strong>
          </div>
        </article>

        <article className="panel">
          <h3>{t('profile.profileDetails')}</h3>
          <ProfileDetails user={user} t={t} />
        </article>
      </div>

      <section className="reviews-card">
        <div className="chat-card__header">
          <div>
            <p className="page-section__eyebrow">{t('profile.reviews')}</p>
            <h2>{t('reviews.feedbackTitle')}</h2>
          </div>
        </div>

        {isLoadingReviews ? (
          <div className="state-card">
            <span className="loading-state__spinner" />
            <strong>{t('reviews.loading')}</strong>
          </div>
        ) : null}

        {reviewsError ? <p className="form-error">{reviewsError}</p> : null}

        {!isLoadingReviews && !reviewsError && reviews.length === 0 ? (
          <div className="state-card">
            <strong>{t('profile.noReviews')}</strong>
            <p>{t('reviews.completedHint')}</p>
          </div>
        ) : null}

        {!isLoadingReviews && !reviewsError && reviews.length > 0 ? (
          <div className="review-grid">
            {reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="bid-card__header">
                  <div>
                    <h3>{review.fromUser?.email || t('reviews.reviewer')}</h3>
                    <p>{review.fromUser?.role || 'USER'}</p>
                  </div>
                  <span className="rating-badge">{review.rating} / 5</span>
                </div>
                <p>{review.comment || t('reviews.noComment')}</p>
                <time>{formatDate(review.createdAt, t('common.notAvailable'))}</time>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </PageSection>
  );
}

export default ProfilePage;
