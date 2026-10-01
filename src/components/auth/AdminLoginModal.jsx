import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const { loginAdmin } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passcode) return;

    const ok = loginAdmin(passcode);
    if (ok) {
      setPasscode('');
      setError('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError('Invalid admin passcode.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card admin-auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge admin-badge">
            <ShieldAlert size={30} />
          </div>
          <h2>Admin Portal Access</h2>
          <p>Authorized Quiz Conductors & Administrators Only</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-field-group">
            <label>Admin Passcode / Key *</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Enter passcode" 
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                autoFocus
                required 
              />
            </div>
            {error && <span className="field-error">{error}</span>}
          </div>

          <button type="submit" className="btn-accent full-width">
            <span>Unlock Admin Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
