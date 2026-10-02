import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProfSummitBanner from './components/common/ProfSummitBanner';
import Toast from './components/common/Toast';
import AuthModal from './components/auth/AuthModal';
import AdminLoginModal from './components/auth/AdminLoginModal';
import UserDashboard from './components/user/UserDashboard';
import QuizInstructions from './components/user/QuizInstructions';
import QuizInterface from './components/user/QuizInterface';
import QuizResult from './components/user/QuizResult';
import LeaderboardModal from './components/user/LeaderboardModal';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function MainApp() {
  const { user, isAdmin, logoutAdmin } = useAuth();
  
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'instructions', 'quiz_active', 'quiz_preview', 'result', 'admin'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [leaderboardQuiz, setLeaderboardQuiz] = useState(null);

  const handleStartQuizFromDashboard = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('instructions');
  };

  const handleStartQuizConfirmed = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quiz_active');
  };

  const handleQuizSubmitted = (attemptRecord) => {
    setActiveAttempt(attemptRecord);
    setCurrentView('result');
  };

  const handleViewScore = (quiz, attempt) => {
    setSelectedQuiz(quiz);
    setActiveAttempt(attempt);
    setCurrentView('result');
  };

  const handleLaunchAdminPreview = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quiz_preview');
  };

  return (
    <div className="app-root">
      <Header 
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'admin' && !isAdmin) {
            setShowAdminModal(true);
          } else {
            setCurrentView(view);
          }
        }}
        openAuthModal={() => setShowAuthModal(true)}
        openAdminModal={() => setShowAdminModal(true)}
      />

      <main className="app-main-content">
        {currentView === 'dashboard' && (
          <UserDashboard 
            onSelectQuiz={handleStartQuizFromDashboard}
            onViewScore={handleViewScore}
            onViewLeaderboard={(quiz) => setLeaderboardQuiz(quiz)}
            openAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {currentView === 'instructions' && selectedQuiz && (
          <QuizInstructions 
            quiz={selectedQuiz}
            onStartQuiz={handleStartQuizConfirmed}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'quiz_active' && selectedQuiz && (
          <QuizInterface 
            quiz={selectedQuiz}
            user={user}
            isPreview={false}
            onSubmitted={handleQuizSubmitted}
          />
        )}

        {currentView === 'quiz_preview' && selectedQuiz && (
          <QuizInterface 
            quiz={selectedQuiz}
            user={{ uid: 'admin_preview', name: 'Admin Preview' }}
            isPreview={true}
            onCancelPreview={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'result' && activeAttempt && (
          <QuizResult 
            attempt={activeAttempt}
            quiz={selectedQuiz}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onViewLeaderboard={(q) => setLeaderboardQuiz(q || selectedQuiz)}
          />
        )}

        {currentView === 'admin' && isAdmin && (
          <AdminDashboard 
            onLaunchPreview={handleLaunchAdminPreview}
            onExitAdmin={() => {
              logoutAdmin();
              setCurrentView('dashboard');
            }}
          />
        )}
      </main>

      <ProfSummitBanner />

      <Footer />

      {/* Global Toast */}
      <Toast />

      {/* User Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Admin Passcode Modal */}
      <AdminLoginModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => setCurrentView('admin')}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal 
        quiz={leaderboardQuiz}
        isOpen={Boolean(leaderboardQuiz)}
        onClose={() => setLeaderboardQuiz(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
