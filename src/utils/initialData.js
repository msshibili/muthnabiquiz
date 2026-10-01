export const INITIAL_QUIZZES = [
  {
    id: 'quiz-muthnabi-mega-2026',
    title: 'Muthnabi Mega Quiz 2026 (10th Edition)',
    category: 'Grand Campus Olympiad',
    description: 'Organized by SSF Government Engineering College Campus Unit. Test your knowledge in this high-stakes 10th Edition competition!',
    duration: 10, // minutes
    totalQuestions: 5,
    status: 'active', // active, upcoming, closed
    startDate: '2026-09-01T00:00',
    endDate: '2026-12-31T23:59',
    maxAttempts: 1,
    leaderboardEnabled: true,
    timerEnabled: true,
    canGoBack: true,
    showScore: true,
    showPercentage: true,
    showRank: true,
    showTimeTaken: true,
    marksPerQuestion: 4,
    negativeMarking: 1, // deducts 1 mark per wrong answer
    createdAt: new Date().toISOString()
  },
  {
    id: 'quiz-gk-2026',
    title: 'Grand Inter-College GK Olympiad',
    category: 'General Knowledge',
    description: 'The ultimate showdown of current affairs, world history, geography, and general awareness.',
    duration: 12,
    totalQuestions: 5,
    status: 'active',
    startDate: '2026-09-15T00:00',
    endDate: '2026-11-30T23:59',
    maxAttempts: 1,
    leaderboardEnabled: true,
    timerEnabled: true,
    canGoBack: true,
    showScore: true,
    showPercentage: true,
    showRank: true,
    showTimeTaken: true,
    marksPerQuestion: 2,
    negativeMarking: 0.5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'quiz-science-2026',
    title: 'Science & Future Tech Contest',
    category: 'Science & Physics',
    description: 'Quantum physics, space exploration, and futuristic biotech. Are you ready to win the title?',
    duration: 15,
    totalQuestions: 5,
    status: 'upcoming',
    startDate: '2026-11-01T00:00',
    endDate: '2026-12-15T23:59',
    maxAttempts: 1,
    leaderboardEnabled: true,
    timerEnabled: true,
    canGoBack: false,
    showScore: true,
    showPercentage: true,
    showRank: false,
    showTimeTaken: true,
    marksPerQuestion: 5,
    negativeMarking: 0,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_QUESTIONS = {
  'quiz-muthnabi-mega-2026': [
    {
      id: 'q1',
      question: 'Which planet or component is known as the core computing unit of modern Neural Networks and LLMs?',
      type: 'single', // single, multiple, boolean
      options: ['Central Processing Unit (CPU)', 'Graphics Processing Unit (GPU)', 'Hard Disk Drive (HDD)', 'Static RAM'],
      correctAnswer: 'Graphics Processing Unit (GPU)',
      marks: 4,
      negativeMarks: 1,
      imageUrl: ''
    },
    {
      id: 'q2',
      question: 'Which of the following HTTP status codes represents "200 OK"?',
      type: 'single',
      options: ['404', '500', '200', '302'],
      correctAnswer: '200',
      marks: 4,
      negativeMarks: 1,
      imageUrl: ''
    },
    {
      id: 'q3',
      question: 'True or False: JavaScript is a compiled-only language that does not run in web browsers.',
      type: 'boolean',
      options: ['True', 'False'],
      correctAnswer: 'False',
      marks: 4,
      negativeMarks: 1,
      imageUrl: ''
    },
    {
      id: 'q4',
      question: 'Select the core pillars of Object-Oriented Programming (OOP):',
      type: 'multiple', // multi select array
      options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Compilation'],
      correctAnswer: ['Encapsulation', 'Inheritance', 'Polymorphism'],
      marks: 4,
      negativeMarks: 1,
      imageUrl: ''
    },
    {
      id: 'q5',
      question: 'What does CSS stand for in web development?',
      type: 'single',
      options: ['Cascading Style Sheets', 'Computer System Style', 'Creative Style Syntax', 'Control Sheet Standard'],
      correctAnswer: 'Cascading Style Sheets',
      marks: 4,
      negativeMarks: 1,
      imageUrl: ''
    }
  ],
  'quiz-gk-2026': [
    {
      id: 'q-gk-1',
      question: 'Which planet in our solar system is known as the "Red Planet"?',
      type: 'single',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctAnswer: 'Mars',
      marks: 2,
      negativeMarks: 0.5,
      imageUrl: ''
    },
    {
      id: 'q-gk-2',
      question: 'What is the capital city of Japan?',
      type: 'single',
      options: ['Kyoto', 'Osaka', 'Tokyo', 'Hiroshima'],
      correctAnswer: 'Tokyo',
      marks: 2,
      negativeMarks: 0.5,
      imageUrl: ''
    },
    {
      id: 'q-gk-3',
      question: 'Which is the largest ocean on Earth?',
      type: 'single',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 'Pacific Ocean',
      marks: 2,
      negativeMarks: 0.5,
      imageUrl: ''
    },
    {
      id: 'q-gk-4',
      question: 'True or False: Light travels faster than sound in a vacuum.',
      type: 'boolean',
      options: ['True', 'False'],
      correctAnswer: 'True',
      marks: 2,
      negativeMarks: 0.5,
      imageUrl: ''
    },
    {
      id: 'q-gk-5',
      question: 'Who painted the Mona Lisa?',
      type: 'single',
      options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'],
      correctAnswer: 'Leonardo da Vinci',
      marks: 2,
      negativeMarks: 0.5,
      imageUrl: ''
    }
  ],
  'quiz-science-2026': [
    {
      id: 'q-sc-1',
      question: 'What is the chemical symbol for Gold?',
      type: 'single',
      options: ['Ag', 'Au', 'Fe', 'Cu'],
      correctAnswer: 'Au',
      marks: 5,
      negativeMarks: 0,
      imageUrl: ''
    },
    {
      id: 'q-sc-2',
      question: 'What particle has a positive electrical charge inside an atom?',
      type: 'single',
      options: ['Electron', 'Proton', 'Neutron', 'Photon'],
      correctAnswer: 'Proton',
      marks: 5,
      negativeMarks: 0,
      imageUrl: ''
    }
  ]
};

export const INITIAL_SAMPLE_ATTEMPTS = [
  {
    id: 'att-101',
    userId: 'user-sample-1',
    userName: 'Ameen Farooq',
    userMobile: '+91 9876543210',
    quizId: 'quiz-tech-2026',
    quizTitle: 'Muthnabi Inter-College Tech Cup 2026',
    score: 20,
    maxScore: 20,
    percentage: 100,
    attemptedCount: 5,
    totalQuestions: 5,
    timeTakenSeconds: 245, // 4m 05s
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    submittedAt: new Date(Date.now() - 3355000).toISOString(),
    userAnswers: {}
  },
  {
    id: 'att-102',
    userId: 'user-sample-2',
    userName: 'Fathima Nishath',
    userMobile: '+91 9123456789',
    quizId: 'quiz-tech-2026',
    quizTitle: 'Muthnabi Inter-College Tech Cup 2026',
    score: 15,
    maxScore: 20,
    percentage: 75,
    attemptedCount: 5,
    totalQuestions: 5,
    timeTakenSeconds: 310, // 5m 10s
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    submittedAt: new Date(Date.now() - 6890000).toISOString(),
    userAnswers: {}
  },
  {
    id: 'att-103',
    userId: 'user-sample-3',
    userName: 'Rahul Verma',
    userMobile: '+91 9988776655',
    quizId: 'quiz-gk-2026',
    quizTitle: 'Grand Inter-College GK Olympiad',
    score: 10,
    maxScore: 10,
    percentage: 100,
    attemptedCount: 5,
    totalQuestions: 5,
    timeTakenSeconds: 180,
    startedAt: new Date(Date.now() - 14400000).toISOString(),
    submittedAt: new Date(Date.now() - 14220000).toISOString(),
    userAnswers: {}
  }
];
