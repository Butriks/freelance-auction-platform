import React from 'react';
import PageSection from '../components/PageSection.jsx';

function TaskDetailsPage() {
  return (
    <div className="page-stack">
      <PageSection
        eyebrow="Task details"
        title="Landing page for local brand"
        description="A compact details view ready for bids, timeline, contract state and chat links."
      >
        <div className="detail-grid">
          <article className="panel">
            <h3>Summary</h3>
            <p>Need a responsive landing page with a polished hero, service blocks and contact form.</p>
          </article>
          <article className="panel">
            <h3>Status</h3>
            <p>Open for bidding. Real server data can be connected here later.</p>
          </article>
        </div>
      </PageSection>
    </div>
  );
}

export default TaskDetailsPage;
