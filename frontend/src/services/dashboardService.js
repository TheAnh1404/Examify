import API from './api';

export const dashboardService = {
  getAdminStats: async () => {
    const response = await API.get('/dashboard/admin');
    return response.data;
  },

  getTeacherStats: async () => {
    const response = await API.get('/dashboard/teacher');
    return response.data;
  },

  getStudentStats: async () => {
    const response = await API.get('/dashboard/student');
    return response.data;
  },

  getExamStatistics: async (examId) => {
    const response = await API.get(`/dashboard/exams/${examId}/statistics`);
    return response.data;
  }
};
