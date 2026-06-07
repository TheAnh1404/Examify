// Seed mock data
const initialUsers = [
  { id: 'usr-admin', name: 'System Administrator', email: 'admin@examify.com', password: 'admin123', role: 'ADMIN', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'usr-teacher', name: 'Dr. Sarah Jenkins', email: 'teacher@examify.com', password: 'teacher123', role: 'TEACHER', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'usr-student', name: 'Alex Rivera', email: 'student@examify.com', password: 'student123', role: 'STUDENT', createdAt: '2026-02-15T00:00:00.000Z' }
];

const initialSubjects = [
  { id: 'sbj-cs', code: 'CS-101', name: 'Computer Science', description: 'Introduction to algorithms, binary computations, and programming languages.' },
  { id: 'sbj-math', code: 'MATH-201', name: 'Advanced Mathematics', description: 'Differential algebra, statistics, integrals, and matrices.' },
  { id: 'sbj-sci', code: 'SCI-301', name: 'General Science', description: 'Fundamental physics, general chemistry, and cell biology.' },
  { id: 'sbj-lit', code: 'LIT-401', name: 'English Literature', description: 'Classical literature analyses, global essays, and advanced writing structure.' }
];

const initialQuestions = [
  // Computer Science
  { id: 'q-cs-1', subjectId: 'sbj-cs', text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Processor Unifier', 'Control Processing Unit'], correctOption: 0, marks: 5, difficulty: 'Easy' },
  { id: 'q-cs-2', subjectId: 'sbj-cs', text: 'Which of the following is a structural/declarative styling layout rather than a scripting language?', options: ['Python', 'HTML/CSS', 'C++', 'Java'], correctOption: 1, marks: 5, difficulty: 'Easy' },
  { id: 'q-cs-3', subjectId: 'sbj-cs', text: 'Which data structure follows the Last-In-First-Out (LIFO) behavior?', options: ['Queue', 'Linked List', 'Stack', 'Binary Tree'], correctOption: 2, marks: 10, difficulty: 'Medium' },
  { id: 'q-cs-4', subjectId: 'sbj-cs', text: 'Which React Hook caches the computed value of an expensive calculation between re-renders?', options: ['useEffect', 'useCallback', 'useMemo', 'useRef'], correctOption: 2, marks: 10, difficulty: 'Medium' },
  { id: 'q-cs-5', subjectId: 'sbj-cs', text: 'In database systems, what does the A in ACID transaction properties represent?', options: ['Association', 'Atomicity', 'Algorithm', 'Availability'], correctOption: 1, marks: 10, difficulty: 'Hard' },

  // Mathematics
  { id: 'q-math-1', subjectId: 'sbj-math', text: 'What is the derivative of x^2 with respect to x?', options: ['x', '2x', 'x^3 / 3', '2'], correctOption: 1, marks: 5, difficulty: 'Easy' },
  { id: 'q-math-2', subjectId: 'sbj-math', text: 'Solve for x: log10(x) = 3.', options: ['30', '100', '300', '1000'], correctOption: 3, marks: 5, difficulty: 'Medium' },
  { id: 'q-math-3', subjectId: 'sbj-math', text: 'What is the value of the angle sum of an interior n-gon?', options: ['(n-2) * 180', 'n * 180', '(n-1) * 360', '(n+2) * 90'], correctOption: 0, marks: 10, difficulty: 'Medium' }
];

const initialExams = [
  {
    id: 'ex-cs-intro',
    title: 'CS 101 Midterm Examination',
    subjectId: 'sbj-cs',
    duration: 15, // mins
    passPercentage: 60,
    totalMarks: 30,
    description: 'Covers core computer science concepts, binary representations, React hooks, and data structures. Read questions carefully.',
    questions: ['q-cs-1', 'q-cs-2', 'q-cs-3', 'q-cs-4', 'q-cs-5'], // links to question list
    createdAt: '2026-05-10T10:00:00.000Z',
    status: 'Published'
  },
  {
    id: 'ex-math-basics',
    title: 'Algebra and Integrals Final',
    subjectId: 'sbj-math',
    duration: 20,
    passPercentage: 50,
    totalMarks: 20,
    description: 'Covers functions, derivatives, logic equations, and geometry angles. Calculators are permitted.',
    questions: ['q-math-1', 'q-math-2', 'q-math-3'],
    createdAt: '2026-06-01T14:00:00.000Z',
    status: 'Published'
  }
];

const initialAttempts = [
  {
    id: 'att-1',
    studentId: 'usr-student',
    examId: 'ex-cs-intro',
    answers: [
      { questionId: 'q-cs-1', selectedOption: 0 }, // Correct, 5pts
      { questionId: 'q-cs-2', selectedOption: 1 }, // Correct, 5pts
      { questionId: 'q-cs-3', selectedOption: 0 }, // Incorrect (selected Queue instead of Stack), 0pts
      { questionId: 'q-cs-4', selectedOption: 2 }, // Correct, 10pts
      { questionId: 'q-cs-5', selectedOption: 1 }  // Correct, 10pts
    ],
    score: 30, // calculated later
    totalCorrect: 4,
    totalIncorrect: 1,
    status: 'Pass', // 30/30 marks is 100%, passPercentage is 60%
    tabFocusLosses: 0,
    startedAt: '2026-06-05T09:00:00.000Z',
    submittedAt: '2026-06-05T09:12:30.000Z'
  }
];

// Helper to handle LocalStorage persistence
const getOrSetLocal = (key, initialValue) => {
  const stored = localStorage.getItem(`examify_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}`, e);
    }
  }
  localStorage.setItem(`examify_${key}`, JSON.stringify(initialValue));
  return initialValue;
};

