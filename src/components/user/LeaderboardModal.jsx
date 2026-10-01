import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { formatDuration } from '../../utils/formatters';
import { X, Trophy, Medal, Clock, Award } from 'lucide-react';

export default function LeaderboardModal({ quiz, isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && quiz) {
      setLoading(true);
      quizService.getLeaderboard(quiz.id)
        .then(data => setLeaderboard(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, quiz]);

  if (!isOpen || !quiz) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card leaderboard-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="leaderboard-header">
          <Trophy size={32} className="trophy-gold" />
          <h2>Leaderboard</h2>
          <p className="leaderboard-subtitle">{quiz.title}</p>
        </div>

        {loading ? (
          <div className="modal-loading">Loading standings...</div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-leaderboard">
            <Award size={40} className="empty-icon" />
            <p>No attempts recorded yet for this competition. Be the first to play!</p>
          </div>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Participant</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => {
                  let rankClass = '';
                  if (row.rank === 1) rankClass = 'rank-1';
                  if (row.rank === 2) rankClass = 'rank-2';
                  if (row.rank === 3) rankClass = 'rank-3';

                  return (
                    <tr key={row.rank} className={rankClass}>
                      <td className="rank-cell">
                        {row.rank === 1 && <Medal className="gold-medal" size={18} />}
                        {row.rank === 2 && <Medal className="silver-medal" size={18} />}
                        {row.rank === 3 && <Medal className="bronze-medal" size={18} />}
                        <span>#{row.rank}</span>
                      </td>
                      <td className="name-cell">
                        <strong>{row.userName}</strong>
                      </td>
                      <td className="score-cell">
                        <span className="score-badge">{row.score} / {row.maxScore}</span>
                        <small className="percentage-small">({row.percentage}%)</small>
                      </td>
                      <td className="time-cell">
                        <Clock size={14} />
                        <span>{formatDuration(row.timeTakenSeconds)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
