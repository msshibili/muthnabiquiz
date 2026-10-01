import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Load initial user state & admin state
    const currentUser = authService.getCurrentUser();
    const adminState = authService.isAdminLoggedIn();
    if (currentUser) setUser(currentUser);
    setIsAdmin(adminState);
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const registerUser = async (name, phone) => {
    try {
      const userProfile = await authService.registerUser(name, phone);
      setUser(userProfile);
      showToast(`Welcome, ${userProfile.name}! Registration successful.`, 'success');
      return userProfile;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const loginWithMobile = async (phone) => {
    try {
      const userProfile = await authService.loginWithMobile(phone);
      setUser(userProfile);
      showToast(`Welcome back, ${userProfile.name}!`, 'success');
      return userProfile;
    } catch (err) {
      showToast(err.message || 'Mobile number not found. Please register.', 'error');
      throw err;
    }
  };

  const logout = () => {
    authService.logoutUser();
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const loginAdmin = (passcode) => {
    const success = authService.loginAdmin(passcode);
    if (success) {
      setIsAdmin(true);
      showToast('Admin Dashboard unlocked!', 'success');
      return true;
    } else {
      showToast('Invalid Admin Security Code / PIN', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    authService.logoutAdmin();
    setIsAdmin(false);
    showToast('Exited Admin Mode', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        toast,
        showToast,
        registerUser,
        loginWithMobile,
        logout,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