// Database state Manager
class MockDB {
  constructor() {
    this.init();
  }

  init() {
    this.users = getOrSetLocal('users', initialUsers);
    this.subjects = getOrSetLocal('subjects', initialSubjects);
    this.questions = getOrSetLocal('questions', initialQuestions);
    this.exams = getOrSetLocal('exams', initialExams);
    this.attempts = getOrSetLocal('attempts', initialAttempts);
  }

  save(key) {
    localStorage.setItem(`examify_${key}`, JSON.stringify(this[key]));
  }

  reset() {
    localStorage.removeItem('examify_users');
    localStorage.removeItem('examify_subjects');
    localStorage.removeItem('examify_questions');
    localStorage.removeItem('examify_exams');
    localStorage.removeItem('examify_attempts');
    this.init();
  }

  // Analytics helper data
  getAnalytics() {
    const totalStudents = this.users.filter(u => u.role === 'STUDENT').length;
    const totalTeachers = this.users.filter(u => u.role === 'TEACHER').length;
    const totalExams = this.exams.length;
    const totalSubmissions = this.attempts.length;
    const passCount = this.attempts.filter(a => a.status === 'Pass').length;
    const passRate = totalSubmissions > 0 ? (passCount / totalSubmissions) * 100 : 0;

    // Leaderboard
    const studentPerformance = this.users
      .filter(u => u.role === 'STUDENT')
      .map(student => {
        const studentAttempts = this.attempts.filter(a => a.studentId === student.id);
        const examsTaken = studentAttempts.length;
        const avgScore = examsTaken > 0
          ? studentAttempts.reduce((sum, att) => {
              const exam = this.exams.find(e => e.id === att.examId);
              const maxMarks = exam ? exam.totalMarks : 100;
              return sum + (att.score / maxMarks) * 100;
            }, 0) / examsTaken
          : 0;

        return {
          studentName: student.name,
          studentEmail: student.email,
          examsTaken,
          averageScore: Math.round(avgScore)
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    return {
      stats: {
        totalStudents,
        totalTeachers,
        totalExams,
        totalSubmissions,
        passRate: Math.round(passRate)
      },
      leaderboard: studentPerformance,
      // Hardest questions: Questions that were answered incorrectly most often
      hardestQuestions: [
        { id: 'q-cs-3', text: 'Which data structure follows the Last-In-First-Out (LIFO) behavior?', incorrectAttempts: 1, totalAttempts: 1, percentageWrong: 100 }
      ],
      recentScoresTrend: [
        { date: '06/01', avgScore: 75 },
        { date: '06/03', avgScore: 82 },
        { date: '06/05', avgScore: 85 }
      ]
    };
  }
}

export const db = new MockDB();
