import { db, isRealFirebaseConfigured } from '../config/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { INITIAL_QUIZZES, INITIAL_QUESTIONS, INITIAL_SAMPLE_ATTEMPTS } from '../utils/initialData';

const QUIZZES_STORAGE_KEY = 'muthnabi_quizzes_data';
const QUESTIONS_STORAGE_KEY = 'muthnabi_questions_data';
const ATTEMPTS_STORAGE_KEY = 'muthnabi_attempts_data';
const ACTIVE_TIMERS_KEY = 'muthnabi_active_timers';
const SEEDED_FLAG_KEY = 'muthnabi_firestore_seeded_v2';

// Helper storage functions
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

        const isSeeded = localStorage.getItem(SEEDED_FLAG_KEY);
        if (list.length > 0 || isSeeded) {
          saveStoredData(QUIZZES_STORAGE_KEY, list);
          return list;
        }

        // Initial 1-time seed to Firestore if database is completely empty
        for (const q of INITIAL_QUIZZES) {
          await setDoc(doc(db, 'quizzes', q.id), q);
        }
        localStorage.setItem(SEEDED_FLAG_KEY, 'true');
        saveStoredData(QUIZZES_STORAGE_KEY, INITIAL_QUIZZES);
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
    const quizId = quizData.id || `quiz-${Date.now()}`;
    const updatedQuiz = {
      ...quizData,
      id: quizId,
      createdAt: quizData.createdAt || new Date().toISOString()
    };

    if (isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'quizzes', quizId), updatedQuiz);
      } catch (e) {
        console.warn('Firestore saveQuiz error:', e);
      }
    }

    let quizzes = getStoredData(QUIZZES_STORAGE_KEY, []);
    const idx = quizzes.findIndex(q => q.id === quizId);
    if (idx >= 0) {
      quizzes[idx] = updatedQuiz;
    } else {
      quizzes.push(updatedQuiz);
    }
    saveStoredData(QUIZZES_STORAGE_KEY, quizzes);

    return updatedQuiz;
  },

  async deleteQuiz(quizId) {
    if (isRealFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
      } catch (e) {
        console.warn('Firestore deleteQuiz error:', e);
      }
    }

    let quizzes = getStoredData(QUIZZES_STORAGE_KEY, []);
    quizzes = quizzes.filter(q => q.id !== quizId);
    saveStoredData(QUIZZES_STORAGE_KEY, quizzes);

    let questionsMap = getStoredData(QUESTIONS_STORAGE_KEY, {});
    delete questionsMap[quizId];
    saveStoredData(QUESTIONS_STORAGE_KEY, questionsMap);
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
    let rawQuestions = [];
    
    if (isRealFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, `quizzes/${quizId}/questions`));
        const list = [];
        querySnapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });

        const isSeeded = localStorage.getItem(`${SEEDED_FLAG_KEY}_${quizId}`);
        if (list.length > 0 || isSeeded) {
          rawQuestions = list;
        } else if (INITIAL_QUESTIONS[quizId]) {
          const seedList = INITIAL_QUESTIONS[quizId];
          for (const q of seedList) {
            await setDoc(doc(db, `quizzes/${quizId}/questions`, q.id), q);
          }
          localStorage.setItem(`${SEEDED_FLAG_KEY}_${quizId}`, 'true');
          rawQuestions = seedList;
        }
      } catch (e) {
        console.warn('Firestore getQuestions error:', e);
      }
    }

    if (rawQuestions.length === 0) {
      const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, INITIAL_QUESTIONS);
      rawQuestions = allQuestionsMap[quizId] || [];
    }

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
    const questionId = questionData.id || `q-${Date.now()}`;
    const updatedQuestion = { ...questionData, id: questionId };

    if (isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, `quizzes/${quizId}/questions`, questionId), updatedQuestion);
      } catch (e) {
        console.warn('Firestore saveQuestion error:', e);
      }
    }

    const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, {});
    const quizQuestions = allQuestionsMap[quizId] || [];
    const idx = quizQuestions.findIndex(q => q.id === questionId);
    if (idx >= 0) {
      quizQuestions[idx] = updatedQuestion;
    } else {
      quizQuestions.push(updatedQuestion);
    }
    allQuestionsMap[quizId] = quizQuestions;
    saveStoredData(QUESTIONS_STORAGE_KEY, allQuestionsMap);

    // Update total questions count on quiz in Firestore
    const currentQuestions = await this.getQuestions(quizId, true);
    const quiz = await this.getQuizById(quizId);
    if (quiz) {
      quiz.totalQuestions = currentQuestions.length;
      await this.saveQuiz(quiz);
    }

    return updatedQuestion;
  },

  async deleteQuestion(quizId, questionId) {
    if (isRealFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, `quizzes/${quizId}/questions`, questionId));
      } catch (e) {
        console.warn('Firestore deleteQuestion error:', e);
      }
    }

    const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, {});
    if (allQuestionsMap[quizId]) {
      allQuestionsMap[quizId] = allQuestionsMap[quizId].filter(q => q.id !== questionId);
      saveStoredData(QUESTIONS_STORAGE_KEY, allQuestionsMap);
    }

    const remainingQuestions = await this.getQuestions(quizId, true);
    const quiz = await this.getQuizById(quizId);
    if (quiz) {
      quiz.totalQuestions = remainingQuestions.length;
      await this.saveQuiz(quiz);
    }
  },

  async saveAllQuestionsForQuiz(quizId, questionsList) {
    if (isRealFirebaseConfigured) {
      try {
        for (const q of questionsList) {
          await setDoc(doc(db, `quizzes/${quizId}/questions`, q.id), q);
        }
      } catch (e) {
        console.warn('Firestore saveAllQuestionsForQuiz error:', e);
      }
    }

    const allQuestionsMap = getStoredData(QUESTIONS_STORAGE_KEY, {});
    allQuestionsMap[quizId] = questionsList;
    saveStoredData(QUESTIONS_STORAGE_KEY, allQuestionsMap);

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

    const attempts = getStoredData(ATTEMPTS_STORAGE_KEY, []);
    return attempts.find(a => a.userId === userId && a.quizId === quizId) || null;
  },

  async submitQuizAttempt(user, quizId, userAnswers) {
    const userId = user.uid;
    
    const existingAttempt = await this.getUserAttempt(userId, quizId);
    if (existingAttempt) {
      return existingAttempt;
    }

    const quiz = await this.getQuizById(quizId);
    const questions = await this.getQuestions(quizId, true);

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
      userYear: user.year || 'S1',
      userBranch: user.branch || 'CSE',
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

    if (isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'quizAttempts', attemptRecord.id), attemptRecord);
      } catch (e) {
        console.warn('Firestore attempt save error:', e);
      }
    }

    const attempts = getStoredData(ATTEMPTS_STORAGE_KEY, []);
    attempts.push(attemptRecord);
    saveStoredData(ATTEMPTS_STORAGE_KEY, attempts);

    this.clearActiveTimer(userId, quizId);
    return attemptRecord;
  },

  async getAllAttempts() {
    if (isRealFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizAttempts'));
        const firestoreList = [];
        querySnapshot.forEach(docSnap => {
          firestoreList.push({ id: docSnap.id, ...docSnap.data() });
        });
        saveStoredData(ATTEMPTS_STORAGE_KEY, firestoreList);
        return firestoreList;
      } catch (e) {
        console.warn('Firestore getAllAttempts error:', e);
      }
    }
    return getStoredData(ATTEMPTS_STORAGE_KEY, []);
  },

  async getLeaderboard(quizId) {
    const allAttempts = await this.getAllAttempts();
    const quizAttempts = allAttempts.filter(a => a.quizId === quizId);

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
