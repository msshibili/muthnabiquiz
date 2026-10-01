import React, { useState } from 'react';
import { csvService } from '../../services/csvService';
import { formatDate, formatDuration } from '../../utils/formatters';
import { Download, Search, Filter, Trophy, Clock, Phone, User } from 'lucide-react';

export default function ResultsManager({ attempts, quizzes }) {
  const [search, setSearch] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'score_high', 'time_fast'

  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch = 
      (a.userName && a.userName.toLowerCase().includes(search.toLowerCase())) ||
      (a.userMobile && a.userMobile.includes(search)) ||
      (a.quizTitle && a.quizTitle.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedQuizId !== 'all' && a.quizId !== selectedQuizId) return false;
    return true;
  });

  // Sorting logic
  filteredAttempts.sort((a, b) => {
    if (sortBy === 'score_high') {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTakenSeconds - b.timeTakenSeconds;
    }
    if (sortBy === 'time_fast') {
      return a.timeTakenSeconds - b.timeTakenSeconds;
    }
    // Newest submitted default
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  const handleExportCsv = () => {
    const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
    const title = selectedQuiz ? selectedQuiz.title : 'All_Competitions';
    csvService.exportResultsToCsv(filteredAttempts, title);
  };

  return (
    <div className="results-manager-container">
      <div className="manager-header">
        <div>
          <h2>Participant Results & Analytics</h2>
          <p>Detailed performance records for all quiz attempts</p>
        </div>

        <button className="btn-success export-btn" onClick={handleExportCsv}>
          <Download size={18} />
          <span>Export Results as CSV</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="results-toolbar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by participant name, mobile, or quiz..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <select 
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            <option value="all">All Quizzes ({quizzes.length})</option>
            {quizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort by: Newest Submission</option>
            <option value="score_high">Sort by: Highest Score</option>
            <option value="time_fast">Sort by: Fastest Completion</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredAttempts.length === 0 ? (
        <div className="empty-dashboard-state">
          <Trophy size={48} className="empty-icon" />
          <h3>No Attempt Results Found</h3>
          <p>No participant attempts match your current search and filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Participant</th>
                <th>Mobile Number</th>
                <th>Quiz Title</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Time Taken</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.map((a, idx) => (
                <tr key={a.id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{a.userName}</strong>
                  </td>
                  <td>{a.userMobile}</td>
                  <td>{a.quizTitle}</td>
                  <td>
                    <span className="score-badge">{a.score} / {a.maxScore}</span>
                  </td>
                  <td>
                    <span className="pct-pill">{a.percentage}%</span>
                  </td>
                  <td>
                    <Clock size={14} /> {formatDuration(a.timeTakenSeconds)}
                  </td>
                  <td>{formatDate(a.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
