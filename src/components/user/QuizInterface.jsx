import React, { useState, useEffect, useRef } from 'react';
import { quizService } from '../../services/quizService';
import { formatTimer } from '../../utils/formatters';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export default function QuizInterface({ quiz, user, isPreview = false, onSubmitted, onCancelPreview }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState((quiz.duration || 10) * 60);
  const timerRef = useRef(null);

  // 1. Fetch Questions & Initialize Timer
  useEffect(() => {
    let isMounted = true;
    async function loadQuizData() {
      try {
        const fetchedQuestions = await quizService.getQuestions(quiz.id, isPreview);
        if (!isMounted) return;
        setQuestions(fetchedQuestions);

        if (!isPreview && quiz.timerEnabled !== false) {
          const timerInfo = quizService.getOrStartTimer(user.uid, quiz.id, quiz.duration || 10);
          setRemainingSeconds(timerInfo.remainingSeconds);

          if (timerInfo.isExpired) {
            handleAutoSubmit({});
          }
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadQuizData();

    return () => {
      isMounted = false;
    };
  }, [quiz.id, user?.uid, isPreview]);

  // 2. Countdown Timer Ticker
  useEffect(() => {
    if (loading || isPreview || quiz.timerEnabled === false) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isPreview, answers]);

  const handleOptionSelect = (questionId, selectedOption, isMulti = false) => {
    setAnswers((prev) => {
      if (isMulti) {
        const currentArr = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        if (currentArr.includes(selectedOption)) {
          return { ...prev, [questionId]: currentArr.filter(o => o !== selectedOption) };
        } else {
          return { ...prev, [questionId]: [...currentArr, selectedOption] };
        }
      } else {
        return { ...prev, [questionId]: selectedOption };
      }
    });
  };

  const handleAutoSubmit = async (currentAnswers) => {
    if (submitting) return;
    setSubmitting(true);

    if (isPreview) {
      alert('Preview Timer Expired! In actual participant mode, quiz auto-submits.');
      if (onCancelPreview) onCancelPreview();
      return;
    }

    try {
      const result = await quizService.submitQuizAttempt(user, quiz.id, currentAnswers || answers);
      if (onSubmitted) onSubmitted(result);
    } catch (err) {
      console.error('Auto submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);

    if (isPreview) {
      alert('Admin Preview Submitted! Score calculation demo verified.');
      if (onCancelPreview) onCancelPreview();
      return;
    }

    try {
      const result = await quizService.submitQuizAttempt(user, quiz.id, answers);
      if (onSubmitted) onSubmitted(result);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-interface-loading">
        <div className="spinner"></div>
        <p>Loading Quiz & Options...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-interface-empty">
        <h3>No Questions Available</h3>
        <p>This quiz does not have any questions added yet.</p>
        <button className="btn-secondary" onClick={onCancelPreview || (() => window.location.reload())}>
          Back
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isLowTime = remainingSeconds <= 120 && quiz.timerEnabled !== false;

  return (
    <div className="quiz-interface-container">
      {/* Admin Preview Banner */}
      {isPreview && (
        <div className="admin-preview-banner">
          <span>ADMIN PREVIEW MODE — Student Attempts Will Not Be Created</span>
          <button onClick={onCancelPreview} className="exit-preview-btn">Exit Preview</button>
        </div>
      )}

      {/* Sticky Header */}
      <div className={`quiz-sticky-header ${isLowTime ? 'timer-low-warning' : ''}`}>
        <div className="quiz-header-info">
          <span className="quiz-title-badge">{quiz.title}</span>
          <span className="question-counter-badge">
            Question <strong>{currentIndex + 1}</strong> / {questions.length}
          </span>
        </div>

        {quiz.timerEnabled !== false && !isPreview && (
          <div className={`quiz-timer-pill ${isLowTime ? 'pulsing-warning' : ''}`}>
            <Clock size={18} />
            <span className="timer-display">{formatTimer(remainingSeconds)}</span>
          </div>
        )}
      </div>

      {/* Main Question Display */}
      <div className="question-card">
        <div className="question-header">
          <span className="question-number-tag">Q{currentIndex + 1}.</span>
          <h2 className="question-text">{currentQ.question}</h2>
        </div>

        {currentQ.imageUrl && (
          <div className="question-image-wrap">
            <img src={currentQ.imageUrl} alt="Question Diagram" className="question-img" />
          </div>
        )}

        {/* Options */}
        <div className="options-container">
          {currentQ.options.map((opt, idx) => {
            const isMulti = currentQ.type === 'multiple';
            const userAns = answers[currentQ.id];
            const isSelected = isMulti 
              ? Array.isArray(userAns) && userAns.includes(opt)
              : userAns === opt;

            return (
              <div 
                key={idx}
                className={`option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(currentQ.id, opt, isMulti)}
              >
                <div className="option-indicator">
                  {isMulti ? (
                    <div className={`checkbox-box ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <CheckCircle2 size={16} />}
                    </div>
                  ) : (
                    <div className={`radio-circle ${isSelected ? 'checked' : ''}`} />
                  )}
                </div>
                <span className="option-text">{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Question Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-label">Question Quick Navigation:</div>
        <div className="question-pills-row">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true);

            return (
              <button
                key={q.id}
                className={`q-pill ${isCurrent ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
                onClick={() => {
                  if (quiz.canGoBack !== false || idx > currentIndex) {
                    setCurrentIndex(idx);
                  }
                }}
                disabled={quiz.canGoBack === false && idx < currentIndex}
                title={`Go to Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thumb Navigation Sticky Bar */}
      <div className="navigation-footer">
        <button
          className="btn-secondary nav-btn"
          disabled={currentIndex === 0 || quiz.canGoBack === false}
          onClick={() => setCurrentIndex(prev => prev - 1)}
        >
          <ChevronLeft size={20} />
          <span>Previous</span>
        </button>

        {isLastQuestion ? (
          <button 
            className="btn-accent submit-btn"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
          >
            <Send size={18} />
            <span>Submit Quiz</span>
          </button>
        ) : (
          <button 
            className="btn-primary nav-btn"
            onClick={() => setCurrentIndex(prev => prev + 1)}
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal-card confirm-modal">
            <AlertTriangle size={36} className="modal-alert-icon" />
            <h3>Confirm Quiz Submission</h3>
            <p>
              You have answered <strong>{Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length}</strong> of <strong>{questions.length}</strong> questions.
            </p>
            <p className="subtext">
              Once submitted, you cannot change your answers or re-attempt this quiz.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSubmitConfirm(false)}>
                Review Answers
              </button>
              <button className="btn-accent" onClick={handleManualSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
