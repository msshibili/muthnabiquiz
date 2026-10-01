import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Image } from 'lucide-react';

export default function QuestionFormModal({ isOpen, question, onClose, onSave }) {
  const [formData, setFormData] = useState({
    question: '',
    type: 'single', // 'single', 'multiple', 'boolean'
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    negativeMarks: 0,
    imageUrl: ''
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        type: question.type || 'single',
        options: Array.isArray(question.options) ? [...question.options] : ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        marks: question.marks || 1,
        negativeMarks: question.negativeMarks || 0,
        imageUrl: question.imageUrl || ''
      });
    } else {
      setFormData({
        question: '',
        type: 'single',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        marks: 1,
        negativeMarks: 0,
        imageUrl: ''
      });
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    let newOpts = [...formData.options];
    let newAns = formData.correctAnswer;

    if (newType === 'boolean') {
      newOpts = ['True', 'False'];
      newAns = 'True';
    } else if (newType === 'multiple') {
      newAns = Array.isArray(formData.correctAnswer) ? formData.correctAnswer : [formData.options[0] || 'Option A'];
    } else {
      newAns = Array.isArray(formData.correctAnswer) ? formData.correctAnswer[0] || formData.options[0] : formData.correctAnswer;
    }

    setFormData({
      ...formData,
      type: newType,
      options: newOpts,
      correctAnswer: newAns
    });
  };

  const handleOptionChange = (idx, value) => {
    const updatedOpts = [...formData.options];
    const oldVal = updatedOpts[idx];
    updatedOpts[idx] = value;

    let updatedAns = formData.correctAnswer;
    if (formData.type === 'single' && oldVal === updatedAns) {
      updatedAns = value;
    } else if (formData.type === 'multiple' && Array.isArray(updatedAns)) {
      updatedAns = updatedAns.map(a => a === oldVal ? value : a);
    }

    setFormData({
      ...formData,
      options: updatedOpts,
      correctAnswer: updatedAns
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return;

    onSave({
      ...question,
      ...formData,
      marks: Number(formData.marks),
      negativeMarks: Number(formData.negativeMarks)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card question-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">{question ? 'Edit Question' : 'Add New Question'}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid-2">
            <div className="input-field-group">
              <label>Question Type *</label>
              <select 
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="single">Single Choice (Radio)</option>
                <option value="multiple">Multiple Choice (Checkboxes)</option>
                <option value="boolean">True / False</option>
              </select>
            </div>

            <div className="input-field-group">
              <label>Marks *</label>
              <input 
                type="number" 
                min={1} 
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="input-field-group">
            <label>Question Text *</label>
            <textarea 
              rows={3} 
              placeholder="e.g. Which planet is known as the Red Planet?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required 
            />
          </div>

          <div className="input-field-group">
            <label>Image URL (Optional)</label>
            <div className="input-with-icon">
              <Image size={18} className="input-icon" />
              <input 
                type="url" 
                placeholder="https://example.com/diagram.png"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="options-admin-section">
            <label className="section-label">Answer Options & Correct Answer Selection *</label>

            {formData.options.map((opt, idx) => {
              const isMulti = formData.type === 'multiple';
              const isCorrect = isMulti
                ? Array.isArray(formData.correctAnswer) && formData.correctAnswer.includes(opt)
                : formData.correctAnswer === opt;

              return (
                <div key={idx} className={`option-admin-row ${isCorrect ? 'is-correct' : ''}`}>
                  <button
                    type="button"
                    className={`mark-correct-btn ${isCorrect ? 'active' : ''}`}
                    onClick={() => {
                      if (isMulti) {
                        const cur = Array.isArray(formData.correctAnswer) ? formData.correctAnswer : [];
                        const next = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt];
                        setFormData({ ...formData, correctAnswer: next });
                      } else {
                        setFormData({ ...formData, correctAnswer: opt });
                      }
                    }}
                    title={isCorrect ? 'Correct Answer' : 'Set as Correct Answer'}
                  >
                    {isCorrect ? '✓ Correct' : 'Set Correct'}
                  </button>

                  <input 
                    type="text" 
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                  />
                </div>
              );
            })}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              <span>Save Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
