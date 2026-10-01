import React, { useState } from 'react';
import { formatDate } from '../../utils/formatters';
import { Search, Users, Phone, Calendar, Download } from 'lucide-react';
import { csvService } from '../../services/csvService';

export default function UserList({ users, attempts }) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => {
    return (
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.mobile && u.mobile.includes(search))
    );
  });

  const handleExportCsv = () => {
    csvService.exportUsersToCsv(users, attempts);
  };

  return (
    <div className="user-list-container">
      <div className="manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Registered Contestants</h2>
          <p>Total {users.length} registered students</p>
        </div>
        <button className="btn-secondary" onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} />
          <span>Export Contestants CSV</span>
        </button>
      </div>

      <div className="results-toolbar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name or mobile number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-dashboard-state">
          <Users size={48} className="empty-icon" />
          <h3>No Users Found</h3>
          <p>No registered contestants match your search query.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Year / Sem</th>
                <th>Branch</th>
                <th>Registration Date</th>
                <th>Quiz Participation History</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => {
                const userAttempts = attempts.filter(a => a.userId === u.uid);
                return (
                  <tr key={u.uid || idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{u.name || 'Contestant'}</strong></td>
                    <td><span className="phone-code-chip">{u.mobile}</span></td>
                    <td><span className="sem-chip">{u.year || 'S1'}</span></td>
                    <td><span className="branch-chip">{u.branch || 'CSE'}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {userAttempts.length > 0 ? (
                        <div className="user-history-tags">
                          {userAttempts.map(att => (
                            <span key={att.id} className="history-chip">
                              {att.quizTitle} ({att.score}/{att.maxScore})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="no-attempts-tag">No attempts yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
