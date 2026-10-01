import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { quizService } from '../../services/quizService';
import QuizCard from './QuizCard';
import { Sparkles, Trophy, Search, Award, Building2 } from 'lucide-react';

export default function UserDashboard({ onSelectQuiz, onViewScore, onViewLeaderboard, openAuthModal }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [userAttemptsMap, setUserAttemptsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'attempted'
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const quizList = await quizService.getQuizzes();
        if (!isMounted) return;
        setQuizzes(quizList);

        if (user) {
          const attemptsMap = {};
          for (const q of quizList) {
            const att = await quizService.getUserAttempt(user.uid, q.id);
            if (att) attemptsMap[q.id] = att;
          }
          if (isMounted) setUserAttemptsMap(attemptsMap);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredQuizzes = quizzes.filter(q => {
    const isAttempted = Boolean(userAttemptsMap[q.id]);
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                          (q.category && q.category.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === 'active') return q.status === 'active' && !isAttempted;
    if (filter === 'attempted') return isAttempted;
    return true;
  });

  return (
    <div className="user-dashboard-container">
      {/* Welcome Hero Card */}
      <div className="dashboard-hero">
        <div className="hero-logo-side">
          <img src="/logo.png" alt="Muthnabi Mega Quiz 2026" className="hero-main-logo" />
        </div>
        <div className="hero-content">
          <div className="welcome-tag">
            <Building2 size={15} />
            <span>SSF GOVERNMENT ENGINEERING COLLEGE CAMPUS UNIT</span>
          </div>
          <h1>{user ? `Welcome, ${user.name}` : 'Muthnabi Mega Quiz 2026'}</h1>
          <p className="hero-subtitle-text">
            <strong>10th Edition Grand Campus Contest</strong> — Test your knowledge, compete with fellow engineering & college students, and claim the championship title!
          </p>
          {!user && (
            <div className="hero-auth-cta">
              <button className="btn-primary hero-btn-lg" onClick={openAuthModal}>
                <Award size={20} />
                <span>Register & Enter Contest</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="dashboard-toolbar">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Competitions ({quizzes.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Quizzes
          </button>
          {user && (
            <button 
              className={`filter-tab ${filter === 'attempted' ? 'active' : ''}`}
              onClick={() => setFilter('attempted')}
            >
              My Attempted ({Object.keys(userAttemptsMap).length})
            </button>
          )}
        </div>

        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search quizzes by title or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Quizzes List Grid */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading Quiz Competitions...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="empty-dashboard-state">
          <Trophy size={48} className="empty-icon" />
          <h3>No Quizzes Found</h3>
          <p>There are no active quiz competitions matching your current filters.</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id}
              quiz={quiz}
              attempt={userAttemptsMap[quiz.id]}
              onStart={(q) => {
                if (!user) {
                  openAuthModal();
                } else {
                  onSelectQuiz(q);
                }
              }}
              onViewScore={(q, att) => onViewScore(q, att)}
              onViewLeaderboard={(q) => onViewLeaderboard(q)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
