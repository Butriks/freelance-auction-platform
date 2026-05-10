import React, { useEffect, useState } from 'react';
import { getUserReviews } from '../api/reviewApi.js';
import PageSection from '../components/PageSection.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

function ProfileDetails({ user }) {
  const clientProfile = user?.clientProfile;
  const freelancerProfile = user?.freelancerProfile;

  if (clientProfile) {
    return (
      <div className="profile-list">
        <span>Company</span>
        <strong>{clientProfile.companyName || 'N/A'}</strong>
        <span>Description</span>
        <strong>{clientProfile.description || 'N/A'}</strong>
        <span>Rating</span>
        <strong>{Number(clientProfile.rating || 0).toFixed(2)}</strong>
      </div>
    );
  }

  if (freelancerProfile) {
    return (
      <div className="profile-list">
        <span>First name</span>
        <strong>{freelancerProfile.firstName || 'N/A'}</strong>
        <span>Last name</span>
        <strong>{freelancerProfile.lastName || 'N/A'}</strong>
        <span>Bio</span>
        <strong>{freelancerProfile.bio || 'N/A'}</strong>
        <span>Hourly rate</span>
        <strong>{freelancerProfile.hourlyRate ? `$${freelancerProfile.hourlyRate}` : 'N/A'}</strong>
        <span>Rating</span>
        <strong>{Number(freelancerProfile.rating || 0).toFixed(2)}</strong>
      </div>
    );
  }

  return <p>Profile details are not available from the current session data.</p>;
}

function ProfilePage() {
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
          setReviewsError(requestError.message || 'Unable to load reviews.');
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
  }, [user?.id]);

  return (
    <PageSection
      eyebrow="Profile"
      title="Account overview"
      description="Review your identity, role and received feedback."
    >
      <div className="detail-grid">
        <article className="panel">
          <h3>Current user</h3>
          <div className="profile-list">
            <span>User ID</span>
            <strong>{user?.id || 'N/A'}</strong>
            <span>Email</span>
            <strong>{user?.email || 'guest@example.com'}</strong>
            <span>Role</span>
            <strong>{user?.role || 'Guest'}</strong>
            <span>Status</span>
            <strong>{user?.status || 'N/A'}</strong>
          </div>
        </article>

        <article className="panel">
          <h3>Profile details</h3>
          <ProfileDetails user={user} />
        </article>
      </div>

      <section className="reviews-card">
        <div className="chat-card__header">
          <div>
            <p className="page-section__eyebrow">Received Reviews</p>
            <h2>Feedback from contracts</h2>
          </div>
        </div>

        {isLoadingReviews ? (
          <div className="state-card">
            <span className="loading-state__spinner" />
            <strong>Loading reviews</strong>
          </div>
        ) : null}

        {reviewsError ? <p className="form-error">{reviewsError}</p> : null}

        {!isLoadingReviews && !reviewsError && reviews.length === 0 ? (
          <div className="state-card">
            <strong>No received reviews yet</strong>
            <p>Reviews will appear here after completed contracts.</p>
          </div>
        ) : null}

        {!isLoadingReviews && !reviewsError && reviews.length > 0 ? (
          <div className="review-grid">
            {reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="bid-card__header">
                  <div>
                    <h3>{review.fromUser?.email || 'Reviewer'}</h3>
                    <p>{review.fromUser?.role || 'USER'}</p>
                  </div>
                  <span className="rating-badge">{review.rating} / 5</span>
                </div>
                <p>{review.comment || 'No comment provided.'}</p>
                <time>{formatDate(review.createdAt)}</time>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </PageSection>
  );
}

export default ProfilePage;
