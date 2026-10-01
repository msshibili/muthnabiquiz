import React, { useState } from 'react';
import { csvService } from '../../services/csvService';
import { X, UploadCloud, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkImportModal({ isOpen, quizTitle, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setError('');

    try {
      const questions = await csvService.parseQuestionsCsv(selectedFile);
      setParsedQuestions(questions);
    } catch (err) {
      setError(err.message || 'Failed to parse CSV file.');
      setParsedQuestions([]);
    } finally {
      setParsing(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleContent = 
      "Question,Option A,Option B,Option C,Option D,Correct Answer,Marks\n" +
      "Which planet is known as the Red Planet?,Earth,Mars,Jupiter,Venus,B,2\n" +
      "What is the chemical symbol for Gold?,Ag,Au,Fe,Cu,B,2\n" +
      "Light travels faster than sound in a vacuum.,True,False,,,A,1";

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_questions_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) return;
    onImportSuccess(parsedQuestions);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bulk-import-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">Bulk Import Questions via CSV</h2>
        <p className="modal-subtitle">Import questions directly to "{quizTitle}"</p>

        <div className="import-box">
          <UploadCloud size={40} className="upload-icon" />
          <p>Select a formatted CSV file from your computer</p>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="file-input-hidden"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="btn-secondary">
            {file ? file.name : 'Choose CSV File'}
          </label>

          <button type="button" className="btn-link sample-download-btn" onClick={downloadSampleCsv}>
            <Download size={16} />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {error && (
          <div className="import-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {parsing && <div className="parsing-indicator">Parsing CSV rows...</div>}

        {parsedQuestions.length > 0 && (
          <div className="parsed-preview-section">
            <div className="preview-header">
              <CheckCircle size={18} className="success-icon" />
              <span>Parsed <strong>{parsedQuestions.length}</strong> Questions Ready to Import</span>
            </div>

            <div className="preview-list">
              {parsedQuestions.map((q, idx) => (
                <div key={idx} className="preview-q-item">
                  <strong>{idx + 1}. {q.question}</strong>
                  <div className="preview-meta">
                    <span>Options: {q.options.join(' | ')}</span>
                    <span className="ans-tag">Ans: {String(q.correctAnswer)} ({q.marks} Marks)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            disabled={parsedQuestions.length === 0}
            onClick={handleConfirmImport}
          >
            Import {parsedQuestions.length} Questions
          </button>
        </div>
      </div>
    </div>
  );
}
