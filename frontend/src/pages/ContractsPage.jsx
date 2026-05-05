import React from 'react';
import PageSection from '../components/PageSection.jsx';

function ContractsPage() {
  return (
    <PageSection
      eyebrow="Contracts"
      title="Contracts and milestone delivery"
      description="A work-focused surface for active, completed and disputed contracts."
    >
      <div className="content-grid">
        <article className="panel">
          <h3>Active contract</h3>
          <p>Milestone timeline, escrow state, payments and chat will sit naturally here.</p>
        </article>
        <article className="panel">
          <h3>Completed contract</h3>
          <p>Reviews, payment history and final artifacts can be layered onto this layout later.</p>
        </article>
      </div>
    </PageSection>
  );
}

export default ContractsPage;
