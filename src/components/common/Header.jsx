import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, LogOut, LayoutDashboard, Award } from 'lucide-react';

export default function Header({ currentView, setCurrentView, openAuthModal, openAdminModal }) {
  const { user, isAdmin, logout, logoutAdmin } = useAuth();

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <div 
          className="brand-logo"
          onClick={() => setCurrentView('dashboard')}
          role="button"
          tabIndex={0}
        >
          <img src="/logo.png" alt="Muthnabi Mega Quiz 2026 Logo" className="header-logo-img" />
          <div className="brand-text-wrap">
            <div className="header-title-row">
              <h1 className="brand-title">MUTH NABI <span className="brand-accent">MEGA QUIZ '26</span></h1>
              <span className="edition-tag">10th Edition</span>
            </div>
            <span className="brand-tagline">SSF Government Engineering College Campus Unit</span>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="header-actions">
          {isAdmin ? (
            <div className="admin-status-badge">
              <button 
                className={`header-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                <LayoutDashboard size={18} />
                <span className="hide-mobile">Admin Panel</span>
              </button>
              <button 
                className="header-btn logout-btn"
                onClick={logoutAdmin}
                title="Exit Admin Mode"
              >
                <LogOut size={16} />
                <span className="hide-mobile">Exit Admin</span>
              </button>
            </div>
          ) : (
            <button 
              className="admin-access-btn"
              onClick={openAdminModal}
              title="Admin Login"
            >
              <Shield size={16} />
              <span className="hide-mobile">Admin Portal</span>
            </button>
          )}

          {user ? (
            <div className="user-profile-menu">
              <div className="user-pill" onClick={() => setCurrentView('dashboard')}>
                <div className="avatar-chip">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-meta hide-mobile">
                  <span className="user-name">{user.name}</span>
                  <span className="user-phone">{user.mobile}</span>
                </div>
              </div>
              <button 
                className="icon-btn"
                onClick={logout}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="btn-primary auth-trigger-btn" onClick={openAuthModal}>
              <User size={18} />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
