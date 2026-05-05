import React from 'react';
import PageSection from '../components/PageSection.jsx';

function AdminUsersPage() {
  return (
    <PageSection
      eyebrow="Admin"
      title="User management"
      description="An admin surface ready for search, role filters and block or unblock actions."
    >
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>client@test.com</td>
              <td>CLIENT</td>
              <td>ACTIVE</td>
              <td><button className="btn btn-secondary" type="button">Block</button></td>
            </tr>
            <tr>
              <td>freelancer@test.com</td>
              <td>FREELANCER</td>
              <td>ACTIVE</td>
              <td><button className="btn btn-secondary" type="button">Block</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}

export default AdminUsersPage;
