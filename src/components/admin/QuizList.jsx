import React from 'react';
import { Plus, Edit2, HelpCircle, Eye, Copy, Trash2, CheckCircle2, Lock } from 'lucide-react';

export default function QuizList({ quizzes, onCreateQuiz, onEditQuiz, onManageQuestions, onDuplicateQuiz, onDeleteQuiz, onTogglePublish, onLaunchPreview }) {
  return (
    <div className="quiz-list-container">
      <div className="manager-header">
        <div>
          <h2>Quiz Competitions Management</h2>
          <p>Create, edit, duplicate, and publish online competition quizzes</p>
        </div>

        <button className="btn-primary" onClick={onCreateQuiz}>
          <Plus size={18} />
          <span>Create New Quiz</span>
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-dashboard-state">
          <HelpCircle size={48} className="empty-icon" />
          <h3>No Quizzes Created Yet</h3>
          <p>Click "Create New Quiz" to publish your first college competition.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Category</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <strong>{quiz.title}</strong>
                    {quiz.negativeMarking > 0 && (
                      <div className="sub-tag">Neg. Mark: -{quiz.negativeMarking}</div>
                    )}
                  </td>
                  <td><span className="quiz-category-badge">{quiz.category}</span></td>
                  <td>{quiz.totalQuestions || 0} Questions</td>
                  <td>{quiz.duration} Mins</td>
                  <td>
                    <span className={`quiz-status-pill status-${quiz.status}`}>
                      {quiz.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button 
                        className="btn-sm btn-secondary"
                        onClick={() => onManageQuestions(quiz)}
                        title="Manage Questions"
                      >
                        <HelpCircle size={14} />
                        <span>Questions</span>
                      </button>

                      <button 
                        className="btn-sm btn-secondary"
                        onClick={() => onLaunchPreview(quiz)}
                        title="Preview Student Quiz UI"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>

                      <button 
                        className="icon-btn"
                        onClick={() => onEditQuiz(quiz)}
                        title="Edit Quiz Settings"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button 
                        className="icon-btn"
                        onClick={() => onDuplicateQuiz(quiz.id)}
                        title="Duplicate Quiz"
                      >
                        <Copy size={16} />
                      </button>

                      <button 
                        className="icon-btn delete-btn"
                        onClick={() => onDeleteQuiz(quiz.id)}
                        title="Delete Quiz"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
