// Dữ liệu mẫu
const initialUsers = [
  { id: 'usr-admin', name: 'Quản trị hệ thống', email: 'admin@examify.com', password: 'admin123', role: 'ADMIN', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'usr-teacher', name: 'Nguyễn Minh Anh', email: 'teacher@examify.com', password: 'teacher123', role: 'TEACHER', createdAt: '2026-01-10T00:00:00.000Z' },
  { id: 'usr-student', name: 'Trần Gia Bảo', email: 'student@examify.com', password: 'student123', role: 'STUDENT', createdAt: '2026-02-15T00:00:00.000Z' }
];

const initialSubjects = [
  { id: 'sbj-cs', code: 'CS-101', name: 'Tin học', description: 'Nhập môn thuật toán, biểu diễn nhị phân và ngôn ngữ lập trình.' },
  { id: 'sbj-math', code: 'MATH-201', name: 'Toán nâng cao', description: 'Đại số vi phân, thống kê, tích phân và ma trận.' },
  { id: 'sbj-sci', code: 'SCI-301', name: 'Khoa học tự nhiên', description: 'Vật lý cơ bản, hóa học đại cương và sinh học tế bào.' },
  { id: 'sbj-lit', code: 'LIT-401', name: 'Văn học Anh', description: 'Phân tích văn học kinh điển, bài luận quốc tế và cấu trúc viết nâng cao.' }
];

const initialQuestions = [
  // Tin học
  { id: 'q-cs-1', subjectId: 'sbj-cs', text: 'CPU là viết tắt của cụm từ nào?', options: ['Bộ xử lý trung tâm', 'Bộ máy tính cá nhân', 'Bộ hợp nhất xử lý trung tâm', 'Bộ xử lý điều khiển'], correctOption: 0, marks: 5, difficulty: 'Easy' },
  { id: 'q-cs-2', subjectId: 'sbj-cs', text: 'Công nghệ nào dưới đây dùng để mô tả cấu trúc và trình bày giao diện thay vì là ngôn ngữ kịch bản?', options: ['Python', 'HTML/CSS', 'C++', 'Java'], correctOption: 1, marks: 5, difficulty: 'Easy' },
  { id: 'q-cs-3', subjectId: 'sbj-cs', text: 'Cấu trúc dữ liệu nào tuân theo nguyên tắc vào sau ra trước (LIFO)?', options: ['Hàng đợi', 'Danh sách liên kết', 'Ngăn xếp', 'Cây nhị phân'], correctOption: 2, marks: 10, difficulty: 'Medium' },
  { id: 'q-cs-4', subjectId: 'sbj-cs', text: 'React Hook nào lưu lại giá trị tính toán tốn kém giữa các lần render?', options: ['useEffect', 'useCallback', 'useMemo', 'useRef'], correctOption: 2, marks: 10, difficulty: 'Medium' },
  { id: 'q-cs-5', subjectId: 'sbj-cs', text: 'Trong hệ quản trị cơ sở dữ liệu, chữ A trong ACID biểu thị thuộc tính nào?', options: ['Liên kết', 'Tính nguyên tử', 'Thuật toán', 'Tính sẵn sàng'], correctOption: 1, marks: 10, difficulty: 'Hard' },

  // Toán học
  { id: 'q-math-1', subjectId: 'sbj-math', text: 'Đạo hàm của x^2 theo x là gì?', options: ['x', '2x', 'x^3 / 3', '2'], correctOption: 1, marks: 5, difficulty: 'Easy' },
  { id: 'q-math-2', subjectId: 'sbj-math', text: 'Giải phương trình: log10(x) = 3.', options: ['30', '100', '300', '1000'], correctOption: 3, marks: 5, difficulty: 'Medium' },
  { id: 'q-math-3', subjectId: 'sbj-math', text: 'Tổng các góc trong của một đa giác n cạnh bằng bao nhiêu?', options: ['(n-2) * 180', 'n * 180', '(n-1) * 360', '(n+2) * 90'], correctOption: 0, marks: 10, difficulty: 'Medium' }
];

const initialExams = [
  {
    id: 'ex-cs-intro',
    title: 'Bài kiểm tra giữa kỳ Tin học 101',
    subjectId: 'sbj-cs',
    duration: 15, // phút
    passPercentage: 60,
    totalMarks: 30,
    description: 'Bao gồm các khái niệm Tin học cốt lõi, biểu diễn nhị phân, React Hook và cấu trúc dữ liệu. Hãy đọc kỹ từng câu hỏi.',
    questions: ['q-cs-1', 'q-cs-2', 'q-cs-3', 'q-cs-4', 'q-cs-5'], // liên kết đến danh sách câu hỏi
    createdAt: '2026-05-10T10:00:00.000Z',
    status: 'Published'
  },
  {
    id: 'ex-math-basics',
    title: 'Bài thi cuối kỳ Đại số và Tích phân',
    subjectId: 'sbj-math',
    duration: 20,
    passPercentage: 50,
    totalMarks: 20,
    description: 'Bao gồm hàm số, đạo hàm, phương trình logic và góc hình học. Học sinh được phép dùng máy tính.',
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
      { questionId: 'q-cs-1', selectedOption: 0 }, // Đúng, 5 điểm
      { questionId: 'q-cs-2', selectedOption: 1 }, // Đúng, 5 điểm
      { questionId: 'q-cs-3', selectedOption: 0 }, // Sai (chọn Hàng đợi thay vì Ngăn xếp), 0 điểm
      { questionId: 'q-cs-4', selectedOption: 2 }, // Đúng, 10 điểm
      { questionId: 'q-cs-5', selectedOption: 1 }  // Đúng, 10 điểm
    ],
    score: 30, // được tính sau
    totalCorrect: 4,
    totalIncorrect: 1,
    status: 'Pass', // 30/30 điểm là 100%, passPercentage là 60%
    tabFocusLosses: 0,
    startedAt: '2026-06-05T09:00:00.000Z',
    submittedAt: '2026-06-05T09:12:30.000Z'
  }
];

// Helper xử lý lưu trữ LocalStorage
const getOrSetLocal = (key, initialValue) => {
  const stored = localStorage.getItem(`examify_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Không thể đọc localStorage key ${key}`, e);
    }
  }
  localStorage.setItem(`examify_${key}`, JSON.stringify(initialValue));
  return initialValue;
};

// Bộ quản lý trạng thái dữ liệu
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

  // Dữ liệu hỗ trợ thống kê
  getAnalytics() {
    const totalStudents = this.users.filter(u => u.role === 'STUDENT').length;
    const totalTeachers = this.users.filter(u => u.role === 'TEACHER').length;
    const totalExams = this.exams.length;
    const totalSubmissions = this.attempts.length;
    const passCount = this.attempts.filter(a => a.status === 'Pass').length;
    const passRate = totalSubmissions > 0 ? (passCount / totalSubmissions) * 100 : 0;

    // Bảng xếp hạng
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
      // Câu hỏi khó nhất: các câu bị trả lời sai nhiều nhất
      hardestQuestions: [
        { id: 'q-cs-3', text: 'Cấu trúc dữ liệu nào tuân theo nguyên tắc vào sau ra trước (LIFO)?', incorrectAttempts: 1, totalAttempts: 1, percentageWrong: 100 }
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
