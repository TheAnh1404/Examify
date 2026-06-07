import { db } from '../data/mockData';

export const attemptService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Enrich with student name and exam title
    const enriched = db.attempts.map(att => {
      const student = db.users.find(u => u.id === att.studentId);
      const exam = db.exams.find(e => e.id === att.examId);
      return {
        ...att,
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : '',
        examTitle: exam ? exam.title : 'Deleted Exam',
        examTotalMarks: exam ? exam.totalMarks : 0
      };
    });

    return { data: enriched };
  },

  getByStudent: async (studentId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = db.attempts.filter(a => a.studentId === studentId);
    
    // Enrich with exam details
    const enriched = list.map(att => {
      const exam = db.exams.find(e => e.id === att.examId);
      return {
        ...att,
        examTitle: exam ? exam.title : 'Deleted Exam',
        examTotalMarks: exam ? exam.totalMarks : 0
      };
    });

    return { data: enriched };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const attempt = db.attempts.find(a => a.id === id);
    if (!attempt) return Promise.reject(new Error('Attempt record not found'));

    const student = db.users.find(u => u.id === attempt.studentId);
    const exam = db.exams.find(e => e.id === attempt.examId);
    
    // Resolve questions to check answers key
    let questionsKey = [];
    if (exam) {
      questionsKey = exam.questions.map(qId => {
        const q = db.questions.find(quest => quest.id === qId);
        return q ? { ...q } : null;
      }).filter(Boolean);
    }

    return {
      data: {
        attempt,
        student: student ? { name: student.name, email: student.email } : null,
        exam: exam ? { title: exam.title, totalMarks: exam.totalMarks, passPercentage: exam.passPercentage, questions: questionsKey } : null
      }
    };
  },

  submitAttempt: async (examId, answersPayload, tabFocusLosses, startedAt) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Resolve current logged-in user
    const loggedUserStr = localStorage.getItem('examify_user');
    const loggedUser = loggedUserStr ? JSON.parse(loggedUserStr) : null;
    if (!loggedUser) return Promise.reject(new Error('Authentication required.'));

    // Resolve exam
    const exam = db.exams.find(e => e.id === examId);
    if (!exam) return Promise.reject(new Error('Exam not found'));

    // Grading calculations
    let score = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    exam.questions.forEach(qId => {
      const question = db.questions.find(q => q.id === qId);
      if (question) {
        const studentAns = answersPayload.find(a => a.questionId === qId);
        const isCorrect = studentAns && Number(studentAns.selectedOption) === question.correctOption;
        
        if (isCorrect) {
          score += question.marks;
          totalCorrect += 1;
        } else {
          totalIncorrect += 1;
        }
      }
    });

    const passPct = exam.passPercentage;
    const finalPct = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
    const status = finalPct >= passPct ? 'Pass' : 'Fail';

    const newAttempt = {
      id: `att-${Date.now()}`,
      studentId: loggedUser.id,
      examId,
      answers: [...answersPayload],
      score,
      totalCorrect,
      totalIncorrect,
      status,
      tabFocusLosses: Number(tabFocusLosses) || 0,
      startedAt,
      submittedAt: new Date().toISOString()
    };

    db.attempts.push(newAttempt);
    db.save('attempts');

    return { data: newAttempt };
  }
};
