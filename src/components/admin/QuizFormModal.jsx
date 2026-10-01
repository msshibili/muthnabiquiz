import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Trophy, Eye } from 'lucide-react';

export default function QuizFormModal({ isOpen, quiz, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'General Knowledge',
    description: '',
    duration: 10,
    status: 'active',
    negativeMarking: 0,
    canGoBack: true,
    timerEnabled: true,
    leaderboardEnabled: true,
    showScore: true,
    showPercentage: true,
    showRank: true,
    showTimeTaken: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        category: quiz.category || 'General Knowledge',
        description: quiz.description || '',
        duration: quiz.duration || 10,
        status: quiz.status || 'active',
        negativeMarking: quiz.negativeMarking || 0,
        canGoBack: quiz.canGoBack !== false,
        timerEnabled: quiz.timerEnabled !== false,
        leaderboardEnabled: quiz.leaderboardEnabled !== false,
        showScore: quiz.showScore !== false,
        showPercentage: quiz.showPercentage !== false,
        showRank: quiz.showRank !== false,
        showTimeTaken: quiz.showTimeTaken !== false,
        startDate: quiz.startDate || '',
        endDate: quiz.endDate || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'General Knowledge',
        description: '',
        duration: 10,
        status: 'active',
        negativeMarking: 0,
        canGoBack: true,
        timerEnabled: true,
        leaderboardEnabled: true,
        showScore: true,
        showPercentage: true,
        showRank: true,
        showTimeTaken: true,
        startDate: '',
        endDate: ''
      });
    }
  }, [quiz, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...quiz,
      ...formData,
      duration: Number(formData.duration),
      negativeMarking: Number(formData.negativeMarking)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card quiz-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">{quiz ? 'Edit Quiz Settings' : 'Create New Competition Quiz'}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid-2">
            <div className="input-field-group">
              <label>Quiz Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Inter-College Tech Olympiad 2026" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required 
              />
            </div>

            <div className="input-field-group">
              <label>Category *</label>
              <input 
                type="text" 
                placeholder="e.g. Computer Science, General Knowledge" 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="input-field-group">
            <label>Description</label>
            <textarea 
              rows={3} 
              placeholder="Brief description of quiz content and instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-grid-3">
            <div className="input-field-group">
              <label>Duration (Minutes) *</label>
              <input 
                type="number" 
                min={1} 
                max={180}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required 
              />
            </div>

            <div className="input-field-group">
              <label>Status *</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active (Available)</option>
                <option value="upcoming">Upcoming (Coming Soon)</option>
                <option value="closed">Closed (Ended)</option>
              </select>
            </div>

            <div className="input-field-group">
              <label>Negative Marking (Deduction)</label>
              <input 
                type="number" 
                step="0.25"
                min={0}
                placeholder="0 (No negative mark)" 
                value={formData.negativeMarking}
                onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.value })}
              />
            </div>
          </div>

          {/* Feature Flags Section */}
          <div className="form-section-title">Rules & Controls</div>
          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.timerEnabled}
                onChange={(e) => setFormData({ ...formData, timerEnabled: e.target.checked })}
              />
              <span>Enable Countdown Timer</span>
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.canGoBack}
                onChange={(e) => setFormData({ ...formData, canGoBack: e.target.checked })}
              />
              <span>Allow Back Navigation to Previous Questions</span>
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.leaderboardEnabled}
                onChange={(e) => setFormData({ ...formData, leaderboardEnabled: e.target.checked })}
              />
              <span>Enable Public Leaderboard</span>
            </label>
          </div>

          {/* Result Visibility Configuration */}
          <div className="form-section-title">Result Visibility Configuration</div>
          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.showScore}
                onChange={(e) => setFormData({ ...formData, showScore: e.target.checked })}
              />
              <span>Show Final Score</span>
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.showPercentage}
                onChange={(e) => setFormData({ ...formData, showPercentage: e.target.checked })}
              />
              <span>Show Percentage (%)</span>
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.showRank}
                onChange={(e) => setFormData({ ...formData, showRank: e.target.checked })}
              />
              <span>Show Rank</span>
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.showTimeTaken}
                onChange={(e) => setFormData({ ...formData, showTimeTaken: e.target.checked })}
              />
              <span>Show Time Taken</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              <span>Save Quiz</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
