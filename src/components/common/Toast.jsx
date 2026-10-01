import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useAuth();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} className="toast-icon success" />,
    error: <AlertCircle size={20} className="toast-icon error" />,
    info: <Info size={20} className="toast-icon info" />
  };

  return (
    <div className={`toast-banner toast-${toast.type}`}>
      {icons[toast.type] || icons.info}
      <span className="toast-text">{toast.message}</span>
    </div>
  );
}
