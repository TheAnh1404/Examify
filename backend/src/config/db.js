import bcrypt from 'bcryptjs';

// Sync hash function for seeding
const hashPassword = (password) => bcrypt.hashSync(password, 10);

export const db = {
  users: [
    {
      id: "usr-student-809772",
      name: "Tuan Nguyen",
      email: "tuan@examify.com",
      password: hashPassword("tuan123"),
      role: "student",
      createdAt: new Date("2026-06-07T11:13:29.772Z")
    },
    {
      id: "usr-admin-1",
      name: "System Administrator",
      email: "admin@examify.com",
      password: hashPassword("admin123"),
      role: "admin",
      createdAt: new Date("2026-01-01T00:00:00.000Z")
    },
    {
      id: "usr-teacher-1",
      name: "Dr. Sarah Jenkins",
      email: "teacher@examify.com",
      password: hashPassword("teacher123"),
      role: "teacher",
      createdAt: new Date("2026-01-05T00:00:00.000Z")
    },
    {
      id: "usr-student-1",
      name: "Alex Rivera",
      email: "student@examify.com",
      password: hashPassword("student123"),
      role: "student",
      createdAt: new Date("2026-02-10T00:00:00.000Z")
    }
  ],
  
  exams: [
    {
      id: "ex-1",
      title: "Introduction to Computer Science",
      description: "Test your knowledge on basic programming concepts, binary calculations, and computer hardware.",
      duration: 15, // minutes
      totalMarks: 30,
      passPercentage: 50,
      teacherId: "usr-teacher-1",
      questions: [
        {
          id: "q-1-1",
          text: "What does CPU stand for?",
          options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Processor Unifier",
            "Control Processing Unit"
          ],
          correctOption: 0,
          marks: 10
        },
        {
          id: "q-1-2",
          text: "Which of the following is NOT a programming language?",
          options: [
            "Python",
            "HTML",
            "C++",
            "Java"
          ],
          correctOption: 1,
          marks: 10
        },
        {
          id: "q-1-3",
          text: "What is the binary representation of decimal number 5?",
          options: [
            "100",
            "101",
            "110",
            "111"
          ],
          correctOption: 1,
          marks: 10
        }
      ],
      createdAt: new Date("2026-05-15T09:00:00.000Z")
    },
    {
      id: "ex-2",
      title: "Advanced React & State Management",
      description: "Assesses hooks, performance optimization, context, and state management strategies in React.",
      duration: 20,
      totalMarks: 40,
      passPercentage: 60,
      teacherId: "usr-teacher-1",
      questions: [
        {
          id: "q-2-1",
          text: "Which hook is used to cache the result of a calculation between re-renders?",
          options: [
            "useEffect",
            "useCallback",
            "useMemo",
            "useRef"
          ],
          correctOption: 2,
          marks: 20
        },
        {
          id: "q-2-2",
          text: "What is the primary purpose of React.memo?",
          options: [
            "To store state",
            "To prevent a component from re-rendering unless its props change",
            "To handle asynchronous side effects",
            "To update the DOM directly"
          ],
          correctOption: 1,
          marks: 20
        }
      ],
      createdAt: new Date("2026-06-01T14:30:00.000Z")
    }
  ],

  submissions: [
    {
      id: "sub-1",
      examId: "ex-1",
      studentId: "usr-student-1",
      answers: [
        { questionId: "q-1-1", selectedOption: 0 }, // correct, 10
        { questionId: "q-1-2", selectedOption: 1 }, // correct, 10
        { questionId: "q-1-3", selectedOption: 0 }  // incorrect, 0
      ],
      score: 20,
      totalCorrect: 2,
      status: "pass", // 20/30 = 66.6% (passing score >= 50%)
      tabFocusLosses: 0,
      startedAt: new Date("2026-06-05T10:00:00.000Z"),
      submittedAt: new Date("2026-06-05T10:08:32.000Z")
    }
  ]
};
