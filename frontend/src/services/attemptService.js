import API from './api';

export const attemptService = {
  getAll: async () => {
    const response = await API.get('/exam-attempts');
    // Format to match what the frontend pages expect
    const enriched = response.data.data.map(att => {
      const examTotalMarks = att.exam?.examQuestions?.reduce((sum, eq) => sum + Number(eq.point), 0) || 10;
      const passPct = 50;
      const finalPct = examTotalMarks > 0 ? (Number(att.score) / examTotalMarks) * 100 : 0;
      const status = finalPct >= passPct ? 'Pass' : 'Fail';

      return {
        id: att.id,
        studentId: att.studentId,
        studentName: att.student?.fullName || 'Unknown Student',
        studentEmail: att.student?.email || '',
        examId: att.examId,
        examTitle: att.exam?.title || 'Deleted Exam',
        examTotalMarks: examTotalMarks,
        score: Number(att.score),
        totalCorrect: att.correctCount,
        totalIncorrect: att.totalQuestions - att.correctCount,
        status: att.status === 'SUBMITTED' ? status : 'In Progress',
        tabFocusLosses: 0,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt
      };
    });
    return { data: enriched };
  },

  getByStudent: async (studentId) => {
    // Note: backend handles filtering by student on session, so we call /student/history
    const response = await API.get('/exam-attempts/student/history');
    const enriched = response.data.data.map(att => {
      return {
        id: att.id,
        studentId: att.studentId,
        examId: att.examId,
        examTitle: att.exam?.title || 'Deleted Exam',
        examTotalMarks: 10, // Default or mock fallback
        score: Number(att.score),
        totalCorrect: att.correctCount,
        totalIncorrect: att.totalQuestions - att.correctCount,
        status: Number(att.score) >= 5 ? 'Pass' : 'Fail',
        tabFocusLosses: 0,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt
      };
    });
    return { data: enriched };
  },

  getById: async (id) => {
    const response = await API.get(`/exam-attempts/${id}/result`);
    const att = response.data.data;
    
    // Calculate total marks and structure correctly for results page
    const examQuestions = att.exam?.examQuestions || [];
    const examTotalMarks = examQuestions.reduce((sum, eq) => sum + Number(eq.point), 0) || 10;
    const finalPct = examTotalMarks > 0 ? (Number(att.score) / examTotalMarks) * 100 : 0;
    const passPercentage = 50;
    const status = finalPct >= passPercentage ? 'Pass' : 'Fail';

    const formattedQuestions = examQuestions.map(eq => {
      const q = eq.question;
      if (!q) return null;
      return {
        id: q.id,
        text: q.content,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctOption: q.correctAnswer.charCodeAt(0) - 65, // Convert A->0, B->1, etc.
        marks: Number(eq.point)
      };
    }).filter(Boolean);

    // Backend answers structure: { questionId, selectedAnswer, isCorrect }
    const formattedAnswers = att.answers.map(ans => ({
      questionId: ans.questionId,
      selectedOption: ans.selectedAnswer ? (ans.selectedAnswer.charCodeAt(0) - 65) : null,
      isCorrect: ans.isCorrect
    }));

    return {
      data: {
        attempt: {
          id: att.id,
          studentId: att.studentId,
          examId: att.examId,
          answers: formattedAnswers,
          score: Number(att.score),
          totalCorrect: att.correctCount,
          totalIncorrect: att.totalQuestions - att.correctCount,
          status: att.status === 'SUBMITTED' ? status : 'In Progress',
          tabFocusLosses: 0,
          startedAt: att.startedAt,
          submittedAt: att.submittedAt
        },
        student: att.student ? { name: att.student.fullName, email: att.student.email } : null,
        exam: att.exam ? {
          title: att.exam.title,
          totalMarks: examTotalMarks,
          passPercentage,
          questions: formattedQuestions
        } : null
      }
    };
  },

  submitAttempt: async (examId, answersPayload, tabFocusLosses, startedAt) => {
    // 1. Start the attempt on backend
    const startRes = await API.post('/exam-attempts/start', { examId });
    const attempt = startRes.data.data;
    
    // 2. Save answers
    await API.post(`/exam-attempts/${attempt.id}/answers`, {
      answers: answersPayload.map(ans => ({
        questionId: ans.questionId,
        selectedAnswer: ans.selectedOption !== null && ans.selectedOption !== -1
          ? String.fromCharCode(65 + Number(ans.selectedOption))
          : null
      }))
    });

    // 3. Submit attempt
    const submitRes = await API.post(`/exam-attempts/${attempt.id}/submit`);
    const finalAttempt = submitRes.data.data;

    return {
      data: {
        id: finalAttempt.id,
        ...finalAttempt
      }
    };
  }
};
