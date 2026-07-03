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

const toQuestionView = (question) => ({
  ...question,
  id: String(question.id),
  subjectId: String(question.subjectId),
  text: question.content,
  options: [question.optionA, question.optionB, question.optionC, question.optionD],
  correctOption: question.correctAnswer ? question.correctAnswer.charCodeAt(0) - 65 : undefined,
  marks: Number(question.defaultPoint ?? question.marks ?? 1),
  difficulty: question.difficulty
    ? question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()
    : 'Easy',
    subjectName: question.subject?.name || 'Môn học không xác định',
  subjectCode: question.subject?.code || ''
});

const toQuestionPayload = (question) => ({
  subjectId: question.subjectId,
  content: question.text,
  optionA: question.options[0],
  optionB: question.options[1],
  optionC: question.options[2],
  optionD: question.options[3],
  correctAnswer: String.fromCharCode(65 + Number(question.correctOption)),
  difficulty: String(question.difficulty || 'EASY').toUpperCase(),
  defaultPoint: Number(question.marks ?? question.defaultPoint ?? 1)
});

export const questionService = {
  getAll: async () => {
    const result = await handle(() => API.get('/questions'), 'Không thể tải danh sách câu hỏi');
    return { ...result, data: result.data.map(toQuestionView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/questions/${id}`), 'Không thể tải câu hỏi');
    return { ...result, data: toQuestionView(result.data) };
  },

  getBySubject: async (subjectId) => {
    const result = await handle(() => API.get('/questions', { params: { subjectId } }), 'Không thể tải danh sách câu hỏi');
    return { ...result, data: result.data.map(toQuestionView) };
  },

  create: async (question) => {
    const result = await handle(() => API.post('/questions', toQuestionPayload(question)), 'Không thể tạo câu hỏi');
    return { ...result, data: toQuestionView(result.data) };
  },

  createBulk: async (questions) => {
    const result = await handle(() => API.post('/questions/bulk', {
      questions: questions.map(toQuestionPayload)
    }), 'Không thể tạo câu hỏi');
    return { ...result, data: result.data.map(toQuestionView) };
  },

  update: async (id, question) => {
    const result = await handle(() => API.put(`/questions/${id}`, toQuestionPayload(question)), 'Không thể cập nhật câu hỏi');
    return { ...result, data: toQuestionView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/questions/${id}`), 'Không thể xóa câu hỏi');
  }
};
