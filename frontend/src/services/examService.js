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

const toResolvedQuestion = (examQuestion) => {
  const question = examQuestion.question;
  return {
    id: String(question.id),
    subjectId: String(question.subjectId || ''),
    text: question.content,
    options: [question.optionA, question.optionB, question.optionC, question.optionD],
    correctOption: question.correctAnswer ? question.correctAnswer.charCodeAt(0) - 65 : undefined,
    marks: Number(examQuestion.point),
    difficulty: question.difficulty
      ? question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()
      : 'Easy'
  };
};

const toExamView = (exam) => {
  const resolvedQuestions = (exam.examQuestions || [])
    .filter(examQuestion => examQuestion.question)
    .map(toResolvedQuestion);
  const questionCount = exam.totalQuestions ?? resolvedQuestions.length;
  const totalMarks = (exam.examQuestions || []).reduce((sum, examQuestion) => sum + Number(examQuestion.point), 0);
  return {
    ...exam,
    id: String(exam.id),
    subjectId: String(exam.subjectId),
    subjectName: exam.subject?.name || 'Môn học không xác định',
    subjectCode: exam.subject?.code || '',
    duration: exam.durationMinutes,
    passPercentage: exam.passPercentage ?? 50,
    questionCount,
    questions: resolvedQuestions.map((question) => question.id),
    resolvedQuestions,
    totalMarks: totalMarks || questionCount
  };
};

const toExamPayload = (exam) => ({
  subjectId: exam.subjectId,
  title: exam.title,
  description: exam.description,
  durationMinutes: Number(exam.duration ?? exam.durationMinutes),
  passPercentage: Number(exam.passPercentage ?? 50),
  visibility: exam.visibility || 'PRIVATE',
  accessPassword: exam.accessPassword || undefined,
  startTime: exam.startTime || undefined,
  endTime: exam.endTime || undefined
});

export const examService = {
  getAll: async () => {
    const result = await handle(() => API.get('/exams'), 'Không thể tải danh sách bài thi');
    return { ...result, data: result.data.map(toExamView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/exams/${id}`), 'Không thể tải bài thi');
    return { ...result, data: toExamView(result.data) };
  },

  create: async (exam) => {
    const result = await handle(() => API.post('/exams', toExamPayload(exam)), 'Không thể tạo bài thi');
    const examId = result.data.id;

    for (const [index, questionId] of (exam.questions || []).entries()) {
      await handle(() => API.post(`/exams/${examId}/questions`, {
        questionId,
        questionOrder: index + 1,
        point: 1
      }), 'Không thể thêm câu hỏi vào bài thi');
    }

    if (String(exam.status).toUpperCase() === 'PUBLISHED') {
      await handle(() => API.patch(`/exams/${examId}/publish`), 'Không thể công bố bài thi');
    }

    return examService.getById(examId);
  },

  createBulk: async (exam) => {
    const result = await handle(() => API.post('/exams/bulk', {
      ...toExamPayload(exam),
      publish: Boolean(exam.publish),
      existingQuestions: exam.existingQuestions || [],
      newQuestions: (exam.newQuestions || []).map((question) => ({
        subjectId: exam.subjectId,
        content: question.text,
        optionA: question.options[0],
        optionB: question.options[1],
        optionC: question.options[2],
        optionD: question.options[3],
        correctAnswer: String.fromCharCode(65 + Number(question.correctOption)),
        difficulty: String(question.difficulty || 'EASY').toUpperCase(),
        defaultPoint: Number(question.marks ?? 1),
        point: Number(question.marks ?? 1)
      }))
    }), 'Không thể tạo bài thi');
    return examService.getById(result.data.id);
  },

  update: async (id, exam) => {
    const result = await handle(() => API.put(`/exams/${id}`, toExamPayload(exam)), 'Không thể cập nhật bài thi');
    return { ...result, data: toExamView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/exams/${id}`), 'Không thể xóa bài thi');
  },

  addQuestionToExam: async (examId, questionId, point = 1) => {
    return handle(() => API.post(`/exams/${examId}/questions`, { questionId, point }), 'Không thể thêm câu hỏi');
  },

  removeQuestionFromExam: async (examId, questionId) => {
    return handle(() => API.delete(`/exams/${examId}/questions/${questionId}`), 'Không thể xóa câu hỏi');
  }
};
