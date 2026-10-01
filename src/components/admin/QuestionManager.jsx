import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import QuestionFormModal from './QuestionFormModal';
import BulkImportModal from './BulkImportModal';
import { Plus, Upload, Eye, Trash2, Edit2, ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react';

export default function QuestionManager({ quiz, onBack, onLaunchPreview }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [quiz.id]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const list = await quizService.getQuestions(quiz.id, true); // true = admin mode with answers
      setQuestions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (qData) => {
    try {
      await quizService.saveQuestion(quiz.id, qData);
      setShowQuestionModal(false);
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await quizService.deleteQuestion(quiz.id, qId);
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkImportSuccess = async (importedList) => {
    try {
      const combined = [...questions, ...importedList];
      await quizService.saveAllQuestionsForQuiz(quiz.id, combined);
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="question-manager-container">
      {/* Top Header */}
      <div className="manager-top-bar">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to Quizzes</span>
        </button>

        <div className="manager-title-wrap">
          <h2>Manage Questions — {quiz.title}</h2>
          <span className="q-count-chip">{questions.length} Questions Total</span>
        </div>

        <div className="manager-actions">
          <button className="btn-secondary" onClick={() => onLaunchPreview(quiz)}>
            <Eye size={18} />
            <span>Live Student Preview</span>
          </button>

          <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>
            <Upload size={18} />
            <span>Bulk CSV Import</span>
          </button>

          <button 
            className="btn-primary" 
            onClick={() => {
              setEditingQuestion(null);
              setShowQuestionModal(true);
            }}
          >
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading Questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-dashboard-state">
          <HelpCircle size={48} className="empty-icon" />
          <h3>No Questions Added Yet</h3>
          <p>Click "Add Question" or "Bulk CSV Import" to add questions to this quiz.</p>
        </div>
      ) : (
        <div className="admin-questions-list">
          {questions.map((q, idx) => (
            <div key={q.id} className="admin-question-card">
              <div className="q-card-header">
                <span className="q-number">Q{idx + 1}.</span>
                <span className="q-type-badge">{q.type.toUpperCase()} ({q.marks} Marks)</span>
                
                <div className="q-card-actions">
                  <button 
                    className="icon-btn" 
                    onClick={() => {
                      setEditingQuestion(q);
                      setShowQuestionModal(true);
                    }}
                    title="Edit Question"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => handleDeleteQuestion(q.id)}
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h4 className="admin-q-text">{q.question}</h4>

              {q.imageUrl && (
                <div className="admin-q-img">
                  <img src={q.imageUrl} alt="Diagram" width="200" />
                </div>
              )}

              <div className="admin-options-grid">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = Array.isArray(q.correctAnswer) 
                    ? q.correctAnswer.includes(opt)
                    : q.correctAnswer === opt;

                  return (
                    <div key={oIdx} className={`admin-option-chip ${isCorrect ? 'correct' : ''}`}>
                      {isCorrect && <CheckCircle size={14} className="check-icon" />}
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Form Modal */}
      <QuestionFormModal 
        isOpen={showQuestionModal}
        question={editingQuestion}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />

      {/* Bulk CSV Import Modal */}
      <BulkImportModal 
        isOpen={showBulkModal}
        quizTitle={quiz.title}
        onClose={() => setShowBulkModal(false)}
        onImportSuccess={handleBulkImportSuccess}
      />
    </div>
  );
}
