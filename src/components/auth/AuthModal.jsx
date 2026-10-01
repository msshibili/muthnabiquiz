import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Smartphone, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { registerUser, loginWithMobile, showToast } = useAuth();
  const [tab, setTab] = useState('register'); // 'register' or 'login'
  
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [year, setYear] = useState('S1');
  const [branch, setBranch] = useState('CSE');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, mobile, year, branch);
      onClose();
      setName('');
      setMobile('');
      setYear('S1');
      setBranch('CSE');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      showToast('Please enter your 10-digit registered mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      await loginWithMobile(mobile);
      onClose();
      setMobile('');
    } catch (err) {
      // Prompt user to register if mobile not found
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <Smartphone size={28} />
          </div>
          <h2>College Quiz Registration</h2>
          <p>Enter your details to access live quiz competitions</p>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            New Student Registration
          </button>
          <button 
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Registered Mobile Login
          </button>
        </div>

        {tab === 'register' ? (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-field-group">
              <label>Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="e.g. Ameen Farooq" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required 
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Mobile Number *</label>
              <div className="input-with-icon">
                <span className="country-prefix">+91</span>
                <input 
                  type="tel" 
                  placeholder="9876543210" 
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-field-group">
                <label>Year / Semester *</label>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className="auth-select"
                  required
                >
                  <option value="S1">S1 (1st Year)</option>
                  <option value="S3">S3 (2nd Year)</option>
                  <option value="S5">S5 (3rd Year)</option>
                  <option value="S7">S7 (4th Year)</option>
                </select>
              </div>

              <div className="input-field-group">
                <label>Engineering Branch *</label>
                <select 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)}
                  className="auth-select"
                  required
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>
            </div>

            <small className="field-hint">Your mobile number remains strictly private and hidden from public leaderboards.</small>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register & Enter Arena'}
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleQuickLogin} className="auth-form">
            <div className="input-field-group">
              <label>Registered Mobile Number *</label>
              <div className="input-with-icon">
                <span className="country-prefix">+91</span>
                <input 
                  type="tel" 
                  placeholder="Enter 10-digit number" 
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Mobile Number'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
