import { db } from '../data/mockData';

export const examService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Enrich with subject details
    const enriched = db.exams.map(e => {
      const subject = db.subjects.find(s => s.id === e.subjectId);
      return {
        ...e,
        subjectName: subject ? subject.name : 'Unknown Subject',
        subjectCode: subject ? subject.code : '',
        questionCount: e.questions.length
      };
    });

    return { data: enriched };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const exam = db.exams.find(e => e.id === id);
    if (!exam) return Promise.reject(new Error('Exam not found'));

    const subject = db.subjects.find(s => s.id === exam.subjectId);
    
    // Fully resolve the question objects
    const resolvedQuestions = exam.questions.map(qId => {
      const q = db.questions.find(quest => quest.id === qId);
      return q ? { ...q } : null;
    }).filter(Boolean);

    // Anti-cheat answer scrubbing for students
    const role = localStorage.getItem('examify_role');
    const questionsPayload = role === 'STUDENT'
      ? resolvedQuestions.map(q => {
          const { correctOption, ...safeQ } = q;
          return safeQ;
        })
      : resolvedQuestions;

    return {
      data: {
        ...exam,
        subjectName: subject ? subject.name : 'Unknown Subject',
        subjectCode: subject ? subject.code : '',
        resolvedQuestions: questionsPayload
      }
    };
  },

  create: async (examData) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newExam = {
      id: `ex-${Date.now()}`,
      title: examData.title,
      subjectId: examData.subjectId,
      duration: Number(examData.duration) || 15,
      passPercentage: Number(examData.passPercentage) || 50,
      totalMarks: Number(examData.totalMarks) || 0,
      description: examData.description || '',
      questions: examData.questions || [], // Array of question IDs
      createdAt: new Date().toISOString(),
      status: examData.status || 'Draft'
    };

    db.exams.push(newExam);
    db.save('exams');
    return { data: newExam };
  },

  update: async (id, examData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = db.exams.findIndex(e => e.id === id);
    if (idx === -1) return Promise.reject(new Error('Exam not found'));

    db.exams[idx] = {
      ...db.exams[idx],
      title: examData.title || db.exams[idx].title,
      subjectId: examData.subjectId || db.exams[idx].subjectId,
      duration: examData.duration !== undefined ? Number(examData.duration) : db.exams[idx].duration,
      passPercentage: examData.passPercentage !== undefined ? Number(examData.passPercentage) : db.exams[idx].passPercentage,
      totalMarks: examData.totalMarks !== undefined ? Number(examData.totalMarks) : db.exams[idx].totalMarks,
      description: examData.description !== undefined ? examData.description : db.exams[idx].description,
      questions: examData.questions ? [...examData.questions] : db.exams[idx].questions,
      status: examData.status || db.exams[idx].status
    };

    db.save('exams');
    return { data: db.exams[idx] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = db.exams.findIndex(e => e.id === id);
    if (idx === -1) return Promise.reject(new Error('Exam not found'));

    db.exams.splice(idx, 1);
    db.save('exams');

    // Clean up attempts
    db.attempts = db.attempts.filter(a => a.examId !== id);
    db.save('attempts');

    return { data: { message: 'Exam deleted' } };
  },

  addQuestionToExam: async (examId, questionId) => {
    const exam = db.exams.find(e => e.id === examId);
    if (!exam) return Promise.reject(new Error('Exam not found'));
    
    if (!exam.questions.includes(questionId)) {
      exam.questions.push(questionId);
      // Update marks
      const question = db.questions.find(q => q.id === questionId);
      if (question) {
        exam.totalMarks = (exam.totalMarks || 0) + question.marks;
      }
      db.save('exams');
    }
    return { data: exam };
  },

  removeQuestionFromExam: async (examId, questionId) => {
    const exam = db.exams.find(e => e.id === examId);
    if (!exam) return Promise.reject(new Error('Exam not found'));
    
    const idx = exam.questions.indexOf(questionId);
    if (idx !== -1) {
      exam.questions.splice(idx, 1);
      // Deduct marks
      const question = db.questions.find(q => q.id === questionId);
      if (question) {
        exam.totalMarks = Math.max(0, (exam.totalMarks || 0) - question.marks);
      }
      db.save('exams');
    }
    return { data: exam };
  }
};
