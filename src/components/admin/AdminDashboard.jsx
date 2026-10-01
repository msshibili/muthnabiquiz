import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { authService } from '../../services/authService';
import AdminOverview from './AdminOverview';
import QuizList from './QuizList';
import QuizFormModal from './QuizFormModal';
import QuestionManager from './QuestionManager';
import ResultsManager from './ResultsManager';
import UserList from './UserList';
import { 
  LayoutDashboard, BookOpen, Trophy, Users, Shield, Plus, LogOut, Sparkles, ChevronRight, Award 
} from 'lucide-react';

export default function AdminDashboard({ onLaunchPreview, onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'quizzes', 'questions', 'results', 'users'
  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const quizList = await quizService.getQuizzes();
      const userList = await authService.getAllUsers();
      const attemptList = await quizService.getAllAttempts();

      setQuizzes(quizList);
      setUsers(userList);
      setAttempts(attemptList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      await quizService.saveQuiz(quizData);
      setShowQuizModal(false);
      setEditingQuiz(null);
      loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz competition?')) return;
    try {
      await quizService.deleteQuiz(quizId);
      loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateQuiz = async (quizId) => {
    try {
      await quizService.duplicateQuiz(quizId);
      loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Admin Command Center...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout">
      {/* Admin Panel Hero Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-left">
          <div className="admin-shield-badge">
            <Shield size={20} />
            <span>ADMIN COMMAND CENTER</span>
          </div>
          <h2>Competition Management & Real-Time Analytics</h2>
          <p>Organized by SSF Government Engineering College Campus Unit</p>
        </div>

        <div className="admin-hero-actions">
          <button 
            className="btn-primary admin-create-btn"
            onClick={() => {
              setEditingQuiz(null);
              setShowQuizModal(true);
            }}
          >
            <Plus size={18} />
            <span>Create New Quiz</span>
          </button>

          <button className="btn-secondary exit-admin-btn" onClick={onExitAdmin}>
            <LogOut size={16} />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs Bar */}
      <div className="admin-nav-bar">
        <div className="admin-nav-tabs">
          <button 
            className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button 
            className={`admin-nav-tab ${activeTab === 'quizzes' || activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <BookOpen size={18} />
            <span>Quizzes ({quizzes.length})</span>
          </button>

          <button 
            className={`admin-nav-tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <Trophy size={18} />
            <span>Results & CSV ({attempts.length})</span>
          </button>

          <button 
            className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Contestants ({users.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Container */}
      <div className="admin-content-body">
        {activeTab === 'overview' && (
          <AdminOverview 
            users={users}
            quizzes={quizzes}
            attempts={attempts}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onCreateQuiz={() => {
              setEditingQuiz(null);
              setShowQuizModal(true);
            }}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizList 
            quizzes={quizzes}
            onCreateQuiz={() => {
              setEditingQuiz(null);
              setShowQuizModal(true);
            }}
            onEditQuiz={(q) => {
              setEditingQuiz(q);
              setShowQuizModal(true);
            }}
            onManageQuestions={(q) => {
              setSelectedQuiz(q);
              setActiveTab('questions');
            }}
            onDuplicateQuiz={handleDuplicateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onLaunchPreview={(q) => onLaunchPreview(q)}
          />
        )}

        {activeTab === 'questions' && selectedQuiz && (
          <QuestionManager 
            quiz={selectedQuiz}
            onBack={() => setActiveTab('quizzes')}
            onLaunchPreview={(q) => onLaunchPreview(q)}
          />
        )}

        {activeTab === 'results' && (
          <ResultsManager 
            attempts={attempts}
            quizzes={quizzes}
          />
        )}

        {activeTab === 'users' && (
          <UserList 
            users={users}
            attempts={attempts}
          />
        )}
      </div>

      {/* Quiz Form Modal */}
      <QuizFormModal 
        isOpen={showQuizModal}
        quiz={editingQuiz}
        onClose={() => {
          setShowQuizModal(false);
          setEditingQuiz(null);
        }}
        onSave={handleSaveQuiz}
      />
    </div>
  );
}
