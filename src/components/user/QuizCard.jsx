import React from 'react';
import { Clock, HelpCircle, Trophy, CheckCircle, Lock, Calendar, Award } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export default function QuizCard({ quiz, attempt, onStart, onViewScore, onViewLeaderboard }) {
  const isAttempted = Boolean(attempt);
  
  // Status check
  const now = new Date();
  const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
  const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

  let computedStatus = quiz.status || 'active';
  if (startDate && startDate > now) computedStatus = 'upcoming';
  if (endDate && endDate < now) computedStatus = 'closed';

  return (
    <div className={`quiz-card ${isAttempted ? 'card-attempted' : ''} status-${computedStatus}`}>
      <div className="quiz-card-header">
        <span className="quiz-category-badge">{quiz.category || 'General'}</span>
        <span className={`quiz-status-pill status-${computedStatus}`}>
          {isAttempted ? 'ATTEMPTED' : computedStatus.toUpperCase()}
        </span>
      </div>

      <h3 className="quiz-card-title">{quiz.title}</h3>
      <p className="quiz-card-desc">{quiz.description}</p>

      <div className="quiz-card-meta">
        <div className="meta-item">
          <HelpCircle size={16} />
          <span>{quiz.totalQuestions || 0} Questions</span>
        </div>
        <div className="meta-item">
          <Clock size={16} />
          <span>{quiz.duration || 10} Minutes</span>
        </div>
        {quiz.negativeMarking > 0 && (
          <div className="meta-item negative-badge" title={`-${quiz.negativeMarking} per wrong answer`}>
            <span>Negative Marking: -{quiz.negativeMarking}</span>
          </div>
        )}
      </div>

      <div className="quiz-card-actions">
        {isAttempted ? (
          <div className="attempted-action-wrap">
            <button className="btn-success full-width" onClick={() => onViewScore(quiz, attempt)}>
              <CheckCircle size={18} />
              <span>VIEW SCORE</span>
            </button>
          </div>
        ) : computedStatus === 'active' ? (
          <button className="btn-primary full-width" onClick={() => onStart(quiz)}>
            <Trophy size={18} />
            <span>START QUIZ</span>
          </button>
        ) : computedStatus === 'upcoming' ? (
          <button className="btn-disabled full-width" disabled>
            <Calendar size={18} />
            <span>COMING SOON</span>
          </button>
        ) : (
          <button className="btn-disabled full-width" disabled>
            <Lock size={18} />
            <span>QUIZ CLOSED</span>
          </button>
        )}

        {quiz.leaderboardEnabled && (
          <button 
            className="btn-secondary leaderboard-card-btn"
            onClick={() => onViewLeaderboard(quiz)}
            title="View Public Leaderboard"
          >
            <Award size={18} />
            <span className="hide-mobile">Leaderboard</span>
          </button>
        )}
      </div>
    </div>
  );
}
