import API from './api';
import { getApiErrorMessage, toSubjectView } from './serviceUtils';

const handle = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback), { cause: error });
  }
};

export const subjectService = {
  getAll: async () => {
    const result = await handle(() => API.get('/subjects'), 'Không thể tải danh sách môn học');
    return { ...result, data: result.data.map(toSubjectView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/subjects/${id}`), 'Không thể tải môn học');
    return { ...result, data: toSubjectView(result.data) };
  },

  create: async (subjectData) => {
    const result = await handle(() => API.post('/subjects', subjectData), 'Không thể tạo môn học');
    return { ...result, data: toSubjectView(result.data) };
  },

  update: async (id, subjectData) => {
    const result = await handle(() => API.put(`/subjects/${id}`, subjectData), 'Không thể cập nhật môn học');
    return { ...result, data: toSubjectView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/subjects/${id}`), 'Không thể xóa môn học');
  }
};
