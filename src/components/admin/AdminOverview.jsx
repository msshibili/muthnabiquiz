import React from 'react';
import { Users, BookOpen, Trophy, TrendingUp, Plus, ArrowRight, Clock, Award, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function AdminOverview({ users, quizzes, attempts, onNavigateTab, onCreateQuiz }) {
  const totalUsers = users.length;
  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter(q => q.status === 'active').length;
  const totalAttempts = attempts.length;

  // Compute average score & highest score
  let totalScoreSum = 0;
  let maxScoreSum = 0;
  let highestScorePct = 0;

  attempts.forEach(a => {
    totalScoreSum += Number(a.score || 0);
    maxScoreSum += Number(a.maxScore || 1);
    if (a.percentage > highestScorePct) highestScorePct = a.percentage;
  });

  const avgPercentage = maxScoreSum > 0 ? Math.round((totalScoreSum / maxScoreSum) * 100) : 0;
  const recentAttempts = [...attempts].reverse().slice(0, 6);

  return (
    <div className="admin-overview-container">
      {/* Quick Action Bar */}
      <div className="overview-quick-actions">
        <button className="quick-action-card" onClick={onCreateQuiz}>
          <div className="quick-action-icon red-glow">
            <Plus size={20} />
          </div>
          <div className="quick-action-text">
            <h4>Create Quiz</h4>
            <p>Setup a new competition</p>
          </div>
        </button>

        <button className="quick-action-card" onClick={() => onNavigateTab('results')}>
          <div className="quick-action-icon gold-glow">
            <Trophy size={20} />
          </div>
          <div className="quick-action-text">
            <h4>View Leaderboard & CSV</h4>
            <p>Export participant results</p>
          </div>
        </button>

        <button className="quick-action-card" onClick={() => onNavigateTab('quizzes')}>
          <div className="quick-action-icon green-glow">
            <BookOpen size={20} />
          </div>
          <div className="quick-action-text">
            <h4>Manage Questions</h4>
            <p>CSV import & question editor</p>
          </div>
        </button>
      </div>

      {/* Primary Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => onNavigateTab('users')}>
          <div className="metric-icon users-bg">
            <Users size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-val">{totalUsers}</span>
            <span className="metric-lbl">Registered Contestants</span>
          </div>
          <ArrowRight size={18} className="metric-arrow" />
        </div>

        <div className="metric-card" onClick={() => onNavigateTab('quizzes')}>
          <div className="metric-icon quizzes-bg">
            <BookOpen size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-val">{totalQuizzes}</span>
            <span className="metric-lbl">Total Quizzes ({activeQuizzes} Active)</span>
          </div>
          <ArrowRight size={18} className="metric-arrow" />
        </div>

        <div className="metric-card" onClick={() => onNavigateTab('results')}>
          <div className="metric-icon attempts-bg">
            <Trophy size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-val">{totalAttempts}</span>
            <span className="metric-lbl">Total Submissions</span>
          </div>
          <ArrowRight size={18} className="metric-arrow" />
        </div>

        <div className="metric-card">
          <div className="metric-icon score-bg">
            <TrendingUp size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-val">{avgPercentage}%</span>
            <span className="metric-lbl">Average Score (Top: {highestScorePct}%)</span>
          </div>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="overview-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <CheckCircle2 size={20} className="header-icon-accent" />
            <h3>Recent Participant Submissions</h3>
          </div>
          <button className="btn-link" onClick={() => onNavigateTab('results')}>
            View All Results ({attempts.length}) →
          </button>
        </div>

        {recentAttempts.length === 0 ? (
          <p className="empty-subtext">No quiz attempts recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Mobile Number</th>
                  <th>Competition Quiz</th>
                  <th>Score Obtained</th>
                  <th>Submitted Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="user-table-cell">
                        <div className="table-avatar">{a.userName.charAt(0).toUpperCase()}</div>
                        <strong>{a.userName}</strong>
                      </div>
                    </td>
                    <td><span className="phone-code-chip">{a.userMobile}</span></td>
                    <td><strong>{a.quizTitle}</strong></td>
                    <td>
                      <span className="score-badge">{a.score} / {a.maxScore}</span>
                      <small className="percentage-small">({a.percentage}%)</small>
                    </td>
                    <td><span className="time-date-text">{formatDate(a.submittedAt)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
