import React from 'react';
import PageSection from '../components/PageSection.jsx';

const mockTasks = [
  ['Landing page for local brand', 'Web Development', '$500', 'OPEN'],
  ['Brand identity refresh', 'Design', '$320', 'IN_PROGRESS'],
  ['Monthly product copy', 'Copywriting', '$180', 'COMPLETED'],
];

function TasksPage() {
  return (
    <PageSection
      eyebrow="Tasks"
      title="Task board"
      description="A clean list surface prepared for search, filters and pagination."
      action={<button className="btn btn-primary" type="button">New task</button>}
    >
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Budget</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTasks.map((task) => (
              <tr key={task[0]}>
                <td>{task[0]}</td>
                <td>{task[1]}</td>
                <td>{task[2]}</td>
                <td><span className="status-pill">{task[3]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}

export default TasksPage;
