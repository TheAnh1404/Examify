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

const toClassroomView = (classroom) => ({
  ...classroom,
  id: String(classroom.id),
  subjectId: String(classroom.subjectId),
  teacherId: String(classroom.teacherId),
  studentCount: classroom._count?.students ?? 0,
  examCount: classroom._count?.exams ?? 0
});

export const classroomService = {
  getAll: async (params = {}) => {
    const result = await handle(() => API.get('/classrooms', { params }), 'Failed to fetch classrooms');
    return { ...result, data: result.data.map(toClassroomView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/classrooms/${id}`), 'Failed to fetch classroom details');
    return { ...result, data: toClassroomView(result.data) };
  },

  create: async (data) => {
    const result = await handle(() => API.post('/classrooms', data), 'Failed to create classroom');
    return { ...result, data: toClassroomView(result.data) };
  },

  update: async (id, data) => {
    const result = await handle(() => API.put(`/classrooms/${id}`, data), 'Failed to update classroom');
    return { ...result, data: toClassroomView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/classrooms/${id}`), 'Failed to delete classroom');
  },

  addStudent: async (classId, { studentEmail, studentId }) => {
    return handle(() => API.post(`/classrooms/${classId}/students`, { studentEmail, studentId }), 'Failed to add student');
  },

  searchStudents: async (query) => {
    return handle(() => API.get('/classrooms/search-students', { params: { query } }), 'Failed to search students');
  },

  removeStudent: async (classId, studentId) => {
    return handle(() => API.delete(`/classrooms/${classId}/students/${studentId}`), 'Failed to remove student');
  }
};
