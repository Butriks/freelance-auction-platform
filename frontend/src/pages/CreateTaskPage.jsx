import React from 'react';
import PageSection from '../components/PageSection.jsx';

function CreateTaskPage() {
  return (
    <PageSection
      eyebrow="Create task"
      title="Post a new project"
      description="A polished form shell that can be connected to the task creation API later."
    >
      <form className="form-grid form-card">
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Create landing page" />
        </label>
        <label className="form-field">
          <span>Description</span>
          <textarea rows="5" placeholder="Describe the work, goals and expected delivery." />
        </label>
        <div className="form-grid form-grid--columns">
          <label className="form-field">
            <span>Budget</span>
            <input type="number" placeholder="500" />
          </label>
          <label className="form-field">
            <span>Deadline</span>
            <input type="date" />
          </label>
        </div>
        <button className="btn btn-primary" type="button">Publish task</button>
      </form>
    </PageSection>
  );
}

export default CreateTaskPage;
