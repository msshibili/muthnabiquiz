import { db, isRealFirebaseConfigured } from '../config/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { INITIAL_QUIZZES, INITIAL_QUESTIONS, INITIAL_SAMPLE_ATTEMPTS } from '../utils/initialData';

const QUIZZES_STORAGE_KEY = 'muthnabi_quizzes_data';
const QUESTIONS_STORAGE_KEY = 'muthnabi_questions_data';
const ATTEMPTS_STORAGE_KEY = 'muthnabi_attempts_data';
const ACTIVE_TIMERS_KEY = 'muthnabi_active_timers';

// Storage Helper Functions
function getStoredData(key, fallback) {
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const quizService = {
  // ==========================================
  // 1. QUIZZES MANAGEMENT
  // ==========================================
  
  async getQuizzes() {
    if (isRealFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const list = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (list.length > 0) return list;

        // Auto-seed initial quizzes to Firestore on first load
        for (const q of INITIAL_QUIZZES) {
          await setDoc(doc(db, 'quizzes', q.id), q);
        }
        return INITIAL_QUIZZES;
      } catch (e) {
        console.warn('Firestore getQuizzes error:', e);
      }
    }
    return getStoredData(QUIZZES_STORAGE_KEY, INITIAL_QUIZZES);
  },

  async getQuizById(quizId) {
    const quizzes = await this.getQuizzes();
    return quizzes.find(q => q.id === quizId) || null;
  },

  async saveQuiz(quizData) {
    const quizzes = await this.getQuizzes();
    const existingIndex = quizzes.findIndex(q => q.id === quizData.id);
    const updatedQuiz = {
      ...quizData,
      id: quizData.id || `quiz-${Date.now()}`,
      createdAt: quizData.createdAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      quizzes[existingIndex] = updatedQuiz;
    } else {
      quizzes.push(updatedQuiz);
    }

    if (isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'quizzes', updatedQuiz.id), updatedQuiz);
      } catch (e) {
        console.warn('Firestore saveQuiz error:', e);
      }
    }

    saveStoredData(QUIZZES_STORAGE_KEY, quizzes);
    return updatedQuiz;
  },

  async deleteQuiz(quizId) {
    let quizzes = await this.getQuizzes();
    quizzes = quizzes.filter(q => q.id !== quizId);

    if (isRealFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
      } catch (e) {}
    }

    saveStoredData(QUIZZES_STORAGE_KEY, quizzes);
  },

  async duplicateQuiz(quizId) {
    const original = await this.getQuizById(quizId);
    if (!original) return null;

    const newQuizId = `quiz-${Date.now()}`;
    const duplicatedQuiz = {
      ...original,
      id: newQuizId,
      title: `${original.title} (Copy)`,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };

    await this.saveQuiz(duplicatedQuiz);

    // Also copy questions for this quiz
    const questions = await this.getQuestions(quizId, true);
    if (questions && questions.length > 0) {
      const duplicatedQuestions = questions.map((q, idx) => ({
        ...q,
        id: `q-${Date.now()}-${idx}`
      }));
      await this.saveAllQuestionsForQuiz(newQuizId, duplicatedQuestions);
    }

    return duplicatedQuiz;
  },

  // ==========================================
  // 2. QUESTION MANAGEMENT & SECURITY
  // ==========================================

  async getQuestions(quizId, isAdmin = false) {
    let allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, INITIAL_QUESTIONS);
    
    if (isRealFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, `quizzes/${quizId}/questions`));
        const list = [];
        querySnapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (list.length > 0) {
          allQuestionsMap[quizId] = list;
        } else if (INITIAL_QUESTIONS[quizId]) {
          // Auto-seed questions for this quiz to Firestore
          const seedList = INITIAL_QUESTIONS[quizId];
          for (const q of seedList) {
            await setDoc(doc(db, `quizzes/${quizId}/questions`, q.id), q);
          }
          allQuestionsMap[quizId] = seedList;
        }
      } catch (e) {
        console.warn('Firestore getQuestions error:', e);
      }
    }

    const rawQuestions = allQuestionsMap[quizId] || [];

    // STRICT SECURITY FILTERING:
    // Non-admin participant queries MUST NOT include the correctAnswer!
    if (!isAdmin) {
      return rawQuestions.map(q => {
        const { correctAnswer, ...sanitized } = q;
        return sanitized;
      });
    }

    return rawQuestions;
  },

  async saveQuestion(quizId, questionData) {
    const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, INITIAL_QUESTIONS);
    const quizQuestions = allQuestionsMap[quizId] || [];
    
    const questionId = questionData.id || `q-${Date.now()}`;
    const updatedQuestion = { ...questionData, id: questionId };

    const idx = quizQuestions.findIndex(q => q.id === questionId);
    if (idx >= 0) {
      quizQuestions[idx] = updatedQuestion;
    } else {
      quizQuestions.push(updatedQuestion);
    }

    allQuestionsMap[quizId] = quizQuestions;

    if (isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, `quizzes/${quizId}/questions`, questionId), updatedQuestion);
      } catch (e) {}
    }

    saveStoredData(QUESTIONS_STORAGE_KEY, allQuestionsMap);

    // Update total questions count on quiz
    const quiz = await this.getQuizById(quizId);
    if (quiz) {
      quiz.totalQuestions = quizQuestions.length;
      await this.saveQuiz(quiz);
    }

    return updatedQuestion;
  },

  async deleteQuestion(quizId, questionId) {
    const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, INITIAL_QUESTIONS);
    if (allQuestionsMap[quizId]) {
      allQuestionsMap[quizId] = allQuestionsMap[quizId].filter(q => q.id !== questionId);
      saveStoredData(QUESTIONS_STORAGE_KEY, allQuestionsMap);
    }

    if (isRealFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, `quizzes/${quizId}/questions`, questionId));
      } catch (e) {}
    }

    // Update quiz total questions count
    const quiz = await this.getQuizById(quizId);
    if (quiz) {
      quiz.totalQuestions = (allQuestionsMap[quizId] || []).length;
      await this.saveQuiz(quiz);
    }
  },

  async saveAllQuestionsForQuiz(quizId, questionsList) {
    const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, INITIAL_QUESTIONS);
    allQuestionsMap[quizId] = questionsList;
    saveStoredData(QUESTIONS_STORAGE_KEY, allQuestionsMap);

    if (isRealFirebaseConfigured) {
      try {
        for (const q of questionsList) {
          await setDoc(doc(db, `quizzes/${quizId}/questions`, q.id), q);
        }
      } catch (e) {}
    }

    const quiz = await this.getQuizById(quizId);
    if (quiz) {
      quiz.totalQuestions = questionsList.length;
      await this.saveQuiz(quiz);
    }
  },

  // ==========================================
  // 3. TIMER & SESSION PERSISTENCE
  // ==========================================

  getOrStartTimer(userId, quizId, durationMinutes) {
    const timers = getStoredData(ACTIVE_TIMERS_KEY, {});
    const timerKey = `${userId}_${quizId}`;

    if (!timers[timerKey]) {
      timers[timerKey] = {
        startedAt: new Date().toISOString(),
        durationSeconds: durationMinutes * 60
      };
      saveStoredData(ACTIVE_TIMERS_KEY, timers);
    }

    const startedAt = new Date(timers[timerKey].startedAt).getTime();
    const totalDurationSeconds = timers[timerKey].durationSeconds;
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

    return {
      startedAt: timers[timerKey].startedAt,
      remainingSeconds,
      totalDurationSeconds,
      isExpired: remainingSeconds <= 0
    };
  },

  clearActiveTimer(userId, quizId) {
    const timers = getStoredData(ACTIVE_TIMERS_KEY, {});
    delete timers[`${userId}_${quizId}`];
    saveStoredData(ACTIVE_TIMERS_KEY, timers);
  },

  // ==========================================
  // 4. ATTEMPT CONTROL & SCORE CALCULATION
  // ==========================================

  async getUserAttempt(userId, quizId) {
    if (!userId || !quizId) return null;
    
    // 1. Check LocalStorage
    const attempts = getStoredData(ATTEMPTS_STORAGE_KEY, INITIAL_SAMPLE_ATTEMPTS);
    const localAttempt = attempts.find(a => a.userId === userId && a.quizId === quizId);
    if (localAttempt) return localAttempt;

    // 2. Check Firestore
    if (isRealFirebaseConfigured) {
      try {
        const attemptId = `${userId}_${quizId}`;
        const docSnap = await getDoc(doc(db, 'quizAttempts', attemptId));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
      } catch (e) {
        console.warn('Firestore getUserAttempt error:', e);
      }
    }

    return null;
  },

  async submitQuizAttempt(user, quizId, userAnswers) {
    const userId = user.uid;
    
    // Security check: One attempt only!
    const existingAttempt = await this.getUserAttempt(userId, quizId);
    if (existingAttempt) {
      return existingAttempt; // Prevent duplicate attempt calculation
    }

    const quiz = await this.getQuizById(quizId);
    const questions = await this.getQuestions(quizId, true); // Fetch master questions with answers securely

    let score = 0;
    let maxScore = 0;
    let attemptedCount = 0;

    questions.forEach(q => {
      const qMarks = Number(q.marks || 1);
      const qNeg = Number(q.negativeMarks || quiz?.negativeMarking || 0);
      maxScore += qMarks;

      const givenAnswer = userAnswers[q.id];

      if (givenAnswer !== undefined && givenAnswer !== null && givenAnswer !== '') {
        attemptedCount++;
        
        let isCorrect = false;
        if (q.type === 'multiple') {
          const userArr = Array.isArray(givenAnswer) ? [...givenAnswer].sort() : [];
          const correctArr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer].sort() : [];
          isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
        } else {
          isCorrect = String(givenAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        }

        if (isCorrect) {
          score += qMarks;
        } else if (qNeg > 0) {
          score = Math.max(0, score - qNeg);
        }
      }
    });

    // Calculate time taken
    const timerData = this.getOrStartTimer(userId, quizId, quiz?.duration || 10);
    const startedAt = timerData.startedAt;
    const submittedAt = new Date().toISOString();
    const timeTakenSeconds = Math.max(1, Math.floor((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000));

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    const attemptRecord = {
      id: `${userId}_${quizId}`,
      userId,
      userName: user.name || 'Participant',
      userMobile: user.mobile || 'Private',
      quizId,
      quizTitle: quiz?.title || 'Competition Quiz',
      score,
      maxScore,
      percentage,
      attemptedCount,
      totalQuestions: questions.length,
      timeTakenSeconds,
      startedAt,
      submittedAt
    };

    // Store attempt in LocalStorage
    const attempts = getStoredData(ATTEMPTS_STORAGE_KEY, INITIAL_SAMPLE_ATTEMPTS);
    attempts.push(attemptRecord);
    saveStoredData(ATTEMPTS_STORAGE_KEY, attempts);

    // Clear active timer session
    this.clearActiveTimer(userId, quizId);

    // Save attempt in Firestore
    if (isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'quizAttempts', attemptRecord.id), attemptRecord);
      } catch (e) {
        console.warn('Firestore attempt save error:', e);
      }
    }

    return attemptRecord;
  },

  async getAllAttempts() {
    let list = getStoredData(ATTEMPTS_STORAGE_KEY, INITIAL_SAMPLE_ATTEMPTS);
    if (isRealFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizAttempts'));
        const firestoreList = [];
        querySnapshot.forEach(docSnap => {
          firestoreList.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (firestoreList.length > 0) return firestoreList;
      } catch (e) {}
    }
    return list;
  },

  async getLeaderboard(quizId) {
    const allAttempts = await this.getAllAttempts();
    const quizAttempts = allAttempts.filter(a => a.quizId === quizId);

    // Sort by: 1. Higher Score, 2. Lower Completion Time
    quizAttempts.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });

    return quizAttempts.map((attempt, index) => ({
      rank: index + 1,
      userName: attempt.userName,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      timeTakenSeconds: attempt.timeTakenSeconds
    }));
  }
};
