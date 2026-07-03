import API from './api';
import { getApiErrorMessage } from './serviceUtils';

const handle = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback), { cause: error });
  }
};

const getAttemptStatus = (attempt, passPercentage) => {
  if (attempt.status !== 'SUBMITTED') return 'In Progress';
  return Number(attempt.score) * 10 >= passPercentage ? 'Pass' : 'Fail';
};

const toAttemptView = (attempt) => {
  const passPercentage = attempt.exam?.passPercentage ?? 50;
  const score = Number(attempt.score);
  return {
    id: attempt.id,
    studentId: attempt.studentId,
    studentName: attempt.student?.fullName || 'Học sinh không xác định',
    studentEmail: attempt.student?.email || '',
    examId: String(attempt.examId),
    examTitle: attempt.exam?.title || 'Bài thi đã xóa',
    examTotalMarks: 10,
    passPercentage,
    score,
    scorePercentage: Math.round(score * 10),
    totalCorrect: attempt.correctCount,
    totalIncorrect: attempt.totalQuestions - attempt.correctCount,
    status: getAttemptStatus(attempt, passPercentage),
    tabFocusLosses: attempt.tabFocusLosses || 0,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt
  };
};

export const attemptService = {
  getAll: async () => {
    const result = await handle(() => API.get('/exam-attempts'), 'Không thể tải lượt làm bài');
    return { ...result, data: result.data.map(toAttemptView) };
  },

  getByStudent: async () => {
    const result = await handle(() => API.get('/exam-attempts/student/history'), 'Không thể tải lịch sử làm bài');
    return { ...result, data: result.data.map(toAttemptView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/exam-attempts/${id}/result`), 'Không thể tải kết quả làm bài');
    const attempt = result.data;
    const examQuestions = attempt.exam?.examQuestions || [];
    const passPercentage = attempt.exam?.passPercentage ?? 50;

    const questions = examQuestions.map((examQuestion) => {
      const question = examQuestion.question;
      if (!question) return null;
      return {
        id: question.id,
        text: question.content,
        options: [question.optionA, question.optionB, question.optionC, question.optionD],
        correctOption: question.correctAnswer.charCodeAt(0) - 65,
        marks: Number(examQuestion.point)
      };
    }).filter(Boolean);

    return {
      data: {
        attempt: {
          ...toAttemptView(attempt),
          answers: attempt.answers.map((answer) => ({
            questionId: String(answer.questionId),
            selectedOption: answer.selectedAnswer ? answer.selectedAnswer.charCodeAt(0) - 65 : null,
            isCorrect: answer.isCorrect
          }))
        },
        student: attempt.student ? { name: attempt.student.fullName, email: attempt.student.email } : null,
        exam: attempt.exam ? {
          title: attempt.exam.title,
          totalMarks: 10,
          passPercentage,
          questions
        } : null
      }
    };
  },

  startAttempt: async (examId, accessPassword) => {
    const result = await handle(
      () => API.post('/exam-attempts/start', { examId, accessPassword }),
      'Không thể bắt đầu lượt làm bài'
    );
    return result;
  },

  saveAnswers: async (attemptId, answersPayload) => {
    return handle(
      () => API.post(`/exam-attempts/${attemptId}/answers`, {
        answers: answersPayload.map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedOption !== null && answer.selectedOption !== -1
            ? String.fromCharCode(65 + Number(answer.selectedOption))
            : null
        }))
      }),
      'Không thể tự động lưu câu trả lời'
    );
  },

  submitAttempt: async (attemptId, tabFocusLosses) => {
    const result = await handle(
      () => API.post(`/exam-attempts/${attemptId}/submit`, { tabFocusLosses }),
      'Không thể nộp bài'
    );
    return result;
  }
};
