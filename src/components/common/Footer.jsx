import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Muthnabi Quiz Logo" className="footer-logo-img" />
            <div className="footer-logo-text">
              <span className="footer-title">Muthnabi Mega Quiz '26 (10th Edition)</span>
              <span className="footer-organizer">Organized by SSF Government Engineering College Campus Unit</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="security-badge">
            <ShieldCheck size={16} />
            <span>One Attempt Restricted & Anti-Cheat Enforced</span>
          </div>
          <div className="copyright">
            © 2026 SSF Government Engineering College Campus Unit. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
