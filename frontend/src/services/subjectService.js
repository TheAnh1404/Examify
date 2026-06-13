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
    const result = await handle(() => API.get('/subjects'), 'Failed to fetch subjects');
    return { ...result, data: result.data.map(toSubjectView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/subjects/${id}`), 'Failed to fetch subject');
    return { ...result, data: toSubjectView(result.data) };
  },

  create: async (subjectData) => {
    const result = await handle(() => API.post('/subjects', subjectData), 'Failed to create subject');
    return { ...result, data: toSubjectView(result.data) };
  },

  update: async (id, subjectData) => {
    const result = await handle(() => API.put(`/subjects/${id}`, subjectData), 'Failed to update subject');
    return { ...result, data: toSubjectView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/subjects/${id}`), 'Failed to delete subject');
  }
};
