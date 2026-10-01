import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { formatDuration } from '../../utils/formatters';
import { Award, CheckCircle, Clock, Trophy, ArrowLeft, ShieldCheck, ListOrdered } from 'lucide-react';

export default function QuizResult({ attempt, quiz, onBackToDashboard, onViewLeaderboard }) {
  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  if (!attempt) return null;

  const showScore = quiz ? quiz.showScore !== false : true;
  const showPercentage = quiz ? quiz.showPercentage !== false : true;
  const showTimeTaken = quiz ? quiz.showTimeTaken !== false : true;

  return (
    <div className="quiz-result-container">
      <div className="result-card">
        <div className="result-header-badge">
          <Trophy size={48} className="trophy-gold" />
          <h1>QUIZ COMPLETED</h1>
          <p className="result-subtitle">{attempt.quizTitle || quiz?.title}</p>
        </div>

        {/* Primary Score & Percentage Display */}
        <div className="score-main-box">
          {showScore && (
            <div className="score-primary">
              <span className="score-label">YOUR SCORE</span>
              <div className="score-number-row">
                <span className="user-score">{attempt.score}</span>
                <span className="max-score">/ {attempt.maxScore}</span>
              </div>
            </div>
          )}

          {showPercentage && (
            <div className="percentage-circle-wrap">
              <div className="percentage-pill">
                <span>{attempt.percentage}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Stats Summary */}
        <div className="result-stats-grid">
          <div className="stat-card">
            <CheckCircle size={20} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-val">{attempt.attemptedCount} / {attempt.totalQuestions}</span>
              <span className="stat-lbl">Questions Attempted</span>
            </div>
          </div>

          {showTimeTaken && (
            <div className="stat-card">
              <Clock size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-val">{formatDuration(attempt.timeTakenSeconds)}</span>
                <span className="stat-lbl">Time Taken</span>
              </div>
            </div>
          )}
        </div>

        {/* Strict Security Policy Callout */}
        <div className="security-notice-box">
          <ShieldCheck size={20} className="shield-notice-icon" />
          <p>
            <strong>Official Contest Notice:</strong> Correct answer keys are withheld to preserve competition security and prevent unauthorized leakages.
          </p>
        </div>

        {/* Result Action Buttons */}
        <div className="result-actions">
          <button className="btn-secondary" onClick={onBackToDashboard}>
            <ArrowLeft size={18} />
            <span>Return to Dashboard</span>
          </button>

          {quiz?.leaderboardEnabled !== false && (
            <button className="btn-primary" onClick={() => onViewLeaderboard(quiz)}>
              <ListOrdered size={18} />
              <span>View Leaderboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
