import React from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, Play, ArrowLeft } from 'lucide-react';

export default function QuizInstructions({ quiz, onStartQuiz, onCancel }) {
  if (!quiz) return null;

  return (
    <div className="instructions-container">
      <div className="instructions-card">
        <button className="back-link" onClick={onCancel}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        <div className="instructions-header">
          <span className="quiz-category-badge">{quiz.category}</span>
          <h2>{quiz.title}</h2>
          <p>{quiz.description}</p>
        </div>

        <div className="quiz-quick-stats">
          <div className="stat-pill">
            <span className="pill-label">Total Questions</span>
            <span className="pill-val">{quiz.totalQuestions}</span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Duration</span>
            <span className="pill-val">{quiz.duration} Mins</span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Max Attempts</span>
            <span className="pill-val">1 Attempt Only</span>
          </div>
        </div>

        <div className="rules-section">
          <h3><ShieldCheck size={20} className="section-icon" /> Important Competition Rules</h3>
          <ul className="rules-list">
            <li>
              <strong>One Question at a Time:</strong> You will navigate through questions sequentially using Next/Previous buttons.
            </li>
            <li>
              <strong>Strict Single Attempt:</strong> Once started, your attempt is recorded. Refreshing or logging out will <em>NOT</em> grant extra attempts or reset your countdown.
            </li>
            <li>
              <strong>Countdown Timer:</strong> The timer will run continuously. If time expires, your answers will be auto-submitted automatically.
            </li>
            <li>
              <strong>Score-Only Result:</strong> Correct answer keys are withheld to preserve competition integrity. Only final score and rank will be presented upon submission.
            </li>
            {quiz.negativeMarking > 0 && (
              <li className="warning-rule">
                <strong>Negative Marking:</strong> Each incorrect response will deduct <span>{quiz.negativeMarking} mark(s)</span>.
              </li>
            )}
          </ul>
        </div>

        <div className="instructions-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary start-now-btn" onClick={() => onStartQuiz(quiz)}>
            <Play size={20} />
            <span>START QUIZ NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
}
