import React, { useState } from 'react';
import { formatDate } from '../../utils/formatters';
import { Search, Users, Phone, Calendar, Download, Trash2, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { csvService } from '../../services/csvService';

export default function UserList({ users = [], attempts = [], onDeleteUser, onDeleteUsers }) {
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const filteredUsers = users.filter(u => {
    return (
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.mobile && u.mobile.includes(search)) ||
      (u.branch && u.branch.toLowerCase().includes(search.toLowerCase())) ||
      (u.year && u.year.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.uid));
    }
  };

  const handleToggleSelectUser = (uid) => {
    if (selectedUserIds.includes(uid)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== uid));
    } else {
      setSelectedUserIds([...selectedUserIds, uid]);
    }
  };

  const handleBulkDelete = () => {
    if (onDeleteUsers && selectedUserIds.length > 0) {
      onDeleteUsers(selectedUserIds);
      setSelectedUserIds([]);
    }
  };

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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedUserIds.length > 0 && onDeleteUsers && (
            <button 
              className="btn-primary" 
              onClick={handleBulkDelete} 
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '1px solid #f87171' }}
            >
              <Trash2 size={16} />
              <span>Delete Selected ({selectedUserIds.length})</span>
            </button>
          )}
          <button className="btn-secondary" onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} />
            <span>Export Contestants CSV</span>
          </button>
        </div>
      </div>

      <div className="results-toolbar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name, mobile, branch, or semester..." 
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
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={handleSelectAll} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title={selectedUserIds.length === filteredUsers.length ? "Deselect All" : "Select All"}
                  >
                    {selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th>#</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Year / Sem</th>
                <th>Branch</th>
                <th>Registration Date</th>
                <th>Quiz Participation History</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => {
                const userAttempts = attempts.filter(a => a.userId === u.uid);
                const isSelected = selectedUserIds.includes(u.uid);
                return (
                  <tr key={u.uid || idx} className={isSelected ? 'selected-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleToggleSelectUser(u.uid)}
                        style={{ background: 'none', border: 'none', color: isSelected ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="user-table-cell">
                        <div className="table-avatar">
                          {(u.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <strong>{u.name || 'Contestant'}</strong>
                      </div>
                    </td>
                    <td><span className="phone-code-chip">{u.mobile}</span></td>
                    <td><span className="sem-chip">{u.year || 'S1'}</span></td>
                    <td><span className="branch-chip">{u.branch || 'CSE'}</span></td>
                    <td><span className="time-date-text">{formatDate(u.createdAt)}</span></td>
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
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        className="icon-btn delete-btn" 
                        title="Delete Contestant"
                        onClick={() => onDeleteUser && onDeleteUser(u.uid, u.name)}
                        style={{ margin: '0 auto' }}
                      >
                        <Trash2 size={16} />
                      </button>
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
